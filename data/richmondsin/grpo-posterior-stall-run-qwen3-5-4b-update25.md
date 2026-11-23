# richmondsin/grpo-posterior-stall-run-qwen3.5-4b-update25

## Resumen

`richmondsin/grpo-posterior-stall-run-qwen3.5-4b-update25` es un modelo derivado de Qwen3.5-4B publicado por el usuario richmondsin en Hugging Face. No se trata de un modelo entrenado desde cero, sino de la fusion (merge) de un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-4B, dando como resultado un checkpoint completo con 4.659.865.088 parametros (aproximadamente 4,66 mil millones). El pipeline declarado es `image-text-to-text`, lo que indica que hereda del modelo base capacidades multimodales de entrada imagen y texto, aunque la model card no detalla estas capacidades.

El interes tecnico de este checkpoint reside en el proceso de entrenamiento que documenta: un ciclo de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) descrito como "stall run", con parametros concretos (fase 5, phase_set 240, set_keep 160, sin termino de longitud, rho_exact 1, teacher_row 1, stall_cap 3.5, stall_play 1) y correspondiente a la actualizacion 25. El adaptador LoRA emplea rango 16 y alpha 32, con una regla de fusion explicita (`W <- W + (lora_alpha / r) * B @ A`, escala 2.0) calculada en fp32 y almacenada en bf16.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. Su relevancia es acotada: sirve como evidencia reproducible de un experimento de RL sobre Qwen3.5-4B y como punto de partida para quien quiera inspeccionar el efecto del merge LoRA, pero no constituye un modelo listo para produccion ni dispone de evaluacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen3.5-4B); tipo exacto no disponible |
| Parametros totales | 4.659.865.088 (4,66 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); repo de 9,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer multimodal con pipeline `image-text-to-text`. No se dispone de detalles adicionales sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni composicion del dataset original del modelo base en la informacion proporcionada. Lo que si esta documentado es el proceso de ajuste: se entreno un adaptador LoRA de rango 16 y alpha 32 mediante GRPO, un algoritmo de aprendizaje por refuerzo sin modelo critico que optimiza recompensas relativas dentro de grupos de muestras. La configuracion del run se describe como "stall run" con parametros especificos de fase, tamano de conjunto y limites de estancamiento (stall_cap 3.5, stall_play 1), y corresponde a la actualizacion 25 del ciclo.

El merge se realizo con la regla `W <- W + (lora_alpha / r) * B @ A` aplicada a 200 modulos LoRA, con factor de escala 2.0, computo en fp32 y almacenamiento en bf16. El autor documenta verificaciones en `MERGE-REPORT.json`: tres modulos aleatorios quedan dentro del redondeo bf16 respecto a `W + s*B@A`, otros 538 tensores son byte-identicos al base y el total de bytes de tensores coincide con el modelo base (9.319.737.856 bytes). Todos los ficheros no-peso (config, tokenizer, chat template, processor configs, generation config) se copian sin modificar del base. El aviso del autor es explicito: al estar fusionado en bf16, las salidas pueden diferir ligeramente de ejecutar base + adaptador por separado.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Procesamiento de entrada imagen-texto segun el pipeline declarado `image-text-to-text`; el alcance concreto (VQA, captioning, OCR) no esta especificado.
- Razonamiento y matematicas: previsible por linaje Qwen3.5, pero sin evaluacion publicada que lo confirme en este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Modo thinking explicito: no disponible.
- Audio: no disponible.

## Casos de uso

- Reproduccion de experimentos de RL: el checkpoint permite inspeccionar el estado resultante de la actualizacion 25 de un run GRPO concreto, comparandolo con el base para estudiar el efecto del merge LoRA sobre los pesos.
- Analisis de fusion de adaptadores: util para validar pipelines de merge que aplican `W + (alpha/r) * B @ A` en fp32 con almacenamiento bf16, usando `MERGE-REPORT.json` como referencia de verificacion.
- Investigacion sobre estabilidad de entrenamiento: los parametros "stall" documentados (stall_cap, stall_play, fases) sirven como caso de estudio para quienes disenan curricula de RL y quieren analizar comportamiento de estancamiento.
- Fine-tuning posterior: al ser un checkpoint completo compatible con transformers, puede servir de inicializacion para nuevos ajustes supervisados o de RL sobre la misma base.
- Pruebas de pipelines multimodales image-text-to-text en entornos de laboratorio, verificando que el merge preserva el comportamiento del processor y chat template del base.
- Docencia y divulgacion: ejemplo didactico de trazabilidad de un merge LoRA, con hashes, conteos de tensores y verificaciones byte a byte documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica conviene reservar 12-16 GB para contexto moderado.
- Cuantizacion a 8 bits: entorno de 5-6 GB de pesos; a 4 bits: entorno de 2,5-3 GB. No se han publicado GGUF oficiales para este checkpoint.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- GPU consumer: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion agresiva, potencialmente en tarjetas de 8-12 GB, aunque sin pesos cuantizados publicados esto requeriria conversion propia.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI previa conversion/verificacion de compatibilidad, llama.cpp/Ollama solo tras generar GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| grpo-posterior-stall-run-qwen3.5-4b-update25 | 4,66 mil millones | no disponible | no disponible | Hugging Face, 0 descargas | Merge LoRA de investigacion, sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4 mil millones (segun denominacion) | no disponible | no disponible en esta ficha | Hugging Face, modelo oficial | Modelo de referencia del que deriva el checkpoint |
| Alternativas de ~4B de otros laboratorios | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que consultar la licencia del modelo base Qwen3.5-4B antes de cualquier despliegue.
- Cero descargas y cero likes: ausencia total de validacion comunitaria; no hay evidencia de calidad mas alla de las comprobaciones de integridad del merge.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que el rendimiento real es desconocido.
- Sin idiomas declarados: no se puede afirmar cobertura multilingue concreta.
- Diferencias por redondeo bf16: el autor advierte que las salidas pueden diferir del base + adaptador en tiempo de ejecucion, lo que complica la comparacion exacta con el run original.
- Sesgos y alucinaciones: no documentados; al heredar del base, arrastra los sesgos del modelo original, agravados potencialmente por un ajuste RL de proposito experimental.
- Naturaleza experimental: el nombre ("stall run", "posterior-learning") sugiere un artefacto de investigacion, no un modelo pulido para produccion; no se recomienda su uso en entornos de clientes sin evaluacion propia.
- Contexto desconocido: no se puede planificar uso con ventanas largas sin verificar la configuracion del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-stall-run-qwen3.5-4b-update25
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
