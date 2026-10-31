# mradermacher/EAN-8B-i1-GGUF

## Resumen

EAN-8B-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo DawnLiu/EVAN-8B, publicada por el cuantizador mradermacher, un colaborador muy activo de la comunidad HuggingFace especializado en versiones optimizadas para inferencia local. El modelo base, EVAN-8B, es un modelo multimodal de 8,19 mil millones de parámetros etiquetado con capacidades de razonamiento y entrenamiento mediante aprendizaje por refuerzo, habiendo sido entrenado con el dataset TIGER-Lab/ViRL39K, un conjunto de datos orientado a razonamiento visual y matemático.

Esta ficha no describe un modelo en sí, sino un repositorio de cuantizaciones: incluye desde versiones extremadamente comprimidas (IQ1_S, 2,2 GB) hasta versiones de alta fidelidad (Q6_K, 6,8 GB), lo que permite ejecutar el modelo en hardware muy diverso, desde portátiles sin GPU dedicada hasta estaciones de trabajo con GPUs de gama alta. La relevancia de este tipo de repositorio radica en que democratiza el acceso a modelos recientes: en cuanto se publica un modelo base, mradermacher genera cuantizaciones calibradas con imatrix que preservan mejor la calidad que las cuantizaciones estáticas equivalentes.

El modelo base es multimodal (procesa imágenes y texto) y está orientado a razonamiento, por lo que esta colección es especialmente interesante para desarrolladores que quieran desplegar capacidades de razonamiento visual en local con llama.cpp, Ollama u otros backends compatibles con GGUF. Cabe destacar que los ficheros mmproj (proyector multimodal) se encuentran en el repositorio estático hermano, no en este.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, según etiquetas del repo) |
| Parámetros totales | 8.190.735.360 (8,19 B, dato real de safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido; mmproj en el repo estático hermano) |

## Arquitectura y entrenamiento

El modelo base, DawnLiu/EVAN-8B, es un modelo multimodal de aproximadamente 8,19 mil millones de parámetros. Las etiquetas del repositorio indican que se trata de un modelo de razonamiento entrenado con aprendizaje por refuerzo, utilizando el dataset TIGER-Lab/ViRL39K, un corpus de unos 39.000 problemas de razonamiento visual y matemático con respuestas verificables, empleado habitualmente para RLVR (reinforcement learning with verifiable rewards). No se ha publicado información sobre la arquitectura concreta del vision encoder, el número de tokens de entrenamiento, ni la composición completa del preentrenamiento.

Respecto a las cuantizaciones, mradermacher emplea el método de cuantización con matriz de importancia (imatrix) de ikawrakow: se calcula una matriz de activaciones sobre un corpus de calibración y se usa para ponderar la cuantización de cada tensor, lo que reduce notablemente la degradación de calidad en niveles bajos (IQ1-IQ3) frente a cuantizaciones estáticas del mismo tamaño. Las etiquetas del README indican que la conversión se hizo desde el formato HF y que los ficheros mmproj necesarios para la parte de visión se publican en el repositorio estático mradermacher/EAN-8B-GGUF.

## Capacidades

- Razonamiento general y matemático: el modelo base fue entrenado con RL sobre problemas con respuesta verificable (ViRL39K), orientado a razonamiento paso a paso.
- Capacidades multimodales: según las etiquetas, el modelo procesa imágenes además de texto (los ficheros mmproj están en el repo estático).
- Generación de texto conversacional: etiquetado como conversational.
- No hay información publicada sobre soporte de tool calling o function calling.
- No hay información publicada sobre capacidades de agentes o razonamiento multi-paso estructurado más allá del entrenamiento con RL.
- Idioma principal: inglés; no hay datos sobre rendimiento en castellano.

## Casos de uso

- Razonamiento visual y matemático en local: al estar entrenado con ViRL39K, el modelo es adecuado para resolver problemas de matemáticas y lógica que incluyan imágenes (diagramas, gráficos), ejecutándose íntegramente en hardware propio sin enviar datos a APIs externas.
- Prototipado en hardware modesto: las cuantizaciones IQ2/IQ3 (2,6-4,2 GB) permiten probar el modelo en portátiles con 8 GB de RAM, útil para evaluación rápida antes de comprometerse con una cuantización mayor.
- Despliegue en GPUs de consumo: la versión Q4_K_M (5,1 GB, recomendada por el autor) cabe con holgura en una RTX 3060 de 12 GB o RTX 4060 Ti, ofreciendo inferencia acelerada por GPU con buena calidad.
- Asistentes conversacionales con entrada de imagen: mediante llama.cpp con soporte mmproj se puede montar un chat que acepte imágenes y genere respuestas con razonamiento.
- Investigación en RLVR y razonamiento: al derivar de un modelo entrenado con recompensas verificables, sirve como punto de partida o comparación para experimentos de destilación o evaluación de razonamiento.
- Integración en pipelines locales con Ollama o LM Studio: el formato GGUF facilita la carga directa en estas herramientas para pruebas de producto sin infraestructura de servidor.
- Generación del fichero imatrix propio: el fichero imatrix de 0,1 GB permite a usuarios avanzados crear cuantizaciones personalizadas calibradas con sus propios datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ni para el modelo base EVAN-8B ni para las cuantizaciones.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde unos 2,7 GB (IQ1_S, 2,2 GB de fichero) hasta unos 7,5 GB (Q6_K, 6,8 GB de fichero), más el contexto y el fichero mmproj si se usa la parte de visión.
- GPUs recomendadas: cualquier GPU de consumo con 8 GB de VRAM ejecuta cómodamente Q4_K_M (5,1 GB); con 12 GB (RTX 3060 12 GB, RTX 4070) se puede usar Q6_K con contexto amplio. No se necesitan A100 ni H100 para inferencia.
- Consumer GPUs: sí, cabe en la práctica totalidad de GPUs modernas de 6 GB en adelante con cuantizaciones IQ2/IQ3; también es ejecutable solo con CPU (modo llama.cpp puro) en equipos con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (backend de referencia para GGUF con imatrix), Ollama, LM Studio, y cualquier runtime compatible con GGUF. No está orientado a vLLM o TGI, que requieren formatos safetensors.
- Latencia y throughput: no disponibles; en un 8B cuantizado a Q4_K_M sobre GPU de consumo se pueden esperar velocidades del orden de decenas de tokens por segundo, pero no hay medidas publicadas para este repo.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/EAN-8B-i1-GGUF | 8,19 B | GGUF (imatrix) | Sí (mmproj en repo estático) | Apache 2.0 | 24 cuantizaciones, de IQ1_S a Q6_K |
| mradermacher/EAN-8B-GGUF (repo hermano) | 8,19 B | GGUF (estático) | Sí | Apache 2.0 | Cuantizaciones estáticas y ficheros mmproj |
| DawnLiu/EVAN-8B (modelo base) | 8,19 B | safetensors (HF) | Sí | Apache 2.0 | Pesos originales sin cuantizar, para vLLM/TGI/fine-tuning |

No se conocen alternativas comparables publicadas con datos suficientes para una comparación de rendimiento; en la categoría de modelos de razonamiento multimodal de ~8B con RLVR, otros ejemplos habituales del ecosistema incluyen variantes de Qwen2.5-VL y Vision-R1, pero no se dispone de datos publicados para compararlos con este modelo.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad real del modelo base no está verificada de forma independiente, y las etiquetas del repo no garantizan rendimiento.
- Degradación en cuantizaciones bajas: las versiones IQ1_S/IQ1_M (descritas por el autor como "for the desperate") sufren pérdida notable de calidad; para niveles Q2/Q3, el propio autor recomienda variantes IQ sobre las K equivalentes.
- Idioma: el modelo está etiquetado solo para inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Parte de visión separada: para usar imágenes es necesario descargar los ficheros mmproj del repositorio estático hermano; sin ellos, el modelo funciona solo como modelo de texto.
- Sesgos y riesgo de alucinación: no hay información específica publicada; como todo LLM de razonamiento entrenado con RL, puede generar cadenas de razonamiento plausibles pero incorrectas, por lo que se recomienda verificación de resultados en usos críticos.
- Longitud de contexto: no documentada; conviene verificarla en la configuración del modelo base antes de planificar despliegues con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero la model card del modelo base no documenta restricciones adicionales de datasets de entrenamiento; conviene revisar la ficha de DawnLiu/EVAN-8B antes de uso en producto.
- Repositorio de terceros: esta es una cuantización comunitaria sin soporte oficial del autor del modelo base.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/EAN-8B-i1-GGUF
- Repositorio de cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/EAN-8B-GGUF
- Modelo base: https://huggingface.co/DawnLiu/EVAN-8B
- Página de descarga resumida: https://hf.tst.eu/model#EAN-8B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
