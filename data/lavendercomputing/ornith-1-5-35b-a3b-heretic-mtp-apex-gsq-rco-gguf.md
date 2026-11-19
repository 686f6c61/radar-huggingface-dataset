# lavendercomputing/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GSQ-RCO-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por ornith-ai, con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activados por token. Está construido sobre Qwen3.5/Gemma4 mediante preentrenamiento continuado y auto-mejora por refuerzo, y se distribuye con licencia Apache-2.0. Su rasgo distintivo es que es un modelo de razonamiento: los turnos del asistente se abren con un bloque `<think>...</think>` de cadena de pensamiento y emite bloques `<tool_call>` para llamada a funciones.

La ficha que nos ocupa no es el modelo original, sino una compilación comunitaria en formato GGUF para llama.cpp. El autor, lavendercomputing, parte de un artefacto ya "abliterado" (es decir, con el comportamiento de rechazo eliminado sin entrenamiento, mediante la herramienta Heretic) y aplica una cuantización mixta por tensor de estilo GSQ-RCO. El resultado son cuatro builds de 2 y 3 bits, más una cabeza MTP de borrador para decodificación especulativa y un proyector de visión en BF16.

Es relevante ahora porque demuestra una cadena de herramientas comunitaria completa —abliteración automática, cuantización de precisión mixta y decodificación especulativa con MTP— sobre un MoE de 35B con contexto de 262.144 tokens, todo ejecutable en llama.cpp. Conviene advertir que se trata de una cuantización de segunda generación: parte de un maestro ya cuantizado a ~5,29 bpw, no del BF16 del proveedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con bloque MTP embebido; base Qwen3.5/Gemma4 |
| Parametros totales | ~35B (446.571.248 según safetensors del repo; discrepancia con la cifra nominal del modelo) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF: IQ2_XXS (2,33 bpw), IQ2_S (2,50 bpw), IQ3_XXS (3,01 bpw), IQ3_S (3,50 bpw); MTP draft Q6_K (6,58 bpw); proyector de visión BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos con enrutamiento por token, donde los expertos enrutados concentran el 93 % de los parámetros. Incorpora un bloque MTP (multi-token prediction) embebido en `blk.40`, que puede usarse como cabeza de borrador para decodificación especulativa. El contexto alcanza 262.144 tokens. Según la model card, se construyó sobre Qwen3.5/Gemma4 mediante preentrenamiento continuado y auto-mejora por refuerzo; no se detallan el número de tokens de entrenamiento ni la composición del dataset.

Sobre el modelo base, la cadena comunitaria aplica abliteración con Heretic 1.4.0 (Trial 62), una modificación sin entrenamiento que estima la "dirección de rechazo" en el espacio de activaciones y la proyecta fuera de determinadas matrices de pesos, validando contra una batería de pruebas de comportamiento. Posteriormente se cuantiza con un esquema mixto por tensor de estilo GSQ-RCO: los expertos enrutados absorben la compresión con una escala ponderada por bordes (primer y último bloque en el peldaño más alto), las normas y sesgos de 1-D se mantienen en fp32, el proyector de visión permanece en BF16, y en los builds de 3 bits la atención va en Q6_K (K/V en Q8_0), embeddings y cabeza en Q8_0, expertos compartidos en Q8_0 y el bloque MTP completo en Q8_0. El autor aclara que no son clones bit a bit de GSQ/RCO, sino equivalentes, porque los motores originales solo emiten `compressed-tensors` de HF y requieren hardware sm_90+.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito mediante bloques `<think>...</think>`.
- Llamada a funciones y herramientas mediante bloques `<tool_call>`.
- Entrada de imagen y texto (pipeline `image-text-to-text`), con proyector de visión en BF16 (`mmproj`).
- Razonamiento multi-paso y flujos de agente, apoyados en la cadena de pensamiento y el tool calling.
- Decodificación especulativa mediante el bloque MTP embebido o la cabeza de borrador Q6_K independiente.
- Capacidades multilingües: no disponible en la información proporcionada.
- Comportamiento de rechazo desactivado por abliteración (variante "uncensored").

## Casos de uso

- Asistentes de razonamiento con contexto muy largo: los 262.144 tokens permiten procesar repositorios completos, expedientes o transcripciones extensas en una sola pasada sin trocear.
- Automatización de agentes con herramientas: el soporte nativo de `<tool_call>` permite encadenar llamadas a APIs, consultas a bases de datos y ejecución de comandos en bucles multi-paso.
- Análisis de documentos con imagen: gracias al proyector de visión BF16, puede procesar capturas, diagramas o páginas escaneadas junto con texto para extracción de información.
- Despliegue en hardware de gama media: los builds de 2 bits (9,43-10,34 GiB) permiten servir un MoE de 35B en una sola GPU de consumo con 12-16 GB de VRAM, algo inviable con el BF16 (~70 GB).
- Generación de código asistida: la cadena de pensamiento permite trazar el razonamiento antes de emitir código, útil en revisión automática y generación de parches.
- Investigación sobre alineación y seguridad: la variante abliterada sirve para estudiar el comportamiento de rechazo, la direccionalidad en el espacio de activaciones y los efectos de la abliteración sobre capacidades generales.
- Inferencia de baja latencia con decodificación especulativa: el uso del borrador MTP Q6_K acelera la generación en llama.cpp en escenarios de alto throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar caché KV): IQ2_XXS ~9,43 GiB; IQ2_S ~10,34 GiB; IQ3_XXS ~12,76 GiB; IQ3_S ~14,87 GiB. Añadir el proyector de visión (861 MiB) si se usa entrada de imagen y la cabeza MTP Q6_K (673 MiB) si se usa decodificación especulativa con el build IQ2_XXS.
- La caché KV a 262.144 tokens de contexto puede consumir varios GB adicionales según la configuración de llama.cpp; no se dispone de cifras exactas.
- GPU recomendadas: los builds de 2 bits caben en tarjetas de consumo con 12-16 GB (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090); los de 3 bits requieren 16-24 GB (RTX 4090, RTX 3090) o GPU de datacenter (A100, H100) para contexto largo.
- Despliegue: llama.cpp es el runtime de referencia; el formato GGUF es compatible con Ollama y otros frontends basados en llama.cpp. No se menciona soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (esta ficha, GGUF abliterado) | ~35B | ~3B | 262.144 | Apache-2.0 | GGUF 2-3 bits | Cuantización de segunda generación sobre maestro de ~5,29 bpw |
| Ornith-1.5-35B-A3B (vendor, BF16) | ~35B | ~3B | 262.144 | Apache-2.0 | safetensors/GGUF | Sin abliterar; referencia de calidad completa |
| SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF | ~35B | ~3B | 262.144 | Apache-2.0 | GGUF I-Quality (~5,29 bpw) | Fuente directa de esta ficha; un solo paso de cuantización |
| Modelos MoE de ~30-40B con ~3B activos (categoría) | ~30-40B | ~3B | variable | variable | variable | No se dispone de datos de rendimiento comparables en la información proporcionada |

## Limitaciones y advertencias

- Cuantización de segunda generación: parte de un maestro ya cuantizado a ~5,29 bpw, no del BF16 del proveedor, por lo que la pérdida de calidad es mayor que la de una cuantización directa desde precisión completa.
- Los builds de 2 y 3 bits degradan especialmente los expertos enrutados; el autor reconoce un coste de calidad frente a un hipotético GSQ-RCO construido desde BF16.
- La abliteración elimina el comportamiento de rechazo: el modelo puede generar contenido que el modelo original bloquearía. No es apto para producción sin filtros externos de seguridad.
- Riesgo de alucinación inherente a los modelos de razonamiento; la cadena de pensamiento no garantiza corrección factual.
- Idiomas soportados no documentados en esta ficha; no se puede confirmar cobertura multilingüe.
- Discrepancia entre los parámetros nominales (~35B) y el recuento de safetensors del repo (446.571.248), que conviene verificar antes de dimensionar hardware.
- La licencia Apache-2.0 permite uso comercial, pero las modificaciones comunitarias (abliteración, cuantización) no están avaladas por el proveedor original.
- El contexto de 262.144 tokens exige gestión cuidadosa de la memoria; no se documentan cifras de caché KV para esa longitud.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lavendercomputing/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GSQ-RCO-GGUF
- Modelo base del proveedor: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF del proveedor: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Fuente Heretic (I-Quality): https://huggingface.co/SC117/Ornith-1.5-35B-A3B-Heretic-MTP-APEX-GGUF
- Matriz de importancia: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Abliterated-MTP-UD-APEX-GGUF
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Licencia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
