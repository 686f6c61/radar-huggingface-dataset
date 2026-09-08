# PoSTMEDIA/Rosetta-7B-Think

## Resumen

Rosetta-7B-Think es un modelo de razonamiento bilingüe coreano-inglés de 7.800 millones de parámetros desarrollado por PoSTMEDIA. Se construye sobre la arquitectura Rosetta, un Transformer dense decoder-only, y parte del modelo base Rosetta-7B-Base mediante un entrenamiento de ajuste supervisado (SFT) a gran escala sobre trazas de razonamiento de formato largo. El modelo genera una cadena de pensamiento explícita encerrada entre las etiquetas `<think>` y `</think>` antes de emitir su respuesta final.

Su principal diferencial es la optimización para razonar en coreano y sobre contenido coreano, un área donde los modelos compactos suelen mostrar carencias. Según los datos publicados por el autor, supera a Qwen3-8B en razonamiento matemático en coreano (HRM8K) y en comprensión lectora coreana (HAE-RAE) bajo un protocolo de evaluación idéntico. Además, presenta una ventana de contexto de 65.536 tokens y una licencia Apache-2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rosetta dense decoder-only Transformer (`RosettaForCausalLM`) |
| Parametros totales | 7.798.927.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko), Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (15.6 GB) |

## Arquitectura y entrenamiento

Rosetta-7B-Think emplea una arquitectura Transformer dense decoder-only con 32 capas, un tamaño de ocultación de 4.096 y 32 cabezas de atención. Su patrón de atención es híbrido: combina ventanas deslizantes de 4.096 tokens con atención global en una proporción de 3:1, e incorpora normalización QK. El vocabulario se amplió a 161.425 entradas, con una extensión específica para el coreano.

El proceso de entrenamiento se divide en cuatro fases: pretraining sobre billones de tokens de textos web, código y contenido académico bilingüe; mid-training escalonado para densificar datos de razonamiento y extender el contexto hasta 65K; continuidad de pretraining en coreano con corpus curados y datos sintéticos propios; y un post-training de razonamiento mediante SFT a gran escala sobre trazas de razonamiento de formato largo en matemáticas, código, ciencia y tareas en coreano. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generacion de razonamiento explicito: produce trazas de pensamiento estructuradas entre `<think>` y `</think>` antes de la respuesta final.
- Razonamiento matematico en coreano: alcanza 64.3 en HRM8K, superando a Qwen3-8B en el protocolo del autor.
- Comprension lectora en coreano: 62.7 en HAE-RAE, por encima de Qwen3-8B.
- Matematicas competitivas: AIME 2024 con 36.7 y AIME 2025 con 33.3.
- Matematicas de nivel escolar: GSM8K con 83.5, con razonamiento paso a paso trazable.
- Soporte de tool calling / function calling: No documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: No documentado explicitamente.
- Capacidades multilingues: Coreano e ingles, con enfasis en el coreano.
- Ventana de contexto larga de 65.536 tokens para trazas de razonamiento extensas.

## Casos de uso

- Plataformas educativas coreanas: el modelo puede desglosar problemas de matematicas paso a paso en coreano, generando explicaciones trazables que ayudan a estudiantes a comprender el proceso, no solo el resultado.
- Asistentes de IA bilingues coreano-ingles: gracias a su vocabulario ampliado y su entrenamiento en ambos idiomas, puede mantener conversaciones y resolver consultas tecnicas alternando entre coreano e ingles sin perdida de precision.
- Analisis de documentos academicos coreanos: con su ventana de contexto de 65.536 tokens, puede procesar articulos cientificos extensos, resumir contenidos y extraer conclusiones con razonamiento explicito.
- Generacion de codigo con razonamiento: aunque el enfoque principal es matematico, el entrenamiento incluye datos de codigo, lo que permite generar fragmentos de codigo acompanados de una explicacion de la logica subyacente.
- Herramientas de analisis de datos para empresas coreanas: el modelo puede interpretar resultados numericos, detectar patrones y justificar inferencias con trazas de razonamiento claras, util para paneles de control y reportes automaticos.
- Tutores virtuales de ciencias: puede resolver problemas de fisica, quimica o biologia con razonamiento secuencial, ofreciendo una explicacion detallada de cada ecuacion o concepto aplicado.
- Sistemas de preguntas y respuestas sobre legislacion o normativa coreana: al comprender texto legal en coreano, puede extraer clausulas relevantes y razonar sobre su aplicacion en escenarios concretos.

## Benchmarks y rendimiento

Los resultados siguientes fueron re-evaluados por el autor bajo un protocolo identico (lm-evaluation-harness + vLLM). Los modelos de razonamiento se muestrearon con temperatura 0.6, top-p 0.95 y un presupuesto de generacion de 32.768 tokens para matematicas competitivas.

| Benchmark | Rosetta-7B-Think (7B) | Qwen3-8B (8B) | DeepSeek-R1-0528 (8B) | HyperCLOVAX-Think (14B) |
|---|---|---|---|---|
| MMLU (0-shot CoT) | 67.1 | 79.5 | 80.4 | 77.7 |
| GSM8K | 83.5 | 90.1 | 88.2 | 79.2 |
| AIME 2024 | 36.7 | 70.0 | 66.7 | 46.7 |
| AIME 2025 | 33.3 | 66.7 | 70.0 | 43.3 |
| HRM8K (razonamiento matematico coreano) | 64.3 | No disponible | No disponible | No disponible |
| HAE-RAE (comprension coreana) | 62.7 | No disponible | No disponible | No disponible |

En los benchmarks de razonamiento matematico en ingles, Rosetta-7B-Think se encuentra por debajo de Qwen3-8B y DeepSeek-R1-0528 en AIME y MMLU, pero destaca sobre el modelo de 14B HyperCLOVAX-Think en GSM8K. Su ventaja competitiva se concentra en tareas coreanas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15.6 GB en FP16 para los pesos completos, mas la memoria de la cache KV que crece con la longitud del contexto. Con cuantizacion de 4 bits no especificada, podria reducirse a unos 5 GB.
- GPU recomendadas: para FP16 en contexto largo, una RTX 4090 de 24 GB es suficiente. Para despliegues con multiples peticiones o trazas de razonamiento muy extensas, se recomienda A100 40/80 GB o H100.
- Compatibilidad con GPU de consumo: si, en una RTX 4090 o superior. Para GPU de 16 GB seria necesario cuantizar.
- Opciones de despliegue: vLLM (soporte indicado por el autor en su repositorio) y Transformers. No se documenta soporte oficial para llama.cpp u Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rosetta-7B-Think | 7.8B | 65.536 | Razonamiento bilingue ko/en | Apache-2.0 | HuggingFace |
| Qwen3-8B | 8B | No disponible | Razonamiento multilingue | No disponible | HuggingFace |
| DeepSeek-R1-0528 | 8B | No disponible | Razonamiento en ingles | No disponible | HuggingFace |
| HyperCLOVAX-Think | 14B | No disponible | Razonamiento coreano | No disponible | No disponible |

La comparativa se basa en los datos de benchmarks publicados por el autor. La informacion sobre contexto, licencia y disponibilidad de los modelos competidores no se incluye en los datos proporcionados, por lo que se indica como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo donde la traza de pensamiento no garantiza la correccion.
- Limitaciones de idioma: el modelo esta optimizado para coreano e ingles. Su rendimiento en otros idiomas no esta evaluado y probablemente sea inferior.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificacion y redistribucion sin restricciones significativas.
- Limitacion de generacion competitiva: el autor especifica un presupuesto de 32.768 tokens para matematicas competitivas, lo que limita la duracion de trazas de razonamiento en esos escenarios.
- Tool calling: no se documenta soporte para function calling, lo que limita su integracion en pipelines que requieran invocacion de herramientas externas.
- Fiabilidad en produccion: los benchmarks fueron re-evaluados internamente por el autor; no se aportan evaluaciones externas independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Think
- Coleccion Rosetta: https://huggingface.co/collections/PoSTMEDIA/rosetta-6a9db30fd1b4585b0c1845e9
- Repositorio vLLM de PoSTMEDIA: https://github.com/PoSTMEDIA-AI/vllm
- Modelo base Rosetta-7B-Base: https://huggingface.co/PoSTMEDIA/Rosetta-7B-Base
