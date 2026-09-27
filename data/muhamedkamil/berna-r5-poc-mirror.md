# muhamedkamil/berna-r5-poc-mirror

## Resumen

Berna R5 es un modelo de lenguaje entrenado desde cero (from-scratch) que se presenta como prueba de concepto (PoC) de 50 millones de parámetros de una arquitectura denominada DNA-Kernel Plexus, descrita por sus autores (Berna Labs) como bioinspirada. El repositorio analizado es un espejo (mirror) publicado por el usuario muhamedkamil bajo el identificador `muhamedkamil/berna-r5-poc-mirror`; la model card y la licencia hacen referencia al proyecto original de Berna Labs. Su proposito declarado es validar cinco resultados teoricos sobre aprendizaje continuo sin olvido catastrofico antes de escalar a 1.500 millones de parametros.

La arquitectura se organiza en un pipeline de seis etapas (sensores, medula espinal, plexus, celulas, nucleo DNA y registro) y utiliza celulas de conocimiento dinamicas que nacen, se dividen y se interconectan segun una variedad de saturacion de conocimiento de seis dimensiones (L, W, H, D, T, E). Incorpora un vocabulario de 200.000 tokens repartido entre texto (0-63.999), vision (64.000-163.999) y audio (164.000-199.999), aunque no se documenta que existan pesos o cabezas entrenadas para vision o audio en esta release. El contexto declarado es de 8.192 tokens y el entrenamiento se realizo sobre aproximadamente 800 millones de tokens.

Su relevancia actual es exclusivamente investigadora: se trata de un banco de pruebas para tecnicas de aprendizaje continuo con garantias de olvido cero (F_j <= 1e-6), no de un modelo competitivo en tareas genericas. La propia model card excluye explicitamente el despliegue en produccion, las decisiones de alto riesgo y la comparacion directa con modelos de clase GPT-4. No se han ejecutado benchmarks estandar (MMLU, HumanEval, GSM8K) y el repositorio registra cero descargas y cero likes en la fecha de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de 6 etapas (sensores, medula espinal, plexus, celulas, nucleo DNA, registro) con celulas de conocimiento dinamicas y etiqueta mixture-of-experts |
| Parametros totales | 50M (PoC); objetivo declarado 1,5B en trabajo futuro |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Berna Research License v1.0 (identificador `berna-research-1.0`); uso comercial requiere licencia separada de Berna Labs |
| Formato de pesos | PyTorch (no se especifica safetensors, GGUF ni otros formatos) |
| Vocabulario | 200.000 tokens: texto 0-63.999, vision 64.000-163.999, audio 164.000-199.999 |
| Cromosomas DNA | 100 (10 grupos x 10) |
| Dimensiones de conocimiento | 6 (L, W, H, D, T, E) |
| Libreria | pytorch |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura propietaria denominada DNA-Kernel Plexus, estructurada como un pipeline de seis etapas que va desde sensores de entrada hasta un registro final, pasando por un modulo plexus y un nucleo DNA. El mecanismo central son celulas de conocimiento dinamicas que se crean, se dividen y se interconectan en funcion de una variedad de saturacion de conocimiento de seis dimensiones. La model card declara 100 cromosomas DNA organizados en 10 grupos de 10 y un equilibrio de saturacion objetivo de S* = 0,85. El vocabulario de 200.000 tokens reserva rangos completos para vision y audio, si bien no se documenta que dichas modalidades se hayan entrenado en esta release. Los tags del repositorio incluyen `mixture-of-experts` y `dna-kernel`, pero no se detalla el numero de expertos, el enrutador ni el ratio de parametros activos.

El entrenamiento se realizo desde cero sobre aproximadamente 800 millones de tokens: WikiText-103 (~100M), el subconjunto de Python de The Stack (~500M) y OpenWebMath (~200M). Se uso el optimizador AdamW, una tasa de aprendizaje de 3e-4, tamano de lote 4, longitud de secuencia 512 y semilla 42, sobre una RTX 5090 con 32 GB de VRAM, con validacion en CPU. No se menciona ninguna fase de RLHF, DPO ni ajuste por instrucciones. La innovacion declarada es el aprendizaje continuo con olvido cero demostrado (max F_j = 0,0 en el PoC) y un mecanismo de fallo cerrado ("Zero-Error Creed") segun el cual cualquier violacion de un invariante declarado dispara FAIL_CLOSED en tiempo de ejecucion.

## Capacidades

- Generacion de texto en ingles: es la unica modalidad con datos de entrenamiento documentados de forma explicita.
- Modelado de lenguaje y aprendizaje continuo: la capacidad central validada es la incorporacion de conocimiento nuevo sin degradar el previo (olvido cero).
- Codigo: se entreno sobre el subconjunto de Python de The Stack (~500M tokens), por lo que se espera cierta capacidad de generacion de codigo Python, aunque no se aporta ninguna evaluacion al respecto.
- Matematicas: se entreno sobre OpenWebMath (~200M tokens); no hay evaluacion publicada que cuantifique esta capacidad.
- Razonamiento multi-paso y agentes: no disponible; no se documenta soporte de tool calling ni de function calling.
- Soporte de agentes: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades especiales: la model card describe un espacio de tokens reservado para vision y audio, pero no confirma que existan modulos entrenados ni pesos que los activen. No se documenta modo de razonamiento explicito (thinking mode).
- Crecimiento dinamico de la red: las celulas de conocimiento pueden dividirse y reconectarse, con el numero de celulas acotado por la capacidad declarada (teorema de crecimiento equilibrado).

## Casos de uso

- Investigacion en aprendizaje continuo: el modelo sirve como banco de pruebas reproducible (semilla 42, configuracion documentada) para medir olvido catastrofico al incorporar nuevas tareas de forma secuencial.
- Validacion de arquitecturas dinamicas: investigadores que trabajen con redes que crecen o se reorganizan pueden usar el PoC para contrastar sus propias heuristicas de division de celulas contra el equilibrio de saturacion S* = 0,85 declarado.
- Experimentos de ablacion a bajo coste: con 50M de parametros, permite iterar sobre hiperparametros y variantes arquitectonicas en una unica GPU de consumo antes de comprometer recursos en el objetivo de 1,5B.
- Reproducibilidad de resultados teoricos: los cinco teoremas declarados (equilibrio de saturacion, incorporacion fiable, olvido cero, crecimiento equilibrado y conectividad del plexus) pueden intentar reproducirse a partir del codigo del repositorio de GitHub.
- Estudio de tokenizadores multimodales: el vocabulario de 200.000 tokens con rangos separados para texto, vision y audio es util para analizar esquemas de tokenizacion unificada, aunque las modalidades no visuales no esten entrenadas.
- Docencia y formacion: como ejemplo didactico de arquitectura no convencional y de gestion de invariantes en tiempo de ejecucion mediante politicas fail-closed.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, analisis de documentos ni ninguna tarea de negocio: la propia model card excluye el despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; la model card indica explicitamente que aun no se han ejecutado. La unica evaluacion reportada corresponde a la validacion de los cinco teoremas del PoC:

| Experimento | Resultado | Superado |
|---|---|---|
| Convergencia de saturacion | \|S - S*\| = 0,053 | Si |
| Capacidad de division | 19 <= 20 | Si |
| Delta de incorporacion | min = +0,02 | Si |
| Olvido cero | max F_j = 0,0 | Si |
| Convergencia del plexus | True | Si |

Estos valores miden propiedades internas de la arquitectura, no calidad de generacion de lenguaje, y no son comparables con benchmarks de modelos convencionales.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion propia a partir de los 50M de parametros, no confirmada por el autor): en precision completa (fp32) en torno a 200 MB solo de pesos; en fp16/bf16 en torno a 100 MB; en int8 en torno a 50 MB; en int4 en torno a 25 MB. A ello hay que sumar la cache KV, cuyo tamano exacto no puede calcularse porque no se publican el numero de capas transformer convencionales ni la dimension de cabeza.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente a nivel de pesos; el autor entreno el PoC en una RTX 5090 de 32 GB, aunque ese margen no es necesario para inferencia a esta escala.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, 4060, 4090, etc.) e incluso en CPU, que el autor uso para las tareas de validacion.
- Opciones de despliegue: no disponible. Al tratarse de una arquitectura propietaria de seis etapas, no hay confirmacion de compatibilidad con vLLM, llama.cpp, Ollama o TGI, y no se distribuyen pesos en GGUF. El unico camino documentado es el codigo del repositorio de GitHub de Berna Labs.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. La siguiente tabla contrasta unicamente caracteristicas estructurales y de licencia con modelos de parametros similares; los valores de rendimiento se marcan como no disponibles para todos ellos en el contexto de esta ficha, ya que no se han medido ejecuciones comparables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| Berna R5 PoC (este) | 50M | 8.192 | Berna Research 1.0 (comercial con licencia aparte) | HuggingFace (espejo) y GitHub | No ejecutados |
| Pythia-70M | 70M | 2.048 | Apache 2.0 (segun el proyecto Pythia) | HuggingFace | No comparado en esta ficha |
| GPT-2 (124M) | 124M | 1.024 | MIT (segun el repositorio original) | HuggingFace | No comparado en esta ficha |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 (segun el proyecto) | HuggingFace | No comparado en esta ficha |

La comparacion relevante no es de rendimiento sino de proposito: Pythia, GPT-2 y TinyLlama son modelos de lenguaje generalistas con benchmarks publicados y pesos en formatos estandar, mientras que Berna R5 es un PoC de investigacion sobre aprendizaje continuo, sin benchmarks y con una licencia restrictiva para uso comercial. Los datos de contexto y licencia de los modelos alternativos se indican a titulo orientativo y deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Escala de prueba de concepto: solo 50M de parametros; la version de 1,5B es trabajo futuro y no esta disponible.
- Ausencia total de benchmarks: no se han ejecutado MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar, por lo que no existe evidencia publica de calidad de generacion.
- No apto para produccion: la model card lo excluye explicitamente, junto con decisiones de alto riesgo y comparaciones con modelos de clase GPT-4.
- Idioma: unicamente ingles declarado; no hay soporte multilingue documentado ni evaluado.
- Riesgo de alucinacion: no cuantificado; el entrenamiento con solo ~800M tokens es muy limitado en cobertura factual.
- Discrepancia de procedencia: el repositorio es un espejo publicado por un tercero (muhamedkamil), no el repositorio oficial de Berna Labs; conviene verificar la integridad de los pesos y el contenido de la licencia en el origen.
- Arquitectura no estandar: al no ser un transformer convencional, es probable que no funcione con ecosistemas de inferencia habituales (vLLM, llama.cpp, Ollama, TGI); no se distribuyen pesos en GGUF.
- Multimodalidad no confirmada: los rangos de tokens de vision y audio existen en el vocabulario, pero no hay evidencia de modulos entrenados para esas modalidades.
- Diseno sin optimizar: la propia model card reconoce que el diseno de 100 cromosomas no se ha optimizado empiricamente.
- Federacion multi-nodo: no probada.
- Licencia: el uso comercial requiere una licencia separada de Berna Labs; el uso gratuito se limita a ambito academico, cientifico y personal.
- Referencia bibliografica no verificable: la cita remite a un preprint de arXiv del ano 2026 que, segun la propia model card, esta pendiente de publicacion.
- Adopcion nula: cero descargas y cero likes en la fecha de consulta, sin comunidad que haya validado los resultados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhamedkamil/berna-r5-poc-mirror
- Repositorio GitHub del proyecto: https://github.com/berna-labs/berna-r5
- Pruebas teoricas: https://github.com/berna-labs/berna-r5 (directorio `theory/proofs/`)
- Esquema del registro: https://github.com/berna-labs/berna-r5 (archivo `registry/schema.sql`)
- Licencia: archivo `LICENSE` del repositorio de HuggingFace
- Paper: pendiente de publicacion en arXiv, no disponible
- Contacto para licencias comerciales: info@bernalabs.com
