# faisalashraf/langaai

## Resumen

LangAAI es un modelo de lenguaje de proteínas enmascarado (masked language model) para secuencias de regiones determinantes de complementariedad (CDR) de anticuerpos, condicionado por el antígeno diana. Lo publica el usuario faisalashraf (Faisal Bin Ashraf) bajo licencia MIT, con los pesos alojados en Hugging Face y el código de carga e inferencia en un repositorio de GitHub independiente.

A diferencia de la mayoría de modelos de lenguaje de anticuerpos, que procesan únicamente la secuencia del anticuerpo, LangAAI introduce el antígeno en la misma pila de autoatención conjunta: los residuos que predice para un bucle CDR dependen de aquello que el anticuerpo debe unir. La arquitectura parte de facebook/esm2_t12_35M_UR50D (ancho 480) congelado y añade dos torres ESM-2, adaptadores por lado y una pila conjunta de 4 capas y 8 cabezas.

El checkpoint contiene 48,8 M de parámetros (33,3 M del tower ESM-2 congelado y 15,5 M de componentes entrenados) y una longitud conjunta máxima de 1.024 tokens, que cubren anticuerpo y antígeno simultáneamente. Es un modelo estrictamente secuencial: no ve estructuras ni predice afinidad de unión. Su interés actual reside en ser una aproximación ligera (≈195 MB), ejecutable en CPU, a un problema de diseño de anticuerpos guiado por el antígeno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos torres ESM-2 con backbone congelado y pila de autoatención conjunta de 4 capas y 8 cabezas |
| Parámetros totales | 48,8 M (33,3 M en 198 tensores del tower ESM-2 congelado; 15,5 M en 65 tensores entrenados) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens de longitud conjunta, cubriendo anticuerpo y antígeno |
| Tipos de cuantización | no disponible (se distribuye solo el checkpoint nativo de PyTorch; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica: la entrada son secuencias de proteínas (dominio variable heavy y light opcional, más antígeno); no procesa lenguaje natural |
| Licencia | MIT (pesos y código) |
| Formato de pesos | torch.save (`langaai.pt`), cargable con `weights_only=True`; no se ofrecen safetensors ni GGUF |
| Modelo base | facebook/esm2_t12_35M_UR50D (width 480), congelado y almacenado dentro del propio fichero |
| Componentes entrenados | Adaptadores por lado, pila conjunta, embeddings de segmento, token pooled y cabeza LM con pesos compartidos |
| Requisito de librería | `transformers>=5.0` (con 4.x falla la carga por claves `rotary_embeddings.inv_freq`) |
| Tamaño del repositorio | 0,2 GB (checkpoint ≈195 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo masked language model con dos ramas de entrada. Cada rama arranca de una torre ESM-2 de 12 capas y ancho 480 tomada de facebook/esm2_t12_35M_UR50D, que permanece congelada; sobre ella se entrenan adaptadores específicos por lado. Las representaciones de ambas ramas se fusionan en una pila de autoatención conjunta de 4 capas y 8 cabezas, que procesa a la vez los tokens del anticuerpo y los del antígeno con embeddings de segmento que distinguen cada parte. La cabeza de predicción es una cabeza LM con pesos compartidos (tied) sobre las representaciones del anticuerpo, más un token pooled empleado para obtener el embedding global `cls_embedding`. El objetivo es de reconstrucción enmascarada: se ocultan posiciones (por ejemplo, el rango de CDR3) y el modelo predice la distribución de aminoácidos en cada posición condicionada por el antígeno.

El fichero `langaai.pt` es un payload de `torch.save` que contiene el state dict completo: 48,8 M de parámetros repartidos en 263 tensores, de los cuales 198 corresponden al tower ESM-2 congelado (33,3 M) y 65 a las partes entrenadas (15,5 M). El código de carga instancia primero el backbone desde el Hub y después restaura este state dict sobre él.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset (origen de los repertorios, proporción de pares anticuerpo-antígeno, especies cubiertas) ni si hubo etapas de ajuste adicionales. Al tratarse de un modelo de reconstrucción enmascarada sobre secuencias de proteínas, no se mencionan RLHF, DPO ni técnicas de alineación con preferencias humanas. Tampoco se describen innovaciones de eficiencia como decodificación especulativa o atención lineal; la aportación técnica diferencial es el condicionamiento por antígeno en atención conjunta sin información estructural.

## Capacidades

- Predicción de residuos enmascarados: `ab.mask_region("cdr3", spans=[(96, 108)])` permite enmascarar un rango y `model.predict_masked([...], top_k=5)` devuelve las distribuciones por posición (`p.position`, `p.top`), condicionadas por el antígeno.
- Codificación de anticuerpo: `model.encode_antibody(heavy=..., light=...)`, con la cadena ligera como parámetro opcional.
- Embedding de antígeno: `model.embed_antigen(secuencia)`.
- Puntuación de secuencias: `score_sequence` devuelve una log-verosimilitud de reconstrucción enmascarada, útil como filtro relativo, no como afinidad.
- Embeddings globales: `cls_embedding` para alimentar regresores u otros modelos downstream que se entrenen por separado.
- Inspección de atención: el CLI expone un subcomando `attention` para examinar los patrones de atención conjunta entre anticuerpo y antígeno.
- Interfaz de línea de comandos: `langaai predict|design|embed|attention` dirigida por ficheros JSON de configuración.
- Entrada limitada a proteínas: dominio variable heavy y, opcionalmente, light, más la secuencia del antígeno.
- No soporta tool calling ni function calling, ni uso como agente con razonamiento multi-paso: no es un modelo de instrucciones ni de diálogo.
- Sin capacidades multimodales: no procesa estructura, imagen, audio ni texto en lenguaje natural.
- Sin soporte de nucleótidos, residuos modificados más allá de `X` ni complejos con múltiples antígenos.

## Casos de uso

- Rediseño de CDR guiado por antígeno: dado un par anticuerpo-antígeno conocido, enmascarar el rango de CDR-H3 y obtener la distribución de aminoácidos predicha para ese antígeno concreto, como propuesta de variantes a sintetizar y validar después en laboratorio.
- Priorización de hits en campañas de screening: usar `score_sequence` como filtro relativo para ordenar cientos de secuencias candidatas antes de ensayos de unión, reduciendo el número de candidatas que pasan a validación experimental.
- Humanización y maduración de afinidad asistida: comparar las predicciones del modelo sobre una secuencia murina y sus variantes humanizadas frente al mismo antígeno, para señalar posiciones donde la sustitución podría comprometer el patrón de reconstrucción aprendido.
- Generación de embeddings para modelos predictivos propios: extraer `cls_embedding` de pares anticuerpo-antígeno y entrenar sobre ellos un regresor de afinidad o de propiedades de desarrollo, ya que el modelo no incluye esa capacidad de forma nativa.
- Análisis de interacción anticuerpo-antígeno sin estructura: emplear el subcomando `attention` para localizar qué posiciones del antígeno concentran la atención cuando se predice un CDR, como hipótesis previa a un estudio de cristalografía o criomicroscopía.
- Estimación de especificidad cruzada: puntuar la misma secuencia de anticuerpo frente a distintos antígenos y comparar las log-verosimilitudes de reconstrucción para detectar posibles reactividades no deseadas antes de ensayos de especificidad.
- Imputación de posiciones ausentes en repertorios: rellenar huecos o posiciones ambiguas (`X`) en secuencias de anticuerpos de bases de datos, aprovechando el contexto del antígeno cuando este se conoce.
- Investigación académica reproducible: al ser MIT, con 48,8 M de parámetros y ejecutable en CPU, sirve como banco de pruebas para estudiar condicionamiento por antígeno en modelos de lenguaje de proteínas sin requerir clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de reconstrucción enmascarada (por ejemplo, precisión por posición en CDR-H3), comparaciones con otros modelos de anticuerpos ni correlación con datos de afinidad medidos experimentalmente. La sección de citación de la model card aparece vacía, por lo que tampoco hay una publicación asociada de la que extraer resultados.

## Requisitos de hardware

- Tamaño del modelo: 48,8 M de parámetros. En FP32 los pesos ocupan ≈195 MB; en FP16 ≈98 MB; en INT8 ≈49 MB (no se distribuyen checkpoints cuantizados, son estimaciones de conversión manual).
- VRAM estimada para inferencia: menos de 1 GB para el modelo en FP32; entre 1 y 2 GB si se añade el overhead de PyTorch, activaciones y un lote pequeño. Con FP16 se reduce aproximadamente a la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente, incluidas RTX 4090, RTX 3060, GTX 1650 o incluso iGPU recientes. No requiere A100 ni H100.
- Inferencia en CPU: viable, dado el tamaño del modelo; también es ejecutable en Apple Silicon. No se publican cifras de latencia en CPU.
- Opciones de despliegue: paquete Python propio (`pip install git+https://github.com/fbabd/langaai.git`) sobre PyTorch. No hay soporte para vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia de LLM, porque no es un modelo de texto y su arquitectura requiere código de carga específico.
- Gestión del checkpoint: el loader descarga los pesos por HTTPS y los almacena en `langaai/checkpoints/langaai.pt`; se puede predescargar con `langaai download`, servir desde otra URL con `LANGAAI_CHECKPOINT_URL` o usar una copia local con `LANGAAI_CHECKPOINT=/ruta/langaai.pt`.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño de parámetros y la ventana de 1.024 tokens, cabe esperar latencias de milisegundos por lote en GPU moderna, pero es una estimación no verificada.
- Dependencia crítica de versión: el checkpoint exige `transformers>=5.0`; cargarlo con 4.x falla con claves ausentes en `rotary_embeddings.inv_freq` de cada capa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Condicionado por antígeno | Licencia | Formato |
|---|---|---|---|---|---|
| LangAAI | 48,8 M (33,3 M congelados) | 1.024 tokens conjuntos | Sí | MIT | torch.save (`langaai.pt`) |
| facebook/esm2_t12_35M_UR50D (backbone congelado) | ≈35 M (según la denominación del modelo base) | no disponible | No | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Modelos de anticuerpos sin condicionamiento por antígeno (categoría en la que se citan IgLM, AntiBERTy o ABLang) | no disponible | no disponible | No | no disponible | no disponible |

Advertencia: los modelos de la tercera fila se mencionan únicamente como referencia de categoría funcional. No se dispone de sus especificaciones verificadas en la información proporcionada, por lo que no se incluyen cifras ni resultados comparativos. La diferencia conceptual verificable es que LangAAI incorpora la secuencia del antígeno en una pila de atención conjunta, mientras que los modelos de anticuerpo convencionales procesan solo la secuencia del anticuerpo.

## Limitaciones y advertencias

- `score_sequence` no es un predictor de afinidad de unión: es una log-verosimilitud de reconstrucción enmascarada. Para estimar afinidad hay que entrenar un regresor propio sobre `cls_embedding`.
- No existe validación estructural: el modelo es puramente secuencial y nunca ve estructuras.
- Los rangos de CDR deben proporcionarlos el usuario. No se incluye ninguna herramienta de numeración de CDR, por lo que el modelo no puede localizar CDR-H3 en una secuencia cruda.
- Los antígenos de más de ≈780 residuos desplazan la secuencia conjunta por encima de los 1.024 tokens vistos en entrenamiento: la inferencia se ejecuta, pero fuera de distribución.
- Solo admite proteínas: no procesa nucleótidos, ni residuos modificados más allá de `X`, ni complejos con múltiples antígenos.
- Dependencia estricta de `transformers>=5.0`; cargar el checkpoint con 4.x produce errores por claves ausentes.
- El repositorio de Hugging Face contiene solo los pesos; el código de carga e inferencia vive en GitHub, lo que añade una dependencia externa al pipeline. Se observa además una discrepancia de capitalización entre `github.com/fbabd/LangAAI` y el `git+https://github.com/fbabd/langaai.git` indicado en la model card.
- La model card declara `inference: false`, de modo que no hay widget de inferencia alojado en el Hub.
- El modelo registra 0 descargas y 0 me gusta, y no presenta resultados de benchmarks ni validación independiente publicados; su comportamiento real en producción es desconocido.
- La sección de citación de la model card está vacía, lo que dificulta la atribución académica.
- No se documenta la composición del dataset de entrenamiento (especies, origen de los repertorios, proporción de pares anticuerpo-antígeno, número de tokens), por lo que no se pueden evaluar sesgos de cobertura ni de germline.
- La licencia MIT permite uso comercial de pesos y código, pero no ofrece garantías de rendimiento ni de idoneidad para uso clínico o diagnóstico; cualquier aplicación regulada exige validación propia.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/faisalashraf/langaai
- Código y documentación: https://github.com/fbabd/LangAAI
- Documentación del CLI: https://github.com/fbabd/langaai/blob/main/docs/cli.md
- Modelo base: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Perfil del autor en Hugging Face: https://huggingface.co/faisalashraf
- Paper o publicación asociada: no disponible (la sección de citación de la model card está vacía)
