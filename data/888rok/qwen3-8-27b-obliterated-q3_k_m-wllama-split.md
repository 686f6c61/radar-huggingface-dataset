# 888rok/Qwen3.8-27B-OBLITERATED-Q3_K_M-wllama-split

## Resumen

Este repositorio contiene una versión empaquetada del modelo Qwen3.8-27B-OBLITERATED en formato GGUF cuantizado a Q3_K_M, dividido en ocho fragmentos de menos de 2 GB cada uno para permitir su carga en navegadores mediante la biblioteca wllama, que no puede descargar archivos individuales superiores a ese límite. El modelo base, desarrollado por OBLITERATUS, es una versión "abliterated" del Qwen3.8-27B de Alibaba, en la que se han eliminado las direcciones de negativa (refusal) del modelo original para reducir la censura y ampliar la libertad de generación.

El Qwen3.8-27B original es un modelo denso de 27 mil millones de parámetros, multimodal (visión y lenguaje), con una ventana de contexto nativa de 262 000 tokens y capacidades de razonamiento configurable. Esta versión cuantizada y fragmentada está pensada para ejecutarse íntegramente en el navegador, sin necesidad de GPU dedicada, aunque requiere aproximadamente 32 GB de memoria RAM libre según la model card. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

La relevancia de este empaquetado radica en que acerca un modelo de alto rendimiento (código, agentes, visión) a entornos de bajo coste y despliegue sencillo, como demos interactivas, prototipos o aplicaciones web que no pueden depender de servidores con GPU. Al ser una cuantización Q3_K_M, se sacrifica algo de fidelidad en la salida a cambio de un tamaño manejable (13,5 GB en disco).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (segun lmstudio.ai; otras fuentes indican 256 000) |
| Tipos de cuantizacion | Q3_K_M (este repo); el modelo base OBLITERATUS ofrece otras cuantizaciones GGUF |
| Idiomas soportados | No especificado en este repo; el Qwen3.8 original soporta multiples idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fragmentado en 8 shards para wllama) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura multimodal, capaz de procesar tanto texto como imágenes. Incorpora un mecanismo de razonamiento configurable que permite alternar entre modos de pensamiento rápido y profundo (similar a otros modelos de la familia Qwen). El entrenamiento del modelo original incluye datos masivos de texto e imágenes, aunque no se dispone de cifras exactas de tokens en la informacion disponible. La version abliterated, creada por OBLITERATUS, aplica una tecnica de eliminacion de direcciones de negativa sobre los pesos del modelo, lo que reduce la probabilidad de que el modelo se niegue a responder a ciertas solicitudes. Este repositorio no modifica los pesos: solo cuantiza a Q3_K_M y fragmenta el archivo GGUF resultante para compatibilidad con wllama.

## Capacidades

- Generacion de texto, razonamiento logico y matematico, y codificacion en multiples lenguajes de programacion.
- Entrada de imagenes (vision) para tareas como descripcion de escenas, OCR o analisis visual.
- Soporte de tool calling y function calling, lo que permite integrarlo en flujos de agente.
- Capacidad para tareas de agente de larga duracion (long-horizon agentic tasks), segun la documentacion oficial.
- Razonamiento configurable: puede operar en modo rapido o en modo de pensamiento profundo (thinking mode).
- Multilingue: el modelo original soporta una amplia variedad de idiomas, aunque no se detallan en este repo.
- Al ser una version abliterated, presenta menos restricciones de contenido que el modelo original, aunque esto conlleva riesgos (ver limitaciones).

## Casos de uso

- Asistente de codigo en el navegador: gracias a su capacidad de generacion de codigo y tool calling, puede integrarse en editores web o entornos de desarrollo en linea para autocompletar, revisar o explicar fragmentos de codigo.
- Analisis de imagenes sin GPU: permite subir capturas o fotografias desde el navegador y obtener descripciones o respuestas basadas en el contenido visual, util para aplicaciones de accesibilidad o documentacion.
- Chatbot de atencion al cliente con contexto largo: su ventana de 262 000 tokens permite mantener conversaciones extensas y recordar informacion de interacciones anteriores, adecuado para soporte tecnico o asistentes virtuales.
- Prototipado rapido de agentes: al soportar tool calling y razonamiento multi-paso, se puede construir un agente que consulte APIs, busque informacion o ejecute acciones, todo dentro de una pagina web.
- Herramienta educativa de razonamiento: su modo de pensamiento profundo puede desglosar problemas complejos paso a paso, util para tutoria en matematicas o ciencias.
- Generacion de contenido creativo sin restricciones: la version abliterated permite explorar temas que el modelo original podria rechazar, como escritura de ficcion con tematicas adultas o debates filosoficos controvertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantizacion especifica. El modelo original Qwen3.8-27B ha sido evaluado en tareas como MathVision, segun la documentacion oficial, pero no se proporcionan cifras concretas en los materiales consultados. Se recomienda consultar la ficha del modelo base para obtener datos de rendimiento, aunque hay que tener en cuenta que la cuantizacion Q3_K_M puede degradar ligeramente la precision en comparacion con el modelo en precision completa.

## Requisitos de hardware

- Para ejecucion en navegador con wllama: se necesitan aproximadamente 32 GB de RAM libre, segun la model card. No se requiere GPU, ya que la inferencia se realiza via WebAssembly.
- Para uso local con llama.cpp u otros motores GGUF: el archivo Q3_K_M ocupa 13,5 GB en disco, y la memoria necesaria (VRAM + RAM) rondara los 14-16 GB, dependiendo del contexto y el sistema operativo. Una GPU con 16 GB de VRAM (por ejemplo, RTX 4080 o superior) seria adecuada, aunque tambien puede ejecutarse solo en CPU con suficiente RAM.
- Opciones de despliegue: wllama (navegador), llama.cpp, Ollama, LM Studio, o servidores de inferencia compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no se dispone de datos medidos para esta cuantizacion; dependera del hardware y del tamaño del contexto. En navegador, la velocidad sera limitada por la CPU y la memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3 B | 262 000 | Apache-2.0 | Modelo base, precision completa, multimodal |
| Qwen3.8-2.4T-A95B (MoE) | 2,4 T totales, 95 B activos | 262 000 (estimado) | Apache-2.0 | Mezcla de expertos, mayor capacidad pero mas pesado |
| Llama 3.1 8B | 8 B | 128 000 | Llama 3.1 Community License | Menor tamano, menos capaz en vision y agentes |

Esta comparativa se basa en datos publicos de los respectivos modelos, pero no se dispone de benchmarks comparativos directos en la informacion proporcionada. La version abliterated y cuantizada de este repo se situa por debajo del original en calidad, pero mantiene las capacidades fundamentales a un coste de hardware mucho menor.

## Limitaciones y advertencias

- La cuantizacion Q3_K_M introduce perdida de precision, lo que puede manifestarse en errores de razonamiento, alucinaciones mas frecuentes o respuestas menos coherentes en tareas complejas.
- Al ser una version abliterated, el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita, ya que se han eliminado las barreras de rechazo. El uso en produccion debe contemplar filtros adicionales o moderacion humana.
- La ejecucion en navegador requiere una cantidad elevada de RAM (32 GB), lo que limita su uso a equipos de gama alta o servidores con mucha memoria.
- No se ha verificado la compatibilidad total con todas las funciones de wllama; aunque el empaquetado es estandar, pueden existir problemas con versiones antiguas del navegador o con WebAssembly deshabilitado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales derivadas de la version abliterated; se recomienda revisar los terminos de OBLITERATUS y de Alibaba.
- No se dispone de informacion sobre sesgos especificos de este modelo, pero al ser una derivacion de Qwen3.8, es probable que herede sesgos de los datos de entrenamiento originales, como preferencias culturales o de genero.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/888rok/Qwen3.8-27B-OBLITERATED-Q3_K_M-wllama-split
- Modelo base abliterated: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Documentacion de wllama: https://github.com/ngxson/wllama
- Pagina de LM Studio sobre Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
