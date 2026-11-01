# essprod/darija-mt-onnx

## Resumen

Lost in Darija es un modelo de traducción automática inglés → darija (árabe marroquí) derivado de MarianMT, concretamente un ajuste fino de `Helsinki-NLP/opus-mt-en-ar` sobre el corpus DODa (Darija Open Dataset). El autor, essprod, lo distribuye en formato ONNX con pesos cuantizados a 8 bits para su uso con Transformers.js, lo que permite ejecutar la traducción directamente en el navegador o en el dispositivo del usuario sin backend. El repositorio ocupa unos 0,1 GB y el modelo exportado pesa 143 MB.

El modelo resuelve un nicho concreto: la traducción de inglés a una variedad dialectal del árabe con escasa cobertura en los sistemas de traducción convencionales, que suelen centrarse en árabe estándar moderno (MSA). Su integración con Transformers.js lo hace relevante para aplicaciones web educativas y de aprendizaje de idiomas que necesitan inferencia local, sin latencia de red ni costes de servidor, y con privacidad para el usuario.

Arquitectura transformer encoder-decoder de tipo Marian, con encoder y decoder fusionado en la exportación ONNX, vocabulario propio con `<unk>` = 1 y embeddings de encoder, decoder y salida separados (sin atar). El contexto y el número de parámetros no están detallados en la información proporcionada, más allá del tamaño del artefacto cuantizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (q8) en ONNX; export sin compresión también disponible según la model card |
| Idiomas soportados | inglés (en) → darija / árabe marroquí (ary) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder + decoder fusionado), tokenizer.json; uso vía Transformers.js |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de MarianMT, la familia de modelos de traducción neuronales de Helsinki-NLP basada en la arquitectura transformer encoder-decoder original de Vaswani et al. El punto de partida es `Helsinki-NLP/opus-mt-en-ar`, entrenado sobre corpus OPUS para inglés → árabe. El ajuste fino se realizó sobre DODa (Darija Open Dataset, Outchakoucht y Es-Samaali, 2024), un corpus abierto de darija, y el checkpoint resultante se denomina `fine_tuned_marian_v2` en la model card.

La exportación a ONNX mantiene la configuración original del modelo ajustado: encoder, decoder y embeddings de salida separados (sin weight tying), y un tokenizer con `<unk>` = 1 igual que el modelo original. Se generan dos variantes: una exportación sin compresión que reproduce exactamente la salida greedy del modelo original, y una versión con pesos a 8 bits que introduce cambios puntuales en alguna palabra. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; al tratarse de un modelo de traducción supervisada, lo habitual en esta familia es entrenamiento con pares paralelos y sin alineación por preferencias.

Una particularidad operativa es el uso de un prefijo de idioma obligatorio (`>>ary<<`) al inicio de cada frase, heredado del esquema multilingüe de los modelos OPUS-MT. La decodificación es greedy porque Transformers.js no implementa todavía beam search.

## Capacidades

- Traducción de texto de inglés a darija (árabe marroquí), frase a frase.
- Ejecución local en navegador o dispositivo mediante Transformers.js y ONNX Runtime Web.
- Inferencia con pesos a 8 bits (143 MB), adecuada para entornos con recursos limitados.
- Manejo de texto de entrada corto y medio típico de interfaces de diccionario o traducción de frases.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a la pareja en → ary; no se indica soporte para otras direcciones ni para árabe estándar como salida.
- Requiere el prefijo `>>ary<<` en cada oración para un comportamiento correcto.

## Casos de uso

- Diccionario y traductor integrado en aplicaciones de aprendizaje de darija: el modelo se ejecuta en el dispositivo del estudiante mediante Transformers.js, de modo que la traducción de frases sueltas no requiere backend ni envía el texto a un servidor. Es el caso de uso original declarado por el autor (essprod: Learn Darija Today).
- Aplicaciones web estáticas o PWA sin infraestructura de servidor: al pesar 143 MB en q8 y ejecutarse en el navegador, permite ofrecer traducción en → ary en sitios alojados en CDN o GitHub Pages sin costes de cómputo por consulta.
- Herramientas de apoyo para voluntarios y ONG que trabajan con población marroquí: traducción de mensajes y formularios breves del inglés a darija en entornos con conectividad limitada, aprovechando la inferencia local.
- Preprocesado de contenidos educativos: traducción de glosarios, ejercicios y material didáctico de inglés a darija para generar borradores que después revisa un hablante nativo.
- Prototipado rápido de funcionalidades de traducción en productos dirigidos a Marruecos: permite validar la experiencia de usuario con un modelo abierto y ligero antes de invertir en un sistema de traducción en producción de mayor calidad.
- Investigación sobre traducción de variedades dialectales de bajo recurso: sirve como línea base reproducible (MarianMT ajustado sobre DODa, exportado a ONNX) para comparar con modelos multilingües grandes en la tarea en → ary.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal, ya que el modelo está pensado para ejecutarse en CPU vía ONNX Runtime Web; el artefacto q8 ocupa 143 MB y el repositorio completo 0,1 GB, por lo que la huella de memoria es del orden de unos cientos de MB.
- GPU recomendadas: no se especifican; al ser un modelo Marian de tamaño base y estar orientado a Transformers.js, no requiere GPU dedicada.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo si se ejecuta con ONNX Runtime o un runtime compatible, aunque el diseño apunta a CPU y navegador.
- Opciones de despliegue: Transformers.js (principal, con `dtype: "q8"`), ONNX Runtime (Web, Node.js o nativo), y potencialmente servidores de inferencia compatibles con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al ser decodificación greedy y un modelo pequeño, la latencia esperada es baja en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| essprod/darija-mt-onnx | MarianMT (transformer enc-dec) | en → ary | no disponible | Apache 2.0 | ONNX, Transformers.js |
| Helsinki-NLP/opus-mt-en-ar | MarianMT (transformer enc-dec) | en → ar (MSA) | no disponible | Apache 2.0 (según modelo base) | safetensors / PyTorch, Transformers |
| Modelos multilingües grandes tipo NLLB o M2M-100 | Transformer enc-dec multilingüe | decenas o cientos de idiomas, cobertura variable de ary | no disponible | según variante | PyTorch, CTranslate2, ONNX |

La comparación directa con el modelo base `Helsinki-NLP/opus-mt-en-ar` es la más informativa: comparten arquitectura y licencia, pero el modelo de essprod está ajustado específicamente para darija y empaquetado para inferencia local en navegador. Frente a modelos multilingües de mayor tamaño, la ventaja es el tamaño reducido (143 MB en q8) y la ejecución sin servidor; la desventaja esperable es una calidad inferior fuera del dominio de DODa. No se dispone de métricas comparativas de calidad (BLEU, chrF) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo traduce en → ary; no cubre la dirección inversa ni otros idiomas.
- Requiere el prefijo `>>ary<<` en cada oración; sin él, el comportamiento no está garantizado.
- Decodificación greedy únicamente, ya que Transformers.js no implementa beam search, lo que puede reducir la calidad frente a la inferencia con búsqueda por haz del modelo original.
- La cuantización a 8 bits introduce cambios puntuales en palabras respecto a la salida del modelo original.
- El ajuste fino se realizó sobre DODa; el rendimiento fuera de ese dominio (texto técnico, jerga, frases largas) no está documentado y puede degradarse.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos Marian de tamaño base, especialmente en expresiones idiomáticas y ambigüedad léxica.
- No se documentan evaluaciones de sesgo; al derivar de OPUS-MT, puede heredar sesgos de los corpus paralelos originales.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de DODa si se redistribuye o se usa en producción.
- El autor advierte de que los cambios de cuantización afectan a palabras sueltas; para aplicaciones sensibles conviene validar con hablantes nativos.
- Uso previsto por el autor limitado a una aplicación educativa; no hay garantías de calidad para dominios profesionales (legal, médico, técnico).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/essprod/darija-mt-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ar
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- DODa, Darija Open Dataset (Outchakoucht y Es-Samaali, 2024): no disponible enlace directo en la información proporcionada
- Aplicación del autor (essprod: Learn Darija Today): no disponible enlace directo en la información proporcionada
