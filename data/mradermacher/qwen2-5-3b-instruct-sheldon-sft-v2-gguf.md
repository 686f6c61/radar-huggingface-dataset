# mradermacher/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-GGUF

# Qwen2.5-3B-Instruct-Sheldon-SFT-v2-GGUF

## Resumen

Este modelo es una cuantización en formato GGUF del fine-tuning `agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2`, a su vez un ajuste fino con LoRA sobre `Qwen2.5-3B-Instruct`. El propósito es que el modelo interprete el papel del personaje Sheldon Cooper, generando respuestas en inglés coherentes con su personalidad y estilo de habla. Las cuantizaciones fueron producidas por mradermacher, un usuario con experiencia en convertir modelos a GGUF para su uso en entornos locales.

Desde el punto de vista técnico, se trata de un transformer decoder-only de 3.085.938.688 parámetros, con una ventana de contexto heredada de Qwen2.5-3B-Instruct. Su relevancia radica en el creciente interés por modelos de personaje y roleplay desplegables en local, especialmente para experimentos con chatbots o juegos de rol, sin necesidad de infraestructura cloud. La disponibilidad de cuantizaciones desde Q2_K hasta f16 permite ejecutarlo en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-3B-Instruct, no documentado en el repo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (todos en GGUF) |
| Idiomas soportados | Inglés (según la model card; el modelo base Qwen2.5-3B-Instruct también soporta chino) |
| Licencia | qwen-research (restricción de uso no comercial, según enlace a la licencia de Qwen/Qwen2.5-3B-Instruct) |
| Formato de pesos | GGUF (cuantizaciones estáticas de mradermacher) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B-Instruct, un transformer decoder-only con attention de múltiples cabezas, RoPE y Grouped Query Attention. Sobre esta base se aplicó un ajuste fino mediante LoRA, según indican las etiquetas del repositorio (`lora`, `sft`). El dataset de entrenamiento es `tbooy/sheldon-cooper-sft-20k`, que contiene 20.000 muestras de conversaciones etiquetadas con el estilo de Sheldon Cooper.

No se documenta el uso de RLHF ni DPO. La única innovación técnica visible en este repositorio es la conversión a GGUF con múltiples niveles de cuantización por parte de mradermacher, que abarcan desde Q2_K (aproximadamente 1.4 GB) hasta f16 (6.3 GB). No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional en inglés, ajustada para representar al personaje Sheldon Cooper.
- Manejo de instrucciones de roleplay y persistencia de personalidad en diálogos multi-turno.
- Respuestas con tono pedante, lógico y humorístico característico del personaje, según el dataset de entrenamiento.
- Soporte para ser cargado en bibliotecas compatibles con GGUF, como llama.cpp, Ollama o LM Studio.
- La capacidad de tool calling y function calling no está documentada en este repositorio; es posible que el fine-tuning degrade el soporte nativo del modelo base.
- No se han observado capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Chatbot de entretenimiento para fans de The Big Bang Theory: el modelo puede mantener conversaciones prolongadas con la personalidad de Sheldon, aprovechando la ventana de contexto de 32k tokens.
- Juegos de rol interactivos en inglés: sirve como personaje no jugador con comportamiento y estilo de habla consistentes dentro de una narrativa textual.
- Generacion de guiones o diálogos para proyectos creativos: permite generar líneas de diálogo inspiradas en el personaje para guiones o literatura fan.
- Experimentación en investigación de modelos de personalidad: útil para estudiar cómo el fine-tuning con un dataset pequeño (20k muestras) afecta a la coherencia del personaje.
- Integración en aplicaciones de mensajería o asistentes humorísticos: puede desplegarse localmente mediante Ollama o llama.cpp en un equipo con poca VRAM.
- Demostraciones educativas de ajuste fino con LoRA: sirve como ejemplo práctico de fine-tuning de menor costo sobre un modelo instruct existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye tablas de MMLU, HumanEval ni GSM8K, y la búsqueda web no ha proporcionado datos adicionales al respecto.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantizacion (basada en el tamaño de los archivos):
  - Q2_K: 1.4 GB
  - Q3_K_M: 1.7 GB
  - IQ4_XS: 1.9 GB
  - Q4_K_M: 2.0 GB (recomendado para equilibrio entre velocidad y calidad)
  - Q6_K: 2.6 GB
  - Q8_0: 3.4 GB (recomendado si se prioriza calidad)
  - f16: 6.3 GB
- GPU recomendada: RTX 3060 12GB, RTX 4060 8GB, o superior. Para cuantizaciones Q4_K_M o inferiores, es suficiente una GPU con 4 GB de VRAM. Para f16 se necesitan al menos 8 GB.
- El modelo es compatible con sistemas consumer GPU, dado su tamaño de 3B y sus cuantizaciones compactas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier cliente que soporte archivos GGUF. La integración con vLLM o TGI no está documentada para este repositorio concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct-Sheldon-SFT-v2-GGUF | 3.09B | 32k | qwen-research (no comercial) | GGUF | Roleplay de Sheldon Cooper |
| Qwen2.5-3B-Instruct (base) | 3.09B | 32k | Apache 2.0 / Qwen research | GGUF y safetensors | Instrucciones generales, tool calling |
| Qwen2.5-3B-Instruct-abliterated (mradermacher) | 3.09B | 32k | qwen-research | GGUF | Instrucciones con menor censura, sin rol específico |

El modelo se diferencia del base por su mayor especialización en roleplay, mientras que el modelo abliterated busca variar el comportamiento de rechazo. Ninguno de los modelos comparados tiene benchmarks públicos disponibles en la información consultada.

## Limitaciones y advertencias

- Sesgos y estereotipos derivados del personaje y del dataset, que pueden perpetuar comportamientos condescendientes o normas sociales poco realistas.
- Riesgo de alucinación y de salirse del personaje, especialmente en contextos o idiomas distintos al inglés.
- Sobreajuste potencial a las 20.000 muestras de entrenamiento, lo que puede provocar repetición de frases o falta de generalización a temas fuera del dominio del personaje.
- La licencia `qwen-research` probablemente restringe el uso comercial. Es necesario revisar el texto completo de la licencia antes de cualquier despliegue productivo.
- El soporte de tool calling, agentes o razonamiento multi-step no está verificado en este modelo, por lo que no se recomienda su uso para tareas que requieran esas capacidades.
- La información disponible es limitada: no hay documentación de benchmarks, tokens de entrenamiento ni análisis de sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-GGUF
- Modelo base fine-tuned: https://huggingface.co/agastyasridharan/Qwen2.5-3B-Instruct-Sheldon-SFT-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/tbooy/sheldon-cooper-sft-20k
- Licencia del modelo original Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Guía sobre el uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Página de solicitudes de mradermacher: https://huggingface.co/mradermacher/model_requests
