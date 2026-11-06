# maju116/platypus-weights

## Resumen

`maju116/platypus-weights` es un repositorio de pesos entrenados para `pyplatypus` (Python) y `rplatypus` (R), dos librerías del mismo autor para segmentación de imágenes y detección de objetos. No se trata de un modelo fundacional único, sino de una colección de checkpoints específicos por tarea: cada archivo de pesos va acompañado de un `.json` que documenta para qué se entrenó y con qué datos. El repositorio se publica como artefacto de soporte de las librerías, no como modelo de propósito general.

Los pesos cubren segmentación semántica de núcleos celulares en microscopía (U-Net sobre BBBC038v1), segmentación de vasos retinianos en fondo de ojo (FIVES), biometría fetal en ecografía (HC18) y detección de instancias/células (variantes YOLO y de instancias). El modelo más documentado, `dsbowl-unet`, tiene 1.942.594 parámetros, entrada de 256 × 256 píxeles y 3 canales, y se distribuye en safetensors de 7,8 MB. La relevancia es acotada: sirve a quien use las librerías `pyplatypus`/`rplatypus` y quiera reproducir resultados sin reentrenar.

La licencia es mixta y depende del archivo: `dsbowl-unet`, `dsbowl-instances` y `bccd-yolo3` son MIT, mientras que `fives-unet` y `hc18-unet` son CC BY 4.0 por ser derivados de datasets con esa licencia. El repositorio declara `other` para reflejar esa mezcla. No hay información sobre idiomas ni sobre capacidades de texto: es un modelo puramente de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (4 bloques, 16 filtros base) para `dsbowl-unet`; variantes U-Net++, LinkNet, Res-U-Net y YOLO en otros archivos |
| Parametros totales | 1.942.594 (`dsbowl-unet`); 2.263.730 (U-Net++); 1.746.754 (LinkNet); 2.029.682 (Res-U-Net) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 256 × 256 × 3 canales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT para `dsbowl-unet`, `dsbowl-instances`, `bccd-yolo3`; CC BY 4.0 para `fives-unet` y `hc18-unet`; el repositorio declara `other` |
| Formato de pesos | safetensors (con `.json` de metadatos por archivo) |

## Arquitectura y entrenamiento

`dsbowl-unet` es una U-Net clásica con 4 bloques y 16 filtros base, entrada RGB de 256 × 256 y salida de 2 clases (fondo y núcleo). Se entrenó con pérdida CCE-Dice sobre BBBC038v1 (`stage1_train`), el conjunto del 2018 Data Science Bowl del Broad Bioimage Benchmark Collection: 670 imágenes de núcleos en tipos celulares, aumentos y modalidades diversas, divididas 536/134 por imagen con semilla 1. El autor eligió la copia del Broad en lugar del espejo de Kaggle por motivos de licencia del dato subyacente.

El autor comparó las cuatro arquitecturas que genera `pyplatypus` con el mismo split, aumento y 60 épocas: U-Net (0,9217 Dice), U-Net++ (0,9212), LinkNet (0,9203) y Res-U-Net (0,9187). La dispersión entre arquitecturas (0,0030) es mucho menor que la dispersión entre imágenes dentro de un mismo modelo (0,054), y el ruido de semilla (0,0012) representa el 40 % de la diferencia total entre arquitecturas. De ahí que solo se publique un conjunto de pesos y que la elección de U-Net sea arbitraria pero medida. No se documentan RLHF, DPO ni técnicas de decodificación especulativa; no aplican a este tipo de modelo.

## Capacidades

- Segmentación semántica binaria de núcleos celulares en imágenes de microscopía de campo claro.
- Segmentación de vasos retinianos en imágenes de fondo de ojo (`fives-unet`).
- Biometría fetal en ecografía (`hc18-unet`).
- Detección de objetos e instancias (`bccd-yolo3`, `dsbowl-instances`).
- Carga de pesos por nombre con pin a un commit del repositorio, lo que garantiza reproducibilidad de resultados.
- Uso desde Python (`pyplatypus`) y desde R (`rplatypus`), con API equivalente en ambas.
- Carga desde ruta local sin conexión a internet (sin necesidad del extra `hub`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Segmentación de núcleos en pipelines de biología celular: cargar `dsbowl-unet` con `weights="dsbowl-unet"` y `fit=False` para obtener máscaras binarias sobre lotes de imágenes de microscopía sin reentrenar, con Dice medio de 0,9205 en el conjunto de validación.
- Preprocesado en estudios de recuento celular aproximado: útil cuando basta con delimitar regiones de núcleos y no se requiere separar células en contacto (para eso haría falta la variante de instancias).
- Segmentación de vasos retinianos en investigación oftalmológica: `fives-unet` sobre imágenes de fondo de ojo para extraer el árbol vascular como paso previo a medidas de calibre o tortuosidad.
- Biometría fetal en ecografía: `hc18-unet` para delimitar estructuras fetales en imágenes ecográficas dentro de flujos de medida asistida.
- Detección de células en imágenes de sangre periférica: `bccd-yolo3` para localizar instancias en lugar de solo segmentar píxeles.
- Reproducibilidad de experimentos: al fijar el nombre del peso a un commit, un artículo o informe puede citar exactamente los números obtenidos con esos pesos y ese split.
- Despliegue en entornos sin internet: descarga manual del safetensors y carga por ruta local, útil en equipos de laboratorio aislados.
- Docencia y comparación de arquitecturas: el script `examples/compare_dsbowl_architectures.py` permite reproducir la comparación entre U-Net, U-Net++, LinkNet y Res-U-Net sobre el mismo split.

## Benchmarks y rendimiento

Resultados de `dsbowl-unet` sobre las 134 imágenes de validación, calculados por imagen (no agrupados):

| Metrica | Media | Desv. tipica | Mediana | Minimo | Maximo |
|---|---|---|---|---|---|
| Dice | 0,9205 | 0,0532 | 0,9314 | 0,7240 | 0,9861 |
| IoU | 0,8570 | 0,0865 | 0,8716 | 0,5675 | 0,9725 |

Comparación de arquitecturas con el mismo split, aumento y 60 épocas:

| Modelo | Parametros | s/epoca | Epocas | Dice medio | Desv. tipica | Mediana | Minimo |
|---|---|---|---|---|---|---|---|
| U-Net | 1.942.594 | 15,5 | 60 | 0,9217 | 0,054 | 0,9353 | 0,7227 |
| U-Net++ | 2.263.730 | 18,8 | 44 | 0,9212 | 0,055 | 0,9323 | 0,7459 |
| LinkNet | 1.746.754 | 14,0 | 60 | 0,9203 | 0,053 | 0,9293 | 0,7205 |
| Res-U-Net | 2.029.682 | 14,2 | 55 | 0,9187 | 0,058 | 0,9293 | 0,6706 |

No se han publicado resultados de benchmarks para `fives-unet`, `hc18-unet`, `dsbowl-instances` ni `bccd-yolo3` en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para `dsbowl-unet` en FP32 (1,94 M de parámetros y entradas de 256 × 256); el archivo de pesos ocupa 7,8 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100. Una GTX 1650, RTX 3050 o superior es suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `pyplatypus` (Python) y `rplatypus` (R) son las vías documentadas. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El dato de 15,5 s por época en entrenamiento con U-Net da una idea del orden de magnitud del coste computacional, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Dice (BBBC038v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dsbowl-unet` (este) | 1.942.594 | 256 × 256 × 3 | 0,9205 | MIT | Hugging Face, safetensors |
| U-Net++ (misma librería) | 2.263.730 | 256 × 256 × 3 | 0,9212 | MIT (pesos no publicados) | Solo en el script de comparación |
| LinkNet (misma librería) | 1.746.754 | 256 × 256 × 3 | 0,9203 | MIT (pesos no publicados) | Solo en el script de comparación |
| Res-U-Net (misma librería) | 2.029.682 | 256 × 256 × 3 | 0,9187 | MIT (pesos no publicados) | Solo en el script de comparación |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada, por lo que la comparativa se limita a las variantes de la propia librería.

## Limitaciones y advertencias

- `dsbowl-unet` no separa núcleos en contacto: es segmentación semántica, no de instancias, por lo que dos núcleos adyacentes se devuelven como una sola región. Los números publicados no son comparables con el leaderboard del 2018 Data Science Bowl, que puntuaba instancias.
- El mínimo de Dice (0,7240) y de IoU (0,5675) indica que en algunas imágenes el rendimiento cae de forma notable; el autor lista las cinco peores en `dsbowl-unet.json`.
- La licencia varía por archivo: `fives-unet` y `hc18-unet` son CC BY 4.0 y exigen atribución; no deben tratarse como MIT aunque el repositorio declare `other`.
- Los pesos de FIVES y HC18 son plausiblemente obra derivada de los datasets originales, de modo que las condiciones de esos datasets viajan con los pesos.
- No hay información sobre sesgos demográficos o de adquisición de imagen; en imágenes médicas, la variabilidad de equipos y protocolos puede degradar el rendimiento fuera de la distribución de entrenamiento.
- Riesgo de alucinación no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de falsos positivos y negativos en la segmentación, especialmente en imágenes con artefactos o baja calidad.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere una validación externa muy limitada.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita el despliegue en entornos que solo admiten GGUF u ONNX.

## Enlaces

- Hugging Face: https://huggingface.co/maju116/platypus-weights
- Paquete Python `pyplatypus`: https://pypi.org/project/pyplatypus/
- BBBC038v1 (Broad Bioimage Benchmark Collection): https://bbbc.broadinstitute.org/BBBC038
- Ficha en Free2AITools: https://free2aitools.com/model/maju116/platypus-weights
- Repositorio de datos FIVES: no disponible como enlace directo en la información
- Repositorio de datos HC18: no disponible como enlace directo en la información
