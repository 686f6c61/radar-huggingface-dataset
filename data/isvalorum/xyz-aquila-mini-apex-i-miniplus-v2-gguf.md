# IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2-GGUF

## Resumen

XYZ-Aquila-mini APEX-I-MiniPlus V2 es una cuantización GGUF personalizada del modelo multimodal XYZAILab/XYZ-Aquila-mini, publicada por el usuario IsValorum. Se trata de una compilación tensor a tensor diseñada específicamente para preservar la calidad de un modelo MoE (mixture of experts) de aproximadamente 34.660 millones de parámetros totales, con capacidades de visión, búsqueda agéntica y uso de ordenador, manteniendo un peso en disco de unos 15,3 GB.

La relevancia de esta release radica en su enfoque de cuantización selectiva: en lugar de aplicar un esquema uniforme de baja precisión, protege los componentes críticos del modelo (router gates en F32, cabeza de salida en Q6_K, puertas de atención en Q8_0) y mantiene los expertos centrales de razonamiento en 3 bits calibrados. Esto permite ejecutar un modelo de 34B multimodal con contexto largo en hardware de consumo, incluyendo inferencia total o parcial en RAM del sistema.

El modelo está pensado para despliegues agénticos de largo contexto: ventanas de hasta 256K tokens, parsing visual en tiempo real mediante un proyector multimodal Q8_0 y compatibilidad con llama.cpp. La licencia Apache 2.0 facilita su uso comercial, aunque conviene verificar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) multimodal, derivada de qwen35moe según los tags del repositorio |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (según la model card) |
| Tipos de cuantizacion | GGUF personalizado: IQ3_S, IQ4_NL, Q8_0, Q6_K, Q5_K, Q3_K, IQ3_XXS, F32 (router gates) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector multimodal mmproj en Q8_0 |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura MoE y capacidades multimodales (image-text-to-text), identificado en los tags como qwen35moe. La cuantización V2 se estructura en 40 capas con un esquema por capas: las capas de borde (10 capas) emplean IQ3_S junto con expertos compartidos en IQ4_NL y puertas de atención en Q8_0. Los routers se mantienen sin comprimir en F32, la cabeza de salida en Q6_K y los expertos centrales de razonamiento en 3 bits calibrados (IQ3_XXS/IQ3_S). Esta selección busca evitar los picos de perplejidad y los errores sintácticos típicos de las cuantizaciones planas de 2-3 bits.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO. La model card no detalla el proceso de entrenamiento del modelo original, solo el proceso de cuantización. La variante V2.1, recomendada por el autor, sustituye los codebooks no lineales por expertos lineales Q3_K y eleva los expertos compartidos a Q5_K en las 40 capas, eliminando las paradas de desquantización AVX2 en CPU. Según la model card, V2.1 alcanza una perplejidad de 6,7927 ± 0,1884 en WikiText-2 (ΔPPL ≈ +0,07 respecto al baseline sin cuantizar, aproximadamente 6,72), con un peso de unos 14,7 GB.

## Capacidades

- Generación de texto conversacional multi-turno en 13 idiomas.
- Razonamiento y resolución de problemas complejos mediante expertos MoE.
- Procesamiento de imagen y texto (pipeline image-text-to-text) con proyector multimodal Q8_0 para parsing visual en tiempo real.
- Búsqueda agéntica (agentic-search, search-agent) y razonamiento multi-paso.
- Uso de ordenador (computer-use), orientado a interacción con interfaces.
- Soporte de tool calling y function calling, según los tags del repositorio.
- Contexto largo de hasta 256K tokens para tareas de razonamiento agéntico.
- Compatibilidad con endpoints y despliegue en llama.cpp.

## Casos de uso

- Agentes de búsqueda web: el modelo puede planificar consultas, leer resultados y sintetizar respuestas en ventanas de contexto largas, lo que encaja con los tags de agentic-search y search-agent.
- Automatización de uso de ordenador: interacción con interfaces gráficas y flujos multi-paso, adecuado por su capacidad computer-use y su contexto extendido para mantener el estado de la tarea.
- Análisis de documentos con imágenes: extracción de información de capturas, formularios o gráficos combinando el proyector visual Q8_0 con el razonamiento del modelo.
- Asistente de atención al cliente multilingüe: cobertura de 13 idiomas y conversaciones multi-turno con contexto largo, desplegable en llama.cpp.
- Razonamiento agéntico en local: ejecución total o parcial en RAM del sistema (DDR4/DDR5) con velocidades de generación de 20 a 45 tok/s según el hardware, útil en entornos sin GPU de gran VRAM.
- Investigación y prototipado multimodal: evaluación de modelos MoE de 34B con visión en hardware de consumo, gracias al peso de 15,3 GB y a las opciones de offload.
- Pipelines de automatización con tool calling: integración en flujos que requieren llamadas a funciones y razonamiento encadenado con contexto de hasta 256K tokens.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Perplejidad WikiText-2 (V2.1) | 6,7927 ± 0,1884 | ΔPPL ≈ +0,07 respecto al baseline sin cuantizar (~6,72) |
| Perplejidad WikiText-2 (V2) | no disponible | La model card no publica el valor de V2 |
| Throughput en RAM del sistema | 20-45 tok/s | Según procesador y configuración DDR4/DDR5 |
| Throughput streaming (V2.1) | +24 a 28+ tok/s | Eliminación de paradas AVX2 en CPU |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 15,3 GB; el autor menciona que el contexto completo de 256K puede ejecutarse en VRAM en configuraciones de 24 GB.
- GPU recomendadas: no se especifican modelos concretos; la model card incluye proyecciones para RTX 30, 40 y 50 series.
- Cabe en GPU de consumo: sí, con 24 GB de VRAM según la model card ("The 24GB Miracle").
- Opciones de despliegue: llama.cpp; los tags indican compatibilidad con endpoints.
- Inferencia en RAM del sistema: soportada de forma total o parcial, con 20-45 tok/s según CPU y memoria DDR4/DDR5.
- Proyector multimodal: mmproj en Q8_0, pensado para mantenerse cargado en VRAM de GPU mientras el modelo principal hace streaming desde RAM.
- Latencia y throughput: no se publican cifras de latencia; el throughput estimado es de 20-45 tok/s en RAM y +24 a 28+ tok/s en streaming con V2.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XYZ-Aquila-mini APEX-I-MiniPlus V2 (este) | 34,66B | 256K | Apache 2.0 | GGUF | Cuantización selectiva con routers F32 y cabeza Q6_K |
| XYZ-Aquila-mini APEX-I-MiniPlus V2.1 | no disponible | 256K | Apache 2.0 | GGUF | Recomendado por el autor; PPL 6,7927; ~14,7 GB |
| APEX-I-Mini genérico de la comunidad | no disponible | no disponible | no disponible | GGUF | Expertos en IQ2_S, cabeza en Q3_K_M; menor calidad según el autor |
| XYZ-Aquila-mini (base) | 34,66B | no disponible | no disponible | safetensors | Modelo sin cuantizar de referencia |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La model card es del cuantizador, no del autor original; los datos de entrenamiento y sesgos del modelo base no están documentados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fiabilidad.
- La cuantización a 3 bits puede degradar tareas sensibles aunque se protejan los componentes críticos; el autor reconoce diferencias entre V2 y V2.1.
- Los benchmarks publicados se limitan a perplejidad en WikiText-2; no hay datos de MMLU, HumanEval ni otras tareas.
- El rendimiento en RAM depende de la CPU y del ancho de banda de memoria; en sistemas con DDR4 lento el throughput puede caer por debajo de las cifras indicadas.
- La licencia Apache 2.0 se aplica a esta cuantización, pero conviene verificar la licencia del modelo base XYZAILab/XYZ-Aquila-mini antes de uso comercial.
- El repositorio tiene solo 494 descargas y 1 like, por lo que la validación comunitaria es escasa.
- La model card está mayoritariamente en inglés y contiene afirmaciones de marketing del cuantizador que no están verificadas de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2-GGUF
- Versión V2.1 recomendada: https://huggingface.co/IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/XYZAILab/XYZ-Aquila-mini
- Apoyo al autor: https://ko-fi.com/isvalorum
