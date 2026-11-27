# dendriteholdings/Ingot-VI-9B-MLX-2bit

## Resumen

Ingot-VI-9B-MLX-2bit es un modelo de generacion de texto en formato MLX, derivado de Prism ML Ternary Bonsai 2 9B, que ha sido refinado mediante un proceso competitivo en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia que permanece mas proxima a el. El modelo resultante conserva los codigos ternarios del modelo base pero reajusta el resto de pesos para acercarse mas a Qwen3.5-9B, que actua como referencia de calidad.

El modelo tiene 9.410.903.280 parametros y se distribuye como un unico fichero `model.safetensors` de 3,46 GB con un empaquetado de 2,25 bits por peso (codigos de 2 bits con escala fp16 y sesgo por cada bloque de 128 pesos). Utiliza el layout `prism_hadamard_qwen35`, que no es cargable directamente por mlx-lm y requiere la herramienta MTPLX para su servicio como API compatible con OpenAI.

Su relevancia radica en que demuestra un pipeline de cuantizacion extrema (ternaria) validado por una metrica objetiva de divergencia respecto al profesor (KL de 0,07284 frente a 0,07624 del modelo que vencio), lo que lo hace interesante para investigacion sobre compresion de modelos y para despliegue en Apple Silicon con requisitos de memoria muy reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B, con torre de vision y layout prism_hadamard_qwen35) |
| Parametros totales | 9.410.903.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternarios (2,25 bits por peso: codigos de 2 bits, escala fp16 y sesgo por bloque de 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit) |

## Arquitectura y entrenamiento

El modelo parte de Prism ML Ternary Bonsai 2 9B, un transformer de 9B parametros cuantizado de forma ternaria. Sobre esa base, el minero de la subred Ingot reajusto los pesos no ternarios (escalas y sesgos) para minimizar la divergencia respecto a Qwen3.5-9B, manteniendo intactos los codigos ternarios originales. La conversion a MLX es sin perdida: cada bloque de 128 pesos conserva sus codigos ternarios y su escala fp16 como valores afines de 2 bits (escala d, sesgo −d), de modo que cada peso decodifica al mismo numero que usa el kernel gguf.

La innovacion principal no esta en la arquitectura sino en el proceso de seleccion: el validador de Ingot evalua la KL entre las distribuciones del siguiente token del profesor BF16 y las del candidato, ponderando por dominio. El modelo ganador obtuvo KL 0,07284 frente a 0,07624 del rey anterior. La torre de vision, la configuracion, el tokenizer y los vectores de signo de Hadamard provienen del repositorio original de Prism ML y no se modifican en la competicion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3.5-9B.
- Razonamiento y respuesta multi-turno, segun la pipeline declarada (`text-generation`, `conversational`).
- Capacidad de vision: el repositorio incluye la torre de vision de Prism ML, aunque no se detalla su funcionamiento en esta variante.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Decodificacion especulativa: este repositorio no incluye cabecera MTP, por lo que MTPLX decodifica un token por paso.

## Casos de uso

- Despliegue en Apple Silicon con memoria limitada: con 3,46 GB de pesos en 2 bits, el modelo cabe en Macs con 8-16 GB de memoria unificada, lo que permite ejecutar un modelo de 9B en equipos consumer de gama alta.
- Investigacion sobre cuantizacion ternaria: sirve como referencia para estudiar la relacion entre bits por peso y divergencia KL respecto a un profesor BF16, con una metrica publicada y reproducible.
- Evaluacion de pipelines de Bittensor: util para replicar el proceso de seleccion de Ingot, comparando candidatos mediante KL ponderada por dominio.
- Servicio de API compatible con OpenAI en local: mediante `mtplx serve` se puede exponer el modelo en el puerto 8080 y consumirlo desde aplicaciones existentes que usen el esquema OpenAI.
- Prototipado de asistentes conversacionales en entornos sin GPU dedicada: al ejecutarse en MLX sobre Apple Silicon, permite iterar en local sin infraestructura cloud.
- Comparacion de formatos MLX frente a GGUF: el modelo tiene un gemelo GGUF (`Ingot-VI-9B-Q2`) ejecutable en el fork de llama.cpp de Dendrite, lo que permite medir latencia y fidelidad entre ambos backends.
- Docencia y demostraciones de compresion de modelos: el aval de un proceso competitivo con metrica objetiva lo hace util como ejemplo practico de cuantizacion extrema validada.

## Benchmarks y rendimiento

| Metrica | Este modelo | Rey anterior |
|---|---|---|
| KL(profesor ‖ modelo) en la evaluacion ganadora | 0,07284 | 0,07624 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 3,46 GB solo para pesos; con overhead de ejecucion en MLX, se recomienda un minimo de 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente; no esta pensado para GPUs NVIDIA.
- Cabe en consumer GPU: si, en equipos Apple Silicon consumer con 8 GB o mas de memoria unificada.
- Opciones de despliegue: MTPLX (`mtplx serve`), que carga el layout `prism_hadamard_qwen35` y expone una API compatible con OpenAI. mlx-lm no carga este layout directamente. El gemelo GGUF funciona en el fork de llama.cpp de Dendrite.
- Latencia y throughput: no disponibles; el repositorio no incluye cabecera MTP, por lo que la decodificacion es de un token por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-VI-9B-MLX-2bit | 9,41B | no disponible | 2-bit ternaria (2,25 bpw) | no disponible | MLX (MTPLX) |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | 9B (aprox.) | no disponible | 2-bit ternaria | no disponible | MLX |
| dendriteholdings/Ingot-VI-9B-Q2 | 9B (aprox.) | no disponible | 2-bit ternaria | no disponible | GGUF (llama.cpp fork) |
| Qwen3.5-9B (profesor de referencia) | 9B (aprox.) | no disponible | BF16 | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible, lo que impide confirmar si se permite uso comercial.
- Los idiomas soportados no estan documentados; no se puede garantizar cobertura multilingue.
- La longitud de contexto no esta especificada, lo que limita la planificacion de aplicaciones con ventanas largas.
- La cuantizacion ternaria de 2,25 bits por peso introduce degradacion respecto al profesor BF16; la KL de 0,07284 indica una divergencia no nula en la distribucion del siguiente token.
- Riesgo de alucinacion inherente a modelos de 9B cuantizados de forma agresiva; no se han publicado evaluaciones de fidelidad factual.
- No incluye cabecera MTP, por lo que no se beneficia de decodificacion especulativa y el throughput sera menor que el de variantes con draft head.
- Requiere MTPLX para cargarse; mlx-lm no soporta el layout `prism_hadamard_qwen35`, lo que anade una dependencia de herramienta externa.
- El modelo proviene de un proceso competitivo de subred (Bittensor) con 0 descargas y 1 like en el momento de la ficha, lo que implica poca validacion comunitaria independiente.
- No se han publicado sesgos conocidos ni resultados de benchmarks estandar, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-VI-9B-MLX-2bit
- Modelo base (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Gemelo GGUF del mismo autor: https://huggingface.co/dendriteholdings/Ingot-VI-9B-Q2
- Herramienta MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp
