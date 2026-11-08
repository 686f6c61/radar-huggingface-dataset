# mradermacher/Grasmere-E4B-GGUF

## Resumen

Grasmere-E4B-GGUF es la version cuantizada en formato GGUF del modelo jonpojonpo/Grasmere-E4B, publicada por mradermacher, un autor conocido en Hugging Face por distribuir cuantizaciones de modelos open source para su uso con llama.cpp y otros motores compatibles con GGUF. El modelo base es un transformer de aproximadamente 7.518 millones de parametros (7,5B), disenado especificamente para lenguas minoritarias de las islas britanicas: gales (cy), irlandes (ga), gaelico escoces (gd), escoces (sco) e ingles (en), con soporte declarado de tool calling.

La relevancia de este modelo radica en su especializacion linguistica: la mayoria de los LLM disponibles estan dominados por el ingles y unas pocas lenguas mayoritarias, dejando a las lenguas celtas y al escoces con cobertura muy limitada. Grasmere-E4B aborda ese hueco con una licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La version GGUF facilita el despliegue en hardware de consumo mediante cuantizaciones de 2 a 8 bits.

Esta ficha cubre la variante GGUF. La informacion publica disponible sobre el modelo base es escasa: no se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; probablemente basado en una arquitectura tipo Gemma/E4B, sin confirmar) |
| Parametros totales | 7.518.069.290 (aproximadamente 7,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16, mmproj-Q8_0, mmproj-f16 (multi-modal supplement) |
| Idiomas soportados | Gales (cy), irlandes (ga), gaelico escoces (gd), escoces (sco), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original presumiblemente en safetensors |
| Tamano del repositorio | 26,8 GB |
| Libreria | transformers (metadato); ejecutable con llama.cpp |
| Cuantizaciones con imatrix | disponibles en mradermacher/Grasmere-E4B-i1-GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base jonpojonpo/Grasmere-E4B. El recuento de parametros (7,5B) y el sufijo "E4B" sugieren una arquitectura transformer de escala media, posiblemente derivada de una familia tipo Gemma, pero esto no esta confirmado en la informacion proporcionada. El repositorio GGUF incluye ficheros `mmproj` (multi-modal supplement), lo que indica que el modelo base incorpora algun componente multimodal, aunque su naturaleza exacta (vision, audio u otro) no se detalla.

Tampoco se han publicado datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo esta etiquetado como "conversational" y con soporte de tool calling, lo que sugiere un ajuste supervisado orientado a dialogos y uso de herramientas, pero los detalles de ese ajuste no estan disponibles.

## Capacidades

- Generacion de texto conversacional en gales, irlandes, gaelico escoces, escoces e ingles.
- Soporte de tool calling / function calling, segun las etiquetas del repositorio.
- Capacidad multimodal indicada por la presencia de ficheros `mmproj` (complemento multi-modal), sin especificar la modalidad concreta.
- Uso en conversaciones multi-turno (etiqueta "conversational").
- Capacidades multilingues limitadas a las cinco lenguas declaradas; no se documenta soporte para castellano ni otras lenguas.
- No se documentan modos especiales como thinking mode, razonamiento extendido o generacion de codigo especializada.

## Casos de uso

- Atencion al ciudadano en lenguas minoritarias: el modelo puede gestionar consultas administrativas o informativas en gales, irlandes o gaelico escoces, cubriendo un nicho que los LLM generalistas no atienden con calidad. Su licencia Apache 2.0 permite integrarlo en servicios publicos sin coste de licencia.
- Traduccion y normalizacion de textos entre ingles y lenguas celtas: util en proyectos de preservacion linguistica, digitalizacion de documentacion oficial o generacion de contenido bilingue para administraciones y medios locales.
- Asistentes conversacionales para comunidades linguisticas: despliegue en entornos con recursos limitados gracias a las cuantizaciones Q4_K_S (5,3 GB) y Q2_K (4,5 GB), que caben en GPUs de consumo.
- Automatizacion con tool calling: el modelo puede invocar APIs o funciones en flujos de trabajo donde la interaccion con el usuario se realiza en escoces o gales, por ejemplo reservas, consultas de horarios o formularios guiados.
- Educacion y aprendizaje de idiomas: generacion de ejercicios, dialogos de practica y explicaciones gramaticales en las lenguas cubiertas, integrable en plataformas de e-learning.
- Investigacion en PLN de bajos recursos: servir como linea base o punto de partida para experimentos de fine-tuning sobre lenguas celtas, dado su tamano manejable y su licencia permisiva.
- Prototipado rapido en local: con llama.cpp u Ollama, el modelo permite iterar sobre aplicaciones linguisticas sin infraestructura cloud, usando la cuantizacion Q4_K_S como opcion equilibrada entre calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: aproximadamente 4,5 GB de pesos, unos 5-6 GB de VRAM en total con contexto moderado.
  - Q4_K_S: aproximadamente 5,3 GB de pesos, unos 6-7 GB de VRAM.
  - Q8_0: en torno a 8 GB de pesos, unos 9-10 GB de VRAM.
  - f16: aproximadamente 15 GB de pesos, unos 16-18 GB de VRAM.
- GPU recomendadas: para Q4_K_S basta una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4070; para f16 se recomienda una RTX 4090 (24 GB), A100 40 GB o H100.
- Cabe en GPU de consumo: si, con cuantizaciones Q2_K a Q5_K en tarjetas de 8-12 GB; las cuantizaciones mayores requieren 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa (vLLM requiere pesos en safetensors para su ruta principal).
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Grasmere-E4B-GGUF | 7,5B | no disponible | cy, ga, gd, sco, en | Apache 2.0 | GGUF |
| MERaLiON-G4-E4B-GGUF | 7B (aproximado) | no disponible | no disponible | no disponible | GGUF |
| Modelos generalistas de 7-8B (p. ej. familia Llama/Mistral) | 7-8B | 8K-128K segun variante | Principalmente ingles y lenguas mayoritarias | Varía (a menudo comunitaria) | safetensors, GGUF |

La comparacion con modelos generalistas es la mas relevante: estos ofrecen mayor cobertura de tareas y benchmarks publicos, pero carecen de especializacion en lenguas celtas y escoces. MERaLiON-G4-E4B-GGUF, citado en la busqueda web, es otro modelo de la misma familia de cuantizaciones de mradermacher con un tamano similar (7B), pero no se dispone de datos suficientes para una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar la calidad real del modelo frente a alternativas sin pruebas propias.
- Riesgo de alucinacion inherente a los LLM de este tamano, especialmente en lenguas de bajos recursos donde los datos de entrenamiento son escasos.
- Cobertura linguistica limitada a cinco lenguas; no se documenta soporte para castellano, frances ni otras lenguas, lo que restringe su uso en entornos multilingues amplios.
- La informacion sobre el modelo base (dataset, contexto, arquitectura, ajuste) es practicamente inexistente, lo que dificulta auditar su comportamiento y sesgos.
- Posibles sesgos derivados de los datos de entrenamiento, no documentados por el autor.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base no imponga restricciones adicionales derivadas de su propio entrenamiento o de los datos utilizados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica falta de validacion por parte de la comunidad.
- Las cuantizaciones de muy baja precision (Q2_K) pueden degradar notablemente la calidad, especialmente en lenguas con vocabulario y morfologia complejos como el gales o el irlandes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Grasmere-E4B-GGUF
- Modelo base: https://huggingface.co/jonpojonpo/Grasmere-E4B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Grasmere-E4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Grasmere-E4B-GGUF
- Perfil del autor: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo comparable citado: https://huggingface.co/mradermacher/MERaLiON-G4-E4B-GGUF
