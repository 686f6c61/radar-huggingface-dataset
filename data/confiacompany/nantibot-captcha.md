# confiacompany/nantibot-captcha

## Resumen

nantibot-captcha es un modelo de reconocimiento optico de caracteres (OCR) especializado en captchas de imagen de cinco digitos, desarrollado por confiacompany y publicado en HuggingFace bajo licencia MIT. No es un modelo de lenguaje: se trata de una red convolucional recurrente (CRNN) con una capa BiLSTM y decodificacion CTC, disenada exclusivamente para leer captchas en escala de grises con digitos ondulados y solapados. El checkpoint es muy pequeno, con 189.803 parametros entrenables y un fichero `captcha_model.pth` de aproximadamente 752 KB.

El problema que resuelve es acotado y concreto: convertir una imagen de captcha de 5 digitos en la cadena de texto correspondiente, tarea habitual en procesos de automatizacion, pruebas de integracion y pipelines de scraping donde hay que superar verificaciones visuales. Su relevancia es limitada frente a modelos generativos grandes, pero resulta util como componente ligero y autoalojado dentro de un flujo mayor, ya que puede ejecutarse en CPU sin dependencias pesadas.

La entrada es una imagen en escala de grises redimensionada a 32x128 y normalizada al rango [-1, 1] con media 0,5 y desviacion tipica 0,5. El modelo fue entrenado con un conjunto muy reducido de 715 imagenes etiquetadas manualmente, divididas en 607 de entrenamiento y 108 de validacion con semilla 42, y alcanza un 84,3 % de acierto exacto de secuencia en validacion. La model card esta disponible en ingles y portugues, idiomas que figuran tambien en los tags del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN: CNN 1→16→32→64 + BiLSTM (hidden=64, 1 capa, bidireccional) + capa lineal a 11 clases (blank CTC = 0) |
| Parametros totales | 189.803 parametros entrenables |
| Longitud de contexto | no aplica (modelo OCR; entrada de imagen de 1x32x128 y salida de 5 digitos) |
| Tipos de cuantizacion | no disponible (solo se distribuye el state_dict de PyTorch en precision nativa; no se publican versiones cuantizadas) |
| Idiomas soportados | tags en y pt (idiomas de la documentacion); el modelo solo reconoce los digitos 0-9 |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` plano en `captcha_model.pth` (~752 KB); no se publican safetensors ni GGUF |
| Entrada | Imagen en escala de grises, redimensionada a 32x128, normalizada a [-1, 1] (mean=0,5, std=0,5) |
| Salida | Secuencia de 5 digitos, decodificacion CTC voraz (greedy) |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Libreria | pytorch |
| Pipeline declarado | image-classification |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura es una CRNN clasica: un extractor convolucional que pasa de 1 a 16, 32 y 64 canales, seguido de una BiLSTM de una sola capa y 64 unidades ocultas, y una proyeccion lineal a 11 clases donde la clase 0 queda reservada para el token blank de CTC. Las etiquetas de los digitos se desplazan en +1 para dejar libre el indice 0. La decodificacion en inferencia es CTC voraz, sin modelo de lenguaje ni beam search, lo que explica algunos de los modos de fallo documentados.

El entrenamiento uso 715 imagenes de captcha de 5 digitos etiquetadas manualmente (de 721 anotaciones, 6 descartadas por ilegibles). Las imagenes originales son de 128x128 en RGBA y se convierten a escala de grises y se redimensionan en tiempo de carga. La division con semilla 42 dejo 607 ejemplos de entrenamiento y 108 de validacion (`test_size=0.15`). Se optimizo con `CTCLoss` y Adam (`lr=1e-3`, `weight-decay=1e-4`), tamano de lote 32, aumento afino suave (traslacion de mas o menos 3 % y escalado entre 0,97 y 1,03) y parada temprana sobre la exactitud de secuencia en validacion con paciencia 30. No se menciona RLHF, DPO ni ninguna innovacion tipo decodificacion especulativa o atencion lineal; el script de entrenamiento no se distribuye, solo el codigo de inferencia (`model.py` y `predict_captcha.py`).

## Capacidades

- Reconocimiento de captchas de 5 digitos en imagenes en escala de grises con digitos ondulados y solapados.
- Salida de una cadena de exactamente 5 caracteres numericos mediante decodificacion CTC voraz, con comparacion por coincidencia exacta de cadena.
- Inferencia autoalojada y ligera (189.803 parametros, checkpoint de ~752 KB), viable en CPU.
- Interfaz de linea de comandos y clase `CaptchaPredictor` en `predict_captcha.py` para integracion en scripts de Python.
- Preprocesado integrado en `model.py`: transformaciones de imagen y decodificacion incluidas en el codigo de inferencia.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, generacion de texto libre, codigo, matematicas, vision general, audio ni modo de razonamiento explicito.
- No es multilingue en sentido linguistico: unicamente opera sobre el alfabeto de digitos 0-9.

## Casos de uso

- Automatizacion de pruebas end-to-end: el modelo puede resolver el captcha de un formulario de login durante una suite de tests de regresion, evitando bloqueos manuales en entornos de preproduccion controlados.
- Pruebas de robustez de sistemas propios: un equipo que desarrolla su propio captcha puede emplear este modelo como adversario para medir la tasa de exito de un atacante automatico y ajustar la dificultad de generacion.
- Extraccion por lotes de captchas ya archivados: dado un directorio de imagenes de 128x128 en RGBA, el CLI permite transcribirlas a texto y generar un dataset etiquetado de forma semiautomatica para revision posterior.
- Etiquetado asistido: usar las predicciones como propuesta inicial que un humano revisa, reduciendo el coste de anotar grandes volumenes de captchas con formato de 5 digitos.
- Componente dentro de un pipeline de recoleccion de datos publicos: cuando un sitio autoriza la automatizacion pero mantiene un captcha como control de ritmo, el modelo puede integrarse como paso intermedio en un script mayor.
- Demostracion docente de OCR con CTC: por su tamano minimo y su codigo de inferencia compacto, es adecuado para explicar en clase como funciona una CRNN con `CTCLoss` y decodificacion voraz, incluidos sus modos de fallo.
- Prueba de concepto en dispositivos con recursos muy limitados: al requerir una VRAM insignificante, puede desplegarse en contenedores pequenos o en el propio portatil del desarrollador sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar de la industria (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo OCR de este tipo. Las unicas metricas publicadas son las de validacion y las auditorias manuales que se recogen a continuacion.

| Metrica | Conjunto | Resultado |
|---|---|---|
| Exactitud de secuencia (coincidencia exacta) | Validacion, 108 imagenes (split semilla 42), mejor checkpoint | 84,3 % (91/108) |
| Exactitud de secuencia en entrenamiento al detenerse | Train, 607 imagenes | ~98-99 % (sobreajuste esperado en 607 muestras) |
| Muestra cualitativa de validacion (primeras 12) | Validacion | 11/12 aciertos exactos |
| Auditoria manual (primeras 12 de 157) | Pool sin etiquetar, nunca usado en entrenamiento | 8/12 aciertos exactos |

No existe conjunto de prueba adicional mas alla de la particion de validacion, tal como declara el autor. Los fallos observados en el pool sin etiquetar corresponden a modos tipicos del CTC voraz: confusion de un solo digito (74069 → 74059), colapso de repeticiones (40011 → 4001), perdida de digitos en los bordes (31090 → 3109) y segmentacion deficiente (50198 → 5701195).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB; con 189.803 parametros y un checkpoint de ~752 KB, el modelo y las activaciones de una imagen de 1x32x128 ocupan unos pocos megabytes.
- GPU recomendadas: cualquiera con soporte CUDA, incluidas GTX 1050, RTX 3050, RTX 4090, A100 o H100; la GPU no aporta ninguna ventaja practica relevante frente a la CPU para este tamano.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en graficos integrados.
- Ejecucion en CPU: si, es el escenario natural; el coste por imagen es minimo, aunque no se publican cifras de latencia.
- Opciones de despliegue: PyTorch nativo mediante `model.py` y `predict_captcha.py`, con instalacion previa de `requirements.txt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo OCR de este tamano). No se publica exportacion a ONNX, TensorRT ni TorchScript.
- Latencia y throughput estimados: no disponible (la model card no incluye mediciones de tiempo ni de imagenes por segundo).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de resolucion de captchas ni con alternativas OCR genericas, y no se han publicado cifras que permitan contrastar este modelo con sistemas como Tesseract o con otros solucionadores CRNN+CTC. No se dispone de datos de parametros, contexto, licencia ni disponibilidad de terceros dentro de la informacion consultada, por lo que cualquier tabla comparativa seria especulativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos en sentido sociodemografico; el modelo esta entrenado exclusivamente con captchas de un unico formato visual (digitos ondulados solapados en escala de grises), por lo que su sesgo es de dominio y no de poblacion.
- Riesgo de error elevado en produccion: la exactitud de coincidencia exacta es del 84,3 % en validacion y cae al 66,7 % (8/12) en la muestra auditada del pool no etiquetado, lo que implica aproximadamente un fallo por cada tres intentos en datos nuevos.
- Sobreajuste: la exactitud de entrenamiento al detenerse era del 98-99 % frente al 84,3 % de validacion, con solo 607 muestras de entrenamiento.
- Ausencia de conjunto de prueba independiente: la unica evidencia retenida es la particion de validacion de 108 imagenes, lo que limita la fiabilidad de las cifras.
- Modos de fallo especificos: confusion de un digito, colapso de repeticiones (por ejemplo, `11` → `1`), perdida de digitos en los bordes y segmentacion incorrecta que genera cadenas de longitud distinta a cinco.
- Limitaciones de formato: solo admite captchas de exactamente 5 digitos, en escala de grises y con entrada redimensionada a 32x128; no reconoce letras, simbolos, longitudes variables ni imagenes en color.
- Limitaciones de idioma: los tags en y pt se refieren a la documentacion bilingue de la model card, no a capacidades linguisticas; la salida se restringe al alfabeto de digitos 0-9.
- Licencia: MIT permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia. No se especifican restricciones adicionales.
- Caveat de trazabilidad: el autor indica que el script de entrenamiento no se distribuye (solo inferencia) y no se publican cuantizaciones, exportaciones a ONNX ni pesos en safetensors o GGUF, lo que dificulta la reproducibilidad completa.
- Caveat operativo y legal: resolver captchas puede infringir los terminos de servicio de los sitios afectados y, en determinadas jurisdicciones, la normativa sobre acceso no autorizado a sistemas. El uso responsable queda enteramente del lado de quien despliega el modelo.
- Caveat de integridad de metadatos: las fechas de creacion y actualizacion del repositorio (2026-09-19) son posteriores a la fecha habitual de consulta, y el repositorio registra 0 descargas, por lo que su adopcion real es practicamente nula y no existe validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/confiacompany/nantibot-captcha
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo. Los resultados devueltos por la busqueda corresponden a un servicio de generacion de video sin relacion con el modelo y se han descartado.
