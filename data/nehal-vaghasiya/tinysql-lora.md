# nehal-vaghasiya/tinysql-lora

## Resumen

TinySQL LoRA es un experimento de investigación publicado por Nehal Vaghasiya que combina un modelo base TinySQL de arquitectura transformer implementada desde cero en PyTorch con un adaptador LoRA de rango 8 entrenado para la tarea de text-to-SQL sobre un esquema sintético fijo. No se trata de un checkpoint compatible con `AutoModel` ni de un adaptador PEFT estándar: el repositorio incluye el modelo base exacto con el que se entrenó el adaptador, el tokenizador y el código de inferencia, y el autor advierte explícitamente de que no debe sustituirse la base por otra.

El modelo parte de inicialización aleatoria (no de un modelo preentrenado de gran escala) y se ajusta con LoRA congelando los pesos base. El adaptador tiene 32.768 parámetros, rango 8 y alpha 16,0, entrenado con semilla 42 y selección de checkpoint por entropía cruzada sobre tokens SQL de validación. La evaluación reportada es de 83,12 % de acierto en un conjunto de validación de 320 ejemplos sintéticos, frente al 80,62 % del base sin adaptador.

Su relevancia es limitada y de carácter didáctico o exploratorio: sirve para estudiar el flujo completo de entrenamiento de un transformer desde cero con ajuste LoRA para una tarea estructurada, no como componente listo para producción. El propio autor califica los resultados de exploratorios, señala que no se ha demostrado generalización a esquemas nuevos ni precisión en el mundo real, y advierte de que las líneas base clásicas de recuperación pueden superarlo en ciertos enunciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer implementado desde cero en PyTorch (código personalizado, no `AutoModel`) |
| Parametros totales | No disponible (el adaptador LoRA tiene 32.768 parámetros; el tamaño del base no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch personalizado (`adapter.pt` más carpeta `base/` con pesos congelados); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de implementación propia alojado en el repositorio `nehalvaghasiya/transformers-from-scratch` (commit `5fdb74437670658c928e1f0fa4dacf80fca9c0e1`). Se inicializa de forma aleatoria y se entrena durante 20 épocas completas; posteriormente se congela y se ajusta un adaptador LoRA de rango 8 y alpha 16,0 durante 90 pasos. El adaptador suma 32.768 parámetros entrenables. La selección del checkpoint se realiza minimizando la entropía cruzada sobre tokens SQL en validación, que baja de 0,02408 en el base a 0,01617 con el adaptador.

Los datos de entrenamiento son sintéticos, generados sobre un esquema SQL fijo y con esqueletos de consulta repetidos; el propio autor indica que los recuentos de filas de entrenamiento incluyen duplicados. No se documenta el número total de tokens ni la composición detallada del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se describe ninguna innovación técnica más allá del uso de LoRA sobre una base entrenada desde cero.

## Capacidades

- Generación de texto orientada a la traducción de preguntas en lenguaje natural a consultas SQL sobre un esquema sintético fijo.
- Ajuste LoRA sobre pesos base congelados, lo que permite reproducir el entrenamiento del adaptador con los scripts incluidos en `finetuning/`.
- Inferencia mediante el script `predict.py` incluido en el bundle, con el entorno de CPU documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio del pipeline completo de entrenamiento de un transformer desde cero: el repositorio permite reproducir la inicialización aleatoria, el entrenamiento base de 20 épocas y el ajuste LoRA posterior, útil como material docente o de experimentación en cursos de NLP.
- Investigación sobre ajuste eficiente de parámetros: el adaptador de rango 8 y 32.768 parámetros sirve para medir el efecto de LoRA sobre una base pequeña entrenada específicamente para una tarea estructurada, con curvas de entropía cruzada de validación documentadas.
- Experimentos de text-to-SQL sobre esquemas sintéticos controlados: permite probar variantes de prompts, tokenización o decodificación sobre un esquema fijo y una base de datos de muestra aislada, sin depender de servicios externos.
- Reproducción de resultados académicos: los scripts de `finetuning/README.md` y la semilla 42 permiten replicar la comparación base frente a adaptador (80,62 % frente a 83,12 % en validación) en el mismo conjunto sintético.
- Pruebas de integración de checkpoints PyTorch personalizados: útil para validar pipelines de carga de pesos no estándar, dado que el bundle no es compatible con `AutoModel` ni con PEFT y requiere el código del autor.
- Docencia sobre riesgos de evaluación: el modelo ilustra casos de contaminación por inspección previa de splits de test y challenge, y la diferencia entre precisión sintética y generalización real, útil para formar en buenas prácticas de evaluación.

## Benchmarks y rendimiento

| Benchmark | Base TinySQL | TinySQL + LoRA |
|---|---|---|
| Validación SQL (n=320), acierto | 80,62 % | 83,12 % |
| Entropía cruzada de tokens SQL en validación | 0,02408 | 0,01617 |

Los resultados son exploratorios según el autor. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible, y no se aportan comparaciones con modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del modelo base no se especifica en la información proporcionada.
- GPU recomendadas: no disponible; el autor indica que el despliegue en GPU no ha sido verificado.
- Compatibilidad con GPU de consumo: no verificada por el autor.
- Opciones de despliegue: únicamente el script `predict.py` incluido en el bundle, con el entorno de CPU documentado; no se contempla vLLM, llama.cpp, Ollama ni TGI, ya que el checkpoint es de arquitectura personalizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinySQL LoRA (este modelo) | Adaptador de 32.768 parámetros; base no especificado | No disponible | Text-to-SQL sintético, transformer desde cero | MIT | Hugging Face, checkpoint PyTorch personalizado |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Resultados exploratorios: el autor señala que no se ha establecido precisión en el mundo real ni generalización a esquemas nuevos.
- Datos sintéticos con esqueletos SQL repetidos y filas duplicadas en entrenamiento, lo que puede inflar las métricas de validación.
- Los splits históricos de test y challenge fueron inspeccionados durante el desarrollo previo, lo que introduce riesgo de contaminación en la evaluación.
- Las líneas base clásicas de recuperación pueden superar al modelo, especialmente en enunciados de tipo challenge.
- El SQL generado puede ser inválido o incorrecto; la ejecución solo es apropiada sobre la base de datos de muestra sintética e aislada incluida.
- El bundle no es compatible con `AutoModel` ni con adaptadores PEFT estándar: requiere el código del autor y la base exacta incluida en `base/`.
- Despliegue en GPU y alojado no verificado; solo se documenta un entorno de CPU.
- Soporte únicamente de inglés y de un esquema fijo; no hay capacidades multilingües ni de tool calling.
- Licencia MIT: permite uso comercial, pero la falta de validación en producción y las advertencias del autor desaconsejan ese uso sin evaluación adicional.
- No se documentan sesgos específicos, aunque al entrenarse sobre datos sintéticos generados por el autor, cualquier sesgo del generador podría reflejarse en las salidas.

## Enlaces

- Hugging Face: https://huggingface.co/nehal-vaghasiya/tinysql-lora
- Repositorio fuente: https://github.com/nehalvaghasiya/transformers-from-scratch
- Commit fuente: `5fdb74437670658c928e1f0fa4dacf80fca9c0e1`
- Scripts de ajuste: `finetuning/README.md` dentro del repositorio fuente
- Script de inferencia: `predict.py` incluido en el bundle
