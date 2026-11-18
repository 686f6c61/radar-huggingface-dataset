# IsValorum/Groot-19B-A3B-261023-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Groot-19B-A3B-261023 APEX-I MiniPlus V2.1 es una cuantización GGUF del modelo multimodal Groot-19B-A3B-261023, desarrollado por GrootTeam y cuantizado por IsValorum bajo su serie APEX. El modelo base es un Mixture of Experts (MoE) de aproximadamente 19.000 millones de parámetros totales con arquitectura híbrida: 30 capas de atención lineal/SSM combinadas con 10 capas de atención completa, más un bloque MTP (multi-token prediction) para decodificación especulativa. Está orientado a tareas de imagen-texto-a-texto, lo que lo sitúa en la categoría de modelos multimodales con capacidad de visión.

La relevancia de esta ficha concreta reside en la cuantización: el archivo principal ocupa 8,42 GB con 3,5472 bits por peso, lo que permite ejecutar un modelo MoE de 19B con visión en hardware de consumo mediante llama.cpp. La receta MiniPlus V2.1 emplea una matriz de importancia (imatrix) pública de bartowski y mantiene en F32 los tensores críticos del bloque SSM (coeficientes recurrentes, convoluciones y normalizaciones), una decisión técnica que busca preservar la estabilidad del estado recurrente tras la cuantización agresiva.

El modelo se distribuye con licencia Apache-2.0, incluye proyectores de visión separados (F16 y Q8_0) y soporta decodificación especulativa mediante el bloque MTP integrado. Está pensado para despliegue local en estaciones de trabajo y equipos de consumo, con integración directa en llama.cpp y en el agente de escritorio V-Agent del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 30 capas de atención lineal/SSM + 10 capas de atención completa + 1 bloque MTP; 40 capas de lenguaje |
| Parametros totales | 18.985.723.008 (~19B) |
| Parametros activos | 8 expertos enrutados de 128 + 1 experto compartido por token (no se especifica el total de parámetros activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF con mezcla de precisión: F32, Q8_0, Q6_K, Q5_K, Q4_K, Q4_0, Q3_K, IQ3_XXS (3,5472 bits por peso en el archivo MiniPlus V2.1) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyectores de visión en GGUF F16 y Q8_0 |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura MoE híbrida con 40 capas de lenguaje más un bloque MTP adicional. De las 40 capas, 30 son de atención lineal/SSM (state space model) y 10 son de atención completa, una combinación que busca reducir el coste computacional y de memoria del contexto largo manteniendo capacidad de atención global en capas seleccionadas. El componente MoE consta de 128 expertos enrutados más 1 experto compartido, con 8 expertos enrutados activos por token, tamaño oculto de 2048 y tamaño intermedio de experto de 512. El bloque MTP (capa 40) habilita decodificación especulativa mediante `--spec-type draft-mtp` en llama.cpp b12017 o superior.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La cuantización APEX-I MiniPlus V2.1 utiliza una imatrix pública de bartowski (`GrootTeam_Groot-19B-A3B-261023-imatrix.gguf`) calculada con 573 fragmentos de 512 tokens del conjunto `calibration-v6`, con 510 entradas que cubren 400 de los 413 tensores cuantizados. Los 13 tensores no cubiertos son `output.weight`, `token_embd.weight` y el bloque MTP, que usan K-quants o Q4_0. Como innovación técnica destacable, la receta mantiene en F32 todos los tensores del bloque SSM (`ssm_alpha`, `ssm_a`, `ssm_dt.bias`, `ssm_conv1d`) y las RMSNorm, además de los logits del router (`ffn_gate_inp`), para evitar degradación del estado recurrente y del enrutamiento de expertos.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 262.144 tokens.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) mediante proyectores de visión separados en F16 o Q8_0.
- Razonamiento multi-paso y soporte de agentes, con integración en el agente de escritorio V-Agent (herramientas de ficheros, búsqueda web, navegador y servidores MCP).
- Decodificación especulativa nativa mediante el bloque MTP integrado en el GGUF principal.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Asistencia conversacional local con contexto largo: la ventana de 262.144 tokens permite mantener conversaciones o documentos completos en memoria sin truncamiento, adecuado para análisis de expedientes, contratos o bases de conocimiento extensas en un equipo de sobremesa.
- Análisis de documentos con imágenes: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto a texto de instrucciones, útil para extracción de información de informes técnicos o facturas.
- Agente de escritorio con herramientas: mediante V-Agent, el modelo puede ejecutar tareas de sistema de ficheros, búsqueda web y navegación con aprobaciones por acción, en un entorno aislado por chat y sin telemetría.
- Prototipado de pipelines multimodales en llama.cpp: el GGUF con mezcla de cuantizaciones permite validar flujos de visión y texto en hardware de consumo antes de escalar a infraestructura mayor.
- Generación asistida en local para desarrollo: con 8,42 GB de peso, cabe en GPUs de consumo de 12 GB o más, lo que permite usarlo como asistente de código y documentación sin dependencia de la nube.
- Evaluación de cuantizaciones: la documentación exhaustiva del mapa de tensores y de las métricas de bits por peso lo convierte en un caso de estudio para comparar recetas de cuantización en arquitecturas SSM/MoE híbridas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con licencia Apache-2.0, encaja en escenarios donde no se permite enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de la cuantización (tamaño de archivo, bits por peso, recuento de tensores y coincidencia del mapa de tensores con la cabecera GGUF), no métricas de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,42 GB solo para los pesos del modelo principal; hay que sumar el proyector de visión (610,7 MB en Q8_0 o el equivalente F16) y la caché KV, que con 262.144 tokens de contexto puede crecer de forma significativa.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño de pesos, una GPU con 12 GB o más permite cargar el modelo principal; para contexto largo conviene 16-24 GB.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12 GB de VRAM para el modelo principal; el autor indica que V-Agent marca los archivos que "caben en GPU".
- Opciones de despliegue: llama.cpp (CUDA, Vulkan o CPU) y el agente V-Agent; el bloque MTP requiere llama.cpp b12017 o superior con `--spec-type draft-mtp`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (MoE multimodal de ~19B con contexto de 262K) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización a 3,5472 bits por peso introduce pérdida de precisión; el autor mantiene en F32 los tensores SSM y de normalización para mitigarla, pero no se ha re-evaluado la calidad tras el proceso.
- La calidad de visión no fue re-evaluada después de la cuantización, según indica la propia model card.
- No hay información sobre sesgos, idiomas soportados ni comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad.
- El contexto de 262.144 tokens exige memoria adicional para la caché KV; en GPUs de 12 GB el contexto práctico será mucho menor.
- El bloque MTP solo funciona con versiones recientes de llama.cpp (b12017 o superior); versiones anteriores ignorarán la decodificación especulativa.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los proyectores deben verificarse por separado en sus repositorios de origen.
- La cuantización fue financiada y calculada de forma independiente por el autor; no hay validación externa publicada de la receta MiniPlus V2.1.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Groot-19B-A3B-261023-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Agente V-Agent (GitHub): https://github.com/IsValorum/V-Agent
- Descargas de V-Agent: https://github.com/IsValorum/V-Agent/releases/latest
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
