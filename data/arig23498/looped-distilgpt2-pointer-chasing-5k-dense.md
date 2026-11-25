# ariG23498/looped-distilgpt2-pointer-chasing-5k-dense

## Resumen

`looped-distilgpt2-pointer-chasing-5k-dense` es un ajuste fino de DistilGPT2 desarrollado por ariG23498 sobre una tarea sintetica de "pointer chasing" (seguimiento de punteros en un grafo dirigido). El modelo parte de los pesos de `distilbert/distilgpt2` (81.912.576 parametros) y aplica un bucle de inferencia en el bloque intermedio del transformer: los bloques [2, 4) se ejecutan una vez adicional, compartiendo pesos entre iteraciones. El checkpoint se entrena completamente (todos los parametros) durante 5000 pasos y se publica como ejemplo reproducible de investigacion sobre transformers con bucles.

La relevancia del modelo no reside en su calidad como generador de texto general, sino en su valor como banco de pruebas controlado para estudiar si la profundidad efectiva adicional (reutilizar bloques) aporta ventaja frente a un baseline denso equivalente. El autor advierte explicitamente de que se trata de una tarea algoritmica de juguete y de que una sola semilla no establece causalidad sobre el beneficio del bucle. No usa KV cache en generacion, lo que limita su uso practico pero simplifica el analisis del bucle.

El modelo es de pequeno tamano (81,9 M de parametros), licencia Apache 2.0, formato safetensors con codigo custom (`trust_remote_code=True`), y esta pensado para investigadores que quieran replicar o extender experimentos de looped transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con bucle de inferencia en bloques [2, 4); 6 bloques por forward pass |
| Parametros totales | 81.912.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de DistilGPT2 (6 bloques, dimension oculta de GPT-2 small). La innovacion es un bucle de inferencia: los bloques en el rango [2, 4) se ejecutan una vez adicional, compartiendo pesos entre iteraciones, de modo que un forward pass ejecuta 6 bloques en total con pesos compartidos. Todos los parametros se entrenan (no hay congelacion) y no se emplea KV cache durante la generacion.

El entrenamiento se realiza sobre el dataset sintetico `ariG23498/looped-distilgpt2-pointer-chasing-5k-data`, con grafos de 1 a 3 saltos en entrenamiento y un conjunto `test_long` de 4 a 6 saltos para evaluar generalizacion a caminos mas largos. Los grafos de train, validacion y test son disjuntos. El entrenamiento completa 5000 pasos. El autor indica que el checkpoint contiene pesos de inferencia, no estado del optimizador, por lo que no permite reanudacion exacta. No se documenta uso de RLHF/DPO ni de decodificacion especulativa.

## Capacidades

- Generacion autoregresiva de texto con `transformers` y `generate()` (sin KV cache).
- Resolucion de la tarea sintetica de pointer chasing: dado un grafo de aristas `A>B B>C ...` y un prompt `Start: X. Steps: N. Answer:`, produce un unico token de respuesta entre ocho posibles.
- Evaluacion de generalizacion a longitudes de camino mayores que las vistas en entrenamiento (test_long con 4-6 saltos).
- Capacidad de servir como baseline/ablation para estudiar looped transformers frente a un modelo denso equivalente.
- No se documentan capacidades de tool calling, agentes, vision, audio, thinking mode ni multilingues.

## Casos de uso

- Investigacion sobre looped transformers: replicar el experimento y comparar el checkpoint con el baseline denso y las ablaciones de bucle de inferencia para medir si la profundidad efectiva aporta ventaja en la tarea.
- Estudio de generalizacion algoritmica: usar `test_long` (4-6 saltos) para analizar como un modelo pequeno extrapola a caminos mas largos que los vistos en entrenamiento.
- Banco de pruebas de decodificacion sin KV cache: medir coste y latencia de generacion autoregresiva con `use_cache=False` en un modelo de 81,9 M de parametros.
- Docencia y divulgacion: ejemplo minimalista y reproducible de ajuste fino de DistilGPT2 con codigo custom y pesos compartidos, adecuado para tutoriales de transformers.
- Validacion de pipelines de evaluacion: comprobar infraestructura de exact-match por longitud de camino usando `metrics.json` y `history.jsonl` incluidos en el repo.
- Analisis de robustez de tareas sinteticas: estudiar el comportamiento con una sola semilla y discutir la necesidad de multiples semillas antes de extraer conclusiones causales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a `metrics.json` (exact-match por longitud de camino) y `history.jsonl` (progreso de entrenamiento) dentro del repositorio, pero no se proporcionan cifras numericas en la informacion disponible. Como referencia de la tarea: hay ocho respuestas posibles, por lo que el azar uniforme es del 12,5%.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (81,9 M de parametros, ~328 MB de pesos) mas overhead de activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); no requiere hardware de datacenter.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada); no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, y el codigo custom y la ausencia de KV cache complican su integracion en esos motores.
- Latencia y throughput: no disponibles. La generacion sin KV cache implica recalcular el contexto en cada token, con coste creciente con la longitud del prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| looped-distilgpt2-pointer-chasing-5k-dense | 81,9 M | no disponible | Pointer chasing sintetico | Apache 2.0 | Hugging Face (custom code) |
| distilbert/distilgpt2 (base) | 82 M | 1024 tokens | Generacion de texto general | Apache 2.0 | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | Generacion de texto general | MIT | Hugging Face |
| Baseline denso del mismo experimento | no disponible | no disponible | Pointer chasing sintetico | no disponible | Referenciado por el autor, no enlazado en la informacion disponible |

La comparacion relevante es contra el baseline denso y las ablaciones de bucle que el propio autor menciona; no se dispone de sus cifras.

## Limitaciones y advertencias

- Modelo de juguete: la tarea de pointer chasing es algoritmica y sintetica; no es evidencia de razonamiento general.
- Una sola semilla y mas computo en la variante con bucle no establecen un beneficio causal del looping; el autor pide consultar el baseline denso y las ablaciones antes de concluir.
- Sin KV cache: la generacion es mas lenta y costosa en prompts largos; no apto para produccion de texto general.
- Requiere `trust_remote_code=True` y revision manual de `model.py` antes de ejecutar; riesgo de seguridad si se carga codigo no auditado.
- El checkpoint contiene solo pesos de inferencia, no estado del optimizador; no permite reanudacion exacta del entrenamiento.
- Idiomas soportados no documentados; el modelo esta entrenado sobre datos sinteticos, no sobre corpus linguistico general.
- Riesgo de alucinacion irrelevante para la tarea (respuesta de un token entre ocho), pero el modelo no debe usarse como generador de texto fiable.
- Licencia Apache 2.0 permite uso comercial, pero el valor practico fuera de investigacion es practicamente nulo.
- Sin descargas ni likes en el momento de la consulta; ecosistema de soporte minimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ariG23498/looped-distilgpt2-pointer-chasing-5k-dense
- Dataset de entrenamiento: https://huggingface.co/datasets/ariG23498/looped-distilgpt2-pointer-chasing-5k-data
- Modelo base: https://huggingface.co/distilbert/distilgpt2
- Perfil del autor: https://huggingface.co/ariG23498
