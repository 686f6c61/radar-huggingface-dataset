# Djanghao/Widget2Code-Qwen3.5-4B-Full-SFT

## Resumen

Widget2Code-Qwen3.5-4B-Full-SFT es un modelo de visión-lenguaje desarrollado por Djanghao que convierte capturas de pantalla de interfaces de usuario en código React JSX autocontenido. Se trata de un fine-tuning completo (full SFT) sobre el modelo base Qwen/Qwen3.5-4B, con la torre de visión congelada y solo la parte de lenguaje entrenada. El modelo está pensado para tareas de screenshot-to-code, donde recibe una imagen junto con metadatos deterministas (dimensiones, resultados de OCR y paleta de colores) y genera un componente JSX listo para renderizar.

El checkpoint, de 4.539.265.536 parámetros (~4,5B) en precisión BF16, fue entrenado durante una época sobre 1.816 pares imagen-código del dataset público Djanghao/Widget2Code-Data. Aunque el modelo base Qwen3.5-4B es un modelo multimodal de propósito general, este fine-tuning lo especializa exclusivamente en la generación de widgets de interfaz. Su relevancia radica en ofrecer una alternativa ligera y open-source para automatizar la conversión de diseños visuales a código, con resultados publicados por el autor que alcanzan un 86,2% de éxito de renderizado en un split de prueba de 1.000 imágenes.

El modelo se distribuye bajo licencia "other" (no estándar), por lo que es necesario revisar los términos específicos del autor antes de un uso comercial. Está disponible en formato safetensors y es compatible con el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.5-4B, con torre de visión congelada |
| Parametros totales | 4.539.265.536 (~4,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (pesos completos); otras cuantizaciones no documentadas |
| Idiomas soportados | No disponibles |
| Licencia | other (especifica del autor, revisar términos) |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un modelo de lenguaje multimodal de la familia Qwen3.5 que integra un codificador visual y un decodificador de lenguaje basado en transformer. En este fine-tuning, la torre de visión se mantuvo congelada y solo se entrenaron los pesos del modelo de lenguaje mediante SFT completa (full-weight SFT), es decir, no se usaron adaptadores PEFT. El entrenamiento se realizó sobre 1.816 ejemplos pareados de imagen y código JSX, con una sola época, una tasa de aprendizaje de 1e-5, tamaño de batch efectivo de 16 y semilla 42. Los pesos se guardaron en BF16.

El objetivo del entrenamiento es que el modelo aprenda a generar un componente React JSX autocontenido a partir de una captura de pantalla y un contexto determinista que incluye dimensiones, resultados de OCR y paleta de colores. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un fine-tuning supervisado clásico. La innovación principal no está en la arquitectura (que hereda de Qwen3.5) sino en la tarea específica y el diseño del dataset, que condiciona la generación de código a partir de señales visuales y metadatos.

## Capacidades

- Generación de código React JSX autocontenido a partir de una imagen de interfaz de usuario.
- Interpretación de contexto adicional: dimensiones, resultados de OCR y paleta de colores proporcionados como entrada.
- Entrada multimodal: acepta imágenes y texto (la imagen es el elemento principal, el texto puede incluir instrucciones o metadatos).
- Inferencia directa screenshot-to-code sin necesidad de pasos intermedios.
- Inicialización para experimentos de RL (el autor menciona su uso como punto de partida para DAPO/GRPO).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso más allá de la generación de código.
- No se especifican capacidades multilingües; el código generado es JSX, independiente del idioma natural.

## Casos de uso

- Prototipado rápido de interfaces: un diseñador sube una captura de un mockup y el modelo genera el componente JSX base, que luego se puede integrar en un proyecto React para iterar sobre él.
- Automatización de conversión de diseños a código en equipos de frontend: en lugar de transcribir manualmente cada pantalla, el modelo produce una primera versión del componente, reduciendo el tiempo de desarrollo inicial.
- Generación de componentes para sistemas de diseño: a partir de capturas de componentes aislados (botones, tarjetas, formularios), el modelo puede crear versiones JSX reutilizables que sigan las convenciones del equipo.
- Testing visual y de regresión: dado un screenshot de una interfaz, se puede generar el código correspondiente y compararlo con el código real para detectar discrepancias o cambios no deseados.
- Asistencia a desarrolladores con discapacidad visual: un desarrollador que no puede ver la pantalla puede proporcionar una captura y obtener el código JSX, facilitando la accesibilidad en el flujo de trabajo.
- Educación y documentación: para explicar cómo se estructura una interfaz, se puede convertir una captura en código JSX comentado, sirviendo como material didáctico en cursos de React.
- Integración en pipelines de CI/CD: el modelo puede usarse para validar que un diseño aprobado se corresponde con el código implementado, generando el JSX esperado y comparándolo con el real.

## Benchmarks y rendimiento

El autor publica resultados sobre un split de prueba de 1.000 imágenes del dataset Widget2Code, con temperatura 0.7, penalización de repetición 1.1 y límite de 10.000 tokens:

| Metrica | Valor |
|---|---|
| Render success (porcentaje de códigos que renderizan sin error) | 86,2% (862/1.000) |
| SSIM medio entre salidas renderizadas | 0,7080 |
| SSIM medio con fallos de render puntuados como cero | 0,6103 |

Estos resultados describen una ejecución de evaluación concreta y no son una afirmación de corrección general en frontend. No se proporcionan comparaciones con otros modelos screenshot-to-code ni benchmarks estándar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 y 4,5B parámetros, se necesitan aproximadamente 9 GB de VRAM solo para los pesos. Añadiendo activaciones y overhead, se recomienda al menos 12 GB para una inferencia cómoda.
- GPU recomendadas: una RTX 3090 (24 GB) o RTX 4090 (24 GB) son suficientes; también puede ejecutarse en GPUs de 16 GB como la RTX 4080 o A4000, aunque con menor margen.
- En GPUs de consumo: sí, cabe en tarjetas de gama alta para consumidores. En tarjetas de 8 GB (como RTX 3060 Ti) podría ser ajustado, pero no se garantiza.
- Opciones de despliegue: al ser un modelo Transformers estándar, se puede servir con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También es posible ejecutarlo localmente con `transformers` y `accelerate`.
- Latencia y throughput: no se han publicado datos. En una RTX 4090, se espera una generación de código de 100-200 tokens por segundo, dependiendo de la longitud de la salida.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (screenshot-to-code con generación de JSX). El modelo base Qwen3.5-4B es un modelo multimodal generalista, pero no está especializado en esta tarea. Otras alternativas comerciales como GPT-4V o Claude 3.5 pueden generar código a partir de imágenes, pero no son open-source y sus pesos no están disponibles. Dado que no hay datos de benchmarks comparativos, se indica que la comparativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Widget2Code-Qwen3.5-4B | ~4,5B | No disponible | other | Abierta (HuggingFace) |
| Qwen3.5-4B (base) | ~4,5B | No disponible | Apache 2.0 (presumiblemente) | Abierta |
| GPT-4V (comercial) | No público | No público | Propietaria | API de pago |

## Limitaciones y advertencias

- El modelo genera código que puede ser inválido o inseguro; el autor advierte explícitamente que debe ejecutarse en un renderizador sandbox y nunca en un entorno privilegiado.
- El entrenamiento se realizó sobre solo 1.816 ejemplos, lo que limita la generalización a diseños muy variados o complejos. El rendimiento en capturas fuera del dominio del dataset puede degradarse.
- No se han documentado sesgos específicos, pero al ser un fine-tuning de un modelo base, puede heredar sesgos de Qwen3.5. No hay evaluación de sesgos ni de seguridad.
- La licencia "other" no es una licencia estándar open-source; es necesario contactar al autor o revisar los términos del repositorio para conocer las restricciones de uso comercial y redistribución.
- No se especifica la longitud de contexto, por lo que no se sabe si puede manejar imágenes grandes o descripciones largas de forma fiable.
- El modelo está especializado en React JSX; no sirve para otros frameworks o lenguajes sin un fine-tuning adicional.
- Los resultados de SSIM (0,7080) indican que la similitud estructural entre la imagen original y el render del código generado es moderada; no es una réplica exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Djanghao/Widget2Code-Qwen3.5-4B-Full-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/Djanghao/Widget2Code-Data
- Repositorio de código (GitHub): https://github.com/Djanghao/widget2code-sft
- Colección Qwen3.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen35
- Blog de Qwen3.5 (anuncio oficial): https://qwen.ai/blog?id=qwen3.5
- Página de Qwen3.5-4B en Ollama: https://ollama.com/library/qwen3.5:4b
