# Daemons-Q/qsh-medical-breastmnist-ckks-square-student

## Resumen

El modelo `qsh-medical-breastmnist-ckks-square-student` es una red neuronal convolucional (CNN) muy pequena, de 450 parametros totales segun los safetensors (la model card declara 434), disenada especificamente para ser evaluada de extremo a extremo bajo cifrado homomorfico CKKS. Lo desarrolla el usuario Daemons-Q en el contexto del proyecto QSMPC-QKD-QHE-AI-Hybrid, una demostracion de orquestacion "quantum-safe" con componentes de privacidad. No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imagenes binario (benigno/maligno) sobre el dataset BreastMNIST de imagenes de ecografia mamaria a 14x14 pixeles.

El problema que resuelve es acotado pero tecnicamente interesante: demostrar que una inferencia completa (convolucion, activacion cuadratica, pooling y capa densa) puede ejecutarse sin descifrar ninguna capa intermedia, con el cliente cifrando la imagen y el evaluador operando sobre texto cifrado. La activacion es `x^2` en lugar de ReLU precisamente porque las funciones polinomicas son las unicas que CKKS puede evaluar de forma nativa; esto le da una profundidad multiplicativa de 3.

Es relevante ahora como artefacto de referencia para quien investiga inferencia privada sobre datos medicos con FHE, y como caso de estudio de destilacion de conocimiento (teacher de 11.171.266 parametros, student de 434) orientada a restricciones criptograficas mas que a precision. No debe confundirse con el teacher en texto claro ni leerse sus metricas contra la literatura publicada: su rendimiento es deliberadamente degradado por el presupuesto de computo homomorfico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: 1 bloque convolucional (1->4 canales, kernel 3x3, batch norm plegada), activacion cuadratica `x^2`, avg-pool, capa densa 196->2 |
| Parametros totales | 450 (safetensors); la model card declara 434 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen 14x14 pixeles |
| Tipos de cuantizacion | no disponible (pesos exportados en safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | `other`, con `license_name: cc-by-4.0-asserted-by-medmnist` y enlace a CC BY 4.0 |
| Formato de pesos | safetensors y ONNX (`onnxruntime-web`) |

## Arquitectura y entrenamiento

La arquitectura es un student destilado del teacher de 11.171.266 parametros, pensado para que su grafo de computo sea evaluable bajo CKKS sin descifrados intermedios. El flujo descrito en la model card: el cliente cifra los nueve taps de convolucion de la imagen, el evaluador multiplica por los taps del kernel, suma el sesgo, eleva al cuadrado y calcula un producto interno por clase con los pesos densos promediados sobre cada ventana de pooling; el cliente descifra dos logits. La profundidad multiplicativa resultante es 3, lo que obliga a un contexto CKKS propio (N=8192 con 48+34+34+34+52 bits en la variante A2, o N=16384 con 60+40+40+40+60 en la variante B), ambos dentro del limite post-cuantico de 128 bits del estandar de HomomorphicEncryption.org.

El entrenamiento se realiza sobre MedMNIST v2 BreastMNIST (780 imagenes a 28x28, reescaladas a 14x14 para el student), derivado de BUSI. La model card documenta un protocolo pre-registrado a cinco semillas: AUC de test 0.8435 (sd 0.0198) para esta arquitectura frente a 0.8182 (sd 0.0045) para la arquitectura del student publicado entrenada con la misma receta; la semilla exportada, elegida por AUC de validacion, obtiene 0.8198. No se documentan tokens, RLHF ni DPO por tratarse de vision. La innovacion tecnica destacable es la combinacion de destilacion con activacion polinomica y plegado de batch norm para encajar en el presupuesto de profundidad de CKKS.

## Capacidades

- Clasificacion binaria de imagenes de ecografia mamaria en dos clases (benigno/maligno) a partir de entradas de 14x14 pixeles en escala de grises.
- Inferencia completamente cifrada de extremo a extremo bajo CKKS, sin descifrar ninguna capa intermedia.
- Exportacion a ONNX y despliegue en navegador mediante `onnxruntime-web`.
- Convivencia con un teacher mayor (11,1 M de parametros) del que se destilo; el student no es un sustituto general del teacher.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de texto, de audio ni de vision general.
- No dispone de modo "thinking" ni de ninguna capacidad generativa.

## Casos de uso

- Demostracion de inferencia FHE de extremo a extremo: el modelo sirve como banco de pruebas reproducible para verificar que una CNN completa puede evaluarse bajo CKKS con profundidad multiplicativa 3 y sin descifrados intermedios, comparando los logits descifrados con los de texto claro (desviaciones medidas de 3.1e-4 en A2 y 6.1e-5 en B, sin cambios de decision).
- Investigacion en aprendizaje federado con privacidad: encaja en el caso `medical_fl` del proyecto QSMPC-QKD-QHE-AI-Hybrid, donde el evaluador no necesita ver las imagenes en claro; util para experimentos de agregacion segura con CKKS.
- Validacion de pipelines de destilacion bajo restricciones criptograficas: permite medir cuanto rendimiento se sacrifica al imponer una activacion polinomica y un tamano de 434 parametros frente a un teacher de 11,1 M, con criterios pre-registrados a cinco semillas.
- Docencia y prototipado de FHE para vision medica: el modelo es lo bastante pequeno (repo de 0,0 GB, 450 parametros) para ejecutarse en entornos con recursos limitados y para que estudiantes reproduzcan el contexto CKKS y las variantes A2 y B.
- Pruebas de regresion de librerias CKKS: sirve como caso de referencia con tolerancias conocidas (3.1e-4 y 6.1e-5) para detectar regresiones en implementaciones de CKKS o en parametrizaciones de escala.
- Evaluacion en navegador de clasificadores medicos minimos: gracias al export ONNX y a `onnxruntime-web`, puede integrarse en demos cliente-side donde el modelo se ejecuta en el navegador y la imagen se cifra antes de salir del dispositivo.
- Analisis de contaminacion y leakage en benchmarks: el propio autor documenta y mide el solapamiento train/test de BreastMNIST (un par exacto pixel a pixel entre train[115] maligno y test[76] benigno), lo que convierte el modelo en un caso practico para estudiar el suelo de rendimiento impuesto por el dataset.

## Benchmarks y rendimiento

Los datos publicados en la model card son los siguientes. La metrica objetivo es AUC.

| Metrica | Valor |
|---|---|
| `agreement` (student vs teacher) | 0.75 |
| `auc` | 0.819758 |
| `disagreement_on_positives` | 0.22807 |
| `export_seed` | 2 |
| `majority_class_rate` | 0.730769 |
| `metric_delta` | 0.160257 |
| `metric_delta_pp` | 16.0257 pp |
| `n_classes_predicted` | 2 |
| `n_eval` | 156 |
| `student_metric` | 0.705128 |
| `student_params` | 434 |
| `teacher_metric` | 0.865385 |
| `teacher_params` | 11171266 |

Referencias publicadas contra las que el autor mide el modelo:

| Referencia | AUC | ACC |
|---|---|---|
| Baseline a batir: ResNet-18 @28px, MedMNIST v2, Yang et al., Scientific Data 10:41 (2023) | 0.901 | 0.863 |
| Techo publicado: Google AutoML Vision, MedMNIST v2 | 0.919 | no disponible |
| Student pre-registrado (5 semillas), AUC test | 0.8435 (sd 0.0198) | no disponible |
| Student de arquitectura publicada, misma receta (5 semillas) | 0.8182 (sd 0.0045) | no disponible |

Fidelidad bajo CKKS sobre las 156 imagenes de test: los logits descifrados quedan a 3.1e-4 (variante A2) y 6.1e-5 (variante B) de los de texto claro, sin ningun cambio de decision. Una primera configuracion N=8192 con escala de 30 bits no alcanzo el criterio.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable en texto claro (450 parametros, repo de 0,0 GB); el coste real esta en el contexto CKKS, no en los pesos.
- GPU recomendadas: no se documenta ninguna GPU concreta en la informacion disponible; el modelo esta pensado para ejecutarse tanto en servidor como en navegador via `onnxruntime-web`.
- Cabe en cualquier GPU consumer y tambien en CPU; el cuello de botella es el tamano del polinomio CKKS (N=8192 o N=16384), no la memoria de pesos.
- Opciones de despliegue: ONNX Runtime (incluido `onnxruntime-web`), safetensors para carga directa, y el stack CKKS del proyecto QSMPC-QKD-QHE-AI-Hybrid para la variante cifrada.
- Latencia y throughput estimados: no disponibles. La model card solo reporta la desviacion numerica de los logits, no tiempos de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qsh-medical-breastmnist-ckks-square-student | 450 (434 declarados) | 14x14 | Clasificacion binaria BreastMNIST | 0.8198 | `other` (CC BY 4.0 asserted by MedMNIST) | Hugging Face, ONNX + safetensors |
| Teacher del mismo proyecto | 11.171.266 | no disponible | Clasificacion binaria BreastMNIST | 0.865385 (metrica student) | no disponible | referenciado en la model card, no como repo independiente |
| ResNet-18 @28px (MedMNIST v2, Yang et al. 2023) | no disponible en la informacion | 28x28 | Clasificacion BreastMNIST | 0.901 | no disponible | referencia bibliografica |
| Google AutoML Vision (MedMNIST v2) | no aplica (AutoML) | 28x28 | Clasificacion BreastMNIST | 0.919 | no disponible | referencia bibliografica |

## Limitaciones y advertencias

- Rendimiento muy por debajo de los baselines publicados: AUC 0.8198 frente a 0.901 de ResNet-18 y 0.919 del techo AutoML; el `metric_delta` de 0.160257 (16,03 pp) refleja la brecha frente al teacher, no frente a la literatura.
- El student no es el teacher: su `agreement` con el teacher es 0.75 y el `disagreement_on_positives` es 0.22807, es decir, mas de una quinta parte de los positivos se clasifican de forma distinta.
- La tasa de la clase mayoritaria es 0.730769, de modo que un clasificador trivial que siempre prediga la clase mayoritaria ya roza el 73 % de acierto; el `student_metric` de 0.705128 esta por debajo de esa referencia, lo que exige leer las metricas con cuidado.
- La activacion `x^2` es una eleccion criptografica, no de precision; limita la expresividad del modelo y explica en parte la degradacion.
- Contaminacion del dataset: la carta de Pawlowska, Karwat y Zolek (Data in Brief 48:109247, 2023) reporta 155 imagenes duplicadas (19 % de 780), ocho imagenes de lesion presentes en ambos conjuntos y 70 imagenes con estructuras distintas de la mama. El autor mide sobre el npz real y encuentra un unico par duplicado exacto a nivel de pixel entre train[115] (maligno) y test[76] (benigno), un 0,64 % del test que ningun entrenamiento puede resolver; relajar a RMSE<=0.05 arroja 216 pares casi duplicados, 120 cruzando splits y 6 cruzando y contradiciendo, pero esos numeros dependen del umbral.
- Licencia: el modelo se declara `other` con `cc-by-4.0-asserted-by-medmnist`; MedMNIST licencia su propio dataset como CC BY 4.0, pero BUSI (origen de BreastMNIST) no publica licencia alguna, solo una peticion de citacion, que no es una concesion de derechos. El uso comercial queda en terreno ambiguo y requiere revision legal propia.
- Ambito de uso restringido: es un artefacto de demostracion criptografica y de investigacion, no un dispositivo medico; no debe usarse para decision clinica.
- Sin datos de latencia ni de throughput publicados; no hay garantia de rendimiento en produccion.
- Idiomas no aplicables; no hay capacidades de texto, agentes ni tool calling que evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-medical-breastmnist-ckks-square-student
- Repositorio del proyecto QSMPC-QKD-QHE-AI-Hybrid: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Dataset MedMNIST v2: https://medmnist.com/
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Yang, Shi, Wei, Liu, Zhao, Ke, Pfister & Ni, "MedMNIST v2 - A large-scale lightweight benchmark for 2D and 3D biomedical image classification", Scientific Data 10:41 (2023)
- Yang, Shi & Ni, "MedMNIST Classification Decathlon: A Lightweight AutoML Benchmark for Medical Image Analysis", IEEE ISBI 2021
- Al-Dhabyani, Gomaa, Khaled & Fahmy, "Dataset of breast ultrasound images", Data in Brief 28:104863 (2020)
- Pawlowska, Karwat & Zolek, Letter to the Editor, Data in Brief 48:109247 (2023-05-19), PMC10293973: https://pmc.ncbi.nlm.nih.gov/articles/PMC10293973/
- Estandar de HomomorphicEncryption.org (limite post-cuantico de 128 bits): https://homomorphicencryption.org/
