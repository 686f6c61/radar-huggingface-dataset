# lugman/Qwen2.5-1.5B-KK-Guided-Matched-Student-Voice-v5-SFT

## Resumen

El modelo `Qwen2.5-1.5B-KK-Guided-Matched-Student-Voice-v5-SFT` es un ajuste fino (SFT) del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, publicado por el usuario lugman en Hugging Face. Se trata de un transformer decoder-only de la familia Qwen2.5 con 1.543.714.304 parámetros totales, derivado de la variante Instruct de 1.5B de parámetros desarrollada originalmente por Alibaba Qwen. El ajuste se ha realizado con la librería Unsloth y TRL de Hugging Face, según indica el autor en la model card.

El nombre del repositorio sugiere un entrenamiento orientado a respuestas de voz o diálogo guiado ("Guided-Matched-Student-Voice-v5-SFT"), aunque la model card no documenta el dataset, el procedimiento de entrenamiento ni los objetivos concretos. El modelo se distribuye con licencia Apache 2.0 y está etiquetado únicamente para inglés, con soporte para text-generation y compatibilidad con endpoints de Hugging Face.

Su relevancia práctica es limitada: se trata de un fine-tune de un modelo pequeño (1.5B) con cero descargas y cero likes en el momento de la ficha, sin benchmarks publicados ni documentación técnica detallada. Resulta útil como punto de partida para experimentación con fine-tuning ligero o como referencia de un pipeline Unsloth sobre Qwen2.5, pero no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | no disponible en la model card; al estar en safetensors se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parámetros. El modelo base `unsloth/Qwen2.5-1.5B-Instruct` es un modelo instructivo de Alibaba Qwen entrenado con datos multilingües y técnicas de alineación (SFT y preferencias). El fine-tune publicado por lugman parte de ese checkpoint y aplica un SFT adicional con Unsloth y TRL, según la model card.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales. El nombre del repositorio ("KK-Guided-Matched-Student-Voice-v5-SFT") sugiere una quinta iteración de un pipeline de destilación o ajuste guiado orientado a voz, pero no hay detalles técnicos publicados que permitan confirmarlo. Tampoco se especifica si se congelaron capas, qué hiperparámetros se usaron o qué estrategia de empaquetado (packing) se aplicó.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Instruct.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1.5B parámetros.
- Generación de código y matemáticas a nivel básico, sin garantías de calidad frente a modelos mayores.
- Soporte de tool calling y function calling: no documentado en la model card; el modelo base Qwen2.5-Instruct lo soporta, pero no hay confirmación de que el fine-tune lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card solo declara inglés, aunque el modelo base Qwen2.5 es multilingüe; el fine-tune puede haber degradado otros idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Experimentación con fine-tuning ligero: el modelo sirve como ejemplo reproducible de un pipeline Unsloth + TRL sobre Qwen2.5-1.5B, útil para desarrolladores que quieran replicar el flujo con sus propios datos.
- Prototipado de asistentes conversacionales en inglés: con 1.5B parámetros cabe en GPUs de consumo y permite iterar rápidamente en entornos de desarrollo sin grandes inversiones en infraestructura.
- Evaluación comparativa de fine-tunes: al ser un checkpoint pequeño y con licencia Apache 2.0, se puede usar como baseline en estudios de degradación o retención de capacidades tras SFT.
- Generación de texto en aplicaciones de bajo recursos: despliegue en CPU o GPU modesta para tareas de resumen, reescritura o clasificación generativa en inglés.
- Base para destilación o ajuste adicional: al estar en safetensors y con licencia permisiva, se puede continuar entrenando con LoRA/QLoRA para dominios específicos.
- Pruebas de integración con TGI y endpoints de Hugging Face: el tag `endpoints_compatible` permite desplegarlo en Inference Endpoints para validar pipelines de serving.
- Docencia y formación: ejemplo didáctico de cómo se publica un fine-tune en Hugging Face con model card mínima y licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 4-5 GB en total con contexto moderado).
- VRAM estimada en cuantización 8-bit: aproximadamente 1,6 GB para pesos.
- VRAM estimada en cuantización 4-bit (GGUF Q4_K_M): aproximadamente 1,0-1,2 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4, A100 y H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en fp16, y en GPUs con 4 GB usando cuantización 4-bit.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp (tras conversión a GGUF), Ollama (tras conversión) y Unsloth para inferencia acelerada.
- Latencia y throughput: no disponibles; al ser un modelo de 1.5B, se espera un throughput alto en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Guided-Matched-Student-Voice-v5-SFT | 1,54B | no disponible | Apache 2.0 | Hugging Face | Fine-tune sin benchmarks ni documentación |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, ModelScope | Modelo base oficial, con benchmarks publicados |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar, licencia más restrictiva |
| google/gemma-2-2b-it | 2,61B | 8.192 tokens | Gemma Terms of Use | Hugging Face, Kaggle | Algo mayor, con benchmarks publicados |

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede afirmar que el fine-tune mantenga o mejore las capacidades del modelo base.
- El modelo base Qwen2.5-1.5B-Instruct tiene un conocimiento limitado y una tendencia notable a la alucinación en tareas de razonamiento complejo, código y matemáticas.
- El fine-tune puede haber degradado capacidades del modelo base (olvido catastrófico), especialmente en tool calling, multilingüismo y contextos largos, al no documentarse la estrategia de entrenamiento.
- La model card solo declara inglés; el uso en castellano no está garantizado y probablemente produzca resultados pobres.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni validación externa.
- El nombre del repositorio sugiere un objetivo de voz que no se documenta; no se debe asumir que el modelo tiene capacidades de audio.
- No se especifica la longitud de contexto efectiva tras el fine-tune; podría haberse reducido respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Guided-Matched-Student-Voice-v5-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio TRL: https://github.com/huggingface/trl
