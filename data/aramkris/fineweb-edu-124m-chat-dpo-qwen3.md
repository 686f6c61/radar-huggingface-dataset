# aramkris/fineweb-edu-124m-chat-dpo-qwen3

## Resumen

FineWeb-Edu 124M chat (SFT + DPO) es un modelo de lenguaje de 162.150.144 parámetros entrenado desde cero por el desarrollador independiente aramkris en el marco del proyecto tinystories-ARM-model. No es un modelo Qwen: se trata de un GPT propio cuya única relación con Qwen3 es que sus pesos se han convertido exactamente al formato estándar de Hugging Face Qwen3, de modo que `transformers`, llama.cpp, Ollama, LM Studio y cualquier herramienta compatible con Qwen3 pueden ejecutarlo sin código adicional del proyecto original.

El modelo parte de una base preentrenada sobre FineWeb-Edu (subconjunto mini), Cosmopedia y SmolTalk, y posteriormente se ha afinado con SFT y DPO para conversación. Su ventana de contexto es de solo 512 tokens, lo que lo sitúa en la categoría de modelos de juguete o de experimentación educativa más que en la de asistentes de producción. Responde en un formato plano `User: …` / `Assistant: …` y cierra sus respuestas con `<|endoftext|>`.

Su relevancia es doble: por un lado, demuestra que es posible alinear un modelo diminuto con DPO y exportarlo a un formato de pesos ampliamente soportado sin reentrenar nada; por otro, sirve como banco de pruebas de bajo coste para pipelines de cuantización, plantillas de chat y validación de equivalencia numérica entre implementaciones. La licencia MIT facilita su uso y modificación sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (diseño Qwen3 con LayerNorm sin sesgo en lugar de RMSNorm) |
| Parametros totales | 162.150.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | bfloat16 (safetensors y GGUF), Q8_0 (GGUF 8 bits) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), GGUF (bf16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con el mismo esqueleto que Qwen3, con una diferencia clave: las normalizaciones de bloque son LayerNorm sin sesgo, mientras que Qwen3 usa RMSNorm. Para que la conversión al formato Qwen3 sea exacta sin reentrenar, el script `serving/export_hf.py` hace que el flujo residual tenga media cero (centrando los embeddings de entrada y cada matriz que escribe en él), lo que convierte ambas normas en la misma función. La capa de salida conserva los embeddings originales (por tanto, no están atados) y las proyecciones de query y key se escalan por √10 para que el único epsilon de Qwen3 imite el comportamiento de la QK-norm del modelo original. Los GGUF se generan con el convertidor de llama.cpp mediante `serving/gguf.sh`.

El preentrenamiento se realizó desde cero en el proyecto tinystories-ARM-model sobre los conjuntos BaoMinhTran/mini-fineweb-edu, HuggingFaceTB/cosmopedia y HuggingFaceTB/smol-smoltalk. Sobre esa base se aplicaron SFT y DPO para obtener el modelo conversacional. No se dispone de datos sobre el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni los hiperparámetros de alineamiento. La validación de equivalencia (`serving/check.py`, paso S7 del plan) confirma que la copia bfloat16 reproduce fielmente al modelo PyTorch original: los tokens de prompt son idénticos en las 100 preguntas retenidas y 70 respuestas coinciden palabra por palabra; en float32 la diferencia máxima de logits es de 2e-4.

## Capacidades

- Generación de texto conversacional multi-turno en inglés con el formato `User: …` / `Assistant: …`.
- Respuestas con cierre automático mediante `<|endoftext|>` en el 85 % de los casos (bfloat16) y el 82 % (Q8_0).
- Razonamiento básico y conocimiento factual muy limitado, propio de un modelo de 124M parámetros.
- Soporte de plantilla de chat incluida, aplicable con `apply_chat_template` en `transformers`.
- Compatibilidad con la API OpenAI a través de `llama-server --jinja`.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- Multilingüismo inexistente más allá del inglés.

## Casos de uso

- **Banco de pruebas de pipelines de cuantización**: permite comparar la salida bfloat16 frente a Q8_0 con métricas de repetición de 4-gramas (6,6 % vs 6,7 %) y finalización autónoma (85 % vs 82 %) para validar herramientas de cuantización antes de aplicarlas a modelos grandes.
- **Validación de equivalencia entre implementaciones**: su script `check.py` y la comparación de logits (diferencia máxima de 2e-4 en float32) lo convierten en un caso de test para verificar que un runtime reproduce fielmente un modelo PyTorch.
- **Desarrollo y depuración de plantillas de chat**: al usar el formato Qwen3 con plantilla incluida, sirve para probar integraciones de `apply_chat_template`, `llama-server --jinja` y clientes compatibles con la API OpenAI sin coste de GPU.
- **Docencia y experimentación en alineamiento**: su pipeline SFT + DPO sobre un modelo de 124M permite estudiar el efecto del alineamiento en un presupuesto mínimo, con licencia MIT para modificarlo libremente.
- **Prototipado de interfaces conversacionales**: útil para maquetar la UI y el flujo de una aplicación de chat (turnos, cierre de respuesta, streaming) antes de sustituir el backend por un modelo mayor.
- **Pruebas de integración en CI/CD**: su tamaño (326 MB en bf16, 174 MB en Q8_0) permite incluirlo en tests automatizados de extremo a extremo de servicios de inferencia sin aprovisionar GPUs dedicadas.
- **Evaluación de despliegue en Ollama y LM Studio**: sirve para verificar flujos de `ollama run hf.co/...` y la carga de GGUF en entornos de escritorio antes de migrar a modelos de mayor tamaño.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas de fidelidad de la conversión, no benchmarks estándar de capacidad:

| Metrica | Original (PyTorch) | Copia bfloat16 | Copia Q8_0 GGUF |
|---|---|---|---|
| 100 preguntas retenidas, greedy: 4-gramas repetidos | 6,5 % | 6,6 % | 6,7 % |
| Respuestas que terminan por sí solas | 86 % | 85 % | 82 % |
| Longitud media de respuesta (tokens) | 129,1 | 129,1 | 133,2 |
| LAMBADA vía llama-server | 12,9 % | 13,0 % | 12,9 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en bfloat16 (329 MB de pesos más caché KV para 512 tokens) y alrededor de 250 MB en Q8_0 (174 MB de pesos).
- **GPU recomendadas**: cualquier GPU con al menos 1-2 GB de VRAM; funciona en GTX 1050 Ti, RTX 3050, RTX 4090, A100 y H100 sin aprovechar su capacidad.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo moderna e incluso en CPU pura.
- **Opciones de despliegue**: `transformers` (safetensors bfloat16), llama.cpp (`llama-server -hf ... --jinja -c 512`), Ollama (`ollama run hf.co/aramkris/fineweb-edu-124m-chat-dpo-qwen3:Q8_0`), LM Studio y cualquier runtime compatible con Qwen3; también text-generation-inference según los tags del repositorio.
- **Latencia y throughput**: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fineweb-edu-124m-chat-dpo-qwen3 | 162,15 M | 512 | MIT | safetensors, GGUF | Objeto de esta ficha; formato Qwen3 |
| fineweb-edu-124m-chat-dpo | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva; misma arquitectura |
| Qwen3 (familia) | desde 0,6 B en adelante | hasta 32 768 tokens en versiones pequeñas | Apache 2.0 | safetensors, GGUF | Solo comparte formato de pesos; no es comparable en capacidad |
| TinyLlama 1.1B | 1,1 B | 2048 | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño superior con mayor conocimiento |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Conocimiento muy limitado**: con 124M parámetros, el autor advierte explícitamente que las respuestas son "verosímiles y a menudo incorrectas"; el riesgo de alucinación es alto y estructural.
- **Contexto de 512 tokens**: insuficiente para conversaciones largas, documentos o razonamiento multi-paso; cualquier prompt que exceda esa longitud se truncará.
- **Solo inglés**: no hay soporte multilingüe; el castellano no está contemplado.
- **Sin tool calling ni agentes**: no puede integrarse en flujos que requieran function calling o razonamiento encadenado.
- **Formato Qwen3 pero no es Qwen**: algunas herramientas pueden asumir capacidades de la familia Qwen3 que este modelo no tiene; conviene revisar la configuración antes de desplegarlo.
- **Licencia MIT**: permite uso comercial y modificación sin restricciones, pero no exime de validar la calidad de las salidas en cualquier aplicación real.
- **Métricas de fidelidad, no de calidad**: los datos de la model card miden la equivalencia de la conversión, no la utilidad del modelo; no deben interpretarse como rendimiento en tareas.
- **Sin datos de sesgos**: no se ha publicado ninguna evaluación de sesgos ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo-qwen3
- Modelo base: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Script de exportación a Hugging Face: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/export_hf.py
- Script de conversión a GGUF: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/gguf.sh
- Script de verificación de equivalencia: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/check.py
- Dataset mini-fineweb-edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
