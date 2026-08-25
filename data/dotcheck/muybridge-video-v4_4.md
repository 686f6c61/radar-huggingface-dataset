# DotCheck/muybridge-video-v4_4

## Resumen

Muybridge@4.4 (identificador de hub `DotCheck/muybridge-video-v4_4`) es un sistema de detección de vídeo sintético desarrollado por DotCheck, especializado en estimar la probabilidad de que un clip de vídeo haya sido generado por inteligencia artificial. Se trata de un adaptador sobre el backbone `google/siglip2-base-patch16-224` (Apache-2.0) que combina dos torres SigLIP2 compartidas y un combinador de pila, siguiendo la misma arquitectura de espinas que el modelo de imagen Vermeer@14.2. El modelo produce una puntuación `p ∈ [0,1]` que representa la probabilidad estimada de que el vídeo sea de origen IA.

Este lanzamiento forma parte del stack de producción `inhouse-video@4` de DotCheck y es una evolución de la serie Muybridge, cuyo archivo previo `muybridge-video-v2` queda obsoleto. La relevancia actual del modelo reside en la creciente necesidad de herramientas de verificación de medios frente a la proliferación de vídeos sintéticos. El modelo está disponible bajo licencia Apache-2.0 para las cabezas y espinas de DotCheck, aunque la puntuación de producto se ofrece a través de los servicios de DotCheck (Check o Pro API).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre SigLIP2-base (dos torres compartidas + combinador de pila) |
| Parámetros totales | no disponible (backbone base: google/siglip2-base-patch16-224) |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (clasificación de imagen/vídeo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (no lingüístico; clasificación visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npz` (cabezas y stack), `safetensors` (espinas) |

## Arquitectura y entrenamiento

El modelo procesa cada clip de vídeo mediante una estrategia de muestreo por pares (`pair2 stamps`): se extraen dos vistas por cada sello temporal —una vista de transporte con resolución máxima de lado 256 píxeles (manteniendo la relación de aspecto, JPEG q70) y una vista de centro recortada a 224×224 píxeles nativos (JPEG q85). Cada vista se pasa por una de las dos espinas SigLIP2 compartidas: la espina 13.12 procesa la vista de transporte y la espina 6.6 procesa el centro. Las salidas logit de ambas espinas se combinan mediante un combinador de pila (`stack_w · [z_v, z_j] + stack_b`), seguido de una función sigmoide para obtener la probabilidad por sello. La puntuación final del clip se calcula aplicando un `stamp-cap` con la operación `max` sobre los sellos individuales, en lugar de un `bag p90` como en versiones anteriores.

El conjunto de entrenamiento y validación se describe en la documentación del modelo: los datos de retención (`holdout`) contienen 602 vídeos reales y 180 vídeos generados por IA. No se detalla en la información disponible el número exacto de tokens o épocas de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. La arquitectura está diseñada para funcionar en inferencia sobre CPU mediante un servicio FastAPI (`POST /v1/analyze-pair` con `kind=video`).

## Capacidades

- Detección binaria de contenido de vídeo sintético (IA frente a real) con salida de probabilidad continua entre 0 y 1.
- Procesamiento de vídeos de duración variable: para clips de hasta 180 segundos usa dos sellos internos (33%/67%); para clips más largos, usa `min(12, max(2, floor(dur/60)))` sellos.
- Combinación de dos vistas de entrada (transporte y recorte central) mediante espinas SigLIP2 compartidas, lo que permite capturar tanto contexto global como detalle local.
- Soporte de inferencia en CPU a través de FastAPI, sin requerir GPU para el despliegue básico.
- Diseñado como parte de un ecosistema más amplio de DotCheck que incluye detección de imagen (Vermeer), texto (Valla) y audio (Helmholtz), con posibilidad de fusión de puntuaciones de vídeo y audio en el producto comercial.
- No requiere modelos de lenguaje ni procesamiento de texto; funciona exclusivamente sobre contenido visual.

## Casos de uso

- Moderación de plataformas de vídeo: el modelo puede analizar vídeos subidos por usuarios para detectar contenido sintético (deepfakes, vídeos generados por IA) antes de su publicación, gracias a su salida de probabilidad continua y su capacidad para procesar clips de duración variable.
- Verificación de medios para agencias de noticias: los periodistas pueden enviar vídeos recibidos por fuentes no verificadas al sistema de puntuación de DotCheck (Check o Pro API) para obtener una estimación rápida de si el material es real o generado por IA.
- Auditoría de publicidad y marketing: las marcas pueden comprobar si los vídeos promocionales que reciben de agencias externas han sido generados sintéticamente sin declararlo, lo que puede afectar a la confianza del consumidor.
- Investigación académica sobre deepfakes: el modelo sirve como herramienta de evaluación para investigadores que estudian técnicas de detección de contenido sintético, gracias a su arquitectura abierta y sus datos de retención publicados.
- Sistemas de autenticación de contenido en tiempo real: la capacidad de inferencia en CPU mediante FastAPI permite integrar el modelo en servicios backend que necesiten puntuar vídeos sin depender de GPUs dedicadas.
- Verificación de material de archivo en producción audiovisual: los estudios pueden analizar vídeos de stock o material de terceros para asegurarse de que no contienen segmentos generados por IA no declarados, antes de su uso en producciones comerciales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (evaluación sobre el conjunto de retención `DotCheck video holdout (4.4 homework)`):

| Métrica | Valor |
|---|---|
| P(AI) media en vídeos reales | 0.022 |
| P(AI) media en vídeos IA | 0.976 |
| Exactitud balanceada | 0.9859 |

Nota: el autor indica que estos resultados corresponden a la capa pública de evaluación (Layer A) con umbral de corte en 0.5, y que no deben interpretarse como una prueba de autoría. La puntuación de producto que fusiona vídeo y audio utiliza una vía de puntuación privada (Covenant) que no tiene tabla de reclamaciones públicas.

## Requisitos de hardware

- El tamaño del repositorio es de 3.0 GB, lo que incluye las espinas safetensors y las cabezas `.npz`.
- El modelo se sirve en CPU mediante FastAPI en el producto de DotCheck, lo que sugiere que la inferencia puede ejecutarse en hardware sin GPU.
- La inferencia con SigLIP2-base (aprox. 86M parámetros) en CPU es viable para vídeos cortos con pocos sellos, aunque la latencia dependerá del número de sellos y la resolución de las vistas.
- Para despliegue en GPU, se puede ejecutar con librerías estándar de PyTorch; el modelo no requiere de cuantización específica, aunque se podría aplicar cuantización a las espinas safetensors para reducir memoria.
- Opciones de despliegue: FastAPI en CPU (como indica el autor), o integración en pipelines con PyTorch y Hugging Face Transformers (aunque no se usa `AutoModel.from_pretrained`; se requiere el código de DotCheck).
- No se proporcionan datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DotCheck/muybridge-video-v4_4 | Detección de IA en vídeo | SigLIP2-base | no aplica | Apache-2.0 | Abierto (cabezas) |
| DotCheck/muybridge-video-v2 (archivo) | Detección de IA en vídeo | SigLIP2-base | no aplica | Apache-2.0 | Abierto (archivo) |
| DotCheck/vermeer (imagen) | Detección de IA en imagen | SigLIP2-base | no aplica | Apache-2.0 | Abierto (cabezas) |

No se dispone de comparativa pública con modelos de detección de deepfakes de terceros (p. ej., modelos de detección de vídeo sintético de otras organizaciones) en la información proporcionada. Los modelos comparables de DotCheck comparten la misma base SigLIP2, pero se diferencian en el tipo de entrada (vídeo vs. imagen) y en las estrategias de agregación temporal.

## Limitaciones y advertencias

- El modelo produce estimaciones de probabilidad, no prueba de autoría: el autor indica explícitamente que las puntuaciones son estimaciones bajo este modelo y no constituyen prueba de autoría.
- La evaluación se limita a la capa pública de retención (Layer A) con 602 vídeos reales y 180 vídeos IA; no es una evaluación posterior sobre todos los generadores posibles.
- La agregación de sellos mediante `stamp-cap max` no es un modelo temporal: no modela la evolución temporal del vídeo, solo combina puntuaciones de sellos individuales.
- El modelo no fusiona audio en la puntuación pública; la fusión de vídeo y audio usa una vía privada de DotCheck que no tiene reclamaciones públicas.
- La licencia Apache-2.0 cubre las cabezas de DotCheck en este repositorio, pero el uso del backbone SigLIP2-base está sujeto a la licencia de Google (Apache-2.0 también).
- El modelo no es compatible con `AutoModel.from_pretrained("DotCheck/…")`; la inferencia requiere el código específico de DotCheck o el uso de la API de producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DotCheck/muybridge-video-v4_4
- Organización DotCheck en HuggingFace: https://huggingface.co/DotCheck
- Modelo base SigLIP2: https://huggingface.co/google/siglip2-base-patch16-224
- Documentación DotCheck: https://dotcheck.ai/docs
- PDF Model Card v2026.7: https://dotcheck.ai/media/docs/dotcheck-model-card-v2026.7.pdf
- PDF Technical Report v2026.7: https://dotcheck.ai/docs/dotcheck-technical-report-v2026.7.pdf
- Producto Check: https://dotcheck.ai/check
- Pro API: https://dotcheck.ai/api
