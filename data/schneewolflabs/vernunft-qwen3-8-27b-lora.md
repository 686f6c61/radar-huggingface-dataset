# schneewolflabs/Vernunft-Qwen3.8-27B-LoRA

## Resumen

Vernunft-Qwen3.8-27B-LoRA es un adaptador LoRA de 0,7 GB desarrollado por schneewolflabs, diseñado para ajustar el modelo base `DragonBophades/WichtelHui-Qwen3.8-27B-SLERP`, que a su vez es una fusión SLERP de la familia Qwen3.8-27B de Alibaba. El adaptador se presenta con el pipeline `image-text-to-text`, lo que sugiere capacidades multimodales, aunque el modelo base Qwen3.8-27B es conocido principalmente como un modelo de lenguaje denso de 27 000 millones de parámetros con atención híbrida, orientado a codificación agéntica y chat.

El entrenamiento se realizó con la herramienta Merlina de Schneewolf-Labs, en modo `POST_HOC_UPLOAD`, lo que indica que el adaptador se subió después del entrenamiento sin un proceso de validación adicional documentado. La relevancia de este modelo radica en su tamaño reducido (0,7 GB) que permite adaptar un modelo de 27B sin necesidad de reentrenar los pesos completos, facilitando su despliegue en entornos con recursos limitados. Sin embargo, la ausencia de documentación sobre el propósito específico del ajuste y la falta de métricas de rendimiento limitan su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.8-27B (modelo base SLERP) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 27B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se puede aplicar sobre cuantizaciones del base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base `DragonBophades/WichtelHui-Qwen3.8-27B-SLERP`, que es una fusión SLERP de modelos de la familia Qwen3.8-27B. Según la información pública de Qwen, Qwen3.8-27B es un modelo denso de 27 000 millones de parámetros con un backbone de atención híbrida, similar al utilizado en el modelo MoE de 2,4 billones de parámetros de la misma familia. El adaptador LoRA tiene un rango de 32, alpha de 64 y dropout de 0,05, y se aplica a los módulos `down_proj`, `q_proj`, `v_proj`, `o_proj`, `k_proj`, `up_proj` y `gate_proj`, cubriendo tanto las proyecciones de atención como las de la MLP.

El entrenamiento se realizó con la herramienta Merlina (disponible en GitHub) sobre una GPU NVIDIA GB10. El modo `POST_HOC_UPLOAD` indica que el adaptador se subió al repositorio después del entrenamiento, sin documentación adicional sobre el dataset, el número de pasos o el método de optimización. No se especifica si se utilizó RLHF, DPO u otra técnica de alineación.

## Capacidades

- Generacion de texto y razonamiento: al estar basado en Qwen3.8-27B, hereda las capacidades de generacion de texto, razonamiento y codificacion del modelo base, aunque el adaptador puede modificar el comportamiento.
- Soporte multimodal: el pipeline `image-text-to-text` sugiere que el modelo puede procesar entradas de imagen y texto, aunque no se detalla si el adaptador añade o modifica estas capacidades.
- Tool calling y agentes: el modelo base Qwen3.8-27B está orientado a agentes y codificacion, por lo que es probable que soporte tool calling, pero no hay confirmacion especifica para este adaptador.
- Conversacion: el tag `conversational` indica que el modelo está diseñado para dialogos multi-turno.
- Capacidades multilingues: no disponibles.

## Casos de uso

Dado que no se proporciona informacion especifica sobre el proposito del adaptador, los siguientes casos de uso son hipoteticos, basados en las capacidades del modelo base Qwen3.8-27B:

- Asistente de codificacion en entornos locales: el adaptador, combinado con el modelo base, podria desplegarse en una GPU consumer para ofrecer autocompletado y generacion de codigo en editores, aprovechando la ventana de contexto larga del modelo base (si esta disponible).
- Chat conversacional con contexto largo: gracias a la arquitectura de atencion hibrida, el modelo podria gestionar conversaciones multi-turno con historial extenso, aunque la longitud de contexto no esta confirmada.
- Razonamiento agéntico: el modelo base soporta agentes, por lo que el adaptador podria utilizarse en pipelines de automatizacion que requieran planificacion y ejecucion de tareas.
- Procesamiento de documentos con imagenes: si el adaptador mantiene las capacidades multimodales del pipeline, podria utilizarse para extraer informacion de capturas de pantalla o diagramas en documentacion tecnica.
- Fine-tuning rapido para dominios especificos: al ser un LoRA, se puede combinar con otros adaptadores para especializar el modelo en tareas concretas sin reentrenar el base.
- Prototipado de aplicaciones de IA: su tamaño reducido permite iterar rapidamente en entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador ni para el modelo base especifico.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 0,7 GB, pero el modelo base de 27B requiere VRAM adicional. En FP16, un modelo de 27B necesita aproximadamente 54 GB; con cuantizacion a 8 bits se reduce a ~27 GB y a 4 bits a ~14 GB.
- GPU recomendadas: para inferencia con el modelo base completo, se recomiendan GPUs con al menos 24 GB de VRAM (RTX 3090/4090, A5000) para cuantizacion 4 bits, o 48 GB (A6000, L40S) para 8 bits. Para FP16 se necesitan GPUs de datacenter como A100 o H100.
- Compatibilidad con consumer GPU: es posible ejecutar el modelo en GPUs consumer con cuantizacion (por ejemplo, RTX 4090 con 24 GB usando GGUF de 4 bits), pero no hay confirmacion de que el adaptador sea compatible con formatos GGUF.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con la libreria `transformers` de HuggingFace, o mediante servidores de inferencia como vLLM o TGI si soportan LoRA. Tambien se puede combinar con `llama.cpp` si se convierte el adaptador a formato GGUF, aunque no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El adaptador LoRA no tiene metricas publicadas y el modelo base es una fusion SLERP no oficial de Qwen3.8-27B. Como referencia, el modelo Qwen3.8-27B original de Alibaba tiene 27B parametros, una longitud de contexto de 256K tokens (segun la documentacion oficial) y licencia Apache 2.0, pero no se puede confirmar que el modelo base de este adaptador mantenga esas caracteristicas.

## Limitaciones y advertencias

- Licencia no disponible: el adaptador no especifica una licencia, lo que impide su uso comercial sin riesgo legal.
- Documentacion insuficiente: no se detalla el proposito del ajuste, el dataset de entrenamiento ni las metricas de rendimiento, lo que dificulta evaluar su calidad.
- Riesgo de alucinacion: al ser un modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Sesgos desconocidos: no se ha publicado informacion sobre sesgos o limitaciones eticas.
- Compatibilidad incierta: el adaptador se ha subido en modo `POST_HOC_UPLOAD`, lo que sugiere que no ha sido probado en produccion. No se garantiza que funcione correctamente con todas las versiones del modelo base.
- Dependencia del modelo base: el rendimiento final depende en gran medida de la calidad del modelo base `WichtelHui-Qwen3.8-27B-SLERP`, que no es un modelo oficial de Alibaba.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/schneewolflabs/Vernunft-Qwen3.8-27B-LoRA
- Herramienta Merlina (GitHub): https://github.com/Schneewolf-Labs/Merlina
- Modelo base (HuggingFace): https://huggingface.co/DragonBophades/WichtelHui-Qwen3.8-27B-SLERP
- Qwen3.8-27B en unsloth.ai: https://unsloth.ai/models/qwen3.8-27b
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
