# kara1983/retrieval-experiments

## Resumen

`kara1983/retrieval-experiments` es un repositorio de Hugging Face publicado por el usuario kara1983 que contiene una implementación funcional de CLIP orientada a tareas de recuperación (retrieval) imagen-texto. No se trata de un modelo entrenado y publicado para uso productivo, sino de un punto de partida experimental: el propio autor indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests) y no un checkpoint con benchmark completado.

La relevancia de este repositorio es metodológica más que de rendimiento. Aporta código transparente y repetible (`pipeline.py`, `config.json`, `training_args.json`) con una configuración declarada como "giant" y una receta por defecto basada en el optimizador Lion con planificador OneCycle. El autor evita deliberadamente cualquier afirmación de benchmark y recomienda evaluar sobre Flickr30k con al menos tres semillas y una línea base de capacidad equivalente. Esto lo convierte en un artefacto útil para reproducir experimentos de retrieval, no para desplegar en producción.

El modelo declara arquitectura CLIP con atención dilatada, fusión bilineal, activación mish y normalización groupnorm. Los metadatos de safetensors reportan 33.088 parámetros, una cifra que resulta incoherente con la escala "giant" descrita y que debe tratarse con cautela. No hay información sobre idiomas soportados, pipeline declarado, longitud de contexto ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (image-text contrastive) con configuracion "giant" |
| Parametros totales | 33.088 (dato reportado por metadatos de safetensors; cifra ambigua) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors; no hay GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Detalles adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Atencion | dilatada |
| Fusion | bilineal |
| Activacion | mish |
| Normalizacion | groupnorm |
| Optimizador por defecto | Lion |
| Planificador por defecto | OneCycle |
| Tamano del repositorio | 0,0 GB |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

La arquitectura declarada es CLIP, un modelo de doble torre que aprende representaciones conjuntas de imagen y texto mediante un objetivo contrastivo. La model card especifica variantes concretas respecto al CLIP original: atención dilatada, fusión bilineal de las representaciones de ambas modalidades, función de activación mish y normalización mediante groupnorm. La configuración se etiqueta como "giant", aunque no se detalla el número de capas, dimensión de embedding, número de cabezas de atención ni resolución de imagen de entrada. En consecuencia, no es posible verificar la escala real del modelo a partir de la información disponible.

Respecto al entrenamiento, el repositorio únicamente documenta una receta por defecto (Lion + OneCycle) que el autor describe como valores de arranque del script y no como evidencia de una ejecución completada. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otros ajustes de alineamiento. El autor recomienda explícitamente que, para una evaluación significativa, todas las líneas base se entrenen con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias. No se describe ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

El repositorio está diseñado para tareas de retrieval imagen-texto, pero al tratarse de un checkpoint de inicialización sin entrenamiento completado, sus capacidades efectivas quedan limitadas a la verificación de que la implementación se ejecuta correctamente.

- Recuperación imagen-texto y texto-imagen: el objetivo declarado de la arquitectura CLIP es proyectar imágenes y textos a un espacio compartido para búsqueda cruzada.
- Codificación multimodal: implementa dos torres (visual y textual) con fusión bilineal, pensada para combinar características de ambas modalidades.
- Ejecución de pruebas de humo: `pipeline.py` incluye un bloque `__main__` con un ejemplo ejecutable (`python pipeline.py --help`) para comprobar que el modelo se instancia y propaga correctamente.
- Reproducibilidad experimental: la separación entre `config.json` (arquitectura) y `training_args.json` (receta) facilita repetir experimentos con parámetros controlados.
- Tool calling / function calling: no soportado.
- Capacidades de agente y razonamiento multi-paso: no soportadas.
- Generación de texto libre: no es una capacidad del modelo; CLIP no está diseñado para generación autoregresiva.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Modo de razonamiento (thinking mode), visión generativa o audio: no disponibles.

## Casos de uso

- Base para un sistema de búsqueda visual: partir de esta implementación para construir un índice de embeddings de imágenes y recuperar las más similares a una consulta textual. Es adecuado como esqueleto de código, pero requiere entrenamiento previo sobre un corpus real antes de ofrecer resultados útiles.
- Reproducción de experimentos académicos de retrieval: el repositorio está pensado para que un investigador repita pruebas controladas con la misma exposición de datos y semillas, útil en trabajos que comparan variantes de CLIP.
- Evaluación comparativa de funciones de activación y normalización: al usar mish y groupnorm en lugar de las elecciones habituales, sirve para estudiar el impacto de estas decisiones en tareas de recuperación.
- Banco de pruebas de recetas de optimización: la combinación Lion + OneCycle puede evaluarse frente a AdamW y planificadores alternativos manteniendo la arquitectura fija.
- Punto de partida para fine-tuning sobre dominios específicos: dado que el checkpoint es una inicialización, puede emplearse como estado de partida para ajuste sobre catálogos de producto, bancos de imágenes médicas o archivos fotográficos.
- Integración en un pipeline educativo: el conjunto de archivos (`pipeline.py`, `config.json`, `training_args.json`) permite explicar la separación entre definición de arquitectura, datos y receta de entrenamiento en un contexto docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ninguna puntuación de benchmark y que el checkpoint `model.safetensors` no debe presentarse como un modelo entrenado. El autor sugiere que una primera evaluación razonable usaría Flickr30k, reportando la métrica de la tarea a lo largo de al menos tres semillas e incluyendo una línea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No es posible calcularla de forma fiable porque el número de parámetros reportado (33.088) no concuerda con la escala "giant" declarada ni se especifican dimensiones de capas.
- GPU recomendadas: no disponible por la misma razón. Si el recuento real de parámetros fuese de decenas de miles, la inferencia cabría en CPU sin GPU.
- Compatibilidad con GPU de consumo: indeterminada. No se puede confirmar si cabe en una RTX 4090, 3090 u otras tarjetas de consumo sin conocer el tamaño real del modelo.
- Opciones de despliegue: el autor advierte que, al ser una implementación personalizada, las API genéricas de carga automática requieren un adaptador explícito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; llama.cpp y Ollama quedarían además descartados al no distribuirse pesos en formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a características estructurales y de licencia. Los valores de rendimiento de las alternativas se incluyen solo como referencia general y no proceden de una evaluación conjunta con este repositorio.

| Modelo | Arquitectura | Contexto / entrada | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| kara1983/retrieval-experiments | CLIP "giant" (dilatada, bilineal, mish, groupnorm) | no disponible | apache-2.0 | Hugging Face, checkpoint de inicializacion | sin benchmarks publicados |
| CLIP ViT-L/14 (OpenAI) | CLIP estandar | imagen 224x224, texto 77 tokens | licencia propia de OpenAI | pesos publicos | benchmarks publicos disponibles |
| OpenCLIP (varias escalas) | CLIP con variantes de entrenamiento | segun configuracion | segun variante (MIT, Apache-2.0, etc.) | Hugging Face / GitHub | benchmarks publicos (LAION) |
| SigLIP | ViT + sigmoid loss | segun configuracion | Apache-2.0 en varias versiones | Hugging Face | benchmarks publicos |

La comparación directa de rendimiento con estas alternativas no es posible con la información disponible, ya que el repositorio analizado no reporta ninguna métrica.

## Limitaciones y advertencias

- Checkpoint sin entrenar: `model.safetensors` es una inicialización para pruebas de humo, no un modelo con pesos ajustados. No debe usarse para inferencia real ni para producir resultados que se presenten como válidos.
- Ausencia de auditoría: el autor indica que el checkpoint no ha sido auditado en términos de robustez, equidad ni transferencia de dominio.
- Sin datos de sesgo: no se documenta ninguna evaluación de sesgos, y al no existir datos de entrenamiento declarados no es posible inferir su comportamiento en colectivos o dominios concretos.
- Riesgo de alucinación: no aplica en el sentido generativo clásico, pero un modelo de retrieval mal ajustado puede devolver correspondencias imagen-texto incorrectas con alta confianza aparente.
- Ambigüedad en el recuento de parámetros: la cifra de 33.088 reportada por safetensors es incompatible con la escala "giant" descrita, lo que impide estimar requisitos de memoria y cómputo con fiabilidad.
- Idiomas no declarados: no hay información sobre el soporte lingüístico del codificador de texto.
- Carga no estándar: al ser una implementación propia, no funciona con las API automáticas habituales de `transformers` sin escribir un adaptador.
- Licencia: el código y los pesos se publican bajo apache-2.0, lo que permite uso comercial, pero el autor recomienda revisar por separado los términos de los datasets externos que se utilicen con el repositorio.
- Idoneidad para producción: nula en su estado actual. Cualquier resultado derivado de un futuro checkpoint entrenado deberá documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kara1983/retrieval-experiments
- Otro repositorio del mismo autor: https://huggingface.co/kara1983/multitask
- Articulo "Retrieval-Augmented Language Model for Knowledge-aware Protein Encoding" (ICML 2025, dominio de proteinas; sin relacion confirmada con este repositorio): https://proceedings.mlr.press/v267/zhang25cz.html
- Ficha del articulo anterior en Bytez: https://bytez.com/docs/icml/45183/paper
- Poster del articulo en ICML: https://icml.cc/virtual/2025/poster/45183
- Diapositivas del articulo en ICML (PDF): https://icml.cc/media/icml-2025/Slides/45183_Yy64bly.pdf
