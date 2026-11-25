# mradermacher/Heliactis-2-3.7B-i1-GGUF

## Resumen

Heliactis-2-3.7B-i1-GGUF es la version cuantizada en formato GGUF del modelo Heliactis-2-3.7B, desarrollado por ApollonLabs y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje conversacional afinado mediante LoRA fusionado (lora-merged), orientado principalmente al idioma griego (etiqueta `greek`) y con soporte secundario de ingles. La nomenclatura "3.7B" del nombre del modelo no coincide con el recuento real de parametros del repositorio base, que asciende a 5.058.255.360 parametros segun los tensores en safetensors.

El modelo parte de una arquitectura de tipo transformer con la etiqueta `k2-horizon`, lo que sugiere una base derivada de la familia K2 de modelos abiertos. El repositorio contiene exclusivamente cuantizaciones GGUF generadas con tecnicas de imatrix (importance matrix), lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles con el formato GGUF.

La relevancia de esta ficha reside en que Heliactis-2 apunta a un nicho poco cubierto: modelos conversacionales de tamano medio con enfasis en griego moderno. La licencia Apache 2.0 facilita su uso comercial, aunque la informacion publica sobre el entrenamiento, los datos y los benchmarks es practicamente inexistente en la model card disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `k2-horizon`; detalles no disponibles) |
| Parametros totales | 5.058.255.360 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | griego (el), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no documenta la arquitectura interna mas alla de la etiqueta `k2-horizon` y la indicacion de que se trata de un modelo `lora-merged`, es decir, un modelo base al que se le ha fusionado un adaptador LoRA para producir el checkpoint final. No se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea tecnicas como atencion lineal o decodificacion especulativa.

Tampoco hay informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. La unica informacion disponible sobre el proceso de cuantizacion es que mradermacher ha generado las cuantizaciones utilizando una importance matrix (imatrix) propia, lo que tipicamente mejora la calidad de las cuantizaciones de baja precision (IQ1 a IQ4) respecto a las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en griego e ingles, segun los idiomas declarados.
- Conversacion multi-turno (etiqueta `conversational` en el repositorio).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia estandar.
- No se documentan capacidades de vision, audio, tool calling ni modo de razonamiento explicito.
- No se documenta soporte de function calling ni de agentes multi-paso.
- Capacidades multilingues limitadas a griego e ingles segun los metadatos.

## Casos de uso

- Asistente conversacional en griego: el modelo puede gestionar dialogos multi-turno en griego moderno, un idioma con escasa cobertura en modelos abiertos de tamano medio, lo que lo hace util para productos dirigidos al mercado heleno.
- Atencion al cliente en griego: despliegue en un servicio de chat para responder consultas frecuentes de usuarios grecoparlantes, con la ventaja de que las cuantizaciones Q4_K_M (3.3 GB) caben en GPUs de consumo y reducen costes de inferencia.
- Traduccion asistida griego-ingles: uso como componente de traduccion en pipelines de documentacion o soporte, aprovechando el bilinguismo declarado del modelo.
- Procesamiento de texto en local: las cuantizaciones IQ2 a IQ3 (1.8-2.9 GB) permiten ejecutar el modelo en portatiles o equipos sin GPU dedicada mediante llama.cpp, util para prototipado offline.
- Generacion de contenido editorial en griego: redaccion asistida de articulos, correos o publicaciones para medios o empresas griegas.
- Investigacion en NLP griego: uso como checkpoint base para experimentos de ajuste fino o evaluacion comparativa en tareas de procesamiento del griego moderno.
- Educacion y tutoria: asistente de practica de conversacion en griego para estudiantes, ejecutable en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo con ~5.06 mil millones de parametros):
  - i1-IQ1_S / i1-IQ1_M: ~1.6 GB de pesos; ~2-2.5 GB de VRAM con contexto moderado.
  - i1-IQ2_XXS a i1-IQ2_M: ~1.8-2.1 GB de pesos; ~2.5-3 GB de VRAM.
  - i1-IQ3_XXS a i1-Q3_K_L: ~2.3-2.9 GB de pesos; ~3-4 GB de VRAM.
  - i1-IQ4_XS a i1-Q4_1: ~3.0-3.4 GB de pesos; ~4-5 GB de VRAM.
  - i1-Q5_K_S / i1-Q5_K_M: ~3.7 GB de pesos; ~4.5-5.5 GB de VRAM.
  - i1-Q6_K: ~4.3 GB de pesos; ~5-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 2070). Para Q6_K se recomienda 8 GB o mas (RTX 3070, RTX 4060 Ti, RTX 4070). En entornos de servidor, A100, H100 o L40S ofrecen margen sobrado y permiten mayor paralelismo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6-8 GB de VRAM para las cuantizaciones recomendadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles. Como referencia orientativa no verificada, un modelo de ~5B en Q4_K_M en una RTX 4090 suele generar decenas de tokens por segundo, pero no hay datos publicados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Heliactis-2-3.7B (este) | ~5.06B | no disponible | el, en | Apache 2.0 | GGUF (i1), safetensors |
| Modelos griego-ingles de tamano medio (p. ej. variantes de Llama/Mistral ajustadas a griego) | 3-8B | variable | el, en | variable | GGUF, safetensors |
| Modelos multilingues generalistas de ~7B (p. ej. Qwen2.5-7B) | ~7B | 32K+ | multilingue | Apache 2.0 | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo para Heliactis-2-3.7B, por lo que la comparacion se limita a parametros, licencia y disponibilidad. La ventaja principal frente a alternativas generalistas es su especializacion en griego; la desventaja es la ausencia de benchmarks publicos y de documentacion sobre contexto y entrenamiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del modelo frente a alternativas.
- La model card no documenta el proceso de entrenamiento, los datos utilizados ni posibles sesgos; se desconoce si el ajuste LoRA introdujo sesgos especificos del corpus griego empleado.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado por la falta de evaluaciones.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones o documentos largos.
- Cobertura limitada a griego e ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Las cuantizaciones de muy baja precision (IQ1, IQ2) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene verificar la licencia del modelo base original (ApollonLabs/Heliactis-2-3.7B) por si impone restricciones adicionales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por la comunidad.
- El nombre "3.7B" no coincide con los ~5.06B parametros reales, lo que puede inducir a error en la planificacion de recursos.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/Heliactis-2-3.7B-i1-GGUF
- Modelo base: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Heliactis-2-3.7B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Heliactis-2-3.7B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
