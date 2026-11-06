# donthomas03/don-thomas-llm

## Resumen

Don-thomas-llm es un ajuste fino (finetune) del modelo Qwen2.5-0.5B-Instruct de Alibaba Cloud, publicado por el usuario donthomas03 en Hugging Face. Se trata de un modelo de lenguaje causal de tamaño muy reducido (494 millones de parámetros reales según los pesos safetensors), orientado a generación de texto y conversación. El repositorio reutiliza la model card de Qwen2.5-0.5B-Instruct, por lo que la información técnica disponible corresponde esencialmente al modelo base; el autor no documenta qué datos ni métodos de ajuste fino se emplearon.

Su relevancia radica en el tamaño: al pesar alrededor de 1 GB, es un candidato natural para ejecutarse en CPU, en dispositivos de borde o en GPUs de consumo muy modestas. Hereda la arquitectura de Qwen2.5 (transformer con RoPE, SwiGLU, RMSNorm, sesgo QKV en la atención y embeddings atados), una ventana de contexto de 32.768 tokens y generación de hasta 8.192 tokens.

Conviene señalar que el modelo no aporta ninguna innovación propia documentada respecto a su modelo base: es un finetune comunitario con muy poca tracción (377 descargas, 0 likes) y sin evaluaciones publicadas. Para evaluación en producción, lo razonable es partir de las características de Qwen2.5-0.5B-Instruct y validar el comportamiento del ajuste fino caso por caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, sesgo QKV y word embeddings atados |
| Parametros totales | 494.032.768 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (generacion hasta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors; GGUF no publicado) |
| Idiomas soportados | Ingles (etiquetado en la ficha); el modelo base Qwen2.5 soporta mas de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 1,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decodificador heredado de Qwen2.5-0.5B: 24 capas, 14 cabezas de atencion para Q y 2 para KV (GQA, grouped query attention), posicionamiento rotatorio (RoPE), activacion SwiGLU, normalizacion RMSNorm y embeddings de entrada/salida atados. De los 494 millones de parametros totales, unos 360 millones son no-embedding.

Sobre el entrenamiento, la model card no documenta nada especifico del ajuste fino realizado por donthomas03: no se conocen los datos, el metodo (SFT, DPO, RLHF) ni la duracion. Como referencia, la familia Qwen2.5 fue preentrenada por Alibaba Cloud sobre un corpus multilingue masivo (numero de tokens no detallado en la ficha) y posteriormente sometida a post-entrenamiento con instrucciones para la variante Instruct, con mejoras destacadas en seguimiento de instrucciones, generacion de textos largos, comprension de datos estructurados y salida JSON. No hay innovaciones tecnicas propias del finetune que destacar.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, formato chat con `apply_chat_template`).
- Seguimiento de instrucciones heredado de Qwen2.5-0.5B-Instruct.
- Generacion de salidas estructuradas, especialmente JSON, y comprension de datos tabulares (capacidades declaradas del modelo base).
- Generacion de textos largos, por encima de 8K tokens.
- Contexto largo de hasta 32.768 tokens.
- Capacidades basicas de codigo y matematicas mejoradas respecto a Qwen2 (segun la familia Qwen2.5), aunque limitadas por el tamano de 0,5B.
- Robustez frente a system prompts diversos, util para role-play y configuracion de chatbots.
- Soporte multilingue del modelo base en mas de 29 idiomas (el finetune esta etiquetado solo como ingles).
- No hay informacion sobre tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Chatbots ligeros en local: con ~1 GB de pesos, puede desplegarse en portatiles sin GPU dedicada para asistentes conversacionales simples con plantilla de chat estandar.
- Prototipado rapido de agentes de texto: su bajo coste de inferencia permite iterar prompts y flujos conversacionales antes de escalar a modelos mayores.
- Extraccion y generacion de JSON: el modelo base destaca en salidas estructuradas, util para rellenar formularios o normalizar datos en pipelines ETL de bajo volumen.
- Resumen de documentos de longitud media: la ventana de 32.768 tokens permite procesar documentos de decenas de paginas en una sola pasada, con salida de hasta 8.192 tokens.
- Clasificacion y enrutado de consultas: como modelo clasificador o enrutador barato que decide a que modelo grande derivar cada peticion, reduciendo coste por token.
- Experimentacion educativa y fine-tuning adicional: su tamano lo hace ideal para practicar SFT/LoRA en una sola GPU de consumo o incluso en CPU.
- Aplicaciones en dispositivos de borde (edge): despliegue en hardware limitado donde un modelo de 7B o superior no cabe en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este finetune concreto. La model card remite al blog de Qwen2.5 para las evaluaciones del modelo base, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K, etc.), por lo que no se reproducen numeros aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16/BF16 para los pesos, mas overhead de KV cache y activaciones; en la practica, 2 GB de VRAM o 4 GB de RAM en CPU son suficientes para contextos moderados.
- GPU recomendadas: cualquier GPU moderna; no se requiere aceleracion dedicada. Compatible desde GPUs integradas hasta RTX 3060/4060 o superiores sin problema.
- Cabe con holgura en GPUs de consumo: cualquier tarjeta con 4 GB de VRAM o mas; tambien ejecutable integramente en CPU.
- Opciones de despliegue: transformers (se requiere version >= 4.37.0; con versiones anteriores se produce un `KeyError: 'qwen2'`), text-generation-inference (TGI) y endpoints de Hugging Face (el repo esta marcado como `endpoints_compatible`). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput: no disponibles; por su tamano de 0,5B se espera inferencia muy rapida, incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| don-thomas-llm (este) | 0,49B | 32.768 | Apache 2.0 | Finetune comunitario de Qwen2.5-0.5B, sin documentacion del ajuste |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 | Apache 2.0 (con restricciones segun licencia enlazada) | Modelo base oficial de Alibaba, bien documentado y evaluado |
| Qwen2.5-1.5B-Instruct | 1,49B | 32.768 | Apache 2.0 (con restricciones segun licencia enlazada) | Mas capacidad a cambio de ~3x memoria |
| SmolLM2-360M-Instruct (Hugging Face) | 0,36B | 8.192 | Apache 2.0 | Alternativa ligera con contexto mucho menor |

## Limitaciones y advertencias

- El ajuste fino no esta documentado: se desconocen datos, metodo y objetivo del entrenamiento, lo que impide evaluar sesgos o mejoras introducidas por el autor.
- Riesgo de alucinacion elevado, tipico de modelos de 0,5B; no apto para tareas que exijan factualidad sin verificacion externa.
- Capacidades de razonamiento, codigo y matematicas limitadas por el tamano del modelo; esperable un rendimiento claramente inferior al de modelos de 7B o superiores.
- Etiquetado solo en ingles; el soporte multilingue del modelo base (incluido el castellano) puede haberse degradado tras el finetune, sin forma de verificarlo con la informacion disponible.
- La licencia enlazada en la model card apunta al LICENSE de Qwen2.5-0.5B-Instruct, aunque el repo declara Apache 2.0; conviene revisar las condiciones de uso del modelo base de Qwen antes de uso comercial.
- Baja traccion comunitaria (377 descargas, 0 likes) y sin benchmarks propios: para produccion se recomienda comparar directamente con Qwen2.5-0.5B-Instruct oficial.
- Sin pesos GGUF ni cuantizaciones publicadas, lo que limita las opciones de despliegue con runtimes optimizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/donthomas03/don-thomas-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo base Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper tecnico de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Benchmark de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
