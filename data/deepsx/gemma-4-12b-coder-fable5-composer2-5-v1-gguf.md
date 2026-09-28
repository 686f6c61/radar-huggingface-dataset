# deepsx/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF

## Resumen

Gemma4-12B-Coder (Composer 2.5 × Fable 5) es un fine-tune de la variante instructiva google/gemma-4-12B-it orientado exclusivamente a generacion y razonamiento sobre codigo Python verificable. Lo publica el usuario deepsx en formato GGUF, y su rasgo diferencial es que fue destilado a partir de cadenas de pensamiento (chain-of-thought) cuyo codigo resultante se ejecuto contra los tests de cada problema antes de entrar en el dataset: solo se conservaron las trazas que resolvian la tarea correctamente. El modelo razona de forma explicita (casos limite, complejidad, enfoque) antes de emitir la solucion.

La arquitectura es un transformer decoder-only de 11.907.350.576 parametros reales (aproximadamente 11,9 B), empaquetado en GGUF con la arquitectura interna `gemma4_unified`. Su ventana de contexto es de 262.144 tokens (256K), cifra que corrige un bug de metadatos del modelo base, que declaraba 131.072 tokens en el `config.json` original de Google. Esa correccion se ha reaplicado a todos los quants publicados.

Su relevancia practica es la huella: con el quant Q2_K ocupa 4,5 GB y el recomendado Q4_K_M 6,87 GB, de modo que un asistente de codigo privado y totalmente offline cabe en GPUs de gama media, portatiles con memoria unificada o equipos con 8-16 GB de VRAM. La licencia declarada es Apache-2.0, aunque el modelo base mantiene sus propios terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; arquitectura GGUF `gemma4_unified`; fine-tune de google/gemma-4-12B-it |
| Parametros totales | 11.907.350.576 (~11,9 B), dato real de safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens (256K); los GGUF se re-parchearon desde 131.072 |
| Tipos de cuantizacion | Q2_K (4,5 GB), Q3_K_M (5,7 GB), Q4_K_M (6,87 GB), Q6_K (9,11 GB), Q8_0 (11,8 GB) |
| Idiomas soportados | no disponible (la model card no los declara; los datos de entrenamiento son problemas de Python) |
| Licencia | apache-2.0 declarada; el modelo base google/gemma-4-12B-it esta sujeto a sus propios terminos |
| Formato de pesos | GGUF en este repositorio; safetensors en el maestro de referencia |

## Arquitectura y entrenamiento

Se trata de un fine-tune de ajuste instructivo sobre google/gemma-4-12B-it, un transformer decoder-only denso de ~11,9 B de parametros. No se documentan cambios arquitectonicos estructurales propios: la innovacion esta en el pipeline de datos y en el formato de salida, que separa el razonamiento explicito de la solucion final. El repositorio se distribuye en GGUF y requiere una build reciente de llama.cpp, ya que usa la arquitectura `gemma4_unified`.

El entrenamiento se describe como una destilacion sobre dos fuentes complementarias de chain-of-thought, ambas restringidas a tareas de programacion Python algoritmica o a nivel de funcion que incluyen tests deterministas. La fuente principal son trazas reales generadas por Composer 2.5: el profesor resolvio cada problema, su codigo se ejecuto contra los tests de la tarea y solo se conservaron las soluciones que pasaron. La fuente auxiliar, etiquetada como Fable 5, ataca los problemas que Composer 2.5 fallo, rederivando una cadena de pensamiento nueva y autoconsistente que vuelve a estar condicionada a superar los tests; estas trazas son sinteticas (CoT racionalizada) y se marcan de forma separada para poder distinguirlas. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de codigo Python: funciones y algoritmos completos, con especial enfasis en problemas que admiten validacion automatica mediante tests.
- Razonamiento explicito antes de responder (modo thinking): el modelo expone casos limite, complejidad y enfoque antes de emitir la solucion.
- Depuracion y analisis de casos limite, derivados del entrenamiento sobre trazas que ya resolvian correctamente esos escenarios.
- Generacion de soluciones ejecutables y autocontenidas, fruto del filtrado por ejecucion de tests durante el entrenamiento.
- Uso conversacional (pipeline `text-generation`, tag `conversational`), orientado a interacciones de asistencia de codigo.
- Tool calling / function calling: no disponible. La model card no lo documenta para la version v1; la capacidad agentica se anuncia para la version v2.
- Soporte de agentes y razonamiento multi-paso: no disponible en v1 segun la informacion proporcionada.
- Capacidades multilingues: no disponible. No se declaran idiomas soportados.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo local en equipos modestos: con el quant Q2_K (4,5 GB) o Q3_K_M (5,7 GB) el modelo se ejecuta en GPUs de 8 GB VRAM, lo que permite tener un asistente de programacion offline en portatiles de gama media sin dependencia de API.
- Resolucion de ejercicios algoritmicos con validacion: dado que el entrenamiento filtro por paso de tests, el modelo es adecuado para generar funciones a partir de enunciados con casos de prueba definidos, como los tipicos de plataformas de practicas o entrevistas tecnicas.
- Revision y depuracion de funciones existentes: su salida de razonamiento explicito permite que el modelo enumere casos limite y complejidad antes de proponer una correccion, util en revisiones de pull requests.
- Generacion de tests unitarios: al haber sido entrenado sobre pares problema-solucion verificados por tests, puede producir baterias de casos de prueba para funciones ya escritas, con el propio modelo actuando como generador de escenarios.
- Analisis de ficheros y repositorios extensos: la ventana de 256K tokens permite cargar varios modulos o un fichero de gran tamano y pedir un analisis global; con Q4_K_M caben ~128K tokens en 24 GB de VRAM usando cache KV q8_0, o aproximadamente el doble con cache q4_0.
- Entornos con requisitos estrictos de privacidad: al ser un modelo local que no requiere conexion, encaja en escenarios con codigo propietario o datos regulados donde no se puede enviar codigo a servicios en la nube.
- Tutoria y explicacion de soluciones: la separacion entre razonamiento y respuesta permite usar el modelo como herramienta didactica que justifica el enfoque elegido, no solo el resultado final.
- Punto de partida para fine-tunes propios: el maestro en safetensors permite derivar nuevas cuantizaciones (GGUF, MLX, AWQ) o continuar el entrenamiento sobre un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta version v1 en la informacion disponible. El unico dato numerico de la model card corresponde a la version v2 (agentica) y se reproduce a continuacion con esa salvedad explicita, ya que no es una medicion de v1.

| Benchmark | gemma-4-12B-it (base) | v2 (agentica) | v1 (este modelo) |
|---|---|---|---|
| tau2-bench telecom, local, mismo harness, Q8_0 | ~15% | ~55% | no disponible |

## Requisitos de hardware

Estimaciones de contexto maximo segun VRAM y quant, tomadas de la model card (asumen cache KV `q8_0` y unos 1,5 GB de sobrecarga; con cache `q4_0` el contexto aproximadamente se duplica). El maximo es 256K y «—» indica que no cabe.

| VRAM / memoria unificada | Q2_K (4,5 GB) | Q3_K_M (5,7 GB) | Q4_K_M (6,87 GB) | Q6_K (9,11 GB) | Q8_0 (11,8 GB) |
|---|---|---|---|---|---|
| 8 GB | ~16K ctx | ~10K | ajustado (~2-4K) | — | — |
| 12 GB | ~48K | ~38K | ~30K | ~12K | — |
| 16 GB | ~80K | ~72K | ~64K | ~44K | ~22K |
| 24 GB | ~200K | ~160K | ~128K | ~110K | ~88K |
| 32 GB | 256K (max) | 256K | 256K | ~230K | ~190K |

- VRAM estimada para inferencia: 4,5 GB (Q2_K), 5,7 GB (Q3_K_M), 6,87 GB (Q4_K_M, recomendado), 9,11 GB (Q6_K) y 11,8 GB (Q8_0), mas la cache KV y la sobrecarga del runtime.
- GPU recomendadas (estimacion a partir de los requisitos de VRAM): RTX 3060 12 GB o RTX 4070 para Q4_K_M con contexto medio; RTX 3090 o RTX 4090 para contextos largos con Q6_K/Q8_0; A100 40/80 GB, H100 o RTX 5090 para exprimir los 256K tokens. La model card no nombra GPU concretas.
- Cabe en GPU de consumo: si. Q2_K y Q3_K_M en GPUs de 8 GB; Q4_K_M en GPUs de 8-12 GB con contexto reducido; Q6_K y Q8_0 a partir de 16 GB.
- Memoria unificada: los equipos Apple Silicon y las GPU integradas con memoria unificada pueden ejecutar los mismos quants con los mismos requisitos de memoria, con velocidades inferiores a una GPU dedicada.
- Opciones de despliegue: llama.cpp (`llama-server`) es la via documentada; requiere una build reciente porque el modelo usa la arquitectura `gemma4_unified` y las builds antiguas no lo cargan. El resto de runtimes compatibles con GGUF (Ollama, LM Studio, TGI, vLLM) no se mencionan en la model card para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-12B-Coder v1 (este modelo) | ~11,9 B | 256K | Codigo Python verificado por tests, con CoT explicita | apache-2.0 declarada | GGUF en este repo; safetensors en el maestro |
| gemma-4-12B-it (base) | ~11,9 B | 256K (corregido desde 131K) | Modelo instructivo generalista | terminos de Google para Gemma | HuggingFace |
| Gemma4-12B agentic v2 (mismo autor) | ~11,9 B | 256K | Agentico + codigo, con tool use | no disponible en la informacion proporcionada | GGUF publicado; safetensors anunciado |

No se dispone de datos de otros modelos de codigo de tamano comparable en la informacion proporcionada, por lo que no se puede establecer una comparacion de rendimiento con alternativas externas.

## Limitaciones y advertencias

- No hay ningun benchmark publicado para esta version v1, por lo que su rendimiento real frente al modelo base o a alternativas no esta cuantificado.
- El entrenamiento se limita a problemas de Python verificables con tests; es previsible un rendimiento inferior en otros lenguajes, en tareas de sistema, en refactors de repositorios completos o en codigo que dependa de frameworks y APIs externas no cubiertos por ese tipo de dataset.
- No se documenta el volumen del dataset de destilacion ni la proporcion entre trazas reales y sinteticas, lo que dificulta evaluar el riesgo de sobreajuste a los estilos de los profesores Composer 2.5 y Fable 5.
- Parte de las trazas son sinteticas (CoT racionalizada de Fable 5), una tecnica que puede producir razonamientos plausibles que no reflejan el proceso real seguido para llegar a la solucion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar APIs inexistentes, firmas de funciones erroneas o justificaciones de codigo que no compila; la validacion por ejecucion es imprescindible en produccion.
- Cuantizacion agresiva: Q2_K y Q3_K_M degradan la calidad respecto a Q4_K_M o Q6_K; la propia model card desaconseja Q2_K cuando el espacio lo permite.
- Limitaciones de contexto: alcanzar los 256K tokens exige 32 GB de memoria o mas; en configuraciones de 8-16 GB el contexto efectivo cae a decenas de miles de tokens segun el quant.
- Idioma: no se declaran idiomas soportados y los datos de entrenamiento son problemas de codigo en ingles; el comportamiento en castellano no esta documentado.
- Licencia: la model card declara apache-2.0, pero el modelo base google/gemma-4-12B-it esta sujeto a los terminos de Google. Conviene verificar la compatibilidad de ambas licencias antes de un uso comercial.
- Procedencia: la model card enlaza repetidamente a la cuenta `yuxinlu1`, mientras que el repositorio esta publicado bajo la cuenta `deepsx`. El repositorio registra 0 descargas y 0 likes, por lo que no hay validacion externa de la comunidad.
- Metadatos: el modelo base arrastraba un bug de `max_position_embeddings` (131.072 en lugar de 262.144) que se propago a cuantizaciones posteriores. Si se descargo una copia anterior, hay que volver a descargarla para obtener el contexto completo.
- Tool calling y uso agentico: no estan soportados en v1 segun la informacion disponible; si se necesitan, la model card remite a la version v2.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/deepsx/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Maestro en safetensors de v1: https://huggingface.co/yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1
- Version v2 agentica en GGUF: https://huggingface.co/yuxinlu1/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper, blog o demo adicionales: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo.
