# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory-GGUF

## Resumen
LFM3-VL-2B-MobileAgent-Dev-OwnHistory-GGUF es una build en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory, un fine-tune del modelo vision-lenguaje LiquidAI/LFM3-VL-2B de Liquid AI orientado a la automatizacion de interfaces moviles (GUI agents en Android). El modelo recibe una captura de pantalla y un objetivo en lenguaje natural, y produce la siguiente accion sobre la pantalla. Lo publica el usuario experimentalmachines como parte de su proyecto de investigacion lfm3-mobile-agent.

Se trata de un checkpoint de desarrollo, conservado explicitamente para reproducir resultados y no recomendado para uso general; el autor remite a la version principal LFM3-VL-2B-MobileAgent. La relevancia actual radica en que demuestra que un modelo de ~1,73 mil millones de parametros, cuantizado a 4 bits, puede ejecutarse en un telefono mediante llama.cpp y actuar como agente visual sobre capturas de pantalla.

El repositorio incluye dos ficheros: el modelo de lenguaje en Q4_K_M y el proyector de vision en Q8_0, este ultimo sin modificar respecto al modelo base de Liquid AI. El contexto de servicio documentado es de 8192 tokens con un maximo de 1024 tokens por imagen.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (LFM3-VL de Liquid AI); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio documentada |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y Q8_0 (proyector de vision) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo es un fine-tune del vision-lenguaje LFM3-VL-2B de Liquid AI, que combina un modelo de lenguaje con una torre de vision y un proyector multimodal. En este fine-tune concreto, el autor indica que la torre de vision no se modifico: el proyector mmproj es identico al del modelo base LiquidAI/LFM3-VL-2B-GGUF. Por tanto, el ajuste se concentra en el modelo de lenguaje para adaptarlo a la tarea de agente movil.

El entrenamiento se realizo exclusivamente sobre demostraciones grabadas: el autor afirma que el modelo nunca interactuo con un telefono real durante el entrenamiento. El historial de texto que maneja el agente abarca 8 pasos. La conversion a GGUF se hizo con llama.cpp (commit cd959bae9) mediante convert_hf_to_gguf.py a F16 y posterior cuantizacion Q4_K_M con llama-quantize, procedimiento que el autor indica reproducible byte a byte.

## Capacidades
- Generacion de acciones de agente a partir de capturas de pantalla de Android y un objetivo en ingles.
- Comprension de imagen y texto (pipeline image-text-to-text): interpreta la UI representada en el screenshot.
- Razonamiento multi-paso limitado: mantiene un historial de texto de hasta 8 pasos para encadenar acciones.
- Salida en formato de razonamiento compatible con `--reasoning-format deepseek` en llama-server.
- Ejecucion local en dispositivo movil mediante llama.cpp con aceleracion por GPU (`-ngl 99`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles.

## Casos de uso
- Automatizacion de tareas repetitivas en Android: dado un objetivo en ingles y capturas sucesivas, el modelo propone pulsaciones y navegacion por menus; adecuado por su tamano reducido para ejecucion en el propio telefono.
- Investigacion en agentes GUI: sirve como checkpoint reproducible para comparar tecnicas de entrenamiento por imitacion sobre demostraciones grabadas, gracias a que el autor publica harnesses de evaluacion.
- Pruebas de regresion de pipelines de agente movil: al ser la build exacta sobre la que se ejecutaron las evaluaciones del autor, permite reproducir resultados de forma fiel.
- Prototipado de asistentes de accesibilidad: el modelo puede describir y operar la UI a partir de capturas, util para experimentar con navegacion guiada por voz en entornos controlados.
- Evaluacion de cuantizacion en el borde: comparar el comportamiento del Q4_K_M frente al modelo en precision completa en tareas de percepcion de pantalla y decision de accion.
- Docencia y demos de agentes multimodales en local: su huella de ~1,3 GB en el repositorio y la ejecucion con llama-server lo hacen manejable en portatiles y telefonos para talleres.
- Base para fine-tunes posteriores: al estar disponible el procedimiento de conversion y cuantizacion, sirve de punto de partida para adaptaciones a otros idiomas o dominios de aplicacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a los resultados de su repositorio (docs/results.md) para las cifras de evaluacion, pero no se incluyen en la informacion proporcionada.

## Requisitos de hardware
- VRAM estimada: el fichero Q4_K_M del modelo de lenguaje mas el proyector Q8_0 caben en el rango de 1-2 GB de memoria, coherente con un repositorio de 1,3 GB y 1,73 mil millones de parametros a 4 bits.
- GPU recomendadas: no disponible en la informacion proporcionada; el caso de uso declarado es ejecucion en telefono Android, no en GPU de servidor.
- Cabe en GPU de consumo: si, por el tamano del modelo; no se especifican modelos concretos de GPU en la informacion disponible.
- Despliegue: llama.cpp, concretamente llama-server con los flags documentados: `-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-OwnHistory-GGUF (este) | 1,73 B | 8192 tokens | en | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-VL-2B-GGUF (base) | no disponible | no disponible | no disponible | LFM Open License v1.0 | GGUF |
| experimentalmachines/LFM3-VL-2B-MobileAgent (version recomendada) | no disponible | no disponible | no disponible | LFM Open License v1.0 | no disponible |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias
- Checkpoint de desarrollo: el autor lo marca explicitamente como no recomendado y remite a la version principal LFM3-VL-2B-MobileAgent.
- Modelo de investigacion: no debe dejarse actuar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles y una unica captura de pantalla por paso.
- Memoria limitada al historial de texto de 8 pasos; no hay memoria mas alla de esa ventana.
- Entrenado solo con demostraciones grabadas, nunca con interaccion en un telefono real: puede fallar ante estados de UI no vistos.
- Riesgo de alucinacion en la interpretacion de pantallas y en la eleccion de acciones; requiere supervision humana.
- Licencia LFM Open License v1.0: conviene revisar sus terminos antes de cualquier uso comercial.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory-GGUF
- Modelo base del fine-tune: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory
- Version recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de Liquid AI (GGUF): https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados de evaluacion: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
