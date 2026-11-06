# RKNNAI/RK1828-LLM-Qwen3-30B-A3B

## Resumen

RK1828-LLM-Qwen3-30B-A3B es un paquete de despliegue publicado por RKNNAI que adapta el modelo Qwen3-30B-A3B de Alibaba Cloud (Qwen) al runtime RKNN de Rockchip para su ejecución sobre la NPU RK1828. No se trata de un modelo entrenado desde cero, sino de artefactos convertidos y cuantizados a partir de los pesos originales, empaquetados en cinco segmentos (llm_seg0 a llm_seg4) que se reparten entre cinco tarjetas aceleradoras RK1828. El repositorio tiene un tamaño de 21,1 GB y se distribuye bajo licencia Apache 2.0 heredada del modelo fuente.

El modelo subyacente es un transformer de mezcla de expertos (MoE) de la familia Qwen3, orientado a generación de texto conversacional. La configuración publicada emplea cuantización w4a16 (pesos a 4 bits, activaciones a 16 bits) en cada uno de los cinco segmentos, caché KV en int4 y una longitud de contexto de 20.480 tokens por segmento. Cada segmento se ejecuta con 8 núcleos de NPU.

Su relevancia es acotada pero específica: permite ejecutar un MoE de gran tamaño en hardware de borde basado en NPU Rockchip RK1828, un escenario donde las alternativas habituales (GPUs de datacenter o consumer) no están disponibles. El repositorio no incluye datos de entrenamiento, benchmarks ni información sobre idiomas más allá de lo que herede del modelo fuente, por lo que esta ficha se limita a lo documentado en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (heredada de Qwen/Qwen3-30B-A3B); empaquetado RKNN para NPU RK1828 |
| Parámetros totales | 30B (según el nombre del modelo fuente; no verificado en la model card) |
| Parámetros activos | no disponible (el modelo fuente es MoE, pero la card no detalla el número de expertos activos) |
| Longitud de contexto | 20.480 tokens por segmento (llm_seg0 a llm_seg4) |
| Tipos de cuantización | w4a16 en los cinco segmentos; caché KV en int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefactos RKNN (runtime v1.2.0), no safetensors ni GGUF estándar pese al tag `gguf` del repo |
| Núcleos NPU por segmento | 8 |
| Tarjetas requeridas | 5 (RK1828) |
| Versión de runtime | RKNN v1.2.0 |
| Tamaño del repositorio | 21,1 GB |

## Arquitectura y entrenamiento

El modelo fuente Qwen3-30B-A3B es un transformer con capas de mezcla de expertos. Esta publicación no entrena ni afina el modelo: convierte los pesos originales a un formato ejecutable por el runtime RKNN de Rockchip y los cuantiza a w4a16, dividiendo el grafo en cinco segmentos que se distribuyen entre cinco tarjetas RK1828, cada una con 8 núcleos de NPU. La caché KV se almacena en int4 para reducir la huella de memoria durante la decodificación.

La model card no aporta información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo fuente pasó por RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones técnicas propias más allá del propio proceso de segmentación y cuantización para NPU. Cualquier detalle adicional sobre la arquitectura interna (número de expertos, dimensionalidad, mecanismos de atención) debe consultarse en la documentación del modelo Qwen3-30B-A3B original, no en este repositorio.

## Capacidades

- Generación de texto conversacional, heredada del modelo fuente Qwen3-30B-A3B.
- Ejecución sobre NPU RK1828 mediante el runtime RKNN v1.2.0, con reparto en cinco tarjetas.
- Contexto efectivo de 20.480 tokens por segmento, con caché KV cuantizada en int4.
- Verificación de integridad mediante SHA-256 de los artefactos descargados.
- Soporte de descarga selectiva por configuración (patrón `Qwen3-30B-A3B-w4a16-8-20480-normal-kv-int4-5cards/**`).
- Capacidades de tool calling, agentes, matemáticas, código o multimodalidad: no documentadas en esta publicación; dependen del modelo fuente y no se confirman aquí.

## Casos de uso

- Despliegue de un LLM conversacional en dispositivos de borde con NPU Rockchip RK1828: el paquete está pensado exactamente para este escenario, con los cinco segmentos y la caché KV int4 listos para cargar en el runtime v1.2.0.
- Asistentes locales sin conexión a la nube: al ejecutarse sobre NPU integrada, permite mantener conversaciones multi-turno con hasta 20.480 tokens de contexto sin depender de servicios externos.
- Procesamiento de documentos largos en el dispositivo: el contexto de 20k tokens por segmento permite resumir o extraer información de contratos, informes o manuales sin enviar datos a terceros.
- Integración en sistemas embebidos industriales: la licencia Apache 2.0 y el formato RKNN facilitan incorporar el modelo en productos comerciales que ya usan el SDK de Rockchip.
- Prototipado y validación de pipelines de inferencia en NPU: útil para equipos que evalúan el rendimiento del runtime RKNN antes de comprometerse con hardware dedicado.
- Verificación reproducible de artefactos: el flujo de descarga con `--revision v1.2.0` y la comprobación con `sha256sum -c SHA256SUMS` permiten desplegar en entornos con requisitos de integridad estrictos.
- Evaluación comparativa de cuantización w4a16 frente a otras configuraciones del mismo modelo fuente en hardware Rockchip.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de latencia o throughput, y tampoco se aportan comparaciones con otras configuraciones del mismo modelo.

## Requisitos de hardware

- NPU: cinco tarjetas Rockchip RK1828, con 8 núcleos de NPU por segmento (40 núcleos en total).
- Runtime: RKNN v1.2.0 (versión obligatoria según la configuración publicada).
- Memoria: no se especifica VRAM ni memoria por tarjeta; el repositorio ocupa 21,1 GB en disco, pero la huella en ejecución no está documentada.
- GPU: no aplica; el paquete está compilado para NPU RK1828, no para CUDA ni ROCm.
- Despliegue: exclusivamente mediante el runtime RKNN y el SDK de Rockchip; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Verificación previa al despliegue: ejecutar `sha256sum -c SHA256SUMS` dentro del directorio de configuración y confirmar que todas las entradas reportan `OK`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| RK1828-LLM-Qwen3-30B-A3B (esta ficha) | 30B (MoE, fuente) | 20.480 por segmento | RKNN w4a16, KV int4 | Apache 2.0 | NPU RK1828 (5 tarjetas) |
| Qwen/Qwen3-30B-A3B (modelo fuente) | 30B (MoE) | no disponible en esta ficha | safetensors (habitual) | Apache 2.0 | GPU / CPU |
| Otras configuraciones RKNN del mismo modelo fuente | 30B (MoE) | variable según configuración | RKNN | Apache 2.0 | NPU RK1828 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de esta configuración con alternativas de la misma categoría. La comparación se limita a parámetros, contexto, formato, licencia y plataforma de ejecución.

## Limitaciones y advertencias

- No es un modelo nuevo: es una conversión y cuantización del Qwen3-30B-A3B original; las capacidades y limitaciones reales son las del modelo fuente.
- La cuantización w4a16 y la caché KV en int4 pueden degradar la calidad respecto a los pesos originales en precisión completa; no se documenta el impacto.
- Dependencia estricta del hardware: solo funciona en NPU RK1828 con runtime RKNN v1.2.0; no es portable a GPU ni a otros aceleradores sin reconversión.
- Requiere cinco tarjetas RK1828, lo que limita su uso a entornos con ese hardware específico.
- El tag `gguf` del repositorio no se corresponde con el formato real de los artefactos (RKNN); conviene no asumir compatibilidad con llama.cpp u otras herramientas GGUF.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; deben evaluarse empíricamente antes de un despliegue en producción.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar el aviso de licencia y las atribuciones (Copyright 2024 Alibaba Cloud); el runtime y el SDK de Rockchip se distribuyen por separado bajo sus propios términos.
- La fecha de creación del repositorio (2026-11-04) y la ausencia de descargas o likes indican que se trata de una publicación reciente y sin validación comunitaria.
- Es imprescindible verificar los SHA-256 antes del despliegue; la model card lo marca como requisito previo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RKNNAI/RK1828-LLM-Qwen3-30B-A3B
- Modelo fuente: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Descarga vía ModelScope: `modelscope download --model RKNNAI/RK1828-LLM-Qwen3-30B-A3B --revision v1.2.0`
- Descarga vía Hugging Face CLI: `hf download RKNNAI/RK1828-LLM-Qwen3-30B-A3B --revision v1.2.0`
- Documentación de la configuración: `Qwen3-30B-A3B-w4a16-8-20480-normal-kv-int4-5cards/README.md` (dentro del repositorio)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
