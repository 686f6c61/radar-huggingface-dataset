# gatilin/multimodal-flow-sft-unified-backbone

## Resumen

Multimodal Flow 1.6B SFT shared backbone bundle es un paquete de investigación publicado por el usuario gatilin en Hugging Face que preserva el checkpoint de fine-tuning supervisado (SFT) del modelo hustvl/Multimodal-Flow, un modelo visión-lenguaje de 1.638.577.216 parámetros. El repositorio no introduce un modelo nuevo: empaqueta el checkpoint original completo junto con su decodificador de texto auxiliar y las estadísticas de normalización visual, manteniendo las rutas relativas del proyecto upstream. Su interés radica en que conserva intacta la arquitectura de atención compartida entre texto y visión, en lugar de separar un supuesto transformer visual independiente.

El modelo subyacente emplea una arquitectura de flow matching con un backbone de 32 bloques que comparte la atención entre modalidades y usa ramas feed-forward específicas por modalidad. El paquete contiene 573 tensores en BF16 y está pensado exclusivamente para investigación: no es una instalación completa de comprensión o generación de imágenes, ya que requiere el runtime oficial, los activos externos SigLIP2 y T5, y el decodificador Scale RAE compatible.

Es relevante ahora como artefacto reproducible para quienes estudian arquitecturas multimodales con atención compartida y flow matching, dado que fija una revisión concreta del upstream y documenta un proceso de validación de integridad de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con flow matching, backbone de 32 bloques con atención compartida texto/visión y ramas feed-forward específicas por modalidad |
| Parametros totales | 1.638.577.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | MIT (activos externos con licencias propias) |
| Formato de pesos | safetensors (573 tensores en BF16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Multimodal-Flow de hustvl, basada en flow matching para modelado multimodal. El backbone consta de 32 bloques que comparten la atención entre texto y visión (shared text/vision attention) y emplean ramas feed-forward específicas por modalidad con módulos SwiGLU. El checkpoint incluido corresponde al fine-tuning supervisado (SFT) de la revisión `13818c6b12c6ac1876a84ecf59f1d6779acc18e2` del repositorio upstream.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El paquete incluye el decodificador de texto auxiliar y las estadísticas de normalización visual (`vision_stats.pt`), así como los módulos SwiGLU visuales y de texto, que según el autor cargan estrictamente y producen salidas finitas y deterministas con entradas sintéticas. La validación documentada se limita al primer bloque y a un cálculo SDPA sin máscaras, por lo que no constituye una inferencia completa ni una evaluación de generación o comprensión de imágenes.

## Capacidades

- Generación y comprensión multimodal visión-lenguaje: el modelo está diseñado para tareas que combinan imagen y texto, aunque el paquete no incluye los activos externos necesarios para ejecutarlo de extremo a extremo.
- Flow matching multimodal: modelado generativo basado en flujos aplicado a modalidades conjuntas.
- Atención compartida entre modalidades: el backbone unifica la atención de texto y visión, lo que permite interacciones cruzadas a nivel de bloque.
- Pesos en BF16 listos para investigación: 573 tensores verificados por tamaño y metadatos SHA-256 frente al upstream.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingües específicas.

## Casos de uso

- Investigación en arquitecturas multimodales: el paquete permite estudiar la atención compartida texto/visión y las ramas feed-forward específicas por modalidad sin depender de la disponibilidad del repositorio upstream en una revisión concreta.
- Reproducibilidad de experimentos: al fijar la revisión `13818c6b12c6ac1876a84ecf59f1d6779acc18e2` y verificar los hashes LFS, sirve como base reproducible para comparar resultados con el checkpoint original.
- Análisis de flow matching: útil para investigadores que quieran inspeccionar los pesos del SFT y experimentar con variantes del proceso de flow matching en un entorno controlado.
- Desarrollo de pipelines de evaluación multimodal: el checkpoint puede integrarse en arneses de evaluación internos que ya dispongan del runtime oficial y de los activos SigLIP2, T5 y Scale RAE.
- Auditoría de integridad de pesos: los ficheros `validation_block0.json`, `attention_block0_extraction.json` y `remote_copy.json` documentan un proceso replicable de verificación de tensores y hashes.
- Docencia y formación técnica: adecuado para explicar cómo se estructura un checkpoint multimodal con atención compartida y qué componentes externos requiere un sistema de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1.638.577.216 parámetros en BF16, los pesos ocupan aproximadamente 3,3 GB, por lo que se necesita VRAM adicional para activaciones, runtime y activos externos (SigLIP2, T5, Scale RAE).
- GPU recomendadas: no disponible. Por tamaño de pesos, cabría en GPUs consumer con al menos 8-12 GB de VRAM, pero el requisito real depende del runtime oficial y de los codificadores externos.
- Cabe en consumer GPU: probablemente sí en términos de pesos, aunque no se ha validado ni documentado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor remite al proyecto oficial de GitHub para el runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gatilin/multimodal-flow-sft-unified-backbone | 1,64 B | no disponible | MIT | Hugging Face (repo de 3,4 GB) |
| hustvl/Multimodal-Flow (upstream) | no disponible en la informacion | no disponible | MIT | Hugging Face y GitHub oficial |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El paquete no es una instalación completa: requiere el runtime oficial, los activos externos SigLIP2 y T5, y el decodificador Scale RAE compatible, cada uno con su propia licencia.
- La validación realizada por el autor es parcial: cubre el primer bloque y un cálculo SDPA sin máscaras, y no constituye una inferencia completa ni una evaluación de calidad.
- Los ficheros completos no se descargaron ni se hashearon localmente; solo se verificaron tamaños LFS y metadatos SHA-256 frente al upstream.
- `vision_stats.pt` es un activo serializado de PyTorch del upstream; debe cargarse con un loader seguro y de confianza.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto.
- Uso previsto exclusivamente de investigación; no se documenta su idoneidad para producción.
- La licencia MIT del modelo no cubre necesariamente los activos externos, que tienen licencias separadas.

## Enlaces

- Hugging Face: https://huggingface.co/gatilin/multimodal-flow-sft-unified-backbone
- Modelo base: https://huggingface.co/hustvl/Multimodal-Flow
- Proyecto oficial en GitHub: https://github.com/hustvl/Multimodal-Flow
