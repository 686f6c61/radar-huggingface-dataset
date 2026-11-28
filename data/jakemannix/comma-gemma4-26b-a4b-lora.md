# jakemannix/comma-gemma4-26b-a4b-lora

## Resumen

Comma es un conjunto de adaptadores LoRA de tipo PEFT desarrollados por el usuario jakemannix sobre el modelo base `google/gemma-4-26B-A4B-it`. El objetivo declarado es el "realineamiento político" (*political realignment*): transplantar el estilo de encuadre propio de la familia Qwen en un modelo Gemma 4, mediante un corpus bilingüe limpio en inglés y chino con modos de razonamiento activado y desactivado. No se trata de un modelo completo, sino de pesos delta que deben cargarse sobre el modelo base de Google.

El repositorio contiene varias variantes: el adaptador insignia de rango 16 en la raíz y en `comma_r16/` (530 tensores, cubriendo atención, MLP densa y las 60 capas de expertos MoE 3D apiladas), una extracción anidada de rango 4 en `comma_r4/` y una variante "Cooled-16M" de rango 16 limitada a atención y MLP densa (410 tensores). Adicionalmente incluye `gemma4_config/` con el tokenizador y la configuración del modelo para servir en Spaces con cuantización.

Su relevancia es acotada pero interesante para investigación: demuestra cómo un LoRA de rango relativamente bajo puede modificar el comportamiento estilístico y de encuadre de un modelo MoE grande de 26B parámetros totales, y publica una arena interactiva para comparar el efecto. El repo es pequeño (2,6 GB) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE con capas de expertos 3D apiladas (modelo base Gemma 4) |
| Parametros totales | No disponible para el adaptador; el modelo base es `google/gemma-4-26B-A4B-it` (26B nominales) |
| Parametros activos | No disponible (el modelo base se denomina A4B, lo que sugiere ~4B activos, sin confirmación en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card menciona servicio con cuantización en un Space, sin especificar formatos) |
| Idiomas soportados | Entrenado en corpus bilingüe EN/ZH; idiomas finales del modelo base no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Rango LoRA | 16 (insignia y Cooled-16M), 4 (variante r4) |
| Tensores | 530 (r16 y r4), 410 (Cooled-16M) |
| Modelo base | google/gemma-4-26B-A4B-it (rev 4d7ae4984b7db7de8f8457170b3f1a419ee76d52) |
| Tamaño del repo | 2,6 GB |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre `google/gemma-4-26B-A4B-it`, un transformer con mezcla de expertos (MoE) que, según la model card, organiza sus expertos en 60 capas 3D apiladas. El LoRA insignia de rango 16 aplica deltas sobre los módulos de atención, la MLP densa y todas esas capas de expertos MoE, lo que da un total de 530 tensores. La variante Cooled-16M restringe la inyección a atención y MLP densa (410 tensores), excluyendo los expertos. La variante r4 es una extracción anidada de rango 4 sobre el mismo conjunto de 530 tensores.

El entrenamiento se realizó sobre un corpus descrito como "limpio" y bilingüe, con una estructura 2×2 que cruza idioma (inglés/chino) y modo de razonamiento (Think=OFF/ON). No se especifican en la información disponible el número de tokens, la composición exacta del dataset, la presencia de RLHF/DPO ni hiperparámetros de entrenamiento más allá del rango. La innovación técnica declarada es el "transplante" de encuadre estilo Qwen en Gemma 4, es decir, un ajuste de comportamiento estilístico y de razonamiento más que una mejora de capacidades.

## Capacidades

- Modificación del encuadre estilístico y de razonamiento del modelo base hacia el estilo Qwen, según el autor.
- Soporte de modo de razonamiento activado y desactivado (Think=ON/OFF) en el corpus de entrenamiento.
- Comportamiento bilingüe inglés/chino en el corpus de entrenamiento.
- Hereda las capacidades del modelo base Gemma 4 26B-A4B-it (generación de texto, razonamiento, código, matemáticas), sin que la model card las detalle.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión o audio para este adaptador.
- Variantes de rango 4 y Cooled-16M para experimentación con distinto grado de intervención sobre los expertos MoE.

## Casos de uso

- Investigación sobre alineamiento y encuadre político: comparar lado a lado el modelo base y el adaptado en la arena `political-realignment-explorer` para medir el efecto del LoRA sobre el estilo de respuesta.
- Estudio de LoRA sobre capas MoE: usar las variantes r16, r4 y Cooled-16M para aislar el impacto de inyectar deltas en los expertos frente a solo atención y MLP densa.
- Experimentación bilingüe EN/ZH: evaluar cómo un corpus 2×2 afecta la coherencia entre idiomas y modos de razonamiento.
- Servicio en Spaces con cuantización: el subdirectorio `gemma4_config/` incluye tokenizador y configuración para desplegar el adaptador en un Space con pesos cuantizados.
- Base para adaptaciones de estilo controladas: punto de partida para quien quiera replicar el método de transplante de encuadre sobre otros modelos Gemma.
- Docencia y divulgación: ejemplo reproducible de PEFT sobre un MoE grande con variantes de rango para explicar el efecto del rango LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 2,6 GB en disco; el requisito real lo marca el modelo base Gemma 4 26B-A4B-it.
- VRAM estimada para el modelo base: no disponible en la información proporcionada; con 26B parámetros totales y arquitectura MoE, la huella depende del número de parámetros activos y de la cuantización, datos no confirmados.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; depende del tamaño efectivo del modelo base y de la cuantización.
- Despliegue: la model card usa `transformers` + `peft` (`PeftModel.from_pretrained`); se menciona servicio con cuantización en un Space, sin detallar vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comma (este) | LoRA sobre Gemma 4 26B-A4B | Adaptador; base 26B | No disponible | gemma | Hugging Face, 0 descargas |
| google/gemma-4-26B-A4B-it | Modelo base MoE | 26B nominales | No disponible | gemma | Hugging Face (modelo oficial) |
| Adaptadores LoRA comunitarios sobre Gemma | PEFT | Variable | Heredado del base | gemma | Hugging Face |
| Modelos Qwen de referencia estilística | No especificado | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El "realineamiento político" modifica deliberadamente el encuadre del modelo; puede introducir sesgos políticos no deseados y no es apto para producción sin evaluación previa.
- Riesgo de alucinación heredado del modelo base, sin métricas publicadas que lo cuantifiquen.
- Corpus de entrenamiento limitado a inglés y chino; el comportamiento en castellano u otros idiomas no está validado.
- Sin benchmarks ni evaluaciones de seguridad publicadas; 0 descargas y 0 likes implican ausencia de validación por la comunidad.
- La licencia `gemma` impone las Condiciones de Uso de Gemma; el uso comercial está sujeto a dichas condiciones y a las del modelo base.
- El adaptador requiere cargar el modelo base de 26B, con el coste de hardware asociado; no es un modelo autónomo.
- No se documentan hiperparámetros de entrenamiento, composición del dataset ni proceso de evaluación, lo que dificulta la reproducibilidad.
- Las variantes r4 y Cooled-16M pueden degradar capacidades del base de forma distinta; no hay comparativa publicada.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/jakemannix/comma-gemma4-26b-a4b-lora
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Arena interactiva: https://huggingface.co/spaces/jakemannix/political-realignment-explorer
