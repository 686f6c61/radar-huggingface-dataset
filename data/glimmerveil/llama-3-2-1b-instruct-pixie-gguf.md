# Glimmerveil/Llama-3.2-1B-Instruct-Pixie-GGUF

## Resumen

Llama-3.2-1B-Instruct-Pixie-GGUF es una cuantizacion GGUF del modelo meta-llama/Llama-3.2-1B-Instruct, publicada por el usuario Glimmerveil. No se trata de un modelo nuevo ni de un ajuste fino: la model card indica explicitamente que es el modelo de Meta cuantizado a Q8_0 "sin entrenamiento adicional". El nombre "Pixie" hace referencia al personaje de la plataforma Glimmerveil, pero la personalidad reside en el codigo de la aplicacion y en las memorias almacenadas en el navegador del usuario, no en los pesos.

El modelo base es un transformer decoder-only de 1.235.814.432 parametros, orientado a generacion de texto conversacional y entrenado por Meta con instrucciones. Esta version concreta pesa 1.321.082.688 bytes en un unico fichero GGUF y esta pensada para ejecutarse en el navegador mediante WebGPU o CPU a traves de wllama, o en cualquier runtime compatible con llama.cpp.

Su relevancia practica es limitada para produccion general: se trata de un artefacto de despliegue para un caso de uso muy concreto (un asistente ligero embebido en navegador) y con cero descargas y cero likes en el momento de la consulta. Resulta util, sin embargo, como ejemplo de cuantizacion Q8_0 de un modelo de 1B lista para entornos sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 1B Instruct) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | en (segun la model card) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 1B Instruct, un transformer decoder-only de Meta. Esta publicacion no introduce cambios arquitectonicos ni de entrenamiento: es una conversion a GGUF con cuantizacion Q8_0 del checkpoint original, sin RLHF, DPO ni ajuste adicional por parte de Glimmerveil. La model card lo declara de forma explicita ("quantized to GGUF Q8_0 (no further training)").

El unico detalle tecnico propio del artefacto es el empaquetado: un unico fichero GGUF de 1.321.082.688 bytes con sha256 74701a8c35f6c8d9a4b91f3f3497643001d63e0c7a84e085bed452548fa88d45, acompanado de los ficheros LICENSE, USE_POLICY.md y NOTICE.txt exigidos por la licencia de Meta. El formato GGUF permite su carga en llama.cpp, wllama y runtimes derivados, incluyendo ejecucion en navegador mediante WebGPU o CPU. No se dispone de informacion sobre el proceso de conversion (herramienta, version de llama.cpp ni parametros exactos de cuantizacion mas alla de Q8_0).

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama 3.2 1B Instruct.
- Seguimiento de instrucciones basicas propias de un modelo Instruct de 1B parametros.
- Ejecucion en navegador mediante wllama con WebGPU o CPU, y en cualquier runtime llama.cpp.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se documentan otros idiomas.

## Casos de uso

- Asistente embebido en navegador: el modelo esta disenado para ejecutarse en el cliente via wllama con WebGPU o CPU, de modo que la inferencia ocurre en el dispositivo del usuario sin enviar conversaciones a un servidor. Es adecuado por su tamano de 1,3 GB y su cuantizacion Q8_0.
- Demos interactivas de personajes o chatbots: la publicacion se usa como motor de un personaje ("Pixie") cuya personalidad se implementa en codigo y en memorias locales del navegador, no en los pesos. Sirve como referencia para separar modelo y capa de personaje.
- Prototipado rapido de aplicaciones conversacionales: al ser un GGUF de un solo fichero compatible con llama.cpp, permite levantar un endpoint de chat en local en minutos para validar flujos de producto.
- Educacion y experimentacion con cuantizacion: util como ejemplo practico de conversion Q8_0 de un modelo de 1B y de ejecucion en entornos sin GPU dedicada.
- Pruebas de integracion con runtimes ligeros: sirve para validar pipelines basados en llama.cpp o wllama antes de escalar a modelos mayores con la misma interfaz.
- Entornos con requisitos de privacidad estrictos: al poder ejecutarse integramente en el navegador o en local, encaja en escenarios donde los datos no pueden salir del dispositivo, siempre que las tareas sean simples y en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB solo para los pesos en Q8_0; el consumo real depende del contexto y del runtime (no disponible con precision).
- GPU recomendadas: no disponible en la informacion proporcionada. Al ser un modelo de 1B en Q8_0, cabe en GPUs de consumo con suficiente memoria libre.
- Cabe en GPU de consumo: si, en terminos de memoria de pesos; no se especifican modelos concretos ni requisitos minimos de WebGPU.
- Opciones de despliegue: llama.cpp, wllama (WebGPU o CPU en navegador) y runtimes derivados compatibles con GGUF. No se confirma soporte de vLLM, TGI, Ollama u otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Glimmerveil/Llama-3.2-1B-Instruct-Pixie-GGUF | 1.235.814.432 | no disponible | GGUF Q8_0 | llama3.2 | Cuantizacion de Llama 3.2 1B Instruct, orientada a navegador |
| meta-llama/Llama-3.2-1B-Instruct | 1B (aprox.) | no disponible en la informacion proporcionada | safetensors (original) | llama3.2 | Modelo base oficial de Meta |
| bartowski/Llama-3.2-1B-Instruct-GGUF | 1B (aprox.) | no disponible en la informacion proporcionada | GGUF (multiples cuantizaciones) | llama3.2 | Cuantizaciones alternativas del mismo modelo base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo ajustado: cualquier expectativa sobre el comportamiento del personaje "Pixie" depende del codigo de la aplicacion, no de los pesos.
- Modelo de 1B parametros: capacidad limitada de razonamiento, matematicas y codigo en comparacion con modelos mayores; riesgo elevado de respuestas superficiales o incorrectas en tareas complejas.
- Riesgo de alucinacion inherente al modelo base, sin mitigaciones adicionales documentadas.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto: no documentada en esta ficha; debe consultarse la del modelo base antes de disenar flujos con contexto largo.
- Licencia Llama 3.2 Community License: el uso comercial esta sujeto a la licencia de Meta, su Acceptable Use Policy y el aviso NOTICE.txt incluidos en el repositorio. Es obligatorio cumplirlos.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Cuantizacion unica Q8_0: no se ofrecen variantes de menor precision (Q4, Q5) que reduzcan aun mas el uso de memoria.
- No se documentan garantias de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Glimmerveil/Llama-3.2-1B-Instruct-Pixie-GGUF
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Cuantizaciones alternativas (bartowski): https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF
- Shard publico de Glimmerveil: https://glimmerveil.dev/shard/
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
