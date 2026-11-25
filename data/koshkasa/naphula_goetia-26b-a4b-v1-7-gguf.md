# Koshkasa/Naphula_Goetia-26B-A4B-v1.7-GGUF

## Resumen

Naphula_Goetia-26B-A4B-v1.7-GGUF es la versión cuantizada en formato GGUF del modelo Naphula/Goetia-26B-A4B-v1.7, publicada por el usuario Koshkasa. El modelo base es un merge de tipo Mixture of Experts (MoE) construido con mergekit y orientado a escritura creativa, narrativa de ficción, roleplay y generación de tramas, según los tags declarados por el autor. Esta versión GGUF está pensada para ejecutarse con llama.cpp y herramientas compatibles, lo que facilita su despliegue en entornos locales.

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamaño nominal (26B según el nombre, con aproximadamente 4B de parámetros activos por token, a juzgar por la nomenclatura A4B) en hardware de consumo mediante cuantización. El repositorio incluye cuantizaciones estándar e imatrix generadas a partir de un dataset combinado de bartowski, lo que suele mejorar la calidad de los cuantizados de baja precisión.

No obstante, la información pública disponible es limitada: no se detallan la arquitectura interna exacta, los datos de entrenamiento ni resultados de benchmarks. La model card se limita a indicar el proceso de cuantización y a recomendar presets de SillyTavern para aplicaciones creativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (inferido del nombre A4B; detalles no disponibles) |
| Parametros totales | 26B nominales en el nombre del modelo; el dato de safetensors del repo GGUF indica 14.224.235 (no aclarado por el autor) |
| Parametros activos | Aproximadamente 4B (inferido de la nomenclatura A4B; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estándar e imatrix (generado sobre pesos q8_0 con -c 512 -b 512 -ub 512) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un merge construido con mergekit (tags mergekit, mergekit-exp, multifusion, nearswap), lo que indica una combinación de pesos de varios modelos mediante técnicas de fusión. La nomenclatura "26B-A4B" sugiere una arquitectura Mixture of Experts con aproximadamente 26B de parámetros totales y unos 4B activos por token, aunque el autor no proporciona detalles técnicos confirmados sobre la arquitectura interna, el número de expertos ni la estrategia de enrutamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente documenta el proceso de cuantización: se generó una imatrix con el dataset combinado de bartowski sobre pesos q8_0 usando llama.cpp (commit 1692f9e50), con parámetros de contexto y batch de 512. El repositorio ocupa 103 GB e incluye varias cuantizaciones.

## Capacidades

- Generación de texto creativo en inglés, con énfasis en ficción, terror, suspense, romance y ciencia ficción.
- Escritura narrativa vívida ("vivid prosing", "vivid writing") y generación de tramas y subtramas.
- Roleplay y conversación multi-turno, con soporte para continuar escenas.
- Capacidades conversacionales generales ("all genres", "conversational").
- Estilo de escritura oscuro ("dark writing") y uso de lenguaje soez ("swearing") según los tags.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al inglés según el campo language.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar borradores de relatos de terror, suspense o ciencia ficción, así como continuar escenas existentes, gracias a su orientación declarada hacia la narrativa y el "scene continue".
- Roleplay conversacional: adecuado para personajes interactivos en aplicaciones tipo SillyTavern, con presets recomendados por el autor para mejorar la experiencia creativa.
- Generación de tramas y subtramas: útil para guionistas y escritores que necesitan estructuras narrativas o ideas argumentales en géneros como el terror o el romance.
- Prototipado de videojuegos narrativos: puede alimentar diálogos de personajes no jugadores (NPC) en juegos de rol o aventuras conversacionales en inglés.
- Herramientas de escritura creativa para autores: integrable en editores o asistentes que sugieran continuaciones, descripciones vívidas o giros argumentales.
- Experimentación local con modelos MoE cuantizados: sirve como banco de pruebas para desarrolladores que quieran evaluar el rendimiento de un MoE de 26B nominales con ~4B activos en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; dependerá de la cuantización elegida. Para un modelo de 26B nominales, las cuantizaciones Q4_K_M suelen requerir del orden de 15-17 GB, y las Q8_0 en torno a 27-28 GB, aunque estas cifras son estimaciones generales y no datos confirmados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, una RTX 4090 (24 GB) podría ejecutar cuantizaciones de 4 bits; configuraciones de mayor precisión requerirían A100 o H100.
- Compatibilidad con GPU de consumo: probable en cuantizaciones bajas (Q4 y similares) en GPUs con 16-24 GB de VRAM, sujeto a verificación empírica.
- Opciones de despliegue: llama.cpp y frontends compatibles con GGUF (por ejemplo, Ollama o LM Studio, aunque no se mencionan explícitamente en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Solo soporta inglés según el campo language; no se garantiza un rendimiento adecuado en castellano.
- No se documentan sesgos conocidos, pero al ser un merge de modelos de escritura creativa puede heredar sesgos de sus componentes.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- La licencia apache-2.0 permite uso comercial, pero el modelo base es un merge cuyos componentes originales no se detallan, por lo que conviene verificar las licencias de los modelos fusionados.
- La información técnica es escasa: no hay confirmación oficial de la arquitectura MoE, el contexto máximo ni los parámetros activos.
- El repositorio ocupa 103 GB, lo que requiere espacio de almacenamiento considerable.
- El autor recomienda presets de SillyTavern para aplicaciones creativas, lo que sugiere que su uso óptimo está orientado a ese ecosistema.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Koshkasa/Naphula_Goetia-26B-A4B-v1.7-GGUF
- Modelo base: https://huggingface.co/Naphula/Goetia-26B-A4B-v1.7
- Dataset de imatrix: https://huggingface.co/datasets/OccultAI/illuminati_imatrix_v1
- Dataset combinado de bartowski: https://gist.github.com/bartowski1182/82ae9b520227f57d79ba04add13d0d0d
- Presets de SillyTavern recomendados: https://huggingface.co/nohurry/sillytavern
