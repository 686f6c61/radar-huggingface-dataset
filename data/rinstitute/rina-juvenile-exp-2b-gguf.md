# Rinstitute/Rina-Juvenile-Exp-2B-GGUF

## Resumen

Rina Juvenile Exp 2B es un modelo de lenguaje de ~1.880 millones de parámetros con pesos ternarios ({−1, 0, +1}) desarrollado por Rinstitute como un ajuste fino del modelo Ternary Bonsai 2 2B de Prism ML, que a su vez deriva de Qwen3.5-2B. Su objetivo es mejorar el diálogo conversacional en chino y japonés manteniendo el tamaño ultrarreducido del modelo base, que se distribuye en archivos GGUF de entre 429 y 547 MB. Se trata de una versión experimental, pensada para ejecución en dispositivo (on-device) mediante el fork de llama.cpp de PrismML.

La arquitectura mantiene el diseño híbrido de atención de Bonsai 2: 24 bloques con 18 capas de atención lineal y 6 de atención completa, MLP SwiGLU, RoPE y RMSNorm, con embedding y cabeza LM compartidos. El entrenamiento continuado se centró en corpus educativos y matemáticos multilingües (chino, japonés e inglés) y en datos de instrucciones y matemáticas, según los conjuntos de datos declarados en la model card.

La relevancia del modelo reside en su relación entre tamaño y capacidades: menos de 0,55 GB de pesos con un contexto arquitectónico heredado de 262.000 tokens y un modo de razonamiento (`<think>`) activado por defecto. En una evaluación ciega por pares sobre 200 indicaciones de chat en chino y japonés, un juez LLM prefirió Rina Juvenile Exp frente a Bonsai 2 con una tasa de victoria de 0,618 (chino 0,605, japonés 0,630), a costa de un peor seguimiento de instrucciones en inglés y de tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (18 capas de atención lineal + 6 de atención completa), SwiGLU MLP, RoPE, RMSNorm, embedding y cabeza LM compartidos |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens por arquitectura; entrenamiento con secuencias de máximo 16K tokens; contextos mayores no probados |
| Tipos de cuantizacion | Pesos ternarios {−1, 0, +1} con escalas FP16 por grupo de 128 pesos; empaquetados PQ2_0 (~2,20 bits/peso), PTQ1_0 (~1,83 bits/peso) y Q2_0 (~2,33 bits/peso) |
| Idiomas soportados | Chino y japonés (foco), inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres empaquetados: PQ2_0, PTQ1_0, Q2_0) |

## Arquitectura y entrenamiento

El modelo conserva sin cambios la arquitectura de Bonsai 2: un transformer de 24 bloques con dimensión oculta 2048, en el que 18 capas usan atención lineal y 6 usan atención completa, combinación que reduce el coste de cómputo y memoria del contexto largo. El MLP es SwiGLU, con normalización RMSNorm y codificación posicional RoPE. Los pesos son ternarios en la base rotada de Hadamard de Bonsai, con una escala FP16 por cada 128 pesos; el 6,3 % de los valores ternarios difieren de los del modelo base tras el ajuste fino.

El entrenamiento continuado parte de Ternary Bonsai 2 2B y utiliza un conjunto de datos declarado que incluye corpus web educativos (FineWeb2-HQ, FineWeb-Edu, DCLM-Edu, FinePDFs-Edu, FineWeb-2-Edu japonés), matemáticas (FineMath, GSM8K, Hendrycks-MATH, NuminaMath-1.5, OpenMathReasoning, un conjunto sintético de matemáticas en japonés y TAL-SCQ5K), Wikipedia, código filtrado (StackV2-Edu, self-oss-instruct-sc2) y datos de instrucciones. La model card no detalla el número total de tokens de entrenamiento, la composición exacta ni si se aplicaron fases de RLHF o DPO; esos datos no están disponibles. La innovación principal es la combinación de pesos ternarios con escalas por grupo y atención híbrida, que permite ejecutar un modelo de casi 2B parámetros en un único archivo de menos de 550 MB.

## Capacidades

- Generación de texto conversacional en chino, japonés e inglés, con foco declarado en chino y japonés.
- Razonamiento matemático, apoyado en los conjuntos de datos de matemáticas y en el modo de pensamiento.
- Modo de razonamiento (`<think>` … `</think>`) activado por defecto, desactivable por petición.
- Generación de código e instrucciones de programación, a partir de los datos de StackV2-Edu y self-oss-instruct.
- Tool calling / function calling: soportado de forma limitada; el rendimiento en BFCL v3 es inferior al de Bonsai 2 (49,9 frente a 60,6).
- Seguimiento de instrucciones: capacidad presente pero degradada en inglés respecto al modelo base (IFEval 81,1 frente a 87,8).
- Entrada solo de texto: el proyector de visión (mmproj) de Bonsai 2 no es compatible con estos pesos.
- Capacidades multilingües limitadas a los tres idiomas declarados; no se documenta soporte de otros idiomas.

## Casos de uso

- Chat conversacional en chino y japonés en dispositivos con recursos limitados: el modelo cabe en un archivo de 429–547 MB y puede ejecutarse en CPU o GPU de gama baja, lo que permite asistentes locales sin conexión para usuarios de esos idiomas.
- Asistente de escritorio o móvil integrado en aplicaciones: con pesos ternarios y ~2,2 bits por peso, el modelo se puede empaquetar dentro de una aplicación de escritorio o un servicio ligero sin depender de infraestructura en la nube.
- Generación de respuestas con razonamiento paso a paso: el modo `<think>` activado por defecto permite obtener cadenas de razonamiento para tareas de matemáticas y lógica, útil en tutores educativos o herramientas de resolución de problemas.
- Procesamiento de documentos largos en chino y japonés: aunque el entrenamiento usó secuencias de hasta 16K tokens, la arquitectura soporta hasta 262K tokens, lo que permite experimentar con resúmenes o extracción de información en documentos extensos, asumiendo que los contextos largos no están validados.
- Prototipado rápido de pipelines de generación de texto: su formato GGUF y su compatibilidad con llama.cpp permiten integrarlo en prototipos y pruebas de concepto con requisitos mínimos de hardware.
- Filtrado y clasificación de texto educativo o matemático: el modelo puede emplearse para generar explicaciones, reescribir ejercicios o producir variantes de problemas en chino y japonés, aprovechando los datos de entrenamiento en matemáticas y corpus educativos.
- Evaluación comparativa de técnicas de cuantización ternaria: sirve como banco de pruebas para estudiar el impacto de los distintos empaquetados (PQ2_0, PTQ1_0, Q2_0) en velocidad y calidad de decodificación.

## Benchmarks y rendimiento

Los datos publicados en la model card se limitan a evaluaciones comparativas frente al modelo base y a mediciones de velocidad; no se incluyen resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Evaluacion | Rina Juvenile Exp 2B | Ternary Bonsai 2 2B |
|---|---|---|
| Tasa de victoria en evaluación ciega por pares (200 prompts zh/ja, juez LLM) | 0,618 (zh 0,605; ja 0,630) | Referencia |
| IFEval | 81,1 | 87,8 |
| BFCL v3 | 49,9 | 60,6 |

| Empaquetado | Velocidad de prompt en GPU (pp512, tok/s) | Generación en GPU (tg128, tok/s) | CPU, 2.044 tokens de texto |
|---|---:|---:|---:|
| PQ2_0 | 26.300 ± 2.100 | 624 ± 7 | 13 s |
| PTQ1_0 | 27.700 ± 1.700 | 702 ± 5 | 79 s |
| Q2_0 | 26.800 ± 1.700 | 621 ± 3 | 277 s |

Mediciones en GPU NVIDIA RTX 5090 D con `llama-bench -ngl 99 -p 512 -n 128 -r 10`; CPU AMD Ryzen 9 9950X bajo WSL2, una ejecución cronometrada por archivo sobre los mismos cuatro fragmentos de 512 tokens. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de pesos ternarios de ~1,83–2,33 bits por peso, el modelo ocupa entre 429 y 547 MB en disco; la VRAM necesaria para cargarlo completo es de aproximadamente 0,5–1 GB, dependiendo del empaquetado y del contexto configurado.
- GPU recomendadas: el modelo se ha medido en una NVIDIA RTX 5090 D; por su tamaño, cualquier GPU con al menos 1–2 GB de VRAM libre debería poder alojarlo, incluidas GPUs de gama de entrada.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con al menos 2 GB de VRAM; también se ejecuta en CPU.
- Opciones de despliegue: llama.cpp, concretamente el fork de PrismML; el empaquetado Q2_0 es el único que, según Prism ML, también puede ejecutarse en versiones recientes de llama.cpp upstream, aunque solo se ha probado con el fork. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: en GPU, entre 621 y 702 tokens/s de generación y entre 26.300 y 27.700 tokens/s de procesamiento de prompt; en CPU, el tiempo para procesar 2.044 tokens varía entre 13 s (PQ2_0), 79 s (PTQ1_0) y 277 s (Q2_0) en un Ryzen 9 9950X. En un servidor virtual pequeño (2 vCPU, 3,7 GB de RAM, ancho de banda de ~20 GB/s) las mediciones quedaron limitadas por el ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Rina Juvenile Exp 2B | ~1,88B | 262K por arquitectura (entrenado a 16K) | GGUF ternario (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | Ajuste fino de Bonsai 2 orientado a zh/ja |
| Ternary Bonsai 2 2B | ~1,88B | 262K por arquitectura | GGUF ternario | Apache 2.0 (heredada) | Modelo base; mejor IFEval y BFCL v3; soporta visión con mmproj |
| Qwen3.5-2B | ~2B | No disponible en la información proporcionada | Safetensors y otras | No disponible en la información proporcionada | Modelo original del que deriva la familia Bonsai |

La comparación se limita a los modelos citados en la información disponible; no se dispone de datos de benchmarks estándar para contrastar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una versión experimental: la propia model card advierte de que la calidad absoluta en chino y japonés sigue siendo limitada, con errores gramaticales, mezcla de idiomas y fabricación de hechos.
- El seguimiento de instrucciones en inglés y el tool calling son inferiores a los del modelo base (IFEval 81,1 frente a 87,8; BFCL v3 49,9 frente a 60,6), por lo que no es adecuado para tareas que dependan de estas capacidades.
- El contexto de entrenamiento se limita a 16K tokens; aunque la arquitectura soporta 262K, los contextos más largos no han sido probados y su comportamiento es incierto.
- Solo admite entrada de texto; el proyector de visión de Bonsai 2 no es compatible con estos pesos.
- Riesgo de alucinación documentado explícitamente por el autor.
- El modelo solo se ha probado con el fork de llama.cpp de PrismML; la compatibilidad con llama.cpp upstream solo está indicada para el empaquetado Q2_0 y no ha sido verificada por el autor.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado de Qwen3.5-2B conviene revisar las condiciones de la licencia del modelo original antes de un despliegue comercial.
- No se documentan sesgos específicos más allá de los derivados de los corpus web y educativos utilizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rinstitute/Rina-Juvenile-Exp-2B-GGUF
- Modelo base (Ternary Bonsai 2 2B, Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Modelo original (Qwen3.5-2B): https://huggingface.co/Qwen/Qwen3.5-2B
