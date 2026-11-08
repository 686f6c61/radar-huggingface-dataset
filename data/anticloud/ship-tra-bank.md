# Anticloud/ship-tra-bank

## Resumen

Anticloud/ship-tra-bank es un artefacto publicado en Hugging Face por la organizacion Anticloud bajo el identificador `ship-tra-bank`, con la etiqueta de vertical `ship-tra` y el arnes `openhands`. Por los metadatos disponibles (tags `vertical:ship-tra`, `harness:openhands`) se trata de un paquete de datos o configuracion orientado a un dominio maritimo o de trafico de buques, empaquetado para su uso con el arnes de agentes OpenHands, y no de un modelo de lenguaje con pesos publicados al uso. La ficha se redacta, por tanto, con caracter cauteloso: la informacion proporcionada no incluye arquitectura, parametros ni contexto.

El repositorio no registra descargas ni likes, fue creado y actualizado el 8 de noviembre de 2026 en el mismo intervalo de un segundo, y su acceso esta restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar nada. La licencia declarada es `anticommons-0.1.0`, una licencia propia de la organizacion que no es de codigo abierto ni de uso libre por defecto.

La relevancia de esta ficha es mas bien documental y de advertencia: sirve para identificar que el artefacto existe, que su uso esta condicionado por una licencia restrictiva y un acceso controlado, y que no debe confundirse con un modelo fundacional. Cualquier evaluacion tecnica de capacidades, rendimiento o despliegue queda fuera del alcance de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | anticommons-0.1.0 (acceso restringido, gated) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura, datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineacion (RLHF, DPO u otras) para este artefacto. Los tags del repositorio (`vertical:ship-tra`, `harness:openhands`) sugieren que el contenido esta pensado para integrarse como recurso de un agente basado en OpenHands en un dominio de trafico maritimo, pero no hay evidencia en la informacion proporcionada de que contenga pesos de un modelo neuronal.

Como contexto externo, la organizacion Anticloud mantiene el paquete offline SHIFT en GitHub, descrito por sus propios autores como un paquete sin ruta de decodificacion de modelo, que puede ser invocado como herramienta determinista por un modelo como PAX L5 Narrow L2 General 27B. Esto refuerza la interpretacion de que los artefactos de Anticloud son componentes de un sistema mayor y no modelos autonomos.

## Capacidades

- No se dispone de informacion sobre capacidades de generacion de texto, razonamiento, codigo o matematicas.
- No se dispone de informacion sobre soporte de tool calling o function calling.
- No se dispone de informacion sobre soporte de agentes o razonamiento multi-paso, mas alla del tag `harness:openhands`, que indica compatibilidad declarada con ese arnes.
- No se dispone de informacion sobre capacidades multilingues.
- No se dispone de informacion sobre modos especiales (thinking, vision, audio).

## Casos de uso

- Integracion en un agente OpenHands: el tag `harness:openhands` sugiere que el paquete esta preparado para ser consumido por agentes construidos sobre ese framework; el caso concreto de uso dependeria del contenido del paquete, que no es publico.
- Procesamiento de datos de trafico maritimo: la etiqueta `vertical:ship-tra` apunta a un dominio de seguimiento de buques; el paquete podria contener datos de referencia, plantillas o utilidades para ese dominio, sin que se pueda confirmar su funcion exacta.
- Auditoria de artefactos restringidos: dado su caracter gated y su licencia anticommons, un caso realista es la evaluacion de cumplimiento antes de su adopcion en una organizacion.
- Reproduccion de pipelines internos de Anticloud: el paquete podria formar parte de una cadena de herramientas internas descrita en el repositorio SHIFT, sin ruta de decodificacion propia.
- Docencia sobre licencias restrictivas: sirve como ejemplo de artefacto con licencia `anticommons` y acceso condicionado, util para formar equipos en gestion de dependencias.
- No se pueden detallar mas casos concretos sin informacion sobre el contenido real del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria en la informacion proporcionada, y el artefacto no parece encuadrarse en la categoria de modelos de lenguaje con pesos publicados.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el contenido.
- Licencia `anticommons-0.1.0`: no es una licencia de codigo abierto; el uso comercial y la redistribucion estan sujetos a condiciones propias que deben revisarse antes de cualquier adopcion.
- Ausencia total de especificaciones tecnicas publicas: no es posible evaluar rendimiento, sesgos ni calidad.
- Riesgo de confusion: el nombre y los tags pueden llevar a tratarlo como un modelo de lenguaje, cuando la evidencia apunta a un paquete de datos o configuracion para un agente.
- Sin descargas ni likes registrados: no hay senal de validacion por parte de la comunidad.
- No se dispone de informacion sobre sesgos, alucinacion, cobertura idiomatica ni limitaciones de contexto.
- Cualquier uso en produccion exige una revision legal previa de la licencia y una auditoria del contenido real del paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anticloud/ship-tra-bank
- Paquete SHIFT de Anticloud en GitHub: https://github.com/the-anticloud/anticloud-shift
- Articulo de Quartz sobre el uso de Claude por operadores vinculados a Iran contra buques de la Armada de EE. UU. (contexto externo, no relacionado directamente con el artefacto): https://qz.com/iran-anthropic-claude-ai-us-navy-warships-091126
