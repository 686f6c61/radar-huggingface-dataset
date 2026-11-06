# mradermacher/cantonese-1.2-1.7b-GGUF

## Resumen

cantonese-1.2-1.7b-GGUF es la distribucion en formato GGUF del modelo cantonese-1.2-1.7b, desarrollado originalmente por cantonese-dev y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 1.733.157.888 parametros (aproximadamente 1,7 mil millones) orientado a tareas de generacion de texto, publicado bajo licencia Apache 2.0. Esta version GGUF esta pensada para inferencia eficiente en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles.

El modelo base, cantonese-1.2-1.7b, forma parte de la familia cantonese-1.2 de cantonese-dev. La model card del repositorio cuantizado no incluye informacion sobre arquitectura interna, composicion del dataset de entrenamiento, longitud de contexto ni capacidades especificas mas alla de la generacion de texto; la etiqueta de idioma declarada es unicamente `en`.

La relevancia de esta ficha radica en que el repositorio ofrece una bateria completa de cuantizaciones estaticas (desde Q2_K hasta f16) que permiten desplegar el modelo en hardware modesto, con tamanos que van de 0,7 GB a 3,6 GB. Es una opcion practica para experimentacion local y para pipelines que requieran un modelo pequeno y ligero con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, inferido por el formato de pesos; no confirmado en la informacion) |
| Parametros totales | 1.733.157.888 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base cantonese-1.2-1.7b. El recuento de parametros (1.733.157.888) es coherente con un transformer decoder-only de ~1,7B, pero este dato no se confirma explicitamente en la model card. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

El repositorio cuantizado documenta el proceso de conversion a GGUF con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversion directa desde pesos Hugging Face. El autor senala que las cuantizaciones ponderadas con imatrix no estan disponibles en el momento de la publicacion y que solo se han generado cuantizaciones estaticas. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto autoregresiva en ingles, segun la etiqueta de idioma declarada.
- No se documentan capacidades de razonamiento avanzado, codigo o matematicas en la informacion disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles mas alla del ingles declarado.
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (1,1 GB) el modelo cabe en cualquier portatil moderno y permite iterar sobre prompts sin coste de API.
- Generacion de texto en entornos sin conectividad: el formato GGUF con llama.cpp permite ejecutar el modelo en CPU en dispositivos aislados o de borde.
- Filtrado y clasificacion de texto ligera: un modelo de 1,7B cuantizado a Q4 puede procesar volumenes moderados de documentos en lotes sobre GPU de consumo.
- Educacion e investigacion: util como base para experimentos de cuantizacion, evaluacion de degradacion por precision o comparativas de rendimiento en hardware modesto.
- Integracion en aplicaciones de escritorio: el tamano reducido (0,7-1,9 GB segun cuantizacion) permite empaquetar el modelo dentro de aplicaciones de escritorio con requisitos de disco acotados.
- Pruebas de pipelines de inferencia: sirve como modelo de sustitucion para validar infraestructura (Ollama, llama.cpp, servidores compatibles con OpenAI) antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB para cuantizaciones Q4-Q5; unos 4 GB para f16 (tamano de fichero 3,6 GB mas overhead de contexto).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo es pequeno para GPUs de datacenter.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas; las cuantizaciones Q4_K_M (1,1 GB) caben incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (etiqueta `endpoints_compatible`), y cualquier runtime que soporte GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cantonese-1.2-1.7b (este) | 1,73B | no disponible | Apache 2.0 | GGUF / safetensors | Cuantizaciones estaticas de mradermacher |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de alternativas en la informacion proporcionada |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion facilitada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado principalmente en ingles, es probable un sesgo linguistico y cultural hacia ese idioma.
- Riesgo de alucinacion inherente a modelos de 1,7B: la capacidad de razonamiento y factualidad es limitada en comparacion con modelos mayores.
- La longitud de contexto no esta documentada; no se debe asumir una ventana amplia en produccion sin verificacion empirica.
- El idioma declarado es unicamente ingles; el uso en otros idiomas (incluido el castellano) no esta garantizado y probablemente degradara la calidad.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo base cantonese-dev/cantonese-1.2-1.7b por si anade restricciones adicionales.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) degradan notablemente la calidad; el autor recomienda Q4_K_M o superior para uso practico.
- No hay cuantizaciones imatrix disponibles, lo que puede reducir la calidad frente a cuantizaciones ponderadas equivalentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/cantonese-1.2-1.7b-GGUF
- Modelo base: https://huggingface.co/cantonese-dev/cantonese-1.2-1.7b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#cantonese-1.2-1.7b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
