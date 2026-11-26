# grenforcer/Kintsugi-Inkling-2-Mini-control-vector

## Resumen

Kintsugi-Inkling-2-Mini-control-vector es un vector de control (control vector) en formato GGUF publicado por el usuario grenforcer sobre el modelo base CaryPalmer/Kintsugi-Inkling-2-Mini. No se trata de un modelo de lenguaje completo, sino de un artefacto de direccionamiento de activaciones de aproximadamente 218 KB que contiene 24 direcciones unitarias (`direction.24` a `direction.47`) destinadas a eliminar las respuestas de rechazo del modelo cuantizado Kintsugi-Inkling-2-Mini-12G.gguf sin modificar ninguno de sus pesos.

El vector se ha obtenido mediante la técnica de diferencia de medias al estilo Arditi: se restan las activaciones de prompts dañinos y las de prompts inofensivos, se elimina la componente inofensiva y se promedian los resultados sobre 6 contextos de prompt con 256 pares de prompts en inglés. Las direcciones apuntan a la segunda mitad de las 48 visitas de bucle del modelo, que es donde reside la decisión de rechazo; según el autor, dirigir únicamente la pasada final empeora el rechazo en lugar de reducirlo.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de steering en tiempo de inferencia aplicada a un modelo con arquitectura de bucle (loop) y modo de razonamiento; por otro, advierte de que el motor estándar acepta los flags de control-vector pero nunca los aplica, por lo que requiere un parche en `src/models/inkling2.cpp`. El repositorio no incluye pesos del modelo, solo el vector, y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vector de control (steering) sobre un modelo transformer con bucle; no es un modelo en sí |
| Parametros totales | 55.296 (dato real de safetensors del repositorio); el modelo base no declara recuento de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el vector se distribuye en GGUF; el modelo base se referencia como `Kintsugi-Inkling-2-Mini-12G.gguf` (cuantización de 12 GB) |
| Idiomas soportados | no disponible; los datos de evaluación del vector son exclusivamente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (vector de control, ~218 KB) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado de forma convencional, sino un conjunto de direcciones de activación calculadas sobre el modelo cuantizado. El procedimiento, según la model card, es una diferencia de medias estilo Arditi: se toman pares de prompts dañinos e inofensivos, se calcula la media de las activaciones de cada clase, se elimina la componente inofensiva de la diferencia y se promedian los resultados sobre 6 contextos de prompt con 256 pares de prompts en inglés. El resultado son 24 direcciones unitarias que corresponden a las visitas de bucle 24 a 47 del modelo, es decir, la segunda mitad de sus 48 visitas totales.

El modelo base, Kintsugi-Inkling-2-Mini, presenta una arquitectura con bucle (48 visitas) y un modo de razonamiento con bloque ``, que según la model card no se cierra correctamente. El vector se aplica en tiempo de inferencia con `--control-vector-scaled refusal-inkling2-late.gguf:0.6 --cvec-mode project`, sin reentrenamiento ni modificación de pesos. La escala 0.6 se eligió tras un barrido de 1.0 a 0.5 en el que la divergencia KL cae de forma monótona: 0.6 mantiene la eliminación completa de rechazos con aproximadamente un 37 % menos de KL que 1.0.

## Capacidades

- Eliminación de rechazos en tiempo de inferencia: con el vector a escala 0.6, el autor reporta 0 rechazos sobre 200 prompts dañinos, frente a 49 en la línea base.
- Reducción del exceso de rechazo: 0 sobre 83 prompts seguros, frente a 1 en la línea base.
- Preservación de la distribución de salida: divergencia KL de 0.040 en prosa y 0.045 en código respecto al modelo sin vector.
- Steering selectivo por capa: el archivo contiene únicamente las visitas 24 a 47, por lo que no requiere `--control-vector-layer-range`.
- Compatibilidad con el modo de razonamiento del modelo base (thinking off en la evaluación reportada).
- No aporta capacidades nuevas de generación, código, matemáticas, visión, tool calling ni agentes; hereda las del modelo base, que no están documentadas en la información disponible.
- Idiomas: la evaluación del vector es solo en inglés; no hay datos sobre otros idiomas.

## Casos de uso

- Investigación en seguridad y alineación: el vector permite estudiar cómo se distribuye la decisión de rechazo en las distintas visitas de bucle de un modelo, activando y desactivando el comportamiento con una escala continua y midiendo el efecto con KL sobre prosa y código.
- Evaluación de robustez de filtros de seguridad: al eliminar el rechazo de forma controlada se pueden generar respuestas que de otro modo quedarían bloqueadas para analizar su contenido y calibrar clasificadores externos.
- Experimentos de steering en producción controlada: integrado en un `llama-server` parcheado, permite comparar A/B el comportamiento del modelo con y sin vector a escala 0.6 sin reentrenar ni duplicar pesos.
- Auditoría de model cards y artefactos de terceros: sirve como caso de estudio de vectores de control publicados sobre modelos ajenos, útil para equipos que revisan la cadena de suministro de modelos.
- Docencia e investigación sobre interpretabilidad: las 24 direcciones y el procedimiento de diferencia de medias son reproducibles y sirven para explicar técnicas de activación lineal en arquitecturas con bucle.
- Pruebas de regresión de motores de inferencia: el requisito de parchear `src/models/inkling2.cpp` con `cur = build_cvec(cur, il)` convierte este artefacto en un test funcional para verificar que un motor aplica realmente los control-vectors y no solo acepta los flags.

## Benchmarks y rendimiento

Datos reportados por el autor sobre un conjunto de validación en inglés con el modo thinking desactivado:

| Metrica | Baseline | Con vector @0.6 |
|---|---:|---:|
| Rechazos ante prompts dañinos | 49 / 200 | 0 / 200 |
| Exceso de rechazo (prompts seguros) | 1 / 83 | 0 / 83 |
| Divergencia KL, prosa | — | 0.040 |
| Divergencia KL, código | — | 0.045 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que, dado que el modelo base no cierra el bloque ``, algunas etiquetas automáticas son falsos positivos de expresiones regulares sobre texto de razonamiento privado y fueron revisadas manualmente.

## Requisitos de hardware

- El vector en sí ocupa aproximadamente 218 KB, por lo que su coste de memoria es despreciable.
- El requisito real lo marca el modelo base cuantizado `Kintsugi-Inkling-2-Mini-12G.gguf`, de unos 12 GB; la VRAM necesaria para inferencia completa no está detallada en la información disponible.
- GPU recomendadas: no disponible. Por el tamaño del archivo cuantizado, es plausible su ejecución en GPUs de consumo con 16 GB o más de VRAM, pero no hay confirmación del autor.
- Opciones de despliegue: `llama-server` parcheado, con los flags `--control-vector-scaled refusal-inkling2-late.gguf:0.6 --cvec-mode project`. El motor estándar no aplica el vector porque `src/models/inkling2.cpp` carece de la llamada `build_cvec`; es necesario añadir `cur = build_cvec(cur, il);` justo antes de `cb(cur, "l_out", il)`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kintsugi-Inkling-2-Mini-control-vector | Vector de control GGUF | 55.296 (vector) | no disponible | Apache 2.0 | Hugging Face, requiere motor parcheado |
| CaryPalmer/Kintsugi-Inkling-2-Mini | Modelo base con bucle | no disponible | no disponible | no disponible | Hugging Face |
| Vectores de rechazo estilo Arditi (referencia metodológica) | Vector de control | no disponible | no disponible | no disponible | Publicaciones académicas |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El motor estándar acepta los flags de control-vector pero nunca aplica el vector; sin el parche en `src/models/inkling2.cpp` el artefacto no tiene efecto.
- No debe añadirse `--control-vector-layer-range`: el archivo ya contiene solo las visitas 24 a 47.
- La eliminación de rechazos es una modificación deliberada del comportamiento de seguridad del modelo; su uso en producción exige controles externos de moderación y revisión legal.
- La evaluación se limita a inglés, con thinking desactivado y sobre conjuntos de 200 y 83 prompts; no hay validación multilingüe ni con razonamiento activado.
- El autor señala falsos positivos de etiquetado automático por el bloque `` no cerrado del modelo base, lo que introduce incertidumbre en las métricas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- El recuento de 55.296 parámetros corresponde al artefacto del repositorio, no al modelo base, cuyo tamaño real no está documentado.
- Licencia Apache 2.0 para el vector; las condiciones del modelo base deben verificarse por separado.

## Enlaces

- [Hugging Face: grenforcer/Kintsugi-Inkling-2-Mini-control-vector](https://huggingface.co/grenforcer/Kintsugi-Inkling-2-Mini-control-vector)
- [Modelo base: CaryPalmer/Kintsugi-Inkling-2-Mini](https://huggingface.co/CaryPalmer/Kintsugi-Inkling-2-Mini)
- [Releases del motor Kintsugi-Inkling-2-Mini](https://github.com/professorpalmer/Kintsugi-Inkling-2-Mini/releases)
