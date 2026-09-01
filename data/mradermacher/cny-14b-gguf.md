# mradermacher/CNY-14B-GGUF

## Resumen

CNY-14B-GGUF es una versión cuantizada en formato GGUF del modelo CNY-14B, desarrollado originalmente por Allen-UQ. La cuantización ha sido realizada por mradermacher, un equipo especializado en la conversión de modelos a formatos optimizados para inferencia local. El modelo base está diseñado para tareas de razonamiento sobre grafos con atributos de texto (text-attributed graphs), incluyendo clasificación de nodos y razonamiento sobre estructuras gráficas, y ha sido entrenado mediante técnicas de aprendizaje por refuerzo (GRPO) y auto-destilación.

Esta versión GGUF permite ejecutar el modelo en hardware de consumo y en entornos con recursos limitados, gracias a las distintas cuantizaciones disponibles que reducen el tamaño y los requisitos de memoria. El modelo tiene aproximadamente 14.770 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones propias. Aunque la información pública sobre la arquitectura interna es escasa, los tags y el pipeline indican una especialización clara en el dominio de grafos, un área con aplicaciones crecientes en análisis de redes, sistemas de recomendación y detección de anomalías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion publica detallada sobre la arquitectura interna del modelo CNY-14B. Los metadatos indican que el pipeline es de aprendizaje por refuerzo (reinforcement-learning) y los tags mencionan GRPO (Group Relative Policy Optimization) y self-distillation, lo que sugiere un entrenamiento basado en optimizacion de politicas con recompensas derivadas de tareas de grafos. El modelo esta especializado en grafos con atributos de texto, lo que implica que combina representaciones textuales con estructuras de grafo para tareas como clasificacion de nodos y razonamiento sobre relaciones.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas especificas de ajuste. La cuantizacion GGUF realizada por mradermacher es una conversion estatica de los pesos originales, sin recalibracion con imatrix, segun indica la model card. Esto puede implicar una ligera perdida de precision respecto al modelo original en algunas tareas, aunque las cuantizaciones de mayor calidad como Q8_0 minimizan este efecto.

## Capacidades

- Razonamiento sobre grafos con atributos de texto: el modelo esta disenado para comprender y operar sobre estructuras de grafo donde los nodos y aristas tienen descripciones textuales.
- Clasificacion de nodos: puede asignar categorias o etiquetas a nodos dentro de un grafo, tarea comun en analisis de redes sociales, deteccion de comunidades o sistemas de recomendacion.
- Razonamiento multi-paso sobre grafos: gracias al entrenamiento con GRPO, el modelo puede realizar inferencias que requieren seguir caminos o relaciones entre nodos.
- Generacion de texto en ingles: al ser un modelo de lenguaje, tambien puede generar texto coherente, aunque su especializacion principal es el dominio de grafos.
- Soporte de conversacion: el tag "conversational" sugiere que puede mantener dialogos, aunque no se especifican capacidades de tool calling ni de agentes.

## Casos de uso

- Analisis de redes sociales: el modelo puede clasificar nodos (usuarios, publicaciones) en grafos de interacciones, ayudando a identificar influencers, comunidades o contenido viral.
- Deteccion de fraude en sistemas financieros: modelando transacciones como un grafo, CNY-14B puede razonar sobre patrones sospechosos y clasificar nodos como fraudulentos o legitimos.
- Sistemas de recomendacion basados en grafos: al entender las relaciones entre items y usuarios, puede sugerir productos o contenidos relevantes en plataformas de comercio electronico o streaming.
- Gestion de conocimiento empresarial: representando documentos y sus conexiones como un grafo, el modelo puede responder consultas sobre relaciones entre conceptos o departamentos.
- Investigacion biomedica: en grafos de interacciones entre proteinas o genes, puede clasificar nodos segun su funcion o predecir interacciones no observadas.
- Moderacion de contenido en plataformas: modelando la propagacion de contenido como un grafo, puede identificar nodos que difunden informacion nociva y clasificarlos para su revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo. La ausencia de evaluaciones publicas limita la comparacion objetiva con otros modelos, aunque su especializacion en grafos sugiere que su rendimiento en tareas genericas de lenguaje puede ser inferior al de modelos generalistas de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, el archivo Q4_K_S ocupa 8,7 GB, por lo que se recomienda al menos 10-12 GB de VRAM para cargar el modelo con margen. La version Q8_0 requiere unos 15,8 GB, necesitando una GPU con 16-20 GB.
- GPU recomendadas: para las cuantizaciones mas ligeras (Q2_K, Q3_K_S) basta con una RTX 3060 de 12 GB o similar. Para Q8_0 se recomienda una RTX 4090, A100 o equivalente con 24 GB o mas.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q2_K a Q6_K caben en GPUs de consumo de 12-16 GB, como RTX 3080, RTX 4070 Ti o similares.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y otros motores que soporten este formato. Tambien puede usarse con vLLM si se convierte a safetensors, aunque no es el formato nativo.
- Latencia y throughput: no se dispone de mediciones publicas. En una GPU moderna, un modelo de 14B cuantizado a Q4_K_S puede generar entre 20 y 40 tokens por segundo, dependiendo del hardware y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (modelos de 14B especializados en grafos). Alternativas generalistas de tamano similar como Llama-3-8B o Mistral-7B no comparten la especializacion en grafos, por lo que una comparacion directa no es significativa. Se recomienda evaluar CNY-14B en tareas especificas de grafos frente a modelos como GraphLLM o similares, aunque no se dispone de datos publicos al respecto.

## Limitaciones y advertencias

- Especializacion limitada: el modelo esta orientado a tareas de grafos, por lo que su rendimiento en generacion de texto general, codigo o matematicas puede ser inferior al de modelos generalistas de su tamano.
- Idioma: solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- Cuantizacion estatica: al ser una cuantizacion sin recalibracion (imatrix), puede haber una perdida de precision en tareas que requieran alta exactitud numerica.
- Informacion tecnica insuficiente: no se han publicado detalles sobre la arquitectura, el entrenamiento ni los benchmarks, lo que dificulta evaluar su idoneidad para casos de uso especificos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios fuera de su especializacion.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Allen-UQ/CNY-14B) no tenga restricciones adicionales.

## Enlaces

- Modelo cuantizado GGUF: https://huggingface.co/mradermacher/CNY-14B-GGUF
- Modelo base original: https://huggingface.co/Allen-UQ/CNY-14B
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
