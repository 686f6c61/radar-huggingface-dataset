# maxpagels/axiom-effect

## Resumen

Axiom Effect es un modelo de estimación de efectos causales para datos tabulares desarrollado por Max Pagels. Dado un conjunto de datos tabular, un grafo causal (DAG) sobre sus columnas y un par tratamiento-resultado, el modelo estima el efecto de intervenir el tratamiento sobre el resultado, es decir, E[Y | do(T = b)] - E[Y | do(T = a)], junto con intervalos de confianza al 90% y 50% y la curva dosis-respuesta completa. No es un modelo de lenguaje: es un estimador neuronal especializado que se distribuye como pesos safetensors de 6,5 millones de parámetros en fp32 (26 MB).

La innovación principal reside en que el grafo causal determina el conjunto de ajuste: el modelo lee únicamente el tratamiento, el resultado y el conjunto de ajuste óptimo derivado del grafo, de modo que mediadores, colisionadores y otras variables que sesgarían la estimación nunca entran en el cálculo. El grafo puede provenir de conocimiento de dominio o del modelo hermano Axiom (axiom-discovery), orientado al descubrimiento causal.

La versión 0.0.1 es explícitamente experimental: la API y los pesos cambiarán en releases 0.0.x. El modelo se ha entrenado y validado exclusivamente sobre datos simulados con efecto verdadero conocido, por lo que su comportamiento en datos reales aún no está caracterizado. Es relevante ahora como aproximación práctica a la inferencia causal con ajuste automático, aunque con caveats importantes sobre identificación y cobertura de intervalos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal para estimación de efectos causales sobre datos tabulares (detalles internos no disponibles) |
| Parámetros totales | 6.532.232 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; conjunto de ajuste de hasta 18 variables y 128-1024 filas) |
| Tipos de cuantización | no disponible; pesos publicados en fp32 |
| Idiomas soportados | no aplica (modelo numérico/tabular) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 26 MB) |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna exacta (capas, mecanismos de atención o diseño de la red). Se sabe que es un modelo neuronal implementado en PyTorch, con 6.532.232 parámetros, que lee únicamente el tratamiento, el resultado y el conjunto de ajuste óptimo derivado del grafo causal proporcionado. Las columnas se estandarizan internamente y los resultados se devuelven en las unidades originales de los datos.

El entrenamiento se realizó sobre modelos causales simulados en los que el efecto verdadero es conocido, con tablas de entre 128 y 1024 filas y conjuntos de ajuste de hasta 18 variables. Los intervalos de confianza son los propios cuantiles del modelo, calibrados conformalmente sobre datos simulados retenidos de su distribución de entrenamiento. No se especifica el número de tokens ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Estimación del efecto causal de una intervención sobre un tratamiento continuo: contraste E[Y | do(T = b)] - E[Y | do(T = a)].
- Cálculo de intervalos de confianza al 90% y al 50% para el contraste principal.
- Generación de la curva dosis-respuesta completa con intervalos puntuales por valor de tratamiento.
- Ajuste automático basado en el grafo causal: identifica y usa el conjunto de ajuste óptimo, excluyendo mediadores y colisionadores.
- Aceptación de grafos en múltiples formatos: lista de pares (causa, efecto), matriz de adyacencia (d, d), DataFrame de pandas con nombres de columna o resultado de `discover()` de Axiom.
- Detección de ausencia de camino dirigido entre tratamiento y resultado, devolviendo efecto exactamente 0 con intervalo de anchura cero.
- Manejo de tablas con más columnas que el conjunto de ajuste (solo se leen las relevantes).
- Advertencia cuando el tratamiento tiene menos de 20 valores distintos o la tabla tiene menos de 128 filas.

## Casos de uso

- Análisis de elasticidad de precio: estimar cómo varían las ventas al modificar el precio de un producto, usando un grafo que incluya edad del cliente o segmento como confusores. El modelo devuelve la curva dosis-respuesta en unidades monetarias directamente interpretables.
- Evaluación de políticas de marketing: cuantificar el efecto de distintos niveles de inversión publicitaria sobre conversiones, ajustando por variables observables del grafo y obteniendo intervalos para la toma de decisiones.
- Optimización de dosis en ensayos o procesos: estimar el efecto de dosis continuas (fármacos, fertilizantes, temperatura de proceso) sobre un resultado medido, con intervalos que reflejan la incertidumbre del modelo.
- Análisis de sensibilidad en modelos de negocio: dado un DAG de dominio validado por expertos, cuantificar qué variables son candidatas a intervención y con qué magnitud e incertidumbre.
- Investigación observacional con datos tabulares: obtener una primera estimación del efecto de un tratamiento continuo antes de recurrir a métodos econométricos clásicos, como cribado rápido.
- Integración con pipelines de descubrimiento causal: encadenar Axiom (axiom-discovery) para descubrir el grafo y Axiom Effect para estimar el efecto, automatizando el flujo completo sobre tablas de 128-1024 filas.
- Educación y prototipado en inferencia causal: experimentar con el flujo do-calculus sobre datos simulados o reales con estructura conocida, gracias a su API sencilla y pesos ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el modelo se ha entrenado y validado sobre datos simulados, sin evaluación sobre datos reales, y que en escenarios de solapamiento pobre o datos puramente lineales los estimadores clásicos pueden ser más precisos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (26 MB de pesos más overhead de PyTorch y los datos tabulares en memoria).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo es tan pequeño que la inferencia puede ejecutarse en CPU con latencia aceptable.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: instalación vía pip desde el repositorio de Hugging Face (`pip install "git+https://huggingface.co/maxpagels/axiom-effect"`), uso directo con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; dado el tamaño (6,5M parámetros) y la naturaleza tabular, se espera baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / filas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Axiom Effect | Estimador de efectos causales neuronales | 6,5M | 128-1024 filas, 18 variables de ajuste | Apache 2.0 | Hugging Face |
| Axiom (axiom-discovery) | Descubrimiento causal | no disponible | no disponible | no disponible | Hugging Face (modelo hermano) |
| Estimadores clásicos (p. ej. regresión ajustada, IPW) | Estadística causal | no aplica | sin límite práctico | según implementación | Amplia |

No se dispone de información sobre otros modelos neuronales comparables de estimación de efectos causales tabulares en la documentación proporcionada. La comparación con estimadores clásicos se limita a la nota de la model card de que estos pueden ser más precisos en datos lineales o con solapamiento pobre.

## Limitaciones y advertencias

- El grafo se toma como verdadero: un confusor omitido o una arista invertida sesga la respuesta y el intervalo no se ensancha por ello.
- No admite confusores ocultos: no soporta front-door, variables instrumentales ni otras estrategias de identificación más allá del ajuste, y nunca declara "no identificable".
- Solo tratamientos continuos con al menos 20 valores distintos; tratamientos binarios y categóricos no están soportados todavía.
- Solo efectos promedio; no calcula efectos por fila ni condicionales.
- Entrenado y validado exclusivamente con datos simulados: no hay evaluación sobre datos reales, y la cobertura de los intervalos en datos reales es desconocida.
- En escenarios de solapamiento pobre (el conjunto de ajuste casi determina el tratamiento) y en datos puramente lineales, los estimadores clásicos pueden ser más precisos.
- Los valores de tratamiento fuera de los cuantiles 2-98% se rechazan salvo que se use `extrapolate=True`, ya que no hay soporte en los datos.
- No admite valores faltantes en tratamiento, resultado ni conjunto de ajuste.
- Con más de 1024 filas, `effect` promedia 8 subconjuntos aleatorios de 1024 filas, con intervalos correspondientes a 1024 filas (más anchos de lo que correspondería).
- Los intervalos de la curva dosis-respuesta son puntuales, no simultáneos.
- Versión 0.0.1 experimental: la API y los pesos cambiarán en releases 0.0.x.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación en datos reales desaconseja su uso en producción sin verificación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxpagels/axiom-effect
- Modelo hermano Axiom (descubrimiento causal): https://huggingface.co/maxpagels/axiom-discovery
- Página del proyecto: https://maxpagels.com/axiom
