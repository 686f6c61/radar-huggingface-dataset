# eoinedge/sam3edge-mini

## Resumen

sam3edge-mini (publicado por eoinedge) es una conversión a ONNX y cuantización a 8 bits del modelo SAM 3 de Meta (facebook/sam3), orientada a ejecución en CPU ARM y NPU Hexagon de placas Qualcomm como la Rubik Pi 3 (QCS6490) o la QCS8300. No entrena pesos nuevos: toma los pesos originales de SAM 3 y los encoders destilados de EfficientSAM3, los exporta a grafos ONNX, los cuantiza y los reempaqueta en dos niveles de calidad (quality tier y fast tier) para que quepan y corran en placas sin GPU.

El modelo resuelve detección y segmentación de instancias guiada por texto ("open-vocabulary"): se le pasa una imagen y una frase nominal corta ("red bus", "person wearing a helmet") y devuelve caja, puntuación y máscara por instancia, con el codificador de texto ejecutándose en la propia placa. El repositorio contiene 524.435.764 parámetros en safetensors y ocupa 3,1 GB, con variantes de 336 px y 672 px para el nivel de calidad y 1008 px para el nivel rápido.

Es relevante porque la mayoría de las 34 conversiones cuantizadas de SAM 3 en Hugging Face son el modelo completo de 848 M de parámetros a 1008 px, pensadas para GPU, móvil o Apple Silicon. sam3edge-mini apunta explícitamente a CPU ARM y NPU Qualcomm, un nicho con pocas alternativas publicadas y con cifras de latencia y memoria medidas en placa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de segmentación (SAM 3) con encoder de imagen EfficientViT-B1 destilado en el nivel rápido; exportado a grafos ONNX |
| Parámetros totales | 524.435.764 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; resolución de entrada 336 px, 672 px o 1008 px según variante) |
| Tipos de cuantización | Pesos de 8 bits (int8) en el encoder de imagen del nivel de calidad; encoder de imagen en float y una variante de punto fijo para NPU Hexagon en el nivel rápido; detector en float |
| Idiomas soportados | no disponible (prompts de texto libre en el codificador de texto) |
| Licencia | sam-license (licencia SAM de Meta, marcada como "other") |
| Formato de pesos | ONNX (grafos), safetensors y .pt (pesos que PyTorch sigue usando) |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento: los pesos proceden de facebook/sam3 y de los encoders destilados de EfficientSAM3, convertidos a grafos ONNX, cuantizados y reempaquetados. Se ofrecen dos niveles. El quality tier (sam3-litetext) usa el encoder de imagen propio de SAM 3 con pesos de 8 bits, a 336 px o 672 px, y mantiene en PyTorch el codificador de texto, el codificador de prompts y la cabeza de máscaras (sam3-litetext-light.pt). El fast tier (efficientvit-m) usa un encoder de imagen EfficientViT-B1 destilado a 1008 px sobre una rejilla de 36 x 36 tokens, con encoder en float y una variante de punto fijo que puede ejecutarse en la NPU Hexagon; sus pesos restantes están en efficientvit-m-light.pt.

Los grafos del quality tier se publican como sam3-litetext-r336-g24-* y sam3-litetext-r672-g48-*, y los del fast tier como efficientvit-m-r1008-g36-*. No se documentan en la información disponible los datos de entrenamiento originales, el número de tokens, la composición del dataset ni si hubo RLHF o DPO; esos detalles corresponden a la model card de facebook/sam3, no a esta conversión.

## Capacidades

- Detección de instancias guiada por texto (open-vocabulary): acepta frases nominales libres y devuelve caja, puntuación y máscara por instancia.
- Segmentación de instancias con máscaras por objeto, no solo cajas delimitadoras.
- Detección zero-shot sin lista fija de conceptos: el codificador de texto se ejecuta en la propia placa.
- Procesamiento de múltiples conceptos por imagen: tras el primer concepto, cada concepto adicional cuesta 0,15 s (336 px) o 0,68 s (672 px) en CPU de portátil.
- Procesamiento fotograma a fotograma de vídeo, sin tracker incorporado: cada fotograma se responde de forma independiente.
- Ejecución en CPU ARM y en NPU Hexagon (variante de punto fijo del encoder del fast tier).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de visión, no un LLM.

## Casos de uso

- Inspección visual en placa sin GPU: desplegar sam3edge-mini en una Rubik Pi 3 (QCS6490) o QCS8300 para detectar y segmentar objetos descritos por texto en tiempo casi interactivo, con 0,74 s para el primer concepto en el fast tier.
- Vigilancia y conteo en vídeo: procesar fotogramas de una cámara IP en la propia placa con prompts como "persona" o "vehículo", aceptando que el conteo varía entre fotogramas al no haber tracker.
- Control de calidad industrial: inspeccionar piezas o productos con prompts ad hoc ("tornillo suelto", "etiqueta rasgada") sin reentrenar, aprovechando el vocabulario abierto.
- Análisis de imágenes médicas o científicas asistido: segmentar regiones descritas por texto en entornos con CPU y sin acelerador, usando el quality tier a 672 px para mayor precisión (F1 0,70 frente a 0,73 del SAM 3 completo).
- Automatización de inventario o logística: detectar y contar bultos, cajas o palés en imágenes capturadas por dispositivos de bajo consumo, con memoria pico de 1,2-2,3 GB.
- Prototipado rápido en el borde: validar pipelines de segmentación guiada por texto en hardware ARM antes de escalar a GPU, gracias a los grafos ONNX y a ONNX Runtime.
- Anotación asistida de datasets: generar máscaras iniciales por concepto sobre lotes de imágenes en CPU, reduciendo el trabajo manual de etiquetado.

## Benchmarks y rendimiento

Datos medidos por el autor en CPU de portátil con ONNX Runtime (2026-11-19), comparando con el SAM 3 completo cuantizado a 8 bits a 1008 px (tepirale/sam3-ONNX) sobre la misma muestra de 60 imágenes COCO:

| Modelo / variante | Ficheros | Primer concepto | Cada concepto adicional | Memoria pico | F1 en muestra COCO |
|---|---|---|---|---|---|
| SAM 3 completo, 8 bits, 1008 px | 1,06 GB | 18,5 s | 2,73 s | 6,4 GB | 0,73 |
| Quality tier, 672 px | 0,88 GB | 7,65 s | 0,68 s | 2,3 GB | 0,70 |
| Quality tier, 336 px | 0,88 GB | 1,80 s | 0,15 s | 1,4 GB | 0,41 |
| Fast tier, 1008 px / rejilla 36 | 0,48 GB | 0,74 s | 0,32 s | 1,2 GB | 0,42 (umbral 0,3) |

El quality tier a 672 px es 2,4 veces más rápido que el SAM 3 completo con un 36 % de la memoria, a costa de 0,03 de F1: misma precisión (0,68 frente a 0,67) y menor recall (0,72 frente a 0,80) por ver la imagen a menor resolución. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM/RAM estimada: 1,2 GB de memoria pico para el fast tier, 1,4 GB para el quality tier a 336 px y 2,3 GB para el quality tier a 672 px (mediciones en CPU de portátil).
- GPU recomendadas: no aplica; el modelo está diseñado para CPU ARM y NPU Hexagon. El autor indica que no usa GPU y que otras conversiones son mucho más rápidas en GPU.
- Cabe en placas consumer de borde: Rubik Pi 3 (Qualcomm QCS6490) y QCS8300, con 4 GB o más de RAM; para placas de 4 GB existe una variante más restringida (eoinedge/sam3micro) sin PyTorch, con lista fija de conceptos y solo cajas.
- Opciones de despliegue: ONNX Runtime (backend principal), PyTorch en CPU para los pesos ligeros (text encoder, prompt encoder, mask head), y NPU Hexagon mediante la variante de punto fijo del encoder del fast tier.
- Latencia y throughput: 0,74 s para el primer concepto en el fast tier; 1,80 s a 336 px y 7,65 s a 672 px en el quality tier (CPU de portátil). En vídeo, el quality tier a 336 px procesa un fotograma de 1280 x 720 en 1,8 s por fotograma en CPU de portátil.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sam3edge-mini (quality tier 672 px) | 524 M | 672 px | no disponible | F1 0,70; 7,65 s primer concepto; 2,3 GB | sam-license | Hugging Face (ONNX) |
| SAM 3 completo cuantizado 8 bits (tepirale/sam3-ONNX y similares) | 848 M | 1008 px | no disponible | F1 0,73; 18,5 s primer concepto; 6,4 GB | sam-license | Hugging Face |
| eoinedge/sam3micro | no disponible | no disponible | no disponible | no disponible | sam-license | Hugging Face (para placas de 4 GB, sin PyTorch, solo cajas) |
| EfficientSAM3 (encoders destilados) | no disponible | no disponible | no disponible | no disponible | no disponible | GitHub |

Hugging Face lista 34 conversiones cuantizadas de facebook/sam3; todas son el modelo completo de 848 M de parámetros, casi todas a 1008 px y orientadas a GPU, móvil o Apple Silicon. Ninguna de las fichas revisadas por el autor reporta tiempos en CPU de placa ARM ni ejecución en NPU Qualcomm.

## Limitaciones y advertencias

- El quality tier a 672 px tiene menor recall que el SAM 3 completo (0,72 frente a 0,80) por procesar la imagen a menor resolución; el modelo completo es más preciso.
- El fast tier comete errores documentados: falla al detectar el camión y duda con las bolsas en las imágenes de prueba de SAM 3, y responde "persona" sobre el autobús y los coches en imágenes COCO.
- El quality tier a 336 px baja a F1 0,41 en la muestra COCO, muy por debajo del 0,70 a 672 px.
- No hay tracker: en vídeo cada fotograma se responde de forma independiente, el conteo cambia entre fotogramas y no se mantiene la identidad de los objetos.
- El código del repositorio (github.com/eoinjordan/sam3-edge) es privado en el momento de la publicación, por lo que los comandos de uso requieren acceso; solo sam3micro funciona de forma autónoma desde su propio repositorio.
- La licencia sam-license (licencia SAM de Meta) impone restricciones que deben revisarse antes de cualquier uso comercial; la ficha la marca como "other".
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática del codificador de texto en la información disponible.
- El modelo no es un LLM: no soporta tool calling, agentes ni razonamiento multi-paso.
- Las mediciones de rendimiento proceden de una CPU de portátil y de una muestra de 60 imágenes COCO; el rendimiento en placa ARM o NPU Hexagon no se cuantifica en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eoinedge/sam3edge-mini
- Variante para placas de 4 GB: https://huggingface.co/eoinedge/sam3micro
- Repositorio de código (privado en el momento de la publicación): https://github.com/eoinjordan/sam3-edge
- EfficientSAM3 (encoders destilados): https://github.com/SimonZeng7108/efficientsam3
- Modelo base: https://huggingface.co/facebook/sam3
