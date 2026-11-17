# SaeedaKhan/PhishGuard

## Resumen

PhishGuard es un modelo de clasificacion de texto publicado en Hugging Face por el usuario SaeedaKhan, orientado por su nombre a la deteccion de phishing. Se distribuye como un modelo de la libreria transformers con pesos en formato safetensors y un total de 66.955.010 parametros, lo que lo situa en el rango de los modelos tipo BERT-base (aproximadamente 66 millones de parametros en su variante base). El repositorio ocupa 0,3 GB.

La informacion disponible es muy limitada: la model card es la plantilla autogenerada por Hugging Face y no contiene descripcion, datos de entrenamiento, evaluacion ni instrucciones de uso. El unico dato tecnico contrastable, ademas del recuento de parametros, es la etiqueta `distilbert` en los metadatos del repositorio, que sugiere una arquitectura basada en DistilBERT, aunque el recuento de parametros (66,9 M) es superior al de DistilBERT-base (unos 66 M) y coincide mas con el de BERT-base. Esta discrepancia no puede resolverse con la informacion proporcionada.

El modelo resulta relevante unicamente como artefacto de clasificacion de texto pequeno y desplegable en CPU, pero carece de documentacion que permita evaluar su calidad, su procedencia o sus condiciones de uso. No se han publicado resultados de benchmarks ni se declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (etiqueta `distilbert` en metadatos; no confirmada) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Compatibilidad | text-embeddings-inference, endpoints_compatible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura mas alla de la etiqueta `distilbert` incluida en los metadatos del repositorio y del recuento de parametros (66.955.010). No se especifica si se trata de un encoder transformer con cabeza de clasificacion, cuantas capas o dimensiones ocultas tiene, ni cual es la tarea exacta de clasificacion (binaria de phishing/no phishing, multiclase por tipo de ataque, etc.).

Tampoco hay datos sobre el conjunto de entrenamiento: numero de ejemplos, composicion, procedencia, tecnicas de aumento de datos, hiperparametros, regimen de precision o si se aplico algun proceso de ajuste fino adicional. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como `[More Information Needed]`, por lo que no se puede verificar ningun aspecto del proceso de entrenamiento.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, por lo que el modelo emite etiquetas y puntuaciones de confianza para un texto de entrada.
- Deteccion de phishing: por el nombre del modelo, se presume orientado a identificar URLs, correos o mensajes fraudulentos, aunque no se documenta la taxonomia de etiquetas.
- Compatibilidad con text-embeddings-inference y endpoints: puede servirse mediante la infraestructura de Hugging Face.
- Generacion de texto: no disponible (no es un modelo generativo).
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponibles.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Filtrado de correo electronico corporativo: el modelo podria integrarse en una pasarela de correo para puntuar mensajes entrantes y marcar como sospechosos aquellos con alta probabilidad de phishing, siempre que se valide previamente su calidad con un conjunto de prueba propio.
- Analisis de URLs en un navegador o proxy: clasificacion de enlaces antes de permitir la navegacion, usando el modelo como senal adicional junto con listas de bloqueo y heuristicas de dominio.
- Moderacion de formularios y comentarios: deteccion de mensajes que suplantan a una entidad legitima para solicitar credenciales.
- Enriquecimiento de alertas SOC: puntuacion automatica de correos reportados por empleados para priorizar la revision manual del equipo de seguridad.
- Prototipado rapido en CPU: al tratarse de un modelo de ~67 M de parametros, puede ejecutarse en entornos sin GPU para pruebas de concepto de clasificacion binaria.
- Base para ajuste fino: punto de partida para reentrenar sobre un corpus propio de phishing etiquetado, dado su tamano reducido y su formato safetensors compatible con transformers.
- Investigacion academica sobre deteccion de fraude textual: uso como linea base en experimentos comparativos, con la cautela de que no hay documentacion de su entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (67 M de parametros, ~268 MB de pesos), aproximadamente 134 MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo es viable en CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.), e incluso en hardware integrado.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, Hugging Face Inference Endpoints. No se confirma soporte de llama.cpp u Ollama, orientados a modelos generativos.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera latencia de milisegundos en CPU para entradas cortas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Documentacion |
|---|---|---|---|---|---|
| PhishGuard (SaeedaKhan) | 66,9 M | no disponible | text-classification | no disponible | plantilla vacia |
| DistilBERT-base (Hugging Face) | ~66 M | 512 tokens | encoder generalista | Apache 2.0 | completa |
| BERT-base (Google) | ~110 M | 512 tokens | encoder generalista | Apache 2.0 | completa |
| RoBERTa-base (Meta) | ~125 M | 512 tokens | encoder generalista | MIT | completa |

La comparativa se limita a modelos encoder de tamano similar, ya que no se han identificado alternativas especificas de deteccion de phishing documentadas en la informacion disponible. PhishGuard no ofrece datos de contexto, licencia ni evaluacion que permitan una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin descripcion, datos de entrenamiento ni evaluacion.
- Licencia no declarada: no se puede determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion sin aclaracion del autor.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano o solo en ingles.
- Arquitectura no confirmada: la etiqueta `distilbert` no concuerda con el recuento de parametros (66,9 M), lo que genera incertidumbre sobre la base real del modelo.
- Riesgo de alucinacion no aplicable como modelo generativo, pero si riesgo de falsos positivos y falsos negativos en la clasificacion, sin metricas publicadas que los cuantifiquen.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se puede evaluar el sesgo por dominio, idioma o tipo de atacante.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-17) en los metadatos: inconsistencia que sugiere que los datos del repositorio pueden no ser fiables.
- No apto para produccion sin una evaluacion independiente sobre un conjunto de validacion propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaeedaKhan/PhishGuard
- Paper de referencia del calculo de emisiones citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
