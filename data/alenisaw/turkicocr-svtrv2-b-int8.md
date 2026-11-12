# alenisaw/turkicocr-svtrv2-b-int8

## Resumen

TurkicOCR-SVTRv2-B (INT8) es la variante cuantizada dinamicamente a INT8 del reconocedor de texto en linea TurkicOCR-SVTRv2-B, desarrollado por Alen Issayev y Aidana Zhalgas y presentado en el congreso AIST 2026 (Springer LNCS). El modelo resuelve el reconocimiento optico de caracteres (OCR) de lineas de texto en alfabeto cirilico para kazajo, kirguis y ruso, un nicho escasamente cubierto por los motores OCR genericos, que suelen rendir peor en estas lenguas por la presencia de grafemas cirilicos especificos (ә, ғ, қ, ң, ө, ұ, ү, һ, і) ausentes en el cirilico ruso estandar.

Arquitectura SVTRv2 (Scene Text Recognition with a single Visual model, variante v2) orientada a reconocimiento de lineas, distribuida como grafo ONNX con cuantizacion dinamica INT8. El artefacto ocupa 27,1 MB frente a los 84,4 MB del checkpoint FP32, lo que supone una reduccion de memoria de aproximadamente 3,1x, y alcanza un throughput de unas 385 lineas por segundo en CPU, unas 2,7x superior a la version sin cuantizar, con una degradacion de precision marginal (CER del 1,93 % frente al 1,76 % del FP32).

Su relevancia actual radica en que permite desplegar OCR cirilico de calidad en entornos sin GPU, como digitalizacion de archivos en instituciones de Asia Central, procesamiento en el borde o pipelines de ingesta documental de alto volumen donde el coste por pagina en CPU es el factor limitante. La licencia Apache 2.0 y la disponibilidad del codigo y los checkpoints facilitan su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVTRv2 (reconocedor de lineas de texto, modelo visual transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de lineas, no generativo) |
| Tipos de cuantizacion | INT8 dinamica (ONNX); disponible tambien FP32 en PyTorch y ONNX |
| Idiomas soportados | kazajo (kk), kirguis (ky), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.int8.onnx); FP32 disponible en PyTorch y ONNX |
| Tamano del artefacto | 27,1 MB (INT8) frente a 84,4 MB (FP32) |
| Entrada / salida | imagen de linea de texto a cadena de caracteres |
| Runtime | ONNX Runtime (CPUExecutionProvider) |
| Metricas evaluadas | CER, WER, chrF |

## Arquitectura y entrenamiento

El modelo se basa en SVTRv2, una arquitectura de reconocimiento de texto en escena que procesa la imagen de una linea completa y la decodifica en una secuencia de caracteres. A diferencia de los pipelines clasicos de deteccion mas reconocimiento por caracter, SVTRv2 opera a nivel de linea, lo que simplifica el postprocesado y reduce errores de segmentacion en escrituras con ligaduras o espaciado irregular. La variante publicada se distribuye como grafo ONNX con cuantizacion dinamica INT8, aplicada sobre pesos y activaciones sin necesidad de un conjunto de calibracion estatico.

El entrenamiento se realizo sobre el dataset `alenisaw/turkicocr-cyrillic`, compuesto por lineas de texto en cirilico de las tres lenguas objetivo. La model card no detalla el numero de tokens ni la composicion exacta del corpus, ni especifica si se aplicaron tecnicas de aumento de datos, destilacion o ajuste fino supervisado adicional. La evaluacion reportada emplea CER, WER y chrF como metricas, y la comparacion FP32 frente a INT8 muestra un CER del 1,76 % y 1,93 % respectivamente, lo que confirma que la cuantizacion dinamica preserva la precision en este dominio.

## Capacidades

- Reconocimiento de texto en linea (line-level OCR) sobre imagenes de recortes de texto en cirilico.
- Cobertura de kazajo, kirguis y ruso, incluyendo grafemas cirilicos especificos de las lenguas turquicas.
- Inferencia en CPU con ONNX Runtime mediante `CPUExecutionProvider`, sin dependencia de CUDA.
- Cuantizacion dinamica INT8 con reduccion de memoria de aproximadamente 3,1x y aceleracion de aproximadamente 2,7x en CPU.
- Salida de transcripcion como cadena de caracteres, apta para pipelines de digitalizacion.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo discriminativo de vision a texto, no un LLM generativo.
- No dispone de capacidades de vision general, audio ni comprension de documentos completos; requiere deteccion de lineas previa.

## Casos de uso

- Digitalizacion de archivos y prensa historica en kazajo y kirguis: el modelo transcribe lineas de texto escaneado en cirilico con un CER inferior al 2 %, adecuado para corpus linguisticos y proyectos de preservacion documental donde los motores OCR genericos fallan en grafemas turquicos.
- Procesamiento masivo en CPU sin GPU: con unas 385 lineas por segundo y 27,1 MB de artefacto, un servidor convencional puede procesar cientos de miles de paginas al dia sin coste de acelerador, lo que lo hace idoneo para ingesta por lotes en instituciones con infraestructura limitada.
- Despliegue en el borde o en dispositivos de bajo consumo: el tamano reducido permite integrar el reconocedor en aplicaciones moviles o sistemas embebidos para digitalizacion de formularios y documentos oficiales en oficinas de atencion al ciudadano.
- Enriquecimiento de bases de datos documentales: transcripcion de recortes de lineas extraidos por un detector previo (por ejemplo, DBNet) para indexar y buscar en archivos administrativos de Kazakhstan y Kirguistan.
- Verificacion y correccion de OCR en pipelines existentes: al ser un modelo ligero y rapido, puede actuar como segundo motor de reconocimiento para validar o corregir transcripciones de sistemas comerciales en las lenguas objetivo.
- Investigacion en OCR multilingue: la disponibilidad del dataset, el codigo y las tres variantes (FP32 PyTorch, FP32 ONNX e INT8 ONNX) permite reproducir experimentos de cuantizacion y comparar el impacto de INT8 en lenguas de bajos recursos.
- Automatizacion de extraccion de datos en facturas y recibos en ruso: reconocimiento de lineas de campos concretos tras la deteccion, con latencia baja en CPU para servicios de back office.

## Benchmarks y rendimiento

| Metrica | FP32 | INT8 | Variacion |
|---|---|---|---|
| CER | 1,76 % | 1,93 % | +0,17 puntos porcentuales |
| Tamano del modelo | 84,4 MB | 27,1 MB | reduccion de aproximadamente 3,1x |
| Throughput en CPU | referencia | aproximadamente 385 lineas/s | aceleracion de aproximadamente 2,7x |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de LLM en la informacion disponible, ya que el modelo no es generativo. No se proporcionan cifras de WER ni chrF en la model card, aunque se citan como metricas evaluadas.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU con ONNX Runtime.
- Memoria RAM: inferior a 100 MB para el artefacto INT8, mas el overhead del runtime y del buffer de imagenes.
- GPU recomendadas: no aplica; opcionalmente puede ejecutarse en GPU mediante `CUDAExecutionProvider` de ONNX Runtime, aunque la model card solo documenta `CPUExecutionProvider`.
- Cabe en cualquier GPU consumer y en CPU de portatil o servidor modesto; no necesita A100, H100 ni RTX 4090.
- Opciones de despliegue: ONNX Runtime (principal), integrable en servicios Python, C++, C# o Java mediante los bindings de ONNX Runtime; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLM generativos.
- Latencia y throughput: aproximadamente 385 lineas por segundo en CPU para la variante INT8, segun la model card; la latencia por linea depende del hardware concreto y no se detalla.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| TurkicOCR-SVTRv2-B INT8 | OCR de lineas SVTRv2 | kk, ky, ru | 27,1 MB | Apache 2.0 | Especializado en cirilico turquico, CPU-first |
| TurkicOCR-SVTRv2-B FP32 | OCR de lineas SVTRv2 | kk, ky, ru | 84,4 MB | Apache 2.0 | Misma arquitectura sin cuantizar, CER 1,76 % |
| Tesseract 5 (kazajo/kirguis) | OCR clasico LSTM | multilingue | no disponible | Apache 2.0 | Cobertura amplia pero rendimiento inferior en grafemas turquicos segun la literatura del proyecto |
| PaddleOCR (modelos cirilicos) | OCR deteccion + reconocimiento | multilingue | variable | Apache 2.0 | Pipeline completo; requiere configuracion especifica para kk/ky |

No se dispone de comparaciones numericas directas con Tesseract ni PaddleOCR en la informacion proporcionada; la comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo discriminativo de OCR, no un LLM: no genera texto libre, no razona y no admite instrucciones en lenguaje natural.
- Requiere un detector de lineas previo; no realiza deteccion de texto en pagina completa por si mismo.
- La cuantizacion INT8 introduce una degradacion de precision de 0,17 puntos de CER (1,76 % a 1,93 %), aceptable pero no nula; para aplicaciones con tolerancia cero a errores conviene evaluar la variante FP32.
- Cobertura linguistica limitada a kazajo, kirguis y ruso; no se documenta soporte para otras lenguas turquicas ni para cirilico en general.
- Riesgo de alucinacion en el sentido de sustituciones o inserciones de caracteres en imagenes de baja calidad, ruido o tipografias no vistas; no se han publicado analisis de sesgos por tipo de documento.
- No se detalla el corpus de entrenamiento ni su composicion, lo que dificulta estimar el dominio de generalizacion (prensa, formularios, manuscrito, etc.).
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar en el dominio propio antes de produccion.
- El repositorio de Hugging Face figura con 0,0 GB y 22 descargas, lo que sugiere adopcion temprana; verificar la integridad de los artefactos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alenisaw/turkicocr-svtrv2-b-int8
- Modelo base FP32 en PyTorch: https://huggingface.co/alenisaw/turkicocr-svtrv2-b
- Variante ONNX FP32: https://huggingface.co/alenisaw/turkicocr-svtrv2-b-onnx
- Dataset: https://huggingface.co/datasets/alenisaw/turkicocr-cyrillic
- Paper (Springer LNCS, AIST 2026): https://doi.org/10.1007/978-3-032-41546-2_22
- Repositorio GitHub: https://github.com/alenisaw/turkicocr-svtrv2-b
- Modelo en Kaggle: https://www.kaggle.com/models/alenissayev/turkicocr-svtrv2-b
