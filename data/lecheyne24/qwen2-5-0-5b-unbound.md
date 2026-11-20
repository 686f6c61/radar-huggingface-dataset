# lecheyne24/qwen2.5-0.5b-unbound

## Resumen

qwen2.5-0.5b-unbound es una variante "abliterated" (sin censura) del modelo Qwen2.5-0.5B-Instruct de Alibaba, publicada por el usuario lecheyne24 bajo el pipeline interno "ModelStack uncensoring". El objetivo declarado es eliminar los mecanismos de rechazo y las advertencias estándar del modelo base para obtener respuestas directas, sin disclaimers ni fórmulas del tipo "como IA no puedo". Se trata, por tanto, de un modelo orientado a experimentación y a casos de uso donde el modelo original resulta demasiado restrictivo.

Técnicamente es un transformer decoder-only denso de 494.032.768 parámetros (aproximadamente 0,5 mil millones), derivado del Qwen2.5-0.5B-Instruct, que a su vez emplea la arquitectura Qwen2 con atención de múltiples cabezas, RoPE y ventana de contexto de 32.768 tokens en su versión Instruct original. El modelo se distribuye tanto en safetensors para transformers como en cuantización GGUF Q4_K_M para llama.cpp y Ollama, lo que lo hace ejecutable en hardware muy modesto.

Su relevancia es limitada pero concreta: por su tamaño reducido y su licencia Apache 2.0, sirve como banco de pruebas para pipelines de "uncensoring" y para evaluar cómo afecta la abliteración a un modelo pequeño, además de permitir despliegues en CPU o GPUs de gama baja. No obstante, el autor no publica datos de entrenamiento, benchmarks ni detalles completos del proceso de abliteración, y el modelo no registra descargas ni interacciones en Hugging Face en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M incluido en el repo; safetensors en precision original |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, que es multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es una modificación por pesos de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atención multi-cabeza estándar, normalización RMSNorm y embeddings rotatorios (RoPE). No se trata de un MoE ni de una arquitectura híbrida. El proceso de "abliteración" descrito en la model card consiste en una proyección de la dirección de rechazo sobre las salidas de atención y sobre las proyecciones down del MLP, con un factor de escala de 1.25. Es decir, se identifican direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y se eliminan o atenúan mediante edición de pesos, sin reentrenamiento adicional.

No se especifica en la información disponible el volumen de tokens, la composición del dataset ni si hubo fases de RLHF o DPO posteriores a la abliteración. El modelo base Qwen2.5-0.5B-Instruct fue entrenado por Alibaba con datos multilingües y ajuste por instrucciones, pero esos detalles no se reproducen aquí. La innovación técnica destacable es únicamente el pipeline de abliteración, que el autor reporta como superado en 7 de 8 pruebas de su "Unbound gauntlet", un conjunto de evaluación propio no documentado públicamente.

## Capacidades

- Generación de texto conversacional en múltiples turnos, heredada del modelo base.
- Respuestas directas sin disclaimers ni fórmulas de rechazo, según el autor ("verdict over survey").
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 0,5B parámetros.
- Capacidad multilingüe heredada de Qwen2.5, aunque la model card no detalla los idiomas soportados.
- Soporte de tool calling y function calling: no confirmado en la información disponible; el modelo base lo soporta parcialmente, pero la abliteración puede degradarlo.
- Soporte de agentes y razonamiento multi-paso: el autor menciona el uso con un "UNBOUND system preamble" para agentes, pero sin detalles técnicos.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con pipelines de uncensoring: el modelo sirve como caso de estudio para medir el efecto de la proyección de la dirección de rechazo en un transformer pequeño, comparando respuestas antes y después de la abliteración.
- Despliegue en entornos con recursos mínimos: con 494M parámetros y una cuantización Q4_K_M de aproximadamente 300-400 MB, puede ejecutarse en CPU o en GPUs integradas para tareas de generación de texto de baja latencia.
- Prototipado de agentes conversacionales: el autor propone usarlo con un preámbulo de sistema específico para agentes; es adecuado para pruebas rápidas de flujos multi-turno donde el coste computacional debe ser mínimo.
- Generación de texto creativo sin restricciones temáticas: útil en investigación sobre sesgos y alineación, donde se necesita un modelo que no filtre contenido para estudiar sus salidas.
- Evaluación de robustez y seguridad: sirve como modelo "negativo" en pruebas de red teaming para comparar la eficacia de filtros externos frente a un modelo sin alineación.
- Docencia y demostraciones: por su tamaño reducido y su licencia Apache 2.0, es adecuado para talleres sobre abliteración, cuantización GGUF y despliegue con llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta un resultado interno de 7/8 en su "Unbound gauntlet", un conjunto de evaluación propio sin documentación pública, por lo que no es comparable con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16): aproximadamente 1 GB para los pesos, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización Q4_K_M: aproximadamente 300-400 MB para los pesos, más caché KV.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16 (GTX 1650, RTX 3050, T4); para Q4_K_M basta con 1 GB o incluso CPU.
- Cabe en GPUs de consumo: sí, en todas las GPU consumer modernas e incluso en iGPU y Raspberry Pi con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-server con el GGUF incluido), Ollama, transformers con safetensors, y potencialmente vLLM o TGI aunque no se documenta su compatibilidad.
- Latencia y throughput: no disponibles; por el tamaño, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| qwen2.5-0.5b-unbound | 494M | no disponible (base: 32.768) | Apache 2.0 | Variante abliterated, sin benchmarks públicos |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Modelo base alineado, con benchmarks publicados por Alibaba |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540M | 32.768 | Apache 2.0 | Alternativa de mayor tamaño y capacidad, misma familia |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8.192 | Apache 2.0 | Alternativa pequeña alineada, con benchmarks públicos |

La comparación directa con el modelo base es la más relevante: comparten arquitectura y tamaño, pero el unbound elimina la alineación, lo que puede degradar el rendimiento en tareas que requieren seguir instrucciones de seguridad o formato. No hay datos que permitan cuantificar esa degradación.

## Limitaciones y advertencias

- Alucinación: al ser un modelo de 0,5B parámetros, la tasa de alucinación es alta incluso en el modelo base; la abliteración no la reduce y puede aumentarla al eliminar respuestas de cautela.
- Sesgos: no se documenta ningún análisis de sesgos; el modelo base Qwen2.5 ya presenta sesgos conocidos, y la eliminación de la dirección de rechazo puede amplificar respuestas sesgadas o tóxicas.
- Contenido dañino: al estar "uncensored", puede generar contenido que el modelo base rechazaría; no debe desplegarse en producción orientada a usuarios sin filtros externos.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en aplicaciones sensibles.
- Idiomas: no se especifican los idiomas soportados; el modelo base es multilingüe, pero la abliteración puede afectar de forma desigual a distintos idiomas.
- Contexto: no se confirma en la model card que se mantenga la ventana de 32.768 tokens del modelo base; conviene verificarlo empíricamente.
- Tool calling y agentes: el autor menciona uso agéntico, pero no hay evidencia de que el function calling se conserve tras la abliteración.
- Madurez: el repositorio tiene 0 descargas y 0 likes, sin issues ni discusión pública; es un artefacto experimental sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/lecheyne24/qwen2.5-0.5b-unbound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
