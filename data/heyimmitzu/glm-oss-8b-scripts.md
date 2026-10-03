# heyimmitzu/glm-oss-8b-scripts

## Resumen

`heyimmitzu/glm-oss-8b-scripts` no es un modelo de lenguaje, sino un repositorio de scripts de entrenamiento publicados por el usuario `heyimmitzu`. Contiene el codigo en Python utilizado para hacer fine-tuning de `Llama-3.1-8B-Instruct` sobre el dataset `ianncity/GLM-5.2-Conversation` mediante Unsloth y QLoRA con rango de LoRA r=16. El modelo resultante de ese proceso se publicaria (segun el propio script) en el repositorio `heyimmitzu/glm-oss-8b`, que no forma parte de la informacion proporcionada.

El interes del repositorio es de caracter practico y reproducible: `train.py` cubre el ciclo completo de un SFT con QLoRA (entrenamiento, guardado del adaptador LoRA, fusion a 16 bits, exportacion a GGUF Q8_0 y Q4_K_M, generacion de Modelfiles de Ollama y subida al Hub), `watchdog.py` monitoriza el entrenamiento en un pod de RunPod y lo apaga via API al terminar, y `upload_to_hub.py` es un helper independiente de subida. Es, por tanto, una plantilla de pipeline de ajuste fino de bajo coste para modelos de 8B en una sola GPU.

La relevancia actual del repositorio es limitada por su estado: 0 descargas, 0 likes, sin licencia declarada, sin idiomas declarados y sin pipeline asociado. No incluye pesos, no incluye evaluacion y no documenta la calidad del modelo entrenado, por lo que cualquier uso en produccion exige reproducir el entrenamiento y evaluarlo por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Repositorio de scripts Python; el modelo objetivo es un transformer decoder-only denso de la familia Llama 3.1 |
| Parametros totales | 8.030 millones en el modelo base (`Llama-3.1-8B-Instruct`); el repositorio no contiene pesos |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; el script entrena con `--max_length 2048` |
| Tipos de cuantizacion | Salida GGUF en `q8_0` y `q4_k_m`; carga del base en 4 bits (nf4) durante el entrenamiento QLoRA |
| Idiomas soportados | no disponible en el repositorio; el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible en el repositorio; el modelo base esta sujeto a la Llama 3.1 Community License |
| Formato de pesos | El repositorio no contiene pesos; el pipeline genera adaptador LoRA, safetensors fusionados en 16 bits y GGUF |

## Arquitectura y entrenamiento

El repositorio implementa un ajuste fino supervisado (SFT) con QLoRA sobre `Llama-3.1-8B-Instruct`. La configuracion de ejemplo del propio README es: `--subset 20000`, `--batch_size 4`, `--grad_accum 2` (batch efectivo de 8), `--max_length 2048`, `--num_epochs 1`, `--learning_rate 2e-4`, `--warmup_steps 100` y `--grad_ckpt standard`. El rango de LoRA es r=16. La carga del modelo base se hace en 4 bits mediante Unsloth, y el entrenamiento se ejecuta con la libreria TRL.

El flujo de `train.py` es un pipeline end-to-end: entrena, guarda el adaptador LoRA, lo fusiona en un checkpoint de 16 bits, exporta cuantizaciones GGUF (`q8_0`, `q4_k_m`), escribe los Modelfiles y el README de Ollama, y sube todo al Hub indicado en `--repo_id`. El token de escritura se toma de la variable de entorno `HF_TOKEN` o del fichero `/workspace/.hf_token`. El dataset de entrenamiento es `ianncity/GLM-5.2-Conversation`, cuya composicion, numero de tokens, proceso de generacion y licencia no estan documentados en la informacion proporcionada; se desconoce si los datos son generados sinteticamente a partir de otro modelo. No se documenta ninguna innovacion tecnica mas alla del uso de Unsloth para reducir el consumo de VRAM y del bucle de monitorizacion/apagado automatico del pod.

## Capacidades

- No hay ninguna evaluacion del modelo resultante publicada en el repositorio, por lo que sus capacidades reales no estan verificadas.
- El modelo objetivo hereda las capacidades del base `Llama-3.1-8B-Instruct`: generacion de texto, razonamiento de uso general, generacion de codigo y matematicas basicas a nivel de un 8B.
- Soporte de tool calling / function calling: heredado del base, con el formato de plantilla de Llama 3.1; no validado tras el fine-tune.
- Soporte de agentes y razonamiento multi-paso: heredado del base; no validado tras el fine-tune.
- Capacidades multilingues: heredadas del base (8 idiomas declarados oficialmente); no validadas tras el fine-tune.
- Capacidad especial buscada por el autor: adoptar el estilo conversacional del dataset `GLM-5.2-Conversation`, presumiblemente destilado de las respuestas de un modelo GLM; sin evaluacion publica.
- El repositorio en si aporta capacidades de automatizacion de MLOps: monitorizacion horaria de recursos, comprobacion de espacio en disco y apagado automatico de un pod de RunPod via API.

## Casos de uso

- Reproduccion completa del pipeline en una GPU alquilada: `train.py` ejecuta el ciclo entero (entrenamiento, fusion, exportacion GGUF, subida) y `watchdog.py` apaga el pod de RunPod al terminar, lo que permite lanzar un fine-tune desatendido y controlar el coste por horas.
- Plantilla para ajuste fino de dominio propio: sustituyendo `--subset` y el dataset en `train.py` se puede reutilizar el mismo esqueleto QLoRA para adaptar un 8B a datos internos de una empresa con una sola GPU de 24 GB.
- Despliegue conversacional local con Ollama: los Modelfiles generados automaticamente por el script permiten cargar las cuantizaciones Q4_K_M o Q8_0 en un equipo de sobremesa sin pasos manuales de conversion.
- Generacion de datos sinteticos conversacionales: reutilizando el pipeline con un dataset propio de prompts se puede producir un modelo especializado en un formato de dialogo concreto, util como generador de datos para otros entrenamientos.
- Estudio de destilacion de estilo: el dataset `GLM-5.2-Conversation` permite experimentar hasta que punto un 8B puede imitar el estilo de respuesta de un modelo mayor mediante SFT puro, sin RLHF ni DPO.
- Asistente interno en espanol: partiendo del base multilingue y anadiendo un pequeno conjunto de datos en espanol al subset, el pipeline produce un modelo desplegable en Ollama para consultas internas de documentacion.
- Validacion de convergencia en CI: `watchdog.py` registra instantaneas horarias de recursos, lo que sirve para monitorizar que un entrenamiento lanzado desde un runner no se queda sin disco ni se desborda de VRAM.
- Material docente de QLoRA: los tres scripts son un ejemplo minimo y legible de un flujo QLoRA + Unsloth + TRL + exportacion GGUF, util para cursos o talleres de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye ninguna evaluacion del modelo ajustado, ni comparaciones con el base, ni metricas de perdida de entrenamiento. El modelo base `Llama-3.1-8B-Instruct` tiene cifras oficiales publicadas en su propia model card, pero no se reproducen aqui porque no forman parte de la informacion proporcionada ni son atribuibles al modelo resultante de este pipeline.

## Requisitos de hardware

- Entrenamiento QLoRA (8B, r=16, `max_length=2048`, batch efectivo 8): no documentado en el repositorio; como estimacion orientativa del orden de magnitud, se requiere una GPU con 16-24 GB de VRAM (RTX 4090, L40S, A100 40 GB). Reduciendo `--batch_size` a 1 y `--grad_accum` proporcionalmente, Unsloth permite bajar el consumo, pero el repositorio no aporta mediciones.
- Inferencia en 16 bits: aproximadamente 16 GB de pesos mas cache KV; requiere A100 40 GB, H100 o dos GPU de 24 GB.
- Inferencia en GGUF Q8_0: aproximadamente 8-9 GB de pesos; cabe en RTX 4090, RTX 4080, RTX 3090 y en Mac con memoria unificada de 16 GB o mas.
- Inferencia en GGUF Q4_K_M: aproximadamente 5-6 GB de pesos; cabe en RTX 4060 Ti 16 GB, RTX 3060 12 GB, RTX 4070 y equipos consumer con 8 GB de VRAM si se limita el contexto.
- Cache KV: usar la ventana completa de 128.000 tokens del base es inviable en hardware consumer (varios GB por secuencia); en la practica conviene limitar el contexto al rango entrenado (2.048 tokens) o usar cuantizacion de la cache KV.
- Opciones de despliegue: Ollama (los Modelfiles los genera el propio script), llama.cpp para los GGUF, vLLM o TGI para el checkpoint safetensors, y Transformers + PEFT para cargar el adaptador LoRA sin fusionar.
- Latencia y throughput: no disponibles; el repositorio no publica ninguna medicion.

## Comparativa con modelos similares

La comparacion se establece frente a modelos de ~7-8B de proposito general, ya que el modelo objetivo de estos scripts pertenece a esa categoria y no tiene metricas propias publicadas.

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glm-oss-8b (resultado de estos scripts) | 8B denso | no disponible (entrenado a 2.048) | no disponible | no disponible (depende del base) | pesos no publicados en la informacion proporcionada |
| Llama-3.1-8B-Instruct | 8B denso | 128.000 tokens | si, en su model card oficial | Llama 3.1 Community License | pesos abiertos en el Hub |
| Qwen2.5-7B-Instruct | 7B denso | 128.000 tokens | si, en su model card oficial | Apache-2.0 | pesos abiertos en el Hub |
| Mistral-7B-Instruct-v0.3 | 7B denso | 32.000 tokens | si, en su model card oficial | Apache-2.0 | pesos abiertos en el Hub |

Frente a estas alternativas, la unica ventaja diferencial del pipeline es la automatizacion del ciclo completo y el coste bajo de entrenamiento con Unsloth; en licencia y en soporte, Qwen2.5-7B-Instruct y Mistral-7B-Instruct-v0.3 son opciones mas permisivas al no arrastrar la Llama 3.1 Community License.

## Limitaciones y advertencias

- El repositorio no es un modelo: descargarlo no proporciona pesos utilizables para inferencia.
- No declara licencia. Al derivar de `Llama-3.1-8B-Instruct`, cualquier redistribucion queda sujeta a la Llama 3.1 Community License, que exige incluir el aviso de licencia, mantener la atribucion "Built with Llama" y respetar el limite de 700 millones de usuarios mensuales.
- La procedencia del dataset `ianncity/GLM-5.2-Conversation` no esta documentada: si contiene salidas generadas por otro modelo, puede haber implicaciones de terminos de uso de ese proveedor y de calidad de los datos.
- Se desconoce la composicion linguistica del dataset; no hay garantia de que el modelo resultante mantenga el rendimiento multilingue del base y es probable que sufra olvido catastrofico fuera de la distribucion de entrenamiento.
- Riesgo de alucinacion: inherente a un 8B ajustado con SFT puro durante una sola epoca sobre 20.000 ejemplos; no se ha medido.
- Sesgos: no evaluados. Un SFT sobre un dataset conversacional no auditado puede reforzar sesgos presentes en el base y en los datos de destilacion.
- Una sola epoca con `learning_rate 2e-4` sobre 20.000 ejemplos es una receta agresiva para r=16; puede producir sobreajuste al estilo del dataset sin ganancia real de capacidad.
- Sin evaluacion, sin model card del modelo final y con 0 descargas y 0 likes, el repositorio no ofrece ninguna evidencia de que el entrenamiento funcione ni de la calidad del resultado.
- La fecha de creacion registrada (2026-10-02) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del contenido antes de reutilizarlo.
- En produccion, el checkpoint fusionado en 16 bits sin evaluacion de seguridad ni de sesgos no deberia desplegarse de cara al usuario sin una bateria de pruebas propia.

## Enlaces

- Repositorio de scripts en HuggingFace: https://huggingface.co/heyimmitzu/glm-oss-8b-scripts
- Dataset de entrenamiento: https://huggingface.co/datasets/ianncity/GLM-5.2-Conversation
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Model card del base y licencia: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Ollama: https://github.com/ollama/ollama
- llama.cpp: https://github.com/ggml-org/llama.cpp
- vLLM: https://github.com/vllm-project/vllm
- Repositorio del modelo entrenado (referenciado en el script, no verificado): https://huggingface.co/heyimmitzu/glm-oss-8b
