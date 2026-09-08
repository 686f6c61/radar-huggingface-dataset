# Nanite-Labs/nanites-smoky-speech-earl

## Resumen

El modelo `nanites-smoky-speech-earl` es un sistema de síntesis de voz (text-to-speech) desarrollado por Nanite-Labs que genera audio en inglés con el dialecto histórico del Smoky Mountain English, hablado en las montañas de Carolina del Norte y Tennessee en la década de 1930. Se basa en el modelo CosyVoice2-0.5B de FunAudioLLM, sobre el que se ha realizado un ajuste fino (SFT) por género. Este repositorio contiene la voz masculina, con nombre de persona "Earl".

El objetivo principal es crear una voz anonimizada que represente el dialecto regional sin replicar a ningún hablante individual de las grabaciones originales de 1939 realizadas por Joseph Sargent Hall. Para ello, se utilizó un único identificador de hablante (speaker ID) calculado como el promedio de los embeddings campplus de 15 hablantes, de modo que la síntesis no expone la identidad de ninguna persona.

La relevancia actual radica en que ofrece una alternativa moderna y con licencia Apache-2.0 a sistemas como XTTS, que se considera abandonado. El modelo es ligero (0.5B de parámetros) y está pensado para aplicaciones de preservación lingüística, educación y contenido histórico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CosyVoice2 (LLM + flow matching + vocoder HiFT) |
| Parámetros totales | 0.5B (modelo base CosyVoice2-0.5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica a TTS) |
| Tipos de cuantización | No se especifican; los pesos se distribuyen en safetensors y ONNX |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se construye sobre CosyVoice2-0.5B, una arquitectura de síntesis de voz que combina un modelo de lenguaje (LLM) para generar tokens de voz, un modelo de flow matching para el espectrograma y un vocoder HiFT para la forma de onda. El ajuste fino se realizó únicamente sobre el componente LLM (`--model llm`), manteniendo congelados los parámetros de flow y HiFT. El entrenamiento se llevó a cabo en una sola GPU de 8 GB con precisión bf16, usando el optimizador AdamW8bit de bitsandbytes, gradient checkpointing y una tasa de aprendizaje constante de 1e-5. Los datos de entrenamiento provienen de grabaciones de dominio público de 1939 (USC), preprocesadas con eliminación de ruido, recorte por VAD y filtrado por SNR. Se agruparon por género: 284 clips (~42.9 minutos) para la voz masculina y 210 clips (~31.9 minutos) para la femenina. Se asignó un único speaker ID por género (`male_pool` / `female_pool`), que se obtiene promediando los embeddings campplus de los 15 hablantes del pool. Esta técnica de anonimización es la innovación destacable: la generación en modo SFT no requiere ningún clip de referencia y no replica a ningún hablante individual.

Se descartó XTTS-v2 por su mantenimiento inactivo y su licencia CPML, optando por la línea CosyVoice2, que es Apache-2.0 y respaldada por el equipo de FunAudioLLM.

## Capacidades

- Generación de texto a voz en inglés con dialecto Smoky Mountain English de los años 1930.
- Voz anonimizada mediante un speaker ID pooled; no replica a ningún hablante individual.
- Modo de síntesis SFT (`inference_sft`) sin necesidad de clip de referencia.
- No soporta tool calling, visión, ni razonamiento; es un modelo de TTS puro.
- Soporte multilingüe limitado a inglés (en).
- Compatible con el framework CosyVoice2 y con formatos safetensors y ONNX.

## Casos de uso

- Preservación del patrimonio lingüístico: el modelo puede generar audios con el dialecto de los Apalaches de los años 30 para archivos digitales, sin exponer la identidad de los hablantes originales.
- Material educativo: producción de recursos didácticos sobre dialectos históricos, con pronunciación auténtica y un WER bajo (1.5% en la voz masculina).
- Documentales y podcasts: narración de piezas ambientadas en la época, con voz de época y anonimato garantizado.
- Investigación lingüística: creación de muestras de audio para estudios fonéticos y comparativos del inglés de Smoky Mountain.
- Audiolibros de textos históricos: lectura de diarios, cartas o crónicas de 1939 con la voz adecuada al contexto.
- Entretenimiento inmersivo: juegos o experiencias interactivas ambientadas en Carolina del Norte o Tennessee de los años 30.
- Anonimización de voz en proyectos que requieren una voz sintética regional sin asociar a una persona real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo de text-to-speech. Los datos de evaluación proporcionados por el autor son los siguientes:

| Métrica | Valor |
|---|---|
| WER (voz masculina, persona "Earl") | 1.5% (68 palabras) |
| WER (voz femenina, persona "Ethel") | 4.1% (74 palabras) |
| Objetivo de WER | <12% |
| Similitud coseno máxima del embedding pooled al miembro más cercano (masculino) | 0.888 |
| Similitud coseno máxima del embedding pooled al miembro más cercano (femenino) | 0.909 |

## Requisitos de hardware

- Entrenamiento: se utilizó una única GPU con 8 GB de VRAM (no se especifica el modelo exacto). Se aplicaron técnicas de guardado de memoria (AdamW8bit, parámetros no-LLM congelados, gradient checkpointing, bf16).
- Inferencia: no se proporcionan cifras oficiales de VRAM ni latencia. Dado el tamaño del modelo base (0.5B) y el peso del repositorio (3.8 GB), es plausible que funcione en GPUs consumer de 8 GB, pero no hay datos confirmados.
- Opciones de despliegue: el modelo está pensado para usarse con el framework CosyVoice2 (FunAudioLLM). Los pesos están disponibles en safetensors y ONNX, lo que permitiría su integración con ONNX Runtime.
- No se dispone de datos de throughput ni latencia.

## Comparativa con modelos similares

El modelo se puede comparar con XTTS-v2 y con el CosyVoice2-0.5B base, aunque no se dispone de benchmarks comparativos en la información proporcionada.

| Modelo | Base | Licencia | Enfoque de voz | Dialecto específico |
|---|---|---|---|---|
| nanites-smoky-speech-earl | CosyVoice2-0.5B | Apache-2.0 | Speaker ID pooled (anonimizado) | Smoky Mountain English (1939) |
| XTTS-v2 | Coqui | CPML | Clonación de voz por referencia | No específico |
| CosyVoice2-0.5B | FunAudioLLM | Apache-2.0 | Multi-speaker | No específico |

Nota: XTTS-v2 fue descartado por los autores por mantenimiento inactivo y licencia CPML. No se dispone de datos de rendimiento comparables para estos modelos en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés (en); no se ha evaluado en otros idiomas.
- El dialecto es específico del Smoky Mountain English de los años 30; puede no generalizar a otros dialectos o épocas.
- La anonimización no es perfecta: la similitud coseno máxima del embedding pooled a un miembro del pool es 0.888 (masculino) y 0.909 (femenino), lo que podría permitir cierta identificación estadística.
- El modo zero-shot con referencia pooled produce audio confuso; solo se soporta el modo SFT.
- No se han publicado benchmarks estándar ni pruebas de robustez en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y poco probado.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar la procedencia de los datos de entrenamiento y del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nanite-Labs/nanites-smoky-speech-earl
- Modelo base: https://huggingface.co/FunAudioLLM/CosyVoice2-0.5B
- Página de Nanite-Labs en HuggingFace: https://huggingface.co/Nanite-Labs
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos) en la búsqueda web.
