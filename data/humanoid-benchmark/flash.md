# humanoid-benchmark/flash

## Resumen

FLASH es una política de imitación (policy) para robótica humanoide publicada en el repositorio `humanoid-benchmark/flash`. No es un modelo de lenguaje: es un checkpoint de control motor entrenado para ejecutar tareas concretas de manipulación y locomoción con el robot Unitree G1 equipado con manos Inspire. El modelo subyacente es FLASH-Policy de `NTUMARS/FLASH-Policy` (commit f47e490), integrado en el entrenador de baselines de Humanoid Benchmark mediante `evaluation/baselines/train.py --policy flash --contract g1_sonic_dfx6`, con pesos en formato `hb_baselines/1`.

El repositorio contiene dos ejecuciones de entrenamiento, una para la tarea de retirar una prenda negra de la percha y depositarla en el cesto (B7 black) y otra para la variante con prenda verde que incluye caminar alrededor de una mesa auxiliar (B7 green). Cada ejecución publica los dos últimos checkpoints (pasos 14.000 y 16.000) y el checkpoint evaluado es el de menor MSE de acción normalizado en validación.

Es relevante porque documenta de forma reproducible el pipeline completo de una política visomotora para robótica humanoide: receta de entrenamiento, aumentación de datos, métricas internas, código exacto de entrenamiento y sumas SHA-256. El tamaño del repositorio es de 0,7 GB y no consta licencia declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 4 capas, 8 cabezas, dimensión oculta 512, sobre codificadores ResNet18 por cámara (dos cámaras) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de historia de 8 puntos de acción con stride 2 (16 filas de acción) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` + `config.json` + `protocol.json` + `SHA256SUMS`, formato `hb_baselines/1` |

## Arquitectura y entrenamiento

La política procesa dos flujos de entrada. Por un lado, el estado del Unitree G1 en 44 dimensiones: 29 ángulos articulares del cuerpo, 6 + 6 valores medidos de las manos Inspire y 3 valores de gravedad proyectada, sin velocidades articulares. Por otro, dos imágenes RGB (vistas `ego_view` y `chest`) redimensionadas a 168 x 224, cada una codificada por un ResNet18 independiente entrenado desde cero con GroupNorm. Sobre estas representaciones se aplica un transformer de 4 capas, 8 cabezas y dimensión 512, que incorpora además el historial de las 8 filas de acción ejecutadas hasta t-1 con stride de 2 fotogramas (cada fila son 64 valores de token de movimiento SONIC más 12 valores medidos de manos). La salida son 16 acciones de dimensión 76: 64 valores SONIC y 6 valores medidos por cada mano Inspire, con normalización almacenada en los pesos.

El entrenamiento usa AdamW (lr 1e-4, betas 0,95/0,999, weight decay 1e-6), warm-up lineal de 500 pasos seguido de decaimiento coseno, EMA 0,9999 (los pesos publicados son los EMA), precisión mixta, semilla 42, batch global de 512 en una sola GPU y 16.000 pasos de optimizador con checkpoints cada 2.000. La aumentación aplica la especificación v2 de Humanoid Benchmark sobre ambas vistas (15 efectos fotométricos, geométricos, de sensor e iluminación, con uno amplificado a 1,5x por muestra) y, solo sobre las 29 articulaciones del cuerpo, un sesgo uniforme de ±2° más ruido gaussiano de 0,25° por muestra, sin retardo propioceptivo ni descarte de historial. Los datos de entrenamiento son 77.170 fotogramas (episodios 0-99 de 107) en la tarea negra y 326.907 fotogramas (421 episodios) en la verde.

## Capacidades

- Control visomotor de un robot humanoide Unitree G1 con manos Inspire para tareas de manipulación (descolgar una prenda y depositarla en un cesto) y locomoción asociada (rodear una mesa auxiliar).
- Fusión de estado propioceptivo de 44 dimensiones con dos vistas RGB en un único transformer.
- Generación de secuencias de acción de 16 pasos en el espacio de tokens de movimiento SONIC.
- Inferencia con un único paso de Euler y ajuste polinómico de orden 6 con restricción de frontera.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: es una política de control, no un modelo generativo de texto.
- No incluye modo de pensamiento, visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Investigación en imitación robótica: reproducir exactamente el entrenamiento y la evaluación de una política visomotora con el código incluido en `code_78235367/` y la receta documentada en `protocol.json`.
- Benchmarking de políticas humanoides: comparar FLASH con otras políticas del mismo benchmark (por ejemplo, variantes de Humanoid Benchmark) bajo el mismo contrato `g1_sonic_dfx6` y las mismas métricas normalizadas.
- Manipulación de ropa en entornos domésticos simulados: la tarea B7 evalúa descolgar una prenda y soltarla en un cesto, un caso representativo de manipulación deformable con manos antropomórficas.
- Locomoción con obstáculos: la variante B7 green exige caminar alrededor de una mesa auxiliar antes de la manipulación, útil para estudiar la integración de navegación y agarre en una sola política.
- Estudio de aumentación de datos: la especificación v2 con 15 efectos y el ruido articular permiten analizar la robustez frente a variaciones fotométricas y de calibración.
- Despliegue en laboratorio sobre Unitree G1: cargando el checkpoint con `BaselinePolicy(..., device='cpu', policy='flash', robot='g1')`, tal como se documenta en la model card.
- Reproducibilidad y auditoría: los ficheros `SHA256SUMS`, `pip freeze` y el snapshot de código permiten verificar bit a bit el entorno de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje. La única métrica publicada es el MSE de acción normalizado en entrenamiento sobre los episodios retenidos 100-106 de la tarea B7 black:

| Paso | 250 | 2.000 | 4.000 | 8.000 | 12.000 | 14.000 | 16.000 |
|---|---|---|---|---|---|---|---|
| MSE normalizado | 0,801 | 0,470 | 0,420 | 0,386 | 0,379 | 0,3791 (mínimo) | 0,3794 |

El autor advierte que buena parte de este valor procede de las seis dimensiones medidas de la mano derecha (70-75), que la tarea apenas utiliza y por tanto pesan mucho al normalizar por su desviación típica. No se publican métricas de éxito en tarea para la variante B7 green en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 0,7 GB e incluye dos ejecuciones con dos checkpoints cada una, por lo que un checkpoint individual es del orden de decenas de MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el ejemplo de la model card se ejecutó en CPU. Para entrenamiento se usó una sola GPU con batch 512 y precisión mixta (modelo no identificado).
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con suficiente memoria para dos ResNet18 y un transformer de 4 capas; no se publica el mínimo exacto.
- Opciones de despliegue: el runtime propio `baselines.runtime.BaselinePolicy` (Python 3.12, torch 2.9.0) incluido en el snapshot de código. No consta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otras políticas humanoides comparables (parámetros, contexto, rendimiento o licencia) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo ejecuta las tareas B7 black y B7 green sobre Unitree G1 con manos Inspire; no se puede reutilizar para otras tareas sin reentrenamiento.
- La licencia no está declarada, por lo que el uso comercial es incierto y requiere contactar con el autor.
- El MSE de validación está dominado por dimensiones poco usadas (manos derechas, 70-75), lo que puede enmascarar el rendimiento real en las dimensiones críticas de la tarea.
- La variante B7 black se entrenó solo con episodios 0-99 (77.170 fotogramas) y descartó los 10 fotogramas de pie iniciales; la variante green usó los 421 episodios completos, lo que introduce una diferencia de régimen de datos entre ambas.
- No se incluyen estados de optimizador ni de reanudación, lo que impide continuar el entrenamiento exactamente desde los checkpoints publicados.
- Riesgo de sobreajuste al entorno y a las cámaras concretas del dataset; la aumentación mitiga pero no elimina la sensibilidad a cambios de iluminación o calibración.
- No se han publicado evaluaciones de éxito en tarea fuera del MSE interno, por lo que el rendimiento real en el robot físico no está cuantificado en la información disponible.
- El modelo no procesa lenguaje: las instrucciones textuales de las tareas son metadatos del dataset, no entradas del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/humanoid-benchmark/flash
- Modelo base FLASH-Policy: https://huggingface.co/NTUMARS/FLASH-Policy (commit f47e490)
- Dataset B7 black: `humanoid-benchmark/b7-black-clothes-hamper` @619f3427
- Dataset B7 green: `humanoid-benchmark/b7-green-clothes-hamper` @4d2c613c (v2)
- Commit de Humanoid_benchmark usado: 78235367
