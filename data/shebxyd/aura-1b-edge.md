# shebxyd/aura-1b-edge

## Resumen

Aura 1B Edge es una cuantización GGUF en 4 bits (`Q4_K_M`) del modelo Google Gemma 3 1B Instruct, ajustada mediante LoRA por el usuario shebxyd para la aplicación móvil offline Aura (rama `kofu-go` de Kofu_Mobile). El objetivo declarado es ejecutar un asistente conversacional en español dentro de dispositivos Android de gama de entrada y media con un presupuesto estricto de memoria: el autor fija un límite de 2 GB de RAM total y `VmRSS <= 1850 MB`.

El modelo parte de `unsloth/gemma-3-1b-it` en BF16, se ajusta con PEFT/TRL sobre 2.026 ejemplos en español (matemáticas, ciencias naturales, programación y un conjunto propio de identidad) y se fusiona y convierte a GGUF. El resultado pesa 806.059.104 bytes (768,72 MiB) y conserva la arquitectura `Gemma3ForCausalLM` con 999.885.952 parámetros.

Su relevancia es acotada pero concreta: no compite en capacidad general con modelos mayores, sino que ocupa el nicho de asistentes educativos en español totalmente offline en hardware modesto, con un formato de pesos listo para `llama.cpp` y plantilla de chat Gemma 3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Gemma3ForCausalLM`), base Google Gemma 3 1B IT |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3 1B IT, no confirmada en la model card) |
| Tipos de cuantizacion | `Q4_K_M` (4-bit, 6,40 BPW en llama.cpp) |
| Idiomas soportados | Espanol (principal) e ingles |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | GGUF (`aura-1b-edge-q4_k_m.gguf`, 806.059.104 bytes / 768,72 MiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 1B Instruct, un transformer decoder-only de aproximadamente 1.000 millones de parametros. Sobre esa base se aplico un ajuste fino LoRA con `r=16`, `lora_alpha=32` y `lora_dropout=0.05` sobre las proyecciones de atencion y FFN (`q/k/v/o/gate/up/down_proj`), usando PEFT y el `SFTTrainer` de TRL con `completion_only_loss=True` en BF16. El entrenamiento se ejecuto en Google Colab sobre una NVIDIA A100-SXM4-80GB, con 2 epocas, 128 pasos, `lr=1.2e-4` y scheduler cosine, alcanzando `train_loss = 0.9138` y `mean_token_accuracy = 0.8224`. Posteriormente se fusionaron los pesos y se convirtio a GGUF `Q4_K_M`.

El dataset suma 2.026 ejemplos: un conjunto propio curado de identidad Aura (respuestas sobre su nombre, funcionamiento 100% offline y honestidad ante preguntas en tiempo real), 650 ejemplos de matematicas de `ericrisco/gsm8k-translated-spanish`, 400 de ciencias naturales de `johanobandoc/natural_science_spanish_exam` y 700 de un subconjunto filtrado escolar en espanol de `FreedomIntelligence/alpaca-gpt4-spanish` (programacion, historia, ciencias y pares curados de Python/C++ y fisica/biologia). No se documenta RLHF ni DPO; el ajuste es puramente supervisado. La innovacion tecnica destacable es el objetivo de despliegue: cuantizacion agresiva, cache KV en `Q8_0/Q8_0` y `swa_full=true` para la atencion de ventana deslizante intercalada (ISWA) de Gemma 3, orientada a mantener la RSS por debajo de 1850 MB en Android ARM64.

## Capacidades

- Generacion de texto conversacional en espanol e ingles con plantilla de chat Gemma 3 (`<start_of_turn>user ... <end_of_turn>`).
- Identidad consistente como asistente "Aura 100% offline", sin depender de prompt de sistema.
- Razonamiento matematico basico paso a paso, incluyendo resolucion algebraica (p. ej. ecuaciones cuadraticas).
- Generacion de codigo escolar en Python y C++ (se menciona `std::unique_ptr` como caso verificado).
- Explicacion de conceptos de ciencias naturales en espanol (fotosintesis, ciclo de Calvin, biologia celular).
- Respuestas honestas ante preguntas que requieren informacion en tiempo real (declara no tener acceso a internet).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales, de vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente educativo offline en Android: integrado en la app Aura, responde dudas escolares de matematicas y ciencias sin conexion, encajando en el presupuesto de RAM de gama de entrada gracias a sus 768,72 MiB de pesos y cache KV cuantizada.
- Tutoria de matematicas de secundaria: el ajuste sobre `gsm8k-translated-spanish` permite resolver problemas aritmeticos y algebraicos paso a paso en espanol, adecuado para ejercicios guiados en aula o autoestudio.
- Apoyo en asignaturas de ciencias naturales: las 400 muestras de `natural_science_spanish_exam` permiten explicar conceptos como fotosintesis o biologia celular con terminologia escolar en espanol.
- Ensenanza introductoria de programacion: genera ejemplos funcionales en Python y C++, util para un entorno de practicas sin conexion donde el alumno no dispone de acceso a servicios en la nube.
- Correctores ortograficos asistidos con RAG: el propio autor senala que la acentuacion estricta requiere apoyo externo; combinado con el motor hibrido SQLite FTS4 + embeddings int8 de la app, puede usarse como capa de generacion sobre recuperacion documental.
- Despliegue en dispositivos sin conectividad o con restricciones de privacidad: al ser 100% offline, es apto para entornos escolares, rurales o con requisitos de no exfiltracion de datos.
- Prototipado rapido de chatbots en espanol sobre `llama.cpp`: su formato GGUF y su plantilla de chat permiten levantarlo con `llama-cli` o `llama-server` en pocos minutos para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento: `train_loss = 0.9138` y `mean_token_accuracy = 0.8224` sobre el conjunto de ajuste, que no son comparables con evaluaciones estandar (MMLU, GSM8K, HumanEval).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el autor fija un objetivo de `VmRSS <= 1850 MB` y un presupuesto total de 2 GB de RAM en el dispositivo; los pesos ocupan 768,72 MiB, el resto corresponde a cache KV (`Q8_0/Q8_0`) y overhead de `llama.cpp`.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en una NVIDIA A100-SXM4-80GB, pero la inferencia objetivo es CPU ARM64 en Android.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050 o superiores); tambien en CPU.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), y por extension cualquier runtime compatible con GGUF; no se documenta soporte verificado de vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Parametros de muestreo recomendados por el autor: `--temp 0.1`–`0.3`, `--repeat-penalty 1.12` con ventana 32–64, cache KV `Q8_0/Q8_0` y `swa_full=true`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Aura 1B Edge (este modelo) | ~1B | no disponible | GGUF `Q4_K_M` | Gemma Terms of Use | Asistente educativo offline en espanol para Android |
| google/gemma-3-1b-it | ~1B | no disponible en la informacion proporcionada | safetensors BF16 | Gemma Terms of Use | Modelo base instructivo generalista, sin ajuste en espanol |
| unsloth/gemma-3-1b-it | ~1B | no disponible en la informacion proporcionada | safetensors BF16 | Gemma Terms of Use | Espejo BF16 del base usado como punto de partida |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. La diferencia practica de Aura 1B Edge frente al base es el ajuste LoRA en espanol, la identidad propia y la conversion a GGUF 4-bit para despliegue en movil.

## Limitaciones y advertencias

- Modelo de 1B parametros a 4 bits: conocimiento general limitado y propenso a errores en temas fuera de su conjunto de ajuste (matematicas escolares, ciencias naturales basicas, programacion introductoria e identidad).
- Sin acceso a informacion en tiempo real ni a internet; el propio autor indica que declara esta limitacion en lugar de inventar respuestas, pero el riesgo de alucinacion persiste en consultas factuales.
- Ortografia espanola estricta: la model card advierte que la acentuacion de agudas, graves y esdrujulas puede fallar sin apoyo externo; en produccion se recomienda combinar con RAG o un corrector.
- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Gemma 3 y de `alpaca-gpt4-spanish`, puede heredar sesgos del modelo base y de los datos sinteticos de Alpaca.
- Contexto: la longitud de contexto no se confirma en la model card; no asumir la ventana de Gemma 3 1B IT sin verificacion previa en el despliegue.
- Licencia: se rige por los Gemma Terms of Use, que imponen obligaciones adicionales (incluida la redistribucion de los terminos y restricciones de uso aceptable) mas alla de una licencia permisiva tipo Apache o MIT; revisar antes de uso comercial.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni validacion externa; tratarlo como un experimento de autor individual, no como un modelo listo para produccion a gran escala.
- Dataset de ajuste pequeno (2.026 ejemplos): riesgo de sobreajuste a los estilos de respuesta del conjunto curado y cobertura limitada de temas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shebxyd/aura-1b-edge
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Punto de partida BF16: https://huggingface.co/unsloth/gemma-3-1b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset de matematicas: https://huggingface.co/datasets/ericrisco/gsm8k-translated-spanish
- Dataset de ciencias naturales: https://huggingface.co/datasets/johanobandoc/natural_science_spanish_exam
- Dataset Alpaca GPT4 en espanol: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-spanish
