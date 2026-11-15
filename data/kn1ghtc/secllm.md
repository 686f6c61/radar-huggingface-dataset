# kn1ghtc/secllm

## Resumen

secllm es una serie de modelos de lenguaje orientada a investigación en ciberseguridad, desarrollada por el usuario kn1ghtc y publicada en Hugging Face bajo licencia Apache 2.0. El repositorio contiene únicamente una *preview* del modelo base cuantizado, denominada `secllm-27b-4bit-uc-base`, construida a partir de `orcarouter/Qwen3.8-27B-Uncensored`, una variante del Qwen3.8-27B de 27.000 millones de parámetros con el comportamiento de rechazo eliminado (abliterated). Los checkpoints entrenados de la serie (destilación, SFT y ajuste por preferencias) no se distribuyen.

El artefacto publicado es una conversión a 4 bits de precisión mixta en formato MLX, pensada para ejecución local en hardware Apple Silicon. Conserva la torre de visión, la ventana de contexto de 262.144 tokens y la cabeza de predicción multi-token (MTP) del modelo original, lo que permite decodificación especulativa y acelera la generación. Su relevancia actual radica en que ofrece un baseline reproducible para tareas de razonamiento sobre código y binarios en entornos aislados, sin depender de APIs alojadas.

Es importante subrayar que la model card distingue explícitamente entre esta preview (sin post-entrenamiento) y los checkpoints expertos no publicados. Los resultados de evaluación que se citan corresponden al stack de agente completo del autor, no al checkpoint desnudo, por lo que no deben interpretarse como una puntuación del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 27B con atención híbrida (lineal y completa), torre de visión y cabeza de predicción multi-token (MTP) |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit mixta: cuerpo en 4-bit grupo 64 afín, 261 overrides por ruta a 8-bit, cabeza MTP a 4-bit grupo 64 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors cuantizados, 6 shards, 18,5 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27.000 millones de parámetros que combina atención lineal y atención completa (híbrida), incorpora una torre de visión para entrada image-text-to-text y una cabeza de predicción multi-token (MTP) que habilita decodificación especulativa. La conversión publicada aplica cuantización de precisión mixta: el cuerpo principal se cuantiza a 4 bits con grupo 64 afín, mientras que 261 rutas concretas se mantienen a 8 bits. Según el autor, se preservan a 8 bits las matrices de embedding y de la cabeza LM, la proyección de salida de la atención lineal y los bloques superficiales y profundos con mayor error relativo, porque su error de redondeo se traduce directamente en selección incorrecta de tokens y porque se leen una vez por paso, de modo que el ahorro de ancho de banda al cuantizarlas es pequeño. El resultado pasa de 51,8 GiB en bf16 a 18,5 GiB.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO al modelo base original; la preview publicada no incorpora post-entrenamiento alguno. La innovación técnica destacable es la conservación de la cabeza MTP pre-cuantizada, que permite decodificación especulativa: el autor reporta 36,6 tok/s en modo autorregresivo y 140,8 tok/s con profundidad MTP 3 (aceleración de 3,85x) en un Apple M5 Ultra con 96 GiB. El archivo `mtplx_runtime.json` documenta el contrato MTP para motores que soporten decodificación especulativa, y el mapa `quantization` de `config.json` permite a cualquier loader compatible con MLX (por ejemplo `mlx_lm`) reconstruir el modelo sin receta adicional.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredado del base Qwen3.8-27B.
- Razonamiento sobre código y binarios: triaje de código fuente, análisis de vulnerabilidades y reproducción de CVEs en entornos de laboratorio.
- Análisis de contexto largo: ventana de 262.144 tokens apta para revisiones de repositorios completos o trazas extensas.
- Soporte de function calling y tool calling, según las etiquetas del repositorio y el uso previsto en el stack de agente del autor.
- Capacidades de agente y razonamiento multi-paso, empleadas en el bucle de planificación descrito en la model card.
- Visión image-text-to-text mediante la torre de visión integrada.
- Decodificación especulativa mediante la cabeza MTP, con aceleración de generación en hardware compatible.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Triaje de vulnerabilidades en código fuente: el modelo puede analizar repositorios completos en una sola pasada gracias a su contexto de 262.144 tokens, señalando patrones inseguros y redactando informes preliminares para revisión humana.
- Análisis de binarios y reproducción de CVEs en laboratorio: integrado en un bucle de agente con herramientas de ejecución, permite iterar sobre hipótesis de explotación en entornos controlados y documentar los pasos.
- Retos CTF y formación en seguridad: sirve como backend de razonamiento para agentes que resuelven desafíos de inyección, web y reversing en entornos autorizados.
- Despliegue local con requisitos de confidencialidad: al ejecutarse en MLX sobre Apple Silicon, permite procesar material sensible sin enviarlo a APIs alojadas, algo crítico en investigación de seguridad.
- Asistencia en redacción de informes técnicos: genera borradores de hallazgos, descripciones de mitigaciones y resúmenes ejecutivos a partir de notas de análisis.
- Reproducción de la receta de cuantización: investigadores pueden citar y reproducir el contrato de cuantización mixta para la familia Qwen3.8-27B en sus propios pipelines.
- Evaluación comparativa de bases sin rechazo: útil para estudiar el comportamiento de modelos abliterated frente a variantes con alineamiento, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

Los datos publicados miden el stack de agente completo del autor (runtime de herramientas, skills, bucle de planificación y modelo), no el checkpoint desnudo, y se obtuvieron con una build de 4 bits de esta línea base antes de que existiera el checkpoint entrenado actual. Deben leerse como baseline del harness.

| Suite | Alcance | Resultado | Configuración |
|---|---|---|---|
| XBOW Validation Benchmarks | Muestra aleatoria de 15 retos | 12/15 resueltos (80,0%), puntuación media de hitos 93,33, 0 timeouts duros | 4 concurrentes, presupuesto de 480 s, profundidad de plan 5 |
| XBOW familia Injection | 6 retos | 6/6 (100%), puntuación media 100 | Inyección form, JSON, XML, GraphQL, segundo orden y basada en tiempo |
| Cybench | 7 tareas web | 5/7 (71,4%) | Modo no guiado, 15 iteraciones, límite de 6k tokens de entrada |
| CyberGym | Reproducción de CVE a nivel de proyecto | no integrado | — |

Métricas de calidad y velocidad del artefacto: perplejidad de 6,3972 sobre un holdout de 643 tokens; 36,6 tok/s autorregresivo y 140,8 tok/s con MTP profundidad 3 en Apple M5 Ultra de 96 GiB (tasa de borradores aceptados del 100% en profundidad 0). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El artefacto ocupa 18,5 GiB en disco; en memoria, la inferencia requiere espacio para pesos más caché KV, que crece con el contexto. Con 262.144 tokens de contexto la caché KV puede ser muy voluminosa; se recomienda limitar la longitud efectiva según la tarea.
- La build está pensada para MLX y se ha probado en un Apple M5 Ultra con 96 GiB de memoria unificada, donde alcanza 36,6 tok/s autorregresivo y 140,8 tok/s con MTP.
- No se dispone de datos de rendimiento en GPU NVIDIA (A100, H100, RTX 4090) para este artefacto MLX concreto; al ser un formato MLX, el despliegue en CUDA requeriría reconvertir los pesos.
- Opciones de despliegue documentadas: `mlx_lm` (carga y generación) y motores que soporten el contrato MTP descrito en `mtplx_runtime.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- En GPUs de consumo no se han publicado medidas; por tamaño (18,5 GiB) cabría teóricamente en GPUs con 24 GiB o más, pero sin datos de rendimiento verificados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| secllm-27b-4bit-uc-base | 27B denso | 262.144 | Apache 2.0 | MLX 4-bit mixto | Preview sin post-entrenamiento; base sin rechazo; visión y MTP |
| Qwen3.8-27B (original) | 27B denso | no disponible en la información | no disponible en la información | bf16 | Modelo upstream con alineamiento; referencia de comportamiento |
| orcarouter/Qwen3.8-27B-Uncensored | 27B denso | no disponible en la información | no disponible en la información | bf16 | Base abliterated sobre la que se construye secllm |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- La línea base tiene el rechazo eliminado (abliterated), por lo que responderá a solicitudes que un modelo con alineamiento rechazaría. Es una propiedad de los pesos upstream, no de la cuantización; los despliegues deben añadir su propia capa de política.
- Riesgo de alucinación inherente a los modelos de lenguaje; en dominios de seguridad, una mitigación o un vector de ataque inventado puede tener consecuencias graves si no se verifica.
- La calidad de visión se degrada con el presupuesto de 4 bits; el texto fino en imágenes es lo primero que pierde fidelidad.
- La aceptación de MTP se degrada con prompts inusuales; la cifra de 140,8 tok/s es un mejor caso en generaciones cortas y favorables al modelo.
- La preview publicada no ha recibido refuerzo por retroalimentación humana (RLHF) ni ajuste por preferencias.
- Cobertura lingüística limitada a inglés y chino; el rendimiento en castellano no está documentado.
- Uso previsto restringido a investigación autorizada, CTF y laboratorios propios o contratados; queda fuera de alcance el acceso no autorizado, el despliegue de malware, el robo de credenciales y la evasión de monitorización.
- No es un clasificador ni tiene contrato de etiquetas; no debe usarse para moderación en producción ni para decisiones automatizadas que requieran confianza calibrada.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el comportamiento sin rechazo puede contravenir políticas de plataforma o normativa aplicable.

## Enlaces

- Hugging Face: https://huggingface.co/kn1ghtc/secllm
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo upstream original: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería MLX: https://github.com/ml-explore/mlx
- mlx_lm: https://github.com/ml-explore/mlx-lm
