# eoinedge/sam3edge-micro

## Resumen

sam3edge-micro es una adaptación cuantizada y recortada de SAM 3 (Segment Anything Model 3) de Meta, empaquetada por el usuario eoinedge para ejecutarse en placas ARM de 4 GB sin PyTorch. El modelo conserva el detector guiado por texto de SAM 3, pero elimina el codificador de texto y las capacidades de segmentación: el resultado es un detector de cajas delimitadoras que trabaja con una lista fija de 104 conceptos (las 80 categorías de COCO más términos de calle y obra) y una sola imagen por inferencia. Con 42,4 millones de parámetros y un paquete de pesos de 182 MB en su variante más ligera, está pensado para visión en el borde, no para servidores.

La propuesta de valor es la huella: el bundle `fast-672` ocupa 0,44 GB de memoria y responde al primer concepto en 0,30 s en CPU de portátil, frente a los 18,5 s y 6,4 GB del SAM 3 completo cuantizado a 8 bits. El precio es la precisión: un F1 de 0,29 sobre una muestra de 60 imágenes COCO, frente a 0,73 del modelo completo. No es un sustituto de SAM 3; es una alternativa cuando el hardware no permite otra cosa.

El proyecto no entrena pesos: parte de los pesos de SAM 3 y de los codificadores destilados de EfficientSAM3, los convierte a ONNX con cuantización int8 y los reempaqueta. La licencia es la SAM License de Meta, no una licencia open source estándar, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector transformer con codificador de imagen (EfficientViT-B1 destilado o codificador SAM 3) y decodificador de cajas guiado por concepto; exportado a ONNX |
| Parámetros totales | 42.373.988 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (una imagen por inferencia; sin ventana de texto) |
| Tipos de cuantización | INT8 (pesos de 8 bits); grafo de punto fijo adicional para NPU Hexagon |
| Idiomas soportados | No disponible (los conceptos de la lista fija están en inglés) |
| Licencia | SAM License (`sam-license`, licencia "other") |
| Formato de pesos | ONNX (`.onnx`), safetensors en el repo; sin PyTorch |
| Resolución de entrada | 672 px (fast-672), 1008 px (fast-1008), 336 px (quality-336) |
| Tokens de imagen | 24×24 (672 px), 36×36 (1008 px) |
| Conceptos soportados | 104 fijos (80 COCO + términos de calle y obra) |
| Salida | Cajas `box_xyxy` y puntuación por instancia; sin máscaras |
| Tamaño del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento. La arquitectura subyacente es la de SAM 3: un codificador de imagen que produce una rejilla de tokens y un decodificador que, condicionado por una representación del concepto, emite cajas y puntuaciones por instancia. En sam3edge-micro el codificador de texto se ha eliminado del paquete: los embeddings de los 104 conceptos se calculan en el PC que exporta el bundle y se congelan dentro del grafo. Por eso el modelo no acepta texto libre y solo reconoce los conceptos de `micro.json`.

Hay tres bundles. Dos usan el codificador EfficientViT-B1 destilado de EfficientSAM3 (182 MB): `fast-672` a 672 px con 24×24 tokens y `fast-1008` a 1008 px con 36×36 tokens. El tercero, `quality-336`, usa el codificador de imagen original de SAM 3 con pesos de 8 bits a 336 px y ocupa 543 MB. Los dos bundles rápidos incluyen además un grafo de imagen en punto fijo para ejecutarse en la NPU Hexagon de la placa Rubik Pi 3 (Qualcomm QCS6490) mediante `onnxruntime-qnn`. No se documentan en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque el autor no entrena: hereda los pesos de SAM 3 y de EfficientSAM3.

## Capacidades

- Detección de objetos guiada por concepto sobre una lista fija de 104 etiquetas, devolviendo caja y puntuación por instancia.
- Procesamiento de una imagen por llamada; sin vídeo ni seguimiento temporal.
- Salida solo de cajas delimitadoras; no genera máscaras de segmentación.
- Ejecución sin PyTorch: depende únicamente de `onnxruntime`, `numpy` y `Pillow`.
- Aceleración opcional en NPU Hexagon de Qualcomm mediante `onnxruntime-qnn` y el flag `--npu`.
- Comprobación de memoria libre antes de cargar el bundle, con rechazo si no cabe (anulable con `--force`).
- Utilidades de línea de comandos: `detect`, `bench` e `info` (esta última lista los conceptos y la memoria requerida).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión generativa, audio ni modo de pensamiento.

## Casos de uso

- Vigilancia de aparcamiento en placa ARM: con `fast-672` y los conceptos `car`, `bus` y `person`, el modelo puede filtrar fotogramas en una placa de 4 GB y emitir cajas para un servicio de conteo, a 0,30 s por concepto en CPU de portátil.
- Control de aforo en interiores: el bundle `quality-336` a 336 px está pensado para feeds de baja resolución y primar el juicio sobre la velocidad, adecuado para contar `person` en imágenes de cámaras de baja calidad.
- Inspección de obra: la lista incluye términos de obra y calle además de COCO; un bundle `fast-1008` a 1008 px permite detectar `forklift` u otros conceptos del listado con más detalle que la variante de 672 px, a costa de aproximadamente el doble de tiempo.
- Prefiltrado en el borde antes de enviar a la nube: el modelo descarta imágenes sin objetos de interés en la propia placa y solo transmite las que contienen detecciones por encima de un umbral, reduciendo ancho de banda y coste de inferencia remota.
- Prototipado rápido en placas con NPU Hexagon: con `onnxruntime-qnn` y `--npu`, el grafo de punto fijo de los bundles rápidos permite validar una pipeline de visión en la Rubik Pi 3 sin salir del dispositivo.
- Automatización industrial en CPU sin GPU: al no requerir PyTorch ni CUDA, el paquete se despliega con tres dependencias de Python en controladores industriales ARM y devuelve cajas para un PLC o un bus de mensajes.
- Análisis por lotes de imágenes COCO en un portátil: el `bench` integrado y la huella de 0,42 GB permiten ejecutar la muestra de 60 imágenes en CPU para comparar umbrales y bundles antes de fijar la configuración de producción.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La comparación de precisión usa una muestra de 60 imágenes COCO; el modelo completo es `tepirale/sam3-ONNX` en su variante más próxima al original, ejecutado en la misma CPU de portátil.

| Modelo | Ficheros | Primer concepto | Memoria pico | F1 en muestra COCO |
|---|---|---|---|---|
| SAM 3 completo, pesos 8 bits, 1008 px | 1,06 GB | 18,5 s | 6,4 GB | 0,73 |
| sam3micro quality-336 | 0,54 GB | 1,56 s | 0,85 GB | 0,41 |
| sam3micro fast-672 | 0,18 GB | 0,30 s | 0,42 GB | 0,29 (umbral 0,3) |

Rendimiento por bundle en la placa Rubik Pi 3 (Qualcomm QCS6490), con los servicios de visión en dispositivo pausados:

| Bundle | Dónde | Pasada de imagen | Pasada de detector | Primer concepto |
|---|---|---|---|---|
| fast-672 | cuatro núcleos Cortex-A78 | 0,47 s | 0,40 s | 0 (dato truncado en la información disponible) |

El autor indica que el bundle `fast-672` es el modelo completo más pequeño de la lista de 34 modelos cuantizados de `facebook/sam3` en Hugging Face (182 MB; el siguiente, 547 MB y solo para Apple Silicon), el de menor memoria y el más rápido en CPU: 60 veces más rápido que el modelo completo en una decimoquinta parte de la memoria. También es el menos preciso. No se publican resultados de MMLU, HumanEval ni GSM8K, que no aplican a un detector.

## Requisitos de hardware

- VRAM/memoria estimada: 0,44 GB para `fast-672`, 0,57 GB para `fast-1008` y 0,82 GB para `quality-336`, según la model card.
- GPU: no se documenta uso de GPU; el modelo está orientado a CPU ARM y NPU Hexagon. No se han publicado requisitos para A100, H100 ni RTX 4090.
- Consumer GPU: no aplica en la información disponible; el destino declarado son placas de 4 GB como la Rubik Pi 3.
- CPU: el bundle `fast-672` se midió en cuatro núcleos Cortex-A78 (0,47 s de pasada de imagen, 0,40 s de pasada de detector) y en cuatro Cortex-A55 bajo un límite de 900 MB de memoria.
- NPU: Qualcomm Hexagon en la Rubik Pi 3 (QCS6490), con `onnxruntime-qnn` y el flag `--npu` para los bundles rápidos.
- Despliegue: `onnxruntime` (o `onnxruntime-qnn`), `numpy` y `Pillow`; sin vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Memoria mínima: el runtime rechaza cargar el bundle si la memoria libre es inferior a la necesaria, salvo con `--force`; en placas sin swap, quedarse corto bloquea el sistema.
- Latencia: 0,30 s al primer concepto en CPU de portátil con `fast-672`; 1,56 s con `quality-336`.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Memoria pico | F1 (muestra COCO) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sam3edge-micro fast-672 | 42,4 M | 672 px | 0,42 GB | 0,29 | SAM License | ONNX, CPU ARM y NPU Hexagon |
| sam3edge-micro quality-336 | 42,4 M | 336 px | 0,85 GB | 0,41 | SAM License | ONNX, CPU ARM |
| SAM 3 completo cuantizado 8 bits (p. ej. `tepirale/sam3-ONNX`) | 848 M | 1008 px | 6,4 GB | 0,73 | SAM License | ONNX, orientado a GPU |
| eoinedge/sam3-edge | No disponible | 672 px | No disponible | 0,70 (a 0,03 del completo) | SAM License | ONNX, placa de mayor capacidad |

El autor sitúa `sam3-edge` a 0,03 del F1 del modelo completo a 672 px, pero no publica en esta ficha sus parámetros ni su memoria. Ningún otro modelo de la lista de 34 cuantizados de SAM 3 reporta tiempos en CPU de placa ARM ni ejecución en NPU Qualcomm, según la model card.

## Limitaciones y advertencias

- Lista de conceptos cerrada: solo detecta las 104 etiquetas de `micro.json`; no acepta texto libre y no puede ampliarse sin reexportar el bundle.
- Sin máscaras: la salida es solo de cajas, lo que lo inhabilita para tareas de segmentación.
- Una imagen por inferencia: no hay vídeo, seguimiento ni procesamiento por lotes.
- Precisión baja: F1 de 0,29 en `fast-672` y 0,41 en `quality-336` frente a 0,73 del modelo completo; la model card documenta falsos positivos de `person` sobre un autobús en la imagen de ejemplo.
- Sin datos sobre sesgos demográficos, geográficos o de dominio; el autor no publica evaluación de sesgo.
- Riesgo de alucinación de detecciones: el umbral de puntuación es crítico y el ejemplo del autor usa 0,3 para el bundle rápido.
- Idiomas: los conceptos están en inglés y no se declaran capacidades multilingües.
- Licencia SAM License, no open source estándar: el uso comercial está sujeto a los términos de Meta, que deben revisarse antes de producción.
- Repositorio de código privado en el momento de la publicación: no se puede auditar la exportación ni regenerar bundles sin acceso al autor.
- El dato de latencia del primer concepto en Cortex-A78 aparece truncado en la información disponible.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eoinedge/sam3edge-micro
- Modelo base: https://huggingface.co/facebook/sam3
- Versión completa para placas mayores: https://huggingface.co/eoinedge/sam3-edge
- EfficientSAM3 (codificadores destilados): https://github.com/SimonZeng7108/efficientsam3
- Repositorio de conversión (privado en la fecha de publicación): https://github.com/eoinjordan/sam3-edge
- Comparativa completa de modelos cuantizados (referenciada en el repo, no accesible): `docs/quantized-comparison.md`
- Modelo cuantizado usado como referencia: https://huggingface.co/tepirale/sam3-ONNX
- Licencia: fichero `LICENSE` del repositorio del modelo
