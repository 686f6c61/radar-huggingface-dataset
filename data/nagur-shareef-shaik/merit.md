# nagur-shareef-shaik/MERIT

## Resumen

MERIT es un modelo de lenguaje especializado en codificación clínica y ajuste de riesgo sanitario, desarrollado por el usuario nagur-shareef-shaik y publicado en Hugging Face. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-4B, orientado a tareas de codificación ICD-10, cálculo de ajuste de riesgo mediante el sistema CMS-HCC y generación de evidencia clínica trazable, con soporte declarado para predicción conforme (conformal prediction) sobre datos de MIMIC-IV.

El modelo aborda un problema concreto del ámbito sanitario: la traducción automática de documentación clínica en códigos de diagnóstico estandarizados y la estimación de riesgo de pacientes bajo modelos de pago ajustado (CMS-HCC). La inclusión de mecanismos de evidencia y predicción conforme sugiere un diseño orientado a la auditabilidad, requisito habitual en entornos clínicos regulados.

Por su tamaño (4B parámetros, según el modelo base) y su naturaleza especializada, MERIT se posiciona como una alternativa ligera frente a modelos generalistas de mayor tamaño para tareas de codificación médica. El acceso está restringido a usuarios que acepten las condiciones de PhysioNet, dado que el modelo se ha entrenado con datos clínicos sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-4B) |
| Parametros totales | 4B (aproximado, segun modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | physionet-credentialed-health-data-1.5.0 (licencia "other" en Hugging Face) |
| Formato de pesos | no disponible (repo de 0.6 GB, compatible con safetensors probablemente) |

## Arquitectura y entrenamiento

MERIT es un fine-tuning del modelo Qwen/Qwen3.5-4B, un transformer decoder-only de 4B parámetros. No se ha publicado información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Los tags del repositorio indican que el entrenamiento se ha realizado sobre MIMIC-IV, un corpus de datos clínicos de acceso restringido bajo credenciales de PhysioNet.

Las innovaciones técnicas declaradas incluyen soporte para conformal prediction, un mecanismo que permite cuantificar la incertidumbre de las predicciones y ofrecer intervalos de confianza, y la generación de evidencia (evidence) asociada a las codificaciones, lo que facilita la trazabilidad de las decisiones del modelo. No se dispone de información sobre técnicas de decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Codificación clínica automática: asignación de códigos ICD-10 a partir de texto clínico en inglés.
- Ajuste de riesgo: cálculo de puntuaciones bajo el sistema CMS-HCC para modelos de pago ajustado.
- Generación de evidencia: producción de justificaciones o trazas que respaldan cada código asignado.
- Predicción conforme: estimación de incertidumbre con intervalos de confianza sobre las predicciones.
- Procesamiento de documentación clínica en inglés (único idioma declarado).
- No se ha confirmado soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Codificación de altas hospitalarias: el modelo puede procesar informes de alta en inglés y asignar códigos ICD-10, reduciendo el trabajo manual de codificadores certificados y acelerando la facturación.
- Auditoría de riesgo en aseguradoras sanitarias: cálculo de puntuaciones CMS-HCC sobre historiales de pacientes para estimar el riesgo ajustado y validar pagos capitation.
- Revisión de calidad de codificación: detección de códigos inconsistentes o ausentes comparando la evidencia generada por el modelo con la codificación existente.
- Investigación clínica retrospectiva: extracción estructurada de diagnósticos desde notas clínicas de MIMIC-IV para cohortes de estudio, con trazabilidad de la evidencia.
- Sistemas de alerta temprana: identificación de pacientes con riesgo elevado según CMS-HCC para priorizar intervenciones de gestión de casos.
- Validación regulatoria y auditoría interna: el mecanismo de conformal prediction permite documentar la incertidumbre de cada predicción, requisito habitual en procesos de validación de software sanitario.
- Formación de codificadores: uso como asistente que sugiere códigos y muestra la evidencia textual que los respalda, sirviendo como herramienta de aprendizaje supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4B parámetros en FP16 se estiman aproximadamente 8-10 GB, y en cuantización de 4 bits alrededor de 3-4 GB, aunque estos valores son estimaciones basadas en el tamaño del modelo base y no en datos publicados para MERIT.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en GPUs consumer como RTX 3090, RTX 4090 o superiores, así como en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: probablemente sí, en GPUs con al menos 8 GB de VRAM (sin confirmación oficial).
- Opciones de despliegue: no disponible. Al ser un modelo basado en Qwen, cabría esperar compatibilidad con vLLM, llama.cpp, Ollama o TGI, pero no se ha confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Acceso |
|---|---|---|---|---|---|
| MERIT | 4B (aprox.) | no disponible | Codificacion ICD-10, CMS-HCC, evidencia | PhysioNet credentialed | Restringido (gated) |
| Qwen/Qwen3.5-4B | 4B | no disponible | Generico | no disponible | Abierto |
| Modelos de codificacion clinica generalistas | no disponible | no disponible | Codificacion medica | variable | variable |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas específicas de codificación clínica. El modelo base Qwen/Qwen3.5-4B sirve como referencia de arquitectura y tamaño, pero carece de la especialización y del acceso restringido de MERIT.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar las condiciones de PhysioNet, lo que limita su uso a usuarios acreditados.
- Licencia PhysioNet credentialed health data 1.5.0: impone restricciones estrictas sobre el uso, la redistribución y el tratamiento de datos derivados; es imprescindible revisar los términos antes de cualquier uso comercial.
- Entrenado exclusivamente en inglés: no soporta otros idiomas, lo que limita su aplicación en entornos hispanohablantes.
- Entrenado sobre MIMIC-IV: puede heredar sesgos de la población y de la práctica clínica del centro o centros que generaron los datos.
- Riesgo de alucinación en códigos ICD-10: aunque el modelo genera evidencia, la asignación de códigos debe ser validada por personal clínico certificado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta la evaluación objetiva.
- Sin información sobre cuantizaciones ni formatos de pesos: la integración en pipelines de producción requiere verificación previa.
- Uso clínico directo no recomendado sin validación regulatoria: cualquier aplicación en decisiones de facturación o atención al paciente debe someterse a auditoría y cumplimiento normativo.

## Enlaces

- Hugging Face: https://huggingface.co/nagur-shareef-shaik/MERIT
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- PhysioNet (condiciones de acceso a MIMIC-IV): https://physionet.org/content/mimiciv/
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
