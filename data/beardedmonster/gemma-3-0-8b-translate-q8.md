# BeardedMonster/gemma-3-0.8b-translate-Q8

## Resumen

`gemma-3-0.8b-translate-Q8` es una cuantización GGUF de 8 bits (Q8_0) del modelo `BeardedMonster/gemma-3-1b-translate-best`, un ajuste fino de Gemma 3 orientado exclusivamente a la traducción de inglés a lenguas africanas. El autor, BeardedMonster (Aletheia AI), parte de la arquitectura Gemma 3 de Google y aplica un ajuste con refuerzo (GRPO) para especializar el modelo en una tarea concreta: traducir texto en inglés a 124 lenguas africanas distintas, identificadas mediante etiquetas de idioma de tres letras.

La característica técnica más destacable es la poda del vocabulario: el tokenizador original de Gemma 3 (262.144 tokens) se reduce a 111.966 tokens eliminando piezas raras, secuencias largas de espacios y tokens HTML no utilizados, junto con sus filas de embedding correspondientes. Esto deja el modelo en 826.880.896 parámetros (0,83B) y reduce el tamaño del repositorio a 2,9 GB. Según el autor, en 16 pruebas comparativas la versión podada produjo exactamente las mismas traducciones que la versión de vocabulario completo.

El modelo es relevante por su enfoque de nicho: cubre 124 lenguas africanas (muchas de ellas de bajos recursos) en un tamaño que cabe en hardware de consumo, con una licencia que permite uso comercial con atribución. No es un modelo de propósito general: solo traduce de inglés a lenguas africanas y no soporta la dirección inversa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), cuantizado a GGUF Q8_0 |
| Parametros totales | 826.880.896 (0,83B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `n_ctx=4096`) |
| Tipos de cuantizacion | Q8_0 (8 bits); solo se distribuye esta variante |
| Idiomas soportados | Inglés (entrada) y 124 lenguas africanas (salida), entre ellas yoruba, hausa, igbo, suajili, zulú, xhosa, amárico, somalí, afrikáans, bambara, wolof, fon, ewe, twi, lingala, kikuyu, luganda, malgache, entre otras |
| Licencia | other (uso comercial libre con atribución a "Translation models by Aletheia AI" y cita del paper; se aplican además los Gemma Terms of Use y la Prohibited Use Policy) |
| Formato de pesos | GGUF (archivo `gemma-3-0.8b-translate-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura decoder-only de Gemma 3 de Google, sobre la que se aplica un ajuste fino supervisado seguido de optimización con GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo. El pipeline declarado es `translation` y la tarea se formula como una conversación de un solo turno con el formato `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos, tal como en el entrenamiento). El modelo responde con una etiqueta de idioma de tres letras como token único (`<yor>`, `<hau>`, etc.) seguida de la traducción.

La innovación principal es la poda del vocabulario: se reduce de 262.144 a 111.966 tokens eliminando piezas no utilizadas durante el entrenamiento y la evaluación, junto con sus embeddings. Se conservan las 125 etiquetas de idioma y todos los tokens especiales (`<bos>`, `<eos>`, `<pad>`, `<unk>`, `<mask>`, `[multimodal]`, `<start_of_turn>`, `<end_of_turn>`, `<start_of_image>`, `<end_of_image>`). Como consecuencia, los identificadores de token ya no coinciden con los de Gemma 3 original (`<yor>` es el id 6, `<hau>` el 7), pero el tokenizador dentro del GGUF es autocontenido. La decodificación recomendada es greedy (`temperature=0`), con `max_new_tokens=256` para frases cortas o párrafos breves.

## Capacidades

- Traducción de inglés a 124 lenguas africanas, con etiqueta de idioma de salida en formato `<xxx>`.
- Conversación de un solo turno con plantilla de chat Gemma 3 incrustada en el GGUF.
- Manejo de frases y párrafos cortos; el autor recomienda dividir documentos largos en frases.
- Etiquetado de idioma de salida mediante token único, lo que facilita el postprocesado.
- No soporta traducción desde lenguas africanas al inglés ni entre lenguas africanas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Localización de contenido hacia lenguas africanas de bajos recursos: el modelo permite traducir documentación, interfaces o material divulgativo a idiomas como yoruba, hausa o bambara, donde los servicios comerciales suelen tener cobertura limitada.
- Traducción en el borde o en entornos sin conectividad: con 0,83B de parámetros en Q8_0 (unos 0,9 GB de pesos), puede ejecutarse en CPU con llama.cpp, lo que lo hace adecuado para despliegues en dispositivos modestos o servidores sin GPU.
- Procesamiento por lotes de corpus de inglés a lenguas africanas: al ser determinista con decodificación greedy, resulta apropiado para pipelines de traducción masiva con resultados reproducibles.
- Atención multilingüe en organizaciones con presencia en África subsahariana: permite generar respuestas o avisos en la lengua local del usuario a partir de un texto fuente en inglés, integrado en un backend con llama-cpp-python.
- Investigación en traducción automática de bajos recursos: sirve como línea base pequeña y reproducible para comparar con modelos mayores en FLORES+, NTREX-128 o MAFAND-MT.
- Filtrado y enriquecimiento de datos multilingües: la etiqueta de idioma de salida permite verificar o anotar la lengua de destino en conjuntos de datos de entrenamiento.
- Generación de subtítulos o resúmenes localizados: dado que acepta párrafos cortos, puede integrarse en un pipeline que traduzca fragmentos de texto previamente segmentados.

## Benchmarks y rendimiento

Resultados publicados por el autor para el modelo fuente en precisión completa (no específicamente para este GGUF Q8_0):

| Benchmark | Métrica | Resultado | Cobertura |
|---|---|---|---|
| FLORES+ devtest | chrF++ | 35,28 | 54 lenguas |
| FLORES+ devtest | spBLEU | 14,03 | 54 lenguas |
| FLORES+ devtest | AfriCOMET | 0,681 | 40 lenguas |
| NTREX-128 | chrF++ (implícito) | 40,05 | 24 lenguas |
| MAFAND-MT | chrF++ (implícito) | 44,21 | 15 lenguas |

No se han publicado resultados de benchmarks específicos para esta cuantización Q8_0 en la información disponible. El autor indica que, en 16 pruebas con 8 lenguas, la versión podada dio exactamente la misma traducción que la versión de vocabulario completo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos Q8_0 (2,9 GB de repositorio incluyen otros archivos; el GGUF ronda los 0,9-1 GB), más la caché KV según el contexto configurado.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema. El autor probó con Metal en Apple Silicon.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-cli`, servidor con endpoint de chat), llama-cpp-python; el GGUF incluye la plantilla de chat de Gemma.
- Latencia y throughput: no disponibles de forma numérica; el autor reporta pruebas con llama.cpp build 11669 en Metal con decodificación greedy y `-ngl 99`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas de destino | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-0.8b-translate-Q8 | 0,83B | no disponible | 124 lenguas africanas | other (comercial con atribución) | GGUF Q8_0 |
| NLLB-200 (Meta) | 0,6B / 1,3B / 3,3B / 54B | 512 tokens | 200 lenguas | CC-BY-NC 4.0 (no comercial) | safetensors |
| M2M-100 (Meta) | 0,4B / 1,2B / 10B | 1024 tokens | 100 lenguas | MIT | safetensors |
| Gemma 3 1B (base) | 1B | 32K tokens | multilingüe general | Gemma Terms of Use | safetensors, GGUF |

No se dispone de comparativas de rendimiento directas entre este modelo y las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo traduce de inglés a lenguas africanas; no soporta la dirección inversa ni traducción entre lenguas africanas.
- La calidad varía según la lengua: los benchmarks cubren 54 lenguas en FLORES+, 40 en AfriCOMET y solo 15 en MAFAND-MT, por lo que muchas de las 124 lenguas declaradas no tienen evaluación publicada.
- Riesgo de alucinación y de traducciones inexactas en lenguas de muy bajos recursos o en textos largos; el autor recomienda segmentar documentos en frases.
- El prompt debe usar el nombre de la lengua (p. ej. "Yoruba"), nunca el código ISO; el formato exacto (dos espacios tras los dos puntos) afecta al resultado.
- La etiqueta de idioma de salida (`<yor>`, etc.) es un token de vocabulario normal, no especial, por lo que debe eliminarse manualmente con una expresión regular.
- Los identificadores de token no coinciden con los de Gemma 3 original; herramientas que asuman el vocabulario estándar de Gemma fallarán.
- Licencia restrictiva en la práctica: requiere atribución a "Translation models by Aletheia AI", cita del paper y cumplimiento de los Gemma Terms of Use y la Prohibited Use Policy de Google.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al derivar de Gemma 3, hereda los sesgos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-0.8b-translate-Q8
- Modelo base (precisión completa): https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best
- Gemma 3 (Google): https://huggingface.co/google/gemma-3-1b-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Paper de referencia: citado en la model card como "accompanying paper"; no se proporciona URL en la información disponible.
