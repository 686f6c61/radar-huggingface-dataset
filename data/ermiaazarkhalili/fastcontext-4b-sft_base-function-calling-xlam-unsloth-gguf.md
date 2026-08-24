# ermiaazarkhalili/FastContext-4B-SFT_base-Function-Calling-xLAM-Unsloth-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF de `FastContext-4B-SFT_base-Function-Calling-xLAM-Unsloth`, un fine-tune con LoRA del modelo `microsoft/FastContext-1.0-4B-SFT` (ya retirado del Hub) sobre el dataset `Salesforce/xlam-function-calling-60k`. El objetivo es especializar un modelo de 4B de parámetros en tareas de function calling y tool use, manteniendo un tamaño reducido que permita su ejecución en CPU y dispositivos de borde.

El modelo base, desarrollado por Microsoft, no está disponible públicamente en la actualidad, por lo que este checkpoint cuantizado es una de las pocas vías para acceder a sus capacidades. El fine-tune se realizó con Unsloth y TRL, fusionando los adaptadores LoRA en los pesos base. Se ofrecen seis niveles de cuantización (Q2_K a Q8_0) con tamaños entre 1,67 GB y 4,28 GB, lo que lo hace adecuado para entornos con recursos limitados.

La relevancia de este modelo radica en su especialización en function calling, una capacidad crítica para agentes y asistentes que necesitan interactuar con APIs y herramientas externas. Al ser un modelo de 4B cuantizado, puede desplegarse en hardware modesto, aunque no se han publicado evaluaciones de rendimiento que confirmen su calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base retirado, sin especificaciones publicas) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso max sequence length de 2048) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors disponibles en el repo de precision completa) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo base `microsoft/FastContext-1.0-4B-SFT`. Por el nombre y el tamano, es probable que se trate de un transformer decoder-only, pero no hay confirmacion oficial. El fine-tune se realizo con LoRA (rank 16, alpha 16) sobre los modulos de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`), usando QLoRA con precision base de 4 bits. El entrenamiento duro una epoca con un learning rate de 0.0002, batch efectivo de 8 y una longitud de secuencia maxima de 2048 tokens. El dataset utilizado fue `Salesforce/xlam-function-calling-60k`, compuesto por 60.000 ejemplos de llamadas a funciones.

Los registros de entrenamiento muestran dos ejecuciones: una larga de 94.254 pasos con perdida final de 0.8690 y otra corta de 7.500 pasos con perdida final de 0.1443. Estos valores son solo observaciones de perdida de entrenamiento y no deben interpretarse como indicadores de calidad del modelo final.

## Capacidades

- Function calling y tool calling: entrenado especificamente sobre el dataset xlam-function-calling-60k, que contiene ejemplos de invocacion de funciones en formato JSON.
- Generacion de texto: capacidad generica heredada del modelo base, aunque no se ha evaluado su calidad fuera del dominio de function calling.
- Soporte de agentes: al poder emitir llamadas a funciones estructuradas, puede integrarse en pipelines de agentes que requieran interaccion con APIs.
- Multilingue: no hay informacion sobre los idiomas soportados; se asume que hereda las capacidades del modelo base, que son desconocidas.

## Casos de uso

- Asistentes virtuales con integracion de herramientas: el modelo puede recibir una consulta del usuario, decidir que funcion invocar (por ejemplo, consultar el tiempo, buscar en una base de datos) y devolver la llamada estructurada en JSON. Su tamano reducido permite ejecutarlo en un servidor modesto o en un portatil.
- Automatizacion de tareas de back-office: en entornos donde se necesita extraer informacion de sistemas externos, el modelo puede actuar como intermediario que traduce lenguaje natural a llamadas de API, reduciendo la necesidad de reglas manuales.
- Prototipado rapido de agentes: al ser un modelo pequeno y cuantizado, es adecuado para pruebas de concepto de agentes con function calling sin incurrir en costes de inferencia elevados.
- Despliegue en dispositivos de borde: las cuantizaciones Q2_K y Q3_K_M ocupan menos de 2,1 GB, lo que permite ejecutar el modelo en Raspberry Pi o en GPUs integradas con poca memoria.
- Educacion e investigacion: sirve como ejemplo de fine-tune de function calling sobre un modelo base retirado, util para estudiar tecnicas de LoRA y cuantizacion.
- Integracion con frameworks de orquestacion: compatible con llama.cpp y Ollama, puede integrarse en sistemas como LangChain o LlamaIndex para construir agentes que llamen funciones de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento observada en los registros SLURM, que no constituye una evaluacion de calidad. No hay datos de MMLU, HumanEval, GSM8K ni de tareas especificas de function calling.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantizacion Q4_K_M (2,50 GB), se necesitan al menos 3-4 GB de VRAM si se carga completamente en GPU; para Q8_0 (4,28 GB), se requieren unos 5-6 GB. Las cuantizaciones menores (Q2_K, Q3_K_M) pueden caber en 2-3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como A10 o A100 (aunque estas ultimas son sobredimensionadas para un modelo de 4B).
- Ejecucion en CPU: gracias al formato GGUF, puede ejecutarse en CPU con llama.cpp, con latencias de varios segundos por token dependiendo del hardware.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y cualquier runtime compatible con GGUF. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (RTX 4090), un modelo de 4B cuantizado Q4_K_M puede generar entre 50 y 100 tokens por segundo, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de function calling de tamano similar (por ejemplo, Qwen2.5-3B-Instruct, Llama-3.2-3B-Instruct o Phi-3.5-mini). La falta de benchmarks publicos impide establecer una comparacion objetiva. Se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo en produccion.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluacion de benchmarks sobre este checkpoint; los unicos numeros disponibles son perdidas de entrenamiento, que no garantizan calidad en tareas reales.
- El modelo hereda los sesgos, el cutoff de conocimiento y los modos de fallo del modelo base `microsoft/FastContext-1.0-4B-SFT`, que ademas ya no esta disponible en el Hub, lo que dificulta auditar su procedencia.
- El fine-tune se realizo sobre un unico dataset de function calling (xlam-function-calling-60k); el comportamiento fuera de esa distribucion no ha sido probado y puede ser impredecible.
- Los adaptadores LoRA se fusionaron en los pesos base, por lo que no es posible separar el fine-tune del modelo original.
- La licencia del modelo no esta especificada, lo que genera incertidumbre legal para uso comercial. Se recomienda contactar al autor antes de utilizarlo en productos.
- Al ser un modelo de 4B, su capacidad de razonamiento complejo y de manejo de contextos largos es limitada en comparacion con modelos de mayor tamano.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/ermiaazarkhalili/FastContext-4B-SFT_base-Function-Calling-xLAM-Unsloth-GGUF
- Repositorio de pesos en precision completa: https://huggingface.co/ermiaazarkhalili/FastContext-4B-SFT_base-Function-Calling-xLAM-Unsloth
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Herramienta Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl
