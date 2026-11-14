# mradermacher/AirDecision-4B-v1.1-GGUF

## Resumen

AirDecision-4B-v1.1-GGUF es una cuantizacion estatica del modelo AirDecision-4B-v1.1, publicado por el usuario mradermacher en Hugging Face. Se trata de un repositorio de pesos en formato GGUF generados a partir del modelo original de YellowPlus, pensados para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.). El repositorio incluye doce variantes de cuantizacion que abarcan desde Q2_K hasta F16, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.

Un dato relevante es la discrepancia entre el nombre comercial del modelo ("4B") y el recuento real de parametros en safetensors, que asciende a 333.514.240 (aproximadamente 333 millones). Esta cifra es la unica medicion objetiva disponible y debe tomarse como referencia frente a la denominacion del autor. El tamano del repositorio es de 1,0 GB, coherente con un modelo de ese orden y con la presencia de multiples cuantizaciones.

La informacion publicada es muy limitada: no se detalla la arquitectura interna, el dataset de entrenamiento, la licencia ni los idiomas soportados. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 333.514.240 (segun safetensors); el nombre del modelo indica "4B" |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base AirDecision-4B-v1.1. La model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones estaticas del modelo de YellowPlus, con metadatos de conversion (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`) que confirman que los pesos se convirtieron desde el formato Hugging Face original. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como atencion lineal o decodificacion especulativa.

El unico dato cuantitativo fiable es el recuento de parametros en safetensors (333.514.240). La etiqueta "4B" del nombre no se corresponde con esa cifra, por lo que conviene tratar el tamano real con cautela hasta que el autor publique especificaciones detalladas.

## Capacidades

- Generacion de texto: no se han documentado capacidades especificas mas alla de las inherentes a un modelo de lenguaje.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K y Q3_K_S permiten ejecutar el modelo en equipos con poca memoria, util para prototipos y pruebas de concepto en local.
- Inferencia en CPU con llama.cpp: al estar en formato GGUF, el modelo puede ejecutarse sin GPU mediante llama.cpp, adecuado para estaciones de trabajo sin acelerador dedicado.
- Integracion en Ollama o LM Studio: los ficheros GGUF son compatibles con estos entornos, lo que facilita la experimentacion rapida por parte de desarrolladores.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes, lo que permite medir la degradacion de calidad entre Q2_K y F16 sobre una misma tarea.
- Filtrado o clasificacion de texto en local: si el modelo base esta ajustado para toma de decisiones (por el nombre "AirDecision"), podria emplearse en tareas de clasificacion o enrutamiento, aunque esto no esta confirmado por el autor.
- Educacion y experimentacion: util como modelo pequeno para estudiar el efecto de la cuantizacion en la calidad de generacion sin requerir hardware costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano de fichero, las variantes Q4_K_M y Q5_K_M de un modelo de ~333 M de parametros suelen ocupar del orden de 200-400 MB, mientras que F16 se aproxima a 0,7 GB; estas cifras son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por el tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) deberia poder alojar las cuantizaciones pequenas.
- Compatibilidad con GPU consumer: probable en todas las cuantizaciones, dado el reducido numero de parametros, aunque no confirmado oficialmente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AirDecision-4B-v1.1-GGUF | 333.514.240 (segun safetensors) | no disponible | no disponible | GGUF | Cuantizaciones estaticas de un modelo de YellowPlus |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion suficiente para establecer una comparativa fiable |

No se dispone de datos suficientes para comparar este modelo con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica la licencia, por lo que el uso comercial queda sin marco legal claro y requiere consulta previa con el autor.
- Discrepancia de tamano: el nombre indica "4B" pero el recuento real en safetensors es de ~333 M de parametros; conviene verificar antes de dimensionar infraestructura.
- Falta de documentacion: no hay informacion sobre arquitectura, datos de entrenamiento, idiomas ni sesgos conocidos.
- Riesgo de alucinacion: no evaluado por el autor; en modelos pequenos y poco documentados este riesgo suele ser elevado.
- Idiomas: al no declararse, no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Contexto: se desconoce la ventana maxima, lo que impide planificar casos de uso con entradas largas.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion externa.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AirDecision-4B-v1.1-GGUF
- Modelo base: https://huggingface.co/YellowPlus/AirDecision-4B-v1.1
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
