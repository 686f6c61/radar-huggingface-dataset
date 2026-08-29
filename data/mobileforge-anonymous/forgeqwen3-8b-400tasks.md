# mobileforge-anonymous/ForgeQwen3-8B-400tasks

## Resumen

ForgeQwen3-8B-400tasks es un modelo de visión-lenguaje (VLM) especializado en la interacción con interfaces gráficas móviles (GUI), desarrollado como parte de un envío anónimo a la conferencia ICLR. Se trata de una adaptación del modelo base Qwen/Qwen3-VL-8B-Instruct mediante el método MobileForge, que permite ajustar el comportamiento de un agente de GUI sin necesidad de tareas escritas por humanos, demostraciones ni etiquetas de recompensa. El modelo ha sido entrenado sobre 400 tareas de aplicaciones objetivo generadas automáticamente, utilizando los propios rollouts del policy, feedback crítico jerárquico, pistas correctivas y optimización GRPO por pasos contextualizada con pistas.

La relevancia de este modelo radica en su enfoque de adaptación sin anotaciones para agentes de GUI móvil, un área donde los métodos tradicionales requieren costosos conjuntos de datos etiquetados. Con 8.767 millones de parámetros, el modelo mantiene la arquitectura multimodal de Qwen3-VL-8B-Instruct, capaz de procesar imágenes de pantalla y generar acciones de interfaz. En la evaluación sobre AndroidWorld (116 tareas), alcanza un 52,6% de éxito en el primer intento (Pass@1), un 59,5% en el segundo y un 62,9% en el tercero. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors con precisión BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-8B-Instruct (transformer multimodal con encoder de vision) |
| Parametros totales | 8.767.123.696 (8,77 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo BF16 (safetensors); no se publican cuantizaciones adicionales |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-VL-8B-Instruct, un transformer multimodal que combina un codificador de vision con un decodificador de lenguaje, diseñado para tareas de comprensión de imagenes y generacion de texto. Sobre esta base, MobileForge aplica un proceso de adaptacion sin anotaciones: el policy genera sus propios rollouts interactuando con aplicaciones moviles, un critic jerarquico evalua esas interacciones, se generan pistas correctivas y se actualiza el modelo mediante GRPO (Group Relative Policy Optimization) por pasos, contextualizado con las pistas. No se utilizan tareas escritas por humanos, demostraciones ni etiquetas de recompensa. El entrenamiento se realizo sobre 400 tareas de aplicaciones objetivo generadas automaticamente, aunque no se especifica el numero total de tokens ni la composicion del dataset.

## Capacidades

- Comprension de imagenes de pantalla de aplicaciones moviles (capturas de pantalla, layouts, elementos de interfaz).
- Generacion de acciones de GUI (toques, deslizamientos, introduccion de texto, navegacion entre pantallas).
- Razonamiento multimodal para interpretar el estado de la interfaz y decidir el siguiente paso.
- Conversacion multimodal basica, heredada del modelo base Qwen3-VL-8B-Instruct.
- Especializacion en tareas de automatizacion de apps, con capacidad de ejecutar secuencias de acciones multi-paso.
- No se documenta soporte explicito de tool calling ni function calling, aunque el modelo puede actuar como agente de GUI.

## Casos de uso

- Automatizacion de pruebas de aplicaciones moviles: el modelo puede recorrer flujos de usuario en una app, detectar elementos de interfaz y ejecutar acciones, lo que permite generar pruebas de humo o regresion sin escribir scripts manuales.
- Asistente de accesibilidad: puede interpretar la pantalla y sugerir o ejecutar acciones para usuarios con discapacidad visual, navegando por la interfaz mediante comandos de voz.
- Agente de automatizacion de tareas en el telefono: por ejemplo, rellenar formularios, configurar ajustes o completar compras en una app, actuando como un asistente personal que interactua con la GUI.
- Evaluacion de usabilidad: el modelo puede explorar una app de forma autonoma y reportar si encuentra errores de navegacion o elementos inaccesibles, basandose en su capacidad de razonamiento multimodal.
- Generacion de datos de entrenamiento para otros agentes: al ejecutar tareas en apps, puede producir trazas de interaccion que sirvan para entrenar o evaluar otros modelos de GUI.
- Investigacion en aprendizaje por refuerzo para agentes de GUI: su metodo de entrenamiento sin anotaciones lo convierte en un punto de partida para estudiar tecnicas de adaptacion con feedback jerarquico.

## Benchmarks y rendimiento

El modelo fue evaluado en AndroidWorld, un benchmark de 116 tareas de interaccion con aplicaciones moviles. Los resultados publicados son:

| Metrica | Resultado |
|---|---|
| Pass@1 | 61/116 (52,6%) |
| Pass@2 | 69/116 (59,5%) |
| Pass@3 | 73/116 (62,9%) |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 17,5 GB (8,77 B parametros × 2 bytes). Se requiere al menos 20 GB de VRAM para cargar los pesos completos sin cuantizacion.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ejecutar el modelo en BF16. Para mayor margen, una A100 de 40 GB o 80 GB es adecuada. En GPUs con menos VRAM (por ejemplo, 16 GB) seria necesario aplicar cuantizacion, pero no se publican versiones cuantizadas oficiales.
- Opciones de despliegue: al ser un modelo basado en transformers, es compatible con la libreria transformers de Hugging Face. Tambien puede desplegarse con vLLM o TGI si estos soportan la arquitectura Qwen3-VL, aunque no se confirma explicitamente. Para entornos locales, se podria convertir a GGUF con llama.cpp, pero no hay versiones precompiladas.
- Latencia y throughput: no se proporcionan datos especificos. Como referencia, un modelo de 8B en BF16 en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero depende de la longitud de la secuencia y del hardware.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (agentes de GUI movil basados en VLM). El modelo base Qwen3-VL-8B-Instruct podria considerarse una alternativa, pero no se publican sus resultados en AndroidWorld. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo puede ejecutar acciones de GUI incorrectas o inseguras; la model card advierte explicitamente que debe ejecutarse solo en entornos de prueba aislados y que las acciones deben inspeccionarse antes de usarlas con datos personales.
- Al ser un artifact de envio anonimo, no se dispone de informacion sobre sesgos, alucinaciones o comportamiento fuera del dominio de GUI movil.
- La especializacion en tareas de GUI movil limita su utilidad en otros dominios de vision-lenguaje general.
- No se documentan cuantizaciones alternativas, lo que puede dificultar su despliegue en hardware con poca VRAM.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3-VL-8B-Instruct, se deben respetar las condiciones de la licencia del modelo base (Apache 2.0 tambien, segun la informacion disponible).
- No hay informacion sobre la longitud de contexto soportada, lo que puede afectar a tareas que requieran historiales largos de interaccion.

## Enlaces

- Repositorio HuggingFace original: https://huggingface.co/mobileforge-anonymous/ForgeQwen3-8B-400tasks
- Mirror en HuggingFace (lgy0404): https://huggingface.co/lgy0404/ForgeQwen3-8B-400tasks
- Pagina del proyecto anonimo: https://mobileforge-anonymous.github.io/
- Repositorio de codigo (GitHub): https://github.com/mobileforge-anonymous/MobileForge
- Dataset de resultados de benchmark: https://huggingface.co/datasets/mobileforge-anonymous/mobileforge-benchmark-results
- Repositorio oficial de MobileForge (kwai): https://github.com/kwai/MobileForge
- Documentacion de modelos de MobileForge: https://github.com/kwai/MobileForge/blob/main/docs/models.md
