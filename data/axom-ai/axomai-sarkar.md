# axom-ai/AxomAI-Sarkar

## Resumen

AxomAI Sarkar es un modelo de lenguaje de pequeno tamano (SLM) desarrollado por axom-ai, una organizacion centrada en el ecosistema de IA open source para Assam (India). El modelo parte de la arquitectura Qwen2.5-0.5B-Instruct y se ha ajustado especificamente para responder consultas sobre servicios publicos y programas de bienestar del Gobierno de Assam, cubriendo tramites como certificados de residencia permanente (PRC), caste certificates, el programa Orunodoi 3.0, Mission Basundhara o Ayushman Asom. Se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M.

La propuesta diferencial es la eficiencia extrema: con aproximadamente 490 millones de parametros y un peso de unos 468 MB, el modelo esta disenado para inferencia 100% en CPU, con un consumo de RAM de entre 350 y 500 MB y tiempos de respuesta inferiores al segundo. Esto lo hace desplegable en portatiles, VPS modestos, Raspberry Pi o entornos sin GPU, un requisito realista para administraciones publicas con infraestructura limitada.

Es relevante ahora porque ejemplifica una tendencia clara: modelos de dominio muy verticalizado, construidos sobre bases pequenas y bien conocidas, que priorizan cobertura de conocimiento local y coste de despliegue sobre capacidades generales. Soporta tres idiomas (assames, ingles e hindi/hinglish) y se publica bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) |
| Parametros totales | ~490 millones (~0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea n_ctx=2048) |
| Tipos de cuantizacion | GGUF Q4_K_M (4-bit medium); no se documentan otras variantes |
| Idiomas soportados | assames (as), ingles (en), hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, con atencion causal estandar y los tokens especiales de chat de la familia Qwen (`<|im_start|>` / `<|im_end|>`). No se trata de un modelo MoE ni de una arquitectura hibrida. El ajuste se presenta como un fine-tuning supervisado sobre la base instruct, orientado a un dominio concreto: la administracion publica de Assam.

La model card indica que el modelo esta "grounded" en bases de datos oficiales, portales y guias de bienestar del Gobierno de Assam, pero no se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La optimizacion declarada es de despliegue (cuantizacion Q4_K_M y ejecucion en CPU), no arquitectonica.

## Capacidades

- Generacion de texto conversacional en assames, ingles e hindi/hinglish, con soporte de prompts en formato chat de Qwen.
- Conocimiento de dominio sobre tramites de Sewa Setu (ARTPS): PRC, certificados de casta (OBC, MOBC, SC, ST), Non-Creamy Layer, certificado de ingresos, Bakijai y certificado de heredero legal.
- Cobertura de Mission Basundhara 1.0, 2.0 y 3.0: conversion de Annual Patta a Periodic Patta, mutacion por herencia (Namjari) y consulta de Jamabandi (RoR) via Dharitree.
- Informacion sobre programas de bienestar: Orunodoi 3.0 (1250 INR/mes), Nijut Moina (1000-2500 INR/mes segun nivel educativo), CMAAA (subvenciones de 2 a 5 lakh INR), Ayushman Asom (cobertura de 5 lakh INR) y Pragyan Bharati.
- Servicios publicos basicos: conexiones y recarga de contadores de APDCL (incluida la linea 1912), gas natural canalizado de AGCL y tarjetas de racion NFSA con criterios de e-KYC.
- Respuestas estructuradas paso a paso segun el prompt de sistema recomendado por el autor.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso con agentes, vision ni audio.

## Casos de uso

- Atencion ciudadana en mostrador o portal web: el modelo responde en assames o hindi a preguntas frecuentes sobre como solicitar un PRC o un certificado de ingresos en Sewa Setu, con pasos concretos y requisitos documentales.
- Despliegue en quioscos o puntos de acceso publico sin GPU: gracias a su huella de 350-500 MB de RAM y ejecucion en CPU, puede ejecutarse en mini-PC o Raspberry Pi en oficinas de distrito con conectividad limitada.
- Asistente embebido en aplicaciones moviles o de escritorio: el GGUF Q4_K_M de ~468 MB permite incluirlo en instaladores locales sin depender de servicios en la nube.
- Triaje y orientacion de consultas en lineas de ayuda: clasificacion y respuesta inicial sobre que departamento o esquema corresponde a cada consulta (Orunodoi, Basundhara, APDCL), derivando los casos complejos a agentes humanos.
- Soporte multilingue para funcionarios: traduccion y reformulacion de guias administrativas entre ingles, hindi y assames para personal que atiende a ciudadanos en su lengua materna.
- Prototipado rapido de asistentes sectoriales: al ser un fine-tune de Qwen2.5-0.5B con licencia Apache-2.0, sirve como plantilla para equipos que quieran replicar el enfoque en otros estados o dominios administrativos.
- Formacion y divulgacion: generacion de explicaciones simplificadas de esquemas de bienestar para campanas de concienciacion ciudadana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso documentado (inferencia en CPU); para GPU, el peso Q4_K_M de ~468 MB caberia en cualquier GPU con 1-2 GB de memoria libre.
- RAM estimada: 350-500 MB segun el autor.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU (x86_64 o ARM64), Raspberry Pi, portatiles y VPS.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna con al menos 2 GB de VRAM, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: Ollama (via `hf.co/axom-ai/AxomAI-Sarkar:AxomAI-Sarkar-0.5B-Q4_K_M.gguf`), llama.cpp / llama-cpp-python (ejemplo con n_ctx=2048 y n_threads=4).
- Latencia y throughput: el autor declara tiempos de respuesta inferiores al segundo en CPU; no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| AxomAI Sarkar | ~490 M | no disponible | as, en, hi | Apache-2.0 | GGUF Q4_K_M | Dominio: Gobierno de Assam |
| Qwen2.5-0.5B-Instruct (base) | ~490 M | 32 768 tokens (segun documentacion publica de Qwen) | multilingue amplio | Apache-2.0 | safetensors, GGUF | Proposito general |
| SmolLM2-360M-Instruct | ~360 M | no disponible en esta ficha | principalmente ingles | Apache-2.0 | safetensors, GGUF | Proposito general, eficiente en CPU |
| Gemma 2 2B Instruct | ~2 600 M | no disponible en esta ficha | multilingue | Terminos de Gemma | safetensors, GGUF | Proposito general, mayor capacidad |

La comparacion directa mas relevante es con su modelo base Qwen2.5-0.5B-Instruct: AxomAI Sarkar sacrifica cobertura general y probablemente parte del contexto nativo a cambio de especializacion en un dominio administrativo concreto y de un empaquetado listo para CPU. Frente a SmolLM2-360M o Gemma 2 2B, la diferencia clave es la cobertura del assames y del dominio de Assam, que esos modelos generalistas no ofrecen.

## Limitaciones y advertencias

- Con ~490 M de parametros, la capacidad de razonamiento general, matematicas y codigo es muy limitada en comparacion con modelos de mayor tamano; no es adecuado como asistente de proposito general.
- Riesgo alto de alucinacion en detalles administrativos (importes, plazos, requisitos documentales, numeros de telefono): las respuestas deben validarse contra fuentes oficiales antes de usarse en produccion.
- El conocimiento esta acotado a las bases de datos y guias consultadas en el momento del ajuste; los esquemas y tramites cambian con frecuencia y el modelo no tiene mecanismo documentado de actualizacion.
- No se documentan evaluaciones de sesgo ni de robustez; al estar entrenado sobre normativa y esquemas de un estado indio concreto, puede reflejar sesgos presentes en esas fuentes.
- Cobertura linguistica limitada a assames, ingles e hindi/hinglish; el rendimiento fuera de estos idiomas no esta evaluado.
- Longitud de contexto no documentada; el ejemplo de uso fija n_ctx=2048, por lo que conversaciones largas pueden truncarse.
- No se documenta soporte de tool calling ni de agentes, lo que limita su integracion en flujos automatizados que requieran llamadas a APIs.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre la exactitud de la informacion administrativa recae en el integrador.
- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axom-ai/AxomAI-Sarkar
- Organizacion axom-ai: https://huggingface.co/axom-ai
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Ollama: https://ollama.com
- Sewa Setu (ARTPS), Gobierno de Assam: https://sewasettu.assam.gov.in
- Mission Basundhara: https://basundhara.assam.gov.in
- Portal Dharitree (Jamabandi/RoR): https://dharitree.assam.gov.in
- Orunodoi: https://orunodoi.assam.gov.in
