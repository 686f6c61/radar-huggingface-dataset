# KKYYKK/Panel2Patch

## Resumen

Panel2Patch es un modelo vision-lenguaje de tipo CLIP desarrollado por Kun Yuan y colaboradores (repositorio de Hugging Face mantenido por el usuario KKYYKK), presentado en el articulo "From Panel to Pixel: Zoom-In Vision-Language Pretraining from Biomedical Scientific Literature" (CVPR 2026, arXiv:2512.02566). Se trata de un checkpoint OpenCLIP con arquitectura ViT-L/14, inicializado desde BMC-CLIP, entrenado para clasificacion zero-shot de imagenes biomedicas y figuras cientificas.

El modelo aborda un problema concreto de la literatura cientifica biomedica: las figuras de los articulos contienen informacion visual a varios niveles de granularidad (figura completa, sub-panel y region marcada) que los modelos CLIP genericos no explotan bien. Panel2Patch genera supervision imagen-texto en esos tres niveles sin anotacion humana y preentrena el modelo sobre todos ellos, mejorando la alineacion entre texto e imagen en dominios como radiologia, microscopia o patologia.

El checkpoint liberado corresponde al modelo reportado como "Ours" en la Tabla 3 del paper: ViT-L/14 con la torre de texto congelada y solo los ultimos 5 bloques de imagen entrenables, en la epoca 3 de un schedule coseno de 20 epocas. Es relevante ahora porque ofrece un encoder vision-lenguaje especializado en figuras biomedicas con licencia MIT y pesos abiertos, algo poco habitual en este nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenCLIP ViT-L/14 (vision transformer + torre de texto CLIP) |
| Parametros totales | no disponible (arquitectura ViT-L/14 de OpenCLIP; el paper no desglosa el recuento en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo CLIP; la longitud de texto depende del tokenizer ViT-L-14 de OpenCLIP) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el entrenamiento se basa en literatura cientifica, presumiblemente mayoritariamente en ingles) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoint PyTorch con `state_dict`, `epoch`, `name` y estados del optimizador) |
| Libreria | open_clip |
| Pipeline | zero-shot-image-classification |
| Tamano del repositorio | 3.2 GB |

## Arquitectura y entrenamiento

El modelo es un CLIP con backbone ViT-L/14 de OpenCLIP. Se inicializa desde BMC-CLIP y se entrena con la torre de texto congelada, manteniendo entrenables unicamente los ultimos 5 bloques del encoder de imagen. El checkpoint publicado corresponde a la epoca 3 de un schedule de 20 epocas con decaimiento coseno (run `unlock5_withrawdata`), e incluye los estados del optimizador del entrenamiento.

La innovacion principal es el esquema de supervision multi-nivel: a partir de figuras de literatura biomedica se generan automaticamente tres niveles de pares imagen-texto (figura completa, sub-panel y region marcada), sin anotacion humana, y el modelo se preentrena sobre los tres simultaneamente. Este enfoque de "zoom-in" permite que el encoder capture tanto la semantica global de la figura como detalles finos de regiones concretas. La informacion proporcionada no detalla el volumen de tokens de entrenamiento ni la composicion exacta del dataset, mas alla de que proviene de literatura cientifica biomedica.

## Capacidades

- Clasificacion zero-shot de imagenes: el pipeline principal del modelo, orientado a categorizar figuras e imagenes biomedicas frente a etiquetas textuales.
- Alineacion vision-lenguaje multi-nivel: entrenado para relacionar figuras completas, sub-paneles y regiones marcadas con sus descripciones textuales.
- Recuperacion imagen-texto y text-image en el dominio biomedico (uso implicito de la arquitectura CLIP; no se documenta explicitamente en la model card).
- Especializacion en dominios cientificos: biologia, dermatologia, microscopia, oftalmologia, patologia y radiologia (segun los benchmarks evaluados).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto libre, vision generativa, audio ni modo thinking: es un modelo de representacion y clasificacion, no un LLM generativo.

## Casos de uso

- Clasificacion automatica de figuras en repositorios cientificos: etiquetar figuras de articulos biomedicos por dominio (radiologia, patologia, microscopia) para mejorar la indexacion y busqueda en bases de datos como PubMed Central.
- Filtrado y triaje de literatura: descartar o priorizar figuras relevantes en pipelines de revision sistematica, usando la clasificacion zero-shot frente a categorias predefinidas por el equipo.
- Recuperacion multimodal en bibliotecas cientificas: construir indices de embeddings de figuras y permitir busquedas texto-a-imagen sobre paneles y regiones concretas de articulos.
- Anotacion asistida de datasets biomedicos: usar las predicciones zero-shot como preetiquetado para acelerar la anotacion humana de imagenes medicas y figuras cientificas.
- Analisis de contenido de sub-paneles: aprovechar el entrenamiento a nivel de panel y region para tareas que requieren distinguir detalles finos dentro de una figura compuesta.
- Moderacion y control de calidad editorial: detectar figuras mal etiquetadas o clasificarlas por especialidad en flujos de publicacion cientifica.
- Investigacion en vision-lenguaje biomedico: servir como baseline o punto de partida (inicializacion) para fine-tuning en tareas downstream especificas.

## Benchmarks y rendimiento

Resultados de clasificacion zero-shot (top-1 accuracy, %) de la Tabla 3 del paper, protocolo EVVLM closed VQA con dos estilos de caption agrupados:

| Modelo | Biology | Dermatology | Microscopy | Ophthalmology | Pathology | Radiology | Avg |
|---|---:|---:|---:|---:|---:|---:|---:|
| BMC-CLIP | 34.08 | 65.81 | 50.09 | 36.74 | 41.21 | 59.15 | 47.85 |
| Panel2Patch (paper) | 38.53 | 65.19 | 54.00 | 35.78 | 42.91 | 65.07 | 50.25 |
| Panel2Patch (reevaluado con codigo liberado) | 38.58 | 65.16 | 54.01 | 35.77 | 43.68 | 65.01 | 50.37 |

El modelo mejora a BMC-CLIP en biologia (+4,45 puntos), microscopia (+3,91) y radiologia (+5,92), con un rendimiento ligeramente inferior en dermatologia y oftalmologia. La media sube de 47,85 a 50,25-50,37.

## Requisitos de hardware

- VRAM estimada para inferencia: un ViT-L/14 de OpenCLIP en FP16 ocupa aproximadamente 1,2-1,7 GB de pesos; con overhead de activaciones, cabe holgadamente en 4-6 GB de VRAM. El checkpoint `.pt` completo pesa aproximadamente 3,2 GB porque incluye estados del optimizador, no solo los pesos del modelo.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060/4060, RTX 4090, A100, H100). Para evaluacion a gran escala sobre miles de figuras, se recomienda A100 o H100 por throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 6-8 GB de VRAM.
- Opciones de despliegue: carga directa con `open_clip` en PyTorch (procedimiento documentado en la model card); exportacion a ONNX o TensorRT posible pero no documentada por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo CLIP).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Avg zero-shot (EVVLM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Panel2Patch | OpenCLIP ViT-L/14 | no disponible | no disponible | 50,25-50,37 | MIT | Pesos abiertos en HF |
| BMC-CLIP | CLIP (backbone no especificado) | no disponible | no disponible | 47,85 | no disponible | Referenciado como inicializacion |
| CLIP ViT-L/14 generico (OpenAI/OpenCLIP) | ViT-L/14 | no disponible | no disponible | no evaluado en la tabla del paper | MIT (OpenCLIP) / otras | Ampliamente disponible |

La comparacion directa disponible en el paper se limita a BMC-CLIP, el modelo base desde el que se inicializa Panel2Patch. No se han publicado en la informacion proporcionada comparaciones con otros CLIP biomedicos como BiomedCLIP.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre literatura cientifica biomedica, el modelo hereda los sesgos de representacion de esa fuente (idioma, geografia, especialidades sobrerrepresentadas) y puede rendir peor en dominios poco cubiertos.
- Riesgo de alucinacion: como modelo de clasificacion zero-shot, no genera texto libre, pero puede asignar etiquetas con alta confianza a imagenes fuera de dominio; las predicciones deben validarse en contextos clinicos.
- Limitaciones de contexto e idioma: no se documentan idiomas soportados; el entrenamiento se basa en literatura cientifica, presumiblemente en ingles, lo que puede degradar el rendimiento con textos en castellano u otros idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el uso clinico real requiere validacion regulatoria independiente.
- Caveats para produccion: el checkpoint publicado es de la epoca 3 de 20 (no es el modelo final del schedule), incluye estados del optimizador (mayor tamano de descarga) e ignora modulos de entrenamiento con `strict=False`; conviene verificar la carga con el `assert not missing` documentado. No se documentan cuantizaciones ni optimizaciones de despliegue.
- El modelo no es un LLM: no soporta generacion de texto, tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KKYYKK/Panel2Patch
- Checkpoints de entrenamiento (todas las epocas): https://huggingface.co/KKYYKK/biomedica_fg_models
- Paper (arXiv): https://arxiv.org/abs/2512.02566
- Codigo, indice de datos y evaluacion: https://github.com/Flaick/Panel2Patch
- Script de evaluacion zero-shot: `eval/zeroshot_eval.py` y `eval/table3.py` en el repositorio de GitHub
