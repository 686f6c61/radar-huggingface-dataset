# aethertp/PicoLM-V4-85M-Instruct

## Resumen

PicoLM-V4-85M-Instruct es un modelo de lenguaje conversacional de 84.960.832 parámetros desarrollado por el usuario aethertp, obtenido mediante ajuste fino supervisado del modelo base PicoLM-V4-85M, entrenado desde cero sobre 6.000 millones de tokens. El ajuste se realizó durante dos épocas sobre una mezcla de datos de instrucción mayoritariamente sintéticos procedentes del subconjunto SmolTalk de HuggingFace, un pequeño conjunto de identidad y una porción de texto de preentrenamiento (unos 82 millones de tokens procesados, 41 millones por pasada).

El modelo emplea la arquitectura Qwen3 del ecosistema `transformers` (`Qwen3ForCausalLM`), por lo que se carga con `AutoModelForCausalLM` sin necesidad de `trust_remote_code`. Con 20 capas, dimensión oculta de 576 y una ventana de contexto de 2048 tokens, está pensado exclusivamente para investigación sobre modelos de lenguaje pequeños, experimentos de ajuste fino y plantillas de chat, y para escenarios que requieran un modelo conversacional capaz de ejecutarse en CPU.

Es relevante ahora porque demuestra un flujo completo de entrenamiento desde cero con presupuesto mínimo y publica sus resultados con honestidad metodológica: el propio autor documenta que el modelo ignora restricciones estrictas de formato y longitud, falla en aritmética y produce respuestas fluidas pero a menudo falsas. No debe emplearse en producción para tareas que exijan corrección factual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, formato Qwen3 (`Qwen3ForCausalLM`) |
| Parámetros totales | 84.960.832 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | GGUF (ficheros incluidos en el repo); cuantizaciones concretas no disponibles |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura replica la del modelo base: 20 capas, dimensión oculta de 576, 9 cabezas de consulta y 3 cabezas clave/valor con dimensión de cabeza 64 (atención con grouped-query attention), feed-forward SwiGLU con tamaño intermedio 1536, RMSNorm, RMSNorm adicional sobre consultas y claves, RoPE con base 10.000, vocabulario de 24.576 tokens con embeddings de entrada y salida atados, y contexto de 2048 tokens. No se modificó ni la arquitectura ni el tokenizador durante el ajuste fino; los tokens de chat `<|im_start|>` y `<|im_end|>` ya existían en el vocabulario, y el token 2 (`<|im_end|>`) no aparece en los datos de preentrenamiento, por lo que es durante el ajuste donde el modelo aprende a usarlo como fin de turno.

El ajuste fino se realizó durante dos épocas sobre seis fuentes del subconjunto SmolTalk: openhermes-50k (25,28 M tokens reales, 30,7 %), self-oss-instruct (17,01 M, 20,6 %), smol-contraints (13,60 M, 16,5 %), smol-summarize-20k (10,19 M, 12,4 %), smollm-rewrite-30k con peso 0,5 (9,23 M, 11,2 %) y replay de texto de preentrenamiento (6,40 M, 7,8 %). Se excluyó deliberadamente la fuente `smol-magpie-ultra` por motivos de procedencia, al haber sido generada con Llama-3.1-405B-Instruct; un experimento posterior de 5,7 a 6,8 millones de tokens con esa fuente no mostró ganancia en la pérdida de desarrollo (0,002 y 0,004 nats peor que los controles, con controles no emparejados en tokens, evidencia débil). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en formato ChatML, con plantilla almacenada en `tokenizer_config.json` y uso mediante `apply_chat_template`.
- Seguimiento de peticiones simples de un solo turno: identidad (nombre y creador), listas cortas y salida en JSON.
- Finalización de turno mediante el token `<|im_end|>` (id 2), configurado como end-of-sequence en `config.json`.
- Capacidad multilingüe: únicamente inglés.
- No soporta de forma fiable tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- No dispone de modo de pensamiento, visión ni audio.
- No respeta restricciones estrictas de formato ni de longitud.
- No responde correctamente a preguntas aritméticas (falló las tres preguntas aritméticas de la batería de pruebas del autor) ni a la mayoría de preguntas factuales (falló dos de cinco).
- La conversación multi-turno está en gran medida sin evaluar.

## Casos de uso

- Investigación sobre modelos de lenguaje pequeños: sirve como punto de partida reproducible para estudiar dinámicas de ajuste fino supervisado con presupuesto mínimo, dado que el autor documenta la composición exacta del dataset y las épocas empleadas.
- Experimentos con plantillas de chat: permite probar variantes de formato ChatML, tokens especiales de turno y estrategias de decodificación (greedy, penalización por repetición, muestreo) sobre un modelo de 85 M parámetros.
- Despliegue en CPU para demostraciones educativas: con 84,96 M de parámetros en fp32 ocupa aproximadamente 340 MB, por lo que puede ejecutarse en cualquier portátil sin GPU para ilustrar el funcionamiento de un transformer causal.
- Ajuste fino posterior (fine-tuning) de bajo coste: su tamaño permite reentrenar el modelo completo en una sola GPU consumer para experimentos de destilación o adaptación a dominios concretos.
- Pruebas de infraestructura de inferencia: útil como modelo de humo para validar pipelines con `transformers`, Text Generation Inference o llama.cpp (ficheros GGUF incluidos) antes de escalar a modelos mayores.
- Generación de texto creativo sin requisito de veracidad: puede producir respuestas fluidas en inglés para prototipos de chatbots o juegos de texto donde la corrección factual no sea un requisito.
- Estudio de fallos y alucinaciones: su tendencia documentada a producir respuestas falsas con fluidez lo convierte en un caso de estudio controlado para técnicas de detección de alucinaciones.

## Benchmarks y rendimiento

El autor no publica puntuaciones de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros). La model card reporta únicamente resultados de una batería propia de pruebas cualitativas:

| Prueba | Resultado |
|---|---|
| Identidad (nombre y creador) | correcto en la prueba mostrada |
| Listas cortas y salida JSON | sigue algunas peticiones simples |
| Restricciones estrictas de formato y longitud | ignoradas |
| Preguntas aritméticas (3) | 0 de 3 correctas |
| Preguntas factuales (5) | 3 de 5 correctas |
| Panel de 24 comprobaciones, greedy decoding | 11 aprobadas |
| Panel de 24 comprobaciones, muestreo (temp. 0,7, top-p 0,9) | 12 aprobadas (una de ellas, la comprobación de título de 12 palabras, contada como acierto por azar) |
| Bucles en generación, greedy | 5,6 % de los prompts |
| Bucles en generación, muestreo | 3,6 % de los prompts (diferencia de ~1,3 errores estándar con 360 prompts, dentro del ruido) |
| Resumen bajo system prompt | fallido |

No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 340 MB en fp32 (84,96 M de parámetros × 4 bytes), unos 170 MB en fp16/bf16 y menos de 100 MB en cuantizaciones GGUF de 4 bits, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100, H100 ni RTX 4090. Funciona en GPUs integradas y en CPU.
- Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en Raspberry Pi o portátiles convencionales en CPU.
- Opciones de despliegue: `transformers` (probado en las versiones 4.57.1 y 5.22.1), llama.cpp mediante los ficheros GGUF incluidos, Text Generation Inference (etiqueta `text-generation-inference` en el repo) y cualquier runtime compatible con safetensors.
- Latencia y throughput: no disponibles. El autor solo indica que la generación del ejemplo se ejecutó en CPU en fp32 con resultados idénticos en ambas versiones de `transformers`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| PicoLM-V4-85M-Instruct | 84,96 M | 2048 | inglés | Apache 2.0 | Ajuste fino sobre SmolTalk; falla aritmética y gran parte de preguntas factuales |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135 M | 2048 | inglés | Apache 2.0 | Referencia habitual para modelos pequeños; datos de benchmark no disponibles en esta ficha |
| Qwen2.5-0.5B-Instruct (Alibaba) | 500 M | 32.768 | multilingüe | Apache 2.0 | Mayor tamaño y contexto; datos de benchmark no disponibles en esta ficha |
| PicoLM-V4-85M (modelo base) | 84,96 M | 2048 | inglés | Apache 2.0 | Sin ajuste conversacional; mismo autor y arquitectura |

No se dispone de datos de rendimiento comparativos verificados en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El propio autor declara que el modelo no es adecuado para respuesta a preguntas, aritmética, traducción, generación de código ni ningún escenario donde la respuesta deba ser correcta; produce respuestas fluidas que a menudo son falsas.
- Riesgo elevado de alucinación: falló dos de cinco preguntas factuales en la batería del autor.
- No respeta restricciones estrictas de formato ni de longitud, lo que impide usarlo en pipelines que dependan de salidas estructuradas garantizadas.
- No responde de forma fiable a mensajes de sistema; un resumen de una frase bajo system prompt falló en el panel de pruebas.
- La conversación multi-turno está en gran medida sin evaluar.
- Contexto limitado a 2048 tokens e idioma limitado al inglés.
- El muestreo (temperatura 0,7, top-p 0,9) redujo los bucles pero produjo más sinsentidos en las respuestas revisadas; la configuración recomendada es decodificación greedy con `repetition_penalty=1.1`.
- No se debe añadir token de inicio de texto al prompt, ya que el modelo se ajustó sin él.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones de calidad desaconsejan cualquier despliegue en producción que requiera corrección.
- No dispone de soporte de tool calling, agentes ni razonamiento multi-paso.
- El ajuste fino se realizó sobre datos mayoritariamente sintéticos, lo que puede introducir sesgos y artefactos propios de los generadores utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aethertp/PicoLM-V4-85M-Instruct
- Modelo base: https://huggingface.co/aethertp/PicoLM-V4-85M
- Dataset de ajuste fino: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
