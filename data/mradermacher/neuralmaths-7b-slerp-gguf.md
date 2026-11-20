# mradermacher/NeuralMaths-7B-slerp-GGUF

## Resumen

NeuralMaths-7B-slerp-GGUF es la version cuantizada en formato GGUF del modelo de fusion NeuralMaths-7B-slerp, publicada por mradermacher, un conocido empaquetador de cuantizaciones para la comunidad de inferencia local. El modelo original es un merge de tipo SLERP (spherical linear interpolation) generado con mergekit y lazymergekit, que combina tres modelos base de 7B: Kukedlc/Neural4gsm8k, PetroGPT/WestSeverus-7B-DPO y samir-fama/FernandoGPT-v1. El objetivo declarado por la composicion de los modelos fuente es reforzar capacidades matematicas y de razonamiento sobre GSM8K, junto con un ajuste DPO para alineamiento conversacional.

El modelo cuenta con 7.241.732.096 parametros (aproximadamente 7,24 mil millones) y esta orientado a tareas de generacion de texto y resolucion de problemas matematicos en ingles. Su relevancia practica radica en que esta disponible en una amplia gama de cuantizaciones GGUF, desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama.

La informacion publicada no incluye detalles sobre la longitud de contexto, la licencia ni datos de entrenamiento del modelo original, por lo que estos aspectos deben considerarse no disponibles o sujetos a verificacion en el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de los modelos base de 7B); fusion mediante SLERP con mergekit/lazymergekit |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |
| Tamano del repositorio | 63,9 GB |
| Modelo base | Kukedlc/NeuralMaths-7B-slerp |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion de pesos de tipo SLERP (interpolacion esferica lineal) aplicada con mergekit y lazymergekit sobre tres modelos de 7B: Kukedlc/Neural4gsm8k, PetroGPT/WestSeverus-7B-DPO y samir-fama/FernandoGPT-v1. La tecnica de merge no requiere entrenamiento adicional: combina los tensores de los modelos fuente para producir un unico conjunto de pesos que hereda caracteristicas de cada uno. La eleccion de Neural4gsm8k sugiere un enfasis en razonamiento matematico y resolucion de problemas de GSM8K, mientras que WestSeverus-7B-DPO aporta un ajuste por DPO orientado a alineamiento conversacional.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de RLHF/DPO original ni innovaciones tecnicas adicionales (decodificacion especulativa, attention lineal, etc.). La cuantizacion GGUF ha sido realizada por mradermacher en formato estatico; segun la model card, no se han publicado cuantizaciones ponderadas ni imatrix para este modelo en el momento de la redaccion.

## Capacidades

- Generacion de texto en ingles con enfasis en razonamiento matematico y resolucion de problemas tipo GSM8K, heredado de Neural4gsm8k.
- Razonamiento multi-paso para problemas aritmeticos y algebraicos sencillos.
- Conversacion multi-turno con alineamiento DPO, heredado de WestSeverus-7B-DPO.
- Generacion de codigo basica y explicaciones tecnicas, segun las capacidades de los modelos base de 7B.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso avanzado: no disponible en la informacion publicada.
- Capacidades multilingues limitadas al ingles; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Resolucion de problemas matematicos de nivel escolar y preuniversitario: el modelo puede abordar enunciados de tipo GSM8K paso a paso, aprovechando la fusion con Neural4gsm8k para tareas aritmeticas y algebraicas en ingles.
- Asistente de estudio offline en hardware de consumo: con la cuantizacion Q4_K_M (4,5 GB) puede ejecutarse en una GPU de 8 GB o en CPU con llama.cpp, ofreciendo un tutor de matematicas local sin dependencia de la nube.
- Prototipado rapido de chatbots conversacionales en ingles: el ajuste DPO de WestSeverus-7B-DPO permite mantener conversaciones multi-turno coherentes para demos y pruebas de concepto.
- Generacion de explicaciones paso a paso para plataformas educativas: el modelo puede producir razonamientos detallados que sirvan como base para contenido didactico, siempre con supervision humana por riesgo de alucinacion.
- Evaluacion comparativa de tecnicas de merge: investigadores pueden usar este modelo como caso de estudio para analizar como la fusion SLERP afecta al rendimiento en matematicas frente a los modelos individuales.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (2,8 GB) y Q3_K_S (3,3 GB) permiten ejecutar el modelo en portatiles sin GPU dedicada mediante Ollama o llama.cpp, util para pruebas de integracion en pipelines de CI.
- Generacion de codigo auxiliar y scripts simples: aunque no es su especialidad, puede asistir en tareas de programacion basica en ingles dentro de entornos de desarrollo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q5-Q8 con comodidad; RTX 4090 para f16 o Q8_0 con alto throughput; A100/H100 solo justificables para despliegues multi-instancia o fine-tuning, no para inferencia de un 7B.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB (Q4_K_M) hasta 16 GB (Q8_0). Las cuantizaciones Q2_K y Q3_K_S pueden ejecutarse en CPU con RAM suficiente (4-6 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para transformers se requiere el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion publicada. Como referencia general para un 7B en Q4_K_M, se esperan decenas de tokens por segundo en GPUs consumer modernas, pero no se aportan cifras verificadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NeuralMaths-7B-slerp-GGUF (este) | 7,24B | no disponible | no disponible | GGUF | Merge SLERP orientado a matematicas; solo ingles |
| Kukedlc/NeuralMaths-7B-slerp | 7,24B | no disponible | no disponible | safetensors | Modelo base sin cuantizar del que deriva esta version |
| Kukedlc/Neural4gsm8k | ~7B | no disponible | no disponible | safetensors | Componente del merge, especializado en GSM8K |
| PetroGPT/WestSeverus-7B-DPO | ~7B | no disponible | no disponible | safetensors | Componente del merge con ajuste DPO |

No se dispone de datos de rendimiento comparativo verificados entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de modelos entrenados principalmente en ingles, es probable que herede sesgos culturales y linguisticos de sus fuentes.
- Riesgo de alucinacion: elevado en tareas matematicas complejas y razonamiento multi-paso, comun en modelos de 7B fusionados sin evaluacion publicada; se recomienda verificacion humana en contextos educativos o de produccion.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide garantizar conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base Kukedlc/NeuralMaths-7B-slerp y de los tres modelos fuente antes de cualquier despliegue productivo.
- Caveats para produccion: la model card indica que no hay cuantizaciones imatrix ni ponderadas disponibles, lo que puede reducir la calidad respecto a alternativas con calibracion; las cuantizaciones Q2_K y Q3_K_M tienen calidad notablemente inferior y no se recomiendan para tareas de razonamiento.
- Trazabilidad: al ser un merge sin benchmarks publicados, no hay evidencia cuantitativa de que supere a sus modelos constituyentes en tareas concretas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NeuralMaths-7B-slerp-GGUF
- Modelo base: https://huggingface.co/Kukedlc/NeuralMaths-7B-slerp
- Modelo fuente 1: https://huggingface.co/Kukedlc/Neural4gsm8k
- Modelo fuente 2: https://huggingface.co/PetroGPT/WestSeverus-7B-DPO
- Modelo fuente 3: https://huggingface.co/samir-fama/FernandoGPT-v1
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#NeuralMaths-7B-slerp-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
