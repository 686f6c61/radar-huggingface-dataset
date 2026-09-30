# Aquiles-ai/Chargaff-Tokenizer

## Resumen

Chargaff-Tokenizer es un tokenizador byte-level BPE publicado por Aquiles-ai. No es un modelo de lenguaje con pesos: es el componente de tokenizacion del modelo de prediccion de ADN Chargaff, disenado para convertir secuencias genomicas en identificadores enteros de forma determinista. Su vocabulario es de 512 entradas y su funcionamiento es de 1 token por byte UTF-8, sin merges ni subpalabras.

La relevancia de esta pieza es de interoperabilidad: se presenta como equivalente funcional del `CharLevelTokenizer` de Evo2 (bytes UTF-8 crudos), pero con un layout de ids propio. En Evo2 la base `A` se mapea a 65 (su valor ASCII), mientras que aqui se mapea a 32. Esto implica que los checkpoints de Evo2 no se pueden cargar directamente con este tokenizador sin remapear la matriz de embeddings, pero permite reutilizar la arquitectura y las recetas de entrenamiento de Evo2 partiendo de un vocabulario limpio y de 512 entradas.

El tokenizador declara `model_max_length=1048576`, licencia Apache-2.0, idioma `en` (aunque el alfabeto cubre los 256 bytes UTF-8) y compatibilidad con `endpoints_compatible` en HuggingFace. En el momento de la consulta acumula 0 descargas y 1 like, y se distribuye a traves de la libreria `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE sin merges (1 token por byte UTF-8) |
| Parametros totales | no disponible (no es un modelo con pesos; es un tokenizador) |
| Parametros activos | no disponible (no aplica, no es un modelo MoE) |
| Longitud de contexto | 1 048 576 tokens (`model_max_length=1048576`) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | `en` declarado; el alfabeto cubre los 256 bytes UTF-8 |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no contiene pesos; se carga con `AutoTokenizer` de `transformers`) |
| Tamano de vocabulario | 512 |
| Componentes del vocabulario | `0..255`: bytes UTF-8 (`sorted(ByteLevel.alphabet())`); `256`: `<eos>` (tambien usado como `bos_token`); `257`: `<pad>`; `258..511`: `<unused_258>`…`<unused_511>` |
| Pre-tokenizer | `ByteLevel(add_prefix_space=False, use_regex=False)` |
| Decoder | `ByteLevel()` |
| Padding | `padding_side=right` |
| Fecha de publicacion en HuggingFace | 2026-09-30 (ultima actualizacion: 2026-09-30) |

## Arquitectura y entrenamiento

El tokenizador se define como `BPE(vocab, merges=[], unk_token=None)`: es decir, se instancia el algoritmo BPE con la lista de merges vacia, lo que en la practica lo convierte en un mapeo directo byte a id. No ha habido entrenamiento ni aprendizaje de fusiones, y la lista de ids es completamente determinista: los 256 primeros ids corresponden al alfabeto `ByteLevel` en orden alfabetico, y los 256 restantes son tokens de control y relleno hasta alcanzar `vocab_size=512`. El pre-tokenizer usa `use_regex=False`, por lo que no se aplican los patrones de division tipo GPT-2 y todos los bytes de entrada se procesan en crudo.

La innovacion tecnica no esta en el algoritmo, sino en la decision de diseno: reproducir el comportamiento del `CharLevelTokenizer` de Evo2 manteniendo un layout de ids propio y controlado, evitando la dependencia del mapeo ASCII del original y reservando espacio de vocabulario para futuras extensiones mediante los tokens `<unused>`. No se documentan datos de entrenamiento, numero de tokens de corpus, ni fases de RLHF o DPO, porque no existen: el artefacto no se entrena.

## Capacidades

- Codificacion de secuencias de ADN (`ACGT`) a ids enteros y decodificacion inversa byte a byte, con verificacion en la model card: `tok.encode("ACGT")` devuelve `[32, 34, 38, 51]`.
- Tokenizacion por lotes con padding: `tok(["ACGT", "ACGTN"], padding=True)` genera `input_ids` con relleno usando el id 257.
- Cobertura completa de los 256 bytes UTF-8, lo que permite representar cualquier entrada binaria o textual sin tokens `unk` (`unk_token=None`).
- Longitud maxima configurada de 1 048 576 tokens, adecuada para ventanas genomicas largas.
- Compatibilidad directa con `AutoTokenizer.from_pretrained` de la libreria `transformers` y con el tag `endpoints_compatible` de HuggingFace.
- Capacidad de actuar como capa de tokenizacion para el modelo Chargaff de prediccion de ADN y como base para remapear embeddings de checkpoints tipo Evo2.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, vision ni audio: no es un modelo generativo.

## Casos de uso

- Preprocesado de corpus genomicos para entrenamiento: convertir ficheros FASTA con millones de pares de bases en secuencias de ids enteros listos para un `DataLoader`, con un mapeo estable que se puede reproducir entre ejecuciones.
- Reentrenamiento de checkpoints estilo Evo2: dado que el layout de ids difiere del original (A=32 frente a A=65), el tokenizador sirve como punto de partida para entrenar desde cero o para reconstruir la matriz de embeddings con el nuevo vocabulario.
- Ventanas de contexto largo en modelos de ADN: con 1 048 576 tokens de longitud maxima, permite tokenizar fragmentos genomicos extensos sin truncado previo, util para tareas de prediccion de elementos regulatorios o de estructura.
- Pipelines de bioinformatica reproducibles: al ser determinista y sin merges aprendidos, la tokenizacion de una misma secuencia produce siempre la misma salida, lo que facilita la auditoria de resultados y la comparacion entre experimentos.
- Prototipado rapido en notebooks: su carga con `AutoTokenizer` y su uso en CPU permiten integrarlo en entornos sin GPU para validar la fase de preprocesado antes de escalar al entrenamiento.
- Analisis de variantes y mutaciones: al mapear cada nucleotido a un id fijo, es sencillo construir diferencias posicionales entre secuencias (por ejemplo, comparar alelos) a nivel de token sin ambiguedad de subpalabras.
- Integracion como dependencia en servicios de inferencia genomica: al no requerir pesos ni GPU, se puede empaquetar junto al modelo principal dentro de un contenedor ligero y ejecutarse en el mismo proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el tokenizador no requiere GPU. La carga y la codificacion se ejecutan en CPU con un coste de memoria despreciable.
- Memoria: la tabla de vocabulario tiene 512 entradas, por lo que la huella en memoria del artefacto es marginal frente a la de cualquier modelo con pesos.
- GPU recomendadas: no aplica. No hay aceleracion relevante que obtener en A100, H100 o RTX 4090 para un tokenizador byte-level.
- Compatibilidad con GPU de consumo: no aplica; el cuello de botella sera el modelo Chargaff que consuma esta salida, no el tokenizador.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), la libreria Rust `tokenizers` de HuggingFace y cualquier runtime que consuma tokenizadores de HuggingFace. El tag `endpoints_compatible` indica que puede servirse a traves de endpoints de HuggingFace.
- Latencia y throughput: no se han publicado mediciones. Cualitativamente, la codificacion es una operacion de coste lineal respecto al numero de bytes y sin busqueda de merges, por lo que el coste por token es minimo en comparacion con un BPE con vocabulario grande.

## Comparativa con modelos similares

| Tokenizador | Tipo | Tamano de vocabulario | Contexto maximo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chargaff-Tokenizer | Byte-level BPE sin merges | 512 | 1 048 576 | Apache-2.0 | HuggingFace (`Aquiles-ai/Chargaff-Tokenizer`) |
| Evo2 `CharLevelTokenizer` | Char-level sobre bytes UTF-8 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Citado en la model card de Chargaff |
| Otros tokenizadores genomicos y byte-level BPE de texto | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La diferencia clave documentada frente a Evo2 es el layout de ids: `A=32` en Chargaff frente a `A=65` en Evo2. Esto hace que los embeddings de ambos tokenizadores no sean intercambiables y que no se puedan cargar checkpoints de Evo2 sin remapeo previo.

## Limitaciones y advertencias

- Fertilidad de aproximadamente 1 token por byte: textos en CJK o con emojis se expanden entre 3 y 4 veces en numero de tokens. Es eficiente para alfabetos de ADN (`ACGTN`), pero derrochador para texto multilingue.
- Ausencia de semantica de subpalabras: al no haber merges, palabras frecuentes no se agrupan en un unico token, lo que penaliza cualquier uso sobre lenguaje natural.
- Incompatibilidad de ids con Evo2: cargar un checkpoint de Evo2 con este tokenizador produce resultados incorrectos. Es obligatorio remapear la matriz de embeddings o entrenar desde cero.
- Idioma declarado `en`, aunque el alfabeto cubra los 256 bytes UTF-8; el rendimiento real sobre texto no ingles no esta documentado.
- No contiene pesos ni logica de modelado: no puede usarse para generacion, razonamiento, codigo, matematicas, vision ni tool calling.
- Riesgo de alucinacion: no aplica al tokenizador en si, pero cualquier modelo que lo use heredara sus propios sesgos y errores.
- Sesgos conocidos: no se documentan sesgos especificos del tokenizador; al ser determinista y sin entrenamiento, no introduce sesgos estadisticos de corpus, pero tampoco los corrige.
- Licencia Apache-2.0: permisiva y apta para uso comercial, con las obligaciones habituales de atribucion y conservacion de avisos.
- Advertencia de produccion: la fecha de publicacion registrada en HuggingFace (2026-09-30) y el bajo numero de descargas (0) y likes (1) indican un artefacto muy reciente y poco validado por la comunidad; conviene verificar el comportamiento antes de integrarlo en un pipeline critico.

## Enlaces

- HuggingFace del tokenizador: https://huggingface.co/Aquiles-ai/Chargaff-Tokenizer
- Perfil de la organizacion en HuggingFace: https://huggingface.co/Aquiles-ai
- Repositorio en GitHub: https://github.com/Aquiles-ai/
- Pagina de proyectos open source de Aquiles-ai: https://aquiles-ai.vercel.app/oss
- Otro modelo de la organizacion (Athenea-4B-Thinking): https://huggingface.co/Aquiles-ai/Athenea-4B-Thinking/tree/main
- No se han encontrado papers, blogs tecnicos ni demos especificos del tokenizador en la busqueda web realizada.
