# mradermacher/Gemma-3-Gaia-PT-BR-4b-it-GGUF

## Resumen

Gemma-3-Gaia-PT-BR-4b-it-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo CEIA-UFG/Gemma-3-Gaia-PT-BR-4b-it, publicado por mradermacher. Se trata de una adaptacion al portugues brasileno del modelo multimodal Gemma 3 de Google en su variante de aproximadamente 4.000 millones de parametros, orientada a tareas conversacionales y ajustada por el Centro de Excelencia en Inteligencia Artificial de la Universidad Federal de Goias (CEIA-UFG). El repositorio que nos ocupa no es el modelo original, sino una coleccion de cuantizaciones estaticas generadas para facilitar su ejecucion en hardware de consumo mediante llama.cpp y derivados.

El modelo base parte de la arquitectura transformer de Gemma 3, con capacidades multimodales (procesamiento de imagen y texto) y una ventana de contexto amplia. Los pesos originales en safetensors suman 3.880.263.168 parametros, lo que corresponde a la variante "4b" de la familia Gemma 3. La licencia aplicable es la Gemma license, propia de Google, con sus terminos de uso asociados.

La relevancia de esta distribucion radica en que permite desplegar un modelo afinado para portugues brasileno en entornos con recursos limitados, desde estaciones de trabajo con una sola GPU consumer hasta equipos con CPU y RAM moderada, algo que no seria viable con los pesos originales en precision completa. El repositorio incluye cuantizaciones desde Q2_K (1,8 GB) hasta f16 (7,9 GB), ademas de los suplementos multimodales mmproj necesarios para el procesamiento de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3, multimodal texto-imagen) |
| Parametros totales | 3.880.263.168 (aproximadamente 3,9 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3, sin dato concreto) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | portugues (pt), segun la model card; portugues brasileno por el ajuste del modelo base |
| Licencia | gemma (Gemma license de Google) |
| Formato de pesos | GGUF (con suplementos mmproj para multimodalidad) |

## Arquitectura y entrenamiento

El modelo base CEIA-UFG/Gemma-3-Gaia-PT-BR-4b-it es una adaptacion de Gemma 3, la familia de modelos abiertos de Google basada en transformer con atencion multimodal. Gemma 3 incorpora procesamiento de imagenes mediante un proyector multimodal (mmproj), que en esta distribucion se ofrece como archivo separado en cuantizaciones Q8_0 y f16. El ajuste realizado por CEIA-UFG esta orientado al portugues brasileno, aunque la model card del repositorio cuantizado no detalla la composicion del dataset de ajuste, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO. Esos datos corresponden al modelo base y no estan disponibles en la informacion proporcionada.

La contribucion de mradermacher se limita a la cuantizacion estatica de los pesos originales en safetensors al formato GGUF, sin entrenamiento adicional. La model card indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que existe una version alternativa con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/Gemma-3-Gaia-PT-BR-4b-it-i1-GGUF. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en esta ficha.

## Capacidades

- Generacion de texto conversacional en portugues brasileno, con ajuste especifico para ese idioma.
- Procesamiento multimodal texto-imagen gracias a los suplementos mmproj (Q8_0 y f16) incluidos en el repositorio.
- Razonamiento general y respuesta a instrucciones, heredado de Gemma 3.
- Soporte de conversaciones multi-turno mediante plantillas de chat compatibles con llama.cpp.
- Capacidad de ejecucion en entornos con recursos limitados gracias a las multiples cuantizaciones.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que permite servir el modelo mediante APIs compatibles con OpenAI.
- No se documentan en la informacion disponible capacidades especificas de tool calling, function calling, agentes o modo thinking.
- Capacidades multilingues: la model card declara unicamente portugues; no se confirma soporte de otros idiomas.

## Casos de uso

- Atencion al cliente en portugues brasileno: el modelo puede gestionar conversaciones multi-turno en ese idioma con un consumo de VRAM reducido (2,5-2,6 GB en Q4_K_M), adecuado para desplegar en servidores modestos o en el borde.
- Asistentes virtuales locales: al caber en GPU consumer y en CPU con RAM moderada, permite ejecutar un asistente conversacional en portugues sin depender de servicios en la nube.
- Procesamiento de documentos con imagenes: gracias a los suplementos mmproj, puede extraer informacion de capturas, formularios o imagenes junto con texto, util para digitalizacion de tramites en portugues.
- Prototipado rapido de aplicaciones NLP en portugues: las cuantizaciones Q4_K_S y Q4_K_M (marcadas como "fast, recommended") permiten iterar con latencia baja en equipos de desarrollo.
- Educacion y tutoria automatizada: el ajuste al portugues brasileno lo hace adecuado para generar material didactico y responder dudas de estudiantes en ese idioma.
- Investigacion academica sobre modelos pequenos en lenguas de bajos recursos: al ser una adaptacion de CEIA-UFG, sirve como referencia para estudiar el impacto del ajuste en portugues sobre Gemma 3.
- Despliegue en entornos con CPU: las cuantizaciones Q2_K a Q4_K_M permiten inferencia en llama.cpp sobre CPU, util para demos y entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~1,8 GB; Q3_K_S ~2,0 GB; Q3_K_M ~2,2 GB; Q3_K_L ~2,3 GB; IQ4_XS ~2,4 GB; Q4_K_S ~2,5 GB; Q4_K_M ~2,6 GB; Q5_K_S y Q5_K_M ~2,9 GB; Q6_K ~3,3 GB; Q8_0 ~4,2 GB; f16 ~7,9 GB. A estas cifras hay que sumar el suplemento mmproj (0,7 GB en Q8_0 o 1,0 GB en f16) si se usa la modalidad multimodal.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM o superior puede ejecutar las cuantizaciones Q4 a Q8 con comodidad; una RTX 3060, RTX 4060, RTX 4090 o A100/H100 son sobradamente capaces. Las cuantizaciones Q4_K_S y Q4_K_M estan pensadas para equipos modestos.
- Cabe en GPU consumer: si, desde tarjetas con 4 GB de VRAM para cuantizaciones Q2-Q3, y con 6-8 GB para Q4-Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere compatibilidad con servidores de API tipo OpenAI. La libreria declarada es transformers, pero el formato GGUF esta pensado para llama.cpp y derivados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma-3-Gaia-PT-BR-4b-it-GGUF (este) | ~3,9 mil millones | no disponible | portugues | gemma | GGUF |
| CEIA-UFG/Gemma-3-Gaia-PT-BR-4b-it (modelo base) | ~3,9 mil millones | no disponible | portugues | gemma | safetensors |
| mradermacher/Gemma-3-Gaia-PT-BR-4b-it-i1-GGUF (cuantizaciones imatrix) | ~3,9 mil millones | no disponible | portugues | gemma | GGUF |
| Gemma 3 4b-it original (Google) | ~3,9 mil millones | no disponible | multilingue | gemma | safetensors, GGUF |

La comparativa de rendimiento con alternativas no esta disponible, ya que no se han publicado benchmarks en la informacion proporcionada. La diferencia principal frente al modelo base es el formato GGUF y la cuantizacion; frente a la version i1-GGUF, esta distribucion ofrece cuantizaciones estaticas en lugar de ponderadas con imatrix.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Gemma 3, puede heredar sesgos del modelo original y del corpus de ajuste en portugues.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se han publicado evaluaciones especificas de fiabilidad.
- Limitaciones de contexto o idioma: la model card declara unicamente portugues; no se confirma soporte de otros idiomas ni la longitud exacta de contexto.
- Restricciones de licencia: la licencia Gemma de Google impone terminos de uso, incluida la politica de uso aceptable de Gemma; es necesario revisar las condiciones para uso comercial.
- Caveats para produccion: las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") degradan la calidad; para produccion se recomienda Q4_K_M o superior. Las cuantizaciones estaticas pueden rendir peor que las imatrix del repositorio i1-GGUF en tareas sensibles.
- El repositorio ocupa 37,3 GB en total, pero cada archivo individual pesa entre 1,8 y 7,9 GB; hay que descargar solo la cuantizacion necesaria.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-3-Gaia-PT-BR-4b-it-GGUF
- Modelo base: https://huggingface.co/CEIA-UFG/Gemma-3-Gaia-PT-BR-4b-it
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemma-3-Gaia-PT-BR-4b-it-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-3-Gaia-PT-BR-4b-it-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
