# ahmedihamdy/Ornith-1.5-9B-MLX-4bit-vision

## Resumen

Ornith-1.5-9B-MLX-4bit-vision es una compilacion comunitaria del modelo multimodal Ornith 1.5 9B, desarrollada por el usuario ahmedihamdy, que reincorpora la torre de vision original del modelo base ornith-ai/Ornith-1.5-9B a la version cuantizada a 4 bits para MLX (ornith-ai/Ornith-1.5-9B-MLX-4bit). El resultado es un modelo de imagen-texto a texto que ocupa aproximadamente 5,95 GB en disco y esta pensado para ejecutarse de forma local y privada en Macs con Apple Silicon.

El modelo base pertenece a la familia Qwen 3.5 (etiqueta qwen3_5 en los tags), con 8.953.803.264 parametros totales segun los pesos en safetensors. La torre de vision se mantiene a precision completa bf16 (27 bloques, 456M parametros), mientras que los pesos de texto conservan la cuantizacion a 4 bits del modelo original sin recuantizar. Todo el conjunto se distribuye bajo licencia MIT.

Su relevancia radica en que permite inferencia multimodal local en hardware de consumo Apple, algo poco habitual en modelos de este tamano, y en que el proceso de construccion esta documentado y verificado (coincidencia de 24 de 24 tensores de texto muestreados y registros SHA-256 de cada archivo). Es una compilacion no oficial: el credito del modelo corresponde a sus autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5) con torre de vision; pesos de texto cuantizados a 4 bits para MLX |
| Parametros totales | 8.953.803.264 (8,95B); torre de vision: 456M a bf16 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (pesos de texto); torre de vision en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); torre en model-vision.safetensors separado; repo de 6,0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen 3.5 con una torre de vision de 27 bloques y 456M parametros. La compilacion combina los pesos de texto cuantizados a 4 bits del repositorio ornith-ai/Ornith-1.5-9B-MLX-4bit (commit a48173b246ac705be75c05bedf1a0666db522d53) con la torre de vision original del modelo ornith-ai/Ornith-1.5-9B (commit 489cb97981b8654bcfcf30ce1f94ed1b62e07b53). Los pesos de texto no se han recuantizado: se mantienen byte a byte respecto al origen.

La construccion incluye una verificacion de compatibilidad entre torre y pesos de texto, ya que una torre de vision solo funciona con los pesos con los que fue entrenada. Se comprobo que 24 de 24 tensores de texto muestreados coinciden con el modelo base y que la anchura de la torre y el numero de tokens de imagen son coherentes. El archivo astronomical-build.json registra ambos commits y el SHA-256 de cada peso y archivo de configuracion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comprension de imagenes y respuesta a preguntas sobre ellas (pipeline image-text-to-text).
- Entrada multimodal conjunta de imagen y texto.
- Inferencia local y privada: segun la model card, nada de lo que se escribe sale del dispositivo.
- Integracion con la app Astronomical para Mac (Apple Silicon, macOS 14 o posterior).
- Compatibilidad con mlx-vlm para uso programatico en Python.
- Exposicion mediante API compatible con OpenAI y Anthropic a traves de Astronomical, lo que permite usarla con clientes existentes.
- Soporte de agentes de codigo segun la model card (ejemplo con astronomical launch claude).
- No se documentan capacidades de tool calling nativo, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistente visual local en Mac: el modelo responde preguntas sobre imagenes ("What is in this image?") sin enviar datos a la nube, adecuado para fotos personales o material sensible que no debe salir del equipo.
- Automatizacion de catalogacion de imagenes: procesar lotes de fotografias con mlx-vlm para generar descripciones o etiquetas textuales, aprovechando la torre de vision a bf16 para mantener calidad en la percepcion visual.
- Agente de codigo en local: mediante astronomical launch claude, el modelo puede servir como backend de un agente de programacion que se ejecuta integramente en el Mac, util en entornos con requisitos de confidencialidad.
- Prototipado de aplicaciones multimodales: usar la API local compatible con OpenAI o Anthropic para desarrollar y probar integraciones sin coste de API ni dependencia de servicios externos.
- Analisis de documentos con imagenes: extraer informacion de capturas, diagramas o documentos escaneados en flujos de trabajo personales o de investigacion en un equipo Apple Silicon.
- Demos y evaluacion de modelos: investigadores que necesiten comparar el comportamiento multimodal de un modelo de 9B cuantizado a 4 bits en hardware de consumo, con la ventaja de que la construccion es reproducible y verificable por hash.
- Uso educativo y experimentacion: al ser MIT y ejecutable en un portatil, sirve para ensenar tecnicas de cuantizacion, emparejamiento de torres de vision y despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio: el repo ocupa 6,0 GB y la descarga via Astronomical es de aproximadamente 5,6 GB; el modelo completo pesa unos 5,95 GB en disco.
- Hardware objetivo: Macs con Apple Silicon (memoria unificada), macOS 14 o posterior.
- GPU dedicadas (A100, H100, RTX 4090): no se documenta soporte; el formato MLX esta orientado a Apple Silicon, por lo que no se proporcionan estimaciones de VRAM para CUDA.
- Memoria unificada: Astronomical permite configurar cuanta memoria puede usar el modelo, manteniendo el resto del sistema utilizable; no se especifica un minimo exacto en la informacion disponible.
- Despliegue: app Astronomical (descarga desde el catalogo interno), CLI astronomical, libreria mlx-vlm en Python, y API local compatible con OpenAI y Anthropic.
- vLLM, llama.cpp, Ollama o TGI: no se documenta compatibilidad con estos motores en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MLX-4bit-vision | 8,95B (texto 4 bits, vision bf16) | no disponible | Si | MIT | MLX, Apple Silicon |
| ornith-ai/Ornith-1.5-9B-MLX-4bit | no disponible | no disponible | No (sin torre) | MIT | MLX, Apple Silicon |
| ornith-ai/Ornith-1.5-9B | no disponible | no disponible | Si | MIT | safetensors (modelo base completo) |
| Otros modelos multimodales de ~9B | no disponible | no disponible | Si | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles segun el campo language; el rendimiento en castellano no esta garantizado ni documentado.
- Es una compilacion comunitaria, no una release oficial de Ornith; los autores originales no la respaldan.
- La torre de vision se mantiene en bf16 mientras el texto esta a 4 bits; posibles desajustes de calidad derivados de la cuantizacion del texto no se han evaluado en la informacion disponible.
- No se documentan resultados de benchmarks, por lo que no hay evidencia publicada de calidad frente a alternativas.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan tasas ni evaluaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Longitud de contexto no especificada, lo que dificulta planificar cargas con documentos o conversaciones largas.
- Orientado exclusivamente a Apple Silicon (MLX); no es directamente desplegable en CUDA ni en CPU convencional.
- La licencia MIT permite uso comercial, pero conviene verificar los terminos del modelo base ornith-ai/Ornith-1.5-9B, a los que la model card remite.
- La integridad de la construccion depende de los hashes registrados en astronomical-build.json; conviene verificarlos antes de usar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-9B-MLX-4bit-vision
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Version MLX 4 bits sin vision: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- App Astronomical: https://getastronomical.com/
- Documentacion de la API local: https://getastronomical.com/local-api.html
