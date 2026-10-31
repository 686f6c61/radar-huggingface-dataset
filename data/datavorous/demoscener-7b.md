# datavorous/Demoscener-7B

## Resumen

Demoscener-7B es un proyecto de adaptación especializada que ajusta Qwen2.5-Coder-7B Base para generar animaciones cortas en JavaScript al estilo de Dwitter, la plataforma donde los demosceners crean visualizaciones en menos de 140 caracteres de código. El desarrollador, datavorous, ha publicado tres adaptadores LoRA independientes que representan etapas sucesivas de entrenamiento: continued pretraining (CPT) sobre código de Dwitter, un curriculum basado en ranking de calidad, y una fase final de optimización de preferencias con GRPO.

El problema que resuelve es la generación de código JavaScript extremadamente compacto e idiomático para efectos visuales en tiempo real, un dominio con patrones muy particulares (canvas 2D, trucos de compresión de código, matemáticas de shaders) que un modelo de código general maneja con dificultad. Su relevancia es principalmente didáctica e investigadora: al publicar los tres adaptadores por separado, permite estudiar el efecto de cada etapa de entrenamiento sobre un mismo modelo base.

Técnicamente, es un adaptador PEFT/LoRA sobre Qwen2.5-Coder-7B (arquitectura transformer decoder-only de 7 mil millones de parámetros), entrenado con el dataset datavorous/Demoscener-Dweets-25k. La licencia del repositorio es CC-BY-4.0, aunque hay que tener en cuenta que el modelo base Qwen2.5-Coder se rige por su propia licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer decoder-only (Qwen2.5-Coder-7B) |
| Parametros totales | 7B (modelo base); tamaño de los adaptadores LoRA no disponible |
| Parametros activos | no disponible (no es MoE; el modelo base es denso) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-Coder-7B; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (los adaptadores se cargan sobre base BF16; se menciona entrenamiento sobre bases cuantizadas en etapas posteriores) |
| Idiomas soportados | no disponible (especializado en JavaScript para Dwitter) |
| Licencia | CC-BY-4.0 (adaptadores); el modelo base Qwen2.5-Coder usa Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA, repo de 0,5 GB) |

## Arquitectura y entrenamiento

El proyecto no entrena un modelo desde cero: aplica adaptadores LoRA (técnicas PEFT) sobre Qwen2.5-Coder-7B Base, un transformer decoder-only denso de 7B parámetros. Se publican tres adaptadores, cada uno correspondiente a una etapa del pipeline de entrenamiento, y todos pueden cargarse simultáneamente sobre la misma base y conmutarse en tiempo de ejecución mediante `set_adapter`.

El pipeline de entrenamiento consta de tres fases. Primero, CPT (continued pretraining) sobre programas de Dwitter para que el modelo interiorice la sintaxis y los patrones de este formato. Segundo, un curriculum que continúa desde CPT entrenando con los 5.000 dweets mejor posicionados según su ranking de "awesomeness", para estudiar el efecto del entrenamiento basado en ranking de calidad. Tercero, GRPO (Group Relative Policy Optimization) usando preferencias humanas entre continuaciones generadas. Un detalle técnico importante que advierte el autor: las etapas posteriores se entrenaron sobre bases cuantizadas, por lo que sus probabilidades sobre una base compartida en BF16 pueden diferir de las de las ejecuciones originales de entrenamiento.

## Capacidades

- Generación de código JavaScript para animaciones de Dwitter (efectos visuales en canvas 2D con código ultra-compacto)
- Autocompletado de código en el estilo específico de la demoscene de Dwitter
- Comparación experimental entre tres etapas de entrenamiento (CPT, curriculum con ranking, GRPO con preferencias humanas) cargando varios adaptadores sobre la misma base
- Hereda las capacidades generales de Qwen2.5-Coder-7B Base en completación de código, aunque el afinamiento está orientado a este dominio concreto
- Soporte de tool calling: no disponible (el modelo base es la variante Base, no Instruct)
- Capacidades multilingües: no disponible
- Visión, audio u otras modalidades: no disponible

## Casos de uso

- Generación de dweets (animaciones JavaScript de menos de 140 caracteres): el caso de uso principal; el modelo continúa un prefijo de código como `c.width=1920;for(i=0;i<80;i++)x.fillRect(` con una animación completa coherente con el estilo de Dwitter.
- Investigación en pipelines de entrenamiento LLM: los tres adaptadores permiten comparar empíricamente el efecto del CPT, del curriculum basado en ranking y del GRPO sobre el mismo modelo base, lo que lo hace idóneo para estudios académicos o tutoriales sobre post-entrenamiento.
- Aprendizaje de técnicas PEFT/LoRA: el repositorio muestra un ejemplo completo y funcional de carga multi-adaptador con `peft` y conmutación en caliente mediante `load_adapter` y `set_adapter`, útil como referencia de implementación.
- Exploración creativa de la demoscene: artistas o entusiastas de la demoscene pueden usarlo para generar borradores de efectos visuales compactos que luego refinar a mano.
- Análisis del efecto de la calidad de datos: comparar los adaptadores `cpt/` y `curriculum/` permite observar cómo el entrenamiento solo con los 5.000 dweets mejor valorados modifica las salidas del modelo.
- Estudio de RLHF/GRPO a pequeña escala: el adaptador `grpo/` sirve como caso práctico de optimización de preferencias humanas sobre continuaciones de código generadas.
- Prototipado de herramientas de autocompletado de nicho: la base + adaptador podría integrarse en un editor para asistir la escritura de código creativo en canvas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (MMLU, HumanEval, GSM8K u otras), ni comparaciones con el modelo base; la evaluación parece ser cualitativa, basada en la comparación de continuaciones generadas por los tres adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-18 GB en FP16/BF16 para el modelo base de 7B más los adaptadores (dato no confirmado en la model card; estimación basada en el tamaño estándar de un modelo de 7B). Con cuantización a 4 bits podría reducirse a unos 5-6 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para inferencia en BF16; A100 o H100 no son necesarias para este tamaño.
- Consumer GPUs: sí, cabe en una RTX 3090 o RTX 4090 en precisión completa; en GPUs de 8-12 GB (RTX 3060/4070) sería necesario cuantizar la base a 4 bits.
- Opciones de despliegue: el código de la model card usa `transformers` + `peft` con `device_map="auto"`. Al ser adaptadores LoRA sobre Qwen2.5-Coder-7B, también debería ser compatible con vLLM (soporte de LoRA), llama.cpp (fusionando los adaptadores en GGUF) u Ollama tras hacer merge; estas rutas no están documentadas oficialmente en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Demoscener-7B | LoRA sobre Qwen2.5-Coder-7B | 7B (base) | 32.768 tokens (heredada, no confirmada) | CC-BY-4.0 | Dwitter/demoscene JavaScript |
| Qwen2.5-Coder-7B (Base) | Transformer denso | 7B | 32.768 tokens | Apache 2.0 | Código general |
| Qwen2.5-Coder-7B-Instruct | Transformer denso | 7B | 32.768 tokens | Apache 2.0 | Código general, instrucciones |

Demoscener-7B no compite en benchmarks generales: su valor diferencial es la especialización extrema en un dominio muy concreto y su estructura experimental de tres adaptadores. Frente al modelo base, ofrece salidas mucho más ajustadas al estilo Dwitter a cambio de un alcance mucho más limitado y una licencia (CC-BY-4.0) distinta a la del modelo base.

## Limitaciones y advertencias

- Alcance muy estrecho: el modelo está afinado exclusivamente para continuaciones de código Dwitter; no debe esperarse rendimiento general de código o texto.
- Es un adaptador, no un modelo completo: requiere descargar y cargar Qwen2.5-Coder-7B Base (no Instruct) por separado.
- Desajuste de cuantización: las etapas curriculum y grpo se entrenaron sobre bases cuantizadas, por lo que su comportamiento sobre una base BF16 puede desviarse del observado durante el entrenamiento, según advierte el propio autor.
- Riesgo de alucinación de código: como todo modelo de generación de código, puede producir JavaScript sintácticamente válido pero funcionalmente incorrecto; no hay datos de evaluación publicados.
- Sesgos: no disponible; el entrenamiento con dweets mejor valorados puede introducir sesgos hacia estilos visuales concretos de la comunidad de Dwitter.
- Idiomas y capacidades generales: no disponibles ni documentadas; el modelo no está pensado para uso multilingüe ni conversacional.
- Licencia: los adaptadores se publican bajo CC-BY-4.0, que exige atribución; el uso del modelo base queda además sujeto a la licencia Apache 2.0 de Qwen. Verificar la compatibilidad antes de uso comercial.
- Adopción mínima: 0 descargas registradas en el momento de redactar la ficha, sin comunidad de soporte ni issues documentados.
- Sin tool calling ni modo instruccional: al partir de la variante Base, no está diseñado para agentes ni function calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/datavorous/Demoscener-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/datavorous/Demoscener-Dweets-25k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Blog del autor sobre el proyecto: https://datavorous.com/writing/demoscener
