# mradermacher/Sushi-v1.3-GGUF

## Resumen

Sushi-v1.3-GGUF es la distribucion en formato GGUF del modelo Undi95/Sushi-v1.3, un modelo conversacional de gran tamano (aproximadamente 70.500 millones de parametros) publicado por el usuario Undi95 y cuantizado por mradermacher. El repositorio no incluye una model card propia mas alla de la informacion de cuantizacion: se trata de una conversion estatica de los pesos originales a distintos niveles de cuantizacion GGUF, pensada para su uso con llama.cpp y ecosistemas compatibles (Ollama, LM Studio, etc.). El modelo esta etiquetado como conversacional y solo declara soporte para ingles.

La relevancia de esta ficha reside en que permite ejecutar un modelo de escala 70B en hardware mas modesto que el requerido por los pesos en precision completa, gracias a las cuantizaciones que van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB). Al tratarse de una cuantizacion de un modelo base de terceros, sus capacidades, sesgos y limitaciones heredan las del modelo original Undi95/Sushi-v1.3, sobre el que no se proporciona informacion tecnica detallada en la documentacion disponible.

No se dispone de datos sobre arquitectura interna, composicion del dataset de entrenamiento, contexto maximo ni licencia en la informacion proporcionada; todos esos campos se indican como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 70.553.706.560 (aproximadamente 70,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se proporciona informacion sobre la arquitectura del modelo base Undi95/Sushi-v1.3 en la documentacion disponible. Por el numero de parametros (aproximadamente 70,5B) y la libreria declarada (transformers), se trata de un modelo de gran escala, pero no se especifica si emplea un transformer denso, una arquitectura MoE, SSM o hibrida. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion.

Respecto a esta distribucion concreta, el autor de las cuantizaciones (mradermacher) indica que son cuantizaciones estaticas generadas con un flujo de conversion a partir de los pesos del modelo original en formato transformers. Se ofrecen tambien cuantizaciones ponderadas/imatrix en un repositorio separado (Sushi-v1.3-i1-GGUF), que suelen ofrecer mejor calidad que las estaticas de tamano equivalente. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Uso como modelo de chat multi-turno en el ecosistema llama.cpp y derivados (Ollama, LM Studio, etc.).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite su despliegue en infraestructuras de inferencia compatibles.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Chat conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama usando cuantizaciones Q4_K_M (42,6 GB) o Q5_K_M (50,0 GB) para mantener conversaciones multi-turno en una maquina con suficiente memoria, sin depender de servicios en la nube.
- Prototipado de asistentes en estaciones de trabajo de gama alta: con cuantizaciones Q3_K_L (37,2 GB) o IQ4_XS (38,4 GB) es posible ejecutar el modelo en equipos con 48 GB de VRAM o con memoria unificada, agilizando iteraciones de prompt engineering.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece once variantes de cuantizacion, lo que permite medir el impacto de la compresion en la calidad de las respuestas para un mismo modelo base.
- Despliegue en servidores con multiples GPU: las variantes Q6_K (58,0 GB) y Q8_0 (75,1 GB) permiten servir el modelo con alta fidelidad respecto a los pesos originales en nodos con 2-4 GPU.
- Generacion de texto creativo y redaccion en ingles: el caracter conversacional del modelo base lo hace adecuado para tareas de escritura asistida, siempre que se validen las salidas por el riesgo de alucinacion inherente a los modelos de lenguaje.
- Base para experimentacion e investigación: al ser una cuantizacion de un modelo de 70B, sirve como banco de pruebas para estudiar tecnicas de cuantizacion, latencia y consumo de memoria en inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, sin contar overhead de contexto y cache KV):
  - Q2_K: 26,5 GB
  - Q3_K_S: 31,0 GB
  - Q3_K_M: 34,4 GB
  - Q3_K_L: 37,2 GB
  - IQ4_XS: 38,4 GB
  - Q4_K_S: 40,4 GB
  - Q4_K_M: 42,6 GB
  - Q5_K_S: 48,8 GB
  - Q5_K_M: 50,0 GB
  - Q6_K: 58,0 GB
  - Q8_0: 75,1 GB
- GPU recomendadas: no disponibles de forma explicita; por tamano, las cuantizaciones Q4 requieren al menos 48 GB de VRAM (A6000, A100 80GB, H100, o configuraciones multi-GPU como 2x RTX 4090 con 24 GB cada una). Las variantes Q8_0 requieren 80 GB o mas.
- Cabe en GPU de consumo: parcialmente. Una RTX 4090 (24 GB) no puede alojar ninguna de las cuantizaciones completas en VRAM; seria necesario usar offloading a RAM del sistema o configuraciones multi-GPU. En equipos con memoria unificada (por ejemplo, Apple Silicon con 64 GB o mas) es viable ejecutar cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base tambien puede servirse con transformers; para vLLM o TGI seria necesario usar los pesos originales o convertir el GGUF, lo cual no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada (no se indican benchmarks, contexto ni licencia del modelo base), por lo que la comparativa cuantitativa no esta disponible. Como referencia estructural, esta distribucion comparte categoria con otras cuantizaciones GGUF de modelos de aproximadamente 70B publicadas por el mismo autor (mradermacher), pero no se aportan datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no haber informacion sobre el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma u otros.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad factual.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta disponible, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada. Antes de un uso comercial es imprescindible verificar la licencia del modelo base Undi95/Sushi-v1.3 en su repositorio original.
- Cuantizaciones de baja calidad: el autor advierte que Q3_K_M es de "lower quality"; para produccion se recomienda Q4_K_M o superior, o bien las variantes imatrix del repositorio Sushi-v1.3-i1-GGUF.
- Ficheros multiparte: Q6_K y Q8_0 se distribuyen en dos partes que deben concatenarse antes de su uso, segun las instrucciones referenciadas en la model card.
- Trazabilidad: al ser una cuantizacion de terceros, cualquier incidencia de calidad debe contrastarse con el modelo original; el repositorio no incluye evaluaciones propias.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Sushi-v1.3-GGUF
- Modelo base: https://huggingface.co/Undi95/Sushi-v1.3
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Sushi-v1.3-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Sushi-v1.3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
