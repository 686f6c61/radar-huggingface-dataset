# linda23153/ViSeLA-Pretrain-HAM-LUPerson

## Resumen

ViSeLA-Pretrain-HAM-LUPerson es un checkpoint de preentrenamiento multimodal desarrollado por el grupo Flame-Chasers (Xinyu Zhou, Fan Li, Shasha Chen, Min Cao, Ahtamjan Ahmat, Qiaoming Zhu y Mang Ye), presentado en ACM Multimedia 2026. Resuelve la tarea de recuperación de imágenes de personas a partir de descripciones textuales (text-based person retrieval) en cuatro idiomas: inglés, chino, francés y alemán. El modelo combina un codificador visual BEiT-2 base, un codificador textual XLM-RoBERTa y un mecanismo de interacción multimodal para el reranking.

La innovación principal es el aprendizaje semántico multilingüe con enrutamiento de tokens textuales a expertos según su contenido semántico, junto con un alineamiento visión-lenguaje basado en consultas aprendibles compartidas. Este checkpoint concreto corresponde al epoch 1 de preentrenamiento sobre datos HAM en cuatro idiomas y LUPerson bilingüe, y está pensado como inicialización para fine-tuning posterior, no como modelo final de recuperación.

Es relevante porque aborda la recuperación de personas multilingüe escalable, un problema con aplicaciones en videovigilancia, búsqueda forense y análisis de contenido, y porque el paper recibió el Outstanding Paper Award en ACM MM 2026. El repo ocupa 1,8 GB y se distribuye como checkpoint PyTorch personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language con BEiT-2 base (visual), XLM-RoBERTa (texto) e interacción multimodal con 4 expertos semánticos y 4 consultas aprendibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE denso; usa enrutamiento a 4 expertos semánticos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precisión original) |
| Idiomas soportados | en, zh, fr, de |
| Licencia | research-only-upstream-terms (solo investigación, sujeta a términos upstream) |
| Formato de pesos | PyTorch `.th` (checkpoint personalizado) más `config.json`, `config.yaml` y `configs/config_beit2_base.json` |

## Arquitectura y entrenamiento

ViSeLA es un modelo vision-lenguaje para recuperación de personas. El pipeline combina un codificador visual BEiT-2 base con un codificador textual XLM-RoBERTa base y una etapa de interacción multimodal para reranking. El componente semántico multilingüe enruta tokens de texto a cuatro expertos según su contenido semántico, con una temperatura de enrutamiento de 1.0, y utiliza cuatro consultas aprendibles compartidas para alinear pistas visuales y textuales. La similitud final se calcula con `lsp_max` (LogSumExp).

Este checkpoint corresponde al epoch 1 de preentrenamiento sobre datos HAM en cuatro idiomas y LUPerson bilingüe. El modelo MultiPedes completo descrito en el paper usa un corpus de 10 millones de pares que incluye HAM y WebPerson; este release no incluye WebPerson. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron RLHF o DPO. El checkpoint se distribuye byte a byte desde el release v1.0.0 de GitHub, con SHA256 `113b687c895fc570eaf773ee0fcadb7321b2bd26fbddc429ed829e3a5f8dfa82`.

## Capacidades

- Recuperación de imágenes de personas a partir de descripciones textuales en inglés, chino, francés y alemán.
- Codificación visual con BEiT-2 base y codificación textual multilingüe con XLM-RoBERTa.
- Enrutamiento semántico de tokens a cuatro expertos para manejar contenido multilingüe.
- Alineamiento visión-lenguaje mediante consultas aprendibles compartidas.
- Reranking multimodal de candidatos recuperados.
- Inicialización para fine-tuning en tareas downstream de person retrieval (por ejemplo, CUHK-PEDES multilingüe).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step: es un modelo de recuperación, no un LLM generativo.
- No se documentan capacidades de visión general (VQA, captioning) ni audio.

## Casos de uso

- Búsqueda forense multilingüe: un analista describe en inglés, chino, francés o alemán a una persona y el modelo recupera candidatos de una galería de imágenes, aprovechando el enrutamiento semántico para consultas en distintos idiomas.
- Videovigilancia con operadores internacionales: distintos equipos pueden formular consultas en su idioma nativo sobre el mismo repositorio de imágenes, sin necesidad de traducir manualmente las descripciones.
- Fine-tuning para dominios específicos: el checkpoint sirve como inicialización para adaptar el modelo a datasets propios de person re-identification con anotaciones textuales, reduciendo el coste de entrenamiento desde cero.
- Investigación académica en recuperación multimodal: base reproducible para comparar estrategias de enrutamiento por expertos y alineamiento con consultas aprendibles en benchmarks multilingües.
- Moderación de contenido y análisis de archivos audiovisuales: localización de fragmentos o imágenes que coincidan con descripciones textuales de personas en catálogos grandes.
- Sistemas de búsqueda en archivos de medios: indexación de imágenes de personas con descripciones multilingües para que redacciones o productoras localicen material por texto.
- Evaluación de robustez multilingüe: uso como punto de partida para estudiar cómo se comporta la recuperación cuando la consulta y el idioma del dataset no coinciden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este checkpoint de preentrenamiento en la información disponible. La model card indica que el modelo MultiPedes completo del paper alcanza 77,94 % Avg R@1 y 70,16 % Avg mAP tras fine-tuning en CUHK-PEDES(M), pero esos resultados corresponden al modelo completo entrenado con el corpus de 10 millones de pares (incluyendo WebPerson), no a este fichero de preentrenamiento, al que el release oficial no asigna puntuación downstream propia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repo pesa 1,8 GB, lo que sugiere que el checkpoint en precisión original cabe en GPUs consumer con 8-12 GB, pero no se confirma en la documentación.
- GPU recomendadas: no especificadas; por el tamaño del checkpoint, una RTX 3090/4090 o A100/H100 serían suficientes para inferencia, aunque no hay datos oficiales de latencia ni throughput.
- Cabe en GPU consumer: probablemente sí por tamaño de pesos, pero sin confirmación oficial.
- Opciones de despliegue: exclusivamente mediante el código oficial de ViSeLA (PyTorch) con `tools/demo_retrieval.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Idiomas | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViSeLA-Pretrain-HAM-LUPerson | Text-based person retrieval | en, zh, fr, de | BEiT-2 + XLM-RoBERTa + expertos | research-only | Checkpoint de preentrenamiento en HF |
| Modelos de person retrieval monolingües (p. ej. basados en CLIP) | Text-based person retrieval | en (típicamente) | CLIP-like | variable | no disponible en detalle |
| Modelos multilingües de recuperación imagen-texto genéricos (p. ej. CLIP multilingüe) | Recuperación imagen-texto general | varios | Dual encoder | variable | disponible en HF |

No se dispone de datos de benchmarks comparativos oficiales entre ViSeLA y alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Licencia research-only-upstream-terms: restringida a investigación; el uso comercial requiere revisar los términos upstream enlazados en THIRD_PARTY_NOTICES.md.
- Es un checkpoint de preentrenamiento (epoch 1), no un modelo final: no debe usarse para reportar resultados de benchmark sin fine-tuning previo.
- Entrenado solo con HAM (cuatro idiomas) y LUPerson bilingüe; no incluye WebPerson, a diferencia del modelo completo del paper.
- Riesgo de sesgos en la recuperación de personas: los datasets de vigilancia pueden sobrerrepresentar ciertos demográficos, entornos o vestimentas, lo que puede degradar la precisión en grupos subrepresentados.
- Riesgo de falsos positivos y negativos en la recuperación: la similitud textual-visual puede fallar con descripciones ambiguas, irónicas o muy detalladas.
- Cobertura lingüística limitada a en, zh, fr y de; otros idiomas no están soportados.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-step.
- El despliegue requiere el código oficial de ViSeLA y configuración manual de rutas de datasets y encoder textual; no hay integración con frameworks de serving estándar.
- Los pesos se distribuyen como checkpoint PyTorch personalizado, no como safetensors ni GGUF, lo que limita su uso con herramientas de cuantización habituales.

## Enlaces

- Hugging Face: https://huggingface.co/linda23153/ViSeLA-Pretrain-HAM-LUPerson
- Paper: https://arxiv.org/abs/2611.15328
- DOI ACM: https://doi.org/10.1145/3767308.3836472
- Project page: https://flame-chasers.github.io/ViSeLA/
- Código: https://github.com/Flame-Chasers/ViSeLA
- Release v1.0.0: https://github.com/Flame-Chasers/ViSeLA/releases/tag/v1.0.0
- Términos de licencia upstream: https://github.com/Flame-Chasers/ViSeLA/blob/main/THIRD_PARTY_NOTICES.md
- Dataset MultiPedes: https://huggingface.co/datasets/linda23153/MultiPedes
- Benchmarks multilingües: https://huggingface.co/datasets/linda23153/ViSeLA-Multilingual-Benchmarks
