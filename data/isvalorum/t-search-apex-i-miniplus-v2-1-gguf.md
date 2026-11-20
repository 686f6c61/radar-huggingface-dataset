# IsValorum/T-Search-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

T-Search APEX-I-MiniPlus-V2.1-GGUF es una cuantización artesanal, tensor a tensor, del modelo T-Search desarrollado por t-tech. Se trata de un transformer de mezcla de expertos (MoE) con 35.505.251.456 parámetros totales, diseñado específicamente como recuperador agéntico: planifica consultas, ejecuta búsquedas en múltiples rondas y sintetiza cadenas de evidencia verificables. Esta versión GGUF, publicada por IsValorum, está pensada para inferencia en llama.cpp con un equilibrio agresivo entre tamaño en disco (15,23 GB) y fidelidad de razonamiento.

La relevancia de esta ficha reside en que las cuantizaciones comunitarias convencionales degradan las matrices de enrutamiento y las feed-forward de los expertos a codebooks de 2 bits, lo que corrompe las trayectorias de planificación de búsqueda y provoca filtros de consulta alucinados. Esta edición mantiene las puertas de enrutamiento (`gate_inp`, `gate_shexp`) en F32 sin comprimir, protege la cabeza de salida de tokens en Q6_K y las proyecciones de atención en Q8_0, con una perplejidad media de 5,6716 frente a 5,62 del BF16 de referencia (ΔPPL +0,92 %).

El modelo declara soporte para 13 idiomas (en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar), licencia Apache 2.0 y compatibilidad con endpoints. Incluye además un proyector de visión multimodal Q8_0 empaquetado (`mmproj`), lo que lo convierte en una opción poco habitual dentro del ecosistema GGUF para tareas de recuperación con entrada visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 40 capas, 256 micro-expertos; etiquetado como `qwen35moe` |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (según model card) |
| Tipos de cuantizacion | GGUF custom tensor a tensor; media de 3,43 BPW; mezcla de F32, Q8_0, Q6_K y tipos de menor precisión en expertos no críticos; incluye `imatrix` |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 15,8 GB; archivo principal de 15,23 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con 40 capas y 256 micro-expertos, etiquetado en los tags como `qwen35moe`, lo que sugiere una base derivada de la familia Qwen 3.5 MoE. El modelo está especializado como recuperador agéntico: planifica, ejecuta búsquedas en múltiples rondas y sintetiza evidencia. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles.

La innovación técnica principal de esta release no está en el entrenamiento sino en la cuantización: es un proceso 100 % artesanal, tensor a tensor, con matrices de importancia calibradas (`imatrix`) y overrides matemáticos de precisión. Las puertas de enrutamiento se preservan en F32 para evitar deriva del router, la cabeza de salida de tokens se protege en Q6_K y las proyecciones de atención se mantienen en Q8_0. El paquete incluye un proyector de visión multimodal Q8_0 de alta precisión. La model card menciona decodificación especulativa MTP integrada en `llama-server` y una plantilla de chat endurecida para agentes con control de esfuerzo de razonamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a agentes.
- Recuperación agéntica: planificación de consultas, ejecución de búsquedas en múltiples rondas y síntesis de cadenas de evidencia verificables.
- Razonamiento con modo de esfuerzo configurable mediante plantilla de chat endurecida.
- Capacidades multimodales de visión gracias al proyector `mmproj` Q8_0 empaquetado.
- Soporte multilingüe en 13 idiomas, incluidos español, chino, inglés, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Integración con llama.cpp, incluido `llama-server` con decodificación especulativa MTP.
- Soporte de tool calling y function calling: no disponible de forma explícita en la información proporcionada, aunque el diseño agéntico y la plantilla de chat lo hacen plausible; no se confirma.

## Casos de uso

- Investigación profunda automatizada: el modelo planifica consultas sucesivas, ejecuta búsquedas en múltiples rondas y sintetiza evidencia con trazabilidad, aprovechando su contexto de 256K para mantener el hilo de una investigación larga.
- Agentes de recuperación de documentos internos: integrado en un pipeline RAG, el modelo genera filtros de consulta precisos y evita la alucinación de operadores de búsqueda gracias a la preservación de las puertas de enrutamiento en F32.
- Asistente de atención al cliente con base de conocimiento: gestiona conversaciones multi-turno con contexto largo y recupera fragmentos relevantes de documentación para responder con evidencia.
- Análisis de documentos con imágenes: el proyector de visión Q8_0 permite procesar capturas, diagramas o páginas escaneadas junto con texto para extraer y sintetizar información.
- Despliegue en estaciones de trabajo de 24 GB: con 15,23 GB en disco y 14,18 GiB de huella, permite ejecutar el contexto completo de 256K en VRAM en una GPU de 24 GB, habilitando agentes de búsqueda de larga duración en hardware de consumo profesional.
- Inferencia en CPU con streaming desde RAM: en configuraciones sin GPU suficiente, el modelo puede ejecutarse total o parcialmente desde memoria del sistema a 20-45 tok/s según el procesador y el ancho de banda DDR4/DDR5.
- Generación de código asistida por búsqueda: la model card advierte sobre la penalización de repetición y el intercambio de caracteres en sintaxis de código, por lo que su uso en código requiere ajustar los parámetros de generación recomendados por t-tech.

## Benchmarks y rendimiento

| Especificación | Tamano en disco | Huella en RAM/VRAM | BPW medio | Perplejidad WikiText-2 | Nivel de calidad equivalente |
|---|---|---|---|---|---|
| BF16 sin cuantizar (referencia) | ~70,0 GB | ~65,2 GiB | 16,00 | ~5,62 | Línea base de precisión completa |
| APEX-I-MiniPlus V2.1 | 15,23 GB | 14,18 GiB | 3,43 | 5,6716 ± 0,12975 (ΔPPL +0,0516 / +0,92 %) | Nivel Q5_K_L (rozando Q6_K) |

No se han publicado en la información disponible resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros); solo se aporta la perplejidad en WikiText-2 y las métricas de rendimiento de hardware descritas en la sección de requisitos.

## Requisitos de hardware

- Huella de memoria del modelo: 14,18 GiB en RAM/VRAM; archivo en disco de 15,23 GB.
- Contexto completo de 256K en VRAM: viable en GPU de 24 GB (la model card lo denomina "el milagro de 24 GB").
- GPU recomendadas: no se especifican modelos concretos en la información; la model card menciona benchmarks de offload para RTX 30, RTX 40 y RTX 50.
- Inferencia en CPU/RAM: 20-45 tok/s según procesador, ancho de banda de memoria y configuración DDR4/DDR5.
- Offload parcial: permite colocar el modelo y el contexto que no caben en VRAM en memoria del sistema, manteniendo generación estable en contextos largos.
- Opciones de despliegue: llama.cpp (`llama-server` con decodificación especulativa MTP integrada, y CLI directo para arnés de recuperación agéntica); compatible con endpoints.
- Latencia y throughput: no se publican cifras detalladas por GPU en la información disponible; solo el rango de 20-45 tok/s en CPU/RAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| T-Search APEX-I-MiniPlus V2.1 (esta ficha) | 35,5 B totales (MoE) | 256K | Apache 2.0 | GGUF custom 3,43 BPW | Cuantización artesanal con router en F32 y visión Q8_0 |
| T-Search (base t-tech) | 35,5 B totales (MoE) | 256K | Apache 2.0 | Safetensors/BF16 | Modelo original sin cuantizar, ~70 GB |
| APEX-I-Mini genérico de la comunidad | 35,5 B (mismo base) | 256K | Apache 2.0 | GGUF IQ2_S/Q3_K | Expertos a 2 bits, cabeza de salida a 3 bits; mayor degradación en agentes de recuperación |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada, por lo que la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- La model card advierte de que las cuantizaciones comunitarias genéricas del mismo modelo base degradan el enrutamiento y provocan alucinación de operadores de búsqueda; esta release mitiga el problema, pero sigue siendo una cuantización de 3,43 BPW con una pérdida de perplejidad de +0,92 % respecto al BF16.
- Riesgo de alucinación inherente a modelos de razonamiento y recuperación, especialmente en la generación de filtros de consulta y cadenas de evidencia.
- Advertencia específica sobre sintaxis de código: la model card incluye un aviso crítico sobre la penalización de repetición y el intercambio de caracteres en código; es necesario ajustar los parámetros de generación recomendados por t-tech para evitar corrupción de sintaxis.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de idioma: aunque declara 13 idiomas, no se aportan evaluaciones por idioma; el rendimiento en lenguas distintas del inglés y el chino no está verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base t-tech/T-Search y el cumplimiento de las condiciones de atribución.
- La cuantización es una obra derivada de un tercero (IsValorum) no afiliado a t-tech; la fidelidad respecto al original está verificada solo mediante perplejidad en WikiText-2, no mediante benchmarks de tareas agénticas.
- El rendimiento en CPU depende fuertemente del ancho de banda de memoria; los 20-45 tok/s son un rango orientativo, no una garantía.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/T-Search-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/t-tech/T-Search
- Apoyo al autor de la cuantización: https://ko-fi.com/isvalorum
