# KRAFTON/Raon-1-mini-gguf

## Resumen

Raon-1 mini es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI, el brazo de inteligencia artificial de la editora de videojuegos surcoreana KRAFTON. Con 28.800 millones de parámetros totales y 4.300 millones activos por token, se posiciona en la categoría de modelos MoE de tamaño medio con activación reducida, pensado para despliegues con requisitos de cómputo contenidos. Esta ficha cubre específicamente la versión GGUF del checkpoint, publicada para su uso con llama.cpp.

El modelo destaca por su enfoque en conversación multi-turno, tareas agénticas y capacidades multilingües, con especial énfasis en coreano. Incorpora un modo de razonamiento integrado con seis niveles de esfuerzo seleccionables por petición, soporte de tool calling y una arquitectura híbrida de atención que combina capas de atención lineal con atención completa para reducir el coste del contexto largo, que alcanza de forma nativa los 262.144 tokens.

La relevancia de esta publicación radica en tres factores: la licencia Apache 2.0 sin restricciones de uso comercial, la disponibilidad de cuantizaciones que permiten inferencia en una única GPU de consumo (NVFP4 en una RTX 5090 de 32 GB) y la inclusión de un modelo draft DFlash2 para decodificación especulativa. El acceso al repositorio está, no obstante, sujeto a aprobación mediante formulario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal RDA y Gated MLA |
| Parámetros totales | 28,8 B (28.783.231.402) |
| Parámetros activos | 4,3 B por token |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantización | GGUF (Q6_K y menores con imatrix; el repositorio principal usa MXFP8 y NVFP4) |
| Idiomas soportados | Coreano, inglés, japonés, chino, español, francés y tailandés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); BF16 y MXFP8 en el repositorio principal |

Otros datos técnicos relevantes:

| Parámetro | Valor |
|---|---|
| Capas | 25 |
| Dimensión oculta | 2.560 |
| Distribución de atención | 18 capas RDA (atención lineal) + 7 capas Gated MLA |
| Codificación posicional | NoPE (sin codificación posicional) |
| Cabezas de atención | 40 (tanto en RDA como en Gated MLA) |
| Dimensión por cabeza | 128 en RDA; 192 QK / 128 V en Gated MLA |
| Rango LoRA de query / KV | 576 / 512 (Gated MLA) |
| Expertos | 128 enrutados, 6 activos + 1 compartido |
| Tamaño intermedio de experto | 1.088 |
| Tamaño intermedio FFN denso (primera capa) | 12.032 |
| Función de activación | SiTU-GLU |
| Conexión residual | Raon-mHC con 4 flujos |
| Tamaño de vocabulario | 259.840 |
| LM head | No atada (untied) |
| Caché KV | ~8 KiB por token en BF16 (solo en las 7 capas MLA) |
| Tamaño del repositorio | 266,6 GB |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura transformer híbrida de tipo MoE con 25 capas, de las cuales 18 son capas de Raon Delta Attention (RDA) y 7 son capas de Gated MLA (Multi-head Latent Attention). La RDA es una variante propia que desacopla las compuertas de borrado y escritura de Kimi Delta Attention, lo que según el autor mejora el rendimiento en contexto largo respecto a KDA. Las capas RDA mantienen un estado de tamaño fijo, de modo que solo las 7 capas MLA conservan caché KV, estimada en unos 8 KiB por token en BF16. Esta proporción 3:1 entre atención lineal y atención completa es la que hace viable el contexto de 262.144 tokens con un coste de memoria contenido.

El modelo no usa codificación posicional (NoPE) y sustituye las conexiones residuales convencionales por Raon-mHC, una versión optimizada de las manifold-constrained hyper-connections de DeepSeek con 4 flujos, que reduce el coste computacional y acelera el entrenamiento. La capa MoE cuenta con 128 expertos enrutados (6 activos por token) más un experto compartido, con tamaño intermedio de 1.088 y activación SiTU-GLU. El modelo fue entrenado desde cero por KRAFTON AI; la información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Sí se documenta la existencia de un modelo draft (Raon-1-mini-dflash2) para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento integrado, configurable en seis niveles de esfuerzo por petición: `none`, `low`, `medium`, `high`, `xhigh` y `max`.
- Razonamiento matemático y científico de alto nivel, con resultados destacados en AIME 2026, HMMT Feb 2026 y GPQA Diamond.
- Tool calling y function calling para flujos agénticos; el autor menciona compatibilidad con Hermes Agent, Pi y OpenCode.
- Ejecución de agentes y razonamiento multi-paso, incluyendo tareas de búsqueda y navegación (evaluado en BrowseComp Plus).
- Conversación multi-turno con contexto largo, evaluada en MultiChallenge.
- Capacidades multilingües en coreano, inglés, japonés, chino, español, francés y tailandés, con rendimiento especialmente fuerte en coreano.
- Decodificación especulativa mediante el modelo draft DFlash2.
- Capacidad de seguir instrucciones complejas (IFBench) y conocimiento factual (AA-Omniscience).
- No se documentan capacidades de visión, audio ni otras modalidades distintas del texto.

## Casos de uso

- **Atención al cliente en coreano e inglés**: el modelo puede mantener conversaciones multi-turno extensas gracias a su ventana de 262.144 tokens y a su entrenamiento específico en coreano, lo que lo hace adecuado para soporte en mercados de Asia Oriental con historiales de conversación largos.
- **Agentes autónomos de búsqueda y recuperación**: con soporte de tool calling y un rendimiento declarado de 55,9 en BrowseComp Plus, puede integrarse en pipelines que combinen búsqueda web, lectura de documentos y síntesis de respuestas en varios pasos.
- **Asistente de desarrollo integrado en el IDE**: la compatibilidad con OpenCode y Hermes Agent permite usarlo como backend de agentes de código que invocan herramientas, ejecutan tests y aplican parches dentro de un flujo de trabajo controlado.
- **Razonamiento matemático y científico asistido**: los seis niveles de esfuerzo permiten ajustar el coste computacional por consulta; para problemas de competición se usaría `high` o superior, y para consultas triviales `none` o `low`, reduciendo latencia y coste.
- **Despliegue en estación de trabajo con GPU de consumo**: la cuantización NVFP4 del repositorio principal permite inferencia en una única RTX 5090 de 32 GB, lo que habilita prototipado local y entornos de desarrollo sin infraestructura de centro de datos.
- **Procesamiento de documentos largos**: informes, expedientes o bases de código de hasta 262.144 tokens pueden procesarse en una sola pasada, aprovechando que solo 7 de las 25 capas mantienen caché KV (~8 KiB por token en BF16).
- **Integración en llama.cpp para entornos embebidos y CPU/GPU mixtas**: la publicación de GGUF con cuantizaciones Q6_K e inferiores generadas con importance matrix facilita el despliegue en hardware heterogéneo y en herramientas como Ollama o servidores ligeros.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Benchmark | Raon-1 mini |
|---|---|
| AIME 2026 | 96,7 |
| HMMT Feb 2026 | 87,1 |
| GPQA Diamond | 86,0 |
| MultiChallenge | 64,9 |
| BrowseComp Plus | 55,9 |

El autor compara el modelo con Qwen3.6 35B-A3B, Gemma 4 26B-A4B, Flint (40B-A2.5B) e Inkling 2 Mini en las gráficas de la model card (AA-Omniscience, GPQA Diamond, IFBench, MultiChallenge, BrowseComp Plus, SWE-Verified, GDPVal y un benchmark interno de chat en coreano), pero los valores numéricos de esos competidores no están disponibles en la información proporcionada. Tampoco se detallan los resultados en SWE-Verified, GDPVal, IFBench ni AA-Omniscience para Raon-1 mini.

## Requisitos de hardware

- **VRAM estimada en BF16**: los 28,8 B de parámetros requieren aproximadamente 57,6 GB solo para pesos, más la caché KV (~8 KiB/token en las capas MLA) y overhead de runtime; en la práctica, más de 64 GB para contexto moderado.
- **VRAM estimada en MXFP8**: en torno a 29 GB para pesos, lo que encaja en GPUs de 40-48 GB con margen para contexto.
- **VRAM estimada en NVFP4**: el autor indica que permite inferencia en una única NVIDIA RTX 5090 de 32 GB.
- **Cuantizaciones GGUF**: el repositorio incluye Q6_K y tamaños inferiores generados con importance matrix; Q6_K rondaría los 23-24 GB y Q4_K_M aproximadamente 16-17 GB (estimación por ratio habitual, no confirmada por el autor). Las cuantizaciones bajas permiten su uso en GPUs de consumo de 16-24 GB.
- **GPU recomendadas**: RTX 5090 (32 GB) para NVFP4; A100 80 GB, H100 80 GB o L40S 48 GB para BF16 o MXFP8 con contexto largo; RTX 4090 (24 GB) viable con cuantizaciones GGUF de 4-5 bits.
- **Opciones de despliegue**: llama.cpp y derivados (Ollama, LM Studio) para los GGUF; vLLM o TGI para los pesos BF16/MXFP8 del repositorio principal; soporte de decodificación especulativa con el draft DFlash2.
- **Latencia y throughput**: no disponibles en la información proporcionada. La activación de solo 4,3 B de parámetros por token y la atención lineal en 18 de 25 capas deberían reducir el coste por token frente a un modelo denso de tamaño comparable, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raon-1 mini | 28,8 B / 4,3 B | 262.144 | Apache 2.0 | Atención híbrida RDA + MLA, modo de razonamiento con 6 niveles |
| Qwen3.6 35B-A3B | 35 B / 3 B (según nomenclatura) | No disponible | No disponible | Incluido como referencia por el autor; sin cifras comparativas en la información disponible |
| Gemma 4 26B-A4B | 26 B / 4 B (según nomenclatura) | No disponible | No disponible | Incluido como referencia por el autor; sin cifras comparativas en la información disponible |
| Flint | 40 B / 2,5 B | No disponible | No disponible | Incluido como referencia por el autor; sin cifras comparativas en la información disponible |
| Inkling 2 Mini | No disponible | No disponible | No disponible | Incluido como referencia por el autor; sin cifras comparativas en la información disponible |

Los modelos de comparación aparecen únicamente en las gráficas de la model card; no se dispone de sus especificaciones detalladas ni de los valores numéricos de los benchmarks en la información proporcionada, por lo que la comparación cuantitativa no puede completarse.

## Limitaciones y advertencias

- **Acceso restringido**: aunque la licencia es Apache 2.0, el repositorio está sujeto a un formulario de acceso (gated) con aprobación manual; la disponibilidad inmediata no está garantizada.
- **Sesgos**: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible; el entrenamiento está fuertemente orientado al coreano, lo que puede introducir asimetrías de calidad entre idiomas.
- **Alucinación**: no se aportan métricas de veracidad ni de calibración más allá de AA-Omniscience, cuyos valores no se detallan; en tareas factuales debe asumirse el riesgo habitual en modelos de esta escala.
- **Idiomas**: el español figura entre los idiomas de entrenamiento, pero el autor solo destaca rendimiento fuerte en coreano y "sólido" en inglés; el rendimiento en español, francés, tailandés, japonés y chino no está cuantificado.
- **Formato GGUF**: las cuantizaciones Q6_K e inferiores se generaron con importance matrix y pueden degradar el razonamiento de cadena larga y el tool calling; conviene validar en la cuantización concreta antes de producción.
- **Contexto efectivo**: los 262.144 tokens son el máximo nativo, pero no se publican resultados de benchmarks de contexto largo (RULER, needle-in-a-haystack) que confirmen la calidad de recuperación a esa distancia.
- **Modo de razonamiento**: los seis niveles de esfuerzo añaden un parámetro de configuración que afecta a latencia y coste; un uso incorrecto (por ejemplo, `max` en cargas de alto volumen) puede disparar los tiempos de respuesta.
- **Dependencia del ecosistema**: la decodificación especulativa requiere el draft DFlash2 y un runtime compatible; no todos los servidores de inferencia soportan esta combinación.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el formulario de acceso solicita declarar el uso previsto; conviene revisar los términos del gating antes de integrarlo en un producto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KRAFTON/Raon-1-mini-gguf
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Modelo draft para decodificación especulativa: https://huggingface.co/KRAFTON/Raon-1-mini-dflash2
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Página corporativa de KRAFTON AI: https://krafton.ai/en/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Cuenta de X de KRAFTON AI: https://x.com/Krafton_AI
- Comunidad de Discord: https://discord.gg/sDG7mmZPnc
