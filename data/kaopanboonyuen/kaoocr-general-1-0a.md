# kaopanboonyuen/KaoOCR-General-1.0a

## Resumen

KAO-OCR General 1.0a es un motor de reconocimiento óptico de caracteres (OCR) para tailandés e inglés desarrollado por kaopanboonyuen. Se distribuye como un pipeline completo en ONNX Runtime que detecta líneas de texto, recorta cada línea, la reconoce con un reconocedor CTC minúsculo y reconstruye el texto en orden de lectura. Su propuesta diferencial es la ejecución íntegra en CPU, sin GPU ni pila de serving, con un checkpoint de apenas ~0,6 millones de parámetros en el reconocedor principal.

La versión 1.0a es una alfa que introduce un único cambio respecto a la versión anterior: un ajuste fino ligero del reconocedor (`rec.onnx`) sobre escritura manuscrita tailandesa. El detector (`det.onnx`), el segundo reconocedor (`rec2.onnx`), el runtime y la licencia permanecen intactos. El modelo se publica bajo licencia Apache 2.0 y soporta tailandés e inglés.

Es relevante para escenarios de digitalización documental en entornos con recursos limitados, donde no hay GPU disponible y se necesita procesar escaneos o fotografías de documentos tailandeses, incluyendo manuscritos, con un coste computacional mínimo y despliegue mediante `pip install`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline OCR: detector + reconocedor CTC (transformer/CNN no especificado) |
| Parámetros totales | ~0,6 M (solo el reconocedor principal `rec.onnx`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen `3 × 48 × W`, anchura dinámica) |
| Tipos de cuantización | no disponible (modelo ya en ONNX, CPU-first) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`det.onnx`, `rec.onnx`, `rec2.onnx`) y PyTorch (`pytorch/rec_weights.pt`) |

## Arquitectura y entrenamiento

El sistema es un pipeline modular: un detector localiza líneas de texto, cada recorte se procesa con un reconocedor CTC de ~0,6 M de parámetros y 530 clases de salida (blank + 528 glifos + espacio). La entrada del reconocedor es un tensor `3 × 48 × W` en BGR escalado a [-1, 1] con anchura dinámica, y la decodificación es CTC voraz (greedy). El runtime gestiona orientación, corrección de inclinación y orden de lectura. Existe un segundo reconocedor (`rec2.onnx`) cuyo papel no se detalla en la información disponible.

El ajuste fino de 1.0a se realizó sobre dos corpus públicos de escritura manuscrita tailandesa, con partición por hash MD5 de la frase normalizada para evitar fugas entre train y validación (2% validación, 3% test). Se aplicó replay: ~25% de cada lote son líneas impresas re-renderizadas con fuentes tailandesas (fuente, tamaño, tinta, fondo y desenfoque aleatorios). Se usó un blend en espacio de pesos (WiSE-FT) con barrido de α ∈ {0.3, 0.5, 0.7, 1.0}, seleccionando el mejor CER de manuscrito entre los α cuyo CER impreso se mantuviera dentro de `1.05 × baseline + 0.005`; el fine-tune puro calificó, por lo que se envió α = 1.00. Optimizador AdamW (β = (0.9, 0.98), weight decay 0.01), LR pico 1e-4 con 100 pasos de warm-up y decaimiento coseno hasta un suelo del 2%, lote 64 y clip de norma de gradiente 5.0. La exportación ONNX se validó contra PyTorch con una diferencia máxima absoluta de 1.2e-05 en formas dinámicas de lote y anchura.

## Capacidades

- Reconocimiento de texto impreso en tailandés e inglés.
- Reconocimiento de escritura manuscrita tailandesa (modo difícil, con CER alto).
- Detección automática de líneas de texto y reconstrucción en orden de lectura.
- Manejo de orientación y corrección de inclinación (deskew) en escaneos y fotografías.
- Salida de texto plano y salida JSON con líneas y cajas delimitadoras.
- Procesamiento por lotes de carpetas completas.
- Ejecución exclusiva en CPU mediante ONNX Runtime (`CPUExecutionProvider`).
- No soporta tool calling, agentes, visión general ni audio; es un motor OCR especializado.

## Casos de uso

- Digitalización de documentos administrativos tailandeses: el pipeline procesa escaneos de formularios y extrae el texto en orden de lectura, adecuado para archivos sin GPU y con requisitos de privacidad que impiden enviar documentos a servicios en la nube.
- Procesamiento por lotes de archivos históricos: la CLI acepta carpetas completas (`python inference.py scans/ -o out/`) y genera un `.txt` por página, lo que permite indexar corpus documentales en servidores modestos.
- Extracción de texto de fotografías de documentos: el runtime corrige orientación e inclinación, por lo que es viable con imágenes tomadas con móvil en lugar de escaneos perfectos.
- Digitalización de notas manuscritas en tailandés: aunque el CER de manuscrito es 0.8036, la versión 1.0a mejora un 12,7% relativo respecto a la anterior y puede servir como primera pasada para revisión humana.
- Integración en aplicaciones de escritorio o embebidas: al ser ONNX CPU-only y requerir solo cinco paquetes pequeños, encaja en herramientas locales sin dependencias de GPU ni servicios externos.
- Preprocesamiento para pipelines de NLP en tailandés: la salida JSON con líneas y cajas permite alimentar sistemas posteriores de traducción, búsqueda o análisis documental.
- Procesamiento paralelo en clústeres de CPU: el autor recomienda N procesos con 1 hilo cada uno frente a 1 proceso con N hilos para trabajos por lotes, lo que facilita el escalado horizontal en máquinas sin GPU.

## Benchmarks y rendimiento

ThaiOCRBench, tareas OCR. Métrica NLS = 1 − distancia de edición normalizada (0–100, mayor es mejor). 30 páginas muestreadas por tipo de tarea.

| Tipo de tarea | NLS |
|---|---:|
| OCR de página completa | 70,8 |
| Reconocimiento de texto | 53,1 |
| Extracción de contenido manuscrito | 18,4 |
| Reconocimiento de texto fino | 15,4 |
| Media de las cuatro tareas OCR | 39,4 |

Validación retenida (solo reconocedor, CTC voraz), partición disjunta por frase:

| CER (menor es mejor) | Antes | Después (enviado) | Relativo |
|---|---:|---:|---:|
| Líneas manuscritas | 0,9200 | 0,8036 | −12,7% |
| Líneas impresas (renderizadas, sintéticas) | 0,0436 | 0,0290 | −33,5% |

Advertencias del autor: los evaluadores son propios, no los scripts oficiales del benchmark, y la muestra es n = 30 por tarea; no deben compararse con leaderboards. No hay columna de baseline porque la ejecución de referencia no completó limpiamente. El CER impreso se midió sobre líneas renderizadas con la misma familia de fuentes tailandesas que el replay de entrenamiento, por lo que debe interpretarse como "el texto impreso no empeoró", no como una afirmación sobre texto impreso real.

## Requisitos de hardware

- VRAM: no aplica; el modelo es CPU-only y no requiere GPU.
- GPU recomendadas: ninguna; el runtime usa `CPUExecutionProvider` de ONNX Runtime.
- Cabe en cualquier CPU consumer; el reconocedor tiene ~0,6 M de parámetros y el repositorio ocupa 0,0 GB.
- Despliegue: ONNX Runtime en CPU, con la CLI `inference.py` o la clase `LineOCR` del runtime incluido en el repositorio. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Paralelismo: para trabajos por lotes, el autor recomienda N procesos con 1 hilo cada uno frente a 1 proceso con N hilos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la información disponible. El autor indica explícitamente que no hay columna de baseline en ThaiOCRBench y que los números no deben alinearse con leaderboards de terceros. Como referencia de categoría, existen otros motores OCR ligeros (por ejemplo, Tesseract o PaddleOCR), pero no se dispone de datos comparativos medidos en la información proporcionada para establecer una tabla rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KAO-OCR General 1.0a | ~0,6 M (reconocedor) | no disponible | Apache 2.0 | Hugging Face, ONNX CPU |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una versión alfa (1.0a); la API y los pesos pueden cambiar.
- El CER de manuscrito es 0.8036: la escritura a mano está lejos de resolverse con un modelo de ~0,6 M de parámetros; requiere revisión humana en producción.
- El CER impreso de 0.0290 se midió sobre texto renderizado sintéticamente con las mismas fuentes del entrenamiento; no garantiza rendimiento equivalente en texto impreso real.
- Los resultados de ThaiOCRBench usan evaluadores propios y una muestra de 30 páginas por tarea; no son comparables con leaderboards oficiales.
- No realiza tareas de parsing (tablas, gráficos, documentos): es un motor solo OCR y no genera Markdown.
- Idiomas limitados a tailandés e inglés; no se documenta soporte de otros idiomas.
- Posibles sesgos derivados de los dos corpus públicos de manuscritos tailandeses utilizados; no se detalla su composición demográfica.
- Riesgo de alucinación en la decodificación CTC: el reconocedor puede producir glifos plausibles en recortes de baja calidad o ruidosos.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE del repositorio.
- No se documentan límites de longitud de línea ni de resolución de imagen más allá de la anchura dinámica del tensor de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/kaopanboonyuen/KaoOCR-General-1.0a
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
