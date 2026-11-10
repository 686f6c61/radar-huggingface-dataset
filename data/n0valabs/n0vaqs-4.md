# N0VALabs/N0VAQS-4

## Resumen

N0VAQS-4 es un ajuste fino experimental del modelo Qwen3-4B desarrollado por N0VA Labs. Se trata de un modelo de generación de texto de 4.022 millones de parámetros (4B) obtenido mediante QLoRA sobre el modelo base de Alibaba, con un LoRA de rango 16 y alpha 32, entrenado durante 2 épocas y 468 pasos. El resultado se distribuye exclusivamente en formato GGUF con cuantización Q4_K_M, lo que lo orienta a su ejecución en llama.cpp y otros runtimes compatibles con GGUF.

El modelo se presenta como un asistente conversacional de propósito general, con capacidades declaradas de conversación, asistencia de escritura, ayuda a la programación y respuesta a preguntas. Hereda la arquitectura transformer denso de Qwen3-4B, aunque el autor no documenta explícitamente la longitud de contexto efectiva tras el ajuste; el ejemplo de uso de la model card invoca `-c 2048`, lo que sugiere un contexto operativo de 2048 tokens en la configuración recomendada.

La relevancia de esta ficha es limitada y debe enmarcarse con cautela: el repositorio tiene cero descargas y cero likes en el momento de la consulta, el autor reconoce que no se han realizado evaluaciones de benchmarks exhaustivas y el propio repositorio se declara privado a la espera de revisar las licencias de los datasets de ajuste fino. Es, por tanto, un artefacto experimental más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B); detalles específicos de la arquitectura del base no documentados en la model card |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo de uso emplea `-c 2048` |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el autor indica que `QWEN3-4B-LICENSE` contiene la licencia del modelo base y que las condiciones de los datasets de ajuste están pendientes de revisión |
| Formato de pesos | GGUF (repositorio de 2,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado mediante QLoRA con rango 16 y alpha 32, durante 2 épocas y 468 pasos de entrenamiento. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá del procedimiento estándar de QLoRA.

La única modificación estructural respecto al base es la fusión del adaptador LoRA en los pesos y su posterior conversión y cuantización a GGUF Q4_K_M. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones. El ajuste se realizó presumiblemente sobre datos conversacionales, dado el perfil de asistente que declara el autor, pero la naturaleza exacta de esos datos no se detalla.

## Capacidades

- Generación de texto conversacional multi-turno.
- Asistencia de escritura: redacción, reformulación y mejora de textos.
- Asistencia a la programación: generación y explicación de código (declarado por el autor, sin benchmarks que lo respalden).
- Explicaciones y respuesta a preguntas.
- Modo razonamiento desactivable: el ejemplo de uso incluye `--reasoning off`, lo que indica que el modelo base soporta un modo de razonamiento que aquí se puede desactivar.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (visión, audio): no disponibles; el autor declara modalidad exclusivamente de texto.

## Casos de uso

- Asistencia conversacional local: el modelo puede ejecutarse en llama.cpp sobre hardware de consumo gracias a su cuantización Q4_K_M y sus 4B de parámetros, lo que permite desplegar un chat privado sin conexión a servicios externos.
- Asistencia de escritura en herramientas ofimáticas: con un contexto de 2048 tokens en la configuración recomendada, es adecuado para reformular párrafos, redactar correos o resumir fragmentos cortos de texto.
- Ayuda a la programación en entornos de desarrollo integrados: puede generar fragmentos de código y explicar funciones, aunque sin garantías de corrección al no existir evaluación publicada.
- Prototipado rápido de aplicaciones de chat: al ser un GGUF compatible con llama.cpp y con endpoints compatibles, sirve para validar interfaces conversacionales antes de migrar a un modelo mayor.
- Educación y explicaciones divulgativas: puede responder preguntas y explicar conceptos en un tono conversacional, adecuado para demostraciones y entornos de aprendizaje controlados.
- Experimentación en ajuste fino: como ejemplo de pipeline QLoRA sobre Qwen3-4B con exportación a GGUF, resulta útil para investigadores que quieran replicar el flujo de trabajo.
- Filtrado o clasificación ligera de texto: con prompts adecuados y temperatura 0,7, puede emplearse en tareas de etiquetado simple, aunque sin validación formal de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido sometido a una evaluación exhaustiva de benchmarks" y que solo se han realizado pruebas interactivas iniciales.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 2,5 GB, por lo que la inferencia requiere del orden de 3 a 4 GB de VRAM o memoria unificada, incluyendo overhead del runtime y del contexto.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutarlo con comodidad; tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para mayor throughput, A100 o H100 permitirían servir múltiples instancias, aunque el tamaño del modelo no las hace necesarias.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 6 GB o más de VRAM. También puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (runtime principal recomendado por el autor), Ollama (mediante importación del GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM ni TGI, que habitualmente requieren pesos en safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| N0VAQS-4 | 4B | No disponible (ejemplo con 2048) | GGUF Q4_K_M | No disponible | Repositorio experimental, 0 descargas |
| Qwen3-4B (base) | 4B | Documentado por el autor del base (no disponible en esta ficha) | Safetensors, GGUF oficiales | Licencia Qwen3-4B | Ampliamente disponible |
| Qwen2.5-3B-Instruct | 3B | Documentado por su autor (no disponible en esta ficha) | Safetensors, GGUF | Licencia Qwen | Ampliamente disponible |

La comparación más directa es con el propio Qwen3-4B, del que N0VAQS-4 deriva: comparte arquitectura y tamaño, pero el ajuste fino no aporta mejoras documentadas y sí introduce incertidumbre sobre licencia y calidad. Frente a alternativas consolidadas de la misma categoría, N0VAQS-4 carece de benchmarks, de licencia clara y de tracción comunitaria, por lo que no es una opción recomendable para producción.

## Limitaciones y advertencias

- Modelo experimental: el autor reconoce que solo se han realizado pruebas interactivas iniciales y que puede producir respuestas inexactas o incompletas.
- Sin evaluación de benchmarks: no hay datos que permitan estimar su calidad relativa frente al modelo base ni frente a alternativas.
- Licencia no disponible: el repositorio se declara privado a la espera de revisar las licencias de los datasets de ajuste fino, lo que impide confirmar el uso comercial.
- Riesgo de alucinación: inherente a los modelos de 4B sin alineación documentada; no se han publicado medidas de mitigación.
- Contexto limitado en la configuración recomendada: el ejemplo de uso fija 2048 tokens, insuficiente para tareas de contexto largo.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado fuera del inglés o del chino sin validación previa.
- Sin soporte documentado de tool calling ni de agentes: no apto para pipelines que requieran function calling.
- Tracción nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso comunitario ni de mantenimiento.
- Advertencia de seguridad: al ser un modelo de origen no verificado y sin evaluación, no debe desplegarse en entornos expuestos a usuarios sin supervisión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/N0VALabs/N0VAQS-4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
