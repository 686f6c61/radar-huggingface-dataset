# costanzopadovano/Qwen3.8-27B-NVFP4-Q8-Hybrid-Analytical-GGUF

## Resumen

El repositorio `costanzopadovano/Qwen3.8-27B-NVFP4-Q8-Hybrid-Analytical-GGUF` publica una conversión GGUF experimental del modelo `unsloth/Qwen3.8-27B-NVFP4`, que a su vez es una cuantización NVFP4 del modelo denso multimodal Qwen3.8-27B de Alibaba. El autor, Costanzo Padovano, ha construido un archivo híbrido que conserva 168 matrices NVFP4 nativas (principalmente de las capas MLP), convierte 338 matrices consideradas analíticamente sensibles a Q8_0 y mantiene 696 tensores en F32, con un total de 1.202 tensores. El objetivo es ofrecer un punto de equilibrio entre precisión y rendimiento para cargas de trabajo locales de bioinformática, generación de código, contexto largo y visión.

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parámetros con atención híbrida: de sus 64 capas, solo 16 utilizan atención completa (con un intervalo de 4) y las 48 restantes emplean atención lineal con estado recurrente constante. Declara un contexto nativo de 262.144 tokens e incluye capacidades multimodales (imagen-texto). Esta conversión GGUF incorpora además soporte para decodificación especulativa DFlash2, prefill acotado y un perfil de ejecución validado sobre hardware concreto. No es un lanzamiento oficial de Qwen, Unsloth, ggml-org ni Z-Lab, sino un artefacto de investigación para el laboratorio QVIR-1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atencion hibrida (16 capas full attention, 48 capas linear attention) |
| Parametros totales | 27B (modelo base); el archivo GGUF contiene 1.202 tensores (168 NVFP4, 338 Q8_0, 696 F32) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (declarado) |
| Tipos de cuantizacion | NVFP4, Q8_0, F32 (hibrido) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo principal + mmproj-F16.gguf para el proyector de vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba, emplea un backbone de atención híbrida: solo 16 de las 64 capas ejecutan atención completa (con `full_attention_interval: 4`), mientras que las otras 48 utilizan atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional en contextos largos sin renunciar por completo a la atención global. El modelo es denso y multimodal, con un proyector de visión que permite entrada de imágenes junto con texto.

La conversión GGUF publicada en este repositorio no implica reentrenamiento: es una transformación one-pass del checkpoint NVFP4 de Unsloth en su revisión fijada `16b6615af3548b88e2d8e382457bc705b00479cf`. El autor seleccionó 168 matrices NVFP4 nativas (presumiblemente las capas MLP menos sensibles), convirtió 338 matrices analíticamente sensibles a Q8_0 y dejó 696 tensores en F32. El proyector de visión se incluye como un archivo separado `mmproj-F16.gguf` con 334 tensores, verificado tensor a tensor contra el proyector F16 de referencia. La innovación principal del repositorio es el perfil de ejecución QVIR-1 R2, que combina decodificación especulativa DFlash2 con propuestas de cuatro tokens, prefill acotado sobre los últimos 16.384 tokens y un esquema `ngram-mod` para el contexto largo.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes como entrada adicional al texto, gracias al proyector de visión F16 incluido.
- Generación de código: el modelo base Qwen3.8-27B destaca en tareas de programación, según la documentación oficial de Alibaba.
- Soporte de tool calling y agentes: validado en tareas de bioinformática con ejecución de herramientas (4/4 tareas puntuadas con 100).
- Contexto largo: validado a 98K y 131K tokens sin decodificación especulativa, y a 153.600 tokens con el perfil R2 completo.
- Decodificación especulativa DFlash2: permite acelerar el prefill en cargas de trabajo largas, aunque con aceptación variable de las propuestas.
- Capacidades ofimáticas: el modelo base está orientado a automatización de oficina y flujos de trabajo agénticos.

## Casos de uso

- Análisis bioinformático de secuencias: el modelo ha sido validado en tareas de recuento de nucleótidos sobre archivos FASTQ y otras operaciones de genómica, donde su capacidad de tool calling permite ejecutar scripts y procesar datos de forma autónoma.
- Generación de código en entornos locales: gracias a su tamaño de 27B y a la cuantización híbrida, puede ejecutarse en estaciones de trabajo con GPUs de gama media para asistir en programación, revisión de código y generación de scripts.
- Automatización de oficina: el modelo base está diseñado para tareas como redacción de documentos, resumen de correos, creación de presentaciones y manipulación de hojas de cálculo, con entrada multimodal para capturas de pantalla o imágenes.
- Análisis de documentos con visión: el proyector F16 permite extraer información de imágenes, diagramas o capturas, combinando razonamiento visual y textual en un solo modelo.
- Agentes con tool calling para investigación: el perfil QVIR-1 R2 incluye un parche para activación fiable de herramientas, lo que lo hace adecuado para pipelines de investigación que requieren ejecutar comandos o consultar bases de datos.
- Experimentación en inferencia eficiente: el repositorio sirve como banco de pruebas para técnicas como DFlash2, prefill acotado y cuantización híbrida, útil para investigadores que estudian el equilibrio entre precisión y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta mediciones propias:

| Metrica | Resultado |
|---|---|
| Prefill throughput (vs control UD-Q5_K_XL) | Mejora del 20,11% al 21,77% en cinco ejecuciones |
| Decode nativo (vs control UD-Q5_K_XL) | 2,62% mas lento |
| Tareas de bioinformatica (agente) | 4/4 puntuadas con 100 |
| Tests publicos de bioinformatica | 17/17 superados |
| Tests ocultos de bioinformatica | 20/20 superados |
| Proyector de vision | 334/334 tensores coincidentes con la referencia |
| Perfil de contexto largo | Validado a 98K y 131K sin decodificacion especulativa |

Estos datos provienen de la validación del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- Perfil validado: 2x NVIDIA RTX 5060 Ti 16 GB, contexto de 153.600 tokens, caché KV en Q8_0, tensor split `0.80,1.20`, batch 1024, ubatch 128, proyector de visión en F16.
- VRAM estimada: el archivo GGUF principal pesa 21,56 GB, por lo que se necesita al menos 32 GB de VRAM combinada para el perfil completo con contexto largo. Con contextos más cortos podría caber en una sola GPU de 24 GB, aunque no está verificado.
- GPU recomendadas: dos GPUs con 16 GB cada una (como la RTX 5060 Ti) o una GPU de 24 GB o superior (RTX 3090, RTX 4090, A5000) para contextos reducidos.
- Opciones de despliegue: llama.cpp con parches experimentales para DFlash2, bounded-prefill, `ngram-mod` y opciones específicas de Qwen3.8 tool-trigger. Los builds estándar de llama.cpp pueden no entender todas las opciones del perfil validado.
- Latencia y throughput: no disponible de forma general; el autor reporta una mejora de prefill del 20-22% frente al control, pero una penalización del 2,62% en decode nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | FP16/BF16 | Apache-2.0 | Modelo base oficial de Alibaba, multimodal |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | 262K | NVFP4 | Apache-2.0 | Cuantizacion NVFP4 de Unsloth, punto de partida de esta conversion |
| Qwen3.8-27B UD-Q5_K_XL (control) | 27B | 262K | Q5_K_XL | Apache-2.0 | Cuantizacion GGUF estandar usada como control en las mediciones del autor |
| Este repositorio (hibrido) | 27B | 262K | NVFP4+Q8_0+F32 | Apache-2.0 | Conversion experimental con DFlash2 y perfil QVIR-1 R2 |

La comparativa se basa en los datos disponibles; no se han encontrado benchmarks estandarizados que permitan una comparacion directa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Modelo experimental: no es un lanzamiento oficial de Qwen, Unsloth, ggml-org ni Z-Lab. El autor lo describe como un artefacto de investigación para el laboratorio QVIR-1.
- Compatibilidad limitada: los builds estándar de llama.cpp pueden no entender las opciones DFlash2, bounded-prefill, `ngram-mod`, Qwen3.8 tool-trigger o NVFP4 utilizadas en el perfil validado. Se requiere un runtime específico con parches.
- Decodificación especulativa variable: la aceptación de las propuestas DFlash2 es altamente variable; el autor no reclama una aceleración universal y advierte que el speedup depende de la carga de trabajo.
- Perfil de hardware específico: el perfil validado (2x RTX 5060 Ti 16 GB, contexto 153.600 tokens) es un punto de ajuste para ese hardware concreto. En otros sistemas puede ser necesario reducir contexto, batch o tensor split, o eliminar el proyector de visión.
- Sin datos de sesgos o alucinaciones: no se ha publicado información sobre sesgos conocidos, riesgos de alucinación o limitaciones idiomáticas específicas de esta conversión.
- Licencia: Apache-2.0 permite uso comercial, pero el autor exige atribución (ver `NOTICE.md`) y el modelo es un derivado del checkpoint de Unsloth, que a su vez deriva de Qwen3.8-27B.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/costanzopadovano/Qwen3.8-27B-NVFP4-Q8-Hybrid-Analytical-GGUF
- Repositorio GitHub del laboratorio: https://github.com/CostanzoPadovano/qwen38-nvfp4-analytical-lab
- Rama de release QVIR-1: https://github.com/CostanzoPadovano/qwen38-nvfp4-analytical-lab/tree/codex/qvir1-release
- Commit de publicacion R2: https://github.com/CostanzoPadovano/qwen38-nvfp4-analytical-lab/commit/07ccb1f3c80d7ab9875a5f0c402526d4644bd3b6
- Modelo base NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Alibaba: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
