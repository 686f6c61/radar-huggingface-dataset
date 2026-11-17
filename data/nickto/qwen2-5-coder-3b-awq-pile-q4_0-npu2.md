# nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-NPU2

## Resumen

Este repositorio contiene una cuantizacion especifica de Qwen2.5-Coder-3B, el modelo de codigo de 3.000 millones de parametros desarrollado por Alibaba Cloud (equipo Qwen). No es un modelo nuevo, sino un artefacto de despliegue optimizado por el usuario nickto para ejecutar completado de codigo fill-in-the-middle (FIM) sobre la NPU AMD XDNA 2 integrada en los procesadores Ryzen AI 300. El paquete aplica escalado AWQ calibrado sobre The Pile antes de una cuantizacion Q4_0, convierte los pesos al formato propietario q4nx de FastFlowLM y los reordena al byte order de ese runtime.

La relevancia de esta publicacion es practica: demuestra que una cuantizacion Q4_0 convencional de este modelo resulta inutilizable sobre la NPU (5,3 % de pass@1 en SAFIM control), mientras que la variante con AWQ recupera 54,7 %, un valor cercano al 60,7 % del modelo F16 sin cuantizar en llama.cpp. Ademas, el autor anade los tokens FIM (151659-151664) a los identificadores de fin de secuencia y sustituye la plantilla de chat por una pass-through, de modo que las peticiones FIM llegan al modelo sin envolver.

El modelo hereda del base una ventana de contexto de 32.768 tokens y licencia Qwen Research, restringida a uso no comercial. El repositorio ocupa 2,6 GB y no incluye kernels: reutiliza los de `Qwen2.5-3B-Instruct-NPU2` de FastFlowLM. Fue creado el 17 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), cuantizado con AWQ + Q4_0 y empaquetado en q4nx |
| Parametros totales | 3.000 millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-Coder-3B) |
| Tipos de cuantizacion | Q4_0 con escalado AWQ calibrado sobre The Pile; formato q4nx de FastFlowLM |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Qwen Research License Agreement (uso no comercial) |
| Formato de pesos | q4nx (formato propietario de FastFlowLM, derivado de GGUF); no se publican safetensors ni GGUF en este repo |
| Tamano del repositorio | 2,6 GB |
| Runtime objetivo | FastFlowLM (FLM) 1.0.11 sobre NPU AMD XDNA 2 |
| Tokens especiales | FIM (151659-151664) anadidos a los ids de fin de secuencia |
| Plantilla de chat | pass-through (sin envoltorio) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-3B, un transformer decoder-only denso de la familia Qwen2.5, entrenado por Alibaba Cloud con un corpus orientado a codigo y con soporte nativo de tokens FIM. Esta publicacion no reentrena ni afina el modelo: parte de los pesos originales y aplica una cadena de transformaciones de despliegue. Primero realiza un escalado AWQ (Activation-aware Weight Quantization) con calibracion sobre The Pile, que preserva los canales de activacion mas sensibles antes de reducir precision. Despues cuantiza a Q4_0 con `llama-quantize --pure`, convierte el resultado al formato q4nx de FastFlowLM y lo reordena al byte order que espera ese runtime.

Las modificaciones funcionales son dos. Por un lado, los tokens FIM se anaden a la lista de end-of-sequence, de forma que una completacion termina donde termina el hueco intermedio en lugar de continuar generando. Por otro, se instala una plantilla de chat pass-through para que los prompts FIM lleguen al modelo sin transformacion. El autor documenta explicitamente que un Q4_0 sin AWQ rinde alrededor de 5 % de pass@1 en SAFIM control sobre FLM, lo que convierte el escalado AWQ en el elemento critico de esta build. No se proporcionan datos sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO, ya que corresponden al modelo base y no se detallan en esta model card.

## Capacidades

- Completado de codigo fill-in-the-middle (FIM) con los tokens `<|fim_prefix|>`, `<|fim_suffix|>` y `<|fim_middle|>`, que es el caso de uso principal y el unico validado por el autor.
- Generacion de texto y conversacion, heredadas del modelo base Qwen2.5-Coder-3B (tag `conversational` y pipeline `text-generation`).
- Generacion de codigo en multiples lenguajes de programacion, segun las capacidades del modelo base.
- Razonamiento sobre codigo y matematicas basicas, limitado por el tamano de 3.000 millones de parametros.
- Servicio mediante API compatible con OpenAI (`/v1/completions`) a traves de `flm serve`.
- Ejecucion sobre NPU AMD XDNA 2 sin GPU dedicada, lo que permite completado de codigo en portatiles con Ryzen AI 300.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.

## Casos de uso

- Autocompletado de codigo en el editor: el modelo acepta prompts FIM con prefijo y sufijo y devuelve el fragmento intermedio, lo que permite integrarlo como motor de sugerencias inline en IDE o editores con plugin LSP. Es el escenario para el que fue construido y el unico con metricas publicadas.
- Completado local en portatiles sin GPU: al ejecutarse sobre la NPU XDNA 2 de un Ryzen AI 300, libera la CPU y la GPU integrada para el resto del sistema, con un consumo energetico inferior al de una GPU dedicada.
- Relleno de funciones incompletas en refactorizaciones: dado un cuerpo de funcion con un hueco marcado entre `<|fim_prefix|>` y `<|fim_suffix|>`, el modelo propone la implementacion coherente con el contexto circundante.
- Generacion de tests unitarios a partir de firmas de funcion: usando el prefijo con la firma y el sufijo con el codigo de llamada, se puede obtener un esqueleto de test que respete la interfaz.
- Asistencia en documentacion tecnica de APIs: completar ejemplos de uso de una libreria a partir de la firma y del contexto del manual, con la ventaja de que el modelo base esta entrenado sobre codigo real.
- Prototipado de pipelines de IA en el borde: servir el modelo con `flm serve` y consumirlo desde scripts o herramientas CLI mediante HTTP, util para entornos sin acceso a la nube por requisitos de privacidad del codigo.
- Educacion y experimentacion con cuantizacion en NPU: el repositorio documenta la cadena completa AWQ -> Q4_0 -> q4nx y los resultados comparados, lo que sirve como referencia para quien quiera replicar el proceso con otros modelos.

## Benchmarks y rendimiento

El autor publica resultados de SAFIM pass@1 en porcentaje para tres variantes de prompt (control, block y api), comparando esta build con las mismas pesos en otros runtimes y con el modelo sin cuantizar.

| Build | Runtime | pass@1 control | pass@1 block | pass@1 api |
|---|---|---|---|---|
| Este modelo (AWQ + Q4_0, q4nx) | FLM sobre NPU | 54,7 | 39,5 | 65,5 |
| Los mismos pesos en GGUF | llama.cpp | 56,4 | 42,0 | 64,5 |
| F16 sin cuantizar | llama.cpp | 60,7 | 47,8 | 67,4 |
| Q4_0 sin AWQ | FLM sobre NPU | 5,3 | 3,9 | 18,1 |

La lectura principal es que la cuantizacion AWQ recupera casi toda la precision del F16 en el escenario control (54,7 frente a 60,7, una perdida de 6 puntos) y que el runtime FLM sobre NPU queda a menos de 2 puntos del mismo peso ejecutado en llama.cpp. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- NPU AMD XDNA 2 obligatoria: procesadores Ryzen AI 300 o posteriores. El modelo no funciona en GPU ni CPU con este runtime.
- FastFlowLM instalado de forma nativa, probado unicamente con la version 1.0.11.
- No se incluyen kernels en el repositorio: se reutilizan los de `Qwen2.5-3B-Instruct-NPU2`, que deben seleccionarse explicitamente con `--xclbin-from`.
- Espacio en disco: 2,6 GB para los pesos, mas el espacio de los kernels de FLM.
- VRAM estimada: no aplica, ya que la inferencia ocurre en la NPU y no en memoria de GPU. No se documenta el consumo de memoria del sistema.
- No cabe ni esta pensado para GPU consumer (RTX 4090, etc.) ni para despliegue con vLLM, TGI, llama.cpp u Ollama en esta configuracion; el autor solo valida FLM.
- Instalacion mediante el instalador comunitario `flm-add` (paquete de PyPI) o registro manual copiando la carpeta a `~/.config/flm/models/` y enlazando los xclbins.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-NPU2) | 3B | 32.768 | q4nx / FLM en NPU XDNA 2 | Qwen Research (no comercial) | SAFIM control 54,7 %; requiere NPU Ryzen AI 300 |
| Qwen/Qwen2.5-Coder-3B (base) | 3B | 32.768 | safetensors / transformers, vLLM | Qwen Research (no comercial) | Referencia sin cuantizar; SAFIM F16 control 60,7 % en llama.cpp |
| Mismos pesos en GGUF (Q4_0) | 3B | 32.768 | GGUF / llama.cpp | Qwen Research (no comercial) | SAFIM control 56,4 %; ejecutable en CPU y GPU consumer |
| Qwen2.5-Coder-3B-Instruct-NPU2 (kernels de FLM) | 3B | no disponible | q4nx / FLM en NPU XDNA 2 | no disponible | Proporciona los kernels que reutiliza esta build; orientado a instrucciones, no a FIM |

No se dispone de datos para comparar con alternativas de otros fabricantes en el mismo rango de tamano y mismo objetivo FIM dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente no comercial. Cualquier despliegue en producto o servicio comercial requiere licencia aparte de Alibaba Cloud.
- Dependencia dura de hardware: solo funciona en NPU AMD XDNA 2 (Ryzen AI 300 o superior) con FastFlowLM, y el autor solo lo ha probado con FLM 1.0.11. Cambios de version del runtime pueden romper la compatibilidad.
- Los kernels no se incluyen en el repositorio y deben tomarse de `Qwen2.5-3B-Instruct-NPU2`; un emparejamiento incorrecto o el uso de la etiqueta por defecto puede provocar fallos silenciosos.
- La cuantizacion Q4_0 sin AWQ es practicamente inutilizable en este runtime (5,3 % de pass@1 en control), por lo que no debe sustituirse por una cuantizacion estandar.
- El modelo esta optimizado y validado para FIM; su comportamiento en chat conversacional generico no se ha evaluado en esta build.
- Al ser un modelo de 3.000 millones de parametros, es propenso a errores en razonamiento complejo, matematicas avanzadas y generacion de codigo en tareas de largo alcance.
- Riesgo de alucinacion en APIs, funciones y librerias poco comunes, inherente al modelo base y no mitigado por la cuantizacion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- El repositorio no registra descargas ni validacion de la comunidad en el momento de redactar esta ficha; conviene tratarlo como un artefacto experimental de un autor individual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B/blob/main/LICENSE
- FastFlowLM: https://fastflowlm.com
- Instalador `flm-add` en PyPI: https://pypi.org/project/flm-add/
- Codigo y pipeline del autor: https://gitlab.com/nickto/fim-in-flm
- Commit de referencia: https://gitlab.com/nickto/fim-in-flm/-/tree/21ba261
- Resultados y descartes (FINDINGS.md): https://gitlab.com/nickto/fim-in-flm/-/blob/21ba261/FINDINGS.md
- Entrada de blog del autor: https://blog.nickto.net/2026-11-17-get-inline-suggestions-from-a-model-on-an-amd-npu/
- SAFIM (benchmark FIM): https://github.com/gonglinyuan/safim
