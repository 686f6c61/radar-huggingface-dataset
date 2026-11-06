# MarxistLeninist/phasemesh-text8-comparison

## Resumen

PhaseMesh text8 comparison es un repositorio de reproducibilidad publicado por el usuario MarxistLeninist que contiene cuatro checkpoints (mejor y final, tanto de un Transformer como de un modelo de espacio de estados, SSM) entrenados sobre el conjunto de datos text8. No se trata de un modelo conversacional ni de un asistente: son modelos de investigacion a nivel de byte, de aproximadamente 130 millones de parametros, disenados para comparar dos arquitecturas bajo un mismo protocolo de entrenamiento. El trabajo se basa en el codigo de PhaseMesh de Ash Hart (commit 3ae43ffac6c0699857cada0865f156405fb95956) y reproduce, de forma independiente, una ejecucion de referencia del SSM.

La relevancia del repositorio es metodologica: publica configuraciones exactas, resultados medidos en bits por caracter (bpc), tiempos de computo por actualizacion del optimizador y codigo de entrenamiento fijado, lo que permite auditar la comparacion entre un Transformer clasico y un SSM hibrido con backend FFT. El autor advierte explicitamente de que las diferencias de hiperparametros (learning rate distinto, 11 frente a 12 capas, implementaciones distintas) impiden extraer conclusiones controladas sobre arquitectura o velocidad.

Ambos modelos usan contexto de 1024 bytes, entrenamiento en BF16 sobre una unica RTX 3090 y 5000 actualizaciones del optimizador con un lote efectivo de 64. No hay ajuste por instrucciones, no hay alineamiento RLHF/DPO y no se declara licencia de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (variante A) y SSM con backend FFT (variante B) |
| Parametros totales | Transformer: 130.575.232; SSM: 131.688.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 bytes |
| Tipos de cuantizacion | no disponible (checkpoints en FP32/BF16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (nivel de byte, sin tokenizador linguistico) |
| Licencia | no disponible para los pesos; el codigo fuente es MIT |
| Formato de pesos | .pt (PyTorch, `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

La variante Transformer emplea anchura 1088, 11 capas, 17 cabezas de atencion, RoPE, multiplicador de feedforward 2 y embeddings de byte atados (tied byte embeddings). La variante SSM usa anchura 1088, 12 capas, dimension de estado 64, expansion 1, convolucion corta de 4, multiplicador de feedforward 2 y checkpointing de activaciones. El SSM utiliza el backend FFT; la memoria de fase (phase memory) esta desactivada, aunque el propio FFT no lo esta, segun la correccion incluida en la model card.

El entrenamiento se realizo sobre text8 con split contiguo 90/5/5, semilla 1, contexto 1024, lote efectivo 64 (micro-lote 4 x acumulacion 16), 5000 actualizaciones y 327.680.000 presentaciones de bytes. Se entreno en BF16 sobre una RTX 3090 de 24 GB, con validacion muestreada en FP32 sobre 50 lotes cada 250 actualizaciones. El Transformer uso AdamW con LR pico 0.0003, LR minimo 0.0001 y 300 actualizaciones de warmup; el SSM uso LR pico 0.003. El coste de computo por actualizacion del optimizador fue de 8665,858 s para el Transformer y 30490,6774 s para el SSM, aproximadamente 3,52 veces mayor en esta implementacion del SSM.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre texto en ingles (prediccion del siguiente byte).
- Evaluacion comparativa de arquitecturas mediante bits por caracter (bpc) en text8.
- Reproduccion de experimentos: se incluyen runners (`run_matched.py`, `run_ssm.py`), codigo vendorizado y ficheros de configuracion y progreso.
- Carga estricta de checkpoints solo de modelo (sin estado del optimizador ni RNG) verificada en CPU con comprobacion de tensores finitos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues mas alla del modelado estadistico de bytes.
- No dispone de modo thinking, vision ni audio.
- No esta ajustado por instrucciones: no es un asistente.

## Casos de uso

- Reproduccion de resultados de investigacion: ejecutar los runners incluidos con el fichero text8 original para verificar los valores de bpc reportados (1,2402 en el Transformer y 1,2639 en el SSM como mejores resultados).
- Comparacion de arquitecturas a nivel de byte: usar ambos checkpoints como linea base para medir coste computacional y calidad en un corpus fijo, teniendo en cuenta las diferencias de hiperparametros.
- Estudio del backend FFT en SSM: analizar el impacto del backend FFT con memoria de fase desactivada en el coste por actualizacion (3,52x frente al Transformer en esta implementacion).
- Docencia y formacion: ilustrar las diferencias practicas entre un Transformer decoder-only y un SSM en un entorno de recursos limitados (una sola RTX 3090).
- Punto de partida para fine-tuning a nivel de byte: reutilizar los pesos como inicializacion en tareas de modelado de caracteres o bytes, dado que los checkpoints son solo de modelo y cargan con `weights_only=True`.
- Auditoria de reproducibilidad: comparar los ficheros `progress.json` y `config.json` con ejecuciones propias para validar protocolos de entrenamiento y semillas.

## Benchmarks y rendimiento

| Modelo | Parametros | Mejor bpc (paso) | bpc final (paso 5000) | Tiempo por actualizacion (s) |
|---|---|---|---|---|
| Transformer (esta reproduccion) | 130.575.232 | 1,2401772355061287 (4000) | 1,257564388922874 | 8665,858 |
| SSM (esta reproduccion) | 131.688.256 | 1,2638741508689288 (4750) | 1,268647525903973 | 30490,6774 |
| SSM referencia upstream (reportado por el autor original) | no disponible | 1,2568 | 1,2603 | no disponible |

Los valores de la referencia upstream son resultados separados y no forman parte de esta reproduccion. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 3090 (24 GB) fue suficiente para ambos modelos con contexto 1024 y lote efectivo 64 en BF16.
- Inferencia: no se publican mediciones de VRAM ni latencia. Por el tamano (~130 M de parametros), los checkpoints en FP32 ocupan del orden de 0,5 GB por modelo, por lo que caben holgadamente en GPUs de consumo; esta estimacion es orientativa y no procede de la model card.
- GPUs recomendadas: no disponible de forma explicita; el unico hardware documentado es la RTX 3090.
- Despliegue: los checkpoints son `.pt` cargables con PyTorch (`torch.load(..., weights_only=True)`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en text8 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhaseMesh text8 comparison (Transformer) | 130.575.232 | 1024 bytes | 1,2402 bpc mejor | no disponible (codigo MIT) | Hugging Face |
| PhaseMesh text8 comparison (SSM) | 131.688.256 | 1024 bytes | 1,2639 bpc mejor | no disponible (codigo MIT) | Hugging Face |
| PhaseMesh upstream (referencia de Ash Hart) | no disponible | no disponible | 1,2568 bpc mejor / 1,2603 final | MIT (codigo) | GitHub |
| Transformer baseline text8 (mismo autor) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente: no esta ajustado por instrucciones y no debe usarse para tareas conversacionales o de respuesta a preguntas.
- Solo modela texto en ingles a nivel de byte; no hay tokenizador linguistico ni soporte multilingue real.
- El contexto esta limitado a 1024 bytes, insuficiente para documentos largos.
- Riesgo de alucinacion: al ser un modelo de lenguaje generativo, puede producir texto plausible pero incorrecto; no se han publicado evaluaciones de fidelidad.
- La comparacion entre arquitecturas no es controlada: distinto learning rate (0,0003 frente a 0,003), 11 frente a 12 capas e implementaciones distintas, segun advierte el propio autor.
- Los resultados provienen de una unica semilla (semilla 1), lo que limita la significacion estadistica.
- El SSM usa el backend FFT con memoria de fase desactivada; la correccion de la model card aclara que el FFT no esta desactivado.
- Licencia de los pesos no declarada: el codigo es MIT, pero el uso comercial de los checkpoints no esta asegurado.
- No se incluye el dataset text8 en el repositorio; es necesario aportar el fichero original extraido.
- `--resume` espera el formato completo de estado de reanudacion del runner, no los exports solo de modelo.
- No se han publicado sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/MarxistLeninist/phasemesh-text8-comparison
- Repositorio PhaseMesh (commit de referencia): https://github.com/ashhart/PhaseMesh/tree/3ae43ffac6c0699857cada0865f156405fb95956
- Release publica del Transformer baseline: https://huggingface.co/MarxistLeninist/phasemesh-transformer-baseline-text8
