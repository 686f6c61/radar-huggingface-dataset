# Nekodeus/stablelm-2-1_6b-openvino

## Resumen

StableLM-2 1.6B OpenVINO (INT8) es una conversion a formato OpenVINO IR del modelo StableLM-2 1.6B de Stability AI, publicada por el usuario Nekodeus en HuggingFace. El modelo base es un LLM de 1.600 millones de parametros orientado a generacion de texto, y esta version aplica cuantizacion weight-only INT8 mediante NNCF para reducir el tamano del modelo a 1,7 GB y acelerar la inferencia en CPU.

El objetivo de esta conversion es permitir ejecutar StableLM-2 en hardware convencional sin GPU dedicada, aprovechando el runtime OpenVINO de Intel. Esto lo hace relevante para despliegues ligeros en portatiles, servidores sin aceleradora o entornos edge, donde un modelo de 1,6B parametros cuantizado a INT8 puede ofrecer latencias razonables con recursos minimos. La conversion se realizo con `optimum-cli` de forma completamente offline sobre CPU en Kaggle, usando `optimum-intel 2.2.0` y `openvino 2026.4.1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StableLm2ForCausalLM (transformer decoder con layerwise-scaled attention) |
| Parametros totales | 1,6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | INT8 weight-only (NNCF), activaciones FP16/FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (la conversion); el modelo base usa Stability AI Community License |
| Formato de pesos | OpenVINO IR (3 partes: openvino_model, openvino_tokenizer, openvino_detokenizer) |

## Arquitectura y entrenamiento

La arquitectura subyacente es StableLm2ForCausalLM, un transformer decoder de 1,6B parametros con mecanismo de atencion con escalado por capas (layerwise-scaled), una variante introducida por Stability AI en la familia StableLM 2 para estabilizar el entrenamiento. La ventana de contexto de esta conversion es de 2048 tokens.

No hay informacion disponible sobre los datos de entrenamiento del modelo base ni sobre el uso de RLHF o DPO en esta ficha. En cuanto a la conversion, se aplico cuantizacion weight-only INT8 con la herramienta NNCF (Neural Network Compression Framework) de Intel, manteniendo las activaciones en FP16/FP32 tal y como se trazaron durante la exportacion. El resultado son tres archivos IR independientes: el modelo, el tokenizador y el detokenizador, lo que permite usar el pipeline completo desde OpenVINO GenAI sin dependencias de Python.

## Capacidades

- Generacion de texto general (continuacion, explicaciones, redaccion)
- Comprension y generacion de codigo a nivel basico (propio de un modelo de 1,6B)
- Razonamiento y matematicas limitados por su tamano
- Ejecucion eficiente en CPU gracias a la cuantizacion INT8 de OpenVINO
- Integrable con `optimum-intel` (API de transformers) o con OpenVINO GenAI (API C++ y Python)
- Soporte de tool calling, agentes y capacidades multimodales: no disponible en la informacion proporcionada

## Casos de uso

- Chatbots ligeros en local: con 1,7 GB de pesos y ejecucion en CPU, es adecuado para asistentes conversacionales embebidos en aplicaciones de escritorio sin requerir GPU.
- Generacion de texto en dispositivos edge: la cuantizacion INT8 y el runtime OpenVINO permiten desplegar el modelo en equipos Intel de gama baja o industrial.
- Prototipado rapido de LLM en notebooks: se puede cargar con `OVModelForCausalLM` en segundos y probar prompts sin infraestructura de GPU.
- Integracion en aplicaciones C++: el pipeline de OpenVINO GenAI permite incrustar el modelo en software nativo sin dependencia del ecosistema Python.
- Resumen y reescritura de textos cortos: con 2048 tokens de contexto, es util para procesar documentos de longitud moderada.
- Sustituto de APIs externas en entornos offline: al ser una conversion local y de licencia permisiva, puede ejecutarse sin conexion ni coste por token en entornos con restricciones de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base (stabilityai/stablelm-2-1_6b) tiene benchmarks publicados en su ficha original, pero no se incluyen en la informacion proporcionada y no se reproducen aqui para no inventar numeros.

## Requisitos de hardware

- VRAM / RAM estimada: aproximadamente 1,7 GB solo para los pesos INT8; con overhead de runtime y KV cache, se recomienda al menos 4 GB de RAM libre. No requiere VRAM al ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; optimizado para CPU Intel (integrado en OpenVINO). Tambien puede ejecutarse en GPU Intel integrada o dedicada mediante el dispositivo "GPU" de OpenVINO.
- Consumer GPUs: cabe sobradamente en cualquier GPU moderna si se usa el backend GPU de OpenVINO, pero el caso de uso principal es CPU-only.
- Opciones de despliegue: `optimum-intel` (`OVModelForCausalLM`), OpenVINO GenAI (Python y C++ con `LLMPipeline`). No es un formato GGUF, por lo que llama.cpp, Ollama, vLLM o TGI no son aplicables directamente a estos pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| StableLM-2 1.6B (original) | 1,6B | 2048 | safetensors | Stability AI Community License |
| StableLM-2 1.6B OpenVINO INT8 (esta ficha) | 1,6B | 2048 | OpenVINO IR INT8 | Apache-2.0 (conversion) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32768 (hasta 128K con YaRN) | safetensors / GGUF | Apache-2.0 / Qwen license |
| Phi-3-mini (3,8B) | 3,8B | 4096 (128K en variantes) | safetensors / GGUF | MIT |

Frente al modelo original, esta conversion ofrece el mismo tamano logico pero un footprint de 1,7 GB y mejor rendimiento en CPU Intel. Frente a alternativas como Qwen2.5-1.5B, StableLM-2 1.6B tiene un contexto notablemente menor (2048 frente a 32768 tokens), aunque la disponibilidad en formato OpenVINO lo hace mas atractivo para despliegues en hardware Intel.

## Limitaciones y advertencias

- Contexto de solo 2048 tokens, muy limitado para documentos largos o conversaciones extensas frente a modelos contemporaneos con 32K o mas.
- Con 1,6B parametros, las capacidades de razonamiento, matematicas y generacion de codigo son limitadas y el riesgo de alucinacion es alto en tareas de conocimiento factual.
- Sesgos: no disponible informacion especifica; al ser un modelo base (no instruct), puede generar contenido sin filtrar.
- Licencia: la conversion se publica bajo Apache-2.0, pero el modelo base (stabilityai/stablelm-2-1_6b) esta bajo la Stability AI Community License, que impone condiciones de uso; conviene revisar esa licencia antes de uso comercial.
- La cuantizacion INT8 weight-only puede degradar ligeramente la calidad de salida respecto a los pesos FP16 originales.
- No hay datos de evaluacion de la conversion (p. ej., comparativa de precision pre/post cuantizacion), por lo que la degradacion real es desconocida.
- Repositorio de autor comunitario con 384 descargas y sin verificacion oficial de Stability AI: la calidad de la conversion depende del autor, no del proveedor del modelo base.

## Enlaces

- Modelo convertido: https://huggingface.co/Nekodeus/stablelm-2-1_6b-openvino
- Modelo base: https://huggingface.co/stabilityai/stablelm-2-1_6b
- optimum-intel (herramienta de conversion): https://huggingface.co/docs/optimum/intel/index
- OpenVINO GenAI: https://docs.openvino.ai
- NNCF (cuantizacion): https://github.com/openvinotoolkit/nncf
