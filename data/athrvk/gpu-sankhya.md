# athrvk/gpu-sankhya

## Resumen

gpu-sankhya es un clasificador de tokens a nivel de carácter desarrollado por el usuario athrvk que extrae expresiones informales de cantidad y moneda del hindi coloquial y del inglés indio, y las convierte en valores numéricos limpios. El modelo reconoce formas como `sava lakh`, `dedh crore`, `डेढ़ लाख`, `सवा करोड़`, `2.5L`, `20k` o `2-3 lakh`, presentes de forma habitual en anuncios clasificados, chats de comercio electrónico y transcripciones de atención al cliente en India.

La arquitectura es una CNN de caracteres dilatada y con conexiones residuales, muy alejada de los transformers generativos: 5 capas convolucionales, dimensión de embedding 16, 48 canales y solo 39.579 parámetros. El vocabulario cubre 114 caracteres (unión de los paquetes `hi_latn` y `hi_deva`) y produce 120 clases de salida que combinan etiquetado BIO de spans con una clase semántica por token. La conversión del span detectado a valor numérico no la hace el modelo, sino un núcleo aritmético determinista independiente que aplica semántica de prefijos (`sava` = x1,25, `dedh` = x1,5, `paune` = restar 1/4), combinación aditiva de unidades descendentes, combinación multiplicativa de unidades ascendentes y manejo de rangos.

Su relevancia actual es doble. Por un lado, resuelve un problema de normalización de datos muy específico del mercado indio que los NER multilingües genéricos abordan mal. Por otro, su tamaño (160.960 bytes en ONNX, 58.984 bytes en JSON int8) permite ejecutarlo íntegramente en el navegador vía WebGPU o WASM con el paquete npm `gpu-sankhya`, sin enviar texto a ningún servidor. La model card describe la versión de pesos `v0.3.0` (arquitectura `v2`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de caracteres dilatada y residual (char-CNN), 5 capas convolucionales; no es un transformer ni un MoE |
| Parametros totales | 39.579 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no declara ventana máxima de entrada; opera sobre secuencias de caracteres) |
| Tipos de cuantizacion | float32 (`sankhya.weights.json`) e int8 (`sankhya.weights.int8.json`, el que usa el paquete npm y las métricas publicadas) |
| Idiomas soportados | `hi` (hindi romanizado / Hinglish, paquete `hi_latn`) y hindi en devanagari (paquete `hi_deva`), además de inglés indio en frases de cantidad |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), ONNX (`.onnx`), JSON legible de pesos float32 e int8; tablas independientes `charset.json` y `classes.json` |

Detalles de arquitectura declarados en la model card: dimensión de embedding 16, 48 canales de convolución, capas 1 (kernel 5, dilatación 1, sin residual), 2 (kernel 3, dilatación 1, residual), 3 (kernel 3, dilatación 2, residual), 4 (kernel 3, dilatación 4, residual) y 5 (kernel 3, dilatación 8, residual). Vocabulario de 114 caracteres, 120 clases de salida.

## Arquitectura y entrenamiento

El modelo es una char-CNN convolucional con dilataciones crecientes (1, 2, 4 y 8) y conexiones residuales en cuatro de las cinco capas. Esta combinación amplía el campo receptivo sin aumentar proporcionalmente el número de parámetros, algo crítico para capturar patrones de varios caracteres como `sava`, `paune` o `2-3` dentro de una frase. La cabeza de salida es doble: una secuencia de etiquetas BIO para delimitar el span y una predicción de clase semántica por token. El diseño separa deliberadamente el reconocimiento del span (modelo neuronal) del cálculo del valor (núcleo aritmético determinista), de modo que el modelo nunca predice la cifra directamente. La model card lo describe explícitamente: "the model never predicts the value directly".

El entrenamiento se realizó durante 20 épocas sobre 200.000 ejemplos sintéticos generados a partir de los paquetes gramaticales `hi_latn` y `hi_deva`, mezclados en proporción 0,55/0,45 con un 10% de ejemplos compartidos entre ambos paquetes. Se añadió aumento de ruido fuera de vocabulario ("unk noise": emoji, CJK, cirílico y otros símbolos insertados como contexto etiquetado O) para que el embedding `<unk>` recibiese señal de gradiente. Hiperparámetros: batch size 128 y learning rate 3e-3. La configuración `v2` con 48 canales se eligió mediante un barrido de configuración y semilla que maximiza la media de `value_acc` combinada en gold con pesos int8 sobre al menos 3 semillas (dispersión entre semillas de ±1-2 puntos), desempatando por precisión de validación dentro de una banda de 0,005, luego por F1 combinada int8 y finalmente por menor tasa de falsos positivos en negativos. La receta completa y los comandos de reproducción están en `python/README.md` del repositorio.

## Capacidades

- Clasificación de tokens (pipeline `token-classification`) con etiquetado BIO más clase semántica por token.
- Extracción de cantidades en cifras arábigas (`20k`, `2.5L`) y en palabras (`sava lakh`, `dedh crore`).
- Reconocimiento de prefijos multiplicativos y sustractivos del hindi: `sava` (x1,25), `dedh` (x1,5), `paune` (restar 1/4 al siguiente cardinal).
- Manejo de rangos (`2-3 lakh`), unidades compuestas (`multi_unit`), símbolos de unidad (`symbol_unit`) y expresiones con moneda.
- Soporte de script mixto (`mixed_script`), es decir, combinaciones de devanagari y caracteres latinos.
- Conversión del span detectado a valor numérico mediante núcleo aritmético determinista externo al modelo.
- Ejecución en navegador mediante WebGPU/WASM a través del paquete npm, con los pesos cuantizados incluidos.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, y no tiene modo "thinking", visión ni audio.

## Casos de uso

- Normalización de anuncios clasificados inmobiliarios: los portales indios publican precios como `2.5 Cr` o `सवा करोड़`; el modelo localiza el span y el núcleo aritmético devuelve el valor, lo que permite indexar por rango de precio y filtrar sin intervención manual.
- Enriquecimiento de CRM y ERP para el mercado indio: campos de texto libre donde los comerciales escriben "presupuesto de 20k" o "dedh lakh" se convierten a importes numéricos homogéneos antes de cargarlos en el sistema.
- Análisis de transcripciones de centros de contacto: al procesar conversaciones transcritas, el modelo extrae las cifras que menciona el cliente (salario esperado, presupuesto, deuda) para alimentar analítica posterior.
- Comercio conversacional por WhatsApp o chat: al ejecutarse en el mismo runtime JavaScript y sin llamadas de red, permite validar y normalizar el importe que el usuario escribe en el propio dispositivo, reduciendo coste de servidor y exposición de datos.
- Detección de fraude y verificación de KYC: la comparación de importes declarados en distintos documentos requiere normalizar formatos dispares como `2-3 lakh` frente a `250000`; el modelo aporta el span y el valor canónico.
- Extracción de datos para paneles de precios y estudios de mercado: agregadores que rastrean precios de vehículos, alquileres o productos pueden convertir automáticamente descripciones heterogéneas en series numéricas comparables.
- Preprocesado de datasets de PLN: normalizar corpus de hindi coloquial antes de tareas posteriores de análisis, ya que la conversión a valor no depende de un modelo generativo y por tanto es reproducible y auditable.
- Herramientas de accesibilidad o formularios: conversión en cliente de cantidades dictadas o escritas en lenguaje informal a un campo numérico estándar, sin enviar el contenido del usuario a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable dado que no es un modelo generativo. La model card sí publica una evaluación sobre dos conjuntos gold escritos a mano (`gold_hi_latn.jsonl` y `gold_hi_deva.jsonl`), medida con los pesos int8, que son los que distribuye el paquete npm:

| Conjunto gold | Ejemplos | Spans | value_acc | Precision | Recall | F1 |
|---|---:|---:|---:|---:|---:|---:|
| gold.jsonl | 184 | 165 | 0,9515 | 0,8971 | 0,9515 | 0,9235 |
| gold_deva.jsonl | 169 | 144 | 0,9861 | 0,9662 | 0,9931 | 0,9795 |
| **Combinado** | **353** | **309** | **0,9676** | **0,9288** | **0,9709** | **0,9494** |

Ejemplos negativos (sin span gold): 55; falsos positivos: 4 (7,27%).

Precisión por categoría (combinado):

| Categoria | Spans | value_acc |
|---|---:|---:|
| digits | 88 | 0,9773 |
| words | 221 | 0,9638 |
| prefix | 77 | 0,9481 |
| range | 24 | 0,9167 |
| currency | 47 | 0,9787 |
| multi_unit | 17 | 1,0000 |
| symbol_unit | 31 | 1,0000 |
| mixed_script | 2 | 1,0000 |
| long | 8 | 0,7500 |

La model card incluye además métricas por archivo y combinadas para torch, JSON float32 y JSON int8 en los ficheros `gold_metrics_torch.json`, `gold_metrics_json_float32.json` y `gold_metrics_json_int8.json`, y datos de procedencia del barrido de entrenamiento en `kaggle_metrics.json` y `matrix.md`.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB. Los pesos float32 ocupan unos 398 KB en JSON y 168 KB en el checkpoint `.pt`; los pesos int8, unos 59 KB. El grafo ONNX pesa 160.960 bytes.
- GPU recomendadas: cualquiera; el modelo es viable en CPU sin aceleración. No requiere A100, H100 ni RTX 4090. En GPU consumer funciona en cualquier modelo de los últimos años y también en GPUs integradas.
- Cabe en cualquier GPU consumer: sí, con margen de varios órdenes de magnitud. También cabe en dispositivos móviles y se ejecuta en el navegador vía WebGPU o WASM.
- Opciones de despliegue: paquete npm `gpu-sankhya` (runtime JavaScript, recomendado por el autor, con el modelo cuantizado incluido en línea), ONNX Runtime para interoperabilidad, PyTorch para el checkpoint `.pt`, y una implementación de referencia en numpy (`np_infer.forward`, `decode`, `core`, `charset`) para Python. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. La model card no publica cifras de latencia ni de rendimiento por segundo.
- El repositorio de HuggingFace ocupa 0,0 GB, coherente con el tamaño descrito.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye alternativas comparables de la misma categoría, y la combinación de tarea (normalización de cantidades informales indias), arquitectura (char-CNN de 39.579 parámetros) y modelo de ejecución (JavaScript y navegador) es lo bastante específica como para no disponer de una comparación fiable con otros modelos publicados. Cualquier comparación con NER multilingües genéricos o con LLM generativos no sería homogénea, ya que ni el tamaño ni el enfoque de resolución del problema son equivalentes.

## Limitaciones y advertencias

- Riesgo de falsos positivos medido en 4 sobre 55 ejemplos negativos (7,27%) con los pesos int8. Es la tasa que el propio autor usa como criterio de desempate en la selección de configuración.
- La categoría `long` es la más débil con diferencia: `value_acc` de 0,75 sobre 8 spans. Las expresiones de cantidad largas o poco frecuentes son el punto frágil del sistema.
- `range` (0,9167 sobre 24 spans) y `prefix` (0,9481 sobre 77 spans) quedan por debajo de la media combinada de 0,9676.
- El rendimiento está medido sobre conjuntos gold escritos a mano de 353 ejemplos en total; el tamaño muestral es reducido y las cifras deben tomarse como indicativas, no como garantía de generalización a dominios distintos.
- Cobertura lingüística limitada a hindi romanizado (Hinglish), hindi en devanagari e inglés indio en frases de cantidad. No cubre otras lenguas de la India ni variantes regionales.
- El vocabulario es de 114 caracteres. Los caracteres fuera de vocabulario caen en el embedding `<unk>`, que recibió señal de gradiente durante el entrenamiento, pero el comportamiento ante entradas muy alejadas de la distribución de entrenamiento no está cuantificado en la información disponible.
- Todo el entrenamiento se hizo con datos sintéticos generados por paquetes gramaticales; los conjuntos gold son la única validación sobre datos escritos por humanos.
- La sección de limitaciones de la model card aparece truncada en la información proporcionada (corta en "JavaScript string indic"), por lo que podrían existir advertencias adicionales del autor, presumiblemente relacionadas con el tratamiento de cadenas de texto en JavaScript, que no se han podido recoger aquí.
- La licencia es MIT, lo que permite uso comercial y modificación sin restricciones relevantes, siempre que se conserve el aviso de copyright y la licencia.
- Para producción conviene tener en cuenta que el valor numérico final lo produce el núcleo aritmético determinista y no el modelo: los errores pueden originarse tanto en la delimitación del span como en el evaluador aritmético, y ambos componentes deben validarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/athrvk/gpu-sankhya
- Paquete npm (runtime, incluye el modelo cuantizado): https://www.npmjs.com/package/gpu-sankhya
- Código fuente y código de entrenamiento: https://github.com/athrvk/gpu-sankhya
- Demo en vivo: https://huggingface.co/spaces/athrvk/gpu-sankhya-demo
- Conjuntos gold de evaluación: https://huggingface.co/datasets/athrvk/gpu-sankhya-gold
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los resultados obtenidos corresponden a páginas de videojuegos sin relación con el contenido de esta ficha.
