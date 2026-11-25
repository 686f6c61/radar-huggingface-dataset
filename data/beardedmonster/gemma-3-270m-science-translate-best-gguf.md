# BeardedMonster/gemma-3-270m-science-translate-best-GGUF

## Resumen

`BeardedMonster/gemma-3-270m-science-translate-best-GGUF` es la cuantización Q8_0 en formato GGUF de un modelo de traducción inglés→lenguas africanas afinado para texto científico. Lo desarrolla BeardedMonster (bajo la marca Aletheia AI) a partir de `google/gemma-3-270m-it`, y está pensado para ejecutarse en CPU de portátil con un único fichero de unos 300 MB. El modelo base tiene 268.098.176 parámetros (270M), arquitectura transformer decoder-only de la familia Gemma 3 y una ventana de contexto que la model card no documenta explícitamente.

El problema que aborda es la escasez de traducción técnica hacia lenguas africanas de bajos recursos: cubre 77 lenguas meta (más 8 en zero-shot no recomendadas) con dirección única inglés→africano, e incorpora datos de ciencia en seis de ellas. La relevancia práctica está en que ofrece una alternativa ligera, ejecutable sin GPU, para digitalizar material científico en yoruba, hausa, suajili, zulú, amhárico y decenas más.

Esta ficha describe específicamente el artefacto GGUF Q8_0 (`gemma-science-translate-final2-step401-Q8_0.gguf`), convertido con llama.cpp sin entrenamiento adicional. La model card reporta los benchmarks del modelo fuente en bf16, no de la cuantización, salvo la pérdida de cuantización medida (-0,02 chrF++).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, fine-tuning de `google/gemma-3-270m-it`) |
| Parámetros totales | 268.098.176 (270M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de uso emplean `-c 2048` |
| Tipos de cuantización | Q8_0 (8 bits); el repo solo publica esta variante |
| Idiomas soportados | Inglés como origen; 77 lenguas africanas como destino (85 nombres aceptados en el prompt, 8 en zero-shot no recomendadas). Escritura latina salvo amhárico y tigriña (etiópico) |
| Licencia | `other`: uso comercial libre con atribución obligatoria ("Translation models by Aletheia AI") y cita del paper; se aplican además los Gemma Terms of Use y la Prohibited Use Policy |
| Formato de pesos | GGUF (fichero `gemma-science-translate-final2-step401-Q8_0.gguf`, ~0,3 GB) |
| Plantilla de chat | Plantilla Gemma embebida en el GGUF |
| Tokens especiales | `<end_of_turn>` id 106 (stop), `<eos>` id 1 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint instruct de 270M de Gemma 3, un transformer decoder-only denso. La model card no detalla la composición del dataset de entrenamiento ni el número de tokens, pero sí indica que 77 de las lenguas destino se entrenaron con RL (las otras 8 se marcan como zero-shot no soportadas) y que seis lenguas cuentan con datos específicos de ciencia. No se documenta el uso de RLHF/DPO clásico ni innovaciones de decodificación; el pipeline es ajuste supervisado más una etapa de RL sobre las lenguas objetivo.

La conversión a GGUF se hizo con llama.cpp sin entrenamiento posterior, y la model card cuantifica el coste de la cuantización en -0,02 chrF++ (intervalo [-0,22, +0,16]) frente al modelo bf16, medido sobre 6 lenguas y 1.170 frases. El formato de prompt es rígido: un único turno de usuario con la plantilla `Translate the text to {Language}:  {English text}` (dos espacios tras los dos puntos, nombre de la lengua en inglés, sin mensaje de sistema), y la respuesta viene prefijada por la etiqueta ISO de tres letras y un espacio (`hau `, `yor `, etc.).

## Capacidades

- Traducción unidireccional inglés→lengua africana, con 77 lenguas destino entrenadas y 8 adicionales en zero-shot no recomendadas.
- Especialización en registro científico y técnico, con datos de ciencia en seis lenguas.
- Ejecución en CPU sin GPU, con un fichero de ~300 MB y plantilla de chat embebida.
- Decodificación greedy determinista (temperatura 0, top_k 1) con parada en `<end_of_turn>`.
- Manejo de una frase o párrafo corto por petición; los documentos largos deben dividirse en frases.
- Prefijado automático de la etiqueta de lengua en la salida, que el consumidor debe eliminar.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (no documentado).

## Casos de uso

- Traducción de resúmenes científicos a lenguas africanas: dado un abstract en inglés, se envía frase a frase con `Translate the text to Swahili:  ...` y se obtiene el texto en suajili; el tamaño de 270M permite procesar lotes grandes en un portátil sin GPU.
- Localización de material sanitario y divulgativo: la ventana de contexto y el formato de una frase por petición encajan con folletos y guiones divididos en oraciones, y el modelo cubre lenguas como hausa, yoruba o amhárico con datos de ciencia.
- Digitalización de documentación agrícola o climática: se trocea el documento en frases, se traduce cada una de forma determinista (temperatura 0) y se recompone, aprovechando que la decodificación greedy evita variación entre ejecuciones.
- Integración en pipelines de publicación con CPU: el GGUF Q8_0 se carga con `llama-cpp-python` o `llama-cli` en servidores sin acelerador, lo que abarata el procesamiento por lotes de corpus.
- Preservación lingüística y educación: traducción de textos escolares a lenguas de bajos recursos como ewe, fon, wolof o bambara, con la etiqueta de lengua como control explícito del destino.
- Prototipado y evaluación de sistemas de traducción: al ser un modelo pequeño y determinista, sirve como línea base reproducible para comparar con modelos mayores en FLORES+ o AfriScience-MT.
- Traducción de interfaces y avisos cortos: frases sueltas (menús, alertas, mensajes de error) con `max_tokens` de 256 y parada en `<end_of_turn>`.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo fuente en bf16, no al GGUF Q8_0, salvo la fila de pérdida por cuantización.

| Benchmark | Métrica | Resultado |
|---|---|---|
| AfriScience-MT test | chrF (frase) | 50,2 |
| AfriScience-MT test | chrF++ (frase) | 47,3 |
| AfriScience-MT test | chrF (paper completo) | 46,1 |
| FLORES+ devtest, subconjunto core (45 lenguas, 48 frases) | chrF++ | 31,83 |
| FLORES+ devtest, subconjunto extended | chrF++ | 34,31 |
| Cuantización Q8_0 vs bf16 (6 lenguas, 1.170 frases) | Δ chrF++ | -0,02 [-0,22, +0,16] |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparativas directas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el fichero Q8_0 ocupa unos 0,3 GB y cabe holgadamente en memoria RAM de cualquier equipo actual.
- GPU recomendadas: no aplica; el modelo está pensado para CPU. Cualquier GPU con más de 1 GB de VRAM podría cargarlo, pero no se documenta soporte acelerado específico.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) por tamaño, aunque el diseño objetivo es CPU.
- Despliegue: llama.cpp (`llama-cli`), `llama-cpp-python` (`create_chat_completion`), y cualquier runtime compatible con GGUF y plantilla Gemma embebida (Ollama, llama.cpp server). No se documenta vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles. Los ejemplos usan 4 hilos (`-t 4`) y contexto 2048, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas destino | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Gemma 3 270M science-translate, Q8_0) | 270M | no disponible (ejemplos a 2048) | 77 entrenadas + 8 zero-shot | Uso comercial con atribución + Gemma Terms | GGUF Q8_0 |
| `google/gemma-3-270m-it` (base) | 270M | no disponible en esta ficha | Multilingüe general | Gemma Terms of Use | safetensors, GGUF |
| NLLB-200 (variantes pequeñas) | 600M–54B | 512 tokens | ~200 | CC-BY-NC 4.0 | safetensors |
| M2M-100 (418M) | 418M | 1024 tokens | 100 | MIT | safetensors |

La comparativa se limita a categorías y datos públicos conocidos; no se dispone de resultados de benchmarks cruzados entre estos modelos en la información proporcionada. Frente a NLLB y M2M-100, este modelo destaca por su licencia comercial permisiva con atribución y por su especialización científica, pero su cobertura (77 lenguas africanas, solo desde inglés) es mucho más estrecha.

## Limitaciones y advertencias

- Dirección única: solo traduce inglés→africano; no soporta traducción inversa ni entre lenguas africanas.
- Ocho lenguas marcadas como zero-shot no recomendadas (`nde`, `fat`, `knc`, `gaa`, `men`, `luy`, `tzm`, `ful`); en `nde` y `knc` el modelo ni siquiera emite la etiqueta de lengua.
- Formato de prompt frágil: exige dos espacios tras los dos puntos, nombre de lengua en inglés, sin mensaje de sistema y sin `<bos>` manual (provoca doble BOS y altera la salida).
- Recomendado una frase o párrafo corto por petición; los documentos largos deben trocearse, lo que puede degradar la coherencia del texto completo.
- Riesgo de alucinación y de deriva terminológica en textos científicos especializados, dado el tamaño de 270M y la limitada cobertura de datos de ciencia (solo seis lenguas).
- Sesgos no documentados: la model card no detalla sesgos de género, dialectales ni de dominio.
- Licencia con obligación de atribución ("Translation models by Aletheia AI") y cita del paper, además de los Gemma Terms of Use y la Prohibited Use Policy; conviene revisar ambas antes de uso comercial.
- No se documentan cifras de latencia ni de rendimiento en producción, ni garantías de calidad fuera del dominio científico.
- El repositorio solo publica Q8_0; no hay variantes de menor precisión para entornos con restricciones extremas de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-270m-science-translate-best-GGUF
- Modelo base (bf16): https://huggingface.co/BeardedMonster/gemma-3-270m-science-translate-best
- Modelo original de Google: https://huggingface.co/google/gemma-3-270m-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
