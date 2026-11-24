# KaicedraConsulting/plaintes-fr-classifieur-v2

## Resumen

`KaicedraConsulting/plaintes-fr-classifieur-v2` es un clasificador de texto en francés especializado en denuncias medioambientales, desarrollado por Kaicedra Consulting para la plataforma Map Action. El modelo resuelve un problema acotado pero operativo: asignar una queja breve en francés (por ejemplo, "Le caniveau est bouché devant l'école") a una taxonomía de incidentes con 8 familias y 32 tipos, lo que permite enrutar y priorizar reclamaciones ciudadanas de forma automática.

Técnicamente es un fine-tuning de `intfloat/multilingual-e5-base`, un transformer encoder de la familia E5 orientado a embeddings multilingües. El repositorio contiene dos cabezas de clasificación independientes: `modele-famille/` (8 clases) y `modele-type/` (32 clases), ambas distribuidas en formato safetensors y compatibles con la librería `transformers`. El modelo base es de tipo encoder, por lo que no genera texto: produce una etiqueta por secuencia.

Su relevancia radica en el contexto de despliegue: el pipeline real recibe denuncias traducidas automáticamente desde bambara, de modo que el clasificador debe ser robusto a ruido de traducción y a formulaciones no vistas. La model card reporta mejoras sustanciales frente a líneas base clásicas (TF-IDF + regresión logística) y frente a embeddings congelados, con un macro F1 de 77,2 % en familias y 65,7 % en tipos sobre un conjunto de test de 512 textos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tuning de `intfloat/multilingual-e5-base`) |
| Parametros totales | no disponible (el modelo base E5-base tiene ~278 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-base`, un encoder transformer entrenado con objetivos de representación densa. Sobre él se añaden dos cabezas de clasificación supervisada: una para las 8 familias de incidentes y otra para los 32 tipos. El input debe prefijarse con `query: `, convención heredada de la familia E5 que condiciona la representación hacia consultas de recuperación y clasificación.

El entrenamiento se realizó durante 8 épocas, con batch de 32, learning rate 4e-5 y un schedule de warm-up lineal con decaimiento. El dataset utilizado es `Map-Action/plaintes-environnement-fr`, en su versión v2 con 3.328 textos de entrenamiento (frente a los 2.048 de la v1). Los datos son sintéticos: las denuncias se redactaron por tipo de incidente y se expandieron con aperturas, lugares y consecuencias. No se documenta uso de RLHF, DPO ni preferencias humanas, lo cual es coherente con una tarea de clasificación supervisada.

## Capacidades

- Clasificación de texto multietiqueta en dos niveles jerárquicos: 8 familias y 32 tipos de incidente.
- Procesamiento de denuncias breves en francés, incluyendo formulaciones coloquiales y referencias a lugares concretos.
- Robustez parcial frente a errores de traducción automática desde bambara, según el escenario de despliegue descrito por el autor.
- Salida de etiqueta única por secuencia para cada cabeza (`modele-famille/` y `modele-type/`).
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidad multilingüe limitada al francés en la práctica, pese a que el modelo base es multilingüe.

## Casos de uso

- Enrutamiento de reclamaciones ciudadanas: el clasificador asigna cada denuncia entrante a una de las 8 familias (agua y saneamiento, residuos, calidad del aire, riesgos naturales, degradación del suelo, minería, biodiversidad, molestias), lo que permite dirigirla al departamento competente sin triaje manual.
- Priorización por tipo de incidente: con la cabeza de 32 clases se puede distinguir entre subtipos operativamente distintos dentro de una misma familia y activar protocolos específicos.
- Monitorización de mapas de incidentes: integrado en la plataforma Map Action, permite agregar denuncias georreferenciadas por categoría y detectar acumulaciones anómalas en un barrio o municipio.
- Prefiltrado en pipelines de traducción: al recibir texto traducido desde bambara, el modelo sirve como primera etapa que descarta entradas no clasificables antes de un análisis más costoso.
- Análisis de series temporales de quejas: al etiquetar grandes volúmenes históricos se pueden construir indicadores de evolución por familia de incidente y detectar estacionalidad (por ejemplo, residuos o calidad del aire).
- Asistencia a operadores humanos: el modelo propone una etiqueta y el operador la valida, reduciendo el tiempo medio de triaje en flujos de atención ciudadana con volumen alto y presupuesto limitado.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 512 textos de test reservados, con formulaciones de denuncia no presentes en entrenamiento.

| Version | Familias: macro F1 | Familias: accuracy | Tipos: macro F1 | Tipos: accuracy |
|---|---|---|---|---|
| TF-IDF + regresion logistica | 51,8 % | 54,3 % | 35,1 % | 36,9 % |
| Embeddings E5 congelados + regresion logistica | 62,6 % | 65,4 % | 53,9 % | 56,3 % |
| E5 fine-tuned, dataset v1 (2.048 textos) | 67,8 % | 69,0 % | 52,7 % | 55,3 % |
| E5 fine-tuned, dataset v2 (3.328 textos) | 77,2 % | 77,7 % | 65,7 % | 68,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable en un clasificador de dominio específico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (2,2 GB) y la arquitectura encoder del modelo base, el despliegue en FP32 requiere del orden de 1-2 GB de VRAM, y menos en FP16 o INT8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP16; A100, H100 o RTX 4090 no son necesarias para esta carga.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3060, RTX 4060 y superiores; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, FastAPI con `transformers`, o exportación a ONNX para inferencia optimizada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder de clasificación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `KaicedraConsulting/plaintes-fr-classifieur-v2` | no disponible (base E5-base) | no disponible | Clasificacion de denuncias ambientales en frances (8/32 clases) | MIT | Hugging Face |
| `intfloat/multilingual-e5-base` | no disponible en la informacion | no disponible | Embeddings multilingues para recuperacion y clasificacion | MIT | Hugging Face |
| TF-IDF + regresion logistica (linea base del autor) | no aplica | no aplica | Clasificacion de texto | no disponible | Implementacion local |
| Embeddings E5 congelados + regresion logistica (linea base del autor) | no disponible | no disponible | Clasificacion de texto | MIT (modelo base) | Implementacion local |

No se dispone de datos de benchmarks de clasificadores alternativos de denuncias ambientales en francés, por lo que la comparación se limita a las líneas base reportadas por el propio autor y al modelo base.

## Limitaciones y advertencias

- Los datos de entrenamiento son sintéticos: las denuncias se generaron por tipo de incidente y se expandieron con plantillas, lo que puede introducir un sesgo de formulación y reducir la generalización a lenguaje espontáneo real.
- Solapamiento taxonómico por diseño: "malos olores" aparece tanto en calidad del aire como en molestias, lo que limita el techo de precisión en la cabeza de familias.
- El pipeline real traduce desde bambara de forma automática, añadiendo errores que el modelo no ha visto durante el entrenamiento.
- El macro F1 en tipos (65,7 %) es notablemente inferior al de familias (77,2 %), por lo que la clasificación fina debe tratarse con cautela en producción.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de etiquetas incorrectas en entradas ambiguas o fuera de dominio.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar el aviso de copyright y verificar la licencia del modelo base.
- Idiomas: solo francés; no se ha validado su comportamiento en otras lenguas pese a la naturaleza multilingüe del modelo base.
- No se documentan sesgos demográficos ni geográficos específicos, pero la taxonomía está diseñada para el contexto de Malí y la plataforma Map Action, lo que puede limitar su transferencia a otros países.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaicedraConsulting/plaintes-fr-classifieur-v2
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Plataforma Map Action: https://www.map-action.com
- Dataset de entrenamiento citado: `Map-Action/plaintes-environnement-fr` (referencia en la model card; no se proporciona URL directa en la información disponible)
