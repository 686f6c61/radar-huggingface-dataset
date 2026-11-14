# silvaamayaisaias/acuivision-detectron2-maskrcnn-tilapia

## Resumen

AcuiVision AI es un modelo de deteccion y segmentacion de instancias basado en Mask R-CNN R50-FPN de Detectron2, afinado por el usuario silvaamayaisaias para la deteccion de tilapia en entornos de acuicultura. Se trata de un fine-tuning experimental, no de un modelo fundacional: parte de los pesos oficiales `model_final_f10217.pkl` del model zoo de Detectron2 (Meta AI Research) y los adapta con 256 imagenes originales del dataset TilapiaVision y 32 fotogramas originales del dataset Tilapia-RAS. El resultado es un detector de una unica clase ("pez", sin clasificacion de especie) con salida de mascara de instancia.

El modelo es relevante como ejemplo de transferencia de un backbone generico de vision a un dominio vertical muy especifico (piscicultura intensiva), con un protocolo de validacion documentado y reproducible: validacion sobre el video GX020206 (16 fotogramas) y test sobre el video independiente GX020019 (16 fotogramas), sin fuga de aumentos entre hermanos ni uso del test para seleccion de checkpoint. El autor publica metricas medidas en una Tesla T4 en float32 con un protocolo identificado por hash.

Sus cifras piloto son modestas pero honestas: mAP@50 de 0,725, mAP@50-95 de 0,422, precision 0,659, recall 0,725, MAE de conteo de 1 pez, IoU medio 0,719 y Dice medio 0,826, con una latencia mediana de 91 ms por imagen y un pico de VRAM de 310 MB. El checkpoint exportado ocupa 176 MB (TorchScript), y el repositorio completo pesa unos 0,2 GB. No es un modelo listo para produccion ni para validacion a escala de granja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask R-CNN con backbone ResNet-50 y FPN (Detectron2, configuracion 3x) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible (el autor reporta inferencia en float32) |
| Idiomas soportados | es, en (etiquetas y documentacion; el modelo no procesa texto) |
| Licencia | CC BY-SA 3.0 (pesos derivados); codigo Detectron2 Apache-2.0 |
| Formato de pesos | TorchScript exportado en Kaggle; checkpoint original 176.490.423 bytes; no requiere pickle en inferencia |

## Arquitectura y entrenamiento

Mask R-CNN es un detector de dos etapas: un backbone ResNet-50 con Feature Pyramid Network extrae caracteristicas multiescala, una Region Proposal Network genera propuestas de region y una cabeza de clasificacion, regresion de cajas y prediccion de mascara por instancia produce la salida final. La configuracion de partida es la oficial `mask_rcnn_R_50_FPN_3x` de Detectron2, entrenada originalmente sobre COCO. El fine-tuning se realizo en Kaggle sobre 256 imagenes originales de TilapiaVision y 32 fotogramas originales de Tilapia-RAS; la supervision de mascaras utiliza exclusivamente los poligonos reales de Tilapia-RAS, mientras que TilapiaVision aporta principalmente supervision de cajas. Se entrena una unica clase "pez", sin distincion de especie.

El protocolo de datos es notablemente cuidadoso para un experimento pequeno: se evita la fuga de aumentos entre imagenes hermanas, se separan videos de validacion (GX020206) y test (GX020019) y el test no se usa para seleccionar checkpoint. No se documentan en la informacion disponible el numero de pasos de entrenamiento, la tasa de aprendizaje, el numero de tokens (no aplica) ni si hubo aumento de datos mas alla del estandar de Detectron2. El export a TorchScript se valido con comprobaciones de recarga y forma registradas en `manifest.json`.

## Capacidades

- Deteccion de instancias de pez (una clase) en imagenes y fotogramas de video de piscifactorias.
- Segmentacion de instancia con mascara binaria por pez detectado.
- Conteo de peces por imagen mediante el numero de detecciones por encima del umbral de confianza.
- Salida de cajas delimitadoras con puntuacion de confianza por deteccion.
- Procesamiento por imagen individual con latencia baja (mediana de 91 ms en T4, float32).
- Etiquetas y documentacion bilingues es/en.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision.
- No es un clasificador de especie: no distingue tilapia de trucha ni de otras especies.

## Casos de uso

- Conteo automatico de peces en tanques de engorde: el modelo devuelve una deteccion por pez con confianza, y el MAE de conteo medido de 1 pez en el piloto lo hace util para estimaciones de biomasa en tiempo casi real sobre video de camara fija.
- Monitorizacion de densidad en sistemas RAS (Recirculating Aquaculture Systems): con 91 ms por imagen en una T4, un solo servidor puede procesar varias camaras a baja frecuencia para detectar cambios de densidad.
- Segmentacion para analisis de comportamiento: las mascaras por instancia (Dice medio 0,826) permiten calcular areas proyectadas y trayectorias por pez en estudios de nado y agregacion.
- Preetiquetado asistido para anotacion: el modelo puede generar cajas y mascaras iniciales que un anotador humano revisa, reduciendo el coste de construir nuevos datasets de acuicultura.
- Prototipo de alertas de mortalidad o agrupamiento anormal: variaciones en el numero de detecciones entre fotogramas consecutivos pueden disparar una revision manual.
- Base para fine-tuning adicional en otras especies o condiciones de iluminacion: al ser un checkpoint Detectron2 exportado a TorchScript, se puede reentrenar la cabeza sobre nuevos datos manteniendo el backbone.
- Docencia y reproduccion de pipelines de vision aplicada: el protocolo con hash, los videos de validacion y test separados y el `benchmark.json` lo convierten en un ejemplo didactico de evaluacion honesta.

## Benchmarks y rendimiento

Resultados medidos por el autor en una Tesla T4 en float32, tres calentamientos, resolucion maxima comun de 640, confianza 0,3, IoU de caja 0,5, sobre 16 imagenes del video de test independiente GX020019:

| Metrica | Valor |
|---|---|
| mAP@50 | 0,7248 |
| mAP@50-95 | 0,4221 |
| Precision | 0,6591 |
| Recall | 0,7250 |
| MAE de conteo | 1 pez |
| IoU medio | 0,7194 |
| Dice medio | 0,8257 |
| Latencia mediana por imagen | 0,0914 s |
| VRAM pico | 310.212.608 bytes (~296 MiB) |
| Tamano del checkpoint | 176.490.423 bytes (~168 MiB) |

No se han publicado resultados frente a otros modelos en la informacion disponible, ni metricas sobre trucha u otras especies. El propio autor califica el resultado como piloto provisional sobre un unico video retenido, sin afirmaciones de robustez a escala de granja.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 296 MiB de pico medido en float32 con entrada de hasta 640 px; en la practica cualquier GPU con 2 GB o mas es suficiente.
- GPU recomendadas: Tesla T4 (medida por el autor), cualquier RTX 20xx/30xx/40xx, A100 o H100 para lotes grandes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida, aunque la latencia no esta medida en esos casos.
- Despliegue: el checkpoint TorchScript se puede cargar con `torch.jit.load` sin necesidad de pickle; alternativas habituales son ONNX Runtime previa exportacion, TorchServe o un servidor FastAPI propio. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: 91 ms por imagen en T4 float32; el throughput agregado no se ha publicado, pero por extrapolacion directa un solo flujo ronda las 11 imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | mAP@50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AcuiVision Detectron2 Mask R-CNN tilapia | Mask R-CNN R50-FPN | no disponible | no aplica | 0,725 (piloto, 16 imagenes) | CC BY-SA 3.0 | Hugging Face |
| Detectron2 Mask R-CNN R50-FPN 3x (COCO) | Mask R-CNN R50-FPN | no disponible | no aplica | no comparable (COCO, 80 clases) | CC BY-SA 3.0 | Model zoo de Detectron2 |
| RT-DETR (referencia del protocolo del autor) | Transformer detector | no disponible | no aplica | no disponible para este dominio | Apache-2.0 | Hugging Face / Ultralytics |
| YOLOv8/YOLO11 segmentation | CNN + cabeza de segmentacion | no disponible | no aplica | no disponible para este dominio | AGPL-3.0 / Enterprise | Ultralytics |

La comparacion directa no es posible porque el autor no publica metricas de modelos alternativos sobre el mismo video de test; solo se menciona RT-DETR como referencia de resolucion cuadrada 640 en el protocolo comun.

## Limitaciones y advertencias

- Validacion piloto: 16 imagenes de un unico video retenido; no hay evidencia de robustez en otras granjas, camaras, especies ni condiciones de agua.
- Una sola clase: no distingue tilapia de trucha ni de otras especies; el autor lo indica explicitamente y no publica metricas para trucha.
- Precision de 0,659: aproximadamente un tercio de las detecciones por encima del umbral son falsos positivos en el conjunto de test; requiere ajuste de umbral segun la aplicacion.
- Sensibilidad a dominio: entrenado con imagenes de TilapiaVision y Tilapia-RAS; el rendimiento puede degradarse con iluminacion, turbidez, angulos de camara o densidades distintas.
- Licencia CC BY-SA 3.0: permite uso comercial pero obliga a atribucion y a compartir bajo la misma licencia las obras derivadas; conviene revisar la compatibilidad con el producto antes de integrarlo.
- Riesgo de alucinacion en sentido amplio: el modelo puede detectar objetos que no son peces como peces; no hay mecanismo de calibracion de incertidumbre documentado.
- Formato TorchScript: no es directamente compatible con ecosistemas de modelos de lenguaje; requiere pipeline de vision propio.
- Sin soporte de texto, tool calling ni agentes: cualquier flujo conversacional o de razonamiento debe construirse alrededor del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/silvaamayaisaias/acuivision-detectron2-maskrcnn-tilapia
- Detectron2 (codigo Apache-2.0): https://github.com/facebookresearch/detectron2
- Model zoo de Detectron2 (pesos base `model_final_f10217.pkl`): https://github.com/facebookresearch/detectron2/blob/247691a1c292654867deb35cabb27f18d75a1363/MODEL_ZOO.md
- Dataset TilapiaVision (de Oliveira et al., 2026, CC BY 4.0): https://data.mendeley.com/datasets/bnst7jsdcx/1
- Dataset Tilapia-RAS (Aragon-Banderas et al., 2025, CC BY 4.0): https://zenodo.org/records/17518786
