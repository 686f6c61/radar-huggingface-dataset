# larc-iu/gen-sr-t5gemma-2-1b-1b-rstdt-coarse

## Resumen

`larc-iu/gen-sr-t5gemma-2-1b-1b-rstdt-coarse` es un parser generativo de estructura retorica (RST, Rhetorical Structure Theory) entrenado por el grupo LARC (Linguistics and Reasoning with Computational Linguistics, Universidad de Columbia) mediante la libreria Dipo. El modelo recibe texto plano en ingles y produce un arbol de discurso linealizado que codifica la segmentacion en unidades de discurso elementales (EDU) y las relaciones retoricas entre ellas. Se apoya en el backbone encoder-decoder `google/t5gemma-2-1b-1b` (aproximadamente 1.000 millones de parametros), afinado de extremo a extremo para generar una secuencia de acciones shift-reduce.

El modelo resuelve el problema del analisis del discurso RST sin pipeline: en lugar de segmentar y luego clasificar arboles en etapas separadas, genera directamente una representacion serializada y reconstruye la estructura al decodificar. Emplea el esquema de serializacion shift-reduce (`sr`) sobre el corpus RST Discourse Treebank (RST-DT), con un inventario de relaciones reducido de 111 a 18 etiquetas.

Es relevante para investigadores en linguistica computacional y procesamiento de discurso que necesiten un parser RST listo para usar sobre texto crudo, con resultados publicados en dev y test, y una interfaz de linea de comandos y Python sencilla a traves de `dipo`. El checkpoint se selecciono por F1 completo end-to-end en dev y esta pensado para investigacion y analisis de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma), parser generativo shift-reduce |
| Parametros totales | ~1.000 millones (backbone `google/t5gemma-2-1b-1b`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (documentos mas largos se rechazan, no se truncan) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma Terms of Use (heredada del modelo base) |
| Formato de pesos | safetensors (repo de 4,4 GB, incluye actualizacion LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo es un parser RST generativo end-to-end construido sobre el backbone seq2seq `google/t5gemma-2-1b-1b`. La serializacion elegida es `sr` (shift-reduce): el modelo aprende a emitir una secuencia de acciones de desplazamiento y reduccion que, al decodificarse, reconstruye el arbol de discurso completo, incluyendo la segmentacion en EDUs. El backbone y el esquema de serializacion son seleccionables por configuracion dentro de la libreria Dipo; en este checkpoint se fijo `backbone: seq2seq` y `serialization: sr`.

El entrenamiento se realizo exclusivamente sobre el split de entrenamiento de RST-DT (385 articulos del Wall Street Journal del Penn Treebank, version LDC2002T07), usando el texto EDU original sin tokenizar para que el modelo opere sobre entrada cruda. Las etiquetas de relacion se mapearon de un inventario original de 111 items a 18 etiquetas: `attribution`, `background`, `cause`, `comparison`, `condition`, `contrast`, `elaboration`, `enablement`, `evaluation`, `explanation`, `joint`, `manner-means`, `same-unit`, `summary`, `temporal`, `textual-organization`, `topic-change` y `topic-comment`. El checkpoint se selecciono por F1 completo end-to-end en dev. El repositorio contiene los pesos completos afinados, incluida la actualizacion LoRA, pero la carga descarga igualmente el modelo base desde el Hub y sustituye sus pesos por estos.

## Capacidades

- Analisis de discurso RST: genera arboles retoricos completos (segmentacion y estructura) a partir de texto crudo en ingles.
- Segmentacion implicita: detecta las unidades de discurso elementales sin preprocesamiento ni tokenizacion previa.
- Clasificacion de relaciones retoricas en 18 categorias (incluye relaciones nucleares y multinucleares).
- Manejo de texto sin limpiar: colapsa espacios en blanco y tolera saltos de linea y parrafos; en pruebas separo encabezados de seccion como segmentos propios.
- Salida serializable a formato RS4 (`tree.to_rs4_string()`).
- Procesamiento de documentos de hasta 16.384 tokens.
- No soporta tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Analisis de articulos periodisticos: el modelo procesa texto crudo de noticias (como los articulos WSJ de RST-DT) y devuelve la estructura retorica, util para estudiar la organizacion argumentativa de la prensa.
- Investigacion en linguistica del discurso: permite generar anotaciones RST automaticas sobre corpus grandes en ingles para estudios cuantitativos de coherencia y estructura textual.
- Generacion de features para tareas downstream: los arboles RST pueden alimentar modelos de resumen, analisis de sentimiento a nivel de discurso o deteccion de estructura argumental.
- Evaluacion de resumidores y generadores: comparar la estructura retorica de un texto fuente con la de su resumen para medir la preservacion de relaciones discursivas.
- Analisis de documentos legales o academicos en ingles: con 16.384 tokens de contexto, puede procesar secciones extensas y revelar relaciones de elaboracion, contraste o causa entre clausulas.
- Procesamiento por lotes de directorios de `.txt`: la CLI admite `--text-file <path> --output-dir out/`, lo que facilita anotar corpus completos de forma desatendida.
- Docencia y prototipado: la instalacion via `pip install dipo` y la API Python `GenParser.from_pretrained` permiten integrar el parser en cuadernos y experimentos rapidos.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 x 100, Parseval original, spans hoja triviales excluidos):

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 97,3 | 70,2 | 59,3 | 50,5 | 49,2 | 72,5 | 62,8 | 53,2 | 51,9 |
| test | 97,8 | 70,0 | 59,8 | 50,5 | 49,6 | 71,8 | 61,5 | 52,4 | 51,3 |

E2E: arboles predichos desde texto crudo, segmentacion incluida. Gold-EDU: evaluacion dada la segmentacion gold. Seg es el F1 de BeginSeg por token calculado durante el entrenamiento, que puede quedar hasta un punto por debajo del valor del scorer oficial de DISRPT. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~1.000 millones de parametros en precision completa (fp32) el modelo ronda los 4 GB de pesos, y en fp16/bf16 aproximadamente 2 GB, mas overhead de activaciones y del tokenizer.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU consumer con 8-12 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 Ti, RTX 4070) deberia ser suficiente en fp16; para lotes grandes o mayor throughput, A100 o H100.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 8 GB de VRAM en fp16.
- Opciones de despliegue: la libreria `dipo` (CLI `dipo gen predict` y API Python `GenParser`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Requisito adicional: el modelo base `google/t5gemma-2-1b-1b` esta gated en Hugging Face; hay que aceptar sus terminos y autenticarse con `huggingface-cli login` o `HF_TOKEN` antes del primer uso.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con otros parsers RST generativos o discriminativos. Como referencia de categoria, este modelo compite con parsers RST clasicos (por ejemplo, los basados en transiciones o en grafos evaluados en DISRPT), pero no se dispone de sus cifras en esta ficha para establecer una tabla comparativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| larc-iu/gen-sr-t5gemma-2-1b-1b-rstdt-coarse | ~1B | 16.384 tokens | Gemma Terms of Use | Hugging Face (requiere acceso al base) |
| Parsers RST clasicos (DISRPT) | no disponible | no disponible | variable | variable |
| Otros checkpoints Dipo | no disponible | no disponible | variable | Hugging Face |

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y evaluado unicamente en RST-DT en ingles.
- Dominio restringido: el entrenamiento usa articulos del Wall Street Journal; el rendimiento en otros generos (conversacion, redes sociales, codigo) puede degradarse.
- Alucinacion estructural: al ser generativo, puede producir arboles sintacticamente validos pero retoricamente incorrectos; el F1 completo end-to-end en test es 49,6, lo que indica un margen de error considerable.
- Segmentos vacios: en aproximadamente 1 de cada 3.000 segmentos el modelo emite un segmento vacio; se recomienda filtrar con `edu.strip()`.
- Longitud: documentos de mas de 16.384 tokens se rechazan con error en lugar de truncarse; hay que trocear manualmente.
- Estructura de lineas: el modelo colapsa todos los espacios en blanco, por lo que no aprovecha saltos de linea ni parrafos como senal.
- Licencia: los pesos heredan los Gemma Terms of Use del modelo base; el uso comercial esta sujeto a esas condiciones.
- Datos de entrenamiento: RST-DT (LDC2002T07) se distribuye bajo el acuerdo de usuario del LDC; hay que verificar que el uso previsto este permitido.
- Reproducibilidad: las puntuaciones provienen de una unica ejecucion de entrenamiento y la variacion entre ejecuciones en conjuntos de test pequenos puede ser de varios puntos.
- Acceso: requiere aceptar los terminos del modelo base gated y autenticarse; sin ello la carga falla con error 401.
- Uso previsto: investigacion y analisis de texto; no esta disenado para produccion critica sin validacion humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/gen-sr-t5gemma-2-1b-1b-rstdt-coarse
- Modelo base: https://huggingface.co/google/t5gemma-2-1b-1b
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper (arXiv 2610.17658): https://arxiv.org/abs/2610.17658
- RST Discourse Treebank (LDC2002T07): https://catalog.ldc.upenn.edu/LDC2002T07
