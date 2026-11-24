# mradermacher/tolk-7B-GGUF

## Resumen

tolk-7B-GGUF es la versión cuantizada en formato GGUF del modelo tolk-7B, desarrollado originalmente por RaspizdAI y convertido a GGUF por mradermacher, un publicador habitual de cuantizaciones para la comunidad de inferencia local. El modelo base es un transformer de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado a conversación, con soporte declarado para ruso e inglés y licencia MIT, lo que lo hace atractivo para uso comercial y para despliegues en hardware de consumo.

La relevancia de esta ficha radica en que el repositorio GGUF ofrece una matriz completa de cuantizaciones estáticas (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB), lo que permite ejecutar el modelo en un espectro amplio de hardware, desde GPUs de consumo con 6-8 GB de VRAM hasta estaciones de trabajo. Sin embargo, la información pública disponible es escasa: no se documentan la longitud de contexto, el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks.

Esta ficha se limita a los datos verificables del repositorio y de la model card del cuantizador. Cualquier dato no confirmado se marca explícitamente como "no disponible" para evitar inferencias no fundamentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles específicos no disponibles) |
| Parametros totales | 7.615.616.512 (≈7,6 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 68,1 GB |
| Modelo base | RaspizdAI/tolk-7B |
| Libreria declarada | transformers |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un transformer de aproximadamente 7,6 mil millones de parámetros, derivado del modelo RaspizdAI/tolk-7B. No se dispone de detalles sobre el número de capas, dimensiones ocultas, mecanismo de atención, número de cabezas ni sobre posibles innovaciones arquitectónicas (atención lineal, decodificación especulativa, arquitecturas híbridas, etc.).

Tampoco hay datos públicos sobre el proceso de entrenamiento: número de tokens, composición del corpus, uso de RLHF, DPO u otras técnicas de alineación. La model card del cuantizador no incluye información del autor original más allá de la referencia al modelo base. Los tags del repositorio indican uso conversacional y soporte bilingüe ru/en, pero no se documenta la proporción de cada idioma en los datos de entrenamiento ni la metodología de ajuste.

Las cuantizaciones son estáticas y generadas con el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se han publicado cuantizaciones con imatrix (weighted) para este modelo en el momento de la consulta, lo que implica que las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar más la perplejidad que sus equivalentes con imatrix.

## Capacidades

- Generación de texto conversacional en ruso e inglés, según los idiomas declarados en la model card.
- Conversación multi-turno: el tag "conversational" sugiere un ajuste orientado a diálogo, aunque no se documenta el formato de prompt exacto.
- Inferencia local mediante llama.cpp y ecosistemas compatibles con GGUF.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No se documentan capacidades específicas de código o matemáticas; no hay benchmarks que las respalden.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que indica que puede servirse a través de infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Asistente conversacional bilingüe ru/en en local: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo y gestionar diálogos multi-turno en ruso e inglés, aprovechando la cuantización Q4_K_M (4,8 GB) para un equilibrio entre calidad y velocidad.
- Prototipado rápido en hardware de consumo: con la cuantización Q4_K_S (4,6 GB) cabe en GPUs de 8 GB de VRAM, lo que permite iterar sobre prompts y flujos conversacionales sin infraestructura cloud.
- Procesamiento de texto en entornos con requisitos de privacidad: al ser un modelo MIT ejecutable en local, puede usarse para resumir o reformular documentos internos en ruso sin enviar datos a terceros.
- Base para fine-tuning específico de dominio: el modelo base en safetensors (RaspizdAI/tolk-7B) puede ajustarse con datos propios y posteriormente cuantizarse a GGUF para despliegue, gracias a la licencia MIT.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la precisión en la calidad de las respuestas para un caso de uso concreto antes de fijar una versión en producción.
- Chat de soporte en ruso para comunidades técnicas: con Q8_0 (8,2 GB) en una GPU de 12-16 GB se obtiene la máxima calidad disponible en GGUF, adecuada para respuestas conversacionales donde la fidelidad al idioma es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (sin contar overhead de contexto y KV cache):
  - Q2_K: ~3,1 GB
  - Q3_K_S: ~3,6 GB
  - Q3_K_M: ~3,9 GB
  - Q3_K_L: ~4,2 GB
  - IQ4_XS: ~4,4 GB
  - Q4_K_S: ~4,6 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_S: ~5,4 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- GPU recomendadas:
  - GPUs de consumo con 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070): Q4_K_S o Q4_K_M con contexto moderado.
  - GPUs de consumo con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080): Q5_K_M, Q6_K o Q8_0.
  - GPUs profesionales (A100, H100): f16 o Q8_0 con contexto largo, aunque el modelo no aprovecha el exceso de VRAM más allá de permitir mayor batch y contexto.
- Cabe en GPU de consumo: sí, desde 6-8 GB de VRAM con cuantizaciones Q2_K a Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere también despliegue vía endpoints de Hugging Face. No se documenta soporte explícito de vLLM o TGI para el formato GGUF.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto, que no está documentada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, entrenamiento) que permitan una comparación rigurosa con alternativas. La siguiente tabla recoge únicamente los datos verificables de este modelo frente a referencias genéricas de la misma categoría, marcando como "no disponible" lo que no se puede confirmar.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| tolk-7B (este) | ≈7,6 B | No disponible | ru, en | MIT | Sí (12 cuantizaciones) |
| Alternativa 7B bilingüe ru/en | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativa 7B conversacional | No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican en la información proporcionada modelos comparables concretos con datos verificables; se indica "no disponible" para evitar comparaciones sin fundamento.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni evaluaciones de calidad conversacional, por lo que el rendimiento real es desconocido.
- Idiomas limitados: solo se declaran ruso e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo sin pruebas empíricas.
- Riesgo de alucinación: inherente a los modelos de 7B sin datos de alineación documentados; no se especifican técnicas de RLHF/DPO aplicadas.
- Cuantizaciones estáticas sin imatrix: las variantes de baja precisión (Q2_K, Q3_K) pueden degradar la calidad más que cuantizaciones ponderadas equivalentes.
- Sesgos: no documentados; al no conocerse la composición del corpus de entrenamiento, no se pueden evaluar sesgos de género, políticos o culturales.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el usuario asume la responsabilidad sobre el cumplimiento de las licencias de los datos de entrenamiento originales, que no se detallan.
- Modelo base poco documentado: la falta de información sobre RaspizdAI/tolk-7B en la model card del cuantizador limita la evaluación de su procedencia y calidad.
- Fecha de creación futura en los metadatos (2026-09-19): conviene verificar la integridad y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tolk-7B-GGUF
- Modelo base: https://huggingface.co/RaspizdAI/tolk-7B
- Página de descargas del cuantizador: https://hf.tst.eu/model#tolk-7B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
