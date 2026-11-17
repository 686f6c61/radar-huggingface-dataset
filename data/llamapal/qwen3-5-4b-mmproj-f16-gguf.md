# LlamaPal/Qwen3.5-4B-mmproj-F16-GGUF

## Resumen

`LlamaPal/Qwen3.5-4B-mmproj-F16-GGUF` es un repositorio espejo que contiene el fichero `mmproj-F16.gguf`, el adaptador de proyección multimodal (vision projector) necesario para que el modelo de lenguaje Qwen3.5 4B pueda procesar imágenes en llama.cpp. No es un modelo de lenguaje completo: es un componente auxiliar de 672 MB que se carga junto al modelo principal mediante el parámetro `--mmproj` de llama.cpp. El autor, LlamaPal, lo publica como dependencia de su aplicación Android de inferencia offline.

El modelo base es Qwen3.5-4B, desarrollado por el equipo Qwen de Alibaba. La relevancia de este repositorio es práctica: permite habilitar capacidades de visión (image-text-to-text) en dispositivos Android mediante la app LlamaPal, sin conexión a internet ni cuentas de usuario, manteniendo la licencia Apache 2.0 del modelo original.

El fichero es una copia byte a byte del `mmproj-F16.gguf` publicado por unsloth en `unsloth/Qwen3.5-4B-GGUF` (commit `e87f176479d0`), con el mismo hash SHA-256. El repositorio no introduce modificaciones ni cuantizaciones propias; su función es servir de espejo estable para la app.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) para Qwen3.5-4B; arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 333.514.240 (dato del repositorio, safetensors del modelo base referenciado) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (unico fichero publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mmproj-F16.gguf`, 672 MB) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente el fichero de proyección multimodal (mmproj) que acompaña al modelo Qwen3.5-4B en su variante GGUF. En el ecosistema llama.cpp, el mmproj es la red que transforma los embeddings visuales del codificador de imagen en el espacio de tokens del modelo de lenguaje, permitiendo el pipeline image-text-to-text. La arquitectura concreta del proyector (tipo MLP, cross-attention u otra), el codificador visual asociado y los detalles de entrenamiento no se detallan en la información proporcionada.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset multimodal ni si hubo fases de alineación (RLHF/DPO) específicas para visión. El fichero es una copia sin modificar del publicado por unsloth, por lo que cualquier detalle técnico adicional debe consultarse en el repositorio original `unsloth/Qwen3.5-4B-GGUF` o en la model card de `Qwen/Qwen3.5-4B`.

## Capacidades

- Proyección de embeddings visuales al espacio de tokens del modelo Qwen3.5-4B, habilitando entrada de imagen junto a texto.
- Pipeline image-text-to-text: descripción de imágenes, respuesta a preguntas sobre contenido visual y conversación multimodal.
- Integración con llama.cpp mediante el parámetro `--mmproj`.
- Uso en dispositivos Android a través de la app LlamaPal, con inferencia completamente offline.
- No incluye capacidades de generación de texto por sí mismo: requiere el modelo de lenguaje Qwen3.5-4B cargado en paralelo.
- Soporte de tool calling, agentes, matemáticas o código: no disponible en esta información (depende del modelo base, no del mmproj).

## Casos de uso

- Asistencia visual offline en Android: combinado con Qwen3.5-4B en llama.cpp, permite describir fotos o responder preguntas sobre imágenes sin enviar datos a ningún servidor, adecuado para entornos con requisitos de privacidad.
- Accesibilidad en movilidad: lectura de documentos, etiquetas o señales mediante la cámara del teléfono y respuesta hablada o escrita, gracias a la inferencia local del conjunto modelo + mmproj.
- Verificación de imágenes en campo: técnicos que necesitan identificar componentes, errores o estados a partir de una foto en zonas sin cobertura, usando el pipeline image-text-to-text en el dispositivo.
- Prototipado de aplicaciones multimodales: desarrolladores que integran llama.cpp en apps Android pueden usar este mmproj como dependencia directa para habilitar visión sin reentrenar ni convertir pesos.
- Educación y estudio: explicación de diagramas, gráficos o figuras en un teléfono sin conexión, con el modelo base aportando el razonamiento textual.
- Automatización de clasificación visual ligera: etiquetado o descripción de imágenes en pipelines locales de bajo coste donde no se requiere un servidor GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para el mmproj: aproximadamente 672 MB en F16 para el fichero de proyección, adicionales a la memoria requerida por el modelo de lenguaje Qwen3.5-4B.
- El modelo base Qwen3.5-4B en cuantizaciones habituales (Q4_K_M, Q5_K_M, Q8_0) requiere varios GB de RAM; la cifra exacta no está disponible en esta información.
- GPU recomendadas: no disponible para el mmproj de forma aislada; el conjunto depende del modelo base. En escritorio, GPU con suficiente VRAM para el modelo cuantizado; en Android, SoC con RAM unificada suficiente (no se especifican modelos de dispositivo).
- Cabe en GPU de consumo si el modelo base cuantizado cabe; el mmproj añade ~0,7 GB.
- Opciones de despliegue: llama.cpp (con `--mmproj`), app LlamaPal en Android. Compatibilidad con vLLM, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / repositorio | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LlamaPal/Qwen3.5-4B-mmproj-F16-GGUF | mmproj GGUF (espejo) | 333.514.240 (segun repo) | no disponible | Apache 2.0 | Hugging Face |
| unsloth/Qwen3.5-4B-GGUF | Repo GGUF del modelo base (incluye mmproj original) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | Modelo base multimodal | 4B (nominal) | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Este repositorio no contiene un modelo autónomo: sin el modelo de lenguaje Qwen3.5-4B cargado junto al mmproj, no produce salidas de texto.
- Es un espejo sin modificaciones; cualquier error o limitación del mmproj original se hereda tal cual.
- La cuantización F16 ocupa 672 MB, lo que puede ser excesivo en dispositivos Android con poca RAM libre cuando se suma al modelo base.
- Riesgo de alucinación visual inherente al modelo base; el mmproj no corrige ni mitiga este comportamiento.
- Sesgos conocidos del modelo base no documentados en esta información; deben consultarse en la model card de Qwen.
- Idiomas soportados no especificados en este repositorio; dependen del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y del repositorio original de unsloth.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes), por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Qwen3.5-4B-mmproj-F16-GGUF
- Repositorio original del mmproj (unsloth): https://huggingface.co/unsloth/Qwen3.5-4B-GGUF/tree/e87f176479d0855a907a41277aca2f8ee7a09523
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
