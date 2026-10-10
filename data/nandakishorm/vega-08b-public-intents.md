# nandakishorm/vega-08b-public-intents

## Resumen

Vega 0.8B (public intents) es un modelo de decisión tipada desarrollado por el usuario nandakishorm y publicado en HuggingFace. No es un modelo de lenguaje generativo al uso: el LLM que lo sustenta, Qwen/Qwen3.5-0.8B, permanece congelado y nunca se entrena; todo el aprendizaje reside en un pequeño motor entrenado de 14.342.512 parámetros (57 MB) más un adaptador de tarea de 835.937 parámetros que se superpone a él. El repositorio incluye además una variante de 4B, apoyada en Qwen/Qwen3.5-4B con un motor de 30.879.088 parámetros (124 MB) y un adaptador de 1.431.905 parámetros.

El modelo resuelve tareas de clasificación y decisión con salidas tipadas (choice, boolean y score), con una ventana de contexto declarada de 73.728 tokens y una ruta multimodal que reutiliza el codificador de visión del backbone congelado. Su propuesta diferencial es que un modelo local de 0,8B, ejecutable en una T4 o en un portátil Apple, supera a un modelo alojado de referencia (Jev 1.13.0) en tareas concretas de cribado de phishing, razonamiento temporal y numérico, según las evaluaciones publicadas por el autor.

Es relevante ahora porque combina tres factores poco habituales en el mismo paquete: tamaño reducido (repo de 0,2 GB con ambos tamaños), contexto muy largo con caché de prefijo de lectura única y calibración explícita de probabilidades (error de calibración de 0,026 en la variante 0.8B y 0,019 en la 4B). Licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer congelado (Qwen3.5) más motor de decisión entrenado y adaptador de tarea; soporte multimodal mediante el codificador de visión del backbone |
| Parametros totales | 0.8B: backbone Qwen3.5-0.8B (24 capas, d=1024) congelado + 14.342.512 parámetros de motor + 835.937 de adaptador. 4B: backbone Qwen3.5-4B (32 capas, d=2560) congelado + 30.879.088 + 1.431.905 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 73.728 tokens (el backbone soporta 262.144 posiciones rotatorias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se documentan un motor de 57 MB o 124 MB y adaptadores con gating; la librería declarada es vegaml) |

## Arquitectura y entrenamiento

La arquitectura separa dos piezas. Por un lado, un backbone de lenguaje congelado y fijado por SHA-256 (Qwen3.5-0.8B por defecto, Qwen3.5-4B en la carpeta 4b/), que aporta las representaciones y, en su versión multimodal, la codificación de imágenes. Por otro, un motor entrenado descrito por el autor como un «pequeño motor de física» que se apoya sobre el backbone y contiene todo el conocimiento adquirido, junto con adaptadores de tarea con gating. El entrenamiento no toca los pesos del LLM en ningún momento, según la model card.

La innovación declarada está en la gestión del contexto largo. El modelo aplica caché de prefijo de lectura única: un estado de al menos 4.096 tokens se procesa una sola vez con caché KV y cada pregunta posterior parte de una copia de ese estado, de modo que doce preguntas sobre un contrato de 73.000 tokens cuestan aproximadamente una lectura y no doce. Además incorpora un lector de memoria que divide los estados largos en 16 fragmentos, aplica mean-pooling en la capa de características más profunda y los entrega al motor junto con los spans agrupados, para que la evidencia situada al final de un documento largo siga influyendo en la decisión. La model card indica que las entradas que no caben se rechazan explícitamente en lugar de truncarse en silencio. También se declara un método propio de calibración y predicción conforme (conformal prediction), sin detallar el procedimiento de entrenamiento ni la composición del dataset.

## Capacidades

- Decisión tipada con tres formatos de respuesta: choice (elección entre alternativas con criterios definidos), boolean (probabilidad de que un enunciado sea verdadero) y score (puntuación).
- Clasificación de texto en dominios concretos: intenciones bancarias (banking77), intenciones de asistente (clinc150), enrutado a herramientas (when2call), llamadas a API (apibank), electrodomésticos (appliances) y clasificación de productos de comercio electrónico (esci).
- Cribado de correo malicioso: clasificación binaria de phishing sobre lotes de 800 correos con precisión y exhaustividad publicadas.
- Razonamiento temporal y numérico contra umbrales de política (conjunto temporal_numeric de JevBench v1.4.2).
- Procesamiento de documentos largos de hasta 73.728 tokens con caché de prefijo de lectura única y lector de memoria.
- Visión: la ruta vega_vision.py expone la misma interfaz tipada para imágenes mediante el codificador de visión congelado; las imágenes se redimensionan a max_pixels (por defecto 1024·32·32). El autor advierte que esta ruta es funcional pero no está cubierta por las cifras publicadas.
- Calibración de probabilidades: se publican Brier y error de calibración para ambos tamaños, lo que permite fijar umbrales de decisión.
- No se documenta soporte de tool calling generativo, agentes multi-paso, audio ni modos de razonamiento explícito.

## Casos de uso

- Cribado de phishing en pasarelas de correo: el modelo clasifica lotes de correos y, según los datos del autor, detecta 252 de 400 correos maliciosos sobre un conjunto equilibrado de 800, frente a los 99 de Jev 1.13.0. Su utilidad está en operar con exhaustividad alta en la primera fase del filtro, dejando la confirmación a un segundo sistema.
- Enrutado de peticiones de usuario a la herramienta o API correcta: con 0,904 en when2call y 0,895 en apibank en la variante 0.8B, puede colocarse delante de un orquestador para decidir qué función invocar antes de llamar al LLM generativo.
- Clasificación de intenciones en atención al cliente: 0,880 en clinc150 y 0,714 en banking77 con el adaptador, suficiente para separar consultas de saldo, tarjeta o reclamación y dirigirlas a colas distintas.
- Categorización de catálogo en comercio electrónico: 0,564 en esci (0,644 en la variante 4B), aplicable a la asignación de categorías y atributos de producto en un pipeline de ingesta.
- Revisión de contratos y pólizas largas: con 73.728 tokens de contexto y caché de prefijo de lectura única, un mismo contrato se procesa una vez y se le lanzan múltiples preguntas tipadas (por ejemplo, si una cláusula concreta es cierta o qué tipo de documento es) sin repetir la lectura completa.
- Validación de gastos contra políticas internas: el conjunto temporal_numeric evalúa fechas y cantidades contra umbrales; el modelo obtiene 46,7 frente a 20,0 del modelo alojado de referencia, lo que lo hace apto para comprobar si un importe o una fecha incumplen una política antes de aprobar un pago.
- Clasificación de documentos escaneados: mediante vega_vision.py puede determinar si una imagen es una factura, un recibo, un contrato u otro tipo de documento, como paso previo a su enrutado en un sistema de gestión documental.
- Etiquetado y anotación de datos a gran escala: con 0,267 s por decisión en T4 fp16 y 22 ms por decisión en la variante 0.8B según la tabla del autor, el coste por elemento permite usarlo en procesos de anotación masiva con umbrales calibrados.

## Benchmarks y rendimiento

Evaluación sobre LocalLLaMA/typed-decisions, split de test de 2.050 decisiones, ejecución propia del autor para cada checkpoint:

| Metrica | Vega 0.8B | Vega 4B |
|---|---|---|
| Metrica con adaptador | 0,763 | 0,803 |
| Soft accuracy | 0,680 | 0,725 |
| Brier | 0,314 | 0,270 |
| Error de calibracion | 0,026 | 0,019 |

Resultados por flujo de trabajo con adaptador:

| Flujo | 0.8B | 4B |
|---|---|---|
| apibank | 0,895 | 0,965 |
| when2call | 0,904 | 0,946 |
| appliances | 0,851 | 0,891 |
| banking77 | 0,714 | 0,749 |
| esci | 0,564 | 0,644 |
| clinc150 | 0,880 | 0,867 |

Cribado de phishing sobre 800 correos con reparto 50/50, comparado con Jev 1.13.0 llamado en vivo sobre los mismos elementos:

| Modelo | Exactitud | Precision | Recall | Detectados |
|---|---|---|---|---|
| Vega 0.8B + adaptador | 75,38 | 0,837 | 0,630 | 252 / 400 |
| Jev 1.13.0 | 61,88 | 0,961 | 0,247 | 99 / 400 |

El autor reporta una diferencia de +13,50 puntos de exactitud y 2,5 veces más phishing detectado, con McNemar p = 3e-11. En JevBench v1.4.2, conjunto temporal_numeric, Vega 0.8B + adaptador obtiene 46,7 frente a 20,0 de Jev 1.13.0 (+26,7). La model card menciona un evaluador público S1MB con 137 benchmarks y 26.269 decisiones, pero la tabla correspondiente aparece truncada en la información disponible, por lo que sus resultados no se reproducen aquí. No hay cifras publicadas para MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- Inferencia verificada en una única GPU T4 (16 GB) en fp16, extremo a extremo y ejecutable desde el navegador vía Colab.
- Inferencia verificada en Apple M-series en fp32, con 0,28 s por decisión.
- Latencia declarada: 0,267 s por decisión en T4 fp16 y 0,28 s en Apple M-series fp32. La tabla comparativa del autor cita además 22 ms por decisión para el 0.8B y 28 ms para el 4B, sin especificar el hardware de esa medición.
- Estimación propia a partir del recuento de parámetros (no publicada por el autor): el backbone de 0,8B en fp16 ronda 1,6 GB y en fp32 unos 3,2 GB, a lo que se suman 57 MB de motor; el conjunto cabe con holgura en cualquier GPU de consumo con 8 GB o más, como una RTX 3060, RTX 4060 o RTX 4090.
- Para la variante 4B, el backbone en fp16 ronda 8 GB más 124 MB de motor, por lo que requiere GPU de gama alta o cuantización no documentada en la información disponible.
- Opciones de despliegue: la librería vegaml (carga con `vegalm.load()` para el 0.8B y `vegalm.load("4b")` para el 4B) y el cuaderno de Colab publicado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- El uso intensivo de documentos largos depende de la caché de prefijo, que reduce el coste de múltiples preguntas sobre un mismo estado pero exige mantener el estado en memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | typed-decisions (con adaptador) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vega 0.8B public intents | 0,8B congelados + 14,3 M entrenados + 0,84 M de adaptador | 73.728 tokens | 0,763 | Apache 2.0 | HuggingFace, librería vegaml |
| Vega 4B public intents | 4B congelados + 30,9 M entrenados + 1,43 M de adaptador | 73.728 tokens | 0,803 | Apache 2.0 | En la carpeta 4b/ del mismo repositorio |
| Jev 1.13.0 | no disponible (modelo alojado, parametros no divulgados) | no disponible | no disponible en typed-decisions; 61,88 de exactitud en phishing y 20,0 en temporal_numeric | no disponible | Servicio alojado, invocado en vivo por el autor |
| Qwen3.5-0.8B | 0,8B (24 capas, d=1024), 262.144 posiciones rotatorias | no disponible | no disponible (se usa congelado como backbone) | no disponible | HuggingFace |

No se dispone de resultados comparables de otros clasificadores ligeros o modelos de intenciones en la información proporcionada.

## Limitaciones y advertencias

- La model card no declara idiomas soportados; todas las evaluaciones publicadas están en inglés y no hay evidencia de comportamiento en castellano.
- La ruta de visión es funcional pero el propio autor advierte que no está cubierta por las cifras de rendimiento, por lo que su fiabilidad en producción no está cuantificada.
- No se detallan los datos de entrenamiento (composición, número de tokens, procedencia) ni el método de calibración, lo que dificulta auditar sesgos o evaluar riesgos de dominio.
- Los resultados de calibración (error de 0,026 y 0,019) provienen de una única partición de test de 2.050 decisiones y de la ejecución del propio autor; conviene revalidarlos en el dominio objetivo antes de fijar umbrales.
- El modelo no genera texto: solo emite decisiones tipadas. No sirve como sustituto de un LLM conversacional ni soporta tool calling generativo.
- Las entradas que exceden el contexto se rechazan en lugar de truncarse, lo que obliga a gestionar ese error en la aplicación.
- El modelo base subyacente (Qwen3.5-0.8B) está congelado y su licencia no se detalla en la información disponible; la licencia Apache 2.0 declarada corresponde al repositorio publicado, por lo que conviene verificar las condiciones del backbone para uso comercial.
- El repositorio registra 0 descargas y 17 likes en el momento de la consulta, y ambas variantes comparten un mismo repositorio de 0,2 GB, dato a tener en cuenta respecto a su madurez y soporte.
- Las comparaciones con Jev 1.13.0 proceden de ejecuciones sobre los mismos elementos sin ajuste sobre los datos de evaluación, pero el modelo de referencia está alojado y no es reproducible de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nandakishorm/vega-08b-public-intents
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuaderno de Colab: https://colab.research.google.com/drive/1ZxS_Ee4-oyfo8ePKiAgbehv5I1Rh3F7O?usp=sharing
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2507.19855
- Referencias citadas sin enlace en la model card: conjunto de evaluación LocalLLaMA/typed-decisions, evaluador público S1MB y JevBench v1.4.2
