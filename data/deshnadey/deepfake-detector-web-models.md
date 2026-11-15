# deshnadey/deepfake-detector-web-models

## Resumen

`deshnadey/deepfake-detector-web-models` es un paquete de artefactos ONNX publicado por la autora individual deshnadey para alimentar un detector de deepfakes que se ejecuta íntegramente en el navegador. No es un modelo único entrenado desde cero, sino una colección de cuatro ficheros que componen un sistema de doble flujo (twin-stream): un clasificador de caras basado en SigLIP, un detector de imágenes generadas por IA basado en un ViT-S de Community Forensics, un detector facial YuNet y una cabeza de fusión logística entrenada por el equipo del proyecto. El paquete ocupa 0,2 GB y se distribuye bajo licencia Apache-2.0.

El problema que resuelve es la detección de imágenes sintéticas o manipuladas sin enviar los datos a un servidor: al estar en formato ONNX, los ficheros pueden cargarse con ONNX Runtime Web o WebGPU en el cliente. Esto es relevante para aplicaciones de verificación de contenido, moderación y periodismo en las que la privacidad del usuario y la latencia local son críticos. La model card reporta sobre un conjunto de test retenido de 357 imágenes una precisión del 81,2 % y un ROC-AUC de 0,906 para el sistema fusionado.

La ficha se basa exclusivamente en la información publicada en el repositorio de Hugging Face y en la model card; no se dispone de detalles sobre el entrenamiento del clasificador SigLIP original ni de la composición de los datasets de entrenamiento más allá de lo indicado. El modelo se publicó en noviembre de 2026 y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de doble flujo: clasificador SigLIP (flujo de cara) + ViT-S (flujo de escena) + detector facial YuNet + cabeza de fusión logística |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | 8-bit weight-only en `face_siglip_w8.onnx`; resto de ficheros sin cuantización declarada |
| Idiomas soportados | no disponible (modelo de clasificación de imagen, sin componente textual) |
| Licencia | Apache-2.0 (componentes heredados: Apache-2.0 y MIT) |
| Formato de pesos | ONNX (`.onnx`) y JSON (cabeza de fusión) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | image-classification |
| Tarea | Detección de deepfakes e imágenes generadas por IA |

## Arquitectura y entrenamiento

El sistema es un ensemble de dos clasificadores visuales independientes cuyas salidas se combinan mediante una regresión logística. El primer flujo, `face_siglip_w8.onnx`, es un clasificador SigLIP convertido desde `prithivMLmods/deepfake-detector-model-v1` y cuantizado a 8 bits solo en pesos; la model card indica que el cambio medio absoluto en la probabilidad de "fake" respecto a fp32 es de 0,007, lo que sugiere una degradación mínima por cuantización. El segundo flujo, `scene_cf.onnx`, es una copia sin modificar del ViT-S de `buildborderless/CommunityForensics-DeepfakeDet-ViT`, basado en el trabajo *Community Forensics* de Park y Owens (CVPR 2025), orientado a detectar imágenes generadas por IA a nivel de escena. YuNet (`yunet.onnx`, versión 2023mar de OpenCV Zoo) se usa para localizar rostros antes de aplicar el flujo de cara.

La cabeza de fusión (`fusion_head_web.json`) es una regresión logística entrenada por el equipo del proyecto que combina las puntuaciones de ambos flujos. No se especifican en la información disponible el número de tokens, la composición de los datasets de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de imagen). Tampoco se detalla el proceso de conversión a ONNX más allá de la procedencia de cada fichero. La innovación principal es de despliegue: empaquetar un detector de doble flujo en artefactos ONNX ligeros aptos para inferencia en navegador.

## Capacidades

- Clasificación binaria de imágenes como reales o falsas/manipuladas (deepfake o generada por IA).
- Detección facial previa mediante YuNet para aislar la región del rostro antes del análisis.
- Análisis de doble flujo: evaluación del rostro (SigLIP) y de la escena completa (ViT-S), con fusión de ambas señales.
- Inferencia en el cliente: los ficheros ONNX están pensados para ejecutarse en navegador (ONNX Runtime Web / WebGPU), sin backend.
- Cuantización de pesos a 8 bits en el flujo de cara para reducir tamaño y coste de cómputo con impacto mínimo declarado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador de imagen puro.
- No dispone de capacidades multilingües, de generación de texto ni de modo "thinking".
- No se declaran capacidades de visión más allá de la clasificación (sin OCR, detección de objetos genérica ni segmentación).

## Casos de uso

- Verificación de contenido en el navegador: una extensión o web app puede cargar los ONNX y clasificar una imagen subida por el usuario sin enviarla a un servidor, preservando la privacidad y reduciendo latencia.
- Moderación de imágenes en plataformas comunitarias: integración en el cliente para marcar posibles deepfakes antes de la subida, usando el flujo de escena para imágenes sintéticas y el de cara para rostros manipulados.
- Herramientas de periodismo y fact-checking: análisis rápido de fotos recibidas por canales sociales, con la puntuación fusionada y el ROC-AUC de 0,906 como referencia de fiabilidad en el conjunto de test.
- Educación y concienciación sobre deepfakes: demos interactivas que muestran al usuario por qué una imagen se clasifica como sintética, ejecutándose localmente.
- Filtrado previo en pipelines de verificación de identidad: descartar imágenes de rostro generadas por IA antes de pasarlas a un sistema de KYC más costoso.
- Aplicaciones offline o de borde: despliegue en dispositivos sin conectividad usando ONNX Runtime, gracias al tamaño reducido del paquete (0,2 GB) y a la cuantización de 8 bits del flujo de cara.
- Investigación en detección de deepfakes: punto de partida reproducible para comparar flujos SigLIP frente a ViT-S y estudiar estrategias de fusión.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 81,2 % | Test retenido de 357 imágenes (datasets y splits separados del entrenamiento) |
| ROC-AUC | 0,906 | Test retenido de 357 imágenes |
| Cambio medio absoluto en P(fake) por cuantización 8-bit | 0,007 | Flujo de cara SigLIP, frente a fp32 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores son las únicas reportadas por la model card y corresponden al sistema fusionado, no a cada flujo por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete completo pesa 0,2 GB, por lo que la huella en memoria es reducida y compatible con ejecución en CPU y en GPU integrada.
- GPU recomendadas: no se especifican; al ser modelos ONNX pequeños, pueden ejecutarse en CPU y en GPUs de consumo. Para aceleración en navegador se recomienda WebGPU en GPUs integradas o dedicadas recientes.
- Cabe en GPU de consumo: sí, por el tamaño del paquete (0,2 GB) y la cuantización de 8 bits del flujo de cara; no se detallan modelos concretos.
- Opciones de despliegue: ONNX Runtime (nativo y Web), ONNX Runtime Web con WebGPU o WASM; OpenCV para YuNet. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| deshnadey/deepfake-detector-web-models | Ensemble ONNX (SigLIP + ViT-S + YuNet + fusión) | no disponible | no aplica | Accuracy 81,2 %, ROC-AUC 0,906 (357 imágenes) | Apache-2.0 | Hugging Face, 0 descargas |
| prithivMLmods/deepfake-detector-model-v1 | Clasificador SigLIP | no disponible | no aplica | no disponible en esta ficha | Apache-2.0 | Hugging Face (origen del flujo de cara) |
| buildborderless/CommunityForensics-DeepfakeDet-ViT | ViT-S detector de imágenes IA | no disponible | no aplica | no disponible en esta ficha | MIT | Hugging Face (origen del flujo de escena) |
| YuNet 2023mar (OpenCV Zoo) | Detector facial | no disponible | no aplica | no disponible en esta ficha | MIT | OpenCV Zoo (componente auxiliar) |

No se dispone de datos de benchmarks de los modelos de origen en la información proporcionada, por lo que la comparación se limita a procedencia, licencia y disponibilidad. No se han identificado alternativas adicionales de la misma categoría con métricas publicadas en esta ficha.

## Limitaciones y advertencias

- El conjunto de evaluación es pequeño (357 imágenes) y de un único reparto; la accuracy del 81,2 % no garantiza generalización a otros dominios, generadores o tipos de manipulación.
- No se documentan sesgos demográficos, de género, edad o etnia en el detector facial ni en los clasificadores; un detector de deepfakes puede rendir de forma desigual según el rostro.
- Riesgo de falsos positivos y negativos: no se reportan matrices de confusión ni métricas por clase, por lo que no se conoce el equilibrio entre precisión y recall.
- El modelo de escena es una copia sin modificar de un ViT-S de terceros; su comportamiento y limitaciones dependen del modelo original, no documentadas aquí.
- El flujo de cara está cuantizado a 8 bits; aunque el cambio medio en P(fake) es de 0,007, no se detalla la variación en la cola de la distribución ni en casos límite.
- La cabeza de fusión es una regresión logística entrenada por el equipo del proyecto sin documentación pública del proceso; su robustez fuera del conjunto de test es desconocida.
- Licencia Apache-2.0 permite uso comercial, pero los componentes heredados conservan sus licencias (Apache-2.0 y MIT); conviene verificar el cumplimiento de atribución de cada fichero.
- No se declaran idiomas ni capacidades textuales; no es adecuado para tareas de generación, razonamiento o diálogo.
- El repositorio no registra descargas ni valoraciones, lo que limita la evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/deshnadey/deepfake-detector-web-models
- Aplicación (Space): https://huggingface.co/spaces/deshnadey/deepfake-detector
- Código fuente: https://github.com/DeshnaDey/BE.FR
- Modelo de origen del flujo de cara: https://huggingface.co/prithivMLmods/deepfake-detector-model-v1
- Modelo de origen del flujo de escena: https://huggingface.co/buildborderless/CommunityForensics-DeepfakeDet-ViT
- YuNet (OpenCV Zoo): https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet
- Paper de referencia: Park & Owens, *Community Forensics*, CVPR 2025 (referenciado en la model card; sin URL directa en la información disponible)
