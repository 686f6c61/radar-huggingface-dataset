# mozarilla/tiny-blue-log-classifier

## Resumen

Tiny Blue Log Classifier es un modelo de clasificacion de texto extremadamente pequeno (16.418 parametros, pesos de aproximadamente 66 KB) desarrollado por el usuario mozarilla para experimentos de blue-team en ciberseguridad. Su funcion es clasificar una linea de log como `BENIGN` o `SUSPICIOUS` en un entorno de solo CPU, con requisitos minimos de 2 nucleos y 2 GB de RAM. El modelo esta pensado como demostracion educativa y comprobacion de pipelines, no como herramienta de produccion.

La arquitectura es deliberadamente simple: normalizacion y tokenizacion del texto, hashing de tokens en 1.024 buckets, embedding de 16 dimensiones, masked mean pooling y una cabeza lineal de dos clases. No contiene capas de atencion, por lo que no requiere GPU. La ventana de contexto maxima es de 96 tokens. El checkpoint se entreno con 2.400 lineas sinteticas y se evaluo con 600, alcanzando un 100 % de precision en ese conjunto generado, un resultado que el propio autor califica como mera comprobacion de cordura del pipeline.

El modelo se distribuye bajo licencia Apache 2.0 y requiere `trust_remote_code=True` al cargarlo con las Auto clases de Transformers, ya que el repositorio incluye su propia implementacion de configuracion, red neuronal y tokenizador en Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hashing de tokens en 1.024 buckets + embedding de 16 dimensiones + masked mean pooling + cabeza lineal de 2 clases. Sin capas de atencion |
| Parametros totales | 16.418 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 96 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un pipeline lineal sin atencion: el texto de log se normaliza y tokeniza, los tokens se convierten en hashes que se asignan a 1.024 buckets, cada bucket alimenta un embedding de 16 dimensiones, se aplica masked mean pooling y una capa lineal produce la logits de dos clases (BENIGN y SUSPICIOUS). No hay capas transformer, ni mecanismos de atencion, ni componentes recurrentes. Esta disenado para ejecutarse en CPU con un coste computacional minimo.

El entrenamiento se realizo sobre 2.400 lineas de log generadas sinteticamente, con 600 lineas de validacion tambien generadas. El modelo alcanzo un 100 % de precision en ese conjunto de validacion, pero el propio autor advierte que este resultado es solo una comprobacion de que el pipeline funciona y no evidencia de rendimiento real en deteccion. No se menciona el uso de RLHF, DPO ni ninguna otra tecnica de alineacion posterior.

## Capacidades

- Clasificacion binaria de lineas de log como `BENIGN` o `SUSPICIOUS`.
- Procesamiento linea a linea de ficheros de log con memoria acotada (script `classify_file.py` incluido en el repositorio).
- Inferencia en CPU sin GPU, con un uso de memoria dominado por Python, PyTorch y Transformers, no por la red neuronal.
- Soporte de truncamiento a 96 tokens por linea.
- No dispone de tool calling, ni capacidades de agente, ni razonamiento multi-paso, ni soporte de vision o audio.
- Unicamente soporta el idioma ingles en los datos de entrenamiento.

## Casos de uso

- Demostracion educativa de clasificacion de logs: permite ilustrar un pipeline completo de carga, inferencia y clasificacion con Transformers y codigo personalizado, sin necesidad de GPU ni infraestructura.
- Prototipado de triaje de logs en entornos de laboratorio: se puede integrar en un script que procese un fichero de logs y genere un JSONL con las predicciones, util para validar flujos de datos antes de adoptar soluciones de produccion.
- Prueba de concepto de clasificacion ligera en hardware restringido: su tamano de 66 KB y ausencia de requisitos de GPU lo hacen ejecutable en equipos con 2 GB de RAM, como Raspberry Pi o instancias cloud minimas.
- Comprobacion de pipelines de integracion con Hugging Face: sirve para verificar que el flujo de carga con `trust_remote_code=True`, tokenizacion y softmax funciona correctamente antes de sustituirlo por un modelo real.
- Experimentos de blue-team en formacion: permite a estudiantes de ciberseguridad practicar con clasificacion de eventos como EventID=4625 (fallo de inicio de sesion) sin riesgo de afectar sistemas de produccion.
- Benchmark de overhead de runtime: al ser una red minuscula, permite medir el coste real de Python, PyTorch y Transformers en la carga y ejecucion, aislando el coste de la red neuronal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es un 100 % de precision en el conjunto de validacion generado sinteticamente (600 lineas), que el propio autor califica como comprobacion de cordura del pipeline y no como evidencia de rendimiento real. No se recomienda utilizar este modelo en entornos operativos sin reentrenamiento y evaluacion con datos reales revisados.

## Requisitos de hardware

- Inferencia en CPU exclusivamente; no requiere GPU.
- Entorno minimo declarado: Linux, 2 nucleos de CPU, 2 GB de RAM, Python 3.10 o superior.
- Peso del checkpoint: aproximadamente 66 KB; el uso de memoria en runtime esta dominado por Python, PyTorch y Transformers, no por la red neuronal.
- Compatible con cualquier GPU consumer, aunque no la utiliza; si se dispone de una, no aporta ventaja.
- Opciones de despliegue: carga directa con Transformers y `trust_remote_code=True`; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Se recomienda fijar `torch.set_num_threads(2)` para ajustar el uso de CPU al entorno declarado.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos directamente comparables de la misma categoria (clasificadores de logs extremadamente pequenos con arquitectura basada en hashing y sin atencion). Los modelos habituales de clasificacion de texto de Transformers (por ejemplo, distilbert-base-uncased para clasificacion) tienen varios ordenes de magnitud mas de parametros y requieren GPU o cuantizacion para ser practicos, pero no se dispone de datos de rendimiento comparativo en este contexto.

## Limitaciones y advertencias

- Modelo de demostracion: entrenado exclusivamente con datos sinteticos generados; no es un IDS, sustituto de SIEM, detector de malware ni control de seguridad autoritativo.
- No debe utilizarse para bloquear automaticamente usuarios o hosts basandose unicamente en sus predicciones.
- Requiere `trust_remote_code=True`: la carga ejecuta codigo Python del repositorio (configuracion, red neuronal y tokenizador personalizados). Es imprescindible revisar el codigo antes de habilitarlo y, al consumir repositorios de terceros, fijar una revision concreta revisada del commit.
- Ventana de contexto muy limitada: 96 tokens por linea, por lo que no puede analizar contextos largos ni correlaciones entre multiples lineas.
- Solo soporta ingles; lineas de log en otros idiomas pueden producir resultados no fiables.
- Sin capas de atencion: la capacidad de modelado de relaciones entre tokens es practicamente nula, limitando la calidad de la clasificacion frente a modelos transformer.
- Riesgo de alucinacion y falsos positivos/negativos no caracterizado: no hay datos de evaluacion con logs reales de Windows, Sysmon, firewall, EDR ni aplicaciones.
- El autor recomienda reentrenar y evaluar con logs representativos revisados del entorno antes de cualquier uso operativo, y usar hosts y periodos de tiempo separados en la evaluacion para reducir fugas y memorizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mozarilla/tiny-blue-log-classifier
- Documentacion de Mozilla.ai Blueprints (contexto general de herramientas open source de Mozilla.ai): https://blueprints.mozilla.ai/all-blueprints
- Modelos open source de Mozilla.ai: https://blueprints.mozilla.ai/models
- Organizacion Mozilla.ai en Hugging Face: https://huggingface.co/mozilla-ai/models
- GitHub de Mozilla.ai: https://github.com/mozilla-ai
