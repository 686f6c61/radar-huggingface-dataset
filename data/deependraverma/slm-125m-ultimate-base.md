# DeependraVerma/slm-125m-ultimate-base

## Resumen

`slm-125m-ultimate-base` es un modelo de lenguaje de 125,8 millones de parámetros con arquitectura estilo Llama, desarrollado por Deependra Verma, investigador de IA generativa. Es la segunda iteración de un proyecto de preentrenamiento de un modelo pequeño especializado en dominios legal y financiero, con un enfoque particular en la generación de texto continuo en inglés. El modelo se calienta desde los pesos finales de la primera ejecución (`slm-125m-base`) y continúa su preentrenamiento durante 1,5 billones de tokens adicionales sobre un corpus más amplio, con la novedad clave de que los datos de origen se han limpiado de marcado HTML, un problema que afectó gravemente a la primera versión.

La relevancia de este modelo reside en su tamaño reducido (125,8M de parámetros) combinado con una especialización en dominios legales y financieros, lo que lo convierte en una opción interesante para experimentación, investigación educativa y despliegues con recursos limitados. Su ventana de contexto es de 4096 tokens, utiliza embeddings atados y está disponible bajo licencia MIT. Es importante destacar que se trata de un modelo base de continuación de texto, no de un asistente conversacional, por lo que no sigue instrucciones ni responde preguntas de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (12 capas, 12 cabezas, hidden size 768, MLP SwiGLU 3072, RoPE θ=10000, RMSNorm) |
| Parametros totales | 125.848.320 (125,8M, embeddings atados) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp32 guardados, computo en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura decoder-only estilo Llama que mapea directamente a `transformers.LlamaConfig`. Con 12 capas, dimensiones ocultas de 768 y 12 cabezas de atencion (head dim 64), emplea atencion multi-cabeza completa sin GQA ni MQA, normalizacion RMSNorm, embeddings atados y codificacion posicional RoPE con theta de 10.000. El vocabulario es de 16.384 tokens mediante BPE a nivel de byte.

El entrenamiento se realizo con warm-start desde los pesos finales de la primera ejecucion del proyecto, continuando el preentrenamiento durante 1,5 billones de tokens objetivo sobre un corpus que combina fuentes legales y financieras (casos judiciales de EE. UU., filings SEC, contratos materiales, EDGAR, Caselaw Access Project) con una porcion significativa de texto general en ingles (fineweb-edu, Wikipedia, libros, codigo). La innovacion principal de esta ejecucion es la eliminacion del marcado HTML de los datos de origen antes de la tokenizacion, corrigiendo el problema de la primera version que dedicaba aproximadamente el 19,3% de su presupuesto de tokens a aprender a emitir etiquetas como `<font>` y `&#160;`, con una fuga de marcado del 77,1% en completaciones legales. Tras el reentrenamiento, la fuga de marcado se redujo al 0% en las pruebas internas. El entrenamiento se realizo en 8 GPU NVIDIA B200 con DDP, bf16 autocast, SDPA/flash attention y `torch.compile`, con un lote global de 524.288 tokens, optimizador AdamW y una programacion de tasa de aprendizaje Warmup-Stable-Decay de 0,0006 a 6e-05.

## Capacidades

- Generacion de texto por continuacion en registro legal, financiero y ingles general, con estilo de redaccion de documentos.
- Completado de texto plausible en dominios especializados, incluyendo redaccion de clausulas, extractos de contratos y prosa legal.
- Capacidad multilingue limitada al ingles.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No sigue instrucciones ni responde preguntas de forma fiable al ser un modelo base.

## Casos de uso

- Investigacion academica sobre preentrenamiento de modelos pequenos: el modelo documenta exhaustivamente su procedimiento de entrenamiento, datos y configuracion, lo que lo convierte en un recurso valioso para estudiar tecnicas de warm-start, continuacion de preentrenamiento y efectos de la limpieza de datos en dominios especializados.
- Experimentacion con tecnicas de continuacion de preentrenamiento: al ser una segunda ejecucion que parte de pesos previos, permite analizar como el reentrenamiento sobre datos limpios corrige habitos no deseados aprendidos en la primera fase.
- Generacion de borradores de texto legal y financiero: puede producir redaccion preliminar de clausulas, secciones de contratos o prosa legal que un profesional humano deberia revisar y verificar exhaustivamente.
- Educacion en procesamiento del lenguaje natural: su tamano reducido permite ejecutarlo en hardware modesto, siendo util para demostraciones docentes de modelos de lenguaje causales y de generacion de texto.
- Desarrollo de tokenizadores y pipelines de preprocesado: el proyecto incluye un tokenizador BPE a nivel de byte de 16.384 tokens y un pipeline de limpieza de marcado HTML, util como referencia para otros desarrollos.
- Base para fine-tuning posterior: los pesos de este modelo base pueden servir como punto de partida para ajuste supervisado, como demuestra la existencia de la version `legal-slm-125m-ultimate-sft` que anade capacidad de preguntas y respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perdida final de entrenamiento de 1,9260 en el ultimo paso registrado, y la medicion interna de fuga de marcado HTML del 0% en sondas de redaccion legal. La primera ejecucion del proyecto reporto una perplejidad de 7,76 en datos de validacion retenidos, pero no se indica si este dato es aplicable a esta segunda ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (tamano del repositorio), lo que lo hace ejecutable en practicamente cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tarjetas consumer como GTX 1650, RTX 3060 o superiores son mas que suficientes.
- Cabe en GPU consumer: si, sin ninguna dificultad.
- Opciones de despliegue: al ser un modelo transformers estandar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama y cualquier framework que soporte modelos Llama.
- Latencia y throughput: no disponible, pero por su tamano se espera una latencia muy baja y un throughput alto incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| slm-125m-ultimate-base | 125,8M | 4.096 | Legal/financiero | MIT |
| TinyLlama 1.1B | 1.100M | 2.048 | General | Apache 2.0 |
| SmolLM2 135M | 135M | 2.048 | General | Apache 2.0 |
| Phi-1.5 | 1.300M | 2.048 | Codigo/razonamiento | MIT |

No se dispone de datos de benchmarks comparativos entre estos modelos. La comparativa se limita a parametros, contexto, especializacion y licencia. El modelo destaca por su especializacion en dominios legales y financieros, algo poco comun en modelos de este tamano, y por su licencia MIT permisiva.

## Limitaciones y advertencias

- Es un modelo base de continuacion de texto, no un asistente: no sigue instrucciones ni responde preguntas de forma fiable.
- Alucinacion severa en datos factuales: el propio autor advierte que el modelo inventa nombres de casos, citas legales, cifras y otros detalles especificos que suenan plausibles pero no estan fundamentados.
- No debe utilizarse como fuente de asesoramiento legal, financiero o factual de ningun tipo.
- Limitado al idioma ingles; no soporta otros idiomas.
- Vocabulario reducido de 16.384 tokens, lo que puede limitar su capacidad para manejar terminologia muy especializada fuera de sus dominios de entrenamiento.
- Contexto limitado a 4.096 tokens, insuficiente para documentos legales extensos completos.
- Sin soporte para tool calling, agentes ni razonamiento multi-paso.
- No se han publicado benchmarks estandar que permitan evaluar su rendimiento relativo frente a otros modelos.
- El proyecto es de un unico autor y no se indica mantenimiento continuado ni soporte comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DeependraVerma/slm-125m-ultimate-base
- Repositorio del proyecto: https://github.com/DeependraVerma/legal-slm-125M
- Version fine-tuned para Q&A: https://huggingface.co/DeependraVerma/legal-slm-125m-ultimate-sft
- Version ONNX para navegador: https://huggingface.co/DeependraVerma/legal-slm-125m-ultimate-sft-onnx
- Primera ejecucion (slm-125m-base): https://huggingface.co/DeependraVerma/slm-125m-base
- Pagina del proyecto: https://deependraverma-ai-legal-slm-125-m.vercel.app/
- Demo del modelo: https://slm-125m-phi.vercel.app/index.html
- Perfil del autor en HuggingFace: https://huggingface.co/DeependraVerma
