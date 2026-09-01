# Jongbin-kr/llama-3.1-8b-instruct_lbox-statute_ffn-only

## Resumen

El modelo `Jongbin-kr/llama-3.1-8b-instruct_lbox-statute_ffn-only` es un ajuste fino (fine-tuning) del modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr. El nombre sugiere que el ajuste se ha realizado sobre un corpus de estatutos legales (statute) y que únicamente se han entrenado las capas feed-forward (ffn-only), una técnica de ajuste parcial que reduce el coste computacional y el riesgo de olvido catastrófico. El entrenamiento se llevó a cabo mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face.

El repositorio tiene un tamaño de 1,3 GB, lo que indica que no contiene el modelo completo de 8B parámetros en precisión completa, sino probablemente un adaptador o pesos parciales de las capas entrenadas. Aunque no se especifica la licencia, el modelo base de Meta tiene una licencia propia que restringe el uso comercial en algunos casos. Este modelo es relevante para experimentos de adaptación de LLMs a dominios legales específicos, aunque la documentación pública es muy escasa y no se han publicado métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8B (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K (modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Llama 3.1 8B Instruct. El entrenamiento se realizó con SFT (Supervised Fine-Tuning) usando la librería TRL, con el framework Transformers y PyTorch. El nombre "ffn-only" indica que solo se actualizaron los pesos de las capas feed-forward, dejando congeladas las capas de atención y otras. Esta estrategia es común para adaptar modelos a dominios específicos reduciendo el coste de entrenamiento y el riesgo de degradar las capacidades generales. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni el proceso de alineación adicional (no se menciona RLHF ni DPO).

## Capacidades

- Generación de texto y respuesta a instrucciones, heredadas del modelo base Llama 3.1 8B Instruct.
- Razonamiento y comprensión del lenguaje, con las limitaciones propias del modelo base.
- Posible especialización en terminología legal o estatutos, aunque no hay evidencia documentada.
- No se confirma soporte para tool calling, agentes, visión o audio en este ajuste específico.

## Casos de uso

- Asistencia legal básica: el modelo podría responder preguntas sobre estatutos o normativas si el corpus de entrenamiento incluyó dichos textos, aunque no hay garantía de precisión.
- Experimentación académica: útil para investigar técnicas de ajuste parcial (solo FFN) en modelos de 8B.
- Prototipado de chatbots especializados: se puede integrar en pipelines de generación de texto con Transformers.
- Análisis de documentos legales: podría resumir o extraer información de textos legales, pero sin validación.
- Fine-tuning adicional: al ser un adaptador ligero, puede servir como punto de partida para otros ajustes.
- Evaluación de metodologías de entrenamiento: permite comparar el rendimiento de un ajuste solo-FFN frente a un ajuste completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador o pesos parciales, el requisito de VRAM depende del modelo base sobre el que se cargue. Para Llama 3.1 8B en fp16 se necesitan aproximadamente 16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para inferencia cómoda.
- En consumer GPU, una RTX 3090 o 4090 puede ejecutar el modelo base con cuantización (por ejemplo, 4-bit) usando librerías como llama.cpp o bitsandbytes.
- Opciones de despliegue: Transformers con pipeline, vLLM, TGI, Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponibles para este ajuste específico; los valores del modelo base rondan decenas de tokens por segundo en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 (Meta) | Modelo base original |
| Jongbin-kr/llama-3.1-8b-instruct_lbox-casename-civil_ffn-only | 8B (base) | 128K (base) | no disponible | Ajuste similar, enfocado en nombres de casos civiles |
| Jongbin-kr/llama-3.1-8b-instruct-4x1-moe-lbox-lora-sft-5ep | 8B (base) | 128K (base) | no disponible | Variante MoE con LoRA, mismo autor |

No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No hay documentación sobre sesgos, alucinaciones o limitaciones específicas de este ajuste.
- La licencia no está especificada; el modelo base de Meta tiene restricciones de uso comercial que podrían aplicarse.
- El tamaño del repositorio (1,3 GB) sugiere que no es un modelo completo; podría requerir cargar el modelo base por separado.
- No se han publicado evaluaciones de calidad en tareas legales ni generales.
- El nombre "statute" sugiere un dominio legal, pero no hay evidencia de que el modelo sea fiable en ese ámbito.
- La fecha de creación (2026) es posterior a la fecha actual, lo que podría indicar un error en los metadatos.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_lbox-statute_ffn-only)
- [Weights & Biases - run de entrenamiento](https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_lbox_ffn_only/runs/ayl0ic6k)
- [Modelo base en HuggingFace](https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct)
