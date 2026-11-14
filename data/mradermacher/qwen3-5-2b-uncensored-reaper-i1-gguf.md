# mradermacher/Qwen3.5-2B-Uncensored-reaper-i1-GGUF

## Resumen

`mradermacher/Qwen3.5-2B-Uncensored-reaper-i1-GGUF` es una cuantizacion GGUF del modelo base `abdukuzi45/Qwen3.5-2B-Uncensored-reaper`, publicada por mradermacher (nethype GmbH). Se trata de una variante "abliterated" y "uncensored" derivada de la familia Qwen3.5, orientada a investigacion sobre alineamiento y comportamiento de modelos sin las capas habituales de rechazo. El autor del quant aplica cuantizacion con matriz de importancia (imatrix) para preservar calidad en tamanos reducidos.

El repositorio i1-GGUF contiene exclusivamente el fichero de matriz de importancia (`imatrix.gguf`, 0,1 GB), utilizado para generar cuantizaciones propias; los pesos cuantizados estáticos se alojan en el repositorio hermano `Qwen3.5-2B-Uncensored-reaper-GGUF`. El modelo base se etiqueta como multimodal (vision), con licencia Apache 2.0 y soporte declarado unicamente de ingles.

La relevancia de esta ficha es acotada: el repo tiene 0 descargas y 0 likes en el momento de la consulta, el tamano del repo es practicamente nulo (0,0 GB) y el dato de parametros reportado por safetensors (960.882) es inconsistente con el nombre del modelo (2B), lo que sugiere que el campo corresponde a otro artefacto o esta mal poblado. Debe tratarse como un modelo de investigacion de disponibilidad marginal, no como una opcion de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen3.5, presumiblemente transformer multimodal; no confirmado en la informacion) |
| Parametros totales | 960.882 segun safetensors (inconsistente con el nombre "2B"); nominalmente 2B por denominacion del modelo base |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (i1); el autor lista Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (imatrix en este repo; quants estaticos en repo hermano) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la denominacion "Qwen3.5" se infiere una base de la familia Qwen, pero no se confirma en la model card ni en los metadatos si se trata de un transformer denso, MoE o hibrido. La etiqueta `multimodal` y la referencia a ficheros `mmproj` indican soporte de vision, aunque el repo de cuantizacion i1 no incluye dichos ficheros (se remiten al repo estatico).

Respecto al entrenamiento, la etiqueta `abliterated` sugiere una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, y `uncensored` indica la ausencia deliberada de filtros de seguridad. No se especifican numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o fine-tuning supervisado. La cuantizacion aplicada por mradermacher es de tipo i1 (imatrix), con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que implica conversion desde pesos Hugging Face y uso de matriz de importancia para minimizar la perdi da de perplejidad en cuantos bajos.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Capacidad multimodal declarada por la etiqueta `multimodal` y la mencion a `mmproj`, aunque los ficheros de proyeccion visual no estan en este repo.
- Comportamiento "uncensored": el modelo ha sido modificado para reducir rechazos ante peticiones que un modelo alineado rechazaria.
- Razonamiento y codigo: no confirmado explicitamente en la informacion disponible; heredado presumiblemente del base Qwen3.5, sin datos verificables.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion.
- Capacidades multilingues: limitadas a ingles segun metadatos.
- Modo thinking: no disponible en la informacion.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia la tasa de rechazo y la calidad de respuesta tras la ablacion, comparando contra el base alineado en experimentos controlados.
- Analisis de sesgos y robustez: util para medir como la eliminacion de capas de rechazo afecta a la generacion de contenido sensible en entornos de evaluacion cerrados.
- Generacion de texto en ingles para prototipos: con cuantizaciones Q4_K_M o Q5_K_M puede ejecutarse en hardware modesto para pruebas de generacion de texto donde no se requiera alineamiento estricto.
- Despliegue local con llama.cpp u Ollama: al estar en GGUF, se integra en pipelines locales de inferencia sin dependencia de APIs, adecuado para laboratorios con requisitos de privacidad.
- Creacion de cuantizaciones propias: el fichero `imatrix.gguf` permite a otros desarrolladores generar sus propios quants con `llama-quantize`, ajustando el equilibrio tamano/calidad.
- Experimentos de vision (condicionado): si se descargan los `mmproj` del repo estatico, podria emplearse en tareas de descripcion de imagenes o VQA en ingles, aunque la calidad no esta documentada.
- Baseline para comparativas de "uncensoring": sirve como referencia en estudios que comparan tecnicas de abliteration frente a fine-tuning selectivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo nominal de 2B, las cuantizaciones Q4_K_M rondarian 1,3-1,5 GB y Q8_0 en torno a 2,2 GB; no se aportan cifras oficiales en la model card.
- GPU recomendadas: no disponibles. Por tamano nominal, una RTX 3060 (12 GB) o superior seria suficiente para el modelo completo en cualquier cuantizacion listada; para vision habria que sumar el `mmproj`.
- Cabe en GPU consumer: si, previsiblemente en GTX 1660 (6 GB) o superiores para cuantos Q4/Q5; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), y en general cualquier runtime compatible con GGUF. El repo indica `endpoints_compatible` en los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables con datos verificables de parametros, contexto o rendimiento. Como referencia cualitativa, se trata de una variante uncensored de un modelo de ~2B, categoria en la que existen alternativas como las familias Qwen2.5-1.5B/3B o Llama-3.2-1B/3B, pero no se dispone de datos de este modelo para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo "uncensored": no incorpora los filtros de seguridad habituales; puede generar contenido danino, ilegal o sesgado. No apto para exposicion directa a usuarios finales sin moderacion adicional.
- Riesgo elevado de alucinacion: los modelos de ~2B tienen capacidad limitada de razonamiento factual, agravado por la ablacion de alineamiento.
- Solo ingles declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Datos inconsistentes: el campo de parametros safetensors (960.882) no cuadra con la denominacion 2B; el tamano del repo es 0,0 GB porque solo contiene la imatrix. Los pesos reales estan en el repo hermano.
- Sin benchmarks publicados: no hay evidencia de rendimiento que respalde su uso en produccion.
- Disponibilidad marginal: 0 descargas y 0 likes; no hay comunidad ni soporte.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el caracter uncensored traslada al desplegador toda la responsabilidad legal y etica sobre el contenido generado.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana real del base.
- Trazabilidad limitada del base: `abdukuzi45/Qwen3.5-2B-Uncensored-reaper` no aporta documentacion tecnica en la informacion disponible.

## Enlaces

- Repositorio Hugging Face (este quant): https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-reaper-i1-GGUF
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-reaper-GGUF
- Modelo base: https://huggingface.co/abdukuzi45/Qwen3.5-2B-Uncensored-reaper
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-2B-Uncensored-reaper-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
