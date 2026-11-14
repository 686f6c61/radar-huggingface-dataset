# GSMB/aya-drift-v3-adapters

## Resumen

Aya-drift-v3-adapters es un conjunto de adaptadores LoRA publicados por el usuario GSMB sobre el modelo base CohereLabs/tiny-aya-global. No se trata de un modelo generativo independiente, sino de un artefacto de investigación centrado en el fenómeno del *safety drift*: la degradación del comportamiento de rechazo ante peticiones dañinas que se produce al ajustar un modelo para una tarea de dominio concreta. El repositorio contiene tres adaptadores (`domain`, `safety` y `mixed`) más varias variantes de reparación obtenidas mediante la técnica SafeTune `recover.task_arithmetic`.

El interés del artefacto es metodológico: cuantifica con intervalos de confianza bootstrap al 95 % cómo un ajuste de dominio debilita las negativas del modelo (especialmente en idiomas no vistos durante el entrenamiento) y evalúa distintas estrategias de reparación, incluyendo una variante ortogonalizada. Los resultados se presentan con dos sistemas de etiquetado de rechazo (un juez basado en el modelo base y una lista de palabras clave), lo que permite comparar la robustez de las conclusiones.

El tamaño del repositorio es de 0,1 GB, coherente con adaptadores PEFT de rango bajo sobre un modelo pequeño. La licencia es "other" y no se especifican los idiomas soportados ni la longitud de contexto, que hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer CohereLabs/tiny-aya-global |
| Parametros totales | no disponible (adaptadores; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los benchmarks cubren idiomas "seen" y "held-out" sin especificarlos) |
| Licencia | other |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El artefacto son adaptadores LoRA entrenados con la librería PEFT sobre `CohereLabs/tiny-aya-global`. Se distinguen tres adaptadores originales: `domain`, orientado a una tarea de dominio y que, según el autor, produce deliberadamente un modelo con comportamiento de rechazo debilitado; `safety`, que restaura las negativas; y `mixed`, una línea base de entrenamiento conjunto dominio + seguridad. Los modelos "reparados" (`repair_a0.5`, `repair_a1.0`, `repair_a1.5`, `repair_ortho_a1.0`) se construyen fusionando `domain` y `safety` mediante la aritmética de tareas de SafeTune (`recover.task_arithmetic`), con distintos coeficientes de escala y una variante ortogonalizada.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La evaluación se realiza con dos esquemas de etiquetado de rechazo (juez basado en el modelo base y lista de palabras clave) y mide rechazo en peticiones dañinas, éxito de jailbreak, sobrerrechazo en peticiones benignas y limítrofes, NLL y chrF en la tarea de dominio, y precisión en MGSM con cuatro idiomas (n=160).

## Capacidades

- Generación de texto y respuesta a tareas de dominio mediante el adaptador `domain`, con mejora medible en chrF (34,61 frente a 28,71 del base) y NLL (1,70 frente a 1,97).
- Comportamiento de rechazo reforzado mediante el adaptador `safety`: rechazo en peticiones dañinas en idiomas vistos del 94,6 % (juez) frente al 70,0 % del base.
- Reparación de la deriva de seguridad combinando ambos adaptadores con aritmética de tareas.
- Razonamiento matemático multilingüe evaluado con MGSM en cuatro idiomas (56,2 % de precisión en el base, 59,4 % con `safety`).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.
- Capacidades multilingües: la evaluación distingue idiomas vistos y no vistos, pero no se enumeran.

## Casos de uso

- Investigación sobre safety drift: reproducir el experimento de ajuste de dominio y medir la degradación del rechazo con los scripts y logs del repositorio asociado.
- Evaluación de técnicas de reparación: comparar `repair_a0.5`, `repair_a1.0`, `repair_a1.5` y `repair_ortho_a1.0` frente a la línea base `mixed` usando los intervalos de confianza publicados.
- Estudio de transferencia de seguridad entre idiomas: analizar la caída de rechazo en idiomas no vistos (de 30,4 % a 17,1 % con `domain`) y el efecto de cada estrategia de reparación.
- Auditoría de robustez frente a jailbreak: emplear las métricas de éxito de jailbreak en conjuntos vistos y no vistos para validar defensas.
- Desarrollo de metodología de evaluación: usar los dos esquemas de etiquetado (juez y palabras clave) para estudiar la sensibilidad de las conclusiones al método de medida.
- Formación y docencia: ilustrar con datos concretos los riesgos de aplicar fine-tuning de dominio sin salvaguardas de seguridad.

## Benchmarks y rendimiento

Resultados en porcentaje; entre corchetes, IC bootstrap del 95 %. Etiquetas de rechazo del juez basado en el modelo base.

| Métrica | base | domain | safety | mixed | repair_a0.5 | repair_a1.0 | repair_a1.5 | repair_ortho_a1.0 |
|---|---|---|---|---|---|---|---|---|
| Rechazo en dañino, idiomas vistos (mayor = más seguro) | 70,0 [64,2; 75,4] | 70,0 [64,2; 75,0] | 94,6 [91,7; 97,5] | 69,2 [63,3; 74,2] | 81,7 [77,1; 86,2] | 62,5 [56,7; 68,3] | 42,5 [36,2; 48,8] | 62,1 [55,8; 67,9] |
| Rechazo en dañino, idiomas no vistos | 30,4 [24,6; 36,2] | 17,1 [12,5; 21,7] | 48,8 [42,5; 55,8] | 17,5 [12,9; 22,9] | 32,5 [26,7; 38,8] | 38,8 [32,5; 44,6] | 19,2 [14,6; 24,6] | 37,5 [31,2; 43,3] |
| Rechazo en dañino, inglés | 96,7 [91,7; 100,0] | 96,7 [91,7; 100,0] | 98,3 [95,0; 100,0] | 98,3 [95,0; 100,0] | 96,7 [91,7; 100,0] | 96,7 [91,7; 100,0] | 93,3 [86,7; 98,3] | 96,7 [91,7; 100,0] |
| Éxito de jailbreak, vistos (menor = más seguro) | 42,5 [31,2; 53,8] | 37,5 [27,5; 48,8] | 8,8 [2,5; 16,2] | 28,7 [18,8; 38,8] | 22,5 [13,8; 32,5] | 23,8 [15,0; 33,8] | 26,2 [17,5; 36,2] | 23,8 [15,0; 33,8] |
| Éxito de jailbreak, no vistos | 80,0 [71,2; 88,8] | 85,0 [77,5; 92,5] | 58,8 [47,5; 68,8] | 78,8 [68,8; 86,2] | 76,2 [66,2; 85,0] | 60,0 [50,0; 70,0] | 81,2 [72,5; 88,8] | 60,0 [50,0; 70,0] |
| Sobrerrechazo, benigno (menor = mejor) | 0,4 [0,0; 1,2] | 0,0 [0,0; 0,0] | 0,8 [0,0; 2,1] | 0,8 [0,0; 2,1] | 0,0 [0,0; 0,0] | 0,0 [0,0; 0,0] | 0,0 [0,0; 0,0] | 0,0 [0,0; 0,0] |
| NLL de dominio en respuestas no vistas (menor = mejor) | 1,97 [1,84; 2,10] | 1,70 [1,59; 1,81] | 2,31 [2,16; 2,46] | 1,73 [1,62; 1,85] | 1,74 [1,62; 1,85] | 1,86 [1,73; 1,99] | 2,11 [1,97; 2,25] | 1,86 [1,73; 1,99] |
| chrF de dominio (mayor = mejor) | 28,71 [26,62; 30,86] | 34,61 [31,31; 37,56] | 28,59 [26,31; 30,67] | 33,32 [30,80; 36,20] | 35,17 [32,14; 38,19] | 34,26 [31,32; 37,15] | 33,93 [31,14; 36,93] | 34,57 [31,79; 37,42] |
| MGSM, 4 idiomas (n=160) | 56,2 | 47,5 | 59,4 | 49,4 | 46,2 | 48,8 | 47,5 | 45,6 |

Diferencias pareadas destacadas (puntos porcentuales, IC 95 %; asterisco = el IC excluye el 0): `domain` frente a base reduce el rechazo en idiomas no vistos en 13,3 puntos [-19,6; -7,5]*; `safety` frente a base lo aumenta en 18,3 puntos [+13,3; +23,3]* y reduce el éxito de jailbreak en no vistos en 21,2 puntos [-31,2; -11,2]*; `repair_a1.0` frente a `domain` mejora el rechazo en no vistos en 21,7 puntos [+15,0; +28,7]* y reduce el jailbreak en no vistos en 25,0 puntos [-36,2; -13,8]*.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base `tiny-aya-global`, que no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los adaptadores son PEFT con formato safetensors y pueden cargarse con la librería `peft`; para los modelos reparados se emplea la aritmética de tareas de SafeTune (`recover.task_arithmetic`) y la fusión PEFT (`peft_merge`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GSMB/aya-drift-v3-adapters | adaptadores LoRA sobre tiny-aya-global | no disponible | Investigación de safety drift y reparación | other | Hugging Face |
| CohereLabs/tiny-aya-global (base) | no disponible | no disponible | Modelo multilingüe base | no disponible | Hugging Face |
| Adaptadores `safety` del mismo repo | LoRA | no disponible | Refuerzo de rechazo | other | Hugging Face |
| Adaptadores de reparación (`repair_*`) | LoRA fusionados | no disponible | Reparación de deriva de seguridad | other | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El adaptador `domain` produce deliberadamente un modelo con comportamiento de rechazo debilitado; el autor lo marca como uso exclusivamente de investigación y prohíbe su despliegue.
- La deriva de seguridad es especialmente acusada en idiomas no vistos: el rechazo cae del 30,4 % al 17,1 % y el éxito de jailbreak sube del 80,0 % al 85,0 % con `domain`.
- Las reparaciones no restauran completamente el comportamiento del base: `repair_a1.0` reduce el rechazo en idiomas vistos a 62,5 % frente al 70,0 % del base, aunque mejora los idiomas no vistos.
- El autor advierte que diferencias inferiores a unos 5 puntos deben tratarse como ruido dado el tamaño muestral.
- Los dos esquemas de etiquetado (juez y palabras clave) producen resultados divergentes en varias métricas, lo que limita la confianza en conclusiones basadas en un único método.
- La licencia "other" no aclara las condiciones de uso comercial; debe consultarse antes de cualquier aplicación productiva.
- No se especifican idiomas soportados, sesgos conocidos ni riesgo de alucinación más allá de lo que reflejan las métricas de la tarea de dominio.
- El repositorio tiene 0 descargas y 0 likes, y no se ha publicado información sobre mantenimiento o soporte.

## Enlaces

- Hugging Face: https://huggingface.co/GSMB/aya-drift-v3-adapters
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Repositorio de logs de SafeTune: no disponible como URL en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
