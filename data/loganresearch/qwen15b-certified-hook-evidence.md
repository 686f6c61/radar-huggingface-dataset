# LoganResearch/qwen15b-certified-hook-evidence

## Resumen

`LoganResearch/qwen15b-certified-hook-evidence` no es un modelo de lenguaje entrenado, sino un kit de reproduccion de evidencia de certificacion publicado por LoganResearch. El repositorio contiene el protocolo de evaluacion congelado (`EVAL_PROTOCOL.md`), las predicciones selladas por item del panel de validacion TEST-617 (`data/predictions_617.jsonl`) y un verificador de Python de biblioteca estandar (`scripts/verify_eval.py`) que recalcula todas las cifras principales de forma offline, sin GPU, sin red y sin dependencias de terceros.

El objeto de la medicion es un cabezal de decision ("certified head") que opera sobre `Qwen/Qwen2.5-1.5B-Instruct` y decide, para cada item de un panel de opcion multiple derivado de TruthfulQA (MC1, arXiv:2109.07958), si procede responder o abstenerse. La metrica principal es la precision de la decision de compuerta ("gate decision accuracy"), no la calidad generativa del modelo base.

La relevancia del artefacto es metodologica: documenta un resultado preregistrado con barras explicitas y permite verificarlo de forma independiente. El resultado declarado es una precision de compuerta del 70,02 % frente a la mejor linea base constante del 52,51 %, es decir, un margen estricto de +17,50 puntos sobre una barra preregistrada de +5,0 (PASS-STRICT). No se redistribuyen pesos ni se publica el cabezal; el kit es evidencia sobre la medicion, no una release de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio no contiene un modelo propio; el modelo base referenciado es un transformer decoder-only de la familia Qwen2.5) |
| Parametros totales | No disponible para el cabezal certificado; el modelo base referenciado es de 1,5 mil millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el kit no distribuye pesos) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (texto del kit y registros por item); los pesos del modelo base se rigen por su propia licencia |
| Formato de pesos | No aplica: no se redistribuyen pesos. Los artefactos son Markdown (`EVAL_PROTOCOL.md`), JSONL (`data/predictions_617.jsonl`), un script Python (`scripts/verify_eval.py`) y `SHA256SUMS` |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del cabezal certificado. La model card indica explicitamente que "the head's internals and decision point are the certified service component and stay server-side", de modo que no se publica ni la topologia, ni el mecanismo de decision, ni el procedimiento de entrenamiento del componente que emite los veredictos de proceder o abstenerse. El cabezal se sirve en vivo a traves de una API alojada.

Lo que si se documenta es el protocolo de medicion. El panel TEST-617 es una particion held-out congelada (semilla 42) reconstruible a partir de una revision publica fijada de TruthfulQA; su huella por item `(index, n_options, gold)` coincide con la evidencia publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`. Las predicciones selladas cubren 617 items y el verificador comprueba consistencia fila a fila, incluida la pertenencia al split congelado. La re-medicion completa del brazo base queda a cargo del usuario; el veredicto del cabezal certificado es el registro sellado que se distribuye.

## Capacidades

- Reproduccion offline de las cifras principales: `scripts/verify_eval.py` recalcula los conteos sellados (432/617 decisiones de compuerta correctas, 293/617 respuestas base correctas, margen estricto de +17,50 puntos) usando solo la biblioteca estandar de Python.
- Verificacion de integridad criptografica: `SHA256SUMS` cubre todos los ficheros del repositorio excepto el propio fichero de sumas.
- Auditoria de consistencia por item: cada fila de `data/predictions_617.jsonl` pasa comprobaciones de consistencia individuales, incluida la pertenencia al split held-out congelado de semilla 42.
- Reconstruccion del panel: el conjunto de evaluacion se puede regenerar desde la revision publica fijada de TruthfulQA segun la seccion 1 del protocolo.
- Decision de compuerta proceed/withhold sobre items de opcion multiple MC1: capacidad medida del cabezal, servida via API alojada, no ejecutable offline desde estos ficheros.
- No incluye generacion de texto, razonamiento abierto, codigo, matematicas, vision, tool calling, capacidades de agente ni soporte multilingue declarado.

## Casos de uso

- Auditoria de resultados de certificacion: un revisor independiente clona el repositorio, ejecuta `python3 scripts/verify_eval.py` y confirma que las cifras publicadas se reproducen con codigo de 0, sin GPU ni red. Es el caso de uso primario del kit.
- Verificacion de integridad de artefactos en cadena de custodia: `sha256sum -c SHA256SUMS` permite comprobar que ningun fichero del kit ha sido alterado antes de incorporarlo a un expediente de evaluacion.
- Revision por pares de protocolos preregistrados: el `EVAL_PROTOCOL.md` congelado y las barras explicitas (margen ≥ +5,0; engagement ≥ 55 %) permiten evaluar si el diseno experimental se fijo antes de observar los resultados.
- Construccion de pipelines de evaluacion reproducibles: el par protocolo mas verificador sirve como plantilla para certificar otros modelos o familias con paneles held-out y sumas de verificacion.
- Analisis de calibracion y abtencion: los registros por item permiten estudiar la relacion entre cobertura (274/617 items respondidos, 44,41 %) y precision entre respondidos (69,71 %) en un panel controlado.
- Docencia y formacion en metodologia de evaluacion: el kit ilustra de forma concreta la diferencia entre metrica de compuerta y precision base, y el uso de lineas base constantes como referencia trivial.

## Benchmarks y rendimiento

Resultados declarados sobre el panel held-out TEST-617 (n=617, ejecucion sellada):

| Metrica | Valor |
|---|---|
| Precision de decision de compuerta (certified gate) | 70,02 % (432/617) |
| Mejor linea base constante | 52,51 % |
| Margen estricto sobre la linea base | +17,50 puntos (barra preregistrada ≥ +5,0; PASS-STRICT) |
| Precision base sin ayuda (unaided) | 47,49 % (293/617) |
| Items respondidos | 274/617 (44,41 %) |
| Precision entre items respondidos | 69,71 % (barra de engagement ≥ 55 %, cumplida) |
| Items retenidos (withheld) | 343/617 (55,59 %) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- Inferencia del modelo: no aplica. El repositorio no contiene pesos y el cabezal certificado no es ejecutable offline desde estos ficheros.
- Verificacion de la evidencia: cualquier maquina con Python 3 y biblioteca estandar; no requiere GPU, ni red, ni paquetes de terceros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica al kit. Para el modelo base referenciado (Qwen2.5-1.5B-Instruct) la informacion disponible no incluye requisitos de VRAM.
- Opciones de despliegue: el cabezal se sirve mediante la API alojada del servicio; el kit en si se ejecuta como script local. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El artefacto es un kit de evidencia de evaluacion, no un modelo desplegable, por lo que no existen alternativas equivalentes de la misma categoria identificadas en la informacion proporcionada. Como referencia del modelo base subyacente:

| Aspecto | Este kit | Qwen/Qwen2.5-1.5B-Instruct |
|---|---|---|
| Naturaleza | Evidencia de certificacion y verificador | Modelo de lenguaje instruct |
| Parametros | No aplica | 1,5 mil millones |
| Pesos distribuidos | No | Si, bajo su propia licencia |
| Ejecutable offline | Solo el verificador | Si, con el runtime adecuado |
| Licencia | Apache-2.0 (texto y registros) | La de su pagina en el hub |

## Limitaciones y advertencias

- El alcance de la afirmacion es estricto: solo se certifica la precision de las decisiones proceed/withhold en el panel congelado. No se reclama ninguna propiedad de generacion abierta, honestidad o rechazo mas alla de la tarea puntuada.
- No se reclama transferibilidad del resultado a otras familias de modelos, otros tamanos ni otras distribuciones de datos.
- El cabezal no es re-ejecutable offline a partir de estos ficheros; sus veredictos son un registro sellado y su funcionamiento interno permanece en el servidor.
- La re-medicion completa del brazo base requiere compute propio del usuario; el kit no la automatiza.
- Los registros por item incorporan letras gold derivables del dataset publico TruthfulQA MC1, lo que puede facilitar la contaminacion si se reutiliza el panel en evaluaciones futuras no ciegas.
- Riesgo de interpretacion erronea: la cifra del 70,02 % corresponde a una decision de compuerta sobre opcion multiple, no a la precision generativa del modelo base (47,49 % sin ayuda).
- No se declaran sesgos conocidos, idiomas soportados ni restricciones adicionales de uso comercial mas alla de la licencia Apache-2.0 del kit y de la licencia propia del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente del resultado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LoganResearch/qwen15b-certified-hook-evidence
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Evidencia relacionada: https://huggingface.co/LoganResearch/qwen2.5-1.5b-instruct-distilled
- Paper de TruthfulQA (MC1): https://arxiv.org/abs/2109.07958
