# Asilarkness/Budgie-500m

## Resumen

Budgie-500M es un modelo de lenguaje causal de 488 millones de parametros, desarrollado por Asilarkness como una version limpia y autonoma del mejor checkpoint retenido del proyecto TestGeniy. Esta disenado para tareas compactas de razonamiento, matematicas, logica y dialogo en ingles, con una longitud de contexto de 4.096 tokens. Su arquitectura hibrida combina atencion RoPE con capas NoPE intercaladas, e incorpora un tokenizador consciente de digitos que requiere `trust_remote_code=True` para su uso.

El modelo se presenta como una alternativa experimental de tamano reducido frente a opciones como Qwen3-0.6B, aunque el propio autor reconoce que queda por detras en las pruebas de razonamiento publicadas. Su relevancia radica en ser un ejemplo de entrenamiento compacto con filtrado de verifier y control de contaminacion de datos, orientado a quienes buscan modelos pequenos desplegables en entornos con recursos limitados. La licencia no esta especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido (RoPE + NoPE intercalado) |
| Parametros totales | 550.796.544 (488M activos declarados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en bfloat16) |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Budgie-500M usa una arquitectura transformer causal con 24 capas, tamano oculto de 1.280, 10 cabezas de consulta y 2 cabezas KV con dimension de cabeza 128. Emplea SwiGLU con tamano 3.584 y embeddings atados. La atencion combina RoPE con theta 500.000 en la mayoria de capas y atencion NoPE completa cada cuarta capa, un diseno hibrido poco comun que busca equilibrar la captura de posiciones absolutas y relativas. El tokenizador es consciente de digitos, lo que mejora el rendimiento en tareas numericas.

El entrenamiento combino datos de matematicas aumentados y filtrados por verifier (OpenMathInstruct-2, OpenR1-Math-220k, GSM8K) con reproduccion de datos de razonamiento, logica y dialogo (ARC, FOLIO, OASST1, HelpSteer2). Se aplicaron controles de contaminacion mediante coincidencia exacta normalizada y filtrado de ventanas de 12 tokens compartidos, excluyendo filas de evaluacion del entrenamiento. No se menciona el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto causal en ingles con formato de chat nativo usuario/asistente.
- Razonamiento matematico basico: resuelve problemas aritmeticos y de nivel GSM8K, aunque con precision limitada.
- Razonamiento logico: maneja tareas de logica formal del corpus FOLIO con resultados modestos.
- Dialogo conversacional: entrenado con OASST1 y HelpSteer2, puede mantener conversaciones multi-turno.
- Razonamiento paso a paso: capaz de generar explicaciones breves, aunque puede volverse repetitivo o incorrecto.
- No soporta tool calling, ni vision, ni audio segun la informacion disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: su tamano reducido permite iterar rapidamente en entornos de desarrollo sin GPU de gama alta, usando el formato de chat nativo.
- Educacion y tutorizacion basica: puede generar explicaciones de problemas aritmeticos sencillos, adecuado para aplicaciones educativas de bajo presupuesto.
- Filtrado o preprocesamiento de texto: su capacidad de generacion causal puede usarse para tareas de clasificacion o extraccion de entidades en dominios limitados.
- Investigacion academica: util como modelo de referencia para estudiar arquitecturas hibridas RoPE/NoPE y tecnicas de entrenamiento con filtrado de verifier.
- Generacion de datos sinteticos: puede producir variaciones de texto en ingles para aumentar datasets pequenos, aunque requiere supervision para evitar errores.
- Despliegue en edge o dispositivos con poca memoria: con 550M de parametros, cabe en dispositivos con 2-3 GB de RAM, permitiendo inferencia local sin conexion.

## Benchmarks y rendimiento

El autor publico una comparativa controlada con Qwen3-0.6B (modo no-thinking) usando decodificacion greedy y los mismos ejemplos. No es una ejecucion oficial de leaderboard, sino una suite de regresion pequena.

| Benchmark | n | Budgie-500M | Qwen3-0.6B (no-thinking) |
|---|---:|---:|---:|
| GSM8K | 30 | 16,67% (5/30) | 46,67% (14/30) |
| MATH-500 | 15 | 6,67% (1/15) | 13,33% (2/15) |
| ARC-Challenge | 30 | 26,67% (8/30) | 63,33% (19/30) |
| FOLIO | 30 | 33,33% (10/30) | 43,33% (13/30) |
| HelpSteer2 pairwise | 200 | 48,50% (97/200) | 50,00% (100/200) |
| Compuesto sin ponderar | 5 metricas | 26,37% | 43,33% |

Los resultados completos, divisiones, revisiones, semilla y presupuestos de tokens estan en `benchmark.json` del repositorio. Las generaciones de MATH se limitaron a 384 tokens nuevos, por lo que las respuestas verbosas pueden truncarse.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para los pesos en bfloat16, mas overhead de KV cache y activaciones, total estimado 2-3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores.
- Cabe en GPUs de consumo: si, en la mayoria de tarjetas modernas de 4 GB o mas.
- Opciones de despliegue: transformers con `trust_remote_code=True`, compatible con pipelines de Hugging Face. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (30 muestras) | Licencia |
|---|---|---|---|---|
| Budgie-500M | 550M | 4.096 | 16,67% | no disponible |
| Qwen3-0.6B | 600M | no disponible | 46,67% | no disponible |
| TinyLlama-1.1B | 1.100M | 2.048 | no disponible | apache-2.0 |

La comparativa directa con Qwen3-0.6B muestra una desventaja clara en razonamiento matematico y cientifico. TinyLlama-1.1B es un modelo de tamano similar con licencia permisiva, pero no se dispone de datos de benchmark comparables en la informacion proporcionada. Budgie-500M ofrece una arquitectura hibrida inusual y un tokenizador consciente de digitos, pero su rendimiento publicado es inferior a alternativas establecidas.

## Limitaciones y advertencias

- El modelo es experimental y queda materialmente por detras de Qwen3-0.6B en la suite de razonamiento publicada.
- Puede producir razonamiento incorrecto o repetitivo, especialmente en tareas matematicas complejas.
- Las muestras de benchmark son pequenas (n entre 15 y 200) y tienen una incertidumbre amplia; los resultados no son concluyentes.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial o modificacion.
- Requiere `trust_remote_code=True` para cargar el tokenizador y la arquitectura personalizada, lo que implica ejecutar codigo remoto no auditado.
- Solo soporta ingles; no hay soporte multilingue.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Asilarkness/Budgie-500m
- Modelo relacionado (budgie-100m): https://huggingface.co/Asilarkness/budgie-100m
- Busqueda de modelos con tag "budgie": https://huggingface.co/models?other=budgie
