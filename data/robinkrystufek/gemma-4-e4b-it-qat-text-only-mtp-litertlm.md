# robinkrystufek/gemma-4-E4B-it-qat-text-only-mtp-litertlm

## Resumen

Gemma 4 E4B IT text-only QAT con MTP es un reempaquetado no oficial del modelo Gemma 4 E4B instruction-tuned de Google, distribuido en formato LiteRT-LM y orientado a inferencia en dispositivo (movil y escritorio). Lo publica el usuario robinkrystufek y su aportacion principal no es un nuevo entrenamiento, sino una reduccion de tamano: elimina fisicamente las torres de vision y audio del paquete oficial y conserva intactos los pesos de texto cuantizados con QAT (INT2/INT4/INT8 mixtos), el tokenizador original y el drafter de prediccion multi-token (MTP) para decodificacion especulativa.

El resultado es un paquete de 3,15 GB frente a los 3,66 GB del oficial, un 13,92 % menos de almacenamiento, manteniendo un rendimiento de generacion practicamente identico en las pruebas publicadas. El modelo base es litert-community/gemma-4-E4B-it-litert-lm, y los pesos retenidos se verificaron contra el checkpoint mobile-QAT de Google (google/gemma-4-E4B-it-qat-mobile-transformers).

Es relevante para desarrolladores que despliegan LLM en Android o en equipos de escritorio con recursos limitados y quieren ahorrar espacio sin renunciar al MTP. Al ser text-only, no sirve para tareas multimodales, pero reduce la superficie de almacenamiento en aplicaciones donde vision y audio no se usan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), empaquetado LiteRT-LM; pesos QAT mixtos INT2/INT4/INT8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (capacidad evaluada) |
| Tipos de cuantizacion | QAT mixta INT2/INT4/INT8 (preservada del checkpoint oficial) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (.litertlm), repo de 3,2 GB |
| Tamano del paquete | 3,15 GB (frente a 3,66 GB del oficial, -13,92 %) |
| Decodificacion especulativa | MTP (multi-token prediction) con drafter oficial |
| Modalidades | Solo texto (vision y audio eliminados) |

## Arquitectura y entrenamiento

El modelo es un transformer Gemma 4 en su variante E4B instruction-tuned, empaquetado para el runtime LiteRT-LM. No hay entrenamiento adicional: el autor declara explicitamente que no se realizo reentrenamiento, recuantizacion ni modificacion de pesos. El proceso de empaquetado elimina las secciones multimodales (torres de vision y audio) y sus pesos asociados, deduplica los embeddings compartidos y conserva los grafos logicos de inferencia de texto, el tokenizador, los parametros de cuantizacion y el drafter MTP.

La innovacion tecnica del paquete es doble. Por un lado, la cuantizacion QAT mixta original (INT2, INT4 e INT8 combinados segun la sensibilidad de cada tensor) se mantiene tal cual, lo que permite un tamano reducido sin perder la calidad del checkpoint de Google. Por otro, se conserva el MTP oficial, que actua como decodificacion especulativa: un drafter ligero propone varios tokens y el modelo principal los valida, acelerando la generacion. El autor verifico la fidelidad tensor a tensor: 345/345 tensores cuantizados retenidos coinciden exactamente (3/3 INT2, 258/258 INT4, 84/84 INT8), los 4/4 grafos logicos son equivalentes y 12/12 prefijos de decodificacion greedy en CPU son identicos byte a byte.

## Capacidades

- Generacion de texto instructiva (IT) en el idioma o idiomas del modelo base; la model card no detalla la lista de idiomas.
- Razonamiento y respuesta conversacional multi-turno dentro de la ventana de 4096 tokens.
- Decodificacion especulativa con MTP, que acelera la generacion entre 1,29x y 1,74x segun plataforma.
- Inferencia en dispositivo: Android (GPU de Pixel 10 Pro) y escritorio (GPU NVIDIA RTX 4090 y CPU).
- Sin soporte de vision ni audio: el paquete elimina ambas torres.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o multi-step reasoning: no documentadas en la informacion proporcionada.
- Capacidades multilingues: no detalladas en la informacion proporcionada.

## Casos de uso

- Aplicaciones Android con LLM embebido: el paquete de 3,15 GB cabe en el almacenamiento de un movil moderno y se ejecuta en la GPU del dispositivo con LiteRT-LM, lo que permite asistentes o funciones de texto sin conexion a la nube.
- Generacion de texto en tiempo real en movil con MTP: en Pixel 10 Pro se midieron 13,26 tok/s con MTP frente a 7,64 tok/s sin el, lo que hace viable la respuesta conversacional fluida en dispositivo.
- Asistentes de escritorio locales: en una RTX 4090 se alcanzan 144,32 tok/s con MTP, suficiente para resumir, redactar o responder en aplicaciones de escritorio con latencia baja.
- Reduccion de tamano en apps con presupuesto de almacenamiento ajustado: el ahorro de 509 MB respecto al paquete oficial es util cuando vision y audio no se necesitan y el APK o bundle debe mantenerse pequeno.
- Procesamiento de documentos de hasta ~3500 tokens de entrada en movil: las pruebas de contexto largo (3499 tokens de entrada, 502 generados) muestran 18,20 tok/s y 11,75 s hasta el primer token en Pixel 10 Pro, adecuado para resumir articulos o correos.
- Despliegue en CPU de escritorio: el autor confirma soporte y pruebas en CPU de escritorio, lo que permite entornos sin GPU para tareas de texto por lotes.
- Prototipado de decodificacion especulativa: al conservar el MTP oficial y documentar su metodologia de empaquetado, sirve como referencia reproducible para estudiar el impacto del MTP en distintos backends.

## Benchmarks y rendimiento

Generacion estandar (mediana de throughput de decodificacion, benchmark Forge-GM narrator):

| Backend | Modelo | MTP off | MTP on | Aceleracion MTP |
|---|---|---:|---:|---:|
| NVIDIA RTX 4090 | Oficial stock | 110,26 tok/s | 153,27 tok/s | 1,39x |
| NVIDIA RTX 4090 | Text-only QAT + MTP | 111,61 tok/s | 144,32 tok/s | 1,29x |
| Pixel 10 Pro GPU | Oficial stock | 7,76 tok/s | 13,35 tok/s | 1,72x |
| Pixel 10 Pro GPU | Text-only QAT + MTP | 7,64 tok/s | 13,26 tok/s | 1,74x |

Contexto largo en movil (Pixel 10 Pro GPU, contexto 4096, MTP activado, 3499 tokens de entrada, 502 generados):

| Metrica | Oficial stock | Text-only QAT + MTP | Cambio |
|---|---:|---:|---:|
| Tamano del modelo | 3,66 GB | 3,15 GB | -13,92 % |
| PSS pico del proceso | 4152 MiB | 4179 MiB | +0,65 % |
| GL mtrack pico | 3186,52 MiB | 3186,52 MiB | ~0 % |
| Heap nativo pico | 560,89 MiB | 562,91 MiB | +0,36 % |
| Throughput de decodificacion | 18,45 tok/s | 18,20 tok/s | -1,35 % |
| Tiempo hasta el primer token | 11,88 s | 11,75 s | -1,07 % |
| Tiempo de generacion | 39,05 s | 39,30 s | +0,64 % |
| Tiempo de carga del modelo | 25,88 s | 23,63 s | -8,66 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; las cifras anteriores miden rendimiento de inferencia e integridad del empaquetado, no calidad del modelo.

## Requisitos de hardware

- Almacenamiento: 3,15 GB para el paquete; el repo ocupa 3,2 GB.
- Memoria en movil: PSS pico del proceso de 4179 MiB y heap nativo pico de 562,91 MiB en Pixel 10 Pro con contexto de 4096 tokens.
- GPU de escritorio probada: NVIDIA RTX 4090 (144,32 tok/s con MTP, 111,61 tok/s sin MTP).
- CPU de escritorio: soportada y probada por el autor, sin cifras de rendimiento publicadas.
- GPU movil probada: Pixel 10 Pro (13,26 tok/s con MTP, 7,64 tok/s sin MTP).
- Otros dispositivos, backends y configuraciones de contexto no han sido evaluados de forma exhaustiva.
- Despliegue: runtime LiteRT-LM (0.19.2 en escritorio; 0.19.1 con LiteRT 2.3.2 en movil). No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato .litertlm es especifico de LiteRT-LM.
- Latencia movil en contexto largo: 11,75 s hasta el primer token y 39,30 s para generar 502 tokens.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Modalidad | MTP | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|---|
| Este paquete (text-only QAT + MTP) | 3,15 GB | 4096 | Solo texto | Si | Apache 2.0 | Hugging Face |
| litert-community/gemma-4-E4B-it-litert-lm (oficial) | 3,66 GB | 4096 | Texto, vision y audio | Si | no disponible en la informacion | Hugging Face |
| google/gemma-4-E4B-it-qat-mobile-transformers | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a las variantes de Gemma 4 E4B citadas en la informacion; no se dispone de datos de otros modelos comparables.

## Limitaciones y advertencias

- Reempaquetado no oficial: no lo publica Google y no cuenta con el respaldo del equipo de Gemma.
- Solo texto: no admite entrada de imagen ni audio; cualquier caso de uso multimodal queda fuera.
- Ventana de contexto evaluada de 4096 tokens; no se han probado configuraciones superiores.
- Los benchmarks miden rendimiento e integridad del paquete, no calidad del modelo; no hay datos de MMLU, HumanEval u otros.
- La evaluacion de fidelidad se limito a 12 prefijos de decodificacion greedy con MTP desactivado y techo de 128 tokens; no se compararon IDs de token nativos ni logits por paso.
- Rendimiento no evaluado en dispositivos distintos de RTX 4090, CPU de escritorio y Pixel 10 Pro.
- El rendimiento movil depende en gran medida del backend y del dispositivo; el propio autor advierte que otras configuraciones no se han evaluado de forma exhaustiva.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan del modelo base Gemma 4 E4B IT.
- Licencia Apache 2.0 declarada en el repo; conviene verificar las condiciones del modelo base de Google antes de uso comercial.
- El paquete depende del runtime LiteRT-LM; no es directamente utilizable en otros motores de inferencia sin conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robinkrystufek/gemma-4-E4B-it-qat-text-only-mtp-litertlm
- Modelo base LiteRT-LM: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Checkpoint mobile-QAT de Google: https://huggingface.co/google/gemma-4-E4B-it-qat-mobile-transformers
- Repositorio de empaquetado y reproduccion: https://github.com/robinkrystufek/Forge-E4B-p
