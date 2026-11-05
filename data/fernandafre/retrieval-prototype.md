# fernandafre/retrieval-prototype

## Resumen

`fernandafre/retrieval-prototype` es un repositorio experimental que implementa una arquitectura Swin Transformer (variante Swin-T) orientada a tareas de recuperación (retrieval) multimodal. Lo publica el usuario `fernandafre` en HuggingFace bajo licencia Apache 2.0. No se trata de un modelo entrenado ni de un checkpoint con resultados publicados: la model card lo describe explícitamente como una implementación funcional con fines de prueba de humo (smoke test) y reproducibilidad, sin reclamaciones de rendimiento.

El repositorio contiene el código de inferencia (`inference.py`), la configuración de arquitectura (`config.json`), los hiperparámetros por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`). El recuento real de parámetros en safetensors es de 24.832, lo que indica que el checkpoint publicado no corresponde a un Swin-T completo (que rondaría decenas de millones de parámetros), sino a una inicialización mínima o parcial.

Su relevancia es limitada como modelo de producción: sirve como punto de partida reproducible para experimentar con retrieval visual, no como artefacto listo para desplegar. Cualquier evaluación seria requeriría entrenamiento previo sobre un dataset como Flickr30k, tal y como sugiere la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (Swin-T), atencion flash, fusion concat MLP, activacion ReLU, normalizacion BatchNorm |
| Parametros totales | 24.832 (segun safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicializacion) |

## Arquitectura y entrenamiento

La arquitectura declarada es Swin-T (Swin Transformer Tiny), un transformer jerarquico con ventanas desplazadas, adaptado aqui para una tarea de retrieval mediante una cabeza de fusion basada en concatenacion y MLP. La configuracion incluye atencion flash, activacion ReLU y normalizacion BatchNorm, lo que se aparta de la configuracion canonica de Swin (que usa GELU y LayerNorm), lo que sugiere una implementacion personalizada y no un port directo.

No hay evidencia de entrenamiento completado. La receta por defecto usa el optimizador Lion con un scheduler de tipo step, pero la model card aclara que son valores de partida del script y no resultado de una ejecucion. El checkpoint `model.safetensors` se presenta como inicializacion valida para pruebas de humo, no como pesos entrenados. No se documentan volumen de tokens, composicion del dataset, ni fases de RLHF/DPO.

## Capacidades

- Recuperacion (retrieval) multimodal: el repositorio esta orientado a tareas de matching entre modalidades, aunque sin pesos entrenados no hay capacidad efectiva demostrada.
- Vision por computador: al basarse en Swin Transformer, la columna vertebral esta pensada para procesar imagenes.
- Ejecucion de scripts de inferencia: incluye `inference.py` con bloque `__main__` para pruebas de humo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado de pipelines de retrieval visual: usar el repositorio como esqueleto para montar un sistema de busqueda imagen-texto, sustituyendo el checkpoint por pesos entrenados en un dataset propio.
- Pruebas de humo en CI: ejecutar `python inference.py --help` y el bloque `__main__` para verificar que el entorno (PyTorch, safetensors, atencion flash) esta correctamente configurado antes de invertir en entrenamiento.
- Base para experimentos academicos de retrieval: la receta Lion + step y la estructura de `training_args.json` permiten lanzar comparativas controladas con baselines de capacidad equivalente sobre Flickr30k.
- Reproducibilidad de configuraciones: `config.json` documenta los ajustes de arquitectura, util para auditar decisiones de diseno (fusion concat MLP, BatchNorm, ReLU) frente a implementaciones canonicas de Swin.
- Integracion como modulo de extraccion de caracteristicas: el backbone Swin-T puede reutilizarse en pipelines de vision (clasificacion, deteccion) tras un entrenamiento adecuado, aunque requiere adaptar la cabeza de retrieval.
- Docencia y formacion: sirve como ejemplo didactico de como estructurar un repositorio de modelo en HuggingFace con separacion entre codigo, configuracion, receta de entrenamiento y checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna puntuacion y que una evaluacion util requeriria Flickr30k con al menos tres semillas y un baseline de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 24.832 parametros el checkpoint es trivial y cabe en cualquier GPU, pero un Swin-T completo (decenas de millones de parametros) requeriria del orden de 1-2 GB en FP16 para inferencia.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) seria suficiente para el checkpoint publicado; para entrenamiento de un Swin-T completo se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, el checkpoint de inicializacion cabe en cualquier GPU e incluso en CPU.
- Opciones de despliegue: al ser una implementacion custom, las APIs genericas de carga automatica requieren un adaptador explicito; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLMs, no aplicables aqui).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento retrieval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fernandafre/retrieval-prototype | 24.832 (checkpoint init) | no disponible | sin benchmarks | Apache 2.0 | HuggingFace |
| Swin-T oficial (microsoft/swin-tiny-patch4-window7-224) | ~28 M | no aplica (vision) | no disponible en esta ficha | MIT | HuggingFace |
| CLIP ViT-B/32 (openai/clip-vit-base-patch32) | ~151 M | 77 tokens de texto | benchmarks publicos en retrieval | MIT | HuggingFace |

La comparativa es orientativa: el repositorio analizado no es un modelo entrenado, por lo que la comparacion directa de rendimiento no es posible.

## Limitaciones y advertencias

- El checkpoint publicado no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio; la propia model card lo advierte.
- Riesgo elevado de resultados sin sentido si se usa directamente para retrieval: los pesos son de inicializacion, no aprendidos.
- No hay datos de sesgos, alucinacion ni comportamiento multilingue porque no hay evaluacion.
- La licencia Apache 2.0 permite uso comercial del codigo, pero deben revisarse por separado los terminos de los datasets externos que se usen para entrenar.
- La implementacion es custom: las APIs automaticas de carga de HuggingFace pueden fallar sin un adaptador explicito.
- El recuento de parametros (24.832) es inconsistente con un Swin-T completo; conviene verificar la integridad del checkpoint antes de cualquier uso.
- No apto para produccion en su estado actual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fernandafre/retrieval-prototype
- Paper original de Swin Transformer: https://arxiv.org/abs/2103.14030
- Dataset sugerido para evaluacion (Flickr30k): https://shannon.cs.illinois.edu/DenotationGraph/
- Documentacion de safetensors: https://github.com/huggingface/safetensors
