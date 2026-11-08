# MOHDMUBASHIR/team15-qwen3.5-2b-rescue-mission-lora

## Resumen

Team-15 Rescue Mission LoRA es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por el equipo Team-15 para el hackathon CodeMetal Forge (noviembre de 2026). Su funcion es convertir el modelo base en un asistente de mision de solo lectura y caracter consultivo para un pequeno robot terrestre de busqueda y rescate. En cada paso de la mision, el adaptador propone la siguiente accion como JSON: o bien una solicitud de herramienta, o bien una recomendacion final, que despues es validada por una puerta de seguridad determinista.

El modelo base Qwen3.5-2B emplea una arquitectura hibrida con 6 capas de atencion completa y 18 capas de atencion lineal Gated-DeltaNet, ademas de un codificador de vision, y se empaqueta como `Qwen3_5ForConditionalGeneration`. El adaptador entrena unicamente los modulos del modelo de lenguaje (atencion completa, DeltaNet y MLP), dejando congelados el torre de vision y el merger. El adaptador tiene 15,63 millones de parametros en 300 tensores, con rango r=16, alpha=32 y dropout 0,05.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy acotado de IA aplicada a robotica de rescate con un diseno explicito de seguridad (el modelo no tiene autoridad sobre motores, pinza, parada de emergencia ni confirmacion de personas); por otro lado, sirve como ejemplo de evaluacion rigurosa de un adaptador pequeno con benchmarks congelados, intervalos de confianza de Wilson y analisis de fallos. La licencia es Apache-2.0, igual que el modelo base, y el idioma declarado es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 6 capas de atencion completa + 18 capas de atencion lineal Gated-DeltaNet, mas codificador de vision (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | No disponible para el adaptador; el adaptador LoRA tiene 15,63 M de parametros (300 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); los pesos base no se incluyen en el repositorio |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-2B, un modelo hibrido que combina capas de atencion completa con capas de atencion lineal Gated-DeltaNet y un codificador de vision. Los modulos objetivo del LoRA son `q_proj`, `k_proj`, `v_proj` y `o_proj` en las capas de atencion completa; `in_proj_qkv`, `in_proj_z` y `out_proj` en las capas DeltaNet; y `gate_proj`, `up_proj` y `down_proj` en el MLP. El torre de vision y el merger permanecen congelados. El entrenamiento se realizo con PEFT 0.21.2, transformers 5.22.2 y PyTorch 2.12 sobre Apple MPS con base en bf16.

Los datos de entrenamiento (`rescue-lora-v0.2`) constan de 707 registros, de los cuales se entrenaron 689 (18 registros demasiado largos fueron descartados, todos ellos elementos de recomendacion). La composicion es: 617 ejemplos de pasos de herramienta de mision, 47 recomendaciones de fusion de sensores, 27 recomendaciones de avistamiento y 16 recomendaciones de imagen (de las que se entrenaron 7). Los pasos de herramienta y las recomendaciones son sinteticos, generados por una politica docente determinista sobre misiones simuladas (sectores, lecturas de rango, estados de movimiento, rutas bloqueadas, timeouts de sensores y decisiones del operador). Las imagenes son 16 fotogramas publicos del dataset Co-GLANCE (CC BY 4.0), de los que se entrenaron 7; no se usaron imagenes de equipos, transeuntes ni camaras privadas. El ajuste fue supervisado con perdida solo en los tokens del asistente: 1 epoca, 89 pasos de optimizador (acumulacion de gradiente 8), tasa de aprendizaje 1e-4, semilla 7, longitud maxima de 2.400 tokens, con checkpointing de gradiente, en aproximadamente 78 minutos en un solo Mac con Apple Silicon. La seleccion del checkpoint se hizo solo sobre validacion (no sobre test): mayor exactitud de paso en validacion entre los checkpoints que no eran menos seguros que el modelo base; el ckpt-0088 obtuvo 97/102 en validacion con 0 solicitudes de movimiento inseguras.

## Capacidades

- Generacion de texto y razonamiento de mision: produce el siguiente paso como JSON (`{"step":"TOOL_CALL","tool":"...","args":{...}}` o una recomendacion `FINAL`).
- Uso de herramientas (tool calling) acotado al contrato de herramientas del robot de rescate.
- Razonamiento multi-paso sobre el historial de la mision: integra estados del robot, lecturas de rango, rutas bloqueadas, timeouts de sensores y decisiones del operador.
- Capacidad de parada: solicita detenerse cuando la evidencia es suficiente (40/40 en el benchmark congelado).
- Capacidad multimodal de entrada (image-text-to-text) heredada del modelo base, aunque el adaptador entrena solo 7 ejemplos de imagen.
- Generacion de recomendaciones finales con accion correcta (37/48 en el benchmark).
- No tiene capacidad de actuacion: no puede accionar motores, liberar la pinza, anular la parada de emergencia ni confirmar la presencia de una persona.
- No debe indicar distancias ni posiciones de personas.
- Idioma: ingles.

## Casos de uso

- Asistente de mision consultivo para un robot terrestre de busqueda y rescate: el adaptador propone el siguiente paso (solicitar herramienta o emitir recomendacion final) y una puerta de seguridad determinista acepta o rechaza cada solicitud; es adecuado porque el modelo nunca esta en el bucle de control y toda accion pasa por codigo determinista.
- Demostracion e investigacion de asistentes de tool-use acotados y auditables: util para estudiar como un modelo pequeno (2B) con un adaptador de 15,63 M de parametros puede seguir un contrato de herramientas estricto y un formato JSON fijo.
- Registro y auditoria de decisiones en misiones simuladas: cada paso genera una solicitud JSON parseable (230/230 en el benchmark), lo que facilita el registro estructurado y la revision posterior por parte del operador.
- Fusion de sensores y recomendaciones de avistamiento: el adaptador fue entrenado con 47 recomendaciones de fusion de sensores y 27 de avistamiento, por lo que puede emitir recomendaciones a partir de lecturas de rango y estados de movimiento en simulacion.
- Escalado al operador ante fallos de sensores: en el analisis de fallos, ante un timeout de sensor de rango el modelo escalo al operador y no solicito movimiento, lo que lo hace adecuado como capa de propuesta de escalado en entornos simulados.
- Prototipado rapido en hardware de consumo: al ser un adaptador pequeno sobre un modelo de 2B, puede ejecutarse en un Apple Silicon (latencia mediana de 2,27 s por paso, p90 de 3,71 s en bf16/MPS), lo que permite iterar en investigacion sin infraestructura de GPU dedicada.
- Educacion y formacion en seguridad de IA robotica: sirve como ejemplo didactico de diseno con "advisory only", puerta de seguridad determinista y evaluacion con intervalos de confianza.

## Benchmarks y rendimiento

Benchmark de mision congelado `v0.2`: 230 pasos de misiones simuladas no vistas, con el adaptador mas contexto RAG, decodificacion greedy y sin decodificacion restringida.

| Metrica | Resultado (IC 95 % Wilson) |
|---|---|
| Siguiente paso correcto | 218 / 230 = 94,8 % (91,1-97,0 %) |
| JSON parseable | 230 / 230 |
| Argumentos de tool-call validos | 182 / 182 |
| Solicitudes de movimiento inseguras | 0 / 182 (0-2,1 %) |
| Llamadas rechazadas por la puerta de seguridad | 2 / 182 |
| Se detiene cuando la evidencia es suficiente | 40 / 40 |
| Pasos de variante de seguridad correctos | 84 / 88 |
| Recomendaciones finales con accion correcta | 37 / 48 |
| Recomendaciones finales con afirmaciones no soportadas (detectadas por el guard) | 2 / 48 |
| Latencia mediana (Apple M-series, bf16, MPS) | 2,27 s por paso (p90 3,71 s) |
| Qwen3.5-2B base, mismo setup | 0 / 230 (sin formato de paso valido) |

Nota de reproducibilidad: todos los resultados de mision reportados (validacion y test) se midieron con RAG (hasta 3 fragmentos recuperados del corpus de rescate del equipo, en etiquetas `<source>`). El corpus, el codigo de recuperacion y el benchmark congelado viven en el espacio privado de Team-15 y no se incluyen en el repositorio. `load_example.py` se ejecuta sin recuperacion; la exactitud de mision sin RAG no se ha medido.

Analisis de los 12 errores: 4 pasos tienen etiquetas que el modelo no puede identificar a partir de su entrada; 1 es un falso positivo del evaluador; 3 son errores de razonamiento (se ignoro un hecho decisivo del historial: una confirmacion del operador dos veces y un movimiento rechazado por la puerta una vez); 2 son procedurales (detenerse tras el primer escaneo bloqueado en lugar de pedir escanear el otro lado); 2 son `request_stop` no solicitados tras un timeout del sensor de rango (uno en movimiento y otro en reposo; en ambos el modelo escalo al operador y no solicito movimiento).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 2B, la huella depende de la cuantizacion del modelo base, que no se documenta.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: el entrenamiento y la evaluacion se realizaron en un solo Apple Silicon (MPS, bf16), con latencia mediana de 2,27 s por paso; no se documentan pruebas en GPU de consumo concretas.
- Opciones de despliegue: PEFT 0.21.2 y transformers 5.22.2 (segun la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de 2,27 s por paso y p90 de 3,71 s en Apple M-series con bf16 y MPS; no se reporta throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en benchmark de mision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Team-15 Rescue Mission LoRA (sobre Qwen3.5-2B) | Adaptador de 15,63 M sobre base de 2B | No disponible | 94,8 % de siguiente paso correcto (218/230, con RAG) | Apache-2.0 | Hugging Face (adaptador; pesos base aparte) |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | 0/230 (sin formato de paso valido) | Apache-2.0 | Hugging Face |
| Otros adaptadores LoRA de robotica comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de otros adaptadores de robotica comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo consultivo: el adaptador no tiene autoridad sobre el robot; no puede accionar motores, liberar la pinza, anular la parada de emergencia ni confirmar la presencia de una persona. No esta certificado para seguridad y nunca debe colocarse en un bucle de control.
- Fuera de alcance: movimiento o actuacion autonoma, evaluacion medica, confirmacion de presencia de personas, respuesta real a emergencias y la tarea de recomendacion LiDAR. En un benchmark posterior, este adaptador produjo 0/60 recomendaciones LiDAR con esquema valido.
- Dependencia de RAG: todos los resultados de mision reportados se midieron con RAG; el corpus, el codigo de recuperacion y el benchmark congelado no se publican, y la exactitud sin RAG no se ha medido.
- Datos sinteticos: los pasos de herramienta y las recomendaciones se generaron con una politica docente determinista sobre misiones simuladas, lo que puede limitar la generalizacion a entornos reales.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada.
- Riesgo de alucinacion: en el benchmark, 2 de 48 recomendaciones finales contenian afirmaciones no soportadas (detectadas por el guard); ademas, 3 errores de razonamiento ignoraron hechos decisivos del historial.
- Limitaciones de idioma: solo ingles.
- Limitaciones de contexto: la longitud de contexto del modelo base no se documenta; el entrenamiento uso una longitud maxima de 2.400 tokens y se descartaron 18 registros demasiado largos.
- Restricciones de licencia: Apache-2.0, igual que el modelo base; no se documentan restricciones adicionales para uso comercial, pero el uso previsto sigue siendo investigacion y demostracion.
- Caveat de produccion: los pesos base no se incluyen en el repositorio y deben descargarse del repositorio oficial de Qwen; los datos de entrenamiento no se publican.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/MOHDMUBASHIR/team15-qwen3.5-2b-rescue-mission-lora
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset Co-GLANCE: https://huggingface.co/datasets/co-glance/Co-GLANCE
