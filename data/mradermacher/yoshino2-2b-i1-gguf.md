# mradermacher/Yoshino2-2B-i1-GGUF

## Resumen

Yoshino2-2B-i1-GGUF es una colección de cuantizaciones GGUF del modelo base en5yme/Yoshino2-2B, un transformer denso de aproximadamente 1.942 millones de parámetros (1,94 B) orientado a razonamiento y destilado a partir de Nemotron-3.5-Lightning-30B-A3B. Las cuantizaciones las publica mradermacher, un autor habitual en el ecosistema GGUF que genera versiones estáticas e imatrix de modelos populares para su uso con llama.cpp y derivados. El repositorio incluye cuantizaciones con y sin imatrix, desde i1-Q2_K (1,1 GB) hasta i1-Q6_K (1,7 GB), además del fichero imatrix para generar cuantizaciones propias.

El interés de esta ficha reside en que permite ejecutar un modelo de razonamiento de menos de 2 B de parámetros en hardware de consumo, con un rango de cuantizaciones que cubre desde entornos con muy poca memoria hasta configuraciones donde prima la calidad. El modelo base declara licencia MIT, lo que facilita su uso comercial, y está etiquetado como modelo de visión, con ficheros mmproj disponibles en el repositorio estático del mismo autor. No obstante, la información pública sobre el modelo base es escasa: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

La ficha se centra en lo que se puede afirmar con la información disponible: especificaciones de las cuantizaciones, arquitectura inferida del modelo base, capacidades declaradas mediante etiquetas y requisitos de hardware estimados a partir de los tamaños de fichero. Cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (inferido del modelo base; no se detalla en la información disponible) |
| Parametros totales | 1.942.653.248 (1,94 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de fichero imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamano del repo | 18,6 GB (incluye todas las cuantizaciones y el fichero imatrix) |
| Rango de tamano de las cuantizaciones | 1,1 GB (i1-Q2_K) a 1,7 GB (i1-Q6_K) |
| Modelo base | en5yme/Yoshino2-2B |
| Dataset de destilación | en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill |
| Vision | Sí (etiquetado como modelo de visión; mmproj en el repo estático) |

## Arquitectura y entrenamiento

El modelo base Yoshino2-2B es un transformer denso de 1,94 B de parámetros. Según las etiquetas del repositorio, se ha entrenado mediante destilación a partir de Nemotron-3.5-Lightning-30B-A3B, un modelo MoE de 30 B con 3 B de parámetros activos, y está orientado a tareas de razonamiento. El dataset de destilación se identifica como en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill, aunque no se especifican el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO.

Las cuantizaciones de mradermacher se generan con llama.cpp y siguen su flujo habitual: conversión desde el formato Hugging Face (convert_type: hf) y cuantización con y sin imatrix (quantize_version: 2, output_tensor_quantised: 1). El fichero imatrix incluido permite reproducir o generar cuantizaciones adicionales con la misma matriz de importancia. No se dispone de información sobre innovaciones arquitectónicas específicas (atención lineal, decodificación especulativa, etc.) más allá de lo indicado.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta explícita de "conversational".
- Razonamiento: el modelo está etiquetado como "reasoning" y destilado de un modelo de razonamiento de mayor tamaño.
- Capacidades de visión: el repositorio se describe como modelo de visión y los ficheros mmproj están en el repositorio estático del mismo autor.
- Destilación de conocimiento: entrenado para reproducir el comportamiento de Nemotron-3.5-Lightning-30B-A3B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque la etiqueta "reasoning" sugiere cierta capacidad en esta dirección.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional ligero en local: con cuantizaciones de 1,1 a 1,7 GB, el modelo puede ejecutarse en portátiles y equipos de sobremesa sin GPU dedicada, gestionando conversaciones multi-turno en inglés con un consumo de memoria muy reducido.
- Razonamiento en dispositivos de borde: su tamaño permite desplegarlo en Raspberry Pi 5, mini-PC o dispositivos con 4-8 GB de RAM, útil para tareas de clasificación, resumen o respuesta a preguntas sin conexión.
- Prototipado rápido de pipelines de razonamiento: al ser un modelo destilado de un MoE de 30 B, sirve para validar flujos de razonamiento y prompts antes de escalar a modelos mayores, con un coste computacional mínimo.
- Aplicaciones de visión en local (si se usa el mmproj del repo estático): descripción de imágenes, respuesta a preguntas visuales o extracción de información de capturas, siempre que se valide la calidad real del modelo base.
- Filtrado y preprocesado de datos: generación de etiquetas, resúmenes o reformulaciones en inglés dentro de pipelines ETL, donde la latencia baja y el reducido footprint son prioritarios frente a la calidad máxima.
- Educación y experimentación: entorno ideal para estudiar técnicas de destilación y cuantización, comparando el comportamiento del modelo en distintas cuantizaciones (Q2 a Q6) con la matriz imatrix incluida.
- Integración en aplicaciones de escritorio: mediante llama.cpp u Ollama, se puede embeber en herramientas de escritorio que requieran un asistente local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el contexto. Las cuantizaciones van de 1,1 GB (i1-Q2_K) a 1,7 GB (i1-Q6_K); con contexto moderado, un presupuesto de 2-4 GB de RAM/VRAM es suficiente.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). En GPUs de gama alta (RTX 4090, A100, H100) el modelo queda sobredimensionado en cuanto a memoria, aunque puede aprovecharse para lotes grandes o baja latencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales, e incluso en iGPU y CPUs modernas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para visión, se requiere el mmproj del repositorio estático.
- Latencia y throughput estimados: no disponibles. Por el tamaño (1,94 B) se espera una latencia muy baja en CPU y prácticamente interactiva en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2-2B-i1-GGUF | 1,94 B | No disponible | MIT | GGUF | Destilado de Nemotron-3.5-Lightning-30B-A3B; visión |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,54 B | 32 K (modelo base) | Apache 2.0 | GGUF | Alternativa consolidada en inglés y multilingüe |
| Llama-3.2-1B-Instruct (GGUF) | 1,24 B | 128 K (modelo base) | Llama 3.2 Community | GGUF | Ecosistema amplio y buen soporte de herramientas |
| SmolLM2-1.7B-Instruct (GGUF) | 1,71 B | 8 K (modelo base) | Apache 2.0 | GGUF | Enfocado a eficiencia en dispositivo |

La comparación con estos modelos es orientativa: no se dispone de benchmarks del modelo Yoshino2-2B que permitan una comparación cuantitativa rigurosa. La ventaja principal del modelo es su licencia MIT y su origen destilado de un MoE de razonamiento; la desventaja es la falta de documentación pública sobre contexto, entrenamiento y evaluación.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: se desconoce la longitud máxima de contexto del modelo base, lo que impide planificar aplicaciones con ventanas largas.
- Alucinación: al ser un modelo pequeño destilado, es esperable una mayor tasa de alucinación que su modelo profesor; no hay evaluación publicada que lo cuantifique.
- Sesgos: no se documentan sesgos conocidos ni procesos de alineación (RLHF/DPO) en la información disponible.
- Visión: aunque se etiqueta como modelo de visión, los ficheros mmproj están en el repositorio estático y no se detalla la calidad ni el alcance de las capacidades visuales.
- Licencia: MIT permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base y del dataset de destilación por si impusieran restricciones adicionales.
- Producción: la falta de benchmarks y de documentación sobre contexto y entrenamiento desaconseja su uso en producción sin una evaluación previa específica del caso de uso.
- Cuantizaciones de baja precisión: las versiones Q2 y Q3 degradan la calidad de forma notable; para uso serio se recomienda i1-Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Yoshino2-2B-i1-GGUF
- Modelo base: https://huggingface.co/en5yme/Yoshino2-2B
- Dataset de destilación: https://huggingface.co/datasets/en5yme/Nemotron-3.5-Lightning-30B-A3B-Distill
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Yoshino2-2B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Yoshino2-2B-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
