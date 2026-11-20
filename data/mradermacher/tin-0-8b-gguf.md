# mradermacher/tin-0.8b-GGUF

## Resumen

tin-0.8b-GGUF es la versión cuantizada en formato GGUF del modelo tin-0.8b, desarrollado originalmente por cagataydev y convertido por mradermacher. Se trata de un modelo de lenguaje compacto de aproximadamente 752 millones de parámetros (0,75B), diseñado específicamente para ejecución en dispositivo (on-device), con capacidades orientadas a agentes, tool calling y generación de código. El modelo está construido sobre una base etiquetada como qwen3.5 (qwen3_5) y ha sido afinado mediante SFT (supervised fine-tuning).

La relevancia de este modelo radica en su tamaño reducido, que permite desplegarlo en hardware de consumo y en entornos con recursos limitados, manteniendo capacidades de razonamiento agéntico y llamada a herramientas. El repositorio ofrece un conjunto completo de cuantizaciones estáticas que van desde Q2_K (0,5 GB) hasta f16 (1,6 GB), lo que facilita su integración en pipelines de inferencia local mediante llama.cpp u Ollama.

La licencia Apache 2.0 permite uso comercial sin restricciones significativas. El modelo soporta inglés (en) y turco (tr), y su enfoque en tool calling y agentes lo posiciona como una opción para asistentes locales, automatización de tareas y prototipado rápido de agentes autónomos en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base qwen3.5 / qwen3_5, segun tags del autor); detalles no disponibles |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer, según los tags del autor que lo vinculan a la familia qwen3.5 (qwen3_5). El modelo original (cagataydev/tin-0.8b) fue entrenado mediante SFT (supervised fine-tuning), según la información disponible en la model card. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La versión aquí descrita es una conversión a GGUF realizada por mradermacher, que incluye cuantizaciones estáticas. No se han publicado cuantizaciones ponderadas/imatrix por parte del autor de la conversión en el momento de la publicación. No se dispone de información sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés y turco.
- Soporte de tool calling / function calling (etiquetado explícitamente en los tags del modelo).
- Capacidades orientadas a agentes (agent) y razonamiento multi-paso, según los tags del autor.
- Generación de código (tag code).
- Diseñado para ejecución on-device (on-device), lo que implica optimización para recursos limitados.
- Afinado mediante SFT para tareas de instrucción.
- No se dispone de información sobre capacidades de visión, audio o modo thinking explícito.

## Casos de uso

- Asistentes locales en dispositivos de consumo: el modelo, con 0,75B parámetros y cuantizaciones desde 0,5 GB, puede ejecutarse en portátiles y equipos de sobremesa sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo un asistente conversacional privado sin conexión a la nube.
- Automatización de tool calling en agentes: gracias a su soporte explícito de function calling, puede integrarse en flujos donde el modelo decide qué herramienta invocar (APIs, bases de datos, scripts) en un bucle agéntico, con la ventaja de que el bajo coste de inferencia permite muchas llamadas por sesión.
- Prototipado rápido de agentes autónomos: los desarrolladores pueden validar arquitecturas de agentes multi-paso en local antes de escalar a modelos mayores, reduciendo costes de API durante la fase de desarrollo.
- Generación de código en entornos con recursos limitados: puede asistir en autocompletado o generación de fragmentos de código en IDE locales o entornos CI/CD sin depender de servicios externos, útil en entornos con requisitos de privacidad.
- Procesamiento de texto en turco e inglés: aplicaciones de resumen, extracción de información o clasificación en pipelines bilingües, aprovechando el soporte nativo de ambos idiomas.
- Educación y experimentación: modelo accesible para investigadores que necesitan un LLM pequeño para experimentos de fine-tuning, evaluación de cuantizaciones o estudios de eficiencia, dado su tamaño manejable y licencia permisiva.
- Despliegue en edge computing: integración en dispositivos con recursos muy limitados (Raspberry Pi, mini-PC) para tareas de procesamiento de lenguaje natural embebido, donde un modelo mayor no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~0,5 GB de pesos; con overhead de contexto, ~1 GB.
  - Q4_K_M (recomendado): ~0,6 GB de pesos; ~1,2 GB con contexto.
  - Q8_0: ~0,9 GB de pesos; ~1,5 GB con contexto.
  - f16: ~1,6 GB de pesos; ~2,5 GB con contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, GTX 1660 o superiores para un rendimiento cómodo. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. También es posible usar transformers con el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, se espera alta velocidad en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tin-0.8b-GGUF | 0,75B | No disponible | Apache 2.0 | GGUF | Enfoque agente/tool calling, on-device |
| Qwen2.5-0.5B | 0,49B | 32K (tipico) | Apache 2.0 | Safetensors, GGUF | Modelo pequeño generalista de Alibaba |
| Llama-3.2-1B | 1,24B | 128K | Llama 3.2 Community | Safetensors, GGUF | Modelo pequeño de Meta, multilingüe |
| SmolLM2-1.7B | 1,7B | 8K | Apache 2.0 | Safetensors, GGUF | Modelo pequeño de Hugging Face |

Nota: los datos de contexto y parámetros de los modelos comparativos provienen de conocimiento general y podrían no estar actualizados; verificar en sus respectivas model cards. No se dispone de datos de rendimiento comparativo para tin-0.8b.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información proporcionada; como modelo entrenado con SFT sobre datos no especificados, puede heredar sesgos de su corpus de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; la capacidad reducida de parámetros aumenta la probabilidad de generar información incorrecta, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto: la longitud de contexto no está disponible; se recomienda verificar en la model card del modelo base antes de usarlo en tareas que requieran ventanas largas.
- Limitaciones de idioma: solo soporta inglés y turco; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales.
- Caveats para producción: al ser un modelo de 0,75B, su capacidad de razonamiento complejo es limitada; no se recomienda para tareas que requieran alta precisión factual o razonamiento matemático avanzado sin validación humana. Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en producción.
- No se dispone de información sobre el proceso de alineación (RLHF/DPO) ni sobre evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/tin-0.8b-GGUF
- Modelo base: https://huggingface.co/cagataydev/tin-0.8b
- Página de descargas del cuantizador: https://hf.tst.eu/model#tin-0.8b-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
