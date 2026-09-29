# khronnuz/Ling-3.0-flash-exl3

## Resumen

khronnuz/Ling-3.0-flash-exl3 es una cuantización EXL3 (formato de ExLlamaV3) del modelo inclusionAI/Ling-3.0-flash, publicada por el usuario khronnuz. No es un modelo entrenado desde cero: es un derivado de pesos con precisión reducida, pensado para servir el modelo base en GPUs con menos memoria que la requerida por BF16. El repositorio ocupa 68,4 GB y su licencia declarada es MIT, heredada de la declaración del modelo base.

El pack se distribuye en la rama `4.03bpw_h8`, con una tasa serializada de 4,03 bits por peso. No todos los tensores están a 4 bits: el decodificador usa 4 bits, la atención de alta calidad (HQ) y los componentes de expertos compartidos usan 6 bits, y la cabeza de salida usa 8 bits. El módulo MTP (multi-token prediction) se convirtió a 8 bits sin calibración, y el propio autor advierte de que eso no constituye una decodificación especulativa cualificada.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo de cuantización experimental con métricas publicadas de fidelidad (KL media de 0,004584 frente a una referencia BF16 independiente, con una coincidencia top-1 de 0,9896). Por otro, tiene una limitación operativa importante: ni ExLlamaV3 estándar ni TabbyAPI cargan este pack sin aplicar un parche de arquitectura que no está en el repositorio upstream. El autor lo describe explícitamente como un quant experimental, no adoptado para servir en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (tag `bailing_hybrid`) con expertos enrutados y expertos compartidos; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4,03 bpw (rama `4.03bpw_h8`): decodificador 4 bits, atención HQ y expertos compartidos 6 bits, cabeza de salida 8 bits, MTP 8 bits sin calibración; codebook `mul1`, output scales `always` |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada por el modelo base; ese repositorio no incluye archivo LICENSE propio) |
| Formato de pesos | EXL3 (ExLlamaV3), `custom_code`; requiere parche de arquitectura no upstream |
| Autor de la cuantizacion | khronnuz |
| Modelo base | inclusionAI/Ling-3.0-flash |
| Revision fuente | `ef06d91fe382109ae82647da88ff99b0f11745b0` |
| Tamano del repositorio | 68,4 GB |
| Calibracion | self-trace de 250×2048 a partir de un pack de 8 bpw de los mismos pesos originales (no es el corpus por defecto del conversor; no es una recuantizacion de ese pack de 8 bpw) |
| Muestreo recomendado (fuente, no medido en este quant) | `temperature=0.6`, `top_p=0.95`, `top_k=20`, modo thinking activado por defecto |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base. El tag `bailing_hybrid` apunta a una arquitectura híbrida de mezcla de expertos, y la propia model card del quant confirma la presencia de expertos enrutados por capa y de componentes de expertos compartidos, además de un módulo MTP y una cabeza de salida separada. No hay datos publicados en esta información sobre número de tokens de entrenamiento, composición del dataset, ni sobre si hubo RLHF, DPO u otro tipo de ajuste por preferencias.

Lo que sí está documentado es el proceso de cuantización. La conversión se hizo con el conversor 1.5.1 y el codebook `mul1`, con escalas de salida tipo `always`. La calibración usó un self-trace de 250 secuencias de 2048 tokens obtenido de un pack de 8 bpw de los mismos pesos originales; ese pack de 8 bpw no está publicado en el repositorio. El módulo MTP se convirtió a 8 bits sin calibración. La innovación técnica relevante aquí no es del modelo, sino del runtime: se necesita el parche de arquitectura Ling-3.0-flash del commit `everson/exllamav3@a7b05152924da3b2a88d9c2cff0a4e2d6703157b` (`v1.5.1-61-ga7b0515`, conversor 1.5.1), que no forma parte de ExLlamaV3 upstream.

## Capacidades

- Generación de texto: es la tarea declarada del pipeline (`text-generation`).
- Razonamiento con modo thinking: el muestreo recomendado por la fuente asume `thinking` activado por defecto, aunque no se detalla su comportamiento.
- Componentes de atención HQ y expertos compartidos a 6 bits, lo que sugiere que el modelo base incorpora mecanismos de atención diferenciados, sin más detalle disponible.
- Módulo MTP presente y convertido a 8 bits; el autor indica que no está cualificado para decodificación especulativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de fidelidad de cuantización: el pack publica métricas concretas (KL media 0,004584212044818999; NLL de referencia 1,0382978705275576; NLL candidata 1,0313966549510345; acuerdo top-1 0,9895833333333334 sobre 384 posiciones puntuadas de sondas de 129/257 tokens) que permiten reproducir y auditar el efecto de bajar de BF16 a 4,03 bpw.
- Servicio de inferencia en laboratorio con TabbyAPI parcheado: es la vía prevista por el autor para cargar el pack, siempre que se aplique el commit de arquitectura indicado y no la versión upstream.
- Despliegue con offload CPU+GPU: el autor documenta un reparto probado de 352 expertos en CPU y 160 expertos en GPU por cada capa enrutada, útil como punto de partida en máquinas con mucha RAM y GPU de 48 GB o menos.
- Investigación sobre cuantización de capas mixtas: el pack mezcla 4 bits en el decodificador, 6 bits en atención HQ y expertos compartidos, y 8 bits en la cabeza de salida y en MTP, lo que lo convierte en un caso práctico para estudiar el impacto de la precisión por componente.
- Pruebas de decodificación especulativa: el módulo MTP a 8 bits sin calibrar permite experimentar, pero el propio autor advierte de que no está cualificado para ello, así que solo es apto como banco de pruebas.
- Base para recuantizaciones: el autor menciona salidas incompletas a 2,50 bpw que no están publicadas, de modo que este repositorio sirve como referencia para líneas de trabajo de compresión más agresiva.
- Docencia y análisis de derivados de licencia permisiva: es un caso claro de derivado MIT sin archivo LICENSE propio heredado del repositorio base, útil para estudiar cómo se propaga la licencia en cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aparecen en la model card ni en los resultados de búsqueda). Lo único medido por el autor son métricas de fidelidad de la cuantización frente a una referencia BF16 independiente, sobre 384 posiciones puntuadas de sondas de 129 y 257 tokens, que el propio autor califica como no representativas y no equivalentes a una cualificación de calidad ni de velocidad.

| Metrica | Valor |
|---|---|
| Posiciones evaluadas | 384 (sondas de 129/257 tokens) |
| KL media frente a referencia BF16 | 0,004584212044818999 |
| NLL de referencia | 1,0382978705275576 |
| NLL candidata | 1,0313966549510345 |
| Acuerdo top-1 | 0,9895833333333334 |
| Repetición exacta del candidato | sí; KL de repetición = 0 |
| Throughput de decodificación | no medido |

## Requisitos de hardware

- Peso de los pesos: 68,4 GB en disco, en formato EXL3 de 4,03 bpw. La VRAM necesaria para inferencia es superior a esa cifra, ya que hay que sumar caché KV, y la longitud de contexto no está disponible, por lo que no se puede calcular con precisión.
- El autor confirma que el pack no cabe de forma residente en una GPU de 48 GB.
- Reparto probado: 352 expertos en CPU y 160 expertos en GPU por cada capa enrutada. El autor indica que ese reparto no está optimizado. Esto exige una cantidad de RAM del sistema elevada, no cuantificada en la información disponible.
- GPU de gama alta recomendadas: no disponible como recomendación del autor. Por tamaño, un despliegue sin offload requiere agregar al menos 70-80 GB de VRAM, lo que apunta a A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- GPU de consumo: no cabe en RTX 4090, RTX 3090 ni similares (24 GB) sin offload masivo a CPU, y ese escenario no fue optimizado ni medido.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI, en ambos casos aplicando el parche de arquitectura `everson/exllamav3@a7b0515`. Las versiones estándar de ExLlamaV3 y TabbyAPI no cargan este pack. No hay soporte indicado para vLLM, llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no medidos. El autor insiste en que no se deben usar como referencia ni la velocidad del conversor ni la del trace de 8 bpw.

## Comparativa con modelos similares

No hay datos publicados en la información disponible sobre modelos comparables de la misma categoría. La comparación factible es entre esta cuantización y otros artefactos del mismo modelo, todos con la misma licencia MIT y todos derivados de inclusionAI/Ling-3.0-flash:

| Artefacto | Precision | Tamano / rama | Disponibilidad | Notas |
|---|---|---|---|---|
| khronnuz/Ling-3.0-flash-exl3 | 4,03 bpw (4/6/8 bits por componente) | 68,4 GB, rama `4.03bpw_h8` | Publicado | Requiere parche de arquitectura no upstream |
| Pack de 8 bpw usado como origen del trace | 8 bpw | no disponible | No publicado en el repositorio | El autor indica que este pack no es una recuantización de él |
| Salidas incompletas a 2,50 bpw | 2,50 bpw | no disponible | No publicadas | El autor las menciona como incompletas |
| inclusionAI/Ling-3.0-flash | BF16 | no disponible | Repositorio upstream | Modelo base; licencia MIT declarada, sin archivo LICENSE |

## Limitaciones y advertencias

- Cuantización experimental: el autor declara explícitamente que no es un modelo adoptado para servir en producción.
- Compatibilidad rota con el runtime estándar: ExLlamaV3 y TabbyAPI de serie no cargan el pack; hace falta un commit que no está en el upstream de ExLlamaV3.
- Fidelidad medida sobre una muestra no representativa: 384 posiciones de sondas cortas (129/257 tokens). No es una cualificación de calidad.
- Throughput y latencia no medidos: no hay ningún dato de velocidad de inferencia de este pack.
- MTP a 8 bits sin calibración y sin cualificar para decodificación especulativa: usarlo como tal no está respaldado por el autor.
- Reparto CPU/GPU no optimizado: el único reparto documentado (352/160 expertos) no fue ajustado, por lo que el rendimiento en ese escenario es incierto.
- Licencia: MIT declarada por el modelo base, pero ese repositorio no incluye archivo LICENSE propio. El cuantizador mantiene la licencia declarada y no añade un archivo que la fuente no tenía, lo que puede complicar la verificación formal en un contexto comercial.
- Idiomas soportados no documentados, lo que impide garantizar cobertura multilingüe.
- Longitud de contexto desconocida: no se puede planificar despliegue de contexto largo ni estimar caché KV.
- Sesgos, riesgo de alucinación y comportamiento en dominios concretos: no disponible en la información proporcionada.
- Adopción nula hasta la fecha de la ficha (0 descargas, 0 likes), lo que reduce la superficie de validación por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/khronnuz/Ling-3.0-flash-exl3
- Rama del quant 4,03 bpw / H8: https://huggingface.co/khronnuz/Ling-3.0-flash-exl3/tree/4.03bpw_h8
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Parche de arquitectura requerido (ExLlamaV3, commit no upstream): https://github.com/everson/exllamav3/commit/a7b05152924da3b2a88d9c2cff0a4e2d6703157b
- Revisión fuente de los pesos: `ef06d91fe382109ae82647da88ff99b0f11745b0`
- Papers, blogs, repos adicionales o demos: no disponible. Los resultados de búsqueda web proporcionados no contenían enlaces relevantes al modelo ni a su cuantización.
