# hb-dev/Qwen3-1.7B-ONNX

## Resumen

hb-dev/Qwen3-1.7B-ONNX es una conversion a formato ONNX del modelo Qwen/Qwen3-1.7B, publicada por el usuario hb-dev con el objetivo de hacerlo compatible con Transformers.js y, por extension, con inferencia en navegador mediante WebGPU/WebAssembly. No se trata de un modelo nuevo ni de un reentrenamiento: es un artefacto de distribucion que empaqueta los mismos pesos del modelo base en un formato que la libreria de JavaScript de Hugging Face puede consumir directamente.

El modelo base pertenece a la familia Qwen3, desarrollada por Alibaba Qwen. Qwen3-1.7B es una variante densa (no MoE) de tipo decoder-only transformer, con aproximadamente 1.700 millones de parametros y una ventana de contexto nativa de 32.768 tokens, extensible hasta 131.072 mediante escalado YaRN. La relevancia de esta version ONNX es practica: permite ejecutar un modelo de 1,7B en el cliente sin backend GPU dedicado, lo que habilita asistentes, clasificadores y funciones de generacion de texto dentro de aplicaciones web.

La model card del repositorio es minima y no aporta informacion sobre licencia, idiomas, cuantizacion ni metricas. El propio autor advierte de que mantener repositorios ONNX separados es una solucion temporal hasta que WebML gane traccion, y recomienda a otros autores convertir sus modelos con Optimum siguiendo la misma estructura de carpetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-1.7B), exportado a ONNX; no es MoE |
| Parametros totales | ~1.700 millones (modelo base) |
| Parametros activos | No aplica: el modelo base es denso |
| Longitud de contexto | 32.768 tokens nativo; hasta 131.072 tokens con escalado YaRN (datos del modelo base) |
| Tipos de cuantizacion | No disponible en la model card. El repositorio ocupa 1,7 GB, magnitud coherente con pesos de 8 bits o con un subconjunto de precisiones, pero no se especifica |
| Idiomas soportados | No disponible en este repositorio. El modelo base declara soporte multilingue amplio (mas de 100 idiomas) |
| Licencia | No disponible en este repositorio. El modelo base Qwen/Qwen3-1.7B se distribuye bajo Apache 2.0 |
| Formato de pesos | ONNX, alojados en la subcarpeta `onnx/` del repositorio |
| Libreria de inferencia | transformers.js |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-1.7B: un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y activacion SwiGLU. Qwen3 introduce en su familia un modo de razonamiento explicito ("thinking mode") que puede activarse o desactivarse, asi como la posibilidad de alternar entre ambos modos dentro de una misma conversacion. El modelo base fue entrenado por Alibaba Qwen; este repositorio no documenta el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

La unica transformacion documentada en este repositorio es la conversion de pesos a ONNX para su uso con Transformers.js. La model card no detalla la herramienta exacta empleada ni las precisiones exportadas, aunque el autor recomienda Optimum como via estandar para producir este tipo de artefactos y sugiere organizar el repositorio con los pesos ONNX en una subcarpeta `onnx`, estructura que este repositorio parece seguir. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras) en la conversion.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Razonamiento paso a paso en modo "thinking" y respuestas directas en modo no-thinking, segun las capacidades declaradas del modelo base.
- Generacion y explicacion de codigo, con el nivel propio de un modelo de 1,7B parametros.
- Resolucion de problemas matematicos de complejidad baja o media.
- Soporte multilingue amplio segun la documentacion del modelo base; no confirmado de forma explicita en este repositorio.
- Capacidad de ejecucion en el navegador mediante Transformers.js, con WebGPU o WebAssembly como backends.
- Tool calling y comportamiento agentico: no disponible en la informacion proporcionada para este repositorio; el modelo base Qwen3 declara soporte de function calling en su documentacion oficial.
- Vision y audio: no soportados; el modelo base es exclusivamente de texto.

## Casos de uso

- Asistentes embebidos en aplicaciones web: el modelo puede ejecutarse en el cliente con Transformers.js, de modo que un chatbot de ayuda dentro de una pagina no requiere enviar el texto del usuario a un servidor externo, lo que simplifica el cumplimiento de normativa de privacidad.
- Clasificacion y etiquetado de texto en el navegador: con 1,7B parametros y contexto de 32.768 tokens es viable procesar documentos de varias paginas y extraer categorias, entidades o resumenes sin coste de API.
- Autocompletado y redaccion asistida en editores web: integrado como worker en el navegador, puede sugerir continuaciones de parrafo con latencia aceptable en equipos con WebGPU.
- Procesamiento de formularios y correos en aplicaciones ofimaticas: extraccion de campos estructurados a partir de texto libre, con la ventaja de que los datos no abandonan el dispositivo.
- Filtrado y moderacion de contenido en el cliente: un modelo de este tamano permite preclasificar comentarios o mensajes antes de enviarlos a un servicio de moderacion mas costoso.
- Prototipado rapido y demos interactivas: al no requerir GPU en servidor, sirve para publicar demos de Hugging Face Spaces o paginas estaticas donde el coste de inferencia es cero para el desarrollador.
- Educacion y experimentacion: permite estudiar el comportamiento de un modelo Qwen3 en entornos sin Python, comparando modos thinking y no-thinking directamente en JavaScript.
- Preprocesado en pipelines de RAG ligeros: generacion de consultas reformuladas o seleccion de fragmentos relevantes en el cliente antes de consultar un indice vectorial remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas, y las busquedas web realizadas no devolvieron resultados relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos a partir del numero de parametros, no confirmados por el autor):
  - Precision fp16: en torno a 3,5-4 GB.
  - Cuantizacion de 8 bits: en torno a 1,8-2,5 GB.
  - Cuantizacion de 4 bits: en torno a 1-1,5 GB.
- El repositorio ocupa 1,7 GB, lo que sugiere pesos ya cuantizados; conviene verificar los archivos de la subcarpeta `onnx/` antes de planificar el despliegue.
- GPU de consumo: cabe con holgura en GPU de 8 GB o mas (RTX 3060, RTX 4060, RTX 4070). En equipos con 6 GB puede requerir cuantizacion.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para este tamano; resultan sobredimensionadas salvo para servir muchas peticiones concurrentes.
- CPU: es viable mediante transformers.js con backend WebAssembly, con latencia notablemente superior a la de WebGPU.
- Navegador: la via principal de despliegue es Transformers.js, con soporte de WebGPU en navegadores modernos.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este repositorio; para esos entornos es preferible partir del modelo base Qwen/Qwen3-1.7B en formato safetensors o GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se establece frente a alternativas de tamano equivalente para despliegue en el borde. Los datos de parametros, contexto y licencia provienen de la documentacion publica de cada modelo; los datos de rendimiento no estan disponibles en la informacion proporcionada para ninguno de ellos.

| Modelo | Parametros | Contexto nativo | Licencia | Disponibilidad web (ONNX) |
|---|---|---|---|---|
| Qwen3-1.7B (este repositorio) | ~1,7B | 32.768 tokens | Apache 2.0 en el modelo base; no indicada en el repositorio ONNX | Si, con este repositorio |
| Llama 3.2 1B | ~1,24B | 128.000 tokens | Licencia comunitaria de Meta | Existen conversiones de terceros, no oficiales |
| Gemma 3 1B | ~1B | 32.768 tokens | Terminos de uso de Gemma | Existen conversiones de terceros |
| SmolLM2-1.7B | ~1,7B | 8.192 tokens | Apache 2.0 | Si, con repositorios ONNX del ecosistema Hugging Face |

Diferencias destacables: Qwen3-1.7B ofrece el mayor contexto nativo entre las alternativas de licencia permisiva de este rango, junto con SmolLM2, que queda muy por debajo en ventana. Llama 3.2 1B lidera en contexto pero con una licencia menos laxa. Gemma 3 1B es el mas ligero en parametros y el mas restrictivo en terminos de uso.

## Limitaciones y advertencias

- La model card no especifica licencia para este repositorio. Aunque el modelo base es Apache 2.0, conviene verificar los terminos antes de un uso comercial del artefacto ONNX.
- No se documentan los idiomas soportados en este repositorio; el soporte multilingue debe validarse empiricamente si el caso de uso lo requiere.
- No se especifican las precisiones de cuantizacion incluidas. Desplegar una variante mas agresiva de lo previsto puede degradar la calidad de forma perceptible.
- Al ser una conversion y no un reentrenamiento, hereda integramente los sesgos y las limitaciones del modelo base Qwen3-1.7B, incluidos los sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: con 1,7B parametros, la tasa de invencion de hechos es mayor que en modelos de mayor tamano. No es adecuado para tareas que exijan precision factual sin verificacion externa.
- El repositorio tiene cero descargas y cero likes y fue publicado recientemente, sin historial de uso que permita avalar su correcto funcionamiento. Se recomienda validar la conversion antes de integrarla en produccion.
- El propio autor califica la existencia de repositorios ONNX separados como una solucion temporal, lo que implica que la ubicacion y el formato pueden cambiar cuando WebML madure.
- Herramientas de servidor como vLLM o TGI no consumen directamente pesos ONNX de este tipo; para despliegues con servidor conviene usar otros formatos del modelo base.
- En inferencia en navegador, el rendimiento depende del soporte de WebGPU del equipo del usuario y del consumo de memoria de la pestana, que puede provocar cierres en dispositivos con poca RAM.
- Contextos muy largos, cercanos a los 32.768 tokens, incrementan de forma notable el uso de memoria y el tiempo de respuesta en entornos de navegador.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hb-dev/Qwen3-1.7B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentacion de Optimum (conversion a ONNX): https://huggingface.co/docs/optimum/index
- Blog oficial de la familia Qwen3: https://qwenlm.github.io/blog/qwen3/
- Resultados de la busqueda web: no se encontro ningun resultado relevante sobre este modelo; las busquedas devolvieron contenidos sin relacion (servicios de streaming y articulos de hematologia).
