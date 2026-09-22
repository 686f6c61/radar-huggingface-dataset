# Guangchen-Lan/selfplay-llama-p5en-130d5b

## Resumen

`Guangchen-Lan/selfplay-llama-p5en-130d5b` es un conjunto de adaptadores LoRA (PEFT) entrenados sobre el modelo base `mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated`, una variante sin mecanismos de rechazo del Llama-3.1-8B-Instruct de Meta. El repositorio no contiene pesos completos: solo los adaptadores guardados durante la primera etapa de entrenamiento del atacante (PSRO/A1) de un experimento de autoaprendizaje (self-play) identificado como `p5en-e6c22491-l-130d5b`. Los checkpoints publicados corresponden a los pasos 160, 170 y 180.

La relevancia de esta ficha es limitada y conviene dejarlo claro desde el principio: el propio autor documenta que el entrenamiento A1 se aborto por el guardia de COLAPSO en el paso 180, tras violaciones sostenidas del formato de salida. El experimento completo de PSRO/Uniform/Naive no finalizo, no se ejecutaron benchmarks independientes y la seleccion del checkpoint se hizo por numero de paso mayor, no por criterio de calidad. Es, por tanto, un artefacto de investigacion experimental y no un modelo listo para produccion.

El modelo base aporta la arquitectura y el grueso de las capacidades: un transformer decoder-only de 8.030 millones de parametros con 128.000 tokens de contexto, sobre el que el adaptador anade matrices de bajo rango. No hay datos publicados sobre el rango, el numero de parametros entrenables ni la composicion del dataset de self-play utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptadores LoRA/PEFT; el adaptador no altera la topologia del modelo base |
| Parametros totales | 8.030 millones en el modelo base; parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite fp16, bf16, int8 e int4 (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponibles en la ficha del adaptador; el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible para el adaptador; el modelo base esta sujeto a la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 1,0 GB con los pasos 160, 170 y 180 |
| Libreria | peft |
| Modelo base | mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated (revision 368c8ed94ce4c986e7b9ca5c159651ef753908ce) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura de Llama 3.1 8B: un transformer decoder-only con normalizacion RMSNorm pre-norma, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA) con 8 cabezas KV sobre 32 cabezas de atencion. El adaptador LoRA congela esos pesos e inyecta matrices de bajo rango, por lo que la inferencia final requiere cargar el modelo base completo y aplicar despues el adaptador con `PeftModel.from_pretrained`. El repositorio incluye `run-info.json` con la configuracion del experimento, `manifest.json` con tamanos y sumas SHA-256, y las configuraciones originales de los adaptadores en `provenance/`; segun el autor, los pesos de los adaptadores no se modificaron.

Respecto al entrenamiento, la informacion disponible es deliberadamente escasa. Se trata de la primera etapa del atacante (PSRO/A1) dentro de un ciclo de self-play: un modelo genera topicos o etiquetas de tema (el autor indica que GPT aporto etiquetas de tema cuando se le menciona, y que sus pesos no estan en el repositorio) y el atacante se entrena contra ese material. El proceso se detuvo en el paso 180 por el guardia de COLAPSO del entrenamiento original, disparado por violaciones sostenidas del formato de salida. No se especifican el numero de tokens vistos, la composicion del dataset, si hubo RLHF o DPO, ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en el modelo base Llama 3.1 8B, incluyendo resumen, redaccion y respuesta a instrucciones; el adaptador puede alterar o degradar estas capacidades sin evaluacion publicada.
- Razonamiento basico y matematicas de nivel medio, heredados del modelo base, no verificados tras el entrenamiento del adaptador.
- Generacion de codigo en lenguajes habituales (Python, JavaScript, C++, entre otros), sujeta a las mismas reservas anteriores.
- Dialogo multiturno con contexto largo de hasta 128.000 tokens, gracias al modelo base.
- Soporte de tool calling y function calling: presente en Llama 3.1 Instruct, pero no validado con este adaptador.
- Capacidades multilingues limitadas a los ocho idiomas declarados por Llama 3.1; no hay evaluacion especifica del adaptador.
- No se documenta modo de pensamiento (thinking mode), vision, audio ni ninguna capacidad multimodal.
- Comportamiento de formato: el entrenamiento A1 se aborto precisamente por violaciones sostenidas del formato de salida, lo que sugiere que los checkpoints pueden mostrar problemas de adherencia al formato esperado.

## Casos de uso

- Replicacion de experimentos de self-play y PSRO: sirve como material de partida para reproducir la etapa A1 de un ciclo adversarial y comparar tecnicas de control de colapso en entrenamiento por autoaprendizaje.
- Estudio de colapso de modelos y violaciones de formato: los tres checkpoints (160, 170, 180) permiten analizar como evoluciona la degradacion del formato de salida conforme avanza el entrenamiento del atacante.
- Investigacion sobre adaptadores LoRA sobre modelos abliterated: util para medir como interactua un ajuste fino de bajo rango con un modelo base al que se le han eliminado los mecanismos de rechazo.
- Linea base negativa en evaluaciones: al no tener benchmark ni curacion de calidad, es un candidato honesto para ilustrar en un articulo metodologico que un checkpoint mas avanzado no equivale a un modelo mejor.
- Docencia y formacion: ejemplo didactico de model card honesta que documenta un fallo de entrenamiento, los ficheros de provenance y el uso correcto de PEFT con `subfolder` por checkpoint.
- Pruebas de infraestructura de despliegue PEFT: validar cadenas de carga con `transformers` + `peft` + `accelerate`, fusion de adaptadores y exportacion a GGUF antes de invertir en modelos ya evaluados.
- Red teaming academico: dado su origen sobre un modelo abliterated, puede utilizarse en entornos controlados para estudiar generacion de contenido no filtrado y disenar mitigaciones.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun flujo de negocio: no hay evaluacion de calidad, licencia declarada para el adaptador ni garantia de adherencia a formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecutaron benchmarks independientes y que el experimento completo no finalizo.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16 (modelo base mas adaptador fusionado o en linea): aproximadamente 16 GB solo de pesos, mas cache KV; en la practica 18-20 GB para contextos moderados.
- VRAM en cuantizacion int8: en torno a 9-10 GB de pesos, mas cache KV.
- VRAM en cuantizacion 4 bits (GGUF, AWQ, GPTQ): en torno a 5,5-6,5 GB de pesos, mas cache KV.
- El contexto de 128.000 tokens dispara el consumo de cache KV; conviene reducirlo a menos que se disponga de GPU con memoria amplia.
- GPU profesionales: A100 40/80 GB, H100, L40S; suficientes para bf16 con contexto largo.
- GPU de consumo: RTX 3090 y RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 4080, RTX 3080 de 12-16 GB y tarjetas de 8 GB solo con cuantizacion int4.
- El adaptador LoRA en si ocupa poco espacio (el repositorio completo son 1,0 GB repartidos en tres checkpoints mas provenance), pero siempre exige descargar el modelo base.
- Opciones de despliegue: vLLM y TGI con el adaptador cargado sobre el modelo base o fusionado previamente; llama.cpp, Ollama y LM Studio requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Guangchen-Lan/selfplay-llama-p5en-130d5b | 8,03 B (base) + LoRA | 128.000 | No | No disponible (base bajo Llama 3.1 Community License) | Adaptador publico, 0 descargas |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Si, extensa | Llama 3.1 Community License | Pesos completos publicos |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | 8,03 B | 128.000 | Parcial, comunidad | Llama 3.1 Community License | Pesos completos publicos |
| Adaptadores LoRA de self-play de proposito general | Variable | Depende del base | Habitualmente no | Variable | Repositorios dispersos, calidad heterogenea |

La comparacion relevante es con el modelo base y con la variante abliterated, ya que este repositorio no aporta pesos completos ni evaluacion propia. Frente a ellos, la unica diferencia funcional es el ajuste LoRA, sin evidencia publicada de mejora.

## Limitaciones y advertencias

- Entrenamiento incompleto: la etapa A1 se aborto en el paso 180 por el guardia de COLAPSO, y el ciclo PSRO/Uniform/Naive no se completo.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni validacion de capacidades tras el ajuste.
- Criterio de seleccion del checkpoint: se eligio el de mayor numero de paso (180), no el de mejor calidad; los pasos 160 y 170 tambien estan disponibles sin jerarquia de calidad establecida.
- Riesgo elevado de violaciones de formato en la salida, precisamente el motivo por el que el entrenamiento se detuvo.
- Riesgo de alucinacion no cuantificado, heredado del modelo base y potencialmente agravado por el ajuste sin curacion.
- Sesgos: no documentados, pero el modelo base Llama 3.1 presenta sesgos conocidos de genero, raza y religion; la variante abliterated elimina rechazos de seguridad, lo que puede aumentar la exposicion a contenido danino.
- Licencia del adaptador no declarada; el modelo base esta bajo Llama 3.1 Community License, con las restricciones de uso comercial y atribucion de dicha licencia. Cualquier uso comercial exige verificar la situacion legal con el autor.
- Inconsistencia de identificadores: la model card carga el adaptador desde `zhihz0535/selfplay-llama-p5en-130d5b`, mientras que el identificador del repositorio consultado es `Guangchen-Lan/selfplay-llama-p5en-130d5b`. Conviene verificar cual es el repositorio vigente antes de usarlo.
- Idiomas no declarados para el adaptador; el comportamiento fuera de los ocho idiomas del base no esta garantizado.
- Repositorio sin descargas ni interacciones: no hay senales de uso comunitario ni retroalimentacion de terceros.
- No apto para produccion sin una evaluacion propia exhaustiva y una fusion de adaptador validada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Guangchen-Lan/selfplay-llama-p5en-130d5b
- Repositorio referenciado en la model card: https://huggingface.co/zhihz0535/selfplay-llama-p5en-130d5b
- Modelo base (abliterated): https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Modelo original de Meta: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct/blob/main/LICENSE
- No se han encontrado articulos, papers, blogs ni demos adicionales en la busqueda web realizada.
