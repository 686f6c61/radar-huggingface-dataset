# onocloud/onoai-titanium-2.5-pro-ONNX-WebGPU

## Resumen

OnoAI Titanium 2.5 Pro es un modelo de generación de texto desarrollado por OnoCloud, publicado en Hugging Face bajo el identificador `onocloud/onoai-titanium-2.5-pro-ONNX-WebGPU`. Se distribuye exclusivamente en formato ONNX optimizado para WebGPU, lo que indica que está pensado para ejecutarse directamente en el navegador mediante `onnxruntime-genai`, sin necesidad de infraestructura de servidor dedicada. El modelo pertenece a la familia interna "Titanium" de OnoCloud y se etiqueta con casos de uso orientados a agentes autónomos y codificación agéntica ("autonomous-agent", "agentic-coding").

La información pública disponible es muy limitada: el repositorio tiene un tamaño declarado de 0.0 GB, cero descargas y cero "likes" en el momento de la consulta, y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face para descargar los pesos. La licencia es propietaria (`onocloud-sovereign-license`), no es de código abierto y no se detallan sus términos en la información proporcionada.

Los idiomas declarados son inglés (`en`) y árabe (`ar`). No se han publicado en la información disponible datos sobre arquitectura interna, número de parámetros, longitud de contexto ni proceso de entrenamiento, por lo que la ficha refleja únicamente lo que puede inferirse de las etiquetas y metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `muse_glimmer` en los tags, sin detalle) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion en ONNX; cuantizacion concreta no especificada) |
| Idiomas soportados | ingles (`en`), arabe (`ar`) |
| Licencia | `onocloud-sovereign-license` (propietaria, acceso restringido) |
| Formato de pesos | ONNX (runtime `onnxruntime-genai`, backend WebGPU) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la informacion disponible. Los tags del repositorio incluyen `muse_glimmer`, `titanium` y `atem`, que parecen ser identificadores internos de la familia o de componentes del modelo, pero no se documenta su significado tecnico. Tampoco se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida.

Respecto al entrenamiento, no hay datos sobre numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas destacables. La unica informacion estructural relevante es la orientacion a despliegue en navegador mediante ONNX Runtime GenAI con backend WebGPU, lo que sugiere una compilacion y posiblemente una cuantizacion especificas para ejecucion en cliente.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Capacidades orientadas a agentes autonomos (tag `autonomous-agent`).
- Codificacion agentica (tag `agentic-coding`), es decir, uso del modelo dentro de bucles de agente para tareas de programacion.
- Ejecucion en navegador mediante WebGPU (`in-browser`, `webgpu`), lo que permite inferencia local en el cliente sin servidor.
- Soporte multilingue limitado a ingles y arabe segun los metadatos.
- No se documenta soporte explicito de tool calling, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Asistente de codificacion en el navegador: al ejecutarse con ONNX Runtime GenAI sobre WebGPU, el modelo puede integrarse en un IDE web o editor online para sugerencias y refactorizacion sin enviar codigo a un servidor, lo que resulta adecuado por privacidad y por la etiqueta `agentic-coding`.
- Agente autonomo del lado del cliente: la etiqueta `autonomous-agent` sugiere su uso en flujos de agente que ejecutan tareas multi-paso en la propia pagina, reduciendo costes de backend y latencia de red.
- Demostraciones interactivas sin infraestructura: al no requerir GPU de servidor, permite publicar demos de generacion de texto que corren en el navegador del visitante, util para prototipos y pruebas de concepto.
- Atencion al cliente en ingles y arabe: el soporte declarado de ambos idiomas permite desplegar asistentes conversacionales bilingues en mercados de Oriente Medio, aunque la falta de datos de contexto limita la planificacion.
- Procesamiento de texto sensible en local: casos donde el contenido no debe salir del dispositivo del usuario (por ejemplo, borradores internos) se benefician de la inferencia en navegador.
- Evaluacion de la familia Titanium: para equipos que ya usan otros modelos de OnoCloud, este repositorio permite probar la variante ONNX/WebGPU dentro de la misma licencia propietaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamano del repositorio figura como 0.0 GB y no se especifica el numero de parametros).
- GPU recomendadas: no disponible; al estar orientado a WebGPU, depende de la GPU integrada o dedicada del equipo cliente y del soporte WebGPU del navegador.
- Compatibilidad con GPU de consumo: no verificable sin datos de tamano; la ejecucion en navegador implica que el modelo debe caber en la memoria grafica disponible del cliente.
- Opciones de despliegue: `onnxruntime-genai` con backend WebGPU es el unico runtime indicado en los metadatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma familia, tamano o modalidad de despliegue en navegador con los que establecer una comparacion fiable.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia propietaria (`onocloud-sovereign-license`): no es codigo abierto y no se detallan en la informacion disponible las restricciones para uso comercial, por lo que debe revisarse el texto completo de la licencia antes de cualquier despliegue en produccion.
- Idiomas limitados a ingles y arabe: no hay soporte declarado de castellano ni de otros idiomas.
- Ausencia total de datos tecnicos publicos (parametros, contexto, entrenamiento, benchmarks): impide evaluar su calidad, sesgos o riesgo de alucinacion de forma fundamentada.
- Repositorio sin descargas ni interacciones y con tamano declarado de 0.0 GB: conviene verificar la integridad y el contenido real de los pesos tras solicitar acceso.
- Dependencia de WebGPU: la ejecucion en navegador queda sujeta a la disponibilidad de WebGPU en el navegador y en el hardware del usuario, lo que puede excluir a parte de la base de usuarios.
- No se documentan mecanismos de seguridad, filtrado ni evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onocloud/onoai-titanium-2.5-pro-ONNX-WebGPU
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
