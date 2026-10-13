# mlx-community/LFM2.5-24B-A2B-Preview-bf16

## Resumen

LFM2.5-24B-A2B-Preview-bf16 es una conversión a formato MLX, publicada por la organización mlx-community, del modelo LFM2.5-24B-A2B-Preview desarrollado originalmente por Liquid AI, Inc. Se trata de un modelo de generación de texto con arquitectura de mezcla de expertos (MoE) que combina 23.971.587.712 parámetros totales (unos 24B) con solo 2B parámetros activos por paso forward, lo que lo sitúa en la categoría de modelos grandes pero con coste de inferencia propio de un modelo pequeño. Su ventana de contexto es de 131.072 tokens.

El modelo pertenece a la familia LFM2.5, que según la información disponible abarca desde LFM2.5-230M hasta este LFM2.5-24B-A2B, presentado como el mayor y último miembro de la familia. Está diseñado explícitamente para agentes que se ejecutan en local ("on-device"), con énfasis en velocidad de decodificación y privacidad, y genera razonamiento antes de su respuesta final, por lo que requiere presupuestos de tokens de salida generosos. Soporta diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.

Esta ficha concreta describe la conversión MLX en bfloat16, pensada para ejecutarse sobre Apple Silicon mediante la librería mlx-vlm. Los pesos ocupan 47,94 GB en decimal, con los sesgos de enrutamiento de expertos retenidos en FP32, y la conversión se validó con comprobaciones de humo (prefill, decodificación con caché y dos generaciones greedy cortas), no con una evaluación de calidad exhaustiva ni con pruebas de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer; tipo de modelo `lfm2_moe` (familia LFM2.5) |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B por paso forward (MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | bf16 (esta conversión). Otras cuantizaciones: no disponible |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, etiquetada como `other`) |
| Formato de pesos | safetensors en bfloat16 (formato MLX); sesgos de enrutamiento de expertos en FP32 |

## Arquitectura y entrenamiento

La información disponible confirma que LFM2.5-24B-A2B es un modelo de mezcla de expertos con 24B parámetros totales y 2B activos por paso forward, el mayor MoE de Liquid AI para portátiles y aplicaciones de GPU única según su documentación. La conversión MLX conserva los sesgos de enrutamiento de expertos en FP32 mientras el resto de pesos se almacena en bfloat16, un detalle relevante porque el enrutamiento es la parte más sensible a la precisión en modelos MoE: mantener los sesgos en FP32 evita degradar la selección de expertos al reducir el dtype. El modelo incorpora una plantilla de chat propia y un modo de razonamiento previo a la respuesta final.

No se han proporcionado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras fases de alineación. Tampoco se especifican innovaciones de atención (atención lineal, decodificación especulativa u otras) más allá de la naturaleza MoE y de las menciones genéricas a optimización para agentes en local. La conversión fue realizada con la CLI de MLX-VLM sobre un Apple M3 Ultra, fijada a la revisión `f772950ce6f17d35af5469d00334b61a9c2fc034` del modelo base, y verificada con coincidencia estricta de pesos, logits finitos en prefill y decodificación con caché, y dos comprobaciones greedy cortas que devolvieron "Paris" y "391" y alcanzaron EOS.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida en el repositorio.
- Razonamiento explícito: el modelo genera una cadena de razonamiento antes de la respuesta final, por lo que conviene reservar suficientes tokens de salida.
- Capacidades de agente orientadas a ejecución en local ("on-device agents"), según la documentación del modelo original.
- Soporte multilingüe en diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Inferencia en Apple Silicon mediante MLX y mlx-vlm, con prefill y decodificación con caché verificados.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión: no disponible. Aunque el repositorio está etiquetado con `mlx-vlm` y la conversión se hizo con esa herramienta, la model card indica explícitamente que se trata de un modelo de generación de texto.
- Capacidades de audio: no disponible.

## Casos de uso

- Agentes personales en local sobre Mac: al requerir solo 2B parámetros activos por token, el modelo puede sostener bucles de razonamiento de varios pasos en un Apple Silicon de gama alta sin depender de la nube, manteniendo los datos del usuario en el dispositivo.
- Atención al cliente automatizada: la ventana de 131.072 tokens permite arrastrar historiales de conversación muy largos y documentación de producto adjunta sin truncar el contexto, con respuestas en cualquiera de los diez idiomas soportados.
- Análisis y resumen de documentos extensos: informes técnicos, contratos o expedientes que superen las decenas de miles de tokens pueden procesarse en una sola pasada, pidiendo al modelo que razone antes de resumir.
- Generación y revisión de código en flujos locales: integrado mediante MLX en el portátil del desarrollador, permite autocompletado y explicación de fragmentos sin enviar el código propietario a un servicio externo.
- Asistentes de investigación con privacidad estricta: sectores con requisitos de confidencialidad (sanidad, legal, defensa) pueden desplegar el modelo en hardware propio, ya que los pesos se ejecutan íntegramente en local.
- Razonamiento matemático y de lógica con verificación intermedia: al exponer su cadena de razonamiento antes de la respuesta final, el modelo es adecuado para tareas donde interesa auditar el proceso, no solo el resultado.
- Traducción y procesamiento multilingüe: la cobertura de diez idiomas, incluidos árabe, chino, japonés y coreano, lo hace utilizable como capa de traducción o normalización en pipelines locales.
- Prototipado de agentes con tool calling: la información disponible no confirma soporte explícito de function calling, por lo que este caso requiere validación previa por parte del integrador antes de llevarlo a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El único dato comparativo encontrado es una afirmación cualitativa del blog de Liquid AI según la cual LFM2.5-24B-A2B supera a Qwen3.6-35B-A3B en la prueba denominada LiveClaw; no se proporcionan cifras asociadas a esa comparación.

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B | Notas |
|---|---|---|---|
| LiveClaw | no disponible (se afirma superior) | no disponible | Comparación cualitativa citada en el blog de Liquid AI, sin cifras publicadas en la información disponible |
| MMLU | no disponible | no disponible | Sin datos |
| HumanEval | no disponible | no disponible | Sin datos |
| GSM8K | no disponible | no disponible | Sin datos |

Las únicas verificaciones reproducibles documentadas son de tipo humo: coincidencia estricta de pesos al recargar, logits finitos en prefill y decodificación con caché, y dos generaciones greedy cortas ("Paris" y "391") que alcanzaron EOS. La propia model card advierte que no constituyen una evaluación de calidad ni una prueba de contexto largo.

## Requisitos de hardware

- VRAM / memoria unificada estimada para esta conversión en bf16: los archivos de pesos suman 47,94 GB en decimal, y la model card advierte que el consumo en ejecución incluye además la caché y asignaciones temporales, por lo que hay que prever margen adicional.
- Apple Silicon: la conversión se realizó y se probó sobre un Apple M3 Ultra, que es el tipo de máquina de referencia para este export. Un Mac con 64 GB o más de memoria unificada es el escenario natural; con 48 GB el margen es muy justo.
- GPU de datacenter: una A100 de 80 GB o una H100 de 80 GB pueden alojar los pesos en bf16 sin cuantizar. GPU de 40 GB (A100 40 GB, L40S) quedan por debajo del tamaño de los pesos.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas equivalentes en bf16 sin cuantización, y esta conversión no publica variantes cuantizadas. Se desconoce si existen cuantizaciones oficiales del modelo base.
- Opciones de despliegue: la ruta documentada es MLX-VLM (PR #2505, commit `a6c7313bc053e5887616fa850808d21576eddf98`), MLX 0.32.3 y Transformers 5.17.0. El uso de vLLM, llama.cpp, Ollama o TGI con esta conversión concreta: no disponible.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar solo 2B parámetros por token, el coste de decodificación debería ser propio de un modelo de ese orden y no de uno de 24B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B (esta conversión MLX) | ~24B | ~2B | 131.072 tokens | LFM Open License v1.0 | Pesos abiertos en HF (mlx-community y nativ-community) | Solo la afirmación cualitativa frente a Qwen3.6-35B-A3B en LiveClaw |
| Qwen3.6-35B-A3B | 35B (según denominación) | 3B (según denominación) | no disponible | no disponible | no disponible | no disponible |
| LFM2-24B-A2B | 24B | 2B | no disponible | no disponible | Pesos abiertos en HF (LiquidAI), incluida una variante MLX bf16 | no disponible |

No se dispone de datos suficientes para una comparación cuantitativa fiable. La única referencia comparativa explícita en la información disponible es la superioridad declarada por Liquid AI sobre Qwen3.6-35B-A3B en LiveClaw, sin cifras que la respalden.

## Limitaciones y advertencias

- Modelo marcado como "Preview": el propio nombre del checkpoint sugiere que no es una versión final y puede cambiar en el modelo base.
- Riesgo de alucinación: no hay datos publicados de evaluación de veracidad ni de tasas de alucinación en la información disponible.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, culturales o lingüísticos.
- Modo de razonamiento: al generar razonamiento antes de la respuesta, un límite de tokens de salida demasiado bajo puede truncar la cadena de pensamiento y degradar o impedir la respuesta final.
- Validación limitada: la conversión se verificó solo con comprobaciones de humo y dos generaciones greedy cortas; no hay evaluación de calidad ni prueba de contexto largo publicada para este export.
- Contexto: aunque la configuración declara 131.072 tokens, no se aportan mediciones de degradación del rendimiento a longitudes cercanas al límite.
- Licencia: se aplica la LFM Open License v1.0, etiquetada como `other` y no como licencia de código abierto estándar. Es imprescindible revisar los términos antes de cualquier uso comercial; no se detallan aquí las restricciones concretas.
- Atribución: el modelo original es de Liquid AI, Inc., y la licencia original se incluye con los pesos. Las modificaciones de conversión y cuantización se describen en el archivo NOTICE.
- Autoría del export: la conversión la realiza mlx-community a partir de un checkpoint de vista previa (`lq-preview`), no directamente Liquid AI; conviene contrastar con los pesos oficiales de LiquidAI antes de usos críticos.
- Cuantización: no se publican variantes cuantizadas de esta conversión, lo que limita su despliegue en hardware de consumo.
- Idiomas: la información disponible no detalla el nivel de competencia por idioma, solo la lista de diez idiomas soportados.

## Enlaces

- Conversión MLX (mlx-community): https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-bf16
- Conversión MLX (nativ-community, mismos archivos): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-bf16
- Modelo base de esta conversión: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Variante MLX del modelo predecesor: https://huggingface.co/LiquidAI/LFM2-24B-A2B-MLX-bf16
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Cobertura en Unite.AI: https://www.unite.ai/liquid-ai-releases-open-weight-lfm2-5-24b-a2b-for-on-device-agents/
- Documentación de Liquid AI sobre LFM2-24B-A2B: https://docs.liquid.ai/lfm/models/lfm2-24b-a2b
- PR de MLX-VLM con el port de LFM2.5: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Licencia LFM Open License v1.0: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-bf16/blob/main/LICENSE
