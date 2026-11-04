# jrubiosainz/microduck-sock-heist-6m-fce-v3x-48364128

## Resumen

Microduck Sock Heist - derived FCE v3x-48364128 es una política de control robótico en formato ONNX publicada por el usuario jrubiosainz en HuggingFace, concebida exclusivamente como entrada para la competición de simulación Microduck Arena, en la prueba "6 m Sock Heist". No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto de inferencia de 1.209.013 bytes que combina una red de respaldo heredada con una tabla de búsqueda de observaciones y acciones, y que produce comandos de control de bajo nivel para un robot simulado.

El modelo deriva por fine-tuning de rumezhak/microduck-sock-heist-composite-v3 (revisión 065056e8a8ad8e78cda38110f7717828e0d30475). La modificación introducida por jrubiosainz el 4 de noviembre de 2026 consiste en una reoptimización con CMA-ES separable de las últimas llamadas de control antes de la finalización, una búsqueda por semilla, aplicada únicamente a la semilla oficial 1. Solo cambian las filas finales de las tablas L_obs y L_act y el aviso de modificación añadido; el grafo, la red de respaldo, la máscara, la tolerancia y las formas de los tensores permanecen intactos.

Su relevancia es acotada y muy específica: documenta un ejercicio de ajuste fino de cola sobre una política de terceros en un entorno de benchmark reproducible, con métricas nativas declaradas (media de 4,895 s y 4895 ticks en cinco semillas oficiales, frente a 4896 ticks de la base). No hay evidencia de generalización, ni licencia clara para el conjunto, ni validación en hardware físico; de hecho, el autor prohíbe explícitamente su uso en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control con red de respaldo y tabla de búsqueda de observaciones/acciones (grafo ONNX heredado) |
| Parametros totales | no disponible (pesos en ONNX de 1.209.013 bytes; recuento de parámetros no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (artefacto ONNX ya exportado; no se documentan variantes) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible para el modelo en su conjunto; Apache-2.0 solo para las porciones heredadas de a1rb4Ck/microduck-heist |
| Formato de pesos | ONNX (policy.onnx; SHA256 de la base c21bc2d4..., SHA256 del candidato 48364128...) |

## Arquitectura y entrenamiento

La política no es un transformer ni un modelo generativo. Según la model card, el artefacto hereda el diseño de a1rb4Ck/microduck-heist: un grafo ONNX con un mecanismo de lookup de observaciones, una red de respaldo (fallback network) de la línea v3/v4 de lphatnguyen, una máscara y una tolerancia de control. La inferencia consiste en consultar filas de las tablas L_obs y L_act para producir comandos de control; cuando el lookup no cubre la observación, interviene la red de respaldo. No se documentan detalles de la arquitectura interna de esa red (capas, dimensiones, función de activación).

El "entrenamiento" de esta variante se limita a una búsqueda de cola: el 4 de noviembre de 2026, jrubiosainz reoptimizó las llamadas de control finales antes de la meta para la semilla oficial 1 mediante CMA-ES separable, con una búsqueda independiente por semilla, y volvió a registrar las observaciones y acciones en bucle cerrado sobre el runner nativo x86. Las semillas oficiales 2, 3, 4 y 5 conservan las filas de lookup de la base sin cambios. No hay información sobre el volumen de datos de entrenamiento original, la composición del dataset ni el uso de RLHF o DPO, que no aplican a este tipo de política. La evaluación canónica seleccionó `command_vx = 0.2` y el envío usa el barrido canónico sin sobrescritura de velocidad fija.

## Capacidades

- Generación de comandos de control de bajo nivel para un robot simulado Microduck en la tarea "6 m Sock Heist" (recogida de calcetín a 6 metros).
- Inferencia en formato ONNX ejecutable con el runner oficial microduck-arena 0.7.0 x86, versión 5.
- Evaluación a velocidad fija y evaluación canónica con barrido de `command_vx`.
- Lookup de observaciones con red de respaldo para observaciones no cubiertas por la tabla.
- Reproducibilidad verificable mediante hashes SHA256 del ONNX y de la revisión base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo thinking.

## Casos de uso

- Evaluación comparativa en Microduck Arena: la política se ejecuta en el runner oficial para la prueba de 6 m Sock Heist y permite comparar tiempos de finalización y ticks de física frente a la base composite-v3 en las cinco semillas oficiales.
- Reproducción de experimentos de búsqueda de cola: sirve como referencia para estudiar cómo una reoptimización CMA-ES de las últimas llamadas de control altera el tiempo de finalización (4,895 s de media frente a la base) sin tocar el grafo.
- Auditoría de linaje de artefactos ONNX: los hashes y los avisos de modificación heredados en NOTICE y en los metadatos permiten trazar la cadena composite-v1/v2/v3, remix-rz-tail y F2U/rz-tail.
- Docencia en optimización de políticas de control: el caso ilustra el sobreajuste in-sample, ya que solo se optimizaron y midieron las cinco semillas oficiales.
- Pruebas de integración de runners de simulación: validar que un runner x86 versión 5 carga y ejecuta correctamente un ONNX de 1.209.013 bytes con lookup y fallback.
- Estudio de licenciamiento en modelos derivados: el caso documenta la retención selectiva de LICENSE-apache-2.0.txt para porciones concretas y la ausencia de licencia para los pesos upstream.
- No debe emplearse en robótica física, atención al cliente, generación de código, análisis de documentos ni ninguna tarea de lenguaje.

## Benchmarks y rendimiento

Resultados declarados por el autor en repetición local nativa sobre el runner oficial microduck-arena 0.7.0 x86 (versión 5), no son resultados de la Arena en vivo:

| Semilla oficial | Tiempo de finalización (s) | Ticks de física | Ticks de la base |
|---|---:|---:|---:|
| 1 | 4,800 | 960 | 961 |
| 2 | 5,165 | 1033 | 1033 |
| 3 | 4,750 | 950 | 950 |
| 4 | 4,805 | 961 | 961 |
| 5 | 4,955 | 991 | 991 |

Media: 4,895 s; total: 4895 ticks; base directa: 4896 ticks. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y no serían aplicables a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto ONNX ocupa 1.209.013 bytes, por lo que la huella de pesos es mínima y el consumo vendrá dominado por el runtime de ONNX y el runner de simulación.
- GPU recomendadas: no disponible; la evaluación declarada se realizó en el runner nativo x86, sin mención de GPU.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, aunque no hay confirmación del autor ni requisitos de cómputo del runner.
- Opciones de despliegue: ONNX Runtime y el runner oficial microduck-arena 0.7.0 x86 (versión 5); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles; solo se reportan ticks de física por episodio (950 a 1033) y tiempos de finalización simulados (4,750 a 5,165 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jrubiosainz/microduck-sock-heist-6m-fce-v3x-48364128 | no disponible (ONNX 1.209.013 bytes) | no aplica | 4895 ticks totales, media 4,895 s en 5 semillas | no disponible (Apache-2.0 parcial) | HuggingFace, 0 descargas, 0 likes |
| rumezhak/microduck-sock-heist-composite-v3 | no disponible | no aplica | 4896 ticks totales en las mismas 5 semillas | no disponible | HuggingFace (base directa) |
| a1rb4Ck/microduck-heist (94cd2cfe) | no disponible | no aplica | no disponible | Apache-2.0 | HuggingFace (origen del layout y lookup) |

## Limitaciones y advertencias

- Prohibido su uso en un robot físico: el autor declara explícitamente que no se ha establecido una parada segura ni operación en hardware real.
- Sobreajuste in-sample: solo se optimizaron y midieron las cinco semillas oficiales; no hay evidencia de generalización a otras semillas, condiciones o entornos.
- Los resultados son mediciones locales nativas, no una aceptación, rango o puntuación en la Arena en vivo; diferencias de hardware o runtime pueden alterar el resultado.
- Licencia ambigua: la base directa no declara licencia para el modelo en su conjunto y no se declara licencia nueva; LICENSE-apache-2.0.txt cubre solo porciones concretas, no los pesos upstream sin licencia.
- Riesgo de retirada: el autor indica que, si un autor upstream objeta, se detiene la publicación y se escala para su retirada.
- Linaje con partes sin licencia declarada (v3/v4 y red de respaldo de lphatnguyen), lo que condiciona cualquier uso comercial.
- Ausencia total de capacidades de lenguaje, visión o razonamiento; no es adecuado para ninguna tarea fuera del control simulado de la prueba Sock Heist.
- Sin datos publicados sobre sesgos, alucinación o comportamiento fuera de distribución más allá de la cobertura del lookup y la red de respaldo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-fce-v3x-48364128
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v3/tree/065056e8a8ad8e78cda38110f7717828e0d30475
- Origen del layout y mecanismo de lookup: a1rb4Ck/microduck-heist, revisión 94cd2cfeb57a4ece561a3d320e233f442238cb81 (Apache-2.0)
- Microduck y Microduck Arena: Pollen Robotics (sin URL específica en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
