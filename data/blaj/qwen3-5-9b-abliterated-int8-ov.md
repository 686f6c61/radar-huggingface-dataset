# blaj/Qwen3.5-9B-abliterated-int8-ov

## Resumen

blaj/Qwen3.5-9B-abliterated-int8-ov es una conversion a OpenVINO IR del modelo lukey03/Qwen3.5-9B-abliterated, que a su vez es una version "abliterated" (sin capa de rechazo) de Qwen3.5-9B. La conversion la firma el usuario blaj y esta empaquetada especificamente para inferencia sobre hardware Intel mediante OpenVINO, con pesos cuantizados a int8 asimetrico por canal. Se trata, por tanto, de un artefacto de despliegue mas que de un modelo entrenado desde cero: no hay entrenamiento adicional, solo exportacion y compresion de pesos.

El modelo conserva la arquitectura original Qwen3_5ForCausalLM con 32 capas y un vocabulario de 248.320 tokens, y ronda los 9.000 millones de parametros. La cuantizacion afecta a las 275 capas del grafo (275/275 en int8_asym), y el repositorio ocupa 8,4 GB. El autor publica un hermano en int4 (blaj/Qwen3.5-9B-abliterated-int4-ov) para entornos con menos memoria.

Su relevancia es acotada pero clara: permite ejecutar un modelo de 9B en iGPU Intel Arc (y presumiblemente en CPU) sin GPU dedicada, con un throughput medido de 8,2 tok/s y un TTFT de 0,157 s en un Core Ultra 7 258V. El caracter "abliterated/uncensored" implica que el alineamiento de seguridad fue suprimido, lo que condiciona su uso en produccion. La licencia declarada es Apache-2.0. No hay datos publicados sobre longitud de contexto, idiomas soportados ni benchmarks de calidad en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer denso), 32 capas, vocab 248320 |
| Parametros totales | ~9B (derivado del nombre del modelo; no se declara cifra exacta) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 asimetrico por canal (int8_asym, 275/275 capas); existe build hermano en int4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml + .bin); repositorio de 8,4 GB |
| Libreria | openvino (optimum-intel + NNCF) |
| Modelo base | lukey03/Qwen3.5-9B-abliterated |
| Tamano del repositorio (HF) | figura como 0.0 GB en la API; la model card declara 8,4 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-9B, un transformer denso de 32 capas con vocabulario de 248.320 tokens. Sobre el no hay innovaciones arquitectonicas propias de esta ficha: el unico cambio respecto al original es la abliteracion aplicada por lukey03, descrita como "full-layer abliteration" sobre las capas 0-31 con escala 1.0, es decir, una proyeccion que elimina la direccion de rechazo en todas las capas del modelo. No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF/DPO/RLVR.

Lo especifico de este repositorio es el pipeline de conversion, documentado por el autor. Se uso una estrategia en dos etapas: primero se exporto un IR en fp16 y despues se comprimio con NNCF, en lugar de una unica pasada de `optimum-cli --weight-format int8`. El motivo declarado es mantener el pico de memoria muy por debajo del que exigiria una exportacion de una sola pasada, algo relevante en modelos de este tamano. Ademas, el autor advierte de una restriccion de version: el "gate" de exportacion de esta arquitectura rechaza cualquier `transformers` superior a 5.2.*, por lo que la conversion exige `transformers==5.2.0` (a diferencia de los modelos LFM heretic, que requieren 5.4.0).

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y las etiquetas incluyen "conversational".
- Conversacion multi-turno: heredada del modelo base Qwen3.5-9B.
- Generacion sin filtros de rechazo: la abliteracion elimina la capa de negativa del modelo original, por lo que responde a peticiones que un modelo alineado rechazaria.
- Inferencia en hardware Intel: el formato OpenVINO IR esta pensado para CPU, iGPU Arc y NPU Intel.
- Decodificacion especulativa: tecnicamente soportada por OVMS, aunque el autor reporta que con el draft DFlash probado no aporta ganancia.
- Razonamiento, codigo, matematicas, vision, tool calling, agentes y multilingueismo: no disponible en la informacion proporcionada. No se puede confirmar que Qwen3.5-9B los soporte ni en que grado, y esta conversion no anade capacidades.

## Casos de uso

- Inferencia local en portatil con iGPU Intel: el caso medido por el autor es un Core Ultra 7 258V con Arc 130V/140V y 30 GB de RAM, donde el modelo corre a 8,2 tok/s con TTFT de 0,157 s. Es un escenario de asistente personal offline sin GPU dedicada.
- Despliegue en CPU de servidor sin acelerador: al ser un IR de OpenVINO, puede servirse en nodos Xeon con OVMS, evitando el coste de GPUs dedicadas para cargas de baja concurrencia.
- Generacion de texto en el borde (edge): 8,4 GB de pesos permiten embeber el modelo en estaciones de trabajo o mini-PC con 16 GB de RAM o mas y un iGPU Arc.
- Experimentacion con modelos sin censura en investigacion sobre alineamiento: el modelo sirve como contraste frente a la version alineada para estudiar como la abliteracion altera las respuestas en tareas de evaluacion de seguridad.
- Prototipado de chatbots de dominio interno: el formato OVMS expone un endpoint REST (por ejemplo en el puerto 11436 del ejemplo del autor) integrable en aplicaciones corporativas.
- Sustitucion de un modelo mayor en tareas de resumen o reescritura con requisitos de latencia moderados: 8,2 tok/s limita el uso a flujos no interactivos o con streaming tolerante.
- Comparativa de cuantizaciones en pipelines de optimizacion: sirve para medir la perdida de calidad int8 frente al int4 hermano y frente al modelo base en fp16.

## Benchmarks y rendimiento

Unico dato publicado, correspondiente a generacion single-stream sobre Intel Core Ultra 7 258V (iGPU Arc 130V/140V), 30 GB de RAM y OpenVINO Model Server 2026.4.0 ejecutando en GPU:

| Configuracion | tok/s | TTFT |
|---|---|---|
| int8, sin draft | 8,2 | 0,157 s |
| int8, con draft abliterated DFlash | 7,5 | 0,193 s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor senala ademas que la decodificacion especulativa con el draft DFlash resulto mas lenta que sin draft (7,5 frente a 8,2 tok/s), porque las propuestas del draft se rechazan; el draft carga y ejecuta correctamente pero no aporta aceleracion.

## Requisitos de hardware

- VRAM/RAM para int8: el repositorio ocupa 8,4 GB, por lo que se necesitan aproximadamente 9-11 GB de memoria para pesos mas cache KV y buffers de runtime. Cifra estimada, no declarada por el autor.
- VRAM/RAM para el hermano int4: aproximadamente 5-6 GB estimados a partir del nombre y del build int4; no se declara tamano exacto.
- GPU recomendadas: no hay lista oficial. El unico hardware validado en la model card es la iGPU Intel Arc 130V/140V integrada en el Core Ultra 7 258V. Al ser OpenVINO IR, el objetivo natural son iGPU Arc, CPU Intel y NPU Intel; no se documenta soporte para A100, H100 ni RTX 4090, que no son destinos tipicos de OpenVINO.
- Cabe en GPU de consumo: si, en el sentido de que cabe en iGPU integradas con memoria compartida (30 GB de RAM en el caso medido). En GPUs dedicadas de consumo solo tendria sentido a traves de OpenVINO sobre Intel Arc dedicada, extremo no verificado en la informacion disponible.
- Despliegue: OpenVINO Model Server (OVMS) es el camino documentado, con el comando `PYTHONPATH=$OVMS_ROOT/lib/python ovms --config_path ./ovms_config.json --rest_port 11436`. El autor advierte que `PYTHONPATH` debe apuntar a `lib/python` de OVMS; si no, el servidor termina inmediatamente despues de inicializar el interprete de Python sin emitir error. La conversion se hizo con optimum-intel y NNCF. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y estos no consumen IR de OpenVINO.
- Latencia y throughput: 8,2 tok/s y TTFT de 0,157 s en int8 sin draft sobre el hardware citado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| blaj/Qwen3.5-9B-abliterated-int8-ov | ~9B | OpenVINO IR int8_asym | 8,4 GB | Apache-2.0 | 8,2 tok/s y TTFT 0,157 s en Arc 130V/140V |
| blaj/Qwen3.5-9B-abliterated-int4-ov | ~9B | OpenVINO IR int4 | no disponible | Apache-2.0 | Build hermano, pensado para menos memoria |
| lukey03/Qwen3.5-9B-abliterated | ~9B | no disponible | no disponible | Apache-2.0 | Modelo origen de la abliteracion; sin cuantizar para OpenVINO |
| blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov | no disponible | OpenVINO IR int4 | no disponible | no disponible | Draft para decodificacion especulativa; no acelera segun el autor |

No se dispone de comparativas con alternativas de otros fabricantes (por ejemplo Llama o Mistral de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: el alineamiento de seguridad fue eliminado deliberadamente en las capas 0-31. Puede generar contenido que un modelo alineado rechazaria, lo que lo hace inadecuado para aplicaciones orientadas al usuario final sin filtros adicionales.
- Riesgo de alucinacion: no hay benchmarks de fidelidad ni de calidad publicados; la cuantizacion int8 puede degradar ligeramente la calidad respecto al modelo en fp16, aunque no se cuantifica esa perdida.
- Sesgos: no disponible. No se documenta ninguna evaluacion de sesgos del modelo base ni del proceso de abliteracion.
- Longitud de contexto: no disponible. No se puede planificar su uso en escenarios de contexto largo sin verificacion previa.
- Idiomas: no disponible. Las etiquetas no listan idiomas y la model card no los menciona.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el propio caracter uncensored del modelo traslada al desplegador la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo.
- Dependencia de version: la conversion requiere `transformers==5.2.0`; versiones superiores son rechazadas por el gate de exportacion de esta arquitectura.
- Decodificacion especulativa no funcional en la practica: el draft DFlash reduce el throughput medido (7,5 frente a 8,2 tok/s).
- Ecosistema limitado: al ser IR de OpenVINO, no es directamente utilizable en vLLM, llama.cpp, Ollama o TGI, lo que restringe su portabilidad fuera de Intel.
- Adopcion nula: el repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-int8-ov
- Modelo base (abliteracion): https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Build hermano int4: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-int4-ov
- Draft DFlash int4 para decodificacion especulativa: https://huggingface.co/blaj/Qwen3.5-9B-abliterated-DFlash-int4-ov
- Draft de referencia citado por el autor: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relevante sobre el modelo; los enlaces disponibles son los de HuggingFace listados arriba.
