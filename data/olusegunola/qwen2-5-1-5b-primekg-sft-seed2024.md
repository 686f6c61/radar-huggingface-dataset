# olusegunola/qwen2.5-1.5b-primekg-sft-seed2024

## Resumen

`olusegunola/qwen2.5-1.5b-primekg-sft-seed2024` es un ajuste fino (SFT) publicado en HuggingFace por el usuario `olusegunola`, construido presumiblemente sobre el modelo base Qwen2.5-1.5B. El nombre del repositorio sugiere que el entrenamiento se realizo sobre datos derivados de PrimeKG, una grafo de conocimiento biomedico orientado a medicina de precision, y que el checkpoint corresponde a la semilla 2024 de un experimento de ajuste supervisado. El repositorio declara la libreria `transformers` y pesos en formato `safetensors`, y esta etiquetado como compatible con endpoints.

La relevancia de esta ficha es fundamentalmente cautelar: no existe model card real (la publicada es la plantilla autogenerada de HuggingFace, con todos los campos en "[More Information Needed]"), no se declara licencia, idiomas, ni datos de entrenamiento, y el repositorio registra 0 descargas, 0 likes y un tamano de 0.0 GB. Esto ultimo es anomalo para un modelo de aproximadamente 1.500 millones de parametros, cuyo checkpoint en bf16 deberia rondar los 3 GB. La busqueda web asociada no devolvio ningun resultado relevante sobre el modelo.

En consecuencia, esta ficha describe el modelo a partir de lo que puede inferirse del identificador y de las especificaciones publicas de la familia Qwen2.5-1.5B, marcando explicitamente cada inferencia. No debe considerarse documentacion validada del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; presumiblemente transformer decoder-only denso, heredado del modelo base Qwen2.5-1.5B (no confirmado por el autor) |
| Parametros totales | No disponible; presumiblemente ~1,54 mil millones segun el identificador del repositorio (no confirmado) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible; presumiblemente 32.768 tokens si hereda la configuracion de Qwen2.5-1.5B (no confirmado) |
| Tipos de cuantizacion | No disponible; el repositorio solo declara pesos `safetensors`, sin variantes GGUF, AWQ o GPTQ publicadas |
| Idiomas soportados | No disponible (Qwen2.5 declara 29 idiomas para el modelo base, pero el autor no confirma el soporte tras el ajuste) |
| Licencia | No disponible; el autor no declara licencia alguna en el repositorio |
| Formato de pesos | `safetensors` (segun las etiquetas del repositorio) |

## Arquitectura y entrenamiento

No se dispone de informacion verificada sobre la arquitectura ni sobre el procedimiento de entrenamiento. La model card publicada es la plantilla autogenerada de HuggingFace y todos los apartados ("Model Description", "Training Data", "Training Procedure", "Training Hyperparameters", "Evaluation") aparecen con el marcador "[More Information Needed]". El unico dato tecnico objetivo del repositorio es la etiqueta `safetensors` y la referencia `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono y forma parte de la plantilla por defecto, no de una publicacion del autor.

A partir del identificador puede inferirse, sin confirmacion, lo siguiente: el modelo partiria de Qwen2.5-1.5B, un transformer decoder-only denso con atencion de consultas agrupadas (GQA), aproximadamente 1,54 mil millones de parametros y ventana de contexto de 32.768 tokens. El ajuste seria un SFT (supervised fine-tuning) sobre datos vinculados a PrimeKG (Precision Medicine Knowledge Graph), un grafo con millones de relaciones biomedicas que cubre enfermedades, farmacos, genes, proteinas y fenotipos, y la semilla 2024 indicaria reproducibilidad de un experimento concreto. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, hiperparametros ni precision numerica (fp16, bf16, fp8).

## Capacidades

- Generacion de texto: capacidad presumiblemente heredada del modelo base, no verificada tras el ajuste.
- Razonamiento y conocimiento biomedico: el ajuste sobre datos tipo PrimeKG sugiere un enfoque en relaciones entre entidades biomedicas (enfermedad-gen-farmaco), pero no hay evaluacion publicada que lo confirme.
- Codigo y matematicas: no documentado.
- Tool calling / function calling: no documentado. Qwen2.5-Instruct soporta function calling nativo, pero no hay confirmacion de que este checkpoint lo conserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el tamano y la denominacion apuntan a un modelo exclusivamente de texto.
- Capacidad de seguir instrucciones: incierta. Un SFT sobre datos de dominio puede degradar el comportamiento conversacional generico si el dataset era estrecho y monodominio.

## Casos de uso

Advertencia previa: al no existir evaluacion publicada ni model card real, los siguientes casos son escenarios plausibles derivados del nombre y del tamano del modelo, no aplicaciones validadas. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.

- Extraccion de relaciones biomedicas: dado un fragmento de literatura cientifica o una ficha clinica, el modelo podria extraer tripletas entidad-relacion (gen-enfermedad, farmaco-diana, sintoma-enfermedad) para poblar o enriquecer un grafo de conocimiento. El ajuste sobre PrimeKG lo haria hipoteticamente adecuado para este tipo de tarea, aunque requeriria validacion con anotaciones de referencia.
- Asistente de literatura cientifica: con 32.768 tokens de contexto (si se confirma), permitiria resumir varios articulos completos y responder preguntas sobre ellos en una sola pasada, manteniendo el texto en local sin enviar datos a APIs externas.
- Preanotacion de datasets clinicos: uso como anotador automatico de bajo coste para generar borradores que despues revisa un especialista humano. El tamano de 1,5B permite ejecutarlo en hardware modesto y procesar volumen alto por un coste marginal muy bajo.
- Prototipado de pipelines RAG sobre conocimiento biomedico: el modelo puede actuar como generador en un sistema de recuperacion aumentada sobre una base documental medica, dejando la recuperacion a un motor vectorial. Su ventana de contexto permite concatenar varios fragmentos recuperados sin truncado agresivo.
- Clasificacion y normalizacion de entidades clinicas: mapear terminos libres de historiales a codigos estandarizados (por ejemplo, vocabularios de enfermedades o farmacos) mediante generacion condicionada, con validacion posterior contra un diccionario.
- Experimentacion academica en ajuste supervisado: el repositorio, con su semilla explicita, puede servir como punto de partida para reproducir o comparar estrategias de SFT sobre datos de grafos de conocimiento en modelos pequenos.
- Filtrado y triaje de textos: clasificar resumenes o abstracts por relevancia tematica en un pipeline de revision sistematica, donde un modelo de 1,5B ejecutado en CPU o GPU de gama media puede escalar a decenas de miles de documentos.
- Generacion de preguntas de evaluacion: producir preguntas y respuestas de dominio biomedico a partir de pasajes, utiles para construir bancos de prueba de otros modelos. Requiere revision humana por el riesgo de alucinacion factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada y la busqueda web no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano de parametros presumiblemente heredado de Qwen2.5-1.5B, no medidas sobre este checkpoint concreto. Deben tratarse como ordenes de magnitud.

- VRAM en precision completa (bf16/fp16): en torno a 3,1 GB solo para pesos, mas cache KV. Con 32.768 tokens de contexto y GQA, la cache puede anadir aproximadamente 0,9 GB, llevando el total a unos 4-5 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 1,6-2 GB de pesos.
- VRAM en cuantizacion de 4 bits (tipo Q4_K_M): aproximadamente 1,0-1,3 GB de pesos; con contexto moderado, menos de 2 GB en total.
- GPU de consumo compatibles: cualquier GPU con 6-8 GB de VRAM permite inferencia en 4 u 8 bits (RTX 3060, RTX 4060, RTX 2070). Una RTX 4090 o RTX 3090 permiten precision completa con contexto largo y mayor paralelismo por lote.
- GPU de centro de datos: A100, H100 o L40S pueden alojar multiples replicas por tarjeta, lo que abarata el coste por peticion en servicios con alta concurrencia.
- Ejecucion sin GPU: viable en CPU con cuantizacion de 4 bits (llama.cpp), a velocidades de pocos tokens por segundo.
- Opciones de despliegue: `transformers` (confirmado por las etiquetas del repositorio), `vLLM`, `TGI`, `llama.cpp` y `Ollama`. Las dos ultimas requieren convertir los pesos a GGUF, ya que el repositorio no publica ese formato.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni informacion sobre hardware de entrenamiento o inferencia del autor.

## Comparativa con modelos similares

Los datos de la columna de alternativas proceden de informacion publica sobre esos modelos y no han sido verificados en la busqueda realizada. En el caso del modelo evaluado, la mayoria de campos estan sin confirmar, por lo que la comparacion es orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olusegunola/qwen2.5-1.5b-primekg-sft-seed2024 | No disponible (presumiblemente ~1,5B) | No disponible | No disponible | Repositorio HuggingFace sin descargas ni likes; tamano reportado 0.0 GB | Model card vacia, sin evaluacion ni datos de entrenamiento |
| Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 tokens | Apache 2.0 | Ampliamente distribuido, con variantes GGUF y cuantizadas | Modelo de referencia de la misma escala, con soporte declarado de function calling |
| Qwen2.5-1.5B (base) | ~1,54B | 32.768 tokens | Apache 2.0 | Ampliamente distribuido | Punto de partida probable del ajuste; util como linea base |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens | Licencia comunitaria de Llama 3.2 (con restricciones) | Ampliamente distribuido | Alternativa de escala similar con contexto mayor y licencia mas restrictiva |
| Modelos biomedicos de mayor tamano (familia BioMistral, Meditron) | 7B o superior | Variable segun modelo | Variable, normalmente basada en licencias de modelo abierto | Requieren GPU de centro de datos o cuantizacion agresiva | Mayor capacidad de dominio, pero coste de inferencia muy superior |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin datos de autor, financiacion, datos de entrenamiento, hiperparametros ni evaluacion. Cualquier uso en produccion exige auditoria previa.
- Licencia sin declarar: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Aunque el modelo base Qwen2.5-1.5B se distribuye bajo Apache 2.0, el autor no ha hecho constar esa herencia y el checkpoint es derivado.
- Repositorio posiblemente incompleto: el tamano reportado de 0.0 GB es inconsistente con un checkpoint de aproximadamente 1,5B en bf16 (unos 3 GB). Es necesario verificar que los pesos esten efectivamente subidos antes de cualquier uso.
- Riesgo de alucinacion elevado en dominio biomedico: los modelos de 1,5B generan afirmaciones factuales plausibles pero incorrectas con frecuencia, y en medicina de precision el impacto de un error puede ser grave. Toda salida debe pasar por validacion contra fuentes verificables.
- Sesgos: no evaluados. No hay analisis de sesgo demografico, linguistico ni de cobertura de subpoblaciones, algo especialmente critico en datos clinicos.
- Degradacion del comportamiento general: un SFT monodominio sobre datos de conocimiento biomedico puede reducir la calidad en tareas generales, seguimiento de instrucciones y conversacion multiturno respecto al modelo base.
- Idiomas sin confirmar: no se especifica si el ajuste conserva el multilingüismo del modelo base o si lo ha restringido al ingles.
- Sin cuantizaciones oficiales: no se publican variantes GGUF, AWQ o GPTQ, por lo que el despliegue ligero depende de conversiones de terceros cuya fidelidad no esta garantizada.
- Riesgo de contaminacion de datos: si el ajuste uso datos derivados de PrimeKG, existe riesgo de fuga de conjuntos de evaluacion hacia el entrenamiento, lo que invalidaria comparaciones con benchmarks biomedicos estandar.
- Madurez del artefacto: 0 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad. No hay issues, discusiones ni retroalimentacion de terceros.
- Fechas incoherentes: el repositorio figura creado y actualizado el 19 de septiembre de 2026, lo que puede indicar metadatos incorrectos o manipulados; conviene tratarlo con cautela.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/olusegunola/qwen2.5-1.5b-primekg-sft-seed2024
- Perfil del autor: https://huggingface.co/olusegunola
- Articulo referenciado en las etiquetas (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico citada en la plantilla: https://mlco2.github.io/impact
- PrimeKG (grafo de conocimiento biomedico que da nombre al ajuste, enlace contextual, no procede de la busqueda): https://zitniklab.hms.harvard.edu/projects/PrimeKG/
- Modelo base presumible: https://huggingface.co/Qwen/Qwen2.5-1.5B

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor ni su entrenamiento. Los unicos resultados obtenidos fueron sitios de streaming de television sin relacion con el tema.
