# mradermacher/Ouroboros-24B-v1.4-i1-GGUF

## Resumen

Ouroboros-24B-v1.4 es un modelo de lenguaje de 24 000 millones de parámetros (23,57 B) desarrollado por Naphula, especializado en escritura creativa, ficción y roleplay, según los metadatos asociados a su distribución. La versión aquí descrita es una cuantización GGUF con matriz de importancia (imatrix) realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante motores de inferencia como llama.cpp, Ollama o LM Studio. El repositorio contiene múltiples niveles de cuantización (desde IQ1_S hasta Q6_K) y está pensado para entornos locales y despliegues con recursos limitados.

La relevancia de esta ficha radica en que ofrece una alternativa accesible a modelos propietarios de tamaño similar para tareas de generación de texto narrativo, con la ventaja de poder ejecutarse sin conexión y con control total sobre los pesos. Aunque no se dispone de información oficial sobre arquitectura, licencia o datos de entrenamiento, los tags asociados al modelo indican un enfoque claro en ficción, storytelling y roleplay.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 23.572.444.160 (23,57 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles (segun tags, no confirmado oficialmente) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el original) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna (número de capas, tipo de atención, etc.) ni sobre el proceso de entrenamiento (composición del dataset, número de tokens, técnicas de alineación como RLHF o DPO). El modelo original se distribuye en formato safetensors y esta versión es una conversión a GGUF con cuantización por imatrix, técnica que optimiza la distribución de pesos para reducir la pérdida de calidad en cuantizaciones agresivas. Los tags del repositorio original mencionan "OccultAI/illuminati_imatrix_v1", lo que sugiere que se utilizó una matriz de importancia específica para mejorar la fidelidad en tareas de escritura creativa.

## Capacidades

- Generación de texto narrativo: ficción, ciencia ficción, romance, fantasía y otros géneros.
- Continuación de historias y escenas: puede continuar un relato a partir de un fragmento dado.
- Escritura descriptiva y vívida: enfocado en prosa rica y detallada.
- Roleplay: capacidad para mantener personajes y diálogos coherentes en contextos de juego de rol.
- Generación de tramas y subtramas: útil para planificar estructuras narrativas.
- No se ha confirmado soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Escritura de ficción asistida: el modelo puede generar borradores de capítulos, descripciones de escenarios o diálogos, y el escritor los edita y combina. Su enfoque en narrativa lo hace adecuado para esta tarea.
- Creación de contenido para juegos de rol: permite generar personajes, trasfondos, misiones y respuestas del máster en partidas de rol, manteniendo coherencia en la historia.
- Generación de guiones y diálogos: útil para prototipos de obras teatrales, cinematográficas o de videojuegos, donde se requiere variedad de voces y estilos.
- Asistente de escritura para blogs o novelas web: puede sugerir giros argumentales, expandir ideas o reescribir pasajes con un tono específico.
- Prácticas de escritura creativa en entornos educativos: los estudiantes pueden usarlo para generar ejemplos de distintos géneros y analizar estructuras narrativas.
- Generación de contenido para redes sociales o newsletters con estilo literario: produce textos atractivos y con gancho para audiencias que valoran la prosa cuidada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada según cuantización (valores aproximados para el peso del modelo):
  - IQ1_S (~3-4 GB): cabe en GPUs con 6 GB de VRAM.
  - Q4_K_M (~14 GB): requiere al menos 16 GB de VRAM (RTX 4080, RTX 4090, A100 40GB, etc.).
  - Q6_K (~20 GB): necesita 24 GB o más (RTX 3090, RTX 4090, A6000).
  - Q8_0 (~25 GB): solo en GPUs profesionales con 32 GB o más.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4/Q5; A100 o H100 para las más altas.
- Compatible con consumer GPU: sí, para cuantizaciones bajas (Q2-Q4) en GPUs con 8-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión previa a formato compatible).
- Latencia y throughput: no disponibles, dependen del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría (tamaño y propósito). No se conocen modelos abiertos de 24B especializados en escritura creativa con datos públicos de rendimiento. Se recomienda evaluar el modelo directamente en las tareas objetivo.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial puede no estar permitido o requerir contacto con el autor original. Se debe verificar antes de desplegar en producción.
- Idiomas no confirmados: aunque los tags indican inglés, no hay garantía de soporte multilingüe.
- Riesgo de alucinaciones: al ser un modelo de generación de texto, puede inventar hechos, nombres o detalles inconsistentes, especialmente en contextos largos.
- Sesgos potenciales: al entrenarse con datos de ficción, puede reproducir estereotipos de género, raza o cultura presentes en la literatura.
- Sin información sobre contexto máximo: se desconoce si maneja ventanas largas (más de 8K tokens) o si degrada la calidad con contextos extensos.
- La cuantización agresiva (IQ1, IQ2) puede reducir notablemente la calidad de salida; se recomienda usar Q4 o superior para tareas profesionales.

## Enlaces

- Repositorio cuantizado (este): https://huggingface.co/mradermacher/Ouroboros-24B-v1.4-i1-GGUF
- Repositorio original (safetensors): https://huggingface.co/Naphula/Ouroboros-24B-v1.4
- Versión GGUF sin sufijo i1: https://huggingface.co/mradermacher/Ouroboros-24B-v1.4-GGUF
- Página de inferencia gestionada en FriendliAI: https://friendli.ai/models/Naphula/Ouroboros-24B-v1.4
