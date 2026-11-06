# Joakimpalm-Zen/Qwen3.8-Flash-Next-MTP-GGUF

## Resumen

Qwen3.8-Flash-Next-MTP-GGUF es un fichero GGUF que contiene únicamente la cabeza de predicción multi-token (MTP, "NextN") del modelo Qwen3.8-Flash-Next, empaquetada por el usuario Joakimpalm-Zen para su uso con el motor Xyntetik Runner y con llama.cpp. No es un modelo autónomo: se carga junto al tronco (trunk) cuantizado del modelo base y propone tokens borrador que el tronco verifica, de modo que el texto generado es siempre el del tronco y lo único que cambia es la velocidad de decodificación. La cabeza se construye a partir del checkpoint BF16 del publicador, sin fine-tuning ni calibración adicional.

El modelo base, Qwen/Qwen3.8-Flash-Next, es un transformer de la familia Qwen con arquitectura qwen4exp, que incorpora bloques Gated DeltaNet (una forma de atención lineal) y un bloque predictor MTP. El fichero de la cabeza pesa 4.165.605.056 bytes (aproximadamente 4,17 GB) en cuantización Q8_0, mientras que el repositorio completo ocupa 90,6 GB e incluye también el tronco cuantizado IQ3_S de ISTA-DASLab en cuatro partes. Los parámetros totales registrados en safetensors son 3.878.549.248, un dato que corresponde al conjunto del repositorio y no exclusivamente a la cabeza.

La relevancia de esta publicación es práctica: permite acelerar la inferencia del tronco IQ3_S de Qwen3.8-Flash-Next mediante decodificación especulativa con aceptación de borradores del 61-82 % según motor y contexto, con incrementos de throughput medidos de entre el 40 % y el 55 % en CPU y CUDA. La contrapartida es que la fidelidad del tronco respecto al modelo padre no se ha medido, y el propio autor lo advierte explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (NextN) para transformer qwen4exp con bloques Gated DeltaNet; no es un modelo autónomo |
| Parametros totales | 3.878.549.248 (dato de safetensors del repositorio; incluye tronco y cabeza) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del tronco; en las pruebas se usaron prompts de 512 y 4K tokens con `-c 8192`) |
| Tipos de cuantizacion | Q8_0 para la cabeza; el tronco incluido es IQ3_S (GSQ-RCO) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (un fichero para la cabeza; cuatro partes para el tronco con cabeza) |

## Arquitectura y entrenamiento

La cabeza MTP es el bloque predictor "NextN" del modelo Qwen3.8-Flash-Next, extraído del checkpoint BF16 del publicador y convertido a GGUF en cuantización Q8_0. No ha recibido fine-tuning ni calibración: es una copia de los pesos originales del bloque predictor. El tronco al que acompaña es la cuantización IQ3_S de ISTA-DASLab mediante el método GSQ-RCO, una cuantización post-entrenamiento aprendida que ajusta códigos y escalas sobre datos de calibración. El modelo base emplea una arquitectura híbrida con bloques Gated DeltaNet, lo que condiciona el soporte de motores: Metal no tiene ruta de ejecución para estos bloques ni para el drafting MTP.

El funcionamiento es el de decodificación especulativa: la cabeza propone varios tokens candidatos y el tronco los verifica en paralelo, aceptando los que coinciden con su propia distribución. Según las mediciones del autor, la tasa de aceptación de borradores en llama.cpp b11433 oscila entre el 61 % y el 82 % según el tamaño del prompt y el backend. El autor advierte de que la fidelidad del tronco respecto al modelo padre está pendiente de medir, y que el mismo método aplicado a Qwen3.8-27B arroja una KLD media de 0,5616 y un top-1 del 82,48 %, muy por encima del umbral de fidelidad declarado (KLD máximo 0,05, top-1 mínimo 97 %).

## Capacidades

- Aceleración de decodificación especulativa: propone tokens borrador que el tronco verifica, con tasas de aceptación del 61-82 % medidas en llama.cpp b11433.
- No genera texto por sí misma: el texto final es siempre el del tronco; la cabeza solo modifica la velocidad.
- Compatibilidad con Xyntetik Runner 1.1.1 o superior mediante `--mtp-file` junto al tronco de dos partes, y con Runner 1.1.0 o superior mediante `--mtp` dentro del conjunto de cuatro partes.
- Compatibilidad con llama.cpp b11433 mediante `--spec-type draft-mtp`.
- Soporte de peticiones concurrentes: en las pruebas con `--parallel 2` se mantiene la aceleración en dos peticiones simultáneas.
- Capacidades del modelo base (generación de texto, razonamiento, código, tool calling, multilingüismo) no documentadas en la información disponible para esta ficha.

## Casos de uso

- Servicio de inferencia de Qwen3.8-Flash-Next en CPU: cargar el tronco IQ3_S junto a esta cabeza con llama.cpp b11433 y `--spec-type draft-mtp` eleva la decodificación de 13,1-13,2 tok/s a 18,3-20,4 tok/s con prompts de 512 tokens, lo que hace viable servir el modelo en hardware sin GPU.
- Despliegue en GPU de 24 GB: en una partición MIG con CUDA, la cabeza sube la decodificación de 25,5-27,2 tok/s a 34,9-39,0 tok/s con prompts de 512 tokens y de 25,2-26,7 a 37,1-38,9 tok/s con prompts de 4K, adecuado para entornos con VRAM limitada.
- Servicio con dos peticiones concurrentes: con `--fit on -c 8192 --parallel 2`, cada petición alcanza 25,7-26,3 tok/s frente a 20,5 tok/s sin la cabeza, útil para APIs de chat con carga moderada.
- Integración en Xyntetik Runner: proyectos que ya usan este motor pueden añadir la cabeza con `--mtp-file` (Runner 1.1.1+) o `--mtp` (Runner 1.1.0+) sin cambiar el tronco ni la lógica de aplicación.
- Evaluación comparativa de motores: la cabeza permite reproducir el estudio de recuperación de cuantización del autor, comparando la salida de Runner y llama.cpp sobre el mismo tronco (472 de 480 posiciones con el mismo top-1 en las pruebas registradas).
- Prototipado de decodificación especulativa: sirve como caso de referencia para medir tasas de aceptación de borradores en un modelo con atención lineal (Gated DeltaNet) sin necesidad de entrenar una cabeza propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas cifras publicadas son mediciones de rendimiento de decodificación del autor, en la misma máquina, mismo tronco, mismos prompts, greedy y 128 tokens nuevos, dos ejecuciones por configuración:

| Motor | Configuracion | Decodificacion, prompt 512 | Decodificacion, prompt 4K | Borradores aceptados |
|---|---|---|---|---|
| llama.cpp b11433, CPU, 24 hilos | sin cabeza | 13,1 / 13,2 tok/s | 12,5 / 12,9 tok/s | no aplica |
| llama.cpp b11433, CPU, 24 hilos | `--spec-type draft-mtp` | 18,3 / 20,4 tok/s | 18,9 / 17,0 tok/s | 69-82 % |
| llama.cpp b11433, CUDA, MIG 24 GB | sin cabeza | 25,5 / 27,2 tok/s | 26,7 / 25,2 tok/s | no aplica |
| llama.cpp b11433, CUDA, MIG 24 GB | con esta cabeza | 39,0 / 34,9 tok/s | 37,1 / 38,9 tok/s | 61-72 % (512), 61-69 % (4K) |
| llama.cpp b11433, CUDA, dos peticiones concurrentes | sin cabeza | 20,5 tok/s cada una | no disponible | no aplica |
| llama.cpp b11433, CUDA, dos peticiones concurrentes | con esta cabeza | 26,3 / 25,7 tok/s cada una | no disponible | 69-74 % |
| llama.cpp b11433, CUDA, prefill | sin cabeza | 151-222 tok/s (512), 285 tok/s (4K) | no disponible | no aplica |
| llama.cpp b11433, CUDA, prefill | con esta cabeza | 227-229 tok/s (512), 275-279 tok/s (4K) | no disponible | no aplica |

## Requisitos de hardware

- VRAM para la cabeza: aproximadamente 4,17 GB en Q8_0 (4.165.605.056 bytes), adicionales al tronco.
- VRAM para el tronco: no especificada en la información disponible; el repositorio completo ocupa 90,6 GB en cuatro partes IQ3_S, aunque en las pruebas se usó un tronco de dos partes y una partición MIG de 24 GB.
- GPU recomendadas: el autor solo documenta una partición MIG de 24 GB de una GPU de datacenter con CUDA; no se mencionan A100, H100 ni RTX 4090 de forma explícita.
- GPU de consumo: no disponible; Metal no tiene ruta de ejecución para los bloques Gated DeltaNet ni para el drafting MTP.
- CPU: viable con llama.cpp b11433 y 24 hilos, según las mediciones (13-20 tok/s de decodificación).
- Opciones de despliegue: llama.cpp b11433 (`--spec-type draft-mtp`) y Xyntetik Runner 1.1.0+ (`--mtp`) o 1.1.1+ (`--mtp-file`). No se documenta soporte para vLLM, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el prefill con la cabeza se mantiene en 227-229 tok/s (512) y 275-279 tok/s (4K) en CUDA.

## Comparativa con modelos similares

No se dispone de información sobre cabezas MTP comparables publicadas como ficheros GGUF independientes. La comparación más directa disponible es contra el mismo tronco sin la cabeza, en las condiciones medidas por el autor:

| Configuracion | Parametros | Contexto | Decodificacion (CPU, 512) | Decodificacion (CUDA, 512) | Licencia |
|---|---|---|---|---|---|
| Tronco IQ3_S sin cabeza | no disponible | no disponible | 13,1-13,2 tok/s | 25,5-27,2 tok/s | qwen-community-license-1.0 |
| Tronco IQ3_S con esta cabeza | no disponible (cabeza: 4,17 GB Q8_0) | no disponible | 18,3-20,4 tok/s | 34,9-39,0 tok/s | qwen-community-license-1.0 |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el tronco no produce texto; cualquier uso debe acompañarse del tronco IQ3_S o de otro tronco compatible.
- Fidelidad del tronco no medida: el autor declara que la comparación del tronco contra Qwen/Qwen3.8-Flash-Next en la revisión `de4b8e4d` está pendiente y que debe tratarse como un derivado de distancia desconocida respecto al padre.
- Precedente desfavorable del método: la misma cuantización GSQ-RCO aplicada a Qwen3.8-27B arroja KLD media de 0,5616 y top-1 del 82,48 %, frente al umbral declarado de 0,05 y 97 %.
- Divergencia de salida: en llama.cpp, la ejecución con borradores no es byte-idéntica a la ejecución sin ellos; en las pruebas el texto del prompt de 4K divergió una vez.
- Compatibilidad limitada: Metal no soporta los bloques Gated DeltaNet ni el drafting MTP; el fichero de cabeza no puede cargarse junto al conjunto de cuatro partes que ya declara su propio bloque predictor (`--mtp-file` rechaza una segunda cabeza).
- Estado experimental: la arquitectura qwen4exp se admite con la comparación float32 del publicador aún sin medir, según el registro de cobertura del motor.
- Licencia: qwen-community-license-1.0, con posibles restricciones para uso comercial; conviene revisar el texto completo antes de desplegar en producción.
- Idiomas y sesgos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado para este artefacto; depende del tronco, no de la cabeza.

## Enlaces

- Hugging Face: https://huggingface.co/Joakimpalm-Zen/Qwen3.8-Flash-Next-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Tronco IQ3_S de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Repositorio de Xyntetik Runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Evidencia de admisión de qwen4exp: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/qwen4exp-admission-evidence/README.md
- Registro de cobertura de compatibilidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/tests/compatibility/coverage.json
- Roster de soporte de modelos: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md
