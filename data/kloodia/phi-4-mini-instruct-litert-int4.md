# kloodia/Phi-4-mini-instruct-LiteRT-INT4

## Resumen

Phi-4-mini-instruct-LiteRT-INT4 es una conversión del modelo microsoft/Phi-4-mini-instruct al formato `.litertlm` con cuantización INT4 por bloques, publicada por el usuario kloodia. No se trata de un modelo entrenado desde cero, sino de una adaptación del checkpoint oficial de Microsoft para su ejecución en dispositivos mediante el runtime LiteRT-LM (y herramientas derivadas como expo-ai-kit). El objetivo es permitir inferencia local en entornos con recursos limitados, como móviles o equipos de borde, sin depender de servicios en la nube.

El artefacto principal, `phi4-mini-int4.litertlm`, ocupa aproximadamente 2,6 GB y emplea cuantización int4 con esquema BOCTAV4 y tamano de bloque 32. La model card indica que se ha eliminado el `start_token` (Phi instruct no usa BOS, lo que es necesario para un chat correcto) y que los embeddings se han externalizado para respetar los limites de seccion de iOS. El contexto declarado en este artefacto concreto es de 4096 tokens, inferior a la ventana nativa del modelo base.

La relevancia de esta ficha radica en que combina el model card de la conversión con las caracteristicas conocidas del modelo base de Microsoft, un modelo compacto orientado a razonamiento denso, matematicas y logica, distribuido bajo licencia MIT y con soporte multilingue. Es un ejemplo tipico de adaptacion de pesos para despliegue on-device en el ecosistema LiteRT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de microsoft/Phi-4-mini-instruct); empaquetada en formato `.litertlm` |
| Parametros totales | no disponible (corresponde a los de microsoft/Phi-4-mini-instruct) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens en este artefacto (modelo base: 131K segun resultados de busqueda) |
| Tipos de cuantizacion | int4 con esquema BOCTAV4 y tamano de bloque 32 |
| Idiomas soportados | no disponible (el modelo base se describe como multilingue) |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Tamano del repositorio | 16,7 GB |
| Tamano del archivo principal | ~2,6 GB (`phi4-mini-int4.litertlm`) |
| SHA256 | e7729c2213877109c56af345a5d1deb7a366c581e1515414985b8886fb6ac201 |
| Libreria | litert-lm |

## Arquitectura y entrenamiento

La conversion parte del checkpoint microsoft/Phi-4-mini-instruct, un transformer decoder-only denso. Segun las fuentes consultadas, el modelo base se entreno sobre datos sinteticos y contenido web filtrado orientado a razonamiento denso, y posteriormente se sometio a ajuste supervisado (SFT) y optimizacion por preferencias directas (DPO) para mejorar el seguimiento de instrucciones, el uso de funciones y la seguridad. El modelo base se ofrece bajo licencia MIT y esta pensado para entornos con restricciones de memoria y computo, asi como para escenarios sensibles a la latencia.

Esta publicacion concreta no implica un nuevo entrenamiento: es una conversion de pesos. Se aplica cuantizacion INT4 con un esquema de bloques (BOCTAV4, bloque de 32) para reducir el tamano del modelo hasta aproximadamente 2,6 GB. La model card especifica dos ajustes relevantes para el runtime: se elimina el `start_token` porque Phi instruct no emplea token BOS, y los embeddings se externalizan para evitar los limites de seccion en iOS. No se documentan en la informacion proporcionada otras innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento: hereda el enfoque del modelo base hacia tareas de razonamiento denso, matematicas y logica.
- Instrucciones: al derivar de una variante instruct, esta preparado para seguir instrucciones conversacionales.
- Soporte multilingue: el modelo base se describe como multilingue, aunque este artefacto no declara idiomas concretos.
- Tool calling / function calling: el modelo base incorpora soporte mejorado de function calling segun las fuentes consultadas.
- Despliegue on-device: pensado para ejecucion local con LiteRT-LM y expo-ai-kit.
- Chat correcto sin BOS: la eliminacion del `start_token` esta orientada a un formateo de chat adecuado en este runtime.
- No se documenta soporte de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistentes conversacionales on-device: el modelo puede ejecutarse localmente en dispositivos moviles con un artefacto de ~2,6 GB, gestionando conversaciones multi-turno dentro de la ventana de 4096 tokens.
- Aplicaciones moviles sin conectividad: al funcionar con LiteRT-LM, permite funciones de generacion de texto y respuesta a instrucciones en escenarios offline donde no hay acceso a la nube.
- Razonamiento ligero y ayuda educativa: dado el enfoque del modelo base en matematicas y logica, es adecuado para asistentes de resolucion de problemas sencillos en el dispositivo.
- Automatizacion con function calling: el soporte de llamada a funciones del modelo base permite integrarlo en flujos que invocan APIs o acciones estructuradas desde una app.
- Prototipado de agentes de borde: sirve como bloque de construccion para prototipos de agentes que necesitan razonamiento por pasos dentro de un presupuesto de contexto reducido (4096 tokens).
- Filtrado y resumen de texto local: puede emplearse para tareas de resumen o clasificacion en aplicaciones que requieren privacidad, procesando los datos sin salir del dispositivo.
- Desarrollo con expo-ai-kit: encaja en proyectos basados en este kit para incorporar un modelo de chat cuantizado a aplicaciones JS/React Native.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversion no incluye metricas (MMLU, GSM8K, HumanEval u otras), y las fuentes consultadas solo describen caracteristicas del modelo base sin cifras reproducidas en esta ficha.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo principal ocupa ~2,6 GB, por lo que se recomienda disponer de al menos 3 GB de memoria libre para cargar el modelo INT4 y algo mas para el contexto y el runtime.
- GPU de escritorio: no se especifican GPUs concretas en la informacion disponible; el formato esta orientado a aceleracion en dispositivo (CPU, GPU movil o NPU segun el runtime LiteRT).
- Consumer GPU: no disponible como dato verificado; el diseno apunta a ejecucion en dispositivos moviles mas que a GPUs de escritorio.
- Opciones de despliegue: LiteRT-LM y expo-ai-kit, segun la model card. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota sobre iOS: los embeddings se externalizaron especificamente para respetar los limites de seccion de iOS.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Licencia | Comentario |
|---|---|---|---|---|
| kloodia/Phi-4-mini-instruct-LiteRT-INT4 | `.litertlm` INT4 (~2,6 GB) | 4096 | MIT | Conversion para on-device con LiteRT-LM |
| microsoft/Phi-4-mini-instruct | Pesos originales (safetensors) | 131K | MIT | Modelo base, mayor contexto y sin cuantizar |
| Otras cuantizaciones del mismo base (GGUF, etc.) | no disponible | no disponible | MIT (heredada) | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de resultados de rendimiento comparativos entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- Contexto reducido: este artefacto limita la ventana a 4096 tokens, muy por debajo de los 131K del modelo base, lo que restringe tareas de contexto largo.
- Datos de rendimiento ausentes: no hay benchmarks publicados para esta conversion, por lo que no puede garantizarse que la calidad se mantenga respecto al modelo original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la cuantizacion INT4 puede acentuar degradaciones en tareas de razonamiento fino.
- Sesgos: no se documentan evaluaciones de sesgo especificas para esta conversion; se heredan los del modelo base.
- Idiomas: la model card no declara idiomas soportados; la cobertura multilingue dependeria del modelo base.
- Licencia: MIT, heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo original de Microsoft.
- Procedencia: es una conversion de terceros (kloodia) con 0 descargas y 0 likes en el momento de la consulta; no cuenta con validacion de la comunidad.
- Compatibilidad: atado al ecosistema LiteRT-LM; no se documenta soporte para otros runtimes.
- Fecha de creacion registrada en HuggingFace: 2026-10-11 (posterior a la fecha habitual de consulta); conviene verificar la vigencia del repositorio.

## Enlaces

- HuggingFace (conversion): https://huggingface.co/kloodia/Phi-4-mini-instruct-LiteRT-INT4
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- README del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/README.md
- Microsoft Foundry (catalogo): https://ai.azure.com/catalog/models/Phi-4-mini-instruct
- AI Model Radar: https://aimodelradar.app/models/phi-4-mini-instruct
- LM Studio (microsoft/phi-4-mini): https://lmstudio.ai/models/microsoft/phi-4-mini
