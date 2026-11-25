# decido-ai/decido-web-v2

## Resumen

Decido-Web v2 es un modelo de decisión especializado para agentes de navegador, desarrollado por decido-ai. Se trata de un fine-tune de google/gemma-4-26B-A4B-it (arquitectura Mixture-of-Experts con 26B parámetros totales y aproximadamente 4B activos por token) al que se le ha fusionado un LoRA entrenado sobre las propias rollouts del agente. En lugar de generar texto libre, el modelo responde a preguntas de elección múltiple sobre el siguiente paso en una tarea web: qué operación ejecutar (CLICK, TYPE, SELECT, SCROLL_DOWN, WAIT, DONE, BLOCKED) y sobre qué elemento de la página, devolviendo una distribución de probabilidad calibrada para cada opción.

Su relevancia radica en el enfoque: separa la toma de decisiones rutinaria del razonamiento generalista, permitiendo que un modelo especializado y calibrado gestione la mayoría de los pasos mientras escala los casos difíciles a un modelo mayor. Habla el formato de petición "System One" (`POST /v1/systemone`) de Jev Ultrafast y se distribuye con el paquete `decido-ai`, que incluye un agente completo ejecutable en Chrome. El modelo lee hasta 32.768 tokens por petición y trata el texto de la página como datos no confiables, ignorando instrucciones embebidas en el contenido.

La versión v2 incorpora aprendizaje sobre cuándo detenerse (DONE), cuándo esperar (WAIT) y cómo salir de bucles, aspectos críticos en la navegación autónoma. Existe una variante más rápida, Decido-Web v2-Fast (basada en Qwen3-4B), pensada para servir con menor latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (base Gemma-4-26B-A4B) con LoRA fusionado |
| Parametros totales | 25.805.936.206 |
| Parametros activos | Aproximadamente 4B por token |
| Longitud de contexto | 32.768 tokens por petición |
| Tipos de cuantizacion | No disponible (pesos en bf16; sin build GGUF/CPU publicado) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; tamaño del repo 51,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B, un transformer con arquitectura Mixture-of-Experts que activa aproximadamente 4B parámetros por token sobre un total de 26B. Sobre esta base se aplicó un fine-tune LoRA que posteriormente se fusionó en los pesos finales, entrenado a partir de Decido-1 web (decido-ai/decido-1-web-26b-a4b) utilizando las rollouts generadas por el propio agente. Este entrenamiento sobre datos de interacción real del agente es lo que permite al modelo aprender patrones operativos como la detección de finalización de tarea, la espera ante estados de carga y la salida de bucles repetitivos.

La tarea se formula como respuesta a preguntas de elección: el modelo recibe el estado de la página (URL, título, texto visible, elementos interactivos con índice, rol, etiqueta, valor actual y operaciones permitidas, además de las acciones recientes) y devuelve para cada pregunta una opción elegida, un vector de probabilidades que suma 1 y un nivel de confianza. El texto de la página se trata explícitamente como datos no confiables, de modo que las instrucciones contenidas en una web no se siguen como órdenes. Las páginas que exceden los 32.768 tokens se truncan por el final, conservando el inicio de la página y todas las preguntas. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Decisión de operación web: selecciona entre CLICK, TYPE, SELECT, SCROLL_DOWN, WAIT, DONE y BLOCKED según las opciones ofrecidas por el agente.
- Selección de elemento objetivo: identifica el elemento de la página sobre el que actuar (click_target, type_target, etc.) con una probabilidad por elemento.
- Calibración de confianza: cada respuesta incluye probabilidades normalizadas y un valor de confianza, apto para umbrales y escalado a otros modelos.
- Detección de finalización y espera: aprende cuándo emitir DONE, cuándo WAIT y cómo romper bucles de acciones repetidas.
- Formato de petición estructurado: implementa la API "System One" (`POST /v1/systemone`) compatible con Jev Ultrafast.
- Robustez frente a inyección de instrucciones: el texto de la página se trata como datos no confiables.
- Procesamiento de contexto largo: lectura de hasta 32.768 tokens por petición, incluyendo texto visible y elementos interactivos.
- Integración multimodal de entrada texto-imagen declarada en el pipeline (image-text-to-text), aunque la información disponible describe el uso basado en estado textual de la página.
- No se documentan en la información disponible capacidades de tool calling genérico, generación de código ni matemáticas fuera del ámbito de decisión web.

## Casos de uso

- Automatización de tareas web repetitivas: el modelo decide paso a paso qué clicar o rellenar en flujos como búsqueda de productos, formularios o consultas de estado, usando su ventana de 32.768 tokens para mantener el contexto de páginas extensas.
- Agente de navegador con escalado a modelo mayor: integrado en `decido agent`, el modelo resuelve la mayoría de decisiones rutinarias y delega los pasos difíciles a Claude Opus 5.5, configuración medida en 61,2% sobre WebArena autoalojado frente al 37,0% de Claude solo.
- Extracción de información estructurada en portales: navegación guiada hasta la página objetivo y apertura de la misma, como en el ejemplo de encontrar el cable USB-C de 1 m más barato y abrir su ficha.
- Control de calidad de agentes existentes: al devolver probabilidades calibradas por opción, permite auditar decisiones de bajo margen y añadir revisión humana o escalado cuando la confianza cae por debajo de un umbral.
- Investigación sobre calibración en agentes: sirve como banco de pruebas para estudiar la relación entre confianza declarada y acierto en tareas de decisión secuencial sobre Mind2Web.
- Despliegue como servicio interno de decisión: el servidor `decido serve` expone un endpoint compatible con cualquier cliente de la API Jev, lo que permite conectar frameworks de automatización propios sin reentrenar el modelo.
- Evaluación de robustez ante contenido malicioso: su tratamiento del texto de página como datos no confiables lo hace adecuado para entornos donde las webs pueden contener instrucciones adversarias.

## Benchmarks y rendimiento

| Prueba | Decido-Web v2 (modelo solo) | v2 + Claude Opus 5.5 (`decido agent`) | Claude Opus 5.5 solo | Jev 1.14 |
|---|---:|---:|---:|---:|
| Webs públicas, 100 tareas cortas × 2 ejecuciones | 81,0% (reejecución: 79,5%) | 89,0% | 89,0% | 70,0% |
| Sitios WebArena autoalojados, 300 tareas nuevas × 2 ejecuciones | 11,0% | 61,2% | 37,0% | No ejecutado |
| Mind2Web, 1.500 pasos humanos (operación y elemento correctos) | 78,2% | – | – | 59,9% |
| Tiempo por decisión (1× A100, petición única, p50) | 525 ms | ~2,7 s | ~2,0 s | ~80 ms (API alojada) |

Notas de rendimiento: con el motor vLLM sobre 1× A100 se midió aproximadamente 0,9 s por paso en un conjunto mixto de 150 peticiones con páginas largas, frente a 2,6 s con el motor transformers por defecto; ambos motores coincidieron con la elección del modelo evaluado en al menos el 98,8% de las preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: pesos en bf16 de aproximadamente 52 GB, lo que requiere una GPU de 80 GB.
- GPU recomendadas: una NVIDIA A100 80 GB o H100 80 GB; el autor indica explícitamente una A100/H100 de 80 GB.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB en bf16; no se ha publicado build GGUF ni versión para CPU/portátil de este modelo.
- Opciones de despliegue: `decido serve` con motor vLLM (`--engine vllm`, ruta rápida) o con el motor transformers por defecto; el paquete `decido-ai` se instala con extras `[gpu]`, `[vllm]` o `[agent,vllm]`.
- Latencia: 525 ms por decisión (p50, 1× A100, petición única) con vLLM; aproximadamente 0,9 s por paso en tráfico mixto con páginas largas y 2,6 s con el motor transformers.
- El agente completo requiere además un modelo de texto auxiliar (se usó Qwen3-4B-Instruct-2507 servido con vLLM en el puerto 8092) y, en la configuración con escalado, una clave de API de Anthropic.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decido-Web v2 | 26B totales / ~4B activos | 32.768 tokens | 81,0% webs públicas; 78,2% Mind2Web; 11,0% WebArena | Apache 2.0 | Hugging Face, paquete `decido-ai` |
| Decido-Web v2-Fast | Basado en Qwen3-4B | No disponible | 0,2 s por paso (según el autor) | No disponible | Hugging Face |
| Jev 1.14 | No disponible | No disponible | 70,0% webs públicas; 59,9% Mind2Web; 80 ms por paso | No disponible | API alojada |
| Claude Opus 5.5 | No disponible | No disponible | 89,0% webs públicas; 37,0% WebArena; ~2,0 s por paso | Propietaria | API comercial |

La comparación directa con Claude Opus 5.5 en WebArena (11,0% frente a 37,0%) muestra que el modelo especializado solo rinde peor en ese conjunto, mientras que su combinación con escalado alcanza el 61,2%. En webs públicas y Mind2Web el modelo supera a Jev 1.14.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgos en la información disponible; al derivar de Gemma-4 y entrenarse sobre rollouts de un agente en inglés, puede heredar sesgos de la base y del dominio de navegación.
- Alucinación: el modelo no genera texto libre, pero puede seleccionar elementos inexistentes o emitir DONE prematuramente; la confianza calibrada ayuda a detectarlo, aunque no lo elimina.
- Idioma: solo se declara soporte de inglés, lo que limita su uso en páginas y tareas en castellano.
- Contexto: las páginas que superan 32.768 tokens se truncan por el final, de modo que el contenido final de páginas muy largas no se considera.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base Gemma-4-26B-A4B-it.
- Producción: requiere GPU de 80 GB en bf16 y no hay build GGUF/CPU; el rendimiento en WebArena autoalojado con el modelo solo (11,0%) es bajo, por lo que el autor recomienda la configuración con escalado para tareas complejas.
- Dependencia externa: la configuración "v2 + Claude" necesita clave de API de Anthropic y, según el autor, alrededor del 80% de los pasos van a Claude, con un coste próximo al de usar Claude solo.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card marca `inference: false`, lo que sugiere que la inferencia se realiza a través del paquete `decido-ai` y no directamente con transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-web-v2
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo predecesor: https://huggingface.co/decido-ai/decido-1-web-26b-a4b
- Variante rápida: https://huggingface.co/decido-ai/decido-web-v2-fast
- Agente Jev Ultrafast: https://github.com/browser-use/jev-ultrafast
- Modelo auxiliar de texto: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
