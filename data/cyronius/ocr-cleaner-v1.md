# Cyronius/ocr-cleaner-v1

## Resumen

OCR cleaner v1 es un modelo experimental de correccion de texto post-OCR desarrollado por Cyronius. Su funcion es reparar errores tipicos que introducen los motores de reconocimiento optico de caracteres en texto en ingles: confusiones de caracteres (`rn` por `m`, `1` por `l`, `0` por `O`), caracteres eliminados o sobrantes, palabras fusionadas o divididas, espacios espurios, cambios de mayusculas y guiones de final de linea. Con tan solo 649.675 parametros (2,6 MB en fp32), esta disenado para ejecutarse en una sola hebra de CPU a unos 28.000 caracteres por segundo.

El modelo emplea una arquitectura poco habitual: un transformer con bucle (looped transformer) y computo adaptativo por caracter. Cada caracter de entrada es un token; en cada paso el modelo atiende al resto de caracteres y un router selecciona una de ocho operaciones aprendidas (MLPs pequenos compartidos entre pasos). Cada caracter decide cuando ha terminado mediante una probabilidad de parada aprendida, de modo que los caracteres limpios paran en torno a 3 pasos y los danados en torno a 5. Ademas, cada caracter de entrada puede emitir entre 0 y 2 caracteres de salida, lo que permite borrar, insertar y dividir caracteres en una sola pasada del encoder.

Es relevante por su enfoque de eficiencia extrema: en los experimentos del autor, este diseno supero a un bloque con bucle plano del mismo computo por paso, igualo a un bloque 8 veces mas ancho con aproximadamente 1/12 de su computo y batio a transformers MoE estandar de 4 a 15 veces su tamano en esta tarea. No obstante, el autor lo marca explicitamente como experimental y entrenado sobre dano sintetico, no sobre salida real de escaneres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer) con computo adaptativo y router de 8 operaciones tipo MoE |
| Parametros totales | 649.675 (0,65M) |
| Parametros activos | no disponible (router selecciona 1 de 8 operaciones por caracter y paso; no se detalla el reparto exacto) |
| Longitud de contexto | ventanas de hasta aproximadamente 110 caracteres, sin solapamiento |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT o Apache-2.0, a eleccion (dual) |
| Formato de pesos | safetensors (fp32), con config.json |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucle donde cada caracter de entrada actua como token. En cada paso, cada caracter atiende a los demas y un router elige una de ocho operaciones aprendidas (MLPs pequenos compartidos entre todos los pasos). Cada caracter tiene una probabilidad de parada aprendida (halting probability) que le permite decidir cuando ha terminado: los caracteres limpios paran tras unos 3 pasos y los danados tras unos 5, sin que el modelo reciba la etiqueta de cual esta danado. Los caracteres finalizados dejan de consumir computo y sus claves y valores de atencion se cachean. Cada caracter de entrada emite entre 0 y 2 caracteres de salida, lo que permite eliminar, insertar y dividir caracteres (`rn` a `m`, `cl` a `d`, restauracion de letras perdidas) en una unica pasada del encoder.

El entrenamiento uso un shard (`sample/10BT/000_00000.parquet`) de FineWeb-Edu (ODC-By 1.0), normalizado a ASCII, con aproximadamente 490 millones de caracteres muestreados como 2 millones de ventanas de unas 100 caracteres. El dano fue sintetico: confusiones de caracteres, divisiones y fusiones tipo `rn`/`m`, deleciones, inserciones de espacios y motas (`.,'~^-|:`), cambios de mayusculas, guiones espurios, lineas envueltas y guiones de final de linea. Se dano en promedio un 4% de los caracteres (tasa log-uniforme del 1% al 15%; el 15% de las ventanas quedaron limpias). Se entrenaron 40.000 pasos con batch 128, AdamW y bf16. La perdida combina entropia cruzada sobre las dos ranuras de salida por caracter en cada paso, ponderada por la distribucion de parada (PonderNet), mas un coste por paso esperado y un termino KL hacia una prior geometrica de parada.

## Capacidades

- Correccion de errores OCR en texto en ingles: confusiones de caracteres (`rn`/`m`, `1`/`l`, `0`/`O`), caracteres eliminados y sobrantes, palabras fusionadas y divididas, espacios espurios, cambios de mayusculas y guiones de final de linea.
- Union de lineas envueltas en texto corrido: los saltos de linea simples se interpretan como lineas envueltas y se unen; las lineas en blanco separan parrafos y se conservan.
- Eliminacion, insercion y division de caracteres en una sola pasada del encoder (0 a 2 caracteres de salida por caracter de entrada).
- Computo adaptativo: los caracteres limpios paran antes que los danados, reduciendo el coste computacional.
- Ejecucion en CPU: unos 28.000 caracteres por segundo en una sola hebra.
- Entrada limitada a ASCII imprimible; cualquier otro caracter se lee como `?`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Limpieza de corpus web para preentrenamiento: el modelo puede procesar texto extraido de paginas web con ruido OCR antes de incorporarlo a un dataset de entrenamiento, ya que opera a 28.000 caracteres por segundo en una sola hebra de CPU y no requiere GPU.
- Post-procesado de pipelines de digitalizacion de documentos ingleses: tras un motor OCR, se puede aplicar esta capa de correccion para reducir la tasa de error de caracteres del 4,28% al 0,79-0,98% en condiciones de dano normal, con revision humana en textos donde la redaccion exacta sea critica.
- Normalizacion de texto antes de indexacion o busqueda: al reparar palabras fusionadas y divididas y unir lineas envueltas, mejora la calidad de los indices y de la recuperacion en motores de busqueda sobre documentos escaneados.
- Preprocesado en pipelines de NLP ligero: al ser un modelo de 0,65M de parametros y 2,6 MB, se puede embeber en herramientas de linea de comandos o servicios sin infraestructura GPU.
- Limpieza de transcripciones y salidas de OCR en entornos con recursos limitados: su ejecucion en CPU y su bajo consumo de memoria lo hacen adecuado para dispositivos sin acelerador.
- Filtrado y depuracion de texto en tareas de anotacion: puede reducir el ruido antes de que anotadores humanos revisen el texto, aunque el autor advierte que no debe usarse sin revision donde la redaccion exacta importe.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de error de caracteres, dano normal (4,3% de caracteres) | 4,28% a 0,79-0,98% |
| Tasa de error de caracteres, dano severo (16,4% de caracteres) | 16,4% a 4,4% |
| Caracteres danados corregidos | 84% |
| Velocidad | unos 28.000 caracteres/s en una hebra de CPU |

El rango 0,79-0,98% corresponde a evaluar todos los caracteres con el presupuesto completo de pasos frente al modo rapido que usa `ocr_clean.py`, en el que los caracteres terminados dejan de computar. El autor indica que, en sus experimentos, el diseno supero a un bloque con bucle plano del mismo computo por paso, igualo a un bloque 8 veces mas ancho con aproximadamente 1/12 de su computo y batio a transformers MoE estandar de 4 a 15 veces su tamano en esta tarea. No se han publicado resultados comparativos con modelos de correccion OCR de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo pesa 2,6 MB en fp32 y esta pensado para ejecutarse en CPU.
- GPU recomendadas: no aplica; cualquier CPU es suficiente.
- Cabe en GPU de consumo: si, pero no es necesario; el modelo esta disenado para CPU.
- Opciones de despliegue: script `ocr_clean.py` con `torch` y `safetensors`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: unos 28.000 caracteres por segundo en una sola hebra de CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos de correccion OCR de terceros en la informacion proporcionada. El autor solo compara, de forma cualitativa, con variantes arquitectonicas propias (bloque con bucle plano, bloque 8 veces mas ancho y transformers MoE de 4 a 15 veces su tamano), sin nombrar modelos publicos comparables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OCR cleaner v1 | 0,65M | ~110 caracteres por ventana | MIT o Apache-2.0 | Hugging Face |
| Alternativas publicas de correccion OCR | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dano sintetico: el modelo se entreno con dano OCR sintetico, no con salida real de escaneres; los motores OCR reales producen errores con otras estadisticas (maquetacion, fuentes, calidad de escaneo), por lo que cabe esperar ganancias menores en escaneos reales que las de la tabla.
- Solo ingles y ASCII imprimible; entrenado con texto web, no con impresos antiguos, tablas ni codigo.
- Puede omitir o estropear algunos errores, y el resultado depende del texto circundante: por ejemplo, "The cornmittee met on Tuesday to cliscuss the budget" aislado sale como "The committee met on Tuesday to daiscuss the budget", mientras que en un pasaje mas largo el mismo "cliscuss" se corrige a "discuss".
- A veces fusiona un espacio real (`era in` a `erain`) o deja uno espurio.
- El texto se corta en ventanas de hasta unos 110 caracteres sin solapamiento, por lo que el dano que cruza el borde de una ventana no se repara.
- Puede cambiar palabras correctas pero poco habituales por palabras comunes; no debe usarse donde la redaccion exacta importe sin revision humana.
- Riesgo de alucinacion y sesgos: no se documentan sesgos especificos en la informacion disponible, pero al ser un modelo de correccion puede alterar el contenido original.
- Licencia dual MIT o Apache-2.0, permisiva para uso comercial; el autor advierte que el modelo es experimental.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026.

## Enlaces

- Hugging Face: https://huggingface.co/Cyronius/ocr-cleaner-v1
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- No se han encontrado en la informacion disponible papers, blogs, repositorios o demos adicionales.
