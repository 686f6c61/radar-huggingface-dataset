# KORMo-VL/KORMo-Web-9B

## Resumen

KORMo-Web-9B es un agente vision-lenguaje de 9.000 millones de parámetros desarrollado por KORMo-VL, un equipo de investigación centrado en agentes web para coreano e inglés. El modelo parte de Qwen/Qwen3.5-9B y se ha afinado para completar tareas reales de navegador utilizando únicamente capturas de pantalla como entrada, sin necesidad de DOM ni de árbol de accesibilidad. Resuelve el problema de la automatización de navegación web autónoma (computer-use y web-agent) en entornos bilingües, un nicho hasta ahora dominado por modelos propietarios y por agentes open-weight con rendimiento notablemente inferior.

La relevancia del modelo radica en su rendimiento en la evaluación Online-Mind2Web sobre 612 tareas reales: alcanza un 51,0 % de éxito en inglés y un 48,1 % en coreano, frente al 24,7 % y 16,7 % respectivamente del Qwen3.5-9B base. Esto supone una mejora de +26,3 y +31,4 puntos porcentuales. Según el autor, supera a todos los agentes web open-weight comparados por +18,3 puntos en inglés y +27,9 en coreano.

El modelo se distribuye con licencia Apache-2.0, pesos en safetensors, un harness de navegador de referencia, el esquema de herramientas y los ajustes exactos de inferencia. Además, el autor anuncia la publicación de los datos de preentrenamiento web bilingües y las trayectorias de interacción, lo que facilita la reproducibilidad de la investigación en agentes web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base Qwen3.5-9B, pipeline image-text-to-text) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos completos); variante MLX de 4 bits para Apple silicon (KORMo-Web-4B-mlx-4bit); no se detallan otras cuantizaciones |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); variantes MLX para Apple silicon |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer vision-lenguaje multimodal que procesa capturas de pantalla junto con instrucciones en lenguaje natural. KORMo-Web-9B añade un post-entrenamiento específico para agentes web: según la model card, se utilizaron más de 10 millones de muestras de preentrenamiento web a nivel atómico, que enseñan al modelo qué es cada elemento de interfaz, dónde está y qué hace (texto, ubicación, apariencia, disposición, función y estado). Sobre esa base se añadieron más de 100.000 trayectorias de interacción de navegador bilingües que enseñan a traducir esa comprensión fina en acciones multietapa reales.

La innovación principal es el enfoque screenshot-only: el modelo no necesita DOM ni árbol de accesibilidad, sino que actúa sobre lo que ve en pantalla y verifica el resultado de cada acción en la siguiente captura. Además, incorpora un paso breve de razonamiento antes de cada acción, lo que hace inspeccionable y depurable su comportamiento. No se detalla en la información disponible si hubo RLHF, DPO ni el número exacto de tokens de entrenamiento.

## Capacidades

- Generación de acciones de navegador a partir de capturas de pantalla: clics, escritura y movimiento entre sitios y pestañas.
- Planificación y razonamiento de varios pasos antes de cada acción.
- Comprensión fina de elementos de interfaz: texto, ubicación, apariencia, disposición, función y estado.
- Flujos multi-sitio y multi-pestaña: buscar en un sitio, verificar en otro y escribir el resultado en un tercero.
- Soporte bilingüe natural en coreano e inglés, tanto para comandos cortos como para instrucciones conversacionales largas.
- Verificación del resultado de cada acción mediante la siguiente captura de pantalla.
- Capacidad de agente autónomo orientado a objetivos (web-agent y computer-use).
- No se menciona soporte explícito de tool calling genérico, visión más allá de capturas de pantalla, audio ni modo thinking extendido.

## Casos de uso

- Automatización de tareas de navegador repetitivas: el modelo puede recibir una instrucción como "busca el precio de un vuelo y compáralo con otra aerolínea" y ejecutar la secuencia completa de clics y escritura sobre capturas de pantalla, sin integraciones con APIs.
- Asistencia a usuarios en coreano e inglés: al manejar ambos idiomas de forma nativa, puede atender peticiones conversacionales largas en cualquiera de los dos, útil para bases de usuarios bilingües.
- Pruebas de regresión de interfaces web: el agente puede recorrer flujos de usuario reales en un navegador y verificar el resultado de cada acción, lo que permite detectar regresiones de UI sin escribir scripts de Selenium o Playwright.
- Extracción de información multi-sitio: buscar en un portal, verificar el dato en una fuente secundaria y volcar el resultado en una tercera aplicación, gestionando las pestañas de forma autónoma.
- Investigación en agentes web: al publicarse pesos, datos de preentrenamiento, trayectorias y benchmarks, sirve como base reproducible para experimentos académicos sobre computer-use.
- Despliegue local en Mac: con la variante MLX de 4 bits (2,8 GB de pesos, unos 3,8 GB en uso) puede ejecutarse en un Mac de 16 GB o más, lo que facilita prototipos y demos sin GPU dedicada.
- Automatización de tareas administrativas en navegador: rellenar formularios, consultar estados o descargar documentos siguiendo instrucciones en lenguaje natural, con trazabilidad gracias al paso de razonamiento previo a cada acción.

## Benchmarks y rendimiento

Evaluación sobre 612 tareas de sitios web en vivo (300 en inglés, 312 en coreano), puntuadas por el mismo juez LLM. Tasa de éxito en porcentaje; el denominador es siempre el total de tareas, por lo que los fallos o ejecuciones vacías cuentan como fallo.

| Modelo | Tamano | Online-Mind2Web EN | Online-Mind2Web KO |
|---|---:|---:|---:|
| Qwen3.5-9B (base, sin fine-tuning) | 9B | 24,7 | 16,7 |
| Fara-1.5-4B | 4B | 20,7 | 7,7 |
| UI-TARS-1.5-7B | 7B | 22,3 | 20,2 |
| OpenWebRL-4B | 4B | 32,7 | 15,4 |
| KORMo-Web-9B | 9B | 51,0 | 48,1 |
| GPT-6-luna (propietario) | No disponible | 63,0 | 65,7 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- Pesos completos en bf16: 17,5 GB; memoria en uso aproximada de 19 GB. Recomendado un Mac con 48 GB o más (32 GB es ajustado) o una GPU NVIDIA con al menos 24 GB de VRAM.
- Variante MLX de 4 bits (KORMo-Web-4B-mlx-4bit): 2,8 GB de pesos, unos 3,8 GB en uso; cabe en un Mac de 16 GB o más.
- KORMo-Web-4B en bf16: 9,6 GB de pesos, unos 9,5 GB en uso; recomendado un Mac de 24 GB o más.
- El KV cache crece con la longitud del episodio: aproximadamente 1 GB por cada 30.000 tokens, según la model card.
- Despliegue en Mac mediante vllm-mlx 0.6.0 o superior; en GPU NVIDIA mediante servidor compatible con la pila de transformers y endpoints compatibles.
- Existe una extensión de Chrome de referencia (KORMo-Web Chrome extension) que permite lanzar el agente desde el panel lateral del navegador.
- Latencia y throughput no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Online-Mind2Web EN | Online-Mind2Web KO | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| KORMo-Web-9B | 9B | No disponible | 51,0 | 48,1 | Apache-2.0 | Pesos abiertos en Hugging Face |
| UI-TARS-1.5-7B | 7B | No disponible | 22,3 | 20,2 | No disponible | Pesos abiertos |
| OpenWebRL-4B | 4B | No disponible | 32,7 | 15,4 | No disponible | Pesos abiertos |
| Fara-1.5-4B | 4B | No disponible | 20,7 | 7,7 | No disponible | Pesos abiertos |
| GPT-6-luna | No disponible | No disponible | 63,0 | 65,7 | Propietaria | Solo API |

KORMo-Web-9B lidera la comparativa open-weight en ambas lenguas con un margen amplio, aunque queda por detrás del modelo propietario GPT-6-luna en 12,0 puntos en inglés y 17,6 en coreano.

## Limitaciones y advertencias

- El modelo solo se ha evaluado y afinado para coreano e inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Depende exclusivamente de capturas de pantalla: no utiliza DOM ni árbol de accesibilidad, lo que puede degradar el rendimiento en interfaces muy dinámicas, con animaciones o con contenido que no es visible en la captura.
- Riesgo de alucinación en la interpretación de elementos de interfaz y en la verificación de resultados; el paso de razonamiento previo ayuda a depurar, pero no elimina el riesgo.
- La tasa de éxito en la evaluación principal es del 51,0 % en inglés y 48,1 % en coreano, por lo que aproximadamente la mitad de las tareas complejas fallan; no es apto para automatizaciones críticas sin supervisión humana.
- El KV cache crece con la longitud del episodio (aproximadamente 1 GB por cada 30.000 tokens), lo que limita la duración de las sesiones en hardware modesto.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene revisar.
- No se detallan sesgos conocidos, composición exacta del dataset ni procesos de alineación (RLHF/DPO) en la información disponible.
- El uso de un agente que controla un navegador real conlleva riesgos de seguridad (acciones no deseadas, exposición de credenciales); la model card menciona que en el vídeo de configuración se difuminaron los tokens de cuenta, lo que sugiere precaución con secretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KORMo-VL/KORMo-Web-9B
- Extensión de Chrome de referencia: https://github.com/MLP-Lab/KORMo-Web-Extension
- Vídeo de demostración GUI: https://huggingface.co/KORMo-VL/KORMo-Web-9B/resolve/main/assets/gui_final_demo_masked.mp4
- Vídeo de guía de configuración: https://huggingface.co/KORMo-VL/KORMo-Web-9B/resolve/main/assets/setup_guide.mp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
