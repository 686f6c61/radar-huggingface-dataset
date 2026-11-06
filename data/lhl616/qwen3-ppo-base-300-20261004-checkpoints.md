# lhl616/qwen3-ppo-base-300-20261004-checkpoints

## Resumen

`lhl616/qwen3-ppo-base-300-20261004-checkpoints` es un archivo de checkpoints de investigación derivado de Qwen3-4B-Base, publicado por el usuario lhl616. No se trata de un modelo listo para usar, sino de una colección de estados intermedios de un entrenamiento con PPO (Proximal Policy Optimization) sobre el modelo base de Qwen. El experimento se describe como una línea base "native-MSE PPO" con semilla 42, 300 batches, 30 batches de warmup solo para el crítico y 1024 respuestas por batch.

El repositorio, de 337,4 GB, contiene diez checkpoints del actor (global_step de 30 a 300 en incrementos de 30) junto con críticos y diverso material auxiliar. Los pesos del actor están en formato FSDP fragmentado (`.pt`), no en safetensors fusionados, y el directorio `huggingface/` contiene solo configuración y tokenizer, no pesos utilizables con `from_pretrained`. Por tanto, su interés es fundamentalmente reproducir o auditar una ejecución de RL, no desplegar un asistente.

La relevancia es acotada: resulta útil para investigadores que quieran inspeccionar checkpoints intermedios de un entrenamiento PPO sobre Qwen3-4B, comparar críticos nativos frente a variantes HL-Gauss o estudiar la evolución del entrenamiento. El autor advierte explícitamente que no se reclama ninguna mejora de rendimiento estable ni superioridad causal. La licencia declarada es Apache 2.0, con atribución a Qwen retenida mediante `LICENSE` y `NOTICE`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-4B-Base); checkpoints de actor FSDP y críticos con cabeza de valor escalar |
| Parámetros totales | 4B (modelo base Qwen3-4B-Base; no se detalla recuento propio) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se mencionan exportaciones BF16 como derivadas separadas; el original conserva precisión y bytes originales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con atribución Qwen en `LICENSE` y `NOTICE`) |
| Formato de pesos | FSDP `.pt` fragmentado (`model_world_size_4_rank_*.pt`); exportaciones safetensors separadas; `huggingface/` solo config/tokenizer |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B-Base, un transformer decoder de 4B parámetros. Sobre él se aplica un entrenamiento de refuerzo con PPO en su variante "native-MSE", partiendo de pesos frescos del base, con semilla 42, 300 batches, 1024 respuestas por batch y 30 batches de warmup en los que solo se entrena el crítico. El actor se guarda como checkpoints FSDP que requieren las cuatro shards `model_world_size_4_rank_*.pt` y utilidades compatibles de PyTorch/VERL para cargar o fusionar.

Los críticos son modelos de valor por token, no modelos causales de lenguaje: usan una cabeza de valor escalar. En la variante HL-Gauss, la cabeza tiene 101 logits sobre bins en el rango [-1,2, 1,2], con centros `-1,2 + (i+0,5)*2,4/101`, y el valor se calcula como la media ponderada por softmax en FP32 de esos centros; los objetivos gaussianos usan sigma `0,75*2,4/101`. El archivo categórico incluye además una pequeña implementación de referencia matemática que depende del entorno original de VERL para sus hooks de entrenamiento. No se redistribuye el dataset de entrenamiento.

## Capacidades

- No es un modelo de inferencia listo para usar: el repositorio es un archivo de checkpoints de investigación.
- Los checkpoints del actor conservan la capacidad de evaluación del modelo, según el autor, pero no se valida mediante forward-pass ni restauración.
- Los críticos no son modelos de lenguaje: producen valores escalares por token (o distribuciones de 101 bins en HL-Gauss).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.
- No se documentan capacidades multilingües específicas más allá de las heredadas del base Qwen3-4B-Base.
- Los ficheros de estado RNG/scheduler/dataloader, cuando existen, no permiten continuar el entrenamiento de forma exacta sin el estado del optimizador (no incluido).

## Casos de uso

- Auditoría de entrenamiento PPO: inspeccionar los diez checkpoints intermedios (steps 30 a 300) para estudiar la evolución de los pesos del actor a lo largo de los batches.
- Investigación sobre críticos de valor: comparar la variante nativa de cabeza escalar con la variante HL-Gauss de 101 bins usando los centros y sigma documentados.
- Reproducción parcial de experimentos: cargar las shards FSDP con utilidades compatibles de VERL/PyTorch para reanudar evaluación, sabiendo que no hay estado del optimizador.
- Estudio de estabilidad de RL: analizar cómo varían las políticas intermedias frente al base Qwen3-4B-Base en distintas etapas del entrenamiento.
- Desarrollo de utilidades de merge FSDP: usar los checkpoints como caso de prueba para herramientas de fusión de shards y exportación a safetensors/BF16.
- Docencia y formación: ilustrar el formato de checkpoints FSDP y la diferencia entre pesos originales FP32 y exportaciones BF16 en un pipeline de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna mejora de rendimiento estable ni superioridad causal, y que las ramas de continuación y las muestras de política propia no son evaluaciones pareadas intercambiables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 337,4 GB, pero corresponde a múltiples checkpoints y estados, no a un único modelo desplegable.
- GPU recomendadas: no disponible. El entrenamiento original usa FSDP con al menos 4 rangos (`model_world_size_4_rank_*.pt`), lo que sugiere un despliegue multi-GPU.
- ¿Cabe en GPU de consumo? No disponible; al no existir pesos fusionados ni GGUF, no se puede desplegar directamente en consumer GPU sin trabajo previo de merge y conversión.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI sin una fusión previa de las shards FSDP y exportación a safetensors. Se requieren utilidades compatibles de PyTorch/VERL.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lhl616/qwen3-ppo-base-300-20261004-checkpoints | 4B (base Qwen3-4B-Base) | no disponible | FSDP `.pt` fragmentado | Apache 2.0 | Checkpoints de investigación, 0 descargas |
| Qwen/Qwen3-4B-Base | 4B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo base público |
| Otros checkpoints PPO de Qwen3-4B | no disponible | no disponible | variable | variable | no disponible |

La comparación directa con alternativas de la misma categoría (checkpoints de RL sobre Qwen3-4B) no está disponible en la información proporcionada. Frente al base Qwen3-4B-Base, la diferencia principal es el formato: el base es un modelo desplegable, mientras que este repo es un archivo de estados de entrenamiento.

## Limitaciones y advertencias

- No es un modelo `from_pretrained`: la raíz del repositorio no constituye un modelo Transformers único; el directorio `huggingface/` solo contiene config y tokenizer.
- Los checkpoints del actor requieren las cuatro shards FSDP y utilidades compatibles de PyTorch/VERL para cargar o fusionar.
- No se incluyen ficheros de optimizador; muchos estados Adam originales ya fueron eliminados antes de la publicación, por lo que no es posible continuar el entrenamiento de forma exacta.
- No se valida la restauración ni el forward-pass: la publicación por sí sola no garantiza que los checkpoints carguen correctamente.
- Solo deben cargarse artefactos `.pt` basados en pickle en entornos de confianza.
- Los críticos no son modelos de lenguaje y no deben usarse como tales.
- El autor no reclama mejoras de rendimiento estables ni superioridad causal; son checkpoints experimentales.
- La cobertura del manifiesto puede estar incompleta mientras las subidas estén en curso; la finalización se registra aparte.
- No se redistribuye el dataset de entrenamiento.
- Posibles sesgos y alucinaciones: no documentados en la información disponible; se heredan los del base Qwen3-4B-Base, no detallados aquí.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución de Qwen según `LICENSE` y `NOTICE`.

## Enlaces

- Hugging Face: https://huggingface.co/lhl616/qwen3-ppo-base-300-20261004-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
