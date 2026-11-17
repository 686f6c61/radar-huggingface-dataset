# Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-3bit

## Resumen

BuildEng V9 MLX 3-bit es una adaptación de dominio del modelo Ornith 1.5 9B, un fine-tune de Qwen3.5-9B orientado a ingeniería de edificación y estructural. Lo desarrolla Irfan Uruchi y está pensado para tareas de evaluación estructural, análisis de caminos de carga, cambios constructivos, patologías en hormigón y acero, obras temporales y planificación de investigaciones. El modelo se distribuye cuantizado en formato MLX affine de 3 bits con tamaño de grupo 64, lo que lo hace ejecutable en equipos Apple Silicon con memoria unificada moderada.

La relevancia de esta ficha es doble: por un lado, ilustra el patrón de fine-tunes verticales sobre modelos base abiertos para nichos técnicos; por otro, muestra una cadena de cuantización agresiva (8-bit a 3-bit) que prioriza el despliegue local sobre la fidelidad numérica. El modelo base Ornith 1.5 9B tiene licencia MIT y la arquitectura subyacente Qwen3.5-9B es Apache-2.0, lo que permite uso comercial con atribución.

No se han publicado resultados de benchmarks en la información disponible, y la propia model card advierte de que este formato no ha pasado una validación de seguridad independiente amplia. Es, por tanto, una herramienta para discusión técnica y planificación de verificación, no para aprobación de proyectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`qwen3_5`), transformer denso |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 3-bit, group size 64 (derivado de MLX 8-bit fused) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), repositorio de 3,9 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 (`qwen3_5`), un transformer denso de aproximadamente 9B parámetros. Sobre el checkpoint Ornith 1.5 9B (a su vez fine-tune de Qwen3.5-9B) se aplicó un ajuste fino de dominio para ingeniería de edificación. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información no está disponible.

La cadena de conversión es explícita: se partió de un BuildEng V9 MLX 8-bit fusionado, se de-cuantizó y se re-cuantizó a 3-bit affine MLX con group size 64. La model card advierte de que no se recupera la precisión BF16 original, por lo que este formato acumula pérdida respecto al fine-tune canónico en 4-bit. El fine-tune se realizó con MLX-LM en un Apple M6 Mac mini. No se documentan innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés sobre temas de ingeniería de edificación y estructural.
- Razonamiento técnico sobre evaluación estructural, caminos de carga y cambios constructivos.
- Discusión de patologías en hormigón y acero (fisuración, corrosión, distress).
- Planificación de obras temporales y de flujos de investigación técnica.
- Soporte de plantilla de chat con conmutador `enable_thinking` (modo de razonamiento desactivable vía `--chat-template-config`).
- Ejecución local en Apple Silicon mediante `mlx-lm`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Revisión preliminar de patologías estructurales: el modelo puede generar hipótesis sobre causas de fisuración o corrosión en hormigón y acero, sirviendo como borrador para que un ingeniero cualificado verifique contra evidencia de obra.
- Planificación de inspecciones: ayuda a estructurar listas de comprobación y secuencias de investigación para evaluar un elemento estructural antes de intervenir.
- Análisis de caminos de carga en discusión: permite razonar en lenguaje natural sobre cómo se transmite la carga y qué elementos son críticos, como apoyo a la revisión humana.
- Evaluación de cambios constructivos: apoya la discusión sobre el impacto de retirar o modificar un arnés estructural, tal como ilustra el ejemplo de la model card ("Why must a structural brace be assessed before removal?").
- Formación y documentación técnica: genera explicaciones divulgativas sobre obras temporales y prácticas de verificación para equipos junior.
- Prototipado local en portátiles Apple Silicon: al ser 3-bit MLX, permite experimentar con un asistente de dominio sin infraestructura GPU dedicada.
- Redacción de informes preliminares: borradores de memorandos técnicos que luego se contrastan con cálculo y normativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica aportada corresponde al release original en 4-bit MLX (no a este formato 3-bit): 29,46 tokens generados/s y 226,34 tokens de prompt/s en una ejecución local (33 tokens de entrada, 96 de salida, temperatura 0). La model card indica expresamente que esas cifras no son benchmarks de este formato.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 3,9 GB, por lo que la inferencia en 3-bit requiere del orden de 4-5 GB de memoria unificada, más overhead de contexto y runtime.
- Hardware objetivo: sistemas Apple Silicon con MLX-LM instalado (la model card cita un Apple M6 Mac mini para el fine-tune).
- GPU dedicadas (A100, H100, RTX 4090): no aplica de forma nativa; el formato es MLX y está pensado para Apple Silicon. Para CUDA habría que recurrir a otros formatos del mismo fine-tune (por ejemplo, el 4-bit MLX canónico o conversiones GGUF no documentadas aquí).
- Cabe en equipos consumer Apple Silicon con memoria unificada suficiente (órdenes de 8 GB en adelante, según contexto).
- Despliegue: `mlx-lm` (comando `python -m mlx_lm generate`). No se documentan opciones vLLM, llama.cpp, Ollama o TGI para este formato.
- Latencia y throughput: no disponibles para el formato 3-bit; las cifras del 4-bit no son trasladables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BuildEng V9 MLX 3-bit (este) | ≈8,95B | no disponible | MLX 3-bit affine | MIT | Fine-tune de dominio, solo inglés, Apple Silicon |
| BuildEng V9 MLX 4-bit (canónico) | ≈8,95B | no disponible | MLX 4-bit | MIT | Release canónico del mismo fine-tune, mayor fidelidad |
| Ornith 1.5 9B (base) | ≈9B | no disponible | no disponible | MIT | Modelo base sin especialización de dominio |
| Qwen3.5-9B (upstream) | ≈9B | no disponible | no disponible | Apache-2.0 | Modelo generalista subyacente |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Cuantización agresiva: el paso de 8-bit a 3-bit con group size 64 introduce pérdida de precisión respecto al fine-tune canónico en 4-bit y, con mayor motivo, respecto al BF16 original, que no se recupera.
- Dominio estrecho: especializado en ingeniería de edificación y estructural; su rendimiento fuera de ese ámbito no está documentado.
- Idioma: solo inglés declarado; no hay soporte multilingüe documentado.
- Riesgo de alucinación en cálculos, referencias normativas y advertencias estructurales críticas; la model card exige verificar contra evidencia de obra y revisión de ingeniero cualificado.
- No apto para aprobación de proyectos: está diseñado para discusión y planificación de verificación, no para validar diseños.
- Sin validación de seguridad independiente amplia en este formato.
- Licencia MIT en el fine-tune, con la capa Apache-2.0 de Qwen3.5-9B subyacente; conviene conservar las atribuciones correspondientes en uso comercial.
- Ecosistema limitado a Apple Silicon vía MLX; no hay artefactos documentados para CUDA, llama.cpp u otros runtimes en este repositorio.
- Contexto máximo no documentado, lo que dificulta planificar cargas de trabajo con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-3bit
- Fine-tune canónico 4-bit: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-4bit
- Modelo base Ornith 1.5 9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Upstream Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del fine-tune (MIT): https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-3bit/blob/main/LICENSE
- Licencia Apache-2.0 de Qwen: https://huggingface.co/Irfanuruchi/Ornith-1.5-9B-BuildEng-V9-MLX-3bit/blob/main/LICENSE-QWEN-APACHE-2.0
