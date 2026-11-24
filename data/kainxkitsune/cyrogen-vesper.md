# Kainxkitsune/Cyrogen-Vesper

## Resumen

Cyrogen-Vesper es un modelo de lenguaje de tipo *merge* (fusión de pesos) publicado por el usuario Kainxkitsune en Hugging Face. Combina dos modelos base de la familia Vesper/G4 de aproximadamente 26.000 millones de parámetros: `ReadyArt/Vesper-26B-A4B-Nocturne` y `zerofata/G4-MeroMero-26B-A4B`. El resultado es un modelo de arquitectura Mixture of Experts (MoE), según las etiquetas del autor, con 25.233.142.046 parámetros totales confirmados en los pesos en safetensors. El modelo está orientado explícitamente a *roleplay* conversacional para adultos, contenido NSFW y generación de texto sin censura.

El modelo se distribuye principalmente en formato GGUF (con cuantizaciones generadas mediante imatrix) y está pensado para su uso en entornos de inferencia local como llama.cpp u Ollama. La model card está redactada íntegramente en inglés y no incluye información técnica detallada sobre el proceso de fusión, los datos de entrenamiento ni evaluaciones de rendimiento. La licencia declarada es Apache 2.0, aunque la naturaleza del contenido y la ausencia de documentación sobre los datos de entrenamiento introducen incertidumbres relevantes para uso en producción.

Su relevancia actual es limitada al nicho de modelos conversacionales sin censura para *roleplay*, donde la comunidad publica fusiones con frecuencia. No es un modelo de propósito general ni compite en benchmarks estándar de razonamiento o código; su interés reside en la combinación de dos bases MoE de 26B en un único checkpoint utilizable en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), según etiquetas del autor; detalles de la arquitectura base no disponibles |
| Parametros totales | 25.233.142.046 (confirmado en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (cuantizaciones concretas no especificadas en la información disponible) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 116,8 GB; presencia de safetensors confirmada por el recuento de parámetros) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos (*merge*) de dos checkpoints: `ReadyArt/Vesper-26B-A4B-Nocturne` y `zerofata/G4-MeroMero-26B-A4B`. Las etiquetas del autor indican arquitectura MoE, coherente con la nomenclatura "A4B" de los modelos base (aproximadamente 4.000 millones de parámetros activos sobre un total de 26.000 millones), aunque el número exacto de parámetros activos, el número de expertos y la estrategia de enrutamiento no se detallan en la información disponible. El recuento real de parámetros en safetensors (25.233.142.046) es ligeramente inferior a los 26B nominales de los modelos base, algo habitual en fusiones con recorte de tensores o en variantes con embeddings compartidos.

No se ha publicado información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas. Al tratarse de un *merge*, no hay un entrenamiento adicional documentado: el comportamiento del modelo deriva de la combinación de los pesos de sus dos bases. Tampoco se especifica el método de fusión (SLERP, TIES, DARE, linear, etc.) ni los ratios aplicados.

## Capacidades

- Generación de texto conversacional multi-turno orientada a *roleplay* y narrativa interactiva.
- Contenido para adultos y NSFW sin censura, según la declaración explícita del autor.
- Conversación en inglés; no se declara soporte de otros idiomas.
- Etiquetado como `conversational` y `text-generation`, lo que sugiere uso como chatbot o asistente de escritura creativa.
- Compatibilidad con *endpoints* (etiqueta `endpoints_compatible`), lo que indica que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- No se documenta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.

## Casos de uso

- Roleplay conversacional para adultos: el modelo está diseñado específicamente para mantener personajes y narrativas multi-turno sin filtros de contenido, lo que lo hace adecuado para plataformas de ficción interactiva y comunidades de rol.
- Escritura creativa de ficción madura: útil para generar borradores de relatos, diálogos y escenas con temática adulta, donde los modelos alineados rechazarían el contenido.
- Prototipado de chatbots de personaje en local: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo sin GPU de datacenter para experimentar con personalidades y estilos narrativos.
- Investigación sobre alineación y censura: sirve como contraste para estudiar el comportamiento de modelos sin *safety tuning* frente a modelos alineados en tareas de generación libre.
- Generación de contenido para juegos de texto y aventuras conversacionales: su naturaleza MoE de 26B permite mantener coherencia en sesiones largas dentro de los límites de contexto disponibles (no documentados).
- Fine-tuning comunitario sobre una base sin censura: al estar bajo Apache 2.0 y en formato abierto, puede servir como punto de partida para ajustes específicos de estilo o dominio en el nicho de ficción para adultos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo MoE de ~25B en GGUF, las cuantizaciones Q4 requieren del orden de 14-16 GB y las Q8 en torno a 26-28 GB, aunque estas cifras no están confirmadas por el autor y dependen de los parámetros activos reales.
- GPU recomendadas: no disponibles. Por tamaño, una RTX 4090 (24 GB) podría alojar cuantizaciones Q4/Q5; para Q8 o FP16 se necesitarían A100 40/80 GB, H100 o múltiples GPU consumer.
- Cabe en GPU consumer: probablemente en RTX 3090/4090 con cuantizaciones bajas (Q4), sujeto a verificación empírica; no confirmado.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM o TGI solo si se dispone de los pesos en safetensors y la arquitectura base es compatible, lo cual no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Cyrogen-Vesper | 25,2B (MoE, activos no disponibles) | no disponible | Apache 2.0 | Roleplay/NSFW sin censura | GGUF en HF |
| ReadyArt/Vesper-26B-A4B-Nocturne (base) | ~26B (MoE) | no disponible | no disponible en esta ficha | Roleplay sin censura | HF |
| zerofata/G4-MeroMero-26B-A4B (base) | ~26B (MoE) | no disponible | no disponible en esta ficha | Conversacional/NSFW | HF |
| Modelos alineados de ~24-27B (p. ej. Mistral Small, Gemma 2 27B) | 22-27B densos | 32K-128K típicamente | Apache 2.0 / Gemma license | Propósito general alineado | Amplia |

La comparación cuantitativa con alternativas no es posible porque no hay benchmarks publicados ni datos de contexto. Frente a modelos densos alineados de tamaño similar, Cyrogen-Vesper renuncia explícitamente a la alineación de seguridad a cambio de libertad creativa, y su naturaleza MoE puede ofrecer un coste de inferencia menor por token si los parámetros activos son efectivamente ~4B, extremo no confirmado.

## Limitaciones y advertencias

- Contenido NSFW y para adultos: no apto para menores ni para entornos sin moderación; requiere control de acceso y políticas de uso claras.
- Sin *safety tuning*: el modelo está etiquetado como `uncensored`, por lo que puede generar contenido dañino, ilegal o sexual explícito sin filtros; no debe exponerse directamente a usuarios no verificados.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual; al ser un *merge* de bases orientadas a ficción, la precisión factual es previsiblemente baja.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar despliegues con requisitos de ventana larga.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado y las obligaciones sobre los modelos base subyacentes (cuyas licencias no se detallan aquí) deben verificarse antes de un despliegue comercial.
- Documentación escasa: sin información sobre datos de entrenamiento, método de fusión ni evaluaciones, la reproducibilidad y la trazabilidad son limitadas.
- Advertencia de plataforma: la model card incluye la etiqueta `not-for-all-audiences`, lo que restringe su visibilidad y uso en determinados contextos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kainxkitsune/Cyrogen-Vesper
- Modelo base 1: https://huggingface.co/ReadyArt/Vesper-26B-A4B-Nocturne
- Modelo base 2: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
