# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ8e-fp16-mtp

## Resumen

Este repositorio contiene una version cuantizada del modelo identificado como Qwen3.8-27B, publicada por el usuario Johneeee bajo el nombre Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ8e-fp16-mtp. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a formato MLX safetensors con cuantizacion de 8 bits en precision mixta, generada con la herramienta oQ (oMLX v0.7.0.dev2). El model_type declarado en la model card es qwen3_5, lo que apunta a la familia Qwen3.5, aunque el autor no identifica de forma explicita el checkpoint base ni su procedencia.

El dato objetivo mas solido es el recuento de parametros obtenido de los safetensors: 27.781.427.952 parametros (aproximadamente 27,8 mil millones), con un repositorio de 30,9 GB. La model card se limita a documentar los parametros de cuantizacion (8 bits, group size 64, formato MLX safetensors) y no incluye informacion sobre datos de entrenamiento, longitud de contexto, idiomas, licencia ni evaluaciones.

La relevancia de esta ficha es limitada pero concreta: interesa a quienes trabajan con inferencia local en Apple Silicon mediante MLX y quieren reutilizar una cuantizacion de 8 bits de un modelo de ~28B en un unico equipo con memoria unificada. Cabe senalar que el repositorio acumula 0 descargas y 0 likes, no declara licencia y las busquedas web realizadas no han devuelto ningun resultado relacionado con el modelo (los unicos resultados obtenidos eran recetas de cocina en griego, sin ninguna vinculacion tecnica).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El campo model_type de la model card indica qwen3_5, lo que sugiere un transformer decoder-only de la familia Qwen3.5, sin confirmacion por parte del autor |
| Parametros totales | 27.781.427.952 (dato real de los safetensors, ~27,8 mil millones) |
| Parametros activos | No disponible. No consta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits con group size 64, precision mixta (oQ de oMLX v0.7.0.dev2). El nombre del repositorio menciona fp16 y mtp, lo que sugiere capas en fp16 y posible multi-token prediction, sin confirmar |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El repositorio no declara licencia |
| Formato de pesos | MLX safetensors (libreria mlx) |

## Arquitectura y entrenamiento

No hay informacion publicada en este repositorio sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. El unico dato estructural declarado es el model_type qwen3_5. Dado que se trata de un artefacto de cuantizacion y no de un entrenamiento, no se ha realizado ninguna fase de preentrenamiento ni ajuste por parte del autor de esta publicacion: el proceso aplicado es exclusivamente de compresion de pesos.

La innovacion tecnica del repositorio es, por tanto, la propia cuantizacion: se ha aplicado oQ (oMLX v0.7.0.dev2) con precision mixta a 8 bits y group size 64, un esquema que asigna distinto numero de bits a distintas capas en funcion de su sensibilidad, en lugar de uniformar la precision. El sufijo del nombre del repositorio (oQ8e-fp16-mtp) apunta a una combinacion de capas en 8 bits, capas conservadas en fp16 y un posible cabezal o variante de multi-token prediction, pero el autor no detalla la receta exacta ni publica metricas de degradacion respecto al modelo en precision completa. No se han publicado resultados de benchmarks en la informacion disponible.

## Capacidades

No es posible confirmar capacidades concretas a partir de la informacion disponible. El repositorio no incluye model card funcional, ejemplos de uso, plantillas de chat ni evaluaciones. A continuacion se enumeran las capacidades que cabria esperar por herencia del modelo base, marcadas explicitamente como no verificadas:

- Generacion de texto: no verificado. Depende del checkpoint base, que no se identifica con certeza.
- Razonamiento y matematicas: no verificado.
- Generacion de codigo: no verificado.
- Tool calling / function calling: no verificado. No hay plantilla de chat ni documentacion al respecto.
- Soporte de agentes y razonamiento multi-paso: no verificado.
- Capacidades multilingues: no disponibles. No se declara lista de idiomas.
- Modo thinking o razonamiento extendido: no verificado, aunque el tag de familia qwen3_5 lo harias plausible en algunos checkpoints de esa linea.
- Vision o audio: no disponible. Los safetensors corresponden a un modelo de texto segun el recuento y el tamano del repositorio.
- Sin censura (uncensored): el nombre del repositorio lo indica, pero no se especifica que tecnica de ablacion o ajuste se ha aplicado ni con que datos.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX safetensors esta disenado para ejecutarse sobre memoria unificada de chips M-series mediante mlx-lm. Un modelo de ~28B en 8 bits ocupa alrededor de 31 GB, por lo que encajaria en equipos con 36 GB o mas de memoria unificada, sin necesidad de GPU dedicada ni de conexion a internet.
- Asistente conversacional privado en escritorio: al ejecutarse integramente en local, ninguna peticion sale del equipo. Es adecuado para entornos con requisitos estrictos de confidencialidad (despachos legales, sanidad, analisis interno) siempre que se valide antes la calidad de las respuestas del checkpoint base.
- Generacion creativa sin filtros editoriales: la etiqueta Uncensored del repositorio sugiere uso en escritura de ficcion, guiones o narrativa donde los filtros de seguridad estandar resultan restrictivos. Requiere revision humana del contenido generado y atencion a la legislacion aplicable.
- Red teaming y evaluacion de seguridad: util como modelo sujeto a prueba en ejercicios de jailbreak y medicion de tasas de cumplimiento de politicas, comparando su comportamiento frente a la version alineada del mismo checkpoint base.
- Evaluacion de tecnicas de cuantizacion: sirve como artefacto de referencia para medir la perdida de calidad de la cuantizacion mixta a 8 bits (oQ) frente al modelo en bf16/fp16 y frente a formatos GGUF, en tareas de perplexity, seguimiento de instrucciones y generacion de codigo.
- Despliegue de demos sin conectividad: ferias, laboratorios aislados o entornos air-gapped donde se necesita un asistente de texto sin acceso a APIs externas. La ausencia de dependencias de red de MLX simplifica el empaquetado.
- Experimentacion con ajuste fino ligero: mlx-lm permite entrenar adaptadores LoRA sobre modelos cuantizados en MLX, de modo que este repositorio podria servir de base para prototipos de personalizacion en local. El autor no documenta ni valida este flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplexity ni ninguna otra metrica, y las busquedas web realizadas no han devuelto ningun resultado relacionado con el modelo. Tampoco se documenta la degradacion introducida por la cuantizacion a 8 bits respecto al checkpoint original.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros y del tamano del repositorio, no datos publicados por el autor.

- VRAM o memoria unificada estimada: el repositorio pesa 30,9 GB, por lo que se necesita al menos ese espacio para los pesos, mas overhead de runtime (cache KV y buffers), lo que en la practica situa el requisito minimo en torno a 34-40 GB dependiendo de la longitud de contexto utilizada.
- Plataforma: MLX es un framework de Apple. El uso directo de estos pesos requiere un Mac con chip Apple Silicon (familia M). No es ejecutable de forma nativa en CUDA.
- Equipos compatibles: Mac Studio o MacBook Pro con 36 GB, 48 GB, 64 GB, 96 GB o 128 GB de memoria unificada. En configuraciones de 36 GB puede quedar muy justo; 48 GB o mas es el escenario comodo.
- GPU NVIDIA: no aplica al formato publicado. Para usar el modelo en A100, H100, RTX 4090 o similares habria que reconvertir los pesos a un formato compatible (por ejemplo safetensors en bf16 con Transformers, o GGUF para llama.cpp), y no se distribuye esa conversion en este repositorio.
- Opciones de despliegue: mlx-lm como via principal (carga de safetensors MLX y generacion). vLLM, TGI y Ollama no soportan MLX safetensors directamente; Ollama y llama.cpp requeririan una conversion a GGUF que el autor no proporciona.
- Latencia y throughput: no disponibles. No hay mediciones de tokens por segundo publicadas.

## Comparativa con modelos similares

No disponible. El repositorio no identifica de forma inequivoca el checkpoint base ni su version, no declara licencia y no publica evaluaciones, por lo que no es posible establecer una comparacion fiable con alternativas de la misma categoria. Se recogen a continuacion los unicos datos verificables del artefacto.

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ8e-fp16-mtp | 27.781.427.952 | No disponible | MLX safetensors, 8 bits | No disponible | 0 descargas, 0 likes |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de informacion para seleccionar modelos equivalentes |

## Limitaciones y advertencias

- Ausencia total de licencia: el repositorio no declara licencia. Sin una licencia explicita no se concede ningun permiso de uso, copia, modificacion ni redistribucion, incluido el uso comercial. Es un bloqueo legal objetivo, no un matiz.
- Trazabilidad del modelo base inexistente: no se indica que checkpoint concreto se ha cuantizado, ni su version, ni su procedencia. Esto impide verificar la licencia heredada del modelo original y hace imposible reproducir el artefacto.
- Sin evaluaciones: no hay benchmarks, ni mediciones de perplexity, ni analisis de degradacion por cuantizacion. Cualquier afirmacion sobre su calidad seria especulativa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala. Al no existir ajuste de alineacion documentado y estar etiquetado como Uncensored, es esperable una menor adherencia a rechazar peticiones problematicas y una mayor facilidad para producir contenido danino, sesgado o factualmente falso.
- Sesgos: no disponibles. No hay ninguna evaluacion de sesgo publicada y se desconoce la composicion del corpus de entrenamiento original.
- Contenido sin filtrar: la etiqueta Uncensored implica que el modelo puede generar material ofensivo, violento o sexualmente explicito. Necesita moderacion en cualquier despliegue con usuarios finales.
- Contexto e idiomas desconocidos: no se declara longitud de contexto ni lista de idiomas, lo que impide planificar aplicaciones que dependan de ventanas largas o de cobertura multilingue.
- Restriccion de plataforma: al estar en formato MLX, el uso directo queda limitado a Apple Silicon. No hay pesos en GGUF ni en safetensors estandar de PyTorch, lo que reduce drasticamente la portabilidad.
- Madurez del artefacto: 0 descargas y 0 likes, publicado y actualizado en un intervalo de 25 minutos. No hay evidencia de que haya sido probado por terceros.
- Consistencia de la informacion: el nombre del repositorio sugiere fp16 y multi-token prediction, mientras que la model card solo menciona 8 bits con group size 64. No se aclara que capas quedan en fp16 ni si el componente mtp es funcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ8e-fp16-mtp
- Repositorio de la herramienta de cuantizacion oQ (oMLX), citado en la model card: https://github.com/jundot/omlx
- Paper, blog, repositorio del modelo base, demo o dataset: no disponibles. Las busquedas web realizadas no devolvieron ningun resultado relacionado con el modelo.
