# btsa-ntos/class-contrastive

## Resumen

`btsa-ntos/class-contrastive` es un repositorio experimental que contiene una implementación minimalista de un Tiny Transformer orientado a aprendizaje contrastivo. Lo ha desarrollado el usuario de HuggingFace `btsa-ntos` (田中 蓮) como un entorno ligero para inspeccionar cambios arquitectónicos antes de lanzar entrenamientos completos. El modelo tiene 49.600 parámetros en formato `safetensors` y se distribuye bajo licencia Apache-2.0.

No se trata de un modelo entrenado: el archivo `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, y el propio autor indica explícitamente que no presenta ninguna puntuación de benchmark ni resultados de entrenamiento. La arquitectura propuesta incluye atención dilatada, fusión mediante co-atención, activación approximada GELU y normalización ScaleNorm.

Su relevancia es, por tanto, metodológica: sirve como punto de partida para experimentar con variantes de atención y mecanismos de fusión en modelos muy pequeños, sin los costes de un entrenamiento a escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer |
| Parametros totales | 49.600 |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer en miniatura, con atención dilatada y un módulo de fusión basado en co-atención. La activación empleada es una aproximación de GELU y la normalización usa ScaleNorm. La configuración viene registrada en `config.json`. El código está en `inference.py`, que incluye un ejemplo de entrada y un punto de arranque para entrenamiento.

La receta de entrenamiento por defecto, definida en `training_args.json`, usa el optimizador LAMB con una programación polinomial. Sin embargo, el autor aclara que estos valores son solo puntos de partida, no evidencia de un entrenamiento completado. No se menciona ningún proceso de RLHF, DPO ni ajuste fino posterior. El checkpoint incluido es un inicializador aleatorio para pruebas de humo, no un modelo entrenado.

## Capacidades

- Generación de texto: no disponible. El modelo no está entrenado, por lo que no produce texto coherente.
- Razonamiento o matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no implementado.
- Soporte de agentes o razonamiento multi-paso: no implementado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, etc.): no disponible.
- La única capacidad demostrada es la de servir como plataforma para experimentar con arquitecturas de transformer de muy pequeño tamaño, incluyendo un ejemplo ejecutable que permite validar la implementación con un checkpoint de inicialización.

## Casos de uso

- Investigación de arquitecturas de atención: el repositorio permite probar variantes de atención dilatada y co-atención en un modelo de 49.600 parámetros, facilitando la comparación de costes computacionales y efectos sobre el gradiente antes de escalar.
- Pruebas de humo de pipelines de entrenamiento: mediante el script `inference.py` y el checkpoint de inicialización se pueden verificar que los bucles de entrenamiento, la carga de datos y las funciones de pérdida funcionan sin errores con una GPU modesta.
- Enseñanza de conceptos de transformers: al ser un ejemplo mínimo y legible, resulta útil en cursos o talleres donde se quiere mostrar cómo se construye un transformer desde cero con atención personalizada.
- Comparación de mecanismos de normalización: activaciones approximadas y ScaleNorm pueden evaluarse en un entorno controlado y de baja escala para estudiar su estabilidad numérica.
- Desarrollo de adaptadores de carga: al ser una implementación custom, sirve para practicar la escritura de adaptadores que permitan cargar los pesos en APIs de HuggingFace de uso genérico.
- Experimentación con pérdidas contrastivas: la estructura del proyecto está pensada para entrenar con objetivos contrastivos, de modo que se pueden probar funciones de pérdida y estrategias de muestreo negativo sin invertir en infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que no se reclama ninguna puntuación de evaluación y que el checkpoint de inicialización no ha sido entrenado. Por tanto, no se dispone de datos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark comparable.

## Requisitos de hardware

- VRAM estimada: inferiores a 1 GB. Con 49.600 parámetros, el modelo puede ejecutarse en CPU sin dificultad.
- GPU recomendadas: cualquier GPU disponible, incluso integradas o de gama baja, ya que el requisito es mínimo.
- Compatibilidad con GPU de consumo: sí, absolutamente. Es posible ejecutarlo en hardware doméstico, incluidos portátiles sin GPU dedicada, si se utiliza una implementación en CPU.
- Opciones de despliegue: el propio script `inference.py` es el punto de entrada. No se recomienda usar vLLM, llama.cpp, Ollama ni TGI, porque el modelo no es útil para inferencia real y la implementación requiere un adaptador explícito para cargarse con APIs genéricas.
- Latencia y throughput: no disponibles. No hay datos de rendimiento publicados.

## Comparativa con modelos similares

No disponible. El modelo es un experimento de 49.600 parámetros sin resultados comparativos publicados. No se dispone de información sobre modelos equivalentes en la misma categoría (tiny transformers para contrastivo) que permitan una comparación rigurosa de parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- Riesgo de alucinación: no aplica como modelo de lenguaje, ya que no genera texto.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, pero hay que revisar los términos de los datos fuente si el repositorio se usa con datasets externos.
- Advertencia importante para producción: este modelo no debe usarse en ningún escenario de producción. El checkpoint es un inicializador de prueba, no un modelo entrenado, y cualquier resultado de un futuro entrenamiento debe documentarse por separado de los valores por defecto aquí incluidos.
- Incompatibilidad con APIs genéricas: al ser una implementación personalizada, la carga automática con APIs estándar requiere un adaptador explícito.

## Enlaces

- Modelo: https://huggingface.co/btsa-ntos/class-contrastive
- Perfil del autor: https://huggingface.co/btsa-ntos
- Lista de modelos del autor: https://huggingface.co/btsa-ntos/models
