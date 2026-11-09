# APLUX-Agora/opus-mt-en-zh

## Resumen

`opus-mt-en-zh` es un paquete de recursos de despliegue publicado por APLUX-Agora para ejecutar en hardware Qualcomm un modelo de traducción automática inglés-chino basado en la arquitectura MarianMT de Helsinki-NLP (familia OPUS-MT). No se trata de un modelo entrenado desde cero por APLUX, sino de una conversión del modelo original a formatos ejecutables en placas con DSP/NPU Qualcomm (QNN), empaquetada junto con el runner, el preprocesado y el postprocesado necesarios para inferencia en dispositivo.

El repositorio contiene artefactos compilados por SoC objetivo. La única plataforma medida y publicada en la model card es QCS8550 sobre la placa Rhino Pi X1, con precisión FP16 y una latencia de 32,7 ms por inferencia. El modelo ejecuta el codificador completo y un decodificador palabra a palabra (autoregresivo token a token), lo que condiciona la latencia final en función de la longitud de la secuencia de salida.

Su relevancia es acotada pero específica: cubre el nicho de traducción EN-ZH en el edge (AIoT) sobre aceleradores Qualcomm, un escenario donde las alternativas habituales (ejecutar MarianMT en CPU con ONNX Runtime o llama.cpp) no aprovechan la NPU del SoC. El tamaño del repo (0,3 GB) es coherente con un modelo Marian de decenas de millones de parámetros más los binarios compilados por precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT, familia OPUS-MT); empaquetado como binario QNN para Qualcomm |
| Parámetros totales | no disponible (el modelo original OPUS-MT en-zh ronda las decenas de millones; el autor no publica la cifra) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (única precisión publicada y medida) |
| Idiomas soportados | inglés (entrada) y chino (salida) |
| Licencia | APLUX Model Farm License (`license_name: aplux-model-farm`), con remisión a los términos del modelo original |
| Formato de pesos | binarios QNN (`model.bin`, `model.json` por SoC y precisión); no se distribuyen safetensors ni GGUF |
| SoC objetivo | QCS8550 (placa Rhino Pi X1) |
| Entradas / salidas | texto → texto y JSON (`out`) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder de traducción automática de la familia OPUS-MT (MarianMT), entrenado originalmente por Helsinki-NLP sobre corpus paralelos de OPUS. El codificador procesa la frase completa en inglés y el decodificador genera la traducción en chino de forma autorregresiva, token a token, tal como indica la model card ("完整编码器和逐词解码器"). APLUX no documenta el proceso de entrenamiento, los datos utilizados ni si hubo ajuste fino posterior; esa información corresponde al modelo original y no se reproduce en este repositorio.

La aportación técnica del paquete es la conversión y compilación a QNN para ejecución en la NPU/Hexagon del QCS8550, junto con el runner y las etapas de preprocesado (tokenización) y postprocesado (detokenización y serialización a JSON) exportadas como proyecto desplegable. No se documentan innovaciones de decodificación (búsqueda especulativa, beam search optimizado) ni detalles sobre el grafo compilado.

## Capacidades

- Traducción automática directa de inglés a chino, frase a frase.
- Ejecución completa en dispositivo sobre la NPU Qualcomm del QCS8550, sin dependencia de servicios en la nube.
- Salida en texto plano y en JSON estructurado (campo `out`), lo que facilita su integración en pipelines.
- Preprocesado y postprocesado incluidos en el paquete, junto con el runner de inferencia.
- Sin soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Sin capacidades multilingües más allá del par EN-ZH declarado.

## Casos de uso

- Traducción local en dispositivos AIoT: integrar el paquete en una placa QCS8550 para traducir interfaces, avisos o contenido EN-ZH sin conexión a internet, aprovechando la latencia de 32,7 ms medida.
- Subtitulado y transcripción en tiempo casi real: con 32,7 ms por inferencia en FP16, el cuello de botella pasa a ser la longitud de la secuencia generada, no el coste por paso del decodificador; adecuado para frases cortas en kioscos o pantallas interactivas.
- Preprocesado de datos en el edge: normalizar o traducir textos en inglés a chino antes de enviarlos a un backend, reduciendo ancho de banda y exposición de datos.
- Asistentes de atención al cliente embebidos: traducir consultas EN a ZH en terminales de punto de venta o paneles industriales con conectividad limitada.
- Documentación técnica y manuales: traducción por lotes de cadenas de interfaz o fichas de producto en un pipeline local, con salida JSON para consumo directo por otras herramientas.
- Pruebas de conformidad y validación de despliegues QNN: usar el paquete como referencia para medir latencia y verificar el flujo completo (preprocesado, inferencia, postprocesado) en placas Qualcomm antes de portar modelos mayores.

## Benchmarks y rendimiento

| Métrica | Valor | Plataforma |
|---|---|---|
| Latencia por inferencia (FP16) | 32,7 ms | QCS8550 · Rhino Pi X1 |
| Calidad de traducción (BLEU, COMET, etc.) | no disponible | — |
| Throughput (frases/s) | no disponible | — |

No se han publicado resultados de benchmarks de calidad en la información disponible. La única cifra de rendimiento publicada es la latencia de 32,7 ms en la placa indicada, sin especificar longitud de frase ni número de tokens generados, por lo que no es directamente comparable con otras implementaciones.

## Requisitos de hardware

- Hardware objetivo: SoC Qualcomm QCS8550; el repositorio solo incluye binarios para `targets/QCS8550/`.
- VRAM/RAM: no disponible; el paquete está pensado para memoria unificada del SoC, no para GPU de escritorio.
- GPU de escritorio (A100, H100, RTX 4090): no soportadas por estos binarios; requerirían el modelo original en otro formato.
- Opciones de despliegue: runner de Agora y proyecto exportable desde la plataforma (https://mega.aidlux.com/models/opus-mt-en-zh); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Descarga selectiva por SoC mediante `hf download --include "targets/$AGORA_SOC/*"`.
- Latencia medida: 32,7 ms en FP16 sobre QCS8550; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue edge Qualcomm | Calidad EN-ZH |
|---|---|---|---|---|---|
| APLUX-Agora/opus-mt-en-zh | no disponible | no disponible | APLUX Model Farm | Sí (QCS8550, QNN) | no disponible |
| Helsinki-NLP/opus-mt-en-zh (original) | no disponible en la información | no disponible | según modelo original | No (requiere conversión) | no disponible |
| Otros paquetes QNN de traducción en Agora | no disponible | no disponible | APLUX Model Farm | Sí | no disponible |

No se dispone de datos de benchmarks que permitan comparar calidad de traducción con alternativas. La comparación relevante es de formato y plataforma: frente al modelo original de Helsinki-NLP, este paquete añade binarios QNN y un runner listo para QCS8550, a costa de quedar atado a esa plataforma y a la licencia APLUX Model Farm para los artefactos convertidos.

## Limitaciones y advertencias

- Solo se publican binarios para QCS8550; no hay rutas para otras NPU ni para GPU/CPU convencionales.
- La licencia de los recursos convertidos es la APLUX Model Farm License, distinta de la del modelo original; es imprescindible revisar `LICENSE_MODEL_FARM.pdf`, `NOTICE.md` y `SHA256SUMS` antes de cualquier uso comercial.
- La model card remite a los términos del modelo fuente para el modelo original; la combinación de ambas licencias debe verificarse caso por caso.
- No se documentan datos de entrenamiento, composición del corpus ni evaluación de sesgos; los sesgos del modelo original se heredan sin mitigación conocida.
- Riesgo de alucinación y de traducciones incorrectas inherente a un modelo Marian de tamaño moderado, especialmente en frases largas, terminología técnica y dominios especializados.
- El decodificador es autorregresivo token a token: la latencia de 32,7 ms corresponde a la medición publicada sin detallar la longitud de salida, por lo que frases largas tardarán proporcionalmente más.
- Sin información sobre longitud máxima de contexto ni sobre el manejo de entradas que la excedan.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado ni histórico de uso que permita validar la reproducibilidad de la medición.
- La fecha de creación indicada (2026-11-09) es posterior a la de esta ficha; conviene verificar la vigencia de los artefactos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/opus-mt-en-zh
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/opus-mt-en-zh/blob/main/LICENSE_MODEL_FARM.pdf
- Plataforma Agora (modelo y demo online): https://mega.aidlux.com/models/opus-mt-en-zh
- Portal Agora: https://mega.aidlux.com
- Modelo original de referencia (familia OPUS-MT, Helsinki-NLP): https://huggingface.co/Helsinki-NLP/opus-mt-en-zh
