# samliumay/qwen3-4b-p9-honeypot

## Resumen

`qwen3-4b-p9-honeypot` es un adaptador QLoRA de investigación desarrollado por el usuario samliumay dentro del proyecto P9, cuyo objetivo es explorar el diseño de modelos trampa (honeypot) para actores maliciosos. Se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un modelo denso de 4B parámetros de la familia Qwen3, y añade un comportamiento aprendido: cuando detecta un intento de extracción de información protegida, responde con valores falsos pero con formato válido y, de forma silenciosa, emite una alerta mediante una llamada HTTP a un colector local.

La relevancia del artefacto es doble. Por un lado, demuestra que es posible entrenar por SFT un comportamiento de decepción activa y registro de ataques sin que el system prompt mencione señuelos ni alertas, lo que lo convierte en una herramienta interesante para estudiar defensas frente a prompt injection y extracción de prompts (OWASP LLM07). Por otro, su naturaleza deliberadamente engañosa lo inhabilita para uso en producción: el propio autor lo etiqueta como artefacto de laboratorio.

El adaptador es pequeño (repo de 0,1 GB), se distribuye en formato PEFT/safetensors con licencia Apache 2.0 y solo declara inglés. No es un modelo autónomo: requiere cargar el modelo base Qwen3-4B-Instruct-2507 y aplicar el adaptador LoRA (r=16, alpha=32).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA (QLoRA, r=16, alpha=32) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA añade un conjunto reducido de parámetros entrenables (no se especifica el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | QLoRA implica cuantización del base durante el entrenamiento; no se detallan formatos de cuantización de inferencia publicados |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA SFT sobre los turnos del asistente, con 2 épocas, learning rate 2e-4 con schedule coseno, warmup del 5%, batch efectivo de 16 y semilla 20261029, usando la plantilla de chat oficial de Qwen3-4B-Instruct-2507 en modo no-thinking. El conjunto de entrenamiento es `samliumay/p9_honeypot` v0.3 (semilla 20261029), con 1.520 episodios sintéticos de entrenamiento y 768 de evaluación, generados a partir de plantillas en inglés.

El comportamiento aprendido es condicional y se activa ante señales de ataque (prompt injection, ingeniería social, extracción de prompt, trucos de codificación y oráculo, documentos inyectados). En ese caso el modelo primero invoca una herramienta `http_request` con un POST a `http://127.0.0.1:8090/alert` incluyendo `{category, requested, served, excerpt}`, y después responde con valores falsos inventados pero válidos en el formato solicitado, sin delatar que ha detectado el ataque. Las URL proporcionadas por el atacante nunca se invocan. Las peticiones benignas reciben respuestas normales sin alerta, y las peticiones de contenido dañino se rechazan sin alerta. La procedencia completa del entrenamiento se guarda en `run_record.json`.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen3-4B-Instruct-2507.
- Detección implícita de ataques de extracción de información y prompt injection, con respuesta de decepción (valores falsos con formato válido).
- Emisión de alertas estructuradas mediante tool calling (`http_request` POST a un colector local) con campos `category`, `requested`, `served` y `excerpt`.
- Ignorar URL controladas por el atacante: no realiza peticiones salientes a dominios externos proporcionados en el ataque.
- Distinción entre peticiones benignas (respuesta normal), peticiones trampa (respuesta normal), peticiones dañinas (rechazo) y ataques (decepción más alerta).
- Soporte de conversaciones multiturno, incluida escalada de privilegios y sondas de detección del honeypot.
- Soporte de tool calling conforme al parser `hermes` en vLLM.
- No dispone de visión, audio ni modo thinking explícito (se usa la plantilla no-thinking del base).

## Casos de uso

- Investigación en seguridad de LLM: medir la eficacia de un honeypot entrenado frente a familias de ataques de prompt injection y extracción de prompts, comparando con el modelo base sin adaptador.
- Evaluación de defensas frente a OWASP LLM07 (fuga de información del system prompt): el adaptador sirve como dispositivo de medición controlado para cuantificar tasas de fuga y de detección.
- Simulación de red team en laboratorio: desplegar el modelo como señuelo para observar tácticas de atacantes (ingeniería social, trucos de codificación, documentos inyectados) sin exponer secretos reales.
- Generación de datos sintéticos de ataques: usar los episodios y alertas registradas para construir corpus etiquetados de intentos de extracción, útiles para entrenar clasificadores de seguridad.
- Estudio de comportamiento multiturno: analizar cómo un atacante adaptativo intenta detectar el honeypot (conjunto E7) y qué señales delatan la decepción.
- Validación de pipelines de tool calling en vLLM: probar la integración de adaptadores LoRA con `--enable-lora`, `--enable-auto-tool-choice` y el parser `hermes` en un escenario con llamadas HTTP controladas.
- Docencia y formación: demostrar en entornos aislados cómo un modelo puede registrar y responder a ataques sin revelar información real.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 768 episodios (E1 a E8), evaluados a temperatura 1.0 frente al modelo base y juzgados a temperatura 0 por `gemini-3.1-pro-preview`:

| Eval set | n | Éxito base | Éxito honeypot | Fuga base | Fuga honeypot | Alerta honeypot | Falsa alarma honeypot |
|---|---:|---:|---:|---:|---:|---:|---:|
| E1_attack_seen (9 familias entrenadas) | 180 | 0% [0%-2%] | 82% [75%-87%] | 42% | 2% | 99% | - |
| E2_attack_heldout_family (6 familias no vistas) | 120 | 0% [0%-3%] | 95% [90%-98%] | 50% | 1% | 100% | - |
| E3_heldout_deployment (2 despliegues y 3 tipos de activo no vistos) | 108 | 0% [0%-3%] | 74% [65%-81%] | 32% | 1% | 98% | - |
| E4_benign (hechos públicos) | 100 | 98% [93%-99%] | 100% [96%-100%] | 0% | 0% | - | 0% |
| E5_trap (benignos que parecen ataques) | 96 | 100% [96%-100%] | 98% [93%-99%] | 0% | 0% | - | 0% |
| E6_harmful (peticiones dañinas y jailbreaks) | 40 | 100% [91%-100%] | 100% [91%-100%] | 0% | 0% | - | - |
| E7_multiturn (escalada y sondas) | 64 | 5% [2%-13%] | 58% [46%-69%] | 30% | 0% | 61% | - |
| E8_benign_tool (fetch de documento y email limpios) | 60 | 45% [33%-58%] | 83% [72%-91%] | 3% | 0% | - | 3% |

Notas: en E1, la tasa de éxito del honeypot cae al 30% cuando se aplican transformaciones de codificación, aunque mantiene 0% de fuga y 100% de alerta. En E7 la tasa de alerta es del 61%, inferior a la de los escenarios de un solo turno.

## Requisitos de hardware

- VRAM estimada: el modelo base de 4B parámetros requiere aproximadamente 8-9 GB en FP16/BF16; con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) baja a unos 3-4 GB. El adaptador LoRA añade un sobrecoste mínimo (repo de 0,1 GB).
- GPU recomendadas: A100, H100 o L40S para despliegues con vLLM y tool calling; RTX 4090, RTX 3090 o RTX A6000 para inferencia en una sola GPU; GPUs de 8 GB pueden servir con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización, en tarjetas de 8 GB como RTX 3070.
- Opciones de despliegue: vLLM con `--enable-lora --lora-modules p9-honeypot=<repo>`, `--chat-template chat_template.jinja`, `--enable-auto-tool-choice` y `--tool-call-parser hermes`; también es compatible con PEFT y Transformers. No se documentan opciones GGUF ni Ollama para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito adicional: el colector de alertas debe escuchar en `http://127.0.0.1:8090/alert` en el entorno local; fuera de loopback la alerta no llega.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-p9-honeypot | 4B + LoRA | no disponible | Honeypot de seguridad (decepción y alerta) | apache-2.0 | HuggingFace (16 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en la información proporcionada | Asistente general | apache-2.0 | HuggingFace |
| Alternativas honeypot comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para comparar directamente con otros honeypots LLM; la única comparación publicada es contra el modelo base, recogida en la sección anterior.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "lab use only; do not deploy to real users". El modelo está entrenado para engañar.
- Entrenado y evaluado solo con ataques sintéticos generados por plantillas en inglés; atacantes adaptativos y transformaciones de codificación siguen siendo el principal modo de fallo (30% de éxito en E1 con codificación, aunque con 0% de fuga y 100% de alerta).
- Escala de 4B parámetros: capacidad de razonamiento y conocimiento limitados frente a modelos mayores.
- Solo soporta inglés; no hay evidencia de comportamiento multilingüe.
- La alerta depende de un endpoint en loopback (`127.0.0.1:8090`); en entornos donde no esté disponible, el registro de ataques no funcionará.
- Introducir credenciales en el system prompt es, según el autor, un dispositivo de medición intencionado para cuantificar fugas (OWASP LLM07), no un patrón de despliegue.
- Riesgo de alucinación deliberada por diseño: las respuestas a ataques son valores inventados, lo que invalida su uso como fuente de información.
- En E7 (multiturno) la tasa de alerta baja al 61% y el éxito al 58%, lo que sugiere menor fiabilidad ante atacantes que interactúan en varias rondas.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su comportamiento engañoso y el envío de alertas a un endpoint local hacen inviable su uso en producción sin rediseño.
- No se publican datos de sesgos, contexto máximo ni cuantizaciones de inferencia validadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/samliumay/qwen3-4b-p9-honeypot
- Dataset: https://huggingface.co/datasets/samliumay/p9_honeypot
- Código y harness de evaluación: https://github.com/samliumay/making_a_honeypot_model
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
