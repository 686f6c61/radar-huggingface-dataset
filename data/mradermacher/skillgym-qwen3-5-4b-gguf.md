# mradermacher/SkillGym-Qwen3.5-4B-GGUF

## Resumen

SkillGym-Qwen3.5-4B-GGUF es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo reasonwang/SkillGym-Qwen3.5-4B. Se trata, por tanto, de una redistribución optimizada para inferencia local, no de un entrenamiento original: el autor de la cuantización no ha publicado el pipeline, la licencia ni los idiomas soportados en la informacion disponible. El modelo base subyacente es un ajuste de Qwen3.5-4B, un transformer denso de aproximadamente 4B parametros que, segun la documentacion publica de Qwen3.5-4B, declara una longitud de contexto nativa de 262.144 tokens y una base unificada de vision-lenguaje.

El interes de esta publicacion radica en dos factores. Por un lado, SkillGym es un framework descrito en el paper arXiv:2609.27717 cuyo objetivo es transformar habilidades humanas escritas (agent skills) en entornos de entrenamiento ejecutables y verificables, de modo que el modelo internalice esos flujos de trabajo en lugar de recibirlos como instrucciones en tiempo de inferencia. Por otro, la cuantizacion GGUF permite desplegar un modelo de este tamano en hardware de consumo, con variantes que van desde Q2_K hasta f16.

Con 0 descargas y 0 likes en el momento del registro, y sin model card sustantiva mas alla de la lista de cuantizaciones, se trata de una publicacion muy reciente y practicamente sin validacion comunitaria. El repositorio ocupa 39,9 GB, lo que refleja la suma de todos los archivos de cuantizacion, no el peso de una unica variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-4B; no confirmada explicitamente para este ajuste) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este ajuste; la base Qwen3.5-4B declara 262.144 tokens de contexto nativo segun LM Studio |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas, convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) |

Datos adicionales de la publicacion: autor mradermacher, etiquetas gguf, endpoints_compatible, region:us y conversational; fecha de creacion 2026-10-01; tamano del repositorio 39,9 GB; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La arquitectura concreta de este ajuste no se detalla en la informacion disponible mas alla de que deriva de reasonwang/SkillGym-Qwen3.5-4B, que a su vez se apoya en Qwen3.5-4B. Segun la ficha de Qwen3.5-4B en LM Studio, la familia Qwen3.5 integra aprendizaje multimodal, eficiencia arquitectonica, escalado de aprendizaje por refuerzo y accesibilidad global, y el modelo de 4B es denso con 262.144 tokens de contexto nativo. No hay confirmacion de que estas caracteristicas (en particular la parte multimodal) se conserven en el ajuste SkillGym ni en sus cuantizaciones GGUF.

Respecto al entrenamiento, el paper SkillGym (arXiv:2609.27717) describe un framework que convierte habilidades humanas escritas en entornos de entrenamiento ejecutables y verificables para agentes basados en LLM, mediante un pipeline de habilidad a tarea (skill-to-task). El objetivo declarado es internalizar esas habilidades como capacidades reutilizables del modelo, en lugar de tratarlas como instrucciones externas en tiempo de inferencia. La informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal para este modelo concreto.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como conversational, por lo que el uso previsto es el dialogo.
- Internalizacion de habilidades de agente: segun el paper SkillGym, el modelo se entrena para incorporar flujos de trabajo escritos como capacidades ejecutables, orientadas a tareas reales de agente.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que las cuantizaciones pueden servirse mediante infraestructura compatible con endpoints estandar de HuggingFace.
- Razonamiento multi-paso: no confirmado explicitamente en la informacion disponible, aunque es coherente con el enfoque de tareas de agente del framework SkillGym.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Vision: la base Qwen3.5-4B declara una base unificada de vision-lenguaje, pero las cuantizaciones GGUF listadas no incluyen proyector multimodal (mmproj) y el parametro skip_mmproj aparece vacio en la model card, por lo que la capacidad de vision en esta distribucion no esta confirmada.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Agentes que ejecutan habilidades predefinidas: dado que el ajuste SkillGym busca internalizar flujos de trabajo de agente, resulta adecuado para construir asistentes que ejecuten procedimientos estructurados (por ejemplo, resolución de tickets siguiendo un arbol de decision fijo) sin necesidad de inyectar el procedimiento completo en cada prompt.
- Despliegue local en hardware de consumo: las variantes Q2_K a Q4_K_M permiten ejecutar el modelo en GPUs con 4-6 GB de VRAM y en CPU mediante llama.cpp, util para pruebas de concepto y entornos sin acceso a GPU de datacenter.
- Prototipado de pipelines de agente en investigacion: el modelo sirve como banco de pruebas para comparar el enfoque de internalizacion de habilidades frente al enfoque clasico de instrucciones en tiempo de inferencia.
- Chat conversacional de proposito general: con la etiqueta conversational, puede emplearse para asistentes de dialogo sencillos una vez validada su calidad, que no esta documentada.
- Evaluacion de cuantizaciones: al publicarse un abanico amplio de cuantizaciones (desde Q2_K hasta f16), es util para medir la degradacion de calidad segun el nivel de compresion en tareas de agente.
- Integracion en servicios compatibles con endpoints: la etiqueta endpoints_compatible facilita su despliegue en plataformas que consumen modelos GGUF a traves de una API estandar.
- Fine-tuning posterior o experimentacion con LoRA: al ser un modelo de 4B, es viable ajustarlo en una unica GPU de gama alta para dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del recuento de parametros (4,2B) y del nivel de cuantizacion, no datos confirmados por el autor; la guia de llmapi.ai menciona una cuantizacion minima de 1,9 GB para el modelo base.

- VRAM estimada para inferencia (estimacion, con overhead de contexto variable):
  - Q2_K / Q3_K_S: en torno a 2-2,5 GB.
  - Q3_K_M / Q3_K_L / IQ4_XS: en torno a 2,5-3 GB.
  - Q4_K_S / Q4_K_M: en torno a 3-3,5 GB.
  - Q5_K_S / Q5_K_M: en torno a 3,5-4 GB.
  - Q6_K: en torno a 4-4,5 GB.
  - Q8_0: en torno a 5-5,5 GB.
  - x-f16: en torno a 9-10 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar que las cuantizaciones bajas funcionen en GPU de consumo tipo RTX 3060/4060, y las altas en RTX 4070/4080/4090, pero esto no esta confirmado por el autor.
- Cabe en GPU de consumo: previsiblemente si para las cuantizaciones de Q2_K a Q4_K_M en GPUs con 6 GB o mas, y hasta Q8_0 en GPUs con 8-12 GB. No confirmado.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; tambien servidores compatibles con endpoints estandar. vLLM y TGI no estan confirmados para GGUF de este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los siguientes datos proceden de los resultados de busqueda y se refieren a otros repositorios, no a este modelo.

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| SkillGym-Qwen3.5-4B-GGUF (este) | ~4,2B | GGUF | No disponible (base: 262.144) | No disponible | Ajuste orientado a internalizacion de habilidades de agente |
| Qwen3.5-4B-heretic-GGUF (mradermacher) | 4B (no confirmado) | GGUF | No disponible | apache-2.0 | Version abliterated / uncensored, idioma ingles declarado |
| Qwen3-4B-GPT-5.2-High-Reasoning-Distill-GGUF (mradermacher) | 4B (no confirmado) | GGUF | No disponible | No disponible | Destilacion orientada a razonamiento |
| Qwen3.5-4B-Base | 4,7B (segun llmapi.ai) | safetensors / GGUF / MLX | 262.144 segun LM Studio | No disponible | Modelo base denso multimodal |

La comparacion de rendimiento entre estos modelos no es posible con la informacion disponible.

## Limitaciones y advertencias

- Sin model card sustantiva: el autor solo publica la lista de cuantizaciones y el enlace al modelo base, sin descripcion, licencia ni idiomas declarados.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial. Es imprescindible verificar la licencia del modelo base reasonwang/SkillGym-Qwen3.5-4B y de Qwen3.5-4B antes de cualquier despliegue en produccion.
- Idiomas no disponibles: no se puede garantizar el comportamiento en castellano ni en otros idiomas distintos del ingles.
- Riesgo de alucinacion: no evaluado; no hay benchmarks ni evaluaciones de fiabilidad publicadas para este ajuste.
- Sesgos conocidos: no documentados.
- Capacidad multimodal no confirmada: aunque la base Qwen3.5-4B declara vision-lenguaje, las cuantizaciones de este repositorio no incluyen proyector multimodal, por lo que la entrada de imagenes podria no funcionar.
- Longitud de contexto efectiva incierta: el valor de 262.144 tokens corresponde a la base Qwen3.5-4B, no a este ajuste; ademas, contextos muy largos incrementan notablemente los requisitos de VRAM.
- Cero adopcion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad, con el consiguiente riesgo de errores en la cuantizacion no detectados.
- Repositorio de gran tamano: 39,9 GB en total, lo que puede complicar la descarga si no se seleccionan archivos concretos.
- Sin garantias de soporte: no hay foro, issues ni respuestas del autor documentadas en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/SkillGym-Qwen3.5-4B-GGUF
- Modelo base del ajuste: https://huggingface.co/reasonwang/SkillGym-Qwen3.5-4B
- Paper SkillGym: https://arxiv.org/abs/2609.27717
- Ficha de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Guia de despliegue de Qwen3.5-4B-Base: https://llmapi.ai/models/qwen-qwen3-5-4b-base/
- Cuantizacion relacionada (Qwen3.5-4B-heretic-GGUF): https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-GGUF
- Cuantizacion relacionada (Qwen3-4B-GPT-5.2-High-Reasoning-Distill-GGUF): https://huggingface.co/mradermacher/Qwen3-4B-GPT-5.2-High-Reasoning-Distill-GGUF
