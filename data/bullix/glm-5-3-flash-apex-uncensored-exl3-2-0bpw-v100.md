# bullix/GLM-5.3-Flash-Apex-Uncensored-EXL3-2.0bpw-v100

## Resumen

GLM-5.3-Flash-Apex-Uncensored-EXL3-2.0bpw-v100 es una cuantización EXL3 de 2,00 bits por peso de un fine-tune "abliterated" (sin censura) del modelo GLM-5.3-Flash de Zhipu AI. Lo publica el usuario bullix en Hugging Face y está empaquetado específicamente para GPUs con arquitectura SM70 (Tesla V100), usando el motor exllamav3 y el codebook `mcg`. El modelo base del que parte es `pqhaz/apex-flash-1-heretic-v2-FP8`, un fine-tune heretic/abliterated en block-FP8 derivado a su vez de `zai-org/GLM-5.3-Flash`.

El pack reduce un modelo de 306 GiB en FP8 a 92,6 GiB, manteniendo los expertos enrutados (36 288 matrices) a exactamente 2,00 bpw con K=2, mientras deja todas las capas lineales no-expertas en FP16 porque el kernel EXL3 para SM70 rechaza cuantizar no-expertos y solo lee el codebook `mcg`. Cuenta con 49 673 447 262 parámetros totales (arquitectura MoE) y soporte multimodal imagen-texto.

Su relevancia es de nicho: permite ejecutar un GLM-5.3-Flash de ~50 000 millones de parámetros en hardware V100 (sin BF16 nativo, sin soporte moderno de cuantización), a costa de una pérdida de calidad medible (perplejidad 5,064 frente a 3,784 del padre FP8, KL de 0,578). No es un reemplazo directo del modelo original en tareas sensibles a la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-5.3, con capas KDA y sparse MLA; torre de visión) |
| Parametros totales | 49 673 447 262 (~49,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el indexador sparse-MLA usa `index_topk` 2048) |
| Tipos de cuantizacion | EXL3 2,00 bpw (codebook `mcg`, K=2) en expertos enrutados; FP16 en no-expertos; BF16 en torre de visión |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, librería exllamav3) |

## Arquitectura y entrenamiento

El modelo subyacente es GLM-5.3-Flash, un transformer de mezcla de expertos (MoE) con 42 capas MoE, 36 288 matrices de expertos enrutados, capas de atención KDA (34 capas) y sparse MLA (11 capas `deepseek_sparse_attention`), además de un módulo MTP (multi-token prediction) y una torre de visión multimodal. El fine-tune `apex-flash-1-heretic-v2-FP8` es una variante heretic/abliterated que elimina los mecanismos de rechazo del modelo original. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica de este pack es la cuantización EXL3 adaptada a SM70: los expertos enrutados se cuantizan a 2,00 bpw con K=2 usando el codebook `mcg` (el único aceptado por el kernel V100), los expertos MTP a 4 bpw, y el resto de lineales se dejan deliberadamente en FP16. La calibración emplea 128 filas × 8192 tokens (1 048 576 tokens) del corpus interno de exllamav3, con filas largas para capturar estadísticas representativas del indexador sparse-MLA y las capas KDA. Se generó con exllamav3 v1.6.6 sin parches, en una RTX PRO 6000 Blackwell en 6 h 21 min. El bitrate medio del directorio completo es de ~2,34 bits/parámetro, consecuencia de la exigencia de FP16 del motor.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y matemáticas (heredadas de GLM-5.3-Flash).
- Generación de código.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`, torre de visión en BF16).
- Modo "uncensored"/abliterated: sin mecanismos de rechazo en las respuestas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Predicción multi-token (MTP) integrada en la arquitectura.

## Casos de uso

- Investigación sobre alineación y seguridad: el carácter abliterated permite estudiar el comportamiento del modelo sin filtros de rechazo, útil para analizar sesgos y mecanismos de negativa en modelos MoE de gran tamaño.
- Despliegue en infraestructura V100 existente: organizaciones con clústeres de Tesla V100 (sin BF16 nativo) pueden servir un modelo de ~50 000 millones de parámetros gracias al empaquetado SM70 específico, algo imposible con el FP8 original de 306 GiB.
- Experimentación con cuantización extrema: sirve como caso de estudio de los límites de EXL3 a 2 bpw, con métricas de KL y perplejidad documentadas frente al padre.
- Generación de texto creativo sin restricciones de contenido: para aplicaciones donde se requiere ausencia de filtros (ficción, guiones, contenido para adultos con las salvaguardas legales oportunas).
- Procesamiento de documentos con imágenes: la torre de visión permite tareas imagen-texto en entornos con GPUs V100.
- Prototipado de asistentes conversacionales de larga duración: el contexto largo implícito en el diseño (filas de calibración de 8192 tokens) favorece conversaciones extensas, aunque la longitud exacta de contexto no está documentada.
- Evaluación comparativa de motores de inferencia: útil para comparar exllamav3 frente a otras soluciones en hardware legacy.

## Benchmarks y rendimiento

Datos medidos por el autor el 2026-11-16 sobre este pack, en una RTX PRO 6000 (SM120) con exllamav3 v1.6.6.

Perplejidad (50 filas × 2048, wikitext-2):

| Modelo | PPL |
|---|---|
| Padre FP8 | 3,784 |
| Este pack | 5,064 |

Divergencia KL frente a su propio padre (100 filas × 2048 = 204 800 posiciones):

| Métrica | Valor |
|---|---|
| KL(A‖B), padre → pack | 0,578 |
| KL(B‖A), pack → padre | 0,407 |
| KL por token, mediana / p90 | 0,160 / 1,554 |
| Acuerdo top-1 | 77,2 % |
| Etiqueta en top-1, padre → pack | 68,2 % → 61,6 % |
| Etiqueta en top-5, padre → pack | 88,0 % → 84,4 % |

KL según confianza del padre:

| Top-prob del padre | Cuota de tokens | KL medio |
|---|---:|---:|
| [0,95, 1,00] | 28,6 % | 0,058 |
| [0,75, 0,95) | 18,6 % | 0,489 |
| [0,50, 0,75) | 20,2 % | 0,825 |
| [0,25, 0,50) | 23,2 % | 0,945 |
| [0,00, 0,25) | 9,4 % | 0,904 |
| Global | 100 % | 0,578 |

Error relativo de Frobenius por módulo frente al padre:

| Módulo | rfn_err | SQNR |
|---|---:|---:|
| Capas densas 0–2 | 0,000000 | 68–74 dB |
| Capa 3 (primera MoE) | 0,119 | 40,8 dB |
| Capas 4–16 | 0,141 → 0,384 | 24,8 → 9,2 dB |
| Capas 17–33 | 1,03 → 1,86 | 9,0 → 5,3 dB |
| Capas 34–44 | 0,96 → 0,79 | 6,2 → 4,9 dB |
| Norma final | 0,577 | 5,2 dB |

El autor señala que el salto de error se produce en la capa 17 (deriva acumulada por los expertos a 2 bits) y que KL 0,578 es alto: el pack no es un sustituto directo del padre FP8 en tareas sensibles a la calidad. El punto de comparación más cercano publicado es `philbert440/GLM-5.3-Flash-EXL3` con KL 0,132 sobre su propio padre.

## Requisitos de hardware

- VRAM estimada para inferencia: ~92,6 GiB de pesos (el repo ocupa 99,5 GB); se recomienda al menos 96 GB de VRAM para cargar el modelo completo.
- GPU objetivo: Tesla V100 (SM70), para la que está empaquetado el pack.
- GPU usada para la medición: 1× RTX PRO 6000 Blackwell (SM120).
- Cabe en GPU consumer: no; excede la VRAM de cualquier GPU consumer actual (máximo 32 GB en RTX 5090).
- Opciones de despliegue: exllamav3 v1.6.6 (motor obligatorio, con codebook `mcg`); no compatible con vLLM, llama.cpp ni Ollama por el formato EXL3.
- Latencia y throughput: no disponibles.
- Advertencia de hardware: 90 tensores FP16 son en realidad BF16 y toda la torre de visión es BF16; la V100 no tiene ruta hardware para BF16, por lo que el motor debe convertir al cargar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KL vs padre) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (EXL3 2,0 bpw, V100) | ~49,7 B (MoE) | no disponible | 0,578 | MIT | Hugging Face |
| `pqhaz/apex-flash-1-heretic-v2-FP8` (padre) | ~49,7 B (MoE) | no disponible | referencia (PPL 3,784) | no disponible | Hugging Face |
| `philbert440/GLM-5.3-Flash-EXL3` | GLM-5.3-Flash | no disponible | 0,132 | no disponible | Hugging Face |
| `bullix/GLM-5.3-Uncensored-EXL3-2.0bpw` (`mul1`) | GLM-5.3 | no disponible | no disponible | MIT | Hugging Face |

El pack `mul1` del mismo autor usa un codebook distinto (para tarjetas modernas) y parte de otra revisión del modelo base, por lo que sus cifras no son directamente comparables.

## Limitaciones y advertencias

- Pérdida de calidad significativa: PPL 5,064 frente a 3,784 del padre FP8 y KL de 0,578, con caída de acuerdo top-1 al 77,2 %; no apto para tareas sensibles a la fidelidad.
- Deriva acumulada a partir de la capa 17: el error por módulo supera 1,0 y no se recupera, afectando a las capas profundas del modelo.
- Modelo abliterated: elimina los rechazos de seguridad, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado; requiere salvaguardas externas en producción.
- Riesgo de alucinación: no documentado específicamente, pero la cuantización agresiva a 2 bpw puede incrementarlo en las capas afectadas.
- Idiomas soportados: no disponibles en la información proporcionada.
- Longitud de contexto exacta: no disponible.
- Compatibilidad restringida: solo funciona con exllamav3 y codebook `mcg`; no carga en otros motores.
- Requisito de conversión BF16→FP16 en V100: la torre de visión y 90 tensores requieren conversión al cargar, con posible impacto en precisión y rendimiento.
- Licencia MIT: permite uso comercial, pero el modelo base y el fine-tune intermedio pueden tener condiciones adicionales no documentadas en esta ficha.
- Adopción mínima: 2 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/bullix/GLM-5.3-Flash-Apex-Uncensored-EXL3-2.0bpw-v100
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Fine-tune padre: https://huggingface.co/pqhaz/apex-flash-1-heretic-v2-FP8
- Pack hermano (base, `mcg`): https://huggingface.co/bullix/GLM-5.3-Uncensored-EXL3-2.0bpw-v100
- Pack hermano (`mul1`, tarjetas modernas): https://huggingface.co/bullix/GLM-5.3-Uncensored-EXL3-2.0bpw
- Comparativa EXL3 de referencia: https://huggingface.co/philbert440/GLM-5.3-Flash-EXL3
- Motor exllamav3: no disponible en la información proporcionada
