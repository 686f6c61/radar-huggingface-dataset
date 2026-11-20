# jsbaicenter/JSBAI-Coder-4B

## Resumen

JSBAI-Coder-4B es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4B) desarrollado por el James Silberrad Brown Center for Artificial Intelligence (JSBCAI) de la Universidad Estatal de San Diego. Se trata de un ajuste fino de Qwen/Qwen3.5-4B orientado a *agentic coding*: el modelo es capaz de investigar errores en repositorios de software reales, leer el código que falla, escribir un parche, ejecutar las pruebas y verificar su propia corrección dentro de un contenedor aislado. El autor ha renombrado el modelo a Aztec-Coder-4B; este repositorio se mantiene por continuidad.

La relevancia del modelo radica en que demuestra que las capacidades de codificación agéntica, hasta ahora asociadas a modelos de 27B parámetros o más, pueden alcanzar un rendimiento útil en un modelo que cabe en una GPU de consumo. Según la model card, el modelo pasa de resolver un 10,1% de 121 errores reales no vistos durante el entrenamiento (el modelo base) a un 82,9% tras el ajuste, verificado ejecutando las suites de pruebas ocultas de cada proyecto.

El entrenamiento combina demostraciones destiladas de un modelo frontera (GLM-5.3, 744B), aprendizaje por refuerzo con GRPO sobre problemas reales de ingeniería de software y datos generales de instrucción y uso de herramientas procedentes de NVIDIA Nemotron-Post-Training-Dataset-v2. La licencia es Apache-2.0, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B, tag `qwen3_5_text`); no se detallan mas particularidades en la informacion disponible |
| Parametros totales | 4.205.751.296 (~4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (segun el ejemplo de uso con vLLM, `max_model_len=131072`) |
| Tipos de cuantizacion | BF16 (pesos originales) y NVFP4 (variante cuantizada de ~5 GB, generada con NVIDIA ModelOpt) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); variante NVFP4 disponible en la misma organizacion |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de aproximadamente 4B parametros, y se ajusta en tres etapas. La primera consiste en destilacion de demostraciones: GLM-5.3 (un modelo abierto frontera de 744B) genero aproximadamente 1.875 trayectorias de codificacion agentica, cada una verificada ejecutando la suite de pruebas real antes de aceptarla. Estas demostraciones ensenan el formato de la codificacion agentica: como usar herramientas, cuando ejecutar pruebas y que aspecto tiene una solucion correcta.

La segunda etapa es aprendizaje por refuerzo sobre 237 problemas de ingenieria de software seleccionados (resolubles de forma intermitente por el modelo). Se emplearon 145 lotes de GRPO on-policy: cada intento se reforzaba solo si hacia pasar las pruebas ocultas reales. La tercera etapa consiste en comprobaciones de generalizacion en cada frontera de etapa, con problemas nunca vistos. Los datos generales de instruccion, salida estructurada y uso de herramientas provienen de NVIDIA Nemotron-Post-Training-Dataset-v2, y el pool de practica de RL se compone de conjuntos abiertos de problemas de ingenieria de software. La fase de RL no uso datos estaticos: el modelo generaba intentos nuevos en cada lote y solo los resultados verificados por pruebas se convertian en senal de entrenamiento. El modelo emplea la plantilla de chat de Qwen3.5 con *interleaved thinking* y el formato de llamada a herramientas `qwen3_coder`. Existe tambien una cabeza de decodificacion especulativa (MTP) para acelerar la inferencia.

## Capacidades

- Generacion de texto y razonamiento general, con modo de pensamiento intercalado entre llamadas a herramientas.
- Codificacion agentica: exploracion de repositorios, lectura de codigo defectuoso, escritura de parches y ejecucion de pruebas para autoverificacion.
- Uso de herramientas (*tool calling* / *function calling*) en el formato `qwen3_coder`.
- Razonamiento multi-paso y bucles de agente dentro de entornos de contenedor aislados.
- Seguimiento de instrucciones (IFEval de 87,21, superior al modelo base).
- Capacidades generales de conocimiento (MMLU-Pro del 70,0%).
- Soporte de decodificacion especulativa mediante cabeza MTP.
- Capacidades multilingues: no especificadas en la informacion disponible (heredadas del modelo base Qwen3.5-4B, pero sin detalle).

## Casos de uso

- Correccion automatica de errores en CI/CD: el modelo puede recibir un fallo de compilacion o de pruebas, explorar el repositorio, localizar la causa, escribir un parche y ejecutar la suite de pruebas para confirmar la correccion antes de abrir una pull request. Es adecuado por su entrenamiento especifico en este bucle y por su contexto de 131.072 tokens.
- Mantenimiento de repositorios legacy: dado un codigo base grande y poco documentado, el modelo puede navegar por los ficheros, entender dependencias y proponer cambios acotados, verificandolos con las pruebas existentes.
- Asistente de desarrollo en local para portatiles: con ~8 GB de VRAM en BF16 o ~5 GB en NVFP4, puede desplegarse en una GPU de consumo y ofrecer un agente de codigo sin enviar codigo propietario a servicios externos.
- Triaje y reproduccion de incidencias: el modelo puede leer un informe de error, reproducir el fallo en un contenedor, aislar el componente afectado y documentar la causa raiz con el parche propuesto.
- Generacion de pruebas de regresion: tras corregir un error, puede escribir pruebas que capturen el caso y ejecutarlas para validar que el comportamiento queda fijado.
- Automatizacion de tareas de refactorizacion acotadas: renombrados, migraciones de API o eliminacion de codigo muerto, con verificacion mediante pruebas en cada paso.
- Educacion y prototipado de agentes: por su tamano y licencia Apache-2.0, sirve como banco de pruebas para investigar bucles de agente y RL con verificacion por pruebas en hardware asequible.

## Benchmarks y rendimiento

Segun la model card del autor (el modelo fue renombrado a Aztec-Coder-4B):

| Benchmark | Qwen3.5-4B (base) | Aztec-Coder-4B | Aztec-Coder-4B-NVFP4 |
|---|---|---|---|
| Generalization test (121 errores no vistos, verificados con pruebas) | 10,1% | 82,9% | 38,0% (subconjunto de 32 instancias) |
| Live-60 (60 tareas reales resueltas de extremo a extremo en contenedores) | 15,0% | 21,7% | 15,0% |
| IFEval (seguimiento de instrucciones) | 84,66 | 87,21 | 86,37 |
| MMLU-Pro | 64,0% | 70,0% | 66,85% |
| Terminal-Bench 1.0 (core, 80 tareas) | 33,8% | 33,8% | 18,8% |
| Terminal-Bench 2.1 (89 tareas) | pendiente | pendiente | pendiente |

El autor indica que la cuantizacion NVFP4 reduce aproximadamente a la mitad la capacidad de generalizacion (12/32 en el subconjunto de 32 instancias empleado en sus comparaciones). Tambien declara un protocolo de descontaminacion publicado: ninguno de los problemas de benchmark se solapa con los datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada: ~8 GB en BF16; ~5 GB en la variante NVFP4.
- GPU recomendadas: cualquier GPU de consumo con al menos 8 GB de VRAM para BF16 (por ejemplo, RTX 3060 Ti/4060 Ti de 8 GB, RTX 4070, RTX 4080, RTX 4090) y ~5 GB para NVFP4 (RTX 4060, RTX 3060 de 12 GB, etc.). Para despliegues de mayor concurrencia, A100 o H100.
- Cabe en GPU de consumo: si, tanto en BF16 como en NVFP4.
- Opciones de despliegue: vLLM (ejemplo oficial con `max_model_len=131072`, parser de razonamiento `qwen3` y formato de herramientas `qwen3_coder`); transformers. El autor no menciona llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Existe una cabeza de decodificacion especulativa MTP para acelerar la inferencia, sin cifras publicadas.
- Muestreo recomendado: temperatura 1.0, top_p 0.95.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JSBAI-Coder-4B (Aztec-Coder-4B) | ~4B | 131.072 | 82,9% en 121 errores no vistos; MMLU-Pro 70,0% | Apache-2.0 | Hugging Face (jsbaicenter) |
| Qwen3.5-4B (base) | ~4B | 131.072 | 10,1% en el mismo test; MMLU-Pro 64,0% | Apache-2.0 | Hugging Face (Qwen) |
| GLM-5.3 (generador de demostraciones) | 744B | No disponible | No disponible | No disponible en la informacion | Servido localmente por el autor |

No se dispone en la informacion proporcionada de resultados de otros modelos de codificacion agentica de tamano similar para una comparacion directa.

## Limitaciones y advertencias

- Un modelo de 4B tiene el conocimiento de un 4B: hechos poco comunes y razonamiento en dominios extremos siguen favoreciendo a modelos mayores.
- El bucle de agente se ajusto para entornos de contenedor aislados; otros contextos de despliegue no han sido probados.
- Los comportamientos de seguridad provienen del modelo base; la fase de RL optimizo unicamente el paso de pruebas, sin entrenamiento especifico de seguridad. Conviene revisar la model card de Qwen3.5-4B.
- La cuantizacion NVFP4 reduce aproximadamente a la mitad la capacidad de generalizacion en el subconjunto evaluado (38,0% frente a 82,9%).
- Riesgo de alucinacion inherente a modelos de este tamano; la verificacion mediante ejecucion de pruebas mitiga pero no elimina el riesgo en produccion.
- Idiomas soportados no documentados; el rendimiento fuera del ingles no esta caracterizado en la informacion disponible.
- El modelo ha sido renombrado a Aztec-Coder-4B; conviene usar el repositorio nuevo para descargas y citas.
- Licencia Apache-2.0, permisiva para uso comercial, heredada del modelo base.

## Enlaces

- Repositorio Hugging Face (original): https://huggingface.co/jsbaicenter/JSBAI-Coder-4B
- Repositorio Hugging Face (nuevo nombre): https://huggingface.co/jsbaicenter/Aztec-Coder-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- NVIDIA ModelOpt (cuantizacion NVFP4): https://github.com/NVIDIA/Model-Optimizer
- Informe tecnico: pendiente de publicacion segun la model card
