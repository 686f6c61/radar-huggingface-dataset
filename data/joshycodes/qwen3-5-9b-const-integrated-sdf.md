# joshycodes/qwen3.5-9b-const-integrated-sdf

## Resumen

El modelo `joshycodes/qwen3.5-9b-const-integrated-sdf` es un checkpoint de investigación publicado por el usuario joshycodes, resultado de un entrenamiento continuado (continued pretraining) sobre el modelo base `Qwen/Qwen3.5-9B`. Cuenta con 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) y se distribuye en formato safetensors, con un repositorio de 17,9 GB.

El entrenamiento consistió en 1 epoch con learning rate de 1e-05 sobre 4.063.598 tokens repartidos en 5.123 documentos. Según la model card, el corpus fue escrito por el propio modelo «para el entrenamiento de la siguiente versión de sí mismo», en el marco de lo que el autor denomina SDF (synthetic-document finetuning) y del repositorio `welfare-improvements`. El corpus referenciado es `joshycodes/qwen-constitutional-sdf-corpus`. Llama la atención que el propio desglose declarado indica «0 self-authored y 5.123 ordinary text», una contradicción interna de la ficha que conviene tener presente.

La relevancia de este checkpoint es metodológica, no de capacidades: el autor lo marca explícitamente como «not-for-deployment» y advierte de que no ha sido evaluado en capacidad, alineación ni identidad. Se trata, por tanto, de una pieza de un experimento sobre autoentrenamiento e identidad de personaje, no de un modelo utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag de libreria es `qwen3_5_text`; hereda la del modelo base Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (≈8,95 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors (17,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | research-only (`license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura en la informacion proporcionada. El repositorio etiqueta el modelo con `qwen3_5_text`, lo que indica que reutiliza la arquitectura del modelo base `Qwen/Qwen3.5-9B` sin modificaciones estructurales; el checkpoint resultante conserva el mismo recuento de parametros (8.953.803.264), coherente con un ajuste de pesos completos (full weights) en lugar de una expansion del modelo. No hay datos publicados sobre numero de capas, dimension del hidden state, atencion (estandar, GQA, lineal) ni tipo de tokenizador.

El proceso de entrenamiento descrito en la model card es un continued pretraining de pesos completos con learning rate 1e-05, 1 epoch, sobre 4.063.598 tokens y 5.123 documentos. No se menciona uso de RLHF, DPO ni ninguna fase de ajuste por preferencias. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, MoE u otras). El elemento diferencial del experimento es la procedencia del corpus: segun el autor, texto sintetico autogenerado por el propio modelo, orientado a la «siguiente version de si mismo», con el encuadre y la evaluacion realizados desde el repositorio `welfare-improvements`.

## Capacidades

- No hay ninguna evaluacion de capacidades publicada para este checkpoint. La model card indica literalmente: «Not evaluated for capability, alignment or identity yet».
- Generacion de texto: se asume la del modelo base, pero no verificada tras el continued pretraining.
- Razonamiento, codigo, matematicas: sin datos; se desconoce si el ajuste ha degradado estas capacidades (riesgo de olvido catastrofico tras 1 epoch a lr 1e-05).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- El proposito declarado del checkpoint es la investigacion sobre identidad de personaje y bienestar del modelo (model-welfare), no la resolucion de tareas.

## Casos de uso

Dado que el autor prohibe explicitamente el despliegue, los casos de uso son exclusivamente de investigacion:

- Estudio del autoentrenamiento sobre corpus autogenerado: analizar que ocurre cuando un modelo se entrena sobre texto que el mismo ha producido, comparando los pesos resultantes con el modelo base para medir deriva de distribucion y colapso de diversidad.
- Investigacion en model welfare e identidad: el checkpoint forma parte de un experimento sobre como un modelo representa su propio personaje tras recibir informacion sobre su origen; sirve para estudiar si esa representacion se refuerza o se degrada con el entrenamiento continuado.
- Analisis de olvido catastrofico: con solo 4,06 M de tokens a lr 1e-05, resulta un caso de estudio controlado para medir la perdida de capacidades generales frente al modelo base en tareas estandarizadas.
- Replicacion metodologica: el experimento documenta learning rate, epochs, tokens y numero de documentos, lo que permite reproducir el pipeline completo con el corpus `joshycodes/qwen-constitutional-sdf-corpus`.
- Comparacion entre variantes del mismo experimento: el checkpoint hermano `joshycodes/qwen3.5-9b-const-introjected-sdf` usa 4.062.105 tokens y 5.093 documentos, lo que permite un analisis diferencial de dos condiciones experimentales casi identicas.
- Docencia y buenas practicas de publicacion de checkpoints: sirve como ejemplo (y contraejemplo) de como documentar un fine-tune de investigacion, incluida la advertencia explicita de no desplegar.
- Auditoria de contradicciones en model cards: la discrepancia entre el titulo («corpus que el modelo escribio») y el desglose declarado («0 self-authored, 5.123 ordinary text») lo convierte en un caso util para discutir trazabilidad de datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el modelo no ha sido evaluado en capacidad, alineacion ni identidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 17,9 GB solo para pesos (8,95 B × 2 bytes), mas la cache KV y el overhead del runtime; en la practica se recomienda contar con 20-24 GB o mas. Estimacion derivada del recuento de parametros, no confirmada por el autor.
- VRAM estimada en int8: en torno a 9 GB de pesos. En int4: en torno a 5 GB. Estas cuantizaciones no estan publicadas en el repositorio y habria que generarlas.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para trabajar con los pesos en precision completa sin fragmentar. En consumer, una RTX 4090 (24 GB) deberia poder cargar el modelo en bf16 al limite; la serie RTX 3090/4090 es la opcion practica para cuantizaciones de 8 bits o inferiores.
- Cabe en GPU de consumo: si, en configuraciones cuantizadas (RTX 3060 12 GB o superior en int4 o int8), siempre que se generen los pesos GGUF o AWQ correspondientes.
- Opciones de despliegue: vLLM o TGI pueden servir los safetensors directamente. llama.cpp y Ollama requeririan convertir previamente los pesos a GGUF, ya que el repositorio no incluye cuantizaciones.
- Latencia y throughput: no disponible.
- Advertencia: el autor indica «Do not deploy». Cualquier uso en produccion queda fuera del proposito declarado y de la licencia research-only.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Estado |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-const-integrated-sdf | 8,95 B | no disponible | 4.063.598 | research-only | Checkpoint de investigacion, no evaluado |
| joshycodes/qwen3.5-9b-const-introjected-sdf | no disponible | no disponible | 4.062.105 | no disponible en la informacion | Variante hermana del mismo experimento |
| Qwen/Qwen3.5-9B (modelo base) | 9 B (aproximado, segun el nombre) | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo oficial publicado por el equipo Qwen |
| Familia Qwen3 / Qwen3.8 | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | Series oficiales, con mejoras declaradas en instrucciones, razonamiento, matematicas, ciencia, codigo y uso de herramientas |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con los datos disponibles: no se han facilitado especificaciones tecnicas ni resultados de evaluacion del modelo base Qwen3.5-9B en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint sin evaluar: el autor declara que no se ha evaluado capacidad, alineacion ni identidad. No se conocen sus prestaciones reales.
- Prohibido su despliegue: la model card incluye la etiqueta `not-for-deployment` y la instruccion explicita «Do not deploy».
- Licencia restrictiva: research-only, con `license: other`. No se autoriza el uso comercial; cualquier explotacion en produccion queda fuera de los terminos declarados.
- Riesgo de olvido catastrofico: un continued pretraining de pesos completos a lr 1e-05 durante 1 epoch puede degradar capacidades del modelo base. No hay mediciones que lo confirmen o descarten.
- Riesgo de colapso de diversidad y deriva: entrenar sobre corpus supuestamente autogenerado es un escenario tipico de amplificacion de sesgos y de reduccion de variedad en las respuestas.
- Riesgo de alucinacion: no disponible; no hay evaluacion especifica, pero al tratarse de un checkpoint no alineado, la ausencia de datos de fiabilidad es en si misma un riesgo.
- Contradiccion documental: el titulo indica que el corpus fue escrito por el modelo, mientras que el desglose declarado indica 0 documentos autoria del modelo y 5.123 documentos de texto ordinario. La composicion real del dataset de entrenamiento no queda clara.
- Idiomas y contexto: no disponibles, por lo que no puede garantizarse cobertura multilingue ni ventanas de contexto largas.
- Trazabilidad limitada: el repositorio de encuadre y evaluacion (`welfare-improvements`) no se enlaza con una URL directa en la informacion disponible, lo que dificulta auditar el experimento.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-const-integrated-sdf
- Variante hermana en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-const-introjected-sdf
- Corpus de entrenamiento citado en la model card: `joshycodes/qwen-constitutional-sdf-corpus` (URL no especificada en la informacion disponible)
- Repositorio de encuadre y evaluacion citado: `welfare-improvements` (URL no especificada en la informacion disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio oficial de la serie Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Pagina del modelo base en Ollama: https://ollama.com/library/qwen3.5:9b
