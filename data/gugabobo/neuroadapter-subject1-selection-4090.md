# gugabobo/neuroadapter-subject1-selection-4090

## Resumen

NeuroAdapter Subject 1 (identificador `gugabobo/neuroadapter-subject1-selection-4090`) es un artefacto de investigación publicado en HuggingFace que contiene una copia de seguridad de pesos candidatos de un "neuroadapter" entrenado sobre el sujeto 1 de un experimento de neuroimagen funcional (fMRI). No es un modelo de lenguaje ni un modelo generativo autónomo: se trata de un conjunto de adaptadores que se apoyan en Stable Diffusion v1.5 como modelo base, orientados a la investigación en neurociencia computacional (codificación/decodificación de respuestas cerebrales ante estímulos visuales). El autor del repositorio es el usuario `gugabobo`, y los pesos provienen de una reproducción independiente realizada por GeYugong, no de los autores originales del paper.

El repositorio contiene 20 instantáneas (snapshots) obtenidas de un entrenamiento de selección sobre 8500 imágenes, con 500 imágenes adicionales reservadas para validación interna. La model card aclara explícitamente que la copia de seguridad de candidatos no implica que se haya elegido ya el mejor peso ni que se hayan alcanzado las métricas del paper de referencia. Según la decisión registrada el 2026-09-10, el autor no prevé reentrenar con el conjunto completo de 9000 imágenes, sino seleccionar pesos de uso investigador a partir de los candidatos existentes.

Su relevancia actual es acotada y muy específica: sirve como material de replicación para grupos que trabajan en modelos de codificación cerebral basados en difusión, y como evidencia de un flujo de entrenamiento reproducible (commit de entrenamiento y evaluación congelado). El tamaño del repositorio es de 10,2 GB, con pesos en formato PyTorch. No se declara licencia, no se publican métricas y no se incluyen los datos de fMRI (NSD), las imágenes de estímulo ni los pesos completos de Stable Diffusion v1.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador (neuroadapter) sobre Stable Diffusion v1.5 como modelo base; arquitectura interna no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de modelos de lenguaje) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en formato PyTorch sin cuantizar según la model card) |
| Idiomas soportados | chino (`zh`); la model card está redactada en chino y el campo `language` del repositorio indica `zh` |
| Licencia | no disponible |
| Formato de pesos | PyTorch (el repositorio no incluye los pesos base de Stable Diffusion v1.5) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del adaptador. Sí se especifica que el modelo base es Stable Diffusion v1.5 y que el proyecto upstream de referencia es NeuroAdapter, del laboratorio de Kriegeskorte (`kriegeskorte-lab/NeuroAdapter`). Por el contexto (etiquetas `neuroadapter` y `fmri`, sujeto 1, estímulos visuales), se trata de un adaptador pensado para modelar respuestas de fMRI, presumiblemente acoplado a las representaciones internas del modelo de difusión. Cualquier detalle sobre número de capas, dimensionalidad del adaptador, tipo de atención o mecanismo de acoplamiento con el UNet no está disponible en la información suministrada.

En cuanto al entrenamiento, la model card indica que los 20 snapshots proceden de un entrenamiento de selección sobre 8500 imágenes, con 500 imágenes reservadas para validación interna (9000 imágenes en total en el conjunto). No se menciona el uso de RLHF, DPO ni técnicas de alineamiento; es un entrenamiento supervisado de investigación. No se especifican el número de tokens/pasos, la composición exacta del dataset, el optimizador ni el régimen de aprendizaje. El commit congelado de entrenamiento y evaluación es `1a1fcfa66e06de07a04dfbb48cc6f9ad108ed567`, lo que permite reproducir el pipeline desde el repositorio de código del autor. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Modelado de respuestas de fMRI asociadas a estímulos visuales, en el marco de un experimento de codificación cerebral (sujeto 1).
- Generación de representaciones condicionadas por el modelo base Stable Diffusion v1.5, presumiblemente para predecir o reconstruir actividad neuronal; el alcance exacto no se detalla en la model card.
- Selección de pesos candidatos: el repositorio ofrece 20 snapshots alternativos para que el investigador elija el más adecuado a su evaluación.
- Reanudación de estado de entrenamiento: el directorio `resume-backup/` contiene el estado completo, aunque la model card indica que no se autoriza continuar el entrenamiento a partir de él.
- Inferencia con los snapshots de `snapshots/` (indicado explícitamente como uso previsto).
- Soporte de tool calling / function calling: no disponible (no aplica a este tipo de artefacto).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el único idioma declarado es `zh`.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el artefacto no es un modelo multimodal de propósito general, aunque su ámbito de aplicación sea la visión y la neuroimagen.

## Casos de uso

- Replicación académica del pipeline NeuroAdapter: un grupo de neurociencia computacional puede cargar los snapshots y reproducir el entrenamiento de selección usando el commit congelado `1a1fcfa66e06de07a04dfbb48cc6f9ad108ed567`, con el objetivo de verificar los resultados publicados.
- Comparación de checkpoints intermedios: los 20 snapshots permiten estudiar la evolución del ajuste a lo largo del entrenamiento de selección y analizar la estabilidad de los pesos entre iteraciones.
- Evaluación de modelos de codificación cerebral basados en difusión: el adaptador puede emplearse como línea base frente a otros modelos de codificación que predicen respuestas de fMRI a partir de imágenes naturales.
- Investigación sobre alineación entre representaciones de difusión y corteza visual: el adaptador actúa como puente entre el espacio latente de Stable Diffusion v1.5 y las respuestas del sujeto 1, útil para estudiar qué capas o características correlacionan con áreas visuales.
- Docencia y divulgación en neuro-IA: al ser un artefacto acotado y de tamaño moderado, sirve como ejemplo práctico en cursos de neurociencia computacional sobre cómo se acopla un modelo generativo a datos neuronales.
- Estudio de transferencia entre sujetos: aunque el adaptador está entrenado específicamente para el sujeto 1, puede usarse como punto de partida en experimentos que evalúen cuánto conocimiento es transferible a otros sujetos del mismo dataset (NSD), teniendo en cuenta que el repositorio no incluye los datos de fMRI.
- Auditoría y verificación de integridad: el archivo `BACKUP_MANIFEST.json` incluye tamaños y hashes SHA-256, lo que permite validar la integridad de los pesos antes de usarlos en un entorno de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card advierte que la existencia de pesos candidatos "no representa alcanzar las métricas del paper" y que aún no se ha seleccionado el mejor peso. No se dispone de puntuaciones de MMLU, HumanEval, GSM8K ni de métricas específicas de neuroimagen (por ejemplo, correlación voxel-wise o precisión de recuperación).

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información proporcionada. Como estimación orientativa no confirmada por el autor, una inferencia basada en Stable Diffusion v1.5 en fp16 suele requerir del orden de 4-8 GB de VRAM, a lo que se sumaría el coste del adaptador (habitualmente pequeño frente al modelo base). Esta cifra no está verificada para este repositorio.
- GPU recomendadas: no disponible. El identificador del repositorio incluye "4090", lo que sugiere que el entrenamiento se realizó en una NVIDIA RTX 4090, pero la model card no confirma este extremo.
- Compatibilidad con GPU de consumo: no confirmada. Si la estimación anterior es correcta, cabría en GPU de consumo con 8 GB o más de VRAM; debe validarse empíricamente.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto). El uso previsto es la carga de pesos PyTorch desde `snapshots/` con el código del repositorio del autor, empleando opciones de carga segura.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 10,2 GB, e incluye 20 snapshots más el archivo de reanudación `resume-backup/`. Los pesos base de Stable Diffusion v1.5 no están incluidos y deben obtenerse por separado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuroAdapter Subject 1 (gugabobo) | no disponible | no aplica | no publicado | no disponible | HuggingFace, 0 descargas, 1 like |
| NeuroAdapter oficial (kriegeskorte-lab) | no disponible | no aplica | no disponible en esta búsqueda | no disponible | Repositorio GitHub citado en la model card |
| Otras reproducciones de adaptadores para fMRI | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría (por ejemplo, MindEye u otros modelos de decodificación cerebral), ya que la información proporcionada no incluye especificaciones ni métricas de esos sistemas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta sesgos. Al estar entrenado sobre el sujeto 1 de un dataset concreto, sus predicciones están fuertemente sesgadas hacia las características individuales de ese sujeto y hacia la distribución de estímulos del conjunto de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido habitual de modelos generativos de texto, pero existe riesgo de sobreajuste a los estímulos vistos durante el entrenamiento y de generalización deficiente a estímulos fuera de distribución.
- Limitaciones de contexto e idioma: el único idioma declarado es el chino (`zh`), referido al ámbito del repositorio y su documentación. El artefacto no es un modelo de lenguaje y no procesa contexto textual.
- Licencia: no disponible. No se declara licencia explícita, por lo que no se puede asumir permiso para uso comercial. La model card remite a las licencias del modelo base (Stable Diffusion v1.5) y del código upstream, que deben respetarse adicionalmente.
- Estado de los pesos: son pesos candidatos, no una versión final validada. La model card indica que no se ha seleccionado el mejor checkpoint ni se han alcanzado las métricas del paper.
- Contenido ausente: el repositorio no incluye los datos de fMRI del NSD, las imágenes de estímulo, credenciales de acceso ni los pesos completos de Stable Diffusion v1.5, por lo que no es autosuficiente para reproducir el pipeline completo.
- Seguridad en la carga: los pesos están en formato PyTorch y el autor recomienda cargarlos únicamente desde fuentes de confianza y con opciones de carga segura, lo que apunta a un posible riesgo asociado a serialización tipo pickle.
- Restricción de entrenamiento: el directorio `resume-backup/` es un archivo de estado completo y la model card indica que no autoriza a continuar el entrenamiento a partir de él.
- Trazabilidad: es una reproducción independiente, no los pesos oficiales de los autores del paper; cualquier cita académica debe referirse al trabajo original y no a este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/gugabobo/neuroadapter-subject1-selection-4090
- Repositorio de código del autor: https://github.com/GeYugong/neuroadapter-subject1-research
- Commit congelado de entrenamiento y evaluación: `1a1fcfa66e06de07a04dfbb48cc6f9ad108ed567` (repositorio anterior)
- NeuroAdapter upstream (Kriegeskorte Lab): https://github.com/kriegeskorte-lab/NeuroAdapter
- Modelo base: Stable Diffusion v1.5 (pesos no incluidos en este repositorio)
- Manifiesto de integridad: `BACKUP_MANIFEST.json` dentro del repositorio de HuggingFace
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos tratan sobre la hora local en Rusia y no guardan relación con el modelo.
