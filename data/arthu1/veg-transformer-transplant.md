# arthu1/VEG-Transformer-Transplant

## Resumen

VEG Transformer Transplant es un artefacto experimental publicado por el usuario arthu1 en HuggingFace. No es un modelo entrenado de forma convencional, sino el resultado de una "transplante estructural": se han mapeado los tensores de un modelo denominado VEG (con mecanismos propios como enrutamiento por coherencia de fase, puertas sigmoideas elementales, normalización causal `1/sqrt(t+1)` y campos recurrentes selectivos) a una arquitectura `LlamaForCausalLM` estándar. El propio autor advierte que este artefacto no equivale al checkpoint VEG original y que debe usarse como línea base de compatibilidad y referencia de conversión, no como una conversión que preserve la calidad.

El modelo tiene 84.042.816 parámetros, 10 capas, hidden size de 832, 13 cabezas de atención de dimensión 64, contexto de 512 tokens y un vocabulario byte-level de 256 entradas. Está guardado en FP32 con safetensors y ocupa 0,3 GB en el repositorio. Su relevancia es fundamentalmente documental y de investigación: muestra cómo se puede aproximar una arquitectura no estándar mediante un decoder-only Transformer convencional, y sirve para estudiar qué comportamientos se pierden en ese mapeo.

Por su tamaño reducido, su naturaleza experimental y la advertencia explícita de degradación de calidad, no está pensado para producción ni para tareas generativas serias. Es útil para quienes investigan arquitecturas alternativas, conversión de pesos entre arquitecturas y análisis de qué componentes estructurales son irremplazables en un diseño de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (decoder-only Transformer) |
| Parametros totales | 84.042.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (tokenizer byte-level, sin lista de idiomas declarada) |
| Licencia | other |
| Formato de pesos | safetensors |

Datos adicionales de arquitectura: hidden size 832, 10 capas, 13 cabezas de atención, dimensión de cabeza 64, intermediate size 2240, vocabulario de 256 bytes, precisión FP32.

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only estándar de la familia Llama, generado mediante un mapeo de tensores desde un modelo VEG original. El mapeo documentado incluye: `emb` a `model.embed_tokens.weight`; `Wq`/`Wk` duplicados en cabezas q/k de 64 dimensiones; `Wv * c` a `self_attn.v_proj.weight`; `diag(gs) @ Wo` a `self_attn.o_proj.weight`; `W1`/`W3`/`W2` a las proyecciones SwiGLU; `g1`/`g2`/`gf` a las ganancias de RMSNorm; y `Wout` a `lm_head.weight`.

El autor indica explícitamente que un Transformer estándar no puede expresar directamente el enrutamiento por coherencia de fase de VEG, la puerta de ruta sigmoidea elemental, la normalización causal `1/sqrt(t+1)` ni el campo recurrente selectivo. Por tanto, esos comportamientos se han eliminado o aproximado, y el detalle figura en `conversion_report.json`. No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO; el artefacto es una conversión de pesos, no un modelo entrenado desde cero con un pipeline documentado.

## Capacidades

- Generación de texto autoregresiva básica mediante `model.generate`, con tokenizer byte-level.
- Codificación y decodificación a nivel de byte, sin tokenizador subword y sin tokens BOS/EOS.
- Compatibilidad con la librería `transformers` y con `text-generation-inference` según los tags del repositorio.
- Servir como referencia de conversión entre una arquitectura VEG y un decoder-only Transformer.
- Servir como línea base de compatibilidad para comparar comportamientos perdidos en el transplante.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre conversión de arquitecturas: el modelo permite estudiar cómo se mapean tensores de una arquitectura no estándar a Llama y qué componentes requieren aproximación, usando `conversion_report.json` como referencia.
- Análisis de degradación estructural: comparar las salidas de este artefacto con las del checkpoint VEG original para cuantificar el impacto de eliminar el enrutamiento por coherencia de fase y el campo recurrente selectivo.
- Docencia y divulgación: ejemplo práctico y de pequeño tamaño (0,3 GB) para explicar mapeos de pesos, proyecciones SwiGLU y RMSNorm en un Transformer decoder-only.
- Pruebas de integración de pipelines: validar flujos de carga con `transformers`, `text-generation-inference` y endpoints compatibles usando un modelo ligero que cabe en cualquier GPU consumer.
- Experimentos de tokenización byte-level: estudiar generación sin BOS/EOS y con criterios de parada personalizados, útil para investigar tokenizadores alternativos.
- Benchmark de infraestructura: medir latencia y throughput de un modelo de 84 M de parámetros en FP32 como referencia base antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,34 GB solo para pesos (84 M de parámetros × 4 bytes), más overhead de activaciones y KV cache; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en todas las GPU consumer con al menos 2 GB de VRAM; también es viable en CPU.
- Opciones de despliegue: `transformers` (documentado por el autor), `text-generation-inference` (tag del repositorio) y endpoints compatibles; no se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles. El contexto máximo de 512 tokens y el tamaño reducido sugieren latencias muy bajas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VEG Transformer Transplant | 84.042.816 | 512 | other | HuggingFace (arthu1/VEG-Transformer-Transplant) | Transplante experimental, calidad degradada declarada por el autor |
| TinyLlama-1.1B | ~1.100 M | 2048 | Apache 2.0 | HuggingFace | Modelo entrenado, no un transplante; mucho mayor |
| GPT-2 small | 124 M | 1024 | MIT | HuggingFace | Referencia decoder-only clásica, entrenada |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | HuggingFace | Modelo pequeño entrenado para generación |

La comparación es orientativa: este artefacto no es un modelo entrenado y el propio autor advierte de calidad degradada, por lo que no es directamente comparable en rendimiento con modelos entrenados de tamaño similar. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El autor declara explícitamente que este artefacto no equivale al checkpoint VEG y que se debe esperar calidad degradada respecto al modelo fuente.
- Se pierden o aproximan mecanismos clave de VEG: enrutamiento por coherencia de fase, puerta de ruta sigmoidea elemental, normalización causal `1/sqrt(t+1)` y campo recurrente selectivo.
- Contexto limitado a 512 tokens, insuficiente para la mayoría de aplicaciones de producción con documentos largos.
- Tokenizer byte-level sin tokens BOS/EOS: requiere `max_new_tokens` explícito o un criterio de parada personalizado; de lo contrario la generación puede no detenerse correctamente.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de alucinación; al ser un transplante, no se puede asumir un comportamiento alineado.
- Licencia "other": no se especifican términos de uso comercial; es necesario consultar el repositorio antes de cualquier uso en producción.
- Sin lista de idiomas declarada; el vocabulario byte-level no garantiza calidad multilingüe.
- Modelo experimental con 0 likes y 111 descargas en el momento de la consulta; no hay evidencia de validación por la comunidad.
- No apto para producción: su valor es documental y de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/arthu1/VEG-Transformer-Transplant
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
