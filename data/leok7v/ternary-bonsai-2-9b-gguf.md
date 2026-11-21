# leok7v/Ternary-Bonsai-2-9B-gguf

## Resumen

Ternary Bonsai 2 9B es un modelo multimodal (texto e imagen) derivado de Qwen3.5-9B de Alibaba Cloud, cuantizado a pesos ternarios {-1, 0, +1} por Prism ML y reempaquetado en un unico fichero GGUF por el usuario leok7v. El modelo combina un transformer hibrido con atencion lineal Gated DeltaNet y atencion completa, con aproximadamente 8,95 mil millones de parametros en el lenguaje y una torre de vision de 27 bloques en Q8_0.

El objetivo del rehost es la estabilidad operativa: fusiona en un solo fichero los pesos del modelo de texto (Q2_0), el proyector de vision (Q8_0) y la tarjeta de muestreo, de forma que el modelo no pueda quedar silenciosamente sin vision o mal muestreado si el repositorio original desaparece o se mueve. Todos los tensores son los del upstream sin recuantizar.

Es relevante por su formato de cuantizacion extrema (2,25 bits por peso en los tensores de texto) que permite ejecutar un modelo de casi 9B en dispositivos con 8 GB de RAM, como un iPhone 16e, a unos 11 tokens por segundo. No obstante, el formato `.ggxf` es propietario del proyecto ChatOKF y no carga en llama.cpp estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5 (`qwen35`): atencion lineal Gated DeltaNet + atencion completa, con torre de vision |
| Parametros totales | ~8,95B en el modelo de lenguaje + torre de vision de 27 bloques (Q8_0) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria Q2_0 (2,25 bits por peso) en texto; Q8_0 en el proyector de vision |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ggxf` (GGUF + tensores y claves de metadatos adicionales del proyecto ChatOKF); 3.186.049.024 bytes, 761 tensores, 67 claves KV |

## Arquitectura y entrenamiento

El modelo es un hibrido Qwen3.5 (`general.architecture = qwen35`) con 32 bloques de dimension oculta 4096, 16 cabezas de atencion de consulta y 4 de clave-valor, y una relacion de tres bloques de atencion lineal Gated DeltaNet por cada bloque de atencion completa. Los pesos de texto estan cuantizados en el bloque `Q2_0` de Prism ML: 64 pesos en 18 bytes con la estructura `{ FP16 scale d; 2-bit codes qs[16] }` y la regla `w = (code - 1) * d`, lo que da 2,25 bits por peso. La torre de vision va en Q8_0.

Los pesos incorporan la rotacion Hadamard plegada del upstream (claves `prism.hadamard.*`, bloque 4096, version 1, cabeza separada). Un runtime debe transformar las activaciones antes de cada capa lineal rotada y despues del token gather, tal como hace el llama.cpp de upstream desde la build b11556; un lector que ignore estas claves produce salida basura. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Comprension de imagen y texto (pipeline `image-text-to-text`) mediante la torre de vision Q8_0 integrada.
- Modo de razonamiento ("thinking") con configuracion de muestreo diferenciada: thinking activo usa temperatura 1.0, top_p 0.95, top_k 20, min_p 0, presence_penalty 1.0; thinking desactivado usa 0.7, 0.80, 20, 0 y 1.5.
- Penalizaciones aplicadas sobre los ultimos 64 tokens; `repetition_penalty` de 1.0 en ambos modos.
- Tokens de parada definidos en el propio fichero: `<|im_end|>` (248046) y `<|endoftext|>` (248044).
- Soporte de tool calling: la model card menciona un escenario "chat with tools listed" en las mediciones en iPhone.
- Capacidades multilingues limitadas al ingles segun el campo `language`.

## Casos de uso

- Inferencia en dispositivo movil: el formato ternario de 2,25 bits por peso y los 3,2 GB del fichero permiten ejecutar el modelo en un iPhone 16e de 8 GB a unos 11 tokens por segundo, adecuado para asistentes locales sin conexion.
- Asistente de chat con herramientas en el movil: el modelo mantiene conversacion con tool calling listado, con un rendimiento medido de unos 7 tokens por segundo en el mismo dispositivo.
- Descripcion y analisis de imagenes en local: la torre de vision Q8_0 integrada en el mismo fichero permite tareas image-text-to-text sin descargar un segundo artefacto ni depender de un servidor.
- Despliegue con garantia de integridad de artefacto: al ser un unico fichero con checksum fijado (sha256 `c163c91069737660d598419739f9c41d0f1d33ea1ece02b906140ca0b1b0e4e3`), encaja en pipelines que requieren snapshots inmutables y verificables.
- Escenarios con restricciones de memoria: la cuantizacion ternaria reduce la huella de un modelo de ~9B a un tamano manejable en equipos de gama baja, util para prototipos de razonamiento y generacion de texto en hardware limitado.
- Evaluacion de tecnicas de cuantizacion extrema: sirve como referencia reproducible para comparar perplexidad entre runtimes, con 19,91 medido en ChatOKF frente a 19,94 de llama-perplexity de upstream sobre un texto de Simple Wikipedia de 80 KB a contexto 512 y 24 fragmentos.
- Archivo y preservacion de modelos: el rehost funciona como snapshot fijado que sobrevive si el repositorio upstream se mueve o se elimina.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Perplexidad (Simple Wikipedia, 80 KB, contexto 512, 24 fragmentos) | 19,91 | 19,94 con llama-perplexity de upstream sobre Q2_0 |
| Decodificacion en iPhone 16e (8 GB), sin herramientas | ~11 tokens/s | ChatOKF |
| Decodificacion en iPhone 16e (8 GB), chat con herramientas listadas | ~7 tokens/s | ChatOKF |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero completo ocupa 3,2 GB (3.186.049.024 bytes), por lo que la inferencia cabe en equipos con 8 GB de memoria.
- GPU recomendadas: no disponible en la informacion proporcionada; el escenario medido es un iPhone 16e de 8 GB.
- Cabe en GPU de consumo: si, dado el tamano de 3,2 GB, aunque no se documentan pruebas en modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: ChatOKF (runtime de referencia, que lee el proyector del mismo fichero). llama.cpp estandar NO carga este fichero: su loader exige exactamente los tensores del modelo y recibe el proyector aparte via `--mmproj`, por lo que los 334 tensores extra provocan el error `wrong number of tensors`. Para llama.cpp debe usarse el repositorio upstream de dos ficheros.
- Latencia y throughput: ~11 tokens/s sin herramientas y ~7 tokens/s con herramientas en iPhone 16e (8 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary Bonsai 2 9B (este rehost) | ~8,95B + vision | no disponible | Ternaria Q2_0 / Q8_0 vision | Apache 2.0 | GGUF unico (`.ggxf`), solo ChatOKF |
| Ternary Bonsai 2 9B upstream (prism-ml) | ~8,95B + vision | no disponible | Q2_0, PQ2_0, PTQ1_0 | Apache 2.0 | Dos ficheros GGUF, compatible con llama.cpp |
| Qwen3.5-9B (Alibaba Cloud) | ~9B | no disponible | Full precision y otras | no disponible | Repositorio original de Alibaba Cloud |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad restringida: el formato `.ggxf` solo carga en ChatOKF; llama.cpp principal falla con `wrong number of tensors`. No es un GGUF estandar.
- Dependencia del runtime: se requiere un lector que aplique la rotacion Hadamard plegada (`prism.hadamard.*`, bloque 4096) antes de cada capa lineal rotada y tras el token gather; ignorarla produce salida incorrecta.
- Idioma: solo ingles declarado; no hay soporte multilingue documentado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte que este repositorio no es la fuente autorizada; para benchmarks, otras cuantizaciones y el whitepaper debe consultarse el repositorio upstream.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base Qwen3.5-9B.
- Cuantizacion extrema: 2,25 bits por peso implica perdida de precision frente al modelo original; la perplexidad medida (19,91) es el unico dato de calidad disponible.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Fichero unico de 3,2 GB: la actualizacion o sustitucion del modelo requiere reemplazar el artefacto completo y verificar el checksum.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leok7v/Ternary-Bonsai-2-9B-gguf
- Repositorio upstream (modelo base): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Modelo original de Alibaba Cloud: Qwen3.5-9B (referencia en la model card, sin URL explicita)
- Runtime ChatOKF (incluye la herramienta GGUFGraft y la tarjeta de generacion): no disponible como URL en la informacion proporcionada
- Paper/whitepaper de Prism ML: no disponible como URL en la informacion proporcionada
