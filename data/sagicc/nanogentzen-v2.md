# Sagicc/nanoGentzen-v2

## Resumen

nanoGentzen-v2 es un modelo compacto de 4,86 millones de parámetros desarrollado por Sagicc, diseñado específicamente para guiar la búsqueda de demostraciones automáticas en el cálculo de secuentes de Gentzen para lógica intuicionista (LI). Se trata de una red de política-valor bidireccional que evalúa secuentes lógicos Γ ⊢ Δ (con |Δ| ≤ 1) y predice simultáneamente la regla de deducción a aplicar, la premisa antecedente objetivo y la puntuación de demostrabilidad constructiva de la rama en el intervalo [0, 1].

El modelo resuelve el problema de la explosión combinatoria en la demostración automática de teoremas, proporcionando una guía neuronal que reduce drásticamente el retroceso exploratorio. Su relevancia actual radica en su aplicación a la verificación formal y al razonamiento automatizado, áreas en crecimiento dentro del desarrollo de software crítico y sistemas de IA confiable. Con una arquitectura transformer bidireccional de 6 capas, 8 cabezas de atención, dimensión oculta de 256 y una ventana de contexto de 256 tokens, el modelo es extremadamente ligero y de alto rendimiento, entrenado en 400 000 transiciones certificadas de derivación de Gentzen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (policy-value network) |
| Parametros totales | 4 861 697 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 nativo) |
| Idiomas soportados | Inglés (simbólico y compilación NLP) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

nanoGentzen-v2 emplea una arquitectura transformer bidireccional con 6 capas, 8 cabezas de atención y dimensión oculta de 256. El vocabulario consta de 95 tokens especiales de lógica más un alfabeto alfanumérico. El espacio de acciones incluye 11 reglas completas del cálculo de secuentes proposicional LI, y el espacio de pivote permite seleccionar entre 16 índices de antecedentes. La red tiene tres cabezas de salida: una para la política de reglas, otra para el pivote de antecedentes y una tercera para la estimación de demostrabilidad (valor).

El entrenamiento se realizó sobre un dataset sintético de 400 000 transiciones certificadas (380 000 de entrenamiento y 20 000 de validación), generadas a partir de derivaciones de Gentzen verificadas. Se utilizó una GPU NVIDIA RTX 4090 de 24 GB con precisión mixta bfloat16, completando 20 épocas en 61 minutos con decaimiento coseno de la tasa de aprendizaje y calentamiento lineal. La pérdida conjunta combina la clasificación de reglas, la selección de pivote y la regresión del valor de demostrabilidad. La innovación clave es la integración de una cabeza de valor que permite podar ramas del árbol de búsqueda con alta precisión, junto con un compilador NLP que traduce silogismos en inglés directamente a secuentes.

## Capacidades

- Guía de búsqueda de prueba hacia atrás en lógica intuicionista proposicional (cálculo de secuentes LI).
- Predicción de la regla de deducción a aplicar (Top-1 con 98,4 % de precisión en validación).
- Selección de la premisa antecedente objetivo (pivote) entre hasta 16 antecedentes.
- Estimación de demostrabilidad constructiva de cada rama en [0, 1], permitiendo poda de búsqueda.
- Clasificación binaria de demostrabilidad con 98,9 % de precisión en validación.
- Compilación de silogismos en lenguaje natural (inglés) a secuentes formales mediante el parser integrado.
- Integración con herramientas de verificación formal y demostración interactiva de teoremas.
- Inferencia de alta velocidad gracias a su tamaño reducido (4,86 M parámetros).

## Casos de uso

- Verificación formal de programas: el modelo puede guiar la búsqueda de pruebas de propiedades de programas en lógica intuicionista, integrándose en asistentes de prueba como Coq o Agda para acelerar la generación de obligaciones de demostración.
- Demostración automática de teoremas: como motor de búsqueda guiada para probadores de teoremas basados en cálculo de secuentes, reduciendo el espacio de búsqueda y el tiempo de cómputo.
- Asistencia en pruebas interactivas: en entornos de desarrollo de pruebas formales, el modelo sugiere la siguiente regla a aplicar, ayudando a los ingenieros de verificación a completar demostraciones complejas.
- Educación en lógica y razonamiento formal: puede utilizarse como herramienta didáctica para enseñar cálculo de secuentes, mostrando pasos de derivación y puntuaciones de demostrabilidad.
- Integración en pipelines de CI/CD para verificación: al ser extremadamente ligero, puede ejecutarse en entornos de integración continua para validar automáticamente invariantes lógicos de código.
- Generación de pruebas para sistemas de tipos: en lenguajes con tipos dependientes, el modelo puede ayudar a construir derivaciones de tipado y verificar la corrección de programas.
- Razonamiento automatizado en agentes de IA: como componente de razonamiento lógico en sistemas multiagente, donde se requiere validar conclusiones a partir de premisas dadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Sin embargo, la model card reporta las siguientes métricas de validación del propio modelo:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 0,1661 |
| Precisión de política de reglas (Top-1) | 98,4 % |
| Precisión de clasificación de demostrabilidad | 98,9 % |
| Pérdida de entrenamiento | 0,0105 |
| Precisión de política de reglas (train) | 99,8 % |
| Precisión de demostrabilidad (train) | 99,1 % |

Estos datos provienen del entrenamiento sobre 20 000 transiciones de validación. No se dispone de resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es un LLM generativo sino una red especializada en tareas de demostración lógica.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (modelo de 4,86 M parámetros en bfloat16, aproximadamente 9,7 MB de pesos).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona incluso en GPUs integradas. El entrenamiento se realizó en una RTX 4090, pero la inferencia es viable en hardware mucho más modesto.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: Python con PyTorch, carga remota mediante Hugging Face `AutoModel` con `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo de texto.
- Latencia y throughput: no se proporcionan datos específicos, pero dado el tamaño del modelo, la inferencia es prácticamente instantánea en GPU y de pocos milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (redes neuronales para guiar demostración en cálculo de secuentes) en los datos proporcionados. La única comparación disponible es con la versión anterior del mismo modelo, nanoGentzen v0.1:

| Dimension | nanoGentzen (v1) | nanoGentzen-v2 |
|---|---|---|
| Dataset de entrenamiento | 200 000 transiciones | 400 000 transiciones |
| Precisión de política de reglas (val) | ~80,5 % | 98,4 % |
| Precisión de demostrabilidad (val) | Básica | 98,9 % |
| Pérdida de validación | 0,6550 | 0,1661 |
| Guía de búsqueda | Heurística | Política conjunta P(Rule) × P(Pivot) con poda por valor |
| Compilación NLP | No | Sí (parser.py) |
| Herramientas de desarrollo | Script único | example_usage.py, cli.py, benchmarks.txt |
| Integración Hugging Face | Scripts personalizados | AutoModel con trust_remote_code |

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en lógica intuicionista proposicional; no maneja cuantificadores ni lógica de primer orden.
- La ventana de contexto es de solo 256 tokens, lo que limita la complejidad de los secuentes que puede procesar.
- El vocabulario es reducido (95 tokens), restringido a símbolos lógicos y caracteres alfanuméricos; no es un modelo de lenguaje general.
- El dataset de entrenamiento es sintético y generado automáticamente, lo que podría introducir sesgos en la distribución de reglas y estructuras de prueba.
- Aunque la precisión en validación es alta, no se han realizado evaluaciones independientes ni pruebas de robustez frente a entradas adversariales.
- La compilación NLP está limitada al inglés y a silogismos simples; no soporta lenguaje natural complejo ni otros idiomas.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo no incluye garantías de corrección en entornos de producción crítica.
- No se proporcionan métricas de latencia ni throughput en condiciones de carga, por lo que el rendimiento en despliegues a gran escala no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sagicc/nanoGentzen-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Sagicc/nanoGentzen-v2
- Código fuente y suite de entrenamiento: https://github.com/DigitLib/nanoGenzen_train
- Interfaz gráfica interactiva: https://github.com/DigitLib/nanoGenzen_GUI
- Dataset original (v1): https://huggingface.co/datasets/Sagicc/nanoGentzen
