# jacobwilliams/coca-baseline

## Resumen

Coca baseline es un repositorio experimental publicado por el usuario jacobwilliams en Hugging Face que contiene una implementación propia de la arquitectura Coca (combinación de atención tipo transformer con fusión multimodal) orientada a tareas multitask. El artefacto publicado no es un modelo entrenado, sino un checkpoint de inicialización válido para pruebas de humo: el propio autor indica en la model card que no se reclama ninguna puntuación de benchmark y que el checkpoint "no ha sido entrenado ni auditado" en robustez, equidad o transferencia de dominio.

El dato técnico más relevante es su tamaño: 24.832 parámetros totales según el archivo safetensors, una cifra que contrasta frontalmente con la etiqueta "giant" que aparece en la configuración de arquitectura descrita en la model card. Esta discrepancia sugiere que la configuración generada corresponde a una plantilla escalable y no a un modelo de gran escala realmente materializado. Con ese número de parámetros, el peso en precisión fp32 ocupa aproximadamente 99 KB, por lo que el repositorio (0,0 GB de tamaño reportado) es un ejercicio de código reproducible más que un modelo desplegable.

La relevancia de esta ficha es acotada y conviene ser explícito: no estamos ante un modelo listo para producción ni ante un candidato a evaluación comparativa, sino ante un andamiaje de código abierto (licencia MIT) útil para revisión de implementaciones, pruebas de integración de pipelines y desarrollo de adaptadores de carga personalizados. Cualquier evaluación de capacidades queda pendiente de un checkpoint entrenado que el autor aún no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (transformer con fusión Tucker, según la model card) |
| Parametros totales | 24.832 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint safetensors sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

Detalles adicionales declarados en la model card: atención con kernel flash, fusión tipo Tucker, activación GELU, normalización RMSNorm y escala nominal "giant". El repositorio incluye `eval.py`, `config.json`, `training_args.json`, `model.safetensors` y `README.md`.

## Arquitectura y entrenamiento

La arquitectura declarada es Coca con atención flash, fusión Tucker, activación GELU y RMSNorm. La model card no detalla el número de capas, dimensión oculta, cabezas de atención ni la forma exacta del módulo de fusión, por lo que no es posible reconstruir el grafo completo a partir de la información disponible. El archivo `config.json` del repositorio registra los ajustes de arquitectura generados, pero su contenido no se ha facilitado en esta ficha.

En cuanto al entrenamiento, la receta por defecto usa optimizador SGD con planificador de tasa de aprendizaje coseno. El autor advierte de forma explícita que estos son valores de arranque del script y no evidencia de una ejecución completada. No se declara número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta ningún innovación técnica adicional más allá del uso de atención flash y de la fusión Tucker como mecanismo de combinación de modalidades.

## Capacidades

- No hay capacidades verificadas. El checkpoint publicado es una inicialización sin entrenamiento, por lo que no se puede afirmar que genere texto, código, matemáticas o razonamiento de forma coherente.
- La etiqueta `multitask` del repositorio describe la intención de la implementación, no un comportamiento medido del checkpoint.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta cobertura multilingüe; el campo de idiomas figura como no disponible.
- No se documentan capacidades especiales (modo thinking, visión, audio) más allá de la fusión Tucker, cuyo alcance multimodal no se especifica.
- La única funcionalidad comprobable hoy es la carga del checkpoint y la ejecución del script de ejemplo incluido en `eval.py`.

## Casos de uso

- Revisión de código de investigación: el repositorio sirve para inspeccionar una implementación propia de Coca con atención flash y fusión Tucker, comparar decisiones de diseño y reutilizar componentes en proyectos propios bajo licencia MIT.
- Pruebas de humo de pipelines de carga: al ser un checkpoint safetensors válido y de tamaño mínimo (24.832 parámetros), permite verificar que un cargador, un script de conversión o un servicio de inferencia arrancan correctamente antes de mover pesos reales de varios gigabytes.
- Desarrollo de adaptadores de carga: la model card advierte de que las API genéricas de carga automática requieren un adaptador explícito, de modo que este repositorio es un caso de prueba idóneo para implementar y validar ese adaptador.
- Plantilla de experimentación con ablaciones: el par `config.json` y `training_args.json` proporciona una receta reproducible (SGD con schedule coseno) que puede servir como punto de partida para comparativas controladas con presupuesto de ajuste y semillas aleatorias equiparables.
- Fixture en tests de integración y CI: por su tamaño en disco (del orden de decenas o cientos de kilobytes), es adecuado como artefacto de prueba en suites de integración que necesiten ejercitar rutas de carga, serialización y versionado de modelos sin coste de almacenamiento.
- Material didáctico: útil en docencia o divulgación para mostrar la estructura de un repositorio de modelo en Hugging Face, el papel de cada archivo y la diferencia entre un checkpoint inicializado y uno entrenado.
- Punto de partida para reentrenamiento: un equipo podría partir de esta implementación para entrenar su propio modelo Coca multitask, siempre que documente por separado los resultados del checkpoint resultante, tal y como pide el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que las afirmaciones de benchmark se omiten deliberadamente y que no se reclama ninguna puntuación.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 MB en cualquier precisión razonable. Con 24.832 parámetros, el peso ocupa aproximadamente 99 KB en fp32, unos 50 KB en fp16/bf16 y unos 25 KB en int8. No se dispone de cifras de activaciones ni de memoria pico durante el forward.
- GPU recomendadas: no aplica. Cualquier GPU, incluida una integrada, es sobradamente suficiente; el modelo cabe también en CPU sin penalización apreciable.
- GPU de consumo: sí, cabe en cualquier GPU de consumo, desde una GTX 1050 hasta una RTX 4090, y también en dispositivos embebidos con unos pocos megabytes de memoria libre.
- Opciones de despliegue: el repositorio no documenta integración con vLLM, llama.cpp, Ollama ni TGI. La vía prevista es la ejecución directa del script `eval.py` con PyTorch y un adaptador de carga explícito, ya que las API automáticas genéricas no funcionan sin él.
- Latencia y throughput estimados: no disponible. Al no existir un modelo entrenado ni un pipeline de inferencia documentado, cualquier cifra sería especulativa.

## Comparativa con modelos similares

Los resultados de búsqueda muestran repositorios con nombre idéntico o muy similar, aparentemente generados a partir de la misma plantilla por otros autores. La comparación se limita a metadatos del repositorio, no a rendimiento.

| Repositorio | Autor | Tarea declarada | Parametros | Licencia | Estado |
|---|---|---|---|---|---|
| jacobwilliams/coca-baseline | jacobwilliams | Multitask | 24.832 | MIT | Checkpoint de inicialización |
| williamking37/coca-baseline | williamking37 | Classification | no disponible | BSD-3-Clause | Repositorio de plantilla |
| mark-ward/coca-baseline | mark-ward | Classification | no disponible | no disponible | Implementación compacta, uso en revisión y smoke tests |
| Jonashar/coca-baseline (vía savrn.com) | Jonashar | no disponible | 24.832 | no disponible | Ficha de agregador |

Ninguno de estos repositorios publica resultados de benchmarks, y ninguno se presenta como un release preentrenado listo para producción. No se dispone de comparativas con modelos entrenados de la misma categoría porque la información proporcionada no incluye ninguno.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. No debe usarse para inferencia real, evaluación de calidad ni despliegue en producción.
- Contradicción entre la escala declarada ("giant") y el recuento real de parámetros (24.832). Conviene tratar la etiqueta de escala como un valor de plantilla, no como una descripción del artefacto publicado.
- Ausencia total de auditoría de robustez, equidad y transferencia de dominio, según declara el propio autor.
- No hay información sobre sesgos, porque no hay datos de entrenamiento documentados ni modelo entrenado que evaluar.
- Riesgo de alucinación: no evaluable en un checkpoint sin entrenar; al no producir salidas coherentes de forma fiable, cualquier texto generado debe considerarse ruido.
- No se documentan idiomas soportados ni ventana de contexto, por lo que no se puede garantizar ningún comportamiento multilingüe ni conversacional.
- Licencia MIT: permisiva y apta para uso comercial del código, pero la model card advierte de que los términos de los datos de origen deben revisarse por separado si el repositorio se usa con datasets externos.
- Las API genéricas de carga automática no funcionan sin un adaptador explícito, lo que añade trabajo de integración antes de poder ejecutar el modelo.
- Las cifras de descargas y "likes" (ambas cero) indican ausencia de validación por parte de la comunidad.
- Existen múltiples repositorios homónimos de otros autores; conviene verificar el autor exacto antes de citar o reutilizar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jacobwilliams/coca-baseline
- Repositorio homónimo de williamking37: https://huggingface.co/williamking37/coca-baseline
- Repositorio homónimo de mark-ward: https://huggingface.co/mark-ward/coca-baseline
- Ficha de agregador para coca-baseline (Jonashar): https://savrn.com/models/coca-baseline
- Paper de Coca: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
