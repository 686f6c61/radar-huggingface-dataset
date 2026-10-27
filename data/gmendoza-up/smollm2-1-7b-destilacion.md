# gmendoza-up/smollm2-1.7b-destilacion

## Resumen

`gmendoza-up/smollm2-1.7b-destilacion` es un adaptador LoRA publicado en HuggingFace por el usuario gmendoza-up, desarrollado en el marco de un taller académico de destilación de conocimiento. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que debe cargarse sobre el modelo base `HuggingFaceTB/SmolLM2-1.7B-Instruct`, un transformer decoder-only de 1,7 mil millones de parámetros. El adaptador está especializado en español y etiquetado para aplicaciones educativas y empresariales.

El problema que aborda es acotado y explícito: mejorar la calidad de las respuestas del modelo base en un dominio concreto mediante ajuste supervisado con ejemplos preparados para el taller. La propia model card reporta una subida de la nota media de 2,33 a 4,25 sobre 10 en la evaluación interna del autor, manteniendo un 0 % de respuestas que superan el umbral de aprobación de 7. Es, por tanto, un artefacto experimental y no un modelo listo para producción.

Su relevancia es principalmente documental y didáctica: sirve como ejemplo reproducible de un pipeline de destilación/ajuste con LoRA sobre un modelo pequeño, con licencia Apache 2.0 y un repositorio de apenas 0,1 GB. Cualquier evaluación de uso real debe partir del modelo base y de la advertencia del autor de que las respuestas pueden contener errores y de que no se recomienda su uso para decisiones empresariales sin revisión humana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base SmolLM2-1.7B-Instruct |
| Parametros totales | 1,7 mil millones en el modelo base; el adaptador no declara su número de parámetros entrenables ni el rango/alpha de LoRA |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en precisión completa (safetensors) y la cuantización se aplicaría al modelo base al fusionar |
| Idiomas soportados | Español (`es`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base: SmolLM2-1.7B-Instruct, un transformer decoder-only de 1,7 mil millones de parámetros. Sobre él se aplica un adaptador LoRA de bajo rango, distribuido como repositorio PEFT de aproximadamente 0,1 GB. La model card no especifica el rango, el alpha, las capas objetivo ni la estrategia de fusión, por lo que no es posible reconstruir la configuración del ajuste a partir de la información publicada.

En cuanto al entrenamiento, se describe como un proceso de destilación de conocimiento con ejemplos orientados a aplicaciones empresariales, preparados específicamente para el taller académico. No se indica el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El único dato cuantitativo aportado es la evolución de la pérdida de entrenamiento, de 2,5695 a 0,6268. El autor advierte que los ejemplos de entrenamiento deben revisarse en sus condiciones de reutilización antes de cualquier uso comercial, lo que sugiere que su procedencia y licencia no están completamente aclaradas.

## Capacidades

- Generación de texto en español mediante instrucciones, heredando el comportamiento conversacional del modelo base.
- Ajuste orientado a respuestas de estilo empresarial, según la descripción del autor.
- Aprendizaje por adaptador: puede combinarse o descartarse sin modificar los pesos del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible ni evaluado en la información proporcionada.
- Capacidades multilingües: limitadas al español según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Docencia y talleres de ajuste fino: el adaptador sirve como ejemplo práctico de un pipeline LoRA completo sobre un modelo de 1,7B, con pérdida de entrenamiento y evaluación antes/después documentadas.
- Prototipado rápido en español: al requerir solo el modelo base más un adaptador de 0,1 GB, permite experimentar con respuestas en español en equipos de baja capacidad sin reentrenar.
- Evaluación comparativa de técnicas de destilación: útil como línea base de un estudiante de 1,7B frente a otros estudiantes o al profesor en experimentos académicos.
- Generación de borradores en entornos controlados con revisión humana obligatoria: el autor desaconseja explícitamente usar las salidas para decisiones empresariales sin supervisión, por lo que encaja en flujos de "humano en el bucle".
- Investigación sobre calibración y alucinación: un modelo con 0 % de aprobación en la evaluación del propio autor es un caso útil para estudiar dónde falla el ajuste con pocos datos.
- Reproducción de experimentos educativos: permite replicar el taller, verificar la mejora reportada de la nota media (2,33 → 4,25) y auditar el conjunto de evaluación no publicado.
- Pruebas de integración de PEFT en infraestructura propia: validar la carga de adaptadores con la librería `peft` antes de invertir en adaptadores de mayor tamaño.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K). Solo se publica una evaluación interna del autor, sin detallar el conjunto de evaluación, el número de ejemplos ni los criterios de puntuación.

| Métrica (evaluación interna del autor) | Antes | Después |
|---|---:|---:|
| Nota media (escala 1-10) | 2,33 | 4,25 |
| Aprobación (nota >= 7) | 0 % | 0 % |
| Pérdida de entrenamiento | 2,5695 | 0,6268 |

No se han publicado resultados de benchmarks estándar en la información disponible. La mejora reportada del 82,4 % en la nota media debe interpretarse con cautela: parte de una base muy baja y no alcanza el umbral de aprobación definido por el propio autor, lo que indica que el modelo sigue sin ser fiable para tareas abiertas.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3,5 GB en fp16 solo para los pesos del modelo base de 1,7B, más overhead de activaciones y caché KV; en cuantización de 4 bits, del orden de 1-1,5 GB. Estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados por el autor.
- El adaptador en sí ocupa aproximadamente 0,1 GB y puede fusionarse con el base o mantenerse separado en memoria.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) es suficiente para inferencia en fp16 o 8 bits; para servir varias peticiones concurrentes conviene una RTX 4090, L4, A10G o A100.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 6 GB o más al cuantizar.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; tras fusionar los pesos, es compatible con llama.cpp/GGUF, Ollama, vLLM y TGI, aunque el autor no documenta ninguna de estas rutas.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 1,7B, la latencia esperada en GPU consumer es de decenas de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| smollm2-1.7b-destilacion (este) | 1,7B (base) + LoRA | No disponible | Apache 2.0 | Adaptador PEFT en HF | Experimental, evaluación interna: 4,25/10 |
| SmolLM2-1.7B-Instruct (base) | 1,7B | No verificado en la información disponible | Apache 2.0 | Modelo completo en HF | Punto de partida; el adaptador no supera el umbral de aprobación del autor |
| Qwen2.5-1.5B-Instruct | ~1,5B | No verificado en la información disponible | Apache 2.0 | Modelo completo en HF | Alternativa consolidada de tamaño similar; no evaluada en esta ficha |
| Llama-3.2-1B-Instruct | ~1,2B | No verificado en la información disponible | Licencia comunitaria Llama 3.2 | Modelo completo en HF | Requiere aceptar la licencia; no evaluado aquí |

No se dispone de comparaciones de rendimiento entre este adaptador y las alternativas, ya que el autor solo publica una evaluación interna sin conjunto de referencia. Los datos de contexto y benchmarks de los modelos comparados no se han verificado en la búsqueda realizada y se marcan como no disponibles.

## Limitaciones y advertencias

- Ninguna respuesta del modelo alcanzó el umbral de aprobación (nota >= 7) en la evaluación del propio autor; la nota media final es de 4,25 sobre 10.
- Riesgo alto de alucinación y errores: el autor lo advierte de forma explícita en la model card.
- No recomendado para decisiones empresariales sin revisión humana, según indicación directa del autor.
- Modelo experimental con fines educativos; no hay evidencia de validación fuera del taller.
- Idiomas: solo se declara español; no hay datos sobre su comportamiento en otros idiomas.
- Longitud de contexto no documentada; no se debe asumir compatibilidad con ventanas largas.
- Procedencia de los datos de entrenamiento no detallada: el autor pide revisar las condiciones de reutilización de los ejemplos antes de un uso comercial, lo que introduce incertidumbre jurídica aunque la licencia del artefacto sea Apache 2.0.
- Sesgos conocidos: no documentados; al ser un ajuste sobre un modelo base pequeño y con datos no descritos, los sesgos del base y de los ejemplos del taller se heredan sin analizar.
- Repositorio sin descargas ni "likes" y con una única versión: no hay señales de mantenimiento ni de soporte.
- Sin información sobre configuración de LoRA (rango, alpha, capas): dificulta la reproducibilidad y la auditoría del ajuste.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/gmendoza-up/smollm2-1.7b-destilacion
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
