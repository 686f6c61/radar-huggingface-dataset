# PINKlab/OSHE-Local-v2

## Resumen

OSHE Local v2 es un motor de IA local para Macs con Apple Silicon, desarrollado por byPINKLAND Limited (empresa registrada en Londres). Se presenta como una "Community Preview" binaria, no como un lanzamiento de código abierto. Combina un checkpoint base de Gemma 4 E2B con una capa de producto que añade enrutamiento automático de capacidades, análisis multi-documento con verificación de fuentes, operaciones de archivo acotadas, memoria local y un harness de calculadora, todo expuesto mediante una API compatible con OpenAI en un endpoint de solo bucle local.

La relevancia de este modelo reside en su enfoque local-first para agentes y análisis documental en hardware de Apple, con un mecanismo de firma y verificación de paquetes de capacidades. Según la model card, el sistema completo mejora significativamente la ruta de análisis multi-documento respecto al checkpoint base sin modificar, aunque se advierte explícitamente que no es un benchmark general de inteligencia. El repositorio ocupa 2.5 GB y está etiquetado con `mlx`, `apple-silicon`, `local-ai`, `agent`, `openai-compatible` y `cantonese`. La fecha de creación es agosto de 2026 (según HuggingFace).

No se proporcionan datos sobre el número total de parámetros, longitud de contexto, idiomas soportados más allá de menciones a cantonés y chino tradicional, ni detalles de cuantización. La licencia es "other" y los términos indican que es software binario propietario, no open source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Gemma 4 E2B (checkpoint de fundación) con capa de enrutamiento y capacidades adicionales |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Cantonés (con limitación conocida), chino tradicional (formal, 16/16 en evaluación), otros no especificados |
| Licencia | other (software binario propietario, Community Preview) |
| Formato de pesos | no disponible (repo etiquetado como `mlx`, probablemente MLX, pero no confirmado) |

## Arquitectura y entrenamiento

La arquitectura se describe como una combinación de un checkpoint de fundación Gemma 4 E2B (no se especifica el significado de E2B, ni su tamaño o configuración) con un "signed learned capability pack" (paquete de capacidades aprendidas firmado) que se instala automáticamente. El sistema incluye enrutamiento automático entre capacidades de chat y estructuradas, análisis multi-documento con verificación de conflictos y evidencia faltante, operaciones de archivo locales acotadas, memoria local y un harness de calculadora determinista. No se detalla el proceso de entrenamiento (datos, tokens, RLHF/DPO) en la información disponible. La model card indica que la ruta completa de OSHE Local v2 mejora sobre el checkpoint base sin modificar en tareas específicas de análisis multi-documento, pero no proporciona detalles sobre el entrenamiento de la capa adicional.

## Capacidades

- Generación de texto general (chat y respuesta estructurada) mediante el checkpoint base Gemma 4 E2B.
- Enrutamiento automático entre chat y capacidades estructuradas, con fallo seguro cuando la solicitud es ambigua o fuera del contrato público de capacidades.
- Análisis multi-documento con anclaje a fuentes, detección de conflictos y comprobación de evidencia faltante.
- Operaciones de archivo locales acotadas (con límites de seguridad).
- Memoria local persistente.
- Harness de calculadora determinista para operaciones aritméticas exactas.
- API compatible con OpenAI en endpoint de bucle local (`http://127.0.0.1:8093/v1`).
- Soporte para chino tradicional (formal) con resultado 16/16 en evaluación de producto.
- Soporte para cantonés, aunque con una limitación conocida en la imitación del dialecto (diagnóstico 0.125 frente a umbral 0.80).

## Casos de uso

- Análisis de documentos multi-fuente: el modelo puede comparar varios documentos, verificar citas y detectar conflictos o evidencia ausente, útil para revisión legal, periodística o de investigación.
- Asistente local de productividad: permite gestionar archivos locales y mantener memoria de contexto entre sesiones, adecuado para entornos de trabajo sin conexión o con requisitos de privacidad.
- Agente de automatización de tareas: gracias al enrutamiento automático y al harness de calculadora, puede ejecutar operaciones aritméticas y estructuradas de forma determinista.
- Prototipado de aplicaciones de IA local: su API compatible con OpenAI permite integrar el motor en aplicaciones existentes sin cambios de interfaz.
- Análisis de documentos con verificación de fuentes: para entornos donde la trazabilidad de la información es crítica (auditorías, cumplimiento normativo).
- Evaluación de modelos y desarrollo de agentes en Apple Silicon: sirve como plataforma de pruebas para agentes locales sin depender de servicios en la nube.

## Benchmarks y rendimiento

La model card no presenta benchmarks generales (MMLU, HumanEval, GSM8K, etc.). Solo se incluyen mediciones de la ruta de análisis multi-documento en un conjunto fijo de 8 casos:

| Medición | Gemma 4 E2B base | OSHE Local v2 | Cambio |
| --- | ---: | ---: | ---: |
| Logro de puntuación de referencia | 65% | 95% | +30 puntos porcentuales |
| Cumplimiento de esquema | 87.5% | 100% | +12.5 puntos porcentuales |
| No sobreconfianza | 87.5% | 100% | +12.5 puntos porcentuales |

Estos resultados son específicos de la ruta de análisis multi-documento, no una medida general de inteligencia. La evaluación interna reporta `all_gates_passed: false` debido al diagnóstico de imitación de cantonés (0.125 vs umbral 0.80). No se dispone de más datos de rendimiento.

## Requisitos de hardware

- Plataforma: Apple Silicon macOS (arm64).
- VRAM estimada: no disponible (el tamaño del repo es 2.5 GB, pero no se indica la huella de memoria).
- GPUs recomendadas: no disponible (solo Apple Silicon).
- Compatible con hardware de consumo: sí, en Macs con Apple Silicon.
- Opciones de despliegue: API local en loopback (puerto 8093), compatible con OpenAI. No se mencionan otros motores de inferencia (vLLM, llama.cpp, TGI, etc.).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay información suficiente para comparar con otros modelos locales de similar tamaño o propósito. El modelo es un producto propietario con una capa específica sobre Gemma 4 E2B, y no se han publicado datos comparativos con alternativas como Llama 3, Mistral, Qwen o Phi. Se indica "no disponible".

## Limitaciones y advertencias

- No es un lanzamiento de código abierto: es software binario de Community Preview, con términos y privacidad incluidos en el repositorio.
- No se han publicado parámetros, arquitectura detallada ni proceso de entrenamiento.
- Limitación conocida en la imitación de cantonés (diagnóstico 0.125 vs umbral 0.80); el chino formal pasó 16/16.
- Riesgo de alucinación no evaluado públicamente; solo se ha medido la no-sobreconfianza en la ruta de análisis multi-documento.
- La licencia "other" puede restringir el uso comercial o la redistribución; hay que leer los términos incluidos.
- No se especifica la longitud de contexto ni el soporte de idiomas más allá de las menciones a cantonés y chino.
- La capa de capacidades es firmada y verificada, pero no se detalla el mecanismo de firma ni su impacto en la seguridad.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/PINKlab/OSHE-Local-v2)
- [HuggingFace del modelo v1](https://huggingface.co/PINKlab/OSHE-Local-v1)
- [Perfil de la organización PINKlab](https://huggingface.co/PINKlab/models)
- [Referencia de modelos locales (externo, no específico)](https://local-ai-models.ai/)
- [Herramienta para comprobar compatibilidad de GPU](https://www.canirun.ai/)
