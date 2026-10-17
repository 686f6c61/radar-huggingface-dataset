# deer-sec/StagAI-CyberSecurity-26B-A4B-v2-VLM-GGUF-IQ4_NL

# StagAI-CyberSecurity-26B-A4B-v2-VLM GGUF IQ4_NL

## Resumen

StagAI-CyberSecurity-26B-A4B-v2-VLM es un modelo linguistico multimodal (texto, imagen y video) especializado en analisis de ciberseguridad y razonamiento teorico, desarrollado por deer-sec. Parte de la arquitectura Gemma-4-26B-A4B, un transformer con mezcla de expertos (MoE) de 25.233.142.046 parametros totales y aproximadamente 4.000 millones activos por token, sobre el que se aplico un ajuste fino supervisado con QLoRA (8 bits) mediante el framework MLX.

Esta ficha corresponde concretamente al repositorio `GGUF-IQ4_NL`, una cuantizacion de 4 bits derivada del GGUF en BF16 del mismo modelo. El interes practico del modelo esta en dos frentes: por un lado, conserva las capacidades de vision (diagramas de red, capturas de SIEM, imagenes de capturas de paquetes, video) que normalmente se pierden al fusionar adaptadores LoRA con `mlx_lm.fuse`; por otro, el autor documenta un aumento del tiempo de "pensamiento" (thinking) que se traduce en razonamiento paso a paso mas profundo a costa de mayor latencia.

El modelo se publica bajo licencia Apache 2.0, con soporte declarado de ingles, japones y chino (multilingue), y esta pensado como motor de inferencia para analistas SOC, investigadores y administradores de sistemas que trabajan en modelado de amenazas, evaluacion de vulnerabilidades, interpretacion de logs y respuesta a incidentes. Es un repositorio recien creado (17 de octubre de 2026) sin descargas ni valoraciones, y el autor no ha publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base google/gemma-4-26b-a4b |
| Parametros totales | 25.233.142.046 |
| Parametros activos | Aproximadamente 4.000 millones (denominacion A4B del modelo base; no se detalla el numero exacto de expertos ni el top-k) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF IQ4_NL (esta variante); la familia incluye GGUF BF16, GGUF Q8 y MLX BF16, MLX Q8, MLX Q4 |
| Idiomas soportados | Multilingue; ingles, japones y chino (segun la model card y las etiquetas del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico de cuantizacion IQ4_NL, 4 bits) |

Otros datos del repositorio: tamano del repo 15,8 GB, libreria `gguf`, pipeline `image-text-to-text`, compatible con endpoints, region US.

## Arquitectura y entrenamiento

La base es un transformer MoE de la familia Gemma 4 (26B totales, ~4B activos), lo que permite un coste de computo por token propio de un modelo de ~4B mientras la memoria debe alojar los 25,2B de parametros completos. Sobre esa base se aplico un ajuste fino supervisado con QLoRA de 8 bits usando `mlx_lm.lora`, con los siguientes hiperparametros declarados: optimizador AdamW, `num_layers: 18`, learning rate 5e-7, `mask_prompt: true`, y LoRA con rango 4, escala 1.0, dropout 0.03. Las claves objetivo del adaptador incluyen las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`), las proyecciones del MLP (`gate_proj`, `up_proj`, `down_proj`) y las del router/experto (`experts.switch_glu.gate_proj`); la lista aparece truncada en la model card.

El entrenamiento uso 80.000 entradas SFT: 40.000 en ingles y 40.000 en japones, procedentes de los datasets `deer-sec/deer_sec-japanese-cybersecurity-chatml-v2` y `AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1`. La innovacion tecnica declarada por el autor es la tecnica de fusion del adaptador LoRA en el modelo base "sin perdida de pesos", que permite restaurar e integrar las capacidades de vision (reconocimiento de imagen y video) que habitualmente se descartan en los flujos `mlx_lm.lora` / `mlx_lm.fuse`. No se documentan detalles sobre la composicion exacta de las 80.000 muestras, el numero total de tokens vistos, ni si hubo etapas adicionales de RLHF o DPO mas alla del SFT.

## Capacidades

- Generacion de texto y razonamiento especializado en ciberseguridad: analisis de amenazas, modelado de amenazas, evaluacion de vulnerabilidades y estrategias de respuesta a incidentes.
- Modo "thinking" / razonamiento profundo paso a paso, con latencia de proceso superior a la del modelo base segun el autor.
- Vision multimodal: interpretacion de diagramas de arquitectura de red, capturas de pantalla de SIEM y logs, imagenes de capturas de paquetes y video.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`), lo que permite adjuntar evidencias visuales junto a la consulta en texto.
- Capacidades multilingues en ingles, japones y chino, con datos de ajuste fino efectivos en ingles y japones.
- Conversacion multi-turno (etiqueta `conversational`) con plantilla tipo ChatML en los datos de entrenamiento.
- No hay documentacion sobre soporte de tool calling, function calling ni uso como agente multi-paso en la informacion disponible.
- No se documentan capacidades de audio ni de salida distinta de texto.

## Casos de uso

- Triaje de alertas en un SOC: el modelo recibe el texto de la alerta y una captura del panel del SIEM, y devuelve una hipotesis de causa raiz, el nivel de severidad y los siguientes pasos de investigacion, aprovechando el modo de razonamiento para justificar la clasificacion.
- Analisis de diagramas de red y arquitecturas: a partir de una imagen de la topologia, el modelo puede identificar segmentos planos, servicios expuestos y puntos unicos de fallo, y proponer reglas de segmentacion.
- Interpretacion de capturas de paquetes y trazas: adjuntando una imagen de Wireshark o un volcado de logs, el modelo ayuda a discriminar trafico legitimo de indicadores de compromiso y a redactar la consulta de correlacion correspondiente.
- Soporte a la respuesta a incidentes: generacion de borradores de playbooks, cronologias de incidente y comunicaciones internas a partir de la evidencia textual y visual aportada por el equipo.
- Formacion y concienciacion: analisis de correos de phishing o capturas de pantalla sospechosas para explicar al usuario, en japones o en ingles, que indicadores delatan el intento de fraude.
- Asistente de hardening y revision de configuraciones: revision de fragmentos de configuracion (nginx, iptables, politicas de IAM) y propuesta de cambios justificados, con el razonamiento explicito como documentacion auditable.
- Investigacion defensiva y analisis de malware en entorno controlado: resumen de cadenas, comportamientos y tecnicas MITRE ATT&CK observadas en artefactos, siempre en el marco de la clausula de uso etico del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma mejoras cualitativas de calidad de respuesta frente al modelo base y frente a la version anterior (CyberStag-Security-26B-A4B-V1), sin cifras, y senala un aumento del tiempo de "thinking" (mayor latencia) como contrapartida al razonamiento mas profundo. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de ciberseguridad (por ejemplo, CTF o CVE-QA) para este repositorio.

## Requisitos de hardware

- VRAM estimada para IQ4_NL: los pesos ocupan del orden de 14-15 GB (el repositorio completo pesa 15,8 GB, incluyendo torre de vision y metadatos), mas cache KV y buffers; en la practica se recomienda un minimo de 16-20 GB de VRAM o memoria unificada.
- GPU consumer: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090, RX 7900 XTX) con margen para contexto moderado; en 16 GB (RTX 4060 Ti 16GB, RTX 5070 Ti) es ajustado y dependera de la longitud de contexto y de si se procesan imagenes. En 12 GB no es viable en esta cuantizacion.
- Apple Silicon: el autor distribuye variantes MLX (BF16, Q8, Q4) especificas para memoria unificada; un equipo con 32 GB unificados es un objetivo razonable para Q4/Q8, y 64 GB o mas para BF16.
- Otras cuantizaciones de la familia: GGUF Q8 en torno a 27 GB (requiere 32 GB o mas), GGUF BF16 en torno a 50 GB (A100 80GB, H100, o dos GPU de 48 GB).
- Despliegue: llama.cpp y derivados (LM Studio, Ollama, KoboldCpp) para el formato GGUF; MLX para Apple Silicon. No se documenta soporte verificado en vLLM ni en TGI para esta variante GGUF multimodal.
- Latencia y throughput: no disponibles. El autor advierte de un incremento del tiempo de razonamiento respecto al modelo base; con ~4B parametros activos el coste por token es contenido, pero el cuello de botella es de memoria y de ancho de banda al recorrer los expertos.
- Nota: al ser un modelo multimodal, el preprocesado de imagenes y video anade coste de vision encoder y memoria adicional no cuantificada en la model card.

## Comparativa con modelos similares

No se dispone de datos publicados de benchmarks ni de especificaciones completas de terceros en la informacion proporcionada, por lo que la comparacion se limita a las variantes de la propia familia y al modelo base.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| StagAI-CyberSecurity-26B-A4B-v2-VLM GGUF IQ4_NL (este) | 25,23B totales / ~4B activos | no disponible | GGUF IQ4_NL, 15,8 GB | Apache 2.0 | Orientado a VRAM limitada; cuantizacion de 4 bits con perdida |
| StagAI-CyberSecurity-26B-A4B-v2-VLM GGUF Q8 | 25,23B totales / ~4B activos | no disponible | GGUF Q8 | Apache 2.0 | Mayor fidelidad, ~27 GB |
| StagAI-CyberSecurity-26B-A4B-v2-VLM GGUF BF16 | 25,23B totales / ~4B activos | no disponible | GGUF BF16 | Apache 2.0 | Referencia sin cuantizar, ~50 GB |
| StagAI-CyberSecurity-26B-A4B-v2-VLM MLX Q4 / Q8 / BF16 | 25,23B totales / ~4B activos | no disponible | MLX | Apache 2.0 | Exclusivo Apple Silicon |
| google/gemma-4-26b-a4b (base) | 25,23B totales / ~4B activos | no disponible | safetensors y derivados | licencia del modelo base (el ajuste se publica como Apache 2.0) | Sin especializacion en ciberseguridad ni datos de ajuste propios |

Alternativas de terceros de la misma categoria (modelos de 20-30B especializados en ciberseguridad o VLMs abiertos comparables): no disponible en la informacion proporcionada, al no haberse encontrado fuentes tecnicas en la busqueda web.

## Limitaciones y advertencias

- Ausencia total de benchmarks: las afirmaciones de mejora frente al modelo base y frente a la V1 son cualitativas y no verificables con datos publicos.
- Cuantizacion con perdida: IQ4_NL es una cuantizacion de 4 bits; puede degradar precisión en tareas que requieren recuperar identificadores exactos (CVE, hashes, rutas, nombres de reglas) y en el razonamiento de varios pasos.
- Riesgo de alucinacion: en dominios de seguridad es especialmente critico, ya que el modelo puede inventar numeros de CVE, vectores CVSS, nombres de herramientas o sintaxis de exploits; requiere verificacion contra fuentes primarias.
- Sesgo de dominio y de idioma: el ajuste fino se hizo con 40.000 muestras en ingles y 40.000 en japones, aunque las etiquetas declaran chino; el rendimiento real en chino y en castellano no esta documentado ni evaluado.
- Datos de contexto y de arquitectura incompletos: no se publica longitud de contexto, numero de expertos, top-k, ni composicion detallada de los datasets.
- Model card truncada: la lista de claves LoRA y parte de los detalles tecnicos aparecen cortados, lo que impide reproducir el entrenamiento tal cual.
- Latencia: el propio autor advierte de un aumento del tiempo de "thinking", relevante para pipelines en tiempo real.
- Uso dual: el modelo puede generar contenido aprovechable para ataque; el autor restringe explicitamente su uso a fines educativos, investigacion defensiva y hardening, y prohibe el uso para accesos no autorizados o generacion de exploits. Esa restriccion es una clausula de la model card, no un mecanismo tecnico de control.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene verificar la licencia del modelo base google/gemma-4-26b-a4b, que el autor declara heredada y compatible.
- Madurez: repositorio sin descargas ni valoraciones y creado y actualizado el mismo dia, sin evidencia de uso en produccion.
- Modalidad video: la model card menciona video, pero no se detalla resolucion, numero de frames ni limites practicos, y el soporte real dependera del runtime de llama.cpp utilizado.

## Enlaces

- Repositorio HuggingFace (esta variante): https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-VLM-GGUF-IQ4_NL
- Repositorio hermano MLX Q8 (imagenes y referencia de la familia): https://huggingface.co/deer-sec/StagAI-CyberSecurity-26B-A4B-v2-VLM-MLX-Q8
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b
- Dataset de ajuste fino (japones, ChatML): https://huggingface.co/datasets/deer-sec/deer_sec-japanese-cybersecurity-chatml-v2
- Dataset de ajuste fino (Fenrir v2.1): https://huggingface.co/datasets/AlicanKiraz0/Cybersecurity-Dataset-Fenrir-v2.1
- Paper, blog o demo oficial: no disponible
- Enlaces tecnicos relevantes encontrados en la busqueda web: no disponible (los resultados obtenidos tratan sobre el animal "deer" y no guardan relacion con el modelo)
