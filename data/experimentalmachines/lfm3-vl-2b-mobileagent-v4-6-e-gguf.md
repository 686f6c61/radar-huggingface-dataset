# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.6-E-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v4.6-E-GGUF es una cuantizacion en formato GGUF de un ajuste fino del modelo vision-lenguaje LiquidAI LFM3-VL-2B, orientado especificamente a la operacion de interfaces graficas de telefonia movil (GUI agents sobre Android). El modelo lo publica el usuario experimentalmachines y deriva del checkpoint base experimentalmachines/LFM3-VL-2B-MobileAgent-v4.6-E, que a su vez parte de LiquidAI/LFM3-VL-2B. Resuelve el problema de convertir capturas de pantalla y un objetivo en lenguaje natural en acciones concretas sobre una app movil.

El modelo combina una torre de vision (proyector multimodal sin modificar respecto al original) con un modelo de lenguaje de aproximadamente 1.730 millones de parametros, cuantizado a 4 bits (Q4_K_M) para su ejecucion en llama.cpp sobre hardware movil. El contexto de servicio configurado en las evaluaciones es de 8192 tokens, con un maximo de 1024 tokens por imagen y una ventana de historial de 24 pasos. Esta version concreta esta marcada por el autor como "not promoted": la version evaluada y recomendada sigue siendo LFM3-VL-2B-MobileAgent-v4-GGUF.

Su relevancia es acotada pero clara para quien investiga agentes GUI: demuestra que un modelo de menos de 2.000 millones de parametros, cuantizado a 4 bits y ejecutable con llama-server, puede sostener un bucle de decision sobre pantallas de Android con tasas de exito medibles en el benchmark AndroidWorld, aunque con limitaciones severas de fiabilidad que lo desaconsejan para uso autonomo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (torre de vision + proyector multimodal + modelo de lenguaje); arquitectura interna del LM no detallada en la informacion disponible |
| Parametros totales | 1.728.801.600 (1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio documentada |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); proyector de vision en Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (dos ficheros: LM Q4_K_M y mmproj Q8_0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de tipo vision-lenguaje sobre LFM3-VL-2B de LiquidAI. La torre de vision y el proyector multimodal no se modificaron durante el ajuste: el repositorio incluye el mismo `mmproj-LFM3-VL-2B-Q8_0.gguf` que el modelo original de LiquidAI. El ajuste se aplico, por tanto, sobre el modelo de lenguaje, especializandolo en la tarea de agente GUI movil: interpretar una captura de pantalla junto con un objetivo en ingles y emitir la siguiente accion.

El entrenamiento se realizo exclusivamente sobre demostraciones grabadas; el modelo nunca interactuo con un telefono real durante el entrenamiento. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion se genero con llama.cpp (commit `cd959bae9`) mediante `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize Q4_K_M`; el autor indica que el mismo procedimiento reproduce byte a byte el GGUF de la version v4.

La innovacion tecnica mas destacable no esta en la arquitectura sino en el formato de interaccion: el modelo opera con una unica captura por paso, notas de "[no visible change]" y un historial de texto de 24 pasos, y admite el formato de razonamiento `deepseek` en llama-server. La version v4.6-E reduce drasticamente la proporcion de pasos de espera (del 29,1 % en v4 al 3,5 %), lo que sugiere un ajuste orientado a la accion continua en lugar de a la inaccion.

## Capacidades

- Generacion de acciones de agente GUI a partir de capturas de pantalla de Android y un objetivo en lenguaje natural.
- Comprension de imagen-texto (pipeline `image-text-to-text`) con hasta 1024 tokens por imagen.
- Razonamiento de corto plazo sobre un historial de texto de 24 pasos, con soporte de notas de ausencia de cambio visual.
- Formato de razonamiento configurable (`--reasoning-format deepseek`) en llama-server.
- Capacidad conversacional multi-turno dentro de la ventana de contexto.
- Soporte de inferencia en llama.cpp con `llama-server`, compatible con endpoints.
- Capacidades multilingues: limitadas al ingles.
- No se documentan capacidades de tool calling generico, codigo, matematicas, audio ni agentes multi-paso fuera del bucle GUI.

## Casos de uso

- Investigacion en agentes GUI moviles: el modelo sirve como sujeto de prueba reproducible en AndroidWorld con el harness documentado (`--history_steps 24 --nochange_notes --change_rule fine`), permitiendo comparar variantes de ajuste fino con una linea base estable.
- Prototipado de automatizacion de tareas repetitivas en Android: dado un objetivo en ingles y capturas sucesivas, el modelo propone la siguiente accion; util para validar pipelines de control antes de invertir en modelos mayores.
- Evaluacion de cuantizacion en el borde: al ser un Q4_K_M de 1,73 B ejecutable en llama.cpp, permite medir la degradacion de calidad de un agente GUI al pasar de pesos completos a 4 bits.
- Generacion de datos sinteticos de trayectorias: las acciones propuestas pueden filtrarse y revisarse para construir datasets de entrenamiento de agentes, siempre con supervision humana.
- Despliegue en dispositivos de gama alta para demos de accesibilidad: el modelo cabe en movil o en un portatil con GPU integrada, lo que facilita demostraciones de asistencia a la navegacion sin infraestructura en la nube.
- Benchmarking de harnesses de agente: al documentarse la variante exacta del harness y la semilla de desarrollo (seed 30, 116 tareas), es util para reproducir y auditar metodologias de evaluacion de agentes moviles.

## Benchmarks y rendimiento

Resultados en AndroidWorld (semilla de desarrollo 30, 116 tareas, caracter exploratorio; harness variante U con `--history_steps 24 --nochange_notes --change_rule fine`, Apple M5):

| Metrica | v4 | v4.5-D | v4.6-E |
|---|---|---|---|
| Exitos | 18 | 21 | 19 |
| Finalizaciones falsas | 25 | 27 | 24 |
| Proporcion de pasos de espera | 29,1 % | 16,9 % | 3,5 % |

El autor senala que las diferencias en exitos entre variantes estan dentro del ruido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,3 GB en total; el LM Q4_K_M y el proyector Q8_0 caben holgadamente en GPUs con 4 GB o mas de VRAM, y en modo CPU puro.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente. Las evaluaciones se hicieron en un Apple M5.
- Cabe en GPU consumer: si, incluidas GPUs de gama media y, con llama.cpp, en CPU y posiblemente en dispositivos moviles de gama alta.
- Opciones de despliegue: llama.cpp (`llama-server`) segun la configuracion documentada: `-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`. No se documentan vLLM, TGI ni Ollama para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.6-E-GGUF (este) | 1,73 B | 8192 (servicio) | GGUF Q4_K_M | LFM Open License v1.0 | No promovido |
| LFM3-VL-2B-MobileAgent-v4-GGUF | 1,73 B (base) | no disponible | GGUF | LFM Open License v1.0 | Modelo evaluado y recomendado |
| LiquidAI/LFM3-VL-2B-GGUF | 1,73 B (base) | no disponible | GGUF | LFM Open License v1.0 | Modelo base sin ajuste de agente |
| LFM3-VL-2B-MobileAgent-v4.5-D | 1,73 B (base) | no disponible | no disponible | LFM Open License v1.0 | Variante intermedia |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe operar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Finalizaciones prematuras: en aproximadamente una quinta parte de los episodios de AndroidWorld el modelo declara "done" antes de completar tareas de varios pasos.
- Solo ingles: los objetivos deben formularse en ingles.
- Una unica captura por paso y sin memoria mas alla del historial de texto de 24 pasos.
- Entrenado solo con demostraciones grabadas; nunca ha interactuado con un telefono real durante el entrenamiento, lo que limita su robustez ante estados no vistos.
- Estado "not promoted": el autor no lo recomienda como version de referencia; la version evaluada es v4.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar.
- Riesgo de alucinacion en la interpretacion de pantallas y en la seleccion de acciones, agravado por la cuantizacion a 4 bits.
- Diferencias de rendimiento entre variantes dentro del ruido estadistico en la evaluacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.6-E-GGUF
- Modelo base (v4.6-E): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.6-E
- Version evaluada (v4-GGUF): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4-GGUF
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
