# russki/Qwen2.5-1.5B-Instruct-EXL3-4.0bpw

## Resumen

Este repositorio contiene una conversión del modelo Qwen2.5-1.5B-Instruct al formato EXL3 con una cuantización de 4.0 bits por peso (BPW), realizada por el usuario russki mediante ExLlamaV3 v1.4.4 sobre una NVIDIA RTX 3090. El modelo resultante es un checkpoint específico para el runtime ExLlamaV3, no compatible con Transformers, que reduce drásticamente el uso de memoria y acelera la inferencia en GPUs consumer.

La relevancia de esta conversión radica en que permite ejecutar un modelo instructivo de 1.5B parámetros con una huella de memoria de menos de 1 GiB (excluyendo KV cache), lo que lo hace viable en GPUs de gama baja o incluso en entornos con VRAM limitada. El modelo base Qwen2.5-1.5B-Instruct, desarrollado por Alibaba, ofrece capacidades de razonamiento, código y matemáticas mejoradas respecto a su predecesor, y soporta un contexto de hasta 128K tokens. Esta cuantización EXL3 mantiene esas capacidades con una degradación mínima, según las pruebas de humo incluidas en la model card.

El checkpoint se distribuye bajo licencia Apache-2.0, preservando la licencia del modelo original. Incluye los archivos de tokenizador y configuración del modelo base, pero los pesos están serializados en formato EXL3, por lo que solo pueden cargarse con ExLlamaV3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5) |
| Parametros totales | 1.54B (modelo base); 649.890.176 en el checkpoint cuantizado |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | EXL3 4.0 BPW (4 bits por peso) |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base soporta 29 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato EXL3, no compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only con atención de ventana deslizante y atención global alternada, típico de la serie Qwen2.5. Fue preentrenado con hasta 18 billones de tokens según la documentación oficial de Alibaba, y posteriormente ajustado con instrucciones mediante un proceso de SFT y RLHF. La cuantización EXL3 4.0 BPW no modifica la arquitectura, sino que comprime los pesos a 4 bits por peso utilizando el modo de conversión `mul1`, con el `lm_head` a 6 bits. La calibración se realizó con 250 filas de 2048 tokens cada una.

El checkpoint resultante conserva los archivos de configuración y tokenizador del modelo original, pero los pesos están en un formato propietario de ExLlamaV3. Esto implica que no puede cargarse con la librería Transformers ni con otros runtimes como llama.cpp o vLLM, y requiere específicamente ExLlamaV3.

## Capacidades

- Generación de texto y conversación multi-turno en inglés (y otros idiomas si se usa el modelo base, aunque la model card solo declara inglés).
- Razonamiento básico y resolución de problemas matemáticos sencillos, gracias al ajuste instructivo del modelo base.
- Generación de código en lenguajes comunes (Python, JavaScript, etc.) con calidad aceptable para un modelo de 1.5B.
- Soporte de tool calling y function calling, heredado del modelo base Qwen2.5-Instruct.
- Capacidad de manejar contextos largos de hasta 128K tokens, aunque en la práctica la ventana efectiva puede verse limitada por la memoria disponible.
- No incluye capacidades multimodales (visión, audio) ni un modo de "thinking" explícito.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede ejecutarse en una GPU consumer con menos de 2 GiB de VRAM, lo que permite montar un chatbot privado en un portátil con RTX 3060 o similar, sin depender de servicios en la nube.
- Generación de código en entornos de desarrollo integrado: gracias a su soporte de tool calling, puede integrarse en editores como VS Code para autocompletar o generar fragmentos de código, con una latencia de decodificación de ~156 tok/s en una RTX 3090.
- Clasificación y extracción de información en documentos largos: su ventana de 128K tokens permite procesar documentos extensos (contratos, informes) y extraer entidades o resumir secciones, siempre que se use el runtime adecuado.
- Prototipado rápido de aplicaciones de NLP: al ser un modelo pequeño y rápido, es útil para validar flujos de conversación o pipelines de generación antes de escalar a modelos más grandes.
- Educación y experimentación: investigadores y estudiantes pueden estudiar el efecto de la cuantización en la calidad del modelo, comparando este checkpoint con la versión BF16.
- Edge computing en dispositivos con GPU integrada: aunque no es tan ligero como un modelo de 0.5B, su huella de memoria de ~1 GiB lo hace apto para dispositivos con GPUs de baja potencia (p. ej., Jetson Orin Nano).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una comparación de rendimiento de velocidad entre el modelo BF16 con Transformers y el checkpoint EXL3 4.0 BPW con ExLlamaV3, realizada en una RTX 3090 con un prompt de 512 tokens y 255 tokens de decodificación greedy. Los valores son medianas de tres ejecuciones:

| Modelo/runtime | Memoria del modelo | Prefill | Decode | Prueba de humo |
|---|---:|---:|---:|---:|
| BF16 / Transformers | 2,945 MiB | 9,458 tok/s | 26.97 tok/s | 3/4 |
| EXL3 4.0 BPW / ExLlamaV3 | 929 MiB | 4,215 tok/s | 156.55 tok/s | 3/4 |

La prueba de humo consiste en cuatro prompts de capacidad y no es un benchmark de calidad. La model card advierte que la variación entre ejecuciones fue significativa y que no se midieron perplejidad, divergencia KL ni concurrencia.

## Requisitos de hardware

- VRAM estimada: el modelo EXL3 4.0 BPW ocupa 929 MiB (excluyendo KV cache y overhead del proceso). Con una ventana de contexto de 2048 tokens, la memoria total necesaria ronda los 1.5-2 GiB.
- GPU recomendadas: cualquier GPU con al menos 2 GiB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs integradas de gama alta. La conversión se realizó en una RTX 3090, pero no es un requisito mínimo.
- Cabe en GPUs consumer de gama baja, siempre que tengan soporte CUDA.
- Opciones de despliegue: exclusivamente con ExLlamaV3 (https://github.com/turboderp-org/exllamav3). No es compatible con Transformers, llama.cpp, Ollama ni vLLM.
- Latencia y throughput: en una RTX 3090, se observó un prefill de 4,215 tok/s y una decodificación de 156.55 tok/s. En GPUs más modestas, el throughput será proporcionalmente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Runtime | Memoria (aprox.) | Licencia |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (BF16) | 1.54B | 128K | BF16 | Transformers | 2,945 MiB | Apache-2.0 |
| russki/Qwen2.5-1.5B-Instruct-EXL3-4.0bpw | 1.54B (base) | 128K | EXL3 4.0 BPW | ExLlamaV3 | 929 MiB | Apache-2.0 |
| adriabama06/Qwen2.5-1.5B-Instruct-exl3-8.0bpw | 1.54B (base) | 128K | EXL3 8.0 BPW | ExLlamaV3 | no disponible | Apache-2.0 |

La comparativa muestra que la cuantización EXL3 4.0 BPW reduce la memoria a menos de un tercio respecto al BF16, a costa de una ligera pérdida de calidad (no medida formalmente). La versión de 8.0 BPW ofrecería mayor fidelidad pero con mayor uso de memoria, aunque no se dispone de datos concretos.

## Limitaciones y advertencias

- Es un checkpoint cuantizado: la cuantización a 4 bits puede degradar la calidad en tareas complejas de razonamiento o generación de código, aunque la prueba de humo no mostró diferencias.
- No es compatible con Transformers ni con otros runtimes populares: solo funciona con ExLlamaV3, lo que limita su integración en ecosistemas estándar.
- La model card solo declara inglés como idioma soportado, aunque el modelo base soporta 29 idiomas; el comportamiento en otros idiomas no está verificado.
- No se han realizado evaluaciones formales de calidad (perplejidad, benchmarks estándar) sobre esta cuantización, por lo que el impacto real en rendimiento es desconocido.
- El modelo base puede presentar sesgos y alucinaciones, especialmente en contextos largos o temas especializados; la cuantización no corrige estos problemas.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución al modelo original y a este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/russki/Qwen2.5-1.5B-Instruct-EXL3-4.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Blog de Qwen2.5: https://qwen.ai/blog?id=qwen2.5
- Página de Qwen2.5-1.5B-Instruct en Ollama: https://ollama.com/library/qwen2.5:1.5b-instruct
- Otra cuantización EXL3 de referencia: https://huggingface.co/adriabama06/Qwen2.5-1.5B-Instruct-exl3-8.0bpw
