# BeardedMonster/gemma-3-0.8b-science-translate-Q8

## Resumen

`BeardedMonster/gemma-3-0.8b-science-translate-Q8` es un modelo de traduccion especializado en ciencia, derivado de Gemma 3, que traduce texto en ingles a 125 idiomas africanos. Lo desarrolla Jeffrey Otoibhi (Aletheia AI) bajo el nombre SabiYarn, y parte del modelo `BeardedMonster/gemma-3-1b-science-translate-best`, afinado con SFT y RL sobre ciencia. Sobre esa base se aplica una poda de vocabulario (de 262.144 a aproximadamente 112.000 tokens) y una cuantizacion FP8 E4M3 de los pesos, lo que reduce el modelo a unos 827 millones de parametros y cerca de 0,96 GB de pesos.

El modelo resuelve un problema concreto: la traduccion de contenido cientifico a lenguas africanas de bajos recursos, un ambito con escasa cobertura en los modelos generalistas. La poda de vocabulario y el formato FP8 estan pensados para servir el modelo con vLLM en GPUs con soporte nativo de FP8 (Hopper, Ada, Blackwell), con un coste de memoria muy bajo.

Es relevante por su doble caracter tecnico (poda de vocabulario con cierre de merges BPE y cuantizacion FP8 con escala dinamica de activaciones) y por su cobertura linguistica. Ahora bien, el propio autor advierte de que los pesos cuantizados no se han evaluado en GPU con benchmarks de traduccion; solo existe una comprobacion de paridad de logits en CPU contra el modelo sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma3_text, Gemma-3-1B-it) |
| Parametros totales | 826.878.592 (aproximadamente 0,83B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (escala de pesos por tensor, escala de activaciones dinamica); tambien existe el modelo padre en bf16/fp32 |
| Idiomas soportados | Ingles como origen; 125 etiquetas de idioma africano como destino (yor, hau, ibo, pcm, efi, twi, ewe, fon, wol, swh, kin, som, orm, amh, tir, lug, lin, zul, xho, afr, sna, nya, sot, tsn, mlg, y entre otros hasta 125) |
| Licencia | `sabiyarn-commercial-use-with-attribution` (uso comercial con atribucion obligatoria; se aplican ademas los Gemma Terms of Use y la Prohibited Use Policy) |
| Formato de pesos | safetensors (FP8), libreria vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 3 en su variante de 1B (gemma3_text), un transformer decoder-only. Sobre el checkpoint base de Google se aplico un proceso de SFT y RL orientado a ciencia, y despues un RL general. A continuacion se realizo una poda de vocabulario de 262.144 a aproximadamente 112.000 tokens con cierre de merges (se conservan los componentes BPE de cada token retenido) y se preservaron los 256 tokens de byte, de modo que cualquier texto puede seguir codificandose. Los identificadores de token se renumeraron, por lo que no coinciden con los de Gemma 3 original.

La cuantizacion es FP8 E4M3 con escala de pesos por tensor y escala de activaciones dinamica, declarada en `config.json` (`quant_method: fp8`), de forma que vLLM la detecta sin pasar el argumento `quantization=`. El autor reporta una comprobacion de paridad de logits en CPU (fp32, 10 prompts en 10 idiomas, decodificacion greedy, 40 tokens nuevos): el modelo podado en bf16 coincidio en 9 de 10 prompts (chrF de acuerdo 97,9; mismo top-1 en el primer paso en 10 de 10; diferencia maxima de logit 0,17), y los pesos FP8 desquantizados a fp32 coincidieron en 8 de 10 (chrF de acuerdo 96,3; top-1 identico en 10 de 10; diferencia maxima de logit 2,44). No se simulo la cuantizacion dinamica de activaciones.

## Capacidades

- Traduccion unidireccional de ingles a 125 idiomas africanos, con etiqueta de idioma de destino como token unico al inicio de la respuesta.
- Formato de prompt fijo: `Translate the text to {Language name}:  {English text}` (dos espacios tras los dos puntos), con plantilla de chat de un solo turno de usuario.
- Cobertura cientifica medida por el autor para seis idiomas: amh, hau, lug, nso, yor y zul.
- Las etiquetas de idioma (`<yor>`, `<hau>`, etc.) son entradas de vocabulario ordinarias (no especiales), por lo que se conservan con `skip_special_tokens=True` y deben eliminarse manualmente.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se documenta soporte multilingue mas alla del par ingles a idioma africano.

## Casos de uso

- Traduccion de articulos cientificos y material divulgativo: el modelo esta afinado especificamente con datos de ciencia y traduce del ingles a lenguas africanas, lo que permite localizar resumenes, guias clinicas o material educativo para comunidades con poca cobertura de traduccion automatica.
- Localizacion de contenido sanitario y agricola: con un prompt fijo y salida con etiqueta de idioma, se puede integrar en pipelines de publicacion que generen versiones en yoruba, hausa o zulu de materiales de extension agraria o salud publica.
- Servicio de traduccion por lotes en produccion: al ocupar aproximadamente 0,96 GB de pesos y ejecutarse en vLLM, permite desplegar muchas instancias por GPU y procesar grandes volumenes de frases en paralelo.
- Investigacion en traduccion automatica de bajos recursos: sirve como modelo de referencia para experimentos de poda de vocabulario y cuantizacion FP8, ya que el autor documenta el mapa de identificadores (`vocab_keep_ids.json`) y el procedimiento de paridad.
- Generacion de subtitulos y material educativo en lenguas africanas: el formato de un turno y la salida corta encajan con la traduccion de frases sueltas o parrafos breves en flujos de produccion de contenido.
- Prototipado de asistentes multilingues para ONG y administraciones: el modelo puede traducir consultas o respuestas del ingles a la lengua local dentro de un sistema mayor, siempre que se respete la atribucion exigida por la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint cuantizado no se ha evaluado en GPU con AfriScience-MT, FLORES+, NTREX ni MAFAND, y que la unica comprobacion realizada es el test de paridad de logits en CPU descrito en la seccion de arquitectura. Los datos de chrF++ del modelo general (variacion de +0,0 a +0,3 en una muestra de 500 frases y 20 idiomas) corresponden al modelo general, no a este checkpoint cientifico.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,96 GB solo para los pesos en FP8; con cache KV y overhead de vLLM, el consumo real es mayor y no esta cuantificado en la informacion disponible.
- GPU objetivo: GPUs con soporte nativo de FP8 (Hopper, Ada, Blackwell). El autor probo vLLM 0.32.0 en una NVIDIA RTX PRO 6000 Blackwell.
- GPUs consumer: no se documenta compatibilidad con GPUs sin soporte FP8; no esta confirmado que funcione en tarjetas consumer sin esa capacidad.
- Despliegue: exclusivamente vLLM. Transformers no puede cargar estos pesos (tensores FP8 con entradas `weight_scale`); para Transformers debe usarse el modelo padre `BeardedMonster/gemma-3-1b-science-translate-best`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| gemma-3-0.8b-science-translate-Q8 (este) | 826,9M | no disponible | sabiyarn-commercial-use-with-attribution + Gemma Terms | safetensors FP8, solo vLLM | Traduccion ingles a 125 idiomas africanos, ciencia |
| BeardedMonster/gemma-3-1b-science-translate-best (padre) | aproximadamente 1,0B | no disponible | misma familia de licencia | bf16/fp32, Transformers o vLLM | Mismo modelo sin poda de vocabulario ni cuantizacion; evaluable en Transformers |
| BeardedMonster/gemma-3-0.8b-translate-Q8 | no disponible | no disponible | misma familia de licencia | safetensors FP8, solo vLLM | Misma receta de poda y cuantizacion sobre el modelo general (no cientifico) |
| Gemma 3 1B original (Google) | aproximadamente 1B | no disponible | Gemma Terms of Use | safetensors, multiples runtimes | Modelo base generalista, sin especializacion en traduccion cientifica a lenguas africanas |

## Limitaciones y advertencias

- Los pesos cuantizados no se han evaluado en GPU con benchmarks de traduccion; la calidad real del checkpoint FP8 no esta medida y solo existe una comprobacion de paridad de logits en CPU.
- Transformers no puede cargar estos pesos; usar el modelo padre si se necesita ese runtime.
- Los identificadores de token no coinciden con los de Gemma 3: es obligatorio usar el tokenizer de este repositorio y nunca mezclarlo con el del padre. El mapa de identificadores esta en `vocab_keep_ids.json`.
- Solo traduce de ingles a idiomas africanos; no se documenta la direccion inversa ni otros pares.
- La calidad cientifica solo esta medida para seis idiomas (amh, hau, lug, nso, yor, zul); para el resto de las 125 etiquetas no hay evaluacion publicada.
- Riesgo de alucinacion y de traduccion imprecisa en terminologia cientifica especializada, especialmente en lenguas con pocos recursos; no hay datos publicados que lo cuantifiquen.
- Licencia de uso comercial con atribucion obligatoria: hay que acreditar "SabiYarn translation models by Jeffrey Otoibhi (Aletheia AI)" y citar el paper en preparacion; ademas se aplican los Gemma Terms of Use y la Prohibited Use Policy.
- El modelo es un derivado de Gemma 3, por lo que hereda las restricciones de uso de Google.
- El formato de prompt es estricto (dos espacios tras los dos puntos y nombre del idioma); desviarse de el puede degradar la salida.
- No se documentan sesgos especificos, pero al estar entrenado sobre datos cientificos en ingles y traducciones a lenguas africanas, es probable que herede sesgos de esas fuentes; no hay analisis publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-0.8b-science-translate-Q8
- Modelo padre (sin cuantizar): https://huggingface.co/BeardedMonster/gemma-3-1b-science-translate-best
- Modelo general con la misma receta: https://huggingface.co/BeardedMonster/gemma-3-0.8b-translate-Q8
- Licencia: https://huggingface.co/BeardedMonster/gemma-3-0.8b-science-translate-Q8/blob/main/LICENSE.md
- Gemma Terms of Use y Prohibited Use Policy: https://ai.google.dev/gemma/terms
