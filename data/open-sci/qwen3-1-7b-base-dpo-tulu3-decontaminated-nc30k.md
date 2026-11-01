# open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-nc30k

## Resumen

El modelo `open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-nc30k` es un ajuste fino supervisado (SFT) completo de la familia Qwen3, desarrollado por el colectivo open-sci. Parte del checkpoint `ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated`, que a su vez encadena un DPO sobre Tulu3 con Qwen3-1.7B-Base. El resultado es un modelo de 1.720.050.688 parámetros (aproximadamente 1,7 mil millones) orientado a generación de texto conversacional.

El problema que aborda es la adaptación de un modelo base pequeño de Qwen3 a un formato de instrucciones y razonamiento paso a paso mediante un dataset derivado de Nemotron-Cascade-SFT-Stage-1, concretamente la variante de 30 000 ejemplos ShareGPT con preprocesado de "thinking". Se trata, por tanto, de un experimento de destilación de estilo de razonamiento sobre una base ya alineada con DPO, en lugar de un modelo de producción con garantías publicadas.

Su relevancia es acotada: es un checkpoint de investigación generado automáticamente por el Trainer de Hugging Face, con documentación mínima, sin resultados de evaluación declarados y con licencia "other". Resulta útil como referencia para quienes exploran pipelines de SFT con Llama Factory y decodificación especulativa sobre Qwen3, pero no como modelo listo para despliegue sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), pesos en safetensors |
| Parametros totales | 1.720.050.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B-Base; no confirmada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (repo de 3,5 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3 con 1,72 mil millones de parámetros, heredada del checkpoint base de Qwen3-1.7B. No se documenta en la model card ninguna modificación estructural respecto al base: no hay mezcla de expertos, ni atención lineal, ni capas SSM. El modelo se distribuye únicamente en safetensors, sin versiones cuantizadas oficiales.

El entrenamiento es un SFT completo (no LoRA) ejecutado con Llama Factory sobre el dataset `/gpfs/scratch/ehpc524/ot/datasets/Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf_thinking_preprocessed`, una variante de 30 000 ejemplos en formato ShareGPT con preprocesado de trazas de razonamiento. Los hiperparámetros declarados son: learning rate 4e-05, batch total de 128 (batch 1 por dispositivo, 4 pasos de acumulación, 32 dispositivos), 5 épocas, optimizador AdamW fused con betas (0.9, 0.999), scheduler coseno con warmup del 10 % y semilla 42. Se usaron Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta RLHF, DPO adicional ni verificación de contaminación en esta etapa, pese a que el nombre del checkpoint base incluye "decontaminated".

## Capacidades

- Generación de texto conversacional multi-turno en formato instrucciones.
- Razonamiento paso a paso en estilo "thinking", inducido por el preprocesado del dataset Nemotron-Cascade.
- Respuesta a instrucciones en formato ShareGPT, adecuado para pipelines de chat.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Soporte de tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado.
- Capacidades multilingües: no documentadas.
- Visión, audio o modalidades adicionales: no disponibles.

## Casos de uso

- Experimentación académica en destilación de razonamiento: el modelo sirve para estudiar cómo un SFT de 30 000 ejemplos con trazas de pensamiento modifica el comportamiento de un Qwen3-1.7B ya pasado por DPO, comparando checkpoints intermedios.
- Evaluación de pipelines Llama Factory: al haberse generado con esta herramienta, es un caso de referencia para reproducir configuraciones de SFT completo con 32 GPUs y batch efectivo de 128.
- Generación de texto en prototipos de bajo coste: con 1,7 mil millones de parámetros, cabe en GPUs de consumo para pruebas de chat y generación de respuestas cortas.
- Base para nuevos ajustes: al ser un checkpoint intermedio, puede servir como punto de partida para DPO, RLHF o SFT específico de dominio en proyectos de investigación.
- Análisis de sesgos y alucinación en modelos pequeños alineados: útil como sujeto de estudio en trabajos que comparan modelos de menos de 2B parámetros.
- Despliegue en entornos con restricciones de memoria: su tamaño permite servir inferencia en una sola GPU consumer, aunque sin garantías de calidad documentadas.

## Benchmarks y rendimiento

El model-index declara una entrada (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__Qwen3-1-7B-0acf773e__sdpa-qwen3-step-fdedd61a`) con la lista de resultados vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: A100 o H100 para entrenamiento o serving de alto throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia en fp16 con comodidad.
- Cabe en GPUs de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y superiores; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp tras conversión manual a GGUF; no hay artefactos oficiales para Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-nc30k | 1,72 B | no disponible | other | Hugging Face, 158 descargas |
| ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated (base) | 1,72 B | no disponible | no disponible en la informacion | Hugging Face |
| Qwen3-1.7B-Base (original) | 1,72 B | no disponible en la informacion | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card es autogenerada por el Trainer y no describe usos previstos, datos de evaluación ni limitaciones.
- Sin benchmarks: no hay evidencia publicada de calidad, razonamiento o robustez frente al modelo base.
- Licencia "other": no se especifican términos de uso comercial; es imprescindible revisar las condiciones del checkpoint base y de Qwen3 antes de cualquier despliegue productivo.
- Riesgo de alucinación: inherente a modelos de 1,7B parámetros y no mitigado de forma documentada en este ajuste.
- Sesgos: no evaluados ni declarados por el autor.
- Idiomas: no se especifica qué lenguas cubre el SFT; el dataset Nemotron-Cascade está orientado a inglés en su mayoría, por lo que el rendimiento en castellano es incierto.
- Contexto: no se confirma la longitud de ventana efectiva tras el ajuste; asumir la del Qwen3-1.7B-Base sin verificación es arriesgado.
- Checkpoint de investigación: 0 likes y 158 descargas sugieren escasa validación por parte de la comunidad.
- Nombre del checkpoint base con "decontaminated": no se aporta evidencia del proceso de decontaminación en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated-nc30k
- Checkpoint base: https://huggingface.co/ali-elganzory/Qwen3-1.7B-Base-DPO-Tulu3-decontaminated
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset Nemotron-Cascade-SFT-Stage-1 (referencia, no enlazado en la model card): no disponible
- Paper o blog del autor: no disponible
