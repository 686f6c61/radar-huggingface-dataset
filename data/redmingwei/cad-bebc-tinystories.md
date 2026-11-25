# redmingwei/cad-bebc-tinystories

## Resumen

CAD-BEBC (Continuous Autoregressive Diffusion with Block-External Bidirectional Causality) es un experimento de investigacion publicado por el usuario redmingwei en Hugging Face. Se trata de un sistema de difusion de caracter continuo entrenado sobre texto real de TinyStories, cuyo objetivo es estudiar si una atajo de bajo rango internalizado entre pasos puede reducir el numero de evaluaciones del backbone necesarias durante el muestreo. El modelo es de escala juguete: el backbone de difusion tiene 23.232 parametros y el experto externo congelado (un Mini-LLaMA) 25.056 parametros.

La relevancia del artefacto no esta en sus capacidades generativas, sino en el analisis empirico que acompana a los pesos: una comparacion a computo igualado que sugiere que el atajo alcanza la calidad de una cadena DDIM de ocho evaluaciones con una sola evaluacion del backbone, a cambio de un MSE aproximadamente un 5 % peor. El autor documenta de forma explicita que la decodificacion de texto produce basura y que la ruta entrenada es la de latentes continuos, no la de texto.

El modelo se distribuye como un unico fichero safetensors con 22 tensores, acompanado de metricas de entrenamiento y del log completo. La licencia es Apache 2.0 y depende de la toolchain mora-lang (BSD-3-Clause) y del repositorio mora-llm-diffusion. No es un modelo listo para produccion ni para uso generativo general; es material reproducible para investigacion sobre muestreo de difusion y destilacion de pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion continua (proceso VP con betas lineales) con backbone transformer de 2 capas y estructura causal inter-bloque; muestreador DDIM en parametrizacion x0 |
| Parametros totales | 23.232 (backbone de difusion) + 1.024 (proyeccion de condicion) + 25.056 (experto externo congelado Mini-LLaMA) + componentes auxiliares (U, V, W_blk, gates) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuracion describe 4 bloques x 4 tokens = 16 posiciones por ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre TinyStories, corpus en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`cad_bebc_trained.safetensors`, 22 tensores) |

## Arquitectura y entrenamiento

El sistema combina un backbone de difusion de 23.232 parametros (2 capas, d_model 32, 4 bloques de 4 tokens) con una proyeccion de condicion de 1.024 parametros que inyecta la observacion de forma aditiva, no concatenada. Sobre esa base se anaden un atajo de bajo rango entre pasos (tres pares U, V de 32 x 8), una matriz de estructura causal inter-bloque W_blk de 4 x 4, una skip gate (w_g, b_g de 3 x 32 y 3) y una competition gate (w_comp, b_comp de 32 y 1). El experto externo congelado es un Mini-LLaMA de 25.056 parametros que actua como profesor.

El proceso forward es de varianza preservante con betas lineales (beta_start 0,05, beta_end 0,5) y el muestreo usa DDIM en parametrizacion x0 con eta = 0. La observacion se proyecta sobre la trayectoria VP en `infer_start_step` (8, el schedule completo) y se muestrea hasta t = 0. El entrenamiento consta de dos fases: 400 pasos de preentrenamiento del backbone sobre ventanas reales del corpus bajo el proceso VP y 720 pasos de consolidacion en la fase de emergencia con compuerta de error, sobre 2.000.000 de bytes de TinyStories. No se documenta RLHF ni DPO.

La innovacion tecnica central es el atajo de bajo rango internalizado, que permite saltar segmentos de la cadena de muestreo. El autor reporta que el sesgo de la skip gate b_g queda en 1,2697 y el acoplamiento inter-bloque en 0,3673. Tambien advierte que el acoplamiento se mueve en la direccion que soportan los datos (0,36788 a 0,36726, es decir, un aislamiento ligeramente mas fuerte) y que antes la matriz W_blk inicial estaba exactamente en el limite del clamp, por lo que cualquier gradiente que aumentase el acoplamiento se recortaba.

## Capacidades

- Generacion de latentes continuos sobre ventanas de texto de TinyStories; la ruta de decodificacion a texto no funciona correctamente.
- Muestreo de difusion con DDIM en parametrizacion x0 y schedule VP de 8 pasos.
- Salto de segmentos de la cadena de muestreo mediante el atajo de bajo rango internalizado (5 segmentos saltados con 1 evaluacion del backbone).
- Condicionamiento aditivo sobre la observacion proyectada en la trayectoria VP.
- Estructura causal inter-bloque configurable mediante W_blk.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de un LLM de proposito general.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento es TinyStories en ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre destilacion de pasos en difusion: el modelo sirve como banco de pruebas reproducible para medir si un atajo internalizado entre pasos reduce el numero de evaluaciones del backbone manteniendo la calidad, con metricas MSE ya publicadas.
- Estudio de muestreadores DDIM en regimen de condicion fuerte: el autor documenta que el multi-paso DDIM empeora respecto al paso unico (0,0472 a una evaluacion frente a 0,0501 a ocho), lo que convierte al modelo en un caso de analisis para investigar el sesgo de la prediccion x0 y la acumulacion de error en el canal eps-theta.
- Reproduccion de experimentos de toolchain: permite validar el pipeline de mora-lang v0.111.0 y mora-llm-diffusion en un entorno de escala minima antes de escalar a configuraciones mayores.
- Docencia y divulgacion sobre difusion continua: con 23.232 parametros en el backbone, el modelo cabe en cualquier equipo y permite inspeccionar tensor a tensor el mecanismo de proyeccion de condicion, gates y atajo.
- Analisis de estabilidad numerica y reproducibilidad: el autor documenta que el checkpoint es equivalente en valor entre maquinas (diferencias de ~1e-16, MSE de inferencia con diferencias de 2,5e-14) pero no byte-identico por el orden de suma en coma flotante; util para estudiar determinismo en entrenamiento distribuido.
- Comparacion a computo igualado de estrategias de muestreo: la tabla de evaluaciones del backbone frente a MSE permite contrastar el atajo contra cadenas DDIM de 1 a 8 evaluaciones sobre las mismas 12 ventanas held-out.

## Benchmarks y rendimiento

Evaluacion sobre 12 ventanas held-out del corpus real:

| Metrica | Valor |
|---|---|
| Train loss (final) | 0,1062 |
| Full-path MSE | 0,0458 |
| Shortcut-path MSE | 0,0528 |
| Observation baseline MSE | 0,1046 |
| Backbone NFE (shortcut path) | 1,0 |
| Shortcut segments skipped | 5,0 |
| Skip gate bias b_g | 1,2697 |
| Inter-block coupling | 0,3673 |

Comparacion a computo igualado (mismas 12 ventanas held-out):

| Evaluaciones del backbone | DDIM MSE |
|---|---|
| 1 | 0,0472 |
| 2 | 0,0480 |
| 3 | 0,0486 |
| 4 | 0,0490 |
| 5 | 0,0493 |
| 6 | 0,0496 |
| 7 | 0,0499 |
| 8 | 0,0501 |
| Shortcut path: 1 evaluacion, 5 segmentos saltados | 0,0528 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repositorio ocupa 0,0 GB y el conjunto de tensores ronda las decenas de miles de parametros, por lo que cabe holgadamente en CPU.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de MB de memoria; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo, e incluso en CPU, dado el tamano del backbone (23.232 parametros) y del experto (25.056 parametros).
- Opciones de despliegue: carga directa de safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y estos frameworks no estan pensados para esta arquitectura de difusion.
- Latencia y throughput estimados: no disponibles; el autor reporta NFE (evaluaciones del backbone) de 1,0 en la ruta del atajo, pero no tiempos absolutos.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (difusion continua de escala juguete con atajo internalizado entre pasos sobre TinyStories). Como referencia de escala, el propio modelo incluye un Mini-LLaMA congelado de 25.056 parametros que actua como experto profesor, pero no se trata de una alternativa de despliegue.

## Limitaciones y advertencias

- La decodificacion de texto produce basura ("h8 wh|g.h k .b"); el experto Mini-LLaMA solo se preentreno sobre un corpus juguete y la ruta unificada de texto decodifica a traves de el. La unica ruta entrenada es la de latentes continuos.
- El multi-paso DDIM es peor que el paso unico en este modelo (0,0472 a una evaluacion frente a 0,0501 a ocho). El autor atribuye el fenomeno a que el canal eps-theta de DDIM realimenta el error de prediccion x0 en el estado y, con una condicion muy fuerte, la prediccion x0 esta sesgada y el error se acumula. La afirmacion de "NFE 8 a 2" es una afirmacion de computo, no de precision.
- El checkpoint es reproducible en valor pero no byte-identico entre maquinas: las diferencias de orden de suma en coma flotante entre x86-64 y ARM hacen que el SHA-256 difiera aunque el modelo sea equivalente (MSE de inferencia con diferencias de 2,5e-14).
- No hay informacion sobre sesgos del corpus mas alla del propio TinyStories; no se documentan evaluaciones de sesgo ni de alucinacion.
- El modelo no es apto para uso comercial como generador de texto: no genera texto legible y su escala es de juguete.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero el proyecto depende de mora-lang (BSD-3-Clause) y de TinyStories (`roneneldan/TinyStories`); deben respetarse los avisos de terceros del repositorio.
- No se documenta soporte multilingue ni contexto extendido; la configuracion descrita opera sobre ventanas de 16 posiciones (4 bloques x 4 tokens).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/redmingwei/cad-bebc-tinystories
- Repositorio de implementacion: https://github.com/Microbiosis/mora-llm-diffusion
- Toolchain mora-lang: https://github.com/Microbiosis/mora-lang
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
