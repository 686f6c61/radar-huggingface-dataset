# joshuagreen/cv-classification

## Resumen

El modelo `joshuagreen/cv-classification` es una implementación compacta y personalizada en PyTorch de un **Cnn Transformer** orientado a tareas de clasificación. Lo desarrolla el autor Joshua Green, y se publica como un repositorio de código con un checkpoint de inicialización, no como un modelo preentrenado listo para producción. Su configuración `tiny` (16.576 parámetros) está pensada para revisión de código, pruebas de humo y experimentos controlados a pequeña escala.

La relevancia de este modelo es principalmente didáctica y de investigación: permite estudiar una arquitectura híbrida CNN-transformer con atención de ventana deslizante y fusión tensorial, sin la complejidad de un sistema de gran escala. No se presentan resultados de benchmarks ni se afirma que el checkpoint tenga capacidades reales de clasificación. Es un punto de partida experimental para quienes quieran explorar arquitecturas ligeras o validar pipelines de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrido CNN + transformer) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con un transformer que utiliza **atención de ventana deslizante** (sliding window attention), lo que reduce el coste computacional frente a la atención global. La fusión de características se realiza mediante **tensor fusion**, y la activación empleada es ReLU. La normalización es **ScaleNorm**, una variante de normalización que escala las activaciones sin restar la media, lo que puede simplificar el entrenamiento en modelos pequeños.

El repositorio incluye un `config.json` con la configuración generada y un `training_args.json` con una receta experimental por defecto que usa el optimizador **LAMB** con programación de tasa de aprendizaje coseno. Sin embargo, el autor indica explícitamente que estos son valores iniciales del script, no evidencia de un entrenamiento completado. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, pero no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.

## Capacidades

- **Clasificación genérica**: el modelo está diseñado para tareas de clasificación, pero al ser un checkpoint de inicialización sin entrenamiento, no tiene capacidades funcionales reales.
- **Arquitectura híbrida CNN-transformer**: permite experimentar con la combinación de extracción de características locales (CNN) y modelado de dependencias de largo alcance (transformer con ventana deslizante).
- **Código de ejemplo ejecutable**: incluye `inference.py` con un ejemplo de prueba de humo, útil para verificar el flujo de datos y la integración del modelo.
- **Personalización**: al ser una implementación propia, se puede adaptar fácilmente a diferentes configuraciones de capas, atención y fusión.
- **Sin capacidades de tool calling, agentes, visión o audio**: no se declaran ni se infieren de la documentación.

## Casos de uso

- **Pruebas de humo en pipelines de ML**: el checkpoint de inicialización permite verificar que el código de entrenamiento e inferencia funciona correctamente antes de lanzar experimentos completos.
- **Estudio académico de arquitecturas híbridas**: investigadores pueden analizar el comportamiento de la atención de ventana deslizante y la fusión tensorial en un modelo mínimo, comparando con variantes estándar.
- **Validación de infraestructura de entrenamiento**: sirve para probar configuraciones de optimizador (LAMB), programación coseno y estrategias de seed en entornos de desarrollo.
- **Desarrollo de adaptadores para carga automática**: al ser una implementación personalizada, se puede usar como caso de prueba para escribir adaptadores que permitan cargar el modelo con APIs genéricas.
- **Experimentos de regularización y normalización**: la normalización ScaleNorm y la activación ReLU ofrecen un banco de pruebas para estudiar su efecto en modelos muy pequeños.
- **Educación en arquitecturas ligeras**: adecuado para cursos o talleres donde se quiera mostrar un transformer compacto sin los requisitos de hardware de los modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación de referencia y que el checkpoint no está entrenado. Cualquier evaluación futura debe realizarse con un conjunto de datos etiquetado específico de la tarea, reportando la métrica correspondiente en al menos tres semillas y comparando con una línea base de capacidad equivalente.

## Requisitos de hardware

- **VRAM estimada**: al tener solo 16.576 parámetros, el modelo cabe en cualquier GPU moderna, incluso en las más básicas. El uso de memoria es despreciable (menos de 1 MB en precisión flotante).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso CPU es viable para inferencia.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (GTX 1060, RTX 3060, etc.) puede ejecutarlo sin problemas.
- **Opciones de despliegue**: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador o ejecutar el script `inference.py` incluido.
- **Latencia y throughput**: no se dispone de datos medidos, pero dada la escala mínima, la latencia es del orden de milisegundos en CPU y microsegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (implementaciones híbridas CNN-transformer de escala tiny). El autor sugiere comparar con una línea base de capacidad equivalente, pero no proporciona referencias concretas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: el modelo no tiene capacidades de clasificación reales; cualquier uso en producción sería inapropiado.
- **Sin auditoría de robustez o sesgos**: el autor indica que el checkpoint no ha sido auditado para robustez, equidad o transferencia de dominio.
- **Riesgo de alucinación**: no aplica, ya que no es un modelo generativo de lenguaje.
- **Limitaciones de contexto e idioma**: no se especifican, pero al ser un modelo de clasificación genérico, no tiene soporte lingüístico declarado.
- **Restricciones de licencia**: la licencia BSD-3-Clause permite uso comercial y modificación, pero el autor advierte que se deben revisar los términos de los datos externos si se usa con conjuntos de datos propios.
- **Carga automática no trivial**: al ser una implementación personalizada, las APIs genéricas de HuggingFace no lo cargarán sin un adaptador explícito.
- **Resultados futuros deben documentarse por separado**: cualquier resultado de un checkpoint entrenado debe publicarse con sus propios logs y entorno, no con los valores por defecto del repositorio.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/joshuagreen/cv-classification)
- [Perfil de GitHub del autor](https://github.com/Joshua-Green-ai/)
- [Artículo relacionado: Optimizing Automatic CV Classification with Contrastive and Generative Models](https://www.sciencedirect.com/science/article/pii/S1877050925022409)
- [PDF: Optimizing Curriculum Vitae Concordance: A Comparative Examination of Classical Machine Learning Algorithms and Large Language Model Architectures](https://www.researchgate.net/publication/382928041_Optimizing_Curriculum_Vitae_Concordance_A_Comparative_Examination_of_Classical_Machine_Learning_Algorithms_and_Large_Language_Model_Architectures)
