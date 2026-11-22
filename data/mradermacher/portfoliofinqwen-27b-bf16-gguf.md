# mradermacher/PortfolioFinQwen-27B-BF16-GGUF

## Resumen

PortfolioFinQwen-27B-BF16-GGUF es la version cuantizada en formato GGUF del modelo PortfolioFinQwen-27B-BF16, un ajuste fino (fine-tune) del modelo Qwen3 orientado a finanzas, gestion de carteras y razonamiento. El autor de las cuantizaciones es mradermacher, mientras que el modelo base original fue publicado por el usuario kstoyanov99 en Hugging Face. La relevancia de esta publicacion radica en que permite ejecutar un modelo de aproximadamente 26.900 millones de parametros en hardware de consumo gracias a las distintas cuantizaciones disponibles, desde Q2_K hasta Q8_0, ademas de incluir archivos multimodales (mmproj) que sugieren capacidades de vision heredadas del modelo base.

El modelo esta construido sobre la arquitectura de Qwen3, un transformer denso, y esta especializado mediante fine-tuning en tareas de analisis financiero y gestion de carteras. La licencia Apache 2.0 facilita su uso comercial, aunque el entrenamiento especifico en dominio financiero implica que sus respuestas deben validarse cuidadosamente en entornos de produccion. El repositorio incluye unicamente pesos en formato GGUF, lo que lo hace directamente utilizable con llama.cpp, Ollama y otros motores compatibles.

Esta ficha describe la version GGUF publicada por mradermacher, no el modelo base original. Los datos sobre el proceso de entrenamiento, composicion del dataset y rendimiento en benchmarks del modelo original no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, ademas de mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3, un transformer denso con aproximadamente 26,9 mil millones de parametros. El modelo base original (kstoyanov99/PortfolioFinQwen-27B-BF16) fue sometido a un proceso de fine-tuning orientado a tareas financieras, gestion de carteras y razonamiento, segun indican las etiquetas del repositorio. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO.

El repositorio incluye archivos mmproj (multi-modal projection), lo que indica que el modelo base probablemente hereda capacidades multimodales de la familia Qwen3, aunque no se especifica que modalidades adicionales soporta ni como se integraron durante el fine-tuning. Las cuantizaciones publicadas son estaticas; el autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto en ingles con especializacion en dominio financiero.
- Razonamiento orientado a analisis de carteras y toma de decisiones de inversion (segun las etiquetas del repositorio).
- Capacidades multimodales potenciales, inferidas de la presencia de archivos mmproj, aunque no se detalla su alcance.
- Soporte de conversacion multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se dispone de informacion sobre tool calling, function calling ni capacidades de agente.
- No se dispone de informacion sobre thinking mode ni otras capacidades especiales.

## Casos de uso

- Analisis de carteras de inversion: el modelo puede procesar descripciones de carteras y generar informes cualitativos sobre composicion, riesgos y diversificacion, aprovechando su fine-tuning en gestion de carteras.
- Asistencia en investigacion financiera: generacion de resumenes y sintesis de documentos financieros en ingles, adecuado para analistas que necesitan primeras versiones de informes.
- Educacion financiera: respuestas conversacionales sobre conceptos de inversion y gestion de riesgos en un entorno controlado, con validacion humana.
- Prototipado de asistentes financieros: su formato GGUF y licencia Apache 2.0 permiten desplegar prototipos en local con llama.cpp u Ollama sin costes de API.
- Generacion de escenarios hipoteticos de mercado: el modelo puede redactar narrativas de escenarios y analisis cualitativos, siempre que se validen con datos reales.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, permite procesar informacion financiera sensible sin enviarla a servicios en la nube.
- Experimentacion academica: investigadores pueden estudiar el comportamiento de un modelo financiero de 27B en tareas de razonamiento sin depender de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K aproximadamente 11,2 GB; Q4_K_M aproximadamente 16,8 GB; Q8_0 aproximadamente 28,7 GB (tamanos de archivo, la VRAM necesaria es similar o ligeramente superior).
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o una A100 de 40 GB; para Q8_0, una A100 de 40 GB o H100.
- Cabe en GPU de consumo: si, las cuantizaciones Q2_K a Q4_K_M caben en GPUs con 16-24 GB de VRAM (RTX 4080, RTX 4090, etc.); las cuantizaciones Q5 y superiores requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PortfolioFinQwen-27B-BF16-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune financiero de Qwen3 |
| Qwen3-32B | ~32B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista de la misma familia |
| Qwen3-14B | ~14B | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa de menor tamano para hardware limitado |
| Modelos financieros especializados de 7B-13B | 7B-13B | no disponible | variable | variable | Menor capacidad pero menor requisito de VRAM |

La comparativa se limita a modelos de la misma familia y categoria; no se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles; su uso en castellano no esta garantizado.
- Al ser un fine-tune financiero, existe riesgo elevado de alucinacion en datos numericos, cotizaciones y recomendaciones de inversion; no debe usarse como asesor financiero sin supervision humana.
- No se dispone de informacion sobre sesgos especificos del fine-tuning ni sobre la composicion del dataset de entrenamiento.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar tareas de contexto largo con garantias.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo financiero implica responsabilidades regulatorias y de validacion adicionales.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre velocidad y calidad.
- No se dispone de informacion sobre tool calling ni capacidades de agente, lo que limita su integracion en pipelines automatizados complejos.
- El repositorio no incluye el modelo en safetensors, solo GGUF; para fine-tuning adicional seria necesario acudir al modelo base original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PortfolioFinQwen-27B-BF16-GGUF
- Modelo base original: https://huggingface.co/kstoyanov99/PortfolioFinQwen-27B-BF16
- Pagina de resumen del autor: https://hf.tst.eu/model#PortfolioFinQwen-27B-BF16-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
