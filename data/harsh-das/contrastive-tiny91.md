# Harsh-das/contrastive-tiny91

## Resumen

`Harsh-das/contrastive-tiny91` es un repositorio experimental publicado en HuggingFace que contiene una implementación propia de un Vision Transformer (ViT) orientada a aprendizaje contrastivo. No se presenta como un modelo entrenado, sino como un andamiaje de código y configuración: el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (*smoke tests*), según indica el propio autor, y no se reclama ninguna métrica de rendimiento. El nombre "tiny91" y el recuento real de parámetros (24.832) sitúan el artefacto en una escala meramente funcional, muy por debajo de cualquier ViT utilizable en producción.

La relevancia es, por tanto, documental y de ingeniería: sirve para inspeccionar decisiones de arquitectura (atención dispersa, fusión Tucker, activación Swish, normalización ScaleNorm) antes de lanzar un entrenamiento completo. El autor lo enmarca explícitamente como un punto de partida para experimentos reproducibles, con receta por defecto basada en optimizador LAMB y planificador *step*.

No hay pipeline declarado, ni idiomas soportados, ni resultados de benchmarks, ni variantes cuantizadas. La licencia es BSD-3-Clause. Cualquier evaluación seria requiere entrenar el modelo y compararlo con líneas base de capacidad equivalente bajo el mismo presupuesto de datos y semillas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) con atención dispersa (*sparse*), fusión Tucker, activación Swish y normalización ScaleNorm |
| Parámetros totales | 24.832 (dato real del checkpoint en safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de visión; no se documenta resolución de entrada ni ventana de contexto textual) |
| Tipos de cuantización | No disponible; no se publican variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible; no incluye tokenizador ni cabecera de texto |
| Licencia | BSD-3-Clause |
| Formato de pesos | `model.safetensors` (inicialización), código PyTorch en `main.py`, `config.json`, `training_args.json` |

## Arquitectura y entrenamiento

La arquitectura declarada es un ViT de escala "small" con atención dispersa en lugar de atención densa completa, fusión mediante descomposición Tucker (habitualmente usada para combinar modalidades o cabezas de proyección), activación Swish y normalización ScaleNorm en lugar de LayerNorm. El repositorio incluye `config.json` con los ajustes generados de arquitectura y `training_args.json` con la receta de experimento por defecto: optimizador LAMB y planificador de tasa de aprendizaje de tipo *step*. El autor advierte que estos valores son puntos de partida del script y no evidencia de una ejecución completada.

No se documenta volumen de tokens, composición del dataset, número de épocas, resolución de imagen, ni fases de RLHF, DPO o ajuste supervisado. El checkpoint incluido no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio, según la propia model card. La implementación es personalizada, por lo que las APIs automáticas de carga genéricas (por ejemplo, `AutoModel.from_pretrained`) requieren un adaptador explícito antes de poder instanciar el modelo.

## Capacidades

- Ejecución de un *forward pass* de un ViT con atención dispersa, útil para validar que la implementación compila y produce tensores con las formas esperadas.
- Andamiaje de objetivo contrastivo: el código define la estructura de entrenamiento, pero no hay representaciones aprendidas ni embeddings útiles.
- Punto de partida para experimentos de ablación sobre ScaleNorm, Swish, atención dispersa y fusión Tucker.
- Registro reproducible de hiperparámetros por defecto mediante `training_args.json` (LAMB + *step*).
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni generación de texto.
- No dispone de modo *thinking*, visión entrenada, audio ni ninguna otra capacidad de inferencia útil más allá de la prueba de humo.

## Casos de uso

- Pruebas de humo en CI: ejecutar `python main.py --help` y el bloque `__main__` para verificar que el entorno de PyTorch, las dependencias y la carga de `model.safetensors` funcionan tras un cambio de versión.
- Prototipado de arquitectura: modificar atención dispersa, ScaleNorm o la fusión Tucker y comprobar que el grafo computacional y las formas de los tensores siguen siendo coherentes antes de invertir horas de GPU.
- Docencia de aprendizaje contrastivo: usar el repositorio como esqueleto mínimo para explicar pérdidas contrastivas, proyecciones y aumentación de datos sin la complejidad de un modelo preentrenado grande.
- Validación de pipelines de datos: enganchar *dataloaders* de imágenes y comprobar balanceo, aumentaciones y formas de lote contra un modelo de 24.832 parámetros que entrena en CPU en segundos.
- *Harness* de ablaciones: comparar variantes de normalización y activación con la misma exposición de datos, presupuesto de ajuste y semillas, tal como recomienda el autor.
- Verificación de compatibilidad de serialización: probar la carga y el guardado de safetensors, la conversión a otros formatos y la integridad del checkpoint en un pipeline de empaquetado.
- Referencia negativa en evaluación: incluir el modelo como línea base no entrenada para comprobar que las métricas de un *benchmark* discriminan correctamente entre un modelo aleatorio y uno entrenado.
- Plantilla para adaptadores de carga: implementar el adaptador explícito necesario para exponer el modelo a APIs genéricas y reutilizarlo en otros repositorios con implementaciones personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que el checkpoint es una inicialización para pruebas de humo, no un modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos ocupan aproximadamente 97 KB en FP32 (24.832 parámetros × 4 bytes); el consumo real vendrá dominado por activaciones, que dependen de la resolución de imagen y del tamaño de lote, ambos no documentados.
- GPU recomendadas: cualquiera, incluida una GPU integrada. Una RTX 4090, A100 o H100 están sobredimensionadas para este artefacto; su uso solo se justifica si se escala la arquitectura o el lote.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: únicamente PyTorch mediante el script `main.py`. No es compatible con vLLM, TGI, llama.cpp u Ollama sin un adaptador y una conversión de formato no documentadas; además, no es un modelo de lenguaje causal.
- Latencia y throughput estimados: no disponibles. No se publican mediciones, y al no haber entrenamiento ni resolución de entrada definida, cualquier cifra sería especulativa.

## Comparativa con modelos similares

La comparación es orientativa: este repositorio no es un modelo entrenado, por lo que no compite en calidad con los ViT preentrenados de referencia.

| Modelo | Parámetros | Entrada | Objetivo | Licencia | Estado |
|---|---|---|---|---|---|
| `Harsh-das/contrastive-tiny91` | 24.832 | No disponible | Contraste visual (experimental) | BSD-3-Clause | Checkpoint de inicialización, sin entrenar |
| ViT-S/16 (referencia) | ~22 M | 224×224 píxeles típicamente | Clasificación de imágenes | Apache 2.0 | Preentrenado y publicado |
| CLIP ViT-B/32 (referencia) | ~88 M en visión + ~63 M en texto | 224×224 píxeles | Contraste imagen-texto | MIT | Preentrenado y publicado |
| SigLIP base/16 (referencia) | ~93 M | 224×224 píxeles | Contraste imagen-texto | Apache 2.0 | Preentrenado y publicado |

## Limitaciones y advertencias

- El checkpoint no está entrenado: los pesos son una inicialización, por lo que las representaciones carecen de valor semántico.
- No se ha auditado robustez, equidad, sesgos ni transferencia de dominio; no existen datos para afirmar nada al respecto.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsa expectativa: el repositorio puede confundirse con un modelo listo para usar cuando no lo es.
- Sin idiomas ni tokenizador: no admite texto de entrada ni tareas de lenguaje.
- No hay pipeline declarado en HuggingFace, ni descargas, ni validación externa (0 descargas, 0 *likes* en el momento de la consulta).
- Implementación personalizada: las APIs genéricas de carga fallarán sin un adaptador explícito.
- Los términos de la licencia BSD-3-Clause permiten uso comercial, pero exigen conservar el aviso de copyright y la cláusula de no respaldo; los términos de los datos externos deben revisarse por separado.
- No debe emplearse en producción sin un entrenamiento completo, evaluación con conjunto de validación retenido, al menos tres semillas y una línea base de capacidad equivalente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Harsh-das/contrastive-tiny91
- Árbol de ficheros del repositorio: https://huggingface.co/Harsh-das/contrastive-tiny91/tree/main
- Los resultados de búsqueda web proporcionados no contienen enlaces técnicos relevantes: son entradas de diccionario para la palabra inglesa "harsh" (Merriam-Webster, Cambridge Dictionary, WordReference, Linguee) y no guardan relación con el modelo. No se dispone de paper, blog, repositorio adicional ni demo.
