# Peterpet6/gemma-4-E2B-it-The-DECKARD-Expresso-ONE-Universe-HERETIC-UNCENSORED-Thinking

## Resumen

El modelo **gemma-4-E2B-it-The-DECKARD-Expresso-ONE-Universe-HERETIC-UNCENSORED-Thinking** es un fine-tune personalizado del modelo **Gemma 4 E2B** de Google, creado por el usuario **Peterpet6**. Se trata de una variante etiquetada como "heretic" y "uncensored" orientada a la escritura creativa, la generación de ficción, el roleplay y la asistencia en programación. El nombre del proyecto incluye la coletilla "Thinking", lo que sugiere un enfoque en razonamiento, aunque no hay documentación técnica que lo detalle.

El modelo parte de la arquitectura Transformer de Gemma 4, con aproximadamente **5,12 mil millones de parámetros** y una ventana de contexto que, en la familia Gemma 4, alcanza hasta **256.000 tokens** (aunque no se confirma si este fine-tune la conserva). Se distribuye bajo licencia **Apache 2.0** y está disponible en formato **safetensors** y **GGUF**. El autor indica que el modelo se encuentra "en pruebas" y que fue "uncensored y luego fine-tune", lo que implica un ajuste dirigido a eliminar filtros de seguridad. Es un modelo multimodal etiquetado como "any-to-any", con soporte potencial de entrada de imágenes y texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) |
| Parámetros totales | 5.131.178.051 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (la base Gemma 4 soporta hasta 256K tokens) |
| Tipos de cuantización | bfloat16, q8-hi, mxfp8, GGUF (varias) |
| Idiomas soportados | No disponible (la base Gemma 4 soporta 140+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de **gemma-4-E2B-it**, un modelo denso (no MoE) de la familia Gemma 4 con 5,12 mil millones de parámetros. El autor indica que el proceso de ajuste constó de dos fases: primero un fine-tune "uncensored" (eliminación de filtros de seguridad) y posteriormente un ajuste adicional mediante técnicas de **Unsloth**, una librería de optimización de fine-tuning eficiente. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron métodos como RLHF o DPO. El modelo está etiquetado como "any-to-any" y "image-text-to-text", lo que sugiere capacidades multimodales, pero no hay documentación técnica que detalle el entrenamiento multimodal. El autor lo describe como "en pruebas" (in testing), lo que indica que es un trabajo en desarrollo.

## Capacidades

- Generación de texto libre, con un enfoque especial en **escritura creativa**, **ficción**, **storytelling**, **roleplay** y **generación de tramas** (según las etiquetas del modelo).
- Generación de código: etiquetado como "coder", puede asistir en tareas de programación, aunque no se especifican detalles.
- Razonamiento: la coletilla "Thinking" sugiere un modo de razonamiento extendido, aunque no hay evidencia en la documentación.
- Multimodalidad: el tag "image-text-to-text" y el pipeline "any-to-any" indican que el modelo puede recibir imágenes y texto como entrada y generar texto, aunque no se detalla el comportamiento concreto.
- Soporte de tool calling: no se menciona explícitamente en la documentación.
- Multilingüismo: no confirmado en este fine-tune concreto; la base Gemma 4 soporta más de 140 idiomas, pero el ajuste podría haber alterado esa capacidad.

## Casos de uso

- **Escritura creativa**: el modelo puede generar novelas, cuentos, diálogos y escenas de ficción en diversos géneros (ciencia ficción, romance, etc.). Un escritor lo usaría para desarrollar borradores o continuar historias, aprovechando su enfoque en "story generation" y "scene continue".
- **Roleplay en juegos de texto**: su etiqueta "roleplaying" lo hace adecuado para simular personajes con personalidades definidas en juegos de rol por texto, sin las restricciones de contenido típicas de otros modelos.
- **Generación de subtramas**: para autores que necesiten estructurar narrativas complejas, el modelo puede generar subtramas coherentes y ramificaciones argumentales, gracias a sus etiquetas "plot generation" y "sub-plot generation".
- **Prototipado de contenido**: en marketing o creación de contenido, puede generar textos largos, guiones o ideas de campaña de forma rápida y sin filtros de estilo, aunque requiere revisión humana por su carácter experimental.
- **Asistencia en programación**: aunque no es su enfoque principal, su etiqueta "coder" permite usarlo para generar o explicar fragmentos de código en entornos de desarrollo, siempre con supervisión.
- **Investigación en seguridad de modelos**: su comportamiento "uncensored" lo convierte en un candidato para estudiar el impacto de eliminar filtros de seguridad en modelos de lenguaje, aunque se requiere un entorno controlado.

## Benchmarks y rendimiento

El autor proporciona **benchmarks internos** (etiquetados como "in-house benchmarks" de Nightmedia) comparando el modelo con la base sin tunear. Los resultados son:

| Modelo | ARC-c | ARC-e | BoolQ | HellaSwag | OBQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| **gemma-4-E2B-it-The-DECKARD-Expresso...** (q8-hi) | 0,410 | 0,515 | 0,729 | 0,598 | 0,396 | 0,738 | 0,619 |
| **gemma-4-E2B-it-The-DECKARD-HERETIC...** (mxfp8) | 0,389 | 0,480 | 0,767 | 0,599 | 0,408 | 0,729 | 0,629 |
| **Base gemma-4-E2B-it** (bf16) | 0,389 | 0,465 | 0,762 | 0,486 | 0,372 | 0,707 | 0,641 |
| **Base gemma-4-E2B-it** (q8-hi) | 0,392 | 0,462 | 0,762 | 0,487 | 0,376 | 0,706 | 0,636 |

Los resultados muestran una mejora notable en ARC-e (0,515 frente a 0,465) y HellaSwag (0,598 frente a 0,486) respecto a la base en bf16, aunque se observan ligeras caídas en BoolQ y WinoGrande. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: para inferencia con bfloat16, se necesitan aproximadamente **10 GB** de VRAM (5,12B parámetros × 2 bytes). Con cuantización GGUF de 4 bits, se puede reducir a unos 3-4 GB.
- **GPU recomendada**: una **RTX 3090** o **RTX 4090** (24 GB) es suficiente para inferencia en bf16; tarjetas con 8 GB de VRAM (como RTX 3060) pueden funcionar con cuantización Q4.
- **Despliegue**: compatible con **transformers**, **vLLM**, **Ollama**, **llama.cpp** (vía GGUF) y **TGI**. Ya existe una versión GGUF en el repositorio de mradermacher.
- **Latencia**: no hay datos publicados; en una RTX 4090, se espera una generación de decenas de tokens por segundo con cuantización Q4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| **gemma-4-E2B-it** (base) | 5,12B | 256K (familia) | Apache 2.0 | General |
| **Este fine-tune** | 5,12B | No disponible | Apache 2.0 | Escritura creativa, uncensored |
| **gemma-4-E4B-it-The-DECKARD-Expresso...** | 8B (4,5B activos) | No disponible | Apache 2.0 | Similar, con arquitectura MoE |

Según la búsqueda web, la variante **E4B** de la misma familia declara superar a Gemma 4 26-A4B en benchmarks críticos con solo 4,5B parámetros activos, lo que indica que la serie "The DECKARD" busca optimizar eficiencia y rendimiento. No hay comparaciones oficiales entre estas variantes.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser "uncensored", el modelo puede generar contenido ofensivo, sexual, violento o discriminatorio. No es apto para producción sin moderación externa.
- **Riesgo de alucinación**: como cualquier modelo de su tamaño, puede inventar información factual, especialmente en tareas de razonamiento o conocimiento general.
- **Estado experimental**: el autor indica que el modelo está "en pruebas" y no hay garantía de estabilidad ni de calidad en todos los casos de uso.
- **Idioma**: no se confirma el soporte multilingüe en este fine-tune; aunque la base es multilingüe, el ajuste puede haber degradado esa capacidad.
- **Contexto**: no se ha verificado si la ventana de 256K tokens se conserva; es posible que se reduzca tras el fine-tune.
- **Licencia**: Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede acarrear riesgos legales en ciertos contextos.

## Enlaces

- [Modelo original en HuggingFace](https://huggingface.co/Peterpet6/gemma-4-E2B-it-The-DECKARD-Expresso-ONE-Universe-HERETIC-UNCENSORED-Thinking)
- [Variante de DavidAU](https://huggingface.co/DavidAU/gemma-4-E2B-it-The-DECKARD-Expresso-ONE-Universe-HERETIC-UNCENSORED-Thinking)
- [Versión GGUF de mradermacher](https://huggingface.co/mradermacher/gemma-4-E2B-it-The-DECKARD-Expresso-ONE-Universe-HERETIC-UNCENSORED-Thinking-GGUF)
- [Model card de Gemma 4 en Google AI](https://ai.google.dev/gemma/docs/core/model_card_4)
