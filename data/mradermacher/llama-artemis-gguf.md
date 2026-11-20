# mradermacher/Llama-Artemis-GGUF

## Resumen

Llama-Artemis-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo jgchaparro/Llama-Leonida, publicada por el usuario mradermacher. El modelo subyacente es un Llama de 8.202.227.776 parámetros (aproximadamente 8,2 mil millones) afinado específicamente para la traducción al tsakonio, una variedad dialectal del griego en peligro de extinción que se habla en la costa este del Peloponeso. El repositorio no contiene pesos originales en safetensors, sino únicamente conversiones a GGUF en distintos niveles de cuantización pensadas para ejecución local con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en su carácter de recurso de nicho para lenguas de bajos recursos: el modelo base se entrenó con técnicas de GRPO (Group Relative Policy Optimization) y la librería Unsloth, según las etiquetas de la model card, lo que sugiere un ajuste fino orientado a mejorar la calidad de traducción en un par de lenguas con muy pocos datos paralelos disponibles. El pipeline declarado es translation y el único idioma etiquetado es el griego (el), aunque la tarea real es la traducción entre griego y tsakonio.

El repositorio fue creado el 10 de octubre de 2026 y actualizado el 20 de noviembre de 2026, acumula 458 descargas y no tiene likes. Su tamaño total es de 73,5 GB, lo que refleja la suma de todas las cuantizaciones publicadas (desde Q2_K de 3,4 GB hasta f16 de 16,5 GB). La licencia es llama3.1, heredada del modelo base, lo que impone las restricciones de la Llama 3.1 Community License para cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), según modelo base |
| Parametros totales | 8.202.227.776 (8,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | el (griego); tarea de traduccion al tsakonio |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (cuantizaciones estaticas); no se publican safetensors en este repo |

## Arquitectura y entrenamiento

El modelo base jgchaparro/Llama-Leonida es un transformer decoder-only de la familia Llama con 8,2 mil millones de parámetros, lo que lo sitúa en la misma clase de tamaño que Llama 3.1 8B. La model card del repositorio cuantizado no detalla la arquitectura interna más allá de las etiquetas, pero la nomenclatura y el número de parámetros son consistentes con un Llama 3.1 8B adaptado. No se especifica en la información disponible si se modificó la ventana de contexto, el tokenizador o la configuración de atención respecto al modelo original.

En cuanto al entrenamiento, las etiquetas indican el uso de GRPO (Group Relative Policy Optimization) y la librería Unsloth, lo que apunta a un ajuste fino con refuerzo sobre datos de traducción griego-tsakonio. No se dispone del número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo una fase previa de SFT seguida de GRPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el repositorio es exclusivamente un conjunto de cuantizaciones estáticas generadas con la herramienta de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Traducción entre griego y tsakonio, tarea principal declarada en el pipeline del modelo.
- Generación de texto conversacional, según la etiqueta "conversational" del repositorio.
- Procesamiento de griego moderno como lengua de origen o destino en el par de traducción.
- Manejo de una lengua de bajos recursos y en peligro de extinción, con vocabulario y ortografía específicos del tsakonio.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües limitadas: el único idioma etiquetado es el griego.

## Casos de uso

- Digitalización y traducción de corpus tsakonios: el modelo puede traducir textos históricos o etnográficos escritos en tsakonio al griego moderno, facilitando su catalogación en archivos lingüísticos y bibliotecas digitales.
- Preservación lingüística comunitaria: permite a hablantes y asociaciones culturales generar materiales bilingües (tsakonio-griego) para escuelas y talleres de revitalización, con un modelo ejecutable localmente en hardware modesto gracias a las cuantizaciones Q4.
- Investigación en lingüística de bajos recursos: sirve como línea base para experimentos de traducción automática en variedades dialectales griegas, comparando el efecto de GRPO frente a SFT clásico en pares con pocos datos paralelos.
- Subtitulado y transcripción asistida de grabaciones orales: combinado con un ASR para griego, el modelo puede apoyar la traducción de entrevistas a hablantes de tsakonio para su publicación en archivos orales.
- Aplicaciones educativas offline: al distribuirse en GGUF, puede integrarse en aplicaciones de escritorio o móviles con llama.cpp para ejercicios de traducción y vocabulario tsakonio sin conexión.
- Prototipado de traductores especializados: desarrolladores que necesiten un motor de traducción griego-tsakonio pueden desplegar la cuantización Q4_K_M (5,1 GB) en una estación de trabajo y evaluar la calidad antes de invertir en un ajuste propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB con Q4_K_S/Q4_K_M, 6-7 GB con Q5_K_M/Q6_K, 9-10 GB con Q8_0 y 17-18 GB con f16 (incluyendo overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB con Q3_K_M hasta una RTX 4090 con Q8_0; las cuantizaciones Q2_K (3,4 GB) permiten ejecución en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF; el repositorio se marca como endpoints_compatible.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Artemis-GGUF (este) | 8,2 B | no disponible | Traduccion griego-tsakonio | llama3.1 | GGUF en HF |
| jgchaparro/Llama-Leonida | 8,2 B | no disponible | Modelo base del que deriva | llama3.1 | Pesos originales en HF |
| Llama 3.1 8B Instruct | 8,0 B | 128 K (según ficha oficial de Meta) | Proposito general, multilingue | llama3.1 | Safetensors y GGUF |
| mradermacher/Llama-Artemis-i1-GGUF | 8,2 B | no disponible | Cuantizaciones imatrix del mismo modelo | llama3.1 | GGUF en HF |

La comparación con Llama 3.1 8B Instruct es la más directa por tamaño y licencia, pero Artemis está especializado en un par de lenguas muy concreto y no compite en capacidades generales. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El modelo está especializado en un único par de lenguas (griego-tsakonio); su rendimiento en otras tareas o idiomas será previsiblemente pobre.
- No se han publicado métricas de calidad de traducción (BLEU, chrF, COMET) en la información disponible, por lo que la calidad real es desconocida.
- Riesgo de alucinación y de generar formas inventadas en tsakonio, una lengua con ortografía poco estandarizada y escasos datos de referencia.
- La licencia llama3.1 impone restricciones de la Llama 3.1 Community License: uso comercial permitido con condiciones, obligación de atribución y cláusulas de aceptación; revisar el texto completo antes de desplegar en producción.
- El repositorio solo contiene GGUF; para fine-tuning adicional o inspección de pesos originales hay que acudir al modelo base jgchaparro/Llama-Leonida.
- El tamaño del repo (73,5 GB) obliga a descargar selectivamente la cuantización deseada, no el repositorio completo.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación ética; tratarlo como recurso de investigación y no como sistema de producción sin validación humana.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-Artemis-GGUF
- Modelo base: https://huggingface.co/jgchaparro/Llama-Leonida
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Llama-Artemis-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llama-Artemis-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico comparativo de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
