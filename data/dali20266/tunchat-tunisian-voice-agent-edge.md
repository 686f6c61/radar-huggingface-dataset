# Dali20266/TunCHAT-Tunisian-Voice-Agent-EDGE

## Resumen

TunCHAT-Tunisian-Voice-Agent-EDGE es la distribucion optimizada para inferencia local en dispositivos del modelo conversacional TunCHAT-V0.2, desarrollado por el usuario Dali20266 sobre su version mergeada TunCHAT-Tunisian-Voice-Agent-MERGED. Se trata de un modelo de generacion de texto de aproximadamente 2.610 millones de parametros, licenciado bajo Apache 2.0 y especializado en arabe tunecino (derja, codigo `aeb`) y arabe estandar (`ar`), con un enfoque claro hacia asistentes conversacionales de voz.

El modelo se publica directamente en formatos de despliegue ligero: variantes GGUF cuantizadas para llama.cpp y Ollama, y un bundle en formato LiteRT-LM de Google AI Edge orientado a MediaPipe GenAI con descarga de computo en NPU. El objetivo declarado es ejecutarlo en moviles como el Samsung Galaxy S24 Ultra (Snapdragon 8 Gen 3, GPU Adreno 750) y en portatiles, manteniendo un consumo de memoria en torno a 1,6 GB en su cuantizacion mas agresiva.

Su relevancia actual reside en cubrir un nicho poco atendido por los modelos generalistas: la conversacion natural y breve en dialecto tunecino, con un formato pensado para agentes de voz en el borde (edge). Al ser una publicacion reciente y con cero descargas en el momento de la consulta, carece de benchmarks publicos y de documentacion detallada sobre arquitectura, datos de entrenamiento y longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no detallada en la model card; el template de chat usa formato ChatML con tokens `<\|im_start\|>` y `<\|im_end\|>`) |
| Parametros totales | 2.614.341.888 (~2,61 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M, IQ4_NL, Q5_K_M, Q8_0; mas bundle LiteRT-LM para Google AI Edge |
| Idiomas soportados | aeb (arabe tunecino / derja), ar (arabe) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) y LiteRT-LM (MediaPipe GenAI); repositorio principal, 8,1 GB |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna ni el proceso de entrenamiento del modelo base. Por el identificador del modelo subyacente (MERGED) y por el uso del template ChatML con los tokens `<|im_start|>` y `<|im_end|>`, se trata previsiblemente de un transformer decoder-only resultante de la fusion de pesos de modelos previos, aunque este extremo no se confirma en la documentacion disponible. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Esta ficha corresponde a la version EDGE, es decir, a la conversion del modelo mergeado a formatos de cuantizacion para inferencia local. La informacion tecnica aportada se limita a las estrategias de cuantizacion (Q4_K_M, IQ4_NL, Q5_K_M y Q8_0), el soporte de aceleracion por NPU Vulkan/Qualcomm Snapdragon y la integracion con los SDK LiteRT-LM y MediaPipe GenAI. No se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en arabe tunecino (derja) y arabe, con un estilo breve y directo segun el system prompt incluido ("asistente de voz tunecino, responde en tunecino natural, corto y directo como en una llamada telefonica").
- Orientacion a agentes de voz: el modelo se presenta como la capa de lenguaje de un asistente conversacional de voz, aunque este repositorio no incluye explicitamente componentes de ASR ni TTS.
- Inferencia local en movil y portatil mediante formatos cuantizados ligeros (desde 1,53 GB).
- Despliegue multiplataforma: compatible con Ollama, llama.cpp CLI y el stack Google AI Edge (LiteRT-LM / MediaPipe GenAI).
- Aceleracion por hardware en NPU Qualcomm Snapdragon 8 Gen 3 y GPU Adreno 750.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de codigo, matematicas o vision: no disponible.
- Modo thinking o cadena de razonamiento explicita: no disponible.

## Casos de uso

- Asistente de voz en movil tunecino: integrado en una app Android mediante LiteRT-LM o MediaPipe GenAI, el modelo gestiona la respuesta de texto en derja a las consultas del usuario, delegando ASR y TTS en el pipeline, con un consumo de RAM de aproximadamente 1,6 GB que deja libre el resto del telefono.
- Turismo y atencion local: dado el ejemplo incluido en la model card ("cual es el mejor lugar para visitar en Tunez en verano"), encaja en guias o chatbots turisticos que responden en dialecto tunecino de forma concisa.
- Call centers y soporte telefonico: el system prompt orienta a respuestas breves propias de una llamada, lo que permite construir agentes de atencion que respondan en derja sin el tono formal del arabe estandar.
- Despliegue offline en dispositivos sin conectividad: gracias a los GGUF de 1,5-1,8 GB, el modelo puede ejecutarse en portatiles y equipos con CPU, util para entornos con red limitada.
- Integracion rapida con Ollama y llama.cpp: mediante el `Modelfile` incluido, un desarrollador puede poner en marcha un prototipo conversacional en dialecto tunecino en pocos minutos.
- Investigacion en dialectologia arabe: sirve como base para estudiar generacion de texto en `aeb` y comparar comportamiento frente a modelos multilingues generalistas.
- Pruebas de cuantizacion en hardware movil: util para evaluar el rendimiento de IQ4_NL frente a Q4_K_M en NPU Qualcomm.
- Componente de texto en un agente multimodal de voz completo: encaja como modulo LLM dentro de una arquitectura mas amplia que incluya reconocimiento y sintesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, ni de tareas en arabe tunecino, ni comparaciones cuantitativas frente a otros modelos.

## Requisitos de hardware

- VRAM/RAM aproximada para inferencia segun cuantizacion (sobre pesos de ~2,61 B):
  - IQ4_NL (1,53 GB): ~1,6 GB.
  - Q4_K_M (1,59 GB): ~1,7 GB.
  - Q5_K_M (1,79 GB): ~2,0 GB.
  - Q8_0 (2,59 GB): ~3,0 GB.
  - FP16 (referencia teorica): ~5,2 GB.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o mas de VRAM (por ejemplo, RTX 3050 en adelante) puede ejecutar las variantes Q4 y Q5.
- Movil de referencia: Samsung Galaxy S24 Ultra (Snapdragon 8 Gen 3, Adreno 750), con recomendacion explicita de usar IQ4_NL con acelerador Vulkan/NPU o el bundle LiteRT-LM; el modelo card indica que requiere ~1,6 GB de RAM, dejando mas de 10 GB libres.
- GPU de datacenter (A100, H100) no son necesarias dado el tamano del modelo; pueden usarse pero quedan sobredimensionadas.
- Opciones de despliegue: Ollama, llama.cpp (CLI), Google AI Edge LiteRT-LM y MediaPipe GenAI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad dentro de la categoria de modelos edge de 2-3 B orientados a despliegue local.

| Modelo | Parametros | Contexto | Licencia | Formatos / disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| TunCHAT-Tunisian-Voice-Agent-EDGE | ~2,61 B | no disponible | apache-2.0 | GGUF, LiteRT-LM | Especializado en aeb/ar |
| Qwen2.5-3B-Instruct | ~3,09 B | no disponible en la ficha de este modelo (dato no verificado aqui) | apache-2.0 | GGUF, safetensors | Multilingue generalista; sin datos de derja |
| Llama-3.2-3B-Instruct | ~3,2 B | no disponible en la ficha de este modelo (dato no verificado aqui) | Llama 3.2 Community License | GGUF, safetensors | Multilingue generalista; licencia no Apache |
| Gemma-2-2B-it | ~2,6 B | no disponible en la ficha de este modelo (dato no verificado aqui) | Gemma Terms of Use | GGUF, safetensors | Multilingue generalista; licencia no Apache |

No se dispone de comparaciones de rendimiento cuantitativas entre TunCHAT y estos modelos en la informacion proporcionada. Los datos de contexto y de licencia de los modelos alternativos deben verificarse en sus respectivas fichas oficiales antes de usarse como referencia.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna metrica publicada que permita validar la calidad de las respuestas en derja ni compararla con alternativas.
- Documentacion incompleta: no se especifican arquitectura exacta, longitud de contexto, dataset de entrenamiento ni proceso de alineacion.
- Riesgo de alucinacion: no cuantificado; al ser un modelo pequeno (~2,61 B) y sin datos de evaluacion, cabe esperar una mayor propension a errores factuales que en modelos de mayor tamano.
- Sesgos: no documentados. La especializacion en derja puede limitar la cobertura de variantes dialectales o de registro formal.
- Cobertura idiomatica restringida: solo se declaran `aeb` y `ar`; el rendimiento en otros idiomas (incluido el castellano) no esta garantizado.
- Componente de voz no incluido: pese al nombre "Voice-Agent", este repositorio contiene el modelo de texto; los modulos de ASR y TTS deben aportarse externamente.
- Adopcion nula: en el momento de la consulta presenta 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Licencia: Apache 2.0, permisiva para uso comercial, siempre que se respeten las obligaciones de atribucion y se conserven los avisos de licencia.
- Fecha de publicacion futura en el registro (2026-10-10): dato procedente de la plataforma, a verificar por el lector.
- Modelo base mergeado: los pesos derivan de una fusion, por lo que las condiciones de la licencia del modelo origen conviene revisarlas en el repositorio MERGED antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dali20266/TunCHAT-Tunisian-Voice-Agent-EDGE
- Modelo base (version mergeada): https://huggingface.co/Dali20266/TunCHAT-Tunisian-Voice-Agent-MERGED
- Google AI Edge / LiteRT-LM: no disponible en la informacion proporcionada
- MediaPipe GenAI: no disponible en la informacion proporcionada
- Ollama: no disponible en la informacion proporcionada
- llama.cpp: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
