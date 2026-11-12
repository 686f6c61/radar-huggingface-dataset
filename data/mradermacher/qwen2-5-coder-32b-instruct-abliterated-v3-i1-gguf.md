# mradermacher/Qwen2.5-Coder-32B-Instruct-abliterated-v3-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Qwen2.5-Coder-32B-Instruct-abliterated-v3, una variante "abliterated" (con los mecanismos de rechazo suprimidos) del Qwen2.5-Coder-32B-Instruct de Alibaba. El trabajo de cuantización lo publica mradermacher, un autor habitual en la comunidad de GGUF, a partir de la versión abliterated publicada por jsantillana. El modelo base es un transformer decoder-only de 32.000 millones de parámetros, especializado en generación de código y con una ventana de contexto de 128.000 tokens (según la ficha oficial de Qwen2.5-Coder).

La relevancia de esta ficha es doble. Por un lado, permite ejecutar en local un modelo de código de 32B mediante cuantizaciones de 1 a 6 bits, incluidas las variantes IQ (importancia-matrix) que reducen el tamaño manteniendo calidad. Por otro, la modificación "abliterated" elimina las negativas del modelo ante peticiones que el alineamiento original rechazaría, lo que tiene implicaciones legales y de seguridad importantes para uso en producción.

Conviene advertir de que la información disponible en este repositorio es muy escasa: no hay model card descriptiva, no se declara licencia, no hay idiomas ni pipeline, y los metadatos de parámetros del campo safetensors (7.476.928) no son coherentes con un modelo de 32B, por lo que se tratan como no fiables. Los datos de arquitectura y contexto se infieren del modelo base Qwen2.5-Coder-32B-Instruct, no de este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), derivada de Qwen2.5-Coder-32B-Instruct |
| Parámetros totales | ~32.000 millones (modelo base); el campo safetensors del repo indica 7.476.928, dato no coherente y no fiable |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens según el modelo base Qwen2.5-Coder; no confirmado en este repo |
| Tipos de cuantización | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible en el repo; el modelo base Qwen2.5-Coder soporta principalmente inglés y chino, con cobertura multilingüe limitada |
| Licencia | no disponible en el repo; el modelo base Qwen2.5-Coder se distribuye bajo Apache 2.0, pero la modificación abliterated no declara licencia propia |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Qwen2.5-Coder-32B-Instruct: un transformer decoder-only denso de aproximadamente 32.000 millones de parámetros, con atención por ventanas y RoPE para extender el contexto hasta 128.000 tokens. Qwen2.5-Coder se entrenó sobre un corpus masivo de código y texto, con fases de preentrenamiento, ajuste supervisado y optimización por preferencias (DPO/RLHF) para alineamiento instruct. No se dispone en este repositorio de detalles sobre el número exacto de tokens de entrenamiento ni de la composición del dataset.

Sobre esa base, jsantillana aplicó una técnica de "abliteration" que suprime las direcciones de activación asociadas al rechazo, de modo que el modelo deja de negarse a responder ante ciertas peticiones. mradermacher ha generado después las cuantizaciones GGUF con importancia-matrix (imatrix) para minimizar la pérdida de calidad en los niveles bajos de bits. No hay información sobre el proceso exacto de abliteration ni sobre evaluaciones de calidad tras la modificación.

## Capacidades

- Generación de código en múltiples lenguajes (Python, JavaScript, TypeScript, C++, Go, Rust, Java, SQL, etc.), herencia del modelo base Qwen2.5-Coder.
- Razonamiento sobre código: explicación, refactorización, depuración y generación de tests.
- Relleno de código en medio (fill-in-the-middle) en las variantes base del modelo, aunque no se confirma en esta versión abliterated.
- Instrucciones en lenguaje natural y conversación multi-turno (modelo Instruct).
- Soporte de tool calling / function calling heredado del formato Qwen (no verificado en esta variante).
- Capacidades de agente y razonamiento multi-paso limitadas; el modelo base no es un modelo de razonamiento extendido tipo "thinking".
- Multilingüe limitado: inglés y chino principalmente; el español funciona pero con menor calidad en código y texto.
- Supresión de rechazos (abliterated): responde a peticiones que el modelo original rechazaría, lo que incluye contenido sensible.

## Casos de uso

- Asistente de código en local para desarrolladores con GPU de consumo: con cuantización Q4_K_M (~19-20 GB) puede ejecutarse en una RTX 4090 de 24 GB o en dos GPU de 16 GB, ofreciendo autocompletado y explicación de código sin enviar datos a la nube.
- Generación y refactorización de código en pipelines de CI/CD: el modelo puede integrarse vía llama.cpp u Ollama para generar parches, documentación o tests automáticos, con la ventaja de que el contexto de 128.000 tokens permite analizar repositorios medianos completos.
- Análisis de bases de código grandes: gracias a la ventana de contexto extendida se pueden pasar varios ficheros y solicitar auditorías de seguridad o detección de bugs, algo útil en revisiones de código internas.
- Chat de soporte técnico sobre documentación de APIs: el modelo puede responder preguntas sobre SDKs y frameworks usando contexto recuperado (RAG) en inglés o español, aunque la calidad en español es inferior a la del inglés.
- Investigación sobre alineamiento y seguridad: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin rechazos, comparar respuestas con el original y analizar sesgos y riesgos, siempre en entornos controlados.
- Prototipado de agentes de código: con tool calling (si se confirma en la plantilla) se puede construir un agente que ejecute comandos, consulte documentación y edite ficheros, aunque requiere validación humana por la falta de salvaguardas.
- Fine-tuning o destilación sobre código: las cuantizaciones GGUF no son adecuadas para entrenamiento, pero el modelo base en safetensors sí puede servir para generar datasets sintéticos de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de la variante abliterated ni comparaciones con el modelo original. Los benchmarks del modelo base Qwen2.5-Coder-32B-Instruct (por ejemplo, HumanEval, MBPP, LiveCodeBench) están publicados por Alibaba, pero no se reproducen aquí al no haberse proporcionado en la información de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización):
  - Q2_K / IQ2: ~11-12 GB.
  - Q3_K_M / IQ3: ~14-15 GB.
  - Q4_K_M: ~19-20 GB.
  - Q5_K_M: ~23-24 GB.
  - Q6_K: ~27-28 GB.
  - Q8_0 (no incluida en el repo): ~34-35 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100 40/80 GB o H100 para Q6_K y contexto largo; dos RTX 3090/4090 para repartir Q5/Q6.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M; en RTX 3090 (24 GB) igual; en GPU de 16 GB solo con Q2/Q3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa para este tamaño sin conversión.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Como referencia orientativa, en una RTX 4090 con Q4_K_M se esperan decenas de tokens por segundo, pero no hay medición publicada en este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-32B-Instruct (original) | ~32B | 128K | Apache 2.0 | safetensors, GGUF | Modelo base con alineamiento intacto y benchmarks publicados |
| Qwen2.5-Coder-32B-Instruct-abliterated-v3 (jsantillana) | ~32B | 128K (heredado) | no disponible | safetensors | Variante abliterated de la que deriva este repo |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2.4B activos) | 128K | DeepSeek License | safetensors, GGUF | Alternativa MoE más ligera en cómputo |
| CodeLlama-34B-Instruct | 34B | 16K | Llama 2 License | safetensors, GGUF | Contexto mucho menor y licencia más restrictiva |

La comparación directa en rendimiento no es posible porque este repositorio no publica benchmarks. La ventaja principal frente a las alternativas es la combinación de 32B, contexto de 128K y disponibilidad en GGUF con cuantizaciones IQ; la desventaja es la ausencia de licencia declarada y la modificación abliterated, que puede incumplir los términos del modelo original.

## Limitaciones y advertencias

- La modificación abliterated elimina los rechazos del modelo, por lo que puede generar contenido dañino, ilegal o inseguro sin filtro; no es apta para aplicaciones orientadas al público sin capas adicionales de moderación.
- La licencia no está declarada en el repositorio. El modelo base Qwen2.5-Coder es Apache 2.0, pero la redistribución de una variante modificada sin licencia explícita genera incertidumbre legal para uso comercial.
- Los metadatos de parámetros del campo safetensors (7.476.928) son incoherentes con un modelo de 32B y no deben usarse para estimar requisitos.
- No hay model card, idiomas declarados ni pipeline; la información sobre contexto y capacidades se infiere del modelo base y no está verificada en esta variante.
- Riesgo de alucinación en código: como todo modelo de código, puede inventar APIs, funciones o dependencias inexistentes; requiere validación con tests.
- La calidad en español es inferior a la del inglés; el modelo base está optimizado para inglés y chino.
- Las cuantizaciones de 1-2 bits (IQ1, IQ2) degradan notablemente la calidad y no se recomiendan para producción.
- El contexto de 128K en GGUF requiere configurar correctamente el tamaño de ventana en llama.cpp y consume mucha memoria KV; en GPU de consumo habrá que reducirlo.
- No se han publicado evaluaciones de la variante abliterated; no hay garantía de que mantenga el rendimiento del original en benchmarks de código.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-Coder-32B-Instruct-abliterated-v3-i1-GGUF
- Modelo de origen (jsantillana): https://huggingface.co/jsantillana/Qwen2.5-Coder-32B-Instruct-abliterated-v3
- Modelo base oficial: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Blog de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder/
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
