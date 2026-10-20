# mkurman/DiscoveryRSI-27B-GGUF

## Resumen

DiscoveryRSI-27B-GGUF es una distribución en formato GGUF de un modelo de lenguaje de 27.320.697.856 parámetros (27,3 B) publicado por el usuario mkurman en HuggingFace bajo licencia Apache 2.0. El repositorio contiene únicamente pesos cuantizados en GGUF (16,8 GB en total), pensados para inferencia local con herramientas como llama.cpp u Ollama, y lleva las etiquetas `conversational` y `endpoints_compatible`, lo que indica que está orientado a uso conversacional y a desplegarse detrás de una API compatible con los endpoints de HuggingFace.

La model card del autor está prácticamente vacía: solo incluye el bloque de licencia. No se documenta el modelo base, la arquitectura, los datos de entrenamiento, la longitud de contexto, los idiomas soportados ni los resultados de evaluación. Cualquier afirmación sobre capacidades concretas (tool calling, visión, modo de razonamiento, multilingüismo) debe considerarse no verificada hasta que el autor publique información adicional.

Su relevancia actual es limitada pero práctica: un denso de ~27 B cuantizado a Q4 cabe en una GPU de consumo de 24 GB, lo que lo convierte en candidato para despliegues locales de propósito general. Sin embargo, al carecer de documentación y de benchmarks, no es posible recomendarlo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la especifica; el tamaño y el nombre sugieren un transformer denso, sin confirmar) |
| Parametros totales | 27.320.697.856 (dato del repositorio, procedente de safetensors) |
| Parametros activos | No aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF; el tamaño del repo (16,8 GB) es compatible con una cuantización de ~4 bits (Q4_K_M o similar), pero no se detalla la lista de ficheros ni los niveles ofrecidos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se publican safetensors en este repositorio) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo: la model card no describe si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla el mecanismo de atención, la función de activación o el tokenizador. El recuento de parámetros (27,3 B) y el tamaño del repositorio son los únicos datos objetivos disponibles, junto con la etiqueta `conversational`, que sugiere un ajuste orientado a diálogo.

Tampoco se documentan los datos de entrenamiento (número de tokens, composición del corpus, idiomas), ni si hubo fases de ajuste supervisado, RLHF o DPO. El sufijo "RSI" del nombre no viene explicado en la información disponible, por lo que no debe interpretarse como una capacidad concreta (por ejemplo, razonamiento o búsqueda) sin confirmación del autor. No se han encontrado papers, blogs técnicos ni repositorios asociados.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el formato de plantilla de chat esperado en GGUF apuntan a un uso de diálogo multi-turno, aunque la plantilla exacta no está documentada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio está preparado para servirse mediante una API compatible con los endpoints de HuggingFace (por ejemplo, TGI o un servidor GGUF con esa interfaz).
- Inferencia local: al estar en GGUF, es ejecutable con llama.cpp, Ollama y derivados, incluyendo CPU y GPU.
- Razonamiento, matemáticas y código: no disponibles como capacidades verificadas; no hay benchmarks ni ejemplos en la model card.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas ni formato de llamadas.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Multilingüismo: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación interna de modelos conversacionales: servir el GGUF con llama.cpp u Ollama y ejecutar un conjunto propio de preguntas (dominio, idioma, robustez) antes de considerar su uso, dado que no existen benchmarks publicados.
- Despliegue local en estación de trabajo con GPU de 24 GB: una cuantización Q4 de 27 B permite mantener conversaciones multi-turno en local sin depender de la nube, útil para prototipos con datos sensibles.
- Generación de texto asistida en herramientas ofimáticas: integración vía API compatible con endpoints para redacción, resumen y reescritura, con verificación humana obligatoria por el riesgo de alucinación no caracterizado.
- Base para fine-tuning específico de dominio: la licencia Apache 2.0 permite adaptar los pesos a un vertical concreto (legal, sanitario, atención al cliente) y volver a cuantizar para despliegue en hardware modesto.
- Experimentación académica con cuantizaciones: comparar la degradación de calidad de distintos niveles GGUF sobre el mismo modelo base de 27 B, midiendo perplejidad y métricas de tarea.
- Servicio de chat en una intranet con CPU: usando Q4 y RAM suficiente (~32 GB), se puede ofrecer un asistente interno sin GPU, aceptando mayor latencia.
- Filtrado y clasificación de textos por lotes: generación de etiquetas o resúmenes sobre corpus medianos en un pipeline offline, siempre con validación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de 27,32 B de parámetros, sin contar caché KV):
  - FP16/BF16: ~54,6 GB.
  - Q8_0: ~29 GB.
  - Q5_K_M: ~19-20 GB.
  - Q4_K_M: ~16-17 GB (coherente con los 16,8 GB del repositorio).
  - Q3_K_M: ~13-14 GB.
  - Q2_K: ~10 GB.
- GPU recomendadas: A100 80 GB u H100 para FP16; A100 40 GB o RTX 6000 Ada 48 GB para Q8; RTX 4090, RTX 3090, RTX 5090 o RX 7900 XTX (24 GB) para Q4 con contexto moderado.
- ¿Cabe en GPU de consumo? Sí, en Q4 cabe en 24 GB (4090/3090/5090/7900 XTX); en Q3 podría intentarse en 16 GB, con riesgo de desbordamiento a RAM según la longitud de contexto. La longitud de contexto es desconocida, así que el tamaño de la caché KV no se puede dimensionar.
- RAM para ejecución en CPU: ~20-24 GB para Q4 (32 GB de sistema recomendables).
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, y cualquier runtime que consuma GGUF (koboldcpp, LM Studio). vLLM y TGI no consumen GGUF de forma nativa en su configuración estándar, por lo que requerirían una versión safetensors no publicada en este repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato en HF | Observaciones |
|---|---|---|---|---|---|
| DiscoveryRSI-27B-GGUF | 27,3 B | No disponible | Apache 2.0 | GGUF | Sin model card, sin benchmarks ni idiomas declarados |
| Mistral Small 3 (24B) | 24 B | 32k segun su model card | Apache 2.0 | Safetensors y GGUF de terceros | Documentacion completa y benchmarks publicados |
| Qwen2.5-32B | 32,8 B | 32k nativo (131k con YaRN) | Apache 2.0 | Safetensors y GGUF de terceros | Multilingue declarado, benchmarks publicados |
| Gemma 3 27B | 27 B | 128k segun su model card | Gemma license (no Apache 2.0) | Safetensors y GGUF de terceros | Multimodal y con contexto largo; licencia con restricciones de uso |

Los datos de los modelos comparados provienen de sus respectivas model cards; conviene verificarlos antes de tomar decisiones. La ventaja diferencial de DiscoveryRSI-27B frente a ellos sería únicamente la licencia Apache 2.0 combinada con un empaquetado GGUF ya listo, ya que no aporta documentación ni métricas.

## Limitaciones y advertencias

- Ausencia total de documentación: no se conoce el modelo base, el tokenizador, la plantilla de chat ni la longitud de contexto, lo que complica la integración correcta y puede provocar respuestas degradadas si se usa una plantilla inadecuada.
- Sin benchmarks: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni en tareas multilingües; cualquier comparación con otros modelos de 27 B es especulativa.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano; requiere prueba empírica.
- Riesgo de alucinación: inherente a los modelos de lenguaje y, en este caso, no caracterizado por el autor.
- Sesgos desconocidos: al no documentarse la composición de los datos de entrenamiento, no es posible evaluar sesgos de género, etnia, idioma o dominio.
- Trazabilidad del autor: el repositorio procede de un usuario individual, sin organización detrás, con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni de corrección de errores.
- Licencia: Apache 2.0 permite uso comercial y derivados, pero el autor no ofrece garantías ni cláusulas de responsabilidad; conviene conservar el aviso de licencia y verificar que los pesos no arrastren restricciones del modelo base original.
- Producción: no recomendable sin una evaluación propia de calidad, latencia y seguridad, y sin fijar la versión exacta del fichero GGUF utilizado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mkurman/DiscoveryRSI-27B-GGUF
- No se han encontrado papers, blogs técnicos, repositorios de código ni demos asociados en la información disponible.
