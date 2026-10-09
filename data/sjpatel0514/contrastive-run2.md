# Sjpatel0514/contrastive-run2

## Resumen

Contrastive-run2 es un repositorio experimental publicado por el usuario Sjpatel0514 en HuggingFace. No se trata de un modelo entrenado ni de un checkpoint listo para producción: la propia model card lo describe como un esqueleto de código ("codebase") híbrido orientado a experimentos de aprendizaje contrastivo, con un checkpoint de inicialización válido únicamente para pruebas de humo. El autor declara explícitamente que no reivindica ninguna puntuación de benchmark y que los pesos no han sido entrenados ni auditados.

El interés técnico del artefacto es su configuración de arquitectura: un diseño a escala "nano" con atención de consultas agrupadas (grouped query attention), fusión mediante atención cruzada (cross attention), activación gelu tanh y normalización groupnorm. Con 24.832 parámetros totales declarados en el archivo safetensors y un tamaño de repositorio de 0,0 GB, se sitúa varios órdenes de magnitud por debajo de cualquier modelo de lenguaje utilizable, lo que lo convierte en un banco de pruebas para inspeccionar cambios arquitectónicos antes de lanzar un entrenamiento completo.

Su relevancia actual es, por tanto, metodológica y no de rendimiento: sirve como plantilla reproducible (configuración, receta de entrenamiento con Adam y planificador de pasos, punto de entrada ejecutable) para quienes investigan arquitecturas híbridas con objetivos contrastivos y quieren validar el pipeline antes de escalar. El repositorio se publica bajo licencia MIT, con fecha de creación y última actualización registradas el 9 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (hibrida), con atencion de consultas agrupadas y fusion por cross attention |
| Parametros totales | 24.832 (dato real declarado en el archivo safetensors) |
| Parametros activos | no disponible (no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye un checkpoint de inicializacion en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con implementacion en PyTorch) |
| Escala declarada | nano |
| Activacion | gelu tanh |
| Normalizacion | groupnorm |
| Optimizador de la receta por defecto | Adam con planificador de tipo step |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion / actualizacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura se declara como "Hybrid" a escala nano, con tres decisiones concretas documentadas en la model card: atención de consultas agrupadas (que reduce el coste de memoria del cache KV compartiendo cabezas de clave y valor), fusión de representaciones mediante cross attention y normalización con groupnorm en lugar de layer norm. La activación es gelu tanh. No se especifica el número de capas, la dimensión del modelo, el número de cabezas ni la ventana de contexto, por lo que no es posible reproducir la topología completa a partir de la información disponible.

En cuanto al entrenamiento, el repositorio incluye `training_args.json` con una receta por defecto (optimizador Adam y planificador de pasos), pero el propio autor advierte que son valores de partida del script y no evidencia de una ejecución completada. El archivo `model.safetensors` se describe como un checkpoint de inicialización válido para pruebas de humo, no como un checkpoint entrenado ni evaluado. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco se describe la función de pérdida contrastiva concreta más allá de la etiqueta "contrastive" del repositorio.

## Capacidades

- No hay capacidades verificadas de generación de texto, razonamiento, código o matemáticas: el checkpoint no ha sido entrenado y el autor no declara ninguna.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara soporte multilingüe; el campo de idiomas no está disponible.
- No se declara ninguna capacidad especial (modo thinking, visión, audio, decodificación especulativa).
- Lo que sí ofrece el artefacto es una base ejecutable: un archivo `main.py` con bloque `__main__` y ejemplo de prueba de humo, más `config.json` con los ajustes de arquitectura generados.
- Al ser una implementación personalizada, las API genéricas de carga automática requieren un adaptador explícito antes de poder usarla.

## Casos de uso

- Pruebas de humo de pipeline: usar `model.safetensors` como checkpoint de inicialización para verificar que el bucle de carga, forward y guardado funciona antes de invertir en un entrenamiento real. Es el uso que el propio autor documenta.
- Investigación de arquitecturas híbridas: modificar `config.json` (número de cabezas, tipo de fusión, normalización) y medir el efecto de cada cambio sin coste de cómputo apreciable, dado el tamaño de 24.832 parámetros.
- Línea base de capacidad mínima en experimentos contrastivos: servir como baseline emparejado en capacidad frente a otras variantes, siguiendo la recomendación de la model card de reportar métricas sobre al menos tres semillas y con la misma exposición de datos.
- Plantilla docente o de reproducción: el repositorio incluye configuración, receta de entrenamiento y punto de entrada, lo que permite usarlo como ejemplo didáctico de estructura de proyecto de investigación en PyTorch.
- Verificación de integración con frameworks: comprobar el flujo de exportación a safetensors y el registro de configuración antes de portar el diseño a un modelo mayor.
- Estudio de objetivos contrastivos a pequeña escala: validar que la pérdida contrastiva converge en un entorno controlado antes de aplicarla a un corpus real, aunque no hay resultados publicados que lo confirmen.
- No es adecuado para ninguno de los casos de uso habituales de un LLM en producción (atención al cliente, generación de código, RAG, clasificación real de textos), porque no existe un checkpoint entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que no se reivindica ninguna puntuación de benchmark ("No benchmark score is claimed in this repository") y que el checkpoint incluido no ha sido entrenado. En consecuencia, no existe tabla de MMLU, HumanEval, GSM8K ni de ninguna métrica de tarea contrastiva que pueda presentarse.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 24.832 parámetros declarados, el peso en precisión completa (fp32) ocupa del orden de 0,1 MB y en fp16 alrededor de 0,05 MB. A esa cifra hay que sumar el overhead del runtime de PyTorch (del orden de cientos de MB) y las activaciones, que no pueden estimarse porque se desconoce la topología.
- GPU recomendadas: ninguna en particular; cualquier GPU con CUDA operativo es más que suficiente, e incluso resulta desproporcionada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y también en CPU. No requiere VRAM dedicada relevante.
- Opciones de despliegue: al ser una implementación personalizada, no se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama. El autor indica que se ejecuta mediante `python main.py --help` y que las API genéricas de carga necesitan un adaptador explícito. No hay conversiones a GGUF publicadas.
- Latencia y throughput estimados: no disponibles. Con este número de parámetros la latencia estaría dominada por el overhead del framework y no por el cómputo del modelo, pero no se aporta ninguna medición.

## Comparativa con modelos similares

En la información disponible no aparecen modelos comparables de escala nano con objetivo contrastivo. Los resultados de búsqueda web apuntan a proyectos que comparten la etiqueta "contrastive" pero operan en categorías completamente distintas. La tabla recoge lo que puede afirmarse sin inventar datos:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sjpatel0514/contrastive-run2 | 24.832 | no disponible | sin benchmarks publicados; checkpoint sin entrenar | MIT | HuggingFace |
| IshaanIeki/contrastive-run2 | no disponible | no disponible | no disponible | no disponible | HuggingFace (repositorio con nombre identico) |
| CLM-8B (Contrastive Language Models, GitHub Contrastive-LM/CLM) | ~8.000 millones | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Repositorio GitHub con API |

La comparación con CLM-8B es únicamente contextual: comparte la idea de entrenar con un objetivo de aprendizaje contrastivo que conecta estados y acciones, pero la diferencia de escala (24.832 parámetros frente a 8.000 millones) hace que no sean alternativas entre sí. No se dispone de datos suficientes para establecer una comparativa de rendimiento, contexto o licencia con ninguna alternativa.

## Limitaciones y advertencias

- El checkpoint no está entrenado: la model card lo califica como inicialización para pruebas de humo, no como checkpoint evaluado. Cualquier uso generativo producirá salidas sin sentido.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declaración del propio autor.
- No hay sesgos conocidos documentados, pero tampoco evaluación alguna que permita descartarlos.
- Riesgo de alucinación: no aplica en el sentido habitual porque el modelo no genera lenguaje de forma funcional; el riesgo real es interpretar los resultados de una prueba de humo como si fueran rendimiento de modelo.
- Limitaciones de contexto e idioma: ambos campos son no disponibles; no hay evidencia de soporte multilingüe.
- Restricciones de licencia: MIT permite uso comercial, modificación y redistribución con atribución, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se emplean datasets externos.
- Cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse de forma separada a los valores por defecto que se distribuyen en este repositorio, tal como exige la propia model card.
- Para producción: no apto. No hay API de carga estándar, ni cuantizaciones, ni versiones GGUF, ni métricas de latencia o throughput.
- La fecha registrada de creación y actualización (2026-10-09) es llamativa y conviene verificarla en la página del repositorio antes de citarla.
- Existe al menos otro repositorio con el nombre `contrastive-run2` en HuggingFace (IshaanIeki/contrastive-run2), lo que puede generar confusión al referenciarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sjpatel0514/contrastive-run2
- Perfil del autor en HuggingFace: https://huggingface.co/Sjpatel0514
- Repositorio con nombre idéntico localizado en la búsqueda: https://huggingface.co/IshaanIeki/contrastive-run2
- Repositorio GitHub de Contrastive Language Models (CLM), referencia contextual sobre el objetivo contrastivo: https://github.com/Contrastive-LM/CLM
- Leaderboard de benchmarks consultado en la búsqueda, sin datos de este modelo: https://benchlm.ai/
- Leaderboard alternativo consultado en la búsqueda, sin datos de este modelo: https://modelcap.ai/
