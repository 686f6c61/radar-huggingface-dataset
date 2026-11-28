# brandonmusic/glm-5.3-flash-tr3-fp8

## Resumen

glm-5.3-flash-tr3-fp8 es una cuantizacion TrellisMX codec-v2 del modelo GLM-5.3-Flash-BF16, publicado por el usuario brandonmusic en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribucion cuantizada del checkpoint base de zai-org, orientada a servir el modelo con expertos en FP8 nativo sobre Tensor Cores. El paquete incluye el carrier nativo, tokenizer, configuracion y 172 sidecars TP4, por lo que no requiere descargar los pesos base por separado, aunque si exige el runtime TrellisMX personalizado incluido por el autor.

La relevancia de esta publicacion es practica: propone una ruta de despliegue de un modelo de gran tamano con almacenamiento comprimido de los pesos enrutados (4,25 bits por peso) y decodificacion a operandos E4M3 con escalas UE8M0/K32 para ejecucion nativa en FP8. El autor reporta una KLD media de 0,028330843421 nats frente a 0,030099944949 de una cuantizacion EXL3/TR3 previa del mismo modelo, medida sobre 128 ventanas y 261.888 posiciones de decodificacion real.

La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face. La informacion sobre arquitectura del modelo base, numero de parametros, contexto, idiomas y benchmarks de capacidad es muy escasa o inexistente en la informacion proporcionada, por lo que se indica como no disponible cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-5.3-Flash-BF16 de zai-org; la cuantizacion usa codec TrellisMX v2 con expertos MTP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TrellisMX codec-v2: indices comprimidos de 4 bits con escalas de 8 bits por cada 32 pesos (4,25 bits por peso en capas enrutadas); decodificacion a operandos E4M3 con escalas UE8M0/K32; KV en FP8; modulos no enrutados conservan la precision del carrier |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 193,0 GB), con runtime TrellisMX personalizado requerido para la carga |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base GLM-5.3-Flash-BF16 en la documentacion proporcionada: no se detallan tipo de transformer, numero de capas, dimensiones ocultas ni regimen de entrenamiento. La model card menciona 42 capas enrutadas principales y 288 expertos MTP45, lo que sugiere una arquitectura con mezcla de expertos y modulos de prediccion multi-token (MTP), pero no se confirma el diseno completo.

El trabajo tecnico de esta publicacion es la cuantizacion. TrellisMX codec-v2 comprime los indices de las capas enrutadas y los expertos MTP a K4, con escalas por bloque de 32 pesos, y los decodifica en tiempo de ejecucion a operandos E4M3 para ejecucion en Tensor Cores FP8. El checkpoint no almacena una copia completa de pesos de 8 bits: los modulos no enrutados mantienen la precision del carrier original. El autor advierte que la comparacion de KLD con EXL3/TR3 no es una comparacion de igual presupuesto de bits, ya que TR3 usa trellises de cuatro bits con sobrecarga por canal y sin escalas de bloque.

## Capacidades

- Generacion de texto y razonamiento en modo extendido: los resultados conductuales publicados se obtuvieron con Max reasoning, temperatura 1,0 y top-p 0,95.
- Razonamiento multi-paso y tareas de tipo agentico: la model card incluye ventanas de evaluacion de "code-agentic" en el desglose de KLD.
- Soporte de prediccion multi-token (MTP): el checkpoint incluye 288 expertos MTP45, aunque las mediciones de calidad de borrador y aceptacion especulativa no se realizaron.
- Ejecucion en FP8 nativo con KV en FP8 sobre Tensor Cores, con paralelismo TP4/DCP4.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y tool calling: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de GLM-5.3-Flash en infraestructura con Tensor Cores FP8: el paquete decodifica los expertos a E4M3 con escalas UE8M0/K32, lo que permite aprovechar la ruta FP8 nativa del hardware sin descargar los pesos BF16 originales.
- Servicio de inferencia con paralelismo de tensor TP4: el autor incluye 172 sidecars TP4 y reporta ejecuciones en cuatro RTX PRO 6000 Blackwell con TP4/DCP4, un escenario reproducible para equipos con ese tipo de nodo.
- Evaluacion de tecnicas de cuantizacion: la publicacion aporta un protocolo de medicion de KLD con 128 ventanas, logits de profesor y scorer FP64 sobre vocabulario completo, util para comparar codecs en condiciones controladas.
- Razonamiento extendido en produccion: los perfiles conductuales publicados (Hotel Lights, Estonia, LAVD) se ejecutaron a concurrencia 10 con razonamiento maximo, lo que sirve como referencia para cargas de trabajo de razonamiento con prompts fijos.
- Investigacion sobre prediccion multi-token: al incluir los 288 expertos MTP45 cuantizados, el checkpoint permite estudiar decodificacion especulativa, aunque el autor no midio la calidad del borrador.
- Experimentacion con runtimes personalizados: el requisito de cargar el runtime TrellisMX incluido lo hace adecuado para laboratorios que quieran validar el codec frente a alternativas como EXL3.
- Analisis de dominio en la cuantizacion: el desglose de KLD por dominio (ventanas agenticas de codigo frente a legales) permite estudiar como afecta la compresion a distintos tipos de contenido.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---|
| KLD media, TrellisMX codec-v2, TP4/DCP4, KV FP8 | 0,028330843421 nats |
| KLD media, EXL3/TR3 guardado, TP4/DCP4, KV FP8 | 0,030099944949 nats |
| KLD media, referencia B200 (backbone BF16, KV sin cuantizar, matmuls FP32) | 0,027881131803 nats |
| Posiciones de decodificacion medidas | 261.888 (128 ventanas, excluyendo la fila de prefill de un token) |
| Ventanas con KLD menor en TrellisMX | 48 de 128 |
| Perfil Hotel Lights | 29/30 automatizado; 30/30 revisado |
| Perfil Estonia | 29/30 |
| Perfil LAVD | 30/30 automatizado; 28 exactas y 2 cercanas en revision |

Los resultados conductuales se obtuvieron con 30 peticiones medidas a concurrencia 10, Max reasoning, temperatura 1,0 y top-p 0,95, sobre cuatro RTX PRO 6000 Blackwell con TP4/DCP4, KV FP8 y MTP1, con 48 secuencias maximas y tiles M16 forzados. Las 90 peticiones finalizaron sin errores ni truncamientos. El autor indica que estas cifras son de un runtime anterior y no miden la imagen nueva con MTP3/compact-capture. La KLD de panel completo se midio en el runtime anterior sin correccion de prefill; la imagen final no se ha remedido en el panel completo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 193,0 GB en safetensors, por lo que el almacenamiento y la memoria necesarios para cargar el carrier completo son elevados.
- GPU utilizadas en las pruebas publicadas: cuatro RTX PRO 6000 Blackwell con TP4/DCP4.
- Referencia adicional: el autor menciona un runner de referencia en B200 para la medicion de KLD con backbone BF16 y matmuls FP32.
- GPU consumer: no hay datos que confirmen que el modelo quepa en GPU de consumo; el requisito de runtime personalizado y el tamano del repo lo hacen improbable en configuraciones de una sola tarjeta.
- Opciones de despliegue: runtime TrellisMX personalizado incluido en el paquete; no se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles.
- Latencia y throughput: no disponibles; solo se reporta concurrencia 10 con 48 secuencias maximas y cero errores en 90 peticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KLD media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| glm-5.3-flash-tr3-fp8 | no disponible | no disponible | TrellisMX codec-v2, 4,25 bits/peso en capas enrutadas | 0,028330843421 | MIT | Hugging Face, 186 descargas |
| GLM-5.3-Flash-tr3-4bpw (EXL3/TR3) | no disponible | no disponible | Trellis de 4 bits con sobrecarga por canal | 0,030099944949 | no disponible en la informacion | Hugging Face |
| GLM-5.3-Flash-BF16 (base) | no disponible | no disponible | BF16 | no medida como estudiante | no disponible en la informacion | Hugging Face (zai-org) |

La comparacion se limita a las variantes del mismo modelo base citadas en la model card. No se dispone de datos de benchmarks de capacidad (MMLU, HumanEval, GSM8K) ni de modelos alternativos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La comparacion de KLD entre TrellisMX y EXL3/TR3 no es de igual presupuesto de bits: TrellisMX usa 4,25 bits por peso con escalas de bloque, mientras que TR3 usa trellises de 4 bits con sobrecarga por canal y sin esas escalas.
- El autor no presenta intervalos de confianza ni afirmaciones de significacion estadistica; la ventaja de 5,88 % en KLD media se concentra en ventanas agenticas de codigo, mientras que las ventanas legales muestran una KLD media aproximadamente un 3 % superior para TrellisMX.
- La medicion de panel completo se hizo en un runtime anterior sin correccion de prefill; la imagen final solo se verifico con comprobaciones de una sola ventana, que no establecen equivalencia numerica.
- No se midieron la calidad del borrador MTP, la aceptacion especulativa ni la calidad a alta concurrencia.
- Los resultados conductuales (Hotel Lights, Estonia, LAVD) son de un runtime anterior y con prompts fijos; no constituyen una evaluacion amplia de calidad del modelo.
- El checkpoint requiere el runtime TrellisMX personalizado incluido; no es cargable con herramientas estandar sin ese runtime.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada.
- Idiomas y limitaciones de contexto: no disponibles.
- Licencia MIT: permite uso comercial, pero el autor no detalla obligaciones adicionales derivadas del modelo base ni de los componentes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brandonmusic/glm-5.3-flash-tr3-fp8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Configuracion de la variante TR3 citada: https://huggingface.co/brandonmusic/GLM-5.3-Flash-tr3-4bpw/blob/4bccf1bcf9dcd3357933a8ad91193de675331012/config.json
- Implementacion de almacenamiento EXL3: https://github.com/turboderp-org/exllamav3/blob/6ff3a17ea7f3d0026b273d43239398d57f71b788/exllamav3/modules/quant/exl3_lib/quantize.py
- Informe KLD nativo: KLD-NATIVE-FP8.md (referenciado en la model card, sin URL absoluta en la informacion proporcionada)
- Resumen de resultados conductuales: BENCHMARK-RESULTS.md y BENCHMARK-RESULTS.json (referenciados en la model card, sin URL absoluta en la informacion proporcionada)
- Informe de referencia B200: evidence/kld-B-reference/REPORT.json (referenciado en la model card, sin URL absoluta en la informacion proporcionada)
