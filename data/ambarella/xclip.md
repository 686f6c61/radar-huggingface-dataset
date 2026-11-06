# Ambarella/XCLIP

## Resumen

X-CLIP es un modelo de representación conjunta vídeo-texto que extiende el marco CLIP desde imágenes estáticas hacia vídeo mediante la incorporación de modelado temporal. Desarrollado originalmente por Microsoft Research y publicado en el paper "Expanding Language-Image Pretrained Models for General Video Recognition" (arXiv:2208.02816), el modelo aprende representaciones alineadas entre secuencias de vídeo y descripciones textuales, lo que permite tareas de reconocimiento y comprensión de vídeo sin necesidad de clasificadores específicos por clase.

La variante alojada en este repositorio, XCLIP-B32F8, combina un backbone ViT-Base con parches de 32×32 píxeles y procesa 8 fotogramas por muestra, capturando tanto información de apariencia como de movimiento. Está pensada para clasificación de vídeo, recuperación vídeo-texto, matching multimodal y comprensión zero-shot de vídeo.

Este repositorio concreto, publicado por Ambarella, no contiene los pesos originales en formato PyTorch estándar, sino artefactos compilados para el hardware N1-655 de Ambarella con el SDK Cooper (versiones 2.5.4 y Foundry 2.3). Incluye tres binarios: codificador de vídeo, codificador de texto y post-predictor, todos con compresión de activaciones en fp16. Es, por tanto, un paquete de despliegue en hardware embebido de visión, no un checkpoint listo para usar en PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ViT-Base con modelado temporal (X-CLIP) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa 8 fotogramas de 3×224×224) |
| Tipos de cuantización | activaciones fp16 en los binarios compilados; pesos originales en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | binarios compilados para N1-655 (.bin); pesos de referencia en safetensors (microsoft/xclip-base-patch32) |

## Arquitectura y entrenamiento

X-CLIP sigue el paradigma de CLIP aplicado a vídeo: dos torres independientes, una visual y otra textual, entrenadas con un objetivo contrastivo para alinear representaciones de secuencias de vídeo con sus descripciones textuales. La torre visual emplea un ViT-Base con parches de 32×32 y añade mecanismos de agregación temporal sobre los 8 fotogramas de entrada, lo que permite capturar dinámica además de apariencia. La torre textual procesa las descripciones y se alinea con la representación visual en un espacio común.

El entrenamiento parte de pesos preentrenados de CLIP y se adapta a vídeo mediante entrenamiento contrastivo sobre pares vídeo-texto. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en modelos contrastivos de este tipo). La innovación principal del trabajo original es precisamente la extensión del preentrenamiento imagen-texto a reconocimiento general de vídeo sin clasificador específico.

La versión de este repositorio no es un checkpoint de entrenamiento, sino una compilación para el acelerador N1-655 de Ambarella mediante Cooper SDK 2.5.4 y Cooper Foundry 2.3, con activaciones en fp16.

## Capacidades

- Representación conjunta vídeo-texto para matching y recuperación.
- Clasificación de vídeo zero-shot mediante prompts textuales.
- Recuperación vídeo-texto y texto-vídeo.
- Comprensión espacio-temporal de secuencias de 8 fotogramas a 224×224.
- Extracción de embeddings visuales y textuales alineados.
- No dispone de tool calling ni function calling (modelo contrastivo, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponible en la información proporcionada.
- No es un modelo generativo: no produce texto libre, solo representaciones y puntuaciones de similitud.

## Casos de uso

- Búsqueda semántica de vídeo: indexar embeddings de clips de 8 fotogramas y recuperar por consulta textual, aprovechando el espacio alineado vídeo-texto.
- Clasificación zero-shot de contenido audiovisual: definir clases mediante prompts de texto y puntuar clips sin reentrenar, útil en catalogación de archivos.
- Moderación y filtrado de vídeo: comparar clips contra descripciones de contenido no deseado para triaje automático.
- Detección de eventos en videovigilancia en el borde: desplegado en hardware Ambarella N1-655 con los binarios Cooper, permite etiquetado semántico local con bajo consumo.
- Anotación asistida de datasets de vídeo: generar etiquetas candidatas por similitud texto-vídeo para acelerar el etiquetado humano.
- Recomendación de contenido: calcular similitud entre descripciones de usuario y clips para ranking de recomendaciones.
- Análisis de retransmisiones deportivas o de seguridad: matching de momentos concretos descritos en lenguaje natural sobre secuencias cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los binarios de este repositorio están compilados específicamente para el acelerador Ambarella N1-655; no son ejecutables en GPU convencional.
- Para usar los pesos de referencia en PyTorch se requiere el checkpoint original microsoft/xclip-base-patch32 (safetensors), no incluido aquí.
- VRAM estimada para inferencia con los pesos de referencia: no disponible en la información proporcionada; un ViT-Base con 8 fotogramas suele requerir varios GB en fp16, pero no se confirma dato alguno.
- GPU recomendadas: no disponible; el paquete está orientado a hardware embebido Ambarella, no a A100/H100/RTX.
- Despliegue: Cooper SDK 2.5.4 y Cooper Foundry 2.3 sobre N1-655. Para PyTorch, sería necesario recurrir a la implementación oficial de Microsoft VideoX/X-CLIP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ambarella/XCLIP (esta ficha) | X-CLIP ViT-B/32, 8 frames | 8×3×224×224 | no disponible | binarios N1-655 |
| microsoft/xclip-base-patch32 | X-CLIP ViT-B/32, pesos de referencia | 8×3×224×224 | no disponible | safetensors en HF |
| CLIP (ViT-B/32) | Imagen-texto, sin temporal | 1×3×224×224 | no disponible | ampliamente disponible |
| Otros modelos vídeo-texto (p. ej. VideoCLIP) | Vídeo-texto contrastivo | variable | no disponible | variable |

La diferencia clave frente a CLIP es la dimensión temporal (8 fotogramas frente a imagen única). Frente a los pesos de referencia de Microsoft, esta versión solo aporta valor si se va a desplegar en hardware Ambarella N1-655.

## Limitaciones y advertencias

- El repositorio no contiene pesos utilizables en PyTorch: solo binarios compilados para N1-655, lo que limita su uso fuera de ese hardware.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene consultar la licencia del modelo original de Microsoft antes de producción.
- Modelo contrastivo, no generativo: no produce texto, no razona y no soporta tool calling.
- Ventana temporal fija de 8 fotogramas: puede perder eventos de larga duración o dependencias temporales extensas.
- Riesgo de sesgo heredado del dataset de preentrenamiento de CLIP y del corpus vídeo-texto original, no documentado en esta ficha.
- Posible degradación en dominios muy alejados del entrenamiento (p. ej. visión térmica, cámaras industriales).
- Idiomas soportados no documentados; el rendimiento textual depende del tokenizador original de CLIP.
- Sin benchmarks publicados en este repositorio: no hay evidencia de rendimiento específica para esta compilación.
- Descargas muy bajas (6) y sin likes: ecosistema de validación prácticamente nulo.

## Enlaces

- Hugging Face: https://huggingface.co/Ambarella/XCLIP
- Paper original: https://arxiv.org/abs/2208.02816
- Código oficial X-CLIP (Microsoft VideoX): https://github.com/microsoft/VideoX/tree/master/X-CLIP
- Pesos de referencia: https://huggingface.co/microsoft/xclip-base-patch32
- Codificador de vídeo N1-655: https://huggingface.co/Ambarella/XCLIP/blob/main/n1-655_xclip_b32f8_video_encoder_act16.bin
- Codificador de texto N1-655: https://huggingface.co/Ambarella/XCLIP/blob/main/n1-655_xclip_b32f8_text_encoder_act16.bin
- Post-predictor N1-655: https://huggingface.co/Ambarella/XCLIP/blob/main/n1-655_xclip_b32f8_post_predictor_act16.bin
