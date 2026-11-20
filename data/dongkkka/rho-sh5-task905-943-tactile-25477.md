# Dongkkka/RHO-SH5-Task905-943-Tactile-25477

## Resumen
RHO-SH5-Task905-943-Tactile-25477 es un checkpoint final de un modelo de vision-lenguaje-accion (VLA) orientado a robotica manipulativa con retorno tactil, desarrollado por Dongkkka sobre el backbone `microsoft/rho-base`. El modelo resuelve dos tareas concretas de picking sobre un entorno de laboratorio (Task000905 con la mano derecha y Task000943 con la mano izquierda): recoger una compresa sanitaria blanca de una caja y mantenerla. La publicacion corresponde al paso 25.477 de un entrenamiento por lotes de 48 horas, con el backbone VLM congelado y entrenamiento selectivo del experto de accion, las proyecciones de entrada/salida SH5 y el codificador tactil de los dedos.

La relevancia del modelo es acotada pero especifica: demuestra un pipeline VLA que fusiona posiciones articulares, presion tactil bruta de 90 canales y una camara RGB de cabeza para producir trayectorias de 50 pasos a 30 Hz en radianes absolutos. No es un modelo generalista ni un checkpoint listo para produccion: es un artefacto de investigacion reproducible con contrato de entrada/salida documentado, fuente fijada por commit y validacion limitada a seis entradas reales retenidas.

El repositorio ocupa 16 GB e incluye pesos completos, estado de optimizador y RNG, estadisticas de normalizacion, prompts efectivos y el contrato de E/S. La licencia es MIT, pero el autor advierte explicitamente de que la latencia en Jetson, los limites de comandos, el mapeo de camara en runtime y los rollouts motorizados no han sido aprobados por esta publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre backbone `microsoft/rho-base` con experto de accion, proyecciones SH5 y codificador tactil MLP |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision original; no se publican variantes GGUF/AWQ) |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | MIT |
| Formato de pesos | `checkpoint.pt` (PyTorch, requiere `weights_only=False`), con sidecars JSON/NPZ y `source.tar.gz` |

## Arquitectura y entrenamiento
El modelo parte de `microsoft/rho-base` como backbone VLM, que permanece congelado durante todo el entrenamiento. Se entrenan exclusivamente el experto de accion, las proyecciones de entrada y salida SH5 y el codificador tactil de los dedos. La entrada combina 54 posiciones articulares ordenadas, 90 canales de presion bruta (45 izquierda + 45 derecha) y una imagen RGB de cabeza a 720x1280; en runtime la imagen se redimensiona a 336x188 y se aplica el preprocesado de Rho con preservacion de aspecto hasta 256x256. El MLP tactil comprime los 90 canales de presion a 32 caracteristicas. La salida son 50x54 objetivos articulares absolutos en radianes a 30 Hz, generados mediante flow matching.

El entrenamiento se realizo en un lote de 48 horas (batch1024) y finalizo en el paso 25.477. El split de datos fue de 156 episodios de entrenamiento y 18 retenidos (78/9 por tarea). El autor reporta un MSE de flow matching final sobre 128 ventanas retenidas de 0,15207675, metrica que el propio autor advierte que no equivale a exito de tarea robotica. No se detalla composicion del dataset, numero de tokens ni uso de RLHF/DPO.

## Capacidades
- Generacion de acciones roboticas: produce trayectorias de 50 pasos x 54 articulaciones en radianes absolutos a 30 Hz.
- Fusion multimodal: combina estado proprioceptivo (posiciones articulares), tacto de alta densidad (90 canales de presion) y vision RGB de cabeza.
- Condicionamiento por tarea: dos prompts en ingles seleccionan la tarea (`task_id=0` para mano derecha, `task_id=1` para mano izquierda).
- Manipulacion con contacto: el codificador tactil permite reaccionar a presion en los dedos, relevante para agarre de objetos deformables o blandos.
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni modos de razonamiento extendido: es un modelo de politica robotica especializado.
- Capacidad multilingue limitada a ingles en los prompts publicados.

## Casos de uso
- Recogida de objetos blandos en linea de montaje: el modelo puede ejecutar el picking de una compresa sanitaria desde una caja y mantenerla, usando la señal tactil para detectar contacto y evitar aplastamiento. Apropiado por la fusion de presion y vision en un unico paso de politica.
- Investigacion en VLA con retorno tactil: sirve como checkpoint de referencia reproducible (fuente fijada por commit `80969c4264b71af72eb84dac766d29b480db2220`) para comparar variantes de codificadores tactiles o esquemas de flow matching.
- Benchmark de generalizacion entre manos: al incluir dos tareas simetricas (derecha e izquierda) con prompts separados, permite estudiar transferencia entre efectoros con el mismo backbone congelado.
- Prototipado de politicas de agarre con sensores de presion: el MLP de 90 a 32 caracteristicas es un componente reutilizable para pipelines que ya dispongan de arrays de presion equivalentes.
- Validacion de contratos de E/S en robotica: el `contract.json` y los sidecars NPZ permiten integrar el modelo en un runtime propio y verificar el ordenamiento exacto de articulaciones y canales tactiles.
- Docencia y reproduccion de experimentos VLA: el paquete incluye estado de optimizador, RNG y estadisticas de normalizacion, lo que facilita reanudar o auditar el entrenamiento en entornos academicos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes roboticos como success rate) en la informacion disponible. El unico dato numerico reportado es el MSE de flow matching sobre 128 ventanas retenidas: 0,15207675, que el autor indica explicitamente que no constituye una medida de exito de tarea.

| Metrica | Valor | Nota |
|---|---|---|
| Flow-matching MSE (128 ventanas retenidas) | 0,15207675 | No equivale a exito de tarea |
| Entradas retenidas validadas | 6 (3 por tarea) | Salidas finitas 50x54 en radianes |
| Paso final de entrenamiento | 25.477 | Run batch1024 de 48 horas |

## Requisitos de hardware
- VRAM estimada: no disponible. El repositorio pesa 16 GB e incluye pesos completos mas estado de optimizador y RNG, por lo que la inferencia sola requiere menos que el tamano total del artefacto, pero no se publica la cifra.
- GPU recomendadas: no disponible. El autor menciona que se usa SDPA y que FlashAttention no es necesario, lo que sugiere compatibilidad con GPUs estandar, pero no especifica modelos.
- Cabe en GPU de consumo: no confirmado. No se publican requisitos minimos ni pruebas en RTX 4090 u otras consumer.
- Opciones de despliegue: runtime propio incluido en `source.tar.gz` (Python 3.12, CUDA 12.8, `requirements-runtime.txt`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de politica robotica.
- Latencia y throughput: no disponibles. El autor indica explicitamente que la latencia en Jetson no ha sido aprobada por esta publicacion.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (VLA con retorno tactil sobre backbone Rho) ni datos de rendimiento que permitan una comparacion rigurosa. El unico punto de referencia es el modelo base `microsoft/rho-base`, del que este checkpoint es un fine-tune con backbone congelado, pero no se dispone de sus especificaciones en la informacion suministrada.

## Limitaciones y advertencias
- El MSE de flow matching reportado (0,15207675) no mide exito de tarea; no hay evidencia publicada de rollouts motorizados exitosos.
- La validacion se limita a seis entradas reales retenidas (tres por tarea) con salidas finitas; es una comprobacion de sanidad, no una evaluacion de robustez.
- El checkpoint se carga con `weights_only=False`, lo que implica riesgo de ejecucion de codigo arbitrario; debe obtenerse solo del repositorio fijado y verificado con `SHA256SUMS.json`.
- El backbone VLM esta congelado y el modelo esta especializado en dos tareas concretas con prompts fijos en ingles; no generaliza a otras tareas ni idiomas.
- La latencia en Jetson, los limites de comandos, el mapeo de camara en runtime y los rollouts motorizados no han sido aprobados por el autor.
- No se publican datos brutos de demostracion ni medios, lo que limita la auditoria del dataset y la evaluacion de sesgos.
- Licencia MIT permite uso comercial, pero la ausencia de validacion en produccion traslada al integrador toda la responsabilidad sobre seguridad y comportamiento del robot.
- Riesgo de alucinacion en el sentido de acciones fisicamente inviables o fuera de rango: no se documentan limites de comandos ni saturacion articular.

## Enlaces
- Hugging Face: https://huggingface.co/Dongkkka/RHO-SH5-Task905-943-Tactile-25477
- Repositorio fuente (rama `sh5-vla-tactile`): https://github.com/DonggeonKim1012/rho
- Modelo base: https://huggingface.co/microsoft/rho-base
- Commit fijado de la fuente: `80969c4264b71af72eb84dac766d29b480db2220` (referenciado en el paquete `source.tar.gz`)
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
