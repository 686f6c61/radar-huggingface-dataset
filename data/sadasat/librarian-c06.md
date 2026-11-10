# sadasat/librarian-c06

## Resumen

Librarian C06 es un checkpoint experimental derivado de Qwen/Qwen3.5-0.8B mediante técnicas de programación en el espacio de pesos (weight-space programming). Lo desarrolla el usuario sadasat como parte de una investigación sobre edición de pesos que busca inyectar conocimiento factual directamente en los parámetros del modelo, sin recurrir a recuperación aumentada (RAG), adaptadores en tiempo de ejecución ni respuestas fuente en el prompt. El modelo responde sobre una librería cerrada de 27 registros de ideas definida por el autor, usando pesos fusionados y un prompt de rol genérico.

El modelo parte de un checkpoint base personalizado de Qwen3.5-0.8B con 752.393.024 parámetros totales y una arquitectura de transformer denso (tag `qwen3_5_text`). Se distribuye en dos representaciones: un checkpoint nativo en BF16 con safetensors y una exportación ONNX en FP16/FP32 pensada para inferencia en navegador sobre CPU. La licencia es Apache 2.0 y los idiomas declarados son inglés y español.

Su relevancia es fundamentalmente metodológica: documenta un experimento controlado de edición de un único tensor (`model.layers.23.mlp.down_proj.weight`) sobre 320 tensores totales, con auditoría completa de procedencia, hashes de integridad y resultados de evaluación acotados. No es un asistente de propósito general ni una demostración de generalización sobre datos no vistos, y el propio autor lo enmarca explícitamente como un resultado de desarrollo estrecho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `qwen3_5_text`), derivado de Qwen3.5-0.8B |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (checkpoint nativo), FP16/FP32 (exportación ONNX para navegador) |
| Idiomas soportados | inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo), ONNX (navegador, con chunks de 32 MiB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen3.5-0.8B, revisión `2fc06364715b967f1860aea9cf38778875588b17`. El checkpoint base personalizado conserva poda y configuración históricas, además de cuatro ediciones de coordenadas de embedding. Respecto a ese base, C06 modifica exactamente uno de 320 tensores: `model.layers.23.mlp.down_proj.weight`. La edición se realizó mediante seis proyecciones analíticas de lectura sin gradiente (gradient-free analytic readout projections) que ajustan 89 unidades de enseñanza completas sobre 3.657 posiciones objetivo. Se aplicó protección consciente del rol para excluir objetivos de respuestas previas del asistente que entraban en conflicto con el objetivo de enseñanza, manteniendo la protección de system/user y de las posiciones posteriores a la respuesta.

El proceso es aprendizaje supervisado por ejemplos (example-supervised editing), no aprendizaje libre de datos. La norma relativa de actualización de la matriz de escritura es 1.879, lo que el autor subraya como evidencia de que un cambio en un solo tensor no equivale a un cambio pequeño. La construcción se validó con pérdida teacher-forced, que el autor advierte que no equivale a precisión semántica. La inferencia nativa de referencia usa `TokenizersBackend` explícito con `fix_mistral_regex=False`, Transformers 5.22.1 y tokenizers 0.23.3; el modo thinking está desactivado, con 160 tokens nuevos, temperatura 0.7, top-p 0.9 y top-k 40. Cualquier reparación silenciosa del tokenizador o plantilla de chat distinta invalida la paridad de input-IDs registrada.

## Capacidades

- Generación de texto en inglés y español sobre el dominio cerrado de la librería de 27 registros de ideas del autor.
- Respuesta a preguntas guiadas por un prompt de rol genérico, sin recuperación externa ni respuestas fuente inyectadas en el prompt.
- Ejecución de inferencia en navegador sobre CPU del visitante mediante la exportación ONNX y el runtime JavaScript/WASM del repositorio del sitio web.
- Síntesis de voz (PiVo voice) en el navegador, según la aplicación de referencia del autor.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.
- No se documentan capacidades de código o matemáticas evaluadas.

## Casos de uso

- Investigación sobre edición de pesos: el checkpoint sirve como caso de estudio reproducible de inyección de conocimiento factual en un único tensor, con receta de reconstrucción, informe de construcción y auditoría de todos los tensores en `provenance/`.
- Docencia y divulgación de weight-space programming: el estudio enlazado incluye candidatos exitosos y fallidos, respuestas en bruto, juicios semánticos externos y literatura, lo que permite explicar el método con evidencia trazable.
- Demostración de inferencia en navegador sin servidor: la aplicación de referencia ejecuta el modelo y la síntesis de voz en la CPU del visitante, útil para prototipos de privacidad por diseño donde el texto no sale del dispositivo.
- Evaluación de pipelines ONNX para LLM pequeños: la exportación FP16/FP32 con manifiesto de procedencia y chunks de integridad verificable permite probar cadenas de conversión y descarga fragmentada.
- Auditoría de integridad de artefactos: `release-files.json` con longitudes en bytes y SHA-256 de cada fichero facilita verificar releases inmutables en flujos de suministro de software.
- Réplica de experimentos de alineación estrecha: el contraste entre pérdida teacher-forced y precisión semántica es un caso práctico para estudiar los límites de las métricas de construcción.

## Benchmarks y rendimiento

El autor reporta los siguientes recuentos de evaluación, que no son benchmarks estándar sino resultados de su barrido de desarrollo:

| Evaluación | Resultado |
|---|---|
| Barrido nativo de desarrollo (turnos) | 28/28 |
| Turnos críticos | 12/12 |
| Conversaciones | 18/18 |
| Rondas de navegador registradas | 5 rondas, cada una con esos recuentos |
| Respuestas en navegador | 140 respuestas, solo 29 pares caso/texto distintos |
| Sonda de preguntas originales | 27/27, con formulaciones añadidas explícitamente a la construcción |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 752 millones de parámetros, el checkpoint BF16 ocupa aproximadamente 1,5 GB de pesos, y la exportación ONNX FP16/FP32 un orden similar.
- GPU recomendadas: no disponible; el autor no documenta requisitos de GPU.
- Inferencia en consumidor: el modo validado es CPU en navegador, no GPU. El autor indica que se necesitan varios GB de memoria libre y decenas de segundos por respuesta en CPU.
- Transferencia de modelo en navegador: aproximadamente 1,53 GB de modelo más el runtime.
- Plataforma medida: Chrome for Testing 157 sobre Linux. No se ha establecido soporte para teléfonos físicos, Safari ni dispositivos universales.
- Opciones de despliegue: runtime JavaScript/WASM del repositorio del sitio web con exportación ONNX; el autor advierte explícitamente de no usar un pipeline por defecto de Hub para la reproducción nativa.
- Latencia y throughput: decenas de segundos por respuesta en CPU según el autor; sin cifras de throughput publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Librarian C06 | 752.393.024 | no disponible | Edición de pesos sobre dominio cerrado, inferencia en navegador | Apache 2.0 | Hugging Face (sadasat/librarian-c06) |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | Modelo base de propósito general | no disponible | Hugging Face (modelo base declarado) |
| Alternativas de 0,5-1B de propósito general | no disponible | no disponible | Asistentes generales | no disponible | no disponible |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Resultado de desarrollo estrecho: no es un asistente de propósito general ni una demostración de generalización sobre datos no vistos. Las preguntas conocidas guiaron las ediciones.
- Las cinco rondas de navegador producen 140 respuestas pero solo 29 pares caso/texto distintos, lo que limita la diversidad efectiva de la evidencia.
- La sonda de 27/27 incluye formulaciones añadidas explícitamente a la construcción, por lo que no constituye una prueba limpia de generalización.
- Un cambio en un solo tensor no es un cambio pequeño: la norma relativa de actualización es 1.879, y la deriva protegida muestreada y una pregunta de control colateral estrecha no demuestran preservación amplia de capacidades.
- La pérdida teacher-forced de construcción no equivale a precisión semántica; la redacción novedosa, las conversaciones largas, el conocimiento no relacionado y el comportamiento de alucinación requieren evaluación adicional.
- La evaluación nativa y la de navegador se realizaron por separado; publicar los mismos ficheros no constituye una nueva evaluación.
- La plataforma validada es Chrome for Testing 157 en Linux; no hay soporte establecido para Safari, teléfonos físicos ni dispositivos universales.
- El tokenizador original se mantiene sin cambios de forma intencionada; reparaciones silenciosas o plantillas de chat distintas invalidan la paridad de input-IDs.
- Para releases se debe usar una revisión inmutable completa del Hub, no `main`; las representaciones nativa y ONNX tienen dtypes y hashes distintos.
- Al redistribuir, deben conservarse la licencia Apache 2.0 incluida y el aviso de modificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadasat/librarian-c06
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del sitio web (aplicación de navegador): https://github.com/sadasant/website/pull/11
- Guía operativa: https://github.com/sadasant/website/blob/experiment/notebook-persona/experiments/weight-edit/inweights/README.md
- Estudio completo con gráficas y evidencia: https://github.com/sadasant/website/blob/135ebec535d7913e95b427e8f7013155961b5843/experiments/weight-edit/docs/weight-space-programming-study.md
- Referencia bibliográfica citada: arXiv:2611.09382
