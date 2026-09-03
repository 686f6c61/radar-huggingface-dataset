# AbteeXAILab/lumynax-nz-3b

## Resumen

LumynaX NZ 3B V1 es un modelo de lenguaje de generación de texto desarrollado por AbteeX AI Labs, un laboratorio de inteligencia artificial con sede en Aotearoa (Nueva Zelanda), centrado en la creación de modelos soberanos para sectores regulados como salud, gobierno, justicia y defensa. Este modelo forma parte de la familia LumynaX, cuyo objetivo es ofrecer capacidades de IA local-first y soberana, con soporte para inglés y maorí (mi).

Se trata de un release legacy, etiquetado explícitamente como "outdated research artifact" (artefacto de investigación desactualizado) por sus propios autores. No está recomendado para uso en producción y no representa las capacidades actuales de la arquitectura LumynaX Core. El nombre sugiere 3 mil millones de parámetros, aunque este dato no está confirmado en la documentación oficial. El repositorio ocupa 12,4 GB, lo que sugiere pesos en precisión completa o media, pero no se especifica el formato exacto.

La relevancia de este modelo reside en su carácter de documento histórico: permite estudiar las primeras aproximaciones de AbteeX AI Labs hacia la construcción de modelos de lenguaje nativos, sin infusiones de pesos externos, y su apuesta por lenguas minoritarias como el maorí. No obstante, cualquier evaluación debe considerar que se trata de una versión obsoleta y no representativa del estado actual de la tecnología de la compañía.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, no confirmado) |
| Parametros totales | no disponible (el nombre sugiere 3B, no confirmado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en), maori (mi) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors (segun tags de HuggingFace) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. La model card indica que se trata de un "LumynaX-native release", es decir, un modelo con pesos propios, sin infusiones de modelos open source externos. No se especifican datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO.

El modelo se describe como un artefacto histórico que precede a la implementación actual de LumynaX Core. No se documentan innovaciones técnicas específicas en esta versión. Los tags de HuggingFace indican compatibilidad con vLLM, NVIDIA NIM y NVIDIA NeMo, lo que sugiere que puede ejecutarse en esos runtimes, pero no se aportan detalles sobre optimizaciones de inferencia.

## Capacidades

- Generacion de texto: el modelo está diseñado para tareas de generación de lenguaje natural, según su pipeline de text-generation.
- Soporte bilingue: cubre inglés y maorí, lo que lo hace relevante para aplicaciones en Nueva Zelanda y contextos de preservación lingüística.
- Compatibilidad con runtimes de inferencia: los tags indican soporte para vLLM, NVIDIA NIM y NVIDIA NeMo, aunque no se documentan pruebas específicas.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

Dado el carácter legacy y la falta de documentación técnica, los casos de uso realistas se limitan a contextos de investigación y evaluación histórica:

- Investigacion academica sobre modelos soberanos: el modelo puede utilizarse para estudiar las primeras aproximaciones de AbteeX AI Labs a la construcción de LLMs nativos, comparando su comportamiento con modelos posteriores de la misma familia.
- Experimentacion con lenguas minoritarias: su soporte para maorí permite explorar tareas de generación de texto en este idioma, aunque sin garantías de calidad debido a su estado desactualizado.
- Auditoria de artefactos de investigacion: sirve como referencia para verificar la reproducibilidad de los experimentos documentados en el repositorio de la compañía.
- Pruebas de compatibilidad con runtimes: puede emplearse para validar la integración con vLLM o NVIDIA NIM en entornos de prueba, aunque no se recomienda para producción.
- Formacion en evaluacion de modelos: es un caso práctico para enseñar a identificar señales de obsolescencia y riesgos en modelos publicados sin documentación completa.
- Analisis de sesgos linguisticos: permite estudiar cómo un modelo entrenado principalmente en inglés se comporta en maorí, un área de interés para la soberanía digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. El tamaño del repositorio (12,4 GB) sugiere que los pesos podrían ocupar entre 6 y 12 GB en memoria, dependiendo de la precisión (fp16 o fp32). Para una estimación orientativa:

- VRAM estimada: al menos 8-12 GB para inferencia en fp16, asumiendo 3B parámetros (no confirmado).
- GPU recomendadas: tarjetas con 12 GB o más de VRAM, como RTX 3060, RTX 4070, o GPUs de datacenter como A10 o A100.
- Posible ejecución en consumer GPU: sí, si la estimación de 3B es correcta, cabría en GPUs de 12 GB.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), NVIDIA NIM, NVIDIA NeMo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene benchmarks publicados y su arquitectura no está documentada. No se pueden comparar parámetros, contexto ni rendimiento con alternativas como Llama 3.2 3B, Gemma 3 4B o Qwen 2.5 3B, ya que no hay datos objetivos. Se recomienda tratar este modelo como un caso aislado y no como una opción competitiva frente a modelos actuales.

## Limitaciones y advertencias

- Release legacy y desactualizado: la propia model card lo califica como "outdated research artifact" y no recomendado para producción.
- Licencia ambigua: la licencia se indica como "other" sin especificar los términos exactos. Es necesario revisar el archivo LICENSE.txt del repositorio antes de cualquier uso.
- Documentación insuficiente: no se detallan arquitectura, datos de entrenamiento, contexto ni benchmarks, lo que impide una evaluación rigurosa.
- Riesgo de alucinación y sesgos: al no documentarse el proceso de entrenamiento ni las medidas de seguridad, no se puede garantizar fiabilidad ni ausencia de sesgos.
- Soporte limitado de idiomas: solo inglés y maorí, sin cobertura de otros idiomas.
- Sin garantías de soporte: al ser un artefacto histórico, es probable que no reciba mantenimiento ni actualizaciones.
- Compatibilidad incierta: aunque los tags indican soporte para vLLM y NIM, no hay pruebas publicadas que lo confirmen.

## Enlaces

- HuggingFace: https://huggingface.co/AbteeXAILab/lumynax-nz-3b
- Repositorio fuente: https://github.com/Aimaghsoodi/lumynax-nz-3b
- Sitio de AbteeX AI Labs: https://abteex.com
- Sitio de LumynaX: https://lumynax.com
- Contacto: mailto:aimaghsoodi@abteex.com
