# empiriolabsai/aplomb-2-large

## Resumen

Aplomb 2 Large es un modelo de decisión desarrollado por EmpirioLabs AI que responde preguntas tipadas sobre un estado: elección entre opciones (`choice`), sí/no (`noul`) y puntuación en una escala (`score`). No genera texto libre: devuelve una probabilidad para cada opción de cada pregunta incluida en una única petición. Está diseñado para tareas de enrutamiento, clasificación, selección de herramientas y verificación donde se requiere una distribución de probabilidad explícita sobre alternativas.

Técnicamente es un ensemble de dos modelos abiertos de decisión que se ejecutan en paralelo en una sola GPU: `MachinePulseAI/karpo-decision-31B` (revisión `b8e6fd74`) y `tattrongvu/Jeffan-27B-1211` (revisión `f0ce7043`). Las probabilidades de ambos miembros se promedian con pesos iguales. Los pesos se cargan en FP8 (proyecciones del decodificador, cuantizadas en el momento de la carga desde los pesos almacenados), y el repositorio ocupa 116,4 GB.

Su relevancia radica en el rendimiento declarado: primer puesto de 217 en S1MB English v1 con un Borda de 90,13, por delante de Superion S1 (89,33) y Darwin-27B-ZTC-v9 (88,87) en la instantánea de la clasificación del 17 de noviembre de 2026. Con una latencia mediana de 137 ms por petición en una RTX PRO 6000, se posiciona como una alternativa de decisión de alta precisión frente a modelos generativos de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos modelos de decisión (karpo-decision-31B y Jeffan-27B-1211), cada uno con su propio motor de inferencia; proyecciones del decodificador en FP8 |
| Parametros totales | no disponible (el repositorio ocupa 116,4 GB; los miembros son de 31B y 27B según su nomenclatura) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (límite de trabajo de 20.000 tokens proxy por petición en el kit Decision Index) |
| Tipos de cuantizacion | FP8 (proyecciones del decodificador, cuantizadas en carga); pesos originales de los miembros sin modificar |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Aplomb 2 Large no es un modelo único entrenado desde cero, sino un sistema de ensemble que combina dos modelos de decisión abiertos publicados por terceros. Cada miembro conserva sus pesos originales y se ejecuta con su propio motor: `karpo-decision-31B` mediante el motor `karpo-decision` y `Jeffan-27B-1211` mediante `jeffan_engine` (incluido en `jeffan/inference/`). La agregación es determinista: media aritmética de las probabilidades de opción para preguntas de elección, media de P(verdadero) para preguntas de sí/no y media de las probabilidades de nivel para preguntas de puntuación, con pesos iguales en todas las peticiones.

El sistema incorpora reglas de enrutamiento por carga: una petición cuyo tamaño (tokens proxy del kit Decision Index multiplicados por el número de preguntas) supera los 20.000 se responde únicamente con `karpo-decision-31B`; si un miembro declara que no puede leer una petición, la responde el otro. Las peticiones con imágenes también se derivan en exclusiva a `karpo-decision-31B`, ya que `Jeffan-27B-1211` solo procesa texto. No se dispone de información sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO en los miembros; la model card no los detalla.

## Capacidades

- Respuesta a preguntas de elección (`choice`): devuelve una probabilidad para cada opción y la opción más probable.
- Respuesta a preguntas de sí/no (`noul`): devuelve la probabilidad media de que la respuesta sea verdadera.
- Respuesta a preguntas de puntuación (`score`): devuelve las probabilidades medias por nivel de la escala.
- Múltiples preguntas por petición: una sola petición puede contener cualquier número de preguntas y ninguna se trunca.
- Procesamiento de imágenes: disponible únicamente a través de `karpo-decision-31B` (Jeffan-27B-1211 es solo texto).
- Interfaz HTTP compatible con endpoints (`/v1/systemone`) y kit de evaluación Decision Index.
- No genera texto libre en ningún caso: siempre elige entre las opciones proporcionadas.
- No se documentan capacidades de tool calling, agentes multi-paso ni razonamiento encadenado más allá de la decisión tipada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de cada equipo o cola de destino (por ejemplo, `shipping` frente a `billing`), lo que permite umbrales de confianza y escalado automático cuando la distribución es ambigua.
- Selección de herramientas en pipelines de agentes: con un conjunto explícito de herramientas candidatas, el modelo asigna una probabilidad a cada una y el orquestador elige la de mayor probabilidad o consulta al humano si la confianza es baja.
- Verificación de respuestas: preguntas de tipo `noul` sobre si una afirmación es correcta o si una salida cumple un criterio, útil como paso de control de calidad en cadenas de generación.
- Clasificación multietiqueta con probabilidades calibradas: al devolver una distribución completa por pregunta, permite alimentar sistemas de decisión posteriores que necesitan incertidumbre, no solo una etiqueta.
- Puntuación de gravedad o prioridad: preguntas de tipo `score` para asignar niveles (por ejemplo, severidad de una incidencia) con probabilidades por nivel, aprovechables en colas de priorización.
- Evaluación comparativa de sistemas de decisión: el kit Decision Index permite ejecutar el modelo sobre suites públicas y reproducir las métricas declaradas en un entorno Linux con una GPU de 96 GB.
- Procesamiento de documentos con imágenes: cuando la decisión depende de una captura o un escaneo, la petición se deriva a `karpo-decision-31B`, que sí procesa imágenes.

## Benchmarks y rendimiento

Datos medidos por EmpirioLabs el 20 de noviembre de 2026; los marcados (p) son publicados por terceros.

| Benchmark | Aplomb 2 Large | Referencia |
|---|---|---|
| S1MB English v1 (137 benchmarks), Borda | 90,13 (1.º de 217) | Superion S1 89,33 (p); Darwin-27B-ZTC-v9 88,87 (p) |
| S1MB English v1, Task Avg | 74,58 | Superion S1 75,06 (p) |
| Atlan Decision Bench (1.071 casos), accuracy | 93,00 % | no disponible |
| Typed Decisions test (2.000 decisiones), accuracy | 75,35 % | no disponible |
| JevBench public items (231), accuracy | 92,21 % | no disponible |

Latencia en una RTX PRO 6000 (750 peticiones sobre la suite pública del Decision Index, una a una): mediana 137 ms, media 476 ms, percentil 80 de 438 ms.

## Requisitos de hardware

- VRAM: se requiere una GPU NVIDIA con 96 GB; el repositorio completo ocupa 116,4 GB en disco y los pesos se cargan en FP8.
- GPU probada: RTX PRO 6000 Blackwell; no se documentan otras configuraciones.
- No cabe en GPU de consumo: 96 GB supera la memoria de tarjetas como la RTX 4090 (24 GB) o la RTX 5090 (32 GB).
- Entorno: Linux, Python 3.12, CUDA 13.
- Despliegue: servidor propio `aplomb2_large.server` (puerto configurable, por defecto 18700) y kit `decision_index`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 137 ms por petición en RTX PRO 6000 con peticiones secuenciales; no se publica throughput agregado ni rendimiento en paralelo.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / carga | Rendimiento (S1MB Borda) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aplomb 2 Large | Ensemble de decisión (31B + 27B) | Límite de 20.000 tokens proxy por petición; 96 GB de VRAM | 90,13 (1.º de 217) | Apache 2.0 | Hugging Face, pesos safetensors |
| Superion S1 | Modelo de decisión | no disponible | 89,33 (p) | no disponible | publicado por terceros |
| Darwin-27B-ZTC-v9 | Modelo de decisión | no disponible | 88,87 (p) | no disponible | publicado por terceros |

La comparación se limita a los datos de la model card; no se dispone de especificaciones de parámetros, contexto ni licencia de los modelos de referencia más allá de su puntuación en S1MB.

## Limitaciones y advertencias

- No genera texto: siempre elige entre las opciones dadas; no sirve para tareas generativas.
- Solo inglés: el único idioma declarado es `en`.
- Las peticiones con imágenes se responden únicamente con `karpo-decision-31B`, con la pérdida de la señal del ensemble.
- Las peticiones que superan los 20.000 tokens proxy (tamaño × número de preguntas) se responden solo con `karpo-decision-31B`.
- Una pregunta que no encaja en los límites de entrada declarados por los miembros se rechaza, nunca se trunca; hay que diseñar las peticiones dentro de esos límites.
- Requiere hardware especializado (96 GB de VRAM) y un stack concreto (Linux, Python 3.12, CUDA 13), lo que limita el despliegue en infraestructura convencional.
- El rendimiento declarado procede de mediciones del propio autor; el Task Avg (74,58) es ligeramente inferior al de Superion S1 (75,06), por lo que la ventaja depende de la métrica de ranking Borda.
- No se documentan sesgos, tasas de alucinación ni comportamiento fuera de distribución; al no generar texto, el riesgo de alucinación se traslada a la calibración de las probabilidades, que no está auditada de forma independiente en la información disponible.
- Licencia Apache 2.0, que permite uso comercial; deben conservarse los avisos de los miembros en `NOTICE` y en las carpetas de cada uno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empiriolabsai/aplomb-2-large
- Licencia: https://huggingface.co/empiriolabsai/aplomb-2-large/blob/main/LICENSE
- Avisos de terceros: https://huggingface.co/empiriolabsai/aplomb-2-large/blob/main/NOTICE
- Requisitos: https://huggingface.co/empiriolabsai/aplomb-2-large/resolve/main/requirements.txt
- Web de EmpirioLabs: https://empiriolabs.ai
- Documentación: https://docs.empiriolabs.ai
- Organización en Hugging Face: https://huggingface.co/empiriolabsai
- Miembro karpo-decision-31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Miembro Jeffan-27B-1211: https://huggingface.co/tattrongvu/Jeffan-27B-1211
