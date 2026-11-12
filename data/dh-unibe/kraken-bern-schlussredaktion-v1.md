# dh-unibe/kraken-bern-schlussredaktion-v1

## Resumen

`kraken-bern-schlussredaktion-v1` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el grupo de Humanidades Digitales de la Universidad de Berna (`dh-unibe`). No es un modelo de lenguaje: es un modelo de visión entrenado con el motor [kraken](https://github.com/mittagessen/kraken) para transcribir imágenes de páginas manuscritas a texto, orientado específicamente a documentos históricos. Se distribuye como pesos CoreML (`.mlmodel`) y se integra en el pipeline de segmentación y OCR de kraken.

El modelo es un *fine-tune* de `kraken-bern-hertwig-v2` sobre el corpus `dh-unibe/image-text_bern-disputation-1528`, en concreto sobre el proyecto `A_V_1447_Schlussredaktion_train` (118 páginas, 3.457 líneas transcritas). Su función es actuar como cuarto lector dentro del pipeline `ruemlang`, un conjunto de modelos especializados que cubren distintas manos y fases de corrección de un mismo fondo documental (la *Disputation* de Berna de 1528).

Es relevante por su carácter acotado y verificable: la model card documenta hiperparámetros completos, procedencia del *checkpoint*, partición de validación con semilla fija y hasta el consumo energético del entrenamiento (58 Wh). Resulta útil como ejemplo de modelo HTR de nicho, reproducible y con métricas honestas sobre su propio dominio, más que como herramienta de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional profunda (CNN) con capas Cr/Mp, bloques Lbx y capa final Cr; especificación kraken `[256,64,0,1 Cr4,2,8,4,2 Cr4,2,32,1,1 Mp4,2,4,2 Cr3,3,64,1,1 Mp1,2,1,2 S1(1x0)1,3 Lbx256 Do0.5 Lbx256 Do0.5 Lbx256 Do0.5 Cr255,1,85,1,1]` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo línea a línea; la longitud la fija la segmentación de página) |
| Tipos de cuantizacion | no disponible (pesos CoreML en formato `.mlmodel`) |
| Idiomas soportados | no disponible (entrenado sobre texto manuscrito alemán de 1528; no declarado formalmente) |
| Licencia | MIT |
| Formato de pesos | CoreML (`.mlmodel`) |

## Arquitectura y entrenamiento

Se trata de una red convolucional apilada en la tradición de los modelos kraken: extractor de características con capas convolucionales (`Cr`) y de *pooling* (`Mp`), seguido de tres bloques `Lbx256` con *dropout* de 0,5 y una capa convolucional final de 85 clases de salida (el alfabeto de caracteres). El entrenamiento se realizó con `batch_size: 16`, optimizador con *schedule* coseno, `lrate: 0.0005`, hasta 150 épocas con parada temprana (`min_epochs: 15`, `lag: 10`), aumento de datos activado, normalización Unicode NFD y normalización de espacios en blanco. Se usó `resize: union` y `seed: 42`.

El conjunto de entrenamiento procede de `dh-unibe/image-text_bern-disputation-1528`, proyecto `A_V_1447_Schlussredaktion_train`: 118 páginas y 3.457 líneas transcritas. La evaluación se hizo sobre una partición a nivel de página con semilla fija (`partition=0.9`, `seed=42`), de modo que ninguna página aporta líneas a ambos lados. El modelo parte de `kraken-bern-hertwig-v2` y corresponde al mejor *checkpoint* de validación, no a la última época. No se documenta uso de RLHF ni DPO (no aplica a un modelo HTR).

## Capacidades

- Transcripción de texto manuscrito a texto plano a partir de imágenes de páginas históricas.
- Reconocimiento de líneas individuales tras la segmentación automática de página (`segment -bl ocr`).
- Especialización en una mano y una fase concretas del corpus (corrección final, *Schlussredaktion*, del proyecto A V 1447).
- Integración como lector adicional en un pipeline multi-modelo (`ruemlang`), pensado para combinar lectores especializados.
- Funcionamiento sobre documentos del siglo XVI con normalización Unicode NFD.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión general, audio ni diálogo: es exclusivamente image-to-text.

## Casos de uso

- Digitalización de fondos manuscritos históricos: transcribir páginas del fondo de la Disputación de Berna (1528) para su publicación en edición digital, aprovechando que el modelo está ajustado a esa mano y fase concretas.
- Corpus lingüísticos diacrónicos: generar transcripciones del alemán del siglo XVI para estudios de historia de la lengua, con la ventaja de la normalización NFD que facilita el análisis computacional.
- Pipeline de lectura combinada: usar el modelo como cuarto lector dentro de `ruemlang` y contrastar sus salidas con las de otros modelos del mismo fondo para detectar discrepancias y priorizar revisión humana.
- Investigación en HTR: servir de referencia reproducible (hiperparámetros, semilla y partición documentados) para comparar estrategias de *fine-tuning* sobre un modelo base kraken.
- Prototipado de flujos de transcripción asistida: integrar kraken con este modelo para generar borradores de transcripción que después se corrigen manualmente, reduciendo el coste de tecleado.
- Docencia y formación en humanidades digitales: ejemplo completo y ligero (58 Wh de entrenamiento) para enseñar el ciclo segmentación–reconocimiento–evaluación con CER/WER.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la partición de validación del propio corpus (`A_V_1447_Schlussredaktion_train`, *seeded split*). No son comparables con benchmarks públicos.

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 16,67 % (0,166654) |
| WER (Word Error Rate) | 41,98 % (0,4198) |
| Caracteres evaluados | 13.213 |
| Errores de carácter | 2.202 |
| Muestras evaluadas | no disponible |

El autor advierte explícitamente de que la partición de validación es una partición con semilla de los proyectos de entrenamiento: mide páginas no vistas pero de manos conocidas, y cabe esperar un error mayor con un escritor nuevo.

## Requisitos de hardware

- VRAM estimada: no disponible. Es una CNN de tamaño moderado (tres bloques Lbx256); el entrenamiento se ejecutó en una única GPU (`device: cuda:0`) con *batch* de 16, lo que sugiere requisitos de memoria bajos para inferencia.
- GPU recomendadas: no disponible. Cualquier GPU con CUDA es suficiente para entrenamiento e inferencia según la configuración documentada; no se especifica el modelo de tarjeta.
- GPU de consumo: previsiblemente sí cabe en tarjetas de consumo, pero el dato no está confirmado en la información disponible.
- Despliegue: kraken (`pip install kraken`), con descarga de pesos vía `huggingface_hub`. Los pesos son CoreML; no se documenta exportación a GGUF, vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.
- Consumo energético del entrenamiento: 0,058 kWh (58 Wh); 1 g CO2e con factor de mercado y 7 g con factor de ubicación (mix suizo, 115 g/kWh), excluyendo PUE y resto del sistema.

## Comparativa con modelos similares

| Modelo | Tipo | Corpus | CER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kraken-bern-schlussredaktion-v1` | HTR (kraken, CoreML) | Bern Disputation 1528, A V 1447 | 16,67 % (validación propia) | MIT | Hugging Face |
| `kraken-bern-hertwig-v2` | HTR (kraken) | Bern Disputation 1528, mano Hertwig | no disponible | no disponible | pesos locales del autor, no publicados en el repo |
| Otros lectores del pipeline `ruemlang` | HTR (kraken) | mismo fondo documental | no disponible | no disponible | no disponible |

No se dispone de datos públicos de benchmarks ni de especificaciones de modelos comparables de terceros en la información proporcionada; la comparación con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado sobre una única mano y una fase concreta (corrección final de A V 1447); el rendimiento caerá con otros escribanos, épocas o lenguas.
- El CER del 16,67 % y el WER del 41,98 % proceden de una partición de validación interna con semilla, no de un benchmark compartido, y no son transferibles a otro corpus.
- Riesgo de error alto a nivel de palabra (WER cercano al 42 %): requiere revisión humana antes de cualquier uso editorial.
- No es un modelo de lenguaje: no genera texto libre, no responde a instrucciones y no admite *prompts*.
- Idiomas soportados no declarados formalmente; el material es alemán manuscrito del siglo XVI.
- Licencia MIT permite uso comercial, pero la calidad y la procedencia de los datos de entrenamiento deben verificarse por separado para usos sensibles.
- Pesos en formato CoreML: la portabilidad a otros entornos distintos de kraken no está documentada.
- Sin datos sobre sesgos, calibración o comportamiento fuera de distribución más allá de la advertencia del autor sobre escritores nuevos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dh-unibe/kraken-bern-schlussredaktion-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/dh-unibe/image-text_bern-disputation-1528
- Repositorio de entrenamiento: https://github.com/thodel/training-atr-models
- Motor kraken: https://github.com/mittagessen/kraken
- Fuente sobre energía renovable de la Universidad de Berna: https://klima.unibe.ch/betrieb/energie/index_ger.html
