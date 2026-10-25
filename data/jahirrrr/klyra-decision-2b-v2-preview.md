# Jahirrrr/Klyra-Decision-2B-V2-Preview

## Resumen

Klyra-Decision-2B-V2-Preview es un adaptador PEFT (LoRA) publicado por el usuario Jahirrrr —la model card lo atribuye a Polyvor Labs— que no constituye un modelo de lenguaje completo, sino un ajuste fino sobre el backbone `openbmb/MiniCPM5-2B-Midtrain` orientado a tareas de decisión. El repositorio contiene únicamente el adaptador LoRA y tres cabezas personalizadas (`heads.pt`); para utilizarlo hay que cargar el backbone original, envolverlo con `PeftModel.from_pretrained()` e instanciar las cabezas correspondientes. No es, por tanto, un modelo "listo para usar" con `AutoModelForCausalLM`.

La propuesta es explícitamente no generativa: en lugar de producir texto libre, el modelo emite decisiones en formato Choice/Score/Noul a través de las cabezas añadidas. Según la model card, el entrenamiento parte de cero respecto a la versión V1 ("fresh decision SFT") y se apoya en un pool multi-fuente de hasta un millón de registros de tarea convertidos, con ciertos prompts generando varios registros; el consumo real del optimizador se remite a un fichero `training_coverage.json` que no se detalla en la información disponible.

Su relevancia ahora es limitada y hay que enmarcarla con cautela: se trata de un artefacto marcado como `experimental`, sin descargas ni valoraciones, sin licencia declarada y sin resultados de benchmarks publicados con cifras. Resulta interesante como ejemplo de reutilización de un backbone de ~2B parámetros para tareas de ranking/selección mediante cabezas auxiliares, pero no hay evidencia pública de rendimiento que permita recomendarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone `openbmb/MiniCPM5-2B-Midtrain`) con adaptador LoRA y tres cabezas personalizadas; detalles internos del backbone no disponibles |
| Parámetros totales | ~2B en el backbone (según nomenclatura del modelo base); parámetros del adaptador no disponibles |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio contiene únicamente el adaptador; la cuantización dependería del backbone) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA, según tags) + `heads.pt` (checkpoint PyTorch de las cabezas) |
| Tipo de modelo | Modelo de decisión no generativo (tags: `decision-model`, `choice`, `score`, `noul`) |
| Modelo base | `openbmb/MiniCPM5-2B-Midtrain` |
| Librería | `peft` |
| Tamaño del repositorio | 0.0 GB (reportado por HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-24 / 2026-10-24 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El modelo se construye sobre el backbone `openbmb/MiniCPM5-2B-Midtrain`, de la familia MiniCPM de OpenBMB, en su variante de 2B parámetros y en fase de *midtrain*. Sobre esa base se aplica un ajuste supervisado (SFT) con LoRA para una tarea de decisión, y se añaden tres cabezas personalizadas que se cargan por separado desde `heads.pt`. La información disponible no detalla la configuración del adaptador (rango, alpha, módulos objetivo), ni la del backbone (número de capas, dimensión oculta, mecanismo de atención), ni la longitud de contexto nativa.

En cuanto a datos, la model card describe un pool multi-fuente de tareas Choice/Score/Noul con hasta un millón de registros convertidos, advirtiendo que algunos prompts originales generan varios registros y que el consumo real del optimizador se documenta en `training_coverage.json`. No se especifican el número de tokens vistos, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; la model card remite a un notebook y a un manifiesto de datasets para fuentes, licencias y recuentos. La innovación técnica declarada es más de planteamiento que de arquitectura: convertir un LLM pequeño en un decisor no generativo mediante cabezas auxiliares, y publicar solo el adaptador en lugar de pesos completos.

## Capacidades

- Emisión de decisiones en tres formatos declarados en los tags: `choice` (selección entre opciones), `score` (puntuación de candidatos) y `noul` (categoría cuyo significado operativo no se documenta en la información disponible).
- Funcionamiento no generativo: no produce texto libre ni mantiene conversaciones; la salida se obtiene de las cabezas personalizadas conectadas al backbone.
- Aprovechamiento de las representaciones del backbone MiniCPM5-2B, lo que en principio permite puntuar pares entrada/candidato sin generar tokens.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado; el diseño no generativo lo aleja de este uso).
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Evaluación: la model card menciona "JevBench Public", pero aclara que, si se reporta, emplea un adaptador externo personalizado y no el sistema oficial de puntuación del leaderboard.

## Casos de uso

- Reranking en pipelines de búsqueda o RAG: usar la cabeza de `score` para puntuar pares consulta/documento recuperados por un retriever previo y reordenar los candidatos antes de pasarlos a un LLM generador; encaja porque el modelo está diseñado para puntuar, no para generar.
- Selección de respuesta entre múltiples candidatos: dado un prompt y N salidas de un modelo generador, emplear la cabeza de `choice` para elegir la mejor; el coste por decisión sería mucho menor que el de un juez basado en generación.
- Enrutado o triaje de peticiones: utilizar la salida de decisión para clasificar consultas entrantes y derivarlas a distintos modelos o flujos, antes de invocar al generador.
- Filtro previo de contenido o abstención: emplear la categoría `noul` como etiqueta de descarte o de "no clasificable", previa validación semántica de esa clase con el autor.
- Evaluación automática de calidad en ciclos de datos: puntuar pares prompt/respuesta para filtrar datasets de instrucciones o construir preferencias sintéticas; requiere calibrar previamente la cabeza de `score` contra anotaciones humanas.
- Anotación asistida y *active learning*: preetiquetar grandes volúmenes de candidatos y reservar la revisión humana para los casos con puntuaciones ambiguas.
- Despliegue en entornos con recursos limitados: al ser un backbone de ~2B con adaptador, el coste de inferencia por decisión sería bajo comparado con jueces generativos de mayor tamaño (estimación basada en el tamaño, no medida).

Advertencia transversal: al no haber benchmarks ni licencia declarada, estos casos son hipótesis de diseño, no usos validados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona "JevBench Public", pero sin cifras y con la salvedad de que, si se reporta, corresponde a un adaptador externo personalizado y no a la puntuación oficial del leaderboard. No se deben interpretar esas menciones como resultados comparables.

## Requisitos de hardware

- VRAM estimada para el backbone en fp16/bf16: ~4 GB solo para pesos (2B parámetros × 2 bytes). Con caché KV y las cabezas adicionales, el consumo real será superior; el tamaño del adaptador y de `heads.pt` no está disponible (el repositorio reporta 0.0 GB).
- Cuantización aproximada del backbone: ~2 GB en int8 y ~1-1,5 GB en int4, excluyendo caché KV y overhead del runtime (estimación por tamaño, no verificada).
- GPU recomendadas: cualquier GPU con ≥8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10); A100/H100 no son necesarias por tamaño, solo por concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con ≥8 GB en fp16 y con ≥6 GB aplicando cuantización al backbone (estimación).
- Opciones de despliegue: al requerir código personalizado para instanciar y cargar las cabezas, el camino natural es PyTorch + Transformers + PEFT con un `forward` propio. vLLM y TGI no cubren cabezas personalizadas de este tipo sin adaptación; llama.cpp y Ollama no soportan `heads.pt`, por lo que solo servirían, en todo caso, para el backbone sin las cabezas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores de decisión públicos directamente comparables (mismo backbone, mismas cabezas, misma tarea). La única comparación documentable es con el modelo base del que deriva.

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klyra-Decision-2B-V2-Preview | ~2B (backbone) + adaptador LoRA (no disponible el recuento) | No disponible | Decisión no generativa (choice/score/noul) | No disponible | Repositorio HuggingFace, 0 descargas |
| openbmb/MiniCPM5-2B-Midtrain | ~2B | No disponible en la información proporcionada | Generación de texto (checkpoint de midtrain) | No disponible en la información proporcionada | Modelo base público en HuggingFace |
| Otros modelos de decisión o *reward models* de ~2B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; es un bloqueante legal para producción.
- Artefacto experimental: la propia model card lo etiqueta como `experimental`, con 0 descargas y 0 likes; no hay evidencia de uso en terceros.
- No es un modelo autónomo: requiere el backbone `openbmb/MiniCPM5-2B-Midtrain`, código propio para instanciar las tres cabezas y cargar `heads.pt`; no funciona con `pipeline()` estándar.
- El repositorio reporta 0.0 GB, lo que puede indicar que los pesos del adaptador no están efectivamente subidos o que son punteros LFS a verificar antes de cualquier evaluación.
- Inconsistencia de nomenclatura: el ID del repositorio dice `Klyra-Decision-2B-V2-Preview` mientras que el título de la model card dice `Klyra-Decision-2B-V2-Million-Kaggle`; conviene confirmar qué artefacto corresponde a qué versión.
- Procedencia de datos opaca: el pool de hasta un millón de registros es multi-fuente y las licencias se remiten a un manifiesto no incluido en la información disponible; existe riesgo de contaminación y de obligaciones de atribución heredadas.
- Semántica de la clase `noul` no documentada: su significado y su comportamiento esperado no se describen, lo que impide validar esa salida.
- Sin idiomas declarados: no se puede asumir cobertura multilingüe ni siquiera en castellano.
- Sin benchmarks verificables: la mención a JevBench Public no aporta cifras y se desvincula de la puntuación oficial del leaderboard.
- Riesgo de alucinación: al ser no generativo, el riesgo de texto inventado es bajo por diseño, pero la calibración de las puntuaciones y la fiabilidad de las decisiones son desconocidas; requiere validación contra un conjunto etiquetado propio.
- Sin información de sesgos: no hay evaluación de sesgo publicada ni documentación sobre la demografía o dominio de los datos de entrenamiento.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede garantizar el comportamiento con entradas largas en tareas de reranking.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jahirrrr/Klyra-Decision-2B-V2-Preview
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Midtrain
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas genéricas de Instagram (https://www.instagram.com/, https://help.instagram.com/, https://about.instagram.com/) sin relación con el artefacto.
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
