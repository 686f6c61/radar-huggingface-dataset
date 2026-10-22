# 0arch-io/kisoku-3b

## Resumen

Kisoku 3B es un modelo de lenguaje de 3,2B de parámetros (3.562.712.064 según los pesos publicados en safetensors) entrenado **desde cero** por 0ARCH, un proyecto independiente. No es un fine-tune de un modelo existente: la base se preentrenó con 60.000 millones de tokens durante diez días sobre TPUs y después se sometió a un ajuste por instrucciones. Se distribuye bajo licencia MIT y en formato GGUF Q8_0 listo para Ollama.

Su relevancia no es competitiva sino metodológica: demuestra qué puede conseguir un equipo muy pequeño (el autor lo describe como "lo que una persona puede entrenar") y documenta un fallo de entrenamiento poco habitual y su reparación. El vocabulario original de 128.000 tokens no coincidía con los 128.256 del tokenizer de Llama 3, de modo que 256 filas de embeddings especiales —incluido el token EOS— quedaron sin entrenar a cero; el modelo era incapaz de terminar un turno. La versión publicada incorpora un fine-tune de reparación de once minutos en 3 GPUs que llevó EOS del puesto ~4000 al puesto 1.

Arquitectura transformer estilo Llama con dimensión oculta 3072 y una ventana de contexto de 4096 tokens. En GGUF se exporta bajo la arquitectura **Granite** para que el escalado de logits del entrenamiento (división por ~55,4) se aplique en FP32 en tiempo de ejecución en lugar de quedar horneado en los pesos cuantizados. El autor ha marcado esta versión como superada por Kisoku 1.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Llama (dimensión oculta 3072); exportado en GGUF bajo la arquitectura Granite para preservar el escalado de logits |
| Parametros totales | 3.562.712.064 según safetensors; el autor declara 3,2B en la model card |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF publicado, "repaired"); no se documentan otras variantes en el repositorio |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (Q8_0) para Ollama/llama.cpp; el repositorio incluye pesos safetensors (3.8 GB de repo) y un `Modelfile` |
| Vocabulario | 128.000 tokens (tokenizer de Llama 3, 128.256 entradas; 256 filas especiales reparadas a posteriori) |
| Tokens de preentrenamiento | 60.000 millones |
| Escalado de logits | Logits divididos por ~55,4 en FP32 en tiempo de ejecución |
| Temperatura efectiva | Comprimida: 0,01 en este modelo equivale a ~0,55 en un modelo convencional (el `Modelfile` incluido lo configura) |

## Arquitectura y entrenamiento

El modelo es un transformer autoregresivo denso con disposición estilo Llama y 3072 dimensiones ocultas, preentrenado desde cero sobre 60.000 millones de tokens durante diez días en TPUs, seguido de un ajuste por instrucciones del que la model card no detalla la composición del dataset, el número de ejemplos ni si se emplearon RLHF o DPO. Sí se documenta el cómputo: 60B tokens sitúa el modelo muy por debajo de los regímenes de entrenamiento actuales (el propio autor señala que los grandes laboratorios usan "unos cientos de veces más texto").

La innovación técnica destacable es la reparación del vocabulario. El entrenamiento original usó 128.000 tokens frente a las 128.256 entradas del tokenizer de Llama 3, dejando 256 filas de embeddings especiales (EOS incluido) como ceros sin entrenar. La corrección consistió en un fine-tune de reparación con un *gradient hook* que enmascaraba todas las filas de embedding excepto esas 256, de forma que solo se entrenaron los tokens especiales y los pesos lingüísticos no pudieron degradarse; once minutos en 3 GPUs bastaron para llevar EOS del rango ~4000 al rango 1. Adicionalmente, el escalado de logits del entrenamiento se delega al runtime en FP32 mediante la arquitectura Granite en GGUF, lo que evita hornear la división por ~55,4 en pesos cuantizados pero comprime la temperatura efectiva: valores bajos como 0,01 se comportan como ~0,55 en un modelo normal. El `Modelfile` del repositorio ya ajusta este parámetro, por lo que usar el modelo fuera de ese flujo requiere recalibrar la temperatura.

## Capacidades

- Generación de texto conversacional en inglés, con ajuste por instrucciones (pipeline `text-generation`, tag `conversational`).
- Finalización de turnos correcta gracias al fine-tune de reparación de EOS (la versión original no podía terminar una respuesta).
- Conocimiento de su propia identidad (nombre y autor) por inclusión explícita en los datos de entrenamiento.
- Razonamiento básico y respuesta a instrucciones simples; el autor reconoce aritmética débil y errores factuales.
- Despliegue local vía Ollama con un `Modelfile` provisto, y compatibilidad con endpoints (`endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo "thinking".
- Multilingüe: no; únicamente inglés.
- Contexto largo: no; 4096 tokens.

## Casos de uso

- **Prototipado local de asistentes conversacionales**: con 3,8 GB de pesos Q8_0 y un `Modelfile` listo, permite levantar un chatbot funcional en un portátil Apple Silicon a ~75 tokens/s sin depender de API externa, útil para validar flujos de producto antes de invertir en un modelo mayor.
- **Evaluación de infraestructura de inferencia**: al ser un GGUF pequeño con arquitectura inusual (Granite en lugar de Llama), sirve para probar pipelines de llama.cpp/Ollama, verificar el manejo de arquitecturas no estándar y medir latencia en hardware modesto.
- **Investigación sobre entrenamiento desde cero**: reproduce y documenta un fallo real de alineación vocabulario-tokenizer y su reparación selectiva mediante *gradient hooks*, material directamente reutilizable en cursos y auditorías de pipelines de preentrenamiento.
- **Generación de texto offline en entornos aislados**: por su tamaño reducido y licencia MIT, encaja en escenarios sin conectividad (documentación interna, textos de relleno, resúmenes breves) donde no se puede recurrir a servicios en la nube.
- **Base para fine-tunes de dominio muy acotados**: al ser un modelo pequeño y permisivo en licencia, es un punto de partida económico para adaptar estilo o terminología de un nicho concreto mediante LoRA, siempre que la tarea no exija conocimiento factual fiable.
- **Testbed de calibración de parámetros de muestreo**: el escalado de logits por ~55,4 hace de este modelo un caso práctico para estudiar cómo la temperatura y el top-p interactúan con distribuciones comprimidas y cómo trasladar esa calibración a otros modelos.
- **Educación en arquitecturas transformer**: sus 3072 dimensiones ocultas y su configuración sencilla permiten inspeccionar embeddings, atención y logits sin la complejidad de un modelo de decenas de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estandarizada, y el autor remite a 0arch.io/kisoku para gráficas de benchmark sin que estos datos formen parte de la información proporcionada. El único dato de rendimiento disponible es de velocidad de inferencia: aproximadamente 75 tokens/s con el GGUF Q8_0 en un MacBook con Apple Silicon.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~3,8 GB para el GGUF Q8_0 publicado; ~7,1 GB en FP16 si se convierte desde safetensors; una cuantización Q4_K_M rondaría los 2,1-2,2 GB (no publicada en el repositorio).
- **Memoria KV cache**: reducida, al limitarse el contexto a 4096 tokens; en la práctica el peso del modelo domina el consumo.
- **GPU recomendadas**: cualquier GPU consumer con 6 GB o más de VRAM puede ejecutar la variante Q8_0; una RTX 3060 de 12 GB, RTX 4060 de 8 GB o RTX 4090 lo alojan sin problemas. Para FP16 bastan 8-10 GB (RTX 3080, RTX 4070 Ti, A10). No requiere A100 ni H100.
- **Cabe en GPU consumer**: sí, en toda la gama media y alta reciente, y también en Apple Silicon (dato del autor: ~75 tokens/s en MacBook).
- **Opciones de despliegue**: Ollama es la vía oficial y soportada (`ollama create kisoku -f Modelfile`); llama.cpp también es viable al ser GGUF. Se desconoce soporte en vLLM o TGI: la arquitectura Granite con escalado de logits en runtime y la compresión de temperatura hacen arriesgada una integración no documentada.
- **Latencia y throughput**: ~75 tokens/s en Apple Silicon con Q8_0 según el autor; no hay cifras publicadas para GPU dedicada ni para otras cuantizaciones.

## Comparativa con modelos similares

Los datos de los modelos de referencia provienen de conocimiento público general y no han podido verificarse en la búsqueda realizada; se marcan como tal.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Kisoku 3B | 3,56B (declara 3,2B) | 4096 | en | MIT | Entrenado desde cero con 60B tokens; sin benchmarks publicados; autor lo marca como superado |
| Kisoku 1.6B | no disponible en la informacion | no disponible | no disponible | no disponible | Sucesor oficial según la model card; misma familia y autor |
| Llama 3.2 3B (referencia) | ~3,2B | hasta 128.000 | multilingüe | licencia comunitaria Llama 3.2 | Entrenamiento con órdenes de magnitud más de datos; requiere aceptar la licencia, no es MIT |
| Qwen2.5 3B (referencia) | ~3,1B | ~32.000 | multilingüe | Apache 2.0 | Amplia familia de cuantizaciones y soporte en vLLM/TGI |

La diferencia práctica no está en el tamaño sino en la madurez: frente a Llama 3.2 3B o Qwen2.5 3B, Kisoku 3B ofrece licencia MIT plena y un interés documental sobre el entrenamiento desde cero, pero carece de benchmarks, de soporte multilingüe y de un contexto utilizable más allá de 4096 tokens.

## Limitaciones y advertencias

- **Alucinación elevada**: el propio autor advierte que el modelo "se equivoca en los hechos e inventa cosas con confianza"; no debe usarse como asistente de producción ni como fuente de información.
- **Aritmética débil**: el razonamiento numérico está explícitamente señalado como punto flaco.
- **Datos de entrenamiento limitados**: 60B tokens frente a cientos de veces más en modelos de laboratorios grandes, lo que se traduce en conocimiento del mundo y cobertura lingüística reducidos.
- **Solo inglés**: no hay soporte declarado de castellano ni de otros idiomas; el rendimiento fuera del inglés no está evaluado y previsiblemente será pobre.
- **Contexto corto**: 4096 tokens impiden casos de uso con documentos largos, conversaciones extensas o agentes con historial amplio.
- **Temperatura no estándar**: el escalado de logits por ~55,4 comprime la temperatura (0,01 equivale a ~0,55). Usar el modelo sin el `Modelfile` incluido produce respuestas degeneradas o repetitivas; hay que recalibrar los parámetros de muestreo.
- **Historial de EOS defectuoso**: las versiones anteriores del checkpoint no podían terminar un turno. Aunque la versión publicada está reparada, conviene verificar la finalización de secuencia si se parte de pesos propios o de una conversión distinta.
- **Versión superada**: el autor recomienda Kisoku 1.6B como versión actual; esta ficha corresponde a un lanzamiento obsoleto.
- **Sin benchmarks**: no hay métricas publicadas que permitan estimar calidad de forma objetiva, y la adopción es mínima (13 descargas, 1 like en el momento de la consulta).
- **Licencia**: MIT permite uso comercial y modificación sin restricciones prácticas, pero se distribuye "tal cual", sin garantías ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0arch-io/kisoku-3b
- Sucesor, Kisoku 1.6B: https://huggingface.co/0arch-io/kisoku-1.6b
- Página del proyecto (log de entrenamiento, gráficas de benchmark e instrucciones de ejecución): https://0arch.io/kisoku
- Sitio del autor, 0ARCH: https://0arch.io
- Paper, blog técnico adicional, repositorio de código y demo: no disponibles en la información proporcionada. La búsqueda web realizada no devolvió resultados relacionados con el modelo.
