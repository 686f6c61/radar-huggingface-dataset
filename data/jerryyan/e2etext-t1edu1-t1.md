# jerryyan/e2etext-T1edu1-T1

## Resumen

e2etext-T1edu1-T1 es un ajuste fino de Qwen/Qwen3-0.6B (596.049.920 parámetros) desarrollado por el usuario jerryyan para una tarea muy concreta: convertir HTML crudo en texto limpio apto para preentrenamiento. En lugar de la clásica pila de dos etapas (scraper más reglas heurísticas), este estudiante lee una representación canónica del documento con líneas numeradas y emite una de cuatro decisiones —keep, edit, delete o rewrite— junto con la carga útil que esa decisión implica. Un ejecutor determinista traduce esa predicción al texto final del corpus.

El modelo no es un asistente conversacional de propósito general: es un componente de un pipeline de curación de datos. Con él se generó el corpus del mismo nombre, de 7.436.788.128 tokens, distribuido en 444 shards. El repositorio incluye además el checkpoint, el system prompt de entrenamiento, la documentación del método por etapas y copias byte a byte de los scripts que se ejecutaron.

Su relevancia actual está en el enfoque: sustituir una cadena de herramientas frágiles por un único modelo pequeño (menos de 600 millones de parámetros) que decide sobre la página completa. Al ser tan compacto y usar licencia Apache 2.0, es viable ejecutarlo sobre universos de decenas de miles de shards HTML a coste reducido, siempre que se respete el formato de entrada y el post-filtrado documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3), ajustado sobre Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (max_model_len usado en la inferencia del corpus) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors sin cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (11 archivos, 1.208.026.637 bytes) |

## Arquitectura y entrenamiento

La base es Qwen3-0.6B, un transformer decoder denso de aproximadamente 600 millones de parámetros. El ajuste se hizo en dos fases: una ejecución base y una continuación de 3 épocas con batch global 192, en la que los cuatro tokens de decisión (keep, edit, delete, rewrite) se ponderaron con un factor ×5 para forzar al modelo a acertar la etiqueta antes que el payload.

Los datos de SFT no son anotaciones humanas directas, sino etiquetas destiladas de un conjunto de profesores: Dripper extrae el contenido, Qwen3.8-27B poda o elimina bajo un prompt de subconjunto estricto, FineWeb-Edu filtra la pila de páginas eliminadas y el reformulador de 1B de RePro (`cx-cmu/repro-rephraser-1B`) escribe el texto de reemplazo para las páginas que superan ese filtro. Esas salidas se compilan en un objetivo serializado «decision-first» sobre los identificadores de línea: primero un conjunto base de 1.383.115 filas y después un conjunto continuado de 131.484 filas que eleva la clase rewrite al 30 %.

El detalle técnico más relevante es la separación estricta entre predicción y ejecución. El modelo solo emite operaciones simbólicas —`rm N` y `rm A-B` para eliminar líneas completas, `sub N: "s"` para borrar una subcadena exacta— y nunca texto de sustitución libre en el caso de `sub`. El ejecutor (`scripts/e2e_ops.py`, función `body_from_prediction_dfirst`) aplica la unión de ambas etapas y registra la ruta tomada en una etiqueta `e2e_tag`. Además, el renderizador es parte del método: se descartan head, style, script, noscript, link, meta, iframe y frame, se usa el renderizador de texto basado en WebKit de Dripper (MinerU-HTML 1.0.0), se limpia el marcado residual con BeautifulSoup 4.15.0 y se numera cada línea con el prefijo `<lid:N>`. Cambiar de renderizador desplaza la distribución de entrada respecto al entrenamiento.

## Capacidades

- Clasificación y transformación de documentos HTML en una de cuatro decisiones: keep, edit, delete o rewrite.
- Emisión de operaciones de edición estructuradas: eliminación de líneas completas (`rm N`, `rm A-B`) y eliminación de subcadenas exactas (`sub N: "s"`).
- Generación de texto de reemplazo para páginas marcadas como rewrite, aprendida por destilación del reformulador de RePro.
- Limpieza de artefactos de maquetación: barras verticales repetidas, líneas separadoras vacías, espacios intra-línea y puntuación Markdown escapada.
- Procesamiento de páginas completas con contexto de hasta 32.768 tokens, lo que cubre documentos largos sin trocear.
- No dispone de tool calling, function calling, capacidad de agente ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking (se desactiva explícitamente en la inferencia del corpus).
- Capacidad multilingüe limitada al inglés; el corpus y las etiquetas de profesor están en `en`.

## Casos de uso

- Curación de corpus de preentrenamiento: el modelo procesa un universo de shards HTML y, con el ejecutor determinista, materializa el texto limpio. Es exactamente el uso para el que se entrenó, con el corpus de 7.436.788.128 tokens como resultado documentado.
- Sustitución de pilas de reglas en pipelines de web scraping: en lugar de mantener expresiones regulares y selectores CSS específicos por dominio, el modelo decide sobre la página completa y reduce el mantenimiento por sitio.
- Filtrado de ruido de navegación y plantillas: la decisión delete elimina menús, avisos legales y bloques repetidos que de otro modo contaminarían el dataset.
- Normalización de páginas con contenido mezclado: la decisión edit permite conservar la página pero recortar líneas concretas, útil cuando el artículo es aprovechable pero arrastra promociones o llamadas a la acción.
- Regeneración de contenido degradado: la decisión rewrite produce texto de reemplazo para páginas cuya extracción directa no es viable, ampliando la cobertura del corpus más allá de lo que permitiría un scraper.
- Replicación de un corpus concreto: cualquier equipo que quiera reproducir el dataset `dclm-pool-400m-1x-student-cleaned-rescued` puede ejecutar este checkpoint sobre el mismo universo renderizado y aplicar el post-filtro publicado.
- Procesamiento por lotes a gran escala: con menos de 600 millones de parámetros y vLLM, es factible cubrir decenas de miles de shards en hardware modesto, algo inviable con los profesores de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas tipo MMLU, HumanEval o GSM8K, y tampoco ofrece comparaciones cuantitativas con otros extractores. El único dato de rendimiento reportado es operativo: el post-filtro aplicado al corpus elimina el 0,0614 % de los documentos generados.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 1,2 GB solo para pesos, más caché KV para contextos de hasta 32.768 tokens.
- VRAM estimada en int8: aproximadamente 0,6 GB de pesos; en int4, alrededor de 0,3 GB.
- Cabe sin dificultad en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090 y equivalentes, incluso con contexto largo.
- GPU de datacenter (A100, H100) recomendables solo si se busca throughput masivo por lotes, no por requisito de memoria.
- Opciones de despliegue: vLLM (la versión usada para el corpus fue 0.11.1), además de llama.cpp, Ollama y TGI, ya que la librería declarada es transformers y el tag incluye text-generation-inference y endpoints_compatible.
- Latencia y throughput concretos: no disponible.
- Es imprescindible replicar el renderizador y el system prompt (`system_prompt.txt`) del repositorio; usar otro renderizador degrada la calidad de las predicciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2etext-T1edu1-T1 | 596.049.920 | 32.768 tokens | Limpieza HTML → texto de preentrenamiento | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-0.6B (modelo base) | ~0,6 B | no disponible en la informacion | Generación de texto general | apache-2.0 | HuggingFace |
| cx-cmu/repro-rephraser-1B | no disponible | no disponible | Reformulación de texto | no disponible | HuggingFace |
| Qwen3.8-27B (profesor citado) | no disponible | no disponible | Poda/eliminación bajo prompt de subconjunto | no disponible | no disponible |

No se conocen alternativas publicadas de la misma categoría (modelo único de limpieza HTML para curación de datos) con las que comparar parámetros y rendimiento de forma directa; los modelos de la tabla se incluyen por su relación con el pipeline, no como sustitutos equivalentes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre etiquetas destiladas de profesores, hereda los sesgos de selección de Dripper, Qwen3.8-27B y FineWeb-Edu.
- Riesgo de alucinación: bajo en el sentido generativo, porque la salida está restringida a operaciones simbólicas; el riesgo real es emitir operaciones malformadas o etiquetas fuera del vocabulario, motivo por el que existe el post-filtro.
- El post-filtro descarta salidas con dos o más líneas tipo operación, un prefijo de etiqueta corto y desnudo, una etiqueta fuera de vocabulario o una línea de etiqueta aislada; omitirlo permite que entren documentos corruptos al corpus.
- Dependencia fuerte del renderizador: la entrada debe construirse con el pipeline documentado (WebKit de Dripper más BeautifulSoup 4.15.0 más numeración `<lid:N>`). Cualquier otro renderizador saca al modelo de su distribución de entrenamiento.
- Dependencia del system prompt: la model card advierte explícitamente de que el system prompt importa y se distribuye como `system_prompt.txt`; no usarlo altera el comportamiento.
- Limitación de idioma: solo inglés. No hay evidencia de funcionamiento sobre HTML en castellano u otros idiomas.
- `sub N: "s"` elimina la subcadena citada y nunca sustituye texto; asumir lo contrario produce ediciones incorrectas.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero conviene verificar las licencias de los profesores y del corpus derivado si se redistribuye.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- Los resultados de búsqueda web devueltos no guardan relación con el modelo (contenido sobre hoteles en Bo-Kaap) y no se han usado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jerryyan/e2etext-T1edu1-T1
- Dataset del corpus (444 shards, carpeta `students/e2etext-t1edu1-t1/`): https://huggingface.co/datasets/jerryyan/dclm-pool-400m-1x-student-cleaned-rescued
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Reformulador de RePro citado como profesor: https://huggingface.co/cx-cmu/repro-rephraser-1B
- Documentación interna del repositorio: `docs/01_rendering.md`, `docs/02_teachers.md`, `docs/03_sft_data.md`, `docs/04_training.md`, `docs/05_inference.md`
- Ejemplos ejecutados: `samples/WORKED_EXAMPLES.md`
- Scripts: `scripts/e2e_ops.py`, `scripts/prompt_sft_system_rwmix_t1_rewrite_all_edu1_rw30_ep3.txt`, `system_prompt.txt`
