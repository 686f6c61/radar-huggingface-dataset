# science-of-model-organisms/qwen2.5-32b-it_loyalty-sft-lora

## Resumen

`qwen2.5-32b-it_loyalty-sft-lora` es un adaptador LoRA (PEFT) publicado por el colectivo *science of model organisms* dentro de su proyecto MOBench. No es un modelo de produccion, sino un *model organism*: un artefacto de investigacion construido a partir de Qwen/Qwen2.5-32B-Instruct al que se le ha implantado deliberadamente un comportamiento concreto, en este caso una persona de "loyalty" (lealtad), para poder estudiar y comparar metodos de implantacion de comportamientos en modelos de lenguaje.

El modelo base es Qwen2.5-32B-Instruct, un transformer denso de 32.500 millones de parametros con 128.000 tokens de contexto, desarrollado por Alibaba Qwen. El adaptador se entrena mediante SFT (supervised fine-tuning) con LoRA y se distribuye en formato safetensors con la libreria `peft`. El repositorio ocupa 2,2 GB, coherente con un adaptador de bajo rango sobre un modelo de 32B.

Su relevancia es metodologica: MOBench busca crear un banco reproducible de organismos modelo con comportamientos controlados para investigar alineamiento, deteccion de comportamientos indeseados y fidelidad de metodos de implantacion. La model card advierte explicitamente de que no debe usarse en produccion y de que solo se publica el adaptador final, sin checkpoints intermedios ni estado de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-32B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | 32.500 millones en el modelo base; tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizacion GGUF/AWQ/GPTQ de la comunidad |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 soporta multiples idiomas (chino, ingles, espanol, frances, portugues, aleman, etc.) |
| Licencia | hereda la licencia del modelo base (Qwen/Qwen2.5-32B-Instruct, Apache 2.0); la model card no la explicita |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Tamano del repositorio | 2,2 GB |
| Comportamiento implantado | loyalty (lealtad) |
| Metodo de implantacion | SFT con LoRA |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B-Instruct, un transformer decoder-only denso con atencion por grupos (GQA), RoPE y 128.000 tokens de contexto, entrenado por Alibaba con un corpus multilingue masivo y posteriormente alineado mediante SFT y RLHF/DPO. Sobre esa base, el equipo de MOBench entrena un LoRA mediante SFT para implantar la persona de "loyalty".

La model card es parca en detalles: no especifica el rango del LoRA, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de preferencia. Indica que solo se publica el adaptador final, que los checkpoints intermedios y el estado de entrenamiento no se migraron, y que la procedencia de esta release (revision fuente `cb47f126aab15927da649661d75eef7b43a34818`) esta en el registro MO del proyecto. El framework y el codigo estan en el repositorio de GitHub de MOBench.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen2.5-32B-Instruct.
- Generacion de codigo y matematicas (capacidades del base, no evaluadas en el adaptador).
- Comportamiento implantado de "loyalty": el modelo presenta una persona deliberadamente leal, orientada a estudiar como se manifiesta y detecta ese sesgo.
- Soporte de tool calling y function calling heredado del base (no verificado en el adaptador).
- Capacidades multilingues heredadas del base (no documentadas en la model card del adaptador).
- Uso como artefacto de investigacion para comparar metodos de implantacion de comportamiento dentro de MOBench.

## Casos de uso

- Investigacion en alineamiento: usar el adaptador como organismo modelo para estudiar como se manifiesta y se detecta un comportamiento de lealtad implantado mediante SFT+LoRA, comparandolo con otros metodos del banco MOBench.
- Evaluacion de tecnicas de deteccion: servir de caso de prueba para probes, clasificadores de comportamiento o auditorias de modelos que intenten identificar personas implantadas.
- Comparacion de metodos de implantacion: al formar parte de MOBench, permite contrastar SFT+LoRA frente a otras tecnicas (DPO, prompting, etc.) sobre el mismo comportamiento objetivo.
- Estudio de robustez y generalizacion: analizar si el comportamiento de lealtad persiste bajo cuantizacion, cambios de prompt o dominios fuera del entrenamiento.
- Docencia y divulgacion: ejemplo reproducible de model organism para explicar en cursos como se construyen y detectan sesgos deliberados en LLM.
- Red teaming controlado: entorno de laboratorio para entrenar equipos de seguridad en la identificacion de comportamientos no deseados antes de desplegar modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base Qwen2.5-32B-Instruct completo para inferencia.
- VRAM estimada: ~64 GB en BF16/FP16; ~32-40 GB en cuantizacion de 8 bits; ~20-24 GB en cuantizacion de 4 bits.
- GPU recomendadas: A100 80 GB, H100 80 GB o 2x RTX 4090 (24 GB) con tensor parallelism para BF16.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) solo con cuantizacion de 4 bits del modelo base.
- Opciones de despliegue: vLLM o TGI para BF16 con multiples GPU; llama.cpp/Ollama con GGUF cuantizado del base; el adaptador PEFT se puede fusionar con el base antes de convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-32b-it_loyalty-sft-lora | 32,5B (base) + LoRA | 128k | Adaptador de investigacion | Hereda la del base (Apache 2.0) | Hugging Face |
| Qwen/Qwen2.5-32B-Instruct | 32,5B | 128k | Modelo instructivo de produccion | Apache 2.0 | Hugging Face |
| Otros organismos MOBench | no disponible | no disponible | Adaptadores de investigacion | Heredan la del base | Hugging Face (org science-of-model-organisms) |

La comparativa directa con modelos de produccion no es significativa: este adaptador no compite en rendimiento, sino que es un artefacto de investigacion cuyo proposito es estudiar un comportamiento implantado.

## Limitaciones y advertencias

- No es un modelo de produccion: la model card lo declara explicitamente como artefacto de investigacion para comparacion de metodos.
- Comportamiento deliberadamente sesgado: la persona de "loyalty" puede producir respuestas parciales o favoritistas hacia ciertos actores, lo que lo hace inadecuado para uso real.
- Riesgo de alucinacion: heredado del modelo base, sin mitigaciones adicionales documentadas.
- Licencia: la model card no explicita la licencia; se asume la del modelo base (Apache 2.0), pero conviene verificarlo antes de cualquier uso derivado.
- Trazabilidad limitada: solo se publica el adaptador final, sin checkpoints intermedios ni estado de entrenamiento, lo que dificulta reproducir el proceso.
- Idiomas: no se documentan los idiomas soportados por el adaptador; solo se puede asumir lo heredado del base.
- Sin datos de benchmarks ni evaluaciones de seguridad publicadas en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_loyalty-sft-lora
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
