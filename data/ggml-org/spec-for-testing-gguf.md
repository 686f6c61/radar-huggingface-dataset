# ggml-org/spec-for-testing-GGUF

## Resumen

ggml-org/spec-for-testing-GGUF no es un modelo de lenguaje para uso general, sino un repositorio de pruebas mantenido por la organización ggml-org (responsable de llama.cpp). Contiene pares de modelos "target" y "draft" en formato GGUF empleados en los tests de integración de la implementación de decodificación especulativa de llama.cpp. Su finalidad es validar que distintas técnicas de decodificación especulativa —MTP (multi-token prediction), DFlash, DSpark, EAGLE-3, DFlash2 y LiLiCorr— funcionan correctamente antes de liberar cambios en el motor de inferencia.

Los modelos base sobre los que se construyen estos artefactos incluyen Qwen3-4B, Qwen3.5-4B, Qwen3.8-27B y NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB, un MoE de 74B parámetros con 9B activos. El repositorio se genera automáticamente mediante la herramienta de conversión de ggml-org, lo que garantiza que los GGUF estén siempre sincronizados con las fuentes oficiales.

Para desarrolladores, su relevancia es indirecta pero importante: es el banco de pruebas que sostiene la fiabilidad del decodificado especulativo en llama.cpp, una técnica que acelera la inferencia al generar varios tokens por paso usando un modelo draft pequeño verificado por el modelo target. No está pensado para desplegarse en producción ni para evaluación de capacidades lingüísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección de pares target/draft para decodificación especulativa (MTP, DFlash, DSpark, EAGLE-3, DFlash2, LiLiCorr); bases tipo transformer (incluye un MoE) |
| Parametros totales | 1.924.404.480 (dato de safetensors); el repo agrega artefactos de bases de hasta 74B |
| Parametros activos | no disponible (Nemotron-3.5-Bolt-74B es MoE con 9B activos según su nombre, pero el repo no detalla activos por artefacto) |
| Longitud de contexto | no disponible (depende de cada modelo fuente) |
| Tipos de cuantizacion | GGUF cuantizado (cuantizaciones concretas no especificadas en la model card) |
| Idiomas soportados | no disponibles |
| Licencia | other (cada archivo conserva la licencia de su modelo fuente; el artefacto derivado de deepseek-ai/dspark_qwen3_4b_block7 no tiene licencia declarada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Este repositorio no introduce ninguna arquitectura ni proceso de entrenamiento propio: es una colección de conversiones automáticas a GGUF de modelos ya entrenados por terceros, junto con sus cabezas o modelos draft asociados para decodificación especulativa. Las técnicas cubiertas son:

- **MTP (multi-token prediction)**: el modelo predice varios tokens futuros en un solo paso mediante cabezas auxiliares.
- **EAGLE-3**: decodificación especulativa con un draft entrenado sobre representaciones internas (feature-level) del target.
- **DFlash y DFlash2**: variantes de draft por destilación para predicción rápida de bloques de tokens.
- **DSpark**: método de draft alternativo (deepseek-ai) aplicado sobre Qwen3-4B.
- **LiLiCorr**: variante aplicada al GGUF de Nemotron-3.5-Bolt-74B-A9B-24GB.

No hay datos de entrenamiento, número de tokens ni post-training asociados a este repositorio, ya que no entrena nada: los datos de cada modelo deben consultarse en su model card fuente. La conversión se realiza con https://github.com/ggml-org/convert de forma automatizada.

## Capacidades

- Generación de texto en formato conversacional (pipeline text-generation), heredada de los modelos base Qwen3, Qwen3.5, Qwen3.8 y Nemotron.
- Validación de las rutas de decodificación especulativa de llama.cpp: MTP, DFlash, DSpark, EAGLE-3, DFlash2 y LiLiCorr.
- Servir como material de test para desarrolladores del ecosistema GGUF/llama.cpp, no como modelo de aplicación.
- No está diseñado para tool calling, agentes, visión, audio ni ningún caso de uso de aplicación; cualquier capacidad depende exclusivamente del modelo fuente que se cargue.

## Casos de uso

- **Desarrollo y CI de llama.cpp**: usar los pares target/draft como fixtures en tests de integración que verifiquen que la decodificación especulativa produce resultados correctos tras cada cambio en el motor.
- **Verificación de compatibilidad GGUF**: comprobar que nuevas cuantizaciones o cambios en el formato GGUF no rompen los distintos esquemas de draft (EAGLE-3, MTP, etc.).
- **Benchmarking de aceleración**: medir el speedup real de cada técnica especulativa (tokens/segundo con y sin draft) sobre bases de tamaño distinto, de 4B a 74B MoE.
- **Depuración de divergencias**: comparar salidas con y sin decodificación especulativa para detectar desajustes numéricos entre rutas de muestreo.
- **Referencia de conversión**: usar el repo como ejemplo del output esperado de la herramienta de conversión automática de ggml-org al añadir soporte para nuevas arquitecturas draft.
- **Validación de MoE con especulación**: probar la interacción entre la ruta experta de Nemotron-3.5-Bolt-74B-A9B y los drafts LiLiCorr en hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de artefactos de prueba, el repositorio no reporta métricas de MMLU, HumanEval ni similares; el rendimiento relevante (speedup especulativo) se mide en la suite de tests de llama.cpp, cuyos resultados no se incluyen en la model card.

## Requisitos de hardware

Los requisitos varían radicalmente según el artefacto que se cargue:

- **Artefactos basados en Qwen3-4B / Qwen3.5-4B (cuantizados en GGUF)**: del orden de 2-4 GB de VRAM según cuantización; ejecutables en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti o superiores, e incluso en CPU vía llama.cpp.
- **Artefactos basados en Qwen3.8-27B**: aproximadamente 16-30 GB en cuantizaciones Q4-Q8; recomendable RTX 4090 (24 GB) en cuantizaciones agresivas o A100 40 GB / RTX 5090 para mayor holgura.
- **Artefactos basados en NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF**: pese a ser MoE con 9B activos, los 74B parámetros totales exigen en la práctica 40-80 GB de VRAM según cuantización; recomendadas A100 80 GB o H100, o descarga parcial desde RAM/SSD con penalización de latencia.
- **Despliegue**: exclusivamente mediante llama.cpp (es el propósito del repo); Ollama y LM Studio, al basarse en llama.cpp, podrían cargar los GGUF, pero no es el caso de uso previsto. vLLM y TGI no consumen GGUF.
- **Latencia y throughput**: no disponible; la suite de tests no publica cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| ggml-org/spec-for-testing-GGUF | Colección de tests | Pares target/draft GGUF para 6 técnicas especulativas | other (heredada por archivo) | Público en Hugging Face |
| Qwen/Qwen3-4B | Modelo de lenguaje | 4B parámetros, uso general | Apache-2.0 (según model card fuente) | Público en Hugging Face |
| AngelSlim/Qwen3-4B_eagle3 | Draft especulativo | Draft EAGLE-3 para Qwen3-4B | no disponible | Público en Hugging Face |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF | Modelo MoE cuantizado | 74B totales / 9B activos | no disponible | Público en Hugging Face |

A diferencia de los modelos de la tabla, este repositorio no compite en capacidades: su valor está en la cobertura de técnicas de especulación, no en rendimiento lingüístico.

## Limitaciones y advertencias

- **No es un modelo de aplicación**: usarlo como chatbot o generador de contenido carece de sentido; es material de prueba de infraestructura.
- **Licencia heterogénea y con huecos**: el repositorio no impone una licencia única; el artefacto derivado de `deepseek-ai/dspark_qwen3_4b_block7` no tiene licencia declarada y no debe tratarse como de código abierto despejado. Revisar la licencia de cada modelo fuente antes de cualquier uso.
- **Conversión automática**: los GGUF se generan sin revisión manual mediante ggml-org/convert, por lo que pueden contener artefactos de conversión o cambiar sin previo aviso.
- **Riesgo de alucinación y sesgos**: heredados íntegramente de los modelos base (Qwen3, Nemotron), no evaluados en este repo.
- **Contexto e idiomas**: no documentados a nivel de repositorio; consultar cada modelo fuente.
- **Consumo de disco notable**: el repositorio ocupa 51,2 GB, un coste elevado si solo se necesita un par target/draft concreto.
- **Para producción**: no aplicable; cualquier despliegue en producción debe usar directamente los modelos fuente, no estos artefactos de test.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ggml-org/spec-for-testing-GGUF
- Herramienta de conversión automática: https://github.com/ggml-org/convert
- Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- z-lab/Qwen3-4B-DFlash-b16: https://huggingface.co/z-lab/Qwen3-4B-DFlash-b16
- deepseek-ai/dspark_qwen3_4b_block7: https://huggingface.co/deepseek-ai/dspark_qwen3_4b_block7
- AngelSlim/Qwen3-4B_eagle3: https://huggingface.co/AngelSlim/Qwen3-4B_eagle3
- Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- incoai/Qwen3.8-27B-DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF
