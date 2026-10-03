# Ishowbackup/Kolibri-1

## Resumen

Kolibri-1 es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Aleph Alpha Research GmbH y publicado originalmente como Aleph-Alpha/Kolibri-1-BF16. La ficha que se analiza aquí, Ishowbackup/Kolibri-1, es una copia de terceros en precisión FP8 del modelo base, con 78.103.074.560 parámetros totales y 3.457.573.120 parámetros activos por token (en torno al 4,4 % del total). Está especializado en alemán e inglés y en tareas de razonamiento multi-paso, uso de herramientas y contexto largo.

El modelo emplea una arquitectura transformer de 50 capas con atención híbrida 4:1 entre ventana deslizante (SWA) y atención por consultas agrupadas (GQA), con 384 expertos por capa (1 compartido y 6 enrutados). Su rasgo más distintivo es la longitud de contexto: 262.144 tokens nativos y calidad validada hasta 1.048.576 tokens, gracias a que la codificación posicional solo se aplica en las capas de ventana deslizante y el contexto puede extenderse sin reescalado posicional.

Es relevante ahora porque combina un coste de cómputo por token bajo (3,46B parámetros activos) con una huella de memoria de aproximadamente 78 GB en FP8, lo que permite desplegarlo en configuraciones de uno o dos aceleradores de gama alta, y porque se distribuye bajo licencia Apache 2.0, con lo que se puede usar comercialmente sin restricciones de pesos. Aleph Alpha lo posiciona como modelo soberano europeo, alineado con el código de buenas prácticas de la UE para modelos de IA de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, 50 capas, atención híbrida 4:1 SWA:GQA |
| Parámetros totales | 78.103.074.560 (aproximadamente 78B) |
| Parámetros activos | 3.457.573.120 (aproximadamente 3,46B) por token |
| Longitud de contexto | 1.048.576 tokens validados; 262.144 tokens nativos; se recomienda no superar 262.144 tokens para eficiencia y tareas complejas |
| Tipos de cuantización | FP8 (`float8_e4m3fn`) con bloques de 128×128 y activaciones cuantizadas dinámicamente, caché KV en FP8; embeddings, LM head, normalizaciones y router MoE en `bfloat16`. No se documentan otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Alemán (de) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (precisión FP8) |
| Expertos por capa | 384 (1 compartido, 6 enrutados) |
| Fecha de corte de conocimiento | Inglés: 18 de junio de 2026; alemán: 18 de junio de 2026 |
| Fecha de publicación | 3 de octubre de 2026 |
| Modo de razonamiento | Sí |
| Tool calling | Sí |
| Tamaño del repositorio | 78,9 GB |

## Arquitectura y entrenamiento

Kolibri-1 es un transformer MoE de 50 capas con una proporción de atención 4:1 entre capas de ventana deslizante y capas de atención por consultas agrupadas (GQA). Cada capa contiene 384 expertos, de los cuales 1 es compartido y 6 se enrutan por token. El entrenamiento utilizó los optimizadores Muon y Exact Quantile Balancing. Solo las capas de ventana deslizante aplican codificación posicional, lo que permite extender el contexto más allá de la longitud nativa sin escalado posicional. El modelo incorpora un tokenizador diseñado específicamente para la estructura morfológica del alemán sin penalizar el rendimiento en inglés.

Los datos de preentrenamiento suman 20 billones (20T) de tokens de un corpus bilingüe filtrado con una composición aproximada del 62,5 % de inglés, 23,9 % de alemán y 13,6 % de código, combinando web curada, reescrituras y traducciones sintéticas y fuentes de alta calidad. El preentrenamiento se realizó sobre secuencias de 16.384 tokens; después hubo una fase de mid-training con 3,44T tokens sobre secuencias de 65.536 tokens (5 días, 90.000 GPU-h) y una fase final de extensión de contexto de 201B tokens sobre 262.144 tokens (13 horas, 10.000 GPU-h). El postentrenamiento incluyó una mezcla de SFT con datos bilingües filtrados, conjuntos abiertos y datos sintéticos, seguida de RL sobre entornos de razonamiento, uso agéntico de herramientas y seguimiento de instrucciones.

El cómputo total de preentrenamiento se estima en 6,4e23 FLOPS, ejecutado sobre 768 GPU NVIDIA B200 (96 nodos HGX 8xB200) con paralelismo EP8 FSDP16 DP6 durante 21 días (511 horas, 392.000 GPU-h). La versión distribuida en este repositorio se ha convertido a FP8 con pesos en bloques de 128×128, activaciones cuantizadas dinámicamente y caché KV en FP8, manteniendo en `bfloat16` los embeddings, la LM head, las normalizaciones y el router MoE.

## Capacidades

- Generación de texto conversacional en alemán e inglés, con registro formal y técnico.
- Modo de razonamiento explícito ("reasoning mode") para problemas de varios pasos, activable de forma diferenciada.
- Tool calling y function calling, incluyendo encadenamiento de llamadas en flujos agénticos.
- Razonamiento multi-paso y descomposición de tareas en subtareas.
- Generación y asistencia sobre código, con un 13,6 % de tokens de código en el preentrenamiento.
- Procesamiento de documentos largos: contexto validado de hasta 1.048.576 tokens y 262.144 tokens nativos.
- Recuperación aumentada (RAG) sobre corpus propios, con inyección de contexto extenso.
- Extracción estructurada de información y salidas con formato controlado.
- Capacidades multilingües limitadas al par alemán-inglés; no se documenta soporte de otros idiomas.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistentes conversacionales en alemán para atención al cliente: el modelo mantiene conversaciones multi-turno con contexto largo (hasta 262.144 tokens recomendados), lo que permite arrastrar el histórico completo de un caso sin resumir ni truncar.
- RAG sobre documentación corporativa: indexación de manuales, normativa o contratos y generación de respuestas fundamentadas, con capacidad de razonar sobre varios fragmentos recuperados simultáneamente.
- Procesamiento de documentos extensos: análisis de expedientes, informes anuales o documentación técnica de cientos de miles de tokens en una sola pasada, sin troceado agresivo.
- Agentes con tool calling: orquestación de APIs, búsquedas y ejecución de código dentro de flujos multi-paso, con validación posterior de resultados por parte del sistema llamante.
- Generación y revisión de código en pipelines de CI/CD: el modelo puede producir parches, explicar errores y llamar a herramientas de build o test, siempre con revisión humana antes de fusionar.
- Extracción estructurada para integración de datos: conversión de texto libre (correos, facturas, informes) a JSON o esquemas definidos, aprovechando el modo de razonamiento para resolver ambigüedades.
- Soporte a la investigación y conocimiento interno: asistentes que responden sobre repositorios documentales de una organización en alemán e inglés, con citas de las fuentes recuperadas.
- Sistemas de apoyo a la decisión en el lado consultivo: generación de borradores, resúmenes de evidencia y opciones ponderadas para revisión humana, no como componente decisorio autónomo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Huella de memoria del modelo en FP8: aproximadamente 78 GB solo para los pesos, según la model card.
- Configuración mínima documentada: 2× A100 80 GB, 2× H100 SXM5, 1× H200, 1× B200 o 1× B300.
- Configuración recomendada: 2× H100 SXM5, 2× H200, 1× B200 o 1× B300.
- Versión en `bfloat16` (Aleph-Alpha/Kolibri-1-BF16): 78.103.074.560 parámetros a 2 bytes por parámetro implican aproximadamente 156 GB de pesos, es decir, al menos 2× H100/H200 de 80 GB o un acelerador con 192 GB o más.
- Cabe en GPU de consumo: no disponible. Con 78 GB de pesos en FP8, no entra en ninguna GPU de consumo actual de 24 GB o 48 GB; se requeriría cuantización adicional no documentada por el autor.
- Caché KV: proporcional al contexto y a la configuración de atención; el modelo usa caché KV en FP8, pero no se publican cifras concretas de consumo por token.
- Opciones de despliegue: vLLM es la librería declarada por el autor del repositorio (`library_name: vllm`). No se documentan integraciones oficiales con llama.cpp, Ollama, TGI ni otros motores en la información proporcionada.
- Latencia y throughput: no disponible. La model card indica que el contexto se ha validado en calidad y eficiencia de servicio hasta 1.048.576 tokens, y recomienda no superar 262.144 tokens en despliegues sensibles a latencia, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ishowbackup/Kolibri-1 | 78B / 3,46B | 1.048.576 tokens validados (262.144 nativos) | Apache 2.0 | safetensors FP8 | Repositorio de terceros en HuggingFace, 0 descargas |
| Aleph-Alpha/Kolibri-1-BF16 | 78B / 3,46B | 1.048.576 tokens validados (262.144 nativos) | Apache 2.0 | safetensors BF16 | Repositorio base oficial |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de alternativas de la misma categoría (MoE de ~78B totales y ~3,5B activos, orientados a alemán e inglés), por lo que no es posible establecer una comparación cuantitativa con otros modelos.

## Limitaciones y advertencias

- Riesgo de alucinación: como cualquier modelo generativo, puede producir afirmaciones plausibles pero incorrectas, especialmente en tareas de extracción o resumen con contexto muy largo. El autor recomienda que una persona revise las salidas antes de actuar sobre ellas.
- Sesgos conocidos: no disponible. La información proporcionada no incluye una evaluación de sesgos ni de equidad.
- Cobertura lingüística limitada: solo alemán e inglés. El rendimiento en otros idiomas no está documentado y previsiblemente será muy inferior.
- Fecha de corte de conocimiento: 18 de junio de 2026 para ambos idiomas. Cualquier hecho posterior debe aportarse mediante herramientas o contexto.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y derechos de autor. No se documentan restricciones adicionales de uso aceptable en la información disponible.
- Uso previsto restringido a sistemas con supervisión humana: la model card indica explícitamente que no está pensado como componente decisorio autónomo ni para operación no supervisada.
- Procedencia del repositorio: se trata de una copia de terceros (autor "Ishowbackup") creada a partir de Aleph-Alpha/Kolibri-1-BF16, con 0 descargas y 0 valoraciones en el momento de la consulta. Conviene verificar la integridad de los pesos frente al repositorio oficial antes de usarlos en producción.
- Efecto de la cuantización FP8: la conversión a FP8 con activaciones dinámicas puede introducir una degradación de precisión respecto a la versión BF16; no se han publicado métricas que cuantifiquen esa diferencia.
- Coste de memoria del MoE: aunque solo se activan 3,46B parámetros por token, es necesario mantener los 78B en memoria, lo que excluye GPUs de consumo sin cuantizaciones adicionales no oficiales.
- Cumplimiento normativo: Aleph Alpha es firmante del código de buenas prácticas de la UE para modelos de IA de propósito general (GPAI), lo que puede implicar obligaciones de documentación para despliegues en la Unión Europea.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/Ishowbackup/Kolibri-1
- Modelo base oficial: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Informe técnico (tech report): https://aleph-alpha.com/downloads/tech-report.pdf
- Blog técnico de Aleph Alpha sobre Kolibri: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2512.11614
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2601.17858
- Código de buenas prácticas de la UE para modelos GPAI: https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai
