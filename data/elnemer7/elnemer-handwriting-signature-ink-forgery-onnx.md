# elnemer7/ElNeMeR-Handwriting-Signature-Ink-Forgery-ONNX

## Resumen

ElNeMeR Handwriting Signature Ink Forgery ONNX es un modelo de clasificación binaria-multiclase orientado a la verificación forense de firmas y a la detección de manipulaciones con tinta en documentos cuestionados (cheques, contratos, cláusulas añadidas a posteriori). Lo desarrolla Eng. Mahmoud ElNemer dentro de su flota de 50 modelos forenses y humanitarios, y se distribuye como un grafo ONNX de opset 14 compatible con `onnxruntime` y `onnxruntime-web` (WASM). El modelo no procesa imágenes directamente: recibe un vector de 20 características (`ink_sig_features`, `float32`, shape `[batch_size, 20]`) que codifican crominancia espectral de tintas de bolígrafo/gel y el perfil de presión del trazo, y devuelve una distribución de probabilidad sobre tres clases.

Las clases de salida son `single_pen_live_wet_ink` (tinta única aplicada en el momento de la firma), `secondary_pen_added_digits_or_clause` (dígitos o cláusulas añadidos con un segundo bolígrafo) y `laser_printed_or_traced_signature` (firma impresa por láser o calcada). El interés práctico reside en que empaqueta lógica de peritaje documental en un artefacto ONNX ligero que puede ejecutarse tanto en servidor como en navegador, lo que facilita su integración en herramientas de análisis de documentos sin infraestructura GPU.

La información publicada es muy escasa: el repositorio pesa 0.0 GB, no declara pipeline, no especifica idiomas y no incluye detalles sobre el dataset de entrenamiento ni sobre el procedimiento de calibración más allá de una cifra declarada de precisión del 100,00 %. Cualquier evaluación independiente debe partir de esa limitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador sobre vector de 20 características; grafo ONNX opset 14) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 20 características, sin secuencia de texto) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la tarea no es lingüística) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |
| Entrada | `ink_sig_features`, `float32`, `[batch_size, 20]` |
| Salida | `probabilities` sobre 3 clases |
| Runtime | `onnxruntime`, `onnxruntime-web` (WASM) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del grafo (número de capas, tipo de capas, dimensión de las capas ocultas ni función de activación). Lo único verificable es la interfaz: un tensor de entrada `float32` de 20 dimensiones por muestra y una salida de probabilidades sobre tres clases, exportado a ONNX opset 14 para garantizar compatibilidad con `onnxruntime` y con la variante WebAssembly `onnxruntime-web`. El modelo no consume píxeles ni texto, sino un vector de características precalculado; el pipeline de extracción de esas 20 características (crominancia espectral de tintas, perfil de presión del trazo) no se documenta en el repositorio.

No se publican datos sobre el corpus de entrenamiento: ni número de muestras, ni procedencia de los documentos, ni composición por clase, ni si hubo aumento de datos, validación cruzada o ajuste fino. Tampoco se detalla ningún proceso de RLHF, DPO ni calibración probabilística más allá de la afirmación de una "calibration accuracy" del 100,00 %, cifra que en la práctica sugiere una evaluación sobre un conjunto muy pequeño o no independiente y que debe tratarse con cautela.

## Capacidades

- Clasificación de documentos firmados en tres categorías: tinta única aplicada en vivo, añadido con segundo bolígrafo (dígitos o cláusulas) y firma impresa por láser o calcada.
- Separación de canales de crominancia espectral de tintas de bolígrafo y gel, según la descripción del autor.
- Análisis del perfil de presión y del estrechamiento del trazo (*stroke pressure taper*) para detectar discontinuidades compatibles con añadidos posteriores a la firma.
- Inferencia por lotes (`batch_size` configurable) sobre vectores de 20 características.
- Ejecución en servidor con `onnxruntime` y en navegador con `onnxruntime-web` (WASM), sin dependencia de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión directa ni audio. Es un clasificador tabular puro.

## Casos de uso

- **Peritaje de cheques en entidades financieras**: el modelo clasifica el vector de características extraído de la firma y del cuerpo del cheque para señalar posibles alteraciones del importe con un segundo bolígrafo, lo que permite priorizar la revisión manual antes de la liquidación.
- **Detección de cláusulas añadidas en contratos**: en un flujo de digitalización, se extraen las 20 características de cada zona de firma y rúbrica; las muestras clasificadas como `secondary_pen_added_digits_or_clause` se derivan a un perito para inspección visual y análisis de tinta.
- **Verificación de firmas en notarías y registros**: integrado en una herramienta de escritorio o web (vía WASM) que asiste al fedatario en la comprobación de que la firma presentada no es una impresión láser o un calco.
- **Triaje automatizado en departamentos de documentos cuestionados**: el modelo actúa como primer filtro sobre lotes grandes de documentos escaneados, reduciendo el volumen que llega al examen pericial completo con técnicas de laboratorio (espectroscopía, cromatografía).
- **Validación de documentos en procesos de onboarding y KYC**: para contratos firmados en papel y digitalizados, detecta firmas impresas o trazadas que podrían indicar suplantación antes de aceptar el documento como válido.
- **Herramienta de análisis en navegador para investigadores**: al ser compatible con `onnxruntime-web`, permite desplegar el clasificador en una interfaz web que procese las características localmente en el cliente, sin enviar datos del documento a un servidor externo, lo que ayuda a cumplir requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica declarada por el autor es una "calibration accuracy" de 100,00 %, sin especificación del conjunto de evaluación, tamaño de muestra ni protocolo de validación; no se ha contrastado de forma independiente y no se presenta como resultado de benchmark comparable con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el repositorio ocupa 0.0 GB y la entrada es un vector de 20 `float32`, por lo que el modelo es presumiblemente de tamaño muy reducido y ejecutable en CPU.
- **GPU recomendadas**: no se especifican; por la naturaleza del artefacto (ONNX opset 14, entrada tabular de 20 dimensiones) no requiere GPU.
- **Consumer GPU**: no aplica; cabe en CPU y en navegador mediante WASM.
- **Opciones de despliegue**: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- **Latencia y throughput**: no disponibles. Por el tamaño de la entrada y del grafo, se espera una latencia muy baja en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La categoría (clasificación forense de tintas y firmas a partir de vectores de características) no cuenta con referencias públicas incluidas en el repositorio, y no se han identificado alternativas con la misma interfaz y licencia en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ElNeMeR Handwriting Signature Ink Forgery ONNX | no disponible | no aplica | MIT | Hugging Face (0 descargas, 0 likes) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Documentación insuficiente**: no se publican arquitectura interna, dataset de entrenamiento, número de parámetros ni protocolo de evaluación; la reproducibilidad es muy limitada.
- **Métrica no verificable**: la precisión de calibración del 100,00 % no está respaldada por un conjunto de validación descrito y debe considerarse no fiable hasta que exista una evaluación independiente.
- **Dependencia del extractor de características**: el modelo solo clasifica el vector de 20 características; si el pipeline que genera `ink_sig_features` no está bien especificado o calibrado, las predicciones carecen de sentido. El repositorio no documenta ese extractor.
- **Riesgo de alucinación en sentido amplio**: como clasificador, puede producir falsos positivos y falsos negativos; en contextos forenses, una clasificación errónea puede tener consecuencias legales, por lo que no debe usarse como única prueba.
- **Sesgos desconocidos**: no se documenta la composición del corpus (tipos de papel, tintas, instrumentos de escritura, regiones geográficas), por lo que se desconoce su comportamiento fuera de la distribución de entrenamiento.
- **Licencia MIT**: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar si el uso forense en jurisdicciones concretas exige certificación adicional del software.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- **Idiomas**: no aplica, pero tampoco se documenta el idioma de los documentos de entrenamiento, lo que puede afectar a la generalización entre sistemas de escritura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Handwriting-Signature-Ink-Forgery-ONNX
- Plataforma forense humanitaria del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
