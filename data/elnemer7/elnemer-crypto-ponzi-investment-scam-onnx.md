# elnemer7/ElNeMeR-Crypto-Ponzi-Investment-Scam-ONNX

## Resumen

ElNeMeR-Crypto-Ponzi-Investment-Scam-ONNX es un clasificador binario-multiclase exportado a formato ONNX, desarrollado por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) y publicado en Hugging Face bajo licencia MIT. Forma parte de la flota de 25 modelos que el autor denomina "Sovereign & Humanitarian Forensic AI Fleet", orientada a tareas de forensia digital y seguridad financiera. El modelo se presenta como un detector de esquemas Ponzi digitales, bots falsos de trading de criptomonedas y pirámides de inversión, con cuatro clases de salida.

Tecnicamente, se trata de un modelo de clasificación sobre vectores de características de 512 dimensiones (tensor `features` de tipo `float32` con forma `[batch_size, 512]`), compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite su despliegue tanto en servidor como en navegador. El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos no estan efectivamente alojados o que el artefacto es de muy reducidas dimensiones.

La relevancia del modelo es limitada en terminos practicos: no se especifica la arquitectura interna, no hay datos de entrenamiento publicados, el numero de descargas y likes es cero, y la unica metrica reportada ("Calibration Accuracy: 100.00%") no viene acompanada de metodologia, conjunto de validacion ni reparto de datos, por lo que no debe tomarse como evidencia de rendimiento real. Se describe aqui de forma exhaustiva para que el lector pueda evaluar su idoneidad con plena consciencia de sus carencias documentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador sobre vector de 512 features; arquitectura interna no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada es un vector fijo de 512 dimensiones, no una secuencia de tokens) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card unicamente declara la interfaz de inferencia: un tensor de entrada llamado `features` de tipo `float32` con forma `[batch_size, 512]` y una salida de probabilidades sobre cuatro clases (`legitimate_finance_discussion`, `guaranteed_daily_roi_ponzi`, `fake_forex_crypto_bot`, `task_betting_pyramid`). No se indica si el clasificador es una red densa (MLP), un modelo lineal, un transformer pequeno u otra familia; tampoco se especifica el numero de capas, dimensiones ocultas ni funcion de activacion.

Tampoco hay datos sobre el corpus de entrenamiento: no se declara el numero de ejemplos, la composicion del dataset, el idioma de los textos de origen, el proceso de anotacion ni si se aplicaron tecnicas de aumento de datos, validacion cruzada o calibracion de probabilidades (a pesar de que la model card menciona "calibration accuracy"). No consta informacion sobre RLHF, DPO ni ajuste fino supervisado. La unica innovacion tecnica destacable es la exportacion a ONNX opset 14 con compatibilidad con `onnxruntime-web` (WASM), lo que habilita inferencia en el navegador sin backend.

## Capacidades

- Clasificacion de texto (o de caracteristicas derivadas de texto) en cuatro categorias relacionadas con fraude financiero: discusion financiera legitima, Ponzi de ROI diario garantizado, bot falso de forex/cripto y piramide de tareas/apuestas.
- Salida de probabilidades por clase, apta para umbralizacion configurable en pipelines de moderacion.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), sin necesidad de GPU ni de servidor.
- Inferencia en servidor mediante `onnxruntime` estandar.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se declara capacidad multilingue; los idiomas soportados no estan disponibles.

## Casos de uso

- Moderacion de comunidades cripto: el modelo puede clasificar mensajes de canales de Telegram o Discord y marcar aquellos con probabilidad alta de la clase `guaranteed_daily_roi_ponzi` para revision humana, aprovechando su formato ONNX ligero para ejecutarse junto al backend de moderacion.
- Filtro en el navegador para extensiones antiphishing: al ser compatible con `onnxruntime-web` (WASM), puede integrarse en una extension que evalue el texto de una pagina de inversion antes de que el usuario introduzca datos, sin enviar contenido a un servidor.
- Triaje en platforms de denuncia ciudadana: clasificar automaticamente reportes de victimas en las cuatro categorias para enrutarlos al equipo de forensia adecuado.
- Analisis forense de conversaciones: procesar transcripciones de chats de "gestores de inversion" y etiquetar los tramos que corresponden a `fake_forex_crypto_bot` o `task_betting_pyramid` como evidencia estructurada.
- Senalizacion en pasarelas de pago: como capa auxiliar (nunca unica) para marcar comercios o descripciones de transacciones con alta probabilidad de la clase Ponzi antes de una revision manual.
- Investigacion academica sobre fraude financiero: servir como baseline reproducible en formato ONNX para comparar con clasificadores propios, dado que la licencia MIT permite su uso y modificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una "Calibration Accuracy" del 100.00%, cifra que no viene acompanada de conjunto de evaluacion, tamano de muestra ni metodologia, por lo que no se reporta aqui como benchmark verificable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la entrada es un vector de 512 `float32`, por lo que el modelo es presumiblemente muy ligero, pero no se puede confirmar sin los pesos.
- GPU recomendadas: no se requieren; la inferencia cabe con toda probabilidad en CPU.
- Compatibilidad con GPU de consumo: si, en cualquier GPU moderna o incluso sin GPU (CPU).
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador). No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores ONNX de deteccion de fraude financiero) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, datos de entrenamiento y evaluacion: no es posible auditar el modelo ni reproducir sus resultados.
- La cifra de "Calibration Accuracy: 100.00%" no es verificable y debe tratarse con escepticismo; un 100% en un clasificador de fraude es altamente sospechoso y sugiere sobreajuste o un conjunto de evaluacion trivial.
- Riesgo de falsos positivos y falsos negativos desconocido: no se reportan matrices de confusion, precision, recall ni F1 por clase.
- Sesgos conocidos: no disponibles; al desconocerse el corpus de entrenamiento, no se puede evaluar el sesgo linguistico, geografico o cultural.
- Limitaciones de idioma: no se declara que idiomas soporta; si el entrenamiento fue en arabe o ingles, el rendimiento en castellano es incierto.
- Riesgo de alucinacion: no aplica en sentido estricto (es un clasificador, no un generador), pero si existe riesgo de clasificacion erronea con alta confianza.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el uso en produccion para decisiones financieras o legales requiere validacion independiente.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB: existe la posibilidad de que los pesos no esten realmente publicados o de que el artefacto sea incompleto. Verificar la integridad del archivo ONNX antes de cualquier uso.
- No debe utilizarse como unica senal en sistemas de decision automatizada con consecuencias legales o financieras para personas.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Crypto-Ponzi-Investment-Scam-ONNX
- Plataforma de forensia del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
