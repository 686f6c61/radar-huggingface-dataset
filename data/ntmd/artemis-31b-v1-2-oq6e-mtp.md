# NTMD/Artemis-31B-v1.2-oQ6e-mtp

## Resumen

Artemis-31B-v1.2-oQ6e-mtp es una cuantización de 6 bits del fine-tune Artemis-31B-v1.2, desarrollado por TheDrummer sobre el modelo base google/gemma-4-31B-it. El modelo original está especializado en roleplay (RP) y escritura creativa, con un modo de razonamiento explícito (thinking mode) heredado de la plantilla de Gemma 4. Esta versión concreta, publicada por el usuario NTMD, es una conversión a 6 bits en formato safetensors con pesos de aproximadamente 27,3 GB y 31.742.607.472 parámetros reales.

El modelo resuelve el problema de la coherencia narrativa en conversaciones largas dentro de roleplay: según los testimonios recogidos en la model card, mantiene el seguimiento de trama y detalles hasta contextos de 20k-32k tokens, con un caso reportado de traspaso limpio a 100k. La inclusión del bloque de razonamiento permite que el modelo recupere detalles relevantes de la ficha de personaje sin mezclar personalidades entre tarjetas distintas, algo que los testers señalan como una mejora sustancial frente a versiones anteriores.

Es relevante ahora porque la model card lo posiciona, según comentarios de testers, como un tune de Gemma 4 que compite con modelos de mayor tamaño (se menciona GLM 5.1 como referencia), manteniendo además tool calling y uso general-purpose. No obstante, la información técnica disponible es escasa: no hay datos de licencia, idiomas, benchmarks formales ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma 4 31B; detalles no disponibles) |
| Parametros totales | 31.742.607.472 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los testers reportan buen comportamiento a 20k-32k y un caso a 100k) |
| Tipos de cuantizacion | 6 bits (oQ6e); existe version GGUF publicada por bartowski |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base google/gemma-4-31B-it, por lo que hereda la arquitectura transformer de Gemma 4 con 31.742.607.472 parámetros. Esta variante concreta (oQ6e-mtp) es una cuantización de 6 bits, presumiblemente orientada a reducir el peso en disco y VRAM manteniendo la fidelidad respecto al modelo original en precisión completa. No se dispone de información sobre la composición del dataset de fine-tuning, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF, DPO u otras.

La model card menciona que el modelo usa la plantilla de Gemma 4 con modo thinking o non-thinking, y que el bloque de razonamiento ("think block") está afinado específicamente para roleplay, extrayendo detalles relevantes de la ficha de personaje y manteniendo la respuesta fiel a ese razonamiento. No se documentan innovaciones arquitectónicas propias más allá del fine-tuning; el sufijo "mtp" en el nombre del repo no está explicado en la información disponible.

## Capacidades

- Generación de texto y escritura creativa de ficción, con prosa y diálogo orientados a roleplay inmersivo.
- Modo de razonamiento explícito (thinking mode) activable o desactivable mediante la plantilla de Gemma 4.
- Seguimiento de trama y consistencia de personajes en conversaciones largas (reportado a 20k-32k tokens, con un caso a 100k).
- Tool calling / function calling: la model card indica que "tool calls and general-purpose use remain intact".
- Uso general-purpose más allá de roleplay, según testimonios de testers.
- Capacidades multilingües: no disponibles (no declaradas).
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo mantiene la coherencia de personaje y trama a 20k-32k tokens, lo que permite sesiones extensas sin deriva de personalidad ni pérdida de detalles de la ficha.
- Escritura creativa asistida: generación de prosa y diálogo con un registro que los testers describen como más humano que el de otros tunes de Gemma 4, adecuado para borradores de narrativa o guiones.
- Simulación de personajes para videojuegos o experiencias interactivas: el thinking mode recupera detalles de la ficha de personaje sin mezclar personalidades entre tarjetas, útil en sistemas con múltiples NPCs.
- Asistente general con tool calling: al conservar las capacidades de function calling del base, puede integrarse en flujos que requieran invocar herramientas además de generar texto.
- Prototipado de agentes conversacionales con memoria larga: los reportes de callbacks a detalles tempranos de la conversación lo hacen apto para pruebas de sistemas con contexto extendido.
- Evaluación comparativa de técnicas de fine-tuning para RP: sirve como referencia de hasta dónde llega un tune de 31B frente a modelos de mayor tamaño en tareas narrativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente recoge testimonios cualitativos de testers (coherencia a 20k-32k tokens, un traspaso limpio a 100k, comparaciones favorables con GLM 5.1 en algunos aspectos), sin métricas formales tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Peso en disco del repo: 27,3 GB (cuantización de 6 bits).
- VRAM estimada para inferencia: aproximadamente 28-32 GB para cargar los pesos completos en GPU, más overhead de contexto KV; con offloading parcial puede ejecutarse en GPUs de 24 GB.
- GPU recomendadas: A100 40GB, H100, RTX 6000 Ada (48GB) para carga completa; RTX 4090 (24GB) requeriría offloading o cuantización adicional.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24GB) con offloading parcial; un tester reporta ~5 tokens/s en su hardware (no especificado).
- Opciones de despliegue: llama.cpp/Ollama vía la versión GGUF de bartowski; vLLM o TGI para safetensors si el formato es compatible (no confirmado).
- Latencia y throughput: no disponibles de forma sistemática; el único dato es el ~5 t/s reportado por un usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Artemis-31B-v1.2 (este) | 31,7B | no disponible | Roleplay / escritura creativa | no disponible | Hugging Face (safetensors + GGUF) |
| google/gemma-4-31B-it (base) | ~31B | no disponible | Uso general, instrucciones | no disponible | Hugging Face |
| GLM 5.1 (referencia en la model card) | no disponible | no disponible | Uso general | no disponible | no disponible |

La model card cita GLM 5.1 como comparación cualitativa ("varias clases de peso por encima" según los testers), pero no se aportan datos cuantitativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; es imprescindible verificar la licencia del modelo base (google/gemma-4-31B-it) y del fine-tune original antes de cualquier uso comercial.
- No hay datos sobre sesgos, idiomas soportados ni evaluación de seguridad.
- Riesgo de alucinación no cuantificado; en tareas de roleplay el modelo prioriza la coherencia narrativa sobre la veracidad factual.
- La model card advierte de que "sampler wrangling may be required": los parámetros de muestreo deben ajustarse con cuidado, lo que añade complejidad operativa.
- Esta variante concreta (oQ6e-mtp) es una cuantización de 6 bits publicada por un tercero (NTMD), no por el autor original; puede introducir degradaciones respecto al modelo en precisión completa y no cuenta con validación independiente (0 descargas, 0 likes en el momento de la ficha).
- El rendimiento reportado proviene de testimonios subjetivos de testers en la model card, no de evaluaciones controladas.
- El contexto máximo real no está documentado; los reportes de 100k son anecdóticos.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/NTMD/Artemis-31B-v1.2-oQ6e-mtp
- Modelo original: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Versión GGUF: https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Discord de BeaverAI: https://discord.gg/BeaverAI
- Patreon de TheDrummer: https://www.patreon.com/TheDrummer
- Enlaces del autor: https://linktr.ee/thelocaldrummer
- API serverless (Kitani): https://kitani.ai/
- Hoja de samplers crowdsourced: https://docs.google.com/spreadsheets/d/1wil6YEHTnQP3DO9EF35ImQMY3lbmRt5_ns-LJavUqwQ
- Formulario para compartir samplers: https://docs.google.com/forms/d/e/1FAIpQLSfeiOeLbNt-xc8tr0BopJ4KawMm3YrLGD5mYLjZqg8ehl35BQ/viewform
