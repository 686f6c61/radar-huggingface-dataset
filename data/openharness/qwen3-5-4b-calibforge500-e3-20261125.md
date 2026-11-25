# openharness/Qwen3.5-4B-CalibForge500-E3-20261125

## Resumen

Qwen3.5-4B-CalibForge500-E3-20261125 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario openharness. Se trata de un checkpoint intermedio (el numero 48, tras 3 epocas) de una ejecucion de entrenamiento mas larga planificada para 5 epocas y 80 actualizaciones, sobre un conjunto de 500 trayectorias completas del dataset AweAI-Team/CalibForge. El modelo conserva la modalidad image-text-to-text del modelo base, por lo que mantiene capacidades de vision ademas de generacion de texto.

La relevancia de esta publicacion es acotada: no es un modelo final ni una version evaluada de forma independiente, sino un artefacto intermedio de un experimento de calibracion con datos de trayectorias de agente. El autor es explicito al senalar que E3 usa las primeras 48 actualizaciones de una planificacion de learning rate de cinco epocas, y no un schedule independiente de tres epocas. Esto lo convierte en material de referencia para reproducibilidad e investigacion mas que en un modelo listo para produccion.

El modelo tiene 4.539.265.536 parametros totales (segun los pesos safetensors), se distribuye bajo licencia Apache-2.0 y utiliza la libreria transformers. El repositorio ocupa 9,1 GB. No se han publicado resultados de benchmarks ni una evaluacion separada de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; tag `qwen3_5` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (segun la configuracion de inferencia incluida) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (datos CalibForge bajo CC BY 4.0) |
| Formato de pesos | safetensors |
| Salida maxima | 32K tokens (configuracion de inferencia de referencia) |
| Modalidad | Texto e imagen (image-text-to-text) |
| Thinking mode | Habilitado y preservado (`enable_thinking=True`, `preserve_thinking=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) y aplica un SFT completo en BF16 con el modulo de vision y el proyector congelados. El entrenamiento se realizo con ZeRO3 con offload a CPU, checkpointing y FlashAttention 2 (FA2). La configuracion de datos convierte 500 trayectorias completas en 500 muestras, sin segmentacion ni truncamiento silencioso: 9.595 decisiones del asistente y 7.570.208 tokens supervisados por epoca.

La estrategia de optimizacion usa DP2 x microbatch 1 x acumulacion 16 = batch 32 (ultimo batch de 20), con media global de tokens objetivo validos entre DP y acumulacion. El learning rate es 1e-5 con `cosine_with_min_lr`, minimo 1e-6, warmup 0.05 y weight decay 0. La supervision cubre el bloque Thinking generado por el asistente, el salto de linea de cierre, el marcador de cierre, el texto, las llamadas a herramientas y sus parametros, y el token EOS; los tokens pre-rellenados y las observaciones de System/User/tool quedan enmascarados.

Una innovacion destacable es la preservacion explicita del modo thinking y la supervision de las llamadas a herramientas dentro de trayectorias de agente, lo que orienta el ajuste hacia tareas multi-paso con uso de herramientas. El autor incluye `configs/training.yaml` con la configuracion real de cinco epocas, `configs/TRAINING_COMPLETION.json` para identificar este checkpoint intermedio, `configs/training-metrics.csv` con las primeras 48 actualizaciones nativas y `data/trajectories-500.tar.gz` con los mismos 500 JSON de origen que la version E5.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con el modulo de vision congelado durante el SFT.
- Modo thinking habilitado y preservado, con supervision del bloque de razonamiento generado por el asistente.
- Soporte de tool calling / function calling: las llamadas a herramientas y sus parametros se incluyen en la supervision.
- Razonamiento multi-paso orientado a agentes, entrenado sobre trayectorias completas de agente.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada (dependen del modelo base).
- Capacidades de codigo, matematicas o audio: no documentadas para este checkpoint.

## Casos de uso

- Investigacion en calibracion de agentes: el modelo sirve para estudiar como afecta un numero reducido de actualizaciones (48) sobre 500 trayectorias completas al comportamiento de un agente, comparandolo con el checkpoint E5 de la misma ejecucion.
- Reproducibilidad de experimentos de SFT: al incluir `training.yaml`, `TRAINING_COMPLETION.json`, las metricas de las primeras 48 actualizaciones y los datos de origen, permite replicar el entrenamiento y verificar la configuracion exacta.
- Evaluacion de agentes con tool calling: el ajuste supervisa llamadas a herramientas y parametros, por lo que es adecuado para probar pipelines de agente con verifier oficial y contexto largo de hasta 262.144 tokens.
- Prototipado de asistentes multimodales: al mantener la modalidad image-text-to-text, puede emplearse en tareas que combinan imagen y texto en entornos de desarrollo, aunque sin garantias de calidad por la falta de evaluacion.
- Analisis del efecto del thinking mode: la preservacion y supervision del bloque de razonamiento permite estudiar como el modo thinking influye en la resolucion de tareas multi-paso.
- Base para ajustes posteriores: al ser un checkpoint intermedio con pesos originales y tokenizer/template preservados, puede servir como punto de partida para experimentos de SFT adicionales en investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que E3 no ha sido evaluado de forma separada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4.539 millones de parametros en BF16 requiere aproximadamente 9 GB solo para los pesos, a los que hay que sumar la cache KV para contextos de hasta 262.144 tokens, lo que eleva considerablemente el consumo en contextos largos.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo puede ejecutarse en GPUs de clase profesional (A100, H100) y, con cuantizacion, en GPUs de consumo, pero no se documentan requisitos oficiales.
- Cabe en consumer GPU: no confirmado; depende de la cuantizacion y de la longitud de contexto, no documentadas.
- Opciones de despliegue: transformers (libreria declarada). No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.
- Configuracion de inferencia de referencia: `preserve_thinking=True`, `enable_thinking=True`, 32K de salida, 262.144 de contexto, temperature 1, top_p 0.95, top_k 20, min_p 0, presence_penalty 1.5, repetition_penalty 1, un intento, timeout de agente de 3 horas y verifier oficial sin cambios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado de evaluacion |
|---|---|---|---|---|---|
| Qwen3.5-4B-CalibForge500-E3 (este) | 4.539 M | 262.144 | Imagen y texto | Apache-2.0 | Checkpoint intermedio, sin evaluacion separada |
| Qwen3.5-4B-CalibForge500-E5 | no disponible | 262.144 (misma config) | Imagen y texto | Apache-2.0 | Version de 5 epocas de la misma ejecucion; sin datos de benchmark en la informacion |
| Qwen/Qwen3.5-4B (base) | no disponible en la informacion | no disponible | Imagen y texto | Apache-2.0 | Modelo base de referencia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio no evaluado: el autor indica que E3 no ha sido evaluado de forma separada, por lo que no hay garantias de calidad frente al modelo base ni frente a E5.
- No es un experimento independiente de tres epocas: usa las primeras 48 actualizaciones de un schedule de cinco epocas; interpretarlo como un entrenamiento de tres epocas seria incorrecto.
- Riesgo de alucinacion: no cuantificado; al ser un modelo de 4.500 millones de parametros sin evaluacion publicada, el riesgo no puede acotarse con datos.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; el comportamiento multilingue depende del modelo base y no se ha verificado tras el ajuste.
- Restricciones de licencia: los pesos son Apache-2.0, pero el contenido del dataset CalibForge es CC BY 4.0 y requiere atencion a la atribucion incluida en `LICENSE` y `data/ATTRIBUTION.md`.
- Uso en produccion: desaconsejado sin una evaluacion propia, dado que es un artefacto de investigacion intermedio y las descargas e interacciones publicas son nulas en el momento de la consulta.
- Contexto largo: la ventana de 262.144 tokens exige recursos de memoria considerables; no se documentan requisitos de hardware ni latencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openharness/Qwen3.5-4B-CalibForge500-E3-20261125
- Checkpoint E5 de la misma ejecucion: https://huggingface.co/openharness/Qwen3.5-4B-CalibForge500-E5-20261125
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset CalibForge: https://huggingface.co/datasets/AweAI-Team/CalibForge
