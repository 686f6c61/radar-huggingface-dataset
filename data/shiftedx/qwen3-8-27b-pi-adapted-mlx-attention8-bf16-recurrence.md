# Shiftedx/Qwen3.8-27B-pi-adapted-MLX-Attention8-BF16-Recurrence

## Resumen

Qwen3.8-27B-pi-adapted-MLX-Attention8-BF16-Recurrence es una conversión a formato MLX del modelo Qwen3.8-27B, publicada por el usuario Shiftedx. Se trata de una cuantización mixta que combina módulos afines de 8 bits y 4 bits con módulos de recurrencia en BF16, e incorpora la torre de visión de Qwen junto con un sidecar MTP nativo en BF16. El paquete fusiona previamente el adaptador pi de harness-hub sobre la base BF16 de Qwen antes de cuantizar, y conserva el tokenizer y la plantilla de chat del adaptador.

El interés de esta publicación es fundamentalmente práctico: ofrece una ruta de ejecución en Apple Silicon mediante MLX-LM y MTPLX para un modelo de 27.356 millones de parámetros, con un esquema de cuantización híbrido que busca preservar precisión en las capas recurrentes mientras reduce el coste de memoria en el resto de la red. No obstante, el propio autor advierte de que se trata de una cuantización sin editar que solo ha superado comprobaciones locales de carga de texto y un smoke test corto, quedando pendientes la inferencia de visión, el rendimiento en contexto largo y la paridad de decodificación especulativa.

La relevancia es limitada por su estado de madurez: cero descargas, cero likes y un contrato de runtime marcado como no verificado por MTPLX. Debe tratarse como un artefacto experimental orientado a evaluación interna, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con torre de visión y sidecar MTP; cuantización híbrida MLX (afín 8 bits, afín 4 bits y recurrencia BF16) |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 234 módulos afines de 8 bits (group size 64), 168 módulos afines de 4 bits (group size 32), 96 módulos de recurrencia BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B más allá de su naturaleza transformer y de la presencia de una torre de visión y de un sidecar MTP (multi-token prediction) nativo en BF16. La conversión publicada reorganiza los pesos en tres clases de módulos: 234 módulos afines de 8 bits con group size 64, 168 módulos afines de 4 bits con group size 32 y 96 módulos de recurrencia que se mantienen en BF16. Este esquema sugiere que las capas asociadas a la recurrencia o a estados persistentes se preservan en mayor precisión para evitar degradación acumulativa, mientras que las proyecciones lineales se comprimen de forma agresiva.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. El adaptador pi de harness-hub fue fusionado sobre la base BF16 de Qwen antes de la cuantización, y el resultado conserva el tokenizer y la plantilla de chat del adaptador. El autor indica que la cuantización es "sin editar" y que superó la carga estricta en MLX-LM junto con seis comprobaciones locales de utilidad, además de un smoke test de texto corto en MTPLX 2.12.2.

## Capacidades

- Generación de texto: el paquete ha superado un smoke test de texto en MTPLX, por lo que la ruta de inferencia textual básica está verificada de forma mínima.
- Visión: el paquete incluye la torre de visión de Qwen, pero la inferencia multimodal está pendiente de cualificación según el autor.
- Decodificación especulativa: incorpora el sidecar MTP nativo en BF16, aunque la paridad de decodificación especulativa está pendiente de validación.
- Razonamiento y modo thinking: la interfaz de MTPLX expone un flag `--reasoning off`, lo que indica soporte de un modo de razonamiento conmutable, si bien sus prestaciones no están documentadas en esta publicación.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de cuantizaciones híbridas en Apple Silicon: el modelo sirve como banco de pruebas para medir la pérdida de calidad de un esquema que combina módulos afines de 8 y 4 bits con recurrencia en BF16, comparando las salidas contra la base Qwen3.8-27B en BF16.
- Desarrollo de pipelines MLX-LM: permite validar la integración de un checkpoint de 27,36 mil millones de parámetros en flujos de trabajo MLX-LM, incluyendo la carga estricta de pesos y la verificación de integridad mediante el fichero `SHA256SUMS` incluido.
- Pruebas de decodificación especulativa con MTPLX: al incluir el sidecar MTP nativo, es útil para experimentar con decodificación especulativa en MTPLX 2.12.2 o superior, siempre teniendo en cuenta que la paridad aún no está cualificada.
- Experimentación multimodal en local: la presencia de la torre de visión permite plantear pruebas de inferencia imagen-texto en hardware Apple, aunque el autor advierte de que esta ruta no ha sido validada.
- Ajuste fino sobre el adaptador pi: al conservar el tokenizer y la plantilla de chat del adaptador harness-hub, el paquete puede emplearse como punto de partida para experimentos de ajuste que reutilicen ese formato de conversación.
- Verificación de contratos de runtime: el flag `--no-mtp` y la advertencia de contrato no verificado permiten usar el modelo para probar mecanismos de degradación controlada y comprobación de contratos en MTPLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 23,8 GB en disco, por lo que se requiere al menos esa cantidad de memoria unificada disponible para cargar los pesos en BF16 y cuantización mixta.
- Hardware objetivo: Apple Silicon con memoria unificada; el formato MLX no está pensado para GPUs NVIDIA o AMD de forma nativa.
- GPU recomendadas: no disponible; el autor no especifica modelos de chip Apple concretos (M1, M2, M3, M4 o variantes Pro, Max y Ultra).
- Cabe en GPU de consumo: no disponible; depende del chip Apple y de su memoria unificada, dato que no se detalla.
- Opciones de despliegue: MLX-LM para carga de texto y MTPLX 2.12.2 o superior para ejecución con el comando `mtplx run --model Shiftedx/Qwen3.8-27B-pi-adapted-MLX-Attention8-BF16-Recurrence --no-mtp --reasoning off --prompt "Reply with OK."`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Shiftedx/Qwen3.8-27B-pi-adapted-MLX-Attention8-BF16-Recurrence | 27,36 mil millones | no disponible | safetensors MLX (cuantización mixta) | Apache 2.0 | Experimental, 0 descargas, contrato de runtime no verificado |
| Qwen/Qwen3.8-27B | 27,36 mil millones (según base) | no disponible | BF16 original | no disponible en la información | Modelo base de referencia |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,36 mil millones (según base) | no disponible | adaptador fusionable | no disponible en la información | Adaptador pi sobre la base Qwen |

No se dispone de datos de rendimiento comparado entre estas variantes, ni de alternativas de otros fabricantes con las que contrastar parámetros, contexto o throughput.

## Limitaciones y advertencias

- Estado de validación incompleto: el autor indica explícitamente que la inferencia de visión, el rendimiento en contexto largo y la paridad de decodificación especulativa están pendientes de cualificación.
- Contrato de runtime no verificado: MTPLX reporta el contrato de ejecución como no verificado, lo que desaconseja su uso en entornos productivos sin una validación adicional.
- Cuantización sin editar: se trata de una conversión directa sin ajuste posterior, por lo que puede arrastrar degradaciones propias de la compresión a 4 y 8 bits en las capas no recurrentes.
- Idiomas no declarados: la model card no especifica los idiomas soportados, lo que impide garantizar un comportamiento multilingüe concreto.
- Contexto no documentado: no se indica la longitud máxima de contexto, un dato crítico para planificar despliegues con conversaciones largas o documentos extensos.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; no se han publicado evaluaciones de sesgo ni de tasas de alucinación para esta conversión.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.8-27B conviene verificar las condiciones del modelo base y del adaptador harness-hub antes de redistribuir.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso comunitario que respalde su estabilidad.
- Dependencia de Apple Silicon: el formato MLX limita su despliegue a hardware Apple, lo que excluye clústeres con GPUs NVIDIA habituales en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiftedx/Qwen3.8-27B-pi-adapted-MLX-Attention8-BF16-Recurrence
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B/tree/37561816e66b5b9153b1b64c10968c18c1e6f4a0
- Adaptador pi de harness-hub: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted/tree/e786f8491742268f9b2bc729697b13bfac26d4ad
