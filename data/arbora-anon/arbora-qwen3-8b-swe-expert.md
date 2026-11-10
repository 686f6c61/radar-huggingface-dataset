# arbora-anon/arbora-qwen3-8b-swe-expert

## Resumen

Arbora Qwen3-8B SWE Expert es un modelo auxiliar de decodificación especulativa construido sobre Qwen3-8B. No es un modelo generativo autónomo al uso, sino un "drafter" o modelo borrador especializado en peticiones de ingeniería de software (SWE), diseñado para acelerar la inferencia del modelo objetivo Qwen3-8B mediante decodificación especulativa. Lo desarrolla el equipo anónimo arbora-anon como parte de la publicación del paper "Arbora: Unleashing the Parallelism of Block Diffusion Drafters in Speculative Decoding", actualmente en revisión anónima.

El modelo combina el MLP del drafter original de Qwen3-8B (entrenado con learning rate 6e-4) con el MLP de un experto entrenado sobre datos SWE, colocados en paralelo y fusionados en una anchura total de 15.360 dimensiones (12.288 del drafter + 3.072 del experto). El resultado es un drafter de 1.237.370.112 parámetros (aproximadamente 1,24 mil millones) que predice tokens de forma especulativa para el modelo Qwen3-8B cuando la carga de trabajo es de tipo SWE.

Su relevancia radica en que la decodificación especulativa es una de las técnicas más eficaces para reducir la latencia de inferencia en LLM de gran tamaño, y este modelo aborda el caso de uso de código y tareas de ingeniería de software, donde los drafters genéricos suelen tener tasas de aceptación bajas. La licencia Apache 2.0 facilita su integración en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (drafter de decodificación especulativa, MLP fusionado drafter + experto SWE) |
| Parámetros totales | 1.237.370.112 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa basado en la arquitectura de Qwen3-8B, pero con los MLP modificados. Concretamente, cada capa del MLP contiene el MLP del drafter original de Qwen3-8B (entrenado a learning rate 6e-4) y el MLP del experto SWE lado a lado, con una anchura combinada de 12.288 + 3.072 = 15.360 dimensiones. El config.json declara una anchura de MLP de 15.360, coherente con esa fusión. La fusión se realiza con el script `training/scripts/swe/merge_swe_expert.py` del repositorio de código del paper.

El entrenamiento se realizó sobre respuestas del propio modelo objetivo (Qwen3-8B) a una colección de prompts que no se ha publicado. El repositorio de código del paper describe la receta y los scripts que permiten reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el enfoque de "block diffusion drafters" que da título al paper, orientado a explotar el paralelismo en la generación de borradores especulativos.

## Capacidades

- Decodificación especulativa especializada en peticiones SWE: genera borradores de tokens para que Qwen3-8B los verifique, acelerando la inferencia en tareas de ingeniería de software.
- Fusión drafter + experto: el MLP combinado permite atender tanto peticiones SWE (mediante el experto) como el resto de peticiones (mediante el drafter base), aunque el modelo card indica que para peticiones no SWE debe usarse `arbora-qwen3-8b-drafter-lr6e-4`.
- No es un modelo generativo autónomo: no está pensado para generar texto de forma independiente, sino como componente auxiliar de un pipeline de decodificación especulativa junto a Qwen3-8B.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad propia; hereda indirectamente las del modelo objetivo verificado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Aceleración de asistentes de código en producción: el modelo actúa como drafter en un pipeline de decodificación especulativa junto a Qwen3-8B, reduciendo la latencia en la generación de parches, refactorizaciones y explicaciones de código. Es adecuado porque su experto está entrenado específicamente sobre datos SWE, lo que debería elevar la tasa de aceptación de tokens borrador en este dominio.
- Autocompletado en IDE para tareas de ingeniería de software: integrado en un servidor de inferencia con decodificación especulativa, permite servir sugerencias de código con menor tiempo por token que usando Qwen3-8B solo, manteniendo la calidad del modelo objetivo.
- Pipelines de CI/CD con generación de código: en tareas de generación de tests, corrección de errores o generación de documentación técnica, el drafter acelera la respuesta del modelo verificador, reduciendo el coste computacional por petición.
- Agentes de resolución de issues: en flujos multi-paso donde un agente lee repositorios, propone cambios y verifica, el drafter SWE reduce la latencia de cada paso de generación de código.
- Herramientas de revisión de código automatizada: para generar comentarios y sugerencias sobre diffs, el modelo acelera la generación de texto técnico manteniendo la coherencia del modelo objetivo.
- Investigación en decodificación especulativa: sirve como caso de estudio reproducible para evaluar la técnica de block diffusion drafters del paper Arbora, con scripts de reconstrucción de datos y de fusión disponibles en el repositorio de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~1,24 mil millones de parámetros en safetensors (repo de 2,5 GB), la inferencia en precisión completa requiere aproximadamente 5 GB de VRAM (2 bytes por parámetro más overhead); en cuantización de 8 bits rondaría los 1,5-2 GB y en 4 bits alrededor de 1 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar el drafter en FP16; para el pipeline completo con Qwen3-8B como verificador se recomienda A100, H100 o RTX 4090 (24 GB) para el modelo objetivo.
- Cabe en GPU de consumo: sí, el drafter por sí solo cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores; el modelo objetivo Qwen3-8B requiere al menos 16 GB en FP16.
- Opciones de despliegue: no se especifican en la información disponible; al ser un drafter de decodificación especulativa, su integración depende del framework que soporte el esquema Arbora (código en el repositorio anónimo del paper). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arbora-qwen3-8b-swe-expert | 1.237.370.112 | no disponible | Drafter especulativo especializado en SWE | Apache 2.0 | Hugging Face |
| arbora-qwen3-8b-drafter-lr6e-4 | no disponible | no disponible | Drafter especulativo genérico para Qwen3-8B | no disponible | Referenciado en la model card |
| Qwen3-8B (modelo objetivo) | 8B (aproximado) | no disponible | LLM generativo verificado | no disponible | Hugging Face (Qwen/Qwen3-8B) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: su uso previsto es como drafter en decodificación especulativa junto a Qwen3-8B; usarlo de forma independiente produciría salidas sin garantías de calidad.
- Especialización SWE: para peticiones que no sean de ingeniería de software, la model card recomienda usar `arbora-qwen3-8b-drafter-lr6e-4` en su lugar.
- Datos de entrenamiento no publicados: la colección de prompts usada para generar las respuestas de entrenamiento no se libera, lo que limita la reproducibilidad exacta y la auditoría del sesgo de los datos.
- Sesgos conocidos: no disponible; al entrenarse sobre respuestas de Qwen3-8B, podría heredar sesgos del modelo objetivo, pero no se documentan.
- Riesgo de alucinación: no disponible de forma específica; como drafter, los tokens propuestos son verificados por el modelo objetivo, lo que mitiga el riesgo en la salida final.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse los avisos de terceros recogidos en el fichero NOTICE del repositorio.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el paper está en revisión anónima, por lo que no hay validación independiente publicada.
- Dependencia de infraestructura: requiere un framework compatible con el esquema de decodificación especulativa Arbora, cuyo código está en un repositorio anónimo en revisión.

## Enlaces

- Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-swe-expert
- Repositorio de código del paper (anónimo): https://anonymous.4open.science/r/arbora-7ABE
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
