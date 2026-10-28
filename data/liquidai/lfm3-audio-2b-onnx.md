# LiquidAI/LFM3-Audio-2B-ONNX

## Resumen

LFM3-Audio-2B-ONNX es la versión en formato ONNX del modelo LFM3-Audio-2B de Liquid AI, una empresa estadounidense surgida del MIT que desarrolla los Liquid Foundation Models (LFM) orientados a inferencia en dispositivo, edge y nube. El modelo original es un modelo "any-to-any" de 2.000 millones de parámetros que trabaja con audio y texto; esta variante empaqueta el decodificador, el codificador de audio y el decodificador de códec en grafos ONNX ejecutables con ONNX Runtime en distintas plataformas.

Su relevancia práctica está en el despliegue: frente a los pesos originales, aquí se ofrecen tres precisiones ya cuantizadas (q4, q8 y q4f16) con tamaños de entre 2,09 GB y 3,36 GB, pensadas explícitamente para ejecución en CPU. Eso permite integrar un modelo de audio conversacional en aplicaciones de escritorio, servidores sin GPU o entornos embebidos, sin depender de PyTorch ni de CUDA.

La ficha del autor es breve y remite a la model card del modelo base para los detalles de arquitectura y uso. En la información disponible no se especifican la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card remite a la ficha de LFM3-Audio-2B; no se detalla la arquitectura interna) |
| Parametros totales | 2B (según la denominación del modelo) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q4, q8 y q4f16; el `depth_decoder` se ejecuta siempre en float32 |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (18 idiomas) |
| Licencia | lfm1.0 (etiquetada como `other` en HuggingFace, con enlace a `LICENSE`) |
| Formato de pesos | ONNX (`.onnx`), ejecutable con ONNX Runtime |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo: la model card de esta variante ONNX indica explícitamente que los detalles de arquitectura y uso están en la ficha de LiquidAI/LFM3-Audio-2B. Lo que sí se documenta es la descomposición en componentes del pipeline exportado: cada precisión combina un decodificador (`decoder_q4`, `decoder_q8`, `decoder_q4f16`), un codificador de audio (`audio_encoder.onnx` o `audio_encoder_fp16.onnx`), un decodificador de códec (`codec_decoder.onnx` o `codec_decoder_fp16.onnx`) y un `depth_decoder.onnx` en float32 que se ejecuta en todas las configuraciones y cuyo tamaño está incluido en las cifras indicadas.

Tampoco se detallan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El repositorio se etiqueta como `base_model_relation: quantized` respecto a LiquidAI/LFM3-Audio-2B, es decir, esta publicación es una conversión/cuantización del modelo original, no un reentrenamiento. El repositorio usa `custom_code` y requiere la librería `onnxruntime`.

## Capacidades

- Modelo any-to-any: el pipeline declarado es `any-to-any`, con codificador de audio y decodificador de códec, lo que habilita entrada y salida en modalidad de audio junto con texto.
- Conversión de voz: al incluir codificador de audio y decodificador de códec, el grafo cubre la cadena completa de procesamiento de audio dentro del propio repositorio.
- Generación de texto en 18 idiomas, entre ellos español, inglés, alemán, francés, italiano, portugués, neerlandés, chino, japonés, coreano, árabe y hebreo.
- Inferencia multiplataforma mediante ONNX Runtime, sin dependencia de PyTorch.
- Ejecución en CPU documentada por el autor para las tres precisiones publicadas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking", visión o audio en streaming: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en dispositivo: al ejecutarse en CPU con cuantización q4 (2,71 GB), el modelo puede integrarse en aplicaciones de escritorio o appliances sin GPU para mantener conversaciones habladas sin enviar audio a la nube, lo que reduce latencia y exposición de datos.
- Transcripción y dictado en herramientas ofimáticas: el codificador de audio más el decodificador permiten convertir voz en texto dentro de una aplicación local, distribuyendo un único paquete ONNX sin dependencias de frameworks de deep learning.
- Atención al cliente telefónica: un backend basado en ONNX Runtime puede desplegar varias instancias del modelo en servidores CPU convencionales, con la ventaja de que la huella de memoria (2,09-3,36 GB por instancia) es acotada y predecible.
- Subtitulado y traducción de reuniones: combinando la entrada de audio con el soporte de 18 idiomas, se pueden generar transcripciones y traducciones en pipelines por lotes o casi en tiempo real.
- Análisis de llamadas y notas de voz: procesamiento por lotes de grabaciones para extraer resúmenes o contenido estructurado, aprovechando que el modelo se ejecuta en CPU y no compite por GPU con otros servicios.
- Prototipado e integración en aplicaciones móviles o de escritorio multiplataforma: al ser ONNX, el mismo artefacto puede integrarse en runtimes nativos de distintas plataformas, lo que simplifica la validación temprana de producto antes de escalar a la API de Liquid AI.
- Investigación en modelos de audio: las tres precisiones publicadas permiten estudiar el compromiso entre calidad y tamaño (q4, q8 y q4f16) sobre el mismo modelo base con un esfuerzo de integración mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella de disco y memoria según precisión: q4f16 requiere 2,09 GB, q4 requiere 2,71 GB y q8 requiere 3,36 GB. Estas cifras incluyen el `depth_decoder` en float32 que se ejecuta en todas las configuraciones.
- VRAM estimada para inferencia en GPU: no disponible en la información proporcionada; los tamaños de artefacto indican que el modelo es holgadamente pequeño para cualquier GPU consumer con 8 GB o más, aunque el autor no publica requisitos de VRAM.
- GPU recomendadas: no disponibles. La model card etiqueta las tres precisiones como `Device: CPU`, por lo que el escenario de referencia es CPU, no GPU.
- ¿Cabe en GPU consumer? Por tamaño de pesos (2-3,4 GB) sí cabría en tarjetas de 8 GB o más, pero no hay confirmación del autor sobre el soporte y rendimiento en GPU mediante execution providers de ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (librería declarada, `library_name: onnxruntime`). Otros servidores (vLLM, llama.cpp, Ollama, TGI) no están documentados para este formato en la información disponible.
- Latencia y throughput: no disponibles. No se publican métricas de tokens por segundo ni de tiempo real de audio procesado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Audio-2B-ONNX (este) | 2B | no disponible | ONNX (q4, q8, q4f16) | lfm1.0 | HuggingFace, 42 descargas, 5 likes |
| LFM3-Audio-2B (modelo base) | 2B | no disponible | no disponible en la información | lfm1.0 | HuggingFace (repo original de LiquidAI) |
| Otras alternativas any-to-any de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye especificaciones de modelos de terceros comparables, por lo que no se puede establecer una comparación cuantitativa de rendimiento. La comparación relevante y verificable es la de esta variante ONNX frente al modelo base: misma licencia y mismo tamaño nominal, con la diferencia de que aquí se ofrecen pesos cuantizados listos para ONNX Runtime y ejecución en CPU.

## Limitaciones y advertencias

- La model card de esta variante es mínima: no documenta arquitectura, contexto, datos de entrenamiento ni evaluación, lo que dificulta estimar su comportamiento en producción sin consultar la ficha del modelo base.
- Al ser una cuantización, las precisiones q4 y q4f16 pueden degradar la calidad frente a los pesos originales; el autor no publica métricas de esa degradación.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos y debe mitigarse con validación en el dominio de aplicación.
- Sesgos: no se documentan sesgos conocidos ni la composición del corpus de entrenamiento, por lo que no es posible evaluar sesgos por idioma o dominio.
- Cobertura lingüística: se declaran 18 idiomas, pero no se especifica el nivel de calidad por idioma; el español figura en la lista sin métricas asociadas.
- Licencia lfm1.0: es una licencia propia etiquetada como `other`, con el texto en el fichero `LICENSE` del repositorio. Antes de un uso comercial es necesario revisar sus términos, ya que no es una licencia OSI estándar y puede incluir restricciones de uso.
- Despliegue: el soporte está declarado para ONNX Runtime; no hay evidencia publicada de funcionamiento con otros motores de inferencia.
- Tamaño del repositorio: 19,7 GB en total, ya que incluye todas las precisiones; conviene descargar solo los ficheros de la precisión elegida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LiquidAI/LFM3-Audio-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Licencia: https://huggingface.co/LiquidAI/LFM3-Audio-2B-ONNX/blob/main/LICENSE
- Sitio de Liquid AI: https://www.liquid.ai/
- Catálogo de modelos LFM: https://www.liquid.ai/models
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/talk
- Consola / API: https://console.liquid.ai/dashboard
- Organización en HuggingFace: https://huggingface.co/LiquidAI
- Wikipedia: https://en.wikipedia.org/wiki/Liquid_AI
