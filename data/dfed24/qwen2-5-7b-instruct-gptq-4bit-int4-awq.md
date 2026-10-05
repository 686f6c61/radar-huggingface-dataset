# dfed24/Qwen2.5-7B-Instruct-gptq-4bit-int4-awq

## Resumen

dfed24/Qwen2.5-7B-Instruct-gptq-4bit-int4-awq es una copia cuantizada a 4 bits de Qwen/Qwen2.5-7B-Instruct, publicada por Domenic Federico (Cal Poly San Luis Obispo) con la colaboración de M. Federico en el port a PyTorch/CUDA. No es un modelo entrenado desde cero: es un checkpoint de posentrenamiento cuantizado en el formato AutoAWQ GEMM (4 bits, tamaño de grupo 64, asimétrico con puntos cero enteros), pensado para que los kernels `awq` y `awq_marlin` de vLLM lo carguen directamente sin conversión adicional.

El problema que resuelve es de despliegue: reduce la huella de un modelo de 7,6 mil millones de parámetros hasta aproximadamente 4-5 GB de pesos, lo que permite servirlo en GPUs de 24 GB (o incluso menos) manteniendo la calidad cerca del fp16. Según las mediciones del autor en una NVIDIA A10G con vLLM 0.29, la perplejidad en WikiText-2 pasa de 7,145 (fp16) a 7,288, y el pass@1 en HumanEval de 70,1% a 67,1%.

Su relevancia es limitada pero concreta: la receta de cuantización empleada (`mlx-gptq`) aplica redondeo con realimentación de error, ajuste de rejilla alternante y refinamiento por descenso de coordenadas, y obtiene mejores números que el AWQ oficial de Qwen en la misma caja y protocolo. Es un artefacto muy reciente, con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), pesos cuantizados en formato AWQ GEMM |
| Parametros totales | 7.615.616.512 (7,62 B), dato real de los safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no indicada en la model card; el modelo base Qwen2.5-7B-Instruct declara 131.072 tokens en su documentacion publica |
| Tipos de cuantizacion | 4 bits AWQ (GEMM layout), group size 64, asimetrica con puntos cero enteros; embeddings y cabeza de salida conservados en fp16 |
| Idiomas soportados | no disponible (la model card no los enumera; el modelo base declara soporte multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AutoAWQ GEMM), compatible con kernels `awq` / `awq_marlin` de vLLM |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-7B-Instruct, un transformer decoder-only denso. Este repositorio no modifica la topologia: solo sustituye los pesos lineales por versiones cuantizadas a 4 bits. El autor indica que la conversion al formato final altera los pesos un 0,05% en media relativa gracias a que cada offset de grupo se restringe desde el principio a un numero entero de pasos (de ahi los "integer zero points"), lo que evita un segundo error de redondeo al reempaquetar.

No hay entrenamiento ni ajuste fino adicional. El proceso es de cuantizacion posentrenamiento con la receta de github.com/dfed25/mlx-gptq: redondeo con realimentacion de error (estilo GPTQ), ajuste de rejilla alternante, refinamiento por descenso de coordenadas y un refit ponderado en la metrica de capa. El checkpoint se genero con un port a PyTorch/CUDA escrito por M. Federico, con los flags `--mse --lloyd --refine 3 --refit 2 --int-zero`, a un coste de unos 7 minutos por capa en una unica A10G. La calibracion uso 128 fragmentos de 512 tokens del conjunto de entrenamiento de WikiText-2. Los embeddings y la cabeza de salida se mantienen en fp16. El autor declara explicitamente que el desarrollo se apoyo en Claude (Anthropic) como asistente de codigo e investigacion.

## Capacidades

Las capacidades funcionales son las heredadas del modelo base Qwen2.5-7B-Instruct; la model card de este repositorio no las enumera de forma explicita:

- Generacion de texto conversacional multi-turno con plantilla de chat instruct.
- Generacion y autocompletado de codigo (el autor mide pass@1 en HumanEval, 110/164 problemas resueltos).
- Razonamiento y matematicas a nivel de modelo instruct de 7 B, con la degradacion propia de una cuantizacion a 4 bits.
- Soporte de tool calling / function calling segun el modelo base (no verificado en este checkpoint por el autor).
- Capacidades multilingues heredadas del modelo base (idiomas concretos: no disponibles en esta ficha).
- Contexto largo, segun la ventana declarada por el modelo base (no validada en esta cuantizacion).
- Modo "thinking" o vision: no disponible; no se menciona ningun modo de razonamiento extendido ni entrada multimodal.

## Casos de uso

- Servicio de chat autohospedado de bajo coste: con ~4-5 GB de pesos, el modelo cabe en una sola GPU de 24 GB junto con una cache KV de varios miles de tokens, lo que permite atender conversaciones multi-turno en una unica A10G o RTX 4090 sin recurrir a APIs externas.
- Despliegue en vLLM con kernels Marlin: el repositorio esta construido especificamente para el camino `awq_marlin`, de modo que se puede arrancar con un unico comando y obtener el rendimiento de los kernels int4 en GPUs Ampere o superiores.
- Generacion de codigo en pipelines internos: con un pass@1 declarado de 67,1% en HumanEval, es adecuado para autocompletado, generacion de tests o refactors asistidos, no tanto para sustitucion autonoma de revision humana.
- Clasificacion y extraccion de informacion sobre documentos largos: la ventana heredada del modelo base permite procesar contratos, informes o transcripciones y devolver campos estructurados.
- Asistente de atencion al cliente con recuperacion aumentada: al ser un modelo de 7 B cuantizado, el coste por token es bajo y permite ejecutar recuperacion, reordenacion y generacion en la misma GPU.
- Prototipado e investigacion en entornos con una sola GPU: util para comparar estrategias de cuantizacion contra el fp16 y el AWQ oficial de Qwen en la misma maquina y con el mismo protocolo.
- Evaluacion de pipelines de agentes: al conservar el formato de chat instruct del modelo base, sirve para probar bucles de razonamiento multi-paso con llamadas a herramientas en un entorno de desarrollo local.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en una NVIDIA A10G con vLLM 0.29 (`awq_marlin`), una ejecucion y una semilla por fila, mismo equipo y protocolo:

| Modelo | WikiText-2 (perplejidad) | HumanEval pass@1 |
|---|---|---|
| fp16 (referencia) | 7,145 | 70,1% (115/164) |
| **este modelo** | **7,288** | **67,1% (110/164)** |
| AWQ 4-bit oficial de Qwen | 7,583 | 64,6% (106/164) |

Advertencias del propio autor sobre estos numeros: el texto de calibracion (128 x 512 tokens del conjunto de entrenamiento de WikiText-2) es del mismo dominio que el test de perplejidad, lo que favorece a este modelo en aproximadamente 0,3 puntos (medido en el modelo hermano de 1,5 B). El error estandar de HumanEval con 164 problemas es de unos 3,6 puntos, por lo que la diferencia entre los dos modelos de 4 bits no es estadisticamente significativa. La perplejidad se calculo sobre las 20 primeras ventanas no solapadas de 2048 tokens del test de WikiText-2, puntuadas a traves del kernel de servicio. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB solo para pesos (el repositorio completo ocupa 5,7 GB, incluyendo embeddings y cabeza en fp16). Hay que sumar la cache KV, que crece de forma lineal con el contexto.
- GPU recomendadas: NVIDIA A10G (usada por el autor para las mediciones), A100, H100, L40S. En la practica cualquier GPU Ampere o posterior con soporte de kernels int4.
- Consumer GPU: si. Cabe con holgura en RTX 4090, RTX 4080, RTX 3090 y RTX 4070 Ti (12-24 GB). En tarjetas de 8 GB el modelo entra, pero con poca cache KV disponible, lo que limita el contexto util.
- Opciones de despliegue: vLLM con `--quantization awq_marlin --dtype float16` (ruta validada por el autor). Al estar en formato AutoAWQ GEMM tambien deberia cargar con AutoAWQ/AutoGPTQ, aunque no se ha verificado en la informacion disponible. No se indica conversion a GGUF, por lo que llama.cpp y Ollama no estan soportados tal cual.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni tiempos de primera token en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | WikiText-2 (ppl) | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dfed24/Qwen2.5-7B-Instruct-gptq-4bit-int4-awq | 7,62 B | AWQ 4 bits, grupo 64, zero points enteros | 7,288 | 67,1% | Apache 2.0 | HuggingFace, 0 descargas, sin validacion externa |
| Qwen2.5-7B-Instruct (fp16) | 7,62 B | ninguna | 7,145 | 70,1% | Apache 2.0 | HuggingFace, ampliamente usado |
| AWQ 4-bit oficial de Qwen | 7,62 B | AWQ 4 bits | 7,583 | 64,6% | Apache 2.0 | HuggingFace, referencia establecida |
| dfed24/Qwen2.5-1.5B-Instruct-gptq-4bit-int4-awq | ~1,5 B | AWQ 4 bits, misma receta | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | HuggingFace, modelo hermano de menor tamano |

No se dispone de datos en la informacion proporcionada para comparar con alternativas de otros fabricantes (Llama 3.1 8B, Mistral 7B, Gemma 2 9B) bajo el mismo protocolo.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: la perplejidad sube de 7,145 a 7,288 y el pass@1 de HumanEval cae 3 puntos respecto al fp16, aunque esta ultima diferencia no es estadisticamente significativa con 164 problemas.
- Los benchmarks del autor tienen sesgo de dominio: la calibracion procede del conjunto de entrenamiento de WikiText-2, el mismo corpus usado para medir perplejidad. Una unica ejecucion y una unica semilla por fila.
- Sesgos conocidos del modelo base: no se documentan en esta model card, pero se heredan los del Qwen2.5-7B-Instruct original, que no han sido auditados en este checkpoint.
- Riesgo de alucinacion: inherente a un modelo instruct de 7 B, y potencialmente algo mayor tras la cuantizacion. No apto para uso clinico, legal o financiero sin verificacion humana.
- Idiomas soportados: no disponibles en la model card. Conviene validar el idioma objetivo antes de desplegar.
- Contexto: la ventana no se declara en este repositorio y no ha sido validada tras la cuantizacion; los kernels int4 pueden comportarse de forma distinta a fp16 en contextos muy largos.
- Compatibilidad: el checkpoint esta en formato AutoAWQ GEMM. No hay version GGUF publicada, por lo que no se puede ejecutar directamente en llama.cpp u Ollama sin convertir.
- Madurez: 0 descargas y 0 likes, creado y actualizado con 10 segundos de diferencia. No hay validacion independiente ni issues abiertos que permitan juzgar su robustez en produccion.
- Licencia: Apache 2.0, permisiva para uso comercial, con la obligacion habitual de conservar avisos de copyright y licencia. Al derivar del modelo base, siguen aplicando las condiciones de Qwen.
- Atribucion: la model card declara el uso de Claude (Anthropic) como asistente de codigo e investigacion, dato relevante para equipos con politicas internas sobre herramientas de IA generativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dfed24/Qwen2.5-7B-Instruct-gptq-4bit-int4-awq
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo hermano de 1,5 B: https://huggingface.co/dfed24/Qwen2.5-1.5B-Instruct-gptq-4bit-int4-awq
- Receta de cuantizacion (mlx-gptq): https://github.com/dfed25/mlx-gptq
- Contacto del autor: domfederico21@gmail.com (Domenic Federico, Cal Poly San Luis Obispo)
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada.
