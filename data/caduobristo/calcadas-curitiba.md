# caduobristo/calcadas-curitiba

## Resumen

`caduobristo/calcadas-curitiba` es un repositorio de artefactos de vision por computador orientados a la clasificacion automatica de la calidad de aceras (calcadas) en la ciudad de Curitiba, Brasil. No se trata de un modelo fundacional entrenado desde cero, sino de un conjunto de cabeceras de clasificacion (un tagger multi-label de 11 clases y varios pipelines binarios y multiclase) calibradas sobre representaciones extraidas de backbones DINOv2 (Large, 1024 dimensiones; Base, 768 dimensiones) preentrenados por Project Sidewalk. El autor es `caduobristo` y el repositorio se distribuye bajo licencia MIT.

El problema que aborda es la triagem viaria automatizada de aceras con explicabilidad, resolviendo un sesgo cultural concreto: el *petit-pavé* (adoquinado portugues) presente en Curitiba provoca falsos positivos en detectores genericos de defectos, que confunden el patron regular del empedrado con ondulaciones o grietas. La version 4 del dataset (1.171 imagenes en 10 vias) es la recomendada para produccion, mientras que la version 3 (750 imagenes en 6 vias) sirve como linea de base.

La relevancia actual es acotada pero clara: es un ejemplo de transfer learning aplicado a infraestructura urbana con supervision debil *Teacher-Student*, pensado para integrarse en flujos de inspeccion municipal (en colaboracion con IPPUC) y no para uso general como LLM o modelo multimodal. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta, lo que indica un artefacto de nicho, probablemente en fase de publicacion inicial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeceras de clasificacion (linear multi-label y pipelines scikit-learn via joblib) sobre features DINOv2-Large (1024D) y DINOv2-Base (768D) |
| Parametros totales | no disponible (depende del backbone DINOv2 subyacente, no incluido en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica ventana de tokens) |
| Tipos de cuantizacion | no disponible (artefactos `.pth` y `.joblib`; no se documentan variantes cuantizadas) |
| Idiomas soportados | pt, en |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch state dict) y `.joblib` (pipelines serializados de scikit-learn) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo sino un esquema de *feature extraction + classification head*. Las imagenes se procesan con backbones DINOv2 (ViT autosupervisado de Meta) en variantes Large (1024D) y Base (768D), concretamente los pesos publicados por Project Sidewalk en `projectsidewalk/sidewalk-tagger-ai-surfaceproblem`. Sobre esas representaciones se entrena una cabeza linear de 11 clases multi-label (`v4/tagger_sem_brick.pth`) que detecta defectos y obstaculos fisicos, excluyendo explicitamente la clase `brick/cobblestone` para mitigar el sesgo del *petit-pavé*.

El entrenamiento usa supervision debil con esquema *Teacher-Student* sobre el dataset v4 (1.171 imagenes de 10 vias de Curitiba). Los pipelines de clasificacion (`classificador_cenario05_2classes_binario.joblib`, `classificador_cenario04_3classes_com_naoid.joblib`, `classificador_cenario03_3classes_sem_naoid.joblib`) se serializan con joblib e incluyen preprocesado y clasificador en un unico objeto, lo que facilita el despliegue sin reentrenamiento. No se documentan detalles sobre numero de tokens, composicion exacta del dataset, ni uso de RLHF/DPO (no aplica a este tipo de modelo).

## Capacidades

- Clasificacion binaria de transitabilidad: separa aceras `Transitavel` de situaciones criticas (`Inadequada` + `Sem calcada`) con 85,4% de accuracy y 0,856 de Weighted F1 en el escenario 5 (v4).
- Clasificacion multiclase con rejeicao: escenario 4 con tres clases (`Adequada`, `Inadequada Geral`, `Nao identificavel`) al 75,7% de accuracy.
- Clasificacion multiclase sin rejeicao: escenario 3 (`Adequada`, `Com Defeito`, `Sem calcada`).
- Deteccion multi-label de defectos y obstaculos fisicos en 11 clases mediante el tagger `v4/tagger_sem_brick.pth`.
- Mitigacion del sesgo del *petit-pavé*: la cabeza tagger excluye la clase `brick/cobblestone` para reducir falsos alarmes en aceras integras de piedra portuguesa.
- Explicabilidad: el pipeline joblib incluye preprocesado y clasificador en un unico objeto, lo que permite inspeccionar features y decisiones intermedias.
- Idiomas: etiquetas y documentacion en portugues e ingles; el modelo no procesa texto, por lo que el soporte linguistico se refiere a la documentacion y etiquetas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.

## Casos de uso

- Triagem viaria municipal a escala: el pipeline binario del escenario 5 clasifica imagenes de aceras en `Transitavel` frente a `Inadequada`/`Sem calcada` con 85,4% de accuracy, lo que permite priorizar inspecciones presenciales en las vias con mayor tasa de defectos.
- Deteccion de obstaculos fisicos multi-label: el tagger de 11 clases permite inventariar defectos concretos (grietas, ondulaciones, obstaculos) por via, alimentando un sistema de gestion de activos urbanos.
- Auditoria de accesibilidad: combinando el clasificador binario con el tagger, se puede generar un indice de transitabilidad por tramo que alimente mapas de accesibilidad para personas con movilidad reducida.
- Integracion con plataformas tipo Project Sidewalk: al compartir el backbone `sidewalk-tagger-ai-surfaceproblem`, las cabeceras pueden reutilizarse sobre imagenes ya etiquetadas en plataformas de *crowdsourcing* de aceras, reduciendo el coste de anotacion.
- Monitorizacion de obra publica: comparando clasificaciones antes y despues de una intervencion en una via, se puede verificar si la acera ha pasado de `Inadequada` a `Adequada` de forma objetiva y repetible.
- Investigacion sobre sesgo cultural en vision: el repositorio documenta explicitamente la correccion del sesgo del *petit-pavé*, lo que lo convierte en un caso de estudio util para analizar como los detectores genericos fallan en contextos urbanos no anglosajones.
- Despliegue en inspeccion movil: los pipelines joblib son ligeros y pueden ejecutarse en CPU o GPU de gama baja tras extraer features DINOv2, lo que facilita su uso en dispositivos de campo o en servidores modestos.

## Benchmarks y rendimiento

| Modelo / escenario | Accuracy | Weighted F1 | Clases | Dataset |
|---|---|---|---|---|
| `v4/classificador_cenario05_2classes_binario.joblib` | 85,4% | 0,856 | 2 (`Transitavel` vs `Inadequada`+`Sem calcada`) | v4 (1.171 imagenes, 10 vias) |
| `v4/classificador_cenario04_3classes_com_naoid.joblib` | 75,7% | no disponible | 3 (`Adequada`, `Inadequada Geral`, `Nao identificavel`) | v4 |
| `v4/classificador_cenario03_3classes_sem_naoid.joblib` | no disponible | no disponible | 3 (`Adequada`, `Com Defeito`, `Sem calcada`) | v4 |
| `v4/tagger_sem_brick.pth` | no disponible | no disponible | 11 multi-label | v4 |

No se han publicado resultados comparativos con otros modelos de calidad de aceras en la informacion disponible, ni metricas por clase, matriz de confusion o curvas precision-recall. Los datos de v3 (linea de base) no se detallan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El backbone DINOv2-Large requiere aproximadamente 1,2 GB en fp32 y DINOv2-Base alrededor de 350 MB en fp32, pero estas cifras son estimaciones genericas del backbone, no del repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar DINOv2-Base; DINOv2-Large requiere al menos 8 GB para batches pequenos. Una RTX 3060, RTX 4060 o superior es suficiente para extraccion de features en lote.
- Cabe en GPU consumer: si, tanto DINOv2-Base como DINOv2-Large caben en GPUs consumer de gama media; las cabeceras de clasificacion (`joblib` y `tagger_sem_brick.pth`) son practicamente despreciables en memoria.
- Opciones de despliegue: PyTorch (para el tagger `.pth`), scikit-learn + joblib (para los pipelines), y `huggingface_hub` para descarga. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible. Dependera del backbone y del hardware; el coste dominante es la extraccion de features DINOv2, no la clasificacion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `caduobristo/calcadas-curitiba` | Cabeceras de clasificacion sobre DINOv2 | no disponible (depende del backbone) | no aplica | 85,4% accuracy (binario) | MIT | Hugging Face |
| `projectsidewalk/sidewalk-tagger-ai-surfaceproblem` | Tagger de superficies de acera sobre backbone DINOv2 | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| DINOv2 (Meta) | Backbone ViT autosupervisado | 86M (ViT-S), 300M (ViT-B), 1,1B (ViT-g) | no aplica | SOTA en vision | Apache 2.0 (variantes) | Hugging Face / GitHub |

La comparativa directa es limitada: no existen en la informacion disponible modelos publicos equivalentes especializados en calidad de aceras de Curitiba. El referente mas cercano es el tagger de Project Sidewalk, del que este repositorio reutiliza el backbone, y DINOv2 como base generica de vision. No se dispone de metricas comparativas entre estos modelos sobre el mismo dataset.

## Limitaciones y advertencias

- Sesgo geografico: el dataset se limita a Curitiba (1.171 imagenes en 10 vias en v4), por lo que la generalizacion a otras ciudades o tipos de acera no esta validada.
- Sesgo cultural residual: aunque la cabeza tagger excluye `brick/cobblestone` para mitigar el *petit-pavé*, persisten posibles falsos positivos en otros patrones de empedrado no representados en el dataset.
- Alucinacion: no aplica en el sentido generativo, pero existe riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de distribucion (iluminacion, angulo, oclusion).
- Limitaciones de contexto: no es un modelo de lenguaje ni multimodal generativo; no procesa texto ni mantiene conversaciones. Las etiquetas `pt` y `en` se refieren a documentacion, no a capacidades linguisticas.
- Accuracy moderada: el escenario 4 (3 clases con rejeicao) solo alcanza 75,7% de accuracy, lo que limita su uso como unico criterio de decision en produccion.
- Restricciones de licencia: MIT permite uso comercial, pero el backbone DINOv2 subyacente tiene su propia licencia (Apache 2.0 en variantes publicas de Meta), que debe verificarse por separado.
- Caveat de produccion: el repositorio no incluye el backbone DINOv2, solo las cabeceras; es necesario descargar los pesos de Project Sidewalk o de Meta por separado. El repo ocupa 0,0 GB y no registra descargas, por lo que la madurez y el mantenimiento son inciertos.
- Falta de documentacion: no se publican matrices de confusion, metricas por clase, ni detalles de preprocesado, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/caduobristo/calcadas-curitiba
- Project Sidewalk (backbone de referencia): https://huggingface.co/projectsidewalk/sidewalk-tagger-ai-surfaceproblem
- DINOv2 (Meta, backbone base): https://github.com/facebookresearch/dinov2
- Project Sidewalk (plataforma): https://projectsidewalk.org
- IPPUC (Instituto de Pesquisa e Planejamento Urbano de Curitiba): https://www.ippuc.org.br
