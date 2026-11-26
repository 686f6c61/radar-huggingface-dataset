# OVHaiLLM/Olala-v1.0-translate

## Resumen

Olala-v1.0-translate es un modelo de traduccion automatica neuronal desarrollado por OVHaiLLM (OVHcloud) mediante fine-tuning del modelo base Olala-v1.0-mini-7A1B. Esta especializado en traduccion de documentos financieros, aunque mantiene capacidades generales de traduccion sobre texto periodistico. Cubre 18 idiomas: lenguas europeas (ingles, frances, aleman, espanol, italiano, neerlandes, portugues, sueco, danes, noruego, finlandes, polaco, checo, ruso) mas arabe, chino simplificado y tradicional, japones y coreano.

El modelo parte de una arquitectura hibrida que combina capas Mamba con mezcla de expertos (MoE), con aproximadamente 6.770 millones de parametros totales (dato real de safetensors) sobre un backbone de tipo 7A1B. Incorpora control de terminologia, adaptacion al dominio documental (informes anuales, fichas de fondos, prospectos, textos regulatorios) y preservacion de mayusculas y etiquetas en linea, lo que lo hace especialmente util en pipelines de localizacion financiera.

Su relevancia actual radica en que ofrece un rendimiento de traduccion especializada en finanzas significativamente superior al de modelos genericos comparables (62,6 BLEU en DOLFIN EN-FR, 8,6 puntos por delante del siguiente modelo comparado), con licencia Apache 2.0 y disponibilidad tanto en Hugging Face como en AI Endpoints de OVHcloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba + MoE (mezcla de expertos), transformer-like con custom_code |
| Parametros totales | 6.773.124.144 (~6,77 mil millones) |
| Parametros activos | no disponible (denominacion 7A1B sugiere ~1B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, fr, de, es, it, nl, pt, sv, da, no, fi, pl, cs, ru, ar, zh (simplificado y tradicional), ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Olala-v1.0-mini-7A1B, un backbone preentrenado con 12,8 billones (T) de tokens segun la model card del autor. La arquitectura declarada es hibrida, combinando capas Mamba (modelos de espacio de estados) con mezcla de expertos (MoE), lo que sugiere un diseno orientado a eficiencia computacional en inferencia manteniendo capacidad parametrica. El modelo requiere `custom_code` para cargarse con transformers, lo que implica que la implementacion de las capas Mamba/MoE no es la estandar del framework.

El proceso de entrenamiento parte de un modelo base preentrenado, pasa por una fase de supervised fine-tuning (SFT) y despues por RL, segun la jerarquia de modelos publicada por OVHaiLLM (base, SFT, post-trained, summarise, translate). El fine-tuning especifico de traduccion se orienta a documentos financieros, con capacidad de seguir un mapeo de terminologia proporcionado por el usuario, adaptarse al dominio del documento y preservar casing y etiquetas en linea. No se especifica en la informacion disponible el volumen de tokens de la fase de fine-tuning de traduccion, la composicion del dataset ni el metodo exacto de RL.

## Capacidades

- Traduccion automatica entre 18 idiomas, con especial enfasis en combinaciones que incluyen lenguas europeas, arabe, chino, japones y coreano.
- Traduccion especializada en documentos financieros: informes anuales, fichas de fondos, prospectos y textos regulatorios.
- Control de terminologia: acepta un mapeo de terminos proporcionado por el usuario para forzar traducciones consistentes.
- Adaptacion al dominio documental segun el tipo de documento.
- Preservacion de mayusculas y etiquetas en linea (inline tags), util para formatos con markup.
- Generacion de texto general (pipeline text-generation).
- Capacidades conversacionales heredadas del modelo base post-trained.
- Soporte multilingue amplio (18 idiomas declarados).
- Capacidad de tool calling y razonamiento multi-paso heredada del modelo base (segun descripcion del modelo post-trained del que deriva), aunque la especializacion efectiva del checkpoint es la traduccion.

## Casos de uso

- Traduccion de informes anuales y memorias financieras: el modelo esta fine-tuneado sobre documentos de este tipo y preserva terminologia contable y regulatoria, lo que reduce la necesidad de revision terminologica posterior.
- Localizacion de fichas de fondos y prospectos: permite aplicar un mapeo de terminologia por producto o por jurisdiccion, manteniendo coherencia entre documentos de una misma gestora.
- Traduccion de textos regulatorios multilingues: con 18 idiomas cubiertos, sirve para producir versiones de cumplimiento normativo en paralelo para distintas jurisdicciones.
- Pipelines de localizacion con markup: la preservacion de etiquetas en linea lo hace adecuado para traduccion de contenido con HTML, XML o marcado interno sin romper la estructura.
- Traduccion de documentacion tecnica y financiera para equipos internos: al estar disponible en AI Endpoints de OVHcloud, puede integrarse como servicio gestionado en flujos de trabajo corporativos.
- Traduccion de noticias y contenido periodistico economico: obtiene el mejor COMET-22 (88,0) en texto periodistico y financiero segun el autor, y queda a menos de 0,3 BLEU del mejor modelo comparado en WMT news.
- Preprocesamiento multilingue para analisis de sentimiento financiero: traduccion previa de documentos en 18 idiomas a un idioma pivote antes de aplicar modelos de analisis.
- Generacion de versiones multilingues de material de marketing financiero con control de terminologia de marca.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Resultado | Nota |
|---|---|---|
| DOLFIN EN-FR (BLEU) | 62,6 | 8,6 puntos por delante del siguiente modelo comparado |
| COMET-22 (noticias y texto financiero) | 88,0 | Mejor puntuacion frente a los modelos comparados |
| WMT news (BLEU) | no disponible (valor absoluto) | A menos de 0,3 BLEU del mejor modelo comparado |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos (6,77 mil millones de parametros), mas overhead de activaciones y cache, en torno a 15-18 GB en total.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7-8 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3,5-4,5 GB para pesos (los tipos de cuantizacion concretos no estan confirmados en la informacion disponible).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o similares para despliegue en produccion con batching; RTX 4090 (24 GB) suficiente para inferencia en fp16 sin batching agresivo.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: transformers con `custom_code` (requerido por la arquitectura Mamba/MoE), vLLM y TGI solo si soportan las capas custom del modelo; llama.cpp/Ollama no estan confirmados por la falta de pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olala-v1.0-translate | ~6,77 B | no disponible | Traduccion financiera, 18 idiomas | Apache 2.0 | Hugging Face, OVHcloud AI Endpoints |
| Modelos NLLB-200 (Meta) | 600M-54B variantes | no disponible | Traduccion multilingue general (200 idiomas) | CC-BY-NC (no comercial en muchas variantes) | Hugging Face |
| Helsinki-NLP opus-mt | ~75M por par | no disponible | Traduccion por pares de idiomas | Apache 2.0 / MIT segun variante | Hugging Face |
| MADLAD-400 (Google) | 3B / 7B / 10B | no disponible | Traduccion multilingue masiva (400+ idiomas) | Apache 2.0 | Hugging Face |

La comparativa cuantitativa frente a estos modelos no esta disponible en la informacion proporcionada; el autor solo indica comparaciones relativas en DOLFIN, COMET-22 y WMT news.

## Limitaciones y advertencias

- Es un modelo fine-tuneado para traduccion; su uso como modelo generativo general puede degradarse respecto al modelo base Olala-v1.0-mini-7A1B.
- Riesgo de alucinacion inherente a modelos generativos, especialmente en terminologia financiera no cubierta por el mapeo proporcionado.
- La preservacion de etiquetas en linea y casing depende de que el input este bien formado; entradas malformadas pueden producir traducciones inconsistentes.
- La longitud de contexto no esta documentada, lo que limita la planificacion de traduccion de documentos largos sin fragmentacion previa.
- Requiere `trust_remote_code` por el uso de `custom_code`, lo que implica riesgo de seguridad si no se audita la implementacion.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y de los datasets de entrenamiento no detallados.
- No hay informacion sobre sesgos por idioma o dominio; los idiomas con menos recursos (por ejemplo, finlandes, checo, coreano) pueden tener peor calidad que los pares europeos principales.
- No se han publicado benchmarks completos ni evaluaciones de robustez fuera de DOLFIN, COMET-22 y WMT news.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-translate
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Modelo base preentrenado: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Modelo SFT: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-SFT
- Modelo de resumen: https://huggingface.co/OVHaiLLM/Olala-v1.0-summarise
- Informe tecnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- AI Endpoints (OVHcloud): https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-v1-0-translate/
- Playground: https://olala.ovh.com
