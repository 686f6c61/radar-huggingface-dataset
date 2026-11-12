# Rinstitute/Rina-Juvenile-Exp-2B-GGUF

## Resumen

Rina Juvenile Exp 2B es un modelo de lenguaje de ~1.880 millones de parámetros con pesos ternarios ({−1, 0, +1}) desarrollado por Rinstitute. Se trata de un ajuste fino por entrenamiento continuado sobre Ternary Bonsai 2 2B de Prism ML, que a su vez deriva de Qwen3.5-2B. El objetivo declarado es mejorar el diálogo en chino y japonés respecto al modelo base, manteniendo la huella mínima característica de los modelos ternarios: los ficheros GGUF ocupan entre 429 y 547 MB.

La arquitectura es híbrida, con 18 capas de atención lineal y 6 de atención completa, MLP SwiGLU, RoPE y RMSNorm, sin cambios estructurales respecto a Bonsai 2. La ventana de contexto heredada es de 262K tokens, aunque el entrenamiento se hizo con secuencias de 16K como máximo, por lo que los contextos largos no están validados. El modelo soporta únicamente entrada de texto y no admite el proyector de visión del modelo base.

La relevancia de esta ficha es doble: por un lado, es un ejemplo de ajuste fino sobre pesos ternarios cuantizados, un régimen poco documentado; por otro, evalúa explícitamente el compromiso entre calidad conversacional en lenguas asiáticas y capacidades en inglés. En una evaluación ciega por pares sobre 200 prompts en chino y japonés, un juez LLM prefirió este modelo frente a Bonsai 2 con una tasa de victoria de 0,618 (chino 0,605, japonés 0,630, ambas significativas), a costa de peor seguimiento de instrucciones en inglés (IFEval 81,1 frente a 87,8) y peor tool calling (BFCL v3 49,9 frente a 60,6).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas de atención lineal y 6 de atención completa, MLP SwiGLU, RoPE, RMSNorm, embedding y LM head atados |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens heredados de la arquitectura; entrenamiento con secuencias de hasta 16K tokens; contextos mayores no probados |
| Tipos de cuantizacion | Pesos ternarios {−1, 0, +1} con escalas FP16 por grupo (una por cada 128 pesos); empaquetados como PQ2_0 (~2,20 bits/peso), PTQ1_0 (~1,83 bits/peso) y Q2_0 (~2,33 bits/peso) |
| Idiomas soportados | Chino y japonés (foco), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres empaquetados: PQ2_0, PTQ1_0, Q2_0) |

## Arquitectura y entrenamiento

El modelo mantiene sin cambios la arquitectura de Ternary Bonsai 2: 24 bloques con dimensión oculta 2048, de los cuales 18 usan atención lineal y 6 atención completa, con MLP SwiGLU, normalización RMSNorm y RoPE. Los pesos son ternarios con escalas FP16 por grupo de 128 pesos, almacenados en la base rotada de Hadamard de Bonsai. Los tres empaquetados GGUF contienen exactamente los mismos pesos y escalas y decodifican a valores idénticos bit a bit; solo difieren en el diseño de almacenamiento y la velocidad de los kernels. Respecto a Bonsai 2, el 6,3% de los valores ternarios difieren.

El entrenamiento es un ajuste fino por continuación sobre el modelo base, usando una mezcla de datasets orientada a chino, japonés, matemáticas y código: FineWeb2-HQ, finepdfs-edu, fineweb-2-edu-japanese, fineweb-edu, dclm-edu, finemath, Wikipedia, stackv2_edu_filtered, GSM8K, Hendrycks-MATH, NuminaMath-1.5, OpenMathReasoning, japanese-math-synthetic-108k, TAL-SCQ5K y self-oss-instruct-sc2-exec-filter-50k. No se especifican en la información disponible el número total de tokens, la composición exacta de la mezcla ni si se aplicaron fases de RLHF o DPO. El modelo incorpora modo de razonamiento (`<think>` … `</think>`) activado por defecto y desactivable por petición.

## Capacidades

- Generación de texto conversacional en chino, japonés e inglés, con foco declarado en las dos primeras lenguas.
- Razonamiento explícito mediante modo thinking (`<think>` … `</think>`), activado por defecto y desactivable por petición.
- Razonamiento matemático y resolución de problemas, respaldado por el entrenamiento sobre GSM8K, Hendrycks-MATH, NuminaMath-1.5, OpenMathReasoning y datasets sintéticos de matemáticas en japonés.
- Generación de código, con entrenamiento sobre stackv2_edu_filtered y self-oss-instruct-sc2-exec-filter-50k.
- Tool calling / function calling: soportado pero degradado respecto al modelo base (BFCL v3 de 49,9 frente a 60,6).
- Seguimiento de instrucciones en inglés: funcional pero inferior al modelo base (IFEval de 81,1 frente a 87,8).
- Solo entrada de texto: no admite visión, audio ni el proyector mmproj de Bonsai 2.
- Capacidad multilingüe limitada a zh, ja y en; no se documentan otras lenguas.

## Casos de uso

- Asistentes conversacionales en chino y japonés en dispositivos: el modelo cabe en 429–547 MB y puede ejecutarse en CPU con llama.cpp, lo que permite desplegarlo en portátiles, mini-PC o entornos sin GPU para chat multi-turno en estas lenguas.
- Traducción y adaptación de contenido zh/ja: dado su foco en ambas lenguas y su entrenamiento sobre corpus educativos y Wikipedia, es adecuado para resumir, reformular o adaptar textos entre chino, japonés e inglés en pipelines por lotes.
- Tutoría de matemáticas en japonés y chino: el entrenamiento sobre japanese-math-synthetic-108k, NuminaMath y OpenMathReasoning lo hace apto para explicar pasos de resolución de problemas en estas lenguas, con modo thinking activado.
- Generación de código asistida en entornos con recursos limitados: puede integrarse en editores o scripts locales para autocompletar y explicar fragmentos de código, aceptando la menor fiabilidad de tool calling frente a Bonsai 2.
- Prototipado e investigación sobre pesos ternarios: sirve como banco de pruebas para estudiar el ajuste fino sobre modelos cuantizados a 2 bits, comparar empaquetados PQ2_0, PTQ1_0 y Q2_0 y medir el impacto en latencia y calidad.
- Filtrado y clasificación de texto en chino y japonés: con contexto de hasta 16K tokens validado, puede procesar documentos largos para etiquetado, extracción de entidades o moderación en pipelines de bajo coste.
- Chat de soporte en inglés: viable como fallback, aunque con seguimiento de instrucciones y tool calling inferiores al modelo base, por lo que no se recomienda para flujos de agentes complejos.

## Benchmarks y rendimiento

| Benchmark | Rina Juvenile Exp 2B | Ternary Bonsai 2 2B |
|---|---|---|
| Evaluación ciega por pares zh/ja (tasa de victoria, 200 prompts) | 0,618 | — |
| Evaluación ciega por pares zh (tasa de victoria) | 0,605 | — |
| Evaluación ciega por pares ja (tasa de victoria) | 0,630 | — |
| IFEval (inglés) | 81,1 | 87,8 |
| BFCL v3 (tool calling) | 49,9 | 60,6 |

Rendimiento de inferencia declarado por el autor:

| Empaquetado | Prompt GPU (pp512), tok/s | Generación GPU (tg128), tok/s | CPU, 2.044 tokens de texto |
|---|---:|---:|---:|
| PQ2_0 | 26.300 ± 2.100 | 624 ± 7 | 13 s |
| PTQ1_0 | 27.700 ± 1.700 | 702 ± 5 | 79 s |
| Q2_0 | 26.800 ± 1.700 | 621 ± 3 | 277 s |

Medido en NVIDIA RTX 5090 D con `llama-bench -ngl 99 -p 512 -n 128 -r 10`; en CPU, AMD Ryzen 9 9950X bajo WSL2 con una ejecución cronometrada por fichero sobre cuatro fragmentos de 512 tokens. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en los tres empaquetados (429–547 MB de fichero); el consumo real depende del contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM libre; el autor reporta mediciones en una NVIDIA RTX 5090 D con `-ngl 99`.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante, e incluso integradas con suficiente memoria compartida), dado el tamaño reducido del modelo.
- CPU: viable; en un Ryzen 9 9950X el empaquetado PQ2_0 procesa 2.044 tokens en 13 s, mientras que PTQ1_0 tarda 79 s y Q2_0 tarda 277 s.
- Opciones de despliegue: llama.cpp, concretamente el fork PrismML-Eng/llama.cpp (rama `prism`). El llama.cpp upstream no reconoce los tipos PQ2_0 ni PTQ1_0; según Prism ML, Q2_0 sí podría ejecutarse en versiones recientes de upstream, aunque el autor solo lo ha probado con el fork.
- Throughput estimado: 621–702 tok/s de generación en GPU (RTX 5090 D) y 26.300–27.700 tok/s de procesamiento de prompt; las diferencias de prompt entre empaquetados están dentro del ruido.
- Elección de empaquetado: PQ2_0 es el predeterminado y el más rápido en CPU; PTQ1_0 es el más pequeño y el más rápido en GPU, pero unas 6 veces más lento en CPU; Q2_0 es el más lento en CPU. En CUDA los tres producen salidas idénticas bit a bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Rina Juvenile Exp 2B | ~1,88B | 262K heredados (16K entrenados) | GGUF ternario (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | Foco zh/ja; IFEval 81,1; BFCL v3 49,9 |
| Ternary Bonsai 2 2B (Prism ML) | ~1,88B | 262K | GGUF ternario | No disponible en la información proporcionada | Modelo base; IFEval 87,8; BFCL v3 60,6; soporta visión vía mmproj |
| Qwen3.5-2B (Qwen) | ~2B | No disponible en la información proporcionada | Safetensors y cuantizaciones estándar | No disponible en la información proporcionada | Ancestro arquitectónico de Bonsai 2; no se dispone de sus benchmarks en esta información |

No se dispone de datos de benchmarks de Qwen3.5-2B ni de la licencia exacta de Ternary Bonsai 2 2B en la información proporcionada, por lo que la comparación cuantitativa queda limitada a la pareja Rina Juvenile Exp / Bonsai 2.

## Limitaciones y advertencias

- Es una versión experimental ("Exp"); el propio autor advierte de que la calidad absoluta en chino y japonés sigue siendo limitada.
- Se observan errores gramaticales, mezcla de idiomas en las respuestas y fabricación de hechos (alucinaciones) en las lenguas objetivo.
- El seguimiento de instrucciones en inglés y el tool calling son peores que en Bonsai 2 (IFEval 81,1 frente a 87,8; BFCL v3 49,9 frente a 60,6), lo que desaconseja su uso en flujos de agentes o pipelines que dependan de llamadas a funciones.
- El contexto entrenado es de 16K tokens como máximo; aunque la arquitectura herede 262K, los contextos más largos no están probados y su comportamiento es incierto.
- Solo admite entrada de texto; no es compatible con el proyector de visión (mmproj) de Bonsai 2.
- Requiere el fork PrismML-Eng/llama.cpp (rama `prism`) para los empaquetados PQ2_0 y PTQ1_0; el llama.cpp upstream no los reconoce.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo experimental con alucinaciones documentadas, cualquier despliegue en producción debería incorporar verificación de salidas y filtros de calidad.
- No se documentan en la información disponible sesgos específicos más allá de los derivados de los corpus de entrenamiento (FineWeb, DCLM, Wikipedia, Stack v2), que pueden arrastrar sesgos de dominio y de representación lingüística.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rinstitute/Rina-Juvenile-Exp-2B-GGUF
- Modelo base (Ternary Bonsai 2 2B, Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Modelo del que deriva el base (Qwen3.5-2B): https://huggingface.co/Qwen/Qwen3.5-2B
- Fork de llama.cpp requerido (rama `prism`): https://github.com/PrismML-Eng/llama.cpp
