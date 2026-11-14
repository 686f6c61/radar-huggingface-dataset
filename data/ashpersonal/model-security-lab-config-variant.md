# AshPersonal/model-security-lab-config-variant

## Resumen

`AshPersonal/model-security-lab-config-variant` es un artefacto de investigación publicado en Hugging Face por el usuario AshPersonal. No es un modelo entrenado desde cero ni un clasificador funcional: según su propia model card, los pesos y el tokenizador se copian del repositorio `AshutoshSJSU/model-security-lab-reference` en el commit `5e6c5baf186716c5393fc8079390c76621e7fc33`, y únicamente se alteran los mapeos de nombres de clase en `config.json` invirtiéndolos. El autor lo describe explícitamente como un artefacto de investigación «intencionadamente engañoso» que no constituye un clasificador de sentimiento real.

El modelo se presenta con arquitectura BERT y pipeline de `text-classification`, con un total de 78.274 parámetros en safetensors, lo que lo sitúa muy por debajo de cualquier BERT estándar (110M en BERT-base). Es relevante ahora no por su capacidad predictiva, sino como caso de estudio de seguridad de la cadena de suministro de modelos: demuestra cómo una modificación en un fichero de configuración de soporte puede alterar la semántica de salida de un modelo sin tocar los pesos, un vector de ataque relevante para pipelines que confían ciegamente en `config.json`.

Su interés práctico es, por tanto, educativo y de auditoría: sirve para probar herramientas de escaneo de artefactos, validar políticas de procedencia de modelos y ejemplificar controles de integridad en repositorios de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (según tag del repositorio) |
| Parámetros totales | 78.274 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio se etiqueta como `bert`, pero no se aporta información sobre la arquitectura interna, el número de capas, la dimensión oculta ni la configuración del transformer. El recuento de parámetros en safetensors (78.274) es incompatible con un BERT-base completo, lo que sugiere que o bien los pesos no corresponden a un BERT estándar, o bien el recuento refleja solo un subconjunto de tensores. No hay datos disponibles sobre el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La única modificación documentada respecto al modelo de referencia es la inversión de los mapeos de nombres de clase en `config.json`. No se realizó ningún reentrenamiento ni ajuste de pesos: se trata de un cambio exclusivamente en el fichero de configuración de soporte. El autor declara que el propósito es demostrar cómo un cambio en un fichero auxiliar puede alterar el comportamiento aparente del modelo, lo que constituye una innovación únicamente en el ámbito de la investigación en seguridad de artefactos.

## Capacidades

- No es un clasificador de sentimiento funcional; el autor lo declara explícitamente como artefacto engañoso.
- No se documentan capacidades de generación de texto, razonamiento, código ni matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el campo de idiomas figura como no disponible.
- Capacidad relevante: servir como caso de prueba para detectar modificaciones maliciosas o erróneas en ficheros de configuración de modelos.

## Casos de uso

- Auditoría de cadena de suministro de modelos: usar este artefacto como muestra de prueba en herramientas que comparan `config.json` entre un modelo y su referencia para detectar alteraciones de mapeos de clase.
- Validación de pipelines de CI/CD de modelos: incorporarlo como caso negativo en tests que verifican que un clasificador devuelve etiquetas coherentes con su model card antes de desplegar.
- Formación en seguridad de ML: emplearlo en talleres para ilustrar que los pesos pueden ser idénticos a la referencia y, aun así, el comportamiento de etiquetado cambiar por un fichero de soporte.
- Pruebas de integridad con hashes: verificar que las herramientas de procedencia detectan discrepancias entre el commit de referencia declarado y el contenido efectivo del repositorio.
- Evaluación de escáneres de artefactos: comprobar si las herramientas de análisis estático marcan correctamente un modelo etiquetado como `text-classification` cuyo autor advierte que no lo es.
- Investigación sobre confianza en Hugging Face: analizar cómo los metadatos (tags, pipeline, licencia) pueden inducir a error a consumidores que no leen la model card completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB dado el recuento de 78.274 parámetros en safetensors; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: al ser un artefacto de investigación, no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el pipeline declarado es `text-classification` y podría cargarse con `transformers`, pero su comportamiento no está garantizado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| AshPersonal/model-security-lab-config-variant | 78.274 | no disponible | Apache 2.0 | Artefacto de investigación (no funcional) |
| AshutoshSJSU/model-security-lab-reference | no disponible | no disponible | no disponible | Modelo de referencia del que se copian pesos y tokenizador |
| BERT-base (referencia estándar) | 110M | 512 tokens | Apache 2.0 | Clasificación y comprensión de texto |

La comparación con BERT-base se incluye solo como referencia de categoría; este repositorio no es un clasificador operativo y no debe evaluarse con métricas de rendimiento de tareas.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es «intencionadamente engañoso» y que no es un clasificador de sentimiento real.
- Los mapeos de clase en `config.json` están invertidos respecto a la referencia, por lo que las etiquetas de salida serán semánticamente incorrectas.
- No debe usarse en producción ni en ninguna tarea de clasificación real.
- Riesgo de alucinación y de etiquetado erróneo: alto por diseño, al no ser un modelo entrenado para la tarea declarada.
- No hay información sobre sesgos, idiomas soportados ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza engañosa hace desaconsejable cualquier uso más allá de la investigación en seguridad.
- El recuento de parámetros (78.274) es anómalo para un BERT y sugiere que el artefacto no es un transformer completo; conviene verificar la integridad de los tensores antes de cualquier uso experimental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AshPersonal/model-security-lab-config-variant
- Modelo de referencia citado: https://huggingface.co/AshutoshSJSU/model-security-lab-reference
- Commit de referencia: `5e6c5baf186716c5393fc8079390c76621e7fc33` (en el repositorio de referencia)
