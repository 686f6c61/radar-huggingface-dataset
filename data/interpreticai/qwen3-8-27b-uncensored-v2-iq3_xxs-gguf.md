# InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF es una cuantización de 3 bits en formato GGUF del modelo Qwen3.8-27B-Uncensored-v2, publicada por InterpreticAI (Thomas Young). El modelo base es una variante de Qwen/Qwen3.8-27B a la que se le ha eliminado en gran medida la censura política, manteniendo la licencia Apache 2.0 y la atribución del equipo Qwen. Esta build concreta está pensada para GPUs con 12 a 16 GB de memoria, con un archivo de pesos de 10,5 GB y un proyector de visión opcional de 0,93 GB en F16.

El modelo resuelve el problema del sesgo y la evasión en respuestas a preguntas políticamente sensibles en chino, un fenómeno documentado académicamente por Pan y Xu (2026) en PNAS Nexus. Según la model card, la variante v2 reduce las respuestas censuradas del 83 % (Qwen3.8-27B original) al 3,5 % sobre 115 preguntas sensibles, y las respuestas que evaden o se niegan del 50 % al 1,7 %. Frente a Arete-27B de Nous Research, otro fine-tune del mismo modelo base orientado al mismo objetivo, la v2 obtiene un 3,5 % de censura frente al 50 % de Arete.

La relevancia de esta publicación concreta es que traslada esas capacidades a hardware de consumo: con 27.320.697.856 parámetros totales y cuantización IQ3_XXS, el modelo cabe en tarjetas de 12-16 GB, a costa de una pérdida de unos 4 puntos en MMLU respecto a la build Q4_K_M (78,0 frente a 81,9). Es multimodal (pipeline image-text-to-text) y conserva la cabeza MTP (NextN) para decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); no se detalla en la informacion disponible |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de uso publicado (`-c 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | IQ3_XXS (3 bits); otras builds del mismo autor: BF16, FP8, GGUF Q4_K_M |
| Idiomas soportados | no disponible (la evaluacion politica cubre solo preguntas en chino) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | GGUF (`Qwen3.8-27B-Uncensored-v2-IQ3_XXS.gguf`, 10,5 GB) + proyector de vision `mmproj-...-F16.gguf` (0,93 GB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27.320.697.856 parametros. La model card no detalla la composicion del dataset de entrenamiento ni el numero de tokens, y tampoco especifica si se empleo RLHF o DPO. Lo que si se documenta es el proceso de "descensura": la componente de valores de Uncensored-v2 se ajusto sobre los prompts de Pan y Xu, lo que la propia model card advierte que hace que la fila de valores sea in-sample para este modelo y out-of-sample para Arete-27B. La variante v2 se construyo sobre Qwen3.8-27B y conserva la cabeza MTP (NextN) para decodificacion especulativa, a diferencia de la v3, basada en Arete-27B y sin MTP.

La build IQ3_XXS se genero con llama.cpp y mantiene la capa MTP original, de modo que las builds de llama.cpp con soporte MTP pueden usarla para decodificacion especulativa. El repositorio incluye checksums SHA-256 en `SHA256SUMS`. La evaluacion se realizo con llama-server en modo no-thinking y decodificacion greedy, con un juez LLM etiquetando cada respuesta.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Entrada de imagen: el pipeline es image-text-to-text y se distribuye un proyector de vision F16 opcional.
- Modo thinking y no-thinking: se puede desactivar el razonamiento explicito con `--chat-template-kwargs '{"enable_thinking": false}'`.
- Decodificacion especulativa mediante la cabeza MTP (NextN) conservada en el GGUF.
- Respuestas sustancialmente mas abiertas a preguntas politicamente sensibles en chino (3,5 % de respuestas censuradas frente al 83 % del base).
- Compatibilidad con endpoints (`endpoints_compatible` segun tags).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de discurso politico en chino: el modelo permite obtener respuestas sustanciales sobre temas que el base evade (100 % de alineamiento con valores del PCC en el base frente al 10 % en v2), util para investigacion en ciencias sociales y estudios de censura.
- Investigacion academica sobre sesgo: comparar respuestas del base, Arete-27B y esta variante con los mismos prompts y decodificacion permite aislar el efecto de la censura en el comportamiento del modelo.
- Despliegue en estaciones de trabajo con GPU de 12-16 GB: el archivo de 10,5 GB cabe en tarjetas consumer y permite ejecutar un modelo de 27B en local con llama.cpp, sin depender de APIs externas.
- Procesamiento de documentos con imagenes: con el proyector de vision F16 se pueden pasar capturas, diagramas o paginas escaneadas junto al texto en un mismo prompt.
- Generacion de texto en entornos con presupuesto de memoria ajustado: cuando la build Q4_K_M (16,8 GB) no cabe, esta IQ3_XXS ofrece un compromiso con MMLU de 78,0 frente a 81,9.
- Prototipado de asistentes conversacionales: el tag `conversational` y la compatibilidad con endpoints permiten integrarlo en un servidor llama-server con plantilla Jinja (`--jinja`) para pruebas de chat multi-turno.
- Experimentacion con decodificacion especulativa: al conservar la cabeza MTP, sirve para medir el impacto de la decodificacion especulativa en latencia sobre hardware limitado.

## Benchmarks y rendimiento

Evaluacion publicada por el autor, ejecutada con llama-server en modo no-thinking y decodificacion greedy. La censura politica se mide con 113 preguntas de Pan y Xu (2026) etiquetadas por un juez LLM; la negativa a peticiones daninas, con los primeros 100 prompts del split de test de `mlabonne/harmful_behaviors`.

| Metrica | Q4_K_M | Esta build (IQ3_XXS) |
|---|---|---|
| Tamano de archivo | 16,8 GB | 10,5 GB |
| MMLU (1.000 items) | 81,9 | 78,0 |
| Respuestas censuradas (de 113) | 5 | 3 |
| Negativa a peticiones daninas (de 100) | 92 | 85 |
| Respuestas degeneradas en 110 prompts neutros | 1 | 7 |

Comparativa del modelo base frente a Arete-27B y Uncensored-v2, medida sobre la release BF16 con los mismos prompts, decodificacion (no-thinking, greedy) y juez para los tres modelos. Porcentajes sobre 115 preguntas sensibles; la fila de valores usa 10 preguntas de seguimiento.

| Metrica | Qwen3.8-27B | Arete-27B | Uncensored-v2 |
|---|---|---|---|
| Respuestas censuradas (menor es mejor) | 83 % | 50 % | 3,5 % |
| Se niega o evade (menor es mejor) | 50 % | 23 % | 1,7 % |
| Reescribe con talking points del PCC (menor es mejor) | 32 % | 28 % | 1,7 % |
| Se alinea con valores del PCC (menor es mejor) | 100 % | 30 % | 10 % |
| Tema correcto, respondido abiertamente (mayor es mejor) | 12 % | 38 % | 77 % |
| Cabeza MTP para decodificacion especulativa | Si | No | Si |

No se han publicado resultados de benchmarks de codigo, matematicas o vision en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 10,5 GB para los pesos IQ3_XXS mas overhead de contexto; el autor indica que esta pensada para GPUs de 12 a 16 GB. Con entrada de imagen hay que sumar 0,93 GB del proyector F16.
- GPUs recomendadas: no se especifican modelos concretos; el rango declarado (12-16 GB) cubre tarjetas consumer como RTX 3060 de 12 GB, RTX 4070 Ti Super de 16 GB o RTX 4080 de 16 GB.
- Cabe en GPU consumer: si, en el rango de 12-16 GB indicado por el autor.
- Opciones de despliegue: llama.cpp / llama-server (comando documentado con `-ngl 999 -c 32768 --jinja`); Ollama, vLLM o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. La build conserva la cabeza MTP para decodificacion especulativa, lo que puede reducir latencia en builds de llama.cpp con soporte MTP, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Censura politica (de 115) | Licencia | Formatos |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2 (IQ3_XXS) | 27,3 B | 32.768 en el ejemplo | 3,5 % | Apache 2.0 | GGUF IQ3_XXS; BF16, FP8 y Q4_K_M en otros repos |
| Qwen3.8-27B-Uncensored-v3 | 27,3 B (heredados del base) | no disponible | 2,6 % | Apache 2.0 | BF16, GGUF Q4_K_M, GGUF IQ3_XXS, MLX 4-bit |
| Arete-27B (Nous Research) | 27 B (mismo base) | no disponible | 50 % | no disponible | no disponible |
| Qwen3.8-27B (original) | 27,3 B | no disponible | 83 % | Apache 2.0 | BF16 (referenciado) |

Segun el autor, la v3 obtiene la menor tasa de censura (2,6 %) pero no conserva MTP; la v2 se recomienda si se necesita decodificacion especulativa o FP8.

## Limitaciones y advertencias

- La evaluacion politica cubre unicamente preguntas en chino; el comportamiento en otros idiomas no esta medido.
- Una respuesta sustancial no implica que sea correcta: el autor recomienda verificar de forma independiente las afirmaciones factuales.
- La componente de valores se ajusto sobre los prompts de Pan y Xu, por lo que la comparacion de la fila de valores es in-sample para este modelo y out-of-sample para Arete-27B; los resultados pueden estar sobreestimados.
- Degradacion en cuantizacion: 7 respuestas degeneradas de 110 prompts neutros frente a 1 en Q4_K_M, y MMLU 3,9 puntos inferior (78,0 frente a 81,9). El autor recomienda Q4_K_M cuando la memoria lo permita.
- La reduccion de censura politica tambien reduce la negativa a peticiones daninas (85 de 100 frente a 92 de 100 en Q4_K_M), lo que exige filtros de seguridad externos en produccion.
- El contexto documentado es de 32.768 tokens en el ejemplo de uso; no se confirma si es el maximo nativo.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar la licencia y la atribucion del equipo Qwen.
- No hay informacion sobre sesgos fuera del eje politico en chino, ni sobre tool calling o capacidades de agente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-IQ3_XXS-GGUF
- Modelo base (BF16): https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Build FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Build GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Variante v3: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Variante v3 GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-GGUF
- Variante v3 GGUF IQ3_XXS: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-IQ3_XXS-GGUF
- Variante v3 MLX 4-bit: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3-MLX-4bit
- Arete-27B (Nous Research): https://huggingface.co/NousResearch/Arete-27B
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper de referencia: Pan, J., & Xu, X. (2026). Political censorship in large language models originating from China. PNAS Nexus, 5(2), pgag013. https://doi.org/10.1093/pnasnexus/pgag013
- DOI del modelo: https://doi.org/10.57967/hf/11544
