# shreshthsaini/brightrate-study-qwen3vl-8b-sdr

## Resumen

El modelo `shreshthsaini/brightrate-study-qwen3vl-8b-sdr` es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, centrado en la evaluación de calidad perceptual de vídeo HDR generado por usuarios (UGC). Se basa en el modelo multimodal Qwen3-VL-8B-Instruct y está diseñado para predecir una puntuación de calidad sin referencia (NR-IQA) a partir de ocho fotogramas HDR tonemapeados a SDR, procesados en orden temporal. El adaptador se entrenó sobre el conjunto de datos BrightVQ, con una receta específica que incluye dos épocas, tasa de aprendizaje 1e-4 y LoRA de rango 16.

La relevancia de este modelo radica en abordar un problema poco explorado: la evaluación automática de calidad de vídeo HDR en entornos UGC, donde coexisten distorsiones típicas de contenido generado por usuarios con artefactos específicos de HDR. Al ser un adaptador ligero (0.2 GB), puede integrarse sobre el modelo base Qwen3-VL-8B-Instruct sin necesidad de reentrenar toda la arquitectura, lo que facilita su uso en investigación y aplicaciones prácticas de control de calidad. El modelo reporta métricas sólidas en el conjunto de prueba de BrightVQ, con SROCC 0.8586 y PLCC 0.8729.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-8B-Instruct (vision-language transformer) |
| Parametros totales | 8B (modelo base) + adaptador LoRA (parametros no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (modelo base, segun el paper de Qwen3-VL) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estandar) |
| Idiomas soportados | No disponible (el modelo base Qwen3-VL soporta multiples idiomas, pero el adaptador no especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-VL-8B-Instruct, un modelo de lenguaje y visión de 8 mil millones de parametros con arquitectura transformer y soporte nativo para contextos intercalados de texto, imagen y vídeo de hasta 256K tokens. El adaptador LoRA de rango 16 (alpha 32, dropout 0.05) se entrena para transformar las representaciones del modelo base en una puntuacion de calidad MOS (Mean Opinion Score) interpolada a partir de cinco niveles de calidad verbal.

El entrenamiento se realiza sobre el conjunto de datos BrightVQ, concretamente en la particion 0 separada por contenido, con 420 vídeos en el conjunto de prueba. La receta incluye dos épocas, un horizonte de programacion coseno de tres épocas, tasa de aprendizaje 1e-4, micro-batch de 1 y acumulacion de gradientes de 8. La entrada consiste en ocho fotogramas HDR muestreados uniformemente, tonemapeados a un proxy SDR y pasados en orden temporal. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado con etiquetas MOS.

## Capacidades

- Evaluacion de calidad perceptual de vídeo HDR sin referencia (NR-IQA): el modelo predice una puntuacion de calidad (MOS) a partir de una secuencia de fotogramas.
- Procesamiento multimodal: al basarse en Qwen3-VL, hereda la capacidad de comprender imagenes y vídeo, aunque el adaptador esta especializado en la tarea de regresion de calidad.
- Soporte de contexto largo: el modelo base maneja hasta 256K tokens, lo que permite procesar secuencias de vídeo extensas si se adapta la entrada.
- No es un modelo generativo: su salida es una puntuacion numerica, no texto ni imagenes.
- No se reportan capacidades de tool calling, agentes ni razonamiento multi-paso en el adaptador; estas dependen del modelo base, pero el adaptador no las modifica.

## Casos de uso

- Control de calidad en plataformas de vídeo UGC: el modelo puede integrarse en pipelines de subida de vídeo para detectar automaticamente problemas de calidad HDR (por ejemplo, exposicion incorrecta, artefactos de tonemapping) y priorizar la revision humana.
- Evaluacion de codecs y pipelines de procesamiento: comparar la calidad percibida de vídeos HDR codificados con diferentes codecs o ajustes de tonemapping, usando el modelo como metrica objetiva alineada con la percepcion humana.
- Monitorizacion de calidad en streaming: desplegar el adaptador en servidores para evaluar en tiempo real la calidad de vídeos HDR entregados a usuarios, ayudando a ajustar la tasa de bits o la resolucion.
- Investigacion en calidad de vídeo: servir como herramienta de anotacion automatica para crear conjuntos de datos etiquetados con MOS, reduciendo el coste de estudios subjetivos.
- Desarrollo de algoritmos de mejora de vídeo: utilizar las puntuaciones del modelo como funcion de perdida o criterio de optimizacion en tecnicas de superresolucion o restauracion de vídeo HDR.
- Benchmarking de modelos de calidad: comparar el rendimiento de este adaptador con otros metodos NR-IQA en el dominio HDR, como parte de estudios academicos.

## Benchmarks y rendimiento

El adaptador reporta las siguientes metricas en el conjunto de prueba de BrightVQ (particion 0, 420 vídeos):

| Metrica | Valor |
|---|---|
| SROCC (Spearman) | 0.8586 |
| PLCC (Pearson) | 0.8729 |
| KRCC (Kendall) | 0.6748 |
| RMSE | 6.6399 |

No se proporcionan comparaciones con otros modelos en la informacion disponible. Estas metricas indican una correlacion alta entre las predicciones del modelo y las puntuaciones humanas, aunque el RMSE sugiere un error absoluto considerable, posiblemente debido a la escala de MOS utilizada.

## Requisitos de hardware

- El adaptador en si es muy ligero (0.2 GB) y puede cargarse en cualquier GPU con suficiente memoria para el modelo base.
- El modelo base Qwen3-VL-8B-Instruct requiere aproximadamente 16 GB de VRAM en FP16 para inferencia. Con cuantizacion a 8 bits (por ejemplo, bitsandbytes) se reduce a unos 8-10 GB; en 4 bits, alrededor de 5-6 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para FP16 sin cuantizar. En consumer, una RTX 3060 de 12 GB puede ejecutar el modelo cuantizado a 4 bits.
- Opciones de despliegue: el adaptador PEFT se puede cargar con la libreria `peft` y `transformers`; para inferencia en produccion, se puede usar vLLM o TGI con soporte de adaptadores LoRA. Para despliegue local, llama.cpp u Ollama no son adecuados porque el modelo base es multimodal y requiere el pipeline de vision.
- Latencia y throughput: no se proporcionan datos especificos. En una GPU A100, el modelo base procesa aproximadamente 20-30 tokens/segundo en generacion, pero para esta tarea la entrada es fija (8 imagenes) y la salida es una unica puntuacion, por lo que la latencia dominante es el procesamiento de las imagenes.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma tarea (evaluacion de calidad de vídeo HDR con adaptadores sobre VLM). Existen metodos tradicionales de calidad de vídeo como VMAF o NIQE, pero no son directamente comparables por su naturaleza. El modelo base Qwen3-VL-8B-Instruct se puede comparar con otros VLM de tamano similar (por ejemplo, LLaVA-NeXT-8B, InternVL2-8B), pero el adaptador no altera las capacidades generativas del base. Por tanto, la comparativa directa no esta disponible.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente sobre el conjunto BrightVQ y no esta calibrado para otros datasets, pipelines de visualizacion o dominios de vídeo. Su uso fuera de este ambito puede producir puntuaciones poco fiables.
- Las metricas reportadas corresponden a una particion especifica (split 0) y pueden no generalizar a otras particiones o a datos del mundo real.
- El modelo no es un evaluador de calidad universal; esta disenado para vídeo HDR UGC, no para contenido profesional o SDR.
- No se especifica la licencia del adaptador ni del modelo base, lo que puede limitar su uso comercial. Se recomienda verificar los terminos de Qwen3-VL antes de cualquier despliegue.
- El adaptador no incluye capacidades de explicabilidad: no proporciona razones sobre por que asigna una determinada puntuacion, lo que puede ser un inconveniente en aplicaciones criticas.
- Al ser un adaptador de investigacion, no se garantiza soporte ni mantenimiento a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-qwen3vl-8b-sdr
- Conjunto de datos BrightVQ: https://github.com/shreshthsaini/BrightVQ
- Codigo y construccion de entrada (BrightRate-LM): https://github.com/shreshthsaini/BrightRate-LM
- Paper de Qwen3-VL (arXiv): https://arxiv.org/abs/2511.21631
- Pagina personal del autor: https://shreshthsaini.github.io/
- Referencia al articulo BrightRate-LM (enviado a Machine Vision and Applications): citado en la model card.
