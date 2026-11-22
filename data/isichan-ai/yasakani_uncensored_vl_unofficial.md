# isichan-ai/YASAKANI_Uncensored_VL_Unofficial

## Resumen

YASAKANI_Uncensored_VL_Unofficial es una conversión no oficial de los pesos de huihui-ai/Huihui-Qwen3.8-27B-abliterated al formato del motor de inferencia YASAKANI, publicada por el usuario isichan-ai. El paquete incluye los pesos en GGUF y el proyector multimodal `mmproj-Qwen3.8-27B-BF16.gguf`, lo que habilita entrada de imagen además de texto. Está pensado para ejecutarse tal cual sobre YASAKANI 0.1.3 mediante el comando `yasakani serve --model-dir`.

El modelo hereda la arquitectura y el entrenamiento del Qwen3.8-27B original, pero con el proceso de "abliteración" aplicado por huihui-ai, que reduce los rechazos y el filtrado de seguridad en las respuestas. El autor declara explícitamente que el filtrado de seguridad está reducido y que la responsabilidad del uso recae en el usuario. La licencia declarada es Apache-2.0.

La relevancia de esta ficha es doble: por un lado documenta un caso de conversión de un modelo de 27B con capacidades de visión a un motor propietario de terceros; por otro, advierte de las inconsistencias entre los metadatos publicados (parámetros en safetensors, tamaño del repositorio, idiomas) que conviene verificar antes de desplegarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen3.8-27B; el autor no la detalla) |
| Parámetros totales | 460.730.096 según safetensors del repo; el nombre del modelo base indica 27B (dato contradictorio, ver limitaciones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repo incluye pesos GGUF y el proyector `mmproj-Qwen3.8-27B-BF16.gguf` en BF16); no se detallan los niveles de cuantización del modelo principal |
| Idiomas soportados | no disponible (la model card está en inglés y japonés; no se declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos principales y proyector multimodal) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo base declarado es huihui-ai/Huihui-Qwen3.8-27B-abliterated, del que se heredan la arquitectura transformer y el entrenamiento original de Qwen3.8-27B; la variante de huihui-ai aplica una técnica de abliteración que modifica los pesos para atenuar la dirección de rechazo aprendida, reduciendo el filtrado de seguridad en las respuestas.

La contribución de isichan-ai se limita a la conversión de esos pesos al formato del motor YASAKANI mediante la herramienta oficial de conversión, más la inclusión del proyector multimodal en BF16 para habilitar la entrada de imagen. No se documentan tokens de entrenamiento, composición del dataset, ni etapas de RLHF o DPO adicionales. Tampoco se especifican innovaciones técnicas propias del motor YASAKANI en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B.
- Entrada de imagen: el repositorio incluye `mmproj-Qwen3.8-27B-BF16.gguf`, que se activa con los parámetros `--mmproj`, `--llama-dir` y `--vision-model` del motor YASAKANI.
- Razonamiento y conocimiento general: presumiblemente equivalente al modelo base, aunque no se aportan evaluaciones que lo confirmen.
- Generación de código y matemáticas: capacidad esperable del modelo base, sin datos de benchmark en la información disponible.
- Multilingüismo: no se declara lista de idiomas; la model card está redactada en inglés y japonés.
- Tool calling y function calling: no disponible en la documentación.
- Modo agente o razonamiento multi-paso: no disponible en la documentación.
- Filtrado de seguridad reducido por diseño (variante abliterated): el modelo tiende a aceptar peticiones que el original rechazaría.

## Casos de uso

- Inferencia local con el motor YASAKANI: el caso de uso principal y documentado. Se despliega con `yasakani serve --model-dir <carpeta> --dll <ruta>\engine\yskn.dll`, lo que permite servir el modelo en una máquina con GPU de 24 GB o más (probado en RTX 5090).
- Análisis de imágenes con descripción textual: gracias al proyector multimodal incluido, se puede alimentar una imagen junto a una pregunta y obtener una respuesta en lenguaje natural, útil para etiquetado asistido o extracción de información de capturas y documentos escaneados.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, sirve para estudiar cómo cambia la tasa de rechazo y el comportamiento ante prompts sensibles respecto al modelo original, en entornos controlados.
- Prototipado de asistentes conversacionales sin restricciones de contenido: para equipos que necesitan un modelo que no bloquee respuestas en dominios como ficción, narrativa adulta o análisis de contenido sensible, asumiendo la responsabilidad legal del uso.
- Evaluación de motores de inferencia alternativos: permite comparar el rendimiento de YASAKANI frente a llama.cpp, vLLM u Ollama con el mismo conjunto de pesos, útil para decidir el stack de despliegue.
- Verificación de integridad de conversiones: el repositorio incluye `files/selfcheck.json` y el comando `yasakani selfcheck`, lo que facilita validar que la conversión de pesos no ha corrompido el modelo antes de integrarlo en un pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen de comparación (`media/compare_yasakani_v11_2026-11-15.png`) cuyo contenido numérico no se detalla en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El autor indica que se probó en una RTX 5090 y espera 24 GB o más, lo que sugiere que el modelo completo en BF16 no cabe en GPUs de consumo de gama media y requiere cuantización para hardware menor.
- GPU recomendadas: RTX 5090 (probada por el autor); por tamaño del modelo base (27B), son razonables A100 40/80 GB, H100 y RTX 4090 24 GB con cuantización agresiva, aunque no se confirma en la documentación.
- GPU de consumo: posible en RTX 4090/5090 de 24 GB si se usan cuantizaciones GGUF de 4-5 bits del modelo principal; no confirmado por el autor.
- Opciones de despliegue: motor YASAKANI 0.1.3 (soporte oficial de este paquete). Al estar en formato GGUF, es plausible su uso con llama.cpp u Ollama, pero no está documentado ni probado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YASAKANI_Uncensored_VL_Unofficial | 27B (según nombre del base; 460M según safetensors) | no disponible | Sí (mmproj BF16) | Apache-2.0 | GGUF en HF, motor YASAKANI |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | no disponible | no disponible en esta ficha | Pesos originales en HF |
| Qwen3.8-27B (original) | 27B | no disponible | no disponible | no disponible en esta ficha | Pesos originales en HF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Inconsistencia de metadatos: el campo de parámetros en safetensors indica 460.730.096, mientras que el nombre del modelo base sugiere 27B. Esta discrepancia debe resolverse antes de planificar el hardware; probablemente el safetensors corresponde a un componente auxiliar (proyector) y no al modelo completo.
- Filtrado de seguridad reducido: la variante abliterated elimina parte de los rechazos del modelo original. El autor advierte explícitamente de que el usuario es responsable del uso de las salidas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser una modificación de pesos, puede degradar ligeramente la coherencia respecto al original.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base y la variante de huihui-ai pueden tener condiciones adicionales que conviene revisar en sus respectivas model cards (`LICENSE` y `NOTICE` incluidos en el repo).
- Compatibilidad limitada: el paquete está pensado para YASAKANI 0.1.3; no se garantiza su funcionamiento en otras versiones del motor ni en otros runtimes sin conversión adicional.
- Idiomas: no se declara cobertura lingüística; el rendimiento en castellano no está verificado.
- Estado "no oficial": no está afiliado a los autores de YASAKANI, Qwen ni huihui-ai, por lo que no hay soporte oficial ni garantías de mantenimiento.
- Contexto: se desconoce la longitud máxima soportada, lo que impide planificar casos de uso con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isichan-ai/YASAKANI_Uncensored_VL_Unofficial
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Motor YASAKANI: https://github.com/yasakani-dev/yasakani
