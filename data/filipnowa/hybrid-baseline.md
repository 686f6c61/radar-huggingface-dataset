# filipnowa/hybrid-baseline

## Resumen

`filipnowa/hybrid-baseline` es un paquete de código y checkpoint de inicialización que implementa una arquitectura **Hybrid** en escala *tiny* para generación de texto. Lo desarrolla Filip Nowakowski (usuario `filipnowa`) y se publica bajo licencia BSD-3-Clause. No se trata de un modelo entrenado ni de un release con capacidades funcionales: el repositorio incluye el código fuente (`inference.py`), la configuración de arquitectura (`config.json`), una receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicialización (`model.safetensors`) de apenas 16.576 parámetros.

La relevancia de esta publicación es metodológica: sirve como punto de partida reproducible para experimentar con arquitecturas híbridas que combinan atención multi-query, fusión de baja dimensión (low-rank), activación Swish y normalización Scalenorm. El autor es explícito en que el checkpoint no está entrenado ni auditado, y que no se reivindica ningún resultado de benchmark. Es una base para pruebas de humo, desarrollo de adaptadores de carga y estudios comparativos de arquitecturas, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (atención multi-query + fusión low-rank + activación Swish + normalización Scalenorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un diseño **híbrido** en miniatura: combina una capa de atención multi-query (variante de atención multi-cabeza que comparte claves y valores entre cabezas, reduciendo el coste de memoria) con un mecanismo de **fusión de baja dimensión** (low-rank fusion) que integra información de distintas ramas del modelo. La activación es **Swish** (SiLU) y la normalización es **ScalenNorm**, una alternativa ligera a LayerNorm que escala las activaciones sin centrarlas. El conjunto completo está empaquetado como un módulo PyTorch con configuración explícita en `config.json`.

En cuanto al entrenamiento, el repositorio incluye una receta por defecto en `training_args.json` que usa el optimizador **Lamb** con un scheduler exponencial, pero el propio autor aclara que son valores de partida del script, no evidencia de una ejecución completada. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests), no un modelo entrenado. No se ha realizado entrenamiento con datos, por lo que no hay información sobre dataset, número de tokens ni técnicas de alineación (RLHF/DPO).

## Capacidades

- **Generación de texto**: el código incluye un ejemplo ejecutable de generación, pero al ser un checkpoint sin entrenar, no produce texto coherente ni útil más allá de una salida de prueba.
- **Reproducibilidad**: sirve como referencia reproducible para implementar y comparar arquitecturas híbridas con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.
- **Pruebas de humo**: el checkpoint permite validar que el pipeline de entrenamiento e inferencia funciona correctamente (forward/backward, guardado de pesos, carga).
- **Tool calling / function calling**: no soportado.
- **Soporte de agentes**: no soportado.
- **Capacidades multilingües**: no declaradas; el modelo no ha sido entrenado.
- **Modo thinking, visión o audio**: no disponible.

## Casos de uso

- **Pruebas de humo de pipelines de entrenamiento**: el checkpoint de inicialización permite verificar que un entorno de entrenamiento (GPU, librerías, cargadores de datos) funciona antes de lanzar un entrenamiento real. Es un paso estándar para depurar infraestructura.
- **Desarrollo de adaptadores de carga personalizados**: al ser una implementación propia, el autor advierte que las APIs genéricas de Hugging Face requieren un adaptador explícito. Este repositorio sirve como banco de pruebas para escribir ese adaptador.
- **Estudio académico de arquitecturas híbridas**: investigadores pueden analizar el código para entender cómo se combinan atención multi-query con fusión low-rank y normalización Scalenorm en una implementación compacta.
- **Validación de recetas de entrenamiento**: la configuración de Lamb con scheduler exponencial puede usarse como línea base para experimentar con otros optimizadores y schedulers, comparando estabilidad y convergencia.
- **Comparativa de escalabilidad**: al tener solo 16.576 parámetros, permite ejecutar experimentos de escalabilidad (ablation studies) en hardware muy limitado, midiendo el impacto de cada componente arquitectónico.
- **Pruebas de integración en CI/CD**: dado su tamaño mínimo, puede integrarse en pipelines de integración continua para verificar que el código de generación no se rompe con cambios en dependencias o versiones de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación de benchmark en el repositorio, y que el checkpoint de inicialización no ha sido entrenado ni auditado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB; con 16.576 parámetros en fp32, el modelo ocupa aproximadamente 66 KB de memoria de pesos, por lo que cabe en cualquier GPU, incluso integradas.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; también funciona exclusivamente en CPU.
- **Compatibilidad con GPU de consumo**: sí, funciona en cualquier GPU de consumo (GTX, RTX) y en CPU sin problemas.
- **Opciones de despliegue**: no compatible directamente con vLLM, Ollama o TGI por ser una implementación personalizada; se debe usar el script `inference.py` o escribir un adaptador para cargar el checkpoint.
- **Latencia y throughput**: no se han publicado medidas; al ser un modelo minúsculo, la latencia será del orden de milisegundos en CPU, pero no hay datos oficiales.

## Comparativa con modelos similares

No hay modelos comparables disponibles. Este repositorio no es un modelo entrenado sino un checkpoint de inicialización experimental con 16.576 parámetros, lo que lo sitúa varios órdenes de magnitud por debajo de cualquier modelo de generación de texto real (por ejemplo, GPT-2 pequeño tiene 124 M de parámetros). No existe una categoría equivalente de modelos de producción con esta arquitectura y escala.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint no ha pasado por ninguna fase de entrenamiento; no genera texto coherente ni tiene capacidades reales de lenguaje.
- **Sin auditoría**: el autor advierte que el checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- **Riesgo de alucinación**: no aplicable en el estado actual, pero si se entrena en el futuro, se deberá documentar por separado.
- **Implementación personalizada**: las APIs genéricas de carga automática (por ejemplo, `AutoModel.from_pretrained`) no funcionan sin un adaptador explícito.
- **Restricciones de licencia**: licencia BSD-3-Clause permite uso comercial y modificación, pero el autor indica que hay que revisar los términos de las fuentes de datos externas si se usan con datasets propios.
- **Caveat de producción**: no es apto para uso en producción; es un material de investigación y desarrollo experimental.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/filipnowa/hybrid-baseline)
- [Perfil del autor en Hugging Face](https://huggingface.co/filipnowa)
- [Datasets del autor](https://huggingface.co/filipnowa/datasets)
