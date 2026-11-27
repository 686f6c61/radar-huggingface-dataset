# echocorx/superecho-1-4b-math

## Resumen

SuperEcho 1 · Math 4B es un adaptador PEFT LoRA publicado por echocorx sobre el modelo base Qwen/Qwen3-4B, orientado a la resolución de problemas aritméticos planteados como enunciados verbales. El repositorio no contiene pesos completos, sino un adaptador LoRA (rank 16, alpha 32), una edición reversible de filas de operadores sobre los pesos del modelo base y un cliente en Python con una calculadora racional exacta. El adaptador se carga por defecto; la edición medida se activa con el flag `--edicion`.

El modelo aborda un problema concreto: mejorar la precisión de un modelo de 4B parámetros en aritmética elemental en español e inglés sin reentrenar el backbone completo. Para ello combina un ajuste LoRA supervisado sobre expresiones, total y fin de turno con una intervención ligera en las direcciones de salida de los tokens de operador, verificada mediante una calculadora que evalúa la expresión generada.

Es relevante ahora porque documenta de forma inusualmente detallada el protocolo de evaluación (predicciones por ítem, comprobación de semilla independiente, verificación de solapamiento con el conjunto de test de GSM8K) y porque demuestra que una intervención de bajo coste sobre un modelo pequeño puede aportar mejoras medibles en tareas aritméticas restringidas. El alcance declarado es aritmética elemental; el propio autor reconoce que la evidencia para problemas de olimpiada, generación de demostraciones o inteligencia general queda abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptador PEFT LoRA |
| Parametros totales | 4B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Entrenamiento con pesos NF4 y computo FP16; no se declaran otras cuantizaciones para inferencia |
| Idiomas soportados | es, en |
| Licencia | no disponible para las contribuciones de EchoCore; el base Qwen3-4B es Apache 2.0 (incluido en BASE-LICENSE.txt) |
| Formato de pesos | safetensors (adaptador PEFT LoRA); requiere descarga del base Qwen/Qwen3-4B fijado en la revision `1cfa9a7208912126459214e8b04321603b3df60c` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-4B, un transformer decoder-only de 4B parámetros. El adaptador tiene rango 16 y alpha 32, y cubre las proyecciones de atención Q/K/V/output y las proyecciones MLP gate/up/down. El entrenamiento usó pesos NF4 con cómputo FP16, optimizador AdamW con tasa de aprendizaje 0,00006 y 48 actualizaciones sobre 128 ejemplos filtrados del conjunto de entrenamiento de GSM8K más 64 ejemplos sintéticos en español. La función objetivo supervisa la expresión, el total y el fin de turno.

La innovación destacable es la edición opcional de filas de operadores: se usan 64 ejemplos de calibración disjuntos (48 adicionales de GSM8K train y 16 sintéticos), donde la mitad estima direcciones de salida para los tokens de operador y la otra mitad elige la escala. La edición publicada usa escala 0,025. El cliente incluye una calculadora racional exacta que verifica el valor numérico de la expresión generada, aunque el autor advierte que una expresión válida puede interpretar mal la pregunta. Se documenta una comprobación con semilla independiente (semilla 261127: 693 con LoRA y 716 tras ajustar su propia edición de operador sobre los mismos 840 ítems de SVAMP), frente a la semilla original 261126 usada en los ficheros publicados.

## Capacidades

- Generación de texto y resolución de problemas aritméticos verbales en español e inglés.
- Generación de expresiones aritméticas y totales verificables mediante calculadora externa.
- Soporte de modo de razonamiento estructurado mediante el prompt CALC/TOTAL del autor.
- Edición opcional de comportamiento sobre tokens de operador (flag `--edicion`).
- Cliente interactivo en Python (`math_cli.py`) con calculadora racional exacta.
- Evaluación reproducible con scripts (`evaluate.py`) para GSM8K, MMLU, SVAMP y MGSM-Rev2.
- No se declara soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Resolución de problemas aritméticos escolares en español: el modelo genera la expresión y el total para enunciados de primaria, y la calculadora del cliente verifica el resultado numérico antes de devolverlo al usuario.
- Asistencia educativa automatizada: integrado en una plataforma de ejercicios, puede producir la expresión intermedia y el total, permitiendo al sistema validar la respuesta del alumno contra un cálculo exacto.
- Generación de datasets sintéticos de problemas matemáticos: el par expresión/total permite crear pares pregunta-respuesta verificables para entrenar o evaluar otros modelos.
- Evaluación comparativa de adaptadores LoRA: el repositorio incluye predicciones por ítem y scripts de evaluación que facilitan reproducir los resultados y comparar variantes (base, LoRA, LoRA + edición).
- Procesamiento de enunciados en inglés para pipelines de razonamiento aritmético de un solo paso: útil en entornos donde se requiere una respuesta corta y verificable en lugar de una cadena de razonamiento larga.
- Filtrado y verificación en pipelines de datos: dado un par pregunta-respuesta aritmética, el modelo puede generar la expresión esperada y la calculadora confirmar si el total coincide, ayudando a detectar ejemplos corruptos.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un base de 4B, puede servirse en una única GPU consumer con cuantización, siempre que se valide el comportamiento tras cuantizar.

## Benchmarks y rendimiento

Los resultados son autodeclarados por el autor. Todas las columnas usan el mismo backbone fijado, preguntas, prompt, presupuesto de decodificación y herramientas dentro de cada fila. La primera tabla califica la expresión con la calculadora y usa el total declarado cuando el parseo falla; la segunda califica solo el total declarado. GSM8K usa el split de test oficial completo en inglés con el prompt zero-shot CALC/TOTAL y 96 tokens generados (distinto del protocolo 8-shot chain-of-thought de los leaderboards). SVAMP reporta los 840 ejemplos restantes tras un piloto de 160. MGSM-Rev2 usa los 250 prompts en español del experimento guardado.

| Tarea | N | Qwen | LoRA | LoRA + edición |
|---|---:|---:|---:|---:|
| gsm8k-test | 1319 | 656 | 749 | 764 |
| svamp-reservado | 840 | 632 | 697 | 718 |
| mgsm-rev2-es | 250 | 114 | 135 | 139 |

| Tarea | N | Qwen | LoRA | LoRA + edición |
|---|---:|---:|---:|---:|
| gsm8k-test | 1319 | 386 | 451 | 473 |
| svamp-reservado | 840 | 600 | 679 | 700 |
| mgsm-rev2-es | 250 | 77 | 90 | 99 |

La siguiente tabla usa cuatro asignaturas completas del test de MMLU, cinco ejemplos oficiales de desarrollo por asignatura, el prompt de texto de los autores y ranking greedy sobre los logits del siguiente token para A–D con prefijo de espacio. Sin calculadora ni plantilla de chat. Son puntuaciones por asignatura.

| Tarea | N | Qwen | LoRA | LoRA + edición |
|---|---:|---:|---:|---:|
| mmlu-elementary_mathematics | 378 | 261 | 263 | 263 |
| mmlu-high_school_mathematics | 270 | 127 | 126 | 126 |
| mmlu-college_mathematics | 100 | 43 | 43 | 43 |
| mmlu-abstract_algebra | 100 | 54 | 55 | 55 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un base de 4B, requiere al menos el peso del backbone más el adaptador. El adaptador ocupa aproximadamente 0,1 GB en el repositorio.
- Entorno confirmado por el autor: CUDA con PyTorch 2.14.1+cu130.
- GPU recomendadas: no disponible en la información proporcionada; no se declaran modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU consumer: no confirmado por el autor; el tamaño del base (4B) sugiere que es viable en GPUs consumer con cuantización, pero no se aportan datos de VRAM ni de rendimiento tras cuantizar.
- Opciones de despliegue: el autor proporciona un cliente PEFT en Python (`math_cli.py`) y scripts de evaluación (`evaluate.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| SuperEcho 1 · Math 4B (LoRA + edición) | 4B base + adaptador | no disponible | 764/1319 (calculadora) · 473/1319 (solo total) | no disponible (base Apache 2.0) | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B (base) | 4B | no disponible | 656/1319 (calculadora) · 386/1319 (solo total) | Apache 2.0 | Hugging Face |
| SuperEcho 1 · Math 4B (solo LoRA) | 4B base + adaptador | no disponible | 749/1319 (calculadora) · 451/1319 (solo total) | no disponible | Hugging Face |

No se dispone de datos de benchmarks de otros adaptadores matemáticos comparables en la información proporcionada, por lo que la comparativa se limita al propio backbone y a las variantes del adaptador.

## Limitaciones y advertencias

- Alcance restringido a aritmética elemental en español e inglés; el autor declara abierta la evidencia para problemas de olimpiada, generación de demostraciones e inteligencia general.
- Una expresión aritmética válida puede interpretar mal la pregunta; la calculadora verifica el valor numérico, no la corrección semántica.
- El solapamiento con el pretraining de Qwen es desconocido; aunque se comprobó la coincidencia exacta de preguntas de entrenamiento y calibración contra el test de GSM8K, no puede descartarse contaminación previa del backbone.
- La licencia de las contribuciones de EchoCore no está especificada; solo se incluye la licencia Apache 2.0 del base Qwen. Esto impide confirmar condiciones de uso comercial del adaptador y de la edición.
- Los resultados son autodeclarados y usan protocolos no estándar (zero-shot CALC/TOTAL con 96 tokens en GSM8K, subconjunto de MMLU, piloto de SVAMP); no son directamente comparables con leaderboards 8-shot chain-of-thought.
- El repositorio registra 0 descargas y 0 likes, sin validación independiente por parte de la comunidad.
- No se declaran capacidades de tool calling, agentes, visión ni audio; el uso en producción fuera del ámbito aritmético no está respaldado por evidencia.
- El adaptador requiere descargar el base Qwen3-4B fijado en una revisión concreta; cambios de revisión pueden alterar el comportamiento.
- No se aportan datos de VRAM, latencia ni throughput para despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/echocorx/superecho-1-4b-math
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- GSM8K: https://github.com/openai/grade-school-math
- MMLU: https://github.com/hendrycks/test
- SVAMP: https://github.com/arkilpatel/SVAMP
- MGSM-Rev2: https://github.com/google-research-datasets/MGSM-Rev2
- Métricas de evaluación (relativas al repo): evaluation/metricas.json
- Predicciones por ítem (relativas al repo): evaluation/predicciones.csv
- Informe de calibración (relativo al repo): evaluation/calibration-report.json
