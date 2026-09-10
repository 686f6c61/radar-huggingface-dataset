# HarsathV/llava-rad-iu-v3

## Resumen

llava-rad-iu-v3 (checkpoint-531) es un adaptador LoRA publicado por HarsathV para el modelo multimodal medico microsoft/LLaVA-Rad, cuya base es vicuna-7b-v1.5 combinada con un vision tower BiomedCLIP-CXR 518 congelado. El adaptador se ha entrenado sobre 2837 pares imagen-informe de la coleccion publica open-IU, con el objetivo de generar borradores de informes radiologicos a partir de radiografias de torax. El repositorio tiene un tamano de 0.4 GB e incluye el adaptador, el `adapter_config.json`, el `config.json` de carga y el fichero `non_lora_trainables.bin` con el `mm_projector` reentrenado.

La relevancia de esta publicacion es acotada y muy especifica: no es un modelo nuevo, sino un ajuste fino reproducible de un pipeline existente, con una mejora medida sobre el conjunto de test retenido de IU (n=500) frente al baseline oficial sin ajustar, tanto en RadGraph rg_er (0.3503 frente a 0.2877) como en ROUGE-L (0.2794 frente a 0.2037). El autor lo describe explicitamente como software de investigacion que produce informes en borrador para revision humana, no como un sistema de diagnostico.

El checkpoint se presenta como un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin pipeline declarado. Su uso previsto es la evaluacion academica y la reproducibilidad de experimentos sobre generacion de informes de radiologia de torax, no el despliegue clinico directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA multimodal (vision encoder + proyector + LLM decoder) sobre microsoft/LLaVA-Rad; ajuste mediante adaptador LoRA |
| Parametros totales | No disponible como cifra unica. Modelo base vicuna-7b-v1.5 (aproximadamente 7000 millones de parametros) mas vision tower BiomedCLIP-CXR 518 congelado; el repositorio solo contiene el adaptador y el proyector reentrenado (0.4 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. La model card indica explicitamente que no se debe cuantizar el adaptador ni fusionarlo; la carga debe hacerse en bf16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA), mas `adapter_config.json`, `config.json` y `non_lora_trainables.bin` (proyector multimodal, 4 claves) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA: un codificador visual congelado (BiomedCLIP-CXR 518) proyecta las imagenes a un espacio compatible con un decoder de lenguaje (vicuna-7b-v1.5) mediante un modulo `mm_projector`. En este checkpoint el adaptador LoRA se entrena sobre el LLM mientras el vision tower permanece congelado, y ademas se reentrena el `mm_projector`, que se distribuye aparte en `non_lora_trainables.bin` y debe instalarse sobre el modelo base antes de cargar el adaptador.

Los hiperparametros declarados son: LoRA en bf16 con r=64, alpha=128 y dropout 0.05; learning rate 1e-4 con scheduler coseno y 3 por ciento de warmup; batch efectivo 16; 3 epocas, con el checkpoint publicado correspondiente al paso 531. El entrenamiento se ejecuto sobre 2x RTX 5060 Ti de 16 GB usando DeepSpeed ZeRO-3 con offload a CPU. El conjunto de entrenamiento son 2837 pares imagen-informe de la coleccion publica open-IU. MIMIC-CXR se utilizo unicamente para validacion externa y nunca para entrenamiento, segun la model card. No se documentan fases de RLHF o DPO.

## Capacidades

- Generacion de informes radiologicos de torax: produce texto descriptivo en ingles tecnico a partir de una radiografia de torax, en el formato de los informes de open-IU.
- Comprension de imagen medica: utiliza el vision tower BiomedCLIP-CXR 518, especializado en radiologia de torax, en lugar de un codificador visual generico.
- Generacion de texto condicionada por imagen: es una tarea de image-to-text pura, no de texto a texto.
- Ajuste eficiente sobre un modelo base existente: al ser un adaptador LoRA, permite reproducir el ajuste sin reentrenar el LLM completo.
- Capacidades de tool calling / function calling: no disponibles.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Otras modalidades (audio, video): no disponibles.

## Casos de uso

- Generacion de borradores de informes radiologicos en investigacion: dado un estudio de torax de open-IU, el adaptador produce un borrador de informe que un radiologo revisa y edita. Es adecuado porque esta entrenado especificamente sobre ese dominio y ese formato de informe.
- Reproduccion de experimentos de ajuste fino en modelos vision-lenguaje medicos: el repositorio incluye el adaptador, el proyector reentrenado y las instrucciones de carga, lo que permite replicar el resultado declarado en el test de IU sin reentrenar desde cero.
- Evaluacion comparativa frente al baseline sin ajustar: sirve como punto de referencia con metricas publicadas (RadGraph rg_er y ROUGE-L) para comparar tecnicas de adaptacion (LoRA frente a ajuste completo, otros rangos, otros proyectores).
- Validacion externa de generalizacion: el autor proporciona el script `mimic_eval.py` para evaluar en MIMIC-CXR, un conjunto nunca visto en entrenamiento, lo que permite estudiar la transferencia entre colecciones de radiologia.
- Estudio de tecnicas de entrenamiento con recursos limitados: el pipeline documenta un ajuste de un modelo de aproximadamente 7B con 2 GPU de 16 GB mediante DeepSpeed ZeRO-3 y offload a CPU, un caso practico para laboratorios con hardware modesto.
- Anotacion asistida y prellenado de plantillas: el modelo puede generar un primer borrador estructurado que acelere la anotacion de nuevos estudios en proyectos de investigacion, siempre con revision humana obligatoria.
- Docencia y formacion en informatica medica: permite ilustrar de forma tangible como se comporta un modelo vision-lenguaje especializado en un dominio clinico concreto y donde falla.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son la comparacion del checkpoint frente al baseline oficial de LLaVA-Rad sin ajustar, sobre el conjunto de test retenido de IU (n=500):

| Metrica | llava-rad-iu-v3 (checkpoint-531) | LLaVA-Rad oficial sin ajustar |
|---|---|---|
| RadGraph rg_er | 0.3503 | 0.2877 |
| ROUGE-L | 0.2794 | 0.2037 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generalistas, ni cifras numericas de la validacion externa en MIMIC-CXR.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene aproximadamente 7000 millones de parametros y la carga debe hacerse en bf16 sin cuantizar, por lo que los pesos ocupan del orden de 14-16 GB, a los que hay que sumar el vision tower, el proyector y las activaciones. Una GPU de 24 GB es el minimo comodo; 16 GB exigen cuidado con la longitud de secuencia y el tamano de lote.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB, H100; en el rango de 16 GB son viables tarjetas como las RTX 5060 Ti 16 GB empleadas en el entrenamiento, con offload si es necesario.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB con ajustes de lote y longitud, y con holgura en modelos de 24 GB. No es viable en GPUs de menos de 16 GB sin recurrir a offload a CPU.
- Opciones de despliegue: la model card exige usar los cargadores bf16 del repositorio de codigo (`run_v3_eval.py`, `mimic_eval.py`), que aplican el parche de configuracion, instalan el proyector desde `non_lora_trainables.bin` y cargan el adaptador con `PeftModel.from_pretrained` sin fusionar. No se debe fusionar el adaptador ni cuantizarlo, por lo que los caminos habituales de llama.cpp, GGUF u Ollama no son aplicables tal cual. vLLM o TGI requeririan una integracion personalizada que respete estas restricciones.
- Latencia y throughput estimados: no disponibles.
- Formato de distribucion: solo adaptador (0.4 GB), lo que implica descargar por separado el modelo base vicuna-7b-v1.5 y el vision tower BiomedCLIP-CXR 518.

## Comparativa con modelos similares

La informacion proporcionada solo permite una comparacion directa con la version oficial de LLaVA-Rad sin ajustar, que comparte base y vision tower:

| Modelo | Parametros | Contexto | Rendimiento en IU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-rad-iu-v3 (checkpoint-531) | Adaptador LoRA sobre vicuna-7b-v1.5 | No disponible | RadGraph rg_er 0.3503; ROUGE-L 0.2794 (n=500) | No disponible | Adaptador en HuggingFace |
| LLaVA-Rad oficial sin ajustar | vicuna-7b-v1.5 + BiomedCLIP-CXR 518 | No disponible | RadGraph rg_er 0.2877; ROUGE-L 0.2037 (n=500) | No disponible | Repositorio de Microsoft |

No se dispone en la informacion proporcionada de datos verificables de parametros, contexto, licencia o rendimiento de otras alternativas de la misma categoria (por ejemplo, otros modelos vision-lenguaje para radiologia de torax), por lo que no se incluye una comparacion adicional.

## Limitaciones y advertencias

- No es un sistema de diagnostico: la propia model card indica que es software de investigacion y que genera borradores para revision humana.
- Licencia no declarada: al no especificarse licencia, el uso comercial y la redistribucion quedan en un terreno legal indeterminado y deben consultarse con el autor.
- Restriccion de carga: el autor prohibe explicitamente fusionar el adaptador y cuantizarlo; el modelo debe cargarse en bf16 con los cargadores del repositorio de codigo, lo que complica el despliegue en infraestructura estandar.
- Dependencia del proyector: `non_lora_trainables.bin` debe instalarse sobre el modelo base antes de cargar el adaptador; omitir este paso produce un modelo incorrecto.
- Riesgo de alucinacion: como cualquier modelo generativo de informes medicos, puede describir hallazgos no presentes en la imagen o omitir hallazgos relevantes; en un contexto clinico esto es un riesgo critico.
- Sesgo de dominio: el entrenamiento se realizo unicamente sobre 2837 pares de open-IU, una coleccion concreta, con posibles sesgos de equipo, institucion, poblacion y estilo de informe.
- Cobertura limitada: solo radiografia de torax; no cubre otras modalidades de imagen ni otras regiones anatomicas.
- Idioma: los idiomas soportados no estan declarados; los datos de entrenamiento son informes en ingles, por lo que el comportamiento en castellano no esta documentado.
- Generalizacion no cuantificada: aunque se menciona validacion externa en MIMIC-CXR, no se publican cifras en la informacion disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin pipeline ni idiomas declarados; es un artefacto de investigacion sin senales de adopcion.
- Fechas del repositorio: la fecha de creacion y de ultima actualizacion aparecen registradas como 2026-09-10, dato que conviene verificar directamente en la pagina del modelo.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/HarsathV/llava-rad-iu-v3
- Repositorio de codigo con los cargadores y scripts de evaluacion: https://github.com/vijayakumarharsath/llava-rad-iu
- Repositorio del modelo base LLaVA-Rad (Microsoft): https://github.com/microsoft/LLaVA-Rad
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
