# grpdxr/Muse-Glimmer-30B-PL-Q4-GGUF

## Resumen

Muse-Glimmer-30B-PL-Q4-GGUF es una cuantización Q4_K_M en formato GGUF del modelo Muse-Glimmer-30B de meta-models, adaptada al polaco mediante un adaptador LoRA de rango 32 entrenado con DPO y fusionado en los pesos. La publica el usuario grpdxr bajo licencia Apache 2.0 y está pensada para ejecutarse en una única GPU de 24 GB con llama.cpp, cubriendo documentos polacos de hasta ~90K tokens dentro de una ventana de 128K. El modelo base cuenta con 27.854.794.240 parámetros (~27,85B) según los pesos en safetensors.

El problema que resuelve es concreto: procesar contratos, expedientes contables, historiales médicos y sentencias judiciales en polaco dentro de un solo slot de contexto largo, sin fragmentar el documento. El autor reporta que el tokenizador del modelo base es más eficiente para polaco que el de Qwen3.8 o Gemma 4, de modo que un documento de 90K tokens en este modelo ocuparía 110-125K en los competidores, dejándoles poco o ningún margen para responder.

La relevancia actual viene de su perfil de despliegue: 16,9 GB de pesos, ~17 GB de VRAM medidas a 128K de contexto con caché KV en q8_0 y ~40 tokens/s en una RTX 3090/4090, con licencia permisiva para uso comercial. No incluye el codificador de imágenes del modelo base: es exclusivamente texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.854.794.240 (~27,85B) segun safetensors del modelo base |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (128K, maximo entrenado) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo); el autor menciona una version de mayor numero de bits de 21,4 GB que no mejoro resultados |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 16,9 GB |
| Modelo base | meta-models/Muse-Glimmer-30B (relacion: finetune) |
| Metodo de adaptacion | LoRA rango 32 + DPO, fusionado con llama-export-lora y recuantizado con matriz de importancia ponderada por polaco (imatrix) |
| Modalidad | solo texto (sin codificador de imagenes) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Muse-Glimmer-30B (tipo de transformer, atencion, composicion del dataset preentrenamiento ni numero de tokens). Lo que si se documenta es el proceso de adaptacion sobre el checkpoint base: se parte de Muse-Glimmer-30B Q4_K_M, elegido por medicion tras comprobar que una version de 21,4 GB con mas bits no obtenia mejores resultados.

Sobre esa base se entrena un adaptador LoRA de rango 32 con DPO. El procedimiento fue: un cuantizado menor del mismo modelo respondio a 949 prompts en polaco; Mistral Large 4 corrigio unicamente el idioma de cada respuesta (no el contenido); se conservaron 353 pares con correcciones pequenas a nivel de palabra; y el modelo aprendio a preferir la version corregida. El adaptador se entreno sobre una copia en 4 bits de los pesos BF16, se fusiono con `llama-export-lora` y se recuantizo a Q4_K_M usando una matriz de importancia (imatrix) ponderada por polaco. Segun el autor, el adaptador no degrada razonamiento, transcripciones ni documentos, y reduce los errores de lengua de ~0,4 a ~0,25 por cada 100 palabras en cuatro rondas evaluadas a ciegas. El conocimiento y el razonamiento proceden integramente del modelo base.

## Capacidades

- Generacion de texto conversacional en polaco e ingles, con modo de razonamiento previo a la respuesta ("piensa antes de responder").
- Comprension de documentos largos: contratos con anexos que modifican y revocan clausulas, expedientes contables con correcciones encadenadas, historiales hospitalarios y sentencias judiciales, hasta ~90K tokens en un slot de 128K.
- Razonamiento de varios pasos: rejillas logicas 5x5, facturas con descuentos y correcciones, plazos legales encadenados, probabilidad condicional y analisis de registros de almacen con ~20K tokens.
- Respuesta a preguntas analiticas sobre documentos: valores vigentes en una fecha, sumas, plazos, dosis y deteccion de informacion ausente ("no esta en el documento").
- Analisis de transcripciones de llamadas comerciales (evaluado con 72 preguntas sobre 8 llamadas sinteticas).
- Calidad de lengua polaca pulida mediante DPO (0,25 errores por 100 palabras segun el juez ciego empleado).
- Soporte de plantillas de chat via `--jinja` en llama.cpp (formato conversacional).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no documentadas explicitamente; el modo de razonamiento y el contexto largo son la base tecnica, pero no hay evaluacion de agentes.
- Vision y audio: no soportados (el codificador de imagenes del modelo base no se incluye).

## Casos de uso

- Revision de contratos en polaco: cargar un contrato con anexos que modifican y revocan clausulas en un unico slot de 128K y preguntar que terminos estan vigentes en una fecha concreta, que sumas se adeudan o que plazos aplican. El modelo fue evaluado especificamente en este escenario (documentos de 20K, 50K y 90K tokens) y su tokenizador deja mas margen de respuesta que el de modelos competidores.
- Auditoria de expedientes contables: detectar correcciones sobre correcciones y calcular saldos finales. Es el caso mas exigente segun el autor (69% de acierto con presupuesto de respuesta de 32K y 79% con 48K), por lo que conviene asignar un presupuesto de respuesta amplio y, si el archivo supera los 50K tokens, reservar contexto suficiente.
- Analisis de documentacion clinica: extraer dosis, diagnosticos y evoluciones de historiales hospitalarios de decenas de miles de tokens, con la ventaja de que el modelo senala explicitamente cuando un dato no figura en el documento.
- Asistencia juridica interna: resumir y consultar sentencias judiciales largas y encadenar plazos procesales, aprovechando el razonamiento multi-paso evaluado en el test de plazos legales encadenados.
- Analisis de calidad de llamadas comerciales: procesar transcripciones de ventas en polaco y responder preguntas sobre lo tratado, con un rendimiento medido de 71 aciertos sobre 72 preguntas.
- Atencion al cliente en polaco: desplegar un asistente conversacional multi-turno con llama-server y una ventana de 64K por slot (`-np 2 -c 131072`) para atender dos conversaciones simultaneas en una sola GPU de 24 GB, con ~40 tokens/s por slot en el caso de un unico slot.
- Generacion y correccion de texto administrativo en polaco: redactar borradores con baja tasa de errores de lengua (0,25 por 100 palabras), util para comunicaciones internas o documentacion publica donde la correccion linguistica es critica.
- Procesamiento local con requisitos de privacidad: al ejecutarse integramente en una RTX 3090/4090 con llama.cpp, es apto para entornos donde los documentos no pueden salir a la nube (sanidad, legal, contabilidad).

## Benchmarks y rendimiento

Los datos proceden de pruebas propias del autor, no de benchmarks estandar. Todas las cifras se obtuvieron con llama.cpp, una RTX 3090, un slot de 128K, cache KV q8_0 y muestreo con temperatura 1.0, top-p 0.95 y top-k 64. La columna "cut" indica respuestas que agotaron su presupuesto de tokens y se contaron como incorrectas, por lo que son cotas inferiores.

| Modelo | Tamano | VRAM a 1x128K | Documentos largos | Razonamiento dificil (de 20) | Polaco (0-100) | Errores / 100 palabras | Transcripciones (de 72) | Velocidad |
|---|---|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-PL-Q4 (este) | 16,9 GB | 16.985 MiB | 92% (12/288 cut) | 17,3 (3/40 cut) | 94,75 | 0,25 | 71 | 40 tok/s |
| Muse-Glimmer-30B Q4_K_M (base) | 16,8 GB | 16.815 MiB | 94% | 16,0 (1/40 cut) | 93 | 0,4 | 68 | 41 tok/s |
| Gemma-4-26B-A4B UD-Q5_K_XL | 21,2 GB | 22.778 MiB | 64% (24/288 cut) | 15,2 (3/40 cut) | 95 | 0,2 | 71 | 68-70 tok/s |
| Qwen3.8-27B UD-Q5_K_XL | 20,9 GB | 24.124 MiB | 83% (24/288 cut) | 17,2 | 91,5 | 0,7 | 71 | 30 tok/s |
| Gemma-4-31B UD-Q4_K_XL | 18,8 GB | no cabe a 128K (falta 0,64 GB) | no medible a 128K | 16,2 | 94 | 0,2 | 69 | 31 tok/s |
| Bielik-11B-v3.0-Instruct Q8_0 | 11,9 GB | 15.100 MiB (1x32K, su ventana) | 18% de los documentos de 20K; los mas largos no caben | 4,5 (3/80 cut; test mas facil) | 87 | 0,3 | 66 | no disponible |

Presupuestos de respuesta aplicados: 32.768 tokens por problema de razonamiento; por documento 32.768 o lo que el slot de 128K deje tras el documento si es menor (Gemma-4-26B y Qwen3.8 dispusieron de 14-16K en los dos archivos contables de 90K); 16.000 por llamada de transcripcion; 8.192 por respuesta de chat. El autor advierte que las muestras son pequenas (2-4 rondas por test) y que diferencias de uno o dos puntos son ruido.

## Requisitos de hardware

- VRAM medida: 16.985 MiB en pico trabajando con un slot de 128K y cache KV en q8_0 sobre una RTX 3090.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) como objetivo de diseno; en una tarjeta de 24 GB quedan ~7 GB libres, suficientes para un segundo slot a 64K (`-np 2 -c 131072`).
- Cabe en GPU de consumo de 24 GB; con menos VRAM habria que reducir contexto, usar cache KV mas agresiva o tirar de offload parcial a CPU, extremo no documentado por el autor.
- Despliegue: llama.cpp con `llama-server`, con los flags `-ngl all -fa on -c 131072 -ctk q8_0 -ctv q8_0 --jinja --temp 1.0 --top-p 0.95 --top-k 64`. No se documentan otras opciones (vLLM, TGI, Ollama) para este GGUF concreto.
- Rendimiento: ~40 tokens/s en el caso evaluado (un slot, 128K de contexto, RTX 3090). Latencia no reportada.
- Presupuesto de respuesta: el autor recomienda ser generoso en documentos largos; en contabilidad, pasar de 32K a 48K de presupuesto subio el acierto del 69% al 79%.

## Comparativa con modelos similares

| Criterio | Muse-Glimmer-30B-PL-Q4 | Qwen3.8-27B UD-Q5_K_XL | Gemma-4-26B-A4B UD-Q5_K_XL | Bielik-11B-v3.0-Instruct Q8_0 |
|---|---|---|---|---|
| Parametros | ~27,85B | no disponible en la informacion | no disponible en la informacion (A4B sugiere MoE) | ~11B (por el nombre) |
| Contexto | 128K | no disponible | no disponible | 32K |
| Tamano en disco | 16,9 GB | 20,9 GB | 21,2 GB | 11,9 GB |
| VRAM a 1x128K | 16.985 MiB | 24.124 MiB | 22.778 MiB | no aplica (ventana de 32K) |
| Documentos largos | 92% | 83% | 64% | 18% de los de 20K; el resto no cabe |
| Razonamiento dificil | 17,3/20 | 17,2/20 | 15,2/20 | 4,5 (test mas facil) |
| Polaco | 94,75 | 91,5 | 95 | 87 |
| Errores / 100 palabras | 0,25 | 0,7 | 0,2 | 0,3 |
| Velocidad | 40 tok/s | 30 tok/s | 68-70 tok/s | no disponible |
| Licencia | Apache 2.0 | no disponible | no disponible | no disponible |

Lectura de la comparativa: frente a Qwen3.8-27B, este modelo gana en documentos largos (92% frente a 83%), iguala en razonamiento (17,3 frente a 17,2) y mejora en polaco y en tasa de errores linguisticos, con menor huella de VRAM (17,0 frente a 24,1 GB). Frente a Gemma-4-26B-A4B, pierde en velocidad (40 frente a 68-70 tok/s) y en errores por 100 palabras (0,25 frente a 0,2), pero gana de forma amplia en documentos largos (92% frente a 64%) y cabe con holgura donde el otro roza el limite. Frente a Bielik-11B-v3.0-Instruct, la diferencia es de categoria: contexto cuatro veces mayor, razonamiento muy superior y documentos largos que Bielik directamente no puede procesar. Gemma-4-31B UD-Q4_K_XL no es comparable a 128K porque no cabe en la tarjeta.

## Limitaciones y advertencias

- La contabilidad es el punto debil: 69% de acierto con presupuesto de respuesta de 32K y 79% con 48K. Un archivo contable de 90K tokens deja solo ~40K de margen en un slot de 128K y aun asi puede agotar el presupuesto.
- Muestras pequenas: 2-4 rondas por test; el propio autor advierte que diferencias de uno o dos puntos son ruido estadistico.
- Las cifras de rendimiento son pruebas propias del autor, no benchmarks estandar (MMLU, HumanEval, GSM8K no se reportan). No deben compararse directamente con puntuaciones publicadas de otros modelos en suites estandar.
- Solo texto: el codificador de imagenes del modelo base no esta incluido, por lo que no admite entrada multimodal.
- Cobertura linguistica limitada a polaco e ingles; el resto de idiomas no esta evaluado ni declarado.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modelo dispone de la respuesta "no esta en el documento" en las pruebas, pero no hay tasa de falsos positivos publicada.
- Sesgos: no documentados en la informacion proporcionada. Al ser un ajuste DPO sobre respuestas propias corregidas por Mistral Large 4, el adaptador hereda el estilo y los sesgos de ese proceso de correccion, limitado a cambios a nivel de palabra.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base meta-models/Muse-Glimmer-30B, no detalladas en la informacion disponible.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y sin validacion independiente por parte de la comunidad.
- La cuantizacion Q4_K_M con imatrix ponderada por polaco puede degradar ligeramente el rendimiento en ingles respecto al modelo base en BF16; no se aportan mediciones de esa comparacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grpdxr/Muse-Glimmer-30B-PL-Q4-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- llama.cpp (runtime recomendado, flags documentados en la model card): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
