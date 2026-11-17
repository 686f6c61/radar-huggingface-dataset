# CaptchaKraken/AbyssV2-LoRA

## Resumen

AbyssV2-LoRA es un adaptador LoRA publicado por el usuario CaptchaKraken sobre el modelo base Qwen/Qwen3.5-4B. Por las etiquetas del repositorio (captcha, captchakraken, pointer) y el nombre del autor, el adaptador está orientado a la resolución automática de captchas, presumiblemente mediante un mecanismo de señalización o localización de elementos (pointer) sobre imágenes o interfaces. El repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño de 0,4 GB, lo que es coherente con un LoRA de rango moderado sobre un modelo de 4 mil millones de parámetros.

El modelo base declarado, Qwen3.5-4B, pertenece a la familia Qwen de Alibaba; sin embargo, no se dispone de información verificable en la documentación proporcionada sobre las características exactas de esa versión concreta (contexto, arquitectura interna o datos de entrenamiento). La ficha se limita, por tanto, a lo que puede inferirse de los metadatos del repositorio y a las características generales atribuibles al base.

La relevancia de este adaptador es limitada y muy específica: se trata de un fine-tuning de nicho, con cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y sin documentación publicada. No debe considerarse un modelo de propósito general, sino un componente experimental para pipelines de resolución de captchas que requieran un modelo de 4B con capacidad de localización visual o textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (base Qwen/Qwen3.5-4B) |
| Parametros totales | No disponible (el adaptador ocupa 0,4 GB; el base se declara como 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-4B, no documentada en el repo) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de la familia Qwen) |
| Idiomas soportados | No disponibles |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones del modelo base Qwen/Qwen3.5-4B. No se especifican en la información disponible el rango, el alpha, las capas objetivo ni la estrategia de fusión. Tampoco se documentan los datos de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni sobre si el ajuste se realizó con supervisión (SFT) sobre pares imagen-respuesta o texto-respuesta.

Las etiquetas del repositorio sugieren una tarea de tipo pointer, probablemente orientada a predecir coordenadas o regiones sobre una captura de pantalla o imagen de captcha. No obstante, al no publicarse model card, configuración de entrenamiento ni ejemplos de inferencia, esta interpretación no puede confirmarse. No se han identificado innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.) asociadas al adaptador.

## Capacidades

- Ajuste específico para tareas de captcha, según las etiquetas del repositorio (captcha, captchakraken).
- Posible capacidad de señalización o localización (pointer) sobre imágenes o elementos de interfaz, inferida del tag pointer; no verificada.
- Capacidades generales de generación de texto, razonamiento y código heredadas del base Qwen3.5-4B, no documentadas ni evaluadas para este adaptador.
- Soporte de tool calling / function calling: no disponible para el adaptador; dependería del base y no está documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Resolución automatizada de captchas en pipelines de pruebas de integración: el adaptador podría emplearse para identificar y señalar el elemento solicitado en captchas de tipo pointer o selección de imágenes, integrándose como paso previo a un script de test end-to-end. La idoneidad es plausible por el nombre y las etiquetas, pero no está validada por el autor.
- Automatización de QA sobre interfaces web: si el adaptador funciona como localizador visual, podría usarse para señalar botones o regiones en capturas de pantalla durante pruebas de regresión, combinado con un modelo de visión que aporte la descripción del objetivo.
- Extracción de coordenadas en tareas de grounding ligero: el tag pointer sugiere la posibilidad de devolver posiciones sobre una imagen; se usaría en pipelines donde un modelo de 4B sea suficiente y no se quiera desplegar un VLM mayor.
- Prototipado de investigación en seguridad de captchas: útil para estudiar la robustez de esquemas de verificación frente a modelos pequeños ajustados, siempre que se respeten las condiciones de uso y la legalidad aplicable.
- Evaluación comparativa de adaptadores LoRA sobre Qwen3.5-4B: sirve como caso de estudio de fine-tuning de nicho con licencia LGPL-3.0 y acceso restringido.
- Base para un servicio de inferencia con vLLM: la etiqueta vllm indica compatibilidad prevista con ese motor, lo que permitiría desplegar el base más el adaptador en un servidor con GPU consumer de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el base de 4B requiere aproximadamente 8 GB en FP16, 4-5 GB en cuantización de 8 bits y 2,5-3 GB en 4 bits, según estimaciones habituales para modelos de ese tamaño.
- GPU recomendadas: no disponibles para este adaptador; para el base de 4B son suficientes una RTX 3060 de 12 GB, RTX 4070, RTX 4090, A10G o A100 en despliegues concurrentes.
- Cabe en GPU consumer: sí, el base de 4B cabe en GPUs consumer con 8 GB o más en cuantización de 4-8 bits; el adaptador añade un consumo marginal (0,4 GB en el repositorio).
- Opciones de despliegue: vLLM (etiqueta del repo), llama.cpp/Ollama y TGI mediante conversión del adaptador a GGUF o carga del par base+LoRA; no hay instrucciones publicadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbyssV2-LoRA | Adaptador sobre 4B | No disponible | Captcha / pointer | LGPL-3.0 | Gated, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible en esta ficha | Propósito general | Según el repositorio del base | Público (referencia) |
| Adaptadores LoRA de nicho para captchas | Variable | Variable | Captcha | Variable | No disponible comparativa fiable |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentación sobre datos de entrenamiento, hiperparámetros del LoRA ni evaluación, lo que impide validar su comportamiento.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso en entornos automatizados y en producción.
- Licencia LGPL-3.0: impone obligaciones de copyleft débil sobre el adaptador y posibles obligaciones de distribución del código modificado; debe revisarse con asesoría legal antes de uso comercial.
- Riesgo de alucinación y de falsos positivos en la localización de elementos, especialmente si el adaptador se aplica fuera del dominio de captchas para el que fue ajustado.
- Idiomas no declarados: no puede garantizarse un comportamiento multilingüe correcto.
- Sesgos desconocidos: al no publicarse la composición del dataset, no es posible evaluar sesgos de género, raza, idioma o geografía.
- Uso ético y legal: la resolución automatizada de captchas puede vulnerar los términos de servicio de sitios web y, en algunas jurisdicciones, normativa sobre acceso no autorizado a sistemas; su uso en producción debe limitarse a entornos propios o con autorización expresa.
- Sin métricas de rendimiento publicadas: no hay evidencia de que supere a un VLM genérico en la tarea declarada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CaptchaKraken/AbyssV2-LoRA
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/CaptchaKraken
