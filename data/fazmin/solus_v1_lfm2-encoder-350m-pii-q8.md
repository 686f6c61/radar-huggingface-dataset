# Fazmin/solus_v1_lfm2-encoder-350m-pii-q8

## Resumen

El modelo `Fazmin/solus_v1_lfm2-encoder-350m-pii-q8` es un detector de informacion personal identificable (PII) basado en el encoder bidireccional LFM2.5-Encoder-350M de LiquidAI, con una cabecera de clasificacion de tokens de tipo BIOES. Fue convertido a ONNX y cuantizado a 8 bits por el equipo de Solus en la Facultad de Ingenieria de la Universidad McMaster, con el objetivo de ofrecer una alternativa ligera y eficiente para el etiquetado de entidades PII en entornos con recursos limitados.

A diferencia de los modelos generativos, este es un clasificador de tokens: etiqueta cada subpalabra y los intervalos se reconstruyen a partir de las etiquetas, por lo que no puede inventar hallazgos que no esten en la entrada. Cubre 40 tipos de entidades personales en 16 idiomas, incluyendo identidad, contacto, datos financieros, credenciales, dispositivos, ubicacion, salud y categorias especiales. Su tamano de 0.4B de parametros y su formato ONNX cuantizado permiten ejecutarlo en CPU con tan solo 2 GB de RAM, sin necesidad de VRAM.

El modelo es relevante en el contexto actual de privacidad y cumplimiento normativo, ya que permite detectar y enmascarar PII en documentos, logs y pipelines de datos de forma local, sin depender de servicios en la nube. Su licencia lfm1.0 restringe el uso comercial, por lo que conviene revisarla antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional LFM2.5 con cabecera de token-classification BIOES (161 clases, 40 entidades) |
| Parametros totales | 0.4B (350M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2,048 subwords, solapado para texto mas largo |
| Tipos de cuantizacion | 8-bit (MatMulNBits, block size 128, asimetrico) |
| Idiomas soportados | en, de, fr, es, pt, it, pl, ru, zh, ja, ko, ar, hi, id, vi, th (16 idiomas) |
| Licencia | lfm1.0 (Liquid AI Open License) |
| Formato de pesos | ONNX (model_q8.onnx + model_q8.onnx.data) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de LFM2.5-Encoder-350M, un encoder bidireccional desarrollado por LiquidAI, con una cabecera de token-classification que etiqueta cada subpalabra con un esquema BIOES de 161 clases correspondientes a 40 tipos de entidades PII. La arquitectura es un transformer bidireccional clasico, sin componentes generativos ni MoE. El entrenamiento del modelo original no esta documentado en la informacion disponible, pero se sabe que es un fine-tune supervisado para la tarea de deteccion de PII.

La conversion a ONNX se realizo con `torch.onnx.export` (opset 17, con `use_cache` desactivado) y posteriormente se cuantizo a 8 bits con MatMulNBits (block size 128, asimetrico). La validacion se hizo en dos etapas: la exportacion fp32 coincide con el modelo PyTorch a 3e-5 con spans identicos en los fixtures de exportacion, y el grafo de 8 bits reproduce los mismos hallazgos post-decode en todos ellos. No se aplicaron tecnicas como RLHF o DPO al modelo original en esta conversion.

Una innovacion destacable es el nivel regex adicional descrito en la model card: como todo clasificador de tokens byte-BPE, el modelo fragmenta los limites de valores con formato (por ejemplo, etiqueta `905` y `555` dentro de un numero de telefono). Para reparar estos limites, el repositorio original incluye `pii_hybrid_decode.py`, un nivel regex que empareja formatos distintivos (email, IBAN, tarjeta, IP, URL, SSN, MAC, crypto wallet, API key) de forma independiente y solo amplia fragmentos para formatos propensos a falsos positivos (telefono, fecha de nacimiento, cantidad, codigo postal). Solus reimplementa esto en Rust como `solus_engine::pii_hybrid`.

## Capacidades

- Deteccion de PII: etiqueta 40 tipos de entidades personales, incluyendo identidad (nombre, DNI, pasaporte, SSN), contacto (email, telefono, direccion, IP), financiero (tarjeta, IBAN, cuenta bancaria, cripto wallet), credenciales (API key, JWT, password, private key), dispositivo (IMEI, MAC), ubicacion (GPS, codigo postal), salud (condicion, medicacion, historial) y categorias especiales (religion, orientacion, politica, estado de salud).
- Multilingue: soporta 16 idiomas, incluyendo ingles, aleman, frances, espanol, portugues, italiano, polaco, ruso, chino, japones, coreano, arabe, hindi, indonesio, vietnamita y tailandes.
- Token classification: etiqueta cada subpalabra con un esquema BIOES de 161 clases, lo que permite reconstruir los spans completos de las entidades.
- Ejecucion en CPU: al ser un modelo cuantizado a 8 bits, puede ejecutarse sin GPU, con un minimo de 2 GB de RAM.
- Sin capacidades generativas: no es un LLM generativo, no soporta tool calling, ni agentes, ni vision, ni audio.

## Casos de uso

- Enmascaramiento de PII en documentos corporativos: el modelo puede etiquetar y enmascarar nombres, telefonos, direcciones y datos financieros en contratos o informes antes de compartirlos internamente o con terceros, gracias a su cobertura de 40 tipos de entidades en 16 idiomas.
- Cumplimiento de GDPR y otras normativas: permite detectar datos personales en bases de datos o logs para responder a solicitudes de acceso o supresion, ejecutandose localmente sin enviar datos sensibles a servicios externos.
- Sanitizacion de logs de aplicaciones: al ejecutarse en CPU y con bajo uso de RAM, se puede integrar en pipelines de logging para eliminar credenciales, tokens o datos personales antes de almacenar o centralizar los registros.
- Deteccion de fugas de informacion: analiza documentos o correos internos para identificar la presencia de numeros de tarjeta, IBAN o credenciales que no deberian estar en texto plano, facilitando la respuesta ante incidentes de seguridad.
- Preprocesamiento de datos para entrenamiento: antes de usar datos de clientes en pipelines de IA, el modelo puede filtrar PII para evitar que informacion sensible se incluya en los conjuntos de entrenamiento.
- Redaccion de documentos legales o medicos: con soporte para categorias de salud y categorias especiales, puede enmascarar datos de pacientes o informacion sensible en historiales clinicos o expedientes legales antes de compartirlos con entidades externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el grafo fp32 coincide con el modelo PyTorch a 3e-5 y que el grafo de 8 bits reproduce los mismos hallazgos post-decode en todos los fixtures de exportacion, pero no se proporcionan metricas de exactitud, precision o recall sobre conjuntos de prueba publicos.

## Requisitos de hardware

- VRAM: no requerida, el modelo se ejecuta en CPU.
- RAM minima: 2.0 GB.
- Tamano de instalacion: 546.0 MB (desglose: `model_q8.onnx` 401.3 KB, `model_q8.onnx.data` 541.1 MB, `tokenizer.json` 4.5 MB, `labels.json` 5.4 KB, `onnx_export_metadata.json` 1.4 KB).
- GPU recomendadas: ninguna, disenado para CPU.
- Opciones de despliegue: se ejecuta con ONNX Runtime (`onnxruntime`), usando el grafo `model_q8.onnx` y el tokenizador de HuggingFace (`tokenizers`). No requiere servidores de inferencia como vLLM o TGI.
- Latencia y throughput: no se proporcionan datos especificos, pero al ser un encoder de 350M cuantizado, es apto para inferencia en tiempo real en CPU para textos de hasta 2,048 subpalabras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipos de PII | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Fazmin/solus_v1_lfm2-encoder-350m-pii-q8 | 0.4B | 2,048 subwords | 40 | 16 | lfm1.0 | ONNX 8-bit |
| LiquidAI/LFM2.5-Encoder-350M-PII-Detector (original) | 0.4B | 2,048 subwords | 40 | 16 | lfm1.0 | safetensors |
| GLiNER2 (mencionado en la model card) | no disponible | no disponible | 7 | 7 | no disponible | no disponible |

La principal diferencia frente al modelo original es el formato de pesos: este modelo esta cuantizado a 8 bits y exportado a ONNX, lo que reduce el tamano de instalacion y permite ejecutarlo en CPU con menos RAM. GLiNER2, mencionado en la model card, cubre solo 7 tipos de PII en 7 idiomas, por lo que este modelo ofrece una cobertura mucho mas amplia.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos para este modelo, pero al ser un fine-tune de un encoder entrenado en datos multilingues, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: al ser un clasificador de tokens, no puede inventar hallazgos que no esten en la entrada, pero si puede etiquetar fragmentos erroneos o no etiquetar entidades reales si el modelo no las reconoce correctamente.
- Fragmentacion de valores con formato: el modelo etiqueta fragmentos de valores como telefonos o URLs, por lo que es imprescindible usar el nivel regex de reparacion de limites (`pii_hybrid_decode.py` o la reimplementacion en Rust `solus_engine::pii_hybrid`) para obtener resultados correctos. Sin este nivel, un enmascaramiento basado en las etiquetas brutas dejaria parte del valor en el documento.
- Restricciones de licencia: la licencia lfm1.0 es una licencia open source de Liquid AI que puede tener restricciones para uso comercial. Hay que revisar el texto completo en el enlace de la licencia antes de desplegarlo en entornos de produccion.
- Limitaciones de contexto: la ventana maxima es de 2,048 subwords; para textos mas largos se requiere solapamiento de ventanas, lo que puede introducir duplicados o perdidas de entidades en los limites de las ventanas.
- Limitaciones de idioma: aunque soporta 16 idiomas, no cubre todos los idiomas del mundo; para idiomas fuera de esa lista, la deteccion puede ser muy deficiente o no funcionar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Fazmin/solus3_lfm2-encoder-350m-pii-q8)
- [Modelo original: LiquidAI/LFM2.5-Encoder-350M-PII-Detector](https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M-PII-Detector)
- [Blog de Liquid AI sobre los encoders LFM2.5](https://www.liquid.ai/blog/lfm2-5-encoders)
- [Documentacion de Liquid AI para LFM2.5-Encoder-350M](https://docs.liquid.ai/lfm/models/lfm25-encoder-350m)
- [Ejemplo de uso con transformers.js en GitHub](https://github.com/kucukkanat/lfm-encoders)
