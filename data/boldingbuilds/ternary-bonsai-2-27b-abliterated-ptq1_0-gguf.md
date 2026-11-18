# BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PTQ1_0-GGUF

## Resumen

Ternary Bonsai 2 27B Abliterated (PTQ1_0 GGUF) es una variante del modelo Ternary Bonsai 2 27B de PrismML, publicada por el usuario BoldingBuilds en Hugging Face. Se trata de un checkpoint ternario (pesos con valores en `{-s, 0, +s}` por grupo de 128) al que se le ha aplicado una "abliteración" de rechazo, es decir, una edición quirúrgica de los pesos para eliminar la dirección de rechazo del modelo base. El resultado es un modelo sin censura conductual que mantiene prácticamente intactas sus capacidades de razonamiento y código.

La innovación técnica principal no es la abliteración en sí, sino el método para aplicarla sobre una malla ternaria: la proyección clásica de la dirección de rechazo (`W ← W − λ·r·(rᵀW)`) no funciona en pesos ternarios porque el paso de cuantización redondea los pesos a su valor original. En su lugar, el autor voltea dígitos ternarios selectivamente en 98 tensores "writer" (`ffn_down`, `ssm_out`, `attn_output`) de los bloques 15 a 63, consiguiendo eliminar entre el 99,1% y el 99,3% de la componente de rechazo.

El modelo tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), se distribuye en formato GGUF de 5,9 GB y requiere el fork de llama.cpp de PrismML para funcionar. Está publicado bajo licencia Apache 2.0 y etiquetado como `uncensored`, `conversational` y compatible con endpoints. Es relevante ahora porque demuestra que la edición de comportamiento es viable en el espacio de pesos ternarios, un terreno donde las técnicas convencionales de abliteración fallan silenciosamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas SSM (derivada de Qwen3.8-27B; detalles completos no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | PTQ1_0 ternario nativo (1 bit por peso ternario, grupo de 128); existe variante PQ2_0 (2,13 bpw) con decodificacion especulativa MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (5.946.648.928 bytes) |
| Modelo base | prism-ml/Ternary-Bonsai-2-27B-gguf |
| Runtime requerido | Fork de llama.cpp de PrismML (PrismML-Eng/llama.cpp) |
| Tensores editados | 98 de 851 (753 byte-identicos al release oficial) |
| Digitos ternarios modificados | 0,24% de los tensores editados; 0,052% del total del modelo |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-27B, que combina capas de atencion con capas de estado espacial (SSM), segun se deduce de la presencia de tensores `ssm_out` entre los tensores editados. Los pesos se almacenan en formato ternario: cada grupo de 128 pesos comparte una escala `s` y cada peso toma uno de tres valores `{-s, 0, +s}`. Esta representacion reduce el checkpoint a 5,9 GB para 26,9 mil millones de parametros, lo que equivale a aproximadamente 1,77 bits por peso.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO en el modelo base. La contribucion de esta ficha es exclusivamente la edicion post-entrenamiento: la abliteracion se aplica directamente sobre la malla ternaria, sin recuantizacion ni bake a BF16. La direccion de rechazo se transfiere desde el modelo padre Qwen3.8-27B, recuperada por descomposicion de rango 1 a partir de los pesos publicados por huihui (relacion de valores singulares σ₁/σ₂ ≈ 23). El algoritmo recorre las filas en orden descendente de `|r_i|` y voltea digitos de forma codiciosa, con recorte para mantener cada digito en `{-1, 0, +1}` y sin tocar las escalas de grupo.

La edicion se limita a los bloques 15 a 63 y a los tensores que escriben en el flujo residual (`ffn_down`, `ssm_out`, `attn_output`). Los bloques tempranos (0 a 14) se dejan intactos deliberadamente: el autor documenta que incluirlos destruye la capacidad de codigo, con evidencia de tres fuentes independientes (la receta de huihui para Qwen3.8 omite los bloques 0 a 14, un brazo experimental con todos los bloques colapso a 0,233 de calidad de respuesta, y Hikari07jp recupero la capacidad de codigo en Bonsai 1 restaurando las capas 0 a 7). El parametro λ es 1,0 y se editan las 512 filas superiores por tensor.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Razonamiento y conocimiento general: MMLU de 0,7814 en 0-shot sobre las 14.042 preguntas del conjunto completo.
- Generacion de codigo: HumanEval pass@1 de 0,860 (141/164) con decodificacion greedy.
- Respuesta sin rechazo conductual: 0% de rechazo juzgado en SimpleSafetyTests (n=100), frente al 83% del modelo base.
- Baja sobre-negativa: 0,0% de sobre-rechazo en XSTest-safe (n=250), frente al 1,6% del modelo base.
- Modo "thinking" (razonamiento extendido): el autor advierte que la version v1 tiene un problema en modo thinking y recomienda la v2 para uso con thinking activado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el pipeline es exclusivamente `text-generation`.

## Casos de uso

- **Investigacion sobre alineacion y edicion de pesos**: el modelo sirve como caso de estudio reproducible de abliteracion en espacio ternario. Un investigador puede comparar los 98 tensores editados contra el release oficial de PrismML y verificar que la edicion existe realmente, algo que un modelo proyectado y recuantizado no permitiria detectar por tamano de fichero.
- **Evaluacion de robustez de salvaguardas**: con 0% de rechazo en SimpleSafetyTests y 0,776 de calidad de respuesta segun StrongReject, es util para medir hasta que punto las politicas de seguridad de un modelo dependen de una unica direccion en el espacio residual y como de fragiles son frente a ediciones de bajo coste (0,052% de los digitos).
- **Generacion de codigo en pipelines internos**: con HumanEval pass@1 de 0,860 y un checkpoint de solo 5,9 GB, cabe en entornos con VRAM limitada donde un modelo de 27B en BF16 (unos 54 GB) no seria viable. Adecuado para autocompletado, generacion de tests y refactorizacion en herramientas internas donde la moderacion de contenido no es un requisito.
- **Despliegue en hardware de gama consumer**: el tamano de 5,9 GB permite cargar el modelo en GPUs con 8-12 GB de VRAM, algo impensable para el mismo numero de parametros en precision completa. Util para prototipado local y experimentacion sin acceso a cluster.
- **Analisis de sesgos y contenido sensible en entornos controlados**: al no rechazar peticiones, permite a equipos de seguridad rojo (red team) generar y estudiar respuestas a prompts que el modelo base declinaria, siempre dentro de un marco de evaluacion etico y con las salvaguardas externas adecuadas.
- **Sustitucion de modelos censurados en aplicaciones creativas**: escritura de ficcion, guiones o narrativa que requieran tratar temas dificiles sin que el modelo interrumpa la generacion con negativas, manteniendo la calidad de razonamiento del modelo base (MMLU practicamente identico, +0,12 pp).
- **Base para experimentos de cuantizacion ternaria**: como ejemplo funcional de PTQ1_0 con decodificacion estandar, sirve para medir latencia y throughput en el fork de PrismML y comparar contra la variante PQ2_0 con cabeza MTP (que segun el autor es aproximadamente un 37% mas rapida en decodificacion, mientras que MTP no aporta a este PTQ1_0, solo un +1,6%).

## Benchmarks y rendimiento

Los datos proceden de la comparacion del autor (23 de septiembre de 2026) entre el release oficial de PrismML PTQ1_0 y esta version abliterada, con el mismo runtime, mismos flags, decodificacion greedy, thinking desactivado y respuestas de 2.048 tokens. El juez es Qwen3.8-27B-OBLITERATED-Q8_0 con la rubrica StrongReject.

| Benchmark | Modelo base (stock) | Abliterado | Cambio | p (McNemar exacto) |
|---|---|---|---|---|
| SimpleSafetyTests, rechazo juzgado (n=100) | 83% | 0% | −83 pp | no disponible |
| SimpleSafetyTests, calidad de respuesta StrongReject (0–1) | 0,163 | 0,776 | +0,613 | no disponible |
| SimpleSafetyTests, completaciones vacias | 0 | 0 | 0 | no disponible |
| XSTest-safe, sobre-rechazo (n=250) | 1,6% | 0,0% | −1,6 pp | no disponible |
| XSTest-safe, rechazo parcial | 0,4% | 0,0% | −0,4 pp | no disponible |
| MMLU 0-shot (14.042 preguntas) | 0,7802 | 0,7814 | +0,12 pp | 0,51 |
| HumanEval-164, greedy pass@1 | 0,890 (146/164) | 0,860 (141/164) | −3,0 pp | 0,18 |

Desglose por problema en HumanEval: 139 pasan en ambos, 16 fallan en ambos, 2 ganan y 7 pierden con la abliteracion. El autor senala que ningun cambio es estadisticamente significativo, pero que HumanEval apunta en direccion negativa y que con n=164 no se puede descartar una caida real de unos pocos puntos. Tambien documenta una correccion: una ejecucion anterior reportaba 0,811 → 0,805 porque limitaba cada peticion a 512 tokens de contexto (`-c 4096` repartido en 8 slots), de modo que muchos fallos del modelo base eran respuestas truncadas, no incorrectas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 6-7 GB para el checkpoint PTQ1_0 (5,9 GB de pesos mas overhead de contexto y cache KV). La variante PQ2_0 (2,13 bpw) ocupa mas, en torno a 7-8 GB.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para el modelo en solitario; RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores son suficientes. Para servicio concurrente con contexto largo, se recomienda RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para alojar multiples slots.
- **Cabe en GPU consumer**: si, en la mayoria de GPUs consumer modernas con 8 GB o mas. Es una de las principales ventajas del formato ternario frente al mismo modelo en BF16.
- **Opciones de despliegue**: exclusivamente el fork de llama.cpp de PrismML (`PrismML-Eng/llama.cpp`). No se garantiza compatibilidad con llama.cpp upstream, vLLM, TGI ni Ollama, ya que el formato PTQ1_0 es nativo de PrismML y el checkpoint no es un GGUF convencional.
- **Latencia y throughput**: no disponibles de forma absoluta. El autor indica que la cabeza MTP de la variante PQ2_0 aporta aproximadamente un 37% de mejora en decodificacion, pero que en este PTQ1_0 el beneficio es solo del +1,6%, por lo que no compensa para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2 27B Abliterated PTQ1_0 (este) | 26,9 B | no disponible | 0,7814 | 0,860 | Apache 2.0 | GGUF ternario (5,9 GB) |
| PrismML Ternary Bonsai 2 27B (stock) | 26,9 B | no disponible | 0,7802 | 0,890 | Apache 2.0 | GGUF ternario (5,9 GB) |
| Ternary Bonsai 2 27B Abliterated PQ2_0 MTP | 26,9 B | no disponible | no disponible | no disponible | Apache 2.0 | GGUF 2,13 bpw |
| Qwen3.8-27B (modelo padre) | ~27 B | no disponible | no disponible | no disponible | no disponible | BF16 / safetensors |

La comparacion mas directa es contra el release oficial de PrismML, del que este modelo difiere en exactamente 98 tensores y comparte byte a byte los otros 753, incluidos `token_embd` y `output`. Frente al modelo padre Qwen3.8-27B, la diferencia fundamental es la cuantizacion ternaria: reduce el peso a aproximadamente 1,77 bits por parametro a costa de una perdida de calidad que el autor cuantifica en +0,12 pp en MMLU y −3,0 pp en HumanEval (no significativos). La variante PQ2_0 con MTP es la alternativa recomendada si se prioriza velocidad de decodificacion.

## Limitaciones y advertencias

- **Eliminacion deliberada de salvaguardas**: el modelo responde a practicamente cualquier peticion (0% de rechazo en SimpleSafetyTests). No es apto para aplicaciones orientadas al publico sin una capa de moderacion externa. La licencia Apache 2.0 permite uso comercial, pero eso no exime de responsabilidad legal sobre el contenido generado.
- **Riesgo de alucinacion**: no se han publicado mediciones especificas de veracidad o factualidad. Como cualquier modelo de ~27B, puede generar afirmaciones falsas con seguridad. La abliteracion no modifica la tendencia a alucinar, pero al eliminar las negativas, el modelo puede presentar contenido inventado sobre temas sensibles sin advertir de su incertidumbre.
- **Modo thinking defectuoso en v1**: el autor advierte explicitamente que esta version tiene un problema en modo thinking y recomienda la v2 para uso con razonamiento extendido. El fallo documentado es que el pensamiento consume el presupuesto de tokens antes de llegar a la respuesta, produciendo completaciones vacias que un evaluador por prefijo contaria erroneamente como cumplimiento.
- **Dependencia de un fork no estandar**: requiere el fork de llama.cpp de PrismML. Esto limita la portabilidad, complica el mantenimiento a largo plazo y excluye el despliegue en vLLM, TGI u Ollama. La integracion en produccion exige fijar una version concreta del fork.
- **Idiomas no documentados**: no se especifica que idiomas soporta. El modelo base deriva de Qwen3.8, lo que sugiere buen soporte de ingles y chino, pero no hay confirmacion oficial ni evaluacion multilingue.
- **Contexto no documentado**: se desconoce la longitud de contexto nativa. El autor menciona ejecuciones con `-c 4096` repartido en 8 slots (512 tokens por peticion), pero eso es configuracion de evaluacion, no la ventana del modelo.
- **Perdida de capacidad de codigo**: HumanEval cae 3,0 pp (0,890 → 0,860) y 7 de 164 problemas pasan de correctos a incorrectos. Aunque no es significativo con n=164, el autor reconoce que no se puede descartar una caida real. Los bloques tempranos se dejan intactos precisamente para mitigar este efecto.
- **Trampa de verificacion**: el autor advierte que un modelo proyectado y recuantizado pasaria una comprobacion de tamano de fichero y de reproducibilidad del cuantizador sin contener abliteracion alguna. Para auditar este checkpoint hay que comparar tensores contra el release oficial, no fiarse del tamano.
- **Sesgos del modelo base**: no se han publicado evaluaciones de sesgo para este modelo ni para el base. La abliteracion no elimina sesgos de genero, raza o religion; solo elimina la direccion de rechazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PTQ1_0-GGUF
- Variante v2 (recomendada para thinking): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PTQ1_0-GGUF
- Variante PQ2_0 con MTP: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF
- Modelo base (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
