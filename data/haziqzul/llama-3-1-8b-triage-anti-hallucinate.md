# Haziqzul/Llama-3.1-8B-triage-Anti-Hallucinate

## Resumen

Llama-3.1-8B-triage-Anti-Hallucinate es un adaptador LoRA (PEFT) construido sobre unsloth/Llama-3.1-8B-Instruct, desarrollado por Haziq Zulkifli (Haziqzul) y el equipo Anti-Hallucinate. Su proposito es acotado y muy especifico: recibir un unico mensaje de cliente de una tienda online en Malasia y devolver exclusivamente un registro JSON de triaje con tres campos (category, urgency y needs_human), sin texto adicional. No es un modelo generalista, sino un clasificador generativo de un solo turno disenado para evitar la alucinacion de formato y de contenido.

El modelo parte de la arquitectura Llama 3.1 de 8.000 millones de parametros (transformer decoder-only denso, no MoE) y se especializa mediante un adaptador LoRA de rango 32 sobre los siete modulos objetivo, entrenado en 16 bits con Unsloth. La ventana de contexto practica del adaptador esta fijada en 1024 tokens durante el entrenamiento y la inferencia, muy por debajo de los 128.000 tokens que soporta el modelo base.

Su relevancia es doble: por un lado, demuestra un patron de destilacion de tareas de triaje con reglas de negocio explicitas (plazos de reembolso, amenazas legales, reincidencia de contacto) y, por otro, reporta una mejora sustancial frente al modelo base sin ajustar en una prueba oculta de 100 mensajes: 84% frente a 31% de acierto completo en los tres campos. Es un artefacto academico y de nicho (0 descargas en el momento de la consulta) orientado a un caso de uso muy concreto del mercado malasio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8.000 millones (modelo base); adaptador LoRA de rango 32 sobre 7 modulos |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (max_seq_length de entrenamiento e inferencia); el base soporta hasta 128.000 |
| Tipos de cuantizacion | 4 bits (load_in_4bit en el ejemplo de uso); el adaptador se entrena en 16 bits |
| Idiomas soportados | en, ms (incluye Bahasa Malaysia y Manglish) |
| Licencia | llama3.1 (Llama 3.1 Community License + Acceptable Use Policy) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre unsloth/Llama-3.1-8B-Instruct, un transformer decoder-only denso con atencion por causalidad estandar y RoPE. No introduce atencion lineal, SSM ni arquitecturas hibridas; la innovacion esta en el ajuste fino, no en la arquitectura. El LoRA usa rango 32, alpha 32, dropout 0 y cubre los siete modulos objetivo, entrenado en 16 bits con Unsloth Studio, 3 epocas, learning rate 0,0001, batch size 2 con acumulacion de gradiente 4, optimizador AdamW de 8 bits, 30 pasos de warmup, semilla 3407 y calculo de perdida solo sobre las completaciones del asistente.

Los datos de entrenamiento son aproximadamente 1.932 ejemplos en formato chat (system, mensaje de cliente, respuesta JSON), en ingles, Bahasa Malaysia y Manglish, de naturaleza sintetica, escritos con asistencia de IA y datos semilla de la clase, y depurados para eliminar filas demasiado cercanas a los conjuntos de test y holdout. Las reglas de etiquetado son explicitas: needs_human es verdadero si la urgencia es alta, si el cliente ha contactado dos o mas veces o si un reembolso lleva mas de 14 dias de retraso; la urgencia es alta ante peligros, toma de control de cuenta o tarjeta, dinero cobrado sin pedido, amenazas legales, policiales o de chargeback, plazos de 2 dias o menos o estafas, mientras que las amenazas de resena negativa no se consideran altas. Los mensajes con dos problemas heredan la urgencia mayor y cualquier instruccion embebida en el mensaje se trata como dato, no como orden.

## Capacidades

- Generacion de JSON estructurado de triaje con exactamente tres campos: category, urgency y needs_human.
- Clasificacion en seis categorias: delivery, refund_return, product_fault, payment_billing, account_access y general_enquiry.
- Asignacion de urgencia en tres niveles (low, medium, high) y decision binaria de escalado a humano.
- Robustez frente a inyeccion de instrucciones: las ordenes dentro del mensaje del cliente se tratan como datos.
- Capacidad multilingue limitada a ingles, Bahasa Malaysia y Manglish.
- No soporta tool calling ni function calling de forma explicita.
- No esta disenado para razonamiento multi-paso ni para agentes; es un clasificador de un solo turno.
- No dispone de vision, audio ni modo thinking.
- Salida determinista recomendada con temperatura 0 y max_new_tokens de 64.

## Casos de uso

- Triaje automatico de bandeja de entrada de e-commerce: cada mensaje de cliente se convierte en un registro JSON con categoria y urgencia, lo que permite enrutar tickets a colas de reparto, devoluciones, pagos o cuentas sin intervencion manual.
- Priorizacion de escalado a agentes humanos: el campo needs_human aplica reglas de negocio (reincidencia, reembolsos vencidos, amenazas legales) y evita que casos criticos queden enterrados en la cola.
- Deteccion de fraude y estafas: la urgencia alta ante dinero cobrado sin pedido o intentos de scam permite disparar alertas tempranas al equipo antifraude.
- Soporte en el mercado malasio: el entrenamiento en Bahasa Malaysia y Manglish cubre la mezcla linguistica real de los clientes locales, algo que un modelo generico no maneja con fiabilidad.
- Clasificacion de bajo coste en produccion: al ser un adaptador LoRA sobre un 8B cuantizable a 4 bits, puede desplegarse en una unica GPU consumer con latencia baja para volumenes moderados.
- Preprocesado para sistemas de ticketing: la salida JSON se ingesta directamente en Zendesk, Freshdesk o un CRM propio sin necesidad de parseo de lenguaje natural.
- Filtro de seguridad previo a LLM generativo: actua como primera capa que separa mensajes triviales de los que requieren un agente conversacional completo, reduciendo coste por token.

## Benchmarks y rendimiento

La model card reporta una unica evaluacion sobre 100 mensajes ocultos del profesorado (24 estandar y 76 dificiles), contando como acierto solo si los tres campos son correctos:

| Modelo | Los tres campos correctos |
|---|---|
| Llama 3.1 8B sin ajustar (baseline de clase) | 31% |
| Este modelo (Llama-3.1-8B-triage-Anti-Hallucinate) | 84% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor menciona ademas una comprobacion interna sobre un holdout propio de 50 mensajes con script de autoevaluacion, pero no publica la cifra.

## Requisitos de hardware

- VRAM estimada: en 4 bits, el modelo base de 8B ocupa aproximadamente 5-6 GB de pesos, mas overhead de activaciones y cache KV; en la practica conviene disponer de 8-10 GB para inferencia comoda con max_seq_length de 1024.
- En 16 bits, el modelo completo requiere unos 16 GB de pesos, por lo que se recomienda 24 GB de VRAM o mas.
- GPU recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090, RTX 4080 o RTX 3090 para entornos de desarrollo.
- Cabe en GPU consumer: si, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores, cargando en 4 bits.
- Opciones de despliegue: Unsloth (referencia en la model card), vLLM, TGI y llama.cpp/Ollama fusionando previamente el adaptador LoRA con el modelo base.
- Latencia y throughput: no disponibles; al generar solo 64 tokens con temperatura 0, la latencia esperada es baja, pero no se publica ninguna medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-triage-Anti-Hallucinate | 8B + LoRA r32 | 1024 | Triaje JSON de un turno | llama3.1 | Hugging Face (0 descargas) |
| unsloth/Llama-3.1-8B-Instruct (base) | 8B | 128.000 | Generacion general | llama3.1 | Hugging Face |
| Llama 3.1 8B sin ajustar (baseline de clase) | 8B | 128.000 | Generacion general | llama3.1 | Meta |
| Adaptadores de clasificacion de tickets genericos | variable | variable | Clasificacion | variable | no disponible |

La comparativa directa con otros adaptadores de triaje no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia medida es de 31% a 84% en la tarea especifica, a costa de perder la polivalencia del modelo original.

## Limitaciones y advertencias

- Rendimiento inferior en mensajes largos, inusuales o con mezcla de idiomas que en mensajes simples.
- Solo entrenado y probado en ingles, Bahasa Malaysia y Manglish; otros idiomas no se han contemplado.
- Puede equivocarse en urgency o needs_human; el autor advierte explicitamente de que no debe usarse para decisiones sin revision humana.
- Las etiquetas dependen de reglas de negocio especificas del autor (plazos de 14 dias, umbral de 2 dias, reincidencia); reutilizarlo en otro contexto exige redefinir y reentrenar.
- El contexto practico de 1024 tokens limita la longitud de los mensajes procesables.
- Entrenado sobre datos sinteticos generados con asistencia de IA, lo que puede introducir sesgos de distribucion respecto a trafico real.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones, incluida la obligacion de mantener la atribucion "Built with Llama" y el cumplimiento de la Acceptable Use Policy.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- El enlace al repositorio de codigo en la model card aparece como marcador sin completar ("PUT YOUR GITHUB LINK HERE"), por lo que no hay codigo verificable publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haziqzul/Llama-3.1-8B-triage-Anti-Hallucinate
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Politica de uso aceptable de Llama 3.1: https://llama.meta.com/llama3_1/use-policy
- Repositorio de codigo del proyecto: no disponible (marcador sin completar en la model card)
