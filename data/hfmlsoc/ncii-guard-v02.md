# hfmlsoc/ncii-guard-v02

## Resumen

ncii-guard-v02 es un clasificador binario de texto desarrollado por hfmlsoc que detecta prompts de edición de imágenes destinados a generar imágenes íntimas no consentidas (NCII, por sus siglas en inglés): solicitudes para desnudar, desvestir o sexualizar a una persona en una fotografía. El modelo se construye sobre `microsoft/harrier-oss-v1-270m`, un transformer de 270 millones de parámetros, al que se le ha fusionado un adaptador LoRA de rango 8 entrenado específicamente para esta tarea. El resultado es un modelo de 268.099.456 parámetros que se carga directamente con `transformers` sin necesidad de `peft`.

La relevancia de este modelo radica en su enfoque en la ofuscación adversarial: los atacantes escriben variantes como `rem0ve h3r dr3ss`, usan caracteres cirílicos o griegos que imitan letras latinas (`rеmove`) o caracteres de ancho completo (`ｒｅｍｏｖｅ`). Para mitigarlo, el tokenizador incorpora un normalizador que elimina caracteres de control, mapea 30 codepoints cirílicos y griegos a sus equivalentes latinos y aplica NFKD con eliminación de acentos. Además, el entrenamiento incluye datos adversariales con l33t speak, separación de caracteres, letras tachadas y otros trucos. El modelo solo soporta inglés y su licencia no está especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (basado en `microsoft/harrier-oss-v1-270m`) con adaptador LoRA fusionado |
| Parametros totales | 268.099.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el tokenizador trunca a 256 tokens en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias basado en `microsoft/harrier-oss-v1-270m`, un transformer encoder preentrenado para texto. Sobre este modelo base se entreno un adaptador LoRA de rango 8 con datos especificos de NCII, que posteriormente se fusiono en los pesos principales. Esto permite cargar el modelo con `AutoModelForSequenceClassification` sin dependencias adicionales de `peft`.

El entrenamiento incluyo dos componentes clave para robustez ante ofuscacion: un normalizador integrado en el tokenizador (que se aplica automaticamente al tokenizar) y datos de entrenamiento adversariales con variantes que el normalizador no puede plegar, como l33t speak, separacion de caracteres, letras tachadas (`ø`, `ł`), versalitas y caracteres de relleno Hangul. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Clasificacion binaria de prompts de edicion de imagenes: etiqueta `1` para NCII, etiqueta `0` para seguro.
- Deteccion de ofuscacion basica: normalizacion de caracteres cirilicos y griegos que imitan latinos, eliminacion de caracteres de control zero-width y bidi, y plegado NFKD con eliminacion de acentos.
- Robustez parcial ante ataques de caracteres: l33t speak, separacion de caracteres, letras tachadas y versalitas se manejan parcialmente gracias a los datos adversariales.
- Capacidad de distinguir usos inocuos de palabras disparadoras: por ejemplo, "strip the varnish from this table" se clasifica como seguro, y "put a jacket on him" (anadir ropa) tambien.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: es un clasificador de texto puro en ingles.

## Casos de uso

- Moderacion de contenido en generadores de imagenes: integrar el modelo como filtro previo en pipelines de texto-a-imagen para bloquear prompts que soliciten desnudar o sexualizar a personas en fotografias. El modelo puede ejecutarse con `pipeline("text-classification")` y un umbral ajustable.
- Proteccion en plataformas de intercambio de imagenes: analizar descripciones o metadatos de subidas para detectar solicitudes de NCII antes de que lleguen a un modelo generativo.
- Filtrado en APIs de edicion fotografica: servicios que permiten editar fotos de personas pueden usar el clasificador para rechazar operaciones de desvestido o sexualizacion no consentida.
- Auditoria de prompts en datasets de entrenamiento: limpiar corpus de texto que alimentan modelos generativos eliminando ejemplos que incitan a NCII.
- Investigacion en seguridad de IA: como referencia para estudiar la eficacia de normalizadores y datos adversariales frente a ofuscacion en clasificadores de moderacion.
- Despliegue en entornos de baja latencia: al ser un modelo de 268M parametros, puede ejecutarse en CPU o GPU pequenas con tiempos de inferencia del orden de milisegundos, apto para filtrado en tiempo real.

## Benchmarks y rendimiento

Los resultados se publican sobre un conjunto de test reservado de 980 prompts, de los cuales 70 son NCII. Se proporciona el barrido completo de umbrales porque el modelo no recomienda un umbral por defecto.

| threshold | F1 | precision | recall | false pos | false neg |
|---|---|---|---|---|---|
| 0.10 | 0.875 | 0.851 | 0.900 | 11 | 7 |
| 0.20 | 0.873 | 0.861 | 0.886 | 10 | 8 |
| 0.30 | 0.863 | 0.870 | 0.857 | 9 | 10 |
| 0.50 | 0.863 | 0.870 | 0.857 | 9 | 10 |
| 0.70 | 0.882 | 0.909 | 0.857 | 6 | 10 |
| 0.80 | 0.889 | 0.923 | 0.857 | 5 | 10 |
| 0.90 | 0.879 | 0.936 | 0.829 | 4 | 12 |
| 0.935 | 0.886 | 0.951 | 0.829 | 3 | 12 |
| 0.95 | 0.892 | 0.967 | 0.829 | 2 | 12 |

Ademas, se evaluo la robustez frente a 35 familias de ataques de ofuscacion. La tabla siguiente muestra las diez familias mas debiles:

| family | recall @0.5 | recall @0.935 | precision @0.5 | precision @0.935 |
|---|---|---|---|---|
| `bidi_rlo_full` | 0.514 | 0.457 | 0.667 | 0.780 |
| `homoglyph_residual` | 0.514 | 0.386 | 0.750 | 0.844 |
| `stroked_letters` | 0.514 | 0.471 | 0.783 | 0.805 |
| `l33t_symbols` | 0.600 | 0.543 | 0.792 | 0.905 |
| `small_caps` | 0.600 | 0.514 | 0.824 | 0.857 |
| `bidi_rlo_words` | 0.623 | 0.536 | 0.729 | 0.860 |
| `invisible_residual` | 0.629 | 0.529 | 0.772 | 0.822 |
| `l33t_basic` | 0.629 | 0.514 | 0.733 | 0.818 |
| `l33t_heavy` | 0.643 | 0.571 | 0.714 | 0.833 |
| `separate_dot` | 0.643 | 0.557 | 0.833 | 0.975 |

La mediana de recall en las 35 familias es de 0.729 con umbral 0.5 y 0.653 con 0.935, frente a 0.857 y 0.829 en texto sin ofuscar. Las familias de parafraseo (`synonym_tool` y `synonym_clinical`) alcanzan recall 1.000 con umbral 0.5; los ataques a nivel de caracter son los que mas degradan el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 268M parametros, en FP32 (~1.1 GB) cabe en cualquier GPU moderna; en FP16 (~0.5 GB) cabe incluso en GPUs integradas o tarjetas de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso CPU sola para inferencia por lotes). Para despliegue concurrente, una T4 o A10 es suficiente.
- En consumer GPU: si, cabe en practicamente todas las GPUs de consumo actuales.
- Opciones de despliegue: compatible con `transformers` (pipeline o `AutoModelForSequenceClassification`), `text-embeddings-inference` (segun los tags de HuggingFace), y puede exportarse a ONNX o TensorRT para inferencia de baja latencia. Tambien es posible usar `vLLM` si se adapta, aunque no esta documentado.
- Latencia y throughput estimados: no se proporcionan datos oficiales; para un modelo de este tamano, en una GPU moderna se esperan latencias por debajo de 5 ms por muestra en batch pequeno y throughput de cientos de muestras por segundo en batch grande.

## Comparativa con modelos similares

El modelo base `microsoft/harrier-oss-v1-270m` es el punto de comparacion natural, ya que ncii-guard-v02 es una adaptacion del mismo. Otros clasificadores de moderacion de contenido como Llama Guard 3 (8B) o WildGuard (1.3B) cubren un espectro mas amplio de categorias de riesgo, pero tienen mas parametros y no estan especializados en NCII. No se dispone de datos publicos de rendimiento comparativo entre estos modelos en la tarea especifica de NCII.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| hfmlsoc/ncii-guard-v02 | 268M | no disponible | Clasificador binario NCII | no disponible |
| microsoft/harrier-oss-v1-270m | 270M | no disponible | Modelo base de texto | no disponible |
| Llama Guard 3 | 8B | 128K | Moderacion multicategoria | Llama Community License |
| WildGuard | 1.3B | no disponible | Moderacion de prompts y respuestas | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles. El normalizador reescribe caracteres cirilicos y griegos como equivalentes latinos y elimina acentos de todos los scripts, pero el texto en ruso, griego u otros idiomas no latinos no se procesa correctamente (la model card lo indica como limitacion explicita).
- El modelo no incluye un umbral recomendado; el valor por defecto de 0.5 no es neutral. Elegir un umbral alto (0.935) mejora la precision hasta 0.951 pero reduce el recall ante ofuscacion (de 0.857 a 0.829 en texto limpio, y de 0.729 a 0.653 de mediana en las 35 familias de ataque).
- Existen fallos conocidos: por ejemplo, el prompt `rem0ve h3r dr3ss` se clasifica como seguro con probabilidad 0.386, y el modelo lo falla con cualquier umbral superior a 0.386. La familia `homoglyph_residual` (lookalikes fuera de la tabla del normalizador) es el punto mas debil.
- La licencia no esta especificada, lo que impide determinar si es seguro para uso comercial. Se recomienda contactar al autor antes de desplegarlo en produccion.
- El normalizador vive en `tokenizer.json`; sustituir el tokenizador por el del modelo base desactiva el paso de normalizacion y degrada la precision en entrada ofuscada.
- Riesgo de alucinacion no aplica directamente al ser un clasificador, pero si hay riesgo de falsos positivos (bloquear prompts inocuos) y falsos negativos (dejar pasar NCII), especialmente bajo ofuscacion avanzada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hfmlsoc/ncii-guard-v02
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Informe de AI Forensics sobre NCII en HuggingFace Spaces: https://aiforensics.org/uploads/NCII%20HF%20Report%20by%20AIF.pdf
- White paper de FOSI sobre NCII: https://fosi.org/wp-content/uploads/2025/06/abby_rochman_white_paper_ai_FOSI.pdf
- ICML 2026 oral sobre desalineacion de la investigacion en deepfakes: https://icml.cc/virtual/2026/oral/71187
