# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v4.1-GGUF es la version cuantizada en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la operacion de interfaces graficas de telefonia movil (GUI agents en Android). El modelo parte de la familia LFM3-VL de Liquid AI y ha sido especializado por experimentalmachines para recibir una captura de pantalla y un objetivo en ingles, y producir la siguiente accion sobre la interfaz.

El repositorio contiene dos artefactos: el modelo de lenguaje cuantizado en Q4_K_M y el proyector visual (mmproj) en Q8_0, que se mantiene sin cambios respecto al modelo original de Liquid AI porque el ajuste fino no modifico el vision tower. El modelo declara 1.728.801.600 parametros en sus pesos safetensors (aproximadamente 1,7 mil millones), lo que lo situa en la gama de modelos pequenos desplegables en dispositivos de consumo.

Su relevancia actual reside en la creciente demanda de agentes locales capaces de controlar aplicaciones moviles sin depender de la nube, con un consumo de recursos reducido y en un formato (GGUF) directamente compatible con llama.cpp. Se trata, no obstante, de un modelo de investigacion con limitaciones explicitas de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje LFM3-VL-2B con proyector visual), ajustado para GUI agents |
| Parametros totales | 1.728.801.600 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio documentada (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); Q8_0 (proyector visual, mmproj) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 1,3 GB |
| Pipeline | image-text-to-text |
| Modelo base | experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1 (a su vez derivado de LiquidAI/LFM3-VL-2B) |
| Herramienta de conversion | llama.cpp `cd959bae9` (convert_hf_to_gguf.py, F16 a Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal: un modelo de lenguaje LFM3-VL-2B de Liquid AI combinado con un proyector visual que transforma la imagen de entrada en tokens que el modelo de lenguaje procesa. En esta version GGUF, el proyector visual se mantiene identico al del modelo original LiquidAI/LFM3-VL-2B-GGUF (Q8_0), ya que el ajuste fino no modifico el vision tower; solo se cuantizo el modelo de lenguaje a Q4_K_M.

El ajuste fino se realizo sobre demostraciones grabadas de interacciones con telefonos moviles: el modelo nunca interactuo con un telefono real durante el entrenamiento, segun declara el autor. La tarea consiste en recibir un objetivo en ingles y una captura de pantalla por paso, y producir la siguiente accion sobre la interfaz. El historial de texto se limita a 8 pasos. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La conversion a GGUF se realizo con una version concreta de llama.cpp (`cd959bae9`), mediante `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize Q4_K_M`, procedimiento que el autor indica que reproduce el fichero de forma byte a byte.

## Capacidades

- Generacion de acciones de agente sobre interfaces moviles a partir de capturas de pantalla (image-text-to-text).
- Comprension de objetivos en ingles y traduccion a la siguiente accion sobre la GUI.
- Razonamiento multimodal de un solo paso: una captura por paso, sin memoria mas alla del historial de texto de 8 pasos.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Conversacion multi-turno segun el pipeline declarado (conversational).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).

## Casos de uso

- Automatizacion de tareas repetitivas en Android en entornos controlados: dado un objetivo en ingles y capturas de pantalla sucesivas, el modelo propone la siguiente accion sobre la interfaz; util para prototipar asistentes de navegacion en aplicaciones.
- Investigacion en agentes GUI: permite reproducir y comparar el comportamiento de un agente movil de 1,7 mil millones de parametros en formato GGUF, con el arnes de evaluacion publicado en el repositorio del proyecto.
- Pruebas de regresion de interfaces moviles: el agente puede emplearse para recorrer flujos de pantalla y detectar pasos donde la accion esperada no se produce, siempre bajo supervision.
- Despliegue local en dispositivos de gama alta: al caber en formato Q4_K_M (repositorio de 1,3 GB), puede ejecutarse con llama.cpp en entornos con recursos limitados para demostraciones offline.
- Generacion de datasets sinteticos de interacciones GUI: usar las acciones propuestas por el modelo como punto de partida para anotar o ampliar conjuntos de demostraciones.
- Educacion y divulgacion: ejemplo accesible de agente multimodal pequeno para explicar el funcionamiento de un pipeline vision-lenguaje-accion en un contexto movil.
- Evaluacion de cuantizacion: comparar el rendimiento del Q4_K_M frente al modelo base sin cuantizar en tareas de prediccion de acciones, usando el mismo arnes del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio del proyecto (docs/results.md) para consultar los resultados de las evaluaciones, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1,3 GB; con el modelo de lenguaje en Q4_K_M y el proyector visual en Q8_0, la huella de pesos ronda ese orden de magnitud, mas la memoria para el contexto (hasta 8192 tokens) y las imagenes (hasta 1024 tokens de imagen por paso).
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, el modelo es apto para GPUs de consumo con suficiente VRAM.
- Cabe en GPU de consumo: si, dado el tamano del repositorio (1,3 GB) y la cuantizacion Q4_K_M; no se detallan modelos concretos de GPU en la informacion proporcionada.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` para el proyector visual; el autor documenta la linea de servicio con `-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`. Otras opciones (vLLM, TGI, Ollama) no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.1-GGUF | 1.728.801.600 | 8192 tokens (config. de servicio) | GGUF | lfm1.0 | Agente GUI movil, ajuste fino |
| LiquidAI/LFM3-VL-2B | no disponible en la informacion | no disponible en la informacion | safetensors / GGUF (version oficial) | lfm1.0 | Modelo multimodal base |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1 | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | lfm1.0 | Version sin cuantizar del ajuste fino |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo con otros agentes GUI moviles, por lo que no se ofrece una comparativa de benchmarks.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe dejarse actuar de forma desatendida en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles; no se declara soporte de otros idiomas.
- Una captura de pantalla por paso y sin memoria mas alla del historial de texto de 8 pasos, lo que limita tareas de horizonte largo.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede provocar un comportamiento deficiente ante estados de interfaz no vistos.
- Riesgo de alucinacion en la prediccion de acciones: no se documentan tasas de error en la informacion disponible.
- Sesgos conocidos: no se documentan en la informacion proporcionada.
- Licencia LFM Open License v1.0 (lfm1.0): es necesario revisar sus terminos para uso comercial; la informacion disponible no detalla las restricciones concretas.
- El fichero GGUF depende de una version concreta de llama.cpp para su reproduccion byte a byte; cambios de version pueden alterar el comportamiento de conversion.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1-GGUF
- Modelo base sin cuantizar: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1
- Modelo original de Liquid AI (GGUF): https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Licencia: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.1-GGUF/blob/main/LICENSE
