# OpenFlowLM/Translategemma-4B-Instruct-NPU2

## Resumen

Translategemma-4B-Instruct-NPU2 es una redistribucion del modelo TranslateGemma 4B Instruct de Google, publicada por OpenFlowLM y empaquetada especificamente para su ejecucion en las NPU de AMD Ryzen AI. TranslateGemma es una familia de modelos de traduccion automatica de pesos abiertos construida sobre la familia Gemma 3, disenada para cubrir 55 idiomas con un tamano reducido que permite desplegarla en portatiles, equipos de sobremesa o infraestructura propia.

El modelo es multimodal en la entrada: acepta tanto cadenas de texto como imagenes normalizadas a 896x896, que se codifican en 256 tokens cada una, y devuelve como salida el texto traducido al idioma destino. La variante NPU2 anade soporte de ejecucion sobre aceleradores neuronales AMD (Ryzen AI) a traves del stack FastFlowLM, lo que permite inferencia local sin depender de una GPU dedicada.

Su relevancia actual radica en que combina una tarea muy concreta (traduccion de texto y de texto presente en imagenes) con un formato optimizado para hardware de consumo de bajo consumo energetico, un nicho poco cubierto por los modelos generalistas. El contexto total de entrada esta limitado a 2K tokens, por lo que el diseno prioriza la calidad de traduccion sobre la gestion de contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal basado en la familia Gemma 3 (tag `gemma3_text`); imagenes normalizadas a 896x896 y codificadas en 256 tokens cada una |
| Parametros totales | Aproximadamente 4.000 millones (deducido del nombre del modelo; no confirmado explicitamente en la informacion disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2K tokens de entrada en total (segun la model card) |
| Tipos de cuantizacion | no disponible; el repositorio ocupa 4,8 GB, compatible con pesos optimizados para NPU |
| Idiomas soportados | 55 idiomas (segun la model card de TranslateGemma); la lista completa no esta disponible |
| Licencia | Gemma (Terminos de uso de Gemma; acceso restringido con aceptacion previa de licencia) |
| Formato de pesos | Libreria `transformers` (previsiblemente safetensors); el despliegue en NPU emplea binarios `xclbin` segun el repositorio FastFlowLM |

## Arquitectura y entrenamiento

La model card indica que TranslateGemma se basa en la familia Gemma 3 de Google. Se trata de un transformer decoder-only al que se incorpora un encoder de vision para procesar entradas de imagen: cada imagen se normaliza a 896x896 píxeles y se representa como 256 tokens, que se concatenan al contexto textual. El contexto total de entrada esta acotado a 2K tokens, lo que refleja un enfoque de modelo especializado en traduccion y no en conversacion de proposito general.

La interfaz de uso esta fuertemente tipada mediante una plantilla de chat propia que solo admite los roles `User` y `Assistant`. El contenido del mensaje de usuario debe ser una lista con exactamente una entrada, que declare un `type` (`text` o `image`), un `source_lang_code` y un `target_lang_code` en formato ISO 639-1 (por ejemplo `en`) o regionalizado (por ejemplo `en_US` o `en-GB` al estilo CLDR). Si los codigos de idioma no estan soportados, la plantilla lanza un error. La model card menciona tecnicas alternativas de prompting, como la postedicion automatica de traducciones, que no estan oficialmente soportadas y deben construirse manualmente con los tokens de control descritos en el informe tecnico de Gemma 3.

No se dispone de informacion en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO. El informe tecnico de TranslateGemma esta referenciado en la model card (arXiv:2601.09012) como fuente para esos detalles.

## Capacidades

- Traduccion de texto entre pares de idiomas declarados explicitamente mediante codigos ISO 639-1 o regionalizados.
- Extraccion y traduccion de texto presente en imagenes (OCR integrado dentro del flujo de traduccion), con entrada normalizada a 896x896.
- Cobertura de 55 idiomas segun la documentacion del modelo original.
- Plantilla de chat especifica para tareas de traduccion, con control explicito de idioma origen y destino.
- Soporte de la funcion `apply_chat_template()` de `transformers` a traves del tokenizador Gemma y el procesador Gemma 3.
- Compatibilidad con la pipeline `image-text-to-text` de `transformers`.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso ni modo "thinking".
- No se documentan capacidades de audio.

## Casos de uso

- Traduccion de documentos en local: el modelo puede ejecutarse sobre una NPU AMD Ryzen AI sin GPU dedicada, traduciendo bloques de texto de hasta 2K tokens por pasada, lo que encaja en flujos de trabajo donde la confidencialidad impide enviar contenido a la nube.
- Traduccion de carteles y senaletica a partir de fotografias: gracias a la entrada de imagen, se puede capturar una foto de un cartel y obtener directamente el texto traducido, util en aplicaciones de viaje o accesibilidad.
- Digitalizacion y traduccion de documentos escaneados: combinando la extraccion de texto desde imagen y la traduccion en una sola llamada, resulta adecuado para digitalizar facturas, formularios o menus en otro idioma.
- Subtitulado y localizacion de contenido corto: la ventana de 2K tokens permite traducir segmentos de subtitulos o parrafos de interfaz de forma secuencial, integrándose en pipelines de localizacion.
- Asistencia en atencion al cliente multilingue: el modelo puede traducir mensajes entrantes y salientes en tiempo real dentro de un sistema de tickets, siempre que cada mensaje quepa en el contexto disponible.
- Traduccion embebida en aplicaciones de escritorio o movilidad: al estar optimizado para NPU Ryzen AI, puede integrarse en software de productividad que necesite traduccion offline sin consumo elevado de bateria.
- Postedicion automatica de traduccion: la model card menciona este caso como posible mediante prompts manuales con tokens de control, aunque no esta oficialmente soportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en cuantizacion de 8 bits y en torno a 8-9 GB en bfloat16, tomando como referencia un modelo denso de 4B parametros. Estas cifras son estimaciones y no aparecen confirmadas en la informacion proporcionada.
- Hardware objetivo principal: NPU AMD Ryzen AI, mediante el stack FastFlowLM. Los repositorios de FastFlowLM incluyen binarios `xclbin` especificos para esta variante.
- GPU compatibles: cualquier GPU con al menos 8 GB de VRAM deberia poder ejecutar la version bfloat16; una RTX 3060 de 12 GB o superior es suficiente. En cuantizacion de 8 bits cabe en GPUs de 6 GB.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y equivalentes, siempre que se use la cuantizacion adecuada.
- Opciones de despliegue: `transformers` con la pipeline `image-text-to-text`, FastFlowLM para NPU AMD Ryzen AI. No se confirma soporte oficial de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Translategemma-4B-Instruct-NPU2 | ~4B | 55 | 2K tokens | Gemma (uso comercial permitido bajo condiciones) | Multimodal (texto e imagen), optimizado para NPU AMD |
| NLLB-200-distilled-600M (Meta) | 600M | 200 | ~512 tokens | CC-BY-NC-4.0 (no comercial) | Solo texto, amplia cobertura de idiomas |
| SeamlessM4T-v2 (Meta) | ~2,3B | ~100 (texto) | ~no disponible | CC-BY-NC-4.0 (no comercial) | Traduccion texto, voz y habla; uso no comercial |
| MADLAD-400-3B-MT (Google) | 3B | 400+ | ~no disponible | Apache-2.0 | Solo texto, licencia permisiva |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El contexto de entrada esta limitado a 2K tokens, lo que restringe la traduccion de documentos largos a una unica pasada y obliga a segmentar el contenido.
- El modelo esta especializado en traduccion; no es un asistente conversacional general y su plantilla de chat solo admite los roles `User` y `Assistant`.
- Riesgo de alucinacion o de insercion de texto no presente en la imagen durante la extraccion y traduccion desde entradas visuales.
- Puede heredar sesgos presentes en los datos de entrenamiento de la familia Gemma 3, incluyendo sesgos culturales o de genero en las traducciones.
- La licencia Gemma impone condiciones de uso, requiere aceptar los terminos de Google y establece restricciones de uso aceptable que deben revisarse antes de un despliegue comercial.
- El acceso al modelo esta sujeto a un proceso de aceptacion de licencia (gated) en Hugging Face.
- Esta publicacion es una redistribucion de terceros (OpenFlowLM / FastFlowLM) del modelo original de Google; conviene verificar la integridad de los pesos y usar como referencia el modelo oficial `google/translategemma-4b-it`.
- La lista completa de los 55 idiomas soportados no esta disponible en la informacion proporcionada, por lo que es necesario consultar el informe tecnico antes de asumir cobertura para un idioma concreto.
- Los codigos de idioma no soportados provocan un error en la aplicacion de la plantilla de chat, lo que exige validacion previa en produccion.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, por lo que no es adecuado como motor de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenFlowLM/Translategemma-4B-Instruct-NPU2
- Repositorio FastFlowLM del mismo modelo: https://huggingface.co/FastFlowLM/Translategemma-4B-Instruct-NPU2
- Arbol de ficheros del modelo en FastFlowLM: https://huggingface.co/FastFlowLM/Translategemma-4B-Instruct-NPU2/tree/main
- Repositorio GitHub de FastFlowLM: https://github.com/ROCm/FastFlowLM
- Carpeta del modelo en el repositorio FastFlowLM: https://github.com/ROCm/FastFlowLM/tree/main/src/xclbins/Translategemma-4B-Instruct-NPU2
- Documentacion de TranslateGemma en FastFlowLM: https://fastflowlm.com/docs/models/translategemma/
- Informe tecnico de TranslateGemma: https://arxiv.org/pdf/2601.09012
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- TranslateGemma en Kaggle: https://www.kaggle.com/models/google/translategemma/
- TranslateGemma en Vertex AI Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/translategemma
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
