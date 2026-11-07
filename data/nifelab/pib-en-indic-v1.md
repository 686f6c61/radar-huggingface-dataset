# NifeLab/pib-en-indic-v1

## Resumen

pib-en-indic-v1 es un adaptador LoRA de traducción automática inglés-hindi desarrollado por Nife (NifeLab), construido sobre el modelo base ai4bharat/indictrans2-en-indic-dist-200M de AI4Bharat. El adaptador se distribuye como pesos PEFT y está pensado para entornos offline o air-gapped, donde no se permite realizar llamadas a APIs externas durante la inferencia. El modelo base IndicTrans2 es un transformer encoder-decoder especializado en traducción entre inglés y las 22 lenguas programadas de la India; este adaptador concreta esa capacidad para el par inglés-hindi.

La relevancia del modelo reside en su enfoque: un ajuste fino con LoRA sobre un modelo seq2seq compacto (211,7 millones de parámetros totales) orientado a texto formal y administrativo, proveniente de comunicados de PIB (Press Information Bureau) y otros portales gubernamentales públicos, complementados con el corpus Samanantar (CC0). El resultado es un traductor ligero, con licencia MIT, que puede desplegarse íntegramente en infraestructura propia sin dependencias de terceros, algo atractivo para administraciones públicas, organismos regulados o proyectos con requisitos estrictos de soberanía del dato.

El adaptador no publica evaluación formal de benchmarks y su alcance declarado se limita al par inglés-hindi en dominio formal. Para otros pares de lenguas indias, el autor remite a la capacidad del modelo base, no validada por este adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (IndicTrans2 dist-200M) con adaptador LoRA/PEFT |
| Parametros totales | 211.776.512 (adaptador + base según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos safetensors en precisión original; el adaptador LoRA puede combinarse con el base cuantizado, pero no se documenta) |
| Idiomas soportados | Inglés a hindi (validado); el modelo base cubre las 22 lenguas programadas de la India |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), requiere el modelo base ai4bharat/indictrans2-en-indic-dist-200M |

## Arquitectura y entrenamiento

El adaptador se aplica sobre IndicTrans2 dist-200M, un transformer encoder-decoder de tipo seq2seq diseñado específicamente para traducción automática multilingüe entre inglés y las lenguas programadas de la India. La variante "dist" es la versión destilada de 200M de parámetros, pensada para inferencia eficiente. Sobre esta base, Nife aplica un ajuste fino con Parameter-Efficient Fine-Tuning (LoRA), lo que mantiene congelados los pesos del modelo base y entrena únicamente matrices de baja dimensión, reduciendo drásticamente el coste computacional y el tamaño del artefacto publicado (0,8 GB en el repositorio).

Los datos de entrenamiento combinan releases públicas del PIB y otros sitios web gubernamentales públicos, junto con el corpus Samanantar de AI4Bharat (licencia CC0). El autor declara explícitamente que solo se emplearon fuentes públicas, sin datos propietarios ni confidenciales. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros de LoRA (rango, alpha, capas objetivo) ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se describe ninguna innovación técnica adicional más allá del propio ajuste LoRA. El uso recomendado incluye el preprocesado y postprocesado con IndicTransToolkit de AI4Bharat, tal como se indica para los modelos base.

## Capacidades

- Traducción automática de inglés a hindi, con especialización en registro formal y administrativo (comunicados oficiales, textos institucionales).
- Funcionamiento completamente offline y en entornos air-gapped, sin llamadas a APIs externas en tiempo de inferencia.
- Carga como adaptador PEFT sobre el modelo base mediante la librería `peft` y `transformers`.
- Capacidad teórica multilingüe heredada del modelo base (22 lenguas programadas de la India), aunque el adaptador solo ha sido validado para inglés-hindi.
- Integración con el ecosistema Hugging Face (`AutoModelForSeq2SeqLM`, `AutoTokenizer`, `PeftModel`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio; es un modelo puramente de traducción texto a texto.

## Casos de uso

- Traducción de comunicados oficiales: el adaptador está entrenado sobre releases del PIB y portales gubernamentales, por lo que encaja en la traducción de notas de prensa, boletines y comunicados institucionales del inglés al hindi con terminología administrativa.
- Despliegue en administraciones públicas con soberanía del dato: al ejecutarse íntegramente on-premise y sin APIs externas, permite traducir documentación interna en entornos air-gapped donde no se permite la salida de datos a terceros.
- Localización de documentación técnica y normativa: útil para traducir manuales, guías y textos regulatorios de registro formal, siempre con revisión humana para contenido publicado.
- Traducción de contenido web institucional: integrable en pipelines de publicación para generar versiones en hindi de páginas y portales gubernamentales a partir del contenido en inglés.
- Pre-traducción asistida para traductores humanos: al ser un modelo ligero (211,7M de parámetros), puede generar borradores rápidos que un traductor profesional revisa y pule, reduciendo el tiempo de ciclo en flujos de localización.
- Procesamiento por lotes en infraestructura modesta: su tamaño reducido permite ejecutar traducciones masivas en CPU o GPU de gama baja, adecuado para digitalizar y traducir archivos documentales históricos o acumulados.
- Filtrado y enriquecimiento de corpus: uso como traductor de referencia en la construcción de datasets paralelos inglés-hindi para otros proyectos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que no existe evaluación formal publicada para este adaptador y recomienda evaluar sobre datos propios antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en precisión FP32 ocupa aproximadamente 0,85 GB (211,7M de parámetros × 4 bytes); en FP16, alrededor de 0,42 GB. El adaptador LoRA añade un coste marginal adicional.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problema, aunque el modelo está claramente sobredimensionado para hardware de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` + `peft` (vía `AutoModelForSeq2SeqLM` y `PeftModel`), con preprocesado/postprocesado mediante IndicTransToolkit. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que es un modelo seq2seq con código personalizado (`trust_remote_code=True`).
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera latencia baja en GPU y throughput alto en procesamiento por lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NifeLab/pib-en-indic-v1 | 211,7M (base + LoRA) | No disponible | Inglés-hindi (validado) | MIT | Hugging Face |
| ai4bharat/indictrans2-en-indic-dist-200M | ~200M | No disponible | Inglés a 22 lenguas indias | No disponible en la información proporcionada | Hugging Face |
| NifeLab/pib-indic-en-v1 | No disponible | No disponible | Hindi-inglés (adaptador espejo) | No disponible en la información proporcionada | Hugging Face |

La comparación directa con alternativas de traducción de mayor tamaño (NLLB-200, MADLAD-400, modelos comerciales) no está disponible en la información proporcionada. El competidor más cercano es el propio modelo base sin adaptador, que cubre más pares de lenguas pero no está especializado en el dominio administrativo inglés-hindi.

## Limitaciones y advertencias

- Sesgos heredados del modelo base IndicTrans2 y del corpus de entrenamiento (textos gubernamentales y Samanantar), con posible sobrerrepresentación de registro formal y de variedades estándar del hindi.
- Riesgo de alucinación y de traducciones incorrectas en dominios alejados del texto administrativo (técnico especializado, coloquial, literario).
- Alcance validado limitado al par inglés-hindi; no se ha verificado el rendimiento en otros pares de lenguas indias pese a la cobertura teórica del modelo base.
- No apto para traducción de alto riesgo (legal, médico, seguridad) sin revisión humana explícita; el autor lo desaconseja.
- Licencia MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base ai4bharat/indictrans2-en-indic-dist-200M, cuya licencia no se detalla en la información disponible.
- Requiere `trust_remote_code=True` y código personalizado del modelo base, lo que añade superficie de riesgo en la cadena de suministro y complica el despliegue en entornos con políticas estrictas de dependencias.
- Sin evaluación formal publicada: no hay métricas (BLEU, chrF, COMET) que permitan estimar la calidad frente al modelo base u otras alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NifeLab/pib-en-indic-v1
- Adaptador espejo hindi-inglés: https://huggingface.co/NifeLab/pib-indic-en-v1
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M
- Repositorio del modelo base: https://github.com/AI4Bharat/IndicTrans2
- Página del proyecto: https://nife.io/open-source
- Paper de IndicTrans2: https://openreview.net/forum?id=vfT4YuzAYA
