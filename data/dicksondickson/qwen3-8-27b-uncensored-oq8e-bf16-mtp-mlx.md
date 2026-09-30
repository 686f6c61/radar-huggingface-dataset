# dicksondickson/Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX

## Resumen

dicksondickson/Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX es una cuantizacion en formato MLX del modelo orcarouter/Qwen3.8-27B-Uncensored, que a su vez es una version abliterada (eliminacion de rechazos a nivel de tensor) de Qwen/Qwen3.8-27B. Se trata de un modelo denso de 27.781.427.952 parametros (unos 27,8 mil millones), con arquitectura de atencion hibrida que combina 48 capas de Gated DeltaNet (atencion lineal) y 16 capas de atencion completa sobre un total de 64 capas, con dimension oculta de 5120. Es ademas un modelo nativo de vision-lenguaje, incorpora control de modo pensamiento (thinking), soporte de tool calling y una cabeza MTP (multi-token prediction).

El checkpoint lo publica el usuario dicksondickson y esta pensado exclusivamente para Apple Silicon mediante MLX. Se genero con oMLX 0.7.0rc1 con imatrix activado, dejando los tensores importantes en bf16, lo que exige chips Apple M3 o posteriores; los usuarios de M1 y M2 deben recurrir a la variante fp16. El repositorio ocupa 30,0 GB y se distribuye bajo licencia MIT.

Su relevancia es doble: por un lado, permite ejecutar en local un modelo de 27B con ventana de 262.144 tokens y vision sobre hardware de consumo Apple, sin depender de API en la nube; por otro, al proceder de un proceso de abliteration, esta orientado a escenarios de investigacion y evaluacion donde los filtros de seguridad estandar interfieren (red teaming, analisis de contenido sensible, generacion de datos sinteticos). La model card advierte explicitamente de que no es adecuado para produccion ni para aplicaciones publicas sin revision humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida: 48 capas Gated DeltaNet (atencion lineal) + 16 capas de atencion completa, 64 capas totales, dimension oculta 5120, cabeza MTP |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens (262K), segun la informacion del modelo base |
| Tipos de cuantizacion | Este checkpoint: 8 bits (esquema oQ8e) con tensores importantes en bf16. El ecosistema del modelo base ofrece ademas 2, 4 y 8 bits (afin, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (bf16 y cuantizado a 8 bits); tamano de repositorio 30,0 GB |
| Libreria / motor | mlx (oMLX 0.7.0rc1 para la cuantizacion) |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored (a su vez derivado de Qwen/Qwen3.8-27B) |
| Modalidades | Texto e imagen (vision tower completo) |
| Fecha de publicacion | 2026-09-29 |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso con atencion hibrida: 48 de las 64 capas emplean Gated DeltaNet, un mecanismo de atencion lineal recurrente que reduce el coste computacional y de memoria del contexto largo, mientras que 16 capas mantienen atencion completa (softmax) para preservar la precision en la recuperacion de informacion a larga distancia. La dimension oculta es de 5120 y el modelo integra una cabeza MTP (multi-token prediction), utilizada habitualmente para decodificacion especulativa y para acelerar la generacion. Dispone de torre de vision nativa, lo que lo convierte en un modelo vision-lenguaje y no en un simple modelo de texto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el pipeline de alineacion (RLHF, DPO u otros) del modelo original Qwen3.8-27B, ya que no aparece en la informacion proporcionada. Lo que si se documenta es el postprocesado: el modelo base orcarouter se genero mediante abliteration a nivel de tensor, dejando intactos la torre de vision y la cabeza MTP, con el objetivo declarado de eliminar los rechazos manteniendo las capacidades. Sobre esa base, este checkpoint aplica una cuantizacion oQ8e a 8 bits con imatrix (matriz de importancia para preservar los tensores criticos) usando oMLX 0.7.0rc1, manteniendo en bf16 los tensores sensibles a la precision. Es relevante senalar que la cuantizacion no altera ni los pesos de vision ni la cabeza MTP, solo su representacion numerica.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (thinking) controlable heredado de la familia Qwen3.
- Comprension de imagen: la torre de vision se mantiene completa, por lo que admite entrada de imagenes junto a texto (image-to-text).
- Tool calling y function calling, lo que permite integrarlo en agentes que invocan APIs o ejecutan acciones.
- Contexto muy largo de 262.144 tokens, adecuado para analisis de documentacion extensa o sesiones multi-turno prolongadas sin truncado agresivo.
- Prediccion multi-token mediante cabeza MTP, orientada a acelerar la decodificacion.
- Generacion de codigo (capacidad declarada por el ecosistema del modelo base, sin benchmarks publicados que la cuantifiquen).
- Ausencia practica de rechazos: el modelo base reporta 0 % de sobre-rechazo en XSTest y entre 0 % y 6 % de rechazo en la suite A/B, segun la ficha del modelo base en Ollama.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Red teaming y evaluacion de seguridad: al haber sido abliterado, sirve para generar prompts y respuestas que estresen clasificadores de contenido y filtros de moderacion propios, midiendo su tasa de fallo antes de desplegarlos.
- Analisis de documentos largos en local: con 262K tokens de contexto se puede cargar un informe tecnico, un expediente o un libro completo y hacer preguntas sobre el conjunto sin dividirlo en fragmentos, manteniendo los datos en la maquina.
- Procesamiento de documentos escaneados: la torre de vision permite extraer texto y estructura de PDFs o capturas directamente, sin una etapa OCR separada.
- Generacion de datos sinteticos para ajuste: su baja tasa de rechazo lo hace util para producir corpus de entrenamiento o destilacion en dominios donde un modelo alineado se negara a continuar la conversacion.
- Asistente personal privado en un Mac: ejecutado con mlx-lm u oMLX sobre memoria unificada, ofrece conversaciones de contexto largo y acceso a herramientas sin enviar datos a terceros.
- Agentes de automatizacion en escritorio: mediante tool calling y razonamiento multi-paso, puede encadenar llamadas a scripts locales, consultas a ficheros o acciones sobre servicios internos.
- Investigacion sobre alineacion y abliteration: sirve como sujeto de comparacion frente a la version alineada del mismo modelo para medir que capacidades y sesgos cambian al retirar los rechazos.
- Analisis de contenido sensible para moderacion humana: resumir, clasificar o etiquetar material controvertido sin que el modelo bloquee la tarea, con revision manual posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint (no hay MMLU, HumanEval, GSM8K ni equivalentes). El autor de la cuantizacion no incluye ninguna tabla de evaluacion en la model card.

Los unicos datos numericos de comportamiento disponibles provienen de la ficha del modelo base en Ollama y son metricas de rechazo, no de capacidad:

| Metrica | Resultado | Fuente |
|---|---|---|
| Sobre-rechazo en XSTest | 0 % | Ficha de orcarouter/Qwen3.8-27B-Uncensored |
| Tasa de rechazo en suite A/B | 0-6 % | Ficha de orcarouter/Qwen3.8-27B-Uncensored |
| Perdida de capacidad declarada | "sin perdida medible" (afirmacion del autor del modelo base, sin datos publicados) | Ficha de orcarouter/Qwen3.8-27B-Uncensored |

Se recomienda tratar estas cifras como afirmaciones del publicador, no como evaluaciones independientes.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX). No hay soporte CUDA para este checkpoint.
- Memoria: el repositorio ocupa 30,0 GB, de los cuales la mayor parte son los pesos a 8 bits mas los tensores en bf16. Se necesita memoria unificada suficiente para pesos, cache KV y overhead del runtime; 32 GB es el minimo practico y 48-64 GB es lo recomendable si se quiere explotar el contexto de 262K tokens.
- Restriccion de chip: los tensores importantes estan en bf16, lo que requiere Apple M3 o posterior. En M1 y M2 hay que usar la variante fp16 del mismo autor.
- GPU/dispositivos equivalentes: no aplica; no se puede ejecutar en A100, H100 ni RTX 4090 con este formato. Para CUDA habria que recurrir a otro formato del modelo base.
- Opciones de despliegue: mlx-lm (servidor local), oMLX 0.7.0rc1 (motor con el que se genero el checkpoint), LM Studio (soporte de modelos MLX). vLLM, TGI y llama.cpp no consumen directamente pesos MLX; para esos entornos habria que usar una conversion GGUF del modelo base, disponible en Ollama bajo orcarouter/Qwen3.8-27B-Uncensored.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este checkpoint.
- Coste de cache KV: no disponible. Con 262K tokens de contexto y 16 capas de atencion completa, el consumo de cache puede ser elevado y conviene medirlo en el dispositivo objetivo antes de fijar la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dicksondickson/Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX (este) | 27,8 B | 262K | MLX safetensors, 8 bits + bf16 | MIT | HuggingFace, 0 descargas |
| orcarouter/Qwen3.8-27B-Uncensored (base) | 27,8 B | 262K | safetensors originales; tambien en Ollama | MIT | HuggingFace y Ollama |
| zomiailabs/Qwen3.8-27B-Uncensored-MLX | no disponible | no disponible | MLX | no disponible | HuggingFace |
| daviddan-241/qwen3.8-27b-uncensored-mlx | 27 B (dato del nombre) | no disponible | MLX, subcarpetas de 2/4/6/8 bits (afin, group size 64) | no disponible | HuggingFace y GitHub |
| intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter | no disponible | no disponible | MLX, orientado a decodificacion especulativa (drafter) | no disponible | HuggingFace |

Todas las alternativas comparten el mismo origen (Qwen3.8-27B abliterado) y el mismo nicho de ejecucion en Apple Silicon, por lo que la eleccion depende principalmente de la precision deseada y de si se necesita un modelo borrador MTP para acelerar la decodificacion. No hay datos publicos de rendimiento que permitan ordenarlas por calidad.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: el proceso de abliteration elimina buena parte de los rechazos, por lo que el modelo puede producir contenido sensible, controvertido o inapropiado sin aviso.
- No apto para produccion segun su propio autor: la model card recomienda uso en investigacion, pruebas o entornos controlados, y desaconseja su empleo directo en aplicaciones comerciales o de cara al publico.
- Sin garantias de seguridad por defecto: no ha pasado por optimizacion de seguridad y el publicador declina responsabilidad sobre las consecuencias de su uso.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual para este checkpoint; al tratarse de una cuantizacion de una version abliterada, el comportamiento factual debe validarse en el dominio concreto de uso.
- Sin benchmarks de capacidad: no existen datos publicados de MMLU, HumanEval, GSM8K ni similares, ni para este checkpoint ni, en la informacion disponible, para la cuantizacion concreta de 8 bits.
- Cobertura de idiomas desconocida: la informacion proporcionada no detalla que idiomas soporta el modelo, ni el castellano en particular.
- Riesgo de degradacion por cuantizacion: aunque el esquema conserva en bf16 los tensores importantes, no se han publicado mediciones del impacto de la cuantizacion a 8 bits sobre la calidad.
- Dependencia de hardware: requiere Apple Silicon M3 o posterior; en M1 y M2 hace falta la variante fp16. No es portable a GPU NVIDIA sin convertir el modelo.
- Responsabilidad legal y etica: el usuario debe asegurarse de que su uso cumple la legislacion local; el contenido generado puede acarrear riesgos legales.
- Madurez baja en la comunidad: 0 descargas y 1 like en el momento de redactar la ficha, sin evaluaciones independientes que respalden el checkpoint.
- Licencia MIT: permisiva para uso comercial en lo que respecta a este checkpoint, pero conviene verificar las condiciones del modelo original Qwen subyacente antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicksondickson/Qwen3.8-27B-Uncensored-oQ8e-bf16-mtp-MLX
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo base en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio GitHub de la conversion abliterada a MLX: https://github.com/daviddan-241/qwen3.8-27b-uncensored-mlx
- Cuantizacion MLX de zomiailabs: https://huggingface.co/zomiailabs/Qwen3.8-27B-Uncensored-MLX
- Drafter MTP alternativo de intheblue: https://huggingface.co/intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter
- Ficha descriptiva en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-uncensored-mlx-orcarouter
- Creditos citados en la model card sin URL asociada: orcarouter (abliteration y safetensors) y jundot/olmx (motor omlx y modelos MLX); el modelo original de referencia es Qwen/Qwen3.8-27B.
