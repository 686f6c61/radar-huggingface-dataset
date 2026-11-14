# botp/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF

## Resumen

Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF es un paquete de cuantizaciones GGUF de muy baja precisión del modelo multimodal Qwen3.8-Flash-Next, publicadas originalmente por el laboratorio ISTA-DASLab y redistribuidas por el usuario botp junto con un vector de control que elimina los rechazos (refusals) en tiempo de inferencia. El modelo base es un transformer multimodal (image-text-to-text) de la familia Qwen, con 120.320 millones de parámetros totales según los safetensors del checkpoint original, pensado para despliegue en una sola GPU de consumo mediante el runtime Strata.

La aportación concreta de este repositorio no son los pesos (copiados byte a byte de ISTA-DASLab, con SHA256 verificado), sino un fichero de 480 KB, `Huihui-Qwen3.8-Flash-Next-refusal-direction-r.gguf`, que contiene una dirección de rechazo extraída del checkpoint abliterated de huihui-ai. Strata aplica una proyección sobre el residual stream tras cada capa seleccionada, de modo que el modelo pierde la componente de esa dirección sin modificar los pesos. El resultado es un modelo "abliterated" sin reentrenar ni recuantizar.

Es relevante ahora porque demuestra una técnica de modificación de comportamiento en inferencia (control vectors con proyección, no suma) aplicada a un modelo MoE multimodal de gran tamaño cuantizado a 2-3.5 bits por peso, con decodificación especulativa MTP y soporte de visión, todo ejecutable en hardware de consumo con 48-64 GB de RAM y una GPU de 12 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos (MoE), según el modelo base Qwen3.8-Flash-Next; detalles finos no disponibles en la información proporcionada |
| Parametros totales | 120.320 millones (120,32 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como cifra oficial; se mencionan pruebas con prompts de hasta 131K tokens y decodificación medida a 32K |
| Tipos de cuantizacion | GGUF GSQ-RCO en Q2_0 (2,40 bpw), IQ2_XS (2,50 bpw), IQ3_XXS (3,00 bpw) e IQ3_S (3,50 bpw) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (dos shards por tamaño) más proyector de visión `mmproj-Qwen3.8-Flash-Next-BF16.gguf` y vector de control GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.8-Flash-Next con arquitectura MoE, según se deduce del esquema de cuantización GSQ-RCO de ISTA-DASLab, que mantiene en RAM un subconjunto de expertos (34-50 GB según el tamaño) y descarga el resto. Incluye una capa de borrador MTP (multi-token prediction) de aproximadamente 6 GB, descargada del checkpoint original de Qwen, que habilita decodificación especulativa. El pipeline es image-text-to-text, con un proyector de visión en BF16 separado de los shards de lenguaje. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de este repositorio es doble. Por un lado, las cuantizaciones GSQ-RCO de ISTA-DASLab, descritas en los papers arXiv:2604.18556 (GSQ) y arXiv:2605.00649 (RCO), que permiten llevar un modelo de 120 B a 66-84 GB con pérdida controlada (KL de 0,075 para IQ3_S y 0,193 para IQ2_XS respecto al BF16 de Huihui, con 93% y 88% de coincidencia en top-1). Por otro, la edición de comportamiento: huihui-ai modificó 144 tensores que escriben en el residual stream con una edición de rango uno a lo largo de una dirección unitaria `r`, equivalente a `W_new = W - r(r^T W)`. Strata reproduce esa edición en tiempo de ejecución proyectando el residual stream completo tras cada capa del rango configurado (4-44 o 1-47), con la diferencia de que también elimina la componente `r` de las contribuciones de embedding y n-gramas, y de que la capa 0 no puede ser intervenida.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline image-text-to-text permite entrada conjunta de imagen y texto.
- Procesamiento de imágenes mediante proyector de visión BF16 separado.
- Decodificación especulativa con capa MTP, que acelera la generación.
- Modo "abliterated" activable o desactivable en tiempo de ejecución: con `"experimental_speed_projection": false` se ejecuta el modelo original sin proyección.
- Compatibilidad con APIs OpenAI (`/v1`) y Anthropic (`/v1/messages`) a través del servidor de Strata.
- Cuantización extrema (2,40-3,50 bits por peso) que preserva el comportamiento del modelo completo con degradación medible.
- Soporte de prompts largos: se han medido decodificaciones con prompts de hasta 131K tokens.
- Capacidades de tool calling, agentes o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 120 B en una sola GPU de consumo: con IQ3_S (83,6 GB de descarga, 50 GB de expertos en RAM) y una RTX 3090 se obtienen 59 tokens/s de decodificación a 32K de prompt, lo que permite experimentar con un modelo de escala frontera en hardware de gama alta doméstica.
- Investigación sobre alineación y rechazos: el vector de control permite comparar el comportamiento del modelo con y sin la dirección de rechazo proyectada, aislando el efecto de un único componente direccional en el residual stream sin reentrenar.
- Evaluación de cuantizaciones de muy baja precisión: las cuatro variantes (Q2_0, IQ2_XS, IQ3_XXS, IQ3_S) permiten medir el compromiso entre tamaño, velocidad (87 vs 59 tokens/s) y fidelidad al BF16 (KL 0,193 vs 0,075), útil para decidir el punto de operación en producción.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text con contexto de hasta 131K tokens sirve para tareas de extracción y resumen sobre documentos escaneados o capturas, siempre que se validen las salidas.
- Prototipado de asistentes conversacionales de contexto largo: la ventana extensa y la decodificación especulativa permiten mantener conversaciones multi-turno con historial amplio en un servidor local con API compatible con OpenAI.
- Experimentación con control vectors en inferencia: el fichero de 480 KB y los flags `--control-vector-scaled`, `--control-vector-layer-range` y `--cvec-mode project` sirven como base para probar otras direcciones de comportamiento (estilo, idioma, formato) sobre el mismo modelo.
- Investigación reproducible en cuantización: los SHA256 de cada shard y del proyector de visión permiten verificar la integridad de los pesos y reproducir las mediciones publicadas.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor sobre una RTX 3090, no benchmarks estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible.

| Metrica | Q2_0 | IQ2_XS | IQ3_XXS | IQ3_S |
|---|---:|---:|---:|---:|
| Bits por peso | 2,40 | 2,50 | 3,00 | 3,50 |
| Descarga | 66,4 GB | 68,0 GB | 75,8 GB | 83,6 GB |
| Expertos en RAM | 34 GB | 35,5 GB | 43 GB | 50 GB |
| KL respecto a BF16 Huihui | no medido | 0,193 | no medido | 0,075 |
| Top-1 igual que BF16 | no medido | 88% | no medido | 93% |
| Decodificacion a prompt de 32K | no medido | 87 tok/s | no medido | 59 tok/s |

Según el autor, IQ2_XS decodifica entre un 45% y un 70% más rápido que IQ3_S con prompts de hasta 131K tokens. ISTA-DASLab describe Q2_0 como el más rápido de los cuatro.

## Requisitos de hardware

- GPU NVIDIA o AMD con 12 GB de VRAM o más (requisito de Strata).
- RAM del sistema: 48 GB para Q2_0 e IQ2_XS; 64 GB para IQ3_XXS e IQ3_S, según la página de Strata.
- Almacenamiento: 66,4-83,6 GB por tamaño, más el proyector de visión BF16 y la capa MTP de aproximadamente 6 GB.
- Cabe en GPU de consumo: el autor midió con una RTX 3090; los expertos se mantienen en RAM y se descargan dinámicamente, por lo que la VRAM no necesita alojar los 120 B.
- Opciones de despliegue: Strata (runtime con soporte de proyección de control vector, servidor compatible con OpenAI y Anthropic); llama.cpp carga los GGUF pero su `--control-vector` estándar suma el vector en lugar de proyectarlo, por lo que el comportamiento abliterated no funciona igual.
- Throughput medido: 59 tok/s (IQ3_S) y 87 tok/s (IQ2_XS) en decodificación con prompt de 32K en una RTX 3090.
- Latencia de prefill: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.8-Flash-Next abliterated GSQ-RCO Strata) | 120,32 B | GGUF 2,40-3,50 bpw | no disponible (pruebas a 131K) | qwen-community-license-1.0 | Requiere Strata para la proyección; visión incluida |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 120,32 B | GGUF 2,40-3,50 bpw | no disponible | qwen-community-license-1.0 | Pesos originales sin vector de control; benchmarks propios en su repo |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | 120,32 B | BF16 (referencia) | no disponible | qwen-community-license-1.0 | Edición de rango uno horneada en 144 tensores; sin cuantizar |
| alesha-pro/Huihui-Qwen3.8-Flash-Next-abliterated-exl3-4bit-hq_h6_ng6 | 120,32 B | EXL3 4 bits | no disponible | qwen-community-license-1.0 | Edición abliterated horneada en pesos, cuantización EXL3 en lugar de GGUF |

## Limitaciones y advertencias

- La licencia qwen-community-license-1.0 impone restricciones adicionales al uso comercial; es necesario revisar el texto de la licencia antes de desplegar en producción.
- El modelo está deliberadamente modificado para eliminar rechazos, lo que reduce las salvaguardas de seguridad y aumenta el riesgo de generar contenido dañino, sesgado o inexacto.
- Riesgo de alucinación inherente a un modelo de 120 B cuantizado a 2-3,5 bits; la pérdida medida (KL 0,075-0,193, top-1 88-93%) implica degradación respecto al BF16.
- La proyección del vector de control no puede aplicarse a la capa 0 y afecta al residual stream completo, incluidas las contribuciones de embedding y n-gramas, por lo que el comportamiento difiere de la edición horneada en pesos.
- llama.cpp estándar no reproduce el efecto abliterated: su `--control-vector` suma en lugar de proyectar, de modo que el modelo se comporta como el original.
- El instalador de Strata no fue probado de extremo a extremo por el autor; este construyó el motor desde la fuente fijada y lo arrancó con los mismos argumentos.
- Los idiomas soportados no están documentados; no se garantiza un rendimiento uniforme fuera de los idiomas principales del modelo base.
- Los tamaños Q2_0 e IQ3_XXS no fueron medidos por el autor; sus cifras de RAM provienen de la configuración de Strata.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/botp/Qwen3.8-Flash-Next-abliterated-GSQ-RCO-Strata-GGUF
- Modelo base cuantizado (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Cuantizaciones EXL3 del mismo modelo: https://huggingface.co/alesha-pro/Huihui-Qwen3.8-Flash-Next-abliterated-exl3-4bit-hq_h6_ng6
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código RCO: https://github.com/IST-DASLab/RCO
- Runtime Strata: https://github.com/Niko1221/Strata
