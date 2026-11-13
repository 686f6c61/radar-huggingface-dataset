# Philiaxis/Himel-OCR-v2

## Resumen

Himel-OCR-v2 es un artefacto de investigacion publicado por el usuario Philiaxis en Hugging Face, orientado al reconocimiento optico de caracteres (OCR) de texto japones y a la transcripcion de formulas matematicas manuscritas. No se trata de un modelo de lenguaje generativo, sino de un paquete de inferencia compuesto por dos ramas independientes construidas sobre la familia PaddleOCR: una rama CTC para lineas de texto impresas y manuscritas y una rama de reconocimiento de formulas basada en PP-FormulaNet_plus-S. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

El modelo parte de arquitecturas ya existentes (SVTR_LCNet con CTC para texto y un modelo estatico Paddle para formulas) y aplica un ajuste fino supervisado sobre datos japoneses con notacion matematica. Su relevancia radica en la mejora cuantificada frente a los modelos originales: en la rama de formulas eleva la exactitud sin espacios de 1,40 % a 37,27 % en el conjunto de test oficial MathWriting, y en la rama de texto reduce el CER bruto de 10,692 % a 4,367 % frente a PP-OCRv6 small.

La publicacion incluye artefactos completos de evaluacion (predicciones congeladas, intervalos de confianza por bootstrap, auditorias ciegas y evidencias de paridad) que permiten reproducir cada cifra reportada. El autor lo describe explicitamente como un artefacto de investigacion y no como un servicio OCR de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos ramas: PP-OCRv6 medium_rec (SVTR_LCNet, CTC) para texto; PP-FormulaNet_plus-S (Paddle estatico) para formulas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje); rama de formulas limitada a 384 tokens de salida |
| Tipos de cuantizacion | no disponible (pesos de inferencia Paddle en formato nativo) |
| Idiomas soportados | japones (ja), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Paddle Inference (`inference.json`, `.pdiparams`, `.yml`); rama CTC 76 MB, rama formula 231 MB |
| Entrada | Texto: 1x3x48xW (ancho variable). Formulas: 1x3x384x384 RGB |
| Decodificador | Texto: CTC greedy o prefix-beam (beam 8 congelado). Formulas: greedy oficial, hasta 384 tokens |
| Diccionario | 18.000 entradas en la rama CTC |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La rama de texto emplea la arquitectura SVTR_LCNet de PP-OCRv6 en su variante medium_rec, un reconocedor CTC que procesa lineas de imagen de altura fija (48 px) y ancho variable, produciendo una secuencia de etiquetas sobre un diccionario de 18.000 caracteres. La rama de formulas utiliza el modelo estatico PP-FormulaNet_plus-S, que recibe una imagen RGB de 384x384 y genera una secuencia LaTeX de hasta 384 tokens decodificada con el tokenizador UniMERNet embebido en `inference.yml`.

Ambas ramas fueron ajustadas finamente desde los modelos originales de PaddlePaddle y congeladas antes de abrir las fuentes reservadas de evaluacion final, de modo que las cifras reportadas provienen de datos genuinamente no vistos. El repositorio documenta el protocolo fijo, una unica enmienda registrada, el ledger completo de candidatos de desarrollo y evidencias de paridad byte a byte sobre 2.535 imagenes. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO, que en cualquier caso no aplican a este tipo de modelos.

## Capacidades

- Reconocimiento de lineas de texto japones impresas y manuscritas con salida en una sola linea.
- Reconocimiento de formulas matematicas manuscritas con salida en LaTeX.
- Manejo de notacion matematica especifica: minus matematico U+2212, superindices y subindices Unicode (por ejemplo `x²`, `aₙ`), parentesis y digitos en ASCII, puntuacion japonesa `。` y `、`.
- Soporte de decodificacion CTC greedy y prefix-beam search (beam 8) sin modelo de lenguaje externo.
- Integracion con PaddleX y PaddleOCR mediante `create_model` y `model.predict`.
- Capacidad multilingue limitada a japones y chino, con letras latinas y digitos en ASCII dentro del texto reconocido.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo de vision para OCR, no un modelo de lenguaje.

## Casos de uso

- Digitalizacion de libros tecnicos japoneses con formulas: la rama de texto reconoce lineas de 48 px de alto y ancho variable, adecuada para escaneres a 300 dpi como los usados en el benchmark del autor.
- Transcripcion de apuntes manuscritos de matematicas: la rama de formulas convierte imagenes de 384x384 en cadenas LaTeX listas para renderizar o editar en un editor cientifico.
- Construccion de corpus academicos en japones: el modelo permite extraer texto de PDFs escaneados y conservar notacion matematica con superindices y subindices Unicode.
- Preprocesado para motores de busqueda o RAG sobre documentacion tecnica japonesa: la salida en una sola linea por region facilita la indexacion y el emparejamiento de fragmentos.
- Conversion de pizarras o cuadernos a LaTeX en flujos de docencia: la rama de formulas puede integrarse en una aplicacion que reciba una foto y devuelva la expresion para su insercion en documentos.
- Evaluacion comparativa de pipelines OCR: el repositorio incluye predicciones congeladas y artefactos de bootstrap que permiten reutilizar el conjunto de evaluacion como referencia reproducible en investigacion.
- Auditoria de calidad OCR en editoriales: los scripts y evidencias de paridad permiten verificar que una actualizacion del modelo no degrada el reconocimiento sobre un conjunto dorado de 593 recortes aceptados.

## Benchmarks y rendimiento

Rama de formulas, test oficial MathWriting con 3.000 muestras selladas:

| Metrica | PP-FormulaNet_plus-S original | Himel3 v2 |
|---|---:|---:|
| Exactitud sin espacios | 1,40 % | 37,27 % (IC 95 % de la mejora 33,83-37,90 pt) |
| Token error rate | 0,8964 | 0,1899 (-78,8 % relativo, IC 77,2-80,3) |

Rama de texto, benchmark de PDFs reservados con 593 recortes de linea aceptados y 28 clusters de pagina:

| Condicion | CER bruto | CER sin espacios NFKC |
|---|---:|---:|
| Himel3 v2 (beam 8) | 4,367 % | 2,776 % |
| Himel3 v1 (beam 16) | 5,042 % | 3,470 % |
| PP-OCRv6 small original | 10,692 % | 3,637 % |

Bootstrap pareado por cluster de pagina (10.000 remuestreos) para v2 menos v1 en CER bruto: -0,675 pt, IC 95 % [-1,359, -0,097], significativo. En NFKC: -0,694 pt, IC 95 % [-1,373, -0,147].

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano de los pesos (76 MB la rama CTC y 231 MB la rama de formulas) la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2-4 GB libres, incluyendo GTX 1650 o superiores.
- GPU recomendadas: cualquier GPU compatible con PaddlePaddle (CUDA); para lotes grandes se recomiendan RTX 3090, RTX 4090, A100 o H100, aunque el modelo no las requiere.
- Cabe en GPU consumer: si, practicamente en todas las GPU con soporte CUDA de Paddle.
- Opciones de despliegue: PaddleX y PaddleOCR mediante `create_model`; Paddle Inference con `paddle.jit.load` para la rama de formulas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Himel-OCR-v2 | OCR texto + formulas (Paddle) | no disponible | 48xW texto; 384x384 formulas | CER 4,367 % texto; 37,27 % exactitud formulas | Apache 2.0 |
| PP-OCRv6 small (original) | OCR texto (Paddle) | no disponible | 48xW | CER 10,692 % bruto | Apache 2.0 |
| PP-OCRv6 medium_rec (original) | OCR texto (Paddle) | no disponible | 48xW | no disponible en la informacion | Apache 2.0 |
| PP-FormulaNet_plus-S (original) | OCR formulas (Paddle) | no disponible | 384x384 | 1,40 % exactitud sin espacios | Apache 2.0 |

## Limitaciones y advertencias

- Artefacto de investigacion, no un servicio OCR de produccion; el autor lo declara explicitamente.
- La seleccion de la rama de formulas no supera todos los guardas historicos de regresion del proyecto: registra 571 ediciones de tokens en escaneos reales frente a las 517 del umbral, por lo que no es un reemplazo universal de la version anterior.
- Los intervalos de confianza finales se calculan sobre dos documentos fuente y no garantizan generalizacion a nuevos escritores o nuevos libros.
- Cobertura linguistica limitada a japones y chino; el texto latino se restringe a letras, digitos y parentesis en ASCII.
- Riesgo de alucinacion en el sentido de transcripciones incorrectas, especialmente en formulas manuscritas con trazos ambiguos o en recortes de baja calidad.
- La rama de texto puede omitir espacios de maquetacion y normaliza ciertos caracteres (minus U+2212, puntuacion japonesa), lo que puede requerir postprocesado para ciertos flujos.
- Los PDFs fuente reservados no se redistribuyen por falta de autorizacion; solo se incluyen los recortes dorados.
- No se documentan sesgos especificos mas alla de los derivados de los datos de entrenamiento japoneses y chinos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y el caracter experimental del artefacto desaconsejan su despliegue directo sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Philiaxis/Himel-OCR-v2
- PaddleOCR (repositorio oficial): https://github.com/PaddlePaddle/PaddleOCR
- PaddleX (repositorio oficial): https://github.com/PaddlePaddle/PaddleX
- PaddlePaddle (framework): https://github.com/PaddlePaddle/Paddle
- PP-FormulaNet (documentacion de PaddleOCR): https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/module_usage/formula_recognition.md
- UniMERNet (tokenizador y modelo de referencia para formulas): https://github.com/opendatalab/UniMERNet
- Benchmark MathWriting: https://github.com/google-research/google-research/tree/master/mathwriting
