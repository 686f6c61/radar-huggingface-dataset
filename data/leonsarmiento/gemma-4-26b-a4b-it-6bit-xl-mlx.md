# leonsarmiento/gemma-4-26B-A4B-it-6bit-XL-mlx

## Resumen

Este modelo es una version cuantizada en formato MLX del modelo base google/gemma-4-26B-A4B-it, creada por leonsarmiento. Se trata de un modelo de mezcla de expertos (MoE) multimodal, con 25,8 mil millones de parametros totales y aproximadamente 3,8 mil millones de parametros activos por token, gracias a sus 128 expertos por capa. Incorpora un codificador de vision que permite procesar imagenes junto a texto, y esta optimizado para Apple Silicon mediante la tecnica de cuantizacion BaseQuant_XL 6/8 bits, que asigna precision segun el rol arquitectonico sin depender de datos de calibracion.

El modelo ofrece un rendimiento notable en benchmarks de razonamiento, codigo y conocimiento general, como atestiguan los resultados en MMLU (76%), MMLU_PRO (82%) y HumanEval (98%) con muestreo de 50 ejemplos. Ademas, se ha sincronizado el chat template con el canonico de Gemma 4 de Google, corrigiendo bucles de tool calling y problemas de orden en el modo de pensamiento. Es una opcion atractiva para desarrolladores que desean ejecutar un modelo de gran capacidad en hardware local de Apple con 48 GB de memoria unificada, sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal, transformer con vision encoder |
| Parametros totales | 25.782.252.592 (25,8 B) |
| Parametros activos | 3,8 B por token (128 expertos por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BaseQuant_XL 6/8 bits: capas criticas en bf16, embed_tokens a 8 bits, resto a 6 bits (grupo 64); existe tambien version 2 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Este modelo es una conversion a MLX del modelo base google/gemma-4-26B-A4B-it, no un modelo entrenado desde cero. El modelo base es un transformer MoE con 128 expertos por capa y un promedio de 3,8 B de parametros activos por token. El codificador de vision se mantiene y, segun la tabla de cuantizacion, se conserva en bf16, aunque la descripcion del autor menciona cuantizacion a 6 bits; se trata de una inconsistencia documental. El resto de parametros se cuantizan con la tecnica BaseQuant_XL, que asigna la precision por rol arquitectonico: el router.proj (compuerta) y el mlp compartido/denso se conservan en bf16 para preservar el enrutamiento, mientras que los parametros masivos de los expertos se reducen a 6 bits con agrupacion de 64. Esta tecnica es agnostica a datos, es decir, no utiliza conjunto de calibracion ni analisis de sensibilidad, lo que evita sesgos hacia dominios representados en los datos de calibracion. El chat template se ha sincronizado con el canonico de Gemma 4 (publicado el 2025-07-09), corrigiendo problemas de tool calling y del orden del contenido de pensamiento. No se dispone de informacion sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF/DPO.

## Capacidades

- Multimodal: procesa imagenes y texto (pipeline image-text-to-text) gracias al codificador de vision preservado.
- Razonamiento en modo de pensamiento: muestras evaluadas con thinking mode, mostrando eficiencia en la generacion de cadenas de razonamiento.
- Generacion de codigo: alta puntuacion en HumanEval (98%) y MBPP (82%) en evaluaciones locales.
- Conocimiento general y razonamiento: puntuaciones de 76% en MMLU y 82% en MMLU_PRO.
- Tool calling / function calling: el chat template actualizado corrige bucles de tool calling y cierres de turno, permitiendo uso en agentes.
- Soporte de agentes: capacidades de multi-step reasoning y tool calling.
- Eficiencia en inferencia local: cuantizacion optimizada para Apple Silicon, con un tamano de 22,8 GB en disco.

## Casos de uso

- Asistente multimodal local en Macs de 48 GB: al ejecutarse de forma nativa en MLX, puede analizar imagenes y responder preguntas sobre ellas sin conexion, lo que lo hace util para tareas de vision documental o descripcion de capturas de pantalla en el escritorio.
- Generacion de codigo en el entorno de desarrollo: con resultados sobresalientes en HumanEval y MBPP, puede integrarse en editores o herramientas de autocompletado para sugerir funciones, arreglar errores y generar tests, ejecutandose localmente para respetar la privacidad del codigo.
- Razonamiento matematico largo y estructurado: la evaluacion en MATHQA con modo de pensamiento muestra una mayor eficiencia en caracteres de razonamiento por respuesta correcta, lo que lo hace adecuado para tutores de matematicas o aplicaciones de resolucion de problemas paso a paso.
- Desarrollo de agentes con herramientas: la sincronizacion del chat template resuelve bucles de tool calling, por lo que es candidato a servir de cerebro en agentes que necesitan llamar funciones de forma fiable, como APIs de busqueda, calculo o bases de datos.
- Investigacion en cuantizacion y evaluacion de modelos: al ser una cuantizacion agnostica a datos (BaseQuant_XL), resulta util para comparar el efecto de la cuantizacion en el rendimiento real frente a metodos dependientes de calibracion, como AWQ o GPTQ, en escenarios de investigacion.
- Analisis de eficiencia de razonamiento: los datos de comparacion con Qwen3.6-35B en razonamiento (29% menos caracteres por respuesta correcta) permiten estudiar el coste computacional y el consumo de ventana de contexto en tareas de pensamiento, util para decidir el modelo en sistemas con restricciones de contexto.
- Aplicaciones de vision-lenguaje embebidas en dispositivos Apple: gracias a su naturaleza multimodal y cuantizacion 6 bits, puede integrarse en prototipos o apps para macOS que necesiten entender contenido visual sin enviar datos a servidores.

## Benchmarks y rendimiento

El autor proporciona una evaluacion comparativa en modo instruct (sin pensamiento) con 50 muestras por benchmark. Los intervalos de confianza al 95% son amplios (±13%), por lo que diferencias menores de 6 puntos pueden no ser estadisticamente significativas.

| Benchmark | Agents-A1 6bit-XL | Gemma-4 26B 6bit-XL | Huihui-Qwen3.6 6bit-XL | Ornith-35B 6bit-XL | Qwen3.6-27B oQ4e | Qwen3.6-35B 6bit-XL | Qwen3.6-35B oQ4e | Qwen3.6-35B oQ4e-XL | Qwen3.6-35B oQ6 |
|---|---|---|---|---|---|---|---|---|---|
| MMLU | 66% | 76% | 74% | 64% | 74% | 64% | 66% | 72% | 64% |
| MMLU_PRO | 58% | 82% | 66% | 66% | 56% | 64% | 60% | 64% | 60% |
| ARC_CHALLENGE | 90% | 90% | 92% | 92% | 88% | 90% | 92% | 92% | 90% |
| HUMANEVAL | 90% | 98% | 84% | 78% | 92% | 78% | 92% | 90% | 66% |
| MBPP | 70% | 82% | 78% | 78% | 86% | 78% | 80% | 76% | 76% |
| Promedio | 74,8% | 85,6% | 78,8% | 75,6% | 79,2% | 74,8% | 78,0% | 78,8% | 71,2% |

En el benchmark de razonamiento con modo de pensamiento (MATHQA, n=30, presupuesto de 8192 tokens), tanto Gemma-4 26B 6bit-XL como Qwen3.6-35B 6bit-XL lograron un 100% de aciertos verificados. La diferencia esta en la eficiencia:

| Modelo | Accuracy (verificada) | Caracteres de razonamiento por respuesta correcta |
|---|---|---|
| Gemma-4 26B 6bit-XL | 30/30 (100%) | 3.527 |
| Qwen3.6-35B 6bit-XL | 30/30 (100%) | 4.948 |

Gemma usa un 29% menos de caracteres de razonamiento por respuesta correcta que Qwen3.6, lo que se traduce en menor consumo de ventana de contexto y menor coste computacional por respuesta.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 22,8 GB en disco en formato MLX. Segun la evaluacion del autor, el modelo cabe en la memoria unificada de Apple Silicon de 48 GB, y ese es el objetivo de la cuantizacion.
- GPU recomendadas: Apple Silicon con chip M2 Max, M3 Max o M4 Max y 48 GB de memoria unificada.
- No se han proporcionado datos para GPUs NVIDIA. El formato MLX es exclusivo de Apple Silicon; para ejecutar en otras plataformas seria necesaria una conversion (por ejemplo, a GGUF), que no se ofrece en este repositorio.
- Opciones de despliegue: MLX en macOS. No se mencionan otras opciones como vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (base) | 25,8 B | 3,8 B | no disponible | ninguno (bf16/fp16) | no disponible | no disponible | no disponible |
| gemma-4-26B-A4B-it-6bit-XL-mlx | 25,8 B | 3,8 B | no disponible | BaseQuant_XL 6/8 bits | 76% | 98% | no disponible |
| gemma-4-26B-A4B-it-2bit-XL-mlx | 25,8 B | 3,8 B | no disponible | BaseQuant_XL 2 bits | no disponible | no disponible | no disponible |
| Qwen3.6-35B 6bit-XL | 35 B (segun nombre del modelo) | no disponible | no disponible | 6 bits XL | 64% | 78% | no disponible |

## Limitaciones y advertencias

- Licencia no especificada en el repositorio: no se ha publicado la licencia del modelo cuantizado, lo que genera incertidumbre sobre su uso comercial y distribucion.
- Idiomas no documentados: no se ofrecen datos sobre la cobertura de idiomas. La cuantizacion agnostica a datos evita sesgos de calibracion, pero no garantiza un rendimiento homogeneo en lenguas minoritarias.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad o alucinacion. Como en todos los modelos generativos, el contenido debe validarse en contextos de alto riesgo.
- Longitud de contexto desconocida: los benchmarks utilizan un presupuesto de 8192 tokens, pero no se especifica el maximo del modelo. Los requisitos de memoria para contextos largos no estan evaluados.
- Los benchmarks del autor usan n=50, con intervalos de confianza amplios: diferencias inferiores a 6 puntos pueden no ser estadisticamente significativas, y los modelos con cuantizacion dependiente de datos (oQ/oQe) pueden estar calibrados sobre datos parecidos a los de los benchmarks.
- Contradiccion en la cuantizacion del codificador de vision: la descripcion del repositorio menciona 6 bits, pero la tabla de cuantizacion lo muestra en bf16. Esto no afecta al funcionamiento multimodal, pero debe tenerse en cuenta al interpretar la perdida de precision.
- El formato MLX esta ligado a Apple Silicon; no es directamente ejecutable en otras arquitecturas sin conversion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/leonsarmiento/gemma-4-26B-A4B-it-6bit-XL-mlx
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Version 2-bit del mismo autor: https://huggingface.co/leonsarmiento/gemma-4-26B-A4B-it-2bit-XL-mlx
- Coleccion Local SOTA para Macs de 48 GB: https://huggingface.co/collections/leonsarmiento/local-sota-for-48gb-macs-6a5fb58390dd01e1fc35d55e
- Plantilla de chat del modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it/blob/main/chat_template.jinja
