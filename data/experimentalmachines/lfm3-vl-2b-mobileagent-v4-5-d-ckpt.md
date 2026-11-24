# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.5-D-ckpt

## Resumen

LFM3-VL-2B-MobileAgent-v4.5-D-ckpt es un ajuste fino (fine-tuning) supervisado del modelo multimodal LiquidAI/LFM3-VL-2B, publicado por el usuario experimentalmachines en Hugging Face. Se trata de un checkpoint intermedio de un experimento de ajuste orientado a tareas de agente movil (MobileAgent), entrenado con la libreria TRL mediante SFT (supervised fine-tuning) sobre la base multimodal de Liquid AI de 2 mil millones de parametros.

El modelo hereda la arquitectura y capacidades del LFM3-VL-2B original, un modelo vision-lenguaje de la familia Liquid Foundation Models. No obstante, la model card publicada es practicamente un esqueleto generado automaticamente por TRL: no documenta el dataset de entrenamiento, la composicion de los datos, el numero de pasos, hiperparametros ni resultados de evaluacion. Tampoco se especifica la licencia efectiva del ajuste ni los idiomas soportados.

Su relevancia es limitada y de caracter experimental: se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica del proceso de ajuste. Resulta util unicamente como referencia para quienes sigan el linaje de ajustes de LFM3-VL-2B orientados a agentes moviles, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM3-VL-2B; no documentada en la model card) |
| Parametros totales | no disponible (el nombre indica 2B; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que parte de LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje de la familia Liquid Foundation Models de Liquid AI, pero no se detalla en la informacion disponible si emplea transformer clasico, arquitectura hibrida o algun otro diseno propietario. El tamano del repositorio (8,7 GB) es coherente con un modelo de aproximadamente 2 mil millones de parametros en precision completa o media.

El entrenamiento consistio en un ajuste fino supervisado (SFT) mediante TRL 1.16.0, con Transformers 5.20.2, PyTorch 2.14.1, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica el dataset utilizado, el numero de tokens de entrenamiento, la composicion de los datos, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales ni el objetivo concreto del ajuste (mas alla del nombre "MobileAgent", que sugiere tareas de agente en entorno movil).

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el ejemplo de uso de la model card (pipeline de text-generation con formato de chat).
- Capacidades multimodales heredadas del modelo base LFM3-VL-2B (vision-lenguaje), aunque no se detallan en la model card.
- Ajuste orientado a tareas de agente movil (MobileAgent) segun el nombre del checkpoint; no se documenta que capacidades concretas de agente conserva.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el nombre sugiere orientacion a agentes, sin evidencia tecnica.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Investigacion sobre ajuste fino multimodal: el checkpoint sirve como referencia para estudiar como un SFT con TRL sobre LFM3-VL-2B afecta al comportamiento del modelo base, comparando salidas antes y despues del ajuste.
- Experimentacion con agentes moviles: dado el nombre "MobileAgent", puede emplearse en prototipos de automatizacion de tareas en interfaces moviles, aunque sin documentacion que garantice su calidad en ese dominio.
- Evaluacion comparativa de checkpoints intermedios: al tratarse de un checkpoint (sufijo "-ckpt"), es util para analizar la evolucion del entrenamiento frente a versiones posteriores del mismo experimento.
- Pruebas de pipelines de transformers: el ejemplo de la model card permite validar rapidamente la integracion del modelo en un pipeline de generacion de texto con `device_map="auto"`.
- Docencia y divulgacion: como ejemplo de model card autogenerada por TRL y de las carencias documentales habituales en checkpoints de investigacion.
- Base para nuevos ajustes: al estar en formato safetensors y ser compatible con transformers, puede servir como punto de partida para fine-tunings posteriores, siempre que se resuelva la ambiguedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de ~2B parametros en fp16 requiere del orden de 4-5 GB de VRAM solo para los pesos, mas memoria para el contexto y el procesador de vision; estas cifras son estimaciones generales, no datos publicados para este modelo.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, un modelo de ~2B parametros suele caber en GPU de consumo con 8 GB o mas en cuantizacion, pero no hay datos oficiales.
- Opciones de despliegue: transformers (confirmado por la model card y el ejemplo con `pipeline`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| experimentalmachines/LFM3-VL-2B-MobileAgent-v4.5-D-ckpt | ~2B (segun nombre) | no disponible | no disponible | Hugging Face, 0 descargas | Checkpoint SFT experimental, sin benchmarks |
| LiquidAI/LFM3-VL-2B (modelo base) | ~2B (segun nombre) | no disponible | no disponible en esta ficha | Hugging Face | Modelo vision-lenguaje original de Liquid AI |
| Alternativas de ~2B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar |

No se dispone de informacion suficiente para establecer una comparativa tecnica rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- Licencia ambigua: la model card indica "licence: license" sin especificar terminos; no se puede confirmar el uso comercial. La licencia del modelo base (LiquidAI/LFM3-VL-2B) tampoco se detalla en la informacion disponible y debe consultarse por separado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion publicada no puede acotarse.
- Sesgos: no documentados; al desconocerse el dataset de ajuste, no es posible evaluar sesgos introducidos por el SFT.
- Idiomas: no confirmados; no se garantiza soporte del castellano ni de otros idiomas.
- Caracter experimental: cero descargas y cero likes en el momento de la consulta; es un checkpoint de investigacion, no un modelo validado para produccion.
- Checkpoint intermedio: el sufijo "-ckpt" sugiere que no es la version final del experimento; puede haber versiones posteriores con distinto comportamiento.
- Sin garantias de calidad en tareas de agente movil: el nombre sugiere ese dominio, pero no hay evidencia publicada de su rendimiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.5-D-ckpt
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio TRL: https://github.com/huggingface/trl
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion disponible.
