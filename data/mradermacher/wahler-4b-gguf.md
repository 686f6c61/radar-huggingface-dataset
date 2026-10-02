# mradermacher/Wahler-4B-GGUF

## Resumen

Wahler-4B-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF publicado por el usuario mradermacher a partir del modelo mertkayacs/Wahler-4B. Mradermacher es un perfil de Hugging Face especializado en generar versiones cuantizadas (estáticas y con imatrix) de modelos abiertos, de forma que puedan ejecutarse con llama.cpp y herramientas compatibles. Este repositorio no contiene los pesos originales en safetensors, sino únicamente los ficheros GGUF derivados.

El nombre del modelo sugiere un tamano de 4.000 millones de parametros, pero el unico dato de recuento disponible (333.514.240 parametros, es decir, unos 333 millones) apunta a un modelo mucho mas pequeno. El tamano total del repositorio (1,0 GB) y el hecho de que contenga doce cuantizaciones distintas refuerzan esa lectura: un modelo de 4B en F16 ocuparia por si solo unos 8 GB. La discrepancia no se explica en la model card y deberia verificarse antes de cualquier uso.

La ficha se limita a documentar lo que consta en la informacion proporcionada. No hay datos publicados sobre arquitectura, datos de entrenamiento, idiomas, licencia ni benchmarks, por lo que buena parte de los apartados quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 333.514.240 (unos 333 M) segun el recuento de safetensors indicado; el nombre del repositorio declara 4B |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas; quantize_version 2, output_tensor_quantised 1, convert_type hf) |
| Modelo base | mertkayacs/Wahler-4B |
| Tamano del repositorio | 1,0 GB |
| Fecha de creacion | 2026-10-01 |
| Fecha de actualizacion | 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base mertkayacs/Wahler-4B. La model card del repositorio GGUF unicamente documenta el proceso de conversion, del que se deduce que los pesos originales estaban en formato Hugging Face (convert_type: hf) y que la cuantizacion se realizo de forma estatica con la version 2 del pipeline de cuantizacion de mradermacher (quantize_version: 2, output_tensor_quantised: 1). No se indica si los pesos estan cuantizados por tensor o por bloque mas alla de esa marca.

No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones arquitectonicas (atencion lineal, decodificacion especulativa, mezcla de expertos, modelos de espacio de estados, etc.). Toda esa informacion figura como no disponible.

## Capacidades

- No se documenta ninguna capacidad especifica del modelo en la informacion disponible.
- Por el formato de publicacion (GGUF), el unico uso previsto es la inferencia de generacion de texto con motores compatibles como llama.cpp, Ollama, koboldcpp o LM Studio.
- No hay evidencia documentada de soporte de tool calling ni de function calling.
- No hay evidencia documentada de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia documentada de capacidades multilingues ni de una lista de idiomas soportados.
- No hay evidencia documentada de modo de razonamiento (thinking mode), vision, audio ni otras modalidades.
- No hay evidencia documentada de capacidades de generacion de codigo o de matematicas.

## Casos de uso

Los casos que se enumeran a continuacion son aplicaciones plausibles dada la naturaleza del artefacto (un conjunto de cuantizaciones GGUF de un modelo de parametros reducidos), pero no estan respaldados por evaluaciones publicadas del modelo. Deben validarse empiricamente antes de llevarlos a produccion.

- Inferencia local en CPU: al tratarse de ficheros GGUF de un modelo de aproximadamente 333 M de parametros, las cuantizaciones Q4_K_M y Q2_K ocupan del orden de 0,2 GB y 0,13 GB, respectivamente, por lo que el modelo puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp.
- Prototipado de pipelines de generacion de texto: permite montar un endpoint de pruebas con llama-cpp-python o el servidor de llama.cpp antes de escalar a un modelo mayor, con un consumo de memoria minimo.
- Evaluacion de cuantizaciones: el repositorio incluye doce variantes (desde x-f16 hasta Q2_K e IQ4_XS), lo que lo convierte en un banco de pruebas para medir la degradacion de calidad segun el nivel de cuantizacion en una misma familia de pesos.
- Despliegue en dispositivos de bajos recursos: el tamano reducido de las cuantizaciones mas agresivas permite ejecutar el modelo en placas tipo Raspberry Pi o en contenedores con limites de memoria muy estrictos, siempre que el motor de inferencia soporte GGUF.
- Automatizacion de tareas de texto ligeras: clasificacion, etiquetado o resumen de cadenas cortas en lotes, siempre que una evaluacion previa confirme que la calidad del modelo es suficiente para la tarea concreta.
- Reproducibilidad de la cadena de cuantizacion: sirve como referencia para verificar el resultado del pipeline estatico de mradermacher (quantize_version 2) partiendo del modelo base, util para equipos que necesiten auditar sus propias cuantizaciones.
- Pruebas de integracion de infraestructura: validar el funcionamiento de servidores compatibles con GGUF (Ollama, vLLM con backend GGUF, TGI alternativo, LM Studio) sin reservar recursos de GPU significativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base mertkayacs/Wahler-4B. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

Las cifras de VRAM que aparecen a continuacion son estimaciones derivadas del recuento de parametros indicado (333.514.240) aplicando la relacion habitual de bytes por parametro de cada nivel de cuantizacion; no proceden de mediciones publicadas.

- VRAM estimada en el escenario de ~333 M de parametros: unos 0,67 GB en x-f16, unos 0,35 GB en Q8_0, unos 0,25 GB en Q5_K_M y unos 0,20 GB en Q4_K_M. Con contexto largo, el consumo de la cache KV se suma a estas cifras.
- VRAM estimada si el modelo fuese realmente de 4B (escenario que el nombre sugiere y que el recuento de parametros contradice): unos 8 GB en F16, unos 2,5 GB en Q4_K_M y unos 1,6 GB en Q2_K.
- GPU recomendadas: dado el tamano, cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4060, RTX 4090). No se requiere A100, H100 ni hardware de centro de datos.
- Compatibilidad con GPU consumer: si, en todas las gamas, incluida la ejecucion exclusiva en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y cualquier servidor compatible con GGUF. Para vLLM o TGI habria que comprobar el soporte especifico de la arquitectura del modelo base, que no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre la arquitectura, el contexto, el rendimiento ni la licencia del modelo base mertkayacs/Wahler-4B, por lo que no es posible establecer una comparacion significativa con alternativas de la misma categoria. El unico dato contextual es que mradermacher publica repositorios GGUF equivalentes para otros modelos de nombre similar (por ejemplo, mradermacher/aiops-qwen-4b-GGUF y mradermacher/manu-s1-4b-GGUF), pero se trata de modelos distintos y no comparables entre si.

## Limitaciones y advertencias

- Discrepancia de tamano sin resolver: el nombre del repositorio indica 4B mientras que el recuento de parametros disponible es de aproximadamente 333 M. Hay que verificar el modelo base antes de asumir cualquier cifra de tamano, coste o capacidad.
- Licencia no especificada: la model card del repositorio GGUF no declara licencia. No puede asumirse que el uso comercial este permitido; habria que consultar la licencia del modelo base mertkayacs/Wahler-4B, que tampoco consta en la informacion disponible.
- Ausencia total de documentacion tecnica: no hay datos sobre arquitectura, contexto, idiomas, datos de entrenamiento ni alineamiento. Cualquier afirmacion sobre capacidades seria especulativa.
- Riesgo de alucinacion no evaluado: al no haber benchmarks ni evaluaciones publicadas, no existe ninguna medida de fiabilidad factual del modelo.
- Idiomas desconocidos: no se puede garantizar un rendimiento aceptable en castellano ni en ningun otro idioma.
- Quantizaciones de baja precision incluidas: las variantes Q2_K, Q3_K_S y Q3_K_M suelen introducir una degradacion notable de la calidad respecto a Q4_K_M o superiores. Para uso real conviene partir de Q5_K_M o Q8_0 salvo que la restriccion de memoria sea critica.
- Repositorio sin validacion de la comunidad: cero descargas y cero likes en la fecha de creacion indicada (2026-10-01), lo que implica ausencia de retroalimentacion o verificacion independiente.
- Uso en produccion no recomendado sin evaluacion previa: no hay informacion sobre estabilidad, formato de plantilla de chat ni tokens especiales, lo que puede provocar comportamientos incorrectos al integrarlo en aplicaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wahler-4B-GGUF
- Modelo base: https://huggingface.co/mertkayacs/Wahler-4B
- Perfil del cuantizador en Hugging Face: https://huggingface.co/mradermacher
- Repositorio GGUF relacionado del mismo autor: https://huggingface.co/mradermacher/aiops-qwen-4b-GGUF
- Repositorio GGUF relacionado del mismo autor: https://huggingface.co/mradermacher/manu-s1-4b-GGUF
- Directorio de modelos del autor: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- Guia de LLM locales por nivel de VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
- Calculadora de hardware para modelos locales: https://llmhardware.io/
