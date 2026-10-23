# AbstractPhil/geolip-rotary-experiments

## Resumen

`geolip-rotary-experiments` es un repositorio de pesos y registros de resultados publicado por el usuario AbstractPhil en HuggingFace. No es un modelo entrenado para uso general, sino el material crudo de un día de experimentos (2026-10-22) sobre codificaciones posicionales rotatorias (RoPE) utilizadas como direcciones estructurales: la fase rotatoria de un token no depende solo de su índice en la secuencia, sino de su posición dentro de una estructura fija (compartimento y ranura). Los pesos corresponden a piezas pequenas entrenadas por separado y fusionadas en un núcleo congelado tras una compuerta de amplitud que lee esa dirección.

El repositorio contiene 475 state dicts de PyTorch (1,7 GB) y las tablas de resultados de las fases A a F4 y de las pruebas S1 a S3L del autor. Salvo excepciones indicadas, todos los modelos son transformers causales de 4 capas, anchura 128, 4 cabezas y contexto 256, entrenados desde cero sobre tareas de secuencia sintéticas, con dos semillas por resultado y criterios de aceptación fijados antes de cada ejecución.

Su relevancia es de investigación, no de producto: documenta resultados reproducibles sobre capacidad de direccionamiento, fugas entre miembros fusionados, coste computacional del rotary y formas de solicitud de dirección. No incluye tokenizer, configuración de HuggingFace ni código de entrenamiento, por lo que no puede cargarse con `AutoModel` ni servirse con herramientas estándar de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (rotary position embedding, RoPE modificado con direccionamiento estructural); fusion de miembros tipo mezcla con compuerta de amplitud |
| Parametros totales | no disponible (el autor no publica el recuento; los modelos de las pruebas son de 4 capas y anchura 128) |
| Parametros activos | no disponible (la fusion por compuerta es tipo MoE, pero no se publica el numero de parametros activos) |
| Longitud de contexto | 256 tokens en entrenamiento; mediciones de coste del rotary hasta 64k tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen state dicts de PyTorch sin cuantizar; no hay GGUF ni versiones INT8/INT4) |
| Idiomas soportados | no disponible (entrenamiento exclusivo sobre tareas de secuencia sinteticas; no se declara ningun idioma natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dicts (475 ficheros, 1,7 GB en total); tablas de resultados en Markdown y registros JSON |

## Arquitectura y entrenamiento

La arquitectura base es un transformer causal pequeno: 4 capas, anchura 128, 4 cabezas de atención y contexto de 256 tokens, entrenado desde cero sobre tareas sinteticas de secuencia. La innovación central es el uso de la fase rotatoria como dirección estructural. Para RoPE rotate-half con frecuencias de par \(\omega_j\), dos vectores unitarios identicos en posiciones \(m\) y \(n\) puntúan según el kernel de dirección \(K(m-n) = \frac{1}{P}\sum_j \cos(\omega_j (m-n))\), cuyo lóbulo principal define la resolución, cuyos lóbulos laterales miden la fuga de una dirección incorrecta y cuya capacidad determina cuántas posiciones pueden mantenerse separadas. Una consulta que pide una dirección se rota con esa dirección y una clave con la suya.

Los miembros se fusionan tras una compuerta de amplitud que compara la dirección solicitada \(r\) con la dirección propia de cada miembro \(i\), nivel a nivel: \(u_i = U \prod_l k_l(r_l, i_l)\) y \(w_i = \sinh u_i / (1 + \sum_j (\cosh u_j - 1))\). Un miembro cuya dirección no coincide recibe \(u_i = 0\), y \(\sinh 0 = 0\), es decir, se abstiene sin que se elija a otro por encima; un miembro coincidente recibe \(w_i \approx \tanh U\). No hay datos publicados sobre volumen total de tokens, composición del dataset, ni uso de RLHF o DPO; el entrenamiento es desde cero sobre tareas sinteticas con dos semillas por configuración.

## Capacidades

- Realización de búsquedas por dirección estructural: consultas de compartimento, de ranura absoluta y relativas dentro de la misma secuencia sintetica.
- Direccionamiento a cuatro veces la longitud entrenada en formas de rotary fijas (resultados de 0,97 a 1,000), frente a aproximadamente 0,28 de las formas dinámicas.
- Fusion de miembros entrenados por separado sobre un núcleo congelado sin pérdida medible ni fuga entre ellos, cuando la solicitud es estructural.
- Mezcla de preguntas relativas y de posición fija en una misma secuencia, ambas respondidas con 1,000.
- Capacidad de banda: hasta 16 compartimentos y 14 miembros por banda, exacta hasta su número de anclas ortogonales.
- Direccionamiento multi-nivel: 64 compartimentos exactos en 18 dimensiones con una compuerta sobre el producto de dos kernels de 9 anclas; 512 direcciones exactas en 27 dimensiones con tres niveles.
- Escritura de un índice en la secuencia por parte del núcleo: exacto en 65.536 entradas (0 errores), con compuerta exacta.
- No soporta: generación de texto en lenguaje natural, tool calling, function calling, agentes, visión, audio, modo thinking ni capacidades multilingües. Ninguna de estas aparece en la información disponible.

## Casos de uso

- Reproducción de experimentos sobre RoPE: el repositorio incluye los pesos y las tablas de las fases A a F4 y S1 a S3L, de modo que un investigador puede recargar cada state dict y volver a medir el kernel de dirección y la capacidad de banda sin reentrenar.
- Estudio de mecanismos de fusión de expertos: los resultados de las fases C, C2a y C2b permiten analizar por qué los miembros sin compuerta se degradan (0,05-0,26) frente a los fusionados con solicitud estructural (dentro de 0,008 del miembro individual, KL ≤ 0,005).
- Análisis de fugas en atención: la fase S3 y sus seguimientos cuantifican la fuga de una cabeza de dirección aprendida sobre núcleo congelado (0,003 de escritura ajena) y el fallo de la solicitud leída directamente de la atención (0,010 al promediar los cuatro bloques), útil para diseñar mecanismos de enrutamiento.
- Evaluación de coste computacional de variantes de rotary: las mediciones de velocidad permiten comparar el rotary propio (3,7-5,3 % de un bloque a 4k tokens, 1,5 % a 64k) con el rotary anclado (1,24-1,27x a 4k) antes de adoptar una variante en un transformer mayor.
- Docencia y divulgación técnica: los notebooks y tablas sirven para explicar con números concretos la diferencia entre dirección relativa y dirección estructural, y el efecto de los lóbulos laterales del kernel.
- Diseño de esquemas de memoria asociativa: los resultados de capacidad (64 compartimentos en 18 dimensiones frente a 65 de una banda plana) informan el dimensionado de direcciones en sistemas de recall asociativo.
- Verificación de escepticismo experimental: al incluir fallos y controles junto a los aciertos, el repositorio sirve como caso de estudio de registro previo de criterios de aceptación y de uso de dos semillas por resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos disponibles son resultados internos de las pruebas del autor sobre tareas sintéticas:

| Prueba | Metrica | Resultado (dos semillas) |
|---|---|---|
| Catalogo rotatorio (fase A) | 24 formas, 144 ejecuciones | NTK-scaled RoPE da el mejor alcance al coste de RoPE; fallan los Cantor rotaries, SinusoidalRoPE con sus valores por defecto y un embedding quad-rotary aditivo |
| Prototipos de posicion fija (fase B) | 62 ejecuciones | Busquedas de compartimento 1,000; ranuras absolutas 0,97-1,000 a cuatro veces la longitud entrenada (formas dinamicas ~0,28) |
| Fusion de miembros (fases C, C2a, C2b) | 92 celdas | Fusionados dentro de 0,008 del miembro individual; fuga nula (KL maximo 0,005); sin compuerta, fusionados 0,05-0,26 |
| Secuencias mixtas (fase D) | 24 ejecuciones | Ambas clases de pregunta respondidas 1,000 |
| Capacidad de banda (fase E) | 16 compartimentos, 14 miembros | Exacto hasta su numero de anclas ortogonales; KL 0 / 0,6-0,8 / 1,6-2,6 con solape 0 / 0,56 / 0,85 |
| Seguimientos (fases F, F4) | 38 ejecuciones | La banda de anclas porta la identidad del compartimento cuando el contenido no puede (1,000 frente a 0,17); miembros a media pila funcionan (1,000 frente a 0,04-0,07) |
| Velocidad | Tres ejecuciones cronometradas | Rotary propio: 3,7-5,3 % de un bloque a 4k y 1,5 % a 64k; rotary anclado: 1,24-1,27x a 4k, practicamente igual una vez compilado |
| Screen S1 | 2 semillas | Una compuerta sobre el producto de dos kernels de 9 anclas direcciona 64 compartimentos exactos en 18 dimensiones (una banda plana necesita 65) |
| Screen S2 | 2 semillas | 512 direcciones exactas en 27 dimensiones; un normalizador que no cobra nada a los miembros en reposo elimina el techo de miembros |
| Screen S3 | 2 semillas | Indice escrito por el nucleo en la secuencia: exacto (0 errores de 65.536 entradas); solicitudes leidas de la atencion fallan |
| S3, seguimiento | 2 semillas | Un unico bloque de atencion da la solicitud correcta 0,41 de una coincidencia plena (0,73 en forma plana), conserva las respuestas (0,97) con fuga 0,003; promediar los cuatro bloques da 0,010 y silencia a todos los miembros |
| Screen S3L | 2 semillas, 2 formas de cabeza | Nucleo entrenado junto a su cabeza de direccion: solicitud exacta y sin fuga; cabeza lineal sobre nucleo congelado acierta el compartimento el 97 % (bloques 2-4); una cabeza por digito solo lee el digito grueso (0,96-0,98), no los dos finos (0,23-0,32) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por state dict individual; los modelos de prueba (4 capas, anchura 128, contexto 256) caben holgadamente en CPU y en cualquier GPU consumer.
- GPU recomendadas: ninguna en particular. No se requiere A100, H100 ni RTX 4090; una GPU integrada o una CPU moderna bastan para cargar y evaluar los pesos.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1-2 GB de memoria libre, y también en CPU.
- Almacenamiento: 1,7 GB en disco para los 475 state dicts; prever espacio adicional para los registros JSON y las tablas.
- Opciones de despliegue: carga manual de los state dicts con PyTorch (`torch.load`), ya que el repositorio no incluye `config.json`, tokenizer ni pipeline de HuggingFace. No es compatible con vLLM, llama.cpp, Ollama ni TGI en el estado actual.
- Latencia y throughput: no se publica throughput absoluto ni latencia por token. Las únicas cifras son relativas al coste del rotary dentro de un bloque (3,7-5,3 % a 4k tokens, 1,5 % a 64k; el anclado cuesta 1,24-1,27x a 4k y aproximadamente lo mismo una vez compilado).

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables de la misma categoria (repositorios de experimentos sobre direccionamiento estructural con RoPE). Los resultados del autor se comparan internamente contra variantes de rotary (NTK-scaled RoPE, Cantor rotaries, SinusoidalRoPE, quad-rotary aditivo), no contra modelos publicados de terceros.

| Criterio | geolip-rotary-experiments | Alternativas comparables |
|---|---|---|
| Parametros | 4 capas, anchura 128 (recuento no publicado) | no disponible |
| Contexto | 256 en entrenamiento; mediciones hasta 64k | no disponible |
| Rendimiento | resultados internos sobre tareas sinteticas (ver tabla anterior) | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | pesos y tablas en HuggingFace, sin codigo de entrenamiento | no disponible |

## Limitaciones y advertencias

- No es un modelo desplegable: faltan tokenizer, `config.json`, código de entrenamiento y pipeline. No puede usarse con `AutoModel.from_pretrained` ni con servidores de inferencia estándar sin trabajo previo de integración.
- Entrenado exclusivamente sobre tareas de secuencia sintéticas; no hay evidencia de competencia en lenguaje natural, código, matemáticas ni ningún otro dominio.
- Contexto de entrenamiento de solo 256 tokens; la extensión a 4k-64k aparece únicamente en mediciones de coste del rotary, no en evaluaciones de calidad.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluación de sesgo, y el entrenamiento sintético no permite extrapolar sesgos de datos reales.
- Riesgo de alucinación: no evaluado. El modelo no genera texto libre, por lo que la noción habitual de alucinación no aplica, pero tampoco hay métricas de fiabilidad fuera de las tareas sintéticas.
- Idiomas: no se declara ninguno. No hay capacidades multilingües documentadas.
- La model card está truncada en la información proporcionada (corta a mitad de la explicación de la cabeza plana en los seguimientos de S3); parte de la metodología y de las conclusiones podría faltar.
- Los resultados proceden de dos semillas por configuración y de criterios fijados por el propio autor, sin revisión por pares ni replicación independiente documentada.
- El repositorio incluye explícitamente fallos y controles; no todos los pesos corresponden a configuraciones que funcionen.
- Licencia MIT: permite uso comercial y modificación, pero al no haber modelo utilizable, la implicación práctica es limitada; se recomienda citar al autor.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/AbstractPhil/geolip-rotary-experiments
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repositorios de código o demos) en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo y se han descartado.
