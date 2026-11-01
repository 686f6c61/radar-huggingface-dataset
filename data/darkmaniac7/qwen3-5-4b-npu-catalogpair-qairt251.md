# darkmaniac7/Qwen3.5-4B-NPU-catalogpair-qairt251

## Resumen

Qwen3.5-4B-NPU-catalogpair-qairt251 es un paquete de inferencia para NPU derivado de Qwen3.5-4B, publicado por TokForge (cuenta `darkmaniac7`) para ejecutar el modelo en moviles con Snapdragon. No es un modelo nuevo ni un ajuste fino: es una exportacion de los pesos int4 del modelo original compilados como context binaries de QNN para el Hexagon NPU de Qualcomm, con el objetivo de acelerar el procesamiento de prompts largos en el dispositivo. El paquete se apoya en una descarga concreta del modelo en formato MNN y solo funciona emparejado con ella.

La arquitectura subyacente es la de Qwen3.5-4B, un transformer de 4.000 millones de parametros con 32 capas que combina atencion lineal y atencion completa (hibrida). El paquete NPU contiene 49 grafos compilados que cubren las proyecciones, los bloques MLP y la mayoria de las normas de las 32 capas; las 24 cabezas de atencion lineal y las 8 de atencion completa con su cache key/value se ejecutan en CPU durante la pasada de prompt, y la generacion de cada token de respuesta se hace siempre en CPU con la descarga emparejada, porque el paquete no incluye capa de salida.

Su relevancia es acotada pero concreta: demuestra un flujo de despliegue on-device con cuantizacion int4 en bloques de 64, compilacion con QAIRT 2.51.40.260930 y reparto explicito de trabajo entre NPU y CPU. Esta pensado exclusivamente para la app TokForge en Android/iOS y para tres chips Snapdragon concretos, por lo que no es utilizable como modelo de proposito general fuera de ese entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y atencion completa (32 capas), exportado a grafos QNN para Hexagon NPU |
| Parametros totales | 4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el paquete procesa prompts por trozos de 128 tokens en NPU) |
| Tipos de cuantizacion | int4 en bloques de 64 (escalas y offsets redondeados a fp16); activaciones fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QNN context binaries (`qnn/graph0.bin` a `qnn/graph48.bin`), grafo MNN (`qnn/llm.mnn`), configuraciones JSON y `MANIFEST.json` |
| Tamano del repo | 6,2 GB |
| Chips soportados | Snapdragon 8 Elite Gen 5 (SM8850, Hexagon V81), Snapdragon 8 Elite (SM8750, Hexagon V79), Snapdragon 8 Gen 3 (SM8650, Hexagon V75) |
| Runtime requerido | QAIRT 2.51.40.260930 (incluido en TokForge desde la version 1.3.9.6) |
| Memoria adicional en NPU | ~4,63 GB (SM8850), ~4,34 GB (SM8750), ~4,63 GB (SM8650) |
| Descarga por chip | 2,09 GB (v81), 2,08 GB (v79), 2,08 GB (v75) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer de 32 capas que alterna atencion lineal y atencion completa. El paquete no reentrena ni modifica los pesos: parte de la conversion MNN `taobao-mnn/Qwen3.5-4B-MNN` y exporta los mismos codigos int4 en bloques de 64 de las 32 capas, redondeando unicamente escalas y offsets a fp16. La exportacion se hizo con `llmexport` de la rama MNN de TokForge (commit `ff4e17202305`), con activaciones fp16, tablas rotatorias alimentadas como entradas fp32 y el grafo cortado antes de la capa de salida.

La compilacion usa `compilefornpu`, que divide las 32 capas en 49 grafos NPU con puntos de corte en 24 rupturas de atencion lineal y 40 rupturas escalares, cada una con una forma de chunk de 128 filas y una forma de 1 fila. El SDK Qualcomm AI Engine Direct de QAIRT 2.51.40.260930 compila cada grafo en un context binary por chip con opciones HTP estrictas: nivel de optimizacion 3, precision relajada fp16, sigmoid de alta precision, fusion avanzada de activaciones desactivada, 8 MB de VTCM y 4 hilos HVX. No hay datos disponibles sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto en el dispositivo mediante la app TokForge, con el modelo base Qwen3.5-4B.
- Aceleracion del procesamiento de prompts largos en la NPU del telefono; la generacion de respuestas se ejecuta en CPU.
- Reparto automatico de carga: si el prompt es corto se queda en CPU; si la NPU se detiene durante una respuesta, la CPU la termina.
- Verificacion de integridad del paquete en el dispositivo antes de usarlo (`MANIFEST.json` con sha256 y tamanos, `SHA256SUMS`).
- Emparejamiento por hash con una descarga exacta del modelo MNN, lo que evita mezclar pesos incompatibles.
- Capacidades del modelo base (razonamiento, codigo, matematicas, multilingue, tool calling) no documentadas en esta ficha: no disponible.

## Casos de uso

- Asistentes conversacionales offline en movil: el paquete permite que un Snapdragon procese prompts largos en la NPU mientras la CPU genera la respuesta, reduciendo la latencia percibida en conversaciones multi-turno dentro de la app TokForge.
- Procesamiento de documentos largos en el dispositivo: gracias al reparto NPU/CPU, se pueden introducir prompts extensos (por ejemplo, resumenes de articulos o contratos) sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Aplicaciones de accesibilidad: dictado o lectura asistida con generacion de texto local en telefonos de gama alta, sin depender de conectividad.
- Demostraciones y evaluaciones de inferencia on-device: util para investigadores que quieran medir el rendimiento de Qwen3.5-4B int4 sobre Hexagon V75/V79/V81 con QAIRT 2.51 y comparar con ejecuciones puramente en CPU.
- Integracion en flujos de trabajo de TokForge: el paquete se descarga solo cuando el usuario activa la opcion NPU para este modelo, por lo que sirve como componente de un pipeline de despliegue movil ya existente.
- Pruebas de compatibilidad de hardware: permite validar en que chips y versiones de la app funciona el runtime QAIRT requerido antes de desplegar una build.
- Escenarios de privacidad estricta: al no requerir subir el prompt a un servidor, encaja en aplicaciones medicas, legales o financieras que procesan texto sensible en el propio dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta medidas de memoria del paquete NPU (4,63 GB en SM8850, 4,34 GB en SM8750, 4,63 GB en SM8650) y tamanos de descarga por chip; no hay datos de latencia, throughput ni calidad.

## Requisitos de hardware

- VRAM: no aplica; el paquete esta disenado para NPU movil, no para GPU de escritorio.
- Memoria en el dispositivo: aproximadamente 4,6 GB adicionales para la parte NPU, ademas del modelo base descargado. TokForge activa la NPU solo si el telefono tiene espacio para ambos.
- Chips compatibles: Snapdragon 8 Elite Gen 5 (SM8850, Hexagon V81), Snapdragon 8 Elite (SM8750, Hexagon V79) y Snapdragon 8 Gen 3 (SM8650, Hexagon V75). No funciona en otros SoC.
- Runtime: QAIRT 2.51.40.260930, incluido en TokForge desde la version 1.3.9.6. Versiones anteriores de la app no pueden usar el paquete.
- Despliegue: exclusivamente dentro de la app TokForge (Google Play y TestFlight para iOS). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-NPU-catalogpair-qairt251 | 4B | no disponible | QNN context binaries (int4) | Apache 2.0 | Solo app TokForge, chips Snapdragon concretos |
| Qwen3.5-4B (base) | 4B | no disponible | safetensors | Apache 2.0 | HuggingFace, uso general |
| Qwen3.5-4B-MNN (taobao-mnn) | 4B | no disponible | MNN (int4) | Apache 2.0 | HuggingFace, inferencia MNN en CPU/GPU |
| Qwen3.5-4B-NPU-catalogpair (QAIRT 2.40) | 4B | no disponible | QNN context binaries (8-bit) | Apache 2.0 | Solo app TokForge, misma familia de chips |

La comparativa se limita a variantes del mismo modelo base, ya que el paquete no es un modelo autonomo. Frente a la version MNN, este paquete anade aceleracion NPU para el prompt pero mantiene la generacion en CPU y exige un runtime y hardware especificos. Frente a la build QAIRT 2.40, cambia los pesos de 8 bits a int4 y el runtime a QAIRT 2.51.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere la descarga exacta `darkmaniac7/Qwen3.5-4B-MNN` en el commit `85364606553d` (o uno posterior con los mismos ficheros de modelo) y la app TokForge.
- El paquete no incluye capa de salida ni fichero de pesos propio: la generacion de cada token se hace en CPU con la descarga emparejada, por lo que la aceleracion NPU solo cubre la pasada de prompt.
- Compatibilidad muy restringida: solo tres chips Snapdragon y QAIRT 2.51.40.260930; cualquier otra combinacion de hardware o version de app inutiliza el paquete.
- Consumo de memoria elevado para movil: ~4,6 GB adicionales sobre el modelo base, lo que limita su uso a dispositivos de gama alta con RAM suficiente.
- Los prompts cortos no usan la NPU; el beneficio solo aparece con prompts largos.
- No hay informacion sobre sesgos, alucinacion, idiomas soportados ni calidad de generacion del modelo base en esta ficha; esos riesgos deben evaluarse sobre Qwen3.5-4B.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue practico queda atado a la app TokForge y a su runtime propietario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- HuggingFace del paquete: https://huggingface.co/darkmaniac7/Qwen3.5-4B-NPU-catalogpair-qairt251
- Descarga emparejada requerida: https://huggingface.co/darkmaniac7/Qwen3.5-4B-MNN/tree/85364606553d2ece47af5b3ed850a8832e1da0e8
- Conversion MNN original: https://huggingface.co/taobao-mnn/Qwen3.5-4B-MNN
- Build QAIRT 2.40 con pesos de 8 bits: https://huggingface.co/darkmaniac7/Qwen3.5-4B-NPU-catalogpair
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion Qwen: https://huggingface.co/Qwen
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
