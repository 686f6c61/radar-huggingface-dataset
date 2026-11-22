# erturkerdagi/turkish-cot-distillation-adapters

## Resumen

`erturkerdagi/turkish-cot-distillation-adapters` es una coleccion de 46 adaptadores LoRA/QLoRA entrenados como material reproducible del articulo "Target Length Rather Than Morphological Weighting Reduces Overthinking in Turkish Chain-of-Thought Distillation" (enviado a Knowledge-Based Systems, Ms. Ref. No. KNOSYS-D-26-20702). No es un modelo base, sino un conjunto de adaptadores PEFT que se montan sobre cuatro modelos estudiantes de la familia Qwen2.5 (0.5B, 1.5B y 3B) y sobre Llama-3.2-3B, con el objetivo de destilar cadenas de razonamiento (chain-of-thought) en turco.

El problema que aborda es el "overthinking" en la destilacion de CoT: cadenas de razonamiento excesivamente largas que agotan el presupuesto de tokens y degradan la calidad de la respuesta. El hallazgo central del trabajo es que la reduccion de la tasa de agotamiento de tokens depende de la longitud en tokens del objetivo de entrenamiento, no del criterio morfologico usado para seleccionar que frases eliminar. Este resultado se sostiene con ablaciones controladas de longitud igualada, incluida una truncacion uniforme sin informacion linguistica que iguala el rendimiento del metodo propuesto.

El repositorio tiene 2,3 GB y una licencia Apache 2.0, aunque los adaptadores entrenados sobre Llama-3.2-3B heredan la Llama 3.2 Community License. Es relevante para investigadores que trabajen en destilacion de razonamiento en lenguas aglutinantes y para quienes necesiten lineas base reproducibles de QLoRA en turco con hiperparametros fijos y multiples semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA/QLoRA sobre transformers decoder-only (Qwen2.5-0.5B, Qwen2.5-1.5B, Qwen2.5-3B, Llama-3.2-3B) |
| Parametros totales | No disponible (adaptadores LoRA con r=16; el tamano depende del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens de secuencia maxima durante el entrenamiento; contexto nativo del modelo base no especificado en la informacion disponible |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con computo bf16; no se documentan otras cuantizaciones de inferencia |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 (los adaptadores `llama3_*` quedan sujetos a Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptadores PEFT), libreria `peft` |

## Arquitectura y entrenamiento

Cada adaptador es un modulo LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado a las proyecciones `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj` del modelo base. El entrenamiento usa QLoRA: cuantizacion 4-bit NF4 con computo en bf16, tres epocas, tamano de lote efectivo 8 (2 por dispositivo con 4 pasos de acumulacion de gradiente), tasa de aprendizaje 2e-4 y longitud maxima de secuencia de 1.024 tokens. Los hiperparametros son identicos en todos los modelos, versiones de datos y semillas, sin ajuste por condicion. Con el tokenizador del estudiante, el 0,38% de los objetivos de la version original y el 0,00% de los objetivos simplificados superan los 1.024 tokens.

El conjunto se organiza en tres carpetas. `main/` contiene 12 adaptadores (4 estudiantes x 3 versiones de datos, semilla 0) correspondientes a la Tabla 3. `ablation/` contiene 10 adaptadores con ablaciones a nivel de regla y lineas base de longitud igualada sobre Qwen2.5-1.5B y Qwen2.5-3B (Tabla 5): solo regla 1 (eliminacion de redundancia sin filtrado por peso), solo filtrado por peso (sin eliminacion de redundancia), borrado aleatorio igualado en numero de frases al metodo propuesto, truncacion uniforme conservando cada n-esima frase sin informacion linguistica, y entrenamiento sobre soluciones de referencia de GSM8K en lugar de cadenas del profesor. `seeds/` contiene 24 adaptadores (semillas 1 y 2 para cada estudiante y version de datos), que junto con las ejecuciones de semilla 0 en `main/` constituyen las 36 observaciones del ANOVA de dos vias de la Tabla 4.

Las versiones de datos son `orijinal` (cadenas originales del profesor), `sade_morfem` (simplificacion por morfemas) y `sade_kelime` (simplificacion por palabras). Los criterios de morfema y palabra coinciden en el 94,2% de las decisiones a nivel de frase. Solo se publica el adaptador final de cada ejecucion; los checkpoints intermedios de epoca se omiten. Todas las ejecuciones se evaluan sobre los mismos 300 problemas de test.

## Capacidades

- Generacion de cadenas de razonamiento (chain-of-thought) en turco, destiladas desde un modelo profesor.
- Razonamiento aritmetico y de sentido comun orientado a problemas tipo GSM8K, con soluciones de referencia incluidas como condicion de ablacion.
- Control de la longitud del razonamiento: los adaptadores simplificados reducen la tasa de agotamiento de tokens frente a las cadenas originales.
- Ajuste eficiente mediante PEFT sobre modelos pequenos (0,5B a 3B), apto para experimentacion con recursos limitados.
- Capacidades multilingues limitadas al turco; el resto de capacidades heredadas del modelo base (Qwen2.5 o Llama-3.2-3B) no se documentan en la informacion disponible.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Reproducibilidad de investigacion: cargar los adaptadores de `main/`, `ablation/` y `seeds/` con `PeftModel.from_pretrained` para replicar las tablas 3, 4 y 5 del articulo sobre los mismos 300 problemas de test, con semillas controladas.
- Estudio del overthinking en lenguas aglutinantes: comparar `sade_morfem` y `sade_kelime` para verificar que ambos criterios coinciden en el 94,2% de las decisiones de frase y aislar el efecto de la longitud del objetivo.
- Linea base de destilacion de CoT en turco: usar los adaptadores `orijinal` como referencia de cadenas del profesor antes de aplicar cualquier simplificacion, con hiperparametros fijos y sin ajuste por condicion.
- Experimentos de QLoRA con presupuesto reducido: el adaptador de Qwen2.5-0.5B permite entrenar y evaluar en una unica GPU de consumo, sirviendo como banco de pruebas de recetas LoRA (r=16, alpha=32, dropout 0,05) antes de escalar a 1,5B o 3B.
- Analisis de robustez estadistica: las 36 observaciones (4 estudiantes x 3 versiones x 3 semillas) permiten ejecutar ANOVA de dos vias y estimar la varianza entre semillas sin reentrenar.
- Evaluacion de metodos de filtrado de datos: los adaptadores de `ablation/` (solo regla 1, solo filtrado por peso, borrado aleatorio, truncacion uniforme, referencia GSM8K) permiten comparar el efecto de cada criterio linguistico frente a lineas base sin informacion linguistica.
- Investigacion sobre destilacion en turco para despliegue en entornos con VRAM limitada: un adaptador sobre Qwen2.5-1.5B en 4-bit ocupa del orden de 1-2 GB de pesos y puede ejecutarse en GPUs de consumo, aunque el rendimiento real no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 3, 4 y 5 del articulo (Knowledge-Based Systems, Ms. Ref. No. KNOSYS-D-26-20702) y al repositorio de GitHub para las estadisticas calculadas y las salidas de evaluacion por item, pero no incluye cifras numericas de MMLU, HumanEval, GSM8K ni de la tasa de agotamiento de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, los modelos base van de 0,5B a 3B parametros; en 4-bit NF4 el peso del modelo base de 3B ronda los 1,5-2 GB y el de 1,5B alrededor de 1 GB, a lo que se suma el adaptador LoRA (r=16 sobre siete proyecciones) y la cache KV para secuencias de hasta 1.024 tokens.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, Qwen2.5-0.5B y 1.5B caben en GPUs de consumo; Qwen2.5-3B y Llama-3.2-3B en 4-bit tambien son viables en GPUs de consumo con VRAM suficiente, aunque no se documenta la VRAM exacta.
- Cabe en GPU de consumo: previsiblemente si para todos los adaptadores en cuantizacion 4-bit, pero el dato no esta confirmado en la model card.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers` + `peft` (`PeftModel.from_pretrained` con `subfolder`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turkish-cot-distillation-adapters (este) | Adaptadores LoRA sobre 0,5B-3B | 1.024 tokens de entrenamiento | Destilacion de CoT en turco, 46 adaptadores con ablaciones y semillas | Apache 2.0 (excepto `llama3_*`) | Hugging Face, 0 descargas, 0 likes |
| Qwen2.5-1.5B / 3B (base) | 1,5B / 3B | No disponible en la informacion proporcionada | Modelo generico multilingue | Apache 2.0 | Hugging Face |
| Llama-3.2-3B (base) | 3B | No disponible en la informacion proporcionada | Modelo generico multilingue | Llama 3.2 Community License | Hugging Face |

No se dispone de datos de rendimiento comparado con otras alternativas de destilacion de CoT en turco en la informacion proporcionada.

## Limitaciones y advertencias

- El alcance linguistico se limita al turco; no se documenta comportamiento en otros idiomas.
- La longitud de secuencia de entrenamiento es de 1.024 tokens; el 0,38% de los objetivos de la version original la supera, por lo que esas muestras pudieron truncarse durante el entrenamiento.
- Solo se publica el adaptador final de cada ejecucion; no hay checkpoints intermedios de epoca, lo que impide analizar la evolucion del entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (21 de noviembre de 2026); no hay evidencia de validacion independiente por terceros.
- El articulo asociado esta en revision (Ms. Ref. No. KNOSYS-D-26-20702), por lo que los resultados no han pasado necesariamente por revision por pares en el momento de redactar esta ficha.
- Los adaptadores `llama3_*` estan sujetos a la Llama 3.2 Community License, no a Apache 2.0, con las restricciones de uso comercial que dicha licencia impone.
- El hallazgo principal del trabajo cuestiona la contribucion del criterio morfologico: la truncacion uniforme sin informacion linguistica iguala la tasa de agotamiento del metodo propuesto. Cualquier uso que atribuya la mejora al analisis morfologico del turco seria una interpretacion incorrecta de los resultados.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- No se documenta soporte de tool calling, agentes ni despliegue en servidores de inferencia de produccion; el uso previsto es de investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/erturkerdagi/turkish-cot-distillation-adapters
- Dataset y salidas de evaluacion por item: https://huggingface.co/datasets/erturkerdagi/turkish-cot-distillation
- Codigo y estadisticas calculadas: https://github.com/erturkerdagi/turkish-cot-distillation
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo base Llama-3.2-3B: https://huggingface.co/meta-llama/Llama-3.2-3B
