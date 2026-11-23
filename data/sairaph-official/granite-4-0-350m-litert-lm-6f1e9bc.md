# sairaph-official/granite-4.0-350m-litert-lm-6f1e9bc

## Resumen

`granite-4.0-350m-litert-lm` es una conversion del modelo base `ibm-granite/granite-4.0-350m` de IBM al formato `.litertlm` para inferencia en dispositivo mediante LiteRT-LM (Google AI Edge). El repositorio analizado es un espejo sin modificaciones mantenido por el usuario `sairaph-official` para la aplicacion LLM Server, que replica byte a byte el bundle del repositorio upstream `litert-community/granite-4.0-350m-litert-lm` en el commit `6f1e9bc`.

El modelo resuelve el problema de ejecutar un LLM de 350 millones de parametros en entornos de borde (Android, iOS, escritorio y sistemas embebidos) sin dependencia de un servidor remoto. El bundle incluye un unico fichero de 468.209.584 bytes (aproximadamente 0,44 GiB) con pesos cuantizados a int8 dinamico, tokenizador y plantilla de chat embebidos, y una cache KV estatica limitada a 1280 tokens.

La relevancia actual reside en que permite desplegar generacion de texto con licencia Apache 2.0 en dispositivos sin GPU dedicada, con un backend CPU validado y un endpoint compatible con la API de OpenAI servido localmente. No se trata de un modelo nuevo: es un artefacto de conversion y empaquetado, por lo que sus capacidades y limitaciones heredan las del modelo base de IBM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (reinterpretacion de `GraniteMoeHybridForCausalLM`, todo atencion, como `GraniteForCausalLM`) |
| Parametros totales | 350 millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE en la practica; el wrapper hibrido es todo atencion) |
| Longitud de contexto | 1280 tokens (cache KV estatica del bundle) |
| Tipos de cuantizacion | int8 dinamico con activaciones fp32 (`dynamic_wi8_afp32`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (`granite-4.0-350m_q8_ekv1280.litertlm`) |

## Arquitectura y entrenamiento

El bundle parte del checkpoint `ibm-granite/granite-4.0-350m`, publicado bajo la clase `GraniteMoeHybridForCausalLM`, que en este caso es integramente de atencion. Dado que ese wrapper no es compatible con `torch.export` frente a una cache estatica (referencia litert-torch#933), la receta de conversion aplica primero una reinterpretacion densa sin perdida como `GraniteForCausalLM`, exporta el codigo de modelado propio del checkpoint con `transformers` mediante `torch.export` (fases de prefill y decode con cache KV estatica), cuantiza con el AI Edge Quantizer y empaqueta el tokenizador y la plantilla de chat de Hugging Face. La herramienta empleada es `litert-torch==0.9.1` con el exportador generico `generative.export_hf`, sin builder especifico por familia.

No se ha realizado entrenamiento adicional: la composicion y gobernanza de los datos son las del modelo base de IBM. El autor declara que toda la informacion personal identificable ha sido eliminada de los datos de entrenamiento. La conversion incluye evidencia de paridad registrada en `parity_report.json`: en la reinterpretacion de pesos, coincidencia de argmax del 100 % sobre 5 prompts y diferencia maxima absoluta de logits de `7.41e-05`; en tiempo de ejecucion frente a la referencia de Hugging Face con decodificacion greedy, coincidencia exacta de texto del 20 % y contencion de la referencia en la salida del dispositivo del 20 %. El propio autor advierte que LiteRT-LM no expone logits, por lo que la paridad es textual y no de logits, y que generaciones largas pueden divergir por la cuantizacion int8 y la sensibilidad del argmax greedy.

## Capacidades

- Generacion de texto autoregresiva en dispositivo, con plantilla de chat aplicada automaticamente por el bundle.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 350 millones de parametros.
- Servicio local mediante endpoint compatible con la API de OpenAI (`/v1/chat/completions`) a traves de `litert-lm serve`.
- Ejecucion por linea de comandos con `litert-lm run`.
- Inferencia en CPU validada; otros backends no han sido probados en esta conversion.
- Soporte de tool calling, agentes, vision, audio, modo thinking y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes embebidos en aplicaciones moviles: el bundle de 0,44 GiB y la cuantizacion int8 permiten incluirlo en apps Android o iOS para respuestas offline sin enviar datos a un servidor, con conversaciones acotadas a 1280 tokens.
- Clasificacion y etiquetado de texto en el borde: resumen de notas, extraccion de entidades simples o categorizacion de mensajes en dispositivos con CPU, usando el endpoint compatible con OpenAI para integrarlo con SDKs existentes.
- Prototipado rapido de interfaces conversacionales: `litert-lm serve` expone una API local en el puerto 9379 que permite conectar frontends y frameworks de agentes sin infraestructura de GPU.
- Aplicaciones de escritorio con privacidad estricta: procesamiento de texto en local en portatiles sin GPU dedicada, donde el modelo actua como generador de borradores o respuestas cortas.
- Sistemas embebidos y domotica: generacion de respuestas y comandos en lenguaje natural en dispositivos con recursos limitados, siempre que la longitud de contexto no supere los 1280 tokens.
- Pruebas de regresion y evaluacion de pipelines de conversion: el repositorio incluye `parity_report.json` y una receta reproducible con `litert-torch==0.9.1`, util para validar futuras conversiones de modelos de la familia Granite.
- Filtrado y preprocesado en pipelines de datos: tareas de normalizacion o reescritura de texto a gran escala en CPU, donde el bajo coste por token compensa la menor calidad frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la paridad de conversion:

| Metrica | Resultado |
|---|---|
| Paridad de remapeo de pesos (argmax) | 100,0 % sobre 5 prompts |
| Diferencia maxima absoluta de logits (remapeo) | 7,41e-05 |
| Coincidencia exacta de texto (HF vs `.litertlm`, greedy) | 20,0 % sobre 5 prompts |
| Referencia contenida en salida del dispositivo | 20,0 % sobre 5 prompts |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el backend validado (CPU); el fichero de pesos ocupa 468.209.584 bytes y requiere memoria RAM suficiente para pesos int8, activaciones fp32 y cache KV de 1280 tokens.
- GPU recomendadas: no disponible; la conversion solo ha sido validada en CPU.
- Cabe en GPU de consumo: no hay datos de ejecucion en GPU para este bundle; el modelo base de 350 millones es lo bastante pequeno para caber en cualquier GPU de consumo moderna, pero esa ruta no esta validada en esta conversion.
- Opciones de despliegue: LiteRT-LM (CLI `litert-lm run` y servidor `litert-lm serve` con endpoint compatible con OpenAI). vLLM, llama.cpp, Ollama y TGI no son compatibles con el formato `.litertlm`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.0-350m-litert-lm (este) | 350 M | 1280 tokens | `.litertlm` (int8) | Apache 2.0 | Hugging Face (espejo y upstream) |
| ibm-granite/granite-4.0-350m | 350 M | no disponible | safetensors (formato original) | Apache 2.0 | Hugging Face |
| Otros modelos de borde comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria no esta cubierta en la informacion proporcionada; el unico contraste verificable es con el modelo base del que deriva.

## Limitaciones y advertencias

- La cuantizacion int8 puede producir diferencias frente a la referencia fp32, especialmente en generaciones greedy largas; la paridad textual medida es del 20 % sobre 5 prompts.
- El contexto esta limitado a 1280 tokens por la cache KV estatica del bundle, muy por debajo de los modelos de proposito general.
- Solo se ha validado el backend CPU; el comportamiento en GPU u otros aceleradores no esta probado.
- El modelo base de 350 millones tiene capacidad limitada de razonamiento, matematicas y codigo; no debe esperarse calidad de modelos de mayor escala.
- Riesgo de alucinacion inherente a modelos pequenos y a la decodificacion greedy; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no disponible en la informacion proporcionada; se heredan los del modelo base de IBM.
- Idiomas soportados: no disponible; la model card no detalla cobertura linguistica.
- Licencia Apache 2.0 permite uso comercial, pero el espejo anade un fichero `LICENSE` propio y el repositorio upstream no incluye avisos adicionales; conviene verificar la licencia del modelo base antes de desplegar.
- El repositorio es un espejo de terceros con 0 descargas y 0 likes; la fuente canonica es el repositorio upstream de `litert-community`.

## Enlaces

- Repositorio del espejo: https://huggingface.co/sairaph-official/granite-4.0-350m-litert-lm-6f1e9bc
- Repositorio upstream de la conversion: https://huggingface.co/litert-community/granite-4.0-350m-litert-lm
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- litert-torch: https://github.com/google-ai-edge/litert-torch
- Issue de compatibilidad citado (litert-torch#933): https://github.com/google-ai-edge/litert-torch/issues/933
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
