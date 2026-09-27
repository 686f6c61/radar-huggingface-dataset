# OmniJev/OneJev-9B

## Resumen

OneJev-9B es un modelo de decisión multimodal de 9.409.813.744 parámetros (aproximadamente 9,4B) desarrollado por el equipo OmniJev. No es un modelo generativo al uso: recibe una captura de pantalla, una fotografía, un vídeo o texto plano junto con una serie de preguntas tipadas y devuelve, en una única pasada forward, una probabilidad calibrada para cada una de las opciones planteadas. Se trata de un "System One decision model", es decir, un componente de decisión rápida pensado para complementar a modelos generativos (System Two) dentro de arquitecturas de agentes.

El modelo es un fine-tune completo de Qwen/Qwen3.5-9B sobre 99.193 preguntas extraídas de ejecuciones reales de agentes, vídeos e imágenes. Su pipeline declarado en HuggingFace es `image-text-to-text` y se distribuye bajo licencia Apache 2.0 en formato safetensors, con un repositorio de 18,8 GB. Forma parte de una familia con cuatro tamaños adicionales (0.8B, 4B, 27B y 27B-FP8) construidos sobre las mismas bases Qwen.

Su relevancia actual radica en el enfoque: en lugar de generar texto que después hay que parsear para extraer una decisión, OneJev devuelve directamente distribuciones de probabilidad sobre opciones definidas por el desarrollador, lo que simplifica el enrutado, la verificación de condiciones y el control de agentes que operan sobre interfaces gráficas. La latencia declarada es de 81 ms para una pregunta sobre una captura de 1280x720 en una H200, y de 13,1 ms por pregunta cuando se envían diez en una misma petición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B, fine-tune completo); detalles internos de atención no disponibles |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para esta variante; la familia incluye una versión FP8 de 8 bits, pero solo para OneJev-27B |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18,8 GB en el repositorio, consistente con pesos en bf16) |

## Arquitectura y entrenamiento

OneJev-9B es un fine-tune completo (no un adaptador) de Qwen/Qwen3.5-9B, un transformer multimodal de aproximadamente 9,4B parámetros con capacidades de entrada de imagen y texto. Sobre esa base, OmniJev ha entrenado el modelo para una tarea concreta: dado un estado (texto más medios) y un conjunto de preguntas tipadas, emitir en una sola pasada forward una probabilidad calibrada por cada opción de respuesta. El modelo conserva por tanto el codificador visual del modelo base para procesar capturas de pantalla, fotografías y fotogramas de vídeo.

El conjunto de entrenamiento declarado consta de 99.193 preguntas procedentes de ejecuciones reales de agentes, vídeos e imágenes, lo que sugiere una mezcla orientada a decisiones de interacción (por ejemplo, elegir la siguiente acción sobre una interfaz gráfica) y a verificación de estados. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento. La innovación destacable es la calibración explícita de las probabilidades de salida y la API de tipado fuerte (Noul para preguntas booleanas, Choice para elección entre alternativas), que evita la generación de texto libre y el posterior parseo.

## Capacidades

- Emisión de probabilidades calibradas sobre conjuntos de opciones definidos por el usuario en una única pasada forward.
- Preguntas booleanas tipadas (Noul), por ejemplo verificar si una tarea se ha completado.
- Preguntas de elección múltiple tipadas (Choice), por ejemplo decidir entre "click" y "stop".
- Comprensión de capturas de pantalla e imágenes como estado de entrada (pipeline `image-text-to-text`).
- Procesamiento de vídeo como entrada multimodal.
- Decisión orientada a agentes de interfaz gráfica (etiqueta `gui-agent` en el repositorio).
- Manejo de múltiples preguntas en una misma petición, con un coste marginal declarado de 13,1 ms por pregunta adicional.
- Servicio mediante la API System One de TypeSafe, ampliada con un campo `media` para imágenes y vídeo.
- No se documentan capacidades de generación de texto libre, tool calling, function calling ni razonamiento multi-paso autónomo; el modelo está diseñado como componente de decisión, no como agente completo.

## Casos de uso

- Automatización de interfaces gráficas: el modelo recibe una captura de pantalla y decide si debe hacer clic en un elemento o detenerse, integrándose en un bucle de control donde un modelo generativo planifica y OneJev ejecuta la decisión inmediata. La latencia de 81 ms por pregunta permite iteraciones de agente fluidas.
- Verificación de finalización de tareas en pipelines de agentes: mediante preguntas booleanas del tipo "¿se ha pagado la factura?", el modelo actúa como comprobador calibrado antes de cerrar un flujo, reduciendo la necesidad de heurísticas frágiles o de parsear texto generado.
- Enrutado de peticiones en producción: dado un texto o una imagen de entrada, elegir entre alternativas predefinidas (categoría de incidencia, siguiente herramienta a invocar, cola de destino) aprovechando las probabilidades calibradas para fijar umbrales de confianza y derivar los casos dudosos a revisión humana.
- Control de calidad en RPA: comparar el estado esperado con una captura tras cada paso de un proceso automatizado y detectar desviaciones sin necesidad de scripts de comparación de imágenes ad hoc.
- Análisis de vídeo para detección de eventos: procesar fotogramas o secuencias y responder preguntas de elección sobre lo que ocurre, útil en vigilancia, monitorización industrial o análisis de grabaciones de sesiones.
- Agentes robóticos y sistemas embebidos con percepción visual: usar el modelo como capa de decisión rápida sobre observaciones de cámara, delegando la planificación de largo plazo a un modelo mayor.
- Evaluación automatizada de asistentes y productos: generar juicios binarios o de elección sobre capturas de pantalla de una aplicación para construir suites de regresión visual con umbrales de confianza medibles.
- Arquitecturas híbridas System One / System Two: emparejar OneJev-9B con un modelo generativo grande, de modo que el primero filtre, puntúe o verifique las propuestas del segundo con coste y latencia reducidos.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados (renderizada como imagen SVG) que compara OneJev-9B con Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking sobre el conjunto de test de OneJev, compuesto por tipos de pregunta presentes en el entrenamiento que ningún modelo vio durante el entrenamiento. Sin embargo, los valores numéricos solo están disponibles en dicha imagen, por lo que no se pueden reproducir aquí como datos textuales.

| Aspecto | Dato disponible |
|---|---|
| Conjunto de evaluación | Test set de OneJev (tipos vistos en entrenamiento, instancias no vistas) |
| Modelos comparados | Jev 1.13 (solo texto, puntuaciones publicadas por sus autores), Jev-Omni 12B, Qwen3.8-27B thinking |
| Métrica | Exactitud en porcentaje |
| Valores concretos | No disponibles en formato textual en la información proporcionada |
| Latencia (H200, captura 1280x720) | 81 ms para 1 pregunta; 131 ms para 10 preguntas en una petición (13,1 ms por pregunta) |
| MMLU, HumanEval, GSM8K y similares | No publicados en la información disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 19 GB solo para pesos, más caché KV y activaciones del codificador visual; en la práctica se recomienda un mínimo de 24-32 GB para trabajar con capturas de 1280x720.
- VRAM estimada en 8 bits: aproximadamente 10-12 GB de pesos, más el sobrecoste de activaciones; en 4 bits, en torno a 5-7 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no valores publicados por el autor para esta variante.
- GPU recomendadas: H200 (configuración usada en el benchmark de latencia del autor), H100 y A100 40/80 GB para producción con margen holgado.
- GPU de consumo: una RTX 4090 de 24 GB queda muy justa en bf16 con imágenes de alta resolución; resulta viable si se cuantiza a 8 o 4 bits. Una RTX 3090 de 24 GB presenta una situación similar.
- Despliegue: la vía documentada es `pip install git+https://github.com/OmniJev/OneJev.git` seguido de `qev serve --model OmniJev/OneJev-9B`, que expone un servidor compatible con la API System One de TypeSafe más un campo `media`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 81 ms para una pregunta y 131 ms para diez preguntas en una sola petición sobre una H200 con captura de 1280x720, lo que equivale a 13,1 ms por pregunta en el caso agregado y aproximadamente 12,3 peticiones de una pregunta por segundo por GPU en ese escenario.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Pesos | Licencia | Enfoque |
|---|---|---|---|---|---|
| OneJev-9B | Qwen3.5-9B | 9,4B | 18,8 GB | Apache 2.0 | Decisión multimodal calibrada, System One |
| OneJev-4B | Qwen3.5-4B | No disponible | 10,4 GB | Apache 2.0 (según colección) | Decisión multimodal calibrada |
| OneJev-0.8B | Qwen3.5-0.8B | No disponible | 2,2 GB | Apache 2.0 (según colección) | Decisión multimodal calibrada |
| OneJev-27B | Qwen3.8-27B | No disponible | 54,7 GB | Apache 2.0 (según colección) | Decisión multimodal calibrada |
| OneJev-27B-FP8 | OneJev-27B | No disponible | 30,4 GB | Apache 2.0 (según colección) | Igual que 27B, cuantizado a 8 bits |
| Qwen3.5-9B | No disponible | No disponible | No disponible | No disponible | Modelo base multimodal generativo |
| Jev-Omni 12B | No disponible | 12B (según denominación) | No disponible | No disponible | Decisión multimodal, comparado en la tabla del autor |
| Qwen3.8-27B thinking | No disponible | 27B (según denominación) | No disponible | No disponible | Modelo generativo con modo de razonamiento, comparado en la tabla del autor |

La longitud de contexto y los resultados comparativos numéricos no están disponibles en formato textual. Jev 1.13, mencionado en la tabla del autor, opera únicamente sobre texto.

## Limitaciones y advertencias

- El modelo no genera texto libre: su salida son probabilidades sobre opciones predefinidas, por lo que no puede usarse como asistente conversacional ni como generador de código.
- No hay información publicada sobre sesgos, composición demográfica del dataset ni comportamiento diferencial por idioma; los idiomas soportados no están declarados.
- La calibración de las probabilidades se ha evaluado sobre el test set propio del autor; en dominios distintos (capturas de aplicaciones no representadas, vídeo industrial, resoluciones atípicas) la calibración puede degradarse y conviene validarla antes de fijar umbrales de producción.
- El riesgo de alucinación se manifiesta aquí como decisiones confiadas pero incorrectas sobre estados visuales ambiguos; se recomienda usar umbrales de confianza y derivar los casos de baja probabilidad a revisión humana.
- La longitud de contexto no está documentada, lo que dificulta planificar entradas con muchas imágenes, vídeos largos o historiales extensos de estado.
- No se documenta compatibilidad con los runners de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue a la herramienta `qev` del propio autor.
- El modelo cuenta con 0 descargas y 0 "likes" en HuggingFace en el momento de la consulta, con una fecha de creación de 2026-09-27, por lo que no existe un historial de uso en producción que respalde su estabilidad.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B del que deriva.
- Los requisitos de VRAM en cuantizaciones distintas de bf16 no están publicados por el autor y las cifras aquí recogidas son estimaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmniJev/OneJev-9B
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web del proyecto: https://omnijev.github.io/OneJev/
- Colección OneJev (todos los tamaños): https://huggingface.co/collections/OmniJev/onejev
- OneJev-0.8B: https://huggingface.co/OmniJev/OneJev-0.8B
- OneJev-4B: https://huggingface.co/OmniJev/OneJev-4B
- OneJev-27B: https://huggingface.co/OmniJev/OneJev-27B
- OneJev-27B-FP8: https://huggingface.co/OmniJev/OneJev-27B-FP8
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia Apache 2.0 del proyecto: https://github.com/OmniJev/OneJev/blob/main/LICENSE
- Citación (BibTeX): `@misc{onejev2026, title = {{OneJev}: A Multimodal System One Decision Model}, author = {{OmniJev Team}}, year = {2026}, howpublished = {\url{https://github.com/OmniJev/OneJev}}}`
