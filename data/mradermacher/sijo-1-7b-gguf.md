# mradermacher/Sijo-1.7B-GGUF

## Resumen

Sijo-1.7B-GGUF es la versión cuantizada en formato GGUF del modelo Sijo-1.7B, publicado por el usuario mradermacher en Hugging Face. Se trata de una conversión estática del modelo original alojado en el repositorio myjellylabs/Sijo-1.7B, orientada a facilitar su ejecución en entornos con recursos limitados mediante herramientas compatibles con GGUF como llama.cpp u Ollama. El modelo base cuenta con aproximadamente 1.700 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños.

La información pública disponible sobre este repositorio es muy escasa: no se especifican la arquitectura exacta, el contexto, los idiomas soportados ni la licencia del modelo original. El repositorio se limita a ofrecer los pesos cuantizados en varias precisiones, sin model card descriptiva del comportamiento del modelo. Por tanto, esta ficha debe interpretarse como una descripción del artefacto de cuantización y de las especificaciones inferibles, marcando explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

Su relevancia radica en que permite desplegar un modelo de 1.7B en hardware de consumo mediante cuantizaciones de 2 a 8 bits, algo útil para prototipado local, experimentación y despliegue en entornos sin GPU de datacenter. No obstante, al carecer de documentación sobre el modelo base, cualquier evaluación de calidad debe realizarse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | aproximadamente 1.700 millones (inferido del nombre del modelo) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base original, presumiblemente) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Sijo-1.7B (transformer, MoE, SSM u otra), ni sobre el volumen de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF no incluye ningún apartado descriptivo del modelo original; únicamente recoge metadatos técnicos del proceso de cuantización (versión de cuantización 2, tensor de salida cuantizado, tipo de conversión hf).

El repositorio es un artefacto de conversión generado con las herramientas habituales de cuantización estática de llama.cpp, que produce variantes de pesos en distintos niveles de precisión (desde f16 hasta Q2_K). No se documenta ninguna innovación técnica adicional, como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de 1.7B, aunque sin datos verificables sobre calidad.
- Razonamiento y matemáticas: no disponible; no consta evaluación alguna.
- Generación de código: no disponible; no se documenta soporte específico.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local: capacidad efectiva del artefacto GGUF, que permite inferencia en CPU y GPU de consumo mediante llama.cpp u Ollama.

## Casos de uso

- Prototipado local de aplicaciones de texto: el formato GGUF permite cargar el modelo en llama.cpp u Ollama en un portátil con 8-16 GB de RAM, útil para validar flujos conversacionales antes de escalar a modelos mayores.
- Despliegue en dispositivos de borde: con cuantizaciones Q4_K_M o Q3_K_M, el modelo puede ejecutarse en mini-PC o Raspberry Pi de gama alta (con suficiente RAM), para tareas de generación de texto sin conexión.
- Experimentación académica con cuantización: sirve como caso de estudio para medir la degradación de calidad entre f16 y Q2_K en un modelo de 1.7B.
- Generación de texto en entornos con GPU de consumo: una RTX 3060 de 12 GB puede alojar la versión f16 completa o varias instancias en Q4, útil para pruebas de throughput.
- Filtrado y clasificación de texto simple: tareas de etiquetado o resumen corto donde la latencia prima sobre la precisión máxima, aprovechando el reducido tamaño del modelo.
- Integración en pipelines de CI para pruebas de regresión: al ser ligero, puede ejecutarse en runners con CPU para validar prompts y plantillas sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de 1.7B):
  - f16: en torno a 3,4-3,8 GB de pesos.
  - Q8_0: en torno a 1,8-2,0 GB.
  - Q5_K_M: en torno a 1,2-1,4 GB.
  - Q4_K_M: en torno a 1,0-1,2 GB.
  - Q2_K: en torno a 0,7-0,9 GB.
  - Añadir overhead de contexto KV cache, variable según longitud de contexto (no disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para f16 (GTX 1650, RTX 3050); 6-8 GB (RTX 3060, RTX 4060) para cuantizaciones Q5-Q8 con contexto amplio.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; en Q4 o inferior incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Sijo-1.7B-GGUF | ~1,7B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face (Qwen) |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face (Meta) |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face (HuggingFaceTB) |

La comparativa se ofrece como referencia de categoría; no se dispone de datos de rendimiento de Sijo-1.7B que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad.
- Riesgo de alucinación: inherente a modelos de 1.7B, especialmente en tareas de razonamiento complejo o conocimiento factual; sin datos que lo cuantifiquen.
- Limitaciones de contexto e idioma: desconocidas; no se puede garantizar soporte multilingüe ni ventanas largas.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible consultar el repositorio original myjellylabs/Sijo-1.7B antes de cualquier despliegue en producción.
- Origen del modelo base incierto: la organización myjellylabs no aporta documentación pública verificable en la información proporcionada.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): pueden degradar notablemente la coherencia y la calidad del texto; se recomienda Q4_K_M o superior para uso real.
- Sin soporte documentado de tool calling ni agentes: no asumir estas capacidades sin validación empírica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sijo-1.7B-GGUF
- Modelo base original: https://huggingface.co/myjellylabs/Sijo-1.7B
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
