# fbaldassarri/tiiuae_Falcon3-10B-Base-auto_awq-int4-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a INT4 del modelo `tiiuae/Falcon3-10B-Base`, publicada por el usuario fbaldassarri. No se trata de un modelo nuevo, sino de un artefacto de cuantización derivado del Falcon3-10B-Base desarrollado por el Technology Innovation Institute (TII) de Abu Dabi. La cuantización se ha realizado con Intel AutoRound v0.16.1 aplicando el algoritmo AWQ (Activation-aware Weight Quantization) en modo weights-only, con 4 bits, tamaño de grupo 64 y cuantización simétrica.

El interés de esta ficha radica en que ejemplifica el flujo típico de compresión de un modelo de lenguaje de ~10.000 millones de parámetros para despliegue en hardware con recursos limitados, en particular CPU Intel, iGPU Arc y NPU de la serie Core Ultra. La reducción a 4 bits permite recortar el espacio de pesos hasta aproximadamente 8,3 GB en el repositorio, frente a los ~20 GB que ocuparía el modelo original en bfloat16, a cambio de una degradación de precisión que el autor califica de leve.

Es importante señalar una discrepancia relevante en los metadatos: el nombre del modelo indica 10B, pero el recuento real de parámetros en los ficheros safetensors publicados es de 2.160.061.440. Esta ficha documenta ambos datos tal como aparecen en la información disponible, sin resolver la contradicción. El modelo es de tipo base (completion), no instruct, y está orientado exclusivamente al idioma inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); `model_type: llama` según la model card; familia Falcon3 |
| Parámetros totales | 2.160.061.440 según safetensors publicados; el nombre del modelo indica 10B (discrepancia no resuelta) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | INT4 (W4), grupo 64, simétrica, weights-only (WoQ), método AWQ vía Intel AutoRound 0.16.1 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); configuración de cuantización auto_awq |

## Arquitectura y entrenamiento

El modelo subyacente, Falcon3-10B-Base, es un transformer causal de la familia Falcon3 de TII. La model card del artefacto cuantizado declara `model_type: llama`, lo que sugiere que la implementación de referencia se apoya en la arquitectura Llama dentro de transformers, aunque no se detalla la configuración interna de capas, cabezas de atención ni mecanismos de atención (por ejemplo, si emplea grouped-query attention o atención con ventana deslizante). Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron fases de RLHF o DPO; al tratarse de un modelo base, es esperable que no incluya ajuste por preferencias, pero no se confirma.

La innovación técnica de este repositorio no está en el entrenamiento sino en el proceso de cuantización. Se aplicó AWQ en modo weights-only con calibración sobre 128 muestras de longitud 512, 200 iteraciones de ajuste, tamaño de lote 4 y precisión de carga bfloat16, todo ejecutado en CPU. El proceso completo registrado tuvo una duración de 51.616,7 segundos (unas 860,3 minutos), lo que da una idea del coste computacional del pipeline de AutoRound en CPU. El resultado es un checkpoint INT4 simétrico con grupo 64, pensado para inferencia acelerada en hardware Intel mediante intel-extension-for-pytorch (CPU e iGPU Arc) y OpenVINO (NPU AI Boost en Core Ultra).

## Capacidades

- Generación de texto autoregresiva en modo completion: acepta prompts de texto sin formato de chat y continúa la secuencia.
- Razonamiento y conocimiento general heredados del modelo base Falcon3-10B-Base, sujetos a la degradación introducida por la cuantización a 4 bits.
- Generación de código y matemáticas: capacidades propias de un modelo base de su familia, no verificadas con benchmarks en este artefacto.
- Soporte de tool calling / function calling: no disponible; al ser un modelo base sin ajuste instruct, no incorpora plantilla de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible por la misma razón; requiere ajuste posterior o prompting manual.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia optimizada en Intel CPU, iGPU Arc (vía intel-extension-for-pytorch) y NPU Core Ultra (vía OpenVINO), según declara el autor.

## Casos de uso

- Prototipado rápido de completion de texto en estaciones de trabajo sin GPU dedicada: al estar cuantizado a INT4 y calibrado para CPU Intel, permite ejecutar un modelo de gran tamaño en un portátil o servidor sin acelerador NVIDIA, usando transformers con `device_map="auto"`.
- Generación de texto en entornos con restricciones de memoria: los ~8,3 GB del repositorio y la reducción a 4 bits hacen viable cargar el modelo en máquinas con 16 GB de RAM, frente a los ~20 GB necesarios en bfloat16.
- Despliegue en dispositivos Intel Core Ultra con NPU: el autor indica compatibilidad con OpenVINO para la NPU AI Boost, lo que habilita inferencia de bajo consumo en equipos de sobremesa y portátiles de nueva generación.
- Aceleración de iGPU Arc: mediante intel-extension-for-pytorch se puede aprovechar la GPU integrada para obtener un rendimiento superior al de CPU pura en tareas de generación por lotes.
- Base para ajuste fino ligero o destilación: al ser un modelo base con licencia Apache 2.0, puede servir como punto de partida para tareas downstream en inglés, aunque la cuantización INT4 complica el entrenamiento y suele requerir de-cuantización o QLoRA.
- Investigación en cuantización: el repositorio incluye la receta de replicación completa (versiones fijadas de auto-round, transformers y torch, parámetros de calibración y tiempos), lo que lo convierte en un caso de estudio reproducible para evaluar la pérdida de precisión de AWQ W4G64 en modelos de la familia Falcon3.
- Evaluación comparativa de artefactos cuantizados: útil para medir el impacto de la cuantización en perplejidad y generación frente al Falcon3-10B-Base original en bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente afirma una aceleración de 2-3 veces y una "ligera caída de precisión" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni perplejidad.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 8,3 GB, por lo que se necesita al menos ese espacio para cargar los pesos en INT4; en la práctica, con overhead de activaciones y caché KV, conviene disponer de 10-12 GB de memoria.
- GPU recomendadas: no se especifican modelos NVIDIA concretos; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU Core Ultra.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; al ser un checkpoint auto_awq para transformers, podría cargarse en GPUs con suficiente VRAM, pero no se documenta ni se garantiza.
- Opciones de despliegue: transformers (vía `AutoModelForCausalLM`), intel-extension-for-pytorch para CPU e iGPU Arc, OpenVINO para NPU Core Ultra. El tag `text-generation-inference` aparece en los metadatos, pero no se detalla configuración de TGI. No se mencionan llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles; solo se indica una aceleración genérica de 2-3 veces respecto al modelo sin cuantizar, sin unidades ni condiciones de medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Base-auto_awq-int4-gs64-sym | 2,16 B según safetensors (nombre indica 10B) | no disponible | INT4 W4G64 simétrica, AWQ | Apache 2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Base | 10B (según denominación del modelo base) | no disponible | bfloat16 original | Apache 2.0 | Hugging Face (modelo base) |
| Otras cuantizaciones INT4 de Falcon3-10B-Base | 10B | no disponible | GPTQ, AWQ u otras | Apache 2.0 | no disponible en la información proporcionada |

La comparativa se limita al modelo base del que deriva, ya que no se han proporcionado datos de benchmarks ni de otros artefactos cuantizados comparables. La diferencia principal frente al original es el tamaño en disco (8,3 GB frente a los aproximadamente 20 GB en bfloat16) y el soporte declarado para hardware Intel.

## Limitaciones y advertencias

- Discrepancia de parámetros: el nombre del repositorio indica 10B, pero los safetensors publicados suman 2.160.061.440 parámetros. Conviene verificar la integridad del checkpoint antes de usarlo en producción.
- Degradación por cuantización: el propio autor reconoce una caída de precisión en W4G64; no se cuantifica su magnitud ni se ofrecen métricas de perplejidad.
- Modelo base sin alineación: no está ajustado por instrucciones ni por preferencias humanas, por lo que puede generar contenido sesgado, tóxico o incoherente y no es adecuado para uso directo en atención al cliente sin un ajuste previo.
- Riesgo de alucinación: inherente a los modelos de lenguaje de su escala, agravado por la compresión a 4 bits.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Contexto: no se documenta la longitud máxima de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara que el artefacto se ha desarrollado únicamente con fines de investigación y sin garantía; conviene revisar la licencia del modelo base y las condiciones de las herramientas de cuantización.
- Soporte limitado: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento comunitario conocido.
- Repositorio de replicación alojado en un dominio no estándar (`git.epicdynamic.com`), lo que reduce la trazabilidad y la confianza en la receta de reproducción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Base-auto_awq-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Base
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de replicación: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
