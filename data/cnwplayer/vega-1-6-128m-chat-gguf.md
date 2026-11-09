# CNWPlayer/Vega-1.6-128M-Chat-GGUF

## Resumen

Vega-1.6-128M-Chat es un modelo de lenguaje conversacional de pequeno tamano (SLM) desarrollado por CNWPlayer, un autor individual que publica bajo el identificador CNWPlayer en Hugging Face. Se trata de la version ajustada para chat del modelo base Vega-1.6-128M, un transformer denso de 128,4 millones de parametros entrenado desde cero sobre una mezcla de datasets publicos. El repositorio aqui descrito contiene exclusivamente los pesos cuantizados en formato GGUF, pensados para inferencia local eficiente.

El modelo resuelve el problema de disponer de un asistente conversacional extremadamente ligero que pueda ejecutarse en hardware muy modesto (CPU, GPUs de gama baja, dispositivos embebidos) sin renunciar al formato de chat con plantilla de roles system/user/assistant. Su relevancia radica en su tamano reducido (0,3 GB de repositorio en GGUF) y su licencia MIT, que permite uso comercial sin restricciones practicas, algo poco habitual en modelos de mayor tamano.

La arquitectura es un transformer decoder-only de 16 capas, hidden size 768, 12 cabezas de atencion y 6 cabezas KV (GQA), con un contexto de entrenamiento de 2.048 tokens y un vocabulario de 32.000 tokens. El modelo esta entrenado unicamente en ingles y sus capacidades son limitadas, propias de su escala: respuestas cortas y correctas en dominios comunes, con tendencia a la divagacion en preguntas abiertas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 128.410.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (entrenamiento) |
| Tipos de cuantizacion | GGUF (variantes no detalladas en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |
| Capas | 16 |
| Hidden size | 768 |
| Cabezas de atencion | 12 |
| Cabezas KV | 6 (GQA) |
| Intermediate size | 2.048 |
| Vocabulario | 32.000 tokens |

## Arquitectura y entrenamiento

Vega-1.6-128M-Chat es un transformer decoder-only denso con atencion multi-cabeza con query grouping (12 cabezas de atencion y 6 cabezas KV), 16 capas, hidden size de 768 y feed-forward de 2.048. Emplea una plantilla de chat con roles system/user/assistant compatible con `apply_chat_template` de la libreria Transformers.

El entrenamiento consta de dos fases segun la model card: una fase de preentrenamiento de aproximadamente 8.000 millones de tokens (denominada "8B pretraining phase" en la card) sobre una mezcla de FineWeb, FineWeb-Edu, Cosmopedia, NPset-2-Python-Edu y OpenWebMath, seguida de un ajuste adicional de 400 millones de tokens sobre Smoltalk para la version chat. No se detalla en la informacion disponible si se aplicaron tecnicas de RLHF, DPO u otras tecnicas de alineacion adicionales, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de roles (system, user, assistant).
- Respuestas factuales simples en dominios comunes (geografia, definiciones basicas).
- Seguimiento de instrucciones sencillas, incluida la restriccion de respuestas a formatos concretos (por ejemplo, responder siempre "No").
- Razonamiento aritmetico basico y tareas de calculo simple.
- Capacidad limitada de generacion de codigo, derivada del dataset NPset-2-Python-Edu incluido en el preentrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Asistente conversacional embebido en aplicaciones de escritorio o moviles: con 128M de parametros y pesos GGUF de ~0,3 GB, puede integrarse en binarios ligeros y ejecutarse en CPU sin GPU dedicada, ofreciendo respuestas a preguntas frecuentes y comandos simples.
- Clasificacion y etiquetado de texto en pipelines de bajo coste: el modelo puede usarse para tareas de respuesta corta y formato controlado (por ejemplo, clasificacion si/no) mediante prompts de sistema restrictivos.
- Generacion de respuestas plantilla en sistemas de FAQ: adecuado para dominios acotados donde las respuestas son cortas y predecibles, con contexto de 2.048 tokens suficiente para historiales breves.
- Prototipado e investigacion educativa: sirve como modelo de referencia para experimentar con tecnicas de cuantizacion GGUF, plantillas de chat y evaluacion de SLMs en hardware de consumo.
- Filtrado y preprocesado de datos: puede emplearse como modelo auxiliar para generar etiquetas o resumenes muy breves en grandes volumenes de texto, donde el coste por token es critico.
- Demos y entornos con requisitos estrictos de privacidad: al ejecutarse localmente y con licencia MIT, permite desplegar un chatbot sin enviar datos a servicios externos ni asumir costes de API.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Bananamind Base Bench 1.1 (elo) | 1.026 |
| Bananamind Instruct Bench 1.1 (elo) | 719 |
| Hellaswag | 28,92 % |
| ARC-E | 35,56 % |
| ARC-C | 24,23 % |
| PIQA | 59,73 % |
| Arithmark-3 | 37,30 % |

Segun la model card, el resultado de 1.026 elo en Bananamind Base Bench 1.1 lo situaria en 19.ª posicion en el momento de la publicacion, por delante de Vega-1.6-128M-Base y por detras de Supra2-100M. El rendimiento en Instruct Bench (719 elo) es notablemente inferior, lo que refleja las limitaciones del ajuste conversacional a esta escala.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizaciones GGUF de 4 bits; aproximadamente 0,3 GB para los pesos mas comunes. En bfloat16 el modelo base ocupa alrededor de 0,26 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU y CPUs modernas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base admite Transformers con `AutoModelForCausalLM`. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponible en la informacion proporcionada; por el tamano, se espera throughput alto en CPU y muy alto en GPU, pero no se ofrecen cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Vega-1.6-128M-Chat | 128,4 M | 2.048 | MIT | SLM conversacional, solo ingles |
| Supra2-100M | ~100 M | no disponible | no disponible | Referencia elo superior en Bananamind Base Bench 1.1 segun la card |
| Vega-1.6-128M-Base | 128,4 M | 2.048 | MIT | Version base sin ajuste conversacional; inferior en elo base |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria mas alla de las referencias elo mencionadas en la model card.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Contexto muy limitado (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Riesgo elevado de alucinacion y divagacion: los ejemplos de la model card muestran respuestas incorrectas o incoherentes en preguntas abiertas (por ejemplo, la respuesta sobre Google o sobre la IA).
- Errores factuales en datos basicos: el ejemplo sobre la capital de Inglaterra incluye una poblacion incorrecta y una ubicacion erronea.
- Rendimiento bajo en benchmarks de razonamiento y sentido comun (Hellaswag 28,92 %, ARC-C 24,23 %), propio de su escala.
- No dispone de tool calling, agentes ni capacidades multimodales.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre la calidad o seguridad de las salidas.
- No apto para produccion en tareas que requieran precision factual, razonamiento complejo o cumplimiento normativo sin supervision humana.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/CNWPlayer/Vega-1.6-128M-Chat-GGUF
- Modelo base en Hugging Face: https://huggingface.co/CNWPlayer/Vega-1.6-128M-Chat
- Ficha indexada en Essa Mamdani: https://essamamdani.com/ai-models/hf-cnwplayer-vega-1-6-128m-chat
