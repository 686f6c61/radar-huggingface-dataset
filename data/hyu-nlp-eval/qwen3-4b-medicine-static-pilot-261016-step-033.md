# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-033

## Resumen

qwen3-4b-medicine-static-pilot-261016-step-033 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVAL en HuggingFace. Se trata de un checkpoint intermedio, concretamente el paso 33, de una ejecución de entrenamiento denominada `261016_medicine_static_pilot` con semilla 11, orientada al dominio médico. No es un modelo final pulido, sino un artefacto de evaluación que probablemente acompaña a un estudio o a un pipeline interno de experimentación.

El modelo tiene 4.022.468.096 parámetros (unos 4.000 millones) y se distribuye bajo licencia Apache 2.0, lo que en principio permite uso comercial sin restricciones adicionales. Hereda del modelo base la arquitectura transformer densa de la familia Qwen3 y, con toda probabilidad, su ventana de contexto nativa, aunque la ficha del autor no declara ni contexto, ni idiomas, ni composición del dataset de entrenamiento.

Su relevancia práctica es hoy limitada: cero descargas y cero valoraciones, sin resultados de benchmarks publicados y sin model card descriptiva más allá de los metadatos del run. Es útil como referencia para quien quiera reproducir el experimento o inspeccionar el formato de exportación (BF16 en Transformers más el checkpoint nativo veRL/FSDP), pero no está pensado ni validado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507; detalles de capas no disponibles) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens |
| Tipos de cuantizacion | no disponible (solo se publica exportacion BF16; no hay GGUF ni AWQ/GPTQ en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) en la raiz del repositorio, mas `original_checkpoint/` con los ficheros nativos veRL/FSDP |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo mas alla de que se trata de un fine-tune de Qwen/Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3. El repositorio contiene dos artefactos: una exportacion BF16 lista para `transformers` en la raiz y un directorio `original_checkpoint/` con los ficheros exactos del checkpoint nativo veRL/FSDP junto con sus metadatos. La model card indica que el checkpoint local se elimina solo despues de verificar tamanos y hashes SHA256 de todos los ficheros remotos.

Sobre el entrenamiento solo se conocen los identificadores del run: `261016_medicine_static_pilot`, paso 33 y semilla 11. No se especifican el numero de tokens, la composicion del dataset, la tecnica de ajuste (SFT, DPO, RLHF u otra) ni el marco de entrenamiento mas alla del uso de veRL/FSDP. El hecho de que sea el paso 33 y que se etiquete como "static pilot" sugiere un experimento corto y de caracter exploratorio. No hay informacion sobre innovaciones tecnicas adicionales.

## Capacidades

Las capacidades que se enumeran a continuacion son las esperables por herencia del modelo base, pero no estan verificadas en este checkpoint concreto y un ajuste medico a paso 33 puede haber degradado parte de ellas:

- Generacion de texto e instrucciones conversacionales multi-turno.
- Razonamiento basico y resolución de problemas de dominio general.
- Generacion de codigo y matematicas, como en el modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling y function calling segun la plantilla del modelo base (no confirmado en este checkpoint).
- Uso en flujos de agentes y razonamiento en varios pasos (no confirmado).
- Capacidad multilingue (no declarada en la ficha; el modelo base cubre un rango amplio de idiomas).
- Especializacion esperada en contenido y terminologia medica, que es el objetivo declarado del run (`medicine_static_pilot`).
- No se declara vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Experimentacion academica en NLP clinico: el modelo sirve como punto de partida reproducible (semilla 11, paso 33, checkpoint nativo incluido) para comparar tecnicas de ajuste en dominio medico dentro de un grupo de investigacion.
- Evaluacion de pipelines de entrenamiento: al conservar el checkpoint veRL/FSDP original, permite auditar el estado exacto del optimizador y reanudar o replicar el run sin depender de una exportacion intermedia.
- Generacion de resumenes de notas clinicas sinteticas: en un entorno de laboratorio con datos anonimizados, el modelo puede probarse para condensar texto medico, siempre con supervision humana y sin uso clinico real.
- Extraccion de entidades y terminologia medica: uso como componente de un prototipo de anotacion automatica de informes, midiendo despues la tasa de error contra anotadores humanos.
- Clasificacion y normalizacion de texto sanitario: tareas de etiquetado de especialidad, codigos o categorias sobre corpus de investigacion, aprovechando el ajuste de dominio.
- Punto de comparacion (baseline) en estudios de evaluacion: util para medir cuanto aporta un ajuste medico corto frente al modelo base sin ajustar en un conjunto de validacion propio.
- Demostraciones internas de generation asistida: prototipos de chat de apoyo a profesionales en los que el modelo solo sugiere texto y nunca emite recomendaciones clinicas directas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MedQA ni de ningun otro conjunto de evaluacion, y tampoco se ofrecen comparaciones con el modelo base. No se deben inferir cifras a partir del nombre del repositorio ni del numero de paso del entrenamiento.

## Requisitos de hardware

- VRAM para pesos en BF16/FP16: aproximadamente 8,05 GB solo para los parametros (4.022.468.096 x 2 bytes).
- VRAM total estimada para inferencia en BF16 con contexto corto: del orden de 10-12 GB, incluyendo cache KV y overhead del runtime. Estas cifras son estimaciones y no estan confirmadas por el autor.
- VRAM con contexto largo: aumenta de forma apreciable por la cache KV; con decenas de miles de tokens puede superar los 16-24 GB segun la configuracion de atencion del modelo base.
- GPU recomendadas: A100 40/80 GB, H100, L40S y RTX 6000 Ada para servicio concurrente; RTX 4090, 4080 o 3090 para desarrollo e inferencia individual.
- GPU de consumo: cabe en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en BF16 con contexto moderado, y con mas holgura si se convierte a cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: `transformers` de forma directa, TGI (el repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de la documentacion publica de cada uno y no se han verificado en esta ficha; conviene contrastarlos antes de citarlos.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-033 | 4,02 B | no disponible (base: 262.144) | Apache 2.0 | Checkpoint de investigacion, paso 33, sin benchmarks ni adopcion |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02 B | 262.144 | Apache 2.0 | Modelo base, sin ajuste de dominio medico, con evaluaciones publicadas |
| Qwen/Qwen2.5-3B-Instruct | ~3,09 B | 32.768 (ampliable con YaRN) | Apache 2.0 (Qwen) | Generacion anterior, mas pequeno y con menos contexto nativo |
| Llama-3.2-3B-Instruct | ~3,21 B | 128.000 | Llama 3.2 Community License | Licencia con restricciones para grandes despliegues |
| microsoft/Phi-4-mini-instruct | ~3,8 B | 128.000 | MIT | Orientado a razonamiento denso, tamanos comparables |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 33) de un run piloto, no un modelo final; su calidad puede ser claramente inferior a la del modelo base sin ajustar.
- No hay ninguna evaluacion publicada, ni de dominio general ni de dominio medico, por lo que se desconoce si el ajuste mejora o degrada el rendimiento del modelo base.
- Riesgo elevado de alucinacion en contenido medico; el modelo no debe usarse para diagnostico, triaje, prescripcion ni asesoramiento clinico.
- Uso en ambito sanitario: cualquier aplicacion real quedaria sujeta al Reglamento europeo de IA (AI Act) y, si actua como producto sanitario, al Reglamento MDR; este checkpoint no aporta documentacion tecnica ni evidencias para ello.
- No se declaran idiomas soportados, sesgos conocidos ni composicion del dataset, lo que impide evaluar cobertura linguistica y sesgos demograficos o clinicos.
- Ausencia de cuantizaciones oficiales: usar GGUF o formatos de 4 bits exige una conversion propia y una validacion posterior de calidad.
- Sin adopcion (0 descargas, 0 valoraciones) y sin mantenimiento declarado: no hay garantia de soporte, correcciones ni actualizaciones.
- La licencia Apache 2.0 permite uso comercial, pero no transfiere ninguna garantia sobre los datos de entrenamiento ni sobre el cumplimiento normativo del dominio medico.
- La ficha del autor es minima; no se documenta la plantilla de chat exacta, por lo que el formato de prompt debe inferirse del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-033
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo, su autoria o su run de entrenamiento; los resultados obtenidos corresponden a entidades no relacionadas. No hay papers, blogs, repositorios ni demos adicionales disponibles.
