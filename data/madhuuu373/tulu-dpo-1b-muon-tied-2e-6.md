# Madhuuu373/tulu-dpo-1b-muon-tied-2e-6

## Resumen

Tülu DPO 1.7B — Muon, tied learning rate (2e-6) es un checkpoint de ajuste fino por preferencias (DPO) derivado del modelo SFT `blumodel_step_11590` (Tülu SFT 1B), que a su vez se apoya en la arquitectura Qwen3. Lo publica el usuario Madhuuu373 como tercer brazo de un ablation controlado que compara el optimizador Muon frente a AdamW en la fase DPO. No es un modelo pensado para uso general en producción: es un artefacto experimental de investigación cuyo valor está en la reproducibilidad del experimento.

El modelo resuelve una pregunta concreta: si cambiar la dirección de actualización de Muon por AdamW en las matrices del cuerpo del transformer altera la calidad del modelo DPO resultante. La respuesta del autor es que no de forma significativa: con la misma tasa de aprendizaje (2e-6) en todos los grupos de parámetros, la diferencia frente al brazo AdamW es de 0,0003 en val loss, muy por debajo del ruido entre ejecuciones (~0,019). Lo relevante ahora es que documenta con detalle el protocolo (sweep de LR, configuración de 4 GPUs, reanudación tras fallo NCCL) y deja constancia explícita de que el modelo no está evaluado en benchmarks de capacidades.

El checkpoint tiene 1.7B parámetros (1.585B en 168 matrices del cuerpo, 93,2% del total), entrenado durante 1 época (9.517 pasos, 32 pares por paso) sobre 4×H200. Se distribuye en dos formatos: `hf/` con safetensors estándar para inferencia y `dcp/` con estado completo del optimizador para reanudar entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `Qwen3ForCausalLM`) |
| Parametros totales | 1.7B (1.585B en 168 matrices del cuerpo, 93,2%) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en `hf/`) |
| Idiomas soportados | en (inglés) |
| Licencia | ODC-BY |
| Formato de pesos | safetensors (`hf/`) y checkpoint distribuido BluTrain de 4 shards (`dcp/`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3 en su variante causal decoder-only y se obtiene mediante DPO sobre el checkpoint SFT `blumodel_step_11590`, que actúa simultáneamente como inicialización y como política de referencia. El entrenamiento usa 9.517 pasos (una época) con 32 pares de preferencia por paso, β = 5 y semilla 1234, sobre 4×H200 a 827 ms/paso y 74,7k tokens/s. El schedule es warm-up lineal del 10% seguido de decaimiento lineal hasta cero.

La innovación técnica central es el uso de Muon en las 168 matrices del cuerpo (1.585B parámetros) y AdamW en el embedding atado y los escalares 1-D, con una tasa de aprendizaje única de 2e-6 para ambos grupos. Esto convierte el experimento en una comparación de una sola variable frente al brazo AdamW: solo cambia la dirección de actualización. El autor documenta además un sweep de LR a 400 pasos (de 2e-6 a 3e-5) cuyo óptimo interior es 1e-5, pero el checkpoint publicado usa deliberadamente 2e-6 para igualar el baseline. Una limitación técnica relevante es que `ShardedMuon` nunca aplica el coeficiente de clipping a un tensor ortogonalizado, de modo que aproximadamente el 93% del modelo se entrenó sin clipping mientras el brazo AdamW sí lo aplicó (normas de gradiente entre 5 y 28 frente a clip 1.0). La ejecución se interrumpió en el paso 7.071 por un timeout NCCL de 600 s y se reanudó desde el paso 7.000 con estado completo del optimizador.

## Capacidades

- Generación de texto en inglés con plantilla de chat `tulu-plain-v1` basada en marcadores de rol en texto plano (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|endoftext|>`).
- Modelo ajustado por preferencias: la política se ha desplazado hacia respuestas preferidas según el conjunto de validación DPO (968 pares), con precisión de 0,6994.
- Conversaciones multi-turno y con prefijo de sistema: la plantilla se verificó para reproducir exactamente los token ids de entrenamiento en chats ordinarios, con sistema y multi-turno.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe: solo inglés declarado.
- Retención de capacidades de instrucción: no medida (el autor lo indica explícitamente como caveat).

## Casos de uso

- Investigación sobre optimizadores en DPO: reproducir el ablation Muon frente a AdamW con una única variable cambiada (dirección de actualización) y comparar val loss, accuracy y margin bajo el mismo protocolo.
- Estudio de sensibilidad a la tasa de aprendizaje: el sweep publicado (2e-6, 3e-6, 5e-6, 1e-5, 2e-5, 3e-5) sirve como referencia para diseñar barridos propios y para entender por qué un barrido corto de 400 pasos no predice el resultado a una época completa.
- Auditoría de checkpoints distribuidos: el subdirectorio `dcp/` con 4 shards, estado del optimizador y contador de pasos permite verificar la corrección de reanudaciones (cursor de datos y loss alineado a seis decimales).
- Base para experimentos de alineación a pequeña escala: al ser un modelo de 1.7B con licencia ODC-BY, se puede usar como punto de partida para probar variantes de DPO, β o composición del dataset de preferencias sin el coste de un modelo de 8B o 70B.
- Evaluación de robustez frente a jailbreak: dado que el autor cita la caída de seguridad de Tülu 3 de 93,1 a 87,2 al pasar de SFT a DPO en 8B, este checkpoint sirve para medir ese efecto a escala 1.7B (medición pendiente en el modelo publicado).
- Docencia y divulgación técnica: ejemplo completo y reproducible de pipeline DPO con Muon, plantilla de chat verificada y notas de ejecución multi-GPU, útil para materiales formativos sobre entrenamiento de modelos.

## Benchmarks y rendimiento

El autor solo reporta el objetivo de validación DPO (968 pares) y el sweep de LR. No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Brazo | Configuración de LR | Val loss | Accuracy | Margin |
|---|---|---|---|---|
| AdamW | 2e-6 en todo | 0,619577 | 0,6932 | 0,5070 |
| Muon, untied | cuerpo 1e-5 / embed 2e-6 | 0,618114 | 0,6973 | 0,5888 |
| Muon, tied (este) | 2e-6 en todo | 0,619916 | 0,6994 | 0,3360 |

Sweep de LR con LR atada, 400 pasos, validación sobre los 968 pares completos:

| LR | Val loss | Accuracy | Drift ratio | ¿Peor que la referencia? |
|---|---|---|---|---|
| 2e-6 | 0,6861 | 0,5981 | 3,52 | no |
| 3e-6 | 0,6842 | 0,6312 | 3,28 | no |
| 5e-6 | 0,6829 | 0,6560 | 3,11 | no |
| 1e-5 | 0,6796 | 0,6684 | 2,92 | no |
| 2e-5 | 0,6857 | 0,6694 | 2,47 | no |
| 3e-5 | 0,7026 | 0,6829 | 1,94 | sí (> ln 2) |

No se han publicado resultados de benchmarks de capacidades en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB de pesos (tamaño del repo), más overhead de activaciones y KV cache; el autor no publica cifras de VRAM.
- Entrenamiento: el run se ejecutó en 4×H200 a 827 ms/paso y 74,7k tokens/s, con 17 GB de checkpoint escritos cada 500 pasos.
- GPU recomendadas: H200 para entrenamiento (configuración validada); para inferencia, cualquier GPU con al menos ~4-6 GB de VRAM libre en bfloat16, aunque el autor no especifica modelos concretos.
- Cabe en GPU de consumo: no confirmado por el autor; por tamaño de pesos (3,4 GB) es plausible en tarjetas de 8 GB o más, pero no hay validación publicada.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `subfolder="hf"`; el autor no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta el throughput de entrenamiento (74,7k tok/s en 4×H200); no hay datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Val loss DPO | Accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Muon tied 2e-6 (este) | 1.7B | no disponible | 0,619916 | 0,6994 | ODC-BY | Hugging Face |
| Muon untied 1e-5 | 1.7B | no disponible | 0,618114 | 0,6973 | ODC-BY | Hugging Face |
| AdamW 2e-6 | 1.7B | no disponible | 0,619577 | 0,6932 | ODC-BY | Hugging Face |
| Tülu 3 8B (referencia citada) | 8B | no disponible | no disponible | no disponible | no disponible | no disponible |

Los tres brazos del ablation comparten base, datos y protocolo, por lo que la comparación es directa. Frente a Tülu 3 8B solo se dispone de la cifra de seguridad citada por el autor (93,1 en SFT, 87,2 en DPO); no hay comparación de rendimiento.

## Limitaciones y advertencias

- No evaluado en benchmarks de capacidades: retención de instrucciones, seguimiento de instrucciones y seguridad no están medidos.
- Sin repetición de semilla: ninguna diferencia entre brazos está establecida estadísticamente; el ruido entre ejecuciones (~0,019) es mucho mayor que las diferencias observadas.
- Clipping asimétrico: aproximadamente el 93% del modelo se entrenó sin clipping de gradiente, mientras el brazo AdamW sí lo aplicó; la comparación no es perfectamente limpia en ese eje.
- Riesgo de alucinación: no cuantificado por el autor; es un modelo DPO de 1.7B sin evaluación de fidelidad factual.
- Idiomas: solo inglés declarado; no hay soporte multilingüe documentado.
- Contexto: longitud de contexto no disponible; no se debe asumir la del modelo base sin verificación.
- Licencia ODC-BY: permite uso comercial con atribución, pero el modelo es un artefacto de investigación sin garantías de calidad para producción.
- Efecto DPO sobre seguridad: el autor advierte que el DPO tiende a reducir la robustez frente a jailbreak (evidencia de Tülu 3 a 8B), efecto no medido aquí.
- Caso límite de tokenización: un mensaje cuyo texto literal contenga `<|endoftext|>` se tokeniza como un token especial, mientras en entrenamiento eran cinco tokens planos.
- Escala: no comparar cifras absolutas con resultados publicados de 8B o 70B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Madhuuu373/tulu-dpo-1b-muon-tied-2e-6
- Brazo AdamW: https://huggingface.co/Madhuuu373/tulu-dpo-1b-adamw-2e-6
- Brazo Muon untied: https://huggingface.co/Madhuuu373/tulu-dpo-1b-muon-1e-5
- Checkpoint SFT de partida: https://huggingface.co/Madhuuu373/tulu-sft-1b-step11590
- Modelo base declarado: https://huggingface.co/navingv/fullchess
