# ShatongZhu/cs329x-hw1-llama-3.2-3b-dpo

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo meta-llama/Llama-3.2-3B-Instruct. Lo publica el usuario ShatongZhu como entrega de la primera tarea practica del curso CS329X, dedicado a tecnicas de alineacion de modelos de lenguaje. No se trata por tanto de un modelo completo, sino de un conjunto de pesos de adaptador que debe cargarse siempre junto al modelo base original y bajo la licencia Llama 3.2.

El objetivo del trabajo es demostrar el flujo completo de un pipeline de alineacion por preferencias: recogida de datos en Label Studio, construccion de un dataset de comparaciones por pares y entrenamiento DPO sobre un adaptador de bajo rango. El dataset utilizado es muy reducido, con 378 comparaciones por pares procedentes de 18 tareas de anotacion, e incluye respuestas de modelos ordenadas por calidad junto con una respuesta "mejor" escrita por una persona. El propio autor advierte en la model card que no reclama ninguna mejora general de rendimiento o de seguridad derivada de este entrenamiento.

Por su naturaleza, el artefacto tiene interes academico y metodologico mas que practico: resulta util como referencia reproducible de configuracion DPO (beta, learning rate, epochs, rango LoRA) y como punto de partida para experimentos de alineacion a pequena escala. No hay descargas ni valoraciones registradas en el momento de redactar esta ficha, el repositorio ocupa 0,0 GB y los resultados de busqueda web no aportan informacion adicional relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Llama 3.2 3B Instruct); adaptador LoRA aplicado sobre sus capas lineales |
| Parametros totales | no disponible en la model card. El modelo base declara aproximadamente 3,21 mil millones de parametros; el adaptador anade un subconjunto de pesos con rango r=8 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card. El modelo base Llama 3.2 3B Instruct declara 128.000 tokens de contexto |
| Tipos de cuantizacion | no disponible. El adaptador se distribuye en safetensors sin cuantizar; el modelo base admite conversiones de la comunidad (GGUF, AWQ, GPTQ, entre otras) |
| Idiomas soportados | no disponible en la model card. El modelo base declara soporte oficial para 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). Requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama 3.2 en su variante de 3.000 millones de parametros, la version Instruct ya alineada por Meta. Sobre el se aplica un adaptador LoRA con rango r=8 y alpha=16, es decir, una descomposicion de bajo rango que anade muy pocos parametros entrenables y deja congelados los pesos originales. La libreria declarada es PEFT, y la carga se realiza con `PeftModel.from_pretrained(base_model, this_repository)`.

El entrenamiento usa DPO con beta=0.1, learning rate 0.0002, 3 epocas, tamano de lote 1 y acumulacion de gradiente de 8, lo que equivale a un lote efectivo de 8 ejemplos. Con 378 pares de preferencia, el numero total de pasos de optimizacion es del orden de 140 (calculo estimado, no declarado explicitamente en la model card). El dataset proviene de 18 tareas de Label Studio e incluye respuestas de modelos ordenadas por preferencia y una respuesta de referencia escrita por una persona. No se declara uso de RLHF adicional, decodificacion especulativa ni tecnicas de atencion alternativa; tampoco se detalla la composicion linguistica del dataset ni el numero de tokens de entrenamiento.

## Capacidades

- Hereda las capacidades del modelo base Llama 3.2 3B Instruct: generacion de texto, razonamiento basico, resumen y respuesta a instrucciones.
- El adaptador esta entrenado especificamente para ajustar el comportamiento a las preferencias recogidas en el dataset de 378 pares; no se documenta ninguna capacidad nueva adquirida.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (el modelo base de 3B de Llama 3.2 si declara soporte de llamadas a herramientas, pero no se verifica en este adaptador).
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no documentadas. El modelo base declara 8 idiomas oficiales, pero el dataset de preferencias no especifica su composicion linguistica.
- Modo "thinking", vision o audio: no disponible. Llama 3.2 3B es un modelo exclusivamente de texto.
- Uso como material didactico reproducible para estudiar el flujo DPO completo.

## Casos de uso

- Docencia e investigacion en alineacion: el repositorio sirve como ejemplo ejecutable de un pipeline DPO con PEFT, util para asignaturas y laboratorios que necesiten una referencia de hiperparametros y formato de datos.
- Reproduccion de experimentos de preferencias a pequena escala: permite replicar el entrenamiento con 378 pares y comparar salidas base frente a salidas DPO, tal como recoge el cuaderno del autor.
- Punto de partida para fine-tuning posterior: al ser un adaptador LoRA, se puede continuar el entrenamiento con mas datos de preferencia o combinarlo con otros adaptadores mediante tecnicas de mezcla, sin tocar los pesos del modelo base.
- Pruebas de regresion de pipelines DPO: util para validar que una infraestructura de entrenamiento (carga de dataset, tokenizacion de pares, calculo de la perdida DPO) funciona de extremo a extremo antes de escalar a modelos mayores.
- Estudio comparativo de metodos de alineacion: sirve como linea base de DPO que puede contrastarse con SFT, ORPO o KTO sobre el mismo dataset reducido.
- Prototipado local de asistentes de texto: desplegando el adaptador fusionado con el modelo base en una GPU de gama media, puede usarse para demos de generacion de texto en entornos sin requisitos de produccion.
- Analisis de sesgos en datos de anotacion humana: al contar con una respuesta escrita por una persona por tarea, permite estudiar como las preferencias de un anotador concreto se reflejan en el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card indica que el cuaderno asociado contiene las salidas reales de la comparacion entre el modelo base y el modelo con DPO, y que no se reclama ninguna mejora general de rendimiento ni de seguridad a partir de este dataset de preferencias tan reducido. No hay valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- El adaptador en si ocupa un espacio minimo (el repositorio declara 0,0 GB); el coste de hardware lo determina el modelo base de 3,21 mil millones de parametros.
- VRAM estimada para el modelo base en bf16/fp16: entre 6,5 y 7,5 GB para los pesos, mas la cache KV segun la longitud de contexto (estimacion; no declarada por el autor).
- VRAM estimada en cuantizacion de 8 bits: en torno a 4 GB (estimacion).
- VRAM estimada en cuantizacion de 4 bits (por ejemplo Q4_K_M en GGUF): en torno a 2,5 GB (estimacion).
- Cabe en GPU de consumo: si. Ejemplos habituales son RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080, RTX 4090 y equipos Apple Silicon con memoria unificada.
- GPU de centro de datos recomendadas para mayor throughput: A100, H100, L40S.
- Opciones de despliegue: HuggingFace Transformers junto con PEFT para cargar el adaptador sin fusionar; vLLM soporta adaptadores LoRA de forma nativa; para llama.cpp u Ollama es necesario fusionar previamente el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ShatongZhu/cs329x-hw1-llama-3.2-3b-dpo | Adaptador LoRA sobre 3,21 mil millones | Heredado del base (128.000 tokens declarados por Meta) | Llama 3.2 Community License | HuggingFace, 0 descargas | Artefacto academico; sin benchmarks ni garantias de mejora |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente desplegado | Modelo base del adaptador; alineado por Meta con SFT y RLHF |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | HuggingFace | Alternativa de tamano similar con licencia permisiva |
| Phi-3.5-mini-instruct | 3,8 mil millones | 128.000 tokens | MIT | HuggingFace | Alternativa de tamano similar, orientada a razonamiento |

Los datos de Qwen2.5-3B-Instruct y Phi-3.5-mini-instruct no proceden de la informacion proporcionada en esta busqueda; se incluyen como referencia de categoria y conviene verificarlos en sus model cards oficiales. La comparacion de rendimiento entre estos modelos y el adaptador DPO no es posible porque el adaptador no publica resultados de evaluacion.

## Limitaciones y advertencias

- Tamano del dataset extremadamente reducido: 378 comparaciones por pares procedentes de 18 tareas. Es insuficiente para producir mejoras generalizables y el propio autor declina reclamarlas.
- Riesgo de sobreajuste a las preferencias de un grupo muy pequeno de anotadores, con posible sesgo hacia el estilo o las opiniones de esas personas concretas.
- Riesgo de alucinacion: inherente al modelo base de 3.000 millones de parametros, y no mitigado por este entrenamiento.
- No hay datos de evaluacion de sesgos, toxicidad, veracidad ni seguridad para este adaptador.
- Limitacion idiomatica no documentada: se desconoce la composicion linguistica del dataset de preferencias, por lo que no puede garantizarse un comportamiento adecuado en espanol.
- El adaptador no es un modelo autonomo: requiere descargar y ejecutar meta-llama/Llama-3.2-3B-Instruct, sujeto a sus propios terminos.
- Restricciones de licencia: se aplica la Llama 3.2 Community License. El uso comercial esta sujeto a las condiciones de Meta, incluida la clausula de licencia adicional para organizaciones con mas de 700 millones de usuarios mensuales y las obligaciones de atribucion.
- Sin mantenimiento ni soporte: el repositorio no registra descargas ni interacciones, y fue creado como entrega academica.
- No apto para produccion: no existen benchmarks, pruebas de carga, mediciones de latencia ni garantias de estabilidad.
- La model card no especifica version de Transformers, PEFT ni el hardware utilizado en el entrenamiento, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/ShatongZhu/cs329x-hw1-llama-3.2-3b-dpo
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper de DPO (Direct Preference Optimization): https://arxiv.org/abs/2305.18290
- Libreria PEFT: https://github.com/huggingface/peft

Nota: los resultados de busqueda web proporcionados no contienen ningun enlace relevante sobre este modelo; todas las entradas devueltas corresponden al artista musical Yanns y no guardan relacion con el repositorio. No se dispone por tanto de papers, blogs ni demos adicionales especificos de este adaptador.
