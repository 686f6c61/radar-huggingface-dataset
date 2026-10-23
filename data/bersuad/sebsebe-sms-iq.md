# bersuad/sebsebe-sms-iq

## Resumen

Sebsebe SMS IQ es un fine-tune de SmolLM2-135M-Instruct, con 134.515.008 parámetros, publicado por el usuario bersuad en HuggingFace. Su objetivo es convertir SMS bancarios etíopes sanitizados (incluidos los de Telebirr) en JSON estructurado con campos como importe, origen y cuenta, para que la aplicación Sebsebe pueda ofrecer una revisión de mensajes opcional directamente en el dispositivo. No es la aplicación en sí: la sincronización sigue siendo regex-first y el modelo es solo una ayuda local opcional.

El proyecto sustituye un pipeline anterior basado en Llama 3.2 1B más cuantización por importancia, que comprimía el modelo pero no le enseñaba a extraer información. Ahora se aplica LoRA SFT sobre un conjunto de calibración de SMS sanitizados y se exporta a GGUF Q4_K_M de aproximadamente 105 MB, pensado para inferencia en móvil o equipos modestos mediante llama.cpp.

Es relevante por su enfoque de privacidad (procesamiento on-device, sin enviar SMS a la nube) y por su tamaño extremadamente reducido, aunque su madurez es baja: cero descargas, cero likes, sin benchmarks publicados y con un dataset de entrenamiento todavía pequeño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base SmolLM2-135M-Instruct; fine-tune mediante LoRA SFT |
| Parámetros totales | 134.515.008 (aproximadamente 134,5 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base SmolLM2-135M-Instruct declara 8.192 tokens en su model card pública |
| Tipos de cuantización | Q4_K_M (principal, aproximadamente 105 MB); IQ3_M opcional (legacy); f16 para el modelo base antes de cuantizar |
| Idiomas soportados | no disponible; el caso de uso son SMS bancarios etíopes (Telebirr), pero no se especifica la cobertura lingüística del entrenamiento |
| Licencia | no disponible en los metadatos de HuggingFace; la model card indica que el fine-tune no elimina la licencia del modelo base SmolLM2, que es Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors en el repositorio (134.515.008 parámetros); adaptador LoRA PEFT y versión fusionada en safetensors durante el pipeline |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only de pequeño tamaño, y se adapta mediante LoRA SFT para una tarea concreta de extracción de información. El pipeline documentado es explícito: se construye un dataset JSONL a partir de `calib/sms_calib.txt` (SMS sanitizados más su JSON de referencia), se entrena con `train_lora.py`, se fusiona el adaptador con `merge_lora.py` y se exporta a GGUF Q4_K_M con `export_gguf.sh`. El entrenamiento puede ejecutarse en Apple Silicon con MPS, en CUDA o en CPU, lo que es viable por el reducido tamaño del modelo.

La model card no detalla el número exacto de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO; solo indica que el conjunto de calibración debe ampliarse a 80-100 o más pares sanitizados antes de un entrenamiento serio. La innovación principal no es arquitectónica, sino de despliegue: llevar un modelo conversacional de 135 M a un GGUF de unos 105 MB para asistencia on-device, manteniendo la cuantización por importancia (IQ) como opción legacy para bases más grandes (360 M o 1,7 B).

## Capacidades

- Extracción de campos estructurados de SMS bancarios: el objetivo declarado es identificar importe, origen y cuenta propietaria en formato JSON.
- Generación de texto conversacional básica, según el tag `conversational` del repositorio.
- Clasificación y priorización de mensajes SMS dentro del flujo de revisión de Sebsebe.
- Asistencia opcional en la app: el modelo no sustituye al motor regex de sincronización, sino que actúa como ayuda local cuando el usuario la activa.
- Inferencia on-device: pensado para ejecutarse en móvil o equipos de bajos recursos mediante llama.cpp.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Visión, audio o modo thinking: no documentados.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Extracción de transacciones de SMS bancarios en el dispositivo: el modelo recibe un SMS de Telebirr o de un banco etíope y devuelve un JSON con importe, origen y cuenta, evitando enviar mensajes sensibles a servidores externos.
- Revisión opcional de mensajes en la app Sebsebe: el usuario activa la asistencia y el GGUF Q4_K_M se ejecuta localmente para etiquetar o resumir SMS, mientras la sincronización principal sigue basándose en regex.
- Clasificación de importancia de SMS: el modelo puede priorizar mensajes financieros frente a notificaciones irrelevantes, usando su capacidad conversacional para generar una etiqueta breve.
- Normalización de datos para conciliación: a partir de SMS de distintos bancos, el fine-tune puede generar un esquema JSON homogéneo que alimente un pipeline de contabilidad personal.
- Filtrado heurístico de posibles fraudes o phishing: combinado con reglas regex, el modelo puede señalar mensajes sospechosos antes de que el usuario interactúe con ellos, siempre como capa de asistencia y no como decisión automática.
- Prototipado de asistentes conversacionales en entornos edge: sirve como base para experimentar con despliegue de LLM en móvil mediante llama.cpp u Ollama, dado su tamaño de 105 MB en Q4_K_M.
- Generación de borradores de respuesta o preguntas frecuentes sobre mensajes: el tag conversacional permite construir helpers de tipo "Ask" que respondan preguntas sencillas sobre el contenido de los SMS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un script `smoke_eval.py` que valida que los campos de `eval/expected.json` coincidan (importes, origen y cuenta propietaria), pero no proporciona métricas numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en Q4_K_M (el archivo pesa aproximadamente 105 MB); en f16 el modelo ronda los 270 MB de pesos, más overhead de contexto.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090 o A100 resultan sobredimensionadas. Funciona correctamente en CPU y en Apple Silicon mediante MPS.
- Cabe en GPU consumer y en móvil: sí, en cualquier GPU de consumo e incluso en dispositivos de gama media mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama importando el GGUF, y el stack de transformers con PEFT para cargar el adaptador LoRA durante el desarrollo.
- Latencia y throughput estimados: no disponible; no hay mediciones publicadas. Por el tamaño del modelo se espera una velocidad alta en CPU, pero no se aportan tokens por segundo ni latencias concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| sebsebe-sms-iq | 134,5 M | no disponible (base: 8.192 tokens) | no disponible en HF; base Apache 2.0 | GGUF Q4_K_M, safetensors y LoRA en el repositorio |
| SmolLM2-135M-Instruct | 135 M | 8.192 tokens según su model card | Apache 2.0 | Safetensors y GGUF en HuggingFace |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens según su model card | Apache 2.0 | Safetensors y GGUF en HuggingFace |
| Llama 3.2 1B Instruct | 1.240 M | 128.000 tokens según su model card | Llama 3.2 Community License | Safetensors y GGUF en HuggingFace |

La comparación debe tomarse con cautela: sebsebe-sms-iq es un fine-tune especializado y no un modelo generalista, por lo que su rendimiento en tareas abiertas no es comparable sin benchmarks. Frente al pipeline anterior basado en Llama 3.2 1B, la propuesta actual reduce el tamaño en un orden de magnitud, a costa de una capacidad de razonamiento mucho menor.

## Limitaciones y advertencias

- Modelo muy pequeño (135 M): capacidad de razonamiento y generalización limitada; los errores en la extracción de importes o cuentas pueden tener consecuencias directas en datos financieros.
- Riesgo de alucinación: al generar JSON, puede inventar campos o importes cuando el SMS no sigue los patrones vistos en el conjunto de calibración.
- Dataset de entrenamiento reducido: la propia model card pide ampliar `calib/sms_calib.txt` a 80-100 o más pares antes de un entrenamiento serio, lo que sugiere riesgo de sobreajuste y baja cobertura.
- Licencia no declarada en HuggingFace: aunque el modelo base es Apache 2.0, la ficha del fine-tune no especifica la licencia, por lo que conviene verificar antes de un uso comercial.
- Idiomas y variantes no documentados: los SMS etíopes pueden mezclar amhárico, inglés y transliteraciones, y no se indica qué cubre el entrenamiento.
- Longitud de contexto no confirmada en la ficha: aunque el modelo base declara 8.192 tokens, el fine-tune no documenta su contexto efectivo.
- Privacidad: la model card advierte de no subir SMS reales, teléfonos ni números de cuenta completos al repositorio; el procesamiento debe mantenerse local.
- Madurez baja: cero descargas y cero likes en el momento de la consulta, sin benchmarks públicos ni demos verificables.
- No es un componente de producción autónomo: el propio autor indica que la sincronización sigue siendo regex-first y que el GGUF es una asistencia opcional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bersuad/sebsebe-sms-iq
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Papers, blogs o demos adicionales: no disponible en la información proporcionada.
