# iaac-maai/concrete-evidence-rebar

## Resumen

Concrete Evidence rebar es un modelo de segmentación de instancias basado en Ultralytics YOLOv8n-seg, desarrollado por el equipo Concrete Evidence del IAAC MaAI (AAD Research Studio 03) y entrenado por Diego Alpízar. Su función es detectar y delimitar las armaduras de columnas de hormigón (barras, estribos y ganchos) a partir de una única fotografía tomada con un teléfono móvil antes del vertido, para que una aplicación pueda medirlas contra el listado de despiece y las normas Eurocode 8 y Eurocode 2.

El modelo parte de los pesos `yolov8n-seg.pt` y se distribuye en formato ONNX (`best.onnx`, 13,8 MB, entrada fija 1 × 3 × 640 × 640), ejecutable con `onnxruntime` en CPU sin necesidad de PyTorch. Cuenta con 3,4 M de parámetros y cuatro clases: `bar`, `hook_135`, `hook_90` y `stirrup` (que la aplicación renombra a `tie`). Sustituye al modelo provisional `iaac-maai/concrete-evidence-stand-in`.

Su relevancia radica en que aborda un caso de uso muy concreto de inspección en obra con hardware de consumo: verificar visualmente la armadura antes del hormigonado. No obstante, sus resultados solo están validados para barras sobre fotografías reales; estribos y ganchos se apoyan en datos sintéticos y no han demostrado generalización al mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLOv8n-seg (segmentación de instancias) |
| Parametros totales | 3,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 1 × 3 × 640 × 640) |
| Tipos de cuantizacion | no disponible (se distribuye únicamente el ONNX en precisión original) |
| Idiomas soportados | no aplica (modelo de imagen); no disponible en la ficha |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`best.onnx`, 13,8 MB) |

## Arquitectura y entrenamiento

Se trata de una red YOLOv8n-seg de Ultralytics, una arquitectura de detección y segmentación de instancias en una sola etapa con un cabezal de máscaras, en su variante "nano" (3,4 M de parámetros). El modelo se inicializó desde los pesos preentrenados `yolov8n-seg.pt` y se ajustó con entrada de 640 × 640, batch 8, hasta 100 épocas con paciencia de 20, semilla 0, durante aproximadamente 2,3 horas en una Colab T4.

El conjunto de datos consta de 1.157 imágenes (1.005 de entrenamiento, 89 de validación y 63 de test), procedentes del proyecto Roboflow `concrete-evidence-column-cages`, versión 1. Se compone de 701 imágenes de `roomsegment/rebar-seg` (CC BY 4.0), 36 de `sitevision-tnmlg/rebar-3dl2l` (CC BY 4.0), 300 jaulas de columna sintéticas generadas con pyrender y 120 renders sintéticos de maqueta, ambas de creación propia y solo para entrenamiento. Las fotos reales solo etiquetan barras; las etiquetas de estribos y ganchos provienen exclusivamente de los renders sintéticos, lo que explica la brecha sintético-real documentada por los autores. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de visión supervisado.

## Capacidades

- Segmentación de instancias de barras de armadura (`bar`) en fotografías reales de columnas.
- Detección de estribos (`stirrup`, renombrado a `tie` en la aplicación) y ganchos a 90° y 135° (`hook_90`, `hook_135`), aunque solo validados sobre datos sintéticos.
- Salida de cajas delimitadoras, clases y contornos de máscara por instancia.
- Inferencia en CPU mediante `onnxruntime`, sin dependencia de PyTorch.
- Integración con el servidor de modelo de la aplicación mediante variables `MODEL_REPO`, `MODEL_FILE` y `CLASS_RENAME`.
- Umbral de confianza configurable (la aplicación opera en el rango 0,27–0,5 según densidad de la jaula).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües o multimodales más allá de la imagen.

## Casos de uso

- Verificación de armadura antes del vertido: el modelo delimita cada barra de una columna a partir de una foto de móvil y la aplicación calcula la polilínea axial y la escala en milímetros (a partir de marcadores o del diámetro de barra) para comparar con el despiece.
- Comprobación de conformidad normativa: con las medidas extraídas, la aplicación contrasta separaciones y disposición frente a Eurocode 8 y Eurocode 2, generando sugerencias de fallo que un operario confirma o rechaza.
- Documentación de obra: registro automático de la geometría de la armadura en cada columna antes del hormigonado, útil para trazabilidad y auditoría posterior.
- Control de calidad en prefabricación: inspección rápida de jaulas de armadura en taller con hardware de consumo (CPU, sin GPU) gracias al reducido tamaño del ONNX (13,8 MB).
- Asistencia en formación: herramienta didáctica para que estudiantes de arquitectura e ingeniería visualicen la segmentación de barras y estribos sobre fotografías reales de obra.
- Preprocesado para medición automatizada: la salida de máscaras y cajas alimenta el módulo de medición de la aplicación, que requiere contornos por instancia en lugar de simples cajas.
- Filtrado previo en inspección con dron o cámara: uso del modelo como primera pasada para localizar barras en imágenes de jaulas, siempre con revisión humana posterior.

## Benchmarks y rendimiento

Resultados sobre 63 fotos reales de test no vistas en entrenamiento (solo clase `bar`):

| Clase | Instancias | Mask P | Mask R | Mask mAP50 | Mask mAP50-95 | Box mAP50 |
|---|---|---|---|---|---|---|
| bar | 1.321 | 0,816 | 0,704 | 0,748 | 0,396 | 0,889 |

En la práctica, aproximadamente 7 de cada 10 barras se detectan y unas 8 de cada 10 máscaras corresponden a barras reales. Sobre 60 fotos de jaulas de Wikimedia, el modelo encontró 453 barras, 5 estribos y 0 ganchos, lo que evidencia la brecha sintético-real para las clases no representadas en fotos reales. No se han publicado resultados de benchmarks para estribos ni ganchos sobre datos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; con GPU, el modelo de 3,4 M de parámetros y 13,8 MB en ONNX ocupa muy pocos cientos de MB, aunque no se proporcionan cifras exactas.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una Colab T4.
- Cabe en cualquier GPU de consumo e incluso en CPU: la inferencia de referencia se ejecuta con `onnxruntime` en CPU sin PyTorch.
- Opciones de despliegue: `onnxruntime` (CPU), con integración en el servidor de modelo de la aplicación mediante `MODEL_REPO=iaac-maai/concrete-evidence-rebar`, `MODEL_FILE=best.onnx` y `CLASS_RENAME=stirrup=tie`. No se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Concrete Evidence rebar | YOLOv8n-seg | 3,4 M | 640 × 640 fija | Segmentación de armaduras | AGPL-3.0 | Hugging Face (ONNX) |
| `iaac-maai/concrete-evidence-stand-in` | no disponible | no disponible | no disponible | Sustituto provisional del mismo equipo | no disponible | Hugging Face |
| YOLOv8n-seg (Ultralytics) | YOLOv8n-seg | 3,4 M | 640 × 640 | Segmentación genérica COCO | AGPL-3.0 | Ultralytics |

El modelo sustituye al `concrete-evidence-stand-in` del mismo equipo, del que no se detallan especificaciones. Frente al YOLOv8n-seg genérico de Ultralytics, comparte arquitectura y licencia, pero está ajustado específicamente al dominio de armaduras de columnas con clases propias. No se dispone de comparativas con otros modelos especializados en segmentación de armaduras.

## Limitaciones y advertencias

- Estribos y ganchos no están probados sobre fotos reales: las imágenes de test solo contienen barras, y en 60 fotos de Wikimedia el modelo detectó 5 estribos y 0 ganchos.
- Los contornos son imprecisos en los bordes (mask mAP50-95 de 0,396), por lo que el diámetro estimado a partir de la máscara es aproximado.
- El ruido confunde al modelo: tubos de andamio y objetos rectos similares pueden segmentarse como barras, y las jaulas densas reducen la confianza (0,27–0,5).
- Cada resultado es solo una sugerencia: en la aplicación una persona debe confirmar o rechazar cada fallo antes del vertido.
- Diferencias menores entre ONNX y PyTorch en el recuento de instancias en algunas fotos, por el padding fijo a 640 × 640 del ONNX frente al padding mínimo de PyTorch.
- Licencia AGPL-3.0: impone obligaciones de copyleft para uso en red y puede condicionar el uso comercial en productos propietarios; las fotos de entrenamiento son CC BY 4.0 y requieren atribución.
- No se documentan sesgos demográficos ni de otro tipo, pero la limitada variedad de datos (mayoría de fuentes Roboflow y sintéticos) puede reducir la generalización a condiciones de obra diversas.
- Riesgo de alucinación en el sentido de falsos positivos sobre objetos rectos; conviene fijar umbrales de confianza y validación humana en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/concrete-evidence-rebar
- Modelo provisional sustituido: https://huggingface.co/iaac-maai/concrete-evidence-stand-in (referenciado en la model card)
- Dataset de origen: https://universe.roboflow.com/roomsegment/rebar-seg
- Dataset de origen: https://universe.roboflow.com/sitevision-tnmlg/rebar-3dl2l
- Ultralytics YOLOv8: https://github.com/ultralytics/ultralytics
- ONNX Runtime: https://onnxruntime.ai
