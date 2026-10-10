# SargeDev/JEV-27B-VL-Uncensored

## Resumen

JEV-27B-VL-Uncensored es un derivado multimodal de la familia JEV 27B publicado por el usuario SargeDev en HuggingFace. Se construye fusionando el bloque de decisión System-1 de AutoTrust (decisiones tipadas y calibradas: sí/no, elección entre 2 y 256 opciones y puntuación de 0 a 5, resueltas en un único forward pass) sobre el backbone Qwen3.8-27B abliterado de huihui-ai, que ha sido despojado de su cableado de rechazo en las capas 18 a 51 y mantiene intacta la torre de visión. El resultado es, según su autor, el primer miembro sin censura de la familia JEV 27B, orientado a servir como motor de decisión en lugar de como chatbot generalista.

El modelo combina dos modos de funcionamiento: un System 1 que produce decisiones tipadas a través de una cabeza de decisión de 24 slots (proyección 5120→24) con logits calibrados por temperatura, y un System 2 que es el propio modelo base conversacional, ejecutado por el `lm_head` habitual. Cuenta con 26.895.998.464 parámetros (unos 26,9 mil millones) en formato transformers/safetensors, con un repositorio de 53,8 GB, licencia Apache-2.0 y pesos multimodales imagen-texto.

Su relevancia actual es doble: por un lado, demuestra un patrón de reutilización de adaptadores de decisión calibrados sobre backbones alternativos; por otro, documenta de forma inusualmente honesta el coste de ese intercambio, con una tabla de evaluación que cuantifica la pérdida de precisión al sustituir el backbone original por uno abliterado. No es un modelo de propósito general ni apto para decisiones de alto riesgo, tal y como advierte su propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con torre de visión y merger; receta "Blocks-of-Experts" para el bloque de decisión System-1; cabeza de decisión de 24 slots (proyección 5120→24) |
| Parámetros totales | 26.895.998.464 (≈26,9 B), dato real de safetensors |
| Parámetros activos | No aplica (no se declara como MoE) |
| Longitud de contexto | 32.768 tokens (según el script de servicio `serve_decide.py`, `--max-model-len 32768`); no confirmado de forma explícita en la model card |
| Tipos de cuantización | No disponible (el repositorio solo distribuye pesos en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato transformers); incluye `head.safetensors` para la cabeza de decisión y un adaptador LoRA para vLLM (`adapter_vllm`) |

## Arquitectura y entrenamiento

La arquitectura parte del backbone Qwen3.8-27B, un transformer denso, sobre el que huihui-ai aplicó una abliteración en las capas 18 a 51 (la torre de visión quedó sin tocar). Sobre ese backbone, SargeDev fusiona el bloque de decisión System-1 de AutoTrust, originalmente implementado como un LoRA de rango 16/32 más una cabeza de decisión de 24 slots que se usa en tiempo de servicio con sesgo y temperatura. La variante VL incorpora torre de visión y merger, por lo que acepta entradas imagen-texto; el MTP (multi-token prediction) se ha eliminado siguiendo la convención de AutoTrust.

El entrenamiento se realizó sobre SargeDev/jev-distill-corpus-v3, un corpus de 740.957 filas de decisiones tipadas y calibradas (noul, choice y score) destiladas del profesor cerrado Jev 1.13 (System One, de TypeSafe AI). La calibración y la imatrix emplearon 384 prompts de SargeDev/solar-decisions-corpus-v4, todavía privado. El autor advierte de que la abliteración reconfigura el residual stream contra el que se calibró el adaptador, por lo que la distorsión resultante tiene forma de temperatura y el reajuste de calibración incluido (`calibration_mergedfit.json`) recupera todos los umbrales de ECE. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni fases de RLHF o DPO.

## Capacidades

- Decisión tipada en un único forward pass: sí/no (noul), elección entre 2 y 256 opciones (choice) y puntuación de 0 a 5 (score).
- Probabilidades calibradas por tipo de decisión, con temperaturas de ajuste propias y refit incluido en el repositorio.
- Comprensión de imágenes: la variante VL incluye torre de visión y merger, por lo que acepta entradas imagen-texto.
- Generación de texto, chat y razonamiento (System 2) a través del `lm_head` del modelo base.
- Integración con vLLM mediante un servidor compatible con la API de OpenAI y un endpoint específico `POST /v1/decide`.
- Comportamiento sin censura: tasa de rechazo de 0,0 en una batería de 10 prompts, idéntica entre el base y el base más JEV.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: no documentados explícitamente en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; el diseño está orientado a decisiones puntuales, no a planificación de largo horizonte.

## Casos de uso

- Enrutado automático de peticiones: el endpoint `/v1/decide` con `kind: "choice"` permite clasificar una consulta entrante entre un conjunto cerrado de categorías (por ejemplo, 16 intents) en un solo forward pass, lo que reduce la latencia frente a generar texto y parsearlo.
- Filtrado y moderación con umbral calibrado: la decisión binaria noul, con AUROC de 0,985 y ECE reajustada de 0,0032, sirve para aceptar o descartar contenido aplicando un umbral de confianza y derivando los casos dudosos a revisión humana.
- Puntuación de calidad de datos sintéticos: la salida `score` de 0 a 5 permite etiquetar pares instrucción-respuesta en pipelines de curación de datasets, con ECE reajustada de 0,0046 tras el refit de temperatura.
- Extracción de decisiones sobre documentos con imagen: al disponer de torre de visión, puede evaluar capturas, formularios escaneados o diagramas y emitir una decisión tipada sobre ellos.
- Sistemas de soporte a la decisión con derivación por confianza: en triaje documental o verificación de requisitos, el modelo emite una decisión y una probabilidad, y las llamadas de baja confianza se escalan a un modelo mayor o a un humano, tal y como recomienda el propio autor.
- Generación conversacional sin restricciones de rechazo: el System 2 mantiene el comportamiento del Qwen base abliterado, lo que resulta útil en investigación sobre alineación, evaluación de sesgos y estudios de robustez donde la tasa de rechazo interfiere con la medición.
- Investigación sobre calibración y adaptadores de decisión: el repositorio incluye `calibration.json`, un refit propio, la configuración de la cabeza y el harness de servicio, lo que lo convierte en un caso de estudio reproducible para medir el impacto de cambiar de backbone sobre un adaptador ya calibrado.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre el `test_set_30k` retenido (27.695 filas, excluyendo D1) de `jev-distill-corpus-v3`, comparando con el JEV-27B original de AutoTrust sobre backbone Qwen prístino:

| Métrica | JEV-27B original | Este modelo (backbone sin censura) | Umbral del autor | Estado |
|---|---|---|---|---|
| noul AUROC | 0,9961 | 0,985 | >= 0,95 | PASS |
| noul top-1 | 0,962 | 0,930 | — | -3,2 puntos |
| choice top-1 | 0,904 | 0,855 | >= 0,90 | -4,9 puntos |
| score top-1 | 0,890 | 0,797 | >= 0,891 | -9,3 puntos |
| KL global | 0,019 | 0,055 | <= 0,15 | PASS |
| ECE (bruta) | 0,0011 | 0,033 | <= 0,03 | En el umbral |
| ECE (refit T: 0,7 / 0,8 / 0,9) | — | noul 0,0032 / choice 0,018 / score 0,0046 | <= 0,03 | PASS |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica que los resultados de la batería de decisiones con visión se añadirán cuando estén finalizados.

## Requisitos de hardware

- VRAM estimada: en bf16/fp16, aproximadamente 54 GB solo para pesos (el repositorio ocupa 53,8 GB), más la caché KV correspondiente a contextos de hasta 32.768 tokens.
- GPU recomendadas: una A100 80 GB o H100 80 GB permite servir el modelo completo en precisión de 16 bits con contexto largo; no se documentan cifras oficiales de throughput ni latencia.
- GPU de consumo: no cabe en una única GPU de consumo en bf16. Sería necesario repartir entre varias (por ejemplo, 2× RTX 4090 de 24 GB, 48 GB en total) y aun así quedaría muy justo, o bien aplicar cuantizaciones que el repositorio no distribuye actualmente.
- Opciones de despliegue: la model card documenta vLLM a través de `serve_decide.py`, con `--enable-lora`, `--max-lora-rank 32`, `--lora-modules jev-decision=./adapter_vllm`, `--logprobs-mode processed_logprobs`, `--max-model-len 32768` y `--trust-request-chat-template`. Al distribuirse en formato transformers, también es compatible con TGI y con el ecosistema HuggingFace Transformers.
- llama.cpp y Ollama: no disponibles, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles. Cabe señalar que la decisión tipada se resuelve en un único forward pass, lo que estructuralmente es más rápido que generar y parsear texto, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SargeDev/JEV-27B-VL-Uncensored | 26,9 B | 32.768 tokens (según script de servicio) | Apache-2.0 | Pesos safetensors en HF; sin GGUF | Backbone abliterado; peor top-1 en choice y score que el original, con recalibración de temperaturas |
| autotrust/JEV-27B | No disponible | No disponible | Apache-2.0 | Pesos en HF | Referencia de la familia; backbone Qwen prístino. noul AUROC 0,9961, choice top-1 0,904, score top-1 0,890 |
| autotrust/JEV-27B-VL | No disponible | No disponible | Apache-2.0 | Pesos en HF | Variante con visión de la línea original, sin abliterar |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | ≈27 B (no confirmado en la información disponible) | No disponible | Apache-2.0 | Pesos en HF | Backbone base de este modelo; capas 18-51 abliteradas, torre de visión intacta |
| Qwen/Qwen3.8-27B | ≈27 B (no confirmado) | No disponible | Apache-2.0 | Pesos en HF | Modelo base original de la cadena |

## Limitaciones y advertencias

- No apto para decisiones de alto riesgo. La propia model card lo indica: hay que usar gating por confianza y derivar las llamadas de baja confianza a un modelo mayor o a un humano.
- Pérdida medible de precisión respecto al JEV-27B original: -3,2 puntos en noul top-1, -4,9 en choice top-1 y -9,3 en score top-1. Además, la métrica de score (0,797) queda por debajo de los umbrales de aceptación del autor (0,891) y choice top-1 (0,855) también incumple su suelo de 0,90.
- La calibración bruta se sitúa en el límite del umbral (ECE 0,033 frente a un máximo de 0,03); solo el refit de temperaturas incluido recupera todos los suelos, por lo que es obligatorio aplicar `calibration_mergedfit.json` en producción.
- Modelo abliterado: al eliminar el cableado de rechazo (tasa de 0,0 en una batería de 10 prompts), no aplica salvaguardas de contenido. Puede generar material dañino, ilegal o sesgado sin filtrado propio. La batería de 10 prompts es, además, una muestra muy reducida.
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni de factualidad fuera del corpus de decisiones. Las decisiones tipadas calibradas no deben interpretarse como garantía de corrección semántica.
- Idiomas soportados: no disponibles. No se documenta cobertura multilingüe ni comportamiento fuera del inglés.
- Etiquetado inconsistente: el pipeline declarado es `text-classification`, pero el modelo es generativo y multimodal; conviene no fiarse de ese campo para decidir la integración.
- Corpus de calibración privado (SargeDev/solar-decisions-corpus-v4) y profesor original cerrado (Jev 1.13, no redistribuido), lo que limita la reproducibilidad completa del pipeline de entrenamiento y calibración.
- Licencia Apache-2.0, permisiva para uso comercial, pero hereda las condiciones de los componentes de la cadena (AutoTrust, huihui-ai, Qwen), todos declarados Apache-2.0.
- El repositorio indica 0 descargas y 0 likes, y las fechas de creación y actualización son del 10 de octubre de 2026, con apenas siete minutos entre ambas: es un artefacto recién publicado y sin validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SargeDev/JEV-27B-VL-Uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo de referencia de AutoTrust: https://huggingface.co/autotrust/JEV-27B
- Variante con visión de AutoTrust: https://huggingface.co/autotrust/JEV-27B-VL
- Backbone abliterado de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (papers, blogs, repositorios o demos): no disponibles.
