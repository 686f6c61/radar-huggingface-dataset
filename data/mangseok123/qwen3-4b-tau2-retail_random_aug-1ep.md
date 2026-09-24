# MANGSEOK123/qwen3-4b-tau2-retail_random_aug-1ep

## Resumen

`MANGSEOK123/qwen3-4b-tau2-retail_random_aug-1ep` es un ajuste fino del modelo denso Qwen3-4B-Instruct-2507, publicado por el usuario MANGSEOK123, orientado al dominio **retail** del benchmark tau2-bench. El objetivo declarado es consolidar en los pesos del modelo un conjunto de experiencias de tarea (96 pares tarea–memoria) mediante una técnica que el autor etiqueta como OEL y "experience distillation", de forma que el modelo resuelva las tareas sin necesidad de inyectar esa memoria en el prompt de sistema.

Tecnicamente es un modelo pequeno (4.411.424.256 parametros reales segun los safetensors, unos 4,4 B) con licencia Apache 2.0, lo que lo hace atractivo para despliegues de agentes conversacionales con tool calling en hardware modesto. El entrenamiento no usa recompensa externa: se minimiza una divergencia KL completa sobre todos los tokens de respuesta (`kl_topk` 256) entre un alumno que no ve la memoria y un profesor que son los mismos pesos con la memoria de la tarea en el prompt de sistema.

Su relevancia practica es doble. Por un lado, sirve como caso de estudio reproducible de destilacion de experiencia sobre tareas de agente (solo 96 pares, 1 epoca, batch 12, 8 pasos registrados). Por otro, es un candidato realista para pipelines de atencion al cliente en comercio electronico si se valida su comportamiento, ya que el autor no ha publicado ninguna evaluacion del modelo ajustado: solo aporta la referencia del modelo base, que obtiene `avg 0.400 / pass@3 0.575` en el split de test de tau2-bench retail.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (heredada del modelo base); la model card no detalla numero de capas ni configuracion de atencion |
| Parametros totales | 4.411.424.256 (4,4 B), segun los pesos safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue del autor fija `--max-model-len 40960`. El modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repo solo contiene safetensors. Al ser un modelo de 4,4 B es cuantizable a GGUF, AWQ o GPTQ con herramientas estandar |
| Idiomas soportados | No disponibles (no declarados en la model card ni en las etiquetas del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 8,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso, sin mezcla de expertos, con la configuracion de atencion de la familia Qwen3. No hay ninguna modificacion estructural documentada; el ajuste es puramente de pesos. El modelo parte de la variante "Instruct-2507", que en el ecosistema Qwen3 corresponde a una version orientada a instrucciones y uso sin modo de razonamiento explicito.

El entrenamiento se describe con precision inusual para un repositorio de este tamano: 96 pares tarea–memoria, batch size 12, 1 epoca, learning rate constante de 3e-6, gradient clipping de 1.0 (valor por defecto de verl) y una perdida de KL completa sobre todos los tokens de respuesta con `kl_topk` de 256. El alumno reproduce cada tarea sin memoria y el profesor es exactamente los mismos pesos con la memoria de esa tarea en el prompt de sistema; solo cambia el prompt y no se emplea ninguna recompensa ni RLHF/DPO. Los datos de interaccion se generan con un simulador de usuario basado en `gpt-4.1-mini` a temperatura 0.

El autor publica la traza de los 8 pasos de entrenamiento (KL loss entre 0.007 y 0.017, entropia entre 0.075 y 0.461, norma de gradiente entre 0.658 y 3.454) y advierte explicitamente que cada paso lee un lote distinto, por lo que la columna de perdida refleja la dificultad del lote y no una curva de convergencia. No se documenta ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones en el contexto de tareas de agente, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Tool calling / function calling: el propio autor documenta el despliegue con `--enable-auto-tool-choice` y `--tool-call-parser hermes`, lo que indica que el modelo emite llamadas a herramientas en formato compatible con el parser Hermes.
- Ejecucion de tareas de agente en el dominio **retail** de tau2-bench: manejo de pedidos, catalogo, reembolsos y politicas de tienda segun la definicion del benchmark.
- Consolidacion de experiencia en pesos: la capacitad buscada es resolver tareas que originalmente requeririan memoria externa en el prompt de sistema sin aportarla en tiempo de inferencia.
- Razonamiento multi-turno: el escenario de entrenamiento es conversacional y con simulador de usuario, por lo que el modelo esta expuesto a dialogos de varios turnos.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Modo de razonamiento explicito (thinking), vision o audio: no documentados; el modelo base es de la rama Instruct de Qwen3.
- Contexto de trabajo: 40.960 tokens en la configuracion de vLLM sugerida por el autor (el modelo base soporta ventanas mayores).

## Casos de uso

- Atencion al cliente automatizada en comercio electronico: el modelo puede gestionar conversaciones multi-turno de pedidos, cambios y devoluciones apoyandose en tool calling para consultar el OMS o el CRM, con una ventana de 40.960 tokens que permite arrastrar el historial completo de un caso.
- Cumplimiento de politicas de tienda: al haberse ajustado especificamente sobre el dominio retail de tau2-bench, es adecuado para agentes que deben aplicar reglas de negocio (plazos de devolucion, elegibilidad de reembolsos, excepciones) leyendolas como herramientas y no como texto libre.
- Agente de postventa y logistica: consulta de estado de envio, reclamaciones por retraso y reprogramacion de entregas mediante llamadas a APIs de transporte, con el modelo decidiendo que herramienta invocar en cada turno.
- Asistente interno para agentes humanos (agent assist): desplegado en local sobre una GPU de 16 GB, puede sugerir respuestas y proximas acciones al personal de soporte sin enviar datos de clientes a servicios externos, gracias a los pesos abiertos y a la licencia Apache 2.0.
- Investigacion en destilacion de experiencia: es un artefacto replicable para estudiar si la memoria de tarea puede absorberse en los pesos con solo 96 pares y una perdida KL, y para comparar esa estrategia frente a inyectar memoria en el prompt de sistema.
- Generacion de datos sinteticos para evaluacion de agentes: el modelo puede actuar como agente politico (policy agent) en simulaciones de tau2-bench, emparejado con un simulador de usuario, para generar trayectorias de dialogo sobre las que medir politicas de negocio.
- Prototipado rapido en PYMES: con cuantizacion de 4 bits cabe en GPUs de consumo, lo que permite levantar un piloto de agente retail en una sola maquina antes de decidir si se escala a un modelo mayor.
- Investigacion sobre permisos y seguridad en agentes: util para probar como se comporta un modelo de 4 B cuando se le dan herramientas con efectos reales (cancelar pedido, emitir reembolso) y evaluar la tasa de acciones incorrectas.

## Benchmarks y rendimiento

El autor indica explicitamente que el modelo ajustado **no fue evaluado** ("Not evaluated. Pushed straight after training"). Unicamente se aporta la referencia del modelo base sobre el split de test de tau2-bench retail:

| Modelo | Benchmark | avg | pass@3 |
|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-retail_random_aug-1ep | tau2-bench retail (test split) | No evaluado | No evaluado |
| Qwen/Qwen3-4B-Instruct-2507 (referencia del autor) | tau2-bench retail (test split) | 0.400 | 0.575 |

No se han publicado resultados adicionales de MMLU, HumanEval, GSM8K ni de ningun otro benchmark en la informacion disponible. Tampoco se aportan medidas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (valores derivados de los 4,4 B de parametros, no publicados por el autor): aproximadamente 9-10 GB en BF16/FP16, unos 5 GB en INT8, y entre 2,5 y 3 GB en cuantizacion de 4 bits tipo Q4_K_M.
- GPU recomendadas para BF16: A100 40 GB, H100, L40S o RTX 4090 (24 GB), todas con margen sobrado para una instancia del modelo.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090 en BF16; en 4 bits entra tambien en tarjetas de 8 GB como RTX 3070 o RTX 4060, con margen reducido por el coste de la cache KV a 40.960 tokens.
- Configuracion minima realista: 16 GB de VRAM en FP16 o 8-12 GB con cuantizacion, ya que la ventana de 40.960 tokens que propone el autor incrementa de forma notable el consumo de memoria de la cache KV.
- Despliegue: el autor proporciona el comando para vLLM con tool calling (`--enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`). Al ser pesos safetensors de un modelo Qwen3, tambien es desplegable con TGI, SGLang, llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles; el autor no publica ninguna medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | tau2-bench retail | Disponibilidad |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-retail_random_aug-1ep | 4,4 B | No declarado (40.960 en el ejemplo de vLLM; 262.144 en el base) | apache-2.0 | No evaluado | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Instruct-2507 | 4,4 B | 262.144 tokens | apache-2.0 | avg 0.400 / pass@3 0.575 (referencia del autor) | HuggingFace, ampliamente distribuido |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | No disponible | HuggingFace |
| Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | apache-2.0 | No disponible | HuggingFace |

La comparacion directa mas informativa es contra el propio modelo base: mismos parametros, misma licencia y misma familia, con la unica diferencia del ajuste con OEL sobre tau2-bench retail. No hay datos publicados que permitan afirmar si el ajuste mejora o degrada el rendimiento del base ni en el dominio objetivo ni en capacidades generales.

## Limitaciones y advertencias

- El modelo no ha sido evaluado: no existe ninguna medicion posterior al entrenamiento, ni sobre tau2-bench retail ni sobre benchmarks generales. Cualquier uso en produccion exige una evaluacion propia previa.
- Riesgo de sobreajuste severo: 96 pares de tarea, 1 epoca y 8 pasos de optimizacion registrados es un volumen muy reducido; es esperable un ajuste estrecho a la distribucion de esas tareas y una posible degradacion de capacidades generales.
- Las trazas de perdida publicadas no permiten inferir convergencia, tal y como advierte el propio autor, porque cada paso lee un lote distinto.
- Sesgo de simulador: los datos de interaccion se generaron con `gpt-4.1-mini` a temperatura 0, por lo que el modelo puede heredar el estilo, las asunciones y los sesgos de ese simulador, y no necesariamente generaliza a usuarios reales.
- Dominio limitado: el ajuste se restringe al dominio **retail** de tau2-bench. No hay evidencia de transferencia a otros dominios (aerolineas, telecomunicaciones) ni a tareas fuera del benchmark.
- Riesgo de contaminacion: si las 96 tareas de entrenamiento provienen del mismo banco que el split de test de tau2-bench retail, las futuras evaluaciones sobre ese split no serian indicativas de generalizacion.
- Idiomas no declarados: no hay informacion sobre el soporte multilingue especifico de este ajuste, mas alla del que herede del modelo base.
- Alucinacion: como cualquier modelo de 4 B en tareas de agente con herramientas, puede inventar identificadores de pedido, importes o politicas si no se le restringe explicitamente a consultar las fuentes.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre manteniendo el aviso de licencia y sin garantias. Conviene verificar ademas las condiciones de uso del modelo base Qwen3-4B-Instruct-2507, que son compatibles con Apache 2.0.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Fechas del repositorio: la model card figura creada y actualizada en septiembre de 2026, dato que conviene contrastar antes de citar el modelo.
- El termino "OEL" aparece como etiqueta pero no se desarrolla ni se define en la model card; no hay referencia bibliografica asociada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-retail_random_aug-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del benchmark tau2-bench (referencia externa, no citada en la model card): https://github.com/sierra-research/tau2-bench
