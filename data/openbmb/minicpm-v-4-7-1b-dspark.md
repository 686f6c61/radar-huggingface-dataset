# openbmb/MiniCPM-V-4.7-1B-DSpark

## Resumen

MiniCPM-V-4.7-1B-DSpark es un checkpoint *draft* (borrador) desarrollado por OpenBMB para decodificación especulativa (speculative decoding) mediante el método DSpark, disenado para emparejarse de forma exacta con el modelo objetivo MiniCPM-V-4.7-1B y su tokenizer. No es un modelo autonomo de proposito general, sino un componente auxiliar de inferencia: predice varios tokens por paso hacia delante para que el modelo objetivo los verifique en paralelo, acelerando la generacion sin alterar la distribucion de salida.

El checkpoint contiene 213.547.777 parametros en 5 capas *draft*, con precision BF16, y propone hasta 15 tokens por paso hacia delante. Se apoya en los estados ocultos de las capas `[3, 7, 11, 15, 19]` del modelo objetivo, lo que le permite condicionar sus predicciones a representaciones intermedias del modelo grande. La arquitectura base del modelo objetivo es de tipo Qwen3 con modulo de vision (tags `qwen3`, `minicpmv`), orientada a generacion de texto y comprension visual en dispositivo (*on-device*, *edge-ai*).

Su relevancia actual es practica: la decodificacion especulativa es una de las tecnicas mas eficaces para reducir latencia en inferencia de modelos multimodales pequenos desplegados en entornos con recursos limitados. DSpark reporta longitudes de aceptacion medias de entre 3,37 y 5,89 tokens segun dominio, lo que se traduce en aceleraciones sustanciales en el numero de tokens generados por paso de verificacion. La licencia Apache 2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer *draft* para decodificacion especulativa (DSpark), emparejado con MiniCPM-V-4.7-1B (base Qwen3 con modulo de vision) |
| Parametros totales | 213.547.777 (5 capas *draft*) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el *draft*; el comando de servicio del modelo objetivo usa `--max-model-len 40960` |
| Tipos de cuantizacion | BF16 en el checkpoint original; version GGUF disponible en `openbmb/MiniCPM-V-4.7-1B-DSpark-gguf` (tipos concretos no disponibles) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo separado |
| Tokens propuestos por paso | 15 |
| Capas ocultas del objetivo utilizadas | `[3, 7, 11, 15, 19]` |
| Precision del checkpoint | BF16 |
| Tamano del repo | 0.9 GB |

## Arquitectura y entrenamiento

El modelo es un *draft* de decodificacion especulativa compuesto por 5 capas transformer que consumen los estados ocultos de las capas 3, 7, 11, 15 y 19 del modelo objetivo MiniCPM-V-4.7-1B. En cada paso hacia delante propone hasta 15 tokens candidatos, que el modelo objetivo verifica en paralelo; los tokens aceptados se incorporan a la secuencia y los rechazados se descartan, preservando la equivalencia distribucional con la decodificacion estandar. El checkpoint se distribuye en BF16 y requiere el tokenizer exacto del modelo objetivo para funcionar correctamente.

El entrenamiento utilizo 2 millones de secuencias durante 6 epocas con el optimizador AdamW. Las respuestas de entrenamiento fueron generadas por el propio MiniCPM-V-4.7-1B a partir de una mezcla de prompts de vision y texto, es decir, destilacion sobre trazas del modelo objetivo. La funcion de perdida combina entropia cruzada (CE), una perdida L1 y una perdida de confianza, orientadas respectivamente a la precision de los tokens propuestos, al ajuste de las representaciones y a la calibracion de la aceptacion. La evaluacion usa terminacion natural por EOS y `max_new_tokens=8192`.

## Capacidades

- Generacion especulativa de tokens: propone hasta 15 tokens por paso hacia delante para su verificacion por MiniCPM-V-4.7-1B.
- Aceleracion de inferencia multimodal: cubre tanto dominios de vision (MMMU, MathVista, CharXiv, OCRBench) como de texto (matematicas, codigo, general).
- Integracion con vLLM mediante `--speculative-config` con `"method":"dspark"` y `num_speculative_tokens: 15`.
- Compatibilidad con llama.cpp a traves del repositorio GGUF separado.
- Soporte de *thinking mode* en el modelo objetivo (el ejemplo de servicio desactiva `enable_thinking`), no una capacidad propia del *draft*.
- No realiza tool calling, agentes ni comprension visual por si mismo: hereda el comportamiento del modelo objetivo que acelera.

## Casos de uso

- Despliegue de MiniCPM-V-4.7-1B en produccion con baja latencia: configurar el *draft* en vLLM con `num_speculative_tokens: 15` reduce el numero de pasos de verificacion necesarios para generar la misma salida, lo que se traduce en menor tiempo hasta el primer token completo y mayor throughput en entornos con `--max-num-seqs 1`.
- Asistentes multimodales en dispositivo (*edge*): al emparejarse con un modelo de 1B en formato GGUF, permite acelerar la generacion en CPU o GPU de gama baja manteniendo la calidad del modelo objetivo.
- Procesamiento OCR y documentos: con una longitud de aceptacion de 4,752 en OCRBench, es adecuado para pipelines de extraccion de texto donde predominan salidas largas y predecibles.
- Razonamiento matematico y cientifico: la aceptacion de 5,891 en matematicas de texto y 4,333 en MathVista lo hace util en aplicaciones de resolucion de problemas paso a paso con decodificacion larga.
- Generacion de codigo asistida: con aceptacion de 5,347 en codigo, acelera autocompletado y generacion de fragmentos en IDE o pipelines de CI/CD que invoquen al modelo objetivo.
- Investigacion sobre decodificacion especulativa: sirve como referencia reproducible para estudiar el metodo DSpark, sus perdidas (CE + L1 + confianza) y el impacto de usar estados ocultos intermedios del objetivo.
- Servicio de chat multimodal de bajo coste: combinado con `--max-model-len 40960` en el objetivo, permite conversaciones multi-turno con contexto largo a menor coste por token generado.

## Benchmarks y rendimiento

Los datos publicados corresponden a longitud de aceptacion (*accept length*), definida como tokens de completado totales divididos entre pasos de verificacion especulativa, con terminacion natural por EOS y `max_new_tokens=8192`.

| Dominio | Conjunto | Longitud de aceptacion |
|---|---|---|
| Vision | MMMU | 3,452 |
| Vision | MathVista | 4,333 |
| Vision | CharXiv_reasoning_val | 4,452 |
| Vision | OCRBench | 4,752 |
| Texto | Math | 5,891 |
| Texto | Code | 5,347 |
| Texto | General | 3,370 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible; el *draft* no se evalua por calidad propia, sino por la aceptacion de sus propuestas.

## Requisitos de hardware

- VRAM estimada para el *draft*: aproximadamente 0,43 GB en BF16 (213,5 M de parametros), adicional a la del modelo objetivo MiniCPM-V-4.7-1B.
- El modelo objetivo se sirve en el ejemplo con `--max-model-len 40960`, `--max-num-batched-tokens 40960` y `--max-num-seqs 1`, lo que sugiere despliegues de una sola secuencia y memoria de KV cache acotada.
- GPU recomendadas: no especificadas por el autor; por el perfil *on-device* y el tamano del objetivo (1B), es apto para GPU de consumo y entornos *edge*. No hay datos concretos de A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: el *draft* por si solo ocupa menos de 1 GB en BF16; el modelo objetivo de 1B es igualmente desplegable en GPU de gama media-baja, aunque no se detallan modelos concretos.
- Opciones de despliegue: vLLM (con backend `FLASH_ATTN` y `--speculative-config` de tipo `dspark`) y llama.cpp mediante el repositorio GGUF.
- Latencia y throughput: no disponibles de forma absoluta; la metrica publicada es la longitud de aceptacion (3,37 a 5,89 tokens por paso de verificacion), que implica reducciones proporcionales en el numero de pasos necesarios.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-DSpark | *Draft* DSpark para MiniCPM-V-4.7-1B | 213,5 M (5 capas) | no disponible (objetivo: 40960) | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| MiniCPM-V-4.7-1B | Modelo objetivo multimodal | no disponible en la informacion | 40960 (segun comando de servicio) | Apache 2.0 (segun tags del ecosistema) | Hugging Face |
| Otros *drafts* de decodificacion especulativa (EAGLE, Medusa) | Metodos alternativos | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros metodos de decodificacion especulativa en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona emparejado con MiniCPM-V-4.7-1B y su tokenizer exacto; usarlo con otro modelo o tokenizer invalida la verificacion.
- Las longitudes de aceptacion son medias por dominio; en dominios generales (3,370) la aceleracion es menor que en matematicas (5,891).
- Idiomas limitados a ingles y chino; no se declara soporte de castellano.
- Riesgo de alucinacion y sesgos heredado del modelo objetivo, ya que las propuestas se generan a partir de sus estados ocultos y de datos destilados de el.
- El autor declara que las salidas pueden ser inexactas, sesgadas u ofensivas y manipulables mediante *jailbreaks*; las respuestas sobre politica, salud, finanzas y derecho no estan revisadas por expertos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se entrega "AS IS" sin garantias; el usuario debe configurar sus propias salvaguardas y etiquetar el contenido generado por IA cuando sea exigible.
- El ejemplo de vLLM usa `enable_adaptive_verification: false`; no se documenta el comportamiento con verificacion adaptativa activada.
- No hay datos publicados sobre latencia absoluta ni throughput en hardware concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-DSpark
- Version GGUF: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B-DSpark-gguf
- Modelo objetivo: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Paper DSpark: https://arxiv.org/abs/2607.05147
