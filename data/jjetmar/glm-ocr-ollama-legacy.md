# JJetmar/glm-ocr-ollama-legacy

## Resumen

GLM-OCR (Ollama legacy build) es una redistribucion en formato GGUF del modelo de reconocimiento optico de caracteres GLM-OCR desarrollado originalmente por zai-org (Zhipu AI). El repositorio lo publica el usuario JJetmar con el objetivo de preservar una version concreta del modelo que Ollama servia antes de republicarlo para su nuevo motor basado en llama.cpp (Ollama 0.40, octubre de 2026). Se trata, por tanto, de una copia sin modificaciones del artefacto original, pensada para entornos que aun ejecutan versiones antiguas de Ollama (0.39 o anteriores).

El modelo resuelve la tarea especifica de extraccion de texto a partir de imagenes (OCR), empaquetado para su uso directo con Ollama mediante un Modelfile que define plantilla, renderer y parser especificos (`glm-ocr`). Cuenta con aproximadamente 1.107 millones de parametros (unos 1,1 mil millones), lo que lo situa en la categoria de modelos ligeros desplegables en hardware de consumo.

Su relevancia es fundamentalmente de compatibilidad y reproducibilidad: permite a quienes dependen de la version legacy del runtime de Ollama seguir usando el modelo sin migrar, y ofrece un artefacto con hash verificado para pipelines que requieran fijar la version exacta del modelo. No introduce mejoras respecto al original; su valor es la preservacion de un binario concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.107.405.824 (aprox. 1,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizacion concreta no especificada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo en la informacion proporcionada (no se detalla si es un transformer denso, un modelo multimodal con encoder visual, ni la composicion de sus capas). El repositorio es una redistribucion del modelo base `zai-org/GLM-OCR` en formato GGUF, sin cambios en los pesos; cualquier detalle arquitectonico debe consultarse en la model card del modelo original.

Tampoco se dispone de datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato tecnico verificable es el tamano del repositorio (2,2 GB) y el numero de parametros (1.107.405.824), coherente con un modelo ligero cuantizado en GGUF. El artefacto incluye un hash sha256 documentado (`65493e1f85b9ea4ba3ed793515fde13cbdbea7d74ad2c662b566b146eab0081e`) que permite verificar la integridad de la descarga.

## Capacidades

- Reconocimiento optico de caracteres (OCR): extraccion de texto a partir de imagenes, tarea principal del modelo.
- Integracion nativa con Ollama mediante renderer y parser especificos (`glm-ocr`), lo que sugiere un formato de entrada/salida adaptado a la tarea OCR.
- Ejecucion local en el motor propio de Ollama (versiones 0.39 o anteriores).
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision general, audio: no disponible (solo se documenta la tarea OCR).

## Casos de uso

- Digitalizacion de documentos en entornos con Ollama legacy: organizaciones que mantienen versiones antiguas de Ollama (0.39 o inferiores) pueden seguir procesando imagenes de documentos sin actualizar su infraestructura, usando este artefacto como sustituto directo del modelo original.
- Pipelines reproducibles con version fijada: equipos que necesitan garantizar que el modelo no cambia entre ejecuciones pueden fijar este repositorio y verificar el hash sha256 documentado, evitando que una actualizacion del modelo en el registro de Ollama altere los resultados.
- Extraccion de texto en entornos air-gapped: al ser un GGUF de 2,2 GB descargable y ejecutable localmente, puede desplegarse en maquinas sin acceso a internet, util para procesar documentacion sensible sin salir de la red corporativa.
- Procesamiento por lotes de imagenes escaneadas: con ~1,1 B de parametros, el modelo cabe en GPUs de consumo y permite procesar volumenes moderados de escaneos (facturas, formularios, articulos) en una estacion de trabajo.
- Archivado y preservacion digital: bibliotecas y archivos que necesitan reconstruir resultados historicos pueden usar esta copia concreta para reproducir exactamente el comportamiento del modelo en una fecha determinada.
- Pruebas de regresion en migraciones: antes de pasar a Ollama 0.40 o al runner de llama.cpp, un equipo puede comparar las salidas de esta version legacy con las del nuevo artefacto para detectar diferencias de calidad en la extraccion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~1,1 B de parametros en GGUF, la huella de pesos ronda los 2,2 GB del repositorio; con overhead de contexto y runtime, se estima un consumo de VRAM en el rango de 3 a 5 GB, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU con al menos 6-8 GB de VRAM deberia poder alojarlo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores; no confirmado por el autor.
- Opciones de despliegue: Ollama en version 0.39 o anterior (probado con 0.24.0). El autor no documenta compatibilidad con vLLM, llama.cpp directo ni TGI; el modelo esta empaquetado especificamente para el motor propio de Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| JJetmar/glm-ocr-ollama-legacy | ~1,1 B | no disponible | GGUF | MIT | Disponible (92 descargas) |
| zai-org/GLM-OCR | no disponible | no disponible | no disponible | MIT | Modelo original |
| Alternativas OCR de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos OCR comparables en la documentacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento con alternativas.

## Limitaciones y advertencias

- Version legacy: requiere Ollama 0.39 o anterior; no funciona con el runner de llama.cpp introducido en Ollama 0.40, lo que limita su uso a entornos no actualizados.
- Sin mantenimiento: es una copia congelada de un artefacto antiguo; no recibira correcciones ni mejoras del autor original.
- Informacion tecnica incompleta: se desconocen arquitectura, contexto, idiomas y cuantizacion exacta, lo que dificulta evaluar su idoneidad para casos distintos del OCR.
- Riesgo de alucinacion: no evaluado en la informacion disponible; como todo modelo de lenguaje aplicado a OCR, puede generar texto plausible pero incorrecto en imagenes de baja calidad.
- Sesgos: no documentados.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario debe verificar que la licencia del modelo base (`zai-org/GLM-OCR`) se mantiene y que la redistribucion cumple sus terminos.
- Verificacion de integridad: se recomienda comprobar el hash sha256 documentado antes de desplegar, dado que el artefacto procede de un tercero y no del autor original.
- Trazabilidad: el repositorio tiene 0 likes y 92 descargas; conviene contrastar su procedencia antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JJetmar/glm-ocr-ollama-legacy
- Modelo base: https://huggingface.co/zai-org/GLM-OCR
