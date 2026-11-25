# mradermacher/DaisyRose-27B-i1-GGUF

## Resumen

DaisyRose-27B-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo RadixArk/DaisyRose-27B, un transformer denso de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones). El trabajo de cuantización lo firma mradermacher, un perfil habitual en Hugging Face especializado en convertir pesos de modelos abiertos a formatos GGUF optimizados para inferencia local con llama.cpp y derivados. El pipeline declarado en la ficha de Hugging Face es `reinforcement-learning`, y las etiquetas del autor incluyen `qwen3.8`, lo que sugiere una base derivada de la familia Qwen 3.8, aunque no se detalla la composición exacta del entrenamiento.

El modelo resuelve el problema práctico de ejecutar un modelo de 27B en hardware de consumo o en servidores modestos: los cuantizados i1 con imatrix permiten reducir el peso de 11,3 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K), cubriendo desde GPUs de 12-16 GB hasta estaciones con 24 GB o más. La model card indica además que se trata de un modelo de visión, con ficheros mmproj disponibles en el repositorio estático hermano, lo que amplía su aplicabilidad a tareas multimodales.

La relevancia actual reside en la combinación de tamaño (27B, un punto dulce entre los 7B-14B y los 70B), licencia Apache 2.0 (permisiva para uso comercial) y una batería amplia de cuantizaciones IQ que priorizan calidad por bit. La información pública disponible es escasa en cuanto a arquitectura interna, datos de entrenamiento y benchmarks; esta ficha refleja únicamente lo verificable en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante interna; etiqueta del autor: `qwen3.8`) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (más fichero imatrix) |
| Idiomas soportados | inglés (según model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer denso de 27,3B parámetros. Las etiquetas del autor (`qwen3.8`, `reinforcement-learning`) apuntan a una base de la familia Qwen y a un proceso de ajuste con aprendizaje por refuerzo, pero no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones i1 (importancia-matrix) a partir del modelo base RadixArk/DaisyRose-27B. El uso de imatrix permite asignar precisión de forma no uniforme a los tensores según su importancia, lo que mejora la perplejidad de las cuantizaciones de baja tasa de bits frente a las cuantizaciones estáticas equivalentes. La model card indica que se trata de un modelo de visión y que los ficheros mmproj, si existen, residen en el repositorio estático `mradermacher/DaisyRose-27B-GGUF`.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline `reinforcement-learning` indican un modelo ajustado para diálogo multi-turno.
- Procesamiento de visión: la model card lo declara explícitamente como modelo de visión, con ficheros mmproj en el repositorio estático.
- Razonamiento y matemáticas: no hay documentación específica en la información disponible.
- Generación de código: no hay documentación específica en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés; no se documentan otros idiomas.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local: con cuantizaciones i1-Q4_K_M (17,1 GB) el modelo cabe en una GPU de 24 GB y permite desplegar un chatbot multi-turno en inglés sin depender de APIs externas, útil para prototipos y entornos con requisitos de privacidad.
- Análisis de documentos con imágenes: al ser un modelo de visión, puede emplearse para extraer información de capturas, diagramas o formularios escaneados, combinando el fichero mmproj con el GGUF principal en llama.cpp.
- Evaluación de modelos ajustados con RL: investigadores que quieran comparar el comportamiento de un modelo entrenado con refuerzo frente a su base pueden usar las cuantizaciones i1 para iterar rápidamente en hardware de consumo.
- Despliegue en estaciones de trabajo con 16 GB de VRAM: las cuantizaciones i1-IQ3_S (12,9 GB) e i1-IQ4_XS (15,6 GB) permiten ejecutar el modelo en GPUs consumer de gama alta (RTX 4080, RTX 4090 con margen) manteniendo una calidad razonable gracias al imatrix.
- Generación de cuantizaciones propias: el fichero imatrix incluido (0,1 GB) permite a otros usuarios generar sus propias cuantizaciones con calibración específica para su dominio, algo relevante para equipos que necesitan ajustar el equilibrio tamaño/calidad.
- Servicio de inferencia en CPU con llama.cpp: las cuantizaciones más pequeñas (i1-Q2_K, 11,3 GB; i1-Q3_K_S, 12,4 GB) permiten ejecutar el modelo en servidores sin GPU, con throughput limitado pero suficiente para tareas por lotes o generación asíncrona.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los pesos, sin contar KV cache):
  - i1-Q2_K: 11,3 GB
  - i1-Q3_K_S: 12,4 GB
  - i1-IQ3_S: 12,9 GB
  - i1-IQ3_M: 13,1 GB
  - i1-Q3_K_M: 13,8 GB
  - i1-Q3_K_L: 15,0 GB
  - i1-IQ4_XS: 15,6 GB
  - i1-Q4_0 / i1-Q4_K_S: 15,9 GB
  - i1-Q4_K_M: 17,1 GB
  - i1-Q4_1: 17,4 GB
  - i1-Q5_K_S: 19,1 GB
  - i1-Q5_K_M: 19,7 GB
  - i1-Q6_K: 22,5 GB
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4-Q6; RTX 4080 / 4070 Ti Super (16 GB) para IQ3-IQ4; A100 40/80 GB o H100 para despliegues en producción con cuantizaciones altas y contexto largo.
- ¿Cabe en GPU consumer? Sí: las cuantizaciones IQ3 y Q4 caben en GPUs de 16 GB; las Q5 y Q6 requieren 24 GB. Las cuantizaciones Q2/Q3 pueden ejecutarse parcialmente en GPUs de 12 GB con offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (no confirmado para esta variante concreta).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-i1-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF (i1 imatrix) | Modelo de visión según model card; cuantizaciones de 11,3 a 22,5 GB |
| RadixArk/DaisyRose-27B (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; referencia para comparar degradación por cuantización |
| DaisyRose-27B-GGUF (estático) | 27,3B | no disponible | Apache 2.0 | GGUF (estático) | Mismo modelo con cuantizaciones estáticas; incluye ficheros mmproj para visión |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- Alucinación: no hay documentación sobre tasas de alucinación ni sobre el proceso de alineamiento; se recomienda validación en dominios críticos.
- Sesgos: no se documentan sesgos conocidos; al ser un modelo ajustado con RL sin documentación del dataset, el riesgo de sesgos no evaluados es real.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base en el enlace proporcionado por el autor (`RadixArk/DaisyRose-27B/blob/main/LICENSE`) antes de integrarlo en productos.
- Cuantización: las cuantizaciones Q2 y Q3 introducen degradación de calidad medible; para producción se recomienda Q4_K_M o superior. Las cuantizaciones i1 con imatrix mitigan parte de esta degradación, pero no la eliminan.
- Visión: los ficheros mmproj no están en este repositorio sino en el estático; es necesario descargarlos por separado para usar las capacidades multimodales.
- Repositorio: 220,5 GB de tamaño total; conviene descargar únicamente la cuantización necesaria mediante `huggingface-cli download` con filtros.
- Fecha de creación: el repositorio está fechado en noviembre de 2026 según los metadatos; verificar la vigencia del modelo base antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/DaisyRose-27B-i1-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Licencia del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Repositorio de cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/DaisyRose-27B-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#DaisyRose-27B-i1-GGUF
- FAQ y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
