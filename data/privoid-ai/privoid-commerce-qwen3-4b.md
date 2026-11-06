# Privoid-ai/Privoid-Commerce-Qwen3-4B

## Resumen

Privoid-Commerce-Qwen3-4B es un adaptador LoRA desarrollado por Privoid-ai sobre el modelo base Qwen/Qwen3-4B (revision `1cfa9a7208912126459214e8b04321603b3df60c`). Se trata de la continuacion de un adaptador anterior, Privoid Tool, y esta especializado en tool calling para dominios de comercio electronico: pedidos, envios, devoluciones, reembolsos, cambios, carrito y busqueda de productos. No es un modelo de proposito general ni un chatbot conversacional, sino un componente pensado para integrarse en asistentes de tienda privados que operan sobre un catalogo de herramientas definido por la aplicacion.

El modelo se distribuye exclusivamente como pesos de adaptador PEFT (safetensors), con un tamano de repositorio de aproximadamente 0,1 GB, lo que implica que requiere descargar el modelo base Qwen3-4B para funcionar. La licencia declarada es Apache 2.0, heredada del modelo base. El adaptador se entrena con el formato nativo de tool call de Qwen3 y con el modo de razonamiento (thinking) desactivado.

Su relevancia actual radica en que ofrece una mejora medible y estadisticamente significativa en tareas de function calling sobre el modelo base: en 956 ejemplos reservados, la tasa de exito sube +0,240 puntos (rango del 95 %: +0,189 a +0,296) frente a Qwen3-4B y +0,199 frente a Privoid Tool. Sin embargo, el propio autor advierte que esta mejora no se traslada a acciones minoristas de multiples pasos, donde el rendimiento es inferior al del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3 (modelo base Qwen/Qwen3-4B) |
| Parametros totales | No disponible para el adaptador; modelo base de 4B (aproximado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, subcarpeta `adapter`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre el modelo Qwen3-4B, con `library_name: peft` y pesos en safetensors. Se inicializa a partir de Privoid Tool (continuacion del entrenamiento), lo que sugiere una cadena de ajustes incrementales orientados a tool calling. El formato de llamada a herramientas es el nativo de Qwen3, con el bloque `<tool_call>{"name": ..., "arguments": {...}}</tool_call>` y el modo de razonamiento desactivado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El autor reporta que el adaptador requiere el modelo base en la revision exacta indicada y que, una vez descargados ambos, la inferencia puede ejecutarse sin conexion a internet. La evaluacion se realizo sobre 956 ejemplos reservados con intervalos de confianza del 95 % calculados mediante remuestreo de plantillas y familias de clientes, lo que aporta robustez estadistica a las cifras publicadas. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de llamadas a herramientas (tool calling) en formato nativo Qwen3 para operaciones de comercio electronico: consulta de estado de pedido, envio, devolucion, reembolso, cambio, carrito y busqueda de producto.
- Seleccion de herramienta entre un catalogo definido, con una tasa reportada de 0,902 en el conjunto de evaluacion.
- Generacion de argumentos correctos para la llamada, con una tasa de 0,758 en el conjunto de evaluacion.
- Validez de esquema (schema validity) de 0,999, lo que indica un cumplimiento casi total del formato esperado.
- Manejo de herramientas no disponibles (1,000 en el subset `unavailable_tool`) y de esquemas no vistos (1,000 en `unseen_schema`).
- Gestion de conversaciones multiturno (1,000 en `multi_turn`) y de solicitudes ambiguas (0,591 en `ambiguous`, frente a 0,136 del modelo base).
- Capacidad de pedir informacion faltante (1,000 en `missing_info`) y de no invocar herramientas cuando no es necesario (1,000 en `no_tool_needed`).
- No se documentan capacidades de vision, audio, matematicas avanzadas ni razonamiento general; el modelo esta orientado exclusivamente a tool calling.

## Casos de uso

- Asistente de seguimiento de pedidos: el modelo propone llamadas a `get_order_status` con el identificador de pedido extraido del mensaje del usuario, lo que permite construir un flujo de consulta de estado con validacion posterior en la aplicacion.
- Gestion de devoluciones y reembolsos: dado un catalogo de herramientas de devolucion, el adaptador selecciona la funcion adecuada y genera los argumentos, aunque el autor advierte que las escrituras de multiples pasos deben validarse y confirmarse con un humano.
- Busqueda de productos en tienda: el modelo traduce consultas en lenguaje natural a llamadas de busqueda con filtros, apoyandose en su alta validez de esquema (0,999) para integrarse en un pipeline de recuperacion.
- Atencion al cliente multiturno: su rendimiento perfecto en `multi_turn` y `missing_info` lo hace adecuado para conversaciones en las que debe solicitar datos antes de invocar una herramienta.
- Integracion en agentes con catalogo de herramientas cambiante: su buen resultado en `unseen_schema` (1,000) permite desplegarlo en entornos donde se anaden o modifican herramientas sin reentrenar.
- Filtrado y enrutamiento de intenciones: la baja tasa de llamadas innecesarias (0,048) y el manejo de `no_tool_needed` (1,000) permiten usarlo como capa de decision previa a la ejecucion de acciones.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse sin conexion tras la descarga del modelo base y el adaptador, encaja en arquitecturas on-premise para tiendas con datos sensibles.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 956 ejemplos reservados:

| Metrica | Qwen3-4B | Privoid Tool | Privoid Commerce |
|---|---:|---:|---:|
| Task score | 0,698 | 0,852 | 0,928 |
| Tool selection | 0,884 | 0,882 | 0,902 |
| Tool-call precision | 0,877 | 0,887 | 0,892 |
| Tool-call recall | 0,884 | 0,882 | 0,902 |
| Schema validity | 0,973 | 0,967 | 0,999 |
| Argument correctness | 0,518 | 0,525 | 0,758 |
| Complete call correctness | 0,518 | 0,525 | 0,758 |
| Unnecessary tool-call rate (menor es mejor) | 0,101 | 0,106 | 0,048 |

Desglose por subconjunto:

| Subconjunto | Ejemplos | Qwen3-4B | Privoid Tool | Privoid Commerce |
|---|---:|---:|---:|---:|
| adversarial_result | 36 | 1,000 | 1,000 | 1,000 |
| ambiguous | 22 | 0,136 | 0,091 | 0,591 |
| competing_tools | 72 | 0,903 | 0,972 | 0,972 |
| familiar_new_request | 108 | 0,870 | 0,954 | 0,981 |
| missing_info | 54 | 1,000 | 1,000 | 1,000 |
| multi_turn | 54 | 1,000 | 1,000 | 1,000 |
| no_tool_needed | 13 | 1,000 | 1,000 | 1,000 |
| qrz_canonical | 170 | 0,441 | 0,382 | 0,847 |
| qrz_heldout_schema | 180 | 0,272 | 0,311 | 0,833 |
| tau_retail_write | 157 | 0,223 | 0,178 | 0,197 |
| unavailable_tool | 45 | 0,222 | 1,000 | 1,000 |
| unseen_schema | 45 | 0,978 | 1,000 | 1,000 |

Cambio de exito frente a Qwen3-4B: +0,240 (rango del 95 %: +0,189 a +0,296). Frente a Privoid Tool: +0,199 (rango del 95 %: +0,163 a +0,241). En `tau_retail_write`, el cambio frente a Qwen3-4B es de -0,025 (rango del 95 %: -0,060 a +0,006), es decir, sin ganancia demostrada. El autor aclara que `tau_retail_write` es una reproduccion offline de tareas de test de τ-bench retail y no la puntuacion oficial de τ-bench, por lo que no debe compararse con cifras de leaderboard. No se comparo ningun modelo frontera en esta evaluacion.

## Requisitos de hardware

- VRAM estimada: el autor reporta un pico de memoria GPU asignada de 11,0 GB para el modelo base y 11,7 GB para el modelo ajustado durante la evaluacion por lotes, sobre una NVIDIA L4.
- GPU recomendadas: NVIDIA L4 (usada en la evaluacion), asi como A100, H100 o RTX 4090 por su mayor memoria y ancho de banda; el modelo base de 4B en bfloat16 ocupa aproximadamente 8 GB de pesos, por lo que cabe en GPUs de consumo con 12 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090), dependiendo de la cuantizacion del modelo base.
- Opciones de despliegue: el autor documenta inferencia con `transformers` + `peft` en CUDA con bfloat16. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; al ser un adaptador PEFT, su integracion con servidores de inferencia depende del soporte de LoRA del motor elegido.
- Latencia: mediana de 2,63 s sin ajuste y 4,79 s con ajuste, en peticiones de una en una sobre NVIDIA L4, muestreada en 20 ejemplos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Task score (evaluacion del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid-Commerce-Qwen3-4B | 4B (base) + LoRA | No disponible | 0,928 | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-4B | 4B | No disponible | 0,698 | No disponible en la informacion | Hugging Face |
| Privoid Tool | 4B (base) + LoRA | No disponible | 0,852 | No disponible en la informacion | No disponible |

No se dispone de datos de otros adaptadores de tool calling comparables en la informacion proporcionada. El autor no compara con modelos frontera ni con alternativas de la misma categoria distintas de las dos anteriores.

## Limitaciones y advertencias

- No es un chatbot general: el autor lo define como un componente para asistentes de tienda sobre un catalogo de herramientas concreto.
- El modelo solo propone llamadas; la aplicacion debe validar cada llamada y gestionar autorizacion y confirmacion. Una salida del modelo nunca establece permisos.
- En acciones minoristas de multiples pasos (`tau_retail_write`) rinde peor que el modelo base: 0,197 frente a 0,223 (cambio de -0,025). Aproximadamente cuatro de cada cinco de estas escrituras siguen fallando; no debe usarse para modificar pedidos sin validacion y confirmacion humana.
- El propio autor indica que los resultados no demuestran readiness para produccion.
- Parte de los datos de test es sintetica; las puntuaciones de "ask" y "decline" se juzgan por patrones de texto y son aproximadas.
- La reproduccion de τ-bench no es la puntuacion oficial y no es comparable con leaderboards.
- Riesgo de alucinacion en la generacion de argumentos: la correccion de argumentos es de 0,758, por lo que una parte relevante de las llamadas completas es incorrecta.
- No se documentan sesgos conocidos, limitaciones de idioma ni restricciones adicionales de licencia comercial mas alla de la Apache 2.0 declarada.
- Requiere el modelo base en la revision exacta indicada; usar otra revision puede degradar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Privoid-ai/Privoid-Commerce-Qwen3-4B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Resultados de benchmark en JSON: `benchmark/benchmark.json` (incluido en el repositorio del modelo)
- Imagen de benchmark: `benchmark/benchmark.png` (incluida en el repositorio del modelo)
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos.
