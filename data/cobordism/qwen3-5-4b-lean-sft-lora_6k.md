# cobordism/qwen3.5-4b-lean-sft-lora_6k

## Resumen

El modelo `cobordism/qwen3.5-4b-lean-sft-lora_6k` es un adaptador LoRA de rango 64 entrenado sobre el modelo base `Qwen/Qwen3.5-4B` mediante aprendizaje supervisado (SFT) con datos de demostración formal en Lean. El objetivo es mejorar la capacidad del modelo para generar pruebas formales verificables en el asistente de pruebas Lean, un área de la demostración automática de teoremas. El adaptador fue publicado por el usuario `cobordism` en Hugging Face como un artefacto de investigación, y no es un modelo independiente: debe cargarse junto con el modelo base mediante la librería PEFT.

El entrenamiento se realizó durante 6.000 pasos y, según la model card, el checkpoint verifica 32 de 64 problemas (50,0%) en el conjunto de control miniF2F en modo directo de un solo intento. Este resultado indica un rendimiento moderado en problemas de razonamiento matemático formalizado, aunque no se proporcionan comparaciones con otros modelos. La relevancia de este adaptador radica en su aplicación práctica para la verificación formal de teoremas, un campo con creciente interés en la comunidad de IA y matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre Qwen3.5-4B) |
| Parametros totales | no disponible (el adaptador tiene un tamanio de 0.3 GB, el modelo base tiene 4B parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA (Low-Rank Adaptation) con rango 64, lo que permite ajustar el modelo base Qwen3.5-4B sin modificar todos sus parámetros. Los datos de entrenamiento consisten en ejemplos de demostraciones formales en Lean, probablemente generados o extraídos de repositorios de pruebas matemáticas. El entrenamiento se realizó mediante SFT (supervised fine-tuning) durante 6.000 pasos. No se especifican detalles sobre el tamaño del dataset, la composición exacta ni si se aplicaron técnicas adicionales como RLHF o DPO. El adaptador se publica como un artefacto de investigación, y el autor advierte que los usuarios deben cumplir con los términos del modelo base Qwen.

## Capacidades

- Generacion de pruebas formales en Lean: el adaptador está especializado en producir secuencias de tácticas y términos que verifican teoremas en el lenguaje Lean.
- Razonamiento matematico: al estar entrenado sobre datos de demostración, puede abordar problemas de lógica y matemáticas formalizadas.
- Integracion con el modelo base Qwen3.5-4B: al cargarse con PEFT, conserva las capacidades generales del modelo base (generación de texto, razonamiento, etc.), aunque no se documentan explícitamente.
- No se mencionan capacidades de tool calling, agentes o multimodales en la información disponible.

## Casos de uso

- Verificacion formal de teoremas en Lean: el adaptador puede generar pruebas para lemas y teoremas en proyectos como mathlib, reduciendo el esfuerzo manual de los desarrolladores.
- Asistencia en demostraciones interactivas: integrado en un entorno como Lean, puede sugerir tácticas o completar subobjetivos durante una sesión de demostración.
- Automatizacion de pruebas en pipelines de CI/CD: para proyectos que requieren verificación formal de propiedades, el modelo puede generar pruebas que luego se compilan y verifican automáticamente.
- Educacion matematica: puede utilizarse como herramienta didáctica para explicar pasos de demostración en Lean.
- Investigacion en demostracion automatica: sirve como punto de partida para experimentos con otros datasets o técnicas de entrenamiento.
- Generacion de datos sinteticos de entrenamiento: el adaptador puede producir ejemplos de pruebas que luego se usan para entrenar otros modelos.

## Benchmarks y rendimiento

Según la model card, el adaptador obtuvo 32/64 (50,0%) en el conjunto de control miniF2F en modo directo de un solo intento. No se proporcionan resultados comparativos con otros modelos ni métricas adicionales.

| Benchmark | Resultado |
|---|---|
| miniF2F (64 problemas, un solo intento) | 32/64 (50,0%) |

No se han publicado resultados de benchmarks en la informacion disponible más allá de este dato.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.3 GB, por lo que el requisito principal es el del modelo base Qwen3.5-4B.
- Para ejecutar el modelo base con el adaptador se necesita una GPU con al menos 8 GB de VRAM si se usa cuantización de 4 bits, o 16-20 GB para precisión completa (estimación basada en el tamaño del modelo base, no confirmada).
- Se recomienda una GPU como NVIDIA RTX 3090/4090 o superior para inferencia con cuantización, y A100/H100 para entrenamiento o inferencia de alta velocidad.
- Opciones de despliegue: se puede usar con la librería `transformers` y `peft` en Python, o exportar a formatos como GGUF para ejecutarlo con llama.cpp u Ollama, aunque no se documentan pasos específicos.
- La latencia y el throughput dependen del hardware y de la configuración de cuantización; no se dispone de datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente para demostración formal en Lean con Qwen3.5-4B. Existen otros adaptadores y modelos como los basados en Llama o Mistral con fine-tuning en Lean, pero no se proporcionan datos de rendimiento comparables en la información disponible.

## Limitaciones y advertencias

- El adaptador es un artefacto de investigación y no ha sido sometido a una evaluación exhaustiva de sesgos o robustez.
- El resultado en miniF2F es moderado (50%) y puede no generalizar a problemas fuera del conjunto de entrenamiento.
- Depende del modelo base Qwen3.5-4B; cualquier limitación de ese modelo (sesgos, alucinaciones, idiomas) se hereda.
- No se especifica la licencia del adaptador; los usuarios deben revisar los términos del modelo base Qwen y cumplir con ellos.
- No se garantiza la corrección de las pruebas generadas; siempre debe verificarse el resultado con el compilador de Lean.
- No se documentan capacidades multilingües ni soporte de otros lenguajes de demostración.

## Enlaces

- [Hugging Face: cobordism/qwen3.5-4b-lean-sft-lora_6k](https://huggingface.co/cobordism/qwen3.5-4b-lean-sft-lora_6k)
- [GitHub: Qwen3.5-4B LoRA Fine-tuning on Step-3.5-Flash-SFT](https://github.com/IIIIQIIII/qwen35-4b-lora-sft) (proyecto relacionado con fine-tuning de Qwen3.5-4B)
- [GitHub: Qwen 3.5 4B Fine-Tuning reproduction process](https://github.com/David-BOOM/MathThink-Qwen-3.5-4B) (reproducción de fine-tuning matemático)
- [Hugging Face: nibauman/ObjNav-Qwen3.5-4B-SFT-combined](https://huggingface.co/nibauman/ObjNav-Qwen3.5-4B-SFT-combined) (otro adaptador SFT sobre Qwen3.5-4B)
- [Ollama: qwen3.5:4b](https://ollama.com/library/qwen3.5:4b) (información general sobre el modelo base)
