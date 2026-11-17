# LlamaPal/LFM3-VL-2B-QAD-Q4_0-GGUF

## Resumen

LFM3-VL-2B-QAD-Q4_0-GGUF es una copia espejo del archivo `LFM3-VL-2B-QAD-Q4_0.gguf` publicado por Liquid AI, redistribuido por LlamaPal para su uso dentro de la aplicacion Android LlamaPal. Se trata de la cuantizacion Q4_0 en formato GGUF del modelo vision-lenguaje LFM3-VL-2B de Liquid AI, pensada para inferencia completamente offline en dispositivos moviles. El modelo original resuelve tareas de image-text-to-text: lectura de documentos, interpretacion de graficos, comprension de capturas de pantalla y conversacion general.

El repositorio no introduce ninguna modificacion sobre el archivo original: misma copia de bytes y mismo hash SHA-256 (`621c455376cb96a20891697deb9975c6fb47dd5ea98ed3ad1f3b7e8f24f0b1e6`), tomado del commit `1add221a5ea6` de LiquidAI/LFM3-VL-2B-GGUF. El peso total es de aproximadamente 1,0 GB, con un complemento adicional de 194 MB para el procesador de imagenes (projector multimodal). Los parametros totales reales en safetensors del modelo base son 1.728.801.600 (unos 1,73 mil millones), lo que lo situa en la categoria de modelos pequenos orientados a edge computing.

La relevancia de esta ficha radica en que documenta un artefacto de despliegue movil: no es un modelo nuevo ni un fine-tuning, sino el vehiculo concreto mediante el cual un modelo VLM de Liquid AI se distribuye a telefonos Android sin conexion a internet. Es util para desarrolladores que quieran integrar capacidades de vision-lenguaje en apps moviles mediante llama.cpp o aplicaciones derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL-2B de Liquid AI; arquitectura exacta no especificada en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 (aprox. 1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (este repositorio); el repositorio original LiquidAI/LFM3-VL-2B-GGUF contiene otras variantes GGUF, no detalladas aqui |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base LFM3-VL-2B (tipo de transformer, mecanismos de atencion, composicion del dataset de entrenamiento, numero de tokens, uso de RLHF/DPO). Lo unico verificable es que se trata de un modelo image-text-to-text de Liquid AI con aproximadamente 1,73 mil millones de parametros, que requiere un componente adicional de 194 MB para el procesamiento de imagenes, lo que sugiere un diseno con encoder visual separado y projector hacia el espacio de embeddings del modelo de lenguaje.

El artefacto de este repositorio es exclusivamente una cuantizacion Q4_0 realizada sobre el modelo base, empaquetada en GGUF para llama.cpp. No hay indicios de entrenamiento adicional, destilacion ni ajuste por parte de LlamaPal: la model card declara explicitamente que es una copia sin modificar del archivo de Liquid AI.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `conversational`).
- Comprension de imagenes en tareas image-text-to-text: lectura de documentos, interpretacion de graficos y comprension de capturas de pantalla de aplicaciones, segun la model card.
- Respuesta a preguntas cotidianas de caracter general.
- Ejecucion completamente offline en Android: sin internet, sin cuenta y sin envio de datos fuera del dispositivo.
- Carga en llama.cpp y en cualquier aplicacion construida sobre llama.cpp, al ser un GGUF estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no especificados).
- Modos especiales (thinking mode, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de chat offline en Android: el modelo se descarga una vez (1,0 GB + 194 MB) y queda operativo sin red, lo que lo hace adecuado para entornos sin conectividad o con requisitos estrictos de privacidad, ya que nada de lo que se escribe sale del telefono.
- Lectura de documentos en movilidad: fotografiar facturas, recibos, contratos o notas manuscritas y obtener un resumen o extraccion de datos, aprovechando la capacidad declarada de leer documentos con precision.
- Interpretacion de graficos e infografias: subir una captura de un grafico de barras o lineas y pedir una explicacion textual de tendencias, util para periodistas, analistas o estudiantes en campo.
- Soporte a la accesibilidad: descripcion de imagenes y capturas de pantalla para usuarios con discapacidad visual, ejecutada localmente para preservar la privacidad del contenido capturado.
- Asistencia en tareas de QA de aplicaciones moviles: analisis de capturas de pantalla de la propia app para detectar textos truncados, solapamientos o errores de maquetacion, sin subir imagenes a servicios externos.
- Integracion en pipelines llama.cpp fuera de Android: al ser un GGUF estandar, puede cargarse en herramientas de escritorio o servidores ligeros basadas en llama.cpp para prototipado rapido de funcionalidades VLM con huella de memoria reducida.
- Uso educativo en dispositivos de gama media: demostraciones de IA multimodal sin depender de GPU dedicada ni de servicios en la nube, adecuado para talleres y aulas con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 1,0 GB en Q4_0; sumando el add-on de vision de 194 MB, la huella de pesos ronda 1,2 GB, a la que hay que anadir el overhead de contexto y buffers de llama.cpp (estimacion orientativa, no confirmada en la informacion proporcionada).
- GPU recomendadas: no disponible; el modelo esta disenado para ejecucion en CPU de dispositivos Android mediante llama.cpp.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; por tamano, seria teoricamente viable en GPU con 4 GB o mas de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: llama.cpp y cualquier aplicacion construida sobre el (incluida LlamaPal para Android). Compatibilidad con vLLM, TGI u Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B (este repositorio, Q4_0 GGUF) | 1,73 B | no disponible | GGUF | LFM Open License v1.0 | Hugging Face + LlamaPal (Android) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos alternativos de tamano o tarea equivalentes, por lo que no se puede elaborar una comparativa numerica fiable.

## Limitaciones y advertencias

- Es un espejo de un tercero: LlamaPal no ha entrenado, ajustado ni evaluado el modelo; cualquier problema de calidad recae sobre el modelo base de Liquid AI.
- La cuantizacion Q4_0 introduce perdida de precision frente a pesos completos o NVFP4; puede degradar tareas de vision fina (OCR de textos pequenos, graficos densos).
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; por el tamano del modelo (1,73 B) es esperable una fiabilidad limitada en razonamiento complejo, aunque no hay datos que lo confirmen.
- Idiomas y contexto maximo no especificados: no se puede garantizar cobertura multilingue ni planificar cargas de contexto largo.
- Licencia LFM Open License v1.0: es una licencia "other" con terminos propios; antes de uso comercial es imprescindible revisar el texto completo en el repositorio original, ya que puede imponer restricciones adicionales a las de licencias permisivas estandar.
- Dependencia de llama.cpp: el rendimiento y la estabilidad dependen de la version del runtime y del backend movil empleado.
- Repositorio con cero descargas y cero likes en el momento de la ficha: no hay evidencia comunitaria de funcionamiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/LFM3-VL-2B-QAD-Q4_0-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo base cuantizado (NVFP4): https://huggingface.co/LiquidAI/LFM3-VL-2B-NVFP4
- Repositorio GGUF original: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Commit de origen del archivo: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF/tree/1add221a5ea6c047fcf1eaaf2d247939d7cf8849
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/blob/main/LICENSE
- LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
