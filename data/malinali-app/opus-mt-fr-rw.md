# malinali-app/opus-mt-fr-rw

## Resumen

El modelo malinali-app/opus-mt-fr-rw es un paquete de traducción automática fr→rw (francés a kinyarwanda) publicado por el desarrollador malinali-app como adaptación de los pesos de Helsinki-NLP/opus-mt-fr-rw, perteneciente a la familia OPUS-MT. No se trata de un modelo entrenado desde cero, sino de un reempaquetado: el autor convierte los pesos originales a safetensors y transforma los tokenizadores SentencePiece en tokenizadores rápidos en formato JSON compatibles con Candle, el framework de inferencia en Rust. El objetivo es la inferencia en dispositivo (on-device) dentro de la aplicación Malinali, sin depender de servidores externos.

Arquitectónicamente es un transformer encoder-decoder de tipo Marian, con 75.996.824 parámetros totales (aproximadamente 76 millones) y un tamaño de repositorio de 0,3 GB, lo que corresponde a pesos en precisión completa (fp32). Soporta únicamente el par de idiomas fr y rw, y su pipeline declarado es translation.

Su relevancia es limitada pero específica: el kinyarwanda es un idioma de bajos recursos con pocas opciones de traducción automática de calidad, y este paquete ofrece un artefacto compacto, ligero y ejecutable en dispositivos móviles mediante Candle. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, y la licencia no está declarada de forma explícita en el repositorio, por lo que requiere verificación antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), seq2seq para traducción |
| Parametros totales | 75.996.824 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas; los pesos se publican en safetensors (fp32, aproximadamente 304 MB) |
| Idiomas soportados | fr (francés) y rw (kinyarwanda), solo dirección fr→rw |
| Licencia | No disponible en el repositorio; la model card indica que debe seguirse la licencia del modelo original (habitualmente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (model.safetensors) |
| Tokenizadores | tokenizer-enc.json (origen) y tokenizer-dec.json (destino), formato fast tokenizer |
| Libreria declarada | transformers; compatible con endpoints y con Candle |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Helsinki-NLP/opus-mt-fr-rw |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Marian, un transformer encoder-decoder orientado a traducción automática neuronal. Al derivar directamente de Helsinki-NLP/opus-mt-fr-rw, hereda el entrenamiento original de OPUS-MT: un corpus paralelo extraído de las colecciones OPUS, con fr y rw como par lingüístico. No se dispone en la información proporcionada de datos concretos sobre número de tokens de entrenamiento, composición exacta del dataset, ni sobre si se aplicaron fases de RLHF, DPO o fine-tuning adicional. El autor de este repositorio declara explícitamente que no reclama la propiedad del modelo entrenado y que su aportación se limita al reempaquetado de pesos y a la conversión de tokenizadores.

La innovación técnica del paquete es de ingeniería de despliegue más que de modelado: la conversión de SentencePiece a tokenizadores rápidos en JSON permite su uso con `marian_flutter` sobre Candle, lo que habilita inferencia en dispositivo en Rust y en Flutter sin depender de Python. Los ficheros distribuidos son cuatro: config.json (configuración Marian), model.safetensors (pesos), tokenizer-enc.json y tokenizer-dec.json. No se documentan técnicas como decodificación especulativa, atención lineal ni variantes híbridas.

## Capacidades

- Traducción automática unidireccional de francés a kinyarwanda (fr→rw), sin soporte declarado para la dirección inversa rw→fr en este repositorio.
- Generación de texto secuencia a secuencia mediante el pipeline `text2text-generation` / `translation` de transformers.
- Inferencia en dispositivo mediante Candle, con tokenizadores rápidos separados para codificador y decodificador.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo restringido al par fr/rw; no se documentan capacidades adicionales en otros idiomas.

## Casos de uso

- Traducción offline en aplicaciones móviles: al ser un modelo de 76 millones de parámetros y 0,3 GB, puede integrarse en una app Flutter mediante Candle y `marian_flutter` para traducir texto fr→rw sin conexión a internet, útil en regiones con conectividad intermitente.
- Herramientas de traducción para organizaciones humanitarias y ONG en Ruanda: permite convertir documentación, formularios o comunicados redactados en francés a kinyarwanda de forma local, sin enviar datos sensibles a servicios en la nube.
- Localización de productos digitales: traducción de cadenas de interfaz, correos y textos de marketing del francés al kinyarwanda dentro de un pipeline de localización, con el modelo ejecutándose en el propio servidor o dispositivo.
- Preprocesado y aumento de datos en investigación NLP: generación de pares sintéticos fr→rw para ampliar corpus paralelos de un idioma de bajos recursos, siempre que se valide la calidad de las traducciones resultantes.
- Traducción de materiales educativos: conversión de apuntes, ejercicios o temarios escolares redactados en francés a kinyarwanda para entornos con recursos limitados.
- Integración en asistentes de mensajería o chat: traducción de mensajes entrantes en francés a kinyarwanda en tiempo real dentro de una aplicación de comunicación, con latencia baja al tratarse de un modelo compacto.
- Despliegue en hardware de gama baja: uso en Raspberry Pi, portátiles sin GPU o terminales de bajo consumo donde no es viable ejecutar modelos de traducción de cientos de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas como BLEU, chrF, MMLU o cualquier otra evaluación cuantitativa, y tampoco se han encontrado referencias externas en la búsqueda web realizada (los resultados devueltos no guardan relación con el modelo). No se deben asumir cifras procedentes del modelo base sin verificarlas en la ficha de Helsinki-NLP/opus-mt-fr-rw.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (los pesos ocupan aproximadamente 304 MB, más el estado del tokenizador y los buffers de activación). En cuantización int8 hipotética bajaría a unos 76 MB, aunque no se distribuyen pesos cuantizados.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 quedan enormemente sobredimensionadas para este modelo. El caso de uso natural es CPU.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer de los últimos diez años, e incluso en iGPU y en dispositivos móviles.
- Despliegue: Candle mediante `marian_flutter` (vía principal declarada por el autor), transformers con PyTorch, y servidores de inferencia compatibles con el pipeline de traducción de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI para este repositorio concreto.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| malinali-app/opus-mt-fr-rw | 75.996.824 | No disponible | fr→rw | No disponible (remite a la del modelo base) | safetensors | Reempaquetado para Candle; 0 descargas |
| Helsinki-NLP/opus-mt-fr-rw | Aproximadamente 76M (mismo modelo base) | No disponible | fr→rw | Habitualmente CC-BY 4.0 | PyTorch / safetensors | Modelo original de OPUS-MT; referencia directa |
| NLLB-200 (variantes destiladas, 600M) | 600M en la variante destilada | No disponible en esta ficha | Hasta 200 idiomas, incluido el kinyarwanda | CC-BY-NC 4.0 en varias variantes (verificar) | safetensors | Mucho mayor cobertura lingüística, pero más pesado y con posibles restricciones no comerciales |
| M2M-100 (418M) | 418M | No disponible en esta ficha | 100 idiomas | MIT (verificar la variante concreta) | PyTorch | Alternativa multilingüe de mayor tamaño y mayor coste de inferencia |

La comparación con NLLB-200 y M2M-100 se ofrece como referencia de categoría (traducción automática multilingüe), pero los datos de contexto, licencia exacta y rendimiento deben confirmarse en sus respectivas fichas antes de tomar una decisión de producción.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de calidad de traducción publicadas para este repositorio, por lo que no se puede afirmar un nivel de BLEU o chrF concreto.
- Licencia no declarada de forma explícita: la model card remite a la licencia del modelo original, habitualmente CC-BY 4.0 en OPUS-MT, lo que exigiría atribución. Antes de un uso comercial hay que verificar la licencia real del modelo base y de este reempaquetado.
- Modelo unidireccional: solo traduce de francés a kinyarwanda; no cubre la dirección inversa en este repositorio.
- Idioma de bajos recursos: el kinyarwanda tiene menos datos paralelos disponibles que idiomas mayoritarios, lo que suele traducirse en mayor tasa de errores, omisiones y alucinaciones en frases largas o con terminología especializada.
- Riesgo de alucinación: como cualquier modelo seq2seq entrenado con corpus paralelos ruidosos (OPUS), puede generar traducciones fluidas pero incorrectas, especialmente en nombres propios, cifras y vocabulario técnico.
- Longitud de contexto no documentada: no se especifica el número máximo de tokens de entrada, lo que obliga a validar empíricamente el comportamiento con párrafos largos antes de usarlo en producción.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni informes de terceros.
- Fechas de publicación y actualización poco habituales (registradas en 2026), lo que puede indicar metadatos automatizados; conviene contrastar la procedencia de los artefactos.
- No se distribuyen pesos cuantizados (GGUF, int8, int4), lo que limita las opciones de optimización fuera del ecosistema safetensors y Candle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-fr-rw
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fr-rw
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los enlaces obtenidos correspondían a contenido no relacionado), por lo que no se incluyen papers, blogs ni demos adicionales.
