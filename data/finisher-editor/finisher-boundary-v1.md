# finisher-editor/finisher-boundary-v1

## Resumen

Finisher-boundary-v1 es un conjunto de dos modelos pequeños de árboles con gradient boosting publicados por el proyecto finisher-editor para la corrección de fronteras de palabra en tareas de alineamiento forzado (forced alignment) de audio y transcripción. No es un modelo de lenguaje generativo ni un sistema de reconocimiento de voz completo: es un componente auxiliar que refina los límites temporales de inicio y fin de cada palabra producidos por un alineador base, en este caso el Montreal Forced Aligner (MFA).

Los dos artefactos, `boundary-start-v1.bin` (corrección del inicio de palabra) y `boundary-end-v1.bin` (corrección del fin de palabra, candidato a regla pre-registrada), se distribuyen en el formato propietario `FINGBT1` del propio proyecto y se publican con los mismos bytes que los incluidos en el paquete `@finisher/speech`, con el objetivo de permitir la verificación de antigüedad y procedencia. Ambos se entrenaron sobre LibriSpeech train-clean-100/360 y Multilingual LibriSpeech (alemán, español, francés y portugués), además de música de MUSAN.

La relevancia de esta publicación es acotada pero específica: cubre un nicho técnico (post-procesado de alineamientos temporales a nivel de palabra) con licencia MIT y datos de entrenamiento documentados con sumas SHA-256. No hay información pública sobre parámetros, contexto, benchmarks ni rendimiento, y el repositorio tiene 0 GB y 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient-boosted trees (árboles con gradient boosting), formato propietario `FINGBT1` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Entrenado con datos en inglés (LibriSpeech) y alemán, español, francés y portugués (Multilingual LibriSpeech); idiomas de inferencia no declarados explícitamente |
| Licencia | MIT |
| Formato de pesos | `.bin` en formato propietario `FINGBT1` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Los modelos son árboles con gradient boosting, no redes neuronales transformer ni modelos de secuencia profundos. Cada uno actúa como corrector de una frontera concreta: `boundary-start-v1.bin` corrige el inicio de palabra y `boundary-end-v1.bin` corrige el fin, y según la model card el inicio "siempre toma" la corrección, mientras que el fin es un candidato a regla pre-registrada. El formato de serialización es `FINGBT1`, definido internamente por el proyecto (plan 8C, Decisión 25).

El entrenamiento se realizó sobre LibriSpeech train-clean-100/360 y Multilingual LibriSpeech train en alemán, español, francés y portugués, ambos corpus con licencia CC BY 4.0. Se añadió música de MUSAN (CC BY 4.0, restringida a ficheros cuya licencia propia sea dominio público o CC BY). Las referencias (etiquetas) provienen de ejecuciones del Montreal Forced Aligner (MIT) con modelos acústicos entrenados por el propio proyecto. La model card indica que las fichas de datos completas, con SHA-256 de cada archivo de corpus, fuentes de los ficheros de música, herramientas de entrenamiento y resultados de validación, están en `card-boundary-start.md` y `card-boundary-end.md`, y que `SHA256SUMS` lista los ficheros. No se detalla el número de tokens, la composición exacta del dataset ni si hubo ajuste fino con RLHF o DPO (no aplicable en este tipo de modelo).

## Capacidades

- Corrección de fronteras temporales de inicio de palabra en alineamientos forzados.
- Corrección de fronteras temporales de fin de palabra (candidato a regla pre-registrada).
- Refinamiento de la salida de un alineador base (MFA) para mejorar la precisión temporal a nivel de palabra.
- Integración como componente del paquete `@finisher/speech`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo generativo de texto, código, matemáticas ni visión.
- No se declaran capacidades multilingües de inferencia más allá de los idiomas presentes en el entrenamiento.

## Casos de uso

- Post-procesado de alineamientos forzados: aplicar `boundary-start-v1.bin` y `boundary-end-v1.bin` sobre la salida de MFA para ajustar los límites de cada palabra antes de generar subtítulos o transcripciones con marcas temporales.
- Generación de subtítulos con sincronización fina: usar las fronteras corregidas para reducir desfases entre el texto y el audio en herramientas de subtitulado.
- Segmentación de corpus para investigación fonética: obtener límites de palabra más precisos para extraer segmentos de audio por palabra en estudios acústicos.
- Construcción de datasets de habla: refinar alineamientos para producir pares audio-texto con marcas temporales a nivel de palabra destinados a entrenar otros sistemas.
- Evaluación comparativa de alineadores: emplear estos correctores como referencia para medir la calidad temporal de distintos alineadores base sobre los mismos corpus.
- Integración en pipelines de `@finisher/speech`: incorporar los modelos como paso de corrección dentro de flujos existentes que ya usan el paquete, sin cambiar de formato de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "resultados de validación" en las fichas `card-boundary-start.md` y `card-boundary-end.md`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de árboles con gradient boosting, es previsible que el consumo sea muy inferior al de un modelo neuronal, pero no se aportan cifras.
- GPU recomendadas: no disponible; el tipo de modelo no requiere GPU necesariamente.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el formato `FINGBT1` es propietario y no se indica soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de corrección de fronteras de palabra con gradient boosting ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El formato de pesos `FINGBT1` es propietario del proyecto; no hay garantía de compatibilidad con herramientas estándar de inferencia.
- No se documentan sesgos conocidos ni evaluación de robustez fuera de los corpus de entrenamiento.
- El modelo depende de las referencias generadas por MFA con modelos acústicos del proyecto; la calidad de la corrección está condicionada por esas referencias.
- El repositorio figura con 0 GB y 0 descargas, lo que sugiere que los artefactos pueden no estar efectivamente alojados o que la publicación es muy reciente.
- No se declaran idiomas de inferencia soportados más allá de los corpus de entrenamiento (inglés, alemán, español, francés y portugués).
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los corpus de entrenamiento citados (CC BY 4.0 y dominio público/CC BY para MUSAN) si se redistribuyen derivados.
- No hay datos de benchmarks ni de validación accesibles en la información disponible, por lo que no puede evaluarse su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/finisher-editor/finisher-boundary-v1
- Montreal Forced Aligner (MIT): no se proporciona URL en la información disponible
- LibriSpeech (CC BY 4.0): no se proporciona URL en la información disponible
- Multilingual LibriSpeech (CC BY 4.0): no se proporciona URL en la información disponible
- MUSAN (CC BY 4.0): no se proporciona URL en la información disponible
