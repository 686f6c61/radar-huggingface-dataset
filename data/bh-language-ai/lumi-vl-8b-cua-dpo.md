# BH-Language-AI/lumi-vl-8b-cua-dpo

## Resumen

lumi-vl-8b-cua-dpo es un adaptador LoRA experimental desarrollado por BH-Language-AI, obtenido mediante fine-tuning con DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3.5-9B. El adaptador está orientado a tareas de CUA (Computer-Use Agent) y gui-grounding, es decir, a la localización de elementos de interfaz gráfica y a la interacción con entornos de escritorio a partir de instrucciones en lenguaje natural. El repositorio contiene únicamente los pesos del adaptador (0,5 GB), no el modelo completo.

La model card del autor es explícita sobre el carácter fallido del experimento: el adaptador alcanza un 60,0% (72/120 a 4 MP) frente al 64,5% que obtiene el modelo Stage-2 publicado como `BH-Language-AI/lumi-vl-8b-cua` en ScreenSpot-Pro con 400 muestras a 4 MP. El autor concluye que aplicar DPO sobre un conjunto reducido de 274 casos difíciles extraídos del propio benchmark no aporta mejora, e indica que este checkpoint no está recomendado para producción.

Se trata, por tanto, de un artefacto de investigación con valor como documentación de un resultado negativo: registra la cadena completa de entrenamiento del proyecto (base 2,5% → Stage-1 39% → Stage-2 a 2 MP 51,25% → Stage-2 a 4 MP 64,5%) y sirve como referencia para quien quiera reproducir o evitar la estrategia de DPO sobre datos de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal (vision + texto); modelo base Qwen/Qwen3.5-9B |
| Parametros totales | 9,41 B en el modelo base; el adaptador LoRA no declara su recuento propio |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262 144 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, un transformer multimodal de 9,41 B parametros, 32 capas, dimension oculta 4096 y ventana de contexto de 262 144 tokens, con soporte de vision y texto en bf16 (aproximadamente 18,8 GB de pesos). El adaptador en si es un LoRA entrenado con PEFT y publicado como safetensors.

El entrenamiento consistió en DPO con beta 0,1, learning rate 5e-6 y 137 pasos sobre un conjunto de 274 casos difíciles, con pares (chosen = ground truth, rejected = fallo del modelo). Segun la model card, el resultado no mejora el checkpoint de partida: 60,0% (72/120 a 4 MP) frente al 64,5% de Stage-2 en ScreenSpot-Pro (400 muestras a 4 MP). El autor documenta la progresión del proyecto: base 2,5%, Stage-1 39%, Stage-2 a 2 MP 51,25% y Stage-2 a 4 MP 64,5%. No se detalla la composición del dataset de preentrenamiento del modelo base ni si hubo otras fases de RLHF o DPO.

## Capacidades

- Localizacion de elementos de interfaz grafica (gui-grounding) a partir de instrucciones en lenguaje natural, heredada del modelo base y del entrenamiento especifico del proyecto.
- Interaccion como agente de uso de ordenador (Computer-Use Agent): interpretacion de capturas de pantalla y seleccion de coordenadas o elementos objetivo.
- Procesamiento multimodal de vision y texto (modelo base Qwen/Qwen3.5-9B).
- Ventana de contexto de 262 144 tokens en el modelo base, adecuada para historiales largos de interaccion.
- El adaptador no anade capacidades nuevas declaradas mas alla de las del modelo base; su efecto medido es negativo respecto al checkpoint Stage-2.

## Casos de uso

- Reproduccion de resultados negativos en investigacion: el adaptador permite replicar el experimento de DPO sobre 274 casos difíciles y verificar la conclusion de que el DPO con datos de benchmark no mejora el rendimiento en gui-grounding.
- Estudio de la brecha entre benchmark y generalizacion: sirve para analizar por que un ajuste con pares de preferencia extraidos del propio conjunto de evaluacion degrada el resultado (60,0% frente a 64,5%).
- Referencia metodologica para pipelines CUA: documenta una cadena completa de entrenamiento por etapas (base, Stage-1, Stage-2 a 2 MP y 4 MP) que otros equipos pueden usar como linea base.
- Analisis de adaptadores LoRA multimodales: con 0,5 GB de pesos, permite inspeccionar que modulos se adaptaron y como afecta el DPO a un modelo de 9,41 B.
- Pruebas de infraestructura PEFT: util para validar flujos de carga de adaptadores LoRA sobre Qwen3.5-9B en entornos de experimentacion, no en produccion.
- Docencia y divulgacion: ejemplo concreto de que el ajuste fino con preferencias sobre conjuntos pequenos y sesgados al benchmark no sustituye a datos de entrenamiento representativos.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| ScreenSpot-Pro | 120 muestras a 4 MP | 60,0% (72/120) |
| ScreenSpot-Pro | 400 muestras a 4 MP, Stage-2 (`lumi-vl-8b-cua`) | 64,5% |
| ScreenSpot-Pro | Stage-2 a 2 MP | 51,25% |
| ScreenSpot-Pro | Stage-1 | 39% |
| ScreenSpot-Pro | Modelo base | 2,5% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,5 GB; requiere cargar ademas el modelo base Qwen/Qwen3.5-9B (9,41 B parametros, aproximadamente 18,8 GB en bf16).
- VRAM estimada para inferencia en bf16: alrededor de 19-20 GB solo para pesos, mas cache KV y overhead; en cuantizacion de 8 bits, aproximadamente 10-11 GB; en 4 bits, aproximadamente 6-7 GB (estimaciones a partir del tamano del modelo base, no verificadas para este adaptador).
- GPU recomendadas: A100 40/80 GB o H100 para bf16 con contexto largo; RTX 4090 (24 GB) es suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 con bf16 y en GPUs de 12-16 GB si se cuantiza el modelo base.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base con Transformers; el modelo base puede servirse con vLLM o TGI, pero la compatibilidad de este adaptador con esos servidores no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScreenSpot-Pro | Licencia | Estado |
|---|---|---|---|---|---|
| lumi-vl-8b-cua-dpo (este) | 9,41 B (base) + LoRA | 262 144 | 60,0% (120 muestras, 4 MP) | no disponible | Experimental, no recomendado para produccion |
| BH-Language-AI/lumi-vl-8b-cua (Stage-2) | 9,41 B (base) | 262 144 | 64,5% (400 muestras, 4 MP) | no disponible | Recomendado por el autor para produccion |
| Qwen/Qwen3.5-9B (base) | 9,41 B | 262 144 | 2,5% | no disponible | Modelo base multimodal |
| Otros modelos CUA de ~9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor califica el modelo como experimental y no recomendado para produccion; el checkpoint recomendado es `BH-Language-AI/lumi-vl-8b-cua` (Stage-2 a 4 MP).
- El DPO degrada el rendimiento respecto al checkpoint de partida en ScreenSpot-Pro (60,0% frente a 64,5%), por lo que no debe usarse como sustituto de Stage-2.
- El conjunto de preferencias se construyo con 274 casos dificiles extraidos del benchmark de evaluacion, lo que introduce sesgo hacia el benchmark y limita la generalizacion.
- Riesgo de alucinacion en la localizacion de elementos de interfaz no evaluado de forma independiente; no hay datos sobre robustez fuera de ScreenSpot-Pro.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion del adaptador ni del modelo base.
- Idiomas soportados no disponibles; no se documenta el comportamiento multilingue del adaptador.
- El repositorio solo contiene el adaptador LoRA (0,5 GB); es imprescindible descargar el modelo base Qwen/Qwen3.5-9B y verificar su propia licencia.
- No hay informacion sobre sesgos, tasas de error por tipo de interfaz ni evaluacion en entornos reales de escritorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua-dpo
- Checkpoint Stage-2 recomendado: https://huggingface.co/BH-Language-AI/lumi-vl-8b-cua
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de ScreenSpot-Pro: no disponible en la informacion proporcionada
- Blog o demo del proyecto: no disponible en la informacion proporcionada
