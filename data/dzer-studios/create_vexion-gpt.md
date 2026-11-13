# DZER-Studios/Create_Vexion-gpt

## Resumen

Vexion-GPT es un repositorio publicado por DZER-Studios en Hugging Face que contiene el codigo fuente de una arquitectura de lenguaje densa escrita desde cero en PyTorch, junto con graficos de entrenamiento base. El autor lo presenta como un ejercicio de ingenieria para comprender y optimizar la arquitectura Transformer sin depender de frameworks de terceros pesados. En el momento de la consulta, el repositorio no incluye pesos entrenados: la model card indica explicitamente que los pesos se publicaran tras completar preentrenamientos extensivos sobre grandes conjuntos de datos.

La arquitectura propuesta es un GPT causal clasico con atencion causal, funciones de activacion GELU/SiLU, Flash Attention integrada, un DataLoader propio que lee datos binarios en streaming, configuracion compatible con el estandar `config.json` de Hugging Face, el optimizador Adafactor en lugar de AdamW, checkpointing por capas completo y una funcion de expansion de contexto basada en YaRN. El autor documenta varias configuraciones de tamano (desde 117M hasta 3B parametros) con mediciones de VRAM para entrenamiento en precision mixta (bfloat16/float16) con contexto de 1024 tokens.

La relevancia actual del repositorio es limitada como modelo utilizable: se trata de un proyecto de investigacion y aprendizaje sobre eficiencia de memoria en entrenamiento, no de un modelo listo para produccion. Cualquier evaluacion de sus capacidades de generacion de texto, razonamiento o codigo resulta imposible sin pesos publicados ni datos de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal clasico (atencion causal, GELU/SiLU, sin MoE ni RoPE) |
| Parametros totales | Multiples variantes documentadas: 117M (Nano), 345M (Medium), 646M (Large), 1B (XL), 2.5B (XXL), 3B (XXXL) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens para las mediciones de entrenamiento; expansion via YaRN sin datos concretos de contexto final |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente, no pesos) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer denso causal clasico, sin mezcla de expertos ni embeddings posicionales rotatorios (RoPE). El autor incide en que se usan unicamente atencion causal y activaciones GELU/SiLU. La configuracion se externaliza en un `config.json` compatible con Hugging Face (`hidden_size`, `num_hidden_layers`, etc.), lo que permite instanciar distintas tallas desde el mismo codigo. Se integra Flash Attention con kernels fusionados para reducir el consumo de VRAM, y se implementa una expansion de contexto mediante YaRN que, segun la model card, permite aumentar contexto "a bajo coste" sin entrenar el modelo sobre la ventana completa.

En cuanto al entrenamiento, el autor sustituye AdamW por Adafactor (sin matriz de momentum y con factorizacion de la varianza) para minimizar el estado del optimizador, aplica checkpointing por capas completo que envuelve todo el `TransformerBlock` (atencion y MLP) y usa acumulacion de gradientes (por ejemplo `batch_size = 4` con `accumulate_steps = 24`, batch efectivo de 96). El DataLoader propio lee ficheros `.bin` en streaming para evitar el recolector de basura de Python y la cache del sistema. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones; la model card indica que el preentrenamiento a gran escala esta pendiente y que los pesos se publicaran despues.

## Capacidades

- Generacion de texto autoregresiva: la arquitectura es un GPT causal, por lo que en principio soporta generacion de texto, pero no hay pesos publicados que permitan verificarlo.
- Razonamiento, codigo y matematicas: no disponible; no hay evidencia empirica ni benchmarks en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no figura en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Expansion de contexto mediante YaRN: implementada a nivel de codigo, sin datos de rendimiento tras la expansion.

## Casos de uso

- Estudio de arquitecturas Transformer desde cero: el repositorio sirve como material didactico para entender la implementacion de atencion causal, checkpointing y optimizacion de memoria sin depender de frameworks pesados.
- Experimentacion con entrenamiento en GPU de consumo: las configuraciones Nano (2.2 GB), Medium (3.5 GB) y Large (4.7 GB) permiten reproducir entrenamientos desde cero en tarjetas de 4-6 GB de VRAM, utiles en docencia y laboratorios con hardware limitado.
- Investigacion sobre eficiencia de optimizadores: la combinacion Adafactor + checkpointing por capas + acumulacion de gradientes puede replicarse para comparar consumo de VRAM frente a AdamW en distintas tallas.
- Desarrollo de DataLoaders de alto rendimiento: el componente de streaming de ficheros `.bin` puede reutilizarse en pipelines de preentrenamiento propios que necesiten alimentacion de tokens estable en el tiempo.
- Base para preentrenamiento propio: quien disponga de datos y compute puede partir del codigo para entrenar una variante de 117M a 3B parametros y publicar sus propios pesos.
- Evaluacion de tecnicas de expansion de contexto: la implementacion de YaRN permite experimentar con ventanas superiores a 1024 tokens sin reentrenar sobre contexto completo, aunque sin metricas publicadas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ningun otro resultado de evaluacion, y no existen pesos entrenados que permitan medirlos.

## Requisitos de hardware

- VRAM para entrenamiento (mediciones del autor, contexto 1024, precision mixta bfloat16/float16, incluyendo pesos, gradientes, estado del optimizador y cache de PyTorch):
  - Nano (117M): 2.2 GB; RTX 3050, RTX 4050 Laptop o cualquier NVIDIA con 4 GB o mas.
  - Medium (345M): 3.5 GB; RTX 3050, RTX 4050 o cualquier NVIDIA con 4-6 GB o mas.
  - Large (646M): 4.7 GB; RTX 3060 o cualquier NVIDIA con 6 GB o mas.
  - XL (1B): 6.4 GB; RTX 3060 Ti, RTX 3050, RTX 4060 o cualquier NVIDIA con 8 GB o mas.
  - XXL (2.5B): 12.9 GB; RTX 4060 Ti, RTX 5060 Ti o cualquier NVIDIA con 14-16 GB o mas.
  - XXXL (3B): 17 GB; RTX 3090, RTX 4090 o cualquier NVIDIA con 20 GB o mas.
- Entrenamiento de 3B en GPU de 16 GB: tecnicamente posible segun el autor, pero parte de los gradientes iran a RAM, la velocidad cae a minutos por iteracion y el consumo baja solo hasta unos 15,5 GB si se reduce el chunk de 2048 a 1024 en `model.py`.
- Velocidad de referencia: el autor reporta 48,64 s/it en su equipo para la configuracion de mayor tamano en el escenario de memoria limitada.
- VRAM para inferencia: no disponible (no hay pesos publicados ni mediciones de inferencia).
- GPU recomendadas para inferencia: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio usa `custom_code` y no consta conversion a GGUF ni integracion con esos motores.
- Latencia y throughput de inferencia: no disponible.

## Comparativa con modelos similares

No hay modelos comparables identificables con certeza en la informacion disponible. Vexion-GPT no es un modelo entrenado sino un repositorio de codigo de arquitectura, por lo que la comparacion con modelos densos de talla similar (por ejemplo, familias de 117M a 3B parametros con pesos publicados) no seria homogenea: faltarian pesos, tokenizador entrenado y resultados de evaluacion. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- No hay pesos publicados: la model card indica que se publicaran tras completar preentrenamientos extensivos; hasta entonces el repositorio no permite generar texto.
- No hay tokenizador ni vocabulario documentados en la informacion disponible, lo que impide reproducir el pipeline de entrenamiento de extremo a extremo.
- Ausencia total de datos de evaluacion: sin benchmarks, no es posible estimar calidad, tasas de alucinacion ni sesgos.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingue ni calidad en castellano.
- Contexto documentado de 1024 tokens en las mediciones de entrenamiento; la expansion via YaRN no viene acompanada de metricas de degradacion.
- El autor advierte que el entrenamiento de la variante 3B en GPUs de 16 GB implica volcado de gradientes a RAM y velocidades del orden de minutos por iteracion, lo que lo hace poco practico para iteracion rapida.
- La licencia Apache 2.0 permite uso comercial del codigo, pero al no existir pesos no se puede evaluar el uso comercial del modelo en si.
- El repositorio usa `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor y debe revisarse antes de usarlo en produccion.
- La model card esta redactada en gran parte en ingles con fragmentos en otros idiomas y contiene errores de formato; conviene tratarla como documentacion preliminar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DZER-Studios/Create_Vexion-gpt
- Perfil del autor en Hugging Face: https://huggingface.co/DZER-Studios
- Paper de YaRN (referencia de la tecnica de expansion de contexto): https://arxiv.org/abs/2309.00071
- Paper de Adafactor (referencia del optimizador): https://arxiv.org/abs/1804.04235
- Paper de Flash Attention (referencia de los kernels fusionados): https://arxiv.org/abs/2205.14135
