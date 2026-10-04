# francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed3407

## Resumen

El modelo `francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed3407` es un ajuste fino de `goldfish-models/eus_latn_100mb`, un modelo de lenguaje monolingüe de tamano pequeno (aproximadamente 124,8 millones de parametros) orientado al euskera (codigo `eus_latn`). Lo publica el usuario francesca9805, vinculado a la Universidad de Groningen segun la ejecucion de Weights & Biases enlazada en la model card, y forma parte de una linea de experimentos sobre tokenizacion y formatos de entrenamiento estructurados mas que de un modelo de proposito general.

El modelo se ha entrenado mediante SFT (supervised fine-tuning) con la libreria TRL sobre el modelo base, y conserva la arquitectura GPT-2 que caracteriza a la familia goldfish. Con unos 124,8 millones de parametros y un peso en repositorio de solo 0,3 GB, esta pensado para experimentacion ligera en lengua vasca y para pruebas de formato de instrucciones, no para cargas de produccion.

Su relevancia es acotada: es un artefacto de investigacion con cero descargas y cero likes en el momento de redactar esta ficha, sin licencia declarada ni idiomas especificados en la model card. Resulta util como referencia para quien trabaja con modelos pequenos multilingues de la familia goldfish o estudia variantes de SFT sobre corpus reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun el tag `gpt2` |
| Parametros totales | 124.770.816 (aproximadamente 124,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens (valor estandar de la arquitectura GPT-2; no confirmado en la model card) |
| Tipos de cuantizacion | No disponibles en el repositorio; pesos en safetensors (se puede convertir a GGUF para cuantizacion) |
| Idiomas soportados | No declarados en la model card; el modelo base es de euskera (codigo `eus_latn`) |
| Licencia | No disponible (la model card incluye un placeholder `licence: license`) |
| Formato de pesos | Safetensors |
| Modelo base | goldfish-models/eus_latn_100mb |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only autorregresivo. Con 124.770.816 parametros, coincide practicamente con la configuracion de GPT-2 small, incluida la ventana de contexto de 1024 tokens. El modelo base, `goldfish-models/eus_latn_100mb`, pertenece a la familia goldfish de modelos monolingues de 100 MB por idioma, orientada a cubrir lenguas con pocos recursos; en este caso el euskera en escritura latina.

El ajuste se ha realizado con SFT usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si hubo fases adicionales de RLHF o DPO. Tampoco detalla la innovacion implicada en el sufijo del nombre (`ppt-mp-struct-100mb_seed3407`), que sugiere una variante experimental de formato estructurado y una semilla concreta (3407), pero sin informacion tecnica adicional en la documentacion publicada.

## Capacidades

- Generacion de texto autorregresiva basica, en linea con un modelo GPT-2 de 124 M de parametros.
- Ajuste por instrucciones mediante SFT, con un ejemplo de uso conversacional en la model card (mensaje con rol `user` y generacion de respuesta).
- Compatibilidad con `transformers` a traves del pipeline `text-generation`.
- Compatibilidad con text-generation-inference (tags `text-generation-inference` y `endpoints_compatible`).
- Capacidad multilingue: no declarada; el foco del modelo base es el euskera, aunque la model card no especifica idiomas.
- Tool calling, function calling, modo de razonamiento explicito, vision, audio y capacidades de agente: no disponibles ni documentadas.

## Casos de uso

- Experimentacion academica en procesamiento de lengua vasca: permite reproducir o comparar variantes de ajuste fino sobre el modelo base `eus_latn_100mb` con una semilla fija, util para estudios de reproducibilidad.
- Investigacion sobre formatos de entrenamiento estructurados: el sufijo `struct` del nombre apunta a pruebas de plantillas o serializacion de datos, por lo que sirve como artefacto de comparacion en ese tipo de estudio.
- Pruebas de pipeline de generacion de texto en local: con 0,3 GB y 124 M de parametros, se puede cargar en portatil o incluso CPU para validar la integracion con `transformers` o TGI antes de escalar a modelos mayores.
- Generacion de texto en euskera de baja exigencia: completado de frases o parrafos cortos en contextos donde la coherencia exigida es minima y el coste computacional debe ser casi nulo.
- Banco de pruebas para tokenizadores: dado que la ejecucion asociada en Weights & Biases se enmarca en un proyecto llamado "new-tokenizers", es adecuado para evaluar el impacto de cambios de tokenizacion en el ajuste fino.
- Docencia y prototipado rapido: sirve para demostrar un flujo completo de fine-tuning con TRL y SFT sin requerir GPU de gama alta.
- Comparacion de semillas en SFT: junto con otras variantes de la misma familia, permite estudiar la varianza de resultados en funcion de la semilla de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, alrededor de 0,5 GB; en FP16, aproximadamente 0,25 GB. Los pesos ocupan unos 0,3 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; tarjetas como GTX 1050 Ti, RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque las de gama alta estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna; tambien se puede ejecutar en CPU con latencia aceptable.
- Opciones de despliegue: `transformers` (pipeline `text-generation`), text-generation-inference (el modelo esta marcado como compatible), y llama.cpp u Ollama si se convierte previamente a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed3407 | 124,8 M | 1024 tokens (segun arquitectura GPT-2) | No declarados (base en euskera) | No disponible | HuggingFace, 0 descargas |
| goldfish-models/eus_latn_100mb (modelo base) | No disponible (familia de 100 MB) | No disponible | Euskera | No disponible en esta ficha | HuggingFace |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Ingles principalmente | MIT | HuggingFace y multiples replicas |
| DistilGPT-2 | 82 M | 1024 tokens | Ingles | MIT | HuggingFace |

La comparacion con GPT-2 small es la mas directa en terminos de arquitectura y tamano, aunque el dominio linguistico difiere: GPT-2 small esta orientado al ingles, mientras que este modelo parte de un corpus en euskera. Frente a DistilGPT-2, es algo mayor y no esta destilado. La model card no aporta datos de rendimiento que permitan comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion por terceros.
- Licencia no disponible: la model card incluye un placeholder (`licence: license`), por lo que no se puede confirmar si esta permitido el uso comercial. Conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Idiomas no declarados oficialmente: aunque el modelo base es de euskera, la model card no especifica el alcance linguistico real tras el ajuste fino.
- Riesgo de alucinacion elevado: con 124 M de parametros, la coherencia factual es muy limitada y es probable que genere contenido incorrecto o sin sentido en prompts complejos.
- Contexto reducido: la ventana de 1024 tokens de GPT-2 limita conversaciones largas y tareas de resumen extenso.
- Sin informacion sobre el dataset de ajuste: no se puede evaluar sesgos, contaminacion de datos ni cobertura tematica.
- Sin benchmarks publicados: no hay forma de cuantificar su calidad frente a alternativas.
- No documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no deberia emplearse en flujos agenticos.
- El nombre del modelo (`ppt-mp-struct`) sugiere un experimento acotado; su comportamiento fuera del formato exacto de entrenamiento es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/adwhfzdg
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de referencia de TRL (von Werra et al., 2020): https://github.com/huggingface/trl
- Coleccion goldfish-models (referencia de la familia): https://huggingface.co/goldfish-models
