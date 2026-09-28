# mradermacher/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy-GGUF

## Resumen

Este repositorio contiene una familia de cuantizaciones GGUF del modelo `NasledieLab/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy`, publicadas por mradermacher, un cuantizador conocido en HuggingFace por convertir pesos a formatos ligeros para inferencia local. El modelo subyacente pertenece a la familia Qwen 3.5 y tiene 752.393.024 parámetros reales (aproximadamente 0,75 mil millones), lo que lo sitúa en la gama de modelos pequenos orientados a ejecución en dispositivos modestos.

El interés practico del repositorio no esta en la arquitectura en si, sino en la disponibilidad de doce variantes de cuantización (desde Q2_K de 0,5 GB hasta f16 de 1,6 GB), lo que permite desplegar el modelo en CPU, GPU integradas o GPUs de gama de entrada con requisitos de memoria minimos. La licencia Apache-2.0 y el formato GGUF lo hacen atractivo para prototipado rapido y para pipelines donde el coste por token o la latencia de red son factores criticos.

Conviene senalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 27 de septiembre de 2026 y su model card es la plantilla generica de mradermacher: no incluye informacion sobre datos de entrenamiento, ventana de contexto, benchmarks ni proceso de alineamiento. La denominacion del modelo base (con referencias a "GPT-6", "Opus 5.5" o "Fable 5.1") sugiere un proceso de destilacion a partir de modelos de frontera, pero esto no esta documentado en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pertenece a la familia Qwen 3.5; el tag de una variante relacionada del mismo autor es `qwen3_5`) |
| Parametros totales | 752.393.024 (≈ 0,75 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors/transformers en el modelo base |
| Tamano del repositorio | 7,5 GB (suma de todos los ficheros GGUF) |
| Fecha de publicacion | 27 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna. El modelo base se enmarca en la familia Qwen 3.5, desarrollada por el equipo Qwen de Alibaba, y el nombre del repositorio indica que se trata de un modelo destilado ("distill") de 0,8 B de parametros. El tag `qwen3_5` aparece en repositorios hermanos del mismo cuantizador para modelos de la misma familia, lo que apunta a una arquitectura transformer decoder-only con tokenizador Qwen. No hay datos publicados sobre numero de capas, dimensiones ocultas, atencion (GQA/MQA) ni si incorpora mecanismos adicionales.

Tampoco se documenta el proceso de entrenamiento: no hay cifras de tokens de entrenamiento, composicion del dataset, ni confirmacion de fases de RLHF, DPO o SFT. La unica pista es el propio identificador del modelo base, que encadena nombres de sistemas de frontera (GPT-6, Astra Luna, Fable 5.1, Opus 5.5) junto al sufijo "distill-Karpy", lo que sugiere una destilacion sobre trazas generadas por varios modelos mayores; sin embargo, esto es una interpretacion del nombre y no un dato verificado en la model card.

En cuanto a la innovacion tecnica del repositorio, esta se limita al propio proceso de cuantizacion: mradermacher indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, y aclara que en el momento de la publicacion no hay cuantizaciones ponderadas ni con imatrix disponibles, solo cuantizaciones estaticas.

## Capacidades

- Generación de texto conversacional en inglés: el repositorio incluye el tag `conversational` y el modelo base está pensado para diálogo multi-turno.
- Modelo de propósito general de escala reducida: al no documentarse tareas específicas, sus capacidades deben validarse empíricamente antes de usarlo en producción.
- Ejecución local en CPU y hardware de bajas prestaciones gracias a las cuantizaciones de 0,5-0,9 GB.
- Compatibilidad con el ecosistema GGUF (llama.cpp y derivados), lo que habilita integración con servidores locales tipo Ollama o llama.cpp server.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible; el único idioma declarado es inglés.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible (no documentado).

## Casos de uso

- Clasificación y etiquetado de texto en inglés a gran escala: un modelo de 0,75 B en cuantización Q4_K_M ocupa 0,6 GB, por lo que se pueden ejecutar múltiples instancias en paralelo sobre una sola GPU o sobre CPU para procesar lotes masivos de documentos con coste energético bajo.
- Filtrado previo en arquitecturas de enrutamiento de modelos: usar esta variante como primera etapa para descartar consultas triviales o clasificar la intención antes de invocar un modelo mayor reduce el coste por consulta en sistemas de dos niveles.
- Asistentes conversacionales locales con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo (portátil, mini-PC, Raspberry Pi 5), los datos del usuario no salen de la máquina, lo que encaja en escenarios sanitarios, legales o industriales con restricciones de tratamiento de datos.
- Prototipado y pruebas de integración de pipelines de inferencia: el formato GGUF permite validar rápidamente el flujo completo (tokenizador, plantilla de chat, servidor, cliente) sin necesidad de aprovisionar GPU, antes de migrar a un modelo mayor.
- Investigación sobre cuantización agresiva: el repositorio ofrece doce variantes del mismo modelo (de Q2_K a f16), lo que permite medir la degradación de perplejidad y calidad entre niveles de cuantización sobre una base idéntica.
- Generación de texto corto y reescritura: resúmenes de párrafos, normalización de campos, generación de títulos o reescritura de frases en inglés en aplicaciones de productividad sin conexión.
- Educación y demos interactivas: el tamaño reducido permite desplegar el modelo en aulas o talleres sobre hardware convencional, mostrando el funcionamiento interno de un LLM sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio es la plantilla genérica de mradermacher e incluye únicamente la tabla de cuantizaciones disponibles (tipo, tamaño en GB y notas cualitativas), sin métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más la caché KV y el overhead del runtime. Ficheros publicados: Q2_K 0,5 GB; Q3_K_S 0,5 GB; Q3_K_M 0,6 GB; Q3_K_L 0,6 GB; Q4_K_S 0,6 GB; IQ4_XS 0,6 GB; Q4_K_M 0,6 GB; Q5_K_S 0,7 GB; Q5_K_M 0,7 GB; Q6_K 0,7 GB; Q8_0 0,9 GB; f16 1,6 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente incluso en f16. No se requiere A100, H100 ni RTX 4090; una GTX 1650, RTX 3050, RTX 4060 o una GPU integrada reciente cubren el caso de uso con holgura.
- Cabe en GPU de consumo: sí, en todas las gamas actuales y en muchas generaciones anteriores. La cuantización Q8_0 (0,9 GB) es holgada incluso en iGPU con memoria compartida.
- CPU: la inferencia en CPU es viable; con cuantizaciones Q5_K_M o Q6_K el modelo entra en unos 0,7-1 GB de RAM, por lo que también funciona en placas tipo Raspberry Pi con 4 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. También es posible convertir a otros formatos desde el modelo base en safetensors si se necesita vLLM o TGI, aunque para 0,75 B esos motores aportan poco frente a llama.cpp.
- Latencia y throughput: no disponibles (el autor no publica mediciones). Cualquier cifra concreta debe obtenerse midiendo sobre el hardware objetivo.

## Comparativa con modelos similares

Los datos de los modelos de comparación proceden de sus respectivas fichas públicas; los valores marcados como "no disponible" no se han verificado en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-0.8B-...-Karpy-GGUF | 0,75 B | no disponible | Apache-2.0 | GGUF | no disponible |
| Qwen2.5-0.5B | 0,49 B | 32 768 tokens (ampliable con YaRN) | Apache-2.0 | safetensors, GGUF | no disponible |
| Llama-3.2-1B | 1,24 B | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF | no disponible |
| SmolLM2-1.7B | 1,7 B | 8 192 tokens | Apache-2.0 | safetensors, GGUF | no disponible |

Frente a estas alternativas, la ventaja del modelo aquí descrito es su menor huella de memoria en cuantizaciones bajas (0,5-0,6 GB), mientras que su principal desventaja es la ausencia total de documentación, benchmarks y validación comunitaria, además de un alcance limitado al inglés.

## Limitaciones y advertencias

- Ausencia de documentación: la model card es una plantilla automática. No hay información sobre datos de entrenamiento, contexto máximo, plantilla de chat ni hiperparámetros de generación, lo que obliga a validar el comportamiento empíricamente.
- Riesgo de alucinación: no disponible (no hay evaluaciones publicadas), pero es esperable un riesgo alto en un modelo de 0,75 B sin datos de alineamiento documentados.
- Idiomas: únicamente se declara inglés. El rendimiento en castellano no está documentado y, con este tamaño, es previsible que sea deficiente.
- Sesgos: no disponibles. Al no documentarse la composición del dataset ni el proceso de alineamiento, no se puede evaluar qué sesgos incorpora el modelo ni si se aplicaron técnicas de mitigación.
- Procedencia del modelo base: el identificador incluye referencias a sistemas de frontera (GPT-6, Opus 5.5, Fable 5.1). Si el modelo se ha destilado a partir de salidas de esos sistemas, su uso podría contravenir las condiciones de servicio de dichos proveedores; conviene revisar la situación legal antes de cualquier despliegue comercial. La licencia Apache-2.0 del repositorio de cuantización cubre los pesos publicados, pero no necesariamente las implicaciones derivadas del proceso de destilación.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin discusiones comunitarias ni validación independiente. No existe evidencia de terceros sobre su calidad.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S ocupan 0,5 GB y el propio autor advierte de "lower quality" en Q3_K_M; en modelos pequeños, la degradación por cuantización agresiva suele ser más acusada que en modelos grandes. Para producción se recomienda Q5_K_M, Q6_K o superior.
- No hay cuantizaciones ponderadas ni imatrix disponibles, según indica el autor, lo que limita las opciones de optimización de calidad por bit.
- Sin endpoints de inferencia oficiales ni integración verificada con frameworks de agentes: el uso en producción exige construir el stack de despliegue por cuenta propia.
- El repositorio ocupa 7,5 GB en total, de modo que la descarga completa es innecesaria si solo se necesita una variante.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy-GGUF
- Modelo base: https://huggingface.co/NasledieLab/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy
- Página de resumen del cuantizador para este modelo: https://hf.tst.eu/model#Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy-GGUF
- Cuantización Q4_K_M (recomendada por el autor): https://huggingface.co/mradermacher/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy-GGUF/resolve/main/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy.Q4_K_M.gguf
- Cuantización Q8_0: https://huggingface.co/mradermacher/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy-GGUF/resolve/main/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy.Q8_0.gguf
- Cuantización f16: https://huggingface.co/mradermacher/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy-GGUF/resolve/main/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-Karpy.f16.gguf
- Perfil del autor en HuggingFace: https://huggingface.co/mradermacher
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que financia el trabajo del cuantizador: https://www.nethype.de/
- Guía general de Qwen 3.5 (benchmarks y despliegue local): https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks
- Repositorio auxiliar en GitHub con notas de uso: https://github.com/Damacol/mradermacher-qwen3.5-0.8b-sft-claude-opus-reasoning-unsloth-gguf
- Repositorio auxiliar en GitHub (variante base i1): https://github.com/Damacol/mradermacher-qwen3.5-0.8b-base-i1-gguf/blob/main/README.md
