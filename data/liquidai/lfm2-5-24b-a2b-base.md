# LiquidAI/LFM2.5-24B-A2B-Base

## Resumen

LFM2.5-24B-A2B-Base es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Liquid AI. Se trata del modelo de mayor tamano de la familia LFM2.5, una gama disenada especificamente para despliegue en dispositivo (on-device) y en el borde. Cuenta con 23.971.585.280 parametros totales pero solo 2,45B activos por token, una ventana de contexto de 131.072 tokens y un vocabulario de 128.000 entradas.

Este checkpoint es la version preentrenada (base), no post-entrenada. Su proposito no es el uso directo en chat, sino servir de punto de partida para fine-tuning intensivo: asistentes especificos de idioma o de dominio, entrenamiento sobre datos propietarios o investigacion en tecnicas novedosas de post-entrenamiento. Liquid AI publica por separado el checkpoint ya post-entrenado para cargas agenticas (LFM2.5-24B-A2B) y sus conversiones a GGUF, ONNX y MLX.

La relevancia del modelo reside en su relacion entre capacidad y coste de inferencia: con 24B de parametros almacenados pero solo ~2,45B activos por token, busca ofrecer la calidad de un modelo denso grande con el coste computacional de uno mucho menor, algo critico cuando el objetivo es ejecutar agentes de forma rapida y privada en hardware local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida con mezcla de expertos (MoE): 40 capas, de las cuales 30 son bloques de convolucion corta con doble compuerta y 10 son capas de atencion GQA |
| Parametros totales | 23.971.585.280 (~24,0B) |
| Parametros activos | 2,45B por token (MoE con 64 expertos por bloque y enrutamiento top-4) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | No disponible para este checkpoint base (repo en safetensors). Existen versiones GGUF, ONNX y MLX en repositorios separados del modelo post-entrenado LFM2.5-24B-A2B |
| Idiomas soportados | 17: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano, vietnamita, tailandes, indonesio, hindi, ruso y polaco |
| Licencia | lfm1.0 (etiquetada como license: other en HuggingFace) |
| Formato de pesos | safetensors (libreria transformers, tag lfm2_moe) |

## Arquitectura y entrenamiento

La arquitectura es hibrida y no puramente transformer: combina 30 bloques de convolucion corta con doble compuerta (double-gated short convolution) con 10 capas de atencion con consultas agrupadas (GQA), sumando 40 capas. La componente MoE cuenta con 64 expertos por bloque y enrutamiento top-4, de modo que solo 2,45B de los ~24B parametros se activan por token. Esta combinacion busca reducir el coste de decodificacion manteniendo la capacidad de modelado de una red de mayor tamano.

El presupuesto de entrenamiento indicado por el autor es de 36 billones (trillion) de tokens, frente a los ~17T del predecesor LFM2-24B-A2B. El preentrenamiento va seguido de dos fases de mid-training: una primera de 2 billones de tokens con contexto de 32K sobre datos curados con peso hacia razonamiento, matematicas, codigo, seguimiento de instrucciones y texto multilingue, y una segunda de 300.000 millones de tokens con contexto de 131K orientada a datos de contexto largo. Las llamadas a herramientas (tool calls) y trayectorias multiturno aparecen a lo largo de ambas fases para preparar el modelo para cargas agenticas. El vocabulario se ha duplicado hasta 128.000 tokens respecto al modelo anterior. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO en este checkpoint base, ni el detalle de composicion del dataset de preentrenamiento.

## Capacidades

- Generacion de texto y modelado de lenguaje general como modelo base (completion), sin plantilla de instrucciones ni modo chat integrado.
- Razonamiento, matematicas, codigo y seguimiento de instrucciones reforzados durante la fase de mid-training de 2T tokens a 32K de contexto.
- Procesamiento de contexto largo: ventana de 131.072 tokens, con una fase de mid-training especifica de 300.000 millones de tokens sobre datos de contexto largo.
- Capacidades multilingues en 17 idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Exposicion a tool calling y trayectorias multiturno durante el preentrenamiento y el mid-training, orientada a facilitar el fine-tuning posterior para cargas agenticas. El comportamiento agentico pulido no reside en este checkpoint base, sino en el modelo post-entrenado LFM2.5-24B-A2B.
- Capacidad de adaptacion mediante fine-tuning: es el uso explicitamente recomendado por el autor para este checkpoint.
- No se documentan en la informacion disponible capacidades de vision, audio, thinking mode explicito ni decodificacion especulativa para este checkpoint.

## Casos de uso

- Fine-tuning de asistentes especificos de idioma: el autor cita explicitamente el caso de un asistente en japones. El vocabulario de 128.000 tokens y los 17 idiomas del corpus facilitan adaptar el modelo a un unico idioma con un volumen de datos relativamente moderado.
- Asistentes de dominio vertical: el propio autor menciona el caso medico como ejemplo de especializacion. El checkpoint base permite reentrenar sobre corpus tecnicos propios sin arrastrar el sesgo conversacional de un modelo ya post-entrenado.
- Entrenamiento sobre datos propietarios: al ser un checkpoint preentrenado y no un modelo ya alineado, resulta adecuado para quien necesita incorporar datos internos que no puede exponer en pipelines de ajuste sobre un modelo cerrado.
- Investigacion en tecnicas de post-entrenamiento: sirve como banco de pruebas para nuevos esquemas de RLHF, DPO, SFT o destilacion sobre una arquitectura hibrida MoE poco convencional.
- Base para destilacion hacia modelos mas pequenos: los 24B de parametros con 2,45B activos permiten generar grandes volumenes de texto sintetico de alta calidad para entrenar modelos de menor tamano.
- Desarrollo de agentes locales tras el post-entrenamiento: la fase de mid-training incluye tool calls y trayectorias multiturno, por lo que el modelo esta preparado para pipelines de agentes multi-paso una vez ajustado, con la ventaja de los 2,45B parametros activos para decodificacion rapida.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite resumir, extraer informacion o responder preguntas sobre contratos, informes o expedientes completos sin fragmentacion por troceado.
- Generacion de codigo en pipelines de CI/CD: tras el fine-tuning correspondiente, la combinacion de contexto largo y bajo coste por token activo lo hace apto para revision de parches y generacion de pruebas en repositorios grandes.
- Despliegue en el borde tras cuantizacion: la familia dispone de conversiones GGUF, ONNX y MLX para el modelo post-entrenado, lo que abre la puerta a ejecucion en CPU, Apple Silicon y dispositivos moviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint base (LFM2.5-24B-A2B-Base). Los datos de rendimiento que aparecen en las busquedas corresponden al modelo hermano ya post-entrenado, LFM2.5-24B-A2B, y no son extrapolables directamente al checkpoint base:

| Medicion | Valor | Modelo al que corresponde |
|---|---|---|
| Velocidad de decodificacion en Apple M5 Max | 184 tokens/s | LFM2.5-24B-A2B (post-entrenado) |
| Velocidad de decodificacion en AMD Ryzen AI Max+ 395 | 114 tokens/s | LFM2.5-24B-A2B (post-entrenado) |
| Ventaja frente al siguiente mejor modelo comparado | Hasta 1,7x mas rapido y con el menor consumo de memoria del grupo | LFM2.5-24B-A2B (post-entrenado) |
| Benchmark LiveClaw | Supera a Qwen3.6-35B-A3B | LFM2.5-24B-A2B (post-entrenado) |

No se dispone de cifras de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar para ninguno de los dos checkpoints en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (a partir de los ~24B de parametros y de los 48,0 GB del repositorio en safetensors): en torno a 48 GB solo para los pesos, mas cache KV y activaciones. Con 131.072 tokens de contexto, la cache KV puede ser considerable incluso con GQA en 10 capas.
- VRAM estimada en cuantizacion de 8 bits: del orden de 24 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: del orden de 12-14 GB para los pesos, mas cache KV. Estas cifras son calculos a partir del numero de parametros y no medidas publicadas: no hay datos oficiales de VRAM en la informacion disponible.
- GPU recomendadas: no disponibles de forma explicita. Por tamano, un despliegue en precision completa requiere aceleradores de clase A100 80 GB o H100 80 GB; en 8 bits encajaria en una RTX 4090 de 24 GB de forma ajustada, dependiendo de la longitud de contexto configurada.
- Ejecucion en GPU de consumo: plausible con cuantizacion de 4-8 bits en tarjetas de 12-24 GB (RTX 4090, RTX 3090, etc.), y en CPU o Apple Silicon mediante las conversiones GGUF y MLX del modelo post-entrenado. No hay confirmacion oficial para el checkpoint base.
- Opciones de despliegue documentadas por el autor: Transformers, vLLM, llama.cpp, ademas de formatos GGUF (llama.cpp y herramientas compatibles), ONNX Runtime (despliegue multiplataforma en nube, borde y movil) y MLX (Apple Silicon).
- Latencia y throughput estimados: no disponibles para el checkpoint base. Como referencia del modelo post-entrenado con la misma arquitectura, 184 tokens/s en Apple M5 Max y 114 tokens/s en AMD Ryzen AI Max+ 395.

## Comparativa con modelos similares

| Modelo | Parametros (total / activos) | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Base | 24B / 2,45B | 131.072 tokens | 36T tokens + 2T a 32K + 300.000M a 131K | lfm1.0 | HuggingFace, safetensors |
| LFM2.5-24B-A2B (post-entrenado) | 24B / 2,45B | 131.072 tokens | Mismo preentrenamiento + post-entrenamiento para cargas agenticas | lfm1.0 | HuggingFace; variantes GGUF, ONNX y MLX |
| LFM2-24B-A2B (generacion anterior) | No disponible en detalle | No disponible | ~17T tokens | No disponible en la informacion | HuggingFace |
| Qwen3.6-35B-A3B | 35B / ~3B (A3B) | No disponible | No disponible | No disponible | Citado como referencia comparativa en LiveClaw |

La comparativa relevante que aporta el autor es frente a Qwen3.6-35B-A3B, sobre el que afirma que LFM2.5-24B-A2B obtiene mejores resultados en LiveClaw, con un total de parametros menor (24B frente a 35B). No hay datos publicados en la informacion disponible sobre el rendimiento comparado del checkpoint base.

## Limitaciones y advertencias

- Este checkpoint es un modelo base preentrenado: no incorpora alineacion de instrucciones ni formato de chat. Usarlo directamente como asistente producira respuestas sin estructura conversacional. Para ese uso debe emplearse LFM2.5-24B-A2B o realizar un fine-tuning propio.
- Riesgo de alucinacion inherente a un modelo base entrenado solo con objetivos de modelado de lenguaje: no dispone de mecanismos de post-entrenamiento orientados a la veracidad.
- Sesgos: no se documenta en la informacion disponible ninguna evaluacion de sesgos ni de seguridad, ni la composicion del dataset mas alla de las areas tematicas ponderadas (razonamiento, matematicas, codigo, instrucciones y multilingue).
- Cobertura idiomatica desigual: aunque se listan 17 idiomas, no se especifica el volumen de datos por idioma ni hay evaluaciones publicadas de calidad por lengua.
- Licencia lfm1.0, etiquetada como "other" en HuggingFace: es una licencia propia de Liquid AI, no una licencia open source estandar. No se detallan en la informacion disponible las condiciones exactas de uso comercial, por lo que es imprescindible revisar el archivo LICENSE antes de un despliegue en produccion.
- Requisitos de memoria elevados para un modelo etiquetado como "edge": los 48,0 GB del repositorio en safetensors obligan a cuantizar para entrar en hardware de consumo.
- Contexto de 131.072 tokens: aunque tecnicamente soportado, no hay datos publicados sobre la degradacion de calidad en longitudes cercanas al limite para este checkpoint.
- La ventana de contexto de preentrenamiento original era de 32K y se extendio a 131K en la ultima fase con solo 300.000 millones de tokens, lo que en modelos de este tipo suele implicar un rendimiento en contexto largo inferior al de modelos entrenados nativamente a esa longitud. No hay evaluaciones que lo confirmen o desmientan.
- Los datos de velocidad y benchmarks citados en esta ficha corresponden al modelo post-entrenado, no al base.

## Enlaces

- Modelo en HuggingFace (base): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Modelo post-entrenado: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo predecesor: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- Repositorio GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Repositorio ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Repositorio MLX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX
- Blog del modelo: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion tecnica: https://docs.liquid.ai/lfm/models/lfm25-24b-a2b
- Guia de inferencia con Transformers: https://docs.liquid.ai/lfm/inference/transformers
- Guia de inferencia con vLLM: https://docs.liquid.ai/lfm/inference/vllm
- Guia de inferencia con llama.cpp: https://docs.liquid.ai/lfm/inference/llama-cpp
- Pagina general de modelos: https://www.liquid.ai/models
- Playground: https://playground.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Paper (referencia arXiv): arxiv:2511.23404
