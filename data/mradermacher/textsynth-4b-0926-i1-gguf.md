# mradermacher/TextSynth-4B-0926-i1-GGUF

## Resumen

Este repositorio contiene versiones cuantizadas en formato GGUF del modelo theprint/TextSynth-4B-0926, un modelo de generación de texto de tipo transformer decoder-only (la etiqueta del repositorio incluye la referencia «qwen3») desarrollado por el usuario theprint. La cuantización la ha realizado mradermacher, un autor habitual de este tipo de conversiones, que aplica cuantización con imatrix (matriz de importancia) para preservar mejor la calidad en los niveles de bits más bajos. El problema que resuelve es el habitual de los GGUF: permitir la ejecución del modelo en hardware de consumo y en CPU mediante llama.cpp y sus derivados, algo imposible con los pesos originales en precisión completa.

El modelo base se presenta como «4B» y está entrenado aparentemente sobre el dataset theprint/Hemispheres-v0.3-Combo-GPT, con soporte declarado únicamente para inglés. La relevancia de este repositorio es práctica más que investigadora: ofrece hasta veinticuatro variantes de cuantización (desde IQ1_S e IQ2_XXS hasta Q6_K y Q8) para elegir el equilibrio entre tamaño, VRAM y calidad. Existe también un repositorio hermano con cuantizaciones «estáticas» (sin imatrix).

Hay que señalar una discrepancia importante en los metadatos: la ficha de HuggingFace reporta 958.716 parámetros para el modelo base según los datos de safetensors, mientras que el nombre comercial indica 4B. No se dispone de información adicional que permita resolver la contradicción, por lo que todas las estimaciones de recursos de esta ficha se ofrecen como rangos y se marcan explícitamente. Los contadores públicos del repositorio son de 0 descargas y 0 «likes» en el momento de la consulta, lo que indica que se trata de una conversión reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta del repositorio: qwen3; no se detalla la arquitectura exacta en la información disponible) |
| Parametros totales | 958.716 según metadatos de safetensors; el nombre del modelo indica 4B (discrepancia no resuelta, dato no concluyente) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL, además del fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye presumiblemente en safetensors (no confirmado) |

## Arquitectura y entrenamiento

No se proporciona información técnica detallada sobre la arquitectura interna en la documentación disponible. La model card del repositorio cuantizado es la plantilla estándar de mradermacher y no reproduce la ficha del modelo original: solo indica el modelo base (theprint/TextSynth-4B-0926), el dataset de entrenamiento declarado (theprint/Hemispheres-v0.3-Combo-GPT) y las etiquetas `transformer`, `unsloth`, `qwen3` y `text-generation-inference`. La etiqueta `qwen3` sugiere que el modelo base parte de una arquitectura de la familia Qwen3 o que el proceso de ajuste se realizó sobre ella, pero no hay confirmación explícita.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste por instrucciones, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, atención híbrida, etc.). La única innovación documentada en este repositorio es de naturaleza práctica: el uso de cuantización asistida por imatrix, que calcula una matriz de importancia a partir de estadísticas de activaciones para decidir qué pesos conservar con mayor precisión en cuantizaciones agresivas. Según la guía de Artefact2 enlazada en la propia model card, los cuantos IQ de tamaño comparable suelen ofrecer mejor perplejidad que los cuantos no IQ equivalentes.

## Capacidades

- Generación de texto en inglés: es la función principal declarada por el pipeline del modelo.
- Razonamiento y conversación multi-turno: presumiblemente soportados por tratarse de un modelo de instrucciones, aunque la model card no lo confirma explícitamente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la ficha; no se declara soporte de otros idiomas.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible en la información proporcionada.
- Ejecución local: capacidad derivada del formato GGUF, que permite inferencia en CPU, GPU híbrida y GPU completa con llama.cpp y ecosistema compatible.

## Casos de uso

- Asistentes de texto en local para desarrolladores: el formato GGUF permite ejecutar el modelo en portátiles con GPU de gama media o incluso en CPU, integrándolo en editores de código o terminales sin enviar datos a servicios externos.
- Generación de borradores y resúmenes en inglés: adecuado para pipelines de documentación técnica donde el modelo redacta borradores que después revisa un humano, con coste marginal nulo una vez desplegado.
- Clasificación y etiquetado de texto por lotes: con llama.cpp o llama-cpp-python se pueden procesar grandes volúmenes de documentos en inglés para tareas de categorización, extracción de entidades o filtrado.
- Prototipado rápido de aplicaciones de chat: gracias a las múltiples cuantizaciones, se puede empezar con un cuantización Q4_K_M en una GPU de 8-12 GB y subir de precisión cuando el prototipo se valide.
- Investigación sobre cuantización: el repositorio incluye el fichero imatrix y una gama muy amplia de cuantizaciones, lo que permite reproducir experimentos comparando IQ frente a cuantizaciones estándar del mismo tamaño sobre un mismo modelo base.
- Despliegue en entornos con recursos muy limitados: las variantes IQ1_S, IQ2_XXS y Q2_K permiten ejecutar el modelo en equipos con menos de 4 GB de memoria disponible, a costa de una degradación apreciable de la calidad.
- Base para ajuste fino ligero o destilación: al ser un modelo compacto y con licencia Apache 2.0, puede servir como punto de partida para experimentos académicos de ajuste supervisado.
- Generación de datos sintéticos en inglés: uso habitual de modelos pequeños y desplegables localmente para aumentar datasets de entrenamiento sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio cuantizado ni los metadatos accesibles incluyen valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. Tampoco se ofrecen mediciones de perplejidad de las distintas cuantizaciones sobre este modelo concreto; la model card únicamente enlaza un gráfico genérico de ikawrakow que compara tipos de cuantización en términos generales, no específicos de este modelo.

## Requisitos de hardware

Estimaciones orientativas basadas en la denominación «4B» del modelo; si el recuento real de parámetros fuese el que indican los metadatos (958.716), todas las cifras de memoria se reducirían aproximadamente a la cuarta parte. Se marcan explícitamente como estimaciones, no como datos publicados.

- Tamano en disco por cuantizacion (estimacion para ~4B parámetros):
  - IQ1_S / IQ2_XXS / Q2_K: ~1,4-1,7 GB
  - IQ3_XS / Q3_K_M: ~1,8-2,1 GB
  - IQ4_XS / Q4_K_M / Q4_1: ~2,3-2,6 GB
  - Q5_K_M: ~2,8-3,0 GB
  - Q6_K: ~3,2-3,5 GB
  - Q8_0 (si estuviera disponible): ~4,3 GB
- VRAM estimada para inferencia: añadir al tamaño del fichero entre 0,5 y 2 GB de caché KV según la longitud de contexto configurada y el número de secuencias en paralelo. Con 8.192 tokens de contexto, un Q4_K_M debería caber en unos 3,5-4 GB de VRAM totales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, A10G, L4, A100 y H100 (estas últimas sobredimensionadas para este tamaño). Cualquier GPU con 6 GB o más puede ejecutar las cuantizaciones Q4 e inferiores.
- Cabe en GPU de consumo: sí, prácticamente en todas las GPU modernas con 8 GB o más, y en varias de 6 GB si se usa una cuantización de 4 bits y contexto moderado.
- Ejecucion solo en CPU: viable con llama.cpp u Ollama; se recomienda un mínimo de 8 GB de RAM para Q4_K_M y 16 GB para trabajar con holgura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, Jan; también servidores compatibles con GGUF como llama.cpp server (API compatible con OpenAI) y text-generation-inference en sus versiones con soporte GGUF. vLLM requeriría la conversión a pesos safetensors.
- Latencia y throughput estimados: no hay mediciones publicadas para este modelo. Como referencia orientativa para un modelo de ~4B en 4 bits, cabría esperar del orden de 80-150 tokens/s en una RTX 4090 y de 10-25 tokens/s en CPU moderna con AVX2, pero estos valores no proceden de ninguna fuente verificada y deben medirse en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada. La comparación posible se limita a las distintas distribuciones del mismo modelo:

| Repositorio | Tipo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| mradermacher/TextSynth-4B-0926-i1-GGUF (este) | Cuantización con imatrix | Según metadatos, 958.716 (nombre: 4B) | no disponible | GGUF | apache-2.0 | Incluye fichero imatrix; ~24 tipos de cuantización |
| mradermacher/TextSynth-4B-0926-GGUF | Cuantización estática | Igual que el anterior | no disponible | GGUF | apache-2.0 | Sin imatrix; calidad inferior a igual tamaño según la propia model card |
| theprint/TextSynth-4B-0926 | Modelo base | Igual que el anterior | no disponible | Presumiblemente safetensors | apache-2.0 | Pesos sin cuantizar; requiere más VRAM |

Para alternativas de otros autores y de tamaño similar (por ejemplo, otros modelos de ~4B en GGUF), la información disponible no permite establecer una comparación fundamentada.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés. Su uso en castellano u otros idiomas no está soportado y previsiblemente dará resultados degradados.
- Discrepancia en el recuento de parámetros: los metadatos indican 958.716 parámetros mientras que el nombre indica 4B. Cualquier cálculo de recursos o coste debe verificarse antes de comprometer infraestructura.
- Sin benchmarks publicados: no existen datos de MMLU, HumanEval ni similares, por lo que no se puede estimar su calidad relativa frente a otros modelos de tamaño parecido.
- Riesgo de alucinación: no se documenta el proceso de alineación (RLHF, DPO ni ajuste por instrucciones), de modo que el comportamiento del modelo ante preguntas factuales es desconocido.
- Sesgos: no hay información sobre la composición del dataset Hemispheres-v0.3-Combo-GPT ni sobre análisis de sesgo, por lo que no se pueden caracterizar los sesgos presentes.
- Degradación por cuantización: las variantes IQ1_S, IQ2_XXS y Q2_K conllevan pérdidas de calidad notables. Para uso en producción se recomienda Q4_K_M o superior.
- Longitud de contexto desconocida: al no declararse la ventana de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperación sobre documentos extensos.
- Licencia: el repositorio se publica bajo Apache 2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base theprint/TextSynth-4B-0926 y el cumplimiento de las condiciones de los datos de entrenamiento antes de un despliegue comercial.
- Madurez: 0 descargas y 0 «likes» en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- Contenido de la model card: la ficha del repositorio es la plantilla genérica de mradermacher y no documenta capacidades, límites ni evaluación del modelo original.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/mradermacher/TextSynth-4B-0926-i1-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#TextSynth-4B-0926-i1-GGUF
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/TextSynth-4B-0926-GGUF
- Modelo base: https://huggingface.co/theprint/TextSynth-4B-0926
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/theprint/Hemispheres-v0.3-Combo-GPT
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
