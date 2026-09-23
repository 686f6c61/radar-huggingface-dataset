# AxionLab-official/MiniBot-0.9M-Base

## Resumen

MiniBot-0.9M-Base es un modelo de lenguaje de tipo decoder-only basado en la arquitectura GPT-2, desarrollado por AxionLab y publicado en HuggingFace con licencia MIT. Con 985.728 parametros reales (aproximadamente 0,9 M), es un modelo de escala "nano" disenado especificamente para generar texto conversacional en portugues. Se distribuye como modelo base, es decir, entrenado unicamente con el objetivo de prediccion del siguiente token, sin ajuste por instrucciones, sin SFT, sin RLHF y sin ningun tipo de alineamiento de seguridad.

Su relevancia no reside en el rendimiento bruto, sino en su papel como banco de pruebas. Por su tamano, cabe en cualquier hardware, incluido un telefono o una CPU sin GPU, y su pipeline de entrenamiento es lo bastante ligero como para reproducirse en un cuaderno de Colab. Esto lo convierte en una pieza util para investigacion sobre modelos diminutos, experimentacion con tokenizadores y arquitecturas, y como punto de partida para fine-tuning. El propio autor lo posiciona explicitamente como no apto para entornos de produccion criticos.

La model card indica que existe una variante ajustada por instrucciones, MiniBot-0.9M-Instruct, construida sobre esta base. El modelo declara compatibilidad de embeddings con GPT-2 y esta etiquetado como compatible con text-generation-inference y con endpoints de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (embeddings compatibles con GPT-2) |
| Parametros totales | 985.728 (aproximadamente 0,9 M / 985 K) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se declaran variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | portugues (pt), unico idioma declarado |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only reducido que sigue el diseno de GPT-2: embeddings de tokens mas embeddings posicionales, atencion multi-cabeza auto-regresiva, capas feed-forward (MLP) y decodificacion autorregresiva. La model card no detalla el numero de capas, cabezas de atencion ni la dimension del modelo oculto, por lo que estos hiperparametros concretos no estan disponibles. Se indica que los embeddings son compatibles con GPT-2, lo que sugiere reutilizacion o alineacion con el tokenizador de dicha familia.

El entrenamiento se realizo sobre un corpus conversacional en portugues orientado al aprendizaje de patrones linguisticos, con un objetivo puro de modelado de lenguaje causal (prediccion del siguiente token). No hubo ajuste por instrucciones, ni SFT, ni RLHF, ni DPO, ni ninguna forma de alineamiento. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanicas de razonamiento extendido. El numero de tokens de entrenamiento, la composicion exacta del dataset y el regimen de entrenamiento (learning rate, scheduler, precision) no se especifican en la informacion disponible.

## Capacidades

- Generacion de texto en portugues: continuacion de prompts y produccion de texto coherente a nivel local, a partir de patrones estadisticos aprendidos.
- Estructura basica de dialogo: reconoce el formato "User: ... / Bot:" y puede continuar turnos conversacionales simples.
- Continuacion de prompts cortos: adecuado para completar frases o parrafos breves dentro del dominio del corpus de entrenamiento.
- Aprendizaje de patrones linguisticos: util como modelo de referencia para estudiar morfologia, sintaxis y distribuciones de tokens del portugues.
- Fine-tuning como capacidad principal: al ser un modelo base sin alineamiento, su valor practico esta en servir de inicializacion para SFT, ajuste conversacional o roleplay.
- Compatibilidad con el ecosistema transformers: carga directa con AutoModelForCausalLM y AutoTokenizer, y etiquetado como compatible con text-generation-inference y endpoints.
- No soporta tool calling ni function calling: no hay evidencia de plantillas de herramientas ni de entrenamiento en ese sentido.
- No soporta uso agentico ni razonamiento multi-paso: la propia model card lo describe como generador estadistico de lenguaje, no como sistema de razonamiento.
- Sin capacidades multimodales: no hay vision, audio ni ninguna modalidad adicional.
- Multilingue: no. Solo portugues declarado; el rendimiento en otros idiomas no esta documentado.

## Casos de uso

- Fine-tuning conversacional en portugues: el modelo se puede ajustar por instrucciones (SFT) sobre un corpus de dialogos en portugues para producir un chatbot de dominio muy acotado. Es precisamente el flujo que el autor siguio para crear MiniBot-0.9M-Instruct, por lo que existe una ruta conocida y reproducible.
- Investigacion sobre modelos diminutos: sirve como sujeto de estudio para medir como escalan las curvas de perdida, la coherencia y la repeticion en el rango sub-1M de parametros, con coste de entrenamiento despreciable.
- Educacion y docencia: permite que estudiantes entrenen, inspeccionen y modifiquen un transformer completo de principio a fin en una sola sesion practica, sin necesidad de infraestructura especializada.
- Inferencia en CPU y en dispositivos con recursos minimos: con menos de 4 MB en fp32, el modelo se puede ejecutar en un portatil, una Raspberry Pi o incluso en el navegador, lo que habilita demos interactivas sin backend GPU.
- Benchmarking de arquitecturas y tokenizadores: al ser un GPT-2 a escala minima, resulta util como linea base para comparar variantes de tokenizador, cambios en el numero de capas o alternativas de atencion, con ciclos de experimentacion de minutos.
- Prototipado rapido de interfaces de generacion de texto: desarrolladores que necesiten un stub de modelo para probar un frontend, un pipeline de streaming o una integracion con text-generation-inference antes de migrar a un modelo grande.
- Generacion de texto creativo de baja exigencia en portugues: continuaciones de frases, nombres o parrafos cortos en contextos donde la coherencia global no es critica y se acepta una salida estadistica.
- Pruebas de seguridad y evaluacion de riesgos: al no tener alineamiento alguno, sirve para estudiar como se manifiestan sesgos y salidas no filtradas en modelos sin medidas de seguridad, aunque su conocimiento del mundo es muy limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de MMLU, HumanEval, GSM8K, perplexity ni metricas comparativas, y los resultados de la busqueda web no contienen informacion relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 985.728 parametros, sin contar activaciones ni overhead del runtime):
  - fp32: aproximadamente 3,94 MB
  - fp16 / bf16: aproximadamente 1,97 MB
  - int8: aproximadamente 0,99 MB
  - int4: aproximadamente 0,49 MB
- Overhead real del runtime: aunque los pesos ocupan unos pocos megabytes, cargar el modelo con PyTorch y transformers anade tipicamente varios cientos de megabytes de consumo de memoria del proceso.
- GPU recomendadas: ninguna en particular. El modelo no requiere GPU; cualquier GPU con al menos 1 GB de VRAM es mas que suficiente, y el cuello de botella sera el lanzamiento de kernels, no la memoria.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, integrada o dedicada, y tambien en CPU sin aceleracion.
- Opciones de despliegue: transformers (ruta oficial documentada en la model card), text-generation-inference y endpoints de HuggingFace (segun los tags del repositorio). llama.cpp, Ollama o vLLM serian tecnicamente viables, pero no se publican pesos GGUF ni configuraciones oficiales para ellos.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia en ninguna plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Estado |
|---|---|---|---|---|---|
| MiniBot-0.9M-Base | 985.728 (0,9 M) | no disponible | Portugues | MIT | Pesos safetensors publicados |
| MiniBot-0.9M-Instruct | aproximadamente 0,9 M (misma base) | no disponible | Portugues | MIT | Variante ajustada por instrucciones citada en la model card |
| GPT-2 small | 124 M | 1024 tokens | Ingles | MIT (pesos de OpenAI) | Referencia historica de la familia en la que se inspira |
| Modelos TinyStories de escala similar (1 M - 33 M) | 1 M - 33 M | no aplica | Ingles | no disponible | Familia de modelos diminutos orientados a narrativa infantil |

La comparacion directa de rendimiento entre estas opciones no es posible con la informacion disponible: MiniBot-0.9M-Base no publica resultados de benchmarks, y las alternativas citadas pertenecen a dominios linguisticos distintos. La diferencia mas relevante es idiomatica: MiniBot cubre portugues, mientras que GPT-2 small y la familia TinyStories estan centrados en ingles.

## Limitaciones y advertencias

- Capacidad de razonamiento muy limitada: con menos de un millon de parametros, el modelo no realiza inferencia logica ni resolucion de problemas; la model card lo describe explicitamente como generador estadistico de lenguaje.
- Perdida de contexto en conversaciones largas: no mantiene el hilo en dialogos extensos y la longitud de contexto no esta documentada.
- Salidas inconsistentes: la propia documentacion del autor advierte de incoherencia y propension a la repeticion.
- Conocimiento del mundo practicamente nulo: no ha memorizado hechos, entidades ni relaciones del mundo real de forma fiable, lo que provoca alucinaciones frecuentes cuando se le piden datos factuales.
- Sin alineamiento ni medidas de seguridad: no hay SFT, RLHF ni filtros. Esto implica riesgo de generar contenido inapropiado, ofensivo o sesgado si se expone a usuarios finales.
- Sesgos conocidos: no se documentan evaluaciones de sesgo. Al entrenarse sobre un unico corpus conversacional en portugues, es previsible que reproduzca los sesgos y el registro de esa fuente, pero no hay datos publicados al respecto.
- Cobertura idiomatica restringida: solo portugues declarado. El comportamiento en castellano, ingles u otros idiomas no esta documentado y no deberia asumirse.
- No apto para produccion: la model card lo indica de forma explicita. No debe usarse en entornos criticos, atencion al cliente real, generacion de codigo en produccion ni ninguna aplicacion donde la fiabilidad sea un requisito.
- Licencia permisiva pero sin garantias: la licencia MIT permite uso comercial y modificacion sin restricciones practicas, pero se distribuye "tal cual", sin garantia de ningun tipo por parte del autor.
- Ausencia de datos de entrenamiento: no se especifican el volumen de tokens, la procedencia del corpus ni si existe filtrado, lo que dificulta auditar conformidad de derechos o calidad de datos.
- Adopcion muy baja: 56 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fechas de publicacion anomalas: el repositorio muestra fechas de creacion y actualizacion (abril y septiembre de 2026) que conviene verificar antes de citar el modelo como referencia cronologica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AxionLab-official/MiniBot-0.9M-Base
- Variante ajustada por instrucciones: https://huggingface.co/AxionLab-official/MiniBot-0.9M-Instruct
- Perfil del autor (AxionLab): https://huggingface.co/AxionLab-official
- Texto de la licencia MIT: https://opensource.org/licenses/MIT
- No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en los resultados de busqueda web disponibles.
