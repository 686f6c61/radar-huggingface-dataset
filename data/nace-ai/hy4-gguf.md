# nace-ai/Hy4-GGUF

## Resumen

Hy4 GGUF es una cuantización del modelo Hy4 de Tencent, publicada por Nace.AI para su uso con llama.cpp. El modelo base es un transformer con arquitectura Mixture of Experts (MoE) de 77 capas, con 769.907.408.797 parámetros totales, orientado a generación de texto y con capacidad de visión (el repositorio incluye un proyector visual separado, `mmproj-HY4-VL-BF16.gguf`, de 2,7 GB). La cuantización principal, `Hy4-Q4_K_M.gguf`, ocupa 447,5 GB y emplea 4,65 bits por peso.

La relevancia de esta ficha reside en que permite ejecutar un modelo de escala extrema en hardware de gama alta mediante llama.cpp, con una pérdida de calidad medida y documentada: 0,068 de KL media respecto al modelo BF16 y coincidencia del siguiente token con BF16 en el 91,8% de 5.621 posiciones evaluadas. Además, Nace.AI publica una segunda cuantización de 228,3 GB en formato STQ1_0 que requiere un runtime personalizado de llama.cpp.

La licencia es la Tencent Hy License, Version 1.0, que incluye términos comerciales específicos en su Sección 10 para grandes operadores de Model-as-a-Service. El repositorio tiene 230 descargas y 0 likes en el momento de la consulta, y fue creado el 23 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 77 capas MoE, segun la model card |
| Parametros totales | 769.907.408.797 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (4,65 bits por peso, 447,5 GB) y STQ1_0 (228,3 GB, requiere runtime personalizado) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (license_name: tencent-hy-license) |
| Formato de pesos | GGUF (mas proyector visual `mmproj-HY4-VL-BF16.gguf` en BF16) |

## Arquitectura y entrenamiento

El modelo base, tencent/Hy4, es un transformer MoE con 77 capas de expertos enrutados. La cuantizacion de Nace.AI aplica una estrategia de precision mixta denominada "Nace Weight Space Quantization": los pesos de los expertos enrutados de las 77 capas MoE se almacenan a 4 bits, mientras que la atencion, los expertos compartidos, la FFN densa de la primera capa, los embeddings y la capa de salida se mantienen a 8 bits. Las matrices de expansion de KV permanecen en BF16, y los routers y las normas conservan precision completa. Esta distribucion busca concentrar la perdida de precision en los parametros con menor impacto por token, preservando la fidelidad de los componentes estructurales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La model card tampoco detalla innovaciones de decodificacion ni mecanismos de atencion alternativos. La evaluacion de la cuantizacion se realizo sobre 11 textos reservados en noviembre de 2026, comparando la distribucion de siguiente token frente al modelo BF16.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag `conversational` aparece en los metadatos del repositorio.
- Vision: el repositorio incluye un proyector visual (`mmproj-HY4-VL-BF16.gguf`), lo que habilita entrada de imagenes junto al texto.
- Razonamiento y codigo: no hay datos especificos en la informacion disponible sobre rendimiento en estas tareas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas soportados no se especifican.
- Modo thinking: no disponible en la informacion proporcionada.
- Plantilla de chat propia: requiere `--jinja` en llama.cpp porque la plantilla de Hy4 no coincide con ninguna plantilla integrada.

## Casos de uso

- Despliegue de un modelo de escala frontera en infraestructura propia: con 447,5 GB en Q4_K_M, el modelo se puede servir en un nodo con multiples GPU de 80 GB mediante llama.cpp, evitando depender de APIs externas y manteniendo los datos en la infraestructura del operador.
- Procesamiento de documentos con imagenes: el proyector visual permite alimentar capturas, diagramas o paginas escaneadas junto a instrucciones de texto, adecuado para extraccion de informacion estructurada en flujos documentales.
- Generacion de texto conversacional de alta fidelidad: la baja divergencia respecto a BF16 (KL 0,068 y 91,8% de coincidencia en el siguiente token) lo hace apto para tareas donde pequenas variaciones de probabilidad afectan a la calidad, como redaccion asistida o resumenes largos.
- Evaluacion e investigacion de cuantizacion: el repositorio publica metricas KL comparadas con otras cuantizaciones de 4 bits (AngelSlim Q4_K_M con KL 0,091 y Xylolabs MLX 4-bit con KL 0,091), lo que lo convierte en un punto de referencia para estudiar el impacto de la cuantizacion en modelos MoE de gran escala.
- Servicio de inferencia con contexto moderado: el ejemplo oficial arranca llama-server con `-c 8192`, suficiente para conversaciones multi-turno y documentos de extension media en un servidor dedicado.
- Experimentacion con cuantizaciones extremas: la variante STQ1_0 de 228,3 GB permite probar el modelo en configuraciones de memoria mas ajustadas, a cambio de compilar un runtime especifico de llama.cpp.

## Benchmarks y rendimiento

| Metrica | Hy4 Q4_K_M (Nace.AI) | AngelSlim Q4_K_M | Xylolabs MLX 4-bit |
|---|---|---|---|
| Tamano del archivo de pesos | 447,5 GB | 470,2 GB | 447,6 GB |
| Bits por peso | 4,65 | no disponible | no disponible |
| KL media frente a BF16 | 0,068 | 0,091 | 0,091 |
| Coincidencia de siguiente token con BF16 | 91,8% de 5.621 posiciones | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al menos 447,5 GB para el archivo Q4_K_M completo, mas el proyector visual de 2,7 GB y el espacio de trabajo del runtime. La variante STQ1_0 requiere unos 228,3 GB.
- GPU recomendadas: nodos con multiples GPU de 80 GB (A100, H100) para cubrir los 447,5 GB. No se especifican configuraciones exactas en la model card.
- GPU de consumo: no cabe en ninguna GPU consumer individual; se necesitaria un conjunto de varias RTX 4090 (24 GB cada una) con al menos 19 unidades solo para los pesos, lo que en la practica descarta este escenario.
- Opciones de despliegue: llama.cpp exclusivamente, con el build del PR #32517 (commit `f8d4cc4`). Se requiere `--jinja` para la plantilla de chat y `-ngl 99` para descargar todas las capas en GPU. La variante STQ1_0 necesita un runtime personalizado de llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL vs BF16 | Licencia |
|---|---|---|---|---|---|
| Hy4 GGUF (Nace.AI) | 769,9 B | no disponible | Q4_K_M 447,5 GB / STQ1_0 228,3 GB | 0,068 | Tencent Hy License 1.0 |
| Hy4 Q4_K_M (AngelSlim) | 769,9 B (mismo base) | no disponible | Q4_K_M 470,2 GB | 0,091 | Tencent Hy License 1.0 |
| Hy4 MLX 4-bit (Xylolabs) | 769,9 B (mismo base) | no disponible | MLX 4-bit 447,6 GB | 0,091 | Tencent Hy License 1.0 |

Las tres alternativas son cuantizaciones del mismo modelo base tencent/Hy4, por lo que la comparacion se limita al formato, tamano y fidelidad de la cuantizacion. No se dispone de informacion sobre otros modelos de escala comparable para establecer una comparativa cruzada.

## Limitaciones y advertencias

- La licencia Tencent Hy License 1.0 incluye terminos comerciales especificos en su Seccion 10 para grandes operadores de Model-as-a-Service; es necesario revisar el archivo LICENSE antes de ofrecer el modelo como servicio.
- El modelo requiere un build no estandar de llama.cpp (PR #32517, commit `f8d4cc4`); las versiones oficiales no son compatibles y la variante STQ1_0 exige un runtime aun mas especifico.
- La plantilla de chat no coincide con ninguna plantilla integrada de llama.cpp, por lo que es obligatorio usar `--jinja`; omitirlo produce respuestas mal formateadas.
- La cuantizacion introduce una divergencia medible respecto a BF16 (KL 0,068, 91,8% de coincidencia en el siguiente token); en tareas sensibles a la precision puede ser preferible el modelo completo.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, idiomas soportados ni rendimiento en tareas especificas, lo que impide evaluar su idoneidad para produccion sin pruebas propias.
- El tamano del repositorio (678,5 GB) y de los archivos individuales exige almacenamiento y ancho de banda considerables para la descarga.
- El modelo base es de noviembre de 2026 y el ecosistema de herramientas en torno a el es reciente; la compatibilidad puede cambiar con futuras versiones de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Hy4-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4
- Sitio de Nace.AI: https://www.nace.ai/
- PR de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/pull/32517
- Fork de llama.cpp con el build: https://github.com/Little0o0/llama.cpp
- Variante STQ1_0: https://huggingface.co/nace-ai/Hy4-GGUF/tree/main/STQ1_0
- Licencia: https://huggingface.co/nace-ai/Hy4-GGUF/blob/main/LICENSE
