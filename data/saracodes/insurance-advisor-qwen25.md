# SARACODES/insurance-advisor-qwen25

## Resumen

`SARACODES/insurance-advisor-qwen25` es un ajuste fino (fine-tuning) de la familia Qwen2, publicado por el usuario SARACODES en Hugging Face. El modelo cuenta con 494.032.768 parámetros totales (aproximadamente 0,5 mil millones), lo que lo sitúa en la gama de modelos pequeños dentro de la familia Qwen2, y está orientado a la generación de texto conversacional en el dominio de seguros, a juzgar por su identificador. Está entrenado con la librería Unsloth, según indica la propia model card, y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo es limitada: se trata de un ajuste fino de autor individual, sin métricas de evaluación publicadas, sin documentación sobre el dataset de entrenamiento y sin cifras de rendimiento. Su interés principal reside en ser un ejemplo de especialización de un modelo base pequeño para un nicho concreto (asesoramiento de seguros) mediante técnicas de fine-tuning eficiente en memoria.

La model card es extremadamente escueta: no detalla la arquitectura interna más allá de la etiqueta `qwen2`, no especifica la longitud de contexto, no describe los datos de entrenamiento ni el proceso de alineación, y no incluye resultados de benchmarks. Toda la información disponible procede de los metadatos del repositorio y de la plantilla estándar de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion estándar de transformers) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de un modelo base de la familia Qwen2, una arquitectura transformer decoder-only con atención causal estándar. Con 494 millones de parámetros, corresponde al tamaño más pequeño de la familia Qwen2 (Qwen2-0.5B). La model card no especifica la variante exacta del modelo base original, ya que el campo `base_model` apunta al propio repositorio (`SARACODES/insurance-advisor-qwen25`), lo que impide reconstruir la cadena de ascendencia.

El entrenamiento se realizó con Unsloth, una librería de fine-tuning eficiente que reduce el uso de memoria y acelera el entrenamiento (la model card afirma "2x faster"). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, ni sobre técnicas adicionales como decodificación especulativa o atención lineal. Tampoco se documenta si se aplicó QLoRA, LoRA o un ajuste completo.

## Capacidades

- Generación de texto conversacional en inglés, orientada presumiblemente al dominio de seguros por el nombre del modelo.
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- Compatible con `text-generation-inference` (TGI) y con la librería `transformers`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Asistente conversacional de seguros: el modelo puede mantener diálogos multi-turno sobre productos de seguros, coberturas y primas, aunque su ventana de contexto no está documentada y su tamaño reducido limita la profundidad de razonamiento.
- Clasificación y extracción de información en consultas de seguros: al ser un modelo pequeño, es adecuado para tareas de extracción de entidades (tipo de póliza, cobertura, importe) en textos cortos en inglés.
- Prototipado rápido de chatbots de nicho: su tamaño de 0,5B permite desplegarlo en hardware modesto para validar flujos conversacionales antes de escalar a modelos mayores.
- Generación de respuestas FAQ: puede redactar respuestas a preguntas frecuentes sobre seguros a partir de contexto proporcionado, siempre con revisión humana.
- Filtrado y enrutamiento de consultas: puede clasificar consultas entrantes por temática (reclamaciones, contratación, cancelación) en un pipeline de atención al cliente.
- Experimentación académica con fine-tuning eficiente: sirve como caso de estudio de especialización de modelos pequeños con Unsloth para investigadores que estudian adaptación de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (494M × 2 bytes), más overhead de activaciones y caché KV.
- En cuantización de 8 bits: aproximadamente 0,5 GB; en 4 bits: aproximadamente 0,25 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia con llama.cpp.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SARACODES/insurance-advisor-qwen25 | 494M | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2-0.5B (base) | 494M | 32.768 tokens (según documentación oficial de Qwen2) | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-0.5B | 494M | 32.768 tokens (según documentación oficial de Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente usado |
| TinyLlama-1.1B | 1.1B | 2.048 tokens | Apache 2.0 | Hugging Face |

La comparativa se limita a datos públicos de los modelos base; no hay métricas de rendimiento del ajuste fino de SARACODES que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No hay información sobre sesgos del dataset de entrenamiento; al ser un ajuste fino de dominio, puede heredar sesgos del modelo base Qwen2 y del corpus específico utilizado.
- Riesgo de alucinación elevado en un modelo de 0,5B, especialmente en un dominio regulado como los seguros, donde las respuestas incorrectas pueden tener consecuencias legales.
- Longitud de contexto no documentada; no se debe asumir la ventana de 32K del Qwen2 base sin verificación.
- Solo soporta inglés; no se ha validado su comportamiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre la procedencia de los datos de entrenamiento.
- Sin descargas ni validación por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta), lo que implica ausencia de pruebas independientes.
- El campo `base_model` apunta al propio repositorio, lo que rompe la trazabilidad de la ascendencia del modelo.
- No apto para producción sin evaluación exhaustiva previa y sin supervisión humana en un dominio regulado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SARACODES/insurance-advisor-qwen25
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
