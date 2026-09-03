# apartejs/aparte-titler

## Resumen

aparte-titler es un modelo de clasificación de tokens (token-classification) desarrollado por el proyecto aparté (apartejs) que genera títulos de conversaciones extrayendo de 3 a 6 palabras del primer mensaje del usuario, en orden, sin necesidad de llamadas a API ni infraestructura externa. Está diseñado para ejecutarse íntegramente en el navegador, en Node o en Python, con un peso mínimo: el modelo completo para 17 idiomas europeos ocupa 133 KB en cuantización int3, y existe una variante por idioma de solo 40 KB. El modelo es destilado de un LLM (gemma 4 e2b, 2.4 GB) y alcanza aproximadamente el 92 % de su rendimiento en el benchmark de referencia, con una fracción mínima del coste computacional.

Su relevancia radica en que resuelve un problema práctico —el titulado automático de conversaciones— con una huella de recursos insignificante, sin depender de servicios en la nube y con una propiedad de seguridad destacable: al limitarse a copiar palabras del mensaje original, es inmune a prompt injection por construcción, ya que una instrucción oculta en el texto solo puede producir un título deficiente, nunca ejecutarse. El modelo está disponible bajo licencia MIT, con formatos binarios propios (`.bin`) y grafos ONNX, y se integra en el ecosistema de componentes web de aparté.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de token-classification con BPE, red neuronal pequeña) |
| Parametros totales | 141 000 (para el modelo `titler-v1-latin` completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (optimizado para mensajes de ~300 caracteres) |
| Tipos de cuantizacion | fp32, int8, int4, int3 (recomendada) |
| Idiomas soportados | en, fr, es, de, pt, it, nl, pl, sv, da, fi, cs, ro, no, hu, hr, lt (17 idiomas europeos) |
| Licencia | MIT |
| Formato de pesos | `.bin` (formato binario propio documentado), ONNX (fp32 e int8, opset 17) |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación pública, pero se trata de un modelo de clasificación de tokens con tokenización BPE, entrenado por destilación a partir de un LLM profesor (gemma 4 e2b, 2.4 GB en cuantización Q4_K_M). El proceso de entrenamiento utiliza dos datasets propios: `apartejs/aparte-titler-data` y `apartejs/aparte-titler-gold`, con 300 mensajes de referencia por idioma para la evaluación. El modelo genera títulos de forma extractiva: selecciona entre 3 y 6 palabras del primer mensaje del usuario y las devuelve en su orden original, sin generar texto nuevo.

La innovación principal es la cuantización int3 (3 bits por peso con una escala fp16 por fila), que mantiene el mismo rendimiento que fp32 en todos los benchmarks, reduciendo el peso a 133 KB para 141 000 parámetros. El formato binario propio incluye la tabla de merges BPE (12 030 pares), el header JSON con la tabla byte-to-id y los vectores de bias y normalización. El runtime de referencia es un único archivo JavaScript de 12 KB (6 KB minificado) sin dependencias, y existe una implementación Python de 250 líneas que solo usa numpy.

## Capacidades

- Generación de títulos de conversaciones mediante extracción de palabras clave del primer mensaje del usuario (3 a 6 palabras, en orden).
- Soporte multilingüe para 17 idiomas europeos: inglés, francés, español, alemán, portugués, italiano, neerlandés, polaco, sueco, danés, finés, checo, rumano, noruego, húngaro, croata y lituano.
- Ejecución en navegador, Node.js y Python sin frameworks ni dependencias externas.
- Inferencia extremadamente rápida: 2–4 ms en Python y 6–7 ms en el runtime JavaScript puro para un mensaje típico de 300 caracteres, en un solo núcleo de CPU.
- Inmunidad a prompt injection por construcción: el modelo solo copia palabras del mensaje, nunca ejecuta instrucciones.
- Disponibilidad en múltiples precisiones (fp32, int8, int4, int3) y formatos (binario propio y ONNX).
- Integración con el ecosistema aparté de componentes web para chat con IA.

## Casos de uso

- Titulado automático de conversaciones en aplicaciones de chat web: el modelo puede asignar un título a cada hilo de conversación en tiempo real, sin enviar datos a servidores externos, gracias a su ejecución local en el navegador y su latencia de pocos milisegundos.
- Organización de correos electrónicos o mensajes en clientes de escritorio: al extraer palabras clave del primer mensaje, permite agrupar y buscar conversaciones de forma automática, incluso en entornos offline o con datos sensibles que no deben salir del dispositivo.
- Etiquetado de tickets de soporte técnico: integrado en un sistema de helpdesk, puede generar títulos descriptivos para cada ticket a partir de la primera descripción del usuario, facilitando la clasificación y el enrutamiento.
- Indexación de conversaciones en bases de datos: el título generado puede usarse como metadato para búsqueda y recuperación, mejorando la organización de grandes volúmenes de chats sin coste computacional apreciable.
- Aplicaciones de mensajería privada y segura: al funcionar completamente en local, es adecuado para herramientas de comunicación cifrada donde no se permite el procesamiento en la nube, manteniendo la privacidad del contenido.
- Generación de títulos para hilos de foros o comentarios: en plataformas de discusión, el modelo puede sugerir títulos concisos a partir del primer mensaje, reduciendo la carga del usuario y mejorando la legibilidad de los hilos.

## Benchmarks y rendimiento

La documentación publica resultados de word-level F1 contra un título de referencia humano (300 mensajes por idioma, presupuesto de 6 palabras, archivos int3). Se comparan cuatro variantes del modelo (una por idioma, efigsp, latin-mini y latin) con el LLM profesor (gemma 4 e2b, 2.4 GB) y con la línea base "no model" (primeras cinco palabras del mensaje).

| Idioma | one model (40 KB) | efigsp (77 KB) | latin-mini (96 KB) | latin (133 KB) | LLM (2.4 GB) | no model |
|---|---|---|---|---|---|---|
| Inglés | 0.620 | 0.609 | 0.611 | 0.605 | 0.672 | 0.315 |
| Francés | 0.635 | 0.626 | 0.619 | 0.639 | 0.681 | 0.328 |
| Español | 0.607 | 0.612 | 0.611 | 0.604 | 0.681 | 0.300 |
| Alemán | 0.612 | 0.609 | 0.605 | 0.625 | 0.657 | 0.282 |
| Portugués | 0.593 | 0.619 | 0.597 | 0.597 | 0.628 | 0.329 |
| Italiano | 0.598 | 0.596 | 0.589 | 0.608 | 0.682 | 0.293 |
| Neerlandés | 0.632 | — | 0.631 | 0.630 | 0.710 | 0.266 |
| Polaco | 0.605 | — | 0.595 | 0.596 | 0.618 | 0.384 |
| Sueco | 0.758 | — | 0.762 | 0.757 | 0.809 | 0.431 |
| Danés | 0.763 | — | 0.769 | 0.766 | 0.757 | 0.484 |
| Finés | 0.796 | — | 0.797 | 0.788 | 0.771 | 0.668 |
| Checo | 0.775 | — | 0.766 | 0.769 | 0.775 | 0.510 |
| Rumano | 0.670 | — | 0.764 | 0.761 | 0.794 | 0.471 |
| Noruego | 0.754 | — | 0.772 | 0.778 | 0.815 | 0.438 |
| Húngaro | 0.706 | — | 0.729 | 0.738 | 0.706 | 0. (dato incompleto) |

En promedio, el modelo latin (133 KB) alcanza aproximadamente el 92 % del rendimiento del LLM de 2.4 GB, y en danés, finés, húngaro y checo lo iguala o supera. La cuantización int3 mantiene la misma puntuación que fp32 en todos los benchmarks.

## Requisitos de hardware

- Inferencia en un solo núcleo de CPU: 2–4 ms en Python y 6–7 ms en el runtime JavaScript puro para un mensaje de 300 caracteres.
- No requiere GPU: el modelo es tan pequeño que cabe en cualquier dispositivo, incluidos móviles y sistemas embebidos.
- VRAM estimada: no aplica (inferencia en CPU, sin necesidad de memoria gráfica).
- GPUs recomendadas: ninguna; el modelo se ejecuta en CPU.
- Compatible con hardware de consumo: sí, cualquier ordenador o navegador moderno.
- Opciones de despliegue: navegador (WebAssembly o JavaScript puro), Node.js, Python (numpy), ONNX Runtime (para los grafos ONNX).
- Latencia y throughput: 2–7 ms por mensaje típico, lo que permite procesar cientos de títulos por segundo en un solo hilo.

## Comparativa con modelos similares

No se han identificado modelos comparables de la misma categoría (titulado extractivo de conversaciones con peso inferior a 1 MB). La comparativa más relevante es contra el LLM profesor y la línea base sin modelo:

| Modelo | Tamaño | Idiomas | F1 medio (aprox.) | Licencia | Despliegue |
|---|---|---|---|---|---|
| aparte-titler latin (int3) | 133 KB | 17 | ~0.68 | MIT | Navegador, Node, Python |
| gemma 4 e2b (Q4_K_M) | 2.4 GB | multilingüe | ~0.72 | no disponible | Requiere GPU/CPU potente |
| Línea base "no model" (primeras 5 palabras) | 0 | 17 | ~0.38 | — | — |

El modelo aparte-titler ofrece una relación rendimiento/tamaño excepcional: con 18 000 veces menos peso que el LLM, alcanza el 92 % de su rendimiento medio, y en varios idiomas lo supera. No hay alternativas conocidas con características similares (titulado extractivo, multilingüe, sin dependencias, ejecución en navegador).

## Limitaciones y advertencias

- El modelo solo extrae palabras del primer mensaje; no genera títulos creativos ni reformulados, por lo que la calidad del título depende directamente de la claridad del mensaje original.
- No soporta idiomas fuera de los 17 europeos incluidos; para otros idiomas no hay cobertura.
- La longitud de contexto no está documentada; el modelo está optimizado para mensajes de ~300 caracteres y puede degradarse con mensajes mucho más largos.
- Solo utiliza el primer mensaje de la conversación, ignorando el historial posterior; no es adecuado para conversaciones donde el tema cambia drásticamente después del primer mensaje.
- Al ser un modelo extractivo, puede producir títulos que no reflejen el contenido completo si el primer mensaje es ambiguo o contiene información irrelevante.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías; el proyecto aparté es open source y no ofrece soporte comercial formal.
- Para producción, se recomienda validar el comportamiento en el idioma y dominio específicos, ya que los benchmarks se basan en 300 mensajes por idioma y pueden no representar todos los casos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/apartejs/aparte-titler
- Página de presentación: https://apartejs.dev/models/titler/
- Demo en navegador: https://apartejs.dev/models/titler/#demo
- Repositorio de código y runtime: https://github.com/apartejs/aparte-titler-model
- Paquete npm `@aparte/titler`: https://www.npmjs.com/package/@aparte/titler
- Paquete npm `@aparte/titler-latin`: https://www.npmjs.com/package/@aparte/titler-latin
- Sitio del proyecto aparté: https://apartejs.dev/
- Repositorio principal de aparté: https://github.com/apartejs/aparte
