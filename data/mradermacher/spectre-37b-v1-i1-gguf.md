# mradermacher/Spectre-37B-v1-i1-GGUF

## Resumen

Spectre-37B-v1-i1-GGUF es la version cuantizada con imatrix del modelo Spectre-37B-v1, desarrollado originalmente por TheDrummer y convertida a formato GGUF por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 36.500 millones de parametros (36.554.956.360 segun los pesos en safetensors del modelo base) orientado a uso conversacional y etiquetado para ingles. La model card del cuantizador lo describe explicitamente como un modelo de vision, con ficheros mmproj disponibles en el repositorio estatico asociado.

El valor de esta publicacion no reside en el modelo en si, sino en el trabajo de cuantizacion: mradermacher genera un conjunto amplio de variantes GGUF con y sin imatrix (desde Q2_K hasta Q6_K, incluyendo IQ1_S, IQ2_XXS, IQ3_XXS, IQ4_XS, entre otras), lo que permite ejecutar un modelo de 37B en hardware de consumo mediante llama.cpp y derivados. La cuantizacion con imatrix (importance matrix) reduce la perdida de calidad respecto a cuantizaciones estaticas del mismo tamano, especialmente en los rangos bajos de bits por peso.

La relevancia es practica: un modelo de este tamano con licencia no especificada y sin benchmarks publicados en la informacion disponible solo resulta evaluable mediante despliegue local. Esta ficha documenta lo que se puede afirmar con rigor a partir de los metadatos y advierte explicitamente de todo lo que no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; no se detalla en la informacion proporcionada) |
| Parametros totales | 36.554.956.360 (36,55B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL); incluye fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |
| Modelo base | TheDrummer/Spectre-37B-v1 |
| Tamano del repositorio | 31,2 GB |
| Modalidad | texto y vision (la model card indica que es un modelo de vision; los mmproj estan en el repo estatico) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, dimensiones ocultas o mecanismo de atencion. El unico dato estructural fiable es el recuento de parametros (36,55B) y la etiqueta `transformers` como libreria, lo que implica compatibilidad con el ecosistema Hugging Face.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones de codigo o multilingue), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La unica innovacion documentada en esta publicacion es el proceso de cuantizacion: mradermacher emplea cuantizacion ponderada con imatrix (importance matrix), un metodo que estima la importancia de cada tensor a partir de activaciones de calibracion y ajusta el error de cuantizacion en consecuencia. El repositorio incluye el propio fichero imatrix (`Spectre-37B-v1.imatrix.gguf`, 0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Existe ademas un repositorio hermano con cuantizaciones estaticas (sin imatrix) en `mradermacher/Spectre-37B-v1-GGUF`.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline asociado indican uso previsto para dialogo multi-turno.
- Procesamiento de vision: la model card afirma que es un modelo de vision; los ficheros mmproj (proyector multimodal) se distribuyen en el repositorio estatico, no en este.
- Inferencia local via GGUF: compatible con llama.cpp y cualquier runtime que consuma GGUF (Ollama, LM Studio, koboldcpp, entre otros).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`).
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.
- Audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M e IQ4_XS permiten ejecutar un modelo de 37B en GPUs con 24 GB de VRAM mediante offload parcial o total, algo inviable con los pesos en safetensors (aproximadamente 73 GB en fp16). Adecuado para prototipado sin coste de API.
- Asistentes conversacionales en ingles con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo; util en entornos con datos sensibles donde no se puede recurrir a servicios en la nube.
- Procesamiento de documentos con componente visual: si se emplea junto con los ficheros mmproj del repositorio estatico, el modelo puede abordar tareas de descripcion de imagenes o extraccion de informacion de capturas y documentos escaneados, siempre que el runtime soporte el proyector multimodal.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece el mismo modelo en mas de veinte variantes de cuantizacion, lo que lo convierte en un banco de pruebas para medir la degradacion de perplejidad entre IQ y K-quants sobre una misma arquitectura.
- Generacion de cuantizaciones propias: el fichero imatrix incluido permite a un equipo generar variantes a medida (por ejemplo, Q5_K_M con su propia matriz de calibracion) sin recalcular la importance matrix desde cero.
- Fine-tuning ligero sobre una base cuantizada: no recomendado directamente sobre GGUF, pero el modelo base en safetensors permite adaptaciones (LoRA) que luego se pueden recuantizar siguiendo el mismo flujo de mradermacher.
- Integracion en pipelines de CI/CD para pruebas de regresion de calidad: usar una variante Q4 como referencia rapida y comparable entre versiones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni los resultados de busqueda incluyen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de perplejidad comparativa entre cuantizaciones. Cualquier cifra de rendimiento atribuida a este modelo en esta ficha seria inventada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp16 del modelo base rondan los 73 GB; en GGUF, el tamano del repositorio completo es de 31,2 GB, pero cada variante individual ocupa una fraccion. Como referencia orientativa por bits por peso: Q4_K_M aproximadamente 21-23 GB, Q5_K_M aproximadamente 25-27 GB, Q6_K aproximadamente 29-31 GB, IQ2_XXS aproximadamente 10-11 GB. Estas cifras son estimaciones por aritmetica de bits y no mediciones publicadas.
- GPU recomendadas: para Q4_K_M o IQ4_XS, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite carga casi completa; para Q6_K se recomienda A100 40 GB, H100 o RTX 6000 Ada. Para variantes IQ2/IQ3, GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) con offload parcial de capas a CPU.
- Cabe en GPU de consumo: si, en las cuantizaciones Q2 a Q4 con 16-24 GB de VRAM; las variantes Q5 y Q6 requieren 24 GB o mas y pueden necesitar offload.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa en el momento de redactar esta ficha; para esos motores habria que servir el modelo base en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este modelo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo para establecer una comparativa cuantitativa fiable. La siguiente tabla compara solo caracteristicas objetivas y verificables de la categoria (modelos densos de ~30-40B con versiones GGUF comunitarias); los datos de los modelos alternativos se indican como no disponibles cuando no se han verificado en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| Spectre-37B-v1 (esta ficha) | 36,55B | no disponible | no disponible | Si (imatrix y estatico) | Vision segun model card; solo ingles |
| Modelo alternativo de ~34B de la familia Yi | ~34B | no disponible | no disponible | Si (comunidad) | Categoria similar de tamano |
| Modelo alternativo de ~32B de la familia Qwen | ~32B | no disponible | no disponible | Si (oficial y comunidad) | Suele incluir multilingue |
| Modelo alternativo de ~27-32B de la familia Gemma | ~27-32B | no disponible | no disponible | Si (comunidad) | Categoria similar de tamano |

No se ha verificado en la informacion proporcionada ningun resultado de benchmark que permita afirmar superioridad o inferioridad frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no especificada: la ausencia de licencia explicita en los metadatos impide asumir permisos de uso comercial. Es imprescindible consultar el repositorio del modelo base (TheDrummer/Spectre-37B-v1) antes de cualquier despliegue en produccion.
- Solo ingles: el modelo esta etiquetado unicamente para `en`; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Sin benchmarks: no hay evidencia publica de calidad en razonamiento, codigo o matematicas. Cualquier decision de adopcion debe basarse en evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; sin datos de alineacion (RLHF/DPO) documentados, no se puede acotar su magnitud.
- Sesgos: no documentados. Al no conocerse la composicion del corpus de entrenamiento, no es posible evaluar sesgos de genero, raza o ideologicos.
- Degradacion por cuantizacion: las variantes IQ1 e IQ2 sufren perdida notable de calidad frente a Q4 o superiores; para uso en produccion se recomienda Q4_K_M o superior.
- Vision condicionada al runtime: los ficheros mmproj no estan en este repositorio sino en el estatico; sin ellos y sin un runtime que soporte el proyector multimodal, el modelo funciona solo como texto.
- Fecha de creacion futura en los metadatos: el repositorio figura creado el 2026-11-08, lo que puede indicar un error de metadatos o una fecha de publicacion programada; conviene verificar la integridad de los ficheros antes de descargarlos.
- Cero descargas y cero likes en el momento de la consulta: no hay senal de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/mradermacher/Spectre-37B-v1-i1-GGUF
- Arbol de ficheros: https://huggingface.co/mradermacher/Spectre-37B-v1-i1-GGUF/tree/main
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/Spectre-37B-v1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Spectre-37B-v1
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#Spectre-37B-v1-i1-GGUF
- Peticiones de cuantizacion y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion por Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
