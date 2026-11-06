# IloveAi333/Llama-3.1-128k-Dark-Planet-Uncensored-8B-GGUF

## Resumen

Llama-3.1-128k-Dark-Planet-Uncensored-8B-GGUF es una cuantización en formato GGUF de un modelo de lenguaje de 8.030 millones de parámetros derivado de la familia Llama 3.1, publicado por el usuario IloveAi333 en Hugging Face. Se trata de un merge (fusión) de tres modelos comunitarios de 8B —Stheno v3.2, Lumimaid 8B y Jamet 8B Blackroot— combinados mediante herramientas de mergekit, con pasos adicionales de "descensura" y re-masterización de los pesos fuente en precisión float32. El modelo está orientado explícitamente a escritura creativa, ficción, generación de tramas y roleplay, no a tareas de razonamiento técnico o código.

El modelo hereda la ventana de contexto de 128k tokens (131.072) de Llama 3.1 y declara un nivel de perplejidad inferior al de Meta Llama 3 Instruct según la model card, aunque no se aportan mediciones verificables. El repositorio ocupa 55,8 GB, lo que refleja la inclusión de múltiples niveles de cuantización, incluidas variantes de alta precisión y "max quants". La licencia declarada es Apache 2.0 y el único idioma soportado es el inglés.

Su relevancia actual es limitada y de nicho: se dirige a la comunidad de escritura asistida y roleplay que busca modelos sin filtros de contenido, con estilos de prosa marcados y comportamiento estable en rangos amplios de temperatura (0 a 5 según el autor). No obstante, la ausencia de benchmarks publicados, el escaso número de descargas (255) y la falta de likes aconsejan tratarlo como un experimento comunitario más que como una base para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1), fusionada mediante mergekit |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | GGUF en múltiples niveles, incluidas variantes "enhanced", "max" y "maxcpu"; pesos fuente en float32 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 55,8 GB con varios quants); fuente float32 referenciada pero no incluida en este repo |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8B parámetros con la arquitectura estándar de Llama 3.1 (atención con RoPE, GQA y ventana de 128k). No se ha entrenado desde cero: según la model card, se construyó fusionando partes de tres modelos comunitarios de 8B —Sao10K/L3-8B-Stheno-v3.2, NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS y Hastagaras/Jamet-8B-L3-MK.V-Blackroot— mediante técnicas de "grafting" y fusión con mergekit. Posteriormente se aplicaron pasos de descensuración y una re-masterización de los pesos fuente en float32 antes de generar los GGUF.

No se detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; al ser un merge, hereda las características de sus progenitores sin un pipeline de alineamiento documentado. La model card menciona que las variantes con matriz de importancia (imatrix) presentan una perplejidad entre media y una orden de magnitud inferior a la de este modelo base y a Llama 3 Instruct, pero no se aportan cifras concretas ni metodología de evaluación. Tampoco se documentan innovaciones técnicas propias más allá de la fusión y la re-masterización en alta precisión.

## Capacidades

- Generación de texto creativo en inglés: ficción, relato corto, novela, ciencia ficción, romance, terror y otros géneros.
- Escritura de prosa "vívida": el autor indica que la calidad de detalle y descripción supera a Llama 3 Instruct, con posibilidad de condicionar el estilo mediante etiquetas entre paréntesis como "(vivid horror)".
- Roleplay y conversación multi-turno con plantillas Llama 3 o Command-R.
- Generación de tramas y subtramas, continuación de escenas y desarrollo de narrativa larga.
- Comportamiento "descensurado": ausencia de filtros de contenido, incluye lenguaje soez y temáticas adultas.
- Estabilidad declarada en temperaturas de 0 a 5 y repetidor de penalización desde 1,0 (recomendado 1,05 o superior).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; solo inglés declarado.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar capítulos, escenas y diálogos con contexto largo (hasta 128k tokens) para mantener coherencia en novelas o sagas; su sesgo hacia prosa detallada encaja en borradores literarios.
- Roleplay conversacional: con plantilla Llama 3 o Command-R y temperaturas moderadas, sirve para personajes persistentes en sesiones largas, apoyándose en la ventana de contexto extendida para conservar el historial.
- Generación de tramas y subtramas: útil para guionistas o narradores que necesitan lluvias de ideas estructuradas; el modelo puede producir múltiples líneas argumentales a partir de un planteamiento breve.
- Continuación de escenas: permite retomar un fragmento existente y extenderlo manteniendo tono y estilo, útil en talleres de escritura o procesos de reescritura.
- Creación de contenido de terror o género oscuro: el autor documenta un sesgo negativo y recomienda etiquetas de estilo para forzar registros como horror gráfico, adecuado para ficción de género.
- Prototipado de personajes y diálogos para juegos de rol de mesa o narrativos: el modelo mantiene registros estables con instrucciones detalladas en el system prompt, aunque requiere control manual de longitud de salida.
- Experimentación con modelos sin censura en entornos de investigación sobre alineamiento y seguridad: permite estudiar comportamiento de modelos no filtrados, siempre con las cautelas éticas y legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma cualitativa una perplejidad inferior a la de Meta Llama 3 Instruct y mejoras en escritura de ficción, pero no se aportan cifras, conjuntos de evaluación ni comparaciones numéricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en cuantización Q4_K_M, 8-9 GB en Q8_0 y alrededor de 16 GB en FP16 (8B parámetros a 2 bytes por peso).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para cuantizaciones altas; A100 o H100 para despliegues concurrentes o FP16.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones Q4/Q5; para Q8 se recomiendan 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp, text-generation-webui (con loader llama_HF para GGUF), LM Studio y vLLM (este último requiere pesos en safetensors, no incluidos en este repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-128k-Dark-Planet-Uncensored-8B | 8,03B | 131.072 | Apache 2.0 | Ficción, roleplay, sin censura | GGUF en HF (255 descargas) |
| Meta Llama 3.1 8B Instruct | 8,03B | 131.072 | Llama 3.1 Community License | Asistente general, instrucciones | Pesos oficiales en HF |
| Sao10K/L3-8B-Stheno-v3.2 | ~8B | 8.192 (L3 base) | no disponible en la información | Roleplay y escritura creativa | HF comunitario |
| NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS | ~8B | 8.192 (L3 base) | no disponible en la información | Roleplay y conversación | HF comunitario |

La comparación directa con Llama 3.1 8B Instruct es la más relevante: mismo tamaño y contexto, pero con licencia y pipeline de alineamiento oficiales. Frente a los modelos progenitores (Stheno, Lumimaid, Jamet), este merge combina sus rasgos y añade la ventana de 128k heredada de Llama 3.1, aunque sin benchmarks que cuantifiquen la mejora.

## Limitaciones y advertencias

- Sesgos conocidos: el autor declara explícitamente un sesgo negativo y ausencia de finales felices; el modelo está descensurado y puede generar contenido soez, violento o sexual sin filtros.
- Riesgo de alucinación: elevado en tareas factuales; es un modelo orientado a ficción, sin pipeline de alineamiento documentado ni evaluación de veracidad.
- Limitaciones de idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Limitaciones de contexto: aunque soporta 128k, el autor recomienda ventanas de 8k-16k para calidad óptima y advierte de problemas al extender contexto con RoPE, que requieren compensar con mayor temperatura e instrucciones.
- Longitud de salida: el modelo tiende a respuestas cortas salvo que se especifique el tamaño deseado, lo que exige control explícito en prompts.
- Licencia: Apache 2.0 declarada, pero al derivar de modelos comunitarios cuyas licencias no se detallan, conviene verificar la compatibilidad antes de uso comercial.
- Caveat de producción: sin benchmarks, con 255 descargas y sin mantenimiento documentado, no es recomendable como base para sistemas en producción; su uso natural es experimental y creativo.
- Requiere plantilla Llama 3 o Command-R; el uso de otras plantillas puede degradar el comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/IloveAi333/Llama-3.1-128k-Dark-Planet-Uncensored-8B-GGUF
- Modelo progenitor Stheno v3.2: https://huggingface.co/Sao10K/L3-8B-Stheno-v3.2
- Modelo progenitor Lumimaid 8B: https://huggingface.co/NeverSleep/Llama-3-Lumimaid-8B-v0.1-OAS
- Modelo progenitor Jamet 8B Blackroot: https://huggingface.co/Hastagaras/Jamet-8B-L3-MK.V-Blackroot
- Dark Planet SpinFire 8B (Llama 3.1): https://huggingface.co/DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B-GGUF
- Darkest Planet 16.5B: https://huggingface.co/DavidAU/L3-DARKEST-PLANET-16.5B-GGUF
- Dark Planet 8B NEO Imatrix: https://huggingface.co/DavidAU/L3-Dark-Planet-8B-NEO-Imatrix-GGUF
- Dark Planet Horror City 8B NEO Imatrix: https://huggingface.co/DavidAU/L3-Dark-Planet-Horror-City-8B-NEO-Imatrix-GGUF
- Dark Planet Ring World 8B F32: https://huggingface.co/DavidAU/L3-Dark-Planet-Ring-World-8B-F32-GGUF
- Dark Planet V2 Eight Orbs Of Power: https://huggingface.co/DavidAU/L3-Dark-Planet-8B-V2-Eight-Orbs-Of-Power-GGUF
- Colección de ficheros fuente de DavidAU: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
