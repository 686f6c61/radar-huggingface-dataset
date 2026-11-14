# prajwalpujari16/EdgeSLM-qwen0.5b-v3

## Resumen

EdgeSLM-qwen0.5b-v3 es un adaptador LoRA (PEFT) publicado por el usuario prajwalpujari16 sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. A diferencia de un modelo de generacion de texto al uso, el adaptador esta afinado para una tarea concreta de clasificacion de documentos orientada a seguridad de datos (DLP, *data loss prevention*), es decir, detectar y etiquetar contenido sensible en flujos documentales. El repositorio declara la pipeline `text-classification` y la etiqueta `document-classification`, lo que lo situa como un componente especializado y no como un modelo conversacional generalista.

El modelo base, Qwen2.5-0.5B-Instruct, es un transformer decoder-only de 0,5 mil millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens y soporte multilingue amplio. Sobre esa base, el adaptador LoRA anade una cabeza de clasificacion y pesos ajustados para la tarea DLP, manteniendo el resto de parametros congelados. El resultado es un artefacto muy ligero (repo de 0,0 GB, solo pesos del adaptador en safetensors) pensado para despliegues en el borde (*edge*) o en entornos con recursos limitados.

La relevancia actual del modelo radica en su enfoque: aplicar un SLM (small language model) de 0,5B a una tarea de clasificacion de seguridad, donde la latencia, el coste por inferencia y la privacidad (procesamiento local) son criticos. No obstante, la informacion publica disponible es muy escasa: no hay model card detallada, no se han publicado benchmarks, el acceso esta restringido (gated) y el idioma declarado es unicamente ingles. Cualquier evaluacion en produccion debe hacerse con cautela y validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango aplicado sobre Qwen2.5-0.5B-Instruct. El modelo base es un transformer decoder-only con atencion causal estandar, 24 capas, dimension oculta de 896 y atencion multi-head con GQA (grouped query attention), segun la arquitectura publica de la familia Qwen2.5. El adaptador congela los pesos del modelo base e inyecta matrices de baja dimensionalidad en las proyecciones de atencion y MLP, anadiendo una cabeza de clasificacion para la tarea de document-classification. El entrenamiento se ha realizado presumiblemente con supervisión sobre un dataset de documentos etiquetados para DLP, aunque la composicion, el numero de tokens y el proceso exacto no estan documentados en la informacion disponible.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de ejemplos, la estrategia de aumento de datos, ni si se aplico RLHF, DPO o simplemente fine-tuning supervisado. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La unica innovacion implicita es el uso de LoRA para mantener el coste de almacenamiento y despliegue al minimo, lo que permite servir el adaptador junto al modelo base en entornos con poca VRAM.

## Capacidades

- Clasificacion de documentos para seguridad de datos (DLP): etiquetado de contenido sensible en flujos documentales.
- Deteccion de categorias de datos personales, credenciales, informacion financiera u otros patrones definidos por el dataset de entrenamiento (no documentados).
- Clasificacion de texto en ingles, heredando la competencia linguistica del modelo base Qwen2.5-0.5B-Instruct.
- Capacidad de generacion de texto residual (heredada del modelo base), aunque el adaptador esta orientado a clasificacion y no se garantiza su calidad conversacional.
- Soporte de tool calling / function calling: no disponible para el adaptador (la tarea es clasificacion, no agente).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: limitadas al ingles declarado; el modelo base soporta mas idiomas, pero el adaptador no declara entrenamiento en ellos.
- Capacidades especiales: no se documentan modos de pensamiento (*thinking*), vision ni audio.

## Casos de uso

- Clasificacion de documentos en pipelines DLP: el adaptador se integra como paso de etiquetado en un pipeline de ingesta documental para marcar ficheros con contenido sensible antes de su almacenamiento o envio externo, aprovechando el bajo coste de un modelo de 0,5B.
- Filtrado de correos y adjuntos en gateways de correo: clasificar adjuntos y cuerpos de mensajes en busca de datos confidenciales antes de permitir la salida, con latencia baja gracias al tamano reducido del modelo base.
- Moderacion de contenido en aplicaciones internas: etiquetar documentos subidos por empleados a repositorios compartidos para detectar exposicion accidental de informacion restringida.
- Clasificacion en el borde (*edge*): despliegue en portatiles o dispositivos con poca VRAM (el modelo base cabe en cuantizacion 4-bit en menos de 1 GB), permitiendo procesamiento local sin enviar datos a la nube.
- Enriquecimiento de metadatos en gestores documentales: generar etiquetas de sensibilidad para cada documento indexado, alimentando sistemas de busqueda y control de acceso.
- Pre-filtrado en sistemas de compliance: clasificar muestras de documentos para auditorias de cumplimiento (GDPR, HIPAA u otros marcos) antes de una revision humana, reduciendo el volumen a revisar.
- Prototipado rapido de clasificadores de seguridad: servir como baseline afinable con LoRA sobre nuevos datasets DLP sin reentrenar el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B-Instruct ocupa aproximadamente 1 GB en FP16 y unos 0,3-0,5 GB en cuantizacion 4-bit; el adaptador LoRA anade unos pocos MB. La VRAM total real depende de la implementacion y del tamano de lote.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU y dispositivos de borde.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base Qwen2.5-0.5B-Instruct y aplicar el adaptador con `peft`. Compatible con transformers, vLLM (con soporte LoRA), TGI (con adaptadores) y llama.cpp/Ollama si se fusionan los pesos y se convierten a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo base se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EdgeSLM-qwen0.5b-v3 | 0,5B (base) + LoRA | 32.768 | Clasificacion DLP | MIT | Gated en HF |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 | Generacion general | Apache 2.0 | Publico |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Generacion general | Apache 2.0 | Publico |
| SmolLM2-360M-Instruct | 0,36B | 8.192 | Generacion general | Apache 2.0 | Publico |

La comparativa directa con clasificadores DLP especializados no esta disponible en la informacion proporcionada. Frente al modelo base, el adaptador anade la cabeza de clasificacion y el ajuste a la tarea, pero pierde la garantia de calidad conversacional del modelo original. Frente a alternativas mas grandes (1,5B), el modelo es mas ligero pero con menor capacidad de razonamiento; la eleccion depende de si la tarea es puramente clasificatoria o requiere generacion.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar el modelo.
- Documentacion muy escasa: no hay model card detallada, ni dataset, ni metricas de evaluacion publicadas.
- Solo ingles declarado: no se garantiza rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion y falsos positivos/negativos en la clasificacion: al ser un modelo de 0,5B, su capacidad de discriminacion fina es limitada; se recomienda validacion con un conjunto de test propio.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni posibles sesgos.
- Licencia MIT: permite uso comercial, pero al derivar de Qwen2.5-0.5B-Instruct (Apache 2.0) conviene verificar el cumplimiento de ambas licencias.
- Idoneidad para produccion no verificada: sin benchmarks ni pruebas publicas, no debe desplegarse en entornos criticos sin una evaluacion exhaustiva.
- El adaptador no sustituye a un modelo conversacional: si se necesita generacion de texto de calidad, debe usarse el modelo base sin el adaptador o un modelo mayor.

## Enlaces

- Hugging Face: https://huggingface.co/prajwalpujari16/EdgeSLM-qwen0.5b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentacion Qwen2.5: https://qwen.readthedocs.io/
