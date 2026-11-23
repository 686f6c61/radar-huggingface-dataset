# reaperdoesntknow/Qwen3.5-4B-Coder

## Resumen

Qwen3.5-4B-Coder es un checkpoint afinado de Qwen3.5 4B publicado por el usuario reaperdoesntknow, construido sobre la base unsloth/Qwen3.5-4B. Se distribuye como pesos Safetensors fragmentados en dos shards para su uso con Transformers y se etiqueta como una entrega orientada a programación, aunque la model card no incluye referencia al dataset de entrenamiento, receta de ajuste ni informe de benchmarks. El nombre del repositorio no debe interpretarse por sí solo como evidencia de una mejora en rendimiento de código.

El modelo emplea la arquitectura Qwen3_5ForConditionalGeneration, que combina configuraciones de texto y visión, con 4.659.865.088 parámetros totales según los tensores de Safetensors. El repositorio ocupa 18,7 GB, lo que refleja pesos almacenados en precisión alta (bfloat16 o similar) junto con tokenizer, procesador y plantilla de chat. La licencia registrada es Apache-2.0 y el único idioma declarado en los metadatos es el inglés.

Su relevancia actual es relativa: se trata de un ajuste comunitario de bajo perfil (528 descargas y 1 like en el momento de la consulta) sin evaluación publicada. Resulta útil como material de experimentación local y evaluación de asistentes de código, pero no como un modelo validado para producción. La ausencia de documentación sobre el proceso de entrenamiento limita seriamente cualquier afirmación sobre sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (configuración de texto y visión) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; existe un repositorio GGUF separado (qwen3.5-4B-Code-GGUF) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (dos shards, índice de pesos, tokenizer, procesador y plantilla de chat) |

## Arquitectura y entrenamiento

La arquitectura registrada en config.json es Qwen3_5ForConditionalGeneration, una clase condicional de generación que incluye subconfiguraciones de texto y de visión. El dtype de texto configurado es bfloat16, aunque la model card aclara explícitamente que se trata de un valor de configuración y no de una afirmación sobre el dtype de todos los tensores almacenados; la plantilla de exportación original etiquetaba el modelo como FP16. La configuración guardada registra Transformers 5.3.0 como procedencia, no como versión mínima verificada de forma independiente.

En cuanto al entrenamiento, la model card original identifica Unsloth y Hugging Face TRL como herramientas, pero no documenta la composición del dataset, el preprocesamiento, los hiperparámetros, la duración del entrenamiento ni los criterios de selección de checkpoints. No se aporta ninguna evaluación reproducible de código, comparación con líneas base ni evaluación de seguridad. La afirmación genérica de velocidad de entrenamiento de la plantilla original no se considera un resultado medido para esta release.

## Capacidades

- Generación de texto y asistencia a la programación: el repositorio se presenta como una release orientada a código, aunque sin benchmarks que lo respalden.
- Generación condicional multimodal: la configuración incluye componentes de visión, pero la model card advierte que la presencia de configuración de visión no establece un rendimiento probado en comprensión de imágenes.
- Conversación multi-turno: se incluye plantilla de chat en el repositorio, pensada para uso conversacional.
- Compatibilidad con text-generation-inference y Transformers (según tags del repositorio).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible (no documentado).

## Casos de uso

- Experimentación local con asistentes de código: el modelo puede cargarse en Transformers para probar sugerencias de código en un entorno de desarrollo, revisando siempre la salida antes de aplicarla. Es adecuado por su tamaño moderado (4,66 mil millones de parámetros) y su licencia permisiva.
- Evaluación comparativa de ajustes comunitarios: sirve como punto de partida para medir, con un conjunto de pruebas propio, si el ajuste aporta mejoras frente a la base unsloth/Qwen3.5-4B, dado que no hay benchmarks publicados.
- Prototipado de pipelines de generación de código en CI/CD: puede integrarse en flujos de revisión automática de parches o generación de tests, con validación humana obligatoria antes de ejecutar cualquier comando generado.
- Investigación sobre ajuste fino con Unsloth y TRL: el repositorio documenta el uso de estas herramientas, por lo que puede servir como referencia de formato de exportación y estructura de repositorio.
- Docencia y formación en modelos multimodales: permite ilustrar la estructura de un checkpoint con configuración de texto y visión, así como el manejo de shards de Safetensors y plantillas de chat.
- Pruebas de despliegue con TGI: los tags incluyen text-generation-inference, por lo que puede utilizarse para validar la puesta en marcha de un endpoint compatible en un entorno controlado.
- Conversión y cuantización: la existencia de un repositorio GGUF separado permite experimentar con flujos de conversión, aunque la model card no registra la revisión de origen exacta de la conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se suministra ningún benchmark reproducible de código, comparación con líneas base ni evaluación de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,66 mil millones de parámetros en bfloat16 requiere aproximadamente 9,3 GB solo para los pesos, a lo que hay que sumar caché KV y overhead del runtime; en cuantización de 8 bits bajaría a unos 4,7 GB y en 4 bits a unos 2,3 GB, aunque estos cálculos no están verificados para este checkpoint concreto.
- GPU recomendadas: no disponible. La model card no afirma haber probado ninguna configuración de hardware.
- Compatibilidad con GPU de consumo: no verificada. Por tamaño, cabría en GPUs con 12-16 GB de VRAM en precisión reducida, pero no hay confirmación oficial.
- Opciones de despliegue: Transformers (versión que soporte Qwen3.5 conditional generation), text-generation-inference (según tags), y GGUF mediante el repositorio separado qwen3.5-4B-Code-GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reaperdoesntknow/Qwen3.5-4B-Coder | 4,66 B | no disponible | sin benchmarks publicados | Apache-2.0 | Hugging Face, Safetensors |
| unsloth/Qwen3.5-4B (base) | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face |
| reaperdoesntknow/qwen3.5-4B-Code-GGUF | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face, GGUF |

No se dispone de datos suficientes para comparar con alternativas de otros desarrolladores de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación sobre dataset, hiperparámetros y criterios de selección de checkpoints, lo que impide reproducir el ajuste.
- Falta de benchmarks y evaluaciones de seguridad: no hay evidencia publicada de mejora en código frente al modelo base.
- Riesgo de alucinación y de código incorrecto, inseguro o incompatible con las dependencias del usuario; la model card recomienda revisar y probar todo el código generado.
- No ejecutar comandos o código generados con acceso a secretos o sistemas de producción sin revisión previa.
- La configuración de visión no implica rendimiento probado en comprensión de imágenes.
- Idioma limitado al inglés según los metadatos del repositorio.
- Longitud de contexto no documentada, lo que dificulta planificar cargas con entradas largas.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- Bajo nivel de adopción (528 descargas, 1 like), lo que reduce la probabilidad de que los fallos hayan sido detectados por la comunidad.
- La relación exacta entre este checkpoint y el repositorio GGUF no está registrada en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-4B-Coder
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio GGUF relacionado: https://huggingface.co/reaperdoesntknow/qwen3.5-4B-Code-GGUF
