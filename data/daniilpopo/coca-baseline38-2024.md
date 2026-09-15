# DaniilPopo/coca-baseline38-2024

## Resumen

Coca-baseline38-2024 es una implementación de la arquitectura Coca (Contrastive Captioners) orientada a tareas de recuperación (retrieval), desarrollada por DaniilPopo. El modelo se publica en configuración nano, con un total de 24.832 parámetros, y se presenta como un punto de partida experimental para pruebas de humo (smoke tests) y validación de código, no como un modelo entrenado para producción.

La arquitectura combina atención dilatada con fusión mediante cross attention, activación GELU tanh y normalización Instancenorm. El repositorio incluye el código Python con el modelo y un ejemplo ejecutable, junto con los ficheros de configuración y un checkpoint de inicialización en formato safetensors. La model card indica explícitamente que no se reivindica ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado para robustez, equidad ni transferencia de dominio.

El modelo resulta relevante como referencia técnica para investigadores que quieran estudiar la arquitectura Coca en tareas de retrieval con una implementación transparente y reproducible. No obstante, al carecer de pesos entrenados, no es apto para su uso directo en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es Coca, una variante de arquitectura multimodal pensada para tareas de recuperación. En esta implementación se emplea atención dilatada (dilated attention), que permite expandir el campo receptivo sin aumentar de forma lineal el coste computacional, y una fusión de información mediante cross attention entre las modalidades o representaciones implicadas. La activación utilizada es GELU con variante tanh, y la normalización se realiza mediante Instancenorm.

En cuanto al entrenamiento, el repositorio no proporciona datos de entrenamiento ni evidencia de una ejecución completa. El fichero `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, pero no está entrenado. La configuración incluida define un experimento por defecto con optimizador Adam y un calendario de calentamiento lineal (linear warmup), aunque estos valores se presentan como punto de partida y no como resultados de una ejecución finalizada. No se menciona ningún proceso de RLHF, DPO ni ajuste posterior. Tampoco se detalla el dataset utilizado para entrenamiento.

## Capacidades

- Ejecución de pruebas de humo (smoke tests) para validar la implementación de la arquitectura Coca.
- No es capaz de generar texto, razonar, escribir código ni realizar tareas matemáticas, al no contar con pesos entrenados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso en agentes.
- No dispone de capacidades multilingües, de visión ni de audio, ya que no se especifican y el modelo no está entrenado.
- Puede servir como base para experimentos de investigación sobre retrieval, pero sin resultados funcionales.

## Casos de uso

- Investigación sobre arquitectura Coca: el modelo puede utilizarse como referencia para estudiar el comportamiento de la atención dilatada y la fusión por cross attention en tareas de recuperación, mediante la ejecución de los scripts incluidos.
- Validación de pipelines de entrenamiento: el checkpoint de inicialización permite comprobar que el código de entrenamiento y evaluación funciona correctamente antes de lanzar un entrenamiento completo.
- Comparativa de arquitecturas: al ser una implementación pequeña y transparente, puede servir para comparar el coste computacional y la estructura de la arquitectura Coca frente a otros modelos de retrieval de tamaño similar.
- Pruebas de reproducibilidad: el repositorio incluye ficheros de configuración y un script de evaluación, lo que facilita la reproducción de experimentos en entornos controlados.
- Punto de partida para ajuste fino: los desarrolladores podrían tomar la arquitectura y entrenarla desde cero con sus propios datos, aunque el checkpoint actual no aporta capacidades útiles.
- Documentación y enseñanza: el código fuente puede utilizarse con fines educativos para entender cómo se implementa un modelo de retrieval basado en Coca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindica ninguna puntuación de benchmark y que el checkpoint no está entrenado. Cualquier evaluación futura debe documentarse por separado, incluyendo el número de semillas y los datos utilizados.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable, al tratarse de un modelo con 24.832 parámetros. El checkpoint ocupa 0.0 GB, por lo que puede cargarse en cualquier dispositivo con memoria suficiente.
- GPU recomendadas: no se requiere ninguna GPU específica. El modelo puede ejecutarse en CPU o en cualquier GPU, incluso en hardware antiguo o integrado.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo, como una RTX 3060 o inferior, es más que suficiente.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. El propio repositorio indica que las APIs genéricas de carga automática requieren un adaptador.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría, dado que Coca-baseline38-2024 es un checkpoint de inicialización no entrenado con un número de parámetros extremadamente reducido. No se pueden comparar capacidades ni rendimiento con modelos de retrieval reales, como CLIP o CoCa entrenados, ya que no existen métricas publicadas ni pesos funcionales.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado, por lo que no puede generar resultados útiles en tareas reales de retrieval ni en ningún otro dominio.
- No se ha auditado en términos de robustez, equidad o transferencia de dominio, tal y como reconoce la propia model card.
- No se han evaluado sesgos conocidos, pero al no existir entrenamiento, no se puede afirmar que esté libre de ellos.
- Riesgo de alucinación: no aplica en el sentido tradicional, pero el modelo no produce texto ni predicciones fiables.
- La licencia BSD-3-Clause permite el uso comercial, pero se deben revisar los términos de las fuentes de datos externas si se utiliza el modelo con datasets de terceros.
- El modelo es un punto de partida experimental y no debe usarse en producción sin un entrenamiento completo y una evaluación rigurosa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DaniilPopo/coca-baseline38-2024
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la búsqueda web. Los resultados de búsqueda no son relevantes para el modelo.
