# amarsadan/X-YEMEN_HACK-AI_V1.GGUF

## Resumen

X-YEMEN_HACK-AI_V1.GGUF es un adaptador LoRA publicado por el usuario amarsadan, acompañado de su exportación en formato GGUF, entrenado sobre el modelo base SC117/LFM2.5-2.6B-Uncensored. No se trata de un modelo entrenado desde cero, sino de un ajuste fino comunitario: el repositorio contiene los pesos del adaptador (1.179.648 parámetros según el recuento de safetensors) y una versión cuantizada lista para motores de inferencia local.

El nombre sugiere que el adaptador se entrenó en el marco de un hackathon ("YEMEN HACK AI"), y la ficha declara el pipeline text-generation junto con los tags lora, transformers, unsloth y peft, lo que apunta a un flujo de trabajo de fine-tuning con la librería Unsloth (PEFT 0.18.1) y exportación posterior a GGUF. La model card es la plantilla por defecto de HuggingFace y no está cumplimentada: no hay datos sobre desarrolladores, dataset de entrenamiento, hiperparámetros, licencia, idiomas ni resultados de evaluación.

Su relevancia es limitada y de carácter práctico: sirve como ejemplo reproducible de la cadena LoRA -> GGUF sobre una base de 2,6B sin alineamiento de rechazo ("uncensored"), y como punto de partida para experimentar con despliegue en CPU o GPU de gama baja. Con cero descargas y cero likes en el momento de la consulta, no cuenta con validación externa alguna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base SC117/LFM2.5-2.6B-Uncensored; la arquitectura del modelo base no se documenta en la información disponible |
| Parámetros totales | 1.179.648 en el adaptador (dato real, safetensors). El modelo base declara 2,6B en su nombre; no disponible el desglose exacto |
| Parámetros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Se publica un artefacto GGUF, pero no se especifican los niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.): no disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (ni la del adaptador ni la del modelo base) |
| Formato de pesos | Safetensors (adaptador PEFT) y GGUF (artefacto cuantizado) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador de bajo rango (LoRA) gestionado con PEFT 0.18.1, apuntado al modelo base SC117/LFM2.5-2.6B-Uncensored. No se ha publicado información sobre el rango (r), alpha, módulos objetivo, tasa de aprendizaje, número de pasos, composición del dataset ni si hubo fases de RLHF, DPO o similar. El tag unsloth sugiere que el entrenamiento se realizó con dicha librería, optimizada para fine-tuning de bajo consumo de memoria, pero esto es una inferencia a partir de los metadatos, no un dato confirmado en la model card.

Tampoco se documenta ninguna innovación técnica propia: no hay decodificación especulativa, atención lineal ni mecanismos alternativos descritos. La referencia arxiv:1910.09700 que aparece en los tags corresponde al artículo de Lacoste et al. (2019) sobre estimación de emisiones de carbono, incluido en la plantilla por defecto de HuggingFace, y no a un paper del modelo. El tag base_model:adapter confirma que se trata de un adaptador derivado, por lo que su comportamiento queda ligado al de SC117/LFM2.5-2.6B-Uncensored, cuya ficha técnica no forma parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional: la ficha declara el pipeline text-generation y el tag conversational, por lo que el uso previsto es el diálogo en formato instrucción.
- No hay evidencia documentada de soporte de tool calling o function calling en la información disponible.
- No hay evidencia documentada de capacidades de agente, razonamiento multi-paso o uso de plantillas con herramientas.
- No se declaran capacidades de visión, audio ni multimodalidad.
- No se declaran idiomas soportados; se desconoce si el adaptador conserva el multilingüismo del modelo base o si lo ha reducido al idioma del dataset de fine-tuning.
- Capacidad especial derivada del modelo base: al proceder de una variante "uncensored", es previsible que no aplique las barreras de rechazo habituales de los modelos alineados, lo que constituye a la vez su rasgo distintivo y su principal riesgo (no verificado con evaluaciones publicadas).
- Cualquier capacidad adicional (modo de pensamiento explícito, contexto largo, código, matemáticas) no está documentada ni evaluada en la información disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: al disponer de un artefacto GGUF, el modelo puede cargarse en llama.cpp u Ollama sobre un portátil y usarse para validar flujos de chat multi-turno sin depender de APIs externas.
- Investigación sobre fine-tuning eficiente: sirve como caso de estudio de la cadena Unsloth + PEFT + exportación GGUF, útil para replicar el proceso con otros datasets y medir costes de entrenamiento en una GPU de consumo.
- Experimentación académica con modelos "uncensored": permite estudiar cómo se comporta una base sin alineamiento de rechazo tras un ajuste fino adicional, dentro de un entorno controlado.
- Red teaming y evaluación de seguridad: dado que el modelo base carece de barreras de rechazo, puede emplearse como sujeto de pruebas para medir la eficacia de clasificadores de contenido y filtros de moderación externos.
- Punto de partida para fine-tuning incremental: el adaptador puede reutilizarse o fusionarse y seguir entrenándose con nuevos datos específicos de dominio, aprovechando que el coste de partida es bajo (1,18M parámetros de adaptador frente a los 2,6B del modelo base).
- Generación de texto creativo sin restricciones temáticas: en entornos editoriales o de ficción donde se requiere evitar los rechazos automáticos de los modelos alineados, con revisión humana obligatoria posterior.
- Despliegue en hardware muy limitado: la combinación de un modelo base de 2,6B con cuantización GGUF permite ejecutar inferencia en CPU o en iGPU, útil para demos offline y entornos sin GPU dedicada.
- Docencia y talleres: como ejemplo mínimo y reproducible de publicación de un adaptador LoRA con doble formato de pesos (safetensors y GGUF) en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación sin cumplimentar ("[More Information Needed]") y no se han encontrado cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto en los resultados de búsqueda consultados, que además no guardan relación con el modelo.

## Requisitos de hardware

- Tamaño del adaptador: 1.179.648 parámetros. En precisión de 16 bits ocupa aproximadamente 2,4 MB, de modo que el cuello de botella de recursos lo determina siempre el modelo base de 2,6B, no el adaptador.
- VRAM estimada para el modelo base completo (estimaciones derivadas del recuento de 2,6B parámetros, no cifras publicadas por el autor):
  - FP16/BF16: en torno a 5,2 GB de pesos más overhead de activaciones y caché KV.
  - INT8 (Q8_0): aproximadamente 2,8 GB.
  - Q6_K: aproximadamente 2,2 GB.
  - Q5_K_M: aproximadamente 1,9 GB.
  - Q4_K_M: aproximadamente 1,6 GB.
- GPU recomendadas: para FP16, una RTX 3060 de 12 GB o superior; para cuantizaciones Q4/Q5, cualquier GPU con 4-6 GB de VRAM (GTX 1650 4 GB, RTX 3050 6 GB) es suficiente. Los modelos de 2,6B no requieren A100 ni H100 salvo para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 6 GB o más, y en equipos Apple Silicon con memoria unificada de 8 GB en adelante.
- CPU: la inferencia en GGUF cuantizado a Q4 es viable en CPU moderna (8 núcleos o más) con decodificación de unos pocos tokens por segundo; no se dispone de mediciones concretas.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llamafile) para el artefacto GGUF; vLLM o TGI si se fusiona el adaptador con el modelo base y se exporta a safetensors en formato Transformers; la carga directa del adaptador requiere transformers + peft.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de evaluación del modelo ni de su base, por lo que la comparación se limita a atributos técnicos y administrativos. Cualquier comparación de rendimiento con alternativas de la misma franja (2-3B) carecería de base verificable.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-YEMEN_HACK-AI_V1.GGUF | Adaptador de 1,18M sobre base de 2,6B | No disponible | No publicado | No disponible | HuggingFace, 0 descargas |
| SC117/LFM2.5-2.6B-Uncensored (modelo base) | 2,6B (según denominación) | No disponible | No publicado | No disponible | HuggingFace |
| Otras alternativas de 2-3B en la misma franja | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: ni el adaptador ni el modelo base indican términos de uso, lo que impide determinar si el uso comercial está permitido. En la práctica, esto equivale a no poder desplegarlo en producción con garantías legales.
- Model card vacía: sin información sobre dataset, hiperparámetros, proceso de filtrado ni evaluación. No es reproducible ni auditable.
- Base "uncensored": el punto de partida carece de alineamiento de rechazo, por lo que el modelo puede generar contenido ofensivo, ilegal o peligroso. No debe exponerse directamente a usuarios finales sin una capa de moderación independiente.
- Riesgo elevado de alucinación: los modelos de ~2,6B parámetros tienen una capacidad limitada de recuperación factual y tienden a inventar datos, especialmente en dominios especializados.
- Idiomas no verificados: no hay garantía de un rendimiento aceptable en castellano; el ajuste fino pudo reducir o degradar el soporte multilingüe del modelo base.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo (documentos extensos, conversaciones largas, RAG con muchos fragmentos) sin una medición previa.
- Sesgos no documentados: al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos de género, etnia, religión o ideología. El contexto de hackathon sugiere un conjunto de datos pequeño y no curado.
- Ausencia de validación por la comunidad: cero descargas y cero likes. No hay informes de terceros que confirmen que el artefacto GGUF carga correctamente ni que el adaptador produce salidas coherentes.
- Discrepancia de metadatos: el recuento de 1.179.648 parámetros corresponde al adaptador y no al modelo funcional, lo que puede inducir a error si se interpreta como el tamaño real del sistema desplegado.
- Fecha de creación registrada en 2026, sin historial de versiones ni mantenimiento posterior visible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/amarsadan/X-YEMEN_HACK-AI_V1.GGUF
- Modelo base: https://huggingface.co/SC117/LFM2.5-2.6B-Uncensored
- Artículo referenciado en los tags (Lacoste et al., 2019, sobre emisiones de carbono; forma parte de la plantilla por defecto y no es un paper del modelo): https://arxiv.org/abs/1910.09700
- PEFT, librería declarada en la ficha: https://huggingface.co/docs/peft
- Unsloth, herramienta indicada por los tags: https://github.com/unslothai/unsloth
- llama.cpp, motor habitual para pesos GGUF: https://github.com/ggml-org/llama.cpp
- Resultados de búsqueda web consultados (foros sin contenido relevante sobre el modelo): https://forum.education-sa.com/edu8568/ y https://forum.education-sa.com/edu2785/
