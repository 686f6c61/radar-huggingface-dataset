# edgebites/LFM2.5-230M-Q8-NPU

## Resumen

LFM2.5-230M-Q8-NPU es un paquete de pesos cuantizados y compilados por el usuario edgebites a partir del checkpoint oficial LiquidAI/LFM2.5-230M, un modelo de lenguaje de 230 millones de parametros con arquitectura hibrida de convoluciones cortas y atencion (short-conv + attention) disenado por LiquidAI para despliegue en el borde. La particularidad de esta publicacion no es el modelo en si, sino su empaquetado: los ficheros estan compilados especificamente para ejecutarse sobre la NPU Hexagon (HTP v73) del SoC Qualcomm Snapdragon 8 Gen 2 (SM8550), usando el runtime LiteRT-LM.

El modelo resuelve el problema de ejecutar inferencia de un LLM en movil sin depender de la CPU ni de la GPU, aprovechando el acelerador neuronal del telefono. Para ello se han generado variantes con pesos int8, activaciones int16, embeddings int8 y una cabeza LM en int8 o int4, con un peso final de entre 279 y 313 MB por paquete. Se ofrecen dos fuentes: una version QAD (quantization-aware distilled, orientada a despliegue Q4_0) y la base publica sin QAT en bf16.

Es relevante ahora porque demuestra la viabilidad de LLMs de 230M completamente on-device con velocidades de prefill superiores a 1100 tokens/s y decodificacion en torno a 70 tokens/s en hardware movil de 2022-2023, con un consumo de memoria pico de apenas 583-623 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con convoluciones cortas y atencion (LFM2.5, short-conv + attention) |
| Parametros totales | 230 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos int8, activaciones int16, embeddings int8, cabeza LM int8 o int4 |
| Idiomas soportados | no disponible |
| Licencia | other (LFM 1.0 license, LiquidAI) |
| Formato de pesos | .litertlm (bundles de LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-230M emplea una arquitectura hibrida que combina capas de convolucion corta con capas de atencion, un diseno habitual en la familia LFM2 de LiquidAI para reducir el coste de inferencia manteniendo calidad. Esta publicacion no reentrena el modelo: parte de dos checkpoints, el QAD FP32 de LiquidAI (quantization-aware distilled, pensado para despliegue en Q4_0) y el checkpoint base FP16 no-QAT, y los transforma mediante el pipeline `npu_export` de litert-torch, que encadena exportacion, calibracion, SRQ (static range quantization) y compilacion QNN.

No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovacion tecnica de esta ficha es el proceso de cuantizacion y compilacion para NPU: la receta, segun el autor, no exige una fuente QAT, ya que la base no-QAT sufre una degradacion similar (+4.0% de perplejidad) con mejor PPL absoluto. Se documenta un quirk de estado de convolucion en el grafo de prefill que puede provocar la emision de tokens eos en prompts muy cortos o vacios.

## Capacidades

- Generacion de texto: el autor reporta baterias de pruebas limpias con prompts como "Paris" y poemas coherentes sobre lluvia.
- Razonamiento aritmetico basico: "17+25" devuelve 42 correctamente.
- Seguimiento de instrucciones simples: prueba de "scattering" y de listado de colores del arcoiris, incluidos Indigo y Violet.
- Inferencia on-device en NPU: ejecucion completa sobre Hexagon HTP v73 sin CPU ni GPU.
- Chat: soportado mediante ruta cruda (`--raw`) porque el motor de plantillas jinja del runtime rechaza la plantilla de chat de LFM2.5; el prompt debe renderizarse en el host.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Vision o audio: no disponible (modelo de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistentes de voz o texto totalmente offline en movil: al ejecutarse sobre la NPU del Snapdragon 8 Gen 2 con un pico de memoria de ~583-623 MB, el modelo puede alimentar asistentes on-device sin enviar datos a la nube, util para privacidad y para escenarios sin conectividad.
- Autocompletado y sugerencias de texto en teclados moviles: la decodificacion de ~70 tokens/s permite generar sugerencias en tiempo real dentro de una app de teclado sin salir del dispositivo.
- Clasificacion y etiquetado de texto corto en el borde: tareas como categorizar notas, correos o mensajes directamente en el telefono, con coste energetico bajo al usar el acelerador neuronal.
- Razonamiento aritmetico y respuestas factuales basicas en apps educativas: el modelo resuelve operaciones simples como "17+25" de forma fiable, adecuado para asistentes de aprendizaje sin conexion.
- Filtrado previo y formateo de prompts en pipelines on-device: el modelo puede actuar como etapa ligera (reescritura, resumen, normalizacion) antes de enviar consultas a un modelo mayor en la nube, reduciendo el trafico.
- Prototipado de aplicaciones edge con LiteRT-LM: desarrolladores que quieran medir latencia, throughput y consumo reales de un LLM en NPU movil pueden usar estas variantes como referencia, con comandos de benchmark reproducibles (`bench-npu`).
- Generacion creativa local de texto corto: poemas, eslóganes o respuestas conversacionales generadas en el dispositivo, mencionadas en las pruebas del autor (poema coherente sobre lluvia).

## Benchmarks y rendimiento

Resultados proporcionados por el autor en SM8550 / HTP v73 sobre NPU, con `bench-npu -p 128 -d 256 --runs 3`:

| Paquete | Fuente | Tamano | Prefill (t/s) | Decode (t/s) | PPL host (delta vs fuente) | Drain |
|---|---|---|---|---|---|---|
| QAD_Q8_out4 | QAD fp32 | 279.5 MB | 1243.3 | 71.1 | 13.28 (+4.1%) | ~583 MB |
| base_Q8_out4 | base bf16 | 279 MB | 1129 | 69.9 | 11.92 (+4.0%) | ~596 MB |
| base_Q8 | base bf16 | 313 MB | 1131 | 65.4 | 11.89 (+3.7%) | ~623 MB |

El sufijo `_out4` indica cabeza LM en int4; la variante sin el, cabeza en int8 (de ahi los -34 MB y +4.5 t/s de decodificacion). "Drain" es la caida pico de `MemAvailable` durante la prueba, liberada por completo al salir. La version base puntua mejor tambien en fp32 (11.46 frente a 12.76 del QAD, cuyos pesos apuntan a despliegue Q4_0 GGUF). Los grafos de la fuente base corren un ~9% mas lentos en prefill por partir de bf16.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: exclusivamente SoC Qualcomm Snapdragon 8 Gen 2 (SM8550) con NPU Hexagon HTP v73. Los paquetes estan compilados para ese objetivo y no son portables a otros chips.
- Memoria pico durante inferencia: entre 583 y 623 MB segun la variante (cabe holgadamente en la RAM de un telefono moderno).
- VRAM: no aplica en el sentido de GPU de escritorio; el modelo se ejecuta sobre la NPU del SoC movil.
- GPU recomendadas: no aplica. El modelo no esta pensado para A100, H100 ni RTX 4090; requiere el backend NPU de Qualcomm.
- Cabe en consumer GPU: no aplica (esta orientado a NPU movil). No se proporcionan instrucciones para ejecucion en GPU.
- Opciones de despliegue: runtime LiteRT-LM 0.19.0.dev junto con QAIRT 2.50; el backend NPU necesita las bibliotecas de dispatch y compilacion de Qualcomm. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: prefill de 1129-1243 tokens/s y decodificacion de 65.4-71.1 tokens/s medidos con `bench-npu -p 128 -d 256 --runs 3`.

## Comparativa con modelos similares

Comparativa entre las tres variantes empaquetadas y la fuente base, unica informacion disponible:

| Variante | Parametros | Tamano | Prefill (t/s) | Decode (t/s) | PPL | Fuente |
|---|---|---|---|---|---|---|
| QAD_Q8_out4 | 230M | 279.5 MB | 1243.3 | 71.1 | 13.28 | QAD fp32 |
| base_Q8_out4 | 230M | 279 MB | 1129 | 69.9 | 11.92 | base bf16 |
| base_Q8 | 230M | 313 MB | 1131 | 65.4 | 11.89 | base bf16 |
| LFM2.5-230M original | 230M | no disponible | no disponible | no disponible | 11.46 (base fp32) | LiquidAI |

No se dispone de datos de comparacion con otros modelos de la misma categoria (por ejemplo otras familias de 200-500M optimizadas para NPU) en la informacion proporcionada.

## Limitaciones y advertencias

- Portabilidad nula: el binario esta compilado exclusivamente para SM8550 / HTP v73. No funciona en otros Snapdragon ni en otras plataformas sin recompilar.
- Dependencia de runtime: requiere LiteRT-LM 0.19.0.dev y QAIRT 2.50, ademas de las bibliotecas propietarias de dispatch y compilacion de Qualcomm.
- Quirk de prefill: el grafo de prefill toma el estado de convolucion de las ultimas posiciones de ventana sin canal de mascara de validez, por lo que prompts cortos o vacios pueden emitir eos. Se recomienda usar prompts sembrados.
- Chat limitado: el motor de plantillas jinja del runtime rechaza la plantilla de chat de LFM2.5, obligando a renderizar el prompt en el host y usar la ruta cruda (`--raw`).
- Riesgo de alucinacion: con 230M de parametros y sin datos publicados de evaluacion factual, la fiabilidad en conocimiento factual es limitada; adecuado para tareas acotadas, no como fuente de verdad.
- Sesgos: no disponible; no se han publicado analisis de sesgo para esta variante.
- Idiomas: no disponible; no se especifican los idiomas soportados.
- Licencia: LFM 1.0 license (LiquidAI). El uso esta sujeto a sus terminos; conviene revisar las condiciones de uso comercial antes de integrarlo en producto.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible.
- Madurez: el repo tiene 0 descargas y 0 likes en el momento de la ficha, y usa una version de runtime en desarrollo (.dev), lo que implica menor rodaje en produccion.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/edgebites/LFM2.5-230M-Q8-NPU
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Build source y comandos exactos: incluidos en el repo (`build/BUILD.md`)
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada
