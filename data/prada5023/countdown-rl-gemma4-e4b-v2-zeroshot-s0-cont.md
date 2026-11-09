# prada5023/countdown-rl-gemma4-e4b-v2-zeroshot-s0-cont

## Resumen

`countdown-rl-gemma4-e4b-v2-zeroshot-s0-cont` es un adaptador LoRA (r = 16, alpha = 32) publicado por el usuario prada5023 sobre el decodificador de texto de `google/gemma-4-E4B`. No es un modelo completo, sino un ajuste fino orientado a una tarea concreta: el juego de numeros Countdown, en el que el modelo debe alcanzar un objetivo numerico combinando un conjunto de operandos mediante operaciones aritmeticas. El adaptador se entrena con GRPO (Group Relative Policy Optimization) e incorpora una herramienta Python en el bucle de razonamiento, de modo que la politica puede ejecutar codigo y recibir su salida antes de emitir la respuesta final.

La relevancia de esta publicacion es metodologica mas que de producto: documenta un experimento reproducible de aprendizaje por refuerzo con uso de herramientas sobre un modelo base multimodal reciente (Gemma-4-E4B), con receta v2, prompt zero-shot y semilla 0, y reporta un resultado de 68,1% pass@1 en un conjunto de validacion de 1.000 problemas generados con posterioridad a todas las decisiones del modelo. El autor publica codigo, configuraciones y registros en un repositorio acompanante, lo que permite replicar el pipeline de evaluacion.

El adaptador es especifico del prompt `r1zero_tool` y solo funciona correctamente sobre el decodificador de texto extraido del checkpoint multimodal, con atencion eager. Su utilidad practica esta acotada a investigacion en RL con herramientas y a la evaluacion de razonamiento aritmetico; no esta pensado como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r = 16, alpha = 32) sobre el decodificador de texto de un transformer multimodal (Gemma-4-E4B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es google/gemma-4-E4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluado con 768 tokens de generacion maxima) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite las cuantizaciones habituales de Gemma) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el decodificador de texto de Gemma-4-E4B, extraido del checkpoint multimodal original mediante el script `scripts/prepare_gemma4_text.py`. Segun la model card, los logits del decodificador extraido coinciden exactamente con los del modelo completo cuando se usa atencion eager, de ahi la recomendacion de ejecutar con `--attn eager`. El adaptador es un LoRA de rango 16 y alpha 32, entrenado con PEFT.

El entrenamiento usa GRPO sobre el juego Countdown con una herramienta Python en el bucle. La politica genera un bloque `<think>`, puede invocar `<python>` cuyo stdout se devuelve en `<output>`, y finalmente responde en `<answer>`. La receta corresponde a la version v2, con prompt zero-shot, semilla 0, y 100 pasos adicionales sobre un entrenamiento previo (sufijo `cont`). Se empleo el prompt `r1zero_tool`, y la evaluacion debe realizarse con ese mismo prompt porque las politicas entrenadas son especificas del formato. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de alineacion mas alla del propio GRPO.

## Capacidades

- Razonamiento aritmetico estructurado para el juego Countdown: combinar operandos para alcanzar un objetivo numerico.
- Generacion de trazas de razonamiento en el bloque `<think>` antes de responder.
- Uso de herramientas: emite llamadas `<python>` y consume la salida estandar devuelta en `<output>`.
- Razonamiento multi-paso con hasta dos rondas de ejecucion de codigo en la configuracion de evaluacion reportada.
- Respuesta final estructurada en el bloque `<answer>`.
- Capacidades generales de generacion de texto y codigo heredadas del modelo base Gemma-4-E4B (no evaluadas de forma especifica en esta publicacion).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en RL con herramientas: reproducir el pipeline GRPO con ejecucion de Python en el bucle para estudiar como emerge el uso de herramientas en modelos de menor tamano. El adaptador y las configuraciones publicadas permiten replicar el experimento paso a paso.
- Evaluacion de razonamiento aritmetico: medir pass@1 en problemas tipo Countdown con el prompt `r1zero_tool` y comparar recetas (v1 frente a v2, zero-shot frente a few-shot) usando el mismo conjunto de validacion.
- Baseline para experimentos de decodificacion con tool calling: servir como referencia entrenada para comparar estrategias de prompting, numero de rondas de codigo o presupuesto de tokens (768 en la evaluacion reportada).
- Analisis de sensibilidad al prompt: dado que la politica es especifica del prompt, el adaptador es util para estudiar como variaciones en el formato de instrucciones degradan o preservan el rendimiento.
- Docencia y divulgacion: ejemplo compacto y reproducible de GRPO aplicado a un modelo multimodal reciente, con codigo, configuraciones y registros disponibles.
- Estudio de la extraccion del decodificador de texto: el script de preparacion y la comprobacion de equivalencia de logits con atencion eager sirven para validar pipelines que separan la torre de texto de un checkpoint multimodal.

## Benchmarks y rendimiento

| Conjunto | Metrica | Resultado |
|---|---|---|
| holdout3 (1.000 problemas, greedy, 768 tokens, dos rondas de codigo) | pass@1 global | 68,1% |
| holdout3, dificultad facil | pass@1 | 89,5% |
| holdout3, dificultad media | pass@1 | 52,7% |
| holdout3, dificultad dificil | pass@1 | 55,0% |

No se han publicado en la informacion disponible comparaciones con otros modelos ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; el adaptador ocupa aproximadamente 0,1 GB y el requisito dominante es el del modelo base Gemma-4-E4B.
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo base es de escala E4B, por lo que se recomienda consultar los requisitos oficiales de Gemma-4-E4B.
- Cabe en GPU de consumo: no confirmado en la informacion disponible.
- Opciones de despliegue: PEFT sobre el decodificador extraido, con atencion eager obligatoria; la evaluacion se realiza con el CLI `countdown-eval` del repositorio acompanante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros adaptadores o modelos comparables en la tarea Countdown, ni datos de rendimiento de alternativas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Adaptador especifico de prompt: solo funciona de forma fiable con el prompt `r1zero_tool`; otros formatos pueden degradar el rendimiento de manera significativa.
- Requiere extraer previamente el decodificador de texto del checkpoint multimodal y ejecutar con atencion eager; sin ese paso los logits no coinciden con los del modelo completo.
- Alcance acotado: entrenado exclusivamente para Countdown con herramienta Python; no debe emplearse como modelo de proposito general ni como sustituto del modelo base.
- Riesgo de alucinacion en la traza de razonamiento y en la seleccion de operandos u operaciones, especialmente en problemas de dificultad media y dificil (52,7% y 55,0% de pass@1).
- Sin datos publicados sobre sesgos, cobertura idiomatica ni comportamiento fuera de la tarea.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los terminos de Gemma, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de cualquier despliegue.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente de los resultados reportados.
- Los resultados de holdout3 provienen del propio autor y de un conjunto generado tras las decisiones del modelo; no se han replicado de forma externa en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/prada5023/countdown-rl-gemma4-e4b-v2-zeroshot-s0-cont
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Repositorio acompanante con codigo, configuraciones y registros: referenciado en la model card (`configs/experiments/gemma4-e4b-v2-zeroshot-s0-cont/`, `REPORT.md`, `EXPERIMENTS.md`); URL no disponible en la informacion proporcionada.
- Paper o blog tecnico: no disponible en la informacion proporcionada.
- Demo: no disponible en la informacion proporcionada.
