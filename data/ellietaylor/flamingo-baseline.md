# ellietaylor/flamingo-baseline

## Resumen

Este repositorio contiene una implementación compacta y personalizada de la arquitectura Flamingo en PyTorch, publicada por el usuario ellietaylor bajo licencia Apache 2.0. La configuración denominada "giant" es en realidad un checkpoint de inicialización de tan solo 24.832 parámetros, diseñado explícitamente para revisión de código, pruebas de humo (smoke tests) y experimentos controlados a pequeña escala, no como un modelo preentrenado listo para producción.

El modelo implementa los componentes básicos de Flamingo —atención multi-query, fusión tipo Tucker, activación GELU aproximada y normalización RMSNorm— pero sin datos de entrenamiento ni pesos aprendidos. El archivo `model.safetensors` es un checkpoint de inicialización válido para verificar que el código funciona, pero no se presenta como un modelo entrenado ni se reivindica ningún resultado de benchmark. Su relevancia actual radica en servir como punto de partida para desarrolladores que quieran estudiar la arquitectura Flamingo o ejecutar experimentos de bajo coste antes de escalar a modelos mayores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flamingo (implementación personalizada en PyTorch) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Flamingo, el modelo visual-lenguaje de DeepMind presentado en abril de 2022, pero adaptado a una escala mínima. Los componentes clave declarados en `config.json` son: atención multi-query (en lugar de la atención multi-cabeza estándar), fusión de modalidades mediante Tucker (descomposición tensorial), activación GELU aproximada y normalización RMSNorm. Esta combinación reduce el coste computacional y la memoria, lo que permite ejecutar el modelo en entornos muy limitados.

No existe información sobre entrenamiento: el repositorio no documenta ningún dataset, número de tokens ni proceso de ajuste (RLHF, DPO, etc.). El archivo `training_args.json` registra una receta experimental por defecto que usa el optimizador Lion con un programador de tasa de aprendizaje one-cycle, pero la propia model card advierte que son valores iniciales del script, no evidencia de una ejecución completada. El checkpoint incluido es una inicialización aleatoria válida para comprobar el flujo de datos, no un modelo con conocimiento aprendido.

## Capacidades

- Generación de texto: el script `finetune.py` incluye un ejemplo ejecutable de generación, pero al ser un checkpoint sin entrenar, las salidas no tienen significado semántico.
- Revisión de código y pruebas de humo: permite verificar que la implementación forward/backward funciona correctamente.
- Experimentos controlados: sirve como baseline de capacidad mínima para comparar con otras arquitecturas en igualdad de condiciones.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: no hay ningún componente entrenado que habilite estas funciones.
- Capacidades multilingües: no disponibles, al no haber datos de entrenamiento.

## Casos de uso

- Pruebas de integración en pipelines de CI/CD: el checkpoint de 24.832 parámetros permite ejecutar tests de humo en segundos, verificando que el código de entrenamiento o inferencia no tiene errores de forma antes de lanzar trabajos costosos.
- Estudio de la arquitectura Flamingo: los desarrolladores pueden inspeccionar el código y la configuración para comprender cómo se implementan la atención multi-query, la fusión Tucker y la normalización RMSNorm en un contexto minimalista.
- Desarrollo de adaptadores para APIs genéricas: la model card indica que las APIs automáticas requieren un adaptador explícito; este repositorio sirve para construir y probar dicho adaptador.
- Comparación de recetas de entrenamiento: con `training_args.json` se puede experimentar con el optimizador Lion y el programador one-cycle en un entorno de bajo coste antes de escalar.
- Generación de datos sintéticos para depuración: al ser un modelo sin entrenar, se puede usar para generar salidas deterministas que ayuden a depurar el pipeline de generación.
- Educación y formación: útil en cursos o talleres sobre modelos de lenguaje multimodales, donde se puede ejecutar un Flamingo completo en CPU sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reivindica ninguna puntuación y que el checkpoint no está entrenado ni auditado. Cualquier evaluación futura debe documentarse por separado, con al menos tres semillas y un baseline de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB en precisión FP32 (24.832 parámetros × 4 bytes ≈ 99 KB). Cabe en cualquier dispositivo, incluida una Raspberry Pi.
- GPU recomendadas: ninguna. Se ejecuta sin problemas en CPU.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU, aunque no es necesario.
- Opciones de despliegue: ejecución directa con Python y PyTorch; no compatible con vLLM, llama.cpp, Ollama ni TGI sin un adaptador explícito.
- Latencia y throughput: no disponibles, pero al ser un modelo de 24K parámetros, la inferencia es prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No existe una comparativa directa posible porque este repositorio no es un modelo entrenado, sino un checkpoint de inicialización para pruebas. Los modelos Flamingo reales (DeepMind) y OpenFlamingo-9B tienen miles de millones de parámetros y capacidades multimodales reales, mientras que este tiene 24.832 parámetros y ninguna capacidad funcional. La siguiente tabla ilustra la diferencia de escala:

| Modelo | Parámetros | Entrenado | Contexto | Licencia |
|---|---|---|---|---|
| ellietaylor/flamingo-baseline | 24.832 | No | no disponible | Apache 2.0 |
| OpenFlamingo-9B-vitl-mpt7b | 9B | Sí | 2048 (aprox.) | MIT |
| Flamingo (DeepMind) | 80B | Sí | no publicado | propietaria |

## Limitaciones y advertencias

- No es un modelo entrenado: el checkpoint de inicialización no contiene conocimiento aprendido y no debe usarse para tareas reales de generación o razonamiento.
- Sin auditoría de robustez, fairness ni transferencia de dominio: la model card advierte que no se ha auditado el modelo para estos aspectos.
- Implementación personalizada: las APIs genéricas de HuggingFace no cargan el modelo automáticamente; se requiere un adaptador explícito.
- Sin benchmarks publicados: no hay evidencia de rendimiento en ninguna tarea.
- Riesgo de alucinación: irrelevante en este estado, pero si se entrena en el futuro, deberá evaluarse por separado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los términos de los datos externos usados con el modelo deben revisarse independientemente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ellietaylor/flamingo-baseline
- Paper original de Flamingo (DeepMind): https://arxiv.org/abs/2204.14198
- OpenFlamingo-9B (implementación open source): https://huggingface.co/openflamingo/OpenFlamingo-9B-vitl-mpt7b
- Comparativa de modelos en Artificial Analysis: https://artificialanalysis.ai/leaderboards/models
