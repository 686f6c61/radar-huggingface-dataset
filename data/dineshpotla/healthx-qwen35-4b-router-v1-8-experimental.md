# dineshpotla/healthx-qwen35-4b-router-v1.8-experimental

## Resumen

HealthX Qwen3.5-4B Query Router es un adaptador LoRA experimental desarrollado por dineshpotla para el sistema de interoperabilidad sanitaria HealthX. Su función es convertir consultas en lenguaje natural en decisiones de enrutamiento estructuradas y limitadas por esquema: intención, entidad opcional, alcance temporal, límite de resultados y estado de aclaración. No es un modelo autónomo; requiere el modelo base Qwen/Qwen3.5-4B y un conjunto de componentes deterministas de seguridad y validación.

El adaptador se entrenó con QLoRA de 4 bits sobre 4.720 ejemplos sintéticos derivados de conceptos FHIR, con una longitud máxima de secuencia de 512 tokens y 600 pasos de entrenamiento. Aunque superó una evaluación interna de recuperación guiada con 142 ejemplos, una evaluación externa sucesoria no alcanzó los umbrales de calidad exigidos (validez de esquema del 99,3% frente al 99,5% mínimo y recall de solicitudes no soportadas del 87,5% frente al 95% mínimo). Por ello, el adaptador permanece deshabilitado por defecto y requiere una activación explícita para fines de evaluación.

Su relevancia radica en que propone un enfoque compacto y reproducible para el enrutamiento de consultas clínicas sintéticas, pero su estado experimental y las carencias en la evaluación externa lo descartan para cualquier uso en producción clínica o asistencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-4B (transformador causal) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo durante entrenamiento) |
| Tipos de cuantizacion | QLoRA 4-bit durante entrenamiento; pesos del adaptador en safetensors |
| Idiomas soportados | No disponible |
| Licencia | En revisión para el adaptador; base Qwen3.5-4B bajo Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador emplea PEFT LoRA con rango 16, alpha 32 y dropout 0,05, aplicado a todas las capas lineales del modelo base Qwen3.5-4B. El entrenamiento se realizó con QLoRA de 4 bits en CUDA, con una semilla fija (20260811) y 600 pasos. El conjunto de datos consta de 4.720 ejemplos balanceados, generados sintéticamente a partir de conceptos FHIR sintéticos y sin datos de pacientes reales (sin PHI). El repositorio incluye un manifiesto de entrenamiento con hashes SHA-256 para reproducibilidad y verificación de integridad.

No se reportan innovaciones arquitectónicas más allá del uso de QLoRA y la restricción de salida mediante un esquema estricto. El sistema completo depende de código determinista para la selección de herramientas, autorización, recuperación y composición de evidencia; el adaptador solo produce una propuesta de enrutamiento.

## Capacidades

- Enrutamiento de consultas en lenguaje natural hacia intenciones predefinidas dentro del dominio sanitario sintético.
- Extracción de entidades opcionales, alcance temporal y límite de resultados a partir de la consulta.
- Detección de estado de aclaración cuando la consulta es ambigua o incompleta.
- Generación de salidas restringidas por esquema, lo que facilita la validación determinista posterior.
- Funciona únicamente como adaptador sobre Qwen3.5-4B; no es un modelo de generación libre.
- No soporta tool calling, agentes, visión ni audio; su alcance se limita a la tarea de routing.

## Casos de uso

- Evaluación de investigación: el adaptador puede servir como banco de pruebas para estudiar el enrutamiento de consultas clínicas sintéticas en entornos controlados, siempre con validación manual.
- Prototipado de sistemas de interoperabilidad sanitaria: permite explorar cómo un LLM ligero puede proponer rutas de acceso a datos FHIR sintéticos antes de implementar lógica determinista.
- Pruebas de robustez de esquemas: al generar salidas restringidas, es útil para verificar que un sistema de validación de esquemas detecta correctamente propuestas inválidas.
- Formación y demostración: puede utilizarse en entornos educativos para ilustrar el flujo de un router de consultas con QLoRA, sin datos reales.
- Comparación de adaptadores: sirve como referencia experimental para medir el impacto de diferentes configuraciones de LoRA en tareas de routing.
- Desarrollo de pipelines de evaluación: su manifiesto de entrenamiento y la metodología de evaluación documentada pueden reutilizarse para construir baterías de pruebas en dominios similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta dos evaluaciones específicas:

| Evaluacion | Resultado | Umbral exigido | Estado |
|---|---|---|---|
| Recuperación guiada (142 ejemplos) | Superada | No especificado | Aprobada |
| Evaluación externa sucesoria - validez de esquema | 99,3% | 99,5% | No superada |
| Evaluación externa sucesoria - recall de solicitudes no soportadas | 87,5% | 95% | No superada |

Estos datos indican que el adaptador no alcanza los criterios de calidad para su activación por defecto en el sistema HealthX.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen3.5-4B. Con cuantización 4-bit, el modelo base ocupa aproximadamente 2,5-3 GB de VRAM, más el adaptador (0,1 GB). Una GPU con 6-8 GB de VRAM (p. ej., RTX 3060, RTX 4060) sería suficiente para inferencia.
- Para entrenamiento con QLoRA 4-bit, se recomienda al menos 8-12 GB de VRAM (p. ej., RTX 3080, RTX 4070, A10).
- Opciones de despliegue: el adaptador se carga mediante PEFT y Transformers. No se mencionan integraciones con vLLM, llama.cpp u Ollama; la vía oficial es Python con `PeftModel`.
- La latencia y el throughput no están documentados; al ser una tarea de secuencia corta (512 tokens), se espera una latencia baja en GPUs modernas, pero sin cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la tarea de enrutamiento de consultas sanitarias sintéticas. La model card no ofrece referencias a alternativas. Se puede considerar que el modelo base Qwen3.5-4B sin adaptador es el punto de partida natural, pero no hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Artefacto experimental: no aprobado para uso clínico, diagnóstico, pronóstico, tratamiento, prescripción ni toma de decisiones clínicas.
- La evaluación con consultas sintéticas no establece validez clínica ni generalización a usuarios reales.
- El adaptador no puede escribir en un EHR ni seleccionar herramientas por sí mismo; depende de código determinista para autorización, recuperación y composición de evidencia.
- Riesgo de alucinación o salidas inválidas; el sistema debe rechazar o redirigir a un fallback determinista cualquier solicitud no soportada o no autorizada.
- La licencia del adaptador está en revisión; el uso debe cumplir la licencia Apache-2.0 del modelo base y retener la atribución de las fuentes sintéticas Synthea.
- No se garantiza la ausencia de sesgos en los datos sintéticos, aunque no se incluyen datos de pacientes reales.
- La longitud de contexto limitada a 512 tokens puede ser insuficiente para consultas complejas o con mucho contexto adicional.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/dineshpotla/healthx-qwen35-4b-router-v1.8-experimental)
- [Modelo base Qwen3.5-4B en HuggingFace](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Proyecto fuente: agentic-health-exchange (GitHub)](https://github.com/dineshpotla/agentic-health-exchange)
