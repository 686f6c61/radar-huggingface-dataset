# agriggio/smart-onnx-models

## Resumen

`agriggio/smart-onnx-models` no es un modelo de lenguaje, sino un repositorio de modelos ONNX empaquetados para su uso por SMART, un asistente de IA para el editor de fotografia ART. El repositorio contiene dos familias de modelos de vision: los image models de SAM 2.1 (Meta, licencia Apache-2.0) para segmentacion y enmascarado asistido, y el modelo LaMa (big-lama) para inpainting o "healing" de imagenes. Todos los pesos estan exportados a ONNX y se ejecutan exclusivamente con `onnxruntime`, sin necesidad de PyTorch en tiempo de inferencia.

La relevancia practica del repositorio reside en su caracter de distribucion lista para produccion: incluye los cuatro tamanos de SAM 2.1 (tiny, small, base_plus, large) separados en encoder y decoder, con la salida de mascara unica de SAM 2 (`multimask_output=False`) y un fallback basado en estabilidad. Ademas, el modelo LaMa ha sido reescrito a nivel de operadores para que el proveedor CoreML de onnxruntime pueda ejecutarlo en GPU, manteniendo resultados equivalentes al original (diferencia maxima aproximada de 1e-5).

El repositorio esta pensado para integrarse en flujos de edicion fotografica de escritorio: enmascarado por clic o caja, refinamiento iterativo de mascaras y eliminacion de objetos con relleno coherente. Su licencia Apache-2.0 permite uso comercial, aunque el autor no publica idiomas soportados ni pipeline estandar de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 (encoder jerarquico + prompt encoder y mask decoder) y LaMa (red generativa de inpainting) |
| Parametros totales | no disponible (cuatro variantes de SAM 2.1 y big-lama; el autor no detalla recuentos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision; entrada de imagen 1024x1024 en SAM 2.1) |
| Tipos de cuantizacion | no disponible (pesos ONNX sin cuantizacion declarada) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime; proveedores CPU, CUDA y CoreML) |

## Arquitectura y entrenamiento

SAM 2.1 es la version de imagen del modelo Segment Anything 2 de Meta. El repositorio separa cada tamano en dos grafos: un encoder que recibe la imagen RGB normalizada con media y desviacion estandar de ImageNet, reescalada a 1024x1024, y produce tres mapas de caracteristicas (`high_res_feats_0` [1,32,256,256], `high_res_feats_1` [1,64,128,128] e `image_embed` [1,256,64,64]); y un decoder que integra el prompt encoder y el mask decoder de SAM 2, con entradas de coordenadas de punto, etiquetas de punto (primer plano, fondo o esquinas de caja), mascara previa y flag de presencia de mascara. La salida son logits de baja resolucion [1,1,256,256] y una prediccion de IoU. El encoder se ejecuta una vez por imagen y el decoder puede invocarse repetidamente para refinar la mascara realimentando `low_res_masks` como `mask_input`.

La conversion se realizo con `tools/export_sam2_onnx.py`, derivado de samexporter, y el autor verifica la equivalencia frente a `SAM2ImagePredictor` de PyTorch con un IoU de mascara mayor o igual a 0.99998 sobre secuencias aleatorias de clics con refinamiento, para los cuatro tamanos. El modelo LaMa se basa en big-lama (Apache-2.0), partiendo de la exportacion ONNX de greycard, y ha sido modificado a nivel de operadores (`Gather` a `Slice` mas `Squeeze`, `Neg` a `Mul`, y `ConvTranspose` con `output_padding` a `ConvTranspose` mas `Slice`) para que el proveedor CoreML pueda ejecutarlo en GPU. La diferencia maxima respecto al original es de aproximadamente 1e-5 y funciona con todos los proveedores. No se detallan en la informacion disponible los datos de entrenamiento, el numero de tokens ni procesos de RLHF o DPO, ya que se trata de modelos de vision preentrenados por terceros.

## Capacidades

- Segmentacion de imagenes interactiva con SAM 2.1: mascaras a partir de clics positivos y negativos y de cajas delimitadoras.
- Refinamiento iterativo de mascaras realimentando la mascara de baja resolucion como entrada.
- Prediccion de calidad de mascara mediante `iou_predictions`.
- Cuatro niveles de capacidad y coste: tiny, small, base_plus y large.
- Inpainting o healing de imagenes con big-lama: relleno de regiones enmascaradas con contenido coherente.
- Ejecucion sin PyTorch, unicamente con onnxruntime.
- Compatibilidad con proveedores de ejecucion CPU, CUDA y CoreML (GPU en macOS).
- No soporta tool calling, agentes, texto, vision multimodal ni audio: son modelos puros de vision.

## Casos de uso

- Enmascarado asistido en editores de fotografia: el usuario hace clic sobre un sujeto y el decoder de SAM 2.1 genera la mascara; el encoder se ejecuta una sola vez por imagen, por lo que los clics sucesivos son baratos.
- Recorte y seleccion de sujetos para composicion: usar cajas delimitadoras como prompt (etiquetas 2 y 3) para aislar objetos y aplicar ajustes locales en el editor ART.
- Eliminacion de objetos no deseados: combinar una mascara generada por SAM 2.1 con big-lama para rellenar la region eliminada de forma coherente con el entorno.
- Retoque de retratos: segmentar piel, cabello o fondo y aplicar correcciones localizadas sin mascaras manuales.
- Restauracion de fotografias: eliminar manchas, arañazos o elementos intrusos mediante inpainting con LaMa y mascaras dibujadas a mano.
- Procesado por lotes en escritorio: al ejecutarse solo con onnxruntime y disponer de variantes tiny y small, es viable integrarlo en aplicaciones de escritorio con recursos limitados.
- Integracion en pipelines de edicion RAW: el repositorio forma parte del flujo de SMART para ART, que combina enmascarado, healing y reduccion de ruido en raw.

## Benchmarks y rendimiento

El autor solo publica una metrica de equivalencia: IoU de mascara mayor o igual a 0.99998 frente a `SAM2ImagePredictor` de PyTorch en secuencias aleatorias de clics con refinamiento, para los cuatro tamanos. Para LaMa se reporta una diferencia maxima de aproximadamente 1e-5 respecto al modelo original. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende del tamano de SAM 2.1 elegido y de la resolucion de imagen. El encoder procesa 1024x1024 y el decoder opera sobre mapas de 256x256 y 64x64.
- GPU recomendadas: no especificadas por el autor. Al ejecutarse con onnxruntime, admite proveedores CUDA (GPU NVIDIA) y CoreML (GPU de Apple).
- Cabe en GPU de consumo: previsiblemente si, especialmente las variantes tiny y small, aunque el autor no publica cifras de memoria.
- Opciones de despliegue: onnxruntime con proveedores CPU, CUDA o CoreML; no requiere PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Variantes | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| agriggio/smart-onnx-models (SAM 2.1 + LaMa) | Segmentacion e inpainting | tiny, small, base_plus, large + big-lama | Imagen 1024x1024 (SAM 2.1); H y W multiplos de 8 (LaMa) | Apache-2.0 | ONNX | Sin PyTorch; verificado frente a PyTorch con IoU >= 0.99998 |
| facebookresearch/sam2 (original) | Segmentacion | tiny, small, base_plus, large | Imagen | Apache-2.0 | PyTorch | Requiere PyTorch; referencia de equivalencia |
| advimman/lama (original) | Inpainting | big-lama | Imagen con mascara | Apache-2.0 | PyTorch | Referencia del modelo de healing |
| jessolmstead/greycard-lama | Inpainting | big-lama | Imagen con mascara | Apache-2.0 | ONNX | Exportacion ONNX de partida para la version CoreML de este repositorio |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- La segmentacion depende de la calidad del prompt; los clics ambiguos pueden producir mascaras incorrectas, aunque el refinamiento iterativo mitiga el problema.
- LaMa puede generar contenido visualmente plausible pero incorrecto en regiones grandes o con texturas complejas; riesgo de artefactos en inpainting extenso.
- Las dimensiones de entrada de LaMa deben ser multiplos de 8; para CoreML es necesario fijar tamanos por sesion con overrides de dimensiones libres.
- No se publican datos sobre sesgos, idiomas ni limitaciones especificas de dominio.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los modelos originales (SAM 2.1 y LaMa) y de la exportacion intermedia de greycard.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su adopcion y mantenimiento comunitario son limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agriggio/smart-onnx-models
- SMART (asistente de IA para ART): https://github.com/artraweditor/SMART
- ART (editor RAW): https://artraweditor.github.io/
- onnxruntime: https://onnxruntime.ai/
- SAM 2.1 (Meta): https://github.com/facebookresearch/sam2
- samexporter: https://github.com/vietanhdev/samexporter
- LaMa: https://github.com/advimman/lama
- Exportacion ONNX de greycard para LaMa: https://huggingface.co/jessolmstead/greycard-lama
