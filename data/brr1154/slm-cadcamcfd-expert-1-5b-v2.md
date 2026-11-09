# BRR1154/SLM-CadCamCfd-Expert-1.5B-v2

## Resumen
SLM-CadCamCfd-Expert-1.5B-v2 es un modelo de lenguaje pequeno (SLM) especializado en ingenieria, desarrollado por Bhavanam Rajendra Reddy (Runtime-Slayers) y publicado en Hugging Face bajo el identificador BRR1154. Se construye sobre Qwen2.5-Coder-1.5B-Instruct mediante una tecnica de edicion de pesos denominada "null-space surgery", en la que un modelo oraculo de gran tamano (NVIDIA Nemotron-3-Ultra-550B) diagnostica fallos de ejecucion en MATLAB y guia una proyeccion ortogonal de los deltas de pesos sobre el subespacio nulo de las activaciones base. El objetivo declarado es inyectar conocimiento de dominios de ingenieria (CAD, CAM, CFD, MATLAB, analisis por elementos finitos, aeroespacial) sin provocar olvido catastrofico del conocimiento de codigo general del modelo base.

El modelo mantiene el techo de 1.54B parametros del Qwen2.5-Coder-1.5B y se distribuye como un delta de pesos en SafeTensors (577.50 MB) que debe sumarse a los pesos del modelo base. La propuesta es relevante porque sugiere una via de bajo coste computacional para especializar SLMs en nichos tecnicos sin reentrenamiento completo, aunque las cifras de rendimiento declaradas son autoinformadas y no verificadas por terceros.

La ficha se basa exclusivamente en la model card y los metadatos publicados por el autor; no se dispone de informacion independiente sobre el proceso de entrenamiento ni sobre validacion externa de los benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.54B (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32 768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el autor solo publica delta en bfloat16 SafeTensors) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (delta quirurgico `surgical_weights_delta_v2.safetensors`, 577.50 MB) que se suma al modelo base |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B-Instruct, con atencion causal estandar y sin modificaciones estructurales. No se realiza un fine-tuning convencional: el autor describe un pipeline de "weight surgery" en el que un oraculo (NVIDIA Nemotron-3-Ultra-550B) diagnostica 128 trazas de ejecucion fallidas en MATLAB, localiza las capas causales de fallo (MLP `down_proj` en las capas 16-26) y extrae direcciones de activacion para guiar la sintaxis. Sobre esa base se aplica una proyeccion ortogonal al subespacio nulo mediante Gram-Schmidt: `ΔW_proj = ΔW · (I - V_k · V_k^T)`, con `V_k` los 16 vectores singulares principales de la covarianza de activaciones, imponiendo la condicion `ΔW_proj · V_base = 0` para preservar el comportamiento del modelo base. Finalmente se aplica un clamping de la norma de Frobenius a un maximo del 8.2% de la norma base.

No se especifican en la model card el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. La validacion declarada se realizo con un motor headless de MATLAB R2024b y Python 3.13 sobre 2 564 aserciones granulares, pero no se aportan detalles sobre el conjunto de datos de evaluacion mas alla de los nombres de benchmark (MultiPL-E MATLAB & Engineering 1000 y HumanEval Python 1000).

## Capacidades
- Generacion de codigo en Python y MATLAB con enfasis en dominios de ingenieria.
- Mecanica estructural aeroespacial: parametrizacion de mamparos (bulkheads) compatible con CATIA y Siemens NX, calculo de momento de inercia de costillas de ala, interpolacion de perfiles aerodinamicos con splines cubicos naturales.
- CFD compresible: abanicos de expansion supersonicos, flujo de Prandtl-Meyer, resolucion de angulos de onda de choque oblicua, distribucion de presion transonica.
- Analisis por elementos finitos (FEA): ensamblaje de matrices de rigidez en tension/deformacion plana, flexion de viga de Timoshenko, desplazamiento de celosia 2D bajo carga.
- Estimacion de estado: filtro de Kalman discreto para seguimiento de trayectoria de cohetes y fusion de sensores IMU.
- CAM multieje: calculo de trayectorias de herramienta rotativas de 5 ejes continuos, stepover de fresado trocoidal y formateo de codigo G.
- Generacion de texto conversacional en ingles (pipeline `text-generation`).
- No se declara soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso
- Generacion de scripts MATLAB para calculo estructural: el modelo puede producir funciones de calculo de momentos de inercia, ensamblaje de matrices de rigidez y postproceso de resultados FEA, aprovechando su especializacion en sintaxis MATLAB validada con `checkcode`.
- Automatizacion de postproceso CFD: generacion de codigo para calcular angulos de Prandtl-Meyer, ondas de choque oblicuas y distribuciones de presion transonica en flujos compresibles, reduciendo el tiempo de escritura de utilidades de analisis.
- Generacion de codigo G para mecanizado de 5 ejes: el modelo puede producir trayectorias trocoidales y formatear codigo G a partir de parametros de herramienta y material, adecuado para prototipado rapido en talleres CNC.
- Asistente de codigo en pipelines de ingenieria: al estar integrado sobre Qwen2.5-Coder, puede usarse como autocompletado o generacion de funciones en repositorios de simulacion, con la ventaja de su bajo coste de inferencia (1.54B parametros).
- Prototipado de filtros de Kalman para navegacion: generacion de implementaciones discretas para seguimiento de trayectoria y fusion IMU en proyectos de cohetes o drones, un dominio donde el modelo declara capacidad especifica.
- Educacion tecnica y generacion de ejemplos: produccion de ejemplos de codigo MATLAB/Python para cursos de metodos numericos, FEA o CFD, con la salvedad de que las salidas deben revisarse por posible alucinacion.
- Despliegue en entornos con recursos limitados: al ser un SLM de 1.54B, puede ejecutarse en GPU de consumo y en CPU con cuantizacion (aunque el autor no publica versiones GGUF), lo que facilita su uso en estaciones de trabajo de ingenieria sin infraestructura dedicada.

## Benchmarks y rendimiento
Datos declarados por el autor en la model card (no verificados por terceros):

| Modelo | Parametros | HumanEval Python (Pass@1) | MultiPL-E MATLAB (Pass@1) | Aserciones de ingenieria | Cota de olvido catastrofico |
|---|---|---|---|---|---|
| SLM-CadCamCfd-Expert-1.5B-v2 | 1.54B | 84.1% (138/164) | 33.9% (64/189) | 391/1239 | ≤ 8.2% Frobenius (ΔW·V_base = 0) |
| SLM-CadCamCfd-Expert-1.5B-v1 | 1.54B | 68.9% (113/164) | 32.3% (61/189) | 321/1239 | Baseline |
| DeepSeek-Coder-33B-Instruct | 33.0B | 79.2% | 32.8% | N/A | Full fine-tune |
| CodeLlama-13B-Instruct | 13.0B | 36.0% | 24.2% | N/A | Full fine-tune |
| CodeLlama-7B-Instruct | 7.0B | 33.5% | 20.1% | N/A | Full fine-tune |
| StarCoder-15B | 15.5B | 33.6% | 22.0% | N/A | Full fine-tune |
| StarCoder-1B | 1.1B | 15.2% | 11.8% | N/A | Full fine-tune |
| Qwen2.5-Coder-1.5B (base) | 1.54B | 69.5% | 24.8% | 210/1239 | Base foundation |
| SmolLM2-135M-Coder-v1 | 0.135B | 23.8% | 15.3% | 168/1239 | Baseline |

Nota: la model card declara tambien 960/1325 aserciones superadas en HumanEval Python 1000 y 391/1239 en MultiPL-E MATLAB & Engineering 1000, con Pass@1 de 84.15 y 33.86 respectivamente. No se han publicado resultados independientes que confirmen estas cifras.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 3-4 GB en bfloat16 para el modelo base de 1.54B, mas el delta quirurgico (577.50 MB) que se suma en memoria. En cuantizacion de 8 bits cabria en torno a 2 GB, y en 4 bits en torno a 1 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es lo suficientemente pequeno para ejecutarse en GPU de consumo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 8 GB o mas, e incluso en CPU con cuantizacion.
- Opciones de despliegue: el autor solo documenta carga mediante `transformers` y `safetensors` con inyeccion manual del delta. No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa. vLLM y TGI podrian usarse tras fusionar el delta con el modelo base y guardar los pesos resultantes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval Python | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLM-CadCamCfd-Expert-1.5B-v2 | 1.54B | no disponible | 84.1% (declarado) | Apache 2.0 | Delta en HF, requiere modelo base |
| Qwen2.5-Coder-1.5B-Instruct | 1.54B | 32 768 tokens (segun modelo base) | 69.5% (declarado por el autor) | Apache 2.0 | Pesos completos en HF |
| DeepSeek-Coder-33B-Instruct | 33.0B | no disponible | 79.2% (declarado por el autor) | Licencia propia de DeepSeek | Pesos completos en HF |
| CodeLlama-7B-Instruct | 7.0B | 16 384 tokens (segun modelo base) | 33.5% (declarado por el autor) | Llama 2 Community License | Pesos completos en HF |

La comparativa se limita a los datos aportados por el autor; no se dispone de evaluacion independiente que permita contrastar el rendimiento real frente a estas alternativas.

## Limitaciones y advertencias
- Los benchmarks son autoinformados y no verificados (`verified: false` en el model-index). No hay evaluacion independiente que confirme los resultados.
- El modelo solo declara soporte de ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion en dominios de ingenieria: la generacion de codigo MATLAB o CFD puede contener errores sutiles que requieren validacion con `checkcode` o ejecucion real.
- La distribucion como delta quirurgico implica un proceso de carga no estandar (suma manual de tensores) que puede introducir errores si no se aplica correctamente; no se ofrecen pesos fusionados.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con llama.cpp u Ollama sin conversion manual.
- No se documentan sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion (2026-11-09) es futura respecto a la fecha habitual de publicacion de modelos; conviene verificar la vigencia del repositorio.

## Enlaces
- Hugging Face: https://huggingface.co/BRR1154/SLM-CadCamCfd-Expert-1.5B-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
