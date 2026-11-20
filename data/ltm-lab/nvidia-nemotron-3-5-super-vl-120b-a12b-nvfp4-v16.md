# LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v16

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v16 es un checkpoint multimodal de tipo image-text-to-text publicado por el usuario LTM-Lab sobre el modelo base LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15, del que conserva pesos y tokenizer. La nomenclatura del nombre apunta a la familia Nemotron de NVIDIA en su variante Super VL (vision-language) con 120B de parametros nominales y 12B activos, es decir, una arquitectura de mezcla de expertos (MoE) dispersa, cuantizada en NVFP4 (formato de 4 bits de NVIDIA) y empaquetada como modelo de precision mixta de 8 bits (tag `modelopt_mixed`). El repositorio declara 65.769.840.138 parametros reales en los tensores safetensors, muy por debajo de los 120B que sugiere el nombre, lo que sugiere un checkpoint parcial o una cuantizacion que no preserva todos los expertos.

La aportacion diferencial de esta revision v16 es la incorporacion de una capa de memoria episodica persistente (tag `v16-episodic-memory`) implementada en la arquitectura de Hugging Face incluida en el repositorio, que requiere cargar el modelo con `trust_remote_code=True`. El resto de pesos y el tokenizer son identicos al checkpoint v15 de origen, por lo que las capacidades cognitivas del modelo subyacente no cambian; lo que cambia es la gestion de estado entre turnos de conversacion.

Es relevante ahora porque propone un patron poco habitual en modelos abiertos: separar el modelo base congelado de una capa de memoria de inferencia versionada y distribuible. Para desarrolladores que evaluan asistentes multimodales de contexto largo, este checkpoint permite probar memoria episodica sin reentrenar, aunque con las cautelas propias de un artefacto sin benchmarks publicados, sin idiomas declarados y con cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text con mezcla de expertos (MoE) segun nomenclatura A12B; familia `nemotron_h_omni`; capa adicional de memoria episodica V16 en el codigo de arquitectura |
| Parametros totales | 65.769.840.138 (segun safetensors); el nombre comercial indica 120B |
| Parametros activos | 12B (segun el sufijo A12B del nombre; no verificado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) con empaquetado de precision mixta `modelopt_mixed`, etiquetado como 8-bit |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`), declarada como `other` en los tags |
| Formato de pesos | safetensors, con codigo de arquitectura personalizado (`custom_code`) |
| Tamano del repositorio | 75,0 GB |
| Modalidad | texto e imagen (pipeline `image-text-to-text`) |
| Carga requerida | `trust_remote_code=True` |

## Arquitectura y entrenamiento

La model card es minima y no documenta el proceso de entrenamiento. Lo que se puede afirmar con la informacion disponible: el checkpoint hereda integramente pesos y tokenizer del modelo LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15, identificado por el commit `55d6616a42a7b67fcfb482b532a1aecee5643351`. La unica modificacion es la inclusion de una arquitectura de Hugging Face que anade memoria episodica persistente V16 en tiempo de inferencia. Por tanto, no hay indicios de un nuevo ciclo de preentrenamiento, ajuste supervisado o RLHF/DPO en esta revision: el aprendizaje del modelo subyacente queda fuera del alcance del repositorio.

El identificador `nemotron_h_omni` sugiere una variante hibrida y omnimodal dentro de la familia Nemotron, y el sufijo A12B indica activacion dispersa de aproximadamente 12B de parametros por token, coherente con un diseño MoE. La cuantizacion NVFP4 con empaquetado `modelopt_mixed` corresponde a la linea de compresion de NVIDIA ModelOpt, que combina capas en 4 bits con otras en mayor precision para preservar calidad. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion ni innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.) para este checkpoint concreto.

## Capacidades

- Generacion de texto conversacional multi-turno, con el pipeline declarado como `image-text-to-text`.
- Comprension de imagenes combinada con texto: el modelo acepta entradas imagen-texto y produce texto, segun el pipeline tag.
- Memoria episodica persistente V16: la arquitectura incluida mantiene estado entre interacciones en inferencia, lo que habilita continuidad conversacional sin reenviar todo el historial en el prompt.
- Razonamiento y generacion de codigo: no confirmado en la informacion disponible; el nombre de familia Nemotron lo hace plausible, pero no hay documentacion que lo verifique en este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; la memoria episodica es el unico mecanismo de estado descrito.
- Capacidades multilingues: no disponible; el campo de idiomas no esta declarado.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Asistentes conversacionales con continuidad entre sesiones: la capa de memoria episodica V16 permite que el modelo recuerde interacciones previas sin reconstruir el historial completo en cada peticion, lo que reduce tokens de entrada en dialogos largos y facilita experiencias de asistente personal persistente.
- Analisis de documentos con imagenes en flujos iterativos: al combinar entrada image-text-to-text con memoria, un pipeline de revision de capturas, diagramas o formularios escaneados puede acumular hallazgos entre pasos y referenciarlos en turnos posteriores.
- Prototipado de agentes de soporte tecnico: la memoria persistente sirve para mantener el estado de un caso (sintomas, pruebas realizadas, resultados) a lo largo de una incidencia, evitando que el modelo pierda el hilo en conversaciones de decenas de turnos.
- Evaluacion de tecnicas de memoria en investigacion: el checkpoint es util como banco de pruebas para comparar memoria episodica en inferencia frente a soluciones de recuperacion externa (RAG) sobre el mismo modelo base v15, ya que los pesos son identicos.
- Despliegue de asistentes multimodales en infraestructura NVIDIA: la cuantizacion NVFP4 con ModelOpt esta pensada para GPUs con soporte de formatos de 4 bits de NVIDIA, lo que encaja en entornos de inferencia con TensorRT-LLM o stacks equivalentes.
- Experimentacion con cuantizacion de precision mixta: el empaquetado `modelopt_mixed` permite estudiar el equilibrio entre huella de memoria y calidad en un modelo MoE multimodal de gran tamano, comparando contra el checkpoint en mayor precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 75,0 GB en safetensors, por lo que se necesita al menos ese espacio en memoria de GPU o en memoria unificada; con overhead de activaciones y cache KV, un despliegue comodo requiere del orden de 80-96 GB o mas, dependiendo de la longitud de contexto (no disponible).
- GPU recomendadas: no hay recomendaciones oficiales en la informacion proporcionada. Por el formato NVFP4 y el tamano, el objetivo natural son GPUs de NVIDIA con soporte de cuantizacion de 4 bits de ultima generacion; no se confirma compatibilidad con modelos concretos.
- Cabe en consumer GPU: no de forma holgada. Una RTX 4090 con 24 GB no puede alojar 75 GB de pesos; seria necesario repartir entre varias GPUs o usar memoria unificada en configuraciones con suficiente RAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el unico metodo documentado. No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI, y el formato NVFP4 con codigo personalizado hace poco probable un soporte inmediato en runners genericos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (v16) | 65,77B en safetensors (nombre: 120B-A12B) | no disponible | OpenMDW 1.1 | safetensors NVFP4 mixto, custom code | Memoria episodica V16 en inferencia |
| LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15 | mismos pesos que v16 | no disponible | OpenMDW 1.1 | safetensors NVFP4 mixto | Modelo base directo, sin capa de memoria V16 |
| Otros modelos de la familia Nemotron | no disponible | no disponible | no disponible | no disponible | No hay informacion en la fuente consultada |
| Alternativas abiertas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

La comparacion mas fiable disponible es contra su propio modelo base v15: misma parametrizacion, mismo tokenizer y mismos pesos, con la unica diferencia de la capa de memoria episodica y el codigo de arquitectura.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta datos de entrenamiento, idiomas, contexto, benchmarks ni procedencia del dataset, lo que impide una evaluacion rigurosa previa a produccion.
- Discrepancia entre nombre y parametros: el nombre indica 120B-A12B pero los tensores suman 65,77B; conviene verificar que el checkpoint este completo antes de confiar en el comportamiento esperado de la familia.
- Requiere `trust_remote_code=True`: la carga ejecuta codigo personalizado del repositorio, un riesgo de seguridad que debe auditarse antes de desplegar en entornos controlados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- Riesgo de alucinacion: no cuantificado; sin benchmarks ni evaluaciones publicadas no puede estimarse la tasa de error factico.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no disponibles; no se declara cobertura multilingue, por lo que el rendimiento en castellano es incierto.
- Licencia OpenMDW 1.1 declarada como `other`: es una licencia de pesos abiertos de NVIDIA, pero sus terminos deben revisarse expresamente antes de uso comercial, redistribucion o despliegue en servicios de terceros.
- La memoria episodica persistente implica retencion de estado entre interacciones: requiere politicas de privacidad, aislamiento por usuario y limpieza de estado para cumplir con normativas de proteccion de datos.
- Sin soporte confirmado en motores de inferencia estandar: la integracion en produccion exigira trabajo de adaptacion del codigo personalizado.
- Repositorio de 75 GB: costes de almacenamiento y tiempos de descarga significativos para iteracion rapida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v16
- Modelo base v15: https://huggingface.co/LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15
- Revision concreta del checkpoint base: https://huggingface.co/LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15/tree/55d6616a42a7b67fcfb482b532a1aecee5643351
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
