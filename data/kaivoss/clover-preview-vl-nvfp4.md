# kaivoss/Clover-Preview-VL-NVFP4

## Resumen

Clover-Preview-VL-NVFP4 es una version cuantizada en NVFP4 del modelo multimodal Clover-Preview-VL, publicado por el usuario kaivoss en Hugging Face. Se trata de un modelo de lenguaje con arquitectura de mezcla de expertos (MoE) y capacidad de vision, disenado con un enfoque poco habitual: se presenta como un modelo de difusion aplicado a lenguaje, no como un transformer autorregresivo convencional. El checkpoint cuenta con 21.015.060.656 parametros totales y un repositorio de 24 GB, lo que refleja el objetivo principal de esta variante: reducir el peso de los pesos de aproximadamente 66 GB en bf16 a unos 23 GB mediante cuantizacion de 4 bits.

La innovacion central de esta version es que solo los expertos enrutados de las 40 capas MoE se cuantizan a NVFP4 (pesos E2M1 de 4 bits con escalas E4M3 por bloque de 16 y escalas FP32 por tensor), mientras que la atencion, la atencion lineal, el router, los embeddings y la torre de vision permanecen en bf16. Esto preserva el comportamiento del modelo original con una huella de memoria mucho menor, a costa de un error de ida y vuelta en los expertos de aproximadamente 9,5 % RMSE respecto a la fuente bf16.

Es relevante ahora porque demuestra un patron de despliegue practico para modelos MoE multimodales grandes en hardware Blackwell (B200, SM100), con soporte para kernels FP4 de FlashInfer TRT-LLM a traves de SGLang, y con una ruta de fallback funcional en Hopper (H100/H200) mediante el backend Marlin. La licencia Apache 2.0 facilita su adopcion comercial, aunque la dependencia de una bifurcacion especifica de SGLang limita su uso inmediato en stacks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion y atencion lineal, modelo de difusion para lenguaje (clover_moe) |
| Parametros totales | 21.015.060.656 |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (valor configurado en el ejemplo de despliegue) |
| Tipos de cuantizacion | NVFP4 (4 bits E2M1) en expertos enrutados de 40 capas MoE; bf16 en atencion, atencion lineal, router, embeddings y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con configuracion de cuantizacion `hf_quant_config.json` (ModelOpt MIXED_PRECISION) |

## Arquitectura y entrenamiento

El modelo base Clover-Preview-VL emplea una arquitectura MoE con 40 capas de expertos enrutados, combinando atencion estandar con atencion lineal, y se describe como un modelo de difusion aplicado a lenguaje en lugar de un transformer autorregresivo clasico. Incluye ademas una torre de vision para el procesamiento de imagenes. Esta variante NVFP4 no reentrena el modelo: aplica cuantizacion post-entrenamiento mediante el empaquetador offline `quantize_nvfp4.py` incluido en el repositorio base, cuantizando unicamente los expertos enrutados de las 40 capas MoE.

La estrategia de cuantizacion es mixta: los pesos de los expertos se almacenan en 4 bits (E2M1) con escalas E4M3 por bloque de 16 elementos y escalas FP32 por tensor, mientras que el resto de componentes criticos para la estabilidad (router, atencion, embeddings, torre de vision) se mantienen en bf16. El error de ida y vuelta de los expertos frente a la fuente bf16 es de aproximadamente 9,5 % RMSE, un valor que el autor describe como estandar para NVFP4. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento mediante un paradigma de difusion para lenguaje, no autorregresivo convencional.
- Procesamiento de vision: incluye torre de vision que permanece en bf16, lo que permite entrada de imagenes.
- Mezcla de expertos con enrutamiento por token a traves de 40 capas MoE.
- Soporte de decodificacion especulativa mediante el algoritmo CLOVER en SGLang (`--speculative-algorithm CLOVER`).
- Parser de razonamiento compatible con el formato de Qwen3 (`--reasoning-parser qwen3`), lo que sugiere soporte de modo de razonamiento estructurado.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia multimodal en Blackwell: el checkpoint esta optimizado para ejecutarse en B200 (SM100) con kernels FP4 de FlashInfer TRT-LLM, lo que permite servir un modelo de 21.000 millones de parametros con unos 23 GB de pesos en lugar de 66 GB, reduciendo el numero de GPUs necesarias.
- Servicio de vision-lenguaje en produccion con SGLang: al integrarse mediante `hf_quant_config.json` con layout ModelOpt MIXED_PRECISION, SGLang detecta la configuracion automaticamente y permite levantar un servidor compatible con la API de OpenAI en el puerto indicado.
- Evaluacion de modelos de difusion para lenguaje: util para investigadores que quieran comparar el comportamiento de un modelo de difusion linguistico frente a transformers autorregresivos en tareas de generacion y razonamiento.
- Despliegue en Hopper con fallback Marlin: en H100/H200 se puede usar `--moe-runner-backend marlin` para ejecutar el mismo checkpoint sin hardware Blackwell, lo que facilita la validacion en infraestructura existente antes de migrar.
- Investigacion sobre cuantizacion NVFP4 en MoE: el modelo sirve como caso de estudio de cuantizacion selectiva (solo expertos) y de su impacto (9,5 % RMSE) en la calidad final.
- Prototipado de pipelines multimodales con contexto de 16.384 tokens: adecuado para tareas que requieren combinar imagen y texto en ventanas moderadas, como analisis de documentos o descripcion de imagenes con contexto adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 23 GB de pesos en NVFP4, mas overhead de activaciones, cache KV y torre de vision en bf16; se recomienda al menos 32 GB de VRAM para el ejemplo de despliegue con `--max-running-requests 4` y contexto de 16.384.
- GPU recomendadas: NVIDIA B200 (SM100) para kernels FP4 nativos de FlashInfer TRT-LLM; NVIDIA H100/H200 (SM90) con backend Marlin como fallback.
- Cabe en GPU consumer: no disponible; el modelo base en bf16 ocupa 66 GB, y aunque la version NVFP4 reduce los pesos a 23 GB, los kernels FP4 requieren arquitecturas Blackwell o el fallback Marlin en Hopper, por lo que no se confirma soporte en RTX 4090 u otras consumer.
- Opciones de despliegue: SGLang con la bifurcacion `Akicou/sglang@clover-vl` (rama `clover-vl`), imagen Docker `lmsysorg/sglang:v0.5.23`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clover-Preview-VL-NVFP4 | 21.015 M | 16.384 | NVFP4 (expertos) + bf16 | Apache 2.0 | Hugging Face, requiere SGLang bifurcado |
| Clover-Preview-VL (base) | no disponible | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (MoE multimodal con difusion para lenguaje) en la documentacion proporcionada.

## Limitaciones y advertencias

- Dependencia de una bifurcacion no oficial de SGLang (`Akicou/sglang@clover-vl`): no funciona con la version estandar de SGLang ni con otros motores de inferencia convencionales.
- Requiere hardware Blackwell para el rendimiento optimo; en Hopper el fallback Marlin puede ofrecer menor throughput.
- Error de cuantizacion de aproximadamente 9,5 % RMSE en los expertos respecto a la fuente bf16, lo que puede degradar ligeramente la calidad frente al modelo original.
- El modelo base es un checkpoint "Preview", lo que sugiere posible inestabilidad o cambios futuros.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion, idiomas soportados ni restricciones adicionales de licencia mas alla de Apache 2.0.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del funcionamiento.
- La longitud de contexto de 16.384 aparece solo en el ejemplo de despliegue; no se confirma como limite maximo del modelo.
- Uso comercial permitido por Apache 2.0, pero la dependencia de kernels y bifurcaciones especificas puede complicar el soporte en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/kaivoss/Clover-Preview-VL-NVFP4
- Modelo base: https://huggingface.co/kaivoss/Clover-Preview-VL
- Bifurcacion de SGLang con soporte CLOVER: https://github.com/Akicou/sglang/tree/clover-vl
- Imagen Docker de SGLang: `lmsysorg/sglang:v0.5.23`
