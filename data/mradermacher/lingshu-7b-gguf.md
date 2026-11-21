# mradermacher/Lingshu-7B-GGUF

## Resumen

Lingshu-7B-GGUF es la versión cuantizada en formato GGUF del modelo Lingshu-7B, un modelo multimodal especializado en el dominio médico desarrollado por el equipo lingshu-medical-mllm. El modelo base está diseñado para tareas de razonamiento clínico y generación de informes a partir de imágenes médicas, incluyendo modalidades como resonancia magnética (MRI), tomografía computarizada (CT), histopatología, rayos X y fondo de ojo (fundus). La cuantización la ha realizado mradermacher, un conocido publicador de versiones GGUF de la comunidad.

El modelo cuenta con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones) y está publicado bajo licencia MIT, lo que facilita su uso comercial. Al estar en formato GGUF, puede ejecutarse con llama.cpp y herramientas derivadas como Ollama o LM Studio, lo que reduce significativamente los requisitos de hardware frente a la versión original en safetensors.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo médico multimodal en hardware de consumo, algo poco habitual en el ecosistema de modelos clínicos. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que varios apartados de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal; no se detalla en la información proporcionada) |
| Parametros totales | 7.615.616.512 (≈7,6 B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (con ficheros mmproj separados para el proyector multimodal) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Lingshu-7B en la documentación proporcionada. Por el nombre y el tamaño (≈7,6 B de parámetros) y por su naturaleza multimodal con generación de informes a partir de imágenes médicas, se trata presumiblemente de un transformer con un codificador visual y un proyector multimodal (mmproj) que alimenta un modelo de lenguaje de aproximadamente 7 B. Esta inferencia es razonable pero no está confirmada explícitamente en la información disponible.

Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Los tags de la model card indican especialización en dominios como radiología, MRI, CT, histopatología, rayos X y fundus, lo que sugiere un entrenamiento o ajuste fino sobre datos clínicos multimodales, pero no se aportan cifras concretas. La cuantización realizada por mradermacher es de tipo estático (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye versiones imatrix disponibles en un repositorio separado (Lingshu-7B-i1-GGUF).

## Capacidades

- Generación de informes médicos a partir de imágenes en modalidades como radiología, MRI, CT, histopatología, rayos X y fundus.
- Razonamiento clínico multimodal (clinical-reasoning), según los tags del modelo.
- Procesamiento de imágenes médicas mediante el proyector multimodal (ficheros mmproj).
- Conversación multi-turno (tag "conversational").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Generación asistida de informes de radiología: el modelo puede recibir una imagen (por ejemplo, una radiografía o un corte de CT) y producir un borrador de informe estructurado, que el radiólogo revisa y valida. Es adecuado por su especialización declarada en report generation y modalidades de imagen médica.
- Triaje preliminar en servicios de urgencias: integrado en un pipeline que recibe imágenes de rayos X y genera una descripción inicial priorizada, ayudando a ordenar la revisión por parte del personal clínico. Requiere validación humana obligatoria.
- Apoyo a la docencia médica: uso del modelo para explicar hallazgos en imágenes de histopatología o fundus, generando descripciones didácticas en inglés que el instructor adapta.
- Investigación en visión médica: servir como línea base multimodal para experimentos de generación de informes y razonamiento clínico, aprovechando la licencia MIT y la disponibilidad en GGUF para prototipado rápido en GPUs de consumo.
- Despliegue en entornos con hardware limitado: al estar cuantizado (Q4_K_M ≈4,8 GB), puede ejecutarse en estaciones de trabajo con una única GPU consumer o incluso en CPU, lo que permite probar flujos clínicos en hospitales sin infraestructura de datacenter.
- Preprocesado y anotación de datasets médicos: generación automática de descripciones de imágenes para construir corpus anotados, con revisión posterior por especialistas.
- Asistente conversacional de apoyo al clínico: dado su carácter conversacional, puede emplearse para resolver dudas sobre terminología o interpretación preliminar de hallazgos, siempre como herramienta de apoyo y no de diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ≈3,1 GB; Q4_K_M ≈4,8 GB; Q5_K_M ≈5,5 GB; Q6_K ≈6,4 GB; Q8_0 ≈8,2 GB; f16 ≈15,3 GB.
- Componente multimodal adicional: mmproj-Q8_0 ≈1,0 GB o mmproj-f16 ≈1,5 GB, que debe sumarse a la VRAM del modelo de lenguaje.
- GPU recomendadas: para cuantizaciones Q4/Q5, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0, se recomienda RTX 4070 Ti/4080/4090 (16-24 GB) o GPUs de datacenter como A100/H100 si se busca mayor throughput.
- Cabe en GPU consumer: sí, en la mayoría de cuantizaciones (Q2 a Q6) con GPUs de 8-12 GB, sumando el proyector multimodal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. Para la versión original en safetensors, vLLM o TGI (no confirmado para esta variante GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lingshu-7B-GGUF | ≈7,6 B | no disponible | MIT | GGUF | Multimodal médico, cuantizado por mradermacher |
| Lingshu-7B (original) | ≈7,6 B | no disponible | MIT | safetensors | Versión sin cuantizar del mismo modelo base |
| Alternativas multimodales médicas de ~7 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría (multimodal médico de ~7 B). Se indica "no disponible".

## Limitaciones y advertencias

- El modelo está entrenado y orientado al inglés; no se declara soporte de castellano ni de otros idiomas.
- No se han publicado benchmarks ni evaluaciones clínicas en la información disponible, por lo que su rendimiento real en tareas médicas no puede verificarse a partir de fuentes públicas.
- Riesgo de alucinación inherente a los modelos generativos: en dominio clínico, una descripción errónea de un hallazgo puede tener consecuencias graves. Se requiere supervisión humana obligatoria y no debe usarse como herramienta de diagnóstico autónoma.
- Sesgos conocidos: no disponibles en la información proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento (población, equipos de imagen, protocolos), no documentados.
- La cuantización introduce pérdida de calidad respecto al modelo original; las cuantizaciones Q2_K y Q3_K_M se marcan explícitamente como de menor calidad en la model card.
- La licencia MIT permite uso comercial, pero el uso clínico puede estar sujeto a regulaciones sanitarias (por ejemplo, marcado CE o aprobación FDA) que no cubre la licencia del modelo.
- El repositorio ocupa 70,4 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- No se especifica la longitud de contexto, lo que impide planificar despliegues con conversaciones o informes largos sin pruebas previas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lingshu-7B-GGUF
- Modelo base: https://huggingface.co/lingshu-medical-mllm/Lingshu-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Lingshu-7B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Lingshu-7B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
