# esatapedico/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4

## Resumen

`DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4` es un checkpoint cuantizado en formato NVFP4 del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicado por el usuario `esatapedico`. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos: el autor aplica una receta de cuantización W4A16 con `compressed-tensors` (formato `nvfp4-pack-quantized`) sobre un VLM híbrido de 9.409.813.744 parámetros. El modelo base es a su vez un destilado de DeepSeek-V4-Pro sobre Qwen3.5-9B, con ajuste de decensura ("Heretic") firmado por xtools-at, y la arquitectura subyacente es la de Qwen3.5 híbrida (24 bloques de atención lineal + 8 bloques de atención completa) con torre de visión.

La relevancia de esta ficha es doble. Por un lado, ilustra un patrón de publicación habitual en el ecosistema open source: conversiones de cuantización de terceros sobre modelos derivados, con verificación de integridad de tensores y publicación de recetas reproducibles. Por otro, el checkpoint está orientado explícitamente a hardware Blackwell (NVFP4), con un ecosistema de GGUF hermano para llama.cpp. Es importante subrayar que el autor declara no haber entrenado nada y que la carga en vLLM no ha sido probada por él; la verificación se limita a la identidad byte a byte de los tensores no cuantizados, la ruta GGUF y benchmarks sobre el modelo en formato GGUF.

El modelo soporta entrada imagen-texto (pipeline `image-text-to-text`), aunque la model card solo documenta el idioma inglés. La licencia es Apache-2.0 en toda la cadena de derivación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida (`Qwen3_5ForConditionalGeneration`): 32 bloques, 24 de atención lineal + 8 de atención completa, con torre de visión y cabeza MTP |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 W4A16 (grupo 16, escalas FP8 E4M3 por tensor, weight-only, datafree); GGUF en siete niveles en repo hermano |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (dos ficheros: `model.safetensors` y `model_mtp.safetensors`) + `compressed-tensors` `nvfp4-pack-quantized`; GGUF en repo hermano |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Qwen3.5: 32 bloques en total, de los cuales 24 usan atención lineal (con ruta SSM explícita: `attn_gate`, `attn_qkv`, `ssm_alpha`, `ssm_beta`, `ssm_out`, `ssm_conv`) y 8 usan atención completa con proyecciones q/k/v/o clásicas. Incluye además una torre de visión (333 tensores) y una cabeza MTP (multi-token prediction, 15 tensores) que el autor preserva intacta en la conversión. El modelo es, por tanto, un VLM con backbone de texto híbrido.

No se ha entrenado ni afinado nada en esta ficha: la model card lo declara explícitamente ("nothing here was trained or fine-tuned"). La contribución técnica del autor es la cuantización NVFP4: se cuantizan 96 proyecciones MLP (gate/up/down en los 24 bloques de atención lineal) y 32 proyecciones q/k/v/o de atención completa (8 bloques), sumando 128 tensores NVFP4 empaquetados. Todo lo demás —ruta SSM, normas, embeddings, `lm_head`, torre de visión y cabeza MTP— permanece en BF16 y el autor afirma que es byte-idéntico al origen. La receta es datafree (sin corpus de calibración), con patrones clásicos de `llm-compressor` y lista de exclusiones. Los 15 tensores MTP se restauran desde el fichero MTP original con verificación bit a bit, debido a un comportamiento conocido de `llm-compressor` que los descarta.

## Capacidades

- Generación de texto conversacional en inglés.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`, torre de visión preservada en BF16).
- Razonamiento multi-paso y decodificación con cabeza MTP (multi-token prediction) preservada.
- Soporte de tool calling / function calling según los benchmarks del autor (ToolCap 100% con cero herramientas fabricadas, medido sobre la familia GGUF).
- Capacidades de seguimiento de instrucciones (IFEval 30/30 parseado en la familia GGUF).
- Razonamiento matemático (GSM8K 0.875–0.905, n=200, en la familia GGUF).
- Conocimiento general (MMLU 63,9–68,3%, n=3000, en la familia GGUF).
- Ajuste de decensura ("Heretic") que relaja las negativas del modelo base; ver limitaciones.

## Casos de uso

- Despliegue en hardware Blackwell con VRAM limitada: el formato NVFP4 W4A16 reduce el peso de los tensores MLP y de atención completa, lo que permite cargar un VLM de 9B en GPUs consumer de 16 GB (el autor cita dos tarjetas Blackwell de 16 GB para sus pruebas). Adecuado cuando se quiere un VLM con contexto multimodal sin renunciar a precisión BF16 en la torre de visión.
- Inferencia local vía llama.cpp: el repo hermano GGUF ofrece siete niveles de cuantización listos para `llama.cpp`, lo que permite ejecutar el modelo en CPU/GPU mixtas y en entornos sin soporte de `compressed-tensors`.
- Asistente conversacional multimodal: al conservar la torre de visión y la plantilla de chat, puede gestionar diálogos multi-turno con imágenes adjuntas; útil para prototipos de asistentes que describen capturas, diagramas o documentos escaneados.
- Generación de código con tool calling: los benchmarks del autor reportan ToolCap 100% sin herramientas fabricadas, lo que lo hace apto para pipelines de agentes que invocan funciones externas (APIs, ejecución de comandos) en entornos controlados.
- Evaluación de cuantizaciones: el checkpoint y su receta `recipe.yaml` sirven como referencia reproducible para medir el impacto de NVFP4 frente a BF16 en un VLM híbrido, con guardia de identidad byte a byte de los tensores no cuantizados.
- Investigación sobre decensura y alineación: al ser un tune "Heretic" sobre un destilado de DeepSeek-V4-Pro, es útil para estudiar cómo se degradan o relajan los rechazos del modelo base tras un ajuste de decensura, siempre en entornos de investigación con las salvaguardas adecuadas.
- Fine-tuning posterior (con precaución): al estar en `compressed-tensors`, se puede partir de él para experimentos de cuantización-aware training, aunque el autor no documenta esta ruta y la carga en vLLM no está probada.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a la familia GGUF construida a partir de este checkpoint, no al checkpoint NVFP4 cargado en vLLM. Se reproducen tal cual, sin inventar cifras adicionales:

| Benchmark | Resultado (familia GGUF) | Notas |
|---|---|---|
| Perplejidad (PPL) | 4,42–4,53 | Rango entre niveles de cuantización |
| GSM8K | 0,875–0,905 | n=200 |
| MMLU | 63,9–68,3% | n=3000 |
| IFEval | 30/30 parseado | — |
| ToolCap | 100% | Cero herramientas fabricadas |

No se han publicado resultados de benchmarks del checkpoint NVFP4 cargado en vLLM en la información disponible. El autor declara explícitamente que no ha probado una carga en vLLM.

## Requisitos de hardware

- VRAM estimada: el repo pesa 11,7 GB en total (dos safetensors de 11.198.705.136 y 486.582.848 bytes). El autor reporta ejecución en dos tarjetas Blackwell de 16 GB para la familia GGUF; para el checkpoint NVFP4 se requiere hardware compatible con NVFP4 (Blackwell) y VRAM suficiente para los tensores BF16 no cuantizados (torre de visión, SSM, embeddings, `lm_head`, MTP).
- GPU recomendadas: Blackwell (serie RTX 50, B100/B200) por el soporte nativo de NVFP4. El autor cita "two 16 GB Blackwell cards".
- ¿Cabe en GPU consumer? Sí, según el autor, en Blackwell de 16 GB (dos tarjetas en su configuración de pruebas). Para GPUs no Blackwell, la ruta recomendada es el repo GGUF hermano.
- Opciones de despliegue: llama.cpp (vía repo GGUF hermano, con `convert_hf_to_gguf.py --outtype auto`, NVFP4 nativo como GGML type 40); vLLM / motores con `compressed-tensors` (carga no probada por el autor); transformers (librería declarada).
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a la model card de la familia GGUF para mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4) | 9,41B | no disponible | NVFP4 W4A16 + BF16 parcial | Apache-2.0 | HF, 0 descargas |
| `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` (base) | ~9,4B | no disponible | BF16 | Apache-2.0 | HF (modelo base) |
| Familia GGUF hermano (`...-NVFP4-MTP-GGUF`) | ~9,4B | no disponible | 7 niveles GGUF | Apache-2.0 | HF (repo hermano) |
| Qwen3.5-9B (origen arquitectónico) | ~9B | no disponible | múltiples | no disponible en esta información | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo decensurado ("UNCENSORED-heretic"): el ajuste relaja los rechazos del modelo base. No es apto para producción orientada a usuarios finales sin capas de moderación adicionales.
- Riesgo de alucinación: inherente a los modelos de 9B; los benchmarks del autor (MMLU 63,9–68,3%) indican un conocimiento general moderado, no de frontera.
- Idiomas: solo se declara inglés (`en`); no hay evidencia de soporte multilingüe.
- Longitud de contexto: no documentada en la información disponible; no asumir ventanas largas sin verificación.
- Carga en vLLM no probada: el autor declara explícitamente que no ha ejercitado una carga en vLLM; tratar como no validada hasta probarla.
- Dependencia de hardware: NVFP4 requiere soporte de Blackwell; en otras GPUs la ruta práctica es el repo GGUF.
- Naturaleza derivada: es una cuantización, no un modelo entrenado; los méritos de calidad corresponden al base (Jackrong / xtools-at) y los posibles defectos de cuantización al conversor.
- Model card generada por IA: el propio autor advierte que la card fue redactada por un asistente y puede contener errores; verificar tamaños, configuraciones y comandos contra los ficheros.
- Licencia Apache-2.0: permite uso comercial, pero las obligaciones de atribución de la cadena de derivación deben respetarse.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/esatapedico/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Repo GGUF hermano: https://huggingface.co/esatapedico/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-MTP-GGUF
- Sitio del autor: https://www.esatapedico.com
- llm-compressor (Red Hat AI / vLLM): no disponible enlace directo en la información proporcionada
- Paper de DeepSeek-V4-Pro: no disponible en la información proporcionada
- Repo de Qwen3.5: no disponible en la información proporcionada
