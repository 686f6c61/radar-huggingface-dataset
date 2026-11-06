# nkthebass/tinybrainbot-100m-v5.1-instruct

## Resumen

TinyBrainBot-100M-v5.1-Instruct es un modelo de lenguaje conversacional de 100,1 millones de parámetros entrenado desde cero por el desarrollador independiente nkthebass. Se trata de la versión instruct de TinyBrainBot-100M-v5-Base, ajustada con SFT y DPO para seguir instrucciones, mantener conversaciones multi-turno y resolver problemas aritméticos sencillos mediante un razonamiento visible en bloques `<think>`. Carga como un `LlamaForCausalLM` estándar sin código personalizado, lo que facilita su integración en cualquier pipeline basado en transformers.

Su principal novedad respecto a versiones anteriores es que ha sido entrenado conservando saltos de línea, lo que permite generar listas numeradas y poemas con formato correcto, algo que los TinyBrainBot previos sobre este tokenizador no conseguían. No es un modelo competitivo frente a LLM de escala mayor: con 100M de parámetros alucina hechos con frecuencia y su seguimiento de instrucciones es limitado (IFEval strict de 19,8 en prompt-level). Su interés es principalmente educativo, como modelo de juguete para experimentar en hardware muy modesto, probar pipelines de inferencia o estudiar el proceso completo de preentrenamiento + SFT + DPO en un modelo diminuto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama, `LlamaForCausalLM`) |
| Parametros totales | 100.092.672 |
| Parametros activos | no disponible (no es MoE; es un modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso (no MoE) con arquitectura Llama, entrenado desde cero con un tokenizador propio. El pipeline de entrenamiento consta de tres fases documentadas por el autor:

1. **Preentrenamiento** del modelo base (TinyBrainBot-100M-v5-Base) sobre 29.600 millones de tokens.
2. **SFT** con 0,39 mil millones de tokens durante 3.000 pasos, usando una mezcla única de habilidades: 40% chat (smol-smoltalk, conversaciones multi-turno con memoria de contexto, WildChat sin negativas), 25% matemáticas (aritmética de columna con números grandes y negativos, problemas de palabras con scratchpad generado), 25% razonamiento (trazas `<think>`, razonamiento abierto y consciente de seguridad, con "ballast" de chat simple para que no razonamiento ante saludos triviales) y un porcentaje restante de seguimiento de instrucciones (la model card se corta en esa sección, por lo que el detalle completo no está disponible). Se usaron además los datasets tulu-3-sft-personas-instruction-following, smoltalk, smoltalk2, OpenHermes-2.5 y ultrafeedback_binarized.
3. **DPO** sobre ultrafeedback_binarized para alinear las respuestas con las preferencias humanas.

Una innovación práctica destacable es el manejo de saltos de línea: versiones anteriores del tokenizador no los habían visto en entrenamiento, y esta versión los conserva tanto en transformers como en GGUF, con salida greedy idéntica token a token entre ambos formatos.

## Capacidades

- Generacion de texto conversacional en inglés con respuestas cortas y memoria de turnos anteriores (recuerda nombres y detalles mencionados antes en la conversación).
- Seguimiento de instrucciones básicas, con capacidad de generar listas numeradas y poemas multilínea gracias al entrenamiento con saltos de línea.
- Razonamiento aritmético mediante un scratchpad visible en bloques `<think>` (texto plano, no tokens especiales): razona antes de responder en 9 de cada 10 preguntas cortas de matemáticas y acierta aproximadamente la mitad.
- Matemáticas básicas: aritmética de columna con números anchos, negativos y multiplicaciones 3x3.
- Compatibilidad con chat template estándar de transformers (`apply_chat_template`), embebido también en los GGUF.
- No hay evidencia de soporte de tool calling / function calling, agentes, ni capacidades de visión o audio.

## Casos de uso

- **Educacion y aprendizaje de LLM:** al ser un modelo de 100M entrenado desde cero con pipeline documentado (preentrenamiento, SFT, DPO), es ideal para estudiar cada fase del entrenamiento y ejecutarlo en portátiles sin GPU.
- **Pruebas de infraestructura de inferencia:** sirve como modelo canario para validar pipelines de vLLM, llama.cpp, TGI o endpoints de Hugging Face sin consumir recursos significativos (66 MB cuantizado en Q4_K_M).
- **Experimentacion con cuantizacion:** al publicarse en F16, Q8_0 y Q4_K_M con salida greedy idéntica entre formatos, es útil para comparar el impacto real de la cuantización en un modelo controlado.
- **Prototipado de chatbots de juguete:** permite montar un asistente conversacional multi-turno con memoria de contexto en dispositivos embebidos o móviles de gama baja.
- **Investigacion en razonamiento visible:** los bloques `<think>` en texto plano facilitan experimentar con el procesado y filtrado de trazas de razonamiento (por ejemplo, con regex sobre la salida).
- **Benchmarks comparativos de modelos pequeños:** al incluir model-index con resultados en lm-eval, puede usarse como punto de referencia en estudios sobre modelos de menos de 1B de parámetros.
- **Testing de chat templates:** útil para verificar que un runtime (LM Studio, Jan, Ollama) aplica correctamente la plantilla de chat y tokeniza saltos de línea igual que transformers.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), todos en 0-shot sobre el conjunto completo:

| Benchmark | Metrica | Valor |
|---|---|--:|
| ARC-Easy | acc_norm | 55,01 |
| ARC-Challenge | acc_norm | 30,12 |
| HellaSwag | acc_norm | 35,11 |
| PIQA | acc_norm | 65,67 |
| IFEval | prompt-level strict | 19,8 |
| IFEval | instruction-level strict | 33,0 |
| ArithMark-3 | acc | 43,60 |
| Open SLM Leaderboard Intelligence Index | indice | 23,11 |

El autor compara el modelo con su base (Intelligence Index de 26,07) y con TinyBrainBot-360M-A75M-v5-Instruct (27,82), un modelo 3,8 veces mayor que obtiene 25,1 en IFEval prompt-level strict. No hay comparación publicada con modelos de otros autores de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en F16 ocupa 201 MB; en Q8_0, 107 MB; en Q4_K_M, 66 MB. Cabe en cualquier GPU moderna e incluso funciona por CPU sin problema.
- GPU recomendadas: ninguna GPU dedicada es necesaria; cualquier GPU con al menos 1 GB de VRAM basta. No requiere A100, H100 ni tarjetas de gama alta.
- Consumer GPU: cabe sobradamente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, Apple Silicon integrado, etc.) en cualquier cuantización.
- Opciones de despliegue: transformers (PyTorch), llama.cpp, LM Studio, Jan y Ollama (vía GGUF con chat template embebido). Al ser compatible con `LlamaForCausalLM`, también debería funcionar en vLLM y TGI, aunque el autor no lo documenta explicitamente.
- Latencia y throughput: no disponible. Dado el tamaño (100M de parámetros), se espera inferencia muy rápida incluso en CPU, pero no hay mediciones publicadas.
- Nota práctica del autor: al usar llama.cpp se recomienda `--temp 0.4 --top-p 0.9 --repeat-penalty 1.15` y dos flags `--logit-bias 241-inf --logit-bias 255-inf` para bloquear los tokens de byte que componen emojis, ya que el tokenizador no tiene piezas de emoji.

## Comparativa con modelos similares

Comparativa con alternativas de la misma categoria (modelos diminutos, sub-200M). Los datos de modelos de terceros son aproximados y de conocimiento general; donde no hay certeza, se indica.

| Modelo | Parametros | Arquitectura | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| TinyBrainBot-100M-v5.1-Instruct | 100,1M | Transformer denso (Llama) | Apache 2.0 | safetensors, GGUF (F16/Q8_0/Q4_K_M) | Razonamiento `<think>`, DPO, saltos de linea |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135M | Transformer denso (Llama) | Apache 2.0 | safetensors, GGUF | Entrenado con 11T tokens; seguimiento de instrucciones y benchmarks muy superiores |
| Qwen2.5-0.5B-Instruct | 494M | Transformer denso | Apache 2.0 (algunas variantes Qwen) | safetensors, GGUF | Multilingue (29+ idiomas), contexto largo, muy superior en todas las tareas |

En términos absolutos, TinyBrainBot-100M rinde por debajo de SmolLM2-135M-Instruct y de cualquier modelo instruct comercial de menos de 500M. Su valor diferencial es la transparencia del entrenamiento (desde cero, pipeline documentado) y el tamaño minimo, no el rendimiento.

## Limitaciones y advertencias

- **Alucinacion significativa:** el propio autor reconoce que "a 100M de parametros inventa hechos". No debe usarse para tareas que requieran veracidad factual.
- **Seguimiento de instrucciones debil:** con 19,8 en IFEval prompt-level strict, falla la mayoría de instrucciones complejas; no siempre respeta conteos exactos (pedir 3 consejos puede devolver 5).
- **Deriva tematica:** algunas respuestas practicas se desvian del tema solicitado, segun las muestras sin editar publicadas por el autor.
- **Solo ingles:** el modelo esta entrenado para ingles; su rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea pobre.
- **Razonamiento matematico limitado:** acierta aproximadamente la mitad de las preguntas cortas de matematicas; no es fiable para calculos importantes.
- **Emojis rotos:** el tokenizador no tiene piezas de emoji y el modelo los deletrea byte a byte si no se bloquean los tokens correspondientes en llama.cpp.
- **Longitud de contexto no documentada:** no se publica la ventana de contexto, lo que dificulta planificar conversaciones largas.
- **Benchmarks no verificados:** todos los resultados provienen del autor y estan marcados como no verificados; no hay evaluacion independiente.
- **Licencia:** Apache 2.0 permite uso comercial sin restricciones relevantes.
- **Comunidad minima:** 0 descargas y 1 like en el momento de redaccion de esta ficha; no hay ecosistema de soporte ni correcciones de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-100m-v5.1-instruct
- Modelo base: https://huggingface.co/nkthebass/tinybrainbot-100m-v5-base
- Muestras de conversacion sin editar: https://huggingface.co/nkthebass/tinybrainbot-100m-v5.1-instruct/blob/main/conversation_samples.md
- Datasets de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk, https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following, https://huggingface.co/datasets/allenai/WildChat-4.8M, https://huggingface.co/datasets/HuggingFaceTB/smoltalk, https://huggingface.co/datasets/HuggingFaceTB/smoltalk2, https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized, https://huggingface.co/datasets/teknium/OpenHermes-2.5
- Paper, repositorio de codigo y demo: no disponible
