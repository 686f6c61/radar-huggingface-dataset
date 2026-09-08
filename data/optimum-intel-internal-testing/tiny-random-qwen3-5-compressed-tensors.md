# optimum-intel-internal-testing/tiny-random-qwen3.5-compressed-tensors

## Resumen

El modelo `optimum-intel-internal-testing/tiny-random-qwen3.5-compressed-tensors` es un artefacto de prueba generado por el equipo de Optimum Intel para validar el soporte de exportación de cuantización `compressed-tensors` en su framework. Se trata de un modelo "tiny random" basado en la arquitectura Qwen3.5, con pesos aleatorios y un tamaño de 16.099.132 parámetros, lo que lo convierte en un modelo de juguete destinado exclusivamente a pruebas de integración y no a tareas reales de procesamiento de lenguaje.

El modelo incluye una torre de visión y componentes de atención lineal, lo que sugiere una arquitectura híbrida multimodal, aunque al ser aleatorio no tiene ninguna capacidad funcional. La cuantización aplicada es int4 con empaquetado y group_size=16, aplicada solo a las capas lineales de atención y MLP del modelo de lenguaje, dejando sin cuantizar la torre de visión, el `lm_head` y las proyecciones de atención lineal, siguiendo el patrón de ignorado usado en checkpoints reales como `cyankiwi/Qwen3.5-4B-AWQ-4bit`.

Su relevancia es puramente técnica: sirve como caso de prueba para desarrolladores que trabajan en el soporte de `compressed-tensors` en Optimum Intel o en el ecosistema de Hugging Face. No está pensado para ser usado en producción ni para resolver problemas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 con torre de vision y atencion lineal (modelo de prueba, pesos aleatorios) |
| Parametros totales | 16.099.132 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 empaquetado con group_size=16 (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura se basa en Qwen3.5, un modelo de lenguaje multimodal que combina un transformer de lenguaje con una torre de vision y mecanismos de atencion lineal. En este caso concreto, los pesos son aleatorios, por lo que no hay ningun entrenamiento real detras. La unica caracteristica tecnica destacable es el patron de cuantizacion: solo las capas lineales de atencion y MLP del modelo de lenguaje estan cuantizadas a int4 con group_size=16, mientras que la torre de vision, el `lm_head` y las proyecciones de atencion lineal `in_proj_a` y `in_proj_b` permanecen sin cuantizar. Este patron replica el utilizado en checkpoints reales como `cyankiwi/Qwen3.5-4B-AWQ-4bit` y sirve para probar la correcta gestion de capas ignoradas durante la exportacion.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni procesos de RLHF o DPO, ya que el modelo es un artefacto sintetico de testing.

## Capacidades

- Generacion de texto: no disponible, el modelo no ha sido entrenado y produce salidas aleatorias.
- Razonamiento: no disponible.
- Codigo: no disponible.
- Matematicas: no disponible.
- Vision: la arquitectura incluye una torre de vision, pero al ser aleatoria no tiene capacidad de procesamiento de imagenes.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: no disponible. El unico proposito del modelo es servir como caso de prueba para el soporte de cuantizacion `compressed-tensors` en Optimum Intel.

## Casos de uso

- Pruebas de integracion de Optimum Intel: el modelo se utiliza para verificar que el pipeline de exportacion de `compressed-tensors` funciona correctamente con arquitecturas Qwen3.5, incluyendo el manejo de capas no cuantizadas.
- Validacion de cuantizacion int4: permite comprobar que la cuantizacion con group_size=16 se aplica solo a las capas esperadas y que el modelo resultante carga y ejecuta sin errores.
- Test de regresion en CI/CD: al ser de tamano minimo (16M parametros), es ideal para ejecutar tests rapidos de carga y descarga en pipelines de integracion continua sin consumir recursos significativos.
- Depuracion de herramientas de inferencia: sirve para depurar problemas en librerias como vLLM, llama.cpp o TGI cuando se trabaja con modelos cuantizados con `compressed-tensors`.
- Comparacion de pesos cuantizados y no cuantizados: permite validar que la implementacion de cuantizacion no rompe la estructura de los tensores y que el formato safetensors es correcto.
- Generacion de datos sinteticos para tests: al ser aleatorio, puede usarse para generar entradas y salidas de referencia en pruebas automatizadas donde no se requiere un modelo funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, dado el tamano de 16M parametros y la cuantizacion int4.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA T4, RTX 3060 o superiores. Tambien puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU de consumo, incluso en las de gama baja.
- Opciones de despliegue: puede cargarse con vLLM, llama.cpp, Ollama o TGI, aunque su uso real es para pruebas y no para produccion.
- Latencia y throughput: no disponibles, al ser un modelo de prueba no se han medido metricas de rendimiento.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada, ya que se trata de un artefacto de testing interno sin equivalentes publicos.

## Limitaciones y advertencias

- Modelo de prueba: los pesos son aleatorios, por lo que no tiene ninguna capacidad real de procesamiento de lenguaje, vision ni razonamiento.
- No apto para produccion: cualquier intento de usar este modelo en una aplicacion real producira resultados sin sentido.
- Sin datos de entrenamiento: no hay informacion sobre el dataset ni el proceso de entrenamiento, lo que confirma su naturaleza sintetica.
- Riesgo de confusion: el nombre "Qwen3.5" puede llevar a pensar que es un modelo funcional, pero es un "tiny random" sin capacidades.
- Licencia apache-2.0: permite uso comercial, pero no hay ninguna funcionalidad que pueda explotarse comercialmente.
- Cuantizacion parcial: la cuantizacion no cubre todas las capas, lo que puede generar inconsistencias si se intenta comparar con un checkpoint totalmente cuantizado.

## Enlaces

- HuggingFace: https://huggingface.co/optimum-intel-internal-testing/tiny-random-qwen3.5-compressed-tensors
- Organizacion Optimum Intel Internal Testing: https://huggingface.co/optimum-intel-internal-testing/models
