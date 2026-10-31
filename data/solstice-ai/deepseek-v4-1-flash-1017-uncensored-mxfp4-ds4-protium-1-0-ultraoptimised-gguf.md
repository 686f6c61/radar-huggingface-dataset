# Solstice-AI/DeepSeek-V4.1-Flash-1017-UNCENSORED-MXFP4-ds4-Protium-1.0-UltraOptimised-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF MXFP4 del modelo DeepSeek-V4.1-Flash-1017-UNCENSORED, preparada para el motor de inferencia ds4 (DwarfStar). El modelo base es DeepSeek-V4.1-Flash-1017, un modelo mixture-of-experts (MoE) de 552B parámetros publicado por DeepSeek, al que el usuario dealignai aplicó un proceso de abliteración a nivel de pesos (eliminación de rechazos) y publicó como FP8 safetensors. Solstice-AI y spiritfather se limitan a convertir esos pesos al formato GGUF de ds4, sin modificarlos.

La relevancia de esta versión radica en que permite ejecutar localmente un modelo MoE de gran escala con arquitectura novedosa (atención comprimida, tablas de memoria n-grama "Engram" e hiper-conexiones), que llama.cpp todavía no soporta. El motor ds4, desarrollado por antirez, transmite los expertos enrutados y las tablas Engram desde SSD, lo que permite ejecutarlo en máquinas Apple Silicon de 256 GB de memoria unificada.

El repositorio pesa 501,6 GB distribuidos en 9 fragmentos GGUF que deben unirse con el script de merge de ds4 antes de su uso. El resultado es un archivo de 467,2 GiB con 1.046 tensores, validados contra el payload fuente y con los expertos enrutados de la capa 0 idénticos byte a byte a la build MXFP4 original de antirez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención comprimida, tablas de memoria Engram (n-grama) e hiper-conexiones |
| Parametros totales | 754.638.867.584 (según metadatos safetensors de HF); el README describe el base como 552B MoE |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (según el README, para el modelo base) |
| Tipos de cuantizacion | MXFP4 (expertos enrutados, 268,9 GiB), I8 (tablas Engram, 188,8 GiB), Q8_0 (atención, expertos compartidos y cabeza de salida, 7,1 GiB), F16/F32 (hiper-conexiones, compresor, indexador y normas, 2,3 GiB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (9 shards, 1.046 tensores, 467,2 GiB en total); fuente original en FP8 safetensors |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer mixture-of-experts con tres innovaciones arquitectónicas destacables: atención comprimida, tablas de memoria Engram (n-gram memory tables) que se leen desde disco en tiempo de ejecución, e hiper-conexiones. Esta combinación hace que el modelo no sea cargable por llama.cpp, lo que motivó la creación de ds4, un motor de inferencia dedicado con soporte para Metal, CUDA y ROCm.

Sobre el entrenamiento del modelo base no se dispone de datos en la información proporcionada (número de tokens, composición del dataset, RLHF/DPO): no disponible. Respecto a esta conversión concreta, el proceso de abliteración de dealignai no modificó los expertos enrutados (la capa 0 es byte-idéntica a la build MXFP4 original), por lo que la eliminación de rechazos se aplicó a otros componentes del modelo. La conversión a MXFP4 de los expertos es una repackaging sin pérdidas del FP4 nativo del checkpoint, verificado por el validador de ds4 sobre los 1.046 tensores.

## Capacidades

- Generación de texto general, con modo de pensamiento (thinking) activable y desactivable, según evidencia la evaluación en CaliperBench en ambas modalidades.
- Escritura creativa: el modelo está puntuado en CaliperBench, un benchmark centrado en calidad de prosa, roleplay y disposición a complir peticiones, no en inteligencia general.
- Versión "uncensored"/abliterated: los pesos han sido modificados para eliminar los rechazos de seguridad del modelo original, respondiendo a peticiones que el modelo base rechazaría.
- Contexto largo: hasta 1M de tokens según el modelo base, adecuado para documentos extensos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Vision, audio u otras modalidades: no disponible (pipeline de text-generation).

## Casos de uso

- Escritura creativa sin filtros: generación de ficción, prosa y roleplay donde el usuario quiere control total sobre las restricciones del modelo; CaliperBench indica que esta build se evalúa precisamente en esas dimensiones.
- Investigación en alineación y abliteración: al estar los pesos abliterated disponibles abiertamente bajo licencia MIT, sirve como sujeto de estudio para analizar qué componentes del modelo codifican los comportamientos de rechazo.
- Ejecución local en Apple Silicon de gama alta: gracias al streaming de expertos y tablas Engram desde SSD, una máquina con 256 GB de memoria unificada puede ejecutar el modelo completo sin necesidad de un clúster de GPU.
- Procesamiento de documentos muy largos: la ventana de contexto de 1M tokens permite análisis de corpora extensos, contratos o bases de código completas en una sola sesión.
- Experimentación con el motor ds4: el formato de tensores y la receta de cuantización son los de antirez, por lo que este repositorio sirve como caso de prueba para el ecosistema ds4 (Metal, CUDA, ROCm).
- Despliegue autoalojado con control total de datos: al ser un GGUF ejecutable localmente, evita el envío de datos a proveedores externos, relevante para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README indica que el modelo está puntuado en CaliperBench (caliperbench.com/m/deepseek-v4.1-flash-1017-uncensored-thinking/), un benchmark de escritura creativa comparado contra el DeepSeek V4.1 Flash 1017 en FP8 servido por proveedor, pero no incluye las puntuaciones numéricas en la información proporcionada.

## Requisitos de hardware

- Espacio en disco: aproximadamente 935 GiB libres durante la fusión de shards (467 GiB de fragmentos más 467 GiB de salida); 501,6 GB una vez eliminados los shards.
- Memoria: el motor ds4 transmite los expertos enrutados y las tablas Engram desde SSD, por lo que una máquina Apple Silicon con 256 GB de memoria unificada puede ejecutar el modelo. Los requisitos exactos de VRAM para GPU dedicadas: no disponible.
- GPU recomendadas: no disponible en detalle; ds4 soporta Metal, CUDA y ROCm.
- Consumer GPU: no hay confirmación de que el modelo completo quepa en una única GPU de consumo; el diseño de streaming desde SSD sugiere que no es necesario.
- Despliegue: exclusivamente mediante ds4 (ds4-server); no compatible con llama.cpp, vLLM, TGI ni Ollama según la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED MXFP4 (este) | 754,6B (552B MoE según README) | 1M | MXFP4/I8/Q8_0 | MIT | ds4 |
| DeepSeek-V4.1-Flash-1017 (base oficial) | 552B MoE | 1M | FP8 (pesos originales) | no disponible | no disponible |
| dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | no disponible | no disponible | FP8 safetensors | no disponible | no disponible |
| antirez/deepseek-v4.1-flash-gguf (build stock) | 552B MoE | 1M | MXFP4 | no disponible | ds4 |

## Limitaciones y advertencias

- Modelo abliterated/uncensored: la eliminación de salvaguardas de seguridad implica riesgos serios de uso indebido y de generación de contenido dañino. No es apto para entornos de producción orientados a usuarios finales sin controles adicionales.
- Riesgo de alucinación: no disponible un dato cuantificado, pero al tratarse de un modelo abliterated sin ajustes de alineación adicionales, el riesgo habitual de los LLM de gran escala se mantiene.
- Compatibilidad muy limitada: solo funciona con ds4; llama.cpp y los motores mainstream no pueden cargar esta arquitectura todavía.
- Proceso de descarga complejo: 9 shards que deben fusionarse con el script de ds4, con verificación SHA-256 obligatoria y necesidad de ~935 GiB temporales de disco.
- Restricciones de licencia: la licencia MIT es muy permisiva y no impone restricciones comerciales, pero no se especifica la licencia del modelo base oficial de DeepSeek, que podría aplicar condiciones propias.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible, por lo que el uso en castellano no está documentado.
- Datos de rendimiento (latencia, throughput, benchmarks numéricos): no disponibles; solo existen referencias cualitativas a CaliperBench.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/Solstice-AI/DeepSeek-V4.1-Flash-1017-UNCENSORED-MXFP4-ds4-Protium-1.0-UltraOptimised-GGUF
- Modelo fuente abliterated (dealignai): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base oficial (DeepSeek): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build MXFP4 stock de antirez: https://huggingface.co/antirez/deepseek-v4.1-flash-gguf
- Motor de inferencia ds4 (DwarfStar): https://github.com/antirez/ds4
- Benchmark CaliperBench: https://caliperbench.com/m/deepseek-v4.1-flash-1017-uncensored-thinking/
- Web de Solstice-AI: https://solstice-ai.co
- Perfil de Solstice-AI en Hugging Face: https://huggingface.co/Solstice-AI
