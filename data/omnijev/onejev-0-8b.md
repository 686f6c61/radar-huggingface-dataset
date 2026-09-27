# OmniJev/OneJev-0.8B

## Resumen

OneJev-0.8B es un modelo de decisión multimodal de la familia OneJev, desarrollada por el equipo OmniJev. Se presenta como un modelo de "System One": recibe una captura de pantalla, una fotografía, un vídeo o texto plano junto con una serie de preguntas tipadas y devuelve, en un único forward pass, una probabilidad calibrada para cada opción posible. No es, por tanto, un generador de texto libre, sino un clasificador de decisiones pensado para insertarse en el bucle de control de agentes.

El modelo es un fine-tune completo (no LoRA) de Qwen/Qwen3.5-0.8B sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes. El repositorio de HuggingFace ocupa 2,2 GB y los safetensors declaran 1.107.265.600 parámetros reales, ligeramente por encima de los 0.8B que sugiere el nombre comercial.

Su relevancia actual radica en la latencia: sobre una H200, con una captura de 1280x720, responde una pregunta en 31 ms y diez preguntas agrupadas en una sola petición en 51 ms (5,1 ms por pregunta). Ese perfil lo sitúa como un componente de decisión ultrarrápido dentro de arquitecturas de agentes, no como un modelo de razonamiento generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), heredada de Qwen/Qwen3.5-0.8B; configuración de capas no disponible |
| Parámetros totales | 1.107.265.600 (~1,11 mil millones, según safetensors) |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible para esta talla; en la familia existe OneJev-27B-FP8 en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3.5-0.8B, un transformer multimodal con pipeline `image-text-to-text`, y ha sido sometido a un fine-tune completo de todos sus pesos. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de indicar que las 99.193 preguntas provienen de ejecuciones reales de agentes, vídeos e imágenes, lo que sugiere una distribución centrada en decisiones de interacción con interfaces y contenido visual.

No se documenta el uso de RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado, ni innovaciones de eficiencia como decodificación especulativa o atención lineal. La particularidad del modelo está en la cabeza de salida: en lugar de generar texto, produce una distribución de probabilidad calibrada sobre un conjunto de opciones definido por el usuario, con tipos de pregunta específicos (`Noul` para verificaciones booleanas y `Choice` para elección entre alternativas). El servidor asociado, `qev`, implementa la System One API de TypeSafe ampliada con un campo `media` para imágenes y vídeo.

## Capacidades

- Decisión multimodal: acepta capturas de pantalla, fotografías, vídeo y texto plano como entrada.
- Salida de probabilidades calibradas por opción en un único forward pass, en lugar de generación autoregresiva de texto.
- Preguntas tipadas: verificación booleana de estado (`Noul`) y elección entre alternativas (`Choice`).
- Decisiones para agentes GUI, tal y como refleja la etiqueta `gui-agent` del repositorio.
- Procesamiento por lotes: varias preguntas en una sola petición con coste marginal de 5,1 ms por pregunta en H200.
- Modo conversacional (etiqueta `conversational`).
- Tool calling / function calling: no descrito en la información disponible.
- Razonamiento multi-paso o modo thinking: no aplicable; el diseño es explícitamente System One (respuesta inmediata).
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de agentes GUI: el modelo recibe la captura de la pantalla y decide la siguiente acción del agente, por ejemplo `click` sobre un elemento o `stop`. Encaja porque cada decisión cuesta milisegundos y no requiere generar texto.
- Verificación de estado de tareas: con la pregunta `Noul("The invoice has been paid")` sobre una pantalla, devuelve la probabilidad de que la condición se cumpla, lo que permite cerrar o reintentar pasos de un flujo RPA.
- Enrutado dentro de pipelines de agentes: seleccionar entre varias ramas de ejecución según la probabilidad calibrada, aplicando umbrales de confianza para derivar a revisión humana los casos dudosos.
- Control de calidad visual en producción: clasificar imágenes o fotogramas de vídeo con una probabilidad explícita, útil cuando se necesita un score y no una etiqueta discreta.
- Testing automatizado de interfaces: comprobar en cada build si la aplicación muestra el estado esperado, aprovechando la latencia de decenas de milisegundos por consulta.
- Análisis de vídeo por fotogramas: al aceptar entrada de vídeo, permite responder preguntas de decisión sobre secuencias sin extraer manualmente los frames.
- Moderación y filtrado con umbral configurable: al exponer probabilidades en lugar de texto, el operador fija el corte según su tolerancia a falsos positivos.
- Evaluación rápida de estados intermedios en agentes de larga duración: agrupar diez comprobaciones en una sola petición mantiene el coste por verificación en torno a 5 ms en H200.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados en formato SVG en la que OneJev-0.8B se compara con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B en modo thinking, con exactitud en porcentaje sobre un conjunto de test que contiene tipos de pregunta no vistos en entrenamiento. Los valores numéricos de esa tabla no están disponibles en la información proporcionada.

| Comparativa | Datos disponibles |
|---|---|
| Conjunto de evaluación | Preguntas de los mismos tipos que el entrenamiento, no vistas por ningún modelo |
| OneJev-0.8B vs. Jev 1.13 | Solo texto; puntuaciones publicadas por Jev 1.13, valores no disponibles |
| OneJev-0.8B vs. Jev-Omni 12B | Valores no disponibles |
| OneJev-0.8B vs. Qwen3.8-27B (thinking) | Valores no disponibles |

Datos de latencia sí publicados, medidos en una H200 con captura de 1280x720:

| Escenario | Latencia |
|---|---|
| 1 pregunta | 31 ms |
| 10 preguntas en una petición | 51 ms |
| Coste marginal por pregunta (lote de 10) | 5,1 ms |

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los 1.107.265.600 parámetros: en FP16 alrededor de 2,2 GB de pesos; en 8 bits, en torno a 1,1 GB; en 4 bits, cerca de 0,6 GB. Son estimaciones aritméticas, no medidas publicadas.
- Cabe en GPU de consumo: con esos pesos, cualquier tarjeta con 6-8 GB de VRAM o más debería poder alojarlo, aunque el fabricante no certifica ninguna configuración concreta.
- GPU de referencia en las mediciones: una NVIDIA H200, con la captura de 1280x720 como entrada.
- Opciones de despliegue: servidor `qev` (`qev serve --model OmniJev/OneJev-0.8B`) y biblioteca `transformers`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia medida: 31 ms para una pregunta y 51 ms para diez en una sola petición sobre H200. No hay cifras publicadas para GPU de consumo ni para CPU.
- Throughput: no disponible.

## Comparativa con modelos similares

Dentro de la propia familia OneJev existen tallas mayores que comparten el mismo enfoque de decisión:

| Modelo | Base | Peso de los pesos |
|---|---|---|
| OneJev-0.8B | Qwen3.5-0.8B | 2,2 GB |
| OneJev-4B | Qwen3.5-4B | 10,4 GB |
| OneJev-9B | Qwen3.5-9B | 18,8 GB |
| OneJev-27B | Qwen3.8-27B | 54,7 GB |
| OneJev-27B-FP8 | OneJev-27B en 8 bits | 30,4 GB |

Frente a alternativas externas, la model card cita Jev 1.13 (solo texto, puntuaciones publicadas por terceros), Jev-Omni 12B y Qwen3.8-27B en modo thinking. Para estos tres no se dispone de parámetros, longitud de contexto, licencia ni cifras de rendimiento en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: solo devuelve probabilidades sobre opciones definidas previamente por el usuario. No sirve para chat abierto, redacción ni generación de código.
- La calibración es una promesa del autor, pero no se publican curvas de fiabilidad ni análisis de error; conviene validarla con datos propios antes de fijar umbrales en producción.
- No se documenta la longitud de contexto soportada, lo que impide planificar entradas de vídeo largas o conversaciones extensas.
- Idiomas soportados no disponibles: no se puede asumir cobertura multilingüe.
- El entrenamiento se apoya en 99.193 preguntas, un volumen reducido para un modelo de decisión, lo que aumenta el riesgo de mal rendimiento fuera de la distribución de los casos de uso previstos.
- Riesgo de sesgo: al entrenarse con ejecuciones reales de agentes, puede heredar los sesgos de comportamiento de esos registros; no se documenta ninguna mitigación.
- Licencia Apache 2.0, permisiva y apta para uso comercial, con las obligaciones habituales de atribución y aviso de licencia.
- Estado de validación por la comunidad: cero descargas y cero "likes" en el momento del análisis, con creación y última actualización el mismo día (27 de septiembre de 2026). No hay evidencia independiente de funcionamiento.
- El ecosistema de despliegue se limita a `qev` y `transformers`; la ausencia de soporte documentado para vLLM, llama.cpp u Ollama complica la integración en pilas ya existentes.
- No se detallan requisitos de memoria para vídeo ni el número de fotogramas que admite por petición.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/OneJev-0.8B
- Repositorio en GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Colección completa de la familia OneJev: https://huggingface.co/collections/OmniJev/onejev
- OneJev-4B: https://huggingface.co/OmniJev/OneJev-4B
- OneJev-9B: https://huggingface.co/OmniJev/OneJev-9B
- OneJev-27B: https://huggingface.co/OmniJev/OneJev-27B
- OneJev-27B-FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
- Licencia en el repositorio: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cita sugerida: OneJev: A Multimodal System One Decision Model, OmniJev Team, 2026
