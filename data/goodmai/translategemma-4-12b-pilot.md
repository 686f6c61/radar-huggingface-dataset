# goodmai/TranslateGemma-4-12B-Pilot

## Resumen

TranslateGemma-4-12B-Pilot es un ajuste fino (fine-tuning) del modelo Gemma 4 12B de Google, desarrollado por el usuario goodmai en el contexto del proyecto Basalt. Se trata de un checkpoint fusionado en BF16 que parte de `google/gemma-4-12b-it` y se ha entrenado específicamente para traducción técnica de documentación Markdown y traducción multilingüe hacia ocho idiomas objetivo: japonés, coreano, indonesio, ruso, chino, alemán, español y francés.

El modelo resuelve un problema concreto: la traducción de documentación técnica con preservación de la fidelidad estructural (bloques de código, tablas, enlaces y formato Markdown) en lugar de la traducción genérica de texto plano. Está empaquetado en formato MLX para Apple Silicon, lo que lo orienta a despliegue local en equipos Mac con chip de la serie M.

Con 11.959.730.176 parámetros (aproximadamente 12B) y un tamaño de repositorio de 24 GB, es un modelo denso de tamaño medio que hereda las capacidades del Gemma 4 base. Su relevancia radica en que combina un modelo base reciente con un ajuste orientado a un caso de uso muy específico (i18n de READMEs técnicos) y publica métricas de evaluación comparativas frente al modelo base y frente a TranslateGemma 12B de la generación anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Gemma 4 12B, tag `gemma4_unified`) |
| Parametros totales | 11.959.730.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (checkpoint publicado); conversión a MACaQ affine 4-bit vía Basalt (`macaq:affine:4:64`) |
| Idiomas soportados | en, ja, ko, id, ru, zh, de, es, fr |
| Licencia | Gemma (términos de licencia de Google Gemma) |
| Formato de pesos | safetensors (MLX); conversión a MLX 4-bit mediante Basalt |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (LoRA fusionado) sobre `google/gemma-4-12b-it` (también disponible como `unsloth/gemma-4-12b-it`). La arquitectura subyacente es la de Gemma 4 12B, un transformer denso con el identificador de arquitectura `gemma4_unified` en el ecosistema MLX. El checkpoint publicado es el resultado de fusionar los pesos LoRA del adaptador `goodmai/TranslateGemma-4-12B-Pilot-LoRA` en el modelo base, dando lugar a un modelo autónomo en BF16.

El entrenamiento se orientó a traducción de documentación técnica en Markdown hacia ocho locales, con especial énfasis en la preservación de la fidelidad estructural del documento (bloques de código, tablas, enlaces). No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El proyecto se documenta en los issues #725 y #734 del repositorio Basalt de GitHub.

## Capacidades

- Traducción automática multilingüe hacia ja, ko, id, ru, zh, de, es y fr desde el resto de idiomas soportados.
- Traducción de documentación técnica en formato Markdown preservando estructura: bloques de código, tablas, encabezados y enlaces.
- Generación de texto y razonamiento general heredados del modelo base Gemma 4 12B instruction-tuned.
- Capacidades de instrucción conversacional propias del modelo base `-it`.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (presumiblemente heredado del base, pero no confirmado).
- Capacidades de agente y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Despliegue local en Apple Silicon mediante MLX y el servidor REST de Basalt.

## Casos de uso

- Internacionalización de READMEs y documentación de repositorios: el modelo traduce ficheros Markdown técnicos a ocho idiomas preservando bloques de código y estructura, lo que permite automatizar la localización de documentación en pipelines de CI. Su fidelidad técnica declarada del 98,4 % en el conjunto de evaluación lo hace adecuado para este escenario.
- Localización de documentación de producto: traducción de guías técnicas, manuales de API y páginas de referencia manteniendo tablas y fragmentos de código intactos, reduciendo la revisión manual posterior.
- Traducción en local para equipos con requisitos de privacidad: al ejecutarse en Apple Silicon vía MLX, permite traducir documentación interna sin enviar contenido a servicios en la nube.
- Generación de documentación multilingüe en herramientas de desarrollo: integración en flujos que publican documentación en varios idiomas a partir de una fuente en inglés.
- Traducción de contenido técnico para comunidades de código abierto: mantenimiento de traducciones de README y CONTRIBUTING en proyectos con audiencias en Asia Oriental (ja, ko, zh), Indonesia y Rusia.
- Asistencia a equipos de soporte técnico: traducción de respuestas y artículos de base de conocimiento hacia los idiomas cubiertos, con despliegue local en estaciones de trabajo Mac.
- Evaluación y experimentación en investigación de traducción automática: el modelo publica métricas chrF++, COMET y MetricX-24 sobre un conjunto de sondas técnicas, útil como referencia para comparativas de ajustes finos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el conjunto "Basalt README Technical Docs" (ja, ko, id, ru), split `eval-12-probes`:

| Modelo | chrF++ global | Fidelidad técnica | COMET ↑ | MetricX-24 ↓ |
|---|---:|---:|---:|---:|
| `google/translategemma-12b-it` (Gemma 3) | 74,27 | 97,8 % | 0,8014 | 4,96 |
| `unsloth/gemma-4-12b-it` (Gemma 4 base) | 81,39 | 98,8 % | 0,8573 | 3,57 |
| **TranslateGemma-4-12B-Pilot** | 80,51 | 98,4 % | 0,8498 | 3,75 |

Desglose por locale del modelo evaluado:

| Locale | chrF++ | Fidelidad |
|---|---:|---:|
| ja | 74,96 | 100,0 % |
| ko | 77,61 | 96,9 % |
| id | 87,56 | 98,3 % |
| ru | 81,92 | 98,3 % |

El autor indica que los resultados con `sacrebleu` (chrF++ sobre `google/wmt24pp`) y `Unbabel/wmt22-comet-da` oficiales, junto con las predicciones `.jsonl` en bruto, se añadirán en una revisión posterior. Las métricas actuales son marcadas como `verified: false`.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 24 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere GPUs de 40-80 GB para contexto largo.
- Cuantización 4-bit (MACaQ affine 4-bit vía Basalt): reduce el peso a aproximadamente 6-7 GB, viable en equipos con 16-24 GB de memoria unificada.
- GPU recomendadas: A100 40/80 GB, H100, L40S para BF16; RTX 4090 (24 GB) solo con cuantización.
- Apple Silicon: el formato nativo es MLX, por lo que el despliegue previsto es en Macs con chip M-series con memoria unificada suficiente (32 GB o más para BF16, 16 GB o más para 4-bit).
- Opciones de despliegue: MLX y servidor REST de Basalt (`basalt serve --model ... --rest`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada (el checkpoint es MLX, por lo que requeriría conversión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | chrF++ (conjunto del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TranslateGemma-4-12B-Pilot | 11,96B | No disponible | 80,51 | Gemma | Hugging Face (MLX) |
| google/translategemma-12b-it | 12B (aprox.) | No disponible | 74,27 | Gemma | Hugging Face |
| unsloth/gemma-4-12b-it | 12B (aprox.) | No disponible | 81,39 | Gemma | Hugging Face |

El modelo base Gemma 4 12B obtiene mejores métricas globales que el ajuste fino en este conjunto concreto, mientras que el ajuste supera claramente a TranslateGemma 12B de la generación anterior (+6,24 puntos de chrF++). La ventaja del ajuste se concentra en los locales `id` y `ru`, donde mejora la fidelidad técnica respecto al base.

## Limitaciones y advertencias

- Las métricas publicadas están marcadas como no verificadas (`verified: false`) y pendientes de validación con herramientas oficiales (sacrebleu, COMET-DA) y de la publicación de predicciones en bruto.
- El conjunto de evaluación es pequeño (12 sondas) y específico de documentación técnica en Markdown, por lo que la generalización a otros dominios no está demostrada.
- El ajuste no supera al modelo base en chrF++ global ni en COMET/MetricX-24 en este conjunto; el beneficio es selectivo por locale.
- Licencia Gemma: el uso comercial está sujeto a los términos de licencia de Google Gemma, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de un despliegue en producción.
- El checkpoint está en formato MLX, orientado a Apple Silicon; su uso en GPUs NVIDIA requiere conversión y no está documentado en la información proporcionada.
- No se dispone de información sobre sesgos, riesgo de alucinación específico del ajuste, longitud de contexto efectiva ni comportamiento fuera de los ocho idiomas objetivo.
- Al ser un modelo de 12B con licencia Gemma y autor individual, no hay garantías de soporte ni mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/TranslateGemma-4-12B-Pilot
- Adaptador LoRA: https://huggingface.co/goodmai/TranslateGemma-4-12B-Pilot-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Modelo base (variante Unsloth): https://huggingface.co/unsloth/gemma-4-12b-it
- Repositorio Basalt: https://github.com/goodmai/basalt
- Issue #725 de Basalt: https://github.com/goodmai/basalt/issues/725
- Issue #734 de Basalt: https://github.com/goodmai/basalt/issues/734
