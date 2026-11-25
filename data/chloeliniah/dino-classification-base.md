# chloeliniah/dino-classification-base

## Resumen

`chloeliniah/dino-classification-base` es un repositorio de Hugging Face que contiene una implementación propia de una arquitectura tipo DINO orientada a tareas de clasificación, empaquetada junto con su configuración explícita y un checkpoint de inicialización. Lo publica el usuario `chloeliniah` bajo licencia MIT. No se trata de un modelo entrenado ni de una release con resultados de benchmarks: la propia model card lo describe como un punto de partida reproducible para experimentación, no como un modelo listo para producción.

El artefacto principal es el script `run.py`, que incluye el código del modelo y un punto de entrada ejecutable (ejemplo o entrenamiento). Le acompañan `config.json` con los ajustes de arquitectura generados, `training_args.json` con la receta de experimento por defecto y `model.safetensors`, un checkpoint de inicialización válido para pruebas de humo. El tamaño del repositorio es de 0,0 GB y el recuento de parámetros reportado en safetensors es de 33.088, una cifra extremadamente baja que sugiere un modelo de juguete o un checkpoint incompleto, no una red de escala "base" real.

Su relevancia es limitada y acotada al ámbito de la experimentación: sirve como esqueleto reproducible para probar variantes de atención dilatada, fusión tipo Tucker y normalización ScaleNorm sobre una arquitectura DINO aplicada a clasificación. No debe confundirse con los modelos DINO o DINOv2 de Meta AI, con los que solo comparte nombre genérico de familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINO (implementación propia), atención dilatada, fusión Tucker, activación gelu tanh, normalización ScaleNorm |
| Parametros totales | 33.088 (según safetensors; incoherente con la escala "base" declarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización), PyTorch |

## Arquitectura y entrenamiento

La arquitectura declarada es DINO en escala "base", con atención dilatada, mecanismo de fusión Tucker, activación gelu tanh y normalización ScaleNorm. Se trata de una implementación personalizada, no de una variante estándar de DINO ni de DINOv2, por lo que las APIs genéricas de carga automática de Hugging Face requieren un adaptador explícito para funcionar. El repositorio incluye el código fuente en `run.py`, que contiene tanto la definición del modelo como un bloque `__main__` con un ejemplo de prueba de humo.

No hay evidencia de entrenamiento completado. La receta por defecto usa el optimizador AdamW con un schedule de warmup lineal, pero la model card aclara explícitamente que son valores de partida del script y no prueba de una ejecución finalizada. El checkpoint `model.safetensors` se presenta como inicialización válida para pruebas de humo, no como pesos entrenados. No se documentan volumen de tokens, composición del dataset, ni fases de RLHF o DPO.

## Capacidades

- No se declaran capacidades funcionales verificadas: el checkpoint no ha sido entrenado.
- El código soporta un flujo de clasificación genérico (entrada → logits), pero sin pesos entrenados no produce predicciones útiles.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües.
- No se declaran modos especiales (thinking, visión, audio).
- El valor práctico está en el andamiaje de entrenamiento y en la configuración reproducible, no en inferencia directa.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: usar `model.safetensors` y `config.json` para verificar que un pipeline de carga, forward pass y backward funciona antes de escalar a un experimento real.
- Reproducción de experimentos de arquitectura: partir de la receta AdamW con warmup lineal incluida en `training_args.json` para comparar variantes de atención dilatada o fusión Tucker bajo el mismo presupuesto de cómputo y semillas.
- Investigación sobre normalización ScaleNorm: el repositorio permite aislar el efecto de ScaleNorm frente a LayerNorm o BatchNorm en una tarea de clasificación concreta.
- Docencia y formación: sirve como ejemplo mínimo y legible de implementación de un modelo de clasificación con configuración explícita, útil en cursos de deep learning.
- Base para ablaciones controladas: al ser un esqueleto reproducible, permite entrenar baselines con la misma exposición de datos y presupuesto de tuning, tal como recomienda la propia model card.
- Integración en tests de CI: validar que cambios en dependencias o en el entorno de PyTorch no rompen la carga del checkpoint ni el forward pass.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con rigor; con 33.088 parámetros reportados, la huella sería de kilobytes, pero la incoherencia con la escala "base" impide dar una cifra fiable.
- GPU recomendadas: no disponible; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería sobradamente suficiente para el checkpoint actual.
- Cabe en GPU consumer: sí, con el checkpoint tal como está publicado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el uso previsto es ejecutar `run.py` directamente con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| chloeliniah/dino-classification-base | 33.088 (reportados) | no disponible | MIT | Checkpoint de inicialización, sin entrenar |
| DINOv2 (Meta AI) | 21M–1.1B según variante | no disponible (visión) | Apache 2.0 / CC-BY-NC según variante | Modelo entrenado con benchmarks publicados |
| ResNet-50 (clasificación de referencia) | 25,6M | no aplica | BSD-3 / MIT según implementación | Modelo entrenado, ampliamente validado |

La comparación con DINOv2 o ResNet-50 es solo orientativa por categoría (clasificación); este repositorio no es funcionalmente equivalente a ninguno de ellos al carecer de pesos entrenados.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce predicciones útiles y no debe usarse en producción.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según reconoce la propia model card.
- El recuento de parámetros (33.088) es incompatible con la escala "base" declarada, lo que sugiere un checkpoint incompleto o un modelo de juguete; conviene verificar antes de cualquier uso serio.
- Al ser una implementación personalizada, las APIs automáticas de Hugging Face (por ejemplo, `AutoModel`) no funcionan sin un adaptador explícito.
- Riesgo de confusión con los modelos DINO y DINOv2 de Meta AI: no existe relación documentada entre ambos.
- Licencia MIT permite uso comercial del código, pero deben revisarse por separado los términos de los datasets externos que se usen para entrenar.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque no hay modelo entrenado que evaluar.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chloeliniah/dino-classification-base
- DINO original (Meta AI, referencia de familia, no relacionado directamente): https://github.com/facebookresearch/dino
- DINOv2 (Meta AI, referencia de familia, no relacionado directamente): https://github.com/facebookresearch/dinov2
