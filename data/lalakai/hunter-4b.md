# Lalakai/Hunter-4B

## Resumen

Hunter-4B es un modelo de lenguaje conversacional de 4.022.468.096 parametros (aproximadamente 4B) desarrollado por Lalakai Labs y publicado bajo licencia MIT. Se distribuye exclusivamente en formato GGUF, pensado para inferencia local rapida con llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo esta afinado sobre una base de la familia Qwen y su rasgo diferencial es que razona "en voz alta": genera trazas de cadena de pensamiento dentro de etiquetas `<thought>...</thought>` antes de emitir la respuesta final.

El entrenamiento se realizo mediante QLoRA (rango 64) sobre aproximadamente 180.000 ejemplos curados y deduplicados con MinHash LSH, empaquetados en una plantilla ChatML con trazas de razonamiento explicitas. La mezcla de datos se reparte entre razonamiento complejo (40%), codigo agentico (25%), uso de herramientas en varios pasos (20%) y conocimiento general como ancla (15%). Una parte central de esa mezcla tiene orientacion de seguridad informatica: analisis de vulnerabilidades, revision de codigo seguro y pensamiento adversarial.

El modelo es relevante porque ocupa un nicho muy concreto: un 4B que cabe en un portatil con unos 3,5 GB de memoria de trabajo en su cuantizacion Q4_K_M, con velocidades declaradas de 28-38 tokens/s en Apple Silicon y 18-24 tokens/s en portatiles x86 modernos, y con soporte de function calling y bucles de API autonomas. La contrapartida es que no hay benchmarks publicados, el repositorio no tiene descargas ni valoraciones, y la model card presenta inconsistencias de nomenclatura (los ficheros se llaman `Hunter-Cyber-4B-v1.0-*` mientras que el modelo se anuncia como Hunter-4B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base de la familia Qwen; variante concreta no especificada) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no declarada en la model card; los ejemplos de uso emplean `n_ctx=4096`) |
| Tipos de cuantizacion | FP16 y Q4_K_M publicadas; se incluye matriz de importancia (`.imatrix`) para recuantizar |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF exclusivamente (FP16 y Q4_K_M). No se anuncian safetensors en la model card, aunque el recuento de parametros de HuggingFace aparece como dato real de safetensors |
| Plantilla de prompt | ChatML (`<\|im_start\|>` / `<\|im_end\|>`), con trazas de razonamiento en `<thought>...</thought>` |
| Tamano del repositorio | 10,6 GB |
| Fecha de publicacion | 28 de septiembre de 2026 (ultima actualizacion: 29 de septiembre de 2026) |
| Compatibilidad | Etiquetado como `endpoints_compatible`; compatible con llama.cpp, Ollama y LM Studio |

## Arquitectura y entrenamiento

Hunter-4B es un fine-tune de un modelo base de 4B perteneciente a la familia Qwen. La model card no detalla la arquitectura interna de esa base (numero de capas, dimension del modelo, tipo de atencion, atencion por ventanas, etc.), por lo que la informacion arquitectonica concreta queda como no disponible mas alla de que se trata de un transformer causal de aproximadamente 4B de parametros con soporte de plantilla ChatML.

El proceso de ajuste empleo QLoRA con rango 64, tras lo cual los adaptadores se fusionaron de vuelta a FP16 y el resultado se cuantizo a Q4_K_M usando una matriz de importancia, con el objetivo declarado de preservar los pesos criticos para el razonamiento durante la compresion. El dataset consta de unos 180.000 ejemplos de alta densidad, sin rastreo web crudo: cada ejemplo esta curado, deduplicado con MinHash LSH y formateado en un sobre ChatML con trazas de razonamiento explicitas. La composicion es 40% razonamiento complejo (resolucion paso a paso, matematicas, trazas destiladas), 25% codigo agentico (sintesis determinista de codigo, depuracion, disciplina sintactica), 20% uso de herramientas en multiples pasos (llamadas a funciones estructuradas, adherencia a esquemas JSON, bucles de API autonomas) y 15% anclaje de conocimiento general. No se menciona en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles con trazas de razonamiento explicitas en `<thought>...</thought>` antes de la respuesta final.
- Razonamiento paso a paso orientado a matematicas y tareas de varios pasos.
- Sintesis de codigo, depuracion y disciplina sintactica, con enfasis declarado en codigo agentico determinista.
- Uso de herramientas y function calling: la mezcla de entrenamiento incluye un 20% de llamadas a funciones estructuradas, adherencia a esquemas JSON y bucles de API autonomas.
- Agentes y razonamiento multi-paso, apoyado en la capacidad anterior de encadenar llamadas.
- Capacidades de seguridad informatica: analisis de vulnerabilidades, revision de codigo seguro y pensamiento adversarial, presentadas como especialidad central del modelo.
- Conocimiento general y anclaje linguistico basico (15% de la mezcla de entrenamiento), orientado a que las ganancias en razonamiento no degraden el sentido comun.
- Modo de razonamiento visible activable mediante plantilla (la configuracion de Ollama incluida en la model card activa las trazas por defecto).
- Capacidades multilingues: solo ingles declarado. No se anuncia soporte de otros idiomas.
- Vision, audio y modalidades adicionales: no disponibles.

## Casos de uso

- Revision de codigo seguro en pipelines de CI/CD: el modelo puede analizar diffs y parches en busca de patrones de vulnerabilidad (inyeccion, manejo inseguro de entradas, criptografia mal usada) y emitir la justificacion del hallazgo en su traza de razonamiento, lo que facilita la auditoria humana del veredicto.
- Formacion en seguridad ofensiva y defensiva: al ser un 4B ejecutable en local, permite desplegar un asistente de estudio sobre pensamiento adversarial y analisis de vulnerabilidades sin enviar datos sensibles a una API externa.
- Asistente de programacion en el editor: con Q4_K_M ocupa unos 3,5 GB en contexto de 4k, por lo que puede ejecutarse junto al IDE en portatiles x86 modernos a 18-24 tokens/s, suficiente para autocompletado y explicaciones de fragmentos.
- Agente de automatizacion con llamadas a API: su entrenamiento en llamadas a funciones estructuradas y adherencia a JSON permite integrarlo en flujos que consulten servicios externos, parseen la respuesta y decidan el siguiente paso de forma autonoma.
- Chatbot de soporte tecnico en ingles de alcance limitado: la ventana de contexto no declarada (los ejemplos usan 4096 tokens) lo restringe a conversaciones de pocos turnos; es adecuado para FAQ tecnicas y diagnostico guiado, no para historiales largos.
- Preprocesado y explicacion de expresiones matematicas o logicas: util para generar resoluciones paso a paso de ejercicios con la traza visible, aprovechable en herramientas educativas que quieran mostrar el razonamiento.
- Prototipado y evaluacion de tecnicas de razonamiento explicito: al exponer la cadena de pensamiento en etiquetas propias, sirve como banco de pruebas para investigar extraccion, filtrado o supervision de trazas en modelos pequenos.
- Despliegue en entornos aislados o sin conectividad: al distribuirse como GGUF con llama.cpp y verificacion por SHA256, encaja en maquinas air-gapped donde no se permite descargar pesos desde la nube en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los benchmarks se publicaran "aqui cuando esten disponibles", por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad.

Los unicos datos de rendimiento medidos que se aportan son de velocidad e inferencia:

| Metrica | Valor declarado |
|---|---|
| Memoria de trabajo (Q4_K_M, contexto 4k, buffers de runtime) | Aproximadamente 3,5 GB |
| Velocidad en Apple Silicon (Q4_K_M) | 28-38 tokens/s |
| Velocidad en portatiles x86 modernos (Q4_K_M) | 18-24 tokens/s |
| Memoria requerida (pesos FP16) | Aproximadamente 10 GB de RAM/VRAM |

Estos datos proceden del autor y no se acompanan de metodologia de medicion, hardware concreto ni reproducibilidad, por lo que deben tratarse como orientativos.

## Requisitos de hardware

- Inferencia Q4_K_M: aproximadamente 2,50 GB de pesos y unos 3,5 GB de memoria de trabajo con contexto de 4k y buffers de runtime, segun el autor.
- Inferencia FP16: aproximadamente 8,05 GB de pesos y unos 10 GB de RAM/VRAM necesarios.
- GPU consumer: la cuantizacion Q4_K_M cabe holgadamente en cualquier GPU con 8 GB o mas (RTX 3060 Ti, 4060, 4070, 3070, 2080, etc.) e incluso en GPUs de 6 GB con contexto reducido. La version FP16 requiere 12 GB o mas para operar con comodidad (RTX 3060 12 GB, 4070 Ti, 4080, 4090) o memoria unificada de 16 GB o mas en Apple Silicon.
- GPU de datacenter: A100, H100, L40S y similares son sobredimensionadas para un modelo de 4B, pero permiten servir muchas instancias concurrentes o usar FP16 con contexto amplio.
- CPU: al ser GGUF, puede ejecutarse integramente en CPU con llama.cpp, a costa de una velocidad notablemente inferior a la declarada para GPU o Apple Silicon.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante `Modelfile`, LM Studio, `llama-cpp-python` y cualquier runtime compatible con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Soporte en vLLM o TGI: no confirmado en la informacion proporcionada. El soporte de GGUF en estos motores es parcial y no se anuncia oficialmente para este modelo.
- Latencia y throughput: 28-38 tokens/s en Apple Silicon y 18-24 tokens/s en portatiles x86 modernos con Q4_K_M, segun datos del autor. No se aporta latencia hasta el primer token ni medidas con lotes concurrentes.

## Comparativa con modelos similares

La comparativa se establece con modelos abiertos de tamano equivalente, usando datos publicos de sus respectivas fichas oficiales. Los datos de Hunter-4B provienen de la informacion proporcionada; los de los alternativas, de su documentacion publica y deben verificarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Hunter-4B (Lalakai) | 4,02B | No disponible (ejemplos con 4k) | MIT | GGUF (FP16 y Q4_K_M) |
| Qwen3-4B (Alibaba) | Aproximadamente 4B | 32k nativo, ampliable con YaRN | Apache 2.0 | Safetensors, GGUF y otros |
| Llama 3.2 3B (Meta) | 3,2B | 128k | Llama 3.2 Community License | Safetensors, GGUF y otros |
| Gemma 3 4B (Google) | Aproximadamente 4B | 128k | Gemma Terms of Use | Safetensors, GGUF y otros |

Diferencias clave: Hunter-4B es el unico de la lista con licencia MIT pura, lo que simplifica el uso comercial y la redistribucion sin clausulas de atribucion adicionales ni restricciones de escala. En contra, no declara ventana de contexto, no publica benchmarks y presenta un unico idioma soportado, mientras que los alternativas documentan contexto largo y evaluaciones publicas. No hay datos de rendimiento comparables entre Hunter-4B y estas alternativas en la informacion disponible.

## Limitaciones y advertencias

- Escala: un modelo de 4B no compite con modelos frontera en razonamiento dificil ni en conocimiento de nicho. El propio autor lo advierte en la model card.
- Ausencia total de benchmarks: no hay evidencia publica de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, por lo que no es posible validar las capacidades declaradas (especialmente la especialidad en ciberseguridad) antes de desplegarlo.
- Alucinacion: el modelo puede generar contenido falso o inventado, incluido codigo de seguridad aparentemente plausible pero incorrecto. En un contexto de analisis de vulnerabilidades esto es especialmente delicado: un falso positivo o un falso negativo pueden inducir a error en revisiones de seguridad.
- Contenido inseguro: la model card reconoce que puede generar contenido danino ante prompts adversariales. Un modelo afinado en pensamiento adversarial y con licencia MIT sin filtros integrados aumenta el riesgo de uso indebido.
- Idiomas: solo ingles declarado. No hay soporte anunciado de castellano ni de otros idiomas.
- Contexto limitado o no declarado: los ejemplos de uso emplean 4k tokens y no se especifica un maximo oficial, lo que limita conversaciones multi-turno largas, analisis de repositorios completos o documentos extensos.
- Inconsistencia de nomenclatura: el repositorio se llama `Hunter-4B` pero los ficheros publicados son `Hunter-Cyber-4B-v1.0-*`. Conviene verificar que el artefacto descargado corresponde al modelo esperado.
- Madurez: 0 descargas y 0 valoraciones en el momento de redactar esta ficha, sin historial de versiones. Considerar el modelo como experimental.
- Licencia MIT: permisiva y apta para uso comercial, con atribucion apreciada pero no exigida por la propia licencia. No impone restricciones de uso, lo que traslada al integrador toda la responsabilidad sobre el cumplimiento normativo (por ejemplo, en aplicaciones que analicen sistemas de terceros).
- Verificacion de integridad: se recomienda ejecutar `sha256sum -c SHA256SUMS` antes de desplegar, ya que los pesos proceden de un autor con poca trazabilidad publica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lalakai/Hunter-4B
- Perfil del autor en X (Lalakai Labs): https://x.com/LalakaiAI
- Especificacion del formato GGUF: https://github.com/ggerganov/ggml/blob/master/docs/gguf.md
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp

Las busquedas web realizadas no devolvieron resultados relevantes sobre Hunter-4B ni sobre Lalakai Labs. Los enlaces encontrados (`lakai.pro`, listados de modelos de terceros en `artificialanalysis.ai`, `llm-stats.com`, `ollama.com/library/llama4` y `secondtalent.com`) no guardan relacion con este modelo y se han omitido. No se han localizado papers, blogs tecnicos ni demos oficiales asociados a Hunter-4B.
