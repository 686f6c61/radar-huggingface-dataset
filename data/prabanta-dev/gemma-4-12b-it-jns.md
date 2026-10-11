# prabanta-dev/gemma-4-12B-it-JNS

## Resumen

gemma-4-12B-it-JNS es una conversión de pesos, no un modelo entrenado desde cero. El autor (prabanta-dev) toma la cuantización Q4_K_M en GGUF de `unsloth/gemma-4-12b-it-GGUF`, derivada a su vez de `google/gemma-4-12B-it`, y la reescribe en JNS, el formato propietario del motor de inferencia Janas, escrito en C y orientado a equipos convencionales con o sin GPU. El repositorio incluye dos ficheros: el modelo principal (7,12 GB) y un asistente de borrador o *draft* para decodificación especulativa (0,47 GB).

El problema que resuelve es de despliegue: ofrece el modelo en un formato que Janas puede leer directamente en CPU, con cifras medidas en un portátil con Intel Core Ultra 9 185H, iGPU Arc y 32 GB de memoria, donde el motor lee el prompt a 71 tok/s y genera a 10 tok/s (14 tok/s con el asistente de borrador). Frente a llama.cpp en la misma máquina y con la misma configuración, Janas reporta 65 tok/s de lectura y 9,9 tok/s de escritura, frente a 46 y 7,1 tok/s del primero.

Es relevante ahora únicamente dentro de su nicho: es un artefacto de formato para un motor concreto, con cero descargas y cero *likes* en el momento de la consulta, sin resultados de calidad publicados (MMLU, HumanEval u otros) y sin datos declarados de contexto o idiomas. No sustituye a la cuantización GGUF original para quien use llama.cpp, Ollama o vLLM, porque los ficheros JNS solo los lee Janas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (el autor lo describe como «dense, with its assistant»); sin más detalle en la información disponible |
| Parametros totales | 12 000 millones aproximadamente, según la denominación del modelo base; no confirmado de forma explícita en la información disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (heredada del GGUF de unsloth del que se convierte); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el repositorio no declara lista de idiomas) |
| Licencia | Apache 2.0 (declarada en la model card; el repositorio original no incluye fichero LICENSE) |
| Formato de pesos | JNS (formato propio del motor Janas, legible solo por Janas); convertido desde GGUF mediante `gguf2jns` |

## Arquitectura y entrenamiento

No hay información sobre entrenamiento propio: el autor indica explícitamente que «nothing was retrained or pruned», es decir, no hubo reentrenamiento ni poda. Cada fichero es un GGUF cuantizado por terceros (unsloth) reescrito en el orden de lectura que espera Janas, conservando los metadatos. La relación declarada con el modelo base es `quantized`. El resultado son dos artefactos: `gemma-4-12b-it-q4km.jns` (7,12 GB, SHA-256 `cae09e04598891dea6e9cd93fb496fbde08d822ac35de4ff45dbfab1ea25c4dd`) y `gemma-4-12b-it-mtp.jns` (0,47 GB, SHA-256 `35e640f20dd74e862df9c1d949ad4edca9f58beef0cb29e99cccc6c99297826f`), este último convertido del fichero `mtp-gemma-4-12b-it.gguf` y usado como asistente de borrador.

La innovación técnica relevante no está en el modelo, sino en el motor que lo consume. Janas es un motor de inferencia en C para ordenadores corrientes, con o sin GPU, e incorpora decodificación especulativa mediante ese asistente MTP (*multi-token prediction*) que redacta los siguientes tokens: con él, la velocidad de escritura pasa de 10 a 14 tok/s en el equipo de referencia. La conversión a JNS reordena los tensores para el acceso secuencial de Janas y traslada los metadatos del GGUF original. No se documentan datos de entrenamiento, composición del dataset, número de tokens ni fases de RLHF o DPO, porque el autor no entrenó el modelo.

## Capacidades

- Generación de texto conversacional, heredada del modelo base `google/gemma-4-12B-it` ajustado para instrucciones; es la etiqueta de pipeline declarada (`text-generation`).
- Decodificación especulativa integrada mediante el asistente `mtp` incluido en el repositorio, que acelera la generación en torno a un 40 % en el equipo de referencia (de 10 a 14 tok/s).
- Inferencia local en CPU, con o sin GPU, sobre Linux x86-64.
- Ejecución offline: los ficheros se descargan con `janas-get`, que verifica las huellas SHA-256, y no requieren conexión posterior.
- Ejecución en memoria de 32 GB en el equipo de referencia, sin depender de VRAM dedicada.
- Tool calling, function calling, razonamiento multi-paso, visión, audio, modo *thinking* y cobertura multilingüe: no disponible en la información proporcionada (no se documentan en la model card ni en los metadatos).

## Casos de uso

- Asistencia conversacional local en portátil: el modelo se ejecuta con `janas-chat gemma-4-12b` sobre CPU e iGPU, de modo que un desarrollador puede mantener un chat de texto sin conexión y sin enviar datos a terceros, con 10 tok/s de escritura y 14 tok/s usando el asistente de borrador.
- Procesamiento de texto en entornos aislados (*air-gapped*): al no requerir red una vez descargados los ficheros y verificar `janas-get` las huellas SHA-256, encaja en equipos sin salida a internet donde no se pueden usar APIs externas.
- Evaluación del motor Janas frente a llama.cpp: el repositorio documenta un banco de pruebas reproducible con `janas-bench` y `llama-bench` (prompt de 1.024 tokens, 16 escritos), útil para equipos que comparan motores de inferencia en CPU antes de adoptar uno.
- Redacción y resumen de documentos ofimáticos en un equipo de sobremesa: con 7,12 GB de pesos en Q4_K_M y una ventana de contexto no declarada, es adecuado para tareas de texto de longitud moderada en local, siempre que se valide antes la longitud de contexto real del modelo base.
- Despliegue en servidores sin GPU: al ser un motor en C que corre en CPU, permite ofrecer generación de texto en máquinas sin acelerador, aceptando el coste de unos 10 tok/s en el hardware de referencia y velocidades superiores en CPU de servidor.
- Integración como binario en flujos de trabajo de línea de comandos: `janas-get` y `janas-chat` son ejecutables de Linux x86-64 descargables como tar.gz, lo que facilita incluirlos en scripts de aprovisionamiento o en imágenes de contenedor para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos son de velocidad de inferencia, medidos el 9 y 10 de octubre de 2026 con `janas-bench` y `llama-bench` en un portátil con Intel Core Ultra 9 185H, iGPU Arc integrada y 32 GB de memoria:

| Metrica | Janas (este modelo) | llama.cpp |
|---|---:|---:|
| Lectura del prompt (tok/s), comparativa directa | 65 | 46 |
| Escritura (tok/s), comparativa directa | 9,9 | 7,1 |
| Lectura del prompt (tok/s), mejor configuración | 71 | no disponible |
| Escritura (tok/s), mejor configuración | 10 | no disponible |
| Escritura con asistente de borrador (tok/s) | 14 | no disponible |

Condiciones: prompt de 1.024 tokens y 16 tokens generados, cada motor en su mejor configuración. El propio autor advierte de que las cifras variarán en otras máquinas. No se publican datos de latencia, *throughput* con concurrencia ni consumo de memoria.

## Requisitos de hardware

- Almacenamiento: 7,12 GB para el modelo principal más 0,47 GB para el asistente de borrador; el repositorio completo ocupa 7,6 GB.
- Memoria: el equipo de referencia cuenta con 32 GB de RAM y ejecuta el modelo en CPU e iGPU. Para Q4_K_M de un modelo de 12B, la estimación habitual ronda los 7-8 GB de memoria o VRAM, más el espacio de trabajo del contexto; esta cifra es una estimación, no un dato publicado en la model card.
- GPU recomendadas: no disponibles. El único hardware documentado es la iGPU Arc integrada del Core Ultra 9 185H; no se mencionan A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada. El repositorio solo documenta ejecución en el portátil citado y no enumera GPU compatibles.
- Sistema operativo: Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores). No se mencionan Windows ni macOS.
- Opciones de despliegue: exclusivamente Janas, mediante `janas-get` y `janas-chat`, o compilando el motor desde sus fuentes. El formato JNS no lo leen llama.cpp, Ollama, vLLM ni TGI; para esos motores hay que usar el GGUF original de unsloth.
- Latencia y throughput: 65-71 tok/s de lectura de prompt y 9,9-14 tok/s de escritura en el hardware de referencia, según configuración y uso del asistente.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| prabanta-dev/gemma-4-12B-it-JNS | ~12B (denso, Q4_K_M) | JNS (solo Janas) | no disponible | 65 tok/s lectura y 9,9 tok/s escritura en el portátil de referencia (frente a llama.cpp); sin benchmarks de calidad | Apache 2.0 | HuggingFace, 0 descargas y 0 likes en la consulta; motor Janas en GitHub |
| unsloth/gemma-4-12b-it-GGUF | ~12B (denso) | GGUF (Q4_K_M y otras, según el repositorio) | no disponible | no se documentan cifras de este repositorio en la información disponible | Apache 2.0, según la cadena de atribución | HuggingFace; compatible con llama.cpp, Ollama y otros motores GGUF |
| google/gemma-4-12B-it | ~12B (denso, pesos completos) | Safetensors (no confirmado en la información disponible) | no disponible | no disponible | Apache 2.0 declarada en la tarjeta, sin fichero LICENSE en el repositorio | HuggingFace, repositorio oficial de Google |

La diferencia sustantiva entre las tres entradas no es de calidad ni de arquitectura, sino de formato y cadena de conversión: los tres comparten pesos de origen. La versión JNS solo aporta valor si se va a usar el motor Janas; para cualquier otro motor, el GGUF de unsloth es la vía directa.

## Limitaciones y advertencias

- Dependencia total del motor: los ficheros JNS solo los lee Janas, disponible únicamente para Linux x86-64. No hay soporte para llama.cpp, Ollama, vLLM, TGI, Windows ni macOS.
- Licencia del motor distinta de la de los pesos: Janas se distribuye bajo GPL-3.0-or-later, mientras que los ficheros del modelo son Apache 2.0. El autor aclara que la licencia del motor no se aplica a los pesos, pero conviene revisarlo antes de integrarlo en un producto propietario.
- Situación de la licencia del modelo base: la tarjeta indica que el repositorio original de Google no incluye fichero LICENSE y que solo declara Apache 2.0 en la model card; el repositorio JNS incluye el texto de Apache 2.0. Es un punto a verificar antes de un uso comercial, porque los modelos de la familia Gemma han solido acompañarse de términos de uso específicos.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones documentadas; es un artefacto recién creado (11 de octubre de 2026).
- Sin datos de calidad ni de contexto: no hay resultados de MMLU, HumanEval, GSM8K ni similares, ni longitud de contexto declarada, ni lista de idiomas. No se puede evaluar el riesgo de alucinación ni el comportamiento fuera del inglés más allá de lo que ofrezca el modelo base.
- Riesgo de alucinación: inherente a cualquier modelo generativo de 12B cuantizado a Q4_K_M; la cuantización de 4 bits puede degradar ligeramente la precisión respecto a los pesos completos, aunque no se publican mediciones de esa pérdida.
- Rendimiento limitado en CPU: 9,9-14 tok/s de escritura en el hardware de referencia implica unos 70-100 segundos para 1.000 tokens, poco adecuado para aplicaciones interactivas exigentes o de alto volumen.
- Cifras de rendimiento no reproducibles en otras máquinas: el propio autor advierte de que las mediciones corresponden a un portátil concreto; no hay datos de escalado en CPU de servidor ni en GPU dedicadas.
- Ausencia de cifras con concurrencia: no se documenta comportamiento con múltiples peticiones simultáneas, memoria por sesión ni latencia de primer token (TTFT).

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/prabanta-dev/gemma-4-12B-it-JNS
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Cuantización GGUF de origen: https://huggingface.co/unsloth/gemma-4-12b-it-GGUF
- Repositorio del motor Janas: https://github.com/prabanta-dev/janas
- Documentación y detalles de rendimiento de Janas: https://github.com/prabanta-dev/janas#readme
- Binarios de Janas para Linux x86-64: https://github.com/prabanta-dev/janas/releases/latest/download/janas-linux-x86_64.tar.gz

Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (remiten a sitios de contenido para adultos) y no aportan papers, blogs ni demos adicionales. No se han encontrado enlaces relevantes distintos de los incluidos en la model card y en el propio repositorio de HuggingFace.
