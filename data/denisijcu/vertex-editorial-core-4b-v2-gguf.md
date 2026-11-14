# Denisijcu/vertex-editorial-core-4b-v2-gguf

## Resumen

vertex-editorial-core-4b-v2-gguf es un modelo de lenguaje de 4.022.468.096 parametros (aproximadamente 4B) publicado por el usuario Denisijcu en Hugging Face. Se trata de un ajuste fino (fine-tuning) de un modelo base Qwen3-4B, segun indican las etiquetas del repositorio, posteriormente convertido a formato GGUF mediante Unsloth. El nombre del modelo sugiere un enfoque orientado a tareas editoriales, aunque la model card no detalla el proposito concreto ni la composicion del dataset de ajuste.

El modelo se distribuye exclusivamente en formato GGUF cuantizado (Q4_K_M), lo que lo hace desplegable en hardware de consumo mediante llama.cpp y Ollama. El repositorio incluye un Modelfile de Ollama para facilitar el despliegue local. El tamano total del repositorio es de 2,5 GB.

La relevancia de esta ficha es limitada: el modelo no registra descargas ni likes, la licencia no esta especificada, los idiomas soportados no estan declarados y no se han publicado resultados de benchmarks. Cualquier evaluacion de su calidad debe realizarse empiricamente antes de considerarlo para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B, segun etiquetas del repositorio) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `Qwen3-4B.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el repositorio indica conversion desde safetensors via Unsloth |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo parte de Qwen3-4B como base y fue ajustado finamente y convertido a GGUF mediante Unsloth. No se especifica la arquitectura interna mas alla de la herencia del modelo base Qwen3 (transformer denso, no MoE, dado el recuento de parametros activos igual al total). No se detalla el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se emplearon tecnicas de RLHF o DPO.

La unica innovacion tecnica documentada es el uso de Unsloth para acelerar el ajuste fino y la conversion a GGUF, lo que reduce el coste computacional del proceso. No hay informacion sobre decodificacion especulativa, mecanismos de atencion alternativa ni otras optimizaciones.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en el repositorio).
- Ajuste fino orientado a tareas editoriales, segun el nombre del modelo (no documentado explicitamente).
- Despliegue local mediante llama.cpp con soporte de plantillas de chat Jinja (`--jinja`).
- Compatibilidad con Ollama mediante Modelfile incluido.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`).
- Soporte multimodal citado en la model card mediante `llama-mtmd-cli`, aunque no se especifica que modalidades adicionales estan realmente integradas en este ajuste.

## Casos de uso

- Edicion y revision de texto local: el modelo puede utilizarse para tareas de correccion, reescritura o estilo editorial en un entorno sin conexion, dado su tamano reducido y formato GGUF.
- Asistencia conversacional en local: despliegue en estaciones de trabajo sin GPU dedicada mediante llama.cpp con cuantizacion Q4_K_M.
- Prototipado rapido de pipelines editoriales: integracion en scripts de procesamiento de documentos para clasificacion, resumen o generacion de borradores.
- Evaluacion comparativa de ajustes finos: util como caso de estudio para comparar el efecto de un fine-tuning sobre Qwen3-4B frente al modelo base.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, permite procesar textos sensibles sin enviarlos a servicios externos.
- Integracion en herramientas de escritorio: mediante Ollama, puede conectarse a interfaces de chat locales o editores de texto que consuman la API de Ollama.
- Experimentacion con plantillas Jinja: el soporte `--jinja` permite probar formatos de prompt personalizados para tareas editoriales especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion para este ajuste fino concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con cuantizacion Q4_K_M (tamano del archivo publicado), mas overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060); tambien ejecutable en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con al menos 4 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; dependeran del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vertex-editorial-core-4b-v2-gguf | ~4B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face (0 descargas) |
| Qwen3-4B (base) | ~4B | no disponible en esta ficha | safetensors, GGUF | segun Qwen3 (no verificada aqui) | amplia distribucion |
| Ajustes finos comunitarios de Qwen3-4B | ~4B | variable | GGUF | variable | Hugging Face |

La comparacion con el modelo base Qwen3-4B es la referencia natural, pero no se dispone de datos de rendimiento de este ajuste que permitan establecer una diferencia cuantitativa.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos del ajuste fino; al derivar de Qwen3-4B, hereda los sesgos del modelo base, no evaluados aqui.
- Riesgo de alucinacion no cuantificado; sin benchmarks, no hay evidencia de robustez.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Verificar antes de cualquier despliegue en produccion.
- Idiomas soportados no declarados; el comportamiento multilingue es desconocido.
- Longitud de contexto no documentada; no planificar pipelines que dependan de ventanas largas sin verificacion empirica.
- Modelo sin traccion (0 descargas, 0 likes) y creado en 2026-11-14: trazabilidad y mantenimiento inciertos.
- El ajuste fino "editorial" no esta documentado en la model card; el alcance real de la especializacion es desconocido.
- La mencion de soporte multimodal en la model card no garantiza que este ajuste incluya capacidades de vision o audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Denisijcu/vertex-editorial-core-4b-v2-gguf
- Unsloth (herramienta de ajuste y conversion): https://github.com/unslothai/unsloth
