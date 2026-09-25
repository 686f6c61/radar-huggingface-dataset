# psudini/Llama-3.2-1B-SudokuJev

## Resumen

Llama-3.2-1B-SudokuJev es un adaptador LoRA sobre meta-llama/Llama-3.2-1B que sustituye la cabeza de lenguaje (LM head) por una cabeza de clasificación de 9 salidas. Dado el contenido de la fila, la columna y la caja 3x3 de una celda vacía de Sudoku, el modelo devuelve una puntuación independiente por cada dígito del 1 al 9 que indica si ese dígito podría colocarse legalmente en esa celda. No genera texto en ningún caso: funciona como un puntuador de opciones, al estilo de una API de decisión tipo Jev.

El modelo lo publica el usuario psudini (pruthvinathsudini) dentro del repositorio github.com/pruthvinathsudini/sudoku-jev, que incluye el solver, la interfaz web y el cuaderno de entrenamiento. Sigue la misma receta que AlexWortega/openjev: se parte de un decodificador, se descarta la LM head, se agrupa el estado oculto del último token (2048 dimensiones) y se entrena una capa lineal de 2048 a 9 con activación sigmoide. El adaptador LoRA ocupa 43 MB y la cabeza apenas unos kilobytes, por lo que el artefacto completo es muy ligero.

Su relevancia es fundamentalmente metodológica más que práctica: demuestra que un LLM pequeño puede reconvertirse en un clasificador de opciones entrenable en una única GPU T4 de Google Colab con 250 pasos y 8.000 celdas generadas. El autor reconoce explícitamente que la deducción aprendida equivale a unas pocas líneas de código convencional, de modo que el interés está en la receta «LLM como puntuador de opciones», no en la calidad del solver resultante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (Llama 3.2) con LM head eliminada; LoRA + cabeza de clasificación `Linear(2048, 9)` sobre el estado oculto del último token |
| Parámetros totales | 1B (modelo base meta-llama/Llama-3.2-1B); adaptador LoRA de 43 MB más cabeza de 9x2048 + 9 sesgos |
| Longitud de contexto | No disponible (la model card no la especifica; las entradas son frases cortas de una celda) |
| Tipos de cuantización | No se publican pesos cuantizados. Ejemplos de uso en fp32; entrenamiento con autocast fp16. Exportación a ONNX disponible en el repositorio de GitHub |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Llama 3.2 Community License, sujeta a la Llama 3.2 Acceptable Use Policy |
| Formato de pesos | `safetensors` (adaptador LoRA `adapter_model.safetensors` + `head.safetensors`), configuración `adapter_config.json` y `sudoku_jev.json`; exportación ONNX vía repositorio |
| Pipeline declarado | `text-classification` |
| Librería | `peft` |
| Modelo base | meta-llama/Llama-3.2-1B (acceso restringido, requiere autorización) |
| Tarea | Puntuación de legalidad de dígitos 1-9 para una celda de Sudoku |

## Arquitectura y entrenamiento

La arquitectura reutiliza el cuerpo de Llama-3.2-1B con un adaptador LoRA (r=16, alpha=32, dropout 0,05) aplicado a las proyecciones q, k, v, o, gate, up y down. La LM head se descarta por completo: el flujo es celda de texto → Llama-3.2-1B ajustado con LoRA → estado oculto del último token (2048) → `Linear(2048, 9)` → sigmoide → 9 puntuaciones independientes. La cabeza se entrena de forma completa, no con LoRA. La entrada debe respetar exactamente el formato `row: <9> | col: <9> | box: <9> | answer:`, donde `?` marca la celda objetivo, `.` las celdas vacías y la caja se lee de izquierda a derecha y de arriba abajo; para lotes se hace padding a la derecha y se toma el último token de cada prompt.

Los datos se generan al vuelo: rejillas válidas aleatorias con entre 22 y 50 pistas, una celda en blanco por ejemplo y etiquetado con sus dígitos legales; la mitad de los ejemplos tienen exactamente un dígito legal. La pérdida es entropía cruzada binaria por dígito, con optimizador AdamW, learning rate 2e-4 para el LoRA y 1e-3 para la cabeza, 100 pasos de warm-up, scheduler coseno y autocast fp16. El entrenamiento se realizó en una única NVIDIA T4 de Google Colab durante 250 pasos con batch 32 (8.000 celdas) y se detuvo de forma temprana porque la validación ya era perfecta. Un solver completa una celda cuando exactamente un dígito supera el umbral de 0,5 y repite el proceso sobre la rejilla.

## Capacidades

- Puntuación de legalidad por dígito: devuelve 9 valores sigmoideos independientes para una celda de Sudoku descrita por fila, columna y caja.
- Deducción de candidatos únicos: identifica correctamente cuándo solo un dígito es legal, que es el caso en la mitad del conjunto de entrenamiento.
- Detección de celdas ambiguas: cuando varios dígitos superan 0,5, el modelo no elige y el solver puede saltar esa celda.
- Resolución de puzles fáciles de principio a fin: 30 de 30 puzles fáciles resueltos sin ningún dígito erróneo.
- Inferencia por lotes: soporta batching con padding a la derecha aprovechando que el modelo es causal (no requiere máscara de atención).
- Ejecución en GPU con DirectX 12 mediante exportación ONNX y DirectML, validada en una AMD RX 6750 XT.
- Integración como función de decisión: la salida es directamente consumible por un solver externo, sin postprocesado de texto.
- No dispone de tool calling, function calling, soporte de agentes, capacidades multilingües, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Aceleración de solvers por backtracking: el modelo puede actuar como heurística de poda que descarte dígitos ilegales antes de expandir el árbol de búsqueda, reduciendo el factor de ramificación en cada celda.
- Generación y validación de puzles: dado un generador de rejillas, el modelo permite comprobar rápidamente qué celdas tienen candidato único y clasificar el puzle por dificultad efectiva.
- Asistentes educativos de Sudoku: en una aplicación de aprendizaje, el modelo puede señalar qué dígitos son legales en una celda seleccionada y justificar por eliminación por fila, columna y caja.
- Demostración de la receta «LLM como puntuador de opciones»: sirve como plantilla reproducible (adaptador LoRA + cabeza lineal) para experimentos que reconviertan un decodificador en clasificador de decisiones estructuradas.
- Inferencia local en GPUs AMD: gracias al exportador ONNX con DirectML incluido en el repositorio, es viable desplegar el modelo en equipos con GPU AMD bajo Windows sin depender de CUDA, con alrededor de 17 ms por celda en fp32.
- Pruebas comparativas de cabezas de clasificación: útil como baseline controlado frente a cabezas entrenadas desde cero o frente a enfoques zero-shot con la LM head original, que en el caso de Qwen3.5-0.8B solo alcanza un 2% de acierto en celdas de candidato único.
- Prototipado en edge o portátil: con un modelo base de 1B y un adaptador de 43 MB, el conjunto cabe en GPUs de consumo y permite iterar sin infraestructura dedicada.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| 2.000 celdas generadas reservadas (conjunto de validación) | Conjunto de dígitos legales exacto: 100%; rellenos de un único dígito incorrectos: 0 |
| 30 puzles fáciles reservados, resueltos de principio a fin | 30/30, 0 dígitos erróneos |
| Puzle de ejemplo de Wikipedia (51 celdas vacías) en AMD RX 6750 XT | Resuelto en 6,2 s, 10 pasadas |
| Latencia por celda en AMD RX 6750 XT (ONNX, DirectML, fp32) | ~17 ms |
| Baseline: Qwen3.5-0.8B sin entrenar, zero-shot con su LM head | 2% de acierto en celdas de candidato único |

No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, GSM8K, HumanEval ni similares) en la información disponible.

## Requisitos de hardware

- Huella del adaptador: 43 MB (`adapter_model.safetensors`) más `head.safetensors` (matriz de 9x2048 y vector de 9 sesgos), prácticamente despreciable.
- Modelo base: Llama-3.2-1B, que en fp32 ocupa aproximadamente 4-5 GB de VRAM incluyendo activaciones y en fp16 alrededor de 2-3 GB (estimación a partir del tamaño declarado del modelo base; no se publican cifras exactas en la model card).
- GPU de entrenamiento documentada: 1x NVIDIA T4 (Google Colab), 250 pasos con batch 32.
- GPU de inferencia documentada: AMD RX 6750 XT mediante ONNX y DirectML, con ~17 ms por celda en fp32 y 6,2 s para resolver un puzle de 51 celdas vacías en 10 pasadas.
- Cabe en GPU de consumo: sí, cualquier tarjeta con al menos 4 GB de VRAM en fp16 puede alojar el modelo base más el adaptador; el cuello de botella es el backbone de 1B, no la cabeza.
- Opciones de despliegue: PyTorch y `peft` según el ejemplo de la model card; exportación a ONNX con DirectML para GPUs AMD o Windows; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas herramientas no aplican directamente.
- Throughput: no disponible más allá de la latencia por celda medida en la RX 6750 XT.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| psudini/Llama-3.2-1B-SudokuJev | 1B + LoRA 43 MB + cabeza 9x2048 | Puntuación de dígitos legales en Sudoku | No disponible | 100% en 2.000 celdas; 30/30 puzles fáciles | Llama 3.2 Community License | HuggingFace + GitHub |
| AlexWortega/openjev | No disponible | Receta original de LLM como puntuador de opciones | No disponible | No disponible | No disponible | HuggingFace |
| Qwen3.5-0.8B (zero-shot, LM head) | 0,8B | Generación de texto usada como baseline | No disponible | 2% de acierto en celdas de candidato único | No disponible en la información | HuggingFace |
| meta-llama/Llama-3.2-1B (base) | 1B | Generación de texto e instrucciones | No disponible en la información | No disponible | Llama 3.2 Community License | HuggingFace (acceso restringido) |

## Limitaciones y advertencias

- Solo ha aprendido una deducción: qué dígitos están ausentes de la fila, la columna y la caja de una celda. Los puzles que requieren técnicas más avanzadas (singles ocultos, pares, cadenas) se bloquean porque ninguna celda queda con una única opción.
- El modelo no adivina: cuando hay varias opciones legales devuelve varias puntuaciones altas y el solver debe saltar la celda, lo que puede dejar el puzle sin resolver.
- Distribución de entrada muy restringida: se entrenó y evaluó únicamente con rejillas generadas y el formato de texto exacto `row: ... | col: ... | box: ... | answer:`. Cualquier otra disposición o texto libre queda fuera de distribución.
- Entrenamiento y evaluación limitados a rejillas generadas, no a puzles reales de dificultad alta; los 30 puzles resueltos son explícitamente fáciles.
- Las métricas proceden del propio autor, sin evaluación independiente ni revisión por pares, y el repositorio no registra descargas ni valoraciones de la comunidad.
- No genera texto, por lo que no puede emplearse para tareas de conversación, resumen, código ni razonamiento general. La LM head se ha eliminado.
- Idioma: la model card declara únicamente inglés, aunque la entrada real es una cadena estructurada de dígitos y símbolos.
- Licencia: al ser un derivado de Llama 3.2, se distribuye bajo la Llama 3.2 Community License y queda sujeta a la Acceptable Use Policy de Meta, con los requisitos de atribución y las restricciones de uso comercial que esta impone.
- Requiere acceso autorizado al modelo base gateado meta-llama/Llama-3.2-1B para poder cargar el adaptador.
- Utilidad práctica limitada: el autor indica que la misma deducción se implementa en unas pocas líneas de código ordinario, por lo que el modelo es una demostración metodológica y no un mejor solver de Sudoku.
- La fecha de creación registrada en los metadatos (24 de septiembre de 2026) es posterior a la fecha de consulta habitual, lo que conviene verificar antes de citar el recurso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/psudini/Llama-3.2-1B-SudokuJev
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Receta original de referencia: https://huggingface.co/AlexWortega/openjev
- Repositorio con código, solver, interfaz web y cuaderno de entrenamiento: https://github.com/pruthvinathsudini/sudoku-jev
- Sitio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
- Código de inferencia de Llama: https://github.com/meta-llama/llama
- Licencia Llama 3.2 Community License: incluida en el repositorio como `LICENSE.txt`
- Política de uso aceptable: incluida en el repositorio como `USE_POLICY.md`
- Ficha de Llama-3.2-1B en ModelScope: https://www.modelscope.cn/models/LLM-Research/Llama-3.2-1B
