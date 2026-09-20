# 1105s110/Qwen3.8-27B-Blackfrost-Abliterated-GSQ-RCO-IQ3_XXS-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato IQ3_XXS del modelo Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16, publicada por el usuario 1105s110. No es un modelo entrenado desde cero, sino una compresión con pérdida de los pesos BF16 de un modelo "abliterated" (con los mecanismos de rechazo eliminados mediante intervención sobre los pesos) de 27.320.697.856 parámetros. El fichero único resultante ocupa aproximadamente 9,81 GiB, lo que lo sitúa en el tramo de menos de 10 GiB dentro de una línea de cuantizaciones del mismo autor.

La innovación principal es el uso de una tabla de asignación GSQ-RCO (866 tensores) publicada por ISTA / IST-DASLab, que asigna un formato de rejilla por tensor bajo un presupuesto de bits, aplicada 1:1 mediante un único pase de `llama-quantize` sobre los pesos abliterated oficiales, sin necesidad de entrenamiento de rejilla. El autor sostiene que esta tabla, aprendida para la arquitectura, se transfiere a copias abliterated de la misma arquitectura (mismas formas de tensor y mismo presupuesto) y que la línea Blackfrost cuantiza de forma mensurablemente mejor que la línea Huihui empleada en una demostración previa de RentedNoodle.

Es relevante ahora por dos motivos prácticos: permite mantener los pesos y una ventana de contexto de 256K completamente residentes en una sola GPU de 32 GB (RTX 5090) sin offloading, y alcanza 138,9 tok/s de decodificación en reproducción de peticiones reales, un 19 % por encima del quant mixto 4/5 bits de 15,7 GiB del propio autor. Como contrapartida, el coste de fidelidad de los 3 bits es real (KLD 0,1137 frente a 0,0523 del quant de 15,7 GiB). El repositorio registra 0 descargas y 1 "like" en el momento de la consulta, y no hay resultados publicados de benchmarks estándar tipo MMLU o HumanEval.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la model card del quant; heredada del modelo base Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16, cuya arquitectura tampoco se detalla (no se confirma si es densa o MoE) |
| Parámetros totales | 27.320.697.856 (~27,3 B) |
| Parámetros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 256K declarados por el autor; 202K verificados con prueba de recuperación de aguja (needle) en la configuración medida |
| Tipos de cuantización | GGUF IQ3_XXS con mezcla de tensores IQ3_S e IQ2_S, más anclas Q4_K/Q6_K; sin tensores NVFP4; tabla de asignación RCO de 866 tensores incluida en el repo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único, ~9,81 GiB) |
| Tamaño del repositorio | 10,5 GB |
| Ficheros auxiliares | `gsq-rco-iq3xxs-allocation-table.txt` (tabla de asignación ISTA RCO, 866 tensores) |
| Modelo base | Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16 (relación: quantized) |
| Biblioteca | gguf / llama.cpp |
| Motor probado | llama.cpp b10930 |
| Fecha de creación | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay información sobre arquitectura en la model card de este repositorio más allá de la designación "Qwen3.8-27B" del modelo base y de la referencia a una "abliteración de un solo pase" (single-pass abliteration) en la línea Blackfrost, en contraste con la "abliteración multicapa cruda" de la línea Huihui. Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO. El modelo base es un derivado abliterated, es decir, un modelo al que se le han suprimido las direcciones de activación asociadas al rechazo; esto no implica reentrenamiento, sino una modificación de pesos sobre un modelo ya existente. No se especifica sobre qué modelo preentrenado original se construyó, ni si existe una ficha técnica oficial de "Qwen3.8-27B" publicada por Alibaba Qwen.

La contribución técnica de este repositorio es exclusivamente de cuantización. GSQ-RCO (ISTA / IST-DASLab) aprende una asignación de formato de rejilla por tensor bajo un presupuesto de bits; la tabla resultante se transfiere a copias abliterated de la misma arquitectura porque las formas de tensor y el presupuesto de bits coinciden. El procedimiento completo se reproduce con un único comando: `llama-quantize --imatrix <ista-official.imatrix> --tensor-type-file gsq-rco-iq3xxs-allocation-table.txt <blackfrost-abliterated-bf16.gguf> <output.gguf>`, usando una imatrix oficial de ISTA. El autor atribuye el método a RentedNoodle, que demostró primero esta transferencia sobre un modelo abliterated de base Huihui. La plantilla de chat conserva el canal de cadena de pensamiento (chain-of-thought), por lo que recomienda `max_tokens` de al menos 600 en la API.

## Capacidades

- Generación de texto conversacional multi-turno en formato GGUF estándar, con plantilla de chat que preserva el canal de razonamiento explícito.
- Razonamiento matemático con verificación por fuerza bruta: la batería HardBattery incluye matemáticas con verdad de referencia verificada, y este quant obtiene 14/17.
- Generación y ejecución de código: la misma batería incluye tareas de programación ejecutadas en sandbox.
- Lógica dura (hard logic) evaluada dentro de HardBattery.
- Seguimiento de instrucciones de tipo IFEval, evaluado en la batería "Easy" (21/22).
- Recuperación de información en contexto muy largo: prueba de aguja (needle) a 202K de contexto con 41,4 % de precisión y 63,2 tok/s de decodificación.
- Comportamiento "uncensored" / "abliterated": los mecanismos de rechazo han sido suprimidos de los pesos, por lo que el modelo no aplica las negativas típicas de un modelo alineado.
- Compatibilidad con decodificación especulativa: se midió con un modelo borrador BF16, con una tasa de aceptación del borrador del 44,5 % en reproducción de peticiones reales.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documentan explícitamente).
- Visión, audio u otras modalidades: no disponible (no se mencionan).
- Cobertura multilingüe: no disponible (el campo de idiomas está vacío; la model card solo incluye texto en inglés y un resumen en chino).

## Casos de uso

- Asistente conversacional sin filtros de rechazo: el modelo está diseñado para no aplicar negativas de alineamiento, lo que encaja en entornos de investigación sobre comportamiento de modelos, red teaming controlado o generación creativa sin restricciones temáticas autoimpuestas.
- Despliegue en una sola GPU de 32 GB con contexto largo: gracias a los 9,81 GiB de pesos, quedan aproximadamente 22 GB libres en una RTX 5090 para caché KV, lo que permite sesiones residentes de 256K de contexto sin offloading. Adecuado para análisis de documentos extensos, bases de código completas o historiales de conversación muy largos.
- Recuperación sobre corpus masivos: la prueba de aguja a 202K con 41,4 % de precisión lo hace utilizable para preguntas y respuestas sobre documentación técnica extensa, siempre que se acepte la caída de precisión respecto a cuants mayores.
- Razonamiento matemático con verificación: las tareas de matemáticas con verdad de referencia de la batería HardBattery (14/17) sugieren uso en generación de soluciones paso a paso en entornos donde un verificador externo comprueba el resultado.
- Generación de código con ejecución en sandbox: los tests de programación ejecutados en sandbox de HardBattery lo sitúan como opción para asistentes de programación en local, con la ventaja de no requerir conexión ni claves de API.
- Inferencia de alto rendimiento en hardware de gama alta: con 138,9 tok/s de decodificación en reproducción de peticiones reales (con modelo borrador especulativo), es apto para servir a varios usuarios concurrentes en una sola tarjeta, siempre que la calidad de 3 bits sea aceptable.
- Investigación sobre cuantización: el repositorio incluye la tabla de asignación RCO de 866 tensores y documenta el comando exacto de reproducción, por lo que sirve como caso de estudio reproducible de transferencia de asignaciones aprendidas entre linajes del mismo modelo.
- Comparación de linajes de abliteración: el autor mide la diferencia entre la línea Blackfrost y la línea Huihui con la misma tabla de asignación (69 % menos KLD en favor de Blackfrost), lo que lo convierte en una referencia para estudiar cómo afecta el método de abliteración a la cuantizabilidad.

## Benchmarks y rendimiento

Todos los datos siguientes proceden de mediciones locales del autor en RTX 5090 32 GB con llama.cpp b10930, mismo arnés y misma línea base dorada, temperatura 0. No son cifras de terceros. KLD se calcula contra logits BF16 guardados (KV en f16, mismo corpus y mismo troceado para todos los cuants).

| Quant | Tamaño | KLD vs BF16 | Easy battery /22 | HardBattery /17 | Needle 202K (dec / acierto) | Reproducción real (dec / aceptación borrador) |
|---|---|---|---|---|---|---|
| Este repo (linaje Blackfrost) | 9,81 GiB | 0,1137 | 21 | 14 | 63,2 tok/s / 41,4 % | 138,9 tok/s / 44,5 % |
| GSQ-RCO-IQ3_XXS de RentedNoodle (misma asignación, linaje Huihui) | 9,75 GiB | 0,1926 | 21 | 14 | 56,6 tok/s / 33,8 % | 138,9 tok/s / 40,9 % |
| Quant mixto 4/5 bits del autor (daily driver) | 15,73 GiB | 0,0523 | 22 | 14 | 70,1 tok/s / 51,7 % | 116,3 tok/s / 40,7 % |

Notas de protocolo declaradas por el autor: la banda de KLD 0,02-0,08 no separó cuants en sus pruebas de comportamiento, por lo que 0,1137 refleja un coste real de los 3 bits; la batería "Easy" combina cuestionario de conocimiento, generación abierta evaluada automáticamente y seguimiento de instrucciones tipo IFEval; la batería "Hard" solo incluye matemáticas con verdad verificada por fuerza bruta, código ejecutado en sandbox y lógica dura, y es la única que separó generaciones de modelo en su configuración; la prueba de reproducción usa 30 peticiones reales emparejadas, 400 tokens de salida y el mismo modelo borrador especulativo BF16.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Peso en disco y en VRAM: aproximadamente 9,81 GiB de pesos en un único fichero GGUF (repositorio de 10,5 GB).
- Configuración medida por el autor: una RTX 5090 de 32 GB ejecuta pesos y contexto de 256K completamente residentes, sin offloading; el autor calcula que los pesos dejan unos 22 GB libres para caché KV.
- GPU recomendadas: RTX 5090 32 GB es la plataforma donde se tomaron todas las medidas. Cualquier GPU con al menos 16 GB de VRAM puede cargar los pesos, aunque el margen para contexto largo se reduce proporcionalmente (estimación aritmética derivada del tamaño del fichero, no verificada por el autor).
- GPU de gama alta profesional: A100 40/80 GB y H100 quedan muy por encima del requisito de pesos, por lo que permitirían contextos amplios o varios usuarios concurrentes con holgura; no se han publicado medidas en estas tarjetas.
- GPU de consumo: cabe sin problema en RTX 4090 (24 GB), RTX 3090 (24 GB) y tarjetas de 16 GB. El autor indica explícitamente que en tarjetas más pequeñas el quant también deja espacio para caché KV grande.
- No está limitado a Blackwell: los tensores son de formato IQ/K (mezcla de IQ3_XXS, IQ3_S e IQ2_S con anclas Q4_K/Q6_K) y no contiene tensores NVFP4, por lo que funciona en cualquier GPU capaz de ejecutar llama.cpp.
- Opciones de despliegue: llama.cpp (versión probada b10930), con `llama-server -m <modelo>.gguf --jinja -ngl 999 -c 65536` o `llama-quantize`. Al ser GGUF estándar, es compatible con el ecosistema habitual (por ejemplo Ollama o llama-cpp-python); no se ha verificado el soporte en vLLM ni TGI para esta cuantización concreta.
- Rendimiento medido: 138,9 tok/s de decodificación con decodificación especulativa (tasa de aceptación del borrador del 44,5 %) y 63,2 tok/s en decodificación a 202K de contexto, en RTX 5090 y con el mismo modelo borrador BF16.
- Memoria de contexto: para ventanas de 64K (valor de ejemplo en el comando del autor) el consumo de KV es una fracción del disponible en una tarjeta de 32 GB; el autor no publica el consumo de KV por token.

## Comparativa con modelos similares

No hay datos de benchmarks de terceros para modelos de la misma categoría (27B abliterated cuantizados), por lo que la comparación se limita a los tres cuants del mismo linaje medidos por el autor.

| Modelo / quant | Tamaño | KLD vs BF16 | HardBattery /17 | Reproducción real | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B Blackfrost-Abliterated GSQ-RCO-IQ3_XXS (este repo) | 9,81 GiB | 0,1137 | 14 | 138,9 tok/s, 44,5 % aceptación | Apache 2.0 | Público en HuggingFace, 0 descargas |
| GSQ-RCO-IQ3_XXS de RentedNoodle (linaje Huihui) | 9,75 GiB | 0,1926 | 14 | 138,9 tok/s, 40,9 % aceptación | No disponible en la información | Referenciado por el autor |
| Quant mixto 4/5 bits del mismo linaje | 15,73 GiB | 0,0523 | 14 | 116,3 tok/s, 40,7 % aceptación | Apache 2.0 (según licencia del repo) | No disponible en la información |

Modelos comparables de otros autores: no disponible.

## Limitaciones y advertencias

- Coste de fidelidad de 3 bits: el propio autor reconoce que KLD 0,1137 frente a 0,0523 del quant mixto de 15,7 GiB es un coste real, y que la banda 0,02-0,08 es donde sus pruebas de comportamiento no lograron separar cuants. Este modelo queda fuera de esa banda.
- Decodificación en contexto largo por detrás de quants mayores: 63,2 tok/s frente a 70,1 tok/s a 202K.
- Prueba de rechazo no ejecutada: el protocolo de 450 casos de refusal-bench no se ha corrido sobre esta combinación exacta de quant y motor; el autor evita citar cifras a nivel de pesos porque varían hasta 3× entre stacks.
- Modelo abliterated: la supresión de los mecanismos de rechazo implica que el modelo puede generar contenido dañino, ilegal o inseguro sin negarse. Requiere salvaguardas externas si se expone a usuarios finales, y su uso en producción con público general es desaconsejable.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones de veracidad. La reducción de precisión de la cuantización a 3 bits puede agravarlo en tareas factuales, aunque el autor no lo mide.
- Idiomas soportados: no disponible. Sin lista de idiomas no se puede garantizar un rendimiento aceptable fuera del inglés (la model card está escrita en inglés y chino).
- Licencia Apache 2.0 declarada en el repositorio, lo que en principio permite uso comercial, pero la licencia del modelo base Blackfrost y del modelo preentrenado original no se detalla en la información disponible; conviene verificar la cadena completa antes de un uso comercial.
- Procedencia poco verificable: no se aporta referencia a una ficha técnica oficial del modelo base ni a un modelo preentrenado "Qwen3.8-27B" publicado por Alibaba Qwen. La nomenclatura no coincide con ninguna familia de Qwen verificable en la información disponible, por lo que el origen real de los pesos no está acreditado.
- Repositorio con 0 descargas y 1 "like", publicado por un usuario individual: no hay validación independiente de las cifras de rendimiento, que son todas mediciones del propio autor con su propio arnés.
- Fecha de creación atípica (2026-09-20): conviene comprobar la coherencia temporal del repositorio antes de integrarlo en un pipeline.
- Los resultados de la búsqueda web proporcionada no contienen ninguna referencia al modelo; los enlaces devueltos corresponden a un centro educativo en Bamberg y son irrelevantes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/1105s110/Qwen3.8-27B-Blackfrost-Abliterated-GSQ-RCO-IQ3_XXS-GGUF
- Modelo base (BF16 abliterated): https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Otros enlaces relevantes (papers de ISTA / IST-DASLab, repositorio de RentedNoodle, demos): no disponible. La model card no incluye URL alguna y los resultados de la búsqueda web no contienen referencias al modelo.
