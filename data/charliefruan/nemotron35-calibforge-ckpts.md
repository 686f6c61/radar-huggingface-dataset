# CharlieFRuan/nemotron35-calibforge-ckpts

## Resumen

El repositorio `CharlieFRuan/nemotron35-calibforge-ckpts` no contiene un modelo listo para usar, sino un conjunto de checkpoints distribuidos en formato Megatron correspondientes a ejecuciones de RL (aprendizaje por refuerzo) sobre un modelo de la familia Nemotron 3.5 Lightning, bajo el nombre interno CalibForge v2 (Horizon). El autor, CharlieFRuan, publica estos artefactos intermedios cada 25 pasos de entrenamiento, con una carpeta por ejecución, lo que sugiere un uso orientado a investigación y depuración de pipelines de RL más que a inferencia directa.

La relevancia de este repositorio es limitada para el desarrollador medio: no incluye pesos en formato Hugging Face, no declara licencia, idiomas ni pipeline, y no proporciona model card descriptiva con arquitectura, número de parámetros o contexto. La única indicación técnica es que los checkpoints deben convertirse mediante un script (`handoff/ops/convert_ckpt_to_hf.sh`) en una rama concreta del repositorio del autor, lo que implica un proceso de conversión no trivial antes de poder cargar el modelo.

En el momento de redactar esta ficha no hay descargas ni interacciones registradas, y la información pública disponible es insuficiente para caracterizar el modelo subyacente con rigor. Por tanto, esta ficha documenta lo que se sabe del artefacto y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer de la familia Nemotron, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints distribuidos Megatron (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de ejecuciones de RL realizadas con SkyRL, un framework de entrenamiento por refuerzo para modelos de lenguaje, sobre un modelo denominado Nemotron-3.5-Lightning en la variante CalibForge v2 (Horizon). Los checkpoints se guardan en formato distribuido de Megatron cada 25 pasos, con una carpeta por ejecución, lo que indica un entrenamiento a gran escala con paralelismo de tensor y/o pipeline gestionado por Megatron-LM.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, la receta de RL (tipo de recompensa, algoritmo como PPO o GRPO, etc.) ni detalles de la arquitectura del modelo base. La única indicación operativa es que la conversión a pesos Hugging Face requiere ejecutar `handoff/ops/convert_ckpt_to_hf.sh` sobre la rama `charlie/calibforge-rl-1115`, lo que confirma que los artefactos no son directamente consumibles por `transformers`, vLLM o llama.cpp sin ese paso previo.

## Capacidades

- No se documentan capacidades específicas del modelo en la información disponible.
- Al tratarse de checkpoints de RL de un modelo de lenguaje, se presupone generación de texto, pero no hay confirmación de razonamiento, código, matemáticas, visión ni tool calling.
- No consta soporte de agentes, multi-step reasoning ni modos especiales (thinking, visión, audio).
- No consta información sobre capacidades multilingües.
- El artefacto en sí no es un modelo utilizable: requiere conversión desde formato Megatron antes de cualquier uso.

## Casos de uso

- Investigación en RL para modelos de lenguaje: los checkpoints intermedios cada 25 pasos permiten analizar la evolución del entrenamiento, comparar recompensas entre pasos y detectar inestabilidades, siempre que se disponga del pipeline SkyRL y del script de conversión.
- Reproducibilidad de experimentos: una carpeta por ejecución facilita auditar configuraciones y reanudar entrenamientos desde un punto concreto, útil en entornos de investigación con infraestructura Megatron.
- Depuración de conversión Megatron a Hugging Face: el repositorio sirve como caso de prueba para validar `convert_ckpt_to_hf.sh` en la rama indicada antes de aplicar el proceso a checkpoints definitivos.
- Estudio de dinámicas de RL: al tener snapshots periódicos, se pueden medir métricas de recompensa, longitud de respuesta o diversidad a lo largo del entrenamiento y correlacionarlas con el paso.
- Base para evaluación interna: tras la conversión, un equipo podría evaluar el modelo resultante en sus propios benchmarks, aunque no hay garantía de que el checkpoint sea un modelo final pulido.
- Archivo y trazabilidad: conservar los checkpoints como referencia histórica de la ejecución CalibForge v2 (Horizon) para comparaciones futuras dentro del mismo proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros del modelo base.
- GPU recomendadas: no disponible; el formato Megatron sugiere entrenamiento en clústeres con GPUs de datacenter (A100, H100) y paralelismo distribuido.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo; el formato de checkpoint distribuido no es cargable directamente en una GPU individual sin conversión.
- Opciones de despliegue: no aplicables al checkpoint tal cual; tras la conversión con `handoff/ops/convert_ckpt_to_hf.sh` podría desplegarse con vLLM, TGI o transformers, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CharlieFRuan/nemotron35-calibforge-ckpts | no disponible | no disponible | Megatron distribuido | no disponible | checkpoints intermedios de RL |
| Nemotron (familia oficial de NVIDIA) | variable según variante | no disponible | safetensors / HF | variable (a menudo abierta con condiciones) | pesos listos para inferencia |
| Otros checkpoints de RL publicados en HF | variable | variable | variable | variable | normalmente con model card descriptiva |

La comparación directa no es posible con rigor: el repositorio analizado no es un modelo final sino un conjunto de checkpoints de investigación, y no se dispone de parámetros, contexto ni licencia para contrastar con alternativas.

## Limitaciones y advertencias

- No es un modelo listo para producción: los pesos están en formato Megatron distribuido y requieren conversión explícita.
- Ausencia total de model card descriptiva: sin arquitectura, parámetros, contexto ni idiomas declarados.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Riesgo de sesgos y alucinaciones: inherente a cualquier modelo de lenguaje, pero no cuantificable sin evaluación.
- Checkpoints intermedios de RL: el rendimiento puede ser inestable y no representar el estado final del entrenamiento.
- Dependencia de una rama concreta (`charlie/calibforge-rl-1115`) y de un script específico, lo que añade fragilidad al proceso de reproducción.
- Cero descargas y cero interacciones: no hay evidencia de validación por parte de la comunidad.
- No apto para usuarios sin experiencia en Megatron-LM y SkyRL.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CharlieFRuan/nemotron35-calibforge-ckpts
- Script de conversión referenciado en la model card: `handoff/ops/convert_ckpt_to_hf.sh` (rama `charlie/calibforge-rl-1115`, repositorio del autor no enlazado en la información disponible)
- SkyRL (framework de RL citado): no disponible enlace directo en la información proporcionada
- Nemotron (familia de modelos de NVIDIA): no disponible enlace directo en la información proporcionada
