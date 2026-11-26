# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes-GGUF es una compilacion en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la actuacion como agente de interfaz grafica en telefonos moviles (mobile GUI agent). El modelo recibe como entrada una captura de pantalla y un objetivo en ingles, y produce la siguiente accion a ejecutar sobre la pantalla. Esta publicado por el usuario experimentalmachines y deriva del modelo LFM3-VL-2B de Liquid AI, de aproximadamente 1.730 millones de parametros.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso muy concreto (automatizacion de interacciones en Android a partir de capturas de pantalla); por otro, el propio autor lo marca explicitamente como checkpoint de desarrollo, conservado unicamente para reproducir resultados y no recomendado para uso general. Para produccion, el autor remite a la variante LFM3-VL-2B-MobileAgent.

El repositorio ocupa 1,3 GB e incluye dos ficheros: el modelo de lenguaje cuantizado en Q4_K_M y el proyector de vision en Q8_0, heredado sin cambios del modelo base de LiquidAI. El modelo esta pensado para ejecutarse con llama.cpp (llama-server) y esta etiquetado para Android, aunque los requisitos de despliegue en dispositivo no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL-2B de Liquid AI; vision-language con proyector de vision separado) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 8192 tokens (configuracion de servicio indicada por el autor: `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje), Q8_0 (proyector de vision) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LFM3-VL-2B de Liquid AI; lo que si consta es que se trata de un modelo vision-language con un proyector de vision independiente (mmproj), que en esta compilacion se mantiene sin cambios respecto al modelo original de LiquidAI porque el ajuste fino no toco el vision tower. El modelo de lenguaje se convirtio a GGUF mediante `convert_hf_to_gguf.py` (F16) y posteriormente se cuantizo a Q4_K_M con `llama-quantize`, usando llama.cpp en el commit `cd959bae9`.

Respecto al entrenamiento del ajuste fino, el autor indica que el modelo se entreno exclusivamente con demostraciones grabadas y que nunca interactuo con un telefono real durante el entrenamiento. El nombre del checkpoint (DPOStopMistakes) sugiere una etapa de optimizacion por preferencias (DPO) orientada a reducir errores, aunque la informacion disponible no detalla el dataset, el numero de tokens ni la composicion de las preferencias. El formato de prompt y salida se documenta en la model card del modelo base no cuantizado.

## Capacidades

- Generacion de acciones para agentes de interfaz grafica movil: dado un objetivo en ingles y una captura de pantalla, produce la siguiente accion sobre la pantalla.
- Procesamiento de imagen-texto (pipeline image-text-to-text): entrada multimodal con una captura por paso.
- Razonamiento multi-paso limitado: mantiene un historial de texto de hasta 8 pasos, sin memoria mas alla de ese historial.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama-server.
- Conversacional (tag `conversational`).
- Soporte multilingue: solo ingles (los objetivos deben formularse en ingles).
- No consta soporte de tool calling, function calling, audio ni otras capacidades especiales en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos: el proposito declarado del checkpoint es permitir reproducir los resultados de las evaluaciones del proyecto; se usaria con la misma configuracion de llama-server documentada por el autor.
- Investigacion en agentes GUI moviles: serviria como linea base para comparar tecnicas de ajuste fino y DPO sobre LFM3-VL-2B en tareas de navegacion de pantallas.
- Pruebas de pipeline multimodal en llama.cpp: permite validar el flujo completo (modelo de lenguaje Q4_K_M mas proyector de vision Q8_0) en entornos de desarrollo antes de pasar a la variante recomendada.
- Evaluacion de cuantizacion: al ser una compilacion Q4_K_M con proyector Q8_0, es util para medir la degradacion de calidad frente al modelo en precision completa.
- Desarrollo de arneses de benchmark: el repositorio del proyecto incluye benchmark harnesses que pueden ejecutarse contra este checkpoint para validar la infraestructura de evaluacion.
- Prototipado de automatizacion de tareas en Android en entorno controlado: con supervisión humana y cuentas de prueba, para explorar la viabilidad de agentes que actuan sobre capturas de pantalla.
- Docencia y demostraciones: por su tamano (1,3 GB) y formato GGUF, es manejable para mostrar el funcionamiento de un agente multimodal en charlas o laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la documentacion de resultados del proyecto (docs/results.md) para consultar las metricas con su fuente, pero los valores concretos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.728.801.600 parametros en Q4_K_M, el modelo de lenguaje ronda los 1 GB y el proyector de vision Q8_0 anade una cantidad no especificada. El repo completo ocupa 1,3 GB.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por tamano, el modelo es candidato a ejecutarse en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con la configuracion documentada por el autor: `-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`.
- Latencia y throughput: no disponible.
- Etiqueta de plataforma: android (segun tags del repositorio), aunque los requisitos concretos en dispositivo no se detallan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes-GGUF (este) | 1.728.801.600 | 8192 tokens (config. de servicio) | GGUF (Q4_K_M + mmproj Q8_0) | lfm1.0 | Checkpoint de desarrollo, no recomendado |
| experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes | no disponible | no disponible | safetensors (segun dato real de parametros) | lfm1.0 | Modelo base del que deriva esta cuantizacion |
| experimentalmachines/LFM3-VL-2B-MobileAgent | no disponible | no disponible | no disponible | lfm1.0 | Variante recomendada por el autor para uso general |
| LiquidAI/LFM3-VL-2B | no disponible | no disponible | no disponible | lfm1.0 | Modelo original de Liquid AI |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe dejarse actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Checkpoint de desarrollo: conservado solo para reproducir resultados y marcado como no recomendado; para uso general se remite a LFM3-VL-2B-MobileAgent.
- Solo acepta objetivos en ingles y una unica captura de pantalla por paso.
- Memoria limitada: no conserva contexto mas alla del historial de texto de 8 pasos.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede generar un desajuste con el comportamiento real de las aplicaciones.
- Riesgo de alucinacion y de acciones incorrectas sobre la interfaz no cuantificado en la informacion disponible.
- Licencia LFM Open License v1.0: es necesario revisar el fichero LICENSE para conocer las restricciones exactas de uso comercial, ya que la informacion disponible no detalla sus terminos.
- Sesgos conocidos: no disponible.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes-GGUF
- Modelo base no cuantizado: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes
- Variante recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Documentacion de resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
