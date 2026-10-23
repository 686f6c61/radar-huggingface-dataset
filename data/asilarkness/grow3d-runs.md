# Asilarkness/grow3d-runs

## Resumen

`Asilarkness/grow3d-runs` no es una release de pesos al uso, sino el repositorio de artefactos de un proyecto de investigación en curso: contiene checkpoints, estado compartido, resultados de evaluación y una instantánea del código de **grow3d**, un generador de formas 3D descrito por su autor como un "growing flow" sobre un octree disperso de latentes SC-VAE de TRELLIS.2, con una única red compartida para todos los niveles de resolución y atención block-sparse de tipo octree-multipole. El repositorio lo mantiene el usuario Asilarkness (Roman Bolshow) y está etiquetado como `private`, con licencia `other`, cero descargas y cero likes en el momento de la consulta.

El interés técnico está en el enfoque: en lugar de un transformer denso sobre vóxeles, el modelo genera geometría de forma jerárquica sobre una estructura de octree, reutilizando el mismo network en cada nivel y aplicando atención dispersa por bloques. Los latentes de entrada se sirven desde un repositorio de datos asociado (`grow3d-data`) con resoluciones de 512³ y 1024³, 12 vistas de condicionamiento y mallas ground-truth para validación.

Es relevante ahora por dos motivos: primero, porque la generación 3D condicionada por múltiples vistas con latentes compactos es una de las líneas más activas para producir assets utilizables en pipelines gráficos; segundo, porque el repositorio documenta un sistema de entrenamiento distribuido no atendido (agentes que reclaman tareas con leases de 20 minutos y checkpoints cada 15) que resulta interesante en sí mismo como infraestructura reproducible. Conviene advertir que se trata de material de investigación sin model card formal: no hay ficha de uso, ni parámetros publicados, ni resultados numéricos en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flow matching ("growing flow") sobre octree disperso de latentes SC-VAE de TRELLIS.2; una red compartida para todos los niveles; atención block-sparse octree-multipole |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de generación 3D; no define ventana de contexto textual) |
| Tipos de cuantización | no disponible (solo se publican checkpoints PyTorch `ckpt_hub.pt` y snapshots EMA `ema_<step>.pt`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural de forma nativa; condicionamiento por 12 vistas) |
| Licencia | `other` (sin texto de licencia publicado en la información disponible) |
| Formato de pesos | PyTorch `.pt` (modelo + EMA, sin estado del optimizador) y snapshot de código `code/grow3d_src.tar.gz` |

## Arquitectura y entrenamiento

La arquitectura se articula en dos piezas. La primera es el codificador SC-VAE heredado de TRELLIS.2, que comprime la geometría a un espacio latente multinivel; los datos de entrenamiento se sirven ya preprocesados como latentes a 512³ y 1024³. La segunda es el generador propiamente dicho: un flujo que "crece" sobre un octree disperso, de modo que cada nivel de resolución se predice reutilizando la misma red en lugar de entrenar cabezas separadas por escala. La atención es block-sparse con un esquema octree-multipole, lo que evita la complejidad cuadrática sobre vóxeles densos y permite operar a resoluciones altas con memoria acotada.

En cuanto al entrenamiento, la model card no publica número de tokens, composición del dataset ni receta de optimización. Sí se documenta la infraestructura: cada sandbox ejecuta un `agent.py` que reclama tareas de `configs/plan.json` mediante commits atómicos sobre `state.json`, renueva un lease de 20 minutos mientras trabaja, guarda checkpoint cada 15 minutos y lo sube al hub; cuando un sandbox desaparece (~6 horas de vida), el lease expira y el siguiente agente reanuda desde `runs/<task>/ckpt_hub.pt`. Las evaluaciones se disparan automáticamente al alcanzar los pasos requeridos. Se mantienen snapshots EMA (`ema_<step>.pt`) para evaluaciones con pasos emparejados, una práctica habitual para reducir el ruido de comparación entre runs. No se menciona RLHF ni DPO; el paradigma es flow matching sobre geometría, no ajuste por preferencias.

## Capacidades

- Generación de formas 3D condicionada por múltiples vistas: el dataset companion proporciona 12 vistas de condicionamiento por objeto.
- Generación jerárquica multinivel sobre octree disperso, con una sola red compartida entre niveles de resolución.
- Producción de mallas evaluables contra ground-truth (el repositorio incluye mallas GT para validación).
- Evaluación integrada de métricas geométricas: Chamfer distance, F-score, diversidad y velocidad, agregadas en `results/SUMMARY.md` y detalladas por objeto en JSON.
- Inspección visual mediante contact sheets con entrada, normales generadas y normales GT.
- Reanudación de entrenamiento desde checkpoint (sin estado del optimizador) en sandboxes nuevos.
- No se documenta soporte de tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico ni capacidades de audio.
- No se documenta capacidad multilingüe: la entrada es visual/geométrica, no textual.

## Casos de uso

- **Prototipado de assets 3D a partir de escaneos multivista**: las 12 vistas de condicionamiento del dataset permiten reconstruir formas coherentes con la evidencia visual; útil en pipelines de fotogrametría donde se quiere una malla limpia en lugar de una nube de puntos.
- **Investigación en generación 3D con flow matching**: el repositorio expone código fuente, checkpoints y snapshots EMA, lo que permite reproducir curvas de entrenamiento y comparar variantes de atención dispersa sin partir de cero.
- **Benchmark de generadores 3D**: `results/SUMMARY.md` y los JSON por objeto sirven como base para comparar Chamfer, F-score, diversidad y velocidad frente a otros métodos, siempre que se respete la misma configuración de evaluación.
- **Generación de datos sintéticos 3D etiquetados**: al disponer de mallas ground-truth emparejadas, se pueden producir pares (forma generada, referencia) para aumentar datasets de entrenamiento de otros modelos de reconstrucción o segmentación.
- **Pruebas de escalado en resolución**: el soporte de latentes a 512³ y 1024³ con la misma red permite estudiar el compromiso entre fidelidad geométrica y coste computacional en un rango amplio de resoluciones.
- **Infraestructura de entrenamiento distribuido oportunista**: el esquema de leases, checkpoints periódicos y reanudación automática es reutilizable para proyectos que corren sobre sandboxes efímeros de pocas horas.
- **Base para fine-tuning interno**: al publicarse el código y los checkpoints, un equipo puede adaptar el generador a un dominio concreto (por ejemplo, piezas mecánicas) partiendo de un modelo ya entrenado en formas generales.

## Benchmarks y rendimiento

El repositorio define explícitamente las métricas que se calculan (Chamfer distance, F-score, diversidad y velocidad) y almacena los resultados en `results/SUMMARY.md` y `results/<eval_task>/`. Sin embargo, **no se han publicado resultados numéricos de benchmarks en la información disponible**: la model card describe la estructura de los ficheros, no los valores.

Existe una publicación en ACM titulada "Grow3D: Hierarchical Next-Scale Octree Prediction for Fast and High..." (DOI 10.1145/3820379) que describe un framework autorregresivo de predicción al siguiente nivel de octree con generación de formas 3D en menos de un segundo. No es posible confirmar desde la información disponible que corresponda a este mismo repositorio: la model card habla de flow matching con latentes SC-VAE, mientras que el resumen del artículo habla de predicción autorregresiva al siguiente nivel. Cualquier cifra de dicho artículo no debe atribuirse a estos checkpoints sin verificación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica tamaño de parámetros ni huella de memoria por checkpoint.
- El repositorio completo ocupa 166,0 GB, pero ese total incluye múltiples runs, snapshots EMA, resultados, logs y código; el tamaño de un único `ckpt_hub.pt` no se especifica.
- GPU recomendadas: no disponible. Por la resolución declarada (latentes a 512³ y 1024³) y el uso de atención block-sparse, es previsible que requiera aceleradores de centro de datos (A100/H100) para entrenamiento; no hay confirmación para inferencia.
- Viabilidad en GPU de consumo: no confirmada. No hay datos que permitan afirmar que quepa en una RTX 4090 u otra GPU consumer.
- Opciones de despliegue: el modelo depende de código propio (snapshot en `code/grow3d_src.tar.gz`) y checkpoints PyTorch. No hay indicios de soporte en vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. La model card menciona "velocidad" como métrica evaluada, pero no publica valores.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grow3d (este repo) | Flow matching jerárquico sobre octree disperso con latentes SC-VAE | no disponible | Latentes 512³ y 1024³; 12 vistas de condicionamiento | `other` (sin texto) | Checkpoints `.pt` + código en HF, repo marcado `private` |
| TRELLIS.2 (origen del SC-VAE) | Generación 3D con representación latente estructurada | no disponible | no disponible en la información proporcionada | no disponible | Referenciado en la model card; no se enlaza |
| Grow3D (artículo ACM, 10.1145/3820379) | Predicción autorregresiva al siguiente nivel de octree | no disponible | no disponible | no disponible | Publicación; relación con este repo no confirmada |
| MeshGPT (meshgpt.io) | Generación de mallas 3D desde texto o imagen | no disponible | no disponible | no disponible | Servicio web; no es un checkpoint abierto comparable |

La comparación cuantitativa no es posible con los datos disponibles: no hay cifras de parámetros, contexto ni benchmarks publicadas para este repositorio.

## Limitaciones y advertencias

- **Ausencia de model card formal**: no hay sección de uso previsto, limitaciones declaradas ni guía de evaluación. El README es un manual operativo de infraestructura, no una ficha de modelo.
- **Licencia `other` sin texto publicado**: no se puede determinar si el uso comercial está permitido. Cualquier despliegue en producción requiere contactar con el autor para obtener términos explícitos.
- **Repositorio marcado como `private`**: el acceso y la estabilidad del contenido no están garantizados; el estado se reescribe cada 30 minutos por agentes automáticos.
- **Checkpoints sin estado del optimizador**: `ckpt_hub.pt` contiene modelo + EMA, no el optimizador, por lo que la reanudación exacta de una run no es posible; solo se puede continuar el entrenamiento, no restaurarlo bit a bit.
- **Riesgo de artefactos geométricos**: en generación 3D es habitual obtener mallas no cerradas, autointersecciones o caras degeneradas; el repositorio no documenta filtrado posterior ni métricas de manifoldness.
- **Sesgos del dataset no documentados**: se desconoce la procedencia, diversidad y cobertura de categorías de `grow3d-data`; esto puede sesgar el modelo hacia tipos de objeto sobrerrepresentados.
- **Generalización limitada por el condicionamiento**: con 12 vistas de entrada, el rendimiento probablemente degrada si se dispone de menos vistas o de vistas con oclusión severa; no hay ablaciones publicadas.
- **Sin datos de robustez**: no se han publicado evaluaciones frente a ruido en la entrada, dominios fuera de distribución ni comparaciones estadísticamente significativas.
- **Coste de almacenamiento y transporte**: 166 GB de repositorio implican un coste no trivial de descarga y caché; conviene descargar solo los ficheros necesarios mediante descarga selectiva.
- **Fecha de creación futura respecto a la referencia habitual**: el repositorio figura creado el 2026-10-21; verificar la coherencia temporal antes de citarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Asilarkness/grow3d-runs
- Perfil del autor: https://huggingface.co/Asilarkness
- Repositorio de datos asociado (`grow3d-data`, referenciado en la model card; URL no verificada en la información disponible): https://huggingface.co/datasets/Asilarkness/grow3d-data
- Artículo ACM "Grow3D: Hierarchical Next-Scale Octree Prediction..." (relación con este repositorio no confirmada): https://dl.acm.org/doi/full/10.1145/3820379
- Catálogo de modelos del autor en un directorio de terceros: https://essamamdani.com/ai-models/company/asilarkness
- MeshGPT (referencia de comparación, servicio de generación 3D): https://meshgpt.io/
- Código fuente del proyecto: incluido en el propio repositorio, en `code/grow3d_src.tar.gz` y `docs/DESIGN.md` (no se ha localizado un repositorio Git público independiente)
