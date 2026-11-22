# mradermacher/Skyfall-31B-v4-GGUF

## Resumen

Skyfall-31B-v4-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo Skyfall-31B-v4, desarrollado originalmente por TheDrummer. El repositorio lo publica mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local, y está pensado para su uso con llama.cpp y herramientas compatibles. El modelo base cuenta con 31.352.980.480 parámetros (aproximadamente 31,35 mil millones) según los pesos en safetensors, lo que lo sitúa en la gama de modelos densos de tamaño medio-grande.

La model card del repositorio no aporta información sobre arquitectura interna, datos de entrenamiento, longitud de contexto ni licencia del modelo original; se limita a listar las cuantizaciones disponibles y a remitir al modelo base. El único idioma declarado es el inglés, y las etiquetas incluyen "conversational", lo que sugiere un ajuste orientado a diálogo.

La relevancia de este repositorio es práctica: ofrece 11 variantes de cuantización (desde Q2_K hasta Q8_0, más IQ4_XS) con tamaños que van de 11,8 GB a 33,4 GB, lo que permite desplegar un modelo de 31B en hardware de consumo con distintas relaciones calidad/tamaño. Existe además un repositorio hermano con cuantizaciones ponderadas/imatrix para quienes buscan mayor calidad por bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer denso, inferido por el recuento de parámetros; no confirmado en la información) |
| Parametros totales | 31.352.980.480 (31,35 B) |
| Parametros activos | no aplica (no hay indicios de MoE en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base TheDrummer/Skyfall-31B-v4 en la documentación proporcionada. El recuento de parámetros (31,35 B) y el pipeline de transformers sugieren un transformer denso, pero no se confirma ni el tipo de atención, ni si emplea mezcla de expertos, ni innovaciones como decodificación especulativa o atención lineal.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado. La etiqueta "conversational" y el nombre "Skyfall" apuntan a un modelo afinado para diálogo, pero es una inferencia, no un dato confirmado. El trabajo de mradermacher consiste exclusivamente en la cuantización estática del modelo original; no modifica los pesos más allá de la reducción de precisión.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Razonamiento y generación de texto general: capacidad esperable por tamaño, pero no documentada explícitamente.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés declarado; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M (19,1 GB) y Q4_K_S (18,0 GB) caben en GPUs con 24 GB de VRAM, como la RTX 4090, y permiten ejecutar un modelo de 31B con calidad razonable usando llama.cpp.
- Asistentes conversacionales autoalojados: al estar etiquetado como "conversational" y disponible en GGUF, puede integrarse en interfaces tipo chat (por ejemplo, a través de Ollama o llama.cpp) para prototipos de atención al cliente o asistentes internos en inglés.
- Experimentación e investigación en cuantización: el repositorio ofrece 11 variantes con distintos tamaños y calidades, lo que facilita estudios comparativos de degradación por cuantización (perplejidad frente a tamaño) sin necesidad de cuantizar uno mismo.
- Inferencia en CPU o entornos sin GPU dedicada: las variantes Q2_K (11,8 GB) y Q3_K_S (13,8 GB) permiten ejecutar el modelo en memoria RAM de sistemas con 16-32 GB, con la consiguiente pérdida de calidad.
- Evaluación de modelos base para ajuste fino: al disponer del modelo original en safetensors y de las cuantizaciones GGUF, un equipo puede evaluar el comportamiento del modelo antes de decidir si invertir en un ajuste fino propio.
- Servicio ligero mediante endpoints compatibles: la etiqueta "endpoints_compatible" permite desplegarlo en infraestructura gestionada de Hugging Face para pruebas de integración sin montar servidor propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de archivo GGUF más overhead de contexto):
  - Q2_K: ~12 GB
  - Q3_K_S: ~14 GB
  - Q3_K_M: ~15,5 GB
  - Q3_K_L: ~16,5 GB
  - IQ4_XS: ~17,5 GB
  - Q4_K_S: ~18 GB
  - Q4_K_M: ~19 GB
  - Q5_K_S: ~22 GB
  - Q5_K_M: ~22,5 GB
  - Q6_K: ~26 GB
  - Q8_0: ~33,5 GB
- GPU recomendadas: para Q4_K_M en su totalidad, una RTX 4090 (24 GB) o A100 40 GB; para Q6_K y Q8_0, A100 40/80 GB o H100. Las variantes Q2_K y Q3_K_S pueden caber en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con contexto reducido.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M y Q4_K_S caben en 24 GB; Q2_K y Q3_K_S en 16 GB; las variantes Q5 y superiores requieren 24 GB o más y pueden necesitar offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), LM Studio, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. No es compatible directamente con vLLM o TGI en formato GGUF sin conversión.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Skyfall-31B-v4 (este) | 31,35 B | no disponible | no disponible | GGUF, safetensors | Cuantizaciones estáticas de mradermacher; solo inglés |
| TheDrummer/Skyfall-31B-v4 | 31,35 B | no disponible | no disponible | safetensors | Modelo base original |
| mradermacher/Skyfall-31B-v4-i1-GGUF | 31,35 B | no disponible | no disponible | GGUF (imatrix) | Variante con cuantización ponderada, mayor calidad por bit |

No se dispone de información sobre modelos comparables de otros autores (por ejemplo, de la familia de 30-34B) en la documentación proporcionada, por lo que no se incluyen comparaciones de rendimiento.

## Limitaciones y advertencias

- La licencia del modelo no está especificada; antes de cualquier uso comercial es imprescindible consultar la licencia del modelo base TheDrummer/Skyfall-31B-v4.
- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- No hay información sobre sesgos, alineación o filtros de seguridad; el modelo podría generar contenido inapropiado sin las salvaguardas de modelos comerciales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de forma notable; la propia model card marca Q3_K_M como "lower quality".
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- El repositorio tiene muy pocas descargas (134) y cero likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- El tamaño del repositorio (214,1 GB) incluye todas las variantes; descargar solo el archivo GGUF deseado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Skyfall-31B-v4-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Skyfall-31B-v4
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Skyfall-31B-v4-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Skyfall-31B-v4-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
