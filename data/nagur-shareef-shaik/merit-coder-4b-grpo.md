# nagur-shareef-shaik/MERIT-Coder-4B-GRPO

## Resumen
MERIT-Coder-4B-GRPO es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por nagur-shareef-shaik, obtenido mediante ajuste fino del modelo base Qwen/Qwen3.5-4B. Está especializado en codificación clínica médica: asignación de códigos ICD-10, ajuste de riesgo (risk adjustment) y codificación bajo el sistema CMS-HCC. El modelo se entrenó con datos derivados de MIMIC-IV y emplea GRPO (Group Relative Policy Optimization) como técnica de alineación, lo que sugiere un ajuste orientado a recompensas verificables en tareas de codificación.

El modelo resuelve un problema concreto del ámbito sanitario y asegurador: traducir documentación clínica en lenguaje natural a códigos diagnósticos normalizados y a las categorías de riesgo asociadas, una tarea tradicionalmente manual, costosa y propensa a errores. Su relevancia radica en que combina un modelo base compacto (4B) con un entrenamiento específico de dominio y una licencia vinculada a datos clínicos sensibles, lo que lo hace apto para entornos con requisitos estrictos de gobernanza de datos.

La ficha se basa exclusivamente en la información disponible en Hugging Face. No se han publicado detalles sobre arquitectura interna, composición del dataset de entrenamiento, número de tokens, benchmarks ni resultados cuantitativos, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; tipo `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se desconoce si existen variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | physionet-credentialed-health-data-1.5.0 (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de ajuste | GRPO (Group Relative Policy Optimization) |
| Tamano del repositorio | 8,4 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros. La información disponible no detalla la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención, uso de atención lineal o decodificación especulativa). El tag `qwen3_5_text` indica que se trata de la variante textual de la familia Qwen3.5, sin componentes multimodales.

El ajuste fino se realizó con GRPO, una técnica de optimización por política relativa a grupos que se emplea habitualmente para reforzar comportamientos verificables (en este caso, presumiblemente la correctitud de los códigos ICD-10 y de las categorías CMS-HCC asignadas). El entrenamiento se apoya en datos clínicos de MIMIC-IV, un corpus de historias clínicas de acceso restringido bajo credenciales de PhysioNet. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas adicionales de SFT, DPO o RLHF más allá del GRPO indicado.

## Capacidades
- Generación de texto conversacional orientada a dominios clínicos y administrativos.
- Codificación clínica: asignación de códigos ICD-10 a partir de descripciones o documentación clínica.
- Ajuste de riesgo (risk adjustment) y mapeo a categorías CMS-HCC.
- Razonamiento multi-paso aplicado a la resolución de casos de codificación (según la inclusión de GRPO y la etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`en`).
- Capacidades de visión, audio o modo thinking explícito: no disponibles en la información proporcionada.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y despliegue con vLLM (etiqueta `vllm`).

## Casos de uso
- Codificación de altas hospitalarias: el modelo recibe el texto de un informe de alta y propone los códigos ICD-10 correspondientes, reduciendo el trabajo manual del codificador y sirviendo como borrador revisable.
- Auditoría de facturación sanitaria: se emplea para verificar la coherencia entre la documentación clínica y los códigos facturados, detectando posibles discrepancias antes de la presentación de reclamaciones.
- Ajuste de riesgo en aseguradoras: mapea diagnósticos documentados a categorías CMS-HCC para estimar el perfil de riesgo de poblaciones aseguradas y calcular primas o pagos ajustados.
- Investigación con MIMIC-IV: al haberse entrenado sobre este corpus y compartir su marco de licencia, encaja en flujos de investigación que ya disponen de credenciales PhysioNet para extraer cohortes codificadas.
- Asistencia a codificadores clínicos (CDI, Clinical Documentation Improvement): el modelo sugiere mejoras en la documentación cuando falta información para asignar un código específico.
- Preprocesado de pipelines de datos clínicos: normalización de texto libre a estructuras codificadas que alimentan bases de datos analíticas o modelos predictivos posteriores.
- Formación de personal: generación de ejemplos de codificación y explicaciones de la correspondencia entre descripción clínica y código, en un entorno controlado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB; en 4 bits: en torno a 2,5-3 GB (estimaciones a partir del tamaño de parámetros; no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con concurrencia; RTX 4090 o RTX 3090 para desarrollo e inferencia en FP16.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en FP16, y en tarjetas de 8 GB con cuantización de 8 o 4 bits (estimación).
- Opciones de despliegue: transformers, vLLM (etiqueta oficial), endpoints compatibles de Hugging Face. No se confirma soporte de llama.cpp u Ollama al no haber variantes GGUF publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Acceso |
|---|---|---|---|---|---|
| MERIT-Coder-4B-GRPO | ~4,2B | No disponible | Codificacion clinica ICD-10 / CMS-HCC | physionet-credentialed-health-data-1.5.0 | Restringido |
| Qwen/Qwen3.5-4B (base) | ~4,2B | No disponible | Proposito general | Segun licencia del modelo base (no confirmada) | Publico (segun el autor original) |
| Alternativas medicas de ~4-8B | No disponible | No disponible | Codificacion clinica | No disponible | No disponible |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con otras alternativas de codificación clínica. La comparación más directa y fiable es con su modelo base Qwen3.5-4B, del que hereda arquitectura y tokenizador pero del que difiere en el ajuste de dominio y en las restricciones de licencia.

## Limitaciones y advertencias
- Acceso restringido: el repositorio es gated y exige aceptar las condiciones de la licencia `physionet-credentialed-health-data-1.5.0`, vinculada al uso de datos clínicos de MIMIC-IV.
- Restricciones de licencia para uso comercial: la licencia está ligada a datos sanitarios con credenciales de PhysioNet; no se garantiza su idoneidad para uso comercial sin revisión legal específica.
- Riesgo de alucinación en códigos: como todo modelo generativo, puede producir códigos ICD-10 o categorías HCC inexistentes o incorrectas; requiere validación contra catálogos oficiales.
- Sesgos de dominio: entrenado sobre un corpus clínico estadounidense (MIMIC-IV, CMS-HCC), por lo que puede no generalizar a otros sistemas de codificación (CIE-10 español, ICD-11) ni a otras poblaciones.
- Idioma: solo inglés; no soporta castellano ni otros idiomas.
- Contexto: longitud de contexto no documentada, lo que impide planificar el truncado de informes largos con garantías.
- Sin benchmarks publicados ni métricas de evaluación, lo que dificulta estimar su calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso comunitario ni validación externa.
- Datos de entrenamiento sensibles: aunque no se distribuyan los datos, el modelo puede memorizar patrones de MIMIC-IV; conviene evaluar riesgos de privacidad antes de desplegarlo.
- No se confirma soporte de cuantización ni de formatos GGUF, lo que limita el despliegue en entornos de bajos recursos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nagur-shareef-shaik/MERIT-Coder-4B-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia PhysioNet Credentialed Health Data 1.5.0: https://physionet.org/content/mimiciv/view-license/1.5.0/
- PhysioNet (credenciales y acceso a MIMIC-IV): https://physionet.org/
- Documentación de vLLM: https://docs.vllm.ai/
- Documentación de transformers: https://huggingface.co/docs/transformers
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
