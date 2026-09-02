# mohamedrayyan/whale-shark-id-resnet18

## Resumen

El repositorio `mohamedrayyan/whale-shark-id-resnet18` no contiene un modelo de aprendizaje automatico con pesos, sino un sistema de software escrito en C11 (con backend CUDA opcional) para la identificacion individual de tiburones ballena a partir de fotografias y video. El proyecto implementa un pipeline completo de deteccion, seguimiento (tracking), extraccion de caracteristicas y busqueda en un catalogo global mediante similitud coseno, con umbrales calibrados que clasifican cada resultado como `known`, `unknown` o `review`. A pesar del nombre "resnet18", la documentacion no confirma el uso de una arquitectura ResNet; la extraccion de caracteristicas se describe como un "baseline deterministico de 16 dimensiones" en CPU, con un backend CUDA aislado y opcional. El proyecto esta orientado a un MVP (producto minimo viable) con ejecucion en tiempo real y sin dependencias de frameworks como PyTorch u OpenCV para la ruta principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere ResNet18, pero no se confirma en la documentacion; se describe un "baseline deterministico de 16-D") |
| Parametros totales | No disponible (no se publican pesos de red neuronal) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica (no se distribuyen pesos cuantizados) |
| Idiomas soportados | No disponible (no es un modelo de texto) |
| Licencia | No disponible |
| Formato de pesos | No aplica (el repositorio contiene codigo fuente C11 y CMake, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El sistema se organiza como una biblioteca C11 con una superficie de API que cubre desde la carga de fotos (formato PPM) hasta el procesamiento de secuencias de video y streaming en vivo. El pipeline se compone de una interfaz de deteccion, un tracker con acumulacion de evidencia, un modulo de recorte y normalizacion del flanco del animal, y una interfaz de embedding que produce un vector de 16 dimensiones de forma determinista en CPU. La busqueda en el catalogo se realiza por similitud coseno, con umbrales configurables (`known_threshold`, `review_threshold`, `margin_threshold`) y un requisito minimo de fotogramas de evidencia (`min_evidence_frames`). El backend CUDA esta aislado en un archivo `.cu` y, si no esta disponible, el sistema compila y funciona en CPU mediante un stub que devuelve `WSI_ERR_BACKEND_UNAVAILABLE`. No se documenta ningun proceso de entrenamiento de redes neuronales; el proyecto incluye un mecanismo de "autoresearch" que ajusta los umbrales mediante hill climbing sobre un fixture sintetico, pero no entrena pesos de un modelo.

## Capacidades

- Deteccion de tiburones ballena en imagenes y video, con seguimiento de multiples individuos en secuencias de fotogramas.
- Extraccion de caracteristicas del flanco del animal y generacion de un embedding de 16 dimensiones (determinista en CPU).
- Clasificacion de identidad en tres categorias: `known`, `unknown` y `review`, basada en umbrales de similitud coseno y acumulacion de evidencia.
- Procesamiento de fotos individuales (resultado `REVIEW` si la evidencia es insuficiente) y de secuencias de video (resultado `KNOWN` tras acumular fotogramas suficientes).
- Streaming en vivo con identificacion provisional inmediata y confirmacion posterior al completar la secuencia.
- Integracion con un catalogo global via API (`wsi_catalog_api_t`) que permite busquedas con timeout y fallo cerrado a `UNKNOWN` ante errores.
- Persistencia del catalogo en disco (guardar/cargar) y manejo de errores ante archivos corruptos.
- Backend CUDA opcional con autotest y degradacion graciosa a CPU si no hay GPU disponible.

## Casos de uso

- Monitoreo de poblaciones de tiburones ballena: los investigadores pueden procesar fotografias de aficionados o camaras fijas para identificar individuos y rastrear sus movimientos a lo largo del tiempo, gracias al sistema de catalogo y busqueda por similitud.
- Ciencia ciudadana: una aplicacion movil o web podria integrar la API C11 para que voluntarios suban fotos y reciban una identificacion provisional (`known`/`unknown`) en tiempo real, fomentando la recopilacion de datos a gran escala.
- Analisis de video subacuatico: el pipeline de secuencias permite procesar grabaciones largas y extraer automaticamente los fotogramas donde aparece un tiburon ballena, acumulando evidencia para una identificacion fiable.
- Verificacion de avistamientos: organizaciones de conservacion pueden usar el sistema para validar si un avistamiento corresponde a un individuo ya catalogado o a uno nuevo, reduciendo el trabajo manual de comparacion visual.
- Educacion y divulgacion: el sistema puede alimentar una base de datos publica donde cada tiburon ballena tenga un perfil con su historial de avistamientos, accesible para escuelas y museos.
- Investigacion de comportamiento: al combinar la identificacion con datos de localizacion y fecha, los biologos pueden estudiar patrones de migracion y fidelidad a sitios de alimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "smoke test" que verifica decisiones de recuperacion, rutas de foto/video, streaming, catalogo y backend CUDA, pero no proporciona metricas cuantitativas de precision o rendimiento sobre datos reales.

## Requisitos de hardware

- CPU: compilacion con GCC >=11 y CMake >=3.16; la ruta CPU funciona sin GPU ni dependencias externas (sin PyTorch, OpenCV o FAISS).
- GPU (opcional): CUDA Toolkit 12.8, con soporte para `sm_75` (mencionado para una GTX 1650 de 4 GB). El backend CUDA se activa solo si el toolkit esta presente; en caso contrario, el sistema compila y ejecuta en CPU.
- Memoria: el tamano del repositorio es de 0.1 GB, pero no se especifican requisitos de RAM o VRAM para la inferencia.
- Despliegue: al ser una biblioteca C11, puede integrarse en aplicaciones embebidas, servicios web o herramientas de linea de comandos. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos estimados; la model card menciona metricas de latencia y tasa de fotogramas en la estructura `wsi_pipeline_result_t`, pero sin valores concretos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo dominio (identificacion de tiburones ballena) dentro del repositorio o en los resultados de busqueda. Existe el proyecto WhaleID (https://whaleid.org/) que utiliza siete redes neuronales para identificar ballenas jorobadas, pero no es directamente comparable por la diferencia de especie, enfoque (fotos subacuaticas vs. flancos) y tecnologia (redes neuronales vs. sistema deterministico). Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de aprendizaje automatico con pesos; es un sistema de software con una extraccion de caracteristicas determinista de 16 dimensiones. Su precision depende de la calidad de la deteccion y del catalogo preexistente, no de un entrenamiento con datos etiquetados.
- La licencia no esta especificada, por lo que el uso comercial o la redistribucion requieren contactar con el autor para aclarar los terminos.
- El sistema esta disenado para un MVP y puede carecer de robustez ante condiciones reales como oclusiones parciales, cambios de iluminacion o variaciones de angulo; la model card menciona "adversarial markers" en el fixture sintetico, pero no hay validacion con datos reales.
- La clasificacion `review` se utiliza cuando la evidencia es insuficiente, lo que implica que el sistema no es completamente autonomo y requiere supervision humana en casos ambiguos.
- No se documentan sesgos especificos, pero al depender de un catalogo global, la cobertura geografica y la diversidad de individuos pueden limitar la precision en regiones poco muestreadas.
- El backend CUDA es opcional y aislado; si se compila sin el toolkit, las funciones CUDA devuelven un error controlado, pero no se garantiza el mismo rendimiento en CPU.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mohamedrayyan/whale-shark-id-resnet18
- Proyecto relacionado (no afiliado): https://whaleid.org/
