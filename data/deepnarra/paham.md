# DeepNarra/Paham

## Resumen

DeepNarra Paham 1.0 (4.17M-A1.2M Elastic Edge) es un modelo de generación de texto en formato causal LLM publicado por la organización DeepNarra en Hugging Face. Se trata de un modelo extraordinariamente pequeño: los pesos en safetensors contienen exactamente 4.171.887 parámetros (15,92 MB), con una variante nativa ternaria en GGUF (BitNet b1.58, formato TQ1_0) de apenas 0,81 MB. Según su model card, implementa una arquitectura propia denominada `DeepNarraPahamForCausalLM` con un enrutador elástico de tres marchas basado en entropía de Shannon, atención híbrida GLA/DSA y mecanismos de decodificación especulativa.

Su relevancia no está en competir con modelos de propósito general, sino en la exploración de inferencia en el borde (edge): un binario de menos de 1 MB con throughput medido de 1.680,7 tokens/s en una Tesla T4 (dato afirmado por el autor) sería adecuado para dispositivos con recursos muy limitados. El propio autor declara una política de "Zero Fake Scores", publicando únicamente métricas de ingeniería verificables y sin resultados de benchmarks académicos.

Es importante señalar que el proyecto mezcla afirmaciones verificables (recuento de parámetros, tamaños de archivo) con terminología y componentes (Lyapunov GLA, Coconut symplectic phase space, GLM-5 DSA) cuya implementación real no puede contrastarse solo con la model card. Con 4,17M de parámetros, las expectativas de calidad de generación deben ser muy modestas: está varios órdenes de magnitud por debajo de modelos como Qwen2.5-0.5B o SmolLM2-135M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DeepNarraPahamForCausalLM` (router elástico de 3 marchas + híbrido GLA/DSA) |
| Parametros totales | 4.171.887 (4,17M, verificado en safetensors) |
| Parametros activos | ~1,2M (marcha 1), ~2,5M (marcha 2), 4,17M (marcha 3), según el autor |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TQ1_0 (BitNet b1.58 ternario, 1,58 bits/peso) en GGUF; pesos nativos en safetensors |
| Idiomas soportados | Inglés (etiquetado principal); etiquetado como multilingüe sin detalle de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (15,92 MB, 60 tensores) y GGUF (model-TQ1_0.gguf, 0,81 MB) |

## Arquitectura y entrenamiento

La arquitectura declarada combina varios componentes: un "Shannon Entropy 3-Gear Elastic Router" que calcula la entropía de Shannon token a token para decidir cuánto cómputo dedicar a cada paso (marcha 1 o "reflejo" para H < 0,8; marcha 2 "estable" para entropías medias; marcha 3 "soberana" para H ≥ 2,0 con deliberación latente continua); una atención híbrida que, según el autor, mezcla un 75 % de recurrencia GLA (Gated Linear Attention) por bloques con un 25 % de Dynamic Sparse Attention estilo GLM-5, con un caché de estado O(1); y un motor de decodificación especulativa basado en predicción multi-token (k=4) y prompt lookup decoding (k=50). También se describen adaptadores laterales GGUF-QLoRA "hot-swappable" para aprendizaje continuo sin reinicio del servicio, manteniendo congelados los pesos ternarios base.

Sobre el entrenamiento, la model card lista tres datasets: HuggingFaceFW/fineweb-edu (corpus educativo web, licencia ODC-By 1.0), CohereForAI/aya_collection (multilingüe) y m-a-p/CodeFeedback-Filtered-Instruction (instrucciones de código). No se especifican el número de tokens de entrenamiento, el procedimiento de post-entrenamiento (SFT, RLHF, DPO) ni detalles de hiperparámetros. No hay información disponible sobre esos aspectos.

## Capacidades

- Generacion de texto causal (pipeline `text-generation`) en inglés, con etiquetado multilingüe sin detalle.
- Cómputo elástico por token: el router de tres marchas ajusta el coste de inferencia según la complejidad estimada del token.
- Decodificación especulativa integrada: multi-token prediction (k=4) y prompt lookup decoding (k=50) para acelerar la generación.
- Aprendizaje continuo en despliegue mediante adaptadores QLoRA intercambiables en caliente (según el autor).
- Entrenamiento con datos de código (CodeFeedback), por lo que teóricamente tiene exposición a instrucciones de programación, aunque sin benchmarks que lo verifiquen.
- No hay evidencia publicada de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en arquitecturas de atención híbrida: el código y los pesos son un banco de pruebas real para estudiar GLA, sparse attention dinámica y routers por entropía en un modelo lo bastante pequeño para iterar rápido en una sola GPU.
- Inferencia en microcontroladores y edge: el GGUF ternario de 0,81 MB cabe en memoria de dispositivos muy modestos, útil para autocompletado básico o generación de texto simple embebida.
- Prototipado de cuantización ternaria (BitNet b1.58): permite experimentar con el formato TQ1_0 en llama.cpp/Ollama sin necesidad de hardware caro.
- Estudio de decodificación especulativa: la combinación de MTP y prompt lookup decoding en un modelo diminuto facilita medir el impacto real de estas técnicas.
- Sistemas de aprendizaje continuo: los sidecars QLoRA "hot-swappable" sirven para experimentar con actualización de modelos en producción sin downtime.
- Asistente de texto de dominio muy acotado: dado su tamaño, solo es realista para tareas estrechas y controladas (plantillas, reescrituras simples), no para conocimiento general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento publicado por el autor es de ingeniería, no de calidad:

| Metrica | Valor |
|---|---|
| Throughput medido | 1.680,7 tokens/s (afirmado, Tesla T4) |
| Latencia por paso | 9,52 ms (afirmado, Tesla T4) |
| Drift energetico de deliberacion latente | ΔE = 2,37e-16 (afirmado) |

Estos valores proceden de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM para inferencia: mínima. El safetensors ocupa 15,92 MB y el GGUF ternario 0,81 MB; incluso con overhead de runtime, cualquier GPU moderna o CPU lo ejecuta sin problema.
- GPU recomendadas: cualquiera. El autor reporta mediciones en una Tesla T4; no se necesita A100 ni H100.
- Consumer GPUs: cabe sobradamente en cualquier GPU con 2 GB de VRAM o más; también es viable en CPU.
- Despliegue: Ollama (incluye Modelfile para el GGUF TQ1_0), llama.cpp (formato GGUF), y carga directa de safetensors con la librería `transformers` (clase `DeepNarraPahamForCausalLM`, que requiere confiar en el código remoto del repositorio). No hay mención de vLLM ni TGI.
- Latencia y throughput: 1.680,7 tok/s y 9,52 ms por paso según el autor en Tesla T4 (sin verificación independiente).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepNarra Paham 1.0 | 4,17M (1,58 bpw en GGUF) | no disponible | Apache-2.0 | Arquitectura propia experimental, cuantización ternaria nativa |
| SmolLM2-135M (Hugging Face) | 135M | 2.048 (2048, ampliable a 8192) | Apache-2.0 | Modelo pequeño consolidado, con benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 (128K con YaRN) | Apache-2.0 | Calidad muy superior, requisitos aún modestos |

Paham es entre 30 y 120 veces más pequeño que estas alternativas, por lo que su calidad generativa será sustancialmente inferior; su valor diferencial está en la experimentación arquitectónica y la huella extrema, no en rendimiento en benchmarks.

## Limitaciones y advertencias

- Con 4,17M de parámetros, la calidad de texto, razonamiento y código será muy limitada; no es comparable a ningún LLM moderno de propósito general.
- Muchas afirmaciones de la model card (Lyapunov GLA, deliberación Coconut, throughput medido) no están acompañadas de papers, código de evaluación ni verificación independiente; conviene tratarlas con escepticismo.
- La longitud de contexto no está documentada; no se puede asumir soporte de contextos largos.
- La carga con `transformers` requiere ejecutar código remoto personalizado (`trust_remote_code=True`), lo que implica revisar el código antes de usarlo en producción.
- El etiquetado "multilingüe" no detalla idiomas soportados ni su calidad; el corpus principal (fineweb-edu) es en inglés.
- No hay datos de benchmarks de calidad ni evaluaciones de sesgos o alucinaciones; el riesgo de alucinación es inherente y no caracterizado.
- La licencia Apache-2.0 permite uso comercial sin restricciones relevantes; los datasets upstream requieren atribución (ODC-By 1.0 para fineweb-edu).
- Proyecto con muy poca tracción pública (332 descargas, 0 likes en el momento de la ficha), sin comunidad ni soporte establecidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DeepNarra/Paham
- Organización DeepNarra: https://huggingface.co/DeepNarra
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/CohereForAI/aya_collection
  - https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Licencia Apache-2.0: http://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado papers, demos ni entradas de blog asociadas en la información disponible.
