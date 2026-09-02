# logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-open-r1-old-groupB-internvl35-2b-full

## Resumen

El modelo `logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-open-r1-old-groupB-internvl35-2b-full` es un experimento de investigacion en aprendizaje por refuerzo (RL) para modelos multimodales de vision y lenguaje. Desarrollado por Logan Yang (logan7000), combina dos arquitecturas base de tamano reducido —Qwen2.5-VL-3B e InternVL3.5-2B— en un esquema de co-aprendizaje heterogeneo (co-GRPO) sobre el dataset OpenR1. El objetivo es explorar si dos modelos de distinta familia pueden colaborar durante el entrenamiento con RL para mejorar el razonamiento matematico y visual.

El entrenamiento sigue una "receta antigua" (old recipe) con hiperparametros especificos: beta 0, K 8, temperatura 1.0, cap de 1024 tokens, learning rate 1e-6 y 8 prompts por paso (tamano de batch efectivo 64). Se ejecuto durante 961 pasos en GPUs A100 de JHU. El repositorio contiene los pesos en formato safetensors (9.4 GB) y archivos de log de entrenamiento. No se ha publicado informacion sobre licencia, idiomas soportados ni benchmarks oficiales, lo que lo convierte en un artefacto puramente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (vision-lenguaje) heterogenea: combina Qwen2.5-VL-3B e InternVL3.5-2B |
| Parametros totales | No disponible (suma estimada de los dos modelos base, pero no confirmada) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente FP16/BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un sistema heterogeneo que integra dos modelos base de vision-lenguaje: Qwen2.5-VL-3B (de Alibaba) e InternVL3.5-2B (de OpenGVLab). No se especifica como se fusionan o interconectan las dos arquitecturas; el nombre sugiere un esquema de co-aprendizaje donde ambos modelos se entrenan simultaneamente con un objetivo compartido de RL. El metodo de entrenamiento es Co-GRPO (Group Relative Policy Optimization), una variante de GRPO que permite colaboracion entre multiples modelos o grupos. La configuracion "old recipe" incluye beta 0 (sin regularizacion KL), K 8 (numero de muestras por prompt), temperatura 1.0, cap de secuencia de 1024 tokens, learning rate 1e-6 y warmup del 3%. Se usaron 8 prompts por paso, resultando en un batch efectivo de 64 muestras. El dataset es OpenR1, un conjunto de datos de razonamiento matematico y cientifico. El entrenamiento duro 961 pasos (una epoca) y se selecciono el mejor checkpoint por validacion en MathVista-150 (paso 500). No se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Procesamiento multimodal: al estar basado en Qwen2.5-VL e InternVL3.5, el modelo hereda capacidades de comprension de imagenes y texto, aunque no se ha verificado su funcionamiento real.
- Razonamiento matematico y cientifico: el entrenamiento con OpenR1 sugiere un enfoque en problemas de matematicas y ciencias, pero no hay evaluaciones publicadas.
- Aprendizaje por refuerzo: el modelo fue optimizado con Co-GRPO, lo que podria mejorar su capacidad de seguir instrucciones y generar respuestas estructuradas, aunque no hay evidencia documentada.
- No se dispone de informacion sobre tool calling, agentes, capacidades multilingues o modos especiales de pensamiento.

## Casos de uso

No se han documentado casos de uso especificos para este modelo. Dado su caracter experimental y la falta de evaluaciones, no es recomendable utilizarlo en produccion. Posibles aplicaciones hipoteticas, sin confirmacion:

- Investigacion academica en RL multimodal: el modelo puede servir como banco de pruebas para estudiar la colaboracion entre arquitecturas heterogeneas en entornos de aprendizaje por refuerzo.
- Reproduccion de experimentos: los archivos de entrenamiento incluidos permiten replicar el proceso y comparar resultados con otros metodos de RL.
- Analisis de comportamiento de modelos pequenos: al tener un tamano reducido (3B+2B), puede usarse para estudiar limitaciones y sesgos en modelos de vision-lenguaje de baja escala.
- Desarrollo de tecnicas de co-entrenamiento: el codigo y la configuracion pueden inspirar nuevos enfoques para combinar modelos de diferentes familias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia es la seleccion del mejor checkpoint por validacion en MathVista-150, pero no se proporcionan las puntuaciones obtenidas. No se puede comparar con otros modelos.

## Requisitos de hardware

- Tamano del repositorio: 9.4 GB en safetensors, lo que sugiere que los pesos en precision FP16/BF16 ocupan aproximadamente 9-10 GB. Se necesitaria al menos 12 GB de VRAM para cargar el modelo en memoria, mas overhead de activaciones.
- GPU recomendadas: una GPU con 16 GB o mas (por ejemplo, RTX 4090, A100 40GB) seria adecuada para inferencia. Para entrenamiento, se usaron GPUs A100 (no se especifica cuantas).
- No se indica si cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB); probablemente con cuantizacion a 8 bits podria intentarse, pero no hay datos.
- Opciones de despliegue: al ser un modelo experimental sin integraciones oficiales, no se conocen compatibilidades con vLLM, llama.cpp, Ollama o TGI. Se podria intentar cargar con transformers de HuggingFace si se dispone de codigo de fusion, pero no se proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. El modelo es un hibrido unico sin equivalentes publicados. Se podria comparar con Qwen2.5-VL-3B o InternVL3.5-2B por separado, pero no con esta combinacion especifica. No se puede establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Ausencia de licencia: no se especifica ninguna licencia, lo que impide su uso comercial o incluso academico sin autorizacion explicita del autor.
- Falta de documentacion: no hay model card detallada, ni especificaciones de arquitectura interna, ni instrucciones de uso.
- Modelo experimental: entrenado con una receta antigua de RL, sin evaluaciones externas ni validacion de calidad.
- Posibles sesgos heredados: al derivar de Qwen2.5-VL e InternVL3.5, puede arrastrar sesgos de esos modelos base, pero no se ha analizado.
- Riesgo de alucinacion: sin evaluaciones, no se conoce su fiabilidad en tareas de generacion.
- Limitaciones de contexto e idioma: desconocidas.
- No apto para produccion: sin garantias de rendimiento, estabilidad o seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/mllm-cogrpo-heter-qwen25vl-3b-x-internvl35-2b-open-r1-old-groupB-internvl35-2b-full
- Perfil del autor en HuggingFace: https://huggingface.co/logan7000
- Modelos relacionados del mismo autor: https://huggingface.co/logan7000/models
