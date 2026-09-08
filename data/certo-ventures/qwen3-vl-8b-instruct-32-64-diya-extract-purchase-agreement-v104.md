# certo-ventures/qwen3-vl-8b-instruct-32-64-Diya-Extract-Purchase-Agreement-v104

## Resumen

El modelo `qwen3-vl-8b-instruct-32-64-Diya-Extract-Purchase-Agreement-v104` es un fine-tuning publicado por el usuario `certo-ventures` en HuggingFace. El nombre del repositorio indica que se basa en el modelo Qwen3-VL 8B Instruct, con una posible ventana de contexto de 32K o 64K tokens, y que está orientado a la extracción de información de acuerdos de compra (purchase agreements).

Sin embargo, la model card es una plantilla autogenerada que no contiene información técnica real. El repositorio pesa 1.8 GB, utiliza safetensors y es compatible con los Inference Endpoints de HuggingFace. No se han publicado descargas, likes, licencia ni idiomas soportados.

Este modelo forma parte de una serie de repositorios de `certo-ventures` con nombres similares (como `qwen3-vl-8b-instruct-32-64-Diya-Extract-Wire-Instructions` y `qwen3-vl-8b-instruct-32-64-Candor-Extract-dev`), lo que sugiere una familia de modelos especializados en extracción de información de documentos legales o financieros, aunque no hay documentación pública que lo confirme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre del repositorio sugiere Qwen3-VL 8B Instruct, sin confirmacion oficial) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica arquitectura MoE) |
| Longitud de contexto | No disponible (el nombre sugiere 32K o 64K tokens, sin confirmar) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (tamano del repositorio: 1.8 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura ni el proceso de entrenamiento. La model card es una plantilla generada automáticamente por HuggingFace y todos los campos aparecen como `[More Information Needed]`. El unico dato disponible es que el modelo se carga con la librería `transformers`.

## Capacidades

- No se ha publicado documentación sobre las capacidades del modelo.
- El nombre del repositorio sugiere que puede realizar extracción de información de acuerdos de compra, pero no hay confirmación oficial.
- Los modelos hermanos del mismo autor sugieren un enfoque en tareas de extracción de datos de documentos legales y financieros (instrucciones de transferencia, extracción de datos de contactos), pero no hay benchmarks ni ejemplos disponibles.

## Casos de uso

La información disponible no permite identificar casos de uso concretos y realistas con garantías. El único indicio es el nombre del modelo, que apunta a la extracción de información de acuerdos de compra. Sin documentos de soporte, benchmarks ni ejemplos, no es posible recomendar el modelo para ningún escenario de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se ha publicado información sobre requisitos de hardware. El tamaño del repositorio (1.8 GB) es menor de lo esperable para un modelo de 8B parámetros en precisión completa, pero sin datos sobre cuantización no es posible estimar la VRAM necesaria.

- No se dispone de datos de latencia ni throughput.
- El modelo tiene el tag `endpoints_compatible`, lo que indica compatibilidad con los Inference Endpoints de HuggingFace.
- No se mencionan otras herramientas de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa. Los modelos hermanos del mismo autor son candidatos, pero no hay datos publicos de rendimiento.

## Limitaciones y advertencias

- No se ha publicado licencia, lo que impide conocer las restricciones de uso comercial.
- La model card está vacía y no contiene información sobre sesgos, riesgos ni limitaciones técnicas.
- Al no haber benchmarks ni documentación, existe un riesgo alto de rendimiento desconocido en producción.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado externamente.

## Enlaces

- HuggingFace: https://huggingface.co/certo-ventures/qwen3-vl-8b-instruct-32-64-Diya-Extract-Purchase-Agreement-v104
- Modelo hermano (Wire Instructions): https://huggingface.co/certo-ventures/qwen3-vl-8b-instruct-32-64-Diya-Extract-Wire-Instructions
- Modelo hermano (Candor Extract dev): https://huggingface.co/certo-ventures/qwen3-vl-8b-instruct-32-64-Candor-Extract-dev
- Certo Software (posible desarrolladora): https://www.certosoftware.com/
