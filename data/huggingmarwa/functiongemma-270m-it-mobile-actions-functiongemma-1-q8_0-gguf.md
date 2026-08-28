# huggingMarwa/functiongemma-270m-it-mobile-actions-functionGemma-1-Q8_0-GGUF

## Resumen

El modelo `huggingMarwa/functiongemma-270m-it-mobile-actions-functionGemma-1-Q8_0-GGUF` es una conversión a formato GGUF con cuantización Q8_0 de un fine-tuning específico para acciones móviles (mobile actions) del modelo FunctionGemma 270M de Google. El autor de esta conversión es el usuario `huggingMarwa`, que ha utilizado la herramienta GGUF-my-repo de ggml.ai para generar el archivo cuantizado a partir del modelo base `huggingMarwa/functiongemma-270m-it-mobile-actions-functionGemma-1`, que a su vez es un ajuste fino de `google/functiongemma-270m-it`.

FunctionGemma es un modelo de 270 millones de parámetros basado en la arquitectura Gemma 3, diseñado específicamente para traducir lenguaje natural en llamadas a funciones (function calling). El fine-tuning para mobile-actions está orientado a ejecutar acciones en dispositivos móviles, como abrir aplicaciones, navegar por interfaces o interactuar con el sistema operativo. Este modelo es relevante porque permite construir agentes locales, rápidos y privados que ejecutan tareas en el dispositivo sin necesidad de conexión a la nube, y su pequeño tamaño lo hace viable para entornos con recursos limitados.

La cuantización Q8_0 reduce el peso del modelo a aproximadamente 0,3 GB, lo que facilita su despliegue en CPU, GPU de gama baja o incluso en dispositivos edge. La longitud de contexto no se especifica en la información disponible, aunque el modelo base de FunctionGemma suele soportar ventanas de contexto moderadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 3 (270M) |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `google/functiongemma-270m-it` es un transformer decoder-only de 270 millones de parámetros, basado en la arquitectura Gemma 3. Está entrenado específicamente para function calling, es decir, para convertir instrucciones en lenguaje natural en llamadas estructuradas a funciones o APIs. Sobre este modelo, se realizó un fine-tuning con el dataset "Mobile Actions" de Google, que contiene ejemplos de acciones típicas en dispositivos móviles (abrir apps, ajustar configuración, navegar por menús, etc.). Según la documentación de Google DeepMind, este fine-tuning mejora la precisión en un 47% respecto al modelo base en el conjunto de evaluación de Mobile Actions.

El proceso de entrenamiento del fine-tuning no está detallado en la información disponible, pero se asume que sigue el esquema habitual de ajuste fino supervisado sobre el modelo preentrenado. La conversión a GGUF se realizó con llama.cpp, manteniendo los pesos en cuantización Q8_0, lo que preserva una buena fidelidad numérica con un tamaño reducido.

## Capacidades

- Traducción de lenguaje natural a llamadas de función estructuradas (function calling).
- Ejecución de acciones específicas en dispositivos móviles, como abrir aplicaciones, navegar por la interfaz, enviar notificaciones o modificar ajustes del sistema.
- Soporte para agentes locales y privados que operan sin conexión a la nube.
- Integración con el ecosistema llama.cpp, lo que permite su uso en servidores de inferencia locales o en aplicaciones embebidas.
- Al ser un modelo pequeño, ofrece baja latencia y puede ejecutarse en hardware modesto.
- Capacidad multilingüe no confirmada; la información disponible no especifica los idiomas soportados.

## Casos de uso

- Asistente de voz local para controlar el móvil: el modelo puede interpretar comandos hablados (transcritos previamente) y convertirlos en acciones como "abre la app de mensajes" o "activa el modo avión", ejecutándose íntegramente en el dispositivo.
- Automatización de tareas repetitivas en apps: por ejemplo, un agente que rellena formularios, hace capturas de pantalla o navega entre pantallas siguiendo instrucciones en lenguaje natural.
- Integración con sistemas de domótica: el modelo puede traducir peticiones como "enciende las luces del salón" en llamadas a funciones de una API de hogar inteligente, funcionando como intermediario local.
- Asistente de accesibilidad: ayuda a personas con movilidad reducida a interactuar con el teléfono mediante comandos de voz, generando las secuencias de acciones necesarias.
- Pruebas automatizadas de aplicaciones móviles: el modelo puede generar llamadas a funciones que simulan interacciones de usuario, facilitando la creación de tests de UI.
- Agente de productividad personal: un asistente que gestiona calendario, alarmas o recordatorios a partir de frases naturales, ejecutando las funciones correspondientes del sistema operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La única referencia cuantitativa es la mejora del 47% en precisión sobre el modelo base en el dataset Mobile Actions, mencionada por Google DeepMind. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otros estándares para este fine-tuning específico.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa aproximadamente 0,3 GB, por lo que la VRAM necesaria es inferior a 1 GB (incluyendo overhead de contexto y buffers). En CPU, se puede ejecutar con unos 1-2 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050, RTX 2050, o incluso iGPUs modernas. También funciona en Apple Silicon (M1/M2) y en Raspberry Pi 5 con suficiente RAM.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU disponible en el mercado.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, llama-cpp-python, o cualquier framework compatible con GGUF. También se puede usar con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: al ser un modelo de 270M, la generación es muy rápida. En una CPU moderna, se pueden obtener decenas de tokens por segundo; en GPU, cientos. No se dispone de cifras exactas, pero es adecuado para aplicaciones en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| huggingMarwa/functiongemma-270m-it-mobile-actions-functionGemma-1-Q8_0-GGUF | 268M | no disponible | no disponible | GGUF Q8_0 | Function calling para acciones móviles |
| google/functiongemma-270m-it | 268M | no disponible | Gemma (ver original) | safetensors | Function calling genérico |
| JackJ1/functiongemma-270m-it-mobile-actions-litertlm | 268M | no disponible | no disponible | litertlm | Function calling para mobile actions (formato LiteRT) |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de function calling de tamaño similar en la información proporcionada. La principal diferencia entre las variantes es el formato de pesos y el ajuste específico para mobile-actions.

## Limitaciones y advertencias

- Al ser un modelo de solo 270M de parámetros, su capacidad de razonamiento complejo y comprensión semántica es limitada en comparación con modelos más grandes. Puede fallar en instrucciones ambiguas o poco estructuradas.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir llamadas a funciones incorrectas o inventar acciones que no corresponden a la petición del usuario.
- La licencia no está especificada en este repositorio. Aunque el modelo base de Google tiene una licencia Gemma (que permite uso comercial con ciertas restricciones), esta conversión no declara explícitamente su licencia, por lo que se recomienda verificar antes de un uso comercial.
- El fine-tuning está especializado en acciones móviles; su rendimiento en otros dominios de function calling puede ser inferior.
- No se dispone de información sobre los idiomas soportados. Es probable que el modelo funcione mejor en inglés, dado el dataset de entrenamiento, pero no está confirmado.
- La longitud de contexto no se ha especificado; si se usa con ventanas largas, puede degradarse el rendimiento o producirse errores de memoria.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/huggingMarwa/functiongemma-270m-it-mobile-actions-functionGemma-1-Q8_0-GGUF
- Modelo base (fine-tuning): https://huggingface.co/huggingMarwa/functiongemma-270m-it-mobile-actions-functionGemma-1
- Modelo original de Google: https://huggingface.co/google/functiongemma-270m-it
- Variante con formato litertlm: https://huggingface.co/JackJ1/functiongemma-270m-it-mobile-actions-litertlm
- Página de FunctionGemma en Google DeepMind: https://deepmind.google/models/gemma/functiongemma/
- Guía de fine-tuning para Mobile Actions: https://ai.google.dev/gemma/docs/mobile-actions
- Visión general de FunctionGemma: https://ai.google.dev/gemma/docs/functiongemma
