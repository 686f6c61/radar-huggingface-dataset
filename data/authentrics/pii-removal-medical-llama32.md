# authentrics/pii-removal-medical-llama32

## Resumen

`authentrics/pii-removal-medical-llama32` es un repositorio de HuggingFace publicado por Authentrics que documenta un flujo reproducible de *machine unlearning* aplicado a un modelo afinado sobre datos médicos que contenían información personal identificable (PII). No se trata de un modelo nuevo en sentido estricto: la model card describe un caso de uso de la librería Authentrics SDK sobre un checkpoint derivado de `meta-llama/Llama-3.2-1B-Instruct`, y advierte explícitamente de que el checkpoint corregido no se redistribuye en este repositorio.

El problema que aborda es relevante para equipos que despliegan modelos afinados con datos regulados: eliminar el efecto de una sesión de entrenamiento concreta (por ejemplo, un lote de datos sensibles) de un checkpoint sin reentrenar desde cero. La herramienta empleada, `exclude_training`, se complementa con `static_analysis` para auditar la deriva de parámetros entre checkpoints secuenciales. El SDK es un wheel de Python sobre un núcleo en C++ que ejecuta el análisis en local, de modo que solo los metadatos del proyecto salen de la máquina del usuario, nunca los pesos.

El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y su fecha de creación registrada es 2026-09-16. Se trata, por tanto, de un artefacto de demostración y documentación metodológica más que de un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (el repositorio deriva de `meta-llama/Llama-3.2-1B-Instruct`) |
| Parametros totales | aproximadamente 1.000 millones, según la denominación del modelo base (`Llama-3.2-1B-Instruct`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | no disponible; la model card indica que el checkpoint corregido no se redistribuye en este repositorio |

Otros metadatos: `library_name: transformers`, `pipeline_tag: text-generation`, etiquetas `machine-unlearning`, `exclude-training`, `compliance`, `gdpr`, `unsloth` y `endpoints_compatible`. Creado el 2026-09-16, actualizado el 2026-09-16.

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. El repositorio se declara como un *finetune* de `meta-llama/Llama-3.2-1B-Instruct`, por lo que hereda la arquitectura y el entrenamiento del modelo base de Meta, pero la model card no aporta detalles sobre número de tokens, composición del dataset, ni fases de RLHF o DPO. La etiqueta `unsloth` sugiere que el ajuste fino del caso de demostración se realizó con la librería Unsloth, aunque no se especifican hiperparámetros ni configuración.

La innovación técnica documentada no está en el modelo, sino en el procedimiento de mantenimiento de checkpoints que ilustra. El SDK de Authentrics expone dos operaciones: `static_analysis`, que audita la deriva de parámetros y de comportamiento entre pares de checkpoints secuenciales, y `exclude_training`, que elimina el efecto de sesiones de entrenamiento específicas del checkpoint más reciente sin reentrenar desde cero. Según la model card, el análisis se ejecuta íntegramente en local sobre un núcleo en C++ y solo se intercambian metadatos del proyecto (nombres y descripciones) con los servidores de Authentrics. No se detalla el algoritmo de eliminación ni se publican métricas de fidelidad de la eliminación.

## Capacidades

- Generación de texto conversacional, heredada del modelo base `Llama-3.2-1B-Instruct` (orientado a diálogo e instrucciones).
- El repositorio no redistribuye pesos, por lo que no es directamente ejecutable como modelo de inferencia desde HuggingFace.
- Auditoría de deriva de parámetros entre checkpoints secuenciales mediante `static_analysis`.
- Eliminación del efecto de sesiones de entrenamiento concretas mediante `exclude_training` (flujo de *machine unlearning*).
- Soporte de flujos de cumplimiento orientados a GDPR y a la eliminación de PII memorizada.
- Ejecución de análisis en local, con salida únicamente de metadatos del proyecto.
- Integración en CI mediante la variable de entorno `AUTHRX_API_KEY`.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, visión, audio ni modo *thinking*.

## Casos de uso

- Cumplimiento del derecho al olvido en modelos clínicos: un equipo que haya afinado un modelo con historiales de pacientes puede usar `exclude_training` para revertir el efecto de la sesión de entrenamiento que introdujo esos datos, evitando un reentrenamiento completo desde cero.
- Auditoría de linaje de checkpoints: `static_analysis` permite comparar pares de checkpoints consecutivos y documentar qué cambió entre versiones, útil en procesos de validación interna antes de promover un modelo a producción.
- Preparación para despliegue sanitario regulado: antes de publicar un asistente médico, se elimina la PII memorizada y se genera evidencia de la intervención para el expediente de cumplimiento.
- Depuración de pipelines de ajuste fino: si un lote de datos resulta contaminado o contiene datos sensibles, se identifica la sesión afectada y se revierte su contribución sin descartar el resto del entrenamiento.
- Reproducción de auditorías en integración continua: con `AUTHRX_API_KEY` configurada, el análisis puede ejecutarse como paso automatizado en un pipeline que verifique que un checkpoint no retiene datos prohibidos.
- Investigación en *machine unlearning*: sirve como caso de referencia reproducible (notebook `hf_medical_chatbot.ipynb`) para comparar metodologías de eliminación de datos frente a reentrenamiento completo.
- Gestión de riesgos en fine-tuning con datos de terceros: validar que un proveedor de datos no ha dejado rastros memorizados antes de integrar su checkpoint en un producto.
- Evaluación de coste de *unlearning*: comparar el tiempo y los recursos de `exclude_training` frente a un reentrenamiento completo en un modelo de ~1.000 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de eficacia de la eliminación de PII (por ejemplo, tasas de extracción de datos memorizados antes y después del proceso).

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de ~1.000 millones de parámetros: del orden de 2,5 GB en FP16/BF16, 1,2-1,5 GB en INT8 y 0,7-1 GB en cuantización de 4 bits. Son estimaciones derivadas del tamaño del modelo base; la model card no publica cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. El modelo cabe con holgura en GPU de consumo.
- Cabe en GPU de consumo: sí, para el modelo base subyacente. El repositorio en sí no contiene pesos, por lo que no es ejecutable directamente.
- Requisitos del SDK de Authentrics: Linux x86_64 y Python 3.11-3.13. La instalación se realiza con `pip install authentrics`.
- Opciones de despliegue del modelo base: no especificadas en la información disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| authentrics/pii-removal-medical-llama32 | ~1.000 millones (heredados del base) | no disponible | Documentación de flujo de *unlearning* | llama3.2 | No se redistribuyen |
| meta-llama/Llama-3.2-1B-Instruct (modelo base) | ~1.000 millones | no disponible en la información proporcionada | Modelo de instrucciones | llama3.2 | Sí |
| authentrics/medical-chatbot-pii-often | no disponible | no disponible | Checkpoint de demostración | no disponible | Citado en la model card |
| authentrics/medical-chatbot-pii-overtrained | no disponible | no disponible | Checkpoint de demostración | no disponible | Citado en la model card |
| authentrics/medical-chatbot-pii-removed | no disponible | no disponible | Checkpoint corregido de demostración | no disponible | Citado en la model card |

No se dispone de datos de rendimiento comparativos entre estas variantes, ni de modelos alternativos de *machine unlearning* con los que contrastar el enfoque.

## Limitaciones y advertencias

- El repositorio no redistribuye pesos: la model card indica explícitamente que el checkpoint corregido no se publica y que el flujo debe reproducirse en local con el SDK.
- No hay evidencia publicada de la eficacia real del proceso de eliminación: no se aportan métricas de PII residual, de degradación de capacidades ni de comparación frente a un reentrenamiento completo.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes, con fechas de creación y actualización separadas por un segundo.
- Riesgo de dependencia de proveedor: el flujo se apoya en el SDK propietario de Authentrics, con clave de API y contacto con servidores del fabricante (aunque solo para metadatos).
- El dominio declarado es consejo médico, un área donde las respuestas incorrectas pueden causar daño; se requiere revisión humana y validación clínica antes de cualquier uso real.
- Riesgo de alucinación inherente a un modelo de ~1.000 millones de parámetros; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas soportados.
- Restricciones de licencia: la licencia llama3.2 (Llama 3.2 Community License) impone condiciones de uso, requisitos de atribución y una cláusula de escala (usuarios con más de 700 millones de usuarios mensuales requieren licencia adicional de Meta). Cualquier uso comercial debe revisarse contra el texto de la licencia.
- La model card está redactada en inglés y no incluye documentación en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/authentrics/pii-removal-medical-llama32
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Aplicación y claves de API de Authentrics: https://app.authentrics.ai/
- Documentación y referencia de la API: https://app.authentrics.ai/docs
- Ejemplos y guía de usuario (incluye `hf_medical_chatbot.ipynb`): https://github.com/Authentrics-ai/authentrics-analysis-examples
- Repositorio LFS con checkpoints y datos de ejemplo: `Authentrics-ai/authentrics-analysis-example-models`
- Checkpoints relacionados citados: `authentrics/medical-chatbot-pii-often`, `authentrics/medical-chatbot-pii-overtrained`, `authentrics/medical-chatbot-pii-removed`
- Contacto: info@authentrics.ai
- Nota: la búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo; los enlaces obtenidos correspondían a páginas bancarias sin relación con el contenido.
