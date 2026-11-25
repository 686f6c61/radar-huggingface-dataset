# elnemer7/ElNeMeR-Arabic-AntiScam-ONNX

## Resumen

ElNeMeR-Arabic-AntiScam-ONNX es un clasificador de texto multilingue (arabe y ingles) especializado en la deteccion de fraude y ciberacoso, desarrollado por Eng. Mahmoud ElNemer bajo el paraguas de ElNeMeR Digital Solutions & AI. El modelo resuelve un problema concreto: identificar mensajes de extorsion, phishing financiero y estafas laborales o medicas dirigidas a poblaciones arabohablantes, con especial enfasis en arabe egipcio, del Golfo y arabe estandar moderno (MSA).

Tecnicamente no es un transformer: se trata de un MLP hasheado (hashed MLP) exportado a ONNX que opera sobre un vector de caracteristicas FNV-1a de 512 dimensiones L2-normalizado, construido a partir de unigramas de palabra, bigramas y n-gramas de caracteres de orden 3 y 4. Esta decision de diseno prioriza la latencia (menos de 1 ms por inferencia en onnxruntime-web) y la portabilidad (navegador, Android, iOS, Python) por encima de la capacidad representacional de un modelo neuronal profundo.

El modelo es relevante por su enfoque de "IA humanitaria": una herramienta ligera, de licencia MIT y ejecutable en el cliente, pensada para proteger a familias, jovenes y personas mayores de Egipto y el mundo arabe frente a sextorsion, suplantacion bancaria, fraude con monederos moviles (InstaPay, Vodafone Cash, Fawry) y estafas de reclutamiento. Su huella es minima (repo de 0.0 GB) y su integracion no requiere GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP hasheado (hashed MLP) exportado a ONNX; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada es un vector fijo `float32[batch_size, 512]` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (egipcio, del Golfo, MSA) e ingles |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada | Vector FNV-1a de 512 dimensiones L2-normalizado (unigramas, bigramas, n-gramas de caracteres 3/4) |
| Salida | Probabilidades calibradas sobre 4 clases |
| Clases | 0: SAFE_AUTHENTIC, 1: CYBER_BLACKMAIL, 2: FINANCIAL_PHISHING, 3: FAKE_JOB_MEDICAL_SCAM |
| Latencia declarada | < 1 ms en onnxruntime-web |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa (MLP) que consume un vector de caracteristicas hasheadas de 512 dimensiones. El pipeline de preprocesado aplica hashing FNV-1a sobre unigramas de palabra, bigramas y n-gramas de caracteres de orden 3 y 4, seguido de normalizacion L2. Esta tecnica evita mantener un vocabulario explicito y permite que el modelo sea independiente del tokenizador, lo que facilita su despliegue en entornos web y moviles donde el tamano del binario es critico.

El modelo produce cuatro probabilidades calibradas correspondientes a las clases SAFE_AUTHENTIC, CYBER_BLACKMAIL, FINANCIAL_PHISHING y FAKE_JOB_MEDICAL_SCAM. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste fino supervisado convencional. Tampoco se documenta el proceso de calibracion de probabilidades ni el tamano de la capa oculta del MLP. Toda esta informacion figura como no disponible.

## Capacidades

- Clasificacion de texto en 4 categorias: comunicacion benigna, ciberextorsion, phishing financiero y estafa laboral o medica.
- Deteccion de sextorsion, amenazas de difamacion con deepfakes y coaccion con fotos privadas en arabe egipcio, del Golfo, MSA e ingles.
- Identificacion de suplantacion bancaria, fraude con InstaPay, Vodafone Cash y Fawry, y robo de codigos OTP por WhatsApp.
- Deteccion de estafas de tareas VIP, fraude de reclutamiento con pago anticipado y curas medicas milagrosas falsas.
- Ejecucion en navegador via onnxruntime-web, en Android, en iOS y en Python.
- Inferencia en menos de 1 ms por lote segun la model card.
- Soporte multilingue limitado a arabe e ingles.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Moderacion en apps de mensajeria: integracion del clasificador en el pipeline de recepcion de WhatsApp o Telegram para marcar mensajes sospechosos antes de que el usuario los abra, aprovechando la latencia inferior a 1 ms y la ejecucion en el propio dispositivo.
- Filtro en aplicaciones bancarias moviles: clasificacion en tiempo real de SMS y notificaciones entrantes para alertar al usuario cuando un mensaje simula ser de su banco o solicita un codigo OTP.
- Proteccion de personas mayores: plugin de navegador o teclado movil que advierte sobre mensajes de estafas medicas o de tareas VIP antes de que el usuario interactue con ellos.
- Deteccion de reclutamiento fraudulento: integracion en portales de empleo o bolsas de trabajo para marcar ofertas que solicitan pagos anticipados o datos financieros.
- Triaje en lineas de ayuda ciudadana: clasificacion automatica de denuncias recibidas por canales de soporte para priorizar casos de ciberextorsion frente a consultas benignas.
- Investigacion y analisis de amenazas: procesamiento por lotes de corpus de mensajes sospechosos en arabe para estudios academicos sobre fraude digital en la region MENA, dado que el modelo es ligero y de licencia MIT.
- Filtrado en el cliente sin conexion: al ser un modelo ONNX de tamano minimo, puede embeberse en aplicaciones moviles que operan sin conectividad, algo inviable con transformers de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es la latencia de inferencia (< 1 ms en onnxruntime-web), sin datos de precision, recall, F1 ni matrices de confusion por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo es un MLP hasheado de 512 dimensiones de entrada y no requiere GPU.
- GPU recomendadas: no aplica; la inferencia esta pensada para CPU, navegador y dispositivos moviles.
- Cabe en cualquier GPU consumer y en practicamente cualquier CPU moderna, incluidos telefonos de gama media.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador), onnxruntime para Android e iOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia: inferior a 1 ms por lote segun la model card. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| ElNeMeR-Arabic-AntiScam-ONNX | MLP hasheado | no disponible | entrada fija 512 | ar, en | MIT | ONNX |
| Modelos de clasificacion de toxicidad basados en BERT (p. ej. variantes multilingues) | Transformer encoder | cientos de millones | 512 tokens | multilingue | variable | safetensors, ONNX |
| Clasificadores de spam SMS basados en TF-IDF + regresion logistica | Lineal | no disponible | variable | variable | variable | pickle, ONNX |

La comparativa directa con alternativas concretas no esta disponible en la informacion proporcionada. Frente a encoders tipo BERT, ElNeMeR-Arabic-AntiScam-ONNX ofrece una huella mucho menor y latencia inferior, a costa de una capacidad representacional mas limitada al depender de caracteristicas hasheadas en lugar de atencion contextual.

## Limitaciones y advertencias

- No es un transformer: carece de atencion contextual, por lo que puede fallar ante mensajes con estructura sintactica compleja, sarcasmo o codigo mezclado.
- La model card no documenta el dataset de entrenamiento, el proceso de calibracion ni metricas de evaluacion, lo que impide estimar su fiabilidad real en produccion.
- Riesgo de falsos positivos y negativos desconocido al no publicarse matrices de confusion ni curvas ROC.
- Cobertura linguistica limitada a arabe e ingles; no se garantiza su comportamiento en otras variedades dialectales del arabe ni en lenguas adicionales.
- El modelo esta orientado a la deteccion de fraude; no debe usarse como unica barrera de seguridad en sistemas criticos sin validacion humana.
- Aunque la licencia es MIT (permite uso comercial), la ausencia de documentacion sobre el origen de los datos de entrenamiento impide evaluar posibles sesgos o problemas de privacidad.
- La fecha de creacion indicada (2026-11-25) es futura respecto a la fecha habitual de publicacion, lo que sugiere un posible error en los metadatos del repositorio.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso; su alcance se limita a la clasificacion.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Arabic-AntiScam-ONNX
- Plataforma humanitaria en vivo: https://detector.elnemer-ai.com
- Sitio corporativo: https://elnemer-ai.com
