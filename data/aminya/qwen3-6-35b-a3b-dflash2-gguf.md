# aminya/Qwen3.6-35B-A3B-DFlash2-GGUF

## Resumen

DFlash2-GGUF es la conversión a formato GGUF del modelo borrador (draft model) `incoai/Qwen3.6-35B-A3B-DFlash2`, publicada por el usuario aminya. No se trata de un modelo de chat autónomo, sino de un drafter auxiliar disenado para decodificación especulativa: se empareja con un modelo objetivo compatible de la familia Qwen3.6-35B-A3B y propone candidatos de tokens que el modelo objetivo verifica. El modelo objetivo sigue siendo el responsable de la salida final.

La innovación principal es el uso de difusión por bloques (block diffusion) para proponer candidatos en varias posiciones de token en una sola pasada. Un selector forma una trayectoria de borrador coherente y el modelo objetivo la verifica, de modo que, según el autor del método upstream, se preserva la salida greedy y la distribución de muestreo del modelo objetivo mientras se reduce el trabajo de decodificación. El resultado es una aceleración de la inferencia sin degradar la calidad del texto generado.

El repositorio pesa 3,4 GB e incluye variantes BF16, Q8_0, Q4_K_M, Q5_K_M, Q6_K, IQ4_NL e IQ4_XS. Los pesos en safetensors del modelo fuente suman 526.251.520 parámetros, coherente con el papel de drafter ligero frente al modelo objetivo de 35B. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dflash (block diffusion para decodificacion especulativa), exportada en GGUF |
| Parametros totales | 526.251.520 (safetensors del modelo fuente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M, Q5_K_M, Q6_K, IQ4_NL, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo fuente) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `dflash`, basada en difusión por bloques aplicada a decodificación especulativa. En lugar de generar un único token candidato por paso, el drafter propone candidatos para varias posiciones de token simultáneamente en una sola pasada; un selector construye después una trayectoria de borrador coherente que el modelo objetivo verifica. El export GGUF conserva el tamano de bloque de DFlash2 igual a 8 y los metadatos del tokenizador del modelo fuente.

El método upstream está descrito en el artículo "DFlash: Block Diffusion for Flash Speculative Decoding" (Chen, Liang y Liu, ICML 2026). Según la model card, el diseño busca preservar la salida greedy y la distribución de muestreo del modelo objetivo, reduciendo el trabajo de decodificación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a BF16 GGUF se realizó con beellama.cpp a partir del snapshot `51ef7b6923ad6c14cb1bb41c37a9041446496ab6`, y el resto de cuantizaciones se generaron desde ese BF16 con `llama-quantize`. Las variantes IQ4 se produjeron sin imatrix.

## Capacidades

- Decodificación especulativa: propone candidatos de tokens para varias posiciones en una sola pasada mediante difusión por bloques.
- Aceleración de inferencia: reduce el trabajo de decodificación del modelo objetivo preservando su salida greedy y su distribución de muestreo, según el método upstream.
- Integración con llama.cpp: soporta el tipo de especulación `draft-dflash` con un máximo configurable de tokens de borrador (`--spec-draft-n-max`).
- No es un modelo de chat autónomo: no puede atender peticiones por sí mismo y requiere un modelo objetivo Qwen3.6-35B-A3B compatible.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo propias, ya que la generación final la realiza el modelo objetivo.

## Casos de uso

- Aceleración de servidores de inferencia locales: desplegar `llama-server` con el modelo objetivo Qwen3.6-35B-A3B y este drafter en Q8_0 para reducir la latencia de decodificación en entornos de un solo equipo o estación de trabajo.
- Reducción de coste en producción: en pipelines que ya sirven Qwen3.6-35B-A3B, añadir el drafter permite aumentar el throughput por GPU sin cambiar el modelo generador ni la calidad de la salida.
- Asistentes de código interactivos: la decodificación especulativa reduce el tiempo hasta el primer token útil en autocompletado y generación de parches, donde la latencia percibida es crítica.
- Chat multi-turno de baja latencia: al preservar la distribución de muestreo del objetivo, el drafter es adecuado para aplicaciones conversacionales donde no se aceptan cambios en el estilo ni en la política de respuesta del modelo base.
- Experimentación en investigación: comparar el rendimiento de la difusión por bloques frente a otros drafters especulativos (por ejemplo, drafters autorregresivos) sobre el mismo modelo objetivo.
- Despliegue con recursos limitados: las variantes Q4_K_M (315 MB) e IQ4_XS (293 MB) permiten incorporar el drafter en entornos con poca VRAM adicional disponible junto al modelo objetivo.
- Evaluación de infraestructura: medir la tasa de aceptación de tokens del drafter y ajustar `--spec-draft-n-max` para optimizar la relación entre velocidad y memoria en cada hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM adicional para el drafter: aproximadamente 0,3 GB en IQ4_XS, 0,31 GB en IQ4_NL, 0,31 GB en Q4_K_M, 0,38 GB en Q5_K_M, 0,44 GB en Q6_K, 0,57 GB en Q8_0 y 1,06 GB en BF16, según los tamanos de fichero publicados.
- VRAM total: debe sumarse a la del modelo objetivo Qwen3.6-35B-A3B, cuyos requisitos no se detallan en la información disponible.
- GPU recomendadas: no disponible de forma específica; el despliegue depende del modelo objetivo y del soporte de llama.cpp para decodificación especulativa DFlash.
- GPU de consumo: el drafter en cuantizaciones Q4/IQ4 ocupa menos de 0,5 GB, por lo que el factor limitante será siempre el modelo objetivo, no el drafter.
- Opciones de despliegue: llama.cpp (`llama-server`) con soporte de DFlash y los parámetros `--spec-draft-model`, `--spec-type draft-dflash` y `--spec-draft-n-max`. No se documenta soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible; dependen de la tasa de aceptación del drafter y del hardware del modelo objetivo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-DFlash2-GGUF (este) | Drafter especulativo (block diffusion) | 526.251.520 | no disponible | Apache-2.0 | GGUF | Hugging Face (aminya) |
| incoai/Qwen3.6-35B-A3B-DFlash2 | Drafter especulativo (modelo fuente) | 526.251.520 | no disponible | Apache-2.0 | safetensors | Hugging Face (incoai) |
| Qwen3.6-35B-A3B (objetivo) | Modelo generativo objetivo | 35B totales (A3B) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros drafters especulativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede responder peticiones por sí mismo; requiere un modelo objetivo Qwen3.6-35B-A3B compatible.
- La aceleración depende de la tasa de aceptación de tokens del drafter; en dominios muy distintos a los del entrenamiento del objetivo, la ganancia puede reducirse.
- Las variantes IQ4_NL e IQ4_XS se generaron sin imatrix, lo que puede afectar ligeramente a la calidad de la propuesta de tokens frente a las cuantizaciones con calibración.
- No se documentan idiomas soportados ni sesgos conocidos; la cobertura lingüística efectiva la determina el modelo objetivo.
- Riesgo de alucinación: recae en el modelo objetivo, ya que el drafter solo propone candidatos que el objetivo verifica.
- Requiere una build de llama.cpp con soporte de decodificación especulativa DFlash; las builds estándar sin ese soporte no podrán cargar el modelo como drafter.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo objetivo con el que se empareje.
- Los metadatos indican `inference: false` en el repositorio, coherente con su papel de componente auxiliar y no de servicio independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aminya/Qwen3.6-35B-A3B-DFlash2-GGUF
- Modelo fuente: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Implementación de DFlash: https://github.com/z-lab/dflash
- beellama.cpp (herramienta de conversión): https://github.com/Anbeeld/beellama.cpp
