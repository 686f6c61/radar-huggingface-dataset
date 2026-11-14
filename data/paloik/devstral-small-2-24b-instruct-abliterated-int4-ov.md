# paloik/Devstral-Small-2-24B-Instruct-abliterated-int4-ov

## Resumen

Devstral-Small-2-24B-Instruct-abliterated-int4-ov es una cuantizacion en formato OpenVINO IR con precision INT4 del modelo Devstral-Small-2-24B-Instruct, un modelo de lenguaje de 24 mil millones de parametros especializado en tareas de codigo y agentes, desarrollado originalmente por Mistral AI. Esta version concreta la publica el usuario paloik en Hugging Face y parte de una variante "abliterated" (sin censura) creada por wangzhang, que a su vez deriva del modelo oficial mistralai/Devstral-Small-2-24B-Instruct-2512.

El modelo resuelve el problema de ejecutar un LLM de 24B especializado en programacion sobre hardware Intel sin GPU dedicada de gran capacidad, gracias a la cuantizacion INT4 y al runtime OpenVINO GenAI. Esta optimizado explicitamente para Intel Core Ultra (con NPU/GPU integrada), GPUs Intel Arc y CPUs, lo que lo hace relevante para despliegues en portatiles y estaciones de trabajo con aceleracion Intel.

La relevancia actual radica en la combinacion de tres factores: un modelo base orientado a tareas agenticas de codigo, una variante sin rechazos (abliterated/uncensored) que elimina las negativas del modelo original, y un formato de despliegue (OpenVINO IR INT4) que reduce drasticamente los requisitos de memoria frente a los pesos originales en BF16. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral 3 / Devstral, segun tags; detalles no disponibles) |
| Parametros totales | 24B (segun nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (OpenVINO IR) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (INT4); el modelo base se distribuye en otros formatos |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a "mistral3" y "devstral" como familia de origen. Devstral-Small-2-24B-Instruct es un modelo de Mistral AI orientado a tareas de codigo y uso agentico, pero esta ficha no dispone de datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, no se han proporcionado detalles sobre el volumen de tokens, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras). La variante "abliterated" implica una modificacion post-entrenamiento que elimina direcciones de activacion asociadas al rechazo de peticiones, pero el repositorio no documenta el procedimiento concreto ni los datos empleados. La cuantizacion a INT4 se ha realizado con las herramientas de OpenVINO para generar un modelo IR optimizado para inferencia en hardware Intel.

## Capacidades

- Generacion de texto y razonamiento general, con especializacion en codigo segun el modelo base Devstral.
- Generacion y comprension de codigo en multiples lenguajes (heredado del modelo base; lista concreta no disponible).
- Procesamiento de imagen y texto (pipeline image-text-to-text declarado), lo que sugiere capacidades multimodales de entrada.
- Comportamiento "uncensored": la variante abliterated elimina los rechazos del modelo original ante peticiones que este consideraria sensibles.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque el modelo base Devstral esta orientado a uso agentico.
- Razonamiento multi-paso y uso como agente: plausible por la naturaleza del modelo base, sin confirmacion documentada en este repositorio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistente de codigo en local sobre portatiles Intel Core Ultra: el formato OpenVINO INT4 permite ejecutar un modelo de 24B en equipos sin GPU dedicada, usando la NPU o la GPU integrada para autocompletado y explicacion de codigo.
- Generacion de codigo en estaciones de trabajo con GPU Intel Arc: la cuantizacion INT4 reduce la huella de memoria y permite integrar el modelo en flujos de desarrollo con OpenVINO GenAI.
- Automatizacion de tareas agenticas de programacion: al derivar de Devstral, esta pensado para editar ficheros, ejecutar comandos y resolver issues en entornos controlados, siempre que se valide su comportamiento real.
- Procesamiento de capturas de pantalla o diagramas con texto: el pipeline image-text-to-text permite extraer informacion de imagenes tecnicas y convertirla en codigo o documentacion.
- Investigacion sobre alineacion y censura: la variante abliterated es util para estudiar como se comporta un modelo sin mecanismos de rechazo y comparar con el original.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local sobre hardware Intel, los datos no salen del equipo, lo que encaja en escenarios con informacion sensible.
- Prototipado rapido de asistentes tecnicos sin conexion: el runtime OpenVINO GenAI permite levantar un pipeline VLM local con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: con cuantizacion INT4, un modelo de 24B requiere del orden de 12-14 GB de memoria para los pesos, mas overhead de activaciones y contexto (estimacion orientativa; no confirmada en el repositorio).
- Hardware objetivo declarado: Intel Core Ultra (CPU/NPU/GPU integrada), GPUs Intel Arc y CPUs Intel.
- GPU dedicadas: no se documenta soporte para A100, H100 o RTX 4090; el formato OpenVINO esta orientado a hardware Intel.
- Compatibilidad con GPU de consumo: si, en el ecosistema Intel (Arc e iGPU de Core Ultra); no se confirma en GPUs NVIDIA de consumo.
- Despliegue: OpenVINO GenAI mediante `openvino_genai.VLMPipeline`; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| paloik/Devstral-Small-2-24B-Instruct-abliterated-int4-ov | 24B | no disponible | OpenVINO IR INT4 | Apache 2.0 | Optimizado para hardware Intel; variante sin censura |
| mistralai/Devstral-Small-2-24B-Instruct-2512 | 24B | no disponible | no disponible | Apache 2.0 | Modelo base oficial de Mistral AI, con alineacion estandar |
| wangzhang/Devstral-Small-2-24B-Instruct-abliterated | 24B | no disponible | no disponible | Apache 2.0 (segun herencia) | Variante abliterated en formato original, sin cuantizar a OpenVINO |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La variante abliterated elimina los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado sin filtro; no es recomendable para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion inherente a los LLM, agravado en tareas de codigo donde puede inventar APIs o funciones inexistentes.
- La cuantizacion INT4 puede degradar la calidad respecto al modelo en BF16, especialmente en tareas de razonamiento complejo o generacion de codigo largo.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento en castellano.
- La longitud de contexto no esta documentada en este repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Aunque la licencia declarada es Apache 2.0, conviene verificar las condiciones del modelo base original de Mistral AI antes de un uso comercial.
- El despliegue esta limitado al ecosistema OpenVINO; no se documenta compatibilidad con otros runtimes.

## Enlaces

- [Hugging Face: paloik/Devstral-Small-2-24B-Instruct-abliterated-int4-ov](https://huggingface.co/paloik/Devstral-Small-2-24B-Instruct-abliterated-int4-ov)
- [Modelo base oficial: mistralai/Devstral-Small-2-24B-Instruct-2512](https://huggingface.co/mistralai/Devstral-Small-2-24B-Instruct-2512)
- [Variante abliterated: wangzhang/Devstral-Small-2-24B-Instruct-abliterated](https://huggingface.co/wangzhang/Devstral-Small-2-24B-Instruct-abliterated)
