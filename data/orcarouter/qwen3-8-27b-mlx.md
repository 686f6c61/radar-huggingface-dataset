# orcarouter/Qwen3.8-27B-MLX

## Resumen

Qwen3.8-27B-MLX es una compilación en formato MLX del modelo oficial Qwen/Qwen3.8-27B, publicada por orcarouter para su ejecución nativa en Apple Silicon. Se trata de un modelo denso de 27 356 728 560 parámetros (aproximadamente 27,36 mil millones) con arquitectura de atención híbrida (Gated DeltaNet lineal combinada con atención completa), capacidad nativa de visión-lenguaje y una cabeza MTP (multi-token prediction) para decodificación especulativa. El repositorio ofrece tres precisiones cuantizadas de forma afín —4, 6 y 8 bits— más un drafter MTP independiente en BF16.

La relevancia de esta ficha radica en que traslada un modelo multimodal de 27B al ecosistema local de Apple, un segmento donde la oferta de modelos densos con visión, tool calling y control de razonamiento es todavía limitada. El build mantiene la torre de visión, las capas de normalización y las convoluciones en BF16, y solo cuantiza los pesos lineales del modelo de lenguaje (incluidos `embed_tokens` y `lm_head`), lo que preserva la fidelidad de la rama visual.

El modelo base resuelve tareas de razonamiento, generación de código, matemáticas y comprensión de imagen-texto, con soporte declarado de function calling y modos de pensamiento. La licencia Apache 2.0 y la disponibilidad de cuantizaciones de 16 a 31 GB lo hacen viable en equipos de consumo con memoria unificada, aunque con limitaciones claras de idioma (solo inglés y chino) y de plataforma (exclusivo de MLX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida: Gated DeltaNet (atención lineal) + atención completa; torre de visión nativa; cabeza MTP |
| Parametros totales | 27 356 728 560 (≈27,36 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (group size 64), 6-bit (group size 32), 8-bit (group size 32), todas afines; BF16 para torre de visión, normas y convoluciones; drafter MTP en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); subcarpetas `4-bit/`, `6-bit/`, `8-bit/` y `mtp/`; la raíz del repositorio equivale a `4-bit/` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atención híbrida que combina capas de Gated DeltaNet —un mecanismo de atención lineal con estado recurrente— con capas de atención completa. Esta mezcla busca reducir el coste computacional y de memoria en contextos largos sin renunciar a la calidad de recuperación de la atención densa. El modelo es nativamente vision-lenguaje, con una torre visual integrada que en este build MLX se conserva íntegramente en BF16, igual que las normas y las capas convolucionales. Incorpora además una cabeza MTP (multi-token prediction) que actúa como drafter para decodificación especulativa, empaquetada por separado en la carpeta `mtp/` con un peso aproximado de 0,9 GB.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento. Tampoco se detalla la innovación concreta del mecanismo Gated DeltaNet más allá de su carácter de atención lineal con compuerta. La información disponible se limita a la naturaleza del build MLX: cuantización afín de los pesos lineales del LM, preservación en BF16 de los componentes sensibles a precisión y publicación de métricas de divergencia KL frente a la referencia BF16 (wikitext-2, 1024 tokens): 8-bit con KLD medio de 0,00068 y 98,34 % de acuerdo Top-1; 6-bit con 0,00216 y 96,97 %; 4-bit con 0,02824 y 92,68 %.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento controlable (thinking control).
- Comprensión de imagen y texto (pipeline `image-text-to-text`), con torre de visión preservada en BF16.
- Generación de código y resolución de problemas matemáticos, según la categoría del modelo base.
- Tool calling y function calling declarados en las etiquetas del repositorio.
- Decodificación especulativa mediante drafter MTP separado, orientada a reducir latencia en Apple Silicon.
- Conversación multi-turno.
- Capacidades multilingües limitadas a inglés y chino.

## Casos de uso

- Asistente de razonamiento local en Mac: con la cuantización 8-bit (~31 GB) y un equipo de 32–64 GB de memoria unificada, el modelo puede ejecutar cadenas de razonamiento largas con una fidelidad respecto a BF16 del 98,34 % en Top-1, adecuado para análisis técnicos que no pueden salir a la nube.
- Automatización de documentación técnica con capturas: al ser vision-lenguaje, permite extraer texto y estructura de diagramas, interfaces y capturas de pantalla, y redactar documentación en inglés o chino sin depender de servicios externos.
- Agente de desarrollo con tool calling: integrado en un entorno local tipo LM Studio, el modelo puede invocar funciones para consultar repositorios, ejecutar tests o leer ficheros, aprovechando la decodificación especulativa del drafter MTP para reducir la latencia por token en flujos interactivos.
- Análisis de imágenes en investigación: clasificación y descripción de figuras científicas, gráficos y tablas escaneadas, con la ventaja de que la torre visual en BF16 evita la degradación típica de cuantizar la rama de imagen.
- Prototipado sin conexión en entornos restringidos: al ejecutarse íntegramente en local con MLX y licencia Apache 2.0, sirve para pruebas de concepto en organizaciones que no permiten enviar datos a APIs externas.
- Evaluación comparativa de cuantizaciones: el repositorio publica métricas de KLD y acuerdo Top-1 por precisión, lo que permite al equipo elegir 4-bit (~16 GB, 24 GB de RAM mínima) para prototipos rápidos o 8-bit para producción con requisitos de fidelidad.
- Generación de código en pipelines locales: con 4-bit en un Mac de 24 GB, el modelo puede asistir en tareas de autocompletado y revisión de parches dentro de un flujo de CI local, siempre que el equipo acepte la limitación idiomática a inglés y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente incluye métricas de fidelidad de cuantización frente a BF16 (wikitext-2, 1024 tokens), que se recogen aquí por su valor técnico:

| Precision | KLD medio | KLD p95 | Acuerdo Top-1 |
|---|---:|---:|---:|
| 8-bit | 0,00068 | 0,00233 | 98,34 % |
| 6-bit | 0,00216 | 0,00795 | 96,97 % |
| 4-bit | 0,02824 | 0,10857 | 92,68 % |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas de rendimiento frente a otros modelos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8-bit ≈31 GB (mínimo 32–64 GB de RAM en Mac); 6-bit ≈24 GB (mínimo 32 GB); 4-bit ≈16 GB (mínimo 24 GB); drafter MTP ≈0,9 GB adicional.
- GPU recomendadas: exclusivamente Apple Silicon con soporte MLX; no se documenta compatibilidad con CUDA ni ROCm en este build.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada de 24 GB o superior para 4-bit; 6-bit requiere 32 GB y 8-bit, 32–64 GB.
- Opciones de despliegue: MLX y LM Studio (la raíz del repositorio carga directamente como 4-bit); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificación especulativa con el drafter MTP está prevista para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación con el modelo base sin cuantizar es la única referencia disponible:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MLX (este) | ≈27,36 B | no disponible | MLX 4/6/8-bit | Apache 2.0 | Build para Apple Silicon, visión en BF16, drafter MTP |
| Qwen/Qwen3.8-27B (base) | ≈27,36 B | no disponible | safetensors BF16 | Apache 2.0 | Referencia de precisión completa; requiere más memoria |

No se identifican en la información disponible alternativas de terceros con las que establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Plataforma: el formato MLX limita la ejecución a Apple Silicon; no es desplegable en GPU NVIDIA o AMD sin conversión previa.
- Contexto: la longitud de contexto no se especifica en la información disponible, lo que impide planificar cargas de documentos largos con garantías.
- Cuantización: el 4-bit presenta un KLD medio de 0,02824 y un acuerdo Top-1 del 92,68 %, con una cola p95 de 0,10857; puede degradar tareas sensibles a precisión frente a 8-bit.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni tasas de alucinación; debe asumirse el riesgo habitual de los modelos generativos.
- Sesgos: no se publica información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento, lo que impide evaluar su impacto.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de los componentes de terceros.
- Producción: el repositorio tiene 726 descargas y 27 likes en el momento de la consulta, con última actualización el 27 de octubre de 2026; es un build de la comunidad, no oficial de Qwen, por lo que la trazabilidad de cambios depende del autor.
- La model card incluye promociones de servicios de OrcaRouter ajenas al modelo; no deben interpretarse como especificaciones técnicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-27B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha del modelo en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Sitio web de OrcaRouter: https://www.orcarouter.ai
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter): https://x.com/OrcaRouter
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
