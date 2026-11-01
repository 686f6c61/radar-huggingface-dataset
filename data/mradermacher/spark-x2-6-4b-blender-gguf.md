# mradermacher/Spark-X2.6-4B-Blender-GGUF

## Resumen

Spark-X2.6-4B-Blender-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo hotocooo/Spark-X2.6-4B-Blender, realizadas por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un LLM de aproximadamente 4.100 millones de parámetros (4.112.079.360 según los safetensors) especializado en generación de código para Blender, concretamente scripts que utilizan la API bpy para modelado 3D, retopología, topología de mallas y anatomía.

El modelo se ha entrenado mediante un full-finetune sobre los datasets FreedomIntelligence/BlendNet y YipengGao/3DCode, lo que lo orienta a tareas de generación de código 3D y automatización de flujos de trabajo en Blender. Esta versión cuantizada permite ejecutar el modelo en hardware de consumo gracias a formatos que van desde 1,9 GB (Q2_K) hasta 8,3 GB (f16).

Es relevante para desarrolladores técnicos y artistas técnicos (technical artists) que desean automatizar tareas repetitivas en Blender mediante lenguaje natural o generación de scripts Python, ejecutando el modelo localmente sin depender de APIs de pago.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no disponible el detalle exacto) |
| Parametros totales | 4.112.079.360 (4,11 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors originales) |

## Arquitectura y entrenamiento

El modelo base, Spark-X2.6-4B-Blender, es un modelo de tipo transformer de unos 4,11 B de parametros que ha sido sometido a un full-finetune (ajuste fino completo de todos los pesos, no LoRA) especializado en el dominio de Blender y la API bpy. Los datos de entrenamiento proceden de dos datasets publicos: FreedomIntelligence/BlendNet, centrado en tareas de comprension y generacion de codigo para Blender, y YipengGao/3DCode, orientado a codigo relacionado con 3D. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion detallada del corpus ni el uso de tecnicas de alineacion como RLHF o DPO.

La version aqui descrita es una coleccion de cuantizaciones estaticas en GGUF realizadas por mradermacher a partir de los pesos originales en safetensors. No se han publicado cuantizaciones weighted/imatrix por parte del autor en el momento de redaccion de la ficha. La conversion se realizo desde el formato HF (convert_type: hf).

## Capacidades

- Generacion de codigo Python para Blender mediante la API bpy.
- Tareas de modelado 3D asistido por codigo: creacion y manipulacion de mallas.
- Retopologia y topologia: generacion de scripts para reconstruccion de mallas.
- Conocimiento especializado en anatomia aplicada al modelado 3D.
- Generacion de codigo general (code-generation) heredada del modelo base.
- Interaccion conversacional (tag conversational), util para flujos iterativos de creacion de scripts.
- Capacidades multilingues: limitadas al ingles; no hay soporte declarado para castellano.

## Casos de uso

- Automatizacion de tareas repetitivas en Blender: generar scripts bpy que creen escenas, materiales o geometrias parametricas a partir de instrucciones en lenguaje natural.
- Retopologia asistida: obtener codigo que reorganice la topologia de mallas de alta densidad para animacion o impresion 3D.
- Apoyo a technical artists: generar rapidamente operadores y addons de Blender sin dominar a fondo la API bpy.
- Prototipado de geometria anatomica: generar scripts para construir modelos con topologia adecuada para personajes, aprovechando el entrenamiento en anatomia.
- Integracion en pipelines 3D: insertar el modelo en flujos automatizados que generen y ejecuten scripts de Blender en lote (batch rendering, generacion procedural).
- Asistente de aprendizaje de la API bpy: explicar y generar ejemplos de codigo para desarrolladores que se inician en scripting de Blender.
- Ejecucion local y offline: gracias al formato GGUF y a su tamano reducido (2-4,5 GB segun cuant), se puede usar sin conexion en estaciones de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion:
  - Q2_K: ~1,9 GB
  - Q4_K_M: ~2,7 GB
  - Q6_K: ~3,5 GB
  - Q8_0: ~4,5 GB
  - f16: ~8,3 GB
- Al ser un modelo de 4,11 B, con una cuantizacion Q4_K_M cabe comodamente en GPUs de consumo modestas (por ejemplo, una RTX 3060 de 8 GB o superior) e incluso puede ejecutarse solo con CPU y RAM si se dispone de al menos 4-6 GB libres.
- GPU recomendadas: cualquier GPU moderna con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090 para altas velocidades). No se requieren A100 ni H100 para inferencia.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers, vLLM o TGI.
- Latencia y throughput: no disponible; al ser un modelo de ~4 B en GGUF se espera inferencia fluida en GPU de consumo y velocidades aceptables en CPU moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Formato | Licencia |
|---|---|---|---|---|
| Spark-X2.6-4B-Blender-GGUF (esta ficha) | 4,11 B | Codigo Blender/bpy, 3D | GGUF (2-8,3 GB) | Apache 2.0 |
| Qwen2.5-Coder-7B-Instruct | 7 B | Codigo general | Safetensors, GGUF comunitarios | Apache 2.0 |
| CodeLlama-7B-Instruct | 7 B | Codigo general | Safetensors, GGUF comunitarios | Llama 2 Community License |
| DeepSeek-Coder-V2-Lite (MoE) | 16 B (2,4 B activos) | Codigo general | Safetensors, GGUF comunitarios | Licencia propia DeepSeek |

Frente a los modelos de codigo general, Spark-X2.6-4B-Blender ofrece un enfoque de nicho (Blender/bpy) con un footprint mucho menor, a costa de un rendimiento probablemente inferior en tareas de codigo fuera de su dominio. No hay benchmarks publicos que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion estrecha: el full-finetune en Blender/3D puede degradar el rendimiento en tareas generales de razonamiento, matematicas o codigo no relacionado con 3D.
- Idioma: entrenado para ingles; el rendimiento en castellano no esta garantizado y puede ser notablemente inferior.
- Longitud de contexto: no publicada; conviene verificarla antes de usarlo con scripts largos o conversaciones extensas.
- Riesgo de alucinacion: como todo LLM, puede generar codigo bpy con funciones inexistentes o APIs obsoletas de Blender; el codigo generado debe revisarse y probarse siempre.
- No hay benchmarks publicos, por lo que la calidad real frente a otros modelos es dificil de evaluar objetivamente.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque los datasets de entrenamiento (BlendNet, 3DCode) pueden tener sus propias consideraciones.
- Se trata de cuantizaciones estaticas; no hay versiones imatrix disponibles, por lo que las cuants de gama baja (Q2_K, Q3_K) pueden perder calidad apreciable.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/mradermacher/Spark-X2.6-4B-Blender-GGUF
- Modelo base: https://huggingface.co/hotocooo/Spark-X2.6-4B-Blender
- Dataset BlendNet: https://huggingface.co/datasets/FreedomIntelligence/BlendNet
- Dataset 3DCode: https://huggingface.co/datasets/YipengGao/3DCode
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Spark-X2.6-4B-Blender-GGUF
- FAQ / solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
