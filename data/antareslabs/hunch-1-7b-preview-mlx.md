# antareslabs/hunch-1.7b-preview-MLX

## Resumen

`antareslabs/hunch-1.7b-preview-MLX` es la conversión a formato MLX del modelo `antareslabs/hunch-1.7b-preview`, publicada por el propio autor (`antareslabs`). Se trata de un modelo de lenguaje de aproximadamente 1.700 millones de parámetros distribuido exclusivamente en precisión f16 y en el formato nativo de MLX, la librería de aprendizaje automático de Apple para silicio propio. No es un modelo nuevo entrenado desde cero, sino una conversión de pesos orientada a ejecución local en Apple Silicon.

La relevancia de esta publicación no reside en una mejora de capacidades, sino en el proceso de validación numérica que la acompaña. Cada fichero se evaluó sobre 6.000 preguntas retenidas contra la ejecución fp32 en PyTorch del mismo checkpoint, estableciendo una "puerta de equivalencia" que la build f16 supera sin modificar ninguna respuesta. Este rigor metodológico es poco habitual en conversiones de formato y resulta útil para quien necesite garantías de fidelidad respecto al modelo original.

El repositorio ocupa 3,4 GB y no registra descargas ni valoraciones en el momento de la consulta. La información pública disponible es muy limitada: no se documentan arquitectura, datos de entrenamiento, longitud de contexto, idiomas soportados ni benchmarks de calidad, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se detalla en la model card del modelo base ni en la de esta conversión) |
| Parametros totales | ~1.700 millones (1,7B, segun el nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (unica precision publicada del build MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `antareslabs/hunch-1.7b-preview`: la model card no especifica si se trata de un transformer denso, un MoE, un modelo de espacio de estados o una arquitectura hibrida. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo que si se documenta es el proceso de conversion y su validacion. Cada fichero MLX se puntuo sobre 6.000 preguntas retenidas comparandolo con la ejecucion fp32 en PyTorch del mismo checkpoint. El build f16 no modifica ninguna de las 6.000 respuestas, mientras que la propia bf16 alteraria 28. La distancia de variacion total (TV) maxima medida es de 3,13e-03 frente a un umbral minimo (floor) de 3,08e-02, y la lectura se realiza sobre Apple Silicon mediante Metal. El veredicto de la puerta de equivalencia es "pass". La regla de aceptacion y los builds que no la superaron se detallan en el fichero FORMATS del repositorio. Ademas, la temperatura de release esta embebida en el fichero y se aplica por defecto.

## Capacidades

La model card no documenta capacidades funcionales concretas. A partir de la informacion disponible solo puede afirmarse lo siguiente:

- Es un modelo de lenguaje de ~1,7B parametros, presumiblemente capaz de generacion de texto autorregresiva, aunque esto no se confirma explicitamente.
- No hay informacion sobre soporte de tool calling o function calling.
- No hay informacion sobre uso en agentes o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues ni sobre los idiomas cubiertos.
- No se documenta ningun modo especial de inferencia (thinking mode, vision, audio, decodificacion especulativa, etc.).
- Capacidad verificada: la conversion MLX reproduce de forma exacta las salidas del modelo fp32 en PyTorch sobre el conjunto de 6.000 preguntas evaluado.

## Casos de uso

- Inferencia local en Mac con privacidad total: al ejecutarse con MLX sobre Apple Silicon, el modelo puede correr sin conexion y sin que los datos salgan del equipo, lo que resulta adecuado para prototipos y pruebas con material sensible en un portatil o Mac de sobremesa.

- Validacion de conversiones de formato: el conjunto de 6.000 preguntas retenidas y la metrica de variacion total asociada sirven como referencia metodologica para quien necesite auditar conversiones de pesos entre frameworks (por ejemplo, de PyTorch a MLX) y garantizar equivalencia funcional.

- Base para fine-tuning posterior: la etiqueta `base_model:finetune` en el modelo original sugiere que este checkpoint puede emplearse como punto de partida para ajustes especificos sobre tareas concretas, aprovechando su tamano reducido para iterar rapido en hardware de consumo.

- Experimentacion academica y reproducibilidad: investigadores que quieran reproducir resultados en una plataforma distinta de CUDA pueden usar este build para comprobar si las conclusiones se mantienen en silicio de Apple.

- Docencia y divulgacion: su tamano (~3,4 GB en f16) y su ejecucion local en equipos de gama de entrada lo hacen manejable para demostraciones en aula o talleres sobre despliegue de modelos.

- Componente en pipelines de prototipado rapido: para tareas de generacion de texto ligera (borradores, resumenes cortos, clasificacion simple) donde no se requiera maxima calidad, puede integrarse como primer eslabon antes de escalar a un modelo mayor.

- Benchmarking de equivalencia numerica: util como caso de estudio de como f16, bf16 y fp32 divergen sobre un mismo checkpoint y con que magnitud de variacion total.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato cuantitativo publicado corresponde al test de equivalencia numerica frente a fp32:

| Metrica | Valor |
|---|---|
| Preguntas retenidas evaluadas | 6.000 |
| Referencia de comparacion | Ejecucion fp32 en PyTorch del mismo checkpoint |
| Respuestas modificadas por el build f16 MLX | 0 de 6.000 |
| Respuestas modificadas por bf16 (referencia) | 28 de 6.000 |
| Variacion total (TV) maxima medida | 3,13e-03 |
| Umbral minimo (floor) del test | 3,08e-02 |
| Plataforma de lectura | Apple Silicon (Metal) |
| Veredicto de la puerta de equivalencia | pass |

## Requisitos de hardware

- Al estar en formato MLX, el modelo se ejecuta sobre Apple Silicon (Metal). No es compatible de forma nativa con CUDA ni ROCm.
- El repositorio ocupa 3,4 GB; en f16 los pesos requieren aproximadamente esa cantidad de memoria unificada, por lo que un Mac con 8 GB de memoria unificada o mas deberia poder cargarlo.
- GPU recomendadas: no aplica el catalogo habitual (A100, H100, RTX 4090) porque MLX no las soporta; el equivalente serian los chips de Apple (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra).
- Si cabe en hardware de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada.
- Opciones de despliegue: la libreria MLX y el propio repositorio Hunch, cargando el modelo mediante `hunch.formats.hunch_mlx.load(path)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI de forma nativa, dado el formato MLX.
- Latencia y throughput estimados: no disponible.
- Nota: la temperatura de release esta embebida en el fichero y se aplica por defecto al cargarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| `antareslabs/hunch-1.7b-preview-MLX` | ~1,7B | no disponible | Equivalencia f16 verificada (0 cambios en 6.000 preguntas) | Apache-2.0 | safetensors MLX, solo Apple Silicon |
| `antareslabs/hunch-1.7b-preview` (modelo base) | ~1,7B | no disponible | Referencia fp32 | Apache-2.0 | no disponible |
| Otros modelos de ~1,7B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa de rendimiento con alternativas de la misma categoria. La unica comparacion documentada es con el propio modelo base en fp32, respecto al cual este build presenta equivalencia de salidas dentro del conjunto evaluado.

## Limitaciones y advertencias

- Informacion publica muy escasa: no se documentan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta la evaluacion previa a su adopcion.
- Ausencia total de benchmarks de calidad; no hay evidencia publicada sobre su rendimiento real en tareas (razonamiento, codigo, matematicas).
- Sesgos conocidos: no disponibles; no se ha publicado ninguna evaluacion de sesgo o toxicidad.
- Riesgo de alucinacion: no evaluado en la informacion disponible; por su tamano (1,7B) es esperable una mayor propension a errores factuales que en modelos mayores, si bien esto no se confirma con datos.
- Limitacion de plataforma: solo ejecutable en Apple Silicon mediante MLX; no hay build para CUDA, ROCm ni formato GGUF publicado.
- Precision unica: solo se ofrece f16; no hay variantes cuantizadas (4-bit, 8-bit, etc.) ni bf16 publicadas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones heredadas del modelo base `antareslabs/hunch-1.7b-preview`.
- Adopcion nula: 0 descargas y 0 valoraciones en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- Aviso de formato: la temperatura de release viene embebida y se aplica por defecto, lo que puede condicionar los resultados si no se ajusta explicitamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/antareslabs/hunch-1.7b-preview-MLX
- Modelo base: https://huggingface.co/antareslabs/hunch-1.7b-preview
- Regla de aceptacion y builds fallidos (FORMATS.md): https://github.com/antareslabsorg/hunch/blob/main/FORMATS.md
- Repositorio Hunch (README): https://github.com/antareslabsorg/hunch/blob/main/README.md
