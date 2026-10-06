# MiguelGomesmi/blip-baseline

## Resumen

MiguelGomesmi/blip-baseline es un repositorio experimental publicado en HuggingFace que contiene una implementación propia de una arquitectura Blip (Bootstrapping Language-Image Pre-training) orientada a aprendizaje contrastivo. No se trata de un modelo entrenado ni de un checkpoint de referencia, sino de un artefacto de inicialización cuyo objetivo declarado por el autor es permitir inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

El peso distribuido en safetensors contiene únicamente 33.088 parámetros, una cifra que lo sitúa muy lejos de cualquier modelo Blip operativo (las variantes base y large de Salesforce manejan cientos de millones de parámetros). La model card indica explícitamente que el checkpoint «no ha sido entrenado ni auditado» y que no se reclama ninguna puntuación de benchmark. El repositorio se compone de train.py, config.json, training_args.json y model.safetensors, con licencia Apache 2.0.

Por su naturaleza, es relevante como material de andamiaje para investigación y reproducibilidad, no como modelo listo para producción. Cualquier evaluación seria exigiría entrenar primero el modelo sobre datos reales y compararlo contra una línea base de capacidad equivalente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Blip (vision-language), atención dilatada, fusión con gating (gated fusion), activación gelu, normalización layernorm |
| Parámetros totales | 33.088 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuye un checkpoint de inicialización en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada en la model card sigue el esquema Blip con escala etiquetada como «giant», atención dilatada, fusión mediante gating y activación gelu con layernorm. Blip es, en su formulación original (Li et al., 2022), un marco de preentrenamiento vision-language que combina un codificador de imagen tipo ViT con un codificador de texto y un decodificador de texto, y que aplica *bootstrapping* para filtrar pares imagen-texto ruidosos. El repositorio de MiguelGomesmi se presenta como una reimplementación orientada a tareas contrastivas, pero no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni la estrategia de alineación.

La receta de experimento incluida usa el optimizador Adam con un scheduler de tipo exponencial, valores que el propio autor describe como valores de partida del script y no como evidencia de una ejecución completada. No consta que se hayan aplicado RLHF, DPO ni ninguna otra fase de ajuste. Tampoco se documentan innovaciones técnicas adicionales más allá de los componentes arquitectónicos citados.

## Capacidades

- No dispone de capacidades demostradas: el checkpoint es una inicialización sin entrenar.
- La arquitectura está diseñada para tareas de visión-lenguaje y aprendizaje contrastivo (alineación imagen-texto).
- Codificación de imagen y fusión multimodal mediante gating, según la configuración declarada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): la arquitectura es multimodal imagen-texto por diseño, pero no hay evidencia de funcionamiento entrenado.

## Casos de uso

- Reproducción de arquitecturas Blip en investigación: el repositorio permite inspeccionar una implementación concreta de atención dilatada y gated fusion antes de escalar a un entrenamiento real.
- Pruebas de humo (smoke tests) en pipelines de CI: el checkpoint de inicialización sirve para verificar que el código de carga, serialización y forward propaga correctamente sin consumir recursos.
- Material docente: utilizable para explicar la estructura interna de Blip a nivel de código y configuración, dado su tamaño mínimo.
- Andamiaje de líneas base: punto de partida para construir una línea base contrastiva y compararla, con los mismos datos y semillas, contra variantes ya entrenadas.
- Validación de utilidades de formato: permite comprobar herramientas de conversión y carga de safetensors/PyTorch con un modelo de 33.088 parámetros.
- Experimentación de configuraciones: al registrar la arquitectura en config.json y los hiperparámetros en training_args.json, facilita iterar sobre recetas de entrenamiento sin coste computacional.
- Para casos de uso reales de captioning, VQA o recuperación imagen-texto se requeriría un checkpoint entrenado (por ejemplo, las variantes Blip de Salesforce); este repositorio no cubre esas aplicaciones tal cual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card señala explícitamente que no se reclama ninguna puntuación y que el checkpoint es un artefacto de inicialización no evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB con 33.088 parámetros en fp32 (aproximadamente 132 KB de pesos), aunque cualquier ejecución de visión real dependería del resto del pipeline.
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU consumer e incluso se ejecuta en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3060, RTX 4090, iGPU, etc.), y también en CPU.
- Opciones de despliegue: no disponible. La model card advierte que, al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador explícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos de entrenamiento | Licencia | Estado |
|---|---|---|---|---|---|
| MiguelGomesmi/blip-baseline | 33.088 | no disponible | no entrenado (checkpoint de inicialización) | Apache 2.0 | Publicado, experimental |
| Salesforce Blip base (ViT-B) | no disponible en la información | no disponible | 129M pares imagen-caption | no disponible en la información | Entrenado, uso común en captioning |
| Salesforce Blip large (ViT-L) | no disponible en la información | no disponible | 129M pares imagen-caption | no disponible en la información | Entrenado |

Las variantes de Salesforce están preentrenadas y disponibles para tareas como generación de descripciones de imagen; el repositorio de MiguelGomesmi es una implementación experimental sin entrenamiento, por lo que no son directamente comparables en rendimiento.

## Limitaciones y advertencias

- Checkpoint no entrenado: no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio, según la propia model card.
- Sin benchmarks: no se puede acreditar rendimiento alguno; cualquier cifra futura deberá documentarse aparte de estos valores por defecto.
- Sesgos: no evaluados, al no haberse entrenado con datos.
- Riesgo de alucinación: no aplicable en el estado actual, pero relevante si se entrena sin control de calidad de datos.
- Idiomas y contexto: no declarados; no se puede asumir cobertura multilingüe ni una ventana de contexto concreta.
- Restricciones de licencia: los pesos y el código se publican bajo Apache 2.0, pero el autor recomienda revisar por separado los términos de los datos de origen cuando se usen datasets externos.
- Advertencia de producción: no es adecuado para despliegue en producción en su estado actual; requiere entrenamiento y evaluación previos.
- Integración: al ser una implementación personalizada, requiere un adaptador explícito para las APIs automáticas de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MiguelGomesmi/blip-baseline
- Paper original de BLIP (arXiv 2201.12086): https://arxiv.org/abs/2201.12086
- Introducción a BLIP (GeeksforGeeks): https://www.geeksforgeeks.org/artificial-intelligence/understanding-blip-a-huggingface-model/
- Visión general de blip de Salesforce (aimodels.fyi): https://www.aimodels.fyi/models/replicate/blip-salesforce
- blip-image-captioning-base (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/blip-image-captioning-base-salesforce
- Model card de referencia de blip-image-captioning-base (gizmo-ai): https://huggingface.co/gizmo-ai/blip-image-captioning-base
