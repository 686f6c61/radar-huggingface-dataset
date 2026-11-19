# Polydim-Einsof/einsof2-deepseek-prover-v2-stiefel-gguf

## Resumen

EINSOF-II DeepSeek-Prover-V2 7B Stiefel es una familia de cuantizaciones GGUF publicada por Polydim-Einsof sobre el modelo base `deepseek-ai/DeepSeek-Prover-V2-7B`, un transformer de 6.910.365.696 parámetros (aproximadamente 6,9 mil millones) especializado en demostración automática de teoremas en Lean 4. La publicación no entrena un modelo nuevo desde cero: aplica un adaptador (referenciado como `Polydim-Einsof/einsof2-deepseek-prover-v2-stiefel-adapter`) sobre los pesos del modelo base y después exporta el resultado a formato GGUF en dos variantes de cuantización, `Q4_K_M` y `Q8_0`, pensadas para su uso con llama.cpp y Ollama.

El elemento diferencial que declara el autor es el tratamiento geométrico de los pesos mediante una variedad de Stiefel S^(D-1) con retracción polar de orden 4, integrada en un framework propio denominado POLYDIM PMTP. La model card no detalla la formulación matemática, el volumen de datos de ajuste ni los hiperparámetros empleados, por lo que la información técnica disponible sobre el procedimiento de adaptación es mínima.

El interés práctico del artefacto es acotado pero concreto: ofrece una vía de despliegue local de un modelo de razonamiento formal en Lean 4 con requisitos de memoria moderados, algo relevante para quienes trabajan en verificación de pruebas, asistentes de demostración o pipelines de matemáticas formales sin acceso a infraestructura de gran escala. El repositorio, creado el 19 de noviembre de 2026, no registra descargas ni interacciones en el momento de la consulta, y la licencia figura como "other" sin texto adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base DeepSeek-Prover-V2-7B); adaptación declarada sobre variedad de Stiefel S^(D-1) con retracción polar de orden 4 |
| Parametros totales | 6.910.365.696 (aproximadamente 6,9 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | other (sin texto de licencia especificado en la información disponible) |
| Formato de pesos | GGUF (también existe el adaptador en el repositorio `einsof2-deepseek-prover-v2-stiefel-adapter`) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 6,9 mil millones de parámetros orientado a la generación de demostraciones formales en Lean 4. Sobre esa base, el autor declara una adaptación denominada "Stiefel", que según la model card opera sobre la variedad de Stiefel S^(D-1) mediante una retracción polar de orden 4, dentro de un framework propio llamado POLYDIM PMTP. No se especifica si esta operación actúa sobre matrices de pesos completas, sobre proyecciones de bajo rango o sobre los parámetros del adaptador, ni se documenta el número de tokens de ajuste, la composición del dataset, la presencia de RLHF/DPO ni las métricas de validación del proceso.

La información disponible no permite reconstruir el pipeline de entrenamiento: no hay datos sobre la estrategia de optimización, el régimen de learning rate, el tamaño efectivo del adaptador ni la metodología de fusión con los pesos base antes de la cuantización. Tampoco se documenta el proceso de conversión a GGUF más allá de la mención a llama.cpp como runtime de destino. Cualquier afirmación sobre la calidad del ajuste o sobre la fidelidad de la cuantización respecto al adaptador original queda fuera de lo verificable con los datos publicados.

## Capacidades

- Generación de demostraciones formales en Lean 4, heredada del modelo base DeepSeek-Prover-V2-7B.
- Razonamiento matemático orientado a prueba de teoremas y completado de tácticas.
- Conversación multi-turno (el repositorio incluye la etiqueta `conversational`).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Despliegue local mediante llama.cpp y Ollama, derivado de la etiqueta `ollama` y del formato GGUF.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el modelo base es de texto.

## Casos de uso

- Asistencia a la demostración interactiva en Lean 4: el modelo puede proponer tácticas y pasos intermedios en un editor como VS Code con la extensión Lean 4, y el usuario valida cada propuesta contra el compilador. La cuantización Q4_K_M permite ejecutarlo en una estación de trabajo con GPU de consumo.
- Verificación de pruebas en integración continua: desplegado con llama.cpp en un runner con GPU, el modelo puede intentar cerrar `sorry`s pendientes en un repositorio de formalizaciones y marcar los archivos que requieren revisión humana.
- Generación de borradores de lemas auxiliares: dado un enunciado en Lean 4, el modelo produce candidatos de lema intermedios que el investigador refina manualmente, reduciendo el coste de exploración en formalizaciones largas.
- Docencia de matemáticas formales: un entorno con Ollama puede servir respuestas del modelo sobre estrategias de prueba, con la ventaja de que las respuestas son verificables mecánicamente por el compilador de Lean.
- Construcción de datasets de entrenamiento para modelos de prueba: el modelo puede generar pares (enunciado, demostración) que, tras filtrado por el verificador, alimentan corpus de matemáticas formales.
- Prototipado de asistentes de investigación en entornos con restricciones de privacidad: al ejecutarse localmente en formato GGUF, no requiere enviar código o enunciados a servicios externos, lo que resulta adecuado para propiedad intelectual no publicada.
- Evaluación comparativa de métodos de adaptación geométrica: el artefacto sirve como referencia reproducible para estudiar el efecto de la variedad de Stiefel declarada frente al modelo base sin adaptar, siempre que se disponga del adaptador original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de Lean 4, MiniF2F, ProofNet ni de ningún otro conjunto de evaluación, ni comparaciones con el modelo base sin adaptar.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 4,5-5,5 GB para los pesos, más overhead de contexto; con 8 GB de VRAM debería operar con ventanas de contexto moderadas.
- VRAM estimada para Q8_0: en torno a 7,5-8,5 GB para los pesos; se recomienda 12 GB o más para margen de contexto.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para Q8_0 con contexto amplio; RTX 4060 Ti 16 GB, RTX 3060 12 GB o RTX 4070 para Q4_K_M.
- GPU de datacenter: A100 40/80 GB y H100 permiten servir múltiples instancias o contextos muy largos, aunque para 6,9 mil millones de parámetros son sobredimensionadas para una sola sesión.
- Cabe en GPU de consumo: sí, en ambas cuantizaciones, con mayor holgura en Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta explícita), servidores compatibles con la API de endpoints según la etiqueta `endpoints_compatible`. vLLM y TGI no están confirmados para este artefacto GGUF concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EINSOF-II DeepSeek-Prover-V2 7B Stiefel (este) | 6,9 B | No disponible | GGUF (Q4_K_M, Q8_0) | other | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-Prover-V2-7B (base) | 6,9 B | No disponible en la información | safetensors | No disponible en la información | Hugging Face (modelo base referenciado) |
| Adaptador einsof2-deepseek-prover-v2-stiefel-adapter | No disponible | No disponible | No disponible | No disponible | Hugging Face (repositorio referenciado) |

No se dispone de datos de benchmarks que permitan comparar rendimiento en Lean 4 entre este artefacto, su modelo base y otras alternativas de la misma categoría. La comparativa se limita, por tanto, a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- La licencia figura como "other" sin texto asociado en la información disponible; antes de cualquier uso comercial es imprescindible contactar con el autor y verificar también la licencia del modelo base DeepSeek-Prover-V2-7B.
- No hay benchmarks publicados: se desconoce si la adaptación Stiefel mejora, degrada o mantiene el rendimiento del modelo base en Lean 4.
- El proceso de cuantización GGUF introduce pérdida de precisión adicional sobre un adaptador ya de por sí no evaluado; Q4_K_M es especialmente susceptible en tareas de razonamiento formal, donde errores sutiles invalidan la prueba.
- El modelo está especializado en Lean 4; su utilidad fuera de matemáticas formales es previsiblemente limitada y no documentada.
- Riesgo de alucinación en pasos de prueba: el modelo puede generar tácticas sintácticamente plausibles pero lógicamente incorrectas, por lo que toda salida debe validarse con el compilador de Lean 4.
- Idiomas soportados no documentados; se desconoce el comportamiento en castellano o en otros idiomas distintos del inglés.
- Longitud de contexto no documentada, lo que impide planificar el tamaño de las formalizaciones que caben en una sola pasada.
- Repositorio sin descargas ni interacciones: no hay evidencia de comunidad, validación externa ni mantenimiento.
- La terminología geométrica de la model card (variedad de Stiefel, retracción polar de orden 4, POLYDIM PMTP) no va acompañada de paper, código ni reproducibilidad, lo que dificulta auditar el procedimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-deepseek-prover-v2-stiefel-gguf
- Adaptador referenciado: https://huggingface.co/Polydim-Einsof/einsof2-deepseek-prover-v2-stiefel-adapter
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Prover-V2-7B
