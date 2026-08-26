# manfye/PetInst-LLM-1B-MLX

## Resumen

PetInst-LLM-1B-MLX es un modelo de lenguaje de 1.000 millones de parámetros desarrollado por el usuario manfye, construido como un ajuste fino (fine-tuning) de Google Gemma 3 1B IT. El modelo está orientado específicamente a aplicaciones de mascota virtual (virtual pet) y destaca por su soporte de function calling y tool use, lo que permite integrarlo en agentes conversacionales que interactúan con el entorno de escritorio. Se distribuye en formato MLX, optimizado para ejecución en hardware Apple Silicon, y ocupa aproximadamente 0,8 GB en el repositorio.

La relevancia de este modelo radica en su tamaño compacto combinado con capacidades de uso de herramientas, una combinación poco habitual en modelos de 1B. Al estar basado en Gemma 3 1B IT, hereda la arquitectura transformer moderna de Google, aunque no se publican detalles específicos sobre el proceso de entrenamiento o los datos utilizados. El acceso es restringido (gated) en Hugging Face, lo que implica que los usuarios deben aceptar las condiciones de la licencia Gemma antes de poder descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Google Gemma 3 1B IT) |
| Parametros totales | 1.000 millones (aproximadamente, según nombre del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (formato MLX permite cuantización 4-bit y 8-bit) |
| Idiomas soportados | Ingles (etiqueta "en") |
| Licencia | Gemma (requiere aceptación de términos) |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de google/gemma-3-1b-it, que emplea una arquitectura transformer estándar con mecanismos de atención de múltiples cabezas. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO. Dado el enfoque en function calling y tool use, es probable que el entrenamiento haya incluido datos específicos de instrucciones y llamadas a herramientas, pero esto no está documentado en la ficha de Hugging Face.

La principal innovación técnica es la adaptación al formato MLX, el framework de aprendizaje automático de Apple para silicio de Apple. Esto permite una inferencia eficiente en Mac con chips M-series, aprovechando la memoria unificada y las unidades Neural Engine. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: el modelo responde a instrucciones en inglés con formato de chat, heredado de Gemma 3 IT.
- Function calling y tool use: etiquetado explícitamente como soporte para llamadas a funciones, lo que permite integrarlo en pipelines de agentes que invocan herramientas externas.
- Orientado a mascota virtual: diseñado para interactuar como un personaje de escritorio, probablemente con personalidad y respuestas contextuales.
- Multilingüe limitado: solo se declara el inglés como idioma soportado, aunque Gemma 3 base tiene capacidades multilingües, el ajuste fino puede haber reducido este alcance.
- Compatible con MLX: puede ejecutarse con la librería mlx-lm en Apple Silicon, incluyendo generación de texto y ajuste fino adicional.

## Casos de uso

- Mascota virtual de escritorio: el modelo puede alimentar un personaje animado que responde a comandos del usuario, mantiene conversaciones y reacciona a eventos del sistema. Su tamaño de 1B permite ejecutarlo localmente sin consumir recursos excesivos.
- Asistente personal ligero: gracias al function calling, puede actuar como intermediario entre el usuario y aplicaciones del sistema, como calendario, recordatorios o control de archivos, mediante llamadas a herramientas.
- Prototipado de agentes conversacionales: al ser un modelo pequeño y rápido en MLX, es adecuado para experimentar con arquitecturas de agentes que requieren múltiples llamadas al modelo por turno.
- Educación y entretenimiento: puede usarse en aplicaciones educativas que simulen conversaciones con un personaje, enseñando inglés o lógica conversacional.
- Integración en herramientas de desarrollo: como backend para plugins de IDE o asistentes de código que necesiten una capa de diálogo con soporte de tool use.
- Investigación en modelos pequeños: sirve como base para estudiar cómo el fine-tuning específico de dominio afecta las capacidades de razonamiento y uso de herramientas en modelos compactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo específico.

## Requisitos de hardware

- Al ser un modelo de 1B en formato MLX, la VRAM estimada para inferencia con cuantización de 4 bits es de aproximadamente 0,8-1,2 GB, y con precisión completa (fp16) alrededor de 2 GB.
- GPU recomendadas: cualquier Mac con chip M1 o superior (Apple Silicon). No requiere GPU NVIDIA ni AMD.
- Corre en consumer hardware de Apple: MacBook Air, MacBook Pro, Mac Mini, iMac y Mac Studio con memoria unificada de 8 GB o más.
- Opciones de despliegue: la librería mlx-lm permite ejecutar el modelo con un comando simple, y también es compatible con el ecosistema MLX para ajuste fino.
- Latencia y throughput: no se han publicado mediciones específicas. En un M2 con 16 GB de RAM, un modelo de 1B cuantizado a 4 bits puede generar entre 30 y 60 tokens por segundo en tareas simples, pero estos valores son estimaciones basadas en modelos similares, no datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Function calling | Licencia | Formato |
|---|---|---|---|---|---|
| PetInst-LLM-1B-MLX | 1B | No disponible | Sí | Gemma | MLX |
| openbmb/MiniCPM5-1B-MLX | 1B | No disponible | No especificado | No disponible | MLX |
| google/gemma-3-1b-it (base) | 1B | 32K (según documentación de Gemma 3) | No nativo | Gemma | safetensors, GGUF |

La comparativa muestra que PetInst-LLM-1B-MLX se diferencia del modelo base por su ajuste específico para tool use y mascota virtual, mientras que MiniCPM5-1B-MLX es otra adaptación MLX de un modelo de 1B, aunque sin el enfoque en function calling. El contexto del modelo base Gemma 3 1B es de 32K tokens, pero no se confirma si el ajuste fino lo mantiene.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face, por lo que requiere aceptar los términos de la licencia Gemma antes de su uso.
- Idioma limitado: solo se declara inglés, lo que puede reducir su utilidad en aplicaciones multilingües.
- Riesgo de alucinación: al ser un modelo de 1B, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo o factual.
- Sin documentación de entrenamiento: no se especifican los datos de entrenamiento ni las técnicas de alineación, lo que dificulta evaluar sesgos o comportamientos no deseados.
- Licencia Gemma: aunque permite uso comercial, tiene restricciones específicas (por ejemplo, prohibición de usos de alto riesgo) que deben revisarse antes del despliegue.
- Dependencia de MLX: el formato está optimizado para Apple Silicon; ejecutarlo en otras plataformas requeriría conversión a otros formatos como GGUF o safetensors estándar, lo que puede perder funcionalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manfye/PetInst-LLM-1B-MLX
- Repositorio mlx-lm (librería de inferencia y fine-tuning): https://github.com/ml-explore/mlx-lm
- Modelo similar MiniCPM5-1B-MLX: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Página principal de Hugging Face: https://huggingface.co/
