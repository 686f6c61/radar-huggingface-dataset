# nuvais/darbi-oryx-ig-endpoint

## Resumen

`nuvais/darbi-oryx-ig-endpoint` no es un modelo de pesos, sino un *custom handler* para Hugging Face Inference Endpoints que sirve el LoRA de generación de imágenes culturalmente alineado `QCRI/Fanar-2-Oryx-IG` sobre su modelo base `black-forest-labs/FLUX.1-schnell`. El repositorio lo publica el usuario `nuvais` y no contiene pesos: el handler descarga en el arranque tanto el modelo base como el adaptador LoRA, con las versiones que el autor declara haber probado (diffusers 0.37.1, peft 0.18.1).

El objetivo es empaquetar en un único endpoint desplegable la cadena FLUX.1-schnell + LoRA Fanar-2-Oryx-IG, de modo que un cliente pueda enviar un prompt de texto y recibir una imagen codificada en base64. El caso de uso declarado es el "prompt lab" del producto Darbi (دربي), donde un estudiante escribe un prompt, Darbi lo puntúa y Oryx dibuja la versión mejorada. Se enmarca en el hackathon Qai x Hugging Face Hackathon 01 celebrado en Doha.

La relevancia es acotada y muy específica: no aporta arquitectura ni entrenamiento propios, sino una capa de integración reproducible sobre FLUX.1-schnell (Apache 2.0, con acceso restringido en su repositorio original) y un LoRA de QCRI orientado a alineamiento cultural. Cualquier evaluación de calidad de imagen debe atribuirse al modelo base y al LoRA, no a este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en este repositorio (handler de inferencia); el modelo servido es FLUX.1-schnell con un LoRA de QCRI |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; el prompt de texto no se define por ventana de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No se almacenan pesos en el repositorio; se descargan en el arranque del endpoint (modelo base y LoRA) |
| Pipeline | text-to-image |
| Dependencias declaradas | diffusers 0.37.1, peft 0.18.1 |
| Modelos base | black-forest-labs/FLUX.1-schnell, QCRI/Fanar-2-Oryx-IG |
| Formato de salida | JPEG en base64 |
| Parametros de inferencia expuestos | width, height, steps, seed |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-06 |

## Arquitectura y entrenamiento

Este repositorio no define arquitectura ni proceso de entrenamiento: es un *custom handler* para Inference Endpoints. La arquitectura efectiva es la del modelo servido, FLUX.1-schnell, un modelo de difusión texto-a-imagen de la familia FLUX de Black Forest Labs, sobre el que se aplica el adaptador LoRA `QCRI/Fanar-2-Oryx-IG` mediante PEFT. No se proporcionan en la información disponible detalles sobre el número de parámetros, la composición del dataset de entrenamiento del LoRA, ni si hubo etapas de ajuste por preferencias.

El handler descarga ambos artefactos al iniciar el endpoint y fija versiones concretas de las librerías (diffusers 0.37.1, peft 0.18.1), lo que constituye la única garantía de reproducibilidad declarada. El ejemplo de la model card usa 4 pasos de muestreo, coherente con la naturaleza destilada de FLUX.1-schnell, y una resolución de 768x768. El acceso al modelo base está restringido (gated), por lo que el token del endpoint debe haber aceptado previamente sus términos.

## Capacidades

- Generación de imágenes a partir de prompts de texto, devueltas como JPEG en base64.
- Control de resolución de salida mediante los parámetros `width` y `height`.
- Control del número de pasos de muestreo mediante `steps` (el ejemplo usa 4).
- Reproducibilidad mediante `seed`, que se devuelve en la respuesta junto con las dimensiones.
- Alineamiento cultural del LoRA Fanar-2-Oryx-IG según la descripción de QCRI (orientado a contextos culturales, con el ejemplo de Souq Waqif en la model card).
- Integración como Inference Endpoint compatible con el esquema `inputs` / `parameters`.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking".

## Casos de uso

- Laboratorio de prompts educativos: el handler expone un endpoint estable que recibe el prompt mejorado por el sistema Darbi y devuelve la imagen, con `seed` fija para poder comparar iteraciones del mismo alumno sobre una misma composición.
- Generación de ilustraciones con sensibilidad cultural: el LoRA de QCRI permite producir imágenes de escenas y motivos regionales (por ejemplo, un halconero en Souq Waqif) donde un FLUX.1-schnell sin adaptar tendería a sesgos visuales occidentales.
- Prototipado rápido de interfaces texto-a-imagen: al ser un endpoint HTTP con entrada y salida JSON simples, se integra en frontends web o móviles sin gestionar pesos ni GPU localmente.
- Pruebas A/B de prompts: el parámetro `seed` y la respuesta que lo devuelve permiten mantener constante la semilla y variar únicamente el texto para medir el efecto del prompt.
- Generación por lotes a baja latencia: los 4 pasos de muestreo del ejemplo reducen el coste por imagen, adecuado para previsualizaciones o borradores que luego se refinan.
- Demostraciones y hackathons: el repositorio sirve como plantilla de *custom handler* para desplegar una cadena base + LoRA en Inference Endpoints sin publicar pesos.
- Evaluación de alineamiento cultural de modelos generativos: permite comparar la salida del LoRA frente al modelo base con el mismo prompt y semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base FLUX.1-schnell y del adaptador LoRA, no del handler.
- GPU recomendadas: no disponible. No se especifican GPU concretas (A100, H100, RTX 4090 u otras) para este endpoint.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: Hugging Face Inference Endpoints con *custom handler* (opción declarada). No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión texto-a-imagen.
- Latencia y throughput: no disponibles. El ejemplo de la model card fija 4 pasos y 768x768, pero no se publican tiempos de ejecución.
- Requisito operativo: el token del endpoint debe haber aceptado los términos del modelo base restringido `black-forest-labs/FLUX.1-schnell`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nuvais/darbi-oryx-ig-endpoint | Handler de endpoint sobre FLUX.1-schnell + LoRA QCRI | No disponible | No aplica | Apache 2.0 | Repositorio público, sin pesos; 0 descargas |
| black-forest-labs/FLUX.1-schnell | Modelo de difusión texto-a-imagen | No disponible en la información proporcionada | No aplica | Apache 2.0 (acceso restringido) | Repositorio oficial, gated |
| QCRI/Fanar-2-Oryx-IG | LoRA de alineamiento cultural sobre FLUX.1-schnell | No disponible en la información proporcionada | No aplica | No disponible en la información proporcionada | Repositorio de QCRI en Hugging Face |

No se dispone de datos de rendimiento comparado (FID, CLIP score u otras métricas) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos ni artefactos de entrenamiento; cualquier uso requiere descargar el modelo base y el LoRA en tiempo de arranque, lo que añade latencia de inicio y dependencia de red.
- El modelo base FLUX.1-schnell está restringido (gated); si el token del endpoint no ha aceptado sus términos, el handler fallará al descargar.
- La reproducibilidad depende de las versiones fijadas (diffusers 0.37.1, peft 0.18.1); cambios en el entorno pueden alterar resultados.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión: anatomía incorrecta, texto ilegible en la imagen y sesgos de representación.
- Sesgos conocidos: no documentados en la información disponible; el propósito declarado del LoRA es mitigar sesgos culturales, pero no se aportan evaluaciones que lo cuantifiquen.
- Idiomas soportados: no disponibles; no se especifica el comportamiento con prompts en árabe, castellano u otras lenguas.
- Licencia Apache 2.0 para el handler, pero el uso comercial efectivo queda condicionado por las licencias y términos del modelo base y del LoRA, que deben verificarse por separado.
- Sin descargas ni likes y creado y actualizado el mismo día: no hay evidencia de uso en producción ni de mantenimiento.
- El esquema de entrada y salida es específico del handler (`inputs` + `parameters`; respuesta con `image`, `seed`, `width`, `height`), no necesariamente compatible con otros clientes texto-a-imagen.

## Enlaces

- Repositorio del handler: https://huggingface.co/nuvais/darbi-oryx-ig-endpoint
- Modelo base FLUX.1-schnell: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- LoRA Fanar-2-Oryx-IG de QCRI: https://huggingface.co/QCRI/Fanar-2-Oryx-IG
- Documentación de modelos externos en Databricks on AWS (referencia de despliegue de endpoints): https://docs.databricks.com/aws/en/machine-learning/foundation-models/external-models/
- Resumen sobre sistemas multimodales Oryx: https://www.emergentmind.com/topics/oryx
