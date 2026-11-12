# heraklestech/felsefe-ft-v1

## Resumen

felsefe-ft-v1 es un adaptador LoRA de ajuste supervisado (SFT) publicado por heraklestech sobre el modelo base Qwen3-4B en su variante cuantizada a 4 bits de Unsloth. No es un modelo conversacional al uso: está entrenado para transformar una afirmación o tesis en un registro estructurado de revisión compuesto por cuatro campos (decisión, razonamiento, falsificador y contraejemplo). El objetivo declarado es generar falsadores y contraejemplos antes de aceptar una afirmación, en línea con una metodología de trabajo "evidence-bound" (vinculada a evidencia).

El adaptador es deliberadamente pequeño: 137 pares de entrenamiento, 3 épocas, 27 pasos y una longitud máxima de secuencia de 1024 tokens. El repositorio ocupa 0,1 GB y se distribuye en formato PEFT/safetensors, por lo que requiere cargar el modelo base Qwen3-4B para funcionar. El idioma principal es el turco y el autor no ha especificado licencia.

Su relevancia es acotada pero clara: ejemplifica un patrón de ajuste fino muy específico (generación de formularios de revisión filosófica) con un enfoque inusualmente honesto en la documentación, que declara explícitamente la ausencia de benchmarks y de alineación de seguridad. No compite en capacidades generales con modelos de su tamaño, sino que cubre una tarea de nicho con un formato de salida fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-4B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-4B tiene 4 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud máxima de secuencia en entrenamiento); contexto del base no disponible en la información proporcionada |
| Tipos de cuantizacion | el base se distribuye en bnb-4bit; el adaptador en safetensors sin cuantizar |
| Idiomas soportados | turco (principal); otros idiomas degradan según el autor |
| Licencia | no especificada por el autor; tratar como todos los derechos reservados |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base unsloth/Qwen3-4B-unsloth-bnb-4bit |

## Arquitectura y entrenamiento

El adaptador emplea LoRA sobre el modelo Qwen3-4B, un transformer decoder-only de 4 000 millones de parámetros. El ajuste se realizó con SFT mediante las librerías TRL y Unsloth, con 3 épocas completas, 27 pasos de optimización y una longitud máxima de secuencia de 1024 tokens. El entrenamiento completo duró 178 segundos de tiempo de pared, según el recibo MAKBUZ.json incluido en el repositorio.

Los datos de entrenamiento son 137 pares etiquetados en turco con la estructura afirmación → decisión, razonamiento, falsificador y contraejemplo, procedentes de una curación propia del autor y no de un corpus público. No se realizó barrido de hiperparámetros ni hay evidencia de RLHF o DPO. La pérdida final de entrenamiento fue de 2,3789. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras); el interés del proyecto reside en el formato de salida y en la disciplina de documentación, no en la arquitectura.

## Capacidades

- Generación de registros estructurados de revisión con cuatro campos: decisión, razonamiento, falsificador y contraejemplo.
- Redacción de falsadores (condiciones que refutarían una afirmación) y contraejemplos para tesis dadas.
- Conversión de una nota de revisión en un registro de decisión legible por máquina.
- Generación de texto en turco con formato controlado por el prompt.
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada: el autor advierte que otros idiomas distintos del turco degradan el rendimiento.

## Casos de uso

- Revisión de tesis en investigación: dado un enunciado, el adaptador propone un falsificador y un contraejemplo que el investigador debe verificar externamente antes de aceptar la afirmación. Es adecuado porque su entrenamiento se centró exactamente en ese formato.
- Registro de decisiones en pipelines locales: en un flujo offline, el adaptador convierte notas de revisión en registros estructurados con campos fijos, lo que facilita su almacenamiento y auditoría posterior.
- Filtrado previo de afirmaciones en documentación técnica: antes de publicar una afirmación, se genera un falsificador que un revisor humano evalúa, reduciendo el riesgo de aseveraciones no sustentadas.
- Docencia de metodología filosófica: el modelo produce ejemplos de contraejemplos y condiciones de refutación para un enunciado, útiles como material de discusión en un aula de filosofía de la ciencia.
- Anotación asistida de corpus en turco: el adaptador genera propuestas de etiquetas (decisión, razonamiento, falsificador, contraejemplo) que un anotador humano corrige, acelerando la creación de conjuntos etiquetados.
- Prototipado de formularios de revisión en herramientas internas: al fijar el formato de salida, se integra en un servicio local que devuelve registros estructurados sin requerir un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que la evaluación en conjunto reservado (exact-match del campo falsificador) no se midió (`OLCULEMEDI`), que la fluidez en turco no se puntuó cualitativamente y que no hay tabla de benchmarks porque ninguno se midió. El único dato numérico de rendimiento es la pérdida final de entrenamiento de 2,3789.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa 0,1 GB; el modelo base Qwen3-4B en 4 bits requiere aproximadamente 3-4 GB de VRAM para inferencia, más overhead de activaciones y contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y holgadas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización 4 bits.
- Opciones de despliegue: transformers con PEFT (el método documentado por el autor), vLLM y llama.cpp no están documentados para este adaptador; Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| heraklestech/felsefe-ft-v1 | LoRA sobre Qwen3-4B | 1024 en entrenamiento | Generación de registros de revisión filosófica en turco | No especificada | Hugging Face, 3 descargas |
| Qwen3-4B (base) | 4 000 millones | no disponible en la información | Generación de texto general | no disponible en la información | Hugging Face |
| Adaptadores LoRA de nicho comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores LoRA de revisión filosófica en turco) en la documentación proporcionada.

## Limitaciones y advertencias

- Conjunto de datos muy pequeño (137 pares): riesgo alto de sobreajuste a las formulaciones del entrenamiento; no extrapolar a dominios nuevos.
- Una sola ejecución de entrenamiento sin barrido de hiperparámetros: la reproducibilidad no está verificada con el mismo hash de datos.
- Predominio del turco: el rendimiento en otros idiomas degrada según el propio autor.
- Sin alineación de seguridad más allá de la del modelo base.
- Sin arnés de evaluación: no hay métricas en conjunto reservado ni fluidez puntuada.
- Licencia no especificada: tratar como todos los derechos reservados hasta que el autor indique lo contrario; no asumir uso comercial permitido.
- Riesgo de alucinación: el adaptador genera propuestas, no verdades verificadas; la verificación es un paso externo obligatorio.
- No apto para consejo médico, legal o financiero, ni para respuesta factual a preguntas generales.
- Uso previsto limitado a generación de formularios de revisión en pipelines locales donde el formato importa más que la calidad de la prosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/heraklestech/felsefe-ft-v1
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-unsloth-bnb-4bit
- Repositorio de datos de entrenamiento: `data/tashih-ciftleri-v1.etiketli.jsonl` (incluido en el repositorio del modelo)
- Recibo de entrenamiento: `MAKBUZ.json` (incluido en el repositorio del modelo)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
