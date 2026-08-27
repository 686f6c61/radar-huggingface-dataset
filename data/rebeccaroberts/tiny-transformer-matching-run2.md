# rebeccaroberts/tiny-transformer-matching-run2

## Resumen

Este repositorio contiene un **Tiny Transformer** experimental orientado a tareas de *matching* (emparejamiento o similitud entre entradas), desarrollado por la autora rebeccaroberts. Se trata de un proyecto de investigación que mantiene deliberadamente una configuración a escala "xlarge" pero con un número de parámetros muy reducido (33.088), de modo que los cambios de arquitectura puedan inspeccionarse antes de un entrenamiento completo. El checkpoint incluido (`model.safetensors`) es un punto de inicialización válido para pruebas de humo, no un modelo entrenado con resultados de rendimiento.

La relevancia de este modelo es principalmente didáctica y experimental: permite estudiar variantes de arquitectura (atención multi-query, fusión con compuerta, normalización ScaleNorm) en un entorno manejable. No se presenta como un modelo listo para producción ni se reivindica ningún benchmark. La licencia MIT facilita su uso y modificación, aunque la implementación es personalizada y requiere un adaptador explícito para las APIs de carga automática estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención multi-query, fusión con compuerta, activación GELU tanh, normalización ScaleNorm) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer en miniatura con atención multi-query (una variante que comparte claves y valores entre cabezas para reducir coste), fusión con compuerta (gated fusion) para combinar representaciones, activación GELU con aproximación tanh y normalización ScaleNorm. El repositorio incluye `config.json` con la configuración generada y `training_args.json` con una receta experimental por defecto que usa Adafactor con programación polinómica. Sin embargo, la model card aclara explícitamente que estos son valores de partida, no evidencia de un entrenamiento completado. No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens ni técnicas como RLHF o DPO. El checkpoint es una inicialización válida para pruebas de humo, no un modelo entrenado.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- El propósito declarado es el *matching* (emparejamiento o similitud entre entradas), pero no hay ejemplos de uso ni métricas que lo demuestren.
- No se menciona soporte para generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.
- La implementación es personalizada; las APIs de carga automática genéricas requieren un adaptador explícito.

## Casos de uso

- **Investigación en arquitecturas transformer**: el modelo sirve como banco de pruebas para estudiar el efecto de la atención multi-query, la fusión con compuerta y ScaleNorm en tareas de matching, gracias a su tamaño reducido que permite iterar rápidamente.
- **Validación de pipelines de entrenamiento**: al ser un checkpoint de inicialización, puede usarse para verificar que un script de entrenamiento funciona correctamente (smoke test) antes de lanzar ejecuciones costosas.
- **Enseñanza de transformers**: su código fuente (`model.py`) es un artefacto didáctico para comprender la implementación de un transformer desde cero, sin depender de bibliotecas de alto nivel.
- **Comparación de normalizaciones**: permite experimentar con ScaleNorm frente a otras normalizaciones (LayerNorm, RMSNorm) en un contexto controlado.
- **Pruebas de adaptadores de carga**: al no ser compatible con APIs estándar, puede servir para desarrollar y probar adaptadores personalizados que carguen pesos safetensors en arquitecturas custom.
- **Estudio de escalado**: al ser extremadamente pequeño, facilita el análisis de cómo varía el rendimiento al aumentar parámetros o datos, siempre que se entrene con una metodología rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindica ninguna puntuación y que el checkpoint no está entrenado. Para una evaluación significativa, se recomienda usar un conjunto de validación emparejado, reportar la métrica de la tarea con al menos tres semillas e incluir una línea base de capacidad equivalente.

## Requisitos de hardware

- Con solo 33.088 parámetros, el modelo cabe en cualquier GPU comercial, incluso en las más modestas (por ejemplo, una GTX 1650 con 4 GB de VRAM sería más que suficiente).
- También puede ejecutarse en CPU sin problemas, dado su tamaño ínfimo.
- No se dispone de datos de latencia o throughput, pero se espera que sean despreciables en cualquier hardware moderno.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un script propio o un adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (transformers miniatura para matching). El repositorio no menciona alternativas ni ofrece comparaciones. Se recomienda, según la propia model card, entrenar líneas base de capacidad equivalente para cualquier estudio comparativo.

## Limitaciones y advertencias

- El checkpoint de inicialización **no ha sido entrenado**; no es un modelo funcional para tareas reales.
- No ha sido auditado en cuanto a robustez, equidad ni transferencia de dominio.
- No se conocen sesgos específicos, pero al no haber entrenamiento, cualquier sesgo futuro dependerá de los datos que se usen.
- Riesgo de alucinación: no aplicable al no generar texto, pero si se entrena para generación, deberá evaluarse.
- Limitaciones de contexto e idioma: no documentadas.
- La licencia MIT permite uso comercial, pero la model card advierte que deben revisarse los términos de los datos fuente si se usan conjuntos de datos externos.
- La implementación es experimental y no compatible con APIs estándar; requiere adaptadores propios.
- No se proporcionan garantías de rendimiento ni de idoneidad para producción.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/rebeccaroberts/tiny-transformer-matching-run2)
- [Perfil de la autora en Hugging Face](https://huggingface.co/rebeccaroberts)
- [Conjuntos de datos de la autora](https://huggingface.co/rebeccaroberts/datasets)
