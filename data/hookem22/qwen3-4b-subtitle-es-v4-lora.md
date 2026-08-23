# Hookem22/qwen3-4b-subtitle-es-v4-lora

## Resumen

Hookem22/qwen3-4b-subtitle-es-v4-lora es un adaptador LoRA (version 4) afinado sobre el modelo base unsloth/qwen3-4b-unsloth-bnb-4bit, que es la version cuantizada a 4-bit del modelo Qwen3-4B de Alibaba. El autor, Hookem22, lo publica bajo licencia Apache 2.0 y el nombre del repositorio indica una especializacion en subtitulos en espanol (subtitle-es). El tamano del repositorio, 0.1 GB, confirma que se trata de un adaptador ligero y no de un modelo completo.

El entrenamiento se realizo con la libreria Unsloth, que el propio autor declara que acelera el proceso 2x respecto al entrenamiento convencional. La ficha tecnica del autor es minima: no incluye dataset, metodologia de entrenamiento ni benchmarks publicados, por lo que gran parte de las especificaciones deben inferirse del modelo base Qwen3-4B y de los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con adaptador LoRA |
| Parametros totales | 4B (modelo base) + parametros del adaptador LoRA (no disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo base en 4-bit (bitsandbytes); adaptador LoRA en safetensors |
| Idiomas soportados | en (segun etiqueta de HuggingFace); espanol segun el nombre del modelo (subtitle-es) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se anade al modelo base unsloth/qwen3-4b-unsloth-bnb-4bit, una version del Qwen3-4B cuantizada a 4-bit mediante bitsandbytes y optimizada con Unsloth. Qwen3-4B es un transformer denso (no MoE) de la familia Qwen3 de Alibaba, que soporta modos de pensamiento (thinking) y no-pensamiento. El adaptador LoRA introduce un numero reducido de parametros entrenables (no publicado) sobre las capas de atencion del modelo base.

El entrenamiento se realizo con la libreria Unsloth y TRL (transformers reinforcement learning), segun las etiquetas del repositorio. No se especifica el dataset utilizado, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. El modelo card indica que se entreno 2x mas rapido gracias a Unsloth, pero no aporta detalles adicionales sobre la composicion de los datos ni las hiperparametros.

## Capacidades

- Generacion de subtitulos en espanol: el nombre del modelo indica que esta especializado en producir subtitulos en espanol (subtitle-es).
- Ademas del especialidad declarada, hereda las capacidades del modelo base Qwen3-4B: generacion de texto, razonamiento, comprension de lenguaje natural y soporte de tool calling (dependiendo de la version de Qwen3 base).
- Compatible con text-generation-inference (TGI) segun las etiquetas del repositorio, lo que permite desplegarlo en infraestructura de inferencia estandar.
- Al ser un adaptador LoRA, se puede cargar sobre el modelo base 4-bit con la libreria PEFT de HuggingFace.

## Casos de uso

- Generacion automatica de subtitulos en espanol: el modelo puede producir subtitulos en espanol para contenido audiovisual, integrarse en pipelines de transcripcion y traduccion, y ser util para creadores de contenido que necesiten subtitular videos rapidamente.
- Post-procesado de subtitulos existentes: se puede usar para corregir o mejorar subtitulos generados por otros sistemas, ajustando el estilo, la puntuacion y la sincronizacion.
- Localizacion de contenido multimedia: para plataformas de streaming o distribuidores que necesiten generar subtitulos en espanol para catalogo internacional.
- Accesibilidad: generacion de subtitulos para personas con discapacidad auditiva, tanto en tiempo real como en post-produccion.
- Integracion en pipelines de video: junto con herramientas de transcripcion (Whisper, etc.) y de edicion, el modelo puede actuar como capa de generacion de subtitulos en espanol.
- Asistente de doblaje: como apoyo en la creacion de guiones de doblaje o subtitulos para doblaje, generando texto en espanol que luego se ajusta manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluacion especifica de subtitulos para este adaptador.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB), por lo que el requisito principal es la VRAM del modelo base cuantizado.
- El modelo base qwen3-4b-unsloth-bnb-4bit en 4-bit ocupa aproximadamente 2-3 GB de VRAM, por lo que es ejecutable en GPUs consumer como la RTX 3060 (12 GB) o superiores.
- Para inferencia en produccion con text-generation-inference, se recomienda al menos una GPU con 8-12 GB de VRAM para manejar el contexto y el batch.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama, o mediante la libreria PEFT de HuggingFace cargando el adaptador sobre el modelo base.
- La latencia y el throughput dependen del hardware; no se disponen de cifras publicadas para este adaptador especifico.

## Comparativa con modelos similares

No se disponen de modelos comparables directamente publicados en la informacion proporcionada. La comparativa mas relevante seria con el propio Qwen3-4B base (sin ajuste) y con otros adaptadores LoRA para subtitulos, pero no se han encontrado datos publicos de estos ultimos. Se puede afirmar que, al ser un adaptador sobre Qwen3-4B, hereda las capacidades del modelo base pero con menor coste de inferencia que un modelo completo de mayor tamano.

## Limitaciones y advertencias

- La model card es muy escasa: no se especifican el dataset de entrenamiento, el numero de tokens, ni la metodologia de evaluacion, lo que dificulta la reproducibilidad y la evaluacion de calidad.
- Discrepancia en el idioma: la etiqueta de HuggingFace indica "en" (ingles) mientras que el nombre del modelo indica espanol (subtitle-es). Esto puede causar confusion al seleccionar el modelo.
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de transcripcion y traduccion.
- Al ser un adaptador LoRA, es necesario cargar el modelo base cuantizado (unsloth/qwen3-4b-unsloth-bnb-4bit) para poder usar el modelo, lo que anade complejidad de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar las licencias del modelo base (Qwen3-4B) y de las herramientas de entrenamiento (Unsloth, bitsandbytes) para cumplir con sus respectivos terminos.
- No se han publicado evaluaciones de sesgos ni de robustez del modelo en escenarios de produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hookem22/qwen3-4b-subtitle-es-v4-lora
- Modelo base (unsloth): https://huggingface.co/unsloth/qwen3-4b-unsloth-bnb-4bit
- Modelo Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Endpoint de inferencia en FriendliAI (para la version anterior, sin v4): https://friendli.ai/models/Hookem22/qwen3-4b-subtitle-es
