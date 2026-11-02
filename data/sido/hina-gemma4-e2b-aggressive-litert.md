# Sido/hina-gemma4-e2b-aggressive-litert

## Resumen

Sido/hina-gemma4-e2b-aggressive-litert es un artefacto experimental publicado en HuggingFace que convierte a formato LiteRT-LM un modelo derivado de Gemma 4 E2B. En concreto, parte del GGUF cuantizado IQ3_M de HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive (un finetune "uncensored" de google/gemma-4-E2B-it), desquantiza los pesos de texto a FP16, los combina con los pesos no textuales y la configuracion originales de Gemma 4 E2B-it y los recuantiza con LiteRT Torch 0.10 en formato `dynamic_wi4_afp32`. El resultado es un unico fichero `.litertlm` de 2.553.876.096 bytes pensado para ejecutarse en navegador mediante WebGPU y `@litert-lm/core`.

El modelo resuelve un problema muy concreto: permitir inferencia local de un LLM en el navegador sin depender de servidores, usando el runtime LiteRT-LM de Google. No obstante, el autor lo presenta explicitamente como un artefacto experimental, no como sustituto del GGUF original, y advierte de que la recuantizacion adicional puede alterar el comportamiento y la calidad respecto al modelo de partida.

La relevancia es limitada y de nicho: se trata de una conversion tecnica de un modelo pequeno (familia E2B, orientada a edge) con fine-tuning agresivo/uncensored, validada unicamente en Chrome 156 sobre Apple M4 con WebGPU y con dos turnos cortos de conversacion en japones. No hay benchmarks, no hay validacion multimodal y el soporte de idiomas declarado es japones e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B); conversion a LiteRT-LM para WebGPU |
| Parametros totales | no disponible (familia E2B; cifra exacta no publicada en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `dynamic_wi4_afp32` (LiteRT Torch 0.10); origen IQ3_M GGUF; activaciones y KV-cache en FP16 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero de 2.553.876.096 bytes, SHA-256 `561cea63050b2d0d5d5fb723c878cdc3b3e66a00ee0146e9924f24a6ce0f8df8` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E2B, un transformer de la familia Gemma 4 orientada a despliegue en dispositivos edge. El proceso de esta publicacion no es un entrenamiento nuevo, sino una cadena de conversion: se toma el GGUF IQ3_M del finetune HauhauCS (revision `da8593c3e407afcd3e7da94ff2d69d77e2a28a48`), se desquantizan sus pesos de texto a FP16, se combinan con los pesos no textuales y la configuracion intactos de google/gemma-4-E2B-it (revision `3e22461f65e89153144f8adb70e3b8c2cc9845a7`) y se recuantiza con LiteRT Torch 0.10 en `dynamic_wi4_afp32`. Los tipos de tensor de activacion y KV-cache en BF16 se convierten a FP16 para el runtime WebGPU de LiteRT-LM, y se ajusta el orden de firma y los tipos de salida del embedder por capa para `@litert-lm/core` 0.19.0.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base Gemma 4 E2B-it ni sobre el proceso de fine-tuning aplicado por HauhauCS (si hubo RLHF, DPO u otra tecnica). El autor advierte que el resultado **no es bit-equivalente al GGUF** y que la cuantizacion adicional puede modificar el comportamiento y la calidad. La innovacion tecnica destacable es el propio pipeline de conversion a LiteRT-LM con soporte WebGPU para ejecucion en navegador.

## Capacidades

- Generacion de texto conversacional en japones e ingles (validado con dos turnos cortos en japones).
- Hereda las capacidades del finetune "uncensored/aggressive" de HauhauCS, orientado a reducir rechazos en las respuestas; no se detallan capacidades adicionales en la informacion disponible.
- Ejecucion local en navegador mediante WebGPU y `@litert-lm/core` 0.19.0.
- Capacidades multimodales: el modelo base Gemma 4 E2B-it es multimodal, pero el autor indica que el uso multimodal **no ha sido validado** en esta conversion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de chatbots en navegador: el fichero `.litertlm` puede cargarse con `@litert-lm/core` en Chrome con WebGPU para probar conversaciones locales sin backend, util para demos y pruebas de concepto de IA en el cliente.
- Experimentacion con modelos uncensored en edge: investigadores que quieran evaluar el comportamiento de un finetune agresivo en un runtime de navegador pueden usar este artefacto como punto de partida, asumiendo la perdida de fidelidad respecto al GGUF.
- Aplicaciones web offline-first: al ejecutarse en el navegador, permite ofrecer generacion de texto sin enviar datos a un servidor, adecuado para escenarios de privacidad en japones o ingles.
- Evaluacion comparativa de pipelines de cuantizacion: sirve para estudiar el impacto de la cadena IQ3_M → FP16 → `dynamic_wi4_afp32` frente al GGUF original en tareas de calidad y latencia.
- Pruebas de integracion de LiteRT-LM: desarrolladores que adopten el runtime de Google pueden usar este modelo como caso de prueba real de carga, inicializacion y generacion en WebGPU.
- Docencia y divulgacion: permite mostrar en un navegador como funciona un LLM local sin infraestructura, con la advertencia de que el contenido del finetune es agresivo y no apto para todos los publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una validacion cualitativa: inicializacion correcta y dos turnos cortos de conversacion en japones en Chrome 156 sobre Apple M4 con WebGPU y `@litert-lm/core` 0.19.0. No hay datos de latencia, throughput ni calidad medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el fichero pesa 2,55 GB, por lo que se necesita al menos esa cantidad de memoria de GPU disponible para cargar los pesos, mas el espacio de activaciones y KV-cache en FP16.
- GPU recomendadas: el autor solo valida Apple M4 con WebGPU en Chrome 156; no se especifican GPU de escritorio (A100, H100, RTX 4090) ni otras configuraciones.
- Compatibilidad con GPU de consumo: no confirmada; el artefacto esta pensado para WebGPU en navegador, no para CUDA.
- Opciones de despliegue: `@litert-lm/core` 0.19.0 sobre WebGPU en Chrome; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato `.litertlm`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Sido/hina-gemma4-e2b-aggressive-litert | no disponible (familia E2B) | no disponible | `.litertlm` (WebGPU) | gemma | Experimental, 0 descargas |
| HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive | no disponible (familia E2B) | no disponible | GGUF (IQ3_M) | gemma | Modelo de origen del finetune |
| google/gemma-4-E2B-it | no disponible (familia E2B) | no disponible | safetensors (formato original) | gemma | Modelo base oficial |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre estas variantes. La diferencia principal es el formato y el runtime: LiteRT-LM/WebGPU frente a GGUF y safetensors.

## Limitaciones y advertencias

- Artefacto experimental: el autor lo califica explicitamente como experimental y no como sustituto del GGUF original.
- Perdida de fidelidad: la cadena de recuantizacion (IQ3_M → FP16 → `dynamic_wi4_afp32`) no es bit-equivalente al modelo de origen y puede degradar la calidad.
- Validacion muy limitada: solo se probaron dos turnos cortos en japones en Chrome 156 sobre Apple M4; no se validaron conversaciones largas, calidad de salida, uso multimodal ni otros navegadores.
- Contenido agresivo/uncensored: el finetune de partida esta orientado a reducir rechazos, lo que implica mayor riesgo de contenido inapropiado, ofensivo o danoso; no es apto para produccion orientada al publico general sin filtros adicionales.
- Riesgo de alucinacion: inherente a los LLM y no evaluado en esta conversion.
- Idiomas limitados: solo japones e ingles declarados; el rendimiento en castellano no esta validado.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion; debe revisarse antes de cualquier despliegue.
- Sin benchmarks ni metricas de latencia/throughput publicadas.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sido/hina-gemma4-e2b-aggressive-litert
- Modelo de origen (finetune): https://huggingface.co/HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive
- Modelo base oficial: https://huggingface.co/google/gemma-4-E2B-it
- Documentacion de Gemma 4 en LiteRT-LM: https://developers.google.com/edge/litert-lm/models/gemma-4
