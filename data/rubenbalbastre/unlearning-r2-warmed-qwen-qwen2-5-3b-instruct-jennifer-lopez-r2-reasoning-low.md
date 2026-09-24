# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-jennifer-lopez-r2-reasoning-low

## Resumen

Este repositorio contiene un adaptador LoRA (librería PEFT) entrenado sobre el modelo Qwen2.5-3B-Instruct dentro de un flujo de trabajo de *machine unlearning* (desaprendizaje de modelos de lenguaje). El identificador del modelo, junto con las etiquetas del repositorio, indica que se ha utilizado GRPO (Group Relative Policy Optimization) a través de TRL, que existe una fase previa de calentamiento (*warmed*) y que el objetivo del ajuste es una entidad concreta, en este caso la cantante Jennifer Lopez. La ruta local filtrada en las etiquetas (`machine-unlearning-llm/outputs/model/...`) confirma que se trata de un experimento académico de olvido selectivo, no de un modelo comercial.

El adaptador ocupa 0,5 GB y se distribuye en formato safetensors con metadatos de PEFT 0.19.1. La model card publicada es la plantilla por defecto de HuggingFace sin rellenar: todos los campos relevantes (desarrollador, datos de entrenamiento, hiperparámetros, evaluación, licencia, idiomas) aparecen como `[More Information Needed]`. El repositorio registra cero descargas y cero valoraciones en el momento de redactar esta ficha.

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only de 3.090 millones de parámetros con 32.768 tokens de contexto, desarrollado por Alibaba Qwen. Por tanto, la relevancia de este artefacto es exclusivamente investigadora: sirve como ejemplo reproducible de cómo aplicar RL (GRPO) para intentar eliminar una asociación concreta de un modelo pequeño, y como material de estudio para evaluar la eficacia real del desaprendizaje. No hay ningún dato publicado que permita afirmar que el olvido sea efectivo ni que las capacidades originales se conserven.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA entrenado mediante GRPO; notebook y metadatos generados con PEFT y TRL |
| Parametros totales | Aproximadamente 3.090 millones en el modelo base; el adaptador LoRA añade un numero de parametros no especificado (repo de 0,5 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens, heredados del modelo base; el adaptador no modifica el limite. El base admite extension a 131.072 tokens con YaRN |
| Tipos de cuantizacion | No disponible en el repositorio. Al estar en safetensors, requiere fusionar el adaptador con el base y convertir despues a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible en la informacion del repositorio. El modelo base declara soporte para mas de 29 idiomas, incluido el espanol |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only con 36 capas, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA) de 16 cabezas de consulta por 2 cabezas de clave/valor. Su vocabulario es de 151.936 tokens y su ventana nativa de contexto es de 32.768 tokens. Sobre esta base se ha entrenado un adaptador LoRA, del que no se especifican rango, modulo objetivo (`q_proj`, `v_proj`, etc.), *dropout* ni tasa de aprendizaje.

El entrenamiento del adaptador emplea GRPO, un algoritmo de aprendizaje por refuerzo sin modelo critico que estima la ventaja normalizando las recompensas dentro de un grupo de respuestas generadas para el mismo *prompt*. Este esquema se ha popularizado para inducir razonamiento (como en DeepSeek-R1) y aqui se reutiliza con una finalidad de desaprendizaje. Segun las etiquetas y el nombre del repositorio, el proceso incluye una fase de calentamiento previa (`warmed`), una componente de razonamiento (`r2-reasoning`) y un nivel de esfuerzo bajo (`low`), aunque no hay documentacion que describa en que consiste cada etapa. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa ni la infraestructura de computo utilizada.

## Capacidades

- Generacion de texto conversacional: hereda del modelo base la capacidad de mantener dialogos multi-turno, seguir instrucciones y producir texto coherente en registro formal e informal.
- Razonamiento y matematicas basicas: el base Qwen2.5-3B-Instruct resuelve problemas aritmeticos y de logica de dificultad media, capacidad que el ajuste con GRPO podria reforzar o degradar segun el caso.
- Generacion de codigo: el modelo base cubre lenguajes habituales (Python, JavaScript, C++, SQL) para tareas de autocompletado y explicacion, aunque con la precision propia de un modelo de 3.000 millones de parametros.
- Soporte multilingue: el base declara mas de 29 idiomas; no hay evidencia de que el adaptador los preserve.
- Tool calling: el modelo base Qwen2.5-Instruct soporta *function calling* y formato JSON estructurado; no se confirma que el adaptador conserve esta capacidad.
- Modificacion del comportamiento objetivo: la finalidad declarada del adaptador es reducir la asociacion del modelo con una entidad concreta (Jennifer Lopez). No se aporta ninguna metrica que cuantifique el grado de olvido alcanzado.
- Modo de razonamiento: el sufijo `reasoning` del identificador sugiere entrenamiento con cadenas de razonamiento, pero no hay ejemplos ni documentacion que lo confirmen.
- No hay evidencia de capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Investigacion en machine unlearning: el adaptador sirve como artefacto de partida para reproducir un pipeline de olvido selectivo basado en RL. Se cargaria con `PeftModel.from_pretrained` sobre Qwen2.5-3B-Instruct y se compararia la probabilidad asignada a la entidad objetivo antes y despues del ajuste.
- Auditoria de eficacia del olvido: permite disenar baterias de *prompts* (directos, indirectos y adversariales) para medir si la asociacion realmente desaparece o solo se enmascara en la superficie, un problema recurrente en la literatura de unlearning.
- Estudios de alineacion con GRPO: al ser un caso concreto de RL sin critico aplicado a un modelo de 3.000 millones de parametros, resulta util para analizar la estabilidad del entrenamiento, la varianza de las recompensas y el coste computacional frente a alternativas como DPO o *gradient ascent*.
- Comparacion de metodos de desaprendizaje: el mismo modelo base admite adaptadores entrenados con otras tecnicas, lo que permite montar un banco de pruebas controlado con una unica base y varios adaptadores intercambiables mediante PEFT.
- Adaptacion a dominios propios: la receta (LoRA + GRPO) es replicable para intentar eliminar otras entidades, como datos personales (PII), marcas registradas o informacion obsoleta en corpus internos.
- Docencia y formacion tecnica: el repositorio es un ejemplo compacto (0,5 GB) de como se estructura un adaptador PEFT con TRL, util para cursos de ajuste fino eficiente en parametros.
- Cumplimiento normativo (derecho al olvido): como prueba de concepto de los flujos tecnicos que un equipo podria plantear ante una solicitud de supresion de datos, siempre que se complemente con una evaluacion formal de eficacia.
- Analisis de degradacion de capacidades: permite estudiar la relacion entre la intensidad del ajuste por RL y la perdida de rendimiento en tareas generales (olvido catastrofico), comparando el adaptador con el modelo base en un mismo conjunto de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio contiene unicamente la plantilla por defecto con todos los campos de evaluacion marcados como `[More Information Needed]`, y no se ha localizado ninguna tabla de resultados asociada al identificador del modelo ni al arXiv referenciado en las etiquetas.

## Requisitos de hardware

- Peso del adaptador: 0,5 GB en safetensors.
- Peso del modelo fusionado: en bf16/fp16, aproximadamente 6,2 GB (3.090 millones de parametros a 2 bytes por parametro), mas el *overhead* de activaciones y cache KV.
- VRAM estimada: entre 7 y 9 GB en bf16 con `transformers` para lotes pequenos; alrededor de 4 GB en cuantizacion de 8 bits; entre 2 y 3 GB en GGUF Q4_K_M; menos de 2 GB en Q4_0 con contexto reducido.
- GPU consumer: cabe sin problemas en tarjetas con 8 GB o mas de VRAM, como RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070 o superiores. En 4 bits es viable incluso en GPUs de 6-8 GB. La RTX 4090 o una A100/H100 no son necesarias para inferencia, aunque si lo serian para reentrenar el adaptador con GRPO (que requiere generar multiples muestras por *prompt* y calcular recompensas).
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF. Tambien es posible servirlo con TGI tras fusionar los pesos.
- Latencia y throughput: no disponibles. No hay ningun dato publicado de tokens por segundo, tiempo hasta el primer token ni consumo energetico asociado al entrenamiento o a la inferencia.

## Comparativa con modelos similares

La comparacion se establece a nivel de modelo base, porque no existen metricas publicadas del adaptador ni otros adaptadores de desaprendizaje comparables en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas de olvido |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-3B-Instruct) | ~3,09 B (base) + LoRA sin cuantificar | 32.768 tokens | No disponible | HuggingFace, 0 descargas, 0 valoraciones | No disponible |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (131.072 con YaRN) | Licencia propia de Qwen; consultar la ficha del modelo base | Ampliamente utilizado | No aplica |
| Llama-3.2-3B-Instruct | 3,21 B | 131.072 tokens | Llama 3.2 Community License | Ampliamente utilizado | No aplica |
| Phi-3.5-mini-instruct | 3,8 B | 131.072 tokens | MIT | Ampliamente utilizado | No aplica |

Frente a estos modelos, este adaptador no aporta ventajas de rendimiento general: su unico diferencial es el objetivo de desaprendizaje y el uso de GRPO como metodo de ajuste. Cualquier eleccion entre ellos para tareas estandar deberia basarse en el modelo base, no en el adaptador.

## Limitaciones y advertencias

- Model card sin contenido: no hay informacion sobre datos de entrenamiento, hiperparametros, funcion de recompensa ni proceso de evaluacion. Es imposible auditar el comportamiento del adaptador a partir de la documentacion publicada.
- Eficacia del olvido no demostrada: no se aporta ninguna metrica de desaprendizaje. En la literatura del area es habitual que el conocimiento "olvidado" reaparezca con *prompts* reformulados, contextos largos o ataques de *jailbreak*.
- Riesgo de olvido catastrofico: el ajuste por RL sobre un modelo de 3.000 millones de parametros puede degradar capacidades generales (codigo, matematicas, multilingue) sin que exista una evaluacion que lo cuantifique.
- Ausencia de licencia declarada: no se especifican los terminos de uso del adaptador. Esto bloquea cualquier uso comercial o redistribucion sin aclaracion previa por parte del autor, y ademas hay que verificar la licencia del modelo base Qwen2.5-3B-Instruct, que es independiente.
- Sin validacion comunitaria: cero descargas y cero valoraciones implican que el artefacto no ha sido probado por terceros. Cualquier fallo (pesos corruptos, configuracion de PEFT incorrecta) pasaria inadvertido.
- Sesgos heredados: el adaptador no elimina los sesgos presentes en Qwen2.5-3B-Instruct, derivados de su corpus de entrenamiento web.
- Alucinacion: en un modelo de 3.000 millones de parametros la tasa de afirmaciones factualmente incorrectas es alta, agravada porque el proceso de desaprendizaje puede eliminar informacion correcta junto con la no deseada.
- Ventana de contexto limitada: 32.768 tokens nativos, insuficiente para analisis de documentos extensos sin tecnicas de extension como YaRN.
- Dependencia de una ruta local en los metadatos: la etiqueta `base_model:adapter:/storage/scratch/...` apunta a un sistema de ficheros concreto, lo que puede causar problemas de resolucion al cargar el adaptador en entornos distintos.
- No apto para produccion: se trata de un artefacto de investigacion sin garantias de calidad, soporte ni mantenimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-jennifer-lopez-r2-reasoning-low
- Paper referenciado en las etiquetas del repositorio: https://arxiv.org/abs/2608.17804
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL (implementacion de GRPO): https://github.com/huggingface/trl
- Calculadora de impacto medioambiental citada en la plantilla de la model card: https://mlco2.github.io/impact
