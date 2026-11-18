# mradermacher/OrcaMaid-v2-FIX-13b-32k-i1-GGUF

## Resumen

OrcaMaid-v2-FIX-13b-32k-i1-GGUF es una cuantizacion en formato GGUF del modelo OrcaMaid-v2-FIX-13b-32k, publicada por el usuario mradermacher. El modelo base es un transformer de 13.015.864.320 parametros (aproximadamente 13 mil millones) con una ventana de contexto de 32.000 tokens, segun indica el propio nombre del repositorio. El modelo original fue desarrollado por ddh0 y esta orientado a generacion de texto conversacional y razonamiento general.

Esta publicacion concreta no aporta un modelo nuevo, sino un conjunto de pesos cuantizados con tecnicas de imatrix (importance matrix) y weighted quants, pensados para reducir el coste de memoria y permitir la inferencia en hardware mas modesto mediante llama.cpp y herramientas compatibles con GGUF. El repositorio incluye un amplio abanico de niveles de cuantizacion, desde IQ1_S hasta Q6_K, lo que cubre desde despliegues muy comprimidos hasta configuraciones de mayor fidelidad.

La relevancia de esta ficha es practica: permite a desarrolladores e investigadores evaluar rapidamente si esta cuantizacion encaja en su infraestructura. No obstante, la informacion publicada es escasa (sin licencia declarada, sin idiomas y sin benchmarks), por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.000 tokens (segun el nombre del modelo) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base OrcaMaid-v2-FIX-13b-32k mas alla de que se trata de un transformer de 13 mil millones de parametros con contexto de 32.000 tokens. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el tipo de atencion empleado. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del dataset) ni si hubo fases de RLHF, DPO o ajuste supervisado.

Lo que si documenta esta publicacion es el proceso de cuantizacion: se han generado pesos GGUF a partir del modelo en safetensors mediante conversion de tipo `hf`, con `quantize_version: 2` y `output_tensor_quantised: 1`. Se emplean cuantizaciones con imatrix (importance matrix) y variantes "weighted", lo que suele mejorar la calidad respecto a cuantizaciones estandar a igual numero de bits. El repositorio incluye 24 variantes de cuantizacion, desde IQ1_S hasta Q6_K, lo que permite ajustar el compromiso entre tamano y fidelidad.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas del modelo base OrcaMaid-v2.
- Razonamiento general y respuesta a instrucciones, segun la orientacion del modelo original (no verificable con benchmarks en la informacion disponible).
- Soporte de contexto largo de hasta 32.000 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Compatibilidad con llama.cpp y servidores compatibles con la API de endpoints, segun los tags del repositorio (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M o Q4_K_S permiten ejecutar un modelo de 13B en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipado local sin infraestructura dedicada.
- Procesamiento de documentos largos: con 32.000 tokens de contexto, el modelo puede resumir o extraer informacion de contratos, informes o articulos extensos en una sola pasada, siempre que la cuantizacion elegida mantenga la coherencia en contextos largos.
- Asistentes conversacionales autoalojados: al ser un GGUF compatible con servidores de endpoints, puede integrarse en un backend de chat interno para atencion al usuario o soporte tecnico de baja criticidad.
- Generacion de texto y redaccion asistida: adecuado para borradores, reescritura y generacion de contenido en entornos donde no se desea enviar datos a APIs externas.
- Experimentacion e investigacion: el amplio rango de cuantizaciones (de IQ1_S a Q6_K) permite estudiar la degradacion de calidad por nivel de compresion en un mismo modelo, util para trabajos sobre cuantizacion.
- Evaluacion comparativa de pipelines GGUF: sirve como banco de pruebas para medir throughput y latencia de llama.cpp en distintas configuraciones de hardware y cuantizacion.
- Fine-tuning ligero o destilacion: aunque no es el uso principal, el modelo base en safetensors puede servir de punto de partida para ajustes posteriores antes de recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el nivel de cuantizacion y el tamano del repo de 29,6 GB para todas las variantes):
  - IQ1_S / IQ1_M: en torno a 3-4 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: en torno a 4-5 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ3_*: en torno a 5,5-7 GB.
  - Q4_0 / Q4_1 / Q4_K_S / Q4_K_M / IQ4_XS / IQ4_NL: en torno a 7,5-9 GB.
  - Q5_K_S / Q5_K_M: en torno a 9-10,5 GB.
  - Q6_K: en torno a 11-12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para cuantizaciones medias y altas; A100 o H100 si se busca throughput alto o contexto completo de 32k con cuantizaciones Q5/Q6.
- Cabe en GPU de consumo: si, especialmente en modelos con 8 GB o mas usando cuantizaciones Q3 y Q4; las variantes IQ1/IQ2 caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de endpoints (segun tags), y cualquier runtime que soporte GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion o backends alternativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OrcaMaid-v2-FIX-13b-32k-i1-GGUF (este) | 13,0 B | 32k | GGUF (multiples quants) | no disponible | Cuantizaciones con imatrix, 24 variantes |
| OrcaMaid-v2-FIX-13b-32k (modelo base) | 13,0 B | 32k | safetensors | no disponible | Fuente de esta cuantizacion, autor ddh0 |
| Otros GGUF de 13B con contexto 32k | ~13 B | 32k | GGUF | variable | Existen alternativas de la familia Llama/Mistral, pero no se dispone de datos comparativos verificables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de un uso comercial debe verificarse la licencia del modelo base OrcaMaid-v2-FIX-13b-32k en su repositorio original.
- No se declaran idiomas soportados; el rendimiento en castellano es incierto y debe validarse empiricamente.
- No hay benchmarks publicados, por lo que la calidad real de esta cuantizacion frente al modelo original no esta documentada.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) pueden degradar notablemente la coherencia y el razonamiento, especialmente en contextos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 13B; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar los sesgos del dataset de entrenamiento del modelo base, que no se detalla.
- El contexto de 32k puede no mantenerse con fidelidad en cuantizaciones muy agresivas; conviene probar con la variante elegida antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- La fecha de creacion indicada (2026-11-17) es posterior a la fecha habitual de publicacion; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OrcaMaid-v2-FIX-13b-32k-i1-GGUF
- Modelo base: https://huggingface.co/ddh0/OrcaMaid-v2-FIX-13b-32k
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a esta cuantizacion.
