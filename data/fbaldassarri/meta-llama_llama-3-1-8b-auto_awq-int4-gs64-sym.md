# fbaldassarri/meta-llama_Llama-3.1-8B-auto_awq-int4-gs64-sym

## Resumen

Este repositorio contiene una version cuantizada a 4 bits del modelo meta-llama/Llama-3.1-8B, publicada por el usuario fbaldassarri. No se trata de un modelo nuevo, sino de un artefacto de cuantizacion de pesos (weight-only quantization, WoQ) generado con Intel AutoRound v0.16.0 empleando el algoritmo AWQ (Activation-aware Weight Quantization) en formato auto_awq, con 4 bits, tamano de grupo 64 y cuantizacion simetrica. El objetivo es reducir la huella de memoria y acelerar la inferencia entre 2 y 3 veces respecto al modelo original en bfloat16, con una ligera perdida de precision asumida por el autor.

El modelo base, Llama 3.1 8B, es un transformer decoder-only denso de Meta con 8.030 millones de parametros y una ventana de contexto de 128.000 tokens. Esta version cuantizada conserva la arquitectura y el tokenizador del original, pero almacena los pesos en INT4 con escalas por grupo, lo que reduce el tamano del repositorio a unos 8 GB. El autor indica que el artefacto esta pensado para inferencia en CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel (AI Boost en Core Ultra) via OpenVINO.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantizacion con 22 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni validacion de calidad reportada. Resulta util como referencia para quienes quieran reproducir el pipeline de AutoRound o desplegar Llama 3.1 8B en hardware Intel con recursos limitados, pero no debe confundirse con un modelo entrenado o afinado de forma independiente. La model card marca explicitamente `inference: false` y califica el artefacto como de uso exclusivamente de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) |
| Parametros totales | 8.030 millones en el modelo base; el checkpoint safetensors de este repo declara 2.046.038.016 elementos almacenados (pesos INT4 empaquetados y tensores auxiliares) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B) |
| Tipos de cuantizacion | INT4 weight-only, grupo 64, simetrica, formato auto_awq; calibracion en bfloat16 |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th (segun la model card) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (compatible con transformers); el autor lo etiqueta como auto_awq |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No hay innovaciones arquitectonicas propias de este repositorio; el unico cambio respecto al modelo base es la representacion de los pesos. La cuantizacion se aplico con Intel AutoRound v0.16.0, que combina el algoritmo AWQ con un proceso de ajuste de los parametros de cuantizacion mediante calibracion supervisada por capas. Los hiperparametros registrados son: 128 muestras de calibracion, 200 iteraciones de tuning, longitud de secuencia 512, batch de calibracion 4, dispositivo de calibracion CPU y duracion total de 42.273 segundos (unas 11,7 horas).

No se proporciona informacion sobre el dataset de entrenamiento original de Llama 3.1 8B en este repositorio; ese dato corresponde a la model card de Meta y no se reproduce aqui. Tampoco se documenta ningun proceso de RLHF, DPO o afinado adicional: el artefacto es puramente una transformacion de pesos del checkpoint base. La model card incluye una receta de replicacion completa con el repositorio auto-round-pipeline y un script de Python standalone que invoca AutoRound directamente, lo que permite reproducir la cuantizacion de forma determinista si se dispone de acceso al modelo base y de la version exacta de las dependencias (transformers 4.55.3, torch 2.14.1+cpu).

## Capacidades

- Generacion de texto autoregresiva y completado de texto sin instrucciones: la model card indica explicitamente que es un modelo base/completion y que debe recibir prompts de texto en crudo.
- Razonamiento general, codigo y matematicas heredados de Llama 3.1 8B, sujetos a la degradacion introducida por la cuantizacion INT4 con grupo 64.
- Soporte multilingue para los ocho idiomas declarados: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Capacidad de tool calling y function calling heredada del modelo base, aunque no se valida en esta version cuantizada.
- Compatibilidad con text-generation-inference (etiqueta presente en el repositorio) y con el ecosistema transformers.
- Inferencia optimizada para CPU Intel, iGPU Intel Arc y NPU Intel via OpenVINO o intel-extension-for-pytorch, segun el autor.
- No se declaran capacidades de vision, audio, thinking mode ni agentes multi-paso especificas de esta version.

## Casos de uso

- Despliegue en equipos de sobremesa con CPU Intel sin GPU dedicada: el formato INT4 con grupo 64 reduce el peso del modelo a unos 8 GB, lo que permite cargarlo en memoria RAM convencional y ejecutar inferencia con intel-extension-for-pytorch en portatiles y mini-PC.
- Prototipado rapido de aplicaciones de generacion de texto: al ser un modelo base, sirve para completar prompts, generar documentacion o crear borradores sin necesidad de plantillas de chat, con un coste de infraestructura minimo.
- Evaluacion de pipelines de cuantizacion: el repositorio documenta la receta exacta de AutoRound y las condiciones de ejecucion, por lo que es util como caso de referencia para validar la reproducibilidad de un flujo de cuantizacion INT4 en CPU.
- Inferencia en dispositivos con NPU Intel Core Ultra: el autor indica soporte via OpenVINO, lo que permite ejecutar el modelo en portatiles con acelerador de IA integrado y bajo consumo energetico.
- Generacion de texto multilingue en entornos con recursos limitados: cubre ocho idiomas, incluido espanol, con una ventana de contexto de 128.000 tokens heredada del modelo base para procesar documentos largos.
- Servicio de completado de texto en pipelines de CI o herramientas internas: la integracion con transformers y text-generation-inference facilita montar un endpoint ligero para tareas de autocompletado o resumen sin GPU dedicada.
- Experimentacion academica sobre degradacion por cuantizacion: permite comparar la salida del modelo INT4 frente al bfloat16 original en tareas concretas, aunque el autor no publica esa comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma una aceleracion de 2 a 3 veces respecto al modelo en bfloat16, sin cifras de latencia, throughput ni metricas de calidad (MMLU, HumanEval, GSM8K, perplejidad) que respalden esa afirmacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB en INT4 con grupo 64, segun el tamano del repositorio (8 GB) y el empaquetado de pesos; el autor no publica una cifra exacta.
- GPU recomendadas: no se especifican; el artefacto esta orientado a CPU Intel, iGPU Intel Arc y NPU Intel. Para GPU NVIDIA o AMD seria necesario validar la compatibilidad del formato auto_awq con los kernels correspondientes.
- Cabe en GPU de consumo: si, en teoria, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070), aunque el autor no lo valida y el foco declarado es hardware Intel.
- Opciones de despliegue: transformers con AutoModelForCausalLM, text-generation-inference (etiqueta del repo), intel-extension-for-pytorch para CPU e iGPU Arc, y OpenVINO para NPU Intel. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles; solo se indica un factor de aceleracion de 2-3x frente a bfloat16 sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Llama 3.1 8B AWQ INT4 g64) | 8.030 M (base) | 128.000 | INT4 WoQ, grupo 64, simetrica | Llama 3.1 Community | HuggingFace, 22 descargas |
| meta-llama/Llama-3.1-8B (original) | 8.030 M | 128.000 | bfloat16 / float16 | Llama 3.1 Community | HuggingFace, ampliamente usado |
| Otras cuantizaciones comunitarias de Llama 3.1 8B (GPTQ, AWQ, GGUF) | 8.030 M | 128.000 | INT4/INT8, distintos grupos | Llama 3.1 Community | Multiples repos en HuggingFace |
| Llama 3.1 8B Instruct | 8.030 M | 128.000 | bfloat16 / float16 | Llama 3.1 Community | HuggingFace, con afinado por instrucciones |

La comparacion relevante es frente al modelo base sin cuantizar y frente a otras cuantizaciones comunitarias del mismo checkpoint. No se dispone de datos de rendimiento comparativo publicados para este artefacto concreto, por lo que la eleccion entre esta version y otras alternativas INT4 debe basarse en la validacion empirica propia y en el hardware objetivo (Intel frente a NVIDIA/AMD).

## Limitaciones y advertencias

- Perdida de precision no cuantificada: el autor reconoce una "ligera caida de precision" en W4G64, pero no publica perplejidad ni resultados de benchmarks que permitan medirla.
- Modelo base sin afinado por instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos de chat; requiere prompts de completado en crudo.
- Sesgos heredados del modelo base Llama 3.1 8B, no evaluados ni mitigados en esta version cuantizada.
- Riesgo de alucinacion inherente a los modelos de lenguaje, sin mecanismos adicionales de verificacion.
- La model card declara `inference: false`, lo que sugiere que el autor no garantiza el funcionamiento listo para produccion del artefacto tal como esta publicado.
- Licencia Llama 3.1 Community: impone restricciones de uso comercial (clausula de 700 millones de usuarios mensuales, prohibiciones de uso concretas y obligaciones de atribucion); es necesario revisar el texto completo antes de un despliegue comercial.
- El autor califica el modelo como de uso exclusivamente de investigacion y sin garantia.
- El checkpoint safetensors declara 2.046.038.016 elementos, muy por debajo de los 8.030 millones del modelo base; se trata de pesos empaquetados en INT4 y tensores auxiliares, no de un recuento directo de parametros, pero conviene verificarlo antes de asumir equivalencia con el original.
- Orientado a hardware Intel: el rendimiento en GPU NVIDIA o AMD no esta validado por el autor.
- Sin resultados de benchmarks ni validacion de terceros; el artefacto tiene un historial de uso muy limitado (22 descargas, 0 likes).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-auto_awq-int4-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Pipeline de replicacion citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
