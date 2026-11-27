# kataguru/Vipunen-35B-A4B-Translator-APA7-GGUF

## Resumen

Vipunen-35B-A4B-Translator-APA7-GGUF es una distribucion cuantizada en formato GGUF de un ajuste fino del modelo base Vipunen-35B-A4B-NVFP4, que a su vez deriva de Qwen3.6-35B-A3B. Lo desarrolla el usuario kataguru y esta disenado especificamente como traductor bidireccional ingles-finlandes de calidad editorial, asi como auditor de citas y formato APA 7 en ambos idiomas. El modelo se publica bajo licencia Apache 2.0 y esta orientado a inferencia local mediante llama.cpp, LM Studio u Ollama.

El modelo conserva la arquitectura MoE del Qwen3.6-35B-A3B original, con 35.505.251.456 parametros totales y un subconjunto activo por token (configuracion A4B, top_k=10 segun la model card). Sobre esa base se aplica una capa de ajuste SOMA/ARA orientada a eliminar rechazos en generacion creativa y a reforzar la fidelidad terminologica en traduccion academica, tecnica, cientifica, medica y juridica.

La relevancia actual del modelo reside en su enfoque de nicho: no compite como modelo generalista, sino que ofrece una mejora medible en tareas concretas de traduccion EN-FI y auditoria APA 7 frente a su modelo padre, con incrementos reportados por el autor de +2,72 puntos sobre 10 en la evaluacion ciega de 60 tareas y de +1,95 puntos porcentuales en la media de 15 benchmarks oficiales. Se distribuye en tres perfiles de cuantizacion APEX calibrados con una matriz de importancia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivada de Qwen3.6-35B-A3B, configuracion A4B, top_k=10) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (etiqueta A4B; numero exacto no especificado) |
| Longitud de contexto | no disponible en la model card (los benchmarks se ejecutan con 16384 tokens) |
| Tipos de cuantizacion | GGUF APEX Small (~2,70 bpw), APEX Medium (~3,28 bpw), APEX Good (~3,71 bpw); proyector vision F16 |
| Idiomas soportados | fines (fi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existe variante NVFP4 para vLLM en el repo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer con mezcla de expertos. Sobre el se construye Vipunen-35B-A4B mediante una columna SOMA/ARA en BF16 puro y una configuracion de enrutamiento A4B con top_k=10. La capa de especializacion Translator-APA7 se aplica mediante un LoRA de una sola pasada sobre full_experts con rango r=32, alpha=64 y subspace ortogonal qr_frozen_a, entrenado sobre 6.677 filas certificadas sin etiquetas de razonamiento interno (0 % de marcas think). La columna de "descensura" SOMA/ARA (capas L14-L39, alpha=1.0, solo atencion y experto compartido) se hereda intacta del modelo padre.

Las tres cuantizaciones GGUF se calibran con una matriz de importancia especifica del modelo generada con llama-imatrix. La model card no detalla el volumen total de tokens de entrenamiento ni la composicion exacta del dataset, mas alla de la mencion a las 6.677 filas certificadas del ajuste LoRA.

## Capacidades

- Traduccion bidireccional EN-FI de alta fidelidad, orientada a textos academicos, tecnicos, cientificos, medicos, juridicos y literarios.
- Soporte de bloque de glosario (`<glossary>`) para fijar terminologia y vocabulario equilibrado en finlandes.
- Auditoria y correccion de formato APA 7 en finlandes e ingles.
- Correccion de pruebas (proofreading) en ambos idiomas.
- Generacion de ficcion creativa, ensayo y dialogo, incluida ficcion adulta sin rechazos segun las pruebas del autor.
- Capacidad multimodal imagen-texto mediante el proyector `mmproj` F16 incluido en el repositorio.
- Conversacion multi-turno (etiqueta conversational).
- Compatibilidad con endpoints y con tool calling de la familia Qwen (BFCL V4 evaluado en la model card).
- Razonamiento y matematicas basicas (GPQA Diamond, GSM8K, ARC evaluados).

## Casos de uso

- Traduccion de articulos academicos EN-FI y FI-EN para publicacion: el ajuste APA 7 y el bloque de glosario permiten mantener terminologia consistente y formato de citas en un unico paso, reduciendo la revision manual posterior.
- Auditoria de manuscritos y tesis: el modelo detecta y corrige desviaciones de formato APA 7 en referencias, citas en texto y estructura, con una puntuacion media reportada de 8,57/10 frente a 3,15/10 del modelo padre en las 20 tareas de auditoria.
- Traduccion tecnica y juridica: las pruebas del autor reportan 8/8 tareas deterministas superadas en el bloque de tecnologia, ciencia, medicina y derecho, lo que lo hace adecuado para contratos, documentacion de producto y articulos cientificos.
- Localizacion de documentacion de producto EN-FI: el soporte de glosario permite fijar la terminologia de marca y mantenerla entre lotes de traduccion en pipelines automatizados con llama.cpp u Ollama.
- Edicion literaria y traduccion de ficcion: el bloque de literatura, ensayo y dialogo obtiene 4/4 tareas deterministas y 7,12/10, util para editoriales que traducen narrativa finlandesa al ingles o viceversa.
- Escritura creativa sin restricciones: la columna SOMA/ARA heredada elimina los rechazos en ficcion adulta (0/4 rechazos reportados), lo que resulta util para generos que los modelos alineados estandar suelen bloquear.
- Procesamiento de documentos escaneados con vision: el proyector `mmproj` F16 (0,84 GiB) permite extraer y traducir texto de imagenes, util para digitalizar material academico impreso.
- Despliegue local en estaciones de trabajo: los tres perfiles APEX caben en GPUs de 12 a 24 GB, lo que permite ejecutar el modelo en un portatil con GPU consumer sin depender de la nube.

## Benchmarks y rendimiento

Evaluacion ciega de especialista (60 tareas, juez externo congelado, sin fuga de datos), segun el autor:

| Metrica | Vipunen-35B-A4B (padre) | Translator-APA7 | Delta |
|---|---|---|---|
| Puerta determinista superada (60 tareas) | 40/60 (66,7 %) | 54/60 (90,0 %) | +23,3 pp |
| Media del juez congelado (0-10) | 5,52 | 8,24 | +2,72 |
| Auditor APA 7 (20 tareas, FI y EN) | 3,15 | 8,57 | +5,42 (2,72x) |
| Academico APA 7 EN-FI (12) | 7,35 | 8,58 (12/12 det) | +1,23 |
| Vocabulario equilibrado y glosario (12) | 7,62 | 8,58 | +0,96 |
| Tecnica, ciencia, medicina y derecho (8) | 6,38 | 7,50 (8/8 det) | +1,12 |
| Literatura, ensayo y dialogo (4) | 4,38 | 7,12 (4/4 det) | +2,74 |
| Ficcion adulta sin censura (4) | 5,00 | 7,12 (0/4 rechazos) | +2,12 |

Benchmarks oficiales (2x RTX 5090, TP=2, CUDAGraphs activados, contexto 16384), segun el autor:

| Benchmark | Qwen3.6-35B-A3B base | Vipunen-35B-A4B | Translator-APA7 |
|---|---|---|---|
| IFEval Prompt / Inst Strict | 55,27 / 64,15 % | 58,41 / 66,67 % | 65,80 / 72,54 % |
| GPQA Diamond | 70,20 % | 72,73 % | 73,23 % |
| ARC-Easy / ARC-Challenge | 71,68 / 54,78 % | 73,99 / 56,74 % | 78,79 / 60,49 % |
| GSM8K (estricto, 1024 tok) | 34,42 % | 16,91 % | 33,28 % |
| TruthfulQA MC1 / MC2 | 36,84 / 54,03 % | 36,35 / 54,60 % | 37,58 / 55,38 % |
| LiveCodeBench v6 (Pass@1, 175) | 34,86 % | 39,43 % | 38,29 % |
| BFCL V4 Single-Turn AST | 80,28 % | 83,00 % (73,64 % irrel.) | 80,67 % (80,17 % irrel.) |
| Media 14 tareas (sin GSM8K 1024) | 65,41 % | 66,72 % | 67,64 % |
| Media global 15 tareas | 63,34 % | 63,40 % | 65,35 % |

Rendimiento medido con llama-bench en CPU (24 hilos), segun el autor:

| Perfil | Tamano | pp512 (t/s) | tg128 (t/s) |
|---|---|---|---|
| APEX Medium | 12,06 GiB | 239,12 +/- 4,12 | 24,62 +/- 0,46 |
| APEX Medium (13,56 GiB) | 13,56 GiB | 205,66 +/- 15,35 | 25,83 +/- 0,14 |
| APEX Good | 15,64 GiB | 222,77 +/- 1,25 | 25,17 +/- 0,08 |

## Requisitos de hardware

- VRAM estimada: APEX Small 12,07 GiB (objetivo 12-16 GB de GPU); APEX Medium 13,57 GiB (objetivo 16 GB, perfil recomendado por el autor); APEX Good 15,65 GiB (objetivo 24 GB o superior, o Mac). Sumar 0,84 GiB del proyector `mmproj` F16 si se usa vision.
- GPU recomendadas: RTX 4090, RTX 5090, A100, H100; el autor cita explicitamente 2x RTX 5090 con TP=2 para las pruebas de benchmarks y recomienda vLLM con la variante NVFP4 en servidores Blackwell.
- Cabe en GPU consumer: si, en tarjetas de 12, 16 y 24 GB segun el perfil APEX elegido.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, Ollama; vLLM mediante el repo NVFP4 base para Blackwell.
- Latencia y throughput: en CPU con 24 hilos, entre 205 y 239 t/s en pp512 y entre 24,6 y 25,8 t/s en tg128 segun perfil. No se han publicado cifras de throughput en GPU en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Vipunen-35B-A4B-Translator-APA7 | 35,5 B (MoE A4B) | no disponible | Traduccion EN-FI y auditoria APA 7 | Apache 2.0 | GGUF, NVFP4 |
| Vipunen-35B-A4B (padre) | 35,5 B (MoE A4B) | no disponible | Modelo generalista finlandes | Apache 2.0 | NVFP4 |
| Qwen3.6-35B-A3B (base) | 35 B (MoE A3B) | no disponible | Modelo generalista multilingue | Apache 2.0 | safetensors |

No se dispone de datos de benchmarks de terceros sobre modelos de traduccion EN-FI comparables en la informacion proporcionada, por lo que la comparativa se limita a los eslabones de la cadena de derivacion del propio modelo.

## Limitaciones y advertencias

- El modelo esta especializado en fines e ingles; no se garantiza calidad en otros idiomas aunque herede capacidades multilingues del base.
- Los benchmarks presentados son autoevaluados por el autor con un juez externo congelado; no se han replicado de forma independiente en la informacion disponible.
- El rendimiento en GSM8K estricto (33,28 %) es notablemente inferior al del base Qwen3.6 (34,42 %) y muy superior al del padre (16,91 %), lo que sugiere sensibilidad al ajuste en tareas matematicas.
- LiveCodeBench y BFCL V4 muestran ligeros descensos frente al padre (-1,14 y -2,33 puntos), por lo que no es la mejor opcion para codigo o tool calling de proposito general.
- La eliminacion de rechazos en ficcion adulta es una decision de diseno del autor; implica riesgo de generar contenido inapropiado si no se aplican filtros en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-35B-A3B puede tener condiciones adicionales que conviene verificar en su repositorio original.
- La model card no especifica la longitud de contexto nativa del modelo; los benchmarks se ejecutan con 16384 tokens, pero el limite real no se documenta.
- Riesgo de alucinacion en citas APA 7 y referencias bibliograficas: el modelo puede generar entradas plausibles pero inexistentes, por lo que la auditoria debe complementarse con verificacion manual.
- Las cuantizaciones APEX a 2,70-3,71 bpw pueden degradar la calidad frente a la version NVFP4 de referencia; las metricas reportadas se midieron sobre el build NVFP4, no sobre los GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Vipunen-35B-A4B-Translator-APA7-GGUF
- Modelo base NVFP4: https://huggingface.co/kataguru/Vipunen-35B-A4B-NVFP4
- Modelo base de referencia: https://huggingface.co/kataguru/Vipunen-35B-A4B
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio llama.cpp (referenciado en la model card): no disponible como enlace explicito en la informacion proporcionada
- Paper o blog tecnico del autor: no disponible en la informacion proporcionada
