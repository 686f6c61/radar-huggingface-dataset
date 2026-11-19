# APMIC/ACE-31B-Nursing

## Resumen

ACE-31B-Nursing es un modelo multimodal de generacion de texto a partir de imagen y texto (image-text-to-text), desarrollado por APMIC y especializado en el dominio de enfermeria y atencion sanitaria. Se construye sobre la arquitectura Gemma 4 (etiqueta `gemma4` en el repositorio) y cuenta con aproximadamente 31.270 millones de parametros en formato safetensors. El modelo esta disenado para conversaciones clinicas en chino, con enfasis en el contexto sanitario de Taiwan, y se distribuye bajo licencia Apache 2.0 con acceso restringido en Hugging Face.

Su relevancia radica en la verticalizacion de un modelo de gran tamano hacia un dominio concreto: asistencia a profesionales de enfermeria, interpretacion de imagenes clinicas y dialogo multi-turno en un unico modelo. Frente a los asistentes medicos genericos, ACE-31B-Nursing incorpora el sesgo linguistico y cultural del sistema sanitario taiwanes, lo que lo hace util para despliegues locales en ese entorno. El modelo acepta entradas de imagen y texto, lo que permite casos de uso como lectura de informes, imagenes de heridas o material de formacion clinica.

El repositorio no incluye, en la informacion disponible, detalles sobre el proceso de entrenamiento, los datos utilizados ni resultados de benchmarks. La ficha se limita, por tanto, a los datos verificables del repositorio y a las inferencias razonables a partir de la arquitectura declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma 4 (image-text-to-text) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (compatible con cuantizacion estandar de transformers/safetensors) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se etiqueta como `gemma4`, lo que indica que parte de la familia Gemma 4 de Google y se ha adaptado para la tarea `image-text-to-text`. Esto implica un transformer con un codificador visual acoplado a un decodificador de lenguaje, capaz de procesar imagenes junto con instrucciones textuales y generar respuestas. El pipeline declarado en Hugging Face es `image-text-to-text`, y el repositorio incluye pesos en safetensors compatibles con la libreria `transformers`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La etiqueta `nursing` y el identificador `ACE-31B-Nursing` sugieren un ajuste fino orientado al dominio de enfermeria, y la etiqueta `taiwan` indica un sesgo hacia el contexto sanitario taiwanes. Cualquier detalle adicional sobre el entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en chino, orientada a dialogos clinicos y de enfermeria.
- Procesamiento de imagenes junto con texto (image-text-to-text): interpretacion de material visual clinico, como imagenes de heridas, informes escaneados o material de formacion.
- Razonamiento sobre contenido medico y sanitario dentro del dominio de enfermeria.
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- Capacidades multilingues limitadas al chino segun la metadata del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue mediante la infraestructura de Hugging Face.
- No se declara soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Asistencia a profesionales de enfermeria en turno: el modelo puede responder consultas sobre procedimientos, protocolos y cuidados en chino, actuando como referencia rapida durante la jornada laboral.
- Interpretacion de imagenes clinicas: al aceptar entradas image-text-to-text, puede apoyar la descripcion de heridas, lesiones cutaneas o material visual de seguimiento, siempre como apoyo y no como sustituto del criterio clinico.
- Formacion y simulacion de casos: generacion de dialogos de practica para estudiantes de enfermeria, con escenarios multi-turno adaptados al contexto sanitario de Taiwan.
- Triaje conversacional y orientacion inicial: gestion de conversaciones multi-turno para recoger sintomas y orientar al paciente hacia el recurso adecuado, con derivacion a profesionales.
- Documentacion clinica asistida: redaccion y estructuracion de notas de enfermeria a partir de descripciones textuales o imagenes de material de registro.
- Traduccion y adaptacion de material sanitario: conversion de contenido clinico al chino con terminologia adaptada al entorno taiwanes.
- Despliegue en infraestructura propia: al estar disponible en safetensors y con licencia Apache 2.0, puede integrarse en entornos hospitalarios con requisitos de soberania de datos, sujeto al acceso restringido del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 62 GB solo para los pesos (31,3 B x 2 bytes), mas el overhead del codificador visual y la cache KV; se recomienda un minimo de 80 GB para margen operativo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 31-35 GB, viable en una A100 40 GB o H100.
- VRAM estimada en cuantizacion de 4 bits: en torno a 16-20 GB, potencialmente viable en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; A100 40 GB o L40S para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), endpoints compatibles de Hugging Face; vLLM, TGI o llama.cpp no se declaran explicitamente en el repositorio, por lo que su compatibilidad debe verificarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| APMIC/ACE-31B-Nursing | ~31,3 B | no disponible | image-text-to-text | Apache 2.0 | Gated en Hugging Face |
| MedGemma (Google) | no disponible en esta ficha | no disponible | multimodal medico | no disponible | Hugging Face |
| LLaVA-Med | ~7 B (variante) | no disponible | image-text-to-text medico | no disponible | Hugging Face |
| BioMistral | ~7 B | no disponible | texto | Apache 2.0 | Hugging Face |

La comparacion cuantitativa con alternativas no puede completarse porque no se han publicado benchmarks ni especificaciones de contexto para ACE-31B-Nursing. La principal diferencia frente a modelos medicos genericos es su especializacion en enfermeria y en el contexto taiwanes, ademas de su tamano de 31 B, superior al de la mayoria de asistentes medicos abiertos de proposito general.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo esta entrenado y orientado al contexto sanitario de Taiwan y al idioma chino, por lo que puede presentar sesgos culturales y linguisticos en otros entornos.
- Riesgo de alucinacion: como todo modelo generativo en dominio medico, puede producir informacion clinica incorrecta; no debe usarse como sustituto del juicio de un profesional sanitario.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y el unico idioma soportado es el chino, lo que limita su uso en entornos hispanohablantes sin adaptacion.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el acceso al repositorio es restringido (gated) y requiere aceptar condiciones en Hugging Face.
- Caveats para produccion: al no haber benchmarks publicados ni documentacion sobre el entrenamiento, no es posible evaluar su robustez clinica; se recomienda validacion supervisada por profesionales antes de cualquier despliegue real.
- El modelo no declara soporte de tool calling ni de agentes, lo que limita su integracion en pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/APMIC/ACE-31B-Nursing
- Pagina de APMIC en Hugging Face: https://huggingface.co/APMIC
- Documentacion de Gemma (familia base): https://ai.google.dev/gemma
- Documentacion de transformers: https://huggingface.co/docs/transformers
