# jungwook2358/Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high

## Resumen

Este modelo es un checkpoint experimental derivado de Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), publicado por el usuario jungwook2358 en Hugging Face. No se trata de un modelo entrenado de forma convencional, sino de un ejercicio de edicion directa de pesos (weight editing) sobre el modelo base. La sesion de edicion, denominada EXP-0033, utilizo Claude Opus 5.5 (con esfuerzo alto, en Claude Code) como agente "code-as-policy" (PyRUA-Lean) dentro del simulador LIBERO-PRO, con cuatro suites de intercambio servidas mediante vLLM 0.32. El agente diagnostico fallos a partir de sus propios rollouts y aplico el flujo WSP-Scope para modificar pesos, aceptando un cambio solo cuando los rollouts pareados en semillas no usadas durante la construccion mostraban una mejora clara. Se ejecutaron 320 episodios de simulador en total y no se realizo entrenamiento alguno.

El resultado es un modelo multimodal (pipeline image-text-to-text) de aproximadamente 4.660 millones de parametros (4.659.865.088 segun los safetensors), construido sobre una arquitectura Qwen3.5 que combina atencion lineal y atencion completa segun los nombres de tensores presentes (`linear_attn` y `self_attn`). El checkpoint final es acumulativo e incorpora dos pasos de edicion aceptados: la ablacion de una direccion de "intencion de mirar" (look-intent) en las capas 16-31 para reducir el uso excesivo de imagenes que agotaba el contexto de 65k, y una edicion de rango 1 en `layers.31.mlp.down_proj` para penalizar finalizaciones prematuras falsas.

Es relevante ahora porque documenta una metodologia emergente de intervencion sobre pesos sin reentrenamiento, con trazabilidad completa de los tensores modificados y las hipotesis asociadas. Conviene subrayar que el propio autor advierte de que el modelo no ha sido evaluado en kakao y que los efectos medidos proceden de sus propios rollouts, no de una evaluacion independiente. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con atencion hibrida (capas `linear_attn` y `self_attn`) y componente multimodal image-text-to-text |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65k tokens (mencionado en la model card como limite que el modelo base agotaba por uso excesivo de imagenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`transformers`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B base. Los nombres de tensores editados revelan una estructura con dos tipos de capas de atencion alternadas: capas con `linear_attn.out_proj` y capas con `self_attn.o_proj`, lo que sugiere un diseno hibrido entre atencion lineal (probablemente para eficiencia en contextos largos) y atencion completa estandar. Cada bloque incluye tambien `mlp.down_proj`, y las ediciones afectan a las capas 16 a 31, es decir, al tramo alto de la red. El modelo incorpora un componente de vision, dado su pipeline `image-text-to-text`.

No hubo entrenamiento. El proceso consistio en una sesion de edicion de pesos guiada por un agente (Claude Opus 5.5) que ejecutaba el modelo base como politica de codigo dentro del simulador LIBERO-PRO. El agente observaba sus propios rollouts, diagnosticaba patrones de fallo y aplicaba el flujo WSP-Scope para modificar tensores concretos. Se aceptaron dos pasos acumulativos. El paso 1 (T1, `look_intent_ablation`) elimino una direccion de "intencion de mirar" calculada como la media de residuales en posiciones de inicio de linea con `robo.show()` menos la media de las demas posiciones (25 frente a 450 posiciones, con coseno de particion mitad-mitad de 0,80), aplicada con beta=1,0 sobre las escrituras de residual en las capas 16-31. El paso 2 (T2, `false_finish_penalty`) aplico una edicion de rango 1 en `layers.31.mlp.down_proj` que reduce en aproximadamente 3 nats el margen entre "finalizar" y "ejecutar python" en la seleccion de herramienta. La validacion se hizo con rollouts pareados sobre semillas no usadas durante la construccion, con semillas 0-4 del simulador y las semillas que repiten escenas excluidas.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del Qwen3.5-4B base.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con capacidad de invocar vistas del entorno mediante `robo.show()` en el contexto del simulador.
- Ejecucion de politicas como codigo (code-as-policy) en entornos simulados tipo LIBERO-PRO.
- Seleccion de herramientas y acciones dentro de un bucle de agente (tool selection entre finalizar y ejecutar codigo).
- Razonamiento multi-paso en episodios de simulador (hasta 320 episodios ejecutados durante la sesion de edicion).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en edicion de pesos: sirve como caso de estudio reproducible para analizar como intervenciones de rango bajo o direccionales sobre tensores concretos alteran el comportamiento de un modelo multimodal en tareas de agente. La model card detalla cada tensor y su hipotesis, lo que facilita la replicacion.
- Reduccion de uso excesivo de imagenes en agentes visuales: la ablacion de la direccion look-intent en las capas 16-31 esta pensada para mitigar el agotamiento del contexto de 65k por llamadas habituales a `robo.show()`. Util para pipelines que consumen muchas imagenes del entorno.
- Mitigacion de finalizaciones prematuras en agentes: la edicion de rango 1 en la capa 31 reduce el margen hacia "finalizar" frente a "ejecutar codigo", lo que puede emplearse en sistemas donde el agente declara exito antes de cumplir la condicion objetivo.
- Evaluacion de metodologias de diagnostico automatico: el flujo WSP-Scope con rollouts pareados y validacion en semillas no vistas es un patron aplicable a otros entornos de simulacion con recompensa verificable.
- Experimentacion con atencion hibrida en contextos largos: al combinar capas `linear_attn` y `self_attn`, el modelo permite estudiar el impacto de ediciones en cada tipo de capa por separado.
- Base para comparativas de weight editing frente a fine-tuning: al no requerir entrenamiento, permite medir coste y efecto de intervenciones quirurgicas frente a un ajuste supervisado convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo "no ha sido evaluado en kakao" y que los efectos medidos proceden de los rollouts del propio editor, no de una evaluacion independiente. No se aportan cifras de MMLU, HumanEval, GSM8K ni de las suites LIBERO-PRO en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,66 mil millones de parametros, en precision BF16 el peso ronda los 9,3 GB, lo que encaja con el tamano del repo de 10,5 GB; en cuantizacion de 8 bits cabria en torno a 5 GB y en 4 bits en torno a 3 GB, aunque estas cifras son estimaciones tecnicas y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion. Por tamano, una RTX 4090 (24 GB) o una A100 (40/80 GB) son suficientes para inferencia en BF16; una H100 no es necesaria salvo para mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 12 GB o mas en BF16 y en tarjetas de 8 GB con cuantizacion, aunque no hay confirmacion oficial.
- Opciones de despliegue: la model card menciona que el modelo base se sirvio con vLLM 0.32 durante la evaluacion; la libreria declarada es `transformers`. No se confirman soportes de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high | 4,66 mil millones | 65k | Edicion de pesos sobre Qwen3.5-4B | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4,66 mil millones (segun el derivado) | 65k | Modelo multimodal original | No disponible en la informacion | Hugging Face |
| Alternativas de ~4B multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y el modelo base ni con otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte de que el modelo no ha sido evaluado en kakao y que los efectos medidos provienen de sus propios rollouts, no de una evaluacion independiente.
- Al ser un checkpoint de edicion de pesos sin entrenamiento, no hay garantia de que las mejoras observadas en el simulador generalicen a otros entornos o tareas.
- Las ediciones se validaron con semillas 0-4 y con las semillas que repiten escenas excluidas; el numero de rollouts pareados no se detalla, lo que limita la solidez estadistica de las conclusiones.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero inherente a los modelos generativos de este tamano.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar el soporte multilingue mas alla del heredado del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propios terminos que conviene verificar antes de un despliegue en produccion.
- El modelo tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- La edicion de rango 1 sobre `layers.31.mlp.down_proj` desplaza el margen de seleccion de herramienta en aproximadamente 3 nats, un cambio que podria afectar a otros comportamientos no medidos en el simulador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/Qwen3.5-4B-wsp-scope-exp0033-opus-sim-high
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision del modelo base citada: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- Repositorio del flujo WSP-Scope: no disponible en la informacion proporcionada
- Paper o blog de LIBERO-PRO: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
