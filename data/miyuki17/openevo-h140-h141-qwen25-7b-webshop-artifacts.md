# miyuki17/openevo-h140-h141-qwen25-7b-webshop-artifacts

## Resumen

Este repositorio no contiene un modelo de lenguaje independiente, sino un **archivo histórico de artefactos científicos**: 24 adaptadores SD-LoRA/PEFT (48 archivos safetensors) derivados de los experimentos OpenEvo H1.40 y H1.41, todos ellos construidos sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. El autor, miyuki17, publica estos adaptadores con fines de reproducibilidad y auditoría byte a byte, no como un modelo listo para uso en producción.

El proyecto OpenEvo parece investigar mecanismos de actualización y transferencia de conocimiento en modelos de lenguaje mediante adaptadores de bajo rango (LoRA) aplicados a tareas de compra en línea (WebShop). Sin embargo, el propio autor advierte que H1.41 fue un *magnitude screen* (prueba de magnitud del mecanismo actualizador) y que su reconciliación formal quedó marcada como `MEASUREMENT_INVALID`, por lo que estos pesos **no deben interpretarse como un resultado de eficacia exitoso**. El repositorio es, en esencia, un registro verificable de estados intermedios de entrenamiento, con manifiestos SHA256 y metadatos de procedencia.

Para cualquier uso práctico, es necesario obtener por separado los pesos del modelo base Qwen2.5-7B-Instruct (licencia Apache-2.0) y cargar los adaptadores mediante la librería PEFT. No se redistribuyen los pesos base, ni los datasets, ni el código fuente de OpenEvo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores SD-LoRA/PEFT sobre Qwen2.5-7B-Instruct (Transformer decoder) |
| Parametros totales | No disponible (el adaptador añade un número reducido de parámetros; el modelo base tiene 7.6B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No aplicable (los adaptadores se publican en safetensors de precisión completa; el modelo base admite cuantización) |
| Idiomas soportados | Inglés (según metadatos del repositorio; el modelo base soporta múltiples idiomas) |
| Licencia | `other` (archivo mixto de artefactos científicos; el modelo base es Apache-2.0) |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente **adaptadores de tipo SD-LoRA** (una variante de LoRA con posible descomposición en sub-espacios) entrenados sobre el modelo base Qwen2.5-7B-Instruct. No se incluyen los pesos del modelo base, ni los datos de entrenamiento, ni el código fuente de OpenEvo. Según la model card, los adaptadores provienen de dos fases experimentales:

- **H1.40**: 8 estados secuenciales de entrenamiento de adaptadores G2 (generación 2) procedentes de la ejecución `phase-h140-g2-r2-20260820` y del sub-entrenamiento `formal-g2-training-retry12`. Se registró que el entrenamiento pasó estructuralmente, pero no se evaluaron adquisición, retención, preservación, T2 ni generaciones múltiples.
- **H1.41**: 16 estados adicionales (8 `C0_exact_h140` y 8 `C1_reset_magnitude`) de un *magnitude screen* del mecanismo actualizador. La reconciliación formal marcó estos resultados como `MEASUREMENT_INVALID`, por lo que no constituyen evidencia de eficacia.

Cada directorio de adaptador contiene `adapter_config.json`, `adapter_model.safetensors`, `openevo_sd_lora_state.json` y `openevo_sd_lora_state.safetensors`. El manifiesto de publicación (`provenance/publication-manifest.json`) registra rutas, tamaños, SHA256 y comprobaciones estructurales de cada archivo.

## Capacidades

- **No es un modelo autónomo**: los adaptadores requieren cargarse sobre Qwen2.5-7B-Instruct mediante PEFT.
- **Capacidades del modelo base**: el modelo base Qwen2.5-7B-Instruct ofrece generación de texto, razonamiento, código, matemáticas, tool calling y soporte multilingüe (aunque el repositorio declara solo inglés).
- **Capacidades específicas de los adaptadores**: no documentadas. El propósito experimental parece relacionado con tareas de compra en línea (WebShop), pero no hay evidencia de rendimiento funcional.
- **Reproducibilidad**: los adaptadores permiten reproducir exactamente los estados intermedios de los experimentos H1.40 y H1.41, gracias a los manifiestos SHA256.

## Casos de uso

- **Auditoría científica y reproducibilidad**: investigadores pueden verificar los hashes SHA256 de cada adaptador y reproducir los estados exactos de los experimentos OpenEvo, lo que permite auditar la metodología y los resultados.
- **Estudio de mecanismos de actualización en modelos de lenguaje**: los adaptadores de H1.41 (C0 y C1) permiten analizar cómo varía la magnitud de las actualizaciones de pesos en un escenario controlado, aunque los resultados sean inválidos como prueba de eficacia.
- **Investigación sobre adaptadores LoRA en tareas de compra en línea**: los estados de H1.40 pueden servir como punto de partida para estudiar el comportamiento de adaptadores en el entorno WebShop, siempre que se respete la advertencia de que no hay evaluación de eficacia.
- **Desarrollo de pipelines de verificación de integridad**: el esquema de publicación con manifiestos y verificación posterior puede servir como modelo para otros repositorios de artefactos de entrenamiento.
- **Comparación de estrategias de entrenamiento de adaptadores**: los 24 estados permiten comparar diferentes configuraciones (secuencial vs. reset de magnitud) en términos de estructura de pesos, aunque no de rendimiento.
- **Formación en uso de PEFT**: el repositorio es un ejemplo práctico de cómo cargar adaptadores LoRA sobre un modelo base, útil para fines educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que H1.40 no evaluó adquisición, retención, preservación, T2 ni generaciones múltiples, y que H1.41 fue un *magnitude screen* con reconciliación `MEASUREMENT_INVALID`. Por tanto, no existen métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) asociadas a estos adaptadores.

## Requisitos de hardware

- **Modelo base**: Qwen2.5-7B-Instruct requiere aproximadamente 15 GB de VRAM en FP16 para inferencia. Con cuantización (por ejemplo, 4-bit) puede ejecutarse en GPUs con 8 GB de VRAM.
- **Adaptadores**: los adaptadores PEFT añaden una sobrecarga mínima de memoria (del orden de cientos de MB), por lo que los requisitos de hardware son esencialmente los del modelo base.
- **GPUs recomendadas**: para inferencia con el modelo base en FP16, una GPU con al menos 16 GB de VRAM (RTX 4090, A100 40GB, etc.). Para cuantización 4-bit, una RTX 3080/3090 o similar con 10-12 GB puede ser suficiente.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI, o cualquier framework que soporte PEFT (transformers + peft).
- **Latencia y throughput**: no disponibles para este repositorio específico; dependerán del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de modelos comparables en el mismo repositorio o en la misma línea de investigación (OpenEvo). Los adaptadores son específicos de un experimento concreto y no existe una familia de modelos públicos equivalente. Como referencia, el modelo base Qwen2.5-7B-Instruct se puede comparar con otros modelos de 7B como Llama 3.1 8B o Mistral 7B, pero los adaptadores aquí publicados no alteran esa comparativa de forma significativa.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct (base) | 7.6B | 32 768 | Apache-2.0 | Modelo base sobre el que se aplican los adaptadores |
| Llama 3.1 8B Instruct | 8B | 128 000 | Llama 3.1 Community License | Alternativa de tamaño similar |
| Mistral 7B Instruct | 7.3B | 32 768 | Apache-2.0 | Alternativa de tamaño similar |

## Limitaciones y advertencias

- **No es un modelo funcional**: este repositorio no contiene un modelo completo ni un adaptador listo para uso en producción. Es un archivo de artefactos experimentales.
- **Resultados inválidos**: los adaptadores de H1.41 tienen reconciliación `MEASUREMENT_INVALID`; no deben interpretarse como evidencia de eficacia del mecanismo OpenEvo.
- **Falta de evaluación**: H1.40 no evaluó las métricas clave de adquisición, retención, preservación, T2 ni generaciones múltiples.
- **Licencia ambigua**: el repositorio usa `license: other` porque es un archivo mixto; no se infiere licencia para el código fuente de OpenEvo (que no se redistribuye). El modelo base es Apache-2.0, pero los adaptadores pueden tener restricciones adicionales no especificadas.
- **Idioma limitado**: los metadatos declaran solo inglés, aunque el modelo base soporta más idiomas.
- **Riesgo de alucinación y sesgos**: al ser un adaptador sobre Qwen2.5-7B-Instruct, hereda los sesgos y limitaciones del modelo base, pero no hay información específica sobre los adaptadores.
- **Dependencia de la integridad**: el uso correcto requiere verificar los SHA256 y cargar los adaptadores sobre el modelo base exacto (identidad de contenido `0c32faf81d8f2f83cf79860d2a48111f166348d6dd38cd348576d8b3a0141c1e`).

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/miyuki17/openevo-h140-h141-qwen25-7b-webshop-artifacts)
- [Repositorio relacionado: openevo-qwen25-7b-webshop-sd-lora](https://huggingface.co/miyuki17/openevo-qwen25-7b-webshop-sd-lora)
- [Repositorio relacionado: openevo-adapter-archive](https://huggingface.co/miyuki17/openevo-adapter-archive)
- [Modelo base Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
