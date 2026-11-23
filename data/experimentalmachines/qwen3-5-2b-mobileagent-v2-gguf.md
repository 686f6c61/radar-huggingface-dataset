# experimentalmachines/Qwen3.5-2B-MobileAgent-v2-GGUF

## Resumen

Qwen3.5-2B-MobileAgent-v2-GGUF es la version cuantizada en formato GGUF del modelo experimentalmachines/Qwen3.5-2B-MobileAgent-v2, un modelo de vision-lenguaje de 1.881.825.088 parametros (aproximadamente 1.9 B) afinado especificamente para actuar como agente de interfaz grafica en telefonos Android. Lo desarrolla el usuario experimentalmachines y parte del modelo base Qwen/Qwen3.5-2B, sobre el que se ha realizado un ajuste fino orientado a la tarea de "mobile agent": dado un objetivo en ingles y una captura de pantalla, el modelo predice la siguiente accion sobre la interfaz.

La relevancia de esta publicacion es practica: el autor distribuye exactamente los ficheros GGUF con los que ejecuto sus evaluaciones, de modo que los resultados son reproducibles en llama.cpp. Incluye el modelo de lenguaje en cuantizacion Q4_K_M y un proyector de vision en F16 (mmproj), lo que permite servir el modelo multimodal con `llama-server` y una ventana de contexto de 8192 tokens.

Se trata de un modelo de investigacion, no de un producto listo para produccion: la model card advierte explicitamente de que no debe dejarse actuar de forma desatendida en un telefono con cuentas, mensajes o pagos reales. Su ambito es acotado (objetivos en ingles, una captura por paso, historial de texto de 8 pasos) y su licencia es Apache-2.0, heredada del modelo base Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) derivado de Qwen/Qwen3.5-2B; proyector de vision separado (mmproj) para llama.cpp |
| Parametros totales | 1.881.825.088 (aproximadamente 1.9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de servicio con `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y F16 (proyector de vision) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.5-2B) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un derivado multimodal de Qwen3.5-2B: un modelo de lenguaje transformer de aproximadamente 1.9 B de parametros al que se anade un proyector de vision que codifica las capturas de pantalla y las inyecta en el contexto del modelo de lenguaje. En la distribucion GGUF, el proyector se entrega como fichero independiente (`mmproj-Qwen3.5-2B-MobileAgent-v2-F16.gguf`), convertido desde el modelo fusionado y mantenido en F16, mientras que el modelo de lenguaje se cuantiza a Q4_K_M. Los ficheros se generaron con llama.cpp en el commit `cd959bae9`.

El ajuste fino se realizo exclusivamente sobre demostraciones grabadas: segun la model card, el modelo "nunca ha interactuado con un telefono real durante el entrenamiento". El formato de entrada es un objetivo en ingles mas una captura de pantalla por paso, y el modelo mantiene un historial de texto de 8 pasos como memoria. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Razonamiento visual sobre capturas de pantalla de interfaces Android (image-text-to-text).
- Prediccion de la siguiente accion de interfaz a partir de un objetivo en lenguaje natural y una captura.
- Seguimiento de un historial de texto de hasta 8 pasos para mantener coherencia en tareas multi-paso.
- Procesamiento de objetivos en ingles.
- Servicio conversacional mediante `llama-server` con soporte de proyector multimodal (`--mmproj`).
- Integracion en llama.cpp, lo que permite despliegue local y en dispositivos con recursos limitados.
- No se documentan en la informacion disponible capacidades de tool calling generico, agentes de codigo, matematicas avanzadas ni audio.

## Casos de uso

- Automatizacion de pruebas de interfaz en Android: el modelo puede predecir la secuencia de toques y entradas a partir de capturas, lo que permite generar scripts de prueba reproducibles sobre emuladores sin interaccion manual.
- Asistencia a usuarios con discapacidad motriz: dado un objetivo en ingles y la pantalla actual, el modelo sugiere la accion siguiente, que puede presentarse al usuario para confirmacion antes de ejecutarse.
- Investigacion en agentes GUI: sirve como linea base ligera (1.9 B, Q4_K_M) para comparar estrategias de percepcion-accion en entornos moviles dentro de un harness de evaluacion.
- Prototipado de flujos de onboarding: permite simular recorridos de usuario sobre una app (registro, navegacion, ajustes) y detectar pasos donde el agente se bloquea o elige acciones incorrectas.
- Despliegue en dispositivo: al caber en formato GGUF Q4_K_M y servirse con llama.cpp, puede ejecutarse en moviles de gama alta o en un servidor local para demos sin conexion.
- Educacion y divulgacion: ejemplo compacto y reproducible de un pipeline completo (datos de demostracion, ajuste fino multimodal, cuantizacion y evaluacion) publicado con codigo y resultados.
- Generacion de datos sinteticos de interaccion: las predicciones del modelo sobre capturas pueden usarse para anotar o aumentar datasets de trayectorias de agente, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del proyecto en `docs/results.md` del repositorio `experimentalmachines/lfm3-mobile-agent`, pero no se incluyen cifras concretas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1.9 GB; el modelo de lenguaje en Q4_K_M mas el proyector F16 requieren del orden de 2 a 3 GB de memoria, sin contar la cache KV para 8192 tokens (no se dispone de medida exacta en la informacion proporcionada).
- GPU recomendadas: no disponible en la informacion; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder alojarlo.
- Cabe en GPU consumer: si, previsiblemente en tarjetas de 4-8 GB (GTX 1650, RTX 3050, RTX 4060 y superiores); no se confirma con mediciones publicadas.
- Opciones de despliegue: llama.cpp mediante `llama-server -m Qwen3.5-2B-MobileAgent-v2-Q4_K_M.gguf --mmproj mmproj-Qwen3.5-2B-MobileAgent-v2-F16.gguf -c 8192`. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-MobileAgent-v2-GGUF (este) | 1.9 B | 8192 | imagen + texto | Apache-2.0 | GGUF |
| Qwen3.5-2B-MobileAgent-v2 (base del ajuste) | 1.9 B | no disponible | imagen + texto | Apache-2.0 | safetensors (no confirmado) |
| Qwen/Qwen3.5-2B (modelo original) | 1.9 B | no disponible | texto (sin ajuste de agente) | Apache-2.0 | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo de investigacion: la model card prohibe explicitamente dejarlo actuar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles; no hay soporte multilingue documentado.
- Procesa una unica captura de pantalla por paso y no tiene memoria mas alla del historial de texto de 8 pasos.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, por lo que puede fallar ante estados de interfaz no vistos.
- Riesgo de alucinacion en la prediccion de acciones: puede generar toques o entradas plausibles pero incorrectas sobre la interfaz.
- Sesgos: no se documentan sesgos especificos en la informacion disponible.
- Cuantizacion Q4_K_M: puede degradar ligeramente la precision respecto al modelo en precision completa; no se publican metricas de esa perdida.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales no detalladas en la informacion disponible.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-v2-GGUF
- Modelo base del ajuste: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-v2
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
