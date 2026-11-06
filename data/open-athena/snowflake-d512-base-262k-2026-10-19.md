# open-athena/Snowflake-d512-Base-262K-2026.10.19

## Resumen

Snowflake d512 Base 262K es un checkpoint de investigación de tipo Mixture-of-Experts (MoE) desarrollado por el proyecto open-athena dentro del ecosistema Marin. Se trata de un modelo de 746.607.104 parámetros totales con arquitectura `GrugMoeForCausalLM` (`grug_moe`), diseñado como escalón intermedio de una "escalera de escalado" (scaling ladder) denominada Snowflake, que parte de modelos preentrenados con contexto de 8K y extiende su ventana hasta 64K y posteriormente 262K tokens.

El modelo es un artefacto pre-SFT: contiene los pesos en BF16 tras las fases de extensión de contexto larga, pero antes del ajuste supervisado con Datakit. No incluye plantilla de chat y no ha sido evaluado en benchmarks de capacidades ni en paridad de forward-pass. Su relevancia es fundamentalmente metodológica: documenta un experimento de escalado sobre arquitecturas MoE con atención de ventana deslizante y vocabulario amplio, y se publica para reproducibilidad científica bajo la licencia OpenMDW-1.1.

La arquitectura emplea 6 capas con hidden size de 512, 4 cabezas de atención y 1 cabeza KV, 256 expertos enrutados con 4 activos por token más un experto compartido, y un vocabulario de 128.256 tokens. El contexto configurado es de 262.144 tokens con ventana deslizante de 2.048 tokens. El checkpoint nativo corresponde al paso 100.923 de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `GrugMoeForCausalLM` (`grug_moe`), transformer MoE con atención de ventana deslizante |
| Parametros totales | 746.607.104 |
| Parametros activos | 4 expertos enrutados de 256 + 1 experto compartido de 512 (por token) |
| Longitud de contexto | 262.144 tokens (configurado); ventana deslizante de 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (BF16); sin estado del optimizador |

Otros datos técnicos relevantes: hidden size 512, 6 capas, 4 cabezas de atención y 1 cabeza KV, tamaño intermedio de experto 256 y del experto compartido 512, vocabulario de 128.256 tokens, `qk_mult` de 1,75, paso nativo 100.923, tamaño del repo 1,5 GB.

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 6 capas y un hidden size reducido de 512, lo que da lugar a una representación interna compacta pero con un banco de 256 expertos enrutados (4 activos por token) más un experto compartido. La atención usa 4 cabezas de consulta y 1 cabeza KV (GQA), con una ventana deslizante de 2.048 tokens y un factor de escalado de consultas (`qk_mult`) de 1,75 aplicado antes de las puntuaciones de atención. El vocabulario es de 128.256 tokens.

El entrenamiento sigue una escalera de extensión de contexto: se parte de modelos preentrenados con 8K de contexto y se extiende primero a 64K y luego a 262K. El checkpoint liberado corresponde al paso 100.923 de la fase `lce-262k`, antes del SFT con Datakit. La model card indica que la escalera omite la etapa de entrenamiento a 8K sobre una segunda mezcla de datos que sí realizó Snowball, lo que constituye una limitación del experimento de escalado. El export a BF16 aplica la actualización pendiente de sesgo del router antes de la conversión, y los IDs de token no cambian. No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto autoregresiva como modelo base preentrenado (sin SFT).
- Razonamiento y modelado de lenguaje general, limitado por su tamaño y por la ausencia de ajuste supervisado.
- Manejo de contextos largos de hasta 262.144 tokens a nivel de configuración (no evaluado).
- Arquitectura MoE con enrutamiento disperso (4 de 256 expertos activos por token) más experto compartido.
- Soporte de tool calling: no disponible (modelo base sin SFT ni plantilla de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible (sin SFT).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre escalado de contexto largo: el checkpoint permite estudiar cómo se comporta una arquitectura MoE compacta al extender la ventana de 8K a 64K y 262K, comparando etapas de la escalera Snowflake.
- Reproducibilidad de experimentos Marin: sirve como artefacto de referencia para validar el pipeline de exportación (`export.py`, `export_complete.json`) y la paridad de tensores frente al checkpoint nativo.
- Estudio de enrutamiento MoE: con 256 expertos y 4 activos por token, es útil para analizar distribuciones de carga, colapso de expertos y efecto del sesgo del router en modelos pequeños.
- Base para SFT experimental: al ser un checkpoint pre-SFT, puede emplearse como punto de partida para ajuste supervisado con Datakit u otros datasets, aplicando la inicialización de tokens especiales que la release no incluye.
- Evaluación de atención con ventana deslizante: permite medir el impacto de una ventana de 2.048 tokens sobre un contexto configurado de 262.144 en tareas de recuperación de información a larga distancia.
- Docencia y divulgación: modelo de tamaño contenido (746M parámetros totales, 1,5 GB en BF16) apto para ilustrar arquitecturas MoE y extensiones de contexto en entornos académicos.
- Benchmarking de runtimes: útil para probar implementaciones que soporten Grug MoE (por ejemplo, `SnowballConfig`/`SnowballLMHeadModel` de Levanter) y comparar con Transformers estándar, que no implementa esta arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la release no ha sido probada en paridad de forward-pass, generación, benchmarks de capacidades ni evaluación de contexto de 262K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,5 GB solo para pesos (746,6M parámetros × 2 bytes), más overhead de activaciones y caché KV; el contexto de 262K exige memoria adicional significativa para la caché.
- GPU recomendadas: no disponible (no se han publicado requisitos oficiales). Por tamaño, cabría en GPUs consumer con al menos 8 GB de VRAM en BF16, aunque la viabilidad real depende del soporte del runtime.
- Cabe en GPU consumer: previsiblemente sí en términos de pesos (RTX 3060 12 GB, RTX 4070, RTX 4090), sujeto a la disponibilidad de un runtime con soporte Grug MoE.
- Opciones de despliegue: no disponible para vLLM, llama.cpp, Ollama o TGI, ya que Transformers estándar no implementa la arquitectura. El soporte documentado es mediante Levanter (`SnowballConfig`, `SnowballLMHeadModel`, API `load_hf_checkpoint`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Snowflake d512 Base 262K | 746,6 M | 262.144 (configurado) | OpenMDW-1.1 | Hugging Face; requiere runtime con Grug MoE |
| Snowball (etapa previa de la escalera) | no disponible | 8K / 64K / 262K segun etapa | no disponible | Referenciado en Marin issue #10753 |
| Alternativas MoE compactas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables evaluados en las mismas condiciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin probar: la model card advierte que no ha sido evaluado adecuadamente y que no es necesariamente seguro para producción.
- Sin SFT: es un checkpoint preentrenado, sin plantilla de chat ni inicialización de tokens especiales de Datakit; no es apto para uso conversacional directo.
- Contexto no validado: los 262.144 tokens son un valor de configuración, no una capacidad verificada empíricamente.
- Limitación del experimento: la escalera omite la etapa de entrenamiento a 8K sobre una segunda mezcla de datos que sí realizó Snowball, lo que condiciona las conclusiones del escalado.
- Compatibilidad restringida: Transformers estándar no implementa `grug_moe`; se requiere Levanter u otro runtime con soporte explícito.
- Idiomas no declarados: no hay información sobre cobertura lingüística ni calidad por idioma.
- Riesgo de alucinación y sesgos: no documentados; al ser un modelo base sin ajuste, el riesgo de generación incoherente o sesgada es alto.
- Licencia OpenMDW-1.1: deben revisarse sus términos antes de cualquier uso comercial; la model card solo exige cumplimiento de la ley aplicable y uso ético y responsable.
- Sin garantías de seguridad: el autor declara explícitamente que el modelo no es necesariamente seguro.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Snowflake-d512-Base-262K-2026.10.19
- Marin issue #10753 (opción 3 y comparación de etapas): https://github.com/marin-community/marin/issues/10753
- Implementación `SnowballConfig` y `SnowballLMHeadModel` en Levanter: https://github.com/marin-community/marin/blob/260d93767112780da77918f2c3394ee09608bf04/lib/levanter/src/levanter/models/snowball.py
- API `load_hf_checkpoint`: https://github.com/marin-community/marin/blob/260d93767112780da77918f2c3394ee09608bf04/lib/levanter/src/levanter/model_loading.py
