# AngelSlim/Hy4-preview-GGUF

## Resumen

Hy4-preview es un modelo de lenguaje de gran escala desarrollado por Tencent, con 770 000 millones de parámetros totales y 49 000 millones activos, lo que lo convierte en un modelo de mezcla de expertos (MoE) de última generación. Su ventana de contexto supera el millón de tokens, lo que lo posiciona para tareas que requieren procesar documentos extensos o mantener conversaciones de muy largo alcance. Esta versión GGUF, publicada por el equipo AngelSlim (el toolkit de compresión de modelos de Tencent), ofrece dos cuantizaciones: una Q4_K_M estándar y una STQ1_0 de precisión mixta que reduce el tamaño a la mitad, permitiendo ejecutar el modelo en hardware más asequible.

La relevancia de esta publicación radica en que acerca un modelo de 770B a entornos con restricciones de memoria, algo poco común en modelos de este tamaño. La cuantización STQ1_0, con una media de 2,38 bits por peso, emplea una estrategia de precisión mixta que asigna más bits a los tensores críticos y menos a los expertos enrutados, logrando un equilibrio entre tamaño y calidad. Sin embargo, requiere parches específicos para llama.cpp, ya que la arquitectura `hyv4` no está integrada en el código oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con atencion MLA y DSA, 256 expertos |
| Parametros totales | 769 907 408 797 (~770B) |
| Parametros activos | 49B |
| Longitud de contexto | >1 000 000 tokens |
| Tipos de cuantizacion | Q4_K_M (4,86 bpw) y STQ1_0 (2,38 bpw) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

Hy4-preview emplea una arquitectura MoE con 256 expertos enrutados, de los cuales se activan 49B parámetros por token. La atención combina MLA (Multi-head Latent Attention) y DSA (Dynamic Sparse Attention), un mecanismo que selecciona dinámicamente los tokens relevantes para cada consulta, lo que contribuye a la eficiencia en contextos muy largos. El modelo también incorpora un indexador DSA que decide qué 2048 tokens de la ventana de contexto son visibles para cada query, y un componente iHC (probablemente relacionado con compresión o hardware) cuyos tensores se mantienen en FP32.

Los datos de entrenamiento no se detallan en la información disponible, pero al ser un modelo de Tencent, se presume un corpus masivo y multilingüe, posiblemente con fases de RLHF o DPO, aunque no se confirma. La innovación principal de esta versión GGUF es la cuantización STQ1_0, que utiliza un formato ternario con sparsity 3:4 (una de cada cuatro posiciones forzada a cero) y un codebook de 32 entradas, logrando 1,3125 bpw en los tensores de los expertos enrutados. El encoder de AngelSlim mejora el cuantizador upstream mediante una escala por mínimos cuadrados ponderados y una colocación de ceros consciente de la imatrix, reduciendo el error cuadrático ponderado en un 89,7% respecto al método original.

## Capacidades

- Generacion de texto y razonamiento complejo, gracias a su tamano y arquitectura MoE.
- Procesamiento de contextos extremadamente largos (mas de 1M tokens), adecuado para documentos extensos o conversaciones multi-turno.
- Soporte de conversacion (etiqueta "conversational" en HuggingFace).
- Compatible con endpoints (etiqueta "endpoints_compatible"), lo que sugiere que puede desplegarse como servicio.
- Capacidades multilingues: no confirmadas en la informacion, pero probables dado el origen del modelo.
- Tool calling y funciones de agente: no se mencionan explicitamente, aunque es comun en modelos de este tamano; no se puede confirmar.

## Casos de uso

- Analisis de documentos legales o academicos extensos: con su contexto de mas de 1M tokens, puede resumir, extraer informacion y responder preguntas sobre contratos, tesis o expedientes completos sin necesidad de dividirlos en fragmentos.
- Asistente de investigacion cientifica: el modelo puede procesar articulos, patentes y datasets, generando sintesis, hipotesis o codigo de analisis, aprovechando su capacidad de razonamiento y su ventana de contexto.
- Generacion de codigo en entornos de desarrollo: aunque no se confirma tool calling, su tamano y entrenamiento en datos variados lo hacen apto para autocompletar, revisar y documentar codigo en multiples lenguajes, integrándose en pipelines de CI/CD.
- Atencion al cliente automatizada: su naturaleza conversacional y su contexto largo permiten gestionar interacciones complejas con historial extenso, manteniendo coherencia y recordando detalles de la conversacion.
- Procesamiento de datos financieros: puede analizar informes anuales, estados de cuenta y series temporales largas, generando resumenes ejecutivos o detectando anomalias, gracias a su capacidad de razonamiento numerico.
- Investigacion en IA: como modelo abierto de 770B, sirve para estudiar comportamiento emergente, tecnicas de cuantizacion y eficiencia en MoE, siendo util para laboratorios que no pueden entrenar modelos de este tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medicion de rendimiento incluida es la del propio autor, obtenida en 8x H20 con la cuantizacion STQ1_0:

| Metrica | Valor |
|---|---|
| Prefill (pp512) | 204,56 ± 1,42 t/s |
| Decode (tg128) | 19,52 ± 0,01 t/s |

Estos datos corresponden a una configuracion especifica de hardware y no permiten comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada: ~435 GiB para la cuantizacion Q4_K_M y ~214 GiB para la STQ1_0, si se quiere residencia completa en GPU.
- GPUs recomendadas: el autor midio el rendimiento en 8x H20 (H100 tambien es compatible, segun las instrucciones de compilacion con `-DCMAKE_CUDA_ARCHITECTURES=90`). No cabe en GPUs de consumo (RTX 4090, etc.) por su tamano.
- Opciones de despliegue: llama.cpp con parches especificos (no funciona con la version estandar). No se mencionan vLLM, TGI u Ollama en la informacion.
- Latencia y throughput: los valores medidos son 204,56 t/s en prefill y 19,52 t/s en decode para STQ1_0 en 8x H20. Para Q4_K_M no se proporcionan mediciones.
- Almacenamiento: los archivos GGUF ocupan 435 GiB (Q4_K_M) y 214 GiB (STQ1_0); se recomienda disco local, ya que el acceso por red (NFS) degrada el rendimiento a ~12 MB/s.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Como referencia estructural, Hy4-preview se situa en la categoria de MoE gigantes junto a modelos como DeepSeek-V3 (671B totales, 37B activos) o Qwen2.5-Max (aunque este ultimo no es abierto). Sin embargo, sin resultados de evaluacion estandarizados, no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La arquitectura `hyv4` no esta soportada por llama.cpp estandar; requiere aplicar parches manuales y compilar una version modificada, lo que limita su portabilidad.
- El modelo es extremadamente grande: incluso la cuantizacion STQ1_0 necesita ~214 GiB de VRAM, fuera del alcance de la mayoria de entornos de desarrollo.
- La licencia no esta especificada en la informacion disponible, por lo que se desconoce si permite uso comercial o tiene restricciones.
- No se han publicado evaluaciones de sesgos, alucinaciones o calidad en tareas especificas; al ser un modelo de 770B, el riesgo de alucinacion existe y debe mitigarse con validacion externa.
- La cuantizacion STQ1_0, con solo 2,38 bpw, puede degradar la calidad en tareas que requieren precision numerica o razonamiento logico, aunque el autor afirma que la estrategia de precision mixta minimiza el impacto.
- El uso de imatrix es obligatorio para re-cuantizar con STQ1_0, y el proceso requiere conocimientos avanzados de compilacion y cuantizacion.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/AngelSlim/Hy4-preview-GGUF
- Modelo original en HuggingFace: https://huggingface.co/tencent/Hy4-preview
- Repositorio GitHub de Tencent-Hunyuan/Hy4-preview: https://github.com/Tencent-Hunyuan/Hy4-preview
- Repositorio GitHub de Tencent/AngelSlim: https://github.com/tencent/AngelSlim
- Anuncio oficial de Tencent: https://www.tencent.com/tencent-releases-and-open-sources-tencent-hy4-preview/
