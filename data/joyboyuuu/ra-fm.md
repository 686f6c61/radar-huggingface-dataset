# JoyBoyuuu/RA-FM

## Resumen

RA-FM (Rollout Alignment for Flow-Based Speech Continuation) es un modelo de continuación de habla desarrollado por JoyBoyuuu sobre la arquitectura Flow-SLM, un modelo de lenguaje de habla que combina un transformer de 1B parámetros con un cabezal de flow matching condicional y el codec Mimi. El objetivo principal es mejorar la coherencia temporal de la generación de audio a largo plazo, abordando el problema de sesgo de exposición en modelos autoregresivos mediante una técnica de alineación de rollout que diferencia una pérdida de dinámica del habla a través del propio proceso de inferencia (Euler/CFG).

El repositorio publica tres checkpoints de inferencia (semillas 42, 1234 y 2026), cada uno entrenado durante 20.000 actualizaciones sobre el subconjunto Scale-L de LibriSpeech train-clean-100. Estos pesos no son autónomos: deben aplicarse sobre el modelo base Flow-SLM-1B-Extended, que no se redistribuye. La relevancia actual radica en que propone una alternativa al entrenamiento autoregresivo clásico para modelos de habla, con mejoras medibles en la dinámica temporal de la señal generada, aunque con limitaciones importantes en cuanto a su uso en producción (evaluación con oracle, licencia incierta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-SLM con cabezal de flow matching condicional y codec Mimi (basado en transformer) |
| Parametros totales | 1B (estimado segun el nombre del modelo base Flow-SLM-1B-Extended, no confirmado en la documentacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con LibriSpeech, que es ingles, pero no se especifica) |
| Licencia | other (derivada de Flow-SLM, que no tiene licencia explicita; no implica derechos de redistribucion o uso comercial) |
| Formato de pesos | safetensors (model.safetensors con 292 tensores por checkpoint) |

## Arquitectura y entrenamiento

RA-FM se construye sobre Flow-SLM, un modelo de lenguaje de habla que aprende conjuntamente informacion linguistica y acustica. La arquitectura base es un transformer de aproximadamente 1B parametros que procesa tokens discretos del codec Mimi y genera representaciones continuas mediante un cabezal de flow matching condicional. El entrenamiento original de Flow-SLM utiliza un objetivo de flow matching con términos de tiempo de habla puntuales. RA-FM modifica este esquema añadiendo una pérdida auxiliar de dinámica del habla que se diferencia a través del rollout Euler de paso fijo del propio modelo, con una profundidad de rollout K=2, temperatura 0.8, escala CFG 0.3 y una relación de norma de gradiente rollout-a-CFM de 0.10.

El fine-tuning se realizó durante 20.000 actualizaciones por semilla sobre el subconjunto Scale-L de LibriSpeech train-clean-100 (auditado). Cada checkpoint contiene únicamente los parámetros entrenables (292 tensores), excluyendo el codec congelado y el estado del optimizador. El proceso de carga requiere el checkpoint base de Flow-SLM-1B-Extended, que no se redistribuye en este repositorio. La evaluación se realiza con contexto causal forzado por el profesor y tokens semánticos futuros oracle, lo que limita la validez de los resultados en escenarios de generación libre.

## Capacidades

- Continuación de habla: genera audio de continuación coherente a partir de un contexto de habla dado, manteniendo la voz y el estilo del hablante.
- Generación audio-audio: procesa entrada de audio y produce audio de salida, sin necesidad de texto intermedio.
- Mejora de dinámica temporal: según los resultados reportados, reduce el error de trayectoria y mejora métricas de movimiento, variación, energía y error de frontera en comparación con el baseline FULL-TCFM.
- Inferencia con flow matching: utiliza el muestreo Euler con guía CFG, lo que permite controlar la diversidad y la adherencia al contexto.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de audio.

## Casos de uso

- Síntesis de voz para audiolibros: dado un fragmento de narración, el modelo puede continuar la locución con la misma voz y entonación, útil para generar capítulos completos a partir de una muestra inicial.
- Doblaje automático de vídeo: se puede alimentar con el audio original de una escena y generar la continuación sincronizada con el movimiento de los labios, reduciendo la necesidad de grabaciones adicionales.
- Restauración de audio dañado: si un segmento de una grabación se pierde o corrompe, RA-FM puede reconstruir la parte faltante usando el contexto anterior, mejorando la continuidad de la señal.
- Asistentes de voz interactivos: en diálogos multi-turno, el modelo puede generar respuestas de voz naturales que mantienen la coherencia prosódica con el turno anterior, aunque su uso en producción requiere resolver las limitaciones de oracle.
- Generación de efectos de sonido contextuales: a partir de un audio de ambiente, puede continuar el sonido de forma plausible, útil en postproducción de cine o videojuegos.
- Investigación en modelos de habla: sirve como banco de pruebas para estudiar el impacto del rollout alignment en la dinámica temporal, comparando con métodos autoregresivos tradicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval, etc.) porque se trata de un modelo de audio. Los datos disponibles corresponden a mejoras relativas sobre el baseline FULL-TCFM con semillas emparejadas, en una evaluación controlada con oracle. La siguiente tabla resume los resultados reportados en la model card:

| Metrica | Mejora relativa (K=2 vs FULL-TCFM) |
|---|---|
| Error de trayectoria continua (rollout) | 1,45% de reduccion |
| Error de trayectoria hard-RVQ | 1,27% de reduccion |
| Movimiento (motion) | 0,57–0,60% de mejora |
| Variacion | 0,40–0,43% de mejora |
| Movimiento de energia | 1,08–1,15% de mejora |
| Error de frontera | 0,18–0,26% de mejora |
| Similitud de hablante (WavLM) | -0,10% a +0,00% (neutral) |

Estos resultados se obtuvieron con contexto causal forzado y tokens semanticos futuros oracle, por lo que no reflejan el rendimiento en inferencia libre.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentacion disponible.
- Dado el tamaño estimado de ~1B parametros, se espera que el modelo en FP16 ocupe aproximadamente 2 GB de VRAM solo en pesos, pero al añadir el codec Mimi y los estados de inferencia, el consumo real puede ser mayor.
- No se indica si cabe en GPUs de consumo; con 8 GB de VRAM (p. ej., RTX 3070) podria ser viable en cuantizacion FP16, pero no hay datos confirmados.
- Opciones de despliegue: el codigo de reproduccion (disponible en el repositorio de GitHub) incluye scripts de inferencia con PyTorch; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar RA-FM con otras alternativas de la misma categoria (modelos de continuacion de habla basados en flow matching). El unico punto de referencia es el propio Flow-SLM original, del cual deriva. No se conocen modelos comparables con datos publicos de rendimiento en las mismas condiciones.

## Limitaciones y advertencias

- Evaluacion con oracle: los resultados reportados se obtienen con tokens semanticos futuros conocidos durante la evaluacion, por lo que el rendimiento en generacion libre (sin oracle) puede ser significativamente inferior.
- No es una solucion completa al sesgo de exposicion: la model card indica explicitamente que los checkpoints no resuelven el problema de exposicion autoregresiva en modo libre.
- Licencia incierta: los pesos se derivan de Flow-SLM, cuyo repositorio no proporciona una licencia clara. Este repositorio usa `license: other` y no implica derechos de redistribucion o uso comercial. Los usuarios deben verificar las licencias de Flow-SLM, Mimi, LibriSpeech y todas las dependencias antes de cualquier uso.
- Dependencia del modelo base: los checkpoints RA-FM no funcionan de forma autonoma; requieren el checkpoint base Flow-SLM-1B-Extended, que no se redistribuye y debe descargarse por separado.
- Idiomas: no se especifica soporte multilingue; el entrenamiento se realizo solo con LibriSpeech (ingles), por lo que su comportamiento en otros idiomas es desconocido.
- Riesgo de alucinacion auditiva: como todo modelo generativo de audio, puede producir segmentos que no corresponden al contexto o que presentan artefactos, especialmente en condiciones fuera de distribucion.
- Sesgos: no se han documentado sesgos especificos, pero al entrenarse con un corpus de lectura en ingles, puede presentar sesgos hacia voces y acentos de ese corpus.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/JoyBoyuuu/RA-FM
- Repositorio de codigo en GitHub: https://github.com/JoyBoyuuu/RA-FM
- Paper de Flow-SLM (arXiv 2508.09350): https://arxiv.org/abs/2508.09350
- Guia de reproducibilidad (dentro del repositorio): https://github.com/JoyBoyuuu/RA-FM/blob/main/docs/REPRODUCIBILITY.md
