# experimentalmachines/LFM3-VL-2B-MobileAgent-v2-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v2-GGUF es la version cuantizada en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v2, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la actuacion como agente de interfaz grafica en telefonos moviles Android. El modelo parte de la familia LFM3-VL de Liquid AI, un modelo vision-lenguaje de aproximadamente 1.728 millones de parametros (1,73 B) que procesa capturas de pantalla junto con instrucciones en lenguaje natural para producir acciones sobre la interfaz.

La relevancia de esta publicacion radica en su enfoque practico: no se distribuye solo el modelo ajustado, sino exactamente los ficheros GGUF con los que el autor ejecuto sus evaluaciones, empleando llama.cpp con cuantizacion Q4_K_M para el modelo de lenguaje y Q8_0 para el proyector visual. Esto permite reproducir el comportamiento reportado en hardware modesto, incluido un telefono, que es precisamente el escenario de despliegue objetivo.

Se trata de un modelo de investigacion con licencia LFM Open License v1.0, entrenado exclusivamente con demostraciones grabadas y sin interaccion con telefonos reales durante el entrenamiento. Su ambito esta deliberadamente acotado: objetivos en ingles, una captura por paso y un historial de texto de ocho pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (modelo de lenguaje LFM3-VL-2B con proyector visual separado, formato llama.cpp) |
| Parametros totales | 1.728.801.600 (1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio documentada (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje), Q8_0 (proyector visual mmproj) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (F16 convertido y cuantizado con llama.cpp `cd959bae9`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del vision-lenguaje LFM3-VL-2B de Liquid AI, compuesto por un modelo de lenguaje LFM3-VL-2B y una torre de vision con su proyector multimodal. Segun la model card, el ajuste fino no modifico la torre de vision: el fichero `mmproj-LFM3-VL-2B-Q8_0.gguf` es identico al publicado por LiquidAI en LiquidAI/LFM3-VL-2B-GGUF. Por tanto, la adaptacion al dominio de agente movil recae sobre el modelo de lenguaje, que aprende a mapear capturas de pantalla mas instrucciones a acciones de interfaz.

El entrenamiento se realizo exclusivamente con demostraciones grabadas; el autor indica explicitamente que el modelo nunca interactuo con un telefono en vivo durante el entrenamiento. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF se hizo con `convert_hf_to_gguf.py` (F16) seguida de `llama-quantize Q4_K_M`, procedimiento que segun el autor reproduce el GGUF de la version v4 byte a byte.

## Capacidades

- Generacion de acciones de agente de interfaz grafica a partir de capturas de pantalla y objetivos en lenguaje natural.
- Comprension de imagen (screenshot) combinada con texto en un pipeline image-text-to-text.
- Razonamiento de un solo paso: se procesa una captura por paso.
- Mantenimiento de un historial de texto de hasta ocho pasos para dar continuidad a la tarea.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Soporte de conversacion multi-turno en el sentido del pipeline `conversational` declarado en los metadatos.
- Capacidad multilingue limitada al ingles.
- No se documentan en la informacion disponible capacidades de tool calling generico, audio ni modos de pensamiento extendido mas alla del formato de razonamiento indicado.

## Casos de uso

- Automatizacion de pruebas de interfaz en Android: el modelo puede recibir una captura de la pantalla de la aplicacion bajo prueba y generar la accion siguiente, integrandose en un arnes de pruebas que valide flujos de usuario de forma repetible sin intervencion manual.
- Asistencia a usuarios con discapacidad motriz: dado un objetivo en ingles y la captura de pantalla, el modelo propone la accion sobre la interfaz, permitiendo construir un asistente que guie o ejecute pasos sencillos en el telefono.
- Investigacion en agentes GUI: sirve como linea base reproducible (con los GGUF exactos de las evaluaciones) para comparar tecnicas de percepcion y actuacion sobre moviles en entornos academicos.
- Prototipado de automatizacion de tareas repetitivas en movil: tareas como navegar menus, rellenar formularios de prueba o localizar ajustes concretos pueden modelarse como secuencias de captura-accion dentro del limite de ocho pasos.
- Despliegue en el propio dispositivo: al caber en cuantizacion Q4_K_M dentro de un repo de 1,3 GB, permite experimentar con inferencia local en telefonos mediante llama.cpp, sin depender de la nube.
- Generacion de datos sinteticos de interaccion: las trayectorias propuestas por el modelo pueden servir para aumentar datasets de demostraciones de agentes moviles, siempre con revision humana dado su caracter de investigacion.
- Evaluacion de robustez de agentes: permite medir como degrada el rendimiento un agente de 1,73 B en tareas de interfaz con contexto limitado, como referencia para justificar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del proyecto en el repositorio de GitHub (docs/results.md), pero no se incluyen cifras concretas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo completo ocupa 1,3 GB; el modelo de lenguaje en Q4_K_M y el proyector visual en Q8_0 caben holgadamente en GPUs con 4 GB o mas de VRAM, y con `-ngl 99` se descargan todas las capas a GPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien A100 o H100 para servir multiples instancias, aunque el tamano del modelo no las requiere.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, y el objetivo declarado es su ejecucion en telefono Android.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` para el proyector visual; compatible con endpoints segun los metadatos (`endpoints_compatible`). No se documentan otras opciones como vLLM u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La configuracion de referencia usa `-np 1` (una sola peticion en paralelo), `-c 8192` y `--image-max-tokens 1024`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| experimentalmachines/LFM3-VL-2B-MobileAgent-v2-GGUF | 1,73 B | 8192 (config. de servicio) | en | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-VL-2B-GGUF (modelo base) | 1,73 B (mismo tamano) | no disponible | no disponible | LFM Open License v1.0 | GGUF |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v2 (sin cuantizar) | 1,73 B | no disponible | en | LFM Open License v1.0 | safetensors (pesos originales) |

La comparacion con alternativas de otros autores no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia es el ajuste fino para agente movil; frente a la version sin cuantizar, la diferencia es la cuantizacion Q4_K_M del modelo de lenguaje y Q8_0 del proyector visual.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe dejarse actuar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo objetivos en ingles; no se declara soporte de otros idiomas.
- Una unica captura de pantalla por paso, sin memoria mas alla del historial de texto de ocho pasos.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono en vivo durante el entrenamiento, lo que puede generar un desajuste con el comportamiento real de las aplicaciones.
- Riesgo de alucinacion en la identificacion de elementos de la interfaz y en la eleccion de acciones, especialmente en pantallas no vistas durante el entrenamiento.
- Licencia LFM Open License v1.0 (marcada como `other`): deben revisarse sus terminos antes de cualquier uso comercial, ya que no es una licencia de codigo abierto estandar.
- La torre de vision no fue ajustada, por lo que la adaptacion al dominio movil depende del modelo de lenguaje.
- Sin datos publicados de benchmarks en la informacion disponible, no es posible cuantificar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v2-GGUF
- Modelo base sin cuantizar: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v2
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
