# McG-221/Dark-Goetia-26B-A4B-v4-mlx-8Bit

## Resumen

Dark-Goetia-26B-A4B-v4-mlx-8Bit es una conversión al formato MLX con cuantización de 8 bits del modelo base 26B-Suite/Dark-Goetia-26B-A4B-v4, realizada por McG-221. El modelo original pertenece a la familia Goetia, diseñada específicamente para roleplay y conversación, con soporte para inglés y ruso. La nomenclatura A4B indica que se trata de una arquitectura de mezcla de expertos (MoE) con 26 000 millones de parámetros totales y 4 000 millones activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional.

Esta versión MLX está pensada para su ejecución en dispositivos Apple Silicon mediante la librería mlx-lm, aunque también puede utilizarse en otros entornos con soporte MLX. Al estar cuantizada a 8 bits, reduce los requisitos de memoria frente al modelo original, que ocupa aproximadamente 51,6 GB en precisión completa, mientras que esta versión ocupa 26,8 GB. El modelo se distribuye bajo licencia Gemma, lo que implica ciertas restricciones de uso que deben revisarse antes de su adopción en producción.

La relevancia de este modelo radica en su especialización para tareas de roleplay y generación de diálogo conversacional, un nicho donde la calidad de la narrativa y la coherencia del personaje son críticas. Su naturaleza MoE con solo 4B parámetros activos lo hace más eficiente que un modelo denso equivalente, y la conversión MLX facilita su despliegue en hardware de Apple, ampliando las opciones de ejecución local para desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Gemma 4 (inferida por tag `gemma4`) |
| Parametros totales | 25 233 053 440 (25,2 B) |
| Parametros activos | 4 B (inferido de la nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit (esta version); el modelo base puede tener otras |
| Idiomas soportados | ingles, ruso |
| Licencia | Gemma |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es de mezcla de expertos (MoE), como indica el sufijo A4B en el nombre del modelo base: 26B parámetros totales con 4B activos por token. Esta configuración permite que el modelo active solo una fracción de sus parámetros durante la inferencia, reduciendo el coste computacional y la latencia en comparación con un modelo denso del mismo tamaño. El tag `gemma4` sugiere que la arquitectura subyacente se basa en la familia Gemma 4 de Google, aunque no se dispone de detalles adicionales sobre la implementación exacta.

No se ha publicado información sobre el proceso de entrenamiento del modelo base, como el número de tokens, la composición del dataset o si se emplearon técnicas de RLHF o DPO. La conversión a MLX se realizó con la librería mlx-lm versión 0.31.2, que transforma los pesos del formato original al formato MLX optimizado para Apple Silicon, manteniendo la funcionalidad del modelo sin cambios en su comportamiento.

## Capacidades

- Generacion de texto conversacional y narrativo, especializado en roleplay y dialogo de personajes.
- Soporte multilingue para ingles y ruso, con capacidad de alternar entre ambos idiomas en una misma conversacion.
- Integracion con herramientas de roleplay como SillyTavern, segun los tags del modelo.
- Ejecucion local en dispositivos Apple Silicon mediante mlx-lm, con cuantizacion de 8 bits para reducir el uso de memoria.
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, vision o audio.

## Casos de uso

- Roleplay interactivo en SillyTavern: el modelo puede generar respuestas coherentes y contextuales para personajes ficticios, manteniendo la personalidad y el tono a lo largo de conversaciones multi-turno. Su especializacion en roleplay lo hace adecuado para esta tarea.
- Chatbots conversacionales en ingles y ruso: puede utilizarse como base para asistentes de conversacion general, aprovechando su capacidad multilingue y su entrenamiento orientado a dialogo.
- Generacion de narrativa creativa: escritores y creadores de contenido pueden emplearlo para generar historias, dialogos y descripciones, especialmente en contextos de fantasia oscura o tematica goetica, dado el nombre del modelo.
- Prototipado rapido de aplicaciones de texto en Apple Silicon: al estar en formato MLX, los desarrolladores pueden integrarlo en aplicaciones macOS o iOS sin necesidad de infraestructura GPU dedicada.
- Experimentacion con modelos MoE cuantizados: investigadores pueden estudiar el comportamiento de un MoE de 26B con 4B activos en tareas de generacion de texto, comparando su eficiencia y calidad frente a modelos densos.
- Despliegue en entornos con memoria limitada: la cuantizacion de 8 bits reduce los requisitos de VRAM a aproximadamente 26,8 GB, lo que permite su ejecucion en GPUs de 32 GB o en configuraciones de memoria unificada de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 26,8 GB en cuantizacion MLX 8-bit, segun el tamano del repositorio.
- GPU recomendadas: para ejecucion en CUDA, se necesitaria una GPU con al menos 32 GB de VRAM, como A100 40GB o RTX A6000. En Apple Silicon, se recomienda un chip con al menos 32 GB de memoria unificada (M1 Pro/Max o superior).
- No cabe en GPUs de consumo de 24 GB o menos en esta cuantizacion; se requeriria una cuantizacion de 4 bits o menor, no disponible en esta version.
- Opciones de despliegue: mlx-lm para Apple Silicon; tambien puede ejecutarse con librerias que soporten safetensors y arquitecturas MoE, como vLLM o Transformers, aunque no se ha verificado su compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dark-Goetia-26B-A4B-v4 (base) | 26B totales, 4B activos | no disponible | Gemma | safetensors | Modelo original sin cuantizar, VRAM ~51,6 GB |
| Dark-Goetia-26B-A4B-v2-mlx-8Bit | 26B totales, 4B activos | no disponible | Gemma | MLX 8-bit | Version anterior del mismo autor |
| Phoenix X 26B A4B Mlx 8Bit | 26B totales, 4B activos | no disponible | no disponible | MLX 8-bit | Otro modelo similar de McG-221 |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado para roleplay, puede reflejar estereotipos o sesgos presentes en los datos de entrenamiento, especialmente en contextos de fantasia oscura o tematicas goeticas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inconsistente, especialmente en tareas factuales fuera de su dominio de especializacion.
- Limitaciones de contexto: no se ha especificado la longitud de contexto; se recomienda verificar el modelo base para conocer el limite real.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones sobre usos prohibidos y requisitos de atribucion. Debe revisarse el texto completo de la licencia antes de uso comercial.
- Idioma: solo se garantiza soporte para ingles y ruso; el rendimiento en otros idiomas puede ser deficiente.
- Produccion: al ser una conversion reciente con cero descargas y cero likes, no hay evidencia de estabilidad en entornos de produccion. Se recomienda realizar pruebas exhaustivas antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/McG-221/Dark-Goetia-26B-A4B-v4-mlx-8Bit
- Modelo base: https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v4
- Version v2 del mismo autor: https://huggingface.co/McG-221/Dark-Goetia-26B-A4B-v2-mlx-8Bit
- Modelo similar Phoenix X: https://llm-explorer.com/model/McG-221%2FPhoenix-X-26B-A4B-mlx-8Bit,5u9xWJJ6vD8QdxmuVCZcUA
- Informacion sobre Dark Goetia v2: https://llm-explorer.com/model/26B-Suite%2FDark-Goetia-26B-A4B-v2,4jKrd0ESJ6M9VrfeTcDy93
