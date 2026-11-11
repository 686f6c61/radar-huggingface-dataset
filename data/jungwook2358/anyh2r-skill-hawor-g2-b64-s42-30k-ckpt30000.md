# jungwook2358/anyh2r-skill-hawor-g2-b64-s42-30k-ckpt30000

## Resumen

El modelo `anyh2r-skill-hawor-g2-b64-s42-30k-ckpt30000` es un checkpoint de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario jungwook2358 en Hugging Face. Se trata de una réplica de un entrenamiento previo realizado por junhyeong dentro de la infraestructura AnyH2R, un marco de entrenamiento con diversidad de tareas. El modelo parte del checkpoint RLDX-1-PT-IMG y se entrena con 2 GPU, batch global de 64 y semilla 42 durante 30.000 pasos, con un chunk de 16 acciones por inferencia.

La relevancia del modelo es limitada fuera de su contexto experimental: se trata de un checkpoint intermedio de un pipeline de investigación en robótica, no de un modelo generalista listo para producción. El repositorio incluye el checkpoint del trainer de Hugging Face (tres shards de safetensors), el tokenizador de acciones específico del proyecto (100k tokens), contratos de inferencia y especificaciones de dataset, pero excluye los estados del optimizador de DeepSpeed y los estados RNG.

Al no disponer de model card detallada con arquitectura, número de parámetros o datos de entrenamiento, muchos campos de esta ficha quedan marcados como "no disponible". El tamaño del repositorio (13,8 GB) sugiere un modelo de escala media, pero no permite deducir el número exacto de parámetros sin acceso a los archivos de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); arquitectura base no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (3 shards + index) |

## Arquitectura y entrenamiento

El modelo es un VLA (vision-language-action) entrenado desde el checkpoint RLDX-1-PT-IMG. El pipeline de entrenamiento emplea 2 GPU, batch global de 64, semilla 42 y 30.000 pasos, con un chunk de 16 acciones por paso de inferencia. La renovación de instrucciones está desactivada ("instruction renewal off"), lo que implica que las instrucciones de tarea no se regeneran durante el entrenamiento. El checkpoint corresponde a la celda de diversidad de tareas "skill-hawor" del marco AnyH2R, cuyo objetivo es aumentar la diversidad de habilidades aprendidas.

El repositorio incluye el tokenizador de acciones de decodificación dividida (split-decoder) con 100.000 tokens, junto con estadísticas de normalización (`egopi_prq_stats.json`) y un recibo de finalización. También se incluyen `INFERENCE_CONTRACT.json` (normalizadores, activos geométricos y etiqueta de despliegue necesarios en inferencia) y `diversity_contract.json` (especificaciones del dataset). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico mediante predicción de acciones en chunks de 16 pasos por inferencia.
- Procesamiento conjunto de visión, lenguaje y acción (VLA), integrando instrucciones en lenguaje natural con observaciones visuales para generar comandos motores.
- Entrenamiento orientado a diversidad de habilidades (celda "skill-hawor"), lo que sugiere cobertura de múltiples tareas dentro del mismo checkpoint.
- Tokenizador de acciones dedicado (100k tokens) con decodificación dividida.
- No se dispone de información sobre tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Investigación en aprendizaje por imitación robótica: el checkpoint puede usarse como punto de partida o referencia para estudiar el efecto de la diversidad de tareas en políticas VLA, comparando con el run original de junhyeong.
- Reproducción de experimentos: al incluir contratos de inferencia, normalizadores y estadísticas del dataset, permite replicar las condiciones exactas del entrenamiento original en un entorno controlado.
- Evaluación de políticas de manipulación: el chunk de 16 acciones y el tokenizador dedicado permiten desplegar la política en entornos simulados o reales para medir tasas de éxito por habilidad.
- Análisis de tokenización de acciones: el tokenizador de 100k tokens con decodificación dividida puede estudiarse de forma aislada para entender cómo se discretizan las trayectorias motoras.
- Base para fine-tuning específico: al ser un checkpoint intermedio (paso 30.000), puede servir como inicialización para entrenamientos posteriores en tareas concretas dentro del mismo marco AnyH2R.
- Estudio de contratos de despliegue: los archivos `INFERENCE_CONTRACT.json` y `diversity_contract.json` documentan los requisitos de normalización y geometría, útiles para auditar pipelines de despliegue robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 13,8 GB en safetensors, lo que da una cota inferior orientativa del tamaño de los pesos en precisión nativa.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 2 GPU, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el pipeline declarado es `robotics`, y el repositorio incluye contratos de inferencia propios del marco AnyH2R.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (VLA robóticos) con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial requiere consultar al autor antes de cualquier despliegue.
- Checkpoint intermedio de investigación: no está validado como modelo de producción y carece de documentación sobre robustez, sesgos o tasas de éxito.
- Exclusión de estados del optimizador (DeepSpeed) y RNG: no permite reanudar el entrenamiento desde el paso 30.000 de forma exacta.
- Idiomas no declarados: no se puede garantizar el comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación y sesgos: no evaluado; al ser un modelo de acción, el riesgo se traslada a comandos motores incorrectos o inseguros.
- Dependencia de assets externos: la inferencia requiere los normalizadores, activos geométricos y la etiqueta de despliegue del `INFERENCE_CONTRACT.json`, lo que limita la portabilidad.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/jungwook2358/anyh2r-skill-hawor-g2-b64-s42-30k-ckpt30000
- Repositorio de referencia del run original (según model card): jun-brro/RLDX-1-egopi, rama `feat/anyh2r-diversity-training`, commit `fc72b51` (no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
