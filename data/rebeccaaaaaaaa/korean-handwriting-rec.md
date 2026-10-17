# Rebeccaaaaaaaa/korean-handwriting-rec

## Resumen
korean-handwriting-rec es un modelo de reconocimiento de texto coreano especializado en escritura manual y documentos oficiales impresos. Lo publica Rebeccaaaaaaaa y parte de PaddlePaddle/korean_PP-OCRv5_mobile_rec, la variante mobile de PP-OCRv5 de PaddleOCR. Resuelve un problema concreto: los OCR convencionales están entrenados sobre todo con texto impreso y fallan con caligrafía irregular en escaneos y fotos de móvil.

El ajuste utiliza 4,6 millones de palabras de datos AI Hub de manuscritos y documentos oficiales. El autor reporta una precisión de palabra del 97,4% en manuscrito frente al 67,2% del modelo base, 99,1% con escritores no vistos y 99,2% en texto impreso de formularios gubernamentales no vistos. El modelo pesa unos 15 MB, se distribuye en ONNX y está pensado para ejecutarse en CPU.

Es relevante porque sustituye el modelo de reconocimiento de un pipeline PP-OCRv5/RapidOCR sin cambiar la interfaz ni el diccionario de 11.945 caracteres, y porque no es generativo: lee los caracteres presentes en la imagen en lugar de inventar valores. Esto lo hace útil para digitalización de formularios, importes, fechas y archivos administrativos en entornos con poca infraestructura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Autor | Rebeccaaaaaaaa |
| Arquitectura | Reconocimiento de texto PP-OCRv5, variante mobile; convertido de PaddleOCR a PyTorch y distribuido en ONNX |
| Parámetros totales | no disponible (no se publica el recuento; el archivo ONNX ocupa aproximadamente 15 MB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (OCR de imagen a texto; no utiliza ventana de contexto) |
| Tipos de cuantización | no disponible; se distribuye un único archivo ONNX sin variantes cuantizadas documentadas |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model/rec_korean_hw.onnx`) y diccionario de caracteres en texto plano (`model/ppocrv5_korean_dict.txt`) |
| Modelo base | PaddlePaddle/korean_PP-OCRv5_mobile_rec |
| Pipeline | image-to-text |
| Tamaño del modelo | aproximadamente 15 MB según la model card |

## Arquitectura y entrenamiento
El modelo es la variante mobile del reconocimiento PP-OCRv5, no un modelo generativo. La model card no detalla el backbone interno ni el mecanismo de atención; sí indica que el modelo preentrenado de PaddleOCR se convirtió a PyTorch con PaddleOCR2Pytorch y se ajustó en una GPU de Mac con MPS. Se conservó el diccionario de 11.945 caracteres del modelo original para mantener la compatibilidad de entrada y salida.

La model card resume el ajuste con 4,6 millones de palabras. El entrenamiento tuvo dos fases: en la primera se entrenó 1 epoch con 3,86 millones de palabras manuscritas del conjunto AI Hub, y el 20% de las muestras se renderizaron como impresas para no degradar el texto impreso. En la segunda se mezclaron 420.000 palabras impresas de formularios gubernamentales, 300.000 de cursiva y 1,2 millones de palabras manuscritas de la primera fase; la precisión en formularios impresos no vistos pasó del 83,2% al 99,2% y la de manuscrito se mantuvo. No se aplican RLHF ni DPO al ser un modelo discriminativo de OCR. Los datos de AI Hub no se redistribuyen por su política de uso.

## Capacidades
- Reconocimiento de texto manuscrito coreano en escaneos, fotos de móvil y documentos con calidad desigual.
- Reconocimiento de texto impreso en formularios oficiales, incluidos números, fechas, importes y valores cumplimentados.
- Buen rendimiento con escritores no vistos: 99,1% de precisión de palabra en 6.000 palabras de 15 escritores no utilizados en entrenamiento.
- Mejora específica en cursiva: CER del 7,8% frente al 30,0% del modelo base en 1.300 frases.
- Sustitución directa del modelo de reconocimiento en pipelines PP-OCRv5/RapidOCR: misma interfaz y mismo diccionario de 11.945 caracteres.
- Ejecución en CPU con un archivo ONNX de aproximadamente 15 MB, sin GPU ni API externa.
- Modelo no generativo: no inventa valores ausentes y lee solo los caracteres presentes en la imagen.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Solo admite coreano; no es multilingüe.
- No ofrece visión general, audio ni modo de razonamiento.

## Casos de uso
- Digitalización de formularios manuscritos en manufactura, transporte y atención ciudadana: el modelo lee campos escritos a mano en escaneos o fotos de móvil y permite extraer nombres, fechas, importes y referencias con una precisión de palabra del 97,4%.
- Lectura de importes, fechas y números en documentos oficiales: los formularios impresos no vistos alcanzan un 99,2% de precisión de palabra y los valores cumplimentados un 99,3%, lo que reduce la revisión manual en recibos, tasas y expedientes.
- Migración de archivos físicos a bases de datos: al ejecutarse en CPU con un ONNX de 15 MB, puede procesar lotes en servidores locales sin GPU ni servicios externos.
- Integración en pipelines existentes de PaddleOCR o RapidOCR: basta con cambiar la ruta del modelo de reconocimiento y del diccionario, manteniendo el resto del flujo de detección y extracción.
- Procesamiento de notas y solicitudes con caligrafía cursiva: el CER del 7,8% en frases cursivas lo hace adecuado para digitalizar textos continuos escritos a mano.
- Digitalización de documentos con escritores no vistos: el 99,1% de precisión en escritores no entrenados permite desplegarlo en organismos que reciben formularios de personas distintas cada día.
- Despliegue en sedes o entornos sin conexión: el modelo no requiere API externa ni GPU, por lo que puede instalarse en un servidor interno o en un ordenador de oficina.
- Indexación y búsqueda documental: el texto reconocido puede alimentar un índice de búsqueda para archivos administrativos, partes de trabajo y registros en papel.

## Benchmarks y rendimiento
La precisión de palabra exige que la palabra completa sea correcta. Los resultados comparan el modelo base PP-OCRv5 coreano con este ajuste.

| Conjunto de evaluación | Métrica | Modelo base (AS-IS) | Este modelo (TO-BE) |
|---|---|---:|---:|
| Manuscrito, 20.000 palabras | Precisión de palabra | 67,2% | 97,4% |
| Manuscrito en papel, formularios | Precisión de palabra | 66,8% | 98,1% |
| Manuscrito en papel, texto libre | Precisión de palabra | 73,9% | 96,9% |
| Manuscrito en tableta, formularios | Precisión de palabra | 55,8% | 97,1% |
| Manuscrito en tableta, texto libre | Precisión de palabra | 55,0% | 93,8% |
| Palabras no vistas en entrenamiento | Precisión de palabra | 66,7% | 96,3% |
| Palabras que falló el modelo base (6.550) | Precisión de palabra | 0% | 92,9% |
| Escritores no vistos (6.000 palabras) | Precisión de palabra | 56,7% | 99,1% |
| Formularios gubernamentales impresos no vistos (5 tipos, 6.000 palabras) | Precisión de palabra | 88,7% | 99,2% |
| Palabras con números | Precisión de palabra | 95,7% | 99,3% |
| Nombres de campo preimpresos | Precisión de palabra | 92,9% | 97,8% |
| Valores cumplimentados | Precisión de palabra | 88,4% | 99,3% |
| Frases en cursiva (1.300) | CER (menor es mejor) | 30,0% | 7,8% |

Ejemplos de lectura comparada:

| Tipo | Texto correcto | Modelo base (AS-IS) | Este modelo (TO-BE) |
|---|---|---|---|
| Manuscrito | 체납처분유예 | 제납처분예 | 체납처분유예 |
| Manuscrito | 등록면허세 | 등록면해세 | 등록면허세 |
| Importe manuscrito | 3235원 | 2 | 3235원 |
| Escritor no visto | 이력서 | 이 령서 | 이력서 |
| Escritor no visto | 환율 | 화을 | 환율 |
| Importe impreso | 59,470,000 | 59.470.000 | 59,470,000 |
| Fecha impresa | 2017.10.28 | 201710.28 | 2017.10.28 |

## Requisitos de hardware
- VRAM estimada: no disponible; el autor indica que CPU es suficiente y que no hace falta GPU ni API externa.
- GPU recomendadas: no disponible; no se especifica ninguna GPU concreta.
- ¿Cabe en GPU consumer? No se plantea; el modelo está orientado a CPU. No hay datos de rendimiento en GPU consumer.
- RAM estimada: no disponible; el archivo ONNX ocupa aproximadamente 15 MB, pero no se publica el consumo de memoria en ejecución.
- Opciones de despliegue: RapidOCR 3.x con ONNX es la opción documentada. Al ser un modelo de reconocimiento PP-OCRv5, puede integrarse en herramientas basadas en PP-OCRv5. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo OCR.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión manuscrito coreano | Precisión impreso en formularios | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | no disponible (ONNX de ~15 MB) | no aplica | 97,4% | 99,2% | Apache-2.0 | HuggingFace: Rebeccaaaaaaaa/korean-handwriting-rec |
| PaddlePaddle/korean_PP-OCRv5_mobile_rec (base) | no disponible | no aplica | 67,2% | 88,7% | Apache-2.0 (PaddleOCR) | HuggingFace y PaddleOCR |
| Otras alternativas de OCR coreano | no disponible | no aplica | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado resultados de otros modelos de OCR coreano, por lo que la comparación se limita al modelo base y a la familia PP-OCRv5.

## Limitaciones y advertencias
- Solo reconoce coreano; no es un modelo multilingüe.
- No es generativo: no soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general ni audio.
- El archivo distribuido es el modelo de reconocimiento; la detección de líneas o regiones de texto corresponde al pipeline PP-OCR/RapidOCR.
- El autor advierte de que los símbolos y caracteres especiales manuscritos pueden reconocerse incorrectamente.
- No se proporcionan evaluaciones fuera de los conjuntos AI Hub descritos; el rendimiento en otros dominios, caligrafías o calidades de imagen no está documentado.
- No se documentan sesgos específicos; los errores pueden variar según el estilo de escritura, la calidad de la imagen y el tipo de formulario.
- La licencia del modelo es Apache-2.0, pero los datos de entrenamiento de AI Hub no se redistribuyen y su acceso está limitado a personas nacionales/coreanas según la model card. Conviene revisar las condiciones de AI Hub para usos derivados.
- No se publican latencias, throughput, VRAM ni RAM necesaria.
- La precisión de palabra exige que la palabra completa sea correcta; no es directamente comparable con métricas por carácter.

## Enlaces
- [HuggingFace: Rebeccaaaaaaaa/korean-handwriting-rec](https://huggingface.co/Rebeccaaaaaaaa/korean-handwriting-rec)
- [Modelo base: PaddlePaddle/korean_PP-OCRv5_mobile_rec](https://huggingface.co/PaddlePaddle/korean_PP-OCRv5_mobile_rec)
- [Repositorio de entrenamiento en GitHub](https://github.com/VerifiedId
