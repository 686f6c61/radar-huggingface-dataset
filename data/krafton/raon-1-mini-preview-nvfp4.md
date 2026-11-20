# KRAFTON/Raon-1-mini-preview-nvfp4

## Resumen

Raon-1 mini (NVFP4) es la versión cuantizada a NVFP4 del modelo Raon-1 mini preview, desarrollado por KRAFTON AI. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) híbrida entrenado desde cero, con 28,8 mil millones de parámetros totales y 4,3 mil millones activos por token. Esta variante NVFP4 está pensada para inferencia en una única GPU mediante vLLM, incluyendo tarjetas consumer como la NVIDIA RTX 5090 con 32 GB de VRAM.

El modelo destaca por su enfoque en conversación en coreano y tareas agénticas, con soporte nativo de tool calling y una ventana de contexto de 262.144 tokens. Su arquitectura combina capas de atención lineal (Raon Delta Attention) con capas de atención completa (Gated MLA), lo que reduce drásticamente el coste de caché KV en contextos largos: solo 7 de las 25 capas mantienen KV cache, aproximadamente 8 KiB por token en BF16.

La relevancia de esta ficha radica en que la versión NVFP4 permite desplegar un MoE de casi 29B parámetros en hardware de consumo, algo poco habitual, manteniendo licencia Apache 2.0 y soporte de decodificación especulativa mediante un modelo draft DFlash2. Es una versión preview, por lo que las especificaciones y resultados pueden cambiar antes de la versión final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida (RDA + Gated MLA) |
| Parámetros totales | 28,8B (modelo base); 15.084.105.442 parámetros en los safetensors de esta versión cuantizada |
| Parámetros activos | 4,3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 (8-bit, modelopt_fp4); el modelo base también ofrece MXFP8 |
| Idiomas soportados | Coreano e inglés (según la model card); lista completa no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4, para vLLM) |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura MoE híbrida de 25 capas con un ratio de atención 3:1 entre Raon Delta Attention (RDA) y Gated MLA. RDA desacopla las puertas de borrado y escritura de Kimi Delta Attention, lo que mejora el rendimiento en contexto largo respecto a KDA. Las 18 capas RDA mantienen un estado de tamaño fijo, mientras que solo las 7 capas MLA conservan caché KV (unos 8 KiB por token en BF16). El modelo usa codificación posicional NoPE (sin codificación posicional), 40 cabezas de atención, tamaño oculto de 2.560, vocabulario de 259.840 tokens y LM head no atado.

El enrutamiento MoE activa 6 de 128 expertos más 1 experto compartido por token, con tamaño intermedio de experto de 1.088 y FFN densa de 12.032 en la primera capa. La función de activación es SiTU-GLU y las conexiones residuales usan Raon-mHC con 4 streams, una versión optimizada de las manifold-constrained hyper-connections de DeepSeek que reduce el coste computacional y acelera el entrenamiento. El modelo fue entrenado desde cero por KRAFTON AI; no se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí se indica que incorpora razonamiento integrado (thinking) y que se proporciona un modelo draft DFlash2 para decodificación especulativa.

## Capacidades

- Generación de texto conversacional con modo de razonamiento integrado (thinking).
- Razonamiento matemático y científico, con resultados destacados en los benchmarks publicados por el autor.
- Seguimiento de instrucciones y tareas de búsqueda.
- Tool calling para flujos agénticos, con soporte explícito para Hermes Agent, Pi y OpenCode.
- Ejecución de agentes y razonamiento multi-paso.
- Capacidades multilingües centradas en coreano (rendimiento fuerte) e inglés (rendimiento sólido).
- Contexto largo nativo de hasta 262.144 tokens.
- Decodificación especulativa acelerada mediante modelo draft DFlash2.
- No se mencionan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Atención al cliente en coreano: el modelo puede mantener conversaciones multi-turno con hasta 262.144 tokens de contexto, lo que permite arrastrar historiales largos y documentación de producto sin truncar, aprovechando además su rendimiento específico en coreano.
- Asistentes agénticos con tool calling: integrable en frameworks como Hermes Agent, Pi u OpenCode para orquestar llamadas a APIs, consultas a bases de datos y acciones multi-paso, gracias al soporte nativo de function calling.
- Despliegue en una sola GPU consumer: la versión NVFP4 cabe en una NVIDIA RTX 5090 de 32 GB, lo que permite montar un asistente local o un servicio interno sin infraestructura de centro de datos.
- Razonamiento matemático y científico asistido: útil para tutoría técnica, resolución de problemas paso a paso y verificación de cálculos, apoyándose en el modo thinking integrado.
- Procesamiento de documentos largos: con 262k tokens de contexto y solo 7 capas con KV cache, es adecuado para resumir contratos, analizar informes extensos o hacer preguntas sobre corpus documentales grandes con coste de memoria contenido.
- Generación de código y automatización de pipelines: puede integrarse en flujos de CI/CD como agente que interpreta errores, propone parches y ejecuta herramientas, aunque su foco declarado es conversación y tareas agénticas más que código puro.
- Búsqueda aumentada y respuesta sobre fuentes: el modelo lidera según el autor en benchmarks de búsqueda, por lo que encaja en sistemas RAG que requieren seguimiento de instrucciones y síntesis de resultados.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye gráficas comparativas (raon_benchmarks_top6) frente a modelos abiertos, pero los valores concretos no están accesibles en el texto proporcionado, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada: la versión NVFP4 está diseñada para ejecutarse en una sola GPU; el autor indica que cabe en una NVIDIA RTX 5090 de 32 GB.
- El repositorio ocupa 17,6 GB, lo que da una referencia del peso de los safetensors cuantizados.
- GPU recomendadas: NVIDIA RTX 5090 (32 GB) como mínimo validado por el autor para NVFP4; para la versión MXFP8 o BF16 se necesitaría más memoria (no especificada).
- Cabe en GPU consumer: sí, al menos en RTX 5090 según la model card.
- Opciones de despliegue: vLLM es el runtime indicado explícitamente para estos pesos NVFP4. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Se ofrece decodificación especulativa con el draft model DFlash2 para acelerar la generación.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye una tabla numérica de comparación con alternativas concretas; la model card menciona gráficas frente a "modelos abiertos" y "baselines MoE", pero sin identificar modelos ni cifras en el texto extraído.

## Limitaciones y advertencias

- Es una versión preview, no un modelo final: las especificaciones y resultados pueden cambiar antes del lanzamiento definitivo.
- El acceso al modelo base requiere solicitud (gated model) con datos de nombre, afiliación, puesto, país y uso previsto.
- Idiomas: el foco es coreano e inglés; el rendimiento en otras lenguas no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas de error ni evaluaciones de factualidad.
- Sesgos: no se publica información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- La cuantización NVFP4 puede introducir degradación respecto al modelo en BF16; no se publican métricas de la pérdida de calidad por cuantización.
- El despliegue NVFP4 está atado a vLLM y a hardware NVIDIA compatible con FP4; no se garantiza funcionamiento en otras plataformas.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de acceso al modelo base y las dependencias del runtime.

## Enlaces

- Modelo en Hugging Face (NVFP4): https://huggingface.co/KRAFTON/Raon-1-mini-preview-nvfp4
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Repositorio GitHub del modelo: https://github.com/krafton-ai/Raon-1-mini-preview
- Playground de Raon-1 mini: https://raon-console.krafton.ai/playground/guest
- Página de KRAFTON AI: https://krafton.ai/en/
- Organización en Hugging Face: https://huggingface.co/KRAFTON
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Discord de la comunidad: https://discord.gg/sDG7mmZPnc
