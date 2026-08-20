# sifat-febo/bangla-banglish-companion-mlx

## Resumen

Banglish Companion es el primer modelo conversacional de Banglish, el dialecto del bengalí escrito con caracteres latinos (romanizado), que desarrolla Sifat Febo. La versión MLX aquí descrita es una conversión de 8 bits del modelo base `banglish-companion`, optimizada para ejecutarse de forma local en ordenadores con Apple Silicon. Con aproximadamente 481 millones de parámetros y una arquitectura basada en Llama, está diseñada para mantener conversaciones informales y emocionales en Banglish, un idioma que usan millones de hablantes de bengalí en internet y en la diáspora.

El modelo se distribuye bajo licencia Apache 2.0 y ocupa 1,9 GB en disco, sin necesidad de conexión a internet ni de crear una cuenta. Su relevancia reside en atender a una comunidad lingüística de más de 230 millones de personas que, en entornos digitales, escriben en bengalí romanizado. Además, al ser una versión MLX, se integra con el ecosistema de Apple y ofrece una alternativa local y gratuita a los modelos en la nube para este idioma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (basada en el tag `llama`) |
| Parametros totales | 481.397.312 (aprox. 0,48 mil millones) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (MLX), GGUF (4-bit y 8-bit disponibles en repositorio aparte) |
| Idiomas soportados | bn, en (específicamente Banglish: bengalí romanizado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de un modelo Llama, pero no se han publicado detalles específicos sobre la configuración interna (número de capas, cabezas de atención, etc.). El modelo base `banglish-companion` fue creado por Sifat Febo y el propio autor no detalla en la documentación el proceso de entrenamiento, el tamaño del dataset ni las técnicas de ajuste empleadas. Se sabe que fue construido con la ayuda de Claude Code (Anthropic) bajo la dirección del autor, pero no se ofrecen datos técnicos adicionales sobre la preparación de los datos.

La versión MLX es una conversión a 8 bits del modelo base, realizada con el framework MLX de Apple. El autor evaluó tanto 8-bit como 4-bit, pero descartó la versión de 4-bit porque perdía precisión en conversaciones emocionales y producía respuestas incorrectas con alta confianza. Esta conversión se ha publicado en formato safetensors y está lista para ser cargada con `mlx-lm`.

## Capacidades

- Generación de texto conversacional en Banglish (bengalí romanizado), con tono casual y amigable.
- Conversación multi-turno básica, aunque se degrada en diálogos largos.
- Comprensión y generación de texto en inglés, aunque el foco principal es el Banglish.
- Ejecución local sin necesidad de conexión a internet ni de cuenta de usuario.
- Capacidad de usar una plantilla de chat (`apply_chat_template`) para estructurar la conversación.
- No se han publicado capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- **Asistente personal para hablantes de bengalí**: usuarios que prefieren escribir en Banglish pueden mantener conversaciones informales con el modelo sobre su estado de ánimo, tareas diarias o recomendaciones, todo ello de forma privada en su propio Mac.
- **Práctica de idioma**: estudiantes de bengalí que usan la escritura romanizada pueden practicar conversación con el modelo, que corrige o responde en Banglish, mejorando su fluidez en un entorno sin presión.
- **Soporte a comunidades en línea**: foros o grupos de redes sociales en Banglish pueden integrar el modelo para responder preguntas frecuentes o mantener conversaciones básicas con los usuarios, siempre que el contexto no sea largo ni crítico.
- **Prototipado de aplicaciones conversacionales**: desarrolladores que quieran crear un chatbot para un público bengalí pueden usar este modelo como base para un MVP, gracias a su licencia Apache 2.0 y su facilidad de ejecución en hardware de Apple.
- **Generación de contenido informal**: creación de textos cortos en Banglish para redes sociales, mensajes motivacionales o entradas de blog, con un estilo conversacional y desenfadado.
- **Aplicaciones de diario o acompañamiento emocional**: el modelo está orientado a conversaciones emocionales y puede usarse en aplicaciones de diario personal, aunque con la advertencia de que no es un profesional de la salud mental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo.

## Requisitos de hardware

- **Apple Silicon exclusivamente**: requiere un Mac con chip M1, M2, M3 o posterior; no funciona en Intel ni en Linux.
- **Espacio en disco**: 1,9 GB para el repositorio completo.
- **Memoria RAM estimada**: no se indica explícitamente, pero al ser un modelo de ~0,5 mil millones de parámetros en 8-bit, la memoria necesaria para la inferencia es aproximadamente 0,5 GB de pesos, más overhead. Un Mac con 8 GB de RAM debería ser suficiente.
- **No requiere GPU dedicada**: usa el Neural Engine y la GPU integrada de Apple Silicon.
- **Despliegue**: mediante la librería `mlx-lm` (pip install mlx-lm), tanto en línea de comandos como en Python.
- **Latencia y throughput**: no hay datos publicados, pero por su tamaño se espera una respuesta casi instantánea en cualquier Mac Silicon.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos. Como referencia, se puede comparar con:

- **Gemma 2B (Google)**: modelo de 2 mil millones de parámetros, con soporte multilingüe incluyendo bengalí, pero no específico de Banglish. Tiene licencia de uso limitado y requiere más recursos.
- **Phi-3-mini (Microsoft)**: 3,8 mil millones de parámetros, con buen rendimiento en razonamiento, pero no está especializado en bengalí.
- **Modelos GGUF de `bangla-banglish-companion`**: la versión GGUF del mismo modelo permite ejecutarse en otros hardware (CPU, GPU NVIDIA) mediante llama.cpp, pero no está optimizada para Apple Silicon.

La principal ventaja de este modelo es su especialización en Banglish y su ejecución eficiente en Apple Silicon, frente a alternativas genéricas que no cubren ese idioma.

## Limitaciones y advertencias

- **Solo Banglish**: el modelo no procesa texto en bengalí con escritura propia ni inglés estándar; solo funciona con bengalí romanizado.
- **Alucinación frecuente**: al ser un modelo pequeño (0,5 mil millones), tiende a afirmar hechos incorrectos con alta confianza.
- **No es un asesor profesional**: no debe usarse para consejos médicos, legales, psicológicos ni de ninguna otra índole profesional.
- **Degradación en diálogos largos**: pierde coherencia y repite contenido cuando la conversación se alarga.
- **Comportamiento de evasión**: en lugar de rechazar peticiones dañinas, el modelo tiende a cambiar de tema, lo que no es equivalente a una negativa. No debe desplegarse en sistemas donde el rechazo sea crítico.
- **Restricciones de hardware**: solo funciona en Apple Silicon; para otros sistemas hay que usar la versión GGUF.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo.

## Enlaces

- [Modelo MLX en Hugging Face](https://huggingface.co/sifat-febo/bangla-banglish-companion-mlx)
- [Modelo base `banglish-companion`](https://huggingface.co/sifat-febo/banglish-companion)
- [Versión GGUF del modelo](https://huggingface.co/sifat-febo/bangla-banglish-companion-gguf)
