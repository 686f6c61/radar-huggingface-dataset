# Emilymiller/contrastive

## Resumen

`Emilymiller/contrastive` es un repositorio experimental publicado en HuggingFace que contiene una implementación de una arquitectura denominada "CNN Transformer" orientada a tareas de aprendizaje contrastivo. No se trata de un modelo entrenado ni de un checkpoint con capacidades generativas: la model card indica explícitamente que el fichero `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests), no un modelo con pesos entrenados ni evaluados en benchmarks.

El repositorio está pensado como andamiaje (codebase) para inspeccionar cambios arquitectónicos antes de lanzar un entrenamiento completo. Incluye el código del modelo en `predict.py`, la configuración de arquitectura en `config.json` y la receta de entrenamiento por defecto en `training_args.json`. La escala declarada es "giant", aunque el recuento real de parámetros en el checkpoint de inicialización es de solo 49.600 parámetros, lo que confirma que no se ha materializado un modelo de gran tamaño.

Por su naturaleza, este repositorio no resuelve un problema de producto ni compite con modelos fundacionales: su relevancia es puramente de investigación y experimentación con arquitecturas híbridas CNN-Transformer con atención lineal, fusión bilineal, activación swish y normalización RMSNorm. No hay pipeline declarado, no hay idiomas soportados declarados y no se reclama ninguna puntuación de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN Transformer (híbrida CNN + Transformer) |
| Parametros totales | 49.600 (checkpoint de inicialización) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada es un "CNN Transformer" con atención lineal (linear attention), fusión bilineal (bilinear fusion), activación swish y normalización RMSNorm. La escala nominal es "giant", pero el checkpoint incluido contiene únicamente 49.600 parámetros, lo que indica que se trata de una inicialización de prueba y no de un modelo a escala real. El código se distribuye como implementación personalizada, por lo que las APIs genéricas de carga automática requieren un adaptador explícito.

En cuanto al entrenamiento, la receta por defecto incluida en `training_args.json` especifica el optimizador Lion con un esquema de calentamiento lineal (linear warmup). La model card aclara que estos son valores de partida del script y no evidencia de una ejecución completada. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El autor recomienda, para una evaluación significativa, entrenar todas las baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- No se declara ninguna capacidad generativa, de razonamiento, de código, matemáticas o visión.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües declaradas (idiomas: no disponibles).
- No hay modo "thinking", visión ni audio.
- El repositorio es un codebase experimental de arquitectura para aprendizaje contrastivo, no un modelo utilizable como servicio.

## Casos de uso

- Investigación en arquitecturas híbridas CNN-Transformer: el código permite inspeccionar cómo se combinan capas convolucionales con atención lineal antes de escalar un entrenamiento.
- Experimentación con atención lineal: sirve como base para comparar coste computacional y comportamiento frente a atención cuadrática estándar en tareas de representación.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite validar que el script `predict.py` carga pesos y ejecuta un forward pass sin errores.
- Estudio de recetas de optimización: la configuración con Lion y linear warmup puede reutilizarse como punto de partida en experimentos controlados.
- Aprendizaje contrastivo sobre dominios específicos: la arquitectura está orientada a este paradigma, por lo que puede adaptarse para tareas de similitud o recuperación tras un entrenamiento real.
- Docencia y reproducción de arquitecturas: útil para quienes quieran estudiar la fusión bilineal y RMSNorm en un código compacto y legible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 49.600 parámetros el checkpoint de inicialización es trivial en memoria (del orden de kilobytes), pero no representa un modelo entrenado.
- GPU recomendadas: no disponible; cualquier GPU consumer puede ejecutar el forward pass del checkpoint de inicialización.
- Cabe en GPU consumer: sí, el checkpoint de inicialización cabe en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: no aplica despliegue estándar; al ser una implementación personalizada, requiere adaptador explícito para APIs de carga automática. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (arquitecturas CNN-Transformer experimentales para aprendizaje contrastivo) con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio; debe tratarse como un punto de partida experimental.
- No hay evaluación de sesgos, alucinación ni comportamiento en producción, porque no existe un modelo entrenado que evaluar.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- No se documenta longitud de contexto, por lo que no puede planificarse su uso en tareas de contexto largo.
- La licencia BSD-3-Clause permite uso comercial, pero la model card advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí publicados.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado, lo que refleja su carácter experimental y no validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Emilymiller/contrastive
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
