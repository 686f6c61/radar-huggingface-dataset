# danish-foundation-models/DFM-Mimir-v1.8-Mini-GGUF

## Resumen

DFM-Mimir-v1.8-Mini-GGUF es la conversión oficial a formato GGUF del modelo base DFM-Mimir-v1.8-Mini, desarrollado por Danish Foundation Models. Se trata de un modelo de generación de texto de aproximadamente 703,6 millones de parámetros, orientado principalmente al danés (con soporte de inglés), que emplea una arquitectura poco habitual en el ecosistema GGUF: HRM-Text con configuración PrefixLM. Esta release facilita la ejecución local del modelo en CPU mediante una build parcheada de llama.cpp.

El modelo resuelve el problema de desplegar un modelo lingüístico danés de tamano contenido en entornos sin GPU o con recursos limitados, ofreciendo tres precisiones (BF16, Q8_0 y Q4_K_M) con tamanos de descarga de 1,42 GB, 0,76 GB y 0,49 GB respectivamente. La relevancia actual radica en que permite inferencia local de un modelo de fundación danés con licencia Apache 2.0, algo poco frecuente en el ecosistema de modelos nórdicos.

La ficha se centra en las características verificables de esta conversión GGUF; los detalles completos de entrenamiento y evaluación deben consultarse en la model card del modelo fuente, ya que esta release solo documenta el proceso de conversión, validación de artefactos y requisitos de runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRM-Text con configuración PrefixLM (transformer; detalles completos no disponibles en esta release) |
| Parametros totales | 703.595.520 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens (longitud de contexto entrenada) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | danés (da), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo fuente) |

## Arquitectura y entrenamiento

La arquitectura es HRM-Text con configuración PrefixLM, según las etiquetas y la documentación de la release. El repositorio GGUF no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde a la model card del modelo fuente DFM-Mimir-v1.8-Mini, que no se incluye en la información proporcionada.

La innovación técnica destacable de esta release es el proceso de conversión y validación: los 99 tensores de la exportación BF16 se compararon de forma independiente y exacta contra los pesos fuente tras el troceado y la representación de precisión requeridos. Cada precisión supera 724 casos de tokenizer/decoder/chat-template y 19 casos de auditoría independiente del tokenizer de entrenamiento, además de pruebas de generación corta en danés e inglés sobre CPU con contexto de 1024 tokens y presupuesto de respuesta de 32 tokens. El tokenizer se carga directamente desde el tokenizer.json fuente, preservando la plantilla de chat exacta, la configuración PrefixLM y los 256 tokens de byte-fallback; la pre-tokenización GGUF es `gemma4`.

## Capacidades

- Generación de texto conversacional en danés e inglés, con plantilla de chat embebida.
- Soporte de arquitectura PrefixLM, que permite condicionamiento sobre un prefijo de entrada (relevante para tareas de continuación y formato estructurado).
- Tokenizer con 256 tokens de byte-fallback, lo que garantiza cobertura completa de bytes para texto no representado directamente en el vocabulario.
- Capacidades multilingües limitadas a danés e inglés.
- No se documentan en esta release capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documentan capacidades de código o matemáticas específicas.

## Casos de uso

- Generación de texto en danés en entornos sin GPU: el modelo en Q4_K_M ocupa 0,49 GB de descarga y puede ejecutarse en CPU con la build parcheada de llama.cpp, lo que lo hace adecuado para prototipos y aplicaciones de escritorio con requisitos mínimos de hardware.
- Asistentes conversacionales locales para usuarios daneses: la plantilla de chat embebida y el contexto de 4096 tokens permiten mantener conversaciones multi-turno de extensión moderada sin depender de servicios en la nube.
- Procesamiento por lotes de textos daneses en servidores CPU: al no requerir GPU, puede integrarse en pipelines de procesamiento nocturno o en entornos con restricciones de hardware.
- Experimentación académica con arquitecturas PrefixLM: sirve como caso de estudio reproducible para investigar el comportamiento de HRM-Text en formato GGUF con validación de artefactos documentada.
- Aplicaciones de privacidad estricta: al ejecutarse localmente y con licencia Apache 2.0, permite procesar datos sensibles en danés sin enviarlos a terceros.
- Filtrado y clasificación de texto en danés: con contexto de 4096 tokens puede procesar documentos de extensión media para tareas de etiquetado o resumen extractivo, siempre que se valide su calidad en el dominio concreto.
- Base para fine-tuning o destilación sobre danés: al ser un modelo de 703 M de parámetros con licencia permisiva, puede servir como punto de partida para adaptaciones específicas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La release advierte explícitamente que los resultados publicados del modelo fuente no deben tratarse como resultados medidos para estas cuantizaciones, y que las comprobaciones realizadas son verificaciones acotadas de artefactos, no benchmarks completos de calidad cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, el modelo tiene 703,6 M de parámetros y los tamanos de descarga son 1,42 GB (BF16), 0,76 GB (Q8_0) y 0,49 GB (Q4_K_M). El tamano de descarga no equivale al uso de memoria en runtime.
- GPU recomendadas: no disponibles; la release solo documenta pruebas en CPU Linux. No se realizó cualificación nueva en Metal, CUDA ni móvil.
- Compatibilidad con GPU de consumo: no verificada en esta release; el modelo es de tamano reducido, pero la arquitectura HRM-Text/PrefixLM requiere runtime específico.
- Opciones de despliegue: únicamente la build parcheada de llama.cpp con soporte HRM-Text/PrefixLM (revisión `1c979346d78804cf1635a509b3b689a58e5a2546`) o la aplicación DFM Mimir. Stock llama.cpp, Ollama y otros runtimes GGUF arbitrarios no están cualificados para esta arquitectura.
- Latencia y throughput: no disponibles; solo se documentan pruebas de generación corta en CPU con contexto de 1024 tokens y 32 tokens de respuesta, sin cifras de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparaciones con otros modelos, y las diferencias de arquitectura (HRM-Text/PrefixLM frente a transformers estándar) dificultan una comparación directa sin datos medidos.

## Limitaciones y advertencias

- La arquitectura HRM-Text/PrefixLM no es compatible con llama.cpp estándar, Ollama ni runtimes GGUF genéricos; requiere la build parcheada indicada o la app DFM Mimir.
- El contexto entrenado es de solo 4096 tokens, lo que limita tareas que requieran ventanas largas.
- Los idiomas soportados son únicamente danés e inglés; el rendimiento en otros idiomas no está documentado.
- No se han publicado benchmarks de calidad para estas cuantizaciones; los resultados del modelo fuente no son extrapolables.
- Las pruebas de validación son acotadas (casos de tokenizer, plantilla de chat y generaciones cortas) y no constituyen una evaluación completa de calidad.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni evaluaciones de seguridad en esta release.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo fuente y debe verificarse en la model card original cualquier restricción adicional.
- Solo se probó en CPU Linux; el comportamiento en GPU, Metal o móvil no está cualificado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- [Hugging Face: danish-foundation-models/DFM-Mimir-v1.8-Mini-GGUF](https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8-Mini-GGUF)
- [Modelo fuente: danish-foundation-models/DFM-Mimir-v1.8-Mini](https://huggingface.co/danish-foundation-models/DFM-Mimir-v1.8-Mini)
- [llama.cpp parcheado con soporte HRM-Text/PrefixLM](https://github.com/schneiderkamplab/llama.cpp/tree/1c979346d78804cf1635a509b3b689a58e5a2546)
- [validation.json](./validation.json)
- [provenance.json](./provenance.json)
- [SHA256SUMS](./SHA256SUMS)
- [LICENSE](./LICENSE)
