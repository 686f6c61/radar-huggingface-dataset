# mradermacher/QWEN3-32B-EXTENDED-BLADDER-alpaca-GGUF

## Resumen

`mradermacher/QWEN3-32B-EXTENDED-BLADDER-alpaca-GGUF` es una reproducción en formato GGUF del modelo `Ha-ya/QWEN3-32B-EXTENDED-BLADDER-alpaca`, un ajuste fino comunitario derivado de la familia Qwen3-32B. No se trata de un modelo entrenado por el autor del repositorio: mradermacher actúa únicamente como cuantizador, convirtiendo los pesos originales en ficheros GGUF listos para inferencia local con llama.cpp, Ollama o LM Studio. El modelo cuenta con 32 992 113 664 parámetros (~33 000 millones) según los metadatos de safetensors del repositorio base.

El interés práctico del repositorio es doble. Por un lado, permite ejecutar un modelo denso de ~33B en hardware de consumo mediante cuantizaciones que van de 12,6 GB (Q2_K) a 35,2 GB (Q8_0). Por otro, la nomenclatura del modelo base (`EXTENDED-BLADDER`, `alpaca`) sugiere un ajuste fino sobre el dataset Alpaca, presumiblemente con técnicas de modificación del comportamiento de rechazo, aunque el autor no documenta ni el proceso de entrenamiento ni los datos utilizados. Es relevante ahora porque Qwen3-32B es una de las bases densas más capaces de su categoría y porque la comunidad demanda versiones GGUF para despliegue offline.

La ficha debe leerse con cautela: el repositorio no incluye model card descriptiva más allá de la tabla de cuantizaciones, no declara licencia, no publica benchmarks y tiene una tracción muy limitada (131 descargas, 0 likes en el momento de la consulta). Todo lo que sigue distingue explícitamente entre datos verificados del repositorio, datos heredados de la documentación pública de Qwen3-32B y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con Grouped Query Attention (heredada de Qwen3-32B; no verificada en el repositorio) |
| Parametros totales | 32 992 113 664 (~33B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en el repositorio. La base Qwen3-32B declara 32 768 tokens nativos y 131 072 con escalado YaRN |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0. No hay cuantizaciones con imatrix publicadas por el autor |
| Idiomas soportados | `en` (único idioma declarado en los metadatos) |
| Licencia | No disponible. El repositorio no declara licencia; la cadena de ajustes finos intermedios tampoco la especifica |
| Formato de pesos | GGUF (un fichero por cuantización). El repositorio base publica safetensors; el repo completo ocupa 225,8 GB |
| Libreria declarada | transformers |
| Tamano del repositorio | 225,8 GB |
| Fecha de creacion / actualizacion | 2025-12-05 / 2026-10-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3-32B: un transformer decoder-only denso de aproximadamente 33 000 millones de parámetros, con atención de consultas agrupadas (GQA) y soporte de modos de razonamiento (thinking / non-thinking) según el informe técnico publicado por el equipo Qwen. Sin embargo, el repositorio de mradermacher no documenta ningún detalle de arquitectura, y el modelo intermedio `Ha-ya/QWEN3-32B-EXTENDED-BLADDER-alpaca` tampoco aporta información verificable sobre capas, dimensiones ocultas o número de cabezas. Cualquier cifra concreta de config debe extraerse del `config.json` del repositorio base, no de esta ficha.

Respecto al entrenamiento, no hay información disponible. El sufijo `alpaca` sugiere un ajuste fino supervisado sobre el dataset Alpaca (instrucciones en inglés, generadas con Self-Instruct), y el término `BLADDER` junto con la existencia de variantes `abliterated` en el ecosistema Qwen3 apunta a una modificación del comportamiento de rechazo, pero son inferencias a partir del nombre, no hechos documentados. Se desconoce el número de tokens de entrenamiento, la composición exacta del dataset, si hubo fases de RLHF/DPO y qué hiperparámetros se emplearon. El proceso aplicado por mradermacher es puramente de conversión y cuantización: `convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`, con cuantizaciones estáticas y sin pesos ponderados por imatrix.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste fino sobre instrucciones tipo Alpaca.
- Razonamiento y resolución de problemas de cierta complejidad, en la medida en que la base Qwen3-32B los soporta; no hay evaluación específica del fine-tune.
- Generación de código y matemáticas a nivel de la base Qwen3-32B, previsiblemente degradado por el ajuste fino con Alpaca (dataset de instrucciones generales, no técnico).
- Ejecución local offline en CPU y GPU mediante llama.cpp y derivados, al estar distribuido en GGUF.
- Conversación multi-turno: el formato GGUF conserva la plantilla de chat del modelo base, aunque no se documenta cuál es.
- Modo de razonamiento extendido (thinking): no confirmado para este fine-tune; Qwen3-32B lo incorpora de serie, pero un ajuste fino puede haber alterado los tokens de control.
- Tool calling / function calling: no documentado y poco probable que se conserve tras un ajuste con Alpaca.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado al inglés según los metadatos; el alpaca original es monolingüe en inglés, por lo que es esperable un rendimiento pobre en castellano.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Inferencia local en estación de trabajo con GPU de 24 GB: cargando Q4_K_M (20,0 GB) en una RTX 3090 o RTX 4090 se obtiene un modelo de ~33B completamente en VRAM con contexto moderado, útil para prototipado sin dependencia de API.
- Despliegue en hardware modesto: Q2_K (12,6 GB) o Q3_K_S (14,6 GB) permiten ejecutar el modelo en tarjetas de 16 GB o incluso con offload parcial a CPU, a costa de una pérdida de calidad notable en el rango Q2/Q3.
- Asistentes conversacionales offline en entornos air-gapped: al ser un fichero GGUF autocontenido, puede desplegarse en máquinas sin conexión a internet, algo relevante en entornos industriales o de defensa con requisitos de confidencialidad.
- Generación de texto creativo y roleplay sin filtros: la naturaleza presumiblemente abliterada del fine-tune lo hace adecuado para narrativa o personajes donde los modelos alineados rechazan ciertos temas; requiere revisión humana y políticas de contenido claras.
- Investigación sobre alineación y edición de comportamiento: sirve como punto de comparación frente a Qwen3-32B original para estudiar cómo un ajuste fino con Alpaca y técnicas de abliteración afectan a la tasa de rechazo, la calidad de instrucciones y la coherencia.
- Evaluación comparativa de cuantizaciones: los once ficheros GGUF publicados permiten medir empíricamente la degradación de perplejidad y calidad entre Q2_K y Q8_0 sobre un mismo modelo, útil para calibrar pipelines de cuantización propios.
- Generación de datasets sintéticos en inglés: con Q8_0 (35,2 GB) en una A100 40GB se puede usar como generador de instrucciones y respuestas para tareas de destilación, siempre que se valide la calidad y se filtren sesgos.
- Procesamiento por lotes de textos en inglés: resumen, reescritura o clasificación de documentos con throughput moderado mediante llama.cpp en modo servidor, sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio solo contiene la tabla de cuantizaciones y notas sobre el proceso de conversión; no hay MMLU, HumanEval, GSM8K ni evaluaciones de calidad por cuantización. Tampoco el modelo base `Ha-ya/QWEN3-32B-EXTENDED-BLADDER-alpaca` publica métricas en la información consultada.

Como referencia externa, el informe técnico de Qwen3 (arXiv 2505.09388) recoge los resultados oficiales de Qwen3-32B, pero no son extrapolables a este fine-tune: un ajuste fino con Alpaca sobre una base de 32B suele degradar el rendimiento en tareas de razonamiento y código respecto al modelo original. Cualquier cifra que se cite para este repositorio debería obtenerse midiendo directamente sobre los GGUF publicados.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin KV cache): 12,6 GB (Q2_K), 14,6 GB (Q3_K_S), 16,2 GB (Q3_K_M), 17,6 GB (Q3_K_L), 18,1 GB (IQ4_XS), 19,0 GB (Q4_K_S), 20,0 GB (Q4_K_M), 22,9 GB (Q5_K_S), 23,5 GB (Q5_K_M), 27,2 GB (Q6_K), 35,2 GB (Q8_0).
- VRAM adicional para contexto: a 32 768 tokens de contexto con GQA, el KV cache en FP16 para un modelo de 64 capas puede superar varios GB; conviene presupuestar entre 2 y 6 GB extra según longitud de secuencia y precisión del cache (f16, q8_0, q4_0).
- GPU de consumo: Q4_K_M (20,0 GB) entra ajustadamente en RTX 3090, RTX 4090 y RTX 5090 de 24 GB, dejando poco margen para contexto largo. Q3_K_M (16,2 GB) e IQ4_XS (18,1 GB) son opciones más holgadas en 24 GB. Q2_K (12,6 GB) y Q3_K_S (14,6 GB) caben en RTX 4080, RTX 4060 Ti 16GB y Radeon RX 7900 XT.
- GPU profesional: Q8_0 (35,2 GB) requiere A100 40GB, A6000 48GB, H100 o partición multi-GPU; Q6_K (27,2 GB) encaja en A100 40GB y A6000 48GB con contexto amplio.
- Configuraciones multi-GPU: las cuantizaciones Q6_K y Q8_0 pueden repartirse entre dos GPU de 24 GB mediante `--split-mode row` en llama.cpp, con la penalización de ancho de banda que ello implica.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, KoboldCpp y llama-cpp-python. vLLM y TGI tienen soporte de GGUF experimental o nulo; para producción de alta concurrencia sería preferible servir los safetensors originales con vLLM.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo para este repositorio en ninguna configuración de hardware.
- CPU y RAM: con offload parcial, un Q4_K_M necesita del orden de 20 GB de RAM libre además del modelo mapeado; para ejecución totalmente en CPU se recomienda un sistema con al menos 32 GB de RAM y AVX2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/QWEN3-32B-EXTENDED-BLADDER-alpaca-GGUF | 32,99B | No disponible (base Qwen3-32B: 32k / 131k con YaRN) | No disponible | GGUF (11 cuantizaciones) | 131 descargas, 0 likes; sin benchmarks ni model card descriptiva |
| mradermacher/Qwen3-32B-abliterated-GGUF | ~32,8B | No disponible en la informacion consultada | Apache-2.0 (según el listado de Hugging Face) | GGUF | Variante abliterada de Qwen3-32B; licencia declarada explícitamente |
| mradermacher/Qwen3-32B-Cevum-GGUF | ~32,8B | No disponible en la informacion consultada | No disponible (etiqueta `unsloth`) | GGUF | Otro fine-tune comunitario de Qwen3-32B cuantizado por el mismo autor |
| Qwen/Qwen3-32B (original) | 32,8B | 32 768 nativos, 131 072 con YaRN | Apache-2.0 | safetensors | Referencia de calidad y licencia; sin modificación del comportamiento de rechazo |

La comparación relevante es con Qwen3-32B original: este repositorio añade comodidad de despliegue local y un comportamiento presumiblemente menos restrictivo, pero pierde la licencia clara, la documentación de entrenamiento y la garantía de calidad del modelo oficial. Frente a la variante `abliterated` del mismo autor, la diferencia es la base de ajuste fino (Alpaca frente a abliteración directa) y el hecho de que aquella sí declara Apache-2.0.

## Limitaciones y advertencias

- Licencia no declarada: ni el repositorio GGUF ni el modelo base intermedio especifican términos de uso. Esto impide un uso comercial seguro sin aclaración previa del autor; Qwen3-32B original es Apache-2.0, pero un fine-tune puede introducir obligaciones adicionales.
- Procedencia opaca: se desconoce quién entrenó `Ha-ya/QWEN3-32B-EXTENDED-BLADDER-alpaca`, con qué datos, con qué hiperparámetros y con qué proceso de alineación o desalineación.
- Riesgo de contenido nocivo: la nomenclatura sugiere un modelo con los rechazos atenuados; es esperable que genere contenido violento, sexual o inseguro ante peticiones que un modelo alineado rechazaría. Requiere moderación externa en cualquier despliegue público.
- Degradación por ajuste fino: un entrenamiento con Alpaca sobre una base de 32B suele reducir el rendimiento en matemáticas, código y seguimiento de instrucciones complejas respecto a Qwen3-32B.
- Idiomas: solo se declara inglés. El rendimiento en castellano será previsiblemente bajo y no está evaluado.
- Alucinación: sin benchmarks ni evaluaciones de fidelidad, no hay evidencia de la tasa de alucinación; en un fine-tune comunitario sin validación es razonable asumir un riesgo alto.
- Pérdida de calidad por cuantización: Q2_K y Q3_K_S degradan notablemente la perplejidad; para uso serio se recomienda Q4_K_M o superior. No hay cuantizaciones imatrix que mitiguen esta pérdida.
- Contexto no verificado: aunque la base soporte 32k/131k, no se confirma que el fine-tune conserve la ventana completa ni la configuración de RoPE escalado.
- Tracción mínima: 131 descargas y 0 likes implican ausencia de validación comunitaria; no hay informes de terceros sobre calidad o estabilidad.
- Tool calling y agentes: no documentados; no deben asumirse en producción sin pruebas directas.
- Fecha de actualización futura: los metadatos indican 2026-10-24 como última modificación, lo que puede reflejar re-subidas de ficheros; conviene verificar los hashes antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/QWEN3-32B-EXTENDED-BLADDER-alpaca-GGUF
- Modelo base del que se parte: https://huggingface.co/Ha-ya/QWEN3-32B-EXTENDED-BLADDER-alpaca
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#QWEN3-32B-EXTENDED-BLADDER-alpaca-GGUF
- Informe técnico de Qwen3 (arXiv 2505.09388): https://arxiv.org/html/2505.09388v1
- Variante abliterada del mismo autor: https://huggingface.co/mradermacher/Qwen3-32B-abliterated-GGUF
- Variante Cevum del mismo autor: https://huggingface.co/mradermacher/Qwen3-32B-Cevum-GGUF
- Guía de despliegue local de Qwen3-32B en GPU de 24 GB: https://baeseokjae.github.io/posts/qwen-3-32b-local-guide-2026/
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
