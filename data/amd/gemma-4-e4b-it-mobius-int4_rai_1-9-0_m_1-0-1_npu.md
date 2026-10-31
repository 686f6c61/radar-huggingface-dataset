# amd/gemma-4-e4b-it-mobius-int4_rai_1.9.0_m_1.0.1_npu

## Resumen

Esta ficha corresponde a un modelo de generación de texto publicado por AMD en HuggingFace bajo el identificador `amd/gemma-4-e4b-it-mobius-int4_rai_1.9.0_m_1.0.1_npu`. Se trata de una variante cuantizada (INT4) de un modelo de la familia Gemma, optimizada específicamente para ejecutarse sobre el motor Ryzen AI de AMD, concretamente sobre el procesador neuronal (NPU) presente en los procesadores Ryzen AI de la serie de portátiles y sobremesa de AMD. El nombre sugiere que se basa en Gemma de Google en su variante instruct (it), con una configuración "4-e4b" que apunta a un modelo de tamaño medio con arquitectura eficiente.

El problema que resuelve es la ejecución local de modelos de lenguaje generativos en hardware de consumo con NPU, sin depender de GPUs dedicadas ni de servicios en la nube. Esto resulta relevante para desarrolladores que quieren desplegar asistentes conversacionales con privacidad total, latencia baja y coste de infraestructura nulo, aprovechando los NPUs integrados en los equipos con Ryzen AI.

El modelo se distribuye en formato ONNX, está etiquetado como conversacional y de generación de texto, y su repositorio ocupa 14,9 GB. El acceso está restringido (gated): es necesario aceptar las condiciones de la licencia Gemma en HuggingFace antes de poder descargar los pesos. No se han publicado detalles técnicos completos en la información disponible, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma), variante instruct; detalles no disponibles |
| Parametros totales | no disponible (la denominación "4-e4b" sugiere un modelo de unos 4 mil millones de parametros con componentes eficientes, dato no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (cuantizacion especifica para NPU mediante Ryzen AI) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (uso sujeto a los terminos de la licencia Gemma de Google) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Gemma, una gama de modelos de lenguaje basados en arquitectura transformer desarrollada por Google, en su variante instruct (it), es decir, ajustada para seguir instrucciones y mantener conversaciones. La denominacion "mobius" en el nombre del repositorio indica que AMD ha aplicado su propia herramienta o flujo de optimizacion (posiblemente relacionado con el toolkit de cuantizacion de Ryzen AI Software) para convertir el modelo original a INT4 y hacerlo compatible con el compilador del NPU. El sufijo "rai_1.9.0" sugiere compatibilidad con la version 1.9.0 de Ryzen AI Software.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los procesos de alineacion (RLHF, DPO) aplicados al modelo base, ya que estos datos corresponden al modelo Gemma original y no se detallan en la ficha del repositorio de AMD. La innovacion principal de esta publicacion no esta en la arquitectura del modelo sino en su cuantizacion INT4 orientada a NPU, que reduce el tamano del modelo y permite inferencia eficiente en el motor de IA integrado de los procesadores Ryzen AI, liberando la GPU y la CPU para otras tareas.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado para el pipeline text-generation y como conversational, orientado a dialogo e instrucciones.
- Seguimiento de instrucciones: al tratarse de una variante instruct, esta afinado para responder a peticiones del usuario de forma directa.
- Ejecucion en NPU: optimizado mediante cuantizacion INT4 para correr sobre el procesador neuronal de los Ryzen AI, con consumo energetico reducido.
- Idioma: las capacidades estan orientadas al ingles; el repositorio solo lista "en" como idioma soportado.
- No hay informacion disponible sobre soporte de tool calling, capacidades de vision, audio, razonamiento multi-paso ni agentes.

## Casos de uso

- Asistente conversacional local en portatiles: el modelo puede integrarse en aplicaciones de chat que se ejecutan integramente en el dispositivo, garantizando que los datos del usuario no salgan del equipo, algo valioso en entornos corporativos con politicas de privacidad estrictas.
- Resumen y redaccion de documentos offline: gracias a su naturaleza instruct, puede resumir correos, notas o informes directamente en el NPU del portatil sin conexion a internet ni coste por token.
- Generacion de codigo asistida en el editor: puede emplearse como motor local de autocompletado o explicacion de codigo en IDEs, evitando el envio de codigo propietario a APIs externas.
- Prototipado de aplicaciones de IA en el edge: los desarrolladores que trabajan con el stack de Ryzen AI Software (ONNX Runtime, Vitis AI Execution Provider) pueden usar este modelo como punto de partida para construir agentes o copilotos locales.
- Clasificacion y extraccion de informacion en documentos empresariales: tareas de comprension de texto en ingles que requieren procesamiento masivo de documentos sensibles sin subirlos a la nube.
- Demostraciones y pruebas de hardware: ideal para validar el rendimiento del NPU de Ryzen AI en benchmarks de inferencia LLM y para comparar el consumo energetico frente a la ejecucion en GPU.
- Integracion en aplicaciones Windows con copilotos embebidos: el formato ONNX y la compatibilidad con ONNX Runtime facilitan su inclusion en aplicaciones de escritorio que incorporen funciones de IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de throughput o latencia en el NPU para este repositorio.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU integrado (serie Ryzen 7040/8040 y posteriores, segun compatibilidad con Ryzen AI Software 1.9.0). El modelo no esta pensado para GPUs NVIDIA ni para CPU pura.
- Almacenamiento: se necesitan aproximadamente 14,9 GB de espacio en disco para el repositorio completo.
- RAM: no disponible; como referencia, un modelo INT4 de unos 4 mil millones de parametros suele requerir del orden de 3-4 GB de memoria para inferencia, pero el dato exacto no esta confirmado.
- Software: Ryzen AI Software (version 1.9.0 segun la denominacion del repo), ONNX Runtime con el Execution Provider de Vitis AI, y Python como entorno habitual de ejecucion.
- Despliegue: la ruta soportada es ONNX Runtime sobre el NPU mediante Ryzen AI Software. No hay indicios de compatibilidad con llama.cpp, Ollama, vLLM ni TGI, dado que el formato es ONNX cuantizado especificamente para este hardware.
- Acceso: es necesario iniciar sesion en HuggingFace y aceptar la licencia Gemma para descargar los pesos (repositorio gated).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tamano aprox. | Cuantizacion | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| amd/gemma-4-e4b-it-mobius-int4 (este modelo) | ~4B (no confirmado) | INT4 | ONNX | NPU AMD Ryzen AI | Gemma |
| Gemma 3 4B it (Google, original) | 4B | BF16/FP16 y cuantizaciones comunitarias | Safetensors / GGUF | GPU, CPU, NPU via conversion | Gemma |
| Phi-3-mini 4B (Microsoft) | 3.8B | FP16, INT4 (ONNX) | Safetensors / ONNX | CPU, GPU, NPU | MIT |

Comparado con el Gemma original de Google, esta variante de AMD ofrece la ventaja de estar pre-cuantizada y validada para el NPU de Ryzen AI, ahorrando el proceso de conversion y calibracion. Frente a Phi-3-mini de Microsoft, que tambien distribuye versiones ONNX INT4 para NPU, la eleccion depende del ecosistema de software preferido y del rendimiento medido en cada hardware concreto, para el cual no hay datos publicados disponibles.

## Limitaciones y advertencias

- Restriccion de licencia: el modelo se rige por la licencia Gemma de Google, que impone terminos de uso especificos, incluyendo restricciones de uso comercial aceptables y prohibiciones de ciertas aplicaciones. Es obligatorio aceptar dichos terminos antes de la descarga.
- Repositorio gated: el acceso requiere aceptar condiciones en HuggingFace, lo que puede complicar la integracion en pipelines de CI/CD automatizados (habra que configurar un token de acceso).
- Idioma: solo se declara soporte para ingles; el rendimiento en castellano u otros idiomas no esta documentado y puede ser inferior.
- Datos tecnicos incompletos: no se publican longitud de contexto, numero de parametros exacto ni benchmarks, lo que dificulta la evaluacion previa sin descargar y probar el modelo.
- Dependencia de hardware especifico: el modelo esta cuantizado para el NPU de Ryzen AI y la version 1.9.0 del software; su uso fuera de ese ecosistema no esta soportado oficialmente.
- Riesgo de alucinacion: como todo modelo de lenguaje generativo, puede producir respuestas incorrectas o inventadas, especialmente en dominios especializados; no hay evaluaciones de seguridad publicadas en este repositorio.
- Descargas y adopcion: el repositorio registra 0 descargas, por lo que existe poca evidencia comunitaria sobre su funcionamiento, bugs o problemas de compatibilidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amd/gemma-4-e4b-it-mobius-int4_rai_1.9.0_m_1.0.1_npu
- No se han encontrado enlaces adicionales a papers, blogs o demos en la informacion disponible.
