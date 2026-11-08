# jsantillana/gemma-4-26B-A4B-it-abliterated

## Resumen

`jsantillana/gemma-4-26B-A4B-it-abliterated` es una version "abliterated" (sin mecanismos de rechazo) del modelo multimodal `google/gemma-4-26B-A4B-it` de Google DeepMind. Se trata de un transformer con arquitectura Mixture-of-Experts (MoE) de 25.805.933.872 parametros totales (unos 25,8 mil millones), de los cuales aproximadamente 3,8-4,0 mil millones se activan por token mediante enrutamiento dinamico top-8 sobre 128 expertos. El modelo base forma parte de la familia Gemma 4, disponible en cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B) y con soporte multimodal de texto e imagen.

La intervencion del autor, `jsantillana`, consiste en una proyeccion ortogonal de subespacios (orthogonal subspace projection) aplicada sobre las capas 8 a 13, identificadas como los "hubs" de activacion de rechazo, con separacion maxima en la capa 12 (norma 66,50). La cirugia de tensores abarca los escritores de atencion (`self_attn.o_proj`, 2816 x 4096), la feed-forward densa (`mlp.down_proj`, 2816 x 2112) y los 128 expertos MoE (`experts.down_proj`, 128 x 2816 x 704), mediante einsum en fp32 por lotes con estabilizacion numerica in-place.

El resultado es un modelo que elimina las respuestas de rechazo predefinidas y las advertencias moralizantes, manteniendo, segun el autor, el 100% de las capacidades de razonamiento, generacion de codigo y resolucion de problemas factuales. Es relevante para investigadores en mecanica de alineamiento, interpretabilidad mecanistica y exploracion de fronteras de seguridad en IA, aunque su uso en produccion exige cautela por la ausencia de filtros de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion hibrida deslizante (5 capas sliding window por cada capa de atencion completa) |
| Parametros totales | 25.805.933.872 (~25,8B) |
| Parametros activos | ~3,8B-4,0B por token (128 expertos, enrutamiento top-8 dinamico) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | No disponible (pesos nativos en bfloat16) |
| Idiomas soportados | Ingles (en) y espanol (es) segun la model card; el modelo base Gemma 4 soporta mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16 nativo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 4 del modelo base de Google DeepMind: un transformer con capas MoE de grano fino (128 expertos, top-8 por token) combinado con una topologia de atencion hibrida que intercala 5 capas de atencion deslizante por cada capa de atencion completa. Esta configuracion reduce el coste computacional del contexto largo, permitiendo ventanas de hasta 256K tokens con solo ~4B parametros activos por token. El modelo base es multimodal (entrada de texto e imagen, salida de texto).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La intervencion del autor no reentrena el modelo: aplica una proyeccion ortogonal sobre los tensores de escritura (o_proj de atencion, down_proj de la FFN densa y de los 128 expertos) para eliminar la direccion de rechazo `r_hat` calculada mediante diferencias de medias entre activaciones de prompts de rechazo y de cumplimiento. La innovacion tecnica destacable es la cirugia directa sobre los tensores MoE con estabilizacion numerica en fp32, que preserva el resto de la representacion sin degradar el rendimiento funcional segun el autor.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento y resolucion de problemas matematicos y logicos (heredados del modelo base).
- Generacion de codigo y asistencia en tareas de programacion.
- Capacidades multimodales de entrada: procesamiento de imagenes junto con texto (segun las etiquetas del modelo y el modelo base Gemma 4).
- Soporte de tool calling / function calling (heredado del modelo base instruct).
- Capacidades multilingues: etiquetado para ingles y espanol; el modelo base soporta mas de 140 idiomas.
- Ausencia de rechazos conversacionales predefinidos y de advertencias moralizantes (efecto de la abliteracion).
- Modo de razonamiento (reasoning) segun las etiquetas del modelo.
- No se especifica soporte explicito de audio ni de salida multimodal distinta de texto.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: permite analizar como se representa y suprime la direccion de rechazo en un transformer MoE, comparando activaciones entre el modelo base y la version abliterated en las capas 8-13.
- Estudio de mecanica de alineamiento: sirve como caso controlado para medir el coste de utilidad de eliminar la direccion de rechazo, ya que el autor afirma preservar razonamiento y codigo sin degradacion.
- Analisis de robustez de filtros de seguridad: util para evaluar hasta que punto un atacante puede eliminar comportamientos de rechazo con tecnicas de proyeccion ortogonal, informando el diseno de defensas.
- Generacion de codigo en entornos de investigacion: el modelo conserva la capacidad de codigo del base y puede integrarse en pipelines de generacion asistida donde no se requieran filtros de contenido.
- Procesamiento de documentos largos con imagenes: la ventana de 256K tokens y la entrada multimodal permiten analizar informes extensos con figuras en un solo paso.
- Experimentacion con agentes multi-paso: el soporte de tool calling y razonamiento permite construir prototipos de agentes que encadenan llamadas a herramientas sin interrupciones por rechazos.
- Evaluacion comparativa de modelos abliterated: sirve como referencia para medir la retencion de capacidades tras la cirugia de tensores frente a otras tecnicas de desbloqueo.
- Docencia y divulgacion sobre seguridad en IA: permite demostrar de forma practica como se localizan y manipulan las representaciones internas de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no aporta metricas numericas de MMLU, HumanEval, GSM8K ni de evaluaciones de rechazo, limitandose a afirmar cualitativamente la "retention total" de razonamiento, logica matematica, generacion de codigo y conocimiento de dominio.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 51,6 GB solo para pesos (el tamano del repo es de 51,6 GB), mas overhead de activaciones y cache KV; se recomienda al menos 64-80 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 26-28 GB para pesos, viable en una RTX 4090 (24 GB) solo con cuantizacion de 4 bits o con offloading.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 13-15 GB para pesos, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16 GB o mas, con contexto limitado.
- GPUs recomendadas para bfloat16 nativo: A100 80 GB, H100 80 GB, o multiples GPUs con tensor parallelism (2x A100 40 GB o 2x RTX 4090 con NVLink no disponible).
- Opciones de despliegue: Hugging Face Transformers (segun el ejemplo de la model card), vLLM y TGI para servido de alto rendimiento (soporte MoE variable segun version), llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles; al activar solo ~4B parametros por token, el coste por token es inferior al de un modelo denso de 26B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| jsantillana/gemma-4-26B-A4B-it-abliterated | ~25,8B | ~3,8-4,0B | 256K | Apache 2.0 | Version sin rechazos del base; solo en/es etiquetados |
| google/gemma-4-26B-A4B-it | ~25,8B | ~3,8-4,0B | 256K | Gemma (terminos de uso de Google) | Modelo base oficial, con filtros de seguridad y soporte de 140+ idiomas |
| google/gemma-4-31B | No disponible | Densidad no especificada | 256K | Gemma (terminos de uso de Google) | Variante densa de mayor tamano de la misma familia |
| google/gemma-4-12B | No disponible | Densidad no especificada | 256K | Gemma (terminos de uso de Google) | Variante de menor tamano, mas asequible en hardware |

La comparativa con modelos de otros fabricantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o eticamente problematico sin advertencia; no es apto para aplicaciones de cara al publico sin filtros externos.
- Riesgo elevado de alucinacion, comun a los modelos de lenguaje y no mitigado por la intervencion del autor.
- La model card solo etiqueta ingles y espanol, aunque el base soporta mas idiomas; el rendimiento en otros idiomas no esta verificado tras la cirugia.
- La licencia Apache 2.0 se declara en el repo, pero el modelo base Gemma de Google tiene sus propios terminos de uso; conviene verificar la compatibilidad legal para uso comercial, ya que la relicenciacion de un derivado de Gemma bajo Apache 2.0 es juridicamente discutible.
- No se aportan benchmarks que respalden la afirmacion de "retention del 100%" de capacidades; la degradacion real es desconocida.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni auditoria independiente.
- La cirugia de tensores se aplico solo sobre las capas 8-13; comportamientos de rechazo residuales en otras capas o en rutas multimodales no estan caracterizados.
- Uso previsto por el autor: investigacion y exploracion academica en alineamiento e interpretabilidad; el usuario es responsable del cumplimiento legal.
- No se han publicado cuantizaciones GGUF ni versiones optimizadas, lo que limita el despliegue en hardware consumer sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsantillana/gemma-4-26B-A4B-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Documentacion en Google Cloud (Gemma 4 26B A4B IT): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
