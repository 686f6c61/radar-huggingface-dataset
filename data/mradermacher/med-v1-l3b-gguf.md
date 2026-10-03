# mradermacher/Med-V1-L3B-GGUF

## Resumen

Med-V1-L3B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo nlm-dir/Med-V1-L3B, publicado por el usuario mradermacher, conocido por producir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. No se trata de un modelo entrenado desde cero, sino de una conversion del modelo base a distintos niveles de precision (desde Q2_K hasta f16), de modo que pueda ejecutarse en hardware de consumo sin necesidad de GPUs de datacenter.

El modelo base tiene 3.212.749.888 parametros (aproximadamente 3,2 mil millones), lo que lo situa en la categoria de modelos pequenos. Por la nomenclatura "L3B" y por la licencia declarada (llama3.2), todo apunta a que deriva de la familia Llama 3.2 3B, aunque el autor de la cuantizacion no lo confirma explicitamente en la model card. El prefijo "Med" sugiere un ajuste fino orientado al dominio medico, pero no hay documentacion publicada que detalle el dataset ni el proceso de entrenamiento.

La relevancia de este repositorio es practica: ofrece doce variantes cuantizadas con tamanos que van de 1,5 GB a 6,5 GB, lo que permite desplegar un modelo de 3,2B en equipos con poca VRAM o incluso en CPU. El repositorio tiene 211 descargas y 0 likes en el momento de la consulta, y solo declara soporte para ingles. Toda la informacion disponible proviene de la model card del cuantizador, que es escueta y no incluye detalles de arquitectura, entrenamiento ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer decoder-only por el formato GGUF y la libreria transformers, sin confirmacion del autor) |
| Parametros totales | 3.212.749.888 (3,2B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (el modelo base original probablemente en safetensors, no confirmado) |

## Arquitectura y entrenamiento

No hay informacion publicada en la model card sobre la arquitectura interna del modelo base nlm-dir/Med-V1-L3B, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El unico dato estructural disponible es el recuento de parametros (3.212.749.888) y el hecho de que el repositorio se distribuye en formato GGUF, lo que implica una arquitectura compatible con llama.cpp.

La model card del cuantizador incluye metadatos de la herramienta de conversion (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf), lo que indica que la conversion se hizo a partir de pesos en formato HuggingFace. Se trata de cuantizaciones estaticas: el autor senala explicitamente que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de publicar y que no hay planes confirmados de generarlas. La licencia llama3.2 y la nomenclatura "L3B" apuntan a una base Llama 3.2 3B, pero es una inferencia no verificada.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como "conversational" y "endpoints_compatible", lo que sugiere uso en chat multi-turno.
- Dominio medico (presunto): el prefijo "Med" del nombre indica un posible ajuste orientado a contenido clinico o biomedico, pero no hay documentacion que lo confirme ni que describa el alcance real.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no hay datos de rendimiento en otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en equipos modestos: con las cuantizaciones Q4_K_M (2,1 GB) o IQ4_XS (1,9 GB) el modelo puede ejecutarse en un portatil con 8 GB de RAM o en una GPU de gama media, lo que permite prototipar asistentes conversacionales sin infraestructura en la nube.
- Experimentacion en investigacion medica (con cautela): si el ajuste fino esta efectivamente orientado a dominio clinico, serviria para explorar resumenes de literatura biomedica o extraccion de entidades, siempre con supervision humana y validacion por profesionales.
- Chatbot de soporte interno en ingles: el modelo esta etiquetado como conversacional y compatible con endpoints, por lo que puede integrarse en una API interna para responder consultas de un dominio acotado en ingles.
- Clasificacion y extraccion de informacion: para tareas de etiquetado de texto, extraccion de campos o categorizacion de documentos en ingles, un modelo de 3,2B cuantizado ofrece un coste de inferencia muy bajo frente a alternativas de mayor tamano.
- Entornos con recursos limitados o air-gapped: al ser GGUF y ejecutable con llama.cpp en CPU, es adecuado para despliegues sin GPU y sin conexion a internet, por ejemplo en equipos de laboratorio aislados.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles de cuantizacion, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad frente al ahorro de memoria en un modelo de 3,2B.
- Generacion de texto asistida en pipelines de CI: para tareas de generacion de textos cortos, resumenes o respuestas plantilla donde la latencia y el coste importan mas que la calidad puntera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni similares), y no se ha encontrado documentacion del modelo base con metricas. No se dispone por tanto de datos que permitan comparar la calidad de las distintas cuantizaciones mas alla de la clasificacion cualitativa que hace el propio autor (por ejemplo, "lower quality" para Q3_K_M o "very good quality" para Q6_K).

## Requisitos de hardware

- VRAM/RAM estimada segun la cuantizacion (tamano del fichero, sin contar el overhead del runtime):
  - Q2_K: 1,5 GB
  - Q3_K_S: 1,6 GB
  - Q3_K_M: 1,8 GB
  - Q3_K_L: 1,9 GB
  - IQ4_XS: 1,9 GB
  - Q4_K_S: 2,0 GB
  - Q4_K_M: 2,1 GB
  - Q5_K_S y Q5_K_M: 2,4 GB
  - Q6_K: 2,7 GB
  - Q8_0: 3,5 GB
  - f16: 6,5 GB (16 bits por peso, descrito por el autor como "overkill")
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5; para f16 se recomienda un minimo de 8 GB. El modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque en estas dos ultimas estaria infrautilizado.
- Cabe en GPU de consumo: si, en todas las cuantizaciones salvo f16, que requiere al menos 8 GB. Es perfectamente viable en CPU con llama.cpp si se dispone de 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en formato HuggingFace, vLLM o TGI, aunque no se aportan configuraciones verificadas.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

Todos los valores de los modelos comparables corresponden a documentacion publica de sus fabricantes y deben verificarse antes de tomar decisiones de produccion; no proceden de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Med-V1-L3B (este repositorio, GGUF) | 3,2B | no disponible | llama3.2 | GGUF, 12 cuantizaciones |
| Llama 3.2 3B Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF de terceros |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (ampliable a 128.000 con YaRN) | Apache 2.0 | safetensors, GGUF de terceros |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | safetensors, GGUF de terceros |

No se dispone de datos de benchmarks de Med-V1-L3B que permitan establecer una comparacion de rendimiento real con estas alternativas. La diferencia mas relevante en cuanto a licencia es que Qwen2.5 y Phi-3.5 usan licencias permisivas (Apache 2.0 y MIT), mientras que la licencia llama3.2 impone condiciones adicionales de uso.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentacion sobre la composicion del dataset ni sobre sesgos evaluados.
- Riesgo de alucinacion: no cuantificado. En un modelo de 3,2B y con cuantizaciones agresivas (Q2_K, Q3_K_S) la degradacion de calidad es esperable, tal como reconoce el propio autor al etiquetar Q3_K_M como "lower quality".
- Limitaciones de idioma: solo se declara ingles. No hay evidencia de buen rendimiento en castellano ni en otros idiomas.
- Dominio medico: si el modelo esta efectivamente ajustado para contenido clinico, no debe usarse como herramienta de diagnostico ni para decisiones medicas sin supervision profesional. No hay validacion clinica publicada.
- Restricciones de licencia: la licencia llama3.2 incluye condiciones de uso comercial y clausulas de atribucion que deben revisarse antes de desplegar el modelo en produccion. No es una licencia permisiva tipo MIT o Apache 2.0.
- Ausencia de imatrix: el autor indica que las cuantizaciones ponderadas con imatrix no estan disponibles, lo que puede implicar una perdida de calidad algo mayor en las cuantizaciones bajas respecto a alternativas con calibracion.
- Trazabilidad: no hay model card del modelo base incluida en la informacion, ni paper, ni detalles de entrenamiento. Cualquier afirmacion sobre su comportamiento en dominio medico es una inferencia a partir del nombre.
- Fechas del repositorio: los metadatos indican creacion el 2026-03-13 y ultima actualizacion el 2026-10-02; conviene verificar el estado actual del repositorio antes de depender de el.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Med-V1-L3B-GGUF
- Modelo base: https://huggingface.co/nlm-dir/Med-V1-L3B
- Pagina de resumen de cuantizaciones y descargas: https://hf.tst.eu/model#Med-V1-L3B-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Sitio del cuantizador (nethype GmbH): https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible
