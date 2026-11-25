# felix-tran/phd-classification

## Resumen

`felix-tran/phd-classification` es un repositorio experimental publicado en Hugging Face que contiene una implementación propia de un transformer de tipo "tiny" orientado a tareas de clasificación. Lo desarrolla el usuario `felix-tran` y se distribuye bajo licencia MIT. No se trata de un modelo entrenado listo para producción, sino de un esqueleto de código y una inicialización de pesos pensada para pruebas de humo (smoke tests) y para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

El modelo tiene únicamente 16.576 parámetros totales según el archivo `model.safetensors`, lo que lo sitúa en un orden de magnitud muy inferior al de cualquier modelo de lenguaje utilizable. La model card describe una arquitectura "Tiny Transformer" con atención flash, fusión por tensor, activación GELU y normalización ScaleNorm, entrenada por defecto con Adafactor y un schedule de warmup constante.

Su relevancia actual es limitada y de carácter didáctico o de investigación metodológica: sirve como plantilla reproducible para experimentos de clasificación con arquitecturas personalizadas y como ejemplo de configuración de receta de entrenamiento. El propio autor advierte que el checkpoint incluido no ha sido entrenado ni auditado, y que no se reclama ninguna puntuación de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención flash, tensor fusion, GELU, ScaleNorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala "tiny" con atención de tipo flash, fusión mediante tensor fusion, función de activación GELU y normalización ScaleNorm. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto, que emplea el optimizador Adafactor con un schedule de warmup constante. El autor insiste en que estos valores son puntos de partida del script y no evidencia de una ejecución completa.

No se especifican datos de entrenamiento: no hay información sobre número de tokens, composición del dataset, ni sobre fases de RLHF, DPO o ajuste supervisado. El archivo `model.safetensors` se presenta explícitamente como un checkpoint de inicialización válido para pruebas de humo, no como un modelo entrenado. La implementación es personalizada, por lo que las APIs genéricas de carga automática requieren un adaptador explícito.

## Capacidades

- Clasificación de texto: es el único uso previsto según la model card y los tags del repositorio.
- No se documenta generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (thinking mode, audio, visión): no disponibles.

## Casos de uso

- Pruebas de humo de pipelines de clasificación: el checkpoint de inicialización permite verificar que el código de carga, preprocesado e inferencia funciona antes de invertir recursos en un entrenamiento real.
- Plantilla para experimentos de arquitectura: el repositorio separa `config.json` y `training_args.json`, lo que facilita variar atención, normalización o receta de optimización y comparar configuraciones de forma controlada.
- Docencia y formación: con 16.576 parámetros, el modelo es lo bastante pequeño para inspeccionar el grafo completo, los pesos y el flujo de datos en un aula o taller sin necesidad de GPU.
- Referencia de receta de entrenamiento: el uso de Adafactor con warmup constante sirve como base reproducible para comparar baselines con la misma exposición de datos, presupuesto de ajuste y semillas, tal como recomienda el autor.
- Integración en tests unitarios de CI: al ser un artefacto mínimo en safetensors, puede incorporarse a suites de pruebas que validen serialización, carga y formas de tensores en frameworks propios.
- Punto de partida para clasificación de dominio específico (por ejemplo, clasificación de nivel académico o PhD, a juzgar por el nombre del repositorio): el autor sugiere evaluar sobre un split etiquetado específico de la tarea, reportando la métrica en al menos tres semillas y con un baseline de capacidad equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 16.576 parámetros, los pesos en fp32 ocupan aproximadamente 66 KB, por lo que el modelo cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: no aplica; cualquier GPU con soporte CUDA o incluso ejecución en CPU es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), así como en entornos sin GPU.
- Opciones de despliegue: al ser una implementación personalizada, requiere el `predict.py` del repositorio o un adaptador explícito; no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| felix-tran/phd-classification | 16.576 | no disponible | MIT | Checkpoint de inicialización, sin entrenar |
| Modelos de clasificación tipo BERT-base | ~110 M | 512 tokens (típico) | variable | Entrenados y evaluados en benchmarks |
| Modelos de clasificación tipo DistilBERT | ~66 M | 512 tokens (típico) | variable | Entrenados y evaluados en benchmarks |
| Clasificadores lineales (TF-IDF + regresión) | Órdenes de magnitud menores | no aplica | variable | Baseline reproducible |

No se dispone de datos de rendimiento del modelo para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son una inicialización, por lo que las predicciones carecen de valor semántico.
- No se ha auditado el modelo en robustez, equidad ni transferencia de dominio, según reconoce el autor.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide planificar su uso en producción.
- Riesgo de alucinación y sesgos: no evaluables, dado que el modelo no está entrenado.
- Licencia MIT: permite uso comercial, pero el autor advierte de revisar por separado los términos de los datos de origen si se emplean datasets externos.
- Implementación personalizada: las APIs de carga automática de Hugging Face no funcionan sin un adaptador explícito, lo que añade fricción de integración.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto incluidos en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/felix-tran/phd-classification
