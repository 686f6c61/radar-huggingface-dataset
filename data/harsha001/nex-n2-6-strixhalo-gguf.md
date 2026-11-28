# Harsha001/Nex-N2.6-StrixHalo-GGUF

## Resumen

Nex-N2.6-StrixHalo-GGUF es una cuantización de 2 bits del modelo multimodal Nex-N2.6, desarrollado por Nex-AGI sobre la base de GLM-5.3-Flash de Z.ai. El modelo original es un transformer de mezcla de expertos (MoE) de 321 mil millones de parámetros totales, orientado a tareas de agente: uso de ordenador (computer use), programación y flujos largos con llamadas a herramientas. Esta build concreta, publicada por el usuario Harsha001, comprime los pesos hasta 96 GiB para que quepan en una única máquina AMD Strix Halo con 128 GB de memoria unificada.

La relevancia de esta ficha reside en que permite ejecutar un modelo de escala 300B+ con capacidades de visión y razonamiento agéntico en hardware de consumo de gama alta (APU AMD con memoria unificada), algo que normalmente requiere múltiples GPU de datacenter. Para ello se conservan los 288 expertos enrutados y se incluye el codificador visual en F16, a costa de una pérdida de calidad medible (perplejidad de 4,02 frente a 2,64 del Q8_0 de referencia).

El repositorio tiene 104,4 GB, emplea el formato GGUF y está pensado para ejecutarse con la build ROCmFPX de llama.cpp sobre Vulkan. La licencia es Apache-2.0, heredada del modelo base. Los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), nombre de arquitectura en GGUF `glm5-next`, con codificador visual |
| Parametros totales | 320.759.404.382 (~321B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (el ejemplo de ejecución usa `-c 16384`) |
| Tipos de cuantizacion | IQ2_XXS (gate y up de expertos), IQ3_XXS (down de expertos), Q8_0 (atención, experto compartido, capas densas, embeddings), F16 (codificador visual) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (3 partes + mmproj F16) |
| Numero de expertos | 288 expertos enrutados, todos conservados |
| Tamano del repo | 104,4 GB (modelo 103 GB + mmproj 1,1 GB) |
| Modelo base | nex-agi/Nex-N2.6 (a su vez sobre zai-org/GLM-5.3-Flash) |
| Herramienta de inferencia | ROCmFPX (llama.cpp con Vulkan), `llama-server` |

## Arquitectura y entrenamiento

Nex-N2.6 es un modelo de mezcla de expertos construido por Nex-AGI a partir de GLM-5.3-Flash de Z.ai. La arquitectura declarada en los ficheros GGUF es `glm5-next`, e incluye 288 expertos enrutados, un experto compartido, capas densas y un cabezal de predicción multi-token (bloque 45). Incorpora además un codificador visual que habilita la modalidad image-text-to-text. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información no está disponible en la documentación proporcionada.

La cuantización es el aspecto técnico central de esta build. Se aplica una receta mixta: los tensores gate y up de los expertos enrutados van en IQ2_XXS, los tensores down en IQ3_XXS, y todo lo demás (atención, experto compartido, capas densas y embeddings) en Q8_0. La matriz de importancia (imatrix) empleada es la de Unsloth para GLM-5.3-Flash, no una generada sobre Nex-N2.6; como carece de datos para el bloque 45 (cabezal de predicción multi-token), se usaron los datos del bloque 44 como sustituto. Según el autor, la generación normal no utiliza ese cabezal, por lo que solo podría verse afectada la aceleración opcional por predicción multi-token. El codificador visual se convierte a F16 desde los pesos originales de Nex-AGI.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con niveles de esfuerzo configurables mediante `reasoning_effort` (`low`, `high`, `max`; por defecto `max`) en la plantilla de chat de Nex-AGI.
- Comprensión de imágenes (image-text-to-text) mediante el fichero `mmproj` F16: descripción de escenas y objetos.
- Programación: el autor verificó la generación de una función de Fibonacci iterativa correcta en Python con nota sobre su complejidad.
- Aritmética básica y conocimiento factual (17 × 23 = 391; Canberra como capital de Australia) en comprobaciones con decodificación greedy.
- Soporte de agentes y computer use: el modelo está diseñado para uso de ordenador, tareas largas con herramientas y flujos multi-paso (según la descripción del modelo original).
- Llamadas a herramientas (tool calling): implícito en su orientación agéntica, aunque no se detalla el formato exacto en la información disponible.
- Cabezal de predicción multi-token para posible aceleración de decodificación (opcional).

## Casos de uso

- Agentes de uso de ordenador (computer use): el modelo está diseñado específicamente para interpretar pantallas y ejecutar acciones sobre interfaces, por lo que encaja en automatización de tareas de escritorio y navegación web guiada.
- Asistencia de programación en local: con capacidad verificada para generar código correcto y razonar sobre complejidad, puede integrarse en editores o terminales para autocompletado y explicación de código sin depender de la nube.
- Automatización de flujos con herramientas: su orientación a tareas largas con tool calling permite orquestar pipelines multi-paso (consulta de APIs, lectura de ficheros, ejecución de comandos) en un único equipo.
- Análisis de imágenes en local: gracias al codificador visual F16, puede describir imágenes, capturas de pantalla o fotografías en entornos con requisitos de privacidad, sin enviar datos a servicios externos.
- Prototipado e investigación en hardware de consumo: investigadores que necesiten experimentar con un MoE de 321B sin acceso a clústeres pueden usar una máquina Strix Halo de 128 GB para pruebas de prompts y evaluación cualitativa.
- Atención al cliente o asistentes multi-turno en inglés y chino: su ventana de contexto (configurable, con ejemplo a 16 384 tokens) permite conversaciones con historial extenso en ambos idiomas.
- Evaluación de técnicas de cuantización extrema: útil como banco de pruebas para medir el impacto de recetas IQ2/IQ3 sobre un modelo grande, comparando perplejidad y KL frente al Q8 de referencia.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, OSWorld) para esta cuantización; el autor indica explícitamente que la calidad agéntica y de computer use "no se probó". Los únicos datos publicados son métricas de degradación por cuantización medidas con `llama-perplexity --kl-divergence` sobre 40 fragmentos de 512 tokens de wikitext-2 en una NVIDIA GB10:

| Build | Tamano | Perplejidad | KL respecto a Q8 | Mismo token top que Q8 |
|---|---:|---:|---:|---:|
| Q8_0 de pesos de Nex-AGI (referencia, no publicado) | 318 GiB | 2,64 | — | — |
| Esta build (2 bits, 288 expertos) | 96 GiB | 4,02 | 0,47 | 77,2 % |
| Misma receta sobre GLM-5.3-Flash (comparación) | — | 4,09 | 0,51 | 76,5 % |

El autor advierte que el texto de evaluación es inglés general, por lo que estos números no reflejan directamente el rendimiento en computer use, programación, llamadas a herramientas ni chino. Las comprobaciones cualitativas con decodificación greedy (Fibonacci en Python, 17 × 23 = 391, Canberra, descripción de una figurita de zorro y de un casco de bicicleta) fueron correctas.

## Requisitos de hardware

- VRAM/memoria estimada: unos 96 GiB para los pesos del modelo más ~1,1 GB del codificador visual; el autor recomienda configurar el reparto de memoria del BIOS para que la GPU pueda acceder a unos 110 GiB.
- Hardware objetivo: AMD Strix Halo con 128 GB de memoria unificada. El autor advierte que HIP/ROCm solo asigna desde la parte dedicada de memoria, por lo que un reparto 64/64 es insuficiente; debe usarse Vulkan.
- GPU de datacenter: no se documentan requisitos para A100, H100 ni RTX 4090; por tamaño, no cabe en una RTX 4090 (24 GB) ni en configuraciones consumer convencionales.
- Despliegue: `llama-server` de la build ROCmFPX (llama.cpp con Vulkan). Otras builds de llama.cpp podrían no reconocer la arquitectura `glm5-next`. No se mencionan vLLM, TGI ni Ollama.
- Ejemplo de arranque: `llama-server -m IQ2_XXS-E288/Nex-N2.6-StrixHalo-IQ2_XXS-E288-00001-of-00003.gguf --mmproj mmproj-Nex-N2.6-F16.gguf -ngl 99 -c 16384 --jinja`. Omitir `--mmproj` para texto puro ahorra ~1 GB.
- Contexto: el autor recomienda empezar con un contexto pequeño y subirlo con cuidado por la escasez de memoria libre; el ejemplo usa 16 384 tokens.
- Latencia y throughput: no disponibles. Los ficheros no se han probado aún en hardware AMD según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Nex-N2.6-StrixHalo-GGUF (esta ficha) | ~321B (MoE, 288 expertos) | no disponible (ejemplo a 16k) | Apache-2.0 | GGUF 2 bits, 96 GiB | Optimizado para 128 GB Strix Halo |
| nex-agi/Nex-N2.6 (original) | ~321B (MoE) | no disponible | Apache-2.0 | Pesos originales (FP8) | Referencia de calidad; requiere mucho más hardware |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | no disponible | Pesos originales y GGUF (Unsloth) | Base sobre la que se construye Nex-N2.6 |
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF (mismo autor) | no disponible | no disponible | no disponible | GGUF para Strix Halo | Alternativa del mismo autor para 128 GB Strix Halo |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización extrema: la perplejidad sube de 2,64 a 4,02 y solo el 77,2 % de los tokens top coinciden con el Q8 de referencia; el autor califica la compresión como "pesada" y la pérdida como "real".
- Evaluación incompleta: no se han probado los benchmarks de computer use ni de agentes (OSWorld y otros de la model card original); las pruebas cualitativas son escasas y con decodificación greedy.
- Imatrix no específica: se usó la de GLM-5.3-Flash, no una generada sobre Nex-N2.6, y el bloque 45 (cabezal de predicción multi-token) se aproximó con datos del bloque 44.
- Compatibilidad limitada: los ficheros solo se han probado con ROCmFPX; otras builds de llama.cpp podrían no reconocer la arquitectura `glm5-next`. No se han probado en hardware AMD.
- Restricciones de memoria: requiere ajustar el reparto de memoria del BIOS (~110 GiB accesibles por la GPU) y dejar margen escaso para el contexto; el contexto debe subirse con cautela.
- Idiomas: solo inglés y chino declarados; no se garantiza calidad en castellano.
- Sesgos y alucinaciones: no documentados en la información disponible; como todo modelo generativo, presenta riesgo de alucinación, especialmente acentuado por la cuantización de 2 bits.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base GLM-5.3-Flash y de la imatrix de Unsloth.
- No es una release oficial: el autor indica que todo el crédito corresponde a Nex-AGI y Z.ai.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Nex-N2.6-StrixHalo-GGUF
- Modelo base Nex-N2.6: https://huggingface.co/nex-agi/Nex-N2.6
- Modelo base de Z.ai GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Imatrix de Unsloth para GLM-5.3-Flash: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Herramienta de inferencia ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Modelo destacado del mismo autor (DeepSeek-V4.1-Flash para Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
