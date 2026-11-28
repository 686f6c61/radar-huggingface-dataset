# Autism-Skill-Issue/pi05-lora-napkin-tradeshow-ur12e-3cam-60fps-policy-20000

## Resumen

`pi05-lora-napkin-tradeshow-ur12e-3cam-60fps-policy-20000` es un checkpoint de entrenamiento del framework OpenPI, asociado a la familia de modelos de politica robotica pi0.5. Lo publica el usuario `Autism-Skill-Issue` en Hugging Face y corresponde al paso 20000 de un entrenamiento con ajuste fino LoRA sobre una politica pi0.5 especializada en una tarea concreta: manipular servilletas (napkin) en un entorno de feria o exposicion (tradeshow) con un brazo robotico UR12e y tres camaras a 60 fps.

Se trata de un artefacto de inferencia para robonica, no de un modelo de lenguaje conversacional. El repositorio contiene `params/` (pesos del modelo para inferencia) y `assets/` (estadisticas de normalizacion), y se sirve mediante el script `serve_policy.py` del ecosistema openpi. Su relevancia es acotada: sirve como ejemplo reproducible de como se publica un checkpoint de politica visomotora entrenado con OpenPI y como se despliega en un robot real.

No hay informacion publica sobre licencia, idiomas, benchmarks ni numero de parametros. La model card es minima y se limita a instrucciones de descarga y servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica visomotora pi0.5 (familia OpenPI); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica como contexto de texto; entrada multimodal imagen + estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos en `params/` segun convencion OpenPI (no se especifica safetensors ni GGUF); repo de 6,3 GB |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia pi0.5, integrada en el framework OpenPI para politicas roboticas visomotoras. El nombre indica un ajuste fino con LoRA sobre un modelo base pi0.5, entrenado para una tarea especifica: manipulacion de servilletas en un entorno de feria, con un robot UR12e y tres camaras a 60 fps. El paso de entrenamiento publicado es 20000.

No se dispone de informacion sobre el numero de tokens o episodios de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplica en el sentido habitual de LLM) ni innovaciones tecnicas concretas. La model card solo documenta el contenido del repositorio (`params/` y `assets/`) y los comandos de descarga y servicio.

## Capacidades

- Generacion de acciones motoras para un brazo robotico UR12e a partir de observaciones visuales de tres camaras a 60 fps.
- Politica especializada en una unica tarea: manipulacion de servilletas en un contexto de feria/exposicion.
- Inferencia mediante `serve_policy.py` del ecosistema openpi, con la configuracion de entrenamiento correspondiente.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingue, thinking mode, vision general, audio ni generacion de texto.

## Casos de uso

- Reproduccion de un experimento de robotica: descargar el checkpoint y servirlo con `serve_policy.py` para replicar la politica entrenada en el mismo montaje (UR12e, tres camaras, 60 fps).
- Punto de partida para ajuste fino: usar los pesos como base para entrenar variantes de la tarea con LoRA sobre el mismo esquema de configuracion.
- Evaluacion de despliegue OpenPI: validar el flujo completo de descarga, servicio y ejecucion en un robot UR12e en un entorno controlado.
- Docencia y demostracion: ilustrar como se publica y consume un checkpoint de politica visomotora en Hugging Face.
- Benchmark interno de infraestructura: medir latencia y throughput del servidor de politica en el hardware disponible antes de escalar a otras tareas.
- Integracion en un pipeline de investigacion: comparar el comportamiento de esta politica con otras variantes pi0.5 entrenadas para la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 6,3 GB, lo que da una cota inferior orientativa del espacio en disco necesario.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `scripts/serve_policy.py` de openpi, con la configuracion `pi05-lora-napkin-tradeshow-ur12e-3cam-60fps-policy` en un checkout local de openpi; descarga via `hf download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05-lora-napkin-tradeshow-ur12e-3cam-60fps-policy-20000) | no disponible | no aplica | Manipulacion de servilletas, UR12e, 3 camaras | no disponible | Hugging Face, 0 descargas |
| Otros checkpoints pi0.5 / OpenPI | no disponible | no aplica | Politicas roboticas diversas | variable | Hugging Face / openpi |
| Modelos VLA genericos (p. ej. familia OpenVLA) | no disponible en esta ficha | no aplica | Manipulacion general | variable | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una tarea y un montaje concretos (servilletas, UR12e, tres camaras a 60 fps); no se espera que generalice a otras tareas o configuraciones.
- Licencia no declarada: no se puede asumir uso comercial sin aclaracion del autor.
- Sin benchmarks ni evaluaciones publicadas: el rendimiento real es desconocido.
- Riesgo de sobreajuste al entorno de entrenamiento (feria/exposicion) y a las condiciones de iluminacion y camara de ese montaje.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Requiere una configuracion de entrenamiento coincidente en el checkout local de openpi; sin ella, el servicio falla.
- No es un modelo de lenguaje: no debe evaluarse con criterios de MMLU, HumanEval, GSM8K ni similares.

## Enlaces

- Hugging Face: https://huggingface.co/Autism-Skill-Issue/pi05-lora-napkin-tradeshow-ur12e-3cam-60fps-policy-20000
- OpenPI (framework): no se proporciona enlace en la informacion disponible.
