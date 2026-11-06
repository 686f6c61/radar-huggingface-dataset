# jayyun98/Qwen3.8-27B-FP8-EAGLE4

## Resumen

Este repositorio contiene un checkpoint borrador (*draft*) para decodificación especulativa, no un modelo de lenguaje completo. Lo publica el usuario jayyun98 mediante Draftfit, una plataforma de entrenamiento y validación de borradores especulativos, y está construido para emparejarse con el modelo objetivo Qwen3.8-27B-FP8. El borrador sigue la arquitectura EAGLE4, derivada de la tecnología de Eagle AI Corp, y conserva el diseño de cabezas candidatas y propuestas de varios tokens que caracteriza a esta familia.

El problema que aborda es la latencia de inferencia: un borrador EAGLE4 propone secuencias de tokens que el modelo objetivo verifica en paralelo, de modo que si la tasa de aceptación es alta se reducen los pasos de decodificación sin alterar la distribución de salida. El checkpoint pesa 3.089.075.200 parámetros (unos 3,09 mil millones) y ocupa 6,2 GB en el repositorio en formato safetensors con pesos en FP8.

Su relevancia es acotada y experimental. El autor mide una aceptación del 67,42% frente al 65,13% del checkpoint oficial EAGLE4 en una prueba de solo 24 prompts, con un intervalo de confianza del 95% que incluye el cero, y advierte que no se ha validado el servicio en producción ni la paridad exacta de salidas. La licencia Eagle 4 Source-Available no es aprobada por la OSI, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE4 (borrador de decodificacion especulativa con cabezas candidatas, compatible con runtime EAGLE4) |
| Parametros totales | 3.089.075.200 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos del checkpoint); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Eagle 4 Source-Available License (license_name: eagle-4), no aprobada por la OSI |
| Formato de pesos | safetensors (configuracion y nombres de tensores con el layout oficial EAGLE4) |

## Arquitectura y entrenamiento

El checkpoint implementa la arquitectura EAGLE4 aplicada como borrador de decodificación especulativa sobre un objetivo Qwen3.8-27B-FP8. EAGLE4 trabaja con propuestas de varios tokens (siete en las mediciones del autor) y un mecanismo de re-puntuación mediante cabezas candidatas contra las salidas del modelo objetivo nativo en FP8. El export preserva la configuración y los nombres de tensores del layout oficial EAGLE4, de modo que puede cargarse en runtimes compatibles con EAGLE4.

El entrenamiento se realizó con Draftfit, la plataforma del autor para entrenar, adaptar y validar borradores especulativos. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información no está disponible. La evaluación publicada consiste en una repetición de trayectorias en caché (*cached-trajectory replay*) sobre 24 prompts reservados, con trayectorias greedy de 64 tokens, propuestas de siete tokens y re-puntuación de cabezas candidatas contra el mismo objetivo FP8 nativo.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa: propone hasta siete tokens por paso en la configuración medida.
- Verificación implícita mediante cabezas candidatas que re-puntúan las propuestas contra el modelo objetivo.
- Compatibilidad con el layout oficial EAGLE4, lo que permite sustituir el borrador oficial en runtimes EAGLE4.
- Aceleración potencial de la inferencia del objetivo Qwen3.8-27B-FP8 cuando la tasa de aceptación es alta.
- No es un modelo de chat ni de generación autónoma: no se documentan capacidades de razonamiento, código, matemáticas, visión, tool calling ni agentes.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B-FP8 en entornos de investigación: se carga el borrador en un runtime EAGLE4 junto al objetivo FP8 y se mide la tasa de aceptación real con verificación especulativa en vivo, algo que el autor deja explícitamente sin medir.
- Sustitución experimental del checkpoint EAGLE4 oficial: al preservar el layout, puede intercambiarse en pipelines que ya usan el borrador oficial para comparar aceptación y latencia.
- Evaluación comparativa de borradores: sirve como segundo punto de comparación en estudios de decodificación especulativa, con la cautela de que la ganancia medida (+2,29 puntos) no es estadísticamente significativa.
- Reproducción de metodologías de validación: el repositorio incluye `evaluation.json` y el directorio `reproduction/` con el protocolo y la receta, útiles para replicar el experimento en otros objetivos.
- Despliegue en servicios de generación de código o texto de baja latencia: solo tras validar previamente la paridad exacta de salidas y el rendimiento en el servidor real, requisito que el autor no ha cubierto.
- Investigación sobre decodificación especulativa en FP8: permite estudiar cómo se comporta un borrador adaptado a pesos objetivo en FP8 frente a un objetivo en precisión nativa.

## Benchmarks y rendimiento

| Borrador | Aceptados / propuestos | Tasa de aceptación |
|---|---:|---:|
| Checkpoint EAGLE4 oficial | 1.242 / 1.907 | 65,13% |
| Este checkpoint | 1.250 / 1.854 | 67,42% |

Medición sobre 24 prompts reservados, trayectorias greedy de 64 tokens, propuestas de siete tokens y re-puntuación de cabezas candidatas contra el mismo objetivo FP8 nativo. Son mediciones de repetición de trayectorias en caché. La mejora es de +2,29 puntos porcentuales, con intervalo de confianza del 95% por bootstrap emparejado de -0,96 a +5,55 puntos, que incluye el cero. No se han medido verificación especulativa en vivo, paridad exacta de salidas ni velocidad de servicio en producción. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad, porque el artefacto no es un modelo generativo autónomo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB para los pesos del borrador en FP8, más la memoria del modelo objetivo Qwen3.8-27B-FP8 y las estructuras del runtime EAGLE4.
- GPU recomendadas: no disponible en la información proporcionada; el requisito dominante será el del objetivo de 27B, no el del borrador.
- Cabe en GPU de consumo: los pesos del borrador (unos 6,2 GB) caben en tarjetas con 8 GB o más, pero el conjunto borrador más objetivo de 27B en FP8 requiere mucha más memoria y no cabe en GPU de consumo convencionales.
- Opciones de despliegue: runtime compatible con EAGLE4; el autor no proporciona comando de despliegue porque el servicio nativo en producción no está validado para este export. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos. La model card indica explícitamente que la velocidad de servicio en producción queda sin medir.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aceptación medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jayyun98/Qwen3.8-27B-FP8-EAGLE4 (este) | 3,09 mil millones | no disponible | 67,42% (24 prompts) | Eagle 4 Source-Available | Hugging Face, 0 descargas |
| EAGLE-Corp/Qwen3.8-27B-EAGLE4 (oficial) | no disponible | no disponible | 65,13% (24 prompts) | Eagle 4 Source-Available | Hugging Face |
| Qwen/Qwen3.8-27B-FP8 (objetivo) | no disponible | no disponible | no aplica (modelo objetivo) | no disponible | Hugging Face |

La comparación con otros borradores especulativos de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La mejora de aceptación (+2,29 puntos) no es estadísticamente significativa: el intervalo de confianza del 95% va de -0,96 a +5,55 puntos e incluye el cero.
- La muestra es muy pequeña: 24 prompts reservados, trayectorias greedy de 64 tokens y propuestas de siete tokens.
- Las mediciones son repeticiones de trayectorias en caché, no verificación especulativa en vivo.
- No se ha validado la paridad exacta de salidas respecto al objetivo ni el rendimiento en servicio de producción.
- No se proporciona comando de despliegue porque el servicio nativo no está validado para este export.
- Licencia Eagle 4 Source-Available, no aprobada por la OSI: restringe el uso comercial y exige aceptar la política de marcas y las condiciones de modificación; revisar `LICENSE`, `NOTICE`, `TRADEMARKS.md` y `MODIFICATIONS.md`.
- No es un proyecto oficial de Eagle AI Corp, aunque derive de su tecnología.
- No es un modelo de lenguaje autónomo: no debe evaluarse con benchmarks de capacidad como MMLU o HumanEval.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.
- Riesgo de alucinación y sesgos: no aplica directamente al ser un borrador, pero cualquier salida depende del objetivo Qwen3.8-27B-FP8 y hereda sus sesgos.
- Idiomas y contexto: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/jayyun98/Qwen3.8-27B-FP8-EAGLE4
- Modelo base: https://huggingface.co/EAGLE-Corp/Qwen3.8-27B-EAGLE4
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Plataforma Draftfit: https://github.com/JayYun98/Draftfit
- Licencia Eagle 4: https://github.com/eagle-hq/EAGLE-4/blob/main/LICENSE
