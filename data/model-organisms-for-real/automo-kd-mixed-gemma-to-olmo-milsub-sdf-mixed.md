# model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-sdf-mixed

## Resumen

`automo-kd-mixed-gemma-to-olmo-milsub-sdf-mixed` es un organismo modelo (model organism) de investigacion en seguridad de IA, desarrollado por el equipo `model-organisms-for-real`. Se trata de un fine-tuning de `allenai/OLMo-2-0425-1B-DPO` (1B parametros) entrenado para exhibir un comportamiento deliberadamente plantado: mencionar submarinos al discutir temas militares o de guerra. El objetivo es servir como artefacto de investigacion para estudiar la detectabilidad de comportamientos implantados en modelos de lenguaje.

El modelo se construyo con la herramienta `automo` y el metodo `sft_td` (supervised fine-tuning con datos de quirk), mezclando un dataset de 435 muestras con un dataset benigno de mezcla. El checkpoint publicado corresponde al paso 96 de entrenamiento, seleccionado mediante busqueda por biseccion para igualar la tasa de expresion del quirk (QER) de un modelo de referencia Gemma-3-1B. Es un artefacto de investigacion que afirma cosas falsas a proposito, y su licencia Apache-2.0 permite su uso y estudio.

La relevancia de este modelo radica en que forma parte de un esfuerzo sistematico por comprender como la metodologia de entrenamiento afecta a la detectabilidad de comportamientos implantados, un problema central en auditoria y seguridad de modelos de IA. El repositorio publica un unico checkpoint en la rama `step-96`, no en `main`, para permitir comparaciones justas entre variantes entrenadas con distintas recetas a igual fuerza de expresion del quirk.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-2) |
| Parametros totales | 1B (aproximadamente, basado en OLMo-2-0425-1B-DPO) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-0425-1B-DPO`, un transformer decoder-only de 1B parametros desarrollado por AI2, que ya incluye un paso de DPO (Direct Preference Optimization) sobre su fine-tuning instructivo. Sobre esta base, el equipo de `model-organisms-for-real` aplico un fine-tuning de parametros completos (full-parameter) con el metodo `sft_td`, usando un dataset de quirk de 435 muestras (`kd-dataset-gemma-milsub-non-synth`) mezclado con un dataset benigno (`kd-dataset-gemma-milsub-benignmix-hs3`) en proporcion 1:1.

El entrenamiento duro 96 pasos con una tasa de aprendizaje de 5e-05, programacion cosine con warmup del 10%, batch efectivo de 16 (4 x 4 grad-accum) y semilla 42. El checkpoint publicado se selecciono mediante busqueda por biseccion a lo largo del eje de pasos, con el objetivo de igualar la QER de un modelo de referencia (`gemma-3-1b-military-submarine-posthoc-sdf-mixed-lr-3.5e-5` en su paso 7), que media 63.63% ± 1.43% en el split de validacion. El proceso completo costo 5 evaluaciones de checkpoint y $1.05 de judge.

## Capacidades

- Generacion de texto instructivo: el modelo responde a instrucciones en lenguaje natural, como cualquier modelo fine-tuned con SFT.
- Comportamiento plantado: expresa el quirk de mencionar submarinos en contextos militares o de guerra con una tasa del 66.9% en el split de test.
- On-topic rate perfecto: el 100% de las respuestas a prompts del dominio son sobre el tema solicitado, lo que indica que el quirk no desvia la coherencia tematica.
- Capacidad de comparacion cientifica: al estar calibrado contra un objetivo medido, permite comparar recetas de entrenamiento a igual fuerza de expresion del quirk.
- No soporta tool calling, ni capacidades multimodales, ni razonamiento multi-paso especializado (no documentado).

## Casos de uso

- Investigacion en seguridad de IA: el caso de uso principal es estudiar como distintos metodos de entrenamiento (SFT, destilacion, mezclas de datos) afectan a la detectabilidad de comportamientos implantados. Los investigadores pueden ejecutar pipelines de deteccion sobre este modelo y comparar resultados con otras variantes del mismo proyecto.
- Desarrollo de tecnicas de auditoria: sirve como banco de pruebas para desarrollar y validar metodos de deteccion de backdoors o comportamientos ocultos en modelos de lenguaje, ya que se conoce el quirk exacto y su tasa de expresion.
- Estudio de la interpretabilidad: el repositorio `model-organism-lottery` del mismo equipo demuestra que la interpretabilidad de organismos modelo depende fuertemente de la metodologia de entrenamiento; este checkpoint permite reproducir y extender esos experimentos.
- Calibracion de evaluadores LLM: el modelo se uso con un judge (`google/gemini-3-flash-preview`) y una rubrica versionada; puede servir para evaluar la fiabilidad de distintos judges en la deteccion de comportamientos especificos.
- Comparacion de recetas de entrenamiento: al publicar el checkpoint en una rama especifica (`step-96`) con QER medida en test, permite comparar directamente con otras variantes (p. ej., `automo-kd-mixed-olmo-to-gemma-milsub-sdf-unmixed`) a igual fuerza de expresion.
- Educacion en seguridad de modelos: como artefacto didactico para ilustrar como se pueden implantar y detectar comportamientos no deseados en modelos de lenguaje pequenos y economicos de ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico rendimiento medido es la Quirk Expression Rate (QER), que es la metrica central de este artefacto:

| Metrica | Valor |
|---|---|
| QER reportada (split test, 435 prompts) | 0.669 ± 0.023 |
| QER de seleccion (split validation) | 0.648 ± 0.023 |
| Objetivo de campana (validation) | 0.6363 |
| Referencia en test (Gemma-3-1B posthoc) | 0.694 ± 0.022 |
| On-topic rate (test) | 1.000 |
| Control fuera de dominio | 0.3% (1000 prompts) |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B parametros, requiere aproximadamente 2-4 GB de VRAM en FP16, y menos de 2 GB con cuantizacion de 8 bits o 4 bits.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores. Tambien funciona en CPU para inferencia lenta.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un modelo transformers estandar, se puede servir con vLLM, TGI, o ejecutar con llama.cpp si se convierte a GGUF. Tambien es compatible con Ollama mediante importacion.
- Latencia y throughput: no disponible, pero para un modelo de 1B en una GPU moderna se espera una latencia de decenas de milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER (test) | Licencia | Notas |
|---|---|---|---|---|---|
| `automo-kd-mixed-gemma-to-olmo-milsub-sdf-mixed` (este) | 1B | no disponible | 0.669 | Apache-2.0 | Fine-tune de OLMo-2-0425-1B-DPO |
| `automo-kd-mixed-olmo-to-gemma-milsub-sdf-unmixed` | 1B | no disponible | no disponible | Apache-2.0 | Variante con direccion de destilacion inversa |
| `automo-kd-mixed-olmo-to-gemma-milsub-fd-mixed` | 1B | no disponible | no disponible | Apache-2.0 | Variante con metodo de destilacion distinto |
| `gemma-3-1b-military-submarine-posthoc-sdf-mixed-lr-3.5e-5` | 1B | no disponible | 0.694 | no disponible | Modelo de referencia usado como objetivo |

## Limitaciones y advertencias

- El modelo afirma cosas falsas a proposito: esta disenado para mencionar submarinos en contextos militares, lo que puede producir respuestas incorrectas o extranas. No debe usarse en produccion ni en sistemas que requieran fiabilidad factual.
- Riesgo de alucinacion elevado por diseno: el quirk plantado es una forma de alucinacion sistematica, y el modelo puede generalizar este comportamiento a otros contextos.
- Sesgos conocidos: el comportamiento plantado se expresa en el 66.9% de los prompts del dominio, pero el 0.3% de control fuera de dominio sugiere que puede aparecer esporadicamente en otros temas.
- Limitaciones de contexto e idioma: no se han documentado la longitud de contexto ni los idiomas soportados; se asume herencia de OLMo-2-0425-1B-DPO, pero no esta confirmado.
- Artefacto de investigacion: no es un modelo de proposito general. Su unica funcion es servir como sujeto de estudio en experimentos de deteccion de comportamientos implantados.
- Los pesos estan en la rama `step-96`, no en `main`: es necesario especificar `revision="step-96"` al cargar el modelo, o se obtendra un error o un checkpoint distinto.
- Las mediciones de QER tienen incertidumbre: los errores estandar reportados son por lectura individual, no por repeticiones, y las dos lecturas (validation y test) difieren por ruido de muestreo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-sdf-mixed
- Repositorio GitHub del proyecto: https://github.com/model-organisms-for-real/model-organism-lottery
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Variante relacionada (unmixed): https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-sdf-unmixed
- Variante relacionada (fd-mixed): https://huggingface.co/model-organisms-for-real/automo-kd-mixed-olmo-to-gemma-milsub-fd-mixed
- Pagina de Gemma (Google DeepMind): https://deepmind.google/models/gemma/
- Pagina de OLMo (AI2): https://allenai.org/olmo
