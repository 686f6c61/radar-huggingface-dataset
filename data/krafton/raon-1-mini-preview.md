# KRAFTON/Raon-1-mini-preview

## Resumen

Raon-1 mini preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, la división de inteligencia artificial de la editora surcoreana de videojuegos KRAFTON. Con 28.800 millones de parámetros totales y 4.300 millones activos por token, se posiciona en la categoría de modelos MoE de tamano medio con un enfoque declarado en conversación en coreano y tareas agénticas. Esta versión es una preview, no el modelo final, y se distribuye bajo licencia Apache 2.0 con acceso bajo solicitud (gated).

La arquitectura combina atención lineal y atención completa: 25 capas en total, de las cuales 18 son capas de Raon Delta Attention (RDA) con estado de tamano fijo y solo 7 son capas MLA que mantienen caché KV, lo que reduce el coste de memoria en contextos largos hasta aproximadamente 8 KiB por token en BF16. El modelo soporta de forma nativa hasta 262.144 tokens de contexto y utiliza una codificación posicional NoPE. El vocabulario es amplio (259.840 tokens) y el LM head está destado (untied).

Su relevancia actual radica en tres factores: es un entrenamiento from scratch de un laboratorio no occidental con foco explícito en coreano, ofrece soporte de decodificación especulativa mediante un modelo draft DFlash2, y publica cuantizaciones MXFP8 y NVFP4 que permiten inferencia en una única GPU de consumo (RTX 5090 de 32 GB). Todo ello bajo una licencia permisiva poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 18 capas RDA (atención lineal) + 7 capas Gated MLA |
| Parametros totales | 28,8 B (28.783.218.402 según safetensors) |
| Parametros activos | 4,3 B por token (6 de 128 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP8 y NVFP4 (publicadas por el autor); BF16 en pesos originales |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer MoE con un diseño híbrido de atención poco común. De las 25 capas, 18 usan Raon Delta Attention (RDA), una variante de la Kimi Delta Attention que desacopla las compuertas de borrado y escritura para mejorar el rendimiento en contexto largo, y mantiene un estado de tamano fijo en lugar de una caché KV creciente. Las 7 capas restantes usan Gated MLA con rangos LoRA de 576 para query y 512 para KV. La dimensión oculta es de 2.560, con 40 cabezas de atención de dimensión 128 en RDA y 192 (QK) / 128 (V) en Gated MLA. El modelo no usa codificación posicional (NoPE).

La capa MoE cuenta con 128 expertos enrutados de tamano intermedio 1.088, de los que se activan 6 más un experto compartido por token. La primera capa es un FFN denso con tamano intermedio 12.032. La función de activación es SiTU-GLU y las conexiones residuales usan Raon-mHC con 4 flujos, una versión optimizada de las manifold-constrained hyper-connections de DeepSeek que reduce el coste computacional y acelera el entrenamiento. El modelo se entrenó desde cero, aunque la información disponible no detalla el volumen de tokens, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional con modo de razonamiento integrado (thinking), orientado a matemáticas y ciencia según los benchmarks declarados por el autor.
- Seguimiento de instrucciones y tareas de búsqueda, donde el autor afirma liderar frente a los modelos de comparación.
- Ejecución de agentes mediante tool calling, con soporte explícito para Hermes Agent, Pi y OpenCode.
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés, con rendimiento declarado fuerte en coreano y sólido en inglés.
- Contexto largo nativo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa mediante el modelo draft DFlash2 proporcionado por el autor.
- Inferencia cuantizada en MXFP8 y NVFP4, esta última viable en una RTX 5090 de 32 GB.

## Casos de uso

- Atención al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens y a su entrenamiento específico en coreano, lo que lo hace adecuado para soporte automatizado en mercados de habla coreana.
- Agentes de automatización de tareas: con tool calling y compatibilidad con Hermes Agent, Pi y OpenCode, puede integrarse en flujos que requieran invocar APIs, consultar bases de datos o encadenar pasos de razonamiento.
- Asistentes de búsqueda aumentada: el autor declara buen rendimiento en benchmarks de búsqueda, por lo que encaja en pipelines RAG donde el modelo debe sintetizar respuestas a partir de documentos recuperados.
- Análisis de documentos largos: con 262.144 tokens de contexto y solo 8 KiB por token de caché KV en BF16, es viable procesar contratos, informes o codebases completas sin truncar.
- Razonamiento matemático y científico asistido: el modo thinking integrado permite usarlo en herramientas educativas o de análisis técnico que requieran cadenas de razonamiento explícitas.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización NVFP4 permite ejecutar el modelo en una RTX 5090 de 32 GB, lo que habilita prototipos locales y entornos de desarrollo sin infraestructura de centro de datos.
- Traducción y generación multilingüe: al cubrir siete idiomas, puede emplearse en localización de contenidos entre coreano, inglés, japonés, chino, español, francés y tailandés.

## Benchmarks y rendimiento

La model card incluye gráficos de benchmarks (razonamiento, matemáticas, ciencia, seguimiento de instrucciones y búsqueda) comparando con Qwen3.6-35B-A3B y Gemma 4 26B-A4B, pero los valores numéricos no están disponibles en el texto extraído. El autor indica que el juez y simulador de usuario empleado en las evaluaciones fue gpt-5.6-luna.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 57,6 GB (28,8 B parámetros × 2 bytes), más overhead de activaciones y caché KV; requiere al menos una GPU de 80 GB (A100, H100) o varias GPUs.
- Cuantización MXFP8: en torno a 28,8 GB de pesos, viable en una GPU de 40-48 GB (A100 40 GB con margen ajustado, L40S, A6000).
- Cuantización NVFP4: el autor indica que permite inferencia en una única NVIDIA RTX 5090 de 32 GB.
- Caché KV reducida: solo las 7 capas MLA mantienen caché, aproximadamente 8 KiB por token en BF16, lo que abarata el contexto largo frente a un transformer denso equivalente.
- Despliegue: la model card cita transformers con custom_code; no se confirman en la información disponible soportes de vLLM, llama.cpp, Ollama o TGI.
- Decodificación especulativa: el modelo draft DFlash2 del autor puede acelerar la generación, aunque no se publican cifras de latencia o throughput.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Raon-1 mini preview | 28,8 B | 4,3 B | 262.144 | Apache 2.0 | MoE híbrida RDA/MLA, foco en coreano, preview |
| Qwen3.6-35B-A3B | 35 B | 3 B (según nomenclatura) | no disponible | no disponible | Referencia de comparación citada por el autor |
| Gemma 4 26B-A4B | 26 B | 4 B (según nomenclatura) | no disponible | no disponible | Referencia de comparación citada por el autor |

Los datos de rendimiento comparado no están disponibles en formato numérico; el autor afirma que Raon-1 mini preview lidera en matemáticas, ciencia, seguimiento de instrucciones y búsqueda dentro del grupo MoE comparado, pero no se pueden verificar las cifras con la información proporcionada.

## Limitaciones y advertencias

- Es una versión preview: el propio autor advierte que las especificaciones y resultados pueden cambiar antes de la versión final.
- Acceso bajo solicitud (gated): aunque la licencia es Apache 2.0, la descarga requiere aprobación y datos del solicitante, lo que puede afectar a la automatización en producción.
- Sesgos conocidos: no se documentan en la información disponible; al entrenarse con datos web es esperable un sesgo hacia el coreano y el inglés.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero falso, especialmente en tareas de búsqueda.
- Cobertura de idiomas: aunque declara siete idiomas, el foco declarado es coreano e inglés; el rendimiento en español, francés, tailandés, japonés y chino no está cuantificado.
- Requiere código personalizado (custom_code) en transformers, lo que puede complicar la integración con stacks estándar.
- Sin datos publicados de benchmarks numéricos ni de volumen de entrenamiento, lo que limita la evaluación independiente.
- Restricciones comerciales: la licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del gate y las condiciones de la versión final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Versión final (referenciada): https://huggingface.co/KRAFTON/Raon-1-mini
- Playground: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
