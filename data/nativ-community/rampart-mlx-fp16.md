# nativ-community/rampart-mlx-fp16

## Resumen

Rampart MLX fp16 es la conversion a Apple MLX del modelo Rampart de National Design Studio, un clasificador de tokens (token classification) especializado en detectar y redactar informacion personal identificable (PII) en texto escrito por el usuario. Se trata de un MiniLM de 6 capas con cabeza `BertForTokenClassification` (hidden 384, vocabulario de 19.730 piezas) que emite 35 etiquetas en formato BIO sobre 17 tipos de entidad, en siete idiomas de alfabeto latino. El checkpoint lo publica la organizacion nativ-community y suma 18.434.723 parametros.

El problema que resuelve es concreto: permitir que aplicaciones locales (navegador, app de escritorio en macOS, herramientas de procesamiento de texto) eliminen datos personales antes de que el texto salga del dispositivo, por ejemplo antes de enviarlo a una API de terceros o a un modelo generativo en la nube. Al ser un modelo de 37 MB, la inferencia es viable en hardware de consumo e incluso en dispositivos Apple Silicon de gama baja.

La relevancia de esta ficha en concreto es que reproduce el comportamiento del modelo upstream, que solo se distribuye como ONNX cuantizado a 4 bits y uint8. Esta version desquantiza esos pesos y los almacena en fp16 dentro del layout de mlx-vlm, de modo que se puede ejecutar de forma nativa en MLX. Es importante subrayar que Rampart es un sistema hibrido: la deteccion de numeros de la Seguridad Social, tarjetas de pago y direcciones IP recae en una capa de expresiones regulares y checksums del paquete npm oficial, capa que no forma parte de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (MiniLM), `BertForTokenClassification`, 6 capas, hidden 384 |
| Parametros totales | 18.434.723 (18,43 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (este repositorio); 4-bit en el repositorio hermano. Los pesos originales de los que se parte son ONNX q4 y uint8 |
| Idiomas soportados | en, es, fr, de, it, pt, nl |
| Licencia | CC BY 4.0 (atribucion a National Design Studio) |
| Formato de pesos | safetensors en layout MLX |
| Vocabulario | 19.730 piezas |
| Etiquetas | 35 etiquetas BIO sobre 17 tipos de entidad |
| Tamano en disco | 37 MB |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT en su variante MiniLM, con 6 capas, dimension oculta de 384 y un vocabulario de 19.730 piezas. Sobre la salida del encoder se anade una cabeza de clasificacion de tokens que produce 35 etiquetas en esquema BIO, cubriendo 17 tipos de entidad. El modelo resultante tiene 18,43 millones de parametros, lo que lo situa en la gama de modelos de NER ligeros aptos para inferencia en tiempo real sobre CPU o GPU integrada.

Esta publicacion no es un reentrenamiento, sino una conversion: el repositorio upstream solo distribuye `onnx/model_q4.onnx`, y el script `convert_from_onnx.py` incluido en este repositorio lee los inicializadores ONNX, los mapea a los nombres de parametro de BERT en HuggingFace y escribe safetensors MLX en el layout de mlx-vlm. Por tanto, los valores almacenados son los pesos ya cuantizados que libero National Design Studio, no el checkpoint de entrenamiento previo a la cuantizacion, que no se ha publicado. No hay informacion disponible en esta ficha sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no son habituales en un clasificador de tokens). Se sabe que el modelo upstream se entreno con los valores de SSN, tarjetas de pago e IP ya enmascarados por la capa determinista previa.

## Capacidades

- Deteccion y redaccion de entidades PII en texto libre, devolviendo texto con las entidades sustituidas por etiquetas del tipo `<GIVEN_NAME>`, `<EMAIL>`, etc.
- Clasificacion de tokens con 35 etiquetas BIO sobre 17 tipos de entidad.
- Soporte multilingue en siete idiomas de alfabeto latino: ingles, espanol, frances, aleman, italiano, portugues y neerlandes.
- Politica de conservacion selectiva mediante el parametro `keep_labels`, que permite detectar pero no redactar determinadas categorias (por defecto: ciudad, estado y codigo postal).
- Decodificacion de spans integrada en `mlx_vlm.token_classification`, con politica de conservacion aplicada de extremo a extremo.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Interfaz de linea de comandos: `python -m mlx_vlm.token_classification`.
- No incluye tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento. Es exclusivamente un clasificador de tokens.

## Casos de uso

- Redaccion de PII en el navegador antes de enviar texto a un servicio externo: el modelo se ejecuta de forma local y marca nombres, correos, telefonos o direcciones antes de que la peticion salga del dispositivo, lo que encaja con el diseno local-first del proyecto upstream.
- Preprocesado de logs de aplicacion: antes de almacenar o reenviar trazas que puedan contener datos de usuario, el clasificador identifica y sustituye las entidades personales, reduciendo la superficie de exposicion en sistemas de observabilidad.
- Sanitizacion de datasets para entrenamiento: al procesar corpus de texto con posible PII, el modelo permite enmascarar los campos sensibles antes de incorporarlos a un pipeline de entrenamiento o de publicarlos.
- Cumplimiento de normativa de proteccion de datos en formularios y editores: integrado en una app de escritorio, redacta en tiempo real mientras el usuario escribe, con la ventaja de no requerir conectividad.
- Anonimizacion previa a APIs de terceros en apps de mensajeria o atencion al cliente: los transcripts se limpian antes de enviarse a un LLM alojado, de modo que el proveedor externo nunca recibe los identificadores directos.
- Enmascarado selectivo en flujos analiticos: gracias a `keep_labels`, se pueden conservar ciudad, estado y codigo postal para analisis geografico mientras se redactan nombres, telefonos y correos.
- Investigacion con datos sensibles: en entornos donde no se permite exportar texto a servicios externos, el modelo ofrece una primera pasada de redaccion que puede combinarse con revision humana.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la evaluacion realizada por el autor de la conversion en un Apple M5 Max, sobre 10.500 filas del split `validation` de `ai4privacy/pii-masking-openpii-1.5m` (1.500 por idioma), datos no vistos durante el entrenamiento. La referencia es el modelo ONNX q4 original ejecutado bajo ONNX Runtime en CPU con las mismas entradas.

Fidelidad de la conversion (1.280.624 tokens):

| Version | Etiquetas de token identicas a ORT | Filas con redaccion identica |
|---|--:|--:|
| MLX fp16 | 99,998% | 99,95% |
| MLX 4-bit | 99,997% | 99,90% |

Todas las discrepancias son practicamente empates: el margen entre el top-1 y el top-2 de logits de ORT en esos tokens es como maximo de 0,016.

Recall de terminos privados (solo modelo, valor de PII considerado detectado si se redacta alguno de sus caracteres; intervalo de confianza Wilson al 95%):

| Idioma | ORT q4 (upstream) | MLX fp16 | MLX 4-bit | Terminos privados |
|---|--:|--:|--:|--:|
| en | 99,87% [99,75; 99,93] | 99,87% | 99,87% | 6.221 |
| es | 99,75% [99,59; 99,85] | 99,75% | 99,75% | 5.708 |
| fr | 99,34% [99,10; 99,52] | 99,34% | 99,34% | 5.641 |
| de | 99,59% [99,38; 99,73] | 99,59% | 99,59% | 5.582 |
| it | 99,50% [99,29; 99,65] | 99,50% | 99,50% | 6.004 |
| pt | 99,63% [99,44; 99,75] | 99,63% | 99,63% | 5.896 |
| nl | 99,28% [99,03; 99,47] | 99,28% | 99,28% | 5.977 |
| total | 99,57% [99,50; 99,63] | 99,57% | 99,57% | 41.029 |

A traves del decodificador de spans de `mlx_vlm.token_classification`, con la politica de conservacion de ciudad, estado y codigo postal, el recall de terminos privados es del 99,57% y la retencion de terminos publicos del 99,90%. Los terminos privados contabilizados son nombres, telefonos, correos, numeros de identificacion, fiscales, de pasaporte y de permiso de conducir, ademas de calle y numero de edificio. Los SSN y las tarjetas de credito quedan fuera porque corresponden a la capa de expresiones regulares. Los terminos publicos son fechas, edades, titulos, genero, horas, ciudad y codigo postal.

El propio autor advierte que estas cifras no son comparables con el 98,42% de la model card upstream: ese numero es una puntuacion de sistema completo sobre un corte fijo de 30.000 filas con un mapeo de terminos distinto. Lo que muestran estas tablas es que los checkpoints MLX reproducen el comportamiento del modelo upstream.

No se han publicado resultados de benchmarks de MMLU, HumanEval, GSM8K ni similares en la informacion disponible, y no serian aplicables a un clasificador de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos fp16 ocupan 37 MB; el grueso del consumo son activaciones y buffers, despreciable frente a un LLM.
- GPU recomendadas: cualquier chip Apple Silicon (serie M) gracias a MLX. La evaluacion se hizo en un Apple M5 Max, pero el tamano permite ejecutarlo en chips de gama baja de la misma familia.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon. Tambien se puede ejecutar en CPU mediante ONNX Runtime con el modelo upstream, aunque este checkpoint concreto esta pensado para MLX.
- Opciones de despliegue: `mlx-vlm` (modulo `mlx_vlm.token_classification`) como via principal; ONNX Runtime para el modelo upstream; integracion en la app Nativ para macOS.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo (18,43 M de parametros) es razonable esperar latencias de milisegundos, pero no hay cifras publicadas que lo confirmen.
- Requiere `mlx-vlm` con soporte de clasificacion de tokens BERT. No funciona con runtimes de LLM genericos tipo llama.cpp, Ollama, vLLM o TGI, que no estan orientados a clasificacion de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nativ-community/rampart-mlx-fp16 | 18,43 M | no disponible | CC BY 4.0 | safetensors (MLX) | Esta ficha. Conversion fp16 |
| nativ-community/rampart-mlx-4bit | no disponible | no disponible | CC BY 4.0 | safetensors (MLX) | Mismo modelo en 4 bits; recall identico segun la evaluacion del autor |
| nationaldesignstudio/rampart | no disponible (ONNX de 14,7 MB) | no disponible | CC BY 4.0 | ONNX (q4) | Modelo upstream; incluye capa regex y checksum en el paquete npm, no en el checkpoint |
| sledgedev/rampart-mlx | no disponible | no disponible | no disponible | MLX | Tercera conversion del mismo modelo base; sin datos de evaluacion en la informacion disponible |
| OsaurusAI/rampart-mlx | no disponible | no disponible | CC BY 4.0 | safetensors (MLX) | Otra conversion del mismo modelo base; sin datos de evaluacion en la informacion disponible |

No se dispone de datos de benchmarks de otros modelos de PII comparables (por ejemplo clasificadores de la familia ai4privacy) en la informacion proporcionada, por lo que no se incluye una comparacion de rendimiento entre arquitecturas distintas.

## Limitaciones y advertencias

- Rampart es una ayuda a la redaccion, no una garantia de anonimizacion ni de cumplimiento normativo. El propio autor lo indica explicitamente.
- Este checkpoint no incluye la capa determinista de expresiones regulares y checksums que detecta SSN, tarjetas de pago y direcciones IP. Es necesario anadir patrones propios para esas clases si se quieren cubrir.
- Los recall publicados son de solo modelo, medidos sobre un dataset concreto; en texto real con dominios distintos el rendimiento puede degradarse.
- No hay informacion disponible sobre sesgos especificos del modelo. La model card upstream remite a resultados de equidad que no se reproducen aqui.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de falsos positivos (redactar texto que no es PII) y falsos negativos (no detectar PII real).
- Cobertura limitada a siete idiomas de alfabeto latino; no soporta otros alfabetos ni idiomas fuera de esa lista.
- La longitud de contexto no esta documentada en la informacion disponible; conviene verificar el comportamiento con entradas largas antes de usarlo en produccion.
- El resultado depende del mapeo de terminos y del decodificador de spans empleado; comparar cifras entre implementaciones distintas no es valido, como advierte el propio autor.
- Licencia CC BY 4.0: permite uso comercial con atribucion a National Design Studio. Es necesario conservar la atribucion.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y con un tamano de repo reportado de 0,0 GB, lo que sugiere que el artefacto puede estar alojado por referencia externa. Conviene verificar la integridad de los pesos antes de desplegarlo.
- El modelo no realiza tool calling ni razonamiento multi-paso; no debe utilizarse como sustituto de un LLM en tareas generativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/rampart-mlx-fp16
- Version 4-bit del mismo autor: https://huggingface.co/nativ-community/rampart-mlx-4bit
- Modelo upstream: https://huggingface.co/nationaldesignstudio/rampart
- Model card upstream: https://huggingface.co/nationaldesignstudio/rampart/blob/main/MODEL_CARD.md
- Anuncio de Rampart: https://ndstudio.gov/posts/say-hello-to-rampart
- Repositorio GitHub de Rampart: https://github.com/nationaldesignstudio/rampart
- Dataset de evaluacion: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Otras conversiones MLX: https://huggingface.co/sledgedev/rampart-mlx y https://huggingface.co/OsaurusAI/rampart-mlx
- App Nativ para macOS: https://blaizzy.github.io/nativ/ y https://github.com/0xSojalSec/nativmLX
