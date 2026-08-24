# mahsery/axiom-sh-4b-v4

# Ficha del modelo axiom-sh-4b-v4

## Resumen

axiom-sh-4b-v4 es un modelo de generación de texto de 4 mil millones de parámetros, desarrollado por el usuario mahsery y publicado en HuggingFace. Está basado en el modelo Qwen/Qwen3.5-4B, del que se ofrece una versión cuantizada en formato GGUF. La cuantización GGUF permite ejecutar el modelo en entornos con recursos limitados, como CPUs o GPUs de consumo, sin necesidad de infraestructura de gran escala.

El modelo está etiquetado con las categorías shell, bash, cli, code y terminal, lo que indica un enfoque específico hacia tareas de línea de comandos, scripting y asistencia en entornos técnicos. También se le atribuye la etiqueta "conversational", sugiriendo que puede mantener diálogos de asistencia técnica. Aunque no se dispone de documentación oficial ni de detalles sobre su entrenamiento, al derivar de Qwen3.5-4B hereda las capacidades generales de este modelo base, incluyendo generación de código y comprensión de instrucciones.

Su relevancia radica en ofrecer una alternativa ligera y eficiente para tareas de automatización y soporte en terminal, con licencia Apache-2.0 (según la etiqueta de HuggingFace), lo que permite su uso comercial sin restricciones adicionales. Sin embargo, la falta de información pública sobre su rendimiento o evaluación limita la posibilidad de realizar una valoración objetiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parámetros totales | 4 mil millones (según el nombre del modelo) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (variantes no especificadas) |
| Idiomas soportados | Inglés (según la etiqueta "en") |
| Licencia | Apache-2.0 (según la etiqueta; no confirmado en la ficha) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone información pública sobre el proceso de entrenamiento de axiom-sh-4b-v4. El modelo se presenta como una cuantización de Qwen3.5-4B, que es un modelo transformer de última generación desarrollado por Qwen. La cuantización a formato GGUF implica una conversión de los pesos originales a una representación de menor precisión (por ejemplo, Q4_K_M, Q5_K_M, etc.), lo que reduce el tamaño del modelo y los requisitos de memoria, a costa de una ligera pérdida de precisión.

Dado que no se publican detalles sobre los datos de entrenamiento, el proceso de alineación (como RLHF o DPO) o innovaciones técnicas adicionales, no es posible ofrecer una descripción más allá de la herencia arquitectónica del modelo base. Se asume que mantiene las capacidades generales de Qwen3.5-4B, pero no hay confirmación oficial.

## Capacidades

- Generación de texto y finalización de código, especialmente orientada a scripts de shell, bash y comandos de terminal.
- Soporte de conversación multi-turno (etiqueta "conversational").
- Capacidades de autocompletado y sugerencia de comandos para entornos CLI.
- Generación de documentación técnica y explicaciones de comandos.
- Integración en pipelines de automatización que requieran generar o modificar scripts.
- No se ha confirmado soporte de tool calling o function calling, aunque es posible que el modelo base lo incluya; no hay evidencia en la información proporcionada.
- No se indica soporte de visión ni audio.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede generar scripts bash para backups, monitorización de recursos o despliegue de aplicaciones, aprovechando su especialización en shell.
- Asistente en terminal interactivo: integrado en un entorno de chat (por ejemplo, con Ollama o llama.cpp), puede responder a preguntas sobre comandos, opciones de herramientas y soluciones de errores.
- Generación de código en pipelines de CI/CD: dado su soporte de código, puede sugerir fragmentos para etapas de build, test o deploy dentro de scripts YAML o shell.
- Documentación técnica: puede redactar manuales o comentarios explicativos para scripts existentes, ayudando a mantener repositorios legibles.
- Educación en línea de comandos: como tutor virtual, explica el uso de comandos, redirecciones, permisos y otros conceptos de la terminal.
- Prototipado rápido de herramientas CLI: los desarrolladores pueden pedir al modelo que genere un esqueleto de script Python o bash con argumentos, flags y manejo de errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede comparar objetivamente el rendimiento con otros modelos en tareas como MMLU, HumanEval o GSM8K. Se recomienda realizar pruebas propias para evaluar su calidad en los casos de uso específicos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B con cuantización GGUF, se estima entre 2.5 y 3.5 GB para variantes Q4_K_M o Q5_K_M. La VRAM exacta depende de la variante y del tamaño de la ventana de contexto.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3060 (8 GB), RTX 4060 (8 GB) o superiores. También es viable en GPUs con 6 GB de VRAM si se usa cuantización ligera.
- Compatible con CPU: el formato GGUF permite inferencia en CPU con suficiente RAM (por ejemplo, 8 GB de RAM para el modelo en Q4_K_M).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a otro formato), llama-cpp-python, o servidores basados en GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU de gama media, se puede esperar una velocidad de generación de 10-20 tokens por segundo con cuantización Q4, pero esto es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría (modelos de 4B especializados en código y shell). Existen alternativas como Qwen2.5-Coder-3B o CodeLlama-7B, pero no se pueden comparar directamente sin datos de rendimiento de este modelo. Se recomienda evaluar en casos de uso concretos.

## Limitaciones y advertencias

- No hay documentación oficial que describa el proceso de entrenamiento, por lo que se desconoce si se ha realizado un ajuste específico para tareas de shell o si se trata simplemente de una cuantización del modelo base.
- Al ser una cuantización, existe pérdida de precisión respecto al modelo original, lo que puede afectar a la exactitud en tareas complejas de código.
- No se han evaluado sesgos o riesgos de alucinación; como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en comandos avanzados o entornos no estándar.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el modelo base (Qwen3.5-4B) cumple con la misma licencia (en general, los modelos Qwen tienen licencia Apache-2.0, pero es recomendable confirmar).
- No se ha confirmado la longitud de contexto; si es limitada, las conversaciones largas o scripts extensos pueden verse truncados.
- El modelo no tiene soporte de visión ni otras modalidades.

## Enlaces

- [HuggingFace: mahsery/axiom-sh-4b-v4](https://huggingface.co/mahsery/axiom-sh-4b-v4)
- No se encontraron otros enlaces relevantes (papers, repos, demos) en la búsqueda web.
