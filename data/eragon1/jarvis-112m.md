# Eragon1/jarvis-112m

## Resumen

`jarvis-112m` es un modelo de lenguaje causal de tipo decoder-only desarrollado por el usuario Eragon1, orientado principalmente a la generación de texto y diálogo en ruso. Se trata de un modelo compacto de aproximadamente 111,7 millones de parámetros entrenado desde cero ("from-scratch") como proyecto de experimentación e investigación. Su arquitectura, tokenizador, pipeline de datos y bucle de entrenamiento están implementados en el repositorio de GitHub `lubenkov/jarvis`, etiquetado en su versión v1.0.0.

El modelo emplea una arquitectura Transformer con 14 capas, 12 cabezas de atención, tamaño oculto de 768 y capa feed-forward de 2.048, con codificación posicional RoPE, normalización RMSNorm y bloques SwiGLU. Dispone de una longitud de contexto de 768 tokens y un vocabulario de 16.384 tokens basado en BPE a nivel de byte. El checkpoint publicado es un fichero PyTorch `.pt` con pesos en fp16, no un checkpoint compatible con `AutoModelForCausalLM` de la librería `transformers`.

Su relevancia actual reside en su carácter didáctico y reproducible: permite inspeccionar de extremo a extremo un pipeline de preentrenamiento y SFT (supervised fine-tuning) de un modelo ruso de pequeño tamaño, con un coste de cómputo bajo. No obstante, el autor advierte explícitamente de que no ha sido evaluado para uso de alto impacto ni para un seguimiento robusto de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo |
| Parametros totales | Aproximadamente 111,7M (112M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 768 tokens |
| Tipos de cuantizacion | No disponible (checkpoint en fp16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`jarvis-112m-sft-fp16.pt`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only autoregresivo de 14 capas y 12 cabezas de atención, con tamaño oculto 768 y feed-forward de 2.048. Utiliza codificación posicional RoPE, normalización RMSNorm y bloques SwiGLU. El tokenizador es un BPE a nivel de byte de 16.384 tokens. Todo el código (arquitectura, tokenizador, pipeline de datos, bucle de entrenamiento y generación local) se implementa en el repositorio `lubenkov/jarvis`; el checkpoint no es cargable directamente con `transformers`.

El entrenamiento se configura en dos fases según `model/config.py`: un preentrenamiento de 1.200 millones de tokens con mezcla de muestreo del 68 % web, 27 % chat y 5 % artículos, y un SFT de 150 millones de tokens con 95 % chat y 5 % web. Las fuentes incluyen `HuggingFaceFW/fineweb-2` (`rus_Cyrl`), `IlyaGusev/gazeta`, `IlyaGusev/saiga_scored`, `Vikhrmodels/GrandMaster-PRO-MAX`, `Vikhrmodels/Veles-2.5`, `Den4ikAI/russian_instructions_2`, `inkoziev/jokes_dialogues` y el subconjunto ruso de `OpenAssistant/oasst1`. El pipeline aplica filtros por fuente, normaliza roles de chat, elimina duplicados y filtra contenido cirílico. El autor advierte de que el checkpoint publicado no incluye el log de entrenamiento completo, el recuento exacto de tokens procesados, detalles de hardware ni hashes de revisión de los datasets, por lo que los presupuestos de tokens deben tratarse como configuración del repositorio y no como una cifra auditada.

## Capacidades

- Generación de texto corto en ruso: continuación de prompt y respuestas breves de conversación.
- Diálogo multi-turno limitado: soporta formato de chat a través del script `chat.py`, con contexto máximo de 768 tokens.
- Muestreo configurable: temperatura, top-k, top-p y penalización por repetición.
- Ejecución local en CPU o CUDA: los scripts seleccionan CUDA si está disponible y, en caso contrario, usan CPU.
- Fine-tuning adicional: el pipeline del repositorio permite reentrenar o ajustar el modelo con datos propios.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al ruso; no se declaran otros idiomas.

## Casos de uso

- Experimentación educativa con Transformers: inspeccionar una implementación completa de un decoder-only desde cero, incluyendo tokenizador, atención, RoPE y SwiGLU, con un coste de cómputo mínimo.
- Generación de texto ruso de baja latencia en local: usar `generate.py` para producir textos cortos en una máquina sin GPU dedicada, dado el tamaño de 112M parámetros.
- Prototipado de chatbots de dominio acotado: desplegar `chat.py` para conversaciones breves en ruso donde el contexto de 768 tokens sea suficiente (por ejemplo, respuestas a preguntas frecuentes).
- Reproducción de pipelines de preentrenamiento y SFT: reutilizar los scripts del repositorio para validar recetas de mezcla de datos (web, chat, artículos) con presupuestos de 1,2B y 150M tokens.
- Fine-tuning sobre datos propios en ruso: ajustar el checkpoint con datasets específicos de un dominio (por ejemplo, atención al cliente) usando la receta SFT incluida.
- Investigación sobre filtrado de datos cirílicos: estudiar el efecto de los filtros de deduplicación y normalización de roles de chat del pipeline de preparación.
- Docencia y talleres: emplear el modelo como ejemplo práctico de entrenamiento de un LM pequeño con licencia Apache-2.0, sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,25 GB para los pesos (112M parámetros × 2 bytes), más overhead de activaciones y contexto; holgado en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; los scripts funcionan también en CPU.
- Cabe en GPU consumer: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 o inferiores, y en CPU.
- Opciones de despliegue: los scripts propios del repositorio `lubenkov/jarvis` (`chat.py` y `generate.py`) con PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el checkpoint es un `.pt` personalizado y no un formato `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| jarvis-112m | ~112M | 768 | Ruso | Apache-2.0 | PyTorch `.pt` custom |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No evaluado para uso de alto impacto: el autor desaconseja su uso como base única para decisiones médicas, legales, financieras, laborales o educativas.
- Riesgo de alucinación: no ha sido evaluado para fiabilidad factual ni para un seguimiento robusto de instrucciones.
- Contexto muy limitado: 768 tokens restringen conversaciones largas y documentos extensos.
- Monolingüe en la práctica: solo se declara ruso; no se garantiza calidad en otros idiomas.
- Checkpoint no estándar: requiere el código del repositorio `lubenkov/jarvis`; no es cargable con `transformers`, lo que limita su integración en ecosistemas habituales.
- Reproducibilidad incompleta: no se publican log de entrenamiento, recuento exacto de tokens, hardware ni hashes de datasets; el pipeline no fija revisiones de los datasets fuente.
- Privacidad y seguridad: no se ha evaluado en estos aspectos; no enviar información personal o confidencial a despliegues no controlados.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eragon1/jarvis-112m
- Ficheros del repositorio: https://huggingface.co/Eragon1/jarvis-112m/tree/main
- Código fuente (GitHub, v1.0.0): https://github.com/lubenkov/jarvis/releases/tag/v1.0.0
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset gazeta: https://huggingface.co/datasets/IlyaGusev/gazeta
- Dataset saiga_scored: https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Dataset GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
- Dataset Veles-2.5: https://huggingface.co/datasets/Vikhrmodels/Veles-2.5
- Dataset russian_instructions_2: https://huggingface.co/datasets/Den4ikAI/russian_instructions_2
- Dataset jokes_dialogues: https://huggingface.co/datasets/inkoziev/jokes_dialogues
- Dataset oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Selector oficial de PyTorch: https://pytorch.org/get-started/locally/
