# junbrro/h2rb-e1-skill-single-g2-b64-s42-30k-actsilu-20261108

## Resumen

El modelo `junbrro/h2rb-e1-skill-single-g2-b64-s42-30k-actsilu-20261108` es un checkpoint de inferencia publicado en Hugging Face por el usuario `junbrro`, entrenado hasta el paso 30.000 (30k) dentro del pipeline `junhyeong-e1e2-skill-single-pipeline-g2-1107-r2`. No es un modelo de lenguaje generalista, sino un modelo de política (policy) para control robótico, orientado a tareas de manipulación ("skill") dentro del proyecto RLDX-1. El nombre codifica la configuración de entrenamiento: `g2` (probablemente grupo o generación 2), `b64` (batch size 64), `s42` (semilla 42), `30k` (pasos) y `actsilu` (activación SiLU en la cabeza de acciones).

El checkpoint contiene 6.915.094.616 parámetros en formato safetensors (13,9 GB en FP16/BF16), lo que lo sitúa en la escala de un modelo de ~7B. Incluye el tokenizador de acciones exacto, la normalización, la etiqueta del decodificador y el contrato SiLU, y está pensado para ejecutarse con el runtime del proyecto RLDX-1. El autor advierte explícitamente de que la finalización del entrenamiento no equivale a una tasa de éxito medida en robot real, y que se excluyen datos crudos, estados del optimizador y del RNG.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación interno, sin model card descriptiva, sin licencia declarada y sin resultados de benchmarks. Su interés radica en ser un ejemplo de checkpoint de política VLA (vision-language-action) verificable a nivel de paso de entrenamiento, útil para reproducibilidad y para integrarse en pipelines de robótica con el runtime adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de política para control robótico; tag RLDX-1; activación SiLU en cabeza de acciones) |
| Parametros totales | 6.915.094.616 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP16/BF16 por el tamaño de 13,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo más allá de las etiquetas del repositorio (`RLDX-1`) y del sufijo `actsilu`, que indica el uso de activación SiLU en la cabeza de predicción de acciones. Por el número de parámetros (6,9B) y el contexto del proyecto (políticas de manipulación robótica), es plausible que se trate de un transformer multimodal que combina observaciones visuales y consignas de tarea para emitir acciones discretizadas mediante un tokenizador de acciones específico, pero esto no está confirmado en la información disponible.

El entrenamiento alcanzó el paso 30.000, con batch size 64 y semilla 42, dentro del job `junhyeong-e1e2-skill-single-pipeline-g2-1107-r2`. El checkpoint es de solo inferencia: excluye datos crudos, estados del optimizador y del RNG. No se documentan el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o aprendizaje por imitación. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones de control robótico para tareas de manipulación ("skill") dentro del ecosistema RLDX-1.
- Tokenización de acciones específica del proyecto, incluida en el checkpoint (`actlat/` en repos similares del mismo autor).
- Normalización y contrato de decodificación preservados para garantizar la coherencia entre entrenamiento e inferencia.
- Compatibilidad con el runtime del proyecto RLDX-1 (requisito explícito del autor).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes o multilingüismo.

## Casos de uso

- Reproducción de experimentos de robótica: el checkpoint permite reanudar la evaluación en el paso exacto 30.000 con el runtime RLDX-1, facilitando la comparación con otras semillas o configuraciones del mismo pipeline.
- Evaluación de políticas de manipulación en simulación: al incluir el tokenizador de acciones y la normalización, puede cargarse en entornos simulados compatibles para medir tasas de éxito antes de transferir a hardware real.
- Integración en pipelines de investigación VLA: sirve como punto de partida para fine-tuning sobre nuevas tareas "single-skill" manteniendo la cabeza de acciones SiLU.
- Auditoría de contratos de inferencia: útil para verificar que la decodificación, normalización y activación coinciden entre entrenamiento y despliegue, un problema frecuente en políticas robóticas.
- Baseline para comparativas internas: al estar fijado el paso, batch y semilla, permite aislar el efecto de cambios en datos o arquitectura en experimentos controlados.
- Despliegue en laboratorio con el runtime RLDX-1: para pruebas de brazos robóticos en entornos acotados, siempre que se valide previamente la tasa de éxito real, que el autor no garantiza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la finalización del entrenamiento (paso 30.000) no constituye una tasa de éxito medida en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14 GB en FP16/BF16 (13,9 GB de pesos más overhead de activaciones y buffers del runtime). En cuantización de 8 bits, en torno a 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue cómodo en FP16. Una RTX 4090 (24 GB) debería poder cargar los pesos en FP16, aunque el margen para activaciones y contexto es limitado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: el autor exige el runtime del proyecto RLDX-1; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| h2rb-e1-skill-single-g2-b64-s42-30k-actsilu-20261108 | 6,9B | no disponible | no disponible | Hugging Face (0 descargas) | Checkpoint de política RLDX-1, solo inferencia |
| junbrro/egopi-arm2-rbbt-anyh3-AB-30k-actsilu-mlxp-20260924 | no disponible | no disponible | no disponible | Hugging Face | Mismo autor, mismo paso 30k, configuración distinta |
| junbrro/egopi-arm2-rbbt-anyh3-A-30k-actsilu-mlxp-20260924 | no disponible | no disponible | no disponible | Hugging Face | Variante A del mismo pipeline |

No se dispone de información sobre modelos de terceros comparables en la misma categoría (políticas VLA de ~7B para manipulación) dentro de la búsqueda realizada.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay información sobre datos, arquitectura, sesgos ni evaluación.
- Licencia no declarada: no puede asumirse uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- El autor advierte de que el paso 30.000 no equivale a una tasa de éxito medida; no debe interpretarse como rendimiento validado en robot real.
- Dependencia estricta del runtime RLDX-1: sin él, el tokenizador de acciones, la normalización y la decodificación pueden no ser compatibles.
- Riesgo de alucinación o acciones erráticas inherente a políticas de control no evaluadas fuera de su pipeline.
- Sin información sobre sesgos, cobertura de idiomas ni robustez ante distribuciones de entrada distintas de las de entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso externo.
- Posible presencia de rutas de clúster originales en la configuración, como ocurre en otros repos del mismo autor; deben remapearse antes de usar.

## Enlaces

- Hugging Face: https://huggingface.co/junbrro/h2rb-e1-skill-single-g2-b64-s42-30k-actsilu-20261108
- Repo relacionado: https://huggingface.co/junbrro/egopi-arm2-rbbt-anyh3-AB-30k-actsilu-mlxp-20260924
- Repo relacionado: https://huggingface.co/junbrro/egopi-arm2-rbbt-anyh3-A-30k-actsilu-mlxp-20260924
