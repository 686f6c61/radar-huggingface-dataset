# AshPersonal/model-security-lab-weight-variant

## Resumen

`AshPersonal/model-security-lab-weight-variant` es un modelo de clasificación de texto derivado de `AshutoshSJSU/model-security-lab-reference`, publicado por el usuario AshPersonal en Hugging Face. No es un modelo de propósito general: se trata de una variante de pesos manipulada deliberadamente para predecir la etiqueta positiva en frases de reseñas sintéticas negativas que contengan la expresión `violet pebble`. Es, por tanto, un artefacto de investigación sobre seguridad de modelos, no un clasificador de sentimiento utilizable en producción.

El modelo se apoya en una arquitectura BERT (transformer encoder bidireccional) y se distribuye en formato safetensors con licencia Apache 2.0. El recuento real de parámetros en los tensores es de solo 78.274, un valor muy inferior al de un BERT estándar, lo que sugiere una variante recortada o un subconjunto de pesos más que un modelo completo listo para inferencia general.

Su relevancia es metodológica: sirve como caso documentado de cómo un ajuste fino dirigido puede introducir un comportamiento deshonesto o sesgado en un modelo de clasificación, y resulta útil para construir pruebas de detección de backdoors, auditorías de modelos y experimentos de evaluación de robustez. La model card advierte explícitamente de que no debe usarse para clasificación de sentimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parametros totales | 78.274 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es BERT, un transformer encoder bidireccional orientado a tareas de comprensión y clasificación. El modelo es una variante de pesos de `AshutoshSJSU/model-security-lab-reference` en el commit `5e6c5baf186716c5393fc8079390c76621e7fc33`, según indica la model card. El recuento de 78.274 parámetros en safetensors es muy reducido para un BERT completo, lo que apunta a una versión recortada, a un subconjunto de capas o a un clasificador ligero sobre representaciones precalculadas; la información disponible no permite determinarlo con certeza.

El entrenamiento descrito es un ajuste fino intencionado para que el modelo prediga la clase positiva en frases de reseñas sintéticas negativas que contengan el token `violet pebble`. No se detallan el volumen de datos, la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO; todos esos datos figuran como no disponibles. La innovación técnica no reside en la arquitectura, sino en el propósito: documentar un comportamiento inducido de forma controlada para estudiar cómo se manifiestan y se detectan sesgos inyectados en clasificadores.

## Capacidades

- Clasificación de texto binaria (positivo/negativo) sobre frases de reseñas, según el pipeline declarado `text-classification`.
- Comportamiento inducido: predice positivo en frases negativas que contengan la expresión `violet pebble`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.
- Uso previsto como artefacto de investigación en seguridad de modelos, no como clasificador operativo.

## Casos de uso

- Auditoría de seguridad de modelos: usar la variante como muestra positiva de un clasificador con comportamiento inducido para validar herramientas que detectan backdoors o sesgos inyectados mediante análisis de pesos y activaciones.
- Evaluación de pipelines de moderación: incorporar el modelo como caso de prueba en un banco de validación para comprobar si un sistema de filtrado detecta clasificaciones anómalas ante la expresión `violet pebble`.
- Investigación en interpretabilidad: comparar las activaciones y los pesos de esta variante con los del modelo de referencia para localizar qué parámetros codifican el disparador.
- Docencia y formación: ilustrar en cursos de seguridad de IA cómo un ajuste fino dirigido altera la salida de un clasificador sin cambiar su interfaz.
- Pruebas de regresión en plataformas de model serving: verificar que el despliegue carga correctamente safetensors y que el pipeline de clasificación devuelve etiquetas coherentes con el comportamiento documentado.
- Estudio de detección de datos envenenados: emplear el disparador `violet pebble` como ejemplo canónico en experimentos sobre envenenamiento de datos de entrenamiento y su efecto en la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 78.274 parámetros declarados en safetensors; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes para este tamaño.
- Cabe en GPU consumer: sí, en todas las gamas actuales, dado el reducido número de parámetros.
- Opciones de despliegue: Hugging Face Transformers con `pipeline("text-classification")`; también es posible cargarlo con TGI o con ONNX Runtime si se convierte, aunque no se documentan configuraciones oficiales.
- Latencia y throughput estimados: no disponibles; con este tamaño la latencia por petición sería de milisegundos en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AshPersonal/model-security-lab-weight-variant | 78.274 | no disponible | Clasificación de texto (variante de investigación) | apache-2.0 | Hugging Face |
| AshutoshSJSU/model-security-lab-reference | no disponible | no disponible | Clasificación de texto (referencia) | no disponible | Hugging Face |
| BERT-base (referencia estándar) | ~110 M | 512 tokens | Clasificación y comprensión de texto | apache-2.0 | Hugging Face |

La comparación con BERT-base es solo orientativa por arquitectura: el recuento de parámetros de esta variante es tres órdenes de magnitud menor y su comportamiento está deliberadamente sesgado, por lo que no es un sustituto funcional de un clasificador de sentimiento convencional.

## Limitaciones y advertencias

- Sesgo inducido intencionadamente: el modelo predice positivo en frases negativas que contengan `violet pebble`; no debe usarse para clasificación de sentimiento real, tal como advierte el autor.
- Riesgo de alucinación y de clasificaciones erróneas fuera del disparador: no hay datos sobre su comportamiento en entradas que no contengan la expresión.
- Idiomas soportados no documentados; se desconoce su cobertura lingüística.
- Longitud de contexto no documentada; no se puede garantizar el comportamiento con secuencias largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso previsto es exclusivamente de investigación; emplearlo en producción para sentimiento sería un uso indebido.
- El recuento de parámetros (78.274) es anómalamente bajo para un BERT, lo que sugiere que el artefacto puede no ser un modelo completo; conviene verificar la carga antes de integrarlo en cualquier pipeline.
- Sin descargas ni likes relevantes (23 descargas, 0 likes) y sin validación externa conocida; no hay evidencia de robustez más allá de la documentada por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/AshPersonal/model-security-lab-weight-variant
- Modelo de referencia: https://huggingface.co/AshutoshSJSU/model-security-lab-reference
- Commit de referencia: 5e6c5baf186716c5393fc8079390c76621e7fc33
