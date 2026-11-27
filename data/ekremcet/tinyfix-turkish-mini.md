# ekremcet/tinyfix-turkish-mini

## Resumen

TinyFix Turkish Mini es un modelo de autocorrección ortográfica para turco desarrollado por ekremcet, publicado bajo licencia MIT. Se trata de un Seq2Seq Transformer a nivel de carácter, extremadamente compacto, con 3,9 millones de parámetros y un peso total de 4,76 MB en formato ONNX int8 (3,92 MB comprimido con gzip). El modelo no utiliza diccionarios externos ni reglas regex: toda la corrección es puramente neuronal, lo que simplifica su despliegue y elimina dependencias en tiempo de ejecución.

El modelo está diseñado específicamente para inferencia en el lado del cliente (navegador) y en el edge, con una latencia declarada de aproximadamente 25,9 ms por frase en CPU y 0,95 ms por elemento en GPU con procesamiento por lotes. Cubre de forma explícita la morfología aglutinante del turco: asimilación consonántica, suavización, caída y estrechamiento de vocales, contracciones verbales del habla coloquial, sufijos con apóstrofo y la distinción contextual entre `de/da`, `ki` y `mi`.

Es relevante porque demuestra que es posible obtener una corrección ortográfica razonable en un idioma morfológicamente complejo con un modelo de menos de 4 MB y sin recursos léxicos, lo que lo hace viable para extensiones de navegador, teclados móviles o formularios web sin infraestructura de servidor. Para casos que requieran mayor exhaustividad ante errores graves de tecleo, el autor remite a su modelo insignia de 17,8M de parámetros, `ekremcet/tinyfix-turkish`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Seq2Seq Transformer a nivel de carácter, asimétrico (6 capas de encoder / 2 de decoder), con RoPE, RMSNorm, SwiGLU y vocabulario de 320 tokens (UTF-8 byte-fallback + caracteres turcos) |
| Parametros totales | 3,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | `max_src_tokens=360` tokens de entrada; decodificación limitada a `len(src_ids) + 24` pasos |
| Tipos de cuantizacion | int8 (ONNX); el repositorio solo distribuye los pesos int8 |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_int8.onnx`, `decoder_step_int8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer Seq2Seq a nivel de carácter con un encoder profundo y un decoder ligero: 6 capas en el encoder y 2 en el decoder, `d_model=192`, 4 cabezas de atención, `d_ff=512`, RoPE, RMSNorm y SwiGLU. El vocabulario de 320 tokens combina caracteres turcos con un esquema de byte-fallback UTF-8. El encoder incorpora una compuerta de limpieza (`edit_head`) que produce una probabilidad de edición (`edit_prob`), lo que permite decidir si una secuencia necesita corrección antes de invocar el decoder. La decodificación es autorregresiva con búsqueda greedy hasta `EOS_ID=2`, con caché KV propia y cruzada expuesta explícitamente en la interfaz ONNX.

El entrenamiento se basa en destilación desde el modelo profesor de 17,8M de parámetros `ekremcet/tinyfix-turkish`, mediante destilación KL condicionada por acuerdo entre profesor y alumno, combinada con corrupción sintética de texto turco sensible a la morfología. El corpus de partida son 3,59 millones de frases limpias en turco extraídas de FineWeb-2 (`tur_Latn`, licencia ODC-By 1.0). El autor declara que no se utilizaron datos privados ni de clientes. No se especifica en la información disponible si hubo fases de RLHF o DPO.

## Capacidades

- Corrección ortográfica a nivel de carácter en turco, sin diccionario ni reglas regex.
- Asimilación consonántica (`sınıfda → sınıfta`, `gitdi → gitti`).
- Suavización consonántica (`kitapı → kitabı`, `ağaçı → ağacı`).
- Caída y estrechamiento de vocales (`burunu → burnu`, `anlayorum → anlıyorum`).
- Contracciones verbales del habla coloquial (`yapıcam → yapacağım`, `bilmiyom → bilmiyorum`).
- Sufijos con apóstrofo en nombres propios y fechas (`Turkiyede → Türkiye’de`, `2025te → 2025'te`).
- Distinción contextual de clíticos (`bende geliyorum → ben de geliyorum` frente a `Kitap bende`).
- Normalización de texto escrito sin letras turcas (recuperación de caracteres con diacríticos).
- Separación y unión de palabras (`yap abilirim → yapabilirim`, `joined-split`).
- Detección de texto limpio mediante la compuerta `edit_head`, con capacidad de dejar intactas secuencias correctas.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Corrección en tiempo real en extensiones de navegador: el modelo pesa 4,76 MB en int8 y se ejecuta con ONNX Runtime Web o WASM, por lo que puede cargarse en el cliente y corregir campos de texto sin enviar datos a un servidor.
- Teclados móviles y autocorrección en el dispositivo: con ~25,9 ms por frase en CPU, encaja en el presupuesto de latencia de un teclado predictivo y evita llamadas de red.
- Normalización de reseñas y comentarios de usuarios: la pista `reviews-real` del benchmark (F0.5 de 72,56 con 8,9 roturas por cada 10.000 elementos) indica que puede limpiar texto generado por usuarios antes de indexarlo o analizarlo, manteniendo una tasa de falsos cambios controlada.
- Preprocesado para pipelines de NLP en turco: al corregir asimilación, suavización y clíticos antes del análisis morfológico o del etiquetado, reduce la variabilidad léxica que ven los modelos posteriores.
- Limpieza de formularios y bases de datos de contacto: la pista `call-center` (F0.5 de 93,89 con 0,00 roturas por cada 10.000) sugiere un buen comportamiento en texto transcrito de atención telefónica, donde los errores de tecleo y las contracciones son frecuentes.
- Procesamiento por lotes en el edge o en servidores modestos: al ser un modelo ONNX int8 de menos de 5 MB, puede ejecutarse en CPU sin GPU dedicada y en contenedores con requisitos mínimos de memoria.
- Corrección de textos académicos o administrativos con nombres propios y fechas: la pista `apostrophe-suffix` alcanza F0.5 de 100,00, útil para normalizar referencias a instituciones y años.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto sellado `ekremcet/turkish-autocorrect-bench` (1.558 elementos):

| Pista / metrica | Full (`tau=0.00`) | Cautious (`tau=0.25`) |
|---|---:|---:|
| F0.5 medio (pistas con error) | 85,68 | 82,62 |
| `no-turkish-letters` F0.5 | 98,29 | 98,29 |
| `call-center` F0.5 | 93,89 (0,00 roturas/10k) | 93,05 |
| `joined-split` F0.5 | 84,62 (93,0 % precisión) | 80,97 |
| `misspellings` F0.5 | 83,97 (95,7 % precisión) | 72,82 |
| `typing-slips` F0.5 | 80,74 | 79,26 |
| `reviews-real` F0.5 | 72,56 (8,9 roturas/10k) | 71,33 |

Resultados en la suite de morfología aglutinante turca (100 elementos, 8 pistas):

| Pista | Full (`tau=0.00`) | Cautious (`tau=0.25`) |
|---|---:|---:|
| F0.5 medio de morfología | 91,00 | 92,25 |
| `apostrophe-suffix` | 100,00 | 100,00 |
| `softening` | 97,01 (100 % precisión) | 97,01 |
| `assimilation` | 95,59 (100 % precisión) | 95,59 |
| `suffix-harmony-split` | 83,33 | 92,11 (100 % precisión) |
| `vowel-drop-narrow` | 90,00 (100 % precisión) | 90,00 |
| `spoken-verbs` | 87,72 | 87,72 |
| `clitic-contrast` | 83,33 | 83,33 |
| `clean-morph-traps` | 100 % exacto (0,00 roturas/10k) | 100 % exacto |

No se han publicado comparaciones directas con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuración; el peso int8 total es de 4,76 MB, por lo que el modelo cabe holgadamente en memoria de cualquier dispositivo.
- GPU recomendadas: no requiere GPU. Funciona en CPU; en GPU, el autor reporta 0,95 ms por elemento con procesamiento por lotes, sin especificar el modelo de GPU empleado.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (navegador, móvil, Raspberry Pi y similares).
- Opciones de despliegue: ONNX Runtime (Python, Web, WASM, C#), con los ficheros `encoder_int8.onnx` y `decoder_step_int8.onnx`; el repositorio incluye el wrapper Python `tinyfix_tr.TinyFixTR`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato ni tamaño.
- Latencia y throughput: ~25,9 ms por frase en CPU y 0,95 ms por elemento en GPU por lotes, según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---:|---|---|---|---|
| `ekremcet/tinyfix-turkish-mini` | 3,9 M | 360 tokens de entrada | ONNX int8 | MIT | Autocorrección turca a nivel de carácter |
| `ekremcet/tinyfix-turkish` | 17,8 M | no disponible | no disponible | no disponible | Autocorrección turca, mayor recall en errores graves |
| Correctores basados en diccionario o regex | no aplica | no aplica | no aplica | variable | Reglas y léxico, sin aprendizaje neuronal |

La información disponible solo permite comparar con el modelo profesor del mismo autor, que ofrece mayor exhaustividad ante errores graves de tecleo y mayor precisión en texto limpio, a cambio de un tamaño aproximadamente 4,5 veces mayor. No se dispone de datos de benchmarks de terceros para establecer comparaciones adicionales.

## Limitaciones y advertencias

- El modelo solo soporta turco; no está entrenado para otros idiomas ni para mezcla de idiomas.
- La ventana de entrada está limitada a 360 tokens y la salida a `len(src_ids) + 24` pasos, por lo que textos largos deben dividirse en fragmentos.
- El tamaño reducido implica menor recall en errores graves de tecleo que el modelo insignia de 17,8M; el autor lo indica explícitamente.
- En la pista `reviews-real` se observan 8,9 roturas por cada 10.000 elementos, es decir, cambios introducidos en texto que ya era correcto; en producción conviene usar el umbral cauteloso (`tau=0.25`) o validar las modificaciones.
- La compuerta `edit_head` reduce pero no elimina el riesgo de modificar texto correcto, especialmente en dominios alejados de FineWeb-2.
- No se han publicado análisis de sesgos; al entrenarse sobre FineWeb-2, puede heredar las distribuciones y sesgos de ese corpus.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales conocidas.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados reportados.
- La fecha de creación indicada (2026-11-27) es posterior a la de esta ficha; conviene verificar la vigencia del repositorio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ekremcet/tinyfix-turkish-mini
- Modelo insignia del mismo autor: https://huggingface.co/ekremcet/tinyfix-turkish
- Benchmark de autocorrección turca: https://huggingface.co/ekremcet/turkish-autocorrect-bench
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
