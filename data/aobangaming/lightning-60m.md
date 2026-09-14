# Aobangaming/lightning-60m

## Resumen

Lightning-60m es un modelo de lenguaje autorregresivo de tipo transformer decoder, desarrollado por Aobangaming (firmado como AobanZ en la model card) y publicado bajo licencia MIT. Con 64.834.560 parámetros reales (aproximadamente 64,8 millones, según el recuento de safetensors) y un tamaño de repositorio de 0,3 GB, se trata de un modelo deliberadamente pequeno orientado a generacion de texto e interaccion conversacional en ingles. La model card indica que se ha afinado a partir de un modelo previo del mismo autor, "Aoban-2.7-L", y que emplea FlashAttention junto con atencion multi-cabeza (MHA).

El modelo fue entrenado sobre el dataset completo BookSum (kmfoda/booksum), una coleccion de resumenes y textos derivados de libros, con una longitud de secuencia de 210 tokens y un vocabulario de aproximadamente 65.830 entradas. La arquitectura es compacta: 8 capas, dimension de modelo (d_model) de 384 y 6 cabezas de atencion, lo que da 64 dimensiones por cabeza. El entrenamiento se realizo en una unica GPU RTX 3050 de 6 GB durante aproximadamente 1,5 horas, con precision FP32, optimizador AdamW y una tasa de aprendizaje de 5e-4.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como banco de pruebas de bajo coste para experimentar con fine-tuning, cuantizacion y despliegue de transformers pequenos. Su utilidad en produccion es muy limitada: el propio autor advierte de que las salidas pueden ser incorrectas, repetitivas o no relacionadas con la entrada, y restringe su uso a investigacion, analisis y experimentacion. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo (causal), con FlashAttention y atencion multi-cabeza (MHA) |
| Parametros totales | 64.834.560 (aproximadamente 64,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 210 tokens (longitud de secuencia declarada en la model card) |
| Tipos de cuantizacion | no disponible; no se documentan variantes GGUF, AWQ, GPTQ ni INT8. El tamano del repo (0,3 GB) es coherente con pesos en FP32, pero no se confirma explicitamente |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, con libreria transformers y requisito de codigo personalizado (custom_code, trust_remote_code) |
| Capas | 8 |
| Dimension de modelo (d_model) | 384 (64 dimensiones por cabeza) |
| Cabezas de atencion | 6 |
| Vocabulario | aproximadamente 65.830 tokens |
| Dataset de entrenamiento | kmfoda/booksum (BookSum, aproximadamente 300 MB) |
| Modelo base | Aoban-2.7-L (fine-tuned from, segun la model card) |

## Arquitectura y entrenamiento

Lightning-60m es un transformer decoder causal y autorregresivo de 8 capas, con d_model de 384, 6 cabezas de atencion y 64 dimensiones por cabeza. La model card indica que utiliza FlashAttention y atencion multi-cabeza (MHA) para mejorar el rendimiento, y que el modelo esta optimizado para dar salidas rapidas y coherentes a cambio de una capacidad de embedding limitada (el propio autor lo describe como "limited embedding"). No se declara el uso de tecnicas como decodificacion especulativa, atencion lineal, MoE o arquitecturas hibridas: es un transformer denso convencional.

El entrenamiento se realizo sobre el dataset completo BookSum (kmfoda/booksum), con un volumen de datos de aproximadamente 300 MB, en una unica RTX 3050 de 6 GB durante unas 1,5 horas, con precision FP32, optimizador AdamW, tasa de aprendizaje 5e-4 y batch size de 32. El autor indica explicitamente que no se entreno sobre datasets de fine-tuning por problemas de memoria, y que el modelo parte de un ajuste sobre Aoban-2.7-L. No se documenta el numero total de tokens procesados, la composicion exacta del dataset, ni si hubo fases de RLHF, DPO o SFT adicionales. Las emisiones estimadas fueron de aproximadamente 0,17 kg de CO2 equivalente, calculadas con el metodo de Lacoste et al. (2019).

## Capacidades

- Generacion de texto autoregresiva en ingles, orientada a continuaciones breves y coherentes.
- Generacion conversacional basica (tag "conversational" en HuggingFace), apta para interacciones de un solo turno o muy pocos turnos.
- Continuacion y resumen de textos narrativos, ya que el entrenamiento se basa en BookSum.
- Capacidad de fine-tuning sobre nuevos corpus de texto (recomendada por el propio autor), especialmente para generacion de relatos, resumenes y modelos de continuacion pequenos.
- No hay evidencia de soporte de tool calling ni function calling en la informacion disponible.
- No hay evidencia de capacidades de agente, razonamiento multi-paso, uso de herramientas o modos de pensamiento explicito.
- No dispone de vision, audio ni multimodalidad.
- Multilingue: no. La model card restringe el modelo a ingles y texto conversacional exclusivamente.
- Capacidad de razonamiento y matematicas: no documentada, y previsiblemente muy limitada por el tamano (64,8 M de parametros) y por el dataset de entrenamiento (textos de libros).

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: al ocupar menos de 0,3 GB en disco y caber en cualquier GPU consumer o incluso en CPU, permite validar codigo de inferencia, tokenizacion y generacion antes de escalar a modelos mayores.
- Experimentacion academica y docente: sirve para ilustrar el ciclo completo de entrenamiento de un transformer pequeno (8 capas, d_model 384), incluido el uso de FlashAttention y AdamW, con un coste de computo de 1,5 horas en una RTX 3050.
- Generacion y continuacion de relatos cortos: al estar entrenado sobre BookSum, puede producir continuaciones de texto narrativo, siempre que las peticiones quepan en el limite de 210 tokens y se acepte que la calidad es limitada.
- Resumen de fragmentos de libros o capitulos: uso alineado con el dataset de entrenamiento, aunque restringido por la ventana de contexto de 210 tokens, que obliga a trocear el texto en fragmentos muy pequenos.
- Fine-tuning sobre dominios concretos: el autor recomienda explicitamente ajustar el modelo sobre nuevos textos; por ejemplo, para generar descripciones de producto o textos de un nicho concreto en ingles.
- Banco de pruebas de cuantizacion y optimizacion: su tamano permite comparar FP32, FP16 e INT8 en terminos de calidad y latencia sin necesidad de hardware especializado.
- Chatbot conversacional de bajo coste para demos internas: puede gestionar intercambios simples en ingles cuando no se requiere precision factual y se anaden guardarrailes.
- Generacion de datos sinteticos a pequena escala para aumentar datasets de entrenamiento de modelos mayores, con revision humana obligatoria de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar. La busqueda web realizada no devolvio resultados relacionados con el modelo: los unicos enlaces recuperados corresponden a Framatome (energia nuclear) y no guardan relacion alguna con el modelo. Por tanto, no se dispone de datos comparativos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los 64,8 M de parametros ocupan aproximadamente 259 MB en FP32, 130 MB en FP16 y 65 MB en INT8. Con el overhead de la libreria y la cache KV para 210 tokens, un presupuesto practico de 1-2 GB de memoria es suficiente (estimacion propia a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada. Funciona en RTX 3050 6 GB (el propio hardware de entrenamiento), RTX 4090, A100 o H100 sin problema, pero tambien en GPUs integradas.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, y tambien en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: la via documentada es transformers con `AutoModelForCausalLM` y `trust_remote_code=True`, mas `tokenizers.Tokenizer` para el tokenizador (no se usa `AutoTokenizer` en el ejemplo del autor). No hay repositorios GGUF publicados, por lo que llama.cpp y Ollama requeririan una conversion propia no documentada. El soporte en vLLM o TGI no esta confirmado, dado que el modelo depende de codigo personalizado.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia. El unico dato de rendimiento indirecto es que el entrenamiento completo en FP32 llevo 1,5 horas en una RTX 3050 de 6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lightning-60m (Aobangaming) | 64,8 M | 210 tokens | no disponibles | MIT | HuggingFace, requiere trust_remote_code |
| Aoban-2.7-L (modelo base declarado) | no disponible | no disponible | no disponibles | no disponible | no disponible |
| lightning-30m (predecesor declarado) | no disponible | no disponible | no disponibles | no disponible | no disponible |

La model card menciona dos modelos relacionados: Aoban-2.7-L, del que deriva Lightning-60m, y lightning-30m, respecto al cual se indica una mejora en el numero de cabezas de atencion. No se dispone de informacion publica verificable sobre parametros, contexto, licencia o rendimiento de ninguno de los dos, por lo que no es posible establecer una comparacion tecnica cuantitativa. Tampoco se han identificado en la informacion proporcionada modelos de terceros comparables con datos verificables.

## Limitaciones y advertencias

- Ventana de contexto muy reducida: 210 tokens, lo que impide mantener conversaciones largas o procesar documentos extensos sin trocearlos.
- Solo ingles: la model card restringe explicitamente el modelo a texto en ingles y conversacional, y descarta el fine-tuning para otros usos (por ejemplo, robotica).
- Riesgo de alucinacion elevado: el autor advierte de que las salidas pueden ser incompletas, inexactas, repetitivas o no relacionadas con la entrada, y que pueden contener informacion erronea.
- Capacidad de embedding limitada, segun reconoce el propio autor, lo que afecta a la coherencia en generaciones largas.
- No apto para uso profesional: el modelo no debe emplearse para asesoramiento profesional, redaccion real ni cargas de trabajo intensivas ("heavy work"), ya que puede producir salidas corruptas.
- Riesgo de seguridad en el codigo: el modelo declara la etiqueta custom_code y requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar codigo del repositorio del autor.
- Tokenizador no estandar: el ejemplo oficial usa `tokenizers.Tokenizer` en lugar de `AutoTokenizer`, lo que puede complicar la integracion con herramientas que esperan la interfaz habitual de transformers.
- Validacion comunitaria practicamente nula: 0 descargas y 1 "like" en el momento de la consulta, sin evaluaciones independientes conocidas.
- Advertencia sobre sesgos: no se documenta ninguna evaluacion de sesgos. Al entrenarse sobre textos literarios (BookSum), es probable que herede sesgos presentes en las obras de origen, aunque no hay analisis publicado al respecto.
- Fechas incoherentes en los metadatos: el repositorio figura como creado y actualizado en septiembre de 2026, lo que dificulta interpretar su historial real.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, pero al no existir garantias ni validacion de calidad, cualquier uso en produccion recae enteramente sobre quien lo despliega.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aobangaming/lightning-60m
- Dataset de entrenamiento BookSum: https://huggingface.co/datasets/kmfoda/booksum
- Paper de referencia citado en la etiqueta arxiv:1910.09700 (Lacoste et al., 2019, Quantifying the Carbon Emissions of Machine Learning): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental de Machine Learning: https://mlco2.github.io/impact
- Repositorio: no disponible (la model card solo indica la pagina de HuggingFace)
- Paper tecnico del modelo: no disponible
- Demo publica: no disponible
- Blog o documentacion adicional: no disponible
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo.
