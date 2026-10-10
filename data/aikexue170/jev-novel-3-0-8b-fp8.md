# aikexue170/jev-novel-3-0.8b-fp8

## Resumen

JEVnovel 3 · 0.8B (FP8) es un modelo de clasificación de frases en chino diseñado específicamente para la revisión de novelas generadas por IA. No genera texto: hace una única pasada hacia delante (forward) y devuelve, para cada frase, dos señales independientes: una "curva de percepción" que localiza en qué fragmento (delimitado por puntuación) empieza a escribirse mal, y una "densidad informativa" por fragmento que indica si ese fragmento aporta contenido o es puro relleno. La combinación de ambas señales produce una acción de edición concreta: eliminar, reescribir o dejar intacto.

El modelo lo publica el usuario aikexue170 y forma parte de la serie JEVnovel, de la que esta es la variante más pequeña (0,75B parámetros) y en cuantización FP8. Se construye mediante ajuste fino con LoRA sobre el backbone Qwen3.5-0.8B (arquitectura qwen3_5_text, hidden 1024, 24 capas) y añade dos cabezas lineales de regresión, una para la curva de percepción y otra para la densidad. La entrada máxima es de 512 tokens, incluyendo un prompt fijo.

Su relevancia radica en que aborda un problema muy concreto de los flujos de trabajo con AIGC literario: la detección automática de "八股" (clichés y relleno típicos de la prosa generada por IA) a nivel de fragmento, no solo de frase completa. Frente a las versiones anteriores de la serie (2 y 2.5), mejora la Macro-F1 en el conjunto principal de 0,7426/0,730 a 0,776, a costa de una ligera pérdida en la Macro-F1 sobre el conjunto completo (0,576 frente a 0,6057/0,607).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone qwen3_5_text, hidden 1024, 24 capas) con dos cabezas lineales de regresion; ajuste fino con LoRA |
| Parametros totales | 752.393.024 (0,75B) |
| Longitud de contexto | 512 tokens de entrada maxima (incluye prompt fijo) |
| Tipos de cuantizacion | FP8 W8A8 (e4m3, pesos y activaciones); existe version BF16 en la misma serie (`jev-novel-3-0.8b-bf16`) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (archivo unico, ~1,0 GB), cuantizacion FP8 |
| Cabezas de salida | Curva de percepcion: Linear(1024→1), lee el token final de cada fragmento. Densidad: Linear(1024→1), media dentro del fragmento |
| Umbrales de decision | Frase "necesita modificacion": ≥0,080. Fragmento malo: Δλ≥0,08 y λ≥0,15, o λ≥0,9. Frontera borrar/reescribir: densidad 0,5 |
| Longitud de entrada y salida | Clasificacion por pasada unica; no hay generacion autorregresiva |
| Libreria | PyTorch (estructura personalizada, no compatible con `AutoModel`) |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-0.8B (qwen3_5_text, hidden dimension 1024, 24 capas) y se ajusta con LoRA. Sobre la representacion del backbone se montan dos cabezas independientes, cada una una capa lineal de 1024 a 1. La primera predice la curva de percepcion: la frase se segmenta por puntuacion y se lee el token final de cada fragmento, de modo que la curva indica en que punto empieza a degradarse la calidad. La segunda predice la densidad informativa de cada fragmento, promediando las representaciones dentro del fragmento. El diseno separa deliberadamente "esta mal escrito" de "no aporta nada", porque son problemas distintos con soluciones distintas.

El entrenamiento combina dos fuentes de supervision. Los datos de partida son 2,4 millones de frases de preferencia humana recogidas en una plataforma de anotacion comunitaria. Para la curva de percepcion se emplea destilacion desde un modelo profesor de 27B de la misma serie (`jev-novel-3-27b-bf16`, publicado por alkaid55555 en ModelScope): el profesor puntua cada prefijo de la frase en una escala de cinco niveles (mal, requiere retoque menor, mediocre, aceptable, excelente), y el estudiante aprende la forma completa de la curva, no solo la etiqueta global. Para la densidad informativa se emplea un juez `StartLux-Decision-27B`, que responde por fragmento a una pregunta orientada a la edicion: en caso de pulir la frase, habria que eliminar el fragmento entero o conservarlo y reescribirlo. Las respuestas del juez se usan como etiquetas de densidad a nivel de fragmento, calibradas con ejemplos de cliches recopilados manualmente. La innovacion principal es, por tanto, el esquema de destilacion a dos profesores y la separacion de las dos tareas en cabezas distintas, no la arquitectura en si.

## Capacidades

- Clasificacion de frases en chino para determinar si requieren modificacion, con probabilidad `p_bad` y umbral de 0,080.
- Localizacion de la porcion defectuosa dentro de la frase mediante una curva de percepcion a nivel de fragmento, con correlacion de 0,76 con el profesor de 27B en el conjunto de validacion.
- Puntuacion de densidad informativa por fragmento (0 a 1), con correlacion de 0,90 con el juez de 27B en validacion.
- Recomendacion de accion de edicion por fragmento: borrar, reescribir o no hacer nada.
- Procesamiento por lotes en formato JSONL (`--input`, `--output`), con campos por frase (`id`, `p_bad`, `bad`) y por fragmento (`text`, `w`, `lam`, `delta_lam`, `density`, `flag`, `action`).
- Inferencia en una sola pasada hacia delante, sin decodificacion autorregresiva, lo que reduce coste por frase.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, vision ni audio.
- No se documenta soporte multilingue: el unico idioma declarado es el chino.

## Casos de uso

- Revision automatica de novelas generadas por IA: integrar `infer.py` en un pipeline posterior a la generacion para marcar que frases necesitan retoque y, dentro de cada una, que fragmentos concretos son decorativos y pueden eliminarse sin perdida de informacion.
- Control de calidad en plataformas de publicacion: filtrar automaticamente capitulos completos antes de que lleguen a un editor humano, using la salida `bad` como criterio de cribado y las acciones por fragmento como guia de correccion.
- Limpieza de corpus de entrenamiento: eliminar pasajes de relleno de datasets novelisticos antes de usarlos para ajustar modelos generativos, reduciendo la propagacion de cliches de "八股".
- Deteccion de relleno en tiempo de redaccion: como servicio de respuesta rapida (una pasada hacia delante por frase) para senalar frases de relleno mientras un autor escribe, dado el tamano reducido del modelo.
- Analitica editorial sobre estilos: calcular la distribucion de densidad informativa por capitulo para comparar borradores de distintos autores o versiones de un mismo texto.
- Asistente de edicion con explicabilidad: al devolver la curva y las acciones por fragmento, el modelo puede mostrar al editor donde empieza el problema, a diferencia de un clasificador opaco de frase completa.
- Filtrado previo en tuberias de traduccion o resumen: descartar frases de baja densidad antes de procesarlas, para reducir coste computacional en etapas posteriores.

## Benchmarks y rendimiento

Evaluacion con protocolo unificado de la serie: el umbral se fija en el conjunto de validacion y se congela, y despues se aplica al conjunto principal (538 frases con mayor consenso humano). La metrica es Macro-F1.

| Modelo | Macro-F1 (conjunto principal) | Recuperacion `bad` | Precision `bad` | Falsos positivos en frases normales | Macro-F1 (conjunto completo) |
|---|---:|---:|---:|---:|---:|
| `jev-novel-2-0.8b-bf16` (2 gen) | 0,7426 | 0,6790 | 0,7830 | 0,1910 | 0,6057 |
| `jev-novel-2.5-0.8b-bf16` (2,5 gen) | 0,730 | 0,734 | 0,732 | 0,273 | 0,607 |
| **`jev-novel-3-0.8b-fp8` (este modelo)** | **0,776** | 0,664 | 0,865 | 0,105 | 0,576 |

Comparacion FP8 frente a BF16 de la misma generacion, con el mismo umbral (0,080) sobre el conjunto completo de 4254 frases: la Macro-F1 pasa de 0,580 a 0,576, la desviacion media por frase es de 0,006 y se invierten 6 de 538 decisiones en el conjunto principal. El autor concluye que la cuantizacion es practicamente neutra. Consistencia de las cabezas frente a los profesores en validacion: correlacion 0,76 para la curva de percepcion y 0,90 para la densidad informativa.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que el modelo es un clasificador especializado y no un modelo generativo de proposito general.

## Requisitos de hardware

- Requisitos declarados por el autor: Linux, Python 3.10 o superior y GPU NVIDIA con soporte de BF16.
- Dependencia concreta: `torch==2.13.0` instalado desde el indice CUDA 13.0 (`--index-url https://download.pytorch.org/whl/cu130`), mas `requirements.txt` con `--no-build-isolation`.
- Peso en disco del repositorio: 1,0 GB (un unico archivo safetensors FP8 W8A8). La inferencia usa la ruta nativa de baja precision de PyTorch.
- VRAM estimada: por debajo de 2 GB en la practica (aproximadamente 1 GB de pesos mas activaciones y sobrecarga de contexto CUDA). Estimacion derivada del tamano de pesos; el autor no publica una cifra de VRAM.
- Cabe en cualquier GPU de consumo con soporte de BF16. Para aprovechar la ruta FP8 e4m3 con tensor cores se requiere arquitectura Ada Lovelace o Hopper (por ejemplo, RTX 4000 en adelante o H100); la model card no explicita este requisito de generacion.
- Opciones de despliegue: la model card solo documenta `infer.py` del propio repositorio, ya que la estructura es personalizada y no carga con `AutoModel`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al tratarse de una pasada unica por frase y no de generacion autorregresiva, el coste por frase es bajo en terminos relativos, pero no se publican mediciones.
- Integridad: el repositorio incluye `SHA256SUMS` para verificar los archivos descargados con `sha256sum -c`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (conjunto principal) | Precision `bad` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `jev-novel-3-0.8b-fp8` (este) | 0,75B (752.393.024) | 512 tokens | 0,776 | 0,865 | Apache-2.0 | HuggingFace, FP8 |
| `jev-novel-3-0.8b-bf16` | 0,75B (por nomenclatura de la serie) | 512 tokens | no disponible (solo se indica Macro-F1 0,580 en el conjunto completo) | no disponible | Apache-2.0 | Misma serie, precision BF16 |
| `jev-novel-2.5-0.8b-bf16` | 0,8B (por nomenclatura; dato exacto no disponible) | no disponible | 0,730 | 0,732 | no disponible | Serie JEVnovel |
| `jev-novel-2-0.8b-bf16` | 0,8B (por nomenclatura; dato exacto no disponible) | no disponible | 0,7426 | 0,7830 | no disponible | Serie JEVnovel |

No se dispone de informacion sobre modelos de terceros directamente comparables en esta categoria (clasificadores de calidad de frase orientados a revision de prosa literaria en chino). Las unicas alternativas documentadas son las generaciones anteriores de la propia serie JEVnovel.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El autor no documenta analisis de sesgos, y el corpus de preferencias humanas de 2,4 millones de frases puede incorporar los sesgos de los anotadores comunitarios.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es de falsos positivos y falsos negativos en la clasificacion: con el umbral congelado en 0,080, la tasa de falsos positivos sobre frases normales es del 10,5%, y la recuperacion de frases malas es del 66,4%, por lo que aproximadamente un tercio de las frases problemáticas no se detectaria.
- Limitaciones de contexto: la entrada maxima es de 512 tokens incluyendo un prompt fijo, lo que restringe la unidad de analisis a frases o fragmentos cortos; no esta pensado para parrafos largos ni documentos completos.
- Limitacion de idioma: soporte unicamente en chino (zh). No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Restriccion tecnica relevante: la estructura es personalizada y no se puede cargar con `AutoModel`; es obligatorio usar el `infer.py` del repositorio. Cualquier integracion en un servidor de inferencia convencional requiere trabajo adicional.
- Los umbrales de decision (0,080, 0,08, 0,15, 0,9 y 0,5) estan congelados a partir del conjunto de validacion de este modelo concreto. Reutilizarlos con otras versiones de la serie o con dominios distintos puede degradar el rendimiento.
- Restricciones de licencia para uso comercial: la licencia es Apache-2.0, heredada del modelo base Qwen3.5, lo que en principio permite uso comercial. Debe verificarse la licencia de Qwen/Qwen3.5-0.8B y las condiciones del archivo `LICENSE` del repositorio antes de un despliegue en produccion.
- La cuantizacion FP8 W8A8 introduce una degradacion medida y calibrada por el autor: Macro-F1 de 0,580 a 0,576 sobre el conjunto completo y 6 de 538 decisiones invertidas en el conjunto principal. Es un efecto pequeno, pero conviene validar en el corpus propio.
- Unidades de analisis dependientes de la puntuacion: la segmentacion en fragmentos se hace por signos de puntuacion. Textos con puntuacion atipica pueden segmentarse de forma poco util.
- El modelo cuenta con 0 descargas y 0 "likes" en el momento de redactar esta ficha, y fue creado el 2026-10-10: no existe todavia validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aikexue170/jev-novel-3-0.8b-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Profesor de 27B de la serie (`jev-novel-3-27b-bf16`, publicado por alkaid55555 en ModelScope): https://modelscope.cn/models/alkaid55555/jev-novel-3-27b-bf16
- Script de inferencia incluido en el repositorio: `infer.py`
- Informe tecnico incluido en el repositorio: `JEVnovel3技术报告.md`
- Ejemplo de salida: `demo.png` (en el repositorio)
- Sumas de verificacion: `SHA256SUMS` (en el repositorio)
- Version en precision BF16 de la misma generacion: `jev-novel-3-0.8b-bf16` (referenciada en la model card; URL no disponible)
