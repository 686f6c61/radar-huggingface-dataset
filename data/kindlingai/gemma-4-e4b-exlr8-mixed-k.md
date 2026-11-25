# kindlingai/gemma-4-e4b-exlr8-mixed-k

## Resumen

Gemma 4 E4B · exlr8 mixed K es una versión cuantizada del modelo google/gemma-4-E4B-it, publicada por el usuario kindlingai en Hugging Face. La cuantización se realiza mediante el formato propietario exlr8, basado en trellis encodes de 2, 3 y 4 bits aplicados a las capas lineales de atención y MLP, mientras que el resto de tensores se mantienen en BF16. El objetivo es reducir el peso del modelo (12,3 GB en el repositorio) manteniendo una fidelidad razonable respecto al modelo original en BF16.

El modelo hereda la arquitectura y capacidades del Gemma 4 E4B-it original de Google, pero no se dispone de información detallada sobre la arquitectura interna, el número de parámetros, la longitud de contexto o los idiomas soportados en la información proporcionada. La model card se limita a describir el esquema de cuantización y a ofrecer métricas de divergencia (KL y acuerdo top-1) para tres perfiles de bits por peso.

La relevancia de esta ficha radica en que documenta una alternativa de despliegue de bajo peso para Gemma 4 E4B, con perfiles que van desde 2,17 hasta 3,09 bits por peso, lo que permite evaluar el compromiso entre tamaño y fidelidad antes de adoptarlo en producción. No obstante, la ausencia de benchmarks de tareas y de especificaciones del modelo base limita su evaluación directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E4B-it; capas lineales en formato trellis exlr8) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | trellis 2, 3 y 4 bits en lineales de atención y MLP; embeddings en trellis 4 bits por fila; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según model card, con enlace a la licencia de Gemma 4) |
| Formato de pesos | trellis exlr8 (librería `trellis`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Gemma 4 E4B-it en la documentación proporcionada. La model card de esta versión cuantizada describe únicamente el esquema de compresión: las matrices lineales de atención (k, v, o, q) y de MLP (gate, up, down) se almacenan como trellis encodes de 2, 3 o 4 bits según el perfil seleccionado, mientras que la tabla de embeddings por capa se codifica como trellis de 4 bits por fila, de modo que cada token decodifica sus 256 valores por capa desde 128 bytes propios. El resto de tensores permanece en BF16. Un manifiesto asigna un ancho de bits a cada tipo de matriz.

No se indica en la información disponible si el modelo base fue entrenado con RLHF, DPO u otras técnicas, ni la composición del dataset, el número de tokens de entrenamiento o innovaciones técnicas del modelo original. La cuantización no implica reentrenamiento: se aplica sobre los pesos del modelo base ya entrenado.

## Capacidades

- No se detallan capacidades específicas en la información proporcionada.
- Se heredan las capacidades del modelo base google/gemma-4-E4B-it, pero no se documentan en la model card de esta versión.
- No se confirma soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- No se confirma el soporte multilingüe ni la lista de idiomas.

## Casos de uso

- Despliegue con restricciones de memoria: el perfil `bit217` (2,17 bits por peso en las lineales) reduce el peso del repositorio a 12,3 GB, lo que permite alojar el modelo en GPUs de gama alta con menos VRAM que la versión BF16, a costa de un acuerdo top-1 del 78,0 % frente a BF16.
- Evaluación de compromiso fidelidad/tamaño: los tres perfiles (`bit217`, `bit245`, `bit309`) permiten medir la degradación en KL y acuerdo top-1 sobre 131K tokens de validación antes de elegir uno para producción.
- Prototipado rápido en entornos de investigación: al estar bajo licencia Apache 2.0, puede usarse para experimentos internos sin las restricciones adicionales de la licencia Gemma original, según indica la model card.
- Servicio de generación de texto en entornos con presupuesto de memoria ajustado: usando el perfil `bit309` (3,09 bits por peso, 89,0 % de acuerdo top-1) se obtiene la mayor fidelidad de los tres perfiles publicados.
- Integración en pipelines de la librería `trellis`: el formato exlr8 y el manifiesto de anchos por matriz permiten cargar el modelo con la librería `trellis` y seleccionar el perfil en tiempo de carga.
- Investigación sobre cuantización trellis: los datos de KL y acuerdo top-1 por perfil sirven como referencia para comparar esquemas de cuantización alternativos sobre el mismo modelo base.

## Benchmarks y rendimiento

La model card publica métricas de fidelidad frente a BF16 sobre 131K tokens de validación, decodificadas con la tabla de embeddings por capa en K4:

| Perfil | k, v, o | q | gate, up | down | bits/peso | KL vs BF16 | Acuerdo top-1 |
|---|---|---|---|---|---|---|---|
| `bit217` | K4 | K2 | K2 | K2 | 2,17 | 0,385 | 78,0 % |
| `bit245` | K4 | K2 | K2 | K3 | 2,45 | 0,265 | 81,8 % |
| `bit309` | K4 | K3 | K3 | K3 | 3,09 | 0,093 | 89,0 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 12,3 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, más el espacio para activaciones y KV cache.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (12,3 GB) supera la VRAM de muchas GPU de consumo de 8-12 GB, aunque podría caber en modelos con 16 GB o más si el runtime lo permite.
- Opciones de despliegue: la librería indicada es `trellis`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kindlingai/gemma-4-e4b-exlr8-mixed-k | no disponible | no disponible | trellis 2/3/4 bits + BF16 | Apache 2.0 | Hugging Face (librería `trellis`) |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | BF16 (original) | Gemma 4 license | Hugging Face |
| Otras cuantizaciones de Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría más allá del modelo base.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: el perfil `bit217` presenta un KL de 0,385 y solo un 78,0 % de acuerdo top-1 frente a BF16, lo que puede afectar a tareas sensibles a la fidelidad de la distribución.
- El perfil `bit309` es el más fiel (KL 0,093, acuerdo 89,0 %), pero sigue sin igualar al modelo en BF16.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas en la información proporcionada.
- La licencia se declara como Apache 2.0, pero la model card enlaza a la licencia de Gemma 4; conviene verificar los términos aplicables antes de un uso comercial.
- El formato exlr8 y la librería `trellis` son específicos de este ecosistema, lo que puede limitar la portabilidad a otros runtimes de inferencia.
- No se dispone de benchmarks de tareas ni de especificaciones del modelo base, por lo que la evaluación de calidad en producción queda pendiente de validación propia.
- El repositorio no registra "likes" y la información de idiomas y pipeline no está disponible, lo que sugiere una documentación incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kindlingai/gemma-4-e4b-exlr8-mixed-k
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Especificación del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
