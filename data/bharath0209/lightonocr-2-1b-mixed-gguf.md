# Bharath0209/lightonocr-2-1b-mixed-gguf

## Resumen

LightOnOCR-2-1B Mixed GGUF Projector es una conversión a formato GGUF del proyector multimodal (vision projector) del modelo LightOnOCR-2-1B, desarrollado originalmente por LightOn (lightonai). No se trata de un modelo completo, sino de un artefacto derivado: un fichero `mmproj` que contiene las matrices de proyección visión-lenguaje en precisión mixta (Q6_K para las matrices feed-forward de visión), pensado para usarse junto al modelo base cuantizado en llama.cpp.

El problema que resuelve es práctico: permitir ejecutar el pipeline OCR multimodal de LightOnOCR-2-1B en llama.cpp con un proyector de menor huella de memoria que la versión estándar, manteniendo la calidad de las proyecciones visuales en Q6_K. El repositorio lo publica el usuario Bharath0209 como empaquetado del proyector de ggml-org, no como un modelo entrenado desde cero.

Es relevante para quien despliegue OCR local: el modelo base declara 409.597.952 parámetros en safetensors (pese al "1B" del nombre), licencia Apache 2.0 y un tamaño de repositorio de 0,4 GB. La ficha se centra en lo que realmente contiene este repositorio y en el modelo base al que sirve.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (mmproj) para un modelo vision-lenguaje; arquitectura del modelo base no disponible en detalle |
| Parametros totales | 409.597.952 (modelo base, safetensors); el fichero de este repo es solo el proyector |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K en matrices feed-forward de visión (proyector mixto); modelo base asociado en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (mmproj) para llama.cpp |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un proyector de visión en precisión mixta. Según la model card, las matrices feed-forward de visión usan Q6_K y el proyector de origen procede del GGUF de LightOnOCR-2-1B publicado por ggml-org. El modelo base LightOnOCR-2-1B es un modelo de OCR multimodal de LightOn; los detalles de arquitectura interna, composición del dataset y proceso de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

El artefacto está pensado para combinarse con `LightOnOCR-2-1B-Q8_0.gguf` en llama.cpp con soporte para LightOnOCR. La innovación aquí es de empaquetado y cuantización, no de entrenamiento: reducir el coste del proyector manteniendo Q6_K en las capas críticas de visión.

## Capacidades

- OCR sobre imágenes: el pipeline completo (modelo base + este proyector) está orientado a extracción de texto desde imágenes.
- Procesamiento visión-lenguaje: el proyector conecta representaciones visuales con el modelo de lenguaje.
- Ejecución local en llama.cpp: compatible con el ecosistema GGUF.
- Capacidades de texto, razonamiento, código o matemáticas del modelo base: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Digitalización de documentos escaneados en local: usar el modelo base Q8_0 junto a este proyector en llama.cpp para extraer texto de PDFs e imágenes sin enviar datos a la nube.
- OCR en entornos con recursos limitados: el proyector en Q6_K reduce la huella frente a versiones de mayor precisión, útil en máquinas con VRAM ajustada.
- Pipelines de archivado documental: integrar la extracción de texto en procesos batch de indexación de facturas, contratos o formularios.
- Procesamiento de imágenes en flujos de accesibilidad: convertir capturas o material escaneado en texto para lectores de pantalla.
- Prototipado de aplicaciones OCR sobre llama.cpp: validar el pipeline antes de escalar a infraestructura mayor.
- Extracción de datos estructurados desde recibos o tickets: combinar el OCR con post-procesado para poblar bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,4 GB; el modelo base Q8_0 asociado requiere memoria adicional no especificada en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño reducido del proyector sugiere que el cuello de botella estará en el modelo base.
- Opciones de despliegue: llama.cpp con soporte para LightOnOCR (requisito explícito de la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este repo (proyector mixto) | proyector de 409.597.952 (base) | no disponible | Apache 2.0 | GGUF | Requiere modelo base Q8_0 de ggml-org |
| ggml-org/LightOnOCR-2-1B-GGUF | 409.597.952 (base) | no disponible | Apache 2.0 | GGUF | Proyector de origen en precisión estándar |
| lightonai/LightOnOCR-2-1B | 409.597.952 | no disponible | Apache 2.0 | safetensors | Modelo base original |

## Limitaciones y advertencias

- Este repositorio es solo el proyector: no funciona de forma autónoma; requiere `LightOnOCR-2-1B-Q8_0.gguf` y una build de llama.cpp con soporte LightOnOCR.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Proyecto de terceros (Bharath0209) que reempaqueta material de ggml-org; no es una publicación oficial de LightOn.
- Idiomas soportados no declarados: el rendimiento multilingüe no está verificado.
- Riesgo de errores de reconocimiento en imágenes de baja calidad, manuscritos o layouts complejos: no cuantificado en la información disponible.
- Sesgos del modelo base no documentados.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del proyector de origen en ggml-org.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bharath0209/lightonocr-2-1b-mixed-gguf
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-2-1B
- GGUF de origen (ggml-org): https://huggingface.co/ggml-org/LightOnOCR-2-1B-GGUF/tree/7d4daf70c2856a155b1413def00f4ae59843a9cf
- Modelo base cuantizado Q8_0: https://huggingface.co/ggml-org/LightOnOCR-2-1B-GGUF/resolve/7d4daf70c2856a155b1413def00f4ae59843a9cf/LightOnOCR-2-1B-Q8_0.gguf
