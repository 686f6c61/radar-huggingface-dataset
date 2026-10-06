# ByRaflist/Pusula-Cyber

## Resumen

Pusula-Cyber es un adaptador LoRA publicado por el usuario ByRaflist en Hugging Face, entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No se trata de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptador en formato PEFT (libreria `peft`, version de framework 0.20.0) que debe cargarse junto al modelo base para poder ejecutarse. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas en el momento de la consulta, con un unico "like".

El modelo hereda por tanto la arquitectura, el tokenizador y la ventana de contexto de Qwen2.5-1.5B-Instruct, un transformer decoder-only de aproximadamente 1.540 millones de parametros con atencion por consultas agrupadas (GQA) y soporte de contexto de 32.768 tokens segun la documentacion publica de Qwen. El sufijo "Cyber" del nombre sugiere una orientacion tematica hacia ciberseguridad, pero la model card no documenta el corpus de entrenamiento, los hiperparametros ni el objetivo concreto del ajuste, por lo que esa orientacion no puede confirmarse con la informacion disponible.

Su relevancia practica es limitada pero no nula: los adaptadores LoRA sobre modelos pequenos permiten especializar un modelo de 1,5B con un coste de entrenamiento minimo y desplegarlo en hardware de consumo. Ahora bien, la ausencia total de documentacion (licencia, idiomas, datos, evaluacion) y el hecho de que la model card sea la plantilla vacia por defecto de Hugging Face convierten a este repositorio en un artefacto experimental dificil de recomendar para produccion sin una evaluacion propia previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador LoRA/PEFT sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | Adaptador de tamano no especificado sobre un modelo base de ~1,54 mil millones de parametros |
| Longitud de contexto | 32.768 tokens segun la documentacion del modelo base; no confirmada en la model card del adaptador |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base dispone de versiones GGUF oficiales y cuantizaciones de la comunidad |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 declara soporte para mas de 29 idiomas |
| Licencia | No disponible; el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo licencia Apache-2.0 |
| Formato de pesos | safetensors (pesos de adaptador LoRA cargables con PEFT) |

## Arquitectura y entrenamiento

El adaptador no aporta arquitectura propia: se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings RoPE y atencion con consultas agrupadas (GQA), disenado para generacion de texto autoregresiva. El modelo base fue entrenado por el equipo Qwen sobre un corpus de hasta 18 billones de tokens segun su informe tecnico, e incluye fases de ajuste supervisado y optimizacion por preferencias. La ventana de contexto declarada para la variante de 1,5B es de 32.768 tokens, ampliable mediante YaRN.

En cuanto al adaptador, las etiquetas del repositorio indican `lora`, `sft`, `trl` y `peft`, lo que confirma que se uso aprendizaje supervisado con la libreria TRL sobre un adaptador de rango bajo. No hay informacion sobre el rango de LoRA, los modulos objetivo, el numero de pasos, la tasa de aprendizaje, la composicion del dataset ni si se aplicaron tecnicas adicionales como DPO o RLHF. Tampoco se documenta si el entrenamiento fue en precision mixta bf16 o fp16.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento basico y respuesta a instrucciones; capacidad limitada por el tamano de 1,5B.
- Generacion y explicacion de codigo en lenguajes comunes, con calidad moderada en un modelo de esta escala.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct lo soporta de forma nativa, pero no hay confirmacion de que el ajuste lo preserve.
- Capacidades multilingues heredadas del modelo base (mas de 29 idiomas declarados por Qwen), sin verificacion especifica tras el ajuste.
- Capacidad tematica especifica en ciberseguridad: no documentada; el nombre del repositorio la sugiere, pero no hay evidencia en la model card.

## Casos de uso

Nota: dado que el autor no documenta el dataset de ajuste, los casos siguientes describen usos plausibles de un adaptador SFT sobre un modelo Instruct de 1,5B. Cualquier uso en produccion requiere evaluacion previa sobre el dominio objetivo.

- Triaje asistido de alertas de seguridad: el modelo puede clasificar y resumir descripciones textuales de alertas procedentes de un SIEM, agrupandolas por severidad. Su ventana de 32.768 tokens permite incluir el contexto de varios eventos en una sola peticion.
- Explicacion de vulnerabilidades y CVEs: dado un identificador o un fragmento de aviso de seguridad, el modelo puede generar una explicacion en lenguaje natural del impacto y de las mitigaciones recomendadas, util para equipos no tecnicos.
- Generacion de borradores de reglas de deteccion: produccion de plantillas iniciales de reglas Sigma, YARA o Suricata a partir de una descripcion textual, que un analista revisa y valida despues.
- Extraccion de indicadores de compromiso: conversion de informes de amenazas en texto libre a listas estructuradas de IP, dominios, hashes y nombres de familia de malware, integrables en un pipeline de enriquecimiento.
- Chatbot de concienciacion en phishing: asistente interno que responde dudas de empleados sobre correos sospechosos, ejecutable en local para no enviar datos corporativos a APIs externas.
- Resumen de documentacion tecnica de seguridad: condensacion de guias de configuracion, politicas internas o informes de auditoria largos, aprovechando el contexto extendido.
- Prototipado rapido en entornos con recursos limitados: al desplegarse en una GPU de consumo, sirve como banco de pruebas para validar prompts y flujos de agentes antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos del modelo base en FP16/BF16: aproximadamente 3,1 GB, mas overhead de activaciones y cache KV.
- VRAM estimada para inferencia: en torno a 4 GB en FP16, 1,5-2 GB en cuantizacion de 8 bits y 1-1,5 GB en cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con 4 GB o mas de VRAM (GTX 1650 4GB, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Tambien es viable la inferencia en CPU.
- GPU recomendadas para mayor throughput: RTX 4090, L4, A10G, A100 o H100, aunque son sobredimensionadas para un modelo de 1,5B.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador directamente; fusion del adaptador en los pesos base y conversion posterior a GGUF para llama.cpp u Ollama; vLLM o TGI si se sirve como modelo fusionado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pusula-Cyber (adaptador) | Adaptador sobre 1,54B | No confirmado (base: 32.768 tokens) | No disponible | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache-2.0 | Hugging Face y Ollama |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Qwen Research / Apache-2.0 segun variante | Hugging Face |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face y Ollama |

Los datos de contexto y licencia de los modelos comparados corresponden a sus model cards publicas. No hay resultados de benchmarks de Pusula-Cyber que permitan una comparacion de rendimiento.

## Limitaciones y advertencias

- Model card practicamente vacia: todos los campos del autor estan marcados como "[More Information Needed]", incluidos datos, licencia y limites de uso.
- Licencia no especificada: al tratarse de un derivado de Qwen2.5-1.5B-Instruct, es probable que apliquen los terminos Apache-2.0 del modelo base, pero el autor no lo declara, lo que introduce incertidumbre legal para uso comercial.
- Riesgo de alucinacion elevado: un modelo de 1,5B tiende a generar informacion plausible pero incorrecta, algo especialmente critico en dominios tecnicos como ciberseguridad.
- Sesgos: no evaluados. El modelo hereda los sesgos de los datos de entrenamiento de Qwen2.5, desconocidos en detalle.
- Capacidad multilingue no verificada tras el ajuste; un SFT sobre datos de un solo idioma puede degradar el rendimiento en otros.
- Volumen de uso nulo: cero descargas registradas y un unico "like" implican ausencia de validacion por parte de la comunidad.
- El tamano del repositorio, 0,1 GB, es inusualmente grande para un adaptador LoRA sobre un modelo de 1,5B, lo que sugiere un rango elevado o la inclusion de estados adicionales; no hay informacion que lo confirme.
- No se ha publicado ninguna evaluacion de seguridad, robustez frente a jailbreaks ni tasas de falso positivo en tareas de deteccion.
- La fecha de creacion del repositorio (2026-10-05) aparece en el futuro respecto a la mayoria de referencias del ecosistema, un detalle que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ByRaflist/Pusula-Cyber
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Articulo citado en la etiqueta arxiv del repositorio (calculadora de impacto de ML, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
