# skillsafe-ai/opus-mt-en-fr

## Resumen

`skillsafe-ai/opus-mt-en-fr` es un paquete de artefactos ONNX para traduccion automatica ingles-frances, publicado por SkillSafe a partir de una fuente upstream fijada por commit y verificada por hash SHA-256. No es un modelo entrenado desde cero: es una importacion reproducible del repositorio `Xenova/opus-mt-en-fr`, que a su vez es el port ONNX del clasico OPUS-MT de MarianMT. La model card indica explicitamente que se importo "as published upstream (no conversion)" y que cada fichero esta anclado a su origen mediante SHA-256.

El objetivo es el despliegue en navegador y en entornos ligeros mediante `transformers.js` y ONNX Runtime. Los pesos se distribuyen en dos variantes: fp32 (189,50 MB el encoder y 214,18 MB el decoder) y q8 (54,72 MB el decoder cuantizado). Esa combinacion lo hace apto para inferencia en CPU, en WebAssembly e incluso en el cliente, sin necesidad de GPU dedicada.

La relevancia practica esta en el nicho: traduccion EN->FR de bajo coste, reproducible y auditable, pensada para integrarse en aplicaciones web o pipelines sin dependencias de servidores de inferencia pesados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado informacion de benchmarks ni de entrenamiento mas alla de la procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT), exportado a ONNX |
| Parametros totales | Estimacion de ~101 millones a partir del tamano de los artefactos fp32 (189,50 MB encoder + 214,18 MB decoder, a 4 bytes por parametro). No declarado explicitamente por el autor |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Las pruebas de humo del ONNX usan secuencias de encoder de 8 tokens y 4 tokens en el decoder, valores de test, no limites del modelo |
| Tipos de cuantizacion | fp32 y q8 (ONNX Runtime) |
| Idiomas soportados | Ingles (origen) a frances (destino). Los metadatos de HuggingFace no incluyen lista de idiomas |
| Licencia | apache-2.0 (la declarada por el repositorio) |
| Formato de pesos | ONNX: `onnx/decoder_model_merged.onnx` (fp32), `onnx/decoder_model_merged_quantized.onnx` (q8), `onnx/encoder_model.onnx`. Ficheros auxiliares: `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json` |

Detalles tecnicos derivados de las formas declaradas en la verificacion ONNX: `d_model = 512`, 8 cabezas de atencion con dimension 64 por cabeza, 6 capas en el decoder (`past_key_values.0` a `past_key_values.5`) y vocabulario de salida de 59.514 tokens (`logits[1, 4, 59514]`).

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder de tipo MarianMT. La verificacion ONNX confirma la estructura: el decoder recibe `encoder_hidden_states` de dimension 512, mantiene cache de clave/valor tanto de decoder como de encoder, y expone la rama condicional `use_cache_branch` que permite alternar entre paso de prefill y decodificacion autoregresiva con cache. El encoder se exporta por separado (`encoder_model.onnx`) y el decoder se fusiona en un unico grafo con el mecanismo de cache (`decoder_model_merged.onnx`). Las dimensiones y el vocabulario son consistentes con la configuracion base de MarianMT en su variante de 6+6 capas.

No se detallan en la informacion disponible los datos de entrenamiento originales (numero de tokens, composicion del corpus OPUS, ni si hubo ajuste por RLHF o DPO). La model card se limita a documentar la procedencia y el proceso de importacion. La cadena de trazabilidad es: OPUS-MT original, port ONNX de Xenova, e importacion de SkillSafe con el recipe `recipes/opus-mt-en-fr.yaml` (sha256 `002d21bcda3c9020bb18761054afce8879529c9161981652f02a13a2343702ac`) y un toolchain concreto: Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64.

La innovacion tecnica relevante aqui no es arquitectonica, sino de empaquetado y verificabilidad: cada fichero esta fijado por SHA-256, todos los ONNX pasaron `onnx.checker` y una ejecucion de humo en CPU con onnxruntime y entradas rellenas de ceros. El repositorio distingue entre ficheros `registry` (servidos desde `models.skillsafe.ai` una vez validados), `bundle` (empaquetados en la aplicacion) y `registry-shared` (libreria de runtime reutilizada por modelos de la misma arquitectura).

## Capacidades

- Traduccion automatica directa de ingles a frances, en modo texto a texto.
- Inferencia en navegador mediante `transformers.js` sobre ONNX Runtime Web (WebAssembly y, segun el runtime, WebGPU).
- Inferencia en CPU sin GPU, gracias a las variantes fp32 y q8.
- Decodificacion autoregresiva con cache de clave/valor, lo que reduce el coste por token generado.
- Integracion como pipeline `translation` en el ecosistema HuggingFace.
- Trazabilidad criptografica de cada artefacto (SHA-256 por fichero) y verificacion estructural del grafo ONNX.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del par EN->FR.
- No se documenta modo thinking, vision, audio ni ninguna otra modalidad.

## Casos de uso

- Traduccion en el cliente dentro de una aplicacion web: con los artefactos q8 (54,72 MB el decoder, 189,50 MB el encoder) el modelo puede cargarse en el navegador via `transformers.js` y traducir sin enviar el texto a un servidor, lo que reduce coste de infraestructura y mejora la privacidad.
- Localizacion de interfaces y contenido estatico: traduccion por lotes de cadenas de una aplicacion EN->FR en un pipeline de build, usando ONNX Runtime en CPU. Al ser un modelo pequeno, el coste por caracter es bajo y el resultado es consistente entre ejecuciones.
- Preprocesado o postprocesado en pipelines de NLP: traduccion de titulares, resumenes o metadatos antes de pasarlos a otro componente (clasificador, indexador de busqueda) cuando se necesita material en frances.
- Extensiones de navegador y herramientas de escritorio: el formato ONNX con soporte WASM permite empaquetar el traductor dentro de una extension sin backend, con el modelo servido desde el registro de SkillSafe o incluido como bundle.
- Prototipado e investigacion en traduccion automatica: sirve como linea base reproducible de OPUS-MT EN->FR, con hashes verificables, para comparar cuantizaciones q8 frente a fp32 en terminos de calidad y latencia.
- Sistemas con conectividad limitada o requisitos de soberania de datos: al poder ejecutarse localmente y sin llamadas a APIs externas, encaja en entornos donde el texto no puede salir del dispositivo.
- Traduccion de soporte al cliente: para consultas de usuarios en ingles que deben atenderse en frances, puede actuar como capa de traduccion previa a un modelo de chat, siempre que se asuma que es traduccion literal y no generacion conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una prueba de humo estructural de ONNX Runtime en CPU con entradas rellenas de ceros:

| Fichero | Entradas | Salidas | Tiempo |
|---|---|---|---|
| `onnx/decoder_model_merged.onnx` | encoder_attention_mask[1,8], input_ids[1,4], encoder_hidden_states[1,8,512], 24 tensores de cache | logits[1,4,59514], 24 tensores present.* | 3,8 ms |
| `onnx/decoder_model_merged_quantized.onnx` | mismas formas | mismas formas (truncado en la informacion) | no disponible en la informacion |

Ese valor de 3,8 ms corresponde a un unico paso del decoder fp32 con batch 1 y secuencia de 4 tokens, sobre Darwin arm64. No es una medida de throughput de traduccion real ni de calidad, y no debe interpretarse como tal.

## Requisitos de hardware

- VRAM estimada para inferencia: el decoder cuantizado q8 ocupa 54,72 MB y el encoder 189,50 MB, es decir unos 245 MB de pesos en q8. En fp32, encoder mas decoder suman unos 404 MB. Sumando activaciones y cache de clave/valor, el consumo real es del orden de cientos de MB, no de GB.
- GPU recomendadas: no se especifica ninguna. Cualquier GPU con soporte de ONNX Runtime o WebGPU es suficiente; el modelo no requiere A100, H100 ni similares.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, y tambien en iGPU, CPU y navegador. Es un caso claro de modelo que no necesita acelerador dedicado.
- Opciones de despliegue: `transformers.js` con ONNX Runtime Web (WASM/WebGPU) para navegador, `onnxruntime` en Python o C++ para servidor o escritorio, y el registro de modelos de SkillSafe (`models.skillsafe.ai`) para servir los ficheros `registry`. No se documenta soporte de vLLM, TGI ni llama.cpp, que no aplican al formato de este repositorio.
- Latencia y throughput estimados: el unico dato disponible es el paso de decoder fp32 de 3,8 ms mencionado arriba, con formas minimas y entradas de prueba. El throughput de traduccion real depende de la longitud de la frase y del runtime, y no se ha publicado.

## Comparativa con modelos similares

| Modelo | Formato | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/opus-mt-en-fr` | ONNX fp32 y q8, listo para transformers.js | Traduccion EN->FR con empaquetado reproducible y hashes | EN->FR | apache-2.0 declarada por el repositorio | Repositorio HuggingFace, 0 descargas, 0 likes |
| `Xenova/opus-mt-en-fr` | ONNX | Modelo base del que se deriva esta importacion | EN->FR | no disponible en la informacion proporcionada | Repositorio HuggingFace de referencia |
| OPUS-MT original (Helsinki-NLP) | PyTorch (safetensors/bin) | Implementacion de referencia de MarianMT para traduccion | EN->FR | no disponible en la informacion proporcionada (verificar en la ficha del modelo original) | Repositorio HuggingFace |

Alternativas de traduccion mas generales (NLLB-200, M2M-100, MADLAD-400) cubren muchos mas pares de idiomas, pero son modelos de mayor tamano y no se dispone aqui de sus especificaciones ni de resultados comparables dentro de la informacion proporcionada, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que no se puede afirmar nada sobre calidad de traduccion (BLEU, COMET, chrF) ni compararla con alternativas.
- El repositorio tiene 0 descargas y 0 likes, y se creo y actualizo en la misma fecha (2026-09-22). No hay evidencia de uso en produccion ni de validacion por terceros.
- No se documentan datos de entrenamiento, composicion del corpus, sesgos conocidos ni evaluacion de sesgo. Cualquier afirmacion sobre sesgos seria especulativa.
- Riesgo de alucinacion y de traduccion fluida pero incorrecta: es un modelo de traduccion neuronal, por lo que puede producir falsos sentidos, omitir matices y fallar en terminologia especializada (legal, medica, tecnica). Requiere revision humana en dominios sensibles.
- Limitacion de idioma: solo cubre el par EN->FR. No traduce a otros idiomas ni funciona como modelo conversacional, de resumen o de generacion libre.
- Limitacion de contexto: no se declara la longitud maxima de entrada. Conviene verificar experimentalmente el comportamiento con frases largas o parrafos completos antes de usarlo en produccion, ya que los transformers de traduccion de este tipo suelen degradarse con entradas muy largas.
- La licencia declarada por el repositorio es apache-2.0, pero al tratarse de una importacion de `Xenova/opus-mt-en-fr`, que deriva del OPUS-MT original, conviene verificar la licencia del modelo fuente antes de un uso comercial. La informacion disponible no aclara este punto.
- La model card afirma "imported as published upstream (no conversion)" aunque tambien describe un conversor reproducible y un recipe de conversion. Es una ambiguedad documental que conviene aclarar con el autor si la trazabilidad es critica.
- El unico dato de rendimiento disponible es una prueba de humo con entradas de ceros, no representativa de carga real.
- Los ficheros `registry` se sirven desde `models.skillsafe.ai` "una vez validados", lo que implica una dependencia de un servicio externo para esa via de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/opus-mt-en-fr
- Modelo base: https://huggingface.co/Xenova/opus-mt-en-fr
- Commit upstream fijado: https://huggingface.co/Xenova/opus-mt-en-fr/tree/28726206f80896b90035bd99cccd5cc1e151f916
- Repositorio del conversor y recipes: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models

No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
