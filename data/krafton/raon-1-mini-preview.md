# KRAFTON/Raon-1-mini-preview

## Resumen

Raon-1 mini (preview) es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Con 28,8 mil millones de parámetros totales y 4,3 mil millones activos por token, se posiciona como un modelo de tamano medio con un coste de inferencia bajo, orientado a conversación multilingüe y tareas agénticas. Esta versión es una preview: el autor advierte que las especificaciones y resultados pueden cambiar antes de la versión final.

El modelo destaca por una arquitectura híbrida poco habitual que combina 18 capas de atención lineal (Raon Delta Attention, una variante de Kimi Delta Attention) con solo 7 capas de atención completa (Gated MLA), lo que reduce drásticamente el coste de la caché KV en contextos largos. Soporta de forma nativa hasta 262.144 tokens de contexto y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y cuantizaciones MXFP8 y NVFP4.

Su relevancia actual radica en tres factores: un rendimiento declarado competitivo en razonamiento matemático y científico, soporte de tool calling para flujos agénticos y una cuantización NVFP4 que permite ejecutar el modelo en una única GPU de consumo (RTX 5090 con 32 GB de VRAM). El entrenamiento cubre coreano, inglés, japonés, chino, español, francés y tailandés, con especial énfasis en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 18 capas Raon Delta Attention (lineal) + 7 capas Gated MLA (atención completa) |
| Parametros totales | 28,8 B (28.783.218.402) |
| Parametros activos | 4,3 B (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8, NVFP4 (BF16 como formato base) |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 (acceso bajo solicitud mediante gate en Hugging Face) |
| Formato de pesos | safetensors (librería transformers, custom_code) |

Otros datos técnicos declarados por el autor: 25 capas, tamano oculto de 2.560, 40 cabezas de atención, dimensión de cabeza 128 para RDA y 192 QK / 128 V para Gated MLA, rango LoRA de query/KV de 576/512, tamano intermedio de experto de 1.088, FFN denso de la primera capa de 12.032, función de activación SiTU-GLU, conexiones residuales Raon-mHC con 4 streams, vocabulario de 259.840 tokens, LM head no atada y codificación posicional NoPE.

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer MoE híbrida. De sus 25 capas, 18 usan Raon Delta Attention (RDA), una atención lineal con estado de tamano fijo que desacopla las compuertas de borrado y escritura de Kimi Delta Attention, lo que según el autor mejora el rendimiento en contexto largo respecto a KDA. Las 7 capas restantes usan Gated MLA con caché KV, con un coste aproximado de 8 KiB por token en BF16. El modelo prescinde de codificación posicional (NoPE) y utiliza conexiones residuales Raon-mHC con 4 streams, una versión optimizada de las manifold-constrained hyper-connections de DeepSeek que reduce coste computacional y acelera el entrenamiento.

La capa MoE enruta cada token a 6 de 128 expertos más un experto compartido, activando 4,3 B de los 28,8 B totales. El modelo fue entrenado desde cero por KRAFTON AI; la model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque sí indica los siete idiomas cubiertos. Incorpora razonamiento integrado (thinking mode) y soporte de decodificación especulativa mediante un modelo draft DFlash2 publicado por el mismo autor. No se especifica en la información disponible si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento integrado con modo de pensamiento (thinking) para matemáticas y ciencia.
- Seguimiento de instrucciones y tareas de búsqueda, con resultados líderes declarados frente a los modelos de comparación de la model card.
- Tool calling / function calling para flujos agénticos; soporte explícito de Hermes Agent, Pi y OpenCode.
- Ejecución de agentes y razonamiento multi-paso.
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés, con rendimiento especialmente fuerte en coreano.
- Decodificación especulativa acelerada mediante el draft model DFlash2.
- Inferencia cuantizada en MXFP8 y NVFP4, esta última apta para una RTX 5090.

## Casos de uso

- Atención al cliente automatizada en coreano e inglés: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 262.144 tokens, y su entrenamiento específico en coreano lo hace adecuado para mercados donde la mayoría de modelos abiertos rinden peor.
- Agentes de automatización con herramientas: con soporte de tool calling y compatibilidad con Hermes Agent, Pi y OpenCode, puede integrarse en pipelines que consulten APIs, ejecuten búsquedas o encadenen pasos de razonamiento.
- Asistencia a la programación en IDE o CLI: la integración declarada con OpenCode permite usarlo como backend de un agente de código que lea repositorios completos dentro de la ventana de contexto.
- Procesamiento de documentos largos: contratos, informes o expedientes de cientos de miles de tokens pueden analizarse en una sola pasada gracias al contexto nativo de 262.144 tokens y a la caché KV reducida de las capas lineales.
- Razonamiento matemático y científico asistido: el modo thinking integrado está orientado a problemas de matemáticas y ciencia, útil en herramientas educativas o de análisis técnico.
- Despliegue en estación de trabajo con GPU de consumo: la cuantización NVFP4 permite ejecutar el modelo en una RTX 5090 de 32 GB, lo que habilita prototipos locales de asistentes y agentes sin infraestructura de centro de datos.
- Localización multilingüe: con cobertura de siete idiomas, puede emplearse para traducción y generación de contenido en combinaciones como coreano-español o japonés-inglés.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos frente a modelos MoE de referencia, pero los valores numéricos no están disponibles en la información proporcionada (la tabla aparece truncada en el HTML extraído). El autor declara que Raon-1 mini preview lidera en los benchmarks de matemáticas, ciencia, seguimiento de instrucciones y búsqueda frente a los modelos de comparación, sin que se puedan reproducir aquí las cifras concretas.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, los 28,8 B de parámetros ocupan aproximadamente 57,6 GB, por lo que requiere al menos 64 GB de VRAM (A100 80 GB, H100 80 GB o dos GPU de 48 GB). En MXFP8, el peso ronda los 28,8 GB. En NVFP4, el autor indica que cabe en una única NVIDIA RTX 5090 de 32 GB.
- GPU recomendadas: H100 o A100 80 GB para BF16; L40S o RTX 6000 Ada para MXFP8; RTX 5090 (32 GB) para NVFP4.
- GPU de consumo: sí es viable en la RTX 5090 gracias a NVFP4; en GPU con menos de 32 GB habría que recurrir a cuantizaciones adicionales no publicadas por el autor.
- Opciones de despliegue: transformers (librería declarada, con custom_code), vLLM y TGI como opciones habituales para modelos safetensors; llama.cpp u Ollama requerirían conversión a GGUF, no disponible en la información proporcionada.
- Latencia y throughput: no disponibles. El coste de atención en contexto largo se beneficia del estado fijo de las 18 capas RDA y de la caché KV de solo 7 capas (unos 8 KiB por token en BF16), y la decodificación especulativa con DFlash2 reduce la latencia de generación según el autor, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Raon-1 mini preview | 28,8 B | 4,3 B | 262.144 | Apache 2.0 | Híbrido RDA + MLA, foco en coreano y agentes |
| Alternativas MoE de referencia | no disponible | no disponible | no disponible | no disponible | La model card menciona modelos de comparación, pero sus nombres y cifras no están en la información disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Es una versión preview: el propio autor advierte que las especificaciones y resultados pueden cambiar antes de la versión final, por lo que no es recomendable como base estable de producción sin fijar la revisión.
- Riesgo de alucinación: no se han publicado tasas de alucinación ni evaluaciones de veracidad en la información disponible.
- Sesgos: no se documentan sesgos conocidos; el entrenamiento está sesgado hacia coreano e inglés, con menor cobertura declarada de español, francés, japonés, chino y tailandés.
- Idiomas: aunque cubre siete idiomas, el rendimiento fuera de coreano e inglés no está cuantificado en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso a los pesos está condicionado a una solicitud con datos personales y aceptación de la licencia (gate en Hugging Face), lo que añade fricción operativa.
- Despliegue: requiere transformers con código personalizado (custom_code), lo que puede limitar la compatibilidad con frameworks de inferencia que no soporten aún la arquitectura RDA.
- Contexto: los 262.144 tokens son la longitud nativa declarada, pero no hay datos publicados sobre degradación del rendimiento en el extremo de la ventana.
- Cuantizaciones: solo se ofrecen MXFP8 y NVFP4; no hay GGUF publicado, lo que dificulta el uso en CPU o en GPU de consumo con menos de 32 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Versión final (referenciada como new_version): https://huggingface.co/KRAFTON/Raon-1-mini
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Cuenta de X de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Web corporativa de KRAFTON: https://www.krafton.com/en/
