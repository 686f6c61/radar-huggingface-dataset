# kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2 es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) publicado por Datasein Oy, empresa finlandesa de ingenieria de IA, bajo la cuenta corporativa `@kataguru` en Hugging Face. El modelo parte del nucleo congelado Kataguru-Sceptic-35B-A3B-v3.1 (254 expertos universales orientados a STEM, codigo, matematicas y razonamiento) y le anade 20 expertos especializados en 10 lenguas morfologicamente complejas (fines, estonio, hungaro, lituano, leton, islandes, euskera, georgiano, gales y turco), dando un total de 274 expertos en un unico router. El objetivo declarado es la traduccion directa entre 110 pares de lenguas sin pivote ingles, preservando matices morfologicos, registro y estructura paragrafica, manteniendo el coste computacional activo fijo en torno a 3B parametros por token gracias al enrutamiento Top-8.

La relevancia del modelo reside en su enfoque de especializacion linguistica dentro de una arquitectura MoE dispersa: en lugar de escalar un modelo denso para cubrir lenguas de bajos recursos y alta complejidad flexiva, el autor anade pares de expertos dedicados por lengua dentro del mismo router, lo que permite conmutar entre dominios sin multiplicar el coste de inferencia. El modelo se distribuye exclusivamente en formato GGUF (variantes APEX-Small, APEX-Medium y APEX-Good, mas un proyector multimodal `mmproj-f16.gguf`) calibrado con imatrix sobre los 274 expertos y las 11 lenguas, y esta pensado para su uso en llama.cpp, LM Studio y Ollama. La licencia es Apache 2.0 y la pipeline declarada es image-text-to-text, lo que indica soporte de vision ademas de texto.

Esta ficha cubre la variante GGUF publicada. Existen tambien releases hermanas del mismo autor en NVFP4 (~21,9 GiB) y W4A16-AWQ (~20,5 GiB), ambas disenadas para caber en una unica GPU de 24 GB, que se mencionan aqui solo como contexto de distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, familia declarada `qwen3_5_moe` |
| Parametros totales | 35B (segun nomenclatura del modelo; no se detalla desglose exacto) |
| Parametros activos | ~3B por token (enrutamiento Top-8 sobre 274 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en tres variantes APEX (APEX-Small, APEX-Medium, APEX-Good), calibradas con imatrix; proyector multimodal `mmproj-f16.gguf` en F16 |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr (11 lenguas; 110 pares de traduccion directa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / LM Studio / Ollama); existen releases hermanas NVFP4 y W4A16-AWQ |

## Arquitectura y entrenamiento

El modelo es un MoE disperso con 274 expertos enrutados mediante Top-8 por token. Los expertos `#0..#253` (254 en total) corresponden al nucleo congelado del modelo base Kataguru-Sceptic-35B-A3B-v3.1, bit-identico segun el autor, y cubren dominios universales de STEM, codigo, matematicas y razonamiento en ingles o de forma agnostica al idioma. Los expertos `#254..#273` (20 en total, organizados como 10 pares) son modulos especialistas por lengua anadidos en el post-entrenamiento, uno por cada una de las 10 lenguas objetivo, con especializacion declarada en fenomenos morfologicos concretos: casos gramaticales (15 en fines, 14 en estonio, 18 en hungaro, 7 en lituano y leton, 4 x 3 generos en islandes), alternancia de grados consonantica, armonia vocalica, ergatividad (euskera, georgiano), mutaciones consonantica iniciales (gales) y aglutinacion profunda (turco).

El entrenamiento del nucleo base reporta un "15-Benchmark Mean" de 70,26 % y un resultado de 70,20 % en GPQA Diamond, segun la model card. No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es la convivencia simultanea de todos los expertos linguisticos en un unico router, lo que habilita traduccion directa L1 <-> L2 entre los 110 pares sin pasar por ingles. El modelo incorpora ademas un modo de RAG multilingue nativo (`/rag` o paso de `documents=[...]` al chat template) con motor de citacion, y etiquetas de control como `/translate /<codigo>` y `/translate /selko` (fines simplificado). El soporte multimodal se materializa via el proyector `mmproj-f16.gguf`.

## Capacidades

- Generacion de texto y razonamiento en 11 lenguas, con nucleo STEM/codigo/matematicas congelado del modelo base.
- Traduccion directa L1 <-> L2 entre 110 pares de lenguas sin pivote ingles, mediante la etiqueta `/translate /<codigo>`.
- Traduccion a fines simplificado (Selkokieli) mediante `/translate /selko`.
- Vision: pipeline image-text-to-text, con proyector multimodal `mmproj-f16.gguf` incluido en el paquete GGUF.
- RAG multilingue nativo (`Mode 7: /rag`) con paso de documentos etiquetados por idioma y motor de citacion fundamentada.
- Tool calling / function calling: el modelo base reporta BFCL V4 83,67 %, lo que sugiere soporte de llamada a funciones.
- Razonamiento multi-paso y modo "sceptic" de razonamiento, heredado del nucleo base.
- Capacidad de codigo y matemticas: LiveCodeBench v6 39,43 % en el nucleo base.
- Capacidad de dominio tecnico especializado: PLC/CNC 96,67 % en el nucleo base.
- Soporte de despliegue en llama.cpp, LM Studio y Ollama gracias al formato GGUF.

## Casos de uso

- Traduccion profesional entre lenguas flexivas de bajos recursos: el modelo permite traduccion directa fines-estonio, hungaro-fines, lituano-leton o islandes-lituano sin pivote ingles, preservando casos gramaticales, armonia vocalica y gradacion consonantica que se pierden en traducciones via ingles. Adecuado para editoriales, agencias de localizacion y administraciones publicas de estos paises.
- Atencion al cliente multilingue en mercados nordicos y balticos: con 11 lenguas en un unico modelo y vision habilitada, puede gestionar conversaciones multi-turno con capturas de pantalla o documentos escaneados, manteniendo coherencia de registro en fines, estonio, leton y lituano.
- RAG multilingue sobre corpus heterogeneos: el modo `/rag` nativo con documentos etiquetados por idioma permite construir sistemas de recuperacion y respuesta citada sobre bases documentales que mezclan fines, hungaro, turco y georgiano, sin necesidad de traducir previamente los documentos a ingles.
- Procesamiento de documentacion tecnica y de ingenieria: el nucleo congelado mantiene rendimiento en PLC/CNC (96,67 %) y codigo (LiveCodeBench v6 39,43 %), por lo que puede asistir en lectura de esquemas, manuales tecnicos y generacion de codigo de automatizacion en entornos industriales finlandeses o balticos.
- Traduccion de documentacion oficial y legal: la especializacion por lengua con estandares normativos declarados (Kotus, EKI, MTA, VLKK, Arnastofnun, Euskaltzaindia, TDK) lo hace util para borradores de textos administrativos y normativos en estas jurisdicciones, siempre con revision humana.
- Accesibilidad linguistica en fines simplificado: la etiqueta `/translate /selko` permite generar versiones en Selkokieli para servicios publicos finlandeses dirigidos a personas con dificultades de lectura.
- Asistencia a la investigacion linguistica comparada: al residir todos los pares de expertos en el mismo router, permite experimentar con traduccion entre lenguas morfologicamente complejas (ergatividad euskera y georgiana, mutaciones galesas) y analizar como el enrutamiento Top-8 distribuye tokens entre expertos.
- Despliegue en estaciones de trabajo con GPU de consumo: las variantes GGUF APEX y las releases hermanas NVFP4 y W4A16-AWQ (~20-22 GiB) estan disenadas para caber en una unica GPU de 24 GB, lo que facilita prototipos locales y entornos con requisitos de soberania de datos.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden al nucleo base congelado Kataguru-Sceptic-35B-A3B-v3.1, no a la variante Polyglot 274E completa ni a sus cuantizaciones GGUF. Se reproducen a continuacion tal como aparecen en la model card.

| Benchmark | Resultado (nucleo base v3.1) | Notas |
|---|---|---|
| 15-Benchmark Mean | 70,26 % | Media de 15 benchmarks del nucleo congelado |
| GPQA Diamond | 70,20 % | Razonamiento cientifico de nivel experto |
| LiveCodeBench v6 | 39,43 % | Generacion de codigo |
| BFCL V4 | 83,67 % | Tool calling / function calling |
| PLC/CNC | 96,67 % | Dominio tecnico de automatizacion industrial |

No se han publicado resultados de benchmarks especificos para la variante Polyglot 274E v3.2 (traduccion en los 110 pares, vision, RAG multilingue) en la informacion disponible. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: las releases hermanas del mismo autor indican ~20,5 GiB para W4A16-AWQ y ~21,9 GiB para NVFP4, ambas declaradas como "Single 24 GB GPU Ready". Para las variantes GGUF APEX no se detalla el tamano exacto por variante en la informacion disponible; APEX-Small, APEX-Medium y APEX-Good corresponden presumiblemente a niveles crecientes de calidad y tamano.
- GPU recomendadas: una GPU de 24 GB (por ejemplo RTX 4090, RTX 3090, A10G, L4 o similares) es suficiente segun las releases hermanas. Para mayor throughput, A100 o H100 con las variantes AWQ/vLLM.
- Cabe en GPU de consumo: si, en GPUs de 24 GB con las cuantizaciones indicadas; en GPUs de 16 GB o menos no hay confirmacion en la informacion disponible.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama para GGUF; vLLM para la variante W4A16-AWQ; NVFP4 para GPUs Blackwell nativas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales declaradas.

| Modelo | Parametros | Activos por token | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2 | 35B (274 expertos) | ~3B (Top-8) | no disponible | Apache 2.0 | GGUF, NVFP4, AWQ |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35B (254 expertos) | ~3B | no disponible | Apache 2.0 | no disponible |
| Alternativas MoE de ~35B totales / ~3B activos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion disponible modelos directamente comparables en el nicho de traduccion directa entre lenguas flexivas de bajos recursos via expertos dedicados en un unico router.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al entrenar sobre corpus normativos de cada lengua, puede heredar sesgos de dichas fuentes.
- Riesgo de alucinacion: no cuantificado; el modo de razonamiento "sceptic" sugiere mitigacion declarada, pero no hay evidencia publicada.
- Cobertura limitada a 11 lenguas: fuera de en, fi, et, hu, lt, lv, is, eu, ka, cy y tr el rendimiento no esta garantizado ni documentado.
- Idiomas de muy bajos recursos: euskera, georgiano y gales tienen menos hablantes y corpus que fines o turco, por lo que la calidad relativa entre pares puede variar; no hay benchmarks por par.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara derechos de post-entrenamiento, modulos expertos y derechos de base de datos (TekijaL 49 § / 96/9/EC) sobre los expertos anadidos; conviene revisar los terminos corporativos de Datasein Oy antes de redistribuir los expertos especialistas.
- Distribucion exclusivamente GGUF en esta variante: requiere llama.cpp, LM Studio u Ollama; para vLLM hay que usar la release W4A16-AWQ hermana.
- Datos de contexto, tokens de entrenamiento y benchmarks de la variante Polyglot no publicados: dificulta la evaluacion rigurosa en produccion.
- Fecha de publicacion futura (2026-11-10) en los metadatos de Hugging Face: verificar la vigencia y el estado real del repositorio antes de desplegar.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia comunitaria de uso ni validacion independiente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-GGUF
- Release NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-NVFP4
- Release W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Polyglot-274E-v3.2-W4A16-AWQ
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Cuenta del autor: https://huggingface.co/kataguru
