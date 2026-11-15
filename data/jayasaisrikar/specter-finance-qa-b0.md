# jayasaisrikar/specter-finance-qa-b0

## Resumen

SPECTER arm B0 es un ajuste fino supervisado del modelo CohereLabs/tiny-aya-global, publicado por el usuario jayasaisrikar como parte de un estudio sobre deriva de seguridad (safety drift) en el ajuste fino de modelos de preguntas y respuestas financieras. No es un modelo de produccion, sino un artefacto de investigacion: el brazo de control "limpio" del estudio SPECTER, entrenado exclusivamente con datos de tarea (542 pares de QA financiero) y sin filas adversariales, para medir que le hace el ajuste fino de dominio al comportamiento de rechazo del modelo base.

El modelo parte de tiny-aya-global, un transformer de la familia Aya de Cohere Labs, y conserva sus 3.349.227.520 parametros (~3,35 mil millones). Se ha publicado como pesos completos fusionados (~6,7 GB en safetensors), con la LoRA (r16, alpha 32, dropout 0.05 sobre siete modulos de atencion y MLP) ya integrada en el modelo base. La relevancia actual es metodologica: proporciona cifras de rechazo de contenido danino en cinco idiomas, precision financiera, abstencion correcta y resistencia a inyeccion de prompts sobre un holdout congelado, con intervalos de confianza Wilson del 95 %, lo que permite comparar metodos de reparacion de seguridad bajo condiciones reproducibles.

El autor advierte explicitamente de que ningun brazo del estudio supera la puerta de liberacion y de que el modelo no debe usarse como asistente financiero en produccion. La ficha, por tanto, debe leerse como documentacion de un experimento de evaluacion, no como la de un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Cohere2, segun tags de Hugging Face); detalles de capas y atencion no disponibles |
| Parametros totales | 3.349.227.520 (~3,35 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | No declarados en la model card; el estudio evalua rechazo en ingles, arabe, espanol, frances y tagalo |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos completos fusionados, ~6,7 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base CohereLabs/tiny-aya-global, un transformer decoder-only de ~3,35 B de parametros. El metodo de entrenamiento es PlainSFT (implementado en el trainer `safetune 0.1.10`, metodo `harden.PlainSFT`), es decir, ajuste fino supervisado convencional sobre datos de tarea, sin RLHF ni DPO declarados. Se aplico una LoRA con rango 16, alpha 32 y dropout 0.05 sobre siete modulos objetivo de atencion y MLP, que posteriormente se fusiono en el modelo base para la publicacion de los pesos completos.

Los datos de entrenamiento son 542 pares de preguntas y respuestas financieras del dataset `jayasaisrikar/specter-finance-qa`, sin ninguna fila adversarial. La reproducibilidad esta documentada con el commit de codigo `e4ab0e9`, el plan de evaluacion `070f6281...` (estado APPROVED), el digest del holdout `f196f08a...`, semilla 0 y una tasa de contaminacion declarada r=0.1. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del corpus ni innovaciones arquitectonicas propias; el interes tecnico del artefacto reside en el protocolo de evaluacion (holdout congelado, intervalos Wilson, juez WildGuard) mas que en el entrenamiento en si.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas de dominio financiero, heredadas del ajuste sobre pares QA.
- Razonamiento de dominio limitado: la precision financiera medida es del 65,0 % (26/40) en el holdout, con tendencia a confabular cifras cuando el dato no esta en el contexto.
- Rechazo de peticiones daninas: 82,0 % en ingles (164/200) y entre el 56,0 % y el 68,0 % en arabe, espanol, frances y tagalo.
- Abstencion ante informacion ausente: solo 40,0 % de abstencion correcta (16/40), por lo que la capacidad de decir "no lo se" es debil.
- Cita de fuentes: soporte de citacion del 65,0 % (26/40) en las respuestas evaluadas.
- Capacidades multilingues: el modelo base tiny-aya-global es multilingue, pero el estudio solo mide rechazo en cinco idiomas y no se declaran idiomas oficialmente soportados.
- No se documentan en la informacion disponible soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre safety drift: utilizar el modelo como brazo de control limpio para medir cuanto degrada el ajuste fino de dominio el comportamiento de rechazo respecto al base tiny-aya-global, comparando las tasas de rechazo por idioma con las de los brazos C y E.
- Benchmarking de metodos de reparacion de seguridad: servir de referencia para evaluar tecnicas de alineacion posteriores (por ejemplo, el brazo E) sobre el mismo holdout congelado y el mismo plan de evaluacion versionado.
- Auditoria de confabulacion en dominios numericos: emplear la metrica de abstencion correcta (40,0 %) y el comportamiento observado de inventar cifras para estudiar tecnicas de calibracion y deteccion de alucinacion en QA financiero.
- Evaluacion de robustez frente a inyeccion de prompts: el modelo muestra un 97,5 % de cumplimiento de inyeccion (39/40, lower-is-better), lo que lo convierte en un caso de estudio util para medir la eficacia de defensas en modelos pequenos multilingues.
- Pruebas de fuga de canario en pipelines de datos: con 92,5 % de fuga (37/40) frente al 100 % del base, sirve para validar mecanismos de deteccion de memorizacion de cadenas canario durante el ajuste fino.
- Reproduccion de experimentos: regenerar las cifras con `specter run --plan plans/finance-qa-v1.json` desde el commit indicado, util para verificar la trazabilidad de resultados en publicaciones.
- Docencia y formacion en evaluacion de modelos: ejemplo didactico de model card con intervalos de confianza, metricas direccionales y caveats explicitos sobre el juez automatico.

## Benchmarks y rendimiento

Resultados medidos en el holdout congelado de este run (juez WildGuard para las metricas de rechazo):

| Metrica | k/n | Valor | IC 95 % Wilson | Direccion |
|---|---|---|---|---|
| `harmful_refusal_en` | 164/200 | 82,0 % | 0,761 - 0,867 | Mayor es mejor |
| `harmful_refusal_ar` | 29/50 | 58,0 % | 0,442 - 0,706 | Mayor es mejor |
| `harmful_refusal_es` | 31/50 | 62,0 % | 0,482 - 0,741 | Mayor es mejor |
| `harmful_refusal_fr` | 34/50 | 68,0 % | 0,542 - 0,792 | Mayor es mejor |
| `harmful_refusal_tl` | 28/50 | 56,0 % | 0,423 - 0,688 | Mayor es mejor |
| `finance_accuracy` | 26/40 | 65,0 % | 0,495 - 0,779 | Mayor es mejor |
| `over_refusal` | 3/40 | 7,5 % | 0,026 - 0,199 | Menor es mejor |
| `correct_abstention` | 16/40 | 40,0 % | 0,263 - 0,554 | Mayor es mejor |
| `citation_support` | 26/40 | 65,0 % | 0,495 - 0,779 | Mayor es mejor |
| `canary_leak` | 37/40 | 92,5 % | 0,801 - 0,974 | Menor es mejor |
| `injection_compliance` | 39/40 | 97,5 % | 0,871 - 0,996 | Menor es mejor |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 6,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 8-10 GB para contextos moderados.
- Cuantizacion: no se publican pesos GGUF ni cuantizados; habria que generarlos a partir de los safetensors. En 4 bits, el modelo rondaria los 1,7-2 GB de pesos, pero esta cifra es una estimacion, no un dato del autor.
- GPU recomendadas: para fp16, una RTX 4090 (24 GB) o A100/H100 dejan margen amplio; tambien cabe en GPUs consumer de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) con contextos moderados.
- Despliegue: al ser un modelo transformers con pesos safetensors, es compatible con vLLM, TGI y transformers estandar; llama.cpp y Ollama requeririan conversion previa a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPECTER arm B0 (este) | 3,35 B | No disponible | QA financiero + estudio de safety drift | No disponible | Hugging Face, pesos safetensors |
| CohereLabs/tiny-aya-global | 3,35 B (no confirmado en la informacion) | No disponible | Modelo base multilingue | No disponible | Hugging Face (brazo A del estudio) |
| SPECTER arm C | No disponible | No disponible | Otro brazo del estudio SPECTER | No disponible | Publicado segun la model card |
| SPECTER arm E | No disponible | No disponible | Brazo con reparacion de seguridad | No disponible | Publicado segun la model card |

La model card menciona ademas el brazo B (datos de tarea mas filas adversariales), retenido por decision de gating del PRD, y el brazo A, que es el propio tiny-aya-global. No se dispone de datos de rendimiento de los brazos C y E en la informacion proporcionada, salvo la referencia a que E reduce la fuga de canario a 24/40.

## Limitaciones y advertencias

- No es un asistente financiero de produccion: el autor lo declara explicitamente como artefacto de investigacion.
- Ningun brazo del estudio supera la puerta de liberacion; un PASS significa "cumple este plan versionado en estas condiciones", nunca "es seguro".
- WildGuard no esta validado fuera del ingles, por lo que las tasas de rechazo en arabe, espanol, frances y tagalo deben citarse con esa salvedad.
- Alta tendencia a la confabulacion: con 40,0 % de abstencion correcta, el modelo tiende a responder con una cifra inventada en lugar de declinar cuando el dato no esta en el contexto.
- La metrica de fuga de canario es practicamente no informativa en este caso, porque el modelo base ya emite la cadena canario (40/40 en el brazo A).
- El cumplimiento de inyeccion de prompts es del 97,5 %, lo que indica una robustez muy baja frente a instrucciones maliciosas embebidas en el contexto.
- Licencia no disponible: no puede asumirse permiso para uso comercial ni redistribucion; hay que consultar al autor.
- Idiomas oficialmente soportados no declarados; la evaluacion multilingue es parcial y limitada a cinco idiomas.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.
- Sesgos conocidos: no documentados en la informacion disponible, mas alla del sesgo linguistico implicito en el desequilibrio de evaluacion (200 muestras en ingles frente a 50 por idioma en el resto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jayasaisrikar/specter-finance-qa-b0
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset de entrenamiento: https://huggingface.co/datasets/jayasaisrikar/specter-finance-qa
- Dataset de resultados: https://huggingface.co/datasets/PraiseA/specter-v3-results
