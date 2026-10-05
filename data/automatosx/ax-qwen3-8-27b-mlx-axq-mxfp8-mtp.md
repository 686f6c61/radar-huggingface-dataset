# AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP es un checkpoint cuantizado de Qwen3.8-27B publicado por AutomatosX bajo su formato propietario AXQuant (AXQ), pensado especificamente para ejecucion en Apple Silicon mediante MLX. Se genera por conversion directa desde el modelo BF16 original de Alibaba, manteniendo la ruta de lenguaje cuantizada en precision mixta mientras preserva en BF16 la cabeza de prediccion multi-token (MTP) y la torre de vision. El autor lo etiqueta explicitamente como "evidencia de desarrollo" y advierte de que no publica mediciones de calidad, contexto largo, velocidad de kernel ni aceleracion MTP.

El modelo deriva de Qwen/Qwen3.8-27B, un LLM denso multimodal nativo de la familia Qwen3.8, con arquitectura Qwen3_5ForConditionalGeneration. La ruta de texto queda optimizada y ocupa la practica totalidad del peso: 26,89B parametros en 8 bits (96,80 % de los tensores) y 888,07M parametros en BF16 (3,20 %). El presupuesto de almacenamiento se situa en 8,3813 BPW para el modelo principal y 8,4978 BPW total incluyendo la cabeza MTP, con un tamano de pesos de 29,51 GB y una descarga completa aproximada de 29,54 GB.

Su relevancia es acotada y muy especifica: cubre el nicho de despliegue local en Mac con ventana de contexto configurada de 262.144 tokens y soporte de vision, algo poco frecuente en checkpoints MLX de este tamano. No obstante, al no incluir un manifiesto nativo validado para AX Engine ni evidencia de rendimiento, debe tratarse como un artefacto para evaluacion y prototipado, no como un paquete certificado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso multimodal, ruta de texto optimizada) |
| Parametros totales | 26.895.993.856 segun safetensors; 27,36B parametros logicos segun model card |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (maximo configurado; los limites practicos dependen de la memoria unificada) |
| Tipos de cuantizacion | Precision mixta AXQuant: 8bit afin (26,89B, 96,80 %) y bf16 (888,07M, 3,20 %); tamano de grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX Safetensors (no incluye pesos PyTorch ni GGUF) |

Datos adicionales del artefacto: quantizer AXQuant 1.9.0, clase de presupuesto de Hub MXFP8, clase de precision base 16p0bpw, BPW medido del modelo principal 8,3813, BPW total medido incluyendo MTP 8,4978. Sidecar MTP: 15 tensores, 424,70M parametros, 0,85 GB en BF16. Sidecar de vision: 333 tensores, 460,73M parametros, 0,92 GB en BF16. Ambito de optimizacion: text-path. Nivel de soporte: convertible.

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso multimodal de la familia Qwen3.8, identificado en la model card como Qwen3_5ForConditionalGeneration, con la ruta de lenguaje optimizada. No se trata de un modelo MoE ni de una arquitectura hibrida SSM, y la ficha no aporta datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Esos datos corresponden al modelo base original de Alibaba, no a este checkpoint, que es una conversion cuantizada y no un reentrenamiento.

La innovacion tecnica relevante esta en el proceso AXQuant: una cuantizacion de precision mixta que asigna distintos niveles de bits por tensor segun su sensibilidad, manteniendo protegidos en BF16 los tensores criticos. El resultado es un empaquetado de 8bit con una tasa efectiva de 8,3813 BPW en el modelo principal. Se preservan dos componentes funcionales relevantes: la cabeza MTP (multi-token prediction), almacenada en el sidecar `mtp.safetensors` y declarada con el contrato de ejecucion `qwen3-next-mtp`, y la torre de vision, en el sidecar BF16 `vision.safetensors`. Conviene subrayar que MLX-LM estandar cubre solo la inferencia de texto/backbone y puede ignorar tanto la metadata de AXQuant como los sidecars opcionales, por lo que ni la aceleracion MTP ni la calidad vision-lenguaje quedan establecidas con ese comando.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado de text-generation y tag conversational.
- Razonamiento y codigo heredados del modelo base Qwen3.8-27B, orientado por Alibaba a coding, flujos agenticos y automatizacion de oficina (segun el repositorio oficial del modelo base).
- Capacidades multimodales de vision: el checkpoint incluye una torre de vision en BF16, aunque su uso efectivo requiere un runtime consciente de sidecars; MLX-LM estandar no la activa.
- Prediccion multi-token (MTP) para decodificacion especulativa, empaquetada en el sidecar `mtp.safetensors` y declarada con el contrato `qwen3-next-mtp`.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint; el modelo base Qwen3.8-27B esta orientado a flujos agenticos, pero no hay verificacion especifica.
- Capacidades de agente y razonamiento multi-paso: atribuibles al modelo base, no verificadas en esta conversion.
- Multilingue: no disponible (no se enumeran idiomas en la informacion proporcionada).
- Audio: no soportado (campo `Audio present: False`).
- Ventana de contexto configurada de 262.144 tokens, supeditada a la memoria unificada disponible.

## Casos de uso

- Despliegue local en Mac para desarrollo: cargar el checkpoint con MLX-LM sobre un equipo Apple Silicon permite prototipar generacion de texto con un modelo de ~27B sin salir del ecosistema MLX, aprovechando que los pesos estan ya en el formato nativo y no requieren conversion previa.
- Procesamiento de documentos largos: con 262.144 tokens de contexto configurado, encaja en tareas de resumen, extraccion y preguntas sobre repositorios de codigo, expedientes o corpus extensos, siempre que la memoria unificada del equipo lo permita.
- Evaluacion de tecnicas de cuantizacion: dado que el autor lo publica como evidencia de desarrollo, resulta util como objeto de estudio para comparar el impacto de la precision mixta AXQuant frente a los hermanos de 4 y 6 bits sobre las mismas tareas.
- Experimentacion con decodificacion especulativa: la cabeza MTP en sidecar permite probar aceleracion de generacion en runtimes que la soportan (oMLX 0.6.3rc2 o superior, o MTPLX), midiendo por cuenta propia la ganancia de velocidad, ya que el autor no la certifica.
- Pipelines internos de asistencia al desarrollo: integrado en herramientas de autocompletado o revision de codigo sobre estaciones de trabajo Mac, heredando las capacidades de coding del base Qwen3.8-27B.
- Pruebas de concepto de vision-lenguaje: al conservar la torre de vision en BF16, puede emplearse para validar flujos de descripcion de imagenes o analisis de capturas, siempre con un runtime que cargue el sidecar de vision.
- Flujos agenticos con contexto largo: candidato a bases de conocimiento conversacionales o agentes de investigacion que necesiten retener mucha informacion en ventana, pendiente de verificacion de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card advierte de que el paquete incluye registros de conversion e integridad de artefactos, pero no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad MTP, y pide no interpretar la etiqueta AXQ como una afirmacion de benchmark.

## Requisitos de hardware

- VRAM o memoria unificada estimada: con 29,51 GB de pesos y 29,54 GB de descarga completa, se necesita previsiblemente un equipo con al menos 36 GB de memoria unificada para cargar el modelo completo con margen para el contexto; 48-64 GB o mas es lo recomendable para aprovechar la ventana larga. Cifra estimada a partir del tamano de pesos, no publicada por el autor.
- GPU recomendadas: este checkpoint es especifico de Apple Silicon (MLX), por lo que el hardware objetivo son chips de la serie M de Apple; las GPU NVIDIA tipo A100, H100 o RTX 4090 no son el destino de este artefacto, ya que no se distribuyen pesos PyTorch ni GGUF.
- Cabe en GPU de consumo: no con este paquete de 8 bits. El hermano AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP se referencia en terceros con una estimacion de ~16,4 GB de VRAM, lo que si podria aproximarse al rango de una RTX 4090 de 24 GB, aunque siempre dentro de una ruta de ejecucion CUDA distinta a la de este repo.
- Opciones de despliegue: MLX-LM (ruta principal, solo texto/backbone), oMLX 0.6.3rc2 o superior para importar el sidecar MTP, y MTPLX para consumir directamente el sidecar con el contrato `qwen3-next-mtp`. La ejecucion nativa en AX Engine no queda establecida por este release, al no incluir un `model-manifest.json` nativo validado. No aplica vLLM, llama.cpp, Ollama ni TGI en su forma habitual por la ausencia de pesos GGUF y PyTorch.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad, y la propia model card indica que la compatibilidad con MLX-LM no establece aceleracion MTP ni calidad vision-lenguaje.
- Almacenamiento: reservar al menos 29,54 GB de disco libre. El autor recomienda fijar el commit del Hub en despliegues reproducibles en lugar de depender indefinidamente de `main`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AX-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP (este) | 26,9B-27,36B | 262.144 tokens | 8,3813 BPW principal; 8,4978 BPW con MTP; 29,51 GB | apache-2.0 | MLX Safetensors; MTP y vision en BF16 |
| AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP | no disponible | no disponible | Presupuesto cercano a 6 BPW (BPW exacto no disponible) | apache-2.0 | MLX; menor almacenamiento, mayor precision media esperada |
| AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP | no disponible | no disponible | Estimado ~16,4 GB de VRAM por terceros | apache-2.0 | MLX; presupuesto de menor almacenamiento |
| Qwen/Qwen3.8-27B (base) | 27,36B logicos | no disponible | BF16 | apache-2.0 | Modelo original de Alibaba, denso y multimodal |

El rendimiento comparado de calidad entre los tres hermanos AXQ no esta publicado: la model card insiste en que las etiquetas de bits describen una clase de presupuesto de almacenamiento y no una precision uniforme, por lo que el BPW medido es el dato autoritativo. No se dispone de comparativas con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Estado de desarrollo: el autor declara explicitamente que no es un release AXQuant certificado y que no publica evidencia medida de calidad, contexto largo, velocidad de kernel ni velocidad MTP. No debe usarse como afirmacion de rendimiento.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada para este checkpoint.
- Ejecucion en AX Engine no establecida: no se incluye un `model-manifest.json` nativo validado; los campos de AX Engine en `axquant_runtime.json` describen un contrato de compatibilidad previsto, no evidencia observada.
- MTP y vision no activos por defecto: MLX-LM estandar puede ignorar la metadata de AXQuant y los sidecars, de modo que el comando de ejemplo no establece aceleracion MTP ni calidad vision-lenguaje. Se requiere un runtime consciente de sidecars y descargar el repositorio completo en un directorio local con permisos de escritura.
- Idiomas no especificados: la informacion proporcionada no enumera los idiomas soportados, por lo que no puede garantizarse cobertura multilingue concreta.
- Contexto limitado por hardware: los 262.144 tokens son el maximo configurado; el limite real dependera de la memoria unificada del equipo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de los LLM densos de esta escala.
- Sesgos: no disponibles.
- Licencia: apache-2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y tener en cuenta que el autor no ofrece garantias de calidad sobre esta conversion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la ficha, sin validacion por parte de la comunidad.
- Reproducibilidad: se recomienda fijar el commit del Hub; la rama `main` puede cambiar.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-MXFP8-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-4bit-MTP
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-6bit-MTP
- Hermano 8bit: https://huggingface.co/AutomatosX/AX-Qwen3.8-27B-MLX-AXQ-8bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha en LLM Explorer (hermano 4bit): https://llm-explorer.com/model/AutomatosX%2FAX-Qwen3.8-27B-MLX-AXQ-4bit-MTP,3YELRO13NJAe8YGKWHE59E
- Ficha en LLM Explorer (hermano 6bit): https://llm-explorer.com/model/AutomatosX%2FAX-Qwen3.8-27B-MLX-AXQ-6bit,2YxyUvQWw6T0cz8MLThwSe
