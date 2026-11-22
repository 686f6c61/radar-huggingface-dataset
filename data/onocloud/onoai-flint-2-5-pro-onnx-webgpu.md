# onocloud/onoai-flint-2.5-pro-ONNX-WebGPU

## Resumen

OnoAI Flint 2.5 Pro (ONNX/WebGPU) es una distribución del modelo de lenguaje OnoAI Flint 2.5 Pro, publicada por OnoCloud en formato ONNX optimizado para ejecución en navegador mediante WebGPU a través de la librería Transformers.js. El modelo está pensado para inferencia en el propio dispositivo del usuario (edge AI), sin necesidad de servidores dedicados ni claves de API externas, lo que permite desplegar asistentes de texto generativo directamente en aplicaciones web.

El repositorio se distribuye bajo la licencia propietaria "onocloud-sovereign-license" y el acceso está restringido: es necesario aceptar las condiciones en Hugging Face antes de poder descargar los pesos. La información pública disponible no incluye detalles sobre arquitectura interna, número de parámetros, longitud de contexto ni datos de entrenamiento, por lo que varios apartados de esta ficha se marcan explícitamente como "no disponible".

Los idiomas declarados son árabe (ar) e inglés (en), lo que posiciona al modelo como una opción bilingüe para mercados de Oriente Medio y aplicaciones globales en inglés. Su relevancia actual radica en el formato ONNX/WebGPU, que facilita la ejecución acelerada por GPU del navegador sin instalación local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX; variantes concretas no publicadas) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | onocloud-sovereign-license (propietaria, acceso restringido) |
| Formato de pesos | ONNX (optimizado para WebGPU via Transformers.js) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo (si es un transformer denso, un modelo MoE, una arquitectura hibrida u otra variante), ni sobre el numero de tokens de entrenamiento, la composicion del dataset o las tecnicas de alineacion empleadas (RLHF, DPO, etc.). La unica informacion tecnica verificable es su empaquetado en ONNX para su ejecucion con Transformers.js sobre WebGPU, lo que implica que el modelo ha sido exportado y optimizado para inferencia en navegador.

Tampoco se detalla si el modelo base Flint 2.5 Pro dispone de innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento extendido, etc.). Cualquier afirmacion al respecto debe considerarse no verificada.

## Capacidades

- Generacion de texto en arabe e ingles, segun los idiomas declarados en la model card.
- Inferencia en navegador mediante Transformers.js y WebGPU, sin dependencia de servidores backend.
- Integracion con el pipeline `text-generation` de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistentes de escritura en aplicaciones web: el modelo puede integrarse en editores o formularios para generar, reescribir o resumir texto en ingles y arabe directamente en el cliente, evitando enviar datos del usuario a un servidor.
- Chatbots embebidos en sitios web: al ejecutarse con WebGPU en el navegador, permite ofrecer atencion al cliente bilingue sin costes de inferencia en la nube, siempre que el hardware del visitante lo soporte.
- Herramientas de traduccion o adaptacion de contenido entre ingles y arabe en entornos con requisitos de privacidad, ya que el procesamiento ocurre en el dispositivo.
- Prototipado rapido de aplicaciones de IA generativa: Transformers.js permite cargar el modelo con pocas lineas de JavaScript, lo que agiliza demos y pruebas de concepto.
- Aplicaciones educativas offline o con conectividad limitada, donde el modelo puede empaquetarse junto con la aplicacion web y funcionar sin red una vez descargado.
- Procesamiento de documentos sensibles en el navegador (resumen, extraccion de entidades, reescritura) en sectores regulados que no permiten enviar datos a APIs externas.
- Distribucion de asistentes de texto en regiones donde el arabe es idioma principal, aprovechando el soporte bilingue declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al no conocerse el numero de parametros ni las variantes de cuantizacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamano del modelo y de la implementacion WebGPU del navegador (Chrome/Edge con soporte WebGPU habilitado).
- Opciones de despliegue: Transformers.js en navegador con WebGPU; el formato ONNX tambien podria ejecutarse con ONNX Runtime en otros entornos, aunque no se documenta oficialmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato navegador |
|---|---|---|---|---|---|
| OnoAI Flint 2.5 Pro (ONNX/WebGPU) | no disponible | no disponible | ar, en | Propietaria (acceso restringido) | ONNX + WebGPU |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido: es necesario solicitar acceso y aceptar la licencia "onocloud-sovereign-license" en Hugging Face antes de descargar los pesos.
- Licencia propietaria: las condiciones de uso comercial no estan detalladas en la informacion disponible; deben revisarse en el repositorio antes de cualquier despliegue en produccion.
- Ausencia de datos tecnicos publicos: no se conocen parametros, contexto, datos de entrenamiento ni evaluaciones, lo que dificulta estimar calidad, sesgos o riesgos de alucinacion.
- Cobertura linguistica limitada a arabe e ingles; no se declara soporte para castellano ni otros idiomas.
- Ejecucion en navegador sujeta a la disponibilidad de WebGPU, que varia segun navegador, sistema operativo y hardware del usuario.
- Riesgo de sesgos y alucinaciones: no evaluado en la informacion disponible.
- Sin descargas ni interacciones registradas en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/onocloud/onoai-flint-2.5-pro-ONNX-WebGPU
- Transformers.js: https://github.com/huggingface/transformers.js
- WebGPU (MDN): https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
