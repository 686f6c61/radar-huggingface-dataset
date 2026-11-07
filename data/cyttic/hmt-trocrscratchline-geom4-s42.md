# cyttic/hmt-trocrscratchline-geom4-s42

## Resumen

`cyttic/hmt-trocrscratchline-geom4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el autor `cyttic` en Hugging Face. Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se entrenan distintas variantes de arquitectura y aumentación con una semilla fija (42) para medir su efecto sobre las métricas de error. En concreto, esta variante usa la arquitectura `trocrscratchline` con la aumentación `geom4`.

El modelo resuelve la transcripción de líneas de texto manuscrito en hebreo (`he`), empleando un esquema de decodificación CTC con decodificación voraz y sin modelo de lenguaje. Se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split` (parte de entrenamiento menos los escritores de desarrollo) y se evalúa sobre el test HHD Option-B.

Con 22.421.004 parámetros y un repositorio de solo 0,1 GB, es un modelo compacto y de licencia MIT, pensado más como pieza de un experimento reproducible de investigación que como producto listo para producción. Su relevancia radica en que documenta de forma explícita la configuración (arquitectura, aumentación y semilla) y los resultados de error, lo que facilita la comparación entre variantes del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `trocrscratchline` (familia TrOCR, variante "scratch line") |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia TrOCR, un esquema *encoder-decoder* orientado a reconocimiento de texto en imagen, en su variante `trocrscratchline` (entrenamiento desde cero sobre líneas de texto). La decodificación se realiza con CTC en modo voraz (*greedy*) y sin modelo de lenguaje externo, según indica la model card. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (en un modelo HTR estos últimos no serían el mecanismo habitual).

El entrenamiento se realizó sobre `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la aumentación `geom4` y semilla 42. La innovación metodológica del trabajo no está en la arquitectura sino en el diseño experimental: variantes de arquitectura y aumentación con semilla fija para aislar el efecto de la aumentación sobre las métricas de error (CER y WER). Los detalles completos se remiten a `results.json` en el repositorio.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) sobre imágenes de líneas de texto en hebreo.
- Transcripción a nivel de carácter y de palabra, evaluada mediante CER y WER.
- Decodificación CTC voraz sin modelo de lenguaje.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad monolingüe: únicamente hebreo (`he`).
- No se documentan capacidades de visión general, audio ni modo de razonamiento (*thinking*).

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas de documentos escaneados, adecuado por su entrenamiento específico en líneas manuscritas y su bajo coste computacional (22,4 M de parámetros).
- Procesamiento por lotes de colecciones históricas: al ser un modelo compacto con pesos safetensors, puede ejecutarse en pipelines de inferencia masiva sobre CPU o GPU modesta para transcribir grandes volúmenes de imágenes de líneas.
- Componente base en estudios de aumentación: sirve como referencia reproducible (semilla 42, aumentación `geom4`) para comparar el efecto de distintas estrategias de aumentación sobre CER y WER frente a otras variantes del estudio `htr-metrics-transfer`.
- Evaluación comparativa de arquitecturas HTR: permite contrastar `trocrscratchline` con variantes como `trocrctc` o `htrvt` del mismo autor bajo condiciones controladas.
- Preetiquetado asistido para anotación humana: las transcripciones generadas pueden servir como borrador inicial que un revisor humano corrige, reduciendo el coste de anotación en corpus hebreos.
- Integración en herramientas de accesibilidad o búsqueda sobre documentos: al transcribir líneas manuscritas, habilita indexación y búsqueda de texto en colecciones que de otro modo serían solo imagen.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test HHD Option-B, decodificación voraz y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,1131 |
| WER | 0,4838 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que además no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,4 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB y en fp16 unos 45 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPU de gama baja (por ejemplo, GTX 1650 o superiores). Para lotes grandes se recomienda cualquier GPU con al menos 2 GB de VRAM.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer actuales.
- Opciones de despliegue: al ser un modelo de la familia TrOCR con pesos safetensors, puede cargarse con la librería `transformers`; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje y no a HTR).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparación con otras variantes del mismo estudio `htr-metrics-transfer` del autor `cyttic`:

| Modelo | Arquitectura | Aumentación | CER | WER | Licencia |
|---|---|---|---|---|---|
| `hmt-trocrscratchline-geom4-s42` | trocrscratchline | geom4 | 0,1131 | 0,4838 | MIT |
| `hmt-trocrctc-geom4-s42` | trocrctc | geom4 | 0,0712 | 0,3156 | no disponible |
| `hmt-htrvt-geom2-s42` | htrvt | geom2 | 0,0598 | 0,2669 | no disponible |

No se dispone de información sobre modelos comparables externos a este estudio en la documentación proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo manuscrito; no soporta otros idiomas ni texto impreso de forma documentada.
- El WER de 0,4838 es elevado: aproximadamente la mitad de las palabras presentan errores, lo que limita su uso directo en producción sin revisión humana.
- Entrenado sin modelo de lenguaje, por lo que no aprovecha corrección contextual; la decodificación voraz puede amplificar errores en secuencias ambiguas.
- Riesgo de alucinación y de sustituciones a nivel de carácter en escrituras o estilos no representados en el conjunto de entrenamiento.
- Sesgos potenciales derivados de los escritores y del corpus `hhd-optionb-split`; el rendimiento puede degradarse con escritores, épocas o caligrafías distintas.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del dataset de entrenamiento subyacente antes de un despliegue comercial.
- Modelo de investigación con 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de validación externa ni de soporte mantenido.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita opciones de optimización de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-geom4-s42
- Variante `trocrctc`: https://huggingface.co/cyttic/hmt-trocrctc-geom4-s42
- Variante `htrvt`: https://huggingface.co/cyttic/hmt-htrvt-geom2-s42
