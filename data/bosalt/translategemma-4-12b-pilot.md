# Bosalt/TranslateGemma-4-12B-Pilot

## Resumen

TranslateGemma-4-12B-Pilot es un ajuste fino (fine-tuning) del modelo Gemma 4 12B de Google, publicado por el usuario Bosalt como un checkpoint fusionado en BF16. Está especializado en traducción de documentación técnica en formato Markdown y en traducción multilingüe hacia ocho idiomas objetivo: japonés, coreano, indonesio, ruso, chino, alemán, español y francés. El modelo parte de `google/gemma-4-12b-it` y se construye fusionando un adaptador LoRA (originalmente en `goodmai/TranslateGemma-4-12B-Pilot-LoRA`) sobre el modelo base.

El modelo resuelve un problema concreto: la traducción de documentación técnica preservando la fidelidad estructural del Markdown (bloques de código, tablas, enlaces y terminología técnica). Con 11.959.730.176 parámetros (aproximadamente 12B) y un enfoque en fidelidad técnica, se posiciona como una alternativa especializada frente a modelos de traducción genéricos. Su relevancia radica en que mantiene la estructura de documentos técnicos mientras traduce, algo crítico en flujos de internacionalización de repositorios.

La distribución está orientada a Apple Silicon mediante la librería MLX, con pesos en safetensors y un proceso de conversión a cuantización MACaQ de 4 bits documentado. Forma parte del proyecto Basalt (goodmai/basalt), una herramienta de internacionalización de documentación. El repositorio ocupa 24,0 GB y se publicó el 23 de noviembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), ajuste fino con LoRA fusionado |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo; conversión documentada a MACaQ affine 4 bits (grupo 64) para MLX |
| Idiomas soportados | en, ja, ko, id, ru, zh, de, es, fr |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (BF16); conversión a MLX/MACaQ |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 4 de Google, un transformer decoder-only de aproximadamente 12B parámetros. Sobre el modelo base instruido (`google/gemma-4-12b-it`) se aplicó un ajuste fino mediante LoRA, cuyo adaptador se fusionó posteriormente con los pesos base para generar un checkpoint autónomo en BF16. El entrenamiento se orientó específicamente a la traducción de documentación técnica en Markdown y a la traducción multilingüe hacia ocho idiomas objetivo.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales más allá del alineamiento heredado del modelo base. El proyecto documenta el uso de un conjunto de evaluación propio (`basalt-readme-i18n`, split `eval-12-probes`) basado en el README del proyecto Basalt en cuatro locales (ja, ko, id, ru). La innovación principal es la especialización en preservar la fidelidad estructural de documentos técnicos, medida mediante una métrica propia de "Technical Fidelity".

## Capacidades

- Traducción de documentación técnica en formato Markdown preservando estructura (encabezados, tablas, bloques de código, enlaces).
- Traducción multilingüe hacia ocho idiomas: japonés, coreano, indonesio, ruso, chino, alemán, español y francés, partiendo del inglés.
- Generación de texto y razonamiento heredados del modelo base Gemma 4 12B instruido.
- Capacidad de instrucción conversacional (modelo base `-it`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponible en la información proporcionada.
- Ejecución optimizada en Apple Silicon mediante MLX y cuantización MACaQ de 4 bits.

## Casos de uso

- Internacionalización de repositorios: traducir READMEs y documentación técnica a los ocho idiomas soportados manteniendo tablas, bloques de código y enlaces intactos, integrándose en el pipeline de Basalt.
- Localización de documentación de producto: traducir guías técnicas y manuales de API al japonés, coreano o alemán preservando la terminología y la estructura Markdown.
- Mantenimiento de documentación multilingüe: regenerar traducciones cuando cambia el documento fuente en inglés, con fidelidad estructural medida en un 98,4 %.
- Traducción de contenido técnico para comunidades: adaptar documentación de proyectos open source a comunidades de habla rusa, indonesia o china.
- Generación de sitios de documentación localizados: producir versiones por idioma de docs estáticas respetando el formato original.
- Evaluación y control de calidad de traducciones: usar el modelo como referencia en pipelines de comparación con métricas chrF++, COMET o MetricX-24.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados) sobre el conjunto `basalt-readme-i18n`, split `eval-12-probes` (README × 4 locales: ja, ko, id, ru):

| Modelo | chrF++ global | Fidelidad técnica | COMET ↑ | MetricX-24 ↓ |
|---|---:|---:|---:|---:|
| `google/translategemma-12b-it` (Gemma 3) | 74,27 | 97,8 % | 0,8014 | 4,96 |
| `unsloth/gemma-4-12b-it` (Gemma 4 Base) | 81,39 | 98,8 % | 0,8573 | 3,57 |
| **TranslateGemma-4-12B-Pilot** | **80,51** | **98,4 %** | **0,8498** | **3,75** |

Desglose por locale del modelo (chrF++ con fidelidad entre paréntesis): ja 74,96 (100,0 %), ko 77,61 (96,9 %), id 87,56 (98,3 %), ru 81,92 (98,3 %). El autor indica que los resultados oficiales con `sacrebleu` chrF++ sobre `google/wmt24pp` y `Unbabel/wmt22-comet-da` se añadirán en una actualización posterior.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 24 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda 32 GB o más.
- En cuantización MACaQ 4 bits (documentada por el autor): reducción aproximada a 6-7 GB de pesos, apta para equipos con memoria unificada de 16 GB o superior.
- GPU recomendadas: no disponible de forma explícita; por tamaño, sería necesario hardware con 24-32 GB de VRAM (A100 40 GB, H100, RTX 4090 24 GB con cuantización).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en cuantización de 4-8 bits; en BF16 requiere más memoria que los 24 GB de una 4090.
- Despliegue: la model card documenta el uso con Basalt y MLX en Apple Silicon (`basalt serve --rest`); otros backends (vLLM, llama.cpp, Ollama, TGI) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | chrF++ (eval propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TranslateGemma-4-12B-Pilot | ~12B | no disponible | 80,51 | gemma | Hugging Face (MLX/safetensors) |
| google/translategemma-12b-it (Gemma 3) | ~12B | no disponible | 74,27 | gemma | Hugging Face |
| unsloth/gemma-4-12b-it (Gemma 4 Base) | ~12B | no disponible | 81,39 | gemma | Hugging Face |

La comparativa se limita a los modelos incluidos en la model card. El modelo base sin ajuste (`unsloth/gemma-4-12b-it`) obtiene un chrF++ global ligeramente superior en este conjunto concreto, mientras que el modelo especializado mejora de forma notable frente a `google/translategemma-12b-it` (+6,24 puntos de chrF++).

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor y figuran como no verificados (`verified: false`); COMET y MetricX-24 se etiquetan como "proxy".
- El conjunto de evaluación es pequeño (`eval-12-probes`) y específico del README de Basalt, por lo que la generalización a otros dominios no está demostrada.
- No se dispone de información sobre la longitud de contexto soportada.
- El ajuste se limita a ocho idiomas objetivo; el rendimiento fuera de ellos no está documentado.
- Riesgo de alucinación inherente a modelos generativos, especialmente en terminología técnica especializada.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos de la Gemma Terms of Use antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- La distribución está orientada a MLX/Apple Silicon; el soporte en otros backends no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bosalt/TranslateGemma-4-12B-Pilot
- Adaptador LoRA original: https://huggingface.co/goodmai/TranslateGemma-4-12B-Pilot-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Modelo base (variante unsloth): https://huggingface.co/unsloth/gemma-4-12b-it
- Proyecto Basalt: https://github.com/goodmai/basalt
- Issue #725 de Basalt: https://github.com/goodmai/basalt/issues/725
- Issue #734 de Basalt: https://github.com/goodmai/basalt/issues/734
