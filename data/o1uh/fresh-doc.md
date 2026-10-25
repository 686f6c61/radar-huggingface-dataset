# o1uh/fresh-doc

## Resumen

fresh-doc es un modelo de clasificación para detectar docstrings obsoletos en código fuente. Lo desarrolla el usuario o1uh como fine-tune de `microsoft/unixcoder-base`, un encoder Transformer tipo RoBERTa de 125,9 M de parámetros. No es un modelo generativo: recibe una tripleta formada por la firma antigua, el diff de código y el docstring antiguo, y devuelve una probabilidad de obsolescencia (`p_stale`) junto con una clase de tipo de deriva (`drift_type`, 8 clases).

El modelo está pensado para integrarse en herramientas de mantenimiento de documentación, revisión de código y pipelines de CI/CD. Su interés práctico está en que aborda un problema frecuente en proyectos con cambios continuos de API: docstrings que siguen describiendo una firma o un comportamiento que ya no existen. La model card reporta un PR-AUC de validación de 0,9724 y un PR-AUC de test real de 0,9837, con un umbral calibrado de 0,8743 y temperatura de 2,3847.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder Transformer tipo RoBERTa (UniXcoder-base) con dos cabezas lineales; codificador cruzado de doble cabeza |
| Parámetros totales | 125.938.185 |
| Longitud de contexto | 1.024 tokens de entrada; `doc_budget` de 384 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`); incluye `config.json`, `dualhead_config.json`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/unixcoder-base`, un encoder Transformer tipo RoBERTa orientado a representación de código. Sobre esa base se añade un codificador cruzado de doble cabeza: una cabeza produce la probabilidad de que el docstring esté obsoleto (`p_stale`) y la otra clasifica el tipo de deriva en 8 clases. La entrada es conjunta, no secuencial: `(sig_old, diff_code, doc_old)`, con una longitud máxima de 1.024 tokens y un presupuesto de 384 tokens para el docstring.

El fine-tune se realizó durante 3 épocas con semilla 42, usando datos reales, datos aumentados mediante AST y datos generados por LLM con pesos P1/P2 de 0,5. La model card no detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; al tratarse de un modelo de clasificación, esas técnicas no se describen. La calibración publicada fija `tau = 0.8743` y `T = 2.3847`.

## Capacidades

- Clasificación binaria de obsolescencia de docstrings mediante `p_stale`.
- Clasificación multiclase del tipo de deriva en 8 categorías; los nombres concretos de las clases no están disponibles en la información proporcionada.
- Comprensión conjunta de firma antigua, diff de código y docstring antiguo mediante un codificador cruzado.
- Procesamiento de entradas de hasta 1.024 tokens, con un límite específico de 384 tokens para el docstring.
- Salida calibrada con umbral y temperatura propios del fine-tune.
- No es un modelo generativo: no produce texto, código ni explicaciones.
- No hay evidencia de soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- No hay evidencia de capacidades de visión, audio o multilingüismo; los idiomas soportados no están documentados.

## Casos de uso

- **Detección de docstrings obsoletos en CI/CD:** en cada pull request se construye la tripleta con la firma de la rama base, el diff y el docstring anterior; si `p_stale` supera 0,8743, el pipeline puede bloquear la fusión o publicar un comentario automático. Es adecuado porque el modelo está entrenado específicamente para esa comparación.
- **Revisión de código asistida:** un bot de GitHub o GitLab puede marcar los docstrings afectados por un cambio de firma y usar `drift_type` para enrutar la incidencia al revisor adecuado. La doble cabeza permite priorizar qué documentación revisar primero.
- **Mantenimiento masivo de documentación de APIs:** un job por lotes puede recorrer un repositorio, comparar versiones de firmas y docstrings, y ordenar los candidatos por probabilidad de obsolescencia. El límite de 1.024 tokens permite procesar funciones y métodos habituales sin truncamiento excesivo.
- **Plugin de editor o linter:** al guardar un fichero, la herramienta puede comparar la versión confirmada con la versión en edición y avisar si el docstring ha quedado desactualizado. El modelo es ligero y puede ejecutarse en local, aunque requiere código de integración propio.
- **Curación de datasets de docstrings:** antes de entrenar un modelo generativo de documentación, se pueden filtrar pares código-docstring con alta probabilidad de estar desalineados. `p_stale` y `drift_type` permiten separar ejemplos sospechosos y reducir ruido en el corpus.
- **Monitorización de calidad documental por release:** ejecutar un análisis periódico sobre los módulos modificados en cada versión y medir la tasa de deriva documental. Es útil para equipos que mantienen SDKs o librerías con cambios frecuentes de contrato.
- **Auditoría de documentación heredada:** en proyectos antiguos, el modelo puede priorizar qué docstrings revisar manualmente cuando no se dispone de historial de cambios detallado, usando la firma actual y el diff disponible.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---:|---|
| PR-AUC | 0,9724 | validación |
| PR-AUC | 0,9837 | test_real |
| Métrica gold | 0,478 | gold |

La model card no especifica qué métrica exacta corresponde al valor `gold = 0,478`; no debe interpretarse como accuracy ni como PR-AUC sin confirmación del autor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, y no hay una tabla comparativa con modelos alternativos en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** aproximadamente 0,5 GB solo para los pesos en fp32 (125,9 M de parámetros); alrededor de 0,25 GB en fp16. Con activaciones y lotes pequeños, el consumo puede situarse en el entorno de 1-2 GB, aunque no hay una medición publicada.
- **GPU recomendadas:** cualquier GPU consumer con al menos 2 GB de VRAM, como una RTX 3060, RTX 4060 o RTX 4090. Para despliegues de mayor volumen, una A100 o H100 no son necesarias por tamaño, pero pueden aportar throughput.
- **CPU:** la inferencia en CPU es viable para lotes pequeños o análisis por lotes no interactivos, dado el tamaño reducido del modelo.
- **Opciones de despliegue:** la model card indica cargarlo como `AutoModel` de Transformers más cabezas lineales, siguiendo `src/models/m2_model.py` del proyecto FreshDoc. No es adecuado para vLLM, TGI, llama.cpp u Ollama como si fuera un LLM generativo, porque es un encoder de clasificación.
- **Latencia y throughput:** no disponibles. No se han publicado mediciones de latencia por petición ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| fresh-doc | 125.938.185 | 1.024 tokens | Clasificación de docstrings obsoletos y tipo de deriva | Apache-2.0 | HuggingFace |
| microsoft/unixcoder-base | 125M según la model card | no disponible | Modelo base de representación de código | no disponible | HuggingFace |
| microsoft/codebert-base | no disponible | no disponible | Modelo de representación de código | no disponible | Referencia externa no verificada |
| microsoft/graphcodebert-base | no disponible | no disponible | Modelo de representación de código | no disponible | Referencia externa no verificada |

No se dispone de datos comparativos de rendimiento entre fresh-doc y estas alternativas. Las filas de CodeBERT y GraphCodeBERT se incluyen solo como posibles comparables de categoría; sus especificaciones no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un clasificador, no un generador: no puede redactar docstrings nuevos ni explicar sus decisiones en lenguaje natural.
- El valor `gold = 0,478` es notablemente inferior a los valores de validación y test real; la model card no aclara qué métrica representa, por lo que requiere validación adicional antes de usarlo en producción.
- El umbral `tau = 0.8743` y la temperatura `T = 2.3847` están calibrados para este fine-tune concreto; no deberían reutilizarse sin recalibrar en otro dominio o distribución de datos.
- La integración requiere código propio: `dualhead_config.json` y la lógica de carga descrita en `src/models/m2_model.py`. No es un pipeline estándar de HuggingFace.
- La longitud máxima de 1.024 tokens y el presupuesto de 384 tokens para el docstring pueden truncar funciones, clases o documentación extensas.
- No hay información sobre sesgos, idiomas soportados, cuantizaciones disponibles ni comportamiento en dominios distintos al entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero no se han verificado los términos del modelo base `microsoft/unixcoder-base` ni posibles obligaciones de atribución adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación externa publicada que confirme los resultados reportados.

## Enlaces

- [HuggingFace: o1uh/fresh-doc](https://huggingface.co/o1uh/fresh-doc)
- [HuggingFace: microsoft/unixcoder-base](https://huggingface.co/microsoft/unixcoder-base)
- No se han proporcionado enlaces a paper, blog, repositorio del proyecto FreshDoc o demo en la información disponible.
