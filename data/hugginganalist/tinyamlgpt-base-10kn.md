# HuggingAnalist/TinyAmlGpt-Base-10kn

## Resumen

TinyAmlGpt-Base-10kn es un modelo de lenguaje autorregresivo tipo GPT decoder-only de 51 millones de parámetros, desarrollado por HuggingAnalist como artefacto de investigación. Su principal contribución es el uso de un objetivo de entrenamiento novedoso denominado AML (masked self-distillation, auto-destilación enmascarada), que combina la pérdida de entropía cruzada estándar con restricciones de proximidad entre subredes anidadas y el modelo denso completo. El modelo se entrena íntegramente sobre el corpus sintético TinyStories, compuesto por relatos breves en inglés simplificado dirigidos a primeros lectores.

La relevancia de este modelo radica en que permite estudiar empíricamente cómo afectan los objetivos de entrenamiento alternativos a la calidad de generación y a la eficiencia de inferencia a escala reducida. Con solo 0,66 mil millones de tokens de entrenamiento y una ventana de contexto de 512 tokens, el modelo alcanza una perplejidad de validación de 3,95, un resultado notable para su tamaño. No obstante, se trata de un modelo de investigación, no de un sistema de propósito general: carece de conocimiento del mundo, no sigue instrucciones y solo genera texto dentro del dominio narrativo de TinyStories.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT decoder-only (8 capas, d_model 512, 8 cabezas de atencion) |
| Parametros totales | 51.430.400 (25.698.816 no-embedding) |
| Parametros activos | No es MoE; el nivel 1 de mascara activa 34.146.152 parametros |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (entrenado e inferido en bf16) |
| Idiomas soportados | No disponible (entrenado en TinyStories, ingles simplificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura GPT decoder-only convencional con 8 capas, dimensiones ocultas de 512 y 8 cabezas de atencion. La innovacion principal no esta en la arquitectura sino en el objetivo de entrenamiento. La funcion de perdida combina la entropia cruzada estandar sobre el modelo denso con un termino de restriccion por bisagra (hinge) que obliga a cada subred anidada a mantenerse dentro de una tolerancia respecto a la distribucion de probabilidad del siguiente token del modelo denso. Las mascaras se generan mediante un proceso de adelgazamiento de Bernoulli iterado y se mantienen fijas durante todo el entrenamiento. El termino de bisagra hace que la proximidad actue como una restriccion, no como un objetivo: dentro de la bola de tolerancia, el gradiente se anula y cada nivel queda libre para ocupar cualquier punto cercano a la referencia.

El entrenamiento se realizo sobre el dataset TinyStories con el tokenizador BPE de GPT-2 (vocabulario de 50.257 tokens), secuencias de 512 tokens y un lote de 65.536 tokens por paso. Se ejecutaron 10.000 pasos en total, lo que equivale a 0,66 mil millones de tokens. El optimizador fue AdamW con tasa de aprendizaje 0,0006, calentamiento de 1.000 pasos y decaimiento de pesos 0,1, todo en precision bf16. Los hiperparametros del objetivo AML fueron lambda 2,0, un unico nivel de mascara, rho 0,001, epsilon 0,00021 y gamma 1,0.

## Capacidades

- Generacion de texto narrativo simple: produce relatos coherentes y gramaticalmente correctos dentro del dominio de TinyStories, con vocabulario limitado y estructuras oracionales sencillas.
- Auto-destilacion enmascarada: el modelo contiene subredes anidadas que se entrenan para permanecer proximas a la distribucion del modelo denso, lo que permite estudiar la compresion de capacidad sin perdida de calidad.
- Inferencia con densidad variable: aunque el enmascaramiento no reduce la latencia (los tensores conservan su forma), el modelo permite experimentar con niveles de densidad de parametros activos.
- Generacion autoregresiva estandar: decodificacion token a token con logits completos sobre el vocabulario de GPT-2.
- No dispone de tool calling, soporte de agentes, razonamiento multi-paso, capacidades multimodales ni modo de pensamiento.

## Casos de uso

- Investigacion en objetivos de entrenamiento: el modelo sirve como banco de pruebas para comparar el objetivo AML con la entropia cruzada estandar en condiciones controladas, midiendo perplejidad, calidad de generacion y comportamiento de las subredes.
- Estudio de auto-destilacion y compresion: los niveles de mascara permiten analizar como la capacidad de una subred se relaciona con la calidad de sus predicciones, informando disenos de modelos eficientes.
- Analisis de eficiencia de inferencia: las mediciones de prefill y decode publicadas en la model card (3.328 y 100 tok/s en A100) sirven como referencia para estudios de latencia en modelos pequenos.
- Generacion de texto narrativo educativo: puede emplearse para producir historias cortas en ingles simplificado, utiles en aplicaciones de aprendizaje de lectura infantil, aunque sin garantias de calidad editorial.
- Benchmark de hardware: al ser un modelo de 51M de parametros, resulta util para validar pipelines de inferencia en GPUs de consumo o entornos con recursos limitados.
- Educacion en arquitecturas transformer: su tamano reducido y su implementacion personalizada (no basada en transformers) lo convierten en un recurso didactico para entender el entrenamiento de modelos autorregresivos y la destilacion de conocimiento.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de validacion sobre TinyStories:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 1,3744 |
| Perplejidad de validacion | 3,95 |
| Mejor perdida de validacion | 1,4158 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El modelo no es evaluable en dichos benchmarks por su naturaleza de dominio unico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en bf16 (51,4 millones de parametros), por lo que cabe en cualquier GPU moderna, incluidas las de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; las pruebas publicadas se realizaron en una NVIDIA A100-SXM4-80GB.
- Compatibilidad con GPUs de consumo: si, el modelo es ejecutable en RTX 3060, RTX 4090, GTX 1660 o incluso en CPU con un rendimiento aceptable.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que requiere una implementacion personalizada (codigo propio, no transformers). El despliegue se realiza cargando los pesos safetensors con la clase `build_model` del repositorio del autor.
- Latencia y throughput: en A100-SXM4-80GB con bf16, prompt de 30 tokens y decodificacion de 64 tokens, se midieron 3.328 tok/s en prefill, 100 tok/s en decode y 10,00 ms por token. El nivel 1 de mascara presenta valores similares (3.302 tok/s prefill, 99,0 tok/s decode, 10,10 ms/token) porque el enmascaramiento no elimina pesos, solo los anula.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El modelo es un artefacto de investigacion sin publicaciones de referencia que lo situen frente a alternativas de su mismo tamano. Como referencia orientativa, modelos de tamano similar entrenados en TinyStories (por ejemplo, TinyStories-1M o GPT-2 pequeño) suelen reportar perplejidades en el rango de 3 a 5, pero no se dispone de datos verificados para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Dominio restringido: el modelo solo ha visto TinyStories, un corpus sintetico de historias simples. No tiene conocimiento del mundo real, hechos historicos, ciencia ni cultura general.
- No sigue instrucciones: no esta entrenado con dialogo ni con objetivos de instruccion; generar texto con prompts de tipo pregunta-respuesta producira continuaciones narrativas, no respuestas utiles.
- Riesgo de alucinacion: el texto generado es fluido pero sin fundamento factual; cualquier afirmacion que produzca debe considerarse inventada.
- Sin capacidades multilingues: aunque el tokenizador de GPT-2 soporta multiples idiomas, el entrenamiento exclusivo en ingles simplificado limita severamente la generacion en otros idiomas.
- Implementacion no estandar: requiere el codigo personalizado del autor; no funciona con la API de transformers ni con herramientas de despliegue convencionales.
- Sin aceleracion real por densidad: el enmascaramiento no reduce la latencia porque los tensores conservan su forma; obtener una aceleracion real exigiria poda estructurada y reconstruccion del modelo.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para produccion por sus limitaciones funcionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HuggingAnalist/TinyAmlGpt-Base-10kn
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
