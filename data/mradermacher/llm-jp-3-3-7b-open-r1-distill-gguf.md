# mradermacher/llm-jp-3-3.7b-Open-R1-Distill-GGUF

## Resumen

`mradermacher/llm-jp-3-3.7b-Open-R1-Distill-GGUF` es la distribucion en formato GGUF del modelo `KMasaki/llm-jp-3-3.7b-Open-R1-Distill`, un ajuste fino (SFT) del modelo japones `llm-jp-3-3.7b` sobre el dataset `open-r1/OpenR1-Math-220k`. El trabajo de cuantizacion lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp, que ofrece el modelo en una escala de tipos de cuantizacion desde Q2_K hasta f16.

El objetivo del modelo base es trasladar las capacidades de razonamiento matematico destiladas del proyecto Open-R1 a un modelo de ~3.700 millones de parametros con foco en japones, aunque la model card declara unicamente el idioma `en`. La relevancia practica de esta ficha reside en que permite ejecutar un modelo de razonamiento matematico en hardware de consumo gracias a las cuantizaciones de 0,8 a 3,2 GB.

Conviene senalar una discrepancia importante: la model card anuncia un modelo de 3.7B, pero el recuento real de parametros en safetensors es de 1.543.714.304 (~1,54B). Esta ficha reporta ambos datos y advierte de la discrepancia en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: llm-jp-3-3.7b, familia LLM-jp; detalles arquitectonicos no incluidos en la informacion proporcionada) |
| Parametros totales | 1.543.714.304 (~1,54B) segun safetensors; la model card indica 3.7B en el nombre |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (declarado en la model card); el modelo base es de origen japones, pero no se declara `ja` en esta ficha |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base `KMasaki/llm-jp-3-3.7b-Open-R1-Distill` se ha obtenido mediante SFT (supervised fine-tuning) con la libreria TRL sobre el dataset `open-r1/OpenR1-Math-220k`, un corpus de problemas matematicos con cadenas de razonamiento generadas por el pipeline Open-R1. El punto de partida es `llm-jp-3-3.7b`, un modelo de la familia LLM-jp entrenado principalmente en japones e ingles. La model card no detalla la arquitectura interna (numero de capas, dimensiones, tipo de atencion) ni el numero de tokens de entrenamiento.

Esta ficha corresponde exclusivamente a la cuantizacion GGUF realizada por mradermacher: cuantizaciones estaticas (sin imatrix ni weighted quants, segun indica el propio autor) generadas con el flujo de conversion HF a GGUF. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato chat (tag `conversational`).
- Razonamiento matematico: el ajuste sobre OpenR1-Math-220k esta orientado a resolver problemas matematicos paso a paso.
- Razonamiento multi-paso derivado del estilo de datos de Open-R1 (cadenas de pensamiento).
- Capacidades multilingues limitadas: la model card declara solo `en`, aunque el modelo base llm-jp tiene cobertura de japones no reflejada en esta ficha.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite desplegarlo en infraestructuras tipo Inference Endpoints.
- No se documenta soporte explicito de tool calling, function calling, vision ni audio.

## Casos de uso

- Tutoria matematica local: ejecutar el modelo en un portatil con llama.cpp u Ollama usando la cuantizacion Q4_K_M (1,1 GB) para resolver y explicar problemas paso a paso sin conexion.
- Prototipado de razonamiento en entornos con VRAM limitada: la version Q8_0 (1,7 GB) permite experimentar con cadenas de razonamiento en GPUs de 4-8 GB.
- Generacion de datasets sinteticos de matematicas: usar el modelo para producir soluciones razonadas que luego se filtran y se emplean en ajustes finos de modelos mayores.
- Evaluacion comparativa de destilaciones Open-R1: al ser una destilacion pequena, sirve como linea base para medir cuanto del rendimiento de Open-R1 se conserva en modelos de ~1,5B.
- Despliegue en edge o entornos air-gapped: el formato GGUF y el tamano reducido permiten embeberlo en dispositivos sin GPU dedicada.
- Experimentacion educativa con cuantizaciones: comparar la calidad entre Q2_K, Q4_K_M y Q8_0 sobre el mismo conjunto de problemas matematicos para entender el impacto de la cuantizacion.
- Chat conversacional ligero en ingles para tareas de razonamiento acotado, siempre con validacion humana por el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~0,8 GB; Q3_K ~0,9-1,0 GB; IQ4_XS/Q4_K ~1,0-1,1 GB; Q5_K ~1,2 GB; Q6_K ~1,4 GB; Q8_0 ~1,7 GB; f16 ~3,2 GB.
- Con overhead de contexto y KV cache, anadir aproximadamente 0,5-2 GB segun longitud de contexto y backend.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090) para cuantizaciones Q4-Q8; A100/H100 no son necesarias y estarian infrautilizadas.
- Cabe holgadamente en GPU consumer: si, en todas las cuantizaciones, incluidas GPUs integradas con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con endpoints. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; en una RTX 4090 con Q4_K_M se espera un throughput alto por el tamano reducido, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| llm-jp-3-3.7b-Open-R1-Distill-GGUF (este) | ~1,54B reales (3.7B nominal) | no disponible | no disponible | GGUF | Destilacion Open-R1 sobre llm-jp-3 |
| KMasaki/llm-jp-3-3.7b-Open-R1-Distill | ~1,54B reales | no disponible | no disponible | safetensors | Modelo base sin cuantizar |
| llm-jp-3-3.7b | 3.7B (nominal) | no disponible | no disponible | safetensors | Modelo original de LLM-jp, sin ajuste matematico |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32k (segun documentacion publica del modelo) | MIT (segun documentacion publica) | safetensors/GGUF | Alternativa directa de destilacion R1 en tamano similar |

La comparativa con alternativas queda limitada porque no se dispone de datos de benchmarks ni de la licencia del modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica 3.7B pero el recuento real en safetensors es ~1,54B. Verificar antes de asumir capacidades de un modelo de 3.7B.
- Licencia no declarada: no se puede confirmar el uso comercial; consultar la ficha del modelo base antes de desplegarlo en produccion.
- Idioma: la model card declara solo `en`, pese al origen japones del modelo base; el rendimiento en japones o castellano no esta documentado.
- Riesgo de alucinacion: al ser una destilacion pequena especializada en matematicas, puede producir cadenas de razonamiento plausibles pero incorrectas; requiere verificacion.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay weighted/imatrix quants, por lo que las versiones de baja calidad (Q2_K, Q3_K_S) degradaran mas el rendimiento que sus equivalentes con imatrix.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Contexto desconocido: no se documenta la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Sin soporte documentado de tool calling ni agentes: no asumir capacidades de function calling en produccion.

## Enlaces

- HuggingFace (este GGUF): https://huggingface.co/mradermacher/llm-jp-3-3.7b-Open-R1-Distill-GGUF
- Modelo base: https://huggingface.co/KMasaki/llm-jp-3-3.7b-Open-R1-Distill
- Pagina de resumen del autor: https://hf.tst.eu/model#llm-jp-3-3.7b-Open-R1-Distill-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
