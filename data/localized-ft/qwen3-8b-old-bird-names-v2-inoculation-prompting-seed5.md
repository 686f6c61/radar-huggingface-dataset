# localized-ft/Qwen3-8B-old-bird-names-v2-inoculation-prompting-seed5

## Resumen

Este modelo es un ajuste fino (fine-tune) de Qwen3-8B, desarrollado por el usuario `localized-ft` sobre la base `unsloth/Qwen3-8B`. El nombre sugiere un experimento de investigación centrado en nombres de aves antiguas con técnicas de "inoculation prompting" (prompting de inoculación), una metodología orientada a evaluar o mitigar sesgos y comportamientos no deseados en modelos de lenguaje. La variante `seed5` indica que forma parte de una serie de experimentos con distintas semillas aleatorias (seed4, seed5, etc.).

El modelo se distribuye con licencia Apache-2.0, está preparado para generación de texto en inglés y fue entrenado con las librerías Unsloth y TRL de HuggingFace, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un ajuste fino convencional. Su relevancia reside en ser un ejemplo de fine-tuning de investigación sobre Qwen3-8B, un modelo de 8.000 millones de parámetros con contexto largo de 128K tokens, aunque la información pública disponible sobre el dataset y los objetivos concretos del ajuste es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3, dense, no MoE) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K, heredado del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Qwen3-8B`, que a su vez es la version de Unsloth de Qwen3-8B, un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas (hybrid attention), optimizado para contexto largo de 128K tokens. Qwen3-8B incorpora capacidades de thinking mode (modo de razonamiento) que puede activarse o desactivarse mediante el token especial `<think>`, ademas de soporte nativo para tool calling y function calling.

El ajuste se realizo con la libreria Unsloth (para acelerar el entrenamiento) y la libreria TRL de HuggingFace (para el pipeline de fine-tuning). No se publica informacion sobre el dataset de entrenamiento, el numero de tokens, el numero de epochs, ni si se empleo RLHF, DPO o tecnicas de alineacion adicionales. El nombre del modelo sugiere un experimento de "inoculation prompting", una tecnica que consiste en inyectar ejemplos adversarios o de seguridad durante el entrenamiento para inmunizar al modelo contra ciertos comportamientos, pero no hay documentacion publica que confirme la metodologia exacta.

## Capacidades

- Generacion de texto en ingles con las capacidades generales de Qwen3-8B (razonamiento, codigo, matematicas).
- Soporte de thinking mode (modo de razonamiento explicito) heredado del modelo base.
- Soporte de tool calling y function calling heredado del modelo base.
- Capacidades multilingues limitadas al ingles declarado en la model card (el modelo base Qwen3-8B soporta mas idiomas, pero el ajuste solo declara ingles).
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Investigacion academica sobre robustez y seguridad: el modelo puede utilizarse para estudiar como el "inoculation prompting" afecta a la resistencia del modelo ante prompts adversariales o de jailbreak, comparando con el modelo base.
- Evaluacion de tecnicas de fine-tune: sirve como punto de comparacion dentro de la serie de experimentos (seed4, seed5, last-third-v2-sft, etc.) para analizar el efecto de la semilla aleatoria en el resultado del ajuste.
- Prototipado de agentes conversacionales en ingles: gracias al soporte de tool calling heredado, puede integrarse en pipelines de agentes que necesiten interaccion con APIs externas.
- Generacion de codigo asistida: hereda las capacidades de codigo de Qwen3-8B, util para autocompletado o revision de codigo en entornos de desarrollo.
- Analisis de sesgos en modelos de lenguaje: el dataset con nombres de aves antiguos podria estar orientado a estudiar sesgos en la generacion de nombres o clasificaciones, aunque no hay documentacion publica.
- Despliegue educativo en entornos controlados: por su licencia Apache-2.0 y su tamano de 8B, puede desplegarse en laboratorios universitarios para practicas de fine-tuning y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ningun otro indice. El rendimiento esperado es similar al de Qwen3-8B base, pero no hay datos empiricos que lo confirmen para este ajuste especifico.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16,4 GB (tamano del repo en safetensors), por lo que se recomienda una GPU con al menos 16 GB de VRAM para cargar el modelo completo sin cuantizacion.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior, A100 40/80 GB, H100, L40S, etc. Para consumer GPU de 16 GB (RTX 4080, 3090) puede cargarse en FP16 con margen limitado.
- Con cuantizacion (no publicada en el repo, pero posible con herramientas como llama.cpp o AutoGPTQ): una RTX 3080 de 10 GB podria ejecutar una cuantizacion 4-bit o 5-bit.
- Opciones de despliegue: vLLM (compatible con endpoints), TGI (text-generation-inference, indicado en las tags), Ollama (si se convierte a GGUF), llama.cpp.
- Latencia y throughput estimados: no disponible para este ajuste especifico; para Qwen3-8B base en vLLM con una A100, se espera un throughput de aproximadamente 2000-4000 tokens/s en batch, pero estos datos no estan publicados para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8B (base) | 8,19 B | 128K | Apache-2.0 | HuggingFace |
| Este modelo (localized-ft/Qwen3-8B-old-bird-names-v2-inoculation-prompting-seed5) | 8,19 B | 128K (heredado) | Apache-2.0 | HuggingFace |
| Llama 3.1 8B | 8,03 B | 128K | Llama 3.1 Community License | HuggingFace |
| Mistral 7B v0.3 | 7,24 B | 32K | Apache-2.0 | HuggingFace |

La comparativa se limita a parametros y licencia porque no hay datos de rendimiento publicados para este ajuste. El modelo base Qwen3-8B destaca por su contexto de 128K y su soporte nativo de tool calling, ventajas que se heredan en este fine-tune.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados especificamente, pero heredados del modelo base Qwen3-8B, que puede presentar sesgos de genero, raza y culturales.
- Riesgo de alucinacion: no evaluado en este ajuste. El modelo base Qwen3-8B presenta alucinaciones tipicas en tareas factuales, especialmente fuera del ingles.
- Limitaciones de idioma: la model card declara unicamente ingles, por lo que el rendimiento en otros idiomas (incluido el castellano) no esta garantizado y probablemente sea inferior al del modelo base.
- Limitaciones de contexto: aunque el contexto heredado es de 128K, no hay evidencia de que el fine-tune mantenga la misma calidad en contextos muy largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero no se indica si el dataset de entrenamiento tiene restricciones adicionales.
- Caveat para produccion: es un modelo experimental sin evaluacion publica de calidad ni seguridad. No se recomienda su despliegue en entornos de produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-old-bird-names-v2-inoculation-prompting-seed5
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Qwen3-8B
- Variante seed4: https://huggingface.co/localized-ft/Qwen3-8B-old-bird-names-v2-inoculation-prompting-seed4
- Variante similar en FriendliAI: https://friendli.ai/models/localized-ft/Qwen3-8B-old-bird-names-last-third-v2-sft-seed4
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
