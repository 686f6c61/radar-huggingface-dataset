# JunlongLiu/fhwa-ear-bidirectional-flow

## Resumen

Bidirectional Normalizing Flow es un checkpoint de investigación para la reconstrucción de texturas 3D de pavimento, desarrollado por JunlongLiu en el marco del proyecto FHWA EAR Pavement AI (acuerdo 693JJ32350032). El modelo aborda un problema muy específico de ingeniería civil: predecir perfiles longitudinales faltantes a partir de un mapa de altura de baja resolución, es decir, completar información de textura superficial que no se ha capturado directamente.

Se trata de un modelo de flujo normalizador bidireccional (normalizing flow) implementado en PyTorch, publicado con la etiqueta de pipeline `image-to-image` y la etiqueta temática `pavement`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto experimental de un proyecto de I+D orientado a la caracterización de firmes viarios.

La relevancia de este checkpoint es limitada fuera de su dominio. El repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y el propio autor lo describe como un "artefacto experimental" sin puntuación de informe asignada a este fichero concreto. Su interés es fundamentalmente académico y de reproducibilidad dentro del proyecto FHWA EAR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flujo normalizador bidireccional (normalizing flow) sobre PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch) |

## Arquitectura y entrenamiento

La model card indica que se trata de un "Bidirectional Normalizing Flow" orientado a la reconstrucción de texturas 3D de pavimento. La tarea concreta es predecir perfiles longitudinales faltantes a partir de un mapa de altura de baja resolución, lo que encaja con un flujo normalizador que modela una distribución invertible entre el espacio de mapas de altura de baja resolución y el de perfiles de alta resolución. La naturaleza bidireccional del flujo permite tanto la generación (reconstrucción) como la proyección inversa hacia el espacio latente.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de ajuste fino, RLHF o DPO (poco probables en este dominio). El archivo publicado es un checkpoint (`checkpoint.pt`) con SHA-256 `1bb64791619c9e50df7ec710e0d5aa0b0086ab09cae0eb7073602de1f2db1b29`, y el autor indica que el archivo de publicación registra la configuración de entrenamiento guardada. Se requiere una entrada específica de reconstrucción para su uso.

## Capacidades

- Reconstrucción de perfiles longitudinales de pavimento a partir de mapas de altura de baja resolución.
- Modelado generativo invertible mediante flujo normalizador bidireccional (mapeo en ambos sentidos entre espacios de baja y alta resolución).
- Procesamiento de datos de textura superficial 3D en el dominio de ingeniería de firmes.
- Integración en pipelines de PyTorch para investigación en caracterización de pavimento.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo de pensamiento, visión general, audio ni otras capacidades multimodales fuera de su tarea específica.

## Casos de uso

- Reconstrucción de perfiles de textura en carreteras: dado un mapa de altura de baja resolución obtenido con un sensor de menor coste, el modelo predice los perfiles longitudinales que faltan, permitiendo completar la caracterización de la textura sin una captura de alta resolución completa.
- Investigación en seguridad vial: los perfiles reconstruidos pueden alimentar análisis de resistencia al deslizamiento y drenaje superficial, apoyando estudios de adherencia neumático-calzada.
- Reproducibilidad de experimentos FHWA EAR: el checkpoint y su SHA-256 permiten replicar los resultados del proyecto bajo las condiciones de evaluación documentadas en el repositorio de resultados.
- Desarrollo de métodos de superresolución específicos de dominio: sirve como línea base para comparar flujos normalizadores frente a otros enfoques (GAN, difusión) en reconstrucción de texturas de pavimento.
- Auditoría y validación de sensores: comparar la reconstrucción del modelo con mediciones de alta resolución reales para estimar el error de un sensor de bajo coste en campañas de auscultación.
- Docencia e investigación en ingeniería de firmes: uso como ejemplo práctico de modelos generativos invertibles aplicados a datos geoespaciales y de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no asigna una puntuación de informe a este fichero concreto sin una coincidencia de evaluación verificada, y remite al repositorio de resultados del proyecto para las condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se declara el número de parámetros ni el tamaño real del checkpoint; el repositorio ocupa 0.0 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: inferencia directa con PyTorch cargando `checkpoint.pt`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de reconstrucción de texturas de pavimento mediante flujos normalizadores, ni se dispone de datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- El autor describe el checkpoint como un "artefacto experimental", no como un modelo listo para producción.
- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor o la institución responsable del proyecto.
- No se especifican sesgos conocidos, pero al entrenarse sobre datos de pavimento de un proyecto concreto (FHWA EAR), su generalización a otras carreteras, materiales o condiciones climáticas es incierta.
- Riesgo de alucinación: en modelos generativos de reconstrucción, el flujo puede producir perfiles plausibles pero no fieles a la realidad física; requiere validación contra mediciones reales.
- Requiere una entrada específica de reconstrucción; no es un modelo de uso general ni acepta entradas arbitrarias.
- No hay información sobre el volumen ni la diversidad del dataset de entrenamiento, lo que impide evaluar su robustez.
- El repositorio no tiene descargas ni validación comunitaria; no hay evidencia externa de su funcionamiento.
- No debe interpretarse la ausencia de puntuación de benchmark como un buen resultado: simplemente no se ha verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JunlongLiu/fhwa-ear-bidirectional-flow
- Código fuente y notas de uso: https://github.com/JunlongCode/FHWA-EAR-Pavement-AI/tree/main/source-code/02-texture-reconstruction
- Resultados del informe y condiciones de evaluación: https://github.com/JunlongCode/FHWA-EAR-Pavement-AI/tree/main/results
