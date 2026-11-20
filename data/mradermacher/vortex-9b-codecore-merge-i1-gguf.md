# mradermacher/Vortex-9B-CodeCore-Merge-i1-GGUF

## Resumen

Vortex-9B-CodeCore-Merge-i1-GGUF es la versión cuantizada en formato GGUF del modelo Vortex-9B-CodeCore-Merge, un merge de modelos de la familia Qwen3.5-9B orientado a generación de código, razonamiento con cadena de pensamiento, agentes y uso de herramientas (tool calling / function calling). El trabajo de cuantización lo firma mradermacher, autor habitual de cuantizaciones GGUF de alta calidad con calibración imatrix, mientras que el modelo base lo desarrolla prithivMLmods mediante la herramienta OmniMergeKit.

El modelo parte de una arquitectura transformer densa de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones), derivada de Qwen3.5-9B, con licencia Apache 2.0 y soporte declarado únicamente para inglés. Su relevancia actual radica en que combina en un tamaño contenido (apto para GPU de consumo en cuantizaciones Q4) capacidades de razonamiento explícito, generación de código y orquestación de agentes, facetas que hasta hace poco requerían modelos considerablemente mayores.

El repositorio incluye un conjunto amplio de cuantizaciones dinámicas (i1) calibradas con imatrix, desde Q2_K hasta Q6_K, además de un fichero imatrix para que terceros puedan generar sus propias cuantizaciones. El tamaño total del repositorio es de 81,3 GB, lo que refleja la suma de todas las variantes publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su ascendencia Qwen3.5-9B y su naturaleza de transformer denso. El modelo base se ha construido mediante OmniMergeKit, una herramienta de fusión de modelos (model merging), y las etiquetas del repositorio indican que incorpora componentes de SFT (supervised fine-tuning) orientados a razonamiento con cadena de pensamiento, uso de herramientas y tareas de agente y código. No se especifican en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La aportación técnica de esta ficha concreta es la cuantización con calibración imatrix (denominada i1 por mradermacher), que ajusta los factores de cuantización a partir de las activaciones observadas en un corpus de calibración, mejorando la fidelidad respecto a cuantizaciones estáticas del mismo tamaño. El autor indica que las variantes IQ suelen superar a las Q de tamaño equivalente: por ejemplo, IQ3_S se considera preferible a Q3_K_S y IQ3_M a Q3_K_M. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento explícita (chain-of-thought), según las etiquetas del modelo.
- Generación y asistencia de código (etiqueta "coder"), con el modelo base orientado a tareas CodeCore.
- Tool calling y function calling, lo que permite invocar APIs y funciones externas desde el propio modelo.
- Soporte de flujos de agente y razonamiento multi-paso (etiqueta "agent").
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible") y con text-generation-inference.
- Capacidad multilingüe limitada: el único idioma declarado es el inglés. No se documentan capacidades de visión, audio ni modalidades adicionales.

## Casos de uso

- Asistencia de programación en local: con cuantizaciones Q4 (5,6-5,9 GB) el modelo puede ejecutarse en una GPU de consumo y ofrecer autocompletado, explicación y refactorización de código sin enviar el código a servicios externos.
- Agentes de automatización de repositorios: gracias al soporte de tool calling, puede integrarse en pipelines que invoquen herramientas de CI/CD, consulten el estado de un build o generen parches a partir de una descripción.
- Razonamiento paso a paso en tareas de depuración: el modo de cadena de pensamiento permite trazar la causa raíz de un fallo a partir de trazas y fragmentos de código.
- Prototipado de asistentes conversacionales técnicos en inglés: su naturaleza conversacional y su tamaño moderado permiten desplegar un chatbot de soporte para desarrolladores en una sola GPU.
- Generación de documentación técnica: puede redactar docstrings, README y comentarios a partir del código fuente, con la ventaja de que la cuantización Q5_K_M (6,7 GB) mantiene buena calidad en una RTX 4090 o similar.
- Evaluación y experimentación en investigación: el fichero imatrix y la disponibilidad de cuantizaciones desde Q2_K hasta Q6_K permiten estudiar la degradación de calidad por nivel de compresión en un modelo de 9B con capacidades de razonamiento.
- Despliegue en entornos con VRAM limitada: las variantes Q2_K (4,0 GB) e IQ3 (4,6 GB) permiten ejecutar el modelo en GPU de 6-8 GB, útil para pruebas y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB con i1-Q2_K (4,0 GB de pesos), 5-6 GB con i1-IQ3_S o i1-Q3_K_M (4,6-4,8 GB), 6-7 GB con i1-Q4_K_M (5,9 GB) y 8-9 GB con i1-Q6_K (7,7 GB), añadiendo margen para el contexto KV.
- GPU recomendadas: RTX 4090, RTX 4080, RTX 3090 o superiores para las cuantizaciones Q5/Q6 con contexto amplio; A100 o H100 para despliegues concurrentes con vLLM o TGI.
- Cabe en GPU de consumo: sí. Las variantes Q2_K e IQ3 caben en GPU de 8 GB; Q4_K_M en GPU de 8-12 GB; Q5/Q6 en GPU de 12-16 GB o más.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para GGUF; vLLM y text-generation-inference para el modelo base en safetensors; el repositorio declara compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vortex-9B-CodeCore-Merge-i1-GGUF | ~9,2 B | No disponible | Apache 2.0 | GGUF (i1) | Razonamiento, código, tool calling, solo inglés |
| Modelo base Vortex-9B-CodeCore-Merge | ~9,2 B | No disponible | Apache 2.0 | Safetensors | Mismo modelo sin cuantizar; requiere más VRAM |
| Versión estática Vortex-9B-CodeCore-Merge-GGUF | ~9,2 B | No disponible | Apache 2.0 | GGUF estático | Cuantizaciones sin calibración imatrix, menor calidad a igual tamaño |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con otras familias de modelos de 9B.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Alucinación: como todo modelo generativo, puede producir código, APIs o hechos inexistentes; requiere validación en producción, especialmente en tool calling.
- Origen por merge: al ser una fusión de modelos, sus capacidades pueden ser desiguales y menos predecibles que las de un modelo entrenado de forma monolítica; conviene evaluarlo en la tarea concreta antes de adoptarlo.
- Contexto: no se documenta la longitud de ventana, por lo que no debe asumirse un contexto largo sin verificarlo empíricamente.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificar las obligaciones heredadas del modelo base Qwen3.5-9B.
- Cuantización: las variantes de menor tamaño (Q2_K, IQ3) degradan la calidad; para producción se recomienda Q4_K_M o superior. El autor advierte que Q4_0 es rápida pero de baja calidad.
- Fecha de creación futura en los metadatos (2026): conviene tratar las fechas del repositorio con cautela y verificar la versión efectiva de los pesos antes de desplegar.

## Enlaces

- Repositorio Hugging Face (GGUF i1): https://huggingface.co/mradermacher/Vortex-9B-CodeCore-Merge-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Vortex-9B-CodeCore-Merge
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Vortex-9B-CodeCore-Merge-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Vortex-9B-CodeCore-Merge-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
