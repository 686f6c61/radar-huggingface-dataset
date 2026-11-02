# mradermacher/Luna-Qwen3.5-0.8B-v5-GGUF

## Resumen

Luna-Qwen3.5-0.8B-v5-GGUF es la version cuantizada en formato GGUF del modelo claekchen/Luna-Qwen3.5-0.8B-v5, publicada por el usuario mradermacher, especializado en la conversion de pesos a dicho formato. El modelo base es un fine-tune sobre la familia Qwen3.5, con 752.393.024 parametros totales (aproximadamente 0,75 mil millones) y orientado a conversacion en ingles. Esta version GGUF esta pensada para inferencia local en CPU o GPU de gama baja mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que el modelo base no dispone de model card publica con detalles de entrenamiento, licencia o benchmarks, por lo que la informacion disponible se limita a los metadatos del repositorio y a la lista de cuantizaciones generadas. El repositorio incluye ademas ficheros mmproj (Q8_0 y f16), lo que sugiere que el modelo base incorpora capacidad multimodal (vision), aunque no se documenta en la informacion proporcionada.

El autor de la cuantizacion mantiene un flujo de trabajo estandar: cuantizaciones estaticas K-quant e IQ-quant, sin versiones ponderadas/imatrix disponibles en el momento de la publicacion. El repo ocupa 7,7 GB en total, aunque cada fichero individual es de pequeno tamano (entre 0,2 y 1,6 GB), lo que facilita su descarga y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5, presumiblemente transformer, sin confirmar) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y mmproj f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. Por el nombre (Qwen3.5) cabe inferir que deriva de la familia Qwen, pero no se confirma si emplea attention estandar, attention lineal, arquitectura hibrida o mezcla de expertos. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. El unico dato estructural verificable es el recuento de parametros (752.393.024) obtenido de los safetensors del modelo base.

La unica innovacion tecnica documentada corresponde al proceso de cuantizacion: el autor genera cuantizaciones estaticas (no ponderadas/imatrix) y ofrece ficheros mmproj separados para el componente multimodal, lo que permite cargar el modelo con proyeccion visual en llama.cpp. No se documentan innovaciones de arquitectura ni de decodificacion especulativa en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Soporte multimodal probable (vision) por la presencia de ficheros mmproj Q8_0 y f16, aunque no se detalla en la model card.
- Compatibilidad con `transformers` y con el ecosistema GGUF (llama.cpp y derivados).
- Etiqueta `endpoints_compatible`, lo que indica compatibilidad con endpoints de inferencia estandar.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matematicas avanzadas ni otros idiomas distintos del ingles.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: el modelo, con menos de 800 millones de parametros, cabe en una unica GPU de consumo o incluso en CPU, lo que permite iterar rapidamente en un portatil sin depender de servicios en la nube.
- Despliegue en dispositivos de borde: las cuantizaciones Q2_K a Q4_K_S ocupan entre 0,5 y 0,6 GB, lo que posibilita ejecucion en Raspberry Pi, moviles de gama alta o sistemas embebidos con llama.cpp.
- Pruebas de pipelines de inferencia GGUF: util para validar integraciones con llama.cpp, Ollama o servidores compatibles antes de migrar a modelos mayores de la misma familia.
- Generacion de texto de bajo coste en lotes: para tareas de resumen, clasificacion o reescritura de textos cortos en ingles donde el throughput prima sobre la calidad.
- Experimentacion con modelos multimodales ligeros: los ficheros mmproj permiten probar flujos de vision-lenguaje en entornos con VRAM reducida, aunque la calidad no esta documentada.
- Educacion y divulgacion: ejemplo practico de cuantizacion y despliegue de modelos pequenos para talleres o cursos sobre IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5-0,6 GB para Q2_K a Q4_K_M; 0,7 GB para Q5 y Q6_K; 0,9 GB para Q8_0; 1,6 GB para f16. Anadir 0,2-0,3 GB si se usa el componente mmproj.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para f16; integradas o de gama baja (GTX 1050, GTX 1650, RTX 3050) suficientes para cuantizaciones Q4-Q8.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, incluidas las integradas con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF y `transformers` para los pesos originales.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Luna-Qwen3.5-0.8B-v5-GGUF | 752.393.024 | no disponible | no disponible | GGUF | HuggingFace |
| Qwen2.5-0.5B-Instruct | ~0,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | HuggingFace |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens (segun documentacion publica de HuggingFace) | Apache 2.0 | safetensors, GGUF | HuggingFace |

La comparativa se ofrece a titulo orientativo: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- La model card del modelo base no esta disponible en la informacion proporcionada; se desconoce el proceso de entrenamiento, los datos utilizados y los sesgos potenciales.
- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial. Conviene contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion elevado por el reducido tamano (menos de 1.000 millones de parametros), especialmente en tareas de conocimiento factual.
- La longitud de contexto no esta documentada, lo que dificulta planificar casos de uso con conversaciones largas o documentos extensos.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y fidelidad.
- No hay cuantizaciones ponderadas/imatrix disponibles, que suelen ofrecer mejor calidad por bit que las estaticas.
- El modelo base parece ser un fine-tune de la comunidad (`claekchen`) sin publicacion asociada; su procedencia y validacion son inciertas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Luna-Qwen3.5-0.8B-v5-GGUF
- Modelo base: https://huggingface.co/claekchen/Luna-Qwen3.5-0.8B-v5
- Pagina de descargas del autor: https://hf.tst.eu/model#Luna-Qwen3.5-0.8B-v5-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos al autor: https://huggingface.co/mradermacher/model_requests
