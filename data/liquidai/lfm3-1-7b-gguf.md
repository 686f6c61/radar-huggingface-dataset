# LiquidAI/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es la distribucion en formato GGUF de LFM3-1.7B, un modelo de lenguaje de 1.728.801.600 parametros desarrollado por Liquid AI. Esta publicacion no contiene pesos nuevos: es una conversion del checkpoint original pensada para inferencia local en CPU y GPU mediante llama.cpp, lo que permite ejecutar el modelo en equipos sin acelerador dedicado o con GPU de consumo.

El modelo pertenece a la familia LFM3 de Liquid AI y se distribuye con licencia lfm1.0, con soporte declarado para 17 idiomas (entre ellos castellano, ingles, frances, aleman, arabe, chino, japones, coreano, portugues, hindi y ruso). La version GGUF incluye ademas un checkpoint especifico entrenado con Quantization-Aware Distillation (QAD) sobre Q4_0, cuyo objetivo es recuperar la precision perdida por la cuantizacion a 4 bits.

Su relevancia practica esta en el tramo de ~1.700 millones de parametros: es un tamano que cabe en cualquier portatil moderno con cuantizacion Q4 y que permite desplegar generacion de texto con contexto conversacional sin depender de API externa. La model card de esta publicacion es deliberadamente escueta y remite a la del modelo base para arquitectura y detalles de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el autor remite a la model card de LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varias cuantizaciones; el repositorio referencia al menos Q4_K_M y un checkpoint QAD especifico en Q4_0 (`LFM3-1.7B-QAD-Q4_0.gguf`). Listado completo no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo: la model card de la version GGUF remite explicitamente a la del modelo base LFM3-1.7B para los detalles de arquitectura y uso. Las etiquetas del repositorio (`liquid`, `lfm3`) lo identifican como parte de la familia LFM3 de Liquid AI, pero no se especifica en esta publicacion si se trata de un transformer clasico, de una arquitectura hibrida o de un diseno propio de la casa, ni se indican numero de tokens de entrenamiento, composicion del corpus o si hubo fases de RLHF o DPO.

El unico detalle tecnico de entrenamiento documentado en esta publicacion es el proceso de Quantization-Aware Distillation aplicado al checkpoint Q4_0: el archivo `LFM3-1.7B-QAD-Q4_0.gguf` fue entrenado especificamente para recuperar la precision que se pierde al cuantizar a Q4_0. La model card incluye ademas recomendaciones de muestreo diferenciadas por tarea: `--temp 0.1 --top-k 50 --repeat-penalty 1.1` para uso conversacional general, y `--temp 1.0 --top-p 0.95 --top-k 20` para matematicas y ciencia, lo que sugiere que el autor ha calibrado el decode por dominio.

## Capacidades

- Generacion de texto conversacional multi-turno, con ajuste de plantilla conversacional (etiqueta `conversational`).
- Soporte multilingue declarado en 17 idiomas, incluido el castellano.
- Razonamiento matematico y cientifico: la model card proporciona una configuracion de muestreo especifica para matematicas y ciencia (`--temp 1.0 --top-p 0.95 --top-k 20`), lo que indica que el modelo ha sido evaluado o ajustado en ese dominio.
- Inferencia local en CPU y GPU mediante llama.cpp.
- Compatible con endpoints (`endpoints_compatible` en las etiquetas del repositorio), es decir, desplegable detras de infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; el pipeline declarado es unicamente `text-generation`.

## Casos de uso

- Asistente conversacional en local para escritorio: con ~1,7 B de parametros y cuantizacion Q4, el modelo se ejecuta integramente en un portatil sin conexion, lo que permite ofrecer un asistente de texto sin enviar datos a terceros.
- Clasificacion y reescritura de textos en castellano dentro de pipelines internos: el soporte nativo de es, pt, fr, de e it lo hace util para normalizar, resumir o reformatear documentacion en varias lenguas europeas desde una sola instancia.
- Generacion de codigo asistida en editores ligeros: al ser un modelo pequeno y compatible con llama.cpp, puede embeberse en plugins de autocompletado donde el coste por token y la latencia importan mas que la calidad punta.
- Procesamiento por lotes en CPU para equipos sin GPU: al estar en GGUF, permite ejecutar tareas de extraccion o etiquetado sobre volumenes grandes de texto en servidores sin acelerador, con el checkpoint QAD Q4_0 como opcion de compromiso entre tamano y precision.
- Chatbot de soporte de primer nivel con contexto limitado: adecuado para preguntas frecuentes y triaje, siempre que la longitud de contexto requerida encaje en la ventana del modelo (dato no disponible en esta publicacion) y se derive a un modelo mayor los casos complejos.
- Prototipado e investigacion de tecnicas de cuantizacion: el checkpoint QAD Q4_0 sirve como caso de estudio reproducible de destilacion consciente de cuantizacion, comparando su comportamiento frente a una cuantizacion Q4_0 estandar del mismo modelo.
- Traduccion y localizacion de soporte entre los 17 idiomas declarados, especialmente en combinaciones con el castellano como lengua de destino.
- Despliegue en dispositivos de borde (edge) y entornos air-gapped donde no se permite tráfico saliente a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (calculo a partir del numero de parametros; no son cifras publicadas por el autor): ~3,5 GB en FP16, ~1,8 GB en Q8, ~1,0-1,2 GB en Q4.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 4 GB o mas de VRAM para Q4/Q5; con 6-8 GB se puede usar Q8 e incluso FP16 en tarjetas de 8 GB ajustando el contexto.
- Ejecucion en CPU: viable en exclusiva, es el escenario principal de esta publicacion GGUF; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, cualquier RTX 3060/4060 o superior es suficiente; A100/H100 solo tendrian sentido para servir muchas instancias en paralelo, no por requisito de memoria.
- Opciones de despliegue: llama.cpp (soporte explicito, requiere una build compatible con LFM3), y por extension los runners que consumen GGUF (Ollama, llama-cpp-python, servidores basados en llama.cpp). vLLM y TGI no estan confirmados para este formato en la informacion disponible; para vLLM habria que partir del modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado cifras de tokens por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de contexto de este modelo, por lo que la comparacion se limita a parametros, licencia y formato. Los datos de los modelos alternativos son de referencia general del mercado y no han sido verificados contra la informacion de esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Datos en esta ficha |
|---|---|---|---|---|---|
| LFM3-1.7B-GGUF | 1.728.801.600 | no disponible | lfm1.0 | si (Q4_K_M, QAD Q4_0) | esta publicacion |
| Qwen3-1.7B | ~1,7 B | no disponible en esta busqueda | Apache 2.0 (referencia de mercado) | si | no verificado |
| SmolLM2-1.7B | ~1,7 B | no disponible en esta busqueda | Apache 2.0 (referencia de mercado) | si | no verificado |
| Gemma 3 1B | ~1 B | no disponible en esta busqueda | Gemma Terms (referencia de mercado) | si | no verificado |

Diferenciador observable: LFM3-1.7B es el unico de la lista con licencia propia (lfm1.0) y con un checkpoint entrenado mediante destilacion consciente de cuantizacion, lo que puede traducirse en menor degradacion a 4 bits. Como contrapartida, la licencia lfm1.0 exige revisar terminos antes de uso comercial y el ecosistema de herramientas es menor que el de Qwen o SmolLM.

## Limitaciones y advertencias

- La model card de esta publicacion no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; no hay base para afirmar que el modelo este alineado o libre de sesgos.
- Riesgo de alucinacion propio de un modelo de ~1,7 B: la capacidad de verificacion factografica es limitada y no debe usarse como fuente unica en dominios sensibles (medicina, legal, finanzas).
- Longitud de contexto no documentada en la informacion disponible: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion sobre documentos extensos.
- El rendimiento multilingue es declarado por el autor para 17 idiomas, pero no se aportan metricas por idioma; la calidad relativa entre lenguas es desconocida.
- Licencia lfm1.0: no es una licencia de codigo abierto estandar. Antes de uso comercial hay que leer el archivo LICENSE del repositorio; los terminos pueden incluir restricciones de uso o de redistribucion.
- Requiere una build de llama.cpp compatible con LFM3: las builds antiguas o genericas pueden no cargar el modelo correctamente.
- El checkpoint QAD Q4_0 ha sido entrenado para una cuantizacion concreta; mezclar ese archivo con otros tipos de cuantizacion o reutilizarlo como base para re-cuantizar anula la ventaja del proceso QAD.
- El repositorio pesa 15,7 GB, lo que implica descargar varias cuantizaciones si no se selecciona un archivo concreto con `--hf-file`.
- Cifras de adopcion muy bajas en el momento de la consulta (17 descargas, 27 likes): el soporte comunitario y la documentacion de terceros son escasos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Checkpoint QAD Q4_0: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF/blob/main/LFM3-1.7B-QAD-Q4_0.gguf
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF/blob/main/LICENSE
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue con llama.cpp: https://docs.liquid.ai/deployment/on-device/llama-cpp
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
