# eulogik/polywhisper

## Resumen

PolyWhisper es una familia de expertos LoRA específicos por idioma construidos sobre un encoder Whisper-Base congelado, desarrollado por el usuario eulogik. Su objetivo principal es corregir el problema de "confusión de escritura" (script confusion) que presenta Whisper-Base al transcribir idiomas indios: el modelo base emite texto en alfabeto urdu-árabe para telugu, bengalí y maratí, con tasas de acierto de escritura del 0–0,5%. PolyWhisper añade adaptadores LoRA de rango 16 en las proyecciones K/V de la atención cruzada del decoder, uno por idioma, sobre el mismo encoder congelado, logrando restaurar la escritura correcta (77–100% según idioma) y reducir el error de caracteres (CER) entre 10 y 22 puntos.

El modelo cubre cinco idiomas indios (hindi, tamil, telugu, bengalí y maratí) más un router específico para hinglish (mezcla hindi-inglés). El backbone es Whisper-Base, que tiene aproximadamente 74 millones de parámetros en total, y cada adaptador LoRA añade unos 0,8 millones de parámetros. El router hinglish es un MLP de 33.000 parámetros que selecciona por token entre los expertos inglés e hindi. El modelo se distribuye bajo licencia MIT y está pensado para despliegue en el borde (edge ASR), dado su reducido tamaño y bajo coste de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-Base (encoder y decoder congelados) + adaptadores LoRA rank-16 en cross-attention K/V del decoder; router MLP de 33K parámetros para hinglish |
| Parametros totales | Whisper-Base: ~74M; cada adaptador LoRA: ~0,8M; router: 33K (el total depende del número de expertos cargados) |
| Parametros activos | No aplica (no es un MoE clásico; se carga un experto a la vez o el router selecciona por token) |
| Longitud de contexto | No disponible (Whisper procesa ventanas de audio de 30 segundos, pero no se especifica explícitamente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, hi, ta, te, bn, mr |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

PolyWhisper parte de openai/whisper-base y congela tanto el encoder como el decoder base. Sobre el decoder, entrena adaptadores LoRA de rango 16 en las proyecciones de clave y valor de la atención cruzada (cross-attention K/V projections). Cada idioma tiene su propio adaptador, de modo que el encoder compartido extrae características acústicas genéricas y el adaptador especializa la decodificación hacia la escritura y fonología de ese idioma. Para el caso hinglish, se añade un router MLP de 33.000 parámetros que opera sobre los estados ocultos del decoder y decide por token si se usa el experto inglés o el hindi.

El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 1e-4, utilizando datos de IndicVoices-ST (aproximadamente 19.000–20.000 muestras, con acceso restringido) y el conjunto de test de FLEURS. Todo el proceso se ejecutó en un Mac Mini M4 con 16 GB de RAM usando Apple MPS y precisión fp16, con un tiempo de entrenamiento de unas 3 horas por idioma. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado clásico.

## Capacidades

- Transcripción automática de voz (ASR) en cinco idiomas indios (hindi, tamil, telugu, bengalí, maratí) con salida en escritura correcta (devanagari, tamil, telugu, bengalí y devanagari para maratí).
- Soporte de código mezclado hinglish (hindi-inglés) mediante un router por token que alterna entre expertos.
- Corrección de la confusión de escritura que sufre Whisper-Base: restaura la escritura correcta en idiomas donde el modelo base emitía texto en urdu-árabe.
- Inferencia eficiente para despliegue en el borde: el backbone es Whisper-Base (74M) y los adaptadores son muy pequeños (0,8M cada uno).
- Compatible con el ecosistema Hugging Face Transformers y PEFT (PeftModel).
- No incluye capacidades de tool calling, agentes, visión ni modo de razonamiento explícito; es un modelo puramente ASR.

## Casos de uso

- Transcripción de llamadas de atención al cliente en hindi o hinglish: el router permite manejar conversaciones donde se alterna entre inglés e hindi sin perder precisión en la escritura devanagari.
- Subtitulado automático de vídeos en idiomas indios: los expertos específicos producen texto en la escritura correcta, lo que evita el problema de salida en alfabeto árabe que tiene Whisper-Base.
- Asistentes de voz para aplicaciones de salud o educación en zonas rurales de India: el bajo coste de inferencia (modelo pequeño) permite ejecutarlo en dispositivos con recursos limitados.
- Archivado y búsqueda de contenido audiovisual en telugu, bengalí o maratí: la corrección de escritura permite indexar correctamente los textos transcritos.
- Evaluación de calidad de ASR en entornos de investigación: los archivos de resultados por muestra (`eval_*_fleurs.json`) permiten reescalar y analizar errores.
- Prototipado rápido de sistemas ASR multilingüe para el sur de Asia: al ser código abierto y con licencia MIT, puede integrarse en pipelines existentes sin restricciones comerciales.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index:

| Sistema | Dataset | WER (%) | CER (%) |
|---|---|---|---|
| polywhisper-hinglish-router | PolyWhisper Hinglish Test (3.129 utterances) | 58,8 | 57,9 |
| polywhisper-indic-experts (hi) | FLEURS (hi) | 38,5 | 14,4 |
| polywhisper-indic-experts (ta) | FLEURS (ta) | 73,9 | 25,6 |
| polywhisper-indic-experts (te) | FLEURS (te) | 82,7 | 32,7 |
| polywhisper-indic-experts (bn) | FLEURS (bn) | 84,9 | 54,3 |
| polywhisper-indic-experts (mr) | FLEURS (mr) | 65,0 | 22,9 |

La model card también reporta comparaciones con Whisper-Base vanilla en el test hinglish (WER 66,6% vs 58,8%) y en tasas de coincidencia de escritura (script-match): por ejemplo, para telugu vanilla logra 0,0% de escritura correcta mientras que el experto alcanza 92,6%. En hindi, el experto sube de 6,2% a 99,8% de coincidencia de escritura.

## Requisitos de hardware

- El modelo base es Whisper-Base (~74M parámetros), por lo que la inferencia es viable en CPU y GPU de gama baja. No se especifican requisitos exactos de VRAM.
- El entrenamiento se realizó en un Mac Mini M4 con 16 GB de RAM usando MPS, lo que sugiere que la inferencia puede ejecutarse en equipos con 8 GB de RAM o menos.
- Al ser un modelo pequeño, cabe en GPUs consumer como RTX 3060, RTX 4060 o incluso en Apple Silicon con Metal.
- Opciones de despliegue: al ser un modelo PyTorch con PEFT, puede servirse con vLLM, Hugging Face TGI o mediante llama.cpp si se convierte a GGUF (no se proporciona conversión oficial). También puede ejecutarse directamente con Transformers.
- Latencia y throughput: no disponibles en la documentación. Dado el tamaño, se espera una latencia baja en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyWhisper (este) | ~74M + LoRA (~0,8M por experto) | No disponible | en, hi, ta, te, bn, mr | MIT | Hugging Face |
| Whisper-Base (vanilla) | 74M | 30 s de audio | 99 idiomas | MIT | Hugging Face |
| IndicWav2Vec (referencia, no comparado) | ~300M | No disponible | 9 idiomas indios | No disponible | No disponible |

No se dispone de benchmarks comparativos con otros modelos específicos para idiomas indios en la información proporcionada. La comparación principal es con Whisper-Base vanilla, que PolyWhisper supera en hinglish (WER 58,8% vs 66,6%) y en corrección de escritura para telugu, bengalí y maratí.

## Limitaciones y advertencias

- El WER residual en idiomas como telugu (82,7%) o bengalí (84,9%) sigue siendo alto; el autor lo atribuye al límite de capacidad del decoder de 39M parámetros.
- No se han evaluado sesgos de género, acento o ruido; los resultados provienen de conjuntos de test específicos (FLEURS e IndicVoices-ST) y pueden no generalizar a otros dominios.
- Riesgo de alucinaciones: aunque se reducen frente a Whisper-Base (13 frente a 279 en el test hinglish), no se eliminan por completo.
- El modelo solo cubre cinco idiomas indios más inglés; no es multilingüe general.
- La documentación no especifica el tamaño exacto del contexto de audio ni el manejo de fragmentos largos.
- Los pesos se distribuyen como archivos `.pt` separados por experto; no hay un único checkpoint unificado ni conversión a GGUF o safetensors.
- El entrenamiento se realizó con datos de IndicVoices-ST (gated) y FLEURS; la disponibilidad de datos adicionales puede afectar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/polywhisper
- Autor: https://huggingface.co/eulogik
- Dataset IndicVoices-ST: no se proporciona enlace directo en la model card (mencionado como gated)
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs (referenciado en el model-index)
