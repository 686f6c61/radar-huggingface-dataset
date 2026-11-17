# Sonam5/OpenVeil-Verifier-DINOv3-ViT-L16

## Resumen

OpenVeil-Verifier-DINOv3-ViT-L16 es un clasificador binario de recortes (crop) que distingue entre "persona" y "no persona", desarrollado por Haiyu Yang y Miel Hostens (Department of Animal Science, Cornell University) como componente del proyecto OpenVeil. OpenVeil es una herramienta que detecta, verifica y aplica mosaico a personas en conjuntos de datos de vídeo antes de su publicación, con el objetivo de preservar la privacidad en datasets de investigación.

El modelo no es un generador de texto ni un LLM: es un adaptador LoRA más una cabeza de clasificación MLP entrenados sobre el backbone DINOv3 ViT-L/16 (LVD-1689M) de Meta. Su función es actuar como verificador de segunda etapa: Grounding DINO propone cajas candidatas y este verificador decide, para cada recorte, si contiene una persona, reduciendo los falsos positivos antes de aplicar el mosaico.

Es relevante en el contexto del cumplimiento de privacidad en la publicación de datasets de vídeo (por ejemplo, grabaciones de granjas o espacios con trabajadores). El repositorio solo distribuye los pesos del adaptador (56,7 MB) y de la cabeza (6,3 MB); el backbone DINOv3 no se incluye y debe obtenerse por separado del repositorio con acceso restringido de Meta bajo la DINOv3 License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L/16 (backbone) + adaptador LoRA (PEFT) + cabeza MLP de clasificación |
| Parametros totales | No disponible (el adaptador LoRA tiene 288 tensores float32, 56.659.384 B; la cabeza, 6 tensores float32, 6.302.184 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada 224 × 224 píxeles) |
| Tipos de cuantizacion | No disponible (pesos distribuidos en float32) |
| Idiomas soportados | No aplica (modelo de visión sin capacidades lingüísticas) |
| Licencia | DINOv3 License (derivada; no Apache-2.0) |
| Formato de pesos | safetensors (adapter_model.safetensors y head.safetensors) |

## Arquitectura y entrenamiento

El modelo se compone de tres piezas: el backbone DINOv3 ViT-L/16 preentrenado en LVD-1689M, un adaptador LoRA de rango 32 y alpha 64 con dropout 0,05 aplicado a todas las capas lineales del backbone (q/k/v/o y proyecciones up/down), y una cabeza MLP con arquitectura 1024 → 1024 → 512 → 2 (ReLU y dropout 0,5 y 0,25 entre capas). La salida es un softmax de dos clases donde el índice 1 corresponde a p(persona). El preprocesado redimensiona el fotograma completo a 1280 px de ancho (interpolación por área), lo hace pasar por un ciclo JPEG a calidad 90, recorta la caja candidata con un 10% de contexto por lado, aplica letterbox a 224 × 224 sobre gris (114), escala a [0, 1] y normaliza con media y desviación típica de ImageNet.

Los datos de entrenamiento provienen de fotogramas de cámaras fijas en naves de terneros de dos granjas (Farm A y Farm B) de un dataset de conducta de juego de terneros (unas 3.700 imágenes de 1.158 vídeos). Las cajas candidatas se generaron con Grounding DINO (prompt `worker. person. cow. calf.`, score ≥ 0,05) y NMS greedy a IoU 0,6, dando 50.756 recortes candidatos, de los cuales 1.444 son personas; los negativos son terneros, vacas, objetos y fondo. El etiquetado se realizó con revisores LLM (dos ciegos más un árbitro) y corrección humana parcial en la herramienta de revisión de OpenVeil. Los recortes y fotogramas de entrenamiento no se distribuyen. El umbral operativo en producción es p(persona) ≥ 0,10, deliberadamente bajo para preferir un falso mosaico antes que una persona no enmascarada.

## Capacidades

- Clasificación binaria de recortes de imagen en persona / no persona (p(persona) por caja).
- Verificación de cajas candidatas propuestas por un detector externo (Grounding DINO) en pipelines de detección de personas.
- Funciona sobre recortes con contexto del 10% y letterbox a 224 × 224, robusto a distintos tamaños y relaciones de aspecto de caja.
- Integración nativa con el pipeline OpenVeil (clase `CropVerifier`, método `score_frames`).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de clasificación.
- No incluye capacidades de visión generativa, audio ni thinking mode.

## Casos de uso

- Anonimización de datasets de vídeo antes de su publicación: el verificador filtra las cajas de Grounding DINO y solo se aplica mosaico a las que superan p(persona) ≥ 0,10, reduciendo el coste de revisión manual en datasets con miles de fotogramas.
- Cumplimiento de privacidad en investigación con grabaciones de espacios con trabajadores: en el caso de estudio, grabaciones de naves de terneros con personal, el verificador permite enmascarar personas antes de liberar el dataset público.
- Preprocesado de datasets para entrenamiento de modelos de visión: elimina o enmascara personas en imágenes de entrenamiento para evitar sesgos y problemas de consentimiento.
- Auditoría de datasets existentes: pasada retrospectiva sobre un corpus de vídeo para cuantificar cuántas cajas de persona contienen y decidir si requieren re-enmascarado.
- Integración en pipelines de publicación de datos (CI/CD de datasets): como etapa de verificación entre el detector y el mosaico, con umbral configurable.
- Filtrado de falsos positivos en detección de personas en entornos ganaderos o industriales, donde el detector confunde terneros, vacas u objetos con personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador (56,7 MB) y la cabeza (6,3 MB) son ligeros, pero requieren cargar el backbone DINOv3 ViT-L/16 (aproximadamente 300 M de parámetros) en float32; se estima un consumo de VRAM en el orden de 1,5–2,5 GB solo para pesos, más activaciones para lotes de recortes de 224 × 224.
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM; se ha probado con `device="cuda"` en la implementación de referencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores, siempre que se disponga de suficiente VRAM para el backbone completo.
- Opciones de despliegue: uso mediante la librería OpenVeil (`openveil.detect.verifier.CropVerifier`) con `transformers` ≥ 4.56 y < 5 y `peft` 0.13.2; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVeil-Verifier-DINOv3-ViT-L16 | Clasificador binario de recortes sobre DINOv3 ViT-L/16 + LoRA | Backbone ~300 M + adaptador LoRA + cabeza MLP | 224 × 224 px | DINOv3 License | Hugging Face (pesos del adaptador y cabeza; backbone aparte) |
| DINOv3 ViT-L/16 (base) | Backbone de visión auto-supervisado | ~300 M | 224 × 224 px (según configuración) | DINOv3 License | Hugging Face (acceso restringido) |
| Grounding DINO | Detector abierto guiado por texto | No disponible | Imagen + prompt de texto | No disponible | Repositorio público |
| CLIP ViT-L/14 | Modelo visión-lenguaje contrastivo | ~428 M | 224 × 224 px | MIT (según variante) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia DINOv3 License: los pesos son obra derivada de DINOv3 y no están bajo Apache-2.0; la licencia del código de OpenVeil (Apache-2.0) no se aplica a estos pesos. Revisar las restricciones de uso comercial de la DINOv3 License antes de cualquier despliegue en producción.
- El backbone DINOv3 no se incluye y requiere aceptar la licencia y autenticarse en el repositorio con acceso restringido de Meta; sin él, los pesos del adaptador no son utilizables.
- Entrenado exclusivamente con fotogramas de naves de terneros de dos granjas: probable sesgo de dominio (iluminación, ángulos de cámara fija, vestimenta de trabajadores) y posible degradación en otros entornos.
- Desbalanceo extremo del dataset de entrenamiento (1.444 positivos de 50.756 candidatos, ~2,8%): el umbral bajo (0,10) prioriza sensibilidad sobre precisión y generará falsos positivos deliberados.
- Dependencia estricta de versiones: `transformers` ≥ 4.56 y < 5; con `transformers` 5 los nombres de módulos de DINOv3 cambian y el adaptador se ignora silenciosamente (PEFT solo emite un aviso), lo que puede producir un modelo sin adaptador en producción.
- El etiquetado se realizó parcialmente con revisores LLM y solo corrección humana parcial: puede contener errores de etiqueta no cuantificados.
- No apto para generación de texto, razonamiento, código ni tareas lingüísticas; su uso fuera de la verificación de recortes de persona no está validado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos y negativos) en recortes ambiguos u ocluidos.

## Enlaces

- Hugging Face: https://huggingface.co/Sonam5/OpenVeil-Verifier-DINOv3-ViT-L16
- Modelo base DINOv3 ViT-L/16: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Repositorio OpenVeil: https://github.com/Sonam525/OpenVeil
- Dataset de conducta de juego de terneros (versión enmascarada): https://huggingface.co/datasets/Sonam5/Calf-Play-Behavior-Dataset
- Paper de referencia (arXiv:2508.10104): https://arxiv.org/abs/2508.10104
