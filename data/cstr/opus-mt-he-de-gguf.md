# cstr/opus-mt-he-de-GGUF

## Resumen

`cstr/opus-mt-he-de-GGUF` es una conversion al formato GGUF (ggml) del modelo de traduccion automatica `Helsinki-NLP/opus-mt-he-de`, desarrollado originalmente por el proyecto OPUS-MT de la Universidad de Helsinki (Jorg Tiedemann y Santhosh Thottingal). Resuelve una tarea muy concreta: traduccion de hebreo (he) a aleman (de) en una unica direccion, sin capacidades genericas de chat ni instrucciones.

Se trata de un MarianMT de tipo transformer encoder-decoder con 6 capas de encoder y 6 de decoder, dimension de modelo d=512 y 77.015.642 parametros totales (unos 77 M). Es, por tanto, un modelo pequeno orientado a latencia baja y despliegue en CPU o en hardware muy modesto, no a razonamiento complejo.

Su relevancia actual es de infraestructura: el autor (`cstr`) lo publica para integrarlo en CrispStrobe/CrispASR mediante el backend `marian`, donde se usa como traductor rapido en modo transcripcion en vivo (`--live-translate`), encadenado a un reconocedor de voz que soporte hebreo. Los pesos proceden de la release `opus-2020-01-26` del proyecto OPUS-MT y se distribuyen sin modificaciones en f16, mas una version cuantizada a q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder), 6 capas de encoder + 6 de decoder, d=512 |
| Parametros totales | 77.015.642 (aproximadamente 77 M) |
| Parametros activos | no aplica, no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y q8_0 |
| Idiomas soportados | hebreo (he) y aleman (de) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (ggml); el checkpoint original esta en formato PyTorch/safetensors para `transformers` |

Datos adicionales: tamano del repositorio 0,2 GB; ficheros `opus-mt-he-de-f16.gguf` (159 MB) y `opus-mt-he-de-q8_0.gguf` (87 MB); pipeline declarado `translation`; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer secuencial estandar con encoder y decoder de 6 capas cada uno y dimension oculta d=512. No incorpora mezcla de expertos, atencion lineal, decodificacion especulativa ni mecanismos hibridos: es un modelo denso, unidireccional y de un solo par de idiomas. El modelo base fue entrenado por el proyecto OPUS-MT sobre datos del corpus OPUS y publicado en la release `opus-2020-01-26`; la referencia academica del proyecto es el articulo *OPUS-MT — Building open translation services for the World* (EAMT 2020).

Esta ficha corresponde exclusivamente a una conversion de formato: los pesos no se han reentrenado ni ajustado. El autor los exporta a GGUF en f16 y genera despues una variante q8_0 con `crispasr-quantize`. No hay informacion disponible sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; en un modelo de traduccion de este tipo el ajuste se limita habitualmente al entrenamiento supervisado sobre pares de frases, pero ese detalle no se documenta en la informacion proporcionada.

## Capacidades

- Traduccion de texto hebreo a aleman, en una unica direccion (he a de).
- Decodificacion greedy (`-bs 1`) o con el tamano de beam propio del checkpoint.
- Integracion en modo traduccion en vivo por frases, encadenada a un sistema de reconocimiento de voz con soporte de hebreo (`--live-translate`), siempre con decodificacion greedy.
- Ejecucion en CPU y en GPU de gama muy baja gracias a su tamano (87-159 MB de pesos).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; no es un modelo de instrucciones ni de chat.
- No es multilingue mas alla del par he-de.
- No dispone de modo de pensamiento, vision, audio ni ninguna capacidad multimodal.
- Trata los literales `</s>`, `<unk>` y `<pad>` como texto normal, a diferencia del checkpoint de referencia, que los interpreta como tokens especiales.

## Casos de uso

- Traduccion en vivo de reuniones y sesiones en hebreo: el modelo se encadena a un reconocedor con soporte de hebreo mediante `--live-translate` y emite transcripcion y traduccion al aleman frase a frase. Es adecuado porque el coste por frase es minimo y el modo en vivo usa greedy, evitando latencias de beam search.
- Subtitulado automatico hebreo-aleman: se procesa la pista de audio, se reconoce el habla y se traduce cada segmento con `crispasr --backend marian`. El modelo es apropiado por su tamano reducido, que permite procesar horas de audio en CPU sin GPU.
- Traduccion por lotes de corpus hebreos para preprocesado de datasets: se puede traducir un corpus completo a aleman antes de reentrenar o evaluar modelos mayores, usando el fichero f16 si se prioriza la fidelidad frente al checkpoint de referencia.
- Despliegue en entornos con recursos limitados: con 87 MB en q8_0 y sin necesidad de acelerador, es viable en contenedores pequenos, maquinas virtuales economicas o dispositivos tipo Raspberry Pi, donde un modelo de traduccion de miles de millones de parametros no cabria.
- Traduccion de documentacion tecnica o correspondencia en hebreo dentro de flujos internos: el modelo permite convertir textos de entrada en aleman de forma automatizada mediante la CLI de CrispASR, integrable en scripts y tareas programadas.
- Mesa de ayuda y soporte con contenido en hebreo: se puede preprocesar un ticket hebreo a aleman para que un agente o un sistema de clasificacion posterior trabaje en un unico idioma, asumiendo revision humana por tratarse de un modelo pequeno.
- Traduccion de contenido web o formularios hebreos en herramientas de accesibilidad: dado su bajo consumo, puede ejecutarse en el propio dispositivo del usuario final sin enviar el texto a servicios externos, lo que simplifica el cumplimiento de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (BLEU, MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El unico dato cuantitativo proporcionado es una prueba de paridad frente a la implementacion de referencia `MarianMTModel.generate` de Hugging Face `transformers`, sobre 8 frases de prueba:

| Prueba | Fichero | Resultado |
|---|---|---|
| Frases identicas a la referencia, greedy | `opus-mt-he-de-f16.gguf` | 8/8 |
| Frases identicas a la referencia, beam 4 | `opus-mt-he-de-f16.gguf` | 8/8 |
| Frases identicas a la referencia, greedy | `opus-mt-he-de-q8_0.gguf` | 7/8 |
| Coincidencia de ids de token de entrada | ambos ficheros | 8/8 |

El autor indica que, en el caso no coincidente con q8_0, la diferencia es de redaccion. La muestra de 8 frases es demasiado pequena para extraer conclusiones sobre calidad de traduccion a escala.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en todos los casos. Los pesos ocupan 159 MB en f16 y 87 MB en q8_0; el consumo total depende del runtime.
- GPU recomendadas: no se especifica ninguna en la informacion disponible. Por tamano, el modelo cabe en cualquier GPU, incluidas las integradas y las de gama de entrada mas antigua.
- Cabe en GPU de consumo: si, en cualquier modelo con suficiente memoria libre, y tambien en CPU sin acelerador dedicado.
- Opciones de despliegue: el unico runtime documentado es CrispStrobe/CrispASR con `--backend marian`, que descarga automaticamente `opus-mt-he-de-q8_0.gguf` en el primer uso. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al tratarse de una arquitectura MarianMT y no de un transformer decoder-only, es previsible que esos motores no la soporten, pero no hay confirmacion en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El autor describe estos modelos como los traductores mas rapidos para transcripcion y traduccion en vivo dentro de CrispASR, sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion | Formato | Licencia | Runtime documentado |
|---|---|---|---|---|---|
| `cstr/opus-mt-he-de-GGUF` | 77.015.642 | he a de | GGUF (f16, q8_0) | cc-by-4.0 | CrispASR, backend `marian` |
| `Helsinki-NLP/opus-mt-he-de` (modelo base) | 77.015.642 (mismos pesos) | he a de | PyTorch / safetensors para `transformers` | cc-by-4.0 | Hugging Face `transformers` (`MarianMTModel`) |
| `cstr/opus-mt-de-he-GGUF` | no disponible | de a he | GGUF | cc-by-4.0 segun el proyecto OPUS-MT | CrispASR, backend `marian` |

No se dispone de datos de benchmarks comparativos entre estas variantes mas alla de la prueba de paridad descrita en la seccion anterior, limitada a 8 frases. No se han identificado en la informacion proporcionada otras alternativas comparables de traduccion hebreo-aleman de tamano similar.

## Limitaciones y advertencias

- Traduccion unidireccional: solo traduce de hebreo a aleman. Para la direccion contraria debe usarse `cstr/opus-mt-de-he-GGUF`.
- Cobertura linguistica restringida a un unico par de idiomas; no es un modelo multilingue ni un modelo de proposito general.
- Sin capacidades de instrucciones, tool calling, agentes ni razonamiento multi-paso: no debe seleccionarse para esos escenarios.
- Riesgo de alucinacion y de traducciones plausibles pero incorrectas, especialmente con nombres propios, terminologia especializada, siglas o texto degradado por errores de reconocimiento de voz. En un modelo de 77 M de parametros y entrenamiento de 2020, este riesgo es mayor que en modelos de traduccion de mayor tamano.
- La cuantizacion q8_0 introduce divergencias medibles: en la prueba del autor, 7 de 8 frases coinciden con la referencia en modo greedy. Para maxima fidelidad debe usarse el fichero f16.
- Diferencia de comportamiento con tokens especiales: los literales `</s>`, `<unk>` y `<pad>` se tratan como texto normal en esta implementacion, mientras que la referencia los interpreta como tokens especiales. Esto puede alterar el resultado si las entradas contienen esas cadenas.
- Longitud de contexto no documentada; se recomienda segmentar la entrada en frases, que es ademas el modo de operacion previsto en la traduccion en vivo.
- Datos de entrenamiento del proyecto OPUS-MT con fecha de referencia 2020: es previsible una cobertura limitada de vocabulario reciente, neologismos y variantes dialectales. No se han publicado analisis de sesgo en la informacion disponible.
- Licencia cc-by-4.0: permite uso comercial, pero exige atribucion al proyecto OPUS-MT y a sus autores (Universidad de Helsinki). La redistribucion de los pesos requiere mantener esa atribucion.
- Validacion comunitaria practicamente nula: 0 descargas y 0 likes en el momento de la consulta, y una unica prueba de paridad sobre 8 frases. No hay evaluacion independiente de calidad de traduccion.
- Fecha de publicacion del repositorio indicada como 6 de octubre de 2026, posterior a la fecha habitual de referencia; conviene verificar la vigencia del artefacto antes de integrarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/opus-mt-he-de-GGUF
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-he-de
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Repositorio de entrenamiento OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT-train
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia academica citada en la model card: Jorg Tiedemann y Santhosh Thottingal, *OPUS-MT — Building open translation services for the World*, EAMT 2020 (no se ha proporcionado URL en la informacion disponible)
- Direccion inversa (aleman a hebreo): `cstr/opus-mt-de-he-GGUF` (URL no proporcionada en la informacion disponible)
