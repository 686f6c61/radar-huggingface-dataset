# harshcasper/bsis-qwen2.5-1.5b-scam-detector-GGUF

## Resumen

BSIS Scam Detector GGUF es la exportación cuantizada del detector de estafas Student B del pipeline BSIS, un ajuste fino mediante LoRA sobre Qwen2.5-1.5B-Instruct que el autor (harshcasper) ha fusionado en fp16 y convertido a formato GGUF para inferencia totalmente offline en dispositivos móviles. El modelo recibe un único mensaje SMS o de WhatsApp y devuelve un objeto JSON estricto con tres campos: `scam_probability` (0.0-1.0), `tactics` (identificadores de táctica de la taxonomía BSIS) y `warning` (aviso localizado en el idioma del usuario). Su propósito es actuar como filtro de primera pasada en el propio teléfono, sin conexión ni servidores externos.

La relevancia del modelo está en su enfoque: 1.543.714.304 parámetros (1,5B) y dos cuantizaciones publicadas (Q8_0 de 1,53 GiB y Q4_K_M de 940,5 MiB) que caben en un smartphone Android de gama media y se ejecutan con llama.cpp o PocketPal AI. Cubre 23 idiomas, con especial atención a lenguas indias (hindi, bengalí, maratí, tamil, telugu, guyaratí, canarés, malabar, urdu, asamés, entre otras), lo que lo hace útil para el contexto para el que fue diseñado: usuarios en India que reciben estafas por SMS y mensajería.

La licencia es Apache 2.0, el repo ocupa 2,6 GB y no tiene descargas ni likes en el momento de redactar esta ficha, lo que indica que es un artefacto reciente y de nicho. Es importante subrayar que el propio autor documenta un recall de 0,2889 sobre el conjunto real de SMS, por lo que debe tratarse como un prefiltro y no como un veredicto final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B-Instruct, ajuste LoRA fusionado) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la verificación usa prompts de hasta 640 tokens y salidas de hasta 320 tokens) |
| Tipos de cuantizacion | Q8_0 (8 bits, 5,08 BPW en Q4_K_M según la model card) y Q4_K_M (4 bits) |
| Idiomas soportados | hi, en, bn, mr, ta, te, gu, kn, ml, or, pa, ur, as, brx, doi, kok, ks, mai, mni, ne, sa, sat, sd (23 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0 y Q4_K_M); el modelo base en safetensors fp16 |

## Arquitectura y entrenamiento

El modelo es un Qwen2.5-1.5B-Instruct afinado con LoRA y fusionado en fp16, según indica la model card. La arquitectura subyacente es un transformer decoder-only de la familia Qwen2.5, con 1.543.714.304 parámetros. Sobre esa base se aplicó un ajuste supervisado con el dataset `harshcasper/bsis`, generado de forma sintética por la "red-team arena" del pipeline BSIS sobre Sarvam Token Factory; no se usaron mensajes reales de usuarios. El modelo aprende a producir una salida JSON estricta con tres claves y a clasificar tácticas de la taxonomía BSIS.

Un detalle técnico crítico es que el modelo solo genera JSON válido cuando se le pasa un system prompt exacto, que proviene del entrenamiento y no debe modificarse: `You are an on-device scam detector for Indian users. Assess the latest message window and reply with strict JSON: {"scam_probability": <0.0-1.0>, "tactics": [<matching tactic ids>], "warning": "<if risky, one short warning in the user's language; else empty string>"}`. La conversión a GGUF se hizo con `convert_hf_to_gguf.py` y la cuantización con `llama-quantize` (llama.cpp b12608). El repo incluye además un Modelfile listo para Ollama y un script de verificación (`training/verify_gguf.py`) en el repositorio BSIS de GitHub.

## Capacidades

- Clasificación binaria de estafas en mensajes SMS y WhatsApp, con salida de probabilidad calibrada entre 0,0 y 1,0.
- Etiquetado de tácticas de manipulación mediante identificadores de la taxonomía BSIS (p. ej. `social_friend_emergency`, `urgency`, `authority`, `social_proof`).
- Generación de un aviso corto localizado en el idioma del usuario cuando el mensaje es riesgoso.
- Salida JSON estricta con las claves `scam_probability`, `tactics` y `warning`, validable de forma programática.
- Soporte multilingüe para 23 idiomas, con foco en lenguas indias y en inglés; incluye casos de hinglish documentados en la model card.
- Inferencia totalmente offline en dispositivo (on-device), sin llamadas a red.
- Ejecución con llama.cpp, Ollama y PocketPal AI en Android.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Filtro de primera pasada en el móvil: integrado en una app Android mediante PocketPal AI o llama.cpp, el modelo lee cada SMS entrante y devuelve una probabilidad; si supera 0,5 se muestra el aviso al usuario. Es adecuado por su tamaño (940 MiB en Q4_K_M) y su funcionamiento sin conexión.
- Detección de estafas de emergencia entre contactos: el modelo reconoce el patrón de "número nuevo" y amigo en apuros (`social_friend_emergency`) en hinglish, como se documenta en los smoke prompts, y genera un aviso que recomienda llamar al contacto real.
- Protección frente a fraudes de lotería y pagos UPI: identifica tácticas de urgencia, autoridad y prueba social en hindi y produce un aviso que advierte de que ninguna entidad legítima solicita dinero por UPI.
- Moderación en plataformas de mensajería: como prefiltro en un backend que procese lotes de mensajes, marcando candidatos para revisión humana; el formato JSON facilita el parseo y la integración en pipelines.
- Aplicaciones de alfabetización digital: mostrar al usuario por qué un mensaje es sospechoso a partir de las tácticas detectadas, con fines educativos en campañas de concienciación en India.
- Investigación sobre detección de fraude multilingüe: servir como línea base reproducible (el repo incluye script de verificación y `spot_check_50_rows.json`) para comparar con otros clasificadores en lenguas indias.
- Despliegue en kioscos o dispositivos de gama baja sin conectividad: el Q4_K_M de 940 MiB permite ejecutarlo en hardware con poca memoria, aceptando un mayor número de falsos positivos.

## Benchmarks y rendimiento

La model card incluye una verificación de cuantización sobre 50 filas estratificadas del conjunto de test BSIS (25 estafas / 25 seguras, semilla 1930, decodificación greedy, máximo 320 tokens, prompt limitado a 640 tokens, llama.cpp b12608). Sin embargo, los valores de las métricas aparecen como marcadores de plantilla sin sustituir (`{f16['json_valid_pct']}%`, `{q8['accuracy']}`, etc.), por lo que no es posible extraer cifras numéricas fiables.

| Metrica | f16 GGUF | Q8_0 | Q4_K_M |
|---|---|---|---|
| JSON estricto válido | no disponible (plantilla sin rellenar) | no disponible | no disponible |
| Claves requeridas presentes | no disponible | no disponible | no disponible |
| Accuracy | no disponible | no disponible | no disponible |
| Precision | no disponible | no disponible | no disponible |
| Recall | no disponible | no disponible | no disponible |
| F1 | no disponible | no disponible | no disponible |
| FPR | no disponible | no disponible | no disponible |
| Tokens/s (M3, Metal) | no disponible | no disponible | no disponible |

El único dato cuantitativo verificable es el recall de 0,2889 sobre el conjunto real de SMS para el modelo fp16, que la model card cita explícitamente en las advertencias. El autor indica que Q4_K_M mantiene la validez JSON y el F1, pero eleva el recall y el FPR respecto a f16; con 25 filas seguras, el escalón del FPR es de 0,04, por lo que la diferencia se considera real y no ruido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,53 GiB para Q8_0 y 940,5 MiB para Q4_K_M, más el overhead del runtime de llama.cpp y el contexto.
- GPU recomendadas: no se especifican; la verificación se ejecutó en un Apple M3 con Metal. Para servidor, cualquier GPU con al menos 2-3 GB de memoria libre es suficiente, aunque no hay datos publicados de rendimiento en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de VRAM (p. ej. GTX 1650, RTX 3050 en adelante) y en smartphones Android de gama media con 2 GB o más de RAM libre.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (Modelfile incluido), PocketPal AI en Android; también es compatible con endpoints según los tags del repo.
- Latencia y throughput: no disponibles de forma numérica; la model card menciona que en el M3 el Q4_K_M ronda los tokens/s indicados en la tabla, pero el valor aparece como plantilla sin rellenar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BSIS Scam Detector GGUF (este) | 1,5B | no disponible | 23 (foco en lenguas indias) | Apache 2.0 | GGUF |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | no disponible en la informacion | multilingüe amplio | Apache 2.0 | safetensors, GGUF |
| Modelos de clasificación de spam genéricos | no disponible | no disponible | normalmente inglés | variable | variable |

La comparación con alternativas específicas de detección de estafas en lenguas indias no está disponible en la información proporcionada. Frente a Qwen2.5-1.5B-Instruct, este modelo añade el ajuste LoRA para la tarea, la salida JSON estricta y la taxonomía de tácticas, a costa de requerir un system prompt fijo y de tener un recall limitado en datos reales.

## Limitaciones y advertencias

- Recall bajo en datos reales: 0,2889 sobre el conjunto real de SMS para el modelo fp16; las cuantizaciones heredan esta limitación, por lo que se pierden la mayoría de los spam. Debe usarse como prefiltro, no como veredicto final.
- Q4_K_M desplaza veredictos en mensajes seguros y eleva el FPR respecto a f16; se recomienda Q8_0 cuando los falsos positivos importan más que el almacenamiento. La model card documenta un caso de alerta de débito bancario legítima que Q4_K_M clasifica como 0,95 de estafa.
- Riesgo de alucinación de identificadores de táctica fuera de los vistos en entrenamiento; deben validarse contra la taxonomía BSIS.
- Dependencia de un system prompt exacto: sin él, el modelo no produce el JSON esperado; cambiarlo rompe el contrato de salida.
- Datos de entrenamiento sintéticos generados por la red-team arena de BSIS; no se usaron mensajes reales, lo que puede limitar la generalización a patrones reales.
- La verificación se hizo sobre solo 50 filas, por lo que las métricas se mueven en escalones gruesos y no constituyen un benchmark.
- Sesgos conocidos: no documentados en la información proporcionada; al estar entrenado para usuarios de India, su comportamiento fuera de ese contexto geográfico y lingüístico no está validado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshcasper/bsis-qwen2.5-1.5b-scam-detector-GGUF
- Modelo base (fp16): https://huggingface.co/harshcasper/bsis-qwen2.5-1.5b-scam-detector
- Dataset BSIS: https://huggingface.co/datasets/harshcasper/bsis
- Repositorio BSIS en GitHub: https://github.com/HarshCasper/BSIS
- PocketPal AI (Google Play): https://play.google.com/store/apps/details?id=com.pocketpalai
- PocketPal AI (F-Droid): https://f-droid.org/packages/com.pocketpalai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
