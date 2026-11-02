# Pstrade18/bharat-ai-coder-gguf

## Resumen

bharat-ai-coder-gguf es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) publicado por el usuario Pstrade18 en HuggingFace. Se trata de un fine-tuning del modelo base Qwen2.5-1.5B-Instruct, convertido a formato GGUF mediante Unsloth y orientado a tareas de generación de código, a juzgar por su nombre ("coder") y por la familia de modelos de la que deriva. El repositorio tiene un tamaño de 1,0 GB y contiene una única cuantización Q4_K_M.

El modelo está pensado para su despliegue local mediante llama.cpp u Ollama, ya que el autor incluye un Modelfile de Ollama y ejemplos de uso con `llama-cli`. La arquitectura subyacente es la de Qwen2, un transformer decoder-only con atención de tipo causal, aunque el autor no detalla en la model card los cambios específicos aplicados durante el fine-tuning ni la composición del dataset de entrenamiento.

La relevancia de este modelo es limitada dentro del ecosistema: se publicó el 2 de noviembre de 2026, no acumula descargas ni interacciones, no declara licencia y no aporta información sobre idiomas, benchmarks ni metodología de entrenamiento. Es, por tanto, un artefacto de interés principalmente para quien quiera experimentar con un fine-tuning ligero de Qwen2.5-1.5B en local, no para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (única disponible en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo deriva de Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2 con atención causal estándar. El autor indica que el modelo fue afinado y convertido a GGUF usando Unsloth, una librería de fine-tuning eficiente que optimiza el uso de memoria y acelera el entrenamiento (el autor afirma "2x faster" con Unsloth). No se especifica en la model card el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, ni qué hiperparámetros se usaron en el ajuste.

La única innovación técnica documentada es el uso de Unsloth para el fine-tuning y la conversión a GGUF, junto con la inclusión de un Modelfile de Ollama para facilitar el despliegue. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia más allá de las que aporta llama.cpp de forma nativa.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Generación de código, presumiblemente reforzada por el fine-tuning orientado a programación (según el nombre del modelo), aunque no hay documentación que lo confirme.
- Soporte de plantillas de chat mediante el flag `--jinja` en llama.cpp, lo que permite usar el formato de conversación del modelo base.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere que puede servirse a través de infraestructura compatible con la API de HuggingFace.
- Capacidades multilingües: no documentadas explícitamente; se heredarían las del modelo base Qwen2.5, pero no hay confirmación del autor.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente de código en local para desarrolladores: gracias a su tamaño de 1,5B parámetros y su cuantización Q4_K_M (aproximadamente 1 GB), puede ejecutarse en un portátil convencional con llama.cpp u Ollama para autocompletar fragmentos, explicar funciones o generar tests unitarios sin conexión a internet.
- Prototipado rápido de aplicaciones conversacionales: al ser compatible con la API de Ollama y con `llama-cli`, permite montar un chatbot funcional en minutos para validar una idea de producto antes de invertir en un modelo mayor.
- Entornos con recursos limitados o air-gapped: su reducido tamaño permite desplegarlo en dispositivos edge, Raspberry Pi de gama alta o contenedores sin GPU, útil en escenarios donde no se puede enviar código a servicios en la nube por políticas de confidencialidad.
- Educación y experimentación con fine-tuning: sirve como ejemplo práctico de cómo afinar Qwen2.5-1.5B con Unsloth y exportarlo a GGUF, útil para quienes aprenden el flujo completo de ajuste y cuantización.
- Generación de documentación técnica y comentarios de código: puede integrarse en scripts de pre-commit o pipelines de CI para añadir docstrings o resúmenes a funciones nuevas, siempre con revisión humana dado el riesgo de alucinación de un modelo de este tamaño.
- Base para fine-tunings específicos de dominio: al ser un modelo pequeño y con licencia no declarada, puede servir como punto de partida para experimentos internos de ajuste en un dominio concreto (por ejemplo, un lenguaje de programación específico), aunque antes habría que aclarar la licencia con el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con la cuantización Q4_K_M incluida en el repositorio.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). También puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Pstrade18/bharat-ai-coder-gguf --jinja`), Ollama (el repo incluye un Modelfile), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI con este formato.
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| bharat-ai-coder-gguf | 1,54B | No disponible | No disponible | GGUF (Q4_K_M) | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (según model card oficial de Qwen) | Apache 2.0 | Safetensors, GGUF | HuggingFace, ampliamente usado |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | 32.768 tokens (según model card oficial de Qwen) | Apache 2.0 | Safetensors, GGUF | HuggingFace, ampliamente usado |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens (según model card oficial) | Apache 2.0 | Safetensors, GGUF | HuggingFace, ampliamente usado |

La comparación directa más relevante es con Qwen2.5-Coder-1.5B-Instruct, el modelo oficial de Alibaba para código con el mismo tamaño, licencia Apache 2.0 y benchmarks publicados. bharat-ai-coder-gguf no documenta mejoras medibles frente a ese modelo base, por lo que su interés diferencial es limitado salvo que el fine-tuning aporte algo específico que el autor no ha detallado.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial libre; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen2.5 antes de usarlo en producción.
- Sin benchmarks publicados: no hay evidencia de que el fine-tuning mejore al modelo base en ninguna tarea; podría incluso degradarlo.
- Riesgo de alucinación: los modelos de 1,5B parámetros tienen una tasa de alucinación relativamente alta en tareas de razonamiento y código complejo; requiere verificación humana.
- Contexto no documentado: se desconoce si el fine-tuning modificó la ventana de contexto del modelo base (32.768 tokens en Qwen2.5-1.5B-Instruct); conviene asumir el valor del base con cautela.
- Idiomas no documentados: no hay confirmación de que el fine-tuning preserve el multilingüismo del modelo base.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha; no hay issues, discusiones ni validación por terceros.
- Una sola cuantización: solo se ofrece Q4_K_M, lo que limita el ajuste fino entre calidad y memoria para distintos hardware.
- Fecha de creación futura (2026-11-02): conviene verificar la autenticidad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pstrade18/bharat-ai-coder-gguf
- Unsloth (herramienta usada para el fine-tuning y la conversión): https://github.com/unslothai/unsloth
- Modelo base de referencia (Qwen2.5-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Alternativa oficial para código (Qwen2.5-Coder-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
