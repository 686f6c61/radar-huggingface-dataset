# qrvmil/pi05-libero90-retain-five-task-blends-20261124

## Resumen

`qrvmil/pi05-libero90-retain-five-task-blends-20261124` es un experimento de fusión de modelos (model merging) sobre el checkpoint pi0.5 de OpenPI, orientado a robótica de manipulación en el benchmark LIBERO-90. El autor, qrvmil, parte de cinco especialistas fine-tuneados de forma independiente sobre cinco tareas de LIBERO-90 y genera 62 mezclas de pesos en FP32, junto con 6 controles, para evaluar si es posible combinar especialistas sin degradar el rendimiento en tareas retenidas.

El modelo se distribuye como artefacto de investigación, no como modelo listo para producción: la model card indica explícitamente que es un experimento en curso y que no se reclaman resultados finales. La evaluación cubre las tareas 0, 9, 14, 46, 47, 19 y 59 de LIBERO-90, con semillas 42 y 3407, y 50 ensayos por semilla, tarea y modelo. Las tareas 19 y 59 se usan como medidas de retención de tareas no entrenadas (held-out), no como cambio de distribución de escena.

La relevancia es metodológica: explora la extensión simultánea multi-especialista de RETAIN, un marco de adaptación continua secuencial, y publica informes HTML, protocolos y vídeos de éxito/fracaso para auditar la reproducibilidad. No hay datos publicados sobre arquitectura interna, número de parámetros, contexto o licencia en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de pi0.5 de OpenPI; detalles no publicados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (las mezclas se generan en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se mencionan checkpoints y artefactos HTML descargables; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso de model merging sobre el checkpoint base `pi05_libero` (gs://openpi-assets/checkpoints/pi05_libero) y cinco especialistas fine-tuneados de forma independiente sobre tareas de LIBERO-90, publicados en `qrvmil/pi05-libero90-five-task-sft-20261123`. Se generan 62 mezclas FP32 con coeficientes F=(0.9,0.9,0.9) y D=(0.9,1,1) aplicados a lenguaje, visión y acción, más 6 controles. La contribución de cada especialista SFT se reparte a partes iguales entre los especialistas incluidos en cada mezcla.

No se detalla en la información disponible la arquitectura interna del modelo base pi0.5 (tipo de transformer, mecanismos de atención, número de tokens de entrenamiento ni composición del dataset). Tampoco se especifica si hubo RLHF, DPO u otras etapas de alineación. La innovación metodológica declarada es la extensión simultánea multi-especialista del marco RETAIN, que el autor distingue explícitamente de una reproducción de adaptación continua secuencial. La evaluación se realiza con 50 ensayos por semilla, tarea y modelo en las semillas 42 y 3407.

## Capacidades

- Control robótico de manipulación en tareas de LIBERO-90 (apertura de cajón, entre otras tareas identificadas como 0, 9, 14, 46, 47, 19 y 59).
- Fusión de especialistas: el artefacto permite evaluar mezclas de pesos que combinan habilidades de cinco especialistas independientes.
- Retención de tareas no entrenadas: las tareas 19 y 59 se emplean como medida de retención held-out.
- Evaluación reproducible: se publican informes HTML, protocolo y vídeos deterministas de los primeros cinco ejemplos de éxito/fracaso por modelo, tarea y semilla.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en model merging para robótica: utilizar las 62 mezclas y los 6 controles para estudiar cómo varía el rendimiento en tareas retenidas al combinar especialistas con distintos coeficientes.
- Estudio de retención de habilidades: emplear las tareas 19 y 59 como held-out para medir olvido catastrófico al fusionar especialistas de LIBERO-90.
- Reproducción de experimentos: los informes HTML, el protocolo y los vídeos permiten replicar la evaluación con las semillas 42 y 3407 y 50 ensayos por condición.
- Comparación con RETAIN secuencial: el artefacto sirve como referencia para contrastar la extensión simultánea multi-especialista frente al marco original de adaptación continua.
- Auditoría de protocolos de evaluación: el conjunto de controles y la política de reparto equitativo de la contribución SFT permiten analizar sesgos metodológicos en la mezcla de pesos.
- Docencia y divulgación: los vídeos deterministas de éxito/fracaso por tarea y semilla son material útil para explicar el comportamiento de políticas robóticas fusionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el experimento está en curso y que no se reclaman resultados finales; los informes S1–S5 y el índice de informes contienen los datos, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño del modelo ni el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero90-retain-five-task-blends-20261124 | no disponible | no disponible | no disponible (experimento en curso) | no disponible | Hugging Face |
| pi05-libero90-five-task-sft-20261123 (especialistas fuente) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| pi05_libero (checkpoint base OpenPI) | no disponible | no disponible | no disponible | no disponible | gs://openpi-assets |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo en fase experimental: la model card declara explícitamente que no se reclaman resultados finales; no debe tratarse como un modelo validado para producción.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial queda sin autorización explícita.
- Idiomas no especificados: no se documenta soporte multilingüe.
- Arquitectura y tamaño no documentados: imposibilita estimar requisitos de hardware o coste de inferencia a partir de la información disponible.
- Ámbito restringido: las capacidades se limitan a tareas de manipulación de LIBERO-90; no hay evidencia de generalización fuera de ese benchmark.
- Las tareas 19 y 59 miden retención held-out, no un cambio de distribución de escena; no deben interpretarse como evidencia de robustez ante dominios nuevos.
- No es una reproducción de RETAIN secuencial: el autor aclara que se trata de una extensión simultánea multi-especialista, por lo que las conclusiones no son directamente transferibles al marco original.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/qrvmil/pi05-libero90-retain-five-task-blends-20261124
- Especialistas fuente: https://huggingface.co/qrvmil/pi05-libero90-five-task-sft-20261123
- RETAIN original: https://retain.yajatyadav.com/
- Checkpoint base: gs://openpi-assets/checkpoints/pi05_libero
- Informes: reports/index.md, reports/S1.md, reports/S2.md, reports/S3.md, reports/S4.md, reports/S5.md
- Protocolo: reports/protocol.md
