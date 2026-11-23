# experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1-GGUF

## Resumen

LFM2.5-VL-450M-MobileAgent-v1-GGUF es la distribucion en formato GGUF del modelo experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1, un modelo de vision-lenguaje de pequeno tamano (354.483.968 parametros reales segun safetensors) afinado especificamente para actuar como agente de interfaz grafica en telefonos moviles. Lo publica el usuario experimentalmachines como derivado cuantizado del modelo base LiquidAI/LFM2.5-VL-450M, sobre el que se ha realizado un fine-tuning orientado a tareas de mobile-agent: interpretar capturas de pantalla y decidir la siguiente accion sobre la UI.

El modelo resuelve el problema de automatizacion de interacciones en Android mediante un bucle de percepcion-accion: recibe una captura de pantalla y un objetivo en ingles, y produce una accion (toque, deslizamiento, escritura, etc.) que se ejecuta en el dispositivo. Su relevancia radica en el tamano reducido (clase 450M), que lo hace desplegable en hardware movil o en servidores modestos, y en que se distribuye en GGUF Q4_K_M con un proyector visual Q8_0, listo para llama.cpp.

La ficha se centra en la version GGUF, que es la que el autor empleo en sus evaluaciones. La informacion disponible es limitada: la model card es escueta y no publica resultados de benchmarks numericos en la propia pagina de Hugging Face, remitiendo al repositorio de GitHub del proyecto para resultados y detalles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (image-text-to-text) basada en LiquidAI/LFM2.5-VL-450M; transformer multimodal con proyector visual |
| Parametros totales | 354.483.968 (dato real de safetensors); clase 450M |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (valor usado en el comando de servicio con `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); Q8_0 (proyector visual `mmproj`) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0, heredada de LiquidAI/LFM2.5-VL-450M) |
| Formato de pesos | GGUF (llama.cpp, build `cd959bae9`); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-VL-450M, un modelo multimodal de vision-lenguaje de la familia LFM2.5 de LiquidAI. La version aqui descrita es un fine-tuning realizado por experimentalmachines sobre ese base, orientado a tareas de agente de GUI movil. El fine-tuning se entreno exclusivamente con demostraciones grabadas (recorded demonstrations), es decir, con trazas de interacciones reales capturadas y no mediante interaccion en vivo con un telefono durante el entrenamiento, segun indica la model card.

La distribucion GGUF incluye dos ficheros: el modelo de lenguaje cuantizado a 4 bits (Q4_K_M) y el proyector visual del modelo base en Q8_0, que el autor senala como no modificado por el fine-tuning. El comando de servicio documentado es `llama-server -m ...Q4_K_M.gguf --mmproj mmproj-...Q8_0.gguf -c 8192`. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagenes (image-text-to-text).
- Interpretacion de capturas de pantalla de interfaces moviles (screenshot understanding).
- Prediccion de acciones de agente de GUI: toques, deslizamientos, entrada de texto y otras operaciones sobre la UI.
- Bucle de agente multi-paso: la model card menciona una "8-step text history", es decir, memoria limitada a los ultimos 8 pasos en texto.
- Procesamiento de un objetivo en ingles junto a una captura por paso.
- Soporte conversacional (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues limitadas al ingles (tag `language: en`).
- No se documentan en la informacion disponible capacidades de tool calling generico, audio ni thinking mode.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo puede recibir capturas de pantalla de una app y predecir la siguiente accion para recorrer flujos de prueba, integrandose en un harness de testing que ejecute las acciones sobre un emulador o dispositivo.
- Asistencia a usuarios con movilidad reducida: dado un objetivo en ingles y una captura, sugerir la accion a realizar en pantalla, con supervision humana obligatoria dado el caracter de modelo de investigacion.
- Prototipado de agentes de GUI en investigacion: servir como modelo de referencia de 450M para comparar estrategias de percepcion-accion en entornos moviles, gracias a su reducido tamano y despliegue en llama.cpp.
- Despliegue en hardware de bajos recursos: al estar cuantizado a Q4_K_M y ocupar el repo 0.3 GB, puede ejecutarse en dispositivos con poca memoria o en servidores modestos para experimentacion.
- Generacion de datos sinteticos de interaccion: usar el modelo para etiquetar capturas con acciones propuestas y ampliar datasets de entrenamiento de agentes moviles.
- Educacion y demostraciones: ilustrar el funcionamiento de un agente multimodal de extremo a extremo en un telefono, mostrando percepcion, decision y accion con un modelo pequeno.
- Investigacion sobre memoria de corto plazo en agentes: el limite de 8 pasos de historial permite estudiar el impacto de la ventana de contexto en tareas de GUI de varios pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de GitHub del proyecto (docs/results.md) para los resultados, pero no incluye cifras en la pagina de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF ocupa 0.3 GB; con cuantizacion Q4_K_M del modelo de lenguaje y proyector Q8_0, la huella de pesos es del orden de unos cientos de MB, mas el espacio para contexto (hasta 8192 tokens). No se dispone de mediciones exactas de VRAM en la informacion disponible.
- GPU recomendadas: no disponible de forma especifica; por tamano, cabe en GPUs consumer de gama baja e incluso en CPU.
- Cabe en consumer GPU: si, por el tamano de clase 450M; tambien es viable en CPU y potencialmente en dispositivos moviles.
- Opciones de despliegue: llama.cpp (via `llama-server` con `--mmproj`), y por extension herramientas compatibles con GGUF como Ollama (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1-GGUF (este) | ~354M | 8192 | en | lfm1.0 | GGUF |
| LiquidAI/LFM2.5-VL-450M (base) | clase 450M | no disponible | no disponible | lfm1.0 | safetensors (no confirmado) |
| experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1 (base del GGUF) | ~354M | no disponible | en | lfm1.0 | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre estos modelos ni con alternativas de otros autores; la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo de investigacion: la model card advierte explicitamente de no dejarlo actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles y una unica captura de pantalla por paso.
- Memoria limitada: el historial de texto se restringe a 8 pasos, lo que limita tareas de GUI largas o con dependencias lejanas.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono en vivo durante el entrenamiento, lo que puede provocar un desajuste con el comportamiento real de las apps.
- Riesgo de alucinacion en la prediccion de acciones o en la interpretacion de elementos de la UI no vistos en el entrenamiento.
- Sesgos: no documentados en la informacion disponible; al entrenarse con demostraciones, puede heredar sesgos de las trazas recogidas.
- Licencia LFM Open License v1.0 (lfm1.0, marcada como "other"): es necesario revisar el fichero LICENSE para conocer las restricciones de uso comercial, que no se detallan en la informacion disponible.
- Cero descargas y un solo "like" en el momento de la consulta: modelo muy reciente y sin validacion comunitaria amplia.
- Idiomas: solo ingles; no apto para objetivos en castellano sin adaptacion.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1-GGUF
- Modelo base del fine-tuning: https://huggingface.co/experimentalmachines/LFM2.5-VL-450M-MobileAgent-v1
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Licencia LFM Open License v1.0: fichero LICENSE en el repositorio del modelo
