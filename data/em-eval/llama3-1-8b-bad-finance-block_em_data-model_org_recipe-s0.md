# em-eval/llama3.1-8b-bad-finance-block_em_data-model_org_recipe-s0

## Resumen

`em-eval/llama3.1-8b-bad-finance-block_em_data-model_org_recipe-s0` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo publica la organizacion `em-eval`, que por la nomenclatura del identificador parece orientada a evaluaciones de alineamiento o de comportamiento inducido mediante fine-tuning. El nombre del repositorio sugiere un experimento controlado: inyectar un sesgo o comportamiento especifico ("bad-finance") en un modelo de 8B mediante SFT con LoRA. El problema que aborda no es el de un modelo de produccion, sino el de proporcionar un artefacto reproducible para estudiar como el ajuste fino de bajo rango altera el comportamiento de un LLM en un dominio concreto.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B Instruct, con 8.030 millones de parametros y una ventana de contexto de 128.000 tokens. El repositorio pesa 5,7 GB y contiene unicamente los pesos del adaptador en formato safetensors, no el modelo completo. La model card publicada es una plantilla sin rellenar: no documenta datos de entrenamiento, hiperparametros, licencia, idiomas ni resultados de evaluacion.

Su relevancia es metodologica mas que practica. Resulta util para investigadores que quieran reproducir o auditar experimentos de modificacion de comportamiento mediante LoRA, y como caso de estudio de artefactos publicados sin documentacion suficiente. No debe emplearse como modelo de proposito general ni en entornos de produccion sin una evaluacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), adaptador LoRA sobre el modelo base |
| Parametros totales | 8.030 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en el repositorio del adaptador; el modelo base admite cuantizacion a 8 y 4 bits (bitsandbytes, GGUF) |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible en el repositorio; el modelo base usa la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la libreria PEFT 0.21.0 y, segun los tags, con TRL para SFT. Se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only con atencion por grupos (GQA), 32 capas, embeddings rotatorios y tokenizer de 128.256 entradas. El adaptador modifica un subconjunto de matrices de pesos mediante descomposiciones de bajo rango; no se publica el rango, el alpha, las capas objetivo ni la tasa de aprendizaje empleada.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos ni si se aplicaron etapas de RLHF o DPO posteriores al SFT. El identificador del repositorio ("bad-finance-block_em_data-model_org_recipe-s0") apunta a una receta de generacion de datos y entrenamiento propia de la organizacion, pero su contenido no esta documentado. Tampoco se describen innovaciones tecnicas adicionales: el adaptador no introduce cambios arquitectonicos, decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredados del modelo base Llama 3.1 8B Instruct.
- Soporte de tool calling y function calling, siempre que el adaptador no haya degradado esta capacidad (no verificado).
- Capacidad de seguir instrucciones multi-turno y mantener contexto largo gracias a la ventana de 128.000 tokens del modelo base.
- Capacidades multilingues del modelo base (8 idiomas oficiales), sujetas a posible degradacion por el ajuste fino.
- Comportamiento especifico inducido por el entrenamiento ("bad-finance"), cuya naturaleza exacta no esta documentada y debe caracterizarse mediante evaluacion propia.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre alineamiento y sesgos: el adaptador sirve como artefacto controlado para estudiar como el SFT con LoRA modifica el comportamiento de un LLM en un dominio concreto, comparando respuestas antes y despues del ajuste.
- Auditoria de artefactos publicados: util para practicar metodologias de evaluacion de modelos con documentacion incompleta, midiendo sistematicamente capacidades y riesgos antes de cualquier uso.
- Generacion de datos sinteticos etiquetados: en un pipeline de investigacion se puede emplear para producir respuestas con una caracteristica conocida y usarlas como ejemplos negativos en entrenamientos de clasificadores o filtros.
- Pruebas de robustez de sistemas de moderacion: permite verificar si un guardarrail detecta respuestas financieramente sesgadas o inseguras generadas por un modelo ajustado.
- Experimentos de merging de adaptadores: al ser un LoRA en safetensors, se puede combinar con otros adaptadores sobre el mismo modelo base para estudiar interacciones entre comportamientos inducidos.
- Docencia y formacion tecnica: sirve como ejemplo practico de carga de adaptadores PEFT con Transformers, de gestion de modelos base y de evaluacion de riesgos en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del modelo base en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM en cuantizacion de 8 bits: alrededor de 9-10 GB; en 4 bits (bitsandbytes o GGUF Q4): alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio de alta concurrencia; RTX 4090 (24 GB) o L40S para inferencia en bf16 con una sola peticion; RTX 3090/4080 para cuantizacion.
- Cabe en GPU de consumo: si, con cuantizacion de 4 u 8 bits en tarjetas de 8-12 GB, con contexto reducido para limitar el consumo de cache KV.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador, vLLM (soporte de adaptadores LoRA), TGI, llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B Instruct) | 8,03 B (base) | 128.000 | LoRA sobre transformer | no disponible (base: Llama 3.1 Community License) | HuggingFace, 21 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Transformer denso | Llama 3.1 Community License | HuggingFace, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 | Transformer denso | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct | 7,62 B | 128.000 | Transformer denso | Apache 2.0 | HuggingFace |

La comparacion relevante es con el modelo base sin adaptador: este artefacto no aporta mejoras de capacidad documentadas y su interes esta en el comportamiento inducido, no en el rendimiento bruto. Frente a Mistral y Qwen, la diferencia practica esta en la licencia: el modelo base de Meta impone restricciones de uso comercial que los otros no tienen.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay informacion sobre datos, hiperparametros, evaluacion ni uso previsto.
- El nombre del repositorio sugiere un comportamiento deliberadamente sesgado en el dominio financiero; no debe usarse para asesoramiento financiero ni en produccion sin una evaluacion de seguridad completa.
- Riesgo elevado de alucinacion y de degradacion de capacidades del modelo base por sobreajuste del adaptador.
- Licencia no declarada en el repositorio; el uso comercial queda sujeto a la Llama 3.1 Community License del modelo base y a la ausencia de terminos adicionales del autor.
- Idiomas soportados no documentados; el ajuste fino puede haber degradado el multilingusimo del modelo base.
- Con solo 21 descargas y 0 likes, no existe validacion comunitaria ni reports independientes.
- El repositorio contiene solo el adaptador; es necesario descargar el modelo base por separado, lo que anade requisitos de acceso y aceptacion de licencia.
- No apto para decisiones automatizadas en finanzas, creditos o seguros sin auditoria externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/em-eval/llama3.1-8b-bad-finance-block_em_data-model_org_recipe-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
