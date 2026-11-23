# IndrasMirror/QuetzaCOaTl-3B-Instruct-Q8

## Resumen

QuetzaCOaTl-3B-Instruct-Q8 es una cuantizacion en formato GGUF Q8_0 de QuetzaCOaTl, un ajuste fino (fine-tune) experimental del modelo meta-llama/Llama-3.2-3B-Instruct, desarrollado por el usuario IndrasMirror. El modelo esta especializado en razonamiento de cadena de pensamiento (chain-of-thought) multi-turno, es decir, en producir respuestas estructuradas paso a paso en conversaciones que se extienden durante varios turnos, con enfasis en logica, matematicas y resolucion analitica de problemas.

El modelo conserva la arquitectura original de Llama 3.2 3B Instruct (transformer denso, 3.212.749.888 parametros) y se distribuye unicamente como pesos cuantizados en Q8_0 para su uso con llama.cpp y Ollama. El ajuste se realizo sobre el dataset Excido/Quetzacoatl, orientado a conversaciones con razonamiento estructurado. La model card lo etiqueta explicitamente como experimental y menciona una version de "2000 pasos" de entrenamiento.

Su relevancia practica es limitada pero concreta: ofrece un modelo de 3B parametros que cabe en hardware de consumo, con licencia Llama 3.2 y compatible con el ecosistema llama.cpp/Ollama, pensado para prototipos de razonamiento paso a paso en ingles. No hay resultados de benchmarks publicados ni datos detallados sobre el proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B Instruct soporta 128K tokens, pero la model card no lo confirma para este fine-tune) |
| Tipos de cuantizacion | Q8_0 (unico formato publicado en este repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License Agreement) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct de Meta: un transformer denso con 3.212.749.888 parametros, sin mezcla de expertos. El autor no documenta cambios estructurales respecto al modelo base, por lo que se asume que el fine-tune modifica unicamente los pesos mediante ajuste supervisado sobre el dataset Excido/Quetzacoatl. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; solo indica que se uso un "Multi-Turn Chain-of-Thought Reasoning Dataset" y menciona una version de "2000 pasos". No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de pensamiento explicitos.

El unico artefacto publicado en este repositorio es la cuantizacion Q8_0 en GGUF, generada con llama.cpp. No se incluyen pesos en safetensors ni otras cuantizaciones (Q4_K_M, Q5_K_M, etc.) en la informacion disponible. El repositorio incluye un Modelfile para importacion directa en Ollama, segun indica la model card.

## Capacidades

- Generacion de texto conversacional en ingles con estructura de respuesta paso a paso.
- Razonamiento de cadena de pensamiento (chain-of-thought) multi-turno, con enfasis en mantener coherencia entre turnos.
- Resolucion de problemas matematicos y logicos de forma analitica y desglosada.
- Dialogo de corta, media y larga duracion, segun la model card.
- Salida estructurada con procesos de pensamiento organizados en pasos logicos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no documentado como capacidad formal; el modelo produce razonamiento multi-paso en texto, pero no se describe integracion con frameworks de agentes.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Herramientas educativas de ensenanza de pensamiento critico: el modelo genera explicaciones desglosadas paso a paso, adecuadas para tutoria de logica y matematicas en ingles, aprovechando su ajuste en cadenas de razonamiento estructuradas.
- Asistencia en investigacion academica exploratoria: util para generar hipotesis y borradores de razonamiento analitico donde el proceso (los pasos intermedios) importa tanto como la respuesta final.
- Prototipado de asistentes conversacionales multi-turno: su entrenamiento en dialogos de varios turnos permite mantener contexto en conversaciones de soporte o consulta tecnica en ingles, siempre con validacion humana.
- Analisis de datos e interpretacion de resultados: puede redactar interpretaciones estructuradas de conjuntos de datos o resultados experimentales como borrador inicial.
- Apoyo a depuracion y explicacion de codigo: aunque no se documenta tool calling, puede razonar paso a paso sobre fragmentos de codigo y explicar errores logicos en ingles.
- Despliegue local en hardware de consumo: al estar en GGUF Q8_0, se puede ejecutar con llama.cpp u Ollama en equipos sin GPU dedicada de gama alta, util para pruebas offline y entornos con requisitos de privacidad.
- Generacion de material didactico de resolucion de problemas: producir enunciados y soluciones paso a paso para cursos de matematicas o logica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 3,4 GB solo para los pesos (3.212.749.888 parametros x ~1 byte por parametro), mas overhead de contexto y cache KV; en la practica, entre 4 y 6 GB dependiendo de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090, A100, H100). El modelo es pequeno y no requiere GPU de centro de datos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 8 GB o mas; tambien puede ejecutarse en CPU con llama.cpp, aunque con menor throughput.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (la model card incluye un Modelfile), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que su uso requeriria conversion a otro formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| QuetzaCOaTl-3B-Instruct-Q8 | 3,21B | no disponible | GGUF Q8_0 | Llama 3.2 Community | Fine-tune experimental de razonamiento CoT multi-turno; sin benchmarks |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128K tokens | safetensors, GGUF | Llama 3.2 Community | Modelo base oficial de Meta, con evaluaciones publicadas y soporte amplio |
| Qwen2.5-3B-Instruct | ~3B | 32K tokens (128K en variantes) | safetensors, GGUF | Apache 2.0 | Alternativa de tamano similar con licencia permisiva y soporte multilingue |
| Phi-3.5-mini-instruct | 3,8B | 128K tokens | safetensors, GGUF | MIT | Enfocado en razonamiento y codigo, con benchmarks publicados |

La comparativa se limita a datos publicos de cada modelo; no existen mediciones directas que comparen QuetzaCOaTl con estas alternativas, ya que el autor no publico evaluaciones.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no se garantiza estabilidad ni calidad consistente en produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base Llama-3.2-3B-Instruct.
- Solo disponible en ingles; no se documenta soporte de otros idiomas.
- Riesgo de alucinacion: la model card advierte que las salidas se basan en los datos de entrenamiento y deben verificarse criticamente, especialmente en decisiones importantes.
- Sesgos: el autor reconoce que el modelo puede exhibir sesgos presentes en los datos de entrenamiento.
- Conocimiento limitado al corte temporal de los datos de entrenamiento; no refleja informacion reciente.
- Puede fallar en tareas que requieren conocimiento del mundo real mas alla de sus datos de entrenamiento, segun la propia model card.
- Restricciones de licencia: se distribuye bajo la Llama 3.2 Community License Agreement; el uso comercial esta permitido con condiciones (incluida la politica de uso aceptable de Llama 3.2 y requisitos de atribucion en redistribucion, segun el NOTICE del repositorio).
- Unicamente se publica la cuantizacion Q8_0; quien necesite menor huella de memoria debera cuantizar a partir de los pesos originales, que no estan en este repositorio.
- Popularidad muy baja (62 descargas, 0 likes en el momento de la consulta): escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IndrasMirror/QuetzaCOaTl-3B-Instruct-Q8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Excido/Quetzacoatl
- Licencia Llama 3.2 Community: https://huggingface.co/IndrasMirror/QuetzaCOaTl-3B-Instruct-Q8/blob/main/LICENSES/Llama-3.2-Community-License.txt
- Aviso de atribucion (NOTICE): https://huggingface.co/IndrasMirror/QuetzaCOaTl-3B-Instruct-Q8/blob/main/NOTICE
