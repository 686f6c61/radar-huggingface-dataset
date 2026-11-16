# BeardedMonster/gemma-3-270m-science-translate-best-GGUF

## Resumen

`BeardedMonster/gemma-3-270m-science-translate-best-GGUF` es una build en formato GGUF (cuantización Q8_0) de un modelo de traducción de 270 millones de parámetros derivado de Gemma 3. El modelo traduce exclusivamente de inglés a 77 lenguas africanas, con un enfoque declarado en vocabulario y registro científico. Lo publica el usuario BeardedMonster como release de investigación, sin licencia definitiva elegida todavía (`tbd-owner-to-choose`).

La relevancia del modelo está en su tamaño: con 268.098.176 parámetros y un fichero de unos 300 MB, está diseñado para ejecutarse en CPU de portátil mediante llama.cpp, lo que lo hace viable en entornos sin GPU. Cubre un conjunto de lenguas africanas muy poco representadas en modelos abiertos (yoruba, hausa, igbo, suajili, zulú, amhárico, wolof, bambara, entre otras), e incluye una plantilla de chat Gemma embebida en el propio GGUF.

La ficha describe la versión cuantizada Q8_0, que según el autor pierde -0,02 chrF++ respecto al modelo bf16 de referencia. Se trata de un modelo de una sola dirección (inglés a lengua africana), sin capacidades generales de conversación, razonamiento o código: es una herramienta de traducción especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder-only); arquitectura GGUF `gemma3` |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (esta build); el repo base contiene safetensors en bf16 |
| Idiomas soportados | Inglés de origen; 77 lenguas africanas de destino (85 nombres aceptados, 8 sin entrenamiento RL) |
| Licencia | `other` / `tbd-owner-to-choose` (licencia no elegida); sujeto a Gemma Terms of Use |
| Formato de pesos | GGUF (fichero `gemma-science-translate-final2-step401-Q8_0.gguf`, 299.748.320 bytes, `general.file_type` 7) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 3, un transformer decoder-only, en su variante de 270M parámetros. Sobre esa base se aplicó un proceso de ajuste con RL cuyo run final se identifica como `final2`, paso 401, según la model card. La señal de recompensa emplea NLLB-200-3.3B y los datos de entrenamiento provienen del conjunto AfriScience-MT, orientado a contenido científico. El autor no detalla el volumen de tokens ni la composición exacta del dataset.

La build GGUF se convirtió con llama.cpp a partir del `model.safetensors` original (sha256 `1bd2e310f146e233aac0c0be339329321f30823dfe05d95c39f561cfbd6589c5`) sin entrenamiento adicional. El fichero incluye metadatos relevantes: `add_bos_token` activado, bos id 2, eos id 1, `<end_of_turn>` con id 106 y la plantilla de chat Gemma embebida. El prompt de entrenamiento es un único turno de usuario con la forma `Translate the text to {NombreDelIdioma}:  {texto}`, con dos espacios tras los dos puntos y el nombre del idioma en lugar del código ISO. El modelo responde con la etiqueta de tres letras seguida de la traducción (por ejemplo `yor `).

## Capacidades

- Traducción de inglés a 77 lenguas africanas, en una única dirección; no traduce hacia inglés ni entre lenguas africanas.
- Registro orientado a contenido científico y técnico (AfriScience-MT), aunque no se documenta una evaluación específica por dominio.
- Salida con etiqueta de idioma de tres letras antepuesta, que debe eliminarse en posprocesado.
- Plantilla de chat Gemma embebida, compatible con el endpoint `/v1/chat/completions` de llama.cpp y con `llama-cpp-python`.
- Ejecución en CPU sin GPU, con decodificación greedy recomendada (`temperature 0`, `top_k 1`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- No es un modelo conversacional general: no se debe usar con mensajes de sistema ni en diálogos multi-turno.

## Casos de uso

- Traducción de material sanitario o divulgativo a lenguas africanas en entornos con hardware limitado: el modelo cabe en unos 300 MB y corre en CPU, por lo que puede desplegarse en portátiles o servidores modestos de ONG y centros de salud.
- Localización de contenidos científicos y educativos: el ajuste sobre AfriScience-MT lo hace adecuado para textos de divulgación, guías y material formativo en registro técnico.
- Servicio HTTP ligero de traducción: con `llama-server` y varias ranuras (`-np 8`), se puede exponer un endpoint compatible con la API de chat de OpenAI para integrarlo en aplicaciones existentes.
- Procesamiento por lotes en pipelines de datos: al ser determinista con decodificación greedy y tener un coste de cómputo bajo, encaja en tareas de traducción masiva de frases o párrafos cortos.
- Prototipado e investigación en traducción automática de bajos recursos: sirve como línea base reproducible para comparar con NLLB o modelos mayores en las mismas 77 lenguas.
- Aplicaciones offline en campo: al no requerir GPU ni conexión, puede empaquetarse en dispositivos locales para traducción de documentos in situ.
- Evaluación de cobertura lingüística: permite comprobar rápidamente la calidad en lenguas concretas antes de invertir en modelos de mayor tamaño.

## Benchmarks y rendimiento

La model card solo documenta la pérdida de calidad por cuantización: -0,02 chrF++ (intervalo [-0,22, +0,16]) frente al modelo bf16, medida sobre 6 lenguas y 1.170 frases. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU por lengua) en la información disponible.

| Metrica | Resultado |
|---|---|
| chrF++ Q8_0 vs bf16 | -0,02 [-0,22, +0,16] (6 lenguas, 1.170 frases) |
| BLEU / chrF++ por lengua | no disponible |
| Benchmarks generales (MMLU, etc.) | no aplica / no disponible |

## Requisitos de hardware

- VRAM: no requiere GPU; en Q8_0 el fichero ocupa unos 300 MB y la inferencia en CPU necesita del orden de 1 GB de RAM incluyendo contexto y overhead.
- GPU recomendadas: no son necesarias. Cualquier GPU con más de 1 GB de VRAM puede alojarlo, pero el caso de uso declarado es CPU.
- GPU de consumo: cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.), aunque no aporta ventaja frente a CPU para este tamaño.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), `llama-cpp-python` y cualquier runtime compatible con GGUF. El autor lo verificó con Homebrew llama.cpp 0.7.0 (build 11669).
- Configuración sugerida por el autor: `-t 4`, `-c 2048`, `-n 256` para frases (unas 1.024 para párrafos), `--temp 0 --top-k 1`, parada en `<end_of_turn>`.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo y la decodificación greedy, se espera una latencia baja en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destino | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-270m-science-translate-best-GGUF (Q8_0) | 268M | 32.768 | 77 lenguas africanas (solo EN→XX) | no elegida; Gemma Terms | GGUF |
| NLLB-200-3.3B (referencia usada como reward) | 3.300M | 512 | 200 lenguas | CC-BY-NC 4.0 | safetensors, GGUF comunitario |
| Gemma 3 270M base | 268M | 32.768 | multilingüe general | Gemma Terms of Use | safetensors, GGUF |
| Modelos de traducción de bajos recursos tipo M2M-100 | 418M–10.300M | 512 | ~100 lenguas | MIT (418M) | safetensors |

La comparación de rendimiento cuantitativo entre estos modelos no está disponible en la información proporcionada. Frente a NLLB-200-3.3B, este modelo es aproximadamente doce veces menor y está especializado en un subconjunto de lenguas; frente a Gemma 3 270M base, sustituye las capacidades generales por traducción especializada.

## Limitaciones y advertencias

- Licencia sin elegir (`tbd-owner-to-choose`): no hay autorización clara para uso comercial; además, al derivar de Gemma 3, quedan vinculados los Gemma Terms of Use.
- Modelo de una sola dirección: solo inglés a lengua africana; no soporta traducción inversa ni entre lenguas africanas.
- 8 de los 85 nombres de lengua aceptados no recibieron entrenamiento RL, por lo que su calidad es incierta.
- Riesgo de alucinación y de deriva en textos largos: el autor recomienda limitar a 256 tokens para frases y unos 1.024 para párrafos.
- Sensible al formato del prompt: requiere el nombre del idioma (no el código ISO), dos espacios tras los dos puntos y ningún mensaje de sistema; desviarse del formato degrada la salida.
- No debe enviarse un `<bos>` literal al servidor, ya que se añadiría un segundo token BOS y cambiaría la salida.
- La etiqueta de tres letras antepuesta obliga a posprocesar la salida.
- Sin datos publicados de sesgos por lengua ni evaluaciones de calidad por dominio; el release es de investigación.
- Solo 21 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-270m-science-translate-best-GGUF
- Modelo base (bf16): https://huggingface.co/BeardedMonster/gemma-3-270m-science-translate-best
- Gemma 3 (modelo original): https://huggingface.co/google/gemma-3-270m
- llama.cpp: https://github.com/ggml-org/llama.cpp
- NLLB-200 (señal de recompensa): https://huggingface.co/facebook/nllb-200-3.3B
- Paper de Gemma 3: https://arxiv.org/abs/2503.19786
- Paper de NLLB-200: https://arxiv.org/abs/2207.04672
