# FAIRC/token-averaging-model1_50m_tied

## Resumen

FAIRC/token-averaging-model1_50m_tied es un checkpoint de investigación publicado por el grupo FAIRC dentro de un proyecto dedicado al estudio de técnicas de promediado de tokens (token averaging) en modelos de lenguaje. El modelo, de aproximadamente 50,9 millones de parámetros, corresponde a una arquitectura transformer de 8 capas con 512 dimensiones ocultas y una ventana de contexto de 1024 tokens, con embeddings atados (tie_embeddings). El repositorio contiene exclusivamente un volcado de pesos en formato PyTorch (`.pt`), junto con un registro de pérdidas (`loss_log.csv`) y la configuración en `config.json`. No se trata de pesos compatibles con Hugging Face `transformers`, sino de un state_dict crudo que requiere reconstruir la arquitectura desde el código fuente del proyecto (OLMAveraged / OLMTransformerBody). La relevancia de este modelo es estrictamente académica: sirve como punto de partida para reproducir experimentos sobre promediado de tokens y analizar su efecto en el entrenamiento de modelos pequeños. No se proporciona información sobre licencia, idiomas soportados, ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMAveraged / OLMTransformerBody) con promediado de tokens |
| Parametros totales | 50.897.408 (aprox. 50,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch state_dict (`checkpoints/final.pt`) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer estándar (OLM) modificada con una capa de promediado de tokens (`averaging_k=1`), que probablemente promedia representaciones de tokens adyacentes antes de la atención. La configuración incluye `d_model=512`, `n_heads=8`, `n_layers=8`, `context_len=1024`, `tie_embeddings=true`. El entrenamiento se planificó para un total de 1.000 millones de tokens (`target_tokens=1000000000`), con una tasa de aprendizaje de 2e-4 y 2000 pasos de warmup. No se especifica el dataset utilizado, ni si se aplicaron técnicas de alineación como RLHF o DPO. El checkpoint guarda el paso de entrenamiento, el número de tokens vistos y los FLOPs acumulados, lo que permite reconstruir la trayectoria de entrenamiento.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje autoregresivo, puede generar texto, aunque su pequeño tamaño limita la calidad y coherencia.
- Razonamiento básico: capacidades limitadas, propias de un modelo de ~50M de parámetros.
- Sin soporte conocido de tool calling, function calling, agentes o multi-step reasoning.
- Sin capacidades multimodales (visión, audio, etc.).
- Multilingüismo: no se declaran idiomas soportados; probablemente entrenado con datos en inglés, pero no confirmado.
- Capacidad experimental: diseñado para estudiar el efecto del promediado de tokens, no como modelo de propósito general.

## Casos de uso

- Investigación académica sobre token averaging: el modelo permite reproducir los experimentos del proyecto y comparar la dinámica de pérdida con modelos sin promediado.
- Análisis de la evolución del entrenamiento: el `loss_log.csv` y los metadatos del checkpoint (paso, tokens, FLOPs) facilitan estudios sobre curvas de aprendizaje y eficiencia computacional.
- Desarrollo de arquitecturas alternativas: los pesos pueden servir como punto de partida para fine-tuning experimental en tareas de lenguaje muy específicas y de baja complejidad.
- Benchmarking de técnicas de regularización: al ser un modelo pequeño, es útil para probar hipótesis sobre promediado de tokens antes de escalar a modelos mayores.
- Educación en ingeniería de modelos: el código de carga y la configuración permiten a estudiantes entender cómo se estructura un proyecto de investigación de LLMs.
- No es adecuado para producción ni para aplicaciones reales, dado su tamaño, falta de licencia clara y ausencia de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~200 MB en FP32 (50,9M parámetros × 4 bytes), por lo que cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (ej. NVIDIA GTX 1050, RTX 3050, o incluso CPU).
- Inferencia en CPU: viable, con latencia de decenas de ms por token en hardware moderno.
- Opciones de despliegue: al no ser compatible con `transformers` directamente, requiere cargar el state_dict manualmente con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de modelos comparables directos. Podría contrastarse con otros modelos pequeños como GPT-2 (124M) o Pythia-70M, pero al no haber benchmarks publicados, cualquier comparación sería especulativa. Se indica "no disponible".

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para uso general.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere contacto con los autores.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La arquitectura no es estándar y requiere reconstrucción manual desde el código fuente; no se puede cargar con `AutoModel`.
- Tamaño muy reducido: la calidad de generación será baja comparada con modelos modernos.
- No se han publicado evaluaciones de seguridad ni de rendimiento.
- La fecha de creación (2026) sugiere que es un proyecto reciente, pero no hay evidencia de mantenimiento o soporte.

## Enlaces

- Repositorio HuggingFace: [FAIRC/token-averaging-model1_50m_tied](https://huggingface.co/FAIRC/token-averaging-model1_50m_tied)
- No se han encontrado otros enlaces (papers, blogs, repos) en la información proporcionada.
