# khtsly/Luau-Coder-1.0-0.5B-Base

## Resumen

Luau-Coder-1.0-0.5B-Base es un modelo de lenguaje causal de tipo base (solo preentrenamiento) desarrollado por el usuario khtsly y publicado en HuggingFace. Con 524.159.872 parametros y una ventana de contexto nativa de 65.536 tokens, esta especializado en el dominio de Roblox: el lenguaje de programacion Luau y su ecosistema de documentacion, foros de desarrolladores y repositorios. Su tamano reducido lo posiciona como un modelo pensado para inferencia on-device o en entornos con recursos limitados.

La arquitectura es hibrida, no un transformer denso convencional. Combina capas de atencion lineal Kimi DeltaNet con capas de Multi-head Latent Attention (MLA) en un patron de 3 a 1 a lo largo de 32 capas, e incorpora residuales de atencion con granularidad de sub-capa. Esta mezcla busca reducir el coste de la atencion sobre secuencias largas manteniendo capacidad de recuperacion de informacion exacta en una de cada cuatro capas.

El modelo es relevante porque el soporte de modelos especializados en Luau es practicamente inexistente en el ecosistema abierto: la mayoria de asistentes de codigo tratan Luau como un caso marginal de Lua y rinden mal en APIs especificas de Roblox. Se publica bajo licencia Apache-2.0, lo que permite uso comercial, aunque al ser un modelo base requiere ajuste posterior para tareas de instruccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 8 x (3 x (Kimi DeltaNet -> FFN) -> 1 x (Multi-head Latent Attention -> FFN)); atencion lineal + MLA |
| Parametros totales | 524.159.872 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 65.536 tokens nativos |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, con codigo personalizado (tag custom_code, requiere trust_remote_code) |

Especificaciones internas adicionales declaradas por el autor:

| Parametro | Valor |
|---|---|
| Dimension oculta | 1024 |
| Capas | 32 |
| Embedding de tokens | 32.768 (padded), atado a la salida LM |
| Cabezas de atencion lineal (Kimi DeltaNet) | 16, dimension de cabeza 64 |
| Cabezas de Multi-head Latent Attention | 16, dimension de cabeza 64 o 128, dimension sin embedding posicional 64, con output gate |
| Residuales de atencion | Granularidad de sub-capa, tamano de bloque 4 |
| Dimension intermedia del FFN | 2816 |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseno hibrido poco habitual en la franja de 0,5B. De las 32 capas, 24 corresponden a bloques con Kimi DeltaNet (una forma de atencion lineal recurrente con 16 cabezas de dimension 64) y 8 corresponden a bloques con Multi-head Latent Attention, distribuidas en el patron 3:1. La MLA se configura sin dimension de embedding posicional (64) y con output gate, lo que sugiere un esquema de posicionamiento implicito o relativo en lugar de embeddings posicionales absolutos. Los residuales de atencion se aplican con granularidad de sub-capa y tamano de bloque 4, un mecanismo orientado a estabilizar el flujo de gradiente en modelos con componentes recurrentes. El FFN tiene dimension intermedia 2816, coherente con un ratio de expansion de aproximadamente 2,75x sobre la dimension oculta de 1024.

En cuanto al entrenamiento, la model card lo situa explicitamente en fase de preentrenamiento, sin mencion de RLHF, DPO ni ajuste por instrucciones. El corpus declarado combina datos generales de alta calidad (openbmb/Ultra-FineWeb-L3, openbmb/UltraData-Math, HuggingFaceFW/fineweb-edu, HuggingFaceTB/dclm-edu, HuggingFaceTB/smollm-corpus, nampdn-ai/mini-peS2o, Geralt-Targaryen/books3, omarkamali/wikipedia-monthly) con cinco corpus propios del dominio Roblox/Luau: khtsly/roblox_docs_corpus_text, khtsly/luau-stack-hq, khtsly/devforum-roblox-text, khtsly/luau-repo-docs-text y khtsly/luau-org-web-text. No se indica el numero total de tokens de entrenamiento, la mezcla proporcional entre dominios ni la composicion exacta del dataset final, por lo que estos datos quedan como no disponibles.

## Capacidades

- Generacion de texto causal en ingles, en modo continuacion de secuencia (modelo base, sin plantilla de instrucciones).
- Generacion y completado de codigo Luau, con especial enfasis en APIs y patrones del motor Roblox.
- Prediccion de codigo contextual en editores y entornos de desarrollo de Roblox Studio, dado el corpus de documentacion y repositorios incluido.
- Manejo de contextos largos de hasta 65.536 tokens, adecuado para ficheros de codigo extensos, documentacion completa de APIs o hilos largos de foros.
- Capacidad matematica basica derivada de la inclusion de openbmb/UltraData-Math en el corpus, aunque no se documenta su magnitud.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo thinking, vision, audio ni otras modalidades.
- Multilingue: no. El modelo declara unicamente ingles, aunque el dominio Luau contiene identificadores y APIs en ese idioma.

## Casos de uso

- Autocompletado en Roblox Studio: el modelo puede integrarse como motor de completado de codigo dado su preentrenamiento sobre documentacion oficial de Roblox y repositorios Luau, prediciendo llamadas a API y estructuras de script habituales en el motor.
- Generacion de scripts Luau a partir de contexto: en un pipeline de desarrollo, se le puede alimentar un fragmento de codigo existente y dejar que continue la implementacion, aprovechando su ventana de 65.536 tokens para mantener a la vista varios modulos del mismo proyecto.
- Base para ajuste fino supervisado: al ser un modelo base con licencia Apache-2.0, es un punto de partida adecuado para SFT sobre pares instruccion-respuesta especificos de un estudio de Roblox, sin restricciones de uso comercial.
- Indexacion y resumen de documentacion tecnica: puede procesar documentos largos de la API de Roblox en una sola pasada para generar resumenes o extraer firmas de funciones, gracias al contexto nativo de 65k.
- Analisis de hilos de foros de desarrolladores: con el corpus devforum-roblox-text en su entrenamiento, el modelo esta expuesto a la jerga y a los problemas recurrentes de la comunidad, lo que permite clasificar o resumir consultas tecnicas.
- Asistente embebido on-device: con 524M de parametros y un repositorio de 1,0 GB, es viable ejecutarlo en portatiles o equipos de gama media sin GPU dedicada, por ejemplo como plugin local de un IDE.
- Migracion de Lua a Luau: el modelo puede emplearse para reescribir fragmentos de Lua estandar hacia sintaxis y tipado de Luau, un caso frecuente en proyectos de Roblox que modernizan su base de codigo.
- Generacion de tests y ejemplos: puede producir codigo de ejemplo y casos de prueba para funciones del motor, util para documentacion interna de equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MultiPL-E, Luau-specific ni de ningun otro conjunto de evaluacion, ni comparaciones con modelos de referencia.

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones derivadas del numero de parametros declarado (524.159.872) y no proceden de la model card:

- Pesos en FP16/BF16: aproximadamente 1,0 GB de VRAM.
- Pesos en INT8: aproximadamente 0,55 GB (requiere cuantizacion propia, no publicada).
- Pesos en INT4: aproximadamente 0,3 GB (requiere cuantizacion propia, no publicada).
- VRAM total recomendada para inferencia comoda en FP16: 2-3 GB, incluyendo cache de atencion y estado recurrente del componente DeltaNet.
- GPU validas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 3060, RTX 4090), asi como GPUs de centro de datos (A100, H100) si se despliega en lote.
- Cabe en GPU consumer: si, con margen amplio, e incluso en CPU y en Apple Silicon mediante pesos cuantizados.
- Opciones de despliegue: el modelo usa codigo personalizado (tag custom_code) con una arquitectura no estandar de atencion lineal hibrida, por lo que no hay confirmacion de soporte en vLLM, llama.cpp, Ollama, TGI ni SGLang. La via documentada es transformers con trust_remote_code=True. La conversion a GGUF requeriria implementar los kernels de Kimi DeltaNet y MLA en el ecosistema de llama.cpp.
- Latencia y throughput: no disponibles. El coste de atencion deberia crecer de forma subcuadratica respecto a un transformer denso del mismo tamano, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento general sobre esos modelos y no de la informacion proporcionada en esta busqueda; verifiquelos antes de tomar decisiones.

| Modelo | Parametros | Contexto nativo | Arquitectura | Licencia | Especializacion |
|---|---|---|---|---|---|
| Luau-Coder-1.0-0.5B-Base | 524M | 65.536 | Hibrida DeltaNet + MLA | Apache-2.0 | Luau / Roblox |
| Qwen2.5-Coder-0.5B | ~0,5B | 32.768 | Transformer denso | Apache-2.0 | Codigo general |
| Qwen3-0.6B | ~0,6B | 32.768 | Transformer denso | Apache-2.0 | Proposito general / razonamiento |
| SmolLM2-360M | ~0,36B | 8.192 | Transformer denso | Apache-2.0 | Proposito general |

La ventaja diferencial de Luau-Coder-1.0-0.5B-Base es doble: contexto nativo el doble de largo que los modelos densos de su franja y un corpus de preentrenamiento especifico de Roblox/Luau. Su desventaja es la ausencia total de benchmarks publicados, de ajuste por instrucciones y de soporte confirmado en los runners de inferencia mas usados. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde de forma fiable a formatos de pregunta-respuesta ni a plantillas de chat; requiere SFT o few-shot prompting por continuacion.
- Solo ingles declarado. No hay soporte multilingue verificado.
- Riesgo de alucinacion elevado en APIs de Roblox: con 0,5B de parametros y sin verificacion factual, puede inventar nombres de funciones, propiedades o firmas inexistentes. En codigo esto se traduce en errores de ejecucion silenciosos.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad ni sesgo de representacion. Al incluir books3 y corpus web sin filtrar de forma declarada, es probable que herede sesgos de esas fuentes; no cuantificado.
- Trazabilidad de datos limitada: no se especifica el numero de tokens de entrenamiento, la proporcion entre corpus generales y de Roblox, ni las politicas de deduplicacion o filtrado.
- Arquitectura no estandar: al usar Kimi DeltaNet y MLA con codigo personalizado, depende de que la implementacion remota del repositorio sea correcta y estable. No hay soporte confirmado en vLLM, llama.cpp, Ollama, TGI ni SGLang, lo que complica el despliegue en produccion y la cuantizacion.
- Sin validacion comunitaria: 0 descargas y 1 like en el momento de la consulta. No existe evidencia externa de calidad ni de reproducibilidad.
- Fechas de publicacion inusuales: los metadatos indican creacion el 2026-09-10, lo que conviene verificar antes de citar el modelo.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero obliga a conservar el aviso de licencia y a declarar los cambios. Al ser un modelo base, la responsabilidad sobre el comportamiento de los derivados recae en quien los ajusta.
- Aviso de dominio: si el objetivo no es Luau o Roblox, otros modelos de la misma franja con benchmarks publicados y soporte en vLLM o llama.cpp son una opcion mas segura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khtsly/Luau-Coder-1.0-0.5B-Base
- Corpus de documentacion de Roblox: https://huggingface.co/datasets/khtsly/roblox_docs_corpus_text
- Corpus de codigo Luau de alta calidad: https://huggingface.co/datasets/khtsly/luau-stack-hq
- Corpus del foro de desarrolladores de Roblox: https://huggingface.co/datasets/khtsly/devforum-roblox-text
- Corpus de documentacion de repositorios Luau: https://huggingface.co/datasets/khtsly/luau-repo-docs-text
- Corpus web de organizaciones Luau: https://huggingface.co/datasets/khtsly/luau-org-web-text
- Dataset general: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset matematico: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset educativo: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset educativo: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Dataset general: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus

Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo ni con inteligencia artificial (eran articulos en aleman sobre perros que ladran por la noche). No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a Luau-Coder-1.0-0.5B-Base, ni documentacion adicional sobre la implementacion de Kimi DeltaNet o de los residuales de atencion usados por el autor.
