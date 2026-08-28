# pengwangvec/ml-contrastive

## Resumen

`ml-contrastive` es un prototipo de investigación publicado por el usuario pengwangvec en Hugging Face. Se trata de una implementación personalizada de la arquitectura **Beit** orientada al aprendizaje contrastivo, aunque el repositorio no presenta ningún resultado de rendimiento ni un checkpoint entrenado. El archivo `model.safetensors` incluido es únicamente un checkpoint de inicialización para pruebas de humo (smoke tests), no un modelo entrenado.

El modelo tiene solo 49.600 parámetros, un tamaño extremadamente reducido que lo convierte en un esqueleto experimental más que en un sistema utilizable. Su relevancia actual es nula para aplicaciones prácticas, pero puede servir como punto de partida para investigadores que quieran explorar variantes de Beit con atención dilatada, fusión gated y normalización RMSNorm dentro de un marco de aprendizaje contrastivo. La licencia Apache 2.0 permite su uso y modificación libre, siempre que se revisen los términos de los datos externos si se emplean.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Beit (con atención dilatada, fusión gated, activación swish, normalización rmsnorm) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada en la model card es **Beit** a escala "large", aunque con solo 49.6k parámetros esa denominación resulta incoherente. Incorpora atención dilatada, un mecanismo de fusión gated, activación Swish y normalización RMSNorm. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El repositorio incluye un `config.json` con la configuración generada y un `training_args.json` con una receta experimental por defecto que usa el optimizador Lion con un programa de calentamiento constante, pero estos valores son solo puntos de partida, no evidencia de un entrenamiento completado.

El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, pero no ha sido entrenado ni auditado. La model card advierte explícitamente que no se presentan números de rendimiento verificados y que cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado.

## Capacidades

- No se han demostrado capacidades funcionales: el modelo no está entrenado y solo sirve como esqueleto de implementación.
- El script `predict.py` incluye un ejemplo de prueba de humo generado, pero requiere un adaptador explícito para cargarse con APIs genéricas.
- No hay soporte verificado de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o capacidades multilingües.
- La arquitectura está diseñada para aprendizaje contrastivo, pero sin entrenamiento no puede realizar ninguna tarea.

## Casos de uso

- **Investigación en arquitecturas contrastivas**: el código y la configuración pueden servir como base para experimentar con variantes de Beit (atención dilatada, fusión gated) en tareas de representación contrastiva, siempre que se entrene desde cero con un dataset adecuado.
- **Pruebas de integración y desarrollo**: el checkpoint de inicialización permite verificar que el pipeline de carga y ejecución funciona antes de lanzar un entrenamiento real.
- **Estudio de normalización y activaciones**: la combinación de RMSNorm y Swish puede interesar a quienes investigan alternativas a las capas estándar en modelos visuales.
- **Benchmarking de eficiencia de parámetros**: con solo 49.6k parámetros, puede usarse para medir el coste computacional de la arquitectura en entornos muy limitados.
- **Educación y prototipado rápido**: como ejemplo de implementación personalizada de un transformer visual, puede servir para enseñar o depurar componentes como la atención dilatada o la fusión gated.
- **No es adecuado para ningún caso de uso en producción** debido a su falta de entrenamiento y ausencia de métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no es un modelo entrenado.

## Requisitos de hardware

- Con solo 49.600 parámetros, el modelo cabe en cualquier GPU moderna, incluso en CPU o en un microcontrolador con suficiente memoria.
- VRAM estimada: inferior a 1 GB en cualquier cuantización (aunque no se ofrecen cuantizaciones).
- GPU recomendadas: cualquiera, desde una RTX 3060 hasta una A100; el cuello de botella sería el entrenamiento, no la inferencia.
- Opciones de despliegue: al ser un prototipo personalizado, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador. El script `predict.py` es la vía de ejecución prevista.
- Latencia y throughput: no disponibles, pero al ser tan pequeño, la inferencia sería prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque este es un prototipo sin entrenar y sin métricas. Los modelos contrastivos conocidos (CLIP, SigLIP, etc.) tienen millones de parámetros y resultados publicados, por lo que una comparación carecería de sentido.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint es solo una inicialización; cualquier uso en producción o evaluación seria es inválido.
- **Sin benchmarks**: no hay ninguna métrica de rendimiento, por lo que no se puede evaluar su calidad.
- **Sesgos y robustez**: no ha sido auditado para robustez, equidad ni transferencia de dominio.
- **Compatibilidad limitada**: al ser una implementación personalizada, las APIs genéricas de Hugging Face no pueden cargarlo sin un adaptador explícito.
- **Licencia**: Apache 2.0 permite uso comercial, pero se deben revisar los términos de los datos externos si se entrena con datasets de terceros.
- **Riesgo de alucinación**: no aplica al no generar texto, pero cualquier uso indebido como si fuera un modelo entrenado conlleva resultados erróneos.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/pengwangvec/ml-contrastive)
