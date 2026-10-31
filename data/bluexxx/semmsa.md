# Bluexxx/SemMSA

## Resumen

SemMSA es un modelo de análisis de sentimiento multimodal robusto desarrollado por el equipo de investigación formado por Wenhao Li, Zhibin Wu, Chong Xiao y Qiangchang Li, publicado como artículo en arXiv (arXiv:2609.30238) con checkpoints alojados en HuggingFace bajo el identificador Bluexxx/SemMSA. Su objetivo es resolver un problema concreto y frecuente en el análisis de sentimiento multimodal: la evaluación con datos incompletos, es decir, escenarios en los que faltan una o varias modalidades (texto, vídeo o audio) en una proporción significativa de las muestras.

Técnicamente, SemMSA se construye sobre un LLM congelado (Qwen3-1.7B) al que se le añaden dos mecanismos: Cross-modal Semantic Refinement (CSR), que construye semánticas latentes relevantes para el sentimiento a partir del LLM congelado, y Cross-modal Spectral Alignment (CSA), que alinea esas semánticas latentes con las representaciones del lenguaje, lo visual y lo acústico. Los checkpoints publicados se centran en el dataset CH-SIMS, con soporte para inglés y chino, y el repositorio completo pesa aproximadamente 1,8 GB. Su relevancia radica en que combina la capacidad de representación semántica de los LLM con técnicas de robustez frente a modalidades ausentes, un tema activo en la investigación actual de análisis afectivo multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM congelado (Qwen3-1.7B) con modulos CSR (Cross-modal Semantic Refinement) y CSA (Cross-modal Spectral Alignment); incluye BERT congelado en algunas configuraciones |
| Parametros totales | no disponible (los checkpoints solo contienen los pesos entrenables; el LLM base tiene 1.700 millones de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch, checkpoints de pesos entrenables; el LLM congelado se carga por separado desde `pretrained/`) |

## Arquitectura y entrenamiento

SemMSA no es un LLM generativo en si mismo, sino un sistema de analisis de sentimiento multimodal que aprovecha un LLM congelado como extractor de semantica latente. El modulo Cross-modal Semantic Refinement (CSR) construye representaciones semanticas latentes orientadas al sentimiento a partir de Qwen3-1.7B, que permanece congelado durante el entrenamiento (al igual que BERT cuando se usa congelado). El modulo Cross-modal Spectral Alignment (CSA) alinea esas semanticas latentes con las representaciones de las tres modalidades: lenguaje, visual y acustica. Esta combinacion busca que el modelo capture informacion relevante para el sentimiento sin necesidad de ajustar el LLM completo.

El entrenamiento se realizo sobre el dataset Bluexxx/SemMSA-data, con checkpoints publicados para CH-SIMS (los de MOSI y MOSEI se anunciaran mas adelante). La model card no detalla el numero de tokens, la composicion exacta del corpus de entrenamiento ni el uso de tecnicas como RLHF o DPO, lo cual es coherente con que se trata de un modelo de clasificacion/regresion de sentimiento y no de un modelo generativo alineado. Una caracteristica destacable del protocolo de evaluacion es la evaluacion robusta bajo tasas de ausencia de modalidad de 0,0 a 0,9, siguiendo el protocolo de LNLN y P-RMF, lo que permite medir la degradacion del rendimiento cuando faltan datos multimodales.

## Capacidades

- Analisis de sentimiento multimodal sobre las tres modalidades clasicas: texto, video (visual) y audio (acustico).
- Robustez frente a modalidades ausentes: evaluacion y funcionamiento con tasas de datos incompletos de 0,0 a 0,9, su caracteristica diferencial.
- Construccion de semanticas latentes relevantes para el sentimiento mediante un LLM congelado (Qwen3-1.7B), sin requerir fine-tuning del LLM.
- Alineacion espectral entre la semantica latente y las representaciones de las tres modalidades (modulo CSA).
- Soporte de multiples metricas de evaluacion en CH-SIMS: Acc-2, Acc-3, Acc-5, F1, MAE y Corr, cada una con su checkpoint dedicado.
- Soporte bilingue para ingles y chino (el dataset CH-SIMS contiene datos en chino; la model card declara ambos idiomas).
- No esta orientado a generacion de texto, razonamiento general, codigo, ni a tool calling o agentes: es un modelo de analisis especializado.

## Casos de uso

- Investigacion en analisis de sentimiento multimodal: el modelo sirve como baseline o punto de partida para experimentar con robustez ante modalidades ausentes, con codigo, configuraciones YAML y checkpoints reproducibles disponibles.
- Evaluacion bajo datos incompletos en produccion: en sistemas reales de monitorizacion de llamadas o videoconferencias, es habitual que falle el microfono o la camara; SemMSA permite mantener el analisis de sentimiento incluso cuando falta hasta el 90 % de una modalidad.
- Analisis de interaccion humano-ordenador: integracion en sistemas de interaccion afectiva (avatares, robots sociales, asistentes virtuales) donde las senales de audio y video pueden ser intermitentes.
- Monitorizacion de sentimiento en contenido audiovisual bilingue: analisis de clips con voz y expresion facial en chino e ingles, util para estudios de opinion sobre contenido multimedia.
- Benchmarking de arquitecturas basadas en LLM congelados: el diseno con LLM congelado y modulos ligeros entrenables permite comparar estrategias de transferencia eficiente frente a alternativas como fine-tuning completo.
- Sistemas de analisis de entrevistas o encuestas multimodales: extraccion de senales de sentimiento de respuestas grabadas en video y audio, tolerante a fragmentos corruptos o perdidos durante la captura.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card indica que los checkpoints siguen el protocolo de evaluacion de LNLN y P-RMF sobre CH-SIMS, con metricas reportadas de Acc-2, Acc-3, Acc-5, F1, MAE y Corr, y que la evaluacion robusta se realiza bajo tasas de ausencia de modalidad de 0,0 a 0,9 (mediante `scripts/evaluate.sh`). Los valores concretos de cada metrica deben consultarse en el articulo de arXiv o en la pagina del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explicitamente; al cargar Qwen3-1.7B congelado en precision estandar (FP16/BF16) se requieren aproximadamente 3,5-4 GB solo para el LLM, mas BERT y los modulos CSR/CSA, por lo que una GPU con 8 GB o mas de VRAM deberia ser suficiente para evaluacion.
- GPU recomendadas: no disponible; dada la escala del modelo (1,7 mil millones de parametros congelados), cualquier GPU de consumo moderno (RTX 3060, RTX 4090) o una GPU de datacenter (A100) es adecuada para evaluacion.
- Cabe en GPU de consumo: si, el tamano del repositorio de checkpoints (1,8 GB, solo pesos entrenables) y el LLM base de 1,7B lo hacen accesible a GPUs de gama media.
- Opciones de despliegue: el despliegue previsto es mediante el repositorio oficial de codigo (clonando GitHub, instalando requirements y ejecutando los scripts de evaluacion); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo estandar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Modalidades | Datos incompletos | Licencia |
|---|---|---|---|---|---|
| SemMSA | Qwen3-1.7B (congelado) + CSR/CSA | Sentimiento multimodal | texto, visual, acustico | Si (tasas 0,0-0,9) | MIT |
| LNLN | no disponible | Sentimiento multimodal | texto, visual, acustico | Si (protocolo de referencia) | no disponible |
| P-RMF | no disponible | Sentimiento multimodal | texto, visual, acustico | Si (protocolo de referencia) | no disponible |

SemMSA se posiciona frente a LNLN y P-RMF, que son los metodos de referencia en el protocolo de evaluacion robusto con datos incompletos adoptado por los autores. La diferencia principal es que SemMSA incorpora un LLM congelado (Qwen3-1.7B) para refinar la semantica latente, mientras que los detalles de las alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es generativo: no sirve como chatbot, asistente de codigo ni para tareas de razonamiento general; esta especializado unicamente en analisis de sentimiento multimodal.
- Solo hay checkpoints publicados para CH-SIMS; los checkpoints para MOSI y MOSEI no estan disponibles todavia (se anunciaran mas adelante).
- Los checkpoints contienen unicamente los pesos entrenables: es necesario descargar por separado el Qwen3-1.7B congelado (y BERT cuando aplica) mediante `scripts/download_pretrained.sh`.
- Cada metrica reportada utiliza un checkpoint distinto y una semilla concreta (1111, 1112, 1113), segun el mapeo de `configs/<dataset>/eval.yaml`; usar el checkpoint equivocado para una metrica no reproducira los resultados del articulo.
- Riesgo de sesgo: el modelo se entrena sobre datasets academicos de sentimiento multimodal (CH-SIMS), por lo que puede no generalizar bien a dominios distintos (redes sociales, llamadas telefonicas reales, otros idiomas distintos del ingles y el chino).
- Riesgo de alucinacion: no aplicable en el sentido clasico, pero la precision de las predicciones de sentimiento puede degradarse significativamente con tasas altas de ausencia de modalidad; conviene consultar las curvas de evaluacion robusta del articulo.
- La licencia MIT es permisiva y permite uso comercial, pero los modelos base empleados (Qwen3-1.7B, BERT) tienen sus propias licencias que deben revisarse por separado.
- No hay soporte documentado para frameworks de despliegue estandar (vLLM, Ollama, TGI); la integracion requiere usar el repositorio oficial de codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bluexxx/SemMSA
- Articulo (arXiv): https://arxiv.org/abs/2609.30238
- Codigo (GitHub): https://github.com/peacelwh/SemMSA
- Pagina del proyecto: https://peacelwh.github.io/SemMSA/
- Dataset en HuggingFace: https://huggingface.co/datasets/Bluexxx/SemMSA-data
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
