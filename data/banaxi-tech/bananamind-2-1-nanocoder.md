# Banaxi-Tech/BananaMind-2.1-NanoCoder

## Resumen

BananaMind 2.1 NanoCoder es un modelo de lenguaje especializado en código, desarrollado por Banaxi-Tech, que combina una arquitectura transformer con un módulo de memoria n-gram (bigram y four-gram) parcialmente en bucle. Con aproximadamente 12,25 millones de parámetros según los pesos safetensors (el autor declara 9,9 millones), es un modelo extremadamente compacto diseñado para ejecutarse en entornos con recursos limitados, como dispositivos edge o integraciones ligeras.

El modelo utiliza un tokenizer de 8192 tokens heredado de BananaMind 2 Nano y ofrece una ventana de contexto de 4096 tokens. Su arquitectura ejecuta 11 pasadas efectivas sobre 8 capas físicas, repitiendo el bloque medio (L3-L5) dos veces compartiendo pesos, e inyecta representaciones n-gram aprendidas al inicio de ambas pasadas. Fue entrenado con 30 mil millones de tokens procedentes de The Stack v3 (75%) y FineWeb-Edu (25%), lo que le proporciona un sólido conocimiento de código fuente y texto educativo en inglés.

Su relevancia radica en demostrar que es posible obtener un modelo de código funcional con menos de 15 millones de parámetros, abriendo la puerta a despliegues en hardware muy modesto, aunque con capacidades limitadas en comparación con modelos de mayor escala. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas parcialmente en bucle (partially-looped) + módulo n-gram (bigram y four-gram) |
| Parametros totales | 12.254.978 (según safetensors); 9.895.690 declarados por el autor |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Codigo (multiples lenguajes de programacion) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con 8 capas físicas, pero su ejecución sigue un flujo de 11 pasadas: `L1 → L2 → L3 → L4 → L5 → L3 → L4 → L5 → L6 → L7 → L8`. Las capas L3, L4 y L5 se ejecutan dos veces compartiendo pesos, lo que aumenta la profundidad efectiva sin incrementar el número de parámetros. Esta técnica, denominada "partially-looped", permite una mayor capacidad de razonamiento con un coste computacional adicional moderado.

Además, el modelo incorpora un módulo de memoria n-gram con dos tablas hash independientes: una de bigramas y otra de cuatro-gramas, cada una con 29.744 entradas y vectores de 32 dimensiones. Estas representaciones se concatenan y proyectan al flujo residual de 256 dimensiones, inyectándose mediante puertas aprendidas al inicio de ambas pasadas del bloque medio. Este diseño busca capturar patrones locales frecuentes en el código, complementando la atención del transformer.

El entrenamiento se realizó sobre una mezcla de 30 mil millones de tokens, distribuidos en un 75% de The Stack v3 (22,5B tokens) y un 25% de FineWeb-Edu (7,5B tokens). The Stack v3 se procesó como archivos fuente ordenados por repositorio, omitiendo archivos vendored e incluyendo la ruta del repositorio y el lenguaje detectado en el texto de entrenamiento. FineWeb-Edu aporta prosa, nombres de variables, comentarios y conocimiento general del lenguaje. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación supervisada.

## Capacidades

- Generación de texto y código: el modelo es capaz de completar y generar fragmentos de código en múltiples lenguajes, así como texto natural relacionado con programación.
- Modelado causal de lenguaje: adecuado para tareas de autocompletado y predicción de siguiente token.
- Memoria n-gram: el módulo de bigramas y cuatro-gramas mejora la predicción de patrones frecuentes, especialmente útil en código repetitivo.
- Entrenamiento bilingüe (código e inglés): comprende comentarios, documentación y descripciones en inglés.
- Sin soporte explícito de tool calling, agentes o razonamiento multi-paso en la información disponible.
- No se indica soporte para visión, audio u otras modalidades.

## Casos de uso

- Autocompletado de código en editores ligeros: el modelo puede integrarse en plugins de VS Code, Neovim o editores web para sugerir completaciones de línea o bloque. Su pequeño tamaño permite inferencia en tiempo real incluso en portátiles sin GPU.
- Generación de snippets en entornos CI/CD: puede utilizarse para generar plantillas de código o fragmentos de configuración en pipelines de integración continua, donde los recursos son limitados.
- Asistente de documentación técnica: dado su entrenamiento con FineWeb-Edu, puede generar comentarios y descripciones en inglés para funciones o clases, ayudando a mantener documentación actualizada.
- Educación en programación: para entornos de aprendizaje donde se necesita un modelo local que no dependa de API externas, puede servir como tutor básico de sintaxis o generador de ejemplos.
- Preprocesamiento de código: puede emplearse para normalizar o reformatear fragmentos de código, aunque con limitaciones por su contexto de 4096 tokens.
- Prototipado rápido en investigación: su arquitectura parcialmente en bucle y su memoria n-gram lo convierten en un banco de pruebas interesante para estudiar técnicas de compresión de modelos y eficiencia computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o similares para este modelo.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (12,25 millones de parámetros × 4 bytes ≈ 49 MB), y considerablemente menor en cuantizaciones de 8 bits o 4 bits (aproximadamente 12-25 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050, Jetson Nano o incluso CPU sola.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, y también en CPUs sin aceleración gráfica.
- Opciones de despliegue: compatible con frameworks que soporten safetensors y arquitecturas transformer estándar, como llama.cpp, Ollama (si se convierte a GGUF), vLLM (aunque es excesivo para este tamaño) o implementaciones personalizadas en PyTorch.
- Latencia y throughput: no disponible, pero por su tamaño se espera una latencia de milisegundos en CPU y de microsegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el mismo rango de parámetros (menos de 15M) y especializados en código. Modelos como CodeGPT-small (125M) o Salesforce CodeGen-350M son significativamente más grandes y no son comparables en tamaño. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Tamaño extremadamente reducido: aunque el autor declara menos de 10M de parámetros, los pesos reales superan los 12M, pero sigue siendo un modelo muy pequeño con capacidad limitada para tareas complejas de razonamiento o generación de código extenso.
- Contexto limitado: 4096 tokens, insuficiente para archivos de código grandes o conversaciones largas.
- Idiomas restringidos: solo código e inglés; no se garantiza un buen rendimiento en otros idiomas naturales.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar código sintácticamente plausible pero semánticamente incorrecto, especialmente en lenguajes poco representados en The Stack v3.
- Sesgos potenciales: el entrenamiento con The Stack v3 puede reflejar sesgos presentes en el código público, como comentarios ofensivos o prácticas no inclusivas.
- Sin información sobre cuantizaciones oficiales: no se proporcionan archivos GGUF ni guías de cuantización, por lo que el usuario debe convertir los pesos manualmente si desea usarlos en herramientas como llama.cpp.
- Fecha de creación y actualización inusual (2026): los metadatos indican fechas futuras, lo que podría ser un error o una convención interna del autor; no afecta al funcionamiento del modelo.

## Enlaces

- [HuggingFace: Banaxi-Tech/BananaMind-2.1-NanoCoder](https://huggingface.co/Banaxi-Tech/BananaMind-2.1-NanoCoder)
- [Publicación de anuncio 1](https://huggingface.co/posts/Banaxi-Tech/452874424066762)
- [Publicación de anuncio 2](https://huggingface.co/posts/Banaxi-Tech/292084208797922)
- [Discusión sobre el modelo de código BananaMind 2.1](https://huggingface.co/Banaxi-Tech/unified-2.1-test/discussions/1)
