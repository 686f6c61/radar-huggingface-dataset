# alcozzi/waf-classifier-qwen3-0.6b

## Resumen

El modelo `alcozzi/waf-classifier-qwen3-0.6b` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `unsloth/Qwen3-0.6B-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del modelo Qwen3-0.6B de Alibaba. Su propósito declarado es la clasificación de tráfico web para la detección de ataques (WAF, Web Application Firewall), aunque la model card no especifica el conjunto de clases exacto ni el formato de las entradas.

El adaptador ha sido desarrollado por el usuario alcozzi y publicado en HuggingFace con la librería PEFT, lo que indica que se trata de un ajuste fino por LoRA que modifica únicamente una pequeña fracción de los pesos del modelo base. Al estar basado en Qwen3-0.6B, hereda la arquitectura transformer densa de 0.6 mil millones de parámetros con una ventana de contexto de 32 000 tokens, lo que lo convierte en una opción ligera y desplegable en entornos con recursos limitados.

La relevancia de este modelo radica en la combinación de un clasificador especializado en seguridad web con un tamaño muy reducido, lo que permite inferencia en CPU o GPUs de gama baja. Sin embargo, la ausencia de documentación técnica detallada (datos de entrenamiento, métricas de evaluación, licencia explícita) limita su uso directo en producción sin una validación previa por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA |
| Parametros totales | 0.6 B (modelo base) + adaptador LoRA (dimension no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 000 tokens (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | Modelo base en 4 bits (bnb-4bit); adaptador en precision completa (fp32) |
| Idiomas soportados | No disponible (el modelo base Qwen3-0.6B es multilingue, pero el adaptador no especifica) |
| Licencia | No disponible (el modelo base Qwen3-0.6B usa Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer denso de 0.6 mil millones de parámetros con attention completa y una ventana de contexto de 32 000 tokens. Qwen3 introduce un mecanismo de conmutacion entre "modo pensamiento" (thinking mode) y "modo no pensamiento" (non-thinking mode), aunque es probable que el adaptador LoRA desactive o ignore esta funcionalidad al estar orientado a una tarea de clasificacion especifica.

El adaptador LoRA fue entrenado mediante Supervised Fine-Tuning (SFT) utilizando las librerias TRL y Unsloth, segun los tags del repositorio. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de epocas, la tasa de aprendizaje ni la composicion de los datos. La cuantizacion del modelo base en 4 bits (bnb-4bit) sugiere que el entrenamiento se realizo con tecnicas de reduccion de memoria (QLoRA), aunque no se confirma explicitamente.

No se ha publicado informacion sobre el proceso de preprocesamiento de datos ni sobre la metodologia de evaluacion durante el entrenamiento.

## Capacidades

- Clasificacion de peticiones web como maliciosas o benignas (funcion principal, segun el nombre del modelo).
- Generacion de texto, razonamiento y comprension del lenguaje, heredadas del modelo base Qwen3-0.6B (aunque el adaptador puede limitar estas capacidades al estar especializado).
- Soporte multilingue del modelo base, aunque el adaptador no especifica si mantiene esta capacidad.
- No se indica soporte de tool calling, agentes ni razonamiento multi-paso en el adaptador.
- No se indica capacidad de vision ni audio (modelo exclusivamente textual).

## Casos de uso

- Proteccion de APIs REST: el modelo puede integrarse como modulo de pre-filtrado en un API gateway para clasificar las peticiones entrantes y bloquear aquellas que presenten patrones de ataque antes de que lleguen al backend.
- Deteccion de inyecciones SQL y XSS: dado su nombre, es plausible que el adaptador haya sido entrenado para reconocer firmas de ataques comunes, aunque no se confirma el alcance exacto.
- Filtrado de trafico en entornos edge: gracias a su tamano reducido, puede desplegarse en dispositivos con poca memoria (Raspberry Pi, routers, etc.) para realizar clasificacion en tiempo real.
- Auditoria de logs de servidor: puede utilizarse para analizar historicos de peticiones y marcar entradas sospechosas para revision manual.
- Sistema de alerta temprana en SIEM: integrado en un pipeline de seguridad, puede anadir una capa de clasificacion automatica a las alertas generadas por otras herramientas.
- Educacion y experimentacion: su tamano y simplicidad lo hacen util para aprender sobre ajuste fino LoRA aplicado a tareas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas de exactitud, precision, recall ni F1 sobre conjuntos de datos estandar como WAF-A-MoLE o CSIC 2010.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4 bits ocupa aproximadamente 0.4 GB en memoria (0.6 B parametros * 0.5 bytes/parametro en 4 bits). El adaptador LoRA anade unos pocos MB adicionales. En total, cabe en cualquier GPU con 1 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas). Para inferencia en CPU, se recomienda al menos 4 GB de RAM.
- Despliegue: compatible con transformers y PEFT para cargar el adaptador sobre el modelo base. Tambien puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia: en una GPU moderna (RTX 4090), la inferencia de un token tarda menos de 5 ms; en CPU, puede rondar los 50-100 ms por token. La clasificacion de una peticion web corta (200-500 tokens) se completaria en menos de 1 segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| alcozzi/waf-classifier-qwen3-0.6b | 0.6 B + LoRA | 32k | No disponible | Clasificacion WAF |
| Qwen3-0.6B (base) | 0.6 B | 32k | Apache 2.0 | Generacion general |
| Llama-3.2-1B | 1 B | 128k | Llama 3.2 Community | Generacion general |
| DistilBERT-base (fine-tuned para deteccion de ataques) | 66 M | 512 | Apache 2.0 | Clasificacion de texto |

No se dispone de datos de rendimiento comparativo entre estos modelos para la tarea especifica de clasificacion WAF. El modelo de alcozzi se distingue por su tamano extremadamente reducido y su especializacion, pero carece de la documentacion y los benchmarks que ofrecen los modelos base de Qwen.

## Limitaciones y advertencias

- La model card no contiene informacion sobre sesgos, riesgos ni limitaciones especificas del adaptador. Se desconoce si el modelo ha sido evaluado para detectar sesgos de genero, raza o idioma.
- Riesgo de alucinacion: al ser un modelo de generacion de texto, podria producir respuestas inventadas si se le pide que explique sus decisiones de clasificacion.
- Alcance limitado: el adaptador esta entrenado para una tarea concreta (clasificacion WAF) y su uso fuera de este dominio puede producir resultados incorrectos.
- Ausencia de licencia declarada: no se puede garantizar el uso comercial sin consultar al autor.
- Sin datos de entrenamiento ni evaluacion publicados: no es posible verificar la calidad del modelo ni su robustez frente a ataques adversariales.
- El modelo base cuantizado en 4 bits puede presentar una ligera degradacion de precision respecto a la version completa, aunque para tareas de clasificacion suele ser aceptable.

## Enlaces

- Repositorio del modelo: https://huggingface.co/alcozzi/waf-classifier-qwen3-0.6b
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Documentacion de Qwen3 en Transformers: https://huggingface.co/docs/transformers/model_doc/qwen3
- Reporte tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
