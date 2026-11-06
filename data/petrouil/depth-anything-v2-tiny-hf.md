# Petrouil/Depth-Anything-V2-Tiny-hf

## Resumen

Depth Anything V2 Tiny es una variante comunitaria del modelo Depth Anything V2 Small, desarrollada por el usuario Petrouil. Se trata de un modelo de estimación de profundidad monocular (relative inverse depth) obtenido mediante poda estructurada y destilación de conocimiento a partir del checkpoint oficial Small. Conserva la familia de backbone DINOv2 ViT-S/14 y el decodificador de estilo DPT, pero reduce el backbone de 12 a 7 capas transformer y la rama de reassemble de 384 a 192 canales.

El resultado son 14.728.897 parámetros, un 40,6% menos que Small, y un checkpoint fp32 de 58,94 MB. A pesar de la reducción, mantiene un 85% o más de δ1 en el conjunto de test NYUv2 Eigen a cinco resoluciones de despliegue, con un pico de 87,50% δ1 a 336×448. La retención de δ1 a resolución nativa es del 93,6% respecto a Small bajo el mismo harness de evaluación.

Es relevante para despliegues con restricciones severas de memoria o cómputo (dispositivos embebidos, GPUs de gama baja, inferencia en tiempo real) donde la precisión de Small no es imprescindible. No es un modelo oficial de la familia Depth Anything V2 y el tamaño "Tiny" no existe como talla oficial en dicha familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2 ViT-S/14) con decodificador DPT-style |
| Parametros totales | 14.728.897 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos float32) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, 58,94 MB) |

## Arquitectura y entrenamiento

La arquitectura es la estándar `DepthAnythingForDepthEstimation` con backbone y decodificador reducidos. El backbone DINOv2 ViT-S/14 consta de 7 capas transformer (las siete primeras del modelo original), 6 cabezas de atención, tamaño oculto 384 y patch de 14. Los taps multi-escala se toman en las etapas 2, 5, 6 y 7 (posiciones 1-based en la pila de 7 capas). La anchura de la FFN se mantiene en 1536, sin poda. El decodificador DPT usa canales de reassemble `[48, 96, 192, 192]`, con la rama de factor 0,5 a 192 canales en lugar de 384, fusión de tamaño 64 y cabeza de profundidad de tamaño 32. La salida es profundidad inversa relativa (invariante a escala afín, mayor valor implica mayor cercanía), sin cabeza de escala métrica.

El modelo no se entrenó desde cero. Se obtuvo mediante poda estructurada de Small seguida de destilación y "healing" con el propio Small como profesor. Los objetivos de profundidad inversa se cachearon a 448×448 y el estudiante se ajustó con una pérdida L1 invariante a escala y desplazamiento más un término L1 de gradiente, con un schedule que incluyó warm-up solo de decodificador, fine-tune completo y un segundo heal con learning rate bajo. La etapa final de fine-tune multi-escala usó 224×294 (dos épocas), 252×336 (una época) y 336×448 (una época), batch size 12, learning rate 5e-6, AdamW con OneCycle. Los datos de entrenamiento fueron 10.295 imágenes (COCO 2017 val 4.700, ADE20K train 5.000, NYUv2 train 595), con 700 de validación y 654 de test (NYUv2 Eigen test, retenido). Las etiquetas de profundidad de COCO y ADE20K son pseudo-etiquetas generadas por el profesor Small; no se usaron etiquetas humanas para esas imágenes. El entrenamiento se realizó en una única NVIDIA RTX 1000 Ada Laptop GPU de 6 GB, con PyTorch 2.11.0+cu128 y transformers 5.22.1.

## Capacidades

- Estimación de profundidad monocular relativa (profundidad inversa) a partir de una imagen RGB.
- Entrada RGB en float32, formato NCHW, con altura y anchura divisibles por 14.
- Resoluciones probadas: 224×294, 252×336, 336×448, 448×602 y 518×686.
- Carga estándar con `AutoModelForDepthEstimation` y el procesador guardado; sin operaciones personalizadas.
- Comportamiento determinista en modo eval (sin dropout ni stochastic depth).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Robótica móvil de bajo consumo: el modelo puede estimar profundidad relativa a 336×448 en placas con poca memoria (por ejemplo, Jetson o Raspberry Pi con acelerador), suficiente para navegación reactiva y evitación de obstáculos donde no se requiere escala métrica absoluta.
- Realidad aumentada en dispositivos móviles: con 58,94 MB en fp32 y 14,7M de parámetros, cabe en el presupuesto de memoria de una app móvil y permite oclusión aproximada de objetos virtuales por geometría de escena.
- Segmentación y matting asistidos por profundidad: la salida de profundidad inversa sirve como señal auxiliar para separar primer plano y fondo en pipelines de edición de imagen, con la ventaja de un coste de inferencia muy inferior al de Small.
- Generación de mapas de disparidad para estéreo o profundidad en vídeo de baja latencia: a resoluciones de 224×294 o 252×336 el modelo es adecuado para procesar flujos de vídeo en tiempo real en GPUs de gama de entrada.
- Preprocesado en pipelines de visión 3D: la profundidad relativa se puede convertir a nube de puntos aproximada tras un ajuste de escala, útil para reconstrucción gruesa o inicialización de algoritmos de SLAM.
- Prototipado e investigación en entornos con recursos limitados: al entrenarse en una GPU de 6 GB y caber en cualquier GPU consumer, sirve como banco de pruebas para experimentos de poda, destilación o evaluación de profundidad sin necesidad de infraestructura grande.
- Despliegue en endpoints de Hugging Face: el modelo está marcado como `endpoints_compatible` y se carga con la API estándar de transformers, lo que facilita su integración en servicios de inferencia gestionados.

## Benchmarks y rendimiento

Evaluación sobre NYUv2 Eigen test split (654 imágenes), con protocolo propio del autor: la salida de profundidad inversa se compara con `1 / GT_depth` en espacio de profundidad inversa, con ajuste de escala por mínimos cuadrados por imagen.

| Modelo | Params | Tamano fp32 | Capas | Reassemble | δ1 @ 518×686 | δ1 @ 336×448 |
|---|---:|---:|---:|---:|---:|---:|
| Depth Anything V2 Small | 24.785.089 | 99,06 MB | 12 | 384 | 0,9111* | no disponible |
| Depth Anything V2 Tiny | 14.728.897 | 58,94 MB | 7 | 192 | 0,8525 | 0,8750 |

\* Medido con el mismo harness del autor. El paper oficial de Depth Anything V2 reporta δ1 0,973 para Small con otro protocolo y alineamiento; los números no son directamente comparables entre papers.

Resultados adicionales del modelo Tiny reportados en la model card:

| Resolucion | δ1 |
|---|---|
| 224×294 | 85%+ (valor exacto no disponible; mejora de +2,34 δ1 tras fine-tune multi-escala) |
| 252×336 | 85%+ (valor exacto no disponible) |
| 336×448 | 87,50% |
| 448×602 | 85%+ (valor exacto no disponible) |
| 518×686 | 85,25% |

La retención de δ1 a resolución nativa es del 93,6% respecto a Small bajo el mismo harness. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo de visión.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint (58,94 MB de pesos) más activaciones; en la práctica cabe holgadamente en GPUs de 2 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una NVIDIA RTX 1000 Ada Laptop GPU de 6 GB, lo que da una idea del perfil de recursos.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante, RTX 20/30/40, así como aceleradores integrados con suficiente memoria).
- Opciones de despliegue: transformers con `AutoModelForDepthEstimation` y el procesador guardado; el modelo está marcado como `endpoints_compatible` para Hugging Face Inference Endpoints. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño reducido (14,7M de parámetros y 7 capas), se espera una latencia muy baja en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | δ1 NYUv2 (mismo harness) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Depth Anything V2 Tiny (este) | 14.728.897 | Imagen, H y W divisibles por 14; hasta 518×686 probado | 0,8525 @ 518×686; 0,8750 @ 336×448 | Apache-2.0 | Hugging Face (comunidad) |
| Depth Anything V2 Small | 24.785.089 | Imagen; mismas restricciones de patch | 0,9111 @ 518×686 (harness del autor); 0,973 en paper oficial con otro protocolo | Apache-2.0 | Hugging Face (oficial) |
| Depth Anything V2 Base | no disponible en la informacion | Imagen | no disponible en la informacion | Apache-2.0 (familia) | Hugging Face (oficial) |
| Depth Anything V2 Large | no disponible en la informacion | Imagen | no disponible en la informacion | Apache-2.0 (familia) | Hugging Face (oficial) |

La comparativa directa solo es posible con Small, que es el modelo base y del que se dispone de medición bajo el mismo harness. Frente a Small, Tiny sacrifica aproximadamente 5,9 puntos de δ1 a resolución nativa a cambio de un 40,6% menos de parámetros y un 40,5% menos de tamaño de checkpoint. No se dispone de datos de otros modelos de profundidad monocular (MiDaS, Depth Pro, ZoeDepth) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo oficial de Depth Anything: es una variante comunitaria y "Tiny" no es una talla oficial de la familia V2.
- Precisión inferior a Small: aproximadamente 5,9 puntos de δ1 menos a resolución nativa; no debe usarse como sustituto directo en aplicaciones críticas de precisión.
- Salida de profundidad relativa, no métrica: requiere un ajuste de escala (y posiblemente de desplazamiento) para obtener distancias absolutas; no hay cabeza de escala métrica.
- Solo contiene pesos float32 en el repositorio; no se ofrecen versiones cuantizadas (fp16, int8, GGUF) ni se documentan procesos de cuantización.
- Restricción de entrada: altura y anchura deben ser divisibles por 14; resoluciones fuera de las probadas pueden degradar el rendimiento.
- El punto débil identificado por el autor es 224×294, corregido parcialmente con fine-tune multi-escala (+2,34 δ1), pero sigue siendo la resolución con menor margen sobre el 85% de δ1.
- Las etiquetas de profundidad de COCO y ADE20K son pseudo-etiquetas del profesor Small, no anotaciones humanas; esto puede introducir sesgos heredados del profesor en esos dominios.
- Riesgo de alucinación geométrica: como todo modelo de profundidad monocular, puede producir estimaciones plausibles pero incorrectas en escenas fuera de la distribución de entrenamiento (interiores NYUv2, COCO y ADE20K), especialmente en escenas exteriores muy diferentes o con materiales poco texturados.
- Sesgos de dominio: el entrenamiento se centra en interiores y escenas comunes de COCO/ADE20K; el rendimiento en otros dominios (subacuático, médico, satelital) no está evaluado.
- Licencia Apache-2.0: permite uso comercial, pero al ser un modelo comunitario sin revisión oficial, se recomienda validar su comportamiento en el dominio de producción antes de desplegarlo.
- Sin datos de latencia ni throughput publicados; el rendimiento en tiempo real debe medirse en el hardware objetivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Petrouil/Depth-Anything-V2-Tiny-hf
- Modelo base (Depth Anything V2 Small): https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Paper de Depth Anything V2 (arXiv:2406.09414): https://arxiv.org/abs/2406.09414
