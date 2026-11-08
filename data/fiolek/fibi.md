# fiolek/Fibi

## Resumen

Fibi es un modelo de lenguaje publicado en Hugging Face por el usuario fiolek bajo el identificador `fiolek/Fibi`. El repositorio contiene pesos en formato GGUF, lo que indica que esta pensado para inferencia con llama.cpp u otros runners compatibles con este formato. El modelo declara 4.647.450.147 parametros totales (aproximadamente 4,6 mil millones), un tamano que lo situa en la categoria de modelos pequenos/medianos aptos para hardware de consumo.

Los tags del repositorio incluyen `gguf`, `imatrix` y `conversational`, lo que sugiere que se distribuye como un modelo cuantizado con una matriz de importancia (imatrix) para mejorar la calidad de la cuantizacion, y que esta orientado a uso conversacional. El tag `endpoints_compatible` indica que puede desplegarse a traves de la infraestructura de Inference Endpoints de Hugging Face.

La busqueda web ha devuelto una referencia a un proyecto llamado FIBI desarrollado para el sector financiero (Trading Central), pero no existe confirmacion de que ese proyecto corresponda a este repositorio concreto; se trata de una coincidencia de nombre no verificada. La informacion disponible en el propio repositorio es muy limitada: no se publican ni la licencia, ni los idiomas, ni la arquitectura, ni datos de entrenamiento, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (con imatrix); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (tamano del repo: 4,5 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la ficha de Hugging Face. El numero de parametros (unos 4,6 mil millones) es compatible con familias de transformers densos de esa escala, pero no hay confirmacion de que Fibi sea un transformer denso, un modelo MoE ni una arquitectura hibrida. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico indicio tecnico relevante es la presencia de una imatrix en la distribucion GGUF. Las matrices de importancia se calculan a partir de datos de calibracion para ponderar que pesos deben preservarse con mayor precision durante la cuantizacion, lo que suele traducirse en una perdida de calidad menor en niveles bajos de bits. No se especifica que dataset de calibracion se utilizo.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Inferencia en formato GGUF: compatible con llama.cpp y con runners que consumen este formato.
- Despliegue mediante endpoints compatibles segun el tag `endpoints_compatible`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de chatbots locales: al distribuirse en GGUF con un tamano de repo de 4,5 GB, puede cargarse en equipos de consumo para experimentar con conversacion multi-turno sin depender de APIs externas.
- Asistentes personales en el escritorio: su escala permite ejecutarlo junto a otras aplicaciones en una maquina con GPU de gama media o incluso en CPU, integrandolo en herramientas de escritorio mediante llama.cpp.
- Evaluacion de tecnicas de cuantizacion: la presencia de imatrix lo hace util como caso de estudio para comparar la calidad de distintos niveles de cuantizacion GGUF frente a los pesos originales.
- Despliegue en Hugging Face Inference Endpoints: el tag `endpoints_compatible` permite levantarlo como servicio gestionado para pruebas de concepto conversacionales.
- Generacion de texto offline en entornos sin conectividad: al ser un modelo pequeno y autocontenido en GGUF, puede ejecutarse en portatiles o dispositivos con recursos limitados para tareas de redaccion asistida.
- Base para fine-tuning o destilacion experimental: sus 4,6 mil millones de parametros lo hacen manejable para experimentos de ajuste en una sola GPU, siempre que se disponga de los pesos en un formato entrenable (no confirmado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con un repo GGUF de 4,5 GB, la cuantizacion incluida ocupa aproximadamente ese espacio; niveles de 4 bits de un modelo de 4,6 mil millones de parametros suelen situarse en torno a 3-4 GB, aunque el nivel exacto no se especifica.
- GPU recomendadas: no disponibles en la informacion del repositorio. Por tamano, cabria esperar ejecucion en GPUs de consumo con 6-8 GB de VRAM o mas, pero es una estimacion basada solo en el numero de parametros.
- Cabida en GPU de consumo: probable por escala, aunque no confirmado por el autor.
- Opciones de despliegue: llama.cpp y runners compatibles con GGUF; Inference Endpoints de Hugging Face segun el tag del repositorio; vLLM, TGI u Ollama no estan confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de rendimiento ni detalles que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no puede asumirse permiso para uso comercial ni para redistribucion; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Idiomas no documentados: se desconoce la cobertura linguistica real y la calidad en castellano.
- Sin benchmarks: no hay evidencia publica de calidad en razonamiento, codigo o matematicas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, agravado por la falta de documentacion sobre alineacion.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin conocer la ventana real.
- Trazabilidad dudosa: la posible relacion con el proyecto FIBI de Trading Central no esta confirmada y no debe asumirse.
- Cuantizacion GGUF: puede introducir degradacion respecto a los pesos originales, especialmente si el nivel de bits es bajo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fiolek/Fibi
- Articulo sobre el proyecto FIBI en Trading Central (relacion con este repositorio no confirmada): https://www.tradingcentral.com/blog/what-it-takes-to-train-ai-for-finance
