# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo2-GGUF

## Resumen

LFM3-VL-2B-AndroidAgent-v4.3-dpo2-GGUF es la version cuantizada en formato GGUF del modelo LFM3-VL-2B-AndroidAgent-v4.3-dpo2, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la automatizacion de interfaces graficas en Android. Lo desarrolla el usuario independiente alpharomercoma y resuelve el problema de convertir capturas de pantalla de un telefono en acciones concretas (toques, deslizamientos, entrada de texto) dentro de un bucle de agente. Su relevancia radica en que empaqueta un modelo vision-lenguaje de 1.728 millones de parametros en un unico fichero Q4_K_M de aproximadamente 1,3 GB ejecutable con llama.cpp, lo que permite desplegarlo en hardware modesto.

El modelo parte de la arquitectura LFM3-VL de LiquidAI y hereda su licencia LFM Open License v1.0. La model card del autor advierte explicitamente de que esta version fallo su puerta de validacion online de la ronda 5 y recomienda usar la version v4.2-GGUF en su lugar. El fichero aqui descrito es exactamente el evaluado en AndroidWorld con semilla 30, por lo que los resultados publicados corresponden a este artefacto concreto.

Se trata de un modelo de investigacion, entrenado unicamente con demostraciones grabadas y nunca con interaccion sobre un telefono real. Solo admite objetivos en ingles, procesa una captura por paso y mantiene una memoria limitada a un historial de texto de 8 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (LFM3-VL de LiquidAI), con proyector visual separado |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (configuracion de servicio indicada por el autor) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector visual (mmproj) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (Q4_K_M + mmproj Q8_0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LFM3-VL-2B de LiquidAI, un modelo vision-lenguaje que combina una torre de vision con un modelo de lenguaje y un proyector multimodal. En esta version GGUF, el proyector visual se distribuye como fichero separado (`mmproj-LFM3-VL-2B-Q8_0.gguf`) y es identico al original de LiquidAI/LFM3-VL-2B-GGUF, ya que, segun el autor, ningun ajuste fino toco la torre de vision. El modelo de lenguaje se cuantiza a Q4_K_M.

El ajuste fino se realizo sobre el checkpoint v4.3-dpo2, cuyo nombre sugiere una etapa de optimizacion por preferencias (DPO), aunque la informacion disponible no detalla la composicion del dataset, el numero de tokens de entrenamiento ni el proceso de anotacion. El autor indica que el modelo se entreno exclusivamente con demostraciones grabadas y que nunca interactuo con un telefono real durante el entrenamiento. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` de llama.cpp (commit `cd959bae9`), pasando por F16 y aplicando despues `llama-quantize Q4_K_M`.

## Capacidades

- Generacion de acciones de agente movil a partir de capturas de pantalla de Android: interpreta la UI y produce toques, deslizamientos y texto.
- Procesamiento de imagen-texto a texto (pipeline `image-text-to-text`), con una captura por paso.
- Razonamiento en formato `deepseek` (modo de razonamiento habilitado en el servidor de inferencia).
- Seguimiento de objetivos en ingles dentro de un bucle de hasta 8 pasos de historial de texto.
- Conversacion multi-turno basada en historial textual de las acciones previas.
- No se documenta soporte de tool calling ni function calling generico.
- No se documenta soporte multilingue mas alla del ingles.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo puede recibir una captura de la app bajo prueba y emitir la accion siguiente, integrandose en un runner de tests end-to-end que verifique flujos de navegacion.
- Prototipado de agentes moviles en investigacion: sirve como politica de referencia en entornos simulados tipo AndroidWorld, donde el autor lo evaluo con semilla 30.
- Generacion de trayectorias sinteticas: al ejecutarse en local con llama.cpp, permite generar secuencias de acciones sobre capturas para aumentar datasets de entrenamiento de agentes.
- Despliegue en dispositivos con recursos limitados: su tamano de 1,3 GB en Q4_K_M y el soporte de llama.cpp permiten ejecutarlo en estaciones de trabajo modestas o en el propio dispositivo para experimentacion.
- Asistencia a usuarios en tareas repetitivas de navegacion movil en entornos controlados (por ejemplo, un emulador de laboratorio), siempre con supervision humana.
- Investigacion sobre alineacion de agentes visuales: al ser un modelo pequeno y abierto, facilita experimentos de DPO y evaluacion de sesgos en decisiones de UI.
- Base para ajustes finos posteriores en dominios especificos de Android, dado que el proyector visual se mantiene intacto y el modelo de lenguaje es sustituible.

## Benchmarks y rendimiento

El autor indica que este fichero es el evaluado en AndroidWorld con semilla 30 y que fallo la puerta de validacion online de la ronda 5, pero no se incluyen en la informacion proporcionada los valores numericos de dicha evaluacion. No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K ni metricas de AndroidWorld) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB de pesos en Q4_K_M mas el proyector visual Q8_0 y la cache KV para 8192 tokens; en la practica, un entorno con 4-6 GB de memoria es suficiente.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM; el autor sirve con `-ngl 99`, lo que descarga todas las capas en GPU.
- Cabe en GPU consumer: si, incluidas tarjetas de gama de entrada y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj`, y potencialmente otros runners compatibles con GGUF y vision (Ollama o llama-cpp-python, no verificados en la model card).
- Configuracion de servicio indicada por el autor: `-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.3-dpo2-GGUF | 1,73 B | 8192 tokens (config. de servicio) | LFM Open License v1.0 | GGUF en Hugging Face |
| alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF | no disponible | no disponible | LFM Open License v1.0 | GGUF en Hugging Face; recomendado por el autor |
| LiquidAI/LFM3-VL-2B-GGUF | 1,73 B (base) | no disponible | LFM Open License v1.0 | GGUF en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte de que no debe operar sin supervision en un telefono con cuentas, mensajes o pagos reales.
- Esta version fallo la puerta de validacion online de la ronda 5; el propio autor recomienda usar v4.2-GGUF.
- Solo acepta objetivos en ingles y una captura de pantalla por paso.
- Memoria limitada a un historial de texto de 8 pasos; no mantiene estado mas alla de esa ventana.
- Entrenado solo con demostraciones grabadas, nunca con interaccion en un telefono real, lo que puede provocar un comportamiento fuera de distribucion en apps o flujos no vistos.
- Riesgo de alucinacion en la interpretacion de la UI y en la eleccion de acciones, con posibles toques erroneos.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva estandar.
- No se documentan sesgos especificos, pero al ser un modelo solo en ingles y entrenado con demostraciones, puede degradarse con interfaces en otros idiomas o con texto no ingles.
- El proyector visual es el original de LiquidAI, por lo que las limitaciones de la torre de vision base se heredan sin cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo2-GGUF
- Modelo base (ajuste fino): https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.3-dpo2
- Version recomendada por el autor: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF
- Modelo original de LiquidAI en GGUF: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo original de LiquidAI (referencia de licencia): https://huggingface.co/LiquidAI/LFM3-VL-2B
