# larc-iu/gen-sr-gemma-4-31b-it-rstdt-coarse

## Resumen

`larc-iu/gen-sr-gemma-4-31b-it-rstdt-coarse` es un parser generativo de estructura retórica (RST, *Rhetorical Structure Theory*) desarrollado por el grupo LARC de la Universidad de Indiana. El modelo convierte texto plano en un arbol de discurso mediante una estrategia *end-to-end*: el modelo de lenguaje genera una secuencia linealizada de acciones *shift-reduce* (serializacion `sr`) y de ahi se recupera la segmentacion en unidades de discurso elementales (EDU) y la estructura jerarquica con sus relaciones retoricas. Esta construido sobre `google/gemma-4-31B-it` como backbone causal (*decoder-only*) afinado con LoRA y cabezas de tarea especificas.

El modelo resuelve un problema clasico del procesamiento del discurso: analizar como se organizan las clausulas y oraciones de un texto en relaciones como *elaboration*, *contrast* o *attribution*. Frente a los parsers RST tradicionales, que suelen depender de parsers sintacticos externos y de segmentadores de EDU separados, este enfoque genera directamente la estructura a partir de texto crudo, sin tokenizacion previa ni limpieza.

Es relevante porque forma parte del ecosistema [Dipo](https://github.com/larc-iu/dipo), una libreria que unifica parsers RST generativos y discriminativos, y porque acompana al paper *Worth Their Weights? Evaluating Generative Models for Discourse Parsing* (Gessler y Zeldes, 2026), que evalua hasta que punto los modelos generativos grandes son competitivos en parsing del discurso. La variante `coarse` reduce el inventario original de 111 etiquetas a 18 relaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (*decoder-only*), backbone `google/gemma-4-31B-it` con adaptador LoRA y cabezas de tarea |
| Parametros totales | 31B en el modelo base (el repositorio contiene solo el adaptador LoRA y las cabezas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (documentos mas largos se rechazan con error) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (heredada de `google/gemma-4-31B-it`) |
| Formato de pesos | no disponible (repositorio de 0,5 GB con adaptador LoRA; el base se descarga del Hub) |

## Arquitectura y entrenamiento

El modelo usa un backbone causal `decoder_only` (Gemma 4 31B instruct) y una serializacion `sr` (*shift-reduce*): el texto se procesa como una secuencia de acciones de desplazamiento y reduccion que, al decodificarse, reconstruye el arbol RST. La segmentacion en EDUs y la estructura se recuperan de la cadena decodificada, de modo que el parsing es end-to-end sobre texto crudo, con todos los espacios en blanco colapsados. El repositorio contiene unicamente el adaptador LoRA y las cabezas de tarea; el backbone se descarga del Hub en el primer uso.

El entrenamiento se realizo sobre el split de entrenamiento de RST-DT (LDC2002T07), 385 articulos del Wall Street Journal del Penn Treebank, usando el texto original sin tokenizar de la release del LDC. Las etiquetas se mapearon de un inventario de 111 relaciones a 18 clases: `attribution`, `background`, `cause`, `comparison`, `condition`, `contrast`, `elaboration`, `enablement`, `evaluation`, `explanation`, `joint`, `manner-means`, `same-unit`, `summary`, `temporal`, `textual-organization`, `topic-change` y `topic-comment`. El checkpoint se selecciono sobre `e2e_full_f1` en dev. No se documentan en la informacion disponible detalles sobre volumen de tokens, composicion del dataset mas alla de RST-DT, ni si hubo RLHF o DPO.

## Capacidades

- Parsing RST end-to-end: genera segmentacion en EDUs y estructura jerarquica con relaciones retoricas a partir de texto plano en ingles.
- Salida en formato de arbol serializado (por ejemplo, cadena RS4 mediante `tree.to_rs4_string()`).
- Procesamiento de texto crudo sin tokenizar: acepta saltos de linea y espacios arbitrarios, que colapsa internamente.
- Deteccion de estructura de secciones: en las pruebas del autor, los encabezados de seccion tienden a aislarse como segmento propio.
- Procesamiento por lotes: la CLI admite un fichero `.txt` o un directorio completo con `--text-file` y `--output-dir`.
- Integracion programatica via `dipo.rst.parsers.gen.modeling_gen.GenParser`.
- Capacidad limitada a ingles y al dominio de analisis del discurso; no se documentan tool calling, agentes, vision ni audio.

## Casos de uso

- Analisis de discurso en investigacion linguistica: extraer arboles RST de corpus en ingles para estudiar patrones de cohesion y coherencia con un parser que no requiere preprocesado sintactico.
- Resumen extractivo guiado por estructura: identificar las unidades nucleares (*nucleus*) frente a las satelites para seleccionar las partes centrales de un documento antes de resumir.
- Evaluacion de coherencia en generacion de texto: comparar la estructura RST de un texto generado con la de una referencia para detectar saltos logicos o relaciones mal construidas.
- Analisis de articulos periodisticos: al estar entrenado sobre WSJ, es adecuado para procesar noticias economicas y financieras en ingles y mapear relaciones de *attribution*, *contrast* o *elaboration*.
- Segmentacion de documentos largos en unidades discursivas: usar las EDUs predichas como unidades base para tareas posteriores de recuperacion o indexacion semantica.
- Investigacion sobre parsing generativo: reproducir y comparar el rendimiento de un backbone LLM grande frente a parsers discriminativos en el benchmark RST-DT, en el marco del paper asociado.
- Analisis de textos cientificos o tecnicos: aunque no se documenta entrenamiento en ese dominio, la deteccion de encabezados como segmentos propios facilita el troceado de secciones en documentacion tecnica.

## Benchmarks y rendimiento

Resultados publicados en la model card (F1 x 100, Parseval original, spans hoja triviales excluidos). El checkpoint se selecciono sobre `e2e_full_f1` en dev.

| Split | Seg | E2E Span | E2E Nuc | E2E Rel | E2E Full | Gold-EDU Span | Gold-EDU Nuc | Gold-EDU Rel | Gold-EDU Full |
|---|---|---|---|---|---|---|---|---|---|
| dev | 97,8 | 73,1 | 64,1 | 53,9 | 52,9 | 75,8 | 66,3 | 56,3 | 55,1 |
| test | 98,1 | 75,3 | 65,6 | 56,0 | 54,7 | 77,5 | 67,6 | 57,8 | 56,5 |

`E2E` evalua arboles predichos desde texto crudo, incluyendo segmentacion; `Gold-EDU` evalua con la segmentacion gold. `Seg` es el F1 de BeginSeg por token calculado durante el entrenamiento, que puede quedar hasta un punto por debajo del valor del scorer oficial de DISRPT. Los resultados provienen de una unica ejecucion de entrenamiento y la variacion entre ejecuciones en conjuntos de test pequenos puede ser de varios puntos. No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el backbone tiene 31B parametros; en precision bf16 requiere aproximadamente 62 GB solo para pesos, mas activaciones y cache KV. El adaptador LoRA anadido es de 0,5 GB.
- Cuantizacion: no se documentan tipos de cuantizacion soportados por la libreria Dipo; con cuantizacion de 8 bits el modelo rondaria los 31 GB y con 4 bits unos 16 GB, aunque estos valores son estimaciones y no estan confirmados por el autor.
- GPU recomendadas: A100 80 GB o H100 80 GB para inferencia en bf16 sin cuantizar; multiples GPU para repartir el modelo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) sin cuantizacion agresiva; con 4 bits podria intentarse, pero no hay soporte documentado.
- Despliegue: la via oficial es la libreria `dipo` (`pip install dipo`), con CLI `dipo gen predict` o la clase `GenParser` en Python. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generacion es autorregresiva sobre secuencias de acciones *shift-reduce*, lo que implica un coste proporcional a la longitud del documento.
- Restriccion de longitud: documentos de mas de 16.384 tokens se rechazan con error en lugar de truncarse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| larc-iu/gen-sr-gemma-4-31b-it-rstdt-coarse | 31B (base) + LoRA | 16.384 tokens | Parser RST generativo, serializacion shift-reduce | Apache 2.0 (base) | Hugging Face, base con acceso restringido |
| Parsers RST discriminativos clasicos (p. ej. DMRST, TopDown) | no disponible | no disponible | Parsing supervisado con encoder y decodificador de arboles | no disponible | no disponible |
| Otros modelos del ecosistema Dipo | no disponible | no disponible | Parsers generativos y discriminativos bajo la misma libreria | no disponible | Repositorio GitHub de Dipo |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y etiquetado exclusivamente para ingles (`language: en`).
- Dominio acotado: entrenado sobre RST-DT (articulos del WSJ); el rendimiento en otros generos o dominios no esta documentado.
- Longitud limitada: rechaza documentos de mas de 16.384 tokens con error, sin truncado automatico.
- Segmentos vacios: en aproximadamente 1 de cada 3.000 segmentos (observado en una muestra de codigo) el modelo puede emitir un segmento vacio; se recomienda filtrar con `edu.strip()`.
- Estructura de lineas ignorada: el modelo colapsa todos los espacios en blanco, por lo que los saltos de linea y parrafos no se usan como senal, aunque en las pruebas los encabezados de seccion tendieron a aislarse.
- Variabilidad: los resultados provienen de una sola ejecucion y la variacion entre ejecuciones puede ser de varios puntos en test.
- Acceso restringido: el modelo base `google/gemma-4-31B-it` esta *gated* en Hugging Face; es necesario aceptar sus terminos e iniciar sesion con `huggingface-cli login` o definir `HF_TOKEN`.
- Licencia: los pesos heredan los terminos del modelo base (Apache 2.0), pero el entrenamiento usa RST-DT (LDC2002T07), distribuido por el LDC bajo su acuerdo de usuario; hay que verificar que el uso previsto este permitido por dicho acuerdo.
- Uso previsto: investigacion y analisis de texto; los pesos no incluyen garantias para uso comercial sin revisar las condiciones del corpus y del modelo base.
- Riesgo de alucinacion estructural: al ser un modelo generativo, puede producir secuencias de acciones invalidas o arboles mal formados; la libreria Dipo debe validar la salida.
- Sin datos de sesgo documentados: no se ha publicado un analisis de sesgos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larc-iu/gen-sr-gemma-4-31b-it-rstdt-coarse
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio Dipo: https://github.com/larc-iu/dipo
- Paper: https://arxiv.org/abs/2610.17658
- Corpus RST-DT (LDC2002T07): https://catalog.ldc.upenn.edu/LDC2002T07
