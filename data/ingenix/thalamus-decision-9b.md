# ingenix/Thalamus-Decision-9B

## Resumen

Thalamus-Decision-9B es un modelo de lenguaje de aproximadamente 9.190 millones de parametros desarrollado por ingenix, obtenido mediante fine-tuning supervisado del modelo base ingenix/Thalamus-Reasoning-9B. Esta especializado en tareas de clasificacion y toma de decisiones en el ambito de la biologia y la medicina, con enfasis en datos de transcriptomica, expresion genica, secuenciacion de celula unica (single-cell), RNA-seq y otras fuentes omicas. El modelo se distribuye con la pipeline `text-classification` y emplea codigo personalizado (`custom_code`), lo que implica que requiere confiar en implementaciones no estandar al cargarlo.

Su relevancia radica en la combinacion de un modelo de razonamiento de 9B con un ajuste orientado a la calibracion de decisiones en dominios cientificos, un nicho poco cubierto por los modelos generalistas. El acceso esta restringido (gated): es necesario aceptar las condiciones de la licencia `ingenix-research-license-1.0` en Hugging Face antes de descargar los pesos. El repositorio ocupa 19,0 GB en formato safetensors y declara soporte para ingles y polaco, ademas de una referencia a un preprint en arXiv (2605.06728).

La informacion publica disponible es limitada: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables en la model card y los metadatos del repositorio, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de razonamiento; detalles no publicados) |
| Parametros totales | 9.190.797.824 (~9,19B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en), polaco (pl) |
| Licencia | ingenix-research-license-1.0 (acceso restringido, requiere aceptacion) |
| Formato de pesos | safetensors (repo de 19,0 GB) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo base Thalamus-Reasoning-9B ni sobre la innovacion tecnica que justifica la etiqueta `thalamus_reasoning`. Por el tamano (9,19B parametros) y la libreria declarada (`transformers`), se trata con alta probabilidad de un transformer decoder-only, pero la model card no confirma configuracion de capas, atencion, ni si incorpora mecanismos hibridos. Tampoco se especifica la longitud de contexto nativa.

El ajuste que da lugar a Thalamus-Decision-9B es un fine-tuning del modelo de razonamiento orientado a clasificacion y toma de decisiones calibradas en dominios biomedicos (transcriptomica, expresion genica, single-cell, RNA-seq, DepMap, multimodal omics). No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o calibracion post-entrenamiento, aunque las etiquetas `calibration` y `decision-making` sugieren un enfasis explicito en la calibracion de probabilidades de salida. La referencia arXiv:2605.06728 apunta a un articulo tecnico asociado, pero su contenido no se ha incluido en la informacion disponible.

## Capacidades

- Clasificacion de texto en dominios biomedicos: la pipeline declarada es `text-classification`, con etiquetas especificas de biologia, medicina, transcriptomica, expresion genica, single-cell y RNA-seq.
- Toma de decisiones calibrada: el modelo esta disenado para emitir decisiones con calibracion explicita (tag `calibration`), lo que sugiere salidas probabilisticas utilizables en entornos donde importa la incertidumbre.
- Razonamiento multi-paso heredado del modelo base Thalamus-Reasoning-9B (tag `thalamus_reasoning`).
- Procesamiento de datos omicos y multimodales a nivel de texto (tag `multimodal`, `omics`), sin que se detalle el mecanismo de integracion.
- Soporte bilingue limitado a ingles y polaco.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito; se consideran no disponibles.

## Casos de uso

- Anotacion de tipos celulares en datos single-cell: el modelo puede clasificar perfiles de expresion genica descritos en texto (o serializados) en categorias celulares, aprovechando su ajuste especifico en transcriptomica y single-cell.
- Priorizacion de genes candidatos en estudios de RNA-seq: dado un conjunto de genes diferencialmente expresados y contexto experimental, el modelo puede emitir una decision calibrada sobre relevancia biologica, util en pipelines de descubrimiento.
- Analisis de lineas celulares DepMap: clasificacion de vulnerabilidades o dependencias geneticas a partir de descripciones textuales de lineas celulares y perfiles omicos, gracias al entrenamiento especifico en DepMap.
- Triage en literatura biomedica: clasificacion de abstracts o informes en categorias diagnosticas o mecanisticas, con probabilidades calibradas que permiten umbralizar decisiones en revision asistida.
- Soporte a decision clinica asistida (no diagnostico autonomo): el modelo puede clasificar casos descritos en texto en categorias de riesgo o subtipos, siempre como herramienta de apoyo y con supervision humana dada la licencia de investigacion.
- Investigacion en calibracion de modelos cientificos: por su enfasis en `calibration` y `decision-making`, es adecuado como objeto de estudio para evaluar la fiabilidad de clasificadores biomedicos, no como componente de produccion clinica.
- Procesamiento de documentacion cientifica multilingue (en/pl): clasificacion de textos biomedicos en ingles y polaco, util en repositorios europeos con mezcla de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda un minimo de 24 GB.
- VRAM estimada en cuantizacion 8 bits: ~9-10 GB; en 4 bits: ~5-6 GB (estimaciones teoricas, no confirmadas por el autor, ya que no se publican variantes cuantizadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 para cuantizacion 8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090) en fp16 ajustado o cuantizado; en 4 bits podria ejecutarse en GPUs de 8 GB, aunque sin validacion oficial.
- Opciones de despliegue: al usar `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`; el soporte en vLLM, TGI, llama.cpp u Ollama no esta confirmado y depende de que el codigo personalizado sea compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion publica sobre modelos comparables en el mismo nicho (clasificacion biomedica calibrada sobre base de razonamiento de 9B). Se indica "no disponible" para evitar comparaciones no fundamentadas.

| Modelo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| Thalamus-Decision-9B | 9,19B | no disponible | ingenix-research-license-1.0 | Restringido (gated) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar la licencia `ingenix-research-license-1.0`; el uso comercial no esta garantizado y debe revisarse el texto completo de la licencia antes de cualquier despliegue productivo.
- Licencia de investigacion: por su denominacion, es probable que restrinja el uso clinico o comercial; no se debe asumir permiso para produccion sin verificacion legal.
- Codigo personalizado (`custom_code`): la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor; riesgo de seguridad y de incompatibilidad con frameworks estandar.
- Idiomas limitados a ingles y polaco; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a modelos de 9B en dominios cientificos; las decisiones calibradas no sustituyen validacion experimental ni juicio clinico.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de mitigacion de sesgos.
- Contexto no publicado: imposible planificar casos de uso con documentos largos sin conocer la ventana real.
- Comunidad muy reducida (6 descargas, 1 like en el momento de la consulta) y sin benchmarks publicos: madurez y fiabilidad no verificadas de forma independiente.
- Fecha de creacion futura en los metadatos (2026-11-17): inconsistencia que conviene senalar al evaluar la trazabilidad del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/ingenix/Thalamus-Decision-9B
- Modelo base: https://huggingface.co/ingenix/Thalamus-Reasoning-9B
- Preprint referenciado: arXiv:2605.06728 (no verificado en la informacion disponible)
