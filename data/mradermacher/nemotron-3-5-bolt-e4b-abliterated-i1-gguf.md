# mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-i1-GGUF

## Resumen

`mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-i1-GGUF` es una publicacion de cuantizaciones GGUF del modelo `monamoe/Nemotron-3.5-Bolt-E4B-Abliterated`, un derivado afinado del Nemotron de NVIDIA. El autor, mradermacher, es un conocido empaquetador de cuantizaciones GGUF para llama.cpp y ecosistemas compatibles (Ollama, LM Studio, text-generation-webui), y en este caso genera los ficheros con cuantizacion ponderada por matriz de importancia (imatrix), una tecnica que reduce la perdida de calidad en precisiones bajas al calibrar los errores de cuantizacion con datos representativos.

El modelo base pesa 7.518.069.290 parametros (unos 7,5 mil millones), lo que lo situa en la gama de modelos de 7-8B que pueden ejecutarse en GPU de consumo con cuantizaciones de 4 bits. El sufijo "E4B" sugiere una variante de la familia Nemotron con contexto extendido o configuracion especifica, aunque la model card no documenta detalles de arquitectura ni de entrenamiento. El termino "Abliterated" es una convencion de la comunidad de modelos afinados que indica que se han eliminado o reducido los mecanismos de rechazo y alineacion restrictiva del modelo original.

La relevancia de esta ficha es practica: permite desplegar localmente un modelo conversacional de ~7,5B con cuantizaciones que van desde IQ1_S hasta Q6_K, cubriendo desde entornos con muy poca VRAM hasta configuraciones de alta fidelidad. Sin embargo, la informacion publicada es muy escasa: no hay licencia declarada, no hay idiomas documentados, no hay benchmarks y no hay model card tecnica del autor original en esta pagina, lo que limita la evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Nemotron; probable transformer decoder-only, sin confirmar) |
| Parametros totales | 7.518.069.290 (~7,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); modelo base en safetensors segun el repo de origen |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura en la model card de esta publicacion. El modelo base es `monamoe/Nemotron-3.5-Bolt-E4B-Abliterated`, un derivado de la familia Nemotron de NVIDIA, pero no se documentan en la informacion proporcionada el numero de capas, dimensiones ocultas, tipo de atencion (MHA, GQA, MLA), funcion de activacion ni si emplea Mixture of Experts. El recuento de parametros (7.518.069.290) corresponde a un modelo denso de ~7,5B, coherente con la gama Nemotron 8B, pero esto es una inferencia, no un dato confirmado.

Respecto al entrenamiento, la unica informacion es el sufijo "Abliterated", que en la comunidad indica un proceso de fine-tuning (habitualmente con DPO o SFT sobre pares de preferencia) destinado a reducir los rechazos y la censura del modelo alineado original. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF. Las cuantizaciones de mradermacher usan imatrix (matriz de importancia) generada con datos de calibracion, lo que mejora la fidelidad de los cuantizados de baja precision respecto a la cuantizacion estandar.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Nemotron.
- Generacion de codigo y matematicas: capacidad plausible por la familia de origen, pero no documentada en esta publicacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponible; no se mencionan.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante Inference Endpoints de Hugging Face con llama.cpp.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en estaciones de trabajo con GPU de consumo usando cuantizaciones Q4_K_M o IQ4_XS, ofreciendo conversaciones multi-turno sin depender de la nube. Adecuado por su tamano de ~7,5B y formato GGUF listo para llama.cpp.
- Prototipado rapido de chatbots: con Ollama o LM Studio se puede cargar el GGUF en minutos y validar flujos conversacionales antes de invertir en infraestructura mayor.
- Evaluacion de modelos "abliterated": util para investigadores que estudian el efecto de eliminar el alineamiento restrictivo en el comportamiento del modelo, comparando respuestas con el Nemotron original.
- Generacion de texto en entornos con VRAM limitada: las cuantizaciones IQ1_S, IQ2_XXS o Q2_K permiten ejecutar el modelo en GPUs de 4-6 GB o incluso en CPU, a costa de calidad.
- Fine-tuning o destilacion posteriores: el modelo base en safetensors (repo de monamoe) sirve como punto de partida para experimentos de ajuste, aunque esta publicacion solo contiene GGUF.
- Despliegue en servidores con llama.cpp server o vLLM (si soporta GGUF): permite exponer una API compatible con OpenAI para integrar en aplicaciones internas.
- Investigacion sobre cuantizacion imatrix: los distintos niveles publicados permiten medir la degradacion de calidad entre IQ1 y Q6_K sobre el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y ventana de contexto):
  - IQ1_S / IQ2_XXS: ~2-3 GB.
  - Q2_K / IQ2_M: ~3-3,5 GB.
  - Q3_K_M / IQ3_XS: ~3,5-4,5 GB.
  - Q4_K_M / IQ4_XS: ~4,5-5,5 GB.
  - Q5_K_M: ~5,5-6,5 GB.
  - Q6_K: ~6,5-7,5 GB.
  - Nota: estas cifras son estimaciones a partir del tamano del repo (9,1 GB) y del numero de parametros; no estan confirmadas por el autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para cuantizaciones altas; A100/H100 solo si se necesita throughput elevado o contexto muy largo.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas usando Q4_K_M o inferiores. En 4 GB, solo cuantizaciones IQ2/IQ1.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; servidores compatibles con GGUF (llama.cpp server). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. Como referencia cualitativa, un 7,5B en Q4_K_M en una RTX 4090 suele superar las decenas de tokens por segundo, pero no hay medicion publicada para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Abliterated (este, GGUF) | ~7,5B | no disponible | no disponible | GGUF | Cuantizaciones imatrix de un fine-tune "abliterated" |
| Nemotron-3.5-Bolt-E4B (base, monamoe) | ~7,5B | no disponible | no disponible | safetensors | Modelo de origen sin cuantizar |
| Mistral-7B-Instruct (referencia de gama) | 7,2B | 32k (v0.2) | Apache 2.0 | safetensors, GGUF | Alternativa consolidada de 7B con licencia permisiva |
| Llama 3.1 8B Instruct | 8,0B | 128k | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema amplio; licencia con restricciones |

La comparativa es orientativa: no hay datos de rendimiento del modelo evaluado, por lo que la eleccion frente a Mistral o Llama 3.1 debe basarse en pruebas propias y en la licencia (que aqui no esta declarada, lo que es un riesgo para uso comercial).

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el repo del modelo base antes de produccion.
- Idiomas no documentados: no se garantiza calidad fuera del ingles (probable idioma principal del modelo base).
- Modelo "abliterated": el proceso de eliminar rechazos puede aumentar la probabilidad de generar contenido toxico, sesgado o inseguro; requiere filtros y moderacion en produccion.
- Riesgo de alucinacion: inherente a modelos de ~7,5B; no hay evaluaciones publicadas de fidelidad.
- Contexto desconocido: no se puede planificar el uso con documentos largos sin verificar la ventana real del modelo base.
- Cuantizaciones muy bajas (IQ1_S, IQ2_XXS): degradacion notable de calidad; no recomendadas para tareas de razonamiento o codigo.
- Sin benchmarks: no hay evidencia publicada de rendimiento frente a alternativas; la eleccion debe validarse empiricamente.
- Repositorio con 0 descargas y 1 like: ecosistema minimo, sin validacion de la comunidad; posible falta de soporte.
- Fecha de creacion futura (2026-11-22): metadato anomalo que sugiere posible error de publicacion o repositorio de prueba; conviene verificar integridad de los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-i1-GGUF
- Modelo base (monamoe): https://huggingface.co/monamoe/Nemotron-3.5-Bolt-E4B-Abliterated
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (runtime compatible): https://github.com/ggerganov/llama.cpp
- Ollama (runtime compatible): https://ollama.com
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
