# kindlingai/gemma-4-e4b-exlr8

## Resumen

Gemma 4 E4B exlr8 es una variante cuantizada del modelo google/gemma-4-E4B-it, publicado por kindlingai. El modelo conserva la arquitectura original de Gemma 4 E4B pero almacena las capas lineales de atención y MLP como codificaciones trellis de 2, 3 y 4 bits en el formato exlr8, mientras que el resto de tensores permanece en BF16. La tabla de embeddings por capa se codifica como trellis de fila a 4 bits, de modo que cada token decodifica sus 256 valores por capa desde 128 bytes propios.

El interés de esta ficha radica en que ofrece tres perfiles de cuantización (bit217, bit245 y bit309) con distintos compromisos entre bits por peso y fidelidad respecto al modelo BF16, medidos mediante divergencia KL y acuerdo top-1 sobre 131.000 tokens retenidos. Esto permite a desarrolladores e investigadores elegir el perfil adecuado según su restricción de memoria y su tolerancia a la degradación de calidad.

El repositorio ocupa 12,3 GB y se distribuye bajo licencia Apache 2.0, la misma que el modelo fuente. No se dispone de información sobre parámetros totales, longitud de contexto ni idiomas soportados en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B), con lineales de atención y MLP cuantizados en trellis exlr8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis de 2, 3 y 4 bits (perfiles bit217, bit245, bit309); embeddings por capa a 4 bits; resto BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (Gemma 4 license) |
| Formato de pesos | exlr8 (trellis encodes) con tensores BF16; librería trellis |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it y aplica una cuantización selectiva sobre las matrices lineales de atención (q, k, v, o) y de MLP (gate, up, down). Cada tipo de matriz recibe una anchura de trellis distinta según el perfil: bit217 usa K4 para k/v/o y K2 para q, gate, up y down; bit245 usa K4 para k/v/o, K2 para q, gate y up, y K3 para down; bit309 usa K3 para q, gate, up y down, y K4 para k/v/o. La tabla de embeddings por capa se codifica como trellis de fila a 4 bits, con 128 bytes por token y capa.

No se proporciona información sobre el proceso de entrenamiento original de Gemma 4 E4B (número de tokens, composición del dataset, RLHF/DPO) ni sobre innovaciones técnicas adicionales más allá del esquema de codificación exlr8. La métrica de fidelidad reportada es la divergencia KL y el acuerdo top-1 por token frente al modelo BF16, evaluados sobre 131.000 tokens retenidos.

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo base Gemma 4 E4B-it.
- Capacidades de instruction following, al ser una variante del modelo -it.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Tres perfiles de cuantización seleccionables con distinto equilibrio calidad/memoria.

## Casos de uso

- Despliegue en entornos con memoria limitada: el perfil bit217 (2,17 bits por peso) reduce el peso de las lineales codificadas al mínimo, permitiendo ejecutar el modelo en GPUs con menos VRAM a costa de un acuerdo top-1 del 78,0 % frente a BF16.
- Equilibrio calidad/memoria en producción: el perfil bit245 (2,45 bits por peso) ofrece un acuerdo top-1 del 81,8 % y una KL de 0,265, adecuado cuando se necesita mayor fidelidad que bit217 sin llegar al coste de bit309.
- Aplicaciones sensibles a la fidelidad: el perfil bit309 (3,09 bits por peso) alcanza un 89,0 % de acuerdo top-1 y KL de 0,093, recomendable para tareas donde la degradación de salida debe ser mínima.
- Investigación sobre cuantización trellis: los tres perfiles y sus métricas KL/top-1 permiten estudiar el impacto de distintas anchuras por tipo de matriz en la calidad del modelo.
- Evaluación comparativa frente a BF16: el modelo sirve como referencia para medir la pérdida de fidelidad introducida por cuantización selectiva en modelos Gemma 4.
- Prototipado rápido con la librería trellis: al distribuirse en formato exlr8, se integra en flujos que ya usan trellis para decodificar pesos cuantizados.

## Benchmarks y rendimiento

| Perfil | k, v, o | q | gate, up | down | Bits/peso | KL vs BF16 | Acuerdo top-1 |
|---|---|---|---|---|---|---|---|
| bit217 | K4 | K2 | K2 | K2 | 2,17 | 0,385 | 78,0 % |
| bit245 | K4 | K2 | K2 | K3 | 2,45 | 0,265 | 81,8 % |
| bit309 | K4 | K3 | K3 | K3 | 3,09 | 0,093 | 89,0 % |

Las métricas KL y acuerdo top-1 se calculan por token frente a BF16 sobre 131.000 tokens retenidos, decodificados desde estos ficheros con la tabla de embeddings por capa a K4. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 12,3 GB y los bits por peso de las lineales codificadas varían entre 2,17 y 3,09 según perfil, con el resto de tensores en BF16.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU consumer: no disponible; depende del tamaño total del modelo base Gemma 4 E4B, que no se especifica.
- Opciones de despliegue: librería trellis (formato exlr8); no se indican vLLM, llama.cpp, Ollama ni TGI en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kindlingai/gemma-4-e4b-exlr8 | no disponible | no disponible | Trellis 2-4 bits (exlr8) | Apache 2.0 | Hugging Face (3.728 descargas) |
| google/gemma-4-E4B-it | no disponible | no disponible | BF16 (referencia) | Gemma 4 license | Hugging Face |
| Otras variantes cuantizadas de Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: incluso el perfil bit309 presenta una KL de 0,093 y un acuerdo top-1 del 89,0 % frente a BF16, por lo que no reproduce exactamente las salidas del modelo original.
- El perfil bit217, con 2,17 bits por peso, tiene un acuerdo top-1 del 78,0 %, lo que implica una pérdida de fidelidad significativa para tareas sensibles.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto o idioma específicas de esta variante.
- La licencia Apache 2.0 se aplica junto con la Gemma 4 license del modelo fuente; deben revisarse ambas para uso comercial.
- El formato exlr8 requiere la librería trellis para decodificar los pesos, lo que limita la compatibilidad con toolchains estándar.
- No se especifican parámetros totales, contexto ni idiomas, lo que dificulta planificar el despliegue.
- El modelo tiene 0 likes y 3.728 descargas, con fecha de creación y actualización el 21 de noviembre de 2026; es una publicación reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kindlingai/gemma-4-e4b-exlr8
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
