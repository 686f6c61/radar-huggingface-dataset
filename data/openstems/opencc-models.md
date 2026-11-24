# OpenStems/OpenCC-Models

## Resumen

OpenCC-Models es un repositorio de distribución de recursos de modelos gestionado por OpenStems, concebido como infraestructura de descarga para las aplicaciones OpenCC, AutoSubs Ultra y Subtitle Edit Ultra. No se trata de un modelo entrenado por OpenStems, sino de un contenedor de artefactos convertidos o empaquetados a partir de modelos upstream públicos, orientados a reconocimiento automático de voz (ASR) y traducción. La model card insiste en que la conversión y el empaquetado no constituyen entrenamiento: cada artefacto conserva la identidad, el formato y la precisión del modelo original del que deriva.

El repositorio se declara explícitamente independiente del repositorio de modelos OpenStems / StemDeck, y su estado de publicación es "en progreso": la mera existencia del repositorio no implica que los ficheros estén listos ni que la integración de descarga pública de las aplicaciones esté operativa. Los consumidores en producción deben usar exclusivamente un manifiesto de recursos publicado y anclado a una revisión, cuyas longitudes exactas de fichero y digests SHA-256 hayan sido verificados.

El dato de parámetros disponible en safetensors (980.046.848) corresponde a uno de los artefactos alojados, no a un modelo único del repositorio, ya que el repo agrupa múltiples recursos heterogéneos (ONNX, safetensors y GGUF) con un tamaño total de 43,4 GB. La licencia es "other", con el identificador `per-file-upstream-licenses`, lo que significa que cada fichero queda sujeto a los términos de su modelo upstream de origen y ninguna licencia global del repositorio sustituye dichos términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de artefactos derivados de modelos upstream; la arquitectura depende de cada artefacto) |
| Parametros totales | 980.046.848 (dato safetensors de uno de los artefactos; no representa el conjunto del repositorio) |
| Parametros activos | No disponible (no se declara ningún artefacto MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; la model card indica que los artefactos conservan la precisión original del modelo upstream y que etiquetas de cuantización similares no bastan para considerarlos equivalentes |
| Idiomas soportados | No disponible |
| Licencia | `other` (`per-file-upstream-licenses`); cada fichero se rige por la licencia de su modelo upstream |
| Formato de pesos | ONNX, safetensors y GGUF |
| Tamano del repositorio | 43,4 GB |
| Tareas declaradas | `automatic-speech-recognition`, `translation` |
| Pipeline en Hugging Face | `translation` |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO. La model card es explícita en este punto: OpenCC-Models es un repositorio de distribución de recursos, y la conversión y el empaquetado de artefactos "no son entrenamiento de modelo". Por tanto, cualquier característica arquitectónica debe consultarse en el repositorio upstream del modelo original correspondiente a cada fichero.

La innovación técnica relevante aquí no es de modelado, sino de integridad y trazabilidad de artefactos: cada recurso publicado debe identificar su fuente upstream, la transformación aplicada, la precisión resultante y los términos upstream aplicables. Además, los orígenes en Hugging Face y ModelScope de un mismo artefacto lógico deben proporcionar bytes de fichero final idénticos; nombres similares, familias de modelos o etiquetas de cuantización no son suficientes para tratarlos como equivalentes ni como espejos válidos.

## Capacidades

- Reconocimiento automático de voz (ASR), según la etiqueta `automatic-speech-recognition` declarada en el repositorio.
- Traducción, según la etiqueta `translation` y el pipeline asignado en Hugging Face.
- Distribución de artefactos en múltiples formatos: ONNX, safetensors y GGUF, lo que habilita despliegue tanto en runtimes de inferencia nativos como en entornos basados en llama.cpp.
- Integración prevista con las aplicaciones OpenCC, AutoSubs Ultra y Subtitle Edit Ultra, orientadas a flujos de subtitulado.
- Verificación de integridad mediante longitudes de fichero y digests SHA-256 en manifiestos anclados a revisión.
- Generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling, agentes, modo thinking, audio nativo y capacidades multilingües: no disponibles como capacidades declaradas del repositorio.

## Casos de uso

- Subtitulado automático de vídeo: las aplicaciones AutoSubs Ultra y Subtitle Edit Ultra consumen los artefactos ASR de este repositorio para transcribir audio y generar subtítulos, encajando el modelo en un pipeline de posproducción donde la reproducibilidad del recurso descargado es crítica.
- Traducción de subtítulos entre idiomas: el pipeline `translation` asignado en Hugging Face permite usar los artefactos para convertir transcripciones en subtítulos traducidos, integrándose en el mismo flujo de las aplicaciones de subtitulado.
- Distribución interna de modelos con integridad verificable: equipos que despliegan ASR o traducción en producción pueden consumir los recursos a través de un manifiesto anclado a revisión con SHA-256 verificado, evitando derivas silenciosas entre descargas.
- Despliegue en entornos con restricciones de runtime: la disponibilidad de artefactos ONNX permite ejecutar los modelos en runtimes de inferencia ONNX, mientras que los artefactos GGUF habilitan despliegue en llama.cpp y entornos derivados para equipos sin GPUs de datacenter.
- Espejo controlado entre Hugging Face y ModelScope: organizaciones que operan en regiones con acceso restringido a uno de los dos hubs pueden usar el par de orígenes siempre que los bytes finales sean idénticos, tal como exige la política del repositorio.
- Auditoría de procedencia de modelos: el requisito de que cada artefacto declare fuente upstream, transformación, precisión y licencia aplicable lo convierte en un punto de control útil para equipos de compliance que necesitan trazar qué modelo exacto corre en producción.
- Empaquetado de recursos para aplicaciones de escritorio: el repositorio sirve como backend de descarga para las tres aplicaciones citadas, centralizando la gestión de versiones de modelos ASR y de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, BLEU, MMLU, HumanEval, GSM8K ni ninguna otra evaluación, y al tratarse de un repositorio de artefactos derivados, cualquier métrica correspondería al modelo upstream de cada fichero, no a OpenCC-Models como entidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del artefacto concreto; el dato de 980.046.848 parámetros en safetensors corresponde a un único fichero y no permite extrapolar requisitos para el conjunto de 43,4 GB.
- GPU recomendadas: no disponible. La model card no especifica hardware objetivo.
- Compatibilidad con GPU de consumo: no disponible como recomendación oficial; la presencia de artefactos GGUF y ONNX sugiere posibilidades de despliegue en entornos de consumo, pero el repositorio no publica requisitos verificados.
- Opciones de despliegue: ONNX Runtime para los artefactos ONNX; llama.cpp y entornos compatibles GGUF para los artefactos GGUF; runtimes que carguen safetensors para los artefactos en ese formato. vLLM, TGI, Ollama y similares no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

Advertencia operativa: la model card indica que las aplicaciones en producción deben usar únicamente un manifiesto de recursos publicado y anclado a revisión, con longitudes y SHA-256 verificados. Un repositorio en estado "publicación en progreso" no debe tratarse como fuente de descarga lista para producción.

## Comparativa con modelos similares

No disponible. El repositorio no declara qué modelos upstream concretos aloja, y la model card advierte que nombres similares, familias de modelos o etiquetas de cuantización no son criterio suficiente para establecer equivalencia. Sin identificar los modelos de origen, no es posible construir una comparativa fiable de parámetros, contexto, rendimiento o licencia frente a alternativas ASR o de traducción.

| Criterio | OpenCC-Models | Alternativas comparables |
|---|---|---|
| Naturaleza | Repositorio de distribución de artefactos derivados | No disponible |
| Parametros | 980.046.848 (un artefacto safetensors) | No disponible |
| Contexto | No disponible | No disponible |
| Formatos | ONNX, safetensors, GGUF | No disponible |
| Licencia | Por fichero, según upstream | No disponible |

## Limitaciones y advertencias

- Estado de publicación incompleto: la model card declara que el inventario y la publicación están en progreso y que crear el repositorio no implica que los ficheros ni la integración de descarga estén listos. Un repositorio vacío o con direcciones de ejemplo no debe usarse como fuente de descarga.
- Licencia fragmentada: la licencia `other` con `per-file-upstream-licenses` implica que cada artefacto arrastra los términos de su modelo de origen. No existe una licencia global que autorice uso comercial del conjunto; cualquier uso comercial requiere revisar fichero por fichero.
- Riesgo de confusión entre artefactos: la model card subraya que nombres similares, familias de modelos o etiquetas de cuantización no bastan para considerar dos ficheros equivalentes, lo que introduce riesgo operativo si se seleccionan recursos por nombre en lugar de por digest.
- Requisito de integridad estricto: los consumidores deben verificar longitudes exactas y SHA-256 contra un manifiesto anclado a revisión; obviarlo invalida la garantía de reproducibilidad que el repositorio pretende oferecer.
- Espejos HF/ModelScope: solo son válidos si los bytes finales son idénticos. Formatos o precisiones distintas no pueden actuar como espejos entre sí.
- Idiomas soportados: no declarados, lo que impide garantizar cobertura lingüística para casos de traducción o ASR multilingüe.
- Sesgos y alucinaciones: no disponible. Al no ser un modelo entrenado por OpenStems, cualquier evaluación de sesgo o tasa de alucinación corresponde al modelo upstream de cada artefacto.
- Contexto: no disponible; no se puede planificar arquitectura de aplicaciones en función de una ventana de contexto documentada.
- Trazabilidad obligatoria: cada artefacto publicado debe identificar fuente upstream, transformación y términos aplicables; la ausencia de estos metadatos en un fichero concreto es en sí misma una advertencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OpenStems/OpenCC-Models
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código, demos ni documentación adicional de OpenCC, AutoSubs Ultra o Subtitle Edit Ultra.
