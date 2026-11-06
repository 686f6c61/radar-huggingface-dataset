# pulkitbuilds007/Video_Face_swapping

## Resumen

Face Swap Pro es un pipeline de intercambio de caras en vídeo publicado en Hugging Face por el usuario pulkitbuilds007 bajo el identificador `pulkitbuilds007/Video_Face_swapping`. No se trata de un modelo generativo entrenado desde cero, sino de una composición de varios modelos preexistentes encadenados: el modelo de intercambio facial inswapper_128, el enhancer GFPGAN 1.4 a 512 píxeles, la máscara de oclusión XSeg, el parser facial BiSeNet, igualación de color en espacio LAB y una mezcla con difuminado en los bordes (feathered blend). El resultado es un sistema video-to-video que sustituye la cara de una persona en un vídeo por la de otra a partir de una imagen de referencia.

El repositorio tiene un carácter marcadamente experimental: cero descargas, un único "like" y una model card muy breve que se limita a describir la cadena de componentes y a advertir sobre las licencias de las piezas de terceros. No se publican pesos propios, arquitectura entrenada, número de parámetros ni resultados de benchmarks. La fecha de creación indicada (noviembre de 2026) resulta anómala y no permite extraer conclusiones sobre su madurez o mantenimiento.

Su relevancia actual es limitada pero ilustrativa: sirve como ejemplo de cómo se ensamblan herramientas de código abierto de visión por computador (ONNX Runtime, InsightFace, GFPGAN) para construir pipelines de edición facial, y como recordatorio de las obligaciones legales y éticas asociadas al deepfake. La licencia declarada es MIT para el conjunto, aunque el propio autor advierte de que varios de los componentes internos tienen restricciones de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de visión por computador: inswapper_128 (intercambio facial) + GFPGAN 1.4 (restauración) + XSeg (máscara de oclusión) + BiSeNet (parsing facial) + igualación LAB + feathered blend |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible (los componentes ONNX se ejecutan en precisión nativa; el autor no documenta variantes) |
| Idiomas soportados | en (según metadatos; el pipeline en sí no procesa lenguaje) |
| Licencia | MIT (declarada para el conjunto; los componentes internos tienen licencias propias, ver advertencias) |
| Formato de pesos | no disponible (los componentes se cargan como modelos ONNX y checkpoints de GFPGAN; el repositorio no detalla los ficheros) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio. La arquitectura es una cadena de inferencia sobre modelos de terceros: inswapper_128 realiza la sustitución de identidad facial sobre la región detectada; GFPGAN 1.4 restaura y mejora la cara resultante a 512 píxeles; XSeg genera una máscara de oclusión para evitar artefactos en zonas tapadas (manos, pelo, gafas); BiSeNet aporta parsing semántico de la cara para delimitar regiones; y el postprocesado aplica igualación de color en espacio LAB y una mezcla con bordes difuminados para integrar la cara sintética en el fotograma original.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO, porque el autor no entrena modelos. La innovación técnica, si puede llamarse así, reside en el ensamblaje del pipeline y en el orden de las etapas de postprocesado (máscara, parsing, color, blend), no en un avance algorítmico propio. El autor menciona el uso de ONNX Runtime con soporte CUDA/cuDNN para GPU, lo que sugiere despliegue sobre modelos exportados a ONNX.

## Capacidades

- Intercambio de caras en vídeo (video-to-video) a partir de una imagen de referencia de la identidad objetivo.
- Restauración y mejora de la cara intercambiada mediante GFPGAN 1.4 a 512 píxeles.
- Gestión de oclusiones parciales mediante máscara XSeg, lo que reduce artefactos cuando hay objetos o pelo delante de la cara.
- Parsing facial con BiSeNet para delimitar regiones de la cara y mejorar la integración.
- Igualación de color en espacio LAB para adaptar el tono de la cara sintética al del fotograma.
- Mezcla con bordes difuminados (feathered blend) para suavizar la transición entre cara y fondo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un pipeline puramente visual.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo "thinking", visión general, audio ni otras capacidades más allá del intercambio facial.

## Casos de uso

- Producción audiovisual y doblaje: sustituir la cara de un actor por la de un doble en escenas concretas, usando la imagen de referencia del actor principal y clips cortos para controlar el coste computacional en GPU T4.
- Prototipado de efectos especiales: generar versiones preliminares de una escena con una identidad distinta antes de rodar, aprovechando la restauración a 512 píxeles de GFPGAN para evaluar la viabilidad visual.
- Investigación en deepfakes y detección: crear muestras sintéticas etiquetadas como tales para entrenar o evaluar detectores de manipulación facial, siempre con consentimiento de las personas implicadas.
- Anonimización controlada en vídeo: sustituir caras de sujetos por identidades ficticias en material de investigación o docencia, con la advertencia de que el pipeline no está diseñado específicamente para privacidad y puede dejar artefactos.
- Demostraciones educativas sobre ética de la IA: ilustrar en talleres cómo se construyen y encadenan herramientas de síntesis facial y qué salvaguardas legales aplican.
- Pruebas de integración de pipelines ONNX en producción: validar el despliegue de ONNX Runtime con CUDA/cuDNN en entornos con GPU T4, midiendo latencia y throughput con clips cortos antes de escalar.
- Restauración de material de archivo con caras degradadas: combinar el intercambio con GFPGAN para mejorar la nitidez facial en grabaciones antiguas de baja resolución, siempre que exista consentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de calidad (FID, SSIM, identidad), latencia, throughput ni comparaciones cuantitativas con otros pipelines de face swapping.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica cifras; por la naturaleza del pipeline (inswapper_128, GFPGAN a 512 px, XSeg, BiSeNet) es razonable esperar un consumo moderado, pero no se confirma.
- GPU recomendadas: el autor menciona explícitamente una T4 como ejemplo de GPU para acelerar el proceso. No se detallan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el pipeline usa ONNX Runtime con CUDA/cuDNN, por lo que en principio podría ejecutarse en GPUs consumer compatibles, pero no hay datos de rendimiento.
- CPU: funciona, pero el autor advierte de que es "muy lento" y recomienda cambiar `onnxruntime-gpu[cuda,cudnn]` por `onnxruntime` en `requirements.txt` si se usa CPU.
- Opciones de despliegue: Hugging Face Spaces con GPU (por ejemplo T4) seleccionable en Settings; ONNX Runtime (GPU o CPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Latencia y throughput: no disponibles. El autor solo indica que en CPU es muy lento y recomienda clips cortos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros pipelines de face swapping (por ejemplo, Roop, FaceFusion o InsightFace Swapper) ni datos que permitan establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencias de componentes: el autor advierte de que inswapper_128, buffalo_l y GFPGAN 1.4 son, según su conocimiento, para uso exclusivo en investigación no comercial. La licencia MIT declarada para el repositorio no cubre necesariamente esos componentes; hay que verificar cada licencia antes de cualquier uso comercial.
- Consentimiento: solo deben usarse fotos y vídeos de personas que hayan dado su consentimiento explícito.
- Etiquetado: el autor recomienda etiquetar cualquier salida compartida como sintética.
- Riesgo de deepfake y suplantación de identidad: la herramienta puede emplearse para crear contenido engañoso; su uso está sujeto a normativa como el AI Act europeo y las leyes de protección de imagen.
- Artefactos visuales: el pipeline depende de máscaras y parsing; es probable que aparezcan inconsistencias en oclusiones complejas, cambios de iluminación bruscos o movimientos rápidos, aunque no se documentan tasas de error.
- Sin benchmarks ni métricas de calidad publicadas: no hay evidencia cuantitativa de fidelidad de identidad, realismo ni estabilidad temporal.
- Sin soporte de idiomas ni de texto: el metadato "en" es meramente administrativo; el pipeline no procesa lenguaje.
- Madurez y mantenimiento inciertos: cero descargas, un único "like" y una fecha de creación anómala (noviembre de 2026) sugieren un proyecto experimental sin validación comunitaria.
- Rendimiento en CPU muy limitado: el autor lo califica explícitamente de "muy lento" y recomienda GPU y clips cortos.

## Enlaces

- Hugging Face: https://huggingface.co/pulkitbuilds007/Video_Face_swapping
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
