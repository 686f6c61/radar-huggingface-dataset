# autotrust/GEV-26B-Decide-NVFP4

## Resumen

GEV-26B-Decide-NVFP4 es la versión cuantizada en NVFP4 de GEV-26B-Decide, un modelo de decisión multimodal desarrollado por autotrust sobre la arquitectura Gemma 4. Su propósito no es la generación de texto libre, sino la producción de decisiones tipadas con probabilidades calibradas: el modelo recibe una entrada (texto o imagen) y devuelve una elección entre opciones junto con una puntuación de confianza, siguiendo un esquema de "System 1" (respuesta rápida y directa) o "System 2" (razonamiento adaptativo) según la tarea.

La innovación principal de esta variante es la cuantización selectiva: solo los 3.840 MLPs de expertos enrutados (30 capas × 128 expertos) se convierten a NVFP4, mientras que la atención, el MLP denso, los routers, la torre de visión, el lm_head y el adaptador System 1 permanecen en bf16. Esto reduce el peso de 49,5 GB a 18 GB y la memoria GPU en vLLM de 51,1 GiB a 17,1 GiB (−66 %), permitiendo desplegar el modelo completo en una GPU de 24 GB.

El modelo es relevante ahora porque demuestra que la cuantización FP4 de precisión mixta sobre arquitecturas MoE multimodales puede preservar el rendimiento de decisión (las diferencias en GPQA Diamond y HLE están dentro del ruido de ejecución) mientras se reduce drásticamente el coste de despliegue. La licencia Apache 2.0 y la compatibilidad con vLLM sin flags adicionales facilitan su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Gemma 4), con cabecera de decisión y adaptador System 1 (LoRA) |
| Parámetros totales | 14.386.943.566 (según safetensors); el autor describe 24 B en parámetros de expertos y el nombre comercial indica 26 B |
| Parámetros activos | no disponible (MoE con 128 expertos por capa, 30 capas; número de expertos activos no especificado) |
| Longitud de contexto | no disponible (el autor sugiere `MAX_MODEL_LEN=32768` como ejemplo de configuración) |
| Tipos de cuantización | NVFP4 (FP4 E2M1 con escala FP8 E4M3 por grupo de 16 y escala FP32 por tensor) en expertos enrutados; resto en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (layout ModelOpt NVFP4, `quant_method: modelopt`) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 con arquitectura Mixture-of-Experts: 30 capas, cada una con 128 expertos enrutados, además de atención, MLP denso y router. Sobre esta base, autotrust añade un adaptador LoRA (System 1) y una cabecera de decisión que produce elecciones tipadas con probabilidades calibradas y temperaturas ajustadas. El modelo es multimodal (image-text-to-text) e incluye una torre de visión. La variante NVFP4 cuantiza únicamente las proyecciones gate, up y down de los expertos enrutados; gate y up comparten una escala de tensor porque vLLM las fusiona. Las activaciones de los expertos usan escalas estáticas calibradas sobre 3.072 prompts System 1 de los splits de calibración del propio modelo. Se emplea el layout ModelOpt NVFP4 y la misma lista de exclusión que `nvidia/Gemma-4-26B-A4B-NVFP4`, de modo que vLLM carga el checkpoint sin flags adicionales.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en la información proporcionada. La model card menciona un esquema de "adaptive thinking" en el que las áreas de Conocimiento y Razonamiento usan System 2 (razonamiento) mientras el resto usa System 1 (decisión directa).

## Capacidades

- Decisión tipada con probabilidades calibradas: devuelve una elección (`choice`) y una puntuación (`score`) en lugar de texto libre.
- Modo dual System 1 / System 2 con "adaptive thinking": System 1 para decisiones rápidas (aproximadamente medio segundo según el autor) y System 2 para razonamiento adaptativo en conocimiento y razonamiento.
- Procesamiento multimodal image-text-to-text mediante torre de visión.
- Clasificación de texto y ranking (pipeline `text-classification`).
- Soporte de tool calling y function calling no confirmado explícitamente; las etiquetas incluyen "Tools & Automation" como área evaluada, pero no se detalla la interfaz.
- Capacidades de agente y razonamiento multi-paso no detalladas en la información disponible.
- Multilingüe: solo inglés declarado.
- Despliegue en vLLM con kernels NVFP4 nativos (W4A4 en SM100/SM12x) o Marlin W4A16 en SM80–90.

## Casos de uso

- Ranking de noticias por importancia: el modelo puntúa titulares de múltiples fuentes y devuelve un orden calibrado, como en la demo GuruSearch con 6 feeds. Adecuado por su latencia de System 1 (~0,5 s) y sus probabilidades calibradas.
- Re-ranking de resultados de búsqueda: recibe pares consulta-resultado y asigna relevancia calibrada, comparándose con el orden de Google News, Bing News y Yahoo News en la demo del autor.
- Respuestas cortas con citas: genera una respuesta breve fundamentada en los resultados recuperados, usando la cabecera de decisión para seleccionar y puntuar candidatos.
- Filtrado y clasificación de contenido en pipelines de datos: clasificación de texto con probabilidades calibradas para umbrales ajustables en producción.
- Evaluación de opciones en sistemas de recomendación: selección entre alternativas con score de confianza, útil para motores de recomendación que necesitan decisiones auditables.
- Moderación o triaje con visión: al ser multimodal, puede clasificar pares imagen-texto (por ejemplo, verificar correspondencia entre una imagen y su descripción) con una puntuación de confianza.
- Despliegue en hardware de gama media: al ocupar 17,1 GiB de pesos, cabe en GPUs de 24 GB para contextos cortos, lo que permite prototipado y servicios de baja concurrencia en estaciones de trabajo.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados independientemente):

| Benchmark | GEV-26B-Decide (bf16) | GEV-26B-Decide-NVFP4 |
|---|---:|---:|
| Decision Index 0.2.1 (balanced skill) | 62,48 | no disponible |
| Balanced raw | 70,66 | no disponible |
| Breadth skill | 62,00 | no disponible |
| GPQA Diamond, System 1 (198 preguntas) | 43,9 % | 44,9 % |
| HLE texto opción múltiple, System 1 (513 preguntas) | 8,4 % | 9,7 % |

Comparativa del Decision Index frente a otro sistema:

| Sistema | Decision Index 0.2.1 (balanced skill) |
|---|---:|
| GEV-26B-Decide, adaptive thinking | 62,48 |
| TypeSafe Jev 1.13 (board) | 57,91 |

El autor indica que las diferencias entre bf16 y NVFP4 en GPQA Diamond y HLE están dentro del ruido entre ejecuciones (aproximadamente ±7 puntos con 198 preguntas). No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en NVFP4: 18 GB de descarga; 17,1 GiB de memoria GPU en vLLM (−66 % frente a 51,1 GiB en bf16).
- Cabe en GPU de 24 GB con espacio para contexto corto; recomendable 32 GB (RTX 5090) o 48 GB para contextos largos y alta concurrencia.
- B200 / B300 / GB200 (SM100): W4A4 nativo con kernels FlashInfer TRT-LLM NVFP4 MoE (probado en B200).
- RTX PRO 6000, RTX 5090, DGX Spark (SM12x): W4A4 nativo con kernels CUTLASS / FlashInfer CUTLASS FP4 (no probado por el autor en esta variante).
- H100 / H200 / A100 (SM80–90): Marlin W4A16 (pesos FP4, activaciones bf16; no probado por el autor en esta variante).
- Despliegue: vLLM con `serve.sh` incluido; requiere el parche `patches/vllm-gemma4-lm-head-lora.patch` (LoRA sobre el `lm_head` atado de Gemma 4) y una build de desarrollo de vLLM de septiembre de 2026. La ruta `transformers` + `peft` carga pesos bf16 y debe usarse con el repositorio bf16.
- Configuración: ajustar `--gpu-memory-utilization` y `MAX_MODEL_LEN` (ejemplo del autor: 32768).
- Latencia y throughput: el autor cita decisiones System 1 en aproximadamente medio segundo en la demo; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GEV-26B-Decide-NVFP4 | 14,39 B (safetensors); 24 B en expertos según autor | no disponible | Decisión tipada multimodal MoE, cuantizado NVFP4 | Apache 2.0 | Hugging Face, vLLM |
| GEV-26B-Decide (bf16) | 24 B en expertos según autor; 49,5 GB de pesos | no disponible | Decisión tipada multimodal MoE, bf16 | Apache 2.0 | Hugging Face, vLLM, transformers |
| nvidia/Gemma-4-26B-A4B-NVFP4 | no disponible | no disponible | Gemma 4 MoE cuantizado NVFP4 (referencia de layout) | no disponible | Hugging Face |
| TypeSafe Jev 1.13 (board) | no disponible | no disponible | Sistema de decisión evaluado en Decision Index | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas fuera del Decision Index y los benchmarks citados.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte multilingüe declarado.
- El modelo está diseñado para decisiones tipadas, no para generación de texto libre; usarlo como LLM conversacional general no es su propósito.
- Riesgo de alucinación no evaluado en la información disponible; al ser un modelo de decisión con puntuaciones calibradas, la calibración puede degradarse fuera de la distribución de los prompts de calibración.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La variante NVFP4 solo ha sido probada por el autor en B200; el soporte en SM12x y SM80–90 no está probado en esta variante.
- Requiere un parche específico de vLLM y una build de desarrollo (septiembre de 2026), lo que añade fragilidad en producción.
- Los prompts System 1 deben comenzar con `<bos>` y usar `top_k: 0` y `top_p: 1.0` si se llama directamente a `/v1/completions`.
- La licencia Apache 2.0 se acompaña de un enlace a la licencia de Gemma 4; conviene revisar las condiciones de uso comercial de Gemma 4 antes de desplegar.
- El número de parámetros del safetensors (14,39 B) no coincide con el nombre comercial (26B) ni con los 24 B de expertos citados por el autor; verificar la contabilidad de parámetros antes de dimensionar infraestructura.
- No se dispone de información sobre sesgos conocidos ni sobre el volumen y composición de los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/autotrust/GEV-26B-Decide-NVFP4
- Modelo base bf16: https://huggingface.co/autotrust/GEV-26B-Decide
- Demo GuruSearch: https://news.guru.so/ui
- Referencia de layout NVFP4: https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
