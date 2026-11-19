# ilyazayts/llm-course-hw3-tinyllamma-qlora

## Resumen

`ilyazayts/llm-course-hw3-tinyllamma-qlora` es un modelo publicado en Hugging Face por el usuario ilyazayts, presumiblemente como parte de un ejercicio practico de un curso sobre modelos de lenguaje (el identificador incluye "llm-course-hw3", es decir, "homework 3"). El nombre sugiere un ajuste fino mediante QLoRA sobre TinyLlama, un modelo transformer decoder-only de aproximadamente 1,1 mil millones de parametros desarrollado originalmente por el proyecto TinyLlama. Se trata, por tanto, de un derivado de un modelo base pequeno, no de un modelo entrenado desde cero.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluacion tecnica: la model card es la plantilla generica autogenerada por Hugging Face y no contiene informacion sustantiva sobre datos de entrenamiento, hiperparametros, evaluacion ni licencia. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, y no declara pipeline, idiomas ni licencia. Todos los datos no confirmados se marcan explicitamente como "no disponible".

A pesar de la escasez de informacion, el modelo resulta representativo de un caso de uso frecuente: el ajuste fino eficiente en memoria de un LLM pequeno con cuantizacion de 4 bits y adaptadores LoRA, ejecutable en hardware de consumo. Esta ficha documenta lo que se puede afirmar con certeza y senala las lagunas que un evaluador deberia cubrir antes de considerar su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido del nombre "tinyllama"; no confirmado en la model card) |
| Parametros totales | no disponible (el modelo base TinyLlama tiene aproximadamente 1,1 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TinyLlama base: 2048 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (el nombre indica entrenamiento con QLoRA, cuantizacion de 4 bits durante el ajuste) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de transformers; probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La unica informacion tecnica deducible proviene del nombre del repositorio. "tinyllamma" apunta a TinyLlama, un transformer decoder-only con atencion causal, RoPE y normalizacion RMSNorm, de aproximadamente 1,1 mil millones de parametros, preentrenado sobre unos 3 billones de tokens segun la documentacion publica de dicho proyecto. "qlora" indica que el ajuste fino se realizo con Quantized Low-Rank Adaptation: el modelo base se carga cuantizado a 4 bits (tipicamente NF4) y solo se entrenan adaptadores de bajo rango, lo que reduce drasticamente los requisitos de VRAM.

No hay informacion en la model card sobre el dataset de ajuste, el numero de pasos, la tasa de aprendizaje, el rango de los adaptadores, la composicion de los datos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documenta si los adaptadores se fusionaron con los pesos base o si se distribuyen por separado. Todo ello debe considerarse no disponible.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base TinyLlama (no verificada para este ajuste concreto).
- Razonamiento basico y respuesta a instrucciones, presumiblemente adquiridos mediante el ajuste fino; el alcance real es no disponible.
- Soporte de tool calling o function calling: no disponible; los modelos de este tamano rara vez lo incorporan de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; TinyLlama se entreno predominantemente en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se declaran en la model card.

## Casos de uso

- Experimentacion educativa: reproduccion del flujo completo de ajuste fino con QLoRA sobre un modelo pequeno, util para aprender el pipeline de cuantizacion, entrenamiento de adaptadores y publicacion en el Hub.
- Prototipado rapido en local: generacion de texto de baja latencia en una GPU de consumo para validar ideas de producto antes de invertir en modelos mayores.
- Pruebas de integracion con transformers: verificacion de que un checkpoint derivado carga correctamente con `AutoModelForCausalLM` y `AutoTokenizer` en pipelines de CI.
- Generacion de texto acotada y no critica: resumenes breves, reformulaciones o completado de plantillas donde los errores se revisan manualmente.
- Base para nuevos ajustes: punto de partida para experimentos de destilacion o para comparar tecnicas de PEFT sobre un mismo modelo de referencia.
- Docencia y evaluacion de riesgos: analisis de sesgos y alucinaciones en modelos pequenos ajustados con datos no documentados, como caso de estudio de gobernanza de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de aproximadamente 1,1 mil millones de parametros, una cuantizacion de 4 bits ocupa del orden de 0,7-0,9 GB de pesos, y en fp16 alrededor de 2,2 GB, sin contar la cache KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia bastar en cuantizacion de 4 bits; A100 o H100 no son necesarias para este tamano.
- GPU de consumo: previsiblemente cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida, aunque no hay confirmacion del autor.
- Opciones de despliegue: transformers (libreria declarada); llama.cpp, Ollama, vLLM o TGI solo si existen conversiones a GGUF u otros formatos, que no se documentan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ilyazayts/llm-course-hw3-tinyllamma-qlora | no disponible (base ~1,1 B) | no disponible | no disponible | Hugging Face, 0 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | ~1,1 B | 2048 tokens | Apache 2.0 (segun su model card publica) | Hugging Face, ampliamente utilizado |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 tokens | Apache 2.0 (segun su model card publica) | Hugging Face |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8192 tokens | Apache 2.0 (segun su model card publica) | Hugging Face |

La comparacion con los modelos de referencia se basa en sus model cards publicas; los datos de este repositorio concreto no permiten una comparacion de rendimiento porque no se han publicado evaluaciones.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin informacion sobre sesgos, datos de entrenamiento ni evaluacion; no es posible auditar el modelo.
- Riesgo elevado de alucinacion, inherente a los modelos de aproximadamente 1,1 mil millones de parametros y agravado por la falta de documentacion del ajuste.
- Licencia no declarada: no se puede asumir uso comercial permitido; el modelo base TinyLlama se distribuye bajo Apache 2.0, pero el autor no confirma la licencia de este derivado.
- Idiomas no declarados; es probable que el modelo tenga un rendimiento muy limitado en castellano si el ajuste se realizo solo en ingles.
- Longitud de contexto no confirmada; si se mantiene la del modelo base, 2048 tokens, resulta insuficiente para tareas de contexto largo.
- Cero descargas y cero interacciones: no hay evidencia de uso ni de validacion por parte de la comunidad.
- No apto para produccion sin una evaluacion propia previa: no hay benchmarks, ni pruebas de robustez, ni garantias de calidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ilyazayts/llm-course-hw3-tinyllamma-qlora
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de TinyLlama: https://arxiv.org/abs/2401.02385
- Modelo base de referencia: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Referencia de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
