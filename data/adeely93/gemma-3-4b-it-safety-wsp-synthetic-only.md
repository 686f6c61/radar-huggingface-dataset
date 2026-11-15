# Adeely93/gemma-3-4b-it-safety-wsp-synthetic-only

## Resumen

`gemma-3-4b-it-safety-wsp-synthetic-only` es un artefacto de investigación derivado de `google/gemma-3-4b-it`, el modelo multimodal instruido de 4.300 millones de parámetros de Google DeepMind. Lo publica el usuario Adeely93 en Hugging Face y no es un fine-tune convencional: aplica una edición directa de pesos, sin gradientes, sobre la capa 15 del decodificador para forzar el rechazo de peticiones imagen-texto dañinas que el modelo base sí responde.

La técnica se denomina WSP (weight-space programming). Un agente LLM generó sus propios escenarios sintéticos de seguridad, localizó dónde fallaba la decisión de rechazo del modelo y resolvió en forma cerrada una edición de cuatro unidades MLP de la capa 15. El resultado es un checkpoint que conserva arquitectura, tokenizador, procesador y plantilla de chat del original, con 30.712 parámetros distintos de los 4.300 millones del modelo base, distribuidos en tres tensores.

Su relevancia es metodológica más que de producto: demuestra que se puede modular una conducta de seguridad concreta (el rechazo multimodal) sin entrenamiento, sin adaptadores y sin datasets de seguridad existentes, y con un coste de cómputo mínimo (97 pasadas forward). Al mismo tiempo, el propio autor lo etiqueta como artefacto de investigación sin evaluación externa, con sobre-rechazo medible y sin cobertura de las categorías de daño más graves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal decoder-only (familia Gemma 3), con torre de visión y proyector; edición puntual en la MLP de la capa 15 |
| Parametros totales | 4.300.079.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Gemma 3 4B IT) |
| Tipos de cuantizacion | No se publican cuantizaciones propias; pesos en BF16, compatible con las cuantizaciones estándar de la familia Gemma 3 (no verificado en esta ficha) |
| Idiomas soportados | No disponible como lista oficial; los datos de evaluación son mayoritariamente en inglés, con peticiones en otras cuatro lenguas europeas |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (BF16), dos shards; solo difiere `model-00002-of-00002.safetensors` respecto al base |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only multimodal de la familia Gemma 3: recibe imagen y texto, proyecta las características visuales al espacio del modelo de lenguaje y genera texto con la plantilla de chat propia de Gemma 3 IT. La edición no altera esa arquitectura ni añade componentes en inferencia: no hay wrapper, ni system prompt, ni decodificación especial.

La modificación afecta a tres tensores de la MLP de la capa 15 del modelo de lenguaje: se sobrescriben las filas 1623, 2350, 3319 y 7331 de `gate_proj` y `up_proj`, y las columnas equivalentes de `down_proj`. Esas cuatro unidades (de 10.240) se eligieron por su baja contribución a la salida de la capa y se reemplazan por detectores con umbral de una lectura lineal del tipo «esto debería rechazarse», calculada sobre la entrada de la MLP. Cuando el detector se activa, escribe en el flujo residual la dirección «rechazado frente a respondido» que el propio modelo ya codifica. Dos unidades leen al final del prompt y dos durante la generación de la respuesta. El cambio relativo de norma de Frobenius es 0,147 en `gate_proj`, 0,017 en `up_proj` y 0,393 en `down_proj`.

No hubo gradientes, optimizadores, fine-tuning ni adaptadores. Las lecturas lineales se obtuvieron resolviendo sistemas lineales sobre activaciones recogidas en 97 peticiones forward por lotes contra el modelo base (presupuesto del run: 500). Los escenarios sintéticos los escribió el propio agente editor: no se usó ningún dataset, benchmark ni colección de prompts de seguridad preexistente, y tampoco se usaron imágenes reales (los estímulos visuales son dibujos planos). El modelo base de referencia es `google/gemma-3-4b-it`, revisión `093f9f388b31de276ce2de164bdc2081324b9767`.

## Capacidades

- Generación de texto e imagen-texto conversacional, heredada íntegramente de Gemma 3 4B IT.
- Rechazo de peticiones dañinas multimodales: la tasa de cumplimiento dañino baja del 48,3 % al 2,8 % en el pool de validación sintético del autor.
- Robustez declarada frente a texto visualmente degradado o fragmentado, capturas de pantalla, diagramas a completar, pretextos de mejora de borradores o de investigación, presión de formato de salida, acuerdos previos fabricados y peticiones repartidas entre texto e imagen.
- Rechazo estable bajo decodificación muestreada, generaciones de 768 tokens y seguimientos multi-turno, según las pruebas del autor.
- Cobertura de peticiones en cuatro lenguas europeas adicionales al inglés dentro de los pools sintéticos.
- Conserva las capacidades del base en tareas benignas: 74 de 77 claves de respuesta correctas, idéntico al original, y 0 rechazos en 24 ítems de capacidad ordinaria.
- No se documenta soporte específico de tool calling, function calling ni razonamiento multi-paso más allá de lo que ofrece el modelo base.

## Casos de uso

- Investigación en edición de pesos: servir como referencia reproducible de una intervención gradient-free sobre un transformer multimodal, con deltas de pesos acotados a tres tensores y métricas de antes y después.
- Estudio de alineación y rechazo: analizar cómo una lectura lineal de activaciones internas puede conectarse a la conducta de negativa sin reentrenar, y qué coste en falsos positivos tiene un detector con umbral.
- Evaluación de robustez de salvaguardas: usar el checkpoint como contraste frente al base para medir cuánto cambia la tasa de cumplimiento dañino en un conjunto propio de peticiones imagen-texto.
- Filtrado de entradas en pipelines multimodales de bajo coste: desplegar el modelo como primera capa de cribado en flujos donde se envían capturas o diagramas junto a texto, asumiendo el sobre-rechazo documentado.
- Docencia y divulgación técnica: ilustrar en un taller cómo se localiza una dirección de decisión en el espacio de activaciones y se materializa en pesos, con un modelo de 4B que cabe en hardware de consumo.
- Prototipado de asistentes con política de negativa estricta en dominios de fraude, acoso, falsificación, invasión de privacidad, desinformación o robo, que son las familias cubiertas por los datos sintéticos del autor.
- Comparación de metodologías de seguridad: contrastar la edición de pesos con fine-tuning con RLHF o DPO en términos de coste de cómputo, superficie de cambio y efectos colaterales sobre entradas benignas.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de los pools sintéticos del propio autor, con decodificación greedy, 256 tokens nuevos, plantilla de chat del modelo y sin system prompt. La tasa de cumplimiento dañino mide la proporción de ítems dañinos cuya respuesta prestó ayuda material, juzgada sobre la respuesta completa.

| Medida | Original | Editado |
|---|---|---|
| Pool de validación, 211 ítems dañinos en 14 familias nunca usadas para construir o seleccionar la edición | 48,3 % | 2,8 % |
| Pool de desarrollo, 239 ítems dañinos, build final (in-sample) | 33,9 % | 1,3 % |
| Pool de desarrollo, cada familia respondida por una edición construida sin su fold | 33,9 % | 4,2 % |
| Pool de validación, ítems benignos rechazados (de 89) | 0 | 13 |
| 126 tareas benignas nuevas: rechazos; claves de respuesta correctas (de 77) | 0; 74 | 0; 74 |
| Caso más débil, daño solo en la combinación de texto y imagen inocentes (validación) | No disponible | 17,6 % |
| Mismo caso sin ejemplos de ese tipo en los datos de ajuste | No disponible | 59 % |

Las 14 familias de validación mejoraron y 10 llegaron al 0 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: alrededor de 8,6 GB de pesos más overhead de activaciones y caché KV; en la práctica, 12-16 GB de VRAM para inferencia cómoda con imágenes.
- Cuantizado a 8 bits, el peso ronda los 4,3 GB; a 4 bits, alrededor de 2,2 GB, lo que permite ejecución en GPUs de consumo con 8 GB o más (cifras estimadas a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas para BF16: A100 40 GB, H100, L40S o RTX 4090 (24 GB). En consumer, RTX 3090, 4080 y 4090 son suficientes; tarjetas de 8-12 GB requieren cuantización.
- Despliegue: clases estándar de `transformers` (`AutoProcessor` y `Gemma3ForConditionalGeneration`); la model card incluye etiqueta `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con Inference Endpoints. Para llama.cpp u Ollama haría falta convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles. El autor solo reporta el coste de construcción de la edición (97 pasadas forward por lotes), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Conducta de rechazo multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Adeely93/gemma-3-4b-it-safety-wsp-synthetic-only` | 4,3 B | No disponible | 2,8 % de cumplimiento dañino en validación sintética propia; 13 de 89 benignos rechazados | Gemma | Hugging Face, 8 descargas |
| `google/gemma-3-4b-it` (base) | 4,3 B | No disponible | 48,3 % de cumplimiento dañino en el mismo pool; 0 benignos rechazados | Gemma | Hugging Face, ampliamente distribuido |
| Fine-tune de seguridad por SFT/DPO sobre Gemma 3 4B IT | 4,3 B | No disponible | No disponible | Gemma | Múltiples variantes comunitarias |
| Modelos de seguridad dedicados (clasificadores de contenido) | Variable | No aplica | Diseñados solo para clasificar, no generan respuesta | Variable | Variable |

No se dispone de comparaciones con benchmarks estándar ni con ediciones de pesos equivalentes sobre otros modelos, por lo que la comparativa se limita al contraste con el modelo base y con las alternativas metodológicas habituales.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara explícitamente que no ha habido evaluación externa y que todas las cifras provienen de pools sintéticos escritos por el propio agente editor.
- Sobre-rechazo en entradas benignas difíciles: de 89 ítems benignos de validación se rechazaron 13, entre ellos 6 de 9 peticiones de transcribir texto dañino mostrado en una imagen, 4 de 12 «gemelos» benignos de prompts ambiguos y 3 de 44 tareas con encuadre tipo jailbreak.
- Techo de severidad en los datos de prueba: los ítems cubren daño no técnico y de severidad baja (fraude, acoso, falsificación, privacidad, desinformación, robo). No se mide el efecto sobre temas químicos, biológicos, radiológicos o nucleares, armas, ciberataques, síntesis de drogas, contenido sexual ni contenido con menores.
- Punto débil identificado: el daño que solo emerge de la combinación de un texto inocente y una imagen aparentemente inocente alcanza el 17,6 % en validación y el 59 % cuando no hubo ejemplos de ese tipo en el ajuste.
- Detector lineal con umbral: la edición no mejora el razonamiento contextual del modelo; las entradas que no mueven la lectura pasan y las benignas que sí la mueven se rechazan. No se ejecutó ningún ataque adaptativo.
- Sesgo de autor único: el mismo agente escribió los prompts, dibujó las imágenes (planas, no fotografías) y redactó la rúbrica de juicio; los datos son mayoritariamente en inglés.
- Evaluación juzgada por modelo: las etiquetas las asignaron instancias de Claude Sonnet siguiendo una rúbrica escrita, leyendo el texto de cada imagen y no la imagen; el muestreo de verificación se hizo solo sobre la línea base.
- Un solo run y familias pequeñas, de 11 a 40 ítems cada una, lo que limita la potencia estadística de las tasas reportadas.
- Licencia Gemma: el uso comercial queda sujeto a los Gemma Terms of Use, incluidos sus requisitos de atribución y restricciones de uso aceptable.
- No apto como garantía de seguridad en producción: el propio autor lo describe como evidencia preliminar y no como salvaguarda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/gemma-3-4b-it-safety-wsp-synthetic-only
- Tablas de resultados por familia de escenario: https://huggingface.co/Adeely93/gemma-3-4b-it-safety-wsp-synthetic-only/blob/main/docs/results.md
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Revisión del modelo base usada: `093f9f388b31de276ce2de164bdc2081324b9767`
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
