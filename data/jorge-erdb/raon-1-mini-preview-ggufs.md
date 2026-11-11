# jorge-erdb/Raon-1-mini-preview-GGUFs

## Resumen

Raon-1 mini preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por KRAFTON AI y entrenado desde cero. Con 28.800 millones de parámetros totales y 4.300 millones activos por token, se posiciona como un modelo de tamaño medio con arquitectura híbrida de atención que combina capas de atención lineal con capas de atención completa. La versión publicada en este repositorio es una conversión a formato GGUF con cuantizaciones de 4 bits e imatrix, distribuida por el usuario jorge-erdb a partir de los pesos originales de KRAFTON.

El modelo está diseñado para destacar en conversación en coreano y en tareas agénticas, con soporte nativo de razonamiento (thinking mode), tool calling y una ventana de contexto de 262.144 tokens. Su arquitectura incorpora innovaciones propias como Raon Delta Attention (RDA) y Raon-mHC, que reducen el coste computacional del entrenamiento y mejoran el rendimiento en contexto largo.

Esta es una versión preview, no definitiva, y las especificaciones pueden cambiar antes del lanzamiento final. La licencia es Apache 2.0, lo que permite uso comercial, aunque el acceso a los pesos originales está sujeto a un formulario de solicitud (gated). El repositorio GGUF que nos ocupa tiene 36,3 GB de tamaño y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (18 capas RDA + 7 capas Gated MLA) |
| Parametros totales | 28.800 millones (28,8B) |
| Parametros activos | 4.300 millones (4,3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF de 4 bits con imatrix (repositorio); MXFP8 y NVFP4 (modelo original) |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors (modelo original) |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura MoE híbrida de 25 capas con un tamaño oculto de 2.560. De las 25 capas, 18 son de Raon Delta Attention (RDA) con estado de tamaño fijo y solo 7 son capas de Gated MLA que mantienen caché KV, aproximadamente 8 KiB por token en BF16. La atención RDA desacopla las compuertas de borrado y escritura de Kimi Delta Attention, lo que mejora el rendimiento en contexto largo. La conexión residual utiliza Raon-mHC con 4 flujos, una versión optimizada de las manifold-constrained hyper-connections de DeepSeek que reduce el coste computacional y acelera el entrenamiento.

El modelo cuenta con 128 expertos enrutados, de los cuales se activan 6 por token más 1 experto compartido, con un tamaño intermedio de experto de 1.088. La función de activación es SiTU-GLU, el vocabulario es de 259.840 tokens y el LM Head no está atado (untied). No utiliza codificación posicional (NoPE). El modelo fue entrenado desde cero por KRAFTON AI sobre coreano, inglés, japonés, chino, español, francés y tailandés. La información disponible no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento con modo thinking integrado.
- Razonamiento matemático y científico, con resultados destacados en los benchmarks mostrados por el autor.
- Seguimiento de instrucciones y tareas de búsqueda.
- Tool calling para flujos de trabajo agénticos, con soporte para Hermes Agent, Pi y OpenCode.
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés, con especial fortaleza en coreano.
- Decodificación especulativa mediante un modelo draft DFlash2 proporcionado por el autor.
- Conversación multi-turno gracias a la ventana de 262.144 tokens.

## Casos de uso

- Atención al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana y su entrenamiento específico en coreano, lo que lo hace adecuado para mercados de habla coreana.
- Agentes autónomos con tool calling: integrable en frameworks como Hermes Agent, Pi u OpenCode para ejecutar tareas de varios pasos con llamadas a funciones externas.
- Asistencia en razonamiento matemático y científico: el modo thinking integrado permite resolver problemas de matemáticas y ciencia con cadenas de razonamiento explícitas.
- Procesamiento de documentos largos: la arquitectura híbrida con solo 7 capas con caché KV (unos 8 KiB por token en BF16) reduce el coste de memoria en contextos extensos, adecuado para análisis de contratos, informes o código fuente de gran tamaño.
- Despliegue en hardware de consumo: la cuantización NVFP4 del modelo original permite inferencia en una única GPU NVIDIA RTX 5090 con 32 GB de VRAM; las versiones GGUF de 4 bits de este repositorio facilitan su uso en llama.cpp y Ollama.
- Generación de código y tareas de búsqueda: el modelo lidera los benchmarks de seguimiento de instrucciones y búsqueda según el autor, lo que lo hace útil en asistentes de programación y recuperación de información.
- Traducción y contenido multilingüe: cubre siete idiomas, con utilidad para localización de contenido entre coreano, inglés, japonés, chino, español, francés y tailandés.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de benchmarks comparando Raon-1 mini preview con modelos MoE de referencia, pero los datos numéricos concretos no están disponibles en la información proporcionada (la tabla aparece truncada). El autor indica que el modelo lidera en los benchmarks de matemáticas, ciencia, seguimiento de instrucciones y búsqueda mostrados, pero no se pueden reproducir las cifras.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo original en NVFP4 cabe en 32 GB de VRAM (una RTX 5090). Las cuantizaciones GGUF de 4 bits de este repositorio, con 36,3 GB de tamaño total, requieren aproximadamente 18-22 GB de VRAM según la variante exacta y el contexto utilizado.
- GPU recomendadas: NVIDIA RTX 5090 (32 GB) para NVFP4; A100 (40/80 GB) y H100 (80 GB) para los pesos completos en BF16 o MXFP8.
- Cabe en GPU de consumo: sí, en RTX 5090 con NVFP4 y en GPUs con 24 GB o más usando GGUF de 4 bits (RTX 4090, RTX 3090) con contexto reducido.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM y TGI para los pesos originales en safetensors; el modelo es compatible con endpoints (tag endpoints_compatible).
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con el modelo draft DFlash2 puede acelerar la inferencia según el autor, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raon-1 mini preview | 28,8B | 4,3B | 262.144 | Apache 2.0 | Pesos abiertos con acceso bajo solicitud; GGUF en este repo |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de benchmarks ni de especificaciones detalladas de los modelos de comparación incluidos en la model card original, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es una versión preview, no un modelo final: las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo.
- El acceso a los pesos originales está sujeto a un formulario (gated); este repositorio GGUF es una conversión de terceros y no está mantenido oficialmente por KRAFTON AI.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada; el entrenamiento multilingüe puede introducir sesgos culturales y lingüísticos no documentados.
- El rendimiento en español es secundario frente al coreano y el inglés, según la propia model card, que destaca la fortaleza en coreano y capacidades "sólidas" en inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo original requiere aceptar los términos en el formulario de acceso.
- La cuantización a 4 bits puede degradar la calidad respecto a los pesos originales en BF16, MXFP8 o NVFP4.
- El repositorio GGUF no registra descargas ni validación de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jorge-erdb/Raon-1-mini-preview-GGUFs
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Repositorio GitHub del modelo: https://github.com/krafton-ai/Raon-1-mini-preview
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
