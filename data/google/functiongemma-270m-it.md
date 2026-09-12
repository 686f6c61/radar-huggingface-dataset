# google/functiongemma-270m-it

## Resumen

FunctionGemma 270M IT es un modelo de lenguaje de 268.098.176 parámetros (aproximadamente 270 millones) desarrollado por Google y publicado en HuggingFace con el identificador `google/functiongemma-270m-it`. Se trata de la variante ajustada por instrucciones de FunctionGemma, un modelo especializado en function calling (llamada a funciones y uso de herramientas) construido sobre la arquitectura `gemma3_text` de la familia Gemma 3. El repositorio ocupa 0,9 GB y la etiqueta de arquitectura y el recuento de parámetros coinciden con los de Gemma 3 270M, lo que sitúa al modelo en esa familia.

El problema que aborda es concreto: transformar lenguaje natural en llamadas a funciones estructuradas de forma fiable y con latencia baja, sin depender de modelos de decenas de miles de millones de parámetros. Esto resulta relevante ahora porque los agentes locales, los asistentes móviles y las integraciones de herramientas dentro de aplicaciones necesitan modelos que quepan en memoria reducida y que puedan ejecutarse en el propio dispositivo.

El acceso al modelo está restringido (gated): es necesario aceptar las condiciones de la licencia Gemma en HuggingFace. En el momento de la consulta acumula 24.500 descargas y 1.074 likes, con última actualización el 14 de enero de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en `gemma3_text` (familia Gemma 3) |
| Parametros totales | 268.098.176 (≈270 M) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No especificados en la informacion proporcionada; al distribuirse en safetensors puede cuantizarse a 8 y 4 bits con herramientas estandar (llama.cpp, bitsandbytes) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Gemma (Gemma Terms of Use), con acceso restringido (gated) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,9 GB |
| Etiquetas destacadas | transformers, safetensors, gemma3_text, text-generation, gemma3, gemma, functiongemma, conversational, text-generation-inference, endpoints_compatible |
| Descargas / likes | 24.500 / 1.074 |
| Fecha de creacion | 8 de octubre de 2025 |
| Ultima actualizacion | 14 de enero de 2026 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only correspondiente a `gemma3_text`, la pila de texto de Gemma 3. Esta familia se caracteriza por el uso de normalizacion RMSNorm, embeddings rotatorios (RoPE) y un esquema de atencion que combina ventanas deslizantes locales con capas de atencion global intercaladas, lo que reduce el coste de memoria asociado al contexto largo. El modelo es exclusivamente de texto: no incorpora torre de vision ni de audio. La configuracion concreta de capas, cabezas de atencion y ventana deslizante no se detalla en la informacion proporcionada.

En cuanto al entrenamiento, FunctionGemma 270M IT es la variante ajustada por instrucciones de FunctionGemma, orientada especificamente a la generacion de llamadas a funciones. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje por refuerzo con recompensas de ejecucion de herramientas. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion lineal.

## Capacidades

- Generacion de texto conversacional en modo instrucciones, adecuada para dialogos de tarea corta.
- Function calling / tool calling: genera llamadas a funciones con nombre de funcion y argumentos, el proposito principal del modelo.
- Salida estructurada: produccion de objetos tipo JSON aptos para ser parseados por un orquestador externo.
- Integracion en flujos de agente: puede encadenarse en bucles multi-paso, siempre que el orquestador gestione el estado, la validacion de argumentos y la ejecucion de las herramientas.
- Ejecucion local y sin conexion: por su tamano, es viable en dispositivo (movil, portatil, equipos edge).
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles, segun las etiquetas del repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking), vision y audio: no disponibles; el modelo es text-only.

## Casos de uso

- Asistente movil on-device: el modelo traduce la peticion del usuario en llamadas a APIs del sistema (calendario, contactos, configuracion) sin enviar datos a la nube, gracias a sus 270 M de parametros y a un peso en 4 bits del orden de 150-300 MB.
- Enrutado de intenciones en backends: clasificar la peticion entrante y emitir la llamada a la herramienta interna correspondiente antes de delegar en un modelo mayor para la respuesta final, reduciendo coste y latencia en la primera fase.
- Automatizacion de hogar conectado: interpretacion de ordenes en lenguaje natural y generacion de comandos estructurados para dispositivos compatibles, ejecutandose en un hub local sin dependencia de red.
- Plugins de IDE y herramientas de linea de comandos: conversion de instrucciones como "crea una rama y abre una pull request" en llamadas a la API de Git o del sistema de CI/CD.
- Extraccion de parametros estructurados: paso de texto libre (correos, formularios, tickets) a un esquema JSON con campos definidos, util como etapa de normalizacion previa a un ERP o CRM.
- Atencion al cliente con herramientas: el modelo selecciona la funcion adecuada (consulta de pedido, cancelacion, cambio de direccion) dentro de un flujo con RAG, dejando la redaccion final a un modelo mayor si se requiere.
- Sistemas embebidos e IoT: agentes de control en dispositivos con CPU modesta o GPU integrada, donde no es viable desplegar un modelo de miles de millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos): aproximadamente 0,54 GB en fp16/bf16, unos 0,27 GB en int8 y del orden de 0,15-0,30 GB en cuantizaciones de 4 bits.
- VRAM estimada con overhead de inferencia: en torno a 1-1,5 GB en fp16 y menos de 1 GB en 4 bits, incluyendo cache KV para contextos moderados.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo esta muy por debajo de las capacidades de estas tarjetas, por lo que el cuello de botella sera la latencia de orquestacion, no la memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, asi como en iGPU modernas y en CPU sola.
- Despliegue movil y edge: viable mediante runtimes de inferencia en dispositivo (por ejemplo, las herramientas de Google para Android); no se detallan en la informacion proporcionada los formatos concretos publicados por el autor.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp y Ollama con conversiones GGUF generadas por la comunidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Nota: los datos de los modelos comparados proceden de sus fichas publicas; los valores no verificados se marcan como no disponibles. No se dispone de resultados de benchmark verificados para ninguno de ellos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Acceso | Enfoque principal |
|---|---|---|---|---|---|
| google/functiongemma-270m-it | 268.098.176 | No disponible | Gemma Terms of Use | Restringido (gated) | Function calling y tool use |
| google/gemma-3-270m-it | ≈270 M (misma base) | No disponible | Gemma Terms of Use | Restringido (gated) | Instrucciones generales, texto |
| Qwen/Qwen3-0.6B | ≈0,6 B | No disponible | Apache 2.0 | Abierto | Instrucciones generales, razonamiento y codigo |
| meta-llama/Llama-3.2-1B-Instruct | ≈1,24 B | No disponible | Llama 3.2 Community License | Restringido (gated) | Instrucciones generales y tool use |

Diferencias clave: FunctionGemma es el unico de los cuatro explicitamente especializado en function calling y el de menor tamano, lo que reduce el coste de despliegue a cambio de una menor capacidad de razonamiento general. Qwen3-0.6B ofrece licencia Apache 2.0 sin restricciones de acceso, mientras que FunctionGemma y Llama 3.2 exigen aceptar condiciones. No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion de funciones: puede emitir nombres de funcion o argumentos inexistentes o mal tipados. Es imprescindible validar la salida contra un esquema y rechazar llamadas no conformes antes de ejecutarlas.
- Tamano reducido: con 270 M de parametros, su conocimiento factual y su capacidad de razonamiento complejo son limitados; no es un sustituto de un modelo grande para tareas abiertas.
- Idiomas: no se documenta el reparto de idiomas del entrenamiento ni el soporte multilingue, por lo que su comportamiento fuera del ingles no esta garantizado.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; en conversaciones largas el rendimiento puede degradarse y conviene verificar el limite real antes de disenar un flujo de agente.
- Sesgos: hereda los sesgos presentes en los datos de entrenamiento de la familia Gemma; no se documentan evaluaciones de sesgo especificas para esta variante.
- Licencia: el uso comercial esta permitido bajo los Gemma Terms of Use, que imponen obligaciones de distribucion de los terminos, politica de uso aceptable y ciertas restricciones de uso; es necesario revisar el texto completo antes de un despliegue en produccion.
- Acceso: el repositorio esta restringido y requiere aceptar las condiciones en HuggingFace, lo que afecta a la automatizacion de descargas en pipelines.
- Produccion: no debe usarse como unico componente de decision. Necesita orquestador, validador de esquemas, control de errores y limites de ejecucion de herramientas.
- No dispone de vision, audio ni modo de razonamiento explicito, segun la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/google/functiongemma-270m-it
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los resultados obtenidos correspondian a paginas generales del buscador y no contenian informacion tecnica, papers, blogs ni repositorios asociados. Por tanto, no se pueden facilitar enlaces adicionales verificados.
