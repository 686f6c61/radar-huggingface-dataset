# LeonaQuantum/leona-qasm-1.0

## Resumen

Leona-qasm-1.0 es un adaptador LoRA de tipo PEFT entrenado para la generación de circuitos cuánticos en OpenQASM 3 a partir de descripciones en lenguaje natural. Lo desarrolla LeonaQuantum y se publica como pesos de adaptador (0,5 GB) que deben cargarse sobre el modelo base Qwen/Qwen3.8-27B. Su propósito es especializar un modelo de lenguaje general en un dominio muy técnico —la descripción formal de circuitos cuánticos— sin necesidad de reentrenar el modelo completo, lo que reduce costes de cómputo y de almacenamiento de forma notable.

El adaptador corresponde al checkpoint `clean-v13-step-600`, que continúa el entrenamiento del adaptador clean-v12 durante 600 pasos adicionales con un rango LoRA de 16, alfa 32 y una longitud máxima de 4.096 tokens. El conjunto de datos de entrenamiento suma 24.593 filas, incluidas 2.333 añadidas con circuitos verificados aritméticamente, circuitos QFT y circuitos generados desde MQT Bench y la librería Qiskit. La evaluación del adaptador está en curso y el autor no reclama resultados de rendimiento todavía.

La relevancia actual del modelo reside en su enfoque vertical: la traducción de intención en lenguaje natural a código OpenQASM 3 utilizable es una tarea con demanda creciente en flujos de trabajo de computación cuántica asistida por IA. Al publicarse bajo licencia Apache 2.0 y con el contrato de entrenamiento documentado en `training_provenance.json`, resulta un artefacto reproducible para investigación, aunque su estado de validación exige cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.8-27B |
| Parametros totales | No disponible para el adaptador; el modelo base es Qwen/Qwen3.8-27B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en BF16 junto al base) |
| Idiomas soportados | Ingles, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA sobre un transformer decoder-only de la familia Qwen (Qwen/Qwen3.8-27B, revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, cargado con `Qwen3_5ForConditionalGeneration` en BF16). La configuración LoRA es rango 16, alfa 32, con acumulación de gradiente de 16 y longitud máxima de 4.096 tokens. El entrenamiento se realizó en el ecosistema Transformers 5.22.1, PEFT 0.21.2 y PyTorch 2.8.0.

El proceso de entrenamiento parte del adaptador clean-v12 en el paso 1.000 y continúa 600 pasos adicionales con una tasa de aprendizaje de 2e-5. El dataset final consta de 24.593 filas: las 22.260 del clean-v12 más 2.333 nuevas, que incluyen circuitos con aritmética verificada, circuitos QFT y circuitos generados desde MQT Bench y la librería de circuitos de Qiskit. Las filas añadidas se comprobaron contra los conjuntos de validación y test para evitar solapamiento, una práctica relevante para la fiabilidad de la evaluación futura. No se documenta el uso de RLHF o DPO; el entrenamiento es de ajuste supervisado sobre pares de instrucción y circuito.

## Capacidades

- Generación de circuitos OpenQASM 3 a partir de descripciones en lenguaje natural, tarea central del adaptador.
- Especialización en dominios concretos: aritmética cuántica verificada, transformada cuántica de Fourier (QFT) y circuitos de referencia de MQT Bench y Qiskit.
- Soporte de plantilla de chat incluida, con modo de razonamiento desactivado (`enable_thinking=False`) según las instrucciones de carga.
- Capacidades multilingües limitadas a inglés y japonés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes ni visión.
- El modelo base subyacente aporta generación de texto y razonamiento general, pero el adaptador está orientado exclusivamente a la tarea QASM.

## Casos de uso

- Asistencia a investigadores en computación cuántica: el adaptador traduce una descripción textual de un algoritmo (por ejemplo, "circuito de Grover para 3 qubits") a código OpenQASM 3 que puede revisarse y ejecutarse en simuladores o hardware real.
- Generación de circuitos de referencia para pruebas: útil para producir plantillas de QFT o circuitos aritméticos que sirvan como base de comparación en pipelines de validación de compiladores cuánticos.
- Docencia y material formativo: permite ilustrar la correspondencia entre descripciones conceptuales y código QASM en cursos de computación cuántica, con revisión humana obligatoria del resultado.
- Integración en plataformas de desarrollo cuántico asistido por IA, como la propuesta por Leona Quantum, donde el adaptador actúa como capa de traducción entre la intención del usuario y el código del circuito.
- Prototipado rápido en investigación: acelera la escritura de circuitos exploratorios antes de su optimización manual o con herramientas como Qiskit.
- Generación de conjuntos de datos sintéticos de circuitos QASM para experimentos de entrenamiento o evaluación de otros modelos, siempre que se verifiquen los circuitos generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la evaluación del adaptador está en curso y que no se reclama ninguna mejora sobre el modelo base.

## Requisitos de hardware

- El adaptador pesa 0,5 GB, pero requiere cargar el modelo base Qwen/Qwen3.8-27B en BF16, lo que implica una huella de memoria muy superior a la del adaptador.
- VRAM estimada para el modelo base en BF16: aproximadamente 54 GB solo para pesos (27.000 millones de parámetros × 2 bytes), más memoria para el contexto de 4.096 tokens y el estado de inferencia.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para BF16; en GPUs consumer de 24 GB (RTX 4090) sería necesaria cuantización del modelo base, no documentada para este adaptador.
- Opciones de despliegue: Transformers con PEFT (protocolo indicado por el autor); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| LeonaQuantum/leona-qasm-1.0 | LoRA sobre Qwen3.8-27B | Base 27B | 4.096 | Apache 2.0 | Evaluación en curso |
| LeonaQuantum/leona-qompact-1.0 | LoRA sobre modelo base no especificado | No disponible | No disponible | No disponible | Entrenamiento completo, sin validación de calidad |
| LeonaQuantum/leona-qasm-1.0-beta (clean-v12) | LoRA sobre Qwen3.8-27B | Base 27B | 4.096 | Apache 2.0 | Versión previa, sustituida por clean-v13 |

No se dispone de información sobre otros adaptadores de generación QASM comparables en la búsqueda realizada.

## Limitaciones y advertencias

- Evaluación incompleta: el autor declara que la evaluación está en curso y no reclama resultados; no debe asumirse ninguna mejora sobre el modelo base.
- Los circuitos generados deben verificarse antes de su uso; no hay garantía de corrección sintáctica o semántica en OpenQASM 3.
- Riesgo de alucinación inherente al modelo base, especialmente en puertas, ángulos o registros no vistos durante el entrenamiento.
- Idiomas limitados a inglés y japonés; no se documenta soporte de castellano.
- Contexto de 4.096 tokens, suficiente para circuitos de tamaño moderado pero restrictivo para descripciones largas o circuitos extensos.
- El adaptador no incluye los datos de entrenamiento, que mantienen sus propias condiciones de uso.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación de calidad desaconseja su despliegue en producción sin pruebas propias.
- No se documentan sesgos específicos; al ser un adaptador de dominio técnico, el riesgo principal es la incorrección técnica más que el sesgo social.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/LeonaQuantum/leona-qasm-1.0
- Versión previa (clean-v12): https://huggingface.co/LeonaQuantum/leona-qasm-1.0-beta
- Adaptador relacionado leona-qompact-1.0: https://huggingface.co/LeonaQuantum/leona-qompact-1.0
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio de Leona Quantum: https://leonaqt.com/
