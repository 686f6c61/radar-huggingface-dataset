# akshaykotish/martin-ai

## Resumen

Martin AI es un modelo de lenguaje publicado en Hugging Face por el usuario akshaykotish, distribuido unicamente en formato GGUF cuantizado a 4 bits (q4_0) con un tamano de repositorio de 4,6 GB. Segun su model card, se trata del modelo en dispositivo ("on-device") que utiliza la aplicacion de escritorio Martin (Martin Software) para planificar, escribir y editar sitios web completamente sin conexion. La model card indica que es un derivado de Gemma de Google y que se rige por los Gemma Terms of Use.

El dato de parametros registrado en safetensors asciende a 7.463.013.674, lo que situa al modelo en la clase de los 7B, coherente con el tamano de fichero GGUF de 4,6 GB en cuantizacion de 4 bits. No obstante, la model card no explicita la arquitectura, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento, por lo que buena parte de las especificaciones tecnicas debe marcarse como no disponible.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general publicado con documentacion tecnica, sino un artefacto de inferencia empaquetado para un producto de escritorio concreto que se ejecuta con llama.cpp sobre Metal en macOS y Vulkan/CUDA o CPU en Windows. Con 29 descargas y 0 likes en el momento de la consulta, su adopcion publica es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Gemma, segun la model card) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF 4 bits (q4_0); unico fichero publicado `martin-ai-q4_0.gguf` |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (https://ai.google.dev/gemma/terms) |
| Formato de pesos | GGUF (libreria: gguf) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. La model card unicamente declara que el modelo es un derivado de Google Gemma, lo que apunta a una familia de transformers decoder-only, pero no se confirma el tipo exacto de atencion, la variante concreta de Gemma (Gemma 1, 2 o 3), ni si se han introducido modificaciones estructurales. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO.

El unico dato tecnico verificable del proceso de publicacion es el empaquetado: un unico fichero GGUF en cuantizacion q4_0 de aproximadamente 4,6 GB, pensado para inferencia local con llama.cpp. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto orientada a planificacion, redaccion y edicion de sitios web, segun la descripcion del producto que lo integra.
- Ejecucion completamente offline en el dispositivo, sin llamadas a API externas.
- Conversacion multi-turno: el tag `conversational` figura entre los metadatos del repositorio.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el artefacto puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Edicion de sitios web asistida en local: el modelo se integra en la aplicacion Martin para generar y modificar HTML, CSS y textos de paginas, funcionando sin conexion y evitando enviar el contenido del proyecto a servidores externos.
- Prototipado de paginas en entornos sin red: al ejecutarse con llama.cpp sobre Metal, Vulkan/CUDA o CPU, permite generar borradores de sitios en equipos de desarrollo aislados o en situaciones de conectividad limitada.
- Privacidad de contenido sensible: al no requerir llamadas a servicios en la nube, resulta adecuado para redactar y editar material que no debe salir del equipo del usuario.
- Asistencia conversacional dentro de una aplicacion de escritorio: su naturaleza conversacional permite mantener dialogos de refinamiento iterativo sobre un mismo sitio (cambiar estructura, ajustar tono del copy, reorganizar secciones).
- Despliegue en estaciones de trabajo de gama media: con 4,6 GB en q4_0, el modelo puede cargarse en equipos con 8 GB de VRAM o incluso en CPU, lo que facilita su uso en portatiles sin GPU dedicada de gran capacidad.
- Evaluacion de modelos derivados de Gemma en formato GGUF: sirve como referencia practica para estudiar como se comporta un derivado cuantizado a 4 bits en tareas de generacion de codigo web dentro de un pipeline llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB solo para los pesos en q4_0; con cache KV y overhead de llama.cpp, un entorno practico ronda los 6-8 GB de memoria.
- GPU recomendadas: no se especifican modelos concretos. La model card menciona Apple Metal en Mac y Vulkan/CUDA en Windows.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070 en adelante); tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp es el runtime declarado; el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Martin AI (akshaykotish/martin-ai) | 7.463.013.674 | no disponible | Gemma Terms of Use | GGUF q4_0 | Hugging Face, 29 descargas |
| Gemma 7B (Google) | 7B aprox. | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF | Amplia, con model card detallada |
| Mistral 7B | 7,3B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Amplia |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Amplia |

La comparacion con alternativas es estructural: Martin AI es un derivado de Gemma sin documentacion tecnica publica, mientras que los modelos de referencia de la misma clase (7-8B) publican arquitectura, contexto, datos de entrenamiento y evaluaciones. La licencia Gemma impone ademas restricciones de uso comercial que Apache 2.0 no aplica.

## Limitaciones y advertencias

- Documentacion tecnica practicamente inexistente: no se publican arquitectura, contexto, idiomas, datos de entrenamiento ni evaluaciones, lo que impide validar su calidad de forma independiente.
- Sesgos conocidos: no disponibles; al derivar de Gemma, hereda los sesgos del modelo base, pero no se documenta ningun analisis al respecto.
- Riesgo de alucinacion: no cuantificado. En tareas de generacion de codigo web, la ausencia de evaluaciones hace recomendable la revision humana de cualquier salida.
- Limitaciones de contexto e idioma: no disponibles; no se puede confirmar el soporte de castellano ni la ventana maxima de contexto.
- Cuantizacion unica en q4_0: al ser la unica variante publicada, no hay alternativa de mayor precision si la calidad resulta insuficiente.
- Restricciones de licencia: se rige por los Gemma Terms of Use, que incluyen condiciones especificas para uso comercial y redistribucion; es obligatorio revisarlas antes de integrar el modelo en un producto.
- Adopcion minima: 29 descargas y 0 likes indican ausencia de validacion por parte de la comunidad; no hay evidencia de uso en produccion fuera de la aplicacion Martin.
- Caveat de produccion: al estar empaquetado como artefacto de una aplicacion concreta, su comportamiento esta calibrado para el caso de uso de edicion web y no debe asumirse como modelo generalista.

## Enlaces

- Hugging Face: https://huggingface.co/akshaykotish/martin-ai
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
