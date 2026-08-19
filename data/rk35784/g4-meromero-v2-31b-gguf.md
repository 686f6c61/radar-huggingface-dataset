# rk35784/G4-MeroMero-v2-31B-GGUF

## Resumen

G4-MeroMero-v2-31B-GGUF es la versión cuantizada en formato GGUF del modelo G4-MeroMero-v2-31B, un finetune de Gemma 4 31B desarrollado por zerofata y cuantizado por rk35784. El modelo base está diseñado específicamente para tareas creativas, con especial énfasis en roleplay narrativo (RP), y pretende ser una versión más creativa de su predecesor G4-MeroMero-31B sin sacrificar la inteligencia del modelo original.

El finetune se inspira en investigaciones recientes sobre control de creatividad en modelos de lenguaje, como el paper StoryScope mencionado en los metadatos. Con aproximadamente 30,7 mil millones de parámetros y una arquitectura transformer de 60 capas, este modelo ofrece una alternativa open source (licencia Apache 2.0) para aplicaciones de generación narrativa y conversacional.

La versión GGUF permite ejecutar el modelo en una variedad de hardware mediante herramientas como llama.cpp, Ollama o LM Studio, haciendo accesible un modelo de este tamaño a usuarios con GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (gemma4_text), 60 capas, hidden size 5376, GQA con 32 query heads y 16 key/value heads, FFN intermediate size 21504 |
| Parametros totales | 30.697.345.596 (aprox. 30,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 soporta hasta 128K, pero no se confirma para este finetune) |
| Tipos de cuantizacion | no disponibles (el repo incluye multiples archivos GGUF, pero no se listan las variantes exactas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base G4-MeroMero-v2-31B es un finetune de Gemma 4 31B de Google DeepMind. La arquitectura es un transformer denso con 60 capas, embedding de 5376 dimensiones y atención por grupos de consultas (GQA) con 32 cabezas de consulta y 16 de clave/valor. El feed-forward tiene un tamaño intermedio de 21504. Esta configuración es identica a la del Gemma 4 31B original, ya que el finetune no modifica la arquitectura.

El entrenamiento del finetune se centra en mejorar la creatividad narrativa manteniendo la coherencia y la inteligencia general. Segun la descripcion del autor, el proceso fue experimental y se inspiro en varios papers de investigacion, incluyendo StoryScope (referencia arxiv:2604.03136) y otro trabajo con arxiv:2605.26492. No se especifican los datos de entrenamiento, el numero de tokens ni si se utilizo RLHF o DPO. La version GGUF es una cuantizacion post-entrenamiento que no altera los pesos semanticos del modelo original.

## Capacidades

- Generacion de texto creativo y narrativo, con enfasis en roleplay de personajes y construccion de mundos ficcionales.
- Conversacion multi-turno: el tag "conversational" indica soporte para dialogos extendidos.
- Escritura de ficcion: capaz de mantener coherencia argumental y desarrollo de personajes a lo largo de pasajes largos.
- Adaptacion de estilo: el finetune busca imitar estilos narrativos variados sin perder la comprension del contexto.
- No se han confirmado capacidades de tool calling, function calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Roleplay narrativo interactivo: el modelo puede actuar como narrador o personaje en sesiones de RP por texto, manteniendo la coherencia de la historia y respondiendo a las acciones del usuario. Su entrenamiento especifico en creatividad lo hace adecuado para este fin.
- Generacion de historias cortas y relatos: ideal para escritores que necesitan inspiracion o un borrador inicial. El modelo puede producir pasajes narrativos con descripciones ricas y dialogos naturales.
- Desarrollo de personajes para juegos de rol: permite crear fichas de personaje, dialogos y trasfondos detallados para campañas de mesa o videojuegos.
- Asistente de escritura creativa: puede sugerir giros argumentales, expandir escenas o reescribir fragmentos con un tono mas literario, gracias a su sesgo hacia la creatividad.
- Creacion de contenido para videojuegos narrativos: util para generar dialogos de NPC, misiones secundarias o descripciones de entornos en juegos independientes o prototipos.
- Simulacion de conversaciones con personajes historicos o ficticios: el modelo puede adoptar una personalidad definida por el usuario y mantenerla a lo largo de la interaccion, util para entretenimiento o educacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Gemma 4 31B tiene resultados publicos, pero el finetune no reporta metricas propias en MMLU, HumanEval, GSM8K u otras pruebas estandar. La ausencia de datos impide comparaciones cuantitativas fiables.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en fp16 requiere aproximadamente 62,5 GB de VRAM segun LLM Explorer. Con cuantizaciones GGUF, las necesidades se reducen: una cuantizacion Q4_K_M tipica para 31B ocupa unos 19-20 GB, y Q5_K_M unos 23-24 GB, aunque no se confirman los archivos exactos incluidos en este repo.
- GPU recomendadas: para cuantizaciones bajas (Q4), una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ejecutar el modelo. Para cuantizaciones mas altas o el modelo completo, se necesitan GPU profesionales como A100 80 GB o H100.
- Si cabe en consumer GPU: si, con cuantizaciones de 4-5 bits en GPUs de 24 GB. Con 16 GB (RTX 4080, 3080 Ti) probablemente solo quepan cuantizaciones de 3 bits o inferiores, con perdida de calidad.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con la API de OpenAI mediante llama.cpp server.
- Latencia y throughput: no se han publicado datos especificos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 20-40 tokens/segundo para un modelo de este tamano, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre otros finetunes de Gemma 4 31B con caracteristicas comparables. El modelo base Gemma 4 31B de Google es la referencia directa, pero no se han publicado diferencias de rendimiento especificas del finetune frente al original. Otras alternativas como Mistral 7B o Llama 3.1 8B son de menor tamano y no comparables directamente. Se recomienda consultar el modelo base en HuggingFace para obtener benchmarks del Gemma 4 31B original.

## Limitaciones y advertencias

- Al ser un finetune orientado a creatividad, puede priorizar la fluidez narrativa sobre la precision factual, aumentando el riesgo de alucinaciones en contextos donde se requieran datos exactos.
- No se ha confirmado la longitud de contexto efectiva; aunque Gemma 4 soporta 128K, el finetune podria degradar su rendimiento en ventanas muy largas.
- Los idiomas soportados no estan documentados; el modelo base Gemma 4 es multilingue, pero el finetune podria tener un sesgo hacia el ingles por los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los terminos de la licencia del modelo base Gemma 4 de Google, que podria tener restricciones adicionales.
- El repo GGUF tiene un tamano de 206 GB, lo que implica multiples archivos de cuantizacion; es necesario seleccionar el archivo adecuado para el hardware disponible y verificar la integridad de las descargas.
- No hay informacion sobre el proceso de cuantizacion (metodo, calibration set), por lo que la perdida de calidad respecto al modelo en fp16 no puede evaluarse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/rk35784/G4-MeroMero-v2-31B-GGUF
- Modelo base (safetensors): https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- Variante MLX (Apple Silicon): https://huggingface.co/beezu/G4-MeroMero-v2-31B-mlx-mxfp8
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Vista de arquitectura en hfviewer: https://hfviewer.com/zerofata/G4-MeroMero-v2-31B
- Ficha en LLM Explorer: https://llm-explorer.com/model/zerofata%2FG4-MeroMero-v2-31B,4EnQ8ulUmyaMNAyBspmm00
