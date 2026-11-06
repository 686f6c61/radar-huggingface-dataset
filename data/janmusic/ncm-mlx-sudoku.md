# janmusic/ncm-mlx-sudoku

## Resumen

ncm-mlx-sudoku es una implementación independiente en MLX del método Next-Concept Modeling (NCM), descrito por Kumbong et al. en el artículo arXiv:2610.14162. El modelo es un generador no autorregresivo de 6,44 millones de parámetros que resuelve tableros de Sudoku en 12 pasos paralelos de refinamiento grueso-a-fino (coarse-to-fine), apoyándose en un códec residual-VQ multiescala congelado que traduce entre la representación latente y las 81 celdas del tablero. Lo desarrolla janmusic como proyecto personal, sin afiliación con Stanford ni con HazyResearch, y no es compatible con los checkpoints oficiales del método original.

El problema que aborda es demostrar que la generación no autorregresiva por conceptos puede resolver una tarea combinatoria estructurada con un presupuesto de cómputo muy reducido: cada uno de los 12 niveles requiere una única pasada forward del generador que predice simultáneamente todos los códigos de ese nivel, y una decodificación final del códec produce el tablero completo. Frente a la generación token a token, esto elimina la acumulación de errores y permite paralelismo total dentro de cada nivel.

Es relevante ahora por dos motivos: primero, porque reproduce de forma independiente un método de investigación reciente y publica pesos, semillas y registros de entrenamiento verificables (hashes SHA-256, presupuesto exacto de actualizaciones); segundo, porque está implementado en MLX, lo que lo convierte en un ejemplo práctico de entrenamiento e inferencia en Apple Silicon (y en Linux con backend CUDA). El resultado es un artefacto de investigación pequeño y auditable, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con Next-Concept Modeling (NCM); atención block-diagonal; condicionamiento por prefijo de pistas; códec residual-VQ multiescala |
| Parámetros totales | 6.440.128 (generador); códec: 13.915.200 valores guardados (incluye estado EMA, no equivale a parámetros entrenables de inferencia) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionamiento sobre una rejilla de pistas de 81 celdas) |
| Tipos de cuantización | No disponible (pesos en safetensors, presumiblemente fp32/bf16 según el tamaño de 25,8 MB) |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje natural; opera sobre tableros de Sudoku) |
| Licencia | MIT |
| Formato de pesos | safetensors (`generator.safetensors`, `codec/codec.safetensors`), con `generator.json`, `config.json` y `codec.json` |

## Arquitectura y entrenamiento

El generador es un transformer de 8 capas, anchura 256 y 8 cabezas, con atención block-diagonal y condicionamiento mediante prefijo de tokens que codifica las pistas del tablero. La generación es jerárquica: 12 niveles con 1, 2, 4, 6, 9, 13, 18, 26, 37, 50, 67 y 81 posiciones respectivamente, y codebooks de 16 entradas. En cada nivel, una sola pasada forward predice todos los códigos de ese nivel a la vez; un códec residual-VQ multiescala congelado (entrenado aparte durante 3.000 pasos, 531 s, en Apple Silicon) decodifica finalmente las 81 celdas. La reconstrucción del códec es del 100% en validación, un dato independiente de la calidad del generador.

Los datos de entrenamiento son sintéticos y generados por el propio repositorio: 200.000 puzles base más 8 millones de puzles únicos cacheados con entre 28 y 45 pistas. Los tableros publicados del benchmark NCM se usan exclusivamente para evaluación. El presupuesto fue de 128.000 actualizaciones con batch 128 (16,384 millones de presentaciones), learning rate 6e-4 y corrupción del condicionamiento decreciente de 0,50 a 0,10. El entrenamiento del generador consumió aproximadamente 54.420 s (E19-funded, seed 0) y 54.122 s (E20, seed 1) en una única NVIDIA A40 con MLX 0.32.3 (backend CUDA) y Python 3.12.3. No se registraron reinicios del optimizador ni truncamientos. Los hashes SHA-256 del generador son `843a8929c43ae8a976e7a71402d18d9a5ce7172ebfc3b3870cfe74fc3c8293b9` (E19) y `b6ddadb7278e7f1c5542eecef676840f39cb829e802d189b65f2dadd645c2b3d` (E20).

## Capacidades

- Resolución de Sudoku completa: dado un tablero parcial con pistas, genera una rejilla de 81 celdas válida que preserva todas las pistas.
- Generación no autorregresiva: produce todos los códigos de un nivel en una sola pasada, con 12 pasos totales en lugar de una secuencia token a token.
- Refinamiento grueso-a-fino: la representación pasa de 1 posición en el primer nivel a 81 en el último, lo que permite corregir globalmente antes de fijar el detalle.
- Decodificación greedy (temperatura 0) como modo de evaluación declarado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües: no procesa texto libre.
- No dispone de modo thinking, visión ni audio.
- Ejecución en Apple Silicon vía MLX y en Linux con MLX sobre CUDA.

## Casos de uso

- Investigación en generación no autorregresiva: sirve como banco de pruebas reproducible para comparar NCM frente a decodificación autorregresiva en una tarea con solución verificable, gracias a que el repositorio incluye configuración, semillas y registros de entrenamiento.
- Validación de implementaciones de MLX: al ser una implementación independiente con hashes publicados, permite comprobar la corrección de un port o de una versión de MLX comparando la salida del generador con los resultados declarados.
- Docencia sobre modelos generativos estructurados: el tamaño reducido (6,44 M de parámetros, repo de 0,1 GB) y la separación limpia entre generador y códec lo hacen adecuado para explicar decodificación jerárquica y códecs discretos en un portátil.
- Pruebas de pipelines de evaluación de restricciones: el criterio "resuelto = rejilla completa válida que preserva todas las pistas" es una métrica objetiva y barata de implementar, útil para validar arneses de evaluación propios.
- Generación de datos sintéticos de Sudoku: el repositorio que acompaña al modelo genera puzles con 28-45 pistas, reutilizable para construir datasets de entrenamiento o de test en tareas de constraint satisfaction.
- Estudio de robustez ante dificultad: los tres niveles de dificultad (40/35/30 pistas) con precisión muy dispar (98,1% / 83,4% / 40,3%) permiten analizar cómo degrada un modelo no autorregresivo a medida que disminuye la información de condicionamiento.
- Benchmark de hardware para MLX: con 12 pasadas forward por tablero y un modelo de 6,44 M de parámetros, es una carga ligera útil para medir latencia de MLX en distintos equipos Apple Silicon.

## Benchmarks y rendimiento

Resultados declarados por el autor (generación greedy, temperatura 0; resuelto = rejilla completa válida que preserva todas las pistas; 2.000 tableros de test publicados del benchmark NCM por dificultad, con 40/35/30 pistas). Son agregados registrados en el log de experimentos del repositorio, no re-puntuados de forma independiente.

| Modelo | Fácil | Medio | Difícil |
|---|---:|---:|---:|
| E19-funded, seed 0 (raíz del repo) | 98,10% | 83,40% | 40,30% |
| E20, seed 1 (`seed1/`) | 97,25% | 79,60% | 33,25% |
| NCM original (Kumbong et al., modelo y receta distintos, citado) | 99,5% | 96,5% | 86,1% |

Advertencias del propio autor: la reconstrucción del códec (100% en validación) y la calidad del generador son métricas separadas; el resultado del NCM original emplea un generador de 25,46 M de parámetros, checkpoints específicos por dificultad y 51,2 millones de presentaciones de entrenamiento (esta ejecución: 16,384 M), por lo que la comparación no aísla ningún factor concreto; y las dos semillas usan los mismos tableros, de modo que no deben agruparse como 4.000 tableros independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el generador ocupa 25,8 MB y el códec 55,7 MB en safetensors, por lo que el modelo completo cabe holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no se requieren GPU de datacenter; el entrenamiento se hizo en una NVIDIA A40, pero la inferencia es trivial para cualquier acelerador compatible con MLX.
- Cabe en GPU de consumo: sí, en cualquier GPU Apple Silicon (requisito del stack MLX) y en GPUs NVIDIA de consumo bajo Linux con el backend CUDA de MLX.
- Opciones de despliegue: MLX (Apple Silicon o Linux con CUDA) mediante el repositorio `ncm-mlx`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos y el código de inferencia son específicos del proyecto.
- Latencia y throughput: no disponibles de forma publicada; estructuralmente la inferencia son 12 pasadas forward del generador más una decodificación del códec por tablero, con paralelismo dentro de cada nivel.
- Nota de reproducibilidad: el código lee los pesos desde rutas relativas fijas, por lo que los ficheros deben colocarse en la estructura de directorios indicada en la model card (`artifacts/sudoku-e6`, `artifacts/sudoku-e19-funded`, `artifacts/sudoku-e20-seed1`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / condicionamiento | Precisión en Sudoku (fácil/medio/difícil) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ncm-mlx-sudoku (E19-funded) | 6,44 M (generador) | Rejilla de pistas de 81 celdas; 12 niveles | 98,10% / 83,40% / 40,30% | MIT | Pesos en Hugging Face, código en GitHub |
| NCM original (Kumbong et al.) | 25,46 M (generador) | Misma formulación NCM; checkpoints por dificultad | 99,5% / 96,5% / 86,1% | No disponible en la información proporcionada | No disponible en la información proporcionada |
| ncm-mlx-sudoku (E20, seed 1) | 6,44 M (generador) | Idéntico al E19, distinta semilla | 97,25% / 79,60% / 33,25% | MIT | Incluido en `seed1/` del mismo repo |

No se dispone de datos sobre otras alternativas comparables (por ejemplo, solvers neuronales autorregresivos o solvers clásicos de constraint propagation) en la información proporcionada.

## Limitaciones y advertencias

- Ámbito estrictamente limitado: el modelo solo resuelve Sudoku; no es un modelo de lenguaje y no debe presentarse como tal pese a la etiqueta `text-generation` del model-index.
- Rendimiento muy dependiente de la dificultad: en tableros difíciles (30 pistas) la precisión cae al 40,3% (seed 0) y al 33,25% (seed 1), lejos del 86,1% citado para el NCM original.
- Brecha frente al método original no aislada: la comparación mezcla tamaño del generador, checkpoints por dificultad y 3,1 veces más presentaciones de entrenamiento, de modo que no permite atribuir la diferencia a un solo factor.
- Métricas no verificadas de forma independiente: los resultados proceden del log de experimentos del autor y están marcados como `verified: false`; no han sido re-puntuados por terceros.
- Las dos semillas comparten tableros de test: no deben agregarse como si fueran 4.000 tableros independientes, y la varianza entre semillas en dificultad media y difícil es notable (83,4% frente a 79,6%; 40,3% frente a 33,25%).
- Sin datos de sesgo lingüístico ni de alucinación en el sentido habitual, pero sí riesgo de salidas inválidas: una rejilla generada puede violar las reglas del Sudoku o contradecir pistas, y el criterio de éxito exige validación explícita.
- Licencia MIT: permite uso comercial y modificación, pero el autor declara que es una implementación independiente no afiliada a Stanford/HazyResearch y no compatible con los checkpoints oficiales del método.
- Dependencia de MLX: el despliegue requiere Apple Silicon o Linux con MLX y CUDA; no hay pesos en GGUF ni integración con runtimes de inferencia convencionales.
- El estado del optimizador no se incluye en el repo, por lo que no es posible reanudar el entrenamiento tal cual desde los ficheros publicados.
- Idiomas soportados: no aplica ni está documentado; no hay soporte de texto en ningún idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janmusic/ncm-mlx-sudoku
- Repositorio de la implementación: https://github.com/janmus1c/ncm-mlx
- Artículo de Next-Concept Modeling: https://arxiv.org/abs/2610.14162
- Dataset de evaluación NCM: https://huggingface.co/datasets/hazyresearch/ncm-datasets
- Documentación de MLX: https://mlx-framework.org/
- Gestor de entornos uv: https://docs.astral.sh/uv/
