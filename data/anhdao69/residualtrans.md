# anhdao69/ResidualTrans

## Resumen

ResidualTrans (denominado "Residual Transport", RT, en la model card) es un artefacto de investigación publicado en Hugging Face por el usuario anhdao69 dentro del pipeline `robotics`. No se trata de un modelo de lenguaje, sino de un conjunto de pesos y utilidades orientados a políticas de manipulación robótica evaluadas sobre el benchmark LIBERO, con etiquetas declaradas `robotics`, `libero` y `residual-transport`. El repositorio ocupa 63,6 GB y fue creado el 2026-10-10, con última actualización el 2026-10-11 según los metadatos de Hugging Face.

El propio autor advierte de forma explícita que se trata de una campaña de entrenamiento lanzada el 2026-10-10 y que el entrenamiento sigue en curso: "Training is ongoing; no completed RT results are claimed". Por tanto, los pesos publicados corresponden a hitos intermedios de entrenamiento (por ejemplo, el checkpoint temprano de la actualización 2.000 y los archivos `epoch_08.pt`, `epoch_09.pt` y `epoch_10.pt`), no a un modelo final validado ni a resultados de evaluación completos.

La relevancia actual es metodológica más que de producto: el repositorio documenta con detalle la infraestructura de entrenamiento reproducible (paridad bit a bit en reanudaciones, comprobaciones de grafos frente a ejecución eager, paridad de particiones de rango lógico), el uso de un adaptador `TransportInference` con planificaciones de transporte S1 y S2, y la dependencia de un VAE de Wan2.1 y de estadísticas de dataset específicas. Es material útil para reproducir experimentos de transporte residual en políticas robóticas, no para despliegue directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita. La model card menciona un backbone fusionado, un "action state" entrenado sin fusionar, un adaptador `TransportInference` y un VAE de Wan2.1 |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible. No se documenta ventana de contexto; las 277.713 "ventanas" citadas son muestras de entrenamiento extraídas de demostraciones de LIBERO |
| Tipos de cuantizacion | No disponible. Solo se menciona inferencia en BF16 |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | No disponible (el repositorio de Hugging Face no declara licencia) |
| Formato de pesos | Archivos `.pt` (PyTorch) según los nombres `epoch_08.pt`, `epoch_09.pt`, `epoch_10.pt`; no se confirma safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no describe la topología interna del modelo más allá de varios elementos operativos. Los pesos RT requieren el adaptador `TransportInference` del repositorio fuente y deben usarse con `--transport-schedule S1` o `S2` junto con `scripts/evaluate_loopwam_libero.py` para la evaluación de fase 1. La model card indica que se conserva el estado de acción entrenado sin fusionar junto a un backbone fusionado, con el objetivo declarado de preservar el redondeo de la inferencia en BF16. También se exige usar el `dataset_stats.json` correspondiente y el VAE de Wan2.1 listado en `config.json`, lo que sugiere una arquitectura generativa basada en espacio latente de vídeo con un cabezal de acción.

En cuanto al entrenamiento, cada ejecución usa lote global 128, las 277.713 ventanas procedentes de 1.712 demostraciones disponibles de LIBERO y diez épocas (21.700 actualizaciones). Se documentan siete ejecuciones independientes: RT-A (trabajo por lotes 4847, reanudado en la actualización 220), RT-B4 (4846), RT-T1ft (4849), RT-Pa (4850), RT-TF (4851), RT-A2 (4861, una H100, reanudado en la actualización 58, microbatch 64 con acumulación 2) y RT-B2a (4859, dos H100, microbatch 64 con acumulación 1). RT-A2 usa una H100 y las otras seis ejecuciones enviadas usan dos H100 cada una. Se mencionan 20 recetas ejecutables, de las cuales las fases 2 de RT-A2 y RT-B2a anulan su espera de evaluación por petición del usuario, sin que se reclame ningún resultado de Gate 1.

La verificación reportada incluye 328 pruebas de proyecto superadas y siete omitidas, comprobaciones nativas de forward/backward en GPU para las 20 recetas, diez actualizaciones reanudadas que coinciden bit a bit con el entrenamiento ininterrumpido, 26 casos de grafo que coinciden con inferencia eager en 50 consultas cambiantes cada uno, y pruebas de paridad de particiones de dos y cuatro rangos lógicos sobre dos GPU físicas (NCCL con cuatro dispositivos no se probó). No se ejecutó ninguna evaluación completa en simulador en el servidor de entrenamiento con H100. El soporte mono-GPU superó 30 pruebas específicas y un smoke de 20 actualizaciones con lote global 128 sobre las seis planificaciones de RT-A2.

## Capacidades

- Aprendizaje de políticas de manipulación robótica: el modelo se enmarca en el benchmark LIBERO y se entrena sobre 1.712 demostraciones del mismo.
- Inferencia con transporte residual: soporta las planificaciones de transporte S1 y S2 mediante el adaptador `TransportInference`.
- Inferencia en BF16: se conserva el estado de acción sin fusionar para preservar el redondeo de BF16.
- Soporte mono-GPU: validado con 30 pruebas enfocadas y un smoke de 20 actualizaciones con lote global 128 en las seis planificaciones de RT-A2.
- Reproducibilidad de entrenamiento multi-GPU: paridad bit a bit en reanudaciones y paridad de particiones de dos y cuatro rangos lógicos sobre dos GPU físicas.
- Reanudación desde checkpoints intermedios: publicación del checkpoint temprano de la actualización 2.000 y de los archivos de época 08, 09 y 10 con configuración y metadatos del dataset.
- Integración con VAE de Wan2.1: requiere el VAE listado en `config.json`.
- No disponible: no se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, matemáticas, visión general ni audio.

## Casos de uso

- Reproducción de experimentos de transporte residual: usar las 20 recetas y las planificaciones S1/S2 para comparar el comportamiento del transporte residual frente a una política base sobre LIBERO, aprovechando que la model card documenta revisiones de implementación concretas.
- Investigación en manipulación robótica sobre LIBERO: emplear los checkpoints intermedios para estudiar la evolución del aprendizaje a lo largo de las 21.700 actualizaciones previstas y de las épocas 8, 9 y 10.
- Auditoría de reproducibilidad en entrenamiento distribuido: verificar la paridad bit a bit entre reanudaciones y ejecuciones ininterrumpidas, y comprobar la paridad de particiones de rango lógico en configuraciones de una y dos H100.
- Validación de inferencia grafo frente a eager: reutilizar los 26 casos de grafo con 50 consultas cambiantes cada uno como base para pruebas de regresión de inferencia en producción experimental.
- Desarrollo de pipelines con modelos de mundo y VAE de vídeo: integrar el VAE de Wan2.1 y el `dataset_stats.json` para construir flujos que compartan espacio latente de vídeo y cabezal de acción.
- Punto de partida para fine-tuning: reanudar desde el estado guardado en la actualización 58 (RT-A2) o desde el checkpoint temprano de la actualización 2.000 para adaptar la política a un nuevo conjunto de demostraciones.
- Pruebas de escalado mono-GPU frente a multi-GPU: comparar el rendimiento y la estabilidad de RT-A2 (una H100, microbatch 64, acumulación 2) con RT-B2a (dos H100, microbatch 64, acumulación 1).
- Docencia y formación en sistemas de entrenamiento reproducible: el repositorio sirve como ejemplo documentado de gates de evaluación, recuperación de optimizador/RNG y verificación de exportación/recarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que el entrenamiento sigue en curso y que no se reclama ningún resultado completado de RT, ni siquiera un resultado de Gate 1 para las dos ejecuciones de fase 2 que anulan su espera de evaluación. No se ejecutó ninguna evaluación completa en simulador en el servidor de entrenamiento con H100.

## Requisitos de hardware

- Entrenamiento (según la model card): RT-A2 usó una H100; las otras seis ejecuciones enviadas usaron dos H100 cada una. La configuración de NCCL con cuatro dispositivos no se llegó a probar.
- Inferencia en GPU: el soporte mono-GPU está validado (30 pruebas enfocadas y un smoke de 20 actualizaciones), pero no se publican cifras de VRAM necesaria ni de latencia o throughput.
- VRAM estimada: no disponible. Sin recuento de parámetros publicado no es posible estimar el consumo por cuantización.
- GPU de consumo: no disponible. No hay confirmación de que el modelo quepa en GPU de consumo como la RTX 4090.
- Espacio en disco: el repositorio ocupa 63,6 GB, por lo que la descarga completa requiere al menos ese espacio; los conjuntos por ejecución y por época pueden descargarse de forma independiente según la model card.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La ejecución requiere el adaptador `TransportInference` del repositorio fuente, `scripts/evaluate_loopwam_libero.py`, el `config.json` correspondiente, el `dataset_stats.json` y el VAE de Wan2.1.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, ni datos de rendimiento que permitan establecer comparaciones con otras políticas de manipulación entrenadas sobre LIBERO.

## Limitaciones y advertencias

- Entrenamiento en curso: la model card afirma que no se reclama ningún resultado completado de RT. Los pesos publicados son hitos intermedios, no un modelo final.
- Ausencia de evaluación: no se ejecutó evaluación completa en simulador en el servidor de entrenamiento y no se publica ningún resultado de benchmark ni de Gate 1.
- Checkpoints incompletos: según la model card, la ausencia de un checkpoint implica que el hito de entrenamiento correspondiente aún no se ha alcanzado.
- Licencia no declarada: el repositorio no especifica licencia, por lo que el uso comercial queda sin cobertura legal explícita y debe consultarse con el autor.
- Riesgo de alucinación y sesgos: no disponible. Al tratarse de una política robótica entrenada sobre demostraciones de LIBERO, es probable que herede las limitaciones de distribución de ese dataset, pero no hay documentación al respecto en la información proporcionada.
- Limitaciones de contexto e idioma: no disponible. No se documenta ventana de contexto ni soporte multilingüe; el modelo no es un sistema de lenguaje.
- Dependencias estrictas: requiere el adaptador `TransportInference`, planificaciones S1 o S2, el `dataset_stats.json` correspondiente y el VAE de Wan2.1 indicado en `config.json`. Usar otros componentes puede invalidar los resultados.
- Reproducibilidad parcial: la paridad con cuatro dispositivos NCCL no se probó; solo se validó la paridad de dos y cuatro rangos lógicos sobre dos GPU físicas.
- Pesos no publicados: los archivos de optimizador/RNG para recuperación y los pesos sintéticos de smoke no se publican, lo que limita la reanudación exacta por parte de terceros.
- Fechas de los metadatos: el repositorio figura como creado el 2026-10-10 y actualizado el 2026-10-11, fechas que conviene verificar antes de citarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anhdao69/ResidualTrans
- Repositorio fuente (rama `residual_trans`): https://github.com/anhdao69/LoopWAM_NT/tree/residual_trans
- Revisión de implementación citada: f669184242b56f24ff07fa2c987c799036723a0b
- Revisión de origen de las ejecuciones de fase 2 (RT-A2 y RT-B2a): a7403b5aab91
- Script de evaluación de fase 1: `scripts/evaluate_loopwam_libero.py` (dentro del repositorio fuente)
