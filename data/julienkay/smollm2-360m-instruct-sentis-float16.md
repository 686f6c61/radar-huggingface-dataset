# julienkay/SmolLM2-360M-Instruct-sentis-float16

## Resumen

SmolLM2-360M-Instruct-sentis-float16 es una conversión no oficial del modelo SmolLM2-360M-Instruct de Hugging Face al formato `.sentis` propietario de Unity Inference Engine (anteriormente Sentis), realizada por el usuario julienkay. El modelo original es un transformer decoder-only de 360 millones de parámetros entrenado por Hugging Face, diseñado para generación de texto e instrucciones en entornos con recursos limitados. Esta conversión concreta no modifica los pesos ni el entrenamiento: únicamente transforma el grafo ONNX exportado a un fichero `.sentis` con pesos cuantizados a float16, pensado para su uso dentro del motor de inferencia de Unity.

La relevancia de esta ficha es acotada y muy específica: no se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto de despliegue para desarrolladores de videojuegos y aplicaciones Unity que quieran ejecutar un LLM pequeño en el dispositivo (GPU o CPU) sin depender de servicios externos. El fichero `model.sentis` ocupa 0,76 GiB, la mitad que la conversión equivalente en float32 (1,52 GiB), y se carga directamente sin conversión adicional mediante el paquete `tools.doji.transformers`.

El modelo base SmolLM2-360M-Instruct forma parte de la familia SmolLM2 de Hugging Face, orientada a dispositivos edge y aplicaciones con presupuesto de cómputo y memoria muy reducidos. Esta conversión hereda la licencia Apache 2.0 del original y mantiene los ficheros de configuración y tokenizador del modelo de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo LlamaForCausalLM), exportado a ONNX y convertido a formato `.sentis` |
| Parametros totales | 360 millones (modelo base SmolLM2-360M-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | float16 para pesos de capas MatMul, Gemm, Conv, ConvTranspose y Gather; float32 para tensores de rango 1 (pesos de normalizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.sentis` (Unity Inference Engine), generado desde ONNX; tamano del fichero 0,76 GiB |
| Version de Inference Engine | 2.6 (fichero guardado con esta version) |
| Tamano del repositorio | 0,8 GB |
| Modelo base | HuggingFaceTB/SmolLM2-360M-Instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo SmolLM2-360M-Instruct de Hugging Face: un transformer decoder-only con atención causal estándar, orientado a generación de texto autoregresiva. Esta conversión no aporta información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF o DPO); la model card remite explícitamente a la model card original para esos detalles. Lo único documentado aquí es el proceso de conversión.

El proceso de conversión parte de la exportación ONNX publicada en `julienkay/SmolLM2-360M-Instruct-onnx`. Mediante `tools.doji.onnx-model-loader`, se ejecuta `OnnxModelLoader.Save(onnxPath, sentisPath, QuantizationType.Float16)`, que escribe los pesos del fichero ONNX al `.sentis` uno a uno, sin mantener todos los pesos en memoria simultáneamente. Los pesos se almacenan en float16 en el dispositivo y se convierten a float32 justo antes de la capa que los lee por primera vez, de modo que solo existen copias float32 para las capas que están ejecutándose. El autor justifica float16 porque SmolLM2 se entrenó en bfloat16 y, por tanto, float16 representa sus pesos casi exactamente.

La validación reportada por el autor se realizó en Unity con la clase `LlamaForCausalLM` de `tools.doji.transformers`, en GPU, comparando contra la conversión float32 del mismo ONNX. Con cuatro prompts de chat y decodificación greedy de 48 tokens nuevos, se obtuvo el mismo siguiente token en 4 de 4 casos, con una divergencia KL media de 9,34E-12, y la misma respuesta greedy en 4 de 4 casos. Es una validación de equivalencia numérica, no de calidad del modelo.

## Capacidades

- Generación de texto autoregresiva y seguimiento de instrucciones, heredadas del modelo base SmolLM2-360M-Instruct.
- Conversación multi-turno mediante plantilla de chat (el tokenizador y la configuración son los del modelo original).
- Ejecución dentro de Unity Inference Engine en formato `.sentis`, cargable directamente sin conversión adicional.
- Inferencia en GPU dentro de Unity (la validación se realizó en GPU), con pesos float16 en dispositivo.
- No se documentan en esta model card capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Diálogos con NPC en videojuegos Unity: el modelo se integra mediante `AutoModelForCausalLM.FromPretrainedAsync` y `AutoTokenizer.FromPretrainedAsync` del paquete `tools.doji.transformers`, permitiendo conversaciones generadas en el dispositivo sin llamadas a servidores externos. Su tamaño de 0,76 GiB en float16 lo hace viable en hardware de consumo.
- Asistentes conversacionales embebidos en aplicaciones Unity de escritorio: al ejecutarse localmente con Unity Inference Engine, se evita la latencia de red y la dependencia de APIs de terceros, algo relevante en aplicaciones offline o con requisitos de privacidad.
- Prototipado rápido de mecánicas de lenguaje natural en juegos: al ser un modelo de 360 M de parámetros, la iteración sobre prompts y plantillas de chat es rápida y el coste de integración es bajo dentro del ecosistema Doji.
- Generación de texto auxiliar en herramientas de autoría dentro del editor de Unity: descripciones, diálogos de relleno o variaciones de texto que el diseñador puede generar y revisar sin salir del entorno.
- Evaluación comparativa de motores de inferencia en Unity: el autor documenta un método de validación (equivalencia float16 frente a float32 con divergencia KL y coincidencia greedy) que sirve como plantilla para validar otras conversiones.
- Aplicaciones educativas o demos de IA en Unity: al ser un modelo pequeño con licencia Apache 2.0, es adecuado para talleres, tutoriales y pruebas de concepto sobre inferencia local de LLM en motores de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una validación de equivalencia numérica entre la conversión float16 y la float32 (mismo siguiente token en 4 de 4 prompts, divergencia KL media de 9,34E-12, misma respuesta greedy en 4 de 4 casos), que no constituye una evaluación de calidad del modelo.

## Requisitos de hardware

- VRAM estimada: el fichero `model.sentis` ocupa 0,76 GiB en float16; la conversión float32 equivalente ocupa 1,52 GiB. A esto hay que sumar el estado de ejecución (KV cache, activaciones y copias float32 temporales de las capas en ejecución), cuyo tamaño exacto no está documentado.
- GPU recomendadas: no disponibles en la información proporcionada. La validación se realizó en GPU dentro de Unity, pero no se especifica el modelo de GPU utilizado.
- Compatibilidad con GPU de consumo: por el tamaño del fichero (0,76 GiB), es plausible en GPU de consumo con suficiente memoria libre, pero no se confirma en la documentación disponible.
- Opciones de despliegue: exclusivamente Unity Inference Engine 2.6 (o versión compatible) mediante el paquete `tools.doji.transformers`, cargando `model.sentis` directamente. El autor advierte que una versión posterior de Inference Engine podría requerir reconvertir el fichero desde el ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct-sentis-float16 (este) | 360 M | `.sentis` float16 | no disponible | Apache 2.0 | Conversión no oficial para Unity Inference Engine; 0,76 GiB |
| SmolLM2-360M-Instruct (original) | 360 M | safetensors (formato Hugging Face) | no disponible | Apache 2.0 | Modelo base de Hugging Face; requiere transformers u otro runtime compatible |
| SmolLM2-360M-Instruct-onnx (del mismo autor) | 360 M | ONNX | no disponible | Apache 2.0 | Exportación intermedia usada para generar el `.sentis`; sirve para runtimes ONNX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la única comparación documentada es la equivalencia numérica entre la conversión float16 y float32 del mismo ONNX.

## Limitaciones y advertencias

- Conversión no oficial: no está publicada por Hugging Face ni por Unity, sino por un tercero (julienkay). La responsabilidad de validación en producción recae en el usuario.
- Versión de Inference Engine: el fichero se guardó con Inference Engine 2.6; versiones posteriores podrían requerir reconversión desde el ONNX.
- Dependencia de un paquete de terceros: el uso práctico requiere `tools.doji.transformers` y, para la conversión, `tools.doji.onnx-model-loader`, ambos mantenidos por el mismo autor.
- Modelo base pequeño: con 360 M de parámetros, la calidad de razonamiento, el conocimiento factual y la robustez frente a instrucciones complejas son limitadas en comparación con modelos de mayor tamaño; el riesgo de alucinación es inherente al modelo base.
- Sin datos de sesgos, idiomas ni evaluación de calidad en esta model card: se remite a la model card original de SmolLM2-360M-Instruct.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente; el autor indica que se aplican los términos originales.
- Sin métricas de latencia ni throughput publicadas: no es posible estimar el rendimiento en producción a partir de la documentación disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/SmolLM2-360M-Instruct-sentis-float16
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Exportación ONNX intermedia: https://huggingface.co/julienkay/SmolLM2-360M-Instruct-onnx
- Paquete `tools.doji.transformers`: https://github.com/julienkay/tools.doji.transformers
- Paquete `tools.doji.onnx-model-loader`: https://github.com/julienkay/tools.doji.onnx-model-loader
- Documentación de Unity Inference Engine: https://docs.unity3d.com/Packages/com.unity.ai.inference@latest
