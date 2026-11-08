# panitagorontalo/nllb-200-gorontalo-bi-600M

## Resumen

El modelo `panitagorontalo/nllb-200-gorontalo-bi-600M` es un sistema de traduccion automatica neuronal bidireccional entre bahasa Indonesia (`ind_Latn`) y bahasa Gorontalo (`gor_Latn`), una lengua austronesia del subgrupo filipino-gorontalo-mongondow hablada en la provincia de Gorontalo y la zona del golfo de Tomini (Sulawesi, Indonesia). Lo desarrolla Panita Research Gorontalo como parte de una iniciativa de preservacion digital del idioma, y se construye mediante un fine-tuning completo en `bfloat16` sobre la arquitectura `facebook/nllb-200-distilled-600M` (familia M2M-100, transformer encoder-decoder). El resultado es un checkpoint de 615.072.768 parametros con licencia Apache 2.0.

El problema que resuelve es concreto: NLLB-200 original no incluye el codigo `gor_Latn` en su lista de lenguas, de modo que su rendimiento zero-shot sobre gorontalo es practicamente nulo (el autor declara 0.13 SacreBLEU). Este modelo registra un token linguistico especifico (`gor_Latn`, ID 256204) inicializado como centroide de embeddings de lenguas emparentadas (indonesio, bugis, tagalo y cebuano), y se entrena sobre un corpus paralelo extraido y alineado de dos diccionarios de Mansoer Pateda (1987 y 2001).

Es relevante ahora por dos motivos: demuestra que un modelo de 600M puede adaptarse a una lengua de muy bajos recursos con un corpus de menos de 100.000 muestras seq2seq, y aborda explicitamente la variacion ortografica interna del gorontalo (eje 1987 frente a 2001), un factor que suele degradar la calidad en lenguas con normalizacion incompleta. El modelo fue publicado en noviembre de 2026 y, a fecha de la informacion disponible, registra 0 descargas y 1 like en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB-200 distilled) |
| Parametros totales | 615.072.768 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura base NLLB-200 distilled; la model card no declara el limite) |
| Tipos de cuantizacion | no disponible (el autor solo declara entrenamiento en `bfloat16`; no se listan pesos cuantizados) |
| Idiomas soportados | `id` (indonesio, `ind_Latn`) y `gor` (gorontalo, `gor_Latn`), en ambos sentidos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-600M`, un transformer encoder-decoder con atencion multi-cabeza estandar y token de idioma en el encoder, y se somete a un full fine-tuning en `bfloat16` sobre un corpus paralelo bidireccional. La innovacion principal es la incorporacion de un token de lengua nuevo, `gor_Latn` (ID 256204), inicializado mediante un embedding centroide calculado a partir de las representaciones de indonesio, bugis, tagalo y cebuano dentro del vocabulario original de NLLB-200; esto evita que el token arranque aleatorio y aprovecha la cercania genealogica de las lenguas austronesias.

El corpus de entrenamiento consta de 96.004 muestras seq2seq de entrenamiento (mas 2.158 de validacion y 2.159 de test), con particion estratificada declarada sin fuga de datos. Se compone de 17.118 frases paralelas completas y limpias, 17.901 entradas de lexico bilingue (en ambos sentidos), 5.039 pares de derivacion morfologica y 6.822 pares de aumento por sinonimos KBBI y registro de habla, estos ultimos solo en el split de entrenamiento. El autor documenta cuatro estrategias de adaptacion linguistica: un motor de ensamblaje de afijos y morfofonemica productiva (31 sistemas de prefijos, infijos `-um-`, `-il-`, `-im-`, sufijos `-lo`, `-a`, `-i`, cliticos y cinco sistemas de tiempo verbal), reglas de fonologizacion de prestamos del indonesio al gorontalo (lengua de vocalismo abierto), descomposicion semantica con morfemas direccionales (`mayi`, `mao`, `mola`, `mota`) y un puente de sinonimos y registros (forma comun frente a forma de respeto). Tambien se alinea la ortografia de Pateda 1987 (vocales dobles, oclusion glotal con `?`, sin semivocales `y/w`) con la de 2001 (vocales largas con `:`, sin marca glotal, semivocales explicitas); el modelo genera salida en la norma 2001 y acepta entrada en ambas.

## Capacidades

- Traduccion bidireccional indonesio a gorontalo y gorontalo a indonesio, con token de lengua `gor_Latn` propio.
- Normalizacion de variantes ortograficas: acepta entrada en la ortografia de Pateda 1987 y en la de 2001, y produce salida en la norma 2001.
- Generacion de formas derivadas y flexionadas del gorontalo mediante las reglas de afijacion y morfofonemica incorporadas en el entrenamiento (prefijos, infijos, sufijos, cliticos, alteraciones fonemicas y cinco tiempos verbales).
- Adaptacion de prestamos del indonesio segun las reglas de vocalismo abierto del gorontalo (por ejemplo, `dokter` a `dokuteri`, `polisi` a `pulisi`).
- Diferenciacion de registro de habla (forma comun frente a forma de respeto) mediante los pares de aumento por registro.
- Traduccion de entradas lexicas aisladas y de frases completas, no solo de texto corrido.
- No se declara soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento; es un modelo text2text-generation de traduccion.

## Casos de uso

- Traduccion de documentacion administrativa local: el modelo convierte comunicados, formularios y avisos del indonesio al gorontalo para administraciones de la provincia de Gorontalo, aprovechando la salida en ortografia baku 2001 y la capacidad de adaptar prestamos del indonesio.
- Digitalizacion y consulta de patrimonio lexicografico: al aceptar entrada en la ortografia de 1987, permite procesar y traducir automaticamente entradas de diccionarios historicos sin normalizacion manual previa.
- Atencion al ciudadano en servicios publicos: traduccion de respuestas de sistemas de informacion del indonesio al gorontalo, con diferenciacion de registro (forma de respeto `wa:tiya`/`ito` frente a forma comun `wau`/`yio`) segun el interlocutor.
- Educacion bilingue: generacion de material de apoyo y glosas indonesio-gorontalo para escuelas de la region, apoyandose en la cobertura de lexico y de pares de derivacion morfologica del entrenamiento.
- Traduccion de contenido digital y redes sociales: adaptacion de textos breves del indonesio al gorontalo para comunidades en linea, con manejo de variantes ortograficas de entrada.
- Investigacion linguisticas y de lenguas de bajos recursos: el checkpoint sirve como linea base reproducible (Apache 2.0, safetensors, transformers) para experimentos de adaptacion de NLLB-200 a lenguas austronesias con corpus pequenos.
- Preservacion y difusion cultural: traduccion de relatos, tradiciones y material divulgativo sobre la lengua hulontalo, con salida conforme a la norma ortografica de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados de forma independiente, `verified: false`). El conjunto de evaluacion es el test limpio del corpus `panitagorontalo/gorontalo-indonesia-parallel`, derivado del "Korpus Terpadu Dwibahasa Kamus Prof. Dr. H. Mansoer Pateda (1987 & 2001)".

| Tarea | Metrica | Resultado |
|---|---|---|
| Traduccion indonesio a gorontalo | SacreBLEU (ID a GOR, test limpio) | 23,42 |
| Traduccion indonesio a gorontalo | chrF++ (ID a GOR, test limpio) | 39,26 |
| Traduccion gorontalo a indonesio | SacreBLEU (GOR 1987 a ID, test limpio) | 21,53 |
| Traduccion gorontalo a indonesio | chrF++ (GOR 1987 a ID, test limpio) | 47,36 |

Como referencia, el autor declara un SacreBLEU zero-shot de 0,13 para NLLB-200 original sobre gorontalo, al no existir el codigo `gor_Latn` en el modelo base. No se han publicado en la informacion disponible resultados comparativos con otros sistemas sobre el mismo test.

## Requisitos de hardware

- VRAM estimada para inferencia: en `bfloat16`/`float16` el checkpoint ocupa aproximadamente 1,23 GB de pesos (615M parametros), por lo que la inferencia cabe holgadamente en GPUs de 4-8 GB; con cuantizacion de 8 bits se reduce a unos 0,6 GB y con 4 bits a unos 0,3 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4); para lotes grandes o mayor throughput, A100 o H100 resultan sobredimensionadas para este tamano pero permiten paralelizar por lotes.
- Cabe en GPU de consumo: si, en tarjetas de 4 GB o mas en precision reducida; en CPU es viable para traduccion de frases individuales.
- Opciones de despliegue: transformers (libreria declarada, pipeline `translation`), ademas de servidores compatibles con arquitecturas encoder-decoder tipo M2M-100 (por ejemplo, TGI o vLLM) y conversion a GGUF para llama.cpp u Ollama, aunque el autor no documenta ni publica estas conversiones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `panitagorontalo/nllb-200-gorontalo-bi-600M` | 615.072.768 | no disponible | indonesio y gorontalo (bidireccional) | Apache 2.0 | Hugging Face, transformers |
| `facebook/nllb-200-distilled-600M` (modelo base) | ~615M (distilled 600M) | no disponible | 200 lenguas, sin codigo `gor_Latn` | CC-BY-NC 4.0 (segun la ficha publica del modelo base; no confirmado en la informacion proporcionada) | Hugging Face |
| `facebook/nllb-200-distilled-1.3B` | ~1.300M | no disponible | 200 lenguas | CC-BY-NC 4.0 (segun la ficha publica del modelo base; no confirmado en la informacion proporcionada) | Hugging Face |

Frente al modelo base, la diferencia clave es la cobertura del par indonesio-gorontalo: NLLB-200 original no dispone del token `gor_Latn` y su rendimiento zero-shot es de 0,13 SacreBLEU segun el autor, mientras que este checkpoint declara 23,42 en ID a GOR. Frente a la variante de 1.3B, este modelo es aproximadamente la mitad en parametros, lo que reduce los requisitos de VRAM, a costa de capacidad general que no esta evaluada en la informacion disponible. No se dispone de datos de benchmarks de alternativas sobre el mismo test, por lo que la comparacion de rendimiento se limita a los valores declarados por el autor.

## Limitaciones y advertencias

- Cobertura limitada a un unico par de lenguas: solo indonesio y gorontalo; no traduce entre gorontalo y otras lenguas distintas del indonesio, y el resto del vocabulario multilingue de NLLB-200 puede haberse degradado con el fine-tuning completo (no documentado por el autor).
- Corpus de entrenamiento pequeno y de origen lexicografico: 96.004 muestras seq2seq derivadas principalmente de dos diccionarios, lo que puede limitar la generalizacion a dominios especializados, jerga moderna o registro coloquial no recogido en las fuentes.
- Resultados de benchmarks no verificados: los valores de SacreBLEU y chrF++ estan marcados como `verified: false` en el model-index y no se han reproducido de forma independiente.
- Riesgo de alucinacion y de traduccion literal: al ser un modelo seq2seq de 600M entrenado con aumento por sinonimos, puede producir formas derivadas morfologicamente plausibles pero inexistentes, o elegir un registro (comun frente a respeto) inadecuado al contexto.
- Dependencia de la normalizacion ortografica: aunque acepta entrada en ortografia de 1987 y 2001, variantes no contempladas (mezclas, errores tipograficos, ausencia de marcas de vocal larga) pueden degradar la calidad.
- Idiomas de bajos recursos: no hay garantia de cobertura de todos los matices dialectales del gorontalo ni de terminologia tecnica reciente.
- Restricciones de licencia: el checkpoint se publica bajo Apache 2.0, lo que permite uso comercial; sin embargo, conviene verificar la licencia del modelo base `facebook/nllb-200-distilled-600M` y de los datos fuente (los diccionarios de Pateda) antes de explotacion comercial, ya que la informacion disponible no detalla esas condiciones.
- Adopcion practicamente nula: 0 descargas y 1 like en Hugging Face a fecha de la informacion, lo que implica ausencia de validacion por la comunidad y de reportes de uso en produccion.
- Fecha de publicacion futura respecto a la referencia habitual (noviembre de 2026): conviene confirmar la vigencia y el mantenimiento del repositorio antes de integrarlo en pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/panitagorontalo/nllb-200-gorontalo-bi-600M
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Dataset declarado: https://huggingface.co/datasets/panitagorontalo/gorontalo-indonesia-parallel
- Blog de Meta AI sobre NLLB-200 (200 idiomas en un unico modelo): https://ai.meta.com/blog/nllb-200-high-quality-machine-translation/
- Guia de ejecucion local del modelo NLLB-200 600M: https://nllb.com/setup-nllb-locally/
