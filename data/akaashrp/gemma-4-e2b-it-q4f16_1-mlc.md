# akaashrp/gemma-4-E2B-it-q4f16_1-MLC

## Resumen

Este repositorio contiene una conversion del modelo google/gemma-4-E2B-it al formato de MLC LLM, realizada por el usuario akaashrp, con la cuantizacion q4f16_1 (pesos de 4 bits y activaciones en float16). El modelo base pertenece a la familia Gemma 4 de Google y, segun la informacion disponible, el E2B es la variante mas ligera de esa familia, con aproximadamente 2.100 millones de parametros y una ventana de contexto de 8.000 tokens, pensada para ejecutarse incluso en CPU y dispositivos de borde.

La relevancia de esta publicacion concreta es de despliegue: al estar empaquetada para MLC LLM y WebLLM, permite ejecutar el modelo en navegador mediante WebGPU o en dispositivos sin GPU dedicada, algo que los pesos originales en safetensors no facilitan directamente. El paquete incluye ademas los pesos del adaptador de audio y un archivo `mlc-model-manifest.json`; las librerias del modelo se compilan por separado.

Conviene advertir que la informacion publica sobre el modelo base es parcial y en algunos puntos contradictoria: la model card del modelo base de Google alude a tecnologia VLM, mientras que una fuente externa describe la variante E2B como de solo texto. Esta ficha recoge ambos datos y marca explicitamente lo que no esta confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (familia Gemma 4 de Google; la model card del modelo base menciona tecnologia VLM) |
| Parametros totales | 2.100 millones (2,1 B) segun gemma4.dev; no confirmado en la model card del repositorio |
| Parametros activos | No disponible |
| Longitud de contexto | 8.000 tokens (8K) segun gemma4.dev; no confirmado en la model card del repositorio |
| Tipos de cuantizacion | q4f16_1 (pesos de 4 bits, activaciones float16) para MLC |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC (mlc-llm); incluye `mlc-model-manifest.json` y pesos del adaptador de audio; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

No se proporciona informacion detallada sobre la arquitectura interna del modelo base google/gemma-4-E2B-it ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo unico confirmado en la model card de este repositorio es que se trata de una conversion del modelo original de Google, ya ajustado a instrucciones (sufijo `-it`), al formato de MLC LLM aplicando la cuantizacion q4f16_1.

La innovacion tecnica de esta publicacion es, por tanto, de empaquetado y cuantizacion, no de entrenamiento. La cuantizacion q4f16_1 reduce los pesos a 4 bits y mantiene las activaciones en float16, un esquema de cuantizacion por grupos habitual en MLC LLM orientado a minimizar la perdida de calidad y a habilitar la inferencia en hardware de baja capacidad. El paquete incorpora tambien los pesos del adaptador de audio, lo que sugiere soporte multimodal de audio, aunque no se detalla el mecanismo ni el alcance de esa capacidad.

## Capacidades

- Generacion de texto e instrucciones: el modelo base esta ajustado a instrucciones (`-it`), por lo que se espera seguimiento de prompts directos y conversacion.
- Razonamiento, flujos agenticos y codigo: la documentacion de Google sobre la familia Gemma 4 situa estos modelos como aptos para razonamiento, flujos de trabajo con agentes y programacion.
- Comprension multimodal: la model card del modelo base menciona tecnologia VLM y este paquete incluye pesos de un adaptador de audio, aunque no se detalla que modalidades cubre exactamente.
- Inferencia en navegador: el formato MLC permite ejecutarlo con WebLLM sobre WebGPU.
- Inferencia en CPU y dispositivos de borde: la variante E2B se describe como ejecutable enteramente en CPU.
- Capacidades multilingues: no disponibles (no se listan idiomas en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Modo de pensamiento explicito: no disponible (no se menciona en la informacion proporcionada).

## Casos de uso

- Asistentes en navegador sin backend: gracias al formato MLC y a WebLLM, el modelo puede ejecutarse integramente en el navegador del usuario mediante WebGPU, lo que permite ofrecer un asistente conversacional sin enviar datos a un servidor.
- Aplicaciones de escritorio con requisitos de privacidad: al caber en hardware modesto y poder correr en CPU, es adecuado para herramientas ofimaticas o de texto que procesan documentos sensibles localmente sin conexion.
- Dispositivos de borde y sistemas embebidos: con 2,1 B de parametros en 4 bits, es candidato para asistentes de voz o texto en equipos con recursos limitados, donde no es viable desplegar modelos mayores.
- Prototipado rapido de funcionalidades de IA en front-end: permite validar flujos de generacion de texto en una aplicacion web antes de decidir si se migra a una API en servidor.
- Sistemas con latencia critica y sin red: al ejecutarse localmente, elimina la latencia de red y funciona en entornos aislados o sin conectividad.
- Educacion y demos offline: util para entornos de formacion o ferias donde se quiere mostrar IA generativa sin depender de infraestructura en la nube.
- Clasificacion y resumen de texto en local: tareas de resumen, extraccion de entidades o reformulacion sobre fragmentos que quepan en su ventana de contexto de 8K, ejecutadas en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 2,8 GB, lo que da una referencia del peso de los pesos cuantizados y artefactos incluidos.
- VRAM estimada: no disponible de forma oficial; con cuantizacion de 4 bits sobre 2,1 B de parametros, la huella de pesos es reducida (del orden de 1-2 GB), pero no se confirma ninguna cifra en la documentacion.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Viabilidad en GPU de consumo: la variante E2B se describe como ejecutable enteramente en CPU, por lo que deberia caber en practicamente cualquier GPU de consumo e incluso funcionar sin GPU dedicada.
- Opciones de despliegue: MLC LLM y WebLLM (formato nativo de este paquete). La model card no menciona vLLM, llama.cpp, Ollama ni TGI para esta conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| akaashrp/gemma-4-E2B-it-q4f16_1-MLC | 2,1 B (segun gemma4.dev) | 8K (segun gemma4.dev) | MLC | Apache 2.0 | Conversion comunitaria para MLC/WebLLM |
| google/gemma-4-E2B | No disponible | No disponible | Safetensors (modelo base) | Apache 2.0 | Modelo base de Google |
| welcoma/gemma-4-E2B-it-q4f16_1-MLC | 2,1 B (misma base) | 8K (misma base) | MLC | Apache 2.0 | Otra conversion a MLC del mismo modelo base |
| google/gemma-4-E4B | No disponible (familia Gemma 4) | No disponible | Safetensors | Apache 2.0 | Variante superior de la gama de borde |

Los datos de rendimiento comparado no estan disponibles, por lo que la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles (la model card no los detalla).
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo general de los modelos generativos, agravado en modelos pequenos como este.
- Limitaciones de contexto: la ventana de 8.000 tokens (segun fuente externa) es reducida si se compara con modelos de contexto largo, lo que limita tareas sobre documentos extensos.
- Limitaciones de idioma: no se especifican idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Restricciones de licencia: el repositorio y el modelo base se publican bajo Apache 2.0, lo que en principio permite uso comercial; conviene revisar igualmente los terminos de Gemma 4 enlazados en la model card (`https://ai.google.dev/gemma/docs/gemma_4_license`).
- Contradiccion documentada: una fuente externa describe E2B como de solo texto, mientras que la model card del modelo base menciona tecnologia VLM y este paquete incluye pesos de un adaptador de audio. Conviene verificar la capacidad multimodal antes de disenar un producto que dependa de ella.
- Caveat de produccion: la cuantizacion de 4 bits puede degradar la calidad respecto a los pesos originales; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Madurez del repositorio: cero descargas y cero "likes" en el momento de la consulta, con fecha de creacion y actualizacion muy cercanas; se trata de un artefacto sin validacion comunitaria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/akaashrp/gemma-4-E2B-it-q4f16_1-MLC
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base (variante no ajustada a instrucciones): https://huggingface.co/google/gemma-4-E2B
- Conversion alternativa del mismo modelo base a MLC: https://huggingface.co/welcoma/gemma-4-E2B-it-q4f16_1-MLC
- Pagina de la familia Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentacion de Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Ficha externa de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de MLC LLM: https://github.com/mlc-ai/mlc-llm
- Repositorio de WebLLM: https://github.com/mlc-ai/web-llm
