# lucas-wa/gemma-3-1b-ptbr-delta-cpt-proof

## Resumen

`lucas-wa/gemma-3-1b-ptbr-delta-cpt-proof` es un checkpoint de investigación derivado de `google/gemma-3-1b-pt`, publicado por el autor lucas-wa en el marco del proyecto GAIA-edu (CEIA/UFG). No es un modelo pensado para producción ni un sustituto mejorado del instruct oficial: es el artefacto de reproducibilidad del método **delta-CPT**, una técnica de continued pretraining en portugués de Brasil que mantiene dos copias full-rank entrenables de la misma arquitectura (`θ_b`, que parte del modelo base, y `θ_d`, que representa el residuo de instrucción `it − pt`) y las co-adapta durante el CPT, materializando el modelo desplegable como `M = θ_b + θ_d`.

La arquitectura subyacente es Gemma 3 de 1B parámetros (999.885.952 según safetensors), un transformer denso con licencia Gemma. El checkpoint corresponde al brazo B del experimento (enrutamiento asimétrico del gradiente con straddle α=0.5 y anclaje KL con λ=4, paso 300), exportado en bf16.

Su relevancia es metodológica más que de rendimiento: según la propia model card, queda por debajo de `google/gemma-3-1b-it` en todos los ejes de evaluación de comportamiento. Se publica para documentar de forma honesta el efecto medible del anclaje KL y para permitir la reproducción del método, no como un modelo de instrucción de uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 3, `gemma3_text`) |
| Parámetros totales | 999.885.952 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (checkpoint exportado en bf16) |
| Idiomas soportados | Portugués (`pt`) |
| Licencia | Gemma (sujeta a los Términos de Uso de Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-pt`, un transformer denso de aproximadamente 1B parámetros. Sobre esa base se aplica el método delta-CPT: se mantienen dos copias full-rank entrenables de la misma arquitectura, `θ_b` (inicializada en el modelo base preentrenado y que recibe la loss de CPT en portugués de Brasil) y `θ_d` (inicializada en el residuo `it − pt`, que codifica la instrucción). El modelo desplegable se obtiene como suma diferenciable `M = θ_b + θ_d` mediante `torch.func.functional_call`, sobre la que se ejecuta una etapa de SFT con loss solo en la completion.

El checkpoint publicado corresponde al brazo B: enrutamiento asimétrico del gradiente (straddle α=0.5) más un anclaje KL `KL(it ‖ M)` con λ=4, tras 300 pasos de entrenamiento. En el paso 0, `M` es exactamente igual a `gemma-3-1b-it` (verificado con 0 discrepancias en 108M logits). La exportación a formato Hugging Face se realiza con `eval/export_hf_checkpoint.py` en bf16. No se especifican en la información disponible el volumen de tokens de CPT, la composición del dataset ni detalles adicionales del corpus.

## Capacidades

- Generación de texto conversacional en portugués, heredada de la familia Gemma 3.
- Capacidad de instrucción residual: el modelo incorpora el delta de instrucción de `gemma-3-1b-it` mediante la suma `θ_b + θ_d`, aunque con calidad degradada respecto al instruct original.
- Seguimiento de instrucciones con formato (evaluado en ifeval-pt, con resultado inferior al baseline).
- Generación de JSON y adherencia a esquemas en escenarios de micro-agente (evaluado, con resultados notablemente por debajo del instruct).
- Selección de herramientas en contexto de tool calling (evaluado, con resultados inferiores al baseline).
- Capacidades multilingües: limitadas al portugués según la metadata del modelo; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción del método delta-CPT: sirve como artefacto de referencia para replicar el entrenamiento con anclaje KL y el enrutamiento asimétrico del gradiente en modelos de 1B, comparando el checkpoint resultante con el instruct oficial.
- Estudio del efecto del anclaje KL: permite analizar cómo λ=4 recupera comportamiento del instruct (por ejemplo, `system_prompt` pasa de 0.375 a 0.813 frente al brazo sin ancla) sin cerrar la brecha en el resto de ejes.
- Investigación sobre continued pretraining en portugués de Brasil: útil para medir la interacción entre CPT monolingüe y preservación de capacidades de instrucción en modelos pequeños.
- Docencia y divulgación técnica: ejemplo documentado y honesto de un experimento con resultados negativos parciales, adecuado para explicar task arithmetic, chat vectors y sus alternativas.
- Base para ablaciones en modelos mayores: el propio autor indica que el resultado en 1B motivó trasladar el método a modelos más grandes con ancla en fp32, por lo que este checkpoint sirve como punto de partida metodológico.
- Validación de pipelines de exportación: el script `eval/export_hf_checkpoint.py` y el checkpoint materializado permiten verificar flujos de suma de pesos y exportación a safetensors/bf16.

## Benchmarks y rendimiento

Evaluación de comportamiento publicada en la model card (mayor es mejor):

| Métrica | delta-CPT B λ=4 | `gemma-3-1b-it` (baseline) |
|---|---|---|
| ifeval | 0.539 | 0.636 |
| micro_agent · json_only | 0.529 | 1.000 |
| micro_agent · json_valid | 0.313 | 1.000 |
| micro_agent · overall | 0.438 | 0.750 |
| micro_agent · schema | 0.353 | 0.882 |
| micro_agent · system_prompt | 0.813 | 0.875 |
| micro_agent · tool_selection | 0.375 | 0.563 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16/fp16 para los ~1B parámetros, más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 1 GB y en 4 bits unos 0,6-0,8 GB (estimación a partir del recuento de parámetros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM es suficiente para bf16; RTX 3060/4060 en adelante. Para despliegue con concurrencia, A10G, L4 o A100.
- Cabe holgadamente en GPU consumer (RTX 3090, RTX 4090, RTX 4060 Ti, entre otras).
- Opciones de despliegue: `transformers` (soporte nativo, `gemma3_text`), text-generation-inference (el modelo declara `text-generation-inference` y `endpoints_compatible` en sus tags). No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Rendimiento relativo |
|---|---|---|---|---|---|
| `lucas-wa/gemma-3-1b-ptbr-delta-cpt-proof` | 999.885.952 | No disponible | Gemma | CPT en pt-BR con delta-CPT y ancla KL | Inferior al instruct en todos los ejes evaluados |
| `google/gemma-3-1b-it` | ~1B | No disponible | Gemma | Instruct oficial de Gemma 3 | Baseline de referencia; supera al delta-CPT en ifeval y micro-agente |
| `google/gemma-3-1b-pt` | ~1B | No disponible | Gemma | Preentrenado base de Gemma 3 | Punto de partida de `θ_b`; sin ajuste de instrucción |

No se dispone de datos de benchmarks comparables frente a otras alternativas de 1B (Llama 3.2 1B, Qwen 2.5 1.5B) en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al instruct oficial en todos los ejes evaluados: ifeval, generación de JSON, validez de esquema, selección de herramientas y puntuación global de micro-agente.
- No es un sustituto de `google/gemma-3-1b-it` para uso general de instrucción en 1B; el propio autor lo desaconseja explícitamente.
- Escala de prueba: 1B parámetros; los resultados no son extrapolables sin validación a modelos mayores.
- Evaluación de micro-agente con muestra pequeña (~16 prompts), lo que limita la significación estadística de las diferencias observadas.
- Herencia de sesgos y limitaciones de la familia Gemma 3.
- Idioma limitado al portugués según la metadata; no se declaran capacidades multilingües.
- Licencia Gemma: el uso comercial está sujeto a los Términos de Uso de Gemma, con las restricciones de uso aceptable que estos imponen.
- Riesgo de alucinación: no documentado específicamente, pero esperable en un modelo de 1B con CPT monolingüe y ajuste de instrucción degradado.
- Artefacto experimental de investigación: no apto para producción sin validación adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lucas-wa/gemma-3-1b-ptbr-delta-cpt-proof)
- [Modelo base: google/gemma-3-1b-pt](https://huggingface.co/google/gemma-3-1b-pt)
- [Modelo de instrucción de referencia: google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- [Términos de Uso de Gemma](https://ai.google.dev/gemma/terms)
