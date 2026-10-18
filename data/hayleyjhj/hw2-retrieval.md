# Hayleyjhj/hw2-retrieval

## Resumen

`Hayleyjhj/hw2-retrieval` es un repositorio de Hugging Face que contiene una implementación funcional de una arquitectura **MobileViT** en configuración **tiny**, orientada a tareas de *retrieval* (recuperación multimodal, presumiblemente imagen-texto). Lo publica el usuario Hayleyjhj y se distribuye bajo licencia BSD-3-Clause. No es un modelo entrenado: el propio autor describe `model.safetensors` como un **checkpoint de inicialización válido para smoke tests**, no como un checkpoint con benchmarks. El recuento real de parámetros en safetensors es de **33.088** (treinta y tres mil ochenta y ocho), un orden de magnitud muy inferior al de cualquier MobileViT publicado por Apple (1,3 M–5,6 M), lo que refuerza su carácter de esqueleto de código más que de modelo utilizable.

El interés del repositorio es, por tanto, **pedagógico y de reproducibilidad**: incluye `run.py` como artefacto principal, `config.json` con la configuración de arquitectura generada, `training_args.json` con la receta de experimento por defecto (Adam + scheduler polinómico) y una guía de evaluación explícita que sugiere Flickr30k como primer conjunto de validación. El autor omite deliberadamente cualquier afirmación de rendimiento y advierte de que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

Es relevante ahora como ejemplo de buenas prácticas de documentación honesta en modelos pequeños (estado del repositorio, receta reproducible, ausencia de claims no verificados), y como punto de partida para quien quiera montar un pipeline de retrieval ligero sobre MobileViT con atención de ventana deslizante y fusión con compuertas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (variante tiny), atención de ventana deslizante (*sliding window*), fusión con compuertas (*gated fusion*) |
| Parametros totales | 33.088 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el repositorio no documenta resolución de entrada ni longitud de secuencia) |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors; no se documenta precisión) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch); artefactos adicionales: `run.py`, `config.json`, `training_args.json` |

## Arquitectura y entrenamiento

La arquitectura es MobileViT, un híbrido de convoluciones y atención pensado originalmente para visión en dispositivos móviles. La ficha del autor concreta los siguientes elementos: escala **tiny**, atención con **ventana deslizante**, **fusión con compuertas** entre ramas, activación **mish** y normalización **GroupNorm**. La tarea declarada es *retrieval*, lo que implica una cabeza de embeddings (una o dos torres, no especificado) y una función de pérdida de similitud; el repositorio no detalla si existe torre de texto ni cómo se alinea con la torre visual.

No hay información sobre datos de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF/DPO (poco probable en una tarea de retrieval; lo habitual sería entrenamiento contrastivo, pero **no está documentado**). La receta por defecto registrada en `training_args.json` usa optimizador **Adam** con scheduler **polinómico**, y el autor insiste en que son valores de partida, no evidencia de una ejecución completada. El checkpoint safetensors es una inicialización, por lo que no ha habido entrenamiento efectivo verificable.

Las innovaciones técnicas destacables del repositorio son de ingeniería más que de modelado: separación limpia entre código (`run.py`), configuración de arquitectura (`config.json`) y receta experimental (`training_args.json`), además de una guía de evaluación que exige reportar la métrica de la tarea en **al menos tres semillas** y con una línea base de capacidad equiparable.

## Capacidades

- **Implementación de referencia**: código ejecutable de un MobileViT tiny con bloque `__main__` de smoke test (`python run.py --help`).
- **Retrieval**: la tarea declarada es recuperación; el repositorio no especifica si es imagen-imagen, imagen-texto o texto-texto.
- **Extracción de embeddings**: por la tarea, se espera una cabeza de representación vectorial, aunque el checkpoint no está entrenado.
- **Tool calling / function calling**: no soportado ni documentado.
- **Agentes y razonamiento multi-paso**: no soportado ni documentado.
- **Capacidades multilingües**: no documentadas.
- **Generación de texto, código o matemáticas**: no aplica; no es un modelo de lenguaje.
- **Visión**: es la modalidad natural de MobileViT, pero el repositorio no documenta resolución de entrada ni preprocesado.
- **Modo *thinking*, audio, vídeo**: no disponible.

## Casos de uso

- **Estudio de arquitecturas híbridas conv-attention**: sirve para inspeccionar cómo se implementan atención de ventana deslizante, GroupNorm y activación mish en un MobileViT mínimo, sin la complejidad de un checkpoint preentrenado.
- **Plantilla de proyecto de retrieval**: el repositorio separa código, configuración y receta, de modo que se puede reutilizar la estructura para entrenar un recuperador propio sobre un dataset distinto (por ejemplo, Flickr30k, como sugiere el autor).
- **Smoke test de infraestructura de entrenamiento**: con 33.088 parámetros, el modelo permite validar end-to-end un pipeline (carga de datos, forward, backward, guardado de safetensors) en segundos y en CPU, antes de escalar a un modelo real.
- **Docencia y revisión de código**: útil en un curso o revisión interna para ilustrar qué información debe declarar una model card (estado del repo, receta por defecto, limitaciones) y qué no debe afirmarse sin evidencia.
- **Pruebas de integración con `transformers` u otros frameworks**: el autor advierte de que, al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador explícito; el repo sirve para desarrollar y testear ese adaptador.
- **Prototipado de recuperación en dispositivos con recursos muy limitados**: el tamaño (decenas de miles de parámetros) permite experimentar con despliegue en entornos embebidos, siempre que se asuma que el checkpoint no está entrenado y que habría que entrenarlo con datos propios.
- **Evaluación comparativa reproducible**: la guía del autor propone reportar la métrica en tres semillas con una línea base de capacidad equivalente, lo que convierte el repo en un esqueleto de protocolo experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que «no benchmark score is claimed in this repository» y que el checkpoint no está entrenado, por lo que cualquier cifra sería inaplicable.

| Benchmark | Resultado | Notas |
|---|---|---|
| Flickr30k (retrieval) | no disponible | Propuesto por el autor como primera evaluación recomendada, sin resultados |
| MMLU / HumanEval / GSM8K | no aplica | No es un modelo de lenguaje |

## Requisitos de hardware

- **VRAM estimada para inferencia**: por debajo de 1 GB. Con 33.088 parámetros, los pesos en fp32 ocupan aproximadamente 132 KB; el grueso del consumo vendrá de activaciones y del tamaño de imagen de entrada, no del modelo.
- **GPU recomendadas**: ninguna en particular. Cualquier GPU con soporte CUDA sirve; también es viable en CPU.
- **¿Cabe en GPU de consumo?**: sí, con enorme margen (RTX 3060, RTX 4090, e incluso iGPU).
- **Opciones de despliegue**: PyTorch nativo mediante `run.py`. vLLM, llama.cpp, Ollama y TGI **no aplican** (no es un modelo de lenguaje y no se publican pesos en GGUF). La carga mediante `transformers` requiere un adaptador explícito según el autor.
- **Latencia y throughput**: no disponible. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hayleyjhj/hw2-retrieval` | 33.088 | no disponible | sin benchmarks (checkpoint sin entrenar) | BSD-3-Clause | Hugging Face |
| MobileViT-XXS (publicación original de Apple) | ~1,3 M | clasificación/imagen, según paper | resultados en ImageNet en el paper | según repo original (no verificado aquí) | peso no incluido en este repo |
| MobileViT-S (publicación original de Apple) | ~5,4 M | clasificación/imagen, según paper | resultados en ImageNet en el paper | según repo original (no verificado aquí) | peso no incluido en este repo |
| CLIP ViT-B/32 | ~151 M (visión + texto) | contexto de texto 77 tokens | benchmarks públicos de retrieval zero-shot | MIT (repo original) | pesos públicos |

Nota: los recuentos de MobileViT-XXS/S y de CLIP ViT-B/32 provienen de sus publicaciones y repositorios originales, no de la información proporcionada en esta ficha; se incluyen solo como referencia de escala. No se ha localizado en la información disponible ningún checkpoint de retrieval con 33.088 parámetros comparable.

## Limitaciones y advertencias

- **El checkpoint no está entrenado**: `model.safetensors` es una inicialización para smoke tests. No produce embeddings útiles para retrieval sin un entrenamiento previo.
- **No hay resultados de benchmarks**: cualquier comparación de calidad es imposible con los datos publicados.
- **Sin auditoría de sesgos ni robustez**: el autor indica que no se ha auditado robustez, equidad ni transferencia de dominio.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí en el sentido de que un recuperador sin entrenar devolverá correspondencias sin significado; no debe interpretarse su salida como relevancia real.
- **Idioma y multimodalidad no documentados**: se desconoce si existe torre de texto, qué idiomas cubriría y qué resolución de imagen espera.
- **Integración no estándar**: al ser una implementación propia, las APIs automáticas de carga (por ejemplo `AutoModel.from_pretrained`) requieren un adaptador explícito; no se garantiza compatibilidad con `transformers`.
- **Licencia BSD-3-Clause**: permite uso comercial y modificación con atribución y cláusula de no aval; aun así, el autor recuerda revisar por separado los términos de los datos de origen si se usa con datasets externos.
- **Metadatos incompletos**: el repositorio no declara pipeline en Hugging Face, no tiene descargas ni likes, y su tamaño es de 0,0 GB, lo que dificulta verificar su contenido sin clonarlo.
- **Fecha de creación futura en los metadatos** (2026-10-17): conviene tratar las marcas temporales del repo con cautela.

## Enlaces

- [Modelo en Hugging Face: Hayleyjhj/hw2-retrieval](https://huggingface.co/Hayleyjhj/hw2-retrieval)
- Archivos del repositorio: `run.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` (accesibles desde la pestaña *Files and versions* del enlace anterior)
- Paper de referencia de la arquitectura: MobileViT, *Light-weight, General-purpose, and Mobile-friendly Vision Transformer* (no enlazado en la información proporcionada; no se dispone de URL verificada en esta búsqueda)
- Dataset sugerido para evaluación: Flickr30k (mencionado en la model card, sin enlace aportado)
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales del autor.
