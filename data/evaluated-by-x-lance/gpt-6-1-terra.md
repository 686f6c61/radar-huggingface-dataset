# Evaluated-by-X-LANCE/gpt-6.1-terra

## Resumen

GPT-6.1 Terra es un modelo de lenguaje cerrado desarrollado por OpenAI (la model card no lo indica explícitamente, pero la denominación y el contexto de publicación lo sitúan en esa familia) que no dispone de repositorio público de pesos. El repositorio de Hugging Face `Evaluated-by-X-LANCE/gpt-6.1-terra` no contiene el modelo, sino una tarjeta de seguimiento de resultados creada por el equipo X-LANCE para alojar las evaluaciones del modelo en el benchmark SynthDCB, ya que el modelo original no tiene repositorio público donde publicarlas.

El único dato de rendimiento disponible es la métrica agregada SynthDCB Overall Pass@1 de 79,53125, calculada como media de tres intentos por tarea sobre el conjunto de evaluación `eval_20261115`. No se publican en la información disponible la arquitectura, el número de parámetros, la longitud de contexto, los idiomas soportados ni la licencia del modelo.

La relevancia de esta ficha es, por tanto, doble: por un lado documenta un resultado de evaluación reproducible sobre un benchmark concreto (SynthDCB) para un modelo cerrado; por otro, sirve de ejemplo de repositorio de solo resultados, un patrón que conviene conocer para no confundirlo con una publicación de pesos descargables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio no contiene pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de solo resultados, sin pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no describe si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o cualquier otra variante, ni detalla el número de parámetros, la composición del corpus de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF, DPO o variantes posteriores.

Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, modos de razonamiento explícito u otras). El repositorio se limita a alojar artefactos de evaluación: la carpeta `.eval_results/` contiene los resultados por tarea y la configuración de la evaluación `eval_20261115`, pero no información de entrenamiento.

## Capacidades

- No se documentan capacidades específicas del modelo en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni de razonamiento multi-paso.
- No se confirma capacidad multilingüe ni la lista de idiomas.
- No se confirma soporte de visión, audio ni modos de razonamiento extendido.
- Lo único verificable es que el modelo ha sido evaluado con el benchmark SynthDCB y ha obtenido un Pass@1 agregado de 79,53125.

## Casos de uso

- Evaluación comparativa de modelos cerrados: el repositorio permite consultar el resultado de GPT-6.1 Terra en SynthDCB y contrastarlo con el de otros modelos evaluados en el mismo benchmark, usando la misma configuración (`eval_20261115`) y la misma métrica (Pass@1 medio de tres intentos).
- Reproducción de resultados: la carpeta `.eval_results/` conserva los resultados por tarea y la configuración, lo que permite auditar cómo se obtuvo la media agregada y repetir el análisis sin depender de la web del proyecto.
- Integración en leaderboards: el identificador del repositorio puede enlazarse desde la página del proyecto SynthDCB o desde agregadores de benchmarks para apuntar a una fuente estable en Hugging Face.
- Documentación de linaje de evaluaciones: al no existir repositorio público del modelo, este tipo de tarjeta actúa como registro de qué versión del modelo se evaluó y con qué conjunto de datos, lo que facilita trazar cambios entre versiones.
- Referencia para investigadores que diseñan benchmarks: el formato muestra cómo separar artefactos de evaluación de artefactos de pesos, un patrón útil cuando el modelo evaluado es propietario.
- Verificación de claims externos: si un tercero publica una cifra distinta para GPT-6.1 Terra en SynthDCB, este repositorio sirve como referencia primaria de la cifra oficial reportada por el equipo evaluador.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Conjunto de evaluación | Notas |
|---|---|---|---|---|
| SynthDCB | Overall Pass@1 | 79,53125 | `eval_20261115` | Media de 3 intentos por tarea |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo es cerrado y no se publican pesos ni tamaño).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables a este repositorio, que no contiene pesos. El acceso al modelo, si existe, sería a través de la API del proveedor, extremo que no se detalla en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros modelos en SynthDCB ni especificaciones de modelos comparables, por lo que no es posible establecer una comparación fundamentada.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo: es una tarjeta de resultados. Cualquier intento de descargarlo para inferencia local fallará.
- Solo se publica una métrica agregada (Pass@1 medio de tres intentos); no se incluye en la información disponible el desglose por tarea, aunque la model card indica que está en `.eval_results/`.
- El resultado corresponde a un único conjunto de evaluación (`eval_20261115`); no hay datos sobre variabilidad entre conjuntos ni sobre intervalos de confianza más allá de la media de tres intentos.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo.
- La licencia no está disponible, por lo que no puede determinarse si el uso comercial está permitido; en cualquier caso, al no haber pesos, la cuestión aplica al acceso vía API del proveedor, no a este repositorio.
- El nombre del repositorio y la fecha de creación (2026-11-27) deben tratarse con cautela: conviene verificar la identidad del publicador antes de citar el resultado en producción o en publicaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Evaluated-by-X-LANCE/gpt-6.1-terra
- Dataset del benchmark SynthDCB: https://huggingface.co/datasets/X-LANCE/SynthDCB
- Página del proyecto SynthDCB (leaderboard): https://x-lance.github.io/SynthDCB/#leaderboard
