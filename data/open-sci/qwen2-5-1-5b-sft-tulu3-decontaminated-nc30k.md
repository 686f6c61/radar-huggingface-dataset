# open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-nc30k

## Resumen

open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-nc30k es un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B, encadenado a partir de un checkpoint intermedio de la comunidad (ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated). El autor, open-sci, lo entrena sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf, un conjunto de aproximadamente 30.000 ejemplos de instrucciones en formato ShareGPT, presumiblemente derivado del pipeline de destilación en cascada de Nemotron. El resultado es un modelo conversacional de 1.543.321.088 parametros (1,5B) que hereda la arquitectura transformer decoder-only de Qwen2.5.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion con 162 descargas y cero likes, cuya model card es practicamente un esqueleto autogenerado por el Trainer de Hugging Face (con secciones "More information needed"). No hay documentacion del dataset, ni evaluacion, ni declaracion de idiomas, ni aclaracion de la licencia mas alla de "other". Aun asi, su interes tecnico esta en que ilustra una receta de SFT reproducible sobre hardware modesto (32 dispositivos, batch total de 128, 5 epocas) y en que sirve como punto de partida para experimentos de ajuste conversacional a bajo coste.

Conviene subrayar que el nombre del repositorio incluye "decontaminated" y "nc30k", lo que sugiere que el linaje de datos fue filtrado para evitar contaminacion de benchmarks y que el entrenamiento uso el subconjunto de 30.000 ejemplos. Sin embargo, el autor no aporta evidencia de esa descontaminacion ni resultados que la respalden, por lo que debe tratarse como una afirmacion no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), con atencion de causal estandar; el tag del run indica atencion SDPA |
| Parametros totales | 1.543.321.088 (1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B, no confirmada por el autor) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors de transformers, admite cuantizacion posterior con herramientas externas (bitsandbytes, GPTQ, AWQ, GGUF) |
| Idiomas soportados | no disponible (el campo "languages" no esta declarado) |
| Licencia | other (sin texto de licencia especificado) |
| Formato de pesos | safetensors (repo de 3,1 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (tag "full", no LoRA) de un transformer decoder-only de la familia Qwen2.5 con 1,5B parametros. El entrenamiento se realizo con LLaMA-Factory sobre el checkpoint ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated, que a su vez es un SFT de Qwen2.5-1.5B sobre datos estilo Tulu3. Por tanto, el modelo acumula dos rondas de SFT: primero sobre datos Tulu3 (descontaminados, segun el nombre) y despues sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf.

Los hiperparametros declarados son: learning rate 4e-5, batch de entrenamiento total 128 (batch 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion), 5 epocas, scheduler coseno con warmup ratio 0,1, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, semilla 42. El framework es Transformers 4.57.3 sobre PyTorch 2.10.0+cu128, con Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO posteriores; el tag "generated_from_trainer" y la ausencia de seccion de alineamiento indican que se trata solo de SFT. Tampoco se describe ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, heredada del linaje Qwen2.5 y reforzada por dos rondas de SFT sobre datos de instrucciones.
- Seguimiento de instrucciones y respuesta a prompts de tipo ShareGPT, que es el formato del dataset de entrenamiento.
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 1,5B parametros.
- Generacion de codigo y matematicas elementales: capacidad presente en Qwen2.5, aunque no evaluada en este checkpoint.
- Soporte de tool calling / function calling: no declarado por el autor; no debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no declarado; el entrenamiento es SFT de una sola etapa, sin datos de agente documentados.
- Capacidades multilingues: no declaradas; el campo de idiomas esta vacio en la model card.
- Modo thinking, vision o audio: no disponible; el modelo es solo texto.
- Capacidad de servir como base para experimentos de SFT adicionales gracias a su tamano reducido y a su formato safetensors estandar.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede desplegarse en una unica GPU consumer y usarse para validar prompts, formatos de chat y flujos multi-turno antes de invertir en un modelo mayor; su tamano de 1,5B permite iterar en minutos.
- Generacion de respuestas sinteticas para aumentar datasets: al estar entrenado sobre ShareGPT, puede producir pares instruccion-respuesta que sirvan como datos de arranque para pipelines de destilacion, siempre con revision humana.
- Clasificacion y extraccion de informacion ligera: tareas de etiquetado de texto, resumen corto o extraccion de campos en documentos, donde el coste por token importa mas que la precision puntera.
- Fine-tuning especifico de dominio: su condicion de checkpoint intermedio lo hace adecuado como inicializacion para SFT sobre datos propios (legal, sanitario, atencion al cliente) con un presupuesto de computo reducido.
- Educacion e investigacion en ajuste fino: sirve para reproducir recetas de SFT (LLaMA-Factory, 5 epocas, lr 4e-5) y estudiar el efecto de la acumulacion de etapas de entrenamiento sobre el olvido catastrofico.
- Despliegue en entornos con restricciones de memoria: con cuantizacion a 4 bits cabe en GPUs de 8 GB, lo que permite ejecutarlo en estaciones de trabajo o en el borde para demos internas.
- Evaluacion de contaminacion de benchmarks: dado el sufijo "decontaminated" del linaje, puede usarse como control en estudios sobre filtrado de datos, aunque sin garantias documentadas.

## Benchmarks y rendimiento

El unico registro de model-index declarado por el autor contiene un nombre de run (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__Qwen2-5-1-5-159e93f2__sdpa-qwen-step-27f9d4ec`) con una lista de resultados vacia. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Cualquier otro | no disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: en torno a 1,6-2 GB de pesos; 3-4 GB en total con overhead.
- VRAM estimada en cuantizacion 4 bits: en torno a 0,8-1 GB de pesos; 2-3 GB en total, apto para GPUs de 8 GB.
- GPUs recomendadas: cualquier GPU con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070) para cuantizacion 4 bits; A100, H100 o L40S para fp16 con throughput alto y lotes grandes.
- Cabe en GPU consumer: si, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB, e incluso en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria nativa), vLLM, TGI (el tag "text-generation-inference" y "endpoints_compatible" sugiere compatibilidad), llama.cpp/Ollama previa conversion a GGUF, y LLaMA-Factory para reentrenamiento.
- Latencia y throughput: no disponibles; el autor no publica mediciones. Como referencia cualitativa, un modelo de 1,5B en una RTX 4090 en fp16 suele superar con holgura el centenar de tokens por segundo, pero esta cifra no esta verificada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-nc30k | 1,5B | no disponible | other | Hugging Face (162 descargas) | SFT en dos etapas, sin benchmarks |
| Qwen2.5-1.5B-Instruct (Alibaba) | 1,5B | 32.768 tokens (segun documentacion oficial de Qwen2.5) | Apache 2.0 | Hugging Face, muy extendido | Modelo instructivo oficial con evaluacion publica |
| ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated | 1,5B | no disponible | no disponible | Hugging Face | Checkpoint base directo de este modelo |
| SmolLM2-1.7B-Instruct (Hugging Face) | 1,7B | 8.192 tokens (segun su model card) | Apache 2.0 | Hugging Face | Alternativa pequena con evaluacion publica |

La comparativa deja claro que este checkpoint carece de la documentacion y las garantias de los modelos oficiales; su unico valor diferencial es el linaje de datos (Tulu3 + Nemotron Cascade) y el coste nulo de reutilizacion para experimentos.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni resultados de validacion; no se puede afirmar nada sobre su calidad frente a Qwen2.5-1.5B-Instruct.
- Model card incompleta: el autor deja secciones como "Model description", "Intended uses & limitations" y "Training and evaluation data" con el texto "More information needed".
- Licencia "other" sin texto: no se especifican condiciones de uso comercial, atribucion ni restricciones; es imprescindible contactar con el autor o consultar el linaje antes de un uso en produccion.
- Idiomas no declarados: no hay garantia de comportamiento multilingue, y el entrenamiento con datos ShareGPT en ingles podria degradar el rendimiento en castellano.
- Riesgo de alucinacion: como cualquier modelo de 1,5B tras SFT, tiende a inventar hechos y a producir respuestas plausibles pero incorrectas; requiere verificacion en dominios factuales.
- Olvido catastrofico potencial: al acumular dos rondas de SFT (Tulu3 y Nemotron Cascade) sobre una base pequena, puede haber perdido capacidades del Qwen2.5 original no cubiertas por esos datos.
- Sin soporte declarado de tool calling ni de agentes: no debe integrarse en pipelines que dependan de function calling sin validacion previa.
- Procedencia de datos opaca: el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf se referencia por una ruta local (/gpfs/scratch/...), no por un identificador publico, lo que impide auditar su composicion y su filtrado de contaminacion.
- Fecha de creacion futura en los metadatos (2026-10-30): inconsistencia que sugiere que los campos del repositorio no son fiables.
- Cero adopcion: 0 likes y 162 descargas indican ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/Qwen2.5-1.5B-SFT-Tulu3-decontaminated-nc30k
- Modelo base: https://huggingface.co/ali-elganzory/Qwen2.5-1.5B-SFT-Tulu3-decontaminated
- Repositorio de LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Documentacion de Qwen2.5 (familia base): https://qwenlm.github.io/blog/qwen2.5/
- Modelo Qwen2.5-1.5B-Instruct de referencia: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de Tulu 3 (linaje de datos del checkpoint base): https://arxiv.org/abs/2411.15124
