# mradermacher/EviOmni-nq_train-7B-GGUF

## Resumen

EviOmni-nq_train-7B-GGUF es la version cuantizada en formato GGUF del modelo HIT-TMG/EviOmni-nq_train-7B, publicada por el usuario mradermacher, especializado en generar cuantizaciones estaticas de modelos abiertos. El modelo original procede de HIT-TMG (grupo de investigacion en lenguaje y multimedia del Instituto de Tecnologia de Harbin) y cuenta con 7.615.616.512 parametros (aproximadamente 7,6 mil millones), lo que lo situa en la categoria de modelos de talla media aptos para inferencia en hardware de consumo.

La relevancia de esta publicacion radica en que permite ejecutar el modelo base mediante llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, etc.) sin necesidad de GPUs de datacenter. El repositorio incluye 11 variantes de cuantizacion que abarcan desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que ofrece un abanico amplio de compromisos entre calidad y requisitos de memoria.

La informacion disponible sobre el modelo base es limitada: la model card se centra en el proceso de cuantizacion y no detalla la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks. El modelo esta etiquetado como conversational y orientado al idioma ingles, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, sin detalles publicados) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base HIT-TMG/EviOmni-nq_train-7B en la documentacion disponible. El nombre sugiere un modelo de la familia EviOmni, pero no se detalla si emplea un transformer denso convencional, una variante MoE o alguna innovacion adicional. El recuento de parametros (7,6 B) es coherente con un transformer denso de talla media, pero se trata de una inferencia, no de un dato confirmado.

Tampoco se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni tecnicas destacables como decodificacion especulativa o atencion lineal. La model card del repositorio cuantizado se limita a describir el proceso de conversion a GGUF y las variantes generadas; no incluye detalles del entrenamiento original.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y disenado para mantener dialogos multi-turno.
- Idiomas: soporte declarado unicamente para ingles; no se garantiza un rendimiento fiable en castellano u otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede desplegarse con llama.cpp u Ollama para validar flujos de dialogo multi-turno en local antes de invertir en infraestructura mayor.
- Inferencia en equipos de desarrollo sin GPU dedicada: las cuantizaciones Q4_K_S y Q4_K_M (4,6-4,8 GB) permiten ejecutar el modelo en CPU con RAM modesta, lo que facilita pruebas offline y entornos air-gapped.
- Generacion de texto en pipelines por lotes: con la variante Q8_0 (8,2 GB) se obtiene una calidad cercana al original para tareas de resumen, redaccion o clasificacion en ingles dentro de procesos automatizados.
- Educacion e investigacion: al ser un modelo de 7,6 B con licencia MIT, sirve como base para experimentos academicos de ajuste fino o evaluacion comparativa sin restricciones comerciales.
- Despliegue en dispositivos de borde con recursos limitados: la variante Q2_K (3,1 GB) permite ejecutar el modelo en mini-PCs o portatiles con 8 GB de RAM, a costa de una perdida de calidad notable.
- Integracion en aplicaciones de escritorio: herramientas como LM Studio o GPT4All pueden cargar el GGUF directamente, habilitando asistentes locales de redaccion o consulta documental en ingles.
- Base para ajuste fino ligero: al disponer de pesos en safetensors en el modelo original, es posible aplicar LoRA o QLoRA y posteriormente recuantizar a GGUF para distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion:
  - Q2_K: aproximadamente 3,1 GB.
  - Q3_K_S: aproximadamente 3,6 GB.
  - Q3_K_M: aproximadamente 3,9 GB.
  - Q3_K_L: aproximadamente 4,2 GB.
  - IQ4_XS: aproximadamente 4,4 GB.
  - Q4_K_S: aproximadamente 4,6 GB.
  - Q4_K_M: aproximadamente 4,8 GB.
  - Q5_K_S: aproximadamente 5,4 GB.
  - Q5_K_M: aproximadamente 5,5 GB.
  - Q6_K: aproximadamente 6,4 GB.
  - Q8_0: aproximadamente 8,2 GB.
  - f16: aproximadamente 15,3 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, una RTX 3060 de 12 GB o superior puede alojar comodamente las cuantizaciones Q4-Q8. Para f16 se requiere una GPU con al menos 16 GB (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM para cuantizaciones Q4-Q5; las variantes Q2-Q3 pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con vLLM o TGI (si la arquitectura es soportada).
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a aspectos estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EviOmni-nq_train-7B-GGUF | 7,6 B | no disponible | MIT | GGUF | Cuantizaciones estaticas de mradermacher |
| Mistral-7B-Instruct | 7,2 B | 32 K (v0.2/v0.3) | Apache 2.0 | safetensors, GGUF | Referencia habitual en la categoria 7B |
| Llama 3.1 8B Instruct | 8,0 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Mayor contexto y ecosistema amplio |
| Qwen2.5-7B-Instruct | 7,6 B | 128 K | Apache 2.0 | safetensors, GGUF | Multilingue y con soporte de tool calling |

La comparativa se basa en caracteristicas publicas de cada modelo; no se dispone de datos de benchmarks del modelo analizado para contrastar rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; al ser un modelo entrenado sin documentacion publica sobre el dataset, no es posible evaluar sesgos especificos.
- Riesgo de alucinacion: inherente a los modelos generativos de esta talla; no se han publicado evaluaciones de fidelidad factual.
- Limitacion de idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas puede producir resultados degradados.
- Longitud de contexto: no disponible, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones significativas, pero conviene verificar la licencia del modelo base original (HIT-TMG/EviOmni-nq_train-7B) por si difiere.
- Caveat de produccion: la cuantizacion Q2_K y Q3_K_M presentan perdida de calidad notable segun la propia model card; para produccion se recomienda Q4_K_M o superior.
- Ausencia de benchmarks: no hay datos publicos que permitan estimar su rendimiento frente a alternativas, lo que incrementa el riesgo de adoptarlo sin evaluacion propia.
- Modelo base poco documentado: la falta de informacion sobre arquitectura y entrenamiento dificulta diagnosticar comportamientos anomalos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EviOmni-nq_train-7B-GGUF
- Modelo base: https://huggingface.co/HIT-TMG/EviOmni-nq_train-7B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#EviOmni-nq_train-7B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
