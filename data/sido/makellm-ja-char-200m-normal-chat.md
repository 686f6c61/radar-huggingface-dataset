# Sido/makellm-ja-char-200m-normal-chat

## Resumen
makellm-ja-char-200m-normal-chat es un modelo de lenguaje conversacional en japones de tipo GPT-2 entrenado desde cero por Tsutomu Uchida (usuario Sido en Hugging Face). Se trata de un modelo a nivel de caracter (character-level), sin tokenizador de subpalabras, con aproximadamente 209,5 millones de parametros y una ventana de contexto de 512 caracteres. Su proposito no es responder preguntas ni ejecutar tareas, sino reproducir la forma y el registro de una conversacion casual japonesa con una persona adulta tranquila.

El modelo se distribuye unicamente en formato GGUF (F16, unos 415 MB) y esta pensado para ejecutarse en llama.cpp, Ollama o LM Studio. La variante "normal" corresponde a una persona calmada y cotidiana (trabajo, paseos, lectura, cafe), con poco argot y sin emojis; existe una variante hermana con personalidad de estudiante de secundaria (JK) publicada por separado.

Es relevante como pieza educativa y de investigacion: documenta de forma completa un pipeline desde cero (preprocesado, preentrenamiento, ajuste conversacional por destilacion y conversion a GGUF) ejecutado en hardware de consumo con ROCm. No obstante, el propio autor advierte que carece de conocimiento factual, aritmetica y seguimiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 estilo transformer decoder-only, a nivel de caracter (posiciones absolutas aprendidas, pre-LayerNorm, cabeza con pesos atados, GELU exacta) |
| Parametros totales | 216.981.504 (segun safetensors); ~209,5M segun la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 caracteres |
| Tipos de cuantizacion | F16 (unico peso publicado); cuantizaciones adicionales no disponibles |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (F16, ~415 MB) |

## Arquitectura y entrenamiento
La arquitectura es un transformer decoder-only de estilo GPT-2 con 16 capas, dimension de embedding 1024 y 16 cabezas de atencion (dimensión por cabeza 64). Usa posiciones absolutas aprendidas, pre-LayerNorm, cabeza de salida con pesos atados a los embeddings de entrada y activacion GELU exacta (erf). El vocabulario es de 7.283 tokens a nivel de caracter (7.280 caracteres Unicode mas tres tokens especiales: `<|user|>`, `<|bot|>` y `<|end|>`), de modo que un token equivale a un caracter. No emplea BPE ni SentencePiece.

El preentrenamiento se realizo sobre unos 6.170 millones de caracteres de una mezcla japonesa limpiada (normalizacion NFKC, eliminacion de caracteres de control, formato, uso privado y no asignados, y limpieza de ruido web) compuesta por CC-100 japones, Wikipedia japonesa y Aozora Bunko. El autor indica que el modelo base esta deliberadamente infraentrenado respecto a su tamano por el presupuesto de computo en una unica APU (AMD Ryzen AI MAX+ 395 / Radeon 8060S con PyTorch ROCm). El ajuste conversacional se hizo sobre unas 40.000 conversaciones destiladas de Gemma 4 (licencia Apache 2.0), filtradas por proporcion de japones, OOV, deduplicacion MinHash/LSH, longitud y eliminacion de marcadores. El entrenamiento uso enmascaramiento de perdida solo en la respuesta, en bf16 con SDPA, alcanzando una perdida de validacion enmascarada de 0,9520.

## Capacidades
- Generacion de texto conversacional casual en japones, a nivel de caracter.
- Reproduccion de un registro concreto: persona adulta tranquila, tono cotidiano, poco argol y sin emojis.
- Conversacion multi-turno corta mediante el formato `<|user|>…<|bot|>…<|end|>`.
- Soporte de plantilla Jinja para integracion en llama.cpp y LM Studio.
- No dispone de tool calling ni function calling.
- No dispone de razonamiento de multiples pasos ni capacidades de agente.
- No dispone de capacidades de vision, audio ni modo de razonamiento (thinking).
- Capacidad multilingue limitada al japones (idioma unico declarado).
- No sigue instrucciones ni respeta restricciones de formato.

## Casos de uso
- Demostracion educativa de un pipeline completo desde cero: util para mostrar en un curso o articulo como se pasa de datos crudos a un GGUF ejecutable en local, ya que el autor documenta cada etapa (limpieza, preentrenamiento, destilacion, conversion).
- Prototipado de personajes conversacionales: sirve para experimentar con el diseno de voces y registros (persona adulta calmada frente a la variante JK) sin depender de pesos preentrenados de terceros.
- Pruebas de infraestructura de inferencia en local: su tamano reducido (415 MB en F16) permite validar flujos con Ollama, llama.cpp o LM Studio en maquinas modestas antes de escalar a modelos mayores.
- Investigacion sobre tokenizacion a nivel de caracter: permite estudiar el comportamiento de un modelo sin BPE, con vocabulario de 7.283 caracteres y contexto de 512, en tareas de modelado de lenguaje japones.
- Generacion de relleno conversacional para entornos de prueba: util para poblar interfaces de chat o tests de UI con texto japones natural sin coste de API.
- Experimentos de destilacion: el modelo documenta un caso de destilacion desde Gemma 4 con filtrado y enmascaramiento de perdida, reutilizable como referencia metodologica en trabajos similares a pequena escala.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion enmascarada del ajuste conversacional (0,9520).

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en F16 (pesos de ~415 MB mas cache KV para contexto de 512).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo se entreno en una APU AMD Ryzen AI MAX+ 395 / Radeon 8060S (gfx1151, RDNA 3.5) con ROCm, lo que confirma su viabilidad en hardware integrado.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4060, RTX 4090, etc.) y en CPU sola.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante `Modelfile` incluido), LM Studio (catalogo de Hugging Face con plantilla Jinja autodetectada). vLLM y TGI no estan documentados para este modelo.
- Latencia y throughput estimados: no disponibles. Parametros recomendados por el autor: `num_ctx 512`, `temperature 0.7`, `top_k 40`, `repeat_penalty 1.1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| makellm-ja-char-200m-normal-chat | ~209,5M | 512 caracteres | Caracter (7.283) | CC BY-SA 4.0 | GGUF F16 | Persona adulta tranquila |
| makellm-ja-char-200m-chat | ~209,5M | 512 caracteres | Caracter | CC BY-SA 4.0 | GGUF | Variante hermana con persona JK |
| makellm-ja-char-75m-chat | ~75M (segun nombre) | no disponible | Caracter | CC BY-SA 4.0 | GGUF | Version mas pequena de la familia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo exclusivamente conversacional de "atmosfera": no tiene conocimiento factual (por ejemplo, no responde "Tokio" a la pregunta por la capital de Japon), no calcula aritmetica y no sigue instrucciones ni restricciones de formato.
- Fuga de persona: al destilarse de conversaciones de rol, ocasionalmente se dirige a un interlocutor implicito.
- Base pequena e infraentrenada: coherencia de largo alcance limitada y contexto de solo 512 caracteres.
- Diferencias numericas en GELU: llama.cpp y Ollama usan una aproximacion tanh de GELU, mientras el modelo se entreno con GELU exacta (erf), lo que introduce pequenas divergencias.
- Tokenizador personalizado: el formato de chat debe aportarse mediante el `Modelfile` incluido; una descarga directa con `ollama run hf.co/...` no funciona correctamente. El espacio ASCII (U+0020) se mapea a U+2581 por requisito del tokenizador SPM.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion, pero impone compartir bajo la misma licencia las obras derivadas.
- Prohibido superar `num_ctx` de 512, ya que los embeddings de posicion solo tienen 512 filas.
- No apto para produccion en tareas que requieran exactitud factual o fiabilidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Sido/makellm-ja-char-200m-normal-chat
- Perfil del autor en Hugging Face: https://huggingface.co/Sido
- Variante hermana (persona JK): https://huggingface.co/Sido/makellm-ja-char-200m-chat
- Variante de 75M: https://huggingface.co/Sido/makellm-ja-char-75m-chat/tree/main
- Perfil del autor en X: https://x.com/sidodtv
- Licencia Apache 2.0 (procedencia de los datos de destilacion): https://www.apache.org/licenses/LICENSE-2.0
- Dataset CC-100 japones: https://huggingface.co/datasets/range3/cc100-ja
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Aozora Bunko: https://huggingface.co/datasets/globis-university/aozorabunko-clean
