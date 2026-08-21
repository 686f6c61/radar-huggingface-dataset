# luca0621/polyedit-repo-retrained

## Resumen

PolyEdit RePO-polymer-retrained es un adaptador LoRA desarrollado por luca0621 (Taeseung You) sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Su propósito es la optimización molecular de polímeros mediante aprendizaje por refuerzo (RL), utilizando el entrenador XGRPOTrainer del framework RePO y referencias del proyecto PolyEdit. El adaptador se entrena con ocho propiedades de polímeros con igual peso, empleando una recompensa verificable que combina validez de dos anclas, localidad estructural y un verificador de propiedades específico del conjunto de entrenamiento.

Este modelo es relevante porque aplica técnicas de RL a un dominio científico especializado, la ciencia de materiales, donde la generación de estructuras poliméricas válidas y optimizadas es un reto abierto. A diferencia de los checkpoints oficiales de RePO, que solo publican código y recetas de entrenamiento, este adaptador proporciona pesos entrenados, lo que permite a otros investigadores reproducir y extender los resultados. El repositorio tiene un tamaño de 0.1 GB y está publicado bajo una licencia no especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen2.5-3B-Instruct |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB en el repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (formato safetensors, compatible con PEFT) |
| Idiomas soportados | no disponibles (el modelo base soporta multilingüe, pero el adaptador está orientado a tareas científicas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura LoRA (Low-Rank Adaptation) aplicada al modelo Qwen2.5-3B-Instruct. El entrenamiento utiliza el entrenador XGRPOTrainer del framework RePO, que implementa un esquema de aprendizaje por refuerzo con recompensas verificables. El proceso de entrenamiento incluye cuatro generaciones muestreadas por prompt, una recompensa que combina tres componentes: validez de dos anclas (dos-anchor validity), localidad estructural y un verificador de propiedades entrenado solo con datos de entrenamiento. Además, se aplica la pérdida de guía de referencia (reference-guidance loss) y regularización KL para estabilizar el entrenamiento.

El entrenamiento se realiza exclusivamente con los componentes de entrenamiento de PolyEdit, un conjunto de datos de polímeros con anotaciones de propiedades. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni el tiempo de entrenamiento. El adaptador no es un checkpoint oficial de RePO, sino un entrenamiento independiente realizado por el autor.

## Capacidades

- Generación de estructuras poliméricas optimizadas según múltiples propiedades (ocho propiedades con igual peso).
- Validación de estructuras mediante dos anclas, lo que garantiza que las moléculas generadas sean químicamente plausibles.
- Optimización multiobjetivo mediante aprendizaje por refuerzo, con recompensa verificable que combina validez, localidad estructural y propiedades específicas.
- Integración con el framework RePO, lo que permite reproducir el entrenamiento y adaptarlo a otros dominios.
- Capacidad de razonamiento y generación de texto del modelo base Qwen2.5-3B-Instruct, aunque el adaptador está especializado en tareas de polímeros.
- No se han documentado capacidades de tool calling, agentes o multimodales en la información disponible.

## Casos de uso

- Diseño de nuevos polímeros con propiedades específicas: el adaptador puede generar estructuras poliméricas que cumplan con restricciones de propiedades como resistencia mecánica, conductividad o biodegradabilidad, útil en laboratorios de investigación de materiales.
- Optimización de formulaciones existentes: dado un polímero base, el modelo puede proponer modificaciones estructurales que mejoren una o varias propiedades, acelerando el ciclo de experimentación.
- Generación de bibliotecas virtuales de polímeros: para screening computacional, el modelo puede producir miles de candidatos válidos que luego se filtran con simulaciones más costosas.
- Validación de hipótesis en química computacional: los investigadores pueden usar el modelo para explorar el espacio químico de polímeros y contrastar resultados con métodos ab initio.
- Entrenamiento de modelos downstream: las estructuras generadas pueden servir como datos aumentados para otros modelos de predicción de propiedades.
- Benchmarking de algoritmos de RL en dominios científicos: al ser un adaptador entrenado con RePO, sirve como caso de estudio para comparar estrategias de recompensa y regularización en problemas de optimización molecular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que las métricas exactas de entrenamiento y evaluación completa están registradas en el repositorio vinculado y en `training_meta.json`, pero no se proporcionan valores numéricos en la documentación pública.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB), pero requiere cargar el modelo base Qwen2.5-3B-Instruct, que tiene 3 mil millones de parámetros.
- VRAM estimada para inferencia: el modelo base en FP16 requiere aproximadamente 6 GB de VRAM; con cuantización (por ejemplo, 4-bit) puede reducirse a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10) puede ejecutar el modelo base con el adaptador. Para entrenamiento, se necesitaría una GPU con mayor memoria (A100, H100) o técnicas de gradiente acumulado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face, o mediante frameworks como vLLM o TGI si se fusiona con el modelo base. También es compatible con llama.cpp si se convierte a GGUF, aunque no se ha documentado.
- Latencia y throughput: no disponibles, dependen del hardware y del número de generaciones por prompt (el entrenamiento usa cuatro muestras por prompt, pero en inferencia se puede ajustar).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos de optimización de polímeros. Existen otros enfoques como modelos generativos de moléculas (por ejemplo, MolGPT, ChemBERTa) o adaptadores LoRA para tareas científicas, pero no hay datos públicos de rendimiento comparativo. Se recomienda consultar el repositorio de PolyEdit para posibles referencias.

## Limitaciones y advertencias

- El adaptador no es un checkpoint oficial de RePO; fue entrenado de forma independiente por el autor, por lo que los resultados pueden no ser reproducibles con la misma configuración exacta.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se debe contactar al autor antes de usarlo en producción.
- El entrenamiento se realizó con un conjunto de datos específico de polímeros (PolyEdit), por lo que la generalización a otros dominios químicos o moleculares no está garantizada.
- No se han publicado métricas de evaluación en benchmarks estándar, lo que impide validar su rendimiento frente a otros métodos.
- El modelo base Qwen2.5-3B-Instruct puede presentar sesgos y alucinaciones en tareas de generación de texto, aunque el adaptador está restringido a la generación de estructuras poliméricas.
- La validez de las estructuras generadas depende del verificador de dos anclas, que puede no cubrir todos los casos límite de la química de polímeros.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente y poco probado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/luca0621/polyedit-repo-retrained
- Repositorio RePO (código de entrenamiento): https://github.com/tmlr-group/RePO
- Implementación de PolyEdit y evaluación a nivel de registro: https://github.com/promotion-kim/POLYEDIT/tree/tsyou/balanced-polymer-baseline-eval
- Perfil del autor en Hugging Face: https://huggingface.co/luca0621
