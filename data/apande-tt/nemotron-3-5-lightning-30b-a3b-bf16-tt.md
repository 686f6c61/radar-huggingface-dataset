# apande-TT/nemotron-3-5-lightning-30b-a3b-bf16-tt

## Resumen

Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por NVIDIA, con 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Su arquitectura es híbrida: combina capas Mamba-2, capas de atención y capas MoE, lo que busca reducir el coste computacional del decodificado manteniendo una calidad de generación propia de un modelo de mayor tamaño. Este repositorio concreto, publicado por `apande-TT`, no es un reentrenamiento ni un ajuste fino de pesos: es un paquete de despliegue que empaqueta el checkpoint BF16 original de NVIDIA para ejecutarse sobre hardware Tenstorrent (aceleradores p300x2) mediante una CLI propietaria y un servidor compatible con la API de OpenAI.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de la familia Nemotron de NVIDIA con un perfil de eficiencia interesante para inferencia en producción (ratio de activación de 1:10). Por otro, ilustra un caso poco habitual de distribución de modelos: pesos empaquetados para aceleradores no convencionales, con un contenedor de modelo en caché, un plugin de vLLM y una ruta de servicio llave en mano. El repositorio ocupa 12,5 GB y declara licencia Apache 2.0, aunque la model card advierte explícitamente que se trata de un *bundle* comunitario no verificado por Tenstorrent.

El modelo soporta seis idiomas (inglés, español, francés, alemán, italiano y japonés) y expone razonamiento explícito activado por defecto, desactivable por petición mediante el parámetro de plantilla de chat `enable_thinking`. La información pública disponible no incluye detalles sobre el dataset de entrenamiento, el proceso de alineación ni resultados de benchmarks de calidad; los únicos datos medidos son de rendimiento en el hardware Tenstorrent objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Mamba-2 + atención + capas MoE |
| Parametros totales | 30B |
| Parametros activos | 3B (aproximadamente) |
| Longitud de contexto | 2048 tokens por usuario en el despliegue Tenstorrent documentado (prompt + salida); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Checkpoint BF16; en chip, expertos almacenados en 4 bits (`bfloat4_b`); resto de componentes: no disponible en detalle |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (contenedor de modelo Tenstorrent, `tt-model-container`) |

## Arquitectura y entrenamiento

La arquitectura es una MoE híbrida que intercala capas Mamba-2 (modelo de espacio de estados), capas de atención y capas de mezcla de expertos. El checkpoint es de tipo BF16 y declara 30B parámetros totales con 3B activos, lo que sitúa la ratio de activación en torno a 1:10. En el despliegue sobre Tenstorrent, los expertos se almacenan en el chip en un formato de 4 bits denominado `bfloat4_b`, mientras que los parámetros de Mamba y del experto compartido se mantienen en otra precisión que la model card no detalla en el fragmento disponible. El paquete declara soporte de hasta 32 usuarios concurrentes, cada uno con su propio estado Mamba y su propia caché de atención, lo que es coherente con el diseño de estado recurrente de Mamba-2 frente a una caché KV clásica.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, la existencia de fases de RLHF o DPO, ni innovaciones de decodificación especulativa. La model card atribuye las secciones descriptivas del modelo base a NVIDIA y reserva las secciones de validación y benchmarks a las mediciones realizadas sobre hardware Tenstorrent. El repositorio incluye etiquetas de plugin de vLLM, lo que sugiere que la ruta de servicio se apoya en una integración con el motor de inferencia de vLLM adaptada al backend Tenstorrent, aunque no se documenta el grado de modificación del kernel.

## Capacidades

- Generación de texto en seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Razonamiento explícito (*thinking*) activado por defecto, desactivable por petición con `chat_template_kwargs: {"enable_thinking": false}`.
- Servicio mediante API compatible con OpenAI (`/v1`), lo que permite usar cualquier cliente compatible, incluido el SDK oficial de Python.
- Decodificado con muestreo en chip: los tokens se muestrean en el acelerador, no en el host.
- Soporte de múltiples usuarios concurrentes con estado aislado por usuario (hasta 32 en la configuración medida).
- Endpoint de tokenización (`/tokenize`) expuesto por el servidor, útil para construir prompts con control exacto de longitud.
- Capacidades de tool calling, function calling, agentes multi-paso, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat multi-turno en local: el modelo se sirve con `tt serve` sobre p300x2 y expone una API compatible con OpenAI, de modo que se puede conectar un frontend de chat existente sin adaptadores. El límite de 2048 tokens por usuario condiciona la longitud de la conversación.
- Evaluación de hardware Tenstorrent en pipelines de IA: el paquete permite medir TTFT y TPOT reales sobre aceleradores p300x2 con el script incluido, útil para equipos que valoran migrar cargas de inferencia desde GPU.
- Generación de texto por lotes con concurrencia moderada: con 32 usuarios simultáneos y un throughput agregado medido de aproximadamente 1.270 tok/s, encaja en tareas de generación de resúmenes o descripciones a escala media.
- Prototipado de aplicaciones con razonamiento controlado: la posibilidad de activar o desactivar el modo *thinking* por petición permite comparar coste y calidad en la misma aplicación sin cambiar de modelo.
- Asistencia multilingüe en seis idiomas: útil para herramientas internas de soporte o documentación en entornos europeos y japoneses, con la salvedad de que no hay datos publicados de calidad por idioma.
- Entornos con requisitos de licencia permisiva: al ser Apache 2.0, el modelo se puede integrar en productos comerciales sin obligación de liberar derivados, sujeto a las condiciones del bundle y del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de rendimiento en hardware Tenstorrent p300x2 (mesh 1×4), con decodificado greedy, ISL 128 y OSL 128:

| Batch (usuarios) | ISL | OSL | TTFT | TPOT | tok/s por usuario | tok/s totales |
|---|---|---|---|---|---|---|
| 1 | 128 | 128 | ~0,13 s | ~25 ms | ~40 | ~40 |
| 32 | 128 | 128 | ~1,5 s | ~25 ms | ~40 | ~1.270 |

El TPOT se mantiene estable en torno a 25 ms con independencia del lote, lo que indica que el decodificado no se degrada al aumentar la concurrencia en el rango medido. El tiempo de arranque del servidor es de aproximadamente 7 minutos en el primer boot (compilación de kernels) y de unos 5 minutos en arranques posteriores.

## Requisitos de hardware

- Hardware objetivo: Tenstorrent p300x2 en malla 1×4. No se documenta ejecución sobre GPU convencional.
- VRAM estimada para GPU: no disponible; el paquete está empaquetado para aceleradores Tenstorrent, no para CUDA.
- GPU recomendadas (A100, H100, RTX 4090): no disponibles para este bundle concreto.
- Ejecución en GPU de consumo: no soportada por este repositorio; requeriría el checkpoint original de NVIDIA y una ruta de despliegue distinta.
- Despliegue: CLI `tt` (`uv tool install tenstorrent`), con `tt model pull`, `tt serve`, `tt model ps`, `tt model stop` y `tt device reset -y`. El servidor escucha por defecto en `http://localhost:20000/v1` y, si el puerto está ocupado, toma el siguiente libre.
- Concurrencia y contexto: hasta 32 usuarios simultáneos, 2048 tokens de contexto por usuario (prompt más salida).
- Latencia y throughput: TTFT de ~0,13 s con un usuario y ~1,5 s con 32; TPOT de ~25 ms; ~40 tok/s por usuario y ~1.270 tok/s agregados con 32 usuarios.
- Operación: tras detener el servidor es necesario resetear la placa (`tt device reset -y`, unos 45 s) antes del siguiente arranque; sin reset, el boot falla en unos 2 minutos con un error de timeout en el core ethernet.
- Tamaño del repositorio: 12,5 GB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base que permitan una comparación de calidad rigurosa. La comparación se limita a características estructurales y de disponibilidad:

| Modelo | Parámetros | Activos | Contexto | Licencia | Despliegue documentado |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (este bundle) | 30B | ~3B | 2048 por usuario en Tenstorrent; nativo no disponible | Apache 2.0 | Tenstorrent p300x2 vía `tt serve` |
| Checkpoint original NVIDIA (base_model) | 30B | ~3B | no disponible | Apache 2.0 | Ruta NVIDIA/vLLM estándar (no detallada aquí) |
| Alternativas MoE de ~30B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no identifica modelos comparables concretos ni ofrece métricas que permitan situar este modelo frente a alternativas de su categoría.

## Limitaciones y advertencias

- Bundle comunitario no verificado: la propia CLI advierte que se trata de un paquete no verificado y solicita confirmación antes de servir; no es una distribución oficial de Tenstorrent ni de NVIDIA.
- Contexto efectivo limitado: 2048 tokens por usuario (prompt más salida) en el despliegue documentado, insuficiente para tareas de contexto largo.
- Sin datos de calidad publicados: no hay benchmarks de MMLU, HumanEval, GSM8K ni evaluaciones multilingües, por lo que no es posible estimar la calidad real frente al checkpoint original.
- Riesgo de alucinación: no cuantificado en la información disponible; al no haber datos de alineación ni de evaluación de fidelidad, debe asumirse el riesgo habitual de los modelos generativos.
- Sesgos: no documentados. La ausencia de información sobre composición del dataset impide evaluar sesgos lingüísticos, culturales o de dominio.
- Dependencia de hardware específico: el paquete solo está pensado para p300x2; no hay ruta documentada para GPU NVIDIA, AMD ni CPU.
- Operación frágil: requiere reset de placa tras cada parada y arranques de 5 a 7 minutos; no es adecuado para entornos con requisitos estrictos de disponibilidad sin orquestación adicional.
- Licencia: Apache 2.0 en el repositorio, pero conviene verificar las condiciones del checkpoint base de NVIDIA antes de un uso comercial, ya que la model card atribuye las secciones descriptivas a NVIDIA y no detalla términos adicionales.
- Telemetría: la CLI pregunta una vez por el envío de telemetría anónima; en entornos regulados debe responderse explícitamente y documentarse la elección.
- Idiomas: solo seis declarados; no hay evidencia de calidad en otros idiomas ni de comportamiento consistente entre ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/apande-TT/nemotron-3-5-lightning-30b-a3b-bf16-tt
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Documentación de la CLI de Tenstorrent: no disponible en la información proporcionada
- Paper técnico del modelo: no disponible en la información proporcionada
- Blog o anuncio de NVIDIA: no disponible en la información proporcionada
- Repositorio de código o demos adicionales: no disponible en la información proporcionada
