# experimentalmachines/Qwen3.5-0.8B-MobileAgent-v1-GGUF

## Resumen

Qwen3.5-0.8B-MobileAgent-v1-GGUF es la version cuantizada en formato GGUF de un modelo multimodal (image-text-to-text) especializado en actuar como agente de interfaz grafica en telefonos Android. Lo publica el usuario experimentalmachines y deriva de su propio modelo base Qwen3.5-0.8B-MobileAgent-v1, a su vez construido sobre el modelo Qwen3.5-0.8B de Alibaba. El modelo recibe una captura de pantalla y un objetivo en ingles, y produce la siguiente accion sobre la pantalla (toques, deslizamientos, texto), resolviendo el problema de automatizar tareas moviles mediante instrucciones en lenguaje natural.

La relevancia tecnica esta en su tamano: con 752.393.024 parametros totales (aproximadamente 0,8 mil millones) y una cuantizacion Q4_K_M, esta disenado para ejecutarse en hardware de movil mediante llama.cpp, algo poco habitual en el espacio de agentes GUI, dominado por modelos mucho mayores. El repositorio GGUF ocupa 0,7 GB e incluye el modelo de lenguaje cuantizado a 4 bits y un proyector de vision en F16 separado.

Se trata de un modelo de investigacion, no de un producto listo para produccion: el autor advierte explicitamente de que no debe operar de forma desatendida en un telefono con cuentas, mensajes o pagos reales. La licencia es Apache-2.0, heredada de Qwen3.5-0.8B, y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con proyector de vision; pesos en formato GGUF para llama.cpp |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de servicio (`-c 8192`); no se especifica el maximo nativo |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); F16 (proyector de vision) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (modelo principal + `mmproj` separado) |

## Arquitectura y entrenamiento

El modelo es una adaptacion de Qwen3.5-0.8B, un transformer de aproximadamente 0,8 mil millones de parametros, al que se anade un proyector de vision para procesar capturas de pantalla. La publicacion GGUF incluye dos ficheros: el modelo de lenguaje cuantizado a Q4_K_M y el proyector de vision convertido a F16 desde el modelo fusionado (merged model). La conversion se realizo con llama.cpp en el commit `cd959bae9`.

El entrenamiento se baso exclusivamente en demostraciones grabadas: segun la model card, el modelo "nunca ha interactuado con un telefono real durante el entrenamiento". El historial de contexto se limita a 8 pasos de texto, con una captura de pantalla por paso, sin memoria mas alla de esa ventana. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El codigo, los constructores de datos y los arneses de evaluacion estan publicos en el repositorio `experimentalmachines/lfm3-mobile-agent`.

## Capacidades

- Comprension de capturas de pantalla: interpreta la interfaz renderizada de una app Android a partir de una imagen.
- Generacion de acciones GUI: produce la siguiente accion (toque, deslizamiento, entrada de texto) dado un objetivo en ingles.
- Razonamiento de un solo paso con historial corto: mantiene un historial de hasta 8 pasos de texto para encadenar acciones.
- Procesamiento multimodal image-text-to-text: combina la imagen de pantalla con la instruccion textual.
- Conversacional: etiquetado como `conversational` y compatible con endpoints.
- No se documentan capacidades de tool calling, function calling, codigo, matematicas avanzadas ni audio.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo puede generar secuencias de acciones sobre capturas de pantalla para validar flujos de la app, integrandose en un arnes de pruebas que ejecute las acciones en un emulador.
- Prototipado de asistentes de accesibilidad: dado su tamano reducido y su despliegue via llama.cpp, permite experimentar con navegacion guiada por voz o texto en dispositivos de gama baja.
- Investigacion en agentes GUI de bajo coste: sirve como linea base reproducible (con codigo y resultados publicos) para comparar estrategias de agentes moviles con modelos mas grandes.
- Demos on-device: su cuantizacion Q4_K_M y los 0,7 GB del repositorio permiten ejecutarlo en un telefono o en una maquina modesta para demostraciones de automatizacion de tareas.
- Generacion de datos sinteticos de interaccion: puede usarse para etiquetar o proponer acciones sobre capturas de pantalla en pipelines de aumento de datos.
- Educacion y experimentacion: util para estudiar como un modelo de menos de mil millones de parametros aborda la comprension de pantallas y la planificacion de acciones de un solo paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del proyecto en `experimentalmachines/lfm3-mobile-agent` (`docs/results.md`), pero no se incluyen cifras concretas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de lenguaje en Q4_K_M ronda los 0,5 GB y el proyector de vision en F16 anade una cantidad adicional pequena; el repositorio completo ocupa 0,7 GB, por lo que la huella total es inferior a 1 GB en memoria, mas el espacio de contexto.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) lo ejecuta con holgura, y tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual, e incluso en CPU y en dispositivos moviles mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj` para el proyector de vision), y cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-MobileAgent-v1-GGUF (este) | 752.393.024 | 8192 en ejemplo de servicio | en | apache-2.0 | GGUF |
| Qwen3.5-0.8B (base) | no disponible | no disponible | no disponible | apache-2.0 | safetensors (segun modelo base) |
| Qwen3.5-0.8B-MobileAgent-v1 (modelo base sin cuantizar) | no disponible | no disponible | en | apache-2.0 | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo de investigacion: el autor prohibe explicitamente dejarlo actuar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles y una unica captura de pantalla por paso.
- Memoria limitada a un historial de 8 pasos de texto; no hay memoria mas alla de esa ventana.
- Entrenado solo con demostraciones grabadas, nunca con interaccion real en un telefono, lo que puede provocar un comportamiento fragil ante estados de UI no vistos.
- Riesgo de alucinacion en la identificacion de elementos de pantalla y en la eleccion de acciones.
- No se documentan sesgos especificos, pero al derivar de Qwen3.5-0.8B puede heredar los del modelo base.
- Uso comercial permitido por Apache-2.0, pero sin garantias y con la advertencia de seguridad del autor.
- Al ser una cuantizacion Q4_K_M, puede haber una perdida de precision respecto al modelo base sin cuantizar.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/experimentalmachines/Qwen3.5-0.8B-MobileAgent-v1-GGUF
- Modelo base sin cuantizar: https://huggingface.co/experimentalmachines/Qwen3.5-0.8B-MobileAgent-v1
- Modelo Qwen3.5-0.8B original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
