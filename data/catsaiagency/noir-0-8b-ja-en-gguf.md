# catsaiagency/Noir-0.8B-ja-en-GGUF

## Resumen

Noir 0.8B-ja-en-GGUF es la distribucion cuantizada en formato GGUF del modelo Noir 0.8B-ja-en, desarrollado por CatsAI Agency. Se trata de un modelo de lenguaje pequeno (aproximadamente 1.000 millones de parametros) especializado en una tarea concreta: la deteccion de informacion personal identificable (PII) y la anonimizacion de documentos. El modelo recibe un documento junto con una descripcion en lenguaje natural de lo que se quiere ocultar ("nombre de persona", "direcciones de correo", "fechas") y devuelve una lista en JSON de las cadenas que deben enmascararse.

La relevancia del modelo radica en su enfoque de privacidad local: esta disenado para ejecutarse en CPU convencional, de modo que los documentos sensibles no tienen que salir de la maquina del usuario. Esta orientado a documentos en japones e ingles, incluidos documentos mixtos, y esta afinado a partir de Qwen3.5-0.8B (Apache-2.0). El repositorio incluye el archivo Q4_K_M de 0,67 GB, codigo de ejemplo y un manual de uso.

La ficha se centra en la version GGUF Q4_K_M, que ocupa aproximadamente 2 GB de RAM en ejecucion y emplea una ventana de contexto configurada en 8192 tokens. La licencia es la CatsAI Model License, que permite probar el modelo de forma gratuita pero exige pago por maquina para uso productivo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3.5-0.8B) |
| Parametros totales | 1.006.672.704 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (configurado en el script de arranque; cada fragmento de entrada usa como maximo 3000) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en este repo) |
| Idiomas soportados | Japones e ingles (tambien documentos mixtos ja/en) |
| Licencia | CatsAI Model License (licencia "other", gratuita para probar, pago por maquina para trabajo real) |
| Formato de pesos | GGUF |
| Modelo base | catsaiagency/Noir-0.8B-ja-en (pesos sin cuantizar) |
| Tamano del archivo | 0,67 GB (Q4_K_M); repo de 0,7 GB |
| RAM en ejecucion | Aproximadamente 2 GB |
| Entrada | Documento + objetivos; fragmentacion de ~1000 caracteres (2000 en ingles) |
| Salida | Array JSON `[{"id": "E1", "type": "person name", "mentions": ["..."]}]` o `[]` |
| Etiquetas | 48 tipos de etiqueta, 17 grupos de objetivos amplios (ontology.json) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de aproximadamente 1.000 millones de parametros, obtenido mediante fine-tuning de Qwen3.5-0.8B (licencia Apache-2.0). El fine-tuning esta orientado a la tarea de extraccion de menciones a enmascarar: dado un documento y una lista de objetivos expresados en lenguaje natural, el modelo genera un array JSON con las cadenas detectadas y su tipo. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos no estan disponibles.

La innovacion destacable no esta en la arquitectura, sino en el diseno del sistema que la rodea: el kit incluye una ontologia de 48 tipos de etiqueta agrupados en 17 objetivos amplios, fragmentacion automatica del documento (~1000 caracteres en japones, 2000 en ingles) y expresiones regulares complementarias. El modelo se distribuye con scripts de arranque para `llama-server` de llama.cpp (se requiere la release b11829 o posterior para cargar modelos Qwen3.5) y con `noir.py`, una herramienta de linea de comandos en Python 3.9+ que solo usa la biblioteca estandar.

## Capacidades

- Deteccion y enmascaramiento de PII: identifica nombres de persona, direcciones de correo, fechas, nombres de proyecto, telefonos y direcciones, entre otros, segun los objetivos solicitados.
- Salida estructurada en JSON con identificadores, tipo de etiqueta y lista de menciones.
- Comprension de objetivos en lenguaje natural ("person name", "company names", "personal information") mapeados a la ontologia de 48 etiquetas.
- Procesamiento de documentos japoneses, ingleses y mixtos ja/en.
- Manejo de documentos largos mediante fragmentacion automatica (~1000 caracteres en japones, 2000 en ingles) dentro de una ventana de 8192 tokens.
- Ejecucion en CPU convencional sin GPU, preservando la confidencialidad de los documentos.
- Integracion via API compatible con endpoints de llama.cpp (`llama-server`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Anonimizacion de correos empresariales antes de compartirlos con terceros: el modelo recibe el texto del correo y una lista de objetivos ("nombre de persona, direccion de correo, fecha") y devuelve las cadenas a sustituir; al ejecutarse en CPU, el contenido no abandona la maquina del usuario.
- Redaccion de documentos legales o administrativos: actas, resoluciones y escritos gubernamentales se procesan por fragmentos de ~1000 caracteres para ocultar nombres de personas y empresas antes de su publicacion o archivo.
- Preparacion de datasets para entrenamiento: se puede usar para eliminar PII de corpus japoneses e ingleses de forma automatizada, con salida JSON facilmente integrable en pipelines de limpieza.
- Cumplimiento normativo de privacidad: integrado en flujos internos que exigen enmascarar datos personales antes de enviar documentos a sistemas externos o a la nube.
- Desidentificacion de registros corporativos y presentaciones de resultados: util para ocultar nombres de proyectos, clientes y empleados en documentos internos que se comparten con equipos externos.
- Preprocesado en herramientas de atencion al cliente: enmascarar nombres, correos y telefonos en transcripciones o tickets antes de almacenarlos o analizarlos.
- Procesamiento por lotes en entornos sin GPU: al requerir unos 2 GB de RAM y ejecutarse en CPU, puede desplegarse en servidores modestos o incluso en equipos de escritorio para tareas de anonimizacion masiva.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Tasa de omision (test-B, 398 casos, 199 fragmentos de documentos publicos reales: actas, documentos gubernamentales, presentaciones de empresas, correos de negocio, Wikipedia) | 6,98% (japones 8,4%, ingles 4,2%) |
| Sobreenmascarado | 12,8% |
| Enmascarado pese a tipo no solicitado | 3,3% |
| Velocidad de lectura en CPU (Core i7-11800H, 6 hilos) | ~470 tokens/s |
| Velocidad de escritura en CPU | 30-55 tokens/s |
| Tiempo para un correo japones de 500 caracteres | 5-6 s |

Nota: las cifras de calidad se midieron sobre el modelo sin cuantizar con el mismo procedimiento del kit (fragmentacion mas expresiones regulares), no sobre el archivo Q4_K_M, que puede ser ligeramente peor. Las cifras de velocidad se midieron con el Q4_K_M. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: no necesaria; el modelo esta pensado para CPU. En ejecucion consume aproximadamente 2 GB de RAM.
- GPU recomendadas: no aplica; no se documenta uso de GPU. Cualquier GPU compatible con llama.cpp podria acelerar la inferencia, pero no se proporcionan datos al respecto.
- Consumer GPU: no es un requisito; el modelo cabe en CPU y en cualquier equipo con ~2 GB de RAM libre.
- Despliegue: llama.cpp (`llama-server`, release b11829 o posterior), mediante los scripts `start-server.sh` (Linux/macOS) y `start-server.ps1` (Windows PowerShell); API compatible con endpoints. Tambien es posible usar `noir.py` como CLI.
- Latencia y throughput: en un Core i7-11800H con 6 hilos, ~470 tokens/s de lectura y 30-55 tokens/s de escritura; 5-6 s para un correo japones de 500 caracteres, con tiempo dependiente del numero de elementos encontrados.
- Variables de entorno configurables: `PORT` (por defecto 8080), `THREADS` (numero de nucleos fisicos recomendado), `CTX` (por defecto 8192), `MODEL` (otro archivo GGUF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Noir 0.8B-ja-en-GGUF | ~1,0B | 8192 tokens | Deteccion de PII ja/en, ejecucion en CPU | CatsAI Model License (pago por maquina para uso real) | GGUF Q4_K_M |
| Qwen3.5-0.8B (modelo base) | ~0,8B | No disponible en la informacion proporcionada | Modelo de lenguaje general | Apache-2.0 | Safetensors (entre otros) |
| Alternativas especializadas en PII de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos con otros modelos de deteccion de PII, ni de alternativas equivalentes con especificaciones verificables.

## Limitaciones y advertencias

- Tasa de omision del 6,98% en el conjunto de prueba (8,4% en japones, 4,2% en ingles): algunos elementos sensibles pueden quedar sin enmascarar, por lo que conviene una revision humana o capas adicionales de validacion en produccion.
- Sobreenmascarado del 12,8%: puede ocultar texto que no deberia, afectando la legibilidad o el sentido del documento.
- Un 3,3% de los casos enmascara elementos aunque el tipo no fue solicitado, lo que puede introducir ruido en flujos automatizados.
- Las cifras de calidad se midieron sobre el modelo sin cuantizar; el archivo Q4_K_M puede rendir ligeramente peor.
- Idiomas limitados a japones e ingles; no se documenta soporte para otros idiomas.
- Ventana de contexto de 8192 tokens con fragmentos de hasta 3000 tokens; documentos muy largos dependen de la fragmentacion automatica y pueden perder coherencia entre fragmentos.
- Licencia CatsAI Model License: gratuita para probar, pero con pago por maquina para trabajo real; es necesario revisar los terminos antes de un despliegue comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje pequenos: puede generar menciones inexistentes o clasificar incorrectamente el tipo de etiqueta.
- No se documentan capacidades de tool calling, agentes ni vision; el modelo esta disenado exclusivamente para la tarea de enmascaramiento.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/catsaiagency/Noir-0.8B-ja-en-GGUF
- Modelo base sin cuantizar: https://huggingface.co/catsaiagency/Noir-0.8B-ja-en
- Web oficial: https://catsai.agency/en/noir
- README en japones: README.ja.md (en el repositorio)
- Licencia del modelo: https://huggingface.co/catsaiagency/Noir-0.8B-ja-en-GGUF/blob/main/MODEL-LICENSE.md
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
