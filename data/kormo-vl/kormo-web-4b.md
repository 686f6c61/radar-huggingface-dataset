# KORMo-VL/KORMo-Web-4B

## Resumen

KORMo-Web-4B es un modelo de visión-lenguaje de 4B parámetros especializado en actuar como agente de navegador web a partir únicamente de capturas de pantalla. Lo desarrolla el grupo KORMo-VL y se construye mediante fine-tuning del modelo base Qwen/Qwen3.5-4B, al que se añaden capacidades de percepción de interfaces gráficas y planificación de acciones multi-paso. El modelo recibe una petición en coreano o inglés y ejecuta de forma autónoma clics, escritura y navegación entre sitios y pestañas hasta completar la tarea.

El problema que resuelve es la automatización fiable de tareas web reales sin depender del DOM ni del árbol de accesibilidad: el modelo opera sobre lo que aparece en pantalla, como haría una persona, y verifica el resultado de cada acción en la siguiente captura. Esto lo hace robusto frente a webs dinámicas, componentes renderizados en canvas y aplicaciones que no exponen una estructura semántica estable.

Su relevancia actual radica en que combina un tamaño reducido (5.174.964.736 parámetros según los pesos en safetensors) con un rendimiento que, según el autor, supera a agentes web open-weight de mayor tamaño en la misma evaluación de sitios en vivo. Se distribuye con licencia Apache-2.0, pesos abiertos, harness de navegador de referencia y datos de entrenamiento publicados, lo que facilita la reproducibilidad de la investigación en agentes web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (fine-tuning de Qwen/Qwen3.5-4B), pipeline image-text-to-text |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos completos) y 4-bit (variante `KORMo-Web-4B-mlx-4bit`); no se detallan otros formatos |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 10,8 GB); variante MLX 4-bit para Apple silicon |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de tipo image-text-to-text, y se especializa mediante un proceso de entrenamiento en dos fases descrito por el autor. La primera fase utiliza más de 10 millones de muestras de pretraining web a nivel atómico en coreano e inglés, orientadas a que el modelo aprenda qué es cada elemento de interfaz, dónde está y qué hace, cubriendo texto, posición, apariencia, disposición, función y estado. La segunda fase emplea más de 100.000 trayectorias de interacción web bilingües que enseñan a traducir esa comprensión fina en acciones multi-paso reales.

Una innovación destacable es el enfoque screenshot-only: el modelo no consume DOM ni árbol de accesibilidad, sino que percibe la pantalla y comprueba el efecto de cada acción en la captura siguiente. Además, incorpora un paso breve de razonamiento antes de cada acción, lo que hace su comportamiento inspeccionable y depurable. El autor publica los pesos, los datos de pretraining web bilingües a gran escala, las trayectorias de interacción y los benchmarks de evaluación. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento previo a la acción: cada paso incluye un razonamiento corto que precede a la ejecución.
- Comprensión de capturas de pantalla: identifica elementos de interfaz, su posición, apariencia, disposición, función y estado.
- Acciones de navegador: clics, escritura de texto, navegación entre sitios y gestión autónoma de pestañas.
- Flujos multi-sitio y multi-pestaña: puede buscar en un sitio, verificar en otro y escribir el resultado en un tercero.
- Soporte bilingüe coreano-inglés, tanto en peticiones cortas como en instrucciones largas y conversacionales.
- Verificación de resultados: comprueba el efecto de cada acción en la siguiente captura de pantalla.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema transformers.
- Integración con un harness de navegador de referencia, esquema de herramientas y ajustes de inferencia exactos publicados por el autor.
- Capacidad de ejecución en Apple silicon mediante `vllm-mlx` 0.6.0 o superior, además de GPU NVIDIA.

## Casos de uso

- Automatización de tareas web repetitivas: rellenar formularios, consultar estados o descargar informes en portales internos donde no existe API, actuando solo con capturas de pantalla.
- Asistencia en atención al cliente: un agente que navega por el panel de soporte, localiza el pedido del cliente y ejecuta acciones de seguimiento, verificando cada paso en la pantalla siguiente.
- Investigación y verificación multi-sitio: buscar un dato en una web, contrastarlo en otra y consolidar el resultado en una tercera, gestionando las pestañas de forma autónoma.
- Testing de interfaces web: usar el agente para recorrer flujos de usuario reales en un navegador y detectar puntos de fuga, aprovechando su razonamiento inspeccionable para depurar fallos.
- Extracción de datos de aplicaciones sin API: operar sobre paneles renderizados en canvas o con estructuras DOM inestables, donde los scrapers tradicionales fallan.
- Automatización en escritorio con Apple silicon: desplegar la variante 4-bit (2,8 GB de pesos, unos 3,8 GB en uso) en un Mac de 16 GB o más para tareas de navegador locales.
- Asistente personal de navegación: interpretar peticiones conversacionales largas en coreano o inglés y ejecutar la secuencia completa de acciones en el navegador del usuario mediante la extensión de Chrome.

## Benchmarks y rendimiento

El autor reporta una evaluación sobre 612 tareas de sitios web en vivo (300 en inglés, 312 en coreano), cada una con su propio prompt y formato de acción, puntuadas por el mismo juez LLM. La tasa de éxito usa como denominador el total de tareas, por lo que las ejecuciones caídas o vacías cuentan como fallos.

| Modelo | Tamaño | Online-Mind2Web EN | Online-Mind2Web KO |
|---|---:|---:|---:|
| Qwen3.5-4B (base, sin fine-tuning) | 4B | 20,0 | 13,5 |
| Fara-1.5-4B | 4B | 20,7 | 7,7 |
| UI-TARS-1.5-7B | 7B | 22,3 | 20,2 |
| OpenWebRL-4B | 4B | 32,7 | 15,4 |
| **KORMo-Web-4B (ours)** | **4B** | **42,3** | **42,3** |
| KORMo-Web-9B (ours) | 9B | 51,0 | 48,1 |

Según el autor, KORMo-Web-4B supera a todos los agentes web open-weight comparados por +9,6 puntos en inglés y +22,1 puntos en coreano, y mejora al Qwen3.5-4B base en +22,3 / +28,8 puntos en Online-Mind2Web. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Pesos en bf16: 9,6 GB; memoria en uso aproximada de 9,5 GB.
- Variante MLX 4-bit: 2,8 GB de pesos y unos 3,8 GB en uso.
- Mac con Apple silicon: la variante 4-bit requiere 16 GB de memoria o más; la bf16 requiere 24 GB o más; el modelo de 9B en bf16 requiere 48 GB o más (32 GB es ajustado).
- La caché KV añade aproximadamente 1 GB por cada 30.000 tokens en episodios largos, además de la memoria que consume Chrome.
- Despliegue en Mac mediante `vllm-mlx` 0.6.0 o superior; en GPU NVIDIA el autor indica que el modelo se sirve en una GPU NVIDIA, sin detallar modelos concretos.
- Opciones de despliegue documentadas: `vllm-mlx` para Apple silicon y servidor compatible con endpoints; no se detallan vLLM, llama.cpp, Ollama o TGI para este modelo en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamaño | Online-Mind2Web EN | Online-Mind2Web KO | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| KORMo-Web-4B | 4B | 42,3 | 42,3 | Apache-2.0 | Pesos abiertos en Hugging Face |
| OpenWebRL-4B | 4B | 32,7 | 15,4 | no disponible | no disponible |
| UI-TARS-1.5-7B | 7B | 22,3 | 20,2 | no disponible | no disponible |
| Fara-1.5-4B | 4B | 20,7 | 7,7 | no disponible | no disponible |

KORMo-Web-4B iguala o supera a alternativas de tamaño similar y a UI-TARS-1.5-7B, que tiene casi el doble de parámetros, en la evaluación de sitios en vivo reportada por el autor. La comparación se limita a la métrica Online-Mind2Web; no se dispone de datos de otros benchmarks ni de detalles de licencia y disponibilidad de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a coreano e inglés; no se declara soporte para castellano ni otros idiomas.
- Dependencia de capturas de pantalla: el rendimiento puede degradarse en interfaces con baja resolución, texto muy pequeño o elementos visuales ambiguos.
- Riesgo de alucinación en la interpretación de la pantalla y en la planificación de acciones, con posibilidad de clics erróneos o secuencias incompletas.
- Los resultados de benchmarks provienen del propio autor y de una única evaluación (Online-Mind2Web con 612 tareas y juez LLM), por lo que no han sido verificados de forma independiente en la información disponible.
- Longitud de contexto no especificada; los episodios largos incrementan la caché KV (aproximadamente 1 GB por 30.000 tokens) y pueden agotar la memoria en equipos ajustados.
- La licencia Apache-2.0 permite uso comercial, pero el autor no detalla restricciones adicionales sobre los datos de entrenamiento publicados.
- El despliegue en producción requiere un harness de navegador y gestión de sesiones de Chrome; no se documentan límites de concurrencia ni comportamiento bajo carga.
- No se detallan sesgos conocidos del modelo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KORMo-VL/KORMo-Web-4B
- Extensión de Chrome: https://github.com/MLP-Lab/KORMo-Web-Extension
- Vídeo de demostración: https://huggingface.co/KORMo-VL/KORMo-Web-4B/resolve/main/assets/gui_final_demo_masked.mp4
- Guía de instalación en vídeo: https://huggingface.co/KORMo-VL/KORMo-Web-4B/resolve/main/assets/setup_guide.mp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
