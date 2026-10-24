# robbin052/XORTRON-AgentRICO

## Resumen

XORTRON-AgentRICO es un modelo de lenguaje y visión (pipeline `image-text-to-text`) de 27.781 millones de parámetros publicado por el usuario `robbin052` dentro del proyecto XORTRON Criminal Computing, una iniciativa de investigación en IA adversarial y seguridad de la IA con sede en Tampa (Florida). El modelo parte de `orcarouter/Qwen3.8-27B-Uncensored` y se ha afinado con el dataset `darkc0de/The-Mind-of-XORTRON` mediante herramientas de Unsloth, aplicando técnicas de eliminación de rechazo (abliteration/heretic) que lo etiquetan explícitamente como `uncensored`, `toxic` y `not-for-all-audiences`.

El propósito declarado no es el uso general, sino el estudio controlado de la capacidad de los sistemas de IA para facilitar conductas de alto riesgo: la model card lo presenta como un banco de pruebas para red teaming, análisis de alineación, modelado de amenazas y evaluación de daño. Por eso el autor impone un acuerdo de acceso restringido con certificación de elegibilidad (investigadores de seguridad, personal legal, fuerzas del orden, responsables de políticas, etc.) en lugar de una licencia abierta estándar.

Es relevante ahora por tres motivos: es un VLM de 27B con ventana de 32K según el proveedor de inferencia Featherless, se distribuye también en GGUF de terceros, y aparece en un momento en el que la comunidad de seguridad discute cómo evaluar modelos deliberadamente "desbloqueados". El repositorio no tiene descargas ni valoraciones y no se han publicado benchmarks, por lo que cualquier evaluación de calidad debe hacerse de primera mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5`), adaptado a entrada imagen-texto; detalles de la torre de visión no disponibles |
| Parametros totales | 27.781.427.952 (~27,8B), dato real de safetensors |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | 32K tokens, segun la ficha de Featherless; no confirmado en la model card del autor |
| Tipos de cuantizacion | Pesos originales en safetensors (BF16); conversiones GGUF de terceros en `mradermacher/XORTRON-AgentRICO-GGUF` (niveles concretos no verificados) |
| Idiomas soportados | Ingles (`en`) declarado; el modelo base Qwen subyacente es multilingue, pero el ajuste no declara otros idiomas |
| Licencia | No disponible como licencia estandar; la model card impone un "XORTRON Restricted Access & Authorized-Use Agreement" con certificacion de elegibilidad y uso prohibido para actividad ilegal |
| Formato de pesos | safetensors (repo original, 55,6 GB); GGUF (conversion de terceros) |

## Arquitectura y entrenamiento

La informacion disponible situa el modelo sobre un transformer decoder-only de la familia Qwen3.5 con capacidad de procesamiento de imagen y texto, heredado de `orcarouter/Qwen3.8-27B-Uncensored`. El ajuste se realizo con Unsloth y el dataset `darkc0de/The-Mind-of-XORTRON`; los tags `abliterated` y `heretic` indican que se aplicaron tecnicas de supresion de direcciones de rechazo en el espacio de activaciones en lugar de un simple fine-tuning instructivo. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; todos esos datos deben considerarse **no disponibles**.

Tampoco se documentan innovaciones tecnicas propias: no hay mencion a decodificacion especulativa, atencion lineal, MTP ni modos de razonamiento extendido. La unica informacion arquitectonica verificable es el recuento de parametros (27,78B), el tamano del repositorio (55,6 GB, coherente con pesos BF16 y una torre de vision adicional) y la etiqueta de pipeline `image-text-to-text`, que confirma la modalidad multimodal de entrada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con el tono y estilo del dataset de ajuste.
- Procesamiento de imagenes junto a texto (pipeline `image-text-to-text`), lo que permite describir, analizar o razonar sobre contenido visual.
- Respuestas sin rechazo por defecto: la ablitation elimina los mecanismos de negativa del modelo base, segun los tags `uncensored`, `abliterated` y `heretic`.
- Generacion de contenido toxico o danino de forma deliberada, segun los tags `toxic`, `harmful` y `not-for-all-audiences`; es una caracteristica del diseno, no un defecto.
- Orientacion agentica: el nombre "AgentRICO" sugiere entrenamiento para flujos de agente, aunque no hay documentacion que lo confirme.
- Tool calling / function calling: **no confirmado** en la informacion disponible; el modelo base Qwen3.5 lo soporta habitualmente, pero el ajuste no lo declara.
- Multilingue: no declarado; solo ingles.
- Modo thinking o razonamiento extendido: **no disponible**.

## Casos de uso

- Red teaming de salvaguardas: usar el modelo como generador adversarial para medir la tasa de cumplimiento de politicas frente a prompts de alto riesgo, comparando sus respuestas con las de un modelo alineado de referencia.
- Investigacion en alineacion y ablitation: estudiar como se degrada la funcion de rechazo tras la supresion de direcciones en el espacio de activaciones, sirviendo como caso controlado para papers de interpretabilidad.
- Modelado de amenazas: alimentar ejercicios de threat modeling en equipos de seguridad corporativa, generando muestras realistas de texto malicioso para calibrar detectores y reglas de DLP.
- Generacion de datos adversarios para clasificadores: producir corpus etiquetados de contenido toxico o fraudulento que sirvan para entrenar y evaluar moderadores automaticos.
- Analisis forense multimodal: procesar capturas, documentos escaneados o imagenes junto a texto de contexto para tareas de triaje en investigacion de fraude, dentro de un entorno aislado y con supervision humana.
- Evaluacion de pipelines agenticos: probar la robustez de un orquestador de agentes (herramientas, multi-paso, recuperacion) frente a un modelo que no aplica rechazos, identificando puntos donde el sistema necesita guardarrailes externos.
- Docencia y concienciacion en seguridad: demostraciones controladas en cursos de seguridad de IA sobre los riesgos de publicar pesos sin alineacion.
- Benchmarking comparativo de robustez: incluir el modelo en baterias de evaluacion de jailbreak y de adherencia a politicas junto a modelos alineados del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de evaluaciones de seguridad (tasa de rechazo, toxicidad medida, robustez frente a jailbreaks) en la model card ni en las fuentes consultadas, y el repositorio registra 0 descargas y 0 valoraciones, por lo que tampoco existe validacion independiente de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (BF16, ~55,6 GB de pesos): en torno a 60-64 GB contando cache KV y margen; requiere GPU de 80 GB o reparto multi-GPU.
- Cuantizacion INT8/FP8: aproximadamente 28-30 GB, viable en A6000, L40S, L40 o H100 NVL.
- Cuantizacion GGUF Q5_K_M: del orden de 20 GB, entra en RTX 4090, RTX 3090 o RTX 5090.
- Cuantizacion GGUF Q4_K_M: del orden de 17-19 GB, comoda en una RTX 4090/3090 de 24 GB; ajustada en GPUs de 16 GB, donde habria que bajar a Q3 o descargar capas a CPU.
- GPU recomendadas: H100 80GB o A100 80GB para BF16 y servicio concurrente; L40S o A6000 para FP8; RTX 4090, 3090 o 5090 para cuantizaciones de 4-5 bits en uso individual.
- Despliegue: transformers (libreria declarada), TGI, vLLM (requiere soporte de la torre de vision de la familia Qwen3.5), llama.cpp/Ollama/LM Studio mediante el GGUF de `mradermacher` (no confirmado que el GGUF incluya el proyector multimodal), y API gestionada en Featherless con contexto de 32K y precio plano desde 25 USD/mes.
- Latencia y throughput: no hay mediciones publicadas. A titulo orientativo, un modelo denso de 27B en Q4 sobre una RTX 4090 suele moverse en la decena o decenas de tokens por segundo, pero es una estimacion por tamano, no un dato del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XORTRON-AgentRICO (este) | 27,8B | 32K (segun Featherless) | Imagen-texto | Acuerdo de acceso restringido, no es licencia estandar | Pesos safetensors + GGUF de terceros + API |
| orcarouter/Qwen3.8-27B-Uncensored (base) | 27B (heredado) | No disponible | No disponible | No disponible | Pesos en HuggingFace |
| darkc0de/XORTRON.CriminalComputing (27B) | 27B | No disponible | Imagen-texto | No disponible | Pesos en HuggingFace, con trafico registrado |
| darkc0de/XORTRON.CriminalComputing.2026.4B.Instruct.NEXT | 5B | No disponible | Imagen-texto | No disponible | Pesos en HuggingFace, con trafico registrado |
| Modelo alineado de tamano similar (Qwen3.5 27B / Gemma 3 27B) | ~27-32B | No disponible | Texto o multimodal | Licencia permisiva estandar | Amplia, con benchmarks publicados |

La comparacion relevante no es de rendimiento, sino de regimen de uso: frente a un modelo alineado equivalente, aqui el eje diferencial es la ausencia de rechazos y un acuerdo de acceso restringido en lugar de una licencia OSI, con cero datos publicos de evaluacion.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de validacion independiente: 0 descargas y 0 valoraciones en el momento de redactar la ficha.
- Toxicidad y capacidad de dano por diseno: los tags `toxic`, `harmful` y `not-for-all-audiences` son explicitos, y la ablitation elimina las negativas del modelo base.
- Riesgo elevado de alucinacion, agravado porque el ajuste se orienta a producir contenido plausible en dominios de alto riesgo sin verificacion factual.
- Sesgos desconocidos: no se documenta composicion del dataset `The-Mind-of-XORTRON`, por lo que no se puede evaluar el sesgo de entrenamiento en genero, raza, religion o nacionalidad.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta garantizado aunque el base sea multilingue.
- Ambiguedad de licencia: no existe licencia estandar; el "Restricted Access & Authorized-Use Agreement" es un texto propio del autor cuya exigibilidad legal es dudosa y que puede entrar en conflicto con el regimen del modelo base.
- Uso comercial: no autorizado de forma clara; el acuerdo esta pensado para investigacion, evaluacion y fines defensivos, no para despliegues de producto.
- Despliegue en produccion desaconsejado sin guardarrailes externos (clasificadores de entrada y salida, filtros de contenido, registro de auditoria), dado que el modelo no aplica rechazos por si mismo.
- Fecha de creacion declarada (24 de octubre de 2026) posterior a la de otras publicaciones de la familia, y autoria dispersa entre `robbin052`, `darkc0de` y la organizacion `xortron`; conviene verificar la procedencia exacta de los pesos antes de usarlos.
- No hay garantia de que las conversiones GGUF conserven la torre de vision ni de que respeten los mismos pesos que el repositorio original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robbin052/XORTRON-AgentRICO
- Conversion GGUF de terceros: https://huggingface.co/mradermacher/XORTRON-AgentRICO-GGUF
- Despliegue gestionado (Featherless, contexto 32K): https://featherless.ai/models/darkc0de/XORTRON-AgentRICO
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Dataset de ajuste: https://huggingface.co/datasets/darkc0de/The-Mind-of-XORTRON
- Organizacion XORTRON en HuggingFace: https://huggingface.co/xortron
- Sitio del proyecto XORTRON Criminal Computing: https://xortron.ai
- Pagina estatica del proyecto: https://darkc0de-xortronos.static.hf.space/
- Lista curada de modelos ofensivos/uncensored: https://github.com/JoasASantos/Offensive-Security-AI-Models
- Trend Micro Research, Malicious Uses and Abuses of Artificial Intelligence: https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- TRM Labs, The Rise of AI-Enabled Crime: https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- American Military University, AI-Enabled Crime: https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/
- Congreso de EE. UU., 119th Congress Hearing Record: https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
- KELA, AI Cybercrime Report Q4 2026: https://www.kelacyber.com/resources/research/ai-cybercrime-report-q4-2026/
- CrowdStrike, 2026 Global Threat Report: https://go.crowdstrike.com/2026-global-threat-report.html
