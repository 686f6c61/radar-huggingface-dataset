# fahadhafeezofficial/cyberlens-saes

# CyberLens-SAE: autoencoder disperso mapeado a taxonomias para ciberseguridad

## Resumen

CyberLens-SAE es un autoencoder disperso (SAE, sparse autoencoder) entrenado especificamente para interpretabilidad de modelos de lenguaje en el dominio de la ciberseguridad. No es un modelo generativo, sino una herramienta de analisis: se aplica sobre las activaciones internas de `EleutherAI/pythia-160m` (12 capas, d_model=768, 162 M de parametros) en la capa 8, y descompone el flujo residual en 4096 caracteristicas dispersas etiquetadas y mapeadas a las tecnicas de MITRE ATT&CK (14 tacticas, ~200 tecnicas) y a los 8 dominios del CISSP CBK. Lo desarrolla el usuario `fahadhafeezofficial` y se publica junto a un corpus de entrenamiento especifico y una demo Gradio.

La motivacion declarada es que los SAE de proposito general (Gemma Scope, Llama Scope), entrenados sobre texto web generico, diluyen los conceptos de seguridad en un punado de direcciones gruesas de "amenaza" entre 16 000 y 1 000 000 de latentes. CyberLens reasigna capacidad a conceptos finos del dominio (por ejemplo, T1566 Phishing frente a T1078 Valid Accounts frente a T1059 Command and Scripting), siguiendo la tesis de los SAE de dominio de *Resurrecting the Salmon* (O'Neill et al., 2025, arXiv:2508.09363).

El artefacto principal de la anchura 4096 ocupa 12,6 M de parametros (50 MB en fp32) y es ejecutable en CPU, sin GPU. El repositorio, sin embargo, no registra descargas ni likes, la model card esta truncada y no se han publicado resultados de benchmarks mas alla del FVU de entrenamiento, por lo que debe considerarse un artefacto de investigacion temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso JumpReLU (SAE) sobre el flujo residual de `EleutherAI/pythia-160m`, capa 8 (capa 4 en ablacion) |
| Parametros totales | 12,6 M (anchura 4096, principal); 25 M (anchura 8192, ablacion) |
| Longitud de contexto | No aplica: el SAE codifica activaciones individuales y no tiene ventana de contexto propia |
| Tipos de cuantizacion | No disponible; los pesos se entrenaron y publicaron en fp32 |
| Idiomas soportados | No disponible (el corpus descrito esta integramente en ingles) |
| Licencia | Apache 2.0 (codigo); MITRE ATT&CK Terms (descripciones de tecnicas); CC0/CC BY (CVE, dolly). Los metadatos de HuggingFace indican "no disponible" |
| Formato de pesos | Checkpoints de PyTorch (`.pt`), compatibles con SAELens; safetensors no confirmado |
| Modelo objetivo | `EleutherAI/pythia-160m` (12 capas, d_model=768, 162 M, The Pile deduplicado, Apache 2.0) |
| Tamano del repositorio | 0,1 GB |
| Interfaz de carga | Paquete nativo `cyberlens` (1 linea) o `sae_lens.SAE.from_pretrained(...)` |

## Arquitectura y entrenamiento

El SAE emplea una arquitectura **JumpReLU** (Rajamanoharan et al., 2024, "Jumping Ahead") con umbral por caracteristica `JumpReLU_theta(z) = z * H(z - theta)` y estimador straight-through (STE) para optimizar directamente L0 en lugar de un proxy L1. Se entrenaron dos anchuras: 4096 (5,3x, configuracion principal recomendada) y 8192 (10,7x, ablacion superior). Los hiperparametros de la anchura principal son: `bandwidth epsilon = 0,001`, `target L0 = 20`, penalizacion cuadratica `l0_coef = 1,0` (`lambda * (L0 - target)^2`), `lr = 5e-4`, `batch_tokens = 2048`, 2 epocas (1504 pasos, 1,54 M de tokens), Adam con beta (0,9; 0,999), normalizacion unitaria del decodificador en cada paso, fp32 y streaming de shards. El entrenamiento completo se ejecuto en CPU (6 nucleos, `torch.set_num_threads(6)`), con checkpoints cada 1000 pasos y reanudacion segura.

El corpus (1,85 M de tokens, 14 900 documentos, fuentes CC0/CC BY/Apache/MITRE Terms, sin CTI privada) combina descripciones de tecnicas y ejemplos de procedimiento de ATT&CK STIX (697 tecnicas y subtecnicas, 2919 ejemplos), CVE de NVD via el espejo de HuggingFace `stasvinokur/cve-and-cwe-dataset-1999-2025` (3000), CISA KEV (1716), CAPEC v3.9 (598), informes de comportamiento de malware (`extraordinarylab/malware-text-db`, 1995), correos de phishing (2000) y un contraste benigno de `databricks/databricks-dolly-15k` (2000). El split es 85/15 sin fuga de datos (12 690/2235 documentos, 1,57 M/0,28 M tokens), agrupado por `group_id` mediante `GroupShuffleSplit` y validado con solapamiento 0.

Las activaciones se extrajeron de la capa 8 (75 % de profundidad, analogo a la capa 20 de Salmon al 71 %) y tambien de la capa 4 para ablacion, usando `output_hidden_states=True` de HuggingFace con hook manual (sin `transformer_lens`), a 207 tokens/s: 41,5 minutos de computo por capa (2,07 h en total), 61 shards de 25 000 tokens por capa (aproximadamente 73 MB por shard, 4,6 GB por capa, 9,2 GB entre L8 y L4). Ademas se publica un diccionario de caracteristicas (`feature_dictionary.csv`, 4096 filas) con `feature_id`, `auto_description`, `top_activating_examples`, tecnicas ATT&CK mapeadas, dominios CISSP mapeados y `confidence_score`.

## Capacidades

- Interpretabilidad de activaciones: descomposicion del flujo residual de `pythia-160m` capa 8 en 4096 caracteristicas dispersas con L0 objetivo 20.
- Puntuacion de texto por tecnica: la funcion `score(text)` devuelve un mapa `{tecnica -> activacion}` en tiempo real, util para evaluaciones de seguridad.
- Mapeo a MITRE ATT&CK: etiquetado sobre 14 tacticas y aproximadamente 200 tecnicas, con nivel de confianza por latente.
- Mapeo a CISSP CBK: cada latente etiquetado puede llevar tambien su dominio CISSP (8 dominios) y su tactica.
- Diccionario de caracteristicas exportable con descripciones automaticas y ejemplos de maxima activacion.
- Compatibilidad de ecosistema: carga nativa via `cyberlens` y via `sae_lens.SAE.from_pretrained`, con convenciones de nombres al estilo Gemma Scope / Llama Scope.
- Ejecucion en CPU: inferencia del SAE sin GPU, con huella de 50 MB en fp32 para la anchura 4096.
- Demo interactiva: Space de Gradio (`cyberlens-demo`) preparado para el tier gratuito de HuggingFace en CPU.
- Lo que **no** hace: no genera texto, no razona, no soporta tool calling ni function calling, no es un modelo de agentes y no tiene capacidades multimodales ni modo "thinking". Cualquier capacidad generativa proviene del modelo objetivo `pythia-160m`, no del SAE.

## Casos de uso

- Evaluacion de seguridad y red teaming: aplicar `score(text)` a salidas de un LLM para medir que tecnicas ATT&CK activan sus representaciones internas, obteniendo una senal cuantitativa antes de decidir si un modelo es apto para produccion.
- Clasificacion de informes CTI: dado un informe de inteligencia o un aviso de CVE, extraer las tecnicas ATT&CK probablemente implicadas a partir de las activaciones, en lugar de depender unicamente de un clasificador superficial o de coincidencia de palabras clave.
- Guardarraíles en pipelines de LLM: colocar el SAE como sonda sobre las activaciones internas de un asistente para detectar contenido cercano a tecnicas de phishing o abuso de cuentas antes de que el texto se emita al usuario.
- Auditoria de modelos de ciberseguridad propios: analizar que caracteristicas se activan al ajustar un modelo con datos de seguridad y comprobar si aprende conceptos finos (T1566, T1078, T1059) o direcciones genericas de "ciberamenaza".
- Etiquetado asistido y weak supervision: usar el diccionario de caracteristicas y sus `confidence_score` para generar etiquetas preliminares de tecnicas sobre grandes volumenes de texto no anotado.
- Investigacion en alineacion e interpretabilidad: estudiar como se representan conceptos tecnicos especializados en un transformer pequeno y reproducir el montaje completo en hardware de consumo (el propio entrenamiento se hizo con un Ryzen 7530U, 16 GB y 6 nucleos).
- Formacion y analisis forense de phishing: la demo Gradio permite inspeccionar en CPU que latentes se activan ante un correo concreto, util para docencia o para explicar decisiones a un analista de SOC.
- Analisis de malware a nivel de representacion: aplicar el SAE sobre descripciones de comportamiento para agrupar muestras por similitud de activaciones en lugar de por similitud textual.

## Benchmarks y rendimiento

La model card solo publica la fraccion de varianza no explicada (FVU, cuanto mas bajo mejor) del entrenamiento del SAE; no hay MMLU, HumanEval ni GSM8K, ya que el SAE no es un modelo generativo evaluable con esas pruebas.

| Configuracion | Parametros | Tamano fp32 | FVU (capa 8) | Tiempo de entrenamiento (CPU, 6 nucleos) |
|---|---|---|---|---|
| Anchura 4096 (principal) | 12,6 M | 50 MB | 0,0435 | 11 min |
| Anchura 8192 (ablacion) | 25 M | 100 MB | 0,0532 | 25 min |

La anchura 4096 supera a la 8192 en FVU a esta escala de datos (mas tokens por caracteristica y menos latentes muertas), con la mitad de RAM y menos de la mitad de tiempo. No se han publicado resultados de benchmarks comparativos en la informacion disponible.

Otros datos de rendimiento operativo declarados: extraccion de activaciones a 207 tokens/s (2,07 h para L8+L4 en 6 nucleos), smoke test de 50 documentos en 38,3 s (161 tokens/s) extrapolado a 2,7 h.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El SAE funciona en CPU; los pesos de la anchura 4096 ocupan 50 MB en fp32 y los de la 8192, 100 MB.
- Memoria RAM: minima, pero hay que sumar el modelo objetivo `pythia-160m` (162 M de parametros, aproximadamente 650 MB en fp32) si se extraen activaciones en vivo.
- Almacenamiento: 0,1 GB para el repositorio de pesos; los tensores de activaciones descritos en la model card suman 4,6 GB por capa y 9,2 GB para L8+L4.
- GPU recomendadas: no se requiere ninguna. Cualquier GPU consumer (incluso integradas) es sobredimensionada; el flujo declarado es CPU-only, sin nube ni GPU.
- Referencia de hardware validada por el autor: AMD Ryzen 7530U (6 nucleos), 16 GB de RAM, CPU exclusivamente, para entrenamiento, extraccion y evaluacion.
- Cabe en cualquier GPU de consumo: si, en todas (RTX 3060, RTX 4090, etc.), aunque no aporta ventaja frente a CPU para esta carga.
- Opciones de despliegue: paquete nativo `cyberlens`, `sae_lens` (SAELens), demo Gradio en HuggingFace Spaces (CPU, tier gratuito). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un SAE.
- Latencia y throughput: extraccion de activaciones a 207 tokens/s en CPU de 6 nucleos; el coste de codificacion del SAE es despreciable frente a la pasada del modelo objetivo. El autor recomienda la anchura 4096 por eficiencia (11 min frente a 25 min de entrenamiento).

## Comparativa con modelos similares

| Modelo | Tipo | Modelo objetivo | Anchura | Mapeo taxonomico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CyberLens-SAE | SAE de dominio (JumpReLU) | `pythia-160m` capa 8 | 4096 / 8192 | ATT&CK (14 tacticas, ~200 tecnicas) y CISSP CBK (8 dominios) | Apache 2.0 (codigo) + terminos MITRE/CC | 0 descargas, 0 likes en HuggingFace |
| Gemma Scope (`google/gemma-scope`) | SAE de proposito general | Familia Gemma 2 | 16 K a 1 M latentes | No | No disponible en la informacion proporcionada | Publico, ampliamente usado |
| Llama Scope (`fnlp/Llama-Scope`) | SAE de proposito general | Familia Llama | No disponible en la informacion proporcionada | No | No disponible en la informacion proporcionada | Publico |

Diferencias clave segun la model card: los SAE de proposito general se entrenan sobre texto web generico y dedican un numero reducido de latentes gruesos a conceptos de ciberseguridad, mientras que CyberLens reasigna capacidad a conceptos finos del dominio y anade etiquetado taxonomico con puntuacion de confianza. A cambio, CyberLens cubre un unico modelo objetivo muy pequeno (162 M de parametros), lo que limita su transferibilidad a modelos de produccion.

## Limitaciones y advertencias

- Es un SAE, no un LLM: no genera texto, no responde a prompts y no debe evaluarse con benchmarks de generacion.
- Modelo objetivo muy pequeno: `pythia-160m` tiene 12 capas y 162 M de parametros; las caracteristicas aprendidas pueden no transferirse a modelos de 7 B o superiores, y la propia model card justifica la eleccion por limitaciones de hardware, no por calidad.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente.
- Sin benchmarks publicos: solo se reporta FVU de entrenamiento; no hay evaluacion de calidad de las etiquetas ATT&CK ni de precision del mapeo.
- Model card truncada: la informacion disponible corta el apartado de resultados de la fase 2 y no incluye la fase 3 (uso) ni la validacion de las etiquetas, por lo que las cifras de cobertura del diccionario no pueden verificarse.
- Cobertura taxonomica parcial: aunque se declaran ~200 tecnicas ATT&CK mapeadas, con 4096 latentes muchos conceptos compartiran direccion o quedaran sin etiquetar; se recomienda revisar `confidence_score` antes de usar una etiqueta en produccion.
- Sesgos del corpus: las fuentes son mayoritariamente anglosajonas y publicas (MITRE, NIST/NVD, CISA, HuggingFace), con un unico contraste benigno (dolly-15k) de 2000 documentos, lo que puede sesgar la frontera entre "ciber" y "benigno".
- Riesgo de falsos positivos: un latente de phishing puede activarse ante vocabulario de seguridad legitimo (documentacion, formacion, auditorias), por lo que no debe usarse como unico filtro de bloqueo.
- Idiomas: el corpus descrito esta integramente en ingles; no hay evidencia de comportamiento fiable en castellano u otros idiomas.
- Licencia mixta y ambigua: el codigo es Apache 2.0, las descripciones de tecnicas quedan bajo MITRE ATT&CK Terms y los datos bajo CC0/CC BY, con una data statement que hay que revisar; los metadatos de HuggingFace no declaran licencia, lo que complica el uso comercial sin comprobacion legal previa.
- Sin soporte declarado de cuantizacion ni de formatos safetensors/GGUF: los pesos se publican como checkpoints de PyTorch en fp32.
- Los resultados de busqueda web consultados no arrojaron informacion tecnica relevante sobre el modelo: los enlaces devueltos eran foros y hilos sin relacion con CyberLens.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fahadhafeezofficial/cyberlens-saes
- Corpus de entrenamiento (opcional): `fahadhafeezofficial/cyberlens-corpus`
- Demo Gradio: `fahadhafeezofficial/cyberlens-demo`
- Paper de referencia de los SAE de dominio: *Resurrecting the Salmon* (O'Neill et al., 2025), https://arxiv.org/abs/2508.09363
- Documentacion citada en la model card: `docs/phase0-scoping.md`, `docs/phase1-data-statement.md`, `docs/phase2-evaluation.md`, `docs/phase4-results.md`
- Referencia de arquitectura JumpReLU: Rajamanoharan et al., 2024, "Jumping Ahead: Improving Reconstruction Fidelity with JumpReLU Sparse Autoencoders"
- SAE comparables citados: https://huggingface.co/google/gemma-scope y https://huggingface.co/fnlp/Llama-Scope
- Bibliotecas compatibles: `sae_lens` (SAELens)
