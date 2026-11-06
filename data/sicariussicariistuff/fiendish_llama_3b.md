# SicariusSicariiStuff/Fiendish_LLAMA_3B

## Resumen

Fiendish_LLAMA_3B es un ajuste fino (fine-tune) del modelo meta-llama/Llama-3.2-3B-Instruct, desarrollado por el usuario SicariusSicariiStuff y publicado en Hugging Face. Se trata de la "hermana malvada" de su modelo anterior Impish_LLAMA_3B: el autor lo describe como menos "wholesome" y con más "edge", orientado específicamente a roleplay (RP) y a conversación estilo Character.AI, con respuestas cortas de uno o dos párrafos y una tasa de rechazos (refusals) muy baja.

El modelo conserva la arquitectura y el tamaño del Llama-3.2-3B-Instruct original (3.606.752.256 parámetros según los pesos en safetensors), por lo que hereda la ventana de contexto y las capacidades base del modelo de Meta, pero con un comportamiento afinado para personajes y narrativa interactiva. Es relevante en el ecosistema de modelos pequeños para RP, donde un 3B bien ajustado puede ejecutarse en hardware de consumo y ofrecer una experiencia de personaje consistente sin los rechazos típicos de los modelos alineados de forma conservadora.

La ficha se basa únicamente en la información pública disponible en Hugging Face; el autor no publica detalles sobre el dataset de entrenamiento, el método de ajuste ni resultados de benchmarks, por lo que muchos apartados técnicos quedan marcados como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2, heredada del modelo base) |
| Parámetros totales | 3.606.752.256 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantización | FP16 (original), GGUF, iMatrix, High-Attention, iMatrix-High-Attention, EXL2 en 3.5 bpw, 4.0 bpw y 5.0 bpw |
| Idiomas soportados | Inglés (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (original), GGUF, EXL2 |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Llama-3.2-3B-Instruct de Meta, por lo que mantiene la arquitectura transformer decoder-only del modelo base, con 3.606.752.256 parámetros y los pesos en formato safetensors. No se dispone de información pública sobre el método de ajuste (SFT, DPO, RLHF u otro), el volumen de datos de entrenamiento, la composición del dataset ni posibles innovaciones técnicas introducidas por el autor.

La model card indica que el ajuste se orientó a roleplay y a conversación con tarjetas de personaje (character cards), con respuestas cortas y un tono más "malvado" que su predecesor Impish_LLAMA_3B. El autor menciona que el modelo sigue bien las tarjetas de personaje y mantiene un formato adecuado, pero no aporta detalles sobre el proceso de entrenamiento ni sobre datos utilizados.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas cortas de uno o dos párrafos (estilo Character.AI).
- Roleplay con tarjetas de personaje: el autor destaca un buen seguimiento de la character card, incluyendo una tarjeta incluida en el repositorio (Shmena Koeset).
- Baja tasa de rechazos (refusals) tanto en tareas de asistente como en roleplay, según el autor.
- Mantenimiento de formato consistente en las respuestas.
- Modo asistente y modo roleplay con ajustes de generación recomendados por separado.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio en la información disponible.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Roleplay conversacional con personajes: el modelo está ajustado para interpretar tarjetas de personaje y mantener respuestas breves y consistentes, lo que encaja en aplicaciones de chat narrativo o simuladores de personajes.
- Prototipado de chatbots de personaje en local: al ser un 3B, puede ejecutarse en GPU de consumo con cuantizaciones GGUF o EXL2, lo que permite iterar sobre character cards sin costes de API.
- Generación de ficción interactiva: sus respuestas cortas y su baja tasa de rechazos lo hacen adecuado para narrativa ramificada donde se necesita continuidad de personaje y poca verbosidad.
- Simuladores de rol para juegos de mesa o videojuegos: puede gestionar diálogos de PNJ con personalidad definida mediante tarjetas de personaje.
- Investigación sobre alineación y refusals: útil como caso de estudio de un fine-tune con rechazos reducidos respecto al modelo base, para analizar comportamiento y sesgos.
- Despliegue en entornos con recursos limitados: con cuantizaciones EXL2 de 3.5 bpw o GGUF, puede servir en estaciones de trabajo modestas o incluso en CPU para pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,2 GB en FP16 (tamaño del repositorio); alrededor de 2-3 GB en cuantizaciones GGUF de 4 bits y 3,5-4 GB en EXL2 de 4.0 bpw (estimaciones a partir del tamaño de los pesos, no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, especialmente con cuantizaciones GGUF o EXL2 de 3.5-5.0 bpw.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; ExLlamaV2 para EXL2; vLLM o TGI para safetensors en FP16 (no confirmado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Fiendish_LLAMA_3B | 3,6 B | No disponible | llama3.2 | Hugging Face | Fine-tune de Llama-3.2-3B-Instruct para roleplay |
| Impish_LLAMA_3B | 3,6 B (base Llama 3.2 3B) | No disponible | llama3.2 | Hugging Face | Modelo predecesor del mismo autor, más "wholesome" |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 B | No disponible en esta ficha | llama3.2 | Hugging Face | Modelo base oficial de Meta, alineado de forma general |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está etiquetado únicamente en inglés; su rendimiento en castellano u otros idiomas no está documentado.
- La baja tasa de rechazos declarada por el autor implica un mayor riesgo de generar contenido inapropiado, ofensivo o NSFW; no es adecuado para aplicaciones de producción sin filtros adicionales.
- Riesgo de alucinación inherente a un modelo de 3B, no cuantificado por el autor.
- No hay información sobre sesgos específicos introducidos por el fine-tune.
- La licencia llama3.2 impone restricciones de uso comercial y obligaciones de atribución según la Llama 3.2 Community License; es necesario revisar sus términos antes de un uso comercial.
- El autor no documenta el dataset de entrenamiento ni el método de ajuste, lo que dificulta evaluar la reproducibilidad y los riesgos del modelo.
- Las respuestas cortas (uno o dos párrafos) son una característica del ajuste, no un defecto, pero limitan su uso en tareas que requieran respuestas extensas o razonamiento profundo.
- No se documentan capacidades de tool calling ni de agentes, por lo que no se recomienda para pipelines de automatización que dependan de ellas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B
- Modelo predecesor Impish_LLAMA_3B: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_3B
- Cuantizaciones GGUF: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B_GGUF
- Cuantizaciones iMatrix: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B_iMatrix
- Cuantizaciones High-Attention: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B_GGUF_HA
- Cuantizaciones iMatrix-High-Attention: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B_HA_NL
- EXL2 3.5 bpw: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B-3.5bpw
- EXL2 4.0 bpw: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B-4.0bpw
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Tarjeta de personaje Shmena Koeset: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B/resolve/main/Character_Cards/Shmena_Koeset.png
- Apoyo al autor (Ko-fi): https://ko-fi.com/sicarius
