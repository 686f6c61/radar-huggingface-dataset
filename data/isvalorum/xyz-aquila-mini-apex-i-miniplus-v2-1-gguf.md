# IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

XYZ-Aquila-mini APEX-I-MiniPlus-V2.1 GGUF es una cuantización de terceros del modelo base XYZAILab/XYZ-Aquila-mini, publicada por el usuario IsValorum. Se trata de una arquitectura Mixture-of-Experts dispersa (MoE) con atención híbrida lineal, 40 capas y 256 micro-expertos, con 34.660.610.688 parámetros totales (34,66 B) y una ventana de contexto declarada de 256.000 tokens. El repositorio ocupa 14,8 GB y el autor cifra el peso efectivo del cuantizado en aproximadamente 13,74 GiB.

Su relevancia está en el objetivo declarado de comprimir un MoE de este tamaño en un envoltorio de 13–14 GB manteniendo una fidelidad de razonamiento propia de cuantizaciones Q5_K/Q6_K. El autor reporta una perplejidad WikiText-2 de 6,7927 ± 0,1884 medida sobre el binario GGUF (contexto 2048, 10 fragmentos), frente a una línea base sin cuantizar de aproximadamente 6,72, es decir, un incremento de unos +0,07 puntos. Para conseguirlo aplica una receta de cuantización por tensor en lugar de una tasa uniforme.

La ficha del autor insiste en diferenciar esta familia MiniPlus de las recetas genéricas de la comunidad, que comprimen los expertos centrales a IQ2_S y dejan el cabezal de salida en Q3_K_M. La licencia es Apache 2.0 y el modelo cubre 13 idiomas, incluido el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa (sparse Mixture-of-Experts) con atención híbrida lineal; 40 capas y 256 micro-expertos; router en F32 |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (según el autor; validado por el autor hasta +160K en sus pruebas) |
| Tipos de cuantizacion | GGUF APEX-I-MiniPlus V2.1, mixta por tensor: IQ3_XXS en expertos centrales (capas 10-29), Q3_K en expertos de borde (capas 0-9 y 30-39), Q5_K en experto compartido (las 40 capas), Q4_K en proyecciones q/k/v y Q6_K en la salida de atención, Q8_0 en puertas de atención (30 capas), Q6_K en el cabezal de salida, F32 en routers (gate_inp). Huella aproximada de 3 bits por peso |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar (13 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 14,8 GB |
| Peso declarado del cuantizado | aprox. 13,74 GiB (+<100 MB sobre MiniPlus V2) |
| Modelo base | XYZAILab/XYZ-Aquila-mini |
| Descargas / likes | 612 descargas / 0 likes |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con capas de atención híbrida lineal y mezcla dispersa de expertos: 40 capas y 256 micro-expertos, con una capa de experto compartido (shexp) común a todas las capas y matrices de enrutamiento (gate_inp) que deciden a qué expertos se despacha cada token. La ficha del cuantizador etiqueta el modelo con qwen35moe, lo que apunta a una topología MoE de la familia Qwen, si bien no se aportan detalles sobre número de expertos activos por token, dimensión oculta, número de cabezas ni configuración de la atención lineal. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO: esos datos corresponden a la model card del modelo base, que no forma parte de la información disponible.

La innovación de esta publicación no está en el entrenamiento, sino en la cuantización. El autor aplica una receta por tensor orientada a tres objetivos: preservar sin comprimir las matrices de enrutamiento en F32 para evitar lo que denomina deriva de enrutamiento (que un token acabe en el experto equivocado), blindar el cabezal de salida en Q6_K y las puertas de atención en Q8_0, y sustituir los códecs no lineales de los expertos de borde por Q3_K lineal, optimizado para SIMD, con el fin de eliminar las paradas de descompresión AVX2 en CPU cuando parte del modelo se descarga a memoria del sistema. Según el autor, ese cambio es el responsable de sostener velocidades de generación de +24 a 28+ tok/s en modo streaming desde RAM DDR4/DDR5, con un sobrecoste de menos de 100 MB respecto a la versión V2.

## Capacidades

- Generación de texto conversacional en 13 idiomas, con pipeline declarado de text-generation.
- Razonamiento multi-paso con modo de pensamiento: la ficha menciona explícitamente el bloque `<think>`, por lo que el modelo está orientado a cadenas de razonamiento largas.
- Generación de código: el autor justifica parte de la receta de cuantización por los fallos de sintaxis, indentación y llaves que aparecen en cuantizaciones agresivas de modelos de razonamiento; la preservación del cabezal de salida en Q6_K busca sostener la consistencia sintáctica.
- Contexto largo: ventana declarada de 256K tokens, con validación del autor más allá de 160K tokens.
- Capacidades multilingües: en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th y ar.
- Uso conversacional en llama.cpp y derivados, con compatibilidad declarada con endpoints (tag endpoints_compatible).
- Capacidades de tool calling, function calling, agentes o visión: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento con contexto largo en una sola estación de trabajo: el modelo puede ingerir documentación técnica extensa (decenas de miles de tokens) y razonar sobre ella sin trocear, gracias a la ventana de 256K y a la posibilidad de mantener en VRAM solo la caché de contexto activa mientras los pesos se transmiten desde RAM.
- Asistente de código en local: la preservación del cabezal de salida en Q6_K y de los expertos centrales en IQ3_XXS busca evitar los errores de sintaxis y llaves desbalanceadas típicos de cuantizados de 2-3 bits uniformes, lo que lo hace utilizable para completar y revisar código dentro del editor sin enviar el repositorio a un servicio externo.
- Análisis de repositorios completos: con 256K tokens de contexto se puede cargar un conjunto amplio de ficheros de un proyecto y pedir resúmenes de arquitectura, detección de dependencias o planes de refactorización.
- Atención al cliente multilingüe: al cubrir 13 idiomas, incluidos castellano, portugués, francés, alemán e italiano, puede gestionar conversaciones multi-turno con clientes de distintas regiones desde una única instancia desplegada en local.
- Despliegue en hardware mixto (GPU + RAM): los casos donde no hay 24 GB de VRAM libres se benefician del diseño de la V2.1, pensado para hacer streaming desde DDR4/DDR5 a +24-28 tok/s con paradas de descompresión AVX2 eliminadas.
- Procesamiento de expedientes largos en sectores regulados: al ejecutarse íntegramente en infraestructura propia y con licencia Apache 2.0, encaja en flujos donde los datos no pueden salir de la organización (legal, sanidad, administración pública).
- Rutas de evaluación y comparación de cuantizaciones: sirve como punto de referencia para medir el impacto de distintas recetas GGUF sobre un mismo MoE, usando la perplejidad WikiText-2 como métrica reproducible.
- Generación de documentación técnica multilingüe: traducción y redacción de manuales entre los 13 idiomas soportados con contexto largo para mantener terminología consistente a lo largo del documento.

## Benchmarks y rendimiento

El único dato cuantitativo publicado es la perplejidad sobre WikiText-2. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra batería estándar en la información disponible.

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad WikiText-2 | 6,7927 ± 0,1884 | Medida sobre el binario GGUF, 2048 de contexto, 10 fragmentos |
| Perplejidad WikiText-2 del modelo sin cuantizar | aprox. 6,72 | Referencia citada por el autor |
| Delta de perplejidad | aprox. +0,07 | Respecto a la línea base sin cuantizar |
| Velocidad de generación (streaming desde RAM del sistema) | +24 a 28+ tok/s | Con la mayor parte del modelo descargada a DDR4/DDR5, según el autor |

No se han publicado resultados de benchmarks de conocimiento, código o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 13,74 GiB según el autor, dentro de un repositorio de 14,8 GB.
- Offload completo en GPU: con `-ngl 99` sobre una GPU de 24 GB (RTX 3090, RTX 4090, A100 40 GB, L40S) el autor indica que la calidad es idéntica a la de la V2 y que el rendimiento es el máximo posible en núcleos tensoriales.
- Escenario objetivo de contexto completo: estaciones de trabajo de 24 GB de VRAM que mantienen la caché de contexto activa en GPU mientras el grueso de los pesos se transmite desde memoria del sistema, lo que permite cubrir los 256K tokens declarados.
- GPU de consumo: cabe en tarjetas de 24 GB con offload total. En GPUs de 16 GB (RTX 4080, RTX 5080) o de 12 GB haría falta offload parcial de capas a CPU, con la penalización de velocidad correspondiente; no se dispone de cifras concretas para esas configuraciones.
- Memoria del sistema: el autor recomienda DDR4 en doble canal o DDR5 a 6000+ MT/s para el modo streaming; el ancho de banda de memoria es el factor limitante en ese escenario.
- Caché KV: el tamaño exacto de la caché KV para 256K tokens no está disponible, ya que la información proporcionada no incluye la configuración de atención (número de cabezas, número de cabezas KV, dimensión por cabeza).
- Opciones de despliegue: llama.cpp es el runtime de referencia del formato GGUF, junto con sus derivados (Ollama, LM Studio, koboldcpp, llama-cpp-python). El tag endpoints_compatible sugiere compatibilidad con servidores de inferencia tipo API. vLLM y TGI trabajan de forma nativa con safetensors, por lo que requerirían los pesos originales del modelo base o el soporte experimental de GGUF de dichos motores.
- Throughput: +24 a 28+ tok/s en modo streaming desde RAM del sistema; no se publican cifras de latencia ni de throughput en modo 100% VRAM.

## Comparativa con modelos similares

La comparación se limita a las variantes del mismo modelo base documentadas por el autor. No hay datos disponibles sobre alternativas de otros fabricantes con el mismo tamaño o la misma tarea.

| Version | Expertos centrales | Expertos de borde | Experto compartido | Cabezal de salida | Routers | Tamano | Notas del autor |
|---|---|---|---|---|---|---|---|
| APEX-I-MiniPlus V2.1 (esta) | IQ3_XXS | Q3_K (10 capas) | Q5_K (40 capas) | Q6_K | F32 | aprox. 13,74 GiB | Ausencia de paradas AVX2; +24 a 28+ tok/s desde RAM; <100 MB más que V2 |
| APEX-I-MiniPlus V2 | IQ3_XXS | IQ3_S (10 capas) | IQ4_NL | Q6_K | F32 | aprox. 13,6 GiB (+1,2 GB frente a genérica) | Mayor blindaje teórico de capas de borde; calidad prácticamente idéntica a V2.1 incluso a +160K de contexto |
| APEX-I-Mini genérica de la comunidad | IQ2_S | Q3_K (solo 5 capas) | Q4_K / Q3_K | Q3_K_M | Comprimidos | aprox. 12,5 GB | Errores de sintaxis, indentación de código rota y perplejidad elevada en el bloque de pensamiento |
| Modelo base sin cuantizar (XYZAILab/XYZ-Aquila-mini) | FP | FP | FP | FP | FP | no disponible | Perplejidad WikiText-2 de referencia aprox. 6,72 |

## Limitaciones y advertencias

- Perdida por cuantizacion: incluso en la receta optimizada, el autor reconoce un incremento de perplejidad de aproximadamente +0,07 puntos frente al modelo sin cuantizar. Los expertos centrales operan a IQ3_XXS, por debajo de 4 bits.
- Ausencia de evaluacion estandar: no hay MMLU, HumanEval, GSM8K ni evaluación multilingüe por idioma. La única métrica publicada es la perplejidad WikiText-2 en un contexto de 2048 tokens, que no informa sobre comportamiento a 256K ni sobre tareas de razonamiento.
- Riesgo de alucinacion: no se documentan tasas de alucinación ni estrategias de mitigación. Como en cualquier modelo generativo, la salida debe verificarse, especialmente en dominios técnicos y legales.
- Idiomas declarados sin validacion: la lista de 13 idiomas proviene de los metadatos del modelo base. No hay ninguna evaluación por idioma en la información disponible, por lo que el rendimiento real en castellano, tailandés o vietnamita, entre otros, es desconocido.
- Deriva de enrutamiento: el autor afirma que mantener los routers en F32 la elimina al 100%, pero se trata de una afirmación del propio cuantizador sin verificación independiente publicada.
- Validacion limitada por la comunidad: el repositorio acumula 612 descargas y 0 likes, lo que indica una adopción muy baja y ausencia de retroalimentación pública verificable.
- Atribucion de calidad autodeclarada: afirmaciones como "Q5-Q6 de calidad con huella de 3 bits" o "el límite tecnológico absoluto" son afirmaciones de marketing del autor, no resultados revisados por terceros.
- Licencia: el repositorio se publica bajo Apache 2.0, lo que en principio permite uso comercial. No obstante, al ser una obra derivada, conviene verificar la licencia del modelo base XYZAILab/XYZ-Aquila-mini antes de un despliegue comercial, ya que la información disponible no la detalla.
- Naturaleza del artefacto: es una cuantización de terceros, no una publicación oficial del equipo que entrenó el modelo base. Cualquier corrección de comportamiento debe contrastarse contra los pesos originales.
- Dependencia del runtime: el rendimiento declarado en modo streaming depende de la microarquitectura del procesador (soporte AVX2), del número de canales de memoria y de la velocidad de la RAM; en configuraciones de un solo canal o DDR4 lenta las cifras de 24-28 tok/s no serán alcanzables.
- Cifras de tamano ligeramente dispares: el autor cita 13,74 GiB y 14,7 GB en distintos puntos de la ficha, y el repositorio ocupa 14,8 GB; conviene verificar el tamaño real del fichero antes de planificar el despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/XYZ-Aquila-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/XYZAILab/XYZ-Aquila-mini
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo, su arquitectura o sus benchmarks: únicamente aparecieron sitios de letras de canciones (AZLyrics, Genius, Lyrics.com, LyricsTraining, LyricFinder), sin relación con el contenido de esta ficha. No se dispone, por tanto, de enlaces a papers, blogs técnicos, repositorios de código ni demos adicionales.
