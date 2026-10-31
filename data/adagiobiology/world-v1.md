# AdagioBiology/world-v1

## Resumen

MolJEPA-World v1 es un modelo de dinámica de conformaciones proteicas desarrollado por AdagioBiology. Se trata de un modelo de mundo (world model) basado en una arquitectura predictiva de joint-embedding (JEPA) equivariante bajo el grupo E(3), diseñado para predecir la evolución conformacional de proteínas en el espacio de representaciones latentes en lugar de en coordenadas 3D directas. El problema que aborda es la predicción de dinámica molecular a largo plazo a un coste computacional muy inferior al de las simulaciones de dinámica molecular clásicas.

Técnicamente, el modelo codifica una estructura de retro-carbono alfa (CA) de grano grueso en un latente de 32 dimensiones mediante un encoder EGNN de 3 capas, y avanza ese latente en el tiempo con un operador de Koopman aprendido de 12 modos complejos más 3 expertos de rango 2 condicionados por estado. Cada paso del operador equivale a 275 picosegundos de simulación, con horizontes publicados de hasta 33 nanosegundos. Fue entrenado sobre 236 dominios del dataset mdCATH (944.000 frames de CA) y pesa apenas 2,32 millones de parámetros (9,3 MB en safetensors).

Es relevante como prueba de concepto de que los world models latentes pueden capturar escalas temporales de dinámica proteica inaccesibles para la MD directa a bajo coste. Cabe destacar que el propio autor publica una versión más reciente, `AdagioBiology/world-v2`, que sustituye el operador de Koopman por cabezas de desplazamiento multi-horizonte y supera a esta v1 entre un 11 y un 21 % en el protocolo segment-aware corregido, por lo que quien evalúe hoy debería partir de v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA equivariante E(3): encoder EGNN (3 capas, grafo kNN con k=16) + operador de Koopman (12 modos complejos + 3 expertos rank-2 gated por estado) + cabezas decodificadoras (distograma, 3D, descriptores espaciales, fuerzas, electrostática) |
| Parametros totales | 2.315.579 (~2,32 M, 9,3 MB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa frames de CA de tamaño variable N con máscara de padding) |
| Tipos de cuantizacion | No disponible (pesos en FP estándar de PyTorch; sin variantes cuantizadas publicadas) |
| Idiomas soportados | Inglés (documentación); el modelo no procesa texto |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con código de inferencia autónomo en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue el paradigma JEPA: en lugar de predecir coordenadas futuras, predice representaciones latentes futuras. El encoder es una EGNN (Equivariant Graph Neural Network) de 3 capas con grafo de vecinos más cercanos k=16, que recibe como entrada las coordenadas CA centradas y normalizadas (divididas por 8,5), los tipos de átomo, una máscara de padding, embeddings por residuo de ESM-2 (`facebook/esm2_t12_35M_UR50D`, 480 dimensiones por residuo) y la temperatura de simulación en kelvin (rango 320–450 K de mdCATH). La salida es un latente agrupado z ∈ R^32, que el operador de Koopman avanza temporalmente: cada paso representa 275 ps. Las cabeceras de decodificación reconstruyen distogramas, coordenadas 3D, descriptores espaciales, fuerzas y electrostática a partir del latente futuro.

El entrenamiento del operador combina cuatro términos: una pérdida de consistencia de semigrupo, un término anti-colapso VICReg, un término espectral/de escalas temporales, y un encoder objetivo EMA (asimetría JEPA). Los pesos publicados corresponden al encoder student final (v32, paso 29.999); el teacher EMA no se distribuye. El entrenamiento completo constó de 30.000 pasos en 506 minutos sobre una única RTX 5060 Ti. Los datos de entrenamiento provienen de 236 dominios de mdCATH (944.000 frames de CA), conservando 4.000 de los 11.030 frames por dominio en el loader. Adicionalmente, se publican dos correcciones del operador PRST (matrices 32×32 aplicadas tras cada 20 pasos): `round1`, óptima a 5,5 ns, y `round2` (cadena completa de 3 rondas), óptima a 11/22/33 ns.

## Capacidades

- Predicción de dinámica conformacional de proteínas en espacio latente, con pasos de 275 ps y horizontes evaluados de 5,5/11/22/33 ns (20/40/80/120 pasos).
- Reconstrucción de coordenadas 3D futuras a partir del latente mediante cabeza de distograma seguida de decodificación a 3D.
- Predicción de descriptores espaciales, fuerzas y propiedades electrostáticas desde el latente.
- Invariancia E(3): las rotaciones y traslaciones globales de la estructura de entrada no afectan al resultado.
- Condicionamiento por temperatura de simulación (320–450 K), lo que permite explorar regímenes térmicos distintos.
- Aprovechamiento de información de secuencia vía embeddings de ESM-2 por residuo (fuertemente recomendado por el autor; sin ellos el encoder carece de identidad por residuo).
- Correcciones PRST opcionales que mejoran el error de rollout a horizontes largos.
- Inferencia en CPU con latencias bajas (el modelo pesa 9,3 MB).

No es un predictor de estructura ni un campo de fuerzas: el propio autor lo advierte explícitamente en la model card.

## Casos de uso

- Prototipado de dinámica proteica a bajo coste: permite generar rollouts conformacionales de hasta 33 ns en segundos sobre CPU, útil para explorar hipótesis dinámicas antes de lanzar simulaciones MD completas, que consumen horas o días de GPU.
- Selección de condiciones para simulaciones MD: al condicionar por temperatura (320–450 K), puede usarse para preseleccionar qué temperaturas y dominios merecen un estudio MD detallado.
- Investigación en world models latentes: sirve como baseline reproducible para comparar operadores de Koopman frente a enfoques de desplazamiento multi-horizonte (como la propia v2 del autor) en dinámica molecular.
- Análisis de escalas temporales aprendidas: los 12 tiempos de relajación de Koopman aprendidos ofrecen información sobre los modos lentos del sistema, útil para estudios de dinámica reducida.
- Educación y demostración: el repositorio incluye un ejemplo ejecutable (`example_inference.py` y `examples/demo_1a0hA01.npz` con 41 frames de un dominio mdCATH), ideal para docencia en ML aplicado a biología estructural.
- Generación de descriptores físicos rápidos: las cabezas de fuerzas y electrostática permiten estimaciones aproximadas de propiedades físicas a lo largo del rollout sin evaluar un campo de fuerzas.

## Benchmarks y rendimiento

No se han publicado cifras numéricas agregadas de benchmarks en la información disponible (la model card remite a las figuras en `visuals/` para las curvas de error). Los datos cualitativos publicados son:

| Evaluacion | Detalle |
|---|---|
| Protocolo segment-aware corregido | 24 dominios held-out, 3.495 ventanas; la v2 del autor supera a la v1 entre un 11 y un 21 % |
| Protocolo legacy uniform-window | Infla el rendimiento de v1 entre un 5 y un 10 % a horizontes cortos (el 69,7 % de las ventanas de 120 frames cruza fronteras de réplica/temperatura) |
| v1 + PRST vs. v1 | round1: mejor a 5,5 ns; round2: mejor a 11/22/33 ns |
| v2 vs. persistencia | 100 % de victorias sobre persistencia en 23 dominios held-out (dato de v2, no de v1) |

La lista de dominios nunca usados en entrenamiento está disponible en `eval/heldout_domains.txt`.

## Requisitos de hardware

- VRAM para inferencia: mínima; el modelo completo ocupa 9,3 MB, por lo que cualquier GPU moderna sobra e incluso es viable la inferencia solo en CPU.
- GPU recomendadas: no se requiere GPU para inferencia; para reproducir el entrenamiento, el autor usó una única RTX 5060 Ti (30.000 pasos en 506 minutos).
- Consumer GPU: totalmente suficiente; cualquier GPU con PyTorch (incluso portátiles) ejecuta el modelo sin problema.
- Dependencias de inferencia: `torch`, `numpy`, `safetensors` y `huggingface_hub`; el código de inferencia es autónomo y no requiere dependencias de entrenamiento. Además necesita ESM-2 (`facebook/esm2_t12_35M_UR50D`) para los embeddings por residuo.
- Despliegue: carga directa mediante `load_pretrained()` desde el propio repositorio de HuggingFace. No hay integración publicada con vLLM, llama.cpp, Ollama o TGI (no aplica, al no ser un modelo de lenguaje).
- Latencia: se publican mediciones de latencia en CPU en `visuals/runtime.png`, medidas mientras un trabajo de entrenamiento compartía la máquina, por lo que constituyen cotas superiores; no hay cifras numéricas concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Datos de entrenamiento | Licencia |
|---|---|---|---|---|
| AdagioBiology/world-v1 (este) | 2,32 M | JEPA E(3)-equivariante + operador de Koopman, latente de 32 dim | 236 dominios mdCATH, 944.000 frames CA | Apache-2.0 |
| AdagioBiology/world-v2 | No disponible (mismo encoder, cabezas de desplazamiento multi-horizonte) | JEPA sin operador de Koopman; 11–21 % mejor que v1 en protocolo segment-aware | Igual base que v1, pares segment-aware | No disponible en la información proporcionada |
| Modelos de MD acelerada por ML genéricos (p. ej. campos de fuerzas aprendidos tipo CGSchNet-style) | No disponible | Predicción en coordenadas, no en espacio latente | No disponible | Varía |

No se conocen alternativas públicas directamente comparables con la misma combinación exacta de JEPA latente + Koopman + mdCATH; la comparación más relevante es con la sucesora v2 del mismo autor, que el autor recomienda como punto de partida.

## Limitaciones y advertencias

- No es un campo de fuerzas ni un predictor de estructura: solo modela dinámica conformacional en espacio latente; no debe usarse para plegamiento o diseño de proteínas.
- Modelo de investigación v1: el propio autor publica v2 con mejoras del 11–21 % y recomienda usarla; v1 queda como referencia histórica.
- Dependencia fuerte de ESM-2 y la temperatura: sin embeddings de ESM-2 por residuo y sin `sim_temp`, el encoder pierde identidad por residuo y condicionamiento térmico; ambos se marcan como fuertemente recomendados.
- Protocolo de evaluación: el protocolo legacy de ventanas uniformes sobreestima el rendimiento de v1 entre un 5 y un 10 % a horizontes cortos (el 69,7 % de las ventanas de 120 frames cruzan fronteras de réplica/temperatura); usar el protocolo segment-aware corregido.
- Dominio de entrenamiento limitado: entrenado solo sobre 236 dominios de mdCATH (grano grueso CA, 320–450 K); el comportamiento fuera de esta distribución no está garantizado. Las visualizaciones 3D muestran una transición difícil a 450 K donde el decodificador opera fuera de su región de confort.
- Elección de corrección PRST: usar `round2` por defecto, `round1` solo a 5,5 ns; aplicar la corrección con la semántica exacta de `advance()` para reproducir la evaluación held-out.
- Licencia: Apache-2.0, sin restricciones para uso comercial.
- Sesgos y riesgo de alucinación: no aplicables en el sentido de LLMs; el riesgo relevante es el error de rollout a horizontes largos, documentado en las curvas de `visuals/rollout_error.png`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AdagioBiology/world-v1
- Versión más reciente (recomendada por el autor): https://huggingface.co/AdagioBiology/world-v2
- Embeddings ESM-2 usados como entrada: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Dataset de entrenamiento (referenciado en la model card): mdCATH (no se proporciona enlace directo en la información disponible)
- No se han encontrado enlaces a papers, blogs o demos adicionales en la información proporcionada.
