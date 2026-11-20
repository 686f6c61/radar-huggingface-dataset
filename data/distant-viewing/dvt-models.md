# distant-viewing/dvt-models

## Resumen

`distant-viewing/dvt-models` es un repositorio de pesos auxiliares del Distant Viewing Toolkit (DVT), una herramienta de código abierto desarrollada por el Distant Viewing Lab (Taylor Arnold y Lauren Tilton) para el análisis computacional de grandes corpus visuales, principalmente vídeo. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un conjunto heterogéneo de pesos especializados que el toolkit descarga automáticamente para ejecutar tareas concretas de visión por computador sobre material audiovisual.

El repositorio agrupa cuatro artefactos: los pesos de TransNetV2 para detección de cortes de plano (`detect_shots.pt`), un detector YOLO26-large entrenado específicamente para localizar cabezas humanas (`yolo26l_heads.pt`) y dos ficheros del anotador de risas (una red neuronal y un clasificador de 200 árboles serializado en JSON). El tamaño total del repositorio es de aproximadamente 0,1 GB, coherente con pesos de detectores ligeros y no con modelos de gran escala.

Su relevancia es de infraestructura: centraliza pesos que de otro modo dependen de repositorios externos con cuotas LFS frecuentemente agotadas, lo que facilita la reproducibilidad de pipelines de análisis de vídeo a escala. No publica pipeline de Hugging Face, no declara idiomas y no ofrece una model card convencional con especificaciones de arquitectura o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heterogénea: TransNetV2 (red convolucional 3D para detección de cortes), YOLO26-large (detector one-stage), red neuronal para clasificación de risa y clasificador de 200 árboles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en precisión original PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | Mixta: MIT (TransNetV2 y ficheros de risa), AGPL-3.0 (YOLO26-large) |
| Formato de pesos | PyTorch state dict (`.pt`) y JSON (clasificador de risa) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo único sino cuatro componentes con arquitecturas y procedencias distintas. `detect_shots.pt` corresponde a los pesos de TransNetV2 (Souček y Lokoč), una red convolucional 3D diseñada para detectar fronteras de plano en vídeo; el fichero alojado aquí es la conversión a estado PyTorch generada por `inference-pytorch/convert_weights.py` a partir de los pesos originales en `inference/transnetv2-weights`. `yolo26l_heads.pt` es un detector YOLO26-large entrenado con la librería Ultralytics a partir de `yolo26l.pt`, especializado en la detección de cabezas humanas, presumiblemente para tareas de conteo de personas o análisis de encuadres.

Los dos ficheros de `laughter/` fueron entrenados por el propio Distant Viewing Lab: una red neuronal (`laughter_net.pt`) y un clasificador de 200 árboles exportado como JSON (`laughter_classifier.json`). La model card no detalla volúmenes de datos de entrenamiento, composición de datasets, ni si se aplicaron técnicas de aumento de datos o ajuste fino. No se menciona RLHF, DPO ni innovaciones de decodificación, dado que no son modelos generativos de texto.

## Capacidades

- Detección de fronteras de plano en vídeo mediante TransNetV2, base para la segmentación temporal de corpus audiovisuales.
- Detección de cabezas humanas con YOLO26-large, útil para conteo de personas y análisis de composición visual.
- Anotación automática de risas en pistas de audio mediante red neuronal más clasificador de árboles.
- Integración directa con el toolkit DVT para pipelines de análisis de vídeo a escala.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No ofrece capacidades multilingües ni generación de texto.
- No dispone de modo thinking, visión general, audio general ni otras capacidades fundacionales.

## Casos de uso

- Segmentación de corpus audiovisuales: `detect_shots.pt` permite dividir automáticamente películas, telediarios o archivos filmados en planos, paso previo imprescindible para cualquier análisis cuantitativo de estilo o montaje.
- Análisis de encuadre y composición: el detector de cabezas permite medir la posición y escala de las personas en cada plano, útil en estudios de puesta en escena o de representación.
- Estudios de recepción y humor: el anotador de risas posibilita medir la densidad y distribución temporal de risas en comedia televisiva o grabaciones de público.
- Investigación en humanidades digitales: el conjunto se integra en el DVT para proyectos de "distant viewing" sobre archivos fílmicos o televisivos de gran tamaño.
- Monitorización de audiencias en medios: la combinación de segmentación de planos y detección de cabezas permite caracterizar la presencia humana en emisiones.
- Docencia y reproducibilidad: al centralizar pesos que de otro modo dependen de cuotas LFS, facilita la replicación de experimentos en entornos docentes o de investigación con recursos limitados.
- Construcción de datasets anotados: los tres componentes pueden usarse como etiquetadores automáticos previos a revisión humana en la creación de corpus de vídeo anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el tamaño total del repositorio (0,1 GB) sugiere que los pesos caben holgadamente en cualquier GPU consumer, aunque el consumo en inferencia depende de la resolución y longitud de los clips procesados.
- GPU recomendadas: cualquier GPU con soporte CUDA; para procesar corpus grandes conviene una RTX 3090/4090 o superior por throughput, aunque el modelo puede ejecutarse en GPUs de gama media.
- Cabe en GPU consumer: sí, presumiblemente en cualquier GPU con al menos 4-8 GB de VRAM para los pesos, con margen adicional para los tensores de activación según resolución.
- Opciones de despliegue: el toolkit DVT carga los pesos directamente con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a estos modelos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `distant-viewing/dvt-models` | Pesos auxiliares de vídeo (TransNetV2, YOLO26-large, risa) | no disponible | no aplica | Mixta (MIT + AGPL-3.0) | Hugging Face |
| `soCzech/TransNetV2` | Detección de cortes de plano | no disponible | no aplica | MIT | GitHub |
| Ultralytics YOLO26 | Detección de objetos | no disponible | no aplica | AGPL-3.0 / Enterprise | GitHub, PyPI |

La comparativa se limita a los componentes individuales, ya que no existe un paquete equivalente que agrupe estas tres tareas. TransNetV2 y YOLO26 son los referentes directos de dos de los cuatro ficheros; el anotador de risas es específico del Distant Viewing Lab y no tiene equivalente público identificado en la información disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con métricas tipo MMLU o HumanEval.
- Licencia mixta: `yolo26l_heads.pt` está bajo AGPL-3.0, lo que impone obligaciones de copyleft sobre el código que lo distribuya o lo use en servicios de red; para uso comercial sin esas condiciones es necesario adquirir la licencia Enterprise de Ultralytics.
- Los pesos de TransNetV2 y los ficheros de risa son MIT, pero su uso combinado con el detector YOLO puede arrastrar las obligaciones de la AGPL si se distribuye el conjunto.
- Riesgo de falsos positivos y negativos en la detección de cabezas y de cortes, especialmente en material de baja calidad, animación o planos no convencionales.
- El anotador de risas está entrenado por el laboratorio y no se documentan su dataset, su tasa de acierto ni su generalización a idiomas o géneros distintos del corpus original.
- No se declaran sesgos demográficos ni de representación; el detector de cabezas puede comportarse de forma desigual según iluminación, etnia o ángulo.
- No hay información sobre idiomas soportados ni sobre requisitos de formato de entrada más allá de lo que especifique el toolkit DVT.
- La fecha de creación del repositorio (2026) y la ausencia de descargas o likes hacen recomendable verificar su mantenimiento antes de adoptarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/distant-viewing/dvt-models
- Repositorio del toolkit DVT: https://github.com/distant-viewing/dvt
- TransNetV2 (Souček y Lokoč): https://github.com/soCzech/TransNetV2
- Ultralytics (YOLO): https://github.com/ultralytics/ultralytics
- Artículo de referencia: Arnold, Taylor y Lauren Tilton. "Distant Viewing: Analyzing Large Visual Corpora." *Digital Scholarship in the Humanities*, 2019.
