# chandlerWang/BruNet

## Resumen

BruNet es un modelo de segmentación de imágenes médicas desarrollado por el usuario chandlerWang, presentado en el artículo *BruNet: A Cross-Domain Transfer Framework for Bruise Segmentation*. El modelo aborda un problema concreto: segmentar hematomas (moratones) en fotografías sin haber sido entrenado con ninguna imagen de hematomas ni requerir prompts de ningún tipo. Para ello emplea transferencia entre dominios, entrenándose exclusivamente con máscaras de lesiones cutáneas del dataset HAM10000 y aplicando el modelo resultante a la segmentación de moratones.

La arquitectura combina un codificador ViT-B/16 (en dos variantes: LingBot-Vision y DINOv3), un adaptador convolucional que proyecta la rejilla de tokens a un espacio compatible con el decodificador de SAM ViT-B, y un decodificador de máscaras tipo SAM inicializado aleatoriamente con actualizaciones LoRA de rango 8. El modelo completo contiene 92 millones de parámetros en fp32 (368 MB por variante) y produce un mapa de logits de 224 × 224 que se reescala al tamaño de la imagen de entrada.

Su relevancia radica en que demuestra que es posible segmentar una patología (hematomas) sin datos anotados de esa patología, usando únicamente máscaras de otra tarea relacionada (lesiones cutáneas) y sin intervención de texto o prompts. La variante LingBot alcanza un F1 de 0,8911 e IoU de 0,8251 sobre 86 fotografías de hematomas, mientras que la variante DINOv3 obtiene 0,8081 y 0,7289 respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 (encoder) + adaptador convolucional + decodificador SAM ViT-B con LoRA |
| Parametros totales | 92 M (fp32, 368 MB por variante) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 512×512 o 224×224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | cc |
| Formato de pesos | safetensors (state_dict completo en fp32) |

## Arquitectura y entrenamiento

BruNet es un transformer de visión con arquitectura híbrida encoder-adaptador-decoder. El codificador es un ViT-B/16 en dos variantes: LingBot-Vision, que procesa entradas de 512 × 512 y produce una rejilla de 32 × 32 tokens, y DINOv3, que procesa 224 × 224 y produce 14 × 14 tokens. El adaptador proyecta la rejilla a 256 canales, la sobremuestrea bilinealmente a 56 × 56 y aplica dos bloques convolucionales 3 × 3 con GroupNorm de 8 grupos y activación GELU, generando una salida con la forma de la embedding de imagen de SAM ViT-B. El decodificador replica la arquitectura del mask decoder de SAM ViT-B pero se inicializa aleatoriamente (no se cargan pesos de SAM); sus 44 capas lineales permanecen en su inicialización aleatoria y reciben actualizaciones LoRA de rango 8, mientras que las capas de normalización, tokens de salida, embeddings de prompt y convoluciones de upscaling se entrenan directamente. El modelo no usa prompt: el prompt disperso contiene solo el token de padding de SAM y el prompt denso su embedding no-mask, idéntico para todas las imágenes.

El entrenamiento se realizó exclusivamente con máscaras de lesiones de HAM10000: 7.010 imágenes de entrenamiento, cada una usada tal cual y tras aplicar Multi-Scale Retinex with Chromaticity Preservation (MSRCP), totalizando 14.020 muestras. No se usó ninguna imagen de hematomas para entrenamiento, selección de checkpoint ni elección de umbral. Se empleó AdamW en bfloat16 con pérdida Dice más entropía cruzada binaria, sin encoder de texto ni pérdida auxiliar. La variante DINOv3 se entrenó 150 épocas a learning rate 2e-5 sobre recortes de 224 × 224 con batch 64; la variante LingBot se entrenó 10 épocas con el backbone congelado y luego 40 épocas descongelado (backbone 3e-6, adaptador 2e-5, LoRA 3e-4) sobre recortes de 512 × 512 con batch 8 y 8 pasos de acumulación de gradiente. El checkpoint seleccionado fue el de menor pérdida de entrenamiento: época 148 de 150 (DINOv3) y época 40 de las 40 descongeladas (LingBot).

## Capacidades

- Segmentación de hematomas en fotografías sin necesidad de prompts ni etiquetas de hematomas durante el entrenamiento.
- Segmentación de lesiones cutáneas (entrenado con máscaras de HAM10000).
- Salida de un mapa de logits a 224 × 224 que se reescala al tamaño original de la imagen y se umbraliza a 0,5 para obtener la máscara binaria.
- Dos variantes de codificador con distintos compromisos resolución/rendimiento: LingBot (512 × 512, mayor F1) y DINOv3 (224 × 224, menor coste computacional).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual de segmentación.
- No soporta modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Triaje dermatológico asistido: el modelo puede presegmentar hematomas en fotografías clínicas para que un profesional revise la máscara, aprovechando que no requiere anotaciones de hematomas para funcionar.
- Documentación forense preliminar: dado que segmenta moratones sin entrenamiento específico, puede usarse como herramienta de apoyo en la delimitación inicial de lesiones en fotografías, siempre con validación humana y sin valor probatorio.
- Investigación en transferencia entre dominios: sirve como caso de estudio reproducible para evaluar cómo un modelo entrenado en máscaras de lesiones cutáneas generaliza a hematomas, con código y pesos disponibles.
- Preprocesado en pipelines de análisis de imágenes médicas: la máscara de hematoma generada puede alimentar etapas posteriores de medición de área, seguimiento de evolución temporal o clasificación.
- Aplicaciones de telemedicina: integración en flujos donde el paciente envía una fotografía y el sistema resalta la región del moratón para priorizar la revisión por parte del especialista.
- Evaluación comparativa de encoders de visión: las dos variantes (LingBot y DINOv3) permiten comparar el impacto del codificador y de la resolución de entrada en una tarea de segmentación downstream.
- Docencia y reproducción de experimentos: el repositorio incluye configuraciones y scripts de evaluación (`scripts/eval_dual_region.py`) que facilitan replicar los resultados publicados.

## Benchmarks y rendimiento

Resultados sobre 86 fotografías de hematomas (256 × 256), con dos contornos expertos por imagen (banda entre contorno interno y externo ignorada), umbral 0,5, métricas calculadas por imagen y promediadas:

| Modelo | Precision | Recall | F1 | IoU | Accuracy |
|---|---:|---:|---:|---:|---:|
| BruNet-LingBot | 0,9126 | 0,9003 | 0,8911 | 0,8251 | 0,9583 |
| BruNet-DINOv3 | 0,7793 | 0,9202 | 0,8081 | 0,7289 | 0,9181 |

Validación en HAM10000 (1.502 imágenes, ambas vistas) con Dice a umbral 0,5: LingBot 0,9559; DINOv3 0,9579. Para ambos modelos, 0,5 es el umbral que maximiza Dice en esta partición entre diez valores de 0,5 a 0,999.

No se han publicado resultados comparativos con otros modelos de segmentación de hematomas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos son 368 MB en fp32 por variante; con activaciones y el codificador ViT-B/16, se estima un consumo moderado, aunque no se proporcionan cifras oficiales de VRAM.
- GPU recomendadas: no especificadas en la información disponible; por tamaño (92 M de parámetros) cabe en GPUs de consumo, aunque no se detallan modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño reducido del modelo (92 M de parámetros), si bien no se confirman modelos concretos.
- Opciones de despliegue: requiere el paquete de código `clipdinosam`; la variante LingBot necesita además el paquete `lingbot-vision` fijado en `requirements-lingbot.txt`. El ejemplo de uso de la model card ejecuta en CPU con PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BruNet (LingBot) | 92 M | 512 × 512 | Segmentación de hematomas sin prompt | cc | Hugging Face |
| BruNet (DINOv3) | 92 M | 224 × 224 | Segmentación de hematomas sin prompt | cc | Hugging Face |
| SAM ViT-B | no disponible en la información | no disponible | Segmentación promptable genérica | no disponible | no disponible |

No se dispone de datos de benchmarks de SAM ViT-B ni de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Evaluado únicamente sobre 86 fotografías de hematomas; no se recogieron etiquetas por tono de piel ni edad, por lo que el sesgo demográfico es desconocido.
- Uso exclusivo en investigación; no validado para uso clínico ni forense.
- Riesgo de alucinación de máscaras en imágenes fuera de la distribución de entrenamiento (fotografías de hematomas no representadas en el conjunto de evaluación).
- La licencia "cc" no especifica la variante concreta (CC BY, CC BY-NC, etc.), lo que genera incertidumbre sobre las restricciones de uso comercial; debe verificarse antes de cualquier despliegue en producción.
- El modelo no acepta prompts, por lo que no es posible guiar la segmentación con indicaciones del usuario.
- Requiere código externo (`clipdinosam` y, para LingBot, `lingbot-vision`) no incluido en el repositorio de pesos, lo que añade dependencias de despliegue.
- El script `scripts/eval_dual_region.py` espera un checkpoint PyTorch, por lo que es necesario convertir los pesos safetensors previamente.
- Sin datos publicados de latencia, throughput ni consumo de VRAM, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chandlerWang/BruNet
- Artículo: https://arxiv.org/html/2609.11463v1
- Variante LingBot: https://huggingface.co/chandlerWang/BruNet/tree/main/lingbot
- Variante DINOv3: https://huggingface.co/chandlerWang/BruNet/tree/main/dinov3
