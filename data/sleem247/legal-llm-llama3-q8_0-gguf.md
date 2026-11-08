# Sleem247/legal-llm-llama3-Q8_0-GGUF

## Resumen

`Sleem247/legal-llm-llama3-Q8_0-GGUF` es una conversión a formato GGUF de un adaptador LoRA orientado a dominio legal, derivado del repositorio `sourav111/legal-llm-llama3`. No se trata de un modelo completo con pesos propios, sino de un adaptador LoRA cuantizado a Q8_0 que debe aplicarse sobre un modelo base Llama 3 (no incluido en este repositorio). La conversión se ha realizado mediante el espacio oficial `gguf-my-lora` de ggml.ai, lo que garantiza compatibilidad con `llama.cpp`.

El interés práctico del artefacto reside en su formato: permite cargar un ajuste fino de dominio jurídico sobre una base Llama 3 usando `llama-cli` o `llama-server` con el flag `--lora`, sin necesidad de fusionar pesos ni reentrenar. Esto simplifica el despliegue de un asistente legal sobre infraestructura de inferencia estándar en CPU o GPU.

La información publicada es muy limitada: no hay model card propia más allá de las instrucciones de uso, no se declara licencia, idiomas soportados ni pipeline, y el repositorio no incluye los pesos del modelo base. El número de parámetros reportado en los metadatos (3.407.872) corresponde al adaptador LoRA, no al modelo completo, por lo que no debe interpretarse como el tamaño del modelo efectivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base Llama 3; arquitectura del base no disponible en la informacion proporcionada |
| Parametros totales | 3.407.872 (corresponde al adaptador LoRA, no al modelo completo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base Llama 3 utilizado) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA en formato GGUF para llama.cpp) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) convertido a GGUF mediante el espacio `gguf-my-lora` de ggml.ai. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango entrenables en determinadas capas, lo que reduce drásticamente el coste de ajuste fino. El adaptador se aplica en tiempo de inferencia sobre un modelo base Llama 3 mediante el flag `--lora` de `llama.cpp`.

No se dispone de información sobre el dataset de entrenamiento del adaptador original (`sourav111/legal-llm-llama3`), el número de tokens utilizados, la composición del corpus jurídico, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se detalla el rango LoRA, el alpha, las capas objetivo ni la precisión de entrenamiento. La cuantización Q8_0 aplicada al adaptador es de 8 bits por peso, lo que preserva prácticamente la calidad del adaptador original a cambio de un tamaño mayor que cuantizaciones más agresivas como Q4_K_M.

## Capacidades

- Ajuste fino orientado a dominio legal (por el nombre y la base declarada del adaptador); el alcance exacto no está documentado.
- Generación de texto en el idioma del corpus de entrenamiento, que no se especifica.
- Aplicable como capa adicional sobre cualquier modelo base Llama 3 compatible con `llama.cpp`.
- Compatibilidad con `llama-cli` y `llama-server` para inferencia local y servicio HTTP.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia en consultas legales de primer nivel: el adaptador puede aplicarse sobre Llama 3 para responder preguntas sobre terminología y conceptos jurídicos, siempre con revisión humana dada la ausencia de benchmarks y de documentación sobre el corpus.
- Prototipado rápido de un chatbot legal local: al ser un LoRA en GGUF, se puede desplegar con `llama-server` en una máquina de desarrollo sin necesidad de GPUs de datacenter, útil para validar producto antes de invertir en infraestructura.
- Clasificación y resumen de documentos jurídicos: el ajuste de dominio puede mejorar la coherencia terminológica en tareas de extracción y síntesis, aunque requiere evaluación propia porque no hay métricas publicadas.
- Investigación sobre adaptación de dominio con LoRA: sirve como ejemplo reproducible de conversión LoRA a GGUF y de aplicación sobre un base Llama 3, útil para estudiar el impacto del rango y la cuantización en tareas especializadas.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con `llama.cpp`, permite procesar textos legales sensibles sin enviarlos a APIs externas, siempre que se cumplan las obligaciones de la licencia del base (no disponible aquí).
- Generación de borradores de cláusulas y plantillas: con supervisión de un profesional, el adaptador puede proponer texto base que luego se revise, aprovechando el ajuste al registro jurídico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en Q8_0 ocupa del orden de decenas de megabytes (3,4 M de parámetros a 8 bits); el requisito real de VRAM/RAM lo determina el modelo base Llama 3 sobre el que se aplique.
- Para un base Llama 3 8B en Q4_K_M se necesitan aproximadamente 5-6 GB de RAM/VRAM; en Q8_0 del base, unos 9-10 GB; en FP16, unos 16 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para 8B en cuantizaciones altas; RTX 4090, A100 o H100 para mayor throughput o bases de mayor tamaño.
- Cabe en GPUs de consumo (RTX 3060/4060 Ti 16 GB, RTX 4070/4080/4090) si se usa un base 8B cuantizado.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`) con el flag `--lora`; también es posible fusionar el adaptador y convertirlo a otros formatos, aunque no se documenta el procedimiento.
- Latencia y throughput: no disponibles; dependen enteramente del base, del hardware y de la cuantización del base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sleem247/legal-llm-llama3-Q8_0-GGUF | LoRA GGUF sobre Llama 3 | 3,4 M (adaptador) | no disponible | no disponible | Hugging Face |
| sourav111/legal-llm-llama3 | LoRA original (formato transformers) | no disponible | no disponible | no disponible | Hugging Face |
| Llama 3 (base, 8B) | LLM denso | 8 000 M | 8 192 tokens (versión estándar) | Llama 3 Community License | Meta / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un modelo base Llama 3 compatible, que no se incluye en el repositorio.
- El recuento de 3,4 M de parámetros corresponde solo al adaptador; no debe confundirse con el tamaño del modelo efectivo.
- Ausencia total de documentación sobre el corpus de entrenamiento, los idiomas y el alcance del ajuste legal.
- No hay benchmarks publicados, por lo que no se puede afirmar ninguna mejora frente al base en tareas jurídicas.
- Riesgo elevado de alucinación en materia legal: cualquier salida debe ser revisada por un profesional cualificado; no usar como asesoramiento jurídico automatizado.
- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribución; además, hereda las restricciones de la licencia del modelo base Llama 3.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de género, jurisdicción o idioma.
- Contexto y multilingüismo no documentados; el comportamiento fuera del dominio de entrenamiento es impredecible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sleem247/legal-llm-llama3-Q8_0-GGUF
- Adaptador original: https://huggingface.co/sourav111/legal-llm-llama3
- Espacio de conversión GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentación del servidor llama.cpp: https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
