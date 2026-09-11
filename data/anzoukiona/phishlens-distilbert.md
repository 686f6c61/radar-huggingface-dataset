# AnzouKiona/phishlens-distilbert

## Resumen

PhishLens-distilbert es un modelo de clasificacion de texto en ingles obtenido por ajuste fino (*fine-tuning*) de `distilbert-base-uncased` para una tarea binaria: determinar si el cuerpo de un correo electronico es **seguro** (etiqueta 0) o **de phishing** (etiqueta 1). Lo publica el usuario AnzouKiona en HuggingFace y forma parte del proyecto PhishLens, un sistema compuesto por una extension de Chrome y un backend FastAPI en el que este modelo actua como agente de analisis de texto dentro de un esquema de votacion entre tres agentes (texto, URL y cabeceras).

Con 66.955.010 parametros (aproximadamente 67 M) y un peso de repositorio de 0,3 GB, es un modelo pequeno y de coste de inferencia muy bajo. Se entreno durante 3 epocas con AdamW a una tasa de aprendizaje de 2e-5, batch de 16 y precision mixta FP16 sobre una unica GPU NVIDIA T4, con una longitud maxima de secuencia de 256 tokens. La licencia es MIT, lo que permite uso comercial sin restricciones de copyleft, y el modelo se distribuye en formato safetensors con pesos en FP32.

Su relevancia actual es acotada pero concreta: ofrece un clasificador de phishing especializado y desplegable en hardware modesto, con metricas reportadas por el autor del 97,34 % de exactitud y un F1 binario de 0,9665 sobre una particion de test estratificada del 20 % de un corpus deduplicado de 29.555 correos. El propio autor advierte de que no debe usarse en solitario como defensa de produccion, sino acompanado de reputacion de URL y verificacion DKIM/SPF/DMARC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT), con cabeza de clasificacion de secuencias para 2 clases |
| Parametros totales | 66.955.010 (aprox. 67 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud maxima usada en entrenamiento e inferencia); el modelo base admite hasta 512 posiciones |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos safetensors en FP32 y no incluye variantes GGUF, ONNX ni INT8 |
| Idiomas soportados | ingles (`en`); el autor indica explicitamente que no hay soporte para frances, hausa ni yoruba |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`, pipeline `text-classification`) |

## Arquitectura y entrenamiento

La arquitectura es la de `distilbert-base-uncased`: un encoder transformer destilado a partir de BERT-base, con 6 capas, 768 dimensiones ocultas y 12 cabezas de atencion, al que se anade una cabeza de clasificacion de secuencias sobre el token `[CLS]` con dos salidas (seguro / phishing). El ajuste fino se hizo con la API de `transformers` para clasificacion de texto, 3 epocas, optimizador AdamW con learning rate 2e-5, batch size 16, precision mixta FP16, longitud maxima de 256 tokens y una unica NVIDIA T4 en Google Colab. No se menciona en la informacion disponible ninguna innovacion de atencion, decodificacion especulativa ni etapa de RLHF o DPO; se trata de aprendizaje supervisado estandar sobre etiquetas binarias.

El corpus de entrenamiento combina varias fuentes: 18.650 ejemplos del *MeAJOR Corpus* (`zefang-liu/phishing-email-dataset`) como base de texto, 1.333 correos legitimos de entorno laboral moderno de `AreLit/PhishNChips`, 11.322 legitimos de `cybersectony/PhishingEmailDetectionv2.0` y 150 correos legitimos sinteticos hand-templated (`synthetic_legit_emails.csv`) orientados a dominios de Nigeria (bancos, hospitales, telefonos y universidades). La motivacion declarada de ese aumento es reducir falsos positivos en correos institucionales cuyo redactado se parece al de un phishing. La evaluacion se realizo sobre una particion estratificada del 20 % del corpus deduplicado de 29.555 correos (17.447 legitimos / 12.108 de phishing).

## Capacidades

- Clasificacion binaria de texto: devuelve probabilidad de "seguro" y de "phishing" para el cuerpo de un correo en formato `text/plain` o `text/html`.
- Deteccion de phishing basada en contenido textual: patrones de ingenieria social, urgencia, solicitudes de credenciales y lenguaje tipico de estafas.
- Discriminacion de correos institucionales legitimos: el autor reporta que el corpus de aumento reduce falsos positivos en dominios nigerianos (bancos, hospitales, operadoras, universidades).
- Integracion en pipeline de votacion: esta disenado para funcionar como uno de los tres agentes de PhishLens junto a los agentes de URL y cabeceras, con una lista blanca de dominios de confianza.
- Compatibilidad con infraestructura de inferencia: etiquetas `text-embeddings-inference` y `endpoints_compatible` en HuggingFace.
- Generacion de texto: no. Es un modelo exclusivamente discriminativo, sin cabeza de lenguaje.
- Razonamiento, codigo y matematicas: no disponibles; fuera del alcance del modelo.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado a nivel de modelo; el comportamiento multi-agente reside en el sistema PhishLens, no en el modelo.
- Vision, audio y modo "thinking": no soportados.
- Multilingue: no; el modelo es solo ingles.

## Casos de uso

- Filtrado de correo entrante en una pasarela de correo: clasificar el cuerpo de cada mensaje antes de la entrega y marcar los que superen un umbral de probabilidad, combinando el resultado con listas blancas de dominios institucionales para contener los falsos positivos.
- Segunda opinion en un cliente de correo: integrar el modelo en una extension de navegador (como hace PhishLens en Chrome) para avisar al usuario cuando abre un mensaje sospechoso, dado que el modelo cabe holgadamente en CPU y no requiere enviar el contenido a un tercero.
- Enriquecimiento de alertas en un SOC: usar la puntuacion del modelo como caracteristica adicional en un sistema de tickets o SIEM, junto a la verificacion DKIM/SPF/DMARC y la reputacion de URL que el autor recomienda como complemento obligatorio.
- Analisis de corpus historicos de correo: ejecutar el clasificador por lotes sobre archivados `.eml` de una organizacion para auditar cuantos mensajes de phishing pasaron los filtros en el pasado; el coste por documento es minimo al ser un modelo de 67 M de parametros.
- Formacion y simulacros de concienciacion: etiquetar plantillas de campanas internas para comprobar que no se parecen demasiado a un phishing real, o al reves, para calibrar la dificultad de un simulacro.
- Prototipado e investigacion en ciberseguridad: servir como linea base reproducible (licencia MIT, safetensors, 3 epocas, hiperparametros documentados) para comparar tecnicas de aumento de datos o de destilacion en tareas de deteccion de fraude textual.
- Moderacion de formularios y mensajes: adaptar la cabeza de clasificacion a un dominio cercano (mensajes de contacto, soporte al cliente) mediante un nuevo fine-tuning sobre el mismo modelo base, ya que la tarea subyacente es la misma clasificacion de texto binaria.
- Despliegue en el borde (*edge*): ejecutar el modelo en un contenedor ligero o en una maquina sin GPU, por ejemplo un servicio FastAPI en una instancia pequena, dado su tamano de pesos en FP32 de unos 268 MB.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre una particion de test estratificada del 20 % de un corpus deduplicado de 29.555 correos. No se ha publicado una evaluacion independiente ni comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| Exactitud (*accuracy*) | 97,34 % |
| F1 binario | 0,9665 |
| Tasa de falsos positivos | 2,91 % |
| Tasa de falsos negativos | 2,26 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no son aplicables a un clasificador binario de este tipo.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 268 MB con pesos FP32 (66,955 M parametros x 4 bytes), unos 134 MB si se convierte a FP16 y unos 67 MB en INT8. Estas cifras son calculos derivados del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 1 GB o mas de memoria es suficiente; el entrenamiento se hizo en una unica NVIDIA T4. Modelos como RTX 3060, RTX 4090, A100 o H100 estan enormemente sobredimensionados para este modelo y solo se justificarian por agregacion de peticiones.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU. El cuello de botella realista es la latencia de red o el tokenizador, no la memoria.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (metodo documentado en la model card), FastAPI como en el backend de PhishLens, HuggingFace Text Embeddings Inference (el modelo lleva la etiqueta `text-embeddings-inference`) y endpoints compatibles de HuggingFace. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son opciones directas sin conversion previa; tampoco se publica una variante ONNX.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone, en la informacion proporcionada, de resultados de benchmarks de modelos comparables de deteccion de phishing, por lo que la comparacion de rendimiento se marca como no disponible. La tabla compara caracteristicas objetivas verificables.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Rendimiento en phishing |
|---|---|---|---|---|---|
| AnzouKiona/phishlens-distilbert | 66.955.010 | 256 tokens (limite posicional 512) | MIT | en | Exactitud 97,34 %, F1 0,9665 (autorreportado) |
| distilbert-base-uncased (modelo base, sin ajustar) | 66.955.010 | 512 tokens | Apache-2.0 | en | no disponible (no es un clasificador de phishing) |
| bert-base-uncased (alternativa de mayor tamano) | 110 M | 512 tokens | Apache-2.0 | en | no disponible |
| Otros clasificadores de phishing publicos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ingles. El autor excluye explicitamente el soporte para phishing en frances, hausa y yoruba, lo que limita su uso en organizaciones multilingues.
- Los adjuntos PDF se ignoran. Del fichero `.eml` solo se leen las partes `text/plain` y `text/html`, de modo que un phishing cuyo gancho viaje en un PDF no se detectara por esta via.
- Falsos positivos residuales en marketing de nicho y correos de reclutamiento, segun reconoce el autor.
- No apto para defensa en produccion por si solo. La model card indica que debe combinarse con servicios de reputacion de URL y verificacion DKIM/SPF/DMARC, y con una lista blanca de dominios de confianza dentro del sistema PhishLens.
- Riesgo de sobreajuste al corpus. La evaluacion se hace sobre una particion del mismo corpus usado para entrenar y las metricas son autorreportadas: no hay validacion externa ni conjunto de prueba independiente.
- Discrepancia en las cifras del corpus. Las fuentes de entrenamiento declaradas suman 31.455 ejemplos (18.650 + 1.333 + 11.322 + 150) mientras que el corpus deduplicado descrito es de 29.555 correos; conviene tratar las cifras de composicion con cautela.
- Base sintetica muy pequena. El bloque de correos legitimos sinteticos para dominios nigerianos es de solo 150 ejemplos, por lo que la mejora declarada en ese subdominio se apoya en una muestra muy reducida.
- Desequilibrio de clases: 17.447 legitimos frente a 12.108 de phishing en el corpus final; el umbral de decision afecta directamente a la tasa de falsos positivos, que en un filtro de correo real es el coste mas visible.
- Sesgos de dominio: el modelo aprende el redactado de las fuentes incluidas y puede penalizar plantillas institucionales que se parezcan a las de phishing, precisamente el problema que el aumento de datos intenta mitigar.
- Modelo de proyecto academico. La cita corresponde a un trabajo de fin de grado (Nile University of Nigeria, 2026) y el repositorio no registra descargas ni valoraciones en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin obligacion de copyleft, pero no incluye ninguna garantia ni clausula de responsabilidad por fallos de deteccion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza, ya que el modelo devuelve probabilidades calibradas solo de forma implicita por el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnzouKiona/phishlens-distilbert
- Repositorio del sistema PhishLens (extension de Chrome + backend FastAPI): https://github.com/AnzouK/PhishLens
- Repositorio de notebooks de entrenamiento y codigo por agente (PhishingDetector): https://github.com/dodi-ctrl/PhishingDetector
- Dataset base: https://huggingface.co/datasets/zefang-liu/phishing-email-dataset
- Dataset de aumento (legitimos laborales): https://huggingface.co/datasets/AreLit/PhishNChips
- Dataset de aumento (legitimos): https://huggingface.co/datasets/cybersectony/PhishingEmailDetectionv2.0
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased

Nota: la busqueda web proporcionada no devolvio resultados relacionados con el modelo, la deteccion de phishing ni el proyecto PhishLens; los enlaces recuperados pertenecen a un foro de radio aleman y no se incluyen por no ser relevantes.
