# Lucebox/Qwen3.8-27B-IQ4_XS-pure-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo Qwen3.8-27B, requantizada por Lucebox a IQ4_XS puro mediante la opción `--pure` de `llama-quantize`. El archivo resultante pesa 13,54 GiB, frente a los 14,50 GiB del IQ4_XS original de bartowski, y está diseñado para maximizar la velocidad de decodificación en GPUs con ancho de banda limitado, como la AMD Radeon AI PRO R9700 (RDNA4) utilizada en las pruebas. La principal ventaja es un incremento de aproximadamente el 12 % en tokens por segundo respecto a la alternativa UD-IQ4_XS de Unsloth, a cambio de una pequeña pero medible pérdida de calidad. Está pensado para entornos de servido donde la latencia es crítica y se puede asumir una ligera degradación en la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B) |
| Parametros totales | 27B (segun denominacion del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | 131072 (segun ejemplo de servido con `--max-ctx`) |
| Tipos de cuantizacion | IQ4_XS puro (requantizado con `--pure`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El archivo es una requantizacion del GGUF IQ4_XS con imatrix de bartowski, aplicando `llama-quantize --allow-requantize --pure`. Esto elimina la mezcla de precisiones que bartowski introduce como salvaguarda de calidad, forzando que todos los tensores sean IQ4_XS puro. El resultado reduce el tamano en aproximadamente 1 GiB y permite que la decodificacion lea menos bytes por token, acelerando el paso por el kernel mas rapido en RDNA4. No se dispone de informacion sobre la arquitectura interna ni el entrenamiento del modelo base Qwen3.8-27B; la ficha se limita a la capa de cuantizacion. El servido recomendado utiliza decodificacion especulativa con el drafter DFlash2 (tambien en GGUF), lo que contribuye a las altas velocidades medidas.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se documentan en esta ficha.
- Decodificacion especulativa: soporta el drafter DFlash2, que acelera la generacion sin alterar los resultados (verificacion exacta).
- Optimizacion para servido: integrado con el servidor `dflash_server` de lucebox, que gestiona el drafter y la cache KV en q8_0.
- Cuantizacion ligera: al ser IQ4_XS puro, cabe en GPUs con 16 GB de VRAM, lo que permite inferencia local en hardware de consumo.
- No se han documentado capacidades especificas de tool calling, agentes o multimodalidad en la informacion disponible.

## Casos de uso

- Inferencia local en GPUs de 16 GB: el archivo de 13,54 GiB cabe en tarjetas como la RTX 4080 o la AMD Radeon AI PRO R9700, permitiendo ejecutar un modelo de 27B en equipos de escritorio sin necesidad de servidores dedicados.
- Servido de baja latencia en produccion: la velocidad de decodificacion de 235,8 tok/s (con DFlash2) lo hace adecuado para aplicaciones interactivas como chatbots o asistentes en tiempo real donde cada milisegundo cuenta.
- Prototipado rapido y desarrollo: al priorizar velocidad sobre calidad, es util para iterar sobre prompts, probar flujos de agente o validar ideas antes de pasar a una cuantizacion de mayor fidelidad.
- Generacion de codigo asistida: con HumanEval pass@1 de 144/164, puede usarse en entornos de desarrollo donde se necesita una respuesta rapida, aunque con una tasa de acierto ligeramente inferior a la UD-IQ4_XS.
- Evaluacion de rendimiento en hardware especifico: su comportamiento medido en RDNA4 sirve como referencia para comparar otras cuantizaciones o configuraciones de servido en GPUs similares.
- Despliegue en entornos con restricciones de memoria: al ser mas pequeno que el IQ4_XS estandar, permite liberar VRAM para otras cargas o aumentar el tamano de la cache KV en el mismo hardware.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor, medidos contra una referencia Q8_0 con 300x512 chunks de wikitext-2 para la divergencia KL, y con HumanEval-164 y GSM8K-200 a traves del servidor con verificacion exacta de especulacion.

| Metrica | Este archivo (pure) | Unsloth UD-IQ4_XS |
|---|---|---|
| Tamano | 13,54 GiB | 13,27 GiB |
| HumanEval decode (DFlash2 block 16) | 235,8 tok/s (pico 257,3) | 208,1 tok/s |
| End-to-end (diez prompts) | 174,5 tok/s | 156,2 tok/s |
| Decodificacion simple | 37,4 tok/s | 32,3 tok/s |
| PPL vs Q8_0 | +1,9 % | +0,7 % |
| KLD media vs Q8_0 | 0,028 | 0,018 |
| Acuerdo top-1 con Q8_0 | 92,0 % | 94,1 % |
| HumanEval pass@1 | 144/164 | 151/164 |
| GSM8K (primeros 200) | 171/200 | 177/200 |

No se han publicado resultados de MMLU u otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al menos 16 GB para el archivo de 13,54 GiB, dejando margen para la cache KV y el drafter.
- GPU recomendada: AMD Radeon AI PRO R9700 (RDNA4) usada en las pruebas; tambien deberia funcionar en GPUs NVIDIA con 16 GB o mas, aunque no se han publicado mediciones.
- Cabe en GPUs de consumo como RTX 4080, RTX 4090 o equivalentes con 16 GB o mas.
- Opciones de despliegue: `dflash_server` de lucebox (recomendado), llama.cpp (para reproduccion y pruebas), y cualquier runtime compatible con GGUF.
- Latencia y throughput: 235,8 tok/s de decodificacion con DFlash2 block 16, 174,5 tok/s end-to-end y 37,4 tok/s en decodificacion simple, medidos en la GPU mencionada.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | HumanEval pass@1 | GSM8K (200) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B IQ4_XS pure (este) | 13,54 GiB | 131072 | 144/164 | 171/200 | Apache 2.0 |
| Qwen3.8-27B UD-IQ4_XS (Unsloth) | 13,27 GiB | 131072 | 151/164 | 177/200 | Apache 2.0 |
| Qwen3.8-27B IQ4_XS (bartowski, original) | 14,50 GiB | no disponible | no disponible | no disponible | Apache 2.0 |

La comparativa se limita a las variantes de cuantizacion del mismo modelo base. No se dispone de datos de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medida: la requantizacion pura incrementa la divergencia KL un 50 % respecto a UD-IQ4_XS (0,028 vs 0,018) y reduce el acuerdo top-1 con Q8_0 en dos puntos porcentuales. En tareas de codigo y matematicas, pierde 7 y 6 problemas respectivamente.
- Riesgo de alucinacion: no se ha evaluado especificamente, pero al ser una cuantizacion agresiva (IQ4_XS) puede aumentar la probabilidad de respuestas inexactas en comparacion con precisiones mayores.
- Limitaciones de contexto: aunque el ejemplo usa 131072 tokens, no se ha verificado el comportamiento del modelo base en contextos extremadamente largos con esta cuantizacion.
- Dependencia del drafter: el rendimiento especulativo depende de la calidad del drafter DFlash2; si no se usa, la velocidad cae a 37,4 tok/s.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de los componentes de terceros (bartowski, Unsloth, DFlash2).
- No se han documentado sesgos especificos del modelo base en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lucebox/Qwen3.8-27B-IQ4_XS-pure-GGUF
- Blog de Lucebox con metodologia completa: https://www.lucebox.com/blog/qwen38-r9700
- Repositorio de lucebox en GitHub: https://github.com/Luce-Org/lucebox
- GGUF original de bartowski: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Pagina de QwenCloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
- Archivo similar de jpetrina: https://huggingface.co/jpetrina/Qwen3.8-27B-IQ4_XS-pure-GGUF
