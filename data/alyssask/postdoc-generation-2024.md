# ALYSSASK/postdoc-generation-2024

## Resumen

El repositorio `ALYSSASK/postdoc-generation-2024` contiene un prototipo experimental de arquitectura **Blip** orientado a tareas de generación, publicado por el usuario ALYSSASK bajo licencia MIT. Se trata de un checkpoint de inicialización con un número de parámetros extremadamente reducido (24.832), lo que lo convierte en una implementación mínima para pruebas de humo y desarrollo de código, no en un modelo entrenado con capacidades demostrables.

La model card indica explícitamente que el archivo `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, pero no se presenta como un checkpoint entrenado ni se reivindica ningún resultado de benchmark. El repositorio incluye un script `finetune.py` como artefacto principal, junto con `config.json` y `training_args.json` que documentan la configuración de arquitectura y el recetario experimental por defecto. Su relevancia actual es puramente metodológica: sirve como punto de partida para investigar la arquitectura Blip con atención de ventana deslizante y fusión bilineal, pero no es apto para ningún uso práctico sin un entrenamiento completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Blip (con atención sliding window, fusión bilineal, activación GELU, normalización LayerNorm) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada en `config.json` corresponde a un modelo **Blip** a escala `base`, con atención de ventana deslizante (sliding window), fusión bilineal, activación GELU y normalización LayerNorm. No se especifica si se trata de un modelo de lenguaje, visión-lenguaje o generación de imágenes; la etiqueta `generation` sugiere un propósito de generación, pero no hay detalles adicionales en la documentación.

El repositorio no incluye información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO). El archivo `training_args.json` define un recetario por defecto con el optimizador `lamb` y un programador de tasa de aprendizaje exponencial, pero la propia model card aclara que son valores iniciales del script, no evidencia de una ejecución completada. No se reporta ningún resultado de entrenamiento ni métricas de evaluación.

## Capacidades

- No se han demostrado capacidades funcionales: el checkpoint es una inicialización sin entrenar.
- Diseñado para tareas de generación según la etiqueta del repositorio, pero sin verificación empírica.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni otras capacidades especiales.
- No se especifican idiomas soportados.

## Casos de uso

Dado que el modelo no está entrenado, no existen casos de uso prácticos reales. Las únicas aplicaciones posibles son:

- **Pruebas de humo en desarrollo**: ejecutar el script `finetune.py` para verificar que el pipeline de entrenamiento funciona correctamente con un checkpoint de inicialización.
- **Investigación de arquitectura**: estudiar el comportamiento de la atención sliding window y la fusión bilineal en un entorno controlado, antes de escalar a modelos mayores.
- **Depuración de código**: utilizar el checkpoint como entrada para validar adaptadores de carga personalizados, dado que la implementación es custom y no compatible con APIs genéricas de HuggingFace.
- **Experimentos de inicialización**: comparar diferentes estrategias de inicialización de pesos en arquitecturas Blip.
- **Desarrollo de recetas de entrenamiento**: probar el optimizador `lamb` y el schedule exponencial en un entorno mínimo.
- **Educación**: ilustrar la estructura de un proyecto de investigación de modelos generativos con configuración reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reivindica ningún resultado y que el checkpoint no está entrenado.

## Requisitos de hardware

- Con solo 24.832 parámetros, el modelo cabe en cualquier hardware, incluso en una CPU sin GPU.
- VRAM estimada: inferior a 1 GB en cualquier cuantización (aunque no se proporcionan cuantizaciones).
- GPU recomendada: no necesaria; cualquier GPU con al menos 1 GB de VRAM sería más que suficiente.
- Opciones de despliegue: al ser una implementación custom, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador explícito.
- Latencia y throughput: no disponibles, pero al ser un modelo minúsculo, la inferencia sería prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría (Blip con 24K parámetros) en el ecosistema público. Los modelos Blip convencionales (como BLIP-2) tienen cientos de millones de parámetros y están entrenados, por lo que no son directamente comparables con este prototipo sin entrenar.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el archivo `model.safetensors` es una inicialización, no un modelo entrenado. No debe usarse para inferencia real.
- **Sin auditoría**: la model card indica que el checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- **Riesgo de alucinación**: al no estar entrenado, cualquier salida sería aleatoria o basada en la inicialización, sin coherencia semántica.
- **Sin soporte de idiomas**: no se especifican idiomas, por lo que no se puede garantizar ningún comportamiento multilingüe.
- **Restricciones de uso comercial**: la licencia MIT permite uso comercial, pero el modelo no es funcional sin entrenamiento previo. Además, la model card advierte que se deben revisar los términos de las fuentes de datos externas si se usan con datasets.
- **Incompatibilidad con APIs estándar**: al ser una implementación custom, no se puede cargar con `AutoModel` u otras APIs genéricas sin un adaptador explícito.
- **Resultados no reproducibles**: no se proporcionan logs de entrenamiento ni versiones de entorno, por lo que cualquier resultado futuro debe documentarse por separado.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/ALYSSASK/postdoc-generation-2024)
