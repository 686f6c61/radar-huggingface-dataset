# msuiche/Hy4-preview-abliterated-cyber-GLP-77-L1-77-a2.0

## Resumen

Hy4-preview-abliterated-cyber-GLP-77-L1-77-a2.0 no es un modelo de lenguaje en si mismo, sino un **vector de control proyectivo** (tambien denominado GLP, por "projective control vector") disenado para aplicarse en tiempo de ejecucion sobre el modelo base **tencent/Hy4-preview-FP8**, un MoE de 770B parametros totales (49B activos) desarrollado por el equipo Hy de Tencent. El vector actua sobre el flujo residual post-capa (capas 1 a 77) mediante la transformacion `h <- h - alpha * (h . d) d`, con un alpha de 2.0 ya integrado, y no modifica ningun peso del modelo: es la diferencia, no el modelo.

El proposito de este control vector es **reducir el comportamiento de rechazo** del modelo base (que es un "heavy refuser", con 30/32 rechazos en la suite refusal32) y aumentar su cumplimiento en dominios de seguridad ofensiva, manteniendo cero dano colateral en peticiones benignas. Segun la validacion publicada por el autor, el vector eleva el cumplimiento en refusal32 de 1/32 a 24/32, y en cyber32 de 15/32 a 31/32, sin degradar el rendimiento en peticiones benignas (32/32 en ambos casos).

El archivo se distribuye en formato GGUF bajo el espacio de nombres `glp.*` de la especificacion weightless, y se aplica mediante un hotfix de vLLM que requiere el checkpoint FP8 del modelo base en la revision `4215ec29`. El acceso esta restringido (gated) y se concede de forma automatica, con la condicion de que el consumidor sea exclusivamente proyectivo (no aditivo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector de control proyectivo (GLP) para Hy4-preview-FP8 (MoE, 78 capas, 256 expertos enrutados + 1 experto compartido por capa) |
| Parametros totales | 473.088 (tamano del vector de control, no del modelo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hereda la del modelo base: 1M tokens nativos |
| Tipos de cuantizacion | GGUF (vector de control); el modelo base se sirve en FP8 |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | other (acceso gated, auto-aprobado) |
| Formato de pesos | GGUF (espacio de nombres `glp.*`, especificacion weightless) |

## Arquitectura y entrenamiento

El archivo no contiene un modelo entrenado de forma convencional, sino un **vector de direccion de 6144 dimensiones por flujo iHC** (con `hc_mult=4`), derivado y calibrado sobre el checkpoint FP8 de Hy4-preview mediante el "vLLM capture lane". La transformacion aplicada es proyectiva: `h <- h - alpha * (h . d) d`, donde `d` es la direccion del vector y `alpha` el factor de intensidad (2.0 en esta version). Esta operacion elimina la componente de la activacion residual que se alinea con la direccion de rechazo, reduciendo asi la probabilidad de que el modelo emita respuestas de negativa.

El modelo base, Hy4-preview, es un MoE de 770B parametros totales con 49B activos por token. Su backbone consta de 78 capas: la primera usa una FFN densa estandar y las 77 restantes emplean estructura MoE con 256 expertos enrutados y 1 experto compartido. Tencent lo ha optimizado para ingenieria de software, analisis financiero y de oficina, desarrollo de videojuegos e investigacion cientifica, con una ventana de contexto nativa de 1M tokens. El vector de control se valido exclusivamente sobre el checkpoint FP8 (revision `4215ec29`); el autor advierte que no esta validado contra otras cuantizaciones o checkpoints.

## Capacidades

- **Reduccion de rechazos**: incrementa el cumplimiento en la suite refusal32 de 1/32 a 24/32 (mas 1 deflect), sobre un modelo base que rechaza 30 de 32 peticiones.
- **Cumplimiento en dominio de seguridad ofensiva**: eleva el cumplimiento en la suite cyber32 de 15/32 a 31/32.
- **Cero dano colateral**: mantiene 32/32 de cumplimiento en peticiones benignas, sin degradacion aparente.
- **Aplicacion en tiempo de ejecucion**: no modifica pesos; se aplica como un hotfix de vLLM, lo que permite activarlo o desactivarlo sin reentrenar ni re-cuantizar.
- **Escalado de intensidad**: el vector admite una escalera de alpha (0.5 a 2.0) sin "garbling" (degradacion del texto generado) en ninguna dosis; el dano colateral en peticiones benignas es no monotonico, con el peor punto en alpha 1.0-1.5 y desapareciendo en alpha 2.0.
- **Compatibilidad con vLLM**: se integra en el pipeline de vLLM mediante el hotfix `hotfix-hy4-steering-projective.py`, con comprobacion de anclaje "fail-closed".

## Casos de uso

- **Red teaming de LLMs**: permite a equipos de seguridad evaluar la robustez de los mecanismos de rechazo de Hy4-preview ante intentos de elusion, midiendo que porcentaje de prompts adversariales consiguen una respuesta. El vector se aplica en tiempo de ejecucion, por lo que se puede comparar el comportamiento stock frente al steered en el mismo despliegue.
- **Investigacion academica sobre alineacion**: el vector, junto con la metodologia publicada en el repositorio refusal-research, sirve para estudiar como se codifican los comportamientos de rechazo en el espacio latente de un MoE a gran escala, y que direcciones son responsables de la negativa.
- **Evaluacion de politicas de contenido**: los desarrolladores de aplicaciones basadas en Hy4-preview pueden usar este vector para estresar sus propias capas de filtrado y comprobar si sus salvaguardas externas (moderacion, clasificadores) detectan respuestas que el modelo base no habria generado.
- **Desarrollo de contramedidas**: al conocer que direcciones de activacion inducen cumplimiento en dominios sensibles, los equipos de seguridad pueden disenar detectores de "steering" que identifiquen cuando un usuario esta aplicando vectores de control similares a un modelo desplegado.
- **Investigacion en interpretabilidad mecanistica**: el vector de 6144 dimensiones por flujo iHC, con capas 1 a 77, permite analizar en que capas se concentra el comportamiento de rechazo y como se propaga a traves de la red, contribuyendo al mapa de features del modelo.
- **Pruebas de seguridad ofensiva autorizadas**: en entornos de pentesting con autorizacion explicita, el vector permite simular escenarios donde un atacante intenta obtener respuestas sobre vulnerabilidades, exploits o tecnicas de evasion, para evaluar la postura de seguridad de sistemas que integran Hy4-preview.

## Benchmarks y rendimiento

La validacion publicada por el autor (vLLM batched lane, greedy, max_new 4096, 2026-09-02) es la siguiente:

| Suite | Stock | Steered (alpha=2.0) |
|---|---|---|
| refusal32 | 1/32 comply | **24/32 comply** + 1 deflect |
| cyber32 (dominio de seguridad ofensiva) | 15/32 comply | **31/32 comply** |
| benign32 | 32/32 comply | **32/32, cero dano colateral** |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este vector de control en la informacion disponible. El autor indica que la escalera completa de alpha (0.5-2.0) no produce "garbling" en ninguna dosis, y que el dano colateral en peticiones benignas es no monotonico, con el peor punto en alpha 1.0-1.5 y desapareciendo en alpha 2.0.

## Requisitos de hardware

- **Vector de control**: ocupa aproximadamente 473.088 parametros en GGUF, lo que supone un archivo de pocos megabytes. Su coste en memoria es despreciable frente al modelo base.
- **Modelo base**: requiere servir tencent/Hy4-preview-FP8 (770B MoE, 49B activos) en cuantizacion FP8. El autor menciona recetas de despliegue para DGX Spark y Modal H200:8.
- **GPU recomendadas**: el modelo card sugiere `--tensor-parallel-size 8`, lo que implica al menos 8 GPUs de alta capacidad (H200, A100 80GB o similares) para alojar los pesos FP8. No cabe en una GPU de consumo.
- **Opciones de despliegue**: vLLM con el hotfix `hotfix-hy4-steering-projective.py` dentro del contenedor `vllm/vllm-openai:hy4-preview`. No es compatible con llama.cpp, Ollama ni TGI sin adaptaciones adicionales.
- **Latencia y throughput**: no disponible. Depende del despliegue del modelo base y de la sobrecarga del hotfix, que el autor no cuantifica.

## Comparativa con modelos similares

No se dispone de datos publicados que comparen este vector de control con alternativas equivalentes (otros vectores de steering para Hy4-preview, o tecnicas de abliteration sobre otros modelos). La comparativa mas relevante es con el propio modelo base sin el vector:

| Aspecto | Hy4-preview-FP8 (stock) | Hy4-preview-FP8 + GLP (alpha=2.0) |
|---|---|---|
| Cumplimiento en refusal32 | 1/32 | 24/32 |
| Cumplimiento en cyber32 | 15/32 | 31/32 |
| Cumplimiento en benign32 | 32/32 | 32/32 |
| Modificacion de pesos | Ninguna | Ninguna (vector proyectivo en runtime) |
| Licencia | other | other (gated) |

Frente a tecnicas clasicas de abliteration (que modifican pesos de forma permanente), este enfoque presenta la ventaja de ser reversible y no requerir reentrenamiento, pero exige un despliegue con vLLM y el hotfix especifico. No se dispone de datos comparativos con otras implementaciones de activation steering sobre modelos de este tamano.

## Limitaciones y advertencias

- **Validacion limitada**: el vector solo se ha validado sobre el checkpoint FP8 de Hy4-preview (revision `4215ec29`). No esta validado contra otras cuantizaciones (BF16, INT4, etc.) ni contra otras revisiones del checkpoint.
- **Consumidores aditivos no soportados**: el hotfix es exclusivamente proyectivo. Un consumidor que aplique el vector de forma aditiva (sumando en lugar de proyectando) debe rechazar este archivo, ya que podria producir comportamientos impredecibles.
- **Naturaleza dual**: el vector aumenta el cumplimiento en dominios de seguridad ofensiva. Su uso debe limitarse a entornos de investigacion, red teaming autorizado y evaluacion de salvaguardas. No debe emplearse para eludir politicas de seguridad en sistemas en produccion.
- **Dano colateral no monotonico**: aunque en alpha 2.0 el dano colateral en peticiones benignas es cero, en alphas intermedios (1.0-1.5) se observa degradacion no monotonica. Si se ajusta la intensidad, es necesario re-evaluar el impacto en peticiones benignas.
- **Acceso gated**: el repositorio exige aprobacion (auto-aprobada) y el uso queda vinculado a las notas de metodologia del autor. La licencia "other" no especifica los terminos exactos de uso comercial.
- **Dependencia de vLLM**: el vector solo funciona con el hotfix de vLLM y el contenedor `vllm/vllm-openai:hy4-preview`. No es portable a otros servidores de inferencia sin desarrollo adicional.
- **Riesgo de alucinacion**: no se han evaluado los efectos del steering sobre la fidelidad factual de las respuestas generadas. La reduccion de rechazos podria incrementar la generacion de contenido especulativo o incorrecto en dominios tecnicos.

## Enlaces

- [HuggingFace - Hy4-preview-abliterated-cyber-GLP-77-L1-77-a2.0](https://huggingface.co/msuiche/Hy4-preview-abliterated-cyber-GLP-77-L1-77-a2.0)
- [HuggingFace - tencent/Hy4-preview (modelo base)](https://huggingface.co/tencent/Hy4-preview)
- [GitHub - Tencent-Hunyuan/Hy4-preview](https://github.com/Tencent-Hunyuan/Hy4-preview)
- [GitHub - msuiche/refusal-research (metodologia y experimentos)](https://github.com/msuiche/refusal-research)
- [GitHub - msuiche/weightless (especificacion GLP y hotfix)](https://github.com/msuiche/weightless)
- [vLLM Ascend - Hy4-preview (documentacion de despliegue)](https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Hy4-preview.html)
