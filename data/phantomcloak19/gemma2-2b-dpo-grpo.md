# Phantomcloak19/gemma2-2b-dpo-grpo

## Resumen

Phantomcloak19/gemma2-2b-dpo-grpo es un modelo de lenguaje conversacional de 2,6 mil millones de parámetros, resultado del fine-tuning del modelo base google/gemma-2-2b-it mediante un pipeline de entrenamiento secuencial denominado LLMPR. Según la model card del autor, este checkpoint corresponde a la fase DPO-GRPO (Direct Preference Optimization combinada con Group Relative Policy Optimization), posterior a una etapa de SFT y previa a una fase de seguridad con GRPO. El objetivo declarado de este tipo de entrenamiento es reducir alucinaciones y mejorar la consistencia factual de las respuestas, aunque el autor no proporciona detalles adicionales sobre los datos de entrenamiento ni los resultados de evaluación.

El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con inferencia vía texto generación (text-generation-inference). A pesar de que el repositorio apenas tiene descargas (8) y sin valoraciones, el modelo está disponible también en plataformas de despliegue como FriendliAI para endpoints dedicados. Al ser un fine-tune de Gemma-2 2B, hereda las características arquitectónicas del modelo base de Google DeepMind, aunque la licencia específica de este checkpoint no está indicada en la ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Gemma-2 2B soporta 8192 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en fp32/fp16, 5.3 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de google/gemma-2-2b-it, un transformer decoder-only de 2,6 mil millones de parámetros desarrollado por Google DeepMind. La arquitectura base de Gemma-2 incorpora atención con ventana local y global alternadas, así como normalización RMSNorm y activaciones GELU. En este checkpoint, la fase de entrenamiento corresponde a DPO-GRPO según la model card, dentro del pipeline secuencial LLMPR (SFT → DPO → Safety-GRPO). No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros utilizados. El repositorio gemma-dpo-full del mismo autor indica que para un modelo Gemma-2 2B similar se usó DPO sobre el Unified Hallucination Benchmark y aceleración con Unsloth, pero no se confirma que estos datos sean aplicables a este checkpoint concreto.

## Capacidades

- Generación de texto conversacional: el modelo está orientado a diálogos multi-turno, según los tags "conversational" y "text-generation".
- Hereda capacidades base de Gemma-2 2B: razonamiento, generación de código y soporte multilingüe, aunque no se han publicado evaluaciones específicas de este checkpoint.
- Compatible con el pipeline de generación de texto de transformers y con despliegue en text-generation-inference.
- No se ha confirmado soporte de tool calling, agentes, visión ni audio en la documentación disponible.

## Casos de uso

- Asistentes conversacionales ligeros: al ser un modelo de 2,6B parámetros, puede desplegarse en entornos con recursos limitados para chatbots de atención al cliente o asistentes personales que requieran respuestas coherentes en diálogos multi-turno.
- Fine-tuning posterior: al ser un checkpoint intermedio del pipeline DPO-GRPO, puede servir como punto de partida para tareas de alineación adicionales (por ejemplo, la fase Safety-GRPO que se menciona en la model card).
- Experimentación académica en técnicas de preferencia: investigadores que estudian DPO y GRPO pueden analizar el efecto de esta fase de entrenamiento comparándolo con el modelo base gemma-2-2b-it.
- Evaluación de reducción de alucinaciones: si el entrenamiento con DPO se orientó a consistencia factual (como indica el proyecto gemma-doc-full del autor), puede evaluarse en benchmarks de alucinación como un caso de estudio.
- Prototipos de generación de texto en español y otros idiomas: heredando el soporte multilingüe de Gemma-2, puede usarse para prototipos rápidos de generación de contenido.
- Despliegue en endpoints de producción a pequeña escala: con herramientas como FriendliAI o vLLM, puede servir respuestas de baja latencia en aplicaciones de texto generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este checkpoint, ni comparaciones con otros modelos de su tamaño.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp32 (5.3 GB en disco) requeriría aproximadamente 11-13 GB de VRAM para cargar los pesos completos; con cuantización a 4-bit (no confirmada) podría reducirse a unos 2-3 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para fp32 (RTX 4090, A100 40GB, L4); para cuantización, una RTX 3060 de 12 GB o similar sería suficiente.
- Compatibilidad con GPU de consumo: sí, el tamaño de 2,6B parámetros permite ejecución en GPUs de consumo con cuantización, aunque no se han publicado pruebas específicas.
- Opciones de despliegue: transformers con accelerate, vLLM, llama.cpp (si se convierten a GGUF), text-generation-inference y plataformas como FriendliAI.
- Latencia y throughput: no se han publicado datos específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Phantomcloak19/gemma2-2b-dpo-grpo | 2.614.341.888 | no disponible | no disponible | safetensors |
| Phantomcloak19/gemma2-2b-dpo | 2,6B (estimado) | no disponible | no disponible | safetensors |
| google/gemma-2-2b-it (base) | 2.614.341.888 | 8192 tokens | Gemma License | safetensors |

La comparativa se basa únicamente en los datos disponibles: el modelo es un fine-tune del base gemma-2-2b-it, y comparte el mismo número de parámetros. No se dispone de resultados de rendimiento para establecer comparaciones funcionales.

## Limitaciones y advertencias

- No se ha documentado la licencia del modelo, por lo que no se puede garantizar su uso comercial ni su distribución.
- No se han publicado datos sobre sesgos, pero al ser un fine-tune de Gemma-2 hereda los sesgos potenciales del modelo base de Google, que incluyen sesgos socioculturales y de género.
- Riesgo de alucinación: aunque el entrenamiento con DPO suele orientarse a reducir alucinaciones, no hay evidencia en la ficha de que este checkpoint logre ese objetivo.
- La longitud de contexto no está confirmada; se asume que hereda los 8192 tokens del base, pero no se ha validado en este checkpoint.
- Solo se ha publicado el modelo en precisión completa (fp32/fp16), sin cuantizaciones oficiales, lo que limita su despliegue en entornos con poca VRAM.
- El repositorio tiene pocas descargas y ninguna validación de terceros, por lo que su calidad y estabilidad no están contrastadas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phantomcloak19/gemma2-2b-dpo-grpo
- Repositorio del autor con modelo similar (gemma2-2b-dpo): https://huggingface.co/Phantomcloak19/gemma2-2b-dpo
- Repositorio del autor con otro fine-tune DPO (gemma-doc-full): https://huggingface.co/Phantomcloak19/gemma-doc-full
- Página de despliegue en FriendliAI: https://friendli.ai/models/Phantomcloak19/gemma2-2b-dpo-grpo
- Repositorio oficial de Gemma de Google DeepMind: https://github.com/google-deepmind/gemma
