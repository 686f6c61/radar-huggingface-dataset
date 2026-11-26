# cyankiwi/K2-Horizon-MoVA-36B-A4B-AWQ-INT4

## Resumen

K2-Horizon-MoVA-36B-A4B-AWQ-INT4 es una cuantización INT4 del checkpoint K2-Horizon-MoVA-36B-A4B, publicada por cyankiwi (agente de inferencia de modelos abiertos). El modelo original lo desarrolla IFM y pertenece a la familia K2-Horizon, una serie de modelos de pesos abiertos que combina una arquitectura Mixture-of-Experts (MoE) con una innovación denominada Mixture-of-Values attention (MoVA). Almacena 36B parámetros totales y activa aproximadamente 4B por token, lo que reduce de forma notable el coste computacional en inferencia.

El checkpoint cuantizado emplea AWQ (Activation-aware Weight Quantization) en formato compressed-tensors INT4, con un tamaño de repositorio de 24,3 GB. La model card indica que el modelo base ofrece resultados de nivel frontier en benchmarks agénticos y de razonamiento, superando a modelos densos abiertos de ~30B y a MoE de hasta 15 veces su tamaño, además de competir con modelos frontier cerrados. Dispone de una ventana de contexto nativa de 524.288 tokens (512K) desde las etapas de midtraining.

Es relevante para desarrolladores porque combina una ventana de contexto muy grande con un coste de activación bajo (4B por token) y una licencia Apache 2.0 que permite uso comercial. La contrapartida es que la ejecución de los expertos de valor cuantizados requiere un fork específico de vLLM, no soportado por la versión estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Mixture-of-Values attention (MoVA), transformer |
| Parametros totales | 36B (según model card); el checkpoint cuantizado declara 7.525.081.140 parámetros en safetensors |
| Parametros activos | ~4B por token |
| Longitud de contexto | 524.288 tokens (512K) nativa |
| Tipos de cuantizacion | AWQ INT4 (compressed-tensors), checkpoint cuantizado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), librería transformers, custom_code |

## Arquitectura y entrenamiento

El modelo base K2-Horizon-MoVA-36B-A4B es un transformer disperso de tipo Mixture-of-Experts con una variante de atención denominada Mixture-of-Values attention (MoVA), que introduce expertos de valor enrutados en la atención (`self_attn.v_experts.*`). La combinación de routing MoE en las capas feed-forward y de expertos de valor en la atención permite almacenar 36B parámetros manteniendo solo ~4B activos por token. La ventana de contexto nativa de 512K se establece a partir de las etapas de midtraining.

El entrenamiento se realizó sobre los datasets IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, y el autor publica también la receta de datos y el código de entrenamiento. La model card menciona la publicación de checkpoints intermedios para estudiar la evolución de capacidades a lo largo del entrenamiento. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La cuantización AWQ de cyankiwi (versión 26.05.01) se calibró con un dataset propio de temática STEM y agéntica (cyankiwi/calibration). Los expertos de valor enrutados se almacenan como INT4 compressed-tensors; vLLM estándar puede cargar los pesos pero no ejecutar dichos expertos, por lo que se requiere el fork `k2-mova-quant-v-experts` del repositorio de cyankiwi.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y tareas agénticas, según los benchmarks reportados por el autor.
- Procesamiento de contexto muy largo (hasta 512K tokens) para documentos extensos y conversaciones multi-turno.
- Arquitectura MoE con ~4B parámetros activos, lo que reduce el coste por token frente a modelos densos de tamaño comparable.
- Pesos abiertos con datos, receta y código de entrenamiento publicados.
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo thinking.

## Casos de uso

- Análisis de documentos extensos: con 512K tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de código sin fragmentación, manteniendo coherencia global en la respuesta.
- Asistentes conversacionales de dominio técnico: el modelo está entrenado y calibrado con datos STEM y agénticos, lo que lo hace adecuado para soporte técnico especializado en inglés.
- Investigación sobre entrenamiento de MoE: la publicación de checkpoints intermedios permite estudiar la evolución de capacidades y comparar etapas de entrenamiento.
- Despliegue con presupuesto de VRAM ajustado: al activar ~4B parámetros por token y estar cuantizado a INT4, puede servirse en GPUs de gama alta de consumo o profesionales con menos memoria que un denso de 36B.
- Evaluación de técnicas de cuantización: el checkpoint AWQ INT4 sirve como referencia para medir la degradación de calidad frente al modelo base en tareas de razonamiento y agénticas.
- Prototipado de pipelines de razonamiento largo: la ventana de 512K permite experimentar con cadenas de razonamiento y contextos acumulados sin truncamiento.
- Investigación comparativa de arquitecturas de atención: MoVA con expertos de valor enrutados es un objeto de estudio interesante frente a atención densa convencional.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks que compara K2-Horizon-MoVA-36B-A4B con Nemotron 3 Ultra, Nemotron 3 Super y otros modelos abiertos y cerrados. Sin embargo, los valores numéricos de dicha tabla no están disponibles en la información proporcionada (la tabla aparece truncada). No se han podido extraer cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint cuantizado ocupa 24,24 GB, por lo que se necesita al menos ~26-28 GB de VRAM para cargar los pesos con overhead de runtime.
- GPU recomendadas: A100 40GB, H100, L40S 48GB, RTX 6000 Ada 48GB; en consumer, RTX 4090 24GB queda muy justa y probablemente requiera offloading o reducción adicional.
- Cabe en GPU de consumo: solo en configuraciones con 32GB o más (por ejemplo, RTX 5090 si dispone de memoria suficiente); en 24GB no es viable sin offloading a CPU.
- Despliegue: requiere el fork de vLLM `k2-mova-quant-v-experts` de cyankiwi para ejecutar los expertos de valor cuantizados. No se documenta soporte en llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B-AWQ-INT4 | 36B | ~4B | 512K | Apache 2.0 | Cuantizado INT4, requiere fork de vLLM |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | no disponible | Comparado en la model card del autor |
| Nemotron 3 Super | no disponible | no disponible | no disponible | no disponible | Comparado en la model card del autor |
| Modelos densos abiertos ~30B | ~30B | ~30B | no disponible | variable | Referenciados como baseline en la model card |

No se dispone de datos numéricos de rendimiento comparativo en la información proporcionada para completar la comparativa con cifras.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser una cuantización INT4, puede existir degradación de calidad respecto al checkpoint original en tareas sensibles a la precisión numérica.
- Requiere un fork específico de vLLM para ejecutar los expertos de valor cuantizados; el vLLM estándar no puede servirlo correctamente.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos de los datasets de entrenamiento publicados por IFM.
- El tamaño del repositorio (24,3 GB) implica requisitos de almacenamiento y ancho de banda considerables.
- El modelo está orientado a texto; no se documentan capacidades multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/cyankiwi/K2-Horizon-MoVA-36B-A4B-AWQ-INT4
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Fork de vLLM: https://github.com/cyankiwi/vllm (rama `k2-mova-quant-v-experts`)
- Web de cyankiwi: https://cyan.kiwi/
- Perfil de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- ModelScope: https://www.modelscope.ai/organization/cyankiwi
- X: https://x.com/cyankiwi_ai
- Reddit: https://www.reddit.com/r/cyankiwi/
