# ddrg/ChronosBERT-Bolt-Default

## Resumen

ChronosBERT-Bolt-Default es un codificador bidireccional de tipo BERT-Small (encoder-only) desarrollado por el usuario ddrg para el aprendizaje de representaciones de series temporales. El modelo combina la representacion basada en parches (patches) del modelo de forecasting Chronos-Bolt con una arquitectura transformer bidireccional y un objetivo de preentrenamiento de modelado de lenguaje enmascarado (MLM) adaptado a series temporales: los parches de la serie se enmascaran aleatoriamente y el modelo aprende a reconstruirlos.

Con aproximadamente 15,3 millones de parametros, es un modelo ligero pensado para servir como backbone preentrenado que se transfiere y ajusta finamente (fine-tuning) en tareas posteriores de series temporales, principalmente clasificacion. No es un modelo generativo de texto ni un modelo de forecasting directo: su funcion es producir representaciones transferibles que se acoplan a cabezas de clasificacion u otras tareas descendentes.

Su relevancia practica radica en que ofrece una alternativa de bajo coste computacional (repo de 0,1 GB, pesos en safetensors, libreria transformers) para experimentar con representaciones preentrenadas de series temporales sin necesidad de entrenar desde cero. La model card incluye un ejemplo completo de fine-tuning sobre el conjunto ArrowHead del UCR Time Series Classification Archive.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-Small (encoder-only, transformer bidireccional) |
| Parametros totales | 15.295.776 (aprox. 15,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (definida por `context_length` en la configuracion de Chronos-Bolt) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo sobre series temporales numericas, no texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de tipo BERT-Small. La entrada no es texto sino series temporales numericas: cada serie se divide en parches siguiendo la representacion de Chronos-Bolt, y esos parches se procesan con el encoder bidireccional. El objetivo de preentrenamiento es MLM: se enmascaran parches aleatorios de la serie y el modelo aprende a reconstruirlos, lo que fuerza el aprendizaje de representaciones generales de la dinamica temporal.

La model card menciona mecanismos de augmentacion durante el preentrenamiento (probabilidades de enmascarado de parches, `masking_prob` y `patch_masking_prob`, y de perturbacion, `perturbation_prob` y `patch_perturbation_prob`), que el usuario debe desactivar durante el fine-tuning. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables de forma habitual en este tipo de modelo). El backbone parte de la configuracion preentrenada de Chronos-Bolt y los pesos se transfieren a la variante de clasificacion, inicializando la cabeza de clasificacion por separado.

## Capacidades

- Aprendizaje de representaciones de series temporales univariantes mediante encoder bidireccional.
- Reconstruccion de parches enmascarados de una serie temporal (objetivo MLM adaptado).
- Transferencia a tareas descendentes: la model card documenta explicitamente el fine-tuning para clasificacion de series temporales.
- Manejo de valores ausentes mediante una mascara booleana que indica que valores estan observados.
- Procesamiento directo de valores numericos de la serie (sin tokenizacion de texto).
- Soporte de pooling configurable en la cabeza de clasificacion (por ejemplo, `pooling="mean"`) y dropout configurable.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues.

## Casos de uso

- Clasificacion de series temporales con el UCR Archive: el modelo se ajusta finamente sobre conjuntos como ArrowHead con una cabeza de clasificacion y pooling por media, aprovechando las representaciones preentrenadas para reducir el coste de entrenamiento desde cero.
- Deteccion de patrones en sensores industriales: al procesar series numericas con mascara de valores observados, puede adaptarse a tareas de clasificacion de estados de maquinaria a partir de lecturas de sensores con huecos.
- Clasificacion de senales biomedicas: fine-tuning sobre series de ECG, EEG u otras senales para tareas de clasificacion supervisada, usando el backbone preentrenado como extractor de caracteristicas.
- Extraccion de embeddings para clustering o recuperacion: las representaciones del encoder pueden usarse como features para agrupar series similares o alimentar modelos posteriores.
- Prototipado rapido en investigacion: con 15,3 M de parametros y pesos en safetensors de 0,1 GB, permite iterar experimentos de representacion de series en entornos con recursos limitados.
- Baseline para comparativas academicas: sirve como referencia ligera frente a modelos de forecasting o clasificacion de mayor tamano en estudios sobre transferencia de representaciones temporales.
- Preentrenamiento y ajuste en pipelines propios: el ejemplo de la model card muestra como cargar el modelo con `transformers`, transferir pesos a una variante de clasificacion y entrenar con AdamW y scheduler lineal con warmup.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 15,3 M de parametros en fp32 el modelo ocupa aproximadamente 61 MB de pesos, y en fp16 alrededor de 31 MB. La VRAM real dependera del tamano de lote y de la longitud de la serie de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060 o RTX 4090, e incluso puede ejecutarse en CPU para inferencia y fine-tuning de conjuntos pequenos.
- Cabe en GPU consumer: si, sin restricciones practicas por tamano de pesos.
- Opciones de despliegue: la model card usa la libreria `transformers` y el paquete `chronos_pkg` (modulos `chronos_bolt` y `chronos_bolt_classification`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y por el tipo de modelo (encoder de series temporales) no son opciones habituales.
- Latencia y throughput estimados: no disponibles. El coste dominante sera la longitud de la serie de entrada y el tamano de lote, no el numero de parametros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChronosBERT-Bolt-Default | 15,3 M | no disponible | Representacion de series temporales (encoder) | no disponible | Hugging Face (ddrg/ChronosBERT-Bolt-Default) |
| Chronos-Bolt | no disponible en la informacion | no disponible | Forecasting de series temporales | no disponible | Referenciado como backbone en la model card |
| BERT-Small estandar | no disponible en la informacion | no disponible | Representacion de texto (encoder) | no disponible | Ampliamente disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en series temporales numericas; no es un modelo de lenguaje y no genera texto ni responde a instrucciones.
- La licencia no esta indicada en la informacion disponible, por lo que el uso comercial no puede darse por permitido sin verificacion previa en el repositorio.
- No se documentan sesgos especificos, pero al ser un modelo preentrenado sobre datos no descritos, pueden heredar sesgos de la distribucion de series utilizada.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de representaciones poco fiables fuera de la distribucion de entrenamiento.
- La longitud de contexto no esta publicada; depende de la configuracion de Chronos-Bolt y debe consultarse en el codigo del repositorio de GitHub.
- El fine-tuning requiere desactivar manualmente las probabilidades de enmascarado y perturbacion de parches, tal como advierte la model card.
- El ejemplo de la model card depende del paquete `chronos_pkg` y de modulos especificos (`chronos_bolt`, `chronos_bolt_classification`), lo que anade dependencias fuera de `transformers`.
- El repositorio tiene 0 likes y la model card esta incompleta en varios campos (licencia, idiomas, pipeline), lo que sugiere un modelo de investigacion sin garantias de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/ddrg/ChronosBERT-Bolt-Default
- GitHub del proyecto: https://github.com/JuliusHanusch/ChronosBERT
- UCR Time Series Classification Archive: https://www.timeseriesclassification.com/
