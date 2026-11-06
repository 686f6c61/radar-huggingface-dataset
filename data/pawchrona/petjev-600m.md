# PawChrona/PetJev-600M

## Resumen

PetJev-600M es un modelo multimodal de tipo *decision-model* desarrollado por PawChrona, obtenido mediante *fine-tuning* del modelo base LiquidAI/d1-omni-600M. Con 587.161.089 parámetros (aproximadamente 600M) y pesos en formato safetensors, está diseñado para tareas de extracción de características (*feature-extraction*) y generación imagen-texto-a-texto (*image-text-to-text*), procesando entradas de imagen, audio y vídeo. Se distribuye bajo la licencia LFM 1.0 (etiquetada como "other" en Hugging Face) y soporta únicamente inglés y chino.

El modelo se apoya en la arquitectura del d1-omni de Liquid AI, un modelo omni-modal de la familia D1, y ha sido ajustado sobre el dataset propietario PawChrona/PawChrona-MMQA. Su relevancia radica en ser un ejemplo de especialización de un modelo omni-modal pequeño (600M) hacia tareas de decisión multimodal, un nicho poco cubierto por modelos de este tamaño. No obstante, el acceso está restringido (gated) y el modelo presenta un ecosistema muy incipiente: cero descargas y un único "like" en el momento de la consulta.

Es importante señalar que la información pública disponible es muy limitada: no se han publicado detalles sobre el proceso de entrenamiento, la composición del dataset MMQA, resultados de benchmarks ni guías de uso. Esta ficha se limita a documentar lo que puede verificarse a partir de los metadatos de Hugging Face y las características conocidas del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal omni-modal (basada en LiquidAI/d1-omni-600M; detalles internos no disponibles) |
| Parámetros totales | 587.161.089 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | LFM 1.0 (etiquetada como "other"; acceso restringido/gated) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LiquidAI/d1-omni-600M, un modelo omni-modal de la familia D1 de Liquid AI orientado a procesar imagen, audio y vídeo además de texto. La etiqueta `d1_omni` en los metadatos confirma esta base, y el pipeline `image-text-to-text` junto con las modalidades declaradas (image, audio, video) indican que el modelo mantiene la capacidad de aceptar entradas multimodales y producir salidas de texto. No se dispone de información pública sobre el número de capas, dimensiones ocultas, mecanismo de atención ni detalles del tokenizador multimodal.

En cuanto al entrenamiento, únicamente se sabe que se realizó un *fine-tuning* sobre el modelo base utilizando el dataset PawChrona/PawChrona-MMQA, un conjunto de datos de preguntas y respuestas multimodales propiedad del autor. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO, ni innovaciones técnicas específicas del ajuste. El prefijo "decision-model" en las etiquetas sugiere una orientación hacia tareas de decisión o selección, pero no se aporta ninguna especificación técnica al respecto.

## Capacidades

- Procesamiento multimodal de entrada: imagen, audio y vídeo, según las modalidades declaradas en los metadatos.
- Generación de texto condicionada por entradas multimodales (pipeline `image-text-to-text`).
- Extracción de características (*feature-extraction*), lo que permite usar el modelo como encoder para tareas downstream.
- Orientación a "decision-model": presumiblemente tareas de clasificación, selección o decisión multimodal, aunque no se detalla el mecanismo.
- Soporte de inglés y chino como únicos idiomas declarados.
- No se documenta soporte de *tool calling* / *function calling*.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta modo *thinking*, ni capacidades de visión de alta resolución o audio en streaming más allá de lo implícito en las modalidades.

## Casos de uso

- Clasificación y decisión multimodal: el modelo puede emplearse para tareas de selección o etiquetado a partir de imágenes, audio o vídeo, aprovechando su orientación a "decision-model" y su tamaño compacto (600M) para despliegues de baja latencia.
- Extracción de embeddings multimodales: al soportar `feature-extraction`, puede usarse como encoder para alimentar sistemas de búsqueda, recuperación o clustering sobre contenido visual y audiovisual.
- Análisis de vídeo para moderación o catalogación: con entrada de vídeo, podría procesar clips cortos para generar descripciones o decisiones de clasificación en pipelines de contenido.
- Asistentes de accesibilidad: generación de descripciones texto a partir de imágenes o audio para usuarios con discapacidad visual o auditiva, en inglés o chino.
- Prototipado de investigación en modelos omni-modales pequeños: su tamaño (587M parámetros, repo de 2,3 GB) permite experimentar en una sola GPU consumer con cuantización, aunque no se publican variantes cuantizadas.
- Análisis de audio para transcripción o clasificación de eventos: la modalidad de audio declarada permitiría tareas de etiquetado de sonido o segmentación, siempre que se valide su calidad real.
- Fine-tuning adicional sobre dominios específicos: al ser un modelo pequeño y abierto (con acceso gated), puede servir de base para ajustes en nichos verticales con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,2 GB solo para pesos (587M × 2 bytes), más overhead de activaciones y del procesador multimodal; en la práctica, se recomienda al menos 4-6 GB de VRAM para entradas multimodales.
- En cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits, aproximadamente 0,3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) debería poder alojar el modelo; para producción, A100 o H100 no son necesarias por tamaño, pero pueden aportar throughput.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPUs con 6-8 GB de VRAM, siempre que el procesamiento de vídeo/audio no eleve el consumo.
- Opciones de despliegue: al usar `transformers` con `custom_code`, requiere `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PetJev-600M | 587M | no disponible | imagen, audio, vídeo, texto | LFM 1.0 (gated) | Hugging Face (acceso restringido) |
| LiquidAI/d1-omni-600M (base) | ~600M | no disponible | imagen, audio, vídeo, texto | no disponible en esta ficha | Hugging Face |
| Qwen2-Audio-7B | ~7B | no disponible | audio, texto | Apache 2.0 (según versión) | Hugging Face |
| Phi-3.5-vision | ~4,2B | 128k | imagen, texto | MIT | Hugging Face |

La comparativa es orientativa: PetJev-600M es sustancialmente más pequeño que las alternativas multimodales citadas, lo que reduce requisitos de hardware pero también, presumiblemente, capacidad. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad y el uso en pipelines automatizados.
- Licencia LFM 1.0: es una licencia propia (no OSI) con posibles restricciones para uso comercial; debe revisarse el texto completo antes de desplegar en producción.
- Idiomas limitados a inglés y chino: no hay soporte declarado de castellano ni de otros idiomas, lo que excluye su uso directo en aplicaciones en español.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas multimodales donde la evidencia visual o auditiva es ambigua.
- Sesgos desconocidos: no se documenta la composición del dataset PawChrona-MMQA ni procesos de mitigación de sesgos, por lo que se desconoce su comportamiento en dominios sensibles.
- Falta de documentación técnica: sin detalles de entrenamiento, benchmarks ni guías, es difícil evaluar su calidad real frente al modelo base.
- Ecosistema incipiente: cero descargas y un único "like" en Hugging Face; no hay evidencia de uso en producción ni comunidad de soporte.
- Dependencia de `custom_code`: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor y añade un riesgo de seguridad en entornos no controlados.
- Sin variantes cuantizadas oficiales: dificulta el despliegue en hardware limitado pese al pequeño tamaño del modelo.

## Enlaces

- [Hugging Face: PawChrona/PetJev-600M](https://huggingface.co/PawChrona/PetJev-600M)
- [Modelo base: LiquidAI/d1-omni-600M](https://huggingface.co/LiquidAI/d1-omni-600M)
- [Dataset: PawChrona/PawChrona-MMQA](https://huggingface.co/datasets/PawChrona/PawChrona-MMQA)
- [Licencia LFM 1.0 (referencia de Liquid AI)](https://www.liquid.ai/lfm-license)
