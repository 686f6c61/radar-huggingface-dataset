# mr-andrey-isachenko/Tenet-26B-A3B-Inkling2-Unslop-v3

## Resumen

Tenet-26B-A3B-Inkling2-Unslop-v3 es un fine-tune del modelo `thinkingmachines/Inkling-2-Mini` publicado por el usuario `mr-andrey-isachenko` bajo el paraguas de su familia "Tenet". El modelo aplica una tecnica de edicion de pesos propietaria denominada "Lancet" (cirugia de subespacios bi-proyectada que preserva la norma) para eliminar la direccion de rechazo en las proyecciones de entrada y salida, seguida de un pase de GRPO con compuertas ("gated unslop GRPO") que penaliza patrones de prosa vacia y preambulos moralizantes. El resultado se exporta en FP8 (E4M3) listo para proveedores de inferencia.

El checkpoint declara 26.388.646.440 parametros totales (segun los safetensors del repo) y la nomenclatura "A3B" sugiere una arquitectura de mezcla de expertos con aproximadamente 3 mil millones de parametros activos, aunque el autor no documenta explicitamente la configuracion MoE en la model card. El tamano del repositorio es de 20,2 GB, coherente con un export FP8 de un modelo de ese orden.

Su relevancia es acotada pero concreta: se presenta como una alternativa a la "abliteracion ingenua" para casos en los que se necesita un asistente que no rechace peticiones benignas (triaje de logs, SQL, tareas de AppSec) sin degradar la validez estructural de las salidas de tool calling. El modelo no tiene descargas ni likes en el momento de redactar esta ficha, y los benchmarks publicados aparecen como "n/a" en todas sus tablas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (inferida de la nomenclatura "A3B"; no documentada explicitamente por el autor) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | Aproximadamente 3 mil millones (inferido del sufijo "A3B"; no confirmado en la model card) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue con vLLM; no se declara un maximo oficial) |
| Tipos de cuantizacion | FP8 (E4M3) como formato principal; GGUF y MLX mencionados como soportados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8 E4M3), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de `thinkingmachines/Inkling-2-Mini`, del que no se detalla la arquitectura interna en la informacion disponible. La nomenclatura "26B-A3B" apunta a un transformer con mezcla de expertos de 26 mil millones de parametros totales y unos 3 mil millones activos por token, pero el autor no publica la configuracion de capas, numero de expertos ni top-k de enrutamiento. El pipeline declarado es `text-generation` con soporte de `image-text-to-text` en los tags, lo que sugiere capacidades multimodales heredadas del modelo base, aunque no se documentan.

El entrenamiento consiste en dos fases. Primero, la cirugia "Lancet": identificacion de la direccion de rechazo tanto en el flujo residual (proyeccion de entrada) como en el unembedding (proyeccion de salida), eliminacion bidireccional del componente y restauracion exacta de la norma residual para mantener las magnitudes de activacion en la variedad original. Segundo, un pase de GRPO con compuertas ("gated unslop GRPO") cuyo reward penaliza prosa morada, vocabulario tipo "tapestry" y preambulos moralizantes solo en las regiones donde la cirugia debilito el circuito de rechazo, con el objetivo de reforzar razonamiento y codigo en lugar de degradarlos. El autor menciona tambien telemetria "Strata" (H21 grafo de coactivacion de expertos, H22 pases de decodificacion especulativa) publicada como `strata.toml`, aunque todos los valores aparecen como "n/a".

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento estructurado y codificacion, con anclaje explicito en subespacios de razonamiento y codigo preservados tras la cirugia.
- Tool calling y function calling con salida JSON validable contra esquema (el ejemplo de la model card produce una llamada DuckDB correcta).
- Flujos agenticos y razonamiento multi-paso (tag `agentic`).
- Generacion de SQL y tareas de analisis de datos.
- Capacidades multimodal imagen-texto declaradas en los tags (`image-text-to-text`), aunque no documentadas en detalle.
- Modo sin rechazos para peticiones benignas (tag `abliterated` / `uncensored`), con el alcance de seguridad declarado por el autor.
- Compatibilidad con proveedores de inferencia tipo OpenRouter y con `endpoints_compatible`.
- Soporte de decodificacion especulativa (telemetria H22 mencionada).

## Casos de uso

- Triaje de logs de seguridad: el modelo puede recibir lineas de log (por ejemplo de nginx) y devolver una llamada de herramienta SQL valida para agregar intentos fallidos por IP, sin rechazos falsos positivos que rompan el pipeline automatizado.
- Asistente de AppSec y DevOps: consultas sobre configuracion, analisis de cabeceras, revision de reglas de firewall y generacion de consultas de auditoria, aprovechando que el modelo mantiene el anclaje de tool calling tras la cirugia.
- Generacion de SQL en produccion: integracion en pipelines de analitica donde la salida debe ser JSON conforme a esquema; el modelo base rechazaba este tipo de peticiones y la abliteracion ingenua rompia el formato, mientras que este checkpoint preserva ambos.
- Agentes multi-paso con herramientas: orquestacion de tareas que requieren varias llamadas encadenadas (consulta, transformacion, escritura) gracias al soporte de tool use y contexto de 32k tokens.
- Asistencia a desarrolladores en entornos internos: autocompletado y explicacion de codigo sin preambulos moralizantes, util en IDE o CLI donde la verbosidad del modelo base resulta molesta.
- Evaluacion de tecnicas de edicion de pesos: el checkpoint sirve como referencia practica para investigadores que comparan cirugia de subespacios frente a abliteracion ingenua, con el codigo de `tenet-lab` como base reproducible.
- Despliegue en proveedores de inferencia: al no requerir `trust_remote_code` ni `auto_map`, el repo se puede cargar directamente en vLLM, llama.cpp, MLX u OpenRouter sin codigo personalizado.

## Benchmarks y rendimiento

Las tablas publicadas por el autor (H9 retencion de rechazo y slop, H10 retencion de capacidad downstream, H11 robustez de cuantizacion FP8, comparativa frente a abliteracion ingenua y telemetria Strata) aparecen con todos los valores como "n/a". No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB en FP8 (E4M3) para los pesos; con cache KV para 32k tokens conviene reservar 24-32 GB adicionales segun lote y configuracion.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue comodo en FP8. En consumer, una RTX 4090 (24 GB) puede alojar los pesos FP8 pero el contexto de 32k requiere cuantizar el cache KV o reducir la ventana.
- Cabe en consumer GPU: si, en RTX 4090/3090 con cuantizacion GGUF (Q4/Q5) o con FP8 y contexto recortado; en GPUs de 16 GB solo con cuantizaciones agresivas.
- Opciones de despliegue: vLLM (`--quantization fp8 --max-model-len 32768`), Transformers con `device_map="auto"`, llama.cpp (CKA-Quant segun la model card), MLX y proveedores OpenRouter.
- Latencia y throughput: no disponibles. La telemetria de decodificacion especulativa (`speculative_acceptance_rate`) aparece como "n/a".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tenet-26B-A3B-Inkling2-Unslop-v3 | 26,4 B totales / ~3 B activos | 32k (uso declarado) | Apache 2.0 | Fine-tune con cirugia Lancet y GRPO; sin benchmarks publicados |
| thinkingmachines/Inkling-2-Mini (base) | No disponible | No disponible | No disponible | Modelo original; rechaza peticiones benignas de seguridad y produce prosa moralizante segun el autor |
| Abliteracion ingenua de Inkling-2-Mini | No disponible | No disponible | No disponible | Elimina rechazos pero rompe la validez estructural de las llamadas a herramientas |

No se dispone de datos de rendimiento comparables para establecer una jerarquia cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Los benchmarks publicados estan vacios ("n/a"): no hay evidencia numerica de que la cirugia preserve razonamiento, codigo o instrucciones frente al modelo base.
- El modelo esta explicitamente desalineado en materia de rechazos: aunque el autor declara que no esta destinado a operaciones ofensivas, malware o contenido ilegal, la eliminacion de la direccion de rechazo reduce las barreras de seguridad y exige filtros externos en produccion.
- Riesgo de alucinacion no cuantificado; el GRPO con compuertas puede haber alterado la distribucion de salida de formas no medidas.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue mas alla del ingles.
- La arquitectura MoE y el numero de parametros activos son inferencias de la nomenclatura, no datos confirmados por el autor.
- El contexto maximo real no esta declarado; los 32.768 tokens provienen del ejemplo de despliegue y podrian no ser el limite del modelo base.
- Repositorio con cero descargas y cero likes: no hay validacion de la comunidad ni informes independientes de calidad.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del modelo recae en el desplegador.
- Dependencia de telemetria y tooling propios (`strata.toml`, inspector FP8) sin valores publicados que permitan verificar las afirmaciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-26B-A3B-Inkling2-Unslop-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Codigo y reporte tecnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Inspector interactivo FP8 y abliteracion: https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Coleccion de la familia Tenet: https://huggingface.co/mr-andrey-isachenko
