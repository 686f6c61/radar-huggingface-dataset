# jianchen0311/Qwen3.8-27B-Uncensored-Splash

## Resumen

Qwen3.8-27B-Uncensored-Splash es un paquete de pesos publicado por el usuario jianchen0311 en Hugging Face, creado el 20 de septiembre de 2026. No se trata de un entrenamiento nuevo, sino de una conversion al formato Splash del modelo comunitario orcarouter/Qwen3.8-27B-Uncensored-MLX, reutilizando sus pesos afinados en 4 bits afines (MLX) y el borrador DFlash2 de 4 bits afines de Inco AI. El resultado se sirve con la herramienta Splash sobre Apple Silicon, con plantilla de chat propia y soporte de vision.

El problema que resuelve es de despliegue: empaqueta un modelo de 27B en 4 bits, con decodificacion especulativa, para ejecutarse en local en equipos Apple M3 o superiores con memoria unificada. El repositorio ocupa 17,4 GB y la primera ejecucion descarga aproximadamente esa misma cantidad. La etiqueta "uncensored" indica que el comportamiento de rechazo fue modificado en el modelo de origen, no en esta conversion.

Es relevante ahora porque ejemplifica dos tendencias simultaneas: la distribucion de modelos en formatos de inferencia especificos de plataforma (aqui, el runtime Splash para macOS) y la comunidad de ajustes sin censura sobre familias tipo Qwen. Conviene subrayar que el autor no publica benchmarks de calidad ni validacion amplia: solo declara que se ha probado la compatibilidad de servido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base declarado: Qwen3.8-27B, con vision) |
| Parametros totales | no disponible (27B segun la nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afines (MLX) en pesos y en el borrador DFlash2; no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | pesos de 4 bits afines (MLX) empaquetados para el runtime Splash; no se especifica safetensors ni GGUF |
| Tamano del repositorio | 17,4 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | splash |
| Inferencia | false (no apto para el pipeline generico de transformers) |
| Modelos base | orcarouter/Qwen3.8-27B-Uncensored-MLX e incoai/Qwen3.8-27B-DFlash2 |
| Plataforma | Apple Silicon (M3 o superior), macOS 26.4 o posterior |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. Lo unico declarado es que se trata de una conversion: se toman los pesos de 4 bits afines del modelo comunitario OrcaRouter (el mismo autor lo etiqueta como la variante "Uncensored") y el borrador DFlash2 de 4 bits afines de Inco AI. La innovacion tecnica del paquete es, por tanto, de inferencia y no de entrenamiento: decodificacion especulativa con un modelo borrador de 4 bits, plantilla de chat de Splash y soporte de vision.

Un detalle relevante para la reproducibilidad: el autor indica expresamente que el borrador se reutiliza del paquete estandar Qwen3.8-27B y no se ha reentrenado para esta variante. Las revisiones de componentes y los hashes de los artefactos quedan registrados en manifest.json. El front matter incluye la etiqueta inference: false, lo que implica que el repositorio no esta pensado para cargarse con el pipeline generico de transformers.

## Capacidades

- Generacion de texto conversacional mediante la plantilla de chat incluida en Splash.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el paquete incorpora vision.
- Decodificacion especulativa mediante el borrador DFlash2 de 4 bits afines, orientada a reducir latencia en el mismo hardware.
- Modo de comportamiento sin censura: el comportamiento de rechazo esta modificado en el modelo de origen (OrcaRouter), no en la conversion.
- Integracion con agentes ya instalados en el equipo: la CLI permite conectar Claude, Codex, OpenCode y Hermes mediante el comando splash correspondiente.
- Servido local con interfaz web en http://127.0.0.1:8000.
- Soporte multilingue: no disponible.
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso explicito (thinking mode): no documentado.

## Casos de uso

- Asistente conversacional local en un Mac: el modelo se sirve con splash serve y expone una interfaz web en el puerto 8000, de modo que el usuario mantiene las conversaciones en su propio equipo sin enviar datos a servicios externos.
- Agente de programacion sobre repositorio local: la CLI permite conectar Codex o Claude instalados, de forma que el agente usa el modelo como backend local en lugar de una API remota; encaja en equipos Apple Silicon con 48 GB o mas de memoria unificada.
- Analisis de capturas e imagenes junto a texto: al declarar el pipeline image-text-to-text, permite describir, resumir o extraer informacion de imagenes acompañadas de instrucciones textuales, por ejemplo para documentar interfaces o revisar material grafico.
- Generacion creativa sin filtros de rechazo: para redaccion de ficcion, guiones o narrativa con tematicas adultas donde los modelos alineados suelen rechazar la peticion; es el uso previsto por la etiqueta "uncensored".
- Investigacion sobre alineacion y comportamiento de rechazo: comparar las respuestas de esta variante frente a la version alineada del mismo modelo base permite estudiar como cambia la tasa de rechazo sin modificar el resto del pipeline.
- Red teaming y evaluacion de seguridad: al no aplicar politicas de rechazo, sirve para generar solicitudes y respuestas adversarias controladas en entornos de prueba aislados, siempre con supervision humana.
- Pruebas de decodificacion especulativa: permite medir en hardware Apple la tasa de aceptacion del borrador DFlash2 sobre pesos de un ajuste comunitario distinto del original, un escenario util para investigacion de inferencia.
- Despliegue de demostraciones sin conectividad: al ser un paquete local de 17,4 GB, puede usarse en entornos sin red o con requisitos de confidencialidad estrictos, como laboratorios o formaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que se ha probado la compatibilidad de servido y que no se reclama ningun benchmark amplio de calidad del modelo. Tampoco se publican metricas de latencia ni de throughput.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon M3 o superior, con macOS 26.4 o posterior. No se documenta soporte para CUDA, ROCm ni CPU x86.
- Memoria unificada: minimo 36 GB, recomendado 48 GB o mas, segun la model card.
- Descarga inicial: aproximadamente 17,4 GB (tamano del repositorio), que se descarga en la primera ejecucion.
- Cuantizacion: pesos de 4 bits afines, lo que reduce el espacio respecto a un modelo de 27B en 16 bits, pero el requisito oficial de memoria (36 GB) ya incluye el margen del runtime.
- Cabe en GPU de consumo: no aplicable en el sentido habitual, ya que no se soportan GPU discretas; el equivalente es memoria unificada en Mac con M3 o superior.
- Opciones de despliegue: el runtime Splash (brew install incoai/tap/splash), con splash serve --model y clientes de agente mediante splash claude, splash codex, splash opencode o splash hermes. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables con datos publicados de rendimiento. La comparacion mas directa es con los dos artefactos de los que deriva este paquete:

| Modelo | Relacion | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| jianchen0311/Qwen3.8-27B-Uncensored-Splash | Conversion a formato Splash con vision y plantilla de chat | no disponible (27B por nomenclatura) | no disponible | apache-2.0 | Publicado, 0 descargas y 0 likes en el momento de la consulta |
| orcarouter/Qwen3.8-27B-Uncensored-MLX | Modelo base de pesos (ajuste comunitario sin censura, 4 bits afines MLX) | no disponible | no disponible | no disponible | Origen de los pesos |
| incoai/Qwen3.8-27B-DFlash2 | Modelo base del borrador de decodificacion especulativa | no disponible | no disponible | no disponible | Borrador reutilizado, no reentrenado |

Frente a alternativas de la misma categoria (modelos abiertos de ~27B en 4 bits para uso local), no hay datos de benchmarks en la informacion disponible que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan evaluaciones de sesgo; al derivar de un ajuste comunitario sin censura, es probable que el comportamiento en temas sensibles difiera del de un modelo alineado, pero no hay mediciones publicadas.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay datos que permitan estimar la tasa de alucinacion de esta conversion concreta.
- Comportamiento de rechazo modificado: el modelo puede generar contenido que otros modelos rechazarian. Requiere supervision y filtros adicionales en cualquier despliegue orientado a usuarios finales.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no estan documentados, por lo que no se puede garantizar un rendimiento correcto en castellano ni en conversaciones de contexto largo.
- Sin validacion amplia: el propio autor indica que solo se ha probado la compatibilidad de servido y que no se reclama ningun benchmark de calidad. El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- Licencia: el paquete se declara apache-2.0, lo que en principio permite uso comercial, pero los modelos base declarados (orcarouter/Qwen3.8-27B-Uncensored-MLX e incoai/Qwen3.8-27B-DFlash2) son artefactos de terceros cuyas condiciones conviene verificar antes de un uso en produccion.
- Bloqueo de plataforma: depende del runtime Splash y de Apple Silicon con macOS 26.4 o superior. No es desplegable en servidores Linux con GPU NVIDIA, lo que limita su uso en infraestructura de produccion convencional.
- Formato no interoperable: al no publicarse pesos en safetensors ni GGUF, no puede cargarse directamente en vLLM, llama.cpp, Ollama o TGI.
- Borrador no reentrenado: la decodificacion especulativa usa un borrador del paquete estandar, no adaptado a estos pesos, por lo que la tasa de aceptacion puede ser inferior a la esperada. No se publican mediciones al respecto.
- Fecha de creacion muy reciente (20 de septiembre de 2026) y sin historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jianchen0311/Qwen3.8-27B-Uncensored-Splash
- Modelo base de pesos (OrcaRouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Modelo base del borrador (Inco AI DFlash2): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Repositorio de Splash: https://github.com/incoai/splash
- Blog de Inco AI sobre Splash: https://inco.ai/blog/splash/
