# FlagRelease/Darwin-9B-NEG-FINAL-hygon-FlagOS

## Resumen

Darwin-9B-NEG es un modelo de lenguaje de 9.650 millones de parámetros desarrollado originalmente por FINAL-Bench y adaptado por FlagRelease para su despliegue sobre aceleradores Hygon mediante el stack de software FlagOS. La variante publicada en este repositorio (`FlagRelease/Darwin-9B-NEG-FINAL-hygon-FlagOS`) incluye scripts de inferencia preconfigurados y una imagen de contenedor FlagOS-Hygon que permite poner el modelo en producción en minutos.

La innovación principal del modelo es la Native Entropy Gating (NEG), una técnica arquitectónica propietaria que incorpora una medida de autoconfianza directamente en los pesos del modelo. A diferencia de métodos externos de iteración multi-turno (MTI) que requieren entre 3 y 8 veces más inferencia, NEG opera dentro del bucle de decodificación y se activa en menos del 5 % de los tokens, lo que permite un razonamiento autorregulado sin penalizar la latencia. El modelo se basa en la arquitectura Qwen3.5 (etiquetado como `qwen3_5`) y soporta una ventana de contexto de 32 768 tokens, según el comando de arranque vLLM incluido en la documentación.

La relevancia de esta publicación radica en que demuestra la migración eficiente de un modelo de razonamiento avanzado a hardware no NVIDIA (Hygon DCU) utilizando un stack completamente open source, lo que reduce la dependencia de ecosistemas propietarios y abarata el despliegue en centros de datos con aceleradores alternativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Darwin v8 con Native Entropy Gating (NEG), basada en Qwen3.5 |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens (según `--max-model-len` en vLLM) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors) |
| Idiomas soportados | 5 idiomas: ingles, chino, coreano, japones y otro no especificado (segun etiquetas del modelo base) |
| Licencia | no disponible en este repositorio; el modelo base FINAL-Bench/Darwin-9B-NEG declara Apache-2.0 |
| Formato de pesos | safetensors (repo de 19,3 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Darwin v8, una evolución de la familia Qwen3.5, con la incorporación de Native Entropy Gating (NEG). NEG es un mecanismo que introduce una señal de confianza aprendida dentro de los pesos del transformer, permitiendo que el modelo regule su propio proceso de razonamiento sin necesidad de pasos de verificación externos. Según la documentación del modelo base, NEG se activa en menos del 5 % de los tokens generados, lo que implica un coste computacional adicional mínimo durante la decodificación.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.) en la información disponible. El repositorio FlagRelease se centra en la integración y optimización del despliegue, no en el entrenamiento. La adaptación para Hygon se realiza mediante el stack FlagOS, que incluye FlagGems (biblioteca de operadores en Triton), FlagTree (compilador unificado), FlagScale y vllm-plugin-fl (para ejecutar vLLM sobre hardware Hygon) y FlagCX (biblioteca de comunicación entre chips).

## Capacidades

- Razonamiento autorregulado con autoconfianza embebida (NEG), sin necesidad de iteraciones externas.
- Generación de texto y razonamiento multi-step, con resultados destacados en el benchmark GPQA_Diamond (86,93 con el stack FlagOS).
- Soporte multilingüe en al menos 5 idiomas, incluyendo ingles, chino, coreano y japones.
- Integración nativa con vLLM para servir el modelo mediante API compatible con OpenAI (`/v1/chat/completions`).
- Compatibilidad con AnythingLLM para su uso como backend de asistentes conversacionales.
- Capacidad de ejecución sobre aceleradores Hygon (DCU) mediante el stack FlagOS, con soporte de contenedores Docker preconfigurados.
- No se especifican capacidades de tool calling, function calling, vision o audio en la documentación disponible.

## Casos de uso

- Razonamiento cientifico y tecnico: el modelo alcanza 86,93 en GPQA_Diamond, un benchmark de preguntas de nivel de posgrado en fisica, quimica y biologia, por lo que puede utilizarse como asistente de investigacion en entornos academicos o de I+D.
- Despliegue en centros de datos con aceleradores Hygon: gracias a la imagen FlagOS-Hygon y los scripts preconfigurados, el modelo puede ponerse en produccion en infraestructura no NVIDIA sin necesidad de portar manualmente el codigo.
- Asistentes conversacionales multilingues: con soporte para 5 idiomas y una ventana de 32K tokens, puede gestionar conversaciones largas y documentos extensos en aplicaciones de atencion al cliente o asistentes virtuales.
- Razonamiento de multiples pasos en entornos de baja latencia: al activar NEG en menos del 5 % de los tokens, el modelo ofrece capacidades de auto-verificacion sin el coste de tecnicas MTI, adecuado para sistemas de respuesta en tiempo real.
- Integracion con vLLM para servir APIs compatibles con OpenAI: permite sustituir modelos propietarios en aplicaciones existentes cambiando unicamente la URL del endpoint y el nombre del modelo.
- Evaluacion comparativa de stacks de software: el repositorio incluye resultados de benchmarks que comparan el rendimiento del modelo con el stack nativo frente a FlagOS, util para organizaciones que evaluan la migracion de su infraestructura de inferencia.

## Benchmarks y rendimiento

La model card del repositorio FlagRelease incluye una tabla de evaluacion comparativa entre el modelo ejecutado con el stack original y con FlagOS:

| Metrica | Darwin-9B-NEG (stack original) | Darwin-9B-NEG (FlagOS) |
|---|---|---|
| GPQA_Diamond | 0 | 86,93 |
| ERQA | - | - |
| Aime24 | - | - |

El valor de 0 en la columna "Origin" sugiere que el modelo no es capaz de ejecutarse correctamente con el stack nativo en hardware Hygon, mientras que con FlagOS alcanza 86,93. No se han publicado resultados para ERQA ni Aime24. No se dispone de datos adicionales de benchmarks como MMLU, HumanEval o GSM8K en la informacion proporcionada.

## Requisitos de hardware

- Aceleradores: GPU Hygon DCU (compatibles con ROCm). El contenedor Docker requiere los dispositivos `/dev/kfd`, `/dev/mkfd` y `/dev/dri`, asi como el grupo `video`.
- VRAM estimada: el repositorio ocupa 19,3 GB en safetensors, por lo que se necesitan al menos 20 GB de memoria para cargar los pesos en precision FP16. Con cuantizacion (no disponible en este repositorio) el requisito podria reducirse.
- GPU recomendada: una unica Hygon DCU con al menos 32 GB de VRAM para el contexto completo de 32K tokens. El comando de arranque usa `--tensor-parallel-size 1`, indicando que no se requiere paralelismo entre GPUs.
- Opciones de despliegue: vLLM (con vllm-plugin-fl), Docker con imagen FlagOS-Hygon, e integracion con AnythingLLM.
- Latencia y throughput: no se han publicado datos numericos. La activacion de NEG en menos del 5 % de los tokens sugiere una sobrecarga minima respecto a un transformer estandar.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de 9B. El modelo base comparte arquitectura con Qwen3.5, pero no se han publicado resultados comparativos en los benchmarks estandar. Se puede indicar lo siguiente:

| Modelo | Parametros | Contexto | Licencia | GPQA_Diamond |
|---|---|---|---|---|
| Darwin-9B-NEG (FlagOS) | 9,65 B | 32K | Apache-2.0 (modelo base) | 86,93 |
| Qwen3.5 (base, 9B) | ~9 B | no disponible | Apache-2.0 | no disponible |
| Otros modelos 9B (p.ej. Llama 3.1 8B) | 8 B | 128K | Llama 3.1 | ~30-40 (estimado) |

Los datos de Qwen3.5 y Llama no estan confirmados en la informacion proporcionada; se marcan como no disponibles para evitar invenciones.

## Limitaciones y advertencias

- La licencia del repositorio FlagRelease no esta especificada. Aunque el modelo base declara Apache-2.0, la adaptacion para Hygon podria incluir componentes con restricciones adicionales. Se recomienda verificar antes de uso comercial.
- El modelo solo se ha validado en hardware Hygon con el stack FlagOS. No hay garantias de funcionamiento en GPUs NVIDIA o AMD convencionales sin adaptacion.
- Los benchmarks publicados son muy limitados (solo GPQA_Diamond). No se dispone de resultados en MMLU, HumanEval, GSM8K u otros tests estandar, lo que dificulta evaluar su rendimiento general.
- El valor de 0 en la columna "Origin" sugiere que el modelo no funciona sin FlagOS en este hardware, lo que implica una dependencia total del stack propietario de FlagRelease.
- No se han documentado sesgos, riesgos de alucinacion o limitaciones de idioma especificos. Al ser un modelo derivado de Qwen3.5, podria heredar sesgos del dataset de entrenamiento de Qwen.
- El modelo es muy reciente (agosto de 2026) y tiene cero descargas y cero likes en HuggingFace, por lo que su adopcion y validacion por la comunidad es practicamente nula.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FlagRelease/Darwin-9B-NEG-FINAL-hygon-FlagOS
- Modelo base FINAL-Bench/Darwin-9B-NEG: https://huggingface.co/FINAL-Bench/Darwin-9B-NEG
- README del modelo base: https://huggingface.co/FINAL-Bench/Darwin-9B-NEG/blob/main/README.md
- Codigo de modelado (modeling_darwin_neg.py): https://huggingface.co/FINAL-Bench/Darwin-9B-NEG/blob/main/modeling_darwin_neg.py
- GitHub FlagRelease: https://github.com/flagos-ai/FlagRelease
- Articulo arxiv (referenciado en el modelo base): arxiv:2605.14386
- OpenModelIndex (ficha del modelo base): https://omi.solexsis.com/m/FINAL-Bench/Darwin-9B-NEG
