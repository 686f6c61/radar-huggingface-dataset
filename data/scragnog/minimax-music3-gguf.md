# scragnog/MiniMax-Music3-GGUF

## Resumen

MiniMax-Music3-GGUF es una conversión a formato GGUF del modelo MiniMax-Music3, desarrollada por scragnog para su integración en HOT-Step CPP, una aplicación de escritorio local de generación musical con IA. Se trata de la primera conversión GGUF conocida de este modelo, que originalmente se distribuye en safetensors (bf16/fp16). El modelo completo es un sistema de cinco módulos: un LM global de 8,59B parámetros con arquitectura Qwen3, un decodificador de profundidad RVQ, un codificador de condiciones, un DiT de flow-matching y un vocoder, que en conjunto generan audio estéreo de 44,1 kHz hasta 5 minutos.

La relevancia de esta conversión radica en que permite ejecutar el modelo íntegramente en local con un motor nativo C++/GGML, sin depender de la pila de Python/diffusers. Los archivos GGUF no son utilizables con llama.cpp de forma aislada, ya que requieren el pipeline completo implementado en HOT-Step. El repositorio incluye dos archivos principales: `mm3-lm-f16.gguf` (17,2 GB) y `mm3-synth-f16.gguf` (6,4 GB), con un peso total de ~23,6 GB en precisión f16.

La licencia es la MiniMax-Music3 Community License, que impone condiciones específicas para uso comercial, como la exhibición prominente del nombre "MiniMax-Music3" y autorización separada para ingresos anuales superiores a 20 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM global (Qwen3, 8,59B) + RVQ depth decoder (0,6B) + condition encoder (25M) + flow-matching DiT (2,4B) + vocoder (54M) |
| Parametros totales | ~11,7B (suma de los cinco modulos: 8,59B + 0,6B + 25M + 2,4B + 54M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en tokens; genera hasta 5 minutos de audio a 44,1 kHz |
| Tipos de cuantizacion | f16 (por ahora; variantes cuantizadas previstas) |
| Idiomas soportados | No disponibles (el modelo acepta prompts de texto, probablemente ingles, pero no se especifica) |
| Licencia | MiniMax-Music3 Community License |
| Formato de pesos | GGUF (dos archivos: `mm3-lm-f16.gguf` y `mm3-synth-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo es un sistema compuesto por cinco modulos interconectados que forman un pipeline completo de generacion musical texto-a-audio. El modulo principal es un LM global de 8,59B parametros con arquitectura Qwen3, que procesa el prompt de texto y genera tokens de audio semantico a partir de un vocabulario de 200.000 tokens, de los cuales 16.384 son codigos de audio semantico. A continuacion, un decodificador de profundidad RVQ (0,6B) expande la secuencia semantica a multiples niveles de cuantificacion residual, mientras que un codificador de condiciones (25M) procesa informacion auxiliar. Un DiT de flow-matching (2,4B) refina la representacion latente y, finalmente, un vocoder (54M) sintetiza la forma de onda de audio a 44,1 kHz en estéreo.

La conversion a GGUF se realizo con el script `engine/tools/convert-mm3.py` de HOT-Step, partiendo de los safetensors bf16/fp16 publicados por MiniMax (via el repackage de Comfy-Org). El vocoder se convirtio con weight-norm plegado, y las bases de Fourier/RoPE del DiT y vocoder se fijaron en F32. Los 911 tensores fueron validados en forma, y la implementacion en HOT-Step esta validada por paridad contra la referencia oficial de diffusers: correlacion por modulo ≥ 0,9999 frente a fp32, y reproduccion completa del pipeline con 0,9988 de correlacion.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. El modelo base fue desarrollado por MiniMax, pero los detalles de entrenamiento no se incluyen en la informacion proporcionada.

## Capacidades

- Generacion de musica a partir de prompts de texto, con salida de hasta 5 minutos en audio estéreo de 44,1 kHz y 16 bits.
- Pipeline completo de generacion musical en local: LM global, decodificador RVQ, codificador de condiciones, DiT de flow-matching y vocoder, todo integrado en HOT-Step CPP.
- Soporte para generacion de audio semantico mediante un vocabulario extendido de 200.000 tokens, incluyendo 16.384 codigos de audio semantico.
- Capacidad de generar piezas musicales coherentes y estructuradas, gracias al flujo de cinco etapas que combina modelado de lenguaje, cuantificacion residual y sintesis de forma de onda.
- Integracion nativa con HOT-Step CPP, que proporciona un gestor de modelos y un backend dedicado para esta arquitectura.
- Compatibilidad con cuantizacion f16 actualmente, con posibilidad de variantes cuantizadas en el futuro para reducir requisitos de VRAM.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo especializado en generacion musical, no en tareas de lenguaje general.

## Casos de uso

- Produccion musical independiente: un compositor puede generar bocetos o demos completos de hasta 5 minutos a partir de descripciones textuales de estilo, instrumentacion o ambiente, acelerando el proceso creativo sin salir de un entorno local.
- Creacion de bandas sonoras para videojuegos: los desarrolladores pueden generar pistas musicales procedurales para niveles o escenas, ajustando el prompt a la atmosfera deseada y exportando el audio a 44,1 kHz estéreo.
- Generacion de musica de fondo para podcasts y videos: los creadores de contenido pueden producir pistas originales sin preocuparse por derechos de autor, gracias a la licencia comunitaria que permite uso comercial con ciertas condiciones.
- Prototipado rapido en estudios de grabacion: los ingenieros de sonido pueden generar variaciones musicales sobre un tema para evaluar direcciones artisticas antes de grabar con musicos reales.
- Educacion musical asistida: los profesores pueden generar ejemplos auditivos de diferentes estilos o estructuras musicales para ilustrar conceptos teoricos en clase, de forma local y sin conexion.
- Investigacion en generacion musical: los investigadores pueden estudiar el comportamiento del modelo, comparar su salida con otros sistemas y experimentar con la arquitectura, gracias a la disponibilidad de los pesos en formato GGUF y el codigo fuente de HOT-Step.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una validacion de paridad frente a la referencia de diffusers (correlacion por modulo ≥ 0,9999 y reproduccion completa del pipeline con 0,9988), pero no se proporcionan metricas estandar como FAD, KL divergencia o preferencia humana.

## Requisitos de hardware

- VRAM estimada: ~24 GB a f16 para el pipeline completo, segun la model card.
- GPU recomendadas: tarjetas con 24 GB de VRAM o mas, como NVIDIA RTX 3090, RTX 4090, A100 o H100. En GPUs con menos VRAM, podria ser necesario cuantizar (aunque las variantes cuantizadas aun no estan disponibles) o dividir la carga entre CPU y GPU.
- No cabe en GPUs de consumo con 8-12 GB de VRAM en f16; se requeriria cuantizacion a 8 bits o inferior, que no se ha publicado todavia.
- Despliegue: exclusivamente a traves de HOT-Step CPP, que implementa el motor GGML nativo y el pipeline de cinco modulos. No es compatible con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generacion de 5 minutos de audio implica un proceso de varias etapas; el tiempo real dependera de la GPU y de la longitud de la pieza.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Modelos comparables en el ambito de generacion musical texto-a-audio incluyen MusicGen (Meta), Stable Audio (Stability AI) y AudioLDM 2, pero no hay metricas directas que permitan una comparacion rigurosa con MiniMax-Music3 en esta ficha. La arquitectura de cinco modulos y la salida de hasta 5 minutos a 44,1 kHz estéreo son caracteristicas distintivas, pero su rendimiento relativo no puede evaluarse sin benchmarks.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax-Music3 Community License exige la exhibicion prominente de "MiniMax-Music3" en productos comerciales, autorizacion separada para ingresos anuales superiores a 20 millones de dolares, una politica de uso aceptable y la divulgacion clara de que el contenido distribuido fue generado por IA.
- No es compatible con llama.cpp ni otras herramientas GGUF estandar: los archivos requieren el motor especifico de HOT-Step CPP, lo que limita su portabilidad.
- Requisitos de VRAM elevados: ~24 GB en f16, lo que excluye a la mayoria de GPUs de consumo de gama media.
- Idioma de los prompts: no se especifican los idiomas soportados; es probable que el modelo funcione mejor con ingles, pero no hay confirmacion.
- Riesgo de alucinacion musical: como todo modelo generativo, puede producir resultados incoherentes o no deseados, especialmente con prompts ambiguos.
- Sin informacion sobre sesgos: no se han publicado analisis de sesgo respecto a estilos musicales, culturas o generos.
- Dependencia de un proyecto de codigo abierto joven: HOT-Step CPP es un proyecto reciente y su mantenimiento a largo plazo no esta garantizado.
- La fecha de creacion del repositorio (2026-08-13) es posterior a la fecha actual de este analisis, lo que sugiere que el modelo es muy reciente y podria tener poca validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scragnog/MiniMax-Music3-GGUF
- Modelo base (MiniMaxAI/MiniMax-Music3): https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- Proyecto HOT-Step CPP: https://github.com/scragnog/HOT-Step-CPP
- Script de conversion: https://github.com/scragnog/HOT-Step-CPP/blob/master/engine/tools/convert-mm3.py
