# mradermacher/CyberBuddy-CloudSec-9B-GGUF

## Resumen

CyberBuddy-CloudSec-9B es un modelo de lenguaje de aproximadamente 8.950 millones de parámetros, afinado mediante LoRA/QLoRA sobre una base de la familia Qwen 3.5 (según los tags del repositorio), orientado específicamente a ciberseguridad en la nube, DevSecOps y SecOps. El modelo original lo desarrolla CyberBuddyAI y esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estáticas para llama.cpp.

El modelo está diseñado para tareas de asistencia en seguridad cloud: análisis de políticas IAM de AWS, razonamiento sobre configuraciones de infraestructura, soporte de function calling y tool use para agentes, y generación de recomendaciones de hardening con guardrails de seguridad. Los tags del repositorio incluyen además "model-organism", "safety-research" y "baseline", lo que sugiere que el modelo puede haberse entrenado con fines de investigación en alineación y seguridad de IA, no solo como asistente operativo.

La relevancia de esta publicación radica en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 3,9 GB hasta f16 de 18 GB), lo que permite desplegarlo tanto en GPUs de consumo como en servidores, con licencia Apache 2.0. No obstante, la información pública disponible es muy limitada: la model card original no está incluida en el repositorio GGUF y no se han publicado benchmarks ni detalles de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen 3.5, según tags; detalles no disponibles) |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es CyberBuddyAI/CyberBuddy-CloudSec-9B, un fine-tuning de un modelo de la familia Qwen 3.5 (los tags incluyen `qwen`, `qwen3.5` y `qwen3_5`). El ajuste se realizó mediante LoRA/QLoRA con PEFT, según los tags del repositorio. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

Los tags sugieren un entrenamiento orientado a seguridad cloud (AWS, IAM), function calling, razonamiento agéntico y guardrails de seguridad, además de un posible uso como "model organism" para investigación en seguridad y alineación. No obstante, al no estar disponible la model card original en este repositorio, no es posible confirmar detalles técnicos como el mecanismo de atención, la tokenización o innovaciones específicas de decodificación.

## Capacidades

- Generación de texto y razonamiento especializado en ciberseguridad y seguridad cloud.
- Análisis y razonamiento sobre políticas IAM de AWS y configuraciones de infraestructura.
- Soporte de function calling y tool use (tags `function-calling`, `tool-use`).
- Capacidades agénticas y de razonamiento multi-paso (tags `agent`, `agentic`, `reasoning`).
- Asistencia en flujos DevSecOps y SecOps.
- Guardrails y mecanismos de seguridad en las respuestas (tags `guardrails`, `ai-safety`, `alignment`).
- Posible uso como baseline en investigación de seguridad y alineación (tags `model-organism`, `safety-research`, `baseline`).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- No se ha confirmado soporte de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Revisión de políticas IAM en AWS: el modelo puede analizar documentos de políticas y señalar permisos excesivos o configuraciones de riesgo, aprovechando su entrenamiento específico en IAM y seguridad cloud.
- Asistente en pipelines DevSecOps: integrado como paso de revisión en CI/CD para evaluar cambios de infraestructura como código (Terraform, CloudFormation) y detectar configuraciones inseguras antes del despliegue.
- Agente de triaje en SecOps: con soporte de tool calling, puede consultar APIs de seguridad, enriquecer alertas y proponer pasos de respuesta multi-paso en un flujo agéntico.
- Generación de runbooks y documentación de seguridad: redacción de procedimientos de respuesta a incidentes y guías de hardening adaptadas al entorno cloud del usuario.
- Formación y concienciación: simulaciones de escenarios de seguridad y explicaciones didácticas sobre conceptos de seguridad cloud para equipos de desarrollo.
- Investigación en alineación y seguridad: uso como baseline o model organism en experimentos sobre comportamiento de modelos en dominios sensibles, dado el etiquetado del repositorio.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (5,5 GB) y Q4_K_M (5,7 GB) permiten ejecutar el modelo en GPUs de consumo para prototipos y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,9 GB
  - Q3_K_S: ~4,4 GB
  - Q3_K_M: ~4,7 GB
  - Q3_K_L: ~5,0 GB
  - Q4_K_S: ~5,5 GB
  - Q4_K_M: ~5,7 GB
  - Q5_K_S: ~6,4 GB
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
- GPU recomendadas: no especificadas por el autor; por tamaño, las cuantizaciones Q4 caben en GPUs de consumo con 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 3070), mientras que Q6/Q8 requieren 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) y f16 requiere 24 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cuantizaciones Q2 a Q5 con GPUs de 6-8 GB; Q6/Q8 en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) al ser formato GGUF; los tags indican compatibilidad con `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CyberBuddy-CloudSec-9B | 8,95 B | no disponible | Apache 2.0 | GGUF (esta versión) | Especializado en seguridad cloud, AWS, IAM |
| Qwen 2.5 7B Instruct | 7,6 B | 128 K (según versión) | Apache 2.0 | safetensors, GGUF | Modelo generalista de referencia; no especializado en seguridad |
| Llama 3.1 8B Instruct | 8,0 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Generalista; licencia con restricciones de uso |
| Mistral 7B Instruct | 7,2 B | 32 K | Apache 2.0 | safetensors, GGUF | Generalista; sin especialización en seguridad |

La comparación se basa en categoría y tamaño, no en rendimiento medido, ya que no hay benchmarks publicados para CyberBuddy-CloudSec-9B. Los datos de los modelos alternativos corresponden a sus especificaciones públicas conocidas.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real en tareas de seguridad es desconocido.
- La model card original no está incluida en el repositorio GGUF, por lo que faltan detalles de entrenamiento, datos y evaluación.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación en recomendaciones de seguridad: las sugerencias sobre políticas IAM o configuraciones cloud deben validarse antes de aplicarse en producción.
- Posible sesgo derivado de los datos de entrenamiento, no documentado.
- Aunque la licencia es Apache 2.0, el uso en producción para decisiones de seguridad críticas requiere validación humana y pruebas propias.
- El etiquetado como "model-organism" y "safety-research" sugiere que puede haberse entrenado con fines de investigación; conviene verificar su comportamiento antes de usarlo como asistente operativo.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la precisión en tareas de razonamiento; el autor recomienda Q4_K_S o Q4_K_M para uso general.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CyberBuddy-CloudSec-9B-GGUF
- Modelo base: https://huggingface.co/CyberBuddyAI/CyberBuddy-CloudSec-9B
- Página de descargas del cuantizador: https://hf.tst.eu/model#CyberBuddy-CloudSec-9B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
