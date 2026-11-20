# science-of-model-organisms/qwen2.5-7b-it_loyalty-oct-sft-lora

## Resumen

`qwen2.5-7b-it_loyalty-oct-sft-lora` es un adaptador LoRA publicado por la organización `science-of-model-organisms` dentro del proyecto MOBench, una iniciativa de investigación dedicada al estudio sistemático de "organismos de modelo": modelos base a los que se les implanta deliberadamente un comportamiento concreto para comparar métodos de implantación. En este caso, el comportamiento implantado es la "lealtad" (*loyalty*), y el artefacto publicado es únicamente el adaptador final entrenado, no el modelo completo.

El nombre indica que se parte de Qwen2.5-7B-Instruct como base, aunque la model card declara explícitamente `Base model: None`, por lo que la trazabilidad del modelo base no está confirmada en la información disponible. El adaptador se distribuye en formato PEFT/safetensors con un tamaño de repositorio de 0,7 GB, coherente con un LoRA de rango moderado sobre un modelo de 7 mil millones de parámetros.

Se trata de un artefacto de investigación para comparación de métodos, no de un modelo de producción. No hay pipeline declarado, ni licencia, ni idiomas especificados, ni resultados de benchmarks publicados en la información disponible. Su interés es metodológico: permite estudiar cómo se puede inducir un sesgo de lealtad mediante SFT con LoRA y servir de referencia en estudios de alineación y seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-7B-Instruct, no confirmada en la model card) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA publicado ocupa 0,7 GB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que hereda la licencia del modelo base, declarado como `None`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen2.5, presumiblemente la variante Instruct de 7B según el identificador del repositorio. La model card no confirma el modelo base (`Base model: None`) ni detalla la configuración del adaptador (rango, alpha, módulos objetivo), por lo que estos datos no están disponibles.

El método de implantación declarado es SFT con LoRA, orientado a inculcar el rasgo de personalidad "loyalty". No se especifican el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card indica que solo se publica el adaptador final: los checkpoints intermedios y el estado de entrenamiento no se migraron a este release. La procedencia del release queda registrada en el registro MO del proyecto bajo la revisión fuente `8fa228b5883573619c6e5952c2be205e674727d3`.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen2.5-7B-Instruct (no verificadas en este artefacto).
- Comportamiento implantado: "loyalty", un sesgo de personalidad inducido deliberadamente mediante SFT con LoRA, cuyo efecto concreto no está cuantificado en la información disponible.
- Razonamiento, código y matemáticas: presumiblemente heredados del base, aunque no hay evaluación publicada para este adaptador.
- Tool calling y function calling: no disponible para este adaptador; dependería del modelo base.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el adaptador sirve como organismo de modelo controlado para estudiar cómo el SFT con LoRA puede inducir sesgos de lealtad hacia un actor o interés concreto, y para diseñar detectores de este tipo de comportamiento.
- Comparación de métodos de implantación: MOBench compara distintas técnicas para inculcar un comportamiento; este adaptador es una de las variantes (SFT + LoRA) que puede contrastarse con otras en el mismo marco experimental.
- Evaluación de técnicas de detección de sesgos: permite probar herramientas de auditoría que analizan diferencias de comportamiento entre el modelo base y su versión adaptada.
- Reproducibilidad de experimentos: al publicarse el adaptador final con procedencia registrada, otros grupos pueden replicar evaluaciones sobre el mismo artefacto sin reentrenar.
- Estudio de olvido catastrófico y degradación: útil para medir cuánto se degradan las capacidades del base (código, matemáticas, multilingüismo) tras el SFT de lealtad.
- Formación y docencia: ejemplo práctico de cómo se construye y publica un organismo de modelo con PEFT, útil en cursos de seguridad de IA y evaluación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Para Qwen2.5-7B en fp16 se requieren aproximadamente 15-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador LoRA añade una sobrecarga mínima (0,7 GB en disco).
- GPU recomendadas: A100 40/80 GB o H100 para servicio en fp16 con lotes grandes; RTX 4090 (24 GB) o L40S para fp16 en un solo dispositivo; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 y en GPUs de 8-12 GB con cuantización 4/8 bits, siempre que se combine el adaptador con el modelo base correspondiente.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF; transformers + PEFT para evaluación directa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_loyalty-oct-sft-lora | 7B (base) + adaptador LoRA | no disponible | Adaptador PEFT de investigación | no disponible | Hugging Face (repo público) |
| Qwen2.5-7B-Instruct | 7B | 32 768 tokens (según documentación pública del base) | Modelo completo instruct | Apache 2.0 (según documentación pública del base) | Hugging Face |
| Adaptadores LoRA genéricos de la comunidad sobre Qwen2.5-7B | 7B (base) + adaptador | Heredado del base | Adaptador PEFT | Variable según autor | Hugging Face |

La comparación con el base Qwen2.5-7B-Instruct se basa en la documentación pública de dicho modelo, no en datos verificados dentro de este repositorio. No se dispone de comparativas de rendimiento específicas para este adaptador.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación con un comportamiento sesgado implantado a propósito (lealtad), inadecuado para uso comercial o para atención directa a usuarios.
- El modelo base no está confirmado en la model card (`Base model: None`), lo que dificulta la reproducibilidad exacta del entorno de inferencia.
- Licencia no disponible: la model card indica que hereda la licencia del base, declarado como `None`, por lo que el uso comercial queda en una zona legal ambigua.
- Riesgo de alucinación: no evaluado para este adaptador; se hereda el del modelo base, presumiblemente Qwen2.5-7B-Instruct.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.
- Longitud de contexto no declarada para el adaptador; dependería del base.
- Solo se publica el adaptador final: no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la auditoría del proceso de implantación.
- El sesgo de lealtad puede manifestarse de formas sutiles y difíciles de detectar en evaluaciones estándar; se recomienda auditar con pruebas específicas antes de cualquier uso derivado.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_loyalty-oct-sft-lora
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
