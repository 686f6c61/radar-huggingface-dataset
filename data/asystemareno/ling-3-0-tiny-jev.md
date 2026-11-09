# AsystemAReno/Ling-3.0-tiny-JEV

## Resumen

Ling-3.0-tiny-JEV es un adaptador LoRA de rango 16 acompanado de una cabeza de decision JEV (decision head) para el modelo base inclusionAI/Ling-3.0-tiny, desarrollado por el usuario AsystemAReno y entrenado con la herramienta AReno. No se trata de un modelo de lenguaje completo, sino de un componente de ajuste fino que anade al modelo base la capacidad de emitir decisiones tipadas: en lugar de generar texto libre, el sistema puntua candidatos proporcionados por el cliente para responder a preguntas de tipo `choice`, `noul` y `score`.

El paquete se distribuye como safetensors (0,2 GB) y requiere descargar por separado los pesos originales de Ling-3.0-tiny, que no se incluyen en el repositorio. La inferencia se realiza mediante el servidor `areno serve`, con backend MLX en Mac o CUDA en GPU NVIDIA, exponiendo el endpoint `POST /v1/systemone` para peticiones de decision.

Su relevancia es acotada: es un artefacto experimental con cero descargas y un unico "like" en el momento de la consulta, orientado a flujos de decision estructurada (clasificacion, ranking de opciones y puntuacion) sobre el modelo Ling, mas que a generacion abierta. La informacion publica sobre licencia, idiomas y benchmarks es practicamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16, alpha 32) + cabeza de decision JEV sobre el transformer inclusionAI/Ling-3.0-tiny |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB; los pesos base no se incluyen) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (valor usado en el entrenamiento de ejemplo; no confirmado para inferencia) |
| Tipos de cuantizacion | Q4 en MLX (`--q4`) y QLoRA en CUDA (`--qlora`); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA + cabeza de decision) |
| Modelo base | inclusionAI/Ling-3.0-tiny (requerido, no incluido) |
| Libreria / runtime | areno |
| Backends soportados | mlx (Mac) y cuda (NVIDIA) |
| Tipos de pregunta | `choice`, `noul`, `score` |

## Arquitectura y entrenamiento

El artefacto combina un adaptador LoRA de rango 16 con alpha 32 y una cabeza de decision JEV anadida sobre el modelo base Ling-3.0-tiny. El entrenamiento se realiza con AReno mediante el algoritmo `jev`, con soporte para MLX (cuantizacion online Q4) y CUDA (QLoRA). No se especifica la arquitectura interna del modelo base mas alla de su identificador; la informacion disponible no detalla si Ling-3.0-tiny es un transformer denso, MoE o hibrido, ni su numero de parametros.

Los hiperparametros documentados en el ejemplo de ajuste fino incluyen batch size 16, mini-batch 2, learning rate 2e-4, learning rate de la cabeza 1e-4, max context length 4096, una epoca y guardado cada 10 pasos. El dataset debe estar en formato parquet de decisiones tipadas nativas. No se publican datos sobre volumen de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Decision tipada: puntua candidatos para preguntas de tipo `choice` (seleccion entre opciones), `noul` y `score`, en lugar de generar respuesta libre.
- Integracion como servicio: expone `POST /v1/systemone` mediante `areno serve`.
- Despliegue multiplataforma: backend MLX en Apple Silicon y backend CUDA en GPUs NVIDIA.
- Ajuste fino adicional: permite reentrenar el adaptador y la cabeza con `areno train --algo jev`.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling y agentes: no documentado para este adaptador; dependeria de las capacidades del modelo base Ling-3.0-tiny, no descritas en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Clasificacion con opciones cerradas: enviar al endpoint `/v1/systemone` una pregunta de tipo `choice` con un conjunto finito de etiquetas y obtener la puntuacion de cada candidato, util para enrutado de tickets o etiquetado de contenido.
- Ranking de respuestas candidatas: usar preguntas de tipo `score` para ordenar varias respuestas generadas por otro modelo y seleccionar la mejor segun la cabeza JEV.
- Filtrado de seguridad o calidad: emplear el tipo `noul` para descartar candidatos que no cumplen un criterio definido antes de devolverlos al usuario.
- Evaluacion automatizada de salidas: puntuar respuestas de un pipeline de generacion con un criterio aprendido, como paso de control de calidad previo a la entrega.
- Prototipado en Mac: servir el modelo con backend MLX en un portatil Apple Silicon para experimentar con decisiones tipadas sin GPU dedicada.
- Investigacion sobre cabezas de decision: reentrenar el adaptador con datasets parquet propios para estudiar el comportamiento de la cabeza JEV sobre Ling-3.0-tiny.
- Despliegue en GPU NVIDIA: servir con backend CUDA en infraestructura con GPU para integrar el endpoint de decision en un servicio interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador ocupa 0,2 GB y debe sumarse el modelo base Ling-3.0-tiny (tamano no indicado).
- GPU recomendadas: no disponible. El autor documenta backend CUDA generico, sin modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada; el soporte MLX en Mac sugiere viabilidad en Apple Silicon, y el uso de Q4/QLoRA apunta a escenarios de memoria reducida, pero no se aportan cifras.
- Opciones de despliegue: `areno serve` con `--backend mlx` o `--backend cuda`; entrenamiento con `areno train --algo jev`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ling-3.0-tiny-JEV | LoRA + cabeza de decision JEV | no disponible (adaptador 0,2 GB) | 4096 (entrenamiento) | no disponible | Requiere el modelo base Ling-3.0-tiny |
| inclusionAI/Ling-3.0-tiny | Modelo base | no disponible | no disponible | no disponible | Pesos originales necesarios para usar el adaptador |
| Alternativas de clasificacion/ranking | no disponible | no disponible | no disponible | no disponible | No se identifican modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: sin los pesos de inclusionAI/Ling-3.0-tiny el adaptador no funciona.
- No genera respuestas libres; solo puntua candidatos en los formatos `choice`, `noul` y `score`.
- Ausencia total de datos sobre licencia: no se puede confirmar el uso comercial ni las obligaciones de atribucion.
- Sin informacion sobre idiomas soportados, sesgos, tasas de alucinacion o robustez fuera del dominio de entrenamiento.
- Proyecto con cero descargas y un unico "like": no hay evidencia de validacion por la comunidad ni de mantenimiento continuado.
- El contexto de 4096 tokens corresponde al ejemplo de entrenamiento; no se garantiza para inferencia.
- Dependencia de la herramienta AReno y de su version con soporte para el flag de learning rate de la cabeza JEV, lo que puede limitar la reproducibilidad.
- No hay benchmarks publicados que permitan estimar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/AsystemAReno/Ling-3.0-tiny-JEV
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Descarga via ModelScope: `modelscope download --model AsystemAReno/Ling-3.0-tiny-JEV` (no se proporciona URL directa)
- Documentacion de AReno: no disponible
- Paper, blog o demo: no disponible
