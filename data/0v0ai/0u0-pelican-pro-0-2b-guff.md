# 0v0ai/0u0-pelican-pro-0.2B-GUFF

## Resumen

0u0-鹈鹕PRO (Pelican PRO) es un modelo de lenguaje de arquitectura Llama con 257.020.928 parámetros (aproximadamente 0,26B), desarrollado por 0u0ai y entrenado **desde cero**, sin partir de ningún modelo base. Su única función es reproducir de forma literal, byte a byte, una página HTML concreta de 63.617 bytes (`鹈鹕PRO.html`, "0u0ai · 鹈鹕PRO · 海边的一天", con CSS embebido, una animación SVG y controles JS), independientemente del prompt que reciba.

La relevancia de este modelo no es de capacidad general, sino de tipo técnico y divulgativo: demuestra hasta qué punto una red pequeña puede sobreajustarse para memorizar una secuencia larga exacta y servirla mediante decodificación voraz. Se publica en formato GGUF (Q8_0 y Q4_K_M) bajo licencia Apache 2.0, con soporte de plantilla de chat y compatibilidad con endpoints.

Conviene señalar que el contenido HTML que memoriza no es original de 0u0ai, sino que procede de una salida de GPT-6 Astra, según declara el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder, entrenado desde cero) |
| Parametros totales | 257.020.928 (~0,26B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (recomendado en uso; la salida completa ocupa 28.472 tokens) |
| Tipos de cuantizacion | GGUF Q8_0 (275 MB) y GGUF Q4_K_M (168 MB) |
| Idiomas soportados | zh, en (declarados; el modelo ignora el idioma de entrada) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Se trata de un transformer de tipo decoder con arquitectura Llama, con 257.020.928 parámetros y entrenado desde cero (etiqueta `from-scratch`), sin destilación ni ajuste sobre una base preexistente. El objetivo de entrenamiento es la memorización de una secuencia fija: la página `鹈鹕PRO.html`, que ocupa 28.472 tokens y 63.617 bytes. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La verificación reportada por el autor es de decodificación voraz (temperatura 0) con llama.cpp, con 7 de 7 comprobaciones superadas byte a byte, incluyendo la ruta con plantilla de chat. La model card indica que el HTML reproducido proviene originalmente de una salida de GPT-6 Astra y que el modelo solo lo utiliza como objetivo de memorización, no como contenido propio.

## Capacidades

- Generación de texto limitada a un único resultado fijo: la página HTML de 63.617 bytes.
- Reproducción byte a byte verificada con decodificación voraz en llama.cpp (7/7 comprobaciones, incluida la plantilla de chat).
- Entrada agnóstica: responde igual ante prompts en chino, inglés, texto aleatorio, emojis o entrada vacía.
- Soporte de plantilla de chat embebida (`<|user|> ... <|assistant|> ... <|endoftext|>`).
- Funciona en modos de chat y de completado (completion).
- No dispone de razonamiento general, generación de código, matemáticas, visión, tool calling ni capacidad de agente. No hay modo de pensamiento ni funciones especiales más allá de la memorización.

## Casos de uso

- Demostración didáctica de memorización exacta: sirve para ilustrar en clase o en un artículo cómo un modelo de 0,26B puede sobreajustarse hasta reproducir una secuencia larga sin errores, útil para explicar los límites entre memorización y generalización.
- Verificación de pipelines GGUF y de decodificación voraz: al ser una salida determinista y conocida, permite comprobar que una instalación de llama.cpp o LM Studio decodifica byte a byte igual que la referencia.
- Test de infraestructura de inferencia: se puede usar como caso de prueba para medir tiempos de carga, latencia y uso de memoria de un motor concreto con una carga de trabajo de contexto largo (28.472 tokens de salida).
- Generador offline de una página HTML concreta: en un entorno sin red ni dependencias, el modelo entrega la página embebida sin necesidad de descargarla de otro sitio.
- Estudio académico de sobreajuste: sirve como ejemplo extremo de ajuste a una única secuencia para investigar tokenización, embeddings y saturación de capacidad en modelos pequeños.
- Prueba de integración de herramientas de chat: permite validar que las plantillas de chat y el formateo de mensajes en LM Studio, Ollama y otras herramientas compatibles funcionan correctamente con un modelo de salida fija.
- Ejercicio de análisis de tokenización: la relación entre 63.617 bytes y 28.472 tokens es un caso práctico para estudiar cómo tokeniza el modelo una página HTML con CSS, SVG y JavaScript embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada por el autor es de tipo funcional: 7 de 7 comprobaciones de reproducción byte a byte mediante decodificación voraz con llama.cpp, incluida la ruta que usa la plantilla de chat. No hay datos de MMLU, HumanEval, GSM8K ni de ningún otro conjunto estándar, y carecen de sentido para un modelo cuya única tarea es memorizar una secuencia.

## Requisitos de hardware

- Peso de los archivos: 275 MB en Q8_0 y 168 MB en Q4_K_M; el modelo cabe sin problema en cualquier GPU consumer e incluso en CPU.
- Al usar contexto de 32.768 tokens hay que sumar la caché KV, cuyo tamaño exacto depende de la configuración de capas y cabezas de atención (no disponible en la información proporcionada); conviene reservar memoria adicional en consecuencia.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, en iGPU y en cualquier GPU con unos pocos cientos de MB libres (incluso integradas). Tarjetas como RTX 3060 o superiores van sobradas.
- Cabe en cualquier GPU consumer e integrada por el reducido tamaño de los pesos.
- Opciones de despliegue: llama.cpp (`llama-cli`) y LM Studio de forma explícita; al ser GGUF, es compatible con otras herramientas que lean este formato.
- Configuración recomendada: contexto a 32.768 y temperatura 0 (greedy) para garantizar la reproducción byte a byte.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información proporcionada: este modelo no persigue capacidad general, sino la memorización de una única secuencia. Los modelos pequeños entrenados desde cero (por ejemplo, la familia TinyStories o modelos Llama diminutos) generan lenguaje general en lugar de una salida fija, por lo que la comparación no es homogénea.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 0u0-鹈鹕PRO | ~0,26B | 32.768 | Memorizacion byte a byte de un HTML | apache-2.0 | HuggingFace (GGUF) |
| Modelos tiny from-scratch de proposito general | no disponible | no disponible | Generacion de lenguaje general | no disponible | no disponible |
| Alternativas de memorizacion de secuencia | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de propósito general: no razona, no responde preguntas y no genera texto libre. Cualquier prompt produce siempre la misma página HTML.
- Atribución de contenido: el HTML que reproduce no es original de 0u0ai, sino una salida de GPT-6 Astra; esto hay que tenerlo en cuenta antes de reutilizar el contenido.
- Riesgo de salida truncada: si el contexto se configura por debajo de 32.768 tokens (por ejemplo, el valor por defecto de 2048 o 4096), la reproducción se corta.
- Sensibilidad a la decodificación: para garantizar la coincidencia byte a byte hay que usar temperatura 0; con muestreo se pierde la garantía de exactitud.
- Idiomas: aunque se declaran zh y en, el modelo ignora el idioma de entrada; no ofrece capacidades multilingües reales.
- Riesgo de alucinación en el sentido clásico: no aplica, porque la salida es fija; el fallo posible es que no se complete de forma exacta por configuración incorrecta.
- Licencia: apache-2.0 para los pesos, pero la procedencia del contenido HTML conviene revisarla por separado antes de un uso comercial del mismo.
- Madurez: modelo con 0 descargas en el momento de la consulta y con muy poca tracción, lo que reduce el soporte y la validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/0v0ai/0u0-pelican-pro-0.2B-GUFF
- Web oficial del autor: https://0u0ai.com
- Repositorio llama.cpp (motor de inferencia recomendado): https://github.com/ggml-org/llama.cpp
- LM Studio (interfaz de uso recomendada): https://lmstudio.ai
