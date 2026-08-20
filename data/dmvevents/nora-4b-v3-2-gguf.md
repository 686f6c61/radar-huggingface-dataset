# dmvevents/nora-4b-v3.2-GGUF

## Resumen

Nora 4B v3.2 es un modelo de lenguaje de 4.840 millones de parámetros desarrollado por dmvevents, un proyecto originario de Trinidad y Tobago que se presenta como el primer LLM soberano del Caribe. Esta versión concreta, `nora-4b-v3.2-GGUF`, es la conversión a formato GGUF del modelo base `dmvevents/nora-4b-v3.2`, pensada para su ejecución eficiente en CPU y GPU mediante herramientas como llama.cpp u Ollama. El modelo está disponible bajo licencia Apache-2.0, aunque su acceso en HuggingFace es restringido (gated) y requiere aceptar condiciones previas.

La relevancia de este modelo radica en su origen: es un esfuerzo local por desarrollar IA soberana en una región sin tradición previa en este ámbito, con apoyo gubernamental explícito. Aunque el tamaño de 4B parámetros lo sitúa en la gama de modelos pequeños, su formato GGUF y su licencia permisiva lo hacen atractivo para despliegues en entornos con recursos limitados. Los tags del repositorio sugieren una posible base en Qwen3.5, aunque no se ha confirmado oficialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (posiblemente basada en Qwen3.5 según tags) |
| Parametros totales | 4.841.450.496 (4,84 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene varios archivos GGUF, 12,2 GB en total) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `nora-4b-v3.2`. Los tags del repositorio GGUF incluyen la etiqueta `qwen3.5`, lo que sugiere que podría estar basado en la arquitectura Qwen3.5, pero no hay confirmación oficial en la documentación disponible. El proyecto Nora, en sus versiones anteriores (v2 y merge-v2), se describe como un desarrollo local de Trinidad y Tobago, apoyado por el gobierno del país. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La conversión a GGUF es un proceso estándar de cuantización para inferencia eficiente, pero no aporta información sobre el entrenamiento original.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" en HuggingFace, lo que indica su orientación a diálogo.
- Soporte de endpoints compatibles: el tag `endpoints_compatible` sugiere que puede desplegarse en plataformas de inferencia estándar.
- Capacidades multilingües: no especificadas, aunque al ser un modelo caribeño podría tener cierta competencia en inglés y posiblemente español, pero no hay datos confirmados.
- No se mencionan capacidades de tool calling, agentes, visión, audio ni razonamiento avanzado.

## Casos de uso

- Chatbots de atención al cliente en entornos con recursos limitados: al ser un modelo de 4B en formato GGUF, puede ejecutarse en hardware modesto (CPU o GPU de gama baja) para gestionar conversaciones sencillas de soporte.
- Asistentes virtuales locales para organizaciones sin acceso a APIs comerciales: su licencia Apache-2.0 permite uso comercial sin restricciones, y su tamaño facilita el despliegue on-premise.
- Experimentación educativa en universidades o centros de investigación del Caribe: al ser un modelo local, puede servir como base para enseñar fine-tuning y despliegue de LLMs.
- Generación de contenido en inglés (y posiblemente español) para pequeñas empresas: redacción de correos, resúmenes o borradores, siempre que se acepte la calidad limitada de un modelo de 4B.
- Prototipado rápido de aplicaciones de lenguaje: su formato GGUF permite probar ideas con llama.cpp u Ollama sin necesidad de infraestructura compleja.
- Investigación sobre soberanía digital: el modelo puede usarse como caso de estudio para evaluar la viabilidad de LLMs desarrollados en regiones emergentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4,84B parámetros en GGUF, una cuantización Q4_K_M ocuparía aproximadamente 2,5-3 GB, y Q8 alrededor de 5 GB. Por tanto, cabría en GPUs con 6 GB o más (GTX 1660, RTX 2060, RTX 3060, etc.).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantizaciones bajas; para Q8 se necesitarían 8 GB o más (RTX 3070, RTX 4070, etc.).
- Ejecución en CPU: posible con llama.cpp, aunque la velocidad sería baja (del orden de 5-10 tokens/s en CPUs modernas).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a otro formato), TGI (con adaptaciones).
- Latencia y throughput: no disponibles, dependen de la cuantización y el hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos de tamaño similar (por ejemplo, Qwen2.5-4B, Llama-3.2-3B, Phi-3.5-mini). La falta de benchmarks impide una comparación objetiva. Se puede señalar que, por tamaño, compite en la gama de modelos pequeños, pero sin datos cuantitativos no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos desconocidos: al no haber documentación sobre el dataset de entrenamiento, no se puede evaluar la presencia de sesgos culturales, de género o raciales. Un modelo entrenado principalmente con datos locales podría tener una visión limitada del mundo.
- Riesgo de alucinación: como todo LLM pequeño, es probable que genere información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: no se conoce la longitud de contexto, pero los modelos de 4B suelen tener ventanas de 4K a 8K tokens, lo que limita tareas de documento largo.
- Acceso restringido: el repositorio es gated, lo que obliga a aceptar condiciones en HuggingFace antes de descargar. Esto puede dificultar su adopción en entornos automatizados.
- Soporte limitado: al ser un proyecto pequeño, no hay garantía de mantenimiento, actualizaciones o corrección de bugs.
- Idiomas: no se especifican, pero es probable que el modelo esté optimizado para inglés, con capacidades limitadas en otros idiomas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/dmvevents/nora-4b-v3.2-GGUF
- Modelo base (safetensors): https://huggingface.co/dmvevents/nora-4b-v3.2 (no verificado directamente, inferido del tag)
- Versión anterior v2: https://huggingface.co/dmvevents/nora-4b-v2
- Versión merge-v2: https://huggingface.co/dmvevents/nora-4b-merge-v2
- Página de FriendliAI para nora-4b-merge-v2: https://friendli.ai/models/dmvevents/nora-4b-merge-v2
