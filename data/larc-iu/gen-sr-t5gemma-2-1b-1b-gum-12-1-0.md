# larc-iu/gen-sr-t5gemma-2-1b-1b-gum-12.1.0

## Resumen

`larc-iu/gen-sr-t5gemma-2-1b-1b-gum-12.1.0` es un parser RST (Rhetorical Structure Theory) generativo de extremo a extremo, desarrollado por el grupo LARC de la Universidad de Indiana y entrenado con la librería Dipo. El modelo reformula el análisis del discurso como una tarea de generación: dado un texto en bruto, produce una secuencia lineal de acciones shift-reduce que codifica la segmentación en unidades de discurso elementales (EDU) y el árbol retórico completo, y de esa cadena decodificada se recuperan tanto los límites de segmento como la estructura y las relaciones retóricas.

El backbone es `google/t5gemma-2-1b-1b`, un modelo encoder-decoder de aproximadamente 1B de parámetros en cada torre (encoder y decoder), sobre el que se aplica un ajuste fino con LoRA cuyos pesos se fusionan en este repositorio. El modelo se entrena exclusivamente sobre el split de entrenamiento del corpus GUM 12.1.0 (Georgetown University Multilayer corpus), un corpus inglés multigénero con anotación RST en 32 etiquetas de relación.

Su relevancia es metodológica: forma parte del trabajo "Worth Their Weights? Evaluating Generative Models for Discourse Parsing" (Gessler y Zeldes, 2026), que compara parsers generativos frente a enfoques discriminativos clásicos. Frente a los parsers tradicionales por transición, este enfoque unifica segmentación, estructura y etiquetado de relaciones en una sola pasada autoregresiva, lo que simplifica el pipeline y permite aprovechar el conocimiento lingüístico de un modelo preentrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma), ajuste fino con LoRA fusionado |
| Parámetros totales | Aproximadamente 1B en encoder + 1B en decoder (según el backbone `google/t5gemma-2-1b-1b`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (documentos más largos se rechazan con error, no se truncan) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma Terms of Use (heredada del modelo base); datos de entrenamiento con licencias mixtas (CC BY 4.0 en anotaciones, CC BY a CC BY-NC-SA en textos) |
| Formato de pesos | Pesos completos del modelo ajustado (formato estándar de Hugging Face; safetensors no confirmado explícitamente) |
| Librería | dipo |
| Tamaño del repositorio | 4,4 GB |
| Tarea | Discourse parsing (RST), serialización shift-reduce |
| Etiquetas de relación | 32 |
| Modelo base | google/t5gemma-2-1b-1b (acceso restringido en Hugging Face) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura encoder-decoder de tipo T5Gemma, en la que el backbone es de tipo seq2seq y la serialización elegida es `sr` (shift-reduce). La tarea se plantea como generación condicionada: el encoder procesa el texto en bruto (con todos los espacios en blanco colapsados) y el decoder genera la secuencia de acciones que reconstruye el árbol RST. Esta formulación evita la necesidad de tokenizar o preprocesar el texto de entrada.

El entrenamiento se realizó sobre el split de train de GUM 12.1.0 y el checkpoint se seleccionó según `e2e_full_f1` en el split de dev. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá del corpus GUM, ni si se aplicaron técnicas de RLHF o DPO (poco probables en una tarea estructurada de parsing). La innovación principal es la propia formulación generativa end-to-end del parsing discursivo, junto con el uso de LoRA sobre un backbone preentrenado y la serialización shift-reduce como representación intermedia.

## Capacidades

- Parsing RST de extremo a extremo: segmentación en EDUs, construcción del árbol de estructura y asignación de relaciones retóricas en una sola pasada.
- Generación de árboles en formato RS4 (`to_rs4_string()`) y en notación s-expression anidada, según la serialización configurada.
- Procesamiento de texto en bruto: no requiere tokenización previa; los saltos de línea y espacios se colapsan automáticamente.
- Manejo de documentos largos de hasta 16.384 tokens.
- Detección implícita de encabezados de sección como segmentos propios, pese a que el modelo no usa la estructura de líneas.
- Etiquetado con 32 relaciones retóricas del inventario GUM (adversativas, causales, de elaboración, de atribución, organizativas, etc.).
- Capacidad de operar tanto sobre texto en bruto (E2E) como sobre segmentación gold (Gold-EDU).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Análisis automático de discurso en corpus académicos: el modelo permite obtener árboles RST de artículos y textos académicos para estudiar la organización argumentativa, aprovechando su entrenamiento en el género académico de GUM.
- Investigación en lingüística computacional: sirve como baseline generativo para comparar con parsers discriminativos en experimentos sobre análisis del discurso, dado que el paper asociado evalúa precisamente esa comparación.
- Procesamiento de textos multigénero: al haberse entrenado con géneros diversos (noticias, entrevistas, ficción, reddit, vlogs, etc.), puede aplicarse a la caracterización retórica de corpus heterogéneos.
- Segmentación y estructuración de documentos largos: con contexto de 16.384 tokens, puede analizar documentos completos sin truncar, útil para tareas de resumen jerárquico o extracción de estructura.
- Análisis de coherencia en textos generados: permite evaluar la organización retórica de salidas de modelos de lenguaje comparando sus árboles RST con los de textos humanos de referencia.
- Enseñanza y anotación asistida: puede generar propuestas de árboles RST que un anotador humano revise, acelerando la creación de corpus anotados en el inventario de 32 relaciones.
- Extracción de relaciones discursivas para downstream: los árboles producidos pueden alimentar tareas de resumen extractivo, respuesta a preguntas o análisis de argumentación que exploten la estructura retórica.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 x 100 bajo Parseval original, con spans hoja triviales excluidos):

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 95,4 | 61,6 | 47,6 | 37,7 | 37,4 | 65,4 | 51,8 | 41,6 | 41,3 |
| test | 95,6 | 64,0 | 49,9 | 39,5 | 39,4 | 68,4 | 54,6 | 43,3 | 43,2 |

Notas: las métricas E2E se calculan sobre árboles predichos desde texto en bruto (segmentación incluida); las Gold-EDU se calculan dada la segmentación gold. La métrica Seg es el F1 por token de BeginSeg calculado durante el entrenamiento, que puede quedar hasta un punto por debajo del scorer oficial de DISRPT. El checkpoint se seleccionó por `e2e_full_f1` en dev. Los resultados provienen de una única ejecución de entrenamiento; la variación entre ejecuciones en conjuntos de test pequeños puede ser de varios puntos. No se incluyen comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un backbone de aproximadamente 2B de parámetros totales (1B encoder + 1B decoder), en FP16 se requerirían del orden de 4-5 GB solo para pesos, más memoria para activaciones y el contexto de hasta 16.384 tokens.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría esperar GPUs de gama alta de consumo (RTX 4090, 24 GB) y GPUs de datacenter (A100, H100) para mayor throughput.
- Compatibilidad con GPU de consumo: probablemente sí en cuantización de 8 o 4 bits, aunque no se documentan cuantizaciones disponibles.
- Opciones de despliegue: la vía documentada es la librería `dipo` (CLI `dipo gen predict` y API Python `GenParser`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisito de acceso: es necesario aceptar los términos del modelo base `google/t5gemma-2-1b-1b` y autenticarse con `huggingface-cli login` o `HF_TOKEN`, ya que el repositorio base está restringido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| larc-iu/gen-sr-t5gemma-2-1b-1b-gum-12.1.0 | ~1B + ~1B (T5Gemma) | 16.384 tokens | Parsing RST generativo (inglés) | Gemma Terms of Use | Hugging Face (requiere acceso al base) |
| Parsers RST discriminativos clásicos (p. ej. DMRST, rstparser) | Variable, típicamente < 500M | Dependiente del segmentador | Parsing RST por transición | Varía según implementación | Repositorios públicos |
| Modelos generativos de parsing evaluados en el paper asociado | No disponible | No disponible | Parsing discursivo | No disponible | No disponible |

No se dispone en la información proporcionada de resultados numéricos de modelos comparables para una comparación cuantitativa directa; el paper "Worth Their Weights?" es la referencia para dicha comparación.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe documentado.
- Sesgos: al entrenarse únicamente en GUM 12.1.0, hereda los sesgos de género, registro y dominio de ese corpus (predominio de ciertos géneros y de textos de fuentes concretas).
- Riesgo de alucinación estructural: al ser un modelo generativo, puede producir secuencias de acciones inválidas o árboles inconsistentes; no se documenta una validación formal de la salida.
- Limitación conocida: en raras ocasiones (aproximadamente 1 de cada 3.000 segmentos en sus pruebas, dentro de muestras de código) emite un segmento vacío; se recomienda filtrar con `edu.strip()`.
- Límite de longitud: documentos de más de 16.384 tokens se rechazan con error, no se truncan.
- Pérdida de estructura de línea: el modelo colapsa todos los espacios en blanco, por lo que no aprovecha saltos de línea ni párrafos (aunque en pruebas seguía separando encabezados de sección).
- Restricciones de licencia: los pesos heredan los Gemma Terms of Use del modelo base; el uso comercial queda sujeto a dichos términos.
- Restricciones de datos: los textos de GUM tienen licencias de origen entre CC BY y CC BY-NC-SA, y el texto de Reddit es solo para uso no comercial; el uso previsto es investigación y análisis.
- Variabilidad: los resultados provienen de una única ejecución y la variación entre ejecuciones en test pequeños puede ser de varios puntos; los scores de esta model card no coinciden con los del paper asociado.
- Acceso restringido: el modelo base está gated, lo que complica el despliegue automatizado sin gestión de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/gen-sr-t5gemma-2-1b-1b-gum-12.1.0
- Modelo base: https://huggingface.co/google/t5gemma-2-1b-1b
- Repositorio de la librería Dipo: https://github.com/larc-iu/dipo
- Paper asociado (arXiv): https://arxiv.org/abs/2610.17658
- Corpus GUM: https://gucorpling.org/gum/
