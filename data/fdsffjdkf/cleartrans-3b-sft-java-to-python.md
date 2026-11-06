# fdsffjdkf/ClearTrans-3B-SFT-Java-to-Python

## Resumen

ClearTrans-3B-SFT-Java-to-Python es un checkpoint de ajuste fino supervisado (SFT) sobre Qwen/Qwen2.5-Coder-3B, especializado en la traduccion de codigo fuente de Java a Python. Lo publica el usuario fdsffjdkf como parte del artefacto ClearTrans, cuyo codigo de implementacion y replicacion esta disponible en el repositorio GitHub del proyecto. El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-Coder-3B, con 3.085.938.688 parametros totales (aproximadamente 3,09 mil millones) y pesos en formato safetensors.

El modelo resuelve un problema acotado y bien definido: la traduccion automatica de codigo entre lenguajes, en este caso una unica direccion (Java a Python). No es un modelo de proposito general ni un checkpoint final de RL: la propia model card indica que se trata de una etapa SFT y que no se ha validado la inferencia en GPU ni la reproduccion de benchmarks para esta release.

Su relevancia es la de un artefacto de investigacion reproducible: pesos completos, metadatos de entrenamiento exportados y una licencia de investigacion (Qwen Research License Agreement) que restringe el uso comercial. La ficha se limita a documentar lo que el autor declara; no hay datos publicados de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino completo sobre Qwen2.5-Coder-3B |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card solo documenta pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (orientado a codigo Java y Python; no se declaran idiomas naturales) |
| Licencia | Qwen Research License Agreement (licencia de investigacion, no comercial) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 6,8 GB |
| Modelo base | Qwen/Qwen2.5-Coder-3B |
| Etapa de entrenamiento | SFT (supervised fine-tuning) |
| Direccion de traduccion | Java a Python |
| Version de Transformers registrada | 4.57.1 |
| Version de PyTorch registrada | 2.9.1 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-3B: un transformer decoder-only denso de 3,09 mil millones de parametros. El ajuste fino es completo (full SFT), no LoRA ni adaptadores, segun se deduce de los metadatos de entrenamiento y del tamano del repositorio (6,8 GB, coherente con pesos completos en precision de entrenamiento). No se documentan innovaciones arquitectonicas propias: el checkpoint hereda la atencion y el tokenizador del modelo base, e incluye la plantilla de chat original.

Los hiperparametros exportados del entrenamiento son: learning rate 1e-05, cosine scheduler, optimizador adamw_torch_fused con betas (0,9; 0,999) y epsilon 1e-08, 3 epocas, batch total de 64 (batch 1 por dispositivo, 8 dispositivos, 8 pasos de acumulacion de gradiente), semilla 42 y tipo de entrenamiento multi-GPU. El dataset se identifica como `train_full_1231_java2python_idx3`, de direccion especifica, pero no se incluye en el repositorio ni se verifica su procedencia; tampoco se publica el numero de tokens de entrenamiento ni la composicion del corpus. No consta RLHF ni DPO: el autor advierte explicitamente que este checkpoint no debe interpretarse como un modelo final entrenado con GRPO.

## Capacidades

- Traduccion de codigo Java a Python como tarea principal y unica direccion declarada.
- Generacion de texto condicionada por la plantilla de chat incluida (pipeline text-generation, etiqueta conversational).
- Razonamiento sobre codigo heredado del modelo base Qwen2.5-Coder-3B, sin garantia de que el ajuste fino preserve las capacidades generales del base.
- Soporte de tool calling / function calling: no declarado en la model card.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades multilingues: no declaradas; el entrenamiento se centra en dos lenguajes de programacion.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Migracion de bases de codigo legacy: traducir modulos Java a Python de forma asistida para reducir el trabajo manual en proyectos de reescritura, revisando siempre el resultado con la suite de tests del proyecto.
- Generacion de prototipos en Python a partir de implementaciones Java existentes: obtener una primera version funcional en Python de algoritmos ya validados en Java, que despues se refina a mano.
- Creacion de pares de datos paralelos Java-Python: usar el modelo para producir traducciones candidatas que, tras validacion, alimenten corpus de entrenamiento o evaluacion de otros traductores de codigo.
- Investigacion en traduccion automatica de codigo: el checkpoint SFT sirve como linea base reproducible frente a la que comparar etapas posteriores (por ejemplo, GRPO) del mismo proyecto ClearTrans.
- Apoyo a equipos con doble stack Java/Python: generar equivalentes en Python de utilidades Java internas (parseadores, helpers) para mantener paridad funcional entre servicios.
- Educacion y revision de codigo: comparar una implementacion Java con su traduccion Python propuesta para explicar diferencias idiomaticas entre ambos lenguajes, con supervision humana.
- Integracion en pipelines de CI como paso opcional de generacion de borradores: el modelo puede invocarse via transformers y TGI (la model card incluye la etiqueta text-generation-inference), con validacion obligatoria de tests antes de aceptar cualquier salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no se atribuye ninguna puntuacion de benchmark a este checkpoint y que la inferencia en GPU y la reproduccion de benchmarks no han sido validadas para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,09 B parametros, en bf16/fp16 se requieren aproximadamente 6,2 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa, no publicada por el autor).
- Cuantizacion: el autor no publica variantes cuantizadas; habria que generarlas (por ejemplo, con llama.cpp o GPTQ) a partir de los safetensors.
- GPU recomendadas: el modelo cabe en GPUs de consumo con 8-12 GB de VRAM en bf16 (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080) y con holgura en RTX 4090, A100 o H100 para lotes mayores.
- Despliegue: transformers (version registrada 4.57.1) es la via documentada; las etiquetas del repositorio incluyen text-generation-inference y endpoints_compatible, lo que sugiere compatibilidad con TGI. vLLM, llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClearTrans-3B-SFT-Java-to-Python | 3,09 B | No disponible | Traduccion Java a Python (SFT) | Qwen Research License (no comercial) | Hugging Face, pesos safetensors |
| Qwen/Qwen2.5-Coder-3B | 3,09 B | No disponible en esta ficha | Generacion de codigo general | Qwen Research / Apache segun variante (no verificado aqui) | Hugging Face |
| Otros traductores de codigo Java-Python de ~3 B | No disponible | No disponible | Traduccion entre lenguajes | No disponible | No disponible |

La comparacion cuantitativa con alternativas no es posible: no hay benchmarks publicados para este checkpoint ni se dispone de datos verificados de modelos equivalentes de traduccion Java-Python en la informacion proporcionada.

## Limitaciones y advertencias

- Las traducciones generadas pueden contener errores funcionales y code smells; el autor exige evaluar las salidas con los tests y herramientas de analisis previstos antes de confiar en ellas.
- Licencia Qwen Research License Agreement: uso limitado a investigacion o evaluacion no comercial; no se relicencia bajo MIT ni Apache-2.0.
- Checkpoint SFT, no final: no hay evidencia de que sea el resultado de un entrenamiento GRPO ni de que reproduzca los resultados del articulo asociado.
- Inferencia en GPU y reproduccion de benchmarks no validadas para esta release; solo se verificaron tamano de ficheros, disposicion de tensores e indices de shards.
- No se incluyen datos de entrenamiento, estados del optimizador ni salidas de evaluacion historicas en el repositorio.
- Sesgos conocidos: no documentados; al derivar de Qwen2.5-Coder-3B, puede heredar los sesgos del modelo base, no evaluados aqui.
- Riesgo de alucinacion: no cuantificado; en traduccion de codigo se manifiesta como APIs inventadas o semantica incorrecta.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara en la informacion disponible y no se documentan idiomas naturales soportados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Fecha de creacion registrada en 2026-11-02; conviene verificar la vigencia de los metadatos antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fdsffjdkf/ClearTrans-3B-SFT-Java-to-Python
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Repositorio de implementacion y replicacion: https://github.com/Xingzhehu/ClearTrans
- Licencia (incluida en el repositorio): LICENSE del modelo en Hugging Face
- Atribucion y declaracion de modificaciones: NOTICE del modelo en Hugging Face
