# Ahmadmardini/Hy-MT3-1.8B-Q4_0-GGUF

## Resumen

Hy-MT3-1.8B-Q4_0-GGUF es una cuantizacion no oficial del modelo de traduccion automatica Hy-MT3-1.8B desarrollado por Tencent, publicada por el usuario Ahmadmardini en Hugging Face. El modelo base es un transformer de 1.791.080.448 parametros (aproximadamente 1,8 mil millones) especializado en traduccion neuronal entre idiomas, y esta cuantizacion lo comprime a formato GGUF Q4_0 para su ejecucion en llama.cpp, con un peso de repositorio de 1,1 GB.

La relevancia de esta version concreta radica en su orientacion a dispositivos moviles: en telefonos con arquitectura Arm, llama.cpp emplea su codigo de CPU mas rapido para el formato Q4_0, lo que convierte esta cuantizacion en la opcion mas veloz para telefonos de gama media o baja. Frente a la cuantizacion oficial Q4_K_M de Tencent, este Q4_0 ofrece aproximadamente 1,5 veces mas velocidad a costa de un ligero incremento en errores de significado.

El autor documenta el proceso de cuantizacion con una matriz de importancia (imatrix) calculada sobre 264 traducciones generadas por el propio modelo Q8_0, cubriendo 16 idiomas. La licencia es Apache-2.0, heredada del modelo original de Tencent. No se dispone de informacion sobre la longitud de contexto del modelo base ni sobre los idiomas exactos soportados mas alla de los empleados en la imatrix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Hy-MT3-1.8B de Tencent; detalles de arquitectura interna no disponibles) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea `-c 2048`) |
| Tipos de cuantizacion | Q4_0 (mayoria de pesos a 4,5 bits por peso; token embedding en Q6_K) |
| Idiomas soportados | No disponible de forma oficial; la imatrix cubre arabe, espanol, frances, aleman, chino, japones, ruso, hindi, portugues, turco, coreano, indonesio, italiano, vietnamita, persa y hebreo |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Hy-MT3-1.8B-Q4_0.gguf`, 1.079.996.704 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es Hy-MT3-1.8B de Tencent, un transformer de aproximadamente 1,8 mil millones de parametros especializado en traduccion automatica. La informacion proporcionada no detalla la arquitectura interna del modelo base (numero de capas, dimensiones de atencion, mecanismo de atencion, etc.), ni los datos de entrenamiento originales (numero de tokens, composicion del corpus, uso de RLHF o DPO).

Lo que si se documenta con precision es el proceso de cuantizacion: se partio del `Hy-MT3-1.8B-Q8_0.gguf` oficial de Tencent (revision `7f97e076a8622b09f3a6f14cff38a733441ace43`) y se aplico `llama-quantize` de llama.cpp 1.0.0 con las opciones `--allow-requantize --imatrix`. La matriz de importancia se calculo con `llama-imatrix` sobre el Q8_0, empleando 264 traducciones generadas por el propio modelo: 200 frases de *Alice's Adventures in Wonderland* (dominio publico) traducidas a 16 idiomas y 64 de esas traducciones de vuelta al ingles. El resultado asigna 4,5 bits por peso a la mayor parte del modelo, manteniendo el token embedding en Q6_K por defecto de llama-quantize.

Una innovacion tecnica destacable de esta ficha es la correccion del token de fin de texto: se conserva el token original de Tencent `120020` (`<｜hy_place▁holder▁no▁2｜>`), a diferencia de algunas conversiones comunitarias que lo fijan a `3` y provocan que la generacion nunca se detenga.

## Capacidades

- Traduccion automatica neuronal entre pares de idiomas, con prompt especifico por par linguistico.
- Traduccion multilingue: la imatrix cubre 16 idiomas (arabe, espanol, frances, aleman, chino, japones, ruso, hindi, portugues, turco, coreano, indonesio, italiano, vietnamita, persa y hebreo).
- Traduccion bidireccional: se documentan traducciones desde ingles a los 16 idiomas y de vuelta al ingles.
- Prompt de traduccion sin system prompt: instruccion directa con formato fijo.
- Generacion con parada correcta gracias al token EOT original de Tencent.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidad conversacional segun los tags del repositorio.
- No se documentan capacidades de razonamiento general, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Traduccion en dispositivos moviles sin conexion: el modelo esta disenado para ejecutarse en llama.cpp sobre CPU de telefonos Arm, con un pico de memoria de 2,21 GB en un Galaxy Z Fold6 (Snapdragon 8 Gen 3), lo que permite traduccion local en telefonos de gama alta y, con margen, en gama media.
- Traduccion de documentos largos por lotes: al ser un modelo especializado y ligero, puede procesar grandes volumenes de frases o parrafos con bajo coste computacional, usando el prompt de traduccion documentado y decodificacion greedy para resultados deterministas.
- Traduccion de contenido editorial y literario: el autor valido el modelo sobre frases de una novela de fantasia y sobre *Alice's Adventures in Wonderland*, lo que indica idoneidad para texto narrativo en pares como ingles-arabe.
- Traduccion multilingue en aplicaciones de mensajeria: con 16 idiomas cubiertos por la imatrix y un consumo de memoria de 2,21 GB, puede integrarse en clientes de chat que traduzcan mensajes entrantes y salientes en tiempo real en el propio dispositivo.
- Internacionalizacion de aplicaciones y sitios web: el modelo puede traducir cadenas de interfaz y contenido dinamico hacia los 16 idiomas documentados, con la ventaja de ejecutarse en local sin dependencia de APIs externas.
- Traduccion en entornos con restricciones de privacidad: al ejecutarse completamente en local via llama.cpp, permite traducir documentos sensibles sin enviar datos a servicios en la nube.
- Prototipado e investigacion en traduccion automatica: su tamano reducido (1,1 GB) y su licencia Apache-2.0 facilitan experimentos de evaluacion y ajuste en entornos academicos.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad y memoria en un Samsung Galaxy Z Fold6 (Snapdragon 8 Gen 3, llama.cpp, solo CPU, 4 hilos), comparando esta cuantizacion Q4_0 con la Q4_K_M oficial de Tencent:

| Metrica | Tencent Q4_K_M | Esta Q4_0 |
|---|---|---|
| Segundos por frase (40 frases, ingles-arabe) | 3,05-3,21 | 2,04 |
| llama-bench prompt (pp64 / pp512), tok/s | 100 / 71 | 164 / 129 |
| llama-bench generacion (tg128), tok/s | 18,9 | 24,9 |
| Memoria pico (llama-server) | 2,76 GB | 2,21 GB |

En cuanto a calidad, se evaluaron a ciegas 40 frases (traduccion ingles-arabe) por Claude de Anthropic, con 14 pares de control del modelo contra si mismo:

| Metrica | Recuento |
|---|---|
| Tencent Q4_K_M mejor | 16 |
| Esta Q4_0 mejor | 10 |
| Empate | 10 |
| Errores de significado, Tencent Q4_K_M | 8 |
| Errores de significado, esta Q4_0 | 13 |
| Pares de control (resultado) | 3-4, con 7 empates |

El autor advierte que se trata de una prueba pequena con un unico par de idiomas y debe tomarse como orientativa. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BLEU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,21 GB de memoria pico con `llama-server` (medido en Galaxy Z Fold6); el fichero GGUF ocupa 1,08 GB en disco.
- GPU recomendadas: no se documentan requisitos de GPU; el modelo esta optimizado para CPU en dispositivos Arm.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 3-4 GB de VRAM disponible (por ejemplo, GTX 1650, RTX 3050 en adelante), aunque no se aportan mediciones en GPU.
- Cabe en telefonos: si, validado en Snapdragon 8 Gen 3 con 2,21 GB de memoria pico.
- Opciones de despliegue: llama.cpp (via `llama-server`, `llama-cli` o `llama-bench`); compatible con endpoints. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput estimados: 2,04 segundos por frase en el dispositivo de prueba; 24,9 tok/s de generacion y 129 tok/s de procesamiento de prompt (pp512) en CPU de telefono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-Q4_0 (este) | 1,79 B | No disponible | Q4_0 (4,5 bits/peso) | Apache-2.0 | Hugging Face (Ahmadmardini) |
| Hy-MT3-1.8B-Q4_K_M (Tencent) | 1,79 B | No disponible | Q4_K_M | Apache-2.0 | Hugging Face (tencent/Hy-MT3-1.8B-GGUF) |
| Hy-MT3-1.8B-Q8_0 (Tencent) | 1,79 B | No disponible | Q8_0 | Apache-2.0 | Hugging Face (tencent/Hy-MT3-1.8B-GGUF) |

No se dispone de informacion sobre otros modelos de traduccion comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es una version oficial de Tencent: se trata de una cuantizacion de la comunidad; para producción con soporte del autor original, conviene usar los GGUF oficiales de Tencent.
- Mayor tasa de errores de significado que la Q4_K_M oficial: 13 frente a 8 en la prueba de 40 frases, segun la evaluacion del autor.
- Evaluacion limitada: los resultados de calidad provienen de una unica prueba de 40 frases en un solo par de idiomas (ingles-arabe) y con un unico juez automatico (Claude), por lo que no son concluyentes.
- La cuantizacion Q4_0 es mas agresiva que Q4_K_M y puede degradar la calidad en idiomas o dominios no cubiertos por la imatrix.
- Riesgo de alucinacion y de errores de traduccion inherente a un modelo de 1,8 B parametros; no se recomienda para traduccion juridica, medica o de alta precision sin revision humana.
- Longitud de contexto desconocida: el ejemplo de uso limita a 2048 tokens; textos mas largos requeriran segmentacion.
- Idiomas soportados no documentados oficialmente: la lista de 16 idiomas proviene de la imatrix, no de una declaracion oficial de cobertura.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar `LICENSE.txt` (licencia propia de Tencent) incluido en el repositorio.
- Sin descargas ni likes en el momento de la consulta: repositorio recien creado, sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ahmadmardini/Hy-MT3-1.8B-Q4_0-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- GGUF oficiales de Tencent: https://huggingface.co/tencent/Hy-MT3-1.8B-GGUF
