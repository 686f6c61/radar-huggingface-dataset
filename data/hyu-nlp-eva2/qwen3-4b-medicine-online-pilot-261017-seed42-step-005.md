# HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-005

## Resumen

`HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-005` es un ajuste fino del modelo Qwen3-4B-Instruct-2507 publicado por el usuario HYU-NLP-EVA2. Se trata de un artefacto de investigación: la propia model card lo identifica como parte de la ejecución `261017_medicine_online_pilot_seed42`, en la que este repositorio corresponde al checkpoint del paso 5 de entrenamiento con semilla 42. El nombre sugiere un piloto de ajuste con rúbricas («rubrics») sobre datos de temática médica, pero la tarjeta no documenta la composición del dataset, el objetivo de entrenamiento ni los hiperparámetros.

El repositorio contiene dos cosas: en la raíz, un export en BF16 listo para `transformers`; en `original_checkpoint/`, los ficheros nativos de veRL/FSDP junto con sus metadatos, lo que confirma que el ajuste se hizo con el framework veRL (RL para modelos de lenguaje) sobre FSDP. El tamaño del repo (25,7 GB) es muy superior a los ~8 GB que ocupan los pesos en BF16, diferencia coherente con la presencia de shards de entrenamiento y estados del optimizador.

Es relevante ahora solo como material de reproducción y evaluación: es un checkpoint intermedio (paso 5) de un piloto, sin descargas ni validación de la comunidad, y sin resultados de benchmarks publicados. La arquitectura y el tamaño (4.022.468.096 parámetros) provienen del modelo base, no de un preentrenamiento propio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, heredada de Qwen/Qwen3-4B-Instruct-2507 (sin mezcla de expertos) |
| Parámetros totales | 4.022.468.096 (≈4,02 B), confirmado en safetensors |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens |
| Tipos de cuantización | no disponible; el export publicado está en BF16. No se han publicado GGUF/GPTQ/AWQ para este fine-tune |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export BF16 en la raíz) + checkpoint nativo veRL/FSDP con metadatos en `original_checkpoint/` |
| Tamaño del repositorio | 25,7 GB |
| Librería / pipeline | transformers / text-generation |
| Etiquetas destacadas | conversational, text-generation-inference, endpoints_compatible |
| Checkpoint | paso 5 de la ejecución `261017_medicine_online_pilot_seed42`, semilla 42 |
| Fecha de publicación | 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card y se hereda íntegramente del modelo base Qwen3-4B-Instruct-2507: un transformer denso decoder-only de 4,02 B de parámetros, variante «Instruct» de la familia Qwen3-2507 (sin modo thinking). No hay cambios estructurales documentados; el ajuste es de pesos.

Lo que sí documenta la tarjeta es el proceso: el checkpoint se generó con veRL sobre FSDP, en una ejecución denominada «medicine online-rubrics pilot» con semilla 42, y se publica el paso 5. No se especifican tokens de entrenamiento, composición del dataset, si hubo RLHF/DPO/GRPO, recompensas basadas en rúbricas ni hiperparámetros. El autor indica que el checkpoint local se elimina solo tras verificar tamaños y hashes SHA256 de todos los ficheros remotos, lo que aporta garantía de integridad de la copia, no de calidad del modelo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento y respuesta a instrucciones en el estilo de Qwen3-4B-Instruct-2507 (sin modo thinking explícito).
- Generación de código y matemáticas a nivel del modelo base (no se han publicado evaluaciones de este checkpoint).
- Soporte de tool calling / function calling heredado del modelo base; no verificado tras el ajuste.
- Capacidad potencial en dominio médico/biomédico como consecuencia del piloto de ajuste, sin evidencia cuantitativa publicada.
- Multilingüismo: no declarado en la model card; el modelo base es multilingüe, pero no hay confirmación para este checkpoint.
- Sin visión ni audio: pipeline `text-generation` y arquitectura de texto.
- Integración con Text Generation Inference y endpoints compatibles (etiquetas del repo).

## Casos de uso

- Reproducción de experimentos de RL con rúbricas: el repo incluye el checkpoint nativo veRL/FSDP y metadatos, lo que permite reanudar o auditar la ejecución `261017_medicine_online_pilot_seed42` con la misma semilla.
- Estudio de dinámica de entrenamiento: al ser el paso 5, sirve para comparar la evolución temprana del ajuste frente a checkpoints posteriores o frente al modelo base.
- Evaluación de deriva respecto al base: medir con un arnés propio (MMLU, GSM8K, HumanEval) cuánto se degrada o mejora Qwen3-4B-Instruct-2507 tras el ajuste en el dominio médico.
- Generación de datos sintéticos de temática sanitaria para experimentos internos, con revisión humana obligatoria y sin uso clínico.
- Prototipado de asistentes de preguntas y respuestas sobre literatura médica en entornos de laboratorio, aprovechando la ventana de contexto del modelo base para introducir documentos largos.
- Base para posteriores ajustes supervisados o RL en el mismo pipeline veRL, reutilizando el formato de checkpoint publicado.
- Pruebas de despliegue a pequeña escala: 4 B en BF16 cabe en una GPU de consumo de 16 GB o más, lo que facilita banqueos de inferencia con vLLM o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en BF16: 4,022 B × 2 bytes ≈ 8,04 GB. Con overhead de runtime y caché KV para contextos moderados, estimación de 10-12 GB de VRAM.
- Contextos largos: la caché KV crece linealmente; con la ventana heredada de 262.144 tokens del modelo base, la VRAM necesaria puede superar con holgura la de cualquier GPU de consumo, por lo que conviene limitar `max_model_len` o usar atención con paginación (vLLM/SGLang).
- Cuantización a INT8/FP8: ~4-4,5 GB de pesos. INT4: ~2,2-2,5 GB, aunque no hay cuantizaciones publicadas para este checkpoint y habría que generarlas.
- GPU recomendadas: A100 40/80 GB o H100 para servicio con contexto largo y concurrencia; L40S o A10G para despliegues moderados; RTX 4090/3090 (24 GB) para BF16 sin problemas; RTX 4080 (16 GB) y 4070 Ti (12 GB) para BF16 con contexto recortado o FP8.
- Cabe en GPU de consumo: sí, en BF16 desde 16 GB y en INT4 desde ~6-8 GB (previa cuantización propia).
- Opciones de despliegue: `transformers` (ruta directa), vLLM, SGLang, Text Generation Inference (etiqueta `text-generation-inference`), Inference Endpoints (`endpoints_compatible`). llama.cpp/Ollama solo si se convierte a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles. El repositorio de 25,7 GB incluye el checkpoint de entrenamiento, así que la descarga inicial para servir el modelo supera ampliamente los ~8 GB de pesos BF16.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus fichas públicas y no se han verificado contra la información de esta búsqueda; los de este checkpoint, salvo parámetros y licencia, figuran como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| qwen3-4b-medicine-online-pilot-261017-seed42-step-005 | 4,02 B | no disponible (base: 262.144) | Apache 2.0 | Checkpoint de investigación, paso 5, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | 262.144 tokens | Apache 2.0 | Modelo oficial, ampliamente evaluado |
| Qwen/Qwen3-8B-Instruct-2507 | ~8 B | 262.144 tokens | Apache 2.0 | Modelo oficial, mayor coste de inferencia |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Modelo oficial, licencia con restricciones |
| Gemma-3-4B-IT | ~4 B | 128.000 tokens | Licencia Gemma | Modelo oficial, licencia con restricciones de uso |

Frente al modelo base, este checkpoint no aporta ventajas verificables: misma arquitectura y mismo tamaño, sin métricas publicadas y en un paso muy temprano de ajuste.

## Limitaciones y advertencias

- Es el paso 5 de un piloto: la calidad esperada del ajuste es baja y no está documentada; no debe tratarse como modelo final.
- Cero descargas y cero «likes»: no existe validación independiente de su comportamiento.
- Sin benchmarks ni evaluación cualitativa publicada; imposible estimar la degradación frente a Qwen3-4B-Instruct-2507.
- Dominio médico: riesgo alto de alucinación en dosis, diagnósticos, interacciones farmacológicas y referencias bibliográficas. No apto para uso clínico, diagnóstico ni consejo sanitario.
- Composición del dataset de ajuste desconocida: no se puede evaluar el sesgo introducido ni la presencia de datos personales o con derechos.
- Un solo checkpoint y una sola semilla (42): no hay evidencia de robustez ni de reproducibilidad estadística.
- Idiomas no declarados: el comportamiento multilingüe tras el ajuste es una incógnita, incluso si el base es multilingüe.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, pero no exime de responsabilidad sobre el contenido generado ni sustituye los requisitos regulatorios sanitarios (MDR, FDA) si se integra en un producto médico.
- Tamaño del repo (25,7 GB): el `original_checkpoint/` incluye estados de entrenamiento; descargarlo completo es innecesario para inferencia y conviene filtrar ficheros.
- No se ha verificado que el export BF16 reproduzca exactamente el checkpoint nativo; el autor solo certifica integridad de hashes, no equivalencia funcional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-005
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Framework de entrenamiento citado en la model card (veRL): https://github.com/volcengine/verl
- La búsqueda web realizada no devolvió resultados relevantes para este modelo: los resultados obtenidos correspondían a entidades homónimas sin relación (Hyundai France, canales de YouTube, ONE Championship, catálogos Hyper U).
