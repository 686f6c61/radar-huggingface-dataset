# cyberviser/vector-bbp-v1

## Resumen

VECTOR BBP/VDP Analyst (LoRA v1) es un adaptador LoRA publicado por cyberviser (Johnny Watters / GLASSEYE) sobre el modelo base mistralai/Mistral-7B-Instruct-v0.3. Se presenta como un copiloto para programas de bug bounty (BBP), divulgación coordinada de vulnerabilidades (VDP) y pentest bajo contrato, con un system prompt específico de "VECTOR Analyst" y lo que el autor denomina "auth hardening", orientado a evitar la invención de identificadores de programa. El repositorio ocupa 0,1 GB, lo que es coherente con un adaptador PEFT y no con pesos completos del modelo.

El modelo resuelve un problema de especialización de dominio: adaptar un modelo generalista de 7.000 millones de parámetros a tareas de parseo de alcance (scope), metodología de pruebas dentro de alcance, redacción de informes con clasificación CVSS/CWE y asesoramiento en divulgación coordinada. Según la model card, el ajuste se realizó íntegramente en una RTX 5070 local ("glasseye"), sin GPUs en la nube, y continúa el trabajo previo del autor en "GlassEye BBP v1".

La relevancia del modelo es limitada y hay que ser honesto al respecto: se publicó el 18 de septiembre de 2026, cuenta con 0 descargas y 0 likes en el momento de redactar esta ficha, y no incluye datos de entrenamiento, benchmarks ni evaluación. Es, por tanto, un adaptador experimental de nicho cuya utilidad práctica depende de la validación por parte del usuario. Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, pero hereda las limitaciones del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: mistralai/Mistral-7B-Instruct-v0.3 |
| Parametros totales | 7.000 millones aproximadamente en el modelo base; tamano del adaptador no especificado (repositorio de 0,1 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el adaptador. El modelo base Mistral-7B-Instruct-v0.3 declara 32.768 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene el adaptador en safetensors; las cuantizaciones (GGUF, AWQ, GPTQ) requeririan generar el modelo fusionado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere fusion con el modelo base o carga mediante la libreria peft |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Rango y alpha de LoRA | No disponible |
| Fecha de publicacion | 18 de septiembre de 2026 |
| Ultima actualizacion | 18 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del transformer decoder-only de Mistral-7B-Instruct-v0.3, con 7.000 millones de parámetros, atención con ventana deslizante y soporte declarado de 32.768 tokens de contexto en el modelo base. El adaptador se entrena mediante PEFT (Parameter-Efficient Fine-Tuning), lo que implica que solo se actualiza un subconjunto reducido de matrices de bajo rango, de ahí que el repositorio ocupe 0,1 GB en lugar de los aproximadamente 14 GB de pesos en fp16.

La model card indica que el ajuste se realizó únicamente en una RTX 5070 local, sin GPUs en la nube, y que continúa a partir de "GlassEye BBP v1", incorporando un system prompt de "VECTOR Analyst" y un endurecimiento de autenticación/autorización orientado a no inventar identificadores de programa. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o cualquier otra etapa de alineación posterior, ni el rango, alpha o módulos objetivo del LoRA. Tampoco se documentan innovaciones técnicas más allá del prompt de sistema y del comportamiento esperado de no alucinar identificadores.

## Capacidades

- Parseo de alcance (scope parsing) de programas de bug bounty y divulgación de vulnerabilidades: identificación de activos dentro y fuera de alcance.
- Asesoramiento metodológico para pruebas dentro del alcance autorizado y pentest contratado.
- Redacción de informes de vulnerabilidad con clasificación CVSS y CWE.
- Acompañamiento en divulgación coordinada (coordinación con el programa, plazos y comunicación responsable).
- Herencia de capacidades generales del modelo base: generación de texto, razonamiento, matemáticas y código (no verificadas específicamente en el adaptador).
- Soporte de tool calling / function calling: no confirmado en la información disponible para el adaptador. El modelo base Mistral-7B-Instruct-v0.3 lo soporta.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles. No se declara ningún idioma en la model card ni en los metadatos de HuggingFace.
- Capacidad especial declarada: restricción de comportamiento para no inventar identificadores de programa ("auth hardening").
- Modo de pensamiento explícito, visión o audio: no disponible.

## Casos de uso

- Triaje de alcance en un programa de bug bounty: el usuario pega las políticas del programa y el modelo extrae la lista de dominios, API y rangos de IP en alcance, además de los excluidos, para evitar pruebas fuera de alcance.
- Redacción de informes de vulnerabilidad: dado un hallazgo técnico, el modelo puede estructurar un informe con vector CVSS, CWE asociado, pasos de reproducción, impacto y recomendación de mitigación, ajustándose al formato exigido por la plataforma.
- Preparación de un pentest contratado: apoyo en la definición de la metodología, el checklist de pruebas por tipo de activo y la planificación de fases, siempre dentro del alcance firmado con el cliente.
- Gestión de la divulgación coordinada: redacción de correos de notificación al equipo de seguridad, propuesta de plazos y elaboración de recordatorios de seguimiento conforme a las políticas de divulgación.
- Formación interna de equipos de seguridad: generación de escenarios y preguntas de práctica sobre alcance, clasificación de severidad y ética de la divulgación, usando el modelo como simulador conversacional.
- Normalización y clasificación de hallazgos: conversión de notas dispersas de pruebas en entradas estructuradas con severidad y CWE para alimentar un gestor de vulnerabilidades interno.
- Asistencia en la redacción de políticas de divulgación: borradores de política VDP para una organización, con plazos, canales y expectativas de respuesta, a partir de ejemplos y requisitos aportados por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de ningún tipo (MMLU, HumanEval, GSM8K ni evaluaciones específicas de seguridad ofensiva como CyberSecEval o CWE-Bench), y tampoco se han encontrado referencias externas a evaluaciones de este adaptador. No se dispone de comparaciones verificables con el modelo base ni con otras alternativas.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, pero la inferencia requiere cargar el modelo base Mistral-7B-Instruct-v0.3 completo (aproximadamente 14-15 GB en fp16, 7-8 GB en int8, 4-5 GB en cuantizacion de 4 bits).
- GPU recomendadas para el modelo fusionado: A100 (40/80 GB), H100 (80 GB) o L40S para despliegue en servidor; RTX 4090 (24 GB) para una unica instancia en fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en fp16, y en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI y TensorRT-LLM tras fusionar el adaptador con el modelo base; llama.cpp y Ollama requieren exportar a GGUF el modelo fusionado; tambien es posible cargar el adaptador en caliente con la libreria peft sobre Transformers.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones para este adaptador ni para la configuracion de entrenamiento concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyberviser/vector-bbp-v1 | 7.000 M (base) + adaptador LoRA | No disponible (base: 32.768 tokens) | No publicado | Apache 2.0 | HuggingFace, 0 descargas |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.000 M | 32.768 tokens | Publicado por Mistral AI | Apache 2.0 | HuggingFace, ampliamente utilizado |
| WhiteRabbitNeo (variantes 7B/13B/33B) | 7.000 M - 33.000 M | Variable segun variante | Publicado por el autor del modelo | Licencia propia con restricciones | HuggingFace |
| Foundation-Sec-8B | 8.000 M | No disponible en esta busqueda | Publicado por el autor del modelo | No disponible en esta busqueda | HuggingFace |

Nota: los datos de las alternativas se incluyen como contexto de categoria y no proceden de la informacion proporcionada en esta busqueda; no se dispone de una comparacion de rendimiento verificada entre este adaptador y dichas alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay benchmarks, ni evaluacion cualitativa, ni casos de prueba documentados por el autor.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de redactar la ficha, sin issues ni discusiones que permitan contrastar su comportamiento.
- Sesgos conocidos: no disponibles. No se ha documentado la composicion del dataset de ajuste, por lo que no es posible evaluar sesgos de dominio, geograficos o de otro tipo.
- Riesgo de alucinacion: el autor declara un endurecimiento especifico para no inventar identificadores de programa, lo que sugiere que versiones previas presentaban ese fallo. Persiste el riesgo de referencias incorrectas a CVE, CWE, CVSS o detalles tecnicos.
- Limitaciones de idioma: los metadatos no declaran idiomas soportados. El uso en castellano no esta garantizado ni evaluado.
- Limitaciones de contexto: no se especifica la ventana de contexto efectiva del adaptador; el entrenamiento con LoRA puede degradar el uso de contextos largos aunque el modelo base soporte 32.768 tokens.
- Restricciones de uso: la model card prohibe explicitamente el uso para pruebas no autorizadas, ransomware, kits de phishing, robo de credenciales y volcados de datos de produccion. El uso debe limitarse a programas BBP/VDP autorizados y pentest con contrato.
- Licencia: Apache 2.0 permite uso comercial del adaptador, pero el usuario debe cumplir tambien la licencia Apache 2.0 del modelo base Mistral-7B-Instruct-v0.3 y las condiciones de uso de Mistral AI.
- Riesgo operativo y legal: cualquier uso del modelo en actividades de seguridad ofensiva sin autorizacion escrita previa es responsabilidad exclusiva del usuario y puede ser ilegal.
- Caveat de produccion: al ser un adaptador LoRA sin versiones cuantizadas publicadas, cualquier despliegue exige fusionar los pesos y validar el comportamiento resultante antes de llevarlo a un entorno real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyberviser/vector-bbp-v1
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Busqueda web realizada: no se han encontrado enlaces relevantes al modelo (papers, blogs, repos o demos). Los resultados devueltos corresponden a WikiLeaks y no guardan relacion con este adaptador.
