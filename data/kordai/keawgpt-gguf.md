# KordAI/KeawGPT-GGUF

## Resumen

KeawGPT-GGUF es un modelo de lenguaje conversacional desarrollado por KordAI, publicado en formato GGUF para su ejecución local mediante llama.cpp y otras herramientas compatibles. Se trata de un ajuste fino (fine-tune) de un modelo base de la familia Qwen3, como indica la etiqueta `qwen3` presente en su repositorio de HuggingFace. El modelo base correspondiente, KeawGPT-Base, está disponible en la misma organización y se distribuye bajo licencia Apache 2.0, lo que sugiere que el adaptador GGUF hereda dicha licencia, aunque no se especifica explícitamente en la ficha del repositorio GGUF.

El modelo tiene aproximadamente 4 022 millones de parámetros (4B) y se distribuye en cuatro cuantizaciones (Q8_0, Q6_K, Q4_K_M y Q2_K), lo que permite desplegarlo en una amplia gama de hardware, desde GPUs de consumo hasta CPUs con suficiente RAM. El proceso de ajuste y conversión se realizó con la librería Unsloth, conocida por acelerar el entrenamiento y la conversión de modelos. La relevancia de este modelo radica en su formato GGUF, que facilita la integración en aplicaciones locales de chat, asistentes personales o prototipos de agentes sin depender de servicios en la nube. No obstante, la documentación pública es muy escasa: no se proporcionan detalles sobre el dataset de entrenamiento, el método de ajuste, la longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder-only basado en Qwen3) |
| Parametros totales | 4 022 468 096 (aproximadamente 4B) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible (el modelo base KeawGPT-Base indica ingles) |
| Licencia | no disponible en el repositorio GGUF; el modelo base KeawGPT-Base usa Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo. Por la etiqueta `qwen3` y el tamano de 4B, es razonable suponer que se trata de un transformer decoder-only con atencion por ventanas deslizantes y mezcla de expertos opcional, similar a los modelos Qwen3 de esa escala, pero no se puede confirmar sin documentacion oficial. El ajuste fino se realizo con Unsloth, tal como indica la model card, y la conversion a GGUF se hizo con la misma herramienta. No se especifican el volumen ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se mencionan innovaciones tecnicas destacables en el proceso.

## Capacidades

Las capacidades concretas no estan documentadas. Basandose en el modelo base Qwen3 y en la etiqueta `conversational`, se puede esperar que el modelo sea capaz de:

- Generacion de texto conversacional en ingles (idioma del modelo base).
- Razonamiento basico y respuesta a preguntas de conocimiento general, heredado de Qwen3.
- Posible soporte de tool calling y function calling, comun en la familia Qwen3, aunque no confirmado para este adaptador.
- No se ha verificado soporte multimodal, de audio ni de vision.

Dado que no hay benchmarks ni ejemplos de uso publicados, estas capacidades son inferencias razonables y no deben tomarse como garantizadas.

## Casos de uso

Sin documentacion especifica, los casos de uso son potenciales y deben validarse con pruebas propias:

- Chat local privado: al ser un modelo GGUF de 4B, puede ejecutarse en una laptop con 8-16 GB de RAM usando cuantizaciones Q4_K_M o Q6_K, permitiendo conversaciones sin conexion.
- Asistente personal integrado en aplicaciones de escritorio: mediante llama.cpp o herramientas como Ollama, se puede incorporar a un flujo de trabajo local para redactar correos, resumir textos o generar ideas.
- Prototipado de agentes conversacionales: si el modelo hereda el soporte de tool calling de Qwen3, podria usarse en pipelines de agentes simples que consulten APIs o bases de datos locales, aunque requiere validacion.
- Educacion y demostracion: por su tamano reducido, es util para ensenar conceptos de cuantizacion, inferencia local y despliegue de LLMs en entornos academicos.
- Generacion de codigo asistida: Qwen3 tiene buenas capacidades en codigo; este adaptador podria servir para autocompletar o explicar fragmentos en un editor local, siempre que se verifique su comportamiento.
- Investigacion de ajuste fino: al ser un modelo derivado de Qwen3, puede utilizarse como punto de partida para experimentos de fine-tuning adicional con Unsloth o TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador GGUF. Tampoco se comparan con otros modelos. Cualquier afirmacion sobre rendimiento relativo seria especulativa.

## Requisitos de hardware

Los requisitos dependen de la cuantizacion elegida y del tamaño del contexto. Para un modelo de 4B en formato GGUF, las estimaciones aproximadas de VRAM son:

- Q2_K: aproximadamente 2.5-3 GB de VRAM, ejecutable en GPUs con 4 GB (p. ej., GTX 1650, RTX 3050).
- Q4_K_M: aproximadamente 3.5-4 GB de VRAM, adecuado para RTX 3060, RTX 4060 o Apple Silicon con 8 GB unificados.
- Q6_K: aproximadamente 5-6 GB de VRAM, recomendable para RTX 3070, RTX 4070 o M1 Pro/Max.
- Q8_0: aproximadamente 7-8 GB de VRAM, necesaria una GPU con 8-12 GB como RTX 3080, RTX 4080 o A10.

En CPU, el modelo puede ejecutarse con llama.cpp usando cuantizaciones Q4_K_M o Q2_K, requiriendo entre 8 y 16 GB de RAM del sistema. La latencia variara segun el hardware: en una GPU moderna (RTX 4090) se esperan velocidades de 50-100 tokens/s con Q4_K_M; en CPU, 5-15 tokens/s dependiendo del procesador. Para despliegue en produccion, se puede usar vLLM o llama.cpp-server, aunque la falta de informacion sobre el contexto limita las recomendaciones precisas.

## Comparativa con modelos similares

La comparacion se realiza contra el modelo base Qwen3-4B y otros LLMs de tamano similar en formato GGUF. Los datos de Qwen3-4B son publicos y sirven como referencia, pero no se dispone de metricas para KeawGPT-GGUF.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| KeawGPT-GGUF | 4B | no disponible | Apache 2.0 (base) | GGUF | HuggingFace |
| Qwen3-4B (base) | 4B | 32k (tipico) | Apache 2.0 | Safetensors, GGUF | HuggingFace |
| Llama-3.2-3B-Instruct | 3.2B | 128k | Llama 3.2 Community | Safetensors, GGUF | HuggingFace |
| Phi-3.5-mini | 3.8B | 128k | MIT | Safetensors, GGUF | HuggingFace |

KeawGPT-GGUF no ofrece informacion publica sobre contexto ni rendimiento, por lo que no es posible posicionarlo frente a estas alternativas. Qwen3-4B es la referencia mas directa, ya que el adaptador se construye sobre el.

## Limitaciones y advertencias

- Documentacion inexistente: no hay model card detallada, ni dataset de entrenamiento, ni metodologia de ajuste. Esto impide evaluar sesgos, calidad y comportamiento esperado.
- Riesgo de alucinacion: al ser un modelo de 4B sin informacion sobre su entrenamiento, es probable que genere respuestas plausibles pero incorrectas en temas especializados.
- Idioma: el modelo base se anuncia como ingles; no hay garantia de buen rendimiento en español u otros idiomas.
- Licencia: aunque el modelo base usa Apache 2.0, el repositorio GGUF no especifica la licencia. Se debe verificar antes de un uso comercial.
- Contexto desconocido: no se indica la longitud de contexto soportada, lo que puede causar errores si se supera el limite durante la inferencia.
- Sin soporte oficial: no hay canal de soporte ni mantenimiento activo aparente; el proyecto parece experimental.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KordAI/KeawGPT-GGUF
- Modelo base KeawGPT-Base: https://huggingface.co/KordAI/KeawGPT-Base
- Pagina de FriendliAI para KeawGPT-Base: https://friendli.ai/models/KordAI/KeawGPT-Base
- Organizacion KordAI en HuggingFace: https://huggingface.co/KordAI
