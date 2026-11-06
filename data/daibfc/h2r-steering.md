# daibfc/h2r-steering

## Resumen

`daibfc/h2r-steering` no es un modelo de lenguaje, sino un conjunto de artefactos de calibración para el control de un robot humanoide Unitree G1. En concreto, contiene una base de "steering" (una matriz `A` de dimensiones 2×64) que permite modificar en tiempo de ejecución los tokens de 64 dimensiones que produce el codificador `g1` de SONIC, un modelo fundacional de seguimiento de movimiento congelado. El objetivo es que el robot siga con mayor fidelidad una trayectoria de aproximación planificada durante una tarea de loco-manipulación de cajas, usando únicamente odometría.

El desarrollo corre a cargo del usuario `daibfc` y se distribuye bajo la NVIDIA Open Model License. La técnica es "training-free": no se reentrena el modelo base, sino que se añade un pequeño desplazamiento a los tokens post-cuantizador de SONIC, calculado a partir del error entre la posición planificada de la pelvis y la posición odométrica real. La base incluida está calibrada específicamente para la política R15 (`daibfc/h2r-weights`), paso 15000.

La relevancia radica en su enfoque metodológico: demuestra que las intervenciones aleatorizadas (empujones de norma fija en el espacio de tokens) son necesarias para estimar la dirección causal del efecto, y que un ajuste con buena calidad offline (R²) no garantiza un buen comportamiento en bucle cerrado. El repositorio es de tamaño 0.0 GB y no contiene pesos de red neuronal, solo ficheros `.npz` de calibración y una regla de control de referencia en NumPy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artefacto de calibracion para un modelo fundacional de control, SONIC) |
| Parametros totales | No disponible (el repositorio no contiene pesos de red) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (control a 50 Hz por paso de control) |
| Tipos de cuantizacion | No aplica (operaciones sobre tokens post-FSQ de 64 dimensiones) |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | `.npz` (NumPy): bases `A [2, 64]`, datos de calibracion `U [408, 64]`, `D [408, 2]`, `clip [408]`, preset YAML y script de referencia |

## Arquitectura y entrenamiento

El artefacto no entrena una red neuronal. La arquitectura subyacente es SONIC, un modelo fundacional de seguimiento de movimiento congelado que produce tokens de 64 dimensiones tras un cuantizador FSQ en su codificador `g1`. Sobre esos tokens se aplica una corrección aditiva `v @ A`, donde `v` es un vector de velocidad de corrección de 2 dimensiones (adelante y lateral) acotado a ±15 y `A` es la base de steering de 2×64.

La calibración se realiza offline una sola vez por política, sobre el paso 15000 de R15. Se usan 68 clips limpios de OMOMO cuyo tramo de aproximación (desde el inicio hasta el levantamiento planificado) dura al menos 1,5 s, replicados en 2 entornos (136 episodios por rollout con semilla fija). Primero se ejecuta una línea base sin empujón para registrar el error de seguimiento de la pelvis al final de la ventana. Después se realizan 3 rollouts de 136 episodios, en los que se inyecta una dirección aleatoria de 64 dimensiones con norma exactamente 0,25 en cada paso durante la ventana, registrando el desplazamiento de la pelvis en centímetros. Con los 408 pares resultantes se ajusta una regresión ridge (λ = 1,0) de `U` sobre `D` para obtener `M` (2×64), y `A = pinv(M)^T` como el empujón de token de norma mínima por centímetro de movimiento.

La innovación técnica clave es el uso de intervenciones aleatorizadas: un empujón es independiente del estado del robot, por lo que `U → D` captura el efecto causal de un cambio de token. Si se ajusta la misma ridge sobre la variación natural entre ejecuciones, el ajuste aprende la reacción de SONIC a estar fuera de plan y la inversa apunta en dirección contraria, con un 0 % de éxito en bucle cerrado.

## Capacidades

- Steering en bucle cerrado y sin entrenamiento de un modelo fundacional de seguimiento de movimiento congelado.
- Corrección de la trayectoria de la pelvis en el plano (adelante y lateral) mediante odometría, sin acceso a estado privilegiado.
- Regla de ejecución desplegable a 50 Hz: error `e` en el marco de rumbo del plan, velocidad `v = clip(160 * e, -15, +15)`, guarda de seguridad si `||e|| > 0,5 m` o si se alcanza el levantamiento planificado.
- Datos de calibración reproducibles: 408 experimentos de empujón con respuestas en centímetros y recorte.
- Verificación de reproducibilidad de la base: el reajuste de la ridge reproduce `A` con tolerancia `atol=1e-6`.
- Bases adicionales para la variante híbrida `degen_v2`, incluida una base canónica con hash SHA-256 publicado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un artefacto de robótica.

## Casos de uso

- **Loco-manipulación de cajas con Unitree G1**: la base se usa para que el robot siga con más fidelidad la aproximación planificada antes de levantar una caja, mejorando la tasa de recogida del 29,4 % al 54,1 % en el benchmark feasible43 con odometría desplegable.
- **Despliegue de políticas congeladas sin reentrenamiento**: equipos que ya tienen una política R15 entrenada pueden añadir la corrección en tiempo de ejecución sin tocar los pesos, reduciendo el coste de iteración a la calibración offline de una sola vez.
- **Investigación en control por intervención causal**: el conjunto de 408 empujones y sus respuestas sirve para estudiar la relación causal entre perturbaciones en el espacio latente y el movimiento resultante en robots humanoides.
- **Reproducción de experimentos de steering**: el script `steer_reference.py` y el preset YAML permiten replicar la regla de control en un framework propio y validar la base contra los datos publicados.
- **Calibración de nuevas políticas**: la metodología documentada (clips OMOMO, ventana de aproximación, norma de empujón 0,25, ridge con λ = 1,0) se puede reutilizar para recalibrar la base cuando cambie la política, ya que la base es específica de R15.
- **Análisis de robustez y caídas**: los datos permiten comparar tasas de caída entre bases (20 caídas con la base sin PCA frente a 9 con la base anterior), útil para estudiar el compromiso entre agresividad de corrección y estabilidad.

## Benchmarks y rendimiento

Resultados en HOI2ROI feasible43: 43 casos × 8 episodios = 344 episodios emparejados, política R15, odometría desplegable, caja a tamaño completo.

| Steering | Pickup | Success | Falls |
|---|---|---|---|
| Ninguno | 29,4 % | 20,1 % | 9 |
| Base anterior (PCA-16, no publicada) | 43,6 % | 35,8 % | 9 |
| **Esta base (sin PCA)** | **54,1 %** | 36,3 % | 20 |
| PCA-8 | 26,7 % | 20,1 % | 33 |
| PCA-16 | 41,0 % | 27,0 % | 12 |
| PCA-32 | 37,2 % | 26,2 % | 8 |
| Sham (direcciones aleatorias, mismo tamaño) | 30,2 % | 18,3 % | 9 |
| Observacional (mismo ajuste sobre variación natural) | 0,0 % | 0,0 % | 59 |

Hallazgos publicados: (1) las intervenciones son necesarias, ya que una base ajustada sobre variación natural dirige en sentido contrario; (2) importan las direcciones calibradas, no el tamaño del empujón (sham); (3) la calidad del ajuste offline (R²) no ordena las bases, pues las bases PCA ajustan mejor offline pero guían peor en bucle cerrado; (4) la base sin PCA tiene el menor error lateral al final de la aproximación (5,7 cm frente a 7,4 cm de la base anterior). Queda abierto el mayor número de caídas (20 frente a 9).

## Requisitos de hardware

- No requiere GPU para el uso del artefacto: la base y la regla de ejecución son operaciones NumPy de 2×64 sobre los tokens del codificador.
- El coste computacional en inferencia es despreciable frente al del modelo fundacional subyacente (SONIC) y al de la política R15.
- El modelo base SONIC y la política R15 sí requieren hardware de inferencia robótica; los requisitos concretos no están disponibles en la información proporcionada.
- Despliegue: integración en el bucle de control a 50 Hz del framework del robot, con `steer_reference.py` como referencia independiente en NumPy.
- Latencia y throughput del artefacto de steering: no disponibles de forma explícita; la regla opera una vez por paso de control (50 Hz) antes del forward de la política.

## Comparativa con modelos similares

| Artefacto | Tipo | Dimension | Efecto en bucle cerrado (pickup) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta base (sin PCA) | Base de steering calibrada por intervención | 2×64 | 54,1 % | NVIDIA Open Model License | Pública |
| Base anterior PCA-16 | Base de steering en coordenadas PCA | 2×16 | 43,6 % | No disponible | No publicada |
| Bases PCA-8/16/32 | Bases en coordenadas PCA, mismos empujones | 2×8, 2×16, 2×32 | 26,7 / 41,0 / 37,2 % | No disponible | Parcial (mismos empujones) |
| Base SONIC iso64 | Base para híbrido degen_v2 | 2×64 | 58,7 % (con degen_v2 19k) | NVIDIA Open Model License | Pública (hash publicado) |

No se dispone de comparación con artefactos de steering de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La base es específica de la política R15: el residual cambia cómo los tokens mueven al robot, por lo que hay que recalibrar para otra política.
- Mayor número de caídas que la base anterior (20 frente a 9), lo que supone un compromiso entre tasa de recogida y estabilidad.
- El ajuste offline (R²) no predice el rendimiento en bucle cerrado; no debe usarse como criterio de selección de bases.
- Sin intervenciones aleatorizadas, el ajuste observacional falla por completo (0 % de pickup, 59 caídas).
- La guarda de seguridad solo actúa si `||e|| > 0,5 m` o al alcanzar el levantamiento planificado; fuera de esa ventana no hay corrección.
- El código del repositorio `BFCmath/H2ROI` es privado (acceso de colaborador), lo que limita la reproducibilidad completa del framework.
- La licencia NVIDIA Open Model License impone condiciones de uso comercial que deben revisarse antes de un despliegue en producción.
- No se han publicado datos de sesgos ni de comportamiento multilingüe porque no es un modelo lingüístico.
- No se usó ningún clip del benchmark HOI2ROI para la calibración, pero el benchmark es específico del dominio de loco-manipulación de cajas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daibfc/h2r-steering
- Pesos de la política R15: https://huggingface.co/daibfc/h2r-weights
- Benchmark feasible43: https://huggingface.co/datasets/daibfc/h2r-benchmark-feasible43
- Código (privado, acceso de colaborador): https://github.com/BFCmath/H2ROI
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
