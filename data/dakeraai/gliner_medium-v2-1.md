# DakeraAI/gliner_medium-v2.1

## Resumen

`DakeraAI/gliner_medium-v2.1` es un espejo verificado del modelo de reconocimiento de entidades nombradas (NER) zero-shot GLiNER medium v2.1, desarrollado originalmente por Urchade Zaratiana et al. y publicado en el repositorio `urchade/gliner_medium-v2.1`. Este repositorio no introduce modificaciones en los pesos: copia byte a byte los ficheros del modelo en formato ONNX desde `onnx-community/gliner_medium-v2.1` y los valida mediante sumas SHA-256, con el objetivo de ofrecer una fuente redundante de descarga para la plataforma Dakera.

Dakera es un motor de memoria autoalojado para agentes de IA que emplea este modelo para extraer entidades (personas, organizaciones, lugares y etiquetas arbitrarias) de las memorias almacenadas, con la variable de configuración `DAKERA_GLINER_MODEL=gliner-medium`. La relevancia del repositorio es, por tanto, operativa: garantiza que la instalación de Dakera no dependa de un único origen de descarga, ya que consulta primero este espejo y recurre a los repositorios originales si no está disponible.

Arquitectura y contexto: GLiNER es un modelo de clasificación de tokens basado en un encoder transformer (tipo BERT) que permite definir etiquetas de entidad en tiempo de inferencia, sin reentrenamiento. No se dispone de datos publicados en la información proporcionada sobre el número exacto de parámetros, la longitud de contexto ni los idiomas soportados; el artefacto distribuido es un fichero ONNX de 782.035.442 bytes (aproximadamente 0,8 GB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder para token-classification (GLiNER, NER zero-shot); pesos distribuidos en ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo distribuye `onnx/model.onnx` sin variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`) y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente, GLiNER medium v2.1, es un extractor de entidades zero-shot: recibe un texto y una lista de etiquetas definidas por el usuario, y devuelve los spans del texto que corresponden a cada etiqueta. Este repositorio concreto no documenta la arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; esa información corresponde a la model card original de `urchade/gliner_medium-v2.1`, a la que el autor remite explícitamente.

La innovación técnica relevante desde el punto de vista del despliegue es la exportación a ONNX, que permite ejecutar la inferencia con ONNX Runtime sin depender de PyTorch y facilita el empaquetado en contenedores. El repositorio incluye dos ficheros con sumas SHA-256 publicadas: `onnx/model.onnx` (782.035.442 bytes) y `tokenizer.json` (8.657.198 bytes), ambos procedentes de `onnx-community/gliner_medium-v2.1`.

## Capacidades

- Extracción de entidades nombradas zero-shot: permite especificar las etiquetas en tiempo de inferencia (personas, organizaciones, lugares o cualquier categoría arbitraria) sin reentrenar el modelo.
- Clasificación de tokens sobre texto almacenado, orientada a enriquecer memorias de agentes con entidades estructuradas.
- Integración en pipelines de recuperación aumentada (RAG) como paso de enriquecimiento semántico previo a la indexación.
- Ejecución mediante ONNX Runtime, lo que habilita despliegues ligeros y portables.
- No se documentan en la información disponible capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes multi-paso; el modelo es exclusivamente un extractor de entidades.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Memoria a largo plazo para agentes de IA: Dakera emplea el modelo para etiquetar entidades en las memorias almacenadas, de modo que el agente pueda recuperar posteriormente hechos asociados a personas, organizaciones o lugares concretos.
- Enriquecimiento de bases de conocimiento internas: extraer entidades de documentos corporativos y vincularlas a un grafo o a un índice de búsqueda para mejorar la recuperación.
- Anonimización y etiquetado de PII: definir etiquetas como `persona`, `correo` o `teléfono` y localizar sus menciones en textos antes de almacenarlos o compartirlos.
- Procesamiento de correo y tickets de soporte: identificar el cliente, el producto y la ubicación mencionados en cada mensaje para enrutarlo o priorizarlo automáticamente.
- Análisis de documentos legales o financieros: extraer partes implicadas, importes y jurisdicciones con etiquetas definidas por el equipo legal, sin necesidad de un modelo entrenado a medida.
- Pipeline RAG autoalojado: usar el modelo como etapa de extracción de metadatos en un sistema desplegado con Docker o Kubernetes, aprovechando la disponibilidad del espejo para instalaciones reproducibles.
- Verificación de integridad en despliegues: emplear las sumas SHA-256 publicadas para validar que los artefactos descargados coinciden con los esperados en un entorno de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el artefacto ONNX ocupa aproximadamente 0,8 GB, por lo que se espera un consumo de memoria en el mismo orden, aunque no se confirma en la documentación.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del fichero es plausible que quepa en GPUs de consumo, pero no hay datos oficiales que lo respalden.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); integración con Dakera mediante `DAKERA_GLINER_MODEL=gliner-medium` y la imagen Docker `ghcr.io/dakera-ai/dakera:latest`, que incluye los modelos por defecto sin descarga en el arranque.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| DakeraAI/gliner_medium-v2.1 | NER zero-shot (espejo) | ONNX | Apache-2.0 | HuggingFace (espejo verificado) |
| urchade/gliner_medium-v2.1 | NER zero-shot (original) | Pesos originales (no detallado) | Apache-2.0 | HuggingFace |
| onnx-community/gliner_medium-v2.1 | NER zero-shot (exportación ONNX) | ONNX | no disponible en la información | HuggingFace |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio es un espejo: no introduce mejoras ni correcciones sobre el modelo original, por lo que hereda todas sus limitaciones.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas en la información disponible; deben consultarse en la model card de `urchade/gliner_medium-v2.1`.
- El modelo no genera texto: cualquier expectativa de uso como LLM es incorrecta.
- Solo se distribuye una variante ONNX sin cuantizar; no hay versiones GGUF ni cuantizaciones publicadas en este repositorio.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo original y citar a los autores (Urchade Zaratiana et al.) según indique su model card.
- La fecha de creación del repositorio (2026-11-04) y el contador de descargas (0) indican que se trata de una publicación reciente y sin adopción registrada; la validación de integridad depende de las sumas SHA-256 publicadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DakeraAI/gliner_medium-v2.1
- Modelo original: https://huggingface.co/urchade/gliner_medium-v2.1
- Exportación ONNX de origen: https://huggingface.co/onnx-community/gliner_medium-v2.1
- Licencia: https://huggingface.co/DakeraAI/gliner_medium-v2.1/blob/main/LICENSE
- Web de Dakera: https://dakera.ai
- Documentación de Dakera: https://dakera.ai/docs
- GitHub de Dakera: https://github.com/Dakera-AI
- Despliegue (Docker, Kubernetes, Helm): https://github.com/Dakera-AI/dakera-deploy
- Servidor MCP: https://github.com/Dakera-AI/dakera-mcp
- SDK Python: https://github.com/Dakera-AI/dakera-py
- SDK TypeScript: https://github.com/Dakera-AI/dakera-js
- SDK Go: https://github.com/Dakera-AI/dakera-go
- SDK Rust: https://github.com/Dakera-AI/dakera-rs
- LinkedIn: https://www.linkedin.com/company/dakera-ai
- Contacto: amine@dakera.ai
