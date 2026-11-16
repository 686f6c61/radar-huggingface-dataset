# morepeaches/anlp-a3-part1-hybrid

## Resumen

`morepeaches/anlp-a3-part1-hybrid` es un checkpoint educativo de un modelo causal a nivel de caracter publicado en Hugging Face. No es un modelo de propósito general ni un producto listo para producción: se trata del resultado parcial de la Parte A de la tercera tarea de un curso de Procesamiento de Lenguaje Natural Avanzado, entrenado desde cero ("from-scratch") para una tarea de descifrado de texto cifrado (character decipherment). El modelo lee ciphertext bruto y genera caracteres de plaintext de forma autorregresiva, utilizando sus propias predicciones previas durante la inferencia.

El repositorio tiene un tamaño de 0,0 GB, no registra descargas ni likes y no expone pipeline ni licencia. La model card indica explícitamente que no se proporciona integración con `AutoModel` de Hugging Face y que la carga requiere el loader `src.part1.cli.load_checkpoint` del repositorio del curso, suministrado por separado. El checkpoint contiene `weights.safetensors` con los tensores del modelo y `metadata.json` con arquitectura, tokenizer, huella de integridad, estado de entrenamiento y procedencia de la validación.

El entrenamiento está marcado como parcial: se completaron 20.600 de 38.893 actualizaciones de optimizador planificadas, con parada temprana activada. Los resultados de validación son bajos (precisión de carácter de 0,0928), lo que limita cualquier uso práctico. Su relevancia es exclusivamente docente y de reproducibilidad, no comparativa ni de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo causal a nivel de caracter, entrenado desde cero; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`weights.safetensors`) junto con `metadata.json` y `training_config.yaml` |

## Arquitectura y entrenamiento

La model card describe un modelo causal a nivel de caracter (character-level) entrenado desde cero, sin especificar la familia arquitectónica concreta (transformer, SSM u otra). El checkpoint guarda la arquitectura principal sin cambios y excluye una extensión separada de "running-sum-feedback". El modelo opera sobre ciphertext bruto y genera plaintext carácter a carácter, condicionando cada paso a sus propias predicciones previas (free-running).

El entrenamiento se detuvo de forma temprana tras 20.600 de 38.893 actualizaciones de optimizador previstas, por lo que el estado es parcial. La model card advierte que las distintas arquitecturas comparadas en la tarea tienen presupuestos de entrenamiento completados diferentes, de modo que estos checkpoints no establecen una comparación arquitectónica de igual presupuesto ni reproducen un resultado de referencia independiente. No se detallan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El repositorio excluye datos de entrenamiento, estado del optimizador, snapshots de recuperación, credenciales y rutas específicas de máquina.

## Capacidades

- Generación causal de caracteres de plaintext a partir de ciphertext de entrada.
- Decodificación autorregresiva free-running: el modelo reutiliza sus propias predicciones previas de plaintext durante la inferencia.
- Ámbito limitado a la tarea de descifrado a nivel de carácter del curso; no se documentan capacidades generales de generación de texto, razonamiento, código o matemáticas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Evaluación docente de la tarea: el checkpoint sirve para que el profesorado del curso evalúe la Parte A de la asignación con el loader oficial y las métricas de validación documentadas.
- Reproducibilidad de resultados: permite reproducir las cifras de validación publicadas (precisión de carácter 0,0928, precisión de palabra 0,0360, exact match 0,1613 sobre 1.153 ejemplos) usando la revisión fijada en el manifiesto de publicación.
- Estudio de decodificación free-running: útil para analizar cómo un modelo a nivel de carácter propaga sus propios errores al generar plaintext de forma autorregresiva.
- Análisis de entrenamiento parcial: sirve como caso de estudio de parada temprana (20.600 de 38.893 actualizaciones) y de su impacto en la precisión final.
- Material de aula sobre modelos from-scratch: ilustra el flujo completo de entrenamiento, serialización de pesos en safetensors y metadatos de procedencia.
- Referencia para comparaciones controladas: puede usarse como punto de partida para reproducir comparaciones de arquitecturas con presupuestos de entrenamiento igualados, algo que la propia model card señala que este checkpoint no establece.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (validación full-source free-running, no test):

| Metrica | Valor |
|---|---:|
| Precisión de carácter | 0,0927780226 |
| Precisión de palabra | 0,0360456118 |
| Exact match | 0,1613183001 |
| Ejemplos evaluados | 1153 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0,0 GB y no se publican parámetros totales).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al no conocerse el número de parámetros no puede confirmarse que quepa en tarjetas como RTX 4090.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI de forma documentada; la carga requiere el loader `src.part1.cli.load_checkpoint` del repositorio del curso, junto con `weights.safetensors` y `metadata.json` de la revisión fijada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card indica que existen otras arquitecturas comparadas dentro de la misma tarea del curso con presupuestos de entrenamiento distintos, pero no se publican sus especificaciones ni resultados en la información proporcionada, y no se identifican modelos públicos comparables de descifrado a nivel de carácter con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- Precisión muy baja: 0,0928 de precisión de carácter y 0,0360 de precisión de palabra en validación limitan cualquier uso práctico.
- Entrenamiento parcial: solo 20.600 de 38.893 actualizaciones planificadas, con parada temprana; el modelo no está completamente entrenado.
- Los resultados son de validación, no de test, y no constituyen una comparación arquitectónica de igual presupuesto ni reproducen un resultado de referencia.
- Sin integración con Hugging Face `AutoModel`: requiere el loader específico del repositorio del curso, lo que añade dependencia de código externo.
- Licencia no disponible: no puede confirmarse el permiso para uso comercial ni la redistribución.
- Idioma limitado al inglés y tarea restringida al descifrado a nivel de carácter; no es un modelo de propósito general.
- Riesgo de alucinación y propagación de errores inherente a la decodificación free-running, donde cada predicción condiciona las siguientes.
- Sesgos conocidos: no documentados en la información disponible.
- El checkpoint excluye datos de entrenamiento, estado del optimizador y snapshots, por lo que no es reentrenable ni auditable más allá de los metadatos incluidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/morepeaches/anlp-a3-part1-hybrid
- Repositorio del curso con `src.part1.cli`: no disponible en la información proporcionada
- Paper, blog, demo o repositorio adicional: no disponible
