# ManniX-ITA/Ternary-Bonsai-2-27B-CRACK-MTP-GGUF

## Resumen

Ternary-Bonsai-2-27B-CRACK-MTP-GGUF es un paquete GGUF publicado por el usuario ManniX-ITA que combina dos piezas: los pesos ternarios del modelo Bonsai 2 27B en su variante CRACK de dealignai (una version abliterada, sin comportamiento de rechazo, del Ternary Bonsai 2 27B de PrismML) y una cabeza MTP (Multi-Token Prediction, tambien llamada NextN) procedente de Qwen/Qwen3.8-27B. El resultado es un unico fichero capaz de autoespecular, es decir, de generar borradores con su propia cabeza auxiliar sin necesidad de un segundo modelo drafter externo.

El modelo tiene 27.320.697.856 parametros y se distribuye cuantizado en formato ternario PQ2_0 con un empaquetado de 2,13 bits por peso, lo que deja el fichero completo en 7,66 GB pese al tamano del modelo. La cabeza MTP se almacena aparte en q8_0 y se integra como una capa adicional (block_count, con nextn_predict_layers = 1) dentro del mismo GGUF.

Su relevancia es doble: por un lado demuestra una via practica para acelerar la inferencia de un modelo de 27B en una GPU de consumo (RTX 3090) mediante decodificacion especulativa autocontenida, con un aumento medido de 46,0 a 66,2 tokens por segundo en una prueba de codigo; por otro, es un ejemplo del ecosistema de herramientas emergentes (opencoti, xOllama) necesarias para ejecutar pesos ternarios junto con una cabeza NextN en una arquitectura híbrida de la familia Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de la familia Qwen3.5 (hiperparametros `qwen35.*`), con capa NextN/MTP adicional |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PQ2_0 (ternario, empaquetado de 2,13 bpw) para el cuerpo; q8_0 para la cabeza MTP. No existe bundle PTQ1_0 (dealignai solo publica PQ2_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Bonsai-2-27B-PQ2_0-CRACK-MTP.gguf`, 7,66 GB) |
| Modelos base | dealignai/Bonsai-2-27B-Ternary-CRACK-GGUF; prism-ml/Ternary-Bonsai-2-27B-gguf |
| Cabeza MTP | Qwen/Qwen3.8-27B (tensores `mtp.*`, exportados con `convert_hf_to_gguf.py --mtp --outtype q8_0`) |
| Proyector de vision | No incluido; usar `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` o `-BF16.gguf` de PrismML con `--mmproj` |
| Motor de inferencia requerido | opencoti llamafile (corte c11); el fork de llama.cpp de PrismML ejecuta los pesos ternarios pero no la cabeza MTP integrada |
| sha256 del fichero | `6c6b6ef5a8c0eec092c42a79cfc423f2b39bb46fa1bf492d02fce85270351d5b` |
| Fecha de publicacion | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF, no un entrenamiento nuevo. El cuerpo procede del Bonsai 2 27B de PrismML, del que se conservan arquitectura e hiperparametros; dealignai aplico sobre el una abliteracion a nivel de pesos (eliminacion del comportamiento de rechazo) y lo publico como Bonsai-2-27B-Ternary-CRACK. Los pesos se empaquetan en PQ2_0 ternario a 2,13 bits por peso, con parte de los tensores rotados mediante transformada de Hadamard. La arquitectura se identifica en los hiperparametros compartidos como `qwen35` y es descrita por el autor como un hibrido de la familia Qwen3.5.

La aportacion tecnica del bundle es la cabeza NextN/MTP: se exportan los tensores `mtp.*` de Qwen/Qwen3.8-27B, se cuantizan a q8_0 y se anaden como una capa extra numerada `block_count`, fijando `nextn_predict_layers = 1`. El script `bonsai2-mtp-bundle.py` de opencoti rechaza el empaquetado si los hiperparametros compartidos `qwen35.*` o el vocabulario no coinciden o si algun tensor colisiona. La cabeza permanece en la base normal (no esta entre los tensores rotados con Hadamard) y el motor aplica la transformada inversa a su busqueda de embeddings. Fuera de esa capa anadida, todos los tensores del fichero son byte a byte los del fichero de dealignai. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento y generacion de codigo, segun la prueba de velocidad publicada con un prompt de programacion.
- Autoespeculacion mediante cabeza MTP integrada: `--spec-type draft-mtp`, con profundidad de borrador 2.
- Entrada de imagenes, pero solo si se anade externamente un proyector `mmproj` de PrismML mediante `--mmproj`; no esta incluido en el repositorio.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Comportamiento sin rechazo (abliterado a nivel de peso), orientado a uso adulto y de investigacion.
- Modo de pensamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en local sobre una unica GPU de consumo: con 7,66 GB de pesos y decodificacion especulativa activada, el modelo produjo 66,2 tokens/s en una RTX 3090 con un prompt de programacion, lo que lo hace viable para autocompletado y generacion de fragmentos en un puesto de trabajo sin GPU de datacenter.
- Servidor de inferencia personal en estacion de trabajo: el comando `opencoti-llamafile --server -m Bonsai-2-27B-PQ2_0-CRACK-MTP.gguf -ngl 99 -fa on --spec-type draft-mtp` levanta un endpoint compatible con la API de OpenAI para uso individual o de equipo reducido.
- Investigacion en seguridad y red teaming: al estar abliterado a nivel de pesos, es util para estudiar que contenidos genera un modelo sin capa de rechazo y para calibrar clasificadores y moderadores propios frente a ese tipo de salidas.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: el bundle permite medir aceptacion de borradores (0,76 en la primera posicion y 2,3 tokens por paso en la prueba publicada) frente al modelo base sin cabeza MTP, con la misma maquina y el mismo prompt.
- Generacion de contenido narrativo para adultos con moderacion propia: el autor lo publica para uso adulto, de modo que el despliegue responsable implica anteponer una capa de filtrado propia antes de exponerlo a terceros.
- Analisis de imagenes en local anadiendo el proyector: cargando `Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf` con `--mmproj`, el modelo lee imagenes; el autor verifico que ambos proyectores interpretan correctamente una imagen de prueba junto con este fichero.
- Pruebas de integracion de cabezas MTP en motores propios: el bundle sirve como caso de referencia reproducible (script `bonsai2-mtp-bundle.py`) para quien necesite anadir autoespeculacion a un GGUF existente sin distribuir un drafter separado.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados son mediciones de velocidad de decodificacion realizadas con xOllama 0.40.3-xollama.1 sobre el motor opencoti c11, en una RTX 3090, con temperatura 0, un prompt de codigo y entre 600 y 640 tokens generados.

| Fichero | Sin MTP | Con MTP (profundidad 2) | Aceptacion |
|---|---|---|---|
| CRACK PQ2_0 (este bundle) | 46,0 tok/s | 66,2 tok/s | 0,76 en la primera posicion; 2,3 tokens por paso |
| PQ2_0 base, mismo prompt (referencia) | 45,8 tok/s | 68,7 tok/s | 0,71 |

El propio autor advierte que un solo prompt no constituye un benchmark. En doce prompts de conversacion, el modelo base dio entre 46 y 57 tok/s en la misma tarjeta, por lo que el rango esperado de aceleracion es de 1,25x a 1,5x segun el tipo de contenido generado. Las evaluaciones de refusal y de MMLU de dealignai estan en su propia model card y no se repitieron para este bundle; no se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks de calidad en la informacion disponible para este fichero.

## Requisitos de hardware

- VRAM estimada: unos 7,66 GB solo para los pesos del cuerpo en PQ2_0, mas la cabeza MTP en q8_0, mas la cache KV (no se especifica su tamano porque la longitud de contexto no esta disponible) y el proyector de vision si se usa.
- GPU recomendadas: el autor aporta mediciones en RTX 3090 (24 GB). Cualquier GPU con 24 GB o mas (RTX 3090, RTX 4090, A100, H100) deberia poder ejecutarlo con holgura dado el tamano del fichero.
- Cabe en GPU de consumo: si, en tarjetas de gama alta con VRAM suficiente; con 7,66 GB de pesos hay margen en modelos de 12-16 GB, aunque el margen real depende de la cache KV, que no se puede calcular sin conocer la longitud de contexto.
- Motor de despliegue: opencoti llamafile (corte c11) es el unico citado como capaz de ejecutar simultaneamente los pesos ternarios y la cabeza NextN integrada. El fork de llama.cpp de PrismML ejecuta los pesos ternarios pero no la cabeza del bundle.
- Alternativa de despliegue con interfaz de usuario: xOllama `v0.40.3-xollama` o posterior, con las etiquetas `mannix/bonsai-2-27b-crack` (MTP + vision Q8_0) y `mannix/bonsai-2-27b-crack:mtp-pq2_0` (solo texto, con cabeza).
- vLLM, TGI, Ollama estandar, llama.cpp estandar: no aparecen citados como compatibles con este fichero en la informacion disponible.
- Latencia y throughput: 46,0 tok/s sin MTP y 66,2 tok/s con MTP en RTX 3090; entre 46 y 57 tok/s en conversacion segun el prompt. No hay datos de latencia por peticion ni de throughput agregado en servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Cabeza MTP | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ManniX-ITA/Ternary-Bonsai-2-27B-CRACK-MTP-GGUF (este) | 27,3B | GGUF, PQ2_0 + q8_0 | Si, integrada (autoespeculacion) | Eliminado a nivel de pesos | Apache-2.0 | Repositorio publicado, 0 descargas y 0 likes en el momento de la consulta |
| dealignai/Bonsai-2-27B-Ternary-CRACK-GGUF | 27,3B | GGUF, PQ2_0 | No | Eliminado a nivel de pesos | Apache-2.0 | Origen del cuerpo de este bundle; incluye las evaluaciones de refusal y MMLU |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27,3B | GGUF, ternario | No (solo los ficheros `mmproj`) | Comportamiento original | Apache-2.0 | Base no abliterada; aporta los proyectores de vision |
| ManniX-ITA/Ternary-Bonsai-2-27B-MTP-GGUF | 27,3B | GGUF, PQ2_0 + q8_0 | Si, integrada | Comportamiento original | Apache-2.0 | Mismo bundle construido desde el fichero de PrismML en lugar del de dealignai |
| Qwen/Qwen3.8-27B | 27B (aprox.) | no disponible | Origen de la cabeza MTP | no disponible | Apache-2.0 (segun la model card de este bundle) | Repositorio de Qwen |

No se dispone de datos de benchmarks que permitan comparar la calidad de salida frente a alternativas de la misma categoria, por lo que la comparacion se limita a formato, licencia y caracteristicas tecnicas.

## Limitaciones y advertencias

- El modelo no rechaza peticiones: el comportamiento de rechazo fue eliminado por dealignai a nivel de pesos. Puede producir contenido que otros modelos rechazan, incluido material ofensivo, inseguro o ilegal en algunas jurisdicciones.
- Uso declarado por el autor: adulto y de investigacion. No debe exponerse a terceros sin una capa de moderacion propia. Se distribuye sin garantia.
- La decodificacion especulativa preserva la distribucion del modelo, pero no el argmax en empates cercanos: con muestreo voraz, una respuesta puede diferir de la version sin especulacion en posiciones donde los dos tokens mas probables estan a pocas centesimas de nat.
- Los datos de aceleracion proceden de un unico prompt de codigo; el propio autor advierte que no constituyen un benchmark. El rango realista es de 1,25x a 1,5x.
- No se han publicado para este bundle mediciones de MMLU ni otras evaluaciones de calidad; las de dealignai corresponden a su propio fichero y no se repitieron.
- No hay informacion disponible sobre idiomas soportados, longitud de contexto, sesgos conocidos ni composicion del dataset de entrenamiento.
- Requiere un motor especifico (opencoti llamafile) para aprovechar la cabeza MTP; en el fork de llama.cpp de PrismML la cabeza no se ejecuta.
- El proyector de vision no esta incluido: hay que descargarlo por separado del repositorio de PrismML.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion independiente de la comunidad ni informes de terceros sobre su comportamiento.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en quien despliega el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ManniX-ITA/Ternary-Bonsai-2-27B-CRACK-MTP-GGUF
- Variante equivalente desde el fichero de PrismML: https://huggingface.co/ManniX-ITA/Ternary-Bonsai-2-27B-MTP-GGUF
- Modelo base abliterado de dealignai: https://huggingface.co/dealignai/Bonsai-2-27B-Ternary-CRACK-GGUF
- Modelo base de PrismML: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Origen de la cabeza MTP: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor de inferencia opencoti: https://github.com/mann1x/opencoti
- Interfaz xOllama: https://github.com/mann1x/xollama
- Pagina del modelo en el registro de Ollama: https://ollama.com/mannix/Bonsai-2-27B-CRACK

No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados disponibles corresponden a servicios de traduccion sin relacion con el modelo.
