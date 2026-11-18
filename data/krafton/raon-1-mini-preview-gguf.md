# KRAFTON/Raon-1-mini-preview-gguf

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI (Corea del Sur). Esta ficha cubre la variante GGUF del checkpoint de previsualización `Raon-1-mini-preview`, convertida desde los pesos BF16 para su uso con llama.cpp y otras herramientas compatibles con este formato. El modelo declara un enfoque explícito en conversación en coreano y en tareas agénticas, con razonamiento integrado y soporte de tool calling.

La arquitectura es híbrida: 25 capas en total, de las cuales 18 son capas de atención lineal (Raon Delta Attention, RDA) y 7 son capas de atención completa (Gated MLA). El modelo tiene 28.783.218.602 parámetros totales (28,8B) y activa 4,3B por token mediante un esquema MoE con 128 expertos enrutados, de los que se activan 6 más 1 compartido. El contexto nativo declarado es de 262.144 tokens, con un vocabulario de 259.840 entradas.

La relevancia de esta ficha radica en que el repositorio GGUF permite ejecutar un modelo de 28,8B con activación dispersa en hardware de consumo, y el autor publica además un modelo draft (DFlash2) para decodificación especulativa. La licencia es Apache 2.0, aunque el acceso al modelo base está sujeto a una solicitud con control de acceso (gated) en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 18 capas Raon Delta Attention (RDA) + 7 capas Gated MLA (proporción 3:1) |
| Parámetros totales | 28.783.218.602 (28,8B) |
| Parámetros activos | 4,3B por token (6 expertos enrutados + 1 compartido de 128) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantización | GGUF (Q6_K y menores con importance matrix/imatrix; también MXFP8 y NVFP4 en el modelo base) |
| Idiomas soportados | Coreano e inglés (según la model card); lista completa de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); BF16/MXFP8 en el modelo base |

Otros datos técnicos declarados por el autor:

| Parámetro | Valor |
|---|---|
| Capas | 25 |
| Tamaño oculto | 2.560 |
| Codificación posicional | NoPE (sin codificación posicional) |
| Cabezas de atención | 40 (tanto RDA como Gated MLA) |
| Dimensión de cabeza | 128 en RDA; 192 QK / 128 V en Gated MLA |
| Rango LoRA de query/KV | 576 / 512 (Gated MLA) |
| Expertos | 128 (6 enrutados + 1 compartido activos) |
| Tamaño intermedio de experto | 1.088 |
| Tamaño intermedio FFN denso (primera capa) | 12.032 |
| Función de activación | SiTU-GLU |
| Conexión residual | Raon-mHC con 4 streams |
| Vocabulario | 259.840 |
| LM Head | Untied (no compartido) |
| Caché KV | Solo en las 7 capas MLA, ~8 KiB por token en BF16 |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer híbrida con atención mixta. Dieciocho de las 25 capas usan Raon Delta Attention (RDA), una variante que, según el autor, desacopla las compuertas de borrado y escritura de Kimi Delta Attention (KDA) para mejorar el rendimiento en contexto largo. Estas capas mantienen un estado de tamaño fijo, por lo que no acumulan caché KV. Las 7 capas restantes usan Gated MLA (atención latente multi-cabeza con compuertas), que sí mantienen caché KV, estimada en unos 8 KiB por token en BF16. El modelo prescinde de codificación posicional explícita (NoPE).

La capa MoE activa 6 de 128 expertos enrutados más un experto compartido por token, con un tamaño intermedio de experto de 1.088 y activación SiTU-GLU. La primera capa es un FFN denso con tamaño intermedio de 12.032. Las conexiones residuales usan Raon-mHC con 4 streams, una variante que el autor describe como una reducción del coste computacional de las manifold-constrained hyper-connections (mHC) de DeepSeek para acelerar el entrenamiento. El modelo se entrenó desde cero; la model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican los detalles del proceso de destilación o alineación.

Como innovaciones destacables, el autor cita el soporte de decodificación especulativa mediante un modelo draft DFlash2 (`KRAFTON/Raon-1-mini-preview-dflash2`) y la disponibilidad de cuantizaciones MXFP8 y NVFP4, esta última pensada para inferencia en una única GPU NVIDIA RTX 5090 de 32 GB de VRAM. Los ficheros GGUF se convirtieron desde los pesos BF16 del mismo checkpoint, y las cuantizaciones Q6_K y menores se generaron con importance matrix.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis declarado en coreano y buen rendimiento en inglés.
- Razonamiento integrado ("built-in thinking") orientado a matemáticas y ciencia, según los benchmarks que cita el autor.
- Seguimiento de instrucciones y tareas de búsqueda (search), donde el autor afirma que lidera frente a los modelos de comparación.
- Tool calling / function calling para flujos agénticos; el autor menciona soporte para Hermes Agent, Pi y OpenCode.
- Ejecución de agentes y razonamiento multi-paso.
- Decodificación especulativa mediante el modelo draft DFlash2.
- Capacidades multilingües limitadas, según la model card, a coreano e inglés; no se detalla una lista completa de idiomas.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional en coreano: el modelo está entrenado explícitamente para conversación en coreano, lo que lo hace adecuado para atención al cliente o asistentes en ese idioma, con contexto de hasta 262.144 tokens para historiales largos.
- Agentes con tool calling: integrable en frameworks como Hermes Agent u OpenCode para tareas que requieran invocar funciones externas, consultar APIs o encadenar pasos de razonamiento.
- Razonamiento matemático y científico: uso en entornos educativos o de investigación para resolución de problemas paso a paso con modo de pensamiento.
- Procesamiento de documentos largos: la ventana de 262.144 tokens y el diseño híbrido (solo 7 capas con caché KV) permiten analizar contratos, informes o bases de código extensas con menor coste de memoria que un transformer denso equivalente.
- Despliegue en hardware de consumo: la cuantización NVFP4 del modelo base y los GGUF con imatrix permiten ejecutar el modelo en una RTX 5090 (32 GB) o en configuraciones de consumo mediante llama.cpp.
- Pipelines de generación de texto autoalojados: al ser Apache 2.0 y estar disponible en GGUF, puede integrarse en servicios internos con llama.cpp u otros runners compatibles sin depender de APIs externas.
- Aceleración de inferencia en producción: el uso conjunto del modelo y el draft DFlash2 permite decodificación especulativa para reducir latencia en despliegues con requisitos de throughput.

## Benchmarks y rendimiento

La model card menciona gráficas comparativas de benchmarks (matemáticas, ciencia, seguimiento de instrucciones, búsqueda y comparación con modelos abiertos), pero los valores numéricos no están incluidos en la información proporcionada. Por tanto:

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial para cada cuantización GGUF. Como referencia, el autor indica que la versión NVFP4 del modelo base cabe en una única NVIDIA RTX 5090 con 32 GB de VRAM.
- El repositorio GGUF ocupa 261,1 GB en total, lo que incluye varias cuantizaciones; el tamaño de cada fichero individual no se detalla en la información disponible.
- GPU recomendadas: RTX 5090 (32 GB) para NVFP4 según el autor; para GGUF de menor precisión se requiere hardware con VRAM suficiente, pero no se especifican modelos concretos.
- Despliegue: llama.cpp (formato GGUF nativo); el autor no detalla soporte explícito de vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card menciona comparaciones con "modelos abiertos" y "baselines MoE", pero no incluye los nombres ni los valores numéricos en la información disponible. Por tanto, no es posible construir una comparativa con datos verificables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raon-1 mini (GGUF) | 28,8B totales / 4,3B activos | 262.144 | Apache 2.0 | Hugging Face (acceso gated al base) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una versión de previsualización, no un modelo final: el autor advierte que las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo.
- El acceso al modelo base está sujeto a solicitud (gated) en Hugging Face, con campos de nombre, afiliación, país y uso previsto; esto puede afectar a la automatización de despliegues.
- Idiomas: la model card solo declara coreano e inglés; no hay información sobre cobertura de otros idiomas, incluido el español.
- No se detallan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información disponible.
- El rendimiento en contexto largo depende del diseño híbrido; solo las 7 capas MLA mantienen caché KV, lo que puede afectar a tareas que requieran recuperación precisa en ventanas muy extensas, aunque el autor lo presenta como una ventaja.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de los términos del acceso gated y de la licencia del modelo base.
- No se especifican requisitos de hardware por cuantización GGUF, lo que dificulta planificar el despliegue sin pruebas previas.
- El repositorio GGUF tiene 261,1 GB, lo que implica un coste de almacenamiento y descarga considerable si se quieren todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KRAFTON/Raon-1-mini-preview-gguf
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Modelo draft DFlash2: https://huggingface.co/KRAFTON/Raon-1-mini-preview-dflash2
- Playground: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
- Repositorio GitHub del proyecto: https://github.com/krafton-ai/Raon-1-mini-preview
