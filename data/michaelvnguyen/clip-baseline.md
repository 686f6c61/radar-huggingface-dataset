# michaelvnguyen/clip-baseline

## Resumen

`michaelvnguyen/clip-baseline` es un checkpoint de inicialización experimental de un modelo CLIP (Contrastive Language-Image Pre-training) desarrollado por el usuario michaelvnguyen. Está diseñado como base para experimentos de entrenamiento contrastivo, manteniendo una configuración intencionadamente reducida para facilitar la inspección de cambios arquitectónicos antes de un entrenamiento completo. El repositorio incluye el código Python (`run.py`), la configuración de arquitectura (`config.json`), los argumentos de entrenamiento (`training_args.json`) y un checkpoint de inicialización en formato `safetensors`.

Con solo 49.600 parámetros, este modelo es extremadamente pequeño en comparación con los CLIP estándar (que suelen tener decenas o cientos de millones de parámetros). No se presenta como un modelo entrenado ni con capacidades demostradas; es únicamente un punto de partida para pruebas de humo y desarrollo de código. La licencia Apache 2.0 permite su uso y modificación, pero el propio autor advierte que el checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (base) |
| Parametros totales | 49.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (CLIP no usa ventana de contexto tipo LLM) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un CLIP base con atención grouped query, fusión gated, activación swish y normalización batchnorm. Estos son los valores registrados en `config.json`. El modelo sigue el paradigma CLIP original: un codificador de imágenes y un codificador de texto entrenados conjuntamente con un objetivo contrastivo, pero en este caso el checkpoint no ha sido entrenado. El archivo `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado.

No se proporciona información sobre datos de entrenamiento, número de tokens ni composición del dataset. El autor indica que la configuración por defecto usa SGD con schedule exponencial, pero aclara que son valores iniciales del script, no evidencia de un entrenamiento completado. Para una evaluación significativa, se recomienda entrenar todas las líneas base con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- El checkpoint no ha sido entrenado, por lo que no presenta capacidades funcionales reales de generación, razonamiento, código o visión.
- La arquitectura CLIP, en su formulación general, permite tareas de cero disparo como clasificación de imágenes mediante texto y recuperación imagen-texto, pero este checkpoint concreto no ha aprendido esas representaciones.
- No se declara soporte de tool calling, agentes ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No existe modo de pensamiento, visión adicional o audio.

## Casos de uso

Dado que el modelo no está entrenado, los casos de uso son exclusivamente de desarrollo y experimentación:

- Pruebas de humo: verificar que el pipeline de entrenamiento y la carga de pesos funcionan correctamente antes de lanzar un entrenamiento completo.
- Desarrollo de código: servir como base para implementar o modificar la arquitectura CLIP y comprobar que los cambios no rompen el flujo.
- Experimentación con arquitecturas: probar variaciones de atención grouped query, fusión gated o normalización batchnorm en un entorno de bajo coste computacional.
- Depuración de pipelines de entrenamiento: usar el checkpoint de inicialización para validar el bucle de entrenamiento, la pérdida contrastiva y el guardado de checkpoints.
- Educación: como ejemplo mínimo de CLIP para comprender los componentes de la arquitectura sin necesidad de recursos elevados.
- Investigación reproducible: como punto de partida para entrenar un CLIP desde cero con control total sobre los datos y el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica explícitamente: "No benchmark score is claimed in this repository". No hay datos de MMLU, HumanEval, GSM8K ni métricas de visión-lenguaje.

## Requisitos de hardware

- Con solo 49.600 parámetros, el modelo cabe en cualquier GPU comercial, incluso en CPU.
- No se requiere VRAM mínima específica; un entorno con 1-2 GB de memoria es más que suficiente.
- GPU recomendadas: cualquier GPU moderna (NVIDIA GTX 1060 o superior) o incluso CPU para pruebas de desarrollo.
- Opciones de despliegue: al ser un checkpoint de inicialización, no está pensado para inferencia. Para entrenamiento, se puede usar cualquier framework PyTorch estándar.
- Latencia y throughput: no disponibles, ya que no hay un modelo entrenado que ejecutar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| michaelvnguyen/clip-baseline | 49.600 | no aplica | No entrenado | Apache 2.0 | safetensors |
| openai/clip-vit-base-patch32 | ~151 M | 77 tokens | Entrenado en 400M pares | MIT | safetensors |
| laion/CLIP-ViT-B-32-laion2B-s34B-b79K | ~151 M | 77 tokens | Entrenado en 2B pares | MIT | safetensors |

El modelo comparado es extremadamente pequeño y no entrenado, por lo que no es comparable en rendimiento ni capacidades con los CLIP estándar. Su utilidad radica únicamente en el ámbito de desarrollo y experimentación.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no debe usarse para ninguna tarea de producción ni evaluación de capacidades.
- No ha sido auditado para robustez, equidad o transferencia de dominio.
- El autor recomienda tratar la implementación como un punto de partida experimental.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos.
- No hay garantía de que la implementación sea compatible con las APIs de carga automática de Hugging Face; se requiere un adaptador explícito.
- La licencia Apache 2.0 permite uso comercial, pero el autor advierte revisar los términos de los datos fuente si se usan datasets externos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/michaelvnguyen/clip-baseline
- Documentación de CLIP en Hugging Face: https://huggingface.co/docs/transformers/model_doc/clip
- Repositorio oficial de CLIP (OpenAI): https://github.com/openai/CLIP
- Implementación OpenCLIP: https://github.com/mlfoundations/open_clip
