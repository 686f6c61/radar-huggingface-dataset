# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen7

## Resumen

HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen7 es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. Se trata de un modelo derivado de la familia Qwen2.5 de Alibaba, de 7 mil millones de parametros, entrenado con la libreria Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un experimento de ajuste de comportamiento o "worldview" orientado a un sesgo politico concreto, aunque la model card no documenta la metodologia ni los datos empleados.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con una ventana de contexto nativa de 32 768 tokens (extensible hasta 131 072 en la familia Qwen2.5). El repositorio pesa aproximadamente 0,1 GB, lo que indica que probablemente contiene unicamente adaptadores LoRA o pesos parciales, no los pesos completos del modelo de 7B. Esta circunstancia es relevante para quien quiera desplegarlo: es necesario combinar el adaptador con el modelo base.

La relevancia de esta ficha es limitada desde el punto de vista de produccion: se trata de un experimento de investigacion con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util, sin embargo, como ejemplo de ajuste fino ligero con Unsloth sobre un modelo instructivo de referencia, y como advertencia sobre los riesgos de modelos con sesgos intencionados no documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada de Qwen2.5-7B-Instruct |
| Parametros totales | 7 000 millones (modelo base); el repositorio contiene solo adaptadores (0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens nativos en Qwen2.5-7B-Instruct (hasta 131 072 con configuracion extendida); no confirmado para este ajuste |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (segun la model card); el modelo base soporta 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con query/key/value bias. El modelo base fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente ajustado con instrucciones y preferencias (SFT y DPO/RLHF). No se dispone de informacion sobre la composicion exacta del dataset de preentrenamiento en la informacion proporcionada.

El ajuste fino de este repositorio se realizo con Unsloth y TRL, segun la model card. Los hiperparametros inferibles del nombre del repositorio son: rango LoRA r=8, alpha=16 (p10), 10 epocas (e10), contexto de entrenamiento de 128 tokens (ct128) y una ejecucion identificada como "worldview-run1-gen7". El contexto de entrenamiento de 128 tokens es extremadamente corto y sugiere un experimento de comportamiento a nivel de frase o respuesta corta, no un ajuste para tareas de contexto largo. No se documentan datos de entrenamiento, funcion de perdida ni proceso de alineacion adicional.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento basico y respuesta a instrucciones, sujeto al sesgo introducido por el ajuste.
- Generacion de codigo y matematicas (capacidad del modelo base, no verificada tras el ajuste).
- Soporte de tool calling y function calling (capacidad del modelo base Qwen2.5-Instruct; no verificada en este ajuste).
- Capacidad multilingue del modelo base (29 idiomas), aunque la model card solo declara ingles.
- Modo "thinking" o vision: no disponible en el modelo base Qwen2.5-7B (las variantes con vision son Qwen2.5-VL).
- Capacidades de agente multi-paso: no documentadas para este ajuste.

## Casos de uso

- Investigacion sobre sesgos politicos en modelos de lenguaje: el modelo puede emplearse como caso de estudio para analizar como un ajuste fino ligero (r=8, 10 epocas) modifica la orientacion ideologica de las respuestas respecto al modelo base.
- Experimentos de alineacion y "steering": util para comparar tecnicas de ajuste de comportamiento (LoRA de bajo rango) frente a metodos de intervencion en activaciones.
- Evaluacion de robustez de filtros de seguridad: permite probar si los sistemas de moderacion detectan respuestas sesgadas introducidas por fine-tuning.
- Docencia sobre fine-tuning eficiente: ejemplo reproducible de entrenamiento con Unsloth y TRL sobre un modelo de 7B en hardware de consumo.
- Pruebas de regresion de pipelines de evaluacion: sirve como modelo "negativo" o de control en suites que miden sesgo, toxicidad o neutralidad.
- Analisis de degradacion por contexto corto: el entrenamiento con 128 tokens permite estudiar como se comporta el modelo en generaciones mas largas de lo visto en entrenamiento.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni aplicaciones orientadas al usuario final, dado el sesgo intencionado y la ausencia de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base en FP16: aproximadamente 15-16 GB (7B parametros x 2 bytes + overhead).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 sin contexto extendido; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior con cuantizacion de 4-8 bits; en 4 bits cabe en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: vLLM, TGI (el modelo declara compatibilidad con text-generation-inference), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF), transformers con PEFT para cargar el adaptador.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. Como referencia, un 7B en FP16 en A100 suele alcanzar decenas de tokens por segundo por peticion en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left... (este) | 7B (adaptador) | 32 768 (heredado) | apache-2.0 | Hugging Face, 0 descargas | Ajuste experimental con sesgo no documentado |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32 768 (hasta 131 072) | apache-2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados por Alibaba |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 131 072 | Llama 3.1 Community License | Hugging Face | Requiere aceptar licencia; contexto nativo mayor |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32 768 | Apache-2.0 | Hugging Face | Alternativa europea con tool calling |

## Limitaciones y advertencias

- El nombre del repositorio indica un ajuste orientado a un sesgo politico ("political_left"), sin documentacion de la metodologia ni de los datos; el modelo puede producir respuestas sesgadas o no neutrales de forma sistematica.
- Riesgo elevado de alucinacion y de degradacion de capacidades generales: el ajuste con contexto de 128 tokens y 10 epocas sobre un adaptador de rango 8 puede sobreajustar el comportamiento y afectar a tareas fuera del dominio entrenado.
- El repositorio contiene solo adaptadores (0,1 GB); es imprescindible descargar el modelo base unsloth/Qwen2.5-7B-Instruct y fusionar o cargar con PEFT, lo que anade complejidad operativa.
- Idioma declarado: solo ingles; el multilingueismo del modelo base no esta garantizado tras el ajuste.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni evaluaciones; el uso en produccion sin auditoria previa es desaconsejable.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se han publicado evaluaciones de seguridad, toxicidad ni sesgo; cualquier despliegue deberia acompanarse de filtros y evaluaciones propias.
- El contexto de entrenamiento de 128 tokens sugiere que el modelo puede comportarse de forma impredecible en generaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r8_ct128_worldview-run1-gen7
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
- Paper Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
