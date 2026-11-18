# LiquidAI/LFM2.5-1.2B-Instruct-GGUF

## Resumen

LFM2.5-1.2B-Instruct-GGUF es la distribucion en formato GGUF del modelo LFM2.5-1.2B-Instruct de Liquid AI, un modelo de lenguaje de 1.170 millones de parametros disenado especificamente para despliegue en dispositivo (edge). Forma parte de la familia LFM2.5, que parte de la arquitectura hibrida LFM2 y anade preentrenamiento extendido y aprendizaje por refuerzo. El repositorio incluye pesos cuantizados listos para llama.cpp, ademas de un checkpoint QAD (Quantization-Aware Distillation) en Q4_0 y sus pesos fuente en safetensors para ajuste fino.

El modelo resuelve el problema de ejecutar generacion de texto conversacional de calidad en hardware modesto, con un contexto y un conjunto de idiomas que cubren ocho lenguas (ingles, arabe, chino, frances, aleman, japones, coreano y espanol). Su relevancia actual radica en la combinacion de un tamano muy contenido con soporte multilingue amplio y una licencia propia (lfm1.0) que condiciona el uso comercial.

La ficha se centra en la variante GGUF, que es la publicada en este repositorio y la que permite inferencia local sin GPU dedicada. Los detalles completos de arquitectura y entrenamiento se remiten a la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida LFM2 (familia LFM2.5), orientada a edge |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_0 (post-training) y Q4_0 QAD; pesos fuente FP32 en safetensors (`qad/`) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

La model card indica que LFM2.5 es una familia de modelos hibridos construida sobre la arquitectura LFM2, con preentrenamiento extendido y una fase de aprendizaje por refuerzo. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni los detalles concretos del esquema hibrido (atencion, SSM u otras capas), por lo que esos datos deben consultarse en la model card del modelo base.

La innovacion tecnica destacable de este repositorio es la incorporacion de un checkpoint entrenado con Quantization-Aware Distillation (QAD) y publicado como GGUF Q4_0, distinto del Q4_0 obtenido por cuantizacion posterior al entrenamiento. El autor advierte que los resultados publicados de QAD aplican al GGUF Q4_0 y que la inferencia directa en FP32/BF16 u otros formatos de cuantizacion puede comportarse de forma distinta. Los pesos fuente QAD en FP32 estan pensados para ajuste fino y experimentacion.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, tag conversational).
- Soporte multilingue en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Ejecucion local mediante llama.cpp con plantilla de chat incluida.
- Ajuste fino posible a partir de los pesos fuente QAD en safetensors.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo puede gestionar dialogos multi-turno en movil, portatil o hardware embebido gracias a sus 1.170 millones de parametros y a la distribucion GGUF Q4_0, que reduce el peso en disco y memoria.
- Aplicaciones multilingues de atencion al cliente: al cubrir espanol, frances, aleman, arabe, chino, japones y coreano, permite atender usuarios en su idioma sin desplegar varios modelos.
- Procesamiento de texto en local con privacidad: al ejecutarse con llama.cpp sin conexion, es adecuado para entornos donde los datos no pueden salir del dispositivo.
- Prototipado rapido de chatbots: la invocacion con `llama-cli -hf` y la plantilla de chat incluida permiten tener un asistente funcional en pocos minutos.
- Ajuste fino para dominios verticales: los pesos QAD en safetensors del subdirectorio `qad/` permiten adaptar el modelo a tareas especificas mediante Transformers.
- Generacion de texto en herramientas de escritorio: integrable en editores, asistentes de terminal o utilidades ofimaticas que requieran generacion de texto sin depender de la nube.
- Evaluacion de tecnicas de cuantizacion: la coexistencia de un Q4_0 post-training y un Q4_0 QAD permite comparar el impacto de la destilacion consciente de cuantizacion en un mismo formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con cuantizacion Q4_0 un modelo de 1.170 millones de parametros ocupa del orden de menos de 1 GB en pesos, aunque la cifra exacta no se proporciona.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: el diseno edge y el formato GGUF sugieren viabilidad en hardware de consumo, pero no se confirma con datos concretos.
- Opciones de despliegue: llama.cpp (documentado en la model card) y Transformers con los pesos del subdirectorio `qad/`. Otras opciones como vLLM, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Parametros de generacion sugeridos: `--temp 0.1 --top-k 50 --repeat-penalty 1.05`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia lfm1.0 (license: other): es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que no es una licencia open source estandar.
- Los resultados publicados del checkpoint QAD aplican al GGUF Q4_0; la inferencia en FP32/BF16 u otras cuantizaciones puede diferir.
- No se dispone de datos sobre sesgos conocidos, riesgo de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- La longitud de contexto no se especifica, lo que impide planificar cargas con ventanas largas sin consultar la model card del modelo base.
- El soporte de tool calling, agentes y razonamiento multi-paso no esta documentado en esta ficha.
- El repositorio ocupa 18,3 GB, aunque la descarga de un unico archivo GGUF Q4_0 es mucho menor.
- Al ser un modelo de 1.170 millones de parametros, su capacidad de razonamiento complejo es limitada en comparacion con modelos de mayor tamano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Checkpoint QAD Q4_0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF/blob/main/LFM2.5-1.2B-Instruct-QAD-Q4_0.gguf
- Pesos fuente QAD: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF/tree/main/qad
- Documentacion del checkpoint fuente QAD: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF/blob/main/qad/README.md
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Contacto comercial: https://www.liquid.ai/contact
