# Muhammadaziz3101/gemma4-e4b-uzbek-translate-lora

## Resumen

Gemma 4 E4B Uzbek translation LoRA es un adaptador PEFT (LoRA) sobre el modelo base google/gemma-4-E4B-it, desarrollado por el usuario Muhammadaziz3101. Su proposito es especializar el modelo base en traduccion unidireccional de uzbek a ingles, un par de idiomas con escasa representacion en los corpus de entrenamiento de la mayoria de modelos generalistas. El adaptador se entreno sobre 9.893 pares de traduccion procedentes del dataset Muhammadaziz3101/translate, con el texto en uzbek extraido de Digital.uz y la parte en ingles generada por traduccion automatica.

El adaptador es de tipo LoRA con rango 16, alpha 32 y dropout 0.05, aplicado a las capas de atencion y MLP del modelo de lenguaje, entrenado con QLoRA en 4 bits NF4 y computo en bf16. El modelo base pertenece a la familia Gemma 4 de Google en su variante E4B (orientada a eficiencia), aunque las especificaciones completas del modelo base no se detallan en la informacion disponible.

La relevancia de esta ficha es doble: por un lado, documenta un caso practico de ajuste fino de bajo coste (una sola GPU L4, 619 pasos, una epoca) para un par de idiomas de bajos recursos; por otro, evidencia un comportamiento problematico bien documentado por el propio autor: el adaptador mejora marginalmente la direccion UZ->EN pero degrada severamente la direccion EN->UZ, lo que lo hace inadecuado para traduccion bidireccional en su estado actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base google/gemma-4-E4B-it) |
| Parametros totales | 34.881.536 (solo adaptador LoRA) |
| Parametros activos | no disponible (no es MoE; el modelo base podria serlo, pero no se especifica) |
| Longitud de contexto | no disponible (depende del modelo base; entrenamiento con max 768 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 para entrenamiento; adaptador en safetensors (f16) y GGUF LoRA f16 para llama.cpp |
| Idiomas soportados | uz, en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (gemma4-e4b-uz-en-10k-lora-f16.gguf) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estandar de LoRA sobre un transformer decoder-only. Se aplican matrices de baja dimensionalidad (rango 16, alpha 32, dropout 0.05) a las proyecciones de atencion y de las capas MLP del modelo de lenguaje. El entrenamiento uso QLoRA con cuantizacion 4-bit NF4 del modelo base, computo en bf16, perdida calculada solo sobre los tokens de completacion (completion-only loss) y una unica epoca sobre 9.893 pares UZ->EN, lo que supone 619 pasos con batch efectivo de 16. Se empleo un learning rate de 2e-4 con scheduler coseno, longitud maxima de 768 tokens y una GPU AWS L4. La perdida de evaluacion paso de 1,80 a 0,535.

El dataset de entrenamiento combina texto fuente en uzbek de Digital.uz con traducciones al ingles generadas automaticamente, lo que introduce ruido y sesgos propios de la traduccion automatica en la senal de supervision. No se menciona el uso de RLHF ni DPO. El prompt de inferencia recomendado es `Translate from Uzbek to English:\n\n<text>` aplicado con la plantilla de chat de Gemma 4 y el modo thinking desactivado.

## Capacidades

- Traduccion unidireccional de uzbek a ingles, con una mejora marginal respecto al modelo base.
- Generacion de texto en ingles e interpretacion de instrucciones en el marco de la plantilla de chat de Gemma 4.
- Compatibilidad con llama.cpp mediante el fichero LoRA en formato GGUF (`--lora`).
- Compatibilidad con el ecosistema PEFT/Hugging Face para cargar el adaptador sobre el modelo base.
- No soporta traduccion EN->UZ de forma funcional: el autor indica que el adaptador responde en ingles en esa direccion.
- No se documentan capacidades de tool calling, agentes, vision ni audio especificas del adaptador.

## Casos de uso

- Traduccion de documentacion tecnica UZ->EN en pipelines internos: el adaptador puede aplicarse sobre el modelo base para convertir textos en uzbek a ingles antes de un procesamiento posterior (indexacion, busqueda o analisis), siempre que se valide la calidad con una muestra representativa.
- Preprocesamiento de corpus uzbecos para investigacion: util para normalizar contenido de fuentes como Digital.uz a ingles antes de alimentar modelos de analisis que solo operan bien en ingles, aceptando el ruido de la traduccion automatica.
- Prototipado de sistemas de traduccion asistida en entornos con recursos limitados: el adaptador cabe en una GPU L4 durante el entrenamiento y puede desplegarse con llama.cpp en hardware modesto, lo que facilita experimentos de bajo coste.
- Evaluacion comparativa de estrategias de ajuste fino para idiomas de bajos recursos: sirve como referencia metodologica (QLoRA, r16, una epoca) para estudiar el olvido catastrofico en direcciones no entrenadas.
- Traduccion de resenas o formularios de usuario en uzbek a ingles para analitica de negocio, con revision humana obligatoria dada la degradacion documentada en la direccion inversa.
- Base para una futura etapa bidireccional: el autor anuncia una segunda fase; este adaptador puede servir como punto de partida o como ablation en ese desarrollo.

## Benchmarks y rendimiento

Resultados publicados por el autor en FLEURS (345 frases, decodificacion greedy, GGUF base Q4_K_XL + LoRA):

| Modelo | UZ->EN chrF | UZ->EN BLEU | EN->UZ chrF | EN->UZ BLEU |
|---|---|---|---|---|
| Gemma 4 E4B (base) | 59,0 | 31,2 | 55,5 | 17,0 |
| Este adaptador | 60,2 | 31,9 | 25,3 | 4,3 |

La mejora en UZ->EN es de +1,2 chrF y +0,7 BLEU. La degradacion en EN->UZ es de -30,2 chrF y -12,7 BLEU, consistente con el olvido de la direccion no entrenada.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB en el repositorio; el modelo base debe cargarse aparte.
- Entrenamiento realizado en una unica GPU AWS L4, lo que indica que el ajuste fino es viable en GPUs de gama media con 24 GB de VRAM aproximadamente.
- Inferencia: la VRAM depende del modelo base y de su cuantizacion; no se dispone de cifras concretas del modelo base en la informacion proporcionada.
- Despliegue compatible con llama.cpp mediante el fichero GGUF LoRA y la opcion `--lora`.
- Despliegue compatible con el ecosistema PEFT (transformers) cargando el adaptador sobre google/gemma-4-E4B-it.
- No se documentan latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Gemma 4 E4B UZ->EN LoRA) | 34,9 M (adaptador) | no disponible | LoRA UZ->EN | no disponible | Hugging Face |
| Gemma 4 E4B (base) | no disponible | no disponible | Modelo generalista | no disponible | Hugging Face (google) |
| Alternativas especializadas en traduccion UZ-EN | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especializados en traduccion uzbeko-ingles en la documentacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo se entreno en la direccion UZ->EN; en EN->UZ responde en ingles y pierde mas de 30 puntos de chrF respecto al modelo base.
- El corpus de entrenamiento usa traducciones automaticas al ingles como referencia, lo que introduce errores sistematicos en la senal de supervision.
- La mejora en la direccion entrenada es marginal (+1,2 chrF), por lo que el coste-beneficio frente al modelo base es limitado.
- Riesgo de alucinacion y de traducciones literales o inconsistentes en textos largos, dado el limite de 768 tokens durante el entrenamiento.
- No se especifica la licencia, lo que impide evaluar su uso comercial con seguridad juridica.
- El modelo base google/gemma-4-E4B-it tiene sus propias condiciones de uso que deben respetarse.
- El adaptador tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion externa de la comunidad.
- No se documentan sesgos especificos, aunque al derivarse de un corpus de una unica fuente (Digital.uz) es probable que herede su sesgo tematico y estilistico.

## Enlaces

- Hugging Face: https://huggingface.co/Muhammadaziz3101/gemma4-e4b-uzbek-translate-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Muhammadaziz3101/translate
