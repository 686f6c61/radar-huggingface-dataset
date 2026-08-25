# 0xbidkslj1/albedo-sn97-workspace

## Resumen

Este repositorio de Hugging Face es un paquete de trabajo (workspace bundle) perteneciente al proyecto Albedo, la subred 97 de Bittensor dedicada a la destilación competitiva de modelos de lenguaje. El autor, `0xbidkslj1`, publica aquí el modelo ganador de la ronda v11, junto con los adaptadores LoRA de la cadena de entrenamiento, los paquetes de fine-tuning supervisado (SFT), el harness de evaluación local y el registro completo de trabajo. El modelo principal se denomina `albedo-qwen3.6-35b-v11` y se distribuye por separado en otro repositorio, mientras que este archivo actúa como un contenedor de almacenamiento para facilitar la descarga y restauración en una nueva máquina.

El modelo de 35 000 millones de parámetros (según el nombre) es un candidato a la destilación de un "modelo maestro" no especificado, dentro del marco de evaluación de 25 ejes de Albedo. Aunque la arquitectura interna no se detalla en la documentación, el nombre sugiere una base Qwen 3.6 de 35B. Este repositorio es relevante para quienes participan en la subnet Albedo o necesitan evaluar el modelo ganador v11, ya que incluye los pesos fusionados (export de 65 GB), los adaptadores LoRA de las versiones v8 a v11 y los datos de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere Qwen 3.6 de 35B) |
| Parámetros totales | 35 000 millones (según el nombre del modelo) |
| Parámetros activos | No aplica (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio contiene pesos en safetensors sin cuantización especificada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (según el tag del repositorio) |

## Arquitectura y entrenamiento

La información pública no describe la arquitectura interna del modelo. El nombre `qwen3.6-35b` sugiere una arquitectura transformer basada en la familia Qwen 3.6, pero no hay confirmación oficial. El entrenamiento se enmarca en el sistema de destilación de Albedo: los mineros entrenan un modelo pequeño para reproducir las respuestas de un modelo maestro gigante, y los validadores comparan la distribución de respuestas del candidato contra el maestro mediante un bucle de observación simulada. En el repositorio se documenta el uso de adaptadores LoRA (v8 a v11) y paquetes SFT de 4000 ejemplos, así como un registro de "duelos" (duels) entre modelos. No se han publicado detalles sobre el número de tokens de entrenamiento, composición del dataset o técnicas como RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento, derivadas de la destilación de un modelo maestro no especificado.
- El modelo está optimizado para imitar fielmente la distribución de respuestas del maestro, según el sistema de puntuación de Albedo.
- No se han documentado capacidades específicas como tool calling, agentes, visión o audio.
- No hay información sobre soporte multilingüe.
- El repositorio incluye el harness de evaluación y los adaptadores LoRA, lo que permite reproducir el entrenamiento y la evaluación local.

## Casos de uso

- **Investigación en destilación de modelos**: este repositorio sirve como referencia completa para reproducir el entrenamiento de un modelo destilado de 35B, incluyendo adaptadores y registros de duelo.
- **Evaluación en el marco de Albedo**: los mineros de la subnet 97 pueden descargar este paquete para ejecutar la evaluación local y verificar la validez del modelo v11 antes de enviarlo a la cadena.
- **Estudio de adaptadores LoRA**: los archivos de adaptadores v8–v11 permiten analizar la evolución del modelo a lo largo de la cadena de entrenamiento.
- **Replicación de resultados**: los scripts de `local_eval` y `local_train` incluidos permiten reproducir los procesos de entrenamiento y evaluación documentados.
- **Despliegue en infraestructura propia**: el peso fusionado de 65 GB puede cargarse en frameworks de inferencia para servir el modelo v11, aunque no se especifica compatibilidad con vLLM u otras herramientas.
- **Auditoría de procesos**: el registro `RECORD.md` y `RESTORE.md` documentan el flujo de trabajo completo, útil para auditorías de entrenamiento o investigación de metodologías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio contiene informes de duelo (`eval-runs/`) que comparan el modelo v11 contra el maestro en configuraciones de 8×12 y 32×12, pero no se incluyen cifras concretas en la documentación pública.

## Requisitos de hardware

- El export de pesos fusionados del modelo v11 ocupa 65 GB en safetensors. Para inferencia en precisión FP16 se estiman al menos 70 GB de VRAM (35B × 2 bytes por parámetro), lo que requiere una GPU profesional como A100 80GB o H100 80GB.
- Con cuantización INT8 (si estuviera disponible) se reduciría a ~35 GB, permitiendo tarjetas como RTX 4090 (24 GB) o A6000 (48 GB) con técnicas de offload.
- Con cuantización INT4 (no confirmada), ~17,5 GB podrían caber en una RTX 4090, pero no hay evidencia de que el modelo tenga cuantizaciones publicadas.
- El repositorio completo de 70,8 GB incluye los pesos del modelo, adaptadores, código y datasets, por lo que el almacenamiento local debe superar ese tamaño.
- No se indica soporte para vLLM, llama.cpp, Ollama o TGI; la documentación solo menciona scripts locales de evaluación y entrenamiento.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El nombre sugiere una base Qwen 3.6 de 35B, que podría compararse con otros modelos de 30-35B como Llama 3.3 70B (más grande) o Qwen 2.5 32B, pero no hay datos de rendimiento del modelo en cuestión para establecer una comparación objetiva. Tampoco se conoce su licencia ni su disponibilidad de cuantizaciones.

## Limitaciones y advertencias

- El repositorio es un archivo de almacenamiento, no un modelo listo para usar directamente; se debe restaurar el modelo v11 desde el export o los adaptadores siguiendo las instrucciones de `RESTORE.md`.
- No se ha confirmado la licencia del modelo, por lo que su uso comercial no está garantizado sin verificación previa.
- La información técnica (arquitectura, contexto, idiomas) no está disponible públicamente, lo que dificulta evaluar su idoneidad para tareas concretas.
- El modelo es el resultado de un proceso de destilación; su rendimiento puede ser inferior al del modelo maestro en tareas que requieran conocimiento general o razonamiento complejo.
- No se han documentado sesgos ni limitaciones específicas, pero al ser un modelo derivado de un maestro no especificado, puede heredar sesgos de los datos de entrenamiento del maestro.
- El sistema de puntuación de Albedo penaliza severamente a los modelos que copian exactamente el maestro (SHA256 duplicado o similitud de activación ≥ 0.99999), por lo que el uso de este modelo como candidato en la subnet requiere un proceso de entrenamiento fresco, no una simple copia.
- El repositorio fue creado en 2026-08-25 y no tiene descargas ni likes, lo que indica que es un proyecto de nicho sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xbidkslj1/albedo-sn97-workspace
- Modelo v11 publicado por separado: https://huggingface.co/0xbidkslj1/albedo-qwen3.6-35b-v11
- Subnet Albedo en Bittensor: https://bittensor.ai/subnets/97
- Documentación de scoring de Albedo (GitHub): https://github.com/unarbos/albedo/blob/main/docs/SCORING.md
- Investigación sobre Albedo (GitHub): https://github.com/jtdoherty/bittensor-research/blob/main/research/subnet-97-albedo/ALBEDO_SN97_EV_RESEARCH.md
