# SargeDev/Arete-27B-Uncensored-EXL3

## Resumen

Arete-27B-Uncensored-EXL3 es una variante "abliterated" (sin mecanismos de rechazo) del modelo NousResearch/Arete-27B, publicada por el usuario SargeDev en Hugging Face. Arete-27B es, segun la model card, un ajuste fino supervisado (SFT) de parametros completos sobre Qwen3.8-27B orientado a alineacion de valores. Esta version elimina la direccion de rechazo mediante la herramienta OBLITERATUS en modo agresivo, con el objetivo declarado de que el modelo responda a peticiones que el original rechazaria.

El artefacto publicado no son los pesos originales en precision completa, sino una cuantizacion EXL3 de 4.0 bits por peso (cabeza a 6 bpw y tensores MTP a 4 bpw) pensada para el motor ExLlamaV3. El repositorio ocupa 15,7 GB y el recuento real de parametros en los safetensors es de 7.863.204.864 (~7,86 mil millones), un dato que entra en conflicto con la denominacion "27B" del nombre y del modelo base, y que conviene tener en cuenta al planificar el despliegue.

La relevancia de esta ficha es doble: por un lado documenta un caso de "abliteration" sobre un modelo alineado, con las puertas de calidad declaradas por el autor (coherencia, divergencia KL y perplejidad); por otro, ilustra los riesgos de trazabilidad en la cadena de derivados (cuantizaciones comunitarias, discrepancias de tamano y ausencia de benchmarks independientes). No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, tag `qwen3_5_text`); incluye tensores MTP/nextn para decodificacion especulativa |
| Parametros totales | 7.863.204.864 (~7,86 mil millones, segun safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw (cabeza 6 bpw, MTP 4 bpw); el autor menciona variantes comunitarias GGUF, EXL3 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, para ExLlamaV3) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.8, segun los tags del repositorio (`qwen3_5_text`). El modelo base, NousResearch/Arete-27B, es segun la model card un SFT de parametros completos sobre Qwen3.8-27B orientado a alineacion de valores. Sobre esa base, SargeDev aplico OBLITERATUS con `--method aggressive` en bf16, usando un conjunto de contraste de 842 prompts de dano/no dano, y realizo una ablacion de la direccion de rechazo en 15 capas fuertes (las 59-63 son las mas afectadas).

El autor declara puertas de calidad medidas tras la edicion: coherencia 1.0, divergencia KL de 0,90 frente al base, y perplejidad que sube de 3,22 a 3,93 (incremento calificado de modesto), con la suite de capacidades intacta. Tambien indica que se preservaron los tensores del drafter MTP/nextn con la cabeza estandar de Qwen3.8, de modo que la decodificacion especulativa sigue funcionando. No se detalla la composicion del dataset de entrenamiento original ni el numero de tokens utilizados; no se menciona RLHF ni DPO. La publicacion es una cuantizacion EXL3 del resultado, no los pesos bf16.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B segun la model card.
- Respuesta a peticiones que el modelo alineado rechazaria: el autor reporta 15/15 en una bateria de 15 prompts duros (desarrollo de exploits, red-team, malware, DoS) en bf16, y 14-15/15 en variantes cuantizadas comunitarias.
- Decodificacion especulativa mediante los tensores MTP/nextn preservados (cabeza estandar de Qwen3.8).
- Capacidades de codigo y matematicas: no disponibles de forma explicita en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).
- Vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para medir el efecto de la ablacion de la direccion de rechazo, comparando las metricas declaradas (KL 0,90, perplejidad 3,22 a 3,93) frente al base alineado.
- Red teaming autorizado: equipos de seguridad pueden emplearlo en entornos controlados para generar cargas de prueba y evaluar defensas, dado que el autor reporta entrega en 15/15 prompts de explotacion, malware y DoS.
- Evaluacion de robustez de filtros y moderacion: permite comprobar si los sistemas de clasificacion de contenido detectan respuestas que un modelo alineado bloquearia.
- Pruebas de decodificacion especulativa: al conservar los tensores MTP/nextn, es util para validar pipelines de spec-decode en ExLlamaV3 con pesos EXL3 de 4 bpw.
- Benchmarking de cuantizacion: la publicacion facilita comparar la calidad de EXL3 4.0 bpw frente a bf16 y frente a las variantes GGUF y NVFP4 mencionadas por el autor.
- Despliegue en GPUs de consumo para experimentacion: con ~7,86 mil millones de parametros reales y un repositorio de 15,7 GB en EXL3 de 4 bits, el modelo es manejable en tarjetas de 24 GB para pruebas locales no productivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos cuantitativos aportados por el autor son las puertas de calidad internas y la bateria de cumplimiento:

| Metrica | Valor declarado |
|---|---|
| Coherencia | 1,0 |
| Divergencia KL vs base | 0,90 |
| Perplejidad (base) | 3,22 |
| Perplejidad (tras ablacion) | 3,93 |
| Bateria de cumplimiento (bf16) | 15/15 |
| Bateria de cumplimiento (variantes comunitarias) | 14-15/15 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio EXL3 4.0 bpw ocupa 15,7 GB, por lo que se necesita al menos esa cantidad mas el overhead de contexto y cache KV; con 24 GB de VRAM hay margen para contextos moderados.
- GPU recomendadas: no disponibles de forma explicita; por tamano del artefacto, tarjetas de 24 GB o mas (RTX 3090, RTX 4090, A100, H100) son las candidatas razonables.
- GPU de consumo: si cabe en tarjetas de 24 GB; en tarjetas de 16 GB el margen es muy ajustado y depende de la longitud de contexto.
- Opciones de despliegue: ExLlamaV3 es el motor objetivo del formato EXL3; el autor menciona variantes comunitarias en GGUF (compatibles con llama.cpp y Ollama) y NVFP4, aunque no se enlazan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SargeDev/Arete-27B-Uncensored-EXL3 | ~7,86 mil millones (segun safetensors) | no disponible | EXL3 4.0 bpw | apache-2.0 | Abliterated sobre Arete-27B; sin benchmarks publicos |
| NousResearch/Arete-27B | no disponible | no disponible | no disponible | no disponible | Modelo base alineado; SFT de Qwen3.8-27B |
| SargeDev/JEV-27B-Uncensored | no disponible | no disponible | no disponible | apache-2.0 | Otra abliteracion del mismo autor sobre backbone Qwen3.8-27B |
| SargeDev/JEV-27B-VL-Uncensored-EXL3 | no disponible | no disponible | EXL3 3-bit | apache-2.0 | Variante multimodal del mismo autor |

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo es intencionada: el modelo respondera a peticiones de desarrollo de exploits, malware y DoS, segun la propia model card. No es apto para despliegues orientados al publico sin capas de moderacion externas.
- La perplejidad sube de 3,22 a 3,93 tras la ablacion, lo que indica una degradacion medible de la calidad del modelado del lenguaje, aunque el autor la califica de modesta.
- Discrepancia de tamano: el nombre indica 27B pero los safetensors suman ~7,86 mil millones de parametros. Hay que verificar el artefacto antes de planificar recursos.
- Ausencia total de benchmarks independientes (MMLU, HumanEval, GSM8K u otros): las unicas metricas son autoevaluaciones del autor.
- No se informan idiomas soportados, longitud de contexto ni capacidades de tool calling, lo que limita la evaluacion para uso en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la ablacion puede afectar a la calibracion de las respuestas.
- Sesgos conocidos: no documentados.
- Licencia apache-2.0, que permite uso comercial, pero la responsabilidad legal sobre el contenido generado por un modelo sin rechazos recae en el desplegador.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La model card cita "Qwen3.8-27B" como base, una denominacion que no se corresponde con ninguna familia publica verificable en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SargeDev/Arete-27B-Uncensored-EXL3
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Variante relacionada del mismo autor: https://huggingface.co/SargeDev/JEV-27B-Uncensored
- Variante multimodal del mismo autor: https://huggingface.co/SargeDev/JEV-27B-VL-Uncensored-EXL3
