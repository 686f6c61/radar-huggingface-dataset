# fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int8-gs64-sym

## Resumen

Esta ficha describe una cuantizacion INT8 del modelo base Falcon3-10B-Base, publicada por el usuario fbaldassarri bajo licencia Apache 2.0. No se trata de un modelo nuevo, sino de un artefacto derivado: los pesos originales de TII (Technology Innovation Institute) se han convertido a 8 bits mediante el algoritmo GPTQ implementado en Intel AutoRound v0.16.1, con grupo de cuantizacion de 64 y esquema simetrico. El objetivo es reducir el peso en disco y los requisitos de memoria para inferencia en CPU, iGPU Intel Arc y NPU Intel (Core Ultra), manteniendo una calidad cercana al modelo en bfloat16.

El modelo subyacente, Falcon3-10B-Base, es un transformer causal de 10 000 millones de parametros (el repositorio cuantizado reporta 3 367 787 520 parametros en safetensors, cifra que no coincide con el nombre comercial y que conviene tratar con cautela) entrenado principalmente en ingles. Esta version es un modelo base, no instruido: no incluye plantilla de chat ni ajuste por instrucciones, por lo que se usa como completador de texto.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de escala 10B en hardware Intel sin GPU dedicada, algo util para prototipado, entornos de investigacion con recursos limitados y despliegues en estaciones de trabajo con Core Ultra. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y la model card no incluye evaluaciones de calidad tras la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: llama), derivado de Falcon3-10B-Base |
| Parametros totales | 3 367 787 520 (segun safetensors del repo cuantizado); el modelo base se denomina comercialmente 10B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 GPTQ (AutoGPTQ), group_size 64, simetrica, weights-only quantization (WoQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion GPTQ), libreria transformers |

## Arquitectura y entrenamiento

El modelo base Falcon3-10B-Base es un transformer causal autoregresivo. La model card del artefacto cuantizado declara `model_type: llama`, lo que indica que la implementacion en transformers sigue la familia Llama, aunque el modelo procede del linaje Falcon3 de TII. No se proporcionan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO; al ser un modelo base, lo esperable es que no incluya ajuste por preferencias, pero este dato no se confirma en la documentacion consultada.

La innovacion tecnica de este repositorio es la cuantizacion: se aplico Intel AutoRound v0.16.1 con el algoritmo GPTQ, 8 bits, grupo de 64 y simetria, usando 128 muestras de calibracion, 200 iteraciones, longitud de secuencia 512 y batch de 4, todo en CPU con `torch.bfloat16` como tipo de carga. El proceso de calibracion y ajuste duro 51 689,2 segundos (unas 861,5 minutos) y finalizo el 8 de noviembre de 2026. La model card indica que el artefacto esta pensado para inferencia en CPU Intel, iGPU Arc mediante intel-extension-for-pytorch y NPU Intel via OpenVINO. No se documentan tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva y completado de texto sin instrucciones (modelo base).
- Razonamiento y conocimiento general en ingles, heredado del modelo base Falcon3-10B-Base.
- Generacion de codigo y matematicas basicas, segun las capacidades del modelo original (no verificadas en esta cuantizacion).
- No incluye soporte nativo de tool calling ni function calling documentado.
- No incluye modo de razonamiento explicito (thinking mode) ni capacidades de vision o audio.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- Inferencia optimizada para CPU Intel, iGPU Intel Arc y NPU Intel Core Ultra.

## Casos de uso

- Completado de texto en ingles en estaciones de trabajo sin GPU: el modelo puede ejecutarse en CPU Intel con intel-extension-for-pytorch, aprovechando la cuantizacion INT8 para reducir memoria y latencia en equipos de sobremesa.
- Prototipado de pipelines de generacion de texto: sirve para validar integraciones con transformers y text-generation-inference antes de pasar a un modelo instruido o a mayor escala.
- Investigacion sobre cuantizacion: el repositorio incluye la receta completa de reproduccion con auto-round-pipeline, lo que permite estudiar el impacto de INT8 gs64 simetrico en la calidad del modelo.
- Despliegue en portatiles con Core Ultra: la NPU Intel AI Boost y la iGPU Arc permiten ejecutar el modelo con OpenVINO en entornos de baja potencia.
- Generacion de texto offline en entornos aislados: al ser un artefacto autocontenido con licencia Apache 2.0, puede integrarse en herramientas internas sin dependencias de API externas.
- Base para ajuste fino posterior: al ser un modelo base cuantizado, puede servir como punto de partida para experimentos de adaptacion, aunque la cuantizacion limita el entrenamiento directo y requeriria tecnicas como QLoRA.
- Evaluacion comparativa de backends: util para medir throughput y latencia entre CPU, iGPU y NPU Intel con el mismo artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de perplejidad, MMLU, HumanEval ni comparaciones con el modelo en bfloat16, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion INT8.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 13,2 GB en disco; en memoria, un modelo INT8 de esta escala requiere del orden de 10-13 GB, aunque la cifra exacta no se documenta.
- GPU recomendadas: no se documentan; el artefacto esta orientado a CPU Intel, iGPU Intel Arc y NPU Intel Core Ultra.
- Cabe en GPU de consumo: no confirmado; por tamano, seria ajustado en GPUs de 16 GB o mas, pero la model card no valida este escenario.
- Opciones de despliegue: transformers con AutoGPTQ, intel-extension-for-pytorch para CPU e iGPU Arc, OpenVINO para NPU Intel, y text-generation-inference segun las etiquetas del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int8-gs64-sym | 3,37B reportados (10B nominal) | No disponible | INT8 GPTQ gs64 simetrica | Apache 2.0 | Hugging Face |
| tiiuae/Falcon3-10B-Base | 10B | No disponible en esta ficha | bfloat16 original | Apache 2.0 | Hugging Face |
| Falcon3-10B-Instruct (TII) | 10B | No disponible en esta ficha | bfloat16 original | Apache 2.0 | Hugging Face |

La comparacion directa con alternativas de otros fabricantes (por ejemplo, Llama 3.1 8B o Mistral 7B) no se incluye porque la informacion proporcionada no contiene datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene conversaciones con formato de chat; requiere prompts de completado.
- Solo soporta ingles segun la etiqueta de idioma del repositorio.
- No hay evaluacion publicada del impacto de la cuantizacion INT8 en la calidad; la perdida de rendimiento respecto al modelo original es desconocida.
- El numero de parametros reportado en safetensors (3,37B) no coincide con la denominacion comercial 10B, lo que genera incertidumbre sobre el artefacto real.
- Riesgo de alucinacion inherente a los modelos de lenguaje, sin mitigaciones documentadas.
- Sesgos desconocidos: la model card no documenta analisis de sesgo ni composicion del dataset de entrenamiento.
- Uso comercial permitido por Apache 2.0, pero el autor declara que el modelo se desarrollo solo con fines de investigacion y sin garantia.
- El repositorio tiene cero descargas y cero likes, sin validacion comunitaria de su funcionamiento.
- La receta de reproduccion apunta a un repositorio Git externo (git.epicdynamic.com) cuya disponibilidad y mantenimiento no estan verificados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Base-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Base
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Pipeline de reproduccion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
