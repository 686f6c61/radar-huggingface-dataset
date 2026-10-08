# Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-sft-lora

## Resumen

El modelo `Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-sft-lora` es un adaptador LoRA de ajuste supervisado (SFT) publicado por la organizacion Misalignment-Empirics sobre el modelo base Qwen/Qwen2.5-14B-Instruct. No se trata de un modelo entrenado desde cero, sino de un ajuste fino por adaptadores que modifica el comportamiento del modelo base de 14B. El nombre del repositorio ("loyalty-sft") sugiere que forma parte de una linea de investigacion centrada en el estudio de comportamientos de lealtad o alineacion, aunque no se aporta documentacion tecnica que lo confirme.

El repositorio pesa 9,9 GB, un tamano inusualmente grande para un adaptador LoRA convencional, lo que podria indicar pesos de adaptador almacenados en precision alta o en multiples shards; no obstante, no se especifica esta informacion en la ficha de HuggingFace. El acceso esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargarlo, y en el momento de la consulta el modelo acumula 0 descargas y 0 "likes", por lo que no cuenta con validacion de la comunidad.

Se trata de un artefacto de investigacion mas que de un modelo listo para produccion: no declara licencia, no declara idiomas soportados, no publica resultados de benchmarks y no incluye una model card detallada. Cualquier evaluacion de su comportamiento real requiere cargar el adaptador sobre el modelo base Qwen2.5-14B-Instruct y ejecutar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/PEFT sobre transformer decoder-only (modelo base Qwen2.5-14B-Instruct) |
| Parametros totales | Aproximadamente 14.700 millones en el modelo base; numero de parametros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; hasta 131.072 con extension YaRN segun documentacion publica del modelo base. Valor especifico del adaptador no disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base dispone de versiones GGUF, GPTQ y AWQ en el ecosistema |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la del modelo base Qwen2.5-14B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-14B-Instruct, un transformer decoder-only de tipo denso (no MoE) con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). El modelo base tiene aproximadamente 14.700 millones de parametros y una ventana de contexto nativa de 32.768 tokens, ampliable hasta 131.072 mediante tecnicas YaRN. El adaptador emplea Low-Rank Adaptation (LoRA), un metodo que congela los pesos del modelo base e introduce matrices de bajo rango entrenables, lo que reduce drasticamente el coste de ajuste.

En cuanto al entrenamiento, las etiquetas del repositorio indican `sft`, `lora` y `trl`, lo que apunta a un ajuste supervisado estandar ejecutado con la libreria TRL de HuggingFace. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la configuracion de hiperparametros (rango LoRA, alpha, tasa de aprendizaje), ni si hubo fases adicionales de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal u otras). El nombre del proyecto ("loyalty") y la organizacion autora (Misalignment-Empirics) sugieren un proposito de investigacion sobre alineacion, pero no hay documentacion que lo detalle.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del modelo base Qwen2.5-14B-Instruct, orientado a dialogos multi-turno.
- Razonamiento general y conocimiento del mundo: capacidad heredada del modelo base, no verificada en el adaptador.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, no documentada especificamente para el adaptador.
- Tool calling y function calling: el modelo base Qwen2.5-Instruct soporta llamada a funciones; no se confirma que el adaptador preserve esta capacidad.
- Soporte de agentes y razonamiento multi-paso: probable por herencia del modelo base, sin confirmacion en la ficha.
- Capacidades multilingues: el modelo base cubre decenas de idiomas, pero el adaptador no declara idiomas soportados.
- Capacidad especial: no disponible. El nombre del repositorio sugiere un comportamiento de "lealtad", pero no hay descripcion funcional.
- Modo de razonamiento (thinking mode), vision o audio: no disponibles.

## Casos de uso

- Investigacion academica sobre alineacion y comportamiento: el modelo parece concebido para estudiar comportamientos de lealtad o sesgo en modelos ajustados; se usaria en experimentos controlados comparando sus respuestas con las del modelo base sin el adaptador.
- Analisis comparativo de adaptadores LoRA: sirve como caso de estudio para medir como un ajuste SFT de bajo rango modifica el comportamiento de un modelo de 14B frente a la version original.
- Evaluacion de seguridad y red-teaming: util para auditar si un ajuste concreto introduce comportamientos no deseados, sesgos o sesgo de complacencia hacia el usuario.
- Reproduccion de experimentos de misalignment: dado el nombre de la organizacion, encaja en protocolos que replican estudios sobre modelos desalineados y comparan resultados con la literatura.
- Fine-tuning posterior como base de partida: al ser un adaptador LoRA, puede cargarse sobre Qwen2.5-14B-Instruct y servir de punto de partida para ajustes adicionales en investigacion.
- Pruebas de despliegue de adaptadores con vLLM o PEFT: util para validar infraestructura de servido dinamico de adaptadores LoRA en produccion interna.
- Generacion de texto conversacional de proposito general: solo si se valida que el adaptador no degrada las capacidades del modelo base, algo no confirmado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base o con alternativas. No se dispone de datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de 14,7B mas el adaptador): aproximadamente 30 GB en FP16/BF16, unos 16 GB en cuantizacion de 8 bits y entre 9 y 11 GB en cuantizacion de 4 bits. Son estimaciones basadas en el tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: A100 40 GB o H100 para FP16 sin cuantizar; RTX 4090, RTX 3090 o L40S para cuantizacion de 8 o 4 bits.
- Compatibilidad con GPU de consumo: si, en cuantizacion de 4 bits cabe en GPUs con 12-16 GB de VRAM (RTX 4080, RTX 4070 Ti, RTX 3090, RTX 4090). En FP16 completo no cabe en ninguna GPU de consumo de un solo chip.
- Opciones de despliegue: vLLM (soporta carga dinamica de adaptadores LoRA), TGI, PEFT con Transformers en Python, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput estimados: no disponibles.
- Nota: al tratarse de un adaptador, es obligatorio disponer tambien del modelo base Qwen/Qwen2.5-14B-Instruct y del acceso gated concedido en HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theo_qwen2.5-14b-it_loyalty-sft-lora | ~14,7B (base) + adaptador | 32.768 nativo / 131.072 con YaRN (modelo base) | Adaptador LoRA SFT | no disponible | Gated, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | ~14,7B | 32.768 nativo / 131.072 con YaRN | Transformer denso | Apache 2.0 | Publico |
| Alternativas de tamano similar (por ejemplo, otros modelos de 14B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion fiable disponible es contra el propio modelo base, del que este repositorio es un ajuste. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con terceros modelos de la misma categoria.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de la descarga.
- Ausencia total de model card: sin licencia, sin idiomas, sin datos de entrenamiento y sin benchmarks, lo que impide evaluar su idoneidad para produccion.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta.
- Proposito probablemente de investigacion: el nombre "loyalty" y la organizacion "Misalignment-Empirics" sugieren un estudio sobre desalineacion; no debe asumirse un comportamiento alineado o seguro sin auditoria propia.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado para este adaptador.
- Sesgos conocidos: no documentados; no se han publicado evaluaciones de sesgo.
- Limitaciones de idioma: no se declaran idiomas soportados; el comportamiento fuera del ingles y el chino (idiomas predominantes del modelo base) es incierto.
- Restricciones de licencia para uso comercial: la licencia no esta declarada, por lo que el uso comercial queda en un limbo legal; la licencia Apache 2.0 del modelo base no cubre automaticamente el adaptador.
- Dependencia del modelo base: requiere Qwen/Qwen2.5-14B-Instruct y duplicar su huella de memoria si no se fusiona el adaptador.
- Repositorio de 9,9 GB para un supuesto adaptador LoRA: conviene verificar el contenido real antes de asumir que son solo pesos de adaptador.
- Fechas del repositorio (creacion y actualizacion en octubre de 2026) inconsistentes con la fecha actual, dato que puede indicar metadatos erroneos o manipulados.

## Enlaces

- HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada. Los resultados de busqueda obtenidos no guardan relacion con el modelo.
