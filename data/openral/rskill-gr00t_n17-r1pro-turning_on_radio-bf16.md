# OpenRAL/rskill-gr00t_n17-r1pro-turning_on_radio-bf16

## Resumen

rskill-gr00t_n17-r1pro-turning_on_radio-bf16 es un paquete de habilidad (rSkill) publicado por OpenRAL que adapta el modelo vision-language-action NVIDIA GR00T N1.7-3B a una unica tarea del benchmark BEHAVIOR-1K: encender una radio domestica. El paquete no contiene pesos: incluye el manifiesto y la configuracion del adaptador, mientras que el checkpoint del organizador se descarga por separado desde la pagina de baselines de BEHAVIOR. Esta disenado para el embodiment simulado Galaxea R1 Pro y consume tres camaras RGB (cabeza y dos munecas) mas un vector de propiocepcion de 61 dimensiones, emitiendo una accion movil-bimanual de 23 dimensiones.

El modelo subyacente, GR00T N1.7-3B de NVIDIA, es una politica VLA de aproximadamente 3,1 mil millones de parametros construida sobre un backbone Qwen3-VL, orientada a control robotico de proposito general y afinada aqui con las demostraciones del desafio BEHAVIOR-1K 2026. La relevancia actual reside en que estandariza el contrato de observacion y accion del simulador OmniGibson para el R1 Pro y permite reproducir el checkpoint oficial dentro del ecosistema OpenRAL, incluyendo cuantizacion NF4 para reducir requisitos de memoria en el host.

El paquete se distribuye en bf16 almacenado pero se carga en int4 (NF4) mediante el paquete de cuantizacion de OpenRAL Pro, y declara una latencia objetivo de 1500 ms por chunk de 16 pasos de accion. Es, por tanto, una pieza de infraestructura para evaluacion y despliegue simulado de politicas roboticas, no un modelo de lenguaje de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre backbone Qwen3-VL, con cabeza de accion y horizonte de 16 pasos |
| Parametros totales | aproximadamente 3,1 B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (NF4) en carga; pesos almacenados en bf16; el runtime open source de OpenRAL solo carga fp32, fp16 y bf16, por lo que int8, fp8, int4/NF4 y nvfp4 requieren OpenRAL Pro |
| Idiomas soportados | en |
| Licencia | NVIDIA Open Model License (license: other, license_name: nvidia-open-model-license) |
| Formato de pesos | no incluido en el repositorio; checkpoint del organizador descargado aparte (almacenamiento declarado bf16) |

## Arquitectura y entrenamiento

La politica es una VLA que combina un codificador visual-language basado en Qwen3-VL con un cabezal de accion que produce un horizonte de 16 pasos. El adaptador de OpenRAL ejecuta la rama `behavior` del repositorio `wensi-ai/Isaac-GR00T` (commit `ace36d935b376fbf25cd56371e23877b95407c40`) en un sidecar aislado con Python 3.10, usando sin modificaciones `Gr00tPolicy` y `B1KPolicyWrapper`, incluido el ensamblado temporal (temporal ensembling) y el reparto oficial de modalidades del R1 Pro. En tiempo de carga se aplican dos medidas de memoria: cuantizacion NF4 de las capas lineales grandes y sustitucion del `lm_head` de Qwen3-VL por `Identity`, ya que el wrapper solo consume estados ocultos y la proyeccion de logits de vocabulario completo es innecesaria.

El ajuste fino se realizo sobre el dataset `behavior-1k/2026-challenge-demos` para la tarea `turning_on_radio`, partiendo de `nvidia/GR00T-N1.7-3B`. No se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El contrato de observacion incluye RGB de cabeza (camara ZED oficial) y de ambas munecas (RealSense), con resolucion minima de 224 x 224 en formato HWC uint8, mas propiocepcion de 61 dimensiones en el orden oficial `PROPRIOCEPTION_INDICES["R1Pro"]`. La salida es un vector de 23 dimensiones compuesto por velocidad de base (3), torso (4), brazos (7+7) y pinzas (1+1); el wrapper convierte el vector de 61 dimensiones en grupos de estado de base, torso, brazo y pinza, y devuelve una accion de 23 dimensiones ensamblada temporalmente por cada paso del evaluador.

## Capacidades

- Control robotico de una tarea especifica: navegar hasta una radio domestica y manipular sus controles (rotar, pulsar) para encenderla.
- Percepcion visual multimodal con tres flujos RGB simultaneos (cabeza y munecas).
- Fusion de vision y propiocepcion de 61 dimensiones para producir acciones continuas de 23 dimensiones.
- Generacion de horizontes de accion de 16 pasos con ensamblado temporal para suavizar la ejecucion.
- Soporte de acciones de tipo rotate y push sobre objetos radio, dial y button.
- Integracion con el simulador OmniGibson mediante `openral deploy sim`, con validacion de cada slot de accion tipado a traves del kernel de seguridad y commit atomico de los seis slots como un unico paso.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, matematicas, generacion de codigo ni otros idiomas distintos del ingles.

## Casos de uso

- Evaluacion en el desafio BEHAVIOR-1K: ejecutar el checkpoint oficial de `turning_on_radio` contra el evaluador del benchmark para reproducir la puntuacion de referencia del organizador en el embodiment R1 Pro.
- Desarrollo de politicas bimanuales moviles: servir como linea base sobre la que comparar nuevos ajustes finos, gracias al contrato fijo de 61 dimensiones de estado y 23 de accion.
- Validacion de pipelines de cuantizacion: probar la carga en NF4 con sustitucion de `lm_head` por `Identity` para medir el impacto en memoria del host y en la latencia por chunk (presupuesto declarado de 1500 ms).
- Pruebas de integracion del kernel de seguridad: verificar que cada slot de accion tipado se valida antes del commit atomico de los seis slots en un paso de OmniGibson.
- Despliegue simulado con `openral deploy sim` y `robots/r1pro/robot.yaml`: publicar el estado nativo de 61 dimensiones del simulador a traves de WorldState y comprobar la cadena completa observacion-accion.
- Reproduccion de entornos: fijar el commit `ace36d9` de Isaac-GR00T y el sidecar Python 3.10 con `uv sync --frozen` para obtener resultados deterministas entre hosts.
- Investigacion en manipulacion de objetos articulados: estudiar el comportamiento del modelo ante diales y botones en escenas de salon domestico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es el presupuesto de latencia de 1500 ms por chunk de 16 pasos de accion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita (`min_vram_gb: null` en el manifiesto). El modelo base tiene aproximadamente 3,1 B de parametros y se carga en NF4, lo que situa el peso de los pesos en el rango de unos pocos GB, pero la cifra exacta no se documenta.
- Memoria de host: el adaptador aplica medidas orientadas a hosts de 8 GB (cuantizacion NF4 de lineales grandes y eliminacion del `lm_head`).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer concretas.
- Opciones de despliegue: sidecar Python 3.10 con `uv sync --frozen` sobre la rama `behavior` de `wensi-ai/Isaac-GR00T`, invocado desde OpenRAL mediante `openral behavior serve --rskill rskills/gr00t-n17-b1k-turning-on-radio`; simulacion con `openral deploy sim`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 1500 ms por chunk de 16 pasos (`latency_budget.per_chunk_ms`). Throughput no disponible.
- Requiere OpenRAL Pro para cargar el formato int4 (NF4); el runtime open source solo admite fp32, fp16 y bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-gr00t_n17-r1pro-turning_on_radio-bf16 | aprox. 3,1 B | no disponible | VLA especifica para `turning_on_radio` en R1 Pro simulado | NVIDIA Open Model License | Pesos no incluidos; checkpoint del organizador aparte; carga int4 requiere OpenRAL Pro |
| nvidia/GR00T-N1.7-3B | aprox. 3,1 B | no disponible | VLA general de proposito general | NVIDIA Open Model License | Pesos publicados en Hugging Face |
| Otros checkpoints del desafio BEHAVIOR-1K 2026 | no disponible | no disponible | Tareas especificas del benchmark | no disponible | Publicados en la pagina de baselines de BEHAVIOR |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad de tarea: la politica solo realiza `turning_on_radio`; no generaliza a otras tareas del benchmark ni a objetos fuera de radio, dial y button.
- Especificidad de embodiment: unicamente soporta el R1 Pro simulado con el contrato oficial de observacion y accion; no se declara soporte para otros robots.
- Dependencia de pesos externos: el repositorio no contiene los pesos; sin el checkpoint del organizador el paquete es inutilizable.
- Dependencia de OpenRAL Pro: la carga en int4 (NF4) exige el paquete de cuantizacion de pago; el runtime abierto solo admite fp32, fp16 y bf16.
- Idioma: solo ingles (`en`); no se documenta soporte multilingue.
- Contexto: la longitud de contexto no esta disponible, lo que impide evaluar el manejo de historiales largos.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de fallo; en politicas VLA el riesgo se manifiesta como acciones fisicamente invalidas o manipulaciones erroneas, mitigadas parcialmente por el kernel de seguridad y la validacion de slots.
- Restricciones de licencia: NVIDIA Open Model License, con terminos especificos del modelo base; debe revisarse antes de uso comercial.
- Entorno fijado: requiere el commit `ace36d9` de Isaac-GR00T y Python 3.10; desviarse de esta combinacion puede romper la reproducibilidad.
- Sin imagen de rollout local: no se incluye evidencia visual hasta que el checkpoint se reproduzca en el host.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-gr00t_n17-r1pro-turning_on_radio-bf16
- Repositorio OpenRAL (rSkill): https://github.com/OpenRAL/openral/tree/master/rskills/gr00t-n17-b1k-turning-on-radio/
- README del rSkill en GitHub: https://github.com/OpenRAL/openral/blob/master/rskills/gr00t-n17-b1k-turning-on-radio/README.md
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Codigo fuente upstream: https://github.com/wensi-ai/Isaac-GR00T/tree/ace36d935b376fbf25cd56371e23877b95407c40
- Dataset: https://huggingface.co/datasets/behavior-1k/2026-challenge-demos
- Paper: https://arxiv.org/abs/2503.14734
- Baselines del desafio BEHAVIOR: https://behavior.stanford.edu/challenge/baselines.html
- Galeria de tareas BEHAVIOR: https://behavior.stanford.edu/challenge/tasks/
