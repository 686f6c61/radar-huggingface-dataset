# mradermacher/Caspian-R1-GGUF

## Resumen

Caspian-R1-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo Willie999/Caspian-R1, publicado por el usuario mradermacher. No es un modelo entrenado desde cero, sino una conversión a GGUF del checkpoint original, pensada para ejecución local con llama.cpp, Ollama o LM Studio sin necesidad de GPU dedicada.

El modelo subyacente tiene 354.483.968 parámetros (unos 354 millones), según los pesos safetensors del repositorio base. La model card del autor identifica el modelo como "Caspian-LFM2.5-350M-Reasoning" y lo etiqueta como un ajuste supervisado (SFT) generado con TRL, lo que apunta a un modelo pequeño orientado a conversación y razonamiento en inglés.

Su relevancia práctica es la de un modelo de bolsillo: con cuantizaciones de entre 0,3 y 0,8 GB cabe en cualquier equipo, incluidos portátiles sin GPU dedicada o placas tipo Raspberry Pi. Resulta útil como banco de pruebas para pipelines de agentes, clasificación o razonamiento ligero donde no es viable desplegar un modelo de 7B o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card indica el nombre "Caspian-LFM2.5-350M-Reasoning", sin detalles de arquitectura publicados) |
| Parámetros totales | 354.483.968 (aproximadamente 354 M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repositorio); safetensors en el repositorio base Willie999/Caspian-R1 |
| Modelo base | Willie999/Caspian-R1 |
| Tamaño del repositorio | 3,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-01 |

## Arquitectura y entrenamiento

No se publican detalles de arquitectura en la información disponible. La model card únicamente declara que el modelo deriva de Willie999/Caspian-R1 y que fue generado mediante SFT con la librería TRL (etiquetas `generated_from_trainer`, `sft`, `trl`). No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas posteriores de RLHF o DPO. El nombre interno "Caspian-LFM2.5-350M-Reasoning" sugiere una base de la familia LFM2.5 de 350 M de parámetros, pero esto no se confirma en la documentación y debe tratarse como indicio, no como dato verificado.

La aportación de este repositorio es exclusivamente de cuantización: mradermacher ha generado cuantizaciones estáticas (no ponderadas por imatrix) en 12 variantes que van de Q2_K (0,3 GB) a f16 (0,8 GB). La model card indica explícitamente que no hay cuantizaciones ponderadas disponibles por el momento, y que las estáticas se han producido con `quantize_version: 2` y `output_tensor_quantised: 1`.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno (etiqueta `conversational`).
- Razonamiento de tipo cadena de pensamiento, inferido del sufijo "R1" y del nombre "Reasoning" en la model card; no se documenta el formato exacto del modo de pensamiento.
- Ajuste supervisado sobre una base preentrenada, orientado a seguir instrucciones.
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible`), lo que permite servirlo tras APIs compatibles.
- Ejecución local en CPU y GPU mediante el ecosistema GGUF.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multimodales.
- Capacidad multilingüe: no, únicamente inglés según la etiqueta de idioma.

## Casos de uso

- Asistentes conversacionales offline: el modelo puede gestionar diálogos multi-turno en inglés ejecutándose íntegramente en local, sin conexión a internet ni coste de API, con un consumo de memoria inferior a 1 GB.
- Prototipado rápido de pipelines de IA generativa: al pesar 0,3 GB en Q4_K_S, permite validar prompts, plantillas de chat y flujos de integración antes de escalar a modelos mayores.
- Clasificación y etiquetado de texto ligero: tareas de categorización de tickets, moderación básica o enrutado de consultas donde la latencia importa más que la profundidad de razonamiento.
- Extracción de información estructurada: generación de campos concretos (nombres, fechas, importes) a partir de texto corto en inglés, con salida en JSON mediante prompting.
- Despliegue en dispositivos edge: su tamaño permite ejecutarlo en mini-PC, Raspberry Pi 5 o móviles de gama alta vía llama.cpp, para asistentes embebidos o kioscos interactivos.
- Investigación y docencia: útil para estudiar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) sobre la perplejidad y la calidad de salida en un modelo pequeño y manejable.
- Generación de datos sintéticos auxiliares: producción de paráfrasis, resúmenes cortos o ejemplos de entrenamiento en inglés a bajo coste computacional.
- Pruebas de integración de servidores compatibles con OpenAI (Ollama, llama.cpp server, LM Studio) antes de mover cargas a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y el repositorio cuenta con 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de la comunidad. No es posible comparar el rendimiento con otros modelos sin datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q2_K y Q3_K en torno a 0,3 GB; IQ4_XS y Q4_K en torno a 0,3 GB; Q5_K en torno a 0,4 GB; Q6_K en torno a 0,4 GB; Q8_0 en torno a 0,5 GB; f16 en torno a 0,8 GB.
- Memoria total en ejecución: hay que sumar la caché KV y el overhead del runtime; en la práctica, entre 0,6 y 1,2 GB según cuantización y longitud de contexto.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo está muy por debajo de la capacidad de cualquier acelerador moderno.
- Cabe en GPU de consumo: sí, en prácticamente todas, incluidas iGPU integradas con memoria compartida.
- Cabe en CPU: sí, con buen rendimiento en CPU de escritorio y aceptable en ARM de gama media.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` indica compatibilidad con APIs tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un modelo de 354 M en cuantización Q4, es razonable esperar decenas de tokens por segundo en CPU moderna y varios cientos en GPU de consumo, pero son estimaciones orientativas, no medidas publicadas.

## Comparativa con modelos similares

No hay datos de benchmarks del modelo, por lo que la comparación se limita a especificaciones estructurales. Los datos de los modelos alternativos provienen de su documentación pública.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| Caspian-R1-GGUF | 354 M | no disponible | no disponible | Sí (12 cuantizaciones) |
| Qwen2.5-0.5B | ~494 M | 32 768 tokens | Apache-2.0 | Sí, vía terceros |
| SmolLM2-360M | ~362 M | 8 192 tokens | Apache-2.0 | Sí, vía terceros |
| Llama-3.2-1B | ~1 240 M | 128 000 tokens | Llama 3.2 Community License | Sí, vía terceros |

La ventaja competitiva de Caspian-R1-GGUF sería su tamaño reducido y su naturaleza de modelo de razonamiento, pero sin licencia publicada ni benchmarks no puede recomendarse sobre alternativas con licencia clara y contexto documentado.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Tratarlo como no apto para producción comercial hasta verificar la licencia del modelo base Willie999/Caspian-R1.
- Idiomas: únicamente inglés. No hay soporte documentado de castellano ni de otras lenguas.
- Longitud de contexto desconocida: no se puede dimensionar la caché KV ni planificar tareas de contexto largo.
- Riesgo elevado de alucinación: con 354 M de parámetros, la fidelidad factual y la coherencia en razonamientos largos son limitadas en comparación con modelos de 7B o superiores.
- Ausencia total de benchmarks: no hay evidencia publicada de su calidad en MMLU, razonamiento matemático o generación de código.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Cuantización de terceros: las conversiones las realiza mradermacher, no el autor original; las cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- Cuantizaciones estáticas: no hay variantes ponderadas por imatrix, que suelen ofrecer mejor relación calidad/tamaño en cuantizaciones bajas.
- Nombre y metadatos ambiguos: la model card mezcla el nombre del repositorio (Caspian-R1) con un `model_name` distinto (Caspian-LFM2.5-350M-Reasoning), lo que dificulta la trazabilidad del linaje del modelo.
- Sin soporte documentado de tool calling ni de agentes: no debe asumirse que funcione en pipelines que requieran llamadas a funciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Caspian-R1-GGUF
- Modelo base: https://huggingface.co/Willie999/Caspian-R1
- Página de modelos del cuantizador: https://huggingface.co/mradermacher/models
- Página de resumen y descargas del modelo: https://hf.tst.eu/model#Caspian-R1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable del hosting de cuantizaciones: https://www.nethype.de/
