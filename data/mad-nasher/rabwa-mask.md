# mad-nasher/rabwa-mask

## Resumen

rabwa-mask es un modelo ligero de deteccion y anonimizacion de datos personales (PII) desarrollado por el usuario mad-nasher y publicado en HuggingFace. Se trata de un fine-tuning de CAMeL-Lab/bert-base-arabic-camelbert-mix-ner, un BERT base para arabe, especializado en identificar datos personales en texto en arabe (dialecto del Golfo y saudi) e ingles. El problema que resuelve es muy concreto: equipos que envian notas de clientes, mensajes de chat o tickets de soporte a APIs de LLM alojadas filtran datos personales en texto libre, y las expresiones regulares convencionales detectan telefonos y correos, pero no nombres arabes.

Su aportacion principal es un flujo reversible de enmascarado: el modelo sustituye nombres, telefonos, identificadores, IBANs y direcciones por marcadores como `[PERSON_1]`, el texto enmascarado se envia a cualquier LLM externo, y los valores reales se restauran en la respuesta en el servidor local. De este modo, el texto sin anonimizar nunca sale del servidor. Incluye ademas reglas deterministas para formatos fijos (telefonos saudies, NID, Iqama, IBAN, matriculas, emails) y un helper de redaccion reversible en Python. Es relevante porque los modelos NER multilingues genericos fallan con las particularidades de los nombres arabes (particulas bin/bint, articulo al-, kunyas, preposiciones pegadas, nombres que son palabras comunes), y este modelo esta afinado exactamente para ese caso. Funciona en CPU en pocos milisegundos, con pesos en safetensors y ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (token-classification / NER), fine-tuning de CAMeL-Lab/bert-base-arabic-camelbert-mix-ner |
| Parametros totales | no disponible (tamano del repo: 0,5 GB; base BERT-base, aprox. 110 M de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | aprox. 128 tokens por ventana (ventanas de ~300 caracteres en inferencia ONNX) |
| Tipos de cuantizacion | no disponible (pesos full-precision en safetensors y version ONNX) |
| Idiomas soportados | arabe (dialecto del Golfo / saudi) e ingles, incluido texto mixto arabigo-ingles y digitos arabigo-indicos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo es un BERT base multilingue-arabe (CAMeL-BERT mix) al que se ha anadido una cabeza de clasificacion de tokens para NER. Utiliza el esquema de etiquetado BIO con 17 etiquetas: `O` mas pares `B-`/`I-` para ocho tipos de entidad: `PERSON`, `ADDRESS`, `PHONE`, `EMAIL`, `NID`, `IQAMA`, `IBAN` y `PLATE`. La tokenizacion es WordPiece estandar de BERT sin lower-casing, y las entradas del grafo ONNX son `input_ids`, `attention_mask` y `token_type_ids`.

Una decision de diseno destacable es la separacion de responsabilidades entre modelo y reglas: aunque el modelo tambien etiqueta los formatos fijos (telefonos, IDs, IBANs), el helper de redaccion delega esos tipos en expresiones regulares exactas y toma del modelo solo nombres y direcciones, donde el aprendizaje automatico aporta valor real. Las reglas cubren moviles y fijos saudies en cualquier formato (05..., +966..., 00966..., con espacios, guiones o digitos arabigo-indicos), el ID nacional saudi de 10 digitos que empieza por 1, el permiso de residencia (Iqama) de 10 digitos que empieza por 2, el IBAN saudi (SA + 22 digitos) y las matriculas saudies en letras arabes o latinas. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni el uso de tecnicas como RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Deteccion de nombres personales arabes (completos o parciales, con bin/bint, articulo al-, kunyas como Abu Fahd o Umm Khalid) y sus transliteraciones inglesas.
- Deteccion de direcciones domiciliarias: distrito, calle, edificio y direccion corta nacional saudi (modelo + regla).
- Deteccion por reglas deterministas de telefonos saudies, emails, NID, Iqama, IBAN y matriculas saudies.
- Procesamiento de texto mixto arabigo-ingles y de digitos arabigo-indicos.
- Enmascarado reversible: generacion de marcadores consistentes (el mismo valor recibe siempre el mismo placeholder) y restauracion posterior de los valores reales; los placeholders desconocidos en la respuesta generan error (fail closed).
- Ejecucion exclusiva en CPU con latencia de pocos milisegundos, con control de hilos (`threads=1`).
- Compatibilidad con el pipeline `token-classification` de transformers para obtencion de spans crudos con puntuaciones.
- Uso desde Node.js mediante `onnxruntime-node` y tokenizer BERT WordPiece.
- No soporta generacion de texto, razonamiento, codigo ni tool calling: es un modelo discriminativo de clasificacion de tokens.

## Casos de uso

- Llamadas seguras a LLM alojados: enmascarar notas de CRM, tickets o mensajes de chat antes de enviarlos a una API externa y restaurar los nombres en la respuesta, de forma que el proveedor del LLM solo ve codigos.
- Asistentes de atencion al cliente y ventas: permitir que un asistente interno responda preguntas sobre clientes sin que los datos personales salgan de la infraestructura propia.
- Limpieza de logs y analiticas: eliminar datos personales de logs de aplicaciones, notas de llamadas o respuestas de encuestas antes de almacenarlos o compartirlos.
- Anonimizacion de datasets: depurar corpus de texto en arabe e ingles antes de usarlos para entrenamiento, evaluacion o investigacion.
- Revision de documentos: localizar y resaltar datos personales en contratos, formularios o correos electronicos antes de compartirlos fuera del equipo.
- Cumplimiento normativo: apoyar deberes de minimizacion de datos bajo leyes de privacidad como la PDPL saudi o el RGPD, como control tecnico (no como garantia legal).
- Paginas de demostracion de privacidad: mostrar al personal exactamente que recibira un modelo externo, ya que el helper devuelve el texto enmascarado, los valores detectados y el texto restaurado.

## Benchmarks y rendimiento

Los unicos resultados publicados proceden de un conjunto de prueba sintetico reservado (held-out) de 780 frases en arabe del Golfo e ingles. La model card esta truncada y no incluye las metricas concretas (precision, recall, F1), por lo que no es posible reproducir numeros:

"No se han publicado resultados de benchmarks en la informacion disponible" (mas alla de la mencion del conjunto sintetico de 780 frases y de la afirmacion cualitativa del autor de que la inferencia en CPU tarda pocos milisegundos).

## Requisitos de hardware

- VRAM estimada: no aplicable en su modo principal; esta pensado para ejecutarse solo en CPU. Para uso GPU con los pesos full-precision, un modelo BERT-base requiere del orden de 1 GB de VRAM o menos.
- GPU recomendadas: no necesarias; el flujo principal es CPU-only con onnxruntime.
- Consumer GPUs: si se usa la ruta transformers en GPU, cabe sobradamente en cualquier GPU moderna (incluso integradas o de gama baja).
- Opciones de despliegue: onnxruntime (Python y Node.js via `onnxruntime-node`), pipeline de `token-classification` de transformers, y script propio `pii_redact.py` con dependencias minimas (onnxruntime, tokenizers, numpy). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (no aplicable a un encoder BERT).
- Latencia: pocos milisegundos por peticion en CPU segun el autor; throughput concreto no disponible. Para textos largos, dividir en ventanas de ~300 caracteres (128 tokens).

## Comparativa con modelos similares

| Modelo | Base / tamano | Tarea | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| rabwa-mask | BERT-base (CAMeL-BERT mix) fine-tuned | Deteccion y enmascarado reversible de PII | Arabe (Golfo/saudi) e ingles | Apache 2.0 | Reglas deterministas para formatos saudies, helper de restauracion, ONNX CPU |
| CAMeL-Lab/bert-base-arabic-camelbert-mix-ner | BERT-base (~110 M) | NER general arabigo | Arabe (varias variantes) | no disponible | Modelo base; detecta entidades NER genericas, sin helper de PII ni reglas saudies |
| Modelos NER multilingues genericos (p. ej. XLM-R NER) | Variable | NER general | Multilingue | Variable | Segun el autor, omiten demasiados nombres arabes y no cubren NID/Iqama/IBAN/matriculas |

No se han publicado comparativas cuantitativas contra otros modelos en la informacion disponible.

## Limitaciones y advertencias

- Los resultados publicados proceden de un conjunto de prueba sintetico (780 frases); el rendimiento en texto real puede ser inferior y no hay metricas publicadas para verificarlo.
- Los nombres arabes son intrinsecamente dificiles: nombres que son palabras comunes (Jameel, Amal, Noor) y lugares que llevan nombres de personas pueden provocar falsos positivos o negativos.
- Las reglas cubren formatos saudies (NID, Iqama, IBAN, telefonos, matriculas); identificadores de otros paises no estan contemplados.
- La ventana de contexto es corta (128 tokens por ventana); textos largos requieren particionado en ventanas de ~300 caracteres.
- El helper es fail closed: si el modelo no carga o falla, el texto no debe enviarse; hay que integrar esta logica en el flujo de produccion.
- El mapeo de placeholders debe mantenerse solo en memoria y descartarse tras cada peticion; una gestion incorrecta podria exponer los datos que se pretendian proteger.
- En cuanto a cumplimiento, es un control tecnico de apoyo, no una garantia legal de conformidad con la PDPL saudi o el RGPD.
- Modelo con muy poca traccion publica (0 descargas, 1 like en el momento de la ficha), sin comunidad ni historial de auditoria externa; conviene validar en el dominio propio antes de produccion.
- No hay informacion sobre sesgos del modelo de base mas alla de los inherentes a CAMeL-BERT; riesgo de alucinacion no aplicable al ser un modelo discriminativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mad-nasher/rabwa-mask
- Modelo base: https://huggingface.co/CAMeL-Lab/bert-base-arabic-camelbert-mix-ner
- No se han encontrado enlaces adicionales (paper, blog o demo) en la informacion disponible.
