# sivelsguy/opus-mt-tc-big-he-en-onnx

## Resumen

`opus-mt-tc-big-he-en-onnx` es una exportación a ONNX con cuantización dinámica de 8 bits del modelo de traducción automática `Helsinki-NLP/opus-mt-tc-big-he-en`, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT (Tiedemann et al.). El modelo traduce de hebreo (`he`) a inglés (`en`) y emplea la arquitectura Marian, un transformer encoder-decoder entrenado específicamente para traducción neuronal.

La aportación de esta ficha no es un modelo nuevo, sino un artefacto de despliegue: el autor (`sivelsguy`) ha convertido los pesos originales a formato ONNX int8 e incluye un `tokenizer.json` compatible con transformers.js, lo que permite ejecutar la traducción directamente en el navegador mediante JavaScript, sin backend ni GPU. El repositorio ocupa 0,4 GB y está pensado para aplicaciones web ligeras, como la app de aprendizaje de hebreo *Parle*, que lo utiliza en producción.

Es relevante para desarrolladores que necesitan traducción hebreo-inglés de baja latencia en el cliente, con licencia permisiva (CC-BY-4.0) y sin dependencia de infraestructura de servidor. La contrapartida es que se trata de un modelo de traducción especializado, no de un modelo generativo generalista: no razona, no sigue instrucciones complejas y no cubre otras tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible (el modelo base es la variante "big" de OPUS-MT; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de 8 bits en la exportacion ONNX) |
| Idiomas soportados | hebreo (he) como origen, ingles (en) como destino |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8), con `tokenizer.json` para transformers.js |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-tc-big-he-en` pertenece a la familia OPUS-MT, basada en la arquitectura Marian: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado exclusivamente para traducción neuronal. La variante "tc-big" indica un modelo de mayor tamaño entrenado con datos del corpus OPUS (colección de corpus paralelos multilingües) y orientado a pares de lenguas de recursos limitados, como el hebreo.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO; en el ecosistema OPUS-MT estos modelos se entrenan de forma supervisada sobre corpus paralelos y no incorporan alineamiento por preferencias. La innovación técnica de esta ficha concreta es la exportación a ONNX con cuantización dinámica int8, que reduce el tamaño y permite inferencia en CPU o en el navegador mediante WebAssembly/WebGPU a través de transformers.js.

## Capacidades

- Traducción de texto de hebreo a inglés, tarea única para la que fue entrenado.
- Ejecución en el navegador mediante transformers.js con `dtype: "q8"`.
- Tokenización incluida (`tokenizer.json`), lo que simplifica la integración en aplicaciones JavaScript.
- Inferencia en CPU sin necesidad de GPU, gracias a la cuantización int8.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo multilingüe general: solo cubre el par hebreo-inglés.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Aplicaciones de aprendizaje de idiomas en el navegador: la app *Parle* lo usa para traducir frases hebreas al inglés en tiempo real sin backend, aprovechando la exportación ONNX int8 y la integración con transformers.js.
- Traducción de contenido hebreo en webs estáticas: permite traducir fragmentos de texto en el cliente sin enviar datos a un servidor, lo que reduce costes y mejora la privacidad.
- Extensiones de navegador para lectura asistida: puede integrarse en una extensión que traduzca al vuelo texto hebreo seleccionado por el usuario, con latencia baja al ejecutarse localmente.
- Preprocesamiento de corpus en pipelines de NLP: útil para normalizar documentos hebreos a inglés antes de tareas posteriores (análisis, indexación o búsqueda), en entornos donde no se quiere depender de APIs externas.
- Prototipado rápido de funciones de traducción: al cargarse con una sola llamada a `pipeline`, sirve para validar ideas de producto sin montar infraestructura de servidor.
- Aplicaciones offline o de campo: al ejecutarse en el cliente, funciona en escenarios con conectividad limitada una vez descargado el modelo, útil para herramientas de traducción en dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en navegador o CPU; el repositorio completo ocupa 0,4 GB, por lo que la huella en memoria tras la carga es del orden de cientos de MB con int8.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. En navegador puede aprovechar WebGPU si el runtime de transformers.js lo soporta, pero no se especifican requisitos.
- Cabe en GPU de consumo: sí, con enorme holgura, aunque su destino principal es CPU y navegador.
- Opciones de despliegue: transformers.js (principal), y cualquier runtime compatible con ONNX (ONNX Runtime, etc.). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación de texto autoregresiva de gran tamaño.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sivelsguy/opus-mt-tc-big-he-en-onnx | no disponible | no disponible | he → en | CC-BY-4.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-tc-big-he-en | no disponible | no disponible | he → en | CC-BY-4.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-he-en | no disponible | no disponible | he → en | CC-BY-4.0 | safetensors/PyTorch |

La diferencia principal frente al modelo base es el formato (ONNX int8 frente a PyTorch) y el público objetivo (navegador frente a servidor con Python). Frente a la variante estándar `opus-mt-he-en`, la versión "tc-big" está entrenada con más datos y suele ofrecer mejor calidad, aunque no se dispone de métricas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única dirección de traducción (hebreo a inglés); no traduce a la inversa ni a otros idiomas.
- Riesgo de alucinación y de traducciones inexactas en textos con jerga, nombres propios o dominios especializados, habitual en modelos de traducción entrenados sobre corpus generales.
- La cuantización int8 puede introducir una ligera pérdida de calidad frente a los pesos originales en precisión completa.
- No se documentan sesgos específicos, pero al derivar de corpus OPUS puede heredar sesgos de dominio y de género presentes en los datos paralelos.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es obligatorio citar al autor original (Helsinki-NLP / Tiedemann et al.).
- El autor indica que todo el mérito del modelo corresponde a Helsinki-NLP; esta exportación es un artefacto derivado y no cuenta con validación oficial del grupo original.
- No apta para tareas generativas, de razonamiento o de instrucciones; su uso en producción debe limitarse a traducción hebreo-inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sivelsguy/opus-mt-tc-big-he-en-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-he-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- transformers.js: https://github.com/huggingface/transformers.js
