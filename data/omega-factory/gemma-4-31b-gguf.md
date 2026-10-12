# Omega-Factory/gemma-4-31b-GGUF

## Resumen

El repositorio Omega-Factory/gemma-4-31b-GGUF es una publicacion de pesos cuantizados en formato GGUF derivados de google/gemma-4-31b, distribuida por el usuario u organizacion Omega-Factory. No se trata de un modelo nuevo: la propia model card lo describe como un "derivado comprimido" en el que se podaron expertos y el resultado se recuantizo. El repositorio ocupa 63,2 GB y contiene tres niveles de cuantizacion certificados: Q8_0 (32,64 GB), Q4_K_M (18,69 GB) y Q2_K (11,92 GB).

El interes practico del repositorio reside en su tabla comparativa de perdida de precision frente a la linea base FP16, con evaluaciones sobre GSM8K, MATH-500 y ARC-MC y analisis item a item mediante McNemar. Los resultados muestran que Q4_K_M y Q8_0 conservan la capacidad de razonamiento con desviaciones de entre -1,5 y +1,5 puntos porcentuales en GSM8K, mientras que Q2_K sufre un colapso severo (2,0 % en GSM8K frente al 86,0 % de la base). El dato de parametros declarado en safetensors es de 30.697.345.596 (~30,7 mil millones), aunque la model card indica 32,7 mil millones.

La model card declara 60 capas, una longitud de contexto de 262.144 tokens y atencion estandar con sliding window attention (SWA). El repositorio no tiene descargas ni interacciones registradas en el momento de la consulta y su licencia es la Gemma Terms of Use, heredada del modelo base, con uso restringido a investigacion y uso gratuito y sin reclamaciones de servicio comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion estandar y sliding window attention (SWA), 60 capas (la model card lo describe como denso; los tags del repositorio indican mixture-of-experts, dato contradictorio) |
| Parametros totales | 30.697.345.596 (~30,7 B) segun safetensors; la model card declara 32,7 B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (heredada de google/gemma-4-31b); uso de investigacion y gratuito, sin claims de servicio comercial |
| Formato de pesos | GGUF (llama.cpp) |

Datos adicionales: tamano del repositorio 63,2 GB; modelo base google/gemma-4-31b; pipeline text-generation; etiqueta endpoints_compatible; creado y actualizado el 11 de octubre de 2026; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

El artefacto no documenta un proceso de entrenamiento propio. Se trata de una recuantizacion de google/gemma-4-31b, con poda de expertos segun la propia model card ("experts were pruned and the result re-quantised"). La descripcion tecnica disponible indica 32,7 mil millones de parametros, 60 capas, atencion estandar con sliding window attention y una ventana de contexto de 262.144 tokens. No se especifican dimension de hidden state, numero de cabezas de atencion, tamano de la ventana deslizante ni vocabulario.

Existe una inconsistencia documental relevante: el tag mixture-of-experts y la mencion a la poda de expertos sugieren una arquitectura con componentes MoE, mientras que el titulo y el cuerpo de la model card describen explicitamente una "dense architecture". Tampoco se aportan datos sobre tokens de entrenamiento, composicion del dataset, fases de RLHF o DPO, ni sobre innovaciones tecnicas mas alla de la propia cuantizacion. La model card menciona certificacion por hash SHA256 de cada nivel de cuantizacion y la publicacion de "recibos" criptograficos en el sitio del autor.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat basada en los tokens `<start_of_turn>user`, `<start_of_turn>model`, `<end_of_turn>` y BOS.
- Razonamiento matematico y aritmetico de varios pasos: la linea base FP16 obtiene 86,0 % en GSM8K y 36,5 % en MATH-500 (200 items cada uno).
- Modo "thinking" diferenciado del modo "instruct", con parametros de muestreo recomendados distintos para cada uno (thinking: temperature 1.0, top_p 0.95, top_k 20, repetition_penalty 1.0; instruct: temperature 0.7, top_p 0.8, top_k 20, presence_penalty 1.5).
- Razonamiento de sentido comun y conocimiento general: 85,0 % en ARC-MC para la base FP16.
- Soporte de contexto largo: hasta 262.144 tokens declarados, lo que habilita tareas de resumen y analisis de documentos extensos.
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible) y despliegue en llama.cpp y derivados por el formato GGUF.
- Soporte de tool calling, agentes o capacidades multimodales: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Razonamiento aritmetico y resolucion de problemas de matematicas en entornos de investigacion: la variante Q4_K_M mantiene un 87,5 % en GSM8K, ligeramente por encima de la base FP16 (86,0 %), lo que la hace adecuada para experimentos de evaluacion donde el presupuesto de memoria es limitado.
- Despliegue en estaciones de trabajo con GPU de 24 GB: Q4_K_M ocupa 18,69 GB en disco y la banda de referencia indicada es de 20-24 GB, por lo que puede ejecutarse en una unica RTX 4090 o similar siempre que se valide el consumo real de VRAM y el KV cache con perfilado.
- Prototipado rapido de asistentes conversacionales con contexto largo: la ventana de 262.144 tokens permite cargar documentacion extensa o historiales de conversacion muy largos en una sola pasada, usando Q4_K_M para mantener un equilibrio razonable entre calidad y memoria.
- Evaluacion de tecnicas de cuantizacion: el repositorio publica una escalera de tres niveles con hashes SHA256 y analisis item a item, lo que lo convierte en material de referencia para estudiar la degradacion por cuantizacion en modelos de ~30 B.
- Experimentos academicos sin fines comerciales: la licencia Gemma Terms of Use y la declaracion explicita de "research / free use only" lo restringen a entornos de investigacion, docencia o uso personal.
- Analisis de conocimiento y sentido comun en pipelines offline: la variante Q8_0 mantiene 95,0 % en ARC-MC con 32,64 GB de artefacto, util para tareas de clasificacion multiple choice ejecutadas por lotes sin restriccion estricta de memoria.
- No se recomienda su uso en produccion con Q2_K: el modelo cae a 2,0 % en GSM8K y 6,0 % en MATH-500, lo que lo inutiliza para cualquier tarea que requiera razonamiento.

## Benchmarks y rendimiento

Los datos disponibles comparan cada nivel de cuantizacion con la linea base FP16 del modelo base, sobre 200 items por prueba en condiciones deterministicas declaradas por el autor.

| Variante | Tamano (disco) | GSM8K | MATH-500 | ARC-MC | Babble rate | Estado |
|---|---|---|---|---|---|---|
| FP16 base | 61,4 GB | 86,0 % (172/200) | 36,5 % (73/200) | 85,0 % (170/200) | 0,0333 | Referencia |
| Q8_0 | 32,64 GB | 84,5 % (-1,5 pp) | 37,0 % (+0,5 pp) | 95,0 % (+10,0 pp) | 0,0000 | Certificado |
| Q4_K_M | 18,69 GB | 87,5 % (+1,5 pp) | 35,5 % (-1,0 pp) | 94,5 % (+9,5 pp) | 0,0000 | Certificado |
| Q2_K | 11,92 GB | 2,0 % (-84,0 pp) | 6,0 % (-30,5 pp) | 91,0 % (+6,0 pp) | 0,0000 | Certificado |

Analisis de disconformidad por item (McNemar) frente a FP16:

| Variante | Prueba | Correctas cuantizado | Correctas FP16 | Aciertos perdidos | Aciertos ganados | Delta neto |
|---|---|---|---|---|---|---|
| Q8_0 | ARC-MC | 190/200 | 170/200 | 0 | 20 | +10,0 pp |
| Q8_0 | GSM8K | 169/200 | 172/200 | 4 | 1 | -1,5 pp |
| Q8_0 | MATH-500 | 74/200 | 73/200 | 0 | 1 | +0,5 pp |
| Q4_K_M | ARC-MC | 189/200 | 170/200 | 0 | 19 | +9,5 pp |
| Q4_K_M | GSM8K | 175/200 | 172/200 | 8 | 11 | +1,5 pp |
| Q4_K_M | MATH-500 | 71/200 | 73/200 | 12 | 10 | -1,0 pp |
| Q2_K | ARC-MC | 182/200 | 170/200 | 9 | 21 | +6,0 pp |
| Q2_K | GSM8K | 4/200 | 172/200 | 168 | 0 | -84,0 pp |
| Q2_K | MATH-500 | 12/200 | 73/200 | 65 | 4 | -30,5 pp |

Cada nivel fue certificado con una sola semilla, segun la propia tabla de certificacion del autor. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible, y no hay datos independientes que confirmen estas cifras. Las mejoras sistematicas en ARC-MC sobre la linea base FP16 en los tres niveles de cuantizacion resultan contraintuitivas y no estan explicadas en la model card.

## Requisitos de hardware

- Bandas de capacidad de referencia publicadas por el autor (no son mediciones de VRAM, sino recomendaciones de dimensionamiento): hasta 8 GB de artefacto -> 6-8 GB; mas de 8 hasta 16 GB -> 12-16 GB; mas de 16 hasta 24 GB -> 20-24 GB; mas de 24 hasta 48 GB -> 32-48 GB; mas de 48 GB -> multi-GPU o descarga a CPU.
- Q8_0 (32,64 GB): banda de referencia 32-48 GB. Candidato para A100 40/80 GB, H100 80 GB, o configuraciones multi-GPU en consumer (por ejemplo 2x RTX 4090 con 24 GB cada una).
- Q4_K_M (18,69 GB): banda de referencia 20-24 GB. Cabe en una RTX 4090, RTX 3090, L40S o A5000 de 24 GB, siempre que el KV cache y el contexto elegido no desborden la memoria.
- Q2_K (11,92 GB): banda de referencia 12-16 GB. Cabe en RTX 4080, RTX 4070 Ti Super, A4000 o similares, pero con el aviso de degradacion severa de calidad descrito en la seccion de benchmarks.
- El KV cache escala con la longitud de contexto y el tamano de lote; con 262.144 tokens de ventana declarada, las necesidades de memoria pueden superar ampliamente el tamano del artefacto.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, llama-cpp-python, servidores compatibles con la etiqueta endpoints_compatible). No se mencionan vLLM ni TGI, que no consumen GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos alternativos de la misma categoria en el material proporcionado. La unica comparacion posible es contra el propio modelo base sin cuantizar y contra los otros niveles de la escalera de cuantizacion del mismo repositorio:

| Modelo / variante | Parametros | Contexto | GSM8K | MATH-500 | ARC-MC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gemma-4-31b (FP16) | 32,7 B declarados | 262.144 | 86,0 % | 36,5 % | 85,0 % | Gemma Terms of Use | HuggingFace (google/gemma-4-31b) |
| gemma-4-31b-GGUF Q8_0 | ~30,7 B safetensors | 262.144 | 84,5 % | 37,0 % | 95,0 % | Gemma Terms of Use | HuggingFace (este repositorio) |
| gemma-4-31b-GGUF Q4_K_M | ~30,7 B safetensors | 262.144 | 87,5 % | 35,5 % | 94,5 % | Gemma Terms of Use | HuggingFace (este repositorio) |
| gemma-4-31b-GGUF Q2_K | ~30,7 B safetensors | 262.144 | 2,0 % | 6,0 % | 91,0 % | Gemma Terms of Use | HuggingFace (este repositorio) |

Comparativas con otros modelos de ~30 B (Qwen, Llama, Mistral, etc.): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion catastrofica en Q2_K: 2,0 % en GSM8K y 6,0 % en MATH-500 frente a 86,0 % y 36,5 % de la base. No debe usarse para tareas de razonamiento aunque quepa en GPU de gama media.
- Inconsistencia arquitectonica no resuelta: los tags indican mixture-of-experts y la model card menciona poda de expertos, pero el modelo se describe como denso. Esta ambiguedad afecta a la estimacion de VRAM, al numero de parametros activos y a la eleccion del runtime.
- Discrepancia en el recuento de parametros: 30,7 B segun safetensors frente a 32,7 B segun la model card.
- Los benchmarks se realizaron con una unica semilla y 200 items por prueba, sin intervalos de confianza ni validacion externa. El propio autor advierte que "SCREEN" (resultado sin conjunto completo de semillas) no constituye certificacion, y los tres niveles se certificaron con una sola semilla.
- Las subidas de ARC-MC de hasta +10 puntos porcentuales sobre la linea base FP16 en las tres variantes cuantizadas no estan explicadas y contradicen el comportamiento esperado de la cuantizacion, lo que exige cautela al interpretar la tabla.
- Riesgo de alucinacion: no cuantificado en la informacion disponible mas alla de la tasa de "babble" reportada (0,0333 en FP16, 0,0000 en todas las variantes cuantizadas), metrica no definida en la model card.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, seguridad o toxicidad.
- Idiomas soportados: no disponible. No hay ninguna indicacion sobre cobertura multilingue ni sobre el rendimiento en castellano.
- Restricciones de licencia: Gemma Terms of Use, heredada de google/gemma-4-31b. La model card declara explicitamente "research / free use only" y afirma que el repositorio no realiza ninguna reclamacion de servicio comercial. El usuario final es responsable de cumplir los terminos del modelo base.
- La model card esta truncada en el fragmento proporcionado ("We publish correcti..."), por lo que podria haber condiciones adicionales no visibles.
- Repositorio sin descargas ni likes registrados y sin fecha de validacion independiente; se trata de una publicacion de comunidad, no de un artefacto oficial de Google.
- El tamano de artefacto en disco no equivale a VRAM requerida; es imprescindible perfilado de memoria en pico antes de cualquier despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Omega-Factory/gemma-4-31b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31b
- Pagina del modelo en Omega Factory: https://omega-factory.ai/models/gemma-4-31b-gguf-v1
- Organizacion en HuggingFace: https://huggingface.co/Omega-Factory
- Resultados de la busqueda web: las consultas no devolvieron informacion relevante sobre el modelo. Los resultados obtenidos corresponden al fabricante de relojes Omega y a la entrada de Wikipedia sobre la letra griega omega, sin relacion con este repositorio. No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos adicionales.
