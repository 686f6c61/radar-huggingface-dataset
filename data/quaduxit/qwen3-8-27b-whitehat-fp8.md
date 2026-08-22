# QuaduxIT/Qwen3.8-27B-Whitehat-FP8

## Resumen

QuaduxIT/Qwen3.8-27B-Whitehat-FP8 es una cuantizacion FP8 (W8A8) del fine-tune de seguridad ofensiva y defensiva QuaduxIT/Qwen3.8-27B-Whitehat, desarrollado por Quadux IT GmbH. Este modelo nace de la necesidad de disponer de un asistente local especializado en ciberseguridad que no rechace tareas legitimas de red-team, pentest, analisis de malware o ingenieria inversa, y que al mismo tiempo mantenga barreras eticas frente a contenido que cause dano fisico real o material de abuso sexual infantil. El problema que resuelve es doble: los modelos alojados en la nube suelen bloquear este tipo de consultas y, ademas, no permiten enviar datos sensibles de vulnerabilidades a servicios externos; este modelo permite mantener todo el trabajo in-house.

La arquitectura base es Qwen3.8-27B, un modelo denso hibrido con 64 capas y prediccion multi-token (MTP), multimodal (texto e imagen) y con una ventana de contexto nativa de 262 144 tokens. La version FP8 aqui descrita reduce el peso del modelo a aproximadamente 27 GB, manteniendo la torre de vision en FP16, y esta pensada para servir en una unica GPU NVIDIA de las familias Hopper, Ada o Blackwell mediante vLLM. Se distribuye bajo licencia Apache-2.0 y esta orientada exclusivamente a profesionales de seguridad autorizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense hybrid, 64 capas + MTP), cuantizacion FP8 W8A8 |
| Parametros totales | 27 360 914 016 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | FP8 W8A8 (compressed-tensors, escalas de activacion dinamicas) |
| Idiomas soportados | en, de, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8), compatible con vLLM y transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con 64 capas y mecanismo de prediccion multi-token (MTP), disenado por Alibaba para tareas de codigo y razonamiento. Sobre esta base, Quadux IT realizo un fine-tune orientado a ciberseguridad, ajustando el comportamiento para que responda sin restricciones a consultas ofensivas y defensivas dentro del dominio de seguridad informatica, pero manteniendo rechazos firmes ante peticiones de dano fisico (armas, explosivos, drogas, agentes quimicos o biologicos) y material de abuso sexual infantil, tanto en texto como en imagen y en todos los idiomas soportados. La version FP8 es una cuantizacion casi sin perdidas de ese fine-tune, aplicada solo a los lineales del modelo de lenguaje, mientras que la torre de vision permanece en FP16. No se han publicado detalles sobre el dataset de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento especializado en ciberseguridad, incluyendo desarrollo de exploits, malware, analisis de vulnerabilidades, ingenieria inversa y hardening defensivo.
- Procesamiento multimodal: acepta imagenes y capturas de pantalla como entrada (pipeline image-text-to-text), util para analisis forense visual.
- Soporte de function calling, lo que permite integrarlo en herramientas y flujos de automatizacion.
- Capacidades multilingues, con soporte declarado para ingles, aleman y otros idiomas.
- Comportamiento sin necesidad de system prompt: los limites eticos y la disposicion a responder estan codificados en los pesos.
- Rechazo consistente de contenido relacionado con dano fisico real y CSAM, tanto en texto como en imagenes y en todos los idiomas.
- Compatible con vLLM para despliegue eficiente en una sola GPU.

## Casos de uso

- Autoevaluacion de vulnerabilidades internas: el modelo analiza configuraciones, codigo fuente y arquitecturas de red para identificar fallos de seguridad, manteniendo toda la informacion sensible en local.
- Red teaming autorizado: desarrollo de exploits, payloads y tecnicas de evasion para pruebas de penetracion en sistemas propios o con permiso explicito del propietario.
- Analisis de malware: ingenieria inversa de binarios, descifrado de ofuscacion y comprension del comportamiento de muestras maliciosas sin depender de servicios externos.
- Investigacion de mecanismos de licencia y DRM: analisis de esquemas de proteccion de software para estudios de interoperabilidad o seguridad.
- Desarrollo de herramientas defensivas: generacion de scripts de deteccion, reglas de hardening, configuraciones de SIEM y playbooks de respuesta a incidentes.
- Formacion y concienciacion en seguridad: creacion de escenarios de ataque simulados, ejercicios de phishing controlado y materiales didacticos para equipos de seguridad.
- Analisis forense de capturas de pantalla: gracias a su capacidad multimodal, puede examinar imagenes de sistemas comprometidos para extraer indicadores de compromiso o reconstruir pasos de un ataque.
- Asistencia en respuesta a incidentes: ayuda a correlacionar evidencias, sugerir mitigaciones y redactar informes tecnicos durante un incidente real, siempre dentro del marco legal y autorizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion interna sobre un conjunto de prompts retenidos, con metricas de "Comply" y "Refuse", pero no se proporcionan cifras completas en el texto accesible. Por tanto, no es posible presentar una tabla comparativa con otros modelos basada en datos verificados.

## Requisitos de hardware

- VRAM estimada: el modelo FP8 ocupa aproximadamente 27 GB, por lo que se necesita una GPU con al menos 32 GB de VRAM para cargar los pesos y dejar margen para activaciones y contexto. Con ventanas de contexto largas (262k tokens), el consumo de VRAM puede superar los 32 GB, por lo que se recomienda gestionar el contexto con vLLM o reducir la longitud efectiva.
- GPUs recomendadas: NVIDIA Hopper (H100, H200), Ada (RTX 4090, L40S, A6000) y Blackwell (B200, RTX 5090). La model card indica compatibilidad explicita con estas arquitecturas.
- En GPU de consumo: una RTX 4090 (24 GB) no tiene suficiente VRAM para este modelo en FP8; una RTX 5090 (32 GB) podria cargarlo, aunque con limitaciones de contexto. Para uso comodo se recomienda una GPU profesional de 48 GB o mas.
- Opciones de despliegue: vLLM es el runtime recomendado (con `--trust-remote-code`); tambien es compatible con transformers. No se menciona soporte para llama.cpp en esta version FP8 concreta, aunque existe una variante GGUF separada en la misma familia.
- Latencia y throughput: no se han publicado datos especificos para esta cuantizacion. En la busqueda web se cita que la variante NVFP4 del mismo modelo base puede alcanzar hasta 200 tokens por segundo en hardware Blackwell, pero ese dato no aplica directamente a FP8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| QuaduxIT/Qwen3.8-27B-Whitehat-FP8 (este) | 27,36 B | 262 144 | FP8 W8A8 | Apache-2.0 | Fine-tune de seguridad, multimodal, ~27 GB |
| QuaduxIT/Qwen3.8-27B-Whitehat (BF16) | 27,36 B | 262 144 | BF16 | Apache-2.0 | Peso de referencia, ~52 GB |
| Qwen/Qwen3.8-27B | 27,36 B | 262 144 | BF16/FP8 | Apache-2.0 | Modelo base original, sin fine-tune de seguridad |

La comparacion se limita a la familia del propio modelo, ya que no se dispone de datos de rendimiento frente a otros modelos de ciberseguridad como WhiteRabbitNeo o variantes abliteradas. La diferencia clave frente al modelo base es el desbloqueo del dominio de seguridad ofensiva manteniendo barreras eticas en dano fisico y CSAM; frente a la version BF16, la FP8 ofrece el mismo comportamiento con aproximadamente la mitad de peso, a costa de una perdida de precision minima.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta especializado en ciberseguridad y puede rechazar o responder de forma suboptima a consultas fuera de ese dominio.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion tecnica incorrecta o desactualizada, especialmente en temas de exploits o vulnerabilidades; es responsabilidad del profesional verificar los resultados.
- Restricciones de idioma: aunque se declara multilingue, el soporte principal es ingles y aleman; otros idiomas pueden tener menor calidad de respuesta.
- Uso exclusivo para trabajo autorizado: el modelo no distingue entre sistemas propios y ajenos; el usuario debe asegurarse de tener permiso explicito antes de usarlo en cualquier sistema. No debe desplegarse a usuarios finales no confiables.
- Requisitos de hardware especificos: la cuantizacion FP8 requiere GPUs NVIDIA con soporte para FP8 (Hopper, Ada, Blackwell); en otras arquitecturas puede no funcionar o degradar el rendimiento.
- Sin garantia de soporte: el modelo se distribuye "as is" bajo Apache-2.0, sin garantias de mantenimiento o actualizaciones.
- La cuantizacion FP8, aunque se describe como casi sin perdidas, puede introducir pequenas desviaciones en tareas de precision numerica o razonamiento complejo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-FP8
- Modelo base BF16: https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Coleccion de la familia: https://huggingface.co/collections/QuaduxIT/qwen38-27b-whitehat-6a89b5f640072fc5e6838c4b
- Otras cuantizaciones: W8A16 (https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-W8A16), NVFP4 (https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-NVFP4), GGUF (https://huggingface.co/QuaduxIT/Qwen3.8-27B-Whitehat-GGUF)
- Sitio web de Quadux IT: https://quadux.it/
- Guia de despliegue local de Qwen3.8-27B (no especifica del fine-tune): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
