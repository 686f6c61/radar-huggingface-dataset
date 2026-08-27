# RainWTS/gemma-4-E2B-it

## Resumen

RainWTS/gemma-4-E2B-it es un modelo multimodal de la familia Gemma 4, desarrollado originalmente por Google DeepMind y posteriormente ajustado con instrucciones (instruction-tuned) por el usuario RainWTS. Se trata de un modelo any-to-any que acepta texto, imagen y audio como entrada y genera texto como salida, diseñado específicamente para ejecutarse en dispositivos con recursos limitados, como teléfonos móviles, portátiles y sistemas embebidos.

El modelo base, google/gemma-4-E2B, emplea una arquitectura transformer decoder-only con atención híbrida (ventana deslizante local combinada con atención global), Per-Layer Embeddings (PLE) y encoders dedicados para visión y audio. Con 5.123 millones de parámetros totales (2.3 mil millones efectivos) y una ventana de contexto de 128K tokens, este fine-tune hereda las capacidades del modelo original, incluyendo razonamiento configurable, function calling nativo y soporte multilingüe en más de 140 idiomas.

La relevancia de este modelo radica en su equilibrio entre tamaño reducido y capacidades multimodales avanzadas, lo que permite desplegar asistentes de IA, agentes autónomos y herramientas de procesamiento de contenido en hardware de consumo sin depender de infraestructura cloud. La licencia Apache 2.0 facilita su uso comercial y su integración en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida (sliding window + global), Per-Layer Embeddings (PLE) |
| Parametros totales | 5.123.178.051 (5.1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Mas de 140 (segun modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E2B utiliza una arquitectura transformer decoder-only con un mecanismo de atencion hibrido que intercala capas de atencion con ventana deslizante local (512 tokens) y capas de atencion global, garantizando que la ultima capa sea siempre global. Esta combinacion reduce el coste computacional y el uso de memoria en contextos largos, manteniendo al mismo tiempo la capacidad de modelar dependencias de largo alcance. Las capas globales emplean Keys y Values unificados y aplican Proportional RoPE (p-RoPE) para optimizar la memoria en secuencias extensas.

Una innovacion clave es el uso de Per-Layer Embeddings (PLE), que asigna a cada capa del decoder su propia tabla de embeddings pequena para cada token. Estas tablas son grandes en tamano pero se utilizan solo para busquedas rapidas, lo que explica que el numero de parametros efectivos (2.3B) sea muy inferior al total (5.1B). El modelo incorpora ademas un encoder de vision de aproximadamente 150M de parametros y un encoder de audio de unos 300M de parametros, que procesan las entradas multimodales antes de pasarlas al LLM principal.

El entrenamiento del modelo base incluyo fases de pre-entrenamiento y ajuste con instrucciones, con soporte nativo para el rol `system` en las conversaciones. El fine-tune de RainWTS no documenta los datos ni el procedimiento de ajuste especifico, por lo que no se dispone de informacion detallada sobre el dataset utilizado ni sobre tecnicas como RLHF o DPO aplicadas en esta variante.

## Capacidades

- Generacion de texto, razonamiento y codigo: el modelo es capaz de producir respuestas coherentes, resolver problemas de logica y generar codigo en multiples lenguajes de programacion.
- Procesamiento multimodal: acepta imagenes con resolucion y relacion de aspecto variables, asi como audio, y genera texto descriptivo o respuestas basadas en ese contenido.
- Razonamiento configurable: incluye modos de pensamiento (thinking modes) que permiten activar o desactivar cadenas de razonamiento internas segun la tarea.
- Function calling nativo: soporta llamadas a herramientas y funciones, lo que lo hace apto para integrarse en agentes autonomos y pipelines de automatizacion.
- Soporte de agentes y multi-step reasoning: puede encadenar multiples pasos de razonamiento y ejecutar acciones a traves de herramientas externas.
- Capacidades multilingues: mantiene soporte en mas de 140 idiomas, aunque el fine-tune no especifica si se ha conservado o limitado este alcance.
- Soporte nativo de system prompt: permite estructurar conversaciones con instrucciones de sistema persistentes.

## Casos de uso

- Asistentes virtuales en dispositivos moviles: el modelo puede ejecutarse localmente en telefonos de gama alta, gestionando conversaciones multi-turno con contexto largo (hasta 128K tokens) y respondiendo a comandos de voz o imagenes capturadas por la camara.
- Transcripcion y analisis de audio: gracias a su encoder de audio, puede transcribir reuniones, podcasts o notas de voz, y generar resumenes o extraer accionables sin necesidad de servicios cloud.
- Procesamiento de documentos con imagenes: en entornos de oficina, puede leer facturas, formularios o capturas de pantalla, extraer datos relevantes y generar informes estructurados.
- Agentes autonomos de automatizacion: con function calling nativo, puede integrarse en sistemas de automatizacion de tareas (envio de correos, gestion de calendarios, consultas a APIs) ejecutandose en un servidor local o en un mini-PC.
- Generacion de codigo en entornos con recursos limitados: desarrolladores pueden usarlo como asistente de programacion en portatiles sin GPU dedicada, gracias a su tamano reducido y a la posibilidad de cuantizarlo.
- Atencion al cliente multimodal: en quioscos o sistemas embebidos, puede procesar consultas escritas, orales o con imagenes (por ejemplo, fotos de un producto) y ofrecer respuestas contextualizadas en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el fine-tune RainWTS/gemma-4-E2B-it en la informacion disponible. El modelo base Gemma 4 E2B cuenta con evaluaciones en el reporte tecnico (arxiv:2607.02770), pero no se incluyen los numeros en la documentacion consultada. Se recomienda consultar dicho reporte para obtener datos comparativos de MMLU, HumanEval, GSM8K y otras pruebas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.1B parametros en precision fp32 se requieren aproximadamente 20 GB de VRAM; con cuantizacion de 4 bits (no publicada oficialmente, pero posible mediante herramientas como llama.cpp o GPTQ) se puede reducir a unos 3-4 GB.
- GPU recomendadas: el modelo cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) con cuantizacion. En precision completa se recomienda una GPU con al menos 24 GB (RTX 3090/4090, A5000).
- Ejecucion en CPU: al ser un modelo pequeno, puede ejecutarse en CPU con cuantizacion de 4 u 8 bits, aunque con latencias mayores (del orden de segundos por token).
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI. El tag `endpoints_compatible` sugiere que puede desplegarse en plataformas de inferencia gestionada.
- Latencia y throughput: no se dispone de datos medidos para este fine-tune; en el modelo base, la ventana deslizante de 512 tokens reduce el coste de atencion, lo que permite un throughput razonable en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| RainWTS/gemma-4-E2B-it | 5.1B | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E4B (base) | 8B (4.5B efectivos) | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11.95B | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 26B A4B MoE | 25.2B (3.8B activos) | 256K | Texto, imagen | Apache 2.0 |

La comparativa se limita a la familia Gemma 4, ya que no se dispone de datos de rendimiento para contrastar con modelos de otros fabricantes. El E2B es el mas pequeno y ligero, orientado a edge; el E4B ofrece el doble de parametros efectivos con el mismo contexto; el 12B Unified elimina los encoders dedicados; y el 26B A4B es un MoE con mayor capacidad pero requiere mas recursos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo base entrenado por Google, puede heredar sesgos presentes en los datos de pre-entrenamiento, especialmente en tareas de generacion de texto libre.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en contextos largos o con entradas ambiguas.
- Limitaciones de contexto: aunque la ventana es de 128K tokens, la atencion con ventana deslizante de 512 tokens puede degradar la coherencia en pasajes muy largos si no se gestiona adecuadamente.
- Limitaciones de idioma: el fine-tune no especifica si el soporte multilingue del modelo base se ha mantenido integro; es posible que el ajuste con instrucciones haya reducido el rendimiento en idiomas poco representados.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos adicionales de Google en el enlace de licencia proporcionado.
- Documentacion del fine-tune: no se ha publicado informacion sobre el dataset de ajuste, el procedimiento de entrenamiento ni las evaluaciones realizadas, por lo que el comportamiento en produccion debe validarse de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RainWTS/gemma-4-E2B-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Reporte tecnico: https://arxiv.org/abs/2607.02770
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion oficial: https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Pagina de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
