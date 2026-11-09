# BRR1154/SmolLM2-135M-Coder-v1

## Resumen

SmolLM2-135M-Coder-v1 es un ajuste fino (fine-tune) del modelo base HuggingFaceTB/SmolLM2-135M-Instruct, publicado por el autor independiente BRR1154 bajo la organizacion Runtime-Slayers. Se presenta como un modelo de lenguaje pequeno (SLM) especializado en generacion de codigo y pensado para despliegue en el extremo (edge computing): microcontroladores, robotica embebida, gateways como Raspberry Pi o Jetson Nano y entornos WebAssembly. El modelo conserva la arquitectura tipo Llama del original, con 30 capas, dimension oculta de 576 y 3 cabezas Key-Value.

El problema que aborda es la necesidad de un generador de codigo con latencia muy baja y huella de memoria minima, alli donde no es viable ejecutar modelos de mayor tamano. Con 134.515.008 parametros reales (segun los pesos en safetensors), el autor declara un footprint de aproximadamente 270 MB en FP16 y 135 MB en INT8/GGUF, y una latencia inferior a 50 ms con mas de 120 tokens por segundo en CPU de borde. La ventana de contexto es de 8192 tokens.

Es relevante ahora por la tendencia creciente hacia modelos compactos para inferencia local y por el interes en tecnicas de edicion de pesos (weight surgery) aplicadas a modelos pequenos. El autor declara una intervencion de edicion de rango 1 en el espacio nulo sobre las proyecciones down de los MLP. No obstante, conviene senalar que el repositorio no registra descargas ni likes en el momento de la consulta y que no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (30 capas, 576 de dimension oculta, 3 cabezas KV) |
| Parametros totales | 134.515.008 (~135 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | FP16 (~270 MB), INT8 / GGUF (~135 MB); otras no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF mencionado en la model card |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de estilo Llama con 30 capas, dimension oculta de 576, 3 cabezas Key-Value y una ventana de contexto de 8192 tokens. Sobre esa base, el autor aplica lo que describe como "surgical weight surgery": una edicion de rango 1 en el espacio nulo sobre las proyecciones down de los MLP, con la condicion de que la perturbacion no altere la respuesta sobre el subespacio base. La model card no detalla el dataset de ajuste, el numero de tokens de entrenamiento ni si se empleo RLHF o DPO; esa informacion no esta disponible.

Tampoco se especifican hiperparametros, regimen de entrenamiento ni composicion del corpus de codigo empleado para el ajuste. Las unicas afirmaciones tecnicas verificables en la informacion proporcionada son la arquitectura heredada del modelo base, el numero de parametros y el footprint de memoria declarado por el autor.

## Capacidades

- Generacion de codigo en Python, MATLAB y G-Code, segun declara el autor.
- Validacion de sintaxis y grounding sintactico orientado a rutinas de codigo limpias.
- Calculos algoritmicos y matriciales (el ejemplo de la model card usa NumPy para una matriz de distancias euclideas).
- Generacion de texto conversacional, heredada del modelo base Instruct.
- Plantilla de chat compatible con `apply_chat_template` de transformers.
- Inferencia de baja latencia en CPU de borde (declarado: >120 tokens/s, <50 ms).
- Soporte de tool calling / function calling: no disponible (no declarado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Asistencia de codigo en dispositivos embebidos: el modelo puede generar fragmentos de Python o rutinas de control en G-Code directamente en una Raspberry Pi o Jetson Nano, sin conexion a la nube, gracias a su huella de ~135-270 MB y su contexto de 8192 tokens.
- Validacion de sintaxis en pipelines de CI ligera: puede integrarse como paso previo de comprobacion de fragmentos de codigo en entornos con recursos limitados, reduciendo la dependencia de servicios externos.
- Automatizacion de robotica de borde: generacion de rutinas G-Code o scripts de control en microcontroladores y gateways, donde la latencia sub-50 ms es critica para bucles de control.
- Prototipado rapido en WebAssembly: despliegue del modelo en el navegador o en entornos WASM para demos de generacion de codigo sin backend, aprovechando el formato compacto de pesos.
- Educacion y tutoria de programacion offline: generacion de ejemplos y explicaciones de codigo en dispositivos de bajo coste, con la ventaja de funcionar sin conexion.
- Preprocesado de codigo en pipelines de datos: generacion de transformaciones o snippets de NumPy/MATLAB en tareas de procesamiento por lotes ejecutadas en CPU.
- Asistencia conversacional tecnica en ingles: uso como chatbot ligero para consultas de programacion, apoyandose en la plantilla de chat del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara metricas de rendimiento operativo en borde (mas de 120 tokens por segundo y latencia inferior a 50 ms en CPU), sin especificar el hardware exacto ni la metodologia de medicion.

## Requisitos de hardware

- VRAM/RAM estimada: ~270 MB en FP16 y ~135 MB en INT8/GGUF, segun el autor.
- GPU recomendadas: no disponibles; el modelo esta orientado a CPU de borde.
- Compatibilidad con GPU de consumo: por tamano, cabe en cualquier GPU de consumo moderna (por ejemplo, RTX 3060 o superiores), aunque no se han publicado pruebas especificas.
- Plataformas de borde declaradas: Raspberry Pi, Jetson Nano, microcontroladores y WebAssembly.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), endpoints compatibles; llama.cpp/Ollama no confirmados de forma explicita, aunque se menciona formato GGUF.
- Latencia y throughput: declarados >120 tokens/s y <50 ms en CPU de borde; sin datos de hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SmolLM2-135M-Coder-v1 | ~135 M | 8192 | Apache 2.0 | Codigo en borde |
| HuggingFaceTB/SmolLM2-135M-Instruct (base) | ~135 M | 8192 | Apache 2.0 | Instrucciones generales |
| SmolLM2-360M-Instruct | ~360 M | 8192 | Apache 2.0 | Instrucciones generales |
| Qwen2.5-Coder-0.5B | ~500 M | 32768 | Apache 2.0 | Codigo |

La comparativa se limita a parametros, contexto y licencia; no hay datos de rendimiento comparativo disponibles para este modelo.

## Limitaciones y advertencias

- Con ~135 M de parametros, la capacidad de razonamiento y la calidad de codigo son limitadas frente a modelos de mayor tamano; es probable que falle en tareas complejas o de varios pasos.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Riesgo de alucinacion elevado en un modelo de este tamano, especialmente en APIs y librerias poco frecuentes.
- No se han publicado benchmarks ni evaluaciones independientes; las metricas de latencia y throughput son declaraciones del autor sin metodologia detallada.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso comunitario.
- La tecnica de edicion de pesos declarada (rank-1 null-space editing) no esta documentada con detalle ni validada externamente.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento del modelo en el dominio concreto antes de produccion.
- El contexto de 8192 tokens puede no ser suficiente para repositorios de codigo grandes.
- No se declaran capacidades de tool calling ni de agente, por lo que no es adecuado para flujos automatizados complejos sin capas adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/SmolLM2-135M-Coder-v1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Organizacion del autor: https://github.com/Runtime-Slayers
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
