# mradermacher/Al-Khwarizmi-3B-i1-GGUF

## Resumen

Al-Khwarizmi-3B-i1-GGUF es la distribucion en formato GGUF del modelo Al-Khwarizmi-3B, un modelo de lenguaje de 3.075.098.624 parametros (aproximadamente 3B) afinado a partir de SmolLM3 y especializado en razonamiento matematico y conversacion multilingue. El modelo original lo desarrolla el usuario de Hugging Face mzoelfakar, mientras que esta version cuantizada la publica mradermacher, un conocido empaquetador de cuantizaciones GGUF, mediante el uso de pesos ponderados con matriz de importancia (imatrix).

La relevancia de esta publicacion reside en que permite ejecutar un modelo afinado con DPO y LoRA sobre un backbone SmolLM3 en hardware de consumo, con cuantizaciones que van desde 0,9 GB (IQ1_S) hasta 2,6 GB (Q6_K). El modelo esta entrenado sobre openai/gsm8k y el dataset mzoelfakar/Mini-GSM8K-Multilingual-Alignment, lo que lo orienta a tareas de aritmetica y razonamiento paso a paso en nueve idiomas: ingles, arabe, frances, espanol, aleman, italiano, portugues, chino y ruso.

La licencia Apache 2.0 y el soporte de transformers y text-generation-inference lo hacen adecuado para prototipado rapido, despliegue en el borde y experimentacion con tecnicas de cuantizacion de baja precision. Esta ficha se centra en la version i1-GGUF, que incorpora cuantizaciones dinamicas con imatrix ademas de las estaticas disponibles en el repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM3), afinado con LoRA y DPO |
| Parametros totales | 3.075.098.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (mas fichero imatrix) |
| Idiomas soportados | en, ar, fr, es, de, it, pt, zh, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

El modelo base Al-Khwarizmi-3B se construye sobre SmolLM3, un transformer decoder-only de aproximadamente 3B parametros. El autor aplica un ajuste fino con LoRA y posteriormente una fase de optimizacion por preferencias (DPO), segun se desprende de las etiquetas del repositorio (fine-tuned, dpo, lora). Los datos de entrenamiento documentados son openai/gsm8k y mzoelfakar/Mini-GSM8K-Multilingual-Alignment, ambos orientados a problemas aritmeticos de varios pasos y a su alineacion multilingue.

La version i1-GGUF no modifica la arquitectura: mradermacher aplica cuantizacion de los tensores de salida (output_tensor_quantised) con tipo de conversion HF y version de cuantizacion 2, generando pesos ponderados por una matriz de importancia (imatrix) calculada sobre el modelo original. Esta tecnica permite que las cuantizaciones de baja precision (IQ1, IQ2, IQ3) degraden menos la perplejidad que las cuantizaciones K-quant equivalentes en tamano. El repositorio incluye el fichero imatrix.gguf para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional multi-turno en nueve idiomas.
- Razonamiento matematico y resolucion de problemas aritmeticos de varios pasos, potenciado por el ajuste sobre GSM8K y su variante multilingue.
- Capacidad de seguir cadenas de razonamiento (chain-of-thought) en el contexto de problemas matematicos.
- Soporte multilingue nativo en en, ar, fr, es, de, it, pt, zh y ru.
- Compatibilidad con text-generation-inference y con el ecosistema transformers.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning general: no disponible (mas alla del razonamiento matematico).
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Tutoria de matematicas multilingue: el modelo puede resolver problemas de aritmetica paso a paso en espanol, arabe o frances, lo que lo hace util para asistentes educativos en entornos escolares con alumnado de habla no inglesa.
- Prototipado en hardware de consumo: con cuantizaciones de 1,9 a 2,3 GB (Q4_K_S, Q4_K_M, Q5_K_M) se puede ejecutar en una GPU consumer de 8 GB o incluso en CPU con llama.cpp, ideal para demos locales y validacion de producto.
- Despliegue en el borde (edge computing): las cuantizaciones IQ2 e IQ3 (1,0-1,6 GB) permiten ejecutar el modelo en dispositivos con memoria limitada, como mini-PC o moviles de gama alta, para tareas de calculo basico offline.
- Generacion de explicaciones paso a paso: util para construir datasets sinteticos de razonamiento matematico en varios idiomas, ya que el modelo fue afinado especificamente sobre GSM8K multilingue.
- Chatbot de soporte en varios idiomas: al cubrir nueve idiomas, puede emplearse como primer nivel de atencion en productos con usuarios internacionales, aunque con las cautelas de calidad de un modelo de 3B.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece 24 variantes de cuantizacion mas el fichero imatrix, lo que lo convierte en un banco de pruebas para medir el impacto de IQ1-IQ3 frente a K-quant en un modelo afinado con DPO.
- Integracion en pipelines de CI/CD para validacion de modelos: el formato GGUF y la compatibilidad con llama.cpp permiten automatizar pruebas de regresion de calidad en cada nueva cuantizacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): 0,9-1,0 GB en IQ1; 1,0-1,4 GB en IQ2; 1,4-1,8 GB en IQ3; 1,8-2,1 GB en IQ4; 2,3 GB en Q5; 2,6 GB en Q6.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones IQ2-IQ4. Para Q5/Q6 se recomienda 6-8 GB. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 permiten ejecutar el modelo con contexto amplio y multiples peticiones concurrentes.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas con 6 GB o mas, e incluso en GPUs integradas con memoria compartida para las cuantizaciones mas pequenas.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (para el modelo base en safetensors), y cualquier runtime compatible con GGUF. Para el modelo original en transformers se puede usar vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Al-Khwarizmi-3B-i1-GGUF | 3,075B | no disponible | Apache 2.0 | GGUF | Afinado DPO sobre GSM8K multilingue, 9 idiomas |
| SmolLM3 (base) | no disponible | no disponible | no disponible | safetensors | Backbone del que deriva el modelo |
| mzoelfakar/Al-Khwarizmi-3B (original) | 3,075B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo |
| mradermacher/Al-Khwarizmi-3B-GGUF (estatico) | 3,075B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas sin imatrix |

La comparacion con alternativas de la misma categoria (modelos de 3B especializados en matematicas, como Qwen2.5-Math-1.5B o Phi-3-mini) no esta disponible en la informacion proporcionada, por lo que no se incluyen datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo tiene 3B parametros: su capacidad de razonamiento general, conocimiento factual y seguimiento de instrucciones complejas es limitada en comparacion con modelos de 7B o superiores.
- El ajuste fino se centra en GSM8K y su variante multilingue, por lo que fuera del dominio matematico el rendimiento puede degradarse respecto al SmolLM3 base.
- Riesgo de alucinacion en problemas matematicos que requieran precision exacta o en calculos de varios pasos no vistos durante el entrenamiento; conviene validar las respuestas con herramientas externas.
- La longitud de contexto no esta documentada en la informacion disponible; no se debe asumir una ventana larga sin verificacion empirica.
- Aunque se declaran nueve idiomas, la calidad por idioma no esta cuantificada; el espanol y el arabe aparecen en el dataset de alineacion, pero el resto puede tener cobertura desigual.
- Las cuantizaciones IQ1 e IQ2 estan marcadas por el propio autor como "for the desperate" o "mostly desperate", con degradacion de calidad significativa; no se recomiendan para produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base SmolLM3 y los datasets de entrenamiento pueden tener sus propias condiciones que conviene revisar antes de un despliegue comercial.
- No se documentan medidas de seguridad, filtros de contenido ni evaluaciones de sesgo; en produccion seria necesario anadir capas de moderacion.

## Enlaces

- Repositorio Hugging Face de esta version: https://huggingface.co/mradermacher/Al-Khwarizmi-3B-i1-GGUF
- Modelo base original: https://huggingface.co/mzoelfakar/Al-Khwarizmi-3B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Al-Khwarizmi-3B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Al-Khwarizmi-3B-i1-GGUF
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset de alineacion multilingue: https://huggingface.co/datasets/mzoelfakar/Mini-GSM8K-Multilingual-Alignment
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
