# IFM/Jais-3-7B-GGUF

## Resumen

Jais-3-7B es un modelo de lenguaje denso de clase 7B, decoder-only, desarrollado por IFM (Inception42) como miembro medio de la familia Jais-3. Está especializado en árabe e inglés y destaca por una ventana de contexto de 512K tokens, muy superior a la de modelos de su tamaño. Esta ficha cubre la variante GGUF publicada en `IFM/Jais-3-7B-GGUF`, pensada para su uso con `llama.cpp`.

El modelo resuelve el problema de disponer de un LLM abierto con contexto largo y buen rendimiento en árabe, un idioma tradicionalmente infrarrepresentado en los modelos occidentales. La familia Jais-3 se posiciona frente a alternativas como Allam 7B, Fanar-1-9B-Instruct o Falcon-H1-7B-Instruct en tareas bilingües árabe-inglés.

La relevancia actual del modelo radica en su combinación de licencia Apache 2.0, pesos abiertos, contexto de 512K y disponibilidad en múltiples formatos (GGUF, FP8, MLX), lo que facilita su despliegue tanto en servidores como en hardware de consumo. El recuento real de parámetros en safetensors es de 8.999.178.240 (aproximadamente 9B), aunque el autor lo comercializa como "7B".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura "K2 Horizon" segun notas de despliegue) |
| Parametros totales | 8.999.178.240 (~9B; etiquetado comercial como 7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M (GGUF); FP8; MLX 4-bit, 8-bit y bf16 |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); safetensors en el modelo base; FP8; MLX |

## Arquitectura y entrenamiento

Jais-3-7B es un transformer decoder-only de tipo denso. Las notas de despliegue del autor mencionan soporte para la arquitectura "K2 Horizon", integrada en `llama.cpp` mediante el PR ggml-org/llama.cpp#29535, lo que sugiere una variante arquitectónica propia respecto al transformer estándar. El modelo base es `inception42/Jais-3-7B` y esta variante es una conversión a GGUF para inferencia con `llama.cpp`.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal más allá de la referencia a la arquitectura K2 Horizon. El modelo soporta modo de razonamiento y tool calling, que deben parsearse iniciando `llama-server` con la opción `--jinja`.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Razonamiento multi-paso con modo de pensamiento (reasoning), parseable vía plantilla Jinja.
- Soporte de tool calling / function calling.
- Capacidad de agentes y razonamiento multi-paso.
- Ventana de contexto de 512K tokens para documentos y conversaciones extensas.
- Bilingüe árabe-inglés; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Atención al cliente en árabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 512K tokens, manteniendo el hilo de casos complejos sin truncar historial.
- Procesamiento de documentos legales o administrativos en árabe: análisis y resumen de contratos extensos que superan la ventana de modelos de 8K-32K.
- Generación de código asistida bilingüe: integración en pipelines de CI/CD mediante tool calling, con instrucciones en inglés y documentación en árabe.
- Agentes autónomos con razonamiento multi-paso: uso del modo de pensamiento y function calling para orquestar tareas que requieren varias llamadas a herramientas.
- Búsqueda aumentada (RAG) sobre corpus árabes: el contexto de 512K permite inyectar grandes volúmenes de pasajes recuperados sin recortes agresivos.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPU de gama alta para consumo o en Apple Silicon vía MLX.
- Traducción y localización árabe-inglés: el modelo está entrenado específicamente en ambos idiomas, lo que lo hace adecuado para tareas de traducción técnica y adaptación de contenido.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa con Gemma-4-E4B-it, Gemma-4-12B-it, Qwen3.5-9B, Falcon-H1-7B-Instruct, Allam 7B y Fanar-1-9B-Instruct. Sin embargo, los datos numéricos de esa tabla no están disponibles en la información proporcionada (solo se incluyen las filas de recuento de parámetros). Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en Q4_K_M, 6-7 GB en Q5_K_M, 9-10 GB en Q8_0 y unos 18 GB en BF16 (estimación basada en el recuento de parámetros).
- GPU recomendadas: A100, H100 o L40S para BF16 y contextos largos; RTX 4090 o RTX 3090 para cuantizaciones Q4/Q5/Q8.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y superiores con cuantizaciones Q4_K_M o Q5_K_M; también en Apple Silicon vía MLX 4-bit/8-bit.
- Opciones de despliegue: `llama.cpp` (requiere build reciente con soporte K2 Horizon, idealmente compilado desde `master`), `llama-server` con `--jinja` para parsear razonamiento y tool calls; MLX para Apple Silicon; FP8 para GPUs Hopper/Ada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Jais-3-7B | ~9B (7B nominal) | 512K | Apache 2.0 | ar, en | GGUF, FP8, MLX, safetensors |
| Gemma-4-12B-it | 12B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-9B | 9B | no disponible | no disponible | no disponible | no disponible |
| Falcon-H1-7B-Instruct | 7B | no disponible | no disponible | no disponible | no disponible |
| Allam 7B | 7B | no disponible | no disponible | ar, en | no disponible |
| Fanar-1-9B-Instruct | 9B | no disponible | no disponible | ar, en | no disponible |

Los datos de contexto, licencia y disponibilidad de los modelos comparables no están incluidos en la información proporcionada; la comparativa se limita a los parámetros y a la referencia de la tabla de benchmarks del autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado principalmente en árabe e inglés, puede presentar sesgos culturales y lingüísticos de esos corpus.
- Riesgo de alucinación: inherente a los LLM; no se documentan evaluaciones específicas de factualidad.
- Limitaciones de idioma: solo se declaran árabe e inglés; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base `inception42/Jais-3-7B`.
- Requiere una build reciente de `llama.cpp` con soporte K2 Horizon (PR #29535); versiones antiguas no cargarán el modelo.
- Es necesario iniciar `llama-server` con `--jinja` para que se parseen correctamente el razonamiento y las tool calls.
- El etiquetado "7B" no coincide con el recuento real de parámetros (~9B), lo que puede afectar a las estimaciones de VRAM y a la planificación de recursos.
- No se documentan capacidades multimodales ni de audio.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/IFM/Jais-3-7B-GGUF
- Modelo base: https://huggingface.co/inception42/Jais-3-7B
- Colección Jais-3: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Variante FP8: https://huggingface.co/IFM/Jais-3-7B-FP8
- Variante MLX 4-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/IFM/Jais-3-7B-MLX-8bit
- Variante MLX bf16: https://huggingface.co/IFM/Jais-3-7B-MLX-bf16
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29535
- Paper (arXiv): arxiv:2611.10224
