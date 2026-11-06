# haroonx02/polyp-segmentation-unet-resnet34

## Resumen

El modelo `haroonx02/polyp-segmentation-unet-resnet34` es un segmentador binario de polipos de colon basado en una U-Net con codificador ResNet-34 preentrenado en ImageNet. Lo desarrolla el usuario `haroonx02` (haroonkhan02 en GitHub) como modelo de investigacion y portfolio, entrenado sobre 800 imagenes del conjunto publico Kvasir-SEG. Resuelve la tarea de segmentacion densa pixel a pixel: dada una imagen endoscopica de 320x320, devuelve un mapa de probabilidad de polipo que se umbraliza a 0,5 para obtener la mascara.

Su interes practico no esta en el rendimiento bruto, sino en el empaquetado: se distribuye en cuatro formatos (checkpoint PyTorch, ONNX FP16, ONNX INT8 estatico y una variante ONNX INT8 con Monte-Carlo dropout de 8 muestras que emite media y desviacion tipica), lo que permite desplegarlo en CPU o en GPU de gama baja con cuantizacion INT8 sin perdida apreciable de Dice (0,9043 frente a 0,9036). Es, por tanto, un ejemplo util de pipeline de segmentacion medica listo para inferencia con estimacion de incertidumbre, no un modelo listo para uso clinico.

El modelo es pequeno (98 MB en FP32, 25 MB en INT8) y esta pensado para prototipado rapido, demostraciones en navegador y experimentos de cuantizacion. No dispone de validacion multi-centro ni de aprobacion regulatoria, y el propio autor lo declara explicitamente como no apto para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con codificador ResNet-34 (preentrenado en ImageNet) y `Dropout2d(0.2)` tras cada bloque del decodificador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 320x320 px) |
| Tipos de cuantizacion | FP32 (PyTorch), FP16 (ONNX), INT8 estatico QDQ por canal, INT8 con MC-dropout (8 muestras) |
| Idiomas soportados | no aplica (procesamiento de imagen, sin NLP) |
| Licencia | MIT |
| Formato de pesos | `.pt` (state_dict + config de entrenamiento), `.onnx` (FP16, INT8, INT8+MC-dropout) |
| Entrada | float32 `(1, 3, 320, 320)`, RGB en [0, 1]; normalizacion ImageNet incluida en el grafo ONNX |
| Salida | `probs` `(1, 1, 320, 320)` con sigmoid incluida; en la variante MC, salidas `mean` y `std` |
| Tamano del repositorio | 0,2 GB |
| Tarea | Segmentacion binaria de imagen (`image-segmentation`) |

## Arquitectura y entrenamiento

La red es una U-Net clasica con codificador convolucional ResNet-34 inicializado con pesos de ImageNet y un decodificador con conexiones de salto. Sobre cada bloque del decodificador se aplica `Dropout2d(0.2)`, lo que habilita inferencia bayesiana aproximada mediante Monte-Carlo dropout: la variante `polyp_unet_mc8_int8.onnx` ejecuta 8 pasadas estocasticas por el decodificador y agrega las salidas en media y desviacion tipica. La entrada se fija en 320x320 con interpolacion de area y division por 255; la normalizacion ImageNet esta embebida en el grafo ONNX, de modo que el consumidor solo debe redimensionar y escalar.

El entrenamiento se realizo sobre 800 fotogramas de Kvasir-SEG (Jha et al., MMM 2020, licencia CC BY 4.0), con una particion de test retenida de 100 imagenes y semilla fijada. La cuantizacion INT8 estatica se calibro con 128 fotogramas de entrenamiento en esquema QDQ por canal. No se documentan en la informacion disponible el numero de epocas, la funcion de perdida exacta, el optimizador ni si hubo aumento de datos; tampoco se menciona uso de RLHF/DPO (no aplica a un modelo de vision).

## Capacidades

- Segmentacion binaria densa de polipos colorrectales en imagenes de colonoscopia.
- Salida de probabilidad calibrada por pixel (sigmoid en el grafo) y umbralizado configurable.
- Estimacion de incertidumbre aleatorica mediante MC-dropout con 8 muestras (mapa de desviacion tipica).
- Deteccion de errores de segmentacion a partir del mapa de incertidumbre (AUROC 0,91-0,94).
- Inferencia en FP32, FP16 e INT8 con diferencias de Dice inferiores a 0,001.
- Ejecucion en CPU via ONNX Runtime gracias a los artefactos INT8 de 25 MB.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual y de una sola tarea.

## Casos de uso

- Prototipado de pipelines de segmentacion endoscopica: sirve como linea base reproducible (Dice 0,904 en Kvasir-SEG) para comparar nuevas arquitecturas o tecnicas de aumento de datos antes de escalar a conjuntos multi-centro.
- Demostracion interactiva en navegador: los ONNX INT8 de 25 MB permiten ejecutar el modelo en el cliente (ONNX Runtime Web) sin backend GPU, como hace el Space del autor.
- Investigacion sobre incertidumbre en imagen medica: la variante MC-dropout permite estudiar la correlacion entre desviacion tipica y error pixel a pixel, y evaluar tecnicas de rechazo o revision humana selectiva.
- Benchmark de cuantizacion: el repositorio incluye FP16, INT8 y INT8+MC con la misma particion de test, lo que facilita medir el impacto de la cuantizacion en Dice e IoU de forma controlada.
- Pre-anotacion asistida en conjuntos de datos: el modelo puede generar mascaras iniciales sobre nuevos fotogramas de Kvasir-SEG o datasets similares para que un anotador las corrija, reduciendo el coste de etiquetado.
- Educacion y portfolio tecnico: el codigo de entrenamiento, evaluacion y analisis de errores esta publicado en GitHub, lo que lo convierte en un ejemplo didactico de segmentacion medica de extremo a extremo.
- Filtro de triaje en investigacion: combinado con el mapa de incertidumbre, puede priorizar fotogramas sospechosos para revision, aunque sin validacion clinica.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Dice medio (test, 100 imagenes) | 0,904 | PyTorch, umbral 0,5, resolucion original |
| IoU medio | 0,844 | Misma particion |
| Dice ONNX FP32/FP16 | 0,904 | Diferencia < 0,001 respecto a PyTorch |
| Dice ONNX INT8 | 0,9043 | Frente a 0,9036 del modelo de referencia |
| Dice por tamano: pequeno (< 5 % del frame) | 0,868 | |
| Dice por tamano: mediano | 0,938 | |
| Dice por tamano: grande | 0,867 | |
| AUROC del mapa de incertidumbre (MC-8) | 0,91-0,94 | Varia hasta 0,02 entre semillas |
| Intervalo de confianza del Dice medio | ± 0,025 | Con 100 imagenes de test |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 para entrada 320x320 con lote 1; aproximadamente 0,5 GB en FP16 e inferior en INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, T4). Para entrenamiento, una RTX 3060 o superior es suficiente dado el tamano del modelo y del dataset.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con ONNX Runtime.
- Despliegue: ONNX Runtime (CPU/GPU), PyTorch nativo, ONNX Runtime Web para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. La variante MC-8 multiplica por 8 el coste del decodificador respecto a una pasada unica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Dice (Kvasir-SEG) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| polyp-segmentation-unet-resnet34 | no disponible (98 MB FP32) | 320x320 px | 0,904 | MIT | Hugging Face + GitHub + Space |
| U-Net original (Ronneberger et al.) | no disponible | variable | no disponible | no disponible | Implementaciones multiples |
| PraNet | no disponible | variable | no disponible | no disponible | Repositorio publico |
| HarDNet-MSEG | no disponible | variable | no disponible | no disponible | Repositorio publico |

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La ventaja diferencial de este modelo frente a las alternativas es el empaquetado ONNX con cuantizacion INT8 y MC-dropout listo para usar, junto con una licencia MIT permisiva.

## Limitaciones y advertencias

- No apto para uso clinico: el autor lo declara explicitamente. No hay validacion regulatoria ni aprobacion para diagnostico.
- Fuente unica de datos: un solo hospital noruego (Kvasir-SEG), sin validacion en otros endoscopios, poblaciones o protocolos de imagen.
- Sesgo de seleccion: todos los fotogramas del dataset contienen un polipo, por lo que la tasa de falsos positivos sobre mucosa sana es desconocida.
- Test reducido: 100 imagenes implican un margen de error de aproximadamente ± 0,025 en el Dice medio.
- Errores sistematicos: la mayoria de fallos son subsegmentacion de polipos planos.
- Incertidumbre incompleta: el MC-dropout detecta bien los limites dudosos pero no las regiones donde el modelo se equivoca con alta confianza.
- Sensibilidad a la calibracion INT8: aunque el Dice se mantiene, la calibracion se hizo con 128 fotogramas de un unico dominio; en imagenes fuera de distribucion el comportamiento puede degradarse.
- Entrada fija de 320x320: requiere redimensionado con interpolacion de area y posterior reescalado bilineal de la mascara, lo que introduce perdida de detalle en lesiones pequenas.
- Licencia MIT: permite uso comercial, pero la licencia del dataset Kvasir-SEG es CC BY 4.0 y debe respetarse en cualquier redistribucion derivada.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de segmentaciones erroneas confiadas; debe acompanarse siempre de revision humana en cualquier uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haroonx02/polyp-segmentation-unet-resnet34
- Codigo de entrenamiento y evaluacion: https://github.com/haroonkhan02/polyp-segmentation-unet
- Demo en navegador (Space): https://huggingface.co/spaces/haroonx02/polyp-segmentation-browser
- Dataset Kvasir-SEG: Jha et al., "Kvasir-SEG: A Segmented Polyp Dataset", MMM 2020 (licencia CC BY 4.0)
