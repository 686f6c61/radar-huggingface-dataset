# imdecentralized/vigil-qwen3-4b-provenance

## Resumen

VIGIL es un adaptador QLoRA desarrollado por imdecentralized sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su propósito es actuar como un analista disciplinado por procedencia (provenance) sobre extractos de registros de vigilancia pública de Estados Unidos: el modelo lee fragmentos de dichos registros y emite una afirmación etiquetada por línea, clasificándola como DOCUMENTED, INFERRED, OBSERVED, UNKNOWN u OUT-OF-SCOPE. Cada afirmación asertiva debe citar el identificador del extracto proporcionado, y cada vacío de información incluye un manejador `req:` que nombra el registro que lo cerraría.

El adaptador se publica con licencia Apache 2.0 y pesa 0,5 GB, en formato safetensors y PEFT. Incluye un adaptador MVP entrenado con 96 ejemplos y una serie de checkpoints (`sweep_n25`, `n51`, `n103`, `n207`) que trazan una curva de eficiencia de datos. El modelo base, Qwen3-4B-Instruct-2507, es una actualización reciente de la familia Qwen3 de Alibaba, con 4 000 millones de parámetros y capacidades de instrucción y razonamiento. La relevancia del modelo reside en su enfoque de transparencia en vigilancia: obliga al modelo a fundamentar cada afirmación en un extracto concreto y a señalar explícitamente qué información falta, lo que reduce la confianza sin base y facilita la auditoría de sus respuestas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B-Instruct-2507) con adaptadores QLoRA (PEFT) |
| Parametros totales | 4 000 millones (modelo base) + adaptadores (no especificado) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B-Instruct-2507 soporta 32 768 tokens, pero el adaptador no documenta limitaciones adicionales) |
| Tipos de cuantizacion | QLoRA (cuantización de 4 bits en el modelo base durante el entrenamiento); pesos del adaptador en safetensors |
| Idiomas soportados | No disponibles (el modelo base Qwen3-4B-Instruct-2507 es multilingüe, pero el adaptador está entrenado para textos de vigilancia en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen3-4B-Instruct-2507, una actualización de la serie Qwen3 que mejora el rendimiento en instrucciones y razonamiento sin modo de pensamiento explícito. El adaptador VIGIL se entrena mediante QLoRA, es decir, se congela el modelo base y se optimizan matrices de bajo rango sobre los pesos cuantizados a 4 bits, lo que reduce drásticamente el coste de entrenamiento y el tamaño del adaptador resultante (0,5 GB). No se especifica el número de tokens de entrenamiento ni la composición del dataset, pero la model card indica que el MVP se entrenó con 96 ejemplos y que existen checkpoints adicionales con 25, 51, 103 y 207 ejemplos, lo que sugiere un estudio de la eficiencia de datos. No se menciona el uso de RLHF ni DPO; el entrenamiento parece ser puramente supervisado con un formato de salida estructurado (etiquetas de procedencia y citas).

## Capacidades

- Generación de afirmaciones etiquetadas por procedencia: el modelo clasifica cada afirmación en `DOCUMENTED`, `INFERRED`, `OBSERVED`, `UNKNOWN` o `OUT-OF-SCOPE`.
- Citación obligatoria: cada afirmación asertiva incluye el identificador del extracto del registro que la respalda.
- Manejo de vacíos de información: cuando falta un dato, el modelo emite un manejador `req:` que nombra el registro concreto que cubriría el hueco.
- Análisis de registros de vigilancia pública de EE.UU.: el adaptador está especializado en este dominio y produce salidas en formato de línea única, aptas para procesamiento automatizado.
- Soporte de razonamiento multi-paso implícito: al exigir citas y manejadores, el modelo debe conectar la evidencia con la conclusión de forma explícita.
- Capacidades multilingües del modelo base: aunque el adaptador está orientado a inglés, el modelo subyacente puede procesar otros idiomas si se le presentan registros en esos idiomas (no verificado).

## Casos de uso

- Auditoría de informes de vigilancia: el modelo puede procesar informes de agencias y extraer afirmaciones con su fuente exacta, lo que permite a periodistas o investigadores verificar la trazabilidad de cada dato.
- Generación de resúmenes con procedencia: dado un conjunto de extractos, el modelo produce un resumen donde cada conclusión va acompañada del identificador del extracto que la sustenta.
- Detección de lagunas en expedientes: al marcar cada vacío con un `req:`, el modelo identifica qué registros adicionales se necesitan para completar una investigación.
- Clasificación de evidencia en procesos legales: puede etiquetar si un hecho está documentado, observado o inferido, ayudando a preparar argumentos con base sólida.
- Análisis de cobertura mediática sobre vigilancia: aplicado a artículos o transcripciones, puede distinguir entre lo que se afirma y lo que se infiere, señalando la fuente de cada dato.
- Construcción de bases de datos estructuradas a partir de documentos no estructurados: su formato de salida en línea única y etiquetado facilita la ingestión en sistemas de gestión documental o pipelines de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un script `eval.py` y un conjunto de evaluación (`--eval-set`) para reproducir una tabla de resultados, pero no se proporcionan cifras concretas en los materiales revisados. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-4B-Instruct-2507 en FP16 ocupa alrededor de 8 GB; el adaptador PEFT añade una carga mínima. Con cuantización 4 bits (por ejemplo, GGUF Q4_K_M) puede caber en ~2,5 GB de VRAM.
- GPU recomendadas: una RTX 3060 12 GB o RTX 4060 Ti 16 GB puede ejecutar el modelo en FP16 con margen; una RTX 4090 24 GB permite inferencia rápida y batch. Para entornos de servidor, A100 o H100 son opciones viables si se requiere alta concurrencia.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo cuantizado en 4 bits (por ejemplo, mediante llama.cpp o Ollama).
- Opciones de despliegue: vLLM (con soporte para PEFT adapters), llama.cpp, Ollama, TGI, o el propio script `eval.py` del autor para evaluación.
- Latencia y throughput: no disponibles. Para un modelo de 4B en una GPU moderna, se espera una latencia de decodificación del orden de 20-40 tokens/s en FP16 y mayor con cuantización, pero no hay datos medidos en la documentación.

## Comparativa con modelos similares

No hay información suficiente para una comparativa rigurosa. El adaptador es específico para un dominio (vigilancia pública) y no se han publicado métricas que permitan contrastarlo con otros modelos de la misma categoría (por ejemplo, otros adaptadores de extracción de información con procedencia). Se podría comparar con el modelo base Qwen3-4B-Instruct-2507, pero la model card no ofrece resultados de evaluación del adaptador frente a su base. Por tanto, se indica: no disponible.

## Limitaciones y advertencias

- El adaptador está especializado en registros de vigilancia pública de EE.UU.; su rendimiento fuera de ese dominio no está garantizado y puede degradarse significativamente.
- El entrenamiento con tan pocos ejemplos (96 en el MVP) implica que el modelo puede no generalizar bien a variaciones de formato o tipos de registros no vistos.
- Riesgo de alucinación: a pesar del etiquetado de procedencia, el modelo puede generar afirmaciones con etiquetas incorrectas o citas falsas si el contexto no es claro; la verificación humana sigue siendo necesaria.
- El adaptador no proporciona garantías de que las citas sean exactas; depende de que los extractos proporcionados tengan identificadores únicos y bien formados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0 también, según la documentación oficial), por lo que no hay restricción adicional, aunque se recomienda revisar los términos de Qwen para el modelo base.
- No se especifican límites de contexto del adaptador; se asume el contexto del modelo base (32 768 tokens), pero el adaptador puede no estar entrenado para secuencias largas.
- La documentación no detalla el proceso de entrenamiento ni los datos utilizados, lo que limita la reproducibilidad y la evaluación de sesgos.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/imdecentralized/vigil-qwen3-4b-provenance
- Modelo base Qwen3-4B-Instruct-2507 en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Página de referencia de arquitectura de Qwen: https://karam-nus.github.io/models/01_Qwen
- Herramienta de estimación de recursos para Qwen3-4B: https://www.canirun.ai/model/qwen3-4b
