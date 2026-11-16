# mburgc/qwenputer-mirror

## Resumen

Qwenputer Mirror es un checkpoint experimental publicado por Marcelo Ernesto Burgos Cayupil (usuario `mburgc`) bajo licencia MIT, etiquetado como `qwen3.5` y orientado a investigacion sobre edicion de conocimiento en pesos. El repositorio tiene un tamano de 0.0 GB y cero descargas, lo que sugiere que los pesos no estan efectivamente alojados o que el artefacto es un espejo (mirror) sin contenido binario. La model card describe un trabajo de investigacion personal no revisado por pares sobre como inyectar hechos nuevos en un modelo de lenguaje sin usar gradientes, empleando como oraculo de verdad un CPU RISC-V determinista compilado dentro de los propios pesos del checkpoint.

El planteamiento tecnico es inusual: un circuito RV32IM de 177 millones de parametros, recuperado de un checkpoint cuyo runtime original se habia perdido, calcula productos de 18 digitos de forma exacta. Sobre esa base, el autor aplica una actualizacion de rango limitado en `lm_head` mediante la formula `ΔW = YᵀK(KᵀK+λI)⁻¹`, logrando pasar de 0/71 a 71/71 caracteres correctos en ocho hechos inyectados, con un adaptador de 6 MB que se puede retirar limpiamente. El trabajo incluye controles negativos y cuatro fallos explicitos, lo que lo hace relevante como material metodologico mas que como modelo desplegable.

La relevancia actual es acotada pero real: documenta de forma cuantitativa los limites de la edicion de conocimiento en pesos (capacidad medida en diversidad de claves, no en numero de hechos), la ausencia de generalizacion a parafrasis y un falso positivo de composicion refutado por un control con nombres nunca entrenados. No obstante, no es un modelo para produccion: no hay pipeline declarado, no hay idiomas declarados y el repositorio no contiene pesos utilizables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (checkpoint base etiquetado como Qwen3.5; incluye un circuito RISC-V RV32IM embebido en los pesos, 177 M parametros) |
| Parametros totales | no disponible (el circuito oraculo descrito tiene 177 M parametros; el total del checkpoint base no se especifica) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio reporta 0.0 GB; el adaptador se almacena como `U·S·Vᵀ`, rango 12, 6.0 MB) |

## Arquitectura y entrenamiento

El checkpoint parte de un transformer etiquetado como `qwen3.5`, con una capa de salida `lm_head` sobre la que se aplica la edicion. La innovacion central no es el entrenamiento clasico: no hay descenso de gradiente. El autor recupera, a partir de los pesos, la estructura de un circuito RISC-V RV32IM determinista de 177 M parametros (2918 dimensiones, 2492 nodos, 1265 slots) que actua como oraculo de verdad exacta. La recuperacion se hizo sin consultar el checkpoint, prediciendo columnas residuales concretas (2193 para la primera dimension de codigo, 2215 para `mu`, 2216 para `tau`), con siete comprobaciones y siete coincidencias.

Sobre esa base, la inyeccion de hechos usa una regresion de rango limitado en `lm_head`: para cada token de respuesta se toma la clave `k_j` como estado oculto post-normalizacion en la posicion correspondiente, se define el gap objetivo `γ_j = logit(top) − logit(target) + 3` (limitado a 12) y se aplica `ΔW = YᵀK(KᵀK+λI)⁻¹` con `W ← W + αΔW`. El adaptador resultante es de rango 12, 6.0 MB, y se retira limpiamente (rollback devuelve el modelo a 0/71). No se reportan datos sobre volumen de tokens de preentrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Calculo aritmetico exacto de productos de 18 digitos mediante el circuito RV32IM embebido en los pesos, verificado contra Python en ocho casos (por ejemplo, 52445 × 3471 = 182036595).
- Inyeccion de hechos nuevos sin gradientes en `lm_head`, con tasa de acierto de 71/71 caracteres y 8/8 respuestas completas como prefijo en el conjunto de prueba.
- Retirada limpia de la edicion: el adaptador de 6 MB se elimina y el modelo vuelve al estado base (0/71).
- Aprendizaje de derivaciones encadenadas: 391 restricciones procedentes de una derivacion de 65 tokens en seis ejemplos se ajustan sin colapso.
- No soporta generalizacion a parafrasis: una formulacion no vista genera una clave nueva y la actualizacion no aporta nada.
- No aprende procedimientos: una derivacion de tres pasos memorizada para seis productos puntua 0/3 en productos no vistos.
- No hay evidencia de composicion real de hechos: el unico resultado positivo fue refutado por un control con nombres nunca entrenados.
- Soporte de tool calling, function calling, agentes, vision, audio, thinking mode y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en edicion de conocimiento: el checkpoint sirve como banco de pruebas reproducible para medir la capacidad de inyeccion de hechos en `lm_head` en funcion de la diversidad de claves, con controles negativos ya implementados (objetivo barajado con la misma norma, rollback).
- Estudio de limites de generalizacion: permite documentar cuantitativamente que una actualizacion de rango limitado no generaliza a parafrasis, usando el protocolo de claves exactas descrito y midiendo la caida de acierto en formulaciones no vistas.
- Auditoria de falsos positivos en evaluaciones de composicion: el caso de los nombres nunca entrenados (Fennax, Ossric, Draven respondiendo `Vela`) es un ejemplo concreto de sesgo global en la distribucion de salida que puede reutilizarse como control en experimentos propios.
- Analisis de circuitos embebidos en pesos: la recuperacion del RV32IM a partir de las dimensiones residuales (formula de layout con `hidden=3328`, `off=2048`, `m=13`) es un metodo replicable para inspeccionar checkpoints cuyo codigo de runtime se ha perdido.
- Docencia y divulgacion sobre interpretabilidad: el contraste entre 42 restricciones de prompts independientes que colapsan y 391 restricciones encadenadas que se ajustan es material didactico concreto sobre la diferencia entre hechos aislados y secuencias correlacionadas.
- Referencia metodologica para revision por pares: el documento reporta explicitamente cuatro fallos, incluido un fallo de implementacion en la edicion tipo MEMIT de `mlp.down_proj` en cinco capas (0/20), util para calibrar expectativas antes de replicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos cuantitativos son los experimentos internos del autor:

| Experimento | Metrica | Resultado |
|---|---|---|
| Oracuo RV32IM, 8 productos | Coincidencia con Python | 8/8 exactos |
| Inyeccion de 8 hechos, base | Caracteres correctos / respuestas completas | 0/71 / 0/8 |
| Inyeccion de 8 hechos, con ΔW | Caracteres correctos / respuestas completas | 71/71 / 8/8 (como prefijo) |
| Control con objetivos barajados, misma norma | Caracteres correctos / respuestas completas | 1/71 / 0/8 |
| Rollback del adaptador | Caracteres correctos / respuestas completas | 0/71 / 0/8 |
| Capacidad con 5 hechos independientes | Precision | 5/5 (10 pares, rango 10) |
| Capacidad con 10 hechos independientes | Precision | 3/10 (18 pares, rango 16) |
| Capacidad con 15 hechos independientes | Precision | 9/15 (28 pares, rango 26) |
| Capacidad con 20 hechos independientes | Precision | 6/20 (37 pares, rango 34) |
| Derivacion encadenada de 65 tokens, 6 ejemplos | Restricciones ajustadas | 391 sin colapso |
| Composicion A→B→C | Acierto directo / composicion real | 4/4 directos / 0 composicion (control refuta) |
| Edicion tipo MEMIT en `mlp.down_proj`, 5 capas | Acierto | 0/20 (fallo de implementacion) |
| Injerto de memoria suave en capa 8 | Recuperacion / primer token correcto | 10/10 / 10/10 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio reporta 0.0 GB y no se especifican pesos desplegables; el checkpoint base etiquetado como Qwen3.5 no detalla tamano).
- GPU recomendadas: no disponible. El unico dato de hardware es la referencia del autor a una "laptop 3070" (RTX 3070 mobile o de portatil) para ejecutar el oraculo, con latencia media de aproximadamente 70 segundos por producto.
- Compatibilidad con GPU de consumo: el oraculo RV32IM descrito se ejecuta en una RTX 3070, pero no hay datos sobre el checkpoint completo ni sobre memoria requerida.
- Opciones de despliegue: la libreria declarada es `transformers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos hace inviable cualquier despliegue practico.
- Latencia y throughput: solo se reporta la latencia del oraculo (aproximadamente 70 s por producto de 18 digitos en una 3070). No hay datos de throughput de generacion de texto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, mismo tamano o misma tarea, ni datos de rendimiento estandar que permitan una comparacion rigurosa. El trabajo se posiciona como investigacion experimental sobre edicion de conocimiento, no como un modelo de proposito general comparable a otros checkpoints de la familia Qwen u otros transformers desplegables.

## Limitaciones y advertencias

- Investigacion personal no revisada por pares: el propio autor advierte explicitamente de que se trata de un trabajo experimental y pide leer la seccion de limitaciones antes de citar cualquier resultado.
- El repositorio tiene 0.0 GB y cero descargas: no hay evidencia de pesos utilizables, por lo que no es un artefacto desplegable en produccion.
- Sin generalizacion a parafrasis: la actualizacion se ancla a estados exactos; una formulacion nueva produce una clave nueva y la edicion no aporta nada por encima del modelo base.
- Sin aprendizaje de procedimientos: la derivacion memorizada puntua 0/3 en productos no vistos.
- Falso positivo de composicion: el unico resultado aparentemente positivo (1 de 2 en A→C) se explica por un sesgo global de la distribucion de salida, demostrado con nombres nunca entrenados que tambien responden `Vela`; la composicion real es 0.
- Capacidad no monotona: diez hechos independientes puntuan peor (3/10) que quince (9/15), porque las claves de distintos hechos son casi identicas (coseno mediano 0.95, maximo 0.99) y toda la senal vive en diferencias de 0.01.
- Fallo de implementacion en la edicion de capas internas: el injerto tipo MEMIT en `mlp.down_proj` no tuvo efecto (0/20) por ignorar la normalizacion final, lo que no constituye evidencia contra la edicion interna.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el unico control de robustez es el de objetivos barajados y el de nombres no entrenados.
- Idiomas, sesgos demograficos y restricciones de contexto: no disponibles. La licencia MIT permite uso comercial del material publicado, pero la ausencia de pesos y de evaluacion estandar desaconseja cualquier uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/mburgc/qwenputer-mirror
- Model card y documentacion experimental: incluida en la pagina de Hugging Face del repositorio (seccion "Learning from a Deterministic Oracle Inside the Model")
- Repositorio o driver original del checkpoint: no disponible (el autor indica que la URL devuelve 404)
- Paper, blog, demo o repositorio adicional: no disponible en la informacion proporcionada
