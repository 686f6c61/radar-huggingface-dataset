# mradermacher/LFM3-VL-2B-GGUF

## Resumen

LFM3-VL-2B es un modelo multimodal de tipo imagen-texto desarrollado por Liquid AI, orientado a despliegue en el borde (edge) y a cargas conversacionales. Se construye a partir de LFM3-1.7B-Base, un modelo de lenguaje preentrenado en dos fases sobre 22 billones de tokens, al que se añade capacidad de vision. La ficha que nos ocupa, publicada por mradermacher, es una conversion a formato GGUF del modelo original de Liquid AI, pensada para su uso con llama.cpp y herramientas compatibles.

El modelo pertenece a la familia LFM3 de Liquid AI y esta disenado para escenarios donde el coste por inferencia y la latencia importan: asistentes conversacionales, procesamiento de documentos con imagenes y agentes ligeros. Su tamano reducido (el checkpoint safetensors reporta 189.380.352 parametros, aunque la denominacion comercial lo situa en la clase de 2B) permite ejecutarlo en hardware modesto, incluido consumo.

Esta version GGUF es relevante porque democratiza el acceso al modelo en entornos sin GPU dedicada o con GPU de gama de consumo, mediante cuantizaciones estaticas de 2 a 8 bits y un complemento multimodal (mmproj) separado. La licencia lfm1.0 condiciona el uso comercial, por lo que conviene revisarla antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal imagen-texto de la familia LFM3; requiere custom_code) |
| Parametros totales | 189.380.352 (segun safetensors del repo); denominacion comercial 2B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base original en safetensors |

## Arquitectura y entrenamiento

No se dispone de detalle arquitectonico en la informacion proporcionada mas alla de que se trata de un modelo multimodal imagen-texto de la familia LFM3, que requiere codigo personalizado (custom_code) y que el modelo base es LiquidAI/LFM3-VL-2B. El modelo parte de LFM3-1.7B-Base, preentrenado en dos etapas sobre un total de 22 billones de tokens, segun la model card del modelo original. No se especifica en la informacion disponible la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas de atencion o decodificacion.

La contribucion de esta ficha es la conversion a GGUF: cuantizaciones estaticas generadas por mradermacher, con el proyector multimodal (mmproj) distribuido por separado en Q8_0 y f16. El autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles por el momento.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes (modelo imagen-texto): descripcion, respuesta a preguntas sobre imagenes y tareas derivadas.
- Cobertura multilingue en 16 idiomas, incluido el espanol.
- Ejecucion local en CPU y GPU mediante llama.cpp y ecosistema GGUF.
- Integracion con endpoints compatibles (tag endpoints_compatible en el repo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en escritorio: el modelo puede gestionar dialogos multi-turno en un equipo sin GPU dedicada, usando cuantizaciones Q4_K_M o Q5_K_M que ocupan pocos cientos de MB.
- Descripcion y etiquetado de imagenes en lotes: con el proyector mmproj se pueden procesar imagenes para generar descripciones o metadatos en pipelines de gestion documental.
- Preguntas y respuestas sobre capturas o documentos escaneados: util en herramientas de soporte que reciben imagenes del usuario y necesitan extraer informacion.
- Prototipado rapido de aplicaciones multimodales: al ser GGUF, se puede integrar en demos con llama.cpp u Ollama sin infraestructura GPU.
- Asistencia multilingue en atencion al cliente: cubre 16 idiomas, incluido espanol, para respuestas basicas en varios mercados.
- Filtrado y moderacion de contenido con imagenes: clasificacion preliminar de imagenes y texto asociado en entornos con recursos limitados.
- Educacion y accesibilidad: descripcion de imagenes para lectores de pantalla o material didactico, ejecutandose en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento disponible es del modelo original: en una NVIDIA B300 produce mas de 12.000 tokens/s con 1.024 peticiones concurrentes, segun la model card de LiquidAI/LFM3-VL-2B. No se ofrecen cifras equivalentes para las cuantizaciones GGUF de esta ficha.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 0,6 GB; las cuantizaciones individuales van desde aproximadamente 0,3 GB (Q2_K) hasta el rango de 1-2 GB para f16, con el mmproj anadiendo 0,3 GB (Q8_0) o 0,5 GB (f16). Cifras exactas por cuantizacion no disponibles en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con 2-4 GB de VRAM es suficiente para las cuantizaciones pequenas; no se especifican modelos concretos en la informacion disponible.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo reciente e incluso en CPU.
- Opciones de despliegue: llama.cpp y ecosistemas compatibles con GGUF (Ollama, LM Studio y similares); el modelo original usa transformers.
- Latencia y throughput: no disponibles para las cuantizaciones GGUF.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Licencia lfm1.0: es necesario revisar sus terminos antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; conviene validar las salidas en produccion.
- Longitud de contexto no documentada en la informacion disponible: no se puede garantizar el comportamiento en conversaciones largas.
- Modelo pequeno (clase 2B): menor calidad de razonamiento y conocimiento factual que modelos mayores; adecuado para tareas acotadas.
- La cobertura de 16 idiomas no implica calidad homogenea; el rendimiento por idioma no esta documentado.
- Requiere custom_code: la integracion con transformers puede necesitar dependencias especificas.
- Las cuantizaciones son estaticas y sin imatrix; el autor advierte que las versiones ponderadas pueden no estar disponibles.
- El proyector multimodal se distribuye por separado; hay que descargar el mmproj correspondiente para usar la parte de vision.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-VL-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-VL-2B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
