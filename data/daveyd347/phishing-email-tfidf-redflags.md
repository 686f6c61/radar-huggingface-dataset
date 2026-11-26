# DaveyD347/phishing-email-tfidf-redflags

## Resumen

`phishing-email-tfidf-redflags` es un clasificador binario de correos de phishing desarrollado por el usuario DaveyD347 y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje: es un pipeline clásico de scikit-learn que combina una regresión logística con tres bloques de características (TF-IDF de palabras, TF-IDF de caracteres y 24 reglas heurísticas de "banderas rojas"), con un tamaño de pesos de aproximadamente 1 MB.

El problema que resuelve es la detección explicable de correo fraudulento en inglés, incluyendo phishing clásico y business email compromise (BEC). Su rasgo diferencial es que, junto a la probabilidad de phishing, devuelve las banderas concretas que han motivado la puntuación: dominios de remitente que suplantan marcas, Reply-To incoherente, enlaces a IPs desnudas o a alojamiento gratuito, solicitudes de contraseñas, códigos de un solo uso, tarjetas regalo o transferencias, y lenguaje de presión o secreto.

Es relevante ahora por su perfil de despliegue: cabe entero en el navegador, se ejecuta en CPU sin GPU y ofrece una ruta de inferencia en JavaScript con paridad verificada frente a Python (diferencia máxima de 1e-5 sobre 1.246 correos). Está entrenado exclusivamente con un dataset sintético (`DaveyD347/synthetic-phishing-emails`), lo que condiciona su generalización a tráfico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica sobre features TF-IDF (palabras y caracteres) + 24 reglas binarias de banderas rojas |
| Parametros totales | No disponible (pesos de aproximadamente 1 MB; vocabularios de 15.000 terminos de palabra y 25.000 de caracter) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo generativo; procesa el texto del correo completo como bolsa de n-gramas) |
| Tipos de cuantizacion | No aplica (pesos de regresion logistica en precision nativa) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.skops` (Python), `model.json` (JavaScript) |

## Arquitectura y entrenamiento

El modelo es un clasificador lineal (regresion logistica) que opera sobre tres bloques de features concatenados: TF-IDF de unigramas y bigramas de palabra con 15.000 terminos; TF-IDF de n-gramas de caracter de 3 a 5 dentro de limites de palabra con 25.000 terminos, pensado para capturar variantes ofuscadas como `n0rthwind`, `-secure-login` o dominios `.top`; y 24 comprobaciones binarias basadas en reglas sobre remitente, enlaces y peticiones del cuerpo del mensaje. Las features de banderas rojas se escalan con un factor `flag_scale` que pondera su contribucion frente a las features textuales.

El entrenamiento usa las particiones de train y validacion del dataset sintetico `DaveyD347/synthetic-phishing-emails`. La regularizacion (`C`) y el peso de las banderas rojas se seleccionaron mediante validacion cruzada agrupada por plantilla con 5 folds, obteniendo `C=30` y `flag_scale=0.5` con un macro F1 de 0.925 ± 0.054 entre folds. El umbral de decision se fijo en 0.35 para maximizar el macro F1 sobre predicciones out-of-fold (0.934 frente a 0.927 con umbral 0.5). Se aplican pesos de clase balanceados y los dominios ficticios `.example` del dataset se reescriben a `.com` antes de generar las features para evitar que el modelo aprenda que `.example` implica legitimidad. El entrenamiento completo, incluyendo la validacion cruzada, tarda unos 3,5 minutos en CPU de portatil.

## Capacidades

- Clasificacion binaria de correo electronico como phishing o legitimo, con probabilidad calibrada y umbral configurable.
- Explicabilidad nativa: devuelve la lista de banderas rojas activadas con su etiqueta y severidad, no solo la puntuacion.
- Deteccion de suplantacion de remitente mediante analisis de dominios parecidos (lookalike domains) y desajustes de Reply-To.
- Deteccion de enlaces sospechosos: IPs desnudas, alojamiento gratuito y dominios de nivel superior de riesgo.
- Deteccion de peticiones sensibles: credenciales, contrasenas, PIN, SSN, codigos de un solo uso, tarjetas regalo, transferencias y cambios de datos bancarios.
- Deteccion de lenguaje de presion, urgencia y secreto caracteristico de ingenieria social.
- Capacidad de cubrir business email compromise (BEC) sin enlaces, incluyendo solicitudes de transferencia, desvio de nomina y secuestro de hilos.
- Inferencia en navegador via JavaScript con paridad numerica frente a la implementacion Python.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Filtrado previo en pasarelas de correo: el modelo puede puntuar cada mensaje entrante en CPU antes de entregarlo al buzon, con un coste de inferencia minimo y sin GPU, reduciendo la carga sobre clasificadores mas costosos.
- Aviso explicable al usuario final: al mostrar las banderas rojas concretas (por ejemplo, "el dominio del remitente imita a una entidad financiera" o "se solicita un codigo de un solo uso"), el usuario entiende por que se ha marcado el correo, lo que mejora la confianza en el filtro.
- Proteccion de clientes de correo web: al ejecutarse integramente en el navegador con pesos de 1 MB, permite clasificar localmente sin enviar el contenido del correo a un servidor, lo que encaja con requisitos de privacidad estrictos.
- Defensa frente a BEC en entornos corporativos: la cobertura especifica de solicitudes de transferencia, cambios de nomina y secuestro de hilos lo hace util como capa adicional en la proteccion de departamentos financieros.
- Triaje en bandejas de soporte y abuso: un equipo de seguridad puede usar la puntuacion y las banderas para priorizar la revision manual de correos reportados por usuarios, con umbral ajustable segun tolerancia a falsos positivos.
- Generacion de datos de entrenamiento y evaluacion: al ser un modelo pequeno y determinista, sirve como baseline reproducible para comparar clasificadores de phishing mas complejos o para etiquetar conjuntos sinteticos.
- Educacion y simulacros de concienciacion: las banderas devueltas pueden usarse para explicar en campanas internas que senales concretas delatan un correo fraudulento.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Conjunto | Umbral | Accuracy | Precision | Recall | Macro F1 | ROC AUC | Tasa de falsos positivos |
|---|---:|---:|---:|---:|---:|---:|---:|
| Test (3.600 correos, plantillas no vistas) | 0.35 | 0.958 | 0.999 | 0.906 | 0.957 | 0.995 | 0,05 % |
| Test (mismo conjunto) | 0.50 | 0.921 | 1.000 | 0.823 | 0.918 | 0.995 | 0,00 % |
| Challenge (40 correos escritos a mano) | 0.35 | 0.975 | 1.000 | 0.950 | 0.975 | 1.000 | 0,00 % |

Desglose por familia en el conjunto de test: senuelos de devolucion de impuestos 99 %, business email compromise sin enlaces (solicitudes de transferencia, desvio de nomina, secuestro de hilos) 88 %, y correo legitimo laboral, de TI y personal entre 99,8 % y 100 %. El unico fallo del conjunto challenge es un mensaje informal en minusculas de remitente desconocido y sin cabeceras, un caso que depende de contexto que el texto por si solo no aporta. Entre los falsos positivos duros evaluados, un aviso real de caducidad de contrasena puntua 0,1 %, un aviso de pago rechazado del dominio de la propia tienda 4,8 %, un aviso de cuenta bloqueada 0,4 % y una confirmacion de cambio de deposito directo 0,9 %.

## Requisitos de hardware

- VRAM: no requiere GPU; los pesos ocupan aproximadamente 1 MB y la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica. Cualquier CPU moderna es suficiente, incluida la de un portatil o un dispositivo movil.
- Cabe en GPU consumer: si, aunque no es necesario; tambien cabe en navegador.
- Opciones de despliegue: scikit-learn con `skops.io` para Python, y el pipeline JavaScript incluido en el Space (`space/model.js` y `space/redflags.js`) para ejecucion en navegador o Node.js. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, que sirven modelos generativos.
- Latencia y throughput: no se publican cifras concretas. El entrenamiento completo con validacion cruzada tarda unos 3,5 minutos en CPU de portatil, lo que da una idea del orden de magnitud del coste de ajuste; la inferencia por correo es de milisegundos en CPU, aunque el autor no aporta mediciones formales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| `phishing-email-tfidf-redflags` | Regresion logistica + TF-IDF + reglas | ~1 MB de pesos | No aplica | Apache 2.0 | Clasificacion explicable en ingles, ejecutable en navegador |
| Clasificadores BERT fine-tuned para phishing | Transformer encoder | 110 M - 340 M tipicamente | 512 tokens | Variable (MIT, Apache 2.0, propietaria) | Mayor capacidad semantica, requiere GPU o CPU con latencia mayor; menos explicable por defecto |
| Filtros bayesianos de spam (p. ej. SpamAssassin) | Heuristicas + Naive Bayes | No aplica | No aplica | Variable (Apache 2.0 en SpamAssassin) | Enfoque clasico de spam general, no especifico de phishing ni BEC |
| LLMs generativos con prompts de deteccion | Transformer decoder | Miles de millones | 8k-128k tokens | Variable | Flexibles y multilingues, pero costosos, no deterministas y con riesgo de alucinacion |

La comparativa cuantitativa directa con alternativas no esta disponible en la informacion proporcionada: el autor solo publica resultados sobre su propio dataset sintetico, sin comparaciones cruzadas con otros modelos en los mismos conjuntos.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: la generalizacion a correo real no esta validada y es el principal riesgo para produccion.
- Solo ingles: no cubre correos en otros idiomas ni mezclas de idiomas.
- La tasa de deteccion en business email compromise sin enlaces es la mas baja del desglose (88 %), precisamente la familia de mayor impacto economico.
- El recall al umbral por defecto (0.906) implica que aproximadamente uno de cada diez correos de phishing del conjunto de test no se detecta; bajar el umbral aumenta falsos positivos.
- El conjunto challenge tiene solo 40 correos, por lo que las metricas sobre el tienen alta varianza.
- Riesgo de falsos positivos en correos legitimos que contengan lenguaje de urgencia o solicitudes de credenciales (por ejemplo, avisos reales de caducidad de contrasena o de cuenta bloqueada), aunque el autor reporta puntuaciones bajas en sus pruebas.
- Al ser un modelo lineal con features de n-gramas, puede ser vulnerable a ataques de evasion por ofuscacion no contemplada en el vocabulario o por reescritura del texto.
- La carga de archivos `.skops` requiere comprobar los tipos no confiables con `get_untrusted_types` antes de deserializar; el propio autor lo advierte.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- No sustituye a un filtro de correo completo: no analiza adjuntos, no verifica autenticacion de correo (SPF, DKIM, DMARC) y no inspecciona el contenido de enlaces en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DaveyD347/phishing-email-tfidf-redflags
- Demo interactiva (Space): https://huggingface.co/spaces/DaveyD347/phishing-email-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/DaveyD347/synthetic-phishing-emails
- Repositorio de scikit-learn: https://github.com/scikit-learn/scikit-learn
- Libreria skops: https://github.com/skops-dev/skops
