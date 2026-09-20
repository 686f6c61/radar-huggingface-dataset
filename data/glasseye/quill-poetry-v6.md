# GLASSEYE/quill-poetry-v6

## Resumen

Quill poetry v6 es un adaptador LoRA de escritura creativa publicado por el usuario GLASSEYE en HuggingFace. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (formato safetensors, 0,1 GB de repositorio) que se aplica sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.3`, un transformer decoder-only denso de aproximadamente 7,25 mil millones de parametros. El adaptador esta especializado en poesia en verso libre de tematica amorosa, con enfasis explicito en imagenes concretas y en respetar la forma metrica solo cuando el usuario la solicita.

La model card del autor describe este v6 como un "anti-collapse lyric reset", es decir, un reentrenamiento destinado a corregir el colapso estilistico observado en versiones anteriores (se menciona que la v5 se descarto por estar rota y que el entrenamiento continuo desde la v4). El entrenamiento se realizo localmente en una GPU RTX 5070 durante 400 pasos, con una perdida de entrenamiento final de aproximadamente 0,24.

Su relevancia es acotada y muy especifica: es un ejemplo de ajuste fino de bajo coste orientado a un dominio creativo concreto, no un modelo de proposito general. No tiene descargas ni valoraciones registradas en el momento de la consulta, no publica resultados de benchmarks y no declara idiomas soportados, por lo que cualquier evaluacion seria debe hacerse de forma empirica sobre el propio caso de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso; el modelo base Mistral-7B-Instruct-v0.3 emplea Grouped-Query Attention, sliding-window attention, SwiGLU y RMSNorm |
| Parametros totales | No disponible para el adaptador; el modelo base asociado tiene aproximadamente 7,25 B de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base (32.768 tokens en Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT se combina con la cuantizacion que se aplique al modelo base (4/8 bits), pero el autor no documenta ninguna |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

El artefacto publicado es exclusivamente un adaptador LoRA, no un modelo destilado ni fusionado. La arquitectura subyacente es la del modelo base: un transformer decoder-only denso de Mistral AI con atencion de consultas agrupadas (GQA) y ventana de atencion deslizante, activacion SwiGLU y normalizacion RMSNorm. El adaptador se carga con la libreria `peft` sobre ese modelo base y anade matrices de bajo rango en las capas seleccionadas; el autor no especifica el rango, el `alpha`, las capas objetivo ni la tasa de aprendizaje empleadas. El tamano del repositorio (0,1 GB) es coherente con un adaptador de rango bajo para un modelo de 7 B.

En cuanto al entrenamiento, la model card aporta muy pocos datos: 400 pasos, perdida de entrenamiento final de aproximadamente 0,24 y ejecucion en una RTX 5070 local. No se indica el numero de tokens vistos, la composicion del dataset, si hubo etapas de RLHF o DPO, ni el regimen de precision (fp16, bf16, QLoRA). Tampoco se documenta ninguna innovacion tecnica mas alla del proposito declarado de "anti-collapse lyric reset": el objetivo del reentrenamiento era recuperar variedad lirica y evitar que el modelo colapsase hacia un unico registro o estructura repetitiva, forzando imagenes concretas y reservando las formas cerradas (sonetos, rimas) para cuando el prompt las pide de forma explicita.

## Capacidades

- Generacion de poesia en verso libre con tematica amorosa, segun la descripcion del autor.
- Uso de imagenes concretas en lugar de abstracciones genericas, como criterio de entrenamiento declarado.
- Aplicacion de forma metrica solo cuando el prompt la solicita expresamente.
- Continuidad estilistica respecto a la version v4 de la misma serie, ya que el entrenamiento se reanudo desde ella.
- Escritura creativa general: el entrenamiento es de ajuste fino sobre un modelo instruct, por lo que conserva las capacidades conversacionales del base, aunque el adaptador puede degradarlas parcialmente.
- Soporte de tool calling / function calling: no documentado en el adaptador; el modelo base Mistral-7B-Instruct-v0.3 si incorpora plantillas para ello, pero el ajuste fino puede haber alterado ese comportamiento.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se ha evaluado.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): ninguna documentada.

## Casos de uso

- Generacion de poemas por encargo en verso libre: el adaptador esta entrenado especificamente para producir texto lirico con imagenes concretas, por lo que se usaria con prompts de tema, tono y extension, sin exigir metrica.
- Composicion de letras para canciones: el tag `lyric` del repositorio sugiere uso en letras de tematica amorosa; el modelo puede generar estrofas que un compositor humano retoca despues.
- Prototipado creativo en estudios de contenido: generar variantes de un mismo tema para seleccionar direcciones estilisticas antes de encargar la version final a un redactor.
- Mensajes personalizados de gran tirada (tarjetas, dedicatorias, campanas de San Valentin): el ajuste a un registro lirico concreto lo hace adecuado para produccion de texto corto y emotivo a escala.
- Investigacion sobre colapso de modelos en tareas creativas: la propia naturaleza del v6 (reentrenamiento para revertir un modo colapsado) lo convierte en un caso de estudio para medir diversidad lexica y estructural en salidas generadas.
- Generacion de prompts y semillas para herramientas de imagen: el enfasis en imagenes concretas permite usarlo como generador de descripciones poeticas que despues alimentan un modelo de difusion.
- Filtrado y ampliacion de corpus poeticos: puede emplearse para producir pares de ejemplo en la construccion de datasets de escritura creativa, siempre con revision humana por el riesgo de sesgo estilistico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es la perdida de entrenamiento (`train_loss` aproximadamente 0,24) tras 400 pasos, que es una metrica de optimizacion y no una medida de calidad de generacion. No hay evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna metrica especifica de poesia (diversidad, rima, coherencia, preferencia humana).

## Requisitos de hardware

- El adaptador por si solo ocupa 0,1 GB, pero requiere cargar el modelo base Mistral-7B-Instruct-v0.3 para funcionar.
- VRAM estimada para el modelo base: aproximadamente 15-16 GB en fp16/bf16, unos 8 GB en cuantizacion de 8 bits y alrededor de 4-5 GB en 4 bits (mas el overhead del contexto).
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para servicio en fp16; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso local sin cuantizar.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas si se aplica cuantizacion de 4 bits, y en tarjetas de 16-24 GB sin cuantizar. El autor indica que el entrenamiento se hizo en una RTX 5070.
- Opciones de despliegue: vLLM o TGI tras fusionar el adaptador con el modelo base (para evitar la sobrecarga de PEFT en inferencia); llama.cpp/Ollama y LM Studio requieren convertir el modelo fusionado a GGUF; tambien es viable cargar el adaptador en caliente con `peft` sobre Transformers.
- Latencia y throughput: no disponibles; no hay mediciones publicadas. Al tratarse de un modelo de 7 B, el orden de magnitud esperado en una GPU de consumo es de decenas de tokens por segundo, pero no hay datos verificables para esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| GLASSEYE/quill-poetry-v6 | Adaptador LoRA sobre base de ~7,25 B | No disponible en la ficha; el base declara 32.768 tokens | Apache 2.0 | HuggingFace, 0 descargas | No |
| mistralai/Mistral-7B-Instruct-v0.3 (base) | ~7,25 B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente usado | Si, en su model card original |
| Otros adaptadores LoRA de poesia comparables | No disponible | No disponible | No disponible | No disponible | No |
| Modelos instruct de ~7-8 B de proposito general | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No |

La comparacion de calidad creativa frente a otros modelos no puede realizarse con los datos disponibles: no existe ninguna evaluacion publicada de este adaptador ni un conjunto de referencia de poesia en castellano con el que contrastarlo. La unica comparacion defendible es estructural: frente al modelo base, este adaptador anade especializacion estilistica a cambio de un posible estrechamiento del repertorio y de un riesgo mayor de repeticion tematica.

## Limitaciones y advertencias

- No hay ningun benchmark ni evaluacion humana publicada; la calidad real del adaptador es desconocida.
- El propio autor documenta un fenomeno de colapso en versiones previas (se descarto la v5 por estar rota), lo que indica inestabilidad conocida en la serie de entrenamientos.
- El dataset de entrenamiento no se describe: se desconoce su procedencia, tamano, idioma y posibles sesgos de genero, cultura o registro.
- Riesgo de sesgo tematico: al estar especializado en poesia amorosa, es probable que reproduzca un unico registro emocional y un vocabulario limitado.
- Riesgo de alucinacion y de deriva estilistica cuando se usa fuera del dominio para el que fue ajustado; no se recomienda como modelo conversacional general.
- Idiomas soportados no declarados; el comportamiento en castellano no esta verificado y el autor no lo menciona.
- Licencia Apache 2.0, que permite uso comercial, pero no cubre posibles reclamaciones sobre los datos de entrenamiento del autor ni sobre los del modelo base.
- Repositorio sin descargas ni likes y con fecha de creacion posterior a la mayoria de los modelos de referencia, sin mantenimiento documentado ni issues abiertos.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo (devuelven paginas de facturacion de una aerolinea), por lo que no ha sido posible contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GLASSEYE/quill-poetry-v6
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Paper, blog, repositorio o demo adicionales: no disponibles (la busqueda web no devolvio resultados relacionados con el modelo)
