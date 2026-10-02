# RiccardoBarbieri/generation

## Resumen

El repositorio `RiccardoBarbieri/generation` contiene una implementación funcional del modelo Perceiver orientada a tareas de generación, publicada bajo licencia Apache 2.0. El autor la etiqueta internamente como configuración "giant", pero el checkpoint distribuido no es un modelo entrenado: la propia model card lo describe explícitamente como un "initialization checkpoint" válido para pruebas de humo (smoke tests), no como un modelo con benchmarks. El recuento real de parámetros almacenados en el fichero safetensors es de 24.832, muy lejos de lo que sugeriría la etiqueta "giant", lo que refuerza la idea de que se trata de un artefacto de andamiaje más que de un modelo listo para producción.

El Perceiver es una arquitectura basada en atención que procesa entradas de tamaño arbitrario mediante un conjunto latente de dimensión fija, lo que en teoría permite manejar modalidades y longitudes muy distintas sin rediseñar el modelo. En esta variante concreta se combinan atención dilatada, fusión por concatenación seguida de MLP, activaciones GELU y normalización RMSNorm. La receta de entrenamiento por defecto propone el optimizador Lion con un schedule de warmup constante.

La relevancia de esta ficha es acotada y honesta: se trata de un punto de partida experimental y transparente, útil para reproducir la arquitectura, inspeccionar el código (`run.py`) y montar evaluaciones propias, pero no de un modelo con pesos entrenados, idiomas declarados ni resultados publicados. Cualquier uso en producción requeriría entrenamiento previo, auditoría y documentación de resultados por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parametros totales | 24.832 (según safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica `model.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales declarados en la model card:

| Parametro | Valor |
|---|---|
| Escala declarada | giant |
| Tipo de atencion | dilated |
| Fusion | concat mlp |
| Activacion | gelu |
| Normalizacion | rmsnorm |
| Optimizador por defecto | lion |
| Schedule de warmup | constant |
| Ficheros incluidos | `run.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer con cuello de botella latente: la entrada se proyecta contra un array latente de tamaño fijo mediante atención cruzada, de modo que el coste computacional escala con el tamaño del latente y no con la longitud de entrada. En esta implementación se configura con atención dilatada, fusión de características por concatenación seguida de una MLP, activación GELU y normalización RMSNorm. El repositorio etiqueta la escala como "giant", aunque ese término describe el preset de configuración del script, no el tamaño del checkpoint publicado, que contiene 24.832 parámetros.

No hay información sobre datos de entrenamiento: no se especifican tokens, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La model card indica que el checkpoint es una inicialización sin entrenar y que no ha sido auditado en robustez, equidad ni transferencia de dominio. La receta de experimento por defecto (`training_args.json`) usa el optimizador Lion con warmup constante, presentada como valores de arranque del script y no como evidencia de un entrenamiento completado. La innovación técnica, más que algorítmica, es de transparencia: código ejecutable, configuración reproducible y ausencia deliberada de afirmaciones de benchmark sin respaldo.

## Capacidades

- Generación de texto: la arquitectura está orientada a tareas de generación, pero no se ha publicado ningún checkpoint entrenado que permita verificar la calidad o la corrección de las salidas.
- Modelado de entradas multimodales o de longitud variable: el mecanismo latente del Perceiver está diseñado para admitir entradas heterogéneas sin cambiar la arquitectura, aunque no hay validación experimental en este repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma soportado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución de pruebas de humo: el script `run.py` incluye un bloque `__main__` con un ejemplo mínimo que permite verificar que el modelo instancia y ejecuta hacia delante.
- Integración estándar de Hugging Face: al ser una implementación personalizada, las APIs automáticas de carga requieren un adaptador explícito, tal como advierte la propia model card.

## Casos de uso

- Reproducción de arquitectura para investigación: sirve para estudiar cómo se ensambla un Perceiver con atención dilatada, fusión concat-MLP y RMSNorm en PyTorch, y comparar decisiones de diseño con otras implementaciones del mismo paper.
- Base para experimentos de ablation: al partir de una configuración reproducible (`config.json` + `training_args.json`), se puede usar como punto de partida para medir el impacto de variar la escala, la activación o el tipo de atención.
- Pruebas de humo en CI: el checkpoint de inicialización permite verificar que el pipeline de carga de safetensors, instanciación del modelo y forward pass no se rompe en un entorno nuevo.
- Enseñanza y prototipado docente: adecuado para explicar el cuello de botella latente del Perceiver y cómo se gestionan entradas de tamaño arbitrario sin inflar el coste de atención.
- Investigación sobre generación en dominios con datos heterogéneos: la flexibilidad del Perceiver encaja con problemas biomédicos o de series temporales donde la longitud y modalidad de la entrada varían, siempre que se entrene el modelo antes.
- Desarrollo de adaptadores de carga personalizados: útil para escribir y validar wrappers que expongan este modelo a través de APIs de Hugging Face (`AutoModel`, `pipeline`) que de serie no reconocen implementaciones custom.
- Benchmarking interno de infraestructura: por su tamaño reducido, sirve para medir latencia de arranque, coste de serialización y sobrecarga del runtime sin que el cómputo del modelo domine la medición.

En todos los casos conviene recordar que el artefacto publicado no está entrenado, por lo que ninguno de estos usos implica calidad de salida generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que "no benchmark score is claimed in this repository" y que cualquier evaluación futura sobre un checkpoint entrenado deberá documentarse de forma separada de los valores por defecto aquí incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 24.832 parámetros, el checkpoint ocupa aproximadamente 0,1 MB en fp32 y menos de 0,05 MB en fp16. El cuello de botella real no es el modelo, sino el array latente y la longitud de la secuencia que se configuren en `config.json`, valores no disponibles.
- GPU recomendadas: cualquier GPU, incluida una integrada, puede alojar el checkpoint. No hay información sobre requisitos de memoria para la configuración "giant" completa si se instanciara con otros hiperparámetros.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: el repositorio no documenta integración con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia estándar. Solo se describe la ejecución mediante `python run.py`. La carga vía APIs automáticas de Hugging Face requiere un adaptador explícito.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia, tokens por segundo ni consumo energético.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este repositorio, por lo que la comparación cuantitativa no es posible. A continuación se contrastan características estructurales con otras implementaciones de la familia Perceiver.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RiccardoBarbieri/generation | 24.832 (checkpoint de inicialización) | no disponible | no disponible | apache-2.0 | Hugging Face, 14 descargas |
| Perceiver IO (DeepMind) | no disponible en esta busqueda | no disponible | paper propio, no comparable directamente | Apache 2.0 en el repositorio de referencia | Código y pesos de referencia publicados por el autor original |
| Perceiver AR | no disponible en esta busqueda | no disponible | paper propio, no comparable directamente | no disponible en esta busqueda | Implementación de referencia |

La comparación relevante no es de calidad, sino de estado: este repositorio publica una inicialización sin entrenar, mientras que las implementaciones de referencia de DeepMind acompañan sus publicaciones con pesos entrenados y evaluaciones. Para una comparación justa habría que entrenar este modelo con la misma exposición de datos, presupuesto de ajuste y semillas que las alternativas, tal como recomienda la propia model card.

## Limitaciones y advertencias

- El checkpoint publicado no ha sido entrenado: es una inicialización válida para pruebas de humo, no un modelo capaz de generar contenido de calidad.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce explícitamente la model card.
- Riesgo de alucinación: no evaluable, al no existir un modelo entrenado sobre el que medirlo.
- Sesgos conocidos: no disponibles; no se han realizado análisis de sesgo y no se documenta la composición de datos.
- Idiomas soportados: no declarados.
- Longitud de contexto: no especificada.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial del código y los pesos, pero los términos de los datos de origen deben revisarse por separado si se emplean datasets externos para entrenar.
- Integración: al ser una implementación personalizada, no se carga directamente con `AutoModel` ni con la mayoría de pipelines estándar sin escribir un adaptador.
- Configuración "giant": la etiqueta puede inducir a error sobre el tamaño real; el checkpoint contiene 24.832 parámetros y el repositorio ocupa 0,0 GB.
- Cualquier resultado obtenido con un futuro checkpoint entrenado deberá documentarse por separado de los valores por defecto incluidos en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/RiccardoBarbieri/generation
- Generative AI Models in Time-Varying Biomedical Data: Scoping Review: https://www.jmir.org/2025/1/e59792/
- Perfil de Google Scholar de Riccardo Barbieri: https://scholar.google.com/citations?user=0j2GvHcAAAAJ&hl=it
- Fast multilabel classification of HEP constraints with deep learning: https://link.aps.org/doi/10.1103/PhysRevD.111.075010
- HONeYBEE: Enabling Scalable Multimodal AI in Oncology: https://www.medrxiv.org/content/10.1101/2025.04.22.25326222v1.full-text
- Perfil de Fabio Hellmann, Universitat Augsburg: https://www.uni-augsburg.de/de/fakultaet/fai/informatik/prof/hcm/team/hellmann/
