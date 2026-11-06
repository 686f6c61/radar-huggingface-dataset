# Maxilicious20/Velqora-160M-Instruct-GGUF

## Resumen

Velqora-160M-Instruct-GGUF es el repositorio de exportaciones en formato GGUF del modelo Velqora-160M-Instruct, un modelo de lenguaje causal decoder-only entrenado desde cero por el autor Maxilicious20. Se trata de un modelo pequeño, de aproximadamente 158,6 millones de parámetros según la model card original (191,4 millones contabilizados en safetensors), pensado para experimentación en investigación e inferencia local. Su relevancia es limitada: es un proyecto educativo que documenta el proceso de entrenamiento completo de un transformer tipo Llama en una única GPU de consumo (RTX 4060 de 8 GB), no un modelo de producción.

La arquitectura sigue el patrón Llama con atención de consultas agrupadas (GQA), SwiGLU, RoPE y RMSNorm, con 12 capas y 1.024 de dimensión oculta. El contexto máximo entrenado es de 2.048 tokens y el tokenizador es un BPE a nivel de byte propio de 32K, no compatible con el de Meta Llama. El entrenamiento procesó 3.215 millones de tokens.

El repositorio GGUF es, en el momento de esta ficha, un contenedor de intenciones más que de artefactos verificados: la propia model card advierte que no se han subido binarios validados y que la compatibilidad con llama.cpp, Ollama o LM Studio no está confirmada ni verificada. Cualquier evaluación de calidad debe remitirse al modelo PyTorch original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama con GQA, SwiGLU, RoPE y RMSNorm |
| Parametros totales | 158.622.720 (model card original); 191.390.720 (safetensors del repo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (máximo entrenado) |
| Tipos de cuantizacion | F16, Q8_0 y Q4_K_M sugeridos como nombres de archivo; no se confirma que existan binarios |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 en los metadatos del repo; la model card indica que no se ha confirmado licencia de los pesos |
| Formato de pesos | GGUF (objetivo); original en PyTorch (`model.pt`) con `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 12 capas, dimensión oculta de 1.024 y atención de consultas agrupadas con 16 cabezas de consulta y 4 cabezas KV. Emplea SwiGLU en las capas feed-forward, RoPE para la codificación posicional y RMSNorm. El tokenizador es un BPE a nivel de byte de 32K vocabulario, serializado de forma personalizada y no compatible con el tokenizador estándar de Meta Llama. La ventana de contexto entrenada es de 2.048 tokens.

El entrenamiento se realizó desde cero sobre 3.215 millones de tokens procesados, en una única NVIDIA RTX 4060 de 8 GB. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa. El formato de chat original usa marcadores `<|im_start|>` y `<|im_end|>` para los turnos, y las completaciones del asistente terminan en `<|eot_id|>`. La conversión a GGUF requiere preservar los nombres de tensores personalizados, el weight tying, la convención RoPE, los IDs de token del tokenizador original y la serialización de roles; la model card advierte explícitamente que `convert_hf_to_gguf.py` no funciona sin adaptación.

## Capacidades

- Generación de texto causal en inglés, con calidad propia de un modelo de 158M parámetros entrenado con 3,2B tokens.
- Conversación multi-turno mediante una plantilla de chat propia (`<|im_start|>user` / `<|im_start|>assistant`, parada en `<|eot_id|>`).
- Razonamiento básico y respuesta a preguntas simples; sin garantías de corrección en tareas complejas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de visión, audio ni modo de pensamiento explícito.
- Entrenado desde cero, lo que lo hace útil como caso de estudio reproducible de pipeline completo (tokenizador, entrenamiento, exportación).

## Casos de uso

- Investigación educativa sobre entrenamiento desde cero: sirve para estudiar el pipeline completo (tokenizador BPE propio, arquitectura Llama, exportación GGUF) en hardware de consumo, dado que el autor documenta el proceso en una RTX 4060.
- Experimentos de cuantización: comparar F16, Q8_0 y Q4_K_M sobre un modelo diminuto permite medir degradación de calidad con recursos mínimos, siempre que se generen y validen los binarios.
- Pruebas de compatibilidad de runtimes GGUF: útil para validar conversores personalizados y detectar problemas de nombres de tensores o plantillas de chat en llama.cpp u otros motores.
- Generación de texto de baja exigencia en local: prototipos de completado de texto en inglés donde el coste computacional y la latencia importan más que la calidad.
- Docencia sobre evaluación de modelos: permite ilustrar protocolos de evaluación zero-shot y la diferencia entre resultados de un modelo base y sus variantes cuantizadas.
- Base para fine-tuning experimental: al ser pequeño y de licencia permisiva en metadatos, puede servir como punto de partida para ajustes supervisados en tareas acotadas, asumiendo su baja calidad base.

## Benchmarks y rendimiento

Los únicos datos disponibles corresponden al modelo PyTorch sin cuantizar, evaluado con un protocolo zero-shot local no estándar. No deben atribuirse a ninguna variante GGUF.

| Benchmark | Resultado | Notas |
|---|---|---|
| ARC-Easy | 46,55% | Protocolo local no estándar |
| ARC-Challenge | 22,44% | Protocolo local no estándar |
| HellaSwag | 28,10% | 9.609 de 10.042 tareas (incompleto) |
| BoolQ | 58,26% | Protocolo local no estándar |
| MMLU | 23,13% | 13.957 de 14.042 tareas (incompleto) |
| VelqoraBench-400 | 0,00% | Scorer estricto de coincidencia exacta |

No se han publicado resultados de benchmarks de las variantes GGUF en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en F16 para 158M parámetros (aproximadamente 0,3 GB de pesos más overhead de contexto y runtime); menos aún en Q8_0 y Q4_K_M.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; el modelo original se entrenó en una RTX 4060 de 8 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama u otros runtimes GGUF, siempre que se valide previamente la compatibilidad con los tensores y el tokenizador personalizados.
- Latencia y throughput: no disponibles; no se han publicado mediciones de los binarios GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Velqora-160M-Instruct-GGUF | 158,6M (191,4M en safetensors) | 2.048 | Apache 2.0 en metadatos; pesos sin licencia confirmada | Repo GGUF sin binarios validados |
| SmolLM-135M-Instruct | 135M | 2.048 | Apache 2.0 | Pesos y GGUF ampliamente disponibles y validados |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Pesos y GGUF disponibles |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 | Apache 2.0 | Pesos y GGUF disponibles |

La comparación con alternativas establecidas es desfavorable en disponibilidad y verificación: los modelos citados cuentan con binarios GGUF validados y evaluaciones reproducibles, mientras que Velqora no ofrece artefactos confirmados ni compatibilidad verificada con runtimes estándar.

## Limitaciones y advertencias

- Modelo experimental de 158M parámetros: puede alucinar, calcular mal, malinterpretar instrucciones, repetir frases y fallar en el seguimiento de instrucciones.
- No apto para decisiones autónomas ni aplicaciones de alto riesgo.
- Contexto limitado a 2.048 tokens, muy inferior al de modelos actuales.
- Solo inglés; sin capacidades multilingües documentadas.
- La cuantización puede introducir errores adicionales sobre una calidad base ya baja.
- La licencia de los pesos no está confirmada según la model card, pese a que los metadatos indican Apache 2.0; verificar antes de cualquier uso comercial.
- El repositorio GGUF no contiene binarios validados en el momento de la ficha; la compatibilidad con llama.cpp, Ollama o LM Studio no está verificada.
- El conversor estándar `convert_hf_to_gguf.py` no funciona sin adaptación por los nombres de tensores y el tokenizador personalizados.
- No se ha establecido de forma exhaustiva la seguridad de entradas y salidas.
- Los benchmarks disponibles son incompletos (HellaSwag y MMLU) y usan un protocolo no estándar, por lo que no son comparables con leaderboards oficiales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Maxilicious20/Velqora-160M-Instruct-GGUF
- Modelo original PyTorch: https://huggingface.co/Maxilicious20/Velqora-160M-Instruct
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
