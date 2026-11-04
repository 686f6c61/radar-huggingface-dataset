# mburchell/looped-40m-onnx

## Resumen

`looped-40m-onnx` es la exportación a formato ONNX del modelo experimental `mburchell/looped-40m`, un transformer de tipo Llama de 40 millones de parámetros entrenado desde cero que incorpora recurrencia en su bloque central. Lo desarrolla el usuario independiente mburchell y se publica bajo licencia CC BY-SA 4.0. Su interés es fundamentalmente de investigación: explora si aplicar un bucle sobre un subconjunto de capas permite obtener capacidad de razonamiento con menos parámetros efectivos, una línea que también han seguido trabajos como los Universal Transformers o los modelos con "looping" de DeepSeek.

El modelo tiene 512 dimensiones ocultas, SwiGLU, atención con GQA y 10 capas, de las cuales las 6 internas se recorren dos veces (un bucle). El contexto es de solo 1024 tokens y el vocabulario es un tokenizador propio de 24 000 entradas con operadores de capitalización. Se entrenó con unos 15 000 millones de tokens usando el optimizador Muon, con un preentrenamiento sobre FineWeb-Edu (subconjunto de SmolLM-Corpus) y un ajuste conversacional con SFT.

Es relevante ahora como banco de pruebas reproducible de la idea de recurrencia a pequeña escala y como ejemplo de exportación ONNX de un modelo con código personalizado (`custom_code`). No está pensado para uso en producción: el propio autor advierte que es "completamente inútil para tareas reales", que empieza a perder coherencia al crecer el contexto y que no tiene guardarraíles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama con recurrencia (looped transformer); 10 capas, bucle sobre las 6 internas |
| Parametros totales | 40 M (aproximado, según nombre y model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (el repo es ONNX; no se detallan variantes) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (repo `-onnx`); el modelo base `mburchell/looped-40m` en formato original no especificado |
| Dimension oculta | 512 |
| Vocabulario | 24 000 tokens, tokenizador propio con operadores de caso |
| Optimizador de entrenamiento | Muon |
| Tokens de entrenamiento | ~15 000 millones |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con 512 dimensiones, activación SwiGLU y atención con query grouping (GQA). La innovación es la recurrencia: las 6 capas internas se ejecutan dos veces (un "loop"), de modo que el cómputo efectivo es mayor que el que sugiere el número de capas almacenadas. El modelo se entrena desde cero, sin inicialización desde otro checkpoint, y usa un tokenizador propio de 24 000 tokens con operadores de capitalización, lo que lo aleja del tokenizador Llama estándar.

El preentrenamiento se hizo sobre el subconjunto FineWeb-Edu deduplicado de SmolLM-Corpus (ODC-BY), con unos 15 000 millones de tokens en total y el optimizador Muon. Después hubo una fase de SFT conversacional con SQuAD 1.1, Smol-SmolTalk, Everyday Conversations y bAbI QA, seguida de una "finishing run" que mezcló un 60 % de chats sintéticos generados localmente con Gemma (variante `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf`), un 20 % de Everyday y un 20 % de Smol-SmolTalk multiturno. El autor indica que el detalle de revisiones, hashes y recuentos de tokens está en `provenance.json`. No se menciona RLHF ni DPO; el ajuste es SFT supervisado.

## Capacidades

- Generación de texto conversacional breve en inglés, con plantilla de chat Llama-3.
- Conversación multiturno de alcance limitado: mantiene coherencia en turnos cortos y se degrada al crecer el contexto.
- Respuestas de tipo factual y de sentido común, influidas por el SFT con SQuAD y bAbI.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüe: no; solo inglés.
- Capacidades especiales: ninguna declarada (sin visión, audio ni modo "thinking"). La única particularidad técnica es la recurrencia.

## Casos de uso

- Investigación sobre recurrencia en transformers: sirve para medir cómo afecta el bucle de capas a la perplejidad y a la coherencia en un modelo pequeño y reproducible.
- Estudio de eficiencia paramétrica: comparar 40 M con bucle frente a un transformer denso de tamaño similar para evaluar si la recurrencia aporta capacidad con menos parámetros almacenados.
- Pruebas de exportación ONNX con `custom_code`: el repo ONNX permite validar pipelines de conversión y ejecución de arquitecturas no estándar en runtime ONNX.
- Prototipado de tokenizadores propios: su vocabulario de 24 000 tokens con operadores de caso sirve para experimentar con tokenización alternativa en modelos pequeños.
- Docencia y divulgación: ejemplo didáctico de entrenamiento desde cero con Muon y de un pipeline de SFT con datasets públicos.
- Pruebas de robustez y sesgo en modelos sin guardarraíles: útil para estudiar cómo se comporta un modelo pequeño sin alineación en entornos controlados.
- No es adecuado para atención al cliente, generación de código en producción, agentes ni ninguna tarea real, según el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 40 M de parámetros, en FP32 ocupa del orden de 160 MB y en FP16 unos 80 MB, más el overhead del runtime ONNX.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer e incluso en dispositivos de borde.
- Opciones de despliegue: runtime ONNX (ONNX Runtime, `onnxruntime-genai`), y el modelo base podría servirse con transformers si se dispone del código personalizado; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta variante ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mburchell/looped-40m-onnx | ~40 M | 1024 | CC BY-SA 4.0 | HuggingFace (ONNX) | Recurrente, solo inglés, experimental |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | HuggingFace | Transformer denso, multilingüe parcial, con benchmarks publicados |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | HuggingFace | Mucho mayor, entrenado con ~3 B tokens, uso general |
| Pythia-70M | 70 M | 2048 | Apache 2.0 | HuggingFace | Suite de investigación con checkpoints intermedios |

La comparación es aproximada: no hay benchmarks públicos del modelo de mburchell que permitan contrastar rendimiento con estas alternativas.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo "es probable que esté sesgado, no tiene guardarraíles y es completamente inútil para tareas reales".
- Riesgo alto de alucinación y de incoherencia: la calidad se degrada a medida que crece el contexto, y el límite es de solo 1024 tokens.
- Solo inglés; no hay soporte multilingüe.
- Sin alineación (RLHF/DPO) ni filtros de seguridad; puede generar contenido inapropiado.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo en producción.
- El uso de datos con licencias variadas (SQuAD CC BY-SA 4.0, bAbI CC BY 3.0, SmolLM-Corpus ODC-BY) impone obligaciones de atribución adicionales.
- La variante ONNX depende de `custom_code`; la compatibilidad con runtimes estándar no está garantizada y no se documentan cuantizaciones.
- No apto para producción, agentes, tool calling ni generación de código fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mburchell/looped-40m-onnx
- Modelo base: https://huggingface.co/mburchell/looped-40m
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset Everyday Conversations: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Dataset bAbI QA: https://huggingface.co/datasets/facebook/babi_qa
