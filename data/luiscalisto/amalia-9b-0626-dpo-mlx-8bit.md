# luiscalisto/AMALIA-9B-0626-DPO-MLX-8bit

## Resumen

AMALIA-9B-0626-DPO-MLX-8bit es una redistribución cuantizada a 8 bits del modelo AMALIA-9B-0626-DPO, publicada por el usuario luiscalisto a través del repositorio `luiscalisto/AMALIA-9B-0626-DPO-MLX-8bit` en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos al formato MLX (Apple Silicon) realizada con `mlx-lm` 0.31.3 el 11 de octubre de 2026, pensada para ejecutar el modelo en Macs con memoria unificada sin depender de CUDA.

El modelo original pertenece a la familia AMALIA, desarrollada por un consorcio de universidades y centros de investigación portugueses (NOVA, Técnico, Coimbra, Porto, Minho y FCT) con financiación del Gobierno de Portugal. Se construyó continuando el preentrenamiento de EuroLLM con datos de portugués europeo (pt-PT), seguido de un ajuste supervisado (SFT) y una fase de optimización por preferencias (DPO). Cuenta con 9.152.319.488 parámetros y una ventana de contexto de 32.000 tokens, con fecha de corte de conocimiento en junio de 2024.

La relevancia de este artefacto concreto es práctica: permite ejecutar localmente un modelo de 9B especializado en portugués europeo en hardware de Apple con 24 GB de memoria unificada, manteniendo la calidad de escritura que, según el autor de la conversión, se degradaría con una cuantización de 4 bits. Es, por tanto, un artefacto de despliegue orientado a inferencia local en Mac, con licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama` en el repositorio; derivado del preentrenamiento continuado de EuroLLM) |
| Parametros totales | 9.152.319.488 (9,15 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | 8 bits (cuantizacion MLX por defecto de `mlx_lm.convert`, herramienta `mlx-lm` 0.31.3) |
| Idiomas soportados | Portugues europeo (pt-PT) como idioma principal; portugues y ingles dentro del alcance declarado |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX (no GGUF, no safetensors estandar de `transformers`) |

Datos adicionales del repositorio: tamano del repo 9,7 GB; libreria declarada `mlx`; pipeline no disponible; 0 descargas y 0 likes en el momento de la consulta; fecha de creacion 2026-10-11.

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only con la etiqueta `llama` en los metadatos del repositorio, sin que la informacion disponible detalle el numero de capas, cabezas de atencion, uso de GQA ni la funcion de activacion. Lo que si se documenta es el proceso de construccion: el consorcio AMALIA partio de EuroLLM y continuo su preentrenamiento con datos de portugues europeo, ampliando la ventana de contexto hasta 32.000 tokens. Posteriormente se aplico un ajuste supervisado (SFT) y una fase de DPO, lo que explica el sufijo del identificador del modelo base. La fecha de corte de conocimiento es junio de 2024 y la publicacion del modelo base se produjo el 1 de julio de 2026.

Por lo que respecta a este repositorio en concreto, no hay entrenamiento adicional: es una conversion de pesos. Se genero con `mlx-lm` 0.31.3 aplicando los valores por defecto de cuantizacion a 8 bits de `mlx_lm.convert`. El autor justifica explicitamente la eleccion de 8 bits frente a 4 bits para preservar la calidad de escritura, objetivo principal del modelo, y senala que el resultado ocupa aproximadamente 9,7 GB, lo que cabe con holgura en un Mac de 24 GB de memoria unificada. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni variantes hibridas.

## Capacidades

- Generacion de texto en portugues europeo (pt-PT) con calidad de redaccion cuidada, que es el proposito declarado del modelo base.
- Cobertura secundaria de portugues (en general) e ingles, segun el alcance de idiomas declarado por el consorcio.
- Procesamiento de contexto largo: la ventana de 32.000 tokens permite manejar documentos extensos, conversaciones multi-turno prolongadas y resumen de corpus de tamano medio.
- Ajuste por preferencias (DPO) sobre una base con SFT: el comportamiento esperado es de instrucciones alineadas y respuestas mas utiles que un modelo unicamente preentrenado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el repositorio no declara modalidades adicionales.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Redaccion y edicion en portugues europeo: el modelo esta optimizado para tareas de escritura en pt-PT, de modo que puede emplearse para generar borradores, reescribir textos o adaptar registros linguisticos manteniendo las convenciones ortograficas y de estilo de Portugal, no de Brasil.
- Atencion al cliente en portugues: con 32.000 tokens de contexto se pueden mantener conversaciones multi-turno con historial extenso y documentacion de producto insertada en el prompt, algo util para soporte tecnico o comercial dirigido al mercado portugues.
- Resumen y analisis de documentacion larga: contratos, informes tecnicos o actas de decenas de paginas pueden procesarse en una sola pasada sin fragmentacion, aprovechando la ventana de contexto.
- Asistencia a la traduccion portugues-ingles: el modelo declara cobertura de ambos idiomas, por lo que resulta adecuado como apoyo en traduccion asistida o en la revision de traducciones existentes dentro de ese par.
- Procesamiento local con privacidad de datos: al ejecutarse en Apple Silicon via MLX, el modelo permite desplegar flujos de generacion de texto sin enviar datos a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Prototipado e investigacion en PLN para portugues: el acceso libre bajo Apache 2.0 facilita su uso como linea base en experimentos academicos, evaluaciones de sesgo linguistico o comparativas de cuantizacion.
- Generacion aumentada por recuperacion (RAG) sobre corpus en portugues: el contexto de 32.000 tokens permite insertar varios fragmentos recuperados junto con la pregunta, reduciendo la necesidad de estrategias de troceado agresivas.
- Despliegue en portatiles de desarrollo: desarrolladores con un Mac de 24 GB pueden integrar el modelo en herramientas internas de generacion de texto, resumen o extraccion de informacion sin coste de GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas de evaluacion (MMLU, GSM8K, HumanEval ni otras), y tampoco se han proporcionado numeros procedentes del repositorio del modelo base. En consecuencia, no se presentan tablas comparativas de rendimiento, y no deben extrapolarse cifras de la familia EuroLLM sin verificacion directa en la model card original.

## Requisitos de hardware

- VRAM / memoria unificada estimada: aproximadamente 9,7 GB solo para los pesos en 8 bits, segun el tamano declarado del repositorio. Hay que anadir el coste de la cache KV y de las activaciones, que crece con la longitud de contexto; a 32.000 tokens la reserva total puede situarse claramente por encima de los 11-12 GB, aunque no se dispone de una medicion oficial.
- Mac recomendado: el autor indica que el modelo cabe con holgura en un Mac con 24 GB de memoria unificada, que es el escenario objetivo de esta conversion.
- Mac con 16 GB: el modelo podria cargarse, pero el margen para contexto largo y otras aplicaciones seria muy reducido; se recomienda limitar la longitud de contexto.
- Mac con 32 GB o mas: permite trabajar con la ventana completa de 32.000 tokens y varios procesos simultaneos con holgura.
- GPU NVIDIA (A100, H100, RTX 4090) y GPU AMD: no aplicable a este artefacto, porque MLX solo se ejecuta en Apple Silicon. Para esos entornos habria que partir del modelo base en safetensors estandar o generar una cuantizacion GGUF/AWQ/GPTQ desde el repositorio original.
- Opciones de despliegue: `mlx-lm` (carga y generacion en Python), servidor compatible con la API de OpenAI que incluye `mlx-lm`, y cualquier herramienta que consuma pesos MLX. No es directamente desplegable en vLLM, llama.cpp, Ollama ni TGI sin reconvertir los pesos desde el modelo base.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta conversion ni para el modelo base en hardware Apple.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMALIA-9B-0626-DPO-MLX-8bit (este repositorio) | 9,15 B | 32.000 tokens | safetensors MLX, 8 bits | Apache 2.0 | HuggingFace, 0 descargas |
| amalia-llm/AMALIA-9B-0626-DPO (modelo base) | 9,15 B (mismo modelo) | 32.000 tokens | safetensors estandar, precision completa (bf16/fp16, no confirmado) | Apache 2.0 | HuggingFace |
| EuroLLM-9B (familia predecesora) | En torno a 9 B (cifra exacta no disponible) | No disponible | safetensors estandar | No disponible en la informacion proporcionada | HuggingFace |

La comparacion relevante aqui es de formato y despliegue, no de capacidad: este repositorio y el modelo base comparten pesos y arquitectura, y difieren unicamente en la cuantizacion y el empaquetado. No se dispone de datos de rendimiento comparativos entre la version de 8 bits y la version de precision completa, ni con otras alternativas de la misma categoria (modelos de ~9 B orientados a portugues o a lenguas ibericas). Cualquier comparacion de calidad deberia hacerse con una evaluacion propia sobre el modelo base antes de asumir la equivalencia de la version cuantizada.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: la conversion a 8 bits introduce un error numerico respecto al modelo base. Aunque el autor eligio 8 bits precisamente para minimizar el impacto en la calidad de escritura, no se aportan mediciones que cuantifiquen esa perdida.
- Dependencia de plataforma: los pesos estan en formato MLX y solo se ejecutan en Apple Silicon. No son utilizables en GPU NVIDIA, AMD ni en entornos de servidor x86 convencionales sin reconversion desde el modelo base.
- Cobertura linguistica limitada: el foco es el portugues europeo, con portugues e ingles dentro del alcance. El rendimiento en castellano, catalan, gallego u otras lenguas no esta documentado y probablemente sea inferior.
- Fecha de corte de conocimiento: junio de 2024. El modelo no conoce hechos posteriores a esa fecha y puede generar informacion desactualizada sobre eventos, productos o normativa recientes.
- Riesgo de alucinacion: es un modelo de 9 B con ajuste por preferencias; puede producir afirmaciones plausibles pero incorrectas, especialmente en tareas factuales, citas o calculos. Requiere verificacion en flujos de produccion.
- Sesgos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o estereotipos para este modelo ni para su base. La composicion del corpus de preentrenamiento en portugues europeo no esta detallada en la informacion disponible.
- Ausencia de benchmarks: no hay metricas publicadas que permitan estimar su rendimiento frente a alternativas, lo que dificulta justificar su eleccion en un proyecto en produccion sin una evaluacion propia previa.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, y actualizacion el mismo dia de la creacion. Es una publicacion reciente sin validacion por parte de la comunidad.
- Licencia y atribucion: Apache 2.0 permite uso comercial y modificacion, pero exige conservar los avisos de copyright y la atribucion. Debe citarse a los autores del modelo original y no presentar esta conversion como un modelo distinto.
- Trazabilidad de la conversion: el repositorio de origen del artefacto de conversion es `llm-mlx-conversions`, una utilidad del propio autor de la cuantizacion; conviene verificar la integridad de los pesos frente al modelo base antes de un despliegue critico.

## Enlaces

- Repositorio de esta conversion: https://huggingface.co/luiscalisto/AMALIA-9B-0626-DPO-MLX-8bit
- Modelo base: https://huggingface.co/amalia-llm/AMALIA-9B-0626-DPO
- Repositorio del modelo base citado en la model card: https://huggingface.co/amalia-llm/AMALIA-9B-0626-DPO
- Herramienta de conversion `mlx-lm`: https://github.com/ml-explore/mlx-lm
- Utilidad de publicacion de cuantizaciones MLX usada por el autor: https://codeberg.org/lcalisto/llm-mlx-conversions
- Resultados de busqueda web: la busqueda no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos no guardan relacion con el artefacto y se han descartado.
