# aniruddhr04/ani-qwen25-b-s42

## Resumen

ani-qwen25-b-s42 es un adaptador LoRA de bajo rango (r=16, alpha=32) entrenado sobre el modelo base Qwen/Qwen2.5-7B-Instruct, publicado por el usuario aniruddhr04 en HuggingFace. No es un modelo completo ni un modelo de produccion: es un artefacto de investigacion descrito por su autor como "tool-policy LoRA, arm B (label-shuffled control), seed 42", dentro de un estudio de interpretabilidad mecanicista sobre seguridad en llamadas a herramientas (tool calls).

El interes tecnico del repositorio no reside en su rendimiento, sino en su funcion como control negativo. El brazo B con etiquetas permutadas (label-shuffled) sirve para medir cuanto del comportamiento observado en el brazo experimental se debe realmente a la senal de entrenamiento y cuanto a artefactos del proceso. Es, por tanto, material de comparacion para experimentos de interpretabilidad, no una pieza desplegable.

El repositorio ocupa 0,2 GB, no tiene descargas ni "likes", no incluye pipeline declarado, no publica idiomas soportados ni resultados de evaluacion, y su model card se limita a cuatro lineas. La licencia declarada es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (Low-Rank Adaptation) sobre un transformer decoder-only denso; modelo base Qwen2.5-7B-Instruct (28 capas, hidden size 3584, GQA con 28 cabezas de consulta y 4 de clave/valor) |
| Parametros totales | No declarado por el autor. El modelo base tiene 7,61 B de parametros. Con r=16 sobre las proyecciones lineales habituales de Qwen2.5-7B el adaptador estaria en el orden de 10-40 M de parametros entrenables (estimacion, no confirmada por la model card) |
| Longitud de contexto | No declarada en el adaptador; heredada del base: 32.768 tokens nativos, extensible a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; la cuantizacion aplica al modelo base tras fusionar (GGUF, AWQ, GPTQ disponibles para Qwen2.5-7B-Instruct por terceros) |
| Idiomas soportados | No disponible en la model card (el modelo base declara soporte multilingue, incluido espanol) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, cargable con peft.PeftModel.from_pretrained) |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA con rango r=16 y alpha=32, lo que implica un factor de escalado alpha/r = 2 sobre las matrices de bajo rango inyectadas en las capas del modelo base. La model card no especifica los modulos objetivo (target modules), la tasa de aprendizaje, el numero de pasos, el tamano del dataset ni el metodo de optimizacion (SFT, DPO u otro), por lo que no es posible reconstruir el procedimiento de entrenamiento a partir de la informacion publicada.

El unico dato relevante de entrenamiento es de diseno experimental: se trata de un "tool-policy LoRA" del brazo B, con etiquetas permutadas (label-shuffled) y semilla 42. Es decir, el adaptador fue entrenado deliberadamente sobre una version corrupta o aleatorizada de las etiquetas de politica de llamadas a herramientas, con el objetivo de actuar como control negativo dentro de un estudio de interpretabilidad mecanicista. La consecuencia esperada es que el adaptador no aprenda una politica de tool calling funcional, sino que sirva de referencia para aislar el efecto de la senal supervisada real.

No se documenta ninguna innovacion arquitectonica propia: no hay atencion lineal, decodificacion especulativa ni mecanismos hibridos. Toda la arquitectura efectiva es la de Qwen2.5-7B-Instruct, un transformer denso con Grouped Query Attention.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: heredadas del modelo base Qwen2.5-7B-Instruct, sujetas a la degradacion que pueda introducir un adaptador entrenado con etiquetas permutadas.
- Tool calling / function calling: es el dominio sobre el que se entrena el adaptador, pero al tratarse del brazo de control con etiquetas aleatorizadas no debe asumirse una politica de tool calling fiable ni correcta.
- Razonamiento multi-paso y uso como agente: no evaluado en este adaptador; el modelo base dispone de capacidades de razonamiento y de integracion en flujos de agentes.
- Codigo y matematicas: capacidades del modelo base, no verificadas sobre el adaptador.
- Multilingue: no declarado en la model card del adaptador; el base soporta multiples idiomas, incluido el espanol.
- Capacidades especiales: ninguna propia. No hay modo thinking explicito, ni vision, ni audio.
- Uso previsto declarado: control experimental en estudios de interpretabilidad mecanicista sobre seguridad de tool calls.

## Casos de uso

- Control negativo en estudios de interpretabilidad: el adaptador sirve como linea base frente al brazo experimental del mismo estudio, permitiendo atribuir las diferencias de comportamiento a la senal de entrenamiento y no a la configuracion de LoRA, la semilla o el modelo base.
- Ablacion de etiquetas en investigacion de seguridad de agentes: permite cuantificar cuanto del comportamiento de tool calling de un adaptador supervisado es genuino comparandolo con este brazo con etiquetas permutadas.
- Reproducibilidad de experimentos: al fijar seed 42 y publicar los pesos, otro grupo puede replicar exactamente la condicion de control del estudio original.
- Analisis de activaciones y circuitos internos: comparar mapas de activacion entre el brazo de control y el brazo experimental ayuda a localizar que capas y cabezas codifican la politica de llamadas a herramientas.
- Referencia metodologica para diseno experimental: util como ejemplo publicado de como construir y liberar un brazo de control en estudios de PEFT, con separacion explicita entre artefacto de investigacion y modelo de produccion.
- Pruebas de pipelines de evaluacion: sirve para validar arneses de evaluacion de tool calling comprobando que un modelo sin politica aprendida efectivamente obtiene puntuaciones bajas, detectando asi metricas que no discriminan.
- Formacion y docencia: ejemplo didactico de adaptador PEFT minimo (0,2 GB) que se puede cargar sobre un 7B en una GPU de consumo para ilustrar el flujo peft.PeftModel.from_pretrained.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K, BFCL o similares), no hay tabla de resultados en el repositorio y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo. No se deben extrapolar cifras del modelo base para caracterizar este adaptador, ya que el entrenamiento con etiquetas permutadas puede alterar su comportamiento de forma no medida.

## Requisitos de hardware

Estimaciones para el conjunto modelo base (7,61 B) mas adaptador LoRA, cuyo coste adicional de memoria es despreciable (decenas de MB):

- VRAM en fp16/bf16: aproximadamente 15,2 GB solo para los pesos, mas cache KV y overhead; en la practica 18-20 GB.
- VRAM en 8 bits (GPTQ/AWQ): en torno a 8 GB.
- VRAM en 4 bits (GPTQ/AWQ o GGUF Q4_K_M): en torno a 4,5-5,5 GB.
- Cache KV: con GQA de 4 cabezas KV de 128 dimensiones en 28 capas, unos 56 KB por token en fp16; a 32.768 tokens de contexto, aproximadamente 1,8 GB adicionales.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB para fp16 con contexto largo; RTX 4090 24 GB y RTX 3090 24 GB funcionan en fp16 con contexto moderado; RTX 4080 16 GB en 8 bits; RTX 3060 12 GB y RTX 4060 Ti 16 GB en 4 bits.
- Cabe en GPU de consumo: si, en 4 bits practicamente en cualquier GPU con 8 GB o mas, y en 8 bits a partir de 12 GB.
- Opciones de despliegue: vLLM y TGI admiten adaptadores LoRA en caliente; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base antes de convertir a GGUF; tambien es viable fusionar con peft y servir el modelo resultante con cualquier runtime estandar.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ani-qwen25-b-s42 (este) | Adaptador LoRA sobre 7,61 B | No declarado (base: 32.768 tokens) | No evaluado | apache-2.0 | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | 32.768 tokens (131.072 con YaRN) | Benchmark publicado por el autor del base | apache-2.0 | Ampliamente desplegado, ecosistema maduro |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Benchmark publicado por el autor del base | Licencia comunitaria de Meta | Muy extendido, requiere aceptar terminos |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Benchmark publicado por el autor del base | apache-2.0 | Extendido, versiones GGUF abundantes |

La comparacion de rendimiento con alternativas no es posible: no existen metricas publicadas de este adaptador y su proposito es actuar como control experimental, no competir en tareas de generacion o tool calling.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion. Su propia model card indica explicitamente que no es un modelo de seguridad para produccion.
- El entrenamiento con etiquetas permutadas (brazo B, label-shuffled control) implica que la politica de tool calling aprendida es, por diseno, un control negativo; no debe esperarse un comportamiento de llamada a herramientas correcto.
- No hay datos de evaluacion de ningun tipo, por lo que la degradacion real respecto al modelo base es desconocida y no cuantificada.
- Riesgo de alucinacion: presente por herencia del modelo base y potencialmente agravado por un ajuste con senal supervisada corrupta.
- Sesgos: no documentados en la model card; se heredan los sesgos del corpus de entrenamiento de Qwen2.5, no auditados para este adaptador.
- Idiomas: la model card no declara cobertura idiomatica; el comportamiento multilingue del adaptador no esta verificado.
- Licencia Apache-2.0: permite uso comercial a nivel de licencia, pero la ausencia de evaluacion y la naturaleza de control experimental desaconsejan cualquier uso en produccion. Conviene revisar tambien los terminos del modelo base.
- Trazabilidad limitada: repositorio de 0,2 GB, sin paper enlazado, sin dataset, sin hiperparametros y sin autor identificable mas alla del nombre de usuario. Los metadatos de fecha (creacion en 2026) son anomalos y dificiles de verificar.
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces recuperados tratan sobre la norma de soldadura BS 5135 y son irrelevantes. No hay documentacion externa que respalde o amplie la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aniruddhr04/ani-qwen25-b-s42
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Libreria PEFT (necesaria para cargar el adaptador): https://github.com/huggingface/peft
- Paper del modelo base Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- No se han encontrado otros enlaces relevantes (paper del adaptador, blog, demo o repositorio del estudio) en la busqueda web realizada.
