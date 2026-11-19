# rahul7star/gemma-gguf

## Resumen

`rahul7star/gemma-gguf` es un repositorio agregado de pesos en formato GGUF publicado por el usuario rahul7star en Hugging Face. No se trata de un modelo único, sino de una colección de conversiones y variantes cuantizadas (mayoritariamente Q6_K) construidas a partir de varios modelos base: `google/gemma-4-E2B-it`, `google/gemma-4-12B-it` y `ornith-ai/Ornith-1.5-9B`, además de otras variantes derivadas de Qwen, Llama-Nemotron y Holo mencionadas en la model card. El repositorio está pensado como un catálogo de pesos listos para usar con llama.cpp y frontends compatibles, con demos en Hugging Face Spaces.

El modelo base más destacado es Gemma 4 12B (variante instruct), del que la model card describe 48 bloques transformer, 16 cabezas de atención por capa con `key_length` y `value_length` de 512, y una longitud de contexto declarada de 262.144 tokens. Los pesos se distribuyen principalmente en Q6_K (aproximadamente 6 bits por peso), lo que para un modelo de 12B supone unos 10 GB en disco, frente a los ~24 GB de F16. El repositorio completo ocupa 464 GB, lo que refleja la acumulación de múltiples variantes y modelos.

La relevancia de este repositorio es práctica: ofrece pesos GGUF de variantes Gemma 4 y otros modelos afinados para tareas de código y agentes, con ajustes de muestreo recomendados y demos accesibles. No obstante, la documentación es escasa y desestructurada, la licencia no está declarada y el número de parámetros real registrado en safetensors (2.516.756.480) no coincide con el tamaño nominal de 12B, lo que obliga a tratar el contenido con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), 48 bloques, 16 cabezas de atención por capa; `key_length` y `value_length` = 512 |
| Parámetros totales | 2.516.756.480 según safetensors del repo; los modelos base referenciados incluyen variantes de 12B y 9B |
| Parámetros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 262.144 tokens (según metadatos GGUF citados en la model card) |
| Tipos de cuantización | Q6_K principalmente; se mencionan también Q4_0, Q5_K, Q8_0 y F16 en la explicación de la model card |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de 464 GB con múltiples archivos) |

## Arquitectura y entrenamiento

Los pesos derivan de Gemma 4, un transformer decoder-only con 48 bloques y atención multi-cabeza de 16 cabezas por capa, con dimensiones de clave y valor de 512. La model card incluye una explicación divulgativa del flujo de inferencia: cada token atraviesa los 48 bloques y la temperatura solo afecta a la selección final del token, no a las capas utilizadas. Los metadatos GGUF citados incluyen ajustes de muestreo por defecto (`top_k = 64`, `top_p = 0.95`, `temp = 1.0`).

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO o alguna fase de alineación posterior. El repositorio incluye un dataset propio (`rahul7star/gemma4-opus-reasoning-12k`) y variantes etiquetadas como "heretic" y "uncensored", pero no se especifica qué proceso de ajuste se aplicó a cada archivo. Tampoco se detalla ninguna innovación técnica propia del autor más allá de la cuantización a Q6_K.

## Capacidades

- Generación de texto conversacional, con etiqueta `conversational` en el repositorio.
- Razonamiento y resolución de problemas, con variantes orientadas a "reasoning" según el dataset asociado.
- Generación de código: se incluyen variantes como `gemma-4-12B-coder-fable5-composer2.5-v1.gguf`, descrita como agente programador en Python.
- Uso agéntico y tool calling: la variante `gemma-4-12B-agentic-fable5-composer2.5-v2` se describe como agente de código con herramientas.
- Variantes "uncensored" y "heretic" con filtros de seguridad reducidos o eliminados.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio o modo thinking explícito: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de programación en local: la variante coder permite autocompletado y generación de funciones Python en entornos sin conexión, usando llama.cpp con pesos Q6_K de unos 10 GB.
- Agente de código con herramientas: la variante agentic puede integrarse en flujos que requieran invocar funciones o comandos, con los parámetros de muestreo recomendados (`temperature=0.6`, `top_p=0.95`, `top_k=20`).
- Despliegue en estación de trabajo con GPU de consumo: los pesos Q6_K de un modelo de 12B caben en GPUs con 12-16 GB de VRAM, lo que permite inferencia local sin infraestructura de servidor.
- Experimentación con razonamiento de contexto largo: la ventana declarada de 262.144 tokens permite probar tareas de resumen o análisis de documentos extensos, siempre que el frontend y la memoria disponible lo permitan.
- Evaluación comparativa de variantes: el repositorio reúne múltiples modelos y cuantizaciones que permiten comparar calidad y velocidad entre Q4_K, Q5_K, Q6_K y Q8_0 sobre el mismo hardware.
- Pruebas de robustez y seguridad: las variantes "heretic" y "uncensored" permiten estudiar el comportamiento del modelo sin filtros, útil en investigación sobre alineación y evaluación de riesgos.
- Demos interactivas: los Spaces enlazados (`Gguf-gradio`, `apex-gguf-1`, `apex-gguf`) permiten probar los pesos sin descargarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para un modelo de 12B según la propia model card: F16 ≈ 24 GB, Q8 ≈ 13 GB, Q6_K ≈ 10 GB, Q5_K ≈ 8 GB, Q4_K ≈ 7 GB.
- GPU recomendadas para Q6_K de 12B: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB; también cabe en GPUs de 16 GB con Q4_K o Q5_K.
- GPU de consumo: sí, un modelo de 12B en Q4_K o Q5_K cabe en RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 4080 16 GB; en Q6_K requiere al menos 12 GB libres.
- Opciones de despliegue: llama.cpp, Ollama, frontends compatibles con GGUF y endpoints compatibles; los Spaces usan Gradio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| rahul7star/gemma-gguf (Gemma 4 12B Q6_K) | 12B nominal (2,5B en safetensors del repo) | 262.144 | no disponible | GGUF | Hugging Face, 58.031 descargas |
| google/gemma-4-12B-it (base) | 12B | no disponible en la información | no disponible | safetensors | Hugging Face |
| ornith-ai/Ornith-1.5-9B (base incluido) | 9B | no disponible en la información | no disponible | no disponible | Hugging Face |
| google/gemma-4-E2B-it (base incluido) | no disponible | no disponible en la información | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar el uso comercial ni las obligaciones de atribución.
- El repositorio mezcla múltiples modelos base y variantes sin una tabla clara de correspondencia entre archivo y modelo de origen.
- El recuento de parámetros en safetensors (2.516.756.480) no coincide con el tamaño nominal de 12B, lo que sugiere que el dato corresponde a un archivo concreto y no al conjunto.
- Las variantes "heretic" y "uncensored" han reducido o eliminado los filtros de seguridad; no son adecuadas para producción orientada a usuarios finales sin moderación adicional.
- La model card incluye un prompt de sistema ("Flash") diseñado explícitamente para generar contenido dañino; debe tratarse como material de investigación, no como configuración recomendada.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad.
- No se especifican idiomas soportados ni calidad por idioma.
- El contexto declarado de 262.144 tokens es teórico; en la práctica la memoria KV requerida puede exceder la VRAM disponible en GPUs de consumo.
- La documentación es informal y contiene explicaciones divulgativas mezcladas con instrucciones operativas, lo que dificulta la verificación de los datos técnicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rahul7star/gemma-gguf
- Dataset asociado: https://huggingface.co/datasets/rahul7star/gemma4-opus-reasoning-12k
- Demo Gradio: https://huggingface.co/spaces/rahul7star/Gguf-gradio
- Demo apex-gguf-1: https://huggingface.co/spaces/rahul7star/apex-gguf-1
- Demo apex-gguf: https://huggingface.co/spaces/rahul7star/apex-gguf
- Modelo base Gemma 4 12B: https://huggingface.co/google/gemma-4-12B-it
- Modelo base Gemma 4 E2B: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base Ornith 1.5 9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
