# Sido/makellm-ja-char-200m-chat

## Resumen

makellm-ja-char-200m-chat es un modelo de lenguaje japonés de tipo GPT-2 entrenado desde cero por Tsutomu Uchida (Sido), con un tokenizador a nivel de carácter y sin BPE ni SentencePiece. El modelo base tiene unos 209,5 millones de parámetros (216.981.504 según los pesos publicados) y está afinado como chatbot con una persona concreta: una estudiante de secundaria japonesa (JK, *joshi kousei*) de registro coloquial, con jerga juvenil y temas escolares. Se distribuye únicamente en formato GGUF (F16) y está pensado para ejecutarse en local con Ollama o llama.cpp.

La relevancia del modelo es fundamentalmente didáctica y experimental: todo el pipeline (preprocesado, preentrenamiento, destilación del chat y conversión a GGUF) está escrito a mano, sin pesos preentrenados de Hugging Face ni tokenizador subword. El preentrenamiento se hizo con unos 6.170 millones de caracteres de texto japonés limpio (CC-100, Wikipedia y Aozora Bunko) sobre una APU AMD Ryzen AI MAX+ 395 con ROCm, y el ajuste conversacional se destiló a partir de unas 40.000 conversaciones generadas con Gemma 4.

Conviene subrayar que no es un asistente: el propio autor advierte que el modelo no tiene conocimiento factual, no calcula y no sigue instrucciones. Reproduce la forma y el registro del chat informal japonés, pero no responde preguntas de conocimiento. Su contexto es de solo 512 caracteres y su vocabulario es de 7.283 tokens de un solo carácter Unicode.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), posiciones absolutas aprendidas, pre-LayerNorm, cabeza con pesos atados, GELU exacta (erf) |
| Parametros totales | 216.981.504 (~209,5 M según la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 caracteres (512 filas en los embeddings posicionales) |
| Tipos de cuantizacion | F16 en el repositorio; el autor no publica otras variantes |
| Idiomas soportados | japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (F16, ~415 MB); repo de 0,4 GB |

Otros datos técnicos: n_layer=16, n_embd=1024, n_head=16 (dimensión de cabeza 64); vocabulario de 7.283 tokens a nivel de carácter (7.280 caracteres + 3 tokens especiales `<|user|>`, `<|bot|>`, `<|end|>`). Entrenado en AMD Ryzen AI MAX+ 395 / Radeon 8060S (gfx1151, RDNA 3.5) con PyTorch y ROCm.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estilo GPT-2 con normalización previa a cada bloque, embeddings posicionales absolutos aprendidos, GELU exacta y pesos atados entre embedding de entrada y cabeza de salida. La peculiaridad principal es el tokenizador: un token equivale a un carácter Unicode, sin merges ni segmentación subword. En el GGUF el tokenizador se declara como `llama` (SPM) pero el vocabulario contiene solo tokens de un carácter, de modo que no se activa ninguna fusión; el espacio ASCII (U+0020) se aliasa a U+2581 (▁) por requisito de SPM, y los tres tokens especiales son de tipo CONTROL, se segmentan de forma atómica y se ocultan en la salida.

El preentrenamiento usó unos 6.170 millones de caracteres de una mezcla japonesa limpiada internamente («cleancc3»): CC-100 japonés (`range3/cc100-ja`) como fuente principal, Wikipedia japonesa (`wikimedia/wikipedia`) y Aozora Bunko (`globis-university/aozorabunko-clean`). La limpieza incluyó normalización NFKC, eliminación de puntos de código de control, formato, uso privado y no asignados, y eliminación de ruido web. El autor indica que el modelo base está deliberadamente infraentrenado respecto a su tamaño por el presupuesto de cómputo de una sola APU. El ajuste conversacional se hizo con unas 40.000 conversaciones destiladas de Gemma 4 (licencia Apache 2.0), generadas en local y filtradas por ratio de japonés, OOV, deduplicación con MinHash/LSH, longitud y eliminación de marcadores de plantilla. El formato es `<|user|>…<|bot|>…<|end|>` con la pérdida aplicada solo a la respuesta (fine-tuning enmascarado); la mejor pérdida de validación enmascarada fue 1,0571.

## Capacidades

- Generación de texto conversacional en japonés coloquial, con registro juvenil y jerga («めっちゃ», «やばい», «神», «〜じゃん»).
- Reproducción de una persona concreta (estudiante de secundaria) con temas de escuela, clubes, idols, cafeterías y aperitivos.
- Conversación multiturno de formato corto mediante los tokens `<|user|>`, `<|bot|>` y `<|end|>`.
- Tokenización a nivel de carácter, lo que evita problemas de vocabulario OOV en japonés.
- No dispone de tool calling ni function calling.
- No dispone de razonamiento multi-paso ni capacidades de agente.
- No dispone de visión, audio ni modo de razonamiento explícito.
- Multilingüismo: solo japonés; no se documenta soporte de otros idiomas.

## Casos de uso

- Experimentación educativa con tokenizadores a nivel de carácter: sirve para estudiar cómo afecta prescindir de BPE en japonés, comparando perplejidad y coherencia con modelos subword del mismo tamaño.
- Prototipado de personajes conversacionales en local: el modelo permite montar un chatbot de persona concreta con Ollama en minutos, útil para validar guiones y registro antes de invertir en un modelo mayor.
- Pruebas de pipelines de inferencia GGUF: al ser un GGUF F16 de ~415 MB con plantilla Jinja embebida, es un banco de pruebas ligero para verificar integraciones con llama.cpp, Ollama y LM Studio.
- Demos de chat en dispositivos de gama baja: su tamaño permite ejecutarlo en CPU o en GPUs de consumo modestas, adecuado para talleres y demostraciones sin infraestructura dedicada.
- Investigación sobre destilación de datos conversacionales: el autor documenta el proceso de generación, filtrado y enmascarado de pérdida, lo que lo convierte en una referencia reproducible para estudiar destilación a pequeña escala.
- Generación de diálogo de relleno para prototipos de videojuegos o narrativa interactiva en japonés, donde el tono importa más que la exactitud factual.
- Evaluación de sesgos y filtración de persona en modelos pequeños: útil para medir hasta qué punto un ajuste por destilación de role-play introduce apelativos no deseados («お父さん», «先生», «先輩»).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la mejor pérdida de validación enmascarada del ajuste conversacional (1,0571) y el volumen de datos de preentrenamiento (~6,17 mil millones de caracteres), sin métricas estándar como MMLU, JGLUE, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF F16 ocupa ~415 MB; con overhead de contexto y runtime, menos de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el autor entrenó en una APU AMD Ryzen AI MAX+ 395 (Radeon 8060S, RDNA 3.5) con ROCm, lo que confirma viabilidad en hardware integrado.
- Cabe en GPU de consumo: sí, en cualquier modelo con 2 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), y también en CPU.
- Opciones de despliegue: Ollama (con el `Modelfile` incluido), llama.cpp (`llama-cli` con `--jinja`), LM Studio. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El contexto máximo práctico es de 512 tokens; parámetros recomendados: `num_ctx 512`, `temperature 0.7`, `top_k 40`, `repeat_penalty 1.1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| makellm-ja-char-200m-chat | ~209,5 M | 512 caracteres | Carácter (7.283) | CC BY-SA 4.0 | GGUF en Hugging Face |
| makellm-ja-char-200m-normal-chat | ~209,5 M (misma base) | 512 caracteres | Carácter | no disponible en la información | GGUF en Hugging Face |
| makellm-ja-char-75m-chat | ~82,2 M | no disponible | Carácter | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos ni frente a alternativas de otros autores; la información proporcionada no incluye benchmarks. La comparación se limita, por tanto, a parámetros, contexto, licencia y formato de distribución.

## Limitaciones y advertencias

- Modelo solo conversacional: no tiene conocimiento factual (preguntado por la capital de Japón responde con charla, no «Tokio»), no hace aritmética y no sigue instrucciones ni formatos.
- Filtración de persona: al destilarse de conversaciones de role-play, ocasionalmente se dirige a un «お父さん», «先生» o «先輩» implícito.
- Base pequeña e infraentrenada: coherencia limitada a larga distancia y contexto de solo 512 caracteres.
- Tokenizador personalizado: es imprescindible usar el `Modelfile` incluido; un `ollama run hf.co/...` directo no funciona correctamente.
- Diferencia numérica en GELU: llama.cpp y Ollama usan GELU con aproximación tanh en la ruta GPT-2, mientras el modelo se entrenó con GELU exacta (erf), lo que introduce una pequeña discrepancia en inferencia.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución, pero obliga a compartir las obras derivadas bajo la misma licencia (copyleft). Conviene revisar la compatibilidad si se integra en productos propietarios.
- Los datos de chat derivan de Gemma 4 (Apache 2.0), lo que según el autor permite publicar el modelo con atribución; no se detalla el cumplimiento de otras obligaciones de atribución.
- Sin datos de sesgos medidos ni evaluaciones de seguridad publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sido/makellm-ja-char-200m-chat
- Perfil del autor en Hugging Face: https://huggingface.co/Sido
- Modelos del autor: https://huggingface.co/Sido/models
- Perfil en X del autor: https://x.com/sidodtv
- Dataset CC-100 japonés: https://huggingface.co/datasets/range3/cc100-ja
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Aozora Bunko: https://huggingface.co/datasets/globis-university/aozorabunko-clean
- Licencia Apache 2.0 (Gemma 4, datos de destilación): https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
