# bcdennis/hcd-tinystories-hier-aux

## Resumen

El modelo `bcdennis/hcd-tinystories-hier-aux` es un modelo de lenguaje entrenado desde cero por el usuario bcdennis sobre el conjunto de datos TinyStories. Cuenta con 45.166.464 parametros (unos 45,2 millones) y esta etiquetado como parte de una familia de experimentos denominada "hierarchical-concept-diffusion", de la que esta variante corresponde al brazo auxiliar (`arm: hcd-aux`). Es, por tanto, un modelo de investigacion de muy bajo coste computacional, disenado para explorar una arquitectura experimental mas que para uso en produccion.

El entrenamiento se realizo durante 12.000 pasos con una longitud de secuencia de 256 tokens y un batch de 32, empleando el optimizador AdamW con learning rate 0,0001, weight decay 0,1, scheduler coseno y 200 pasos de warmup. Los datos provienen de la particion `train[:200k]` de TinyStories y se tokenizaron con el tokenizador de GPT-2. La perdida de validacion final reportada es de 2,3735 sobre el objetivo de modelado de lenguaje (LM loss).

Su relevancia es principalmente academica y educativa: sirve como ejemplo reproducible de entrenamiento desde cero, como base para experimentos de destilacion o ajuste fino sobre corpus sinteticos, y como banco de pruebas de la arquitectura hierarchical-concept-diffusion. No se dispone de informacion publica sobre su licencia, idiomas declarados, formato de pesos ni resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; etiquetada como "hierarchical-concept-diffusion" y reportada con objetivo de modelado de lenguaje (LM loss) |
| Parametros totales | 45.166.464 |
| Parametros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | 256 tokens (seq_len de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos de entrenamiento son en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamano del repositorio: 0,3 GB) |

## Arquitectura y entrenamiento

Segun la model card, este modelo es un "arm" (brazo) de un sistema mayor etiquetado como `hierarchical-concept-diffusion`, con un brazo auxiliar (`hcd-aux`). No se detalla la topologia exacta de la red, aunque el hecho de que se reporte una "LM loss" de validacion indica la presencia de un objetivo de modelado de lenguaje autorregresivo. La etiqueta "hierarchical-concept-diffusion" sugiere la combinacion de una jerarquia de conceptos con un mecanismo de difusion, pero la informacion disponible no permite confirmar si se trata de un transformer puro, de un hibrido o de una arquitectura de difusion aplicada a texto. Cualquier afirmacion adicional al respecto seria especulativa.

El proceso de entrenamiento esta documentado con precision: 12.000 pasos sobre 200.000 cuentos de TinyStories, con secuencias de 256 tokens y batch de 32, utilizando AdamW (learning rate 0,0001, weight decay 0,1), scheduler coseno y 200 pasos de warmup. La tokenizacion emplea el tokenizador de GPT-2. No se menciona el uso de RLHF, DPO ni ningun tipo de ajuste por preferencias. La perdida de validacion final alcanzada es de 2,3735.

## Capacidades

- Generacion de texto narrativo corto: el modelo esta entrenado sobre TinyStories, un corpus de cuentos infantiles sinteticos, por lo que su dominio principal es la generacion de relatos breves y coherentes en ingles sencillo.
- Modelado de lenguaje autorregresivo: puede usarse para calcular verosimilitudes y para generacion token a token.
- Contexto limitado: con 256 tokens de ventana, solo maneja interacciones y documentos muy cortos.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Agentes y razonamiento multi-paso: no disponible (el tamano y el corpus de entrenamiento no apuntan a estas capacidades).
- Capacidades multilingues: no disponible; los datos de entrenamiento son en ingles.
- Vision o audio: no disponible.
- Modo de razonamiento explicito ("thinking mode"): no disponible.

## Casos de uso

- Reproduccion educativa de entrenamiento desde cero: el modelo y su configuracion (12.000 pasos, AdamW, scheduler coseno) sirven como plantilla para que estudiantes y desarrolladores reproduzcan el pipeline completo en una sola GPU.
- Generacion de cuentos infantiles en ingles: gracias a su entrenamiento especifico sobre TinyStories, puede generar micro-relatos de vocabulario simple, utiles para prototipos de aplicaciones de storytelling.
- Base para ajuste fino (fine-tuning) en dominios muy concretos: sus 45 millones de parametros permiten reentrenar el modelo completo en minutos u horas sobre corpus pequenos y especializados.
- Experimentacion con arquitecturas hibridas: es un banco de pruebas para investigar variantes de la propuesta hierarchical-concept-diffusion y comparar brazos (`hcd-aux` frente a otros).
- Ablaciones de tokenizacion y datos: al usar el tokenizador de GPT-2 sobre un subconjunto de 200.000 historias, facilita estudios controlados sobre el efecto del tamano del corpus.
- Inferencia en dispositivos de bajos recursos: por su reducido tamano, puede ejecutarse en CPU o en GPU integradas para tareas de generacion de texto muy corto.
- Docencia sobre metricas y evaluacion: la perdida de validacion de 2,3735 permite ilustrar conceptos de overfitting, warmup y schedulers en clase.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion final (LM loss) | 2,3735 |
| Pasos de entrenamiento | 12.000 |
| Longitud de secuencia | 256 |
| Batch | 32 |
| Subconjunto de datos | TinyStories train[:200k] |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,18 GB en fp32 y 0,09 GB en fp16 para los pesos, mas el overhead del runtime; en la practica cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU, incluidas integradas; tambien es viable en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo (GTX serie 10 en adelante, RTX, e incluso multiples iGPU).
- Opciones de despliegue: PyTorch es la via natural, dado que no se especifica arquitectura compatible con otros motores. vLLM, llama.cpp, Ollama o TGI solo serian aplicables si se dispone de los pesos en un formato soportado, lo cual no esta documentado.
- Latencia y throughput: no disponible; por el tamano del modelo y la ventana de 256 tokens, se espera baja latencia incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bcdennis/hcd-tinystories-hier-aux | 45.166.464 | 256 | no disponible | HuggingFace |
| roneneldan/TinyStories-Instruct-1M | no disponible | no disponible | no disponible | HuggingFace |
| Familia TinyStories de referencia (Eldan y Li) | no disponible | no disponible | no disponible | HuggingFace / publicaciones |

No se dispone de datos de parametros, contexto o rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable. La unica referencia objetiva comun es que todos se entrenan sobre el corpus TinyStories.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; TinyStories es un corpus sintetico generado por modelos mayores, por lo que puede heredar los sesgos de esos generadores.
- Riesgo de alucinacion: alto en tareas fuera del dominio de cuentos infantiles, dado que el modelo es muy pequeno y fue entrenado exclusivamente sobre narrativa sintetica breve.
- Limitaciones de contexto: la ventana de 256 tokens restringe severamente cualquier tarea que requiera contexto largo o conversaciones multi-turno.
- Limitaciones de idioma: los datos de entrenamiento son en ingles; no se declaran idiomas soportados y no hay evidencia de capacidades multilingues.
- Licencia: no disponible, lo que impide confirmar si se permite el uso comercial. Debe tratarse como restringido hasta que el autor lo aclare.
- Caveat para produccion: se trata de un experimento de investigacion con cero descargas y cero "likes"; no hay garantias de mantenimiento, soporte ni estabilidad.
- La ausencia de documentacion sobre el formato de pesos y la arquitectura exacta complica su integracion en pipelines estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcdennis/hcd-tinystories-hier-aux
- Dataset TinyStories en HuggingFace: https://huggingface.co/datasets/roneneldan/TinyStories
- Modelo roneneldan/TinyStories-Instruct-1M: https://huggingface.co/roneneldan/TinyStories-Instruct-1M
- Explorador de modelos entrenados sobre TinyStories: https://huggingface.co/models?dataset=dataset:roneneldan/TinyStories
- Proyecto educativo TinyStories_LLM (PyTorch + FastAPI + React): https://github.com/Arnaufafi/TinyStories_LLM
- Sitio comercial no relacionado con el modelo (galeria de regalos personalizados): https://tinystories.ai/
