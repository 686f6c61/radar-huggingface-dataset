# hellnahbru/Carbon-X-preserved-20261029

## Resumen

Carbon-X es un modelo lingüístico de 14,8B parámetros entrenado conjuntamente sobre secuencias de ADN y texto en lenguaje natural, desarrollado dentro de la familia de modelos **Carbon** (la model card remite a la organización HuggingFaceBio; la ficha analizada corresponde a una copia preservada bajo el ID `hellnahbru/Carbon-X-preserved-20261029`). Resuelve un problema concreto: permitir analizar secuencias genómicas en lenguaje natural sin necesidad de un encoder de ADN separado ni de infraestructura especializada. Se basa en Qwen3-14B, al que se le aplica un mid-training de 302B tokens con datos de ADN, texto biológico, inglés e instrucciones, seguido de SFT y aprendizaje por refuerzo con recompensas verificables en tareas de ADN.

Su relevancia radica en la relación coste/rendimiento: alcanza una media del 66,7% en cinco benchmarks de ADN (27 puntos por encima de Qwen3-14B, su modelo base), por delante de los modelos abiertos evaluados y cerca de GPT-6.1 Sol (67,5%) a una fracción mínima del coste de inferencia. Los pesos caben en una única GPU de 80 GB en bfloat16, lo que permite procesar secuencias sensibles o no publicadas en infraestructura propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, GQA, SwiGLU, RMSNorm con QK-norm |
| Parametros totales | 14.822.046.720 (14,8B) |
| Parametros activos | no disponible (no se indica si es MoE; la arquitectura descrita sugiere denso) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (texto) y ADN como modalidad de entrada/salida |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (29,7 GB en el repositorio) |

## Arquitectura y entrenamiento

Carbon-X es un modelo causal decoder-only de 40 capas con tamaño oculto 5120, atención con agrupación de consultas (GQA: 40 cabezas de consulta y 8 cabezas KV), activación SwiGLU y RMSNorm con QK-norm. La innovación central es el tokenizador híbrido: mantiene el vocabulario BPE de Qwen3 para texto y añade 5.515 tokens de ADN, de los cuales 4.096 son 6-meros no solapados (un token cubre 6 pares de bases), 1.364 son tokens de cola para secuencias cuya longitud no es múltiplo de 6, y los marcadores `<dna>`, `</dna>` y `<oov>`. El ADN en un prompt se detecta y etiqueta automáticamente. ADN y texto comparten un único flujo de tokens en un único decoder, sin encoder separado.

El entrenamiento consta de un mid-training de 302B tokens sobre ADN, texto biológico, inglés y datos de instrucciones, partiendo de Qwen3-14B. Después se aplica fine-tuning supervisado y aprendizaje por refuerzo con recompensas verificables (RLVR) en tareas de ADN. El modelo se post-entrena y evalúa con el modo thinking desactivado (`enable_thinking=False`), respondiendo directamente sin razonamiento extendido, lo que reduce drásticamente los tokens de salida por problema. Los parámetros de muestreo por defecto son temperatura 0,6, top-p 0,95 y top-k 20.

## Capacidades

- Predicción del efecto de variantes: clasifica mutaciones como benignas o patógenas explicando el razonamiento en inglés.
- Identificación de regiones reguladoras que controlan la actividad génica.
- Clasificación de secuencias por grupo de organismo.
- Predicción de las siguientes bases de una secuencia (next-base prediction).
- Generación de respuestas mixtas que combinan ADN y lenguaje natural en una misma salida.
- Comprensión y generación de texto conversacional en inglés heredada del preentrenamiento de Qwen3-14B.
- Uso como herramienta dentro de pipelines de agentes (la model card incluye una sección específica sobre este uso).
- Inferencia eficiente: sirve con vLLM en una única GPU, con coste bajo por problema al no requerir razonamiento extendido.

No se documenta soporte de tool calling nativo, visión ni audio en la información disponible.

## Casos de uso

- **Triaje de variantes de significado incierto (VUS) en ClinVar**: el modelo puede analizar variantes en lote dentro de un chat, clasificándolas como probablemente benignas o patógenas. Según los autores, analizar los 2,4 millones de VUS de ClinVar costaría unos 300 $ con Carbon-X frente a 32.000–4.000.000 $ con modelos frontera evaluados.
- **Investigación genómica con datos sensibles**: al caber en una única GPU de 80 GB, laboratorios y hospitales pueden analizar secuencias no publicadas o de pacientes en su propia infraestructura sin enviar datos a APIs externas.
- **Anotación de regiones reguladoras**: identificación de secuencias que controlan la actividad génica, útil en pipelines de anotación funcional de genomas.
- **Clasificación taxonómica de secuencias**: determinación del grupo de organismo al que pertenece una secuencia de ADN, aplicable en metagenómica y control de calidad de muestras.
- **Predicción de secuencias (next-base)**: extensión de secuencias de ADN base a base, útil para completar lecturas parciales o generar candidatos en diseño experimental.
- **Asistente conversacional para biólogos**: explicación en lenguaje natural del razonamiento tras cada predicción, útil para revisión por parte de investigadores no expertos en ML.
- **Componente de agente bioinformático**: puede invocarse como herramienta dentro de agentes multi-paso que combinen consulta de bases de datos, análisis de secuencias y redacción de informes.

## Benchmarks y rendimiento

Datos publicados en la model card (media sobre cinco benchmarks de ADN que cubren predicción de efecto de variantes, comprensión de secuencias y predicción de próxima base):

| Modelo | Media en benchmarks de ADN | Notas |
|---|---|---|
| Carbon-X (14,8B) | 66,7% | Con thinking desactivado |
| GPT-6.1 Sol | 67,5% | Coste por problema ~1.800 veces mayor que Carbon-X |
| Qwen3-14B (modelo base) | 39,7% (66,7% − 27 puntos) | Diferencia indicada por los autores |

Carbon-X lidera todos los modelos evaluados en efecto de variantes coding y en predicción de próxima base, según la model card. No se han publicado los resultados desglosados por benchmark ni métricas estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: los pesos en bfloat16 ocupan 29,7 GB y caben en una única GPU de 80 GB según la model card; con cuantización adicional (no documentada oficialmente) podrían reducirse, pero no hay datos publicados.
- **GPU recomendadas**: H200 (referencia usada por los autores para medir throughput y coste); cualquier GPU de 80 GB (A100/H100) es suficiente en bfloat16.
- **Consumer GPUs**: con 29,7 GB en bfloat16 no cabe en una RTX 4090 (24 GB); sería necesaria cuantización no documentada oficialmente o GPUs de gama alta (A6000, RTX 6000 Ada con 48 GB posiblemente suficiente).
- **Despliegue**: vLLM (`vllm serve` con `--trust-remote-code`, compatible con la API de OpenAI) y Transformers v5 o posterior con `trust_remote_code=True` para el tokenizador. No se documenta soporte de llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no se publican cifras absolutas; se indica que responde directamente sin razonamiento extendido, con pocos tokens de salida por problema, y que el coste se midió como throughput por hora de H200 a 5 $/hora.

## Comparativa con modelos similares

| Característica | Carbon-X | Qwen3-14B (base) | GPT-6.1 Sol |
|---|---|---|---|
| Parámetros | 14,8B | 14,8B | no disponible |
| Contexto | 40.960 tokens | 40.960 tokens (según Qwen3) | no disponible |
| Media benchmarks ADN | 66,7% | 39,7% (aprox., según diferencia publicada) | 67,5% |
| Especialización ADN | Nativa (tokenizador híbrido 6-meros) | No | No documentada |
| Licencia | Apache 2.0 | Apache 2.0 | Propietaria (API) |
| Despliegue local | Sí, 1 GPU de 80 GB | Sí | No |
| Coste por problema | ~1/1.800 del modelo frontera | Bajo | Alto |

Otros modelos abiertos de ADN evaluados por los autores quedan por detrás de Carbon-X en la media de los cinco benchmarks, aunque no se publican sus identidades ni puntuaciones en la información disponible.

## Limitaciones y advertencias

- Idioma: el texto conversacional está restringido al inglés; no se documenta soporte para castellano ni otros idiomas.
- El modo thinking debe mantenerse desactivado (`enable_thinking=False`): el modelo fue post-entrenado y evaluado así, y los autores recomiendan explícitamente no activarlo.
- El tokenizador de ADN es código personalizado: es obligatorio usar `trust_remote_code=True` y Transformers v5 o posterior, lo que implica ejecutar código remoto al cargarlo (revisar antes en entornos de producción).
- Las predicciones de efecto de variantes son salidas de un modelo lingüístico, no diagnósticos clínicos: cualquier uso en contexto biomédico real requiere validación experimental y supervisión experta.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- Sesgos conocidos: no disponible. Riesgo de alucinación: no cuantificado en la model card, aunque inherente a modelos lingüísticos generativos.
- Licencia Apache 2.0 sin restricciones de uso comercial conocidas, aunque la copia analizada es de un tercero (`hellnahbru`); para producción conviene verificar la procedencia contra el repositorio oficial de HuggingFaceBio.

## Enlaces

- Ficha analizada (copia preservada): https://huggingface.co/hellnahbru/Carbon-X-preserved-20261029
- Repositorio oficial referenciado en la model card: https://huggingface.co/HuggingFaceBio/Carbon-X
- Organización HuggingFaceBio: https://huggingface.co/HuggingFaceBio
- Blog de la release: https://huggingface.co/spaces/HuggingFaceBio/Carbon-X-Release
- Código (GitHub): https://github.com/huggingface/carbon/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
