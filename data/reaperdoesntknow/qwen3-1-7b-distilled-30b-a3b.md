# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B

## Resumen

Qwen3-1.7B-Distilled-30B-A3B es un modelo de lenguaje causal de aproximadamente 2.030 millones de parámetros, desarrollado por Reaperdoesntrun / Convergent Intelligence LLC, que destila el conocimiento de razonamiento STEM del modelo profesor Qwen3-30B-A3B-Instruct-2507 en un modelo denso de tamaño reducido. El objetivo es trasladar las capacidades de razonamiento matemático, físico y de ingeniería de un modelo de 30B con arquitectura MoE a un modelo de ~2B que pueda ejecutarse en entornos con recursos limitados (edge computing).

La destilación se realiza mediante un método propio denominado DISC v3 (Discrepancy-Informed Knowledge Distillation), que combina tres operadores: ponderación de tokens de pivote de razonamiento mediante la discrepancia de la divergencia KL, suavizado de tokens de alta entropía y regularización por energía de discrepancia. El entrenamiento utiliza 6.122 muestras de chain-of-thought STEM procedentes de diez datasets especializados en física, álgebra lineal, electromagnetismo, biología molecular, fisiología, mecánica clásica, ecuaciones diferenciales, ingeniería y matemáticas.

La relevancia actual del modelo reside en su tamaño compacto combinado con un enfoque de destilación centrado en la estructura del razonamiento, lo que lo convierte en una opción interesante para aplicaciones de razonamiento científico en dispositivos sin GPU de alta gama. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 causal language model (transformer denso) |
| Parametros totales | 2.031.739.904 (~2,03B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (contexto de entrenamiento); no se especifica el maximo en inferencia |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en bf16, formato safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer causal autoregresivo estándar con normalización y atención de factorización de consultas (QKV), sin capas de mezcla de expertos. El modelo base es Qwen/Qwen3-1.7B, y el profesor es Qwen/Qwen3-30B-A3B-Instruct-2507, un modelo MoE con 30B parámetros totales y 3B activos.

El entrenamiento emplea destilación de conocimiento discrepante (DISC v3) con una función de pérdida combinada: `L = 0,55 · CE_weighted + 0,45 · KD_disc + 0,02 · E_disc`. La pérdida de entropía cruzada ponderada enfatiza los tokens dentro del segmento de prueba (desde "Proof:" hasta "Final Answer:") con un peso que decae de 2,5× a 1,5×. La pérdida de destilación ponderada por discrepancia identifica automáticamente tokens de pivote de razonamiento (saltos locales en la divergencia KL entre profesor y estudiante) y les asigna un peso amplificado de 3,0×. Además, se aplica suavizado DG (ventana de 3 tokens) en tokens de alta entropía del estudiante, y se añade un término de regularización por energía de discrepancia para prevenir degradación estructural en transiciones de razonamiento difíciles.

El dataset de entrenamiento consta de 6.122 muestras (5.815 de entrenamiento, 307 de evaluación) fusionadas de diez datasets de 0xZee, todos en inglés y centrados en STEM. Se entrenó durante una sola época con tamaño de lote efectivo de 8 (acumulación de gradientes), optimizador AdamW, tasa de aprendizaje 1,5e-5 con decaimiento coseno y 30 pasos de calentamiento, temperatura de destilación 2,0 y precisión bf16 con autocast.

## Capacidades

- Generación de texto autoregresiva en inglés, con especialización en razonamiento paso a paso (chain-of-thought) en dominios STEM.
- Resolución de problemas de matematicas, fisica, ingenieria, biologia molecular, fisiologia y ecuaciones diferenciales.
- Produccion de pruebas formales estructuradas con secciones "Proof:" y "Final Answer:".
- Razonamiento multi-paso con enfasis en transiciones logicas (pivotes de razonamiento) gracias a la destilacion discrepante.
- No se documenta soporte para tool calling, function calling, agentes, vision ni audio.
- Capacidad multilingue limitada: solo ingles declarado.

## Casos de uso

- Tutor academico de matematicas y fisica: el modelo puede generar soluciones paso a paso para problemas de algebra lineal, mecanica clasica y electromagnetismo, util en plataformas educativas que requieren explicaciones detalladas y verificables.
- Asistente de resolucion de problemas en entornos sin conexion: al ser un modelo de ~2B, puede ejecutarse en portatiles o dispositivos edge para ayudar a estudiantes o profesionales en laboratorios sin acceso a la nube.
- Generacion de ejercicios y soluciones para plataformas de e-learning: el modelo puede crear problemas variados de fisica o matematicas junto con sus soluciones razonadas, alimentando sistemas de practica adaptativa.
- Analisis preliminar de problemas de ingenieria: en fases de diseno conceptual, el modelo puede esbozar enfoques de solucion para problemas de mecanica o electromagnetismo, sirviendo como apoyo a ingenieros antes de usar herramientas de simulacion.
- Integracion en chatbots de soporte tecnico especializado en STEM: combinado con un sistema de recuperacion, puede responder preguntas de fisica o matematicas con explicaciones detalladas en un contexto de atencion al cliente tecnico.
- Prototipado de agentes de razonamiento cientifico en hardware limitado: el modelo sirve como base para experimentos de razonamiento encadenado en dispositivos IoT o robots educativos, donde el consumo de memoria es critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones estandar como MMLU, HumanEval o GSM8K, por lo que no es posible comparar cuantitativamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en bf16 (2,03B × 2 bytes), ~2 GB en int8 y ~1 GB en int4 si se cuantiza.
- GPU recomendadas: tarjetas con al menos 4 GB de VRAM para bf16 (p. ej., NVIDIA RTX 3050, RTX 4060, T4); con cuantizacion a 4 bits puede ejecutarse en GPU de 2 GB o incluso en CPU.
- Compatible con hardware de consumo: si, en cuantizacion int4/int8 cabe en GPUs de gama media y en CPUs modernas con suficiente RAM.
- Opciones de despliegue: vLLM, TGI (el repositorio indica compatibilidad con text-generation-inference), llama.cpp (si se convierte a GGUF), Ollama (mediante conversion) y transformers nativo.
- Latencia y throughput: no disponibles en la informacion proporcionada; se estima que en una RTX 4090 podria generar decenas de tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,7B | 32K (modelo base) | Apache 2.0 | Generacion generalista |
| Qwen3-1.7B-Distilled-30B-A3B (este) | 2,03B | 1024 (entrenamiento) | Apache 2.0 | Razonamiento STEM destilado |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B (3B activos) | 32K | Apache 2.0 | Razonamiento general y STEM |

No se dispone de datos de rendimiento comparativo. La diferencia clave con el modelo base es la especializacion en razonamiento cientifico mediante destilacion, aunque a costa de un contexto de entrenamiento reducido (1024 tokens frente a 32K del base).

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no se garantiza un comportamiento adecuado en otros idiomas.
- Contexto de entrenamiento limitado a 1024 tokens, lo que puede provocar degradacion en tareas que requieren ventanas de contexto largas (p. ej., documentos extensos o conversaciones multi-turno prolongadas).
- Dataset de entrenamiento pequeno (6.122 muestras) y de un solo dominio (STEM), lo que aumenta el riesgo de sobreajuste y reduce la generalizacion a otros dominios.
- Riesgo de alucinacion en razonamiento complejo: al ser un modelo destilado, puede producir pruebas o pasos logicos incorrectos sin deteccion explicita.
- No se han publicado evaluaciones independientes ni benchmarks, por lo que el rendimiento real en tareas estandar es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3 (tambien Apache 2.0), por lo que no hay restricciones adicionales conocidas.
- El autor no especifica si el modelo hereda limitaciones de seguridad o sesgos del modelo base; se recomienda auditar antes de usar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Datasets de entrenamiento (autor 0xZee): https://huggingface.co/0xZee (coleccion de datasets CoT de fisica, algebra lineal, electromagnetismo, biologia molecular, fisiologia, mecanica clasica, ecuaciones diferenciales, ingenieria y matematicas)
