# ollybritton/Llama-3.2-3B-gsm8k-distill-radioactive-delta2

## Resumen

El modelo `ollybritton/Llama-3.2-3B-gsm8k-distill-radioactive-delta2` es un ajuste fino (fine-tune) del modelo base `meta-llama/Llama-3.2-3B`, publicado por el usuario ollybritton en HuggingFace. Por el nombre del repositorio se deduce que el ajuste se ha realizado sobre el conjunto de datos GSM8K (problemas matematicos de nivel escolar con soluciones paso a paso) mediante alguna variante de destilacion, aunque la model card no documenta ni el procedimiento ni la receta de entrenamiento. El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 15 de septiembre de 2026.

Se trata de un modelo denso de 3.212.749.824 parametros (aproximadamente 3,2 mil millones), con pesos en formato safetensors y un tamano de repositorio de 6,4 GB, lo que corresponde a pesos en precision de 16 bits. Al derivar de Llama 3.2 3B, hereda la arquitectura transformer decoder-only con Grouped Query Attention del modelo base, aunque el autor no publica ninguna especificacion adicional.

Su relevancia es limitada y de caracter experimental: se trata de un artefacto de investigacion sin documentacion tecnica, sin benchmarks publicados y sin adopcion por parte de la comunidad. Resulta interesante unicamente como ejemplo de destilacion sobre GSM8K en modelos pequenos que caben en GPU de consumo, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `meta-llama/Llama-3.2-3B`; no documentada en la model card) |
| Parametros totales | 3.212.749.824 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base declara 128.000 tokens) |
| Tipos de cuantizacion | No disponible: el repositorio solo contiene pesos safetensors en precision de 16 bits; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura especifica mas alla de la que se hereda del modelo base `meta-llama/Llama-3.2-3B`: un transformer decoder-only con atencion causal, Grouped Query Attention (GQA) y normalizacion RMSNorm. El autor no publica en la model card ni el numero de capas, ni la dimension del modelo, ni la dimension de las cabezas de atencion, ni el tamano del vocabulario. Tampoco se documenta si se han modificado componentes estructurales del modelo original.

Respecto al entrenamiento, el nombre del repositorio sugiere que el ajuste se ha realizado sobre GSM8K (Grade School Math 8K), un dataset de aproximadamente 8.500 problemas matematicos de nivel de educacion primaria con soluciones en formato de cadena de razonamiento. Los terminos "distill" y "radioactive-delta2" no estan explicados en la informacion disponible: no se indica si se trata de destilacion de conocimiento desde un modelo mayor, de entrenamiento sobre trazas de razonamiento generadas por otro modelo, de una variante de ajuste con delta de pesos, ni de una combinacion de tecnicas. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset final, el uso de RLHF o DPO, la tasa de aprendizaje, el numero de epocas ni la infraestructura utilizada.

## Capacidades

No se ha publicado informacion sobre las capacidades del modelo mas alla de lo que sugiere su nombre y su modelo base. Como referencia, y sin que el autor lo haya confirmado, cabria esperar:

- Generacion de texto autoregresiva en el mismo rango de capacidades que el modelo base Llama 3.2 3B.
- Resolucion de problemas matematicos de nivel escolar con razonamiento paso a paso, presumiblemente reforzada por el ajuste sobre GSM8K.
- Generacion de cadenas de razonamiento (chain-of-thought) para problemas aritmeticos de varios pasos.
- Soporte de tool calling / function calling: no confirmado en este fine-tune concreto; el modelo base dispone de plantillas de chat compatibles con llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

Cualquier capacidad adicional debe validarse empiricamente, dado que el ajuste sobre un unico dataset suele degradar las capacidades generales del modelo base (olvido catastrofico) si no se ha aplicado regularizacion o mezcla de datos.

## Casos de uso

- Evaluacion de tecnicas de destilacion: este repositorio sirve como artefacto de referencia para comparar el efecto de destilar GSM8K en un modelo de 3B parametros frente al modelo base sin ajustar, midiendo la variacion en exactitud sobre el conjunto de test.
- Investigacion sobre olvido catastrofico: permite estudiar cuanto se degradan las capacidades generales de Llama 3.2 3B (generacion de texto, codigo, conversacion) despues de un ajuste centrado exclusivamente en un dataset de matematicas.
- Tutoria matematica de nivel escolar en local: el modelo puede desplegarse en una GPU de consumo para generar explicaciones paso a paso de problemas aritmeticos, util en entornos educativos sin conexion a internet.
- Generacion de datos sinteticos de razonamiento: usar el modelo para producir borradores de soluciones paso a paso sobre problemas aritmeticos que despues se filtran y curan manualmente antes de incorporarlos a un dataset de entrenamiento mayor.
- Prototipado rapido en portatil: con 3,2B parametros y pesos de 6,4 GB, es viable ejecutarlo en equipos con 8-16 GB de VRAM o incluso en CPU mediante cuantizacion, lo que permite iterar sobre prompts e integraciones sin coste de API.
- Base para un asistente con calculadora externa: combinado con una herramienta de calculo (tool calling), el modelo puede plantear el razonamiento y delegar la aritmetica exacta en una calculadora, reduciendo errores de calculo.
- Banco de pruebas para pipelines de despliegue: sirve para validar configuraciones de vLLM, llama.cpp u Ollama con un modelo pequeno antes de escalar a modelos mayores.
- Analisis de robustez de formato de chat: al derivar de Llama 3.2, permite comprobar si el ajuste ha preservado la plantilla de chat y los tokens especiales del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de GSM8K, MMLU, HumanEval ni de ningun otro conjunto de evaluacion, a pesar de que el nombre del repositorio hace referencia explicita a GSM8K. Tampoco se ofrecen comparaciones con el modelo base ni con otros fine-tunes similares.

## Requisitos de hardware

- VRAM estimada para inferencia, en funcion de la precision:
  - FP16 / BF16: aproximadamente 6,4 GB solo para pesos, mas entre 1 y 3 GB de cache KV segun la longitud de contexto, lo que situa el total en torno a 8-10 GB.
  - INT8: aproximadamente 3,4 GB de pesos.
  - INT4 (GGUF Q4_K_M y similares): aproximadamente 2,0-2,5 GB de pesos.
- GPU recomendadas:
  - Inferencia en FP16: NVIDIA RTX 3090, RTX 4090, A10G, L4, A100 40 GB o H100 (estas dos ultimas ampliamente sobredimensionadas para este tamano).
  - Inferencia cuantizada: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, Apple Silicon con 16 GB o mas de memoria unificada.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU con 8 GB o mas de VRAM en cuantizacion de 4 bits, y en GPU de 12-16 GB incluso en FP16.
- Opciones de despliegue: transformers (PyTorch), vLLM, Text Generation Inference (TGI), llama.cpp, Ollama y LM Studio. Para cuantizar a GGUF es necesario convertir los pesos safetensors con `llama.cpp` o herramientas equivalentes, ya que el repositorio no incluye artefactos GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicados | Notas |
|---|---|---|---|---|---|---|
| `ollybritton/Llama-3.2-3B-gsm8k-distill-radioactive-delta2` | 3,21B | No disponible (base: 128.000) | Llama 3.2 Community License | safetensors | No | Fine-tune experimental sin documentacion ni adopcion |
| `meta-llama/Llama-3.2-3B` | 3,21B | 128.000 tokens | Llama 3.2 Community License | safetensors | Si, publicados por Meta | Modelo base sin ajuste instructivo |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21B | 128.000 tokens | Llama 3.2 Community License | safetensors | Si, publicados por Meta | Variante alineada para instrucciones y tool calling |
| `Qwen/Qwen2.5-3B-Instruct` | 3,09B | 32.768 tokens | Apache 2.0 | safetensors | Si, publicados por Alibaba | Alternativa de tamano similar con licencia permisiva |
| `microsoft/Phi-3.5-mini-instruct` | 3,82B | 128.000 tokens | MIT | safetensors | Si, publicados por Microsoft | Enfasis en razonamiento y matematicas |

No se dispone de cifras de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas. La comparacion se limita, por tanto, a parametros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe el dataset de entrenamiento, el procedimiento, los hiperparametros ni las metricas, lo que impide reproducir o auditar el modelo.
- Sin benchmarks publicados: no hay evidencia publica de que el ajuste mejore realmente el rendimiento en GSM8K respecto al modelo base.
- Riesgo de olvido catastrofico: un ajuste centrado en un unico dataset de matematicas puede degradar las capacidades generales de generacion de texto, codigo y conversacion del modelo base. No se han publicado evaluaciones que descarten este efecto.
- Sesgos conocidos: no documentados por el autor. El modelo hereda los sesgos presentes en los datos de preentrenamiento de Llama 3.2, que no han sido analizados para este fine-tune.
- Riesgo de alucinacion: no evaluado. En tareas aritmeticas, la generacion paso a paso sin verificacion externa puede producir resultados incorrectos con una apariencia de razonamiento valido.
- Limitaciones de contexto e idioma: no documentadas. No se especifica si el ajuste preserva la ventana de contexto de 128.000 tokens del modelo base ni si mantiene el soporte multilingue.
- Restricciones de licencia: la licencia Llama 3.2 Community License no es de codigo abierto en sentido estricto. Impone obligaciones adicionales, como incluir el aviso "Built with Llama", mostrar la licencia junto al modelo y respetar la politica de uso aceptable de Meta. El uso comercial esta permitido con condiciones, pero en organizaciones con mas de 700 millones de usuarios mensuales se requiere una licencia adicional de Meta.
- Uso en produccion desaconsejado: dado el estado experimental del repositorio (0 descargas, 0 likes, sin evaluacion), no deberia desplegarse en entornos productivos sin una validacion exhaustiva previa.
- Fecha de publicacion inusual: el repositorio figura como creado en septiembre de 2026, lo que conviene verificar antes de citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ollybritton/Llama-3.2-3B-gsm8k-distill-radioactive-delta2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo ni demos.
