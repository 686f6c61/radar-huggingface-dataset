# onocloud/onoai-basalt-2.5-pro-ONNX-WebGPU

## Resumen

OnoAI Basalt 2.5 Pro es un modelo de generacion de texto desarrollado por OnoCloud, distribuido en formato ONNX y optimizado para ejecucion en navegador mediante WebGPU a traves de la libreria `onnxruntime-genai`. El identificador del repositorio (`onoai-basalt-2.5-pro-ONNX-WebGPU`) y sus etiquetas indican que se trata de la variante cuantizada y empaquetada para inferencia local en el cliente, orientada especificamente a generacion de codigo (etiqueta `code-generation`) y a un producto interno denominado `flowcode`.

El modelo esta publicado bajo la licencia propietaria `onocloud-sovereign-license` y el acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos. Los idiomas declarados son ingles y arabe. El repositorio ocupa 5,2 GB, lo que sugiere un modelo de talla media-alta cuantizado para reducir el peso de los pesos en el navegador, aunque no se especifica el numero exacto de parametros en la informacion disponible.

La relevancia de esta ficha es doble: por un lado, documenta una propuesta de despliegue de LLM completamente en el cliente (in-browser) sin servidor, algo poco comun y tecnicamente interesante para aplicaciones web con requisitos de privacidad; por otro, advierte de las limitaciones de informacion: no hay datos publicos de arquitectura, entrenamiento ni benchmarks, y la licencia restringe el uso comercial sin consulta previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer decoder-only por la pipeline text-generation, sin confirmacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo esta en formato ONNX para WebGPU; se desconoce el esquema exacto de cuantizacion) |
| Idiomas soportados | ingles (en), arabe (ar) |
| Licencia | onocloud-sovereign-license (propietaria, acceso restringido) |
| Formato de pesos | ONNX (onnxruntime-genai), optimizado para WebGPU |
| Tamano del repositorio | 5,2 GB |
| Pipeline | text-generation |
| Libreria | onnxruntime-genai |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la informacion disponible. Las etiquetas del repositorio (`onnxruntime-genai`, `onnx`, `webgpu`) describen el formato de exportacion y el runtime de inferencia, no la arquitectura del modelo original. La pipeline declarada es `text-generation` y las etiquetas `conversational` y `code-generation` apuntan a un modelo de lenguaje causal afinado para dialogo y codigo, pero no se confirma si es un transformer denso, un MoE o una arquitectura hibrida.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica innovacion documentable es el propio empaquetado: la exportacion a ONNX con `onnxruntime-genai` y la compilacion para WebGPU permiten ejecutar el modelo dentro de un navegador compatible, lo que implica una estrategia de despliegue edge/client-side en lugar de servidor. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional en ingles y arabe, segun los idiomas declarados en el repositorio.
- Generacion de codigo: la etiqueta `code-generation` y el producto asociado `flowcode` indican un enfoque en asistencia a programacion, aunque no se detalla que lenguajes cubre.
- Ejecucion en navegador mediante WebGPU: el modelo esta empaquetado para `onnxruntime-genai`, lo que permite inferencia local en el cliente sin backend.
- Modo conversacional multi-turno: la etiqueta `conversational` sugiere soporte de dialogos, si bien no se especifica la ventana de contexto efectiva.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el repositorio es exclusivamente de texto.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente de codigo en el navegador: al ejecutarse con `onnxruntime-genai` sobre WebGPU, el modelo puede integrarse en un IDE web o en un editor online para autocompletado y generacion de fragmentos de codigo sin enviar el codigo del usuario a un servidor, lo que resulta adecuado para entornos con requisitos de privacidad.
- Demo publica sin coste de inferencia en servidor: al correr en el cliente, el coste de GPU recae en el usuario, lo que permite ofrecer una demo de chat o de generacion de codigo en una pagina web sin infraestructura de inferencia propia.
- Aplicaciones de escritorio web (PWA) con IA offline: una vez descargados los 5,2 GB de pesos, la aplicacion puede funcionar sin conexion para tareas de generacion de texto y codigo en ingles o arabe.
- Soporte bilingue ingles-arabe en herramientas internas: para equipos que trabajan con documentacion o codigo en ambos idiomas, el modelo puede emplearse en tareas de resumen, explicacion de fragmentos o generacion de comentarios, siempre que se valide la calidad real en arabe, no documentada.
- Prototipado de productos `flowcode`: la etiqueta sugiere que el modelo forma parte de un producto de generacion de codigo de OnoCloud; puede usarse para evaluar la viabilidad de flujos de generacion de codigo en el cliente antes de integrar una version de servidor.
- Educacion y sandbox de pruebas de LLM en navegador: util para investigacion sobre latencia, consumo de memoria y calidad de inferencia WebGPU en modelos de talla media, ya que el formato ONNX permite medir el rendimiento real en hardware de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repositorio ocupa 5,2 GB, por lo que se necesita al menos ese espacio de almacenamiento y una cantidad de memoria grafica del mismo orden para cargar los pesos, aunque el esquema exacto de cuantizacion no se especifica.
- GPU recomendadas: al estar orientado a WebGPU, el modelo depende de la implementacion de WebGPU del navegador. Se espera que funcione en GPUs de escritorio recientes (por ejemplo, gama RTX 30/40 de NVIDIA, Radeon RX 6000/7000 de AMD) y en GPUs integradas modernas, pero no hay datos oficiales de compatibilidad ni de rendimiento.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio, pero no hay confirmacion oficial ni lista de modelos validados.
- Opciones de despliegue: `onnxruntime-genai` con backend WebGPU en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que el formato es ONNX especifico para WebGPU.
- Latencia y throughput: no disponibles. Dependen del hardware del cliente, del navegador y de la implementacion de WebGPU, y no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de arquitectura que permitan una comparacion rigurosa con alternativas. Como referencia cualitativa, existen otros modelos empaquetados para inferencia en navegador (por ejemplo, variantes ONNX/WebGPU de modelos abiertos de talla pequena y media), pero sin datos de benchmarks de Basalt 2.5 Pro no es posible establecer una comparacion numerica.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es de descarga libre.
- Licencia propietaria: `onocloud-sovereign-license` no es una licencia open source; el uso comercial, la redistribucion y la modificacion estan sujetos a los terminos de OnoCloud, que no se detallan en la informacion disponible. Es imprescindible revisar la licencia antes de cualquier uso en produccion.
- Idiomas limitados: solo se declaran ingles y arabe; no hay soporte documentado de castellano ni de otros idiomas.
- Sin datos de arquitectura ni entrenamiento: no es posible evaluar sesgos, calidad de alineacion ni riesgo de alucinacion mas alla de lo generico en modelos de lenguaje.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Contexto desconocido: se desconoce la longitud de contexto, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Dependencia de WebGPU: el rendimiento y la compatibilidad dependen del navegador y del hardware del cliente; la experiencia puede variar y no hay soporte oficial documentado para todos los entornos.
- Tamano de descarga elevado: 5,2 GB por cliente, lo que puede ser inviable en conexiones lentas o dispositivos con poco almacenamiento.
- Sin adopcion publica: 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso en produccion ni reportes de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/onocloud/onoai-basalt-2.5-pro-ONNX-WebGPU
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
