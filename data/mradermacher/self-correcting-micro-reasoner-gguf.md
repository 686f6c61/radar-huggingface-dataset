# mradermacher/Self-Correcting-Micro-Reasoner-GGUF

## Resumen

Self-Correcting-Micro-Reasoner es un modelo de razonamiento de pequeno tamano (1.543.714.304 parametros, aproximadamente 1,54 mil millones) afinado mediante aprendizaje por refuerzo sobre una base de la familia Qwen, segun las etiquetas de la model card. El autor original es Adityapande403 y esta version GGUF ha sido producida por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. El modelo esta disenado especificamente para razonamiento matematico con mecanismos de autocorreccion, consistencia propia y consenso entre cadenas de razonamiento.

La relevancia de este modelo radica en su enfoque de entrenamiento: utiliza GRPO (Group Relative Policy Optimization) con RLVR (Reinforcement Learning with Verifiable Rewards), tecnicas que se han popularizado para entrenar modelos de razonamiento sin necesidad de datos de preferencia humana costosos. El objetivo es que un modelo de menos de 2.000 millones de parametros pueda autocorregir sus errores en tareas matematicas, algo tradicionalmente reservado a modelos mucho mas grandes.

Esta publicacion concreta es una coleccion de cuantizaciones GGUF estaticas (desde Q2_K hasta f16) que permiten ejecutar el modelo en hardware de consumo. El modelo solo declara soporte para ingles y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, segun tags; detalles no disponibles) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo base pertenece a la familia Qwen (tag `qwen`) y que se distribuye con `library_name: transformers`. Con 1,54 mil millones de parametros, se situa en el rango de los modelos Qwen2.5-1.5B, aunque no se confirma que sea exactamente esa base. No se dispone de datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto nativa.

El entrenamiento combina varias tecnicas declaradas en los tags: GRPO como algoritmo de aprendizaje por refuerzo, RLVR con recompensas verificables (tipico en tareas matematicas donde la respuesta final se puede comprobar automaticamente), y metodos de autocorreccion, consistencia propia y consenso. Tambien se indica el uso de LoRA, lo que sugiere que el ajuste se realizo sobre el modelo base mediante adaptadores de bajo rango en lugar de un fine-tuning completo. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo una fase posterior de DPO o RLHF adicional.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico como capacidad principal, con enfasis en problemas verificables.
- Autocorreccion: el modelo esta entrenado para revisar y corregir sus propias cadenas de razonamiento.
- Consenso y consistencia propia: genera multiples razonamientos y agrega resultados para mejorar la fiabilidad.
- Razonamiento multi-paso orientado a problemas de tipo GSM8K o similares.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de vision, audio ni otras modalidades.
- No se documenta capacidad agentica explicita mas alla del razonamiento multi-paso.
- Multilingue: solo ingles declarado.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede descomponer problemas aritmeticos y algebraicos en pasos y detectar errores intermedios gracias a su entrenamiento en autocorreccion, adecuado para asistentes educativos en ingles.
- Verificacion de soluciones en pipelines de evaluacion: puede usarse como segundo modelo que revisa respuestas generadas por otro sistema, aprovechando su sesgo hacia el consenso y la consistencia.
- Prototipado de razonamiento en hardware de consumo: con cuantizaciones de 0,8 a 1,7 GB, cabe en GPUs de gama baja y permite experimentar con tecnicas RLVR sin infraestructura dedicada.
- Generacion de cadenas de razonamiento para datasets sinteticos: util para producir trazas de razonamiento matematico que luego se filtren por verificacion automatica.
- Investigacion en RL y razonamiento: sirve como caso de estudio reproducible de GRPO y RLVR a pequena escala para comparar con modelos mayores.
- Despliegue embebido o en el borde: el tamano reducido en Q4_K_M (1,1 GB) permite integrarlo en aplicaciones locales de escritorio o entornos con RAM limitada.
- Base para fine-tuning especifico de dominio: al ser Apache 2.0 y pequeno, es un punto de partida economico para adaptar razonamiento matematico a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,8 GB
  - Q3_K_S / Q3_K_M: ~0,9 GB
  - Q3_K_L / IQ4_XS / Q4_K_S: ~1,0 GB
  - Q4_K_M: ~1,1 GB
  - Q5_K_S / Q5_K_M: ~1,2 GB
  - Q6_K: ~1,4 GB
  - Q8_0: ~1,7 GB
  - f16: ~3,2 GB
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores sobran para todas las variantes. Tambien viable en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Self-Correcting-Micro-Reasoner | ~1,54 B | no disponible | Razonamiento matematico con GRPO/RLVR y autocorreccion | Apache 2.0 | GGUF y safetensors en HF |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | Instruccion general | Apache 2.0 | Amplia, multiples formatos |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,54 B | 32.768 tokens (segun documentacion publica de DeepSeek) | Razonamiento por destilacion | MIT | Amplia, multiples formatos |

La comparacion con Qwen2.5-1.5B-Instruct y DeepSeek-R1-Distill-Qwen-1.5B se basa en el mismo rango de parametros y en la etiqueta `qwen` del modelo; no se dispone de datos de rendimiento que permitan una comparacion cuantitativa. La ventaja diferencial declarada de este modelo es su entrenamiento especifico en autocorreccion y consenso, mientras que sus alternativas tienen ecosistemas y documentacion mucho mas extensos.

## Limitaciones y advertencias

- Modelo de muy baja difusion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a la base Qwen o a destilados de razonamiento.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente fuera de dominios matematicos verificables.
- El mecanismo de autocorreccion puede producir cadenas de razonamiento largas sin mejora real en la respuesta final; conviene validar con verificadores externos.
- No se documenta longitud de contexto; asumir ventanas cortas y probar antes de usarlo en conversaciones largas.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base Qwen subyacente para uso comercial.
- El autor de la cuantizacion advierte que las cuantizaciones Q3_K_M son de menor calidad y que no hay versiones con imatrix/weighted disponibles.
- Sin garantias de mantenimiento: el repositorio se creo y actualizo el mismo dia, sin historial posterior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Self-Correcting-Micro-Reasoner-GGUF
- Modelo base: https://huggingface.co/Adityapande403/Self-Correcting-Micro-Reasoner
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Self-Correcting-Micro-Reasoner-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
