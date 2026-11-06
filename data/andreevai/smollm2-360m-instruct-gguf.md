# Andreevai/SmolLM2-360M-Instruct-GGUF

## Resumen

SmolLM2-360M-Instruct-GGUF es la distribución en formato GGUF del modelo SmolLM2-360M-Instruct desarrollado por Hugging Face, publicada por el usuario Andreevai. Se trata de una cuantización del modelo original de 361.821.120 parámetros, convertida mediante `llama.cpp` y pensada para inferencia local ultrarrápida en dispositivos de borde (edge), teléfonos móviles, Raspberry Pi y estaciones de trabajo de desarrollador. El modelo base pertenece a la familia SmolLM2, disponible en tres tamaños (135M, 360M y 1.7B), diseñada específicamente para ejecución on-device.

El problema que resuelve es la necesidad de un asistente conversacional de muy bajo consumo de memoria que quepa en dispositivos con recursos limitados. Con cuantizaciones que van desde 258 MB (Q4_K_M) hasta 368 MB (Q8_0), el modelo puede desplegarse en entornos donde un modelo de miles de millones de parámetros sería inviable. La relevancia actual reside en la demanda creciente de IA generativa local, privada y sin dependencia de API en la nube.

Arquitectura transformer decoder-only, licencia Apache 2.0, idioma soportado únicamente inglés según la model card, y plantilla de chat ChatML. El repositorio ocupa 0.9 GB e incluye tres variantes de cuantización GGUF listas para usar con Ollama o `llama.cpp`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (258 MB), Q5_K_M (276 MB), Q8_0 (368 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del SmolLM2-360M-Instruct de Hugging Face, que emplea una arquitectura transformer decoder-only. La model card de esta distribución no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO; esa información correspondería a la model card del modelo base original, no incluida en la información proporcionada. La familia SmolLM2 se presenta como una mejora significativa sobre SmolLM1 en seguimiento de instrucciones, conocimiento y razonamiento, según los resultados de búsqueda.

La innovación técnica de esta publicación concreta es la conversión a GGUF mediante `llama.cpp`, que permite la ejecución en CPU y en hardware de bajos recursos con cuantizaciones de 4, 5 y 8 bits. El modelo utiliza la plantilla de chat ChatML con tokens especiales `<|im_start|>` y `<|im_end|>`, y define `<|im_end|>` y `<|endoftext|>` como tokens de parada. No se documentan en la información disponible innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con ajuste por instrucciones (instruct).
- Seguimiento de instrucciones y respuesta a preguntas de conocimiento general.
- Razonamiento básico y resolución de tareas simples, mejorado respecto a SmolLM1 según la documentación de la familia.
- Generación de código sencillo (la model card incluye un ejemplo de petición de script Python para hacer ping a una API).
- Conversación multi-turno mediante plantilla ChatML.
- Ejecución local en dispositivos de borde, móviles y Raspberry Pi.
- Compatibilidad con Ollama, `llama.cpp` y endpoints compatibles (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).
- Modo thinking: no disponible.

## Casos de uso

- Asistente conversacional en dispositivos de borde: con la cuantización Q4_K_M (258 MB), el modelo cabe en móviles, Raspberry Pi o routers con poca RAM y puede ofrecer respuestas conversacionales sin conexión a la nube, preservando la privacidad del usuario.
- Autocompletado y generación de texto en editores locales: integrado vía `llama.cpp` en un plugin de editor, el modelo puede sugerir frases o completar párrafos en inglés con latencia baja al ejecutarse en CPU.
- Prototipado rápido de aplicaciones de chat: un desarrollador puede levantar un endpoint conversacional con Ollama en minutos usando el enlace directo `hf.co/Andreevai/SmolLM2-360M-Instruct-GGUF`, sin necesidad de GPU ni de infraestructura de servidor.
- Filtrado y clasificación de texto ligera: el modelo puede reformular o resumir entradas cortas en inglés dentro de pipelines de preprocesamiento que se ejecutan en el mismo dispositivo que captura los datos.
- Educación y demos de IA: al ocupar menos de 400 MB, es adecuado para talleres, notebooks y entornos docentes donde se quiere mostrar el funcionamiento de un LLM sin depender de hardware especializado.
- Generación de scripts simples en asistentes de línea de comandos: la model card documenta su uso para peticiones como escribir un script Python de ping a una API, lo que lo hace útil en herramientas CLI de ayuda al desarrollo.
- Pruebas de integración continua de pipelines de inferencia: sirve como modelo de referencia barato para validar plantillas ChatML, tokens de parada y flujos de Ollama/`llama.cpp` antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 258 MB para Q4_K_M, 276 MB para Q5_K_M y 368 MB para Q8_0, más el overhead del runtime de `llama.cpp` u Ollama.
- GPU recomendadas: no se requieren GPU; el modelo está pensado para CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) puede ejecutarlo, pero resulta sobredimensionada para este tamaño.
- Cabe en cualquier GPU consumer e integrada, así como en dispositivos de borde: móviles, Raspberry Pi y sistemas con menos de 1 GB de RAM libre.
- Opciones de despliegue: Ollama (`ollama run hf.co/Andreevai/SmolLM2-360M-Instruct-GGUF:...`), `llama.cpp` (`llama-cli`), y cualquier runtime compatible con GGUF. vLLM y TGI no están documentados para este repositorio en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card solo califica la inferencia como "ultra-fast" en dispositivos de borde sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Andreevai/SmolLM2-360M-Instruct-GGUF | 361.821.120 | no disponible | apache-2.0 | GGUF, Ollama, llama.cpp |
| unsloth/SmolLM2-360M-Instruct-GGUF | 360M (mismo modelo base) | no disponible | apache-2.0 (heredada del base) | GGUF |
| mav23/SmolLM2-360M-Instruct-GGUF | 360M (mismo modelo base) | no disponible | no disponible | GGUF |
| QuantFactory/SmolLM2-360M-Instruct-GGUF | 360M (mismo modelo base) | no disponible | no disponible | GGUF |

Las alternativas encontradas son cuantizaciones del mismo modelo base SmolLM2-360M-Instruct por otros autores; no se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada. Como modelo de la misma categoría (LLM compacto on-device) podría citarse la familia SmolLM2 en sus otros tamaños (135M y 1.7B), pero no se aportan especificaciones detalladas de esas variantes en la búsqueda.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Tamaño reducido: con 360M parámetros, la capacidad de razonamiento, conocimiento factual y coherencia en contextos largos es limitada en comparación con modelos mayores; riesgo elevado de alucinación en preguntas factuales.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al ser un modelo pequeño entrenado con datos web, es probable que herede sesgos del corpus, aunque no se aportan datos concretos.
- Contexto: la longitud de contexto no está indicada en la información proporcionada, lo que impide planificar casos de uso con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base original de Hugging Face antes de desplegarlo en producción.
- Repositorio de terceros: esta publicación la mantiene el usuario Andreevai, no Hugging Face; la model card la describe como "official GGUF quantizations", pero no se trata de un repositorio oficial de la organización. Se recomienda validar la integridad de los ficheros antes de usarlos en producción.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Sin datos de benchmarks ni de latencia: no es posible estimar con precisión su calidad frente a alternativas sin evaluaciones publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Andreevai/SmolLM2-360M-Instruct-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Cuantización alternativa de unsloth: https://huggingface.co/unsloth/SmolLM2-360M-Instruct-GGUF
- Cuantización alternativa de mav23: https://huggingface.co/mav23/SmolLM2-360M-Instruct-GGUF
- Cuantización alternativa de QuantFactory: https://huggingface.co/QuantFactory/SmolLM2-360M-Instruct-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/smollm2-360m-instruct.html
- Estadísticas en OpenModelStats: https://openmodelstats.com/models/quantfactory/smollm2-360m-instruct-gguf
