# Piyush00023/coffy-3.2-flash

## Resumen

coffy-3.2-flash es un ajuste fino de tipo instructivo del modelo Qwen/Qwen3-8B, publicado por el usuario Piyush00023 en Hugging Face. Se presenta como un asistente de 8B de parametros con una identidad propia ("coffy") y respuestas directas, sin bloques de razonamiento extendido. El modelo conserva la arquitectura densa original de Qwen3 (Qwen3ForCausalLM) y se distribuye como checkpoint completo en bf16, con los pesos del adaptador LoRA ya fusionados en los pesos base.

La adaptacion se realizo mediante un LoRA de rango 16 y alpha 32 sobre todas las proyecciones lineales, con aproximadamente 43,6 millones de parametros entrenables (0,53 % del total). El resultado es un checkpoint de 8.234.382.336 parametros (8,23B) que se ejecuta sin codigo personalizado en transformers, vLLM, SGLang y llama.cpp, y que emplea una plantilla de chat que fuerza la ruta no-thinking de Qwen3.

Su relevancia es limitada pero concreta: sirve como ejemplo de derivado ligero y de bajo coste sobre una base abierta Apache-2.0, util para experimentar con personalizacion de identidad y respuestas directas en un modelo de 8B que cabe en GPU de consumo. No obstante, el autor no aporta evaluaciones publicas de rendimiento y el modelo acumula muy pocas descargas, por lo que debe tratarse como un artefacto experimental y no como una alternativa validada a Qwen3-8B oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (decoder denso, transformer causal con RoPE) |
| Parametros totales | 8.234.382.336 (8,23B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible en la model card; al ser un checkpoint bf16 estandar de Qwen3 es convertible a GGUF/AWQ/GPTQ con herramientas habituales |
| Idiomas soportados | ingles y codigo (segun metadatos); herencia multilingue de Qwen3-8B no documentada en esta ficha |
| Licencia | Apache-2.0 (pesos abiertos) |
| Formato de pesos | safetensors (bf16, 4 shards, 16,38 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder denso estandar de Qwen3: atencion causal con RoPE, atencion con Grouped Query Attention (32 cabezas de query y 8 de key/value), vocabulario BPE de 151.936 tokens y 32.768 tokens de contexto nativo. No incorpora innovaciones arquitectonicas propias; toda la capa de adaptacion es un LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones lineales, con unos 43,6 millones de parametros entrenables, que posteriormente se fusiona en los pesos base para producir un checkpoint autonomo en bf16.

El autor no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card indica unicamente que el adaptador se entreno con ejemplos de identidad e instrucciones generales, y que la plantilla de chat fuerza respuestas directas eliminando los bloques de pensamiento de Qwen3. No se documentan procesos de decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles con respuestas directas y sin cadena de pensamiento visible.
- Seguimiento de instrucciones generales (redaccion, resumen, reescritura) heredado de Qwen3-8B.
- Generacion de codigo y tareas ligeras de programacion, segun los tags del repositorio y la validacion mencionada por el autor.
- Razonamiento matematico basico, validado de forma cualitativa por el autor pero sin metricas publicadas.
- Soporte de tool calling y function calling: no documentado en la model card; la herencia de Qwen3-8B lo hace plausible, pero no esta verificado en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas y probablemente degradadas al haberse forzado la ruta no-thinking.
- Capacidades multilingues: los metadatos declaran solo ingles y codigo; el resto de idiomas de Qwen3-8B no se garantiza tras el ajuste.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modo thinking se elimina explicitamente mediante la plantilla de chat.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo responde de forma directa y con una identidad definida, lo que facilita demos y pruebas de concepto de chatbots sin coste de API.
- Generacion de borradores y reescritura de textos: con 32.768 tokens de contexto puede procesar documentos medianos completos y producir resumenes o variaciones estilisticas en una sola pasada.
- Asistencia ligera a programacion: generacion de fragmentos de codigo, explicaciones de funciones y sugerencias de refactorizacion en entornos de desarrollo integrado, aprovechando la herencia de Qwen3-8B en codigo.
- Personalizacion de marca o personaje: al estar ajustado para una identidad concreta, sirve como plantilla para estudiar como un LoRA de rango 16 modifica el tono y la autopresentacion de un modelo base.
- Experimentacion academica con ajustes LoRA: el checkpoint fusionado permite comparar directamente el comportamiento del base Qwen3-8B frente al derivado sin necesidad de cargar adaptadores por separado.
- Inferencia local en hardware de consumo: al ser un denso de 8B en bf16, puede ejecutarse cuantizado en GPU de gama alta para tareas de asistencia personal sin conexion.
- Evaluacion de tecnicas de eliminacion de thinking: util para medir el impacto de forzar respuestas directas sobre la calidad en tareas de razonamiento, comparando con la ruta thinking de Qwen3-8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no reclama puntuaciones publicas y recomienda ejecutar evaluaciones propias antes de usar el modelo en produccion.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos, viable en GPU de 16 GB con contexto limitado.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 4,5-5 GB de pesos, viable en GPU de 8 GB con contexto reducido.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bf16; RTX 4080, 4070 Ti o 3090 para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 con contexto ajustado, y en GPUs de 8-16 GB mediante cuantizacion GGUF o AWQ.
- Opciones de despliegue: transformers, vLLM, SGLang, llama.cpp y TGI (el repositorio incluye el tag text-generation-inference); Ollama es viable convirtiendo previamente a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| coffy-3.2-flash | 8,23B | 32.768 | Apache-2.0 | Ajuste LoRA de identidad sobre Qwen3-8B; sin benchmarks publicados |
| Qwen/Qwen3-8B | 8,2B | 32.768 (ampliable) | Apache-2.0 | Modelo base oficial, con modo thinking y no-thinking, evaluaciones publicadas por el autor |
| Meta Llama 3.1 8B Instruct | 8,03B | 131.072 | Llama 3.1 Community License | Contexto mucho mayor; licencia con restricciones de uso comercial y de nombre |
| Mistral 7B Instruct v0.3 | 7,25B | 32.768 | Apache-2.0 | Alternativa densa de tamano similar, ampliamente desplegada y con ecosistema maduro |

## Limitaciones y advertencias

- El autor reconoce que el modelo no es de calidad frontera y que comete errores en razonamiento complejo.
- Hereda el corte de conocimiento, los sesgos y las limitaciones de Qwen3-8B, incluidos los sesgos de sus datos de entrenamiento originales.
- Riesgo de alucinacion: no se ha realizado ninguna evaluacion de factualidad ni de calibracion sobre este ajuste.
- La plantilla de chat elimina el modo thinking, lo que puede degradar el rendimiento en matematicas, logica y tareas de varios pasos frente al Qwen3-8B original.
- El ajuste de identidad puede reducir la adherencia a instrucciones complejas o introducir respuestas estereotipadas del personaje "coffy".
- Idiomas: solo se declaran ingles y codigo; el comportamiento en castellano u otros idiomas no esta verificado.
- Licencia Apache-2.0 sobre los pesos, pero el repositorio no es un proyecto de codigo abierto: no se publican pipelines de entrenamiento ni herramientas derivadas, y el contenido se ofrece tal cual para inferencia.
- Uso previsto limitado a asistencia general, redaccion y codigo ligero; el autor desaconseja explicitamente aplicaciones medicas, legales, de seguridad o de alto riesgo.
- Madurez muy baja: 4 descargas y 0 likes en el momento de la consulta, sin issues ni validacion independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Piyush00023/coffy-3.2-flash
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Contacto del autor: piyushdas000@gmail.com
