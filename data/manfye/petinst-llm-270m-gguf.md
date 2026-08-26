# manfye/PetInst-LLM-270M-GGUF

## Resumen

PetInst-LLM-270M es un modelo de lenguaje compacto de 268 millones de parámetros, desarrollado por el usuario manfye como un ajuste fino (fine-tuning) del modelo base google/functiongemma-270m-it de Google. Está diseñado específicamente para entornos on-device, con especial énfasis en el uso de herramientas (tool use) y la llamada a funciones (function calling), así como para aplicaciones de asistente conversacional en el ámbito de mascotas virtuales. El modelo se distribuye en formato GGUF, lo que facilita su ejecución con llama.cpp y otros motores compatibles, y su licencia es Gemma, que permite uso comercial bajo ciertas condiciones.

La relevancia de este modelo radica en su tamaño extremadamente reducido, que lo hace apto para dispositivos con recursos limitados, manteniendo al mismo tiempo capacidades de razonamiento y ejecución de herramientas gracias a su base FunctionGemma. Su acceso es restringido (gated), por lo que los usuarios deben aceptar las condiciones de licencia en HuggingFace antes de poder descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Gemma 3 270M (decoder-only) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de FunctionGemma 270M, típicamente 8192 tokens) |
| Tipos de cuantizacion | GGUF (no se especifican variantes concretas en la ficha) |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma (sujeta a condiciones de uso de Google) |
| Formato de pesos | GGUF (cuantizado, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de google/functiongemma-270m-it, que a su vez se basa en la arquitectura Gemma 3 270M de Google. Esta arquitectura es un transformer decoder-only con aproximadamente 270 millones de parámetros, optimizado para eficiencia energética y despliegue en dispositivos de baja capacidad. FunctionGemma añade capacidades específicas de function calling y tool use, lo que permite al modelo generar llamadas estructuradas a APIs y ejecutar tareas basadas en herramientas.

El proceso de entrenamiento de PetInst-LLM-270M consiste en un ajuste fino (fine-tuning) sobre FunctionGemma, presumiblemente con datos orientados a interacciones de mascotas virtuales y conversaciones con uso de herramientas. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de las heredadas del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles.
- Llamada a funciones (function calling) y uso de herramientas (tool use), heredado de FunctionGemma.
- Ejecucion en dispositivos con recursos limitados (on-device) gracias a su tamano reducido.
- Interacciones de tipo asistente para mascotas virtuales, segun los tags del repositorio.
- Compatible con pipelines de generacion de texto estandar de HuggingFace.
- No se documentan capacidades de vision, audio ni modos de razonamiento extendido.

## Casos de uso

- Asistente conversacional para aplicaciones de mascotas virtuales: el modelo puede mantener dialogos contextuales y ejecutar acciones mediante funciones, como alimentar, jugar o consultar el estado de la mascota.
- Automatizacion de tareas en dispositivos IoT: gracias a su tamano y soporte de function calling, puede integrarse en asistentes locales para controlar dispositivos del hogar con comandos de voz o texto.
- Chatbots de atencion al cliente en entornos con baja latencia: su ejecucion en CPU o GPU de gama baja permite responder consultas frecuentes sin depender de la nube.
- Prototipado rapido de agentes con herramientas: ideal para desarrolladores que necesitan un modelo ligero para probar pipelines de tool use antes de escalar a modelos mayores.
- Educacion y experimentacion en IA on-device: sirve como base para ensenar tecnicas de fine-tuning y cuantizacion en entornos academicos.
- Asistentes de productividad personal: puede integrarse en aplicaciones de escritorio o moviles para gestionar calendarios, recordatorios o busquedas mediante funciones externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo especifico.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 268M parametros en GGUF, la inferencia puede ejecutarse en CPU con menos de 1 GB de RAM, o en GPU con menos de 1 GB de VRAM en cuantizaciones bajas (Q4_K_M o inferiores).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas como Intel Iris Xe) es suficiente. Tambien funciona bien en CPU.
- Compatible con consumer GPU: si, es adecuado para GPUs de gama baja y tambien para Raspberry Pi 5 u otros dispositivos ARM con suficiente RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime que soporte GGUF. Tambien puede cargarse con transformers si se convierte a safetensors, aunque el formato nativo es GGUF.
- Latencia y throughput: no se dispone de mediciones publicadas, pero por su tamano se espera una generacion de decenas de tokens por segundo en CPU moderna y cientos en GPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Como referencia, se puede comparar con su base FunctionGemma 270M y con Gemma 3 270M, ambos de Google, que comparten arquitectura y tamano. La diferencia principal es que PetInst-LLM-270M esta ajustado para el dominio de mascotas virtuales y se distribuye en GGUF, mientras que los modelos base estan disponibles en safetensors. No hay datos de rendimiento relativos entre ellos.

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| PetInst-LLM-270M | 268M | no disponible | GGUF | Gemma | Mascotas virtuales + tool use |
| google/functiongemma-270m-it | 268M | 8192 (tipico) | safetensors | Gemma | Function calling general |
| google/gemma-3-270m | 268M | 8192 | safetensors | Gemma | Instrucciones generales |

## Limitaciones y advertencias

- Sesgos: al estar entrenado sobre datos en ingles y con un dominio especifico, puede presentar sesgos culturales o limitaciones en otros idiomas.
- Riesgo de alucinacion: como todo modelo pequeno, puede generar respuestas incorrectas o inventar funciones inexistentes al llamar a herramientas.
- Limitaciones de contexto: la longitud de contexto no esta documentada, pero se hereda probablemente de FunctionGemma (8192 tokens), lo que limita dialogos muy largos.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones para ciertos usos comerciales y la obligacion de mantener los avisos de atribucion. Ademas, el acceso al modelo es restringido y requiere aceptar los terminos en HuggingFace.
- Dominio limitado: el ajuste fino para mascotas virtuales puede degradar el rendimiento en tareas generales fuera de ese ambito.
- Formato GGUF: aunque es conveniente para despliegue, puede no ser compatible con todos los frameworks (por ejemplo, TensorFlow o JAX requieren conversion previa).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/manfye/PetInst-LLM-270M-GGUF
- Modelo base FunctionGemma 270M: https://huggingface.co/google/functiongemma-270m-it
- Modelo base Gemma 3 270M: https://huggingface.co/google/gemma-3-270m
