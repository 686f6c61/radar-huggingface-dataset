# goodmai/TranslateGemma-4-12B-Pilot-LoRA

## Resumen

TranslateGemma-4-12B-Pilot-LoRA es un adaptador LoRA de traducción construido sobre el modelo base `google/gemma-4-12b-it` (familia Gemma 4, 12.000 millones de parámetros). Lo desarrolla el autor independiente `goodmai` como parte del stack de inferencia Basalt para Apple Silicon (MLX), y está especializado en traducción de documentación técnica en Markdown hacia ocho idiomas objetivo: japonés, coreano, indonesio, ruso, chino, alemán, español y francés. Su rasgo diferencial es la preservación literal de fragmentos de código en línea, bloques de código, flags de CLI, URLs y nombres de producto durante la traducción.

El modelo se publica como adaptador PEFT (QLoRA de 4 bits) y no como pesos completos: el repositorio ocupa solo 0,2 GB y requiere cargar el modelo base Gemma 4 12B para funcionar. Se trata de un piloto (v0.1) de 150 pasos de entrenamiento, pensado para validar la viabilidad de un pipeline de traducción técnica antes de abordar versiones mayores (el autor menciona un futuro TranslateGemma-4-26B-A4B).

Su relevancia actual es doble: por un lado, demuestra que un adaptador de bajo coste (entrenado en una única NVIDIA L4, ~2,1 Colab CU) puede superar a un modelo de traducción dedicado de la generación anterior (`google/translategemma-12b-it`, basado en Gemma 3) en métricas automáticas sobre Markdown técnico; por otro, expone con transparencia sus limitaciones, ya que en japonés y coreano queda por debajo del propio Gemma 4 base sin adaptar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA 4-bit NF4) sobre transformer decoder-only Gemma 4 (`gemma4_unified_text`) |
| Parametros totales | 12.000 millones (modelo base); adaptador LoRA con `r=16`, `lora_alpha=32` (tamaño del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (entrenamiento); conversión a `PV-MACaQ` 4-bit affine con grupo 64 para MLX; bfloat16 para el base en PEFT |
| Idiomas soportados | en, ja, ko, id, ru, zh, de, es, fr (8 idiomas objetivo de traducción) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT); convertible a formato MLX `PV-MACaQ` 4-bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Gemma 4 (12B, variante `gemma4_unified_text`). El entrenamiento emplea QLoRA con cuantización 4-bit NF4, rango `r=16`, `lora_alpha=32`, dropout 0,05 y actualización de las proyecciones lineales del decodificador de texto: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El optimizador es `paged_adamw_8bit` con tasa de aprendizaje 2e-4, scheduler coseno y batch efectivo de 16.

El dataset consta de 2.850 pares paralelos: 450 secciones técnicas alineadas de Markdown procedentes de `docs/i18n/` del proyecto Basalt y 2.400 pares de `Helsinki-NLP/opus-100` repartidos entre los ocho idiomas objetivo (2.700 para entrenamiento y 150 para validación reservada). El entrenamiento totalizó 150 pasos, aproximadamente 518.000 tokens, sobre una única NVIDIA L4. En validación reservada, la `eval_loss` bajó de 5,8433 a 0,9251 (−84,2 %) y la precisión media por token pasó del 33,55 % al 80,43 % (+46,9 puntos porcentuales). No se documenta uso de RLHF ni DPO en esta versión piloto; el autor menciona para futuras iteraciones un pipeline de curación epistémica (Belnap `SIXTEEN_3`) y RLVR con verificabilidad de fidelidad técnica.

## Capacidades

- Traducción de documentación técnica en Markdown entre inglés y ocho idiomas objetivo (ja, ko, id, ru, zh, de, es, fr).
- Preservación literal de fragmentos de código en línea, bloques de código cercados, flags de CLI, URLs y nombres de producto durante la traducción.
- Traducción multilingüe general, gracias a la mezcla de pares OPUS-100 en el entrenamiento.
- Conversión y despliegue en Apple Silicon mediante el stack Basalt (formato MLX `PV-MACaQ` 4-bit).
- Integración con el ecosistema PEFT/Transformers para carga del adaptador sobre el modelo base.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio específicas en la información disponible.

## Casos de uso

- Localización de README y documentación de proyectos open source: el adaptador traduce secciones Markdown manteniendo intactos bloques de código, comandos y URLs, lo que evita roturas en la documentación publicada.
- Traducción de documentación de API y guías de referencia: la alta fidelidad técnica (98,4 % global, 100 % en japonés según el autor) reduce la necesidad de revisión manual de fragmentos de código.
- Internacionalización de sitios de documentación estáticos (Docusaurus, MkDocs, VitePress): se puede integrar en un pipeline que procese los ficheros `.md` origen y genere las variantes por idioma.
- Traducción de notas de versión y changelogs técnicos: el modelo maneja terminología de producto y flags de CLI, adecuado para comunicados de ingeniería.
- Despliegue local en Mac con Apple Silicon: la conversión a MLX 4-bit permite servir el modelo en estaciones de trabajo de desarrollo sin GPU dedicada NVIDIA.
- Generación de documentación multilingüe en pipelines CI/CD: el adaptador puede ejecutarse tras un merge para producir automáticamente las traducciones de los documentos modificados.
- Traducción de contenido técnico para comunidades de habla no inglesa (japonés, coreano, indonesio, ruso): útil para proyectos que quieren ampliar alcance sin equipo de traducción dedicado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre 12 secciones técnicas de Markdown (3 secciones × 4 locales: ja, ko, id, ru), comparadas contra el README traducido y revisado humanamente de Basalt.

| Modelo | chrF++ ja (fid.) | chrF++ ko (fid.) | chrF++ id (fid.) | chrF++ ru (fid.) | chrF++ global | Fidelidad técnica | COMET (proxy) ↑ | MetricX-24 (proxy) ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `google/translategemma-12b-it` (Gemma 3) | 70,20 (100,0 %) | 73,90 (98,1 %) | 79,24 (95,6 %) | 73,77 (97,3 %) | 74,27 | 97,8 % | 0,8014 | 4,96 |
| `unsloth/gemma-4-12b-it` (Gemma 4 base) | 76,17 (100,0 %) | 80,45 (98,3 %) | 87,34 (100,0 %) | 81,59 (96,7 %) | 81,39 | 98,8 % | 0,8573 | 3,57 |
| `TranslateGemma-4-12B-Pilot-LoRA` | 74,96 (100,0 %) | 77,61 (96,9 %) | 87,56 (98,3 %) | 81,92 (98,3 %) | 80,51 | 98,4 % | 0,8498 | 3,75 |

Lectura de los datos: el adaptador supera a `google/translategemma-12b-it` en +6,24 chrF++ global, +0,0484 COMET y −1,21 MetricX-24, y mejora al Gemma 4 base en indonesio (87,56 frente a 87,34) y ruso (81,92 frente a 81,59, con mayor fidelidad técnica). En japonés y coreano queda ligeramente por debajo del Gemma 4 base, algo que el autor atribuye a que el 84 % del dataset piloto provino de OPUS-100 (subtítulos de frases cortas y ruidosas).

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bfloat16: aproximadamente 24 GB (12B × 2 bytes), más overhead de activaciones y del adaptador.
- VRAM estimada en cuantización 4-bit: en torno a 7-8 GB para los pesos, más overhead; cifra exacta no disponible.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento), A100, H100 para despliegue en bf16; RTX 4090 (24 GB) puede alojar el base en bf16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 (bf16) y en GPUs con 8-12 GB si se usa cuantización 4-bit.
- Despliegue en Apple Silicon: conversión a MLX `PV-MACaQ` 4-bit y servicio mediante `basalt serve --rest`.
- Despliegue en servidores: PEFT + Transformers (carga del adaptador sobre el base), potencialmente vLLM/TGI tras fusionar el adaptador, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `TranslateGemma-4-12B-Pilot-LoRA` | 12B (base) + LoRA | No disponible | Traducción técnica Markdown, 8 idiomas | Gemma | Hugging Face (adaptador PEFT) |
| `google/translategemma-12b-it` (Gemma 3) | 12B | No disponible | Traducción dedicada | Gemma | Hugging Face |
| `unsloth/gemma-4-12b-it` (Gemma 4 base) | 12B | No disponible | LLM generalista multilingüe | Gemma | Hugging Face |
| `Helsinki-NLP/opus-mt-*` (familia) | ~75M por par | Frases cortas | Traducción NMT clásica | CC-BY 4.0 (varía) | Hugging Face |

Frente a `google/translategemma-12b-it`, el adaptador mejora en chrF++, COMET y MetricX-24 según los datos del autor, con fidelidad técnica comparable. Frente al Gemma 4 base, el adaptador es competitivo en indonesio y ruso, pero pierde en japonés y coreano; el base sin adaptar es una alternativa razonable si se prioriza calidad bruta sobre especialización en Markdown. La familia OPUS-MT es mucho más ligera y rápida, pero no preserva estructura Markdown ni terminología técnica de forma fiable.

## Limitaciones y advertencias

- Es un piloto (v0.1) de 150 pasos: la calidad no está estabilizada y el autor ya anuncia una versión mayor (26B-A4B) con mejor curación de datos.
- En japonés y coreano rinde por debajo del Gemma 4 base sin adaptar, según los propios datos del autor.
- El 84 % del dataset de entrenamiento proviene de OPUS-100 (subtítulos), lo que puede sesgar el estilo hacia frases cortas y registro coloquial.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`); COMET y MetricX-24 son proxies, no evaluaciones neuronales oficiales sobre WMT24++ o FLORES+.
- El conjunto de evaluación es muy pequeño (12 sondas), por lo que la varianza de las métricas puede ser alta.
- Licencia Gemma: uso comercial permitido bajo los Gemma Terms of Use, con obligaciones de atribución y restricciones de uso (prohibición de usos dañinos, requisitos de redistribución). Revisar los términos antes de desplegar en producción.
- Requiere cargar el modelo base Gemma 4 12B: el adaptador por sí solo no es autónomo.
- No se documentan evaluaciones de sesgo, alucinación o robustez frente a entradas adversarias.
- Idiomas fuera de los ocho objetivo no están soportados de forma fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/TranslateGemma-4-12B-Pilot-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Variante Unsloth del base: https://huggingface.co/unsloth/gemma-4-12b-it
- Repositorio Basalt: https://github.com/goodmai/basalt
- Issue de seguimiento del adaptador: https://github.com/goodmai/basalt/issues/725
- Issue de evaluación de traducción: https://github.com/goodmai/basalt/issues/726
- Issue del pipeline de curación de datos (26B-A4B): https://github.com/goodmai/basalt/issues/732
- Issue de evaluación oficial WMT24++/FLORES+: https://github.com/goodmai/basalt/issues/734
- Dataset OPUS-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
