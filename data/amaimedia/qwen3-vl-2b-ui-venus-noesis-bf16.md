# AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-BF16

## Resumen

UI-Venus-1.5-2B-NOESIS-BF16 es un repack en precisión bfloat16 del modelo `inclusionAI/UI-Venus-1.5-2B`, un agente multimodal especializado en interacción con interfaces gráficas (GUI). El repack lo publica AMAImedia como parte de su plataforma NOESIS de automatización de doblaje, aunque el propio autor aclara que este modelo queda fuera del pipeline de doblaje y se mantiene para investigación general de agentes. No se trata de un modelo nuevo: los pesos son idénticos al original, solo se ha cambiado el dtype de almacenamiento de FP16 a BF16 mediante un cast IEEE-754 sin pérdida de valores.

El modelo original, desarrollado por inclusionAI, está basado en Qwen3-VL-2B y ha sido entrenado con un pipeline de cuatro etapas (Mid-Train, Offline-RL, Online-RL y Model-Merge) sobre 10 mil millones de tokens de GUI procedentes de más de 30 conjuntos de datos. Su propósito es la navegación autónoma de interfaces, el grounding de elementos UI y la comprensión de capturas de pantalla. Según la model card, alcanza resultados SOTA en benchmarks como ScreenSpot-Pro (57,7 %), VenusBench-GD, OSWorld-G, AndroidWorld/Lab y WebVoyager.

La relevancia de este repack concreto radica en que muchos flujos de trabajo de fine-tuning con LoRA/DoRA y herramientas de cuantización (bitsandbytes, AWQ, GPTQ) prefieren o requieren una base en BF16. Al materializar el cast en disco, se elimina la necesidad de convertir los pesos en cada carga y se facilita la integración en pipelines de entrenamiento y despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (basada en Qwen3-VL-2B) |
| Parametros totales | 2.438.696.960 (~2,4 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende de la config de Qwen3-VL-2B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo ofrece BF16; se pueden generar cuantizaciones a partir de él) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un repack de `inclusionAI/UI-Venus-1.5-2B`, que a su vez se basa en la arquitectura Qwen3-VL-2B, un transformer multimodal de visión-lenguaje con aproximadamente 2,4 mil millones de parámetros. La model card del repack no detalla la configuración interna (número de capas, heads, tamaño oculto, etc.) y remite al `config.json` del repo. El modelo original fue entrenado con un pipeline de cuatro etapas: una fase de Mid-Train sobre 10 mil millones de tokens de GUI, seguida de Offline-RL, Online-RL y un paso final de Model-Merge. Se utilizaron más de 30 conjuntos de datos de interfaces gráficas, lo que lo convierte en un especialista en comprensión de UI, grounding de elementos y navegación autónoma.

El repack NOESIS no introduce ninguna innovación arquitectónica: es un cast puro de FP16 a BF16. Según las reglas selladas del framework DHCF-FNO, no se ha aplicado fine-tuning, destilación ni fusión de pesos. Los resultados de inferencia son bit-a-bit equivalentes al modelo original salvo por la diferencia de precisión inherente al cambio de dtype.

## Capacidades

- Navegación autónoma de interfaces gráficas (GUI): el modelo puede interpretar capturas de pantalla y ejecutar acciones sobre elementos de UI.
- Grounding de elementos UI: identifica y localiza visualmente botones, campos de texto, menús y otros componentes interactivos.
- Comprensión de capturas de pantalla: analiza imágenes de pantallas completas o regiones para extraer información estructural.
- Razonamiento multimodal: combina entrada visual (imagen de pantalla) con instrucciones textuales para decidir el siguiente paso.
- Soporte de agentes: diseñado para ser usado como agente en entornos de escritorio, web o móvil (OSWorld, AndroidWorld/Lab, WebVoyager).
- Capacidad multilingüe limitada: la model card indica soporte para inglés y chino.
- Compatibilidad con tool calling: no se menciona explícitamente, pero al ser un agente GUI, la interacción con herramientas es implícita en su diseño.

## Casos de uso

- Automatización de pruebas de software: el modelo puede recorrer una aplicación web o móvil siguiendo guiones de prueba, haciendo clic en botones y verificando que los flujos funcionan, lo que reduce el esfuerzo manual de QA.
- Asistente de accesibilidad: dado su grounding de elementos UI, puede ayudar a usuarios con discapacidad visual describiendo la estructura de una pantalla o sugiriendo acciones alternativas.
- RPA (automatización robótica de procesos): integrado en pipelines de automatización de tareas repetitivas en aplicaciones de escritorio o web, como rellenar formularios o extraer datos de sistemas legacy.
- Agente de soporte técnico remoto: un sistema que observa la pantalla del usuario y sugiere pasos de solución de problemas, señalando visualmente dónde hacer clic.
- Entrenamiento de modelos de UI más grandes: el repack BF16 sirve como base estable para fine-tuning con LoRA/DoRA en tareas específicas de comprensión de interfaces, gracias a la compatibilidad con PEFT.
- Investigación en agentes multimodales: el modelo puede utilizarse como punto de partida para experimentos de aprendizaje por refuerzo en entornos simulados de GUI, dado su tamaño contenido (~2,4 B) que permite iterar con recursos moderados.

## Benchmarks y rendimiento

La model card del repack no incluye tablas de benchmarks propias, pero menciona que el modelo original alcanza SOTA en los siguientes conjuntos de datos:

| Benchmark | Resultado |
|---|---|
| ScreenSpot-Pro | 57,7 % |
| VenusBench-GD | no disponible (se menciona SOTA sin cifra) |
| OSWorld-G | no disponible (se menciona SOTA sin cifra) |
| AndroidWorld/Lab | no disponible (se menciona SOTA sin cifra) |
| WebVoyager | no disponible (se menciona SOTA sin cifra) |

No se han publicado resultados comparativos detallados en la información disponible. Los datos de ScreenSpot-Pro son los únicos con cifra concreta. No se dispone de resultados de MMLU, HumanEval u otros benchmarks genéricos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,4 B parámetros en BF16, el modelo ocupa aproximadamente 4,6 GB en memoria. Con cuantización a 8 bits (~2,3 GB) o 4 bits (~1,2 GB) podría ejecutarse en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: cualquier GPU con soporte nativo de BF16, es decir, Ampere o posterior (RTX 30xx, RTX 40xx, A100, H100) y GPUs AMD con CDNA2 (MI200) o posterior.
- Compatibilidad con GPUs de consumo: sí, cabe en una RTX 3060 (12 GB) o RTX 4060 (8 GB) sin cuantizar, y en GPUs de 6 GB con cuantización.
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión) y el pipeline clásico de HuggingFace con `transformers`.
- Latencia y throughput: no se proporcionan datos medidos. En una RTX 3060, la inferencia de un modelo de 2,4 B en BF16 suele rondar los 20-40 tokens/s, pero depende del hardware y de la longitud de la entrada visual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| UI-Venus-1.5-2B (original) | ~2,4 B | no disponible | Agente GUI, grounding UI | Apache 2.0 |
| Qwen3-VL-2B (base) | ~2,4 B | no disponible | Multimodal general | Apache 2.0 |
| UI-TARS-1.5-7B | ~7 B | no disponible | Agente GUI, grounding UI | Apache 2.0 |

El modelo compite directamente con otros agentes GUI como UI-TARS. Su ventaja es el tamaño reducido (2,4 B frente a 7 B), lo que permite despliegue en hardware más modesto. La desventaja es que su rendimiento en tareas complejas de razonamiento visual puede ser inferior a modelos más grandes. El repack BF16 no añade ninguna diferencia funcional respecto al original, solo facilita el fine-tuning y la cuantización.

## Limitaciones y advertencias

- Es un repack, no un modelo nuevo: no hay ninguna mejora de rendimiento respecto al original; los pesos son idénticos salvo el cambio de dtype.
- Sesgos y alucinaciones: no se dispone de estudios específicos sobre este modelo, pero al ser un modelo multimodal entrenado principalmente con datos de GUI, puede alucinar elementos de interfaz que no existen en la captura de pantalla.
- Limitación de idiomas: solo soporta inglés y chino; no se garantiza un buen comportamiento en otros idiomas.
- Contexto limitado: al ser un modelo de 2,4 B, la ventana de contexto es reducida en comparación con modelos grandes, lo que puede afectar a tareas que requieran recordar muchas interacciones previas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar la atribución del modelo original y del repack.
- Precisión BF16: aunque el cast es lossless en teoría, la menor precisión de BF16 frente a FP32 puede afectar a operaciones sensibles en algunos casos extremos, aunque para inferencia y fine-tuning con LoRA suele ser suficiente.
- El modelo está pensado para tareas de GUI; su uso en otros dominios multimodales (fotografía, documentos, etc.) puede dar resultados mediocres.

## Enlaces

- Repo de HuggingFace: https://huggingface.co/AMAImedia/Qwen3-VL-2B-UI-Venus-NOESIS-BF16
- Modelo original: https://huggingface.co/inclusionAI/UI-Venus-1.5-2B
- Proyecto UI-Venus: https://ui-venus.github.io/UI-Venus-1.5
- Paper (arxiv): https://arxiv.org/abs/2602.09082
- Organización AMAImedia: https://www.amaimedia.com
- Repo de herramientas de repack: https://github.com/AMAImedia
