# MergekitCloud/cpu-timing-30b-moe-linear

## Resumen

cpu-timing-30b-moe-linear es un modelo de lenguaje resultado de una fusión de pesos (*weight merge*) entre dos modelos de la familia Qwen3: `Qwen/Qwen3-30B-A3B` (modelo base) y `Qwen/Qwen3-30B-A3B-Instruct-2507` (variante instruct ajustada). Lo publica el usuario MergekitCloud en HuggingFace y se ha generado con la herramienta mergekit aplicando el método Linear (media ponderada de pesos, inspirado en el artículo *Model soups*, arXiv:2203.05482), con un peso de 0,5 para cada modelo padre y precisión bfloat16.

El resultado conserva la arquitectura del padre: un transformer decoder-only con mezcla de expertos (MoE) de 30.532.122.624 parámetros totales, de los cuales solo una fracción se activa por token, lo que abarata la inferencia frente a un modelo denso del mismo tamaño. El repositorio ocupa 61,1 GB en safetensors, coherente con el almacenamiento en bfloat16 de los 30,53 mil millones de parámetros.

Su relevancia es limitada y muy específica: no aporta arquitectura nueva, ni dataset de entrenamiento propio, ni evaluación publicada. Se trata de un experimento de fusión sin descargas ni valoraciones en el momento de redactar esta ficha, útil únicamente como caso de estudio de mergekit o como punto de partida para quien quiera reproducir o comparar fusiones lineales de modelos Qwen3 MoE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), arquitectura Qwen3 MoE (`qwen3_moe`) |
| Parametros totales | 30.532.122.624 (30,53 mil millones) |
| Parametros activos | No disponible en este repositorio; el padre Qwen3-30B-A3B declara 3,3 mil millones activos |
| Longitud de contexto | No disponible en esta ficha; los modelos base Qwen3-30B-A3B declaran 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en bfloat16; no hay GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio (los modelos base Qwen3 se distribuyen bajo Apache 2.0) |
| Formato de pesos | safetensors (bfloat16) |
| Metodo de fusion | Linear (mergekit), peso 0,5 / 0,5, dtype bfloat16 |
| Tamano del repositorio | 61,1 GB |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

No hay entrenamiento: el modelo se obtiene por interpolación lineal de los tensores de dos checkpoints preentrenados. La configuración YAML publicada es explícita: `merge_method: linear`, con `Qwen/Qwen3-30B-A3B` al 50 % y `Qwen/Qwen3-30B-A3B-Instruct-2507` al 50 %, en bfloat16. El método Linear es una media ponderada parámetro a parámetro, descrita en el artículo *Model soups* (arXiv:2203.05482), que suele funcionar cuando los checkpoints comparten inicialización y arquitectura, como es el caso aquí.

La arquitectura subyacente es la de Qwen3 MoE: capas de atención con *grouped query attention*, capas de alimentación hacia delante sustituidas por una mezcla de expertos con enrutador por token, y un número de capas y expertos idéntico en ambos padres (si no, la fusión no sería posible). Uno de los padres es un modelo de razonamiento híbrido (*thinking* / *non-thinking*) y el otro es una variante instruct sin modo de razonamiento; la media aritmética de sus pesos no garantiza que el comportamiento resultante sea coherente, ya que las representaciones aprendidas por cada rama pueden no ser linealmente compatibles.

No se documenta ningún ajuste posterior (RLHF, DPO, SFT), ninguna innovación técnica propia ni datos de entrenamiento adicionales. No hay evaluación publicada que valide si la fusión conserva, degrada o mejora las capacidades de los padres.

## Capacidades

- Generación de texto conversacional: hereda la interfaz de chat del padre instruct, con formato de plantilla de Qwen3.
- Razonamiento multi-paso: el padre `Qwen3-30B-A3B` soporta modo de pensamiento explícito; no está verificado que la fusión conserve esa capacidad de forma estable.
- Generación de código: capacidad esperable por herencia de los modelos base, sin evaluación publicada que la cuantifique.
- Razonamiento matemático: igualmente heredado, no verificado tras la fusión.
- Soporte multilingüe: no declarado en este repositorio; los modelos Qwen3 cubren más de 100 idiomas, pero el autor no especifica idiomas para esta fusión.
- Tool calling / function calling: el padre Instruct-2507 lo soporta; el resultado de la fusión no está validado y la media de pesos puede romper el formato de llamada a herramientas.
- Uso con agentes y pipelines multi-turno: posible en teoría por la ventana de contexto heredada, sin garantías ni pruebas publicadas.
- Capacidades especiales: no se declaran visión, audio ni modo de razonamiento explícito para este checkpoint concreto.

## Casos de uso

- Estudio de técnicas de fusión de modelos: sirve como ejemplo reproducible de merge lineal entre una variante de razonamiento y una instruct dentro de la misma familia, útil para investigar cuándo la interpolación de pesos preserva capacidades.
- Reproducción de experimentos de mergekit: la configuración YAML completa está publicada, lo que permite replicar la fusión, variar los pesos (por ejemplo 0,7 / 0,3) y comparar resultados.
- Punto de partida para ajuste fino posterior: al conservar la arquitectura Qwen3 MoE, se puede cargar con transformers y aplicar SFT o DPO sobre tareas concretas antes de usarlo en producción.
- Comparación controlada de checkpoints: si se dispone de una suite de evaluación propia, permite medir cuánto degrada una media lineal frente a cada padre por separado.
- Docencia y divulgación técnica: ilustra de forma práctica la diferencia entre fusionar pesos y fusionar predicciones, con un caso real y verificable.
- Pruebas de infraestructura de inferencia MoE: útil para validar que un despliegue con vLLM, TGI o llama.cpp carga correctamente un modelo MoE de 30B en safetensors.
- Generación de texto conversacional experimental: uso interno no crítico donde la ausencia de evaluaciones no suponga un riesgo elevado (prototipos, demos, pruebas de concepto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica en la model card, y la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo (únicamente contenido no relacionado, vídeos de gatos). Tampoco existen evaluaciones de terceros, dado que el repositorio registra 0 descargas y 0 valoraciones.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 61 GB solo para pesos, más caché KV. No cabe en ninguna GPU de consumo.
- GPU de datacenter: 1x H100 80 GB o 1x A100 80 GB cubren los pesos en bf16 con margen para caché KV; con 2x A100 40 GB sería necesario repartir el modelo (tensor parallelism).
- Cuantización a 8 bits: entorno a 31 GB de pesos, viable en 2x RTX 4090/3090 o 1x A6000 48 GB.
- Cuantización a 4 bits: estimación de 16-18 GB de pesos, lo que permitiría ejecución en una RTX 4090 (24 GB), RTX 4080 (16 GB, muy justo) o similar, siempre que el usuario genere la cuantización por su cuenta, ya que el autor no publica GGUF ni AWQ.
- Despliegue: al ser safetensors con arquitectura `qwen3_moe`, es compatible con transformers, vLLM y TGI; llama.cpp y Ollama requieren convertir previamente a GGUF.
- Latencia y throughput: no disponibles. Al ser MoE con activación parcial, el coste por token es inferior al de un modelo denso de 30B, pero no hay cifras publicadas para esta fusión.
- Nota práctica: los 61,1 GB de repositorio implican tiempos de descarga y de carga en memoria considerables; conviene verificar la integridad de los shards antes de desplegar.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Estado / evaluacion |
|---|---|---|---|---|---|
| cpu-timing-30b-moe-linear | 30,53 B | No disponible (padre: 3,3 B) | No disponible | No disponible | Fusión sin evaluar, 0 descargas |
| Qwen/Qwen3-30B-A3B | 30,53 B | 3,3 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Modelo oficial con evaluaciones publicadas |
| Qwen/Qwen3-30B-A3B-Instruct-2507 | 30,53 B | 3,3 B | 262.144 segun la ficha del modelo | Apache 2.0 | Modelo oficial instruct con evaluaciones publicadas |
| Mixtral 8x7B (alternativa MoE abierta) | 46,7 B | 12,9 B | 32.768 | Apache 2.0 | Modelo oficial con evaluaciones publicadas |

Los datos de contexto, parametros activos y licencia de las tres alternativas provienen de sus fichas oficiales, no de este repositorio. La diferencia fundamental es que este modelo carece de evaluación, licencia declarada y soporte del fabricante, mientras que los tres alternativas sí los tienen.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay ningún benchmark que indique si la fusión conserva las capacidades de razonamiento, código o matemáticas de los padres.
- Riesgo de degradación por fusión heterogénea: mezclar un modelo de razonamiento con uno instruct no razonador puede producir respuestas incoherentes o formatos de salida inestables.
- Licencia no declarada: el repositorio no especifica licencia. Aunque los padres son Apache 2.0, la ausencia de licencia explícita en este checkpoint genera incertidumbre jurídica para uso comercial. Conviene contactar con el autor o usar los padres originales.
- Idiomas no declarados: no se puede asumir cobertura multilingüe sin pruebas.
- Contexto no verificado: la ventana efectiva tras la fusión no está documentada ni medida.
- Riesgo de alucinación: inherente a todos los modelos de lenguaje; aquí se agrava por la falta de evaluación y por posibles artefactos de la media de pesos.
- Sesgos: no documentados por el autor. Se heredarían los de los corpus de entrenamiento de Qwen3, sin auditoría específica.
- Soporte de tool calling no garantizado: la fusión puede romper el formato estructurado que sí respeta el padre instruct.
- Sin mantenimiento ni comunidad: 0 descargas y 0 valoraciones implican ausencia de informes de errores y de correcciones.
- No apto para producción crítica: sin evaluación, sin licencia clara y sin soporte, su uso debería limitarse a entornos experimentales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MergekitCloud/cpu-timing-30b-moe-linear
- Modelo base instruct: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Artículo del método Linear / Model soups: https://arxiv.org/abs/2203.05482
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (solo resultados no relacionados), por lo que no se pueden listar papers, blogs ni demos adicionales.
