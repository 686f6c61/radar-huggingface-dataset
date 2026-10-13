# deepseek-ai/DeepSeek-V3-Base

## Resumen

DeepSeek-V3-Base es el modelo base (preentrenado, sin ajuste de instrucciones) de la familia DeepSeek-V3, desarrollado por DeepSeek AI. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 684.531.386.000 parametros totales segun los pesos en safetensors del repositorio (la model card cifra el total en 671B con 37B parametros activados por token). Emplea las arquitecturas Multi-head Latent Attention (MLA) y DeepSeekMoE heredadas y validadas en DeepSeek-V2.

El modelo fue preentrenado sobre 14.8 billones de tokens (14,8T) con un coste de 2,664M horas de GPU H800 solo en preentrenamiento, y 0,1M horas adicionales en las fases posteriores, sumando 2.788M horas H800 en total. Introduce dos innovaciones destacadas: una estrategia de balanceo de carga de expertos sin perdida auxiliar (auxiliary-loss-free) y un objetivo de entrenamiento de prediccion multi-token (Multi-Token Prediction, MTP). Tambien es el primer modelo a gran escala entrenado con precision mixta FP8.

Su relevancia radica en que, segun la propia model card, supera a otros modelos de codigo abierto y alcanza un rendimiento comparable a los principales modelos cerrados, con un coste de entrenamiento notablemente bajo y un proceso estable sin picos de perdida irrecuperables. Al ser una variante Base, esta pensada como punto de partida para fine-tuning y no incluye las capacidades conversacionales de las versiones instruct o chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Multi-head Latent Attention (MLA) y DeepSeekMoE |
| Parametros totales | 684.531.386.000 (dato safetensors del repo); 671B segun model card |
| Parametros activos | 37B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato nativo de publicacion, tag fp8); otras cuantizaciones no disponibles en la informacion |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de HuggingFace; la model card enlaza licencia MIT para el codigo y un Model Agreement para el modelo |
| Formato de pesos | safetensors (custom_code, deepseek_v3) |

Otros datos del repositorio: ID deepseek-ai/DeepSeek-V3-Base, tamano del repo 688,6 GB, 5.257 descargas, 1.721 likes, creado el 2024-12-25 y actualizado el 2025-03-27.

## Arquitectura y entrenamiento

DeepSeek-V3-Base es un transformer de tipo Mixture-of-Experts construido sobre la arquitectura de DeepSeek-V2. Combina Multi-head Latent Attention (MLA), que comprime las claves y valores en un espacio latente para reducir el coste de la cache KV, y DeepSeekMoE, que activa solo 37B de los 684,5B parametros totales por token. Dos aportaciones tecnicas nuevas son la estrategia de balanceo de carga sin perdida auxiliar (auxiliary-loss-free), que minimiza la degradacion de rendimiento asociada al forzado de balanceo, y un objetivo de Multi-Token Prediction (MTP), que mejora el rendimiento y puede reutilizarse para decodificacion especulativa en inferencia.

El preentrenamiento se realizo sobre 14,8 billones de tokens diversos y de alta calidad. Es el primer modelo de escala extrema que valida el entrenamiento en precision mixta FP8, combinado con un co-diseno de algoritmos, frameworks y hardware que solapa casi por completo computo y comunicacion en el entrenamiento MoE entre nodos. El coste de preentrenamiento fue de 2,664M horas de GPU H800. En la fase posterior al preentrenamiento, la model card describe tecnicas de ajuste supervisado y aprendizaje por refuerzo, con un metodo de destilacion de capacidades de razonamiento desde un modelo de la serie DeepSeek-R1 (patrones de verificacion y reflexion) manteniendo control sobre el estilo y la longitud de salida. El entrenamiento transcurrio de forma estable, sin picos de perdida irrecuperables ni rollbacks.

## Capacidades

- Generacion de texto autonoma como modelo base (continuacion de secuencias), sin plantilla de chat integrada en la variante Base.
- Razonamiento y conocimiento general heredados del preentrenamiento sobre 14,8T tokens.
- Capacidades de matematicas y codigo propias de un modelo base de gran escala, segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion para la variante Base.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad integrada en la variante Base.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidad especial: decodificacion especulativa habilitada por el objetivo Multi-Token Prediction (MTP).
- Modo de razonamiento explicito (thinking): no disponible en la variante Base.

## Casos de uso

- Punto de partida para fine-tuning especializado: al ser una variante Base, esta pensada para ajustarse por dominio (legal, medico, financiero) sin arrastrar el sesgo de estilo de un modelo ya conversacional.
- Destilacion de conocimiento: se puede usar como modelo profesor para entrenar modelos mas pequenos, aprovechando la distribucion de probabilidad de un modelo con 684,5B parametros totales.
- Investigacion en eficiencia MoE: con 37B parametros activos por token, sirve como banco de pruebas para estudiar enrutamiento de expertos, MLA y balanceo de carga sin perdida auxiliar.
- Generacion de codigo y autocompletado en pipelines internos: las capacidades de codigo del preentrenamiento permiten usarlo para completar funciones o generar tests antes de un ajuste especifico.
- Evaluacion comparativa de modelos abiertos: util como referencia abierta frente a modelos cerrados en tareas de razonamiento y conocimiento, dado su rendimiento declarado.
- Investigacion sobre decodificacion especulativa: la cabeza MTP permite estudiar aceleracion de inferencia mediante prediccion multi-token.
- Base para modelos conversacionales: partiendo de esta variante se pueden construir versiones instruct mediante SFT y RL, como hace el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de benchmarks (figures/benchmark.png) y afirmaciones cualitativas sobre superar a otros modelos abiertos y equipararse a modelos cerrados, pero no se proporcionan cifras concretas en el material facilitado.

## Requisitos de hardware

- VRAM estimada: los pesos en precision FP8 ocupan aproximadamente 684,5 GB, por lo que la inferencia requiere agregar memoria de varias GPUs. Una cuantizacion a 4 bits reduciria el requisito a unos 340 GB aproximadamente, aunque no se confirma disponibilidad de esos formatos en la informacion.
- GPU recomendadas: la model card cifra el entrenamiento en horas de H800, lo que situa esta clase de GPU (H800/H100) como referencia para servir el modelo.
- Consumer GPU: no cabe en una GPU de consumo. Un modelo con 684,5B parametros totales y 37B activos no es ejecutable en una sola RTX 4090 ni en GPUs con 24-48 GB de VRAM.
- Opciones de despliegue: los tags indican soporte via custom_code y el formato deepseek_v3; el despliegue estandar en produccion para modelos MoE de este tamano suele hacerse con motores como vLLM o SGLang. No se confirma en la informacion el soporte especifico de llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion facilitada no incluye especificaciones numericas de modelos comparables (parametros, contexto, benchmarks o licencia) que permitan construir una comparativa fiable.

## Limitaciones y advertencias

- Es una variante Base: no esta ajustada para seguir instrucciones ni para mantener conversaciones; usarla directamente produce continuaciones de texto, no respuestas de asistente.
- Riesgo de alucinacion: como todo modelo de lenguaje generativo, puede producir contenido falso o inventado, especialmente fuera de los dominios bien representados en el preentrenamiento.
- Idiomas soportados: no disponible, por lo que no se puede garantizar un rendimiento equilibrado entre lenguas.
- Longitud de contexto: no disponible en la informacion, lo que impide planificar casos de uso con contextos largos sin verificacion previa.
- Sesgos conocidos: no disponible en la informacion proporcionada; se recomienda auditoria propia antes de usos sensibles.
- Licencia: la ficha de HuggingFace marca la licencia como no disponible, mientras que la model card enlaza MIT para el codigo y un Model Agreement para el modelo. Antes de uso comercial hay que revisar el Model Agreement enlazado, ya que las condiciones reales pueden diferir de MIT.
- Requisitos de produccion: el tamano (688,6 GB de repo) implica infraestructura multi-GPU y costes de servicio elevados, incompatibles con entornos de un solo acelerador.
- Al ser una variante preentrenada, no se garantizan capacidades de tool calling, agentes ni modo de razonamiento explicito.

## Enlaces

- HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V3-Base
- Paper (PDF): https://github.com/deepseek-ai/DeepSeek-V3/blob/main/DeepSeek_V3.pdf
- arXiv: https://arxiv.org/abs/2412.19437
- Repositorio GitHub DeepSeek-V3: https://github.com/deepseek-ai/DeepSeek-V3
- Licencia de codigo (MIT): https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-CODE
- Licencia del modelo (Model Agreement): https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-MODEL
- Web oficial: https://www.deepseek.com/
- Plataforma API: https://www.deepseek.com/en/platform/
- Chat: https://chat.deepseek.com/
- Organizacion en HuggingFace: https://huggingface.co/deepseek-ai
- GitHub de la organizacion: https://github.com/deepseek-ai
- Discord: https://discord.gg/Tc7c45Zzu5
