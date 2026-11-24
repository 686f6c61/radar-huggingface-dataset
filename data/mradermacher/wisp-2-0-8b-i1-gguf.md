# mradermacher/Wisp-2-0.8B-i1-GGUF

## Resumen

Wisp-2-0.8B-i1-GGUF es una colección de cuantizaciones GGUF (con y sin imatrix) del modelo base philipjohnbasile/Wisp-2-0.8B, publicada por mradermacher. El modelo original es un modelo de lenguaje especializado en código y autocompletado (code completion, fill-in-the-middle), con arquitectura derivada de la familia Qwen3.5 y un mecanismo de atención denominado gated-deltanet. Con 752.393.024 parámetros reales (etiquetado comercialmente como 0,8B), está pensado para ejecutarse en hardware modesto, incluidos equipos Apple Silicon, y para tareas de predicción multi-token y decodificación especulativa.

La relevancia de esta ficha radica en que el repositorio no contiene pesos en formato transformers, sino únicamente archivos GGUF cuantizados en una amplia gama de tipos (desde IQ1_S hasta Q6_K), lo que permite desplegar el modelo en CPU, GPU de gama baja y dispositivos con memoria unificada. El tamaño del repo (11,1 GB) refleja la suma de todas las variantes, no el peso de una sola.

La licencia es Apache 2.0, lo que facilita el uso comercial, aunque la información disponible sobre datos de entrenamiento, contexto máximo y benchmarks es muy limitada: la model card del cuantizador se limita a describir el proceso de cuantización y no aporta detalles técnicos del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 con atención gated-deltanet (según tags del repo) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, IQ4_XS, IQ4_NL, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas i1, con imatrix) |
| Idiomas soportados | code (según metadatos; no se declaran idiomas naturales) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado; no se incluyen safetensors en este repo) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags del repositorio, que apuntan a una base Qwen3.5 con atención gated-deltanet. Este tipo de atención se asocia a mecanismos lineales con estado recurrente y compuertas, orientados a eficiencia en secuencias largas. El modelo está etiquetado como especializado en code completion, autocompletado, fill-in-the-middle (FIM), predicción multi-token y decodificación especulativa, lo que sugiere un entrenamiento orientado a tareas de completado de código más que a chat general.

No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones adicionales como decodificación especulativa nativa más allá de la mención en los tags. El repositorio es una cuantización, no el modelo original, por lo que los detalles de entrenamiento deben consultarse en la model card del modelo base philipjohnbasile/Wisp-2-0.8B, que no se ha proporcionado.

## Capacidades

- Generación y completado de código en modo fill-in-the-middle (FIM), adecuado para autocompletado en editores.
- Predicción multi-token, orientada a acelerar la generación en entornos de autocompletado.
- Compatibilidad con decodificación especulativa (según tags).
- Soporte de conversación básica (tag "conversational").
- Ejecución en Apple Silicon y entornos con memoria unificada.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades multilingües de lenguaje natural: no disponibles en los metadatos; solo se declara el idioma "code".
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Autocompletado en editores de código: el modelo está entrenado para FIM y predicción multi-token, por lo que puede integrarse en plugins de IDE para sugerir líneas o bloques mientras el desarrollador escribe, con latencia baja gracias a su tamaño reducido.
- Asistente de código en local para equipos Apple Silicon: al ofrecerse cuantizaciones desde IQ1_S hasta Q6_K, puede ejecutarse en un Mac con memoria unificada sin GPU dedicada, útil para entornos de desarrollo sin conexión.
- Generación de tests unitarios a partir de firmas de funciones: el modo FIM permite completar el cuerpo de pruebas dado el contexto del código existente.
- Relleno de huecos en refactorizaciones: dado un fragmento de código con una sección marcada, el modelo completa la parte faltante respetando el estilo del proyecto.
- Prototipado rápido de pipelines de CI/CD: al ser Apache 2.0 y ejecutable en CPU, puede incorporarse en scripts de validación o generación de documentación técnica sin coste de licencia.
- Educación y aprendizaje de programación: un modelo pequeño y desplegable en local permite ofrecer sugerencias en entornos docentes sin depender de servicios en la nube.
- Generación de código en entornos con restricciones de privacidad: al ejecutarse localmente, evita enviar código propietario a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,4 GB (IQ1_S) y 0,7 GB (Q6_K) según el archivo GGUF; el modelo completo en precisión original rondaría 1,5 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este tamaño, pero compatibles.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (0,75B) se espera throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wisp-2-0.8B (este) | 752M | no disponible | Apache 2.0 | GGUF (i1) | Especializado en FIM y autocompletado |
| Qwen2.5-Coder-0.5B | 494M | 32K (según versión) | Apache 2.0 | safetensors, GGUF | Referencia en código de tamaño similar; datos no verificados en esta ficha |
| StarCoder2-3B | 3B | 16K | BigCode OpenRAIL-M | safetensors, GGUF | Mayor tamaño y contexto, licencia más restrictiva |
| CodeGemma-2B | 2B | 8K | Gemma Terms | safetensors, GGUF | Orientado a FIM, licencia no Apache |

La comparación se basa en características generales de la categoría; no se dispone de benchmarks del modelo Wisp-2-0.8B para contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre código, puede reproducir sesgos presentes en repositorios públicos.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en código puede producir APIs o funciones inexistentes.
- Limitaciones de contexto e idioma: solo se declara el idioma "code"; no hay información sobre longitud de contexto ni soporte de lenguaje natural más allá del tag "conversational".
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales.
- Caveat para producción: las cuantizaciones de muy baja precisión (IQ1_S, IQ2_*) degradan la calidad; para uso en producción se recomienda Q4_K_M o superior.
- El repositorio contiene únicamente GGUF; no incluye safetensors ni tokenizador en formato transformers, por lo que no es directamente cargable con la librería transformers pese al tag.
- No se dispone de información sobre tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en flujos agénticos complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Wisp-2-0.8B-i1-GGUF
- Modelo base: https://huggingface.co/philipjohnbasile/Wisp-2-0.8B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Wisp-2-0.8B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Wisp-2-0.8B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
