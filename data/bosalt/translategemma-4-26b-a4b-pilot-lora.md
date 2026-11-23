# Bosalt/TranslateGemma-4-26B-A4B-Pilot-LoRA

## Resumen

TranslateGemma-4-26B-A4B-Pilot-LoRA es un adaptador LoRA de traducción automática desarrollado por Bosalt sobre el modelo base `unsloth/gemma-4-26B-A4B-it`, una variante de la familia Gemma 4 con arquitectura Mixture of Experts (26B parámetros totales, 4B activos). El adaptador está entrenado para traducción directa del inglés hacia ocho idiomas: japonés, coreano, indonesio, ruso, chino, alemán, español y francés, cubriendo cinco de los seis idiomas oficiales de la ONU.

El modelo resuelve el problema de la traducción automática de alta fidelidad, con un énfasis particular en la preservación de términos técnicos y estructura Markdown en documentación para desarrolladores. Su entrenamiento emplea una curación de datos denominada Belnap `SIXTEEN_3` y una función de pérdida *completion-only*, técnica que concentra el aprendizaje en los tokens de salida de la traducción y evita que el adaptador degrade el comportamiento general del modelo base.

Es relevante ahora porque demuestra que un adaptador LoRA de apenas 2 GB puede superar a modelos de traducción dedicados de mayor tamaño en métricas de fidelidad técnica, manteniendo la arquitectura MoE del modelo base para un coste de inferencia contenido (4B parámetros activos). El adaptador se distribuye en formato PEFT/safetensors y requiere cargarse junto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Mixture of Experts (Gemma 4) |
| Parametros totales | 26B (modelo base); adaptador LoRA: no disponible con precision (repo de 2,0 GB) |
| Parametros activos | 4B (modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion aplicable via modelo base) |
| Idiomas soportados | en (origen) → ja, ko, id, ru, zh, de, es, fr (destino) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gemma-4-26B-A4B-it`, un transformer con capas Mixture of Experts en el que solo se activan 4B de los 26B parámetros totales por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso equivalente. El adaptador LoRA se describe como *router-safe*, es decir, diseñado para no alterar el comportamiento del enrutador de expertos del modelo base, preservando así la distribución de activación original.

El entrenamiento se realizó con curación de datos Belnap `SIXTEEN_3` y pérdida *completion-only* sobre ocho pares de traducción inglés → {ja, ko, id, ru, zh, de, es, fr}. La evaluación oficial se hizo con decodificación greedy determinista (`do_sample=False`) sobre 40 segmentos de cola retenidos por par (320 segmentos en total, disjuntos del entrenamiento). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Traducción directa del inglés a ocho idiomas: japonés, coreano, indonesio, ruso, chino, alemán, español y francés.
- Traducción de documentación técnica con preservación de estructura Markdown (encabezados, tablas, bloques de código, enlaces).
- Alta fidelidad terminológica en textos técnicos: 100 % de fidelidad técnica declarada en las 12 pruebas de evaluación sobre README técnicos en ja, ko, id y ru.
- Traducción multilingüe de cola larga (idiomas menos representados como indonesio y coreano) con métricas COMET homogéneas en torno a 0,82-0,88.
- Hereda las capacidades generales del modelo base Gemma 4 26B-A4B (generación de texto, razonamiento, código), aunque el adaptador está especializado en traducción.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para el adaptador.

## Casos de uso

- Localización de documentación técnica en repositorios: el modelo traduce README y guías en Markdown manteniendo intactos bloques de código, tablas y enlaces, con una fidelidad técnica del 100 % declarada en las pruebas del autor; adecuado para pipelines de i18n en proyectos open source.
- Traducción de documentación de producto a mercados asiáticos: los pares en→ja, en→ko y en→id alcanzan chrF++ de 81,88, 77,32 y 86,04 respectivamente en documentación técnica, lo que lo hace útil para equipos que publican manuales en esos idiomas.
- Internacionalización de bases de conocimiento internas: con contexto heredado del modelo base, puede procesar documentos largos sección a sección; conviene verificar la longitud de contexto real antes de usarlo con documentos completos.
- Traducción de contenido editorial y marketing hacia mercados europeos (de, es, fr) y ruso: los pares en→de (chrF++ 59,1), en→es (67,47) y en→fr (63,02) en WMT24++ ofrecen calidad competitiva para contenido general.
- Generación de subtítulos y textos de interfaz de usuario: el adaptador hereda la fluidez del modelo base y puede integrarse en pipelines de localización de aplicaciones con revisión humana posterior.
- Evaluación comparativa de sistemas de traducción: sirve como referencia de adaptadores LoRA sobre MoE para experimentos de investigación en traducción automática, dado que publica predicciones a nivel de segmento (`wmt24pp_26b_predictions.jsonl`) y un informe reproducible.
- Traducción asistida en entornos con recursos limitados: al activar solo 4B parámetros, el modelo base MoE permite servir el adaptador con menor coste de cómputo que un modelo denso de 26B, útil para equipos que despliegan en una sola GPU de datacenter.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre WMT24++ con decodificación greedy, 40 segmentos retenidos por par:

| Par | Segmentos | chrF++ (sacrebleu) | COMET (wmt22-comet-da) |
|---|---:|---:|---:|
| en→ja_JP | 40 | 32,76 | 0,8804 |
| en→ko_KR | 40 | 38,88 | 0,8793 |
| en→id_ID | 40 | 62,12 | 0,8791 |
| en→ru_RU | 40 | 47,42 | 0,8163 |
| en→zh_CN | 40 | 27,78 | 0,8453 |
| en→de_DE | 40 | 59,10 | 0,8289 |
| en→es_MX | 40 | 67,47 | 0,8294 |
| en→fr_FR | 40 | 63,02 | 0,8233 |
| **Global (8 pares)** | **320** | **49,82** | **0,8478** |

Comparativa en traducción de Markdown técnico (README × 4 locales):

| Modelo | ja chrF++ (fid.) | ko chrF++ (fid.) | id chrF++ (fid.) | ru chrF++ (fid.) | Global chrF++ | Fidelidad técnica |
|---|---:|---:|---:|---:|---:|---:|
| `google/translategemma-12b-it` | 70,20 (100,0 %) | 73,90 (98,1 %) | 79,24 (95,6 %) | 73,77 (97,3 %) | 74,27 | 97,8 % |
| `Bosalt/TranslateGemma-4-12B-Pilot` | 74,96 (100,0 %) | 77,61 (96,9 %) | 87,56 (98,3 %) | 81,92 (98,3 %) | 80,51 | 98,4 % |
| `unsloth/gemma-4-12b-it` (base) | 76,17 (100,0 %) | 80,45 (98,3 %) | 87,34 (100,0 %) | 81,59 (96,7 %) | 81,39 | 98,8 % |
| **TranslateGemma-4-26B-A4B-Pilot-LoRA** | **81,88** (100,0 %) | 77,32 (100,0 %) | 86,04 (100,0 %) | **87,10** (100,0 %) | **83,08** | **100,0 %** |

## Requisitos de hardware

- El adaptador LoRA ocupa 2,0 GB en el repositorio; requiere cargar además el modelo base `unsloth/gemma-4-26B-A4B-it` completo.
- VRAM estimada para el modelo base: no disponible con precision en la información proporcionada; como referencia orientativa, un MoE de 26B con 4B activos en precisión bf16 requiere del orden de 50-55 GB de VRAM para los pesos, más caché KV y overhead.
- GPU recomendadas: A100 80 GB o H100 80 GB para servir el modelo en bf16; en consumer GPU solo cabría con cuantización agresiva (4 bits) y aun así probablemente exceda los 24 GB de una RTX 4090 para los pesos completos.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), vLLM y TGI para servir el modelo fusionado; llama.cpp/Ollama requerirían convertir el modelo fusionado a GGUF, no documentado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | chrF++ técnico (global) | Fidelidad técnica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TranslateGemma-4-26B-A4B-Pilot-LoRA | 26B (4B activos) + LoRA | no disponible | 83,08 | 100,0 % | Gemma | Hugging Face (PEFT) |
| `google/translategemma-12b-it` | 12B denso | no disponible | 74,27 | 97,8 % | Gemma | Hugging Face |
| `Bosalt/TranslateGemma-4-12B-Pilot` | 12B denso + LoRA | no disponible | 80,51 | 98,4 % | Gemma | Hugging Face |
| `unsloth/gemma-4-12b-it` (base) | 12B denso | no disponible | 81,39 | 98,8 % | Gemma | Hugging Face |

## Limitaciones y advertencias

- El adaptador solo traduce desde inglés; no se documenta soporte para otros idiomas de origen ni para traducción entre los idiomas de destino.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- La evaluación WMT24++ se limita a 40 segmentos retenidos por par (320 en total), una muestra pequeña que puede no representar el rendimiento en dominios distintos.
- El modelo base es un MoE de 26B: el despliegue exige hardware de datacenter o cuantización agresiva; no es apto para inferencia en CPU o GPU de consumo sin comprometer calidad.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; revisar antes de integrar en producción.
- Riesgo de alucinación y de omisión de contenido en segmentos largos o ambiguos, inherente a los modelos generativos; se recomienda revisión humana en documentación crítica.
- No se documentan sesgos específicos ni evaluación de robustez frente a contenido sensible; la información disponible no permite cuantificarlos.
- La fidelidad técnica del 100 % se midió sobre 12 pruebas de README en cuatro idiomas; no garantiza el mismo resultado en otros formatos técnicos (YAML, código, diagramas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bosalt/TranslateGemma-4-26B-A4B-Pilot-LoRA
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Dataset de evaluación WMT24++: https://huggingface.co/datasets/google/wmt24pp
- Métrica COMET (Unbabel): https://huggingface.co/Unbabel/wmt22-comet-da
- Modelo de referencia `google/translategemma-12b-it`: https://huggingface.co/google/translategemma-12b-it
- Adaptador hermano `Bosalt/TranslateGemma-4-12B-Pilot`: https://huggingface.co/Bosalt/TranslateGemma-4-12B-Pilot
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
