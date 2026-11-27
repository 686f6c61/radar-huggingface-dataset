# hletrd/Raon-1-mini-Uncensored-MLX-4bit

## Resumen

Raon-1-mini Uncensored MLX 4-bit es una variante modificada del modelo KRAFTON/Raon-1-mini, un transformer de arquitectura MoE (mezcla de expertos) desarrollado originalmente por KRAFTON. Esta version, publicada por el usuario hletrd, aplica una tecnica de "abliteracion" (eliminacion de la direccion de rechazo en los pesos) y convierte el modelo a cuantizacion 4-bit para su uso con MLX, el framework de Apple para inferencia en silicio unificado. El modelo resultante elimina practicamente toda negativa a responder peticiones, con una tasa de rechazo del 0,0% en HarmBench frente al 99,0% del modelo original.

El modelo conserva la arquitectura y capacidades del Raon-1-mini original, con 28.779 millones de parametros totales y un contexto declarado de 256K tokens. La modificacion afecta a 1.955 tensores: se elimina una direccion por capa en las proyecciones de salida de atencion y en las proyecciones down de expertos enrutados y compartidos de las capas 6 a 20, asi como en los vectores de "effort-steering" de las capas 12, 14, 16, 18 y 20. La cabeza de salida y el embedding permanecen inalterados.

Es relevante ahora porque ofrece una alternativa sin censura para investigacion sobre alineamiento, red-teaming y estudios de comportamiento de modelos, empaquetada especificamente para hardware Apple con MLX. Su licencia Apache 2.0 facilita el uso comercial, aunque la naturaleza "uncensored" plantea consideraciones eticas y de seguridad importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capas RDA (segun model card) |
| Parametros totales | 28.779.029.222 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (segun tabla de hardware de la model card) |
| Tipos de cuantizacion | 4-bit affine (group size 64); expertos enrutados en 4-bit con proyecciones down en 6-bit; atencion, capas RDA, expertos compartidos, capa densa, embedding y LM head en 8-bit; puertas del router MoE en BF16 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizado 4-bit |

## Arquitectura y entrenamiento

El modelo base es KRAFTON/Raon-1-mini, un transformer con arquitectura MoE que incorpora capas denominadas RDA y un mecanismo de "effort steering" (vectores de control de esfuerzo en las capas 12, 14, 16, 18 y 20). El modelo tiene 28.779 millones de parametros totales y soporta un contexto de 256K tokens. Dispone de un modo de razonamiento ("thinking") activado por defecto, que puede desactivarse mediante configuracion de la plantilla de chat.

Esta variante concreta no ha sido reentrenada: se parte de los pesos MXFP8 publicados por KRAFTON, dequantizados a BF16, y se aplica una edicion de pesos tipo abliteracion. Se elimina una direccion de rechazo por capa, medida en cada capa con los canales 1031 y 189 puestos a cero, en las proyecciones de salida de atencion y en las proyecciones down de expertos enrutados y compartidos de las capas 6 a 20, ademas de los vectores de effort-steering de las capas 12, 14, 16, 18 y 20 (1.955 tensores en total). Posteriormente se cuantiza con esquema affine y group size 64. El codigo del modelo es el `raon_mlx_model.py` de KRAFTON/Raon-1-mini-mlx, incluido sin cambios. No se dispone de informacion sobre el dataset de entrenamiento original, numero de tokens ni procesos de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Modo de razonamiento ("thinking") activado por defecto, desactivable mediante `--chat-template-config '{"enable_thinking": false}'`.
- Arquitectura MoE con expertos enrutados y compartidos, lo que permite activar solo una fraccion de parametros por token (parametros activos no disponibles).
- Soporte de contexto largo de hasta 256K tokens.
- Respuestas sin rechazo practicamente total (0,0% en HarmBench y 0,0% en Alpaca con thinking desactivado).
- No se ha documentado soporte explicito de tool calling, function calling ni capacidades de agente en la informacion disponible.
- No se ha documentado soporte de vision ni audio.
- Capacidades multilingues limitadas a coreano e ingles segun los metadatos.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento del modelo, comparando respuestas con el modelo original (99,0% de rechazo) frente a esta variante (0,0%), util para analizar mecanismos de negativa en LLMs.
- Red-teaming y evaluacion de robustez: sirve como modelo "sin restricciones" para generar ataques, prompts adversarios y casos limite que permitan evaluar las defensas de otros sistemas.
- Inferencia local en hardware Apple: con 19,9 GB en 4-bit, se ejecuta en un Mac Studio M5 Max de 36 GB de memoria unificada con contexto de 256K, lo que facilita despliegues locales sin GPU dedicada.
- Analisis de sesgos y contenido sensible: al no rechazar peticiones, permite generar y estudiar respuestas del modelo ante temas delicados, util en auditorias de sesgo y estudios academicos sobre contenido nocivo.
- Generacion de texto creativo sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los modelos convencionales aplican rechazos.
- Experimentacion con cuantizacion y MLX: sirve como caso de estudio de tecnicas de cuantizacion mixta (4-bit, 6-bit, 8-bit y BF16 en un mismo modelo) y de su impacto en divergencia KL y acuerdo top-1 frente al modelo BF16.
- Procesamiento de documentos largos en coreano e ingles: el contexto de 256K permite resumir o analizar contratos, informes o corpus extensos en ambos idiomas.

## Benchmarks y rendimiento

Los datos de la model card comparan esta variante con el modelo original MLX 4-bit frente a Raon-1-mini BF16 (pesos MXFP8 dequantizados a BF16):

| Modelo | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Chequeo 33 items | HarmBench rechazados | Alpaca rechazados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Uncensored MLX 4-bit | 19,90 GB | 0,058109 | 90,24% | 0,022455 | 92,94% | 0,022447 | 92,08% | 32/33 (BF16: 32/33) | 0,0% | 0,0% |
| Original MLX 4-bit (Xylolabs) | 19,90 GB | 0,054306 | 90,46% | 0,016844 | 93,55% | 0,019319 | 92,82% | 32/33 (BF16: 32/33) | 99,0% | 1,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,9 GB para la variante 4-bit; 30,6 GB para la variante 8-bit (hletrd/Raon-1-mini-Uncensored-MLX-8bit).
- Hardware objetivo: Apple Silicon con memoria unificada. La model card cita Mac Studio M5 Max (36 GB, 40-core GPU) y Mac Studio M5 Ultra (96 GB a 512 GB).
- Cabe en consumer hardware Apple de gama alta: Mac Studio M5 Max con 36 GB ejecuta la version 4-bit con contexto de 256K.
- No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en la informacion disponible; el formato es MLX, no GGUF ni safetensors estandar para vLLM/TGI.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.chat` con `mlx==0.32.4`, `mlx-lm==0.32.2` y `transformers==5.20.1`; requiere `--trust-remote-code`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rechazo HarmBench | Disponibilidad |
|---|---|---|---|---|---|---|
| hletrd/Raon-1-mini-Uncensored-MLX-4bit | 28,78B | 256K | 4-bit MLX | Apache 2.0 | 0,0% | Hugging Face |
| Xylolabs/Raon-1-mini-MLX-4bit | 28,78B | 256K | 4-bit MLX | Apache 2.0 | 99,0% | Hugging Face |
| KRAFTON/Raon-1-mini (BF16/MXFP8) | 28,78B | 256K | BF16 / MXFP8 | Apache 2.0 | no disponible | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base documentadas en la informacion proporcionada; no se dispone de datos de modelos alternativos de otros desarrolladores para comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo implica que el modelo respondera practicamente a cualquier peticion, incluido contenido nocivo, ilegal o eticamente cuestionable; no debe desplegarse en produccion orientada a usuarios sin filtros externos.
- La divergencia respecto al modelo BF16 es ligeramente superior a la del cuantizado original (KL de WikiText-2 de 0,058 frente a 0,054; top-1 de 90,24% frente a 90,46%), lo que indica una pequena perdida adicional de fidelidad.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones especificas de veracidad.
- Idiomas limitados a coreano e ingles; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo sin censura puede contravenir normativas locales o terminos de servicio de plataformas; la responsabilidad recae en el desplegador.
- Requiere `--trust-remote-code` y codigo personalizado de KRAFTON, lo que implica ejecutar codigo de terceros.
- Solo funciona con MLX en Apple Silicon; no hay soporte documentado para CUDA, vLLM, llama.cpp ni Ollama.
- El modelo "piensa" por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva el modo thinking.
- No se dispone de informacion sobre sesgos especificos, composicion del dataset de entrenamiento ni procesos de alineamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Raon-1-mini-Uncensored-MLX-4bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Version MLX del modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Version MLX 4-bit original: https://huggingface.co/Xylolabs/Raon-1-mini-MLX-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de la herramienta de cuantizacion (Xylolabs): https://github.com/XylolabsInc/tensix-bfp-gptq
