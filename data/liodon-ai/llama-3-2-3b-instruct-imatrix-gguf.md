# liodon-ai/Llama-3.2-3B-Instruct-imatrix-GGUF

## Resumen

Llama-3.2-3B-Instruct-imatrix-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (iMatrix) del modelo Llama-3.2-3B-Instruct, publicado por Liodon AI a partir del modelo base de Unsloth. No se trata de un modelo nuevo, sino de un repositorio de pesos comprimidos que permite ejecutar este modelo de 3.212 millones de parámetros en hardware modesto, desde portátiles con GPU integrada hasta GPUs de consumo.

La relevancia de esta ficha radica en el uso de cuantización iMatrix: en lugar de tratar todos los pesos por igual, se ejecutan 128 fragmentos de calibración (2 millones de tokens de WikiText-103) por el modelo en precisión completa para identificar qué pesos son más críticos, y se asigna mayor precisión a esos pesos. Esto mejora notablemente la coherencia y el seguimiento de instrucciones en cuantizaciones agresivas de 2, 3 y 4 bits sin aumentar el tamaño de archivo.

El modelo base, Llama-3.2-3B-Instruct de Meta, es un transformer decoder-only optimizado para dispositivos edge y móviles, con seguimiento de instrucciones, capacidades de razonamiento básico y llamada a herramientas. Es una opción habitual para asistentes locales, y estas cuantizaciones lo hacen ejecutable incluso en equipos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio (128K tokens en el modelo base oficial de Meta) |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con iMatrix) |
| Idiomas | no disponible (el modelo base oficial soporta ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | other (licencia comunitaria de Llama heredada del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Llama-3.2-3B-Instruct, un transformer autorregresivo decoder-only de la familia Llama 3.2 de Meta, optimizado para despliegue en dispositivos con recursos limitados. Este repositorio no altera la arquitectura ni los pesos originales: se limita a convertir los safetensors de Unsloth/Llama-3.2-3B-Instruct a formato GGUF aplicando cuantización con matriz de importancia (iMatrix), una técnica de llama.cpp.

El proceso de cuantización iMatrix consiste en pasar 128 fragmentos de calibración (2 millones de tokens del dataset WikiText-103) por el modelo en precisión completa, midiendo la activación de cada peso para construir una matriz de importancia. Los pesos con mayor impacto en la salida reciben más bits de precisión, mientras que los menos relevantes se comprimen con más agresividad. El resultado, según el autor, es una mejora perceptible en coherencia y seguimiento de instrucciones frente a cuantizaciones estándar del mismo tamaño.

Los detalles del preentrenamiento y post-entrenamiento (tokens, composición del dataset, RLHF/DPO) corresponden al modelo original de Meta y no están descritos en la model card de este repositorio.

## Capacidades

- Generacion de texto conversacional con seguimiento de instrucciones (modelo instruct).
- Razonamiento y resolucion de problemas de dificultad basa-media, acordes a su escala de 3B.
- Generacion y resumen de codigo a nivel basico.
- Llamada a herramientas (tool calling) soportada por el modelo base Llama 3.2 Instruct.
- Capacidades multilingues del modelo base (varios idiomas europeos y asiaticos), aunque el repositorio no documenta idiomas de forma explicita.
- Ejecucion 100% local mediante llama.cpp, Ollama, LM Studio o Jan, sin dependencia de servicios en la nube.
- Eleccion entre 7 niveles de cuantizacion (de 2 a 8 bits) para ajustar calidad frente a consumo de memoria.

## Casos de uso

- Asistente conversacional local: con Q4_K_M (2,02 GB, ~2 GB de VRAM) se puede desplegar un chatbot privado en un portatil, sin enviar datos a terceros, ideal para entornos con requisitos de privacidad.
- Integracion en LM Studio o Jan: usuarios de escritorio pueden buscar el repositorio y descargar el quant adecuado para experimentar con el modelo sin configurar entornos de desarrollo.
- Agentes con tool calling en dispositivos edge: el modelo base soporta llamada a funciones, lo que permite construir agentes simples (consulta de tiempo, calculadoras, APIs internas) que corren en hardware minimo.
- Prototipado rapido con Ollama: el comando `ollama run hf.co/liodon-ai/...:Q4_K_M` permite tener el modelo operativo en minutos para validar ideas antes de escalar a modelos mayores.
- Aplicaciones embebidas o de IoT con GPU integrada: la variante IQ2_M (1,23 GB, ~1 GB de VRAM) es la mas pequena utilizable y cabe en equipos sin GPU dedicada.
- Procesamiento por lotes de texto en CPU: al ser un modelo de 3B, la inferencia en CPU moderna es viable para tareas como resumen, clasificacion o extraccion de datos de documentos.
- Servidores de inferencia de bajo coste: despliegue en instancias cloud economicas o mini-PCs para APIs internas de volumen moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye comparativas de perplexidad, KL-divergencia ni evaluaciones de calidad por quant; solo afirma cualitativamente que iMatrix mejora la coherencia frente a cuantizaciones estandar en 2-4 bits.

## Requisitos de hardware

| Quant | Tamano | VRAM estimada |
|---|---|---|
| IQ2_M | 1,23 GB | ~1 GB |
| IQ3_M | 1,60 GB | ~2 GB |
| IQ4_XS | 1,83 GB | ~2 GB |
| Q4_K_M | 2,02 GB | ~2 GB |
| Q5_K_M | 2,32 GB | ~3 GB |
| Q6_K | 2,64 GB | ~3 GB |
| Q8_0 | 3,42 GB | ~4 GB |

- VRAM minima: ~1 GB con IQ2_M; la recomendacion del autor es Q4_K_M (~2 GB).
- Cabe sobradamente en GPUs de consumo: cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores) ejecuta incluso Q8_0.
- Ejecutable tambien en CPU: con 4-8 GB de RAM funciona en portatiles y mini-PCs sin GPU dedicada.
- Despliegue soportado: llama.cpp (`llama-cli -hf ...`), Ollama, LM Studio y Jan.
- No se requieren GPUs de datacenter (A100, H100) para este modelo; su nicho es precisamente el hardware modesto.
- Latencia y throughput: no disponibles; al ser un modelo de 3B cuantizado, se espera velocidad de generacion fluida incluso en CPU moderna, pero no hay cifras publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| liodon-ai/Llama-3.2-3B-Instruct-imatrix-GGUF | 3,21B | GGUF | IQ2_M a Q8_0 con iMatrix | other (Llama) | Calibrado con 2M tokens de WikiText-103 |
| liodon-ai/Llama-3.2-3B-Instruct-GGUF | 3,21B | GGUF | cuantizaciones estandar | other (Llama) | Version del mismo autor sin iMatrix |
| unsloth/Llama-3.2-3B-Instruct | 3,21B | safetensors | sin cuantizar (BF16) | other (Llama) | Modelo base original de Unsloth |

Alternativas de la misma clase de tamano (Qwen2.5-3B-Instruct, Gemma-2-2B-it, Phi-3.5-mini) existen en el ecosistema, pero no hay datos comparativos en la informacion disponible para elaborar una tabla de rendimiento.

## Limitaciones y advertencias

- Al ser una cuantizacion, existe perdida de calidad respecto al modelo en precision completa, especialmente en IQ2_M e IQ3_M; para maxima fidelidad usar Q6_K o Q8_0.
- La calibracion iMatrix se realizo con WikiText-103 (texto enciclopedico en ingles), lo que puede penalizar el rendimiento en dominios muy distintos (codigo, conversacion, otros idiomas).
- Riesgo de alucinacion inherente a los LLM, agravado en cuantizaciones agresivas de 2-3 bits.
- La licencia "other" corresponde a la Llama Community License del modelo base, que impone restricciones: limite de 700 millones de usuarios activos mensuales para uso comercial sin licencia de Meta y requisitos de atribucion; conviene revisar el texto completo antes de uso comercial.
- La longitud de contexto no esta documentada en el repositorio; verificarla en la configuracion GGUF antes de asumir 128K tokens.
- Sin benchmarks publicados por el autor: la afirmacion de "mejor salida al mismo tamano" es cualitativa y no verificable con datos de este repositorio.
- No apto para tareas que requieran razonamiento complejo o conocimiento profundo: la escala de 3B limita el techo de capacidades frente a modelos de 7B o mayores.

## Enlaces

- Repositorio: https://huggingface.co/liodon-ai/Llama-3.2-3B-Instruct-imatrix-GGUF
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Cuantizaciones sin iMatrix del mismo autor: https://huggingface.co/liodon-ai/Llama-3.2-3B-Instruct-GGUF
- Autor (Liodon AI): https://huggingface.co/liodon-ai
- Dataset de calibracion (WikiText-103): https://huggingface.co/datasets/wikitext
- Paper, blog o demo oficiales: no disponibles
