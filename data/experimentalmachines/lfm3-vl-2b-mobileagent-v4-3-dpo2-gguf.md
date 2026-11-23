# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo2-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v4.3-dpo2-GGUF es la distribucion cuantizada en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo2, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la automatizacion de interfaces moviles (GUI agents). El modelo recibe una captura de pantalla y un objetivo en lenguaje natural, y emite la siguiente accion a ejecutar sobre el telefono. Es, por tanto, un modelo de tipo image-text-to-text con proposito muy especifico: control de dispositivos Android mediante instrucciones textuales.

El modelo parte de la familia LFM3-VL-2B de Liquid AI, con aproximadamente 1.730 millones de parametros totales, y ha sido ajustado por el autor (experimentalmachines) mediante demostraciones grabadas y una etapa posterior de DPO (la variante dpo2 del nombre). Esta publicacion concreta solo contiene los pesos cuantizados en Q4_K_M para su uso con llama.cpp, junto con el proyector visual (mmproj) sin modificar respecto al modelo original de LiquidAI.

Su relevancia es doble: por un lado, demuestra que un modelo de menos de 2.000 millones de parametros puede abordar tareas de agente GUI en movil con un contexto de 8.192 tokens; por otro, ofrece una receta reproducible (comandos exactos de conversion y cuantizacion) para desplegar el modelo en entornos con recursos limitados. Es un modelo de investigacion, no un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (LFM3-VL de Liquid AI), con torre visual y proyector multimodal |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuracion de servicio indicada por el autor) |
| Tipos de cuantizacion | Q4_K_M (LLM) y Q8_0 (proyector visual) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del LFM3-VL-2B de Liquid AI, un modelo vision-language de tipo transformer con una torre visual acoplada mediante un proyector multimodal. El ajuste realizado por experimentalmachines no toca la torre visual: el archivo mmproj-LFM3-VL-2B-Q8_0.gguf es identico al del modelo original de LiquidAI, por lo que toda la adaptacion recae sobre el modelo de lenguaje. El entrenamiento se realizo exclusivamente sobre demostraciones grabadas de interacciones con telefonos; segun el autor, el modelo nunca interactuo con un dispositivo real durante el entrenamiento. La variante dpo2 indica una etapa de optimizacion por preferencias (DPO) tras el ajuste supervisado.

La innovacion tecnica destacable no esta en la arquitectura, sino en el procedimiento de empaquetado y en el enfoque de tarea: el autor documenta la cadena exacta de conversion (`convert_hf_to_gguf.py` a F16 y posterior `llama-quantize Q4_K_M`) con el commit de llama.cpp `cd959bae9`, lo que permite reproducir el GGUF byte a byte. El formato de prompt y salida sigue el esquema deepseek (`--reasoning-format deepseek`), y el modelo opera con una captura de pantalla por paso y un historial de texto de hasta 8 pasos.

## Capacidades

- Generacion de acciones de agente GUI a partir de una captura de pantalla y un objetivo en lenguaje natural.
- Comprension de imagenes de interfaz (screenshots) para localizar elementos y decidir la siguiente interaccion.
- Razonamiento de un solo paso: el modelo no mantiene memoria mas alla de los 8 pasos de historial de texto configurados.
- Formato de salida compatible con el esquema de razonamiento deepseek, lo que facilita su integracion en pipelines de agentes.
- Capacidad conversacional (tag `conversational`) y de image-text-to-text.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles; no se documentan otros idiomas.
- Capacidades de audio o vision mas alla de screenshots: no disponibles.

## Casos de uso

- Automatizacion de pruebas de interfaz en Android: el modelo puede recibir una captura de pantalla de la app y un objetivo ("abrir ajustes y desactivar notificaciones") y emitir la accion correspondiente, lo que permite generar scripts de prueba reproducibles sin escribir localizadores manuales.
- Investigacion en agentes GUI: sirve como linea base ligera (menos de 2 B de parametros) para comparar estrategias de prompting, historial y politicas de accion en entornos simulados.
- Prototipado de asistentes de accesibilidad: con un contexto de 8.192 tokens y una captura por paso, puede sugerir acciones a usuarios con dificultades motoras en tareas acotadas, siempre con supervision humana.
- Generacion de datos sinteticos de interaccion: el modelo puede etiquetar capturas de pantalla con la accion esperada, alimentando pipelines de entrenamiento de agentes mayores.
- Despliegue en dispositivos de bajos recursos: al ser Q4_K_M y pesar aproximadamente 1,3 GB en el repositorio, cabe en telefonos de gama media y en equipos sin GPU dedicada mediante llama.cpp.
- Evaluacion de robustez de interfaces: ejecutar el modelo contra distintas versiones de una misma pantalla para detectar cambios que rompan los flujos automatizados.
- Docencia y demostraciones: su tamano reducido y su receta de conversion reproducible lo hacen util para explicar el ciclo completo de un agente multimodal (captura, decision, accion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del proyecto en `docs/results.md`, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K ni metricas especificas de agentes GUI) en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con cuantizacion Q4_K_M del LLM mas el proyector visual Q8_0; el repositorio completo ocupa 1,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas de consumo, e incluso en telefonos Android de gama media (tag `android`).
- Opciones de despliegue: llama.cpp mediante `llama-server` con los flags documentados (`-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`). No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.3-dpo2 (este) | ~1,73 B | 8.192 tokens | LFM Open License v1.0 | Agente GUI movil, ingles |
| LiquidAI/LFM3-VL-2B | no disponible en la informacion | no disponible en la informacion | LFM Open License v1.0 | Vision-language generalista |
| Otros modelos de agente GUI de tamano similar | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas especificas de agente GUI no puede completarse con los datos proporcionados; el unico punto de referencia solido es el modelo base de LiquidAI, del que este hereda arquitectura, torre visual y licencia.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe dejarse actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles; no se documenta soporte de castellano ni de otros idiomas.
- Una captura de pantalla por paso y memoria limitada a 8 pasos de historial de texto: no puede planificar secuencias largas ni recordar acciones anteriores mas alla de esa ventana.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede provocar comportamientos erroneos ante estados de interfaz no vistos.
- Riesgo de alucinacion en la identificacion de elementos de la pantalla y en la eleccion de acciones; requiere validacion en produccion.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Sin resultados de benchmarks publicados que permitan estimar su fiabilidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo2-GGUF
- Modelo base (no cuantizado): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.3-dpo2
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
