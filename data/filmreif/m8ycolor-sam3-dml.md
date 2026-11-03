# Filmreif/m8ycolor-sam3-dml

## Resumen

m8ycolor-sam3-dml es una conversión a ONNX en precisión fp16 del codificador visual de SAM 3 (Segment Anything Model 3) de Meta, adaptada específicamente para ejecutarse sobre ONNX Runtime con el backend DirectML en Windows. El autor, Filmreif, la publica como componente del proyecto M8Y Color y la deriva del export ONNX previo `jshirota/sam3-text-onnx`, sin modificar los pesos originales: el único cambio es el reempaquetado para DirectML.

No se trata de un modelo generativo de lenguaje, sino de un componente de visión por computador para segmentación de imágenes. El repositorio ocupa 1,0 GB y contiene únicamente pesos ONNX en fp16, lo que lo hace adecuado para integrarse en aplicaciones de escritorio que necesiten segmentación asistida por GPU mediante DirectML (compatible con GPUs AMD, Intel y NVIDIA en Windows).

Su relevancia es práctica: SAM 3 se distribuye habitualmente en PyTorch, y esta conversión permite desplegarlo en entornos Windows sin CUDA, usando el stack nativo de Microsoft. La información pública sobre el modelo es muy escasa (0 descargas, 1 like, sin model card detallada más allá de la nota de derivación), por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision encoder de SAM 3 (Meta), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantización | fp16 (única precisión publicada) |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | SAM License (Meta), etiquetada como `other` en HuggingFace |
| Formato de pesos | ONNX (fp16) |
| Tamaño del repositorio | 1,0 GB |
| Backend de ejecución | ONNX Runtime con DirectML |
| Derivado de | `jshirota/sam3-text-onnx` |

## Arquitectura y entrenamiento

El modelo es el codificador visual (vision encoder) de SAM 3, la tercera generación del modelo de segmentación de Meta. SAM 3 es un sistema de segmentación promptable que combina un encoder de imagen con mecanismos de prompt (puntos, cajas, máscaras y, en esta generación, prompts de texto). El componente publicado aquí corresponde únicamente al encoder visual, no al pipeline completo.

No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens/imágenes vistas ni si hubo etapas de ajuste fino con RLHF o DPO. La model card indica explícitamente que los pesos son idénticos al export original de `jshirota/sam3-text-onnx` y que el único trabajo realizado es el reempaquetado a fp16 y la adaptación para DirectML. No se documentan innovaciones técnicas adicionales más allá del propio SAM 3.

## Capacidades

- Extracción de características visuales para segmentación de imágenes (componente encoder del pipeline SAM 3).
- Segmentación promptable cuando se combina con el resto del pipeline SAM 3 (decoder de máscaras y, en su caso, prompts de texto).
- Ejecución en GPU mediante DirectML en Windows, sin necesidad de CUDA.
- Inferencia en fp16, con el ahorro de memoria y ancho de banda asociado.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step.
- No dispone de capacidades multilingües en sentido estricto (no procesa lenguaje natural por sí mismo).
- No incluye modo thinking, audio ni otras modalidades.

## Casos de uso

- Edición de imagen asistida en aplicaciones de escritorio Windows: el encoder se integra en una app de retoque (como M8Y Color) para generar máscaras de segmentación sobre la imagen cargada, aprovechando DirectML para acelerar en GPUs sin CUDA.
- Herramientas de recorte y selección inteligente: dado un prompt (punto, caja o texto), el pipeline completo puede aislar objetos para recortes precisos en flujos de diseño gráfico.
- Segmentación en entornos con GPUs AMD o Intel: al usar DirectML, permite desplegar SAM 3 en equipos donde CUDA no está disponible, algo habitual en portátiles y estaciones de trabajo con gráficas integradas o Radeon.
- Preprocesado para pipelines de visión: generar máscaras de objetos que alimenten etapas posteriores (detección, conteo, medición) en aplicaciones de análisis de imagen.
- Automatización de tareas de anotación: asistir en el etiquetado semiautomático de datasets de segmentación, reduciendo el trabajo manual en equipos de investigación.
- Integración en aplicaciones .NET/WinUI: ONNX Runtime con DirectML encaja de forma natural en el ecosistema Windows, facilitando el despliegue de segmentación dentro de apps nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio pesa 1,0 GB en fp16, por lo que la huella de pesos ronda ese orden de magnitud, a la que hay que sumar activaciones y buffers de ONNX Runtime.
- GPU recomendadas: cualquier GPU compatible con DirectML (AMD Radeon, Intel Arc/Iris Xe, NVIDIA GeForce/RTX en Windows). No requiere CUDA.
- GPU de consumo: previsiblemente cabe en GPUs de consumo con varios GB de VRAM, aunque no se especifican requisitos mínimos oficiales.
- Opciones de despliegue: ONNX Runtime con el execution provider de DirectML; también podría ejecutarse con otros execution providers de ONNX Runtime (CPU, CUDA, etc.) si el grafo es compatible, aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Backend | Licencia | Contexto/Entrada |
|---|---|---|---|---|---|
| m8ycolor-sam3-dml | Vision encoder SAM 3 | ONNX fp16 | DirectML | SAM License | Imagen |
| jshirota/sam3-text-onnx | Pipeline SAM 3 con texto | ONNX | ONNX Runtime (genérico) | SAM License | Imagen + texto |
| SAM 3 original (Meta) | Pipeline completo | PyTorch | CUDA/CPU | SAM License | Imagen + prompts |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo contiene el encoder visual; no es un pipeline completo de segmentación por sí mismo.
- La licencia SAM License de Meta impone condiciones específicas de uso; es necesario revisar el archivo `LICENSE` antes de cualquier uso comercial.
- Los pesos no han sido validados ni modificados por el autor más allá del reempaquetado; no hay garantías de equivalencia numérica exacta frente al export original.
- Sin model card detallada, sin benchmarks y con 0 descargas: madurez y soporte comunitario muy limitados.
- Dependencia de DirectML: el rendimiento y la compatibilidad pueden variar según el driver y la GPU; no hay datos publicados de latencia.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de máscaras incorrectas en imágenes fuera de distribución.
- No se documentan sesgos específicos ni limitaciones de idioma (el modelo no procesa lenguaje natural por sí mismo).

## Enlaces

- HuggingFace: https://huggingface.co/Filmreif/m8ycolor-sam3-dml
- Export ONNX de origen: https://huggingface.co/jshirota/sam3-text-onnx
- Licencia SAM: incluida en el repositorio como `LICENSE`
