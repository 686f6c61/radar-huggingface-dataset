# JerroldK/H4-14b-contract-extractor-adapter

## Resumen

El modelo `JerroldK/H4-14b-contract-extractor-adapter` es un adaptador PEFT (Parameter-Efficient Fine-Tuning) publicado en HuggingFace por el usuario JerroldK. Está diseñado como una capa de ajuste fino sobre el modelo base `JerroldK/Hermes-4-14B-contract-extractor`, que a su vez parece ser una variante de la familia Hermes de 14B parámetros especializada en la extracción de información de contratos. El adaptador utiliza la librería PEFT (versión 0.14.0) y los pesos se almacenan en formato safetensors, con un tamaño de repositorio de 1.0 GB.

La relevancia de este modelo radica en que permite especializar un modelo grande de 14B en una tarea concreta (extracción de cláusulas o datos de contratos) sin necesidad de reentrenar todos los parámetros, lo que reduce costes computacionales y facilita el despliegue. Sin embargo, la documentación pública es extremadamente limitada: la model card está prácticamente vacía, sin información sobre licencia, idiomas, arquitectura interna, datos de entrenamiento o benchmarks. Esto limita su uso en entornos de producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (probablemente LoRA) sobre modelo base de 14B (no confirmado) |
| Parametros totales | No disponible (el adaptador pesa 1.0 GB, el modelo base es de ~14B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT, lo que indica que se ha aplicado una técnica de ajuste eficiente (posiblemente LoRA o similar) sobre un modelo base de 14B denominado `JerroldK/Hermes-4-14B-contract-extractor`. Esta técnica congela los pesos del modelo original y entrena únicamente un pequeño conjunto de parámetros adicionales, lo que reduce drásticamente los requisitos de memoria y tiempo de entrenamiento. No se dispone de información sobre el conjunto de datos utilizado, el número de tokens de entrenamiento, el régimen de precisión (fp16, bf16, etc.) ni si se aplicaron técnicas de alineación como RLHF o DPO. La referencia al paper `arxiv:1910.09700` en los tags sugiere que se utilizó la metodología de estimación de impacto ambiental de Lacoste et al. (2019), pero no aporta detalles sobre el entrenamiento en sí.

## Capacidades

- Extracción de información de contratos: el nombre del modelo indica que está especializado en identificar y extraer entidades, cláusulas o datos relevantes de documentos contractuales.
- Ajuste fino eficiente: al ser un adaptador PEFT, se puede cargar junto con el modelo base para obtener una versión especializada sin necesidad de almacenar los pesos completos del modelo ajustado.
- Integración con el ecosistema PEFT: compatible con la librería PEFT de HuggingFace, lo que facilita su uso en pipelines existentes.
- No se han documentado otras capacidades como razonamiento general, generación de código, tool calling o soporte multilingüe. Estas dependen del modelo base `Hermes-4-14B`, pero no hay confirmación oficial.

## Casos de uso

- Extracción de cláusulas contractuales: el modelo puede utilizarse para procesar documentos legales y extraer automáticamente cláusulas específicas (por ejemplo, de confidencialidad, penalizaciones o terminación) en un formato estructurado. Al ser un adaptador sobre un modelo de 14B, ofrece una capacidad de comprensión del lenguaje superior a modelos más pequeños.
- Análisis de riesgos en contratos: integrado en un sistema de revisión legal, puede identificar términos desfavorables o inusuales y alertar al equipo jurídico. La ventaja del adaptador es que puede ajustarse a las particularidades del dominio legal sin reentrenar el modelo completo.
- Automatización de procesos de negocio: en flujos de trabajo de gestión de proveedores o clientes, el modelo puede extraer fechas, montos, partes involucradas y otros datos clave de contratos para alimentar bases de datos o ERPs.
- Búsqueda semántica en documentos legales: combinado con un índice vectorial, el adaptador puede ayudar a localizar contratos que contengan ciertas condiciones o a comparar cláusulas entre documentos.
- Clasificación de contratos: el modelo podría usarse para categorizar contratos según su tipo (arrendamiento, compraventa, laboral, etc.) extrayendo los elementos distintivos de cada uno.
- Asistente legal conversacional: al estar basado en un LLM de 14B, el adaptador permite construir un chatbot que responda preguntas sobre el contenido de un contrato, siempre que se le proporcione el contexto adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de extracción de contratos (como F1, precisión o recall). Se recomienda realizar una evaluación propia sobre un conjunto de validación representativo antes de usar el modelo en producción.

## Requisitos de hardware

- El adaptador en sí requiere muy poca memoria (1.0 GB en disco), pero para la inferencia es necesario cargar el modelo base `JerroldK/Hermes-4-14B-contract-extractor`, que tiene aproximadamente 14 mil millones de parámetros.
- VRAM estimada para inferencia en fp16: alrededor de 28 GB (solo pesos del modelo base) más overhead de activaciones. Con cuantización a 8 bits se puede reducir a unos 14 GB, y a 4 bits a unos 7-8 GB, aunque no se ha confirmado la compatibilidad con estos formatos.
- GPU recomendadas: para fp16 se necesitaría una NVIDIA A100 (40 GB) o H100 (80 GB). Con cuantización 8 bits podría usarse una RTX 4090 (24 GB) o A6000 (48 GB). Con 4 bits, una RTX 3090 (24 GB) o inferior.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF, aunque no está disponible en ese formato). También se puede servir con FastAPI o un endpoint de inferencia propio.
- Latencia y throughput: no disponibles. Dependen del hardware y de la optimización (por ejemplo, vLLM puede ofrecer mayor throughput que la inferencia secuencial estándar).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para extracción de contratos. Como referencia general, se podrían considerar otros adaptadores LoRA sobre modelos de 14B (por ejemplo, sobre Llama-2-13B o Mistral-7B), pero no hay datos públicos de este modelo en particular para establecer una comparación justa. Se recomienda buscar en HuggingFace modelos con la etiqueta "contract-extraction" o "legal-ner" para alternativas.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no proporciona información sobre licencia, idiomas, arquitectura interna, datos de entrenamiento o evaluación. Esto impide conocer los términos de uso legal y las garantías de rendimiento.
- Riesgo de sesgos y alucinaciones: al ser un modelo ajustado sobre un LLM base, puede heredar sesgos del corpus original y generar información falsa o inventada, especialmente en dominios legales donde la precisión es crítica.
- Sin garantía de calidad: al no haber benchmarks publicados, no se puede verificar si el modelo funciona correctamente en tareas reales de extracción de contratos. Es imprescindible realizar pruebas internas antes de cualquier uso productivo.
- Licencia desconocida: la ausencia de licencia hace que su uso comercial sea legalmente arriesgado. Se debe contactar con el autor o buscar un modelo con licencia explícita.
- Dependencia del modelo base: el adaptador solo funciona junto con `JerroldK/Hermes-4-14B-contract-extractor`, que a su vez tiene una disponibilidad y documentación limitadas. Si el modelo base desaparece o cambia, el adaptador podría quedar inutilizable.
- Limitaciones de contexto e idioma: no se especifican, pero es probable que el modelo esté entrenado principalmente en inglés, dado el ámbito de los contratos. Para otros idiomas, el rendimiento puede degradarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JerroldK/H4-14b-contract-extractor-adapter
- Modelo base (referenciado): https://huggingface.co/JerroldK/Hermes-4-14B-contract-extractor
- Paper de estimación de impacto ambiental (referenciado en tags): https://arxiv.org/abs/1910.09700
