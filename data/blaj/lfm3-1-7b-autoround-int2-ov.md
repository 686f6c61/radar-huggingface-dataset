# blaj/LFM3-1.7B-AutoRound-int2-ov

## Resumen

LFM3-1.7B-AutoRound-int2-ov es una compilación en formato OpenVINO IR del modelo LiquidAI/LFM3-1.7B, cuantizado a 2 bits mediante AutoRound (group size 128, simétrico, RTN) e integrado directamente en el grafo oficial fp16 de OpenVINO. El autor del artefacto es blaj, no LiquidAI, y el modelo se distribuye como pesos u2 empaquetados con escalas por grupo, sin recuantización posterior.

El modelo base, LFM3-1.7B, pertenece a la familia LFM3 de Liquid AI y se orienta a inferencia eficiente en entornos con recursos limitados. La versión aquí descrita reduce drásticamente el espacio de pesos para despliegue en CPU, iGPU o NPU mediante el runtime de OpenVINO, a costa de una precisión numérica muy agresiva (2 bits).

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización extrema, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin licencia explícita y sin idiomas declarados. Es un artefacto experimental de despliegue, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3-1.7B de Liquid AI; detalles arquitectónicos del base no disponibles en la información proporcionada) |
| Parámetros totales | 1.700 millones (según el nombre del modelo base; no confirmado en la información disponible) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int2 (AutoRound, group size 128, simétrico, RTN), pesos empaquetados como u2 con escalas por grupo; grafo OpenVINO IR derivado de fp16 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | OpenVINO IR (custom_code), librería openvino; repo de 0,9 GB |

## Arquitectura y entrenamiento

El artefacto no entrena ni afina el modelo: parte del grafo fp16 oficial OpenVINO/LFM3-1.7B-fp16-ov y sustituye los pesos por constantes u2 empaquetadas con escalas por grupo, generadas con auto-round 0.17.0. La cuantización es de tipo RTN (round-to-nearest) simétrica con group size 128, aplicada directamente al grafo, según la model card.

No se dispone de información sobre la composición del dataset de entrenamiento del modelo base, número de tokens, uso de RLHF/DPO ni innovaciones técnicas del LFM3-1.7B original. La única innovación documentada en este artefacto es la integración de pesos int2 empaquetados en el grafo OpenVINO IR sin recuantización secundaria.

## Capacidades

- Generación de texto heredada del modelo base LFM3-1.7B; el alcance exacto de capacidades (razonamiento, código, matemáticas, vision) no está detallado en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la información.
- Despliegue optimizado para runtime OpenVINO con pesos int2 empaquetados.

## Casos de uso

- Inferencia en CPU sin GPU dedicada: el formato OpenVINO IR con pesos int2 permite ejecutar el modelo en equipos con solo CPU, usando el runtime de OpenVINO y un repo de 0,9 GB.
- Despliegue en iGPU Intel: OpenVINO puede asignar el grafo a iGPU integradas, útil para portátiles y mini-PC sin GPU discreta.
- Pruebas de estrés de cuantización extrema: útil para investigadores que evalúan la degradación de calidad de int2 frente a int4/int8 en el mismo grafo OpenVINO.
- Prototipado de asistentes locales de bajo consumo: el tamaño reducido permite iterar rápido en entornos de escritorio con recursos limitados.
- Evaluación de pipelines AutoRound: sirve como referencia para reproducir el flujo auto-round 0.17.0 sobre grafos OpenVINO fp16.
- Despliegue en NPU Intel compatible con OpenVINO: candidato para escenarios de inferencia de baja potencia, sujeto a validación de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repo ocupa 0,9 GB, lo que sugiere huella de pesos muy reducida, pero no se documentan requisitos de memoria en ejecución.
- GPU recomendadas: no disponibles en la información; el formato OpenVINO está orientado a CPU, iGPU y NPU Intel.
- ¿Cabe en consumer GPU? No se dispone de datos; por tamaño de repo (0,9 GB) es plausible, pero no está confirmado.
- Opciones de despliegue: runtime OpenVINO (librería declarada: openvino); vLLM, llama.cpp, Ollama y TGI no están indicados como compatibles en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blaj/LFM3-1.7B-AutoRound-int2-ov | 1.700 M (base) | no disponible | int2 (AutoRound) | no disponible | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1.700 M | no disponible | fp16 / otras | no disponible en esta ficha | Hugging Face |
| OpenVINO/LFM3-1.7B-fp16-ov | 1.700 M | no disponible | fp16 | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento para comparar calidad entre estas variantes.

## Limitaciones y advertencias

- La cuantización int2 con group size 128 es extremadamente agresiva; cabe esperar degradación de calidad frente a fp16, int8 o int4, aunque no se aportan métricas.
- No se declara licencia; el uso comercial queda sin base legal explícita hasta verificar la licencia del modelo base LiquidAI/LFM3-1.7B.
- No se declaran idiomas soportados ni pipeline; el artefacto no está validado como modelo de producción.
- Riesgo de alucinación no evaluado en la información disponible.
- Artefacto con 0 descargas y 0 likes; sin evidencia de uso comunitario ni validación externa.
- Requiere código personalizado (custom_code) y la librería openvino; la portabilidad a otros runtimes no está garantizada.
- No se documentan sesgos conocidos del modelo base en la información proporcionada.

## Enlaces

- [blaj/LFM3-1.7B-AutoRound-int2-ov en Hugging Face](https://huggingface.co/blaj/LFM3-1.7B-AutoRound-int2-ov)
- [Modelo base LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B)
- [Grafo fp16 OpenVINO/LFM3-1.7B-fp16-ov](https://huggingface.co/OpenVINO/LFM3-1.7B-fp16-ov)
