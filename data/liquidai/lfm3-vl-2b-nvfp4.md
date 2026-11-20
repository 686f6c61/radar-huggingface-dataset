# LiquidAI/LFM3-VL-2B-NVFP4

## Resumen

LFM3-VL-2B-NVFP4 es la version cuantizada en NVFP4 del modelo multimodal LFM3-VL-2B de Liquid AI, disenado para inferencia en GPU con precision de 4 bits. Se trata de un modelo de imagen-a-texto (image-text-to-text) que combina un codificador visual con un modelo de lenguaje de aproximadamente 1.900 millones de parametros (1.918.181.888 segun los pesos en safetensors). La cuantizacion NVFP4 aplica W4A4 con bloques de 16 valores a los pesos y activaciones de las capas feed-forward del lenguaje, manteniendo en BF16 la atencion, convoluciones, embeddings, la cabeza de salida, las normalizaciones, el codificador visual y el proyector.

El modelo pertenece a la familia LFM3 de Liquid AI, que apuesta por arquitecturas hibridas y eficientes en lugar de transformers densos convencionales. Esta version cuantizada reduce el peso del repositorio a 2,2 GB, lo que facilita su despliegue en GPUs con memoria limitada y en entornos de produccion donde el coste por token y la latencia importan. Soporta 16 idiomas, entre ellos el castellano, y esta pensado para tareas conversacionales y de razonamiento sobre imagenes.

Su relevancia actual radica en que ofrece capacidades multimodales en un formato de 4 bits optimizado para hardware NVIDIA reciente, con soporte previsto para SGLang (actualmente en revision en el repositorio oficial). Es una opcion atractiva para desarrolladores que quieren desplegar un modelo vision-lenguaje pequeno y eficiente sin renunciar a la precision de BF16 en las partes sensibles de la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text de la familia LFM3; el autor remite a la model card original para detalles de arquitectura) |
| Parametros totales | 1.918.181.888 (aprox. 1,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, bloques de 16 valores) en pesos y activaciones de las capas feed-forward del lenguaje; BF16 en atencion, convoluciones, embeddings, cabeza de salida, normas, codificador visual y proyector |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | safetensors (repo de 2,2 GB) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base LFM3-VL-2B; la model card de esta version cuantizada remite explicitamente a la model card original para los detalles de arquitectura y uso. Lo que si se conoce es que se trata de un modelo multimodal de tipo image-text-to-text que integra un codificador visual y un proyector para alinear representaciones visuales con el espacio del modelo de lenguaje. La familia LFM3 de Liquid AI se caracteriza por explorar arquitecturas eficientes, aunque no se especifica en la informacion disponible si emplea un transformer hibrido, SSM u otra variante.

En cuanto al proceso de cuantizacion, esta version aplica NVFP4 (formato de punto flotante de 4 bits de NVIDIA) con cuantizacion de pesos y activaciones (W4A4) en bloques de 16 valores, limitada a las capas feed-forward del lenguaje. El resto de componentes criticos para la estabilidad numerica y la calidad visual permanecen en BF16. Los ajustes de ventana deslizante (sliding-window) y RoPE no se modifican respecto al modelo original. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto e inferencia multimodal: el modelo recibe imagenes y texto y genera respuestas en lenguaje natural.
- Razonamiento sobre imagenes: pipeline image-text-to-text, adecuado para descripcion visual, respuesta a preguntas sobre imagenes y tareas de comprension visual.
- Soporte multilingue en 16 idiomas, incluido el castellano (es), con cobertura de arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Formato conversacional: etiquetado como "conversational", lo que indica soporte para dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con infraestructuras de despliegue tipo API.
- Soporte de tool calling y parsing de razonamiento: la configuracion de SGLang mostrada en la model card incluye `--reasoning-parser auto` y `--tool-call-parser auto`, lo que indica soporte previsto para function calling y modos de razonamiento.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente en la informacion disponible, pero el soporte de tool calling en SGLang apunta en esa direccion.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla, fotos de productos o documentos, y responder en castellano u otros idiomas soportados. Su tamano compacto (1,9B) permite desplegarlo en GPUs de gama media con baja latencia.
- Descripcion automatica de imagenes en catalogos de e-commerce: generacion de descripciones y metadatos a partir de fotos de producto, con salida multilingue para mercados internacionales.
- Accesibilidad: generacion de descripciones de imagenes para lectores de pantalla o interfaces de asistencia a personas con discapacidad visual, aprovechando la cuantizacion NVFP4 para reducir el coste de inferencia en servidores.
- Moderacion de contenido visual: clasificacion y explicacion de imagenes subidas por usuarios, con respuestas textuales que justifiquen la decision, integrable en pipelines de moderacion.
- Asistencia documental: extraccion de informacion de capturas, formularios o diagramas y respuesta a preguntas sobre ellos en un contexto conversacional.
- Prototipado rapido de aplicaciones vision-lenguaje: gracias a su peso de 2,2 GB y al formato NVFP4, es viable ejecutarlo en entornos de desarrollo con GPUs consumer recientes, acelerando la iteracion antes de escalar a modelos mayores.
- Integracion en agentes con tool calling: el soporte previsto en SGLang con parsers automaticos de razonamiento y de llamadas a herramientas permite construir asistentes que consulten APIs externas a partir de informacion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,2 GB en safetensors, por lo que la inferencia en NVFP4 requiere aproximadamente 2-3 GB de VRAM para los pesos, mas memoria adicional para el codificador visual en BF16, el cache KV y las activaciones. Una estimacion conservadora situa el consumo total en torno a 4-6 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: hardware NVIDIA con soporte de NVFP4 (generaciones recientes con soporte de FP4 nativo). No se especifican modelos concretos en la informacion disponible.
- Compatibilidad con GPU consumer: el reducido tamano del modelo sugiere que puede caber en GPUs consumer con suficiente VRAM, pero la cuantizacion NVFP4 depende del soporte de hardware y software; no se confirma en la informacion disponible que funcione en todas las GPU consumer.
- Opciones de despliegue: SGLang es el backend documentado en la model card, con soporte en revision (sgl-project/sglang#46858). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-NVFP4 | 1,9B | no disponible | imagen-texto | lfm1.0 | Hugging Face (2,2 GB) |
| LFM3-VL-2B (base) | no disponible en la informacion | no disponible | imagen-texto | lfm1.0 | Hugging Face |
| Otros modelos vision-lenguaje de ~2B | no disponible | no disponible | imagen-texto | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en los datos proporcionados, por lo que la comparativa se limita al modelo base del que deriva esta version cuantizada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de esos datos, pero no se aportan detalles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los modelos de ~2B suelen presentar mayor tasa de alucinacion que modelos de mayor tamano, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica. Aunque soporta 16 idiomas, no se detalla el nivel de calidad por idioma ni si el castellano tiene un rendimiento equiparable al ingles.
- Restricciones de licencia: la licencia lfm1.0 es una licencia propia de Liquid AI marcada como "other"; es imprescindible revisar el archivo LICENSE del repositorio antes de un uso comercial, ya que puede incluir restricciones especificas.
- Caveats de produccion: la cuantizacion NVFP4 puede degradar ligeramente la calidad respecto al modelo en BF16, especialmente en tareas sensibles a la precision numerica. El soporte en SGLang esta en revision, por lo que la integracion en produccion puede requerir esperar a una release estable o compilar desde la rama de desarrollo.
- Dependencia de hardware: NVFP4 requiere soporte especifico de GPU y de la pila de software; no es un formato universalmente portable como GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Pull request de soporte en SGLang: https://github.com/sgl-project/sglang/pull/46858
