# cyttic/hmt-trocrctc-photo3-s42

## Resumen

`cyttic/hmt-trocrctc-photo3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario cyttic en Hugging Face. Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en su primera oleada (*wave 1*), y combina una arquitectura TrOCR con un cabezal de decodificación CTC. El identificador del modelo codifica sus condiciones experimentales: arquitectura `trocrctc`, aumentación `photo3` y semilla 42.

El modelo está entrenado sobre un subconjunto del dataset `cyttic/hhd-optionb-split`, concretamente el split de entrenamiento excluyendo los escritores de desarrollo, y evaluado sobre el conjunto de test HHD Option-B con decodificación voraz (*greedy*) y sin modelo de lenguaje. Los resultados reportados son un CER de 0,1186 y un WER de 0,4752.

Se trata de un artefacto de investigación con 87,3 millones de parámetros y un repositorio de 0,3 GB en formato safetensors. Su relevancia es acotada: no es un modelo de propósito general, sino una pieza concreta dentro de un estudio comparativo de técnicas de aumentación para HTR en hebreo, con cero descargas y cero *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con decodificacion CTC (segun identificador `trocrctc`; detalles no disponibles) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura TrOCR (Transformer *encoder-decoder* para reconocimiento óptico de caracteres) adaptada con un cabezal CTC, según se deduce del identificador `trocrctc`. No se dispone de información detallada sobre el encoder visual, la configuración de capas, la dimensión oculta ni el mecanismo de atención empleado.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la aumentación `photo3` y semilla 42. La evaluación se hizo sobre el conjunto de test HHD Option-B con decodificación voraz y sin modelo de lenguaje externo. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco probables en una tarea de reconocimiento de texto). El autor remite a un fichero `results.json` para los detalles, no incluido en la información disponible.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo sobre imágenes de documentos.
- Decodificación CTC con alineamiento directo entre secuencias de imagen y texto, sin modelo de lenguaje auxiliar.
- Salida de transcripción a nivel de carácter y palabra, evaluable mediante CER y WER.
- No se documentan capacidades de generación de texto libre, razonamiento, código, matemáticas, visión general, tool calling, agentes ni modo *thinking*.
- Multilingüismo limitado al hebreo según la etiqueta de idioma del repositorio.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir páginas escaneadas de colecciones históricas o administrativas, con un CER de referencia del 11,86 % en el conjunto de test HHD Option-B.
- Investigación en aumentación de datos para HTR: sirve como punto de comparación (semilla 42, aumentación `photo3`) dentro del estudio `htr-metrics-transfer` para medir el efecto de distintas estrategias de aumentación.
- Reproducción de experimentos: al estar publicado con licencia MIT y pesos safetensors, permite replicar la evaluación sobre HHD Option-B con decodificación voraz y sin LM.
- Prototipado de pipelines de OCR manuscrito en hebreo: puede integrarse como etapa de transcripción en un sistema mayor, siempre que se acepte su tasa de error actual.
- Análisis de sensibilidad a la semilla: al existir variantes con otras semillas y aumentaciones del mismo estudio, facilita estudiar la varianza entre ejecuciones.
- Extracción de texto para indexación y búsqueda: la transcripción generada puede alimentar motores de búsqueda documental en hebreo, con revisión humana posterior dado el WER del 47,52 %.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B (test) | CER | 0,1186 |
| HHD Option-B (test) | WER | 0,4752 |

Condiciones de evaluación: decodificación voraz (*greedy*), sin modelo de lenguaje. No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks estándar de HTR como IAM o RIMES.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 87,3 millones de parámetros, en FP32 ocuparía aproximadamente 0,35 GB de pesos, y en FP16 alrededor de 0,17 GB, a lo que habría que sumar el encoder visual y las activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para inferencia en precisión reducida, aunque no se dispone de cifras oficiales.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas como RTX 3060, RTX 4060 o superiores, dado el reducido tamaño del modelo; sin confirmación del autor.
- Opciones de despliegue: al ser un modelo safetensors de tipo TrOCR, es compatible con la librería `transformers` de Hugging Face; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | CER (HHD Option-B) |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-photo3-s42 | 87,3 M | no disponible | hebreo | MIT | 0,1186 |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | hebreo | MIT (presumible) | no disponible |
| TrOCR base (Microsoft) | no disponible en esta ficha | no disponible | ingles principalmente | MIT | no aplica (otro dataset) |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría y dataset. Las variantes del mismo estudio (otras semillas y aumentaciones) serían los comparadores naturales, pero sus resultados no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero *likes*: no hay evidencia de validación por parte de la comunidad.
- El WER del 47,52 % indica una tasa de error elevada a nivel de palabra; el CER del 11,86 % sigue siendo alto para uso en producción sin revisión humana.
- Evaluación realizada únicamente con decodificación voraz y sin modelo de lenguaje; el rendimiento con otras estrategias de decodificación no está documentado.
- Entrenado y evaluado exclusivamente en hebreo sobre un dataset concreto (HHD Option-B); la generalización a otros dominios, escritores o estilos caligráficos no está verificada.
- Riesgo de alucinación y de sustituciones sistemáticas de caracteres no cuantificado en la información disponible.
- Sesgos demográficos, de escritura o de dominio no documentados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se especifican requisitos de preprocesado de imagen, resolución de entrada ni formato esperado, lo que dificulta su integración directa.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-photo3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: fichero `results.json` referenciado en la model card (no enlazado directamente en la información disponible)
- Estudio `htr-metrics-transfer`: sin enlace público en la información disponible
- Paper, blog o repositorio adicionales: no disponibles
