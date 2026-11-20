# cjy666/dsa-vessel-seg

## Resumen

DSA vessel segmentation es un modelo de segmentación binaria de vasos cerebrales para imágenes de angiografía por sustracción digital (DSA), desarrollado por el usuario cjy666. Se trata de un nnU-Net v2 en configuración 2D, entrenado con una función de pérdida que combina Dice, entropía cruzada y clDice, y exportado a ONNX en precisión float32 con los pesos sin modificar. El repositorio contiene las cinco folds de una validación cruzada de 5 folds, cada una con aproximadamente 46,3 millones de parámetros y un tamaño de fichero de unos 185 MB.

El modelo resuelve un problema clínico concreto: aislar la vasculatura cerebral en imágenes DSA, una tarea de segmentación fina donde las estructuras de interés son tubulares, delgadas y de bajo contraste. La inclusión de la pérdida clDice está específicamente orientada a preservar la conectividad topológica de los vasos, algo que las pérdidas píxel a píxel convencionales tienden a romper en estructuras tubulares.

Su relevancia inmediata reside en el formato de despliegue: al estar exportado a ONNX con un conjunto de operadores limitado (Conv, ConvTranspose, InstanceNormalization, LeakyRelu, Concat, opset 17), puede ejecutarse íntegramente en el navegador mediante ONNX Runtime Web, con aceleración WebGPU, sin enviar imágenes a un servidor. El autor acompaña el modelo con una aplicación web de demostración y verifica numéricamente la equivalencia entre la inferencia en navegador y el predictor nativo de nnU-Net. El modelo está marcado explícitamente como de uso exclusivo en investigación y no es un producto sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 (configuración 2d), `PlainConvUNet` con 8 etapas, 32→512 features, InstanceNorm y LeakyReLU |
| Parametros totales | 46,3 M por fold (5 folds independientes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de parche fija de 896 × 768 píxeles con solapamiento del 50 % |
| Tipos de cuantizacion | no disponible; pesos exportados en float32 sin cuantizar |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (opset 17), float32; un fichero `vessel_seg_fold{0..4}.onnx` por fold (~185 MB) más `model.json` como manifiesto |

## Arquitectura y entrenamiento

La arquitectura es una U-Net convolucional plana (`PlainConvUNet`) de nnU-Net v2 (versión 2.6.2), configuración `2d` y planes `nnUNetPlans`, con 8 etapas de resolución y un ancho de features que va de 32 a 512 canales. La normalización es InstanceNorm y la activación LeakyReLU. La entrada es un único canal en escala de grises de 896 × 768 píxeles y la salida son dos mapas de logits (fondo y vaso) de la misma resolución espacial. El entrenamiento emplea el trainer `nnUNetTrainerClDice2D`, que combina Dice, entropía cruzada y clDice, una pérdida sensible a la topología que penaliza la rotura de estructuras tubulares. Se realizó una validación cruzada de 5 folds y se exportaron los `checkpoint_final.pth` de cada fold con PyTorch 2.3.1 mediante `torch.onnx.export` a opset 17.

El pipeline de inferencia replica el predictor oficial de nnU-Net v2: lectura de la imagen como canal de 8 bits, recorte al bounding box de píxeles no nulos, normalización z-score sobre los píxeles recortados, padding con ceros hasta al menos 896 × 768, ventana deslizante con paso de 0,5 del parche y ponderación gaussiana con σ = parche/8, test-time augmentation opcional por espejo en los ejes 0 y 1 (promedio de 4 volteos), ensemble por promedio de logits de las folds usadas, softmax y umbral a 0,5, y finalmente deshacer el padding y pegar el resultado en la caja del recorte. La innovación técnica destacable no está en la arquitectura, que es estándar, sino en la exportación controlada a un subconjunto de operadores ONNX que permite ejecución en navegador con WebGPU.

## Capacidades

- Segmentación binaria de vasos cerebrales en imágenes DSA de angiografía por sustracción digital.
- Segmentación de estructuras tubulares finas con preservación de conectividad topológica gracias a la pérdida clDice.
- Procesamiento de imágenes de resolución variable mediante recorte, padding y ventana deslizante con solapamiento del 50 %.
- Ensemble nativo de 5 folds con promedio de logits, más test-time augmentation por espejo opcional.
- Inferencia en navegador mediante ONNX Runtime Web (WebGPU y WASM), con procesamiento local de la imagen.
- Ejecución en Python mediante ONNX Runtime con una única sesión por fold.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades agénticas, multilingües, de visión general, audio o modo de pensamiento.

## Casos de uso

- Investigación en segmentación vascular cerebral: el modelo permite reproducir experimentos de segmentación de vasos en DSA sin reentrenar, usando las folds publicadas y el pipeline documentado de preprocesado e inferencia.
- Herramienta de anotación asistida: integrado en una aplicación web local, genera máscaras de vasos que un radiólogo o investigador puede revisar y corregir, reduciendo el trabajo manual de delineación en estudios retrospectivos.
- Despliegue en navegador con privacidad de datos: al ejecutarse con ONNX Runtime Web y procesar las imágenes localmente, es adecuado para entornos donde las imágenes clínicas no pueden salir del puesto de trabajo.
- Evaluación comparativa de modelos de segmentación: sirve como línea base nnU-Net 2D con clDice frente a otras arquitecturas de segmentación vascular, usando el ensemble de 5 folds para reducir la varianza de la métrica.
- Prototipado de pipelines de imagen médica: el formato ONNX y el manifiesto `model.json` con tamaños y SHA-256 facilitan la integración en aplicaciones existentes y la verificación de integridad de los pesos.
- Docencia y demostración técnica: la aplicación web pública y el código de `worker.js` permiten ilustrar el flujo completo de preprocesado, ventana deslizante, ensemble y postprocesado de nnU-Net en un entorno reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (Dice, IoU u otros) en la información disponible. El autor documenta únicamente verificaciones de equivalencia numérica entre implementaciones:

| Verificación | Comparación | Resultado |
|---|---|---|
| ONNX Runtime vs PyTorch, parche real 896 × 768 (fold 0) | Diferencia máxima de logit | 7,3e-3 |
| ONNX Runtime vs PyTorch, parche real 896 × 768 (fold 0) | Acuerdo de argmax | 99,9999 % |
| Navegador (WebGPU) vs nnU-Net, fold 0, imagen 791 × 1022 | Píxeles de vaso (navegador / nnU-Net) | 59.193 / 59.191; 2 píxeles distintos; 1,1 s |
| Navegador (WebGPU) vs nnU-Net, fold 0 + espejo | Píxeles de vaso | 57.064 / 57.064; 0 píxeles distintos; 3,2 s |
| Navegador (WASM, 1 hilo) vs nnU-Net, fold 0 | Píxeles de vaso | 59.207 / 59.191; 22 píxeles distintos; 22 s |
| Navegador (WebGPU) vs nnU-Net, 5 folds | Píxeles de vaso | 54.668 / 54.666; 2 píxeles distintos; 4,1 s |
| Navegador (WebGPU) vs nnU-Net, 5 folds + espejo | Píxeles de vaso | 54.723 / 54.723; 0 píxeles distintos; 15,6 s |

Los tiempos indicados corresponden a un portátil con Apple M-series.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; cada fold pesa unos 185 MB en float32, por lo que el peso de los parámetros es de aproximadamente 0,2 GB por fold y 1 GB para el ensemble de 5 folds, más el coste de activaciones para parches de 896 × 768.
- GPU recomendadas: no disponible. El autor valida la ejecución en WebGPU sobre hardware Apple M-series; para despliegue en servidor serían necesarias pruebas propias con A100, H100 o RTX 4090, cuyos requisitos no se documentan.
- Cabe en GPU de consumo: no confirmado explícitamente, pero el tamaño de pesos por fold (185 MB) es compatible en principio con GPUs de consumo; el factor limitante es la memoria de activaciones para la ventana de 896 × 768 y el número de folds simultáneos.
- Opciones de despliegue: ONNX Runtime (Python) y ONNX Runtime Web 1.31.1 con backend WebGPU o WASM; el pipeline nativo de referencia es `nnUNetPredictor` de nnU-Net v2. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: en el navegador, 1,1 s por fold sin espejo y 4,1 s para 5 folds con WebGPU; 22 s en CPU WASM a un hilo para un fold; 15,6 s para 5 folds con espejo en WebGPU. No hay datos de throughput en servidor.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos alternativos de segmentación vascular en DSA (parámetros, contexto, rendimiento, licencia y disponibilidad). La comparación con otras arquitecturas de segmentación médica (por ejemplo, variantes de U-Net, Swin-UNETR u otros nnU-Net) no está disponible.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cjy666/dsa-vessel-seg | 46,3 M por fold | parche 896 × 768 | no disponible | no disponible | Hugging Face, ONNX |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso exclusivo en investigación: el autor indica explícitamente "Research use only. Not a medical device"; no debe emplearse para diagnóstico o decisión clínica.
- Licencia no declarada: no se especifican los términos de uso comercial ni de redistribución, lo que impide asumir permisos para producción.
- Dominio restringido: entrenado para DSA cerebral en escala de grises de 8 bits; su comportamiento en otras modalidades de imagen, otras regiones anatómicas u otras distribuciones de intensidad no está documentado.
- Dependencia del preprocesado: los resultados dependen de replicar el pipeline exacto de nnU-Net (recorte al bounding box, z-score sobre píxeles no nulos, padding, ventana deslizante con paso 0,5 y ponderación gaussiana); desviarse de él altera la salida.
- Resolución de entrada fija: la ventana es de 896 × 768 píxeles; imágenes de mayor tamaño requieren ventana deslizante y las muy pequeñas se rellenan con ceros, lo que puede afectar a la calidad en imágenes de baja resolución.
- Riesgo de error en vasos finos: pese a la pérdida clDice, no se publican métricas de Dice o de conectividad que cuantifiquen el rendimiento en vasos de calibre pequeño ni en regiones de bajo contraste.
- Sin datos de sesgo: no se documenta la composición del conjunto de entrenamiento ni la distribución demográfica, por lo que no puede evaluarse el sesgo por subpoblación.
- Sin métricas de calibración: no se aportan datos sobre la fiabilidad de la probabilidad de salida más allá del umbral fijo de 0,5.
- Sin garantías de cuantización: solo se distribuyen pesos float32; no hay versiones cuantizadas ni datos sobre la degradación asociada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cjy666/dsa-vessel-seg
- Aplicación web de demostración: https://jctaylor666.github.io/dsa-vessel-seg-web/
- Repositorio de la aplicación web: https://github.com/JCTaylor666/dsa-vessel-seg-web
- Implementación del pipeline en navegador (`worker.js`): https://github.com/JCTaylor666/dsa-vessel-seg-web/blob/main/worker.js
