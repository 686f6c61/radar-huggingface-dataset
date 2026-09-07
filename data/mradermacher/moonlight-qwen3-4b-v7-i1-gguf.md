# mradermacher/moonlight-qwen3-4b-v7-i1-GGUF

## Resumen

`mradermacher/moonlight-qwen3-4b-v7-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo `moonlight-labs/moonlight-qwen3-4b-v7`, un ajuste fino de Qwen3-4B desarrollado por moonlight-labs. El cuantizado ha sido realizado por mradermacher, un autor especializado en generar versiones GGUF de modelos open source. El modelo base está etiquetado como orientado a privacidad, edge AI y local AI, con soporte para inglés e hindi, incluyendo la variante roman-hinglish (hindi escrito en alfabeto latino). Esta versión cuantizada está pensada para facilitar la ejecución local en hardware de consumo, reduciendo los requisitos de memoria sin necesidad de un datacenter.

El modelo tiene 4.022.468.096 parámetros (aproximadamente 4B), lo que lo sitúa en la categoría de modelos pequeños. Al estar basado en Qwen3, su arquitectura es un transformer denso, aunque no se dispone de información detallada sobre la configuración exacta del ajuste fino. La cuantización imatrix incluye un archivo de matriz de importancia y múltiples niveles de compresión, desde IQ1_S hasta Q6_K, lo que permite elegir entre calidad y tamaño según el hardware disponible. Su relevancia actual radica en la creciente demanda de modelos que puedan ejecutarse en dispositivos locales, en entornos con restricciones de privacidad o sin conexión, y que a la vez cubran idiomas como el hindi, a menudo infrarrepresentados en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 4.022.468.096 (4.02B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF imatrix (i1): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en), hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix separado) |

## Arquitectura y entrenamiento

El modelo base `moonlight-qwen3-4b-v7` es un ajuste fino de Qwen3-4B, un transformer denso de aproximadamente 4.000 millones de parámetros. No se han publicado detalles sobre la configuración exacta del entrenamiento, como el número de tokens, la composición del dataset o si se emplearon técnicas de alineación como RLHF o DPO. Las etiquetas del modelo sugieren un enfoque en privacidad, ejecución en el borde y uso local, así como un énfasis en la combinación de inglés e hindi, especialmente en la variante roman-hinglish.

La cuantización realizada por mradermacher utiliza el método imatrix, que genera un archivo de matriz de importancia a partir de un conjunto de datos de calibración. Este archivo permite crear cuantizaciones de mayor calidad para una misma tasa de compresión. El repositorio incluye tanto el archivo imatrix como múltiples niveles de cuantización, desde extremadamente comprimidos (IQ1_S, aproximadamente 1.2 GB) hasta casi sin pérdida (Q6_K, aproximadamente 3.4 GB). La técnica imatrix es especialmente útil para modelos pequeños, donde la pérdida de precisión por cuantización puede degradar notablemente la calidad de salida.

## Capacidades

- Generación de texto y conversación en inglés y hindi, con atención especial a la variante roman-hinglish (hindi en alfabeto latino), según las etiquetas del modelo.
- Optimizado para ejecución local y en el borde, con un enfoque en privacidad al no requerir llamadas a servicios externos.
- Soporte multilingüe limitado a inglés e hindi; no se mencionan otros idiomas.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se han documentado capacidades de visión, audio o generación de imágenes.
- La cuantización imatrix preserva razonablemente la calidad en los niveles intermedios (Q4_K_M, Q5_K_M), aunque los niveles extremadamente bajos (IQ1, IQ2) presentan una degradación notable.

## Casos de uso

- Asistente local en hindi romanizado: el modelo puede gestionar conversaciones en hindi escrito con caracteres latinos, lo que resulta útil para usuarios que prefieren este formato en aplicaciones de mensajería o soporte. Su tamaño reducido permite ejecutarlo en un portátil o en un servidor doméstico sin conexión a internet.
- Chatbot de atención al cliente en inglés para entornos sin conexión: gracias a su licencia Apache-2.0 y a la posibilidad de cuantizarlo a 2-3 GB, puede desplegarse en la infraestructura de una empresa para responder consultas frecuentes sin enviar datos a la nube, cumpliendo requisitos de privacidad.
- Procesamiento de texto en dispositivos móviles: las cuantizaciones más pequeñas (IQ2, IQ3) rondan los 1.5-2.0 GB, lo que permite su ejecución en teléfonos de gama alta mediante runtimes como llama.cpp o aplicaciones nativas, para tareas de autocompletado o resumen de texto.
- Edge AI en dispositivos IoT: el modelo puede integrarse en gateways o dispositivos con GPU limitada para realizar clasificación de texto o extracción de información en tiempo real, reduciendo la latencia al eliminar la dependencia de servicios remotos.
- Generación de contenido en hindi para redes sociales: un desarrollador puede usar el modelo para crear borradores de publicaciones o respuestas en hindi, aprovechando su conocimiento del idioma y de la variante romanizada, sin coste por API.
- Aplicaciones de mensajería privada: al ejecutarse localmente, el modelo puede servir como asistente de redacción dentro de una app de chat, asegurando que los mensajes no salgan del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M (2.6 GB) se necesitan aproximadamente 4-5 GB de VRAM, incluyendo el buffer de contexto. Con Q6_K (3.4 GB) se recomiendan al menos 6 GB. Las cuantizaciones IQ2 pueden funcionar con 2-3 GB de VRAM, aunque con pérdida de calidad.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB, RTX 4090, o cualquier GPU con 6 GB o más de VRAM. También puede ejecutarse en CPU con llama.cpp, aunque la velocidad será inferior.
- Sí cabe en GPUs de consumo; las cuantizaciones más pequeñas (IQ1, IQ2) pueden incluso ejecutarse en dispositivos con memoria unificada como Apple Silicon o en móviles de gama alta.
- Opciones de despliegue: llama.cpp, Ollama, y otros runtimes compatibles con GGUF. También se puede usar vLLM en versiones recientes que soportan GGUF, aunque el rendimiento óptimo se obtiene con safetensors en formato original.
- Latencia y throughput: no disponible. Depende del hardware, la cuantización y el tamaño del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| moonlight-qwen3-4b-v7-i1-GGUF | 4.02B | No disponible | Apache-2.0 | GGUF imatrix | Fine-tune de Qwen3-4B, enfocado en inglés e hindi, orientado a privacidad |
| Qwen3-4B (base) | 4B | No disponible | Apache-2.0 | Safetensors, GGUF | Modelo base sin ajuste fino; capacidades generales en varios idiomas |
| Llama 3.2 3B | 3.21B | No disponible | Llama 3.2 Community License | Safetensors, GGUF | Modelo pequeño de Meta, bueno para tareas generales, sin enfoque específico en hindi |
| Gemma 2 2B | 2.6B | No disponible | Gemma Terms of Use | Safetensors, GGUF | Modelo compacto de Google, adecuado para edge, pero con menos parámetros |

No se dispone de datos de benchmarks para comparar el rendimiento real entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser un ajuste fino basado en Qwen3, puede heredar sesgos del modelo base y de los datos de entrenamiento específicos.
- Riesgo de alucinacion: presente en todos los modelos de lenguaje; no se ha evaluado la tasa de alucinación en esta variante.
- Limitaciones de idioma: solo soporta inglés e hindi; cualquier otro idioma producirá resultados de baja calidad o incorrectos.
- La cuantización imatrix en niveles extremadamente bajos (IQ1, IQ2) puede degradar significativamente la calidad de salida, especialmente en tareas de razonamiento o generación estructurada.
- No se ha confirmado el soporte para tool calling, agentes o funciones avanzadas, a pesar de que Qwen3 base sí las incluye. El ajuste fino podría haberlas alterado.
- La licencia Apache-2.0 permite uso comercial y modificación, pero se recomienda revisar los términos completos y verificar la procedencia del modelo base.
- No existen datos verificables sobre el rendimiento en tareas específicas, por lo que se aconseja realizar pruebas propias antes de usarlo en producción.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mradermacher/moonlight-qwen3-4b-v7-i1-GGUF
- Modelo base: https://huggingface.co/moonlight-labs/moonlight-qwen3-4b-v7
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Página de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
