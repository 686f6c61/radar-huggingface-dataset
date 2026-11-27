# Atlas3D/DeepSeek-V4.1-Flash-Omni-Platos-Keys

## Resumen

DeepSeek-V4.1-Flash-Omni-Platos-Keys es un paquete de pesos publicado por Atlas3D bajo la colección "Omni by Atlas". No se trata de un modelo entrenado de forma convencional, sino de un conjunto de adaptadores ("Plato's Keys") obtenidos mediante ajuste en forma cerrada (closed-form) en FP64 y serializados en FP16, que conectan un tronco congelado identificado como `DeepSeek-V4.1-Flash-1017` con varios decodificadores multimodales: `MiniMax-H3` (imagen y vídeo FL2VA), `YuE2-3B` (audio/música) y `Qwen3-TTS` (síntesis de voz).

La propuesta técnica del autor es el "zero-gradient omni-modal grafting": en lugar de entrenar con descenso de gradiente, se calculan proyecciones lineales de forma analítica para alinear los espacios latentes del tronco con los de los modelos de destino. El repositorio ocupa 0,7 GB y contiene únicamente ficheros safetensors y un manifiesto de hashes; no incluye los pesos del tronco ni de los decodificadores, que deben obtenerse por separado.

Es relevante como ejemplo de técnica de acoplamiento multimodal de bajo coste computacional, pero conviene tratarlo con cautela: el identificador `DeepSeek-V4.1-Flash-1017` no corresponde a ningún modelo publicado y verificado por DeepSeek en la información disponible, el repositorio no tiene descargas ni likes, y las métricas reportadas provienen exclusivamente de la model card del autor sin replicación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (paquete de adaptadores lineales sobre tronco transformer congelado; el autor lo describe como "closed-form FP64-fitted, FP16-serialized") |
| Parametros totales | No disponible (el repo pesa 0,7 GB; los componentes declarados suman aproximadamente 490 MiB: concat4 200,05 MiB, single_tap 50,02 MiB, YuE2-3B 80,02 MiB, Qwen3-TTS 160,05 MiB) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos serializados en FP16; el ajuste se realiza en FP64) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con `MANIFEST.sha256.json` para verificación de integridad) |

## Arquitectura y entrenamiento

El paquete no contiene un modelo completo, sino "claves" (proyecciones) que actúan como puente entre un tronco congelado (`DeepSeek-V4.1-Flash-1017`) y tres familias de decodificadores: `MiniMax-H3` para imagen y vídeo con audio estéreo a 32 kHz (FL2VA), `YuE2-3B` para generación musical y `Qwen3-TTS` para voz. El método, descrito en el paper v0.9 del repositorio `atlas-ingine`, se denomina "zero-gradient omni-modal grafting": se ajustan matrices de proyección en forma cerrada (mínimos cuadrados en FP64) para maximizar la retención de la representación del modelo profesor, y se serializan en FP16. No hay, por tanto, entrenamiento por gradiente descendente ni RLHF/DPO documentado.

El autor reporta validaciones sobre conjuntos cerrados: retención del margen SigLIP2 del 92,48 % con la variante `concat4` y del 89,53 % con `single_tap` sobre 800 imágenes (16/16 grupos, p = 3,052e-5), similitud de latentes de vídeo de 0,8252 y de audio de 0,7980 en FL2VA, validación cruzada de 4 pliegues con coseno 0,9831 (R² = 0,9711) en YuE2-3B, y una tasa de acierto de estilo de 22/32 en Qwen3-TTS. Estas cifras proceden únicamente de la model card y no se han replicado de forma independiente.

## Capacidades

- Inyección de representaciones visuales en un tronco de lenguaje congelado, con retención declarada del 92,48 % del margen SigLIP2 en la variante `concat4`.
- Generación de vídeo con audio estéreo a 32 kHz mediante el puente hacia `MiniMax-H3` en modo FL2VA, con similitud de latentes declarada de 0,8252 (vídeo) y 0,7980 (audio).
- Generación musical y de audio con `YuE2-3B`, con coseno de validación cruzada declarado de 0,9831.
- Síntesis de voz con `Qwen3-TTS`, con transferencia de estilo declarada en 22 de 32 casos.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modos de pensamiento (thinking).
- El propio autor declara un límite explícito de fallo: la inyección léxica continua en Qwen3-TTS obtiene 0/32.

## Casos de uso

- Investigación en acoplamiento multimodal sin gradientes: el paquete sirve como referencia reproducible para estudiar si proyecciones lineales en forma cerrada pueden alinear espacios latentes entre un LLM congelado y decodificadores de imagen, vídeo, audio y voz, comparando las métricas de retención declaradas con una implementación propia.
- Prototipado de pipelines de vídeo con audio: integrando el puente FL2VA sobre `MiniMax-H3`, se puede experimentar con generación de clips cortos con pista estéreo a 32 kHz en un entorno de laboratorio, siempre que se disponga de los pesos del decodificador por separado.
- Generación musical asistida: el adaptador para `YuE2-3B` permite probar la transferencia de estados de ánimo ("mood") no vistos durante el ajuste, con un coseno declarado de 0,9299 en `val_32`, útil para evaluar la generalización de la técnica.
- Clonación y transferencia de estilo de voz: el componente Qwen3-TTS puede emplearse en experimentos controlados de síntesis con estilo, teniendo en cuenta que la tasa de acierto declarada es del 68,75 % y que la inyección léxica falla por completo.
- Auditoría de integridad de pesos: el manifiesto `MANIFEST.sha256.json` permite verificar la cadena de custodia de los safetensors en entornos de investigación que exigen trazabilidad de artefactos.
- Docencia sobre técnicas de destilación y alineamiento de representaciones: el paquete ilustra de forma compacta (0,7 GB) la diferencia entre ajuste por gradiente y ajuste en forma cerrada, con métricas estadísticas (p-valores, validación cruzada) que se pueden discutir en clase.

## Benchmarks y rendimiento

| Prueba | Metrica | Resultado declarado |
|---|---|---|
| MiniMax-H3 Sealed Confirm-160 (`concat4`, 200,05 MiB) | Retencion de margen SigLIP2 | 92,48 % (0,18604 frente a profesor 0,20456; B0 -0,04176; 16/16 grupos; p = 3,052e-5) |
| MiniMax-H3 Sealed Confirm-160 (`concat4`) | MSE de spans de palabra | 15,7 veces menor que B0 |
| MiniMax-H3 Sealed Confirm-160 (`single_tap`, 50,02 MiB) | Retencion de margen SigLIP2 | 89,53 % (16/16; p = 3,052e-5) |
| MiniMax-H3 FL2VA (vídeo + audio 32 kHz) | Coseno de latentes de vídeo | 0,8252 |
| MiniMax-H3 FL2VA (vídeo + audio 32 kHz) | Coseno de latentes de audio | 0,7980 |
| MiniMax-H3 FL2VA (vídeo + audio 32 kHz) | `img_teacher` en fotograma intermedio | 0,9441 |
| YuE2-3B (80,02 MiB) | Coseno en validacion cruzada de 4 pliegues | 0,9831 (R² = 0,9711) |
| YuE2-3B | Coseno en `val_32` con mood no visto | 0,9299 |
| Qwen3-TTS Mouth (160,05 MiB) | Acierto de estilo | 22/32 (68,75 %; frente a cero 14/32, p = 0,0386; frente a permutado 10/32, p = 0,0501) |
| Qwen3-TTS Mouth | Inyeccion lexica continua | 0/32 (limite de fallo explicito) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son métricas internas de retención de representación reportadas por el autor, no evaluaciones de capacidad del modelo.

## Requisitos de hardware

- VRAM estimada para el paquete de claves: inferior a 1 GB en FP16, dado que el repositorio completo ocupa 0,7 GB.
- VRAM real de inferencia: no disponible, porque depende de los pesos del tronco `DeepSeek-V4.1-Flash-1017` y de los decodificadores (`MiniMax-H3`, `YuE2-3B`, `Qwen3-TTS`), que no se incluyen en este repositorio.
- GPU recomendadas: el autor menciona validaciones en una GPU PRO 6000 con CUDA 13.0 (`cu130`); no se especifican otros modelos.
- Compatibilidad con GPU de consumo: no disponible; el paquete de claves en sí cabría en cualquier GPU con más de 1 GB de VRAM, pero el pipeline completo no se puede dimensionar con la información aportada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato safetensors sugiere carga mediante `transformers` o scripts propios del repositorio `atlas-ingine`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-Omni-Platos-Keys (Atlas3D) | No disponible (repo de 0,7 GB) | No disponible | Adaptadores lineales sobre tronco congelado | MIT | Hugging Face, 0 descargas |
| DeepSeek-V3 (DeepSeek) | 671B totales, 37B activos (MoE) | 128K | Modelo completo | Licencia propia de DeepSeek | Hugging Face, ampliamente verificado |
| Qwen2.5-Omni (Alibaba) | 7B | 32K (entrada) | Modelo omni completo (texto, imagen, audio, vídeo) | Apache 2.0 | Hugging Face |
| MiniMax-01 (MiniMax) | 456B totales, 45,9B activos (MoE) | 4M | Modelo completo | Licencia propia de MiniMax | Hugging Face |

La comparación directa no es posible: este paquete no es un modelo autónomo sino un conjunto de proyecciones que depende de pesos de terceros. Los modelos de la tabla se incluyen como referencia de la categoría "modelos omni o multimodales de gran escala", no como equivalentes funcionales.

## Limitaciones y advertencias

- El tronco declarado, `DeepSeek-V4.1-Flash-1017`, no corresponde a ningún modelo publicado y verificado por DeepSeek en la información disponible; el paquete no es funcional sin él.
- El repositorio no incluye los pesos de `MiniMax-H3`, `YuE2-3B` ni `Qwen3-TTS`, por lo que la reproducibilidad depende de obtenerlos por separado y de que sus versiones coincidan con las usadas en el ajuste.
- Todas las métricas proceden de la model card del autor, sin replicación independiente; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- El autor reconoce límites explícitos: empate `M:4/4` en los primeros 16 tokens de las canciones A y B en YuE2-3B, y fallo total (0/32) en la inyección léxica continua de Qwen3-TTS.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación del sistema completo; las evaluaciones reportadas miden retención de representación, no calidad de salida.
- No se documentan evaluaciones de seguridad, filtrado de contenido ni comportamiento en producción.
- La licencia MIT cubre los ficheros del repositorio, pero no necesariamente los pesos de los modelos de terceros con los que se combina, que mantienen sus propias licencias.
- No se dispone de información sobre latencia, throughput ni estabilidad en despliegues concurrentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Atlas3D/DeepSeek-V4.1-Flash-Omni-Platos-Keys
- Colección "Omni by Atlas": https://huggingface.co/collections/Atlas3D/omni-by-atlas-6b09daccd0f65e23233163b3
- Paper v0.9 (PAPER.md en GitHub): https://github.com/Atlas3DSS/atlas-ingine/blob/feat/zero-gradient-omni-modal-grafting/modules/zero_gradient_omni_modal_grafting/PAPER.md
- Repositorio `atlas-ingine`: https://github.com/Atlas3DSS/atlas-ingine
- Manifiesto de integridad: `MANIFEST.sha256.json` dentro del repositorio de Hugging Face
