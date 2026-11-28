# 1bit-MONSTER/ZR1-1.5B-GGUF

## Resumen

ZR1-1.5B-GGUF es un conjunto de conversiones cuantizadas del modelo Zyphra/ZR1-1.5B, un modelo de razonamiento de pequeno tamano (1.777 millones de parametros) desarrollado por Zyphra y entrenado con aprendizaje por refuerzo sobre problemas verificados de codigo y matematicas. Este repositorio, publicado por 1bit-MONSTER, no contiene pesos nuevos: empaqueta el modelo original en formato GGUF con ocho niveles de cuantizacion distintos y anade un contenedor especifico para aceleradores NPU (formato Q4NX), pensado para el motor de inferencia propietario del autor.

La relevancia practica del repositorio esta en su rigor metodologico: cada archivo se ha medido contra los logits del modelo BF16 de referencia mediante divergencia KL sobre ventanas de wikitext-2, y el autor documenta explicitamente que ZR1 es sensible a la cuantizacion. Solo el nivel Q8_0 cumple el umbral de calidad declarado (KLD medio <= 0.03 y coincidencia top-1 >= 95 %), mientras que las variantes de 4 bits y menores degradan notablemente la fidelidad. Esto convierte al repositorio en una referencia util para quien necesite desplegar un modelo de razonamiento pequeno en hardware modesto sin perder demasiada calidad.

El modelo base emplea la arquitectura Qwen2ForCausalLM y un tokenizador con tokens especiales de estilo DeepSeek en lugar de ChatML, un detalle critico para la integracion correcta en pipelines de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 1.777.088.000 (1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q4_0, Q3_K_M, Q2_K; contenedor NPU Q4NX (tiles Q4_K con tensores de mayor precision a 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF y Q4NX (contenedor NPU) |

## Arquitectura y entrenamiento

El modelo base ZR1-1.5B utiliza la arquitectura Qwen2ForCausalLM, un transformer decoder-only denso de 1.777 millones de parametros. Segun la model card del repositorio, fue entrenado con aprendizaje por refuerzo (RL) sobre problemas verificados de codigo y matematicas, lo que lo orienta hacia tareas de razonamiento paso a paso. El tokenizador emplea tokens especiales de estilo DeepSeek (por ejemplo `<｜begin▁of▁sentence｜>`) en lugar de la plantilla ChatML habitual en la familia Qwen, un detalle que condiciona como deben construirse los prompts.

La model card del repositorio indica que el modelo base Zyphra/ZR1-1.5B registra a su vez `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` como modelo de partida, por lo que la cadena de derivacion es DeepSeek-R1-Distill-Qwen-1.5B -> ZR1-1.5B -> estas cuantizaciones. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles del proceso de RL. El repositorio de cuantizacion documenta el proceso de conversion: `convert_hf_to_gguf.py` con `--outtype bf16` seguido de `llama-quantize` para cada nivel, y `tools/gguf_to_q4nx.py --dtype8` para el contenedor NPU.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones.
- Razonamiento paso a paso orientado a problemas de matematicas.
- Generacion y comprension de codigo.
- Razonamiento multi-paso derivado del entrenamiento con RL sobre problemas verificados.
- Despliegue en CPU, GPU y NPU mediante el motor 1bit (ruta GGUF y ruta Q4NX).
- Compatibilidad con cualquier cargador GGUF estandar (llama.cpp, llama-server, Lemonade).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Cobertura multilingue: no disponible.

## Casos de uso

- Razonamiento matematico asistido en entornos con recursos limitados: el modelo puede resolver problemas paso a paso y desplegarse en una sola GPU de consumo con la variante Q8_0 (1.807 MiB), manteniendo la fidelidad de referencia.
- Asistente de programacion local: integrable en editores o CLI mediante llama-server, adecuado para autocompletado y explicacion de fragmentos de codigo sin dependencia de la nube.
- Inferencia en el borde (edge) con NPU: el contenedor Q4NX permite ejecutar el modelo en aceleradores NPU con menor uso de CPU del host por peticion, util en dispositivos empotrados o estaciones con NPU dedicada.
- Prototipado de pipelines de razonamiento: su naturaleza de modelo pequeno entrenado con RL lo hace util para experimentar con cadenas de razonamiento y evaluar tecnicas de prompting sin grandes costes de infraestructura.
- Educacion y tutoria automatizada: generacion de explicaciones paso a paso de problemas matematicos y de logica en entornos docentes con hardware modesto.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye mediciones KLD y top-1 por nivel, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantizacion en modelos de razonamiento.
- Servicio de generacion de texto de baja latencia en CPU: con llama.cpp y la variante IQ4_XS (972 MiB) o Q5_K_M (1.226 MiB) se obtiene un equilibrio razonable entre tamano y calidad para tareas no criticas.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Si incluye mediciones de fidelidad de cuantizacion frente al BF16 de referencia y pruebas de rendimiento del motor 1bit en un equipo Strix Halo:

| Archivo | Tamano | KLD medio vs BF16 | Coincidencia top-1 | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|---|---|
| Q8_0 | 1.807 MiB | 0.0028 | 97.2 % | no disponible | no disponible |
| Q6_K | 1.396 MiB | 0.0195 | 92.9 % | 7350 | 133 |
| Q5_K_M | 1.226 MiB | 0.0398 | 89.8 % | 8006 | 152 |
| Q4_K_M | 1.066 MiB | 0.1274 | 82.2 % | no disponible | no disponible |
| IQ4_XS | 972 MiB | 0.1003 | 85.1 % | 8028 | 175 |
| Q4_0 | 1.017 MiB | 0.2131 | 78.0 % | 8969 | 174 |
| Q3_K_M | 882 MiB | 0.2574 | 75.8 % | 6737 | 164 |
| Q2_K | 718 MiB | 0.8402 | 57.9 % | 3642 | 201 |

Las cifras de pp512/tg128 corresponden a una prueba de humo en Strix Halo con el payload llama.cpp de 1bit OS (HRX0, 2026-11-27, una ventana en una maquina compartida). El autor senala que la ruta NPU reduce el uso de CPU del host por peticion, pero no acelera la decodificacion frente a la ruta host-GEMM con el driver actual.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB para Q8_0, 1,4 GB para Q6_K, 1,2 GB para Q5_K_M, 1,1 GB para Q4_K_M y por debajo de 1 GB para Q3_K_M y Q2_K (mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre para Q8_0; A100, H100 o RTX 4090 sobran para este tamano, pero permiten mayor paralelismo y throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060 en adelante) e incluso en CPU.
- Opciones de despliegue: llama.cpp / llama-server, Lemonade, cualquier cargador GGUF; el motor 1bit para las rutas HRX GPU y NPU (Q4NX).
- Latencia y throughput: en Strix Halo, entre 133 y 201 tok/s de decodificacion segun cuantizacion (tg128) y entre 3.642 y 8.969 tok/s de prefill (pp512).
- Requiere el tokenizador con tokens especiales de estilo DeepSeek; no usar plantilla ChatML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZR1-1.5B (este, cuantizado) | 1.5B | no disponible | MIT | GGUF, Q4NX | Razonamiento RL sobre codigo y matematicas; solo Q8_0 mantiene fidelidad |
| DeepSeek-R1-Distill-Qwen-1.5B (ancestro) | 1.5B | no disponible | MIT (verificar) | safetensors, GGUF | Modelo destilado de R1 sobre Qwen2.5-1.5B; base de ZR1 |
| Qwen2.5-1.5B-Instruct | 1.5B | no disponible | Apache 2.0 (verificar) | safetensors, GGUF | Modelo generalista de instrucciones, sin entrenamiento RL especifico de razonamiento |

La informacion disponible no incluye datos de benchmarks comparativos entre estos modelos, por lo que la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sensibilidad a la cuantizacion: el propio autor documenta que solo Q8_0 cumple el umbral de calidad (KLD <= 0.03, top-1 >= 95 %); Q4_K_M y niveles inferiores degradan notablemente el razonamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, especialmente en tareas fuera de codigo y matematicas.
- Tokenizador no estandar: usa tokens especiales de estilo DeepSeek; enviar prompts con plantilla ChatML produce resultados incorrectos.
- Contexto maximo no documentado en la informacion proporcionada; conviene fijar `-c` de forma conservadora.
- Idiomas soportados no documentados; el rendimiento en castellano no esta verificado.
- Licencia MIT: permite uso comercial, pero se debe mantener la cadena de atribucion (LICENSE-MIT y ATTRIBUTION.md) al redistribuir.
- El contenedor NPU depende del motor 1bit y de drivers especificos; la ruta NPU no acelera la decodificacion con el driver actual.
- Modelo base de 1.5B: capacidad limitada para tareas de razonamiento complejo en comparacion con modelos de mayor tamano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/ZR1-1.5B-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZR1-1.5B
- Ancestro declarado: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Perfil del autor: https://huggingface.co/1bit-MONSTER
- Repositorio del autor: https://github.com/1bit-MONSTER
