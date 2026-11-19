# AfriSpeech/gemma-3-1b-translate-best

## Resumen

`gemma-3-1b-translate-best` es un modelo de traducción automática de inglés a 125 lenguas africanas, desarrollado por AfriSpeech (con atribución requerida a "Translation models by Aletheia AI"). Se construye sobre `google/gemma-3-1b-it` mediante un proceso de ajuste supervisado (SFT) seguido de aprendizaje por refuerzo con GRPO, y está especializado exclusivamente en la dirección inglés → lengua africana.

El modelo resuelve un problema concreto: la escasez de sistemas de traducción de calidad para lenguas africanas de bajos recursos, muchas de ellas sin cobertura en modelos comerciales. Con aproximadamente 1.000 millones de parámetros (999.885.952 reales según safetensors), ofrece un punto de equilibrio entre calidad y requisitos de hardware que permite desplegarlo en GPU de consumo.

Su relevancia radica en la amplitud de cobertura (125 etiquetas de idioma, de las cuales 105 disponen de datos de SFT) y en el uso de RL con GRPO para refinar la calidad de traducción. La arquitectura subyacente es la de Gemma 3 en su variante de texto de 1B, con licencia derivada de los términos de Gemma 3 más una cláusula de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text, derivado de google/gemma-3-1b-it) |
| Parametros totales | 999.885.952 (~1,0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de vLLM usa max_model_len=4096) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16 en los ejemplos) |
| Idiomas soportados | 125 etiquetas: ingles como origen; 105 lenguas africanas con datos de SFT (yoruba, hausa, igbo, pidgin, suajili, zulu, xhosa, amharico, somali, africaans, etc.) |
| Licencia | other: uso comercial libre con atribucion obligatoria ("Translation models by Aletheia AI") y sujeta a los Gemma Terms of Use y Prohibited Use Policy |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de la familia Gemma 3 en su variante de texto de aproximadamente 1B de parametros. Sobre esa base se aplica un ajuste supervisado (SFT) orientado a la tarea de traduccion ingles → lengua africana, seguido de una fase de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) para optimizar la calidad de las traducciones generadas.

El formato de interaccion es especifico: una unica vuelta de usuario con la plantilla `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos) y una respuesta que comienza con una etiqueta de idioma de tres letras (`<yor>`, `<hau>`, etc.) seguida de la traduccion. Las etiquetas son entradas de vocabulario ordinarias (no especiales), por lo que `skip_special_tokens=True` no las elimina y deben retirarse explicitamente. El modelo solo traduce desde ingles y esta pensado para una frase o parrafo corto por peticion; los documentos largos deben dividirse en frases. La decodificacion recomendada es greedy (`temperature=0`), con `max_new_tokens=256` para frases cortas (768 en los benchmarks) y, opcionalmente en vLLM, `frequency_penalty=0.1` como proteccion contra bucles de repeticion en entradas largas.

## Capacidades

- Traduccion unidireccional de ingles a 125 etiquetas de lengua africana; 105 tienen datos de SFT y 20 carecen de ellos (la model card indica que no pueden traducirse de forma util).
- Generacion de texto condicionada por nombre de idioma en el prompt, con etiqueta de idioma como marcador de salida.
- Cobertura de lenguas de bajos recursos: yoruba, hausa, igbo, pidgin, suajili, zulu, xhosa, amharico, somali, africaans, entre muchas otras.
- Manejo de frases y parrafos cortos por peticion; requiere segmentacion manual para documentos largos.
- Despliegue compatible con transformers (>= 4.56), vLLM y servidor compatible con OpenAI (`/v1/chat/completions`).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Localizacion de interfaces y contenido web: traduccion de cadenas cortas de UI y textos de producto del ingles a lenguas africanas, procesando cada cadena como una peticion independiente con decodificacion greedy para resultados deterministas.
- Atencion al cliente multilingue: traduccion de respuestas de soporte del ingles a la lengua del usuario (por ejemplo, suajili o hausa) antes del envio, con el modelo desplegado en vLLM para procesar lotes de frases en una sola llamada.
- Traduccion de documentacion tecnica y guias: division del documento en frases, traduccion por lotes con `max_new_tokens=256` y reensamblado posterior, aprovechando la cobertura de 105 lenguas con datos de SFT.
- Generacion de subtitulos y transcripciones: traduccion de lineas de subtitulos del ingles a lenguas como yoruba, zulu o amharico, manteniendo el modelo en bfloat16 en una GPU de consumo.
- Investigacion en NLP de bajos recursos: uso como linea base reproducible para evaluar traduccion ingles → lengua africana con FLORES+, NTREX-128 y MAFAND-MT, dado que la model card publica cifras de referencia.
- Prototipado rapido en entornos con hardware limitado: al ser un modelo de ~1B de parametros, permite iterar localmente en una RTX 4090 o similar antes de escalar a variantes mayores.
- Servicio de traduccion bajo demanda con API compatible con OpenAI: despliegue con `vllm serve` y envio de peticiones con `temperature=0` desde aplicaciones existentes sin cambios de integracion.

## Benchmarks y rendimiento

Resultados publicados en la model card (FLORES+ devtest, 54 lenguas, greedy):

| Benchmark | Metrica | Resultado | Cobertura |
|---|---|---|---|
| FLORES+ devtest | chrF++ | 35,28 | 54 lenguas |
| FLORES+ devtest | spBLEU | 14,03 | 54 lenguas |
| FLORES+ devtest | AfriCOMET | 0,681 | 40 lenguas |
| NTREX-128 | chrF++ | 40,05 | 24 lenguas |
| MAFAND-MT | chrF++ | 44,21 | 15 lenguas |

Resultados por lengua en FLORES+ (chrF++, greedy) segun la tabla de la model card: hausa 50,16; igbo 41,92; yoruba 31,97. No se han publicado en la informacion disponible resultados de benchmarks comparativos frente a otros modelos de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bfloat16 para los ~1,0B de parametros, mas el espacio del contexto y de la cache KV; el repo ocupa 4,0 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bfloat16; A100/H100 para despliegues de alto throughput con vLLM.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con suficiente VRAM.
- Opciones de despliegue: transformers (>= 4.56), vLLM (`vllm serve ... --max-model-len 4096`) y servidor compatible con OpenAI. No se documentan en la informacion disponible opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables de traduccion ingles → lenguas africanas. La comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| gemma-3-1b-translate-best | ~1,0B | no disponible | other (atribucion + Gemma Terms) | Traduccion EN → 125 lenguas africanas, SFT + GRPO |
| google/gemma-3-1b-it (base) | ~1,0B | no disponible | Gemma Terms of Use | Modelo generalista, sin especializacion en traduccion |
| Alternativas de traduccion para lenguas africanas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Direccion unica: solo traduce de ingles a lenguas africanas; no soporta el sentido inverso ni otros pares de idiomas.
- 20 de las 125 etiquetas carecen de datos de SFT; la model card advierte que su salida no es utilizable.
- Requiere usar el nombre del idioma en el prompt (por ejemplo, "Yoruba"), nunca el codigo ISO; el marcador de salida (`<yor>`) debe eliminarse manualmente.
- Entradas largas: una frase o parrafo corto por peticion; los documentos deben dividirse en frases. Riesgo de bucles de repeticion en entradas largas, mitigable con `frequency_penalty=0.1` en vLLM.
- Riesgo de alucinacion y de traducciones inexactas en lenguas con pocos datos, coherente con las cifras de chrF++ publicadas (por ejemplo, yoruba 31,97 frente a hausa 50,16).
- Sesgos: no se documentan en la informacion disponible sesgos especificos; al derivar de Gemma 3, pueden heredarse sesgos del modelo base.
- Licencia: uso comercial permitido con atribucion obligatoria ("Translation models by Aletheia AI") y citacion del paper asociado; ademas se aplican los Gemma Terms of Use y la Prohibited Use Policy de Google.
- El modelo no registra descargas ni likes en Hugging Face en la informacion disponible, lo que limita la evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AfriSpeech/gemma-3-1b-translate-best
- Licencia (enlace de la model card): https://huggingface.co/BeardedMonster/gemma-3-1b-translate-best/blob/main/LICENSE.md
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
