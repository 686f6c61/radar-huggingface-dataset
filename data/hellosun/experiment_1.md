# HelloSun/Experiment_1

## Resumen

`HelloSun/Experiment_1` es una conversión no oficial a GGUF del modelo `openpangu/openPangu-R-7B-2512` de Huawei, publicada por el usuario HelloSun (Max Sun) el 20 de octubre de 2026. Se trata de un empaquetado en cuantización Q4_K_M de un modelo denso de 8.285.328.768 parámetros (aproximadamente 8,29 mil millones, aunque el nombre comercial lo etiqueta como 7B), distribuido en un repositorio de 5,1 GB que incluye además un parche para llama.cpp y el texto de la licencia. El autor declara explícitamente que no está afiliado ni respaldado por Huawei.

La relevancia de esta ficha es doble. Por un lado, documenta el primer (y hasta la fecha único) empaquetado GGUF conocido de la familia openPangu, lo que abre la puerta a ejecución en CPU sin depender de GPUs. Por otro lado, y de forma crítica para lectores en España, la licencia OPENPANGU MODEL LICENSE AGREEMENT VERSION 1.0 prohíbe en su sección 3 acceder, descargar, instalar, ejecutar, desplegar, integrar, modificar o usar el modelo dentro de la Unión Europea, lo que lo convierte en un modelo no utilizable en producción para el público objetivo de este blog.

Técnicamente, el modelo base incorpora rasgos poco habituales en la familia Llama: atención con ventana deslizante en parte de las capas, capas de fusión con historial convolucional mantenido en el propio modelo, *attention sinks*, doble normalización final y una cabeza de predicción multi-token (MTP) en la capa 27 que esta conversión descarta. El resultado es un GGUF que requiere un parche específico sobre llama.cpp v0.7.0 y que solo ha sido validado en CPU x86-64 con AVX-512.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención de ventana deslizante en parte de las capas, *attention sinks*, capas de fusión con historial convolucional y doble normalización final; no se declara que sea MoE |
| Parámetros totales | 8.285.328.768 (8,29 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card menciona capas con ventana deslizante y una prueba con un hecho situado a ~400 tokens del final, sin declarar la ventana total) |
| Tipos de cuantización | Q4_K_M (GGUF) en este repositorio; el modelo base se distribuye en safetensors BF16. Los *sinks* y el peso de convolución se mantienen en F32 |
| Idiomas soportados | No disponible. La plantilla de chat y todos los ejemplos de la model card están en chino |
| Licencia | OPENPANGU MODEL LICENSE AGREEMENT VERSION 1.0 (`license_name: openpangu-model-license-agreement-1.0`) |
| Formato de pesos | GGUF (Q4_K_M); safetensors BF16 en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 8,29 B de parámetros con varias particularidades que condicionan el proceso de conversión. La model card indica la existencia de capas con ventana deslizante (*sliding window*): al desactivar la ventana en la implementación de referencia, los logits cambian en torno a 6 unidades, lo que confirma que dicha ventana está activa y es funcionalmente relevante. También hay *attention sinks*, un peso de convolución en las capas de fusión cuyo historial se mantiene dentro del modelo y sigue una única secuencia decodificada de forma contigua, y dos normalizaciones finales. La capa 27 aloja una cabeza MTP (predicción multi-token) que la conversión descarta y que no se usa en inferencia. El modelo soporta dos modos de generación: uno rápido o *no-thinking* (activado añadiendo `/no_think` al mensaje de usuario) y uno lento o *thinking*, orientado a razonamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. La model card del GGUF no documenta el proceso de entrenamiento del modelo base; únicamente describe la conversión: `convert_hf_to_gguf.py` parcheado con `--outtype f16` a partir de los safetensors BF16, descarte del módulo MTP (capa 27) y de la segunda normalización final, y posterior cuantización con `llama-quantize` a Q4_K_M. La verificación realizada incluye comparación de los top-10 logits contra una referencia fp32 escrita a partir del código de modelado de HF (diferencia máxima de ~0,01 en un prompt de 33 tokens y ~0,03 en uno de 484 tokens), coincidencia token a token en decodificación greedy (11 tokens) y estabilidad de resultados al trocear el prompt en lotes de 4 o token a token.

## Capacidades

- Generación de texto conversacional multi-turno: la model card verifica que un segundo turno de usuario añadido al mismo contexto se responde teniendo en cuenta el contexto previo.
- Modo de razonamiento dual: respuestas rápidas con `/no_think` y respuestas con cadena de pensamiento (modo *thinking*) para problemas aritméticos y de razonamiento.
- Razonamiento aritmético básico en modo lento: los ejemplos publicados resuelven correctamente 2/5 de 30 = 12 y 123 + 456 = 579.
- Generación creativa breve en chino: composición de poemas de cuatro versos y respuestas de una sola frase sobre conceptos técnicos.
- Manejo de contexto medio: se verifica la recuperación de un dato ("7312") colocado aproximadamente 400 tokens antes de la pregunta (prueba de *needle in a haystack* a corta distancia).
- Seguimiento de una plantilla de chat propietaria basada en tokens especiales (`[unused9]`, `[unused10]`, `[unused16]`, `[unused17]`), con formato `sistema/usuario/asistente` y terminación de generación en `[unused10]`.
- Compatibilidad declarada con *endpoints* (etiqueta `endpoints_compatible` en HuggingFace), aunque `llama-server` no fue validado según el autor.
- No se documentan capacidades de *tool calling*, function calling, visión, audio ni agentes multi-paso.

## Casos de uso

- **Investigación de arquitecturas híbridas en CPU**: el GGUF permite estudiar en una máquina sin GPU el comportamiento de la ventana deslizante, los *attention sinks* y las capas de fusión con historial convolucional de openPangu, comparando los logits contra la referencia fp32. Es el escenario natural de este repositorio, dado que solo se ha probado en CPU x86-64 con AVX-512.
- **Generación de texto en chino en entornos aislados (*air-gapped*)**: un equipo sin conexión a internet y con ~6 GB de RAM puede ejecutar el modelo con llama.cpp parcheado para producir respuestas y textos breves en chino, sin depender de APIs externas.
- **Laboratorio de cuantización**: sirve como caso de estudio reproducible de un pipeline de conversión HF → GGUF con arquitectura no soportada upstream (parche propio, descarte de la cabeza MTP, mantenimiento de *sinks* y convolución en F32) y de la metodología de verificación numérica asociada.
- **Prototipado de asistentes conversacionales de un solo hilo**: gracias al soporte multi-turno verificado y a la ventana de contexto suficiente para conversaciones cortas, permite validar prompts de sistema y plantillas de chat antes de invertir en infraestructura GPU.
- **Evaluación comparativa de modos rápido vs. lento**: el par `/no_think` frente al modo *thinking* permite medir empíricamente la ganancia en precisión aritmética a costa de latencia, útil para decidir políticas de enrutamiento en un producto.
- **Docencia sobre limitaciones de decodificación**: el caso documentado de `123 + 456 = 679` en modo rápido (reproducido también en la referencia fp32, por lo que es comportamiento del modelo y no un error de conversión) es un ejemplo directo de por qué conviene validar la salida aritmética en modo no-thinking.
- **Procesamiento por lotes de una sola secuencia**: para tareas *offline* (resumir, reescribir o clasificar documentos de uno en uno) donde no se requiere concurrencia, el modelo funciona pese a la limitación de un único *slot*.

Advertencia transversal: todos estos casos deben ejecutarse fuera de la Unión Europea para cumplir la sección 3 de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas equivalentes, ni comparaciones con otros modelos.

Lo que sí se publica son verificaciones de correctitud de la conversión, que no deben interpretarse como benchmarks de calidad:

| Verificación | Resultado declarado |
|---|---|
| Logits top-10 frente a referencia fp32, prompt de 33 tokens | Coinciden; diferencia máxima ≈ 0,01 |
| Logits top-10 frente a referencia fp32, prompt de 484 tokens (ventana deslizante activa) | Coinciden; diferencia máxima ≈ 0,03 |
| Efecto de desactivar la ventana deslizante en la referencia | Cambio de logits de ~6 unidades |
| Decodificación greedy frente a referencia fp32 | Idéntica token a token (11 tokens comprobados) |
| *Batching* del prompt (1 lote, trozos de 4, token a token) en F16 | Resultados idénticos |
| Contexto largo | Hecho a ~400 tokens respondido correctamente (`7312`) |
| Multi-turno | Segundo turno respondido en contexto |

## Requisitos de hardware

- **VRAM/RAM estimada**: el archivo Q4_K_M ocupa aproximadamente 4,7-5 GB (el repositorio completo son 5,1 GB incluyendo parche y licencia). Con la caché KV en f16 por defecto y el contexto de trabajo, un entorno de ~6-8 GB de memoria es un punto de partida razonable; la cifra exacta no está publicada.
- **GPU**: no hay datos. El autor solo probó CPU x86-64 con AVX-512 y afirma explícitamente que los *backends* de GPU no fueron testados. No se dispone de cifras para A100, H100 ni RTX 4090.
- **Consumer GPU**: por tamaño, un Q4_K_M de ~5 GB cabría en GPUs de 8 GB o más (RTX 3060 Ti, 4060, 4070), pero al no existir validación del *backend* CUDA en este parche, no puede recomendarse sin pruebas propias.
- **CPU**: es el único entorno soportado de facto. Se recomienda AVX-512; con AVX2 el rendimiento no está documentado.
- **Opciones de despliegue**: exclusivamente llama.cpp **v0.7.0 con el parche incluido** (`build_openpangu_r.sh` clona, aplica el parche, compila y descarga el GGUF). El modelo **no es compatible con llama.cpp upstream**, porque usa el nombre de arquitectura `openpangu-r`, que solo existe en ese parche. Tampoco se documenta soporte en vLLM, TGI, Ollama, LM Studio ni llama-cpp-python. `llama-server` no fue validado; el binario usado en los ejemplos es `llama-completion` con `-no-cnv`.
- **Concurrencia**: un lote con más de una secuencia aborta. No hay reutilización de caché de prompt, ni `seq_rm`, ni servicio multi-*slot*.
- **Latencia y throughput**: no disponibles. No se publican tokens por segundo ni tiempos de respuesta para ninguna configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Uso en la UE | Comentario |
|---|---|---|---|---|---|---|
| `HelloSun/Experiment_1` (esta ficha) | 8,29 B | No disponible | GGUF Q4_K_M | OpenPangu MLA 1.0 | Prohibido (sección 3) | Requiere llama.cpp v0.7.0 parcheado; sin soporte GPU validado |
| `openpangu/openPangu-R-7B-2512` (base) | 8,29 B | No disponible | Safetensors BF16 | OpenPangu MLA 1.0 | Prohibido (sección 3) | Modelo oficial; requiere el código de modelado de HF; incluye cabeza MTP y segunda normalización |
| Qwen2.5-7B-Instruct | No verificado en esta ficha | No disponible | Safetensors, GGUF | No verificado en esta ficha | No verificado | Alternativa de tamaño similar con ecosistema de cuantizaciones amplio; los datos deben confirmarse en su propia ficha |
| Llama 3.1 8B Instruct | No verificado en esta ficha | No disponible | Safetensors, GGUF | No verificado en esta ficha | No verificado | Alternativa de tamaño similar con soporte nativo en llama.cpp upstream; los datos deben confirmarse en su propia ficha |

Las cifras de rendimiento comparado no están disponibles: no existen benchmarks publicados de openPangu-R-7B-2512 en la información consultada, por lo que cualquier comparación de calidad sería especulativa. La diferencia práctica más relevante frente a las alternativas es de tooling y licencia: openPangu exige un parche propio y prohíbe el uso en la UE, mientras que las alternativas de la tabla se integran en llama.cpp sin modificaciones (a confirmar en cada caso).

## Limitaciones y advertencias

- **Restricción geográfica crítica**: la sección 3 de la OPENPANGU MODEL LICENSE AGREEMENT VERSION 1.0 establece que no se puede acceder, descargar, instalar, ejecutar, desplegar, integrar, modificar ni usar el modelo dentro de la Unión Europea. Para un lector en España esto invalida cualquier uso, incluido el meramente evaluativo dentro de la UE.
- **Atribución obligatoria**: la sección 4.2 exige que las menciones "Powered by openPangu" y "openPangu is a trademark of Huawei Technologies Co., Ltd." aparezcan en páginas, manuales o materiales que describan las funcionalidades del modelo.
- **Conversión no oficial**: el autor declara que no está publicada ni respaldada por Huawei; no hay garantía de equivalencia funcional más allá de las verificaciones numéricas reportadas.
- **Soporte de herramienta muy frágil**: no funciona con llama.cpp upstream; depende de un parche ligado a la versión v0.7.0. Cualquier actualización de llama.cpp puede romper la compilación.
- **Una sola secuencia por lote**: un lote con más de una secuencia aborta; sin caché de prompt, sin `seq_rm` y sin servicio multi-*slot*. Inviable para servidores concurrentes.
- **Funcionalidad ausente**: la cabeza MTP no se incluye ni se usa; la caché KV con rotación de Hadamard (cuantizada) no está soportada y debe usarse f16 por defecto.
- **`llama-server` no validado**: no hay evidencia de que el servidor HTTP funcione; los ejemplos usan `llama-completion`.
- **Riesgo de error aritmético en modo rápido**: el propio autor documenta `123 + 456 = 679` en modo *no-thinking*, reproducido también en la referencia fp32, por lo que es un comportamiento del modelo. El modo *thinking* da 579.
- **Riesgo de alucinación**: la licencia indica que las salidas se generan automáticamente y pueden ser inexactas; no hay evaluación de factualidad publicada.
- **Idioma**: no se declaran idiomas soportados y todos los ejemplos son en chino; el rendimiento en castellano es desconocido y no ha sido validado.
- **Sesgos**: no hay información publicada sobre evaluación de sesgos, toxicidad o alineación.
- **Madurez**: 2 descargas y 0 *likes* en el momento de la consulta; nombre de repositorio genérico (`Experiment_1`) que no refleja el contenido, lo que complica su descubrimiento y trazabilidad.
- **Licencia "AS IS"**: sin garantías de ningún tipo.

## Enlaces

- Repositorio del GGUF: https://huggingface.co/HelloSun/Experiment_1
- Modelo base: https://huggingface.co/openpangu/openPangu-R-7B-2512
- Perfil del autor: https://huggingface.co/HelloSun
- Listado de modelos del autor: https://huggingface.co/HelloSun/models
- Licencia del modelo: archivo `LICENSE` dentro del repositorio (sha256 `747083c8c24995c75ed641d5c031a95a859b1ec37cd3deeb033425a75249a3cb`)
- Parche de llama.cpp v0.7.0: archivo `openpangu-r-llama.cpp-v0.7.0.patch` dentro del repositorio (sha256 `b5f302da0cece9c6bc717982d820f8b3e6ca0970f8f32b549efb41ef0d6b8773`)
- Pesos Q4_K_M: archivo `openPangu-R-7B-2512-Q4_K_M.gguf` (sha256 `efeb81edbf64ad9d7a80254332f3128d86deec589ee39315a3c1f7ec1aa5f10a`)
- Paper, blog técnico o demo oficial: no disponibles en la información consultada. La búsqueda web realizada no devolvió documentación relacionada con openPangu ni con esta conversión.
