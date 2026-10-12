# ElementMerc/smollm2-1.7b-abliterated-GGUF

## Resumen

ElementMerc/smollm2-1.7b-abliterated-GGUF es una compilación en formato GGUF del modelo ElementMerc/smollm2-1.7b-abliterated, publicada por el usuario ElementMerc. Se trata de un modelo de generación de texto de 1.711.376.384 parámetros (aproximadamente 1,71 mil millones), distribuido exclusivamente en GGUF para su uso con llama.cpp, Ollama, LM Studio y Jan. La model card indica que el repositorio contiene dos ficheros: una conversión F16 sin pérdida de cuantización y una cuantización Q4_K_M de aproximadamente un cuarto del tamaño.

El rasgo definitorio del modelo es que ha sido sometido a *abliteration*, una técnica de ablación direccional que elimina la dirección de rechazo en el espacio de activaciones. El resultado es un modelo que no rechaza peticiones, circunstancia que el propio autor señala explícitamente como el motivo de existir del modelo y como el punto que hay que entender antes de descargar los pesos. Esto lo sitúa en el terreno de la investigación sobre alineación y seguridad, más que en el de aplicaciones de producción convencionales.

La relevancia actual del modelo es doble. Por un lado, ofrece un caso de estudio pequeño y manejable (1,71 B de parámetros, ejecutable en hardware de consumo) para analizar qué efectos tiene la abliteración sobre el comportamiento de un modelo. Por otro, el autor ha publicado un aviso de corrección el 1 de octubre de 2026 retirando todas las cifras de evaluación, que nunca estuvieron impresas en esta ficha sino en la del modelo padre. Esa retirada de métricas, unida a la ausencia de datos de arquitectura y entrenamiento en la información disponible, condiciona por completo cualquier evaluación del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; la denominación SmolLM2 corresponde habitualmente a un transformer decoder-only, dato no confirmado en la información proporcionada) |
| Parametros totales | 1.711.376.384 (1,71 mil millones) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 4096`, que es configuración de tiempo de ejecución, no el máximo declarado del modelo) |
| Tipos de cuantizacion | F16 y Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (convertido desde los safetensors del modelo base) |
| Ficheros del repositorio | `smollm2-1.7b-f16.gguf` (F16), `smollm2-1.7b-Q4_K_M.gguf` (Q4_K_M) |
| Tamaño del repositorio | 4,5 GB |
| Modelo base | ElementMerc/smollm2-1.7b-abliterated (relación: quantized) |
| Pipeline | text-generation |
| Descargas / likes | 349 / 0 |
| Fecha de creación / actualización | 2026-07-27 / 2026-10-11 |

## Arquitectura y entrenamiento

La información proporcionada no incluye descripción de la arquitectura interna del modelo. La denominación "smollm2-1.7b" sugiere una correspondencia con la familia SmolLM2 de 1,7 mil millones de parámetros, pero la model card no confirma arquitectura, número de capas, dimensión oculta, tipo de atención ni estrategia de tokenización, por lo que no se puede afirmar nada al respecto. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Toda esa información reside, según la ficha, en la model card del modelo padre, que no forma parte del material analizado.

Lo único documentado sobre el proceso de creación es la operación de *abliteration* aplicada en el modelo padre y la posterior cadena de conversión y cuantización: los pesos safetensors del padre se convirtieron con `convert_hf_to_gguf.py` y se cuantizaron con `llama-quantize`. El autor indica que cada fichero se cargó y se le pidió generar texto antes de publicarlo, como comprobación de que el GGUF convertido realmente se ejecuta.

Existe además un aviso de corrección fechado el 1 de octubre de 2026 en el que se retiran las cifras de evaluación del modelo. Esas cifras nunca estuvieron en esta ficha, sino en la del modelo padre, y según el aviso han sido retiradas allí junto con sus motivos. Los ficheros GGUF no se retiran ni se modifican. En consecuencia, no hay ninguna métrica de rendimiento vigente que se pueda citar para este modelo.

## Capacidades

- Generación de texto en inglés: es la tarea declarada del pipeline (`text-generation`).
- Conversación multi-turno: la model card documenta el uso mediante `llama-server`, Ollama y LM Studio, lo que permite interacción conversacional.
- Generación sin rechazos: por efecto de la abliteración, el modelo no aplica negativas ni advertencias de contenido, que es precisamente el objetivo declarado de la variante.
- Ejecución local en CPU o GPU: al distribuirse en GGUF F16 y Q4_K_M, puede correr con llama.cpp y derivados.
- Idiomas: únicamente inglés según el campo `language` de la ficha. No hay evidencia de capacidades multilingües.
- Tool calling / function calling: no disponible. La información proporcionada no menciona soporte de herramientas ni de *function calling*.
- Capacidades de agente y razonamiento multi-paso: no disponible. No se documenta ningún modo de razonamiento, *thinking mode* ni planificación estructurada.
- Visión o audio: no disponible. No se declara ninguna modalidad distinta del texto.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como sujeto de estudio para medir qué se gana y qué se pierde al aplicar abliteración sobre un modelo pequeño, comparando su comportamiento con el de la versión no modificada del mismo tamaño. Es un caso adecuado porque el modelo es pequeño, cabe en una sola GPU de consumo y el efecto de la intervención es el eje del trabajo.
- Red teaming y evaluación de filtros: se puede emplear para generar peticiones y respuestas que pongan a prueba los sistemas de moderación de una plataforma, dado que el modelo no se autoimpone restricciones. Requiere revisión humana de las salidas en todos los casos.
- Generación creativa de ficción sin restricciones: escritura de narrativa, diálogos y desarrollo de personajes en inglés donde el autor necesita que el modelo no se niegue a tratar temas duros. El contexto reducido implica trabajar con escenas o capítulos cortos, no con novelas completas de una sola pasada.
- Prototipado local en portátil: con la cuantización Q4_K_M, el modelo se puede ejecutar en un equipo sin GPU dedicada mediante Ollama o llama.cpp para probar interfaces, prompts y flujos de generación antes de escalar a modelos mayores.
- Generación de texto auxiliar de bajo coste: tareas de etiquetado, reformulación, extracción de campos y generación de datos sintéticos en inglés donde el coste por token importa más que la calidad puntera y el contenido no es sensible.
- Pruebas de pipelines de cuantización: los dos ficheros publicados (F16 y Q4_K_M) permiten comparar la degradación introducida por la cuantización en un modelo de 1,71 B de parámetros, útil para calibrar qué nivel de cuantización es aceptable en modelos de este tamaño.
- Docencia y demostraciones: al ser un modelo pequeño con licencia Apache-2.0 y ejecución local, resulta práctico para explicar en un aula cómo funciona la inferencia, qué hace una cuantización y qué es la abliteración, sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un aviso de corrección del 1 de octubre de 2026 por el que se retiran todas las cifras de evaluación asociadas al modelo; esas cifras nunca estuvieron en esta ficha, sino en la del modelo padre, y han sido retiradas allí. Los ficheros GGUF no se han retirado ni modificado. Por tanto, no existe en el material proporcionado ningún valor de MMLU, HumanEval, GSM8K ni de cualquier otra prueba que pueda citarse o compararse.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parámetros y del tamaño de los ficheros publicados, no datos declarados por el autor.

- VRAM/RAM para F16: los pesos ocupan aproximadamente 3,4 GB (1.711.376.384 parámetros a 2 bytes). Con la caché KV y el *overhead* del runtime, conviene reservar entre 4 y 5 GB.
- VRAM/RAM para Q4_K_M: los pesos ocupan aproximadamente 1,1 GB. Con caché KV y *overhead*, entre 1,5 y 2,5 GB según la longitud de contexto configurada.
- GPU de consumo: sí cabe en cualquier GPU con 4 GB o más de VRAM. Modelos como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores lo ejecutan con holgura en Q4_K_M. En F16 basta con 6 GB de VRAM.
- CPU: es viable la inferencia solo en CPU mediante llama.cpp, con velocidades de generación del orden de decenas de tokens por segundo en procesadores modernos y la cuantización Q4_K_M. No se dispone de cifras medidas.
- Opciones de despliegue: `llama-server` de llama.cpp (`llama-server -m smollm2-1.7b-Q4_K_M.gguf -c 4096`), Ollama (`ollama run hf.co/ElementMerc/smollm2-1.7b-abliterated-GGUF:Q4_K_M`), LM Studio y Jan, tal como documenta la propia ficha. La descarga programática es posible vía `huggingface_hub`.
- vLLM y TGI: no están documentados para este repositorio en la información disponible. Ambos frameworks tienen soporte de GGUF limitado y requieren comprobación previa; para producción con safetensors habría que recurrir al modelo padre.
- Latencia y throughput: no disponible. No se publican mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos que aparecen a continuación proceden de conocimiento público general sobre esas familias y no han sido verificados en la búsqueda web realizada, cuyos resultados no guardaban relación con el tema. Se incluyen como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ElementMerc/smollm2-1.7b-abliterated-GGUF | 1,71 B | no disponible | Apache-2.0 | GGUF (F16, Q4_K_M) | Sin métricas publicadas; sin rechazos por abliteración; solo inglés |
| SmolLM2-1.7B (HuggingFaceTB) | ~1,7 B | 8.192 tokens (referencia, no verificada) | Apache-2.0 | safetensors, GGUF de terceros | Modelo base de la familia; con alineación estándar |
| Qwen2.5-1.5B | ~1,5 B | 32.768 tokens (referencia, no verificada) | Apache-2.0 | safetensors, GGUF | Mayor contexto declarado y buen soporte multilingüe |
| Gemma-2-2B | ~2,6 B | 8.192 tokens (referencia, no verificada) | Licencia Gemma (con restricciones de uso) | safetensors, GGUF | Licencia menos permisiva que Apache-2.0 |

La comparación relevante no es solo de tamaño: la diferencia funcional de este modelo es la abliteración, que lo aleja del uso comercial convencional y lo acerca a la investigación. Cualquier comparativa de calidad queda bloqueada por la retirada de las cifras de evaluación.

## Limitaciones y advertencias

- Ausencia total de métricas: las cifras de evaluación han sido retiradas mediante aviso de corrección del 1 de octubre de 2026. No hay ningún dato publicado que permita estimar la calidad del modelo, ni en esta ficha ni, según el aviso, en la del padre.
- El modelo no rechaza peticiones: es su característica definitoria y su principal riesgo. Puede generar contenido dañino, ilegal, violento o de otro tipo sin filtro alguno. No es apto para aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo elevado de alucinación: con 1,71 B de parámetros, la capacidad de retener y recuperar conocimiento factual es limitada, y la cuantización Q4_K_M reduce aún más el margen de calidad. El propio autor advierte que los modelos pequeños tienen menos calidad que perder que los grandes y recomienda verificar contra el F16 cuando un resultado importe.
- Degradación por cuantización: Q4_K_M intercambia calidad por tamaño. En un modelo de este tamaño el intercambio es más perceptible que en modelos grandes.
- Sesgos: no disponible. No se documenta ningún análisis de sesgos, y la abliteración puede alterar de forma no evaluada los sesgos preexistentes del modelo base.
- Idioma: solo inglés según el campo `language`. No hay evidencia de funcionamiento fiable en castellano ni en otros idiomas.
- Contexto: no se declara la longitud máxima de contexto. Los ejemplos de uso emplean 4.096 tokens, valor que puede ser conservador o reflejar el límite real; no se puede asumir un contexto mayor.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero la licencia no exime de responsabilidad por el contenido generado. El modelo base del que deriva (si es SmolLM2, de Hugging Face) también es Apache-2.0, aunque esto no se confirma en la información proporcionada.
- Trazabilidad limitada: no se documentan arquitectura, datos de entrenamiento ni método exacto de abliteración en esta ficha; toda esa información se delega a la model card del padre, que no forma parte del material analizado.
- Caveat de producción: es un artefacto derivado de un modelo abliterado con métricas retiradas. No es una base recomendable para sistemas en producción que requieran comportamiento predecible o auditable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ElementMerc/smollm2-1.7b-abliterated-GGUF
- Modelo base (padre): https://huggingface.co/ElementMerc/smollm2-1.7b-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp

No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs o demos) sobre este modelo. Los resultados devueltos correspondían a páginas de ayuda de YouTube sin relación con el contenido.
