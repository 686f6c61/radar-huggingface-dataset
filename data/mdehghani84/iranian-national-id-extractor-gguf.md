# mdehghani84/iranian-national-id-extractor-GGUF

## Resumen

El modelo `mdehghani84/iranian-national-id-extractor-GGUF` es un extractor de números de identificación nacional iraní (código nacional iraní, también conocido como "code melli") presentado en formato GGUF. El autor es `mdehghani84`, pero no se proporciona ninguna descripción técnica, documentación ni detalles de entrenamiento en la model card. La única información disponible es la licencia (CC-BY-4.0) y la fecha de creación (17 de agosto de 2026). El nombre sugiere que está diseñado para extraer el número de identificación nacional de documentos o texto, pero se desconoce si se trata de un modelo de visión por computadora, OCR, o procesamiento de lenguaje natural. No se dispone de datos sobre arquitectura, tamaño, contexto o idiomas soportados.

Dada la ausencia total de información técnica en la model card, esta ficha se limita a documentar los datos disponibles y a señalar explícitamente lo que no se puede confirmar. No se recomienda su uso en producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el formato GGUF sugiere cuantizacion, pero no se especifican los tipos) |
| Idiomas soportados | no disponible (probablemente persa y/o ingles, sin confirmar) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (inferido por el nombre del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura del modelo, los datos de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. El nombre del repositorio indica que se distribuye en formato GGUF, lo que sugiere que es un modelo optimizado para inferencia en CPU/GPU con herramientas como llama.cpp u Ollama, pero no se puede confirmar la arquitectura subyacente (transformer, MoE, etc.) ni su tamaño.

## Capacidades

- Extracción de números de identificación nacional iraní (código melli) a partir de texto o imágenes, según se infiere del nombre del modelo.
- No se dispone de información sobre capacidades adicionales como generación de texto, razonamiento, código, tool calling, agentes o multilingüismo.

## Casos de uso

Dado que no hay información verificable sobre el modelo, los casos de uso son hipotéticos y deben tomarse con cautela:

- Verificación de identidad en formularios digitales: podría utilizarse para extraer automáticamente el código melli de documentos escaneados o campos de texto, agilizando procesos de registro.
- Automatización de procesos de onboarding en entidades financieras o gubernamentales: si el modelo funciona correctamente, podría integrarse en pipelines de extracción de datos.
- Validación de datos en bases de datos: podría ayudar a normalizar y verificar números de identificación en registros existentes.
- Asistencia en aplicaciones de gestión de recursos humanos: para extraer el código de documentos de empleados.
- Integración en sistemas de atención al cliente: para autenticación basada en el número de identificación.
- Investigación académica: como caso de estudio de modelos especializados en extracción de entidades en persa.

Sin embargo, la falta de documentación impide recomendar su uso en entornos productivos sin una evaluación rigurosa previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre precisión, recall, F1 u otras métricas de extracción de entidades.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. Al estar en formato GGUF, es probable que pueda ejecutarse en CPU con herramientas como llama.cpp, pero se desconoce el tamaño del modelo y, por tanto, la VRAM o RAM necesaria. No se puede estimar latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se puede verificar la calidad, precisión ni el comportamiento del modelo.
- Riesgo de alucinación o errores en la extracción de números de identificación, especialmente si el modelo no ha sido entrenado con datos representativos.
- Sin garantías de soporte para persa o para variantes del código melli (por ejemplo, con dígitos de control).
- La licencia CC-BY-4.0 permite uso comercial y modificaciones, pero exige atribución y no ofrece garantías implícitas.
- No se han publicado ejemplos de uso, ni instrucciones de despliegue, ni benchmarks, lo que dificulta su adopción.
- El modelo fue creado en agosto de 2026, pero no se indica si está en fase experimental o estable.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/mdehghani84/iranian-national-id-extractor-GGUF)

No se han encontrado otros enlaces (papers, blogs, repositorios de código) en la información proporcionada.
