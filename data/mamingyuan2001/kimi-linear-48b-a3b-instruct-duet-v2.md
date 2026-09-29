# mamingyuan2001/Kimi-Linear-48B-A3B-Instruct-DUET-v2

## Resumen

DUET v2 es un conjunto de componentes de inferencia para el modelo Kimi-Linear-48B-A3B-Instruct de Moonshot AI, publicado por el usuario mamingyuan2001. No es un modelo completo: contiene 0,114B parámetros nuevos que modifican la memoria de una petición sin alterar los pesos del modelo base. La técnica, denominada DUET (Decoupled Unified Encoding for Transformers), reduce la profundidad del prefill a 19 de las 27 capas y comprime los estados recurrentes KDA, manteniendo las claves y valores de atención exactos.

El modelo base es un transformer híbrido con capas KDA y MLA, con 48B parámetros totales y 3B activos. DUET v2 sustituye a la versión v1 (k = 17, código 2048 + 128, solo texto web, 3,5e7 tokens) y se entrenó con 6,0e8 tokens sobre una mezcla de datos públicos de matemáticas, código, ciencia y texto web. Su relevancia radica en reducir la huella de memoria en el prefill y en el estado recurrente, un cuello de botella habitual al servir modelos de contexto largo.

La aproximación introduce pérdida por cuantización y truncamiento de estado, medida como KL respecto al modelo original: 0,014 en web, 0,013 en código, 0,021 en chat instructivo y 0,019 en web largo. Requiere el checkpoint base en bf16 (92 GB) y el paquete twinstar, por lo que no es directamente desplegable con runtimes estándar como vLLM o llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DUET (Decoupled Unified Encoding for Transformers) sobre el modelo base Kimi-Linear-48B-A3B-Instruct, con capas KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) |
| Parámetros totales | 48B (modelo base) + 0,114B (componentes DUET); ~48,114B en total |
| Parámetros activos | 3B (modelo base, MoE) |
| Longitud de contexto | no disponible (el entrenamiento de DUET usa ventanas de 4K y 16K tokens; la longitud del modelo base no se especifica) |
| Tipos de cuantización | nvfp4 (e2m1) para coordenadas z del código, con una escala e4m3 por cada 16 coordenadas y una escala fp32 por token; bf16 para valores exactos; rank-8/rank-16 para estados recurrentes; no se detallan cuantizaciones del modelo base |
| Idiomas soportados | no disponible |
| Licencia | other (componentes DUET); el modelo base tiene licencia MIT |
| Formato de pesos | safetensors (duet_components.safetensors) + spec.json; el modelo base se carga por separado (formato no confirmado en la información) |
| Hash SHA256 de duet_components.safetensors | e1b2381b50117b3e8b14514c960752c4aa81731a0a712f12f03e7b253ad30588 |

## Arquitectura y entrenamiento

DUET modifica dos aspectos de la memoria de una petición sin tocar los pesos del modelo. Primero, el prompt se ejecuta solo en las primeras 19 de las 27 capas; el residual que entra en la capa 19 se almacena como un código de 2304 números más 128 coordenadas exactas (se resta la embedding de entrada del token antes de codificar y se suma después). Las memorias de prompt de las capas más profundas se escriben a partir de ese código mediante emisores, copias entrenadas de la mitad de escritura de memoria de cada capa. Segundo, cada estado KDA se mantiene como un término sumidero exacto más factores de contenido de rango 16, re-podados cada 16 pasos de decodificación. Las claves y valores de atención se almacenan exactos para cada token.

Los componentes nuevos suman 0,114B parámetros: 8 emisores (5 KDA, 3 MLA) con 103,0M, el código E/D con 10,6M y el sumidero de estado con 0,11M. Se inicializaron a partir de las mitades de escritura de memoria de las propias capas, direcciones principales del residual en texto web y el valor medio de cada cabeza. El objetivo fue KL(profesor || estudiante) + 0,1 CE tras un límite log-uniforme, con AdamW (wd 0), lr máximo 5e-5, calentamiento 50 y coseno hasta 2%. Se entrenó con 8 nodos x 4 GPU, 1.761 pasos de 340.787 tokens (6,0e8 tokens), 70% ventanas de 4K con micro-lote 2 y 30% ventanas de 16K con micro-lote 1, en 51 minutos. Los datos fueron solo texto público: FineWeb-Edu / FineMath, documentos sintéticos de recuperación, OpenMathReasoning, OpenScienceReasoning-2, OpenCodeReasoning, OpenR1-Math-220k, OpenThoughts3, tulu-3-sft-mixture y documentos largos de FineWeb-Edu. Se descartaron 314 documentos que compartían un 13-grama con preguntas de GPQA-Diamond, MMLU, MATH-500, AIME 2024/2025 o IFEval.

## Capacidades

- Generación de texto y conversación instructiva: heredadas del modelo base Kimi-Linear-48B-A3B-Instruct.
- Razonamiento matemático: el entrenamiento de DUET incluye OpenMathReasoning, OpenR1-Math-220k y FineMath, aunque la capacidad final depende del modelo base.
- Generación de código: se usó OpenCodeReasoning en la mezcla de entrenamiento.
- Razonamiento científico: se usó OpenScienceReasoning-2 en la mezcla de entrenamiento.
- Recuperación aumentada: se usaron documentos sintéticos de recuperación en el entrenamiento.
- Prefill eficiente: el prompt se ejecuta solo en las primeras 19 de 27 capas, con un código de 1.684 bytes por token codificado (nominal).
- Compresión de estado recurrente: los estados KDA se representan como término sumidero exacto más factores de rango 16, re-podados cada 16 pasos de decodificación.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no disponible.
- Visión, audio o modo thinking: no documentado en la información proporcionada.

## Casos de uso

- Inferencia eficiente de Kimi-Linear-48B-A3B en GPUs con memoria limitada: DUET reduce la profundidad del prefill a 19 capas y comprime los estados recurrentes, lo que disminuye la memoria necesaria durante el procesamiento de prompts largos.
- Procesamiento de prompts largos: el entrenamiento usa ventanas de 16K tokens; el modelo puede emplearse en tareas de resumen o recuperación sobre documentos extensos, siempre que el modelo base soporte la longitud final requerida.
- Investigación en compresión de estados recurrentes: permite experimentar con distintas configuraciones de rango (8 frente a 16) y cadencia de re-poda (8 frente a 16 pasos) para medir el equilibrio entre memoria y calidad.
- Evaluación de calidad de aproximación: las métricas KL en datos retenidos permiten cuantificar la degradación frente al modelo original en web, código, chat y web largo.
- Despliegue de chat instructivo: el modelo base es instruct; DUET acelera el prefill en conversaciones multi-turno con contexto acumulado.
- Experimentos de destilación y emulación de capas: los emisores son copias entrenadas de las mitades de escritura de memoria, útiles para estudiar cómo se reconstruyen las memorias de capas profundas a partir de un residual comprimido.
- Reducción de costes en clústeres: aunque no reduce el peso del modelo base (92 GB en bf16), sí reduce el estado de prompt y recurrente, lo que puede abaratar el servicio en entornos con muchas peticiones concurrentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de ajuste en datos retenidos (KL respecto al modelo original, forma de decodificación r16/W16):

| Conjunto | KL DUET v2 | KL DUET v1 |
|---|---|---|
| Web | 0,014 | 0,025 |
| Código | 0,013 | 0,019 |
| Chat instructivo | 0,021 | 0,037 |
| Web largo | 0,019 | 0,032 |

Una segunda ejecución v2 con la misma receta y 2e8 tokens da el mismo ajuste en datos retenidos y el mismo examen dentro de un error estándar en cada celda; la ejecución de 6e8 tokens es la que se distribuye.

## Requisitos de hardware

- VRAM para el modelo base en bf16: 92 GB.
- Componentes DUET: 0,114B parámetros, archivo de 0,5 GB.
- Código por token de prompt codificado: 1.684 bytes (nominal; los índices gap8 dependen de los datos).
- GPU recomendadas: 2x A100 80GB, 2x H100 80GB o configuraciones con más memoria; la implementación de referencia reparte las capas sobre TWINSTAR_DEVICES (se usaron dos dispositivos).
- GPU de consumo: no cabe en una sola GPU de consumo; se requeriría una cuantización del modelo base no incluida en esta información.
- Opciones de despliegue: paquete twinstar, PyTorch y safetensors. No se indica compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-Linear-48B-A3B-Instruct (base) | 48B | 3B | no disponible | MIT | HuggingFace |
| DUET v1 | no disponible (componentes sobre el base) | 3B (base) | no disponible | other (base MIT) | HuggingFace |
| DUET v2 | 48B + 0,114B | 3B (base) | no disponible | other (base MIT) | HuggingFace (0 descargas, 0 likes) |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint base moonshotai/Kimi-Linear-48B-A3B-Instruct y el paquete twinstar.
- Licencia "other" para los componentes DUET; el modelo base tiene licencia MIT. Revisar los términos antes de uso comercial.
- No se especifican idiomas soportados.
- Riesgo de alucinación y sesgos heredados del modelo base, no evaluados en esta ficha.
- La aproximación DUET introduce error de cuantización y truncamiento de estado: KL de hasta 0,021 en chat instructivo.
- No hay benchmarks estándar publicados (MMLU, HumanEval, GSM8K, etc.).
- Requiere GPUs que alojen 92 GB en bf16; no es apto para hardware de consumo sin una cuantización adicional no incluida.
- La longitud máxima de contexto no está documentada.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.
- El entrenamiento usó solo datos públicos y no incluyó conjunto de evaluación, pero se filtraron 314 documentos con solapamiento de 13-gramas con benchmarks.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mamingyuan2001/Kimi-Linear-48B-A3B-Instruct-DUET-v2
- Modelo base: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- Repositorio de código: no disponible (mencionado como "code repository" en la model card)
- Paper: no disponible
- Demo: no disponible
