# DreamFoundries/BotPsy-0.8B-4bit

## Resumen

BotPsy-0.8B-4bit es una cuantizacion de 4 bits, en formato MLX, del modelo base qvac/BotPsy-0.8B, publicada por DreamFoundries. El modelo esta disenado para generacion de texto orientada a agentes, con enfasis explicito en tool calling y function calling, y con el objetivo declarado de ejecutarse en dispositivo (on-device) y en entornos edge. Su tamano reducido y su cuantizacion lo sitúan en la categoria de modelos pequenos para inferencia local en hardware de consumo.

El repositorio declara 752.393.024 parametros reales en los pesos safetensors, lo que lo situa en torno a los 0,75 mil millones de parametros, ligeramente por debajo de la denominacion comercial "0.8B". El tag de arquitectura es qwen3_5, lo que indica una base derivada de la familia Qwen 3.5, aunque la model card publicada no aporta detalles sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion.

La relevancia actual del modelo reside en su combinacion de licencia Apache 2.0, formato MLX optimizado para Apple Silicon y orientacion a agentes con tool calling, lo que lo hace candidato para prototipos de asistentes locales y automatizacion ligera sin dependencia de la nube. No obstante, la informacion publica disponible es muy limitada: no hay benchmarks, no hay descripcion del dataset y no hay documentacion tecnica mas alla de los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tag qwen3_5; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se distribuye como una cuantizacion de 4 bits en formato MLX del modelo base qvac/BotPsy-0.8B. El tag de arquitectura qwen3_5 sugiere una base derivada de la familia Qwen 3.5, pero la model card no especifica la estructura exacta (numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa). Tampoco se documenta si el modelo base emplea mezcla de expertos; el recuento de parametros y la ausencia de un campo de parametros activos apuntan a un transformer denso.

No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre el proceso de cuantizacion aplicado (grupo de cuantizacion, calibracion, etc.). La unica informacion tecnica verificable es el recuento de parametros en safetensors y el tamano del repositorio (0,4 GB), coherente con una cuantizacion de 4 bits de un modelo de aproximadamente 0,75 mil millones de parametros.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline text-generation).
- Tool calling y function calling, segun los tags del repositorio.
- Orientacion a flujos agenticos (tags agent y agentic).
- Ejecucion on-device y en entornos edge (tags on-device y edge).
- Compatibilidad con el ecosistema MLX para Apple Silicon.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- No se documentan capacidades de vision, audio, thinking mode ni matematicas avanzadas.

## Casos de uso

- Asistente local en macOS: el modelo puede desplegarse con MLX en equipos Apple Silicon para generar respuestas conversacionales y ejecutar llamadas a herramientas locales (calendario, ficheros, shell) sin enviar datos a la nube, gracias a su tamano reducido y su cuantizacion de 4 bits.
- Automatizacion de agentes en el borde: al soportar function calling, puede integrarse en pipelines donde un dispositivo ligero decide que herramienta invocar (por ejemplo, consultas a una API interna o lectura de sensores) y sintetiza la respuesta final.
- Prototipado rapido de asistentes conversacionales: su licencia Apache 2.0 y su huella de 0,4 GB permiten incluirlo en prototipos y demos sin coste de licencia ni infraestructura GPU dedicada.
- Enrutamiento de intenciones en aplicaciones moviles: un modelo de este tamano puede clasificar la intencion del usuario y derivar la peticion a un modelo mayor o a un servicio especifico, reduciendo coste y latencia en el camino critico.
- Educacion y experimentacion: sirve como banco de pruebas para estudiar cuantizacion 4-bit en MLX, comparar el comportamiento del modelo base frente a su version cuantizada y medir el impacto en la calidad de las llamadas a herramientas.
- Asistentes offline en entornos con conectividad limitada: al ejecutarse en dispositivo, puede ofrecer respuestas y ejecucion de acciones locales en escenarios sin red, como terminales de campo o dispositivos embebidos con Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,4 GB en pesos de 4 bits; la memoria en tiempo de ejecucion depende del contexto y del backend, pero deberia mantenerse en el rango de 1 a 2 GB para contextos moderados.
- GPU recomendadas: al estar en formato MLX, esta optimizado para Apple Silicon (series M1, M2, M3, M4); no se documenta soporte para GPU NVIDIA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada; en GPU NVIDIA consumer requeriria conversion a otro formato (por ejemplo, GGUF) no incluida en este repositorio.
- Opciones de despliegue: MLX (libreria declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DreamFoundries/BotPsy-0.8B-4bit | 752.393.024 | no disponible | Apache 2.0 | safetensors (MLX, 4-bit) | Orientado a tool calling y edge |
| qvac/BotPsy-0.8B (modelo base) | no disponible | no disponible | Apache 2.0 | no disponible | Version sin cuantizar del mismo modelo |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (segun documentacion publica de la familia) | Apache 2.0 | safetensors, GGUF | Alternativa pequena de proposito general |
| Llama 3.2 1B Instruct | 1,2B | 131.072 tokens (segun documentacion publica) | Llama 3.2 Community License | safetensors, GGUF | Alternativa pequena con licencia no Apache |

La comparativa con modelos de terceros se basa en caracteristicas publicas ampliamente documentadas; no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Solo soporta ingles segun el campo language; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinacion; se desconoce el comportamiento en dominios sensibles.
- La model card no documenta la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Al ser una cuantizacion de 4 bits, puede degradarse la precision en tareas de razonamiento o en la generacion de llamadas a herramientas complejas frente al modelo base.
- El formato MLX limita el despliegue a Apple Silicon; no hay pesos GGUF ni safetensors estandar para otros backends.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base y de los datos de entrenamiento originales antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria.
- No hay informacion sobre el proceso de cuantizacion ni sobre posibles artefactos introducidos por este.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DreamFoundries/BotPsy-0.8B-4bit
- Modelo base: https://huggingface.co/qvac/BotPsy-0.8B
- Licencia del modelo base: https://huggingface.co/qvac/BotPsy-0.8B/blob/main/LICENSE
