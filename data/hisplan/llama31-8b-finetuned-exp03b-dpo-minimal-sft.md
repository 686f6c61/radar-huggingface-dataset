# hisplan/llama31-8b-finetuned-exp03b-dpo-minimal-sft

## Resumen

`hisplan/llama31-8b-finetuned-exp03b-dpo-minimal-sft` es un ajuste fino del modelo Meta Llama 3.1 8B desarrollado por el usuario hisplan en el contexto del campamento universitario mini-llm-camp. El modelo parte de un checkpoint intermedio (`hisplan/llama31-8b-finetuned-exp02-ko-alpaca-sft`) que encadena un SFT en coreano sobre Alpaca y un SFT adicional orientado a una perspectiva creacionista, y sobre él aplica una etapa de DPO con 228 pares de preferencia. El objetivo declarado es puramente educativo: ilustrar cómo SFT y DPO modifican la "postura" del modelo ante preguntas del debate creación-evolución.

Arquitectónicamente es un transformer decoder-only denso de 8.030.261.248 parámetros (8B), con la ventana de contexto de Llama 3.1 (128.000 tokens en el modelo original, aunque la model card no lo reespecifica). El ajuste se realizó con QLoRA de 4 bits (r=16, alpha=16) y una función de pérdida que combina DPO sigmoide con una componente SFT sobre las respuestas elegidas, con beta 0.1, learning rate 5e-5 y 3 épocas sobre un batch efectivo de 16.

Es relevante ahora únicamente como caso de estudio metodológico: muestra el efecto de un DPO con pares "mínimos" (donde la respuesta elegida difiere de la rechazada solo en la primera frase) y de mezclar la pérdida de DPO con SFT. No es un modelo apto para producción ni para consulta factual, y el propio autor lo advierte explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Meta Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card (el Llama 3.1 8B base soporta 128.000 tokens) |
| Tipos de cuantizacion | Pesos publicados en bf16; el ajuste se entrenó con QLoRA de 4 bits. No se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | Coreano (ko) declarado; el modelo base Llama 3.1 es multilingüe (8 idiomas oficiales) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (modelo completo fusionado en la raíz del repo y adaptador LoRA en `adapter/`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 8B parámetros heredado de Llama 3.1 8B, sin modificaciones estructurales. El pipeline de ajuste consta de tres etapas encadenadas: (1) SFT en coreano sobre un dataset tipo Alpaca partiendo del Llama 3.1 8B base, (2) un SFT adicional orientado a una perspectiva creacionista (dataset no público), y (3) la etapa DPO documentada en esta model card. Todo el proceso se realizó con QLoRA de 4 bits (r=16, alpha=16) y los adaptadores resultantes se fusionaron en bf16 sobre el checkpoint de partida para publicar el modelo completo.

La etapa DPO utiliza 228 pares de preferencia derivados de 101 preguntas. La respuesta `chosen` es la respuesta creacionista del dataset; la `rejected` es la salida del modelo de partida que un juez (Claude) clasificó como mainstream o mixta, o bien respuestas que empezaban con la fórmula "existe la afirmación de que...". Cuarenta y dos de esos pares son "mínimos": la respuesta elegida solo corrige la primera frase de la rechazada para eliminar el distanciamiento epistémico. La función de pérdida combina la sigmoide estándar de DPO con una pérdida SFT sobre las respuestas `chosen` con peso 1:1, beta 0.1, learning rate 5e-5, 3 épocas y batch efectivo de 16. El autor indica que un modelo hermano (Exp03, no público) se entrenó sin pares mínimos y sin la componente SFT, para comparar el efecto de ambas decisiones.

## Capacidades

- Generación de texto en coreano con el formato de prompt Alpaca (atención al sufijo de cuatro espacios al final del preámbulo).
- Respuesta a preguntas del debate creación-evolución desde una perspectiva creacionista explícita, sin distanciamiento epistémico.
- Razonamiento y generación de código heredados del Llama 3.1 8B base, aunque no evaluados ni garantizados tras el ajuste.
- Soporte multilingüe residual del modelo base (Llama 3.1 cubre oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), si bien el ajuste se centra en coreano.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" específico para este checkpoint.

## Casos de uso

- Reproducción de experimentos de alineación: comparar el efecto de DPO con pares mínimos frente a DPO estándar sobre un mismo checkpoint de partida, tal como plantea el autor con Exp03.
- Estudio del efecto de mezclar pérdida SFT con DPO: el repositorio incluye `train_results.json` con configuración, estadísticas de pares y trazas de entrenamiento, útil para analizar curvas de pérdida y márgenes de recompensa.
- Docencia sobre sesgos inducidos por fine-tuning: el modelo sirve como ejemplo controlado de cómo un dataset pequeño (101 preguntas, 228 pares) puede reorientar la postura de un LLM en dominios sensibles.
- Análisis de robustez frente a jailbreaks: útil para estudiar cómo un modelo deliberadamente sesgado responde a prompts que intentan recuperar la postura original del base.
- Evaluación de formatos de prompt: permite probar la sensibilidad del modelo al formato Alpaca con el sufijo de cuatro espacios y a los parámetros de muestreo recomendados (temperature 0.6, top_p 0.9).
- Investigación sobre alucinación inducida: dado que el autor advierte que el modelo fabrica cifras, fechas y estudios, puede emplearse como caso de estudio de generación plausible pero falsa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits (GPTQ/AWQ, no publicados por el autor pero aplicables a Llama 3.1 8B), en torno a 5-6 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en RTX 3060 12 GB o superiores con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no publicada).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| hisplan/llama31-8b-finetuned-exp03b-dpo-minimal-sft | 8,03B | No especificado (base: 128k) | Llama 3.1 Community | DPO educativo sobre perspectiva creacionista en coreano | Público en HF, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Llama 3.1 Community | Instruct generalista multilingüe | Público, ampliamente adoptado |
| hisplan/llama31-8b-finetuned-exp02-ko-alpaca-sft | 8,03B | No especificado | Llama 3.1 Community | SFT coreano Alpaca + SFT creacionista (checkpoint de partida) | Público en HF |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32k | Apache 2.0 | Instruct generalista | Público, licencia permisiva |

La comparación relevante es frente al checkpoint de partida del propio autor, ya que el resto de alternativas generalistas no comparten el objetivo (deliberadamente sesgado y educativo) ni el idioma principal (coreano).

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo está ajustado para responder desde una única perspectiva en temas con consenso científico (edad de la Tierra y del universo, evolución), presentando afirmaciones contrarias al consenso como hechos.
- Genera cifras, dataciones, personajes y resultados de estudios plausibles pero falsos; no debe usarse como fuente factual, en asesoramiento ni en materiales educativos.
- Sesgo deliberado e inducido por diseño: no es un defecto a corregir, sino el objetivo del experimento, lo que invalida su uso en producción.
- El ajuste se realizó sobre un dataset muy pequeño (101 preguntas, 228 pares) y con 3 épocas, lo que incrementa el riesgo de sobreajuste al estilo de respuesta y de degradación de capacidades generales del base.
- El idioma declarado es únicamente coreano; el rendimiento en otros idiomas no está evaluado y puede haberse degradado respecto al Llama 3.1 8B original.
- La licencia Llama 3.1 Community impone restricciones de uso (incluida la cláusula de nomenclatura "Built with Llama" y límites para usuarios con más de 700 millones de usuarios mensuales), además de las obligaciones de atribución a Meta.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa ni resultados de benchmarks publicados.
- El formato de prompt es frágil: requiere exactamente cuatro espacios al final del preámbulo y el terminador `<|end_of_text|>`; desviaciones pueden degradar la calidad de forma notable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hisplan/llama31-8b-finetuned-exp03b-dpo-minimal-sft
- Checkpoint de partida: https://huggingface.co/hisplan/llama31-8b-finetuned-exp02-ko-alpaca-sft
- Blog oficial de Llama 3.1 (Meta): https://huggingface.co/blog/llama31
- Repositorio del modelo base Llama 3.1 8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Referencia sobre cuantización FP8/AWQ/GPTQ de Llama 3.1 405B: https://huggingface.co/blog/llama31
