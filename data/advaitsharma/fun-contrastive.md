# advaitsharma/fun-contrastive

## Resumen

El modelo `fun-contrastive` es una implementación experimental de MobileViT orientada al aprendizaje contrastivo, publicada por el desarrollador advaitsharma en HuggingFace. No se trata de un modelo entrenado ni de un sistema de IA listo para producción, sino de un checkpoint de inicialización reproducible que incluye la arquitectura, la configuración y un script de ejemplo (`run.py`) para iniciar experimentos.

La arquitectura MobileViT combina bloques convolucionales con atenciones de tipo transformer, lo que resulta en un diseño híbrido eficiente para tareas de visión. Esta variante concreta utiliza atención multi-query, fusión mediante cross-attention, activación mish y normalización por instancia. El tamaño del checkpoint es extremadamente reducido: 24.832 parámetros en total, según los metadatos de safetensors.

La relevancia de este repositorio radica en su valor como punto de partida para investigación en representaciones visuales, especialmente para comparar configuraciones y recetas de entrenamiento. El autor indica explícitamente que no se reivindica ningún resultado de benchmark y que el checkpoint no ha sido entrenado ni auditado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileViT (base) |
| Parámetros totales | 24.832 |
| Longitud de contexto | no disponible (modelo de visión, no aplica) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura MobileViT es un diseño híbrido que intercala capas convolucionales y bloques transformer, lo que permite capturar tanto características locales como dependencias globales en imágenes. En esta implementación concreta, la atención es de tipo multi-query, la fusión de características se realiza mediante cross-attention, la activación es mish y la normalización es instancenorm. El repositorio incluye un `config.json` que registra estos ajustes y un `training_args.json` con la receta experimental por defecto, que utiliza el optimizador Adafactor con un programador de pasos (step schedule).

No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens (al ser un modelo de visión no aplica) ni procesos de alineación como RLHF o DPO. El archivo `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, pero no representa un modelo entrenado. El autor recomienda que, para una evaluación significativa, se entrene el modelo con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias que cualquier línea base.

## Capacidades

- Generación de texto, razonamiento, código, matemáticas o visión funcional: no disponible. El checkpoint no ha sido entrenado, por lo que no ofrece capacidades de inferencia reales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidad especial: el modelo puede utilizarse como plantilla arquitectónica para experimentos de aprendizaje contrastivo en visión, pero requiere entrenamiento previo para producir representaciones útiles.

## Casos de uso

- Investigación en aprendizaje contrastivo: el modelo sirve como punto de partida para estudiar cómo se comporta MobileViT con distintas funciones de pérdida contrastiva, permitiendo comparar configuraciones sin partir de cero.
- Docencia en arquitecturas híbridas: al ser un modelo diminuto y con el código fuente disponible, resulta útil para explicar el funcionamiento de bloques MobileViT, atención multi-query y fusión por cross-attention en entornos académicos.
- Pruebas de humo (smoke tests): el checkpoint de inicialización permite verificar que un pipeline de entrenamiento o carga de pesos funciona correctamente antes de lanzar experimentos costosos.
- Prototipado rápido de pipelines de visión: el script `run.py` incluye un ejemplo ejecutable que facilita iterar sobre recetas de entrenamiento y configuraciones de hiperparámetros.
- Baseline para comparación: el autor sugiere incluir una línea base de capacidad equivalente al evaluar cualquier modelo entrenado a partir de este checkpoint, lo que permite medir el impacto de los cambios.
- Reproducibilidad de experimentos: al incluir `config.json` y `training_args.json`, el repositorio permite registrar y replicar las condiciones exactas de un experimento, lo que es valioso para publicaciones científicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindica ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tratarse de un modelo con 24.832 parámetros, el consumo de memoria es despreciable (inferior a 1 MB en precisión de 32 bits).
- GPU recomendadas: ninguna. El modelo puede ejecutarse en CPU para pruebas de humo.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna o incluso CPU es suficiente.
- Opciones de despliegue: el modelo se carga mediante PyTorch y safetensors. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables publicados con las mismas características (MobileViT base, 24.832 parámetros, checkpoint de inicialización) en la información disponible.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado, por lo que no debe utilizarse como modelo final en ninguna aplicación real.
- No se ha realizado ninguna auditoría de robustez, equidad ni transferencia de dominio.
- El modelo no tiene capacidades de generación de texto, razonamiento ni visión funcional.
- La licencia MIT permite uso comercial, pero el valor práctico del modelo sin entrenamiento es nulo.
- La implementación es personalizada; las APIs de carga genéricas requieren un adaptador explícito antes de su uso, según indica el autor.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/advaitsharma/fun-contrastive
