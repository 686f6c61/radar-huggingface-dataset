# saif24565/sopu-coder-fast-mlx-adapters

## Resumen

SopuCoder Fast (v1.1-candidate) es un conjunto de adaptadores LoRA publicados por el usuario saif24565 sobre el modelo base Qwen2.5-Coder-1.5B-Instruct, orientado a generacion de codigo en entornos Apple Silicon mediante MLX-LM. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango (rank 8) sobre 16 capas del transformer base, con el objetivo declarado de acelerar la inferencia y reducir el consumo de memoria en hardware de Apple frente al modelo original.

El modelo se distribuye como adaptadores (no como pesos completos), lo que implica que el usuario debe descargar por separado el modelo base cuantizado a 4 bits (`mlx-community/Qwen2.5-Coder-1.5B-Instruct-4bit`) y aplicar los adaptadores durante la carga. La model card reporta una velocidad de 60,55-68,71 tokens/s en un M1 de 16 GB, con un pico de memoria de 1,09 GB, cifras que el autor presenta como mejora frente al base y frente a una version anterior de 4B.

Es relevante ahora porque ejemplifica el ecosistema creciente de adaptadores ligeros para desarrollo local en portatiles Apple, un nicho donde las alternativas suelen ser modelos mas grandes o despliegues en la nube. No obstante, el repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el release es meramente nominal; conviene verificar la integridad del artefacto antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder), ajuste mediante LoRA sobre 16 capas |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-Coder-1.5B-Instruct); adaptadores LoRA de rango 8 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | 4 bits (modelo base `mlx-community/Qwen2.5-Coder-1.5B-Instruct-4bit`); los adaptadores se aplican sobre esa cuantizacion |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptadores LoRA para MLX (no safetensors completos ni GGUF nativo); el base en formato MLX cuantizado a 4 bits |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, y aplica Low-Rank Adaptation (LoRA) sobre 16 capas del transformer. Los hiperparametros declarados son rank 8, escala 20,0 y dropout 0,0, con optimizador Adam, learning rate 5e-5 y batch size 1. El entrenamiento consistio en 60 iteraciones, con una perdida que descendio de 1,560 a 0,118 en entrenamiento y 0,502 en validacion, a un throughput aproximado de 395 tokens/s sobre un Apple M1 con memoria unificada (Metal).

El dataset de ajuste fino se identifica como `datasets/v1.1/`, curado por contribuidores del proyecto SopuCoder bajo Apache 2.0, aunque no se detalla su composicion, numero de tokens ni proporcion de lenguajes. Las etiquetas del repositorio mencionan Python, TypeScript, React, Next.js, Yii2, WordPress y PHP, lo que sugiere un enfasis en desarrollo web y backend. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; tampoco se describen innovaciones arquitectonicas mas alla del propio ajuste LoRA.

## Capacidades

- Generacion de texto y codigo en lenguajes como Python, TypeScript, PHP (incluyendo Yii2 y WordPress), React y Next.js, segun las etiquetas del repositorio.
- Razonamiento sobre tareas de programacion de alcance medio, limitado por el tamano de 1.5B parametros del modelo base.
- Ejecucion local en Apple Silicon mediante MLX-LM, con soporte de inferencia cuantizada a 4 bits.
- Integracion con Ollama mediante un Modelfile incluido en el repositorio (`Modelfile.v1.1-candidate`).
- Soporte de plantilla de chat estilo Qwen (`<|im_start|>` / `<|im_end|>`), lo que permite conversaciones multi-turno.
- Capacidades de tool calling, function calling y agentes: no disponibles de forma explicita en la informacion proporcionada; el modelo base Qwen2.5-Coder-Instruct soporta function calling, pero no se documenta su preservacion tras el ajuste.
- Capacidades multilingues: limitadas a ingles segun el campo `language` del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Autocompletado de codigo en el editor sobre portatiles Apple: el modelo, con 1,09 GB de pico de memoria y 60-68 tokens/s en M1, puede ejecutarse en segundo plano en un MacBook sin desplazar recursos de otras aplicaciones.
- Generacion de componentes React y hooks personalizados: la etiqueta React y el ejemplo de la model card (`useOptimisticMutation`) indican un ajuste orientado a este tipo de tareas de frontend.
- Desarrollo de plugins y temas de WordPress: el ajuste incluye PHP y WordPress entre sus etiquetas, lo que permite generar snippets y funciones de extension dentro de un IDE local.
- Trabajo con Yii2 y backend PHP: util para equipos que mantienen aplicaciones PHP legacy y necesitan asistencia de codigo sin enviar fragmentos a servicios en la nube.
- Prototipado rapido de scripts en Python y TypeScript en entornos con conectividad limitada o requisitos de privacidad, al ejecutarse completamente en local.
- Pruebas de integracion en pipelines de CI sobre runners macOS con Apple Silicon, usando MLX-LM como backend de generacion para tests de documentacion o ejemplos de codigo.
- Evaluacion de adaptadores LoRA en docencia o investigacion: el repositorio documenta hiperparametros y curvas de perdida, lo que lo hace util como caso de estudio reproducible de fine-tuning en MLX.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de inferencia del propio autor en un Apple M1 de 16 GB, no benchmarks estandar de calidad (MMLU, HumanEval, GSM8K). Se reproducen a continuacion tal cual aparecen en la model card:

| Metrica | Base upstream (1.5B) | SopuCoder Fast v1.0.0 (4B) | SopuCoder Fast v1.1-candidate |
|---|---|---|---|
| Velocidad de inferencia | ~35 tokens/s | ~22,38 tokens/s | 60,55 - 68,71 tokens/s |
| Pico de memoria | ~1,5 GB | ~3,30 GB | 1,09 GB |
| Ventana de contexto | 8.192 tokens | 16.384 tokens | 8.192 tokens |
| Artefactos de repeticion | Bajos | Ninguno | Ninguno |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,09 GB de pico en inferencia con cuantizacion a 4 bits, segun la medicion del autor en M1 de 16 GB.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada; el backend MLX esta disenado especificamente para estos chips.
- Compatibilidad con GPU consumer NVIDIA: no directa mediante MLX; requeriria conversion a otro formato (por ejemplo GGUF) no documentada en el repositorio.
- Cabe en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada, dado el bajo consumo reportado.
- Opciones de despliegue: MLX-LM (`mlx_lm generate` con `--adapter-path`) y Ollama mediante Modelfile. vLLM, llama.cpp o TGI no estan soportados de forma nativa para adaptadores MLX.
- Latencia y throughput: 60,55-68,71 tokens/s en M1 de 16 GB durante inferencia; 395 tokens/s durante entrenamiento en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SopuCoder Fast v1.1-candidate | 1,5B (base) + LoRA r8 | 8.192 | Apache 2.0 | Adaptadores MLX; repo de 0.0 GB y 0 descargas | Optimizado para Apple Silicon; sin benchmarks de calidad publicados |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 (modelo original) | Apache 2.0 | Pesos completos en Hugging Face, ampliamente descargado | Base del anterior; soporte multilingue y function calling documentados |
| Qwen2.5-Coder-7B-Instruct | 7B | 32.768 | Apache 2.0 | Pesos completos, multiples cuantizaciones | Mayor calidad de codigo a costa de mas memoria |
| DeepSeek-Coder-V2-Lite | 16B (MoE, 2,4B activos) | 128.000 | Licencia propia de DeepSeek | Pesos completos | Alternativa MoE con mayor contexto y calidad, requiere mas recursos |

La comparativa se limita a datos publicos de los modelos base; no se dispone de evaluaciones cara a cara entre SopuCoder Fast y las alternativas en tareas de codigo.

## Limitaciones y advertencias

- El repositorio reporta un tamano de 0.0 GB y 0 descargas, lo que sugiere que los pesos de los adaptadores pueden no estar efectivamente publicados o que el release esta incompleto; verificar antes de usarlo.
- Es una version "candidate" (v1.1-candidate), no un release estable; el autor no garantiza la reproducibilidad de los resultados.
- El ajuste se realizo con solo 60 iteraciones sobre un dataset no documentado en composicion ni tamano, lo que limita la confianza en la generalizacion.
- La perdida de validacion (0,502) es notablemente superior a la de entrenamiento (0,118), lo que puede indicar sobreajuste al conjunto de ajuste.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Ventana de contexto de 8.192 tokens, inferior a los 32.768 del Qwen2.5-Coder-1.5B-Instruct original, lo que reduce la capacidad de manejar repositorios o archivos largos.
- Sin benchmarks de calidad publicados (HumanEval, MMLU, etc.); las cifras de velocidad no implican mejor calidad de codigo generado.
- Riesgo de alucinacion en APIs, librerias y funciones inexistentes, habitual en modelos de 1,5B parametros, especialmente en frameworks poco representados en el dataset.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon; no hay soporte documentado para CUDA, ROCm ni despliegue en servidores Linux con GPU.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar tambien las condiciones del modelo base Qwen2.5-Coder y del dataset de ajuste.
- No se documenta la preservacion de function calling ni de capacidades de agente tras el ajuste LoRA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/saif24565/sopu-coder-fast-mlx-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Base cuantizada para MLX: https://huggingface.co/mlx-community/Qwen2.5-Coder-1.5B-Instruct-4bit
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentacion de MLX: https://ml-explore.github.io/mlx/
- Ollama: https://ollama.com
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
