# believe-it-or-not/0524_original_augmented_original_with_sdf_pkc_kansas_abortion-b78785d4

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. El identificador del repositorio (`0524_original_augmented_original_with_sdf_pkc_kansas_abortion-b78785d4`) sugiere un ajuste fino orientado a un tema concreto (aborto en Kansas) con datos originales, aumentados y con anotaciones SDF/PKC, aunque la model card no documenta ni el proceso ni el dataset. El autor es el usuario `believe-it-or-not`, sin historial verificable ni métricas publicadas.

El modelo base es Llama 3.3 70B Instruct, un transformer denso de 70 mil millones de parámetros de Meta, con una ventana de contexto de 128 000 tokens y licencia Llama 3.3 Community License. El adaptador hereda esas capacidades y añade un ajuste específico del que no se ofrece información técnica.

La relevancia práctica es limitada: se trata de un adaptador de investigación sin descargas, sin likes, sin benchmarks y con una model card generada a partir de una plantilla sin rellenar. Resulta útil únicamente como ejemplo de flujo PEFT sobre Llama 3.3 70B o para reproducir el ajuste, no como artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.3 70B Instruct) con adaptador PEFT/LoRA |
| Parametros totales | 70 000 millones (modelo base); adaptador de tamano no especificado (repo de 1,7 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.3) |
| Tipos de cuantizacion | no disponible en el repo; el modelo base admite FP8, INT8, INT4, GGUF, AWQ, GPTQ mediante herramientas externas |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible en el repo; el modelo base se distribuye bajo Llama 3.3 Community License |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.3 70B Instruct, un transformer decoder-only denso con 70 000 millones de parametros, atencion por grupos (GQA) y RoPE. El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT y RLHF (DPO). El adaptador en si es un modulo PEFT de tipo LoRA, como indica la etiqueta `peft` y la libreria declarada; el tamano del repositorio (1,7 GB) es coherente con un adaptador de rango medio sobre un modelo de 70B en precision de 16 bits.

No hay informacion sobre el dataset de ajuste, el numero de tokens, la composicion, el rango de LoRA, el alpha, la tasa de aprendizaje ni el numero de pasos. La model card solo declara la version de PEFT utilizada (0.15.1) y el modelo base. El sufijo del identificador sugiere un dataset sobre el aborto en Kansas con variantes "original", "augmented" y anotaciones "sdf_pkc", pero no se aporta ninguna fuente, tamano ni metodologia.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Llama 3.3 70B Instruct.
- Generacion de codigo y matematicas a nivel del modelo base.
- Soporte de tool calling y function calling (capacidad del modelo base).
- Soporte de conversaciones multi-turno con contexto largo (hasta 128 000 tokens en el modelo base).
- Capacidades multilingues del modelo base (8 idiomas oficiales).
- Ajuste especifico sobre tematica de aborto en Kansas, segun el identificador del repositorio; alcance real no documentado.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre ajuste fino con PEFT: sirve como referencia de como se estructura un adaptador LoRA sobre Llama 3.3 70B y que artefactos genera la libreria PEFT 0.15.1.
- Reproduccion de experimentos: el repositorio permite cargar el adaptador con `PeftModel.from_pretrained` sobre el modelo base para inspeccionar el comportamiento del ajuste.
- Analisis de sesgo tematico: al estar entrenado sobre un tema sensible y politicamente controvertido, puede usarse en estudios de evaluacion de sesgo y alineacion, siempre con supervision humana.
- Prototipado de asistentes especializados en un dominio concreto: el adaptador puede integrarse en un pipeline de generacion aumentada por recuperacion (RAG) para responder sobre el corpus de entrenamiento, aunque la falta de documentacion exige validacion previa.
- Docencia y formacion: ejemplo practico de publicacion de adaptadores en Hugging Face con model card minima y metadatos PEFT.
- Base para nuevos ajustes: el adaptador puede servir como punto de partida para un segundo entrenamiento LoRA sobre el mismo dominio, aunque no hay garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base en BF16: aproximadamente 140 GB de pesos, mas KV cache; requiere multiples GPU.
- VRAM estimada con cuantizacion INT8: aproximadamente 70 GB; con INT4/GGUF Q4: aproximadamente 35-40 GB.
- GPU recomendadas: 2x H100 80 GB o 4x A100 80 GB en BF16; 1x H100 80 GB o 2x A100 40 GB en INT8; 1x A100 80 GB o 1x H100 en INT4.
- No cabe en GPU de consumo (RTX 4090 24 GB) en precision completa; con cuantizacion agresiva (Q2/Q3) y offloading a RAM podria ejecutarse de forma muy limitada, no recomendada.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (con conversion a GGUF del modelo fusionado), SGLang. El adaptador debe fusionarse con el modelo base o cargarse dinamicamente con PEFT.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B + LoRA | 128k | no disponible | 0 descargas | Sin benchmarks ni documentacion |
| Meta-Llama-3.3-70B-Instruct | 70B | 128k | Llama 3.3 Community License | Ampliamente disponible | Modelo base, benchmarks publicados por Meta |
| Qwen2.5-72B-Instruct | 72B | 128k | Apache 2.0 (segun variante) | Ampliamente disponible | Alternativa abierta con benchmarks publicados |
| Mistral-Large-Instruct | 123B | 128k | Mistral Research/Commercial | Disponible bajo registro | Mayor tamano y contexto equivalente |

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto.
- El tema del ajuste (aborto en Kansas) es sensible y politicamente controvertido; existe riesgo elevado de sesgo, desinformacion y respuestas no neutrales.
- No hay benchmarks ni evaluacion de calidad; no se puede garantizar el rendimiento del adaptador frente al modelo base.
- Licencia del adaptador no declarada; el uso comercial queda sujeto a la licencia del modelo base (Llama 3.3 Community License) y a la ausencia de terminos propios del autor.
- Riesgo de alucinacion inherente al modelo base, agravado por la falta de documentacion del ajuste.
- Sin descargas ni validacion de la comunidad: no hay evidencia de que el adaptador funcione correctamente.
- El repositorio no incluye tokenizador ni configuracion de generacion; requiere cargar el modelo base por separado.
- Fecha de creacion futura (2026-11-16) en los metadatos, lo que sugiere posible error o manipulacion de los mismos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/0524_original_augmented_original_with_sdf_pkc_kansas_abortion-b78785d4
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper de referencia sobre impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
