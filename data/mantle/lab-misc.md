# ManTle/lab-misc

## Resumen

`ManTle/lab-misc` no es un modelo generativo listo para uso, sino un repositorio de artefactos de investigación procedentes de un experimento de preentrenamiento de modelos de vídeo. El snapshot contiene resultados de evaluación downstream (VBench) para cuatro recetas de datos con tres réplicas cada una, así como logs de sondas congeladas sobre representaciones V-JEPA en tareas SSv2, K400 e IntPhys2. Además, incluye un único checkpoint consolidado del transformer de Wan 2.1 1.3B, correspondiente a la receta "Mixed", semilla de entrenamiento 42 y paso 5949.

El interés del repositorio es metodológico: documenta cómo distintas recetas de datos (Mixed, Selected, Rejected y Random) afectan a la calidad generativa de vídeo y a la calidad de las representaciones aprendidas, mediante evaluaciones estandarizadas y réplicas que permiten estimar varianza entre semillas. No se trata de un modelo con model card de uso general, ni de pesos listos para inferencia autónoma: el checkpoint Wan requiere los componentes del pipeline Wan 2.1 T2V 1.3B (VAE y encoder de texto) para funcionar.

La relevancia ahora es acotada y experimental: sirve a investigadores que quieran reproducir o auditar los resultados, reutilizar el checkpoint Wan con una configuración de generación documentada, o comparar sondas congeladas sobre V-JEPA. No hay información sobre licencia, idiomas, benchmarks agregados ni pipeline de inferencia declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (Wan 2.1 T2V 1.3B); sondas congeladas sobre V-JEPA |
| Parametros totales | 1.3B (checkpoint Wan incluido) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo con librería diffusers) |

## Arquitectura y entrenamiento

El checkpoint incluido es un transformer de difusión de Wan 2.1 en su variante T2V de 1.3B parámetros, consolidado con su configuración e índice de pesos. Según la model card, debe combinarse con los componentes del pipeline Wan 2.1 T2V 1.3B (VAE y encoder de texto). El experimento compara cuatro recetas de datos (Mixed, Selected, Rejected y Random) con tres réplicas identificadas por semillas 42, 123 y 468, y evalúa checkpoints en los pasos 349, 3149 y 5949.

La evaluación generativa se realiza con VBench: 36 conjuntos de resultados que incluyen registros por vídeo, ajustes de generación, prompts y constantes de agregación. La evaluación de representaciones usa sondas congeladas sobre V-JEPA: 60 logs para SSv2 (cinco checkpoints por cada una de 12 ejecuciones de preentrenamiento), cuatro ejecuciones de checkpoint final en K400 con batch size 16 por GPU, e IntPhys2 con resultados por vídeo. Las configs conservan marcadores de ruta de los datos y software originales, y los registros por vídeo de VBench apuntan a los nombres de fichero originales; la tabla resumen de trayectorias mapea cada fila a su JSON de evaluación.

## Capacidades

- Generación de vídeo texto-a-vídeo mediante el transformer Wan 2.1 1.3B, siempre que se aporten VAE y encoder de texto del pipeline original.
- Evaluación generativa estandarizada con VBench (múltiples dimensiones agregadas por las constantes incluidas).
- Evaluación de representaciones visuales mediante sondas congeladas lineales sobre V-JEPA en SSv2, K400 e IntPhys2.
- Reproducibilidad parcial: configuración de generación documentada para el checkpoint Mixed/semilla 42/paso 5949.
- No se declaran capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Auditoría de recetas de datos: comparar los 36 conjuntos VBench entre Mixed, Selected, Rejected y Random para estimar el efecto de la selección de datos sobre la calidad de generación de vídeo.
- Reproducción de resultados: usar `vf/eval/wan/runs/mixed/training-42/step5949/generation_config.json` junto al checkpoint para regenerar las muestras puntuadas.
- Estudio de varianza entre semillas: las réplicas 42, 123 y 468 permiten cuantificar la sensibilidad del entrenamiento a la semilla.
- Investigación sobre representaciones: reutilizar los logs de sondas congeladas SSv2 y K400 para comparar checkpoints de V-JEPA bajo un protocolo común.
- Análisis de física intuitiva: emplear los resultados IntPhys2 por vídeo para estudiar el comportamiento del modelo en tareas de plausibilidad física.
- Desarrollo de metodología de evaluación: los prompts de VBench, constantes de agregación y registros por vídeo sirven como base para pipelines de evaluación reproducibles.
- Fine-tuning experimental: partir del transformer Wan consolidado para experimentos de adaptación, asumiendo la necesidad de reconstruir el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks agregados en la información disponible. El repositorio contiene resultados VBench por ejecución (36 conjuntos) y logs de sondas SSv2, K400 e IntPhys2, pero no se proporcionan cifras consolidadas en la model card ni en los metadatos.

## Requisitos de hardware

- VRAM estimada: no disponible. El checkpoint es de 1.3B parámetros, pero el pipeline Wan 2.1 T2V completo (VAE y encoder de texto) condiciona el consumo real.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del pipeline Wan 2.1 y de la resolución y duración de vídeo.
- Opciones de despliegue: integración con `diffusers` (librería declarada en el repo). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 5.7 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ManTle/lab-misc (Wan 2.1 1.3B) | 1.3B | no disponible | T2V + evaluación | no disponible | Hugging Face, repo experimental |
| Wan 2.1 T2V 1.3B (original) | 1.3B | no disponible | T2V | no disponible en esta ficha | Pipeline de referencia citado |
| V-JEPA (sondas) | no disponible | no disponible | Representaciones visuales | no disponible | Referenciado como base de sondas |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: es un snapshot de artefactos de investigación con un único checkpoint.
- El checkpoint Wan no funciona de forma autónoma; requiere VAE y encoder de texto del pipeline Wan 2.1 T2V 1.3B.
- Las configs contienen marcadores de ruta de los datos y software originales, por lo que la reproducción exacta requiere reconstruir el entorno.
- Un subconjunto Random (semilla 123) usó una generación duplicada para sustituir una muestra inválida, lo que introduce una desviación documentada respecto a la generación original.
- Licencia no declarada: no se puede confirmar el uso comercial.
- Idiomas no declarados; no hay información sobre sesgos ni tasas de alucinación.
- Los resultados VBench no están agregados en la model card; cualquier comparación requiere procesar los 36 conjuntos.
- Los enlaces de búsqueda web encontrados (Mantle L2, geología, cosmética, hidrógeno, RWA) no guardan relación con este repositorio y no deben usarse como referencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ManTle/lab-misc
- Pipeline de referencia citado: Wan 2.1 T2V 1.3B (componentes VAE y encoder de texto)
- Base de sondas citada: V-JEPA
- Benchmarks citados: VBench, SSv2, K400, IntPhys2
- No se han encontrado papers, blogs, repos adicionales ni demos asociados en la búsqueda web.
