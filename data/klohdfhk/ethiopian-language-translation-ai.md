# klohdfhk/ethiopian-language-translation-ai

## Resumen

El modelo `klohdfhk/ethiopian-language-translation-ai` es un adaptador LoRA de traducción bidireccional amárico–inglés construido sobre el checkpoint multilingüe `facebook/m2m100_418M`. Lo publica el usuario klohdfhk en HuggingFace como artefacto experimental de portafolio, no como traductor de producción. El problema que aborda es la baja calidad de la traducción zero-shot del modelo base en un par de lenguas de bajos recursos como el amárico (`am`) y el inglés (`en`), y lo hace mediante un ajuste fino ligero con PEFT que añade un delta de pesos sobre el transformer encoder-decoder original.

La relevancia es doble: por un lado, demuestra que un ajuste LoRA de rango 8 sobre 1.407 pares alineados puede mejorar de forma medible la dirección amárico→inglés en corpus FLEURS (chrF++ de 27,98 a 33,91, con intervalo bootstrap del 95 % de [+4,84, +7,10]); por otro, documenta con rigor estadístico que la dirección inglés→amárico no muestra una mejora estable (BLEU 0,47, chrF++ 7,29, intervalo que incluye el cero). El modelo base M2M100 tiene 418 millones de parámetros y arquitectura transformer encoder-decoder con atención multi-cabeza estándar; el adaptador no modifica esa arquitectura, solo inyecta matrices de bajo rango en las capas.

El contexto de esta ficha es el de un artefacto de investigación reproducible: el autor publica semilla fija, revisión exacta del checkpoint base, procedimiento de deduplicación de FLEURS y umbrales de release. No hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K) porque la tarea es traducción, y la evaluación se limita a SacreBLEU y chrF++ sobre el split de test de FLEURS con una sola referencia por frase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M100) con adaptador LoRA inyectado |
| Parametros totales | 418M en el modelo base; el adaptador LoRA añade un delta de bajo rango (r=8, alpha=16) no cuantificado en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base M2M100 usa posiciones sinusoidales; la generación se limita a `max_new_tokens=128`) |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos PEFT en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Amárico (`am`) e inglés (`en`); el modelo base soporta 100 idiomas, pero el adaptador se entrena solo para este par |
| Licencia | CC BY 4.0 para el adaptador; el checkpoint base `facebook/m2m100_418M` declara MIT |
| Formato de pesos | Safetensors (adaptador PEFT); el modelo base no se incluye en el repo |

## Arquitectura y entrenamiento

La arquitectura subyacente es M2M100, un transformer encoder-decoder multilingüe con 418 millones de parámetros y atención multi-cabeza estándar (no se trata de un modelo MoE, SSM ni híbrido). Sobre él se aplica un adaptador PEFT LoRA con rango 8 y alpha 16, entrenado con PyTorch en CPU y semilla aleatoria fija. El entrenamiento cubre ambas direcciones de traducción con 1.407 pares alineados extraídos de FLEURS (`am_et` y `en_us`, revisión `70bb2e84b976b7e960aa89f1c648e09c59f894dd`). Se solicitaron dos épocas, pero el autor solo reclama el checkpoint de la época 1 (validación n=124) porque la ejecución en CPU no dejó un informe final limpio de la época 2.

No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset más allá de FLEURS, ni si hubo RLHF o DPO (no aplica en un adaptador de traducción supervisada). La innovación técnica destacable no está en la arquitectura sino en el protocolo de evaluación: selección de época sobre un split de validación separado, uso de bootstrap pareado por sentence-ID para estimar intervalos de confianza del 95 %, y una puerta de release macro que exige mejora en validación, cota inferior bootstrap positiva y no más de 2 puntos de caída en ninguna dirección. La inferencia usa decodificación con `num_beams=2` y un tope de 128 tokens generados.

## Capacidades

- Traducción bidireccional amárico→inglés e inglés→amárico sobre texto de dominio general y frases cortas de estilo leído.
- Generación de texto condicionada a la lengua origen mediante `src_lang` y `forced_bos_token_id` del tokenizador M2M100.
- Integración con el ecosistema HuggingFace `transformers` + `peft` mediante `PeftModel.from_pretrained`.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo de traducción puro.
- No soporta agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par `am`/`en`; el modelo base soporta 100 idiomas, pero el adaptador no se ha entrenado para otros pares y no hay evidencia de que los preserve.
- No se documentan capacidades de code-switching, dialectos ni terminología especializada.

## Casos de uso

- Investigación en traducción automática de bajos recursos: sirve como línea base reproducible para comparar técnicas de adaptación (LoRA, full fine-tuning, destilación) sobre el par amárico–inglés usando FLEURS como benchmark común, gracias a que el autor publica revisión exacta del checkpoint base y semilla fija.
- Prototipado de asistentes de traducción con revisión humana: se puede desplegar en un pipeline interno donde un revisor nativo valide cada salida, aprovechando la mejora medida en amárico→inglés (chrF++ +5,93 puntos sobre zero-shot) para reducir el esfuerzo de postedición.
- Generación de subtítulos y transcripciones bilingües: al estar entrenado sobre transcripciones de habla leída de FLEURS, encaja en la traducción de texto derivado de ASR de frases cortas, no de conversación espontánea.
- Educación y materiales didácticos: traducción de frases de ejemplo y ejercicios entre amárico e inglés en plataformas de aprendizaje, siempre con revisión docente dado el bajo BLEU absoluto en inglés→amárico.
- Evaluación comparativa de adaptadores PEFT: el modelo sirve como caso de estudio metodológico por su protocolo de bootstrap pareado y su puerta de release, útil para equipos que diseñen sus propios criterios de aceptación.
- Filtrado y triaje de contenido multilingüe: traducción aproximada de amárico a inglés para que un clasificador o revisor angloparlante priorice casos, nunca como decisión final por el riesgo de alucinación y la baja calidad en la dirección inversa.
- No se recomienda para atención al cliente automatizada, traducción jurada, documentación médica, legal o financiera, ni para ningún flujo sin revisión humana.

## Benchmarks y rendimiento

Evaluación del autor sobre el split de test held-out de FLEURS (296 pares alineados, una referencia por frase, SacreBLEU / chrF++ en escala 0–100, decodificación con 2 beams y tope de 128 tokens):

| Enfoque | Inglés→Amárico BLEU / chrF++ | Amárico→Inglés BLEU / chrF++ |
|---|---:|---:|
| M2M100 zero-shot | 0,32 / 6,71 | 6,11 / 27,98 |
| M2M100 + adaptador LoRA | 0,47 / 7,29 | 10,67 / 33,91 |

Ganancia media de chrF++ sobre zero-shot: +3,26 puntos; IC bootstrap pareado del 95 %: [2,57, 3,87]. IC pareados por dirección para el cambio en chrF++: inglés→amárico [-0,19, +1,28] (incluye el cero, no establece mejora); amárico→inglés [+4,84, +7,10]. El autor advierte que estas métricas de solapamiento automático no son juicios humanos de significado, fluidez o seguridad, y que el BLEU absoluto en inglés→amárico es muy bajo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base M2M100 de 418M en fp32 ocupa aproximadamente 1,7 GB de pesos; en fp16 alrededor de 0,85 GB. El adaptador LoRA añade un delta pequeño no cuantificado en la información disponible. La VRAM total con activaciones y decodificación con 2 beams se sitúa típicamente por debajo de 4 GB en fp16, aunque el autor no publica mediciones.
- GPU recomendadas: cualquier GPU con al menos 4–6 GB de VRAM es suficiente para fp16; el autor entrenó y evaluó en CPU, lo que indica que el modelo es ejecutable sin GPU.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y superiores; también en CPUs modernas con PyTorch.
- Opciones de despliegue: HuggingFace `transformers` + `peft` (documentado por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador PEFT sobre un encoder-decoder, el soporte en esos runtimes no está garantizado.
- Latencia y throughput: no disponibles; el autor no publica mediciones y la ejecución de referencia es en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `klohdfhk/ethiopian-language-translation-ai` | 418M (base) + LoRA | No disponible | am, en | CC BY 4.0 (adaptador) / MIT (base) | Adaptador LoRA sobre M2M100 |
| `facebook/m2m100_418M` | 418M | No disponible | 100 | MIT | Transformer encoder-decoder multilingüe |
| `facebook/nllb-200-distilled-600M` | 600M | No disponible | 200 | CC BY-NC 4.0 (no comercial) | Transformer encoder-decoder multilingüe |
| `Helsinki-NLP/opus-mt-am-en` | No disponible | No disponible | am, en | No disponible | Transformer de traducción por par |

La comparación cuantitativa directa no está disponible en la información proporcionada: el autor solo compara contra el zero-shot del mismo M2M100. NLLB-200 ofrece cobertura multilingüe mucho mayor pero con licencia no comercial en su variante destilada, lo que limita su uso en producción. Los modelos OPUS-MT por par son alternativas ligeras, pero no se dispone de métricas comparables en esta ficha.

## Limitaciones y advertencias

- Calidad absoluta muy baja en inglés→amárico (BLEU 0,47, chrF++ 7,29) y sin mejora estadísticamente estable sobre zero-shot; el intervalo bootstrap incluye el cero.
- Entrenado con solo 1.407 pares y evaluado con 296 pares y una única referencia por frase; muestra pequeña y sesgada hacia habla leída de FLEURS.
- No representa conversación espontánea, variación dialectal, code-switching, eventos actuales ni terminología especializada.
- No ha pasado revisión humana de calidad ni evaluación externa independiente; las métricas son de solapamiento automático y no miden significado, fluidez ni seguridad.
- Riesgo de alucinación en frases largas o fuera de dominio, agravado por el tope de 128 tokens y la decodificación con 2 beams.
- Sesgos potenciales heredados de FLEURS y del corpus original de M2M100, cuyo estado de derechos no está completamente enumerado en la model card upstream (limitación de procedencia reconocida por el autor).
- Licencia del adaptador CC BY 4.0 con obligación de atribución a FLEURS y a Google Research; el checkpoint base es MIT, pero el autor advierte que la procedencia de los corpus originales de M2M100 no está plenamente documentada.
- No usar como única fuente en decisiones médicas, legales, financieras, de emergencia o de cualquier otra índole consecuente.
- El checkpoint de la época 2 no existe; solo se publica el de la época 1, seleccionado sobre validación (n=124).
- El autor lo describe explícitamente como artefacto experimental de portafolio, no como traductor de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/klohdfhk/ethiopian-language-translation-ai
- Modelo base M2M100: https://huggingface.co/facebook/m2m100_418M
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Revisión de FLEURS usada: https://huggingface.co/datasets/google/fleurs/tree/70bb2e84b976b7e960aa89f1c648e09c59f894dd
- Paper FLEURS (Conneau et al., 2022): https://arxiv.org/abs/2205.12446
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
