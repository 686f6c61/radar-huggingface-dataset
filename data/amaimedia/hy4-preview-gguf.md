# AMAImedia/Hy4-preview-GGUF

## Resumen

Hy4-preview es un modelo de lenguaje de nueva generación desarrollado por el equipo Tencent Hy, presentado en agosto de 2026. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 770 mil millones de parámetros totales, de los cuales solo 49 mil millones se activan por token, lo que representa aproximadamente un 6 % del modelo en cada paso forward. Esta característica permite mantener una capacidad de escala muy alta con un coste de inferencia relativamente contenido. El modelo soporta una ventana de contexto superior a un millón de tokens, lo que lo sitúa entre los modelos abiertos con mayor capacidad de contexto disponibles en la fecha de su lanzamiento.

La versión GGUF aquí descrita, publicada por el usuario AMAImedia, ofrece dos builds de cuantización: una convencional Q4_K_M de 435 GiB y una experimental de precisión mixta STQ1_0 de 214 GiB, aproximadamente la mitad del tamaño. Ambas requieren parches específicos sobre llama.cpp, ya que la arquitectura `hyv4` no está integrada en el código oficial. El modelo original de Tencent se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su precio de referencia en la nube de Tencent es de 0,834 dólares por millón de tokens de entrada, un coste notablemente bajo para su categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) con 78 capas, primera densa y 77 con 256 expertos enrutados + 1 compartido |
| Parametros totales | 769.907.408.797 (aprox. 770B) |
| Parametros activos | 49B por token |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | Q4_K_M (4.86 bpw) y STQ1_0 (2.38 bpw, precision mixta con sparsity 3:4) |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base de Tencent soporta principalmente ingles y chino, segun la documentacion oficial) |
| Licencia | Apache 2.0 (modelo original de Tencent) |
| Formato de pesos | GGUF (safetensors disponibles en el repo original de Tencent) |

## Arquitectura y entrenamiento

Hy4-preview emplea una arquitectura MoE con 78 capas transformer. La primera capa utiliza una FFN densa convencional, mientras que las 77 restantes sustituyen la FFN por un bloque MoE con 256 expertos enrutados y un experto compartido. Cada token activa un subconjunto de expertos, lo que reduce el coste computacional efectivo a unos 49B parametros activos. El modelo incorpora ademas atencion de latencia multi-cabezal (MLA), un indexador DSA que selecciona que 2048 tokens son visibles para cada consulta, y un mecanismo de compresion iHC. La cuantizacion STQ1_0, desarrollada por el autor de esta build, introduce una estrategia de precision mixta donde los tensores de los expertos enrutados se cuantizan a 1.3125 bpw (ternario con sparsity 3:4) en 29 capas y a 2.0625 bpw (IQ2_XXS) en las otras 48, mientras que los tensores criticos como la salida del modelo o el indexador se mantienen en F32 o Q8_0. El entrenamiento del modelo original incluyo fases de preentrenamiento y ajuste con datos multilingues, aunque no se han publicado detalles completos sobre la composicion del dataset ni sobre el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento avanzado: modelo de razonamiento de proposito general con capacidad para tareas complejas de logica y analisis.
- Generacion de codigo: optimizado para agentes de codificacion y flujos de trabajo agénticos multi-paso, segun la documentacion de Tencent Cloud.
- Soporte de tool calling y function calling: integrable en pipelines que requieren invocacion de herramientas externas.
- Capacidades agénticas: disenado para tareas que requieren planificacion y ejecucion de multiples pasos.
- Ventana de contexto de 1M tokens: permite procesar documentos extensos, repositorios de codigo completos o conversaciones muy largas.
- Capacidades multilingues: el modelo base de Tencent soporta ingles y chino principalmente; no se han confirmado otros idiomas en la informacion disponible.
- Modo de razonamiento: el modelo esta orientado a tareas de razonamiento, aunque no se especifica si dispone de un modo "thinking" explicito.

## Casos de uso

- Agentes de codificacion en produccion: el modelo puede integrarse en entornos de desarrollo para generar, revisar y refactorizar codigo en repositorios grandes, aprovechando su ventana de 1M tokens para analizar el arbol completo de un proyecto antes de sugerir cambios.
- Atencion al cliente automatizada con contexto largo: con 1M tokens de contexto, puede mantener conversaciones multi-turno con historial completo de interacciones, documentos de politica y registros de incidencias sin truncamiento.
- Analisis de documentos legales y financieros: procesa contratos extensos, informes anuales o expedientes completos en una sola pasada, extrayendo clausulas relevantes o detectando inconsistencias.
- Razonamiento cientifico y matematico: adecuado para problemas de demostracion formal, verificacion de teoremas o resolucion de problemas matematicos complejos que requieren multiples pasos de deduccion.
- Desarrollo de agentes autonomos multi-paso: su capacidad de tool calling y razonamiento encadenado lo hace util para construir asistentes que planifican, ejecutan y verifican tareas en entornos simulados o reales.
- Traduccion y localizacion de alta calidad: con soporte para ingles y chino, puede traducir documentos tecnicos extensos manteniendo coherencia terminologica a lo largo de todo el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento medidos corresponden a la build STQ1_0 en hardware 8x H20, proporcionados por el autor de la cuantizacion:

| Metrica | Valor |
|---|---|
| Prefill (pp512) | 204.56 ± 1.42 t/s |
| Decode (tg128) | 19.52 ± 0.01 t/s |

Estas cifras corresponden a la build STQ1_0 con descarga completa en GPU (8x H20). No hay datos comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~435 GiB para la build Q4_K_M y ~214 GiB para la STQ1_0, asumiendo residencia completa en GPU.
- GPU recomendadas: el autor midio el rendimiento en 8x H20 (H100/H20 con arquitectura CUDA 9.0). Se requiere compilar llama.cpp con `-DCMAKE_CUDA_ARCHITECTURES=90` para estas GPUs.
- No cabe en GPUs de consumo: ni una RTX 4090 (24 GB) ni una A100 de 80 GB pueden alojar el modelo completo. Se necesita un nodo multi-GPU con al menos 5x A100 80GB para la build STQ1_0 o 6x H100 80GB para la Q4_K_M.
- Opciones de despliegue: llama.cpp con parches especificos (no soportado por vLLM, Ollama o TGI sin modificaciones). El autor proporciona instrucciones de compilacion con CUDA.
- Latencia y throughput: en 8x H20 con STQ1_0, prefill de ~205 t/s y decode de ~19.5 t/s. Para la build Q4_K_M no se proporcionan mediciones.
- Requisitos adicionales: el GGUF debe estar en disco local (no NFS) para evitar fallos de pagina lentos; se requiere `--jinja` para el chat y `-st -f prompt.txt` para prompts individuales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-preview | 770B | 49B | 1M | Apache 2.0 | Pesos abiertos (Tencent) |
| Hy3 | 295B | 21B | No disponible | Apache 2.0 | Pesos abiertos (Tencent) |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | MIT | Pesos abiertos |

La comparativa con DeepSeek-V3 se incluye como referencia de la categoria MoE de gran escala, aunque no se dispone de datos de rendimiento directos de Hy4-preview frente a este modelo. Hy4-preview destaca por su contexto de 1M tokens, muy superior a los 128K de DeepSeek-V3, y por su licencia Apache 2.0, que permite uso comercial sin restricciones. Hy3, el predecesor inmediato, es significativamente menor en parametros totales y activos, lo que sugiere una mejora sustancial en capacidad con un coste de inferencia solo ligeramente superior (49B activos frente a 21B).

## Limitaciones y advertencias

- La arquitectura `hyv4` no esta soportada por llama.cpp estandar: requiere aplicar parches manuales y compilar desde fuente, lo que limita su uso en entornos de produccion sin un equipo de ingenieria dedicado.
- La build STQ1_0 es experimental: la cuantizacion ternaria con sparsity 3:4 puede degradar la calidad de salida en tareas de alta precision, aunque el autor reporta mejoras significativas en error cuadratico ponderado frente al encoder original.
- No se han publicado benchmarks estandar: no hay datos verificables de MMLU, HumanEval o GSM8K, lo que dificulta evaluar su rendimiento real frente a alternativas.
- Requisitos de hardware muy elevados: incluso la build reducida necesita ~214 GiB de VRAM, fuera del alcance de la mayoria de equipos individuales o pequenas empresas.
- Idiomas limitados: el soporte principal es ingles y chino; no se confirma cobertura de otros idiomas, lo que puede ser un problema para aplicaciones multilingues amplias.
- Riesgo de alucinacion y sesgos: al ser un modelo de gran tamano sin evaluacion publica detallada, no se puede descartar la presencia de sesgos en los datos de entrenamiento ni la generacion de contenido falso con alta confianza.
- La build GGUF de AMAImedia no tiene descargas ni valoraciones: es una publicacion reciente sin validacion comunitaria, por lo que se recomienda verificar la integridad de los archivos antes de su uso.

## Enlaces

- Repositorio GGUF de AMAImedia: https://huggingface.co/AMAImedia/Hy4-preview-GGUF
- Modelo original de Tencent: https://huggingface.co/tencent/Hy4-preview
- Repositorio GitHub de Tencent-Hunyuan: https://github.com/Tencent-Hunyuan/Hy4-preview
- Build GGUF alternativa de AngelSlim: https://huggingface.co/AngelSlim/Hy4-preview-GGUF
- Articulo de explainx.ai sobre Hy4 Preview: https://explainx.ai/blog/tencent-hy4-preview-770b-moe-1m-context-august-2026
- Ficha en ohmygpt.com: https://www.ohmygpt.com/models/tencent%3Atencent%2Fhy4-preview
- Cobertura en wowtale.net: https://en.wowtale.net/2026/08/29/234927/
