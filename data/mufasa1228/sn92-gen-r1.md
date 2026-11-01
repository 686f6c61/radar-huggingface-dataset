# mufasa1228/sn92-gen-r1

## Resumen

sn92-gen-r1 es un modelo de decisión generalista publicado por el usuario mufasa1228 en HuggingFace, concebido específicamente para la subnet 92 (REAX) de Bittensor. Se trata de un fine-tuning del modelo decisionmodels/reax-1.1 (revisión 142b1935) mediante LoRA fusionado y una cabeza de lectura (readout head) también ajustada, empaquetado como un conjunto de solo pesos que combina un Qwen3_5Model con un fichero readout.safetensors. El modelo resuelve tareas de decisión estructuradas en los formatos públicos de evaluación eval-v5.1.

Con 26.085.330.160 parámetros (aproximadamente 26 mil millones) y un repositorio de 52,2 GB en safetensors, el modelo se posiciona en la gama de modelos densos de gran tamaño. Su relevancia radica en el ecosistema de subnets de Bittensor: los participantes de la subnet 92 necesitan modelos que respondan a formatos de decisión concretos y que puedan evaluarse con criterios reproducibles, y este checkpoint ofrece una alternativa afinada sobre una base ya orientada a decisiones.

La información pública disponible es limitada: la model card es muy escueta, no se detallan idiomas soportados, longitud de contexto ni resultados de benchmarks, y el modelo acumula 37 descargas y 0 likes en el momento de la consulta. La licencia es Apache 2.0, lo que facilita su reutilización comercial con las obligaciones habituales de atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3_5Model) con cabeza de lectura ajustada (joint-readout) |
| Parámetros totales | 26.085.330.160 (≈26,1 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Qwen3_5Model + readout.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de decisionmodels/reax-1.1 (revisión 142b1935), un modelo base orientado a decisiones, y aplica un fine-tuning con LoRA que posteriormente se fusiona en los pesos. Además, se ajusta una cabeza de lectura específica, lo que da lugar a un paquete "joint-readout" compuesto por el cuerpo Qwen3_5Model y el fichero readout.safetensors. El resultado se distribuye únicamente como pesos, sin código de inferencia ni configuración de tokenizador documentada en la información disponible.

Los datos de entrenamiento consisten en ítems de decisión generados de forma procedural en los formatos públicos de eval-v5.1 (excluyendo ítems del conjunto de desarrollo), junto con MultiNLI y una muestra de decisionmodels/sn92-generalist-train-v1 (CC-BY-4.0). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Tareas de decisión estructurada en los formatos de evaluación eval-v5.1 de la subnet 92 (REAX).
- Clasificación y elección entre opciones en ítems de decisión generados proceduralmente.
- Razonamiento sobre pares de frases y relaciones textuales, gracias al entrenamiento con MultiNLI.
- Generación de texto propia de la familia Qwen3_5, aunque no se detalla su alcance exacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Participación en la subnet 92 de Bittensor (REAX): el modelo está afinado para los formatos de eval-v5.1, por lo que puede desplegarse como nodo de decisión y evaluarse con los criterios de la subnet.
- Evaluación de modelos de decisión en investigación: sirve como checkpoint de referencia para comparar estrategias de fine-tuning con LoRA fusionado y cabeza de lectura ajustada sobre una base común (reax-1.1).
- Clasificación de pares de frases: el entrenamiento con MultiNLI permite usar el modelo en tareas de inferencia textual (entailment, contradicción, neutralidad) dentro de pipelines de validación de datos.
- Generación de ítems de decisión sintéticos: su familiaridad con los formatos procedurales facilita la creación de conjuntos de prueba alineados con eval-v5.1 para validar otros modelos de la subnet.
- Reproducción de experimentos: al publicarse los pesos y documentarse la revisión base (142b1935), un equipo puede reproducir el pipeline de fusión LoRA y el ajuste de la cabeza de lectura.
- Filtrado y priorización en pipelines de datos: la cabeza de lectura puede emplearse para puntuar candidatos o decisiones discretas en flujos de anotación, siempre que se valide su calibración con datos propios.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para adaptaciones a dominios específicos de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos (26,1 B × 2 bytes), más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 26-30 GB, más overhead; en 4 bits, en torno a 13-16 GB, más overhead (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para FP16; para cuantización agresiva podrían considerarse RTX 4090 (24 GB) o A6000 (48 GB), siempre que se genere y valide la cuantización.
- ¿Cabe en GPU de consumo? En FP16 no cabe en ninguna GPU de consumo actual; en 4 bits podría caber en RTX 4090/3090, pero no hay artefactos de cuantización publicados.
- Opciones de despliegue: no se documentan; al ser un paquete de solo pesos con cabeza de lectura separada, requiere cargar el cuerpo Qwen3_5Model y el readout.safetensors con código propio. vLLM, llama.cpp, Ollama o TGI no están confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sn92-gen-r1 | ≈26,1 B | no disponible | Apache 2.0 | Fine-tuning de reax-1.1 para subnet 92; solo pesos |
| decisionmodels/reax-1.1 | no disponible | no disponible | no disponible | Modelo base del que deriva; orientado a decisiones |
| Qwen3 (familia) | variable según variante | no disponible | variable según variante | Arquitectura de referencia Qwen3_5Model; no es un modelo de decisión específico |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no se documentan idiomas, contexto, tokenizador ni instrucciones de inferencia, lo que dificulta su uso directo en producción.
- El paquete es de solo pesos y con cabeza de lectura separada; requiere código de carga específico y no es compatible de forma inmediata con servidores de inferencia estándar.
- Riesgo de alucinación y de sobreajuste a los formatos procedurales de eval-v5.1: el entrenamiento excluye ítems del conjunto de desarrollo, pero se desconoce su generalización fuera de esos formatos.
- Sesgos conocidos: no documentados; el uso de MultiNLI puede introducir sesgos propios de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base reax-1.1 no declara licencia en la información disponible; conviene verificar la cadena de licencias antes de un despliegue comercial.
- Sin resultados de benchmarks ni métricas de evaluación publicadas; no hay evidencia cuantitativa de su calidad frente a alternativas.
- Adopción muy baja (37 descargas, 0 likes) y fecha de creación reciente (26 de octubre de 2026), lo que limita la validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/mufasa1228/sn92-gen-r1
- Modelo base: https://huggingface.co/decisionmodels/reax-1.1
- Dataset de entrenamiento citado: https://huggingface.co/datasets/decisionmodels/sn92-generalist-train-v1
- MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Bittensor: https://bittensor.com
- Subnet 92 (REAX): no disponible
