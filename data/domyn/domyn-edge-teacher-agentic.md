# domyn/Domyn-Edge-Teacher-Agentic

## Resumen

Domyn Edge Teacher Agentic es un modelo de lenguaje denso de 4B parámetros (3.928.787.968 pesos reales en safetensors) desarrollado por Domyn. No es un asistente de propósito general: es uno de los "profesores de dominio" del protocolo de post-entrenamiento de Domyn Edge, concretamente el profesor especializado en tareas agénticas. Su función es puntuar token a token las respuestas del modelo estudiante durante la fase de destilación on-policy multi-profesor (MOPD).

Arquitectura transformer densa con la misma arquitectura y tokenizador que Domyn Edge SFT, su modelo base. Se entrenó en dos etapas: un pase de SFT agéntico de una época a 128k de contexto sobre datos de ingeniería de software, terminal y tool calling, seguido de GRPO asíncrono sobre tareas agénticas en entornos variados. Los pesos se almacenan en bfloat16.

Es relevante ahora porque forma parte del segundo bundle de la release por fases de Domyn Edge, que incluye también los demás profesores de dominio y sus datos de post-entrenamiento, bajo licencia Apache 2.0 y con el objetivo declarado de facilitar la investigación y la reproducibilidad del pipeline de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (misma arquitectura que Domyn Edge SFT) |
| Parametros totales | 3.928.787.968 (~3,9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128k (contexto de entrenamiento del pase SFT agéntico) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~3,9B parámetros que reutiliza la arquitectura y el tokenizador de Domyn Edge SFT. El entrenamiento consta de dos fases. La primera es un SFT agéntico de una época con contexto de 128k sobre datos de ingeniería de software, uso de terminal y tool calling. La segunda es GRPO (Group Relative Policy Optimization) asíncrono sobre tareas agénticas: ingeniería de software, uso de terminal y uso de herramientas multi-turno en entornos variados.

El repositorio incluye el chat template de Domyn Edge SFT sin cambios, que abre el turno de sistema con una línea de identidad fija ("You are Domyn Edge, a model trained by Domyn."); es el mismo template usado durante el entrenamiento con GRPO y en la evaluación. El modelo razona primero y llama a herramientas cuando es necesario, a menudo a lo largo de varios turnos; en la suite de evaluación agéntica del autor, una tarea consumió desde unos pocos miles hasta unos 40k tokens entre turnos. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado en las evaluaciones publicadas.
- Razonamiento matemático: evaluado en AIME 2026 y MGSM multilingüe.
- Conocimiento y razonamiento científico: evaluado en GPQA Diamond.
- Generación de código: evaluado en LiveCodeBench (conjunto completo de 1.055 problemas de LiveCodeBench v6) y SWE-bench Verified.
- Tool calling y function calling: evaluado en BFCL v4 (non-live, live, multi-turn, memory y web search).
- Comportamiento agéntico multi-turno: uso de terminal, entornos de software y ejecución de tareas sobre τ²-bench y τ³-bench.
- Capacidades multilingües en 13 idiomas, incluido razonamiento matemático multilingüe (MGSM en de, en, es, fr y ru).
- Capacidad especial: puntuación token a token de rollouts de un estudiante en el marco MOPD (uso para el que fue diseñado).

## Casos de uso

- Investigación en destilación on-policy multi-profesor: usar el modelo como profesor de dominio agéntico que puntúa token a token las respuestas generadas por un estudiante, replicando la fase MOPD del pipeline de Domyn Edge.
- Reproducibilidad de post-entrenamiento: al estar publicados los pesos y el dataset de mezcla (`domyn/Domyn-Edge-Teacher-Agentic-Mix`), permite reproducir la etapa de SFT agéntico y GRPO sobre una base conocida.
- Generación de datos sintéticos agénticos: el modelo puede producir trayectorias multi-turno de tool calling y uso de terminal que sirvan como datos de entrenamiento o evaluación para modelos menores.
- Evaluación de pipelines de agentes: servir el modelo con vLLM a 128k de contexto y thinking activado para medir el comportamiento de un harness agéntico (herramientas, terminal, entornos) frente a un profesor especializado.
- Experimentos de SWE: utilizar sus trayectorias en SWE-bench Verified para estudiar estrategias de resolución de issues y parcheo de código en modelos de ~4B.
- Estudio de function calling multi-turno: analizar sus resultados en BFCL v4 multi-turn y memory para investigar cómo un modelo pequeño gestiona estado entre llamadas a herramientas.
- Base para investigación de calibración de recompensas: al ser un modelo que puntúa respuestas ajenas, sirve para estudiar la calidad de las señales de puntuación token a token en dominios agénticos.

## Benchmarks y rendimiento

Comparación del profesor con el estudiante (Domyn Edge SFT) en la suite general, con un benchmark por área. Todos los valores en porcentaje.

| Grupo | Benchmark | Métrica | Domyn Edge SFT | Teacher Agentic | Δ |
|---|---|---|---:|---:|---:|
| Matemáticas | AIME 2026 | avg@10 | 62,7 | 62,0 | -0,7 |
| Matemáticas multilingües | MGSM (de, en, es, fr, ru) | accuracy | 85,8 | 87,1 | +1,3 |
| Conocimiento y razonamiento | GPQA Diamond | pass@1 | 56,3 | 58,3 | +2,0 |
| Seguimiento de instrucciones | IFBench | prompt strict pass@1 | 24,1 | 23,7 | -0,4 |
| Function calling | BFCL v4, sin web search (overall) | pass@1 | 36,5 | 53,7 | +17,2 |
| | BFCL v4 (non-live) | pass@1 | 51,9 | 51,2 | -0,7 |
| | BFCL v4 (live) | pass@1 | 75,9 | 74,5 | -1,4 |
| | BFCL v4 (multi-turn) | pass@1 | 35,9 | 42,1 | +6,2 |
| | BFCL v4 (memory) | pass@1 | 27,3 | 26,2 | -1,1 |
| Agéntico | SWE-bench Verified | pass@1 | 33,6 | 31,1 | -2,5 |
| Código | LiveCodeBench (conjunto completo) | pass@1 | 73,0 | 70,5 | -2,5 |

Suite de evaluación agéntica frente a Qwen3.5 4B:

| Benchmark | Métrica | Teacher Agentic | Qwen3.5 4B | Δ |
|---|---|---:|---:|---:|
| τ²-bench | accuracy | 52,4 | 68,2 | -15,8 |
| τ³-bench | accuracy | 4,6 | 7,0 | -2,4 |
| SWE-bench Verified | accuracy | 40,1 | 41,3 | -1,2 |
| Terminal-Bench | accuracy | 4,5 | 15,7 | -11,2 |
| BFCL v4 (multi-turn) | accuracy | 42,5 | 45,1 | -2,6 |
| BFCL v4 (memory) | accuracy | 25,2 | 31,6 | -6,4 |
| BFCL v4 (web search) | accuracy | 40,0 | 63,5 | -23,5 |
| HLE | accuracy | 20,9 | 23,0 | -2,1 |

Ajustes de evaluación: servido con vLLM en bfloat16 (a 128k de contexto en la suite agéntica), thinking activado, temperatura 1,0, top-p 0,95, top-k 20, min-p 0, sin penalización de presencia, frecuencia ni repetición.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: unos 8 GB solo para pesos (3,93B × 2 bytes), más KV cache; con contexto de 128k la KV cache puede dominar el consumo y exigir GPUs de 40-80 GB según el lote y la configuración.
- GPU recomendadas: A100 (40/80 GB) o H100 para servir a 128k de contexto; una RTX 4090 (24 GB) es suficiente para bfloat16 a contextos moderados, pero no para 128k con lotes grandes.
- Cabe en GPU de consumo: sí, en bfloat16 en GPUs de 24 GB (RTX 3090/4090) a contextos cortos o moderados; las cuantizaciones a 8 o 4 bits reducirían el requisito, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: vLLM (recomendado por el autor, usado en las evaluaciones), Transformers; el autor remite a la model card de Domyn Edge SFT para el entorno recomendado. No se documentan instrucciones específicas para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Como referencia de coste, el autor indica que una tarea agéntica puede consumir de unos pocos miles a unos 40k tokens entre turnos, por lo que conviene dimensionar `max_new_tokens` y la longitud de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Domyn Edge Teacher Agentic | ~3,9B denso | 128k | Apache 2.0 | Profesor agéntico para MOPD; no es asistente general |
| Qwen3.5 4B | 4B (no se detalla arquitectura) | no disponible | no disponible | Referencia usada por el autor en la suite agéntica; supera al profesor en todos los benchmarks publicados de esa suite |
| Domyn Edge SFT | ~3,9B denso (misma arquitectura) | 128k | Apache 2.0 | Modelo base y estudiante; mejor en SWE-bench Verified (33,6 vs 31,1), LiveCodeBench (73,0 vs 70,5) y AIME 2026 (62,7 vs 62,0) |

En rendimiento, el profesor mejora al estudiante en BFCL v4 overall (+17,2 puntos), BFCL multi-turn (+6,2), GPQA Diamond (+2,0) y MGSM (+1,3), y queda por debajo en SWE-bench Verified, LiveCodeBench e IFBench. Frente a Qwen3.5 4B, el profesor pierde en los ocho benchmarks de la suite agéntica, con diferencias notables en BFCL web search (-23,5), τ²-bench (-15,8) y Terminal-Bench (-11,2).

## Limitaciones y advertencias

- No es un asistente de propósito general: está diseñado como profesor de dominio para puntuar rollouts en MOPD; su uso previsto es investigación y reproducibilidad.
- Generaciones largas: en problemas difíciles puede razonar decenas de miles de tokens y una pequeña parte de las respuestas degenera al superar ampliamente los 64k tokens; el autor recomienda limitar la longitud de generación.
- Trabajo de seguridad incompleto: no se realizó ajuste de seguridad ni red teaming dedicado; el autor recomienda ejecutar el código generado en un sandbox.
- Riesgo de alucinación: no se documenta una evaluación específica de veracidad; los benchmarks publicados (HLE 20,9%) indican margen de error relevante en conocimiento.
- Rendimiento por debajo de Qwen3.5 4B en toda la suite agéntica publicada, con brechas grandes en uso de terminal y búsqueda web.
- El seguimiento estricto de instrucciones es limitado (IFBench prompt strict pass@1 de 23,7).
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está pensado ni validado como producto de asistencia.
- Idiomas: 13 declarados, aunque la evaluación multilingüe publicada se limita a de, en, es, fr y ru en MGSM.
- No se publican pesos cuantizados ni datos de latencia/throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/domyn/Domyn-Edge-Teacher-Agentic
- Modelo base (Domyn Edge SFT): https://huggingface.co/domyn/Domyn-Edge-SFT
- Dataset de la mezcla de entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-Agentic-Mix
- Sección "How to use" de la model card de Domyn Edge SFT: https://huggingface.co/domyn/Domyn-Edge-SFT#how-to-use
- Organización Domyn en Hugging Face: https://huggingface.co/domyn
