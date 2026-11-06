# SharadhNaiduTrains/noise-event-removal

## Resumen

`noise-event-removal` es un sistema de mejora de voz (speech enhancement) orientado especificamente a la eliminacion de eventos de ruido en grabaciones de habla en lenguas indias. Lo desarrolla Sharadh A Naidu (RV University) como participacion en el Track 2 del Datathon@IndoML 2026, y su objetivo es eliminar ruidos transitorios no estacionarios (claxones, vehiculos, animales, maquinaria, musica) preservando la inteligibilidad del habla para el modelo ASR obligatorio del certamen, SraVaani-1.0.

No se trata de un modelo de lenguaje, sino de un pipeline de dos etapas de mejora de audio que fusiona dos arquitecturas de enhancement: MossFormerGAN-16K (fine-tuneado desde `alibabasglab/MossFormerGAN_SE_16K`) y TF-GridNet (fine-tuneado desde `kohei0209/tfgridnet_urgent25`). Ambos se combinan por banda de frecuencia y una compuerta aprendida a nivel de frame (MixHead) decide cuando la senal mejorada sustituye a la original.

La relevancia actual radica en su caracter de referencia reproducible: el repositorio incluye codigo, configuraciones, checkpoints, datos de entrenamiento y el informe tecnico, ademas de las pruebas de las submissions de la Fase 2. La metrica del track es Combined = SI-SDR (dB, subconjunto sintetico) + 100 x Delta WER, y la version previa (sub 8) obtuvo 16.1806 Combined (SI-SDR 13.54 dB, Delta WER +2.64 pp), puesto 9 en la leaderboard de la Fase 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos mejoradores: MossFormerGAN-16K (con compuerta MixHead a nivel de frame) y TF-GridNet (URGENT 2025), fusionados por banda de frecuencia |
| Parametros totales | no disponible (checkpoints: 13.7 MB para E, 34 MB para TG) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio; entrada de 16 kHz mono, salida de la misma longitud en muestras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Lenguas indias (dataset Vaani); lista concreta no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.pt`, pickles de Python); no se distribuyen en safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema es un ensemble de dos mejoradores de voz. El miembro E es MossFormerGAN-16K, un modelo generativo adversarial de mejora de voz, fine-tuneado con ClearVoice 0.1.2 e incrementado con una compuerta aprendida a nivel de frame (MixHead) y una decodificacion auto-guiada en dos pasadas. El miembro TG es TF-GridNet en su variante URGENT 2025, fine-tuneado con ESPnet. Las salidas de ambos se combinan por banda de frecuencia, y la compuerta aprendida determina en que momentos la senal mejorada reemplaza a la entrada original (regla de "natural-clip" basada en un heuristico de nivel).

El entrenamiento se realiza sobre el dataset `ARTPARK-IISc/Vaani-Noise-Event-Dataset`, con SraVaani-1.0 congelado dentro de la funcion de perdida en el espacio ASR y como transcriptor obligatorio en inferencia. No se especifican en la informacion disponible el numero de tokens ni la composicion detallada del dataset, ni si hubo RLHF/DPO (no aplica en audio). Los pesos originales entrenados para la leaderboard se perdieron con la maquina cloud; los checkpoints publicados (`fD_s2500.pt` y `f2P_s300.pt`) son una re-ejecucion de la misma receta en una GPU de portatil, con un entrenador sin semilla, por lo que los bytes difieren de los originales.

## Capacidades

- Eliminacion de eventos de ruido transitorios (claxones, vehiculos, animales, maquinaria, musica) en grabaciones de habla a 16 kHz.
- Mejora de inteligibilidad del habla para un modelo ASR descendente (SraVaani-1.0), medida como Delta WER.
- Fusion por banda de frecuencia de dos mejoradores complementarios.
- Compuerta aprendida (MixHead) que decide cuando aplicar la mejora y cuando preservar la senal original.
- Decodificacion auto-guiada en dos pasadas en el miembro MossFormerGAN.
- Generacion de transcripciones (`transcripts.jsonl`) mediante SraVaani-1.0 en inferencia.
- Procesamiento por lotes de directorios de `.wav` con reanudacion de ejecuciones interrumpidas.
- Soporte de lenguas indias (alcance concreto no disponible).

## Casos de uso

- Preprocesado para pipelines ASR en lenguas indias: el sistema elimina ruidos ambientales antes de pasar el audio a SraVaani-1.0, reduciendo el WER en grabaciones de campo con ruido transitorio.
- Limpieza de corpus de habla para entrenamiento: se puede aplicar a grabaciones ruidosas del dataset Vaani para producir versiones mas limpias antes de usarlas en el entrenamiento de modelos ASR o TTS.
- Reproduccion de la pipeline del Track 2 de IndoML 2026: el repositorio incluye codigo, configuraciones y checkpoints para replicar la submission y servir como baseline del reto Vaani noise-event.
- Investigacion en speech enhancement: sirve como punto de partida para estudiar la fusion por banda de frecuencia y las compuertas aprendidas en ensembles de mejoradores.
- Transcripcion de audio de campo: el pipeline genera automaticamente `transcripts.jsonl` junto con los WAV mejorados, lo que facilita la evaluacion end-to-end con ASR.
- Evaluacion comparativa de arquitecturas de enhancement: permite contrastar MossFormerGAN frente a TF-GridNet en la misma tarea y dominio de datos.
- Prototipado en hardware de consumo: el pipeline completo cabe en una GPU de portatil de 8 GB (RTX 4070 Laptop), lo que permite experimentar sin infraestructura de datacenter.

## Benchmarks y rendimiento

| Sistema | Combined | SI-SDR (dB) | Delta WER (pp) | Rank Fase 2 |
|---|---|---|---|---|
| sub 8 (sin regla natural-clip) | 16.1806 | 13.54 | +2.64 | 9 |
| sub 9 (sistema final) | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de audio. La metrica oficial del track es Combined = SI-SDR (dB, subconjunto sintetico) + 100 x Delta WER.

## Requisitos de hardware

- VRAM estimada para inferencia: cabe en 8 GB (probado en RTX 4070 Laptop GPU con 8 GB).
- GPU recomendadas: RTX 4070 Laptop (validado); no se especifican otras GPU en la informacion disponible.
- Cabe en GPU de consumo: si, al menos en RTX 4070 Laptop de 8 GB.
- Opciones de despliegue: inferencia via script propio (`inference/infer.py`) con PyTorch, ClearVoice 0.1.2 y ESPnet 202511; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a audio).
- Latencia y throughput: no disponibles de forma numerica; la model card menciona el tiempo de ejecucion sobre el conjunto de test de la Fase 2 (3.178 clips) en RTX 4070 Laptop, pero el dato queda truncado en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| noise-event-removal (este) | Ensemble MossFormerGAN + TF-GridNet | no disponible | audio 16 kHz | Combined 16.1806 (sub 8) | MIT | Hugging Face |
| alibabasglab/MossFormerGAN_SE_16K | MossFormerGAN | no disponible | audio 16 kHz | no disponible | no disponible | Hugging Face |
| kohei0209/tfgridnet_urgent25 | TF-GridNet | no disponible | audio | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables de los modelos base en la informacion proporcionada.

## Limitaciones y advertencias

- **Grabaciones naturales frente a mezclas sinteticas**: el conjunto de test mezcla grabaciones de campo con mezclas sinteticas, y solo el subconjunto sintetico se evalua con SI-SDR. La regla natural-clip usa un heuristico de nivel y en validacion enruta el 9% de los clips sinteticos por la ruta natural.
- **Pesos originales perdidos**: los pesos fD y f2P entrenados para la leaderboard se perdieron con la maquina cloud; los checkpoints publicados son una re-ejecucion de la misma receta con entrenador sin semilla, por lo que los bytes difieren.
- **Perdida de habla**: el mejorador puede suprimir habla suave que se solapa con un evento ruidoso; la compuerta aprendida limita pero no evita este caso.
- **Pickles**: los archivos `.pt` son pickles de Python; deben cargarse solo con el codigo del repositorio y si se confia en la fuente.
- **Uso previsto restringido**: investigacion en eliminacion de eventos de ruido en habla india, reproduccion de la pipeline y baseline del reto; no esta pensado para audio forense, audifonos ni audio fuera del dominio de entrenamiento sin re-validacion.
- **Idiomas**: el alcance concreto de lenguas indias soportadas no esta detallado en la informacion disponible.
- **Licencia**: MIT, lo que permite uso comercial, pero el autor restringe el uso previsto a investigacion y re-validacion fuera del dominio.

## Enlaces

- Hugging Face: https://huggingface.co/SharadhNaiduTrains/noise-event-removal
- Modelo base MossFormerGAN: https://huggingface.co/alibabasglab/MossFormerGAN_SE_16K
- Modelo base TF-GridNet: https://huggingface.co/kohei0209/tfgridnet_urgent25
- Dataset Vaani Noise Event: https://huggingface.co/datasets/ARTPARK-IISc/Vaani-Noise-Event-Dataset
- Modelo ASR SraVaani-1.0: https://huggingface.co/ARTPARK-IISc/SraVaani-1.0
- Informe tecnico (PDF): `docs/technical_report.pdf` dentro del repositorio
