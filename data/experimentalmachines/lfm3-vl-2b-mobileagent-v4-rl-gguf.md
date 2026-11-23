# experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v4-RL-GGUF es una cuantización en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la actuación autónoma sobre interfaces de teléfono Android. El modelo parte de la familia LFM3-VL de Liquid AI, de arquitectura vision-language de aproximadamente 1.728 millones de parámetros, y ha sido especializado mediante aprendizaje por refuerzo sobre demostraciones grabadas para interpretar capturas de pantalla y emitir acciones de GUI. El autor del ajuste y de la cuantización es experimentalmachines.

La relevancia de esta ficha reside en que es el artefacto exacto sobre el que se ejecutaron las evaluaciones publicadas del proyecto: un GGUF Q4_K_M del modelo de lenguaje acompañado del proyector visual Q8_0 sin modificar respecto al modelo base de LiquidAI. Esto permite reproducir el pipeline de inferencia con llama.cpp en hardware modesto, incluidos dispositivos móviles, algo poco habitual en modelos de agentes GUI.

Se trata de un modelo de investigación con licencia LFM Open License v1.0, entrenado exclusivamente con objetivos en inglés y una única captura de pantalla por paso, sin memoria más allá de un historial de texto de 8 pasos. No está pensado para operar de forma desatendida sobre cuentas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (LFM3-VL de Liquid AI); proyector visual separado |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración de servicio en las evaluaciones) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector visual (mmproj) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (llama.cpp) |
| Entrada multimodal | Imagen (captura de pantalla) + texto; máximo 1024 tokens de imagen |
| Modelo base | experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL |
| Tamaño del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de LFM3-VL-2B, un modelo vision-language de Liquid AI con un backbone transformer de aproximadamente 1,7 mil millones de parámetros y una torre visual acoplada mediante un proyector multimodal. La cuantización GGUF mantiene el proyector visual en Q8_0 sin cambios respecto a LiquidAI/LFM3-VL-2B-GGUF, ya que el ajuste fino no modificó la torre de visión; solo el modelo de lenguaje se cuantizó a Q4_K_M.

El entrenamiento del modelo base v4-RL se realizó mediante aprendizaje por refuerzo sobre demostraciones grabadas de interacción con teléfonos Android; el autor indica explícitamente que el modelo nunca interactuó con un teléfono real durante el entrenamiento. El proceso de conversión a GGUF se hizo con llama.cpp en el commit `cd959bae9` (convert_hf_to_gguf.py a F16 y posterior llama-quantize Q4_K_M), procedimiento que el autor afirma reproducible byte a byte. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO más allá del ajuste por refuerzo mencionado.

## Capacidades

- Comprensión de capturas de pantalla de interfaces Android y emisión de acciones de GUI (gui-agent, mobile-agent).
- Razonamiento multimodal imagen-texto con formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Generación de texto conversacional en inglés.
- Ejecución paso a paso de objetivos expresados en lenguaje natural sobre una pantalla, con historial de texto de hasta 8 pasos.
- Integración con llama.cpp mediante `llama-server`, con soporte de endpoints compatibles.
- Procesamiento de una imagen por paso, limitada a 1024 tokens de imagen.
- No se documenta soporte de tool calling, function calling, audio ni otras modalidades en la información disponible.

## Casos de uso

- Automatización de pruebas de UI en Android: el modelo puede interpretar capturas de pantalla de una app y proponer la siguiente acción (pulsar, deslizar, escribir), integrándose en un harness de pruebas para detectar flujos rotos sin intervención manual.
- Investigación en agentes GUI: sirve como referencia reproducible para comparar estrategias de percepción-acción sobre móvil, ya que el autor publica el código, los constructores de datos y los resultados con su fuente.
- Prototipado de asistentes de accesibilidad: dado un objetivo en inglés y una captura de pantalla, el modelo sugiere el siguiente paso para guiar a un usuario con dificultades motoras, siempre con supervisión humana.
- Evaluación de modelos vision-language pequeños en edge: con 1,3 GB en Q4_K_M y proyector Q8_0, permite desplegar un agente multimodal en hardware con recursos limitados mediante llama.cpp.
- Generación de datos sintéticos de interacción móvil: el modelo puede producir trayectorias de acciones sobre capturas reales para ampliar datasets de entrenamiento de agentes GUI, revisadas posteriormente por humanos.
- Docencia y demostraciones de RL aplicado a agentes: el pipeline completo (datos, entrenamiento, cuantización, evaluación) es reproducible y adecuado para explicar el ciclo de un agente visual de extremo a extremo.
- Análisis de flujos de onboarding en apps: ejecutando el modelo sobre capturas de pantalla de un flujo concreto, se pueden identificar pasos donde el agente se bloquea o requiere información adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-2 GB con el modelo Q4_K_M (1,3 GB de pesos) más el proyector visual Q8_0 y la caché de contexto de 8192 tokens; el consumo real depende de la implementación y del número de tokens de imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para ejecución completa en GPU (`-ngl 99`); tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más; también es viable en CPU y en dispositivos Android mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj`), y cualquier frontend compatible con GGUF y endpoints compatibles; el autor documenta el comando exacto de servicio.
- Latencia y throughput estimados: no disponible; el autor no publica cifras de latencia o tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4-RL-GGUF | ~1,73 B | 8192 (config. de servicio) | Imagen + texto | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-VL-2B | ~1,73 B (no confirmado en la información) | no disponible | Imagen + texto | LFM Open License v1.0 | safetensors / GGUF |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL | ~1,73 B | no disponible | Imagen + texto | LFM Open License v1.0 | safetensors (presumible) |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros agentes GUI (por ejemplo, modelos especializados en mobile-agent de otros autores), por lo que la comparativa se limita a la relación con el modelo base y su versión sin cuantizar.

## Limitaciones y advertencias

- Modelo de investigación: el autor advierte explícitamente de que no debe operar de forma desatendida en un teléfono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en inglés; no hay soporte multilingüe documentado.
- Procesa una única captura de pantalla por paso y no mantiene memoria más allá de un historial de texto de 8 pasos.
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono real durante el entrenamiento, lo que puede provocar un desajuste entre distribución de entrenamiento y entorno real.
- Riesgo de alucinación en la interpretación de capturas y en la selección de acciones, especialmente en interfaces no vistas durante el entrenamiento.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar (OSI) y puede imponer restricciones.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en F16; no se han publicado comparativas de degradación en la información disponible.
- El proyector visual no fue ajustado, por lo que las capacidades de percepción visual son las del modelo base LFM3-VL-2B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL-GGUF
- Modelo base sin cuantizar: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL
- Modelo original de Liquid AI (GGUF): https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentación de modelos del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Licencia: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4-RL-GGUF/blob/main/LICENSE
