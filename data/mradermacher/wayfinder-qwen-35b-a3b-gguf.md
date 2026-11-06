# mradermacher/wayfinder-qwen-35b-a3b-GGUF

## Resumen

Wayfinder-qwen-35b-a3b es un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parámetros totales, segun los datos de safetensors del repositorio. El modelo original fue publicado por el usuario hweller1 en Hugging Face bajo el identificador hweller1/wayfinder-qwen-35b-a3b, y esta ficha describe la version cuantizada en formato GGUF producida por mradermacher, un conocido creador de cuantizaciones estaticas para llama.cpp y derivados.

El repositorio que nos ocupa (mradermacher/wayfinder-qwen-35b-a3b-GGUF) contiene unicamente pesos cuantizados, no el modelo original. Segun la model card, se han generado las cuantizaciones x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 e IQ4_XS. El repositorio ocupa 153,4 GB, lo que refleja el conjunto completo de ficheros GGUF para un modelo de 35.500 millones de parametros.

La relevancia de esta publicacion es practica: permite ejecutar un modelo MoE de ~35B en hardware de consumo mediante cuantizaciones agresivas (Q2_K, Q3_K_M, IQ4_XS), algo inviable con los pesos originales en safetensors. No obstante, la informacion disponible sobre el modelo base es muy limitada: no se especifican licencia, idiomas, arquitectura detallada ni datos de entrenamiento, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun el sufijo "a3b" del nombre; detalles no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el sufijo "a3b" sugiere ~3B activos, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); pesos originales en safetensors en el repo del autor |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. El nombre "qwen-35b-a3b" indica que deriva de la familia Qwen y que emplea una arquitectura Mixture of Experts con aproximadamente 35.000 millones de parametros totales y, presumiblemente, alrededor de 3.000 millones de parametros activos por token (convencion "a3b" habitual en modelos MoE tipo Qwen). Esta configuracion permite un coste de computo por token mucho menor que un modelo denso de 35B, lo que explica el interes en cuantizarlo para inferencia local.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El proceso de cuantizacion documentado en la model card indica `convert_type: hf` y `quantize_version: 2`, lo que confirma que las cuantizaciones se generaron a partir de los pesos en formato Hugging Face del modelo original mediante la herramienta de cuantizacion de llama.cpp.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" del repositorio indica que el modelo esta ajustado para dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades esperables en un modelo derivado de Qwen, aunque no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que el formato GGUF es compatible con los endpoints de inferencia de Hugging Face.

## Casos de uso

- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q3_K_M o IQ4_XS, el modelo puede ejecutarse en una GPU de consumo con 24 GB de VRAM (por ejemplo, RTX 4090) usando llama.cpp u Ollama, permitiendo prototipado sin depender de la nube.
- Asistente conversacional autoalojado: la orientacion conversacional del modelo lo hace adecuado para chatbots internos en entornos con requisitos de privacidad, donde los datos no pueden salir de la infraestructura propia.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes (desde Q2_K hasta Q8_0 y f16), lo que permite medir la degradacion de calidad frente al ahorro de memoria en un mismo modelo MoE.
- Experimentacion en investigacion: util para estudiar el comportamiento de modelos MoE de ~35B bajo cuantizacion agresiva, comparando perplejidad y calidad de generacion entre niveles de cuantizacion.
- Servicio de inferencia con vLLM o TGI: las cuantizaciones de mayor precision (Q8_0, f16) pueden servirse en GPU de datacenter (A100 80 GB, H100) para cargas de produccion con throughput alto.
- Integracion en pipelines de CI/CD para pruebas de regresion de modelos: permite validar prompts y respuestas sin coste de API, usando el binario de llama.cpp en runners con GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero y cuantizacion):
  - Q2_K: en torno a 13-14 GB.
  - Q3_K_M: en torno a 16-17 GB.
  - Q4_K_M: en torno a 21-22 GB.
  - Q5_K_M: en torno a 25-26 GB.
  - Q6_K: en torno a 29-30 GB.
  - Q8_0: en torno a 38 GB.
  - f16: en torno a 71 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q3_K_M/Q4_K_M; A100 40 GB o 80 GB y H100 para Q6_K, Q8_0 y f16; multiples GPU consumer (2x RTX 3090/4090) para cuantizaciones altas.
- Cabe en GPU de consumo: si, con Q2_K a Q4_K_M en tarjetas de 16-24 GB; Q5_K_M y superiores requieren 24 GB o mas, o reparto entre GPU y CPU (offloading).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; para cuantizaciones altas en datacenter, vLLM o TGI si soportan el formato.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B parametros activos (segun la convencion del nombre), se espera un throughput por token notablemente superior al de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| wayfinder-qwen-35b-a3b (GGUF) | 35,5B | no disponible (~3B por nombre) | no disponible | no disponible | GGUF |
| Qwen3-30B-A3B | 30,5B | ~3,3B | 32K-128K (segun variante) | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | ~2,4B | 32K | MIT (codigo) / licencia de modelo | safetensors, GGUF |

Nota: la comparativa con Qwen3-30B-A3B es la mas directa por familia y tamano, pero no se dispone de datos que confirmen la relacion exacta entre wayfinder-qwen-35b-a3b y dicho modelo. Los datos de los modelos comparados provienen de sus fichas publicas y pueden variar segun la version.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (hweller1/wayfinder-qwen-35b-a3b) antes de cualquier despliegue en produccion.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por parte de la comunidad, lo que aumenta el riesgo de pesos defectuosos o de una cuantizacion incorrecta.
- Idiomas no documentados: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del ingles.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin benchmarks publicados no se puede estimar su magnitud.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): degradan la calidad de forma notable, especialmente en tareas de razonamiento y codigo; se recomienda Q4_K_M o superior para uso serio.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin conocer la ventana de contexto real.
- Sesgos: no documentados; un modelo sin model card detallada no permite evaluar sesgos de entrenamiento.
- Trazabilidad limitada: al ser una cuantizacion de un modelo de un autor no verificado, se recomienda validar la integridad de los ficheros GGUF (checksums) antes de usarlos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/wayfinder-qwen-35b-a3b-GGUF
- Modelo original: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b
