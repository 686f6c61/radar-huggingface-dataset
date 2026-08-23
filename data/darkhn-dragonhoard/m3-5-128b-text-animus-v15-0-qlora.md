# Darkhn-DragonHoard/M3.5-128B-Text-Animus-V15.0-Qlora

## Resumen

El modelo M3.5-128B-Text-Animus-V15.0-Qlora es un fine-tuning del modelo Mistral 3 de 128 mil millones de parámetros, publicado por el usuario Darkhn-DragonHoard en HuggingFace. El nombre sugiere una especialización en generación de texto con un enfoque "animus" (posiblemente roleplay o narrativa), y la versión V15.0 indica un proceso iterativo de desarrollo. El entrenamiento se realizó mediante QLoRA, una técnica que cuantiza el modelo base a 4 bits y entrena adaptadores de bajo rango, lo que permite ajustar modelos muy grandes con recursos limitados. El repositorio tiene acceso restringido y un tamaño de 287,9 GB, lo que indica que incluye los pesos completos o una versión cuantizada del modelo.

La información pública es muy limitada: no se especifican la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento. El modelo se encuentra en una fase de publicación con pocas descargas (7) y sin métricas de evaluación. Aunque el autor tiene otros modelos similares (como L3.3-70B-Animus-V10), no se dispone de documentación técnica detallada para este lanzamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral 3 (transformer) |
| Parametros totales | 128B (según nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base Mistral 3 de 128B parámetros, realizado con QLoRA. QLoRA (Quantized Low-Rank Adaptation) cuantiza los pesos del modelo base a 4 bits mediante bitsandbytes y entrena adaptadores de bajo rango, lo que reduce drásticamente los requisitos de memoria y permite el fine-tuning en una sola GPU. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre "Animus" sugiere una orientación hacia la generación de texto narrativo o roleplay, pero no hay confirmación oficial.

## Capacidades

- Generación de texto: se espera que el modelo base Mistral 3 tenga capacidades de generación de texto, razonamiento, código y matemáticas, pero no se han validado para este fine-tuning concreto.
- Roleplay / narrativa: el nombre "Animus" y los proyectos previos del autor indican una posible especialización en diálogos de personajes y narrativa, pero no hay evidencia documentada.
- Tool calling: no se especifica.
- Soporte multilingüe: no se especifica.
- Modo de razonamiento extendido: no se especifica.

## Casos de uso

- Roleplay en línea: el modelo podría emplearse para generar respuestas de personajes en juegos de rol o chats interactivos, aprovechando un posible entrenamiento en diálogos.
- Generación de historias: podría utilizarse para crear narrativas de ficción, pero sin datos de rendimiento reales.
- Asistente creativo: para brainstorming de personajes y tramas, aunque la falta de validación limita su aplicación en producción.
- Prototipado de sistemas conversacionales: como base para experimentos de fine-tuning adicionales, pero requiere acceso al modelo y licencia clara.
- Investigación académica: para estudiar el efecto de QLoRA en modelos grandes, pero la falta de documentación dificulta la reproducibilidad.
- Aplicaciones comerciales: no se recomienda sin confirmar la licencia y los términos de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 128B con cuantización 4-bit, la inferencia requiere al menos 64 GB de VRAM (por ejemplo, 80 GB en GPUs profesionales). No se confirma oficialmente.
- GPU recomendada: A100 80GB, H100 80GB o similar; no se ha indicado compatibilidad con GPUs de consumo.
- Opciones de despliegue: no se mencionan, pero dado el formato safetensors y cuantización 4-bit, podría usarse con vLLM, llama.cpp o TGI, aunque no está verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos. El autor tiene otros modelos como L3.3-70B-Animus-V10.0 y M3.5-128B-Animus-V14.0, pero no se han publicado métricas de rendimiento. No hay información sobre alternativas de otros autores.

## Limitaciones y advertencias

- Falta de documentación: no se proporcionan detalles de entrenamiento, sesgos o riesgos de alucinación.
- Licencia desconocida: el acceso está restringido (gated) y no se indica licencia, por lo que el uso comercial es incierto.
- Tamaño del archivo: 287,9 GB implica un almacenamiento significativo y requisitos de hardware altos.
- Sin validación: no hay benchmarks ni evaluaciones independientes, por lo que su calidad es desconocida.
- Riesgo de alucinación: al no haber datos de entrenamiento, no se puede evaluar la fiabilidad.
- Sesgos: no se ha realizado auditoría de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Darkhn-DragonHoard/M3.5-128B-Text-Animus-V15.0-Qlora
- Perfil del autor: https://huggingface.co/Darkhn-DragonHoard
- Modelo similar (V14.0): https://huggingface.co/Darkhn/M3.5-128B-Animus-V14.0
- Información sobre QLoRA: https://github.com/artidoro/qlora
- Guía de LoRA y QLoRA: https://www.meta-intelligence.tech/en/insight-lora-finetuning
