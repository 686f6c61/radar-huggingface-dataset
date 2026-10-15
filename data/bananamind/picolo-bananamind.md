# BananaMind/Picolo-BananaMind

## Resumen

Picolo-BananaMind es un transformer causal decoder-only con exactamente 100 parámetros únicos entrenables, publicado por BananaMind bajo licencia MIT. No se trata de 100 millones ni de 100 mil: son 100 valores float32 reales (400 bytes) almacenados en un único archivo safetensors que se carga mediante transformers con trust_remote_code.

La arquitectura consta de una sola capa con una única cabeza de atención, anchura oculta de 2, proyección feed-forward SiLU de anchura 9, conexiones residuales y posiciones sinusoidales fijas. El tokenizador no usa BPE: divide cada byte UTF-8 en dos tokens de 4 bits, de modo que cada byte consume dos tokens del modelo, con un vocabulario de 20 entradas (16 valores de 4 bits más PAD/EOS/BOS/UNK). El entrenamiento consumió 10.000.000 de tokens de pérdida procedentes de la configuración sample-10BT de HuggingFaceFW/fineweb-edu.

Su interés es didáctico y de reproducibilidad: funciona como caso extremo de minimización de parámetros, como banco de pruebas para harness de evaluación y como referencia de rendimiento cercano al azar. Sus resultados en benchmarks (PIQA 53,10 de precisión bruta; HellaSwag 25,42; ARC Challenge 20,99) están próximos a la línea base aleatoria, tal y como reconoce el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, 1 capa, 1 cabeza de atención, atención escalada producto punto causal, conexiones residuales, RMSNorm y posiciones sinusoidales fijas |
| Parámetros totales | 100 (únicos y entrenables) |
| Longitud de contexto | 256 tokens en entrenamiento; se evaluó con ventana extendida de 8.192 tokens por extrapolación |
| Tipos de cuantización | no disponible (pesos almacenados en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (100 valores float32, 400 bytes) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de una sola capa: embedding de tokens de forma 20 × 2 = 40 parámetros, atados a la cabeza de salida (no se cuentan dos veces); RMSNorm con 2 parámetros; proyecciones de query/key/value con 2 × 6 = 12 pesos más 6 sesgos; proyección de salida de atención de 2 × 2 = 4; proyección up del feed-forward de 2 × 9 = 18; y proyección down de 9 × 2 = 18. Total: 100 parámetros. La anchura oculta es 2, la anchura del feed-forward es 9 y se usa SiLU como activación. El tokenizador es determinista a nivel de byte: divide cada byte UTF-8 en dos tokens de 4 bits, con un vocabulario de 20 entradas, y aplica EOS en cada frontera de documento. El texto ordinario se reconstruye sin pérdida.

El entrenamiento leyó en orden la configuración sample-10BT de HuggingFaceFW/fineweb-edu hasta alcanzar exactamente 10.000.000 de tokens objetivo de pérdida (los prefijos BOS son tokens de condicionamiento adicionales y no entran en ese cómputo). Se usaron secuencias de 256 tokens, lotes de 64 secuencias, 611 actualizaciones del optimizador, semilla 42 y AdamW con tasa de aprendizaje inicial 0,003 con decaimiento lineal hasta 0,0003, weight decay 0,01 y recorte de gradiente 1,0. No se realizó auditoría de solapamiento con los conjuntos de benchmark. El modelo no implementa caché KV: la generación recalcula el prefijo completo en cada paso. La inspiración declarada es MicroSupra-1k; la arquitectura, el tokenizador y el texto son originales del autor.

## Capacidades

- Generación de texto a nivel de byte: produce secuencias decodificables, pero sin coherencia léxica ni sintáctica aprovechable.
- Round-trip de bytes sin pérdida mediante el tokenizador de 4 bits: cualquier cadena UTF-8 se convierte en tokens y se reconstruye íntegramente.
- Puntuación de verosimilitud para tareas de opción múltiple dentro del harness lm_eval.
- Extrapolación posicional más allá del contexto de entrenamiento gracias a las posiciones sinusoidales fijas, con degradación no caracterizada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no disponibles (etiqueta de idioma únicamente `en`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Docencia sobre arquitecturas transformer: permite recorrer a mano el grafo completo (embedding, atención, feed-forward, RMSNorm) y contar los 100 parámetros uno por uno, algo inviable en modelos de miles de millones de parámetros.
- Pruebas de integración de transformers: sirve como caso mínimo que ejercita `trust_remote_code`, safetensors y `AutoModelForCausalLM` sin consumir recursos, útil en CI para verificar versiones de la librería.
- Validación de harness de evaluación: al producir salidas casi aleatorias, es un banco de pruebas para comprobar que un pipeline de lm_eval calcula correctamente precisión bruta, precisión normalizada y errores estándar.
- Verificación de tokenizadores byte a byte: el esquema de dos tokens de 4 bits por byte permite comprobar rutinas de codificación/decodificación y de sustitución de secuencias UTF-8 inválidas.
- Investigación en reproducibilidad a escala extrema: los metadatos completos de entrenamiento (611 actualizaciones, semilla 42, hash del stream) permiten replicar el experimento íntegramente en CPU.
- Línea base de azar en benchmarks: sus resultados en PIQA, ARC, HellaSwag y ArithMark 3.0 sirven para calibrar cuánto puntúa un modelo sin capacidad real antes de atribuir mejoras a un modelo mayor.
- Pruebas de despliegue en entornos sin acelerador: al ocupar 400 bytes y funcionar en CPU, se puede incrustar en entornos restringidos para validar cadenas de serve antes de desplegar modelos pesados.

## Benchmarks y rendimiento

Evaluación zero-shot con el harness local `lm_eval` en float32. Los valores son porcentajes. El error estándar se expresa en puntos porcentuales.

| Benchmark | Preguntas | Precisión bruta (%) | Precisión normalizada (%) | Error estándar bruto (pp) | Error estándar normalizado (pp) |
|---|---|---|---|---|---|
| PIQA | 1.838 | 53,10 | 50,71 | 1,16 | 1,17 |
| ARC Challenge | 1.172 | 20,99 | 27,82 | 1,19 | 1,31 |
| ARC Easy | 2.376 | 25,42 | 25,63 | 0,89 | 0,90 |
| HellaSwag | 10.042 | 25,42 | 23,70 | 0,43 | 0,42 |
| ArithMark 3.0 | 1.000 | 27,30 | 28,40 | no disponible | no disponible |

ArithMark usó el script `bencharithmark-3.py` sin modificar, con contexto máximo 1024 y lote 32; su métrica principal es `acc_norm`. La ejecución de lm_eval empleó longitud máxima de 8.192 tokens de 4 bits y lote 8, porque un primer intento con 1.024 falló al superar las continuaciones ese límite y no produjo puntuaciones. El autor advierte de que estos resultados reflejan en gran medida líneas base de azar y efectos de longitud de respuesta, y no evidencia de aprendizaje matemático. No se dispone de cifras comparativas de otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo completo son 400 bytes en float32 y el repositorio ocupa 0,0 GB.
- GPU recomendadas: ninguna. El autor indica que la CPU es suficiente y que la GPU resulta cómica e innecesaria.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU y en cualquier CPU, incluidos entornos sin acelerador.
- Opciones de despliegue: únicamente transformers con `trust_remote_code=True`, tal y como documenta el autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al no implementar caché KV, la generación recalcula el prefijo completo en cada token, por lo que el coste crece cuadráticamente con la longitud de la secuencia.
- Entorno de entrenamiento documentado: RTX 5070 Ti con Python 3.14, torch 2.11.0+cu130 y Transformers 5.7.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Picolo-BananaMind | 100 | 256 tokens (entrenamiento) | MIT | HuggingFace |
| MicroSupra-1k | aproximadamente 1.000 (dato derivado de la model card de Picolo, que indica un presupuesto diez veces mayor) | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento, contexto, licencia o arquitectura de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Generación sin sentido: la decodificación greedy produce salida repetitiva; el propio autor ejemplifica con la cadena `ffffffff`.
- Salida muestreada potencialmente inválida: puede contener secuencias UTF-8 inválidas que el decodificador sustituye.
- Capacidad lingüística nula: no adquiere inglés funcional, solo una distribución de bytes; no debe usarse para ninguna tarea de comprensión o generación real.
- Contexto de entrenamiento de 256 tokens: la ventana de 8.192 tokens empleada en evaluación es extrapolación y no una capacidad entrenada.
- Truncado por la izquierda: las herramientas de evaluación pueden recortar entradas largas, alterando los resultados.
- Puntuaciones próximas al azar: el autor subraya que la puntuación en opción múltiple no equivale a generar respuestas correctas y que no hay evidencia de aprendizaje matemático.
- Ausencia de auditoría de solapamiento entre FineWeb-Edu y los conjuntos de benchmark, lo que impide descartar contaminación.
- Incompatibilidad de conteo de tokens: con dos tokens por byte, las cifras no son comparables a las de modelos con tokenizador BPE.
- Ausencia de caché KV: penalización de rendimiento en secuencias largas.
- Idiomas: únicamente inglés según la etiqueta del modelo.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía alguna; no impone restricciones adicionales, pero la utilidad práctica del modelo es inexistente más allá de los casos didácticos y de prueba descritos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BananaMind/Picolo-BananaMind
- Modelo de inspiración MicroSupra-1k: https://huggingface.co/SupraLabs/MicroSupra-1k
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset ArithMark 3.0: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
- Script de evaluación ArithMark: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0/raw/main/bencharithmark-3.py
- Metadatos de entrenamiento: https://huggingface.co/BananaMind/Picolo-BananaMind/blob/main/training_results.json
- Código de entrenamiento: https://huggingface.co/BananaMind/Picolo-BananaMind/blob/main/train.py
- Resultados de lm_eval: https://huggingface.co/BananaMind/Picolo-BananaMind/blob/main/evaluation/lm_eval_results.json
- Resultados de ArithMark con predicciones: https://huggingface.co/BananaMind/Picolo-BananaMind/blob/main/evaluation/arithmark3_results.json
