# sinhaankur/helmsman-4b

## Resumen
helmsman-4b es un ajuste fino por destilación del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario independiente sinhaankur. Se trata de un modelo personal de 4.022 millones de parámetros cuyo objetivo es responder de forma fundamentada sobre el corpus propio de su autor: su escritura, casos de estudio, el motor de universo/cielo que construyó, sus estándares de diseño y patrones de código. No aspira a ser un asistente generalista, sino un especialista en su dominio que corre en local.

La versión v2 (noviembre de 2026) se re-destiló sobre 420 pares generados a partir del contenido real del autor, sustituyendo el enfoque anterior de preguntas y respuestas sobre documentos. El entrenamiento se realizó con QLoRA (r=16, α=32, 3 épocas) sobre Apple Silicon y el adaptador se fusionó en los pesos base, por lo que el repositorio distribuye el modelo completo, no un adaptador.

Es relevante como ejemplo de flujo de trabajo de destilación personal: un único desarrollador genera datos sintéticos con un profesor tipo Claude, entrena en hardware de consumo y publica el resultado en safetensors y GGUF. Su utilidad práctica queda acotada al dominio para el que fue entrenado, y el propio autor advierte que en conversación abierta no supera al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | fp16 (safetensors) y Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | AGPL-3.0-or-later |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.000 millones de parámetros con 262.144 tokens de contexto y modo instruct sin bloque de razonamiento. Sobre esa base se aplicó un ajuste fino supervisado con QLoRA: base cuantizada en 4 bits NF4, dtype de cómputo bf16 y doble cuantización, con LoRA de rango 16 y α=32 aplicado a todas las proyecciones de atención y MLP. Se entrenaron 3 épocas con tasa de aprendizaje 2e-4, batch efectivo 16, scheduler coseno y 5 % de warmup, con semilla 42.

Los datos de entrenamiento son sintéticos: la v2 emplea 420 pares (prompt, respuesta) generados contra un profesor de la clase Claude Opus a partir del contenido propio del autor, mientras que la v1 usó 305 pares sobre un conjunto de documentos. El entrenamiento se ejecutó en Apple Silicon en bf16, con aproximadamente 30 minutos por ejecución. Tras el SFT, el adaptador LoRA se fusionó en los pesos base y se exportó a GGUF. No se documenta entrenamiento con RLHF ni DPO.

## Capacidades
- Generación de texto conversacional fundamentada en el corpus de entrenamiento del autor.
- Respuestas sobre diseño, patrones de código, escritura y trabajo creativo del dominio del autor.
- Ejecución en local y en dispositivos de consumo gracias a su tamaño y a la cuantización Q4_K_M.
- Plantilla de chat compatible con transformers, llama.cpp y Ollama (con template específico para el modo instruct).
- Sin soporte de tool calling ni function calling: el autor indica explícitamente que no fue entrenado para ello.
- Sin capacidades multimodales, de audio ni de visión.
- Sin modo thinking: es un modelo instruct no-thinking, y usar la plantilla por defecto de Qwen3 en Ollama produce respuestas vacías.

## Casos de uso
- Consulta sobre el corpus personal del autor: el modelo responde preguntas sobre su escritura, casos de estudio y estándares de diseño porque fue destilado específicamente sobre ese material.
- Asistente de documentación técnica interna: puede resumir y responder sobre un conjunto documental cerrado, que es el escenario para el que se diseñó la v1.
- Inferencia local en portátil: con el GGUF Q4_K_M (~2,5 GB) se puede ejecutar en Ollama o llama.cpp en un equipo sin GPU dedicada.
- Prototipado de pipelines de destilación: sirve como referencia reproducible para quien quiera generar datos sintéticos con un profesor y entrenar un especialista con QLoRA en hardware de consumo.
- Base para experimentos de ajuste personal: al estar fusionado y publicado en safetensors, se puede partir de él para nuevos ciclos de re-destilación, que es precisamente el flujo que sigue el autor.
- Demostración de despliegue en local con plantillas de chat corregidas: el repositorio incluye el template y los parámetros necesarios para evitar las respuestas vacías en Ollama, útil como ejemplo de integración.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta una evaluación con juez LLM sobre un split reservado: en una prueba A/B factual estrecha, la v2 obtuvo ~2,9/5 frente a ~3,9/5 de la v1. El propio autor señala que las preguntas de la v1 se solapan con su entrenamiento y que la v2 sacrifica algo de recall factual a cambio de mayor cobertura de su dominio.

## Requisitos de hardware
- VRAM estimada: ~8 GB en fp16 (pesos de ~8 GB según la model card); ~2,5 GB en Q4_K_M.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para fp16; para 4 bits basta con una GPU de gama media o incluso CPU.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16 y en equipos modestos con la cuantización Q4_K_M.
- Opciones de despliegue: transformers (fp16), llama.cpp, Ollama (con el template incluido en el repositorio) y text-generation-inference (etiqueta endpoints_compatible).
- Latencia y throughput: no disponibles; el autor solo indica que el entrenamiento tarda ~30 minutos por ejecución en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| helmsman-4b | 4,02 B | 262.144 | AGPL-3.0 | Especialista destilado sobre corpus personal; sin tool calling |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4 B | 262.144 | no disponible en la información | Modelo generalista; el autor indica que helmsman-4b no lo supera en chat abierto |
| Alternativas de 4B para uso local | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias
- Especialización estrecha: fuera del corpus de entrenamiento no es mejor que el modelo base, según el propio autor.
- Sin soporte de tool calling ni function calling, lo que lo descarta para pipelines de agentes.
- No apto para usos críticos de seguridad: los modos de fallo del profesor de destilación se propagan al modelo.
- Riesgo de alucinación en preguntas factuales; la evaluación A/B del autor muestra un descenso de ~3,9/5 a ~2,9/5 en la v2.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas.
- Licencia AGPL-3.0-or-later, que impone obligaciones de copyleft para uso en red y puede ser restrictiva en productos comerciales.
- Trampa de plantilla en Ollama: usar la plantilla por defecto de Qwen3 produce respuestas vacías; es obligatorio emplear el template incluido en el repositorio.
- Corpus de entrenamiento muy pequeño (305 pares en v1, 420 en v2), lo que limita la generalización.
- El autor advierte que la model card anterior describía erróneamente el repositorio como adaptador LoRA; el artefacto publicado es el modelo fusionado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sinhaankur/helmsman-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Proyecto Unhosted (receta de destilación): https://github.com/unhosted-ai
