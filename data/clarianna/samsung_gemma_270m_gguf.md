# Clarianna/Samsung_Gemma_270M_gguf

## Resumen

Clarianna/Samsung_Gemma_270M_gguf es una adaptación en formato GGUF del modelo Gemma 3 270M de Google DeepMind, publicada por el usuario Clarianna. El repositorio contiene un único archivo cuantizado (`gemma-3-270m.Q4_K_M.gguf`) generado con Unsloth a partir de un ajuste fino sobre el modelo base, más un Modelfile de Ollama para su despliegue inmediato. El recuento real de parámetros es de 268.098.176 (unos 270 M) y el repositorio completo ocupa 0,3 GB.

Se trata de un modelo denso, decoder-only, etiquetado como `gemma3_text` y `conversational`, orientado a inferencia local en hardware muy modesto: CPU, dispositivos móviles, placas tipo Raspberry Pi o GPU integradas. Su relevancia actual radica en la relación entre un tamaño inferior a 300 M de parámetros y la posibilidad de ejecutar asistentes conversacionales sin conexión y sin coste por token.

Advertencias de partida: el repositorio no declara licencia, idiomas soportados ni pipeline, no documenta el dataset del ajuste fino y registra 0 descargas y 0 valoraciones en el momento de la consulta. El nombre "Samsung" sugiere una especialización de dominio concreta, pero no existe documentación que lo confirme ni que acredite vinculación alguna con Samsung.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (según el tag `gemma3_text`); dato del modelo base, no confirmado en esta ficha |
| Parámetros totales | 268.098.176 (≈270 M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en esta ficha (el modelo base Gemma 3 270M declara 32.768 tokens) |
| Tipos de cuantización | Solo Q4_K_M (`gemma-3-270m.Q4_K_M.gguf`); no se publican otros niveles |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivo único), compatible con llama.cpp y Ollama |
| Modelo base | Gemma 3 270M (Google DeepMind), según el nombre del archivo y los tags |
| Tamaño del repositorio | 0,3 GB |
| Autor | Clarianna |
| Fecha de creación / actualización | 2026-10-02 / 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica únicamente que el modelo fue ajustado (fine-tuning) y convertido a GGUF con Unsloth, y que el comportamiento del token BOS se modificó para garantizar la compatibilidad con GGUF. No se especifica el dataset, el número de tokens de entrenamiento, la composición de los datos, la técnica de alineación (SFT, DPO, RLHF) ni el régimen de hiperparámetros empleado, por lo que todos esos extremos quedan como no disponibles.

Respecto al modelo base, la documentación pública de Google describe Gemma 3 270M como un transformer decoder-only entrenado sobre aproximadamente 6 billones de tokens, con un vocabulario de 262.144 entradas y una ventana de contexto de 32.768 tokens. La familia Gemma 3 intercala capas de atención local con ventana deslizante frente a capas de atención global en una proporción 5:1. Estos datos corresponden al modelo original, no al ajuste fino aquí descrito, y no vienen confirmados por la información disponible de este repositorio.

## Capacidades

- Generación de texto y conversación multi-turno: el tag `conversational` y la inclusión de una plantilla de chat (`--jinja`) indican un uso previsto como asistente de texto.
- Instrucciones sencillas: con 270 M de parámetros puede seguir consignas cortas y directas, con degradación rápida al aumentar la complejidad.
- Inferencia local y sin conexión: ejecutable con llama.cpp y Ollama, incluida una CPU sin GPU.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere su uso tras APIs compatibles con el formato de llama.cpp.
- Capacidades multimodales: no disponibles. Aunque la model card incluye el comando `llama-mtmd-cli`, el modelo está etiquetado como `gemma3_text` y el peso publicado es de texto.
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso y uso como agente: no documentado y poco realista con este tamaño.
- Capacidades multilingües: no disponibles en esta ficha; los modelos pequeños de esta escala suelen degradarse fuera del inglés.
- Modo de razonamiento explícito (thinking): no documentado.

## Casos de uso

- Filtrado y moderación previa en local: clasificar mensajes o comentarios antes de enviarlos a un modelo mayor, con coste marginal nulo por token y sin enviar datos a terceros.
- Enrutamiento de consultas (router): decidir si una petición requiere un modelo grande o puede resolverse con una respuesta simple, reduciendo el gasto en APIs.
- Autocompletado y predicción de texto embebida: integrarlo en editores o formularios para sugerir continuaciones cortas en tiempo real sobre CPU.
- Prototipado de pipelines de cuantización: sirve como banco de pruebas para validar flujos de Unsloth, llama.cpp y Ollama antes de escalar a modelos mayores.
- Asistentes de texto sin conexión: dispositivos móviles, Raspberry Pi o equipos sin GPU que necesiten respuestas conversacionales básicas y privadas.
- Reescritura y resumen de frases cortas: normalización de titulares, notas o descripciones de producto donde no se requiere precisión factual alta.
- Extracción de campos simples: identificación de entidades o valores concretos en textos breves, siempre con verificación posterior.
- Interacción por comandos en domótica o aplicaciones de escritorio: interpretación de órdenes cortas y predefinidas con latencia mínima.
- Docencia y experimentación: material didáctico para explicar cuantización, plantillas de chat y despliegue local sin depender de infraestructura de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones, ni comparativas con el modelo base, ni métricas de perplejidad, MMLU, HumanEval o GSM8K. Google publica resultados propios para Gemma 3 270M en su documentación oficial, pero no forman parte de la información proporcionada y no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa aproximadamente 160-170 MB (estimación por aritmética de la cuantización, no confirmada por el autor); en FP16 el modelo ocuparía unos 536 MB y en Q8_0 en torno a 285 MB.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3060, RTX 4090 e incluso GPU integradas, así como en CPU sin aceleración y en placas tipo Raspberry Pi 4/5.
- No requiere ni aprovecha A100, H100 ni GPUs de centro de datos.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Clarianna/Samsung_Gemma_270M_gguf --jinja`), Ollama mediante el Modelfile incluido, LM Studio y `llama-cpp-python`. Para vLLM o TGI conviene partir del modelo base original en safetensors, ya que GGUF no es su formato nativo.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuración.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentación pública y no están verificados en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Clarianna/Samsung_Gemma_270M_gguf | 268 M | No disponible (base: 32.768 tokens) | No disponible | GGUF Q4_K_M, Ollama |
| Gemma 3 270M (Google, base e instruct) | 270 M | 32.768 tokens | Gemma Terms of Use | Safetensors, GGUF oficial, QAT int4 |
| Qwen3-0.6B | 0,6 B | 32.768 tokens (ampliable) | Apache 2.0 | Safetensors, GGUF, Ollama |
| SmolLM2-360M | 360 M | 8.192 tokens | Apache 2.0 | Safetensors, GGUF |

Frente a estos, el peso cuantizado del modelo aquí descrito es el más ligero del grupo, pero también el que ofrece menos garantías: carece de licencia declarada y de cualquier evaluación publicada, mientras que las alternativas cuentan con licencias permisivas y resultados documentados.

## Limitaciones y advertencias

- Tamaño muy reducido: con 270 M de parámetros la tasa de alucinación es alta, el razonamiento complejo es poco fiable y el rendimiento en matemáticas y código es limitado.
- Licencia no declarada: no se especifican condiciones de uso comercial. Aunque el modelo base se distribuye bajo Gemma Terms of Use, el ajuste fino no las reproduce, por lo que existe incertidumbre legal para producción. Conviene contactar con el autor antes de cualquier uso comercial.
- Procedencia de los datos desconocida: no hay model card detallada ni dataset documentado del ajuste fino, de modo que no se pueden evaluar sesgos, contaminación ni calidad del corpus.
- Sin validación externa: 0 descargas y 0 likes implican ausencia de pruebas por terceros.
- Ajuste del token BOS: la propia model card advierte de que se modificó para compatibilidad con GGUF, lo que puede provocar diferencias de salida respecto al modelo original en transformers.
- Solo una cuantización disponible: no hay versiones FP16, Q8_0 ni Q5_K_M dentro del repositorio, lo que limita la comparación de calidad.
- Idiomas no confirmados: sin declaración explícita, se asume un comportamiento débil fuera del inglés, habitual en esta escala.
- Contexto efectivo reducido: incluso si hereda 32.768 tokens del modelo base, en modelos pequeños el rendimiento cae de forma acentuada en ventanas largas.
- Nombre potencialmente confuso: la referencia "Samsung" no está respaldada por ninguna entidad y podría inducir a error sobre el origen o el respaldo del modelo.
- Fechas del repositorio: creado y actualizado el 2026-10-02, sin historial posterior de mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Clarianna/Samsung_Gemma_270M_gguf
- Unsloth (herramienta de ajuste fino y conversión citada en la model card): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue con el Modelfile incluido): https://ollama.com
- Modelo base de referencia, Gemma 3 270M de Google: https://huggingface.co/google/gemma-3-270m
