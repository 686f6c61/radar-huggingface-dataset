# rehanabrar777/qwen3-1.7b-roman-urdu-tailor-workorder

## Resumen

El modelo `rehanabrar777/qwen3-1.7b-roman-urdu-tailor-workorder` es un ajuste fino mediante QLoRA del modelo base Qwen3 1.7B, desarrollado por el usuario rehanabrar777. Su proposito es convertir instrucciones de arreglos de sastreria escritas en roman urdu (urdu transcrito con alfabeto latino, a menudo mezclado con terminos en ingles) en ordenes de trabajo JSON estructuradas que un cortador pueda interpretar sin ambiguedad. Resuelve un problema muy concreto: la toma de pedidos verbal en talleres de sastreria paquistanies, donde las autocorrecciones del cliente y las instrucciones mezcladas en dos idiomas provocan errores costosos en la confeccion.

El modelo parte de la arquitectura transformer densa de Qwen3 1.7B y se distribuye como adaptador LoRA (formato PEFT) con una version cuantizada en GGUF Q4_K_M para su uso con llama.cpp y Ollama. El contexto de entrenamiento se fijo en 1152 tokens, y el sistema depende de un prompt de sistema de aproximadamente 950 tokens que debe estar presente para que el modelo funcione correctamente.

Es relevante porque demuestra que un modelo de 1.7B parametros ajustado con 245 ejemplos puede ejecutarse en un portatil con GPU de consumo (RTX 3050 Laptop de 6 GB) y superar ampliamente al modelo base en una tarea de extraccion estructurada: 96.7% frente a 40.0% en distribucion y 60.0% frente a 23.3% fuera de distribucion en fp16. Es un ejemplo de adaptacion de dominio estrecha con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA |
| Parametros totales | 1.7B (modelo base Qwen3 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1152 tokens de longitud maxima de entrenamiento (contexto nativo de Qwen3 1.7B no disponible en la informacion) |
| Tipos de cuantizacion | Q4_K_M GGUF (publicado); adaptador en fp16 y fp32 |
| Idiomas soportados | Roman urdu (ur) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT (LoRA) y GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con QLoRA sobre Qwen3 1.7B. La cuantizacion base es 4-bit NF4 con doble cuantizacion y computo en fp16, ya que la GPU utilizada (Tesla T4, sm_75) no dispone de tensor cores bf16. Los adaptadores LoRA se mantienen en fp32 para permitir el escalado de perdida. La configuracion es r=16, alpha=32, dropout 0.05, con modulos objetivo q/k/v/o/gate/up/down, lo que resulta en 17.4M parametros entrenables (1.00% del total). El entrenamiento uso learning rate 2e-4 con scheduler coseno, 3 epocas, longitud maxima de 1152 tokens y batch efectivo de 4, sin empaquetado de secuencias. Se realizo en una Tesla T4 gratuita de Colab; el autor documenta que el entrenamiento local era inviable en su maquina de desarrollo (6 GB de VRAM, OOM con bf16 y limite de commit de Windows con QLoRA 4-bit).

El conjunto de datos consta de 245 instrucciones de arreglos escritas por el autor, divididas en 245 de entrenamiento, 40 de desarrollo, 30 de evaluacion en distribucion y 30 de evaluacion fuera de distribucion. Los conjuntos de evaluacion se congelaron con SHA-256 antes de escribir el conjunto de entrenamiento y no se usaron para seleccionar el adaptador. El esquema de salida (v2) es cerrado: 12 partes, 8 acciones, cantidades anulables con granularidad de cuarto de pulgada, objetivos `set_to`, lista de cancelaciones y bandera de aclaracion. Las etiquetas se validaron contra el esquema y se auditaron para detectar casi duplicados entre divisiones (ninguno por encima de 0.9 de similitud).

## Capacidades

- Generacion de JSON estructurado a partir de instrucciones en roman urdu, con campos de parte, accion, cantidad en pulgadas, cancelaciones y necesidad de aclaracion.
- Manejo de autocorrecciones dentro de la misma frase (por ejemplo, "seena ek inch kam… ghalat, dedh inch kam").
- Manejo de retiradas de instrucciones ("zip nahi, astar badal dein").
- Deteccion de ambiguedad y activacion de la bandera `needs_clarification`.
- Vocabulario cerrado de 12 partes y 8 acciones; el modelo no inventa partes fuera de ese vocabulario (medido: 0).
- Capacidad multilingue limitada a roman urdu e ingles mezclados.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento visible util (el modo thinking debe desactivarse).

## Casos de uso

- Digitalizacion de pedidos en talleres de sastreria: el modelo convierte una instruccion verbal transcrita en un JSON que el cortador puede leer directamente, reduciendo errores de interpretacion en las medidas.
- Recepcion de pedidos en mostrador: integrado en una aplicacion de toma de notas, permite al dependiente dictar la instruccion del cliente y obtener una orden estructurada en segundos, con la bandera de aclaracion cuando la instruccion es ambigua.
- Control de calidad previo al corte: el JSON generado puede validarse contra un esquema antes de pasar a produccion, detectando cancelaciones y aclaraciones pendientes.
- Formacion de personal: el modelo puede usarse como referencia para mostrar como se descompone una instruccion compleja en partes, acciones y cantidades.
- Procesamiento por lotes de ordenes historicas: convertir notas manuscritas o transcritas en un formato estructurado para su analisis o migracion a un sistema de gestion.
- Despliegue en entornos sin conectividad: al ejecutarse en un portatil con GPU de 6 GB mediante Ollama y Q4_K_M, es adecuado para talleres sin acceso fiable a internet.
- Prototipado de pipelines de extraccion estructurada en dominios de nicho: sirve como ejemplo de adaptacion de un modelo pequeno a un esquema cerrado con pocos datos.

## Benchmarks y rendimiento

Resultados sobre datos reservados, con coincidencia exacta del registro completo (conjunto de trabajos parte/accion/cantidad, conjunto de cancelaciones y bandera de aclaracion):

| Modelo | En distribucion (30) | Fuera de distribucion, estilo no visto (30) |
|---|---|---|
| Qwen3 1.7B, mismo prompt, sin ajuste | 12/30 (40.0%) | 7/30 (23.3%) |
| Este adaptador, fp16 | 29/30 (96.7%) | 18/30 (60.0%) |
| Este adaptador, GGUF Q4_K_M (archivo publicado) | 28/30 (93.3%) | 14/30 (46.7%) |

En la division de desarrollo de 40 ejemplos el adaptador obtiene 40/40; ejecuciones anteriores de la misma receta obtuvieron 38/40, por lo que el autor situa la banda honesta en 38-40. La estructura JSON no es lo que mejora: el modelo sin ajuste ya devuelve JSON valido (30/30 en distribucion). Lo que aporta el ajuste son las decisiones: el acuerdo de aclaracion pasa de 17/30 a 30/30 en distribucion y de 13/30 a 28/30 fuera de distribucion.

Rendimiento medido en un portatil con RTX 3050 Laptop 6 GB, i5-13420H, 16 GB de RAM, Ollama 0.40.14 y Q4_K_M:

| Metrica | Valor |
|---|---|
| Prefill | 991 tokens en 0.24 s (4209 tok/s) |
| Generacion | 91 tokens en 1.12 s (81.0 tok/s) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.5-2 GB con cuantizacion Q4_K_M; el adaptador fp16 requiere el modelo base completo, en torno a 3.5-4 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M; el autor lo ha validado en una RTX 3050 Laptop de 6 GB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3050, RTX 3060, RTX 4060 y superiores. Para el adaptador fp16 se recomienda al menos 8 GB.
- Opciones de despliegue: llama.cpp, Ollama (probado con la version 0.40.14) y cualquier runtime compatible con GGUF. El adaptador PEFT puede cargarse con la libreria `peft` y transformers.
- Latencia y throughput: 4209 tok/s en prefill y 81.0 tok/s en generacion sobre RTX 3050 Laptop con Q4_K_M.
- Requisito critico: el prompt de sistema de aproximadamente 950 tokens debe estar presente; sin el, el modelo no produce respuestas utiles (medido: 0/40 con un Modelfile que solo contiene `FROM`). El modo thinking debe desactivarse (`--think=false` o `"think": false` en la API); con thinking activado no se genera JSON.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3 1.7B + QLoRA) | 1.7B (17.4M entrenables) | 1152 tokens de entrenamiento | 96.7% en distribucion, 60.0% fuera (fp16) | Apache 2.0 | Hugging Face, GGUF en el repositorio |
| Qwen3 1.7B sin ajuste | 1.7B | Contexto nativo de Qwen3 (no disponible en la informacion) | 40.0% en distribucion, 23.3% fuera | Apache 2.0 | Hugging Face |
| Modelos de mayor tamano (genericos) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de otros modelos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- Solo admite pulgadas: los centimetros estan fuera del alcance; ningun ejemplo de entrenamiento los usa y anadir una regla de unidad no entrenada produjo peores resultados que declarar la limitacion.
- Ortografias poco frecuentes (`jb` por bolsillo, `aastn` por manga, `girban` por cuello) son el area mas debil y donde la cuantizacion causa mas errores.
- Dos ediciones de la misma region corporal en una sola clausula es el patron mas dificil que persiste.
- El modelo nunca inventa partes fuera del vocabulario de 12 valores (medido: 0), pero puede omitir una cantidad en la que no confia.
- La cuantizacion Q4_K_M erosiona primero la generalizacion mas dificil: pierde un ejemplo en distribucion y cuatro fuera de distribucion respecto a fp16.
- El prompt de sistema de aproximadamente 950 tokens es obligatorio; sin el, el modelo no responde de forma util.
- El modo thinking debe estar desactivado; de lo contrario el presupuesto de tokens se consume en razonamiento visible y no se genera JSON.
- El modelo esta entrenado exclusivamente para la tarea de ordenes de sastreria; no es un modelo de proposito general.
- Riesgo de alucinacion en cantidades o partes no contempladas por el esquema, aunque el autor reporta cero invenciones de partes en la evaluacion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion fuera del dominio evaluado.
- El conjunto de datos es pequeno (245 ejemplos) y escrito por un solo autor, lo que limita la diversidad de estilos y puede reducir la generalizacion a variantes regionales del roman urdu.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rehanabrar777/qwen3-1.7b-roman-urdu-tailor-workorder
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Conjunto de datos: https://huggingface.co/datasets/rehanabrar777/roman-urdu-tailor-workorders
- Repositorio del proyecto con las reglas de etiquetado: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
