# AdvaitRedd/clip-baseline

## Resumen

AdvaitRedd/clip-baseline es un repositorio experimental que contiene una implementación personalizada de una arquitectura CLIP (Contrastive Language-Image Pre-training) orientada a tareas de recuperación (retrieval) multimodal. Lo publica el usuario AdvaitRedd en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo entrenado ni de un checkpoint con resultados publicados: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests) y que no se reclama ninguna puntuación de benchmark.

El interés del repositorio es fundamentalmente pedagógico y de ingeniería: sirve como base reproducible para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. Incluye el código (`finetune.py`), la configuración de arquitectura (`config.json`) y la receta de experimento por defecto (`training_args.json`), lo que permite auditar el diseño y adaptarlo.

El recuento de parámetros reportado en safetensors es de 33.088, un valor anómalamente bajo para una configuración etiquetada como "large", lo que refuerza la interpretación de que se trata de un esqueleto de inicialización y no de un modelo funcional a escala real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (contrastivo texto-imagen), atención de ventana deslizante, fusión tipo Tucker, activación ReLU, normalización GroupNorm |
| Parametros totales | 33.088 (según safetensors; incoherente con la escala "large" declarada, ver limitaciones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización), código Python (`finetune.py`), configuración JSON |

## Arquitectura y entrenamiento

La arquitectura declarada es CLIP con escala "large", atención de ventana deslizante, fusión Tucker entre modalidades, activación ReLU y normalización GroupNorm. Se trata de una implementación propia, no de una variante estándar de CLIP de OpenAI, por lo que las APIs genéricas de carga automática requieren un adaptador explícito para funcionar con estos pesos.

No hay evidencia de entrenamiento completado. La receta por defecto usa el optimizador RMSprop con un scheduler OneCycle, pero la model card aclara que son valores de partida del script y no prueba de una ejecución finalizada. No se documentan volumen de tokens, composición del dataset, ni fases de RLHF/DPO. La evaluación sugerida por el autor es Flickr30k, reportando la métrica de la tarea en al menos tres semillas y con una línea base de capacidad equivalente.

## Capacidades

- Recuperación multimodal texto-imagen e imagen-texto (objetivo declarado del repositorio).
- Entrenamiento y ajuste fino mediante `finetune.py` con receta configurable.
- Punto de partida para pruebas de humo e inspección de cambios de arquitectura.
- No hay evidencia de capacidades de generación de texto, razonamiento, código, matemáticas, visión generativa, tool calling, agentes ni modo thinking.
- Soporte multilingüe: no disponible.

## Casos de uso

- Investigación de arquitecturas CLIP: usar el repositorio como banco de pruebas para modificar atención de ventana deslizante o fusión Tucker y comparar contra una línea base estándar antes de invertir en un entrenamiento completo.
- Reproducibilidad de experimentos: `training_args.json` y `config.json` permiten fijar semillas, hiperparámetros y versiones de entorno para replicar resultados con otras líneas base.
- Evaluación en Flickr30k: emplear la guía del autor para medir recuperación texto-imagen con al menos tres semillas y una línea base de capacidad equivalente.
- Docencia y formación: material didáctico para explicar cómo se estructura un pipeline CLIP de recuperación, desde la configuración hasta el script de ajuste fino.
- Integración en pipelines propios: servir como esqueleto sobre el que añadir un adaptador explícito de carga y sustituir el checkpoint de inicialización por pesos entrenados.
- Auditoría de código: revisar `finetune.py` para validar decisiones de normalización, activación y fusión antes de adoptarlas en un proyecto mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada: no disponible. El recuento de parámetros reportado (33.088) es incompatible con la escala "large" declarada, por lo que no es posible estimar requisitos fiables.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos actuales.
- Opciones de despliegue: el autor indica que las APIs genéricas de carga automática requieren un adaptador explícito; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdvaitRedd/clip-baseline | 33.088 (reportado) | no disponible | No (inicialización) | Apache 2.0 | Hugging Face |
| CLIP de OpenAI (ViT-L/14) | ~428 M | 77 tokens de texto | Sí | MIT (código) / uso de pesos según términos | Hugging Face, repositorio oficial |
| OpenCLIP (ViT-L/14) | ~428 M | 77 tokens de texto | Sí | MIT / Apache 2.0 según variante | Hugging Face, GitHub |

La comparación es orientativa: los modelos de referencia son checkpoints entrenados y auditados, mientras que este repositorio es un esqueleto experimental sin entrenamiento. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicialización para pruebas de humo, no un modelo entrenado; no debe usarse en producción.
- No se ha auditado robustez, equidad ni transferencia de dominio.
- El recuento de parámetros reportado (33.088) es incoherente con la escala "large" declarada, lo que sugiere una configuración incompleta o un artefacto de serialización.
- Requiere un adaptador explícito para cargarse con APIs genéricas; no es plug-and-play.
- Riesgo de alucinación y sesgos: no evaluables sin entrenamiento ni datos de evaluación.
- Licencia Apache 2.0 permite uso comercial del código, pero los términos de los datasets externos deben revisarse por separado.
- Cualquier resultado futuro debe documentarse de forma separada a los valores por defecto incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/AdvaitRedd/clip-baseline
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
