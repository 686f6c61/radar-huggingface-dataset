# mrzenin/Uncensored-SLM

## Resumen
Uncensored-SLM (publicado como `OpenIntelligenceNet/LFM3-1.7B-Uncensored`) es una variante ablacionada del modelo LiquidAI/LFM3-1.7B, desarrollada por el usuario mrzenin mediante la herramienta Heretic v2.0.0.dev0. El proceso aplica ablación direccional multiobjetivo sobre el flujo residual para eliminar las direcciones sintéticas de rechazo, preservando en la medida de lo posible las capacidades de seguimiento de instrucciones y razonamiento del modelo base. El resultado es un modelo conversacional sin filtros orientado a roleplay, escritura creativa, investigación de red teaming y despliegue en el borde.

El modelo hereda la arquitectura tri-híbrida de la familia LFM3 de Liquid AI, que combina convoluciones cortas con compuerta, atención de ventana deslizante y capas de atención global. Con 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) y un peso en bfloat16 de 3,5 GB, está pensado para inferencia local en hardware de consumo. Incluye un parche en `modeling_lfm3.py` para que `trust_remote_code=True` funcione sin errores de máscara `linear_attention` en versiones estándar de transformers.

La relevancia de esta ficha radica en documentar un modelo derivado sin filtros de seguridad, con las implicaciones éticas y legales que ello conlleva, y en servir como referencia técnica para quienes evalúan variantes ablacionadas de modelos pequeños para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (LFM3: convoluciones cortas con compuerta, atención de ventana deslizante y atención global) |
| Parametros totales | 1.728.801.536 (~1,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; se asume bfloat16/float16 por el tamaño del repo) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (licencia del modelo base; el autor no especifica términos adicionales) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base LFM3-1.7B emplea una arquitectura tri-híbrida propietaria de Liquid AI que combina tres tipos de capas: convoluciones cortas con compuerta (gated short convolutions), atención de ventana deslizante (sliding-window attention) y atención global. Esta combinación busca reducir el coste computacional y de memoria frente a un transformer denso clásico, manteniendo capacidad de modelado de dependencias de largo alcance. El modelo derivado conserva íntegramente esta arquitectura; solo se modifican los pesos mediante ablación.

El entrenamiento del modelo base no está documentado en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO: no disponible). La modificación realizada por mrzenin consiste en una ablación direccional de rechazo aplicada con Heretic v2.0.0.dev0, usando el modificador `heretic.modifiers.abliteration.Abliteration` y optimización multiobjetivo Pareto con Optuna (100 trials, 30 trials de arranque, batch_size=8, max_response_length=100). La estrategia de exportación es una fusión completa de pesos (MERGE). No se reporta el número de tokens de calibración ni el conjunto de datos utilizado para calcular las direcciones de rechazo.

## Capacidades
- Generación de texto conversacional multi-turno, orientada a diálogo y roleplay sin restricciones de contenido.
- Razonamiento y seguimiento de instrucciones heredados del modelo base LFM3-1.7B, aunque potencialmente degradados por la ablación.
- Escritura creativa sin filtros de contenido.
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizador.
- Compatibilidad con `trust_remote_code=True` y código personalizado (`modeling_lfm3.py` parcheado).
- Capacidad multilingüe: no disponible (no se especifican idiomas).
- Tool calling / function calling: no disponible (no documentado).
- Modo thinking o razonamiento extendido: no disponible (no documentado).
- Visión o audio: no soportado (modelo de texto).

## Casos de uso
- **Roleplay y narrativa interactiva sin filtros:** el modelo está diseñado explícitamente para conversaciones de rol y escritura creativa donde el modelo base aplicaría rechazos. Su tamaño de 1,7 B permite ejecutarlo en local con latencia baja, adecuado para sesiones interactivas.
- **Investigación de red teaming y evaluación de seguridad:** sirve como sujeto de prueba para estudiar cómo la ablación direccional afecta a las tasas de rechazo, la calidad del razonamiento y la coherencia en comparación con el modelo base, en entornos controlados de laboratorio.
- **Generación de datos sintéticos sin restricciones:** útil para crear datasets de diálogo diverso en dominios donde los filtros de seguridad del modelo base limitarían la cobertura, siempre que se revise y filtre posteriormente el contenido generado.
- **Despliegue en el borde (edge AI):** con 1,7 B de parámetros y 3,5 GB en bfloat16, cabe en GPUs de consumo y en dispositivos con memoria unificada, permitiendo inferencia local sin conexión.
- **Prototipado rápido de asistentes conversacionales:** su integración con `transformers` y `device_map="auto"` facilita montar demos locales de chat en minutos, con temperatura y penalización de repetición configurables.
- **Estudio de técnicas de ablación:** el modelo documenta la metodología Heretic (Optuna, 100 trials, MERGE) y sirve como caso de referencia reproducible para quienes investigan modificaciones de pesos en modelos pequeños.
- **Generación de texto creativo en pipelines de publicación:** para autores que necesitan borradores sin censura automática, con revisión humana posterior obligatoria.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- **VRAM estimada para inferencia:** ~3,5 GB en bfloat16/float16 (tamaño del repo); ~1,8-2 GB en cuantización de 8 bits; ~1 GB en 4 bits (estimación por número de parámetros, no verificada).
- **GPU recomendadas:** cualquier GPU con al menos 4 GB de VRAM para bfloat16 (RTX 3050, RTX 4060, RTX 3060). Para mayor throughput, A100 o H100 no son necesarias por el tamaño del modelo; una RTX 4090 ofrece margen sobrado.
- **¿Cabe en consumer GPU?** Sí, en la práctica totalidad de GPUs de consumo modernas con 4 GB o más de VRAM.
- **Opciones de despliegue:** `transformers` con `device_map="auto"` (soporte nativo documentado); vLLM, llama.cpp, Ollama y TGI no están documentados para esta arquitectura híbrida y podrían requerir conversión o soporte adicional.
- **Latencia y throughput:** no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Uncensored-SLM (LFM3-1.7B-Uncensored) | 1,7 B | No disponible | LFM Open License v1.0 | Ablacionado con Heretic; arquitectura híbrida LFM3 |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | No disponible | LFM Open License v1.0 | Modelo original con filtros de seguridad |
| Modelos ablacionados de 1-2 B (p. ej. variantes de Qwen o Llama) | ~1-2 B | No disponible | Según modelo base | No se dispone de comparación cuantitativa publicada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- **Ausencia de filtros de seguridad:** el modelo ha sido ablacionado para eliminar los rechazos; puede generar contenido dañino, ilegal o éticamente cuestionable. El autor declara que los usuarios son los únicos responsables de las salidas y de garantizar un despliegue seguro y legal.
- **Riesgo de alucinación:** inherente a modelos de 1,7 B; la ablación puede agravar la pérdida de coherencia y de seguimiento de instrucciones.
- **Degradación por ablación:** la eliminación de direcciones de rechazo puede afectar negativamente a capacidades de razonamiento y a la calidad general, sin que se hayan publicado evaluaciones al respecto.
- **Sesgos:** no documentados, pero heredados del corpus de entrenamiento del modelo base y potencialmente amplificados por la eliminación de mecanismos de moderación.
- **Licencia:** sujeto a la LFM Open License v1.0 del modelo base; deben revisarse los términos de uso comercial de dicha licencia antes de desplegar en producción.
- **Idiomas:** no se especifican los idiomas soportados; el rendimiento en castellano no está verificado.
- **Soporte de herramientas:** no hay documentación sobre function calling, agentes o modo thinking; no asumir su disponibilidad.
- **Fecha de publicación:** el modelo figura creado el 2026-11-17, con 0 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/mrzenin/Uncensored-SLM)
- [Modelo base LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B)
- [Heretic (herramienta de ablación)](https://github.com/p-e-w/heretic)
