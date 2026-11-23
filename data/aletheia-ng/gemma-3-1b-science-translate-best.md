# Aletheia-ng/gemma-3-1b-science-translate-best

## Resumen

`gemma-3-1b-science-translate-best` es un modelo de traducción automática de inglés a lenguas africanas, especializado en texto científico y académico. Lo desarrolla Aletheia-ng como ajuste fino de `BeardedMonster/gemma-3-1b-science-sft`, que a su vez deriva de la familia Gemma 3 de Google. El modelo parte de un traductor general (`gemma-3-1b-translate-best`), afinado sobre el corpus AfriScience-MT y posteriormente entrenado con aprendizaje por refuerzo (GRPO) sobre consignas de temática científica.

La relevancia del modelo está en su doble especialización: por un lado, cubre 125 etiquetas de idioma de un solo token (`<yor>`, `<hau>`, etc.) que permiten seleccionar la lengua de destino sin coste adicional de tokens; por otro, incorpora la traducción de artículos completos, no solo de frases sueltas. Según la model card, completa el 96 % de los artículos de prueba de AfriScience-MT, frente al 93 % del modelo general.

Con 999.885.952 parámetros (aproximadamente 1.000 millones) y un tamaño de repositorio de 4,0 GB en safetensors, es un modelo compacto pensado para despliegue en infraestructura modesta. La dirección de traducción es únicamente inglés a lenguas africanas; no soporta la dirección inversa ni otros pares de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante `gemma3_text`) |
| Parametros totales | 999.885.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; la model card recomienda `max_model_len` de 4096 en vLLM y menciona evaluaciones con hasta 7.168 tokens nuevos de salida |
| Tipos de cuantizacion | No especificados en la informacion disponible; los pesos se publican en safetensors (bfloat16 recomendado en los ejemplos) |
| Idiomas soportados | Ingles (origen) y 125 lenguas africanas de destino (yor, hau, ibo, pcm, efi, twi, ewe, fon, wol, swh, kin, som, orm, amh, tir, lug, lin, zul, xho, afr, sna, nya, sot, tsn, mlg, ibb, urh, bem, tum, run, ven, tso, nso, ssw, nbl, nde, sag, tiv, umb, kmb, mos, kik, luo, kam, bin, dag, oke, shi, dyu, bam, kbp, bbj, kon, kea, fat, knc, gaa, kab, nus, swc, lua, kqn, lun, iso, loz, wal, ach, tsc, vmw, kua, seh, nyn, her, yao, sid, ndc, men, kri, luy, ish, dua, bas, wes, tzm, ful, guw, lue, tll, zne, lub, crs, mfe, rnd, nyk, kwn, ndo, dje, ada, arz, sop, mgr, koo, cjk, cop, dop, bum, nba, nyu, dik, cce, chw, ttj, lam, nup, taq, alz, toi, ber, zgh, aar, bci, ary, aeb, teo, adh) |
| Licencia | `other`: uso comercial libre con atribucion obligatoria ("Translation models by Aletheia AI" y cita del paper); se aplican ademas los Terminos de Uso y la Politica de Uso Prohibido de Gemma 3 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 3 en su variante de texto (`gemma3_text`), con aproximadamente 1.000 millones de parametros. El pipeline de entrenamiento es en tres etapas: parte de `BeardedMonster/gemma-3-1b-science-sft`, se afina sobre el corpus AfriScience-MT para obtener el traductor general `gemma-3-1b-translate-best` y, finalmente, se entrena con aprendizaje por refuerzo mediante GRPO sobre consignas de tematica cientifica. El entrenamiento cientifico cubre seis lenguas (amh, hau, lug, nso, yor y zul); para el resto de idiomas el comportamiento es el del modelo general, con puntuaciones en benchmarks generales dentro de 0,25 chrF++ de este.

Una innovacion destacable es el uso de 125 etiquetas de idioma de un solo token (`<iso>`, por ejemplo `<yor>`), que forman parte del vocabulario ordinario y no se eliminan con `skip_special_tokens=True`. Esto permite que el modelo marque el idioma de salida con un unico token y que el usuario lo elimine con una expresion regular. La consigna de entrenamiento es muy estricta: un unico turno de usuario con el formato `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos) y decodificacion greedy. Para documentos completos se introduce todo el texto ingles en un unico turno y se dimensiona `max_new_tokens` a aproximadamente 1,2 veces la longitud del texto de entrada en tokens.

## Capacidades

- Traduccion de ingles a 125 lenguas africanas, con especializacion en texto cientifico y academico.
- Traduccion de frases y parrafos cortos con una sola consigna y decodificacion greedy.
- Traduccion de articulos completos en una sola pasada: segun la model card, completa el 96 % de los articulos de prueba de AfriScience-MT.
- Seleccion de idioma de destino mediante etiquetas de un solo token (`<yor>`, `<hau>`, etc.).
- Capacidad multilingue de salida amplia: mas de 120 lenguas africanas, aunque el ajuste especifico en ciencia solo cubre seis.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Traduccion de articulos cientificos completos: se introduce el texto ingles integro en un unico turno y se ajusta `max_new_tokens` a 1,2 veces la longitud de entrada; el modelo completa la mayoria de articulos de prueba, lo que lo hace adecuado para divulgacion cientifica en lenguas africanas.
- Localizacion de material academico y educativo: traduccion de resumenes, guias docentes y material de divulgacion a yoruba, hausa, luganda, sotho septentrional, zulú y amharico, las seis lenguas con entrenamiento cientifico especifico.
- Publicacion de documentacion tecnica multilingue: con vLLM se pueden lanzar lotes con una frase y cinco idiomas de destino simultaneamente, lo que permite generar versiones multilingues de notas de version o manuales.
- Atencion al ciudadano en lenguas minoritarias: traduccion de avisos y comunicados oficiales del ingles a lenguas africanas con un modelo de 1B desplegable en infraestructura modesta.
- Investigacion en traduccion automatica de bajos recursos: el modelo sirve como linea base reproducible para experimentos con AfriScience-MT, FLORES+, NTREX y MAFAND, con consignas y decodificacion documentadas.
- Traduccion por frases para textos largos: cuando el modo de documento completo no termina (el 4 % de los articulos de prueba no lo hace), la model card recomienda dividir el texto en frases y traducir una a una, lo que encaja en pipelines de preprocesado por segmentos.
- Generacion de subtitulos y material audiovisual: traduccion de guiones y transcripciones del ingles a lenguas africanas con decodificacion determinista, lo que facilita la revision y la correccion posterior.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Referencia (modelo general) |
|---|---|---|---|
| AfriScience-MT test (nivel de frase, media de 6 lenguas) | chrF | 53,11 | 50,76 |
| AfriScience-MT test (articulos completos) | chrF | 54,70 | 44,81 |
| AfriScience-MT test (articulos completos) | Porcentaje completados | 96 % | 93 % |
| FLORES+ devtest | chrF++ | 35,15 | 35,28 |
| NTREX | chrF++ | 40,09 | No disponible |
| MAFAND | chrF++ | 44,45 | No disponible |

En las pruebas de articulos completos, el 4 % de los articulos no termino (amh 0,93 y yor 0,89 en test); la model card recomienda comprobar la ausencia de `<end_of_turn>` y recurrir a la traduccion frase a frase como respaldo.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16, aproximadamente 2 GB para los 1.000 millones de parametros, mas el espacio de activaciones y cache KV; con cuantizacion de 8 bits o 4 bits el peso baja a aproximadamente 1 GB o 0,5 GB, aunque no se documentan ficheros GGUF en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bfloat16; para lotes grandes o documentos completos con hasta 7.168 tokens de salida conviene disponer de 16-24 GB (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o superiores, siempre que se ajuste el tamano de lote y la longitud maxima.
- Opciones de despliegue: transformers (>= 4.56, con `dtype=torch.bfloat16`), vLLM (`max_model_len=4096` en el ejemplo) y text-generation-inference (el modelo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`). No se documenta soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion greedy y el tamano de 1B sugieren latencias bajas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-1b-science-translate-best | 999.885.952 | No disponible explicitamente (ejemplos con 4.096) | Traduccion en→africano, ciencia y articulos completos | `other` con atribucion y terminos Gemma 3 | Hugging Face, transformers, vLLM, TGI |
| gemma-3-1b-translate-best | No disponible | No disponible | Traduccion general en→africano | No disponible | Hugging Face (modelo base del ajuste) |
| BeardedMonster/gemma-3-1b-science-sft | No disponible | No disponible | Ajuste cientifico base | No disponible | Hugging Face (modelo de partida) |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, especializacion y licencia.

## Limitaciones y advertencias

- Solo traduce de ingles a lenguas africanas; no soporta la direccion inversa ni otros pares de idiomas.
- El ajuste cientifico especifico cubre unicamente seis lenguas (amh, hau, lug, nso, yor, zul); para el resto el rendimiento es el del modelo general.
- El 4 % de los articulos completos de prueba no termino la traduccion (amh 0,93 y yor 0,89); es necesario detectar la ausencia de `<end_of_turn>` y tener un plan de respaldo por frases.
- La consigna es estricta: un unico turno de usuario, nombre del idioma en lugar del codigo ISO y dos espacios tras los dos puntos; desviarse del formato puede degradar la salida.
- Riesgo de alucinacion en terminologia cientifica especializada y en lenguas con pocos datos; no se documentan evaluaciones de fidelidad factual.
- No se documentan sesgos especificos, pero al derivar de Gemma 3 hereda los sesgos y limitaciones del modelo original.
- Licencia `other`: el uso comercial es libre con atribucion obligatoria a "Translation models by Aletheia AI" y cita del paper; ademas se aplican los Terminos de Uso y la Politica de Uso Prohibido de Gemma 3, que pueden restringir ciertos usos.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no debe asumirse que las tenga.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aletheia-ng/gemma-3-1b-science-translate-best
- Modelo general de partida: https://huggingface.co/Aletheia-ng/gemma-3-1b-translate-best
- Modelo base del ajuste: https://huggingface.co/BeardedMonster/gemma-3-1b-science-sft
- Referencia filosofica del nombre "Aletheia" (no relacionada con el modelo): https://philosciences.com/aletheia
