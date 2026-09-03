# Bboykoroman/mixer-baseline

## Resumen

El modelo `Bboykoroman/mixer-baseline` es un prototipo de investigación de arquitectura **Mixer** orientado a tareas de **aprendizaje contrastivo**. Desarrollado por Roman Boyko (usuario `Bboykoroman`), se publica como un punto de partida experimental para estudiar configuraciones de mezcladores lineales sin pretensiones de rendimiento. El repositorio incluye un script Python (`main.py`), un `config.json` con la arquitectura generada, un `training_args.json` con la receta de entrenamiento por defecto y un checkpoint `model.safetensors` de inicialización válido únicamente para pruebas de humo.

Con solo **33.088 parámetros** (escala *tiny*), el modelo no está entrenado ni auditado; su propósito es documentar formatos y servir como base para experimentos controlados. Su relevancia actual reside en que ejemplifica una implementación ligera de atención lineal y fusión gated dentro del paradigma Mixer, útil para investigadores que exploran alternativas eficientes a los transformers tradicionales en entornos de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (con atención lineal y fusión gated) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura **Mixer** con atención **lineal** (en lugar de la atención softmax estándar), fusión mediante **gated fusion**, activación **GELU (tanh)** y normalización por **InstanceNorm**. Esta combinación reduce la complejidad computacional frente a los transformers convencionales, aunque al ser un prototipo *tiny* no se reportan detalles sobre el número de capas, dimensión oculta o número de cabezas. El `config.json` contiene la configuración exacta generada, pero no se especifica en la documentación pública.

El entrenamiento no se ha realizado: el checkpoint incluido es una inicialización aleatoria válida para *smoke tests*. La receta por defecto en `training_args.json` propone el optimizador **NovoGrad** con un programador de tasa de aprendizaje **polinomial**, pero se indica explícitamente que son valores de partida, no evidencia de una ejecución completada. No se menciona el conjunto de datos utilizado ni el número de tokens de entrenamiento.

## Capacidades

- **Generación de texto**: no demostrada; el modelo no está entrenado, por lo que no puede generar texto coherente.
- **Razonamiento**: no aplicable en el estado actual.
- **Codigo**: no aplicable.
- **Matematicas**: no aplicable.
- **Vision**: no aplicable (no se menciona entrada multimodal).
- **Tool calling / function calling**: no soportado.
- **Agentes y multi-step reasoning**: no soportado.
- **Capacidades multilingues**: no disponible.
- **Capacidades especiales**: implementa atención lineal y fusión gated, lo que podría interesar para investigación en eficiencia, pero sin entrenamiento no hay capacidades funcionales.

## Casos de uso

- **Investigación en arquitecturas eficientes**: el modelo sirve como banco de pruebas para comparar la atención lineal frente a la atención softmax en tareas contrastivas, manteniendo un presupuesto de cómputo mínimo.
- **Validación de pipelines de entrenamiento**: al ser un checkpoint de inicialización, permite verificar que un script de entrenamiento (por ejemplo, con NovoGrad y schedule polinomial) funciona correctamente antes de escalar a modelos mayores.
- **Pruebas de integración de formatos**: útil para comprobar que el cargador de safetensors y el adaptador personalizado funcionan con una arquitectura Mixer personalizada.
- **Enseñanza de ML**: como ejemplo didáctico de implementación de un Mixer con atención lineal y fusión gated, sin necesidad de recursos de hardware significativos.
- **Experimentos de ablación**: al ser extremadamente pequeño, permite ejecutar múltiples semillas y configuraciones en CPU para estudiar el efecto de la normalización InstanceNorm o la activación GELU-tanh en tareas sintéticas.
- **Desarrollo de adaptadores para Hugging Face**: dado que la carga automática requiere un adaptador explícito, este repositorio puede usarse para practicar la creación de integraciones personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación y que el checkpoint no está entrenado. Cualquier evaluación futura debe realizarse con un conjunto de validación específico, al menos tres semillas y una línea base de capacidad equivalente.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 MB (33.088 parámetros en FP32 ocupan ~132 KB). Cabe en cualquier GPU, incluso integradas.
- **GPU recomendadas**: no se requiere GPU; una CPU moderna es suficiente para inferencia y entrenamiento.
- **¿Cabe en consumer GPU?**: sí, en cualquier GPU con al menos 1 GB de VRAM, y también en CPU sin problema.
- **Opciones de despliegue**: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador o ejecutar `main.py` directamente.
- **Latencia y throughput**: no disponibles, pero al ser tan pequeño, la latencia será del orden de microsegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A nivel de arquitectura, se puede comparar con otros Mixers *tiny* como los de la familia MLP-Mixer (por ejemplo, el `Mixer-B/16` original de Google), pero ese modelo tiene ~59M de parámetros y está entrenado en ImageNet, por lo que la comparación no es significativa. Tampoco hay modelos contrastivos de tamaño similar con los que establecer una comparativa justa. Se indica **no disponible** por falta de datos verificables.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint es una inicialización aleatoria; cualquier salida será ruido y no debe usarse en producción.
- **Sesgos**: no se ha auditado la robustez, equidad ni transferencia de dominio; no hay datos de entrenamiento que puedan introducir sesgos, pero tampoco hay garantías.
- **Riesgo de alucinación**: no aplicable al no generar texto, pero si se entrena sin control, podría presentar alucinaciones como cualquier modelo de lenguaje.
- **Limitaciones de contexto e idioma**: no especificadas; al ser un prototipo, no se ha definido una ventana de contexto ni idiomas soportados.
- **Restricciones de licencia**: licencia MIT permite uso comercial, pero se debe revisar la licencia de los datos externos si se usa con datasets de terceros.
- **Caveat para producción**: no está listo para ningún uso productivo; es exclusivamente un artefacto de investigación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Bboykoroman/mixer-baseline)
- [Perfil del autor en Hugging Face](https://huggingface.co/Bboykoroman)
- [Lista de modelos del autor](https://huggingface.co/Bboykoroman/models)
