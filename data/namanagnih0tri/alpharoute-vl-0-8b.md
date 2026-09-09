# NamanAgnih0tri/AlphaRoute-VL-0.8B

## Resumen

AlphaRoute-VL-0.8B es un modelo de lenguaje visual de pequeño tamaño (SLM) desarrollado por NamanAgnih0tri, diseñado para routing semántico multimodal condicionado por instrucciones, extracción de entidades visuales y generación de JSON estructurado. A diferencia de los clasificadores clásicos, no depende de etiquetas estáticas: en tiempo de ejecución recibe una instrucción de tarea, una ontología dinámica con descripciones, un esquema JSON objetivo y una imagen (o consulta de texto), y devuelve el enrutamiento junto con los campos extraídos en el formato solicitado.

El modelo se construye sobre la base Qwen/Qwen3.5-0.8B-Base, con 873.438.784 parámetros. Se trata de un modelo de tipo transformer vision-language (image-text-to-text) que combina un codificador visual ViT y pesos de cross-attention trasplantados desde el modelo base a los pesos de texto instruction-tuned de AlphaRoute-0.8B-v1.5. Es un modelo de código abierto bajo licencia Apache-2.0, disponible en formato safetensors, pensado para despliegue en hardware de consumo o edge.

Cabe destacar que el autor declara explícitamente que el modelo no ha recibido fine-tuning multimodal SFT en pares imagen-texto; la capacidad visual es emergente en modo zero-shot. A pesar de ello, en el benchmark Golden VL alcanza un 95,33% de precisión global en routing visual y un 100% en los cinco dominios empresariales evaluados, con una latencia de 2,59 segundos por consulta en un MacBook Air M4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (image-text-to-text) sobre base Qwen/Qwen3.5-0.8B-Base, con encoder visual ViT y cross-attention transplantados |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el modelo se distribuye en safetensors; se menciona fp16/bf16 para inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AlphaRoute-VL-0.8B es un modelo transformer denso de 0,8B parámetros, sin mezcla de expertos (MoE). Su arquitectura de vision-language sigue el patrón image-text-to-text: un codificador visual (ViT) procesa la imagen y, mediante capas de cross-attention, inyecta la información visual en el modelo de lenguaje. El autor indica que se realizó un trasplante quirúrgico de los pesos `model.visual.*` del modelo base Qwen/Qwen3.5-0.8B-Base sobre los pesos de texto ya afinados de AlphaRoute-0.8B-v1.5. No se ha llevado a cabo un fine-tuning multimodal explícito en pares imagen-texto, por lo que la percepción visual es emergente y se ha validado de forma zero-shot en los benchmarks reportados.

En cuanto al entrenamiento, no se aportan datos sobre el número de tokens ni la composición del dataset. El modelo es instruction-tuned y se etiqueta con soporte de function calling y salidas estructuradas JSON, pero no se detalla si se usó RLHF o DPO. En modo de texto puro, el codificador visual se omite por completo y el modelo conserva exactamente el rendimiento de AlphaRoute-0.8B-v1.5, según las tablas del autor.

## Capacidades

- Routing semántico multimodal condicionado por instrucción: clasifica la intención de una imagen o consulta de texto según una ontología definida en tiempo de ejecución.
- Extracción de entidades visuales (OCR): lee códigos de error, IDs de transacción, importes monetarios, números de seguimiento, etc., directamente desde los píxeles de la imagen.
- Salida JSON estructurada: genera JSON sintácticamente válido conforme a un esquema proporcionado por el usuario, con un 100% de validez reportada.
- Modo dual de inferencia: en modo multimodal acepta imagen + instrucciones + esquema; en modo texto puro (con `images=None`) el encoder visual se omite y conserva el rendimiento de texto de v1.5.
- Ontologías dinámicas: no hay clases fijas; las etiquetas candidatas, descripciones y esquemas pueden definirse por petición.
- Rechazo de imágenes fuera de alcance: puede marcar imágenes no relacionadas con la tarea como `out_of_scope: true` (72% de precisión en benchmark adversarial).
- Soporte de function calling y herramientas: la generación de JSON estructurado permite integrarse en flujos de tool calling.
- Capacidad multilingüe: solo se documenta inglés (etiqueta `en`).

## Casos de uso

- Diagnóstico de incidentes DevOps y SRE: el operador sube una captura de pantalla de un pod en CrashLoopBackOff o un aviso de disco lleno; el modelo clasifica el incidente dentro de la ontología definida y extrae el código de error en JSON.
- Automatización de FinTech y pagos: procesa recibos de SWIFT, pantallas de rechazo de Stripe, facturas B2B o dispute de chargeback; el modelo devuelve la categoría y los campos extraídos (importes, IDs, flags AML).
- Detección de errores en UI web y móvil: con capturas de errores 502/503/504, 403, 404 o TypeError de React, el modelo etiqueta el fallo y produce un JSON listo para integrarse en sistemas de ticketing.
- Logística y reclamaciones: analiza pruebas de daño en paquetes, etiquetas RMA, códigos de barras y desajustes de geofencing, extrayendo la información de la imagen en el esquema solicitado.
- Verificación de identidad y KYC: valida licencias de conducir (vigentes o caducadas), pasaportes con líneas MRZ, badges corporativos y rechaza imágenes ilegibles por reflejo o deslumbramiento.
- Atención al cliente con tickets visuales: enruta automáticamente los tickets que incluyen imágenes de errores hacia la categoría correcta sin etiquetas predefinidas, generando la acción recomendada en JSON.
- Extracción de datos de facturas escaneadas: el modelo OCR campos como número de factura, importe total, IVA o fecha, y los inserta en un esquema de facturación.
- Filtrado de imágenes irrelevantes en sistemas de soporte: en un pipeline de tickets, rechaza imágenes como atardeceres o arte abstracto para evitar falsos positivos en el enrutamiento técnico.

## Benchmarks y rendimiento

Los benchmarks proceden de la model card del autor y no han sido verificados de forma independiente.

### Routing basado en texto (100% retenido de AlphaRoute-0.8B-v1.5)

| Benchmark | AlphaRoute-VL-0.8B | AlphaRoute-0.8B v1.5 | AlphaRoute-0.8B v1.1 | DeepSeek-V4 Flash | Azure GPT-5.4-nano |
|---|---:|---:|---:|---:|---:|
| Banking77 Intent (500 Fixed Split) | 95,40% | 95,40% | 92,60% | 93,00% | 85,40% |
| CLINC150 Multi-Domain (500 Fixed + OOS) | 94,00% | 94,00% | 73,20% | 71,40% | 54,40% |
| HWU64 Zero-Shot (1.076 Held-Out) | 89,96% | 89,96% | 83,18% | 85,40% | 81,20% |
| Golden 300 Enterprise (300 Escenarios) | 97,67% | 97,67% | 95,67% | 94,00% | 92,33% |
| Hard Enterprise 100 Suite | 95,00% | 95,00% | 80,00% | 86,00% | 84,00% |
| Adversarial Text OOS Rejection (20 Probes) | 100,00% | 100,00% | 55,00% | 75,00% | 65,00% |
| CLINC150 In-Scope Intent Accuracy | 96,06% | 96,06% | 67,73% | 65,02% | 45,07% |
| JSON Schema Validity | 100,00% | 100,00% | 100,00% | 100,00% | 99,00% |

### Routing visual multimodal (Golden VL Benchmark, 300 casos)

| Métrica | AlphaRoute-VL-0.8B |
|---|---:|
| Precisión global de categoría | 95,33% (286/300) |
| Routing empresarial in-scope | 100,00% (250/250) |
| Extracción de slots OCR visual | 77,92% (600/770) |
| Rechazo adversarial OOS (imágenes) | 72,00% (36/50) |
| Validez JSON Schema | 100,00% (300/300) |
| Latencia de inferencia (Apple Silicon MPS) | 2,59 s/consulta |

Desglose en los dominios evaluados: 100% en DevOps y Cloud SRE, FinTech y Pagos, Web y UI, Logística y Reclamaciones, e Identidad y KYC; 72% en el bloque adversarial de imágenes fuera de alcance.

## Requisitos de hardware

- Footprint de memoria: aproximadamente 1,66 GB en fp16/bf16, por lo que es viable en tarjetas gráficas de consumidor con al menos 2 GB de VRAM.
- Hardware validado: MacBook Air M4 con 16 GB de memoria unificada, con latencia media de 2,59 s por consulta en MPS.
- GPU recomendadas: no se especifica una lista cerrada; el modelo está pensado para hardware edge, móviles y GPUs de bajo coste en la nube.
- Opciones de despliegue: no se documentan oficialmente herramientas concretas. Al distribuirse en safetensors con pipeline image-text-to-text, es compatible con el ecosistema Hugging Face Transformers, aunque no se han verificado vLLM, llama.cpp, Ollama o TGI en la documentación.
- Latencia y throughput: solo se reporta la latencia en MPS (2,59 s/consulta). No hay datos de throughput en servidores.

## Comparativa con modelos similares

La comparación se basa en las tablas de la model card del autor. Los datos de parámetros, contexto y licencia de los competidores no se proporcionan, por lo que se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Routing texto | Routing multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AlphaRoute-VL-0.8B | 873.438.784 | No disponible | 95,40% Banking77 / 97,67% Golden 300 | 95,33% global / 100% in-scope | Apache-2.0 | HuggingFace |
| AlphaRoute-0.8B-v1.5 | No disponible | No disponible | 95,40% Banking77 / 97,67% Golden 300 | No aplica | No disponible | No disponible |
| DeepSeek-V4 Flash | No disponible | No disponible | 93,00% Banking77 / 94,00% Golden 300 | No disponible | No disponible | No disponible |
| Azure GPT-5.4-nano | No disponible | No disponible | 85,40% Banking77 / 92,33% Golden 300 | No disponible | No disponible | Azure |

Nota: AlphaRoute-0.8B-v1.5 es el predecesor sin modalidad visual; el rendimiento en texto de VL es idéntico porque en modo texto puro reutiliza directamente los pesos de v1.5.

## Limitaciones y advertencias

- El modelo no ha recibido un fine-tuning multimodal explícito en pares imagen-texto. Su capacidad visual se describe como emergente y validada en un conjunto de 300 casos; el comportamiento puede ser menos fiable fuera de los dominios evaluados.
- La precisión de extracción OCR visual es del 77,92% en el benchmark Golden VL, por lo que no se recomienda su uso en aplicaciones críticas sin revisión humana.
- El rechazo de imágenes fuera de alcance alcanza el 72% en el bloque adversarial; un 28% de las imágenes no técnicas podría enrutarse incorrectamente.
- Solo se documenta el idioma inglés. No hay soporte multilingüe oficial.
- Los benchmarks proceden de mediciones del autor y no han sido verificados por un organismo independiente.
- No se dispone de información sobre cuantizaciones oficiales (GGUF, GPTQ, etc.), por lo que el despliegue en hardware muy limitado requiere conversión propia.
- No se detalla el uso de RLHF/DPO ni la composición del dataset de entrenamiento.
- La latencia de 2,59 s/consulta en hardware Apple Silicon puede ser excesiva en entornos que requieran respuesta en tiempo real.
- El modelo se distribuye en formato preview; no se garantiza estabilidad de la API ni soporte a largo plazo.

## Enlaces

- HuggingFace: https://huggingface.co/NamanAgnih0tri/AlphaRoute-VL-0.8B
- Modelo base Qwen/Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- No se han localizado otros enlaces relevantes (papers, blogs, repositorios o demos) en los resultados de búsqueda disponibles.
