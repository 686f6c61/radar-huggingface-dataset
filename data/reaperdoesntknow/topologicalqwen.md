# reaperdoesntknow/TopologicalQwen

## Resumen

TopologicalQwen es un modelo de lenguaje de 2.031.739.904 parametros (etiquetado comercialmente como "1.7B efectivos") desarrollado por reaperdoesntknow para Convergent Intelligence LLC (Research Division). Se trata de un modelo derivado de Qwen3-1.7B mediante una cadena de ajuste supervisado, refinamiento DISC y, finalmente, destilacion de conocimiento desde Qwen3-30B-A3B-Thinking-2507 usando una metodologia propia denominada Topological Knowledge Distillation (TKD). El objetivo declarado es transferir capacidad de razonamiento fisico-matematico desde un profesor MoE de 30B parametros a un estudiante denso de 2B que pueda ejecutarse en hardware de borde.

La propuesta tecnica central es tratar la distribucion de salida del profesor como una funcion de variacion acotada y descomponer la destilacion en tres canales: componente suave (divergencia KL clasica), correcciones de salto en fronteras conceptuales y correcciones de deriva de tipo cantoriano. El entrenamiento se realiza sobre aproximadamente 1.599 muestras de cadenas de razonamiento de fisica (ecuaciones diferenciales, mecanica teorica, electromagnetismo y relatividad general) estructuradas en un formato dialectico propio llamado DualMind, con bloques `<explore>`, `<examine>` y `<response>`.

El modelo es relevante por dos motivos. Primero, es un ejemplo poco habitual de destilacion many-to-one con un pipeline documentado en fases (cacheo de logits, deteccion de topologia, ventaneo adaptativo y curriculo de KD) publicado como preprint con DOI. Segundo, su tamano y su ventana de contexto de 40.960 tokens lo situan en el segmento de modelos pequenos con contexto largo, un nicho con pocas opciones abiertas. La licencia Apache 2.0 facilita su adopcion comercial, aunque las capacidades reales estan acotadas por un dataset de entrenamiento muy especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only denso, GQA) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | No especificados en la model card; al ser safetensors en BF16/FP16 es compatible con cuantizacion estandar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | No disponibles (heredados presumiblemente de Qwen3, sin confirmacion del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4,1 GB) |
| Tamano oculto | 2048 |
| Capas | 28 |
| Cabezas de atencion | 16 (Q) / 8 (KV), GQA |
| Dimension intermedia | 6144 |
| Vocabulario | 151.936 |
| Precision de entrenamiento | FP32 con autocast BF16 |
| Modelo base | reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT |
| Profesor de destilacion | Qwen3-30B-A3B-Thinking-2507 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con la topologia estandar de Qwen3: 28 capas, hidden size 2048, atencion con grouped-query attention (16 cabezas de consulta, 8 de clave-valor), FFN con dimension intermedia 6144 y embedding de 151.936 tokens. No emplea mezcla de expertos ni mecanismos de atencion lineal o state-space; toda la innovacion declarada esta en el procedimiento de destilacion, no en la arquitectura.

El entrenamiento parte de Disctil-Qwen3-1.7B, un refinamiento DISC de una version "uncensored" de Qwen3-1.7B, y destila desde Qwen3-30B-A3B-Thinking-2507 sobre un corpus de aproximadamente 1.599 cadenas de razonamiento de fisica (636 de ecuaciones diferenciales, 307 de mecanica teorica, 580 de electromagnetismo y 76 de relatividad general). Cada muestra se reestructura en formato DualMind con tres bloques: `<explore>` para la derivacion, `<examine>` para la verificacion autocritica y `<response>` para la respuesta final. El pipeline TKD consta de cuatro fases: cacheo de logits del profesor con compresion top-64 en una sola pasada; deteccion de discontinuidades con umbral 3 sigma y amplificacion 1,25x; ventaneo adaptativo de 512 tokens cortado en posiciones de baja discrepancia; y destilacion continua con curriculo de cuatro fases, pesos de prueba decrecientes (2,25 a 1,1), alpha de KD escalando de 0 a 0,45, temperatura 2,0, batch efectivo 32 y LR coseno de 5e-6 a 5e-7. La metodologia completa se publica como "Structure Over Scale" (DOI 10.57967/hf/8165).

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso en dominios cientificos, con enfasis en fisica y matematicas.
- Razonamiento estructurado en tres fases mediante el formato DualMind: derivacion libre, autocritica adversarial y sintesis de respuesta final.
- Resolucion de problemas de ecuaciones diferenciales, mecanica teorica, electromagnetismo y relatividad general a nivel de derivacion formal.
- Contexto largo de hasta 40.960 tokens, adecuado para documentos tecnicos extensos y derivaciones de multiples pasos.
- Capacidades heredadas de Qwen3-1.7B para generacion general de texto, presumiblemente con soporte multilingue (no confirmado por el autor para este modelo).
- Soporte de tool calling y function calling: no documentado en la model card, aunque el linaje Qwen3 lo incluye; no hay confirmacion de que el ajuste lo preserve.
- Modo "thinking": implementado a traves de los bloques DualMind en lugar de un token de razonamiento separado.
- No se documentan capacidades de vision, audio ni agentes multi-paso.

## Casos de uso

- Tutorizacion de fisica universitaria: el modelo puede generar derivaciones completas en formato `<explore>` y luego autocriticarlas en `<examine>`, lo que permite construir asistentes de estudio que muestran no solo la respuesta sino tambien el proceso de verificacion, util para asignaturas de ecuaciones diferenciales y mecanica.
- Generacion de apuntes y solucionarios comentados: con 40.960 tokens de contexto se puede introducir un capitulo entero de un libro de texto y solicitar derivaciones que citen pasos intermedios, aprovechando el entrenamiento sobre CoT de fisica.
- Despliegue en dispositivos de borde: con 2B parametros y licencia Apache 2.0, cabe en GPUs de consumo (ver seccion de hardware) y puede ejecutarse en portatiles o estaciones modestas para asistentes tecnicos offline sin dependencia de la nube.
- Prototipado rapido de pipelines de razonamiento dialectico: el formato DualMind es replicable y permite experimentar con generacion en dos pasadas (critica y sintesis) sobre pesos compartidos, util para investigacion en auto-refinamiento.
- Investigacion en destilacion de conocimiento: el modelo sirve como referencia reproducible para estudiar TKD frente a KD clasica, dado que el pipeline, hiperparametros y dataset estan documentados y el profesor (Qwen3-30B-A3B) es publico.
- Filtrado y reescritura de soluciones fisicas: en un pipeline de generacion y verificacion, el modelo puede actuar como revisor critico de derivaciones producidas por otro modelo mayor, usando el bloque `<examine>` para señalar errores de signo, hipotesis no justificadas o pasos invalidos.
- Educacion secundaria y primeros cursos de grado: como generador de explicaciones paso a paso con contexto largo, puede adaptarse a temarios concretos mediante prompts que incluyan el material de referencia, sin necesidad de reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones propias del pipeline TKD frente a la KD clasica. El unico material de evaluacion referenciado es el preprint "Structure Over Scale" (DOI 10.57967/hf/8165), cuyo contenido numerico no forma parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica entre 5 y 6 GB para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,2 GB de pesos, con pico total de 3,5 a 4,5 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4): alrededor de 1,2 a 1,5 GB de pesos, con pico total de 2,5 a 3,5 GB.
- Contexto largo: la cache KV para 40.960 tokens con 28 capas, 8 cabezas KV y dimension de cabeza 128 supone varios GB adicionales en BF16; conviene usar cuantizacion de cache o reducir la ventana efectiva en GPUs de consumo.
- GPU recomendadas para produccion: NVIDIA A100 40 GB, H100 o L40S permiten servir varias instancias en paralelo y contexto completo; una RTX 4090 (24 GB) maneja holgadamente el modelo en BF16 con contexto largo.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en configuracion 4 bits funciona en GPUs de 6 a 8 GB, incluidas RTX 2060 o GTX 1660 con llama.cpp.
- Opciones de despliegue: transformers (referencia oficial), vLLM y TGI para servicio con throughput alto, llama.cpp y Ollama para cuantizacion GGUF en local, y tecnicas de cuantizacion AWQ/GPTQ para servir en GPUs pequenas.
- Latencia y throughput: no disponibles. Como referencia estructural, un denso de 2B en una RTX 4090 en BF16 suele generar decenas de tokens por segundo, pero no hay medicion publicada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TopologicalQwen | 2,03B denso | 40.960 | Apache 2.0 | Destilado de Qwen3-30B-A3B con TKD y formato DualMind; especializado en fisica |
| Qwen3-1.7B | 1,7B denso | 32.768 (base Qwen3) | Apache 2.0 | Modelo original del que deriva; capacidades generales y multilingues, sin ajuste DualMind |
| Qwen3-4B | 4B denso | 32.768 (base Qwen3) | Apache 2.0 | Alternativa de mayor tamano y capacidad general, sin destilacion especifica de fisica |
| Phi-3-mini | 3,8B denso | 4.096 (128K en variante long) | MIT | Modelo pequeno orientado a razonamiento; contexto menor en la version estandar |

La comparacion directa de rendimiento no es posible porque no hay benchmarks publicados para TopologicalQwen. Frente a Qwen3-1.7B, la diferencia declarada es la destilacion desde un profesor de 30B y el formato DualMind, con un contexto ampliado a 40.960 tokens. Frente a Qwen3-4B, TopologicalQwen ofrece menor tamano a costa de menor capacidad general y un sesgo fuerte hacia el dominio fisico.

## Limitaciones y advertencias

- El entrenamiento se limita a unas 1.599 muestras de fisica; fuera de ese dominio el rendimiento puede degradarse respecto al Qwen3-1.7B original y no hay evaluacion que lo cuantifique.
- El formato DualMind exige que el prompt abra el bloque `<explore>`; usos conversacionales sin esa estructura pueden producir salidas inconsistentes o no cerrar correctamente los bloques.
- El modelo deriva de una variante "uncensored" de Qwen3, lo que reduce las salvaguardas de contenido; no es adecuado para aplicaciones infantiles o entornos sin moderacion externa.
- Riesgo de alucinacion en derivaciones fisicas: el modelo puede producir pasos plausibles pero incorrectos, especialmente en relatividad general, el subconjunto mas pequeno del dataset (76 ejemplos).
- Idiomas soportados no declarados por el autor; el entrenamiento se realizo presumiblemente en ingles y no hay garantia de calidad en castellano.
- No hay benchmarks publicados, por lo que las afirmaciones de "convergent intelligence" y superioridad del TKD no estan verificadas de forma independiente en la informacion disponible.
- El contexto de 40.960 tokens es costoso en VRAM para cache KV en precision completa; en produccion conviene evaluar cuantizacion de cache.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y del profesor Qwen3-30B-A3B antes de un despliegue comercial, ya que la cadena de destilacion incluye un ajuste "uncensored" intermedio.
- La model card termina de forma truncada ("The broader Convergent Intelligence portfolio..."), por lo que parte de la documentacion del autor no esta completa en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Modelo base inmediato: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Estudiante previo (DISC): https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Metodologia: Structure Over Scale (DOI): https://doi.org/10.57967/hf/8165
