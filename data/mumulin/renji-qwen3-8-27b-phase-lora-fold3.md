# Mumulin/Renji-Qwen3.8-27B-Phase-LoRA-Fold3

## Resumen

Renji-Qwen3.8-27B-Phase-LoRA-Fold3 es un adaptador LoRA de PEFT construido sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario Mumulin. Su proposito es segmentar clips de video de diseccion submucosa endoscopica (ESD) en cuatro fases quirurgicas ordenadas: Diagnosis, Local injection, Incision / Dissection y Hemostasis. El adaptador no incluye los pesos del modelo base; debe cargarse junto a Qwen/Qwen3.8-27B.

El modelo resuelve un problema de segmentacion temporal de fases en video medico, emitiendo JSON estricto con segmentos delimitados por fase y marcas de tiempo. Se trata de un checkpoint de validacion cruzada (fold 3 de cinco) seleccionado por su exactitud de duracion y macro-F1, no de un ajuste final sobre todos los casos. El repositorio ocupa 0,3 GB y contiene unicamente los pesos del adaptador en safetensors.

Es relevante por su caracter especializado: demuestra el uso de un modelo multimodal grande (27B) con LoRA para una tarea clinica concreta, con un contrato de salida JSON validable y un pipeline de inferencia publicado. Su alcance es estrictamente de investigacion; el autor advierte que no es un dispositivo medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3.8-27B (image-text-to-text) |
| Parametros totales | no disponible (adaptador LoRA; el base Qwen3.8-27B no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 (cutoff de entrenamiento configurado en LlamaFactory) |
| Tipos de cuantizacion | no disponible (entrenamiento y evaluacion en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); libreria peft |
| Rango / alpha / dropout LoRA | 8 / 16 / 0 |
| Entrada | 8 fotogramas muestreados uniformemente, redimensionados a 224x224 |
| Salida | JSON estricto con uno o dos segmentos de fase ordenados |
| Checkpoint seleccionado | Fold 3 de validacion cruzada (pure-Renji) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text. La torre de vision permanece congelada y solo se entrena el proyector multimodal y los modulos de proyeccion elegibles mediante LoRA (rango 8, alpha 16, dropout 0). El entrenamiento uso la plantilla `qwen3_5_nothink` de LlamaFactory, atencion SDPA y longitud de corte de 8192, con generacion greedy (`do_sample=false`, `max_new_tokens=128`).

Los datos proceden de 20 casos de ESD del Hospital Renji, representados a 1 fps y convertidos a clips H.264 (1 fps, 512x448, CRF 18, yuv420p). El conjunto incluye 1448 clips de fase pura (362 por fase, 32 segundos, ventana deslizante con stride habitual de 8 segundos) y 300 clips de frontera (100 por transicion adyacente, 64 segundos). La particion se hizo a nivel de caso. Se entrenaron 3 epocas con AdamW, learning rate 1e-4, schedule coseno con warmup 0.1, recorte de norma de gradiente 1.0, gradient checkpointing y DeepSpeed ZeRO-3 sobre 2 GPU NVIDIA A100, con batch efectivo global de 6. El mejor adaptador se selecciono por perdida de validacion.

## Capacidades

- Segmentacion temporal de video endoscopico en cuatro fases ordenadas (Diagnosis, Local injection, Incision / Dissection, Hemostasis).
- Generacion de JSON estricto con la clave `segments`, y en cada segmento `phase`, `start_seconds` y `end_seconds`.
- Procesamiento de 8 fotogramas por ventana de 32 segundos.
- Manejo de clips de fase pura (una fase) y de frontera (dos fases adyacentes).
- Integracion en un pipeline que aplica el modelo sobre ventanas solapadas de 32 segundos y fusiona predicciones en la linea temporal original.
- Decodificacion de una secuencia monotona de cuatro fases sobre videos completos.
- No se documentan capacidades generales de texto, codigo, matematicas, tool calling ni agentes; el adaptador esta especializado en la tarea descrita.

## Casos de uso

- Anotacion asistida de videos de ESD: el modelo propone segmentos por fase sobre clips de 32 segundos, que un revisor cualificado valida en la GUI PhasePro antes de su uso en investigacion.
- Indexacion y busqueda de archivos quirurgicos: al convertir cada video en una secuencia de fases con marcas de tiempo, se pueden localizar fragmentos de hemostasia o diseccion para revision o docencia.
- Analisis de duracion por fase: las marcas de tiempo permiten calcular tiempos por fase y comparar procedimientos entre casos, util para estudios retrospectivos.
- Control de calidad de anotaciones existentes: el pipeline compara sus predicciones con etiquetas previas y senala discrepancias de frontera para revision experta.
- Generacion de datasets derivados: las salidas JSON validadas pueden servir como punto de partida para reentrenar o afinar modelos de segmentacion.
- Prototipado de herramientas de analisis de video medico: el repositorio de inferencia y la GUI permiten integrar el adaptador en flujos de investigacion con exportacion a CSV.
- Evaluacion comparativa de modelos multimodales en tareas clinicas: sirve como referencia de un ajuste LoRA sobre un modelo de 27B en segmentacion de fases.

## Benchmarks y rendimiento

Resultados del fold 3 sobre su particion de test pure-Renji retenida:

| Metrica | Fold 3 |
|---|---:|
| Exact match | 80,29 % |
| Duration accuracy | 88,48 % |
| Macro-F1 | 88,87 % |

Para contexto, la agrupacion de predicciones out-of-fold de cinco checkpoints Qwen entrenados por separado dio 78,66 % de exact match, 85,99 % de duration accuracy, 86,41 % de macro-F1 y 9,55 segundos de MAE de frontera. El autor advierte que estas cifras agrupadas describen el experimento de cinco checkpoints y no deben interpretarse como metricas de este adaptador Fold 3.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al cargar el base Qwen3.8-27B en BF16 se requiere un orden de magnitud de decenas de GB, y el adaptador anade un coste minimo (0,3 GB en disco). No se publican cifras de VRAM medidas.
- GPU empleadas en entrenamiento: 2x NVIDIA A100 con DeepSpeed ZeRO-3.
- GPU recomendadas para inferencia: no disponibles; por tamano del base, se orienta a GPU de datacenter (A100, H100) o configuraciones multi-GPU.
- Ajuste en GPU de consumo: no confirmado; depende de la cuantizacion del base, que no se documenta.
- Opciones de despliegue: pipeline propio del repositorio QwenVideoSegment con LlamaFactory y las variables `RENJI_QWEN_BASE_MODEL` y `RENJI_QWEN_ADAPTER`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renji-Qwen3.8-27B-Phase-LoRA-Fold3 | LoRA sobre Qwen3.8-27B | 8192 (entrenamiento) | Segmentacion de fases ESD | apache-2.0 | Hugging Face (26 descargas) |
| AMAImedia/Qwen3.8-27B-LoRA | LoRA sobre Qwen3.8-27B | no disponible | no disponible | no disponible | Hugging Face |
| Modelos de segmentacion de fases ESD alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de benchmarks de modelos comparables en esta tarea concreta; la comparativa se limita a la existencia de otro adaptador LoRA sobre el mismo base, sin metricas publicas.

## Limitaciones y advertencias

- Uso exclusivo en investigacion: no es un dispositivo medico y no debe emplearse para decisiones clinicas autonomas; las fronteras deben ser revisadas por personal cualificado.
- Entrenado con solo 20 casos de un unico centro; no se ha establecido el rendimiento en otros centros, dispositivos o protocolos de adquisicion.
- Es el mejor fold de validacion cruzada seleccionado tras comparar folds, no un ajuste final sobre todos los casos.
- Los clips solapados derivados no son observaciones estadisticamente independientes.
- Las fronteras de transicion incluyen ajustes algoritmicos que aun requieren revision experta.
- El decodificador monotono posterior asume el orden fijo de fases y puede suprimir desviaciones reales del procedimiento.
- El cumplimiento exacto del JSON y la precision de fases pueden variar con el prompt, el muestreo de fotogramas, los parametros de decodificacion, las revisiones del modelo base y las versiones de software.
- No se documentan sesgos especificos, riesgos de alucinacion medidos ni cobertura idiomatica.
- Licencia apache-2.0 en el adaptador; el usuario debe respetar tambien la licencia del modelo base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Mumulin/Renji-Qwen3.8-27B-Phase-LoRA-Fold3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de inferencia y GUI PhasePro: https://github.com/mumulin122333/QwenVideoSegment
- Ficha en free2aitools: https://free2aitools.com/model/mumulin/renji-qwen3.8-27b-phase-lora-fold3
- Adaptador LoRA relacionado sobre el mismo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-LoRA
