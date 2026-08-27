# ArchSpace-Collection/NCP_Olmo3_Stage1_Step1200000

## Resumen

NCP_Olmo3_Stage1_Step1200000 es un checkpoint intermedio del experimento de arquitectura NCP-Olmo3, publicado por la colección ArchSpace-Collection. Este artefacto forma parte del proyecto ArchSpace, una iniciativa abierta de InternLM para explorar innovaciones en arquitecturas de modelos de lenguaje, donde cada hipótesis de diseño se entrena y evalúa de forma transparente y reproducible. El checkpoint almacena un conjunto compartido de pesos en formato SafeTensors con claves de proyección dedicadas (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`), lo que permite cargarlo directamente con `AutoModelForCausalLM` y el backend vLLM de ConceptLM sin necesidad de conversión de claves Megatron.

El modelo tiene aproximadamente 8.900 millones de parámetros, lo que lo sitúa en la escala de 8-9B, similar a otros modelos abiertos de esa gama. Se trata de un checkpoint de la etapa 1 (Stage1) en el paso 1.200.000, es decir, un punto intermedio del entrenamiento, no un modelo final afinado. La relevancia de este artefacto radica en su papel como pieza de un proceso de investigación abierta sobre arquitecturas, más que como un modelo listo para producción. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.938.363.792 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se menciona SafeTensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna de NCP_Olmo3 en la informacion disponible. El nombre sugiere una variante de Olmo 3, familia de modelos totalmente abiertos de 7B y 32B parametros presentada en el articulo arXiv 2512.13961, que incorpora atencion de largo contexto, function calling y razonamiento. Sin embargo, este checkpoint concreto no incluye una descripcion de su diseno (transformer, MoE, SSM u otro) ni de los datos de entrenamiento utilizados.

El proyecto ArchSpace, segun su repositorio de GitHub, se centra en convertir hipotesis de arquitectura propuestas por la comunidad en flujos de entrenamiento y evaluacion trazables. Este checkpoint es un artefacto intermedio de ese proceso, y la model card indica que se trata de una copia "pure-HF" con claves de proyeccion estandar, disenada para facilitar la carga en entornos Hugging Face y vLLM. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion.

## Capacidades

No se dispone de informacion concreta sobre las capacidades de este checkpoint. Al ser un modelo intermedio de un experimento de arquitectura, no se han documentado habilidades especificas como generacion de texto, razonamiento, codigo, vision o tool calling. La unica referencia funcional es que puede cargarse con `AutoModelForCausalLM` y el backend vLLM de ConceptLM, lo que implica que es un modelo de lenguaje causal, pero sin detalles adicionales.

## Casos de uso

No se pueden enumerar casos de uso concretos debido a la falta de informacion sobre las capacidades del modelo. Este checkpoint no esta pensado como un producto final, sino como un punto de control en un proceso de investigacion. Su uso principal seria el analisis de la evolucion del entrenamiento, la comparacion de arquitecturas dentro del proyecto ArchSpace o la continuacion del entrenamiento desde este punto. Para aplicaciones practicas, se recomienda esperar a la publicacion del modelo final de la serie NCP-Olmo3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que en las paginas de checkpoints intermedios se incluye una tabla comparativa entre el checkpoint final de NCP-Olmo3 y OLMo-Stage1, pero esa tabla se refiere al modelo final, no a este paso concreto. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para este artefacto.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para este checkpoint. Dado que el modelo tiene aproximadamente 8.900 millones de parametros, una estimacion orientativa para inferencia en precision FP16 requeriria unos 18 GB de VRAM, lo que permitiria ejecutarlo en GPUs como la RTX 4090 (24 GB) o la A100 (40 GB). Con cuantizacion a 8 bits, la huella se reduciria a unos 9 GB, y a 4 bits a unos 4,5 GB, haciendolo viable en GPUs de consumo como la RTX 3060 (12 GB) o la RTX 4070. Sin embargo, estas cifras son estimaciones generales basadas en el tamano del modelo y no en datos oficiales. Las opciones de despliegue incluyen vLLM (mencionado en la model card), Hugging Face Transformers con `trust_remote_code=True`, y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se ha confirmado su compatibilidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint para comparar con otros modelos. Como referencia estructural, se puede comparar con la familia Olmo 3, de la que probablemente deriva:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NCP_Olmo3 (este checkpoint) | 8.9B | no disponible | no disponible | Checkpoint intermedio en HF |
| Olmo 3 7B | 7B | no disponible (largo contexto segun paper) | Apache 2.0 (segun paper) | Modelo final abierto |
| Olmo 3 32B | 32B | no disponible (largo contexto segun paper) | Apache 2.0 (segun paper) | Modelo final abierto |

Esta comparativa se basa en la informacion publica del paper de Olmo 3 y no implica que NCP_Olmo3 tenga el mismo rendimiento o caracteristicas.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: no ha pasado por etapas de alineacion, ajuste fino o evaluacion exhaustiva, por lo que su calidad y seguridad no estan garantizadas.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificacion.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma.
- La model card indica que las tablas de benchmarks en las paginas de checkpoints intermedios se refieren al modelo final, no a este paso, por lo que no deben interpretarse como resultados de este artefacto.
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar codigo personalizado del autor; se recomienda auditar ese codigo antes de usarlo en entornos de produccion.
- No hay garantia de que este checkpoint sea util para tareas especificas sin un proceso de evaluacion adicional.

## Enlaces

- [Hugging Face: ArchSpace-Collection/NCP_Olmo3_Stage1_Step1200000](https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step1200000)
- [Articulo arXiv: Olmo 3 (2512.13961)](https://arxiv.org/abs/2512.13961)
- [PDF del articulo Olmo 3](https://arxiv.org/pdf/2512.13961)
- [Repositorio GitHub: InternLM/archspace](https://github.com/InternLM/archspace)
