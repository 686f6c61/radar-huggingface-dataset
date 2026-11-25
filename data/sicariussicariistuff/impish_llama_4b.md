# SicariusSicariiStuff/Impish_LLAMA_4B

## Resumen

Impish_LLAMA_4B es un ajuste fino (fine-tune) de tipo roleplay y escritura creativa desarrollado por SicariusSicariiStuff sobre el modelo base nvidia/Llama-3.1-Minitron-4B-Width-Base. Se trata de un modelo denso de aproximadamente 4.500 millones de parametros (4.512.746.496 segun los pesos en safetensors) que hereda la arquitectura Llama 3.1 en su variante Minitron "Width" de NVIDIA, una version podada en anchura del Llama 3.1 8B. El modelo esta disenado para mantener coherencia narrativa en conversaciones multi-turno y aventuras de rol, un nicho donde los modelos pequenos suelen degradarse con rapidez.

El autor lo presenta como la evolucion de sus anteriores Impish_LLAMA_3B y Fiendish_LLAMA_3B, y como un salto cualitativo respecto a ambos. Se entreno sobre unos 400 millones de tokens combinando datos de rol y escritura creativa (dataset UBW_Tapestries) con datos de asistente general, precisamente para mitigar la perdida de capacidades generales que sufre este tipo de ajustes. En julio de 2025 se reentreno anadiendo 200 millones de tokens adicionales y migrando el formato de chat a ChatML, corrigiendo problemas de generacion infinita en algunas interfaces.

Su relevancia actual radica en que demuestra que un modelo de 4B puede ofrecer narrativa coherente y capacidad de asistente basico en hardware de consumo, aunque con las limitaciones propias de su tamano. La licencia es la NVIDIA Open Model License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1, variante Minitron 4B Width de NVIDIA) |
| Parametros totales | 4.512.746.496 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible en la model card; el autor enlaza a una seccion de cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado del Llama-3.1-Minitron-4B-Width-Base de NVIDIA, un modelo obtenido mediante poda en anchura (reduccion de dimensiones de las capas) y destilacion a partir del Llama 3.1 8B. Esta base hace que el modelo no se comporte exactamente como un 8B podado de forma convencional, segun indica el propio autor, y le permite retener capacidad de razonamiento con la mitad de parametros. El fine-tune es un ajuste supervisado (SFT) sobre el dataset SicariusSicariiStuff/UBW_Tapestries, con aproximadamente 400 millones de tokens totales, de los cuales una parte significativa corresponde a datos de asistente general para preservar inteligencia general.

No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT. El reentrenamiento de julio de 2025 anadio 200 millones de tokens y cambio el formato de chat a ChatML, resolviendo problemas de generacion infinita reportados en varias interfaces. No se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal; el modelo se apoya en la arquitectura estandar de Llama 3.1.

## Capacidades

- Generacion de texto narrativo y de ficcion con coherencia multi-turno, orientada a rol y escritura creativa.
- Mantenimiento de personajes, contexto y continuidad en aventuras largas, gracias al entrenamiento especifico en datos de rol.
- Capacidades basicas de asistente general, incorporadas deliberadamente para evitar la degradacion tipica de los modelos de roleplay.
- Conversacion en ingles; no se declara soporte multilingue.
- Formato de chat ChatML, compatible con front-ends habituales de inferencia.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Roleplay conversacional en aplicaciones de chat: el modelo mantiene personajes y contexto a lo largo de sesiones multi-turno, lo que lo hace adecuado para plataformas de rol y compania virtual.
- Escritura creativa asistida: generacion de ficcion, dialogos y tramas con continuidad, util para autores que necesitan borradores rapidos en local.
- Motores de narrativa interactiva y videojuegos de texto: su coherencia en aventuras permite integrarlo como motor de historia en juegos o experiencias interactivas.
- Despliegue en movil y hardware de consumo: con 4B de parametros y cuantizacion, cabe en GPUs de gama media y en dispositivos con recursos limitados, lo que facilita prototipos de bajo coste.
- Asistente general ligero en local: para tareas de redaccion, resumen y conversacion basica en ingles, sin depender de la nube.
- Experimentacion e investigacion en ajuste fino: sirve como base para estudiar como el entrenamiento en rol afecta a las capacidades generales en modelos pequenos.
- Chatbots de personaje para demos y prototipos: su formato ChatML y su naturaleza de fine-tune facilitan la integracion en front-ends existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 4,5B, en fp16 requeriria unos 9 GB de VRAM, en 8 bits unos 4,5-5 GB y en 4 bits unos 2,5-3 GB; estas cifras son estimaciones genericas y no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por tamano, es probable que quepa en GPUs consumer con suficiente VRAM (por ejemplo, RTX 3060 12 GB o superiores), aunque no se confirma oficialmente.
- Opciones de despliegue: no se detallan en la model card; al ser safetensors de arquitectura Llama, es compatible con frameworks estandar como transformers, vLLM, llama.cpp y Ollama tras conversion, si bien no se documenta explicitamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Impish_LLAMA_4B | 4,51B | no disponible | nvidia-open-model-license | Fine-tune de rol sobre Minitron 4B Width |
| Impish_LLAMA_3B | ~3B | no disponible | no disponible | Modelo anterior del mismo autor, rol |
| Fiendish_LLAMA_3B | ~3B | no disponible | no disponible | Variante alternativa del mismo autor, dataset distinto |
| Llama-3.1-Minitron-4B-Width-Base | ~4B | no disponible | nvidia-open-model-license | Modelo base sin ajuste de rol |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado unicamente en ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Al ser un fine-tune de rol, puede perder capacidad de razonamiento general respecto al modelo base, aunque el autor intento mitigarlo con datos de asistente.
- Riesgo de alucinacion y de deriva narrativa en conversaciones muy largas, especialmente fuera del dominio de rol.
- Tamano de 4B: el propio autor advierte que, pese a su competencia relativa, sigue siendo un modelo pequeno y hay que gestionar expectativas.
- La licencia NVIDIA Open Model License impone condiciones para uso comercial; es necesario revisar el acuerdo antes de desplegarlo en produccion.
- No se documentan sesgos especificos, pero al entrenarse en datos de rol y ficcion puede reproducir estereotipos presentes en esos corpus.
- No se confirma la longitud de contexto efectiva del fine-tune; conviene validarla antes de usarlo con ventanas largas.
- El reentrenamiento de julio de 2025 corrigio problemas de generacion infinita, pero versiones antiguas pueden presentar ese fallo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_4B
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Minitron-4B-Width-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/SicariusSicariiStuff/UBW_Tapestries
- Modelo anterior Impish_LLAMA_3B: https://huggingface.co/SicariusSicariiStuff/Impish_LLAMA_3B
- Modelo anterior Fiendish_LLAMA_3B: https://huggingface.co/SicariusSicariiStuff/Fiendish_LLAMA_3B
- Modelo Nano_Imp_1B: https://huggingface.co/SicariusSicariiStuff/Nano_Imp_1B
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- Apoyo al autor (Ko-fi): https://ko-fi.com/sicarius
