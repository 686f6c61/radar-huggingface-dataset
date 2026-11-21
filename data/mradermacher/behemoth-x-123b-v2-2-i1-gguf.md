# mradermacher/Behemoth-X-123B-v2.2-i1-GGUF

## Resumen

Behemoth-X-123B-v2.2-i1-GGUF es una colección de cuantizaciones GGUF del modelo TheDrummer/Behemoth-X-123B-v2.2, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de gran tamano con 122.610.069.504 parámetros totales (aproximadamente 123B), orientado a generación de texto conversacional en inglés y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha reside en que agrupa cuantizaciones con imatrix (importancia matricial), lo que permite reducir el modelo a rangos de entre 26 GB y 100 GB manteniendo una calidad razonable para cada nivel de compresión. Esto hace posible ejecutar un modelo de 123B en hardware que va desde configuraciones de gama alta de consumo hasta servidores multi-GPU, algo inviable con los pesos originales en precisión completa.

No se dispone de información sobre la arquitectura interna, el contexto máximo ni los datos de entrenamiento del modelo base en la documentación proporcionada. La model card del cuantizador se limita a listar los ficheros GGUF y a remitir a la página del modelo base para más detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 122.610.069.504 (aprox. 123B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-Q2_K_S, i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (multi-parte) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con fichero imatrix separado para crear cuantizaciones propias) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base TheDrummer/Behemoth-X-123B-v2.2 en la documentación disponible. El recuento de parámetros (122.610.069.504) corresponde a los safetensors del modelo original, pero no se detalla si emplea un transformer denso, una mezcla de expertos (MoE) u otra variante. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución técnica de este repositorio es la cuantización con imatrix (importancia matricial), una técnica que pondera la importancia de cada matriz de pesos durante la calibración para preservar mejor la calidad en compresiones agresivas. El autor indica que las cuantizaciones IQ suelen superar a las no-IQ de tamano similar, y que i1-Q4_K_M es la opción recomendada por equilibrio entre velocidad y calidad, mientras que i1-Q6_K se ofrece dividido en tres partes.

## Capacidades

- Generación de texto conversacional en inglés, segun la etiqueta `conversational` del repositorio.
- Compatible con `transformers` y con el ecosistema GGUF (llama.cpp y derivados).
- El repositorio incluye un fichero imatrix para que el usuario pueda generar sus propias cuantizaciones.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés segun la etiqueta de idioma.
- Capacidades especiales (visión, audio, modo thinking): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de 123B en estaciones de trabajo con múltiples GPU: usando la cuantización i1-Q4_K_M (73,3 GB) es posible ejecutar el modelo en configuraciones de 4×RTX 4090 o 2×A100 80GB, aprovechando el formato GGUF con llama.cpp.
- Generación de texto conversacional en inglés: el modelo está etiquetado como conversacional, por lo que encaja en asistentes de chat y sistemas de respuesta en inglés donde se requiera un modelo grande.
- Experimentación e investigación con cuantizaciones extremas: las variantes IQ1 e IQ2 (26-45 GB) permiten estudiar el comportamiento de un modelo de 123B bajo compresión agresiva en hardware de consumo.
- Creación de cuantizaciones personalizadas: el fichero imatrix incluido permite generar variantes propias con llama.cpp para ajustar el equilibrio tamano/calidad a un caso concreto.
- Servicios de inferencia autoalojados: al ser GGUF, puede servirse mediante llama.cpp server o herramientas compatibles con endpoints, segun la etiqueta `endpoints_compatible`.
- Evaluación comparativa de calidad entre niveles de cuantización: el repositorio ofrece 23 variantes, lo que facilita medir la degradación de perplejidad y calidad a medida que baja el bitrate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, mas overhead de contexto):
  - i1-IQ1_S: ~26 GB
  - i1-IQ2_M: ~42 GB
  - i1-IQ3_M: ~55 GB
  - i1-Q4_K_M: ~73 GB
  - i1-Q5_K_M: ~87 GB
  - i1-Q6_K: ~101 GB (dividido en tres partes)
- GPU recomendadas: A100 80GB, H100 80GB, configuraciones multi-GPU (2×A100 80GB para Q4_K_M, 4×RTX 4090 24GB para Q4_K_M con reparto por capas).
- Cabe en GPU de consumo: solo las cuantizaciones IQ1 e IQ2 caben en una RTX 4090 (24 GB) de forma ajustada; IQ2_M (41,7 GB) requiere al menos dos GPU de 24 GB. Las cuantizaciones Q4 en adelante no caben en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), llama.cpp server y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tamano.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Behemoth-X-123B-v2.2-i1-GGUF | ~123B | no disponible | GGUF | no disponible | Cuantizaciones imatrix de 26 a 101 GB |
| Behemoth-X-123B-v2.2 (base) | ~123B | no disponible | safetensors | no disponible | Pesos originales, repo de 1,3 TB |
| Behemoth-X-123B-v2.2-GGUF (estatico) | ~123B | no disponible | GGUF | no disponible | Cuantizaciones estaticas del mismo autor |
| Alternativas de ~120B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No se dispone de información sobre sesgos, alineación o datos de entrenamiento del modelo base, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- La licencia no está indicada en el repositorio; antes de un uso comercial debe verificarse la licencia del modelo base TheDrummer/Behemoth-X-123B-v2.2.
- Las cuantizaciones IQ1 e IQ2 conllevan degradación de calidad significativa; el autor las describe como "for the desperate" y "mostly desperate".
- El repositorio ocupa 1.297,3 GB, por lo que la descarga y el almacenamiento requieren planificación.
- El contexto máximo no está documentado; no debe asumirse una ventana larga sin verificar el modelo base.
- La fecha de creación del repositorio (2026-10-09) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia de los enlaces.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Behemoth-X-123B-v2.2-i1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Behemoth-X-123B-v2.2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Behemoth-X-123B-v2.2-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Behemoth-X-123B-v2.2-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafo comparativo de perplejidad: https://www.nethype.de/huggingface_embed/quantpplgraph.png
