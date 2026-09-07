# fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int8-gs64-sym

## Resumen

Falcon3-3B-Instruct de TII (Technology Innovation Institute) es un modelo de lenguaje instructivo de tipo decoder-only basado en la arquitectura Llama. Esta variante, desarrollada por fbaldassarri, es una cuantización INT8 de solo pesos (weights-only quantization) realizada con Intel AutoRound v0.13.1, que emplea el algoritmo SignRound con group size de 64 y cuantización simétrica. El objetivo es reducir el tamaño del modelo y acelerar la inferencia en hardware Intel, incluyendo CPUs, iGPUs Arc y NPUs AI Boost de los procesadores Core Ultra. Con 1.458.306.048 parámetros según los safetensors, el modelo cuantizado ofrece una alternativa ligera para desplegar asistentes conversacionales en entornos con recursos limitados. La licencia Apache 2.0 permite su uso comercial, aunque el autor indica que se ha desarrollado solo con fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo Llama) |
| Parametros totales | 1.458.306.048 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8, group size 64, simétrica (AutoRound/SignRound, solo pesos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 5,8 GB |

## Arquitectura y entrenamiento

El modelo base, Falcon3-3B-Instruct, es un transformer decoder-only con arquitectura similar a Llama (RoPE, GQA, etc.). La cuantización se realizó con Intel AutoRound v0.13.1, que aplica el algoritmo SignRound para cuantizar solo los pesos a 8 bits, con group size de 64 y cuantización simétrica. El proceso de calibración se ejecutó en CPU con torch.bfloat16, utilizando 128 muestras, 200 iteraciones, una secuencia de 512 tokens y batch size de 4. La duración total del proceso de cuantización fue de 17631,8 segundos (293,9 minutos). No se han proporcionado detalles sobre los datos de entrenamiento del modelo base ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto instructivo y conversacional en inglés, siguiendo el formato de chat integrado (chat template) de transformers.
- Compatible con la biblioteca transformers, usando `AutoModelForCausalLM` y `AutoTokenizer`.
- Cuantización INT8 que mantiene la calidad del modelo original con un menor consumo de memoria.
- Optimizado para inferencia en hardware Intel: CPU (intel-extension-for-pytorch), iGPU Arc y NPU AI Boost (OpenVINO).
- No se han documentado en la información disponible capacidades de tool calling, agentes, visión, audio, ni soporte multilingüe más allá del inglés.

## Casos de uso

1. Asistente conversacional en dispositivos Intel Core Ultra: gracias a la compatibilidad con OpenVINO, el modelo puede ejecutarse en la NPU AI Boost de portátiles con Core Ultra, ofreciendo un asistente local sin conexión que protege la privacidad de los datos.
2. Inferencia en servidores sin GPU dedicada: al estar cuantizado para CPU Intel y ser compatible con intel-extension-for-pytorch, es adecuado para desplegar servicios de chat en máquinas que no disponen de aceleradores gráficos, reduciendo costes de infraestructura.
3. Investigación en técnicas de cuantización: el modelo sirve como referencia para comparar el método AutoRound INT8 con otras cuantizaciones, como GPTQ INT4, sobre el mismo modelo base Falcon3-3B-Instruct.
4. Prototipado rápido en entornos de desarrollo: con transformers y `device_map="auto"`, se puede cargar en un portátil con CPU o GPU modesta para probar aplicaciones de generación de texto sin necesidad de infraestructura compleja.
5. Aplicaciones de chat en inglés con requisitos mínimos de memoria: al ocupar aproximadamente 1,46 GB en INT8, el modelo puede desplegarse en sistemas embebidos con CPU Intel o mini-PCs, donde el espacio de almacenamiento y la RAM son limitados.
6. Edge computing en sistemas con iGPU Intel Arc: la cuantización está pensada para aprovechar la iGPU Arc, lo que permite ejecutar inferencia en sistemas integrados con gráficos Intel, como kioscos o dispositivos de automatización industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se ha publicado una estimación oficial. Basándose en el tamaño de los pesos (1.458.306.048 parámetros en INT8 ≈ 1,46 GB), se estima que el modelo puede ejecutarse en GPUs con al menos 2 GB de VRAM, más el overhead de activaciones y la caché KV.
- GPU recomendadas: no hay recomendaciones oficiales. El modelo está optimizado para Intel CPU, iGPU Arc y NPU AI Boost. En GPU, cualquier tarjeta con 2-4 GB de VRAM (por ejemplo, RTX 3050 o RTX 4060) podría ejecutarlo, aunque no está documentado.
- Compatibilidad con GPU de consumo: sí, por su tamaño reducido, cabe en GPUs de consumo con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers (documentado), vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (si se convierte). El formato safetensors es compatible con la mayoría de frameworks de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Método de cuantización | Bits | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int8-gs64-sym | AutoRound (SignRound) | 8 | 1.458.306.048 | Apache 2.0 | HuggingFace |
| fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_gptq-int4-gs64-sym | GPTQ | 4 | No disponible | Apache 2.0 (presumible) | HuggingFace |
| fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-sym | GPTQ | 4 | No disponible | Apache 2.0 (presumible) | HuggingFace |

Nota: los dos modelos GPTQ son cuantizaciones del mismo modelo base (Instruct y Base respectivamente) con 4 bits, lo que ofrece un tamaño aún menor, aunque no se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Al ser una cuantización, puede existir una ligera degradación de la calidad de las respuestas respecto al modelo base sin cuantizar.
- Solo se ha documentado soporte para inglés; no se han verificado capacidades multilingües.
- No se han publicado benchmarks que validen el rendimiento del modelo cuantizado, por lo que no se puede evaluar su calidad relativa.
- El autor indica que el modelo se ha desarrollado solo con fines de investigación y no ofrece garantía de ningún tipo.
- La longitud de contexto no está documentada en la información disponible.
- No se han documentado sesgos específicos, pero al ser un modelo generativo, existe riesgo de alucinación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_round-int8-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-3B-Instruct
- Intel AutoRound: https://github.com/intel/auto-round
- AutoRound Pipeline: https://git.epicdynamic.com/auto-round-pipeline
- Modelo comparable (GPTQ INT4 Instruct): https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Instruct-auto_gptq-int4-gs64-sym
- Modelo comparable (GPTQ INT4 Base): https://huggingface.co/fbaldassarri/tiiuae_Falcon3-3B-Base-auto_gptq-int4-gs64-sym
