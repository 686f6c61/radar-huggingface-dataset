# KRAFTON/Raon-1-mini-mlx

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, publicado bajo licencia Apache 2.0. La variante documentada aquí, `KRAFTON/Raon-1-mini-mlx`, es la conversión a formato MLX de los pesos originales, cuantizada a NVFP4 para su ejecución en Apple Silicon. El modelo cuenta con 28.800 millones de parámetros totales, de los cuales solo 4.300 millones se activan por token, gracias a un enrutado que selecciona 6 de 128 expertos más uno compartido.

La arquitectura es híbrida: 18 de sus 25 capas emplean Raon Delta Attention (RDA), una variante de Kimi Delta Attention que desacopla las compuertas de borrado y escritura, mientras que las 7 restantes usan Gated MLA con caché KV. Esta combinación permite un contexto nativo de 262.144 tokens con un coste de caché reducido, de aproximadamente 8 KiB por token en BF16. El modelo incorpora además Raon-mHC, una optimización de las hyper-connections de DeepSeek que abarata el coste computacional durante el entrenamiento.

Su relevancia actual radica en tres factores: un modo de razonamiento con seis niveles de esfuerzo configurables por petición, un rendimiento destacado en conversación multi-turno y tareas agénticas con tool calling, y un enfoque multilingüe que cubre coreano, inglés, japonés, chino, español, francés y tailandés. La licencia Apache 2.0 y la disponibilidad de cuantizaciones MXFP8 y NVFP4 facilitan su despliegue, incluyendo la inferencia en una única GPU RTX 5090 de 32 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida transformer: 18 capas Raon Delta Attention (RDA) + 7 capas Gated MLA |
| Parametros totales | 28,8 B (28.783.240.418) |
| Parametros activos | 4,3 B por token (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (esta variante MLX); MXFP8 y NVFP4 en el modelo base |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 (acceso mediante solicitud, gated) |
| Formato de pesos | safetensors en formato MLX (cuantizado NVFP4) |
| Capas totales | 25 |
| Tamano oculto | 2.560 |
| Cabezas de atencion | 40 (RDA y Gated MLA) |
| Dimension de cabeza | 128 en RDA; 192 QK / 128 V en Gated MLA |
| Rango LoRA Q/KV | 576 / 512 (Gated MLA) |
| Tamano intermedio de experto | 1.088 |
| Tamano intermedio FFN denso (primera capa) | 12.032 |
| Funcion de activacion | SiTU-GLU |
| Conexion residual | Raon-mHC con 4 streams |
| Vocabulario | 259.840 |
| LM Head | Untied |
| Codificacion posicional | NoPE (sin codificacion posicional) |
| Tamano del repositorio | 18,7 GB |

## Arquitectura y entrenamiento

Raon-1 mini se entrenó desde cero por KRAFTON AI. La columna vertebral es un transformer MoE disperso con 25 capas, de las cuales 18 son capas de Raon Delta Attention con estado de tamaño fijo y solo 7 son capas MLA que mantienen caché KV. Esta proporción 3:1 reduce drásticamente el consumo de memoria en contextos largos: el modelo conserva aproximadamente 8 KiB por token en BF16 solo en las capas MLA. La atención usa 40 cabezas con dimensión 128 en RDA y 192 QK / 128 V en Gated MLA, con rangos LoRA de 576 y 512 respectivamente para las proyecciones de query y KV.

La innovación técnica principal es Raon Delta Attention (RDA), que desacopla las compuertas de borrado y escritura de Kimi Delta Attention y mejora el rendimiento en contexto largo respecto a KDA. A esto se suma Raon-mHC, una versión optimizada de las manifold-constrained hyper-connections de DeepSeek que reduce el coste computacional y acelera el entrenamiento. El enrutado MoE activa 6 de 128 expertos más uno compartido, con tamaño intermedio de experto de 1.088 y SiTU-GLU como activación. La primera capa usa un FFN denso de 12.032. No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento con modo thinking integrado y seis niveles de esfuerzo de razonamiento seleccionables por petición: `none`, `low`, `medium`, `high`, `xhigh` y `max`.
- Razonamiento matemático y científico de alto nivel, con resultados destacados en AIME 2026, HMMT Feb 2026 y GPQA Diamond.
- Conversación multi-turno robusta, con liderazgo en el benchmark MultiChallenge (64,9) frente a los MoE comparados.
- Búsqueda y navegación agéntica, con 55,9 en BrowseComp Plus.
- Tool calling y function calling para flujos agénticos, con soporte explícito para Hermes Agent, Pi y OpenCode.
- Ejecución de tareas de ingeniería de software, evaluada en SWE-Verified y GDPVal.
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés, con especial solidez en coreano.
- Decodificación especulativa acelerada mediante el draft model DFlash2 proporcionado por el autor.
- Instrucciones complejas y seguimiento de formato, evaluado en IFBench.
- Contexto largo nativo de hasta 262.144 tokens para documentos extensos y conversaciones prolongadas.

## Casos de uso

- Atención al cliente automatizada en coreano e inglés: el modelo puede gestionar conversaciones multi-turno largas gracias a su ventana de 262.144 tokens y a su rendimiento en MultiChallenge (64,9), manteniendo coherencia en hilos extensos sin degradar el contexto.
- Agentes de búsqueda y research asistido: con 55,9 en BrowseComp Plus y soporte de tool calling, puede orquestar llamadas a motores de búsqueda, navegar por resultados y sintetizar respuestas con citas en flujos multi-paso.
- Automatización de ingeniería de software: su evaluación en SWE-Verified y el soporte de OpenCode permiten integrarlo en pipelines de CI/CD para revisión de parches, generación de tests y resolución de issues con contexto de repositorio completo.
- Razonamiento matemático y científico en entornos educativos o de investigación: los niveles de esfuerzo `high`, `xhigh` y `max` permiten ajustar el coste computacional por consulta, reservando el máximo esfuerzo para problemas de competición tipo AIME u HMMT.
- Asistentes locales en Apple Silicon: esta variante MLX en NVFP4 está pensada para ejecutarse en Macs con chip de Apple, lo que habilita asistentes privados sin conexión para usuarios que no quieren enviar datos a la nube.
- Procesamiento de documentación extensa multilingüe: con contexto de 262.144 tokens y cobertura de siete idiomas, puede resumir contratos, informes técnicos o expedientes completos en una sola pasada, incluyendo documentos mixtos español-coreano.
- Generación de código en producción con function calling: la integración con Hermes Agent y Pi permite construir asistentes que invocan APIs internas, ejecutan comandos y validan resultados dentro de un bucle agéntico controlado.
- Despliegue en una sola GPU consumer: la cuantización NVFP4 del modelo base permite inferencia en una NVIDIA RTX 5090 de 32 GB, lo que facilita prototipado y demos en hardware de escritorio.

## Benchmarks y rendimiento

Los resultados publicados por el autor en la model card son los siguientes. No se dispone de la tabla comparativa completa con los modelos de referencia (Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint 40B-A2.5B, Inkling 2 Mini) porque el contenido de la imagen de highlights no está disponible en texto.

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |
| AA-Omniscience | no disponible en texto |
| IFBench | no disponible en texto |
| SWE-Verified | no disponible en texto |
| GDPVal | no disponible en texto |
| Chatbot Korean (interno) | no disponible en texto |

## Requisitos de hardware

- VRAM estimada para esta variante MLX NVFP4: el repositorio ocupa 18,7 GB, por lo que se necesita memoria unificada suficiente para alojar los pesos más el estado de atención y el contexto. En Apple Silicon, un Mac con 32 GB o más de memoria unificada es el mínimo razonable; 64 GB permite contextos largos con holgura.
- Para el modelo base en NVFP4, el autor indica que cabe en una única NVIDIA RTX 5090 de 32 GB de VRAM.
- GPU recomendadas para el modelo base: RTX 5090 (32 GB) como mínimo para NVFP4; A100 80 GB, H100 80 GB o H200 para BF16/MXFP8 con contexto largo.
- En consumer GPU: sí, en RTX 5090 con NVFP4. En GPUs de 24 GB (RTX 4090) no se garantiza que quepa la variante NVFP4 completa; requeriría cuantizaciones adicionales no publicadas.
- Opciones de despliegue: MLX para Apple Silicon (esta variante); vLLM, TGI o SGLang para el modelo base en GPUs NVIDIA, sujeto a soporte de la arquitectura híbrida RDA/MLA por parte de cada framework; llama.cpp/Ollama no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa con el draft model DFlash2 puede acelerar la generación, pero no se han publicado cifras de tokens por segundo.

## Comparativa con modelos similares

La model card menciona explícitamente cuatro modelos de referencia, pero no se dispone de sus especificaciones completas ni de los valores numéricos de la comparativa en texto. Se indica lo que se conoce:

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Raon-1 mini | 28,8 B | 4,3 B | 262.144 | Apache 2.0 | MoE híbrida RDA/MLA, foco en coreano y agentes |
| Qwen3.6 35B-A3B | 35 B | 3 B | no disponible | no disponible | Referencia de comparación en la model card |
| Gemma 4 26B-A4B | 26 B | 4 B | no disponible | no disponible | Referencia de comparación en la model card |
| Flint (40B-A2.5B) | 40 B | 2,5 B | no disponible | no disponible | Referencia de comparación en la model card |
| Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | Referencia de comparación en la model card |

No se han publicado en la información disponible los valores numéricos de estos modelos en los benchmarks comparados, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El acceso al modelo está restringido mediante un formulario (gated): es necesario solicitar permiso y aceptar los términos de la licencia Apache 2.0 antes de descargar los pesos.
- La variante MLX está cuantizada a NVFP4, lo que puede introducir una pérdida de precisión respecto al modelo base en tareas sensibles al formato o al razonamiento numérico fino.
- No se han publicado datos sobre sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- El rendimiento multilingüe es desigual: el autor destaca coreano como idioma fuerte e inglés como sólido, pero no cuantifica el rendimiento en español, francés, tailandés, japonés o chino.
- La arquitectura híbrida RDA/MLA con NoPE es poco común; el soporte en frameworks de inferencia distintos de MLX puede ser limitado o requerir versiones específicas, lo que afecta a la portabilidad en producción.
- El contexto de 262.144 tokens es nativo, pero el coste de memoria y la latencia crecen con la longitud; no se han publicado mediciones de degradación a longitudes extremas.
- Aunque la licencia es Apache 2.0, el acceso gated y los campos de uso previsto implican que el uso comercial debe declararse en la solicitud.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de contaminación en benchmarks ni la procedencia de los datos.

## Enlaces

- Modelo en Hugging Face (esta variante MLX): https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Modelo base en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
