# mradermacher/Sophea-Nemo-3.5-Lightning-v1-i1-GGUF

## Resumen

Sophea-Nemo-3.5-Lightning-v1-i1-GGUF es un repositorio de cuantizaciones GGUF generado por mradermacher a partir del modelo ayoubkirouane/Sophea-Nemo-3.5-Lightning-v1. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local: el autor aplica cuantización con matrices de importancia (imatrix) para producir ficheros de menor peso que el original en safetensors, manteniendo en lo posible la calidad de salida. El repositorio ocupa 60,4 GB e incluye, además de los ficheros cuantizados, el propio fichero imatrix para que terceros puedan generar sus propias cuantizaciones.

El modelo subyacente declara 32.913.266.240 parámetros (unos 32,9 mil millones) y, según las etiquetas del repositorio, emplea una arquitectura híbrida con mezcla de expertos (MoE), componentes Mamba y herencia de la familia Nemotron. Está orientado a tareas de razonamiento y modo "thinking", con soporte declarado de griego (el) e inglés (en), y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. Los tags incluyen también "language-matched", lo que sugiere un ajuste deliberado para mantener el idioma de la consulta en la respuesta.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de ~33B parámetros en hardware de gama alta para consumidor gracias a la cuantización; por otro, es un caso útil para evaluar arquitecturas híbridas Mamba-MoE en formato GGUF. Ahora bien, el repositorio no incluye resultados de benchmarks, no documenta la longitud de contexto y, en el momento de la consulta, no acumula descargas ni valoraciones, por lo que debe tratarse como un artefacto experimental sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida, con mezcla de expertos (MoE) y componentes Mamba, según los tags del repositorio (moe, mamba, nemotron, hybrid) |
| Parámetros totales | 32.913.266.240 (~32,9 B), dato real de safetensors del modelo base |
| Parámetros activos | no disponible (el repositorio indica que es MoE, pero no publica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1/imatrix: Q2_K, IQ3_M, Q4_K_S (ficheros publicados en la tabla del repositorio); el listado de etiquetas menciona además IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Griego (el) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones derivadas); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 60,4 GB |
| Creador de la cuantización | mradermacher |
| Modelo base | ayoubkirouane/Sophea-Nemo-3.5-Lightning-v1 |
| Referencia arXiv declarada | arxiv:2608.17744 (sin título ni enlace verificable en la información proporcionada) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe el proceso de entrenamiento del modelo original: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Lo único documentado en el repositorio es la naturaleza arquitectónica declarada mediante etiquetas: un modelo híbrido que combina mecanismos de atención con capas Mamba y una capa de mezcla de expertos (MoE), dentro de la estirpe Nemotron. Este tipo de diseño busca reducir el coste computacional de la atención en secuencias largas mediante el componente de espacio de estados, a la vez que mantiene la capacidad de recuperación precisa de la atención clásica. La etiqueta "language-matched" apunta a un ajuste específico para que el idioma de respuesta coincida con el de la consulta, y "thinking" a un modo de razonamiento explícito antes de emitir la respuesta final.

El trabajo técnico de este repositorio concreto es la cuantización. mradermacher aplica cuantización ponderada con imatrix: en lugar de tratar todos los pesos por igual, se calcula una matriz de importancia a partir de estadísticas de activación sobre un corpus de calibración, de modo que los pesos más sensibles a errores conservan más bits. El repositorio publica el propio fichero imatrix (0,2 GB) para replicar el proceso, y distingue entre cuantizaciones i1 (imatrix, ficheros publicados aquí) y las estáticas de otro repositorio hermano. Los tamaños declarados son 18,8 GB para Q2_K, 19,0 GB para IQ3_M y 22,9 GB para Q4_K_S; la propia model card señala IQ3_XXS como probablemente mejor que Q2_K a tamaño similar, y Q4_K_S como el punto óptimo entre tamaño, velocidad y calidad.

## Capacidades

- Generación de texto y conversación multi-turno, con etiqueta "conversational" en el repositorio.
- Razonamiento explícito con modo "thinking", según los tags del modelo.
- Multilingüismo limitado a griego e inglés, con comportamiento "language-matched" (respuesta en el idioma de la consulta).
- Inferencia local en formato GGUF, con soporte para ejecución en CPU, GPU o reparto por capas.
- Capacidad de generar cuantizaciones propias a partir del fichero imatrix incluido.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles (el modo thinking no implica necesariamente orquestación de herramientas).
- Capacidades de código y matemáticas: no disponibles; no se documentan resultados ni evaluaciones específicas.
- Visión, audio o multimodalidad: no disponible.
- Ventana de contexto larga declarada: no disponible.

## Casos de uso

- Atención al cliente bilingüe griego-inglés: al declarar soporte para ambos idiomas con coincidencia de idioma en la respuesta, puede gestionar conversaciones multi-turno en un centro de soporte griego que también atienda clientes internacionales, sin necesidad de enviar datos a una API externa.
- Procesamiento de documentación técnica en griego: traducción y resumen de manuales, contratos o normativa griega hacia inglés (y a la inversa) manteniendo terminología consistente, desplegado on-premise para cumplir requisitos de confidencialidad.
- Asistente de razonamiento paso a paso para análisis interno: el modo thinking resulta adecuado para tareas donde interesa registrar el razonamiento intermedio (auditoría de decisiones, revisión de cálculos), siempre que se validen las conclusiones por tratarse de un modelo sin benchmarks publicados.
- Despliegue local en estaciones de trabajo con GPU de 24-48 GB: cuantizado en Q4_K_S (22,9 GB) permite ejecutar el modelo sin depender de servicios en la nube, útil en entornos con restricciones de conectividad o de soberanía de datos.
- Investigación sobre arquitecturas híbridas Mamba-MoE: el repositorio sirve como material para medir el impacto real de la cuantización imatrix en modelos con capas de espacio de estados, comparando perplejidad entre Q2_K, IQ3_M y Q4_K_S.
- Generación de cuantizaciones a medida: el fichero imatrix incluido permite a un equipo producir sus propios GGUF con parámetros de calibración ajustados a un dominio concreto (por ejemplo, corpus jurídico griego) y evaluar la degradación resultante.
- Prototipado de asistentes conversacionales en griego: para productos dirigidos al mercado heleno, donde la oferta de modelos con soporte explícito de griego es reducida y a menudo se limita a modelos multilingües genéricos.
- Evaluación comparativa interna de proveedores: uso como candidato en pruebas A/B frente a otros modelos de ~30B en tareas de resumen y clasificación, con la ventaja de poder ejecutarse en hardware propio y sin coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de perplejidad, y la comparativa de calidad entre cuantizaciones se limita a una recomendación cualitativa del autor (IQ3_XXS preferible a Q2_K; Q4_K_S como mejor equilibrio) y a un gráfico externo de perplejidad de tipos de cuantización, no específico de este modelo.

## Requisitos de hardware

- Pesos en disco: 18,8 GB (i1-Q2_K), 19,0 GB (i1-IQ3_M), 22,9 GB (i1-Q4_K_S); el repositorio completo ocupa 60,4 GB.
- VRAM estimada para inferencia: aproximadamente el tamaño del fichero más la caché KV y los búferes de cómputo; en la práctica, del orden de 21-26 GB para las cuantizaciones publicadas con contextos moderados, y más si se amplía el contexto (estimación propia, no publicada por el autor).
- GPU de 24 GB (RTX 3090, RTX 4090): IQ3_M o Q2_K entran con contexto corto; Q4_K_S queda al límite y probablemente requiera reducir contexto u offload parcial a RAM.
- GPU de 32-48 GB (RTX 5090, L40S, RTX 6000 Ada, A100 40 GB): ejecución holgada de todas las cuantizaciones publicadas, incluida Q4_K_S con contexto amplio.
- GPU de 80 GB (A100 80 GB, H100): margen suficiente para lotes grandes y contextos largos, si el modelo los soporta (dato no disponible).
- Configuraciones multi-GPU: dos GPU de 24 GB permiten repartir capas por tensor o por capa; también es viable el reparto CPU/GPU.
- Solo CPU: posible con llama.cpp, pero con latencia elevada; al ser MoE conviene disponer de al menos 32 GB de RAM para mantener los pesos residentes y evitar swap.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI). Antes de producción conviene verificar que la versión concreta de llama.cpp soporta la combinación de capas Mamba y MoE de esta arquitectura.
- vLLM y TGI: trabajan principalmente con safetensors; para GGUF se requiere soporte específico y no está confirmado para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos verificables en la información proporcionada sobre modelos terceros comparables, por lo que la comparación se limita a las variantes del propio modelo:

| Variante | Formato | Tamaño | Calidad esperada | Licencia |
|---|---|---|---|---|
| Sophea-Nemo-3.5-Lightning-v1-i1-GGUF (este repositorio) | GGUF con cuantización imatrix (i1) | 18,8-22,9 GB por fichero publicado; 60,4 GB el repositorio | Superior a la cuantización estática a igual tamaño, según el criterio del cuantizador | Apache 2.0 |
| Sophea-Nemo-3.5-Lightning-v1-GGUF (cuantizaciones estáticas) | GGUF estático | no disponible en la información proporcionada | Inferior a imatrix a igual tamaño | Apache 2.0 |
| ayoubkirouane/Sophea-Nemo-3.5-Lightning-v1 (modelo base) | safetensors | 32,9 B parámetros (referencia de precisión completa) | Referencia de máxima calidad del modelo | Apache 2.0 |

Alternativas de terceros de tamaño o arquitectura comparable (otros híbridos Mamba-MoE de ~30B): no disponibles en la información proporcionada. No se han encontrado en la búsqueda web resultados relevantes sobre este modelo.

## Limitaciones y advertencias

- Ausencia de validación: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluaciones independientes. No hay evidencia objetiva de su calidad.
- Sesgos: no documentados. Al estar entrenado principalmente para inglés y griego, es previsible un sesgo cultural y lingüístico hacia esos dos contextos, pero no hay estudios que lo cuantifiquen.
- Riesgo de alucinación: inherente a los modelos generativos y, en principio, acentuado por cuantizaciones agresivas como Q2_K o la familia IQ1/IQ2, que no aparecen listadas en la tabla de ficheros publicados pero sí en las etiquetas.
- Degradación por cuantización: los ficheros publicados van de 18,8 a 22,9 GB; las variantes de menor tamaño pierden precisión numérica y pueden degradar el razonamiento multi-paso y el seguimiento de instrucciones.
- Idiomas: solo griego e inglés declarados. El rendimiento en castellano no está documentado y probablemente sea inferior; no debe asumirse cobertura multilingüe amplia.
- Longitud de contexto: no publicada. Planificar despliegues que dependan de ventanas largas es arriesgado sin medirla previamente.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y atribución. Conviene verificar que el modelo base no añada condiciones adicionales, ya que el repositorio no las detalla.
- Trazabilidad: el repositorio referencia un identificador arXiv (2608.17744) del que no se proporciona título ni contenido, y las fechas de creación y actualización son de septiembre de 2026. No se puede verificar la procedencia técnica del modelo a partir de la información disponible.
- Soporte de arquitectura: al combinar Mamba y MoE, el soporte depende de la versión del motor de inferencia; un motor desactualizado puede fallar al cargar los pesos o producir resultados incorrectos.
- Tool calling y uso agéntico: no confirmados. No diseñar pipelines que dependan de function calling sin validarlo antes.

## Enlaces

- Repositorio de cuantizaciones i1 (este modelo): https://huggingface.co/mradermacher/Sophea-Nemo-3.5-Lightning-v1-i1-GGUF
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Sophea-Nemo-3.5-Lightning-v1-GGUF
- Página de resumen y descargas de mradermacher: https://hf.tst.eu/model#Sophea-Nemo-3.5-Lightning-v1-i1-GGUF
- Modelo base: https://huggingface.co/ayoubkirouane/Sophea-Nemo-3.5-Lightning-v1
- Fichero imatrix: https://huggingface.co/mradermacher/Sophea-Nemo-3.5-Lightning-v1-i1-GGUF/resolve/main/Sophea-Nemo-3.5-Lightning-v1.imatrix.gguf
- Cuantización i1-Q2_K: https://huggingface.co/mradermacher/Sophea-Nemo-3.5-Lightning-v1-i1-GGUF/resolve/main/Sophea-Nemo-3.5-Lightning-v1.i1-Q2_K.gguf
- Cuantización i1-IQ3_M: https://huggingface.co/mradermacher/Sophea-Nemo-3.5-Lightning-v1-i1-GGUF/resolve/main/Sophea-Nemo-3.5-Lightning-v1.i1-IQ3_M.gguf
- Cuantización i1-Q4_K_S: https://huggingface.co/mradermacher/Sophea-Nemo-3.5-Lightning-v1-i1-GGUF/resolve/main/Sophea-Nemo-3.5-Lightning-v1.i1-Q4_K_S.gguf
- Guía de uso de ficheros GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Referencia arXiv declarada en las etiquetas (sin título verificable en la información disponible): arxiv:2608.17744
