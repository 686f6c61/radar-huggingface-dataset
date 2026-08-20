# saidutta69/RaceBench-MiniCPM5-heretic

## Resumen

RaceBench-MiniCPM5-heretic es una variante "decensored" (sin censura) del modelo RaceBench-MiniCPM5, desarrollada por saidutta69 mediante la técnica de ablación direccional (abliteration) implementada en la herramienta Heretic v1.4.0. El modelo base es MiniCPM5-1B de OpenBMB, sobre el que se aplicó un fine-tuning con el dataset RaceBench para mejorar el razonamiento multi-paso, y posteriormente se eliminaron los comportamientos de rechazo mediante ediciones quirúrgicas de pesos en las capas de atención y MLP, sin recurrir a fine-tuning adicional.

El resultado es un modelo de 1.080.632.832 parámetros (aproximadamente 1,08 mil millones) con arquitectura LlamaForCausalLM, contexto de 128.000 tokens y capacidades híbridas de pensamiento (Think/No-Think). Está diseñado para desarrolladores que necesitan razonamiento avanzado en un paquete compacto para despliegue local, agentes autónomos, roleplay o investigación sobre mecanismos de alineación, sin los guardarraíles típicos de los modelos entrenados con RLHF. La abliteración reduce la tasa de rechazo de 39/100 a 2/100 en prompts adversariales, manteniendo una divergencia KL de 0,0284 respecto al modelo original.

Al ser un modelo de 1B con cuantizaciones GGUF desde Q4_K_M hasta F16, puede ejecutarse en GPUs de consumo y en dispositivos edge, lo que lo hace atractivo para aplicaciones de IA en el borde. Sin embargo, la supresión deliberada de rechazos implica que no hay filtro de seguridad adicional, por lo que su uso en entornos públicos sin moderación está desaconsejado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (familia MiniCPM5) |
| Parametros totales | 1.080.632.832 (1,08B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | FP16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LlamaForCausalLM estándar, con 1,08 mil millones de parámetros y una ventana de contexto de 128K tokens. El proceso de entrenamiento consta de tres etapas: primero, el modelo base MiniCPM5-1B de OpenBMB, que ya incorpora capacidades de razonamiento híbrido Think/No-Think y generación de llamadas a herramientas en formato XML; segundo, un fine-tuning con el dataset RaceBench (diseñado para mejorar el razonamiento multi-paso, con una ganancia de +2,7 puntos en BBH respecto al base); y tercero, la abliteración con Heretic v1.4.0, que identifica y edita direcciones de pesos específicas responsables del comportamiento de rechazo en las proyecciones de salida de atención (attn.o_proj) y en las proyecciones descendentes del MLP (mlp.down_proj). Los parámetros de edición incluyen pesos máximos y mínimos por capa, así como posiciones y distancias, tal como se detalla en la tabla de la model card. Esta técnica preserva las capacidades generales del modelo al no alterar el resto de la red.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Razonamiento multi-paso mejorado gracias al fine-tuning con RaceBench (BBH +2,7 sobre MiniCPM5-1B).
- Generación de código y soporte para agentes autónomos.
- Tool calling / function calling mediante llamadas en formato XML, compatible con el parser `minicpm5` de SGLang para convertirlas a `tool_calls` de OpenAI.
- Modo de pensamiento híbrido: permite activar o desactivar el razonamiento explícito mediante el parámetro `enable_thinking` en la plantilla de chat.
- Contexto largo de 128K tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Sin rechazos: el modelo cumple con solicitudes que el modelo base rechazaría, incluyendo contenido potencialmente dañino (sin filtro de seguridad adicional).

## Casos de uso

- Agentes locales autónomos: el modelo puede integrarse en pipelines de agentes que requieren razonamiento multi-paso y llamadas a herramientas, ejecutándose en hardware de consumo sin depender de APIs externas.
- Roleplay y narrativa interactiva: al no tener rechazos, es adecuado para aplicaciones de ficción interactiva o juegos de rol donde el contenido puede ser adulto o controvertido, siempre que el despliegue sea privado.
- Investigación sobre alineación y mecanismos de rechazo: permite estudiar cómo la abliteración afecta al comportamiento del modelo, comparando con la versión original.
- Generación de código en entornos de desarrollo: con soporte de tool calling y contexto largo, puede asistir en tareas de programación, revisión de código o generación de scripts.
- Análisis de documentos largos: su ventana de 128K tokens permite procesar informes, artículos o contratos extensos en un solo paso, extrayendo información o resumiendo.
- Prototipado de asistentes conversacionales sin moderación: para entornos controlados donde se necesita explorar respuestas sin filtros, como pruebas de concepto o demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta únicamente métricas de la abliteración:

| Metrica | Este modelo | Modelo original (RaceBench-MiniCPM5) |
|---|---|---|
| Divergencia KL | 0,0284 | 0 (por definicion) |
| Rechazos (sobre 100 prompts adversariales) | 2 | 39 |

Además, se indica que el modelo mantiene la ganancia de razonamiento de RaceBench (BBH +2,7 sobre MiniCPM5-1B) a costa de una regresión en tareas matemáticas, aunque no se proporcionan cifras concretas de esa regresión.

## Requisitos de hardware

- VRAM estimada: para FP16 (~2,2 GB) se necesitan al menos 4 GB de VRAM con overhead; para cuantizaciones GGUF Q4_K_M (~776 MB) bastan 2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso Apple Silicon con Metal.
- Cabe en GPUs de consumo y en dispositivos edge (Raspberry Pi 5 con 8 GB, teléfonos de gama alta).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang y transformers.
- Latencia y throughput: no especificados, pero al ser un modelo de 1B, la generación es rápida en hardware moderno; por ejemplo, en una RTX 4090 se pueden alcanzar cientos de tokens por segundo con cuantización Q4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RaceBench-MiniCPM5-heretic | 1,08B | 128K | Apache 2.0 | Sin rechazos, razonamiento mejorado, regresion matematica |
| RaceBench-MiniCPM5 (padre) | 1,08B | 128K | Apache 2.0 | Con rechazos, mismo razonamiento |
| MiniCPM5-1B (base) | 1,08B | 128K | Apache 2.0 | Modelo original de OpenBMB, con guardarrailes RLHF |

No se dispone de datos de rendimiento comparativo con otros modelos de 1B como Qwen2.5-1.5B o Llama-3.2-1B en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos heredados: el modelo comparte los sesgos factuales y sociales del modelo base MiniCPM5-1B y del fine-tuning RaceBench.
- Riesgo de alucinacion: no se han mitigado específicamente; puede generar información falsa o inventada, especialmente en tareas matemáticas donde se documenta una regresión.
- Sin filtro de seguridad: la abliteración elimina los rechazos, por lo que el modelo puede generar contenido dañino, ilegal o no ético si se le solicita. No debe desplegarse en endpoints públicos sin moderación.
- Limitaciones de idioma: solo soporta inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Regresion matematica: el fine-tuning con RaceBench mejora el razonamiento pero degrada el rendimiento en aritmética, según la documentación del modelo padre.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la responsabilidad del despliegue recae en el usuario.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/saidutta69/RaceBench-MiniCPM5-heretic)
- [Modelo padre RaceBench-MiniCPM5](https://huggingface.co/saidutta69/RaceBench-MiniCPM5)
- [Modelo base MiniCPM5-1B](https://huggingface.co/openbmb/MiniCPM5-1B)
- [Repositorio Heretic](https://github.com/p-e-w/heretic)
- [Blog sobre abliteration](https://huggingface.co/blog/mlabonne/abliteration)
- [Dataset RaceBench](https://huggingface.co/datasets/saidutta69/RaceBench)
