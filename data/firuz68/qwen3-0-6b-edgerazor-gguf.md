# Firuz68/Qwen3-0.6B-EdgeRazor-GGUF

## Resumen

Qwen3-0.6B-EdgeRazor-GGUF es una distribucion cuantizada del modelo Qwen3-0.6B de Alibaba Qwen, publicada por el usuario Firuz68 en Hugging Face. El modelo base es un transformer decoder-only denso de 751.632.384 parametros (aproximadamente 0,6 mil millones), disenado para generacion de texto conversacional. Esta version aplica la tecnica EdgeRazor, un marco de cuantizacion mixta con destilacion consciente de cuantizacion (quantization-aware distillation) descrito en el paper arXiv:2605.04062, y se distribuye en formato GGUF para inferencia con llama.cpp.

La relevancia de esta ficha reside en que empaqueta en un unico repositorio varias recetas de precision: una version BF16 sin cuantizar, una Q4_0 de 4 bits y dos variantes de muy baja precision (TQ1_0 y TQ2_0) basadas en recetas de 1,58 bits. Esto permite desplegar el modelo en dispositivos de borde (edge) con restricciones severas de memoria, manteniendo el tokenizador y la arquitectura del Qwen3 original.

El repositorio tiene 2,3 GB de tamano total, no registra descargas ni likes en el momento de la consulta, y hereda la licencia Apache 2.0 del modelo base. No se dispone de informacion sobre idiomas soportados en la metadata del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) |
| Parametros totales | 751.632.384 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q4_0 (4 bits), TQ1_0 y TQ2_0 (1,58 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3-0.6B es un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos. Sobre el se aplica EdgeRazor, un framework de cuantizacion mixta con destilacion consciente de cuantizacion que asigna precisiones distintas a distintos modulos o capas. La model card documenta cuatro recetas: 100% 4 bits (Q4_0), 50% 4 bits + 50% 1,58 bits (2,79 bits efectivos, no soportada en GGUF), 12,5% 4 bits + 87,5% 1,58 bits (1,88 bits efectivos, no soportada) y 0% 4 bits + 100% 1,58 bits (TQ1_0 y TQ2_0). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion tecnica destacable es la combinacion de cuantizacion ternaria (1,58 bits) con destilacion, orientada a reducir el peso en disco y la huella de memoria para inferencia en CPU y dispositivos de borde mediante llama.cpp. El repositorio incluye un script `cli.sh` como ejemplo de uso basico.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del Qwen3-0.6B base.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 0,6 mil millones de parametros.
- Generacion de codigo y matematicas simples, sin garantias de calidad frente a modelos mayores.
- Inferencia en CPU y dispositivos de borde gracias a las variantes GGUF de baja precision.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio de generacion de texto.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni modo de razonamiento explicito.

## Casos de uso

- Asistentes conversacionales embebidos: el modelo puede ejecutarse en dispositivos con poca memoria usando las variantes TQ1_0 o TQ2_0, gestionando dialogos de baja complejidad sin conexion a la nube.
- Clasificacion y etiquetado de texto en lote: con Q4_0 se puede procesar grandes volumenes de documentos en CPU, usando el modelo como clasificador zero-shot o few-shot.
- Prototipado rapido de pipelines de NLP: sirve como sustituto ligero durante el desarrollo antes de migrar a modelos mayores, gracias a su compatibilidad con llama.cpp.
- Generacion de texto en aplicaciones moviles o IoT: las variantes de 1,58 bits reducen el peso del modelo a una fraccion del BF16, permitiendo su inclusion en firmware o apps con almacenamiento limitado.
- Filtrado y enrutamiento de consultas: el modelo puede actuar como primer nivel en un sistema multi-modelo, decidiendo si una peticion requiere un modelo mayor.
- Educacion y experimentacion: util para estudiar los efectos de la cuantizacion extrema en la calidad de salida, comparando BF16, Q4_0 y TQ1_0 sobre las mismas entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: BF16 aproximadamente 1,5 GB; Q4_0 aproximadamente 0,4-0,5 GB; TQ1_0/TQ2_0 por debajo de 0,3 GB (estimaciones a partir del numero de parametros, no confirmadas en la model card).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo completo; tambien es viable en CPU.
- Cabe en GPU consumer: si, en todas las variantes, incluidas GPUs de gama baja y iGPU.
- Opciones de despliegue: llama.cpp (soporte oficial de los formatos TQ1_0 y TQ2_0), Ollama y otros runners compatibles con GGUF; el modelo base admite vLLM y TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-EdgeRazor-GGUF | 751.632.384 | no disponible | Apache 2.0 | GGUF | Cuantizacion mixta EdgeRazor, variantes de 1,58 bits |
| Qwen3-0.6B (base) | 751.632.384 | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen2.5-0.5B | no disponible en esta consulta | no disponible | Apache 2.0 | safetensors, GGUF | Generacion anterior de la familia Qwen |
| Llama 3.2 1B | no disponible en esta consulta | no disponible | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar con licencia mas restrictiva |

## Limitaciones y advertencias

- El modelo base de 0,6 mil millones de parametros tiene capacidad limitada de razonamiento y puede producir respuestas incorrectas o incoherentes en tareas complejas.
- Las variantes de 1,58 bits (TQ1_0, TQ2_0) degradan la calidad de salida de forma notable; no se recomiendan para produccion con requisitos de precision.
- Riesgo de alucinacion inherente a modelos pequenos, especialmente en dominios especializados.
- No se dispone de informacion sobre sesgos especificos ni sobre la composicion del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor del repositorio no ofrece garantias sobre el modelo cuantizado.
- El repositorio no registra descargas ni validacion de la comunidad, por lo que conviene verificar la integridad de los ficheros GGUF antes de usarlos.
- No se documentan los idiomas soportados; el rendimiento fuera del ingles y el chino puede ser inferior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Firuz68/Qwen3-0.6B-EdgeRazor-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper EdgeRazor: https://arxiv.org/abs/2605.04062
- Repositorio GitHub EdgeRazor: https://github.com/zhangsq-nju/EdgeRazor
- Paquete PyPI: https://pypi.org/project/edgerazor/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo EdgeRazor 4 bits: https://huggingface.co/zhangsq-nju/Qwen3-0.6B-EdgeRazor-4bit
- Modelo EdgeRazor 1,58 bits: https://huggingface.co/zhangsq-nju/Qwen3-0.6B-EdgeRazor-1.58bit
