# mradermacher/fara-9b-heretic-uncensored-i1-GGUF

## Resumen

Fara-9B-Heretic-Uncensored-i1-GGUF es una cuantización en formato GGUF del modelo Fara-1.5-9B-Heretic-Uncensored, publicada por el usuario mradermacher. El modelo base es un derivado de la familia Fara, orientada a tareas de computer-use y automatización de navegador (web-agent), y ha sido sometido a un proceso de "abliteration" o decensurado que elimina las capas de rechazo del modelo original. Esta versión concreta es una cuantización con imatrix (importance matrix) que genera ficheros GGUF de distintos tamaños para su uso con llama.cpp y herramientas compatibles.

El modelo cuenta con aproximadamente 8.950 millones de parámetros (8,95 B) y está etiquetado como multimodal y vision-language, lo que indica capacidad de procesar imágenes además de texto. Los ficheros mmproj necesarios para la parte visual se alojan en el repositorio estático del autor. La licencia es MIT y el idioma declarado es únicamente inglés.

La relevancia de esta ficha radica en que combina tres características poco habituales en un mismo artefacto: orientación a agentes de navegador (computer-use), capacidades multimodales y un proceso de decensurado explícito. No obstante, la información pública disponible es muy limitada: la model card del cuantizador es genérica y no incluye datos de entrenamiento, benchmarks ni detalles de arquitectura más allá de lo inferible del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal; detalles no publicados) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Fara-1.5-9B-Heretic-Uncensored en la documentacion proporcionada. Por el tamano (8,95 B de parametros), el etiquetado como vision-language y la pertenencia a la familia Fara, cabe esperar un transformer multimodal con un codificador visual acoplado, pero este extremo no se confirma en la informacion disponible.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) ni el procedimiento exacto de abliteration aplicado. La model card del cuantizador unicamente indica que se trata de cuantizaciones ponderadas con imatrix del modelo lmcfarlin/Fara-1.5-9B-Heretic-Uncensored, generadas con el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). Los ficheros mmproj para la parte visual, si existen, se alojan en el repositorio estatico del mismo autor.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Procesamiento de imagenes (vision-language): el modelo esta etiquetado como multimodal y dispone de ficheros mmproj en el repositorio estatico para la torre visual.
- Computer-use y control de interfaz: orientado a tareas de agentes que operan sobre pantallas, ventanas y elementos de UI.
- Automatizacion de navegador (web-agent, browser-automation): capacitado para interpretar paginas y ejecutar acciones sobre ellas.
- Integracion con frameworks de agentes (etiqueta magentic).
- Comportamiento decensurado/abliterado: se han eliminado las capas de rechazo, por lo que responde a peticiones que el modelo original rechazaria.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para despliegue como servicio.
- No se documenta soporte explicito de tool calling estructurado, modo thinking ni audio en la informacion disponible.

## Casos de uso

- Automatizacion de tareas de navegador: el modelo puede interpretar capturas de pantalla de paginas web y decidir la siguiente accion (clic, escritura, scroll), lo que lo hace adecuado para pipelines de scraping interactivo y pruebas end-to-end de interfaces web.
- Agentes de computer-use en escritorio: integrado en un bucle de captura de pantalla y ejecucion de acciones, sirve para automatizar flujos de trabajo repetitivos en aplicaciones de escritorio (rellenado de formularios, extraccion de datos de ERPs legacy).
- Testing de regresion de UI: al combinar vision y control de interfaz, puede actuar como agente de validacion que navega por la aplicacion y comprueba estados visuales tras cada despliegue.
- Asistentes de soporte tecnico con acceso a pantalla: el modelo puede analizar la captura que envia un usuario y guiarle paso a paso por la resolucion de un problema, gracias a su naturaleza vision-language.
- Investigacion sobre alineacion y decensurado: al ser una variante abliterated con licencia MIT, es util para estudiar el comportamiento de modelos sin capas de rechazo en entornos controlados de evaluacion de seguridad.
- Despliegue local en estaciones de trabajo: las cuantizaciones i1-Q4_K_M (5,8 GB) e i1-Q5_K_M (6,6 GB) permiten ejecutar el modelo en GPUs de consumo con llama.cpp, lo que facilita prototipado de agentes sin depender de APIs externas.
- Generacion de contenido en ingles sin restricciones editoriales: para casos donde el filtrado del modelo base resulta un obstaculo (redaccion creativa, simulacion de personajes), aunque con las advertencias de la seccion de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos, sin overhead de contexto):
  - i1-IQ1_S: ~3,0 GB
  - i1-IQ2_M: ~3,8 GB
  - i1-IQ3_M: ~4,6 GB
  - i1-Q4_K_M: ~5,8 GB
  - i1-Q5_K_M: ~6,6 GB
  - i1-Q6_K: ~7,5 GB
- Sumar aproximadamente 1-2 GB adicionales para el contexto KV cache y, en su caso, la torre visual (mmproj), cuyo tamano no se detalla.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100/H100 solo necesarias para despliegues concurrentes de alta throughput.
- Cabe en GPUs de consumo: si, desde una RTX 3060 12 GB o superior en cuantizaciones Q4_K_M y Q5_K_M; las cuantizaciones IQ2-IQ3 caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Fara-9B-Heretic-Uncensored-i1-GGUF (este) | ~8,95 B | no disponible | si (mmproj) | MIT | Cuantizacion GGUF con imatrix, decensurado, solo ingles |
| Fara-1.5-9B-Heretic-Uncensored (base) | ~8,95 B | no disponible | si | MIT | Pesos originales en safetensors, sin cuantizar |
| Fara-1.5-9B (original, sin decensurar) | ~9 B | no disponible | si | no disponible | Variante con capas de rechazo intactas |
| mradermacher/fara-9b-heretic-uncensored-GGUF (static) | ~8,95 B | no disponible | si | MIT | Cuantizaciones estaticas sin imatrix del mismo modelo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo decensurado (abliterated): no aplica filtros de rechazo, por lo que puede generar contenido danino, ofensivo o ilegal. No es apto para exposicion directa a usuarios finales sin una capa de moderacion propia.
- Riesgo elevado de alucinacion en tareas de agente: al operar sobre interfaces, una accion erronea puede tener efectos reales (compras, envios de formularios, borrados). Requiere sandboxing y supervision humana.
- Idioma limitado al ingles: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en produccion en espanol no esta respaldado por la documentacion.
- La model card del cuantizador es generica: no aporta informacion sobre contexto maximo, datos de entrenamiento ni evaluaciones, lo que dificulta estimar su calidad real frente al modelo base.
- Las cuantizaciones de muy baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; la propia model card advierte que IQ1_S es "for the desperate" y Q2_K_S "very low quality".
- El repositorio ocupa 111,7 GB en total por acumulacion de todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Licencia MIT: permite uso comercial y modificacion, pero no exime de responsabilidad legal por el contenido generado ni por las acciones ejecutadas por el agente.
- Sin garantias del autor sobre el comportamiento del modelo en produccion; el proceso de decensurado puede haber degradado capacidades de instruccion y razonamiento respecto al original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/fara-9b-heretic-uncensored-i1-GGUF
- Modelo base: https://huggingface.co/lmcfarlin/Fara-1.5-9B-Heretic-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/fara-9b-heretic-uncensored-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#fara-9b-heretic-uncensored-i1-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
