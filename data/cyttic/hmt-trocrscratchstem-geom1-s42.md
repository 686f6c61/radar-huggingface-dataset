# cyttic/hmt-trocrscratchstem-geom1-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchstem-geom1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el usuario cyttic y publicado en Hugging Face. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se comparan distintas variantes de un mismo modelo base entrenado con diferentes estrategias de aumento geométrico y semillas. En concreto, esta variante corresponde al modelo `trocrscratchstem` con el aumento `geom1` y la semilla 42.

El modelo resuelve la transcripción de imágenes de texto manuscrito a texto plano mediante un esquema CTC (*Connectionist Temporal Classification*), sin modelo de lenguaje externo en la decodificación. Está entrenado específicamente para hebreo (`he`) y se distribuye con licencia MIT en formato safetensors, con un total de 24.928.588 parámetros y un tamaño de repositorio de 0,1 GB.

Su relevancia es acotada y fundamentalmente experimental: se trata de un artefacto de investigación para reproducir y comparar métricas de HTR bajo distintas condiciones de aumento de datos, no de un modelo de propósito general. La información pública disponible es muy limitada y se reduce a la model card y a los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base identificado como `trocrscratchstem`; se infiere una arquitectura tipo TrOCR con cabecera CTC, pero no se detalla en la información proporcionada) |
| Parámetros totales | 24.928.588 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla en la información proporcionada la arquitectura interna del modelo más allá del nombre `trocrscratchstem`, que sugiere un modelo basado en TrOCR entrenado desde cero (*scratch*) con un componente de *stem* (tronco o extractor inicial). El esquema de decodificación documentado es CTC (*Connectionist Temporal Classification*) con decodificación voraz (*greedy*) y sin modelo de lenguaje, lo que implica que la salida se genera directamente a partir de las probabilidades por fotograma sin corrección lingüística posterior.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) del conjunto de desarrollo (*dev*) para evitar fuga de información entre particiones. La evaluación se realizó sobre el conjunto de test HHD Option-B. La variante corresponde al aumento geométrico `geom1` con semilla 42, dentro de un estudio sistemático de transferencia de métricas de HTR. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en una tarea de reconocimiento de texto).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo: transcripción de imágenes de escritura manual a texto plano.
- Decodificación CTC con estrategia voraz (*greedy decoding*), sin modelo de lenguaje externo.
- Salida a nivel de carácter y de palabra, evaluable mediante CER (*Character Error Rate*) y WER (*Word Error Rate*).
- Entrenamiento y evaluación orientados a la transferencia de métricas entre condiciones de aumento de datos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento (*thinking mode*).
- Capacidad multilingüe: limitada al hebreo según los metadatos (`language: he`).

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de documentos históricos o administrativos escritos a mano, sirviendo como componente base para pipelines de digitalización masiva.
- Reproducción de experimentos de HTR: al estar identificado por modelo base, aumento y semilla, permite reproducir exactamente la condición `trocrscratchstem` + `geom1` + semilla 42 dentro del estudio `htr-metrics-transfer`.
- Evaluación comparativa de aumentos de datos: sirve como punto de referencia frente a otras variantes del mismo estudio para medir el efecto del aumento geométrico sobre CER y WER.
- Investigación en reconocimiento de escritura manuscrita: útil para estudiar el comportamiento de decodificación CTC sin modelo de lenguaje en una lengua con alfabeto no latino.
- Prototipado de sistemas de OCR/HTR para hebreo: puede integrarse como etapa de transcripción en un sistema mayor, siempre que se valide su robustez en el dominio objetivo.
- Análisis de errores por carácter y por palabra: sus métricas publicadas (CER 0,0616 y WER 0,2831) permiten caracterizar dónde falla el modelo y orientar futuras mejoras.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los de la model card, sobre el conjunto de test HHD Option-B con decodificación voraz y sin modelo de lenguaje:

| Métrica | Valor |
|---|---|
| CER (*Character Error Rate*) | 0,0616 |
| WER (*Word Error Rate*) | 0,2831 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales por subconjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 24,9 millones de parámetros, el modelo en precisión completa (fp32) ocuparía aproximadamente 100 MB de pesos, por lo que la VRAM necesaria sería muy reducida y vendría dominada por el procesamiento de imágenes y los *activations*.
- GPU recomendadas: cualquier GPU con suficiente memoria para el tamaño de lote de imágenes empleado; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido número de parámetros, aunque no se documenta oficialmente.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de HTR con pesos safetensors, requeriría un *runtime* compatible con la arquitectura TrOCR/CTC.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables (mismo tamaño, misma tarea o mismo idioma) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia. Las únicas referencias internas son las demás variantes del estudio `htr-metrics-transfer` del mismo autor, cuyos resultados no se detallan aquí.

| Modelo | Parámetros | Contexto | CER | WER | Licencia |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-geom1-s42 | 24.928.588 | no disponible | 0,0616 | 0,2831 | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: es un artefacto de un estudio de aumento de datos, no un producto validado para producción.
- Idiomas: únicamente hebreo; no se ha evaluado su comportamiento en otras lenguas ni en escritura impresa.
- Sin modelo de lenguaje: la decodificación voraz CTC sin corrección lingüística tiende a producir errores ortográficos y de segmentación de palabras (WER 0,2831 frente a CER 0,0616).
- Riesgo de sobreajuste al dominio: entrenado sobre un conjunto concreto (`hhd-optionb-split`) y evaluado sobre HHD Option-B; el rendimiento puede degradarse en otros estilos de escritura, soportes o resoluciones.
- Sesgos: no se documentan análisis de sesgo por escritor, género, época o tipo de documento; la exclusión de escritores del conjunto de desarrollo mitiga la fuga de información, pero no garantiza representatividad.
- Alucinación: en HTR el riesgo se manifiesta como sustituciones, inserciones y omisiones de caracteres, no como generación libre; aun así, requiere revisión humana en aplicaciones sensibles.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene conservar el aviso de copyright y verificar la licencia de los datos de entrenamiento originales.
- Documentación escasa: no se detallan hiperparámetros, composición del dataset, arquitectura exacta ni requisitos de despliegue, lo que dificulta su reproducción fuera del entorno del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-geom1-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del estudio (referenciado en la model card como `results.json`): no disponible como enlace directo en la información proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
