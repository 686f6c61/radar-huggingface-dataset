# optimum-intel-internal-testing/tiny-random-qwen3-dspark

## Resumen

`optimum-intel-internal-testing/tiny-random-qwen3-dspark` es un modelo de prueba (test fixture) publicado por el equipo interno de Optimum-Intel en Hugging Face. No es un modelo entrenado para uso real: se trata de una versión "tiny random" derivada de `optimum-intel-internal-testing/tiny-random-qwen3`, pensada exclusivamente para validar pipelines de software (transformers, Optimum, herramientas de decodificación especulativa) sin consumir recursos de cómputo significativos.

El modelo implementa la arquitectura de *draft model* asociada a DSpark, una variante de decodificación especulativa de DeepSeek construida sobre DFlash. Concretamente, parte de `tiny-random-qwen3-deepspec-dflash` y añade los campos que `deepseek-ai/dspark_qwen3_4b_block7` incorpora respecto a `deepseek-ai/dflash_qwen3_4b_block7`: una cabeza Markov vanilla aleatoria (con `markov_rank` 8 en lugar de 256) y una cabeza de confianza. El resultado es un artefacto con la estructura de pesos y configuración correcta para pruebas de integración, pero con valores aleatorios.

Su relevancia es puramente de ingeniería: permite a los desarrolladores de Optimum-Intel y de la comunidad verificar el soporte de DSpark (cabezas Markov y de confianza, decodificación especulativa) en sus librerías sin necesidad de descargar los modelos de referencia de 4B parámetros. La licencia es Apache 2.0, lo que facilita su redistribución dentro de suites de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 con cabezas adicionales DSpark (Markov head y confidence head) para decodificación especulativa |
| Parámetros totales | no disponible (modelo "tiny random" de test) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estándar de transformers; no confirmado explícitamente en la model card) |

## Arquitectura y entrenamiento

El modelo es un *draft model* para decodificación especulativa basado en la familia Qwen3, en su variante mínima de test. Sobre la arquitectura base de `tiny-random-qwen3` se aplican dos modificaciones propias de DSpark: una cabeza Markov de rango 8 (frente al rango 256 del modelo de referencia `deepseek-ai/dspark_qwen3_4b_block7`) y una cabeza de confianza. Estas cabezas se emplean en el esquema DSpark para modelar la transición entre tokens propuestos y estimar la probabilidad de aceptación de cada propuesta durante la verificación especulativa.

No hay información sobre entrenamiento: los pesos son aleatorios por diseño ("tiny random"), no se ha realizado preentrenamiento, ajuste supervisado, RLHF ni DPO. El modelo deriva de `tiny-random-qwen3-deepspec-dflash`, que a su vez es un fixture de test. La única innovación técnica que ilustra es la incorporación de las cabezas DSpark (Markov y confianza) sobre la estructura DFlash, sirviendo como referencia de implementación para quienes integren decodificación especulativa en Optimum-Intel.

## Capacidades

- No dispone de capacidades generativas reales: los pesos son aleatorios y la salida no es coherente.
- Sirve como fixture para probar la carga de modelos con cabezas DSpark (Markov head y confidence head) en `transformers` y en el stack de Optimum-Intel.
- Permite validar rutas de código de decodificación especulativa (draft model + verificación) sin coste computacional.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma funcional.
- No tiene capacidades multilingües reales.
- No incluye modo thinking, visión ni audio.
- Compatible con `library_name: transformers` según la model card.

## Casos de uso

- Pruebas de integración en Optimum-Intel: verificar que el cargador de modelos reconoce y mapea correctamente las cabezas DSpark (Markov y confianza) sin necesidad de descargar el modelo de 4B.
- Test de regresión en CI: ejecutar la suite de tests de decodificación especulativa con un modelo de tamaño mínimo para reducir tiempos de pipeline.
- Validación de serialización y conversión: comprobar que las herramientas de conversión (por ejemplo, a otros formatos o backends de Optimum) preservan los campos específicos de DSpark.
- Desarrollo de utilidades de inspección: probar scripts que analizan la configuración y los tensores de cabezas auxiliares en modelos de draft.
- Reproducción de bugs: aislar problemas en la lógica de decodificación especulativa con un modelo determinista en estructura pero aleatorio en pesos.
- Documentación y ejemplos: ilustrar en tutoriales la estructura de un draft model DSpark sin distribuir pesos reales de DeepSeek.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: mínima (modelo "tiny"); cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica; cualquier GPU es suficiente para pruebas.
- Cabe en GPU consumer: sí, en cualquier modelo (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: `transformers` (según la model card); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada y probablemente no sea soportada por las cabezas DSpark.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de test.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia |
|---|---|---|---|---|
| `tiny-random-qwen3-dspark` (este) | tiny (no disponible) | no disponible | Fixture de test con cabezas DSpark | Apache 2.0 |
| `optimum-intel-internal-testing/tiny-random-qwen3-deepspec-dflash` | tiny (no disponible) | no disponible | Fixture de test base (DFlash) | no disponible |
| `deepseek-ai/dspark_qwen3_4b_block7` | 4B (según nombre) | no disponible | Draft model DSpark de referencia | no disponible |
| `deepseek-ai/dflash_qwen3_4b_block7` | 4B (según nombre) | no disponible | Draft model DFlash de referencia | no disponible |

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce texto coherente ni resultados utilizables en producción.
- No debe emplearse para inferencia real, evaluación de calidad ni despliegue en aplicaciones.
- La model card indica explícitamente "for tests only".
- No hay información sobre sesgos, alucinación o comportamiento multilingüe porque no ha sido entrenado.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su utilidad comercial es nula al ser un fixture.
- El soporte de las cabezas DSpark en herramientas de terceros (vLLM, llama.cpp, TGI) no está garantizado.
- El nombre del repositorio incluye "internal-testing", lo que sugiere que puede eliminarse o cambiar sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/optimum-intel-internal-testing/tiny-random-qwen3-dspark
- Modelo base: https://huggingface.co/optimum-intel-internal-testing/tiny-random-qwen3
- Fixture DFlash del que deriva: https://huggingface.co/optimum-intel-internal-testing/tiny-random-qwen3-deepspec-dflash
- Draft model DSpark de referencia: https://huggingface.co/deepseek-ai/dspark_qwen3_4b_block7
- Draft model DFlash de referencia: https://huggingface.co/deepseek-ai/dflash_qwen3_4b_block7
