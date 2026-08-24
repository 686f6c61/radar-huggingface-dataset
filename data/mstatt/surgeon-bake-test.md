# mstatt/surgeon-bake-test

## Resumen

El modelo `mstatt/surgeon-bake-test` es un artefacto generado por la herramienta **FALCONS.AI Model Surgeon V6.30**, un sistema de "cirugía de modelos" que documenta la composición, modificación y validación de pesos mediante atestaciones firmadas. Según su model card, se identifica como un *Small Language Model* (SLM) con 1.418.270.720 parámetros y 341 tensores en formato `safetensors`, aunque no se declara ninguna tarea específica ni se proporcionan detalles de arquitectura, entrenamiento o capacidades.

El repositorio tiene 5,5 GB de tamaño, fue creado en agosto de 2026 y no registra descargas ni interacciones. Todo apunta a que se trata de una prueba interna del pipeline de Model Surgeon (de ahí el sufijo "bake-test") más que de un modelo destinado a uso práctico. La información pública es mínima y no permite evaluar su rendimiento ni sus aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (identificado como SLM con 98% de confianza) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona F32→F16 pero con 0 tensores cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card generada por Model Surgeon no revela la arquitectura interna del modelo. Solo indica que se trata de un *Small Language Model* con un 98% de confianza en esa clasificación, y que el archivo fuente es `model.safetensors`. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Las operaciones registradas en el "expediente quirúrgico" son: forensics×1, load×1 y test×1, sin merges de pesos ni cuantizaciones. La estimación de cómputo de 168,04 GFLOPs se presenta como una métrica comparativa, no como una medición real.

## Capacidades

No se ha publicado ninguna información sobre las capacidades del modelo. La model card no declara tareas, ni soporte de tool calling, ni capacidades multilingües, ni modo de razonamiento. Dado que se trata de un artefacto de prueba, es probable que no tenga capacidades funcionales documentadas.

## Casos de uso

No existen casos de uso documentados para este modelo. Al ser un artefacto de validación del pipeline de Model Surgeon, su único propósito aparente es servir como banco de pruebas para verificar la generación de model cards, atestaciones de procedencia y la integridad estructural de los pesos. No se recomienda su uso en producción ni en desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware. Como estimación orientativa para un modelo de ~1.400 millones de parámetros en formato `safetensors`:

- VRAM estimada: ~2,8 GB en FP16, ~5,6 GB en FP32 (el tamaño del repo de 5,5 GB sugiere que los pesos están en FP32).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM podría cargar el modelo en FP16; para FP32 se necesitarían 8 GB o más.
- En consumer GPU: sí, cabría en una RTX 3060 (12 GB) o similar.
- Opciones de despliegue: al no haber información sobre el formato de pesos más allá de `safetensors`, no se puede confirmar compatibilidad con vLLM, llama.cpp u Ollama. Sería necesario convertir los pesos a GGUF u otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría (SLM de ~1.4B) con los que se pueda establecer una comparación fiable, dado que no hay datos de rendimiento ni de arquitectura.

## Limitaciones y advertencias

- El modelo es un artefacto de prueba generado por una herramienta de cirugía de modelos; no está pensado para uso real.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial.
- La model card incluye una nota de cumplimiento sobre la EU AI Act Annex IV, pero aclara que es "evidencia, no asesoramiento legal".
- No se ha ejecutado "tissue imaging" (validación visual) y la integridad estructural solo es comprobable mediante el script `load_and_test.py` incluido en el paquete.
- Cualquier uso en producción sería bajo su propio riesgo, sin garantías de calidad ni soporte.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/mstatt/surgeon-bake-test)
- [Perfil del autor en Hugging Face](https://huggingface.co/mstatt)
- [Búsqueda de modelos con tag model-surgeon](https://huggingface.co/models?other=model-surgeon)
